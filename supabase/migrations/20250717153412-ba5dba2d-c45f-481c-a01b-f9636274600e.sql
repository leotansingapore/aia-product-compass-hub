-- Create profiles for users who don't have them yet
INSERT INTO public.profiles (user_id, email, display_name, created_at, updated_at)
SELECT 
    au.id as user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', 
             au.raw_user_meta_data->>'full_name',
             SPLIT_PART(au.email, '@', 1)) as display_name,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;