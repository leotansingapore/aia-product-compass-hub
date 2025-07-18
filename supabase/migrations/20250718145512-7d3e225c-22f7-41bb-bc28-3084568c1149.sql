-- Add a test permission to hide dashboard search for the test user
INSERT INTO user_section_permissions (user_id, section_id, permission_type, lock_message)
VALUES ('ab46f9d3-c290-4f06-9042-a9c06cdefe55', 'dashboard-search', 'hidden', 'Search is disabled for testing')
ON CONFLICT (user_id, section_id) DO UPDATE SET
  permission_type = 'hidden',
  lock_message = 'Search is disabled for testing';