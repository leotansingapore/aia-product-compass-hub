import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyLinkButton } from "@/components/aia-training/CopyLinkButton";
import { RequirementBadge } from "@/components/aia-training/RequirementBadge";
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

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" });

/** One day's sessions in a popup, with arrows to the previous and next day that has sessions. */
function DayPopup({
  iso,
  list,
  prevDay,
  nextDay,
  focusId,
  isToday,
  note,
  sectionTitle,
  onNavigate,
  onClose,
  onClearSearch,
}: {
  iso: string;
  list: CalEvent[];
  prevDay?: string;
  nextDay?: string;
  focusId?: string;
  isToday: boolean;
  note: string;
  sectionTitle: Map<string, string>;
  onNavigate: (iso: string) => void;
  onClose: () => void;
  onClearSearch?: () => void;
}) {
  const focusRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (focusId) focusRef.current?.scrollIntoView({ block: "nearest" });
  }, [focusId, iso]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        // aia-viz: the popup renders in a portal outside the tab, so it needs the path colours itself.
        className="aia-viz max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-lg gap-4 overflow-y-auto rounded-2xl p-5 outline-none focus-visible:shadow-lg focus-visible:outline-none sm:p-6"
        // Focus the dialog, not its first arrow: no stray focus ring on open, and the arrow keys still work.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && prevDay) onNavigate(prevDay);
          if (e.key === "ArrowRight" && nextDay) onNavigate(nextDay);
        }}
      >
        <DialogHeader className="space-y-0 text-left">
          <div className="flex items-center gap-1 pr-7">
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Previous day with sessions" disabled={!prevDay} onClick={() => prevDay && onNavigate(prevDay)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1 text-center">
              <DialogTitle className="font-serif text-lg leading-snug">{longDate(iso)}</DialogTitle>
              <DialogDescription>
                {list.length} {list.length === 1 ? "session" : "sessions"}
                {isToday && ", today"}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Next day with sessions" disabled={!nextDay} onClick={() => nextDay && onNavigate(nextDay)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {list.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 py-8 text-center text-sm">
            <p className="font-medium">No sessions on this day match your search</p>
            {onClearSearch && (
              <Button variant="link" onClick={onClearSearch}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((e, i) => {
              const focused = e.course.id === focusId;
              return (
                <li
                  key={`${e.course.id}-${i}`}
                  ref={focused ? focusRef : undefined}
                  className={cn("rounded-xl border bg-card p-3.5 transition-shadow", focused && "ring-2 ring-primary/40")}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: lane(laneOf(e.course.section)) }} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="font-semibold leading-snug">{e.course.title}</p>
                      {e.label && <p className="text-sm">{e.label}</p>}
                      <p className="text-xs text-muted-foreground">
                        {[sectionTitle.get(e.course.section), e.course.cpd ? `CPD hours: ${e.course.cpd}` : null].filter(Boolean).join(". ")}
                      </p>
                      {(e.course.requirement || e.course.isNew) && (
                        <div className="flex flex-wrap gap-1.5">
                          <RequirementBadge course={e.course} />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                          <Link to={courseUrl(e.course.id)}>
                            Open course
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <CopyLinkButton path={courseUrl(e.course.id)} label={`Copy a link to ${e.course.title}`} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">{note}</p>
      </DialogContent>
    </Dialog>
  );
}

export default function AiaTrainingCalendar({
  dir,
  month,
  query,
  stage,
  day,
  onMonth,
  onDay,
  onQuery,
  onStage,
}: {
  dir: Directory;
  month: number;
  query: string;
  stage: StageFilter;
  /** YYYY-MM-DD of the open day popup, from the URL. */
  day?: string;
  onMonth: (m: number) => void;
  onDay: (iso: string | null) => void;
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
  // The session the reader clicked a chip for; the popup outlines it. Local, so only the day lives in the URL.
  const [focusId, setFocusId] = useState<string | undefined>();
  const openDay = (iso: string, courseId?: string) => {
    setFocusId(courseId);
    onDay(iso);
  };
  const days = [...byDay.keys()];
  const dayIndex = day ? days.indexOf(day) : -1;
  const popupOpen = day !== undefined && day.startsWith(prefix);
  const prevDay = popupOpen ? (dayIndex >= 0 ? days[dayIndex - 1] : [...days].reverse().find((d) => d < day!)) : undefined;
  const nextDay = popupOpen ? (dayIndex >= 0 ? days[dayIndex + 1] : days.find((d) => d > day!)) : undefined;

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

      {/* Month grid. Every day with sessions opens its popup; on wider screens each chip opens the popup on that session.
          The chips only appear above 768px because the hub gives every button a 44px minimum at 768px and below. */}
      <div className="overflow-hidden rounded-2xl border bg-card" role="grid" aria-label={`${MONTH_NAMES[month - 1]} ${year}`}>
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground" role="row">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2" role="columnheader">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b last:border-b-0" role="row">
            {week.map((iso, di) => {
              const list = iso ? byDay.get(iso) ?? [] : [];
              const has = list.length > 0;
              const isToday = iso === today;
              const past = iso !== null && iso < today;
              const selected = iso !== null && iso === day;
              const label = iso ? `${dayLabel(iso)}, ${list.length ? `${list.length} ${list.length === 1 ? "session" : "sessions"}` : "no sessions"}` : "";
              const num = iso ? Number(iso.slice(8)) : 0;
              const dateDot = (
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                    isToday ? "bg-primary font-bold text-primary-foreground" : has ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {num}
                </span>
              );
              return (
                <div
                  key={iso ?? `pad-${wi}-${di}`}
                  role="gridcell"
                  aria-selected={selected || undefined}
                  className={cn(
                    "relative min-h-[3.25rem] border-r last:border-r-0 min-[769px]:min-h-[6.75rem]",
                    !iso && "bg-muted/20",
                    past && "opacity-55",
                    selected && "bg-primary/5 ring-2 ring-inset ring-primary/40",
                  )}
                >
                  {iso && (
                    <>
                      <button
                        type="button"
                        disabled={!has}
                        onClick={() => openDay(iso)}
                        aria-label={label}
                        className="flex h-full w-full flex-col items-start gap-1 p-1 text-left transition-colors enabled:active:bg-muted min-[769px]:hidden"
                      >
                        {dateDot}
                        <span className="flex flex-wrap gap-0.5" aria-hidden>
                          {list.slice(0, 4).map((e, i) => (
                            <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: lane(laneOf(e.course.section)) }} />
                          ))}
                        </span>
                      </button>
                      <div
                        onClick={has ? () => openDay(iso) : undefined}
                        className={cn(
                          "hidden h-full flex-col gap-1 p-1.5 min-[769px]:flex",
                          has && "cursor-pointer transition-colors hover:bg-muted/50",
                        )}
                      >
                        <button
                          type="button"
                          disabled={!has}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openDay(iso);
                          }}
                          aria-label={label}
                          className="w-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {dateDot}
                        </button>
                        {list.slice(0, PER_CELL).map((e, i) => (
                          <button
                            key={`${e.course.id}-${i}`}
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openDay(iso, e.course.id);
                            }}
                            title={`${e.course.title}${e.label ? `, ${e.label}` : ""}`}
                            className="truncate rounded px-1.5 py-0.5 text-left text-xs leading-4 transition-shadow hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            style={{ background: `color-mix(in srgb, ${lane(laneOf(e.course.section))} 16%, transparent)` }}
                          >
                            {chipTitle(e.course.title)}
                          </button>
                        ))}
                        {list.length > PER_CELL && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openDay(iso);
                            }}
                            className="w-fit px-1 text-left text-xs font-medium text-primary hover:underline"
                          >
                            +{list.length - PER_CELL} more
                          </button>
                        )}
                      </div>
                    </>
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

      {popupOpen && (
        <DayPopup
          iso={day!}
          list={byDay.get(day!) ?? []}
          prevDay={prevDay}
          nextDay={nextDay}
          focusId={focusId}
          isToday={day === today}
          note={dir.scheduleNote}
          sectionTitle={sectionTitle}
          onNavigate={(iso) => openDay(iso)}
          onClose={() => {
            setFocusId(undefined);
            onDay(null);
          }}
          onClearSearch={
            filtered
              ? () => {
                  onQuery("");
                  onStage("all");
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
