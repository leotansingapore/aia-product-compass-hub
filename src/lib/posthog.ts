// PostHog: session replay and click/pageview analytics for the FINternship
// academy (Leo, 2026-10-05: "add posthog to all apps with users"). A copy of
// the ActivityTracker install. app_events and the admin Product tab stay the
// source for feature adoption; this adds what they cannot see: anonymous
// visits, funnels across the signup, and replays.
//
// Privacy is the whole design. Screens here show learners' names, scores,
// assignment answers and roleplay transcripts, and the case vault describes
// real client appointments, so:
// - replay masks every input, every text node and every human-readable
//   attribute, and blocks images and video outright;
// - autocapture keeps no element text and no attributes, and no event carries
//   the page title;
// - network timing and payloads, console logs, copied text, exception capture
//   and the /flags call are off, whatever the project settings say:
//   Supabase request URLs carry filter values,
//   and Sentry already has the errors;
// - every URL that leaves (event properties, link hrefs in $elements_chain and
//   the replay's page href) loses its hash (magic links and password resets
//   land with #access_token=...), its query string except utm_*, and any path
//   segment that looks like an id or a token (/playbooks/share/<token>);
// - a link to any other site keeps only its origin (a LinkedIn or
//   client-site path names people);
// - logs and network capture are dropped in code, because the project's own
//   settings would otherwise win over a local "off";
// - no cookie: PostHog persists to localStorage on this origin only;
// - people are identified by user id only, never email or name.
//
// Sent straight to us.i.posthog.com, never through a rewrite on our domain: a
// proxy there forwards the browser's cookies along with every event. The
// project token is public by design (it only lets a browser send events in).
//
// Loaded dynamically from main.tsx after the first render, so the SDK never
// sits in the entry chunk. Runs only on the production host, never under
// automation, and drops everything while a demo or test account is signed in.

import posthog, { type CaptureResult, type CapturedNetworkRequest } from 'posthog-js'
import { supabase } from '@/integrations/supabase/client'
import { ADDRESS_SCHEME, PRODUCTION_HOST, scrubUrl } from './scrubUrl'
import { linkPostHogSession } from './telemetryLink'

export { scrubUrl }

const KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || 'phc_ASWcvPVSHR7n7tsss2szQ3kaVFzSMbFbo3dW2DQ9kL4G'

// The demo accounts in src/config/authConfig.ts (all @demo.com), plus the
// shared test domains.
const TEST_EMAIL = /(@demo\.com|@mailinator\.com|@example\.com|\.test|\.demo|\.invalid)$/i

/** Every string and every object key, at any depth: heatmaps key their data by
 *  the page URL and web vitals nest a copy of the metric with its own URLs. */
function scrubDeep(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') return scrubUrl(value)
  if (value === null || typeof value !== 'object' || depth > 8) return value
  if (Array.isArray(value)) return value.map((v) => scrubDeep(v, depth + 1))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) {
    const key = scrubUrl(k)
    const next = scrubDeep(v, depth + 1)
    const prev = out[key]
    out[key] = Array.isArray(prev) && Array.isArray(next) ? [...prev, ...next] : next
  }
  return out
}

let excluded = false

const CHAIN_HREF = /((?:attr__)?href)="((?:[^"\\]|\\.)*)"/g

/** before_send: drop while a test account is signed in, scrub every URL. */
export function scrubEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || excluded) return null
  delete event.properties.title
  // Replay batches are handled below; walking a whole DOM snapshot is too slow.
  const { $snapshot_data: snapshots, ...props } = event.properties
  event.properties = scrubDeep(props) as typeof event.properties
  if (snapshots !== undefined) event.properties.$snapshot_data = snapshots
  const chain = event.properties.$elements_chain
  if (typeof chain === 'string') {
    event.properties.$elements_chain = chain.replace(CHAIN_HREF, (_, k, v) => `${k}="${scrubUrl(v)}"`)
  }
  if (event.$set) event.$set = scrubDeep(event.$set) as typeof event.$set
  if (event.$set_once) event.$set_once = scrubDeep(event.$set_once) as typeof event.$set_once
  // Replay batches carry the page address in rrweb Meta events (type 4).
  if (Array.isArray(snapshots)) {
    for (const s of snapshots) {
      if (s?.type === 4 && typeof s.data?.href === 'string') s.data.href = scrubUrl(s.data.href)
    }
  }
  return event
}

// What a replay needs to draw the page. Every other attribute value is masked
// unless it is a URL, which is scrubbed: title, aria-label, value and data-*
// carry names and answers.
const LAYOUT_ATTRIBUTES = new Set([
  'class', 'id', 'type', 'role', 'tabindex', 'dir', 'lang', 'name', 'for', 'rel', 'media',
  'width', 'height', 'colspan', 'rowspan', 'disabled', 'checked', 'selected', 'hidden', 'open',
  'viewBox', 'xmlns', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'points', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'transform', 'opacity',
  'data-state', 'data-side', 'data-align', 'data-orientation', 'data-disabled', 'data-highlighted',
  'aria-hidden', 'aria-expanded', 'aria-selected', 'aria-checked', 'aria-disabled', 'aria-pressed',
  'aria-current', 'aria-haspopup', 'aria-modal', 'aria-orientation',
])

const CSS_URL = /url\((['"]?)(.*?)\1\)/g

/** Replay attributes: layout kept, URLs scrubbed (url() in a style too),
 *  everything else masked. */
export function maskAttribute(name: string, value: string): string {
  // Inline styles and rrweb's inlined stylesheet text: keep the CSS, scrub its url()s.
  if (name === 'style' || name === '_cssText') return value.replace(CSS_URL, (_, qt, u) => `url(${qt}${scrubUrl(u)}${qt})`)
  // rrweb's own bookkeeping (a blocked element's size and position); never canvas pixels.
  if (name.startsWith('rr_') && name !== 'rr_dataURL') return value
  if (LAYOUT_ATTRIBUTES.has(name)) return value
  if ((name === 'href' || name === 'xlink:href') && value.startsWith('#')) return value // in-page and SVG <use> refs
  if (/^(https?:\/\/|\/)/i.test(value) || ADDRESS_SCHEME.test(value)) return scrubUrl(value)
  return '*'.repeat(Math.min(value.length, 12))
}

/** Replay network hook. recordHeaders/recordBody false lose to the project
 *  setting (client OR server), so every network entry is dropped here. But
 *  posthog-js also sends each replay page address through this hook, as
 *  { name } alone (the Meta event with the URL and window size); dropping
 *  that broke playback, so a lone name is kept, scrubbed. */
export function maskNetworkEntry(entry: CapturedNetworkRequest): CapturedNetworkRequest | null {
  const keys = Object.keys(entry)
  return keys.length === 1 && keys[0] === 'name' && typeof entry.name === 'string'
    ? { ...entry, name: scrubUrl(entry.name) }
    : null
}

export function isTestEmail(email: string | null | undefined): boolean {
  return TEST_EMAIL.test((email ?? '').trim())
}

export function isProductionHost(hostname: string): boolean {
  return PRODUCTION_HOST.test(hostname)
}

export async function initPostHog(): Promise<void> {
  if (!KEY) return
  if (!isProductionHost(window.location.hostname)) return
  if (navigator.webdriver) return
  if (window.self !== window.top) return // previews and embeds are not visits

  // Read the stored session first (local, no network) so the very first
  // pageview is already attributed, or already dropped for a test account.
  const { data } = await supabase.auth.getSession()
  const signedIn = data.session?.user
  excluded = isTestEmail(signedIn?.email)

  posthog.init(KEY, {
    bootstrap: signedIn && !excluded ? { distinctID: signedIn.id, isIdentifiedID: true } : undefined,
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-08-30',
    person_profiles: 'identified_only',
    mask_all_text: true,
    autocapture: { capture_copied_text: false },
    mask_all_element_attributes: true,
    mask_personal_data_properties: true,
    disable_capture_url_hashes: true,
    capture_performance: { network_timing: false, web_vitals: true },
    enable_recording_console_log: false,
    capture_exceptions: false,
    // No feature flags here, and /flags carries the first page's raw URL as a
    // person property, outside before_send. This switch blocks every /flags
    // call; advanced_disable_flags would also kill remote config, and with it
    // the project's "record sessions" setting, so replay would never start.
    advanced_disable_feature_flags: true,
    // No cookie at all: PostHog would otherwise keep the first page's raw URL in a
    // year-long cookie on the parent domain, sent with every request to it.
    persistence: 'localStorage',
    cross_subdomain_cookie: false,
    // The project's Logs setting can switch console capture on and a local false
    // does not override it, so every log record is dropped here instead.
    logs: { captureConsoleLogs: false, beforeSend: () => null },
    session_recording: {
      sampleRate: 1,
      maskAllInputs: true,
      recordHeaders: false,
      recordBody: false,
      maskTextSelector: '*',
      blockSelector: 'img, video, picture, canvas, iframe',
      maskAttributeFn: maskAttribute,
      maskCapturedNetworkRequestFn: maskNetworkEntry,
    },
    before_send: scrubEvent,
  })
  // Sentry tags each error with this session (telemetryLink.ts), so a fixer can read
  // what led up to it. Demo and test accounts are not recorded, so they get no link.
  linkPostHogSession(() => (excluded ? undefined : posthog.get_session_id()))

  // Fires INITIAL_SESSION straight away, then on every sign-in and sign-out.
  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user
    if (!user) {
      excluded = false
      if (event === 'SIGNED_OUT') posthog.reset()
      return
    }
    excluded = isTestEmail(user.email)
    if (!excluded) posthog.identify(user.id)
  })
}
