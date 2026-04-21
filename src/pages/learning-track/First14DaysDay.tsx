import { useEffect, useMemo, useState } from "react";
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
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { loadDay } from "@/features/first-14-days/content";
import { DAY_SUMMARIES, TOTAL_DAYS } from "@/features/first-14-days/summaries";
import type { Day, QuizQuestion } from "@/features/first-14-days/types";
import {
  useFirst14DaysProgress,
  type ReflectionAnswers,
} from "@/hooks/first-14-days/useFirst14DaysProgress";

// -------- Quiz component (inline) --------

type Verdict = "pending" | "correct" | "incorrect";

function DayQuiz14({ dayNumber, questions }: { dayNumber: number; questions: QuizQuestion[] }) {
  const { recordQuiz, isQuizPassed, getDay } = useFirst14DaysProgress();
  const alreadyPassed = isQuizPassed(dayNumber);
  const total = questions.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [verdict, setVerdict] = useState<Verdict>("pending");
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentIdx];
  const correctOpt = useMemo(() => q?.options.find((o) => o.correct), [q]);
  const previousAttempt = getDay(dayNumber);

  useEffect(() => {
    if (!finished) return;
    recordQuiz(dayNumber, correctCount, correctCount === total);
  }, [finished, correctCount, total, dayNumber, recordQuiz]);

  if (total === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-sm text-muted-foreground">
          This day has no quiz — reflect on the worksheet when you&apos;re done reading.
        </CardContent>
      </Card>
    );
  }

  const onReset = () => {
    setCurrentIdx(0);
    setSelected(undefined);
    setVerdict("pending");
    setCorrectCount(0);
    setFinished(false);
  };

  const onCheck = () => {
    if (!selected || verdict !== "pending") return;
    const isCorrect = selected === correctOpt?.key;
    setVerdict(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const onAdvance = () => {
    if (currentIdx + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(undefined);
    setVerdict("pending");
  };

  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const passed = correctCount === total;
    return (
      <Card className={cn("border-border/60", passed && "border-emerald-500/40 bg-emerald-500/5")}>
        <CardContent className="p-6 space-y-4 text-center">
          <div className="flex justify-center">
            {passed ? (
              <Sparkles className="h-8 w-8 text-emerald-600" />
            ) : (
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif">
              {passed ? "Perfect score!" : `${correctCount} of ${total} correct (${pct}%)`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {passed
                ? "You've locked in the key ideas from this day."
                : "Review the ones you missed — the reasoning matters more than the score."}
            </p>
          </div>
          <Button onClick={onReset} variant="outline" size="sm" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          Question {currentIdx + 1} of {total}
        </span>
        {alreadyPassed && previousAttempt.quizScore !== undefined ? (
          <Badge variant="outline" className="text-[10px]">
            Previously: {previousAttempt.quizScore}/{total}
          </Badge>
        ) : null}
      </div>
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold leading-snug">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isSelected = selected === opt.key;
              const isCorrect = verdict !== "pending" && opt.correct;
              const isWrongSelected = verdict === "incorrect" && isSelected;
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={verdict !== "pending"}
                  onClick={() => setSelected(opt.key)}
                  className={cn(
                    "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                    verdict === "pending" &&
                      (isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40"),
                    isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                    isWrongSelected && "border-rose-500/60 bg-rose-500/10",
                    verdict !== "pending" && !isCorrect && !isWrongSelected && "opacity-60",
                  )}
                >
                  <span className="font-semibold mr-2">{opt.key})</span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {verdict !== "pending" && q.explanation ? (
            <div
              className={cn(
                "rounded-md border p-3 text-sm leading-relaxed",
                verdict === "correct"
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-900 dark:text-emerald-100"
                  : "border-rose-500/40 bg-rose-500/5 text-rose-900 dark:text-rose-100",
              )}
            >
              <span className="font-semibold mr-1">Why:</span>
              {q.explanation}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            {verdict === "pending" ? (
              <Button onClick={onCheck} disabled={!selected} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Check
              </Button>
            ) : (
              <Button onClick={onAdvance} className="gap-1.5">
                {currentIdx + 1 >= total ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -------- Worksheet component (inline) --------

function DayWorksheet14({ dayNumber, prompts }: { dayNumber: number; prompts: Day["reflection"] }) {
  const { getDay, saveReflection } = useFirst14DaysProgress();
  const existing = getDay(dayNumber).reflectionAnswers ?? {};
  const [answers, setAnswers] = useState<ReflectionAnswers>(existing);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (prompts.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No worksheet on this day.
        </CardContent>
      </Card>
    );
  }

  const onSave = () => {
    saveReflection(dayNumber, answers);
    setSavedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Write what's true for you. Only you will see this — nothing is submitted anywhere.
      </p>
      <div className="space-y-4">
        {prompts.map((p) => (
          <Card key={p.index}>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="font-semibold text-sm leading-snug">
                  <span className="text-muted-foreground mr-1.5">{p.index}.</span>
                  {p.question}
                </p>
                {p.hint ? (
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{p.hint}</p>
                ) : null}
              </div>
              <Textarea
                value={answers[String(p.index)] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [String(p.index)]: e.target.value }))
                }
                placeholder="Your honest answer..."
                rows={3}
                className="text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-muted-foreground">
          {savedAt ? `Saved at ${savedAt}` : "Not saved yet"}
        </span>
        <Button onClick={onSave} size="sm" variant="outline" className="gap-1.5">
          <NotebookPen className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
    </div>
  );
}

// -------- Main page --------

export default function First14DaysDay() {
  const { dayNumber: dayParam } = useParams();
  const navigate = useNavigate();
  const dayNumber = Number(dayParam) || 1;
  const [day, setDay] = useState<Day | undefined>();
  const [loading, setLoading] = useState(true);
  const { markRead, isDayComplete, getDay } = useFirst14DaysProgress();

  const summary = DAY_SUMMARIES.find((d) => d.dayNumber === dayNumber);
  const prevDay = dayNumber > 1 ? dayNumber - 1 : null;
  const nextDay = dayNumber < TOTAL_DAYS ? dayNumber + 1 : null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadDay(dayNumber).then((d) => {
      if (cancelled) return;
      setDay(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dayNumber]);

  useEffect(() => {
    if (day) markRead(dayNumber);
  }, [day, dayNumber, markRead]);

  if (loading || !day) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-sm text-muted-foreground">Loading...</div>
    );
  }

  const progress = getDay(dayNumber);
  const complete = isDayComplete(dayNumber);

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="first-14-days-day">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link to="/learning-track/first-14-days">
            <ArrowLeft className="h-4 w-4" /> All days
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          Day {dayNumber} of {TOTAL_DAYS}
        </div>
      </div>

      {/* Hero */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
            Week {day.week}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            ~{day.frontmatter.duration_minutes} min
          </Badge>
          {complete ? (
            <Badge className="text-[10px] bg-emerald-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
            </Badge>
          ) : null}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif leading-tight tracking-tight">
          Day {dayNumber} — {day.title}
        </h1>
        {day.frontmatter.big_idea ? (
          <blockquote className="border-l-4 border-primary/60 pl-4 py-1 italic text-base text-muted-foreground leading-relaxed">
            {day.frontmatter.big_idea}
          </blockquote>
        ) : (
          summary?.bigIdea && (
            <blockquote className="border-l-4 border-primary/60 pl-4 py-1 italic text-base text-muted-foreground leading-relaxed">
              {summary.bigIdea}
            </blockquote>
          )
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="read" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="read" className="gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5" /> Read
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5 text-xs sm:text-sm">
            <ClipboardCheck className="h-3.5 w-3.5" /> Quiz
            {day.quiz.length > 0 ? (
              <span className="ml-1 text-[10px] text-muted-foreground tabular-nums">
                ({day.quiz.length})
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="worksheet" className="gap-1.5 text-xs sm:text-sm">
            <NotebookPen className="h-3.5 w-3.5" /> Worksheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="pt-6">
          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={dayMarkdownComponents}>
              {day.markdown}
            </ReactMarkdown>
          </article>
        </TabsContent>

        <TabsContent value="quiz" className="pt-6">
          <DayQuiz14 dayNumber={dayNumber} questions={day.quiz} />
        </TabsContent>

        <TabsContent value="worksheet" className="pt-6">
          <DayWorksheet14 dayNumber={dayNumber} prompts={day.reflection} />
        </TabsContent>
      </Tabs>

      {/* Bottom nav */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          disabled={!prevDay}
          onClick={() => prevDay && navigate(`/learning-track/first-14-days/day/${prevDay}`)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          {prevDay ? `Day ${prevDay}` : "Start"}
        </Button>
        <Button
          size="sm"
          disabled={!nextDay}
          onClick={() => nextDay && navigate(`/learning-track/first-14-days/day/${nextDay}`)}
          className="gap-1.5"
        >
          {nextDay ? `Day ${nextDay}` : "Finish"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
