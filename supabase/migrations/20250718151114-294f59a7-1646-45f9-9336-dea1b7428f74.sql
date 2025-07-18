-- Fix the section ID mismatch by updating quiz-section to product_quiz
UPDATE user_section_permissions 
SET section_id = 'product_quiz'
WHERE section_id = 'quiz-section' AND user_id = 'ab46f9d3-c290-4f06-9042-a9c06cdefe55';

-- Also add the dashboard-search permission that should be working now
-- (this was added in the previous migration)