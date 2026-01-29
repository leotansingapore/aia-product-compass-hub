

## Remove Access Tier System - Simplify to Role-Based Edit Permissions

### Overview
Simplify the permission system by removing the tier-based access restrictions (level_1, level_2). All authenticated users will be able to view all content. The only restriction will be on **editing**:
- **Admins** (admin, master_admin) can edit courses, links, videos, etc.
- **Regular users** can only edit their own personal notes

---

### Current State
The system currently has a complex tier-based access control:
- `user_access_tiers` table stores user tier levels (level_1, level_2)
- `tier_permissions` table defines which resources each tier can access
- `usePermissions` hook fetches tier data and checks access
- Admin UI shows "Access Tier" column with dropdown to change tiers
- `ProtectedSection` and `ProtectedPage` components enforce tier restrictions

---

### Changes Required

#### 1. Simplify usePermissions Hook

**File:** `src/hooks/usePermissions.tsx`

Remove tier-based access checks and simplify permission logic:
- Remove calls to `get_user_access_tier` RPC
- Remove `tierPermissions` state and fetching
- Make `canAccessSection()` return `true` for all authenticated users
- Make `canAccessPage()` return `true` for all authenticated users  
- Keep `canEditSection()` checking only admin roles
- Keep `canEditPage()` checking only admin roles

**Before (simplified):**
```typescript
const canAccessSection = (sectionId) => {
  // Check tier permissions
  return tierPermissions.some(p => p.resource_id === sectionId);
}
```

**After:**
```typescript
const canAccessSection = (sectionId) => {
  // All authenticated users can access all sections
  if (!user) return false;
  return true; // Everyone can view
}

const canEditSection = (sectionId) => {
  // Only admins can edit
  return isAdmin();
}
```

---

#### 2. Remove Access Tier from Admin UI

**Files to modify:**
- `src/components/admin/UserTableRow.tsx` - Remove Access Tier column and dropdown
- `src/components/admin/UserMobileCard.tsx` - Remove Access Tier badge and dropdown
- `src/components/admin/UserManagementTable.tsx` - Remove "Access Tier" table header
- `src/components/account/UserManagementSection.tsx` - Remove "Configure Tiers" button and dialog
- `src/utils/userUtils.ts` - Remove `getTierBadgeVariant` and `AVAILABLE_ACCESS_TIERS`

---

#### 3. Remove TierConfigurationPanel Component

**File:** `src/components/account/TierConfigurationPanel.tsx`

This component is no longer needed and can be deleted.

---

#### 4. Clean Up Permission Messages

**Files to modify:**
- `src/hooks/usePermissions.tsx` - Remove tier-related lock messages
- Update any error messages that reference "tier level"

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/usePermissions.tsx` | Remove tier fetching, simplify access checks to allow all authenticated users |
| `src/components/admin/UserTableRow.tsx` | Remove Access Tier column and dropdown |
| `src/components/admin/UserMobileCard.tsx` | Remove Access Tier badge and dropdown |
| `src/components/admin/UserManagementTable.tsx` | Remove "Access Tier" header |
| `src/components/account/UserManagementSection.tsx` | Remove "Configure Tiers" button and TierConfigurationPanel dialog |
| `src/utils/userUtils.ts` | Remove tier-related utilities |
| `src/components/account/TierConfigurationPanel.tsx` | **DELETE** this file |

---

### Permission Logic After Changes

| Action | Who Can Do It |
|--------|---------------|
| View all pages | Any authenticated user |
| View all sections (videos, links, etc.) | Any authenticated user |
| Edit courses/videos | Admin, Master Admin only |
| Edit useful links | Admin, Master Admin only |
| Edit personal notes | The user themselves (existing behavior) |
| Access admin dashboard | Admin, Master Admin only |

---

### Technical Details

The simplified `canAccessSection` and `canAccessPage` functions:

```typescript
const canAccessSection = (sectionId: string): boolean => {
  const publicSections = ['auth', 'how_to_use'];
  if (publicSections.includes(sectionId)) return true;
  if (loading) return true;
  if (!user) return false;
  return true; // All authenticated users can view everything
};

const canAccessPage = (pageId: string): boolean => {
  if (pageId === 'auth') return true;
  if (!user) return false;
  return true; // All authenticated users can access all pages
};

const canEditSection = (sectionId: string): boolean => {
  return isAdmin(); // Only admins can edit
};
```

---

### Database Note
The `user_access_tiers` and `tier_permissions` tables will remain in the database but will no longer be used by the frontend. They can be cleaned up in a future database migration if desired, but removing them is not necessary for this change.

