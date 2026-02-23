

## Scripts Database Consolidation Plan -- Round 2

### Overview

After analyzing all 102 scripts, I've identified **7 consolidation groups** that will merge **28 separate entries into 7**, reducing the total count from **102 to 81** and making search/comparison significantly easier.

---

### Consolidation Groups

#### Group 1: Young Adult Telemarketer Cold Calls (3 to 1)
These three scripts have **nearly identical openings and structure** -- only the lead source (guidebook vs voucher vs freebie) differs slightly.

| Script to Merge | Current Stage |
|---|---|
| `d02251cc` | Telemarketer Script for Guidebook Leads (YA/NSF) |
| `fc8bc306` | Telemarketer Script for Voucher Leads (YA/NSF) |
| `c8970294` | Telemarketer -- Freebie Voucher Leads (Short Call) |

**New title:** "Telemarketer -- Young Adults / NSF (All Lead Types)"

---

#### Group 2: Young Adult Objection Handling (6 to 1)
Individual Q&A objections that belong together as a single reference card.

| Script to Merge | Current Stage |
|---|---|
| `261243b2` | "Can You Send Me More Details First?" |
| `3cdd7ab8` | "I'm Not Interested" |
| `eb66c9e5` | "Is This Compulsory?" |
| `4c74a235` | "Not Sure If I'm Free" |
| `ca7f4832` | "Where Did You Get My Number?" (2 versions) |
| `3520810a` | Objection Handling -- Young Adults Cold Call |

**New title:** "Objection Handling -- Young Adults (All Objections)"

---

#### Group 3: NSF Objection Handling (3 to 1)
Same pattern -- individual objections that should be one reference.

| Script to Merge | Current Stage |
|---|---|
| `20f41e57` | "I Already Have an Agent / Plan" |
| `0a6215c0` | "I'm Not Free on That Day" |
| `2833e586` | Hesitant / Unsure |

**New title:** "Objection Handling -- NSF (All Objections)"

---

#### Group 4: 2nd Meeting Reminders (2 to 1)
Both are short reminder texts for a second meeting.

| Script to Merge | Current Stage |
|---|---|
| `c49b3112` | Reminder -- 2nd Meeting (Short) |
| `d3dec7e2` | Reminder -- 2nd Zoom Meeting |

**New title:** "Reminder -- 2nd Meeting (All Versions)"

---

#### Group 5: Recruitment Cold Calling (5 to 1)
All are cold call scripts for recruitment leads from different sources.

| Script to Merge | Current Stage |
|---|---|
| `b958bc7a` | Facebook Leads (Recruitment Webinar) |
| `c87854a0` | Job Portal Leads (Recruitment) |
| `c2744711` | Recruitment (Telemarketer Script) |
| `be14ec69` | Recruitment NSF Leads (Telemarketer, 3v) |
| `0895933a` | Facebook Ads Texting -- Recruitment (2v) |

**New title:** "Cold Calling -- Recruitment (All Lead Sources)"

---

#### Group 6: Recruitment Post-Call Texts (3 to 1)
Three separate single-version post-call texts for different recruitment channels.

| Script to Merge | Current Stage |
|---|---|
| `26f70980` | Post-Call Text -- Job Portal Recruitment Leads |
| `2ccff6e6` | Post-Call Text -- Recruitment Leads |
| `d7a19c8e` | Post-Call Text -- Recruitment NSF Leads (Zoom) |

**New title:** "Post-Call Text -- Recruitment (All Sources)"

---

#### Group 7: Working Adult Cold Calling (6 to 1)
Six separate cold calling scripts for working adults from various angles.

| Script to Merge | Current Stage |
|---|---|
| `9f356a99` | Cold Call -- Working Adults (NASA / Campaign) |
| `1b69b729` | Cold Calling -- FB Ad Lead (Working Adults / Parents) |
| `68afcb1f` | Cold Calling -- FB Voucher Ad Opt-In (Working Adults) |
| `b782b7bf` | Cold Calling -- Financial Literacy Guidebook (3v) |
| `ae7285e5` | Telemarketer Script for Ebook Leads (Working Adults) |
| `6da31ccb` | Telemarketer -- Ebook Leads (Financial Planning Guide) |

**New title:** "Cold Calling -- Working Adults (All Angles)"

---

### Technical Implementation

1. **Create a temporary edge function** (`consolidate-scripts-v2`) that:
   - For each group, picks the primary script (the one with the most versions)
   - Merges all versions from secondary scripts into the primary, labeling each version by its original stage name
   - Updates the primary's `stage` to the new consolidated title
   - Consolidates all `tags` (deduplicated)
   - Updates any `script_playbook_items` referencing deleted scripts to point to the primary
   - Deletes the secondary scripts
   - Performs deduplication on content (skip if first 100 chars match)

2. **Dry run first** -- call with `dryRun: true` to verify counts and mappings

3. **Execute** -- run the actual merge

4. **Clean up** -- delete the temporary edge function

### Result Summary

| Metric | Before | After |
|---|---|---|
| Total scripts | 102 | 81 |
| Scripts merged | 28 | into 7 |
| Net reduction | 21 entries | |

All merged scripts will retain every version for comparison, with clear version labels showing the original script name/angle.

