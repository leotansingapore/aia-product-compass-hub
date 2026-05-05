import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  ULTIMATE_CRITICAL_COVER_CONDITIONS,
  EARLY_STAGE_COUNT,
  INTERMEDIATE_STAGE_COUNT,
  MAJOR_STAGE_COUNT,
  type CriticalIllnessCondition,
  type CriticalIllnessStage,
} from "@/data/ultimateCriticalCoverConditions";

type StageFilter = "all" | "early" | "intermediate" | "major";

function StageBlock({
  label,
  stage,
  toneClass,
}: {
  label: string;
  stage: CriticalIllnessStage;
  toneClass: string;
}) {
  if (!stage.covered) {
    return (
      <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {label}
          </Badge>
          <span className="text-xs text-muted-foreground">Not covered for this condition</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <Badge className="text-[10px] uppercase tracking-wide">{label}</Badge>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {stage.definition}
      </p>
    </div>
  );
}

function ConditionItem({ condition }: { condition: CriticalIllnessCondition }) {
  const stages: Array<"early" | "intermediate" | "major"> = ["early", "intermediate", "major"];
  const stageCovered = stages.filter((s) => {
    if (s === "early") return condition.earlyStage.covered;
    if (s === "intermediate") return condition.intermediateStage.covered;
    return condition.majorStage.covered;
  });

  return (
    <AccordionItem value={`c-${condition.number}`} className="border-b border-border/60">
      <AccordionTrigger className="px-2 py-3 text-left hover:no-underline">
        <div className="flex w-full items-start justify-between gap-3 pr-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                #{condition.number}
              </span>
              <span className="text-sm font-medium leading-snug text-foreground sm:text-base">
                {condition.name}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {stageCovered.includes("early") && (
                <Badge variant="secondary" className="text-[10px]">Early</Badge>
              )}
              {stageCovered.includes("intermediate") && (
                <Badge variant="secondary" className="text-[10px]">Intermediate</Badge>
              )}
              {stageCovered.includes("major") && (
                <Badge variant="secondary" className="text-[10px]">Major</Badge>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2">
        <div className="space-y-3 pt-1">
          <StageBlock
            label="Early Stage"
            stage={condition.earlyStage}
            toneClass="border-emerald-500/20 bg-emerald-500/5"
          />
          <StageBlock
            label="Intermediate Stage"
            stage={condition.intermediateStage}
            toneClass="border-amber-500/20 bg-amber-500/5"
          />
          <StageBlock
            label="Major Stage"
            stage={condition.majorStage}
            toneClass="border-rose-500/20 bg-rose-500/5"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function CriticalIllnessConditions() {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ULTIMATE_CRITICAL_COVER_CONDITIONS.filter((c) => {
      if (stageFilter === "early" && !c.earlyStage.covered) return false;
      if (stageFilter === "intermediate" && !c.intermediateStage.covered) return false;
      if (stageFilter === "major" && !c.majorStage.covered) return false;
      if (!q) return true;
      const haystack = [
        c.name,
        c.earlyStage.definition,
        c.intermediateStage.definition,
        c.majorStage.definition,
      ]
        .join(" \n ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, stageFilter]);

  return (
    <PageLayout
      title="Critical Illness Conditions | FINternship"
      description="All 73 critical illnesses covered under AIA Ultimate Critical Cover (UCC), with full Early / Intermediate / Major Stage definitions from the Product Summary."
    >
      <BrandedPageHeader
        title="Critical Illness Conditions"
        titlePrefix="🛡️ "
        subtitle="The 73 critical illnesses covered by AIA Ultimate Critical Cover (UCC), with the full clinical definition for each severity stage."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Critical Illness Conditions" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-3 py-4 pb-20 sm:px-4 sm:py-8 sm:pb-8 md:px-6">
        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Conditions covered
              </p>
              <p className="text-2xl font-bold text-foreground">{ULTIMATE_CRITICAL_COVER_CONDITIONS.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Early Stage
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {EARLY_STAGE_COUNT}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Intermediate Stage
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {INTERMEDIATE_STAGE_COUNT}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Major Stage
              </p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {MAJOR_STAGE_COUNT}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search + filter row */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conditions or definitions (e.g. cancer, stroke, parkinson)…"
              className="pl-9"
            />
          </div>
          <ToggleGroup
            type="single"
            value={stageFilter}
            onValueChange={(v) => setStageFilter((v || "all") as StageFilter)}
            className="justify-start sm:justify-end"
          >
            <ToggleGroupItem value="all" className="text-xs">All</ToggleGroupItem>
            <ToggleGroupItem value="early" className="text-xs">Early</ToggleGroupItem>
            <ToggleGroupItem value="intermediate" className="text-xs">Intermediate</ToggleGroupItem>
            <ToggleGroupItem value="major" className="text-xs">Major</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Result count */}
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {ULTIMATE_CRITICAL_COVER_CONDITIONS.length} conditions
        </p>

        {/* Source disclaimer */}
        <div className="mt-2 flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            Source: AIA Ultimate Critical Cover Product Summary v1.0 (012024), Appendix 1 –
            Definition of Critical Illnesses. Always refer to the actual policy contract for
            binding terms and exclusions.
          </p>
        </div>

        {/* Accordion list */}
        <div className="mt-5 rounded-lg border bg-card">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No conditions match your search.
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filtered.map((c) => (
                <ConditionItem key={c.number} condition={c} />
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
