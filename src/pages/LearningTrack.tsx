import { useState } from "react";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { learningTracks, type TrackModule } from "@/data/learningTrackData";
import { useLearningTrackProgress } from "@/hooks/useLearningTrackProgress";
import { TrackOverviewCard } from "@/components/learning-track/TrackOverviewCard";
import { TrackDetail } from "@/components/learning-track/TrackDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LearningTrack() {
  const [selectedTrack, setSelectedTrack] = useState<TrackModule | null>(null);
  const isMobile = useIsMobile();
  const progressHook = useLearningTrackProgress();

  const getAllItemIds = (track: TrackModule): string[] => {
    if (track.weeks) {
      return track.weeks.flatMap((w) => w.sessions.map((s) => s.id));
    }
    return track.items?.map((i) => i.id) ?? [];
  };

  return (
    <PageLayout title="Learning Track" description="Track your onboarding progress">
      <div className="min-h-screen">
        <BrandedPageHeader
          title="Learning Track"
          subtitle="Follow your structured training plan and track your progress step by step."
        />

        <div className={`mx-auto max-w-5xl px-4 pb-24 ${isMobile ? "pt-4" : "pt-8"}`}>
          {selectedTrack ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTrack(null)}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                All Tracks
              </Button>
              <TrackDetail track={selectedTrack} progressHook={progressHook} />
            </>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {learningTracks.map((track) => (
                <TrackOverviewCard
                  key={track.id}
                  track={track}
                  completedCount={progressHook.getCompletedCount(getAllItemIds(track))}
                  totalCount={getAllItemIds(track).length}
                  onSelect={() => setSelectedTrack(track)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
