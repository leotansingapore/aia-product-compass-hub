import type { LearningTrackItem, LearningTrackPhase } from "@/types/learning-track";

export interface LockResult {
  locked: boolean;
  /** Why is this entity locked? `phase` = parent phase has unmet prereqs; `items` = sibling items unmet. */
  reason: "phase" | "items" | null;
  /** Human-readable titles of the prerequisites the user still needs to complete. */
  missingTitles: string[];
}

const UNLOCKED: LockResult = { locked: false, reason: null, missingTitles: [] };

/**
 * A phase is locked when `prerequisite_phase_id` is set AND any published item in the
 * referenced phase is not yet completed by the user. Unknown phase IDs are ignored
 * (treated as no prereq) — this is intentional, see SUPABASE.md handoff.
 */
export function computePhaseLocked(
  phase: LearningTrackPhase,
  phasesById: Map<string, LearningTrackPhase>,
  isCompleted: (id: string) => boolean,
): LockResult {
  if (!phase.prerequisite_phase_id) return UNLOCKED;
  const prereq = phasesById.get(phase.prerequisite_phase_id);
  if (!prereq) return UNLOCKED;
  const missing = prereq.items
    .filter((i) => i.published_at !== null)
    .filter((i) => !isCompleted(i.id));
  if (missing.length === 0) return UNLOCKED;
  return {
    locked: true,
    reason: "phase",
    missingTitles: [`${prereq.title} (${missing.length} item${missing.length === 1 ? "" : "s"} left)`],
  };
}

/**
 * An item is locked when any id in `prerequisite_item_ids` is not yet completed.
 * Unknown ids are silently dropped from the missing list (no item lookup possible).
 */
export function computeItemLocked(
  item: LearningTrackItem,
  itemsById: Map<string, LearningTrackItem>,
  isCompleted: (id: string) => boolean,
): LockResult {
  const prereqIds = item.prerequisite_item_ids ?? [];
  if (prereqIds.length === 0) return UNLOCKED;
  const missing = prereqIds.filter((id) => !isCompleted(id));
  if (missing.length === 0) return UNLOCKED;
  const titles = missing
    .map((id) => itemsById.get(id)?.title)
    .filter((t): t is string => Boolean(t));
  return { locked: true, reason: "items", missingTitles: titles };
}
