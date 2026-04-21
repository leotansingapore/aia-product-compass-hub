import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { ChevronRight, ChevronDown, Lock, CheckCircle2, Circle, Folder, ArrowLeft, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonContentPanel } from "./LessonContentPanel";
import { RequestUpgradeButton } from "@/components/tier/RequestUpgradeButton";
import { useMyTierRequests } from "@/hooks/useTierRequests";
import { useUserTier } from "@/hooks/useUserTier";
import { groupItemsIntoModules, isModuleFolder } from "@/lib/learning-track/moduleGrouping";
import { cn } from "@/lib/utils";
import type { LearningTrackPhase } from "@/types/learning-track";
import type { LockMap } from "@/hooks/learning-track/useLockMap";
import type { TierLevel } from "@/lib/tiers";

interface TrackLearnerViewProps {
  phases: LearningTrackPhase[];
  isCompleted: (itemId: string) => boolean;
  lockMap: LockMap;
  expandedItemId?: string;
  /**
   * When true, suppress the default "Module N" badge shown on cards that are
   * neither locked, in-progress, nor completed. Used by the Pre-RNF
   * Assignments view where the card title already carries "Assignment N".
   */
  hideIdleBadge?: boolean;
}

/**
 * Shared learner view for Pre-RNF and Post-RNF tracks.
 * Shows phase cards in a grid, clicking one opens sidebar + content panel.
 * Same pattern as Explorer's learner view.
 */
export function TrackLearnerView({ phases, isCompleted, lockMap, expandedItemId: initialItemId, hideIdleBadge = false }: TrackLearnerViewProps) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(() => {
    if (initialItemId) {
      const p = phases.find((ph) => ph.items.some((i) => i.id === initialItemId));
      return p?.id ?? null;
    }
    return null;
  });
  const [expandedItemId, setExpandedItemId] = useState<string | null>(initialItemId ?? null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const selectMobileLesson = (id: string) => {
    setExpandedItemId(id);
    requestAnimationFrame(() => {
      mobileContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const [trackComplete, setTrackComplete] = useState(false);
  const { tier } = useUserTier();
  const { pendingRequest } = useMyTierRequests();

  const NEXT_TIER: Record<TierLevel, { to: TierLevel; label: string } | null> = {
    explorer: { to: "papers_taker", label: "Papers-taker" },
    papers_taker: { to: "post_rnf", label: "Post-RNF" },
    post_rnf: null,
  };
  const nextTier = NEXT_TIER[tier];

  // All lessons across all phases
  const allLessons = phases.flatMap((p) => p.items.filter((i) => !isModuleFolder(i)));

  const handleLessonComplete = (completedItemId: string) => {
    // Check if this was the last incomplete lesson across the entire track
    const nowComplete = allLessons.every((i) => i.id === completedItemId || isCompleted(i.id));
    if (nowComplete) {
      setTrackComplete(true);
    }
  };

  // Track completion overlay — shown when user just completed the last lesson
  if (trackComplete) {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-green-500/8 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

          {/* Celebration */}
          <div className="relative px-5 pt-8 pb-5 sm:px-10 sm:pt-12 sm:pb-6 text-center">
            <div className="animate-celebrate-icon mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-5 sm:mb-6 ring-4 ring-green-200/50 dark:ring-green-800/30 shadow-lg shadow-green-500/10">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <div className="animate-celebrate-text space-y-2 mb-5 sm:mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Track complete</p>
              <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight">Congratulations!</h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                You've finished all modules in this track. {nextTier ? "Time to level up." : "You've reached the top!"}
              </p>
            </div>
            <div className="max-w-[200px] mx-auto">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="animate-celebrate-progress h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
              </div>
              <p className="text-[10px] text-green-600/80 font-medium mt-1.5">100% complete</p>
            </div>
          </div>

          {/* Upgrade CTA */}
          {nextTier && (
            <>
              <div className="mx-5 sm:mx-10 border-t border-border/50" />
              <div className="animate-celebrate-cta px-5 py-5 sm:px-10 sm:py-6 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">What's next</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to <span className="font-semibold text-foreground">{nextTier.label}</span> to unlock the next stage.
                </p>
                {pendingRequest ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                    <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Upgrade requested — awaiting approval</span>
                  </div>
                ) : (
                  <RequestUpgradeButton fromTier={tier} toTier={nextTier.to} label={`Request upgrade to ${nextTier.label}`} />
                )}
              </div>
            </>
          )}

          <div className="px-5 pb-6 sm:px-10 text-center">
            <Button variant="ghost" size="sm" onClick={() => { setTrackComplete(false); setActivePhaseId(null); setExpandedItemId(null); }} className="text-xs text-muted-foreground/60">
              Back to modules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inside a module view
  if (activePhaseId) {
    const activePhase = phases.find((p) => p.id === activePhaseId);
    if (!activePhase) return null;

    const lessons = activePhase.items.filter((i) => !isModuleFolder(i));
    const phaseCompleted = lessons.filter((i) => isCompleted(i.id)).length;
    const phasePct = lessons.length > 0 ? Math.round((phaseCompleted / lessons.length) * 100) : 0;
    const activeItem =
      (expandedItemId ? activePhase.items.find((i) => i.id === expandedItemId && !isModuleFolder(i)) : null) ??
      lessons.find((i) => !isCompleted(i.id)) ??
      lessons[0] ??
      null;

    return (
      <div className="space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setActivePhaseId(null); setExpandedItemId(null); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to modules
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {phaseCompleted} of {lessons.length} · {phasePct}%
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", phasePct === 100 ? "bg-green-500" : "bg-primary")}
            style={{ width: `${phasePct}%` }}
          />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="hidden md:flex min-h-[450px]">
            <Sidebar
              phase={activePhase}
              activeItemId={activeItem?.id ?? null}
              isCompleted={isCompleted}
              lockMap={lockMap}
              onSelectLesson={setExpandedItemId}
            />
            <div className="flex-1 min-w-0 overflow-y-auto">
              {activeItem ? (
                <LessonContentPanel item={activeItem} lockResult={lockMap?.getItemLock(activeItem.id) ?? null} onComplete={handleLessonComplete} />
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">Select a lesson from the sidebar.</div>
              )}
            </div>
          </div>

          {/* Mobile fallback */}
          <div className="md:hidden divide-y">
            {lessons.map((item) => {
              const itemLock = lockMap?.getItemLock(item.id);
              const locked = !!itemLock?.locked;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !locked && selectMobileLesson(item.id)}
                  disabled={locked}
                  aria-label={locked ? itemLock?.missingTitles.join(", ") : undefined}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left text-sm min-h-[44px] transition-colors",
                    item.id === expandedItemId && !locked ? "bg-primary/10 font-semibold" : "hover:bg-muted/50",
                    locked && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : isCompleted(item.id) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile content */}
          {activeItem && (
            <div ref={mobileContentRef} className="md:hidden border-t scroll-mt-20">
              <LessonContentPanel item={activeItem} lockResult={lockMap?.getItemLock(activeItem.id) ?? null} onComplete={handleLessonComplete} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Module cards grid
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {phases.map((phase, idx) => {
          const ids = phase.items.filter((i) => !isModuleFolder(i)).map((i) => i.id);
          const completed = ids.filter((id) => isCompleted(id)).length;
          const phaseLock = lockMap?.getPhaseLock(phase.id);
          const allDone = ids.length > 0 && completed === ids.length;
          const inProgress = completed > 0 && !allDone;
          const isLocked = !!phaseLock?.locked;
          const description = phase.description?.trim() || "Start this module to begin learning.";

          return (
            <Card
              key={phase.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md",
                isLocked && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => {
                if (isLocked) return;
                setActivePhaseId(phase.id);
                const phaseLessons = phase.items.filter((i) => !isModuleFolder(i));
                const firstIncomplete = phaseLessons.find((i) => !isCompleted(i.id));
                setExpandedItemId(firstIncomplete?.id ?? phaseLessons[0]?.id ?? null);
              }}
            >
              <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {isLocked || allDone || inProgress || !hideIdleBadge ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                        allDone
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : inProgress
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gradient-to-r from-amber-500 to-amber-600",
                      )}
                    >
                      {isLocked ? "Locked" : allDone ? "Completed" : inProgress ? "In Progress" : `Module ${idx + 1}`}
                    </Badge>
                  ) : (
                    <span aria-hidden />
                  )}
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : allDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : null}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold font-serif leading-snug tracking-tight">{phase.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">{description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3 sm:p-5 sm:pt-4 flex flex-col gap-3">
                {ids.length > 0 && (
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Progress</p>
                    <span className="text-sm text-muted-foreground">{completed} of {ids.length} lessons</span>
                  </div>
                )}
                <Button variant="default" className="w-full gap-2 text-sm font-semibold" disabled={isLocked}>
                  {isLocked ? "Locked" : allDone ? "Review" : inProgress ? "Continue" : "Start"}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** Sidebar for track learner view — groups lessons under module folders */
function Sidebar({
  phase,
  activeItemId,
  isCompleted,
  lockMap,
  onSelectLesson,
}: {
  phase: LearningTrackPhase;
  activeItemId: string | null;
  isCompleted: (id: string) => boolean;
  lockMap: LockMap;
  onSelectLesson: (id: string) => void;
}) {
  const { segments } = useMemo(() => groupItemsIntoModules(phase.items), [phase.items]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleModule = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderLesson = (item: typeof phase.items[0]) => {
    const completed = isCompleted(item.id);
    const itemLock = lockMap?.getItemLock(item.id);
    const isActive = item.id === activeItemId;
    if (isModuleFolder(item)) return null;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectLesson(item.id)}
        disabled={!!itemLock?.locked}
        className={cn(
          "w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-left text-xs transition-colors",
          isActive ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-l-primary" : "hover:bg-muted/50",
          itemLock?.locked && "opacity-40 cursor-not-allowed",
        )}
      >
        <span className="shrink-0">
          {itemLock?.locked ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>
        <span className="truncate">{item.title}</span>
      </button>
    );
  };

  return (
    <div className="w-64 xl:w-72 border-r bg-muted/30 overflow-y-auto shrink-0 flex flex-col">
      <div className="px-3 py-3 border-b">
        <h3 className="text-sm font-semibold truncate">{phase.title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {segments.map((seg) => {
          if (seg.type === "standalone") {
            return <Fragment key={seg.item.id}>{renderLesson(seg.item)}</Fragment>;
          }
          const isCollapsed = collapsed.has(seg.module.id);
          return (
            <div key={seg.module.id} className="border-b border-border/30 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleModule(seg.module.id)}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="shrink-0 text-muted-foreground">
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </span>
                <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="text-xs font-semibold truncate flex-1">{seg.module.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{seg.lessons.length}</span>
              </button>
              {!isCollapsed && seg.lessons.map(renderLesson)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
