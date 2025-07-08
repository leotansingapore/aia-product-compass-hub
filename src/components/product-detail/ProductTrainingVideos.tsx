import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableVideos } from "@/components/EditableVideos";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useAdmin } from "@/hooks/useAdmin";
import { GraduationCap, Play, Check } from "lucide-react";
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
            <div className="flex items-center justify-between">
              <span>Interactive video learning course</span>
              {courseProgress > 0 && (
                <span className="text-sm font-medium text-primary">
                  {courseProgress}% Complete
                </span>
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
            
            <div className="grid gap-3">
              {processedVideos.slice(0, 3).map((video, index) => {
                const progress = getVideoProgress(video.id);
                return (
                  <div 
                    key={video.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedVideoIndex(index);
                      setShowLearningInterface(true);
                    }}
                  >
                    <div className="flex-shrink-0">
                      {progress?.completed ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Play className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{video.title}</h4>
                      {video.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {index + 1}/{processedVideos.length}
                    </div>
                  </div>
                );
              })}
              
              {processedVideos.length > 3 && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLearningInterface(true)}
                    className="text-sm"
                  >
                    View all {processedVideos.length} videos
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EditableVideos
            videos={processedVideos}
            onSave={(newVideos) => onUpdate('training_videos', newVideos)}
          />
        )}
      </CardContent>
    </Card>
  );
}