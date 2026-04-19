import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { PhaseSection } from "@/components/learning-track/PhaseSection";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import { TrackProgressHeader } from "@/components/learning-track/TrackProgressHeader";

export default function PostRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const phasesQuery = useLearningTrackPhases("post_rnf");
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
        Failed to load Post-RNF training track.
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-4" data-testid="post-rnf-page">
        <AdminTrackView
          phases={phases}
          isCompleted={isCompleted}
          expandedItemId={itemId}
          lockMap={lockMap}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="post-rnf-page">
      <TrackProgressHeader track="post_rnf" phases={phases} />
      {phases.map((phase, idx) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          isCompleted={isCompleted}
          defaultOpen
          expandedItemId={itemId}
          lockMap={lockMap}
          trackPhases={phases}
          moduleNumber={idx + 1}
        />
      ))}
    </div>
  );
}
