-- Remove admin and master_admin roles from zhangyaoyun, keeping only user role
DELETE FROM public.user_roles 
WHERE user_id = '70d4d2e9-3ead-4649-80c7-8f8704ba0f6b' 
AND role IN ('master_admin', 'admin');