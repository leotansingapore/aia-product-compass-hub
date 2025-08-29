-- Insert the new Appointment Flows category into the categories table with proper UUID
INSERT INTO public.categories (id, name, description, useful_links)
VALUES (
  gen_random_uuid(),
  'Appointment Flows',
  'Step-by-step appointment booking and consultation processes for various product types.',
  '[]'::jsonb
);