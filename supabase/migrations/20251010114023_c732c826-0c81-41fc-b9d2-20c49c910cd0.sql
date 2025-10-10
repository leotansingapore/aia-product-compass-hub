-- Update chatbot names for Endowment Products
UPDATE products
SET 
  chatbot_2_name = 'Chat with Chatbot',
  chatbot_3_name = 'Chat with Notebook',
  updated_at = now()
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE name = 'Endowment Products'
);

-- Update chatbot names for Medical Insurance Products
UPDATE products
SET 
  chatbot_2_name = 'Chat with Chatbot',
  chatbot_3_name = 'Chat with Notebook',
  updated_at = now()
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE name = 'Medical Insurance Products'
);

-- Update chatbot names for Term Products
UPDATE products
SET 
  chatbot_2_name = 'Chat with Chatbot',
  chatbot_3_name = 'Chat with Notebook',
  updated_at = now()
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE name = 'Term Products'
);

-- Update chatbot names for Whole Life Products
UPDATE products
SET 
  chatbot_2_name = 'Chat with Chatbot',
  chatbot_3_name = 'Chat with Notebook',
  updated_at = now()
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE name = 'Whole Life Products'
);