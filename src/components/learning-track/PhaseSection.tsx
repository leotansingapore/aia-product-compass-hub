import { useState, lazy, Suspense } from "react";
import { ChevronDown, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import type { LearningTrackPhase, LearningTrackItem } from "@/types/learning-track";
import type { LockMap } from "@/hooks/learning-track/useLockMap";
import { cn } from "@/lib/utils";
import { LearningItemRow } from "./LearningItemRow";

const AdminPhaseControls = lazy(() => import("./AdminPhaseControls"));

interface PhaseSectionProps {
  phase: LearningTrackPhase;
  isCompleted: (itemId: string) => boolean;
  defaultOpen?: boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
  lockMap?: LockMap;
  trackPhases?: LearningTrackPhase[];
  /** 1-based module number for learner view. */
  moduleNumber?: number;
}

export function PhaseSection({
  phase,
  isCompleted,
  defaultOpen = true,
  expandedItemId,
  readOnly = false,
  viewAsUserId,
  lockMap,
  trackPhases,
  moduleNumber,
}: PhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { isAdmin } = useAdmin();
  const completedCount = phase.items.filter((i) => isCompleted(i.id)).length;
  const totalCount = phase.items.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const showAdmin = isAdmin && !readOnly;
  const phaseLock = lockMap?.getPhaseLock(phase.id) ?? null;
  const isPhaseLocked = !!phaseLock?.locked;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Admin view is handled by AdminTrackView at the page level (master-detail).
  // PhaseSection only renders the learner view now.
  // If showAdmin is true and we still get rendered (e.g. recruit detail, read-only admin),
  // fall through to the learner view below.
  if (showAdmin && !readOnly) {
    return null;
  }

  // ---------- Learner view: course-module style ----------
  return (
    <section className={cn("rounded-2xl border bg-card overflow-hidden transition-all", isPhaseLocked && "opacity-60")}>
      {/* Module header — always visible, click to expand/collapse */}
      <button
        type="button"
        onClick={() => !isPhaseLocked && setOpen((o) => !o)}
        disabled={isPhaseLocked}
        className={cn(
          "w-full px-5 py-4 text-left flex items-center gap-4 transition-colors",
          !isPhaseLocked && "hover:bg-muted/50 cursor-pointer",
          isPhaseLocked && "cursor-not-allowed",
        )}
        aria-expanded={open}
      >
        {/* Module number / status circle */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors",
          isPhaseLocked
            ? "bg-muted text-muted-foreground"
            : allDone
              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
              : progressPct > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
        )}>
          {isPhaseLocked ? (
            <Lock className="h-4 w-4" />
          ) : allDone ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            moduleNumber ?? phase.order_index + 1
          )}
        </div>

        {/* Title + description + progress */}
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold font-serif", isPhaseLocked && "text-muted-foreground")}>
            {phase.title}
          </h2>
          {phase.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{phase.description}</p>
          )}
        </div>

        {/* Right side: progress or lock message */}
        <div className="shrink-0 flex items-center gap-3">
          {isPhaseLocked && phaseLock ? (
            <span className="text-xs text-muted-foreground hidden sm:inline">Locked</span>
          ) : totalCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {completedCount} of {totalCount}
              </span>
              {/* Mini progress bar */}
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    allDone ? "bg-green-500" : progressPct > 0 ? "bg-primary" : "bg-transparent",
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : null}
          <div className="shrink-0">
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </button>

      {/* Lessons list */}
      {open && !isPhaseLocked && (
        <div className="border-t divide-y">
          {phase.items.map((item) => (
            <LearningItemRow
              key={item.id}
              item={item}
              isCompleted={isCompleted(item.id)}
              defaultExpanded={item.id === expandedItemId}
              readOnly={readOnly}
              viewAsUserId={viewAsUserId}
              lockResult={lockMap?.getItemLock(item.id) ?? null}
              trackPhases={trackPhases}
            />
          ))}
        </div>
      )}
    </section>
  );
}
