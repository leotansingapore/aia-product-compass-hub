import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, Loader2, Lock, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTip } from "@/components/InfoTip";
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

const TAG = "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

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

function CourseRow({ course, dir, section, showSection }: { course: Course; dir: Directory; section?: Section; showSection: boolean }) {
  const today = new Date();
  const next = nextSession(course, dir.scheduleYear, today);
  const thisMonth = today.getFullYear() === dir.scheduleYear ? today.getMonth() + 1 : 0;
  const meta = [
    showSection && section ? `${section.code} ${section.title}` : null,
    course.duration,
    course.cpd ? `CPD ${course.cpd}` : null,
  ].filter(Boolean);

  return (
    <Collapsible className="rounded-xl border bg-card">
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
          {meta.length > 0 && <p className="text-xs text-muted-foreground line-clamp-2">{meta.join(" | ")}</p>}
        </div>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t px-4 pb-4 pt-3 text-sm">
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

function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div>
        <h3 className="font-serif text-base font-bold leading-snug">{roadmap.title}</h3>
        {roadmap.tagline && <p className="text-xs text-muted-foreground">{roadmap.tagline}</p>}
      </div>
      <div className={cn("grid gap-3", roadmap.columns.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {roadmap.columns.map((col) => (
          <div key={col.heading} className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
            <div>
              {col.period && <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{col.period}</p>}
              <p className="font-semibold leading-snug">{col.heading}</p>
              {col.focus && <p className="text-xs italic text-muted-foreground">{col.focus}</p>}
            </div>
            {col.groups.map((g, i) => (
              <div key={g.heading ?? i}>
                {g.heading && <p className="text-xs font-semibold">{g.heading}</p>}
                {g.items.length > 0 && (
                  <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {roadmap.footnotes?.map((f) => (
        <p key={f} className="text-xs text-muted-foreground">
          {f}
        </p>
      ))}
    </section>
  );
}

function CoursesView({ dir }: { dir: Directory }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
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
            placeholder="Search courses, topics, CPD, iLearn..."
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
            Sessions ahead
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
          <p className="font-medium">No courses match</p>
          <Button variant="link" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : grouped ? (
        dir.sections
          .map((section) => ({ section, items: results.filter((c) => c.section === section.id) }))
          .filter((g) => g.items.length > 0)
          .map(({ section, items }) => (
            <section key={section.id} className="space-y-2" aria-labelledby={`aia-sec-${section.id}`}>
              <h3 id={`aia-sec-${section.id}`} className="flex items-baseline gap-2 pt-2 text-sm font-bold">
                <span className="text-primary">{section.code}</span>
                <span>{section.title}</span>
                <span className="text-xs font-normal text-muted-foreground">{items.length}</span>
              </h3>
              {items.map((c) => (
                <CourseRow key={c.id} course={c} dir={dir} section={section} showSection={false} />
              ))}
            </section>
          ))
      ) : (
        <div className="space-y-2">
          {results.map((c) => (
            <CourseRow key={c.id} course={c} dir={dir} section={sectionById.get(c.section)} showSection />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiaTrainingDirectory() {
  const { data: dir, isLoading, isError, error, refetch, isFetching } = useDirectory();
  const [view, setView] = useState<"courses" | "roadmaps">("courses");

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

  const viewTab = (value: typeof view, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === value}
      onClick={() => setView(value)}
      className={cn(
        "rounded-full px-4 py-1.5 transition-colors",
        view === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4" data-testid="aia-training-directory">
      <div className="space-y-1">
        <h2 className="font-serif text-xl font-bold">AIA Training Directory {dir.scheduleYear}</h2>
        <p className="text-xs text-muted-foreground">{dir.source}</p>
        <p className="flex items-start gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" />
          {dir.notice}
        </p>
      </div>

      <div role="tablist" aria-label="Directory views" className="inline-flex rounded-full border bg-muted/50 p-1 text-xs font-semibold">
        {viewTab("courses", `Courses (${dir.courses.length})`)}
        {viewTab("roadmaps", `Roadmaps (${dir.roadmaps.length})`)}
      </div>

      {view === "courses" ? (
        <CoursesView dir={dir} />
      ) : (
        <div className="space-y-4">
          {dir.roadmaps.map((r) => (
            <RoadmapCard key={r.id} roadmap={r} />
          ))}
        </div>
      )}
    </div>
  );
}
