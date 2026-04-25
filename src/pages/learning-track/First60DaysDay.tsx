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
  Film,
  Lock,
  ClipboardCheck,
  NotebookPen,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { detectVideoEmbed } from "@/lib/video-embed-utils";
import { loadDay, loadWeekReadme, prefetchDay, WEEK_META } from "@/features/first-60-days/content";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";
import type { Day } from "@/features/first-60-days/types";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { useFirst60DaysDayMeta } from "@/hooks/first-60-days/useFirst60DaysDayMeta";

// Tab-gated chunks — Read is the default landing tab for every day, so Quiz,
// Reflection, and the video iframe wrapper stay out of the critical path until
// the learner actually switches tabs.
const DayQuiz = lazy(() =>
  import("@/components/first-60-days/DayQuiz").then((m) => ({ default: m.DayQuiz })),
);
const DayReflection = lazy(() =>
  import("@/components/first-60-days/DayReflection").then((m) => ({ default: m.DayReflection })),
);
const VideoEmbed = lazy(() =>
  import("@/lib/video-embed").then((m) => ({ default: m.VideoEmbed })),
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

// rehype-raw pulls in a full HTML parser (~50 kB). Only a handful of day files
// actually use raw HTML, so we lazy-load the plugin and cache the module so
// subsequent days that also need it don't re-fetch.
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

const RAW_HTML_RE = /<(?:div|span|br|iframe|table|sup|sub|kbd|details|summary|section|figure|video)\b/i;

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

  const { plugins: rehypePlugins, ready: rehypeReady } = useRehypePlugins(
    body ? RAW_HTML_RE.test(body) : false,
  );

  if (loading || !rehypeReady) return null;
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
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={dayMarkdownComponents}>
            {body}
          </ReactMarkdown>
        </article>
      </div>
    </section>
  );
}

export default function First60DaysDay() {
  const { dayNumber: raw } = useParams<{ dayNumber: string }>();
  const dayNumber = Number(raw);
  const navigate = useNavigate();

  const [day, setDay] = useState<Day | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("read");
  const [showStickyQuiz, setShowStickyQuiz] = useState(false);
  const {
    isUnlocked,
    isDayComplete,
    isQuizPassed,
    isReflectionSubmitted,
    markRead,
    isActualAdmin,
    markDayCompleteAsAdmin,
    unmarkDayCompleteAsAdmin,
  } = useFirst60DaysProgress();

  // Reset to the Read tab when navigating between days.
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
  const dayMetaQuery = useFirst60DaysDayMeta(dayNumber);
  const dayMeta = dayMetaQuery.data;
  const { plugins: dayRehypePlugins, ready: dayRehypeReady } = useRehypePlugins(
    Boolean(day?.hasRawHtml),
  );
  const unlocked = isUnlocked(dayNumber);
  const completed = isDayComplete(dayNumber);
  const quizPassed = isQuizPassed(dayNumber);
  const reflectionSubmitted = isReflectionSubmitted(dayNumber);

  useEffect(() => {
    if (day && unlocked) markRead(dayNumber);
  }, [day, dayNumber, unlocked, markRead]);

  // Warm the next day's raw chunk while the learner is on the current day, so
  // tapping "Up next" resolves from cache instead of a cold network round-trip.
  useEffect(() => {
    if (!day) return;
    const handle = window.setTimeout(() => prefetchDay(dayNumber + 1), 1200);
    return () => window.clearTimeout(handle);
  }, [day, dayNumber]);

  // Sticky "Take the quiz" CTA appears once the learner has scrolled past
  // ~60% of the page, while they're not already on the Quiz tab and haven't
  // passed it yet. Days with no quiz questions skip the prompt entirely.
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
      // Warm the quiz chunk as soon as the learner scrolls deep enough for
      // the sticky CTA to appear, so tapping it is instant.
      if (past) {
        import("@/components/first-60-days/DayQuiz").catch(() => undefined);
      }
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
          <Link to="/learning-track/first-60-days">Back to 60-day hub</Link>
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
            Finish the quiz on Day {dayNumber - 1} to unlock this day.
          </p>
          <Button asChild>
            <Link to={`/learning-track/first-60-days/day/${dayNumber - 1}`}>
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
  const nextUnlocked = next ? isDayComplete(dayNumber) : false;
  const weekMeta = WEEK_META[day.week];

  const hasReflection = day.reflection.length > 0;
  const steps = hasReflection
    ? [unlocked, reflectionSubmitted, quizPassed]
    : [unlocked, quizPassed];
  const progressSteps = steps.filter(Boolean).length;
  const progressPct = Math.round((progressSteps / steps.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-3 sm:space-y-6 sm:px-0" data-testid="first-60-days-day">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link
          to="/learning-track/first-60-days"
          className="transition-colors hover:text-primary"
        >
          60-day hub
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span>Week {day.week}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">Day {day.dayNumber}</span>
      </nav>

      {/* Editorial hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
        {/* Decorative blueprint mesh */}
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

        <div className="relative grid gap-4 p-4 sm:gap-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          {/* Left: day numeral + completion ring inline */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative">
              <div className="font-serif text-[clamp(3rem,12vw,7rem)] font-bold leading-[0.9] tracking-tight tabular-nums text-primary">
                {String(day.dayNumber).padStart(2, "0")}
              </div>
              <span className="absolute -top-1 left-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:-top-2 sm:px-2 sm:tracking-[0.2em]">
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

          {/* Right: metadata + title */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:gap-x-3 sm:text-[11px] sm:tracking-[0.18em]">
              <span className="text-primary">Week {day.week}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{weekMeta?.title ?? "Foundations"}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>~{day.frontmatter.duration_minutes} min</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{day.dayNumber} / 60</span>
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
              <StatusChip icon={BookOpen} label="Read" done={unlocked} />
              {hasReflection && (
                <StatusChip
                  icon={NotebookPen}
                  label="Reflection"
                  done={reflectionSubmitted}
                  dim={!reflectionSubmitted}
                />
              )}
              <StatusChip
                icon={ClipboardCheck}
                label="Quiz"
                done={quizPassed}
                dim={!quizPassed}
              />
            </div>

            {isActualAdmin && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {completed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unmarkDayCompleteAsAdmin(dayNumber)}
                    className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin: Unmark day
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markDayCompleteAsAdmin(dayNumber)}
                    className="gap-1.5 border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin: Mark day as done
                  </Button>
                )}
                <span className="text-[11px] text-muted-foreground">
                  Skips quiz {hasReflection ? "and reflection " : ""}requirements.
                </span>
              </div>
            )}
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
            value="video"
            className="gap-1.5 rounded-lg px-3.5 py-2 min-h-11 sm:min-h-0 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
          >
            <Film className="h-4 w-4" />
            Video
          </TabsTrigger>
          {hasReflection && (
            <TabsTrigger
              value="reflection"
              className="gap-1.5 rounded-lg px-3.5 py-2 min-h-11 sm:min-h-0 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
            >
              <NotebookPen className="h-4 w-4" />
              Reflection
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                {day.reflection.length}
              </span>
            </TabsTrigger>
          )}
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
            <CardContent className="prose prose-sm max-w-none px-5 py-6 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
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

        <TabsContent value="video" className="mt-5">
          {dayMeta?.video_url ? (
            <Card className="overflow-hidden border-border/60 shadow-card">
              <CardContent className="p-0">
                {(() => {
                  const info = detectVideoEmbed(dayMeta.video_url);
                  if (info.embedUrl) {
                    return (
                      <Suspense fallback={<TabFallback />}>
                        <VideoEmbed embedUrl={info.embedUrl} platform={info.platform ?? "video"} />
                      </Suspense>
                    );
                  }
                  return (
                    <div className="p-6 text-sm text-muted-foreground">
                      Video URL stored but not recognised by the player.{" "}
                      <a
                        href={dayMeta.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        Open in new tab
                      </a>
                      .
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                  <Film className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Video coming soon</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  The video lecture for this day hasn&apos;t been recorded yet. Continue with Read + Quiz.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reflection" className="mt-5">
          <Suspense fallback={<TabFallback />}>
            <DayReflection dayNumber={dayNumber} prompts={day.reflection} />
          </Suspense>
        </TabsContent>

        <TabsContent value="quiz" className="mt-5">
          <Suspense fallback={<TabFallback />}>
            <DayQuiz dayNumber={dayNumber} questions={day.quiz} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Week wrap-up — rendered on the last day of each week (day 6, 12, …, 60). */}
      {dayNumber % 6 === 0 && <WeekWrapup weekNumber={day.week} />}

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        {prev ? (
          <Button
            variant="ghost"
            onClick={() => navigate(`/learning-track/first-60-days/day/${prev.dayNumber}`)}
            onMouseEnter={() => prefetchDay(prev.dayNumber)}
            onFocus={() => prefetchDay(prev.dayNumber)}
            onTouchStart={() => prefetchDay(prev.dayNumber)}
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
            variant={nextUnlocked ? "default" : "secondary"}
            disabled={!nextUnlocked}
            aria-label={
              nextUnlocked
                ? `Go to Day ${next.dayNumber}`
                : `Complete today's ${hasReflection ? "quiz and reflection" : "quiz"} to unlock Day ${next.dayNumber}`
            }
            onClick={() => nextUnlocked && navigate(`/learning-track/first-60-days/day/${next.dayNumber}`)}
            onMouseEnter={() => nextUnlocked && prefetchDay(next.dayNumber)}
            onFocus={() => nextUnlocked && prefetchDay(next.dayNumber)}
            onTouchStart={() => nextUnlocked && prefetchDay(next.dayNumber)}
            className={cn(
              "group gap-2",
              nextUnlocked && "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95",
            )}
          >
            {nextUnlocked ? (
              <>
                <span className="flex flex-col items-end leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
                    Up next
                  </span>
                  <span className="text-sm font-medium">Day {next.dayNumber}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : hasReflection && !quizPassed && !reflectionSubmitted ? (
              "Finish quiz + reflection to unlock next"
            ) : !quizPassed ? (
              "Pass the quiz to unlock next"
            ) : (
              "Submit reflection to unlock next"
            )}
          </Button>
        )}
      </div>

      {/* Sticky "Take the quiz" CTA — only when scrolled deep into Read /
          Video / Reflection content, quiz still pending, and the day actually
          has quiz questions. Sits above the mobile bottom nav. */}
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
              <Button size="sm" onClick={goToQuiz} className="shrink-0 gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-95">
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
