-- 1. Per-item prerequisites (which sibling items must be completed first).
ALTER TABLE public.learning_track_items
  ADD COLUMN IF NOT EXISTS prerequisite_item_ids uuid[] NULL;

COMMENT ON COLUMN public.learning_track_items.prerequisite_item_ids IS
  'Array of learning_track_items.id that must be completed before this item unlocks. NULL or empty = no prereqs.';

-- 2. Per-phase prerequisite (which prior phase must be fully completed).
ALTER TABLE public.learning_track_phases
  ADD COLUMN IF NOT EXISTS prerequisite_phase_id uuid NULL
  REFERENCES public.learning_track_phases(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.learning_track_phases.prerequisite_phase_id IS
  'If set, this phase only unlocks once every published item in the referenced phase has a completed progress row for the user. NULL = no prereq.';

-- 3. Helpful index for the FK lookup.
CREATE INDEX IF NOT EXISTS learning_track_phases_prerequisite_phase_id_idx
  ON public.learning_track_phases (prerequisite_phase_id);