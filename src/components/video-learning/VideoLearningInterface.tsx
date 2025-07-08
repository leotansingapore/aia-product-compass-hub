import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Check, Play, Pause } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoLearningInterfaceProps {
  videos: TrainingVideo[];
  productId: string;
  onClose: () => void;
  initialVideoIndex?: number;
}

function getVideoEmbedInfo(url: string) {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1`,
      type: 'youtube'
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      type: 'loom'
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      type: 'vimeo'
    };
  }

  return null;
}

export function VideoLearningInterface({ 
  videos, 
  productId, 
  onClose, 
  initialVideoIndex = 0 
}: VideoLearningInterfaceProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { 
    getVideoProgress, 
    markVideoComplete, 
    updateWatchTime, 
    getCourseProgress 
  } = useVideoProgress(productId);

  const currentVideo = videos[currentVideoIndex];
  const currentProgress = getVideoProgress(currentVideo?.id);
  const courseProgress = getCourseProgress(videos.length);

  // Track watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentVideo) {
      interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const percentage = currentVideo.duration ? Math.min((newTime / currentVideo.duration) * 100, 100) : 0;
          
          // Update progress every 10 seconds
          if (newTime % 10 === 0) {
            updateWatchTime(currentVideo.id, newTime, percentage);
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentVideo, updateWatchTime]);

  const handleMarkComplete = async () => {
    if (currentVideo) {
      await markVideoComplete(currentVideo.id);
    }
  };

  const navigateVideo = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setWatchTime(0);
    } else if (direction === 'next' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setWatchTime(0);
    }
  };

  const videoInfo = currentVideo ? getVideoEmbedInfo(currentVideo.url) : null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onClose}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Product
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">Training Course</h1>
                  <p className="text-sm text-muted-foreground">
                    Video {currentVideoIndex + 1} of {videos.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{courseProgress}% Complete</div>
                  <Progress value={courseProgress} className="w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {currentVideo?.title}
                      {currentProgress?.completed && (
                        <Badge variant="secondary" className="text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  {currentVideo?.description && (
                    <p className="text-muted-foreground">{currentVideo.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {videoInfo ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        ref={iframeRef}
                        src={videoInfo.embedUrl}
                        title={currentVideo?.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onLoad={() => setIsPlaying(false)}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Invalid video URL</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => navigateVideo('prev')}
                        disabled={currentVideoIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigateVideo('next')}
                        disabled={currentVideoIndex === videos.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleMarkComplete}
                      disabled={currentProgress?.completed}
                      variant={currentProgress?.completed ? "secondary" : "default"}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {currentProgress?.completed ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {videos.map((video, index) => {
                    const progress = getVideoProgress(video.id);
                    return (
                      <button
                        key={video.id}
                        onClick={() => {
                          setCurrentVideoIndex(index);
                          setWatchTime(0);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          index === currentVideoIndex 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {index + 1}. {video.title}
                              </span>
                              {progress?.completed && (
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            {video.duration && (
                              <div className="text-xs text-muted-foreground">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Additional Content */}
              {(currentVideo?.notes || currentVideo?.transcript) && (
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="notes" className="w-full">
                      <TabsList className="w-full">
                        {currentVideo?.notes && <TabsTrigger value="notes">Notes</TabsTrigger>}
                        {currentVideo?.transcript && <TabsTrigger value="transcript">Transcript</TabsTrigger>}
                      </TabsList>
                      {currentVideo?.notes && (
                        <TabsContent value="notes" className="p-4">
                          <div className="prose prose-sm max-w-none">
                            <h4>Learning Notes</h4>
                            <div className="whitespace-pre-wrap">{currentVideo.notes}</div>
                          </div>
                        </TabsContent>
                      )}
                      {currentVideo?.transcript && (
                        <TabsContent value="transcript" className="p-4">
                          <div className="prose prose-sm max-w-none">
                            <h4>Video Transcript</h4>
                            <div className="whitespace-pre-wrap text-sm">{currentVideo.transcript}</div>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}