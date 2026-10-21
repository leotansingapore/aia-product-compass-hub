// A FINtern's First 14 Days progress, for ActivityTracker and nothing else.
//
// The MoneyBees checks in on a FINtern who has stalled (Leo, 2026-10-19:
// "it should be able to tell their progress"). ActivityTracker asks with the
// same FINTERN_ACCOUNT_SECRET it opens their account with. Narrow on purpose:
// one email in, the days they marked complete out, nothing else about them.
//
// Leo, 2026-10-21: also when they first opened the Academy (a check-in that
// evening), and once Day 14 is done The MoneyBees opens First 60 Days for them
// (`open_first_60: true`): explorer becomes papers_taker, never anything else.

import { sameSecret } from '../create-fintern-account/handler.ts'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The slice of the admin client this reads with, so a test can stand in for it. */
export interface Reader {
  profileId(email: string): Promise<{ id: string | null; error: string | null }>
  /** Their First 14 Days rows marked complete: the day and when. */
  completed(userId: string): Promise<{ rows: { day_number: number; quiz_passed_at: string }[]; error: string | null }>
  /** The earliest sign they opened the Academy: their first page open or password change. */
  firstSeen(userId: string): Promise<{ at: string | null; error: string | null }>
  tier(userId: string): Promise<{ tier: string | null; error: string | null }>
  /** explorer to papers_taker, touching no other tier. */
  openFirst60(userId: string): Promise<{ error: string | null }>
}

/** The tiers First 60 Days opens for (src/lib/tiers.ts, pre-rnf-track). */
const FIRST_60_TIERS = ['papers_taker', 'post_rnf', 'level_1', 'level_2']

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export async function handle(req: Request, deps: { secret: string; reader: () => Reader }): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!deps.secret || !sameSecret(req.headers.get('x-fintern-secret') ?? '', deps.secret)) {
    return json({ error: 'Unauthorized' }, 401)
  }
  const body = await req.json().catch(() => ({})) as { email?: unknown; open_first_60?: unknown }
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!EMAIL.test(email) || email.length > 254) return json({ error: 'A valid email is required.' }, 400)
  const reader = deps.reader()
  const prof = await reader.profileId(email)
  if (prof.error) return json({ error: prof.error }, 500)
  if (!prof.id) return json({ found: false })
  const done = await reader.completed(prof.id)
  if (done.error) return json({ error: done.error }, 500)
  const days = [...new Set(done.rows.map((r) => r.day_number))]
  const last = done.rows.map((r) => r.quiz_passed_at).sort().at(-1) ?? null
  const finished = days.includes(14)
  // Only for someone who has finished First 14 Days, and only ever upward.
  if (body.open_first_60 === true && finished) {
    const opened = await reader.openFirst60(prof.id)
    if (opened.error) return json({ error: opened.error }, 500)
  }
  const [seen, tier] = await Promise.all([reader.firstSeen(prof.id), reader.tier(prof.id)])
  if (seen.error || tier.error) return json({ error: seen.error ?? tier.error }, 500)
  return json({
    found: true, days_done: days.length, last_done_at: last, finished,
    first_login_at: seen.at, first_60_open: FIRST_60_TIERS.includes(tier.tier ?? ''),
  })
}
