

## Revised Plan: Remove 5 Edge Functions + Clean Up

### Step 1: Delete dead code
- **Delete `src/hooks/useAuthOperations.tsx`** — orphaned, zero imports
- **Edit `src/hooks/useSimpleAuthOperations.tsx`** — remove `signUp`/`authSignUp` from the `useSimplifiedAuth()` destructure

### Step 2: Delete 5 edge function directories
Remove from `supabase/functions/`: `create-pending-user/`, `notify-admins-new-signup/`, `notify-user-approved/`, `approve-user/`, `provision-user/`

### Step 3: Delete deployed functions
Use `supabase--delete_edge_functions` for all 5.

### Step 4: Clean up `supabase/config.toml`
Remove entries for `notify-admins-new-signup`, `notify-user-approved`, `provision-user`.

### Step 5: Replace `approve-user` calls with direct DB update
In **3 files** (`useUserActions.ts`, `UserDirectoryRow.tsx`, `BulkUserActions.tsx`), replace:
```ts
supabase.functions.invoke('approve-user', { body: { request_id }, headers: ... })
```
with:
```ts
supabase.from('user_approval_requests')
  .update({ status: 'approved', reviewed_at: new Date().toISOString() })
  .eq('id', request_id)
```
No RPC call. The user's auth account already exists; approval is just a status flip.

### Step 6: Refactor ProvisionUserDialog
Replace the `provision-user` edge function call with:
1. Call `create-user-account` edge function (creates auth user, profile, and user role)
2. If a tier is selected, insert into `user_roles` directly
3. Direct DB update to mark approval request as approved:
```ts
supabase.from('user_approval_requests')
  .update({ status: 'approved', reviewed_at: new Date().toISOString() })
  .eq('id', request_id)
```
Do **not** call `approve_user_request_simple` anywhere.

### Files Summary
- **Delete:** `src/hooks/useAuthOperations.tsx`, 5 edge function dirs
- **Edit:** `useSimpleAuthOperations.tsx`, `useUserActions.ts`, `UserDirectoryRow.tsx`, `BulkUserActions.tsx`, `ProvisionUserDialog.tsx`, `supabase/config.toml`

