-- Ensure we have a sales-tools category for the Sales Tools functionality
INSERT INTO public.categories (id, name, description) VALUES
(gen_random_uuid(), 'Sales Tools', 'Sales training tools and objection handling resources')
ON CONFLICT (name) DO NOTHING;