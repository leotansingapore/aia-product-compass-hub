import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/features/first-60-days/types";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";

const PASS_THRESHOLD = 2 / 3;

type Props = {
  dayNumber: number;
  questions: QuizQuestion[];
};

type Answers = Record<number, string>;

export function DayQuiz({ dayNumber, questions }: Props) {
  const { recordQuiz, isQuizPassed, getDay } = useFirst60DaysProgress();
  const alreadyPassed = isQuizPassed(dayNumber);
  const previousAttempt = getDay(dayNumber);

  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.index]);
  const result = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    const breakdown = questions.map((q) => {
      const chosen = answers[q.index];
      const correctOpt = q.options.find((o) => o.correct);
      const isCorrect = chosen === correctOpt?.key;
      if (isCorrect) correct++;
      return { q, chosen, correctKey: correctOpt?.key ?? "", isCorrect };
    });
    return { correct, total: questions.length, breakdown };
  }, [submitted, questions, answers]);

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          This day has no quiz — this is a reflection/graduation module. Mark yourself complete when
          you've finished the reflection worksheet.
        </CardContent>
      </Card>
    );
  }

  const passed = result ? result.correct / result.total >= PASS_THRESHOLD : false;

  const onSubmit = () => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    let correct = 0;
    for (const q of questions) {
      const correctOpt = q.options.find((o) => o.correct);
      if (answers[q.index] === correctOpt?.key) correct++;
    }
    const didPass = correct / questions.length >= PASS_THRESHOLD;
    recordQuiz(dayNumber, correct, didPass);
  };

  const onRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      {alreadyPassed && !submitted && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              You've already passed this quiz
              {previousAttempt.quizScore !== undefined && (
                <> ({previousAttempt.quizScore}/{questions.length})</>
              )}
              . Retake for practice anytime.
            </span>
          </CardContent>
        </Card>
      )}

      {questions.map((q) => {
        const chosen = answers[q.index];
        const correctOpt = q.options.find((o) => o.correct);
        const outcome = submitted
          ? chosen === correctOpt?.key
            ? "correct"
            : "incorrect"
          : "pending";
        return (
          <Card key={q.index} className={cn(outcome === "correct" && "border-emerald-500/40", outcome === "incorrect" && "border-destructive/40")}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start gap-2 text-base font-semibold">
                <span className="text-muted-foreground">{q.index}.</span>
                <span>{q.question}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={chosen}
                onValueChange={(v) => !submitted && setAnswers((a) => ({ ...a, [q.index]: v }))}
                className="space-y-2"
              >
                {q.options.map((opt) => {
                  const id = `day${dayNumber}-q${q.index}-${opt.key}`;
                  const isChosen = chosen === opt.key;
                  const isCorrect = opt.correct;
                  const showCorrect = submitted && isCorrect;
                  const showWrongPick = submitted && isChosen && !isCorrect;
                  return (
                    <Label
                      key={opt.key}
                      htmlFor={id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors",
                        !submitted && "hover:bg-muted",
                        showCorrect && "border-emerald-500/60 bg-emerald-500/10",
                        showWrongPick && "border-destructive/60 bg-destructive/10",
                        submitted && "cursor-default"
                      )}
                    >
                      <RadioGroupItem value={opt.key} id={id} disabled={submitted} className="mt-0.5" />
                      <span className="flex min-w-0 flex-1 items-start gap-2">
                        <span className="font-semibold">{opt.key})</span>
                        <span className="flex-1">{opt.text}</span>
                        {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                        {showWrongPick && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        );
      })}

      {!submitted ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onSubmit} disabled={!allAnswered}>
            Submit answers
          </Button>
          {!allAnswered && (
            <span className="text-sm text-muted-foreground">
              Answer all {questions.length} questions to submit.
            </span>
          )}
        </div>
      ) : (
        <Card className={cn(passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5")}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
              <div>
                <div className="font-semibold">
                  {passed ? "Nice. Day unlocked." : "Not quite there yet."}
                </div>
                <div className="text-sm text-muted-foreground">
                  You scored <Badge variant="secondary">{result?.correct}/{result?.total}</Badge> — pass is {Math.ceil(questions.length * PASS_THRESHOLD)}/{questions.length}.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              {passed && dayNumber < 60 && (
                <Button asChild>
                  <Link to={`/learning-track/first-60-days/day/${dayNumber + 1}`}>
                    Next day
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
