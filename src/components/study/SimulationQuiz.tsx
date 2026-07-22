import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  AlertTriangle,
  BookmarkPlus,
} from 'lucide-react';
import type { QuizQuestion } from '@/types/questionBank';
import { CATEGORY_LABELS } from '@/types/questionBank';
import {
  addAttempt,
  addReviewItems,
  upsertReviewItem,
  getSimSession,
  saveSimSession,
  clearSimSession,
  type BankAttempt,
  type ReviewItem,
} from '@/lib/questionBankStore';

interface SimulationQuizProps {
  questions: QuizQuestion[];
  productSlug: string;
  productTitle: string;
  /** Percent needed to pass. Defaults to 70. */
  passMark?: number;
  /** Seconds allowed. Defaults to ~1 min per question (min 10 min). */
  durationSec?: number;
  onExit: () => void;
  /** Fired once when the exam is scored — used to record the attempt server-side. */
  onComplete?: (result: { score: number; correct: number; total: number; passed: boolean }) => void;
}

function createShuffleMap(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function SimulationQuiz({
  questions,
  productSlug,
  productTitle,
  passMark = 70,
  durationSec,
  onExit,
  onComplete,
}: SimulationQuizProps) {
  const totalSec = durationSec ?? Math.max(600, questions.length * 60);

  // Pins a session to the exact question set it was built against, so a
  // restored session is never graded against a shifted answer key.
  const signature = useMemo(() => questions.map((q) => q.id ?? q.question).join('|'), [questions]);

  // Restore an in-progress paper (refresh / crash / back-gesture) if one exists
  // for this product and still matches the current question set.
  const [restored] = useState(() => {
    const saved = getSimSession(productSlug);
    if (
      saved &&
      saved.signature === signature &&
      Array.isArray(saved.answers) &&
      saved.answers.length === questions.length &&
      Array.isArray(saved.shuffleMaps) &&
      saved.shuffleMaps.length === questions.length
    ) {
      return saved;
    }
    return null;
  });

  // Stable per-session derived state.
  const [shuffleMaps] = useState<number[][]>(
    () => restored?.shuffleMaps ?? questions.map((q) => createShuffleMap(q.options.length)),
  );
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => restored?.answers ?? new Array(questions.length).fill(null),
  );
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set(restored?.flagged ?? []));
  const [currentIdx, setCurrentIdx] = useState(() => restored?.currentIdx ?? 0);
  const startedAt = useRef(restored?.startedAt ?? Date.now());
  // Absolute expiry epoch — the timer survives a reload instead of resetting.
  const endsAt = useRef(restored?.endsAt ?? Date.now() + totalSec * 1000);
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.round((endsAt.current - Date.now()) / 1000)),
  );
  const [phase, setPhase] = useState<'running' | 'results'>('running');

  const finish = useCallback(() => {
    setPhase((p) => (p === 'running' ? 'results' : p));
  }, []);

  // Countdown — recomputed from the absolute expiry each tick so a reload picks
  // up the true remaining time, and expiry auto-submits.
  useEffect(() => {
    if (phase !== 'running') return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setRemainingSec(left);
      if (left <= 0) finish();
    };
    tick(); // handles a session whose timer already expired while away
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [phase, finish]);

  // Persist the live paper on every change so nothing is lost mid-attempt.
  useEffect(() => {
    if (phase !== 'running') return;
    saveSimSession({
      productSlug,
      signature,
      startedAt: startedAt.current,
      endsAt: endsAt.current,
      answers,
      flagged: Array.from(flagged),
      shuffleMaps,
      currentIdx,
    });
  }, [phase, productSlug, signature, answers, flagged, shuffleMaps, currentIdx]);

  // Warn before a hard unload (refresh/close/back) while the paper is live.
  useEffect(() => {
    if (phase !== 'running') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const answeredCount = answers.filter((a) => a !== null).length;

  const select = useCallback(
    (displayIdx: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIdx] = displayIdx;
        return next;
      });
    },
    [currentIdx],
  );

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  }, [currentIdx]);

  // ── Results: compute once when entering results phase ─────────────────────
  const results = useMemo(() => {
    if (phase !== 'results') return null;
    let correct = 0;
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    const wrongItems: ReviewItem[] = [];
    const nowISO = new Date().toISOString();
    questions.forEach((q, i) => {
      const correctDisplay = shuffleMaps[i].indexOf(q.correct);
      const isCorrect = answers[i] === correctDisplay;
      const cat = q.category;
      categoryBreakdown[cat] ??= { correct: 0, total: 0 };
      categoryBreakdown[cat].total++;
      if (isCorrect) {
        correct++;
        categoryBreakdown[cat].correct++;
      } else if (q.id) {
        wrongItems.push({
          questionId: q.id,
          productSlug,
          bankType: 'exam',
          category: q.category,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct,
          explanation: q.explanation,
          status: 'wrong',
          dateISO: nowISO,
        });
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    return {
      correct,
      score,
      passed: score >= passMark,
      categoryBreakdown,
      wrongItems,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    };
  }, [phase, questions, shuffleMaps, answers, passMark, productSlug]);

  // Persist attempt + auto-collect wrong answers when results are computed.
  const persisted = useRef(false);
  useEffect(() => {
    if (!results || persisted.current) return;
    persisted.current = true;
    const attempt: BankAttempt = {
      id: `${productSlug}-simulation-${Date.now()}`,
      productSlug,
      bankType: 'exam',
      mode: 'simulation',
      score: results.score,
      correct: results.correct,
      total: questions.length,
      passed: results.passed,
      passMark,
      dateISO: new Date().toISOString(),
      durationSec: results.durationSec,
      categoryBreakdown: results.categoryBreakdown,
    };
    addAttempt(attempt);
    addReviewItems(results.wrongItems);
    clearSimSession(productSlug); // scored — the live paper is now an attempt
    onComplete?.({
      score: results.score,
      correct: results.correct,
      total: questions.length,
      passed: results.passed,
    });
  }, [results, productSlug, questions.length, passMark, onComplete]);

  // ── RESULTS VIEW ──────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    const weak = Object.entries(results.categoryBreakdown)
      .map(([cat, v]) => ({ cat, pct: Math.round((v.correct / v.total) * 100), ...v }))
      .sort((a, b) => a.pct - b.pct);

    return (
      <div className="space-y-5">
        <Card className={cn('border-2', results.passed ? 'border-green-500/40' : 'border-amber-500/40')}>
          <CardHeader className="text-center pb-2">
            <Trophy className={cn('h-10 w-10 mx-auto mb-2', results.passed ? 'text-green-500' : 'text-amber-500')} />
            <CardTitle className="text-3xl tabular-nums">{results.score}%</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {results.correct} / {questions.length} correct · {fmt(results.durationSec)} taken
            </p>
            <div className="mt-3">
              <Badge
                className={cn(
                  'text-sm px-3 py-1',
                  results.passed
                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                )}
              >
                {results.passed ? 'PASS' : 'Below pass mark'} · target {passMark}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By category</p>
              {weak.map(({ cat, correct, total, pct }) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs w-32 shrink-0 truncate">
                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                  </span>
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="text-xs tabular-nums w-14 text-right">{correct}/{total}</span>
                </div>
              ))}
            </div>
            {weak.length > 0 && weak[0].pct < 100 && (
              <div className="rounded-md border border-amber-200/70 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-100 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Weakest area: <strong>{CATEGORY_LABELS[weak[0].cat as keyof typeof CATEGORY_LABELS] ?? weak[0].cat}</strong>{' '}
                  ({weak[0].pct}%). {results.wrongItems.length} missed question
                  {results.wrongItems.length !== 1 ? 's were' : ' was'} saved to your Review Bank.
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={onExit} variant="default">Back to product</Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Full answer review */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Answer review</h3>
          {questions.map((q, i) => {
            const correctDisplay = shuffleMaps[i].indexOf(q.correct);
            const chosen = answers[i];
            const isCorrect = chosen === correctDisplay;
            return (
              <Card key={q.id ?? i} className={cn('border', isCorrect ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900')}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">
                      <span className="text-muted-foreground mr-1">Q{i + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                  <div className="space-y-1 pl-6">
                    {shuffleMaps[i].map((origIdx, displayIdx) => {
                      const isRight = displayIdx === correctDisplay;
                      const isChosen = displayIdx === chosen;
                      return (
                        <div
                          key={displayIdx}
                          className={cn(
                            'text-xs rounded px-2 py-1 flex items-center gap-1.5',
                            isRight && 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300',
                            isChosen && !isRight && 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
                          )}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + displayIdx)}.</span>
                          <span>{q.options[origIdx]}</span>
                          {isRight && <span className="ml-auto font-medium">correct</span>}
                          {isChosen && !isRight && <span className="ml-auto font-medium">your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground pl-6 leading-relaxed">{q.explanation}</p>
                  {!isCorrect && q.id && (
                    <div className="pl-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          upsertReviewItem({
                            questionId: q.id!,
                            productSlug,
                            bankType: 'exam',
                            category: q.category,
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correct,
                            explanation: q.explanation,
                            status: 'wrong',
                            dateISO: new Date().toISOString(),
                          })
                        }
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" /> Keep in Review Bank
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── RUNNING VIEW ──────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  const map = shuffleMaps[currentIdx];
  const selected = answers[currentIdx];
  const lowTime = remainingSec <= 60;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Simulation</Badge>
          <span className="text-sm text-muted-foreground">{answeredCount}/{questions.length} answered</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums',
            lowTime ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' : 'bg-muted',
          )}
        >
          <Clock className="h-4 w-4" />
          {fmt(remainingSec)}
        </div>
      </div>
      <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              Q{currentIdx + 1} of {questions.length}
              <Badge variant="secondary" className="text-[10px] capitalize">
                {CATEGORY_LABELS[q.category] ?? q.category.replace(/-/g, ' ')}
              </Badge>
            </CardTitle>
            <Button
              size="sm"
              variant={flagged.has(currentIdx) ? 'default' : 'ghost'}
              className="h-7 text-xs gap-1"
              onClick={toggleFlag}
            >
              <Flag className="h-3.5 w-3.5" />
              {flagged.has(currentIdx) ? 'Flagged' : 'Flag'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm sm:text-base font-medium leading-relaxed">{q.question}</p>
          <div className="space-y-2">
            {map.map((origIdx, displayIdx) => (
              <button
                key={displayIdx}
                onClick={() => select(displayIdx)}
                className={cn(
                  'w-full text-left rounded-lg border p-3 text-sm transition-all flex items-start gap-2 cursor-pointer',
                  selected === displayIdx
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-accent/50',
                )}
              >
                <span className="h-5 w-5 shrink-0 rounded-full border text-center text-[11px] leading-5 font-medium">
                  {String.fromCharCode(65 + displayIdx)}
                </span>
                <span>{q.options[origIdx]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {currentIdx === questions.length - 1 ? (
              <Button size="sm" onClick={finish}>Submit exam</Button>
            ) : (
              <Button size="sm" onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question palette */}
      <div className="rounded-lg border bg-card p-3">
        <p className="text-xs text-muted-foreground mb-2">Jump to question</p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                'h-7 w-7 rounded text-[11px] font-medium border transition-colors relative',
                i === currentIdx && 'ring-2 ring-primary',
                answers[i] !== null
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-background border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {i + 1}
              {flagged.has(i) && <Flag className="h-2.5 w-2.5 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={finish} variant="default">
            Submit exam ({answeredCount}/{questions.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
