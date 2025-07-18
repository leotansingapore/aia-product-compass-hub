-- Clean up orphaned app sections that are no longer used in the current APP_STRUCTURE
-- These sections use old naming conventions (underscores) vs current (hyphens)

DELETE FROM public.user_section_permissions 
WHERE section_id IN (
  'product_summary', 'product_highlights', 'product_links', 'product_ai', 
  'product_videos', 'product_quiz', 'product_notes', 'product_tags',
  'cmfas_links', 'cmfas_ai', 'cmfas_lectures', 'cmfas_content',
  'sales_tools', 'search_profile'
);

DELETE FROM public.app_sections 
WHERE id IN (
  'product_summary', 'product_highlights', 'product_links', 'product_ai', 
  'product_videos', 'product_quiz', 'product_notes', 'product_tags',
  'cmfas_links', 'cmfas_ai', 'cmfas_lectures', 'cmfas_content', 
  'sales_tools', 'search_profile'
);