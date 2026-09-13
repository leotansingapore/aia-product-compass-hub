// The small pieces every Product view is built from. Kept here so a stat tile
// on Overview and a stat tile on Features cannot drift apart, and so the one
// decision that matters - what a rise or a fall is allowed to look like - is
// made once.

import { type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { nf } from './format'

/**
 * Change against the period immediately before. `invert` is for the rows where
 * a rise is the bad news (errors), so the colour always means good or bad and
 * never just up or down.
 */
export function Delta({ now, prior, invert = false, className }: { now: number; prior: number; invert?: boolean; className?: string }) {
  if (prior === 0 && now === 0) return null
  const isNew = prior === 0
  const change = isNew ? 100 : Math.round(((now - prior) / prior) * 100)
  const flat = !isNew && Math.abs(change) < 5
  const good = flat ? null : invert ? change < 0 : change > 0
  const Icon = flat ? Minus : change > 0 ? ArrowUp : ArrowDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums',
        good === null && 'text-muted-foreground',
        good === true && 'text-success',
        good === false && 'text-destructive',
        className,
      )}
      title={`${nf.format(now)} this period against ${nf.format(prior)} the period before`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden />
      {isNew ? 'new' : flat ? 'flat' : `${Math.abs(change)}%`}
    </span>
  )
}

export function StatTile({
  label,
  value,
  hint,
  delta,
  emphasis = false,
}: {
  label: string
  value: string
  hint?: string
  delta?: ReactNode
  emphasis?: boolean
}) {
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4 bg-card min-w-0', emphasis && 'border-primary/40 bg-primary/[0.04]')}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold leading-none">{value}</span>
        {delta}
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-muted-foreground leading-snug">{hint}</div>}
    </div>
  )
}

/** One hue, length is the only encoding. A 4px rounded end, anchored at zero. */
export function MiniBar({ value, max, muted = false }: { value: number; max: number; muted?: boolean }) {
  const w = max > 0 ? Math.max(value > 0 ? 2 : 0, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 rounded-full bg-muted/60 overflow-hidden" aria-hidden>
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', muted ? 'bg-muted-foreground/40' : 'bg-primary')}
        style={{ width: `${w}%` }}
      />
    </div>
  )
}

export function SectionCard({
  title,
  hint,
  action,
  children,
  className,
  testId,
}: {
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  testId?: string
}) {
  return (
    <Card className={className} data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {hint && <p className="text-xs text-muted-foreground mt-1 leading-snug">{hint}</p>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function Loading({ className }: { className?: string }) {
  return <div className={cn('rounded-lg bg-muted/40 animate-pulse', className ?? 'h-32')} />
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{children}</p>
}
