-- Remove non-product categories
DELETE FROM public.categories 
WHERE name IN ('Objection Handling', 'Product Knowledge');