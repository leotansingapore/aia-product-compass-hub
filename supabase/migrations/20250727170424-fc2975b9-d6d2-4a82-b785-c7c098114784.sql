-- Create tier permissions table to define what each tier can access
CREATE TABLE public.tier_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_level text NOT NULL,
  access_type text NOT NULL, -- 'page' or 'section'
  resource_id text NOT NULL, -- page_id or section_id
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tier_level, access_type, resource_id)
);

-- Enable RLS
ALTER TABLE public.tier_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Master admins can manage tier permissions" 
ON public.tier_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Anyone can view tier permissions" 
ON public.tier_permissions 
FOR SELECT 
USING (true);

-- Insert default tier permissions
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id) VALUES
-- Tier 1: CMFAS Exams only
('tier_1', 'page', 'cmfas-exams'),

-- Tier 2: CMFAS Exams + Investment Products
('tier_2', 'page', 'cmfas-exams'),
('tier_2', 'section', 'product-category-investment'),

-- Tier 3: CMFAS Exams + Investment Products + Endowment Products
('tier_3', 'page', 'cmfas-exams'),
('tier_3', 'section', 'product-category-investment'),
('tier_3', 'section', 'product-category-endowment'),

-- Tier 4: CMFAS Exams + All Product Categories
('tier_4', 'page', 'cmfas-exams'),
('tier_4', 'section', 'product-category-investment'),
('tier_4', 'section', 'product-category-endowment'),
('tier_4', 'section', 'product-category-whole-life'),
('tier_4', 'section', 'product-category-term'),
('tier_4', 'section', 'product-category-medical');

-- Create function to get user tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = get_user_tier.user_id 
    AND role IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'master_admin')
  ORDER BY 
    CASE role 
      WHEN 'master_admin' THEN 5
      WHEN 'tier_4' THEN 4
      WHEN 'tier_3' THEN 3
      WHEN 'tier_2' THEN 2
      WHEN 'tier_1' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$$;

-- Create function to check tier access
CREATE OR REPLACE FUNCTION public.has_tier_access(user_id uuid, access_type text, resource_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tier_permissions tp
    WHERE tp.tier_level = public.get_user_tier(user_id)
      AND tp.access_type = has_tier_access.access_type
      AND tp.resource_id = has_tier_access.resource_id
  ) OR public.get_user_tier(user_id) = 'master_admin'
$$;