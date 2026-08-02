-- Avatars were being uploaded into the shared `knowledge-files` bucket and
-- published with getPublicUrl, so every user photo sat world-readable at a
-- guessable path alongside knowledge-base documents, with no size or type
-- limit enforced anywhere server-side (the client check added in E4 stops an
-- honest mistake, not a direct API call).
--
-- A dedicated bucket with real limits. Public READ is kept deliberately:
-- avatars render in the leaderboard and peer galleries where signing every
-- URL would be a large change for little gain — the meaningful fixes are the
-- size/type ceiling and owner-scoped WRITES.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB, matching the UI's promise
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public = EXCLUDED.public;

-- Owner-scoped writes: a user may only write inside a folder named for their
-- own uid, so nobody can overwrite or delete someone else's avatar.
DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);
