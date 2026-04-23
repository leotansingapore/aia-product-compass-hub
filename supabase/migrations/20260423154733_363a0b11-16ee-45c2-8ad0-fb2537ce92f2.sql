DO $$
DECLARE
  v_ids uuid[] := ARRAY[
    'f308233b-2336-4e0f-869b-3f6ceaa9bdcc'::uuid,
    '53408a54-5de1-4867-9366-e7e8491e097f'::uuid,
    'f3a9e9f4-46be-4b5f-933f-d59504e9fcd5'::uuid,
    '7595e434-d587-43e0-b38d-f385c54be66c'::uuid
  ];
  v_ids_text text[] := ARRAY[
    'f308233b-2336-4e0f-869b-3f6ceaa9bdcc',
    '53408a54-5de1-4867-9366-e7e8491e097f',
    'f3a9e9f4-46be-4b5f-933f-d59504e9fcd5',
    '7595e434-d587-43e0-b38d-f385c54be66c'
  ];
BEGIN
  DELETE FROM public.user_access_tiers WHERE user_id = ANY(v_ids_text);
  DELETE FROM public.user_admin_roles WHERE user_id = ANY(v_ids_text);
  DELETE FROM public.profiles WHERE user_id = ANY(v_ids_text);
  DELETE FROM auth.users WHERE id = ANY(v_ids);
END $$;