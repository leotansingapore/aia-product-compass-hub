import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  useLearnerCompletedItems,
  type CompletedItem,
} from "@/hooks/useLearnerCompletedItems";
import type { CoreVideoCatalogRow } from "@/hooks/useTeamProgress";
import {
  DAY_SUMMARIES as F14_DAYS,
  type DaySummary as F14DaySummary,
} from "@/features/first-14-days/summaries";
import { DAY_SUMMARIES as F60_DAYS } from "@/features/first-60-days/summaries";
import { DAY_SUMMARIES as N60_DAYS } from "@/features/next-60-days/summaries";
import { DAY_SUMMARIES as PM_DAYS } from "@/features/product-mastery-track/summaries";
import { loadAllAssignments as loadFirst60Assignments } from "@/features/first-60-days/assignments";
import { loadAllAssignments as loadNext60Assignments } from "@/features/next-60-days/assignments";

type TrackDay = Pick<F14DaySummary, "dayNumber" | "week" | "title">;

const TRACKS: readonly {
  source: string;
  label: string;
  days: readonly TrackDay[];
}[] = [
  { source: "first_14_days", label: "First 14 Days", days: F14_DAYS },
  { source: "first_60_days", label: "First 60 Days", days: F60_DAYS },
  { source: "next_60_days", label: "Next 60 Days", days: N60_DAYS },
  { source: "product_mastery", label: "Product Mastery", days: PM_DAYS },
];

/** Both assignment sets, flattened to what the checklist needs. Loaded once —
 *  definitions are static markdown parsed at build time. Shared with the
 *  TeamProgress page (same query key) for the assignment denominator. */
export function useAssignmentDefs() {
  return useQuery({
    queryKey: ["team-progress-assignment-defs"],
    queryFn: async () => {
      const [first60, next60] = await Promise.all([
        loadFirst60Assignments(),
        loadNext60Assignments(),
      ]);
      const slim = (
        list: { frontmatter: { status_key: string; title: string; order: number } }[],
      ) =>
        list
          .map((a) => ({
            statusKey: a.frontmatter.status_key,
            title: a.frontmatter.title,
            order: a.frontmatter.order,
          }))
          .sort((a, b) => a.order - b.order);
      return { first60: slim(first60), next60: slim(next60) };
    },
    staleTime: Infinity,
    gcTime: 60 * 60_000,
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SectionHeading({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="flex flex-1 items-center gap-2">
        <Progress value={pct} className="h-1.5 max-w-[140px]" />
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

function TrackDayGrid({
  days,
  completed,
}: {
  days: readonly TrackDay[];
  completed: Map<string, CompletedItem>;
}) {
  const weeks = useMemo(() => {
    const byWeek = new Map<number, TrackDay[]>();
    for (const d of days) {
      const list = byWeek.get(d.week) ?? [];
      list.push(d);
      byWeek.set(d.week, list);
    }
    return Array.from(byWeek.entries()).sort((a, b) => a[0] - b[0]);
  }, [days]);

  const singleWeekTrack = weeks.length <= 2;

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      {weeks.map(([week, weekDays]) => {
        const doneCount = weekDays.filter((d) => completed.has(String(d.dayNumber))).length;
        return (
          <div key={week} className="flex items-center gap-2">
            {!singleWeekTrack && (
              <span
                className={cn(
                  "w-[74px] shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wide tabular-nums",
                  doneCount === weekDays.length
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                Wk {week} · {doneCount}/{weekDays.length}
              </span>
            )}
            <div className="flex flex-wrap gap-1">
              {weekDays.map((d) => {
                const item = completed.get(String(d.dayNumber));
                return (
                  <span
                    key={d.dayNumber}
                    title={`Day ${d.dayNumber} — ${d.title}${
                      item ? ` · Completed ${fmtDate(item.completedOn)}` : " · Not completed"
                    }`}
                    className={cn(
                      "flex h-6 w-7 items-center justify-center rounded border text-[11px] tabular-nums",
                      item
                        ? "border-emerald-600/40 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-background text-muted-foreground/60",
                    )}
                  >
                    {d.dayNumber}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignmentChecklist({
  title,
  defs,
  completed,
}: {
  title: string;
  defs: { statusKey: string; title: string }[];
  completed: Map<string, CompletedItem>;
}) {
  const done = defs.filter((d) => completed.has(d.statusKey)).length;
  return (
    <div>
      <SectionHeading label={title} done={done} total={defs.length} />
      <div className="mt-1.5 flex flex-col gap-1">
        {defs.map((d) => {
          const item = completed.get(d.statusKey);
          return (
            <div key={d.statusKey} className="flex items-baseline gap-2 text-xs">
              {item ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  item ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {d.title}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item ? fmtDate(item.completedOn) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoModules({
  catalog,
  completed,
}: {
  catalog: CoreVideoCatalogRow[];
  completed: Map<string, CompletedItem>;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const modules = useMemo(() => {
    const byProduct = new Map<string, { title: string; videos: CoreVideoCatalogRow[] }>();
    for (const row of catalog) {
      const entry = byProduct.get(row.productId) ?? { title: row.productTitle, videos: [] };
      entry.videos.push(row);
      byProduct.set(row.productId, entry);
    }
    return Array.from(byProduct.entries()).map(([productId, m]) => ({
      productId,
      title: m.title,
      videos: m.videos,
      done: m.videos.filter((v) => completed.has(v.videoId)).length,
    }));
  }, [catalog, completed]);

  if (modules.length === 0) {
    return <div className="text-xs italic text-muted-foreground">No Core Products videos found.</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {modules.map((m) => {
        const isOpen = open.has(m.productId);
        const pct = m.videos.length > 0 ? Math.round((m.done / m.videos.length) * 100) : 0;
        return (
          <div key={m.productId} className="rounded border bg-background/60">
            <button
              type="button"
              onClick={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(m.productId)) next.delete(m.productId);
                  else next.add(m.productId);
                  return next;
                })
              }
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-muted/40"
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{m.title}</span>
              <Progress value={pct} className="h-1.5 w-16 shrink-0" />
              <span
                className={cn(
                  "w-12 shrink-0 text-right text-[11px] tabular-nums",
                  m.done === m.videos.length && m.videos.length > 0
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                {m.done}/{m.videos.length}
              </span>
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1 border-t px-2 py-1.5 pl-7">
                {m.videos.map((v) => {
                  const item = completed.get(v.videoId);
                  return (
                    <div key={v.videoId} className="flex items-baseline gap-2 text-xs">
                      {item ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-muted-foreground/40" />
                      )}
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate",
                          item ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {v.videoTitle}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {item ? fmtDate(item.completedOn) : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Everything one consultant has (and hasn't) done, for the manager drill-down:
 * day-by-day chips per learning track grouped by week, both assignment
 * checklists, per-module Core Products video completion and the question-bank
 * aggregate. Built on get_learner_completed_items (admin-or-self RPC).
 */
export function TeamMemberDetail({
  userId,
  qbCorrect,
  catalog,
}: {
  userId: string;
  qbCorrect: number;
  catalog: CoreVideoCatalogRow[];
}) {
  const { data, isLoading, error } = useLearnerCompletedItems(userId, true);
  const defsQuery = useAssignmentDefs();

  const bySource = useMemo(() => {
    const map = new Map<string, Map<string, CompletedItem>>();
    for (const item of data ?? []) {
      const inner = map.get(item.source) ?? new Map<string, CompletedItem>();
      inner.set(item.itemKey, item);
      map.set(item.source, inner);
    }
    return map;
  }, [data]);

  if (isLoading || defsQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading full progress…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 text-xs text-destructive">
        Couldn't load progress detail: {(error as Error).message}
      </div>
    );
  }

  const empty = new Map<string, CompletedItem>();
  const videosCompleted = bySource.get("videos") ?? empty;
  const assignmentsCompleted = bySource.get("assignments") ?? empty;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        {TRACKS.map((track) => {
          const completed = bySource.get(track.source) ?? empty;
          return (
            <div key={track.source}>
              <SectionHeading
                label={track.label}
                done={completed.size}
                total={track.days.length}
              />
              <TrackDayGrid days={track.days} completed={completed} />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        {defsQuery.data && (
          <>
            <AssignmentChecklist
              title="Pre-RNF assignments (First 60 Days)"
              defs={defsQuery.data.first60}
              completed={assignmentsCompleted}
            />
            <AssignmentChecklist
              title="Next 60 Days assignments"
              defs={defsQuery.data.next60}
              completed={assignmentsCompleted}
            />
          </>
        )}

        <div>
          <SectionHeading
            label="Core Products videos"
            done={videosCompleted.size}
            total={catalog.length}
          />
          <div className="mt-1.5">
            <VideoModules catalog={catalog} completed={videosCompleted} />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded border bg-background/60 px-2 py-1.5 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5 shrink-0" />
          Question bank: <span className="font-semibold text-foreground tabular-nums">{qbCorrect}</span>
          questions answered correctly at least once.
        </div>
      </div>
    </div>
  );
}
