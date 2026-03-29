import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { salesMasteryCourse, type Lesson, type CourseModule } from "@/data/salesMasteryCourseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, Clock, CheckCircle, ChevronLeft, ChevronRight,
  BookOpen, MessageSquare, Target, Lightbulb, Volume2,
} from "lucide-react";

// ─── Lesson Content Renderer ─────────────────────────────────────────────────

function SlideView({ slides }: { slides: Lesson["slides"] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Slide navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentSlide === 0}
          onClick={() => setCurrentSlide((s) => s - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentSlide === slides.length - 1}
          onClick={() => setCurrentSlide((s) => s + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Slide content */}
      <div className="rounded-xl border bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 min-h-[320px] flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold mb-6">{slide.heading}</h3>

        {slide.bullets.length > 0 && (
          <ul className="space-y-3 flex-1">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-slate-200">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {slide.script && (
          <div className="mt-4 rounded-lg bg-white/10 border border-white/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Script</span>
            </div>
            <p className="text-sm md:text-base italic text-slate-200 leading-relaxed">
              {slide.script}
            </p>
          </div>
        )}

        {slide.table && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  {slide.table.headers.map((h, i) => (
                    <th key={i} className="text-left py-2 px-3 font-semibold text-primary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/10">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 text-slate-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide dots */}
      <div className="flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentSlide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SalesMasteryLesson() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const mod = salesMasteryCourse.find((m) => m.id === moduleId);

  // Get completed lessons from localStorage
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sales-mastery-completed") || "[]");
    } catch { return []; }
  });

  const markComplete = useCallback((id: string) => {
    setCompletedLessons((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("sales-mastery-completed", JSON.stringify(next));
      return next;
    });
  }, []);

  if (!mod) {
    return (
      <PageLayout title="Not Found" description="Module not found">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-xl font-bold mb-2">Module not found</h2>
          <Button onClick={() => navigate("/sales-mastery")}>Back to Course</Button>
        </div>
      </PageLayout>
    );
  }

  // If lessonId is provided, show the lesson; otherwise show module overview
  const activeLesson = lessonId ? mod.lessons.find((l) => l.id === lessonId) : null;

  // Find prev/next lessons across all modules for navigation
  const allLessons = salesMasteryCourse.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id }))
  );
  const currentIdx = activeLesson
    ? allLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  if (activeLesson) {
    return (
      <PageLayout
        title={`${activeLesson.title} — PWV Sales Mastery`}
        description={activeLesson.description}
      >
        <div className="min-h-screen">
          <BrandedPageHeader
            title={activeLesson.title}
            subtitle={`Module ${mod.number}: ${mod.title}`}
            showBackButton
            onBack={() => navigate(`/sales-mastery/${mod.id}`)}
            breadcrumbs={[
              { label: "Sales Mastery", href: "/sales-mastery" },
              { label: mod.title, href: `/sales-mastery/${mod.id}` },
              { label: activeLesson.title },
            ]}
          />

          <div className={`mx-auto max-w-4xl px-4 pb-24 ${isMobile ? "pt-4" : "pt-8"}`}>
            {/* Lesson meta */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {activeLesson.durationMin} min
              </Badge>
              {completedLessons.includes(activeLesson.id) && (
                <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <Tabs defaultValue="slides" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="slides" className="text-xs md:text-sm">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Slides
                </TabsTrigger>
                <TabsTrigger value="narration" className="text-xs md:text-sm">
                  <Volume2 className="h-3.5 w-3.5 mr-1" />
                  Script
                </TabsTrigger>
                <TabsTrigger value="takeaways" className="text-xs md:text-sm">
                  <Lightbulb className="h-3.5 w-3.5 mr-1" />
                  Key Points
                </TabsTrigger>
              </TabsList>

              <TabsContent value="slides" className="mt-6">
                <SlideView slides={activeLesson.slides} />
              </TabsContent>

              <TabsContent value="narration" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      Narration Script
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {activeLesson.narration.split("\n\n").map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed text-sm">
                          {p}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="takeaways" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeLesson.keyTakeaways.map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Target className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span className="text-sm">{t}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {activeLesson.realExamples && activeLesson.realExamples.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Real Meeting Examples
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activeLesson.realExamples.map((ex, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-sm text-muted-foreground">{ex}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Mark Complete + Navigation */}
            <div className="mt-8 flex flex-col gap-4">
              {!completedLessons.includes(activeLesson.id) && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => markComplete(activeLesson.id)}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark as Complete
                </Button>
              )}

              <div className="flex gap-3">
                {prevLesson && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/sales-mastery/${prevLesson.moduleId}/lesson/${prevLesson.id}`)
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
                {nextLesson && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/sales-mastery/${nextLesson.moduleId}/lesson/${nextLesson.id}`)
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ─── Module Overview (no lessonId) ─────────────────────────────────────────
  const modCompleted = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;

  return (
    <PageLayout
      title={`${mod.title} — PWV Sales Mastery`}
      description={mod.description}
    >
      <div className="min-h-screen">
        <BrandedPageHeader
          title={mod.title}
          subtitle={mod.description}
          showBackButton
          onBack={() => navigate("/sales-mastery")}
          breadcrumbs={[
            { label: "Sales Mastery", href: "/sales-mastery" },
            { label: `Module ${mod.number}` },
          ]}
        />

        <div className={`mx-auto max-w-4xl px-4 pb-24 ${isMobile ? "pt-4" : "pt-8"}`}>
          {/* Module progress */}
          {modCompleted > 0 && (
            <div className="rounded-xl border bg-card p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Module Progress</span>
                <span className="text-sm font-semibold tabular-nums">
                  {modCompleted}/{mod.lessons.length} lessons
                </span>
              </div>
              <Progress value={(modCompleted / mod.lessons.length) * 100} className="h-3" />
            </div>
          )}

          {/* Lesson list */}
          <div className="space-y-3">
            {mod.lessons.map((lesson, idx) => {
              const isComplete = completedLessons.includes(lesson.id);
              return (
                <Card
                  key={lesson.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() =>
                    navigate(`/sales-mastery/${mod.id}/lesson/${lesson.id}`)
                  }
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isComplete
                          ? "bg-green-600/20 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight mb-1">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {lesson.durationMin}m
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
