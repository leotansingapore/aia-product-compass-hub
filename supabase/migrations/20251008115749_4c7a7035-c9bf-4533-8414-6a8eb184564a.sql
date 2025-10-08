-- Add editable fields for chatbot names and button text
ALTER TABLE products
ADD COLUMN IF NOT EXISTS chatbot_2_name TEXT DEFAULT 'Chatbot 2',
ADD COLUMN IF NOT EXISTS chatbot_3_name TEXT DEFAULT 'Chatbot 3',
ADD COLUMN IF NOT EXISTS chatbot_button_text TEXT DEFAULT 'Open Chat';