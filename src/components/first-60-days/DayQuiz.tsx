import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/features/first-60-days/types";
import { useFirst60DaysProgress, type DayProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";

/**
 * Inline-only markdown renderer for quiz questions, options, and explanations.
 * Authors regularly write `**bold**`, `*italic*`, `_italic_`, and `` `code` ``
 * in the markdown source — without this they showed up as literal asterisks.
 * Block-level constructs (headings, lists, code fences) intentionally not
 * supported here to keep the layout single-line and avoid <p> wrappers.
 */
function InlineMd({ text }: { text: string | undefined }) {
  if (!text) return null;
  // Split on the union of inline-emphasis patterns, keeping the delimiters.
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g);
  const rendered: ReactNode[] = parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted/60 px-1 py-0.5 text-[0.9em] font-mono">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
  return <>{rendered}</>;
}

/** Progress interface — pass to override the default First 60 Days progress hook. */
export type QuizProgressAdapter = {
  recordQuiz: (dayNumber: number, score: number, passed: boolean) => void;
  isQuizPassed: (dayNumber: number) => boolean;
  getDay: (dayNumber: number) => DayProgress | undefined;
};

type Props = {
  dayNumber: number;
  questions: QuizQuestion[];
  /** Override progress source (e.g. First 30 Days). Defaults to First 60 Days. */
  progress?: QuizProgressAdapter;
  /** Base path for day links. Defaults to "/learning-track/first-60-days". */
  basePath?: string;
};

type Verdict = "pending" | "correct" | "incorrect";

export function DayQuiz({ dayNumber, questions, progress: externalProgress, basePath = "/learning-track/first-60-days" }: Props) {
  const defaultProgress = useFirst60DaysProgress();
  const { recordQuiz, isQuizPassed, getDay } = externalProgress ?? defaultProgress;
  const alreadyPassed = isQuizPassed(dayNumber);
  const previousAttempt = getDay(dayNumber);

  const total = questions.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<Verdict>("pending");
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const recordedRef = useRef(false);

  const q = questions[currentIdx];
  const correctOpts = useMemo(() => q?.options.filter((o) => o.correct) ?? [], [q]);
  const correctKeysSorted = useMemo(
    () => correctOpts.map((o) => o.key).sort(),
    [correctOpts],
  );
  const isMulti = correctOpts.length > 1;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed100 = finished && correctCount === total;

  useEffect(() => {
    if (!finished || recordedRef.current) return;
    recordedRef.current = true;
    recordQuiz(dayNumber, correctCount, correctCount === total);
  }, [finished, correctCount, total, dayNumber, recordQuiz]);

  if (total === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-sm text-muted-foreground">
          This day has no quiz — this is a reflection/graduation module. Mark yourself complete when
          you&apos;ve finished the reflection worksheet.
        </CardContent>
      </Card>
    );
  }

  const onReset = () => {
    setCurrentIdx(0);
    setSelectedKeys([]);
    setVerdict("pending");
    setCorrectCount(0);
    setFinished(false);
    recordedRef.current = false;
  };

  const toggleKey = (key: string) => {
    if (verdict !== "pending") return;
    setSelectedKeys((prev) => {
      if (isMulti) {
        return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      }
      return [key];
    });
  };

  const onCheck = () => {
    if (selectedKeys.length === 0 || verdict !== "pending") return;
    const sorted = [...selectedKeys].sort();
    const isCorrect =
      sorted.length === correctKeysSorted.length &&
      sorted.every((k, i) => k === correctKeysSorted[i]);
    setVerdict(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const onAdvance = () => {
    if (currentIdx + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedKeys([]);
    setVerdict("pending");
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <ResultCard
          dayNumber={dayNumber}
          correct={correctCount}
          total={total}
          passed={passed100}
          pct={pct}
          onRetry={onReset}
          basePath={basePath}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {alreadyPassed && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-300">
            You&apos;ve already passed this quiz
            {previousAttempt.quizScore !== undefined && (
              <>
                {" "}
                ({previousAttempt.quizScore}/{total})
              </>
            )}
            . Retake for practice.
          </span>
        </div>
      )}

      {/* Stepper header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-primary" />
            Question {currentIdx + 1} of {total}
          </span>
          <span>
            <span className="text-emerald-600 dark:text-emerald-400">{correctCount}</span>
            <span className="text-muted-foreground/60"> correct</span>
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => {
            const state =
              i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
            return (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  state === "done" && "bg-primary",
                  state === "active" && "bg-primary/60",
                  state === "pending" && "bg-muted",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <Card
        className={cn(
          "border-border/60 shadow-card transition-colors",
          verdict === "correct" && "border-emerald-500/50",
          verdict === "incorrect" && "border-destructive/50",
        )}
      >
        <CardContent className="space-y-5 p-4 sm:p-8">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Question {q.index}</span>
              {isMulti && (
                <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[9px] tracking-[0.18em] text-primary">
                  Select all that apply
                </span>
              )}
            </div>
            <h3 className="font-serif text-lg font-semibold leading-snug text-foreground sm:text-2xl">
              <InlineMd text={q.question} />
            </h3>
          </div>

          <div className="space-y-2">
            {q.options.map((opt) => {
              const id = `day${dayNumber}-q${q.index}-${opt.key}`;
              const isChosen = selectedKeys.includes(opt.key);
              const isCorrect = opt.correct;
              const locked = verdict !== "pending";
              const showCorrect = locked && isCorrect;
              const showWrongPick = locked && isChosen && !isCorrect;

              return (
                <label
                  key={opt.key}
                  htmlFor={id}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 rounded-xl border p-3 sm:p-4 text-sm transition-all",
                    !locked && isChosen && "border-primary/60 bg-primary/5 shadow-sm",
                    !locked && !isChosen && "border-border/70 hover:border-primary/40 hover:bg-muted/40",
                    showCorrect && "border-emerald-500/60 bg-emerald-500/10",
                    showWrongPick && "border-destructive/60 bg-destructive/10",
                    locked && !showCorrect && !showWrongPick && "border-border/50 opacity-60",
                    locked && "cursor-default",
                  )}
                >
                  <input
                    type={isMulti ? "checkbox" : "radio"}
                    id={id}
                    name={`day${dayNumber}-q${q.index}`}
                    value={opt.key}
                    checked={isChosen}
                    disabled={locked}
                    onChange={() => toggleKey(opt.key)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-serif text-xs font-bold transition-colors",
                      !locked && isChosen && "border-primary bg-primary text-primary-foreground",
                      !locked && !isChosen && "border-border bg-background text-muted-foreground group-hover:border-primary/40",
                      showCorrect && "border-emerald-500 bg-emerald-500 text-white",
                      showWrongPick && "border-destructive bg-destructive text-destructive-foreground",
                      locked && !showCorrect && !showWrongPick && "border-border/60 bg-muted/60 text-muted-foreground",
                    )}
                  >
                    {opt.key}
                  </span>
                  <span className="flex min-w-0 flex-1 items-start gap-2 leading-relaxed">
                    <span className="flex-1 text-foreground/90"><InlineMd text={opt.text} /></span>
                    {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    {showWrongPick && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Feedback panel */}
          {verdict !== "pending" && (
            <FeedbackPanel
              verdict={verdict}
              correctOpts={correctOpts}
              explanation={q.explanation}
              dayNumber={dayNumber}
            />
          )}

          {/* Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {verdict === "pending" ? (
              <>
                <Button
                  size="lg"
                  onClick={onCheck}
                  disabled={selectedKeys.length === 0}
                  className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit answer
                </Button>
                {selectedKeys.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {isMulti ? "Pick every option that applies to continue." : "Pick one option to continue."}
                  </span>
                )}
              </>
            ) : (
              <Button
                size="lg"
                onClick={onAdvance}
                className="group ml-auto gap-2 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
              >
                {currentIdx + 1 >= total ? "See results" : "Next question"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackPanel({
  verdict,
  correctOpts,
  explanation,
  dayNumber,
}: {
  verdict: Exclude<Verdict, "pending">;
  correctOpts: { key: string; text: string }[];
  explanation?: string;
  dayNumber: number;
}) {
  const isCorrect = verdict === "correct";
  const isMulti = correctOpts.length > 1;
  const fallback = isCorrect
    ? "You've got it. This concept is a foundation — the next question builds on it."
    : `Revisit the Day ${dayNumber} reading for this concept. The correct framing is stated directly in the lesson.`;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 sm:p-5",
        isCorrect
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-destructive/40 bg-destructive/5",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage: isCorrect
            ? "radial-gradient(ellipse at top right, rgb(16 185 129 / 0.15), transparent 60%)"
            : "radial-gradient(ellipse at top right, hsl(var(--destructive) / 0.15), transparent 60%)",
        }}
      />
      <div className="relative flex gap-3">
        <div
          className={cn(
            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
            isCorrect ? "bg-emerald-500 text-white" : "bg-destructive text-destructive-foreground",
          )}
        >
          {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div
            className={cn(
              "font-serif text-base font-semibold",
              isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-destructive",
            )}
          >
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          {!isCorrect && correctOpts.length > 0 && (
            <div className="text-sm text-foreground/85">
              {isMulti ? "The correct answers are" : "The correct answer is"}{" "}
              {correctOpts.map((opt, i) => (
                <span key={opt.key}>
                  {i > 0 && (i === correctOpts.length - 1 ? " and " : ", ")}
                  <span className="font-semibold text-foreground">
                    {opt.key}) <InlineMd text={opt.text} />
                  </span>
                </span>
              ))}
              .
            </div>
          )}
          <p className="text-sm leading-relaxed text-foreground/75">
            {explanation ? <InlineMd text={explanation} /> : fallback}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  dayNumber,
  correct,
  total,
  passed,
  pct,
  onRetry,
  basePath,
}: {
  dayNumber: number;
  correct: number;
  total: number;
  passed: boolean;
  pct: number;
  onRetry: () => void;
  basePath: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border shadow-card",
        passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage: passed
            ? "radial-gradient(ellipse at top right, rgb(16 185 129 / 0.18), transparent 60%), radial-gradient(ellipse at bottom left, hsl(var(--primary) / 0.12), transparent 60%)"
            : "radial-gradient(ellipse at top right, hsl(var(--destructive) / 0.18), transparent 60%)",
        }}
      />
      <CardContent className="relative flex flex-col gap-5 p-4 md:p-6 md:pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Big score ring */}
          <div
            className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full sm:h-24 sm:w-24"
            style={{
              background: `conic-gradient(${
                passed ? "hsl(var(--success))" : "hsl(var(--destructive))"
              } ${pct * 3.6}deg, hsl(var(--muted)) 0deg)`,
            }}
            role="img"
            aria-label={`${pct} percent`}
          >
            <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-card sm:h-[82px] sm:w-[82px]">
              <span className="font-serif text-base font-bold tabular-nums text-foreground sm:text-2xl">
                {pct}
                <span className="text-[10px] text-muted-foreground sm:text-sm">%</span>
              </span>
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Day {dayNumber} · Quiz
            </div>
            <div className="font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              {passed ? "Day unlocked." : "Almost — try again."}
            </div>
            <div className="text-sm text-muted-foreground">
              You scored{" "}
              <span className="font-semibold text-foreground">
                {correct} / {total}
              </span>
              {". "}
              {passed
                ? "Perfect run. You can move to the next day."
                : `100% is required to advance — review the ones you missed and retry.`}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-shrink-0 sm:flex-col sm:items-stretch">
          <Button
            variant={passed ? "outline" : "default"}
            onClick={onRetry}
            className={cn(
              "gap-2",
              !passed && "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95",
            )}
          >
            <RotateCcw className="h-4 w-4" />
            {passed ? "Retry for practice" : "Try again"}
          </Button>
          {passed && dayNumber < 60 && (
            <Button asChild className="gap-2 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
              <Link to={`${basePath}/day/${dayNumber + 1}`}>
                Day {dayNumber + 1}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
