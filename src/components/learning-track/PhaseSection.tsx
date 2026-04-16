import { useState, lazy, Suspense } from "react";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
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
  /** Lock state for the whole track. Pass `useLockMap(phases)` from the page. */
  lockMap?: LockMap;
  /** All phases in the same track — needed by admin prerequisite pickers. */
  trackPhases?: LearningTrackPhase[];
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
}: PhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { isAdmin } = useAdmin();
  const completedCount = phase.items.filter((i) => isCompleted(i.id)).length;
  const showAdmin = isAdmin && !readOnly;
  const phaseLock = lockMap?.getPhaseLock(phase.id) ?? null;
  const isPhaseLocked = !!phaseLock?.locked;

  return (
    <section className="rounded-lg border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full px-4 py-3 text-left cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-start gap-2">
          <div className="mt-1 shrink-0">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn("font-semibold flex items-center gap-2", isPhaseLocked && "text-muted-foreground")}>
              {isPhaseLocked && (
                <Lock
                  className="h-4 w-4 text-muted-foreground"
                  aria-label="Locked"
                />
              )}
              {phase.title}
            </h2>
            {phase.description && (
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium whitespace-nowrap">
                {completedCount} / {phase.items.length}
              </span>
              {isPhaseLocked && phaseLock && (
                <span
                  className="rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-1 text-xs text-amber-800 dark:text-amber-200 whitespace-nowrap truncate max-w-[260px]"
                  title={`Unlocks after: ${phaseLock.missingTitles.join(", ")}`}
                >
                  Unlocks after: {phaseLock.missingTitles.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && showAdmin && (
        <Suspense fallback={<div className="border-t px-4 py-6 text-center text-sm text-muted-foreground">Loading editor…</div>}>
          <AdminPhaseControls
            phase={phase}
            isCompleted={isCompleted}
            expandedItemId={expandedItemId}
            readOnly={readOnly}
            viewAsUserId={viewAsUserId}
            lockMap={lockMap}
            trackPhases={trackPhases}
          />
        </Suspense>
      )}

      {open && !showAdmin && (
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
