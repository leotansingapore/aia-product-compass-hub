UPDATE public.first_60_days_progress p
SET user_id = pr.user_id::uuid
FROM public.profiles pr
WHERE p.user_id = pr.id;

ALTER TABLE public.first_60_days_progress
  DROP CONSTRAINT IF EXISTS first_60_days_progress_user_id_fkey;

ALTER TABLE public.first_60_days_progress
  ADD CONSTRAINT first_60_days_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;