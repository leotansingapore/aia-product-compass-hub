-- Add all missing app sections to enable comprehensive permission control

-- Dashboard sections
INSERT INTO app_sections (id, name, description, category) VALUES
('dashboard-search', 'Search Section', 'Main search functionality on dashboard', 'dashboard'),
('dashboard-quick-actions', 'Quick Actions', 'Quick action buttons and shortcuts', 'dashboard'),
('dashboard-user-stats', 'User Statistics', 'Learning progress and user stats display', 'dashboard'),
('dashboard-recently-viewed', 'Recently Viewed', 'Recently viewed products section', 'dashboard'),
('dashboard-recommendations', 'Recommendations', 'Personalized product recommendations', 'dashboard'),
('dashboard-analytics', 'Learning Analytics', 'Learning progress analytics and charts', 'dashboard'),
('dashboard-continue-learning', 'Continue Learning', 'Continue learning section with video progress', 'dashboard'),
('dashboard-recent-updates', 'Recent Updates', 'Recently updated content section', 'dashboard')
ON CONFLICT (id) DO NOTHING;

-- Product detail page sections
INSERT INTO app_sections (id, name, description, category) VALUES
('product_summary', 'Product Summary', 'Product overview and summary information', 'product-detail'),
('product_highlights', 'Product Highlights', 'Key highlights and features of products', 'product-detail'),
('product_links', 'Useful Links', 'Product-related useful links and resources', 'product-detail'),
('product_ai', 'AI Assistant', 'Custom GPT links and AI assistance', 'product-detail'),
('product_videos', 'Training Videos', 'Product training videos and learning content', 'product-detail'),
('product_quiz', 'Product Quiz', 'Quiz section for product knowledge testing', 'product-detail'),
('product_notes', 'Personal Notes', 'User personal notes for products', 'product-detail'),
('product_tags', 'Product Tags', 'Product categorization tags', 'product-detail')
ON CONFLICT (id) DO NOTHING;

-- Sales tools sections  
INSERT INTO app_sections (id, name, description, category) VALUES
('sales-tools-generic-objections', 'Generic Objections', 'Common objection handling tools', 'sales-tools'),
('sales-tools-tactical-objections', 'Tactical Objections', 'Specific tactical objection handling', 'sales-tools'),
('sales-tools-flashcards', 'Sales Flashcards', 'Flashcard study interface for sales', 'sales-tools'),
('sales-tools-training-modules', 'Training Modules', 'Sales training module interface', 'sales-tools')
ON CONFLICT (id) DO NOTHING;

-- Navigation and account sections
INSERT INTO app_sections (id, name, description, category) VALUES
('my-account-profile', 'Profile Settings', 'User profile management', 'account'),
('my-account-security', 'Security Settings', 'Password and security management', 'account'),
('my-account-preferences', 'Preferences', 'User preferences and settings', 'account'),
('admin-user-management', 'User Management', 'Admin user management interface', 'admin'),
('admin-permissions', 'Permission Management', 'Permission matrix and role management', 'admin'),
('bookmarks-section', 'Bookmarks', 'User bookmarked products section', 'bookmarks'),
('search-results', 'Search Results', 'Search results display section', 'search'),
('search-by-profile', 'Profile-Based Search', 'Customer profile-based product search', 'search'),
('cmfas-exams', 'CMFAS Exam Section', 'CMFAS examination materials', 'cmfas'),
('cmfas-modules', 'CMFAS Modules', 'CMFAS learning modules', 'cmfas'),
('how-to-use-portal', 'Portal Guide', 'How to use portal information', 'help'),
('onboarding-tutorial', 'Onboarding Tutorial', 'User onboarding and tutorial', 'onboarding'),
('offline-learning', 'Offline Learning', 'Offline learning capabilities', 'learning')
ON CONFLICT (id) DO NOTHING;