import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ExternalLink, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { POINTS, derivePledge, PLEDGE_DEFAULTS } from "@/features/pre-rnf-worksheets/pledgeCalc";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

type Props = {
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
};

function TextInput({
  id,
  values,
  onChange,
  readOnly,
  placeholder,
  prefix,
  className,
  fallback,
}: Props & { id: string; placeholder?: string; prefix?: string; className?: string; fallback?: string }) {
  const v = values[id] ?? fallback ?? "";
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-2.5 text-xs text-muted-foreground">{prefix}</span>
      )}
      <Input
        type="number"
        value={v}
        readOnly={readOnly}
        onChange={(e) => onChange?.(id, e.target.value)}
        placeholder={placeholder}
        className={cn("h-9 text-center", prefix && "pl-7", readOnly && "bg-muted/40", className)}
      />
    </div>
  );
}

function Area({
  id,
  label,
  values,
  onChange,
  readOnly,
  placeholder,
}: Props & { id: string; label: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      <Textarea
        value={values[id] ?? ""}
        readOnly={readOnly}
        onChange={(e) => onChange?.(id, e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[80px] text-sm", readOnly && "bg-muted/40")}
      />
    </div>
  );
}

function GoalColumn({
  variant,
  values,
  onChange,
  readOnly,
}: Props & { variant: "min" | "stretch" }) {
  const p = variant; // key prefix
  const fyc = Number(values[`${p}_fyc`] ?? "");
  const acs = Number(values[`${p}_case_size`] ?? "");
  const cases = fyc > 0 && acs > 0 ? Math.round(fyc / acs) : null;
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border p-4",
        variant === "stretch" ? "border-primary/30 bg-primary/5" : "bg-muted/20",
      )}
    >
      <h4 className={cn("text-sm font-semibold", variant === "stretch" ? "text-primary" : "text-foreground")}>
        {variant === "stretch" ? "Stretched Goals" : "Minimum Goals"}
      </h4>
      <div className="space-y-1">
        <Label className="text-xs font-medium">Life FYC</Label>
        <TextInput id={`${p}_fyc`} values={values} onChange={onChange} readOnly={readOnly} prefix="S$" placeholder={variant === "stretch" ? "e.g. 100000" : "e.g. 60000"} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium">Avg Case Size</Label>
        <TextInput id={`${p}_case_size`} values={values} onChange={onChange} readOnly={readOnly} prefix="S$" placeholder="e.g. 3000" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium">Life Cases (auto)</Label>
        <div className="flex h-9 items-center justify-center rounded-md border bg-muted text-sm font-bold">
          {cases ?? "—"}
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium">Recognition Goals (Clubs / MDRT)</Label>
        <Textarea
          value={values[`${p}_clubs`] ?? ""}
          readOnly={readOnly}
          onChange={(e) => onChange?.(`${p}_clubs`, e.target.value)}
          placeholder={variant === "stretch" ? "e.g. TOT, COT..." : "e.g. COT, MDRT..."}
          className={cn("min-h-[60px] text-sm", readOnly && "bg-muted/40")}
        />
      </div>
    </div>
  );
}

function FunnelRow({
  lead,
  rateId,
  ratePlaceholder,
  hint,
  result,
  resultLabel,
  hasGoal,
  values,
  onChange,
  readOnly,
}: Props & {
  lead: string;
  rateId?: string;
  ratePlaceholder?: string;
  hint?: string;
  result: number;
  resultLabel: string;
  hasGoal: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
        <span>{lead}</span>
        {rateId && (
          <Input
            type="number"
            value={values[rateId] ?? ""}
            readOnly={readOnly}
            onChange={(e) => onChange?.(rateId, e.target.value)}
            placeholder={ratePlaceholder}
            className="h-8 w-16 text-center text-sm"
          />
        )}
        {hint && <span className="w-full text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="min-w-[80px] flex-shrink-0 text-center">
        <div className="text-3xl font-bold text-foreground">{hasGoal ? result : "–"}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{resultLabel}</div>
      </div>
    </div>
  );
}

export default function PledgeSheetCalculator({ values, onChange, readOnly = false }: Props) {
  const d = derivePledge(values);
  const minFyc = Number(values.min_fyc ?? "");
  const stretchFyc = Number(values.stretch_fyc ?? "");

  const setMonths = (m: string) => onChange?.("months", m);

  return (
    <Tabs defaultValue="goals" className="w-full">
      <TabsList className="flex h-auto w-full gap-1 overflow-x-auto p-1">
        <TabsTrigger value="goals" className="flex-1 whitespace-nowrap text-xs sm:text-sm">
          🎯 Goals &amp; Targets
        </TabsTrigger>
        <TabsTrigger value="activities" className="flex-1 whitespace-nowrap text-xs sm:text-sm">
          📊 Activities
        </TabsTrigger>
        <TabsTrigger value="strategy" className="flex-1 whitespace-nowrap text-xs sm:text-sm">
          🧠 Strategy
        </TabsTrigger>
      </TabsList>

      {/* ── Goals & Targets ── */}
      <TabsContent value="goals" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Production Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Set both a <strong>Minimum</strong> (baseline) and a <strong>Stretched</strong> (aspirational) goal.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <GoalColumn variant="min" values={values} onChange={onChange} readOnly={readOnly} />
              <GoalColumn variant="stretch" values={values} onChange={onChange} readOnly={readOnly} />
            </div>
            <div className="space-y-1.5 border-t pt-4">
              <p className="text-sm font-semibold text-foreground">
                Work these numbers out — the FYC you need, your case mix, and how your income builds over time:
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://present.financeillustrator.com/commission-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Commission Calculator
                </a>
                <a
                  href="https://present.financeillustrator.com/income-calculator/income-layers/detailed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Income Calculator
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business &amp; Personal Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {(["business", "personal"] as const).map((kind) => (
                <div key={kind} className="space-y-2">
                  <Label className="text-sm font-semibold capitalize">Top 3 {kind} goals</Label>
                  {[1, 2, 3].map((i) => (
                    <Input
                      key={i}
                      value={values[`${kind}_goal_${i}`] ?? ""}
                      readOnly={readOnly}
                      onChange={(e) => onChange?.(`${kind}_goal_${i}`, e.target.value)}
                      placeholder={`${kind === "business" ? "Business" : "Personal"} goal ${i}`}
                      className={cn("h-9 text-sm", readOnly && "bg-muted/40")}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Activities ── */}
      <TabsContent value="activities" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              Set Your FYC Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">FYC Goal</Label>
                <TextInput id="fyc_goal" values={values} onChange={onChange} readOnly={readOnly} prefix="S$" placeholder="e.g. 60000" className="text-left" />
                {(minFyc > 0 || stretchFyc > 0) && !readOnly && (
                  <div className="mt-1 flex gap-1">
                    {minFyc > 0 && (
                      <button type="button" onClick={() => onChange?.("fyc_goal", String(minFyc))} className="rounded border px-2 py-0.5 text-xs hover:bg-muted">
                        Min S${minFyc.toLocaleString()}
                      </button>
                    )}
                    {stretchFyc > 0 && (
                      <button type="button" onClick={() => onChange?.("fyc_goal", String(stretchFyc))} className="rounded border border-primary/30 px-2 py-0.5 text-xs text-primary hover:bg-primary/5">
                        Stretch S${stretchFyc.toLocaleString()}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Avg Case Size (FYC)</Label>
                <TextInput id="avg_case_size" values={values} onChange={onChange} readOnly={readOnly} prefix="S$" placeholder="e.g. 3000" className="text-left" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Planning Period</Label>
                <select
                  value={String(d.months)}
                  disabled={readOnly}
                  onChange={(e) => setMonths(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {m} months
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              My Target Activities Based on Annual Goal of S${d.fycGoal ? d.fycGoal.toLocaleString() : "…"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <FunnelRow lead="Based on my Avg Case Size, I must close" result={d.annual.cases} resultLabel="Life Cases" hasGoal={d.hasGoal} values={values} onChange={onChange} readOnly={readOnly} />
            <FunnelRow lead="Based on ONE Sale from" rateId="closing_rate" ratePlaceholder={String(PLEDGE_DEFAULTS.closing_rate)} hint="Closing Interviews (New FC: 3, Club FC: 2)" result={d.annual.closings} resultLabel="Closing Appts" hasGoal={d.hasGoal} values={values} onChange={onChange} readOnly={readOnly} />
            <FunnelRow lead="Based on ONE Closing from" rateId="opening_to_closing_rate" ratePlaceholder={String(PLEDGE_DEFAULTS.opening_to_closing_rate)} hint="Opening Interviews (New FC: 2.5, Club FC: 2)" result={d.annual.openings} resultLabel="Opening Appts" hasGoal={d.hasGoal} values={values} onChange={onChange} readOnly={readOnly} />
            <FunnelRow lead="Based on ONE Opening from" rateId="set_to_opening_rate" ratePlaceholder={String(PLEDGE_DEFAULTS.set_to_opening_rate)} hint="Set Appointments (Cold Leads: 5, New FC: 3, Club FC: 1.5)" result={d.annual.sets} resultLabel="Appt Sets" hasGoal={d.hasGoal} values={values} onChange={onChange} readOnly={readOnly} />
            <div className="px-4 py-3 sm:px-6">
              <p className="text-xs italic text-muted-foreground">Edit the numbers inline to match your own conversion rates.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <Calendar className="h-4 w-4 flex-shrink-0" />
              Pledge Targets — over {d.months} months
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="w-44 border border-border px-3 py-2 text-left text-xs font-semibold">I MUST achieve…</th>
                    <th className="border border-border px-3 py-2 text-center text-xs font-semibold">Sets<br /><span className="font-normal text-muted-foreground">({POINTS.set}pt)</span></th>
                    <th className="border border-border px-3 py-2 text-center text-xs font-semibold">Openings<br /><span className="font-normal text-muted-foreground">({POINTS.opening}pts)</span></th>
                    <th className="border border-border px-3 py-2 text-center text-xs font-semibold">Closings<br /><span className="font-normal text-muted-foreground">({POINTS.closing}pts)</span></th>
                    <th className="border border-border px-3 py-2 text-center text-xs font-semibold">Cases<br /><span className="font-normal text-muted-foreground">({POINTS.closed}pts)</span></th>
                    <th className="border border-border bg-primary/5 px-3 py-2 text-center text-xs font-semibold text-primary">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { label: "Monthly Targets", t: d.monthly, pts: d.monthlyPoints },
                    { label: "Weekly Targets", t: d.weekly, pts: d.weeklyPoints },
                  ] as const).map((row) => (
                    <tr key={row.label} className="hover:bg-muted/30">
                      <td className="border border-border bg-muted/40 px-3 py-2 text-xs font-semibold">{row.label}</td>
                      {[row.t.sets, row.t.openings, row.t.closings, row.t.cases].map((v, i) => (
                        <td key={i} className="border border-border px-2 py-3 text-center">
                          <span className={cn("text-base font-bold", d.hasGoal ? "text-foreground" : "text-muted-foreground")}>
                            {d.hasGoal ? v : "–"}
                          </span>
                        </td>
                      ))}
                      <td className="border border-border bg-primary/5 px-2 py-3 text-center">
                        <span className="text-base font-bold text-primary">{d.hasGoal ? row.pts : "–"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {d.hasGoal && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-start gap-3">
                <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  To hit <strong>S${d.fycGoal.toLocaleString()} FYC</strong> in <strong>{d.months} months</strong>, you need{" "}
                  <strong>{d.annual.cases} cases</strong> — that's{" "}
                  <strong>{d.annual.sets} sets → {d.annual.openings} openings → {d.annual.closings} closings → {d.annual.cases} cases</strong>{" "}
                  a year, or roughly <strong>{d.weekly.sets} sets / {d.weekly.openings} openings / {d.weekly.closings} closings per week</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Strategy ── */}
      <TabsContent value="strategy" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" /> Sales Strategy &amp; Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Area id="products_focus" label="Target market / products focus" values={values} onChange={onChange} readOnly={readOnly} placeholder="e.g. Young professionals, term life, CI riders…" />
              <Area id="methods" label="Methods (how you prospect)" values={values} onChange={onChange} readOnly={readOnly} placeholder="e.g. Referrals, warm calls, events…" />
              <Area id="angles_working" label="Sales angles that work" values={values} onChange={onChange} readOnly={readOnly} placeholder="What's working well for you?" />
              <Area id="angles_to_try" label="Sales angles to try" values={values} onChange={onChange} readOnly={readOnly} placeholder="New approaches to experiment with?" />
              <Area id="touchpoints" label="Key touchpoints & events" values={values} onChange={onChange} readOnly={readOnly} placeholder="Networking events, follow-up cadence…" />
              <Area id="focus_strategies" label="Focus strategies for this year" values={values} onChange={onChange} readOnly={readOnly} placeholder="Your top 2-3 strategic priorities…" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Why &amp; Mindset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Area id="motivation_why" label="My motivation — why I'm doing this" values={values} onChange={onChange} readOnly={readOnly} placeholder="What drives you?" />
              <Area id="life_better" label="How life gets better if I achieve this" values={values} onChange={onChange} readOnly={readOnly} placeholder="Paint the picture of success…" />
              <Area id="consequence" label="Consequence if I don't achieve this" values={values} onChange={onChange} readOnly={readOnly} placeholder="What's the cost of not acting?" />
              <Area id="new_skills" label="New skills I need to develop" values={values} onChange={onChange} readOnly={readOnly} placeholder="e.g. Better closing, planning knowledge…" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
