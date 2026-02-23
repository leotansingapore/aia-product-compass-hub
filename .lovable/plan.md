

## Reclassify "Warm Market" from Category to Target Audience

Currently, "Warm Market" is a **category** (like Cold Calling, Follow-Up, Tips, etc.). You want it to become a **target audience** instead (like NSF, Working Adults, Cold Leads), so that warm market scripts get properly distributed across the functional categories.

---

### What Changes

**1. Add "warm-market" as a new target audience option**

Add it to all audience lists across the app (UI labels, AI classifier, editor dialog) with the label "Warm Market / Friends & Family".

It will appear in the audience breadcrumb navigation alongside NSF, Young Adults, Working Adults, etc.

**2. Remove "warm-market" from categories**

Remove it from category definitions in ScriptsDatabase, ScriptEditorDialog, and the classify-script edge function. The category list becomes: Cold Calling, Follow-Up, Ad Campaign, Referral, Confirmation, FAQ, and Tips.

**3. Recategorize the 8 existing warm-market scripts**

Each script gets `target_audience` set to `"warm-market"` and a new functional `category`:

| Script | New Category |
|--------|-------------|
| Introduction Text (New Consultant) | cold-calling |
| New Agent Announcement — Soft Launch | cold-calling |
| Texting EQ — 11 Rules for Warm Outreach | tips |
| Texting EQ — 4-Step Objection Handling Framework | faq |
| Conversation Openers (by Life Stage) | cold-calling |
| Outreach Flow (Step-by-Step) | tips |
| Handling Ghosting & Non-Replies | follow-up |
| "Already Have an Advisor" — Objection Script | faq |

**4. Update the AI classifier prompt**

The classify-script edge function's system prompt will describe "warm-market" as an audience (people you already know -- friends, family, acquaintances) and remove it from the category list.

---

### Files to Change

- **`src/pages/ScriptsDatabase.tsx`** -- Remove warm-market from `categoryLabels`, add to `audienceLabels` and `audienceSortOrder`
- **`src/components/scripts/ScriptEditorDialog.tsx`** -- Remove from CATEGORIES, add to TARGET_AUDIENCES
- **`supabase/functions/classify-script/index.ts`** -- Move warm-market from CATEGORIES to TARGET_AUDIENCES, update prompt descriptions
- **`supabase/functions/classify-objection/index.ts`** -- Already has warm-market in tags (no change needed)
- **Database update** -- UPDATE all 8 scripts to set new category and `target_audience = 'warm-market'`

---

### User Experience After

When you select "Warm Market" in the audience breadcrumbs, you'll see all warm-market scripts organized by their functional categories (Cold Calling openers, Follow-Up messages, Tips, FAQ/Objections) -- giving a much clearer workflow view. New scripts pasted in will also be classified this way by the AI.

