import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableVideos } from "@/components/EditableVideos";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useAdmin } from "@/hooks/useAdmin";
import { formatDuration } from "@/components/video-editing/videoUtils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GraduationCap, Play, Check, Clock } from "lucide-react";
import type { TrainingVideo } from "@/hooks/useProducts";

interface ProductTrainingVideosProps {
  videos: TrainingVideo[];
  productId: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductTrainingVideos({ videos, productId, onUpdate }: ProductTrainingVideosProps) {
  const [showLearningInterface, setShowLearningInterface] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const { isAdminMode } = useAdmin();
  const { getCourseProgress, getVideoProgress } = useVideoProgress(productId);

  // Debug logging
  console.log('🎥 ProductTrainingVideos render:', {
    videosCount: videos?.length || 0,
    isAdminMode,
    productId,
    showLearningInterface
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Training Course
          {processedVideos.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {completedVideos}/{processedVideos.length} completed
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {processedVideos.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Interactive video learning course</span>
                {courseProgress > 0 && (
                  <span className="text-sm font-medium text-primary">
                    {courseProgress}% Complete
                  </span>
                )}
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Total duration: {formatDuration(totalDuration)}
                </div>
              )}
            </div>
          ) : (
            "Comprehensive video library for different learning purposes"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAdminMode && processedVideos.length > 0 ? (
          <div className="space-y-4">
            <Button 
              onClick={() => setShowLearningInterface(true)}
              className="w-full h-12"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Learning Course
            </Button>
            
            <VideosByCategory
              videos={processedVideos}
              onVideoSelect={(index) => {
                setSelectedVideoIndex(index);
                setShowLearningInterface(true);
              }}
              getVideoProgress={getVideoProgress}
              useIndividualPages={true}
            />
          </div>
        ) : (
          <ErrorBoundary 
            fallback={
              <div className="p-4 text-center text-muted-foreground">
                <p>Unable to load video editing interface</p>
                <p className="text-sm mt-2">Please refresh the page and try again</p>
              </div>
            }
          >
            <EditableVideos
              videos={processedVideos}
              onSave={(newVideos) => onUpdate('training_videos', newVideos)}
            />
          </ErrorBoundary>
        )}
      </CardContent>
    </Card>
  );
}