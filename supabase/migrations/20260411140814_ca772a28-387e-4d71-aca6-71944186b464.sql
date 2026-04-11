
-- 1. Widen lt_submissions_user_update_own_unreviewed
DROP POLICY "lt_submissions_user_update_own_unreviewed" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_user_update_own_unreviewed" ON public.learning_track_submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND review_status IN ('pending','changes_requested'));

-- 2. Widen lt_files_user_insert_own
DROP POLICY "lt_files_user_insert_own" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_user_insert_own" ON public.learning_track_submission_files
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM learning_track_submissions s
    WHERE s.id = learning_track_submission_files.submission_id
      AND s.user_id = auth.uid()
      AND s.review_status IN ('pending','changes_requested')
  ));

-- 3. Widen lt_files_user_delete_own
DROP POLICY "lt_files_user_delete_own" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_user_delete_own" ON public.learning_track_submission_files
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM learning_track_submissions s
    WHERE s.id = learning_track_submission_files.submission_id
      AND s.user_id = auth.uid()
      AND s.review_status IN ('pending','changes_requested')
  ));
