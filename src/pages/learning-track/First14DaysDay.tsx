import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { loadDay, loadWeekReadme, WEEK_META } from "@/features/first-14-days/content";
import { DAY_SUMMARIES, TOTAL_DAYS } from "@/features/first-14-days/summaries";
import type { Day } from "@/features/first-14-days/types";
import { useFirst14DaysProgress } from "@/hooks/first-14-days/useFirst14DaysProgress";
import { DayQuiz } from "@/components/first-14-days/DayQuiz";
import { DayWorksheet } from "@/components/first-14-days/DayWorksheet";

type StatusChipProps = {
  icon: typeof BookOpen;
  label: string;
  done: boolean;
  dim?: boolean;
};

function StatusChip({ icon: Icon, label, done, dim = false }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        done
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : dim
          ? "border-border/60 bg-muted/40 text-muted-foreground"
          : "border-border/80 bg-background/60 text-foreground/80",
      )}
    >
      {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}

function WeekWrapup({ weekNumber }: { weekNumber: number }) {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadWeekReadme(weekNumber)
      .then((b) => {
        if (!cancelled) {
          setBody(b ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekNumber]);

  if (loading) return null;
  if (!body) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-card shadow-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.14), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.12), transparent 55%)",
        }}
      />
      <div className="relative px-5 py-5 sm:px-8 sm:py-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3 w-3" />
          Week {weekNumber} wrap-up
        </div>
        <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-img:rounded-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={dayMarkdownComponents}>
            {body}
          </ReactMarkdown>
        </article>
      </div>
    </section>
  );
}

export default function First14DaysDay() {
  const { dayNumber: raw } = useParams<{ dayNumber: string }>();
  const dayNumber = Number(raw);
  const navigate = useNavigate();

  const [day, setDay] = useState<Day | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("read");
  const [showStickyQuiz, setShowStickyQuiz] = useState(false);
  const { isDayComplete, isQuizPassed, markRead, getDay } = useFirst14DaysProgress();

  // Reset to Read tab when navigating between days.
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

  const completed = isDayComplete(dayNumber);
  const quizPassed = isQuizPassed(dayNumber);
  const persisted = getDay(dayNumber);
  const worksheetStarted = Boolean(persisted.reflectionSavedAt);

  useEffect(() => {
    if (day) markRead(dayNumber);
  }, [day, dayNumber, markRead]);

  // Sticky quiz CTA — only when scrolled deep, not on quiz tab, quiz not passed,
  // and the day has questions.
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
      setShowStickyQuiz(window.scrollY / total > 0.55);
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
          <Link to="/learning-track/first-14-days">Back to 14-day hub</Link>
        </Button>
      </div>
    );
  }

  const idx = DAY_SUMMARIES.findIndex((d) => d.dayNumber === dayNumber);
  const prev = idx > 0 ? DAY_SUMMARIES[idx - 1] : undefined;
  const next = idx >= 0 && idx < DAY_SUMMARIES.length - 1 ? DAY_SUMMARIES[idx + 1] : undefined;
  const weekMeta = WEEK_META[day.week];

  const hasWorksheet = day.reflection.length > 0;
  const steps = hasWorksheet ? [true, worksheetStarted, quizPassed] : [true, quizPassed];
  const progressSteps = steps.filter(Boolean).length;
  const progressPct = Math.round((progressSteps / steps.length) * 100);

  // Week wrap-up on Day 7 (end of Week 1) and Day 14 (end of Week 2).
  const isLastDayOfWeek = dayNumber === 7 || dayNumber === 14;

  return (
    <div className="mx-auto max-w-5xl space-y-6" data-testid="first-14-days-day">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link
          to="/learning-track/first-14-days"
          className="transition-colors hover:text-primary"
        >
          14-day hub
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span>Week {day.week}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">Day {day.dayNumber}</span>
      </nav>

      {/* Editorial hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.18), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative grid gap-5 p-5 sm:gap-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          {/* Day numeral + progress ring */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="font-serif text-[clamp(3.75rem,14vw,7rem)] font-bold leading-[0.9] tracking-tight tabular-nums text-primary">
                {String(day.dayNumber).padStart(2, "0")}
              </div>
              <span className="absolute -top-1.5 left-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:-top-2 sm:px-2 sm:tracking-[0.2em]">
                <Sparkles className="h-2.5 w-2.5" /> Day
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className="relative grid h-12 w-12 place-items-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${progressPct * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
                aria-label={`${progressPct} percent complete`}
                role="img"
              >
                <div className="grid h-[40px] w-[40px] place-items-center rounded-full bg-card sm:h-[54px] sm:w-[54px]">
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

          {/* Metadata + title */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:gap-x-3 sm:text-[11px] sm:tracking-[0.18em]">
              <span className="text-primary">Week {day.week}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{weekMeta?.title ?? ""}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>~{day.frontmatter.duration_minutes} min</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>
                {day.dayNumber} / {TOTAL_DAYS}
              </span>
            </div>
            <h1 className="font-serif text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {day.title}
            </h1>

            {day.frontmatter.big_idea && (
              <blockquote className="border-l-4 border-primary/60 pl-4 py-1 italic text-sm text-muted-foreground leading-relaxed">
                {day.frontmatter.big_idea}
              </blockquote>
            )}

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
              <StatusChip icon={BookOpen} label="Read" done={true} />
              {hasWorksheet && (
                <StatusChip
                  icon={NotebookPen}
                  label="Worksheet"
                  done={worksheetStarted}
                  dim={!worksheetStarted}
                />
              )}
              <StatusChip
                icon={ClipboardCheck}
                label="Quiz"
                done={quizPassed}
                dim={!quizPassed}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
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
          {hasWorksheet && (
            <TabsTrigger
              value="worksheet"
              className="gap-1.5 rounded-lg px-3.5 py-2 min-h-11 sm:min-h-0 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
            >
              <NotebookPen className="h-4 w-4" />
              Worksheet
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                {day.reflection.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="read" className="mt-5 animate-fade-in">
          <Card className="border-border/60 shadow-card">
            <CardContent className="prose prose-sm max-w-none px-5 py-6 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={dayMarkdownComponents}>
                {day.markdown}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-5 animate-fade-in">
          <DayQuiz dayNumber={dayNumber} questions={day.quiz} />
        </TabsContent>

        <TabsContent value="worksheet" className="mt-5 animate-fade-in">
          <DayWorksheet dayNumber={dayNumber} prompts={day.reflection} />
        </TabsContent>
      </Tabs>

      {/* Week wrap-up on Day 7 and Day 14 */}
      {isLastDayOfWeek && <WeekWrapup weekNumber={day.week} />}

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        {prev ? (
          <Button
            variant="ghost"
            onClick={() => navigate(`/learning-track/first-14-days/day/${prev.dayNumber}`)}
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
            onClick={() => navigate(`/learning-track/first-14-days/day/${next.dayNumber}`)}
            className="group gap-2 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
          >
            <span className="flex flex-col items-end leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
                Up next
              </span>
              <span className="text-sm font-medium">Day {next.dayNumber}</span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        )}
      </div>

      {/* Sticky quiz CTA */}
      {showStickyQuiz && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-16 z-30 px-3 sm:px-4 md:bottom-4"
          aria-live="polite"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/95 p-2 pl-4 shadow-elegant backdrop-blur">
              <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="flex-1 text-sm font-medium leading-snug">
                <span className="hidden sm:inline">Ready to lock this one in? </span>
                Take the quiz to check your understanding.
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
