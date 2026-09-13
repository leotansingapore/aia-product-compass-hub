// What the Product panel must never get wrong: a percentage that divides by
// the wrong denominator, a rise in errors painted green, a feature that fell
// silent going unmentioned, and a database without the migration reading as an
// outage. Every case here is one of those.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type RpcResult = { data: unknown; error: unknown }
const responses = new Map<string, RpcResult>()
const calls: { fn: string; args: Record<string, unknown> }[] = []

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => {
      calls.push({ fn, args })
      return Promise.resolve(responses.get(fn) ?? { data: [], error: null })
    },
  },
}))

// recharts needs a measured box; jsdom reports zero and renders nothing.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 600, height: 300 }}>{children}</div>
    ),
  }
})

import { FeaturesView } from '../FeaturesView'
import { EventsView } from '../EventsView'
import { RetentionView } from '../RetentionView'
import { ProductAnalyticsPanel } from '../ProductAnalyticsPanel'
import { Delta } from '../parts'

const wrap = (ui: React.ReactNode) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  responses.clear()
  calls.length = 0
})

describe('Delta', () => {
  it('reads a rise as good, and as bad when the row is an error count', () => {
    const { container, rerender } = render(<Delta now={20} prior={10} />)
    expect(container.querySelector('.text-success')).not.toBeNull()
    rerender(<Delta now={20} prior={10} invert />)
    expect(container.querySelector('.text-destructive')).not.toBeNull()
  })

  it('calls a move under 5% flat rather than a trend', () => {
    const { container } = render(<Delta now={102} prior={100} />)
    expect(container.textContent).toContain('flat')
    expect(container.querySelector('.text-success')).toBeNull()
  })

  it('says new rather than dividing by zero', () => {
    const { container } = render(<Delta now={7} prior={0} />)
    expect(container.textContent).toContain('new')
    expect(container.textContent).not.toContain('Infinity')
  })
})

describe('FeaturesView', () => {
  const adoption = [
    {
      feature: 'library_products', users: 20, opens: 400, user_days: 60, repeat_users: 15,
      new_users: 3, prior_users: 10, prior_opens: 200,
      first_seen: '2026-07-10T00:00:00Z', last_seen: '2026-09-12T00:00:00Z',
    },
    {
      feature: 'roleplay', users: 2, opens: 4, user_days: 2, repeat_users: 0,
      new_users: 0, prior_users: 8, prior_opens: 59,
      first_seen: '2026-07-17T00:00:00Z', last_seen: '2026-09-01T00:00:00Z',
    },
  ]

  it('measures reach against active people, not against every account', async () => {
    responses.set('app_feature_adoption', { data: adoption, error: null })
    responses.set('app_usage_overview', {
      data: [{ active_users: 40, total_profiles: 400, mau: 40, dau_avg: 10 }],
      error: null,
    })
    wrap(<FeaturesView days={30} />)

    // 20 of 40 active is 50%. Against 400 accounts it would read 5%.
    const table = await screen.findByTestId('feature-adoption')
    const row = (await within(table).findByText('Library: products')).closest('tr')!
    expect(within(row).getByText('50%')).toBeTruthy()
  })

  it('separates a screen that never reported from one that went quiet', async () => {
    responses.set('app_feature_adoption', { data: adoption, error: null })
    responses.set('app_usage_overview', { data: [{ active_users: 40 }], error: null })
    wrap(<FeaturesView days={30} />)

    const card = await screen.findByTestId('silent-features')
    // Pre-RNF has no row at all: tracking for it is new, nothing has landed.
    await waitFor(() => expect(within(card).getByText('Track: pre-RNF')).toBeTruthy())
    // Notes has a row, so it belongs in the table and never in this card.
    expect(within(card).queryByText('Library: products')).toBeNull()
    // Roleplay has a row too - it is down to 2 users, which is abandonment and
    // belongs in the table with its fall, not in the "no data yet" list.
    expect(within(card).queryByText('Roleplay')).toBeNull()
    expect(within(await screen.findByTestId('feature-adoption')).getByText('Roleplay')).toBeTruthy()
  })

  it('keeps a feature that fell to zero visible instead of dropping the row', async () => {
    responses.set('app_feature_adoption', {
      data: [{ ...adoption[1], users: 0, opens: 0, user_days: 0, repeat_users: 0, last_seen: null }],
      error: null,
    })
    responses.set('app_usage_overview', { data: [{ active_users: 40 }], error: null })
    wrap(<FeaturesView days={30} />)

    const table = await screen.findByTestId('feature-adoption')
    const row = (await within(table).findByText('Roleplay')).closest('tr')!
    expect(within(row).getByText('never')).toBeTruthy()
    expect(within(row).getByText(/100%/)).toBeTruthy() // the fall against 8 prior users
  })
})

describe('EventsView', () => {
  const events = [
    { event: 'feature_open', n: 500, users: 30, prior_n: 400, prior_users: 28, last_seen: '2026-09-12T00:00:00Z' },
    { event: 'lark_error', n: 90, users: 4, prior_n: 30, prior_users: 3, last_seen: '2026-09-12T00:00:00Z' },
    { event: 'askai_q', n: 0, users: 0, prior_n: 120, prior_users: 9, last_seen: null },
  ]

  it('warns about an event that stopped firing between the two periods', async () => {
    responses.set('app_event_volume', { data: events, error: null })
    wrap(<EventsView days={30} />)
    const banner = await screen.findByText(/Stopped firing/)
    expect(banner.parentElement!.textContent).toContain('askai_q')
    expect(banner.parentElement!.textContent).not.toContain('feature_open')
  })

  it('does not call a tracker that fired twice in its life a regression', async () => {
    responses.set('app_event_volume', {
      data: [
        { event: 'feature_open', n: 500, users: 30, prior_n: 400, prior_users: 28, last_seen: '2026-09-12T00:00:00Z' },
        { event: 'askai_down', n: 0, users: 0, prior_n: 1, prior_users: 1, last_seen: null },
      ],
      error: null,
    })
    wrap(<EventsView days={30} />)
    await screen.findByTestId('all-events')
    await waitFor(() => expect(screen.getByText('askai_down')).toBeTruthy())
    // It is in the table, with its fall. It is not worth a warning banner.
    expect(screen.queryByText(/Stopped firing/)).toBeNull()
  })

  it('puts errors in their own table and paints their rise as bad news', async () => {
    responses.set('app_event_volume', { data: events, error: null })
    wrap(<EventsView days={30} />)

    const errorCard = await screen.findByTestId('error-events')
    const errorRow = (await within(errorCard).findByText('lark_error')).closest('tr')!
    expect(errorRow.querySelector('.text-destructive')).not.toBeNull()

    const allCard = screen.getByTestId('all-events')
    const normalRow = within(allCard).getByText('feature_open').closest('tr')!
    expect(normalRow.querySelector('.text-success')).not.toBeNull()
    expect(within(errorCard).queryByText('feature_open')).toBeNull()
  })

  it('filters the table down to what was typed', async () => {
    responses.set('app_event_volume', { data: events, error: null })
    wrap(<EventsView days={30} />)
    const card = await screen.findByTestId('all-events')
    expect(await within(card).findByText('feature_open')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Filter events'), { target: { value: 'askai' } })
    await waitFor(() => expect(within(card).queryByText('feature_open')).toBeNull())
  })
})

describe('RetentionView', () => {
  it('shows each cohort as a share of its own size', async () => {
    responses.set('app_retention_cohorts', {
      data: [
        { cohort_week: '2026-08-03', cohort_size: 12, week_offset: 0, users: 12 },
        { cohort_week: '2026-08-03', cohort_size: 12, week_offset: 1, users: 9 },
        { cohort_week: '2026-08-10', cohort_size: 4, week_offset: 0, users: 4 },
        { cohort_week: '2026-08-10', cohort_size: 4, week_offset: 1, users: 1 },
      ],
      error: null,
    })
    responses.set('app_user_engagement', { data: [{ bucket: '1 day', sort_order: 1, users: 6 }], error: null })
    wrap(<RetentionView days={30} />)

    const row = (await screen.findByText('3 Aug')).closest('tr')!
    expect(within(row).getByText('100%')).toBeTruthy()
    expect(within(row).getByText('75%')).toBeTruthy() // 9 of 12, not 9 of 16

    const smaller = screen.getByText('10 Aug').closest('tr')!
    expect(within(smaller).getByText('25%')).toBeTruthy() // 1 of 4
  })
})

describe('ProductAnalyticsPanel', () => {
  it('explains an unmigrated database instead of showing it as an error', async () => {
    responses.set('app_usage_overview', {
      data: null,
      error: { code: 'PGRST202', message: 'Could not find the function public.app_usage_overview' },
    })
    wrap(<ProductAnalyticsPanel />)
    expect(await screen.findByText(/not migrated yet/i)).toBeTruthy()
  })

  it('scopes every view to the one window the filter row picked', async () => {
    responses.set('app_usage_overview', { data: [{ active_users: 40 }], error: null })
    wrap(<ProductAnalyticsPanel />)
    await waitFor(() => expect(calls.some((c) => c.fn === 'app_daily_active')).toBe(true))
    expect(calls.every((c) => c.args.p_app === 'academy')).toBe(true)
    expect(calls.every((c) => c.args.p_days === 30 || c.args.p_weeks !== undefined)).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: '7d' }))
    await waitFor(() => expect(calls.some((c) => c.args.p_days === 7)).toBe(true))
    expect(calls.filter((c) => c.args.p_days === 7).map((c) => c.fn)).toContain('app_daily_active')
  })
})
