import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { GraduationCap, Loader2, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { useLockMap } from "@/hooks/learning-track/useLockMap";
import { AdminTrackView } from "@/components/learning-track/AdminTrackView";
import First60Days from "@/pages/learning-track/First60Days";
import First60DaysAssignments from "@/pages/learning-track/First60DaysAssignments";

type PreRnfView = "first60" | "assignments";

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
  // Tab state is driven by the URL so each view is linkable / shareable:
  //   /learning-track/pre-rnf/first-60-days  → First 60 Days (default)
  //   /learning-track/pre-rnf/assignments    → Assignments grid
  //   /learning-track/pre-rnf/assignments/:itemId → Assignments, item expanded
  const { pathname } = useLocation();
  const view: PreRnfView = pathname.includes("/assignments") ? "assignments" : "first60";

  const tabClass = (isActive: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 transition-colors",
      isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-4" data-testid="pre-rnf-page">
      <div className="max-w-3xl mx-auto space-y-2.5">
        <Link
          to="/cmfas-exams"
          className="group relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-base font-bold font-serif leading-snug">CMFAS Exams</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Study modules, videos, and the AI tutor that prepare you to clear the papers.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/pre-rnf/assignments"
          className="group relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-base font-bold font-serif leading-snug">Assignments</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Weekly deliverables that turn the lessons into real reps with real prospects.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          role="tablist"
          aria-label="Pre-RNF training sections"
          className="inline-flex rounded-full border bg-muted/50 p-1 text-xs font-semibold"
        >
          <NavLink
            role="tab"
            to="/learning-track/pre-rnf/first-60-days"
            aria-selected={view === "first60"}
            className={tabClass(view === "first60")}
          >
            First 60 Days
          </NavLink>
          <NavLink
            role="tab"
            to="/learning-track/pre-rnf/assignments"
            aria-selected={view === "assignments"}
            className={tabClass(view === "assignments")}
          >
            Assignments
          </NavLink>
        </div>
      </div>

      {view === "first60" ? <First60Days /> : <First60DaysAssignments />}
    </div>
  );
}
