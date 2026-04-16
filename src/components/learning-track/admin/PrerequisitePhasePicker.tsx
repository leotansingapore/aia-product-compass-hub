import { Lock } from "lucide-react";
import { useUpdatePhase } from "@/hooks/learning-track/useAdminLearningTrackMutations";
import type { LearningTrackPhase } from "@/types/learning-track";

interface Props {
  phase: LearningTrackPhase;
  /** All phases in the same track — used to enumerate valid earlier phases. */
  trackPhases: LearningTrackPhase[];
}

/**
 * Admin-only single-select for `learning_track_phases.prerequisite_phase_id`.
 * Only earlier phases (lower order_index) are offered to avoid circular deps.
 * Empty = no prereq.
 */
export function PrerequisitePhasePicker({ phase, trackPhases }: Props) {
  const updatePhase = useUpdatePhase();

  const eligible = trackPhases
    .filter((p) => p.id !== phase.id && p.order_index < phase.order_index)
    .sort((a, b) => a.order_index - b.order_index);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    updatePhase.mutate({ id: phase.id, prerequisite_phase_id: value });
  };

  if (eligible.length === 0 && !phase.prerequisite_phase_id) {
    // Don't clutter the header when there are no earlier phases to depend on.
    return null;
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="This phase will stay locked for users until the chosen earlier phase is fully completed.">
      <Lock className="h-3 w-3" />
      <span>Unlocks after</span>
      <select
        value={phase.prerequisite_phase_id ?? ""}
        onChange={handleChange}
        className="bg-transparent border border-muted-foreground/30 rounded px-1.5 py-0.5 text-xs outline-none focus:border-primary max-w-[180px] truncate"
      >
        <option value="">— no prereq —</option>
        {eligible.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </label>
  );
}
