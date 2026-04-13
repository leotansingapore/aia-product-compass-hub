import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock, FileText, Lightbulb, Link2, List, Play } from "lucide-react";
import { formatDuration } from "@/components/video-editing/videoUtils";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import type { TrainingVideo } from "@/hooks/useProducts";
import { getVideoEmbedInfo } from "@/components/video-editing/videoUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { areSameVideoEmbedSource, detectVideoEmbed, VideoEmbed } from "@/lib/video-embed-utils";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const OUTLINE_SHEET_ID = "product-course-outline";

export interface ProductModuleCourseLayoutProps {
  /** Must match `useVideoProgress` / video_progress keys for this product */
  productId: string;
  productTitle: string;
  videos: TrainingVideo[];
  tabOverview: React.ReactNode;
  tabResources: React.ReactNode;
  tabMyNotes: React.ReactNode;
  defaultTab?: "course-content" | "overview" | "resources" | "my-notes";
  className?: string;
  /** Study/Exam paths shown in sidebar */
  hasStudy?: boolean;
  hasExam?: boolean;
  /** Route slug for study/exam links (e.g. 'pro-achiever') */
  originalSlug?: string;
}

export function ProductModuleCourseLayout({
  productId,
  productTitle,
  videos,
  tabOverview,
  tabResources,
  tabMyNotes,
  defaultTab = "course-content",
  className,
  hasStudy,
  hasExam,
  originalSlug,
}: ProductModuleCourseLayoutProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { getVideoProgress, markVideoComplete, updateVideoProgress, getCourseProgress } =
    useVideoProgress(productId);

  const processedVideos = useMemo(
    () =>
      (videos || [])
        .map((video, index) => ({
          ...video,
          id: video.id || `video-${index}`,
          order: video.order ?? index,
        }))
        .sort((a, b) => a.order - b.order),
    [videos]
  );

  const currentVideo = processedVideos[currentVideoIndex];
  const courseProgressPct = useMemo(
    () => getCourseProgress(processedVideos.length),
    [getCourseProgress, processedVideos.length]
  );
  const completedCount = useMemo(
    () => processedVideos.filter(v => getVideoProgress(v.id)?.completed).length,
    [processedVideos, getVideoProgress]
  );
  const totalDuration = useMemo(
    () => processedVideos.reduce((sum, v) => sum + (v.duration || 0), 0),
    [processedVideos]
  );
  const isFirstVisit = completedCount === 0 && processedVideos.length > 0;
  const navigate = useNavigate();

  const handleToggleComplete = useCallback(
    async (videoId: string, currentlyCompleted: boolean) => {
      if (currentlyCompleted) {
        await updateVideoProgress(videoId, { completed: false, completion_percentage: 0 });
      } else {
        await markVideoComplete(videoId);
      }
    },
    [markVideoComplete, updateVideoProgress]
  );

  useEffect(() => {
    setVideoError(false);
    setShouldAutoplay(false);
  }, [currentVideoIndex]);

  useEffect(() => {
    setCurrentVideoIndex((i) => {
      if (processedVideos.length === 0) return 0;
      return Math.min(Math.max(0, i), processedVideos.length - 1);
    });
  }, [processedVideos.length]);

  const videoInfo = useMemo(
    () => (currentVideo?.url ? getVideoEmbedInfo(currentVideo.url) : null),
    [currentVideo?.url]
  );

  const iframeSrc = useMemo(() => {
    if (!videoInfo) return "";
    let url = videoInfo.embedUrl;
    if (videoInfo.type === "youtube") {
      url += url.includes("?") ? "&" : "?";
      url += "enablejsapi=1";
    }
    if (shouldAutoplay) {
      url += url.includes("?") ? "&" : "?";
      url += "autoplay=1";
    }
    return url;
  }, [videoInfo, shouldAutoplay]);

  const onSelectVideoFromOutline = useCallback((index: number) => {
    setCurrentVideoIndex(index);
    setVideoError(false);
    setShouldAutoplay(true);
    setOutlineOpen(false);
  }, []);

  /* ── Sidebar content (shared between persistent sidebar & mobile Sheet) ── */
  const sidebarContent = (
    <div className="space-y-3">
      {/* Progress + duration summary */}
      {processedVideos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Progress value={courseProgressPct} className="h-1.5 min-w-0 flex-1" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {completedCount}/{processedVideos.length}
            </span>
          </div>
          {totalDuration > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Total: {totalDuration >= 3600
                ? `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`
                : formatDuration(totalDuration)
              }</span>
              <span className="mx-1">|</span>
              <span>{processedVideos.length} lessons</span>
            </div>
          )}
        </div>
      )}

      {/* First-visit guidance */}
      {isFirstVisit && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Lightbulb className="h-3.5 w-3.5" />
            Getting started
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Work through the lessons in order. Mark each one complete as you go -- your progress is saved automatically.
          </p>
        </div>
      )}

      {/* Lesson list */}
      <VideosByCategory
        videos={processedVideos}
        onVideoSelect={onSelectVideoFromOutline}
        getVideoProgress={getVideoProgress}
        onToggleComplete={handleToggleComplete}
        useIndividualPages={false}
        currentVideoId={currentVideo?.id}
        moduleId={productId}
        moduleType="product"
      />

      {/* Study & Exam shortcuts */}
      {(hasStudy || hasExam) && originalSlug && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Next steps</p>
          {hasStudy && (
            <button
              onClick={() => navigate(`/product/${originalSlug}/study`)}
              className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium">Study Bank</p>
                <p className="text-[11px] text-muted-foreground">Practice questions -- no scoring</p>
              </div>
            </button>
          )}
          {hasExam && (
            <button
              onClick={() => navigate(`/product/${originalSlug}/exam`)}
              className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium">Product Exam</p>
                <p className="text-[11px] text-muted-foreground">Timed &amp; scored. Retake anytime.</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Transcript (collapsible) */}
      {currentVideo?.transcript && (
        <details className="group pt-1">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <FileText className="h-3.5 w-3.5" />
            Transcript
          </summary>
          <div className="mt-2 max-h-[min(40vh,20rem)] overflow-y-auto rounded-md border bg-muted/30 p-3">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {currentVideo.transcript}
            </p>
          </div>
        </details>
      )}

      {/* Lesson resources */}
      {((currentVideo?.useful_links?.length ?? 0) > 0 || (currentVideo?.attachments?.length ?? 0) > 0) && (
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Lesson resources
          </summary>
          <div className="mt-2 space-y-1.5">
            {currentVideo?.useful_links?.map((link, index) => (
              <div key={`link-${index}`} className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate"
                >
                  {link.name}
                </a>
              </div>
            ))}
            {currentVideo?.attachments?.map((attachment) => (
              <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                {(attachment.file_type || "").toLowerCase() === "pdf" ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-destructive/10 text-destructive text-[10px] font-bold flex-shrink-0">
                    PDF
                  </span>
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );

  /* ── Video player hero ── */
  const videoPlayer = (
    <div className="relative overflow-hidden rounded-none bg-black shadow-xl lg:rounded-lg">
      <div className="relative aspect-video w-full">
        {videoInfo ? (
          videoError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2 p-4">
              <Play className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">Video not available</p>
              <p className="text-xs text-center max-w-sm text-zinc-500">
                This video hasn&apos;t been uploaded yet. Check back later or contact your training
                coordinator.
              </p>
            </div>
          ) : videoInfo.type === "mp4" ? (
            <video
              src={iframeSrc || videoInfo.embedUrl}
              title={currentVideo?.title}
              className="h-full w-full"
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
              key={iframeSrc}
              src={iframeSrc}
              title={currentVideo?.title}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ webkitallowfullscreen: "true", mozallowfullscreen: "true" } as any)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              style={{ border: 0 }}
              onLoad={() => setShouldAutoplay(false)}
            />
          )
        ) : processedVideos.length > 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-zinc-400">
            {currentVideo?.type === 'quiz' ? (
              <>
                <Brain className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Quiz</p>
                <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                  Scroll down to the Course content tab to take this quiz.
                </p>
              </>
            ) : currentVideo?.type === 'assignment' ? (
              <>
                <ClipboardList className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Assignment</p>
                <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                  Scroll down to the Course content tab to complete this assignment.
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Reading material</p>
                <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                  Scroll down to the Course content tab to view the lesson content.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-zinc-400">
            <Play className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
            <p className="text-sm font-medium text-zinc-300">No lessons yet</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Training videos will appear here when they are added to this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Course content (below video) ── */
  const courseContentInner = (
    <>
      {currentVideo?.rich_content?.trim() ? (
        <Card className="min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  ...markdownComponents,
                  p: ({ children }: { children?: React.ReactNode }) => {
                    const childArray = Array.isArray(children) ? children : [children];
                    const hasBlock = childArray.some(
                      (c: unknown) =>
                        typeof c === "object" &&
                        c !== null &&
                        "type" in (c as { type?: string }) &&
                        ((c as { type?: string }).type === "div" ||
                          (typeof c === "object" &&
                            c !== null &&
                            "props" in c &&
                            typeof (c as { props?: { className?: string } }).props?.className === "string" &&
                            (c as { props: { className?: string } }).props.className?.includes("my-4")))
                    );
                    if (hasBlock) return <div className="mb-3 last:mb-0">{children}</div>;
                    return (
                      <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                    );
                  },
                  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => {
                    const embedInfo = detectVideoEmbed(href ?? "");
                    if (embedInfo.isVideo && embedInfo.embedUrl) {
                      if (
                        currentVideo?.url &&
                        areSameVideoEmbedSource(href ?? "", currentVideo.url)
                      ) {
                        return (
                          <span className="my-2 block rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                            Same as the lesson video above — lecture notes continue below.
                          </span>
                        );
                      }
                      const autoplayUrl = shouldAutoplay
                        ? `${embedInfo.embedUrl}${embedInfo.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
                        : embedInfo.embedUrl;
                      return <VideoEmbed embedUrl={autoplayUrl} platform={embedInfo.platform || "video"} />;
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
      ) : !videoInfo && processedVideos.length > 0 ? (
        <Card className="min-w-0">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center sm:p-12">
            <div className="rounded-full bg-muted p-4">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Content coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              This lesson hasn&apos;t been set up yet. Check back later or contact your training coordinator.
            </p>
          </CardContent>
        </Card>
      ) : processedVideos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No training lessons yet. When lessons are added, you can learn here and track progress.
        </p>
      ) : null}
    </>
  );

  /* ── Next / Previous lesson navigation bar ── */
  const prevVideo = currentVideoIndex > 0 ? processedVideos[currentVideoIndex - 1] : null;
  const nextVideo = currentVideoIndex < processedVideos.length - 1 ? processedVideos[currentVideoIndex + 1] : null;
  const isCurrentCompleted = currentVideo ? !!getVideoProgress(currentVideo.id)?.completed : false;

  const lessonNav = processedVideos.length > 1 ? (
    <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        disabled={!prevVideo}
        onClick={() => prevVideo && onSelectVideoFromOutline(currentVideoIndex - 1)}
        className="gap-1.5 text-xs"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline truncate max-w-[120px]">{prevVideo?.title ?? "Previous"}</span>
        <span className="sm:hidden">Prev</span>
      </Button>
      {currentVideo && !isCurrentCompleted && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentVideo && handleToggleComplete(currentVideo.id, false)}
          className="gap-1.5 text-xs"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark complete
        </Button>
      )}
      {currentVideo && isCurrentCompleted && (
        <span className="flex items-center gap-1 text-xs text-primary font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      )}
      <Button
        variant={nextVideo ? "default" : "ghost"}
        size="sm"
        disabled={!nextVideo}
        onClick={() => nextVideo && onSelectVideoFromOutline(currentVideoIndex + 1)}
        className="gap-1.5 text-xs"
      >
        <span className="hidden sm:inline truncate max-w-[120px]">{nextVideo?.title ?? "Next"}</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  ) : null;

  return (
    <div className={cn("min-w-0 overflow-x-hidden", className)}>
      {/* ═══════════════════════════════════════════════════════════
          DESKTOP: Persistent left sidebar + right content (lg+)
          Like Skool classroom layout
         ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-[calc(100vh-120px)]">
        {/* ── Left sidebar ── */}
        <aside className="w-72 xl:w-80 shrink-0 border-r bg-muted/30 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
            <p className="text-xs text-muted-foreground truncate">{productTitle}</p>
            <h2 className="text-sm font-semibold truncate mt-0.5">
              {currentVideo?.title ?? "Select a lesson"}
            </h2>
          </div>
          <div className="p-3">
            {sidebarContent}
          </div>
        </aside>

        {/* ── Right main content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Video player */}
          <div className="bg-zinc-950">
            <div className="p-4">
              {videoPlayer}
            </div>
            {currentVideo?.description && (
              <p className="px-4 pb-3 text-sm leading-relaxed text-zinc-400">{currentVideo.description}</p>
            )}
          </div>
          {/* Next / Previous lesson */}
          {lessonNav}

          {/* Tabs below video */}
          <div className="min-w-0 border-t bg-background">
            <Tabs defaultValue={defaultTab} className="w-full min-w-0">
              <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="overflow-x-auto overflow-y-hidden px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <TabsList className="inline-flex h-auto w-full grid grid-cols-4 gap-1 bg-muted/50 p-1">
                    <TabsTrigger value="course-content" className="min-h-10 text-sm">
                      Course content
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="min-h-10 text-sm">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="min-h-10 text-sm">
                      Resources
                    </TabsTrigger>
                    <TabsTrigger value="my-notes" className="min-h-10 text-sm">
                      My notes
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div className="px-4 py-6 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]">
                <TabsContent value="course-content" className="mt-0 focus-visible:outline-none">
                  {courseContentInner}
                </TabsContent>
                <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                  {tabOverview}
                </TabsContent>
                <TabsContent value="resources" className="mt-0 focus-visible:outline-none">
                  {tabResources}
                </TabsContent>
                <TabsContent value="my-notes" className="mt-0 focus-visible:outline-none">
                  {tabMyNotes}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE / TABLET: Original stacked layout with Sheet drawer
         ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Dark hero with video */}
        <div className="relative w-full min-w-0 max-w-full overflow-hidden border-b bg-zinc-950">
          <div className="mx-auto max-w-7xl px-2 pt-2 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2">
            <div className="flex min-w-0 max-w-full flex-col gap-1.5 text-zinc-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0 max-w-full flex-1 sm:flex-none sm:pr-1">
                <p className="hidden text-xs text-zinc-400 sm:block">{productTitle}</p>
                <h2
                  className="max-w-full truncate text-[13px] font-medium leading-tight text-zinc-100 sm:text-sm sm:leading-snug md:text-base"
                  title={currentVideo?.title ?? "Training"}
                >
                  {currentVideo?.title ?? (processedVideos.length === 0 ? "No lessons yet" : "Select a lesson")}
                </h2>
              </div>
              {processedVideos.length > 0 && (
                <div className="flex w-full max-w-full min-w-0 shrink-0 items-center gap-1.5 sm:w-auto sm:gap-2">
                  <div className="hidden min-w-0 flex-1 items-center gap-1.5 sm:flex sm:flex-none sm:gap-2">
                    <Progress
                      value={courseProgressPct}
                      className="h-1 min-w-0 flex-1 bg-zinc-800 sm:h-1.5 sm:w-24 sm:flex-none md:w-36 [&>div]:bg-zinc-400"
                    />
                    <span className="shrink-0 whitespace-nowrap text-right text-[11px] tabular-nums text-zinc-400 sm:text-xs">
                      {completedCount}/{processedVideos.length} completed
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="ml-auto h-9 w-9 shrink-0 touch-manipulation p-0 opacity-90 hover:opacity-100 sm:ml-0 sm:h-8 sm:w-auto sm:gap-1 sm:px-3 sm:py-2"
                    aria-expanded={outlineOpen}
                    aria-controls={OUTLINE_SHEET_ID}
                    aria-label="Lesson outline"
                    onClick={() => setOutlineOpen(true)}
                    title="Lesson outline"
                  >
                    <List className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Outline</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl pb-3">
            <div className="px-0 sm:px-4">
              {videoPlayer}
            </div>
            {currentVideo?.description && (
              <p className="mt-2 px-3 text-sm leading-relaxed text-zinc-400 sm:px-4">{currentVideo.description}</p>
            )}
          </div>
        </div>
        {/* Next / Previous lesson */}
        {lessonNav}

        {/* Tabs below video */}
        <div className="min-w-0 border-t bg-background">
          <Tabs defaultValue={defaultTab} className="w-full min-w-0">
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="mx-auto max-w-7xl overflow-x-auto overflow-y-hidden px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
                <TabsList className="inline-flex h-auto w-max gap-1 bg-muted/50 p-1 sm:w-full sm:grid sm:grid-cols-4">
                  <TabsTrigger
                    value="course-content"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    Course content
                  </TabsTrigger>
                  <TabsTrigger
                    value="overview"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    Resources
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-notes"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    My notes
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]">
              <TabsContent value="course-content" className="mt-0 focus-visible:outline-none">
                {courseContentInner}
              </TabsContent>
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                {tabOverview}
              </TabsContent>
              <TabsContent value="resources" className="mt-0 focus-visible:outline-none">
                {tabResources}
              </TabsContent>
              <TabsContent value="my-notes" className="mt-0 focus-visible:outline-none">
                {tabMyNotes}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Mobile outline drawer */}
        <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
          <SheetContent
            side="right"
            className="flex h-full w-full max-w-[100vw] flex-col gap-0 overflow-y-auto p-4 pt-6 sm:max-w-md sm:p-6"
            id={OUTLINE_SHEET_ID}
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Lesson outline
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
