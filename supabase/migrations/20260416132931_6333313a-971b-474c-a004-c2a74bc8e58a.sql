ALTER TABLE public.learning_track_phases
  DROP CONSTRAINT IF EXISTS learning_track_phases_track_check;

ALTER TABLE public.learning_track_phases
  ADD CONSTRAINT learning_track_phases_track_check
  CHECK (track IN ('pre_rnf','post_rnf','explorer'));