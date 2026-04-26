INSERT INTO public.products (
  id, title, category_id, description, highlights, tags, published, sort_order,
  rich_content, useful_links, training_videos,
  assistant_id, assistant_instructions, custom_gpt_link,
  chatbot_1_name, chatbot_2_name, chatbot_3_name, chatbot_button_text, chatbot_link_2, chatbot_link_3,
  parent_product_id
)
SELECT
  'core-guaranteed-protect-plus',
  title, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description, highlights, tags, published, 7,
  rich_content, useful_links, training_videos,
  assistant_id, assistant_instructions, custom_gpt_link,
  chatbot_1_name, chatbot_2_name, chatbot_3_name, chatbot_button_text, chatbot_link_2, chatbot_link_3,
  NULL
FROM public.products
WHERE id = 'guaranteed-protect-plus'
ON CONFLICT (id) DO NOTHING;