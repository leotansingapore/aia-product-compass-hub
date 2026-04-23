DO $$
DECLARE
  v_id uuid := '9875499e-e540-40dd-a00a-3ecd9b91e045';
BEGIN
  DELETE FROM public.user_access_tiers WHERE user_id = v_id::text;
  DELETE FROM public.user_admin_roles WHERE user_id = v_id::text;
  DELETE FROM public.profiles WHERE user_id = v_id::text;
  DELETE FROM auth.users WHERE id = v_id;
END $$;