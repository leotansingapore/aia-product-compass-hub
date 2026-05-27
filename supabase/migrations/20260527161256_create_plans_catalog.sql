-- plans_catalog: shared inventory of insurance/investment plans (AIA + competitor)
-- consumed by growing-age-calculator policy autocomplete and any other AIA app that needs
-- a canonical list of plans by company.
--
-- Auth model: growing-age users authenticate against a different Supabase project, so
-- they hit this table as `anon`. RLS allows anon SELECT/INSERT/UPDATE; identity is
-- captured in created_by_user_id / created_by_email as text fields (not FKs).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.plans_catalog (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    text NOT NULL,
  plan_name       text NOT NULL,
  plan_type       text,
  brochure_url    text,
  official_url    text,
  ai_summary      text,
  aliases         text[] NOT NULL DEFAULT '{}',
  is_aia          boolean NOT NULL DEFAULT false,
  created_by_user_id text,
  created_by_email   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plans_catalog_company_plan_unique UNIQUE (company_name, plan_name)
);

CREATE INDEX IF NOT EXISTS plans_catalog_company_lower_idx
  ON public.plans_catalog (lower(company_name));
CREATE INDEX IF NOT EXISTS plans_catalog_plan_trgm_idx
  ON public.plans_catalog USING gin (plan_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS plans_catalog_aliases_gin_idx
  ON public.plans_catalog USING gin (aliases);

ALTER TABLE public.plans_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_catalog_select_all" ON public.plans_catalog;
CREATE POLICY "plans_catalog_select_all"
  ON public.plans_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "plans_catalog_insert_all" ON public.plans_catalog;
CREATE POLICY "plans_catalog_insert_all"
  ON public.plans_catalog FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "plans_catalog_update_all" ON public.plans_catalog;
CREATE POLICY "plans_catalog_update_all"
  ON public.plans_catalog FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.set_plans_catalog_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plans_catalog_set_updated_at ON public.plans_catalog;
CREATE TRIGGER plans_catalog_set_updated_at
  BEFORE UPDATE ON public.plans_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.set_plans_catalog_updated_at();
