// Features - the answer to "which features are people actually using".
//
// Three things sit here, in the order a developer needs them:
//   1. The table. Reach, depth, repeat use and the change against the period
//      before, sortable, with a per-feature daily shape one click away.
//   2. The map. Reach against depth, split at the medians, because "40 people
//      opened it once" and "6 people live in it" are opposite problems and the
//      same row in a list.
//   3. The gaps. Screens the catalog knows about that nobody opened, and
//      screens that report nothing at all - so an absence in the table is
//      never mistaken for an absence of users.

import { Fragment, useMemo, useState } from 'react'
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts'
import { ChevronDown, ChevronUp, EyeOff, Moon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { FEATURE_CATALOG, UNTRACKED, featureArea, featureLabel } from '@/lib/featureCatalog'
import { Delta, Empty, Loading, MiniBar, SectionCard } from './parts'
import { nf, pct, sinceLabel } from './format'
import { useFeatureAdoption, useFeatureDetail, useUsageOverview, type FeatureAdoptionRow } from './useProductAnalytics'

type SortKey = 'feature' | 'users' | 'opens' | 'depth' | 'repeat' | 'trend'

const median = (xs: number[]): number => {
  if (xs.length === 0) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const depthOf = (r: FeatureAdoptionRow) => (r.users > 0 ? r.user_days / r.users : 0)
const trendOf = (r: FeatureAdoptionRow) => (r.prior_users > 0 ? (r.users - r.prior_users) / r.prior_users : r.users > 0 ? 1 : 0)

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(var(--foreground))',
}

export function FeaturesView({ days }: { days: number }) {
  const adoption = useFeatureAdoption(days)
  const overview = useUsageOverview(days)
  const [sort, setSort] = useState<SortKey>('users')
  const [open, setOpen] = useState<string | null>(null)

  const activeUsers = overview.data?.active_users ?? 0
  const rows = useMemo(() => adoption.data ?? [], [adoption.data])

  const sorted = useMemo(() => {
    const by: Record<SortKey, (r: FeatureAdoptionRow) => number | string> = {
      feature: (r) => featureLabel(r.feature),
      users: (r) => r.users,
      opens: (r) => r.opens,
      depth: depthOf,
      repeat: (r) => (r.users > 0 ? r.repeat_users / r.users : 0),
      trend: trendOf,
    }
    const pick = by[sort]
    return [...rows].sort((a, b) => {
      const av = pick(a)
      const bv = pick(b)
      return typeof av === 'string' ? av.localeCompare(bv as string) : (bv as number) - av
    })
  }, [rows, sort])

  const maxOpens = Math.max(1, ...rows.map((r) => r.opens))

  // Never recorded once. The RPC's base set is every feature in the whole
  // history, so a key missing from `rows` has genuinely never been seen - it is
  // a screen whose tracking was only just added, NOT a screen people abandoned.
  // Abandonment shows in the table above, as a row of zeroes with a last-seen
  // date. Collapsing the two was the easiest way to make this panel lie.
  const unseen = useMemo(() => {
    const seen = new Set(rows.map((r) => r.feature))
    return FEATURE_CATALOG.filter((f) => !seen.has(f.key))
  }, [rows])

  return (
    <div className="space-y-4">
      <SectionCard
        testId="feature-adoption"
        title="Feature adoption"
        hint={`Reach is the share of the ${nf.format(activeUsers)} people active in this window. Depth is days used per person who used it. Click a row for its daily shape.`}
      >
        {adoption.isLoading && rows.length === 0 ? (
          <Loading className="h-64" />
        ) : rows.length === 0 ? (
          <Empty>No feature opens recorded in this window.</Empty>
        ) : (
          <div className="overflow-x-auto" style={{ opacity: adoption.isFetching ? 0.6 : 1 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead label="Feature" k="feature" sort={sort} onSort={setSort} className="min-w-[9rem]" />
                  <SortHead label="Reach" k="users" sort={sort} onSort={setSort} align="right" />
                  <SortHead label="Depth" k="depth" sort={sort} onSort={setSort} align="right" />
                  <SortHead label="Came back" k="repeat" sort={sort} onSort={setSort} align="right" />
                  <SortHead label="Opens" k="opens" sort={sort} onSort={setSort} align="right" />
                  <SortHead label="vs prior" k="trend" sort={sort} onSort={setSort} align="right" />
                  <TableHead className="text-right whitespace-nowrap">Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => {
                  const isOpen = open === r.feature
                  return (
                    <Fragment key={r.feature}>
                      <TableRow
                        className={cn('cursor-pointer', isOpen && 'bg-muted/50')}
                        onClick={() => setOpen(isOpen ? null : r.feature)}
                      >
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                            <span className="font-medium truncate">{featureLabel(r.feature)}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 hidden sm:inline-flex">
                              {featureArea(r.feature)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className="tabular-nums font-semibold">{pct(r.users, activeUsers)}%</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">{r.users}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2 tabular-nums">{depthOf(r).toFixed(1)}d</TableCell>
                        <TableCell className="text-right py-2 tabular-nums">
                          {r.users > 0 ? `${pct(r.repeat_users, r.users)}%` : '-'}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 hidden sm:block">
                              <MiniBar value={r.opens} max={maxOpens} />
                            </div>
                            <span className="tabular-nums text-muted-foreground w-12 text-right">{nf.format(r.opens)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Delta now={r.users} prior={r.prior_users} />
                        </TableCell>
                        <TableCell className="text-right py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {sinceLabel(r.last_seen)}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <FeatureDetail feature={r.feature} row={r} days={days} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <ReachDepthMap rows={rows} activeUsers={activeUsers} loading={adoption.isLoading && rows.length === 0} />

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard
          testId="silent-features"
          title="Waiting for first data"
          hint="These screens report and nothing has landed yet. A screen whose tracking was added recently sits here until someone opens it. A screen people stopped using is in the table above, as a row of zeroes."
        >
          {unseen.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Every screen in the catalog has been opened at least once.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {unseen.map((f) => (
                <li key={f.key} className="flex items-center gap-2 text-sm min-w-0">
                  <Moon className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
                  <span className="truncate">{f.label}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">{f.area}</Badge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Reports nothing, on purpose"
          hint="So a gap above is always a product answer, never a missing tracker."
        >
          <ul className="space-y-1.5">
            {UNTRACKED.map((u) => (
              <li key={u.prefix} className="flex items-start gap-2 text-sm">
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                <span className="min-w-0">
                  <code className="text-xs">{u.prefix}</code>
                  <span className="block text-[11px] text-muted-foreground leading-snug">{u.why}</span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}

function SortHead({
  label, k, sort, onSort, align = 'left', className,
}: {
  label: string
  k: SortKey
  sort: SortKey
  onSort: (k: SortKey) => void
  align?: 'left' | 'right'
  className?: string
}) {
  const active = sort === k
  return (
    <TableHead className={cn(align === 'right' && 'text-right', className)}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          'h-9 xl:h-8 -my-1 px-1 rounded inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground',
          active ? 'text-foreground font-semibold' : 'text-muted-foreground',
        )}
        aria-pressed={active}
      >
        {label}
        {active && <ChevronDown className="w-3 h-3" aria-hidden />}
      </button>
    </TableHead>
  )
}

function FeatureDetail({ feature, row, days }: { feature: string; row: FeatureAdoptionRow; days: number }) {
  const detail = useFeatureDetail(feature, days)
  const series = (detail.data ?? []).map((d) => ({
    ...d,
    label: new Date(`${d.day}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  }))

  return (
    <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
      <div className="h-32 min-w-0 -ml-2">
        {detail.isLoading ? (
          <Loading className="h-full" />
        ) : series.length === 0 ? (
          <Empty>No opens in this window.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={26} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                formatter={(v: number, name) => [nf.format(v), name === 'users' ? 'People' : 'Opens']}
              />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <dl className="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-2 text-xs md:w-48">
        <Fact label="First ever opened" value={row.first_seen ? new Date(row.first_seen).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'never'} />
        <Fact label="New to it this period" value={`${row.new_users} ${row.new_users === 1 ? 'person' : 'people'}`} />
        <Fact label="Opens per person" value={row.users > 0 ? (row.opens / row.users).toFixed(1) : '-'} />
        <Fact label="Opens before" value={nf.format(row.prior_opens)} />
      </dl>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground truncate">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function ReachDepthMap({ rows, activeUsers, loading }: { rows: FeatureAdoptionRow[]; activeUsers: number; loading: boolean }) {
  const points = useMemo(
    () =>
      rows
        .filter((r) => r.users > 0)
        .map((r) => ({
          feature: r.feature,
          label: featureLabel(r.feature),
          reach: pct(r.users, activeUsers),
          depth: Number(depthOf(r).toFixed(2)),
          opens: r.opens,
        })),
    [rows, activeUsers],
  )

  const midReach = median(points.map((p) => p.reach))
  const midDepth = median(points.map((p) => p.depth))

  // Only the outliers carry a name: a label on every dot is unreadable at this
  // density, and the table above is the complete, WCAG-clean twin of the plot.
  // Ranking by distance alone is not enough - the extremes CLUSTER (four quiet
  // features all sit in the bottom-left corner), so two names land on top of
  // each other. A candidate is skipped when an already-named point is within
  // 12% of the plot's own width and height of it.
  const named = useMemo(() => {
    const maxDepth = Math.max(1, ...points.map((p) => p.depth))
    const norm = (p: (typeof points)[number]) => ({ x: p.reach, y: (p.depth / maxDepth) * 100 })
    const centre = { x: midReach, y: (midDepth / maxDepth) * 100 }
    const ranked = [...points].sort(
      (a, b) => Math.hypot(norm(b).x - centre.x, norm(b).y - centre.y) - Math.hypot(norm(a).x - centre.x, norm(a).y - centre.y),
    )
    const taken: { x: number; y: number }[] = []
    const out = new Set<string>()
    for (const p of ranked) {
      if (out.size >= 5) break
      const q = norm(p)
      if (taken.some((t) => Math.abs(t.x - q.x) < 12 && Math.abs(t.y - q.y) < 12)) continue
      taken.push(q)
      out.add(p.feature)
    }
    return out
  }, [points, midReach, midDepth])

  if (loading) return <SectionCard title="Reach against depth"><Loading className="h-72" /></SectionCard>
  if (points.length < 3) return null

  return (
    <SectionCard
      title="Reach against depth"
      hint="Split at the medians. Top right is load-bearing. Bottom right was opened once and left. Top left is a small group living in it. Bottom left is a candidate to cut."
    >
      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 14, right: 24, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="reach"
              name="Reach"
              unit="%"
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Share of active people', position: 'insideBottom', offset: -10, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="number"
              dataKey="depth"
              name="Depth"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={42}
              label={{ value: 'Days used each', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <ReferenceLine x={midReach} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.45} />
            <ReferenceLine y={midDepth} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.45} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.4 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload as (typeof points)[number]
                return (
                  <div style={tooltipStyle} className="px-2.5 py-2">
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-muted-foreground">
                      {p.reach}% of active people, {p.depth} days each, {nf.format(p.opens)} opens
                    </div>
                  </div>
                )
              }}
            />
            <Scatter data={points} shape={<DotWithName named={named} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

/**
 * A 6px dot with a 16px invisible hit ring, so hovering does not demand
 * landing dead centre, plus a name for the handful of outliers.
 */
function DotWithName(props: {
  named?: Set<string>
  cx?: number
  cy?: number
  payload?: { feature: string; label: string; reach: number }
}) {
  const { cx, cy, payload, named } = props
  if (cx == null || cy == null || !payload) return null
  const show = named?.has(payload.feature)
  // A name to the right of a dot near 100% runs off the plot on a phone. Past
  // the 65% line the name sits on the left instead.
  const left = payload.reach > 65
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill="transparent" />
      <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" fillOpacity={0.8} stroke="hsl(var(--card))" strokeWidth={2} />
      {show && (
        <text
          x={left ? cx - 10 : cx + 10}
          y={cy + 4}
          fontSize={11}
          textAnchor={left ? 'end' : 'start'}
          fill="hsl(var(--muted-foreground))"
          // Five names cannot fit honestly on a 300px plot; on a phone the
          // tooltip and the table above carry identity.
          className="hidden sm:block"
        >
          {payload.label}
        </text>
      )}
    </g>
  )
}
