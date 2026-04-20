import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import { TrackLearnerView } from "@/components/learning-track/TrackLearnerView";

export default function PreRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const phasesQuery = useLearningTrackPhases("pre_rnf", { includeContent: isAdmin });
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
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load Pre-RNF training track.
      </div>
    );
  }

  if (!isAdmin && phases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        No Pre-RNF modules published yet. Check back soon.
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-4" data-testid="pre-rnf-page">
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
    <div className="space-y-4" data-testid="pre-rnf-page">
      <TrackLearnerView
        phases={phases}
        isCompleted={isCompleted}
        lockMap={lockMap}
        expandedItemId={itemId}
      />
    </div>
  );
}
