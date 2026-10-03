-- Course content and progress were readable (and some writable) without signing
-- in, with only the public anon key that ships in the site's JavaScript,
-- plus three functions with the same problem (the knowledge-files bucket is
-- in 20261003010100, kept apart because storage.objects has another owner)
-- (found 2026-10-02 while comparing ActivityTracker's courses with this hub).
--
--   products             every published product row, lecture notes and
--                        transcripts included, readable signed out
--   knowledge_documents  readable signed out
--   knowledge_chunks     9,140 chunks of course text, readable signed out
--   video_progress       "Anonymous users can manage video progress in
--                        development": anyone could read and rewrite every
--                        learner's progress
--   files,               "Anyone can manage ...": anyone, signed in or not,
--   file_embeddings      could insert, change or delete rows
--
-- Every reader in this repo, catalyst-infinity-academy, total-wealth-concept
-- and examprep-app was traced first: browser reads all sit behind RequireAuth,
-- edge functions use the service role (which bypasses RLS), the public share
-- pages read only scripts/playbooks/objections, and total-wealth-concept's
-- anon client reads only plans_catalog. A signed-in learner keeps the same
-- products, knowledge documents and own progress rows. knowledge_chunks,
-- files and file_embeddings become admin-only: no learner screen reads them
-- (the AI chat reads chunks through edge functions on the service role).
-- The tier gate stays client-side, as before.

begin;
set local lock_timeout = '2s';

-- products: same rule (published, or an admin), signed in only.
drop policy "Everyone can view products" on public.products;
create policy "Signed-in users can view products" on public.products
  for select to authenticated
  using ((published = true) or has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text));

-- knowledge_documents: the list stays visible to anyone signed in.
drop policy "Anyone can view knowledge documents" on public.knowledge_documents;
create policy "Signed-in users can view knowledge documents" on public.knowledge_documents
  for select to authenticated
  using (true);

-- knowledge_chunks: read by edge functions (service role) and the admin upload
-- screen only.
drop policy "Anyone can view knowledge chunks" on public.knowledge_chunks;
create policy "Admins can view knowledge chunks" on public.knowledge_chunks
  for select to authenticated
  using (has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text));

-- video_progress: the development-era anon door goes; learners keep their
-- own-row select/insert/update policies.
drop policy "Anonymous users can manage video progress in development" on public.video_progress;

-- files, file_embeddings: admins only.
drop policy "Anyone can manage files" on public.files;
create policy "Admins can manage files" on public.files
  for all to authenticated
  using (has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text))
  with check (has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text));
drop policy "Anyone can manage file embeddings" on public.file_embeddings;
create policy "Admins can manage file embeddings" on public.file_embeddings
  for all to authenticated
  using (has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text))
  with check (has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text));

-- Course-text search functions are SECURITY DEFINER with no sign-in check, so
-- the anon key could read chunks through them and step round the policy
-- above. Callers are edge functions (service role) and signed-in users.
revoke execute on function public.match_knowledge_chunks(vector, integer, text) from public, anon;
grant execute on function public.match_knowledge_chunks(vector, integer, text) to authenticated, service_role;
revoke execute on function public.hybrid_search_knowledge_chunks(vector, text, integer, text, double precision, double precision, integer) from public, anon;
grant execute on function public.hybrid_search_knowledge_chunks(vector, text, integer, text, double precision, double precision, integer) to authenticated, service_role;

-- seed_learning_track() deletes every learning track phase and reseeds the
-- April 2026 content. It is a one-off setup function nothing in the app calls,
-- and anyone holding the anon key could run it. Only the service role keeps it.
revoke execute on function public.seed_learning_track() from public, anon, authenticated;
grant execute on function public.seed_learning_track() to service_role;

-- Belt and braces: anon holds no table privilege on these six at all, so a
-- future "to public" policy cannot reopen them by accident.
revoke all on public.products, public.knowledge_documents, public.knowledge_chunks,
  public.video_progress, public.files, public.file_embeddings from anon;

commit;
