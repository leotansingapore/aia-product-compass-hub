-- Insert missing app sections for all pages in APP_STRUCTURE
INSERT INTO public.app_sections (id, name, description, category) VALUES
-- Dashboard sections
('user-stats', 'User Stats', 'XP, level, streak, achievements', 'dashboard'),
('search-section', 'Search Section', 'Main search interface', 'dashboard'),
('quick-actions', 'Quick Actions', 'Profile search and shortcuts', 'dashboard'),
('product-categories', 'Product Categories', 'Category grid', 'dashboard'),
('recently-viewed', 'Recently Viewed', 'Recent activity', 'dashboard'),
('recommendations', 'Recommendations', 'AI-powered suggestions', 'dashboard'),

-- Search sections
('search-interface', 'Search Interface', 'Advanced search with filters', 'search'),
('search-results', 'Search Results', 'Product and content results', 'search'),
('search-history', 'Search History', 'Previous searches', 'search'),

-- Bookmarks sections
('bookmarks-list', 'Bookmarks List', 'Saved products and content', 'bookmarks'),
('bookmark-categories', 'Bookmark Categories', 'Organized bookmark groups', 'bookmarks'),

-- CMFAS Exams sections
('exam-modules', 'Exam Modules', 'Available CMFAS modules', 'cmfas-exams'),
('practice-tests', 'Practice Tests', 'Mock exams and quizzes', 'cmfas-exams'),
('study-materials', 'Study Materials', 'PDFs, videos, flashcards', 'cmfas-exams'),
('progress-tracking', 'Progress Tracking', 'Study progress and analytics', 'cmfas-exams'),

-- Sales Tools sections
('presentation-tools', 'Presentation Tools', 'Sales presentations and calculators', 'sales-tools'),
('client-profiling', 'Client Profiling', 'Customer analysis tools', 'sales-tools'),
('proposal-generators', 'Proposal Generators', 'Automated proposal creation', 'sales-tools'),

-- My Account sections
('profile-settings', 'Profile Settings', 'Personal information and preferences', 'my-account'),
('learning-analytics', 'Learning Analytics', 'Progress and performance insights', 'my-account'),
('achievements', 'Achievements', 'Badges and accomplishments', 'my-account'),
('account-security', 'Account Security', 'Password and security settings', 'my-account'),

-- Admin Panel sections
('user-management', 'User Management', 'Manage users and roles', 'admin-panel'),
('content-management', 'Content Management', 'Edit products and content', 'admin-panel'),
('analytics-dashboard', 'Analytics Dashboard', 'Platform usage analytics', 'admin-panel'),
('system-settings', 'System Settings', 'Global configuration', 'admin-panel'),

-- Search by Client Profile sections (NEW)
('client-profile-search', 'Client Profile Search', 'Search products by client demographics', 'search-by-profile'),
('profile-filters', 'Profile Filters', 'Age, income, risk tolerance filters', 'search-by-profile'),
('recommendation-engine', 'Recommendation Engine', 'AI-powered product suggestions', 'search-by-profile'),

-- Product Categories sections
('category-overview', 'Category Overview', 'Category description and stats', 'product-categories'),
('product-filters', 'Product Filters', 'Search and tag filters', 'product-categories'),
('product-grid', 'Product Grid', 'List of products in category', 'product-categories'),

-- Product Detail sections
('product-summary', 'Product Summary', 'Basic product information', 'product-detail'),
('key-highlights', 'Key Highlights', 'Important features and benefits', 'product-detail'),
('training-videos', 'Training Videos', 'Educational content', 'product-detail'),
('useful-links', 'Useful Links', 'PDFs, brochures, external links', 'product-detail'),
('ai-assistant', 'AI Assistant', 'Custom GPT integration', 'product-detail'),
('personal-notes', 'Personal Notes', 'User''s private notes', 'product-detail'),
('quiz-section', 'Quiz Section', 'Knowledge assessment', 'product-detail')

-- Handle conflicts by doing nothing if the section already exists
ON CONFLICT (id) DO NOTHING;