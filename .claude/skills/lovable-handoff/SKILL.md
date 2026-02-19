---
name: lovable-handoff
description: Generate database change descriptions for Lovable to implement as Supabase migrations. Use when code changes need new tables, columns, RLS policies, or database functions. Activates when the user mentions "supabase", "migration", "database change", "lovable handoff", "new table", "new column", "RLS", or "storage bucket".
---

# Lovable Handoff — Database Change Describer

This project uses Lovable to manage all Supabase database migrations. Claude Code NEVER creates SQL files or modifies the database directly. Instead, describe what's needed so the user can relay it to Lovable.

## When This Activates

- A new feature needs a new table or column
- RLS policies need adding or updating
- A new RPC function is needed
- Storage bucket changes are required
- The user asks to update SUPABASE.md

## Output Format

Write changes to `SUPABASE.md` under the "Pending" section using this format:

```markdown
### Pending

#### [Feature Name] — [Date]

**What:** Brief description of what the change enables

**Tables:**
- `table_name`: Add column `column_name` (type, nullable/not null, default)
- `new_table`: Create with columns: id (uuid PK), user_id (FK → profiles), ...

**RLS Policies:**
- `policy_name`: [SELECT/INSERT/UPDATE/DELETE] on `table_name`
  - WHO: authenticated users / public / owner / admin
  - CONDITION: `auth.uid() = user_id` or describe logic

**Functions (RPC):**
- `function_name(param1 type, param2 type)` → return_type
  - Purpose: What it does
  - Logic: Brief description

**Storage:**
- Bucket `bucket_name`: [create/modify] — purpose, access rules
```

## Key Tables Reference

| Table | Purpose |
|-------|---------|
| `profiles` | User data (display name, XP, level, streaks) |
| `products` | Product/course content with AI chatbot config |
| `categories` | Product categories |
| `user_bookmarks` | Bookmarked products |
| `learning_progress` | Learning events with XP |
| `quiz_attempts` | Quiz completions with scores |
| `video_progress` | Video watch progress |
| `achievements` / `user_achievements` | Gamification badges |
| `roleplay_sessions` | Roleplay recordings |
| `roleplay_feedback` | AI scoring & feedback |
| `user_admin_roles` | Admin role assignments |
| `user_approval_requests` | Registration approval queue |
| `tier_permissions` / `user_access_tiers` | Access control tiers |

## RLS Pattern Reference

| Access Type | SQL Pattern |
|-------------|-------------|
| Owner only | `auth.uid() = user_id` |
| Admin | Check `user_admin_roles` table |
| Public read | `USING (true)` on SELECT |

## General Rules

- Never FK directly to `auth.users` — use `profiles` table
- Supabase defaults to 1000 rows — use `.range()` for pagination
- Never edit `src/integrations/supabase/types.ts` — auto-generated

## Workflow

1. Identify what database changes a feature needs
2. Write the description to SUPABASE.md (Pending section)
3. Tell the user: "Database changes documented in SUPABASE.md — tell Lovable to check SUPABASE.md"
4. After Lovable runs migrations, scan `supabase/migrations/` to verify completion
5. Move completed items to "Completed" section with date
