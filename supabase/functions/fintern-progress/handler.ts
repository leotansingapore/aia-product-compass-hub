// A FINtern's First 14 Days progress, for ActivityTracker and nothing else.
//
// The MoneyBees checks in on a FINtern who has stalled (Leo, 2026-10-19:
// "it should be able to tell their progress"). ActivityTracker asks with the
// same FINTERN_ACCOUNT_SECRET it opens their account with. Narrow on purpose:
// one email in, the days they marked complete out, nothing else about them.

import { sameSecret } from '../create-fintern-account/handler.ts'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The slice of the admin client this reads with, so a test can stand in for it. */
export interface Reader {
  profileId(email: string): Promise<{ id: string | null; error: string | null }>
  /** Their First 14 Days rows marked complete: the day and when. */
  completed(userId: string): Promise<{ rows: { day_number: number; quiz_passed_at: string }[]; error: string | null }>
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export async function handle(req: Request, deps: { secret: string; reader: () => Reader }): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!deps.secret || !sameSecret(req.headers.get('x-fintern-secret') ?? '', deps.secret)) {
    return json({ error: 'Unauthorized' }, 401)
  }
  const body = await req.json().catch(() => ({})) as { email?: unknown }
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
  return json({ found: true, days_done: days.length, last_done_at: last, finished: days.includes(14) })
}
