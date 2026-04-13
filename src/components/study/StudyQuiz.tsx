import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCcw, Trophy, BookOpen, AlertTriangle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyQuestion } from '@/data/proAchieverStudyBank';

// ── Spaced repetition helpers ───────────────────────────────────────────
const WEAK_KEY = (productSlug: string) => `study_weak_${productSlug}`;

/** Load weak-question indices for a product from localStorage */
function loadWeakQuestions(productSlug: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(WEAK_KEY(productSlug));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** Save weak-question data — keyed by question text, value = miss count */
function saveWeakQuestions(productSlug: string, data: Record<string, number>) {
  localStorage.setItem(WEAK_KEY(productSlug), JSON.stringify(data));
}

// ── Session persistence helpers ─────────────────────────────────────────
const SESSION_KEY = (productSlug: string) => `study_session_${productSlug}`;

interface PersistedSession {
  questionTexts: string[];
  selectedAnswers: (number | null)[];
  shuffleMaps: number[][];
  score: number;
  currentIdx: number;
}

function loadSession(productSlug: string, questionCount: number): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY(productSlug));
    if (!raw) return null;
    const parsed: PersistedSession = JSON.parse(raw);
    if (parsed.selectedAnswers?.length === questionCount &&
        parsed.questionTexts?.length === questionCount) {
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function saveSession(productSlug: string, session: PersistedSession) {
  localStorage.setItem(SESSION_KEY(productSlug), JSON.stringify(session));
}

function clearSession(productSlug: string) {
  localStorage.removeItem(SESSION_KEY(productSlug));
}

// ── Option shuffling ────────────────────────────────────────────────────
/** Create a shuffle map: shuffleMap[displayIdx] = originalIdx */
function createShuffleMap(optionCount: number): number[] {
  const indices = Array.from({ length: optionCount }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// ── Component ───────────────────────────────────────────────────────────
interface StudyQuizProps {
  questions: StudyQuestion[];
  onFinish: () => void;
  /** Product slug for persistence, e.g. "pro-achiever" */
  productSlug?: string;
}

export function StudyQuiz({ questions, onFinish, productSlug = '' }: StudyQuizProps) {
  // Generate shuffle maps per question (stable per session)
  const [shuffleMaps, setShuffleMaps] = useState<number[][]>(() => {
    const saved = productSlug ? loadSession(productSlug, questions.length) : null;
    if (saved?.shuffleMaps?.length === questions.length) return saved.shuffleMaps;
    return questions.map(q => createShuffleMap(q.options.length));
  });

  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = productSlug ? loadSession(productSlug, questions.length) : null;
    return saved?.currentIdx ?? 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() => {
    const saved = productSlug ? loadSession(productSlug, questions.length) : null;
    if (saved?.selectedAnswers?.length === questions.length) return saved.selectedAnswers;
    return new Array(questions.length).fill(null);
  });

  const [score, setScore] = useState(() => {
    const saved = productSlug ? loadSession(productSlug, questions.length) : null;
    return saved?.score ?? 0;
  });

  const [showSummary, setShowSummary] = useState(false);

  const q = questions[currentIdx];
  const map = shuffleMaps[currentIdx];
  const selected = selectedAnswers[currentIdx];
  const hasAnswered = selected !== null;
  // Map the correct original index through the shuffle to find display position
  const correctDisplay = map.indexOf(q.correct);
  const isCorrect = selected === correctDisplay;
  const allAnswered = selectedAnswers.every((a) => a !== null);

  // Persist session on every state change
  useEffect(() => {
    if (!productSlug) return;
    saveSession(productSlug, {
      questionTexts: questions.map(qq => qq.question),
      selectedAnswers,
      shuffleMaps,
      score,
      currentIdx,
    });
  }, [selectedAnswers, score, currentIdx, productSlug, questions, shuffleMaps]);

  const handleSelect = useCallback((displayIdx: number) => {
    if (hasAnswered) return;
    const next = [...selectedAnswers];
    next[currentIdx] = displayIdx;
    setSelectedAnswers(next);
    if (displayIdx === correctDisplay) setScore((s) => s + 1);
  }, [currentIdx, hasAnswered, correctDisplay, selectedAnswers]);

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else if (allAnswered) {
      setShowSummary(true);
      // Update spaced repetition data
      if (productSlug) {
        const weak = loadWeakQuestions(productSlug);
        questions.forEach((qq, i) => {
          const displayCorrect = shuffleMaps[i].indexOf(qq.correct);
          if (selectedAnswers[i] !== displayCorrect) {
            weak[qq.question] = (weak[qq.question] || 0) + 1;
          } else if (weak[qq.question]) {
            // Decay miss count on correct answer
            weak[qq.question] = Math.max(0, weak[qq.question] - 1);
            if (weak[qq.question] === 0) delete weak[qq.question];
          }
        });
        saveWeakQuestions(productSlug, weak);
        clearSession(productSlug);
      }
    }
  }, [currentIdx, questions, allAnswered, productSlug, selectedAnswers, shuffleMaps]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }, [currentIdx]);

  const percent = Math.round(((selectedAnswers.filter(a => a !== null).length) / questions.length) * 100);

  // Compute missed questions for summary
  const missed = useMemo(() =>
    selectedAnswers
      .map((a, i) => (a !== shuffleMaps[i].indexOf(questions[i].correct) ? i : -1))
      .filter((i) => i >= 0),
    [selectedAnswers, shuffleMaps, questions]
  );

  // Summary screen
  if (showSummary) {
    const scorePercent = Math.round((score / questions.length) * 100);

    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((qq, i) => {
      if (!categoryBreakdown[qq.category]) categoryBreakdown[qq.category] = { correct: 0, total: 0 };
      categoryBreakdown[qq.category].total++;
      if (selectedAnswers[i] === shuffleMaps[i].indexOf(qq.correct)) categoryBreakdown[qq.category].correct++;
    });

    const gradeLabel = scorePercent === 100 ? 'Perfect!' : scorePercent >= 80 ? 'Excellent' : scorePercent >= 60 ? 'Good effort' : scorePercent >= 40 ? 'Keep practising' : 'Review needed';

    const handleRetryMissed = () => {
      // Reset state to only show the missed questions
      const missedQuestions = missed.map(i => questions[i]);
      // We can't change questions prop, so reset to review mode with missed highlighted
      setShowSummary(false);
      setCurrentIdx(missed[0]);
    };

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
              <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
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

          <div className="flex flex-col gap-2 pt-2">
            {/* Retry Missed Only — only show if there are missed questions */}
            {missed.length > 0 && missed.length < questions.length && (
              <Button
                variant="destructive"
                onClick={handleRetryMissed}
                className="w-full gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Retry {missed.length} Missed Question{missed.length !== 1 ? 's' : ''}
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onFinish} className="flex-1">
                <BookOpen className="h-4 w-4 mr-1" />
                New Set
              </Button>
              <Button onClick={() => { setShowSummary(false); setCurrentIdx(0); }} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-1" />
                Review All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine if this question was previously answered (review mode)
  const isReviewMode = showSummary === false && allAnswered;

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Q{currentIdx + 1} of {questions.length}
            {isReviewMode && (
              <Badge variant="outline" className="text-[10px]">Reviewing</Badge>
            )}
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

        {/* Options — rendered in shuffled order */}
        <div className="space-y-2">
          {map.map((originalIdx, displayIdx) => {
            const option = q.options[originalIdx];
            let variant: string = 'border-border bg-background hover:bg-accent/50';
            if (hasAnswered) {
              if (displayIdx === correctDisplay) variant = 'border-green-500 bg-green-50 dark:bg-green-950/30';
              else if (displayIdx === selected) variant = 'border-red-500 bg-red-50 dark:bg-red-950/30';
              else variant = 'border-border bg-background opacity-50';
            }

            return (
              <button
                key={displayIdx}
                onClick={() => handleSelect(displayIdx)}
                disabled={hasAnswered}
                className={cn(
                  'w-full text-left rounded-lg border p-3 text-sm transition-all flex items-start gap-2',
                  variant,
                  !hasAnswered && 'cursor-pointer'
                )}
              >
                {hasAnswered && displayIdx === correctDisplay && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && displayIdx === selected && displayIdx !== correctDisplay && (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                )}
                {(!hasAnswered || (displayIdx !== correctDisplay && displayIdx !== selected)) && (
                  <span className="h-4 w-4 shrink-0 mt-0.5 rounded-full border text-center text-[10px] leading-4 font-medium">
                    {String.fromCharCode(65 + displayIdx)}
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

          {isReviewMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSummary(true)}
            >
              Back to Summary
            </Button>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Export helpers for study pages ───────────────────────────────────────
export { loadWeakQuestions };
