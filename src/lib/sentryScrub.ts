import { scrubUrl } from './scrubUrl'

// Error reports carry the page address (request.url, navigation breadcrumbs, the
// transaction name) and the address of every request the page made. Here a magic link
// or password reset lands with its token in the hash or ?code=, and a playbook share
// link is a bearer token, so every URL is cleaned the way PostHog's are before it
// leaves for Sentry. Supabase keeps its path for REST, RPC, auth and functions (names only); a
// storage path can hold a file name, so it goes.
//
// Text is cleaned twice: URLs found in it are cleaned whole, then a fail-closed pass
// removes emails, NRIC/FIN numbers, Singapore phone numbers and login tokens anywhere,
// and any query or fragment parameter, playbook share token and long token still left
// in URL-shaped text, because
// a URL inside text can end early (a bracket or quote in its query), carry escaped
// slashes (JSON) or have no scheme at all, and a regex and the URL parser disagree on
// where such a URL stops.
const URL_IN_TEXT = /https?:(?:\\?\/){2}[^\s"'<>]+/gi
const SUPABASE = /\.supabase\.co$/i
const QUERY_PARAM = /[?&][^\s?&=#"'<>]+=[^\s&#"'<>]*/g
// The share token is 16 hex (randomUUID cut to 16), too short for LONG_HEX. It gets
// :id, the same mark scrubUrl leaves, so an already-clean address reads unchanged.
const SHARE_SLUG = /(\/playbooks\/share\/)[^\s/?#"'<>\\]+/gi
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
const LONG_HEX = /\b[0-9a-f]{24,}\b/gi
const FRAGMENT_PARAM = /#[^\s#"'<>]*=[^\s"'<>]*/g
// Personal details and credentials an error message or a value can carry anywhere.
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g
const NRIC = /\b[STFGM]\d{7}[A-Z]\b/gi
// No lookbehind: Safari before 16.4 cannot parse one, and the whole chunk would fail.
const SG_PHONE = /(^|[^\w-])((?:\+?65[ -]?)?[3689]\d{3}[ -]?\d{4})(?![\w-])/g
// A click or input breadcrumb names its element with attribute values (title,
// aria-label, alt, name), which can hold a learner's or client's name.
const SELECTOR_ATTR = /\[[^\]]*\]/g
const MAX_DEPTH = 12

export function scrubSentryUrl(raw: string): string {
  const unescaped = raw.replace(/\\\//g, '/')
  try {
    const url = new URL(unescaped)
    if (SUPABASE.test(url.hostname)) {
      const path = url.pathname.startsWith('/storage/') ? '/storage/v1/:path' : url.pathname
      return `${url.origin}${path}`
    }
  } catch {
    // not absolute: scrubUrl handles paths
  }
  return scrubUrl(unescaped)
}

/** The fail-closed pass. Only strings that could hold a URL part are touched, so
 *  Sentry's own ids (event_id, trace_id, span_id: bare hex) pass through. */
function scrubRemnants(text: string): string {
  const personal = text.replace(JWT, ':jwt').replace(EMAIL, ':email').replace(NRIC, ':nric').replace(SG_PHONE, '$1:phone')
  if (!/[/?=#]/.test(personal)) return personal
  return personal
    .replace(FRAGMENT_PARAM, '')
    .replace(QUERY_PARAM, '')
    .replace(SHARE_SLUG, '$1:id')
    .replace(UUID, ':id')
    .replace(LONG_HEX, ':id')
}

function scrubString(value: string): string {
  const urls = value.startsWith('/') ? scrubUrl(value) : value.replace(URL_IN_TEXT, scrubSentryUrl)
  return scrubRemnants(urls)
}

/** Every string and key at any depth. Past MAX_DEPTH an object is dropped, not sent raw. */
export function scrubSentryValue<T>(value: T, depth = 0): T {
  if (typeof value === 'string') return scrubString(value) as T
  if (value === null || typeof value !== 'object') return value
  if (depth > MAX_DEPTH) return '[removed: nested too deep]' as T
  if (Array.isArray(value)) return value.map((v) => scrubSentryValue(v, depth + 1)) as T
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) out[scrubString(k)] = scrubSentryValue(v, depth + 1)
  return out as T
}

/** A breadcrumb, cleaned, or null to drop it. Console breadcrumbs go: the app logs
 *  learner and case records to the console, and Sentry attaches recent console output
 *  to errors. */
export function scrubSentryBreadcrumb<T extends { category?: string; message?: string }>(breadcrumb: T): T | null {
  if (breadcrumb.category === 'console') return null
  const out = scrubSentryValue(breadcrumb)
  if (out.category?.startsWith('ui.') && typeof out.message === 'string') out.message = out.message.replace(SELECTOR_ATTR, '')
  return out
}

/** An error or transaction event, cleaned. The raw query string is a separate field, so it goes. */
export function scrubSentryEvent<T extends { request?: { query_string?: unknown } }>(event: T): T {
  const out = scrubSentryValue(event)
  if (out.request) delete out.request.query_string
  return out
}
