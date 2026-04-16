import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { PhaseSection } from "@/components/learning-track/PhaseSection";
import { TrackProgressHeader } from "@/components/learning-track/TrackProgressHeader";
import { AddPhaseButton } from "@/components/learning-track/AddPhaseButton";

export default function ExplorerTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const phasesQuery = useLearningTrackPhases("explorer");
  const { isCompleted } = useLearningTrackProgress(user?.id);
  const phases = phasesQuery.data ?? [];
  const lockMap = useLockMap(phases);

  if (phasesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phasesQuery.error) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load Explorer training track.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="explorer-page">
      <TrackProgressHeader track="explorer" phases={phases} />
      {phases.length === 0 && (
        <div className="rounded border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-sm text-muted-foreground text-center">
          The Explorer track is being set up. Orientation modules will appear here once an admin publishes them.
        </div>
      )}
      {phases.map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          isCompleted={isCompleted}
          defaultOpen
          expandedItemId={itemId}
          lockMap={lockMap}
          trackPhases={phases}
        />
      ))}
      <AddPhaseButton track="explorer" currentPhaseCount={phases.length} />
    </div>
  );
}
