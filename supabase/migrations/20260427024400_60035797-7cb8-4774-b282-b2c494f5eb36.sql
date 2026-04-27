-- The auth user was already deleted; remove the orphaned profile row so the
-- duplicate Derek Tan no longer appears on the leaderboard or user lists.
DELETE FROM public.profiles
WHERE user_id = '6787c33d-8d6b-4fcd-88d5-82491055ac19'
  AND email = 'dtdw90@gmail.com';