import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link2, List, Play } from "lucide-react";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import type { TrainingVideo } from "@/hooks/useProducts";
import { getVideoEmbedInfo } from "@/components/video-editing/videoUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { detectVideoEmbed, VideoEmbed } from "@/lib/video-embed-utils";
import { cn } from "@/lib/utils";

export interface CMFASModuleCourseLayoutProps {
  /** URL segment: m9, m9a, hi, res5, onboarding — must match CMFASVideoDetail / video_progress keys */
  routeModuleId: string;
  videos: TrainingVideo[];
  moduleName: string;
  /** Includes module intro; add learning objectives inside this panel (no separate Objectives tab). */
  tabOverview: React.ReactNode;
  tabCourseContent: React.ReactNode;
  /** External resources / registration links — own tab before Exam. */
  tabUsefulLinks: React.ReactNode;
  tabExam: React.ReactNode;
  /** Default tab: overview | course-content | useful-links | exam */
  defaultTab?: "overview" | "course-content" | "useful-links" | "exam";
  className?: string;
}

export function CMFASModuleCourseLayout({
  routeModuleId,
  videos,
  moduleName,
  tabOverview,
  tabCourseContent,
  tabUsefulLinks,
  tabExam,
  defaultTab = "overview",
  className,
}: CMFASModuleCourseLayoutProps) {
  const progressProductId = routeModuleId;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { getVideoProgress, markVideoComplete, updateVideoProgress, getCourseProgress } =
    useVideoProgress(progressProductId);

  const processedVideos = useMemo(
    () =>
      (videos || [])
        .map((video, index) => ({
          ...video,
          id: video.id || `lecture-${index}`,
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

  const videoInfo = useMemo(
    () => (currentVideo?.url ? getVideoEmbedInfo(currentVideo.url) : null),
    [currentVideo?.url]
  );

  const richContentHasVideo = useMemo(() => {
    if (!currentVideo?.rich_content?.trim() || !currentVideo?.url) return false;
    const embedInfo = detectVideoEmbed(currentVideo.url);
    if (!embedInfo.isVideo || !embedInfo.embedUrl) return false;
    const embedPath = embedInfo.embedUrl.split("?")[0];
    const videoId = embedPath.split("/").pop();
    if (!videoId) return false;
    return currentVideo.rich_content.includes(videoId);
  }, [currentVideo]);

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

  const sidebarInner = (
    <div className="space-y-4 pb-8">
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
          <TabsTrigger value="videos" className="text-xs sm:text-sm">
            Course videos
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            Transcript
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-4 focus-visible:outline-none">
          <VideosByCategory
            videos={processedVideos}
            onVideoSelect={onSelectVideoFromOutline}
            getVideoProgress={getVideoProgress}
            onToggleComplete={handleToggleComplete}
            useIndividualPages={false}
            currentVideoId={currentVideo?.id}
            moduleId={routeModuleId}
            moduleType="cmfas"
          />
        </TabsContent>
        <TabsContent value="transcript" className="mt-4 focus-visible:outline-none">
          <p className="mb-3 text-xs text-muted-foreground">
            {currentVideo?.title ? (
              <>
                Transcript for: <span className="font-medium text-foreground">{currentVideo.title}</span>
              </>
            ) : (
              "Select a lesson to view its transcript."
            )}
          </p>
          {currentVideo?.transcript ? (
            <div className="max-h-[min(55vh,28rem)] overflow-y-auto rounded-md border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {currentVideo.transcript}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-dashed py-8 text-center text-muted-foreground">
              <p className="text-sm">No transcript available for this video.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {(currentVideo?.useful_links?.length ?? 0) > 0 || (currentVideo?.attachments?.length ?? 0) > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
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
            {currentVideo?.attachments?.map((attachment) => (
              <div key={`file-${attachment.id}`} className="flex items-center gap-2">
                {(attachment.file_type || "").toLowerCase() === "pdf" ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-destructive/10 text-destructive text-xs font-bold flex-shrink-0">
                    PDF
                  </span>
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
      ) : null}
    </div>
  );

  return (
    <div className={cn("min-w-0 overflow-x-hidden", className)}>
      {/* Hero player */}
      <div className="relative w-full min-w-0 max-w-full overflow-hidden border-b bg-zinc-950">
        <div className="mx-auto max-w-6xl px-2 pt-2 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2">
          <div className="flex min-w-0 max-w-full flex-col gap-1.5 text-zinc-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0 max-w-full flex-1 sm:flex-none sm:pr-1">
              <p className="hidden text-xs text-zinc-400 sm:block">{moduleName}</p>
              <h2
                className="max-w-full truncate text-[13px] font-medium leading-tight text-zinc-100 sm:text-sm sm:leading-snug md:text-base"
                title={currentVideo?.title ?? "Course"}
                aria-label={`${moduleName}: ${currentVideo?.title ?? "Course"}`}
              >
                {currentVideo?.title ?? "Course"}
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
                    {currentVideoIndex + 1}/{processedVideos.length}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  className="ml-auto h-9 w-9 shrink-0 touch-manipulation p-0 opacity-90 hover:opacity-100 sm:ml-0 sm:h-8 sm:w-auto sm:gap-1 sm:px-3 sm:py-2"
                  aria-expanded={outlineOpen}
                  aria-controls="cmf-course-outline"
                  aria-label="Course outline"
                  onClick={() => setOutlineOpen(true)}
                  title="Course outline"
                >
                  <List className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Outline</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl pb-3">
          {!richContentHasVideo && videoInfo && (
            <div className="px-0 sm:px-4">
              <div className="relative overflow-hidden rounded-none bg-black shadow-xl sm:rounded-lg">
                <div className="relative aspect-video w-full">
                {videoError ? (
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
                )}
                </div>
              </div>
            </div>
          )}
          {richContentHasVideo && processedVideos.length > 0 && (
            <p className="mx-3 mt-2 rounded-lg border bg-muted/40 px-3 py-3 text-sm text-muted-foreground sm:mx-4 sm:px-4">
              Video for this lesson is embedded in the lesson content below.
            </p>
          )}

          {currentVideo?.description && (
            <p className="mt-2 px-3 text-sm leading-relaxed text-zinc-400 sm:px-4">
              {currentVideo.description}
            </p>
          )}
        </div>
      </div>

      {(currentVideo?.rich_content?.trim() ||
        (!videoInfo && !richContentHasVideo && processedVideos.length > 0)) && (
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4">
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
                                typeof (c as { props?: { className?: string } }).props?.className ===
                                  "string" &&
                                (c as { props: { className?: string } }).props.className?.includes(
                                  "my-4"
                                )))
                        );
                        if (hasBlock) return <div className="mb-3 last:mb-0">{children}</div>;
                        return (
                          <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                        );
                      },
                      a: ({ children, href }: { children?: React.ReactNode; href?: string }) => {
                        const embedInfo = detectVideoEmbed(href ?? "");
                        if (embedInfo.isVideo && embedInfo.embedUrl) {
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
          ) : (
            <Card className="min-w-0">
              <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center sm:p-12">
                <div className="rounded-full bg-muted p-4">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Content coming soon</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  This lecture hasn&apos;t been set up yet. Check back later or contact your training
                  coordinator.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="min-w-0 border-t bg-background">
        <Tabs defaultValue={defaultTab} className="w-full min-w-0">
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto max-w-6xl overflow-x-auto overflow-y-hidden px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
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
                  value="useful-links"
                  className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                >
                  Links
                </TabsTrigger>
                <TabsTrigger
                  value="exam"
                  className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                >
                  Exam
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]">
            <TabsContent value="course-content" className="mt-0 focus-visible:outline-none">
              {tabCourseContent}
            </TabsContent>
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
              {tabOverview}
            </TabsContent>
            <TabsContent value="useful-links" className="mt-0 focus-visible:outline-none">
              {tabUsefulLinks}
            </TabsContent>
            <TabsContent value="exam" className="mt-0 focus-visible:outline-none">
              {tabExam}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full max-w-[100vw] flex-col gap-0 overflow-y-auto p-4 pt-6 sm:max-w-md sm:p-6"
          id="cmf-course-outline"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Course outline
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            {processedVideos.length > 0 && (
              <div className="flex items-center gap-2 border-b border-border pb-4 sm:hidden">
                <Progress value={courseProgressPct} className="h-1.5 min-w-0 flex-1" />
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {currentVideoIndex + 1}/{processedVideos.length}
                </span>
              </div>
            )}
            {sidebarInner}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
