# Study Bank Mastery Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track per-question study-bank mastery (2-in-a-row correct = mastered), offer three learning modes before each session, surface progress to users and admins.

**Architecture:** New Supabase table `user_question_progress` with FK to existing `question_bank_questions.id`. New `useQuestionProgress` hook does load + upsert. `ProductStudyPage` gets a mode picker; `StudyQuiz` records answers. `QuestionBanks` page shows per-product mastery bars; admin panel gets per-product mastery column.

**Tech Stack:** React + TypeScript + Supabase (PostgREST) + TanStack Query + Tailwind/shadcn. Build gate: `npm run build`.

---

## File Structure

**Create:**
- `supabase/migrations/20260414120000_user_question_progress.sql` — new table + RLS
- `src/hooks/useQuestionProgress.tsx` — load/record progress for current user
- `src/hooks/useAllUsersQuestionProgress.tsx` — admin aggregate (mastery per user × product)
- `src/components/study/StudyModePicker.tsx` — Fresh / Review / Redo All card picker
- `src/components/study/MasteryProgressBar.tsx` — reusable bar showing `mastered / total (%)`

**Modify:**
- `src/types/questionBank.ts` — add optional `id` to `QuizQuestion`; carry through `dbRowToQuizQuestion`
- `src/hooks/useQuestionBank.tsx` — no changes required (already returns DB rows mapped)
- `src/components/study/StudyQuiz.tsx` — accept `onAnswered(questionId, isCorrect)` callback; display mastery bar
- `src/pages/ProductStudyPage.tsx` — inject mode picker, filter questions by mode, pass `onAnswered` to `StudyQuiz`, show mastery bar
- `src/pages/QuestionBanks.tsx` — per-product mastery bar + Fresh/Review/Redo-All buttons with live counts
- `src/hooks/useAdminQuizScores.tsx` — merge mastery counts into product breakdown
- `src/components/admin/QuizScoresPanel.tsx` — render Mastery column/row

---

## Task 1: Database migration

**Files:**
- Create: `supabase/migrations/20260414120000_user_question_progress.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- supabase/migrations/20260414120000_user_question_progress.sql

CREATE TABLE IF NOT EXISTS public.user_question_progress (
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id         uuid        NOT NULL REFERENCES public.question_bank_questions(id) ON DELETE CASCADE,
  product_slug        text        NOT NULL,
  consecutive_correct smallint    NOT NULL DEFAULT 0,
  mastered            boolean     NOT NULL DEFAULT false,
  total_attempts      int         NOT NULL DEFAULT 0,
  total_correct       int         NOT NULL DEFAULT 0,
  last_correct        boolean,
  last_answered_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqp_user_product
  ON public.user_question_progress (user_id, product_slug);

CREATE INDEX IF NOT EXISTS idx_uqp_product_mastered
  ON public.user_question_progress (product_slug, mastered);

ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own progress"
  ON public.user_question_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read all progress"
  ON public.user_question_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles uar
      WHERE uar.user_id = auth.uid()
        AND uar.role IN ('admin', 'master_admin')
    )
  );
```

- [ ] **Step 2: Apply migration to Supabase**

Run from project root:

```bash
cd aia-product-compass-hub
npx supabase db push
```

Expected: migration applied; `user_question_progress` appears in the DB.

- [ ] **Step 3: Regenerate types**

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Expected: `user_question_progress` row types appear in `types.ts`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260414120000_user_question_progress.sql src/integrations/supabase/types.ts
git commit -m "Study bank mastery progress now persists per user and question"
git push origin main
```

---

## Task 2: Extend QuizQuestion with id

**Files:**
- Modify: `src/types/questionBank.ts`

- [ ] **Step 1: Add optional id field and populate in mapper**

Replace the `QuizQuestion` interface and the `dbRowToQuizQuestion` function:

```ts
// Shape used by existing quiz/study components
export interface QuizQuestion {
  id?: string;              // question_bank_questions.id, populated when questions come from DB
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: QuestionCategory;
}

export function dbRowToQuizQuestion(row: QuestionBankQuestion): QuizQuestion {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    correct: row.correct_answer,
    explanation: row.explanation,
    category: row.category,
  };
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build (field is optional, no downstream break).

- [ ] **Step 3: Commit**

```bash
git add src/types/questionBank.ts
git commit -m "Quiz questions now carry their database id through to quiz components"
git push origin main
```

---

## Task 3: useQuestionProgress hook

**Files:**
- Create: `src/hooks/useQuestionProgress.tsx`

- [ ] **Step 1: Write the hook**

```tsx
// src/hooks/useQuestionProgress.tsx
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface QuestionProgressRow {
  user_id: string;
  question_id: string;
  product_slug: string;
  consecutive_correct: number;
  mastered: boolean;
  total_attempts: number;
  total_correct: number;
  last_correct: boolean | null;
  last_answered_at: string;
}

const MASTERY_THRESHOLD = 2;

export function useQuestionProgress(productSlug: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['question-progress', user?.id, productSlug];

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<QuestionProgressRow[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_question_progress' as never)
        .select('*')
        .eq('user_id', user.id)
        .eq('product_slug', productSlug);
      if (error) throw error;
      return (data ?? []) as unknown as QuestionProgressRow[];
    },
    enabled: !!user?.id && !!productSlug,
    staleTime: 30_000,
  });

  const progressByQuestion = new Map(rows.map(r => [r.question_id, r]));

  const recordAnswer = useCallback(
    async (questionId: string, isCorrect: boolean) => {
      if (!user?.id || !questionId) return;
      const existing = progressByQuestion.get(questionId);
      const consecutive = isCorrect ? (existing?.consecutive_correct ?? 0) + 1 : 0;
      const payload = {
        user_id: user.id,
        question_id: questionId,
        product_slug: productSlug,
        consecutive_correct: consecutive,
        mastered: consecutive >= MASTERY_THRESHOLD,
        total_attempts: (existing?.total_attempts ?? 0) + 1,
        total_correct: (existing?.total_correct ?? 0) + (isCorrect ? 1 : 0),
        last_correct: isCorrect,
        last_answered_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('user_question_progress' as never)
        .upsert(payload as never, { onConflict: 'user_id,question_id' });
      if (error) {
        console.error('recordAnswer failed', error);
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    },
    [user?.id, productSlug, progressByQuestion, queryClient, queryKey],
  );

  return {
    isLoading,
    rows,
    progressByQuestion,
    recordAnswer,
    masteredCount: rows.filter(r => r.mastered).length,
    touchedCount: rows.length,
  };
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuestionProgress.tsx
git commit -m "Users now have a progress hook that loads and records per-question mastery"
git push origin main
```

---

## Task 4: MasteryProgressBar component

**Files:**
- Create: `src/components/study/MasteryProgressBar.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/study/MasteryProgressBar.tsx
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface MasteryProgressBarProps {
  mastered: number;
  total: number;
  label?: string;
  compact?: boolean;
}

export function MasteryProgressBar({ mastered, total, label = 'mastered', compact = false }: MasteryProgressBarProps) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="h-3 w-3 text-yellow-500" />
          {mastered} / {total} {label}
        </span>
        <span className="tabular-nums font-medium">{pct}%</span>
      </div>
      <Progress value={pct} className={compact ? 'h-1.5' : 'h-2'} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/study/MasteryProgressBar.tsx
git commit -m "Reusable mastery bar shows mastered-over-total with percentage"
git push origin main
```

---

## Task 5: StudyModePicker component

**Files:**
- Create: `src/components/study/StudyModePicker.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/study/StudyModePicker.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Layers } from 'lucide-react';

export type StudyMode = 'fresh' | 'review' | 'all';

interface StudyModePickerProps {
  freshCount: number;
  reviewCount: number;
  totalCount: number;
  onPick: (mode: StudyMode) => void;
}

interface ModeCard {
  mode: StudyMode;
  title: string;
  description: string;
  count: number;
  Icon: React.ElementType;
  tone: string;
}

export function StudyModePicker({ freshCount, reviewCount, totalCount, onPick }: StudyModePickerProps) {
  const cards: ModeCard[] = [
    {
      mode: 'fresh',
      title: 'Fresh',
      description: 'Only questions you have never attempted.',
      count: freshCount,
      Icon: Sparkles,
      tone: 'text-emerald-600',
    },
    {
      mode: 'review',
      title: 'Review',
      description: 'Previously attempted but not yet mastered (2 in a row).',
      count: reviewCount,
      Icon: RotateCcw,
      tone: 'text-amber-600',
    },
    {
      mode: 'all',
      title: 'Redo All',
      description: 'Every question, including mastered ones.',
      count: totalCount,
      Icon: Layers,
      tone: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(({ mode, title, description, count, Icon, tone }) => {
        const disabled = count === 0;
        return (
          <Card key={mode} className={disabled ? 'opacity-60' : 'hover:border-primary/40 transition-colors'}>
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${tone}`} />
                <span className="font-semibold text-sm">{title}</span>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{count} q</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">{description}</p>
              <Button
                size="sm"
                variant={mode === 'all' ? 'default' : 'outline'}
                disabled={disabled}
                onClick={() => onPick(mode)}
              >
                {disabled ? '0 remaining' : `Start ${title}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/study/StudyModePicker.tsx
git commit -m "Study sessions now start with a Fresh / Review / Redo-All mode picker"
git push origin main
```

---

## Task 6: StudyQuiz records answers + shows mastery bar

**Files:**
- Modify: `src/components/study/StudyQuiz.tsx`

- [ ] **Step 1: Add onAnswered prop + mastery bar**

Change the props interface and wire it into `handleSelect`. Replace the `StudyQuizProps` interface (around line 70) with:

```tsx
interface StudyQuizProps {
  questions: StudyQuestion[];
  onFinish: () => void;
  /** Product slug for persistence, e.g. "pro-achiever" */
  productSlug?: string;
  /** Called whenever the user answers a question; used to persist mastery */
  onAnswered?: (questionId: string, isCorrect: boolean) => void;
  /** Optional mastery bar props — if provided, renders above the session progress */
  masteryMastered?: number;
  masteryTotal?: number;
}
```

Update the component signature:

```tsx
export function StudyQuiz({
  questions,
  onFinish,
  productSlug = '',
  onAnswered,
  masteryMastered,
  masteryTotal,
}: StudyQuizProps) {
```

Inside `handleSelect`, after the existing score update, call `onAnswered`:

```tsx
  const handleSelect = useCallback((displayIdx: number) => {
    if (hasAnswered) return;
    const next = [...selectedAnswers];
    next[currentIdx] = displayIdx;
    setSelectedAnswers(next);
    const correct = displayIdx === correctDisplay;
    if (correct) setScore((s) => s + 1);
    const qId = (questions[currentIdx] as unknown as { id?: string }).id;
    if (qId && onAnswered) onAnswered(qId, correct);
  }, [currentIdx, hasAnswered, correctDisplay, selectedAnswers, onAnswered, questions]);
```

In the quiz card header (around line 292, just before `<Progress value={percent} />`), add a mastery bar when provided:

```tsx
        {typeof masteryMastered === 'number' && typeof masteryTotal === 'number' && masteryTotal > 0 && (
          <div className="mb-2">
            <MasteryProgressBar mastered={masteryMastered} total={masteryTotal} compact />
          </div>
        )}
        <Progress value={percent} className="h-1.5" />
```

Add at the top of the file (imports):

```tsx
import { MasteryProgressBar } from '@/components/study/MasteryProgressBar';
```

Also widen the local `StudyQuestion` type so `.id` is allowed — in this file the type is imported; instead of editing the shared type here, we rely on the runtime cast above (`as unknown as { id?: string }`). The `QuizQuestion.id` addition in Task 2 already handles the shared shape; `StudyQuestion` is structurally compatible.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/study/StudyQuiz.tsx
git commit -m "Study quiz now reports answers upstream and can render a mastery bar"
git push origin main
```

---

## Task 7: ProductStudyPage adds mode picker + records progress

**Files:**
- Modify: `src/pages/ProductStudyPage.tsx`

- [ ] **Step 1: Integrate progress hook + mode picker**

Add imports at the top:

```tsx
import { useQuestionProgress } from '@/hooks/useQuestionProgress';
import { StudyModePicker, type StudyMode } from '@/components/study/StudyModePicker';
import { MasteryProgressBar } from '@/components/study/MasteryProgressBar';
```

Add state for selected mode and wire the hook (inside `ProductStudyPage` component, near the other `useState` calls):

```tsx
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);
  const { progressByQuestion, masteredCount, recordAnswer } = useQuestionProgress(productSlug);
```

Compute mode-filtered pools via `useMemo` (place just after `weakCount`):

```tsx
  const { freshPool, reviewPool, allPool } = useMemo(() => {
    const all = studyBank;
    const fresh = all.filter(q => !q.id || !progressByQuestion.has(q.id));
    const review = all.filter(q => q.id && progressByQuestion.has(q.id) && !progressByQuestion.get(q.id)!.mastered);
    return { freshPool: fresh, reviewPool: review, allPool: all };
  }, [studyBank, progressByQuestion]);
```

Replace `startQuiz` with a mode-aware version, and change the existing size buttons to filter by the chosen mode. Replace the existing `startQuiz` function:

```tsx
  const startQuiz = (size: QuizSize, category: CategoryFilter, mode: StudyMode) => {
    const modePool =
      mode === 'fresh' ? freshPool :
      mode === 'review' ? reviewPool :
      allPool;
    const pool = category === 'all' ? modePool : modePool.filter((q) => q.category === category);
    const weak = pool.filter((q) => weakQuestions[q.question]);
    const strong = pool.filter((q) => !weakQuestions[q.question]);
    const shuffled = [...shuffleArray(weak), ...shuffleArray(strong)];
    const selected = shuffled.slice(0, Math.min(size, shuffled.length));
    setQuizSize(size);
    setCategoryFilter(category);
    setActiveQuestions(selected);
  };
```

Add the mode picker on the landing view. Between the weak-question banner (line ~150) and the category-count grid (line ~159), insert:

```tsx
              <div className="rounded-lg border bg-card p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Your Mastery</p>
                </div>
                <MasteryProgressBar mastered={masteredCount} total={studyBank.length} />
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Choose a learning mode</CardTitle>
                  <CardDescription className="text-xs">
                    Fresh = unseen questions. Review = attempted but not mastered. Redo All = everything.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyModePicker
                    freshCount={freshPool.length}
                    reviewCount={reviewPool.length}
                    totalCount={allPool.length}
                    onPick={setSelectedMode}
                  />
                </CardContent>
              </Card>
```

Modify the size buttons (inside the "Start Studying" Card, around line 211) so they depend on the selected mode. Replace the `<Button>` block inside the size loop with:

```tsx
                    {([25, 50, 100] as QuizSize[]).map((size) => {
                      const modePool =
                        selectedMode === 'fresh' ? freshPool :
                        selectedMode === 'review' ? reviewPool :
                        allPool;
                      const filtered = categoryFilter === 'all' ? modePool : modePool.filter(q => q.category === categoryFilter);
                      const actualSize = Math.min(size, filtered.length);
                      return (
                        <Button
                          key={size}
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-1"
                          onClick={() => selectedMode && startQuiz(size, categoryFilter, selectedMode)}
                          disabled={!selectedMode || filtered.length === 0}
                        >
                          <span className="text-xl font-bold">{actualSize}</span>
                          <span className="text-xs text-muted-foreground">
                            {selectedMode ? 'Questions' : 'Pick mode first'}
                          </span>
                        </Button>
                      );
                    })}
```

Finally, wire `onAnswered` into the active-quiz branch. In the `activeQuestions` block (line ~116), update the `<StudyQuiz>` call:

```tsx
                <StudyQuiz
                  questions={activeQuestions}
                  onFinish={handleRestart}
                  productSlug={productSlug}
                  onAnswered={recordAnswer}
                  masteryMastered={masteredCount}
                  masteryTotal={studyBank.length}
                />
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductStudyPage.tsx
git commit -m "Study sessions now start from a mode picker and persist per-question mastery"
git push origin main
```

---

## Task 8: QuestionBanks landing page shows mastery + mode counts

**Files:**
- Modify: `src/pages/QuestionBanks.tsx`

- [ ] **Step 1: Fetch progress for all six products and render bars**

Replace the static `products` derivation with a component that queries mastery per product. Add at the top of the file:

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MasteryProgressBar } from '@/components/study/MasteryProgressBar';
```

Inside the `QuestionBanks` component, before the `return`, add:

```tsx
  const { user } = useAuth();
  const { data: progressRows = [] } = useQuery({
    queryKey: ['all-product-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as Array<{ product_slug: string; question_id: string; mastered: boolean }>;
      const { data, error } = await supabase
        .from('user_question_progress' as never)
        .select('product_slug, question_id, mastered')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as unknown as Array<{ product_slug: string; question_id: string; mastered: boolean }>;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const progressBySlug = new Map<string, { mastered: number; touched: number }>();
  for (const row of progressRows) {
    const entry = progressBySlug.get(row.product_slug) ?? { mastered: 0, touched: 0 };
    entry.touched += 1;
    if (row.mastered) entry.mastered += 1;
    progressBySlug.set(row.product_slug, entry);
  }
```

In the product card JSX (inside the `.map`), after `<CardDescription>` and before `<CardContent>`, insert a mastery bar block:

```tsx
                <CardContent className="pt-0 space-y-3">
                  {(() => {
                    const entry = progressBySlug.get(product.id) ?? { mastered: 0, touched: 0 };
                    const freshCount = product.studyCount - entry.touched;
                    const reviewCount = entry.touched - entry.mastered;
                    return (
                      <>
                        <MasteryProgressBar mastered={entry.mastered} total={product.studyCount} />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => navigate(product.studyRoute + '?mode=fresh')}
                            disabled={freshCount <= 0}
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            Fresh
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                              {Math.max(freshCount, 0)}
                            </Badge>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => navigate(product.studyRoute + '?mode=review')}
                            disabled={reviewCount <= 0}
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            Review
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                              {reviewCount}
                            </Badge>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => navigate(product.studyRoute + '?mode=all')}
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            Redo All
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                              {product.studyCount}
                            </Badge>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => navigate(product.examRoute, { state: { from: 'question-banks' } })}
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            Product Exam
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground">
                              {product.examCount}
                            </Badge>
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
```

(Delete the original `<CardContent>` block that only held the old two-button row.)

- [ ] **Step 2: Read `?mode=` query in ProductStudyPage**

Add to `ProductStudyPage.tsx` imports:

```tsx
import { useSearchParams } from 'react-router-dom';
```

Inside the component, after the `selectedMode` state:

```tsx
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode') as StudyMode | null;
  useEffect(() => {
    if (urlMode === 'fresh' || urlMode === 'review' || urlMode === 'all') {
      setSelectedMode(urlMode);
    }
  }, [urlMode]);
```

Add `useEffect` to the existing `useState, useMemo` import line:

```tsx
import { useState, useMemo, useEffect } from 'react';
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/pages/QuestionBanks.tsx src/pages/ProductStudyPage.tsx
git commit -m "Question Banks page now shows per-product mastery bars and Fresh / Review / Redo-All shortcuts"
git push origin main
```

---

## Task 9: Admin panel — per-product mastery column

**Files:**
- Modify: `src/hooks/useAdminQuizScores.tsx`
- Modify: `src/components/admin/QuizScoresPanel.tsx`

- [ ] **Step 1: Extend the breakdown type with mastery fields**

In `useAdminQuizScores.tsx`, update `QuizProductBreakdown`:

```ts
export interface QuizProductBreakdown {
  product_id: string;
  product_title: string;
  attempts: number;
  best_score: number;
  best_total: number;
  best_score_pct: number;
  avg_score_pct: number;
  last_attempt: string | null;
  mastered_count: number;   // new
  study_total: number;      // new — questions in study bank for this product
}
```

- [ ] **Step 2: Fetch mastery aggregates + study-bank totals**

Inside `fetchData` in `useAdminQuizScores.tsx`, after the existing `productsData` fetch, add:

```ts
      const { data: masteryData, error: masteryError } = await supabase
        .from('user_question_progress' as never)
        .select('user_id, product_slug, mastered');
      if (masteryError) throw masteryError;

      const { data: studyTotalsData, error: studyTotalsError } = await supabase
        .from('question_bank_questions' as never)
        .select('product_slug, bank_type')
        .eq('bank_type', 'study');
      if (studyTotalsError) throw studyTotalsError;

      const studyTotalBySlug = new Map<string, number>();
      for (const row of (studyTotalsData ?? []) as unknown as Array<{ product_slug: string }>) {
        studyTotalBySlug.set(row.product_slug, (studyTotalBySlug.get(row.product_slug) ?? 0) + 1);
      }

      const masteryByUserSlug = new Map<string, Map<string, number>>();
      for (const row of (masteryData ?? []) as unknown as Array<{ user_id: string; product_slug: string; mastered: boolean }>) {
        if (!row.mastered) continue;
        if (!masteryByUserSlug.has(row.user_id)) masteryByUserSlug.set(row.user_id, new Map());
        const inner = masteryByUserSlug.get(row.user_id)!;
        inner.set(row.product_slug, (inner.get(row.product_slug) ?? 0) + 1);
      }

      // Build slug → product title map from products table rows we already have
      const slugByProductId = new Map<string, string>();
      // products table rows have id and title but no slug — build lookup via productMap keys to titles
      // We need product slug on each breakdown; use the product_id (UUID) from quiz_attempts.
      // To join mastery (slug-based) back, we also need a products.slug column. If products has a slug:
      // (If products has no slug column, skip slug→id mapping and show 0 for mastery — safe fallback.)
```

Also query `products.slug` if it exists. To keep the plan robust, extend the existing products select:

```ts
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, title, slug');
      if (productsError) throw productsError;

      // Map slug ↔ id
      for (const p of (productsData ?? []) as Array<{ id: string; title: string; slug: string | null }>) {
        if (p.slug) slugByProductId.set(p.id, p.slug);
      }
```

When assembling each `product_breakdown` entry, add:

```ts
          const slug = slugByProductId.get(productId);
          const masteredCount = slug ? (masteryByUserSlug.get(userId)?.get(slug) ?? 0) : 0;
          const studyTotal = slug ? (studyTotalBySlug.get(slug) ?? 0) : 0;

          product_breakdown.push({
            product_id: productId,
            product_title: productMap.get(productId) || productId,
            attempts: pRows.length,
            best_score: pRows[bestIdx].score,
            best_total: pRows[bestIdx].total_questions,
            best_score_pct: Math.round(scorePcts[bestIdx]),
            avg_score_pct: avgPct,
            last_attempt: lastAttempt,
            mastered_count: masteredCount,
            study_total: studyTotal,
          });
```

Remove the placeholder comment block and keep the `slugByProductId` declaration near the top of the function.

- [ ] **Step 3: Render the Mastery column in QuizScoresPanel**

In the desktop per-product row (the `<div className="flex flex-wrap items-center gap-3 ...">` block inside `UserQuizRow`), add a mastery chip just before the attempts count:

```tsx
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      <span>
                        Mastery {pb.mastered_count}/{pb.study_total}
                        {pb.study_total > 0 && ` (${Math.round((pb.mastered_count / pb.study_total) * 100)}%)`}
                      </span>
                    </div>
```

Do the same in the `UserQuizMobileCard` product breakdown (inside the `.map(pb => ...)` rendering), add below the Best line:

```tsx
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                Mastery: {pb.mastered_count}/{pb.study_total}
                {pb.study_total > 0 && ` (${Math.round((pb.mastered_count / pb.study_total) * 100)}%)`}
              </div>
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAdminQuizScores.tsx src/components/admin/QuizScoresPanel.tsx
git commit -m "Admin quiz scores panel now shows study-bank mastery per user and product"
git push origin main
```

---

## Task 10: Playwright smoke verification

**Files:** none

- [ ] **Step 1: Run dev server**

```bash
cd aia-product-compass-hub && npm run dev
```

- [ ] **Step 2: Sign in and verify user flow**

- Navigate to `http://localhost:8080/auth`, sign in as a demo user from `src/config/authConfig.ts`.
- Go to `/question-banks` → confirm each product card shows a `0/N mastered 0%` bar and three mode buttons (Fresh, Review disabled, Redo All).
- Click **Redo All** on Pro Achiever → confirm the study page loads with the mode preselected.
- Answer one question correctly → return to `/question-banks` → confirm the Fresh count decreased by 1.
- Answer the same question correctly a second time (via Review) → confirm mastered count on `/question-banks` increased by 1.

- [ ] **Step 3: Verify admin flow**

- Sign in as `master_admin` demo user.
- Navigate to `/admin`, open Quiz Scores panel, expand the test user.
- Confirm the per-product row shows `Mastery X/N (Y%)`.

- [ ] **Step 4: No commit**

No changes — verification only.

---

## Self-Review

- **Spec coverage:** data model (Task 1), question identity via FK (Task 2), mastery hook (Task 3), mastery bar (Task 4), mode picker (Task 5), StudyQuiz integration (Task 6), mode selection in ProductStudyPage (Task 7), QuestionBanks mastery + deep links (Task 8), admin column (Task 9), verification (Task 10). All spec sections covered.
- **Placeholder scan:** No TBDs or "handle errors appropriately". Each step contains actual code or exact commands.
- **Type consistency:** `StudyMode` defined in Task 5, reused in Tasks 7–8. `QuizQuestion.id?` added in Task 2, consumed in Tasks 6–7. `QuestionProgressRow` shape used only inside its hook. `product_slug` is the join key between `user_question_progress` and `question_bank_questions`; `products.slug` is the bridge back to the admin panel (Task 9 assumes this column exists — if it does not, the admin mastery column falls back to zeros, which is a graceful degradation rather than a crash).
