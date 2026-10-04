import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Signpost } from "lucide-react";
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
import { JUNCTION, LANES, TRUNK, cpdFloor, laneOf, monthMatrix, sessionsInMonth } from "@/features/aia-training-directory/overview";
import { calendarUrl } from "@/features/aia-training-directory/links";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Line geometry, in px. Station dots sit on the first line of their label.
const LINE_X = 11;
const GUTTER = 34;
const DOT_Y = 20;
const lane = (i: number) => `var(--lane-${i + 1})`;
const tint = (i: number, pct: number) => `color-mix(in srgb, var(--lane-${i + 1}) ${pct}%, transparent)`;
const PREVIEW = 6;

/** Heatmap row names that fit a phone; tablet and up show the full section title. */
const SHORT_NAMES: Record<string, string> = {
  "02a": "Pre-contract",
  "02b": "Onboarding",
  "02c": "BTS 1",
  "02d": "BTS 2",
  "03a": "Activity",
  "03b": "Productivity",
  "03c": "Professional",
  "03d": "Health",
  "03e": "Regulatory",
  "03f": "MDRT",
  "03g": "Affluent, HNW",
  "03h": "Specialised",
  "04a": "Aspiring",
  "04b": "New leaders",
  "04c": "Exp. leaders",
};

/** Facts read like a short sentence; each one stays whole, so a wrap only ever falls after a comma. */
function Facts({ parts }: { parts: string[] }) {
  return (
    <span className="block text-sm text-muted-foreground">
      {parts.map((p, i) => (
        <span key={p}>
          <span className="whitespace-nowrap">
            {p}
            {i < parts.length - 1 && ","}
          </span>
          {i < parts.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

/** The line through one row: from the row's top to its dot, and from its dot to the row's bottom. */
function Rail({ color, top, bottom }: { color: string; top: boolean; bottom: boolean }) {
  return (
    <>
      {top && <span aria-hidden className="absolute w-1" style={{ left: LINE_X - 2, top: 0, height: DOT_Y, background: color }} />}
      {bottom && <span aria-hidden className="absolute w-1" style={{ left: LINE_X - 2, top: DOT_Y, bottom: 0, background: color }} />}
    </>
  );
}

function Station({
  sectionId,
  dir,
  courses,
  laneIndex,
  top,
  bottom,
  onOpen,
}: {
  sectionId: string;
  dir: Directory;
  courses: Course[];
  laneIndex: number;
  top: boolean;
  bottom: boolean;
  onOpen: (id: string) => void;
}) {
  const section = dir.sections.find((s) => s.id === sectionId)!;
  const color = lane(laneIndex);
  const mandatory = courses.filter((c) => c.requirement === "mandatory").length;
  const essential = courses.filter((c) => c.requirement === "essential").length;
  const cpd = Math.round(courses.reduce((n, c) => n + (c.cpdHours ?? 0), 0));
  const facts = [
    `${courses.length} ${courses.length === 1 ? "course" : "courses"}`,
    ...(mandatory ? [`${mandatory} mandatory`] : []),
    ...(essential ? [`${essential} essential`] : []),
    ...(cpd ? [`${cpd} CPD hours`] : []),
  ];
  return (
    <li className="relative" style={{ paddingLeft: GUTTER }}>
      <Rail color={color} top={top} bottom={bottom} />
      <span
        aria-hidden
        className="absolute h-4 w-4 rounded-full border-[3px] bg-card"
        style={{ left: LINE_X - 8, top: DOT_Y - 8, borderColor: color }}
      />
      <button
        type="button"
        onClick={() => onOpen(section.id)}
        aria-label={`${section.code} ${section.title}: ${facts.join(", ")}. Show these courses`}
        className="group flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-foreground/[0.04]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-6">{section.title}</span>
          <Facts parts={facts} />
          <span className="mt-2 flex flex-wrap gap-1" aria-hidden>
            {courses.map((c) => (
              <span
                key={c.id}
                title={c.title}
                className="h-2 w-2 rounded-full"
                style={{ background: c.requirement ? color : tint(laneIndex, 35) }}
              />
            ))}
          </span>
        </span>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </button>
    </li>
  );
}

function CareerLine({ dir, onOpenSection }: { dir: Directory; onOpenSection: (id: string) => void }) {
  const [focus, setFocus] = useState<number | null>(null);
  const coursesBySection = useMemo(() => {
    const m = new Map<string, Course[]>();
    for (const c of dir.courses) m.set(c.section, [...(m.get(c.section) ?? []), c]);
    return m;
  }, [dir]);
  const laneCounts = LANES.map((l) => l.sections.reduce((n, s) => n + (coursesBySection.get(s)?.length ?? 0), 0));
  const fade = (l: number) => (focus === null || focus === l ? 1 : 0.3);

  return (
    <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="aia-career-line">
      <div className="space-y-1">
        <h3 id="aia-career-line" className="font-serif text-lg font-bold">
          Your career line
        </h3>
        <p className="text-sm text-muted-foreground">Everyone starts on Foundation. From month 13, pick the paths that suit you.</p>
      </div>

      <div className="space-y-2.5">
        <div
          className="flex h-2.5 gap-[2px]"
          role="img"
          aria-label={`Courses per path: ${LANES.map((l, i) => `${l.name} ${laneCounts[i]}`).join(", ")}`}
        >
          {LANES.map((l, i) => (
            <div
              key={l.id}
              title={`${l.name}: ${laneCounts[i]} courses`}
              className={cn("transition-opacity", i === 0 && "rounded-l-full", i === LANES.length - 1 && "rounded-r-full")}
              style={{ flexGrow: laneCounts[i], background: lane(i), opacity: fade(i) }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Highlight a path">
          {LANES.map((l, i) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={focus === i}
              onClick={() => setFocus(focus === i ? null : i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                focus === i ? "border-foreground/40 bg-foreground/5 text-foreground" : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: lane(i) }} />
              {l.name}
              <span className="text-muted-foreground">{laneCounts[i]}</span>
            </button>
          ))}
        </div>
      </div>

      <ol className="transition-opacity" style={{ opacity: fade(0) }}>
        {TRUNK.map((row, i) =>
          row.kind === "stage" ? (
            <li key={row.label} className="relative" style={{ paddingLeft: GUTTER }}>
              <Rail color={lane(0)} top={i > 0} bottom />
              <span aria-hidden className="absolute h-2 w-2 rounded-full" style={{ left: LINE_X - 4, top: DOT_Y - 4, background: lane(0) }} />
              <div className="px-2.5 pb-1 pt-2.5">
                <p className="text-sm font-semibold leading-5">{row.label}</p>
                <p className="text-sm text-muted-foreground">{row.note}</p>
              </div>
            </li>
          ) : (
            <Station
              key={row.section}
              sectionId={row.section}
              dir={dir}
              courses={coursesBySection.get(row.section) ?? []}
              laneIndex={0}
              top
              bottom
              onOpen={onOpenSection}
            />
          ),
        )}
        <li className="relative" style={{ paddingLeft: GUTTER }}>
          <Rail color={lane(0)} top bottom={false} />
          <span
            aria-hidden
            className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background"
            style={{ left: LINE_X - 14, top: DOT_Y - 14 }}
          >
            <Signpost className="h-4 w-4" />
          </span>
          <div className="px-2.5 pb-2 pt-2.5">
            <p className="text-sm text-muted-foreground">{JUNCTION.label}</p>
            <p className="font-serif text-base font-bold leading-6">{JUNCTION.title}</p>
            <p className="text-sm text-muted-foreground">{JUNCTION.note}</p>
          </div>
        </li>
      </ol>

      <div className="gap-3 md:columns-2">
        {LANES.slice(1).map((l, k) => {
          const i = k + 1;
          return (
            <div
              key={l.id}
              className="mb-3 break-inside-avoid rounded-2xl border p-3 transition-opacity sm:p-4"
              style={{ background: tint(i, 7), borderColor: tint(i, 25), opacity: fade(i) }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2 px-1">
                <p className="flex items-center gap-2 font-semibold">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: lane(i) }} />
                  {l.name}
                </p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {laneCounts[i]} {laneCounts[i] === 1 ? "course" : "courses"}
                </p>
              </div>
              <p className="mb-2 px-1 text-sm text-muted-foreground">{l.blurb}</p>
              <ol>
                {l.sections.map((sid, n) => (
                  <Station
                    key={sid}
                    sectionId={sid}
                    dir={dir}
                    courses={coursesBySection.get(sid) ?? []}
                    laneIndex={i}
                    top={n > 0}
                    bottom={n < l.sections.length - 1}
                    onOpen={onOpenSection}
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Mandatory or essential
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/35" /> Optional
        </span>
        <span>One dot per course</span>
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
          What's on in {dir.scheduleYear}
        </h3>
        <p className="text-xs text-muted-foreground">
          Busiest month: {MONTH_NAMES[busiest]}, {perMonth[busiest]} courses
        </p>
      </div>

      <table className="w-full table-fixed border-separate" style={{ borderSpacing: 2 }}>
        <caption className="sr-only">Courses running each month in {dir.scheduleYear}, by programme area</caption>
        <colgroup>
          <col className="w-[5.75rem] sm:w-56" />
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
                <span className="font-medium sm:hidden">{SHORT_NAMES[section.id] ?? section.code}</span>
                <span className="hidden sm:inline">{section.title}</span>
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
        {inYear && <span>Past months are faded</span>}
      </div>

      <div className="rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous month" disabled={month === 1} onClick={() => pick(month - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-center text-sm font-semibold" aria-live="polite">
            {MONTH_NAMES[month - 1]} {dir.scheduleYear}
            <span className="font-normal text-muted-foreground">
              {", "}
              {sessions.length} {sessions.length === 1 ? "course" : "courses"} running
              {inYear && month < thisMonth && " (already past)"}
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
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          {sessions.length > PREVIEW && (
            <Button variant="link" className="h-auto px-0" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show fewer" : `Show all ${sessions.length}`}
            </Button>
          )}
          <Link
            to={calendarUrl(`${dir.scheduleYear}-${String(month).padStart(2, "0")}`)}
            className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            <CalendarDays className="h-4 w-4" />
            See {MONTH_NAMES[month - 1]} on the calendar
          </Link>
        </div>
      </div>

      {upcoming > 0 && (
        <Button className="w-full sm:w-auto" onClick={onSeeUpcoming}>
          See the {upcoming} courses still running this year
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
    { value: `${cpdFloor(dir)}+`, label: "CPD hours to earn", tip: "Published CPD hours for one run of each course, added up." },
    { value: String(dir.courses.filter((c) => c.schedule?.length).length), label: "running this year" },
    { value: String(dir.courses.filter((c) => c.isNew).length), label: "new this year" },
  ];

  return (
    <div className="aia-viz space-y-4 font-sans">
      <section aria-label="At a glance" className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-end gap-3">
          <p className="shrink-0 text-5xl font-semibold leading-none tracking-tight">{dir.courses.length}</p>
          <p className="pb-1 text-sm leading-snug text-muted-foreground">courses, from getting licensed to leading an agency</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-xl font-semibold leading-tight">{s.value}</dd>
              <dd className="flex items-center whitespace-nowrap text-xs text-muted-foreground">
                {s.label}
                {/* The hub gives every button a 44px minimum on phones; the negative margin keeps that hit area without pushing this label below its neighbours. */}
                {s.tip && (
                  <span className="-my-3.5 inline-flex">
                    <InfoTip label="How CPD hours are counted">{s.tip}</InfoTip>
                  </span>
                )}
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
