-- Create user@demo.com account with a completely new UUID
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_sent_at,
  recovery_token,
  reauthentication_token,
  reauthentication_sent_at,
  is_super_admin,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_new,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  invited_at,
  confirmation_sent_at,
  deleted_at,
  is_sso_user,
  is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@demo.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Demo User"}',
  NOW(),
  NOW(),
  '',
  '',
  NULL,
  '',
  '',
  NULL,
  false,
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  '',
  0,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  false
) RETURNING id;

-- Now create profile and role using the returned ID
INSERT INTO public.profiles (user_id, email, display_name, first_name, last_name)
SELECT id::text, 'user@demo.com', 'Demo User', 'Demo', 'User'
FROM auth.users 
WHERE email = 'user@demo.com';

-- Assign user role
INSERT INTO public.user_roles (user_id, role)
SELECT id::text, 'user'
FROM auth.users 
WHERE email = 'user@demo.com';