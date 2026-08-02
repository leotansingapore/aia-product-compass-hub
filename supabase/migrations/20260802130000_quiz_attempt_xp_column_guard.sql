-- Direct client inserts into `quiz_attempts` must not claim XP.
--
-- Two surfaces legitimately record an attempt from the browser and always send
-- `xp_earned: 0` — the in-page quiz (`useQuizState`) and the product exam
-- (`ProductExam`). Neither is gamified; the XP-bearing insert now happens
-- inside `award_quiz_xp`.
--
-- Nothing stopped a learner writing `xp_earned: 99999` on one of those rows
-- though, and that column IS read back: the admin quiz-score reporting and the
-- agent handler both surface it. Pin it to zero for client inserts. The
-- SECURITY DEFINER award function runs as the table owner and so is unaffected
-- (quiz_attempts does not FORCE row level security).
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;

CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND COALESCE(xp_earned, 0) = 0);
