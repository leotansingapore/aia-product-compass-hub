-- Create "Core Products" category with a valid UUID
INSERT INTO public.categories (id, name, description, published)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Core Products',
  'A curated collection of our most commonly sold products across all categories.',
  true
);

-- Duplicate the 6 products into the Core Products category
INSERT INTO public.products (id, title, category_id, parent_product_id, description, highlights, custom_gpt_link, training_videos, useful_links, tags, published, sort_order, rich_content, assistant_id, assistant_instructions, chatbot_1_name, chatbot_button_text, chatbot_link_2, chatbot_link_3, chatbot_2_name, chatbot_3_name)
SELECT
  'core-' || p.id,
  p.title,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  p.id,
  p.description,
  p.highlights,
  p.custom_gpt_link,
  p.training_videos,
  p.useful_links,
  p.tags,
  p.published,
  p.sort_order,
  p.rich_content,
  p.assistant_id,
  p.assistant_instructions,
  p.chatbot_1_name,
  p.chatbot_button_text,
  p.chatbot_link_2,
  p.chatbot_link_3,
  p.chatbot_2_name,
  p.chatbot_3_name
FROM public.products p
WHERE p.id IN (
  'pro-achiever',
  'pro-lifetime-protector',
  'platinum-wealth-venture',
  'healthshield-gold-max',
  'solitaire-pa',
  'ultimate-critical-cover'
);