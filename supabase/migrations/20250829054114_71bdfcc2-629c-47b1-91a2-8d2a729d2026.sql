-- Insert the new Appointment Flows category into the categories table
INSERT INTO public.categories (id, name, description, useful_links)
VALUES (
  'appointment-flows',
  'Appointment Flows',
  'Step-by-step appointment booking and consultation processes for various product types.',
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;