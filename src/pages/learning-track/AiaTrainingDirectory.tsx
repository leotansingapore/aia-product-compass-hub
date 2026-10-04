import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowRight, ArrowUpRight, Loader2, Lock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/aia-training/CopyLinkButton";
import AiaTrainingOverview from "./AiaTrainingOverview";
import AiaTrainingCalendar from "./AiaTrainingCalendar";
import AiaTrainingContents from "./AiaTrainingContents";
import type { Directory, Filters } from "@/features/aia-training-directory/filter";
import {
  BASE,
  UPCOMING_URL,
  courseUrl,
  coursesUrl,
  filtersFromParams,
  filtersToParams,
  roadmapUrl,
  sectionUrl,
} from "@/features/aia-training-directory/links";
import { ROADMAP_META, roadmapTarget, splitTags, type Tag } from "@/features/aia-training-directory/roadmaps";

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
function RoadmapItem({ label, laneIndex, links }: { label: string; laneIndex: number; links: Record<string, string> }) {
  const { text, tags } = splitTags(label);
  const to = roadmapTarget(label, links);
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

function RoadmapGroupHeading({ label, links }: { label: string; links: Record<string, string> }) {
  const { text, tags } = splitTags(label);
  const to = roadmapTarget(label, links);
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
                    {g.heading && <RoadmapGroupHeading label={g.heading} links={dir.roadmapLinks} />}
                    {g.items.length > 0 && (
                      <ul className="space-y-1">
                        {g.items.map((item) => (
                          <li key={item}>
                            <RoadmapItem label={item} laneIndex={l} links={dir.roadmapLinks} />
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

export default function AiaTrainingDirectory() {
  const { data: dir, isLoading, isError, error, refetch, isFetching } = useDirectory();
  // Everything the reader sees comes from the URL, so any state can be shared:
  //   /aia-training                       overview
  //   /aia-training/courses?q=&stage=...  the contents index (section=02c scrolls to a section)
  //   /aia-training/courses/:courseId     that course's popup over the contents
  //   /aia-training/calendar?month=YYYY-MM&q=&stage=  the calendar
  //   /aia-training/roadmaps/:roadmapId   one roadmap
  const { view: viewParam, itemId } = useParams<{ view?: string; itemId?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;
  const view = viewParam === "courses" || viewParam === "roadmaps" || viewParam === "calendar" ? viewParam : "overview";
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
  // Keyed on the view only: opening or closing a course popup must not move the page.
  useEffect(() => {
    if (linkedSection) return;
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Course popups: opening from the contents pushes a history entry (so Back closes it),
  // stepping replaces it, and closing a popup that came from a shared link stays on the page.
  const searchWithoutSection = (() => {
    const p = new URLSearchParams(search);
    p.delete("section");
    const q = p.toString();
    return q ? `?${q}` : "";
  })();
  const openedFromContents = Boolean((location.state as { fromContents?: boolean } | null)?.fromContents);
  const openCourse = (id: string) => navigate({ pathname: courseUrl(id), search: searchWithoutSection }, { state: { fromContents: true } });
  const stepCourse = (id: string) => navigate({ pathname: courseUrl(id), search }, { replace: true, state: location.state });
  const closeCourse = () => (openedFromContents ? navigate(-1) : navigate({ pathname: coursesUrl(), search }, { replace: true }));

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

  const tabHref = {
    overview: BASE,
    courses: coursesUrl(view === "courses" ? search.replace(/^\?/, "") : ""),
    calendar: `${BASE}/calendar`,
    roadmaps: `${BASE}/roadmaps`,
  };
  // Calendar: ?day=YYYY-MM-DD opens that day's popup and decides the month; otherwise
  // ?month=YYYY-MM inside the schedule year, else this month (or January outside it).
  const now = new Date();
  const dayParam = params.get("day");
  const calDay =
    dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) && Number(dayParam.slice(0, 4)) === dir.scheduleYear ? dayParam : undefined;
  const ym = params.get("month")?.match(/^(\d{4})-(\d{2})$/);
  const calMonth = calDay
    ? Number(calDay.slice(5, 7))
    : ym && Number(ym[1]) === dir.scheduleYear && Number(ym[2]) >= 1 && Number(ym[2]) <= 12
      ? Number(ym[2])
      : now.getFullYear() === dir.scheduleYear
        ? now.getMonth() + 1
        : 1;
  const setCalMonth = (m: number) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("month", `${dir.scheduleYear}-${String(m).padStart(2, "0")}`);
        next.delete("day");
        return next;
      },
      { replace: true },
    );
  const setCalDay = (iso: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (iso) {
          next.set("day", iso);
          next.set("month", iso.slice(0, 7));
        } else next.delete("day");
        return next;
      },
      { replace: true },
    );
  const viewTab = (value: typeof view, label: React.ReactNode) => (
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

      <div role="tablist" aria-label="Directory views" className="flex gap-5 border-b text-sm font-semibold sm:gap-6">
        {viewTab("overview", "Overview")}
        {viewTab("courses", "Contents")}
        {viewTab("calendar", "Calendar")}
        {viewTab(
          "roadmaps",
          <>
            Roadmaps<span className="hidden sm:inline"> ({dir.roadmaps.length})</span>
          </>,
        )}
      </div>

      {view === "overview" ? (
        <AiaTrainingOverview
          dir={dir}
          onOpenSection={(id) => navigate(sectionUrl(id))}
          onSeeUpcoming={() => navigate(UPCOMING_URL)}
        />
      ) : view === "courses" ? (
        <AiaTrainingContents
          dir={dir}
          filters={filters}
          setFilters={setFilters}
          openCourseId={linkedCourse}
          linkedSection={linkedSection}
          onOpenCourse={openCourse}
          onStepCourse={stepCourse}
          onCloseCourse={closeCourse}
        />
      ) : view === "calendar" ? (
        <AiaTrainingCalendar
          dir={dir}
          month={calMonth}
          day={calDay}
          onDay={setCalDay}
          query={filters.query}
          stage={filters.stage}
          onMonth={setCalMonth}
          onQuery={(q) => setFilters((f) => ({ ...f, query: q }))}
          onStage={(st) => setFilters((f) => ({ ...f, stage: st }))}
        />
      ) : (
        <RoadmapsView dir={dir} selectedId={itemId} />
      )}
    </div>
  );
}
