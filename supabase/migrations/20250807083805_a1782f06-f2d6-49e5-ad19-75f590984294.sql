-- Ensure the master admin account is properly set up
-- First, let's make sure we have the assign_master_admin function and run it
SELECT assign_master_admin('tanjunsing@gmail.com');

-- Also add some basic permissions for core account functionality
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id) VALUES 
('master_admin', 'page', 'my-account'),
('master_admin', 'tab', 'profile'),
('master_admin', 'tab', 'security'), 
('master_admin', 'tab', 'preferences'),
('master_admin', 'tab', 'admin'),
('master_admin', 'section', 'my-account')
ON CONFLICT (tier_level, access_type, resource_id) DO NOTHING;