/**
 * Local calendar-day helpers.
 *
 * Anything user-facing that says "today" — daily XP limits, streaks,
 * "you already did this today" — has to use the *browser's* calendar day.
 * `new Date().toISOString().split('T')[0]` does not: it is UTC, so in
 * Singapore (UTC+8) the day rolls over at 08:00 local. A learner who studied
 * at 21:00 and came back at 07:00 the next morning was told they'd already
 * done today's quiz, and their streak was computed against the wrong day.
 *
 * No offset is hardcoded anywhere here — everything derives from the runtime's
 * own timezone via the Date accessors.
 */

/** Midnight at the start of `date`'s local calendar day. */
export function startOfLocalDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * `date`'s local calendar day as `YYYY-MM-DD`.
 *
 * Use for comparing against, and writing to, `date` columns such as
 * `profiles.last_active_date`.
 */
export function localDayIso(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `days` calendar days from `date` (negative goes backwards). */
export function addDays(days: number, date: Date = new Date()): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * The exact UTC instant at which the local day began, as an ISO timestamp.
 *
 * Use for `timestamptz` filters (`.gte('completed_at', ...)`) — passing a bare
 * `YYYY-MM-DD` there would be read as midnight *UTC* by Postgres and reopen
 * the same skew this module exists to close.
 */
export function startOfLocalDayIso(date: Date = new Date()): string {
  return startOfLocalDay(date).toISOString();
}
