
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { learningTrack, assignmentChecklist } from "@/data/learningTrackData";
import { useLearningTrackProgress } from "@/hooks/useLearningTrackProgress";
import { useLearningTrackContent } from "@/hooks/useLearningTrackContent";
import { useAssignmentProgress } from "@/hooks/useAssignmentProgress";
import { useTrackOverrides } from "@/hooks/useTrackOverrides";
import { useAssignmentOverrides } from "@/hooks/useAssignmentOverrides";
import { useAssignmentSubmissions } from "@/hooks/useAssignmentSubmissions";
import { TrackPhaseSection } from "@/components/learning-track/TrackPhaseSection";
import { AssignmentChecklist } from "@/components/learning-track/AssignmentChecklist";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { BookOpen, ClipboardCheck } from "lucide-react";

export default function LearningTrack() {
  const isMobile = useIsMobile();
  const progressHook = useLearningTrackProgress();
  const contentHook = useLearningTrackContent();
  const assignmentHook = useAssignmentProgress();
  const trackOverrides = useTrackOverrides();
  const assignmentOverrides = useAssignmentOverrides();
  const assignmentSubmissions = useAssignmentSubmissions();
  const { isMasterAdmin, isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const isAdminUser = (isMasterAdmin() || isAdmin()) && !isViewingAsUser;

  // Track progress (exclude hidden items)
  const allTrackIds = learningTrack.flatMap((phase) =>
    phase.items.filter((i) => !trackOverrides.isItemHidden(i.id)).map((i) => i.id)
  );
  const trackCompleted = progressHook.getCompletedCount(allTrackIds);
  const trackTotal = allTrackIds.length;
  const trackPercent = trackTotal > 0 ? Math.round((trackCompleted / trackTotal) * 100) : 0;

  // Assignment progress
  const allAssignmentIds = assignmentChecklist.flatMap((s) => s.items.map((i) => i.id));
  const assignmentCompleted = assignmentHook.getCompletedCount(allAssignmentIds);
  const assignmentTotal = allAssignmentIds.length;
  const assignmentPercent = assignmentTotal > 0 ? Math.round((assignmentCompleted / assignmentTotal) * 100) : 0;

  // Overall combined
  const totalCompleted = trackCompleted + assignmentCompleted;
  const totalItems = trackTotal + assignmentTotal;
  const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <PageLayout title="Learning Track" description="Track your onboarding progress">
      <div className="min-h-screen">
        <BrandedPageHeader
          title="Advisor Onboarding Track"
          subtitle="Your complete training roadmap from foundation to field-ready advisor."
        />

        <div className={`mx-auto max-w-4xl px-4 pb-24 ${isMobile ? "pt-4" : "pt-8"}`}>
          {/* Overall progress */}
          <div className="rounded-xl border bg-card p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Overall Progress</span>
              <div className="flex items-center gap-2">
                {overallPercent === 100 && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    Completed
                  </Badge>
                )}
                <span className="text-sm font-semibold tabular-nums">
                  {totalCompleted}/{totalItems} ({overallPercent}%)
                </span>
              </div>
            </div>
            <Progress value={overallPercent} className="h-3" />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>Training: {trackCompleted}/{trackTotal}</span>
              <span>Assignments: {assignmentCompleted}/{assignmentTotal}</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="training" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="training" className="flex-1 gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Training Track
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1 gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Assignment Checklist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="training">
              <div className="space-y-6">
                {learningTrack.map((phase) => (
                  <TrackPhaseSection
                    key={phase.id}
                    phase={phase}
                    progressHook={progressHook}
                    contentHook={contentHook}
                    isAdmin={isAdminUser}
                    overrides={trackOverrides}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments">
              <AssignmentChecklist
                sections={assignmentChecklist}
                progressHook={assignmentHook}
                isAdmin={isAdminUser}
                overrides={isAdminUser ? assignmentOverrides : undefined}
                submissionsHook={assignmentSubmissions}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
