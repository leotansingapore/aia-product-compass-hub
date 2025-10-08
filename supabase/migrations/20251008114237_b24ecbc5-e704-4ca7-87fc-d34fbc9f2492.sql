-- Add two additional chatbot link fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS chatbot_link_2 TEXT,
ADD COLUMN IF NOT EXISTS chatbot_link_3 TEXT;