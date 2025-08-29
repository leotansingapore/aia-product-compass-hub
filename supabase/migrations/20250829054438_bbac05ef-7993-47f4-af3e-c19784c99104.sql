-- Add tier permissions for the Appointment Flows category using the correct ID
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id)
VALUES 
  ('user', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94'),
  ('admin', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94'),
  ('master_admin', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94'),
  ('basic', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94'),
  ('intermediate', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94'),
  ('advanced', 'section', 'product-category-5ef0b17f-a19f-4859-8349-3e4959620e94')
ON CONFLICT (tier_level, access_type, resource_id) DO NOTHING;