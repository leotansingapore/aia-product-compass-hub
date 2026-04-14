-- Per-question study bank mastery tracking.
-- Rule: a question is mastered when the user answers it correctly twice in a row.
-- A wrong answer resets the streak and clears mastery.

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
