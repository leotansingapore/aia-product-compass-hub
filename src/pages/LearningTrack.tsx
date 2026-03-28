import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { learningTrack } from "@/data/learningTrackData";
import { useLearningTrackProgress } from "@/hooks/useLearningTrackProgress";
import { useLearningTrackContent } from "@/hooks/useLearningTrackContent";
import { TrackPhaseSection } from "@/components/learning-track/TrackPhaseSection";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";

export default function LearningTrack() {
  const isMobile = useIsMobile();
  const progressHook = useLearningTrackProgress();
  const contentHook = useLearningTrackContent();
  const { isMasterAdmin, isAdmin } = usePermissions();
  const isAdminUser = isMasterAdmin() || isAdmin();

  const allIds = learningTrack.flatMap((phase) => phase.items.map((i) => i.id));
  const completed = progressHook.getCompletedCount(allIds);
  const total = allIds.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

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
                {percent === 100 && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    Completed
                  </Badge>
                )}
                <span className="text-sm font-semibold tabular-nums">
                  {completed}/{total} ({percent}%)
                </span>
              </div>
            </div>
            <Progress value={percent} className="h-3" />
          </div>

          {/* Phases */}
          <div className="space-y-6">
            {learningTrack.map((phase) => (
              <TrackPhaseSection
                key={phase.id}
                phase={phase}
                progressHook={progressHook}
                contentHook={contentHook}
                isAdmin={isAdminUser}
              />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
