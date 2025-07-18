-- Ensure we have a sales-tools category for the Sales Tools functionality
INSERT INTO public.categories (id, name, description) VALUES
('sales-tools', 'Sales Tools', 'Sales training tools and objection handling resources')
ON CONFLICT (id) DO NOTHING;