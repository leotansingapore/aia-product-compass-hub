// Time shaping for the Product panel, kept pure so the rules are tested
// without rendering anything. Ported from the GAC and CMFAS panels (monthly
// passes, Oct-Nov 2026), which met every one of these on sparse data first.

import type { DailyActiveRow } from './useProductAnalytics'

const DAY = 86_400_000

/**
 * The first day this panel recorded anything (the first deploy). A day before
 * it is not a quiet day, it is an unrecorded one, so the charts never draw it.
 */
export const TRACKING_BEGAN = '2026-09-13'

/**
 * The daily RPC cuts its window at now() minus N days, so its first row is a
 * sliver of a day, and a day nobody opened anything has no row at all, so the
 * line ran straight across it (4 quiet days in October and November read as
 * continuous use). The charts get the N whole UTC days ending today, a missing
 * day as a zero, and nothing before tracking began.
 */
export function wholeDays(rows: DailyActiveRow[], days: number, now: number): DailyActiveRow[] {
  if (rows.length === 0) return []
  const byDay = new Map(rows.map((r) => [r.day.slice(0, 10), r]))
  return Array.from({ length: days }, (_, i) => new Date(now - (days - 1 - i) * DAY).toISOString().slice(0, 10))
    .filter((day) => day >= TRACKING_BEGAN)
    .map((day) => byDay.get(day) ?? { day, users: 0, events: 0, feature_opens: 0 })
}

export type PriorCoverage = { kind: 'none' } | { kind: 'partial'; days: number } | { kind: 'full' }

/**
 * How much of the period before this window is on record. For a while after
 * tracking began that period is empty, then only partly covered, and every
 * comparison against it reads as growth (everyone was "new" in launch week).
 */
export function priorCoverage(days: number, now: number, began = TRACKING_BEGAN): PriorCoverage {
  const first = Date.parse(`${began}T00:00:00Z`)
  const windowStart = now - days * DAY
  const priorStart = now - 2 * days * DAY
  if (first >= windowStart) return { kind: 'none' }
  if (first > priorStart) return { kind: 'partial', days: Math.max(1, Math.round((windowStart - first) / DAY)) }
  return { kind: 'full' }
}

export type WeekState = 'done' | 'running' | 'future'

/**
 * Where week `offset` of a cohort stands today. A finished week with no row is
 * a 0%, not a blank; the running week is a partial count that reads as a fall,
 * so it is shown as a dash until it ends.
 */
export function weekState(cohortWeek: string, offset: number, now: number): WeekState {
  const start = Date.parse(`${cohortWeek}T00:00:00Z`) + offset * 7 * DAY
  if (start + 7 * DAY <= now) return 'done'
  return start <= now ? 'running' : 'future'
}
