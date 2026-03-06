import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import { AdminVideosByCategory } from "@/components/video-editing/AdminVideosByCategory";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useAdmin } from "@/hooks/useAdmin";
import { formatDuration } from "@/components/video-editing/videoUtils";
import { getVideoSlug } from "@/utils/slugUtils";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Play, Edit, Clock, CheckCircle2 } from "lucide-react";
import type { TrainingVideo } from "@/hooks/useProducts";

interface ProductTrainingVideosProps {
  videos: TrainingVideo[];
  productId: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductTrainingVideos({ videos, productId, onUpdate }: ProductTrainingVideosProps) {
  const [showLearningInterface, setShowLearningInterface] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const { isAdmin: isAdminMode } = useAdmin();
  const { getCourseProgress, getVideoProgress, markVideoComplete, updateVideoProgress } = useVideoProgress(productId);
  const navigate = useNavigate();
  const { productSlugOrId } = useParams();

  const handleToggleComplete = async (videoId: string, currentlyCompleted: boolean) => {
    if (currentlyCompleted) {
      await updateVideoProgress(videoId, { completed: false, completion_percentage: 0 });
    } else {
      await markVideoComplete(videoId);
    }
  };

  // Ensure videos have IDs and are sorted by order
  const processedVideos = (videos || []).map((video, index) => ({
    ...video,
    id: video.id || `video-${index}`,
    order: video.order ?? index
  })).sort((a, b) => a.order - b.order);

  const courseProgress = getCourseProgress(processedVideos.length);
  const completedVideos = processedVideos.filter(video => 
    getVideoProgress(video.id)?.completed
  ).length;

  // Calculate total course duration
  const totalDuration = processedVideos.reduce((sum, video) => 
    sum + (video.duration || 0), 0
  );

  if (showLearningInterface) {
    return (
      <VideoLearningInterface
        videos={processedVideos}
        productId={productId}
        onClose={() => setShowLearningInterface(false)}
        initialVideoIndex={selectedVideoIndex}
      />
    );
  }

  const handleManageVideos = () => {
    navigate(`/product/${productSlugOrId}/manage-videos`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Training Course
            {processedVideos.length > 0 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                {completedVideos}/{processedVideos.length} lessons
              </Badge>
            )}
          </CardTitle>
          {isAdminMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageVideos}
              className="flex items-center gap-1.5 text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Manage Videos</span>
              <span className="sm:hidden">Manage</span>
            </Button>
          )}
        </div>
        {processedVideos.length > 0 && (
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                {totalDuration > 0 && (
                  <>
                    <Clock className="h-3 w-3" />
                    {formatDuration(totalDuration)} total
                  </>
                )}
              </span>
              <span className={`font-semibold ${courseProgress === 100 ? 'text-primary' : 'text-foreground'}`}>
                {courseProgress === 100 ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Course complete!
                  </span>
                ) : courseProgress > 0 ? (
                  `${courseProgress}% complete`
                ) : (
                  'Not started'
                )}
              </span>
            </div>
            <Progress value={courseProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-4 md:p-6 pt-0">
        {processedVideos.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {!isAdminMode && (
              <Button 
                onClick={() => {
                  if (processedVideos.length > 0 && productSlugOrId) {
                    // Resume: find first incomplete video, or start from beginning
                    const firstIncomplete = processedVideos.find(v => !getVideoProgress(v.id)?.completed);
                    const targetVideo = firstIncomplete || processedVideos[0];
                    const videoSlug = getVideoSlug(targetVideo.title);
                    navigate(`/product/${productSlugOrId}/video/${videoSlug}`);
                  } else {
                    setShowLearningInterface(true);
                  }
                }}
                className="w-full h-10 sm:h-12 text-sm"
                size="lg"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {courseProgress > 0 && courseProgress < 100 ? 'Resume Learning' : courseProgress === 100 ? 'Review Course' : 'Start Learning'}
              </Button>
            )}
            
            {isAdminMode ? (
              <AdminVideosByCategory
                videos={processedVideos}
                onVideoSelect={(index) => {
                  setSelectedVideoIndex(index);
                  setShowLearningInterface(true);
                }}
                getVideoProgress={getVideoProgress}
                useIndividualPages={true}
                onSave={(newVideos) => onUpdate('training_videos', newVideos)}
              />
            ) : (
              <VideosByCategory
                videos={processedVideos}
                onVideoSelect={(index) => {
                  setSelectedVideoIndex(index);
                  setShowLearningInterface(true);
                }}
                getVideoProgress={getVideoProgress}
                onToggleComplete={handleToggleComplete}
                useIndividualPages={true}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No training videos available</p>
            {isAdminMode && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleManageVideos}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Videos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}