import { useParams, Link } from "react-router-dom";
import { Loader2, CalendarDays, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirst30DaysProgress } from "@/hooks/first-30-days/useFirst30DaysProgress";
import { TOTAL_DAYS } from "@/features/first-30-days/summaries";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import { TrackLearnerView } from "@/components/learning-track/TrackLearnerView";

export default function PostRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const phasesQuery = useLearningTrackPhases("post_rnf", { includeContent: isAdmin });
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
        Failed to load Post-RNF training track.
      </div>
    );
  }

  if (!isAdmin && phases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        No Post-RNF modules published yet. Check back soon.
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
          track="post_rnf"
        />
      </div>
    );
  }

  return (
    <PostRnfLearnerView
      phases={phases}
      isCompleted={isCompleted}
      lockMap={lockMap}
      expandedItemId={itemId}
    />
  );
}

/** Post-RNF learner view — First 30 Days card at top + track modules below */
function PostRnfLearnerView(props: { phases: any[]; isCompleted: any; lockMap: any; expandedItemId?: string }) {
  const { completedCount } = useFirst30DaysProgress();
  const done = completedCount();
  const pct = TOTAL_DAYS > 0 ? Math.round((done / TOTAL_DAYS) * 100) : 0;

  return (
    <div className="space-y-4" data-testid="post-rnf-page">
      {/* First 30 Days entry card */}
      <Link to="/learning-track/first-30-days" className="block">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">Your First 30 Days</p>
              <p className="text-sm text-muted-foreground">
                {done === 0
                  ? "Start your daily guided programme for licensed consultants."
                  : `${done} of ${TOTAL_DAYS} days complete · ${pct}%`}
              </p>
            </div>
            <Button variant="default" size="sm" className="shrink-0 gap-1.5">
              {done === 0 ? "Start" : done === TOTAL_DAYS ? "Review" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>

      <TrackLearnerView
        phases={props.phases}
        isCompleted={props.isCompleted}
        lockMap={props.lockMap}
        expandedItemId={props.expandedItemId}
      />
    </div>
  );
}
