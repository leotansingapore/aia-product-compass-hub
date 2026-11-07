import { describe, expect, it } from 'vitest'
import { weekState, wholeDays } from '../changes'
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
