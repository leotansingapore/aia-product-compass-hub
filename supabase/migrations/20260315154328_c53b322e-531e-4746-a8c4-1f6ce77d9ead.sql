
-- ============================================================
-- SCRIPT DUPLICATE CLEANUP — 5 merges + 5 deletes
-- ============================================================

-- ── MERGE 1 ─────────────────────────────────────────────────
-- "New Agent Announcement — Warm Market Soft Launch" (5404258e)
-- is a DUPLICATE of "Warm Market — Introduction Text (New Consultant)" (7d9f51bd)
-- The "Leo Tan" version is identical to the "Original" version already in 7d9f51bd.
-- No new content to add; just delete the duplicate.
DELETE FROM scripts WHERE id = '5404258e-3f40-4858-b7b6-4eabc4b111a8';

-- ── MERGE 2 ─────────────────────────────────────────────────
-- "Post-Call Text — FB Lead Wants Info Only (No Meeting)" (059a1192) [post-call-text]
-- is near-identical to "Follow-Up Nudge — FB Lead (Pre-Retiree, Called Multiple Times)" (2a53bd9a) [follow-up]
-- The follow-up version is richer (has scheduling ask). Merge the post-call version's content
-- as an additional version labelled "Post-Call: Info Only (No Meeting Set)" then delete 059a1192.
UPDATE scripts
SET versions = versions || jsonb_build_array(jsonb_build_object(
  'author', 'Post-Call: Info Only (No Meeting Set)',
  'content', 'Hello [Name]!

Called you earlier

Just a brief overview of what we can go through:

1) Ways to increase passive income during retirement

2) Ways to reduce unnecessary expenses during retirement

3) How to potentially optimise your CPF and existing resources

Which of these 1), 2), 3) are your retirement concerns?

For more info: http://consult.goldenyearpartners.com/

Worst case is that you get more info and a yakun voucher, and the best case is that we can improve your current situation!'
))
WHERE id = '2a53bd9a-c6b5-4aa3-ac7a-7cbafe149420';
DELETE FROM scripts WHERE id = '059a1192-459f-4d01-be8d-19346483c663';

-- ── MERGE 3 ─────────────────────────────────────────────────
-- "Before Zoom Call — Confirmation Text (Fact-Finding)" (64dc485f) [young-adult]
-- is word-for-word identical to "Pre-Zoom Confirmation Text — Recruitment Leads" (0b53c613) [recruitment]
-- The recruitment version is more polished (formatted with blockquotes). 
-- Widen the recruitment version to also serve young-adult audience, then delete 64dc485f.
UPDATE scripts
SET target_audience = 'general',
    stage = 'Pre-Zoom Confirmation Text — Fact-Finding (All Audiences)',
    tags = ARRAY['confirmation', 'zoom', 'fact-finding', 'recruitment', 'young-adult']
WHERE id = '0b53c613-7d1c-402c-81ea-f19015c8aea0';
DELETE FROM scripts WHERE id = '64dc485f-076f-46ff-b89c-43c958406a92';

-- ── MERGE 4 ─────────────────────────────────────────────────
-- "Post-Call Text — Working Adult Meeting Confirmed" (fb227eeb) [post-call-text]
-- serves the same purpose as "Post-Call Text — Working Adult Consultation Confirmed" (509e7cc0) [confirmation]
-- Merge fb227eeb's Version 1 (MoneyBees angle) into 509e7cc0 as an additional version, then delete fb227eeb.
UPDATE scripts
SET versions = versions || jsonb_build_array(jsonb_build_object(
  'author', 'MoneyBees — TWFPS Angle',
  'content', 'Hello [Name]!

Great chat just now, and I''ve scheduled our meeting to be on:

*Date/Time:*

*Location:*

*Duration:*

Just a brief overview of what we will go through:

✅ Go through key financial concepts from the guidebooks

✅ Go through our TWFPS (total wealth financial planning system) to get clarity on your personal finance

✅ Find your "FYOB" (fire your own boss) number for earlier financial freedom

✅ Explore how these concepts directly apply to your personal circumstances.

For more info: https://books.themoneybees.co/consult

The worst case is that you get more info and resources tailored to your situation, and best case is that you identify some shortfalls and we help you plug those gaps! We can then assess whether a second meeting is necessary.

I''ve reserved the slot on my calendar, do kindly reply this message "ok" to acknowledge 🙏

Looking forward to our chat!'
))
WHERE id = '509e7cc0-4e22-4cd8-ba5a-9f2244cc545b';
DELETE FROM scripts WHERE id = 'fb227eeb-000c-4485-8d26-173596e3c879';

-- ── MERGE 5 ─────────────────────────────────────────────────
-- "Warm Market - Reconnecting & Career Update Calling Script" (94431811) [TAQWA-branded phone script]
-- The reconnecting intro ("Hey ___, we have known each other for a while...")
-- is already present in 4a47650f as Derek Tan's version.
-- Add the TAQWA full calling script as a named version in 4a47650f, then delete 94431811.
UPDATE scripts
SET versions = versions || jsonb_build_array(jsonb_build_object(
  'author', 'TAQWA — Warm Market Calling Script (Full)',
  'title', 'Reconnecting & Career Update — Phone Call (TAQWA)',
  'content', 'MODULE 1.1: WARM MARKET CALLING SCRIPT

**Greetings (Build Rapport)**
*(TIP: Speak SLOWLY and calmly as a friend instead of a telemarketer or a typical sales person! Treat it as another casual call.)*

**Introduction**
"Hey ___ (friend name), we have known each other for a while, but I realised that I''ve never got the opportunity to update you what I am currently up to. Do you have any idea what I''m currently doing?" *(Wait for an answer)*

"Salam ___ (friend name), it''s been some time! I just thought I''d drop a quick call to reconnect. Hope things at work and home are going well!"
By the way.... Do you actually know what I''ve been up to these past few years?"

I recently join TAQWA, have you heard about us before? Through social media or any other platforms...'
))
WHERE id = '4a47650f-f2c9-4ef1-8c32-664736c4995b';
DELETE FROM scripts WHERE id = '94431811-69a1-49bd-ae26-e2fec9fc7272';
