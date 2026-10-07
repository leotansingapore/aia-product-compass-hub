import { isIdSegment, scrubUrl } from './scrubUrl'

// Error reports carry the page address, the address of every request the page made,
// error messages, element descriptions and span text. Here a playbook share link is a
// bearer token, reset links carry login tokens, and messages can quote
// names, emails and numbers, so the fields that carry user content are cleaned before
// anything leaves for Sentry.
//
// v11 (2026-10-07) is schema-directed. Only the fields that can carry user content are
// cleaned: messages, exception values, URLs, breadcrumbs, span descriptions and data,
// tag values and the transaction name. Sentry's own fields (exception type, mechanism,
// frame function and module, sdk, measurements, ids, internal metadata) are left exactly
// as they are, so grouping, titles and source maps keep working. Arbitrary app data
// (event.extra, unknown contexts, custom breadcrumb data, request bodies, cookies and
// headers other than User-Agent, the user) is dropped.
//
// Free text is cleaned word by word and fails closed (v8 onward, after seven review
// rounds showed that reading free text with regexes and decoding always leaves a gap):
// nothing is decoded; phone numbers, NRIC/FIN, emails and login tokens are redacted
// across the string; an element selector loses everything from its first "["; each word
// is judged on its own (a URL or path goes through scrubUrl and keeps only route-shaped
// segments, a word with a %XX escape, @, = ? & #, JSON, a slash, a long id or 6+ digits
// is replaced), and after an address, a parameter or JSON the rest of the string goes.
// What it cannot do: tell a plain name in app-written text from any other word.
const SUPABASE = /\.supabase\.co$/i
const MAX_DEPTH = 12
const MAX_TEXT = 4000 // longer strings are cut first; Sentry truncates them anyway
const CUT = '(cut)'
// Sentry's own id fields where they appear among cleaned values (tags, span data),
// exempt only when the value is shaped like an id.
const SENTRY_KEYS = new Set([
  'event_id', 'trace_id', 'span_id', 'parent_span_id', 'segment_id', 'profile_id', 'replay_id',
  'debug_id', 'code_id', 'release', 'dist', 'posthog_session',
])
const ID_VALUE = /^(?:[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}|[0-9a-f]{16,64})$/i
// Bounded quantifiers keep these linear on long strings (an unbounded local part
// backtracked for 0.7 s on 20,000 letters).
const EMAIL = /[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,24}/gi
const JWT = /(^|[^A-Za-z0-9])eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g
const NRIC = /(^|[^A-Za-z0-9])[STFGM]\d{7}[A-Z](?![A-Za-z0-9])/gi
// No lookbehind: Safari before 16.4 cannot parse one, and the whole chunk would fail.
const SG_PHONE = /(^|[^A-Za-z0-9-])((?:\+?65[\s.\-–—]{0,3})?\(?[3689]\d{3}\)?[\s.\-–—]{0,3}\d{4})(?![A-Za-z0-9-])/g
// Phone numbers in any country, written in groups ('+63 917 123 4567', '415-555-0123',
// '0917 123 4567'): split by spaces they slip past every word rule. A plain date in
// groups (2026-10-07) goes too; ISO timestamps do not match.
const INTL_PHONE = /(^|[^A-Za-z0-9+])\+\d{1,3}(?:[\s.\-\u2013\u2014]{0,2}\(?\d{1,5}\)?){2,6}(?![A-Za-z0-9])/g
const DIGIT_GROUPS = /(^|[^A-Za-z0-9])\(?\d{2,5}\)?(?:[\s.\-\u2013\u2014]{1,2}\d{2,5}){2,4}(?![A-Za-z0-9])/g
// An element selector (Sentry's htmlTreeAsString) writes attribute values unescaped,
// with names, quotes, brackets and " > " inside them, so everything from the first "["
// goes. Only applied to text shaped like a selector.
const SELECTOR = /(?:^|\s>\s)[a-z][a-z0-9-]*(?:[.#][\w-]+)*\[/i
const SELECTOR_ATTRS = /\[[\s\S]*$/
const LEAD = /^[("'[{<,;]+/
const TRAIL = /[)"'\]}>.,;:!]+$/
const ABSOLUTE = /^(?:https?:)?(?:\\?\/){2}/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Route words are lowercase (Next dynamic segments are [id]); a path segment with a
// capital letter, a space, an escape or anything else is a name or free text that a
// decoded path carried ("/tracker/crm/Maria"). Build files keep their mixed-case hashes
// on any host, so stack frames and stale-chunk errors still resolve.
const ROUTE_SEGMENT = /^(?:[a-z0-9._:~-]*|\[\[?(?:\.\.\.)?[a-z0-9_]+\]?\])$/
const BUILD_PATH = /^\/(?:assets|_next\/static|static)\//
// On any host, only a BUILD FILE keeps its path (a hashed .js/.css/.map name); any other
// file under /static/ or /assets/ (a third party's Maria_Santos_Invoice.pdf) is a path
// like any other and is cut to the origin.
const BUILD_FILE = /^\/(?:assets|_next\/static|static)\/(?:[\w-]+\/)*[\w.-]+\.(?:js|mjs|cjs|css|map)$/

export function scrubSentryUrl(raw: string): string {
  const unescaped = raw.replace(/\\\//g, '/')
  try {
    const url = new URL(unescaped.startsWith('//') ? `https:${unescaped}` : unescaped)
    if (BUILD_FILE.test(url.pathname)) return `${unescaped.startsWith('//') ? '' : url.protocol}//${url.host}${url.pathname}`
    if (SUPABASE.test(url.hostname)) {
      // Function and REST paths are names; an id or token segment in them still goes.
      const path = url.pathname.startsWith('/storage/')
        ? '/storage/v1/:path'
        : url.pathname.split('/').map((seg) => (isIdSegment(seg) ? ':id' : seg)).join('/')
      return `${url.origin}${path}`
    }
  } catch {
    // not absolute: scrubUrl handles paths
  }
  return scrubUrl(unescaped)
}

function strictPath(cleaned: string): string {
  const m = cleaned.match(/^((?:[a-z][a-z0-9+.-]*:)?\/\/[^/]*)?(\/.*)?$/i)
  if (!m || !m[2] || BUILD_FILE.test(m[2])) return cleaned
  const path = m[2].split('/').map((seg) => (ROUTE_SEGMENT.test(seg) ? seg : ':seg')).join('/')
  return (m[1] ?? '') + path
}

/** One URL value (request.url, breadcrumb url/from/to): everything after ; = & ? # goes. */
export function cleanUrl(value: string): string {
  if (!ABSOLUTE.test(value) && !/^\/(?![/\\])/.test(value)) return scrubText(value)
  const head = value.split(/[;=&?#\s]/)[0]
  // An escape in the path itself (not the query) is never decoded or read: the address goes.
  if (/%[0-9A-Fa-f]{2}/.test(head)) return ':enc'
  return strictPath(ABSOLUTE.test(head) ? scrubSentryUrl(head) : scrubUrl(head))
}

function redactPersonal(text: string): string {
  return text
    .replace(JWT, '$1:jwt')
    .replace(EMAIL, ':email')
    .replace(NRIC, '$1:nric')
    .replace(INTL_PHONE, '$1:phone')
    .replace(SG_PHONE, '$1:phone')
    .replace(DIGIT_GROUPS, '$1:phone')
}

/** One word, cleaned. `cut` says the rest of the string must go. */
function scrubWord(word: string): { out: string; cut: boolean } {
  const lead = word.match(LEAD)?.[0] ?? ''
  const rest = word.slice(lead.length)
  const trail = rest.match(TRAIL)?.[0] ?? ''
  const core = rest.slice(0, rest.length - trail.length)
  if (!core) return { out: word, cut: false }
  const wrap = (s: string, cut = false) => ({ out: lead + s + trail, cut })
  // An address goes first, so an encoded select list (?select=id%2Cname) is just its query.
  // After an address the rest of the string goes: a decoded path can carry a raw space
  // inside a name ("/tracker/crm/Maria Santos").
  if (ABSOLUTE.test(core) || /^\/(?![/\\])/.test(core)) return wrap(cleanUrl(core), true)
  // An encoded word may hide a query at any depth (%253F), so the rest goes too.
  if (/%[0-9A-Fa-f]{2}/.test(core)) return wrap(':enc', true)
  // JSON or a quoted list first, judged on the whole word with its brackets: ["Maria","John"],
  // {"handle":"@maria",...}. The rest of the string goes with it.
  if (/":|:"|[[{]"|"[\]}]|","/.test(word)) return wrap(':json', true)
  if (core.includes('@')) return wrap(':email')
  if (/[=?&#]/.test(core)) return wrap(':param', true)
  if (/[/\\]/.test(core)) return wrap(':path')
  if (/eyJ[A-Za-z0-9_-]{8,}/.test(core)) return wrap(':jwt')
  if (/\d{6,}/.test(core)) return wrap(':num')
  if (UUID.test(core) || /^[0-9a-f]{12,}$/i.test(core)) return wrap(':id')
  // A long word with a digit is a token; a long CamelCase word with none is an identifier
  // (AuthSessionMissingError) and stays.
  // ...an ISO timestamp is long and full of digits too, and is no secret.
  if (core.length >= 16 && /\d/.test(core) && !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?$/.test(core)) return wrap(':id')
  return { out: word, cut: false }
}

/** Free text, cleaned word by word. */
export function scrubText(value: string): string {
  let text = redactPersonal(value.length > MAX_TEXT ? value.slice(0, MAX_TEXT) : value)
  if (SELECTOR.test(text)) text = text.replace(SELECTOR_ATTRS, '').trimEnd()
  const parts = text.split(/(\s+)/)
  const out: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part || /^\s+$/.test(part)) {
      out.push(part)
      continue
    }
    const { out: word, cut } = scrubWord(part)
    out.push(word)
    if (cut) {
      if (parts.slice(i + 1).some((p) => p.trim())) out.push(' ' + CUT)
      break
    }
  }
  return out.join('').trimEnd()
}

/** A transaction name: a route ("GET /api/projects/[id]/keywords", "/s/:person"), kept as
 *  a route so grouping holds; its path is cleaned like any URL. */
function cleanTransaction(value: string): string {
  const m = value.match(/^([A-Z]+ )?(\S+)(.*)$/)
  if (!m || !(ABSOLUTE.test(m[2]) || m[2].startsWith('/'))) return scrubText(value)
  return (m[1] ?? '') + cleanUrl(m[2]) + (m[3].trim() ? ` ${CUT}` : '')
}

/** Every string at any depth (tags, span data, context data). Past MAX_DEPTH an object is
 *  dropped, not sent raw. Keys are code identifiers and are only cleaned when URL-shaped. */
export function scrubSentryValue<T>(value: T, depth = 0, key = ''): T {
  if (typeof value === 'string') return (SENTRY_KEYS.has(key) && ID_VALUE.test(value) ? value : scrubText(value)) as T
  if (value === null || typeof value !== 'object') return value
  if (depth > MAX_DEPTH) return '[removed: nested too deep]' as T
  if (Array.isArray(value)) return value.map((v) => scrubSentryValue(v, depth + 1)) as T // items never inherit an exemption
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) out[/[/?=&#%@]/.test(k) ? scrubText(k) : k] = scrubSentryValue(v, depth + 1, k)
  return out as T
}

// SDK-generated contexts. 'response' is not kept: it holds response headers and cookies.
const KEEP_CONTEXTS = new Set(['trace', 'browser', 'os', 'device', 'runtime', 'app', 'culture', 'react'])
const KEEP_BREADCRUMB_DATA = new Set(['url', 'from', 'to', 'method', 'status_code', 'reason', 'request_body_size', 'response_body_size'])
const URL_FIELDS = new Set(['url', 'from', 'to'])

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

/** A breadcrumb, cleaned, or null to drop it. Console breadcrumbs go: the app logs
 *  client records to the console, and Sentry attaches recent console output to errors. */
export function scrubSentryBreadcrumb<T extends { category?: string; message?: unknown; data?: unknown }>(breadcrumb: T): T | null {
  if (breadcrumb.category === 'console') return null
  const out: Obj = { ...breadcrumb }
  if (typeof out.message === 'string') out.message = scrubText(out.message)
  if (isObj(out.data)) {
    const data: Obj = {}
    for (const [k, v] of Object.entries(out.data)) {
      if (!KEEP_BREADCRUMB_DATA.has(k)) continue
      data[k] = typeof v === 'string' ? (URL_FIELDS.has(k) ? cleanUrl(v) : scrubText(v)) : v
    }
    out.data = data
  } else if (out.data !== undefined) {
    delete out.data
  }
  return out as T
}

function cleanFrames(frames: unknown): unknown {
  if (!Array.isArray(frames)) return frames
  return frames.map((f) => {
    if (!isObj(f)) return f
    const frame: Obj = { ...f }
    delete frame.vars // local variables are app data
    for (const k of ['filename', 'abs_path']) if (typeof frame[k] === 'string') frame[k] = cleanUrl(frame[k] as string)
    return frame
  })
}

/** An error or transaction event: user-content fields cleaned, app data dropped, Sentry's
 *  own fields untouched. */
export function scrubSentryEvent<T extends object>(event: T): T {
  const e: Obj = { ...(event as Obj) }
  delete e.extra
  delete e.user
  if (typeof e.message === 'string') e.message = scrubText(e.message)
  if (isObj(e.logentry)) {
    const log: Obj = { ...e.logentry }
    if (typeof log.message === 'string') log.message = scrubText(log.message)
    delete log.params
    e.logentry = log
  }
  if (typeof e.transaction === 'string') e.transaction = cleanTransaction(e.transaction)
  if (isObj(e.request)) {
    const r = e.request
    const ua = isObj(r.headers) ? (r.headers['User-Agent'] ?? r.headers['user-agent']) : undefined
    e.request = {
      ...(typeof r.url === 'string' ? { url: cleanUrl(r.url) } : {}),
      ...(typeof r.method === 'string' ? { method: r.method } : {}),
      ...(typeof ua === 'string' ? { headers: { 'User-Agent': ua } } : {}),
    }
  }
  if (isObj(e.exception) && Array.isArray(e.exception.values)) {
    e.exception = {
      ...e.exception,
      values: e.exception.values.map((v) => {
        if (!isObj(v)) return v
        const ex: Obj = { ...v }
        if (typeof ex.value === 'string') ex.value = scrubText(ex.value)
        if (isObj(ex.stacktrace)) ex.stacktrace = { ...ex.stacktrace, frames: cleanFrames(ex.stacktrace.frames) }
        return ex
      }),
    }
  }
  if (Array.isArray(e.breadcrumbs)) {
    e.breadcrumbs = e.breadcrumbs.flatMap((b) => {
      const c = isObj(b) ? scrubSentryBreadcrumb(b) : null
      return c ? [c] : []
    })
  }
  if (isObj(e.tags)) e.tags = scrubSentryValue(e.tags)
  if (isObj(e.contexts)) {
    const kept: Obj = {}
    for (const [k, v] of Object.entries(e.contexts)) if (KEEP_CONTEXTS.has(k)) kept[k] = v
    if (isObj(kept.trace) && kept.trace.data !== undefined) kept.trace = { ...kept.trace, data: scrubSentryValue(kept.trace.data) }
    // The React component stack is app-supplied: cleaned line by line so it stays readable.
    if (isObj(kept.react) && typeof kept.react.componentStack === 'string') {
      kept.react = { ...kept.react, componentStack: kept.react.componentStack.split('\n').map((l) => scrubText(l)).join('\n') }
    }
    e.contexts = kept
  }
  if (Array.isArray(e.spans)) {
    e.spans = e.spans.map((s) => {
      if (!isObj(s)) return s
      const span: Obj = { ...s }
      if (typeof span.description === 'string') span.description = scrubText(span.description)
      if (span.data !== undefined) span.data = scrubSentryValue(span.data)
      return span
    })
  }
  return e as T
}
