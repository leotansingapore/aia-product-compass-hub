DO $$
DECLARE
  v_id uuid := '70d4d2e9-3ead-4649-80c7-8f8704ba0f6b';
BEGIN
  DELETE FROM public.user_access_tiers WHERE user_id = v_id::text;
  DELETE FROM public.user_admin_roles WHERE user_id = v_id::text;
  DELETE FROM public.profiles WHERE user_id = v_id::text;
  DELETE FROM auth.users WHERE id = v_id;
END $$;