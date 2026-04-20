import { useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { detectVideoEmbed, VideoEmbed } from "@/lib/video-embed-utils";
import { getDay, getAllDays, WEEK_META } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { useFirst60DaysDayMeta } from "@/hooks/first-60-days/useFirst60DaysDayMeta";
import { DayQuiz } from "@/components/first-60-days/DayQuiz";
import { DayReflection } from "@/components/first-60-days/DayReflection";

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

export default function First60DaysDay() {
  const { dayNumber: raw } = useParams<{ dayNumber: string }>();
  const dayNumber = Number(raw);
  const navigate = useNavigate();

  const day = useMemo(() => getDay(dayNumber), [dayNumber]);
  const { isUnlocked, isDayComplete, isQuizPassed, isReflectionSubmitted, markRead } =
    useFirst60DaysProgress();
  const dayMetaQuery = useFirst60DaysDayMeta(dayNumber);
  const dayMeta = dayMetaQuery.data;
  const unlocked = isUnlocked(dayNumber);
  const completed = isDayComplete(dayNumber);
  const quizPassed = isQuizPassed(dayNumber);
  const reflectionSubmitted = isReflectionSubmitted(dayNumber);

  useEffect(() => {
    if (day && unlocked) markRead(dayNumber);
  }, [day, dayNumber, unlocked, markRead]);

  if (!day) {
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

  const allDays = getAllDays();
  const idx = allDays.findIndex((d) => d.dayNumber === dayNumber);
  const prev = idx > 0 ? allDays[idx - 1] : undefined;
  const next = idx >= 0 && idx < allDays.length - 1 ? allDays[idx + 1] : undefined;
  const nextUnlocked = next ? isDayComplete(dayNumber) : false;
  const weekMeta = WEEK_META[day.week];

  const hasReflection = day.reflection.length > 0;
  const steps = hasReflection
    ? [unlocked, reflectionSubmitted, quizPassed]
    : [unlocked, quizPassed];
  const progressSteps = steps.filter(Boolean).length;
  const progressPct = Math.round((progressSteps / steps.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6" data-testid="first-60-days-day">
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

        <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          {/* Left: day numeral + completion ring inline */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="font-serif text-[clamp(4.5rem,11vw,7rem)] font-bold leading-[0.9] tracking-tight tabular-nums text-primary">
                {String(day.dayNumber).padStart(2, "0")}
              </div>
              <span className="absolute -top-2 left-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-2.5 w-2.5" /> Day
              </span>
            </div>
            <div className="hidden flex-col items-center gap-1.5 sm:flex">
              <div
                className="relative grid h-16 w-16 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${progressPct * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
                aria-label={`${progressPct} percent complete`}
                role="img"
              >
                <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-card">
                  <span className="font-serif text-base font-semibold tabular-nums text-foreground">
                    {progressPct}
                    <span className="text-[10px] text-muted-foreground">%</span>
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Completion
              </span>
            </div>
          </div>

          {/* Right: metadata + title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-primary">Week {day.week}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{weekMeta?.title ?? "Foundations"}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>~{day.frontmatter.duration_minutes} min</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{day.dayNumber} / 60</span>
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
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
          </div>

          {/* Right: completion ring */}
          <div className="hidden md:flex md:flex-col md:items-center md:gap-2">
            <div
              className="relative grid h-20 w-20 place-items-center rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${progressPct * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
              aria-label={`${progressPct} percent complete`}
              role="img"
            >
              <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-card">
                <span className="font-serif text-lg font-semibold tabular-nums text-foreground">
                  {progressPct}
                  <span className="text-xs text-muted-foreground">%</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Completion
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="read" className="w-full">
        <TabsList className="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur">
          <TabsTrigger
            value="read"
            className="gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
          >
            <BookOpen className="h-4 w-4" />
            Read
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
          >
            <Film className="h-4 w-4" />
            Video
          </TabsTrigger>
          {hasReflection && (
            <TabsTrigger
              value="reflection"
              className="gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
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
            className="gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant"
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

        <TabsContent value="read" className="mt-5 animate-fade-in">
          <Card className="border-border/60 shadow-card">
            <CardContent className="prose prose-sm max-w-none px-5 py-6 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={dayMarkdownComponents}>
                {day.markdown}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-5 animate-fade-in">
          {dayMeta?.video_url ? (
            <Card className="overflow-hidden border-border/60 shadow-card">
              <CardContent className="p-0">
                {(() => {
                  const info = detectVideoEmbed(dayMeta.video_url);
                  if (info.embedUrl) {
                    return <VideoEmbed embedUrl={info.embedUrl} platform={info.platform} />;
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

        <TabsContent value="reflection" className="mt-5 animate-fade-in">
          <DayReflection dayNumber={dayNumber} prompts={day.reflection} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-5 animate-fade-in">
          <DayQuiz dayNumber={dayNumber} questions={day.quiz} />
        </TabsContent>
      </Tabs>

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        {prev ? (
          <Button
            variant="ghost"
            onClick={() => navigate(`/learning-track/first-60-days/day/${prev.dayNumber}`)}
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
            onClick={() => nextUnlocked && navigate(`/learning-track/first-60-days/day/${next.dayNumber}`)}
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
    </div>
  );
}
