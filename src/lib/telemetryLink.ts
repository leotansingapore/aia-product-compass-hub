// Ties a Sentry error to the PostHog session it happened in, so a fixer can read the
// pages and clicks that led up to it (replays stay fully masked). posthog.ts registers
// the getter once PostHog runs; sentry.ts reads it. This file imports nothing, so
// neither SDK's chunk pulls in the other.
let getSession: (() => string | undefined) | null = null

export function linkPostHogSession(getter: () => string | undefined): void {
  getSession = getter
}

/** The current PostHog session id, or undefined when PostHog is off (test accounts, automation, previews). */
export function currentPostHogSession(): string | undefined {
  try {
    const id = getSession?.()
    return typeof id === 'string' && /^[0-9a-f-]{20,40}$/i.test(id) ? id : undefined
  } catch {
    return undefined
  }
}

/** The event with a posthog_session tag added when there is a session. */
export function withPostHogSession<T extends { tags?: Record<string, unknown> }>(event: T): T {
  const id = currentPostHogSession()
  return id ? { ...event, tags: { ...event.tags, posthog_session: id } } : event
}
