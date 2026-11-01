-- Product facts 2026-11-02: HealthShield Gold Max riders and the deductible rule, on both products rows
-- (healthshield-gold-max, core-healthshield-gold-max). Not yet run.
--
-- Why: the product chat always reads the products row, and since dbe8a303 it answers with the row and the
-- lessons over a lecture transcript. The HSG Max lectures still teach Max VitalHealth A ("zero deductible on the
-- first private-hospital claim"), which AIA stopped selling in March 2026, and the transcripts cannot be edited.
-- These two highlights put the current riders and the deductible rule in the row itself.
--
-- How to run: Supabase SQL editor or the Management API SQL endpoint. Run the select first and read both rows.
-- The update fires only while highlights still equal the seed array below, and returns the rows it changed.
-- The seed array comes from the migrations, not from a live read (this file was written without touching the
-- database): supabase/migrations/20250708030731-aa6b093c-2012-4c6a-8018-513e00aee64e.sql:89 seeds it on
-- healthshield-gold-max, 20260412070148_96d7fb93-712c-4fba-ab7d-ee0a44eb41c2.sql:10-20 copies it onto
-- core-healthshield-gold-max, and no later migration changes either row's highlights. If the select shows
-- anything else (an admin edit), the update changes nothing: rebase the guard on what the select shows.
--
-- Sources, Financial Presenter (leotansingapore/growing-age-calculator, main at 9bacb40c, read 2026-11-02):
--   Highlight 1, the riders:
--     - Pro A for Plan A, Pro B for Plan B, Pro B Lite for Plan B Lite, "Current":
--       src/components/twfps/planKnowledge.data.ts:63-65; names also src/components/twfps/hsgQuote.ts:49-53.
--     - Max VitalHealth A, A Value, B and B Lite "Sold till Mar 2026": src/components/twfps/planKnowledge.data.ts:66-69.
--       A Value "withdrawn in Mar 2026": src/components/twfps/hsgQuote.ts:45.
--     - Pro A is the current rider and VitalHealth A the previous one: src/lib/hsgClaims.ts:7,12.
--     - "riders sold from 1 Apr 2026": src/data/ipFeatureComparison.ts:179-197 (category of every row).
--   Highlight 2, the deductible rule:
--     - Deductible not covered by the rider: src/data/ipFeatureComparison.ts:195-196 (AIA "Not covered");
--       src/lib/hsgClaims.ts:7-8 ("The rider does NOT absorb the deductible").
--     - 5% co-payment: src/data/ipFeatureComparison.ts:181-182; src/lib/hsgClaims.ts:38.
--     - Capped at S$6,000 a policy year: src/data/ipFeatureComparison.ts:185-186; src/lib/hsgClaims.ts:8,39.
--     - The cap applies only with an AIA Preferred Provider, a pre-authorisation or an A&E-referred emergency:
--       src/data/ipFeatureComparison.ts:189-192; src/lib/hsgClaims.ts:9-11.

select id, title, highlights, updated_at from public.products
where id in ('healthshield-gold-max', 'core-healthshield-gold-max')
order by id;

update public.products set
  highlights = highlights || array[
    'Riders sold from 1 April 2026: AIA Max VitalHealth Pro A for Plan A, Pro B for Plan B and Pro B Lite for Plan B Lite. Max VitalHealth A, A Value, B and B Lite were sold until March 2026',
    'Riders sold from 1 April 2026 do not cover the deductible: the client pays the deductible, then a 5% co-payment. The co-payment is capped at S$6,000 a policy year only when treatment is by an AIA Preferred Provider, is pre-authorised, or is emergency treatment after an A&E referral'
  ]::text[],
  updated_at = now()
where id in ('healthshield-gold-max', 'core-healthshield-gold-max')
  and highlights = array[
    'Cashless treatment at panel hospitals',
    'Worldwide emergency coverage',
    'No claim bonus benefits',
    'Pre and post hospitalization coverage'
  ]::text[]
returning id, highlights;
-- Expect 2 rows. 0 rows: the live highlights differ from the seed; nothing changed. Re-running after a
-- successful run also changes nothing, because the highlights no longer equal the seed array.
