
-- 1. Add columns
ALTER TABLE public.categories
  ADD COLUMN parent_id uuid NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- 2. Self-reference guard
ALTER TABLE public.categories
  ADD CONSTRAINT categories_no_self_parent
  CHECK (parent_id IS NULL OR parent_id <> id);

-- 3. Index for fast tree fetch
CREATE INDEX idx_categories_parent_sort
  ON public.categories (parent_id, sort_order);

-- 4. Trigger function: enforce strict 2-level hierarchy
CREATE OR REPLACE FUNCTION public.enforce_categories_two_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent_parent_id uuid;
  child_count integer;
BEGIN
  -- If this row has a parent, that parent must itself be top-level (no grandchildren)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT parent_id INTO parent_parent_id
    FROM public.categories
    WHERE id = NEW.parent_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent category % does not exist', NEW.parent_id;
    END IF;

    IF parent_parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot nest categories more than 2 levels deep (parent % is itself a sub-category)', NEW.parent_id;
    END IF;
  END IF;

  -- If demoting (was top-level, now becoming a child), ensure no children depend on this row
  IF TG_OP = 'UPDATE'
     AND OLD.parent_id IS NULL
     AND NEW.parent_id IS NOT NULL THEN
    SELECT count(*) INTO child_count
    FROM public.categories
    WHERE parent_id = NEW.id;

    IF child_count > 0 THEN
      RAISE EXCEPTION 'Cannot demote category % to a sub-category because it has % child categor(ies)', NEW.id, child_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_two_level
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.enforce_categories_two_level();

-- 5. Seed: insert Supplementary Products (top-level)
INSERT INTO public.categories (name, description, published, parent_id, sort_order)
VALUES (
  'Supplementary Products',
  'Specialist product lines — investment, endowment, whole life, term, and medical insurance.',
  true,
  NULL,
  20
);

-- 6. Re-parent the 5 product categories under Supplementary Products
WITH parent AS (
  SELECT id FROM public.categories
  WHERE name = 'Supplementary Products' AND parent_id IS NULL
  LIMIT 1
)
UPDATE public.categories c
SET parent_id = parent.id,
    sort_order = v.sort_order
FROM parent,
(VALUES
  ('c7cde8f4-12d4-4ddc-9150-7b32008a4e19'::uuid, 10),
  ('3adb6155-c158-408d-b910-9b3db532d435'::uuid, 20),
  ('19b8c528-f36e-4731-827c-0cdb1de25059'::uuid, 30),
  ('291cf475-d918-40c0-b37d-33794534d469'::uuid, 40),
  ('b1024527-481f-4d85-9192-b43633e9be4a'::uuid, 50)
) AS v(cat_id, sort_order)
WHERE c.id = v.cat_id;

-- 7. Set top-level sort_order for the 3 root categories
UPDATE public.categories SET sort_order = 10
  WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; -- Core Products

UPDATE public.categories SET sort_order = 30
  WHERE id = '5ef0b17f-a19f-4859-8349-3e4959620e94'; -- Supplementary Training
