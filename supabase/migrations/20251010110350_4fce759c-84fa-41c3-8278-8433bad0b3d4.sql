-- Update chatbot names for all Investment Products
UPDATE products
SET 
  chatbot_2_name = 'Chat with Chatbot',
  chatbot_3_name = 'Chat with Notebook',
  updated_at = now()
WHERE category_id IN (
  SELECT id FROM categories WHERE name = 'Investment Products'
);