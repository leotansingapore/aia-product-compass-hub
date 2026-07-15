import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Film, GraduationCap, PlayCircle, Search, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  getDaySummaries as getF60DaySummaries,
  prefetchDay as prefetchF60Day,
  WEEK_META as F60_WEEK_META,
  WEEKS_WITH_RECAP,
} from "@/features/first-60-days/content";
import {
  getDaySummaries as getPmDaySummaries,
  prefetchDay as prefetchPmDay,
  WEEK_META as PM_WEEK_META,
} from "@/features/product-mastery-track/content";
import { loadAllAssignments, type Assignment } from "@/features/first-60-days/assignments";
import { cmfasModuleVideos, getCMFASModuleName } from "@/data/cmfasModuleData";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";

type SearchEntry = {
  /** Unique cmdk value — also what the default filter matches against. */
  value: string;
  title: string;
  meta: string;
  href: string;
  keywords: string[];
  onWarm?: () => void;
};

const CMFAS_MODULE_IDS = ["onboarding", "m9", "m9a", "hi", "res5"] as const;

/**
 * Search across everything the learner can open right now: unlocked First 60
 * Days lessons and recaps, assignments, unlocked Product Mastery days, and
 * CMFAS modules/videos. Locked content stays out of the results — the index
 * is rebuilt from the same unlock hooks the hub cards use, so the two never
 * disagree.
 */
export default function LearningSearch() {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const navigate = useNavigate();
  const { isUnlocked: isF60Unlocked } = useFirst60DaysProgress();
  const { isUnlocked: isPmUnlocked } = useProductMasteryProgress();

  // Cmd/Ctrl+K opens the palette while the hub is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Assignment markdown lives in lazy chunks — only fetch once the dialog is
  // actually opened, then keep the parsed list for the session.
  useEffect(() => {
    if (!open || assignments) return;
    let cancelled = false;
    loadAllAssignments().then((all) => {
      if (!cancelled) setAssignments(all);
    });
    return () => {
      cancelled = true;
    };
  }, [open, assignments]);

  const lessonEntries = useMemo<SearchEntry[]>(() => {
    return getF60DaySummaries()
      .filter((d) => isF60Unlocked(d.dayNumber))
      .map((d) => {
        const week = F60_WEEK_META[d.week];
        return {
          value: `f60-day-${d.dayNumber} ${d.title} ${week?.title ?? ""}`,
          title: d.title,
          meta: `Day ${d.dayNumber} · Week ${d.week} — ${week?.title ?? ""} · ${d.duration} min`,
          href: `/learning-track/first-60-days/day/${d.dayNumber}`,
          keywords: [`day ${d.dayNumber}`, `week ${d.week}`, week?.tagline ?? ""],
          onWarm: () => prefetchF60Day(d.dayNumber),
        };
      });
  }, [isF60Unlocked]);

  const recapEntries = useMemo<SearchEntry[]>(() => {
    const summaries = getF60DaySummaries();
    return [...WEEKS_WITH_RECAP]
      .sort((a, b) => a - b)
      .filter((weekNumber) =>
        summaries.some((d) => d.week === weekNumber && isF60Unlocked(d.dayNumber)),
      )
      .map((weekNumber) => {
        const week = F60_WEEK_META[weekNumber];
        return {
          value: `f60-recap-${weekNumber} recap ${week?.title ?? ""}`,
          title: `Week ${weekNumber} Recap`,
          meta: week ? `${week.title} · video recap` : "Video recap",
          href: `/learning-track/first-60-days/recap/${weekNumber}`,
          keywords: ["recap", "video", `week ${weekNumber}`, week?.tagline ?? ""],
        };
      });
  }, [isF60Unlocked]);

  const assignmentEntries = useMemo<SearchEntry[]>(() => {
    if (!assignments) return [];
    return assignments.map((a) => ({
      value: `assignment-${a.slug} ${a.frontmatter.title} ${a.frontmatter.short}`,
      title: a.frontmatter.title,
      meta: [a.frontmatter.short, a.frontmatter.estimated_time].filter(Boolean).join(" · "),
      href: `/learning-track/pre-rnf/assignments/${a.frontmatter.url_slug ?? a.slug}`,
      keywords: ["assignment", a.frontmatter.deliverable],
    }));
  }, [assignments]);

  const productMasteryEntries = useMemo<SearchEntry[]>(() => {
    return getPmDaySummaries()
      .filter((d) => isPmUnlocked(d.dayNumber))
      .map((d) => {
        const week = PM_WEEK_META[d.week];
        return {
          value: `pm-day-${d.dayNumber} ${d.title} ${week?.title ?? ""}`,
          title: d.title,
          meta: `${week?.title ?? "Product Mastery"} · Day ${d.dayInWeek} of 5`,
          href: `/learning-track/product-mastery/day/${d.dayNumber}`,
          keywords: ["product", week?.productSlug ?? "", week?.tagline ?? ""],
          onWarm: () => prefetchPmDay(d.dayNumber),
        };
      });
  }, [isPmUnlocked]);

  const cmfasEntries = useMemo<SearchEntry[]>(() => {
    const modules: SearchEntry[] = CMFAS_MODULE_IDS.map((id) => ({
      value: `cmfas-module-${id} ${getCMFASModuleName(id)}`,
      title: getCMFASModuleName(id),
      meta: "CMFAS study module",
      href: `/cmfas/module/${id}`,
      keywords: ["cmfas", "exam", "paper", id],
    }));
    const videos: SearchEntry[] = CMFAS_MODULE_IDS.flatMap((id) =>
      (cmfasModuleVideos[id] ?? []).map((v) => ({
        value: `cmfas-video-${v.id} ${v.title}`,
        title: v.title,
        meta: `${getCMFASModuleName(id)} · video`,
        href: `/cmfas/module/${id}/video/${v.id}`,
        keywords: ["cmfas", "video", v.description ?? ""],
      })),
    );
    return [...modules, ...videos];
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate],
  );

  const groups: { heading: string; icon: typeof Search; entries: SearchEntry[] }[] = [
    { heading: "Lessons — First 60 Days", icon: GraduationCap, entries: lessonEntries },
    { heading: "Week Recaps", icon: Film, entries: recapEntries },
    { heading: "Assignments", icon: ClipboardList, entries: assignmentEntries },
    { heading: "Product Mastery", icon: Sparkles, entries: productMasteryEntries },
    { heading: "CMFAS Exams", icon: PlayCircle, entries: cmfasEntries },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="learning-search-trigger"
        className="flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/60"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">
          Search lessons, assignments, recaps…
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search your unlocked lessons, assignments, anything…" />
        <CommandList>
          <CommandEmpty>
            No matches in your unlocked content. Complete more days to unlock more lessons.
          </CommandEmpty>
          {groups
            .filter((g) => g.entries.length > 0)
            .map((g, i) => (
              <div key={g.heading}>
                {i > 0 && <CommandSeparator />}
                <CommandGroup heading={g.heading}>
                  {g.entries.map((entry) => (
                    <CommandItem
                      key={entry.value}
                      value={entry.value}
                      keywords={entry.keywords}
                      onSelect={() => go(entry.href)}
                      onMouseEnter={entry.onWarm}
                      className="gap-3"
                    >
                      <g.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{entry.meta}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
