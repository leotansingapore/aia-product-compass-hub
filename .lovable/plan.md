

# Scripts Database: Organisation and Sorting Recommendations

After reviewing all 91 scripts across 8 categories, here are the key findings and recommendations.

---

## Current State Summary

| Category | Count | Notes |
|---|---|---|
| Follow-Up | 28 | Largest category -- covers texts, callbacks, reminders, nudges across all audiences |
| Cold Calling | 21 | Well-organised by audience flow (NSF -> Young Adult -> Working Adult -> Pre-Retiree) |
| FAQ / Objections | 15 | Mix of general FAQs and audience-specific ones |
| Warm Market | 10 | All tagged "general" audience -- mostly frameworks and tips |
| Tips & Best Practices | 8 | General advice and young adult tips |
| Confirmation | 5 | Appointment confirmation texts by audience |
| Referral | 3 | Small but distinct |
| Post-Meeting | 1 | Only one entry |

---

## Issues Identified

### 1. Follow-Up category is overloaded (28 scripts)
This single category mixes very different script types:
- **Initial texts** (first contact after lead opt-in)
- **Post-call texts** (after a phone conversation)
- **Callback scripts** (actual phone call scripts, not texts)
- **Reminder/nudge sequences** (day 1/3/7 drip)
- **Rescheduling texts**
- **Post-meeting resources**
- **Graceful close scripts**

Recommendation: **Split Follow-Up into sub-categories** or add a `stage_type` tag to enable secondary filtering:
- `initial-text` -- First contact texts
- `post-call` -- Texts sent after a call
- `callback` -- Actual callback phone scripts
- `reminder-sequence` -- Drip/nudge follow-ups
- `closing` -- End-of-funnel scripts

### 2. Sort order gaps and decimals
Some scripts use decimal sort orders (3.5, 3.7) which suggests items were inserted between existing ones. This works but becomes messy over time.

Recommendation: **Re-number sort orders** in clean increments of 10 (10, 20, 30...) to leave room for future insertions without decimals.

### 3. Post-Meeting has only 1 script
The "Post-Meeting" category contains a single entry. Meanwhile, Follow-Up contains "Post-Meeting -- Client Resources & Referral" which is arguably a post-meeting script.

Recommendation: **Merge Post-Meeting into Follow-Up** (or into a new "Post-Meeting & Closing" sub-group within Follow-Up) to reduce near-empty categories.

### 4. Warm Market content overlaps with Tips
Warm Market contains entries like "Tips & Mindset" and "What NOT to Do" which are essentially tips, not outreach scripts. Meanwhile, Tips & Best Practices has its own general entries.

Recommendation: Keep Warm Market for actual outreach scripts/frameworks, and **move the pure tips entries** ("Tips & Mindset", "What NOT to Do", "Extra Success Pointers") into Tips & Best Practices with a `warm-market` tag so they remain searchable.

### 5. Audience sorting within Follow-Up is inconsistent
Cold Calling follows a clean audience flow (NSF -> Young Adult -> Working Adult -> Pre-Retiree -> Parent -> Recruitment), but Follow-Up sorts by audience in a different order: Pre-Retiree -> Recruitment -> Young Adult -> Working Adult -> General.

Recommendation: **Standardise the audience sort order** across all categories to match the established flow.

### 6. FAQ category could benefit from sub-grouping
FAQ has 15 entries mixing "company identity" questions, "what do you do" questions, and actual objection responses. Since objections now have their own dedicated tab, some FAQ entries may be better suited there.

Recommendation: Review FAQ entries like "I already have an advisor" and "Insurance agents are cheaters" -- these are objections, not FAQs, and could be **migrated to the Objection Handling tab** with proper responses.

---

## Proposed New Sort Order Standard

Apply consistent audience ordering within every category:

1. NSF (sort 1-9)
2. Young Adults (sort 10-19)
3. Working Adults (sort 20-29)
4. Pre-Retirees (sort 30-39)
5. Parents (sort 40-49)
6. Cold Leads (sort 50-59)
7. Recruitment (sort 60-69)
8. General (sort 70-79)
9. Telemarketer variants grouped after consultant scripts within each audience block

---

## Implementation Steps

### Phase 1: Database cleanup
1. Re-number all `sort_order` values using increments of 10, following the standardised audience order above
2. Move the single Post-Meeting script into Follow-Up with a `post-meeting` tag
3. Move 3 Warm Market tip entries into Tips & Best Practices with `warm-market` tag

### Phase 2: Follow-Up sub-grouping
4. Add tags to all 28 Follow-Up scripts to classify their type: `initial-text`, `post-call`, `callback`, `reminder-sequence`, `closing`
5. Update the UI to show Follow-Up scripts grouped by these sub-tags (collapsible sections within the category)

### Phase 3: FAQ cleanup
6. Identify FAQ entries that are actually objections (e.g., "I already have an advisor", "Insurance agents are cheaters")
7. Migrate them to the `objection_entries` table with proper response structures

### Phase 4: UI enhancement
8. Add a visual indicator showing the audience flow order within each category section
9. Display script count per audience within expanded category sections

---

## Technical Details

- **Sort order update**: Single SQL UPDATE statements per script, batched in a migration or executed via the admin UI
- **Tag additions**: Use existing `tags` text[] column -- no schema changes needed
- **Post-Meeting merge**: Delete the `post-meeting` category entry after moving the script to `follow-up`
- **Category removal**: Update `categoryLabels` in `ScriptsDatabase.tsx` to remove `post-meeting` and update any references
- **FAQ-to-Objection migration**: Insert into `objection_entries` + `objection_responses`, then delete from `scripts`

