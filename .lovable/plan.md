

## Add "Initial Texts" Category and Move Scripts

### What Changes

**1. Add a new "initial-text" category across the app**

A new category called "Initial Texts" will be added to all three places where categories are defined:

- `src/pages/ScriptsDatabase.tsx` -- add to `CategoryKey` type, `categoryLabels` map (with a suitable icon like `MessageCircle` and an indigo/cyan color scheme)
- `src/components/scripts/ScriptEditorDialog.tsx` -- add to `CATEGORIES` array
- `supabase/functions/classify-script/index.ts` -- add to `CATEGORIES` array and add a description line in the system prompt: *"initial-text: first contact messages sent to new leads (e.g. after Facebook opt-in, voucher claim, or first outreach)"*

**2. Move 4 scripts from "follow-up" to "initial-text"**

These scripts are first-contact messages, not follow-ups. They will be re-categorized via a database UPDATE:

| Script | Audience |
|--------|----------|
| Initial Text -- Qualified Facebook Lead | pre-retiree |
| Initial Text -- Facebook Leads (Recruitment) | recruitment |
| Initial Text -- Facebook Qualified Lead (Young Adults, Non-Voucher) | young-adult |
| Initial Text -- Facebook Voucher Lead (Just Opted In) | young-adult |

SQL:
```sql
UPDATE scripts SET category = 'initial-text'
WHERE id IN (
  '00d64a23-61c4-4e60-90dd-a5772262f15f',
  '7fd5f0a0-d50e-4d6a-a0be-946d25bfdc49',
  '6c299eb0-da74-4712-bbec-8a2ba38114f3',
  '8433b860-7444-4a07-a2c2-c66bacb5b8d3'
);
```

### Files to Change

- **`src/pages/ScriptsDatabase.tsx`** -- Add `"initial-text"` to `CategoryKey` type union and `categoryLabels` record
- **`src/components/scripts/ScriptEditorDialog.tsx`** -- Add `{ value: "initial-text", label: "Initial Texts" }` to `CATEGORIES`
- **`supabase/functions/classify-script/index.ts`** -- Add `"initial-text"` to `CATEGORIES` array and update the system prompt description
- **Database** -- UPDATE the 4 scripts to `category = 'initial-text'`

### Result

The Scripts Database will show a new "Initial Texts" tab containing the 4 first-contact message scripts, keeping "Follow-Up Messages" focused on post-contact communication. The AI classifier will also correctly route new initial-text scripts to this category.

