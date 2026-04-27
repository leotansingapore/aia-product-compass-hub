-- One-off cleanup: remove the duplicate Derek Tan account (dtdw90@gmail.com, 0 XP).
-- Deleting from auth.users cascades to public.profiles via the existing FK,
-- and to other user-scoped tables that reference auth.users with ON DELETE CASCADE.
DELETE FROM auth.users
WHERE id = '6787c33d-8d6b-4fcd-88d5-82491055ac19'
  AND email = 'dtdw90@gmail.com';