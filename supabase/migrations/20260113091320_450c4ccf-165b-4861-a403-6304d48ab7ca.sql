
-- Migration: Migrate legacy product slugs to SEO-friendly format and cleanup duplicates

-- Phase 1: Migrate 6 legacy product slugs

-- 1. General Flow
UPDATE public.learning_progress SET product_id = 'general-flow' WHERE product_id = 'module-1756450970521-feyzzys9f';
UPDATE public.video_progress SET product_id = 'general-flow' WHERE product_id = 'module-1756450970521-feyzzys9f';
UPDATE public.user_bookmarks SET product_id = 'general-flow' WHERE product_id = 'module-1756450970521-feyzzys9f';
UPDATE public.user_notes SET product_id = 'general-flow' WHERE product_id = 'module-1756450970521-feyzzys9f';
UPDATE public.products SET id = 'general-flow' WHERE id = 'module-1756450970521-feyzzys9f';

-- 2. Debrief Flow
UPDATE public.learning_progress SET product_id = 'debrief-flow' WHERE product_id = 'module-1756450999855-7p5t33qzy';
UPDATE public.video_progress SET product_id = 'debrief-flow' WHERE product_id = 'module-1756450999855-7p5t33qzy';
UPDATE public.user_bookmarks SET product_id = 'debrief-flow' WHERE product_id = 'module-1756450999855-7p5t33qzy';
UPDATE public.user_notes SET product_id = 'debrief-flow' WHERE product_id = 'module-1756450999855-7p5t33qzy';
UPDATE public.products SET id = 'debrief-flow' WHERE id = 'module-1756450999855-7p5t33qzy';

-- 3. Warm Market Flow
UPDATE public.learning_progress SET product_id = 'warm-market-flow' WHERE product_id = 'module-1756451022088-mpmm9icya';
UPDATE public.video_progress SET product_id = 'warm-market-flow' WHERE product_id = 'module-1756451022088-mpmm9icya';
UPDATE public.user_bookmarks SET product_id = 'warm-market-flow' WHERE product_id = 'module-1756451022088-mpmm9icya';
UPDATE public.user_notes SET product_id = 'warm-market-flow' WHERE product_id = 'module-1756451022088-mpmm9icya';
UPDATE public.products SET id = 'warm-market-flow' WHERE id = 'module-1756451022088-mpmm9icya';

-- 4. Pay Protector
UPDATE public.learning_progress SET product_id = 'pay-protector' WHERE product_id = 'module-1756880094263-prje9luku';
UPDATE public.video_progress SET product_id = 'pay-protector' WHERE product_id = 'module-1756880094263-prje9luku';
UPDATE public.user_bookmarks SET product_id = 'pay-protector' WHERE product_id = 'module-1756880094263-prje9luku';
UPDATE public.user_notes SET product_id = 'pay-protector' WHERE product_id = 'module-1756880094263-prje9luku';
UPDATE public.products SET id = 'pay-protector' WHERE id = 'module-1756880094263-prje9luku';

-- 5. Premier Disability Cover
UPDATE public.learning_progress SET product_id = 'premier-disability-cover' WHERE product_id = 'module-1756880306515-41nc94uxg';
UPDATE public.video_progress SET product_id = 'premier-disability-cover' WHERE product_id = 'module-1756880306515-41nc94uxg';
UPDATE public.user_bookmarks SET product_id = 'premier-disability-cover' WHERE product_id = 'module-1756880306515-41nc94uxg';
UPDATE public.user_notes SET product_id = 'premier-disability-cover' WHERE product_id = 'module-1756880306515-41nc94uxg';
UPDATE public.products SET id = 'premier-disability-cover' WHERE id = 'module-1756880306515-41nc94uxg';

-- 6. Platinum Retirement Elite
UPDATE public.learning_progress SET product_id = 'platinum-retirement-elite' WHERE product_id = 'module-1756880449474-rgxxj4kx0';
UPDATE public.video_progress SET product_id = 'platinum-retirement-elite' WHERE product_id = 'module-1756880449474-rgxxj4kx0';
UPDATE public.user_bookmarks SET product_id = 'platinum-retirement-elite' WHERE product_id = 'module-1756880449474-rgxxj4kx0';
UPDATE public.user_notes SET product_id = 'platinum-retirement-elite' WHERE product_id = 'module-1756880449474-rgxxj4kx0';
UPDATE public.products SET id = 'platinum-retirement-elite' WHERE id = 'module-1756880449474-rgxxj4kx0';

-- Phase 2: Delete 5 duplicate products and their orphaned data

-- Delete orphaned progress data first
DELETE FROM public.learning_progress 
WHERE product_id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);

DELETE FROM public.video_progress 
WHERE product_id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);

DELETE FROM public.user_bookmarks
WHERE product_id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);

DELETE FROM public.user_notes
WHERE product_id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);

DELETE FROM public.quiz_attempts
WHERE product_id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);

-- Then delete the duplicate products
DELETE FROM public.products 
WHERE id IN (
  'module-1757938757256-h64r4yuu0',
  'module-1758266631016-n7jff6ewh',
  'module-1759490805756-i6duglldb',
  'module-1759491941845-w3co71e10',
  'module-1768287739132-2d3gugx5c'
);
