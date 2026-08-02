-- Wiring up in-lesson quizzes (E2) exposed that the once-per-day XP limit keys
-- on (user_id, product_id) only. With in-lesson quizzes now awarding XP, a
-- learner working through a course would earn on their FIRST quiz and then be
-- told "Quiz Already Completed Today" on every subsequent lesson in the same
-- product — a worse experience than the silent no-op it replaced.
--
-- Scope the limit per lesson instead. Nullable so existing rows and
-- product-level quizzes (video_id IS NULL) keep working unchanged.
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS video_id text;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_daily_scope
  ON public.quiz_attempts (user_id, product_id, video_id, completed_at DESC);

-- learning_progress.category_id is NOT NULL, so a quiz on a surface without a
-- real category (CMFAS modules) could not record progress at all — the client
-- previously fabricated one from the product id's first segment. Allow NULL so
-- the row can be written honestly instead of faked or skipped.
ALTER TABLE public.learning_progress ALTER COLUMN category_id DROP NOT NULL;
