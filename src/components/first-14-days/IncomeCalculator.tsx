import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_INCOME_INPUTS, projectIncome, type IncomeInputs } from "@/features/first-14-days/incomeProjection";

const money = (n: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 }).format(n);

const SERIES = [
  { key: "active", label: "New sales that year", color: "var(--inc-active)" },
  { key: "passive", label: "Passive (from past clients)", color: "var(--inc-passive)" },
] as const;

type SliderField = { key: keyof IncomeInputs; label: string; min: number; max: number; step: number; show: (v: number) => string };

const SLIDERS: SliderField[] = [
  { key: "averageFyc", label: "First-year commission (FYC) a year", min: 5000, max: 200000, step: 1000, show: money },
  { key: "annualPremium", label: "Annual premium per policy", min: 1000, max: 10000, step: 100, show: money },
  { key: "monthlyEps", label: "EPS a month, years 1 and 2", min: 0, max: 6000, step: 100, show: money },
  { key: "annualPaPremium", label: "PA premium sold a year", min: 0, max: 50000, step: 500, show: money },
  { key: "annualGrowthRate", label: "Sales growth a year", min: 0, max: 30, step: 1, show: (v) => `${v}%` },
  { key: "years", label: "Years to show", min: 5, max: 40, step: 1, show: (v) => `${v} years` },
];

// The /income-calculator from growing-age-calculator, cut down for a Day 6
// reader: the same engine, with new sales and passive income as the two layers.
export default function IncomeCalculator() {
  const [inputs, setInputs] = useState<IncomeInputs>(DEFAULT_INCOME_INPUTS);
  const rows = useMemo(() => projectIncome(inputs), [inputs]);
  const last = rows[rows.length - 1];
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const policies = Math.round(inputs.averageFyc / (inputs.annualPremium * 0.35));

  return (
    <section
      aria-label="Income calculator"
      className="f14-income not-prose my-8 rounded-2xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
    >
      <h3 className="text-lg font-semibold">Try it with your own numbers</h3>

      <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {SLIDERS.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={`inc-${f.key}`} className="flex justify-between gap-2 text-sm">
              <span>{f.label}</span>
              <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums">{f.show(inputs[f.key])}</span>
            </Label>
            <Slider
              id={`inc-${f.key}`}
              value={[inputs[f.key]]}
              min={f.min}
              max={f.max}
              step={f.step}
              onValueChange={([v]) => setInputs((prev) => ({ ...prev, [f.key]: v }))}
              className="py-2"
            />
            {f.key === "annualPremium" && (
              <p className="text-xs text-muted-foreground">About {policies} policies a year</p>
            )}
          </div>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          [`Total over ${inputs.years} years`, money(total)],
          [`Year ${last.year} income`, money(last.total)],
          [`Passive in year ${last.year}`, `${money(last.passive)} (${Math.round((last.passive / last.total) * 100)}%)`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="mt-2 h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickFormatter={(y) => `Y${y}`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }}
              labelFormatter={(y) => `Year ${y}`}
              formatter={(v: number, name: string) => [money(v), SERIES.find((s) => s.key === name)?.label ?? name]}
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: 600 }}
            />
            {SERIES.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="income"
                fill={s.color}
                // A 2px card-coloured edge keeps the two layers apart.
                stroke="hsl(var(--card))"
                strokeWidth={2}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium">Year by year</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-right text-xs tabular-nums sm:text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1 text-left font-medium">Year</th>
                <th className="py-1 font-medium">New sales</th>
                <th className="py-1 font-medium">Passive</th>
                <th className="py-1 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-t">
                  <td className="py-1 text-left">{r.year}</td>
                  <td className="py-1">{money(r.active)}</td>
                  <td className="py-1">{money(r.passive)}</td>
                  <td className="py-1 font-semibold">{money(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium">How it's worked out</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>New sales: your FYC, plus SPI bonus (8% to 36% by FYC tier), plus 5% AI bonus, plus EPS in years 1 and 2.</li>
          <li>Renewals: 15%, 8%, 5%, 5% and 1.5% of premium from policies sold 1 to 5 years back.</li>
          <li>Career Benefit: 80% of renewals in years 3 to 5, 90% in 6 to 8, 95% in 9 and 10, 100% after.</li>
          <li>APF: 2% of premium on every policy older than 6 years.</li>
          <li>PA commission: 30% of PA premium, and each year's book stacks on the last.</li>
        </ul>
      </details>
    </section>
  );
}
