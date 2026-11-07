// @vitest-environment-options {"url": "https://academy.finternship.com/learning-track/first-14-days"}
// A signed-out deep link goes to /auth, and sign-in navigates back to the same
// path in the same page load. The open must land on that second visit.

import { beforeEach, describe, expect, it, vi } from 'vitest'

let session: { user: { id: string } } | null = null
const inserts: Record<string, unknown>[] = []

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: () => Promise.resolve({ data: { session } }) },
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        inserts.push(row)
        return Promise.resolve({ error: null })
      },
    }),
  },
}))

import { trackFeatureOpen } from '../analytics'

const settle = () => new Promise((r) => setTimeout(r, 0))

describe('trackFeatureOpen', () => {
  beforeEach(() => {
    inserts.length = 0
  })

  it('records the open after sign-in returns to the same screen', async () => {
    session = null
    trackFeatureOpen('lt_first_14_days')
    await settle()
    expect(inserts).toHaveLength(0)

    session = { user: { id: 'u1' } }
    trackFeatureOpen('lt_first_14_days')
    await settle()
    expect(inserts).toHaveLength(1)
    expect(inserts[0]).toMatchObject({ user_id: 'u1', event: 'feature_open', props: { feature: 'lt_first_14_days', app: 'academy' } })
  })

  it('still records a screen once per page load once a row is written', async () => {
    session = { user: { id: 'u1' } }
    trackFeatureOpen('leaderboard')
    await settle()
    trackFeatureOpen('leaderboard')
    await settle()
    expect(inserts.filter((r) => (r.props as { feature: string }).feature === 'leaderboard')).toHaveLength(1)
  })
})
