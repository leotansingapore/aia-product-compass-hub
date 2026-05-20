import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_FLOWS,
  type AppointmentFlow,
  type FlowBranch,
} from "@/data/appointmentFlows";

// Mermaid + DOMPurify add ~150KB. Lazy-load only when a user opens the visual tab.
const FlowDiagram = lazy(() =>
  import("@/components/flows/FlowDiagram").then((m) => ({ default: m.FlowDiagram })),
);

function BranchCard({ branch }: { branch: FlowBranch }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Branch · {branch.id.split("-")[0]}
          </div>
          <h4 className="font-semibold text-sm leading-snug">{branch.label}</h4>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        <span className="font-medium text-foreground/80">When:</span>{" "}
        {branch.condition}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {branch.productStack.map((p) => (
          <Badge
            key={p}
            variant="outline"
            className="text-[10px] px-1.5 py-0 font-mono"
          >
            {p}
          </Badge>
        ))}
      </div>

      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-3 py-2 mb-3">
        <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
          Receipt pattern
        </div>
        <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
          {branch.receiptPattern}
        </div>
      </div>

      {branch.body && (
        <div className="text-xs text-muted-foreground whitespace-pre-line border-t pt-3 mb-3">
          {branch.body}
        </div>
      )}

      {branch.exampleCaseIds.length > 0 ? (
        <div className="border-t pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Example cases ({branch.exampleCaseIds.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {branch.exampleCaseIds.map((cid) => (
              <Link
                key={cid}
                to={`/case-vault/${cid}`}
                className="text-[11px] px-2 py-0.5 rounded-md border bg-muted/40 hover:bg-muted hover:border-primary/40 transition-colors font-mono"
              >
                {cid}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t pt-3 text-[11px] text-muted-foreground italic">
          Example cases pending — tag from /case-vault.
        </div>
      )}
    </div>
  );
}

function FlowCard({ flow, defaultOpen }: { flow: AppointmentFlow; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 font-mono shrink-0">
          Flow {flow.number}
        </Badge>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm md:text-base leading-tight truncate">
            {flow.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {flow.audienceSignal}
          </p>
        </div>
        <div className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
          {flow.realCaseCount} real cases
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t bg-muted/10 p-4 md:p-5">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
              <TabsTrigger value="visual" className="text-xs">Visual map</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-0">
              {/* Anchor frame */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-4 py-3">
                <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                  Anchor frame
                </div>
                <p className="text-sm italic text-amber-900 dark:text-amber-200">
                  "{flow.anchorFrame}"
                </p>
              </div>

              {/* Discovery */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Discovery questions
                </div>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {flow.discoveryQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Branches */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Decision branches ({flow.branches.length})
                </div>
                <div className={cn("grid gap-3", "grid-cols-1 md:grid-cols-2")}>
                  {flow.branches.map((b) => (
                    <BranchCard key={b.id} branch={b} />
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Add-ons across branches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {flow.addOns.map((a, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="mt-0">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/20 py-12 text-xs text-muted-foreground">
                    Loading diagram…
                  </div>
                }
              >
                <FlowDiagram flow={flow} />
              </Suspense>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Click any green branch node to see its detail. Click the diagram to enlarge with pinch / scroll zoom.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </section>
  );
}

export default function FlowsPage() {
  return (
    <PageLayout
      title="Appointment Flows — FINternship"
      description="5 canonical appointment tracks synthesised from 258 real Fireflies appointments. Pick a track at the opening, then run the branches."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Appointment Flows"
        subtitle="5 canonical tracks for closing cases. Pick a track at the opening based on the entry decision, then run the branches."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Flows" }]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-6xl overflow-x-hidden">
        {/* Entry decision card */}
        <section className="rounded-2xl border bg-card shadow-sm p-4 md:p-5 mb-5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Track entry decision · first 3 minutes
          </div>
          <ol className="text-sm space-y-1 list-decimal pl-5 mb-3">
            <li>How old are you, and any dependants?</li>
            <li>Do you have any existing policies — or is this your first proper review?</li>
            <li>What's prompting the meeting today? (Coverage gap / Investment / Retirement / Review)</li>
          </ol>
          <div className="rounded-lg bg-muted/40 border px-3 py-2 text-xs font-mono leading-relaxed whitespace-pre">
{`Young (20s–early 30s)  + no existing  + coverage-prompted    → Flow 1
Young                  + no existing  + investment-prompted  → Flow 2
Existing policies (any age)                                  → Flow 3
45+                    + retirement-prompted                  → Flow 4
Specific event trigger (CI / newborn / admission)            → Flow 5`}
          </div>
        </section>

        <div className="space-y-3">
          {APPOINTMENT_FLOWS.map((flow, i) => (
            <FlowCard key={flow.id} flow={flow} defaultOpen={i === 0} />
          ))}
        </div>

        <div className="mt-6 text-xs text-muted-foreground text-center">
          Cross-link cases to a branch by adding their id to{" "}
          <code className="font-mono">exampleCaseIds</code> in{" "}
          <code className="font-mono">src/data/appointmentFlows.ts</code>.
        </div>
      </div>
    </PageLayout>
  );
}
