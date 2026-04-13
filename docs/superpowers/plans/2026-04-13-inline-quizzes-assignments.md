# Inline Quizzes & Assignments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend training courses to support quiz and assignment items interleaved with video lectures, with AI-powered quiz generation for admins.

**Architecture:** Add a `type` discriminator to the existing `training_videos` JSONB array so each item can be `"video"`, `"quiz"`, or `"assignment"`. The same ordered array drives rendering -- VideosByCategory and VideoLearningInterface switch rendering based on type. Quiz questions are stored inline in `quiz_config`. Assignment submissions go to a new Supabase table (Lovable migration). AI quiz generation uses a new edge function calling OpenAI.

**Tech Stack:** React 18, TypeScript, Supabase (JSONB + edge functions), OpenAI API (gpt-4o-mini), existing shadcn/ui components, existing QuizQuestion component pattern.

**Spec:** `docs/superpowers/specs/2026-04-13-inline-quizzes-assignments-design.md`

---

### Task 1: Extend TrainingVideo type with quiz/assignment fields

**Files:**
- Modify: `src/hooks/useProducts.tsx:11-34`

- [ ] **Step 1: Add new interfaces and extend TrainingVideo**

In `src/hooks/useProducts.tsx`, add the new interfaces before the existing `TrainingVideo` interface, then extend it:

```typescript
// Add these BEFORE the TrainingVideo interface (around line 11)

export interface QuizItemQuestion {
  question: string;
  options: string[];       // exactly 4 options
  correct_index: number;   // 0-3
  explanation?: string;
}

export interface QuizConfig {
  questions: QuizItemQuestion[];
  pass_threshold?: number;   // 0-1, e.g. 0.8 = 80%
  source_item_id?: string;   // ID of the video used to generate questions
}

export interface AssignmentConfig {
  submission_type: 'text' | 'file' | 'both';
  prompt: string;
  max_file_size_mb?: number; // default 10
}
```

Then add these fields to the existing `TrainingVideo` interface (after `legacy_fields`):

```typescript
  type?: 'video' | 'quiz' | 'assignment';  // defaults to 'video'
  quiz_config?: QuizConfig;
  assignment_config?: AssignmentConfig;
```

- [ ] **Step 2: Build to verify no type errors**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

Expected: `built in Xs` with no errors. Existing code is unaffected because `type` is optional and defaults to `'video'`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProducts.tsx
git commit -m "feat: extend TrainingVideo type with quiz and assignment fields"
git push origin main
```

---

### Task 2: Render quiz and assignment items in VideosByCategory

**Files:**
- Modify: `src/components/video-editing/VideosByCategory.tsx`

- [ ] **Step 1: Add quiz/assignment icons to imports**

In `src/components/video-editing/VideosByCategory.tsx`, update the lucide import (line 7):

```typescript
import { ChevronDown, ChevronRight, Play, Clock, CheckCircle2, Circle, Brain, ClipboardList } from 'lucide-react';
```

- [ ] **Step 2: Update the video item rendering to handle different types**

Replace the icon/play section inside the video item card. Find the block that renders the play icon (the `{onToggleComplete ? (` block around lines 141-168) -- the section AFTER the completion toggle that shows the video info and play button.

Replace the Play CTA button at the end of each item (around lines 198-205):

```typescript
                      {/* CTA icon */}
                      <button
                        onClick={() => handleVideoClick(video, index)}
                        className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={video.type === 'quiz' ? 'Start quiz' : video.type === 'assignment' ? 'View assignment' : 'Watch video'}
                      >
                        {video.type === 'quiz' ? (
                          <Brain className="h-4 w-4" />
                        ) : video.type === 'assignment' ? (
                          <ClipboardList className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
```

- [ ] **Step 3: Add type badge next to duration**

In the video info section (around lines 184-189), after the duration span, add a type indicator for non-video items:

```typescript
                          {video.type === 'quiz' && video.quiz_config && (
                            <span className="text-xs text-primary flex-shrink-0 flex items-center gap-1 font-medium">
                              <Brain className="h-3 w-3" />
                              {video.quiz_config.questions.length}q
                            </span>
                          )}
                          {video.type === 'assignment' && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 flex-shrink-0 flex items-center gap-1 font-medium">
                              <ClipboardList className="h-3 w-3" />
                              Task
                            </span>
                          )}
```

- [ ] **Step 4: Update the non-toggle icon fallback**

In the else branch of `{onToggleComplete ? (` (around line 164-168), update the icon for non-video items:

```typescript
                      ) : (
                        <div className={`flex-shrink-0 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                           video.type === 'quiz' ? <Brain className="h-5 w-5" /> :
                           video.type === 'assignment' ? <ClipboardList className="h-5 w-5" /> :
                           <Play className="h-5 w-5" />}
                        </div>
                      )}
```

- [ ] **Step 5: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 6: Commit**

```bash
git add src/components/video-editing/VideosByCategory.tsx
git commit -m "feat: render quiz and assignment items with distinct icons in course sidebar"
git push origin main
```

---

### Task 3: Create InlineQuiz component

**Files:**
- Create: `src/components/quiz/InlineQuiz.tsx`

- [ ] **Step 1: Create the InlineQuiz component**

Create `src/components/quiz/InlineQuiz.tsx`:

```typescript
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { Brain, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { QuizConfig } from '@/hooks/useProducts';

interface InlineQuizProps {
  title: string;
  description?: string;
  quizConfig: QuizConfig;
  onComplete: () => void;
}

export function InlineQuiz({ title, description, quizConfig, onComplete }: InlineQuizProps) {
  const { questions, pass_threshold } = quizConfig;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const current = questions[currentIndex];
  const selectedAnswer = selectedAnswers[currentIndex];
  const showResult = answeredQuestions[currentIndex];
  const allAnswered = answeredQuestions.every(Boolean);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (answeredQuestions[currentIndex]) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    const newAnswered = [...answeredQuestions];
    newAnswered[currentIndex] = true;
    setAnsweredQuestions(newAnswered);

    if (answerIndex === current.correct_index) {
      setScore(prev => prev + 1);
    }
  }, [currentIndex, answeredQuestions, selectedAnswers, current]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    onComplete();
  }, [onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setScore(0);
    setSubmitted(false);
  }, [questions.length]);

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pass_threshold ? pct >= pass_threshold * 100 : true;

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quiz Complete</h3>
            <p className="text-2xl font-bold mt-1">{score}/{questions.length} correct ({pct}%)</p>
            {pass_threshold && (
              <Badge variant={passed ? "default" : "secondary"} className="mt-2">
                {passed ? 'Passed' : `Target: ${Math.round(pass_threshold * 100)}%`}
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Brain className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1}/{questions.length}
          </Badge>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        <Progress value={((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100} className="h-1.5 mt-3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <QuizQuestion
          question={{
            question: current.question,
            options: current.options,
            correct: current.correct_index,
            explanation: current.explanation || '',
          }}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onAnswerSelect={handleAnswerSelect}
        />

        {showResult && current.explanation && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <strong>Explanation:</strong> {current.explanation}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={!showResult}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!allAnswered}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/quiz/InlineQuiz.tsx
git commit -m "feat: add InlineQuiz component for course-embedded quizzes"
git push origin main
```

---

### Task 4: Create InlineAssignment component

**Files:**
- Create: `src/components/assignments/InlineAssignment.tsx`

- [ ] **Step 1: Create the InlineAssignment component**

Create `src/components/assignments/InlineAssignment.tsx`:

```typescript
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { AssignmentConfig } from '@/hooks/useProducts';

interface InlineAssignmentProps {
  title: string;
  description?: string;
  assignmentConfig: AssignmentConfig;
  productId: string;
  itemId: string;
  onComplete: () => void;
}

export function InlineAssignment({
  title,
  description,
  assignmentConfig,
  productId,
  itemId,
  onComplete,
}: InlineAssignmentProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { submission_type, prompt, max_file_size_mb = 10 } = assignmentConfig;
  const needsText = submission_type === 'text' || submission_type === 'both';
  const needsFile = submission_type === 'file' || submission_type === 'both';

  const canSubmit =
    !submitting &&
    (needsText ? text.trim().length > 0 : true) &&
    (needsFile && submission_type === 'file' ? file !== null : true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > max_file_size_mb * 1024 * 1024) {
      toast.error(`File must be under ${max_file_size_mb}MB`);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop() || 'bin';
        const path = `${user.id}/${productId}/${itemId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('assignment-files')
          .upload(path, file);
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage
          .from('assignment-files')
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      const { error } = await supabase.from('assignment_submissions' as any).insert({
        user_id: user.id,
        product_id: productId,
        item_id: itemId,
        submission_text: text || null,
        file_url: fileUrl,
        file_name: fileName,
      });

      if (error) throw error;

      setSubmitted(true);
      onComplete();
      toast.success('Assignment submitted');
    } catch (err: any) {
      console.error('Assignment submission failed:', err);
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Assignment Submitted</h3>
            <p className="text-sm text-muted-foreground mt-1">Your response has been recorded.</p>
          </div>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Edit & Resubmit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
          {prompt}
        </div>

        {needsText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Response</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
              rows={6}
              className="resize-y"
            />
          </div>
        )}

        {needsFile && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
            />
            <Button
              variant="outline"
              className="w-full gap-2 h-20 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <>
                  <FileText className="h-5 w-5" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Click to upload (max {max_file_size_mb}MB)
                </>
              )}
            </Button>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Assignment'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/assignments/InlineAssignment.tsx
git commit -m "feat: add InlineAssignment component for course-embedded assignments"
git push origin main
```

---

### Task 5: Render quiz/assignment in VideoLearningInterface

**Files:**
- Modify: `src/components/video-learning/VideoLearningInterface.tsx`

- [ ] **Step 1: Add lazy imports for InlineQuiz and InlineAssignment**

At the top of `VideoLearningInterface.tsx`, add after the existing imports (around line 18):

```typescript
import { lazy, Suspense } from 'react';
const InlineQuiz = lazy(() => import('@/components/quiz/InlineQuiz').then(m => ({ default: m.InlineQuiz })));
const InlineAssignment = lazy(() => import('@/components/assignments/InlineAssignment').then(m => ({ default: m.InlineAssignment })));
```

Also update the existing `import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';` to remove `memo` if adding `lazy`/`Suspense`, or just add them separately. The existing import already has what's needed -- just add lazy and Suspense to it:

```typescript
import { useState, useRef, useEffect, useMemo, useCallback, memo, lazy, Suspense } from 'react';
```

- [ ] **Step 2: Add quiz/assignment completion handler**

Inside the component, after `handleToggleComplete` (around line 82), add:

```typescript
  const handleItemComplete = useCallback(async () => {
    if (currentVideo) {
      await markVideoComplete(currentVideo.id);
    }
  }, [currentVideo, markVideoComplete]);
```

- [ ] **Step 3: Add content switching in the main content area**

Find the section that renders the video player card (around line 335 `{!richContentHasVideo && videoInfo && (`). Before that block, add a check for quiz/assignment types. The logic should be:

Replace the entire video player + rich content section (from `{/* Video player */}` through the `null` closing of the rich content ternary) with a type-aware switch. Find the block starting around line 334 `{!richContentHasVideo && videoInfo && (` and ending around line 497 `) : null}`.

Wrap it in a type check:

```typescript
              {/* Content area — switches based on item type */}
              {currentVideo?.type === 'quiz' && currentVideo.quiz_config ? (
                <Suspense fallback={<Card><CardContent className="p-8 text-center text-muted-foreground">Loading quiz...</CardContent></Card>}>
                  <InlineQuiz
                    title={currentVideo.title}
                    description={currentVideo.description}
                    quizConfig={currentVideo.quiz_config}
                    onComplete={handleItemComplete}
                  />
                </Suspense>
              ) : currentVideo?.type === 'assignment' && currentVideo.assignment_config ? (
                <Suspense fallback={<Card><CardContent className="p-8 text-center text-muted-foreground">Loading assignment...</CardContent></Card>}>
                  <InlineAssignment
                    title={currentVideo.title}
                    description={currentVideo.description}
                    assignmentConfig={currentVideo.assignment_config}
                    productId={productId}
                    itemId={currentVideo.id}
                    onComplete={handleItemComplete}
                  />
                </Suspense>
              ) : (
                <>
                  {/* Existing video player block — keep as-is */}
                  {!richContentHasVideo && videoInfo && (
                    ... existing video player card ...
                  )}

                  {/* Existing rich content block — keep as-is */}
                  {currentVideo?.rich_content?.trim() ? (
                    ... existing rich content card ...
                  ) : !videoInfo ? (
                    ... existing "content coming soon" card ...
                  ) : null}
                </>
              )}
```

- [ ] **Step 4: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 5: Commit**

```bash
git add src/components/video-learning/VideoLearningInterface.tsx
git commit -m "feat: render inline quiz and assignment in video learning interface"
git push origin main
```

---

### Task 6: Admin quiz editor component

**Files:**
- Create: `src/components/video-editing/QuizEditor.tsx`

- [ ] **Step 1: Create the QuizEditor component**

Create `src/components/video-editing/QuizEditor.tsx`:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Trash2, Sparkles, Loader2, GripVertical } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { QuizItemQuestion, QuizConfig } from '@/hooks/useProducts';

interface QuizEditorProps {
  quizConfig: QuizConfig;
  onChange: (config: QuizConfig) => void;
  sourceVideos: Array<{ id: string; title: string; rich_content?: string; transcript?: string }>;
}

function emptyQuestion(): QuizItemQuestion {
  return { question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' };
}

export function QuizEditor({ quizConfig, onChange, sourceVideos }: QuizEditorProps) {
  const [generating, setGenerating] = useState(false);
  const { questions } = quizConfig;

  const updateQuestion = (idx: number, updated: QuizItemQuestion) => {
    const next = [...questions];
    next[idx] = updated;
    onChange({ ...quizConfig, questions: next });
  };

  const addQuestion = () => {
    onChange({ ...quizConfig, questions: [...questions, emptyQuestion()] });
  };

  const removeQuestion = (idx: number) => {
    onChange({ ...quizConfig, questions: questions.filter((_, i) => i !== idx) });
  };

  const handleGenerate = async (sourceId: string) => {
    const source = sourceVideos.find(v => v.id === sourceId);
    if (!source) return;

    const content = [source.rich_content, source.transcript].filter(Boolean).join('\n\n');
    if (!content.trim()) {
      toast.error('Selected video has no content to generate questions from');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-from-content', {
        body: { content, num_questions: 5, product_title: source.title },
      });
      if (error) throw error;
      if (!data?.questions?.length) throw new Error('No questions generated');

      onChange({
        ...quizConfig,
        questions: [...questions, ...data.questions],
        source_item_id: sourceId,
      });
      toast.success(`${data.questions.length} questions generated`);
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      toast.error(err.message || 'Failed to generate quiz questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      {sourceVideos.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Generate questions with AI
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Select a lesson to generate questions from its content</p>
            </div>
            <select
              className="text-sm border rounded-md px-3 py-1.5 bg-background"
              defaultValue=""
              onChange={(e) => e.target.value && handleGenerate(e.target.value)}
              disabled={generating}
            >
              <option value="" disabled>Choose a lesson...</option>
              {sourceVideos.map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            {generating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </CardContent>
        </Card>
      )}

      {/* Questions list */}
      {questions.map((q, idx) => (
        <Card key={idx} className="relative">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">Question {idx + 1}</Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuestion(idx)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>

            <Textarea
              value={q.question}
              onChange={(e) => updateQuestion(idx, { ...q, question: e.target.value })}
              placeholder="Enter question text..."
              rows={2}
              className="text-sm"
            />

            <RadioGroup
              value={String(q.correct_index)}
              onValueChange={(val) => updateQuestion(idx, { ...q, correct_index: parseInt(val) })}
              className="space-y-2"
            >
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <RadioGroupItem value={String(optIdx)} id={`q${idx}-opt${optIdx}`} />
                  <Label htmlFor={`q${idx}-opt${optIdx}`} className="sr-only">Option {optIdx + 1}</Label>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[optIdx] = e.target.value;
                      updateQuestion(idx, { ...q, options: newOpts });
                    }}
                    placeholder={`Option ${optIdx + 1}`}
                    className="text-sm flex-1"
                  />
                </div>
              ))}
            </RadioGroup>

            <Input
              value={q.explanation || ''}
              onChange={(e) => updateQuestion(idx, { ...q, explanation: e.target.value })}
              placeholder="Explanation (shown after answering)"
              className="text-sm text-muted-foreground"
            />
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addQuestion} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/video-editing/QuizEditor.tsx
git commit -m "feat: add QuizEditor component with AI generation for admin"
git push origin main
```

---

### Task 7: Admin assignment editor component

**Files:**
- Create: `src/components/video-editing/AssignmentEditor.tsx`

- [ ] **Step 1: Create the AssignmentEditor component**

Create `src/components/video-editing/AssignmentEditor.tsx`:

```typescript
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AssignmentConfig } from '@/hooks/useProducts';

interface AssignmentEditorProps {
  assignmentConfig: AssignmentConfig;
  onChange: (config: AssignmentConfig) => void;
}

export function AssignmentEditor({ assignmentConfig, onChange }: AssignmentEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Submission Type</Label>
        <RadioGroup
          value={assignmentConfig.submission_type}
          onValueChange={(val: 'text' | 'file' | 'both') =>
            onChange({ ...assignmentConfig, submission_type: val })
          }
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="text" id="sub-text" />
            <Label htmlFor="sub-text" className="text-sm">Text response</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="file" id="sub-file" />
            <Label htmlFor="sub-file" className="text-sm">File upload</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="both" id="sub-both" />
            <Label htmlFor="sub-both" className="text-sm">Both</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Assignment Prompt</Label>
        <Textarea
          value={assignmentConfig.prompt}
          onChange={(e) => onChange({ ...assignmentConfig, prompt: e.target.value })}
          placeholder="Describe what the learner should do..."
          rows={4}
        />
      </div>

      {(assignmentConfig.submission_type === 'file' || assignmentConfig.submission_type === 'both') && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Max File Size (MB)</Label>
          <Input
            type="number"
            value={assignmentConfig.max_file_size_mb || 10}
            onChange={(e) =>
              onChange({ ...assignmentConfig, max_file_size_mb: parseInt(e.target.value) || 10 })
            }
            min={1}
            max={50}
            className="w-32"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/video-editing/AssignmentEditor.tsx
git commit -m "feat: add AssignmentEditor config component for admin"
git push origin main
```

---

### Task 8: Wire admin editors into VideoEditingInterface

**Files:**
- Modify: `src/hooks/useVideoManagement.ts`
- Modify: `src/components/video-editing/VideoEditingInterface.tsx` (and child components as needed)

- [ ] **Step 1: Add addQuiz and addAssignment to useVideoManagement**

In `src/hooks/useVideoManagement.ts`, after the `addVideo` function (around line 147), add:

```typescript
  const addQuiz = (category?: string) => {
    const quizItem: TrainingVideo = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Quiz',
      url: '',
      type: 'quiz',
      order: editVideos.length,
      category: category || '',
      quiz_config: { questions: [], pass_threshold: undefined, source_item_id: undefined },
    };
    setEditVideos([...editVideos, quizItem]);
    toast({ title: "Quiz Added", description: "Configure quiz questions, then save." });
  };

  const addAssignment = (category?: string) => {
    const assignmentItem: TrainingVideo = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Assignment',
      url: '',
      type: 'assignment',
      order: editVideos.length,
      category: category || '',
      assignment_config: { submission_type: 'text', prompt: '' },
    };
    setEditVideos([...editVideos, assignmentItem]);
    toast({ title: "Assignment Added", description: "Configure the assignment, then save." });
  };
```

Add `addQuiz` and `addAssignment` to the return object (around line 236):

```typescript
  return {
    // ... existing returns
    addVideo,
    addQuiz,
    addAssignment,
    updateVideo,
    // ... rest
  };
```

- [ ] **Step 2: Thread addQuiz/addAssignment through VideoEditingInterface props**

This requires updating the prop chain from ProductDetail -> VideoEditingInterface. In `src/pages/ProductDetail.tsx`, the `videoManagement` object already exposes all methods. Update the `VideoEditingInterface` usage to pass the new methods. Since the admin editors (QuizEditor, AssignmentEditor) will be rendered inside the existing video editor panel based on `type`, the key change is that the editor panel needs to detect item type and render the appropriate editor.

This is a wiring task -- the exact props depend on how VideoEditingLayout/VideoEditorPanel work. The simplest approach: in the VideoEditorPanel, check `currentVideo.type` and render QuizEditor or AssignmentEditor instead of the rich content editor when type is `quiz` or `assignment`.

Read `src/components/video-editing/VideoEditorPanel.tsx` to find where the rich content editor is rendered, and add conditional rendering there.

- [ ] **Step 3: Build and verify**

```bash
cd aia-product-compass-hub && npm run build 2>&1 | grep -E "(error|Error|built)" | head -5
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire quiz and assignment creation into admin video management"
git push origin main
```

---

### Task 9: AI quiz generation edge function

**Files:**
- Create: `supabase/functions/generate-quiz-from-content/index.ts`

- [ ] **Step 1: Create the edge function**

Create `supabase/functions/generate-quiz-from-content/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { content, num_questions = 5, product_title = "" } = await req.json();

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Truncate content to avoid token limits (keep first ~8000 chars)
    const truncated = content.slice(0, 8000);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are creating quiz questions for financial advisory trainees studying "${product_title}". Generate exactly ${num_questions} multiple-choice questions that test comprehension of the lesson content. Each question must have exactly 4 options and one correct answer. Include a brief explanation for why the correct answer is right. Return JSON: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "..." }] }`,
          },
          {
            role: "user",
            content: `Lesson content:\n\n${truncated}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const generated = JSON.parse(result.choices[0].message.content);

    return new Response(JSON.stringify(generated), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/generate-quiz-from-content/index.ts
git commit -m "feat: add edge function for AI quiz generation from lesson content"
git push origin main
```

---

### Task 10: Database migration for assignment_submissions (AUTO-DB)

**Files:**
- Document: `SUPABASE.md` (or notify user)

- [ ] **Step 1: Document the needed migration for Lovable**

This task cannot be done in code -- Lovable handles all database migrations. Add the following to `SUPABASE.md` (or create if it doesn't exist) under pending changes:

```markdown
## Pending: assignment_submissions table

Needed for inline assignment feature. Create via Lovable:

- Table: `assignment_submissions`
- Columns:
  - `id` uuid primary key default gen_random_uuid()
  - `user_id` uuid references auth.users(id) not null
  - `product_id` text not null
  - `item_id` text not null
  - `submission_text` text
  - `file_url` text
  - `file_name` text
  - `submitted_at` timestamptz default now()
  - `created_at` timestamptz default now()
- RLS: enable, policy "Users can manage own submissions" for all using (auth.uid() = user_id)

## Pending: assignment-files storage bucket

- Bucket: `assignment-files`
- Public: yes (files accessed via public URL)
- Max file size: 50MB
```

- [ ] **Step 2: Commit**

```bash
git add SUPABASE.md
git commit -m "docs: add pending assignment_submissions migration for Lovable"
git push origin main
```

---

## Task Dependency Order

```
Task 1 (types) ─── must complete first
  ├── Task 2 (sidebar rendering)
  ├── Task 3 (InlineQuiz)
  ├── Task 4 (InlineAssignment)
  ├── Task 6 (QuizEditor)
  ├── Task 7 (AssignmentEditor)
  └── Task 9 (edge function)

Tasks 3+4 ──── must complete before Task 5 (VideoLearningInterface wiring)
Tasks 6+7 ──── must complete before Task 8 (admin wiring)
Task 10 (DB migration) ── independent, can happen anytime
```

Tasks 2, 3, 4, 6, 7, 9 can all run in parallel after Task 1.
