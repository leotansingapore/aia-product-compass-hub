// Turns the catalogue's schedule lines ("Day: 5 and 6 (F2F, Alex); 10 and 11
// (WV)...") into dated calendar events. The lines are AIA's own wording, kept
// as the source of truth; this reads the handful of shapes they come in.
import type { Course, Directory, ScheduleEntry } from "./filter";

export interface CalEvent {
  /** YYYY-MM-DD */
  date: string;
  course: Course;
  /** "Night, virtual", "Batch 1, Bootcamp", "Batch starts"... */
  label?: string;
}

/** A self-paced or always-open course: no single day, open across these months. */
export interface CalWindow {
  course: Course;
  from: number;
  to: number;
  label: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MODES: Record<string, string> = { V: "virtual", WV: "weekend virtual" };

function describeMode(raw: string): string {
  if (MODES[raw]) return MODES[raw];
  const f2f = raw.match(/^F2F(?:,\s*(.+))?$/);
  if (f2f) return f2f[1] ? `face to face (${f2f[1]})` : "face to face";
  return raw;
}

const daysIn = (year: number, month: number) => new Date(year, month, 0).getDate();

/** One item such as "11 to 13 Mar Bootcamp" or "29 and 30 Sep, 1 Oct": the days, by month, and any trailing words. */
export function parseDays(item: string, fallbackMonth: number): { days: { month: number; day: number }[]; rest: string } {
  const days: { month: number; day: number }[] = [];
  const re = /\s*(\d{1,2}|[A-Za-z][A-Za-z0-9']*|[,&])/y;
  let pending: number[] = [];
  let prefixMonth: number | null = null;
  let range = false;
  let pos = 0;
  let m: RegExpExecArray | null;
  const push = (d: number) => (prefixMonth ? days.push({ month: prefixMonth, day: d }) : pending.push(d));
  let last = 0;
  while ((m = re.exec(item))) {
    const tok = m[1];
    const month = MONTHS.indexOf(tok) + 1;
    if (/^\d+$/.test(tok)) {
      const n = Number(tok);
      if (range) for (let d = last + 1; d <= n; d++) push(d);
      else push(n);
      last = n;
      range = false;
    } else if (tok === "to") {
      range = true;
    } else if (tok === "and" || tok === "," || tok === "&") {
      // separator
    } else if (month) {
      if (pending.length) {
        for (const d of pending) days.push({ month, day: d });
        pending = [];
      } else prefixMonth = month;
    } else {
      re.lastIndex = m.index; // the first ordinary word starts the trailing text
      break;
    }
    pos = re.lastIndex;
  }
  for (const d of pending) days.push({ month: fallbackMonth, day: d });
  return { days, rest: item.slice(pos).trim() };
}

/** Every dated session in one schedule line. Windows and TBC lines return no dates. */
export function parseEntry(entry: ScheduleEntry): { month: number; day: number; label?: string }[] {
  if (entry.endMonth || /^TBC$/i.test(entry.when.trim())) return [];
  // BTS1 lists every class day; the calendar shows the batch start, classes run every Wed, Thu and Fri.
  const batch = entry.when.match(/^Batch starts (\d{1,2}) ([A-Z][a-z]{2})\./);
  if (batch) return [{ month: MONTHS.indexOf(batch[2]) + 1, day: Number(batch[1]), label: "Batch starts" }];

  const out: { month: number; day: number; label?: string }[] = [];
  for (const sentence of entry.when.split(/\.\s+/)) {
    const head = sentence.match(/^(Day|Night|PM only|Batch \d+):\s*/);
    const part = head?.[1];
    const body = head ? sentence.slice(head[0].length) : sentence;
    for (const raw of body.split(";")) {
      let item = raw.trim().replace(/\.$/, "");
      if (!item) continue;
      const paren = item.match(/\s*\(([^)]*)\)\s*$/);
      const mode = paren ? describeMode(paren[1]) : undefined;
      if (paren) item = item.slice(0, paren.index).trim();
      const { days, rest } = parseDays(item, entry.month);
      const label = [part, rest, mode].filter(Boolean).join(", ");
      for (const d of days) out.push({ ...d, label: label ? label[0].toUpperCase() + label.slice(1) : undefined });
    }
  }
  return out;
}

const iso = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** All dated sessions, the always-open windows and the to-be-confirmed courses, for the schedule year. */
export function buildCalendar(dir: Directory): { events: CalEvent[]; windows: CalWindow[]; tbc: { course: Course; month: number }[] } {
  const year = dir.scheduleYear;
  const events: CalEvent[] = [];
  const windows: CalWindow[] = [];
  const tbc: { course: Course; month: number }[] = [];
  for (const course of dir.courses) {
    if (course.scheduleNote) windows.push({ course, from: 1, to: 12, label: course.scheduleNote });
    for (const entry of course.schedule ?? []) {
      if (entry.endMonth) {
        windows.push({ course, from: entry.month, to: entry.endMonth, label: entry.when });
        continue;
      }
      if (/^TBC$/i.test(entry.when.trim())) {
        tbc.push({ course, month: entry.month });
        continue;
      }
      for (const s of parseEntry(entry)) {
        if (s.month < 1 || s.month > 12 || s.day < 1 || s.day > daysIn(year, s.month)) continue;
        events.push({ date: iso(year, s.month, s.day), course, label: s.label });
      }
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return { events, windows, tbc };
}

/** Weeks (Monday first) covering a month, each day as YYYY-MM-DD or null outside the month. */
export function monthWeeks(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysIn(year, month); d++) cells.push(iso(year, month, d));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * Short chip text for a day cell, the way consultants say it: "RES5 tutorial",
 * "FTS", "PPP". Uses the acronym AIA puts in brackets when there is one,
 * otherwise drops trailing qualifiers after a comma or colon.
 */
export function chipTitle(title: string): string {
  const cmfas = title.match(/^CMFAS Module (\w+) Tutorial$/);
  if (cmfas) return `${/^\d/.test(cmfas[1]) ? "M" : ""}${cmfas[1]} tutorial`;
  const acronym = title.match(/\(([A-Z][A-Z0-9]{1,5})[,)]/);
  if (acronym) return acronym[1];
  return title.split(/,\s|:\s/)[0];
}
