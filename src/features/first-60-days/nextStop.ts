import type { DaySummary } from "./summaries";

export type NextStop = { kind: "day"; dayNumber: number } | { kind: "recap"; week: number };

/** Where a day's "Up next" leads: the week's recap when the day ends a week that has one, else the next day. */
export function nextStop(summaries: DaySummary[], dayNumber: number, weeksWithRecap: ReadonlySet<number>): NextStop | null {
  const idx = summaries.findIndex((d) => d.dayNumber === dayNumber);
  if (idx < 0) return null;
  const day = summaries[idx];
  const next = summaries[idx + 1];
  const endsWeek = !next || next.week !== day.week;
  if (endsWeek && weeksWithRecap.has(day.week)) return { kind: "recap", week: day.week };
  return next ? { kind: "day", dayNumber: next.dayNumber } : null;
}
