-- Insert M9A module product
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
    'm9a-module',
    'CMFAS M9A Module', 
    'Life Insurance Policies and Practices (Advanced)',
    (SELECT id FROM categories WHERE name = 'CMFAS Modules'),
    '[]'::jsonb,
    '[]'::jsonb,
    '',
    ARRAY['CMFAS', 'M9A', 'Life Insurance', 'Advanced'],
    ARRAY['Advanced life insurance concepts', 'Industry best practices', 'Regulatory compliance']
);

-- Insert HI module product
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
    'hi-module',
    'CMFAS HI Module', 
    'Health Insurance',
    (SELECT id FROM categories WHERE name = 'CMFAS Modules'),
    '[]'::jsonb,
    '[]'::jsonb,
    '',
    ARRAY['CMFAS', 'HI', 'Health Insurance', 'Medical'],
    ARRAY['Health insurance fundamentals', 'Medical underwriting', 'Claims management']
);

-- Insert RES5 module product
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
    'res5-module',
    'CMFAS RES5 Module', 
    'Rules and Regulations for Financial Advisory Services',
    (SELECT id FROM categories WHERE name = 'CMFAS Modules'),
    '[]'::jsonb,
    '[]'::jsonb,
    '',
    ARRAY['CMFAS', 'RES5', 'Regulations', 'Compliance'],
    ARRAY['Regulatory framework', 'Compliance requirements', 'Professional conduct']
);