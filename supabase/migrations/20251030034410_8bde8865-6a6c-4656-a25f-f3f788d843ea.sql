-- Add order column to user_notes table
ALTER TABLE user_notes 
ADD COLUMN "order" INTEGER;

-- Set initial order based on created_at (oldest = 0, newest = higher)
WITH ordered_notes AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, product_id 
      ORDER BY created_at ASC
    ) - 1 AS note_order
  FROM user_notes
)
UPDATE user_notes
SET "order" = ordered_notes.note_order
FROM ordered_notes
WHERE user_notes.id = ordered_notes.id;

-- Make order NOT NULL with a default
ALTER TABLE user_notes 
ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "order" SET DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX idx_user_notes_order ON user_notes(user_id, product_id, "order");