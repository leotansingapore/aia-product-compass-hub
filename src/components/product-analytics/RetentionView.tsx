// Retention - does anyone come back, and how deep does engagement go.
//
// The triangle is a heatmap, which means colour is carrying magnitude, so it
// is one hue light-to-dark and every cell also prints its own number. Nothing
// here is readable by colour alone.

import { useMemo } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Empty, Loading, MiniBar, SectionCard } from './parts'
import { nf, pct } from './format'
import { useRetentionCohorts, useUserEngagement } from './useProductAnalytics'

const WEEKS = 8

const weekLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/**
 * One hue, light to dark, five steps - and capped at 0.45 alpha on purpose.
 * Past roughly half strength the cell lands in a band where neither the ink
 * token nor its inverse clears 4.5:1 against it (measured: 2.9:1 for white on
 * primary/0.62 over the light card), and the theme flips which one is wrong.
 * Holding the fill light keeps ONE text token correct in both themes, and the
 * percentage is printed in every cell anyway, so colour is never the only
 * encoding here.
 */
function cellStyle(share: number): React.CSSProperties {
  if (share === 0) return { backgroundColor: 'hsl(var(--muted) / 0.4)' }
  const step = share >= 80 ? 0.45 : share >= 60 ? 0.34 : share >= 40 ? 0.24 : share >= 20 ? 0.14 : 0.06
  return { backgroundColor: `hsl(var(--primary) / ${step})` }
}

export function RetentionView({ days }: { days: number }) {
  const cohorts = useRetentionCohorts(WEEKS)
  const engagement = useUserEngagement(days)

  const grid = useMemo(() => {
    const rows = cohorts.data ?? []
    const byWeek = new Map<string, { size: number; cells: Map<number, number> }>()
    for (const r of rows) {
      const entry = byWeek.get(r.cohort_week) ?? { size: r.cohort_size, cells: new Map() }
      entry.cells.set(r.week_offset, r.users)
      byWeek.set(r.cohort_week, entry)
    }
    return [...byWeek.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([week, v]) => ({ week, size: v.size, cells: v.cells }))
  }, [cohorts.data])

  const maxOffset = useMemo(
    () => Math.min(WEEKS - 1, Math.max(0, ...(cohorts.data ?? []).map((r) => r.week_offset))),
    [cohorts.data],
  )

  const buckets = engagement.data ?? []
  const maxBucket = Math.max(1, ...buckets.map((b) => b.users))
  const totalBucketed = buckets.reduce((a, b) => a + b.users, 0)

  // Week-1 return, counting only cohorts old enough to have had a week 1. The
  // current week's cohort has not had the chance yet, and including it drags
  // the number down by exactly the amount of time that has not passed.
  const weekOne = useMemo(() => {
    const cutoff = Date.now() - 7 * 86_400_000
    const eligible = grid.filter((g) => new Date(`${g.week}T00:00:00Z`).getTime() <= cutoff)
    return {
      size: eligible.reduce((a, g) => a + g.size, 0),
      back: eligible.reduce((a, g) => a + (g.cells.get(1) ?? 0), 0),
    }
  }, [grid])

  return (
    <div className="space-y-4">
      <SectionCard
        title="Weekly retention"
        hint="Each row is the people whose first ever event landed that week. Week 0 is always everyone, so week 1 is the number that matters."
      >
        {cohorts.isLoading && grid.length === 0 ? (
          <Loading className="h-56" />
        ) : grid.length === 0 ? (
          <Empty>Nobody has signed up inside the last {WEEKS} weeks.</Empty>
        ) : (
          <>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-xs border-separate border-spacing-[2px] min-w-[32rem]">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-muted-foreground py-1 pr-2 whitespace-nowrap">Joined</th>
                    <th className="text-right font-medium text-muted-foreground py-1 pr-2">People</th>
                    {Array.from({ length: maxOffset + 1 }, (_, i) => (
                      <th key={i} className="font-medium text-muted-foreground py-1 w-12 text-center">
                        W{i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row) => (
                    <tr key={row.week}>
                      <td className="pr-2 whitespace-nowrap font-medium">{weekLabel(row.week)}</td>
                      <td className="pr-2 text-right tabular-nums text-muted-foreground">{row.size}</td>
                      {Array.from({ length: maxOffset + 1 }, (_, i) => {
                        const users = row.cells.get(i)
                        if (users === undefined) return <td key={i} />
                        const share = pct(users, row.size)
                        return (
                          <td
                            key={i}
                            className={cn('text-center tabular-nums rounded py-1.5', share === 0 && 'text-muted-foreground')}
                            style={cellStyle(share)}
                            title={`${users} of ${row.size} back in week ${i}`}
                          >
                            {share}%
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {weekOne.size > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Across every cohort old enough to have a week 1, {weekOne.back} of {weekOne.size} came back:{' '}
                <span className="font-semibold text-foreground">{pct(weekOne.back, weekOne.size)}%</span>.
              </p>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard
        title="How many days people showed up"
        hint={`Distinct active days per person over the last ${days} days. A wall on the left is a product people try once.`}
      >
        {engagement.isLoading && buckets.length === 0 ? (
          <Loading className="h-40" />
        ) : buckets.length === 0 ? (
          <Empty>Nobody active in this window.</Empty>
        ) : (
          <div className="space-y-2.5">
            {buckets.map((b) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium shrink-0">{b.bucket}</span>
                <div className="flex-1 min-w-0">
                  <MiniBar value={b.users} max={maxBucket} />
                </div>
                <span className="w-24 text-right text-[11px] text-muted-foreground tabular-nums shrink-0">
                  {nf.format(b.users)} ({pct(b.users, totalBucketed)}%)
                </span>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" aria-hidden />
              {nf.format(totalBucketed)} people active in the window.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
