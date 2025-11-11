import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Check, Play, Pause, Download, ExternalLink, FileText, ChevronDown, Share2 } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { VideosByCategory } from '@/components/video-editing/VideosByCategory';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getVideoSlug } from '@/utils/slugUtils';
import { useParams } from 'react-router-dom';

interface VideoLearningInterfaceProps {
  videos: TrainingVideo[];
  productId: string;
  onClose: () => void;
  initialVideoIndex?: number;
  moduleId?: string;
  moduleType?: 'product' | 'cmfas';
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

export const VideoLearningInterface = memo(function VideoLearningInterface({
  videos,
  productId,
  onClose,
  initialVideoIndex = 0,
  moduleId,
  moduleType = 'product'
}: VideoLearningInterfaceProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();
  const [isNotesOpen, setIsNotesOpen] = useState(!isMobile);
  const { toast } = useToast();
  const { productSlugOrId } = useParams();

  const {
    getVideoProgress,
    markVideoComplete,
    updateWatchTime,
    getCourseProgress
  } = useVideoProgress(productId);

  const currentVideo = useMemo(() => videos[currentVideoIndex], [videos, currentVideoIndex]);
  const currentProgress = useMemo(() => getVideoProgress(currentVideo?.id), [getVideoProgress, currentVideo?.id]);
  const courseProgress = useMemo(() => getCourseProgress(videos.length), [getCourseProgress, videos.length]);

  // Sync state with URL changes when video is selected from sidebar
  useEffect(() => {
    setCurrentVideoIndex(initialVideoIndex);
    setWatchTime(0);
  }, [initialVideoIndex]);

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

  const handleMarkComplete = useCallback(async () => {
    if (currentVideo) {
      await markVideoComplete(currentVideo.id);
    }
  }, [currentVideo, markVideoComplete]);

  const navigateVideo = useCallback((direction: 'prev' | 'next') => {
    let targetIndex = currentVideoIndex;

    if (direction === 'prev' && currentVideoIndex > 0) {
      targetIndex = currentVideoIndex - 1;
    } else if (direction === 'next' && currentVideoIndex < videos.length - 1) {
      targetIndex = currentVideoIndex + 1;
    } else {
      return; // No navigation needed
    }

    const targetVideo = videos[targetIndex];
    if (targetVideo) {
      const videoSlug = getVideoSlug(targetVideo.title);

      // Use appropriate URL pattern based on module type
      if (moduleType === 'cmfas' && moduleId) {
        window.location.href = `/cmfas/module/${moduleId}/video/${videoSlug}`;
      } else if (productSlugOrId) {
        window.location.href = `/product/${productSlugOrId}/video/${videoSlug}`;
      }
    }
  }, [currentVideoIndex, videos, moduleType, moduleId, productSlugOrId]);

  const handleShare = useCallback(async () => {
    if (!currentVideo) return;

    const videoSlug = getVideoSlug(currentVideo.title);

    // Generate appropriate URL based on module type
    let shareUrl: string;
    if (moduleType === 'cmfas' && moduleId) {
      shareUrl = `${window.location.origin}/cmfas/module/${moduleId}/video/${videoSlug}`;
    } else if (productSlugOrId) {
      shareUrl = `${window.location.origin}/product/${productSlugOrId}/video/${videoSlug}`;
    } else {
      return; // Cannot generate share URL without context
    }

    const shareData = {
      title: currentVideo.title,
      text: currentVideo.description || `Watch "${currentVideo.title}" on FINternship`,
      url: shareUrl,
    };

    try {
      // Try using Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Video link has been shared",
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Video link has been copied to clipboard",
        });
      }
    } catch (error) {
      // User cancelled share or clipboard copy failed
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Share failed",
          description: "Could not share or copy the video link",
          variant: "destructive",
        });
      }
    }
  }, [currentVideo, moduleType, moduleId, productSlugOrId, toast]);

  const videoInfo = useMemo(() => currentVideo ? getVideoEmbedInfo(currentVideo.url) : null, [currentVideo]);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={onClose} className="flex-shrink-0">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Back to Product</span>
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-semibold truncate">Training Course</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Video {currentVideoIndex + 1} of {videos.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-medium">{courseProgress}%</div>
                  <Progress value={courseProgress} className="w-16 sm:w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-start sm:items-center gap-2 flex-wrap">
                      <span className="break-words">{currentVideo?.title}</span>
                      {currentProgress?.completed && (
                        <Badge variant="secondary" className="text-xs text-green-600 flex-shrink-0">
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-6">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => navigateVideo('prev')}
                        disabled={currentVideoIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => navigateVideo('next')}
                        disabled={currentVideoIndex === videos.length - 1}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none"
                        onClick={handleMarkComplete}
                        disabled={currentProgress?.completed}
                        variant={currentProgress?.completed ? "secondary" : "default"}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {currentProgress?.completed ? "Completed" : "Mark Complete"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rich Content or Legacy Notes & Transcript */}
              {currentVideo?.rich_content ? (
                // Rich editor mode - display formatted HTML
                <Card>
                  <CardContent className="p-6">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentVideo.rich_content }}
                    />
                  </CardContent>
                </Card>
              ) : (currentVideo?.notes || currentVideo?.transcript) ? (
                // Legacy mode - display tabs
                <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                  <Card>
                    {isMobile && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto hover:bg-accent"
                        >
                          <span className="font-semibold">Notes & Transcript</span>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleContent>
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
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideosByCategory
                    videos={videos}
                    onVideoSelect={(index) => {
                      setCurrentVideoIndex(index);
                      setWatchTime(0);
                    }}
                    getVideoProgress={getVideoProgress}
                    useIndividualPages={true}
                    currentVideoId={currentVideo?.id}
                    moduleId={moduleId}
                    moduleType={moduleType}
                  />
                </CardContent>
              </Card>


              {/* Useful Links & Attachments */}
              {(currentVideo?.useful_links?.length > 0 || currentVideo?.attachments?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Useful Links */}
                    {currentVideo?.useful_links?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Useful Links</h4>
                        <div className="grid gap-2">
                          {currentVideo.useful_links.map((link, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <span className="mr-2">{link.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{link.name}</div>
                                <div className="text-micro text-muted-foreground truncate">
                                  {link.url}
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {currentVideo?.attachments?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Downloadable Resources</h4>
                        <div className="grid gap-2">
                          {currentVideo.attachments.map((attachment, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <FileText className="h-5 w-5 mr-3 text-primary" />
                              <div className="text-left flex-1">
                                <div className="font-medium">{attachment.name}</div>
                                <div className="text-micro text-muted-foreground flex gap-2">
                                  {attachment.file_type && (
                                    <span>{attachment.file_type}</span>
                                  )}
                                  {attachment.file_size && (
                                    <span>
                                      {attachment.file_size > 1024 * 1024 
                                        ? `${(attachment.file_size / (1024 * 1024)).toFixed(1)} MB`
                                        : `${Math.round(attachment.file_size / 1024)} KB`
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Download className="h-4 w-4 ml-auto" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});