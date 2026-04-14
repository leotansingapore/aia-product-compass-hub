# Study Bank Mastery Progress — Design

**Date:** 2026-04-14
**Scope:** Per-question mastery tracking for study banks across all six products, with learning-mode picker and admin visibility.

## Goals

1. Show each user a progress bar: "X / Total mastered" for every product's study bank.
2. Let users choose a learning mode before each study session: **Fresh**, **Review**, or **Redo All**.
3. Give admins a per-user × per-product mastery summary in the existing admin dashboard.

## Non-Goals (YAGNI)

- Per-question drill-down for admins.
- Exam bank progress tracking (separate feature).
- Cross-user question-difficulty analytics.
- Offline answer queueing (record-on-answer only; toast on failure).

## Mastery Rule

A question is **mastered** when the user answers it correctly **twice in a row**. A wrong answer resets the streak to 0 and clears mastery.

## Data Model

### New table: `user_question_progress`

```sql
CREATE TABLE user_question_progress (
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug        text        NOT NULL,         -- e.g. "pro-achiever"
  question_hash       text        NOT NULL,         -- stable hash of question text
  consecutive_correct smallint    NOT NULL DEFAULT 0,
  mastered            boolean     NOT NULL DEFAULT false,
  total_attempts      int         NOT NULL DEFAULT 0,
  total_correct       int         NOT NULL DEFAULT 0,
  last_correct        boolean,
  last_answered_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_slug, question_hash)
);

CREATE INDEX idx_uqp_user_product ON user_question_progress (user_id, product_slug);
CREATE INDEX idx_uqp_product_mastered ON user_question_progress (product_slug, mastered);

-- RLS
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own progress"
  ON user_question_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read all progress"
  ON user_question_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles
      WHERE user_admin_roles.user_id = auth.uid()
        AND user_admin_roles.role IN ('admin', 'master_admin')
    )
  );
```

**Upsert semantics on each answer:**

- **Correct:** `consecutive_correct = consecutive_correct + 1`, `mastered = (consecutive_correct + 1 >= 2)`, `total_attempts += 1`, `total_correct += 1`, `last_correct = true`.
- **Wrong:** `consecutive_correct = 0`, `mastered = false`, `total_attempts += 1`, `last_correct = false`.

Implemented client-side via a read-modify-upsert in `useQuestionProgress` (a single authenticated user only ever writes their own rows, so no contention).

## Question Identity

Questions are hardcoded in TypeScript. We derive a **stable identifier** by hashing the question text:

- `questionHash(text: string): string` — produces a 16-char hex digest from SHA-256 (via `crypto.subtle.digest`). Hashes are computed once per question at module load and memoized.
- Edits to a question's text produce a new hash; the old progress row becomes an orphan. This is acceptable — orphans fall out of filters naturally. A future cleanup job can prune rows whose `question_hash` is no longer present.

## Components & Files

### Create

- `src/lib/questionHash.ts` — async SHA-256 hasher + in-memory cache helper that returns a `Map<string, string>` keyed by question text.
- `src/hooks/useQuestionProgress.tsx` — loads a user's progress for a product, exposes `recordAnswer(questionHash, isCorrect)` and derived counters `{ masteredCount, totalCount, unansweredHashes, reviewHashes }`.
- `src/components/study/StudyModePicker.tsx` — three-card picker (Fresh / Review / Redo All) with live counts; disabled state when a mode has 0 eligible questions.
- `supabase/migrations/<timestamp>_user_question_progress.sql` — the schema above.

### Modify

- `src/pages/QuestionBanks.tsx` — for each product card, render a mastery progress bar (`X / studyCount mastered`) and replace the single "Study Bank" button with three mode buttons showing counts.
- `src/components/study/StudyQuiz.tsx` — accept pre-filtered question lists (already parameterised); on each `handleSelect`, call `recordAnswer(questionHash, isCorrect)`; render a persistent mastery progress bar above the session progress bar.
- Six study page wrappers (`ProAchieverStudy.tsx`, `PlatinumWealthVentureStudy.tsx`, `HealthShieldGoldMaxStudy.tsx`, `ProLifetimeProtectorStudy.tsx`, `SolitairePaStudy.tsx`, `UltimateCriticalCoverStudy.tsx`) — introduce a mode-picker step before rendering `StudyQuiz`; pass the filtered question slice.
- `src/hooks/useAdminQuizScores.tsx` — add an aggregate query that returns per-user × per-product mastery counts, merged into `QuizProductBreakdown`.
- `src/components/admin/QuizScoresPanel.tsx` — add a "Mastery" column / inline chip per product showing `mastered / total`.

## User Flow

1. User opens `/question-banks` → sees each product with a mastery bar like `47 / 140 mastered (34%)`.
2. User clicks one of three mode buttons: **Fresh (93)**, **Review (12)**, **Redo All (140)**.
3. Route navigates to `/product/<slug>/study` with a selected-mode state (URL query `?mode=fresh|review|all`).
4. The study page reads the user's progress, filters `studyBank` accordingly, then renders `StudyQuiz` with the filtered list.
5. Each answer inside `StudyQuiz` triggers a DB upsert via `useQuestionProgress.recordAnswer`.
6. After finishing, progress is already persisted; returning to `/question-banks` reflects updated counts.

## Learning Modes

| Mode | Filter |
|---|---|
| **Fresh** | Questions with no row in `user_question_progress` for this user × product. |
| **Review** | Questions with a row where `mastered = false` (attempted but not mastered). |
| **Redo All** | All questions in the study bank, regardless of state. |

Empty-state handling: if Fresh or Review has zero matches, the button is disabled with a subtle "0 remaining" label.

## Admin View

Extend `QuizScoresPanel` per-product rows:

```
Pro Achiever      Best 85%    Avg 72%   4 attempts   Mastery 47/140 (34%)   Last: Apr 10
```

Data comes from a new aggregate fetch in `useAdminQuizScores`:

```sql
SELECT user_id, product_slug, COUNT(*) FILTER (WHERE mastered) AS mastered_count, COUNT(*) AS touched_count
FROM user_question_progress
GROUP BY user_id, product_slug;
```

Totals per product are read from the static study bank counts on the client (already imported on `QuestionBanks.tsx`). A small `src/data/studyBankCounts.ts` export will centralise `{ [slug]: count }` so admin and user pages agree.

## Error Handling

- `recordAnswer` failures: show a non-blocking toast; the quiz UX continues unaffected. Users can re-answer the same question later (idempotent effect on mastery).
- Hash computation failures (extremely unlikely): fall back to a DJB2 hash of the question text so progress continues to record.
- Migration rollback: table drop is safe — no other tables reference it.

## Testing

- Manual: complete a study session, verify `user_question_progress` rows exist, verify mastery bar updates after the second consecutive correct.
- Playwright (per `[TEST]` rule in `CLAUDE.md`): sign in as demo user, navigate to `/question-banks`, pick Review mode, answer one question, return to the banks page, assert the progress bar moved.
- Admin: sign in as `master_admin`, visit `/admin`, expand a user row, assert the Mastery column appears with a `mastered/total` count.

## Open Questions Resolved During Brainstorm

- **Scope:** study banks only.
- **Mastery rule:** 2-in-a-row (option B).
- **Admin detail:** per-user summary only (option A).
- **Mode picker placement:** before session starts, not mid-quiz.

## Out of Scope / Future Work

- Offline queueing of answers.
- Admin question-level drill-down and weak-question analytics.
- Exam-bank mastery tracking.
- Automated orphan-row cleanup after question edits.
