import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Sparkles, Compass, ArrowLeft, ChevronRight, ChevronDown, Lock, CheckCircle2, Circle, Clock, Folder, BookOpen, GraduationCap, ShoppingBag, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { LearningItemRow } from "@/components/learning-track/LearningItemRow";
import { LessonContentPanel } from "@/components/learning-track/LessonContentPanel";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import { RequestUpgradeButton } from "@/components/tier/RequestUpgradeButton";
import { useMyTierRequests } from "@/hooks/useTierRequests";
import { TierBadge } from "@/components/tier/TierBadge";
import { groupItemsIntoModules, isModuleFolder } from "@/lib/learning-track/moduleGrouping";
import { cn } from "@/lib/utils";
import type { LearningTrackPhase } from "@/types/learning-track";

/** Learner sidebar: groups lessons under module folders, same as admin. */
function LearnerSidebar({
  phase,
  moduleIdx,
  activeItemId,
  isCompleted,
  lockMap,
  onSelectLesson,
  onToggleComplete,
  toggleBusy,
}: {
  phase: LearningTrackPhase;
  moduleIdx: number;
  activeItemId: string | null;
  isCompleted: (id: string) => boolean;
  lockMap: ReturnType<typeof useLockMap>;
  onSelectLesson: (id: string) => void;
  onToggleComplete: (itemId: string, currentlyCompleted: boolean) => void;
  toggleBusy: boolean;
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
    const isFolder = isModuleFolder(item);
    const canToggle = !itemLock?.locked && !isFolder;
    return (
      <div
        key={item.id}
        className={cn(
          "w-full flex items-center text-xs transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-l-primary"
            : "hover:bg-muted/50",
          itemLock?.locked && "opacity-40",
        )}
      >
        <button
          type="button"
          disabled={!canToggle || toggleBusy}
          aria-label={canToggle ? (completed ? "Mark incomplete" : "Mark complete") : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (!canToggle) return;
            onToggleComplete(item.id, completed);
          }}
          className={cn(
            "shrink-0 pl-8 pr-1 py-2 flex items-center justify-center",
            canToggle && "cursor-pointer hover:opacity-70",
            !canToggle && "cursor-default",
            toggleBusy && "opacity-50",
          )}
        >
          {itemLock?.locked ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelectLesson(item.id)}
          disabled={!!itemLock?.locked}
          className={cn(
            "flex-1 min-w-0 text-left pl-1.5 pr-3 py-2",
            itemLock?.locked && "cursor-not-allowed",
          )}
        >
          <span className="truncate block">{item.title}</span>
        </button>
      </div>
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
          const group = { module: seg.module, lessons: seg.lessons };
          const isCollapsed = collapsed.has(group.module.id);
          return (
            <div key={group.module.id} className="border-b border-border/30 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleModule(group.module.id)}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="shrink-0 text-muted-foreground">
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </span>
                <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="text-xs font-semibold truncate flex-1">{group.module.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{group.lessons.length}</span>
              </button>
              {!isCollapsed && group.lessons.map(renderLesson)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COUNTDOWN_SECONDS = 5;

function ModuleCompleteOverlay({
  title,
  hasNext,
  onGoNext,
  onBack,
}: {
  title: string;
  hasNext: boolean;
  onGoNext: () => void;
  onBack: () => void;
}) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const fired = useRef(false);

  // Text countdown only — the border animation is pure CSS (60fps)
  useEffect(() => {
    if (!hasNext) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!fired.current) { fired.current = true; onGoNext(); }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [hasNext, onGoNext]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto" data-testid="explorer-page">
      <div className="rounded-2xl border bg-gradient-to-br from-green-50 via-background to-emerald-50/50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20 p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold font-serif mb-2">Module complete!</h2>
        <p className="text-muted-foreground mb-6">{title} — done and dusted.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasNext && (
            <div
              className="countdown-border rounded-[10px] p-[3px]"
              style={{ "--countdown-duration": `${COUNTDOWN_SECONDS}s` } as React.CSSProperties}
            >
              <Button
                onClick={() => { fired.current = true; onGoNext(); }}
                className="gap-2 rounded-[7px]"
              >
                Go to next module
                <span className="text-xs opacity-70 tabular-nums">{remaining}s</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={onBack}>
            Back to learning track
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExplorerModuleCard({
  phase,
  moduleNumber,
  completedCount,
  totalCount,
  isLocked,
  onClick,
}: {
  phase: LearningTrackPhase;
  moduleNumber: number;
  completedCount: number;
  totalCount: number;
  isLocked: boolean;
  onClick: () => void;
}) {
  const allDone = totalCount > 0 && completedCount === totalCount;
  const inProgress = completedCount > 0 && !allDone;
  const description = phase.description?.trim() || "Start this module to begin learning.";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md",
        isLocked && "opacity-50 cursor-not-allowed",
      )}
      onClick={() => !isLocked && onClick()}
    >
      <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
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
            {isLocked ? "Locked" : allDone ? "Completed" : inProgress ? "In Progress" : `Module ${moduleNumber}`}
          </Badge>
          {isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : allDone ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          ) : null}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold font-serif leading-snug tracking-tight">
            {phase.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 sm:p-5 sm:pt-4 flex flex-col gap-3">
        {totalCount > 0 && (
          <div className="border-t border-border/60 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Progress
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} lessons
              </span>
            </div>
          </div>
        )}
        <Button
          variant="default"
          className="w-full gap-2 text-sm font-semibold"
          disabled={isLocked}
        >
          {isLocked ? "Locked" : allDone ? "Review" : inProgress ? "Continue" : "Start"}
          <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ExplorerTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const phasesQuery = useLearningTrackPhases("explorer");
  const { isCompleted, setStatus } = useLearningTrackProgress(user?.id);
  const allPhases = phasesQuery.data ?? [];
  // Financial Planning Basics moved to Supplementary Training — hide from Explorer for everyone.
  // Advisory Fundamentals is unpublished so learners already can't see it; admins keep access.
  const phases = allPhases.filter((p) => p.title.toLowerCase() !== "financial planning basics");
  const lockMap = useLockMap(phases);
  const { pendingRequest } = useMyTierRequests();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(() => {
    if (itemId) {
      const p = phases.find((ph) => ph.items.some((i) => i.id === itemId));
      return p?.id ?? null;
    }
    return null;
  });
  const [expandedItemId, setExpandedItemId] = useState<string | null>(itemId ?? null);
  const [moduleComplete, setModuleComplete] = useState<{
    title: string;
    nextPhaseId: string | null;
    nextLessonId: string | null;
  } | null>(null);

  const greeting = user?.email?.split("@")[0] || "there";
  const allLessonIds = phases.flatMap((p) => p.items.filter((i) => !isModuleFolder(i)).map((i) => i.id));
  const totalItems = allLessonIds.length;
  const completedItems = allLessonIds.filter((id) => isCompleted(id)).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allExplorerComplete = totalItems > 0 && completedItems === totalItems;

  // Find the next incomplete item across all phases (for the "Continue" hero)
  const nextItem = (() => {
    for (const phase of phases) {
      const phaseLock = lockMap?.getPhaseLock(phase.id);
      if (phaseLock?.locked) continue;
      for (const item of phase.items) {
        if (isModuleFolder(item)) continue;
        if (!isCompleted(item.id)) {
          const itemLock = lockMap?.getItemLock(item.id);
          if (!itemLock?.locked) return { phase, item };
        }
      }
    }
    return null;
  })();

  // Auto-advance: when a lesson is completed, open the next real lesson — skipping
  // module-folder rows (organizational only) and crossing into the next phase if needed.
  const handleLessonComplete = (completedItemId: string) => {
    const activePhase = phases.find((p) => p.id === activePhaseId);
    if (!activePhase) return;

    const isAdvanceable = (i: typeof activePhase.items[0]) => {
      if (isModuleFolder(i)) return false;
      const lock = lockMap?.getItemLock(i.id);
      return !lock?.locked;
    };

    const items = activePhase.items;
    const currentIdx = items.findIndex((i) => i.id === completedItemId);
    if (currentIdx === -1) return;

    // Check if ALL lessons in this phase are now complete (including the just-completed one).
    // If so, skip straight to the completion modal — even if the completed lesson isn't
    // the "last" one in order (e.g. user undid lesson #15, then re-completed it).
    const isCompletedNow = (id: string) => id === completedItemId || isCompleted(id);
    const allDoneInPhase = items.every((i) => isModuleFolder(i) || isCompletedNow(i.id));

    if (!allDoneInPhase) {
      // 1) Find the next incomplete lesson in the same phase.
      //    Look forward first, then wrap around (standalone pages may sit before modules).
      const isNextTarget = (i: typeof items[0]) =>
        isAdvanceable(i) && i.id !== completedItemId && !isCompleted(i.id);
      const nextInPhase =
        items.slice(currentIdx + 1).find(isNextTarget) ??
        items.find(isNextTarget);

      if (nextInPhase) {
        setTimeout(() => {
          setExpandedItemId(nextInPhase.id);
          document.getElementById(`item-${nextInPhase.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 800);
      }
      return;
    }

    // 2) All lessons done — find the next phase to offer in the completion modal.
    //    lockMap may be stale (computed before this completion), so re-check prerequisite
    //    completion including the just-completed item.
    const phaseIdx = phases.findIndex((p) => p.id === activePhase.id);
    const nextPhaseWithLesson = phases.slice(phaseIdx + 1).find((p) => {
      if (p.prerequisite_phase_id) {
        const prereq = phases.find((ph) => ph.id === p.prerequisite_phase_id);
        if (prereq) {
          const stillMissing = prereq.items
            .filter((i) => i.published_at !== null)
            .filter((i) => !isModuleFolder(i))
            .some((i) => !isCompletedNow(i.id));
          if (stillMissing) return false;
        }
      }
      return p.items.some((i) => !isModuleFolder(i));
    });

    const firstNextLesson = nextPhaseWithLesson?.items.find(
      (i) => !isModuleFolder(i),
    );
    setModuleComplete({
      title: activePhase.title,
      nextPhaseId: nextPhaseWithLesson?.id ?? null,
      nextLessonId: firstNextLesson?.id ?? null,
    });
  };

  if (phasesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phasesQuery.error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Something went wrong loading your modules. Try refreshing the page.
      </div>
    );
  }

  // Admin: master-detail module editor
  if (isAdmin) {
    return (
      <div className="space-y-4" data-testid="explorer-page">
        <AdminTrackView
          phases={phases}
          isCompleted={isCompleted}
          expandedItemId={itemId}
          lockMap={lockMap}
        />
      </div>
    );
  }

  const goToNextModule = () => {
    if (moduleComplete?.nextPhaseId) {
      setActivePhaseId(moduleComplete.nextPhaseId);
      setExpandedItemId(moduleComplete.nextLessonId);
    } else {
      setActivePhaseId(null);
      setExpandedItemId(null);
    }
    setModuleComplete(null);
  };

  const goBackToTrack = () => {
    setModuleComplete(null);
    setActivePhaseId(null);
    setExpandedItemId(null);
  };

  // ---- Module completion modal with countdown ----
  if (moduleComplete) {
    return (
      <ModuleCompleteOverlay
        title={moduleComplete.title}
        hasNext={!!moduleComplete.nextPhaseId}
        onGoNext={goToNextModule}
        onBack={goBackToTrack}
      />
    );
  }

  // ---- Learner: guided journey view ----
  return (
    <div
      className={cn(
        "space-y-6 mx-auto w-full",
        activePhaseId ? "max-w-6xl" : "max-w-3xl",
      )}
      data-testid="explorer-page"
    >

      {/* "Continue" hero — shows the next lesson to do */}
      {nextItem && !activePhaseId && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-background to-indigo-50/50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 p-6 sm:p-8">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <TierBadge tier="explorer" />
              <span className="text-xs text-muted-foreground">
                {completedItems} of {totalItems} lessons
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight mb-1">
              {completedItems === 0 ? `Hey ${greeting}, let's begin` : `Welcome back, ${greeting}`}
            </h1>
            <p className="text-muted-foreground text-sm mb-5">
              {completedItems === 0
                ? "Start your first lesson below."
                : "Pick up where you left off."}
            </p>

            {/* Next lesson card */}
            <Card
              className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
              onClick={() => {
                setActivePhaseId(nextItem.phase.id);
                setExpandedItemId(nextItem.item.id);
              }}
            >
              <CardContent className="!p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {nextItem.phase.title}
                  </p>
                  <p className="text-sm font-semibold truncate">{nextItem.item.title}</p>
                </div>
                <Button size="sm" className="shrink-0 gap-1">
                  {completedItems === 0 ? "Start" : "Continue"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>

            {/* Overall progress bar */}
            {totalItems > 0 && (
              <div className="mt-4 max-w-sm">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(progressPct, progressPct > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All-done hero — celebration + upgrade CTA */}
      {!nextItem && totalItems > 0 && !activePhaseId && (
        <div className="space-y-4">
          {/* Celebration */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-background to-emerald-50/50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20 p-6 sm:p-8">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
            <div className="relative text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight mb-2">
                Congratulations!
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                You've completed all Explorer modules. You're ready to take the next step in your FINternship journey.
              </p>
              {/* 100% progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Explorer progress</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* What's next — unlock preview */}
          <Card className="border-primary/20">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold font-serif">Unlock your next stage</h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Request an upgrade to <span className="font-semibold text-foreground">Papers-taker</span> tier and get access to:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: BookOpen, label: "First 60 Days", desc: "Daily training program" },
                  { icon: GraduationCap, label: "CMFAS Exam Prep", desc: "Certification study" },
                  { icon: ShoppingBag, label: "Product Training", desc: "Insurance & investment" },
                  { icon: MessageSquare, label: "AI Roleplay", desc: "Practice scenarios" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-center space-y-1.5"
                  >
                    <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      Locked
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                {pendingRequest ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                    <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Upgrade requested — awaiting admin approval
                    </span>
                  </div>
                ) : (
                  <RequestUpgradeButton
                    fromTier="explorer"
                    toTier="papers_taker"
                    label="Request upgrade to Papers-taker"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---- Inside a module: sidebar lesson outline + content panel ---- */}
      {activePhaseId && (() => {
        const activePhase = phases.find((p) => p.id === activePhaseId);
        if (!activePhase) return null;
        const moduleIdx = phases.indexOf(activePhase);
        const phaseItemIds = activePhase.items.filter((i) => !isModuleFolder(i)).map((i) => i.id);
        const phaseCompleted = phaseItemIds.filter((id) => isCompleted(id)).length;
        const phasePct = phaseItemIds.length > 0 ? Math.round((phaseCompleted / phaseItemIds.length) * 100) : 0;
        const activeItem = activePhase.items.find((i) => i.id === expandedItemId) ?? activePhase.items[0];

        return (
          <div className="space-y-3 w-full min-w-0">
            {/* Back + breadcrumb */}
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
                {phaseCompleted} of {phaseItemIds.length} · {phasePct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  phasePct === 100 ? "bg-green-500" : "bg-primary",
                )}
                style={{ width: `${phasePct}%` }}
              />
            </div>

            {/* Desktop: sidebar + content */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="hidden md:flex min-h-[450px]">
                {/* Sidebar — lesson outline */}
                <LearnerSidebar
                  phase={activePhase}
                  moduleIdx={moduleIdx}
                  activeItemId={activeItem?.id ?? null}
                  isCompleted={isCompleted}
                  lockMap={lockMap}
                  onSelectLesson={setExpandedItemId}
                  toggleBusy={setStatus.isPending}
                  onToggleComplete={(itemId, currentlyCompleted) => {
                    const next = currentlyCompleted ? "not_started" : "completed";
                    setStatus.mutate(
                      { itemId, status: next },
                      {
                        onSuccess: () => {
                          if (next === "completed") handleLessonComplete(itemId);
                        },
                      },
                    );
                  }}
                />

                {/* Content panel — active lesson */}
                <div className="flex-1 min-w-0 overflow-y-auto">
                  {activeItem ? (
                    <LessonContentPanel
                      item={activeItem}
                      lockResult={lockMap?.getItemLock(activeItem.id) ?? null}
                      onComplete={handleLessonComplete}
                    />
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Select a lesson from the sidebar.
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: stacked list (fallback) */}
              <div className="md:hidden">
                <div className="px-4 py-3 bg-muted/30 border-b">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Module {moduleIdx + 1}
                  </p>
                  <h2 className="text-base font-semibold font-serif">{activePhase.title}</h2>
                </div>
                <div className="divide-y">
                  {activePhase.items.map((item) => (
                    <LearningItemRow
                      key={item.id}
                      item={item}
                      isCompleted={isCompleted(item.id)}
                      defaultExpanded={item.id === expandedItemId}
                      lockResult={lockMap?.getItemLock(item.id) ?? null}
                      trackPhases={phases}
                      onComplete={handleLessonComplete}
                    />
                  ))}
                </div>
              </div>

              {activePhase.items.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No lessons in this module yet.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ---- Module card grid (when not inside a module) ---- */}
      {!activePhaseId && (
        <>
          {phases.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Modules coming soon</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your orientation content is being set up. You'll see your first module here once it's published.
                </p>
              </CardContent>
            </Card>
          )}

          {phases.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <Compass className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                All Modules
              </h2>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phases.map((phase, idx) => {
              const ids = phase.items.filter((i) => !isModuleFolder(i)).map((i) => i.id);
              const completed = ids.filter((id) => isCompleted(id)).length;
              const phaseLock = lockMap?.getPhaseLock(phase.id);
              return (
                <ExplorerModuleCard
                  key={phase.id}
                  phase={phase}
                  moduleNumber={idx + 1}
                  completedCount={completed}
                  totalCount={ids.length}
                  isLocked={!!phaseLock?.locked}
                  onClick={() => {
                    setActivePhaseId(phase.id);
                    // Auto-expand the first incomplete lesson
                    const firstIncomplete = phase.items.find((i) => !isCompleted(i.id));
                    setExpandedItemId(firstIncomplete?.id ?? phase.items[0]?.id ?? null);
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Upgrade nudge — only when still in progress (hero has the CTA when all done) */}
      {!activePhaseId && !allExplorerComplete && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1">Ready to go further?</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once you feel confident with the basics, request an upgrade to unlock CMFAS study, product training, and more.
              </p>
            </div>
            <RequestUpgradeButton
              fromTier="explorer"
              toTier="papers_taker"
              className="shrink-0"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
