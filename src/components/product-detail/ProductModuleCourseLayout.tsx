import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Lightbulb,
  Link2,
  List,
  Play,
} from "lucide-react";
import { formatDuration, getVideoEmbedInfo } from "@/components/video-editing/videoUtils";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { VideosByCategory } from "@/components/video-editing/VideosByCategory";
import type { TrainingVideo } from "@/hooks/useProducts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { areSameVideoEmbedSource, detectVideoEmbed } from "@/lib/video-embed-utils";
import { VideoEmbed } from "@/lib/video-embed";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const OUTLINE_SHEET_ID = "product-course-outline";

function sanitizeLessonMediaUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** When the lesson `url` field is empty, use the first video-like https link from markdown/HTML body. */
function extractFirstStreamableVideoUrlFromRich(rich: string | undefined): string | null {
  if (!rich?.trim()) return null;
  const text = rich;
  const candidates: string[] = [];
  const seen = new Set<string>();
  const push = (rawUrl: string) => {
    const t = rawUrl.trim().replace(/[),.;>]+$/g, "");
    if (t && !seen.has(t)) {
      seen.add(t);
      candidates.push(t);
    }
  };

  let m: RegExpExecArray | null;
  const mdLink = /\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi;
  while ((m = mdLink.exec(text)) !== null) push(m[1]);
  const mdImg = /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi;
  while ((m = mdImg.exec(text)) !== null) push(m[1]);
  const iframeSrc = /src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
  while ((m = iframeSrc.exec(text)) !== null) push(m[1]);
  const bare = /https?:\/\/[^\s\]"'<>]+/gi;
  while ((m = bare.exec(text)) !== null) push(m[0]);

  for (const c of candidates) {
    if (getVideoEmbedInfo(c)) return sanitizeLessonMediaUrl(c) || c;
  }
  for (const c of candidates) {
    if (detectVideoEmbed(c).isVideo) return sanitizeLessonMediaUrl(c) || c;
  }
  for (const c of candidates) {
    const s = sanitizeLessonMediaUrl(c);
    if (s) return s;
  }
  return null;
}

export interface ProductModuleCourseLayoutProps {
  /** Must match `useVideoProgress` / video_progress keys for this product */
  productId: string;
  productTitle: string;
  videos: TrainingVideo[];
  tabResources: React.ReactNode;
  tabMyNotes: React.ReactNode;
  defaultTab?: "course-content" | "resources" | "my-notes";
  className?: string;
  /** Study/Exam paths shown in sidebar */
  hasStudy?: boolean;
  hasExam?: boolean;
  /** Route slug for study/exam links (e.g. 'pro-achiever') */
  originalSlug?: string;
  /** Count of product-level resources (links + files). Drives the Resources tab badge. */
  resourceCount?: number;
}

export function ProductModuleCourseLayout({
  productId,
  productTitle,
  videos,
  tabResources,
  tabMyNotes,
  defaultTab = "course-content",
  className,
  hasStudy,
  hasExam,
  originalSlug,
  resourceCount = 0,
}: ProductModuleCourseLayoutProps) {
  const resourcesLabel = resourceCount > 0 ? `Resources (${resourceCount})` : "Resources";
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [activeTab, setActiveTab] = useState<"course-content" | "resources" | "my-notes">(defaultTab);
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

  const resolvedLessonStreamUrl = useMemo(() => {
    const fromField = sanitizeLessonMediaUrl(currentVideo?.url);
    if (fromField) return fromField;
    return extractFirstStreamableVideoUrlFromRich(currentVideo?.rich_content);
  }, [currentVideo?.url, currentVideo?.rich_content]);

  const videoInfo = useMemo(
    () => (resolvedLessonStreamUrl ? getVideoEmbedInfo(resolvedLessonStreamUrl) : null),
    [resolvedLessonStreamUrl]
  );

  /** Stream URL (lesson field or first video link in rich content) resolves to a known embed. */
  const hasVideoEmbed = Boolean(videoInfo);

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

  /* ── Video player hero (single hero: only when there is a real embed) ── */
  const videoHero = hasVideoEmbed ? (
    <div className="relative overflow-hidden rounded-none bg-black shadow-xl lg:rounded-lg">
      <div className="relative aspect-video w-full">
        {videoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-zinc-400">
            <Play className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">Video not available</p>
            <p className="max-w-sm text-center text-xs text-zinc-500">
              This video hasn&apos;t been uploaded yet. Check back later or contact your training
              coordinator.
            </p>
          </div>
        ) : videoInfo!.type === "mp4" ? (
          <video
            src={iframeSrc || videoInfo!.embedUrl}
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
  ) : null;

  /** Known https URL from field or rich content, but not a recognized embed — generic iframe player. */
  const fallbackStreamHero =
    !hasVideoEmbed && resolvedLessonStreamUrl && processedVideos.length > 0 && currentVideo ? (
      <div className="relative overflow-hidden rounded-none bg-black shadow-xl lg:rounded-lg">
        <div className="relative aspect-video w-full">
          <iframe
            title={currentVideo.title}
            src={resolvedLessonStreamUrl}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-8">
            <p className="pointer-events-auto text-center text-[11px] leading-snug text-zinc-400">
              If the video doesn&apos;t appear,{" "}
              <a
                href={resolvedLessonStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-200 underline underline-offset-2 hover:text-white"
              >
                open in a new tab
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    ) : null;

  /** In-tab only lessons (no stream URL in field or body): quiz / assignment / reading. */
  const lessonHeroPlaceholder =
    !hasVideoEmbed && !resolvedLessonStreamUrl && processedVideos.length > 0 && currentVideo ? (
      <div className="relative overflow-hidden rounded-none bg-black shadow-xl lg:rounded-lg">
        <div className="relative aspect-video w-full">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-zinc-400">
            {currentVideo.type === "quiz" ? (
              <>
                <Brain className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Quiz</p>
                <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                  Open the <span className="font-medium text-zinc-400">Course content</span> tab to take this quiz.
                </p>
              </>
            ) : currentVideo.type === "assignment" ? (
              <>
                <ClipboardList className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Assignment</p>
                <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                  Open the <span className="font-medium text-zinc-400">Course content</span> tab to complete this
                  assignment.
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 shrink-0 opacity-40" aria-hidden />
                <p className="text-sm font-medium text-zinc-300">Lesson content</p>
                <p className="max-w-md text-xs leading-relaxed text-zinc-500">
                  Use the <span className="font-medium text-zinc-400">Course content</span> tab for this lesson&apos;s
                  notes and materials.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    ) : null;

  const lessonHeroMain = hasVideoEmbed ? videoHero : fallbackStreamHero ?? lessonHeroPlaceholder;

  const useZincLessonChrome =
    hasVideoEmbed || Boolean(fallbackStreamHero) || Boolean(lessonHeroPlaceholder);

  /* ── Course content (below video) ── */
  const courseContentInner = (
    <>
      {currentVideo?.rich_content?.trim() ? (
        <Card className="min-w-0">
          <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6 md:pt-6">
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
                      const heroDedupSource =
                        resolvedLessonStreamUrl || currentVideo?.url?.trim() || "";
                      if (heroDedupSource && areSameVideoEmbedSource(href ?? "", heroDedupSource)) {
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
      ) : !hasVideoEmbed && processedVideos.length > 0 ? (
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

  const renderLessonNav = (tone: "dark" | "light") =>
    processedVideos.length > 1 ? (
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-t px-4 py-3",
          tone === "dark"
            ? "border-zinc-800/90 bg-zinc-900/45 text-zinc-100 [&_button:not([disabled])]:text-zinc-100"
            : "border-border bg-muted/30",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={!prevVideo}
          onClick={() => prevVideo && onSelectVideoFromOutline(currentVideoIndex - 1)}
          className={cn(
            "gap-1.5 text-xs",
            tone === "dark" && "hover:bg-zinc-800 hover:text-zinc-50",
          )}
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
            className={cn(
              "gap-1.5 text-xs",
              tone === "dark" &&
                "border-zinc-600 bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark complete
          </Button>
        )}
        {currentVideo && isCurrentCompleted && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              tone === "dark" ? "text-emerald-400" : "text-primary",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        )}
        <Button
          variant={nextVideo ? "default" : "ghost"}
          size="sm"
          disabled={!nextVideo}
          onClick={() => nextVideo && onSelectVideoFromOutline(currentVideoIndex + 1)}
          className={cn("gap-1.5 text-xs", tone === "dark" && !nextVideo && "hover:bg-zinc-800")}
        >
          <span className="hidden sm:inline truncate max-w-[120px]">{nextVideo?.title ?? "Next"}</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    ) : null;

  const courseContentPanel = (
    <div className="space-y-6">
      {currentVideo?.description?.trim() ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{currentVideo.description}</p>
      ) : null}
      {courseContentInner}
      {resourceCount > 0 && (
        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className="flex w-full items-center justify-between gap-3 rounded-md border border-dashed bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Product resources</span>
            <span className="text-xs text-muted-foreground">
              {resourceCount} {resourceCount === 1 ? "item" : "items"}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );

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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full min-w-0">
            {useZincLessonChrome ? (
              <div className="bg-zinc-950">
                <div className="p-4">{lessonHeroMain}</div>
                {renderLessonNav("dark")}
                <div className="sticky top-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <div className="overflow-x-auto overflow-y-hidden px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabsList className="inline-flex h-auto w-full grid grid-cols-3 gap-1 bg-muted/50 p-1">
                      <TabsTrigger value="course-content" className="min-h-10 text-sm">
                        Course content
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="min-h-10 text-sm">
                        {resourcesLabel}
                      </TabsTrigger>
                      <TabsTrigger value="my-notes" className="min-h-10 text-sm">
                        My notes
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-w-0 w-full">
                {renderLessonNav("light")}
                <div className="sticky top-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <div className="overflow-x-auto overflow-y-hidden px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabsList className="inline-flex h-auto w-full grid grid-cols-3 gap-1 bg-muted/50 p-1">
                      <TabsTrigger value="course-content" className="min-h-10 text-sm">
                        Course content
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="min-h-10 text-sm">
                        {resourcesLabel}
                      </TabsTrigger>
                      <TabsTrigger value="my-notes" className="min-h-10 text-sm">
                        My notes
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
            )}

            <div className="min-w-0 border-t border-border bg-background">
              <div className="px-4 py-6 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]">
                <TabsContent value="course-content" className="mt-0 focus-visible:outline-none">
                  {courseContentPanel}
                </TabsContent>
                <TabsContent value="resources" className="mt-0 focus-visible:outline-none">
                  {tabResources}
                </TabsContent>
                <TabsContent value="my-notes" className="mt-0 focus-visible:outline-none">
                  {tabMyNotes}
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE / TABLET: Original stacked layout with Sheet drawer
         ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full min-w-0">
          {/* Lesson bar + video + nav + tab strip (stacked under player when embed exists) */}
          <div
            className={cn(
              "relative w-full min-w-0 max-w-full overflow-hidden border-b",
              useZincLessonChrome ? "bg-zinc-950" : "bg-background",
            )}
          >
            <div className="mx-auto max-w-7xl px-2 pt-2 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2">
              <div
                className={cn(
                  "flex min-w-0 max-w-full flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                  useZincLessonChrome ? "text-zinc-100" : "text-foreground",
                )}
              >
                <div className="min-w-0 max-w-full flex-1 sm:flex-none sm:pr-1">
                  <p
                    className={cn(
                      "hidden text-xs sm:block",
                      useZincLessonChrome ? "text-zinc-400" : "text-muted-foreground",
                    )}
                  >
                    {productTitle}
                  </p>
                  <h2
                    className={cn(
                      "max-w-full truncate text-[13px] font-medium leading-tight sm:text-sm sm:leading-snug md:text-base",
                      useZincLessonChrome ? "text-zinc-100" : "text-foreground",
                    )}
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
                        className={cn(
                          "h-1 min-w-0 flex-1 sm:h-1.5 sm:w-24 sm:flex-none md:w-36",
                          useZincLessonChrome
                            ? "bg-zinc-800 [&>div]:bg-zinc-400"
                            : "bg-muted [&>div]:bg-primary/70",
                        )}
                      />
                      <span
                        className={cn(
                          "shrink-0 whitespace-nowrap text-right text-[11px] tabular-nums sm:text-xs",
                          useZincLessonChrome ? "text-zinc-400" : "text-muted-foreground",
                        )}
                      >
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

            {lessonHeroMain && (
              <div className="relative mx-auto max-w-7xl">
                <div className="px-0 sm:px-4">{lessonHeroMain}</div>
              </div>
            )}

            <div className="relative mx-auto w-full min-w-0 max-w-7xl">
              {renderLessonNav(useZincLessonChrome ? "dark" : "light")}
            </div>

            <div className="sticky top-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="mx-auto max-w-7xl overflow-x-auto overflow-y-hidden px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
                <TabsList className="inline-flex h-auto w-max gap-1 bg-muted/50 p-1 sm:w-full sm:grid sm:grid-cols-3">
                  <TabsTrigger
                    value="course-content"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    Course content
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="min-h-[44px] shrink-0 justify-center whitespace-nowrap px-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
                  >
                    {resourcesLabel}
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
          </div>

          <div className="min-w-0 border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]">
              <TabsContent value="course-content" className="mt-0 focus-visible:outline-none">
                {courseContentPanel}
              </TabsContent>
              <TabsContent value="resources" className="mt-0 focus-visible:outline-none">
                {tabResources}
              </TabsContent>
              <TabsContent value="my-notes" className="mt-0 focus-visible:outline-none">
                {tabMyNotes}
              </TabsContent>
            </div>
          </div>
        </Tabs>

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
