import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableVideos } from "@/components/EditableVideos";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import { AdminVideosByCategory } from "@/components/video-editing/AdminVideosByCategory";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useAdmin } from "@/hooks/useAdmin";
import { formatDuration } from "@/components/video-editing/videoUtils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GraduationCap, Play, Clock, BookOpen } from "lucide-react";
import type { TrainingVideo } from "@/hooks/useProducts";

interface CMFASTutorialLecturesProps {
  videos: TrainingVideo[];
  moduleId: string;
  moduleName: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function CMFASTutorialLectures({ videos, moduleId, moduleName, onUpdate }: CMFASTutorialLecturesProps) {
  const [showLearningInterface, setShowLearningInterface] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const { isAdmin: isAdminMode } = useAdmin();
  const { getCourseProgress, getVideoProgress, markVideoComplete, updateVideoProgress } = useVideoProgress(moduleId);

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
    id: video.id || `lecture-${index}`,
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
        productId={moduleId}
        moduleId={moduleId}
        moduleType="cmfas"
        onClose={() => setShowLearningInterface(false)}
        initialVideoIndex={selectedVideoIndex}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Tutorial Lectures
          {processedVideos.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-body-sm">
              {completedVideos}/{processedVideos.length} completed
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {processedVideos.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Comprehensive {moduleName} tutorial lectures</span>
                {courseProgress > 0 && (
                  <span className="text-sm font-medium text-primary">
                    {courseProgress}% Complete
                  </span>
                )}
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1 text-micro text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Total duration: {formatDuration(totalDuration)}
                </div>
              )}
            </div>
          ) : (
            `Tutorial lectures for ${moduleName} exam preparation`
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
              Start Tutorial Lectures
            </Button>
            
            <VideosByCategory
              videos={processedVideos}
              onVideoSelect={(index) => {
                setSelectedVideoIndex(index);
                setShowLearningInterface(true);
              }}
              getVideoProgress={getVideoProgress}
              useIndividualPages={true}
              moduleId={moduleId}
              moduleType="cmfas"
            />
          </div>
        ) : isAdminMode && processedVideos.length > 0 ? (
          <AdminVideosByCategory
            videos={processedVideos}
            onVideoSelect={(index) => {
              setSelectedVideoIndex(index);
              setShowLearningInterface(true);
            }}
            getVideoProgress={getVideoProgress}
            useIndividualPages={true}
            moduleId={moduleId}
            moduleType="cmfas"
            onSave={(newVideos) => onUpdate('tutorial_lectures', newVideos)}
          />
        ) : (
          <ErrorBoundary 
            fallback={
              <div className="p-4 text-center text-muted-foreground">
                <p>Unable to load lecture editing interface</p>
                <p className="text-sm mt-2">Please refresh the page and try again</p>
              </div>
            }
          >
            <EditableVideos
              videos={processedVideos}
              onSave={(newVideos) => onUpdate('tutorial_lectures', newVideos)}
            />
          </ErrorBoundary>
        )}
      </CardContent>
    </Card>
  );
}