
-- Step 1: Drop old CHECK constraint
ALTER TABLE public.user_access_tiers DROP CONSTRAINT IF EXISTS valid_tier_level;

-- Step 2: Migrate existing data
UPDATE public.user_access_tiers SET tier_level = 'papers_taker' WHERE tier_level = 'level_1';
UPDATE public.user_access_tiers SET tier_level = 'post_rnf'     WHERE tier_level = 'level_2';
UPDATE public.user_access_tiers SET tier_level = 'explorer'     WHERE tier_level NOT IN ('explorer', 'papers_taker', 'post_rnf');

-- Step 3: Change column default
ALTER TABLE public.user_access_tiers ALTER COLUMN tier_level SET DEFAULT 'explorer';

-- Step 4: Add new CHECK constraint
ALTER TABLE public.user_access_tiers
  ADD CONSTRAINT valid_tier_level
  CHECK (tier_level IN ('explorer', 'papers_taker', 'post_rnf'));

-- Step 5: Create trigger to auto-assign explorer tier on new profile
CREATE OR REPLACE FUNCTION public.handle_new_profile_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_access_tiers (user_id, tier_level)
  VALUES (NEW.user_id, 'explorer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_assign_tier ON public.profiles;
CREATE TRIGGER on_profile_created_assign_tier
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_tier();

-- Step 6: Clean up RLS — drop existing policies and recreate cleanly
DROP POLICY IF EXISTS "Users can view their own access tier" ON public.user_access_tiers;
DROP POLICY IF EXISTS "Admins can view all access tiers"     ON public.user_access_tiers;
DROP POLICY IF EXISTS "Admins can manage access tiers"       ON public.user_access_tiers;

-- Users read own row
CREATE POLICY "Users can view own tier"
  ON public.user_access_tiers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Admins full access
CREATE POLICY "Admins manage all tiers"
  ON public.user_access_tiers FOR ALL
  TO authenticated
  USING  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));
