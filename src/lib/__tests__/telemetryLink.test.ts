import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { linkPostHogSession, withPostHogSession } from '@/lib/telemetryLink'
import { scrubSentryEvent } from '@/lib/sentryScrub'

const SESSION = '0199b1c2-7d4e-7a1b-9c3d-2e5f6a7b8c9d'
type Ev = { tags?: Record<string, unknown>; request?: { url?: string; query_string?: unknown } }

describe('Sentry errors carry the PostHog session they happened in', () => {
  beforeEach(() => linkPostHogSession(() => undefined))

  it('tags the event when PostHog has a session, and the cleaner keeps the tag', () => {
    linkPostHogSession(() => SESSION)
    const raw: Ev = { tags: { area: 'roleplay' }, request: { url: 'https://academy.finternship.com/playbooks/share/9f86d081884c7d65' } }
    const event = scrubSentryEvent(withPostHogSession(raw))
    expect(event.tags).toEqual({ area: 'roleplay', posthog_session: SESSION })
  })

  it('adds nothing when PostHog is off, returns junk, or throws', () => {
    expect(withPostHogSession<Ev>({ tags: {} }).tags).toEqual({})
    linkPostHogSession(() => 'not a session id <script>')
    expect(withPostHogSession<Ev>({}).tags).toBeUndefined()
    linkPostHogSession(() => { throw new Error('posthog not ready') })
    expect(withPostHogSession<Ev>({}).tags).toBeUndefined()
  })

  it('is wired: PostHog registers its session, Sentry tags errors with it', () => {
    expect(readFileSync('src/lib/posthog.ts', 'utf8')).toMatch(/linkPostHogSession\(\(\) => \(excluded \? undefined : posthog\.get_session_id\(\)\)\)/)
    expect(readFileSync('src/lib/sentry.ts', 'utf8')).toMatch(/beforeSend: \(event\) => scrubSentryEvent\(withPostHogSession\(event\)\)/)
  })
})
