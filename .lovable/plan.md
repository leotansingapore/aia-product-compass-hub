

# Bug: Admin users can't edit/delete playbooks they didn't create

## Root Cause
Both `Playbooks.tsx` (list page) and `PlaybookDetail.tsx` (detail page) gate edit/delete actions strictly on ownership: `userId === pb.created_by` and `isOwner = user?.id === playbook?.created_by`. Master admins and admins who didn't create the playbook see no edit/delete controls at all.

## Fix

### 1. `src/pages/PlaybookDetail.tsx`
- Import `usePermissions` hook
- Change `isOwner` to also be `true` when user is admin or master_admin:
  ```ts
  const { isMasterAdmin, hasRole } = usePermissions();
  const isOwner = user?.id === playbook?.created_by || isMasterAdmin() || hasRole('admin');
  ```

### 2. `src/pages/Playbooks.tsx`
- Import `usePermissions` hook
- Add the same admin override to the `userId === pb.created_by` check:
  ```ts
  const { isMasterAdmin, hasRole } = usePermissions();
  const canManage = (pbCreatedBy: string) => userId === pbCreatedBy || isMasterAdmin() || hasRole('admin');
  ```
- Replace `userId === pb.created_by` with `canManage(pb.created_by)`

Both files are ~2-line changes each. No database or RLS changes needed since the `script_playbooks` table already has an "Admins can manage all playbook items" ALL policy for admins.

