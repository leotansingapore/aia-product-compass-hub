-- Add product category sections to app_sections table for permission management
INSERT INTO public.app_sections (id, name, description, category) VALUES
('product-category-3adb6155-c158-408d-b910-9b3db532d435', 'Endowment Products Category', 'Access to Endowment Products category and its products', 'product-categories'),
('product-category-c7cde8f4-12d4-4ddc-9150-7b32008a4e19', 'Investment Products Category', 'Access to Investment Products category and its products', 'product-categories'),
('product-category-b1024527-481f-4d85-9192-b43633e9be4a', 'Medical Insurance Products Category', 'Access to Medical Insurance Products category and its products', 'product-categories'),
('product-category-291cf475-d918-40c0-b37d-33794534d469', 'Term Products Category', 'Access to Term Products category and its products', 'product-categories'),
('product-category-19b8c528-f36e-4731-827c-0cdb1de25059', 'Whole Life Products Category', 'Access to Whole Life Products category and its products', 'product-categories')
ON CONFLICT (id) DO NOTHING;