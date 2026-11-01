-- Product facts alignment 2026-11-01: products and objection_responses rows (approved by Leo, not yet run).
-- Run AFTER the knowledge re-sync (scripts/sync-curriculum-knowledge.mjs), through the Supabase Management API
-- SQL endpoint or the SQL editor. Run the select first and read the rows. Each update only fires while the
-- old seed text is still there, and returns the rows it changed.
-- Source of each fact: docs/product-facts-alignment-2026-11-01.md, section 3. Leo's 2026-11-01 rulings
-- (Pro Achiever special bonus, HSG Max A tiered limit, MediShield Life pro-ration) change none of it.

select id, title, description, highlights, tags from public.products
where id in ('guaranteed-protect-plus','core-guaranteed-protect-plus','ultimate-critical-cover','core-ultimate-critical-cover',
 'solitaire-pa','core-solitaire-pa','platinum-wealth-venture','core-platinum-wealth-venture','pro-achiever','core-pro-achiever',
 'healthshield-gold-max','core-healthshield-gold-max','pro-lifetime-protector','core-pro-lifetime-protector');

-- GPP: "dividends" -> non-guaranteed bonuses (Presenter src/data/gppFeatureComparison.ts:229)
update public.products set
  highlights = array_replace(highlights, 'Participating policy with dividends', 'Participating policy with non-guaranteed bonuses; annual bonuses become guaranteed once declared'),
  tags = array_replace(tags, 'Dividends', 'Bonuses'), updated_at = now()
where id in ('guaranteed-protect-plus','core-guaranteed-protect-plus')
  and ('Participating policy with dividends' = any(highlights) or 'Dividends' = any(tags))
returning id, highlights, tags;

-- UCC: "100+ critical illnesses" -> 150 conditions / 73 major CIs; the waiver is a rider (Presenter src/data/uccFeatureComparison.ts:61,224)
update public.products set
  highlights = array_replace(array_replace(highlights,
    'Coverage for 100+ critical illnesses', 'Covers 150 medical conditions, with 73 critical illnesses at major stage'),
    'Premium waiver benefit', 'Optional premium waiver riders'), updated_at = now()
where id in ('ultimate-critical-cover','core-ultimate-critical-cover')
  and ('Coverage for 100+ critical illnesses' = any(highlights) or 'Premium waiver benefit' = any(highlights))
returning id, highlights;

-- Solitaire PA: weekly income and disability care are optional benefits (Presenter src/data/paFeatureComparison.ts:172,185)
update public.products set
  highlights = array_replace(highlights, 'Disability income benefits', 'Optional weekly income and monthly disability care benefits'), updated_at = now()
where id in ('solitaire-pa','core-solitaire-pa') and 'Disability income benefits' = any(highlights)
returning id, highlights;

-- PWV: the overview names no version or terms (an addition rather than a fix; the chat always includes this row)
update public.products set
  description = 'AIA Platinum Wealth Venture 3.0: a whole-life investment-linked plan with a 5-year premium term from S$18,000 a year, also offered as a 2-year term from S$48,000 a year or a 1-year single premium from S$15,000 paid from SRS',
  updated_at = now()
where id in ('platinum-wealth-venture','core-platinum-wealth-venture')
  and description = 'Premium investment solution for high net worth individuals'
returning id, description;

-- Not a products row, but chat-visible seed (supabase/migrations/20260223090927_ba748ee9-27e3-4ce4-935e-fb1c25cd47ae.sql:143):
-- MediShield Life annual limit $150K -> $200K (Presenter src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:683)
update public.objection_responses
set content = replace(content, '| Annual claim limit | $150K | $1M+ |', '| Annual claim limit | $200K | $1M+ |')
where content like '%| Annual claim limit | $150K | $1M+ |%' returning id;
