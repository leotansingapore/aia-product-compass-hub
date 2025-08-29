-- Add tier permissions for the Appointment Flows category so it appears in the sidebar
-- First, get the category ID for Appointment Flows
WITH appointment_flows_category AS (
  SELECT id FROM public.categories WHERE name = 'Appointment Flows' LIMIT 1
)
-- Insert tier permissions for all user levels to access this category
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id)
SELECT 
  tier_level,
  'section' as access_type,
  'product-category-' || afc.id as resource_id
FROM appointment_flows_category afc
CROSS JOIN (
  VALUES ('user'), ('admin'), ('master_admin'), ('basic'), ('intermediate'), ('advanced')
) AS tiers(tier_level)
ON CONFLICT (tier_level, access_type, resource_id) DO NOTHING;