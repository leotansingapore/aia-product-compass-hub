-- Remove old granular permission tables
DROP TABLE IF EXISTS public.user_section_permissions CASCADE;
DROP TABLE IF EXISTS public.user_page_permissions CASCADE;
DROP TABLE IF EXISTS public.user_tab_permissions CASCADE;

-- Drop old functions that used granular permissions
DROP FUNCTION IF EXISTS public.get_section_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_page_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_tab_permission(uuid, text) CASCADE;