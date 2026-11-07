// Time shaping for the Product panel, kept pure so the rules are tested
// without rendering anything. Ported from the GAC and CMFAS panels (monthly
// passes, Oct-Nov 2026), which met every one of these on sparse data first.

import { RESCOPED, isKnownFeature } from '@/lib/featureCatalog'
import type { DailyActiveRow, EventVolumeRow, FeatureAdoptionRow } from './useProductAnalytics'

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

/**
 * Only a tracker with real volume behind it counts as stopped. One that fired
 * once in its whole life going quiet is not a regression, and a warning that
 * fires on it becomes wallpaper.
 */
export const QUIET_FLOOR = 10

export function stoppedEvents(events: EventVolumeRow[]): EventVolumeRow[] {
  return events.filter((e) => e.n === 0 && e.prior_n >= QUIET_FLOOR)
}

export interface FeatureMove {
  feature: string
  users: number
  prior: number
  change: number
}

export interface ChangeSummary {
  gained: FeatureMove[]
  lost: FeatureMove[]
  stopped: string[]
  /** Screens opened in this window by nobody in the period before. */
  firstReported: number
  /** Live keys left unranked because their matcher narrowed inside the comparison. */
  rescoped: string[]
  /** False when no screen had anyone in the period before: nothing to compare. */
  comparable: boolean
}

/**
 * What moved against the period before, in PEOPLE, not opens: an open count
 * swings with page reloads, a head count does not. A screen nobody opened in
 * the period before is never a gain (it is a tracking date dressed up as
 * growth), a retired key is never a loss (tracking stopped, not learners), and
 * a re-scoped key waits until both windows are after its new matcher.
 */
export function whatChanged(
  features: FeatureAdoptionRow[],
  events: EventVolumeRow[],
  days: number,
  now: number,
  top = 3,
): ChangeSummary {
  const priorStart = now - 2 * days * DAY
  const settled = (key: string) => !RESCOPED[key] || Date.parse(`${RESCOPED[key]}T00:00:00Z`) <= priorStart
  const live = features.filter((f) => isKnownFeature(f.feature))
  const moves = live
    .filter((f) => f.prior_users > 0 && settled(f.feature))
    .map((f) => ({ feature: f.feature, users: f.users, prior: f.prior_users, change: f.users - f.prior_users }))

  return {
    // Ties go to the bigger feature, which more people will feel, then to the
    // key: with a few dozen learners most moves are ties, and without it the
    // order follows whatever order the RPC returned.
    gained: moves
      .filter((m) => m.change > 0)
      .sort((a, b) => b.change - a.change || b.users - a.users || a.feature.localeCompare(b.feature))
      .slice(0, top),
    lost: moves
      .filter((m) => m.change < 0)
      .sort((a, b) => a.change - b.change || b.prior - a.prior || a.feature.localeCompare(b.feature))
      .slice(0, top),
    stopped: stoppedEvents(events).map((e) => e.event),
    firstReported: live.filter((f) => f.prior_users === 0 && f.users > 0).length,
    rescoped: live.filter((f) => !settled(f.feature) && (f.users > 0 || f.prior_users > 0)).map((f) => f.feature),
    comparable: moves.length > 0 || events.some((e) => e.prior_n > 0),
  }
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
