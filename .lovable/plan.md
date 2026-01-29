

## Plan: Map Financial App Roles to Academy Roles on Auto-Provisioning

### Overview

When the Financial app returns user roles in the eligibility response, the Academy should use these roles to assign appropriate permissions in the Academy app instead of defaulting to basic user roles.

### Financial App Response Format

```json
{
  "eligible": true,
  "user": {
    "email": "user@example.com",
    "full_name": "John Doe",
    "roles": ["admin", "consultant"]
  }
}
```

### Academy Role Structure

The Academy uses two separate tables for roles:

| Table | Column | Valid Values | Purpose |
|-------|--------|--------------|---------|
| `user_admin_roles` | `admin_role` | `user`, `admin`, `master_admin` | Admin access control |
| `user_access_tiers` | `tier_level` | `level_1`, `level_2` | Feature access tiers |
| `user_roles` | `role` | `user`, `admin`, `master_admin`, `basic`, `intermediate` | Legacy roles |

### Role Mapping Strategy

Map Financial app roles to Academy roles:

| Financial App Role | Academy Admin Role | Academy Access Tier |
|--------------------|-------------------|---------------------|
| `admin` | `admin` | `level_2` |
| `master_admin` | `master_admin` | `level_2` |
| `consultant` | `user` | `level_2` |
| `user` (or no roles) | `user` | `level_1` |

### Implementation Changes

**File:** `supabase/functions/provision-financial-user/index.ts`

1. **Extract roles from Financial app response**
   - Read `eligibility.user.roles` array from the response
   
2. **Determine admin role**
   - If roles contains `master_admin` → assign `master_admin`
   - Else if roles contains `admin` → assign `admin`
   - Else → assign `user`

3. **Determine access tier**
   - If user has `admin`, `master_admin`, or `consultant` role → assign `level_2`
   - Else → assign `level_1`

4. **Insert into correct tables**
   - Insert into `user_admin_roles` table with mapped admin role
   - Insert into `user_access_tiers` table with mapped tier level
   - Keep inserting into `user_roles` for backwards compatibility

### Code Changes

```typescript
// Step 5: Assign roles based on Financial app response
const financialRoles: string[] = eligibility.user?.roles || [];
console.log("Roles from Financial app:", financialRoles);

// Determine admin role (priority: master_admin > admin > user)
let adminRole = 'user';
if (financialRoles.includes('master_admin')) {
  adminRole = 'master_admin';
} else if (financialRoles.includes('admin')) {
  adminRole = 'admin';
}

// Determine access tier (admin/consultant get level_2, others get level_1)
const hasElevatedRole = financialRoles.some(r => 
  ['admin', 'master_admin', 'consultant'].includes(r)
);
const accessTier = hasElevatedRole ? 'level_2' : 'level_1';

console.log("Mapped roles:", { adminRole, accessTier });

// Insert admin role
const { error: adminRoleError } = await supabaseAdmin
  .from("user_admin_roles")
  .insert({
    user_id: newUser.user.id,
    admin_role: adminRole,
  });

if (adminRoleError) {
  console.error("Error assigning admin role:", adminRoleError);
}

// Insert access tier
const { error: tierError } = await supabaseAdmin
  .from("user_access_tiers")
  .insert({
    user_id: newUser.user.id,
    tier_level: accessTier,
  });

if (tierError) {
  console.error("Error assigning access tier:", tierError);
}

// Also insert into user_roles for backwards compatibility
const { error: roleError } = await supabaseAdmin
  .from("user_roles")
  .insert({
    user_id: newUser.user.id,
    role: adminRole,
  });

if (roleError) {
  console.error("Error assigning user role:", roleError);
}
```

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/provision-financial-user/index.ts` | Map Financial app roles to Academy roles and insert into correct tables |

### Expected Behavior

| Financial App Roles | Academy Admin Role | Academy Tier | Result |
|---------------------|-------------------|--------------|--------|
| `["admin", "consultant"]` | `admin` | `level_2` | Full admin access |
| `["master_admin"]` | `master_admin` | `level_2` | Master admin access |
| `["consultant"]` | `user` | `level_2` | Full content access, no admin |
| `["user"]` or `[]` | `user` | `level_1` | Basic CMFAS access only |

### Testing

After implementation:
1. Log in with a Financial app user that has `admin` role
2. Verify they get `admin` role in Academy
3. Verify they can access admin features
4. Log in with a user that has only `consultant` role
5. Verify they get `user` role but `level_2` tier access

