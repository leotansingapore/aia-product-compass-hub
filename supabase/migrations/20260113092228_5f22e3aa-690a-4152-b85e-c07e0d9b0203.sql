-- Restore deleted products with SEO-friendly slugs

-- 1. Competitors - Endowment Products
INSERT INTO public.products (id, title, description, category_id, tags, created_at, updated_at)
VALUES (
  'competitors-endowment',
  'Competitors',
  'Competitor analysis for Endowment products',
  '3adb6155-c158-408d-b910-9b3db532d435',
  ARRAY['endowment', 'competitors'],
  now(),
  now()
);

-- 2. Competitors - Investment Products
INSERT INTO public.products (id, title, description, category_id, tags, created_at, updated_at)
VALUES (
  'competitors-investment',
  'Competitors',
  'Competitor analysis for Investment products',
  'c7cde8f4-12d4-4ddc-9150-7b32008a4e19',
  ARRAY['investment', 'competitors'],
  now(),
  now()
);

-- 3. Competitors - Medical Insurance Products
INSERT INTO public.products (id, title, description, category_id, tags, created_at, updated_at)
VALUES (
  'competitors-medical',
  'Competitors',
  'Competitor analysis for Medical Insurance products',
  'b1024527-481f-4d85-9192-b43633e9be4a',
  ARRAY['medical', 'competitors'],
  now(),
  now()
);

-- 4. Competitors - Term Products
INSERT INTO public.products (id, title, description, category_id, tags, created_at, updated_at)
VALUES (
  'competitors-term',
  'Competitors',
  'Competitor analysis for Term products',
  '291cf475-d918-40c0-b37d-33794534d469',
  ARRAY['term', 'competitors'],
  now(),
  now()
);

-- 5. Wealth Venture - Investment Products
INSERT INTO public.products (id, title, description, category_id, tags, created_at, updated_at)
VALUES (
  'wealth-venture',
  'Wealth Venture',
  'Wealth Venture investment product',
  'c7cde8f4-12d4-4ddc-9150-7b32008a4e19',
  ARRAY['investment', 'ILP'],
  now(),
  now()
);