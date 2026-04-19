-- Migration: First 60 Days Reflection Submissions
-- Add reflection columns and admin read policy

-- Step 1: Add reflection columns to first_60_days_progress
ALTER TABLE public.first_60_days_progress 
  ADD COLUMN IF NOT EXISTS reflection_answers jsonb NULL,
  ADD COLUMN IF NOT EXISTS reflection_submitted_at timestamptz NULL;

-- Step 2: Add index for admin queries by reflection submission status
CREATE INDEX IF NOT EXISTS idx_first_60_days_progress_reflection_submitted 
ON public.first_60_days_progress(reflection_submitted_at, day_number);

-- Step 3: Add admin SELECT policy for progress table (admins can read all learner progress)
CREATE POLICY "first_60_days_progress_admin_select"
ON public.first_60_days_progress
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::text) 
  OR has_role(auth.uid(), 'master_admin'::text)
);

-- Note: Owner policy (first_60_days_progress_owner_select) already exists
-- Learners can read their own rows via owner policy
-- Admins can now read all rows via this new policy
-- No admin write policy — admins cannot edit learner progress