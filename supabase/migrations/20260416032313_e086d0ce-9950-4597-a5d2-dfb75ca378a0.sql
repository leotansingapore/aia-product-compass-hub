
-- Fix FK: learning_track_progress.user_id should reference auth.users(id), not profiles(id)
-- The code writes auth.uid() as user_id, but the FK points to profiles.id (which differs from auth.uid())
ALTER TABLE learning_track_progress DROP CONSTRAINT IF EXISTS learning_track_progress_user_id_fkey;

ALTER TABLE learning_track_progress
  ADD CONSTRAINT learning_track_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also fix RLS: add admin INSERT/UPDATE policies so admins can manage their own progress
CREATE POLICY "lt_progress_admin_insert" ON learning_track_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text) OR auth.uid() = user_id
  );

-- Drop and recreate update policy to also allow admins
DROP POLICY IF EXISTS "lt_progress_user_update_own" ON learning_track_progress;
CREATE POLICY "lt_progress_user_update_own" ON learning_track_progress
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text)
  );

-- Drop and recreate insert policy to be replaced by the combined one above
DROP POLICY IF EXISTS "lt_progress_user_insert_own" ON learning_track_progress;
