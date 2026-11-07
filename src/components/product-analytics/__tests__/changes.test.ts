import { describe, expect, it } from 'vitest'
import { pickNamed, priorCoverage, weekState, wholeDays, type ScatterPoint } from '../changes'
import type { DailyActiveRow } from '../useProductAnalytics'

const row = (day: string, users: number): DailyActiveRow => ({ day, users, events: users, feature_opens: users })

describe('wholeDays', () => {
  const now = Date.parse('2026-11-07T15:00:00Z')
  // The RPC's 7-day answer on 7 Nov: 31 Oct is a sliver, 3 and 6 Nov had nobody.
  const rpc = [row('2026-10-31', 1), row('2026-11-01', 2), row('2026-11-02', 2), row('2026-11-04', 3), row('2026-11-05', 3), row('2026-11-07', 1)]

  it('draws exactly the N whole days ending today, dropping the partial first day', () => {
    const out = wholeDays(rpc, 7, now)
    expect(out).toHaveLength(7)
    expect(out[0].day).toBe('2026-11-01')
    expect(out[6].day).toBe('2026-11-07')
  })

  it('draws a day nobody opened anything as zero instead of joining across it', () => {
    expect(wholeDays(rpc, 7, now).map((d) => d.users)).toEqual([2, 2, 0, 3, 3, 0, 1])
  })

  it('never draws a day before tracking began as a quiet day', () => {
    const out = wholeDays([row('2026-09-13', 3), row('2026-09-14', 4)], 90, Date.parse('2026-09-20T03:00:00Z'))
    expect(out[0].day).toBe('2026-09-13')
    expect(out).toHaveLength(8)
  })

  it('keeps the empty state when the window holds nothing', () => {
    expect(wholeDays([], 7, now)).toEqual([])
  })
})

describe('weekState', () => {
  // Saturday 7 Nov 2026; weeks start on Monday (date_trunc('week')).
  const now = Date.parse('2026-11-07T15:00:00Z')

  it('calls a week finished only once all seven days are past', () => {
    expect(weekState('2026-10-19', 1, now)).toBe('done') // 26 Oct - 1 Nov
    expect(weekState('2026-10-19', 2, now)).toBe('running') // 2 - 8 Nov
    expect(weekState('2026-10-19', 3, now)).toBe('future')
  })

  it('treats the cohort week itself the same way', () => {
    expect(weekState('2026-11-02', 0, now)).toBe('running')
    expect(weekState('2026-10-26', 0, now)).toBe('done')
  })
})

describe('priorCoverage', () => {
  const now = Date.parse('2026-11-07T15:00:00Z')

  it('reads none when tracking began inside the window', () => {
    expect(priorCoverage(90, now)).toEqual({ kind: 'none' })
  })

  it('reads partial, with the days on record, when tracking began inside the period before', () => {
    // Window from 8 Oct 15:00, period before from 8 Sep: 13 Sep 00:00 onward is 25.6 days.
    expect(priorCoverage(30, now)).toEqual({ kind: 'partial', days: 26 })
  })

  it('reads full once the whole period before is on record', () => {
    expect(priorCoverage(7, now)).toEqual({ kind: 'full' })
    expect(priorCoverage(30, Date.parse('2026-11-13T00:00:00Z'))).toEqual({ kind: 'full' })
  })
})

describe('pickNamed', () => {
  // The real 30-day map on 7 Nov 2026: [key, reach %, days each].
  const raw: [string, number, number][] = [
    ['lt_first_14_days', 55, 1.82], ['home', 45, 1.56], ['leaderboard', 40, 2.25], ['lt_pre_rnf_assignments', 30, 1.83],
    ['product', 25, 2.8], ['lt_first_60_days', 20, 1.5], ['categories', 15, 3], ['library_playbooks', 15, 3],
    ['cmfas_exams', 15, 1.33], ['library_products', 15, 2.67], ['lt_product_mastery', 15, 1], ['lt_post_rnf', 10, 2],
    ['lt_post_rnf_assignments', 10, 1.5], ['cmfas_module', 10, 1], ['library_cheat_sheets', 10, 1],
    ['lt_post_rnf_aia_training', 5, 1], ['lt_next_60_days', 5, 1], ['scripts', 5, 1],
  ]
  const points: ScatterPoint[] = raw.map(([feature, reach, depth]) => ({ feature, label: `${feature} label text`, reach, depth }))
  const named = pickNamed(points, 15, 1.5)

  it('never names a dot whose name would run across another dot', () => {
    // Its name ran right, over the dots at 10% and 15% on the same row.
    expect(named.has('lt_post_rnf_aia_training')).toBe(false)
    for (const key of named) {
      const p = points.find((x) => x.feature === key)!
      const span = Math.min(40, p.label.length * 0.6)
      const covered = points.filter((o) => o !== p && o.reach > p.reach && o.reach - p.reach < span && Math.abs(o.depth - p.depth) / 3 < 0.05)
      expect(covered.map((o) => o.feature), key).toEqual([])
    }
  })

  it('still names the far outliers, at most five', () => {
    expect(named.has('lt_first_14_days')).toBe(true)
    expect(named.size).toBeGreaterThan(2)
    expect(named.size).toBeLessThanOrEqual(5)
  })
})
