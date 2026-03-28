import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyQuestion } from '@/data/proAchieverStudyBank';

interface StudyQuizProps {
  questions: StudyQuestion[];
  onFinish: () => void;
}

export function StudyQuiz({ questions, onFinish }: StudyQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );
  const [score, setScore] = useState(0);

  const q = questions[currentIdx];
  const selected = selectedAnswers[currentIdx];
  const hasAnswered = selected !== null;
  const isCorrect = selected === q.correct;
  const isComplete = currentIdx === questions.length - 1 && hasAnswered;
  const allAnswered = selectedAnswers.every((a) => a !== null);
  const [showSummary, setShowSummary] = useState(false);

  const handleSelect = useCallback((optionIdx: number) => {
    if (hasAnswered) return;
    const next = [...selectedAnswers];
    next[currentIdx] = optionIdx;
    setSelectedAnswers(next);
    if (optionIdx === q.correct) setScore((s) => s + 1);
  }, [currentIdx, hasAnswered, q.correct, selectedAnswers]);

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else if (allAnswered) {
      setShowSummary(true);
    }
  }, [currentIdx, questions.length, allAnswered]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }, [currentIdx]);

  const percent = Math.round(((selectedAnswers.filter(a => a !== null).length) / questions.length) * 100);

  // Summary screen
  if (showSummary) {
    const scorePercent = Math.round((score / questions.length) * 100);
    const missed = selectedAnswers
      .map((a, i) => (a !== questions[i].correct ? i : -1))
      .filter((i) => i >= 0);

    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((qq, i) => {
      if (!categoryBreakdown[qq.category]) categoryBreakdown[qq.category] = { correct: 0, total: 0 };
      categoryBreakdown[qq.category].total++;
      if (selectedAnswers[i] === qq.correct) categoryBreakdown[qq.category].correct++;
    });

    const gradeLabel = scorePercent === 100 ? 'Perfect!' : scorePercent >= 80 ? 'Excellent' : scorePercent >= 60 ? 'Good effort' : scorePercent >= 40 ? 'Keep practising' : 'Review needed';

    return (
      <Card className="border-accent/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2">
            <Trophy className={cn("h-10 w-10", scorePercent >= 80 ? "text-yellow-500" : "text-muted-foreground")} />
          </div>
          <CardTitle className="text-2xl">
            {score}/{questions.length}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {gradeLabel} — {scorePercent}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category breakdown */}
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([cat, { correct, total }]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 truncate capitalize">
                  {cat.replace(/-/g, ' ')}
                </span>
                <Progress value={(correct / total) * 100} className="h-2 flex-1" />
                <span className="text-xs font-medium tabular-nums w-12 text-right">
                  {correct}/{total}
                </span>
              </div>
            ))}
          </div>

          {/* Missed questions */}
          {missed.length > 0 && (
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium mb-1">
                Review these questions ({missed.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {missed.map((i) => (
                  <button
                    key={i}
                    onClick={() => { setShowSummary(false); setCurrentIdx(i); }}
                    className="text-xs rounded bg-destructive/10 text-destructive px-2 py-0.5 hover:bg-destructive/20 transition-colors"
                  >
                    Q{i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onFinish} className="flex-1">
              <BookOpen className="h-4 w-4 mr-1" />
              New Set
            </Button>
            <Button onClick={() => { setShowSummary(false); setCurrentIdx(0); }} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-1" />
              Review All
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Q{currentIdx + 1} of {questions.length}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {q.category.replace(/-/g, ' ')}
            </Badge>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {score} correct
            </span>
          </div>
        </div>
        <Progress value={percent} className="h-1.5" />
      </CardHeader>

      <CardContent className="px-4 sm:px-6 space-y-4">
        {/* Question */}
        <p className="text-sm sm:text-base font-medium leading-relaxed">{q.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((option, idx) => {
            let variant: string = 'border-border bg-background hover:bg-accent/50';
            if (hasAnswered) {
              if (idx === q.correct) variant = 'border-green-500 bg-green-50 dark:bg-green-950/30';
              else if (idx === selected) variant = 'border-red-500 bg-red-50 dark:bg-red-950/30';
              else variant = 'border-border bg-background opacity-50';
            } else if (idx === selected) {
              variant = 'border-primary bg-primary/5';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={hasAnswered}
                className={cn(
                  'w-full text-left rounded-lg border p-3 text-sm transition-all flex items-start gap-2',
                  variant,
                  !hasAnswered && 'cursor-pointer'
                )}
              >
                {hasAnswered && idx === q.correct && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && idx === selected && idx !== q.correct && (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                )}
                {(!hasAnswered || (idx !== q.correct && idx !== selected)) && (
                  <span className="h-4 w-4 shrink-0 mt-0.5 rounded-full border text-center text-[10px] leading-4 font-medium">
                    {String.fromCharCode(65 + idx)}
                  </span>
                )}
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {hasAnswered && (
          <div className={cn(
            'rounded-lg border p-3 text-sm',
            isCorrect
              ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
              : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
          )}>
            <p className="font-medium mb-1 flex items-center gap-1.5">
              {isCorrect ? (
                <><CheckCircle2 className="h-4 w-4 text-green-600" /> Correct!</>
              ) : (
                <><XCircle className="h-4 w-4 text-red-500" /> Incorrect</>
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!hasAnswered}
          >
            {currentIdx === questions.length - 1 ? (
              <>Finish</>
            ) : (
              <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
