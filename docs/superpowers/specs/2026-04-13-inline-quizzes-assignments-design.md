# Inline Quizzes & Assignments in Training Courses

**Date:** 2026-04-13
**Status:** Approved
**Scope:** Extend the training course system to support quiz and assignment items interleaved with video lectures.

---

## Problem

Training courses currently only support video lectures. Admins want to insert quizzes (AI-generated from lesson content) and assignments (text or file submissions) between videos to reinforce learning. Learners should see these as regular course items they complete alongside videos.

## Key Decisions

- **No hard gates.** Quizzes and assignments appear in the course list as items the learner is expected to complete, but they can skip ahead (soft nudge, not a blocker).
- **Unified progress.** All item types (video, quiz, assignment) count equally toward the course progress bar. A course with 5 videos + 2 quizzes + 1 assignment = 8 items total.
- **Same JSONB array.** Quizzes and assignments live in the existing `products.training_videos` JSONB column alongside videos, distinguished by a `type` field. No new Supabase tables for quiz definitions.
- **AI quiz generation.** Admins can auto-generate quiz questions from a preceding video's transcript/rich_content via OpenAI, then review and edit before saving.
- **Assignment submissions need a DB table.** A new `assignment_submissions` table stores learner text/file submissions. This requires a Lovable migration (`[AUTO-DB]`).

---

## Data Model

### Extended `TrainingVideo` type

```typescript
// Add to existing TrainingVideo interface in src/hooks/useProducts.tsx
export interface TrainingVideo {
  // Existing fields (unchanged)
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  transcript?: string;
  duration?: number;
  order: number;
  published?: boolean;
  category?: string;
  useful_links?: UsefulLink[];
  attachments?: VideoAttachment[];
  rich_content?: string;
  legacy_fields?: { ... };

  // New fields
  type?: 'video' | 'quiz' | 'assignment';  // defaults to 'video' for backward compat
  quiz_config?: QuizConfig;
  assignment_config?: AssignmentConfig;
}

export interface QuizConfig {
  questions: QuizItem[];
  pass_threshold?: number;    // 0-1, e.g. 0.8 = 80%. Optional, informational only.
  source_item_id?: string;    // ID of the video whose content generated these questions
}

export interface QuizItem {
  question: string;
  options: string[];           // 4 options
  correct_index: number;       // 0-3
  explanation?: string;        // shown after answering
}

export interface AssignmentConfig {
  submission_type: 'text' | 'file' | 'both';
  prompt: string;              // instructions for the learner
  max_file_size_mb?: number;   // default 10
}
```

### Completion tracking

All item types use the existing `video_progress` table. The `video_id` field stores the item's `id` regardless of whether it's a video, quiz, or assignment. A quiz is marked `completed: true` when the learner submits answers. An assignment is marked `completed: true` when the learner submits their response.

### Quiz attempt data

Stored in localStorage via the existing `useQuizState` pattern. Key format: `quiz_state_{productId}_{itemId}`. Stores selected answers and score. No new DB table needed for quiz attempts at this stage.

### Assignment submissions (new table -- `[AUTO-DB]`)

```sql
create table assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  product_id text not null,
  item_id text not null,
  submission_text text,
  file_url text,
  file_name text,
  submitted_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS: owner-only read/write
alter table assignment_submissions enable row level security;
create policy "Users can manage own submissions"
  on assignment_submissions for all
  using (auth.uid() = user_id);
```

Files uploaded to Supabase Storage bucket `assignment-files` (path: `{user_id}/{product_id}/{item_id}/{filename}`).

---

## Admin Experience

### Adding items

In `VideoEditingInterface`, the existing "Add Video" button becomes a dropdown with three options:
- **Add Video** -- existing flow, unchanged
- **Add Quiz** -- inserts a quiz item at the current position
- **Add Assignment** -- inserts an assignment item at the current position

### Quiz editor

When a quiz item is selected in the editor:
1. Shows a quiz editor card (not the video rich_content editor)
2. Title field (editable, defaults to "Quiz: {preceding video title}")
3. Category field (inherits from preceding video)
4. **"Generate with AI" button** -- dropdown to select which video's content to use as source
   - Calls `generate-quiz-from-content` edge function
   - Shows loading state while generating
   - Questions appear in editable form
5. **Manual question editor** -- admin can add/edit/remove/reorder questions
   - Each question: text input, 4 option inputs, radio for correct answer, optional explanation
6. Optional: pass threshold slider (informational, shown to learner as "target score")
7. Saved as part of the normal `training_videos` JSON save flow (existing save button)

### Assignment editor

When an assignment item is selected:
1. Title field
2. Category field
3. Submission type: radio group (Text / File upload / Both)
4. Prompt: rich text area describing what the learner should do
5. Max file size (if file type, default 10MB)

### Ordering

Quiz and assignment items are draggable in the same list as videos using existing DnD Kit integration. Admin controls exact position in the course sequence.

---

## Learner Experience

### Course sidebar (VideosByCategory)

Each item type renders with distinct visual treatment:

| Type | Icon | Badge | Complete button |
|------|------|-------|-----------------|
| Video | Play | duration | "Mark complete" (manual toggle) |
| Quiz | Brain | "{n} questions" | Auto-completes on submit, can undo |
| Assignment | ClipboardList | submission type | Auto-completes on submit, can undo |

All three types use the same card layout (left accent strip, title, description, completion toggle). The existing `onToggleComplete` handler works for all types.

### Main content area (VideoLearningInterface)

When the current item is a **video**: unchanged behavior (video player + rich content).

When the current item is a **quiz**:
1. Card renders with quiz title and description
2. Questions shown one at a time (reuses existing `QuizQuestion` component pattern)
3. Answer selection stored in state
4. After all questions answered, "Submit Quiz" button
5. Score summary shown: "4/5 correct (80%)" with pass threshold indicator if set
6. Each question shows correct/incorrect with explanation
7. Auto-marks item as complete via `markVideoComplete(itemId)`
8. "Next" button advances to next course item

When the current item is an **assignment**:
1. Card renders with assignment prompt (markdown-rendered description)
2. Based on `submission_type`:
   - `text`: textarea with submit button
   - `file`: file upload dropzone (accepts common types: PDF, images, video, docs)
   - `both`: textarea + file upload
3. Submit button:
   - Uploads file to Supabase Storage (if applicable)
   - Inserts row into `assignment_submissions` table
   - Auto-marks item as complete
4. If already submitted, shows "Submitted" state with timestamp and option to resubmit

### Progress bar

Counts all items equally. Example: 5 videos + 2 quizzes + 1 assignment = 8 total items. Progress = completed items / total items * 100.

### Bottom sticky bar

Same as video items: [Prev] [Mark Complete / Completed] [Next]. For quizzes, the center button changes to "Submit Quiz" while unanswered, then "Completed" after submission.

---

## AI Quiz Generation

### Edge function: `generate-quiz-from-content`

**Input:**
```json
{
  "content": "string (transcript + rich_content combined)",
  "num_questions": 5,
  "product_title": "string (for context)"
}
```

**Implementation:**
- New Supabase edge function
- Calls OpenAI API (uses existing `OPENAI_API_KEY` env var)
- Model: `gpt-4o-mini` (fast, cheap, good for structured output)
- Uses JSON mode for reliable structured output
- System prompt: "You are creating quiz questions for financial advisory trainees. Based on the following lesson content, generate {n} multiple-choice questions that test comprehension of key concepts. Each question must have exactly 4 options labeled A-D, one correct answer, and a brief explanation. Return as JSON array."

**Output:**
```json
{
  "questions": [
    {
      "question": "What is the key benefit of...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 2,
      "explanation": "Option C is correct because..."
    }
  ]
}
```

**Fallback:** If the source video has no transcript and no rich_content, the "Generate with AI" button is disabled with tooltip: "Add content to this lesson first to enable AI quiz generation." Admin can still create questions manually.

**Cost:** OpenAI API call (~$0.001 per quiz generation with gpt-4o-mini). Minimal cost.

---

## Components to Create / Modify

### New components:
- `src/components/quiz/InlineQuiz.tsx` -- renders quiz questions inline in VideoLearningInterface (reuses QuizQuestion component for individual questions, adds navigation/scoring/submit)
- `src/components/assignments/InlineAssignment.tsx` -- renders assignment prompt + submission form
- `src/components/video-editing/QuizEditor.tsx` -- admin quiz question editor with AI generation
- `src/components/video-editing/AssignmentEditor.tsx` -- admin assignment config editor
- `supabase/functions/generate-quiz-from-content/index.ts` -- OpenAI quiz generation

### Modified components:
- `src/hooks/useProducts.tsx` -- extend TrainingVideo interface with type, quiz_config, assignment_config
- `src/components/video-editing/VideosByCategory.tsx` -- render quiz/assignment items with appropriate icons and badges
- `src/components/video-learning/VideoLearningInterface.tsx` -- switch content area based on item type (video/quiz/assignment)
- `src/components/video-editing/VideoEditingInterface.tsx` -- add "Add Quiz"/"Add Assignment" options, render appropriate editor per type
- `src/components/product-detail/ProductTrainingVideos.tsx` -- no changes needed (already delegates to VideosByCategory)
- `src/hooks/useVideoProgress.tsx` -- no changes needed (already generic enough for any item ID)

---

## Out of Scope

- Hard-gating (blocking learner from proceeding without completing quiz)
- Quiz attempt history in DB (localStorage only for now)
- Grading/scoring dashboard for admins
- Quiz time limits
- Randomized question order
- Multiple quiz attempts tracking
- Admin review workflow for assignment submissions (submissions are stored but no admin review UI in this iteration)
