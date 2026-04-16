import { useMemo } from "react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { computeItemLocked, computePhaseLocked, type LockResult } from "@/lib/learning-track/unlock";
import type { LearningTrackPhase } from "@/types/learning-track";

export interface LockMap {
  /** Admins always bypass gating so they can author content even when prereqs are unmet. */
  adminBypass: boolean;
  getItemLock: (itemId: string) => LockResult | null;
  getPhaseLock: (phaseId: string) => LockResult | null;
}

/**
 * Build per-item / per-phase lock state for an entire track in one pass.
 * Page-level hook — computed once and threaded down via props so PhaseSection
 * and LearningItemRow don't each recompute the same thing.
 */
export function useLockMap(phases: LearningTrackPhase[]): LockMap {
  const { user } = useSimplifiedAuth();
  const { isCompleted } = useLearningTrackProgress(user?.id);
  const { isAdmin } = useAdmin();

  return useMemo<LockMap>(() => {
    if (isAdmin) {
      return {
        adminBypass: true,
        getItemLock: () => null,
        getPhaseLock: () => null,
      };
    }

    const phasesById = new Map(phases.map((p) => [p.id, p]));
    const itemsById = new Map(phases.flatMap((p) => p.items).map((i) => [i.id, i]));
    const phaseLocks = new Map<string, LockResult>();
    const itemLocks = new Map<string, LockResult>();

    for (const phase of phases) {
      const phaseLock = computePhaseLocked(phase, phasesById, isCompleted);
      phaseLocks.set(phase.id, phaseLock);
      for (const item of phase.items) {
        // A locked phase locks all of its items with the same reason.
        if (phaseLock.locked) {
          itemLocks.set(item.id, phaseLock);
        } else {
          itemLocks.set(item.id, computeItemLocked(item, itemsById, isCompleted));
        }
      }
    }

    return {
      adminBypass: false,
      getItemLock: (id) => itemLocks.get(id) ?? null,
      getPhaseLock: (id) => phaseLocks.get(id) ?? null,
    };
  }, [phases, isCompleted, isAdmin]);
}
