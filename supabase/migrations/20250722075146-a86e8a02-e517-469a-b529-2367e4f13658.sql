-- Create CMFAS category first
INSERT INTO categories (name, description) 
VALUES ('CMFAS Modules', 'Capital Markets and Financial Advisory Services examination modules');

-- Insert M9 module product
INSERT INTO products (
    id, 
    title, 
    description, 
    category_id,
    training_videos,
    useful_links,
    custom_gpt_link,
    tags,
    highlights
) VALUES (
    'm9-module',
    'CMFAS M9 Module', 
    'Life Insurance & Investment-Linked Policies',
    (SELECT id FROM categories WHERE name = 'CMFAS Modules'),
    '[
        {
            "id": "m9-intro",
            "title": "M9 Introduction & Overview", 
            "description": "Introduction to life insurance and exam structure",
            "url": "/lectures/m9-intro.mp4",
            "duration": 1800,
            "order": 0,
            "category": "Introduction"
        },
        {
            "id": "m9-risk-insurance",
            "title": "Risk and Life Insurance",
            "description": "Understanding risk concepts and life insurance fundamentals", 
            "url": "/lectures/m9-risk-insurance.mp4",
            "duration": 2400,
            "order": 1,
            "category": "Core Concepts"
        },
        {
            "id": "m9-premium-setting", 
            "title": "Setting Life Insurance Premium",
            "description": "Premium calculation methods and factors",
            "url": "/lectures/m9-premium-setting.mp4", 
            "duration": 2100,
            "order": 2,
            "category": "Core Concepts"
        },
        {
            "id": "m9-traditional-products",
            "title": "Traditional Life Insurance Products",
            "description": "Overview of traditional life insurance products",
            "url": "/lectures/m9-traditional-products.mp4",
            "duration": 2700, 
            "order": 3,
            "category": "Products"
        },
        {
            "id": "m9-investment-linked",
            "title": "Investment-Linked Policies", 
            "description": "Understanding ILPs and their features",
            "url": "/lectures/m9-investment-linked.mp4",
            "duration": 3000,
            "order": 4, 
            "category": "Products"
        }
    ]'::jsonb,
    '[
        {
            "id": "m9-study-guide",
            "name": "Official M9 Study Guide", 
            "url": "https://example.com/m9-study-guide",
            "description": "Comprehensive study guide for M9 exam",
            "icon": "Book"
        },
        {
            "id": "m9-practice-questions",
            "name": "M9 Practice Questions",
            "url": "https://example.com/m9-practice", 
            "description": "Practice questions and mock exams",
            "icon": "FileQuestion"
        },
        {
            "id": "m9-regulations",
            "name": "MAS Life Insurance Regulations",
            "url": "https://mas.gov.sg",
            "description": "Latest regulations and guidelines", 
            "icon": "Scale"
        }
    ]'::jsonb,
    'https://chatgpt.com/g/g-example-m9',
    ARRAY['CMFAS', 'M9', 'Life Insurance', 'Investment Linked'],
    ARRAY['Comprehensive exam preparation', 'Industry-relevant content', 'Interactive learning modules']
);