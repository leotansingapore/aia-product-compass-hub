// Product analytics - the admin's view of what the product is actually used
// for. Ported from remix-of-activity-tracker on 2026-09-13.
//
// One filter row scopes everything below it: pick a window once and all four
// views answer for the same slice. The view itself lives in the URL so a
// finding can be pasted to someone, and a reload does not throw the reader
// back to the first tab.

import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { OverviewView } from './OverviewView'
import { FeaturesView } from './FeaturesView'
import { RetentionView } from './RetentionView'
import { EventsView } from './EventsView'
import { isNotMigrated, useUsageOverview } from './useProductAnalytics'

const RANGES = [7, 30, 90] as const
const VIEWS = ['overview', 'features', 'retention', 'events'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABEL: Record<View, string> = {
  overview: 'Overview',
  features: 'Features',
  retention: 'Retention',
  events: 'Events',
}

export function ProductAnalyticsPanel() {
  const [params, setParams] = useSearchParams()

  const view = (VIEWS.includes(params.get('view') as View) ? params.get('view') : 'overview') as View
  const daysParam = Number(params.get('days'))
  const days = RANGES.includes(daysParam as (typeof RANGES)[number]) ? daysParam : 30

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next, { replace: true })
  }

  // One cheap read decides whether the migration has landed here. Every other
  // query in every view uses the same gate, so a fresh database shows one
  // instruction instead of four broken cards.
  const probe = useUsageOverview(days)

  if (isNotMigrated(probe.error)) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <p className="text-sm font-semibold">Product analytics not migrated yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Apply <code>20260913120000_product_analytics.sql</code> and this fills in. Tracking keeps
            recording either way, so nothing is being lost in the meantime.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Product analytics</h2>
          <p className="text-xs text-muted-foreground">
            Which screens learners and their managers actually open. A developer's view, not learning progress.
          </p>
        </div>
        <div className="flex rounded-lg border p-0.5" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set('days', String(r))}
              aria-pressed={days === r}
              className={`h-9 px-3.5 rounded-md text-xs font-semibold transition-colors ${
                days === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => set('view', v)}>
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          {VIEWS.map((v) => (
            <TabsTrigger key={v} value={v} className="text-xs sm:text-sm">
              {VIEW_LABEL[v]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewView days={days} />
        </TabsContent>
        <TabsContent value="features" className="mt-4">
          <FeaturesView days={days} />
        </TabsContent>
        <TabsContent value="retention" className="mt-4">
          <RetentionView days={days} />
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <EventsView days={days} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
