import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Check, Play, Pause, Download, ExternalLink, FileText, ChevronDown, Maximize, Minimize } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { VideosByCategory } from '@/components/video-editing/VideosByCategory';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getVideoSlug } from '@/utils/slugUtils';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown-config';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isNotesOpen, setIsNotesOpen] = useState(!isMobile);
  const { toast } = useToast();
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast({
        title: "Fullscreen not available",
        description: "Your browser doesn't support fullscreen mode",
        variant: "destructive",
      });
    }
  }, [toast]);

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
        navigate(`/cmfas/module/${moduleId}/video/${videoSlug}`);
      } else if (productSlugOrId) {
        navigate(`/product/${productSlugOrId}/video/${videoSlug}`);
      }
    }
  }, [currentVideoIndex, videos, moduleType, moduleId, productSlugOrId, navigate]);

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
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-2 transition-all duration-300">
              <Card>
                {!currentVideo?.rich_content && (
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
                )}
                <CardContent>
                  {!currentVideo?.rich_content && (
                    videoInfo ? (
                      <div 
                        ref={videoContainerRef}
                        className={`relative rounded-lg overflow-hidden bg-muted group ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
                      >
                        <iframe
                          ref={iframeRef}
                          src={videoInfo.embedUrl}
                          title={currentVideo?.title}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          onLoad={() => setIsPlaying(false)}
                        />
                        {/* Fullscreen button overlay */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 hover:bg-black/90 text-white border-0 h-9 w-9"
                          onClick={toggleFullscreen}
                          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4" />
                          ) : (
                            <Maximize className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Invalid video URL</p>
                      </div>
                    )
                  )}

                  <div className="flex gap-2 mt-6">
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
                </CardContent>
              </Card>

              {/* Markdown Content or Legacy Notes */}
              {currentVideo?.rich_content ? (
                // Markdown mode - display formatted markdown
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={markdownComponents}
                          remarkPlugins={[remarkGfm]}
                        >
                          {currentVideo.rich_content}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </>
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
            <div className="space-y-6 order-1 lg:order-1 transition-all duration-300">
              {/* Course Navigation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Course Videos</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
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

              {/* Transcript Accordion - Hidden by Default */}
              <Collapsible defaultOpen={false}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Transcript
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {currentVideo?.transcript ? (
                        <div className="max-h-[400px] overflow-y-auto">
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">
                              {currentVideo.transcript}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No transcript available for this video.</p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>


              {/* Useful Links & Attachments - Only show if not using rich content */}
              {!currentVideo?.rich_content && (currentVideo?.useful_links?.length > 0 || currentVideo?.attachments?.length > 0) && (
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

        {/* Sticky Mark Complete Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-40 p-4">
          <div className="max-w-7xl mx-auto flex justify-center">
            <Button
              className="w-full max-w-md"
              size="lg"
              onClick={handleMarkComplete}
              disabled={currentProgress?.completed}
              variant={currentProgress?.completed ? "secondary" : "default"}
            >
              <Check className="h-5 w-5 mr-2" />
              {currentProgress?.completed ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});