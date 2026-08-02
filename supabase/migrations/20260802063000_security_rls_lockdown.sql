-- Security lockdown batch (ecosystem audit cycle E1, 2026-08-02).

-- 1) scripts UPDATE was TO PUBLIC (no TO clause on creation): anyone holding the
--    public anon key could rewrite every consultant-facing script. Scope to
--    authenticated (in-app behavior unchanged: any signed-in FC may edit).
ALTER POLICY "Authenticated users can update scripts" ON public.scripts TO authenticated;

-- 2) Leftover dev-mode policies exposed every user's bookmarks and private
--    notes to anonymous read/write (FOR ALL USING(true) OR-combines over the
--    correct owner policies).
DROP POLICY IF EXISTS "Anonymous users can manage bookmarks in development" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Anonymous users can manage notes in development" ON public.user_notes;

-- 3) products/categories were writable by ANY authenticated user while the UI
--    is admin-only. Admin-scope all six write policies.
ALTER POLICY "Authenticated users can insert products" ON public.products
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
ALTER POLICY "Authenticated users can update products" ON public.products
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
ALTER POLICY "Authenticated users can delete products" ON public.products
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
ALTER POLICY "Authenticated users can insert categories" ON public.categories
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
ALTER POLICY "Authenticated users can update categories" ON public.categories
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
ALTER POLICY "Authenticated users can delete categories" ON public.categories
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- 4) concept-card-images storage: any authenticated user could overwrite or
--    delete every drawing while the concept_cards table is admin-only.
ALTER POLICY "Authenticated users can upload concept card images" ON storage.objects
  WITH CHECK (bucket_id = 'concept-card-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')));
ALTER POLICY "Authenticated users can update concept card images" ON storage.objects
  USING (bucket_id = 'concept-card-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')));
ALTER POLICY "Authenticated users can delete concept card images" ON storage.objects
  USING (bucket_id = 'concept-card-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')));

-- 5) concept-card-images bucket had no size/type limits.
UPDATE storage.buckets
  SET file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
  WHERE id = 'concept-card-images';

-- 6) tier_permissions seed granted papers_taker roleplay, contradicting the
--    static matrix; the app carries hardcoded suppressions. Remove the row so
--    there is one source of truth (code exceptions removed in the same batch).
DELETE FROM public.tier_permissions WHERE tier_level = 'papers_taker' AND resource_id = 'roleplay';

-- 7) Script editor offers image/PDF attachments but there was no column: they
--    were silently discarded on save.
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
