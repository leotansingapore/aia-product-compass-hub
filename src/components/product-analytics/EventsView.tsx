// Events - every named event the app and its assistants emit, with the change
// against the period before.
//
// Two kinds of row live here and they read in opposite directions. A rise in
// `askai_q` is the product working; a rise in `lark_error` is the product
// failing. Error rows are separated out and their deltas inverted, so the
// colour on this screen always means good or bad and never merely up or down.

import { useMemo, useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Delta, Empty, Loading, MiniBar, SectionCard } from './parts'
import { nf, sinceLabel } from './format'
import { useEventVolume, type EventVolumeRow } from './useProductAnalytics'

const isError = (event: string) => /error|fail|blocked/i.test(event)

/** What fires the event, so a quiet row can be blamed on the right thing. */
function sourceOf(event: string): string {
  if (event.startsWith('tg_')) return 'Telegram'
  if (event.startsWith('lark')) return 'Lark'
  if (event.startsWith('web_') || event.startsWith('assistant')) return 'Assistant'
  return 'App'
}

export function EventsView({ days }: { days: number }) {
  const volume = useEventVolume(days)
  const [q, setQ] = useState('')

  const rows = useMemo(() => volume.data ?? [], [volume.data])
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return needle ? rows.filter((r) => r.event.toLowerCase().includes(needle)) : rows
  }, [rows, q])

  const errors = filtered.filter((r) => isError(r.event))
  const normal = filtered.filter((r) => !isError(r.event))
  const max = Math.max(1, ...normal.map((r) => r.n))
  // Only a tracker with real volume behind it. askai_down fired ONCE in its
  // whole life; calling its silence a regression is how a warning banner
  // becomes wallpaper.
  const QUIET_FLOOR = 10
  const silent = rows.filter((r) => r.n === 0 && r.prior_n >= QUIET_FLOOR)

  return (
    <div className="space-y-4">
      {silent.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/[0.06] p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm min-w-0">
            <span className="font-semibold">Stopped firing: </span>
            {silent.map((r) => r.event).join(', ')}
            <span className="block text-xs text-muted-foreground mt-0.5">
              Each fired at least {QUIET_FLOOR} times in the period before and not once in this one. Usually a rename or a
              regression in the tracker, not a change in behaviour.
            </span>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <SectionCard testId="error-events" title="Error events" hint="A rise here is bad news, so these deltas are read the other way up.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">People</TableHead>
                <TableHead className="text-right">vs prior</TableHead>
                <TableHead className="text-right">Last</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((r) => (
                <EventRow key={r.event} row={r} max={max} invert />
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <SectionCard
        testId="all-events"
        title="All events"
        hint={`Everything recorded in the last ${days} days, whether it came from the app, the Telegram assistant or a Lark job.`}
        action={
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter events"
              aria-label="Filter events"
              className="h-9 w-40 sm:w-48 pl-8 text-sm"
            />
          </div>
        }
      >
        {volume.isLoading && rows.length === 0 ? (
          <Loading className="h-64" />
        ) : normal.length === 0 ? (
          <Empty>{q ? `No event matches "${q}".` : 'No events recorded in this window.'}</Empty>
        ) : (
          <div className="overflow-x-auto" style={{ opacity: volume.isFetching ? 0.6 : 1 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[9rem]">Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">People</TableHead>
                  <TableHead className="text-right">vs prior</TableHead>
                  <TableHead className="text-right">Last</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normal.map((r) => (
                  <EventRow key={r.event} row={r} max={max} showSource />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function EventRow({
  row, max, invert = false, showSource = false,
}: {
  row: EventVolumeRow
  max: number
  invert?: boolean
  showSource?: boolean
}) {
  return (
    <TableRow>
      <TableCell className="py-2 font-medium">
        <code className="text-xs">{row.event}</code>
      </TableCell>
      {showSource && (
        <TableCell className="py-2 hidden sm:table-cell text-xs text-muted-foreground">{sourceOf(row.event)}</TableCell>
      )}
      <TableCell className="py-2">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-16 hidden sm:block">
            <MiniBar value={row.n} max={max} muted={invert} />
          </div>
          <span className="tabular-nums w-14 text-right">{nf.format(row.n)}</span>
        </div>
      </TableCell>
      <TableCell className="py-2 text-right tabular-nums text-muted-foreground">{row.users}</TableCell>
      <TableCell className="py-2 text-right">
        <Delta now={row.n} prior={row.prior_n} invert={invert} />
      </TableCell>
      <TableCell className="py-2 text-right text-[11px] text-muted-foreground whitespace-nowrap">
        {sinceLabel(row.last_seen)}
      </TableCell>
    </TableRow>
  )
}
