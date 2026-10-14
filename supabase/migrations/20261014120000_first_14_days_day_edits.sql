-- Admin edits to First 14 Days lesson text, made from the day page.
-- Append-only: each save is a new row and the page shows the newest row for a
-- day. A row whose markdown is NULL means "show the lesson file again".
-- base_hash is a hash of the lesson file the edit started from, so the page
-- can tell an admin when the file changed after their edit.
CREATE TABLE public.first_14_days_day_edits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  day_number int NOT NULL CHECK (day_number BETWEEN 1 AND 14),
  markdown text CHECK (markdown IS NULL OR char_length(markdown) BETWEEN 1 AND 200000),
  base_hash text NOT NULL CHECK (char_length(base_hash) BETWEEN 1 AND 64),
  -- auth.users, not profiles: profiles.id is not the login id, and some admins have no profile.
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_first_14_days_day_edits_day_newest
  ON public.first_14_days_day_edits (day_number, id DESC);

ALTER TABLE public.first_14_days_day_edits ENABLE ROW LEVEL SECURITY;

-- Every signed-in reader sees the current lesson text, as they already do in
-- the bundled files. Anonymous visitors get nothing.
CREATE POLICY "first_14_days_day_edits_select_signed_in"
  ON public.first_14_days_day_edits
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins save, and only as themselves. No UPDATE or DELETE policy: a
-- restore is a new row, so no version is ever lost.
CREATE POLICY "first_14_days_day_edits_insert_admin"
  ON public.first_14_days_day_edits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND (
      public.has_role((SELECT auth.uid()), 'admin')
      OR public.has_role((SELECT auth.uid()), 'master_admin')
    )
  );

-- Explicit, so the table works whatever the schema's default privileges are.
REVOKE ALL ON public.first_14_days_day_edits FROM anon, PUBLIC;
REVOKE ALL ON public.first_14_days_day_edits FROM authenticated;
GRANT SELECT, INSERT ON public.first_14_days_day_edits TO authenticated;
