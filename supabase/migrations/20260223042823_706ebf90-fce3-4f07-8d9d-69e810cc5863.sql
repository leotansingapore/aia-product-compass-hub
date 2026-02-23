ALTER TABLE scripts ADD COLUMN script_role text DEFAULT 'consultant';

-- Update existing telemarketer scripts based on title patterns
UPDATE scripts SET script_role = 'telemarketer' WHERE stage ILIKE '%telemarketer%';
UPDATE scripts SET script_role = 'va' WHERE stage ILIKE '%VA %' OR stage ILIKE '%virtual assistant%';