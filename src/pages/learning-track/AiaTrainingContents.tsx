import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Map as MapIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InfoTip } from "@/components/InfoTip";
import { CopyLinkButton } from "@/components/aia-training/CopyLinkButton";
import { CourseDetails } from "@/components/aia-training/CourseDetails";
import { RequirementBadge, TAG } from "@/components/aia-training/RequirementBadge";
import {
  EMPTY_FILTERS,
  filterCourses,
  hasActiveFilters,
  type Course,
  type Directory,
  type Filters,
  type Section,
  type StageFilter,
} from "@/features/aia-training-directory/filter";
import { BASE, courseUrl, roadmapUrl } from "@/features/aia-training-directory/links";
import { nextDates, type NextDate } from "@/features/aia-training-directory/sessions";

const STAGES: { value: StageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New consultants" },
  { value: "experienced", label: "Experienced" },
  { value: "leaders", label: "Leaders" },
];

/** The catalogue's own numbering: 01 is the whole career, then one part per career stage. */
const PARTS: Record<Section["stage"], { code: string; title: string; roadmap: string }> = {
  new: { code: "02", title: "New consultants", roadmap: "new-consultant" },
  experienced: { code: "03", title: "Experienced consultants", roadmap: "experienced-consultant" },
  leaders: { code: "04", title: "Leaders", roadmap: "leaders" },
};
/** Sections that have a roadmap of their own in the catalogue. */
const SECTION_ROADMAPS: Record<string, string> = { "03d": "health-academy", "03g": "affluent-hnw" };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
const nextLabel = (n?: NextDate) => (!n ? "" : n.kind === "date" ? shortDate(n.date) : n.kind === "open" ? "Open now" : "Date TBC");

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RoadmapLine({ dir, id }: { dir: Directory; id: string }) {
  const r = dir.roadmaps.find((x) => x.id === id);
  if (!r) return null;
  return (
    <Link
      to={roadmapUrl(id)}
      className="group flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
    >
      <MapIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 underline-offset-2 group-hover:underline">{r.title}</span>
      <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0" />
    </Link>
  );
}

/** One course as a contents line: name, the tags that matter, a dotted leader and the next date. */
function ContentsLine({ course, next, hideEssential, onOpen }: { course: Course; next?: NextDate; hideEssential: boolean; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-baseline gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="min-w-0">
          <span className="underline-offset-2 group-hover:underline">{course.title}</span>
          {course.isNew && <Badge className={cn(TAG, "ml-1.5 bg-primary/15 align-middle text-primary hover:bg-primary/15")}>New</Badge>}
          {course.requirement === "mandatory" && (
            <Badge variant="outline" className={cn(TAG, "ml-1.5 border-emerald-500/50 align-middle text-emerald-700 dark:text-emerald-400")}>
              Mandatory
            </Badge>
          )}
          {course.requirement === "essential" && !hideEssential && (
            <Badge variant="outline" className={cn(TAG, "ml-1.5 border-amber-500/60 align-middle text-amber-700 dark:text-amber-400")}>
              Essential
            </Badge>
          )}
        </span>
        <span aria-hidden className="mb-1 hidden min-w-6 flex-1 border-b border-dotted border-muted-foreground/40 sm:block" />
        <span className="ml-auto shrink-0 whitespace-nowrap pl-2 text-xs text-muted-foreground">{nextLabel(next)}</span>
      </button>
    </li>
  );
}

function CoursePopup({
  course,
  dir,
  next,
  position,
  total,
  prev,
  following,
  onStep,
  onClose,
}: {
  course: Course;
  dir: Directory;
  next?: NextDate;
  position: number;
  total: number;
  prev?: Course;
  following?: Course;
  onStep: (id: string) => void;
  onClose: () => void;
}) {
  const section = dir.sections.find((s) => s.id === course.section);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="aia-viz max-h-[88vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-5 overflow-y-auto rounded-2xl p-5 outline-none focus-visible:shadow-lg focus-visible:outline-none sm:p-7"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && prev) onStep(prev.id);
          if (e.key === "ArrowRight" && following) onStep(following.id);
        }}
      >
        <DialogHeader className="space-y-2 pr-6 text-left">
          {section && (
            <p className="text-xs text-muted-foreground">
              {section.code} {section.title}
            </p>
          )}
          <DialogTitle className="font-serif text-xl leading-snug">{course.title}</DialogTitle>
          <DialogDescription className="sr-only">What the course covers, who it is for and its {dir.scheduleYear} dates</DialogDescription>
          <div className="flex flex-wrap items-center gap-1.5">
            <RequirementBadge course={course} />
            {next && (
              <Badge variant="secondary" className={cn(TAG, "gap-1")}>
                <CalendarDays className="h-3 w-3" />
                {next.kind === "date" ? `Next: ${shortDate(next.date)}` : nextLabel(next)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          {next?.kind === "date" && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <Link to={`${BASE}/calendar?day=${next.date}`}>
                <CalendarDays className="h-4 w-4" />
                See {shortDate(next.date)} on the calendar
              </Link>
            </Button>
          )}
          <CopyLinkButton path={courseUrl(course.id)} label={`Copy a link to ${course.title}`} />
        </div>

        <CourseDetails course={course} dir={dir} />

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" className="gap-1" disabled={!prev} onClick={() => prev && onStep(prev.id)} aria-label="Previous course">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {position} of {total}
          </span>
          <Button variant="ghost" size="sm" className="gap-1" disabled={!following} onClick={() => following && onStep(following.id)} aria-label="Next course">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AiaTrainingContents({
  dir,
  filters,
  setFilters,
  openCourseId,
  linkedSection,
  onOpenCourse,
  onStepCourse,
  onCloseCourse,
}: {
  dir: Directory;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  /** Course whose popup is open, from /courses/:courseId. */
  openCourseId?: string;
  /** ?section= target to scroll to. */
  linkedSection?: string;
  onOpenCourse: (id: string) => void;
  onStepCourse: (id: string) => void;
  onCloseCourse: () => void;
}) {
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  // Contents always reads in catalogue order, like the PDF.
  const results = useMemo(() => filterCourses(dir, { ...filters, sort: "catalogue" }, new Date()), [dir, filters]);
  const next = useMemo(() => nextDates(dir, todayIso()), [dir]);
  const filtered = hasActiveFilters(filters);

  useEffect(() => {
    if (!linkedSection) return;
    const id = window.requestAnimationFrame(() =>
      document.getElementById(`aia-sec-${linkedSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => window.cancelAnimationFrame(id);
  }, [linkedSection]);

  // A section whose every course is essential says so once, instead of on each line.
  const allEssential = useMemo(() => {
    const s = new Set<string>();
    for (const sec of dir.sections) {
      const cs = dir.courses.filter((c) => c.section === sec.id);
      if (cs.length > 1 && cs.every((c) => c.requirement === "essential")) s.add(sec.id);
    }
    return s;
  }, [dir]);

  const blocks = dir.sections
    .map((section) => ({ section, items: results.filter((c) => c.section === section.id) }))
    .filter((b) => b.items.length > 0);
  const seenStage = new Set<string>();

  // The open popup: falls back to the whole catalogue when the course is filtered out of view.
  const order = openCourseId && !results.some((c) => c.id === openCourseId) ? dir.courses : results;
  const openIndex = openCourseId ? order.findIndex((c) => c.id === openCourseId) : -1;
  const openCourse = openIndex >= 0 ? order[openIndex] : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
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
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter courses">
          {STAGES.map((s) => (
            <Chip key={s.value} active={filters.stage === s.value} onClick={() => set({ stage: s.value })}>
              {s.label}
            </Chip>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
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
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered ? `${results.length} of ${dir.courses.length} courses` : `${dir.courses.length} courses`}
          {filtered && (
            <>
              {", "}
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="font-medium text-primary underline-offset-2 hover:underline">
                clear filters
              </button>
            </>
          )}
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 py-10 text-center">
          <p className="font-medium">No courses match those filters</p>
          <Button variant="link" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <div className="md:columns-2 md:gap-10">
            {!filtered && (
              <div className="mb-5 break-inside-avoid">
                <p className="mb-1 font-serif text-lg font-bold">
                  <span className="mr-2 text-primary">01</span>Your whole career
                </p>
                <RoadmapLine dir={dir} id="tied-distribution" />
              </div>
            )}
            {blocks.map(({ section, items }) => {
              const part = PARTS[section.stage];
              const firstOfPart = !seenStage.has(section.stage);
              seenStage.add(section.stage);
              const essentialHere = allEssential.has(section.id);
              return (
                <section key={section.id} className="mb-5 break-inside-avoid" aria-labelledby={`aia-sec-${section.id}`}>
                  {firstOfPart && (
                    <div className="mb-2">
                      <p className="font-serif text-lg font-bold">
                        <span className="mr-2 text-primary">{part.code}</span>
                        {part.title}
                      </p>
                      {!filtered && <RoadmapLine dir={dir} id={part.roadmap} />}
                    </div>
                  )}
                  <h4 id={`aia-sec-${section.id}`} className="flex scroll-mt-24 flex-wrap items-center gap-x-2 px-1.5 pb-0.5 pt-1 text-sm font-semibold">
                    <span className="text-xs font-medium text-muted-foreground">{section.code}</span>
                    {section.title}
                    {essentialHere && (
                      <Badge variant="outline" className={cn(TAG, "border-amber-500/60 text-amber-700 dark:text-amber-400")}>
                        All essential
                      </Badge>
                    )}
                  </h4>
                  {!filtered && SECTION_ROADMAPS[section.id] && <RoadmapLine dir={dir} id={SECTION_ROADMAPS[section.id]} />}
                  <ul>
                    {items.map((c) => (
                      <ContentsLine key={c.id} course={c} next={next.get(c.id)} hideEssential={essentialHere} onOpen={() => onOpenCourse(c.id)} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          <p className="mt-2 border-t pt-3 text-xs text-muted-foreground">
            The date on the right is the next session. {dir.scheduleNote}
          </p>
        </div>
      )}

      {openCourse && (
        <CoursePopup
          course={openCourse}
          dir={dir}
          next={next.get(openCourse.id)}
          position={openIndex + 1}
          total={order.length}
          prev={order[openIndex - 1]}
          following={order[openIndex + 1]}
          onStep={onStepCourse}
          onClose={onCloseCourse}
        />
      )}
    </div>
  );
}
