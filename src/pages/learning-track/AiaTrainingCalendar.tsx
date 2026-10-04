import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courseSearchText, type Directory, type StageFilter } from "@/features/aia-training-directory/filter";
import { courseUrl } from "@/features/aia-training-directory/links";
import { laneOf } from "@/features/aia-training-directory/overview";
import { buildCalendar, chipTitle, monthWeeks, type CalEvent } from "@/features/aia-training-directory/sessions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STAGES: { value: StageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New consultants" },
  { value: "experienced", label: "Experienced" },
  { value: "leaders", label: "Leaders" },
];
const lane = (i: number) => `var(--lane-${i + 1})`;
const PER_CELL = 3;

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" });

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}


export default function AiaTrainingCalendar({
  dir,
  month,
  query,
  stage,
  onMonth,
  onQuery,
  onStage,
}: {
  dir: Directory;
  month: number;
  query: string;
  stage: StageFilter;
  onMonth: (m: number) => void;
  onQuery: (q: string) => void;
  onStage: (s: StageFilter) => void;
}) {
  const year = dir.scheduleYear;
  const today = todayIso();
  const thisMonth = today.startsWith(String(year)) ? Number(today.slice(5, 7)) : 0;
  const cal = useMemo(() => buildCalendar(dir), [dir]);
  const stageOf = useMemo(() => new Map(dir.sections.map((s) => [s.id, s.stage])), [dir]);
  const sectionTitle = useMemo(() => new Map(dir.sections.map((s) => [s.id, s.title])), [dir]);
  // Same search text as the Courses tab, so "HNW" finds courses titled "High Net Worth...".
  const searchText = useMemo(() => {
    const sections = new Map(dir.sections.map((s) => [s.id, s]));
    return new Map(dir.courses.map((c) => [c.id, courseSearchText(c, sections.get(c.section))]));
  }, [dir]);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (e: { course: CalEvent["course"]; label?: string }) => {
    if (stage !== "all" && stageOf.get(e.course.section) !== stage) return false;
    if (!terms.length) return true;
    const text = `${searchText.get(e.course.id) ?? ""} ${e.label ?? ""}`.toLowerCase();
    return terms.every((t) => text.includes(t));
  };

  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const events = cal.events.filter((e) => e.date.startsWith(prefix) && matches(e));
  const windows = cal.windows.filter((w) => month >= w.from && month <= w.to && matches(w));
  const tbc = cal.tbc.filter((t) => t.month === month && matches(t));
  const byDay = new Map<string, CalEvent[]>();
  for (const e of events) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  const weeks = monthWeeks(year, month);
  const filtered = terms.length > 0 || stage !== "all";
  const jump = (iso: string) => document.getElementById(`aia-day-${iso}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous month" disabled={month === 1} onClick={() => onMonth(month - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[10.5rem] text-center font-serif text-lg font-bold" aria-live="polite">
            {MONTH_NAMES[month - 1]} {year}
          </h3>
          <Button variant="ghost" size="icon" aria-label="Next month" disabled={month === 12} onClick={() => onMonth(month + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {thisMonth > 0 && month !== thisMonth && (
          <Button variant="outline" size="sm" onClick={() => onMonth(thisMonth)}>
            This month
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search, like FTS or HNW"
            aria-label="Search the calendar"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Career stage">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={stage === s.value}
              onClick={() => onStage(s.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                stage === s.value ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {events.length} {events.length === 1 ? "session" : "sessions"} in {MONTH_NAMES[month - 1]}
          {filtered && (
            <>
              {", "}
              <button
                type="button"
                onClick={() => {
                  onQuery("");
                  onStage("all");
                }}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                clear search
              </button>
            </>
          )}
        </p>
      </div>

      {/* Month grid: chips on wide screens, dots on phones. Tapping a day jumps to it in the list below. */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((iso, di) => {
              const list = iso ? byDay.get(iso) ?? [] : [];
              const isToday = iso === today;
              const past = iso !== null && iso < today;
              return (
                <div
                  key={iso ?? `pad-${wi}-${di}`}
                  className={cn("min-h-[3.25rem] border-r p-1 last:border-r-0 md:min-h-[6.5rem] md:p-1.5", !iso && "bg-muted/20", past && "opacity-55")}
                >
                  {iso && (
                    <div
                      onClick={list.length ? () => jump(iso) : undefined}
                      className={cn("flex h-full flex-col gap-1", list.length && "cursor-pointer")}
                      title={list.length ? `${dayLabel(iso)}: ${list.length} ${list.length === 1 ? "session" : "sessions"}` : undefined}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                          isToday ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {Number(iso.slice(8))}
                      </span>
                      <span className="flex flex-wrap gap-0.5 md:hidden" aria-hidden>
                        {list.slice(0, 4).map((e, i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: lane(laneOf(e.course.section)) }} />
                        ))}
                      </span>
                      <span className="hidden flex-col gap-0.5 md:flex">
                        {list.slice(0, PER_CELL).map((e, i) => (
                          <span
                            key={i}
                            className="truncate rounded px-1 py-0.5 text-xs leading-4"
                            style={{ background: `color-mix(in srgb, ${lane(laneOf(e.course.section))} 14%, transparent)` }}
                          >
                            {chipTitle(e.course.title)}
                          </span>
                        ))}
                        {list.length > PER_CELL && <span className="px-1 text-xs font-medium text-primary">+{list.length - PER_CELL} more</span>}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {(windows.length > 0 || tbc.length > 0) && (
        <div className="space-y-2 rounded-2xl border bg-muted/30 p-4 text-sm">
          {windows.length > 0 && (
            <div>
              <p className="mb-1 font-semibold">Open all month</p>
              <ul className="space-y-1">
                {windows.map((w) => (
                  <li key={w.course.id} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: lane(laneOf(w.course.section)) }} />
                    <span>
                      <Link to={courseUrl(w.course.id)} className="font-medium underline-offset-2 hover:underline">
                        {w.course.title}
                      </Link>
                      <span className="text-muted-foreground">, {w.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tbc.length > 0 && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Date to be confirmed:{" "}
                {tbc.map((t, i) => (
                  <span key={t.course.id}>
                    {i > 0 && ", "}
                    <Link to={courseUrl(t.course.id)} className="font-medium text-foreground underline-offset-2 hover:underline">
                      {t.course.title}
                    </Link>
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-10 text-center">
          <p className="font-medium">
            {filtered ? `No sessions match in ${MONTH_NAMES[month - 1]}` : `No dated sessions in ${MONTH_NAMES[month - 1]}`}
          </p>
          {filtered && (
            <Button
              variant="link"
              onClick={() => {
                onQuery("");
                onStage("all");
              }}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <ol className="space-y-3" aria-label={`Sessions in ${MONTH_NAMES[month - 1]}`}>
          {[...byDay.entries()].map(([iso, list]) => (
            <li key={iso} id={`aia-day-${iso}`} className={cn("scroll-mt-24", iso < today && "opacity-60")}>
              <p className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold">
                {dayLabel(iso)}
                {iso === today && <span className="rounded-full bg-primary px-2 text-xs font-medium leading-5 text-primary-foreground">Today</span>}
                <span className="text-xs font-normal text-muted-foreground">
                  {list.length} {list.length === 1 ? "session" : "sessions"}
                </span>
              </p>
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {list.map((e, i) => (
                  <li key={`${e.course.id}-${i}`}>
                    <Link
                      to={courseUrl(e.course.id)}
                      className="group flex items-start gap-3 px-3 py-2 transition-colors hover:bg-foreground/[0.03]"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: lane(laneOf(e.course.section)) }} />
                      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-medium leading-snug">{e.course.title}</span>
                        {e.label && <span className="text-xs text-muted-foreground">{e.label}</span>}
                      </span>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-muted-foreground">
        {dir.scheduleNote} BTS1 shows each batch's start; classes then run every Wednesday, Thursday and Friday.
      </p>
    </div>
  );
}
