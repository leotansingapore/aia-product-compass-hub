import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { markdownSanitizeSchema } from "@/lib/markdown-sanitize";
import { markdownComponents } from "@/lib/markdown-config";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { useScripts, useScriptsMutations } from "@/hooks/useScripts";
import type { ScriptEntry, ScriptVersion, ScriptAttachment } from "@/hooks/useScripts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { getReadLessonIds, markLessonRead } from "@/lib/scriptsCourseProgress";
import { cn } from "@/lib/utils";

const ScriptEditorDialog = lazy(() =>
  import("@/components/scripts/ScriptEditorDialog").then((m) => ({ default: m.ScriptEditorDialog })),
);

function readingMinutes(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

export default function ScriptsCourse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSimplifiedAuth();
  const { scripts, loading, refetch } = useScripts();
  const { updateScript, isAdmin } = useScriptsMutations();

  // Already sorted by sort_order from useScripts — that IS the lesson order.
  const lessons = useMemo(() => scripts.filter((s) => s.category === "tips"), [scripts]);

  const [readIds, setReadIds] = useState<Set<string>>(() => getReadLessonIds(user?.id));
  useEffect(() => {
    setReadIds(getReadLessonIds(user?.id));
  }, [user?.id]);

  const lessonParam = searchParams.get("lesson");
  const activeLesson = useMemo(() => {
    if (lessons.length === 0) return null;
    if (lessonParam) {
      const byParam = lessons.find((l) => l.id === lessonParam);
      if (byParam) return byParam;
    }
    // Default: first unread lesson, or lesson 1 when everything is read.
    return lessons.find((l) => !readIds.has(l.id)) ?? lessons[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, lessonParam]);

  // Viewing a lesson counts as reading it.
  useEffect(() => {
    if (activeLesson) {
      setReadIds(markLessonRead(user?.id, activeLesson.id));
    }
  }, [activeLesson, user?.id]);

  const activeIndex = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const readCount = lessons.filter((l) => readIds.has(l.id)).length;
  const allRead = lessons.length > 0 && readCount === lessons.length;
  const isLast = activeIndex === lessons.length - 1;

  const goToLesson = (lesson: ScriptEntry) => {
    setSearchParams({ lesson: lesson.id }, { replace: false });
    window.scrollTo({ top: 0 });
  };

  // Admin editing — same editor as the scripts database, since these lessons
  // no longer appear there.
  const [editorOpen, setEditorOpen] = useState(false);
  const handleEditorSave = async (data: {
    stage: string;
    category: string;
    target_audience: string;
    script_role: string;
    tags: string[];
    versions: ScriptVersion[];
    sort_order: number;
    related_script_id?: string | null;
    attachments?: ScriptAttachment[];
  }) => {
    if (activeLesson) {
      await updateScript(activeLesson.id, data);
      refetch();
    }
  };

  const content = activeLesson?.versions?.[0]?.content ?? "";

  return (
    <PageLayout
      title="Scripts Fundamentals - FINternship"
      description="Tips and best practices every consultant should read before using the sales scripts."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Scripts Fundamentals"
        subtitle="The tips & best practices behind every script — read this before you start calling and texting"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Scripts & Objections", href: "/scripts" },
          { label: "Fundamentals" },
        ]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      <div className="mx-auto px-3 md:px-6 py-4 md:py-8 max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No lessons yet</p>
            <p className="text-sm">Course content hasn't been published.</p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <p className="text-sm font-medium">
                  {allRead ? "Course complete" : `Lesson ${activeIndex + 1} of ${lessons.length}`}
                </p>
                <p className="text-xs text-muted-foreground">{readCount}/{lessons.length} read</p>
              </div>
              <Progress value={(readCount / lessons.length) * 100} className="h-1.5" />
            </div>

            {allRead && (
              <Card className="mb-4 md:mb-6 border-green-300/60 bg-green-50/60 dark:border-green-900 dark:bg-green-950/30">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">You've read all {lessons.length} lessons — you're ready.</p>
                    <p className="text-xs text-muted-foreground">Come back any time to re-read a lesson.</p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/scripts")}>
                    Browse the sales scripts <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:gap-6 lg:grid-cols-[280px,1fr] items-start">
              {/* Lesson index — sidebar on desktop, horizontal strip on mobile */}
              <nav aria-label="Course lessons" className="lg:sticky lg:top-20">
                <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                  {lessons.map((lesson, i) => {
                    const isActive = lesson.id === activeLesson?.id;
                    const isRead = readIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => goToLesson(lesson)}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors max-w-[240px] lg:max-w-none lg:w-full",
                          isActive
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                            isRead ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isRead ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="truncate lg:whitespace-normal lg:leading-snug">{lesson.stage}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Reader */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b">
                    <div className="min-w-0">
                      <h2 className="text-lg md:text-xl font-semibold leading-snug">{activeLesson?.stage}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lesson {activeIndex + 1} of {lessons.length} · ~{readingMinutes(content)} min read
                      </p>
                    </div>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setEditorOpen(true)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
                      components={markdownComponents}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activeIndex <= 0}
                      onClick={() => goToLesson(lessons[activeIndex - 1])}
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
                    </Button>
                    {isLast ? (
                      <Button size="sm" onClick={() => navigate("/scripts")}>
                        Finish — browse the scripts <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => goToLesson(lessons[activeIndex + 1])}>
                        Next lesson <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {editorOpen && activeLesson && (
        <Suspense fallback={null}>
          <ScriptEditorDialog
            open={editorOpen}
            onClose={() => setEditorOpen(false)}
            onSave={handleEditorSave}
            script={activeLesson}
          />
        </Suspense>
      )}
    </PageLayout>
  );
}
