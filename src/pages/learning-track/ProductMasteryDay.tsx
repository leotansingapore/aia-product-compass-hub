import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
type PluggableList = any[];
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { loadDay, prefetchDay, WEEK_META } from "@/features/product-mastery-track/content";
import { DAY_SUMMARIES } from "@/features/product-mastery-track/summaries";
import type { Day } from "@/features/product-mastery-track/types";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";

const DayQuiz = lazy(() =>
  import("@/components/first-60-days/DayQuiz").then((m) => ({ default: m.DayQuiz })),
);

function TabFallback() {
  return (
    <div className="flex min-h-[160px] items-center justify-center text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
        Loading…
      </span>
    </div>
  );
}

let rehypeRawPromise: Promise<PluggableList> | null = null;
function loadRehypeRaw(): Promise<PluggableList> {
  if (!rehypeRawPromise) {
    rehypeRawPromise = import("rehype-raw").then((m) => [m.default]);
  }
  return rehypeRawPromise;
}

function useRehypePlugins(enabled: boolean): { plugins: PluggableList; ready: boolean } {
  const [plugins, setPlugins] = useState<PluggableList>([]);
  const [ready, setReady] = useState(!enabled);
  useEffect(() => {
    if (!enabled) {
      setPlugins([]);
      setReady(true);
      return;
    }
    setReady(false);
    let cancelled = false;
    loadRehypeRaw().then((p) => {
      if (!cancelled) {
        setPlugins(p);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return { plugins, ready };
}

const BASE_PATH = "/learning-track/product-mastery";

export default function ProductMasteryDay() {
  const { dayNumber: raw } = useParams<{ dayNumber: string }>();
  const dayNumber = Number(raw);
  const navigate = useNavigate();

  const [day, setDay] = useState<Day | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("read");
  const progress = useProductMasteryProgress();
  const { markRead, isQuizPassed, isDayComplete, isUnlocked } = progress;
  const unlocked = isUnlocked(dayNumber);
  const [showStickyQuiz, setShowStickyQuiz] = useState(false);

  useEffect(() => {
    setActiveTab("read");
  }, [dayNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDay(undefined);
    loadDay(dayNumber)
      .then((d) => {
        if (!cancelled) {
          setDay(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dayNumber]);

  const { plugins: dayRehypePlugins, ready: dayRehypeReady } = useRehypePlugins(
    Boolean(day?.hasRawHtml),
  );
  const completed = isDayComplete(dayNumber);
  const quizPassed = isQuizPassed(dayNumber);

  useEffect(() => {
    if (day) markRead(dayNumber);
  }, [day, dayNumber, markRead]);

  useEffect(() => {
    if (!day) return;
    const handle = window.setTimeout(() => prefetchDay(dayNumber + 1), 1200);
    return () => window.clearTimeout(handle);
  }, [day, dayNumber]);

  // Sticky "Take the quiz" CTA appears once the learner scrolls past
  // ~55% of the page, while they're not already on the Quiz tab and
  // haven't passed it yet. Days with no quiz questions skip the prompt.
  useEffect(() => {
    if (!day || activeTab === "quiz" || quizPassed || day.quiz.length === 0) {
      setShowStickyQuiz(false);
      return;
    }
    const onScroll = () => {
      const docEl = document.documentElement;
      const total = docEl.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setShowStickyQuiz(false);
        return;
      }
      const past = window.scrollY / total > 0.55;
      setShowStickyQuiz(past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [day, activeTab, quizPassed]);

  const goToQuiz = () => {
    setActiveTab("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || !day) {
    if (loading) {
      return (
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/30" />
        </div>
      );
    }
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Day not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to={BASE_PATH}>Back to Product Mastery hub</Link>
        </Button>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Day {dayNumber} is locked</h2>
          <p className="text-sm text-muted-foreground">
            Pass the quiz on Day {dayNumber - 1} to unlock this day.
          </p>
          <Button asChild>
            <Link to={`${BASE_PATH}/day/${dayNumber - 1}`}>
              Go to Day {dayNumber - 1}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const idx = DAY_SUMMARIES.findIndex((d) => d.dayNumber === dayNumber);
  const prev = idx > 0 ? DAY_SUMMARIES[idx - 1] : undefined;
  const next = idx >= 0 && idx < DAY_SUMMARIES.length - 1 ? DAY_SUMMARIES[idx + 1] : undefined;
  const weekMeta = WEEK_META[day.week];

  const totalSteps = 2; // read + quiz
  const progressSteps = [true, quizPassed].filter(Boolean).length;
  const progressPct = Math.round((progressSteps / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-3 sm:space-y-6 sm:px-0" data-testid="product-mastery-day">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link to={BASE_PATH} className="transition-colors hover:text-primary">
          Product Mastery
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span>Week {day.week}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">Day {day.dayNumber}</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.18), transparent 55%)",
          }}
        />
        <div className="relative grid gap-4 p-4 sm:gap-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative sm:pt-4">
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:absolute sm:left-0 sm:top-0 sm:mb-0 sm:px-2.5 sm:tracking-[0.2em]">
                <Sparkles className="h-2.5 w-2.5" /> Day
              </span>
              <div className="font-serif text-[clamp(2.75rem,11vw,7rem)] font-bold leading-[0.9] tracking-tight tabular-nums text-primary">
                {String(day.dayNumber).padStart(2, "0")}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className="relative grid h-14 w-14 place-items-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${progressPct * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
                aria-label={`${progressPct} percent complete`}
                role="img"
              >
                <div className="grid h-[48px] w-[48px] place-items-center rounded-full bg-card sm:h-[54px] sm:w-[54px]">
                  <span className="font-serif text-sm font-semibold tabular-nums text-foreground sm:text-base">
                    {progressPct}
                    <span className="text-[9px] text-muted-foreground sm:text-[10px]">%</span>
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:tracking-[0.18em]">
                Done
              </span>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:gap-x-3 sm:text-[11px] sm:tracking-[0.18em]">
              <span className="text-primary">Week {day.week}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{weekMeta?.title ?? "Product"}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>~{day.frontmatter.duration_minutes} min</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{day.dayNumber} / {DAY_SUMMARIES.length}</span>
            </div>
            <h1 className="font-serif text-[1.4rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {day.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {completed ? (
                <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Day complete
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-background/60">
                  In progress
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur">
          <TabsTrigger
            value="read"
            className="gap-1.5 rounded-lg px-3.5 py-2 min-h-11 sm:min-h-0 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
          >
            <BookOpen className="h-4 w-4" />
            Read
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="gap-1.5 rounded-lg px-3.5 py-2 min-h-11 sm:min-h-0 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
          >
            <ClipboardCheck className="h-4 w-4" />
            Quiz
            {day.quiz.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                {day.quiz.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="mt-5">
          <Card className="border-border/60 shadow-card">
            <CardContent className="prose prose-sm max-w-none px-4 py-5 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
              {dayRehypeReady ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={dayRehypePlugins} components={dayMarkdownComponents}>
                  {day.markdown}
                </ReactMarkdown>
              ) : (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-5">
          <Suspense fallback={<TabFallback />}>
            <DayQuiz
              dayNumber={dayNumber}
              questions={day.quiz}
              progress={progress}
              basePath={BASE_PATH}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Bottom-of-page quiz CTA — visible inside the Read tab so learners
          don't have to scroll back up after reading the markdown. */}
      {activeTab === "read" && day.quiz.length > 0 && !quizPassed && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={goToQuiz}
            className="gap-2 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
          >
            <ClipboardCheck className="h-5 w-5" />
            Take the quiz ({day.quiz.length} questions)
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        {prev ? (
          <Button
            variant="ghost"
            onClick={() => navigate(`${BASE_PATH}/day/${prev.dayNumber}`)}
            onMouseEnter={() => prefetchDay(prev.dayNumber)}
            className="group -ml-3 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Previous
              </span>
              <span className="text-sm font-medium">Day {prev.dayNumber}</span>
            </span>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button
            variant={quizPassed ? "default" : "secondary"}
            disabled={!quizPassed}
            aria-label={
              quizPassed
                ? `Go to Day ${next.dayNumber}`
                : `Pass today's quiz to unlock Day ${next.dayNumber}`
            }
            onClick={() => quizPassed && navigate(`${BASE_PATH}/day/${next.dayNumber}`)}
            onMouseEnter={() => quizPassed && prefetchDay(next.dayNumber)}
            className={cn(
              "group max-w-[60%] gap-2 whitespace-normal text-left sm:max-w-none",
              quizPassed && "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95",
            )}
          >
            {quizPassed ? (
              <>
                <span className="flex flex-col items-end leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
                    Up next
                  </span>
                  <span className="text-sm font-medium">Day {next.dayNumber}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <span className="text-xs leading-snug sm:text-sm">
                Pass the quiz to unlock Day {next.dayNumber}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Sticky "Take the quiz" CTA — appears once the learner scrolls deep
          into the Read content, quiz still pending, and the day actually
          has questions. Sits above the mobile bottom nav. */}
      {showStickyQuiz && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-16 z-30 px-3 sm:px-4 md:bottom-4"
          aria-live="polite"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/95 p-2 pl-4 shadow-elegant backdrop-blur">
              <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="flex-1 text-sm font-medium leading-snug">
                <span className="hidden sm:inline">Ready to lock today in? </span>
                Take the quiz to unlock Day {dayNumber + 1}.
              </p>
              <Button
                size="sm"
                onClick={goToQuiz}
                className="shrink-0 gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-95"
              >
                Take the quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
