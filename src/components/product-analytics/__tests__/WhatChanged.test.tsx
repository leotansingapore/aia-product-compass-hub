// The "What changed" strip: biggest moves in people, in the right direction,
// a screen nobody opened in the period before kept out of the gains, retired
// and re-scoped keys never ranked, and an empty period before said out loud.

import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { whatChanged } from '../changes'
import type { EventVolumeRow, FeatureAdoptionRow } from '../useProductAnalytics'

const responses = new Map<string, { data: unknown; error: unknown }>()

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (fn: string) => Promise.resolve(responses.get(fn) ?? { data: [], error: null }),
  },
}))

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 300 }}>{children}</div>
    ),
  }
})

import { OverviewView } from '../OverviewView'

const f = (feature: string, users: number, prior_users: number): FeatureAdoptionRow => ({
  feature, users, prior_users, opens: users * 3, user_days: users * 2, repeat_users: 0,
  new_users: 0, prior_opens: prior_users * 3, first_seen: '2026-09-13T00:00:00Z', last_seen: null,
})
const ev = (event: string, n: number, prior_n: number): EventVolumeRow => ({
  event, n, prior_n, users: n ? 1 : 0, prior_users: prior_n ? 1 : 0, last_seen: null,
})

// The real 30-day shape on 7 Nov 2026, trimmed.
const features = [
  f('lt_first_14_days', 11, 6), // +5
  f('home', 9, 5), // +4
  f('cmfas_module', 2, 1), // +1
  f('lt_pre_rnf_assignments', 6, 11), // -5
  f('scripts', 1, 5), // -4
  f('lt_first_60_days', 4, 6), // -2, had more before than categories
  f('categories', 3, 5), // -2
  f('leaderboard', 8, 8), // flat
  f('library_cheat_sheets', 2, 0), // nobody before: never a gain
  f('lt_pre_rnf', 6, 9), // retired: never a loss
  f('playbooks', 1, 5), // re-scoped on 8 Nov: not ranked yet
]
const events = [ev('feature_open', 202, 248), ev('some_error', 0, 14), ev('rare_thing', 0, 1)]
const NOW = Date.parse('2026-11-07T15:00:00Z')

describe('whatChanged', () => {
  it('ranks gains biggest first and keeps screens nobody opened before out of them', () => {
    const s = whatChanged(features, events, 30, NOW)
    expect(s.gained.map((m) => m.feature)).toEqual(['lt_first_14_days', 'home', 'cmfas_module'])
    expect(s.gained[0]).toMatchObject({ prior: 6, users: 11, change: 5 })
    expect(s.firstReported).toBe(1)
  })

  it('ranks losses by the most people lost, ties to the one that had more', () => {
    const s = whatChanged(features, events, 30, NOW)
    expect(s.lost.map((m) => m.feature)).toEqual(['lt_pre_rnf_assignments', 'scripts', 'lt_first_60_days'])
    expect(s.lost.every((m) => m.change < 0)).toBe(true)
  })

  it('counts moves in people, not opens', () => {
    // Opens tripled while people fell; the strip must say it fell.
    const s = whatChanged([{ ...f('scripts', 1, 5), opens: 300, prior_opens: 100 }], [], 30, NOW)
    expect(s.lost[0]).toMatchObject({ feature: 'scripts', change: -4 })
    expect(s.gained).toEqual([])
  })

  it('does not count a flat feature as a move either way', () => {
    const s = whatChanged(features, events, 30, NOW)
    expect([...s.gained, ...s.lost].some((m) => m.feature === 'leaderboard')).toBe(false)
  })

  it('breaks a tie on the key, so the order never follows the RPC row order', () => {
    const tied = [f('scripts', 4, 5), f('flows', 4, 5), f('roleplay', 3, 2), f('objections', 3, 2)]
    const s = whatChanged(tied, [], 30, NOW)
    expect(s.lost.map((m) => m.feature)).toEqual(['flows', 'scripts'])
    expect(s.gained.map((m) => m.feature)).toEqual(['objections', 'roleplay'])
  })

  it('never ranks a retired key, whose fall is a tracking change', () => {
    const s = whatChanged(features, events, 30, NOW)
    expect([...s.gained, ...s.lost].some((m) => m.feature === 'lt_pre_rnf')).toBe(false)
  })

  it('leaves a re-scoped key unranked until both windows are after its new matcher, then ranks it', () => {
    expect(whatChanged(features, events, 30, NOW).rescoped).toEqual(['playbooks'])
    // 30 days before a window that starts after 8 Nov: 7 Jan 2027 onward.
    const later = whatChanged(features, events, 30, Date.parse('2027-01-08T00:00:00Z'))
    expect(later.rescoped).toEqual([])
    expect(later.lost.map((m) => m.feature)).toContain('playbooks')
  })

  it('names a stopped tracker only when it had real volume before', () => {
    expect(whatChanged(features, events, 30, NOW).stopped).toEqual(['some_error'])
  })

  it('says there is nothing to compare when the period before is empty', () => {
    const s = whatChanged([f('home', 6, 0), f('leaderboard', 2, 0)], [ev('feature_open', 300, 0)], 30, NOW)
    expect(s.comparable).toBe(false)
  })
})

const render30 = (days = 30) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <OverviewView days={days} />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('OverviewView what-changed strip', () => {
  // Only Date is faked: the strip's coverage and RESCOPED read the clock, and
  // real timers keep react-query and findBy working.
  beforeEach(() => {
    responses.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })
  afterEach(() => vi.useRealTimers())

  it('shows the moves with their before and after head counts', async () => {
    responses.set('app_feature_adoption', { data: features, error: null })
    responses.set('app_event_volume', { data: events, error: null })
    render30(7)
    const lost = await screen.findByTestId('changed-lost')
    const row = lost.querySelector('[data-feature="lt_pre_rnf_assignments"]')!
    expect(row.textContent).toContain('11 to 6')
    expect(row.textContent).toContain('-5')
    expect(row.textContent).toContain('Track: pre-RNF assignments')
    expect(within(screen.getByTestId('changed-gained')).getByText('+5')).toBeTruthy()
    expect(within(screen.getByTestId('changed-stopped')).getByText('some_error')).toBeTruthy()
    const notRanked = screen.getByTestId('changed-first').textContent
    expect(notRanked).toContain('1 screen nobody opened')
    expect(notRanked).toContain('Playbooks')
    expect(screen.queryByTestId('changed-none')).toBeNull()
  })

  it('says so instead of three empty columns when the window holds the start of tracking', async () => {
    responses.set('app_feature_adoption', { data: features, error: null })
    responses.set('app_event_volume', { data: events, error: null })
    render30(90)
    const none = await screen.findByTestId('changed-none')
    expect(none.textContent).toContain('Nothing to compare yet')
    expect(none.textContent).toContain('Pick 30d or 7d')
    expect(screen.queryByTestId('changed-lost')).toBeNull()
  })
})
