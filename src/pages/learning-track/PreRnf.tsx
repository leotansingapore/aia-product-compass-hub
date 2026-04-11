import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { PhaseSection } from "@/components/learning-track/PhaseSection";
import { TrackProgressHeader } from "@/components/learning-track/TrackProgressHeader";

export default function PreRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const phasesQuery = useLearningTrackPhases("pre_rnf");
  const { isCompleted } = useLearningTrackProgress(user?.id);

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
        Failed to load Pre-RNF training track.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pre-rnf-page">
      <TrackProgressHeader track="pre_rnf" />
      {(phasesQuery.data ?? []).map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          isCompleted={isCompleted}
          defaultOpen
          expandedItemId={itemId}
        />
      ))}
    </div>
  );
}
