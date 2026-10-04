import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/InfoTip";
import {
  EMPTY_FILTERS,
  MONTHS,
  filterCourses,
  type Course,
  type Directory,
} from "@/features/aia-training-directory/filter";
import {
  LANES,
  MAP_ROWS,
  cpdFloor,
  laneOf,
  laneSegments,
  monthMatrix,
  sessionsInMonth,
} from "@/features/aia-training-directory/overview";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Metro geometry, in px. Station dots sit on the first line of their label.
const laneX = (lane: number) => 10 + lane * 14;
const RAIL = laneX(LANES.length - 1) + 12;
const DOT_Y = 18;
const lane = (i: number) => `var(--lane-${i + 1})`;
const PREVIEW = 6;

function Pip({ course, color }: { course: Course; color: string }) {
  const base = "inline-block h-2 w-2";
  if (course.requirement === "mandatory") return <span title={course.title} className={base} style={{ background: color }} />;
  if (course.requirement === "essential") return <span title={course.title} className={cn(base, "rounded-full")} style={{ background: color }} />;
  return <span title={course.title} className={cn(base, "rounded-full border-[1.5px]")} style={{ borderColor: color }} />;
}

function CareerLine({ dir, onOpenSection }: { dir: Directory; onOpenSection: (id: string) => void }) {
  const [focus, setFocus] = useState<number | null>(null);
  const segments = useMemo(() => laneSegments(MAP_ROWS), []);
  const sectionById = useMemo(() => new Map(dir.sections.map((s) => [s.id, s])), [dir]);
  const coursesBySection = useMemo(() => {
    const m = new Map<string, Course[]>();
    for (const c of dir.courses) m.set(c.section, [...(m.get(c.section) ?? []), c]);
    return m;
  }, [dir]);
  const laneCounts = LANES.map((l) => l.sections.reduce((n, s) => n + (coursesBySection.get(s)?.length ?? 0), 0));
  const dim = (l: number) => (focus === null || focus === l ? 1 : 0.15);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="aia-career-line">
      <h3 id="aia-career-line" className="font-serif text-lg font-bold">
        Your career line
      </h3>

      <div
        className="flex h-3 gap-[2px]"
        role="img"
        aria-label={`Courses per path: ${LANES.map((l, i) => `${l.name} ${laneCounts[i]}`).join(", ")}`}
      >
        {LANES.map((l, i) => (
          <div
            key={l.id}
            title={`${l.name}: ${laneCounts[i]} courses`}
            className={cn("transition-opacity", i === 0 && "rounded-l-[4px]", i === LANES.length - 1 && "rounded-r-[4px]")}
            style={{ flexGrow: laneCounts[i], background: lane(i), opacity: dim(i) }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trace a path on the map">
        {LANES.map((l, i) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={focus === i}
            onClick={() => setFocus(focus === i ? null : i)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
              focus === i ? "border-foreground bg-foreground/5" : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: lane(i) }} />
            {l.name}
            <span className="font-normal">{laneCounts[i]}</span>
          </button>
        ))}
      </div>

      <ol className="relative">
        {MAP_ROWS.map((row, r) => (
          <li key={r} className="relative" style={{ paddingLeft: RAIL }}>
            {segments[r].map((s, l) => (
              <span key={l} aria-hidden style={{ opacity: dim(l) }} className="transition-opacity">
                {s.top && (
                  <span className="absolute w-1" style={{ left: laneX(l) - 2, top: 0, height: DOT_Y, background: lane(l) }} />
                )}
                {s.bottom && (
                  <span className="absolute w-1" style={{ left: laneX(l) - 2, top: DOT_Y, bottom: 0, background: lane(l) }} />
                )}
              </span>
            ))}

            {row.kind === "stage" && (
              <div className="py-2 pl-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
            )}

            {row.kind === "interchange" && (
              <>
                <span
                  aria-hidden
                  className="absolute rounded-full border-2 border-foreground bg-card"
                  style={{ left: laneX(0) - 9, width: laneX(LANES.length - 1) - laneX(0) + 18, top: DOT_Y - 9, height: 18 }}
                />
                <div className="pb-3 pl-2 pt-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{row.label}</p>
                  <p className="text-sm font-semibold">Choose your path</p>
                  <p className="text-xs text-muted-foreground">{row.note}</p>
                </div>
              </>
            )}

            {row.kind === "station" &&
              (() => {
                const section = sectionById.get(row.section)!;
                const courses = coursesBySection.get(row.section) ?? [];
                const cpd = Math.round(courses.reduce((n, c) => n + (c.cpdHours ?? 0), 0));
                return (
                  <>
                    <span
                      aria-hidden
                      className="absolute h-3.5 w-3.5 rounded-full border-[3px] bg-card transition-opacity"
                      style={{ left: laneX(row.lane) - 7, top: DOT_Y - 7, borderColor: lane(row.lane), opacity: dim(row.lane) }}
                    />
                    <button
                      type="button"
                      onClick={() => onOpenSection(section.id)}
                      aria-label={`${section.code} ${section.title}, ${courses.length} courses. Show them`}
                      className="group my-0.5 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-[background-color,opacity] hover:bg-muted/60"
                      style={{ opacity: focus === null || focus === row.lane ? 1 : 0.35 }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-5">
                          <span className="mr-1.5 text-xs font-medium text-muted-foreground">{section.code}</span>
                          {section.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {courses.length} {courses.length === 1 ? "course" : "courses"}
                          {cpd > 0 && ` | ${cpd} CPD hours`}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-[3px]" aria-hidden>
                          {courses.map((c) => (
                            <Pip key={c.id} course={c} color={lane(row.lane)} />
                          ))}
                        </span>
                      </span>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </>
                );
              })()}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 bg-muted-foreground" /> Mandatory
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Essential
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-[1.5px] border-muted-foreground" /> Other
        </span>
        <span>One mark per course</span>
      </div>
    </section>
  );
}

function YearHeatmap({ dir, onSeeUpcoming }: { dir: Directory; onSeeUpcoming: () => void }) {
  const today = new Date();
  const inYear = today.getFullYear() === dir.scheduleYear;
  const thisMonth = inYear ? today.getMonth() + 1 : 0;
  const [month, setMonth] = useState(inYear ? thisMonth : 1);
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => monthMatrix(dir), [dir]);
  const perMonth = useMemo(() => MONTHS.map((_, m) => sessionsInMonth(dir, m + 1).length), [dir]);
  const busiest = perMonth.indexOf(Math.max(...perMonth));
  const sessions = useMemo(() => sessionsInMonth(dir, month), [dir, month]);
  const upcoming = useMemo(() => filterCourses(dir, { ...EMPTY_FILTERS, upcoming: true }, today).length, [dir]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = showAll ? sessions : sessions.slice(0, PREVIEW);
  const pick = (m: number) => {
    setMonth(m);
    setShowAll(false);
  };

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="aia-year">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="aia-year" className="font-serif text-lg font-bold">
          {dir.scheduleYear} at a glance
        </h3>
        <p className="text-xs text-muted-foreground">
          Busiest: {MONTHS[busiest]} ({perMonth[busiest]} courses)
        </p>
      </div>

      <table className="w-full table-fixed border-separate" style={{ borderSpacing: 2 }}>
        <caption className="sr-only">Courses running each month in {dir.scheduleYear}, by programme area</caption>
        <colgroup>
          <col className="w-[3.25rem] sm:w-56" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              Programme area
            </th>
            {MONTHS.map((name, m) => (
              <th
                key={name}
                scope="col"
                abbr={MONTH_NAMES[m]}
                onClick={() => pick(m + 1)}
                className={cn(
                  "cursor-pointer pb-1 text-xs font-medium",
                  m + 1 === month ? "text-foreground" : "text-muted-foreground",
                  m + 1 === thisMonth && "font-bold",
                )}
              >
                <span className="sm:hidden">{name[0]}</span>
                <span className="hidden sm:inline">{name}</span>
                {m + 1 === thisMonth && <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-primary" aria-label="this month" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ section, lane: l, months }) => (
            <tr key={section.id}>
              <th scope="row" className="truncate pr-1 text-left text-xs font-normal" title={`${section.code} ${section.title}`}>
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: lane(l) }} />
                <span className="font-medium">{section.code}</span>
                <span className="hidden text-muted-foreground sm:inline"> {section.title}</span>
              </th>
              {months.map((courses, m) => {
                const n = courses.length;
                return (
                  <td
                    key={m}
                    onClick={() => pick(m + 1)}
                    title={n ? `${MONTHS[m]}, ${section.code}: ${courses.map((c) => c.title).join("; ")}` : undefined}
                    className="cursor-pointer p-0"
                  >
                    <div
                      className={cn(
                        "h-5 rounded-[3px] transition-shadow",
                        !n && "bg-muted",
                        m + 1 < thisMonth && "opacity-40",
                        m + 1 === month && "ring-[1.5px] ring-foreground/50",
                      )}
                      style={n ? { background: `var(--heat-${Math.min(n, 5)})` } : undefined}
                    />
                    <span className="sr-only">
                      {n} {n === 1 ? "course" : "courses"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-[2px] bg-muted" /> None
        </span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-[2px]" style={{ background: `var(--heat-${n})` }} />
            {n === 5 ? "5+" : n}
          </span>
        ))}
        <span>courses running</span>
        {inYear && <span>| past months faded</span>}
      </div>

      <div className="rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous month" disabled={month === 1} onClick={() => pick(month - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-center text-sm font-semibold" aria-live="polite">
            {MONTH_NAMES[month - 1]} {dir.scheduleYear}
            <span className="font-normal text-muted-foreground">
              {" | "}
              {sessions.length} {sessions.length === 1 ? "course" : "courses"}
              {inYear && month < thisMonth && " (past)"}
            </span>
          </p>
          <Button variant="ghost" size="icon" aria-label="Next month" disabled={month === 12} onClick={() => pick(month + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ul className="mt-1 divide-y">
          {shown.map(({ course, entry }) => (
            <li key={course.id} className="flex gap-2 py-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: lane(laneOf(course.section)) }} />
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug">{course.title}</span>
                <span className="block break-words text-xs text-muted-foreground">{entry.when}</span>
              </span>
            </li>
          ))}
        </ul>
        {sessions.length > PREVIEW && (
          <Button variant="link" className="h-auto px-0" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show fewer" : `Show all ${sessions.length}`}
          </Button>
        )}
      </div>

      {upcoming > 0 && (
        <Button className="w-full sm:w-auto" onClick={onSeeUpcoming}>
          See all {upcoming} courses with sessions ahead
        </Button>
      )}
    </section>
  );
}

export default function AiaTrainingOverview({
  dir,
  onOpenSection,
  onSeeUpcoming,
}: {
  dir: Directory;
  onOpenSection: (sectionId: string) => void;
  onSeeUpcoming: () => void;
}) {
  const stats = [
    { value: String(dir.sections.length), label: "programme areas" },
    { value: `${cpdFloor(dir)}+`, label: "CPD hours on offer", tip: "Published CPD hours for one run of each course, added up." },
    { value: String(dir.courses.filter((c) => c.schedule?.length).length), label: `with ${dir.scheduleYear} dates` },
    { value: String(dir.courses.filter((c) => c.isNew).length), label: `new for ${dir.scheduleYear}` },
  ];

  return (
    <div className="aia-viz space-y-4 font-sans">
      <section aria-label="At a glance" className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-end gap-3">
          <p className="shrink-0 text-5xl font-semibold leading-none tracking-tight">{dir.courses.length}</p>
          <p className="pb-1 text-sm leading-snug text-muted-foreground">courses, from licensing to leading an agency</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-xl font-semibold leading-tight">{s.value}</dd>
              <dd className="flex items-center whitespace-nowrap text-xs text-muted-foreground">
                {s.label}
                {s.tip && <InfoTip label="How CPD hours are counted">{s.tip}</InfoTip>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <CareerLine dir={dir} onOpenSection={onOpenSection} />
      <YearHeatmap dir={dir} onSeeUpcoming={onSeeUpcoming} />
    </div>
  );
}
