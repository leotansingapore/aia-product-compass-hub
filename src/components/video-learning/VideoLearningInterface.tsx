import { useState, useRef, useEffect, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Check, FileText, ChevronDown, Link2, SquarePen, CheckCircle2, Circle, List, X, Play } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { VideosByCategory } from '@/components/video-editing/VideosByCategory';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TrainingVideo } from '@/hooks/useProducts';
import { getVideoSlug } from '@/utils/slugUtils';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/lib/markdown-config';
import { detectVideoEmbed, VideoEmbed } from '@/lib/video-embed-utils';
import { usePermissions } from '@/hooks/usePermissions';

const InlineQuiz = lazy(() => import('@/components/quiz/InlineQuiz').then(m => ({ default: m.InlineQuiz })));
const InlineAssignment = lazy(() => import('@/components/assignments/InlineAssignment'));

interface VideoLearningInterfaceProps {
  videos: TrainingVideo[];
  productId: string;
  onClose: () => void;
  initialVideoIndex?: number;
  moduleId?: string;
  moduleType?: 'product' | 'cmfas';
}

function getVideoEmbedInfo(url: string) {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return { embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1`, type: 'youtube' };
  }
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return { embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`, type: 'loom' };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:manage\/videos\/|channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/)?(\d+)(?:\/([a-f0-9]+))?(?:$|\/|\?)/);
  if (vimeoMatch) {
    const hash = vimeoMatch[4] ? `?h=${vimeoMatch[4]}` : '';
    return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}${hash}`, type: 'vimeo' };
  }
  // Direct MP4 URLs
  const mp4Match = url.match(/\.mp4(\?|$|#)/i);
  if (mp4Match) {
    return { embedUrl: url, type: 'mp4' };
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const miniNavRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();
  const { isMasterAdmin, hasRole } = usePermissions();
  const isAdmin = isMasterAdmin() || hasRole('admin');

  const { getVideoProgress, markVideoComplete, updateVideoProgress, updateWatchTime, getCourseProgress } = useVideoProgress(productId);

  const handleToggleComplete = useCallback(async (videoId: string, currentlyCompleted: boolean) => {
    if (currentlyCompleted) {
      await updateVideoProgress(videoId, { completed: false, completion_percentage: 0 });
    } else {
      await markVideoComplete(videoId);
    }
  }, [markVideoComplete, updateVideoProgress]);

  const currentVideo = useMemo(() => videos[currentVideoIndex], [videos, currentVideoIndex]);

  // Auto-complete handler for quiz/assignment items
  const handleItemComplete = useCallback(async () => {
    if (currentVideo) {
      await markVideoComplete(currentVideo.id);
    }
  }, [currentVideo, markVideoComplete]);

  const currentProgress = useMemo(() => getVideoProgress(currentVideo?.id), [getVideoProgress, currentVideo?.id]);
  const courseProgress = useMemo(() => getCourseProgress(videos.length), [getCourseProgress, videos.length]);

  useEffect(() => {
    setCurrentVideoIndex(initialVideoIndex);
    setWatchTime(0);
    setShowMobileSidebar(false);
    setVideoError(false);
  }, [initialVideoIndex]);

  // Scroll mini-nav to keep current item visible
  useEffect(() => {
    if (miniNavRef.current) {
      const activeEl = miniNavRef.current.querySelector('[data-active="true"]');
      activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentVideoIndex]);

  // Track watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentVideo) {
      interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const percentage = currentVideo.duration ? Math.min((newTime / currentVideo.duration) * 100, 100) : 0;
          if (newTime % 10 === 0) updateWatchTime(currentVideo.id, newTime, percentage);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentVideo, updateWatchTime]);

  const handleToggleStickyComplete = useCallback(async () => {
    if (currentVideo) {
      await handleToggleComplete(currentVideo.id, !!currentProgress?.completed);
    }
  }, [currentVideo, currentProgress, handleToggleComplete]);

  const navigateVideo = useCallback((direction: 'prev' | 'next') => {
    let targetIndex = currentVideoIndex;
    if (direction === 'prev' && currentVideoIndex > 0) targetIndex = currentVideoIndex - 1;
    else if (direction === 'next' && currentVideoIndex < videos.length - 1) targetIndex = currentVideoIndex + 1;
    else return;

    const targetVideo = videos[targetIndex];
    if (targetVideo) {
      const videoSlug = getVideoSlug(targetVideo.title);
      if (moduleType === 'cmfas' && moduleId) {
        navigate(`/cmfas/module/${moduleId}/video/${videoSlug}`);
      } else if (productSlugOrId) {
        navigate(`/product/${productSlugOrId}/video/${videoSlug}`);
      }
    }
  }, [currentVideoIndex, videos, moduleType, moduleId, productSlugOrId, navigate]);

  const videoInfo = useMemo(() => currentVideo ? getVideoEmbedInfo(currentVideo.url) : null, [currentVideo]);

  // True when the rich_content markdown already embeds the same video — hides the standalone player to avoid duplicates.
  // Uses the embed URL's video ID so minor URL param differences (e.g. ?sid=) don't cause false negatives.
  const richContentHasVideo = useMemo(() => {
    if (!currentVideo?.rich_content?.trim() || !currentVideo?.url) return false;
    const embedInfo = detectVideoEmbed(currentVideo.url);
    if (!embedInfo.isVideo || !embedInfo.embedUrl) return false;
    // Extract the core video ID from the embed URL (last path segment before any query)
    const embedPath = embedInfo.embedUrl.split('?')[0];
    const videoId = embedPath.split('/').pop();
    if (!videoId) return false;
    return currentVideo.rich_content.includes(videoId);
  }, [currentVideo]);

  const sidebarContent = (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Course Videos</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1 lg:hidden" onClick={() => setShowMobileSidebar(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2">
          <VideosByCategory
            videos={videos}
            onVideoSelect={(index) => {
              setCurrentVideoIndex(index);
              setWatchTime(0);
              setVideoError(false);
              setShowMobileSidebar(false);
              setShouldAutoplay(true);
              const targetVideo = videos[index];
              if (targetVideo) {
                const videoSlug = getVideoSlug(targetVideo.title);
                if (moduleType === 'cmfas' && moduleId) {
                  navigate(`/cmfas/module/${moduleId}/video/${videoSlug}`, { replace: true });
                } else if (productSlugOrId) {
                  navigate(`/product/${productSlugOrId}/video/${videoSlug}`, { replace: true });
                }
              }
            }}
            getVideoProgress={getVideoProgress}
            onToggleComplete={handleToggleComplete}
            currentVideoId={currentVideo?.id}
            moduleId={moduleId}
            moduleType={moduleType}
          />
        </CardContent>
      </Card>

      {/* Transcript */}
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
                  <p className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">{currentVideo.transcript}</p>
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

      {/* Resources */}
      {(currentVideo?.useful_links?.length > 0 || currentVideo?.attachments?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {currentVideo?.useful_links?.map((link, index) => (
              <div key={`link-${index}`} className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{link.name}</a>
              </div>
            ))}
            {currentVideo?.attachments?.map((attachment) => (
              <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                {(attachment.file_type || '').toLowerCase() === 'pdf' ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-destructive/10 text-destructive text-xs font-bold flex-shrink-0">PDF</span>
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{attachment.name}</a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen">

        {/* ── Sticky Header ── */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center gap-2">

              {/* Back */}
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 h-9 w-9">
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Title + progress */}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-medium truncate leading-tight">
                  {currentVideo?.title || 'Training Course'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={courseProgress} className="flex-1 h-1.5 max-w-28 sm:max-w-40" />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {currentVideoIndex + 1}/{videos.length}
                  </span>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Admin edit */}
                {isAdmin && productSlugOrId && (
                  <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3" onClick={() => navigate(`/product/${productSlugOrId}/manage-videos`)}>
                    <SquarePen className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">Edit</span>
                  </Button>
                )}

                {/* Course list toggle — below lg */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 lg:hidden"
                  onClick={() => setShowMobileSidebar(true)}
                  aria-label="Show course videos"
                >
                  <List className="h-4 w-4" />
                </Button>

                {/* Prev / Next — desktop only in header; mobile gets bottom bar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden sm:flex"
                  onClick={() => navigateVideo('prev')}
                  disabled={currentVideoIndex === 0}
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-2 sm:px-3 hidden sm:flex"
                  onClick={() => navigateVideo('next')}
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-28 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

            {/* Video + mini-nav column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">

              {/* Content area — switches based on item type */}
              {currentVideo?.type === 'quiz' && currentVideo.quiz_config ? (
                <Suspense fallback={<Card><CardContent className="p-8 text-center text-muted-foreground">Loading quiz...</CardContent></Card>}>
                  <InlineQuiz
                    title={currentVideo.title}
                    description={currentVideo.description}
                    quizConfig={currentVideo.quiz_config}
                    onComplete={handleItemComplete}
                  />
                </Suspense>
              ) : currentVideo?.type === 'assignment' && currentVideo.assignment_config ? (
                <Suspense fallback={<Card><CardContent className="p-8 text-center text-muted-foreground">Loading assignment...</CardContent></Card>}>
                  <InlineAssignment
                    title={currentVideo.title}
                    description={currentVideo.description}
                    assignmentConfig={currentVideo.assignment_config}
                    productId={productId}
                    itemId={currentVideo.id}
                    onComplete={handleItemComplete}
                  />
                </Suspense>
              ) : (
              <>
              {/* Video player — hide if rich_content already embeds this video (avoids duplicate), or if no valid URL */}
              {!richContentHasVideo && videoInfo && (
                <Card>
                  <CardHeader className="py-3 px-4 sm:py-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <CardTitle className="flex items-start sm:items-center gap-2 flex-wrap text-sm sm:text-base leading-snug">
                        <span className="break-words">{currentVideo?.title}</span>
                        {currentProgress?.completed && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    {currentVideo?.description && (
                      <p className="text-muted-foreground text-sm mt-1">{currentVideo.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
                    <div className="relative bg-muted sm:rounded-lg aspect-video">
                      {videoError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-4">
                          <Play className="h-10 w-10 opacity-40" />
                          <p className="text-sm font-medium">Video not available</p>
                          <p className="text-xs text-center max-w-sm">This video hasn't been uploaded yet. Please check back later or contact your training coordinator.</p>
                        </div>
                      ) : videoInfo.type === 'mp4' ? (
                        <video
                          src={videoInfo.embedUrl}
                          title={currentVideo?.title}
                          className="w-full h-full"
                          controls
                          controlsList="nodownload"
                          preload="metadata"
                          playsInline
                          autoPlay={shouldAutoplay}
                          onError={() => setVideoError(true)}
                        />
                      ) : (
                        <iframe
                          ref={iframeRef}
                          key={videoInfo.embedUrl}
                          src={shouldAutoplay ? `${videoInfo.embedUrl}${videoInfo.embedUrl.includes('?') ? '&' : '?'}autoplay=1` : videoInfo.embedUrl}
                          title={currentVideo?.title}
                          className="w-full h-full absolute inset-0"
                          allowFullScreen
                          // @ts-ignore — legacy attributes needed for Safari/Firefox fullscreen
                          webkitallowfullscreen="true"
                          mozallowfullscreen="true"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          style={{ border: 0 }}
                          onLoad={() => { setIsPlaying(false); setShouldAutoplay(false); }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Mobile mini video nav strip ── */}
              {videos.length > 1 && (
                <div className="lg:hidden">
                  <div
                    ref={miniNavRef}
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {videos.map((video, idx) => {
                      const vProgress = getVideoProgress(video.id);
                      const isDone = !!vProgress?.completed;
                      const isCurrent = idx === currentVideoIndex;
                      const slug = getVideoSlug(video.title);
                      return (
                        <button
                          key={video.id}
                          data-active={isCurrent}
                          onClick={() => {
                            if (moduleType === 'cmfas' && moduleId) {
                              navigate(`/cmfas/module/${moduleId}/video/${slug}`);
                            } else if (productSlugOrId) {
                              navigate(`/product/${productSlugOrId}/video/${slug}`);
                            }
                          }}
                          className={`snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all max-w-[160px] ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : isDone
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          }`}
                        >
                          {isDone && !isCurrent ? (
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                          ) : (
                            <span className="flex-shrink-0 w-4 text-center tabular-nums opacity-60">{idx + 1}</span>
                          )}
                          <span className="truncate">{video.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rich content — embed video links UNLESS they match the standalone player's URL */}
              {currentVideo?.rich_content?.trim() ? (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          ...markdownComponents,
                          // Prevent <div> (VideoEmbed) inside <p> invalid HTML
                          p: ({ children }: any) => {
                            const childArray = Array.isArray(children) ? children : [children];
                            const hasBlock = childArray.some(
                              (c: any) => c?.type === 'div' || (typeof c === 'object' && c?.props?.className?.includes('my-4'))
                            );
                            if (hasBlock) return <div className="mb-3 last:mb-0">{children}</div>;
                            return <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>;
                          },
                          // Always embed video links — standalone player deduplication is handled by richContentHasVideo above
                          a: ({ children, href }: any) => {
                            const embedInfo = detectVideoEmbed(href ?? '');
                            if (embedInfo.isVideo && embedInfo.embedUrl) {
                              const autoplayUrl = shouldAutoplay
                                ? `${embedInfo.embedUrl}${embedInfo.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
                                : embedInfo.embedUrl;
                              return <VideoEmbed embedUrl={autoplayUrl} platform={embedInfo.platform || 'video'} />;
                            }
                            return (
                              <a
                                href={href}
                                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {currentVideo.rich_content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : !videoInfo ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="rounded-full bg-muted p-4">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">Content coming soon</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      This lecture hasn't been set up yet. Check back later or contact your admin.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
              </>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-6 order-2 lg:order-1">
              {sidebarContent}
            </div>
          </div>
        </div>

        {/* ── Mobile/Tablet Sidebar Drawer ── */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
            <div className="relative ml-auto w-[85vw] max-w-sm h-full bg-background overflow-y-auto shadow-2xl">
              <div className="p-4 pb-24">
                {sidebarContent}
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Bottom bar: Prev | Mark Complete | Next ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-40 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2">

            {/* Prev — mobile only */}
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 flex-shrink-0 sm:hidden"
              onClick={() => navigateVideo('prev')}
              disabled={currentVideoIndex === 0}
              aria-label="Previous video"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Mark complete */}
            <Button
              className="flex-1 max-w-md mx-auto h-11"
              onClick={handleToggleStickyComplete}
              variant={currentProgress?.completed ? "secondary" : "default"}
            >
              {currentProgress?.completed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Completed — tap to undo</span>
                </>
              ) : (
                <>
                  <Circle className="h-5 w-5 mr-2" />
                  <span>Mark Complete</span>
                </>
              )}
            </Button>

            {/* Next — mobile only */}
            <Button
              variant="default"
              size="icon"
              className="h-11 w-11 flex-shrink-0 sm:hidden"
              onClick={() => navigateVideo('next')}
              disabled={currentVideoIndex === videos.length - 1}
              aria-label="Next video"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

          </div>
        </div>

      </div>
    </div>
  );
});
