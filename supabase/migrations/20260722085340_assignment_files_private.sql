-- Lock down the assignment-files bucket.
-- It was PUBLIC with a read policy granted to the `public` role, so every
-- uploaded file (vision boards, personal screenshots, plan decks) was reachable
-- by anyone on the internet via a permanent, unauthenticated URL. Make the
-- bucket private and restrict reads to authenticated users; the app now serves
-- files through short-lived signed URLs. Authenticated (not owner-only) read is
-- intentional — the cohort peer gallery shows teammates' submissions.
update storage.buckets set public = false where id = 'assignment-files';

drop policy if exists assignment_files_read on storage.objects;
create policy assignment_files_read on storage.objects
  for select
  to authenticated
  using (bucket_id = 'assignment-files');
