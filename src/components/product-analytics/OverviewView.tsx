// Overview - what moved since the period before, then is the app being used
// at all, by how many, and how hard.
//
// The trend is ONE series (daily active users). Events per day is a second
// measure on a wildly different scale, so it gets its own small plot below
// rather than a second y-axis: two scales on one plot invent a correlation
// that is not in the data.

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Table as TableIcon, LineChart as LineChartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { featureLabel } from '@/lib/featureCatalog'
import { Delta, Empty, Loading, SectionCard, StatTile } from './parts'
import { compact, nf, pct } from './format'
import { TRACKING_BEGAN, priorCoverage, wholeDays, whatChanged, type FeatureMove } from './changes'
import { useDailyActive, useEventVolume, useFeatureAdoption, useUsageOverview } from './useProductAnalytics'

const axis = { stroke: 'hsl(var(--muted-foreground))', fontSize: 11, tickLine: false, axisLine: false } as const
const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(var(--foreground))',
}

const fullDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/**
 * Today is a partial day, and its short bar reads as a collapse rather than as
 * a day that is not over. Nothing here fakes the value; the note under the
 * chart says which point is still filling.
 */
function PartialToday({ series }: { series: { day: string }[] }) {
  const last = series[series.length - 1]?.day
  if (!last || last !== new Date().toISOString().slice(0, 10)) return null
  return <p className="mt-2 text-[11px] text-muted-foreground">The last point is today and still filling.</p>
}

export function OverviewView({ days }: { days: number }) {
  const overview = useUsageOverview(days)
  const daily = useDailyActive(days)
  const [asTable, setAsTable] = useState(false)

  const o = overview.data
  // Everyone was "new" in the period that holds the start of tracking, so a
  // fall against it is an artefact (30d on 7 Nov read 7 against 15, down 53%).
  const newComparable = priorCoverage(days, Date.now()).kind === 'full'
  const series = useMemo(
    () => wholeDays(daily.data ?? [], days, Date.now()).map((r) => ({ ...r, label: dayLabel(r.day) })),
    [daily.data, days],
  )


  return (
    <div className="space-y-4">
      <WhatChanged days={days} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {overview.isLoading && !o ? (
          <>
            <Loading className="h-24" />
            <Loading className="h-24" />
            <Loading className="h-24" />
            <Loading className="h-24" />
          </>
        ) : (
          <>
            <StatTile
              emphasis
              label={`Active users / ${days}d`}
              value={nf.format(o?.active_users ?? 0)}
              delta={<Delta now={o?.active_users ?? 0} prior={o?.prior_active_users ?? 0} />}
              hint={`${pct(o?.active_users ?? 0, o?.total_profiles ?? 0)}% of ${nf.format(o?.total_profiles ?? 0)} accounts`}
            />
            <StatTile
              label="Stickiness"
              value={`${pct(o?.dau_avg ?? 0, o?.mau ?? 0)}%`}
              hint={`${o?.dau_avg ?? 0} daily, ${nf.format(o?.wau ?? 0)} weekly, ${nf.format(o?.mau ?? 0)} monthly`}
            />
            <StatTile
              label="New this period"
              value={nf.format(o?.new_users ?? 0)}
              delta={newComparable ? <Delta now={o?.new_users ?? 0} prior={o?.prior_new_users ?? 0} /> : undefined}
              hint={
                newComparable
                  ? 'First event ever landed in this window'
                  : `First event ever landed in this window. Not compared: tracking began ${fullDate(TRACKING_BEGAN)}`
              }
            />
            <StatTile
              label="Events"
              value={compact(o?.events ?? 0)}
              delta={<Delta now={o?.events ?? 0} prior={o?.prior_events ?? 0} />}
              hint={`${nf.format(Math.round((o?.events ?? 0) / Math.max(1, o?.active_users ?? 1)))} per active person`}
            />
          </>
        )}
      </div>

      <SectionCard
        title="Daily active users"
        hint="Anyone whose client or assistant recorded an event that day."
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-9 xl:h-8 gap-1.5 text-xs"
            onClick={() => setAsTable((v) => !v)}
            aria-pressed={asTable}
          >
            {asTable ? <LineChartIcon className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
            {asTable ? 'Chart' : 'Table'}
          </Button>
        }
      >
        {daily.isLoading && series.length === 0 ? (
          <Loading className="h-56" />
        ) : series.length === 0 ? (
          <Empty>No events recorded in this window.</Empty>
        ) : asTable ? (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                  <TableHead className="text-right">Feature opens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...series].reverse().map((d) => (
                  <TableRow key={d.day}>
                    <TableCell className="font-medium">{d.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.users}</TableCell>
                    <TableCell className="text-right tabular-nums">{nf.format(d.events)}</TableCell>
                    <TableCell className="text-right tabular-nums">{nf.format(d.feature_opens)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-56 -ml-2" style={{ opacity: daily.isFetching ? 0.6 : 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dau-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" {...axis} minTickGap={24} />
                <YAxis {...axis} width={32} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  formatter={(v: number) => [nf.format(v), 'Active users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#dau-fill)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {!asTable && series.length > 0 && <PartialToday series={series} />}
      </SectionCard>

      <div>
        <SectionCard title="Events per day" hint="Volume, not people. A spike with flat users is usually a render loop.">
          {daily.isLoading && series.length === 0 ? (
            <Loading className="h-40" />
          ) : series.length === 0 ? (
            <Empty>Nothing recorded yet.</Empty>
          ) : (
            <div className="h-40 -ml-2" style={{ opacity: daily.isFetching ? 0.6 : 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" {...axis} minTickGap={32} />
                  <YAxis {...axis} width={38} tickFormatter={compact} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                    formatter={(v: number) => [nf.format(v), 'Events']}
                  />
                  <Line
                    type="monotone"
                    dataKey="events"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <PartialToday series={series} />
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  )
}

/**
 * The three biggest gains and losses in people, and any tracker that went
 * silent. Sits first because "what moved?" is what the tab is opened for; the
 * Features table is where the full ranking lives.
 */
function WhatChanged({ days }: { days: number }) {
  const adoption = useFeatureAdoption(days)
  const volume = useEventVolume(days)
  const now = Date.now()
  const summary = useMemo(
    () => whatChanged(adoption.data ?? [], volume.data ?? [], days, Date.now()),
    [adoption.data, volume.data, days],
  )
  const coverage = priorCoverage(days, now)
  const loading = (adoption.isLoading && !adoption.data) || (volume.isLoading && !volume.data)
  const nothingBefore = coverage.kind === 'none' || !summary.comparable

  return (
    <SectionCard
      testId="what-changed"
      title="What changed"
      hint={`People, against the ${days} days before. A screen nobody opened in that period is not compared.`}
    >
      {loading ? (
        <Loading className="h-28" />
      ) : nothingBefore ? (
        <p className="text-sm text-muted-foreground" data-testid="changed-none">
          Nothing to compare yet: tracking began {fullDate(TRACKING_BEGAN)}, inside this window.
          {days > 30 ? ' Pick 30d or 7d for a period against the one before.' : ''}
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <MoveList title="Gained" moves={summary.gained} testId="changed-gained" />
            <MoveList title="Lost" moves={summary.lost} testId="changed-lost" />
            <div data-testid="changed-stopped" className="min-w-0">
              <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Stopped firing</h3>
              {summary.stopped.length === 0 ? (
                <p className="text-sm text-muted-foreground">None</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.stopped.map((e) => (
                    <li key={e} className="text-sm min-w-0 truncate">
                      <code className="text-xs">{e}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {coverage.kind === 'partial' && (
            <p className="mt-3 text-[11px] text-muted-foreground" data-testid="changed-partial">
              Only {coverage.days} of the {days} days before are on record (tracking began {fullDate(TRACKING_BEGAN)}), so
              gains read high.
            </p>
          )}
          {(summary.firstReported > 0 || summary.rescoped.length > 0) && (
            <p className="mt-3 text-[11px] text-muted-foreground" data-testid="changed-first">
              Not ranked:
              {summary.firstReported > 0 &&
                ` ${summary.firstReported} ${summary.firstReported === 1 ? 'screen' : 'screens'} nobody opened in the period before.`}
              {summary.rescoped.length > 0 &&
                ` ${summary.rescoped.map(featureLabel).join(', ')}, which now counts fewer pages than it did.`}
            </p>
          )}
        </>
      )}
    </SectionCard>
  )
}

function MoveList({ title, moves, testId }: { title: string; moves: FeatureMove[]; testId: string }) {
  return (
    <div data-testid={testId} className="min-w-0">
      <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      {moves.length === 0 ? (
        <p className="text-sm text-muted-foreground">None</p>
      ) : (
        <ul className="space-y-1.5">
          {moves.map((m) => (
            <li key={m.feature} data-feature={m.feature} className="flex items-baseline gap-2 text-sm min-w-0">
              <span className="font-medium truncate">{featureLabel(m.feature)}</span>
              <span className="ml-auto shrink-0 tabular-nums text-xs text-muted-foreground">
                {m.prior} to {m.users}
              </span>
              <span
                className={`shrink-0 w-9 text-right tabular-nums text-xs font-semibold ${
                  m.change > 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {m.change > 0 ? '+' : '-'}{Math.abs(m.change)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
