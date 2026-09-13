// analytics - the lightest possible product-event tracker, ported from
// remix-of-activity-tracker on 2026-09-13 (Leo: "know which features users
// are using"). Fire-and-forget inserts into app_events; every call swallows
// its own errors so a blocked network never breaks a user flow. Raw rows are
// RLS-locked to the author; Admin -> Product reads only aggregates.
//
// THE PROJECT IS SHARED with the CMFAS exam prep app. Every row this app
// writes carries props.app = 'academy', every RPC takes the app first and
// filters on it, so neither panel reads the other product's usage.
//
// What we DON'T record: names, answers, submissions, free text. props
// is a feature key and the app stamp. Keep it that way. Localhost is skipped:
// a developer's machine hits the same production database.

import { supabase } from '@/integrations/supabase/client'

type EventName = 'feature_open'
const APP = 'academy'

let tableMissing = false

export function trackEvent(event: EventName, props: Record<string, string | number | boolean> = {}): void {
  if (tableMissing) return
  void (async () => {
    try {
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return
      const { data } = await supabase.auth.getUser()
      const uid = data?.user?.id
      if (!uid) return // signed-in only; a share-link viewer without a session is not tracked
      // The generated types do not carry app_events; the cast keeps the insert
      // honest without regenerating a large file for one table.
      const { error } = await (supabase as unknown as {
        from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { code?: string } | null }> }
      }).from('app_events').insert({ user_id: uid, event, props: { ...props, app: APP } })
      if (error && (error.code === '42P01' || error.code === 'PGRST205')) tableMissing = true
    } catch {
      /* offline or blocked; analytics is never load-bearing */
    }
  })()
}

// Feature opens fire on every route change; dedupe to once per feature per
// page load so a tab-happy user does not drown the signal.
const openedThisSession = new Set<string>()

export function trackFeatureOpen(feature: string): void {
  if (openedThisSession.has(feature)) return
  openedThisSession.add(feature)
  trackEvent('feature_open', { feature })
}
