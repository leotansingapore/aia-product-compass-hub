

## Re-Categorize and Re-Sort All 81 Scripts

After auditing every script, here's what needs to change:

### Current State

| Category | Count |
|----------|-------|
| cold-calling | 20 |
| follow-up | 25 |
| faq | 15 |
| tips | 8 |
| confirmation | 5 |
| ad-campaign | 3 |
| referral | 3 |
| post-meeting | 2 |
| **Total** | **81** |

All 81 scripts already have tags -- no empty tags remain. The issues are:

1. **Misplaced scripts** that belong in different categories
2. **Inconsistent sort_order** values (duplicates, gaps, decimal values like 3.5)
3. **Missing tags on some scripts** that should reflect their lead source or channel

---

### Category Reassignments (7 scripts moving)

| Script | Current Category | New Category | Reason |
|--------|-----------------|--------------|--------|
| Cold Call -- Facebook Ads (Ebook Angle) | ad-campaign | cold-calling | It's a cold call script, not an ad |
| Initial Text -- Qualified Facebook Lead (pre-retiree) | ad-campaign | follow-up | It's a text message sent after lead opts in |
| Initial Text -- Facebook Qualified Lead (Young Adults) | ad-campaign | follow-up | Same -- it's a follow-up text |
| Post-Meeting -- Client Resources & Referral | post-meeting | follow-up | Contains referral ask + resources, fits follow-up flow better |
| Fact-Finding -- Current Situation Questions | faq | faq | Keep (fact-finding is a sub-type of FAQ/discovery) |
| Fact-Finding -- Insurance Coverage Check | faq | faq | Keep |
| Fact-Finding -- Investment Status Check | faq | faq | Keep |

This dissolves the **ad-campaign** category entirely (0 scripts left) and reduces **post-meeting** to 1.

**New counts after reassignment:**

| Category | Count |
|----------|-------|
| follow-up | 28 |
| cold-calling | 21 |
| faq | 15 |
| tips | 8 |
| confirmation | 5 |
| referral | 3 |
| post-meeting | 1 |
| ad-campaign | 0 (remove from UI) |

---

### Sort Order Reset

Re-number every script within each category starting from 1, ordered logically:

**Cold Calling (21 scripts)** -- ordered by audience flow: NSF first, then Young Adults, Working Adults, Pre-Retirees, Cold Leads, Parents, Recruitment

| # | Script | Audience |
|---|--------|----------|
| 1 | Cold Calling -- Original Script | NSF |
| 2 | Cold Calling -- ORD Personnel (Agent Direct Call) | NSF |
| 3 | Cold Call -- NSF Direct (In-Person Meet) | NSF |
| 4 | Cold Call -- NSF Telemarketer (Zoom Meet) | NSF |
| 5 | Cold Calling -- Voucher Leads (Young Adults) | Young Adult |
| 6 | Cold Calling -- Consultant Call (Young Adults) | Young Adult |
| 7 | Cold Calling -- Instagram Ad Lead (Young Adults / NSF) | Young Adult |
| 8 | Cold Calling -- Freebie Lead from Facebook ($20 Voucher) | Young Adult |
| 9 | Cold Call -- Facebook Ads (Ebook Angle) | Young Adult |
| 10 | Cold Calling -- Working Adults (All Angles) | Working Adult |
| 11 | Cold Call -- Working Adults (Existing Agent / Follow-Up) | Cold Lead |
| 12 | Cold Calling -- Policy Optimisation (Working Adults / Cold Leads) | Cold Lead |
| 13 | Cold Calling -- CPF Retirement Changes | Pre-Retiree |
| 14 | Cold Calling -- Facebook Ad Opt-In (CPF eBook) | Pre-Retiree |
| 15 | Cold Calling -- Facebook Voucher Ad Opt-In (Pre-Retirees) | Pre-Retiree |
| 16 | Cold Calling -- Qualified Lead, Non-Voucher (Pre-Retirees) | Pre-Retiree |
| 17 | Cold Calling -- Telemarketer Script for Voucher Leads (Parents) | Parent |
| 18 | Telemarketer -- Young Adults / NSF (All Lead Types) | Young Adult |
| 19 | Telemarketer -- Cold Leads (Multi-Version) | Cold Lead |
| 20 | Telemarketer -- Golden Year Partners (All Lead Types) | Pre-Retiree |
| 21 | Cold Calling -- Recruitment (All Lead Sources) | Recruitment |

**Follow-Up (28 scripts)** -- ordered: Pre-Retiree texts, Recruitment texts, Young Adult texts, Working Adult texts, General texts

| # | Script |
|---|--------|
| 1 | Post-Call Text -- Facebook Ad CPF Lead |
| 2 | Texting Sequence -- Facebook eBook Lead (Pre-Retirees) |
| 3 | Post-Call Text -- FB Lead Wants Info Only |
| 4 | Callback Call -- Pre-Retiree Consultation (Telemarketer Set) |
| 5 | Rescheduling Text -- Pre-Retiree (Missed Session) |
| 6 | Initial Text -- Qualified Facebook Lead |
| 7 | Initial Text -- Facebook Leads (Recruitment) |
| 8 | Post-Call Text -- Recruitment (All Sources) |
| 9 | Post-Call Text -- FB Webinar Leads |
| 10 | Follow-Up Reminder Texts -- Recruitment Leads |
| 11 | Initial Text -- Facebook Qualified Lead (Young Adults) |
| 12 | Initial Text -- Facebook Voucher Lead (Just Opted In) |
| 13 | Missed Call Text -- Facebook Ad Lead |
| 14 | Post-Call Text -- Young Adults (All Angles) |
| 15 | Post-Call Text -- $20 Voucher Freebie Lead |
| 16 | Scheduled Follow-Up Texts -- Young Adults (Every 2 Days) |
| 17 | No-Reply Nudge -- Young Adults (Day 1/3/7) |
| 18 | Reminder Follow-Up -- Young Adults (Gentle/Persistent/Final) |
| 19 | Callback Script -- Consultant Follow-Up Call |
| 20 | Post-Callback WhatsApp -- After Telemarketer Sets Appointment |
| 21 | WhatsApp Message -- Sent During Callback Call |
| 22 | Callback Call -- Working Adult / Parent (Telemarketer Set) |
| 23 | Post-Call Text -- Working Adult Meeting Confirmed |
| 24 | Post-Call Text -- NASA Lucky Draw Lead |
| 25 | Next Steps -- Schedule a Quick Call |
| 26 | Reminder -- 2nd Meeting (All Versions) |
| 27 | Post-Meeting -- Client Resources & Referral |
| 28 | Graceful Close -- Not Interested / End of Conversation |

**FAQ (15 scripts)** -- ordered: quick FAQs first, then comprehensive objection handling, then fact-finding

| # | Script |
|---|--------|
| 1-8 | Individual FAQ questions (company, course, free, etc.) |
| 9 | Objection Handling -- Young Adults (All) |
| 10 | Objection Handling -- NSF (All) |
| 11 | Objection Handling -- Recruitment (Telemarketer) |
| 12 | Objection -- "Not Interested in Insurance" |
| 13-15 | Fact-Finding scripts |

**Confirmation (5)**, **Tips (8)**, **Referral (3)**, **Post-Meeting (1)** -- sequential 1-N within each.

---

### Tag Corrections

Also add missing contextual tags to a few scripts:

| Script | Tags to Add |
|--------|-------------|
| Cold Calling -- Original Script | `young-adult` (it covers both) |
| Post-Meeting -- Client Resources & Referral | `text-message`, `follow-up` |
| Cold Call -- Facebook Ads (Ebook Angle) | `young-adult` |

---

### Implementation

1. **Create a temporary edge function** `bulk-update-scripts` that accepts an array of `{ id, category?, tags?, sort_order? }` objects and runs batch UPDATEs.
2. **Call it once** with all 81 updates (category moves + sort resets + tag fixes).
3. **Verify** update count = 81.
4. **Remove the ad-campaign category** from the UI `categoryLabels` in `ScriptsDatabase.tsx` (or keep it -- it will simply show 0 scripts and auto-hide).
5. **Clean up** -- delete the temporary edge function.

### Technical Details

- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Each update sets `category`, `sort_order`, `tags`, and `updated_at = now()`
- No schema changes needed

