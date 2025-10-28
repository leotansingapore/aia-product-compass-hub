-- Add chatbot columns to products table for Chat Assistance section
-- This migration adds columns for the 1st, 2nd, and 3rd chat options

-- Add chatbot_1_name column for the 1st chat option
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_1_name TEXT;

-- Add chatbot_2_name and chatbot_link_2 columns for the 2nd chat option
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_2_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_link_2 TEXT;

-- Add chatbot_3_name and chatbot_link_3 columns for the 3rd chat option
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_3_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_link_3 TEXT;

-- Add chatbot_button_text column (shared button text for 2nd and 3rd options)
ALTER TABLE products ADD COLUMN IF NOT EXISTS chatbot_button_text TEXT;

-- Add comments for documentation
COMMENT ON COLUMN products.chatbot_1_name IS 'Display name for the 1st chat option (AI Assistant)';
COMMENT ON COLUMN products.chatbot_2_name IS 'Display name for the 2nd chat option';
COMMENT ON COLUMN products.chatbot_link_2 IS 'Custom link for the 2nd chat option';
COMMENT ON COLUMN products.chatbot_3_name IS 'Display name for the 3rd chat option';
COMMENT ON COLUMN products.chatbot_link_3 IS 'Custom link for the 3rd chat option';
COMMENT ON COLUMN products.chatbot_button_text IS 'Button text shared by 2nd and 3rd chat options';
