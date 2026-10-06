// Turns a URL into one that can leave the browser: own-host paths lose ids and
// tokens, the hash and every query param except utm_* go, and any other host keeps
// only its origin. Shared by PostHog and Sentry, so it imports nothing (moved out
// of posthog.ts on 2026-10-06 to keep posthog-js out of the Sentry chunk).

// Never a preview deployment, never localhost.
export const PRODUCTION_HOST = /^academy\.finternship\.com$/

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** A path segment that is an id, a secret or a phone number rather than a page
 *  name. Slugs are lowercase words joined by hyphens, so a run of 6+ digits
 *  (wa.me/6591234567), a long mixed-case segment (base64) or a digit with no
 *  hyphen (hex) is not one. */
function isIdSegment(seg: string): boolean {
  if (UUID.test(seg)) return true
  if (/\d{6,}/.test(seg)) return true
  if (seg.length >= 8 && /\d/.test(seg) && !seg.includes('-')) return true
  return seg.length >= 16 && /[A-Z]/.test(seg) && /[a-z]/.test(seg)
}

// Routes whose next segment is a person's name slug, which no id rule can tell
// from a page slug. None in this app: people appear in URLs by uuid only.
const PERSON_ROUTES: string[] = []

// Link schemes whose rest is a phone number, an email address or inline data.
// A fixed list: "a:attr__href=..." ($elements_chain) must not read as a scheme.
export const ADDRESS_SCHEME = /^(mailto|tel|sms|mms|callto|facetime|facetime-audio|skype|whatsapp|viber|tg|geo|intent|data|blob|javascript):/i

// This app's own host (the production host above): its paths are ours and
// are read after scrubbing. Any other host keeps only its origin, because a
// third-party path is often a person (linkedin.com/in/<name>) or a client's
// own website.
const OWN_HOST = PRODUCTION_HOST
// Font CDNs: their URLs name a typeface, and a replay without them looks wrong.
const ASSET_HOST = /^fonts\.(googleapis|gstatic)\.com$/i
// Build files, not ids: Vite's content hashes are mixed-case and trip the token rule.
const STATIC_PREFIXES = ['/assets/', '/_next/static/', '/static/']

function safeDecode(seg: string): string {
  try {
    return decodeURIComponent(seg)
  } catch {
    return seg // a malformed escape must not throw inside before_send or the recorder
  }
}

/** Own-host URLs lose the hash, every query param except utm_*, id/token path
 *  segments and the slug in a person route; other hosts keep only the origin. */
export function scrubUrl(raw: string): string {
  // mailto:, tel:, sms:, whatsapp: ... carry the address itself; keep the scheme.
  const scheme = ADDRESS_SCHEME.exec(raw)?.[1]
  if (scheme) return `${scheme.toLowerCase()}:`
  const isAbsolute = /^https?:\/\//i.test(raw)
  if (!isAbsolute && !raw.startsWith('/')) return raw
  let url: URL
  try {
    url = new URL(raw, 'https://x.invalid')
  } catch {
    return '' // unparseable and URL-shaped: send nothing rather than the raw text
  }
  const own = url.hostname === 'x.invalid' || OWN_HOST.test(url.hostname)
  if (!own) {
    if (ASSET_HOST.test(url.hostname)) return raw
    return isAbsolute ? `${url.origin}/` : `//${url.host}/`
  }
  const origin = url.hostname === 'x.invalid' ? '' : url.origin
  let path = url.pathname.replace(/\/{2,}/g, '/')
  if (STATIC_PREFIXES.some((p) => path.startsWith(p))) return `${origin}${path}`
  path = path
    .split('/')
    .map((seg) => (isIdSegment(safeDecode(seg)) ? ':id' : seg))
    .join('/')
  // react-router matches case-insensitively, so the check does too.
  for (const route of PERSON_ROUTES) {
    if (!path.toLowerCase().startsWith(route) || path.length === route.length) continue
    const rest = path.slice(route.length)
    const cut = rest.indexOf('/')
    path = `${path.slice(0, route.length)}:person${cut < 0 ? '' : rest.slice(cut)}`
  }
  const kept = [...url.searchParams].filter(([k]) => k.toLowerCase().startsWith('utm_'))
  const query = kept.length ? `?${new URLSearchParams(kept)}` : ''
  return `${origin}${path}${query}`
}
