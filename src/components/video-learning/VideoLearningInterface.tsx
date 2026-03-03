import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Check, Play, Pause, Download, ExternalLink, FileText, ChevronDown, Maximize, Minimize, Link2 } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { VideosByCategory } from '@/components/video-editing/VideosByCategory';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getVideoSlug } from '@/utils/slugUtils';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
  const vimeoMatch = url.match(/vimeo\.com\/(?:manage\/videos\/|channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/)?(\d+)(?:\/([a-f0-9]+))?(?:$|\/|\?)/);
  if (vimeoMatch) {
    const hash = vimeoMatch[4] ? `?h=${vimeoMatch[4]}` : '';
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}${hash}`,
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
        {/* Header with Navigation */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Back button */}
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 h-9 w-9">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {/* Title and progress */}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-medium truncate">{currentVideo?.title || 'Training Course'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={courseProgress} className="flex-1 h-1.5 max-w-32" />
                  <span className="text-xs text-muted-foreground">{currentVideoIndex + 1}/{videos.length}</span>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigateVideo('prev')}
                  disabled={currentVideoIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigateVideo('next')}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-2 transition-all duration-300">
              <Card>
                {/* Show header when there's no rich content, OR when there's a video URL */}
                {(!currentVideo?.rich_content || videoInfo) && (
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
                    {!currentVideo?.rich_content && currentVideo?.description && (
                      <p className="text-muted-foreground">{currentVideo.description}</p>
                    )}
                  </CardHeader>
                )}
                <CardContent>
                  {/* Show video player when there's a valid video URL, regardless of rich_content */}
                  {videoInfo ? (
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
                  ) : !currentVideo?.rich_content ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Invalid video URL</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Markdown Content or Legacy Notes */}
              {currentVideo?.rich_content?.trim() ? (
                // Markdown mode - display formatted markdown
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={markdownComponents}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
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


              {/* Resources — show for ALL videos (rich_content or not) */}
              {(currentVideo?.useful_links?.length > 0 || currentVideo?.attachments?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {/* Links */}
                    {currentVideo?.useful_links?.map((link, index) => (
                      <div key={`link-${index}`} className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {link.name}
                        </a>
                      </div>
                    ))}

                    {/* Attachments */}
                    {currentVideo?.attachments?.map((attachment) => (
                      <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                        {(attachment.file_type || '').toLowerCase() === 'pdf' ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">PDF</span>
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
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