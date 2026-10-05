// A FINtern's Academy account, made for ActivityTracker and nothing else.
//
// ActivityTracker calls this when a candidate's signed FINternship letter of
// offer comes back (its offerLetter.ts; Leo, 2026-10-05). Narrow on purpose,
// unlike create-user-account, which an admin drives from the browser:
//   - the caller proves itself with FINTERN_ACCOUNT_SECRET, not a login
//   - the tier is always explorer (First 14 Days), never chosen by the caller
//   - the password is always the starter one Leo hands out by hand, so the
//     caller cannot set anybody's password
//   - no GrowingAge account (Leo: Academy only)
//   - an email that already has an account is left exactly as it is: no new
//     password, no tier change. The answer says so and the caller tells a person.

export const STARTER_PASSWORD = '123456'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Equal strings in the same time whatever they hold. */
export function sameSecret(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

/** The slice of the admin client this uses, so a test can stand in for it. */
export interface Admin {
  auth: { admin: { createUser(a: Record<string, unknown>): Promise<{ data: { user: { id: string } | null }; error: { message: string; code?: string } | null }> } }
  from(table: string): {
    insert(row: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>
    upsert(row: Record<string, unknown>, o: { onConflict: string }): PromiseLike<{ error: { message: string } | null }>
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export async function handle(req: Request, deps: { secret: string; admin: () => Admin }): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  // No secret configured is a refusal, never an open door.
  if (!deps.secret || !sameSecret(req.headers.get('x-fintern-secret') ?? '', deps.secret)) {
    return json({ error: 'Unauthorized' }, 401)
  }
  const body = await req.json().catch(() => ({})) as { email?: unknown; name?: unknown }
  const email = String(body.email ?? '').trim().toLowerCase()
  const name = String(body.name ?? '').trim().replace(/\s+/g, ' ').slice(0, 100)
  if (!EMAIL.test(email) || email.length > 254) return json({ error: 'A valid email is required.' }, 400)
  const [firstName = '', ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const displayName = name || email

  const admin = deps.admin()
  const { data, error } = await admin.auth.admin.createUser({
    email, password: STARTER_PASSWORD, email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, display_name: displayName, source: 'finternship-offer' },
  })
  if (error) {
    if (error.code === 'email_exists' || /already (been )?registered/i.test(error.message)) return json({ created: false, exists: true })
    return json({ error: error.message }, 500)
  }
  const id = data.user?.id
  if (!id) return json({ error: 'The account was not created.' }, 500)
  // Same rows create-user-account writes. A signup trigger may have made the
  // profile and tier rows already, so a failed insert is logged, not fatal,
  // and the tier is an upsert.
  const profile = await admin.from('profiles').insert({ user_id: id, email, first_name: firstName, last_name: lastName, display_name: displayName })
  if (profile.error) console.error('profiles insert:', profile.error.message)
  const role = await admin.from('user_roles').insert({ user_id: id, role: 'user' })
  if (role.error) console.error('user_roles insert:', role.error.message)
  const tier = await admin.from('user_access_tiers').upsert({ user_id: id, tier_level: 'explorer' }, { onConflict: 'user_id' })
  if (tier.error) return json({ error: `Account made, tier not set: ${tier.error.message}` }, 500)
  return json({ created: true })
}
