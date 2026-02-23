

## Bulk Tag All 54 Untagged Scripts

There are **81 scripts** in the database. **27 already have tags**, and **54 are missing tags**. This plan will add contextually appropriate tags to every untagged script using the `seed-scripts` edge function (or direct updates).

### Approach

Create a one-time edge function (`bulk-tag-scripts`) that accepts a mapping of `{ id: string, tags: string[] }` entries and runs batch `UPDATE` statements. This avoids 54 individual API calls.

### Tag Assignments

Below is the complete tagging for all 54 untagged scripts, organized by category:

**Ad Campaign (3 scripts)**

| Script | Tags |
|--------|------|
| Initial Text -- Qualified Facebook Lead (pre-retiree) | `facebook-ad`, `qualified-lead`, `text-message`, `cpf` |
| Initial Text -- Facebook Qualified Lead (Young Adults) | `facebook-ad`, `qualified-lead`, `text-message` |
| Cold Call -- Facebook Ads (Ebook Angle) | `facebook-ad`, `ebook`, `cold-call` |

**Cold Calling (9 scripts)**

| Script | Tags |
|--------|------|
| Cold Call -- Working Adults (Existing Agent / Follow-Up) | `cold-call`, `follow-up`, `existing-agent` |
| Cold Calling -- Policy Optimisation (Working Adults / Cold Leads) | `cold-call`, `policy-review` |
| Cold Calling -- ORD Personnel (Agent Direct Call) | `cold-call`, `nsf`, `ord` |
| Cold Calling -- Voucher Leads (Young Adults) | `cold-call`, `voucher` |
| Cold Calling -- Consultant Call (Young Adults) | `cold-call`, `consultation` |
| Cold Calling -- Instagram Ad Lead (Young Adults / NSF) | `cold-call`, `instagram-ad` |
| Cold Calling -- Freebie Lead from Facebook ($20 Voucher) | `cold-call`, `voucher`, `facebook-ad` |
| Cold Calling -- Telemarketer Script for Voucher Leads (Parents) | `cold-call`, `voucher`, `family` |
| Cold Call -- NSF Direct (In-Person Meet) | `cold-call`, `nsf`, `in-person` |
| Cold Call -- NSF Telemarketer (Zoom Meet) | `cold-call`, `nsf`, `zoom` |

**Confirmation (3 scripts)**

| Script | Tags |
|--------|------|
| Post-Call Text -- Working Adult Consultation Confirmed | `confirmation`, `text-message` |
| Appointment Reminder Texts -- Young Adults (D-7/D-1/Day Of) | `confirmation`, `reminder`, `text-message` |
| Before Zoom Call -- Confirmation Text (Fact-Finding) | `confirmation`, `zoom`, `fact-finding` |

**FAQ (14 scripts)**

| Script | Tags |
|--------|------|
| Which company are you from? | `faq`, `objection-handling` |
| Why do I need a Zoom call? | `faq`, `objection-handling`, `zoom` |
| What type of business is The Moneybees Academy? | `faq`, `objection-handling`, `moneybees` |
| What's this course about? | `faq`, `objection-handling`, `free-course` |
| Is this really free? | `faq`, `objection-handling`, `free-course` |
| How long is the course? | `faq`, `objection-handling`, `free-course` |
| Do I need a lot of money to start? | `faq`, `objection-handling` |
| Are you going to sell me something? | `faq`, `objection-handling` |
| Objection Handling -- Young Adults (All Objections) | `objection-handling`, `comprehensive` |
| Objection Handling -- NSF (All Objections) | `objection-handling`, `nsf`, `comprehensive` |
| Fact-Finding -- Current Situation Questions | `fact-finding`, `discovery` |
| Fact-Finding -- Insurance Coverage Check | `fact-finding`, `insurance` |
| Fact-Finding -- Investment Status Check | `fact-finding`, `investment` |
| Objection -- "Not Interested in Insurance" | `objection-handling`, `insurance` |

**Follow-Up (15 scripts)**

| Script | Tags |
|--------|------|
| Rescheduling Text -- Pre-Retiree (Missed Session) | `follow-up`, `reschedule`, `text-message` |
| Callback Call -- Working Adult / Parent (Telemarketer Set) | `callback`, `follow-up` |
| Missed Call Text -- Facebook Ad Lead | `follow-up`, `missed-call`, `facebook-ad`, `text-message` |
| Initial Text -- Facebook Voucher Lead (Just Opted In) | `text-message`, `voucher`, `facebook-ad` |
| Post-Call Text -- $20 Voucher Freebie Lead | `post-call`, `voucher`, `text-message` |
| Scheduled Follow-Up Texts -- Young Adults (Every 2 Days) | `follow-up`, `text-sequence`, `text-message` |
| Callback Script -- Consultant Follow-Up Call | `callback`, `follow-up` |
| Post-Call Text -- Working Adult Meeting Confirmed | `post-call`, `text-message`, `confirmation` |
| Post-Callback WhatsApp -- After Telemarketer Sets Appointment | `whatsapp`, `callback`, `text-message` |
| WhatsApp Message -- Sent During Callback Call | `whatsapp`, `callback`, `text-message` |
| Next Steps -- Schedule a Quick Call | `follow-up`, `scheduling` |
| Post-Call Text -- NASA Lucky Draw Lead | `post-call`, `text-message`, `lucky-draw` |
| Graceful Close -- Not Interested / End of Conversation | `follow-up`, `closing`, `graceful-exit` |
| Reminder -- 2nd Meeting (All Versions) | `reminder`, `follow-up`, `2nd-meeting` |

**Post-Meeting (1 script)**

| Script | Tags |
|--------|------|
| Post-Zoom Follow-Up -- Young Adults After Consultation | `post-meeting`, `resources`, `referral`, `socials` |

**Referral (1 script)**

| Script | Tags |
|--------|------|
| Referral Request -- Young Adults | `referral`, `text-message` |

**Tips (8 scripts)**

| Script | Tags |
|--------|------|
| Calling Tips & Best Practices | `tips`, `best-practices`, `calling` |
| Callback Checklist -- Step-by-Step Guide | `tips`, `checklist`, `callback` |
| Double Your Calling Power -- Two-Phone Strategy | `tips`, `productivity`, `two-phone` |
| Google Calendar Tips -- Scheduling Best Practices | `tips`, `scheduling`, `productivity` |
| General Calling Tips & Tonality | `tips`, `tonality`, `calling` |
| Phrasing Tips -- What to Avoid & What to Say Instead | `tips`, `phrasing`, `communication` |
| Physical Voucher Procedure & Lead Follow-Up | `tips`, `voucher`, `procedure` |
| FYC Formula -- Calling Rate & Activity Math | `tips`, `fyc`, `activity-math` |

### Implementation

1. **Create a temporary edge function** `bulk-tag-scripts` that accepts an array of `{ id, tags }` objects and runs batch UPDATE queries on the `scripts` table.
2. **Call the function** with all 54 tag assignments above in a single request.
3. **Verify** the update count matches 54.
4. **Clean up** by removing the temporary edge function and its `config.toml` entry.

### Technical Details

- The function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Each update sets `tags = $tags, updated_at = now()` for the given ID
- No schema changes needed -- the `tags` column already exists as `text[]`

