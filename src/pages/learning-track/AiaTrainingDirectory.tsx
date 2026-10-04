import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Link2, Loader2, Lock, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTip } from "@/components/InfoTip";
import AiaTrainingOverview from "./AiaTrainingOverview";
import {
  EMPTY_FILTERS,
  MONTHS,
  filterCourses,
  hasActiveFilters,
  nextSession,
  type Course,
  type Directory,
  type Filters,
  type Roadmap,
  type Section,
  type SortKey,
  type StageFilter,
} from "@/features/aia-training-directory/filter";
import {
  BASE,
  UPCOMING_URL,
  absolute,
  courseUrl,
  coursesUrl,
  filtersFromParams,
  filtersToParams,
  roadmapUrl,
  sectionUrl,
} from "@/features/aia-training-directory/links";
import { ROADMAP_META, roadmapTarget, splitTags, type Tag } from "@/features/aia-training-directory/roadmaps";

const STAGES: { value: StageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New consultants" },
  { value: "experienced", label: "Experienced" },
  { value: "leaders", label: "Leaders" },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "catalogue", label: "Catalogue order" },
  { value: "next", label: "Next session" },
  { value: "cpd", label: "Most CPD hours" },
  { value: "az", label: "A to Z" },
];

const TAG = "px-2 py-0.5 text-xs font-medium";

const FORMAT_LABEL = { classroom: "Classroom", virtual: "Virtual", elearning: "eLearning" } as const;

function useDirectory() {
  return useQuery({
    queryKey: ["aia-training-directory"],
    queryFn: async (): Promise<Directory> => {
      const { data, error } = await supabase.functions.invoke("aia-training-directory", { method: "GET" });
      if (error) throw error;
      return data as Directory;
    },
    staleTime: 60 * 60_000,
    retry: 1,
  });
}

async function copyLink(path: string) {
  try {
    await navigator.clipboard.writeText(absolute(path));
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't copy the link. Please try again.");
  }
}

function CopyLinkButton({ path, label }: { path: string; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={() => copyLink(path)} aria-label={label}>
      <Link2 className="h-4 w-4" />
      Copy link
    </Button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RequirementBadge({ course }: { course: Course }) {
  return (
    <>
      {course.requirement === "mandatory" && (
        <Badge variant="outline" className={cn(TAG, "border-emerald-500/50 text-emerald-700 dark:text-emerald-400")}>
          Mandatory
        </Badge>
      )}
      {course.requirement === "essential" && (
        <Badge variant="outline" className={cn(TAG, "border-amber-500/60 text-amber-700 dark:text-amber-400")}>
          Essential
        </Badge>
      )}
      {course.isNew && <Badge className={cn(TAG, "bg-primary/15 text-primary hover:bg-primary/15")}>New</Badge>}
    </>
  );
}

function CourseRow({
  course,
  dir,
  section,
  showSection,
  linked = false,
}: {
  course: Course;
  dir: Directory;
  section?: Section;
  showSection: boolean;
  /** Opened from a deep link: starts expanded and stays outlined so the reader can see where they landed. */
  linked?: boolean;
}) {
  const today = new Date();
  const next = nextSession(course, dir.scheduleYear, today);
  const thisMonth = today.getFullYear() === dir.scheduleYear ? today.getMonth() + 1 : 0;
  // Controlled so a second deep link opens its course even when the list is already on screen.
  const [open, setOpen] = useState(linked);
  useEffect(() => {
    if (linked) setOpen(true);
  }, [linked]);
  const meta = [
    showSection && section ? section.title : null,
    course.duration,
    course.cpd ? `CPD hours: ${course.cpd}` : null,
  ]
    .filter(Boolean)
    // Read as short sentences rather than a pipe-separated table row.
    .map((m) => ((m as string).endsWith(".") ? m : `${m}.`));

  return (
    <Collapsible
      id={`aia-course-${course.id}`}
      open={open}
      onOpenChange={setOpen}
      className={cn("scroll-mt-24 rounded-xl border bg-card", linked && "ring-2 ring-primary/30")}
    >
      <CollapsibleTrigger className="group flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold leading-snug">{course.title}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <RequirementBadge course={course} />
            {next && (
              <Badge variant="secondary" className={cn(TAG, "gap-1")}>
                <CalendarDays className="h-3 w-3" />
                Next: {MONTHS[Math.max(next.month, thisMonth) - 1]}
              </Badge>
            )}
          </div>
          {meta.length > 0 && <p className="text-xs text-muted-foreground line-clamp-2">{meta.join(" ")}</p>}
        </div>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t px-4 pb-4 pt-3 text-sm">
        <div className="-mb-2 -mt-1 flex justify-end">
          <CopyLinkButton path={courseUrl(course.id)} label={`Copy a link to ${course.title}`} />
        </div>
        {course.summary.split("\n\n").map((p, i) => (
          <p key={i} className="leading-relaxed break-words">
            {p}
          </p>
        ))}

        {(course.formats?.length || course.duration || course.cpd) && (
          <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
            {course.formats?.length ? (
              <>
                <dt className="font-semibold">Format</dt>
                <dd className="text-muted-foreground">{course.formats.map((f) => FORMAT_LABEL[f]).join(", ")}</dd>
              </>
            ) : null}
            {course.duration && (
              <>
                <dt className="font-semibold">Duration</dt>
                <dd className="text-muted-foreground">{course.duration}</dd>
              </>
            )}
            {course.cpd && (
              <>
                <dt className="font-semibold">CPD hours</dt>
                <dd className="text-muted-foreground">{course.cpd}</dd>
              </>
            )}
            {course.eligibility && (
              <>
                <dt className="font-semibold">Who it's for</dt>
                <dd className="text-muted-foreground">{course.eligibility}</dd>
              </>
            )}
            {course.access && (
              <>
                <dt className="font-semibold">Where to find it</dt>
                <dd className="text-muted-foreground">{course.access}</dd>
              </>
            )}
          </dl>
        )}

        {course.outcomes?.length ? (
          <div>
            <h4 className="mb-1 font-semibold">By the end you can</h4>
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
              {course.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {course.topics?.map((t) => (
          <div key={t.heading}>
            <h4 className="mb-1 font-semibold">{t.heading}</h4>
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
              {t.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {course.notes?.length ? (
          <div>
            <h4 className="mb-1 font-semibold">Before you sign up</h4>
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
              {course.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(course.schedule?.length || course.scheduleNote) && (
          <div>
            <h4 className="mb-1 font-semibold">{dir.scheduleYear} dates</h4>
            {course.scheduleNote && <p className="text-muted-foreground">{course.scheduleNote}</p>}
            {course.schedule?.length ? (
              <ul className="divide-y rounded-lg border text-xs">
                {course.schedule.map((s) => {
                  const past = (s.endMonth ?? s.month) < thisMonth;
                  const current = s === next;
                  return (
                    <li
                      key={`${s.month}-${s.when}`}
                      className={cn("flex gap-3 px-3 py-2", past && "text-muted-foreground/60", current && "bg-primary/5 font-medium")}
                    >
                      <span className="w-8 shrink-0 font-semibold">{MONTHS[s.month - 1]}</span>
                      <span className="min-w-0 break-words">{s.when}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {course.schedule?.length ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {dir.scheduleKey}. {dir.scheduleNote}
              </p>
            ) : null}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

const lane = (i: number) => `var(--lane-${i + 1})`;
const tint = (i: number, pct: number) => `color-mix(in srgb, var(--lane-${i + 1}) ${pct}%, transparent)`;

const TAG_STYLE: Record<Tag, string> = {
  mandatory: "border-emerald-500/50 text-emerald-700 dark:text-emerald-400",
  essential: "border-amber-500/60 text-amber-700 dark:text-amber-400",
  new: "border-transparent bg-primary/15 text-primary",
};
const TAG_LABEL: Record<Tag, string> = { mandatory: "Mandatory", essential: "Essential", new: "New" };

function TagBadges({ tags }: { tags: Tag[] }) {
  return (
    <>
      {tags.map((t) => (
        <span key={t} className={cn("rounded-full border px-1.5 text-xs font-medium leading-5", TAG_STYLE[t])}>
          {TAG_LABEL[t]}
        </span>
      ))}
    </>
  );
}

/** One roadmap label as a row; rows that name a catalogue course link straight to it. */
function RoadmapItem({ label, laneIndex }: { label: string; laneIndex: number }) {
  const { text, tags } = splitTags(label);
  const to = roadmapTarget(label);
  const body = (
    <>
      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: lane(laneIndex) }} />
      <span className="min-w-0 flex-1">
        {text}
        {tags.length > 0 && (
          <span className="ml-1.5 inline-flex flex-wrap gap-1 align-middle">
            <TagBadges tags={tags} />
          </span>
        )}
      </span>
      {to && <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />}
    </>
  );
  const cls = "flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[13px] leading-5";
  return to ? (
    <Link to={to} className={cn(cls, "group bg-card/80 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-card")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function RoadmapGroupHeading({ label }: { label: string }) {
  const { text, tags } = splitTags(label);
  const to = roadmapTarget(label);
  const inner = (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span>{text}</span>
      <TagBadges tags={tags} />
      {to && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
    </span>
  );
  return (
    <p className="mb-1.5 text-sm font-semibold">
      {to ? (
        <Link to={to} className="underline-offset-2 hover:underline">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </p>
  );
}

function RoadmapsView({ dir, selectedId }: { dir: Directory; selectedId?: string }) {
  const roadmap = dir.roadmaps.find((r) => r.id === selectedId) ?? dir.roadmaps[0];
  const meta = ROADMAP_META[roadmap.id] ?? { short: roadmap.title, lanes: roadmap.columns.map(() => 0), sequential: false };
  const n = roadmap.columns.length;
  const sideArrows = meta.sequential && n <= 3;
  const grid = n === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-1.5" aria-label="Choose a roadmap">
        {dir.roadmaps.map((r) => {
          const active = r.id === roadmap.id;
          const first = ROADMAP_META[r.id]?.lanes[0] ?? 0;
          return (
            <Link
              key={r.id}
              to={roadmapUrl(r.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "border-foreground/40 bg-foreground/5 text-foreground" : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: lane(first) }} />
              {ROADMAP_META[r.id]?.short ?? r.title}
            </Link>
          );
        })}
      </nav>

      <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="aia-roadmap-title">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 id="aia-roadmap-title" className="font-serif text-lg font-bold leading-snug">
              {roadmap.title}
            </h3>
            {roadmap.tagline && <p className="text-sm text-muted-foreground">{roadmap.tagline}</p>}
          </div>
          <CopyLinkButton path={roadmapUrl(roadmap.id)} label={`Copy a link to ${roadmap.title}`} />
        </div>

        <ol className={cn("grid gap-7 md:gap-4", grid)}>
          {roadmap.columns.map((col, i) => {
            const l = meta.lanes[i] ?? 0;
            const last = i === n - 1;
            return (
              <li
                key={col.heading}
                className="relative flex flex-col gap-3 rounded-2xl border p-4"
                style={{ background: tint(l, 6), borderColor: tint(l, 22) }}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] bg-card text-sm font-bold"
                    style={{ borderColor: lane(l) }}
                  >
                    {meta.sequential ? i + 1 : <span className="h-2 w-2 rounded-full" style={{ background: lane(l) }} />}
                  </span>
                  <div className="min-w-0">
                    {col.period && <p className="text-xs font-semibold text-muted-foreground">{col.period}</p>}
                    {/* AIA numbers some stage headings ("1. Overview..."); the ring already shows the step. */}
                    <p className="font-semibold leading-snug">{meta.sequential ? col.heading.replace(/^\d+\.\s+/, "") : col.heading}</p>
                  </div>
                </div>
                {col.focus && <p className="text-sm text-muted-foreground">{col.focus}</p>}
                {col.groups.map((g, gi) => (
                  <div key={g.heading ?? gi}>
                    {g.heading && <RoadmapGroupHeading label={g.heading} />}
                    {g.items.length > 0 && (
                      <ul className="space-y-1">
                        {g.items.map((item) => (
                          <li key={item}>
                            <RoadmapItem label={item} laneIndex={l} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {meta.sequential && !last && (
                  <>
                    {sideArrows && (
                      <span
                        aria-hidden
                        className="absolute -right-[22px] top-7 z-10 hidden h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm md:flex"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    )}
                    <span
                      aria-hidden
                      className="absolute -bottom-[25px] left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border bg-card shadow-sm md:hidden"
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>

        {roadmap.footnotes?.map((f) => (
          <p key={f} className="text-xs text-muted-foreground">
            {f}
          </p>
        ))}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpRight className="h-3.5 w-3.5" /> Opens the course
        </p>
      </section>
    </div>
  );
}

function CoursesView({
  dir,
  filters,
  setFilters,
  linkedCourse,
  linkedSection,
}: {
  dir: Directory;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  linkedCourse?: string;
  linkedSection?: string;
}) {
  // A deep link lands scrolled to its course or section. Keyed on the target,
  // so typing in search (which rewrites the query string) never re-scrolls.
  const target = linkedCourse ? `aia-course-${linkedCourse}` : linkedSection ? `aia-sec-${linkedSection}` : null;
  useEffect(() => {
    if (!target) return;
    const id = window.requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => window.cancelAnimationFrame(id);
  }, [target]);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const results = useMemo(() => filterCourses(dir, filters, new Date()), [dir, filters]);
  const sectionById = useMemo(() => new Map(dir.sections.map((s) => [s.id, s])), [dir]);
  const grouped = filters.sort === "catalogue";

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search by course, topic or skill"
            aria-label="Search the training directory"
            className="pl-9 pr-9"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set({ query: "" })}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Career stage">
          {STAGES.map((s) => (
            <Chip key={s.value} active={filters.stage === s.value} onClick={() => set({ stage: s.value })}>
              {s.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Course type">
          <span className="inline-flex items-center">
            <Chip active={filters.mandatory} onClick={() => set({ mandatory: !filters.mandatory })}>
              Mandatory
            </Chip>
            <InfoTip label="About mandatory courses">{dir.legend.mandatory}</InfoTip>
          </span>
          <span className="inline-flex items-center">
            <Chip active={filters.essential} onClick={() => set({ essential: !filters.essential })}>
              Essential
            </Chip>
            <InfoTip label="About essential courses">{dir.legend.essential}</InfoTip>
          </span>
          <Chip active={filters.isNew} onClick={() => set({ isNew: !filters.isNew })}>
            New for {dir.scheduleYear}
          </Chip>
          <Chip active={filters.upcoming} onClick={() => set({ upcoming: !filters.upcoming })}>
            Still running this year
          </Chip>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {results.length} {results.length === 1 ? "course" : "courses"}
            {hasActiveFilters(filters) && (
              <>
                {" | "}
                <button
                  type="button"
                  onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
          <Select value={filters.sort} onValueChange={(v) => set({ sort: v as SortKey })}>
            <SelectTrigger className="h-9 w-[170px] shrink-0 text-xs" aria-label="Sort courses">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-10 text-center">
          <p className="font-medium">No courses match those filters</p>
          <Button variant="link" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : grouped ? (
        dir.sections
          .map((section) => ({ section, items: results.filter((c) => c.section === section.id) }))
          .filter((g) => g.items.length > 0)
          .map(({ section, items }) => (
            <section key={section.id} className="scroll-mt-24 space-y-2" aria-labelledby={`aia-sec-${section.id}`}>
              <h3 id={`aia-sec-${section.id}`} className="flex scroll-mt-24 flex-wrap items-baseline gap-x-2 pt-3">
                <span className="font-serif text-base font-bold">{section.title}</span>
                <span className="text-xs text-muted-foreground">
                  {section.code}, {items.length} {items.length === 1 ? "course" : "courses"}
                </span>
              </h3>
              {items.map((c) => (
                <CourseRow key={c.id} course={c} dir={dir} section={section} showSection={false} linked={c.id === linkedCourse} />
              ))}
            </section>
          ))
      ) : (
        <div className="space-y-2">
          {results.map((c) => (
            <CourseRow key={c.id} course={c} dir={dir} section={sectionById.get(c.section)} showSection linked={c.id === linkedCourse} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiaTrainingDirectory() {
  const { data: dir, isLoading, isError, error, refetch, isFetching } = useDirectory();
  // Everything the reader sees comes from the URL, so any state can be shared:
  //   /aia-training                       overview
  //   /aia-training/courses?q=&stage=...  filtered list (section=02c scrolls to a section)
  //   /aia-training/courses/:courseId     that course, opened
  //   /aia-training/roadmaps/:roadmapId   one roadmap
  const { view: viewParam, itemId } = useParams<{ view?: string; itemId?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const view = viewParam === "courses" || viewParam === "roadmaps" ? viewParam : "overview";
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const setFilters = useCallback<Dispatch<SetStateAction<Filters>>>(
    (next) =>
      setParams(
        (prev) => {
          const value = typeof next === "function" ? next(filtersFromParams(prev)) : next;
          return filtersToParams(value, prev);
        },
        { replace: true },
      ),
    [setParams],
  );
  const top = useRef<HTMLDivElement>(null);

  // Arriving from a button lower on the page (the overview CTA, a roadmap
  // chip): bring the tab back into view, unless a deep link will scroll itself.
  const linkedSection = view === "courses" ? params.get("section") ?? undefined : undefined;
  const linkedCourse = view === "courses" ? itemId : undefined;
  useEffect(() => {
    if (linkedCourse || linkedSection) return;
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [view, itemId, linkedCourse, linkedSection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !dir) {
    const status = (error as { context?: Response } | null)?.context?.status;
    return (
      <div className="mx-auto max-w-3xl rounded-xl border bg-muted/20 p-6 text-center">
        {status === 403 ? (
          <>
            <Lock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="font-medium">The AIA Training Directory is for Post-RNF consultants.</p>
          </>
        ) : (
          <>
            <p className="font-medium">Couldn't load the training directory.</p>
            <Button variant="outline" className="mt-3 gap-2" onClick={() => refetch()} disabled={isFetching}>
              <RotateCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Try again
            </Button>
          </>
        )}
      </div>
    );
  }

  const tabHref = { overview: BASE, courses: coursesUrl(view === "courses" ? search.replace(/^\?/, "") : ""), roadmaps: `${BASE}/roadmaps` };
  const viewTab = (value: typeof view, label: string) => (
    <Link
      to={tabHref[value]}
      role="tab"
      aria-selected={view === value}
      className={cn(
        "-mb-px border-b-2 pb-2 pt-1 transition-colors",
        view === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div ref={top} className="aia-viz mx-auto max-w-3xl scroll-mt-24 space-y-4" data-testid="aia-training-directory">
      <div className="space-y-1">
        <h2 className="font-serif text-xl font-bold">AIA Training Directory {dir.scheduleYear}</h2>
        <p className="text-xs text-muted-foreground">{dir.source}</p>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
          {dir.notice}
        </p>
      </div>

      <div role="tablist" aria-label="Directory views" className="flex gap-6 border-b text-sm font-semibold">
        {viewTab("overview", "Overview")}
        {viewTab("courses", `Courses (${dir.courses.length})`)}
        {viewTab("roadmaps", `Roadmaps (${dir.roadmaps.length})`)}
      </div>

      {view === "overview" ? (
        <AiaTrainingOverview
          dir={dir}
          onOpenSection={(id) => navigate(sectionUrl(id))}
          onSeeUpcoming={() => navigate(UPCOMING_URL)}
        />
      ) : view === "courses" ? (
        <CoursesView
          dir={dir}
          filters={filters}
          setFilters={setFilters}
          linkedCourse={linkedCourse}
          linkedSection={linkedSection}
        />
      ) : (
        <RoadmapsView dir={dir} selectedId={itemId} />
      )}
    </div>
  );
}
