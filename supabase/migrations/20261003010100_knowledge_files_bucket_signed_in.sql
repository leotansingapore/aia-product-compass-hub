-- knowledge-files storage bucket: anyone could list, upload and delete files
-- (found with 20261003010000). Kept in its own migration: storage.objects is
-- owned by supabase_storage_admin, so if this cannot run as the migration role
-- it fails alone and the table/function lockdown still stands.

begin;
set local lock_timeout = '2s';

-- knowledge-files bucket: anyone could list, upload and delete. Every upload in
-- the app comes from a signed-in screen (lesson/script editors, My notes,
-- admin product files) and only the admin product-files screen deletes. The
-- bucket stays public, so existing file links keep opening; listing and
-- uploading need a session, and deleting needs the uploader or an admin.
drop policy "Anyone can upload files" on storage.objects;
create policy "Signed-in users can upload knowledge files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'knowledge-files');
drop policy "Anyone can view files" on storage.objects;
create policy "Signed-in users can list knowledge files" on storage.objects
  for select to authenticated
  using (bucket_id = 'knowledge-files');
drop policy "Anyone can delete files" on storage.objects;
create policy "Uploader or admin can delete knowledge files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'knowledge-files'
         and (owner_id = (select auth.uid())::text or has_role(auth.uid(), 'admin'::text) or has_role(auth.uid(), 'master_admin'::text)));

commit;
