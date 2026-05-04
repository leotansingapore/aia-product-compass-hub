import { Link, useParams } from "react-router-dom";
import { GraduationCap, Loader2, ChevronRight, ClipboardList, Sparkles } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import First60DaysAssignments from "@/pages/learning-track/First60DaysAssignments";

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
          track="pre_rnf"
        />
      </div>
    );
  }

  return <PreRnfLearnerView />;
}

function PreRnfLearnerView() {
  return (
    <div className="space-y-4" data-testid="pre-rnf-page">
      <div className="max-w-3xl mx-auto space-y-2.5 px-1 sm:px-0">
        <Link
          to="/cmfas-exams"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">CMFAS Exams</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Study modules, videos, and the AI tutor that prepare you to clear the papers.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/first-60-days"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">First 60 Days</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">The day-by-day curriculum that builds your foundation as a financial consultant.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/product-mastery"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Optional</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">Product Mastery Track</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">7 weeks, one core product per week. Five days per product, 10-question quiz per day.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <First60DaysAssignments />
    </div>
  );
}
