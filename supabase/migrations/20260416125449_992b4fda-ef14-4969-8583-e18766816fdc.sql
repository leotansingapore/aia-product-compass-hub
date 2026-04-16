
-- Wipe any stale rows (table isn't queried by code today)
DELETE FROM public.tier_permissions;

-- Explorer: home, bookmarks, my-account, explorer-track
INSERT INTO public.tier_permissions (tier_level, resource_id, access_type) VALUES
  ('explorer',     'home',               'read'),
  ('explorer',     'bookmarks',          'read'),
  ('explorer',     'my-account',         'read'),
  ('explorer',     'explorer-track',     'read'),

-- Papers-taker: everything Explorer has PLUS pre-rnf, cmfas, products, q-banks, roleplay, kb
  ('papers_taker', 'home',               'read'),
  ('papers_taker', 'bookmarks',          'read'),
  ('papers_taker', 'my-account',         'read'),
  ('papers_taker', 'explorer-track',     'read'),
  ('papers_taker', 'pre-rnf-track',      'read'),
  ('papers_taker', 'cmfas',              'read'),
  ('papers_taker', 'products',           'read'),
  ('papers_taker', 'question-banks',     'read'),
  ('papers_taker', 'roleplay',           'read'),
  ('papers_taker', 'kb',                 'read'),

-- Post-RNF: everything Papers has PLUS post-rnf-track, playbooks, flows, scripts, servicing, concept-cards, consultant-landing
  ('post_rnf',     'home',               'read'),
  ('post_rnf',     'bookmarks',          'read'),
  ('post_rnf',     'my-account',         'read'),
  ('post_rnf',     'explorer-track',     'read'),
  ('post_rnf',     'pre-rnf-track',      'read'),
  ('post_rnf',     'post-rnf-track',     'read'),
  ('post_rnf',     'cmfas',              'read'),
  ('post_rnf',     'products',           'read'),
  ('post_rnf',     'question-banks',     'read'),
  ('post_rnf',     'roleplay',           'read'),
  ('post_rnf',     'kb',                 'read'),
  ('post_rnf',     'playbooks',          'read'),
  ('post_rnf',     'flows',              'read'),
  ('post_rnf',     'scripts',            'read'),
  ('post_rnf',     'servicing',          'read'),
  ('post_rnf',     'concept-cards',      'read'),
  ('post_rnf',     'consultant-landing', 'read');

-- RLS: any authenticated user can read permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tier_permissions' AND policyname = 'Authenticated users can read tier permissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can read tier permissions" ON public.tier_permissions FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tier_permissions' AND policyname = 'Admins can manage tier permissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage tier permissions" ON public.tier_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''master_admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''master_admin''))';
  END IF;
END $$;
