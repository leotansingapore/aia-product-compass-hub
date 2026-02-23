
-- Phase 1: Move post-meeting script into follow-up with post-meeting tag
UPDATE scripts 
SET category = 'follow-up', 
    tags = array_append(COALESCE(tags, '{}'), 'post-meeting'),
    sort_order = 29
WHERE id = '4cb8dd9a-cd29-4ad7-8c58-081daaa23ad4';

-- Phase 1: Move warm-market tip entries to tips category with warm-market tag
UPDATE scripts 
SET category = 'tips',
    tags = array_append(COALESCE(tags, '{}'), 'warm-market')
WHERE id IN (
  '594ff804-146c-49ae-aa9a-03136650e856', -- Warm Market Outreach — Tips & Mindset
  '8cb237a1-d719-4f59-88b3-5ebca081c034', -- Warm Market — What NOT to Do  
  'b99d62bc-9173-4949-bd9b-224387623ff5'  -- Texting EQ — Extra Success Pointers
);

-- Phase 2: Tag follow-up scripts with stage_type

-- initial-text tags
UPDATE scripts SET tags = array_append(COALESCE(tags, '{}'), 'initial-text')
WHERE id IN (
  '6c299eb0-da74-4712-bbec-8a2ba38114f3', -- Initial Text — Facebook Qualified Lead (Young Adults)
  '8433b860-7444-4a07-a2c2-c66bacb5b8d3', -- Initial Text — Facebook Voucher Lead
  '7fd5f0a0-d50e-4d6a-a0be-946d25bfdc49', -- Initial Text — Facebook Leads (Recruitment)
  '00d64a23-61c4-4e60-90dd-a5772262f15f'  -- Initial Text — Qualified Facebook Lead (pre-retiree)
)
AND NOT ('initial-text' = ANY(COALESCE(tags, '{}')));

-- post-call tags
UPDATE scripts SET tags = array_append(COALESCE(tags, '{}'), 'post-call')
WHERE id IN (
  '4c786d33-6c1b-4abe-aa29-27842dbec65e', -- Post-Call Text — Facebook Ad CPF Lead
  '059a1192-459f-4d01-be8d-19346483c663', -- Post-Call Text — FB Lead Wants Info Only
  '2ccff6e6-3f52-4d66-9e0c-6f47730b90d2', -- Post-Call Text — Recruitment
  'da69b2e6-dee5-4e30-b388-6f95e686b6db', -- Post-Call Text — FB Webinar Leads
  '86033920-417c-4611-82ed-ff778621bacf', -- Post-Call Text — Young Adults
  'ca109b93-179e-44c7-87d6-8be09da552dd', -- Post-Call Text — $20 Voucher
  'fb227eeb-000c-4485-8d26-173596e3c879', -- Post-Call Text — Working Adult Meeting Confirmed
  '8ddac859-0f9e-4ddb-ab14-7f15de81d8b0', -- Post-Callback WhatsApp
  '2f2b6e87-51a9-49ed-b793-7f4e1c55f99b'  -- WhatsApp Message — During Callback
)
AND NOT ('post-call' = ANY(COALESCE(tags, '{}')));

-- callback tags
UPDATE scripts SET tags = array_append(COALESCE(tags, '{}'), 'callback')
WHERE id IN (
  'b9935127-356b-4a76-8590-27b61cc7c9cb', -- Callback Call — Pre-Retiree
  'bb1578ad-57c0-4c33-84d1-d854d126ba3a', -- Callback Script — Consultant (Young Adults)
  'abfd8fea-3e17-4b28-b01b-5e689f3ce561'  -- Callback Call — Working Adult / Parent
)
AND NOT ('callback' = ANY(COALESCE(tags, '{}')));

-- reminder-sequence tags
UPDATE scripts SET tags = array_append(COALESCE(tags, '{}'), 'reminder-sequence')
WHERE id IN (
  '44bb7f60-da42-4f2a-9293-a20f851647cf', -- Texting Sequence — Facebook eBook Lead
  'ca1c05dc-0416-48f9-bcfa-f610a8261743', -- Follow-Up Reminder Texts — Recruitment
  '8cfc1684-2a41-4dec-9846-bdc216f13c3b', -- Scheduled Follow-Up Texts — Young Adults
  'bdeb4745-292a48ae-8c4f-5a5e2f470cc5',  -- No-Reply Nudge — Young Adults
  '1b215279-dbc5-43c6-90c0-3287d95b168b'  -- Reminder Follow-Up — Young Adults
)
AND NOT ('reminder-sequence' = ANY(COALESCE(tags, '{}')));

-- closing tags (graceful close / post-meeting)
UPDATE scripts SET tags = array_append(COALESCE(tags, '{}'), 'closing')
WHERE id IN (
  '2942b63f-c3ee-48ad-9194-7d7b212e8360'  -- Missed Call Text
)
AND NOT ('closing' = ANY(COALESCE(tags, '{}')));
