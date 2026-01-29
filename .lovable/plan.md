

## Fix: Cross-App Authentication Flow (Proper User Existence Check)

### Problem Identified

The current implementation has a critical bug:

- **Current behavior**: When login fails with "Invalid login credentials", the system immediately checks Financial app eligibility and sends a magic link - even if the user EXISTS in Academy but just entered the wrong password.
- **Root cause**: Supabase returns the same "Invalid login credentials" error for both:
  1. User exists but wrong password
  2. User doesn't exist at all

This creates a "false success" where Academy users with wrong passwords get a magic link instead of an error message.

### Solution Overview

We need to distinguish between "user exists with wrong password" and "user doesn't exist" by creating an edge function that checks user existence FIRST, then routing appropriately.

---

### Technical Implementation

```text
User enters email/password
         │
         ▼
┌─────────────────────────────────┐
│ Step 1: Check if user exists   │
│ in Academy (new edge function) │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    │ EXISTS  │─────► Try password login
    └────┬────┘              │
         │              ┌────┴────┐
    DOESN'T EXIST       │ Success │──► Logged in!
         │              └────┬────┘
         │                   │ Wrong password
         ▼                   ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ Check Financial     │  │ "Invalid credentials"    │
│ app eligibility     │  │ (existing user flow)     │
└─────────────────────┘  └──────────────────────────┘
         │
    ┌────┴────┐
    │ Eligible│──► Auto-provision account + Auto-login
    └────┬────┘
         │
    NOT ELIGIBLE
         │
         ▼
┌─────────────────────────────┐
│ "No account found" or       │
│ "Account pending approval"  │
└─────────────────────────────┘
```

---

### Step 1: Create Edge Function - `check-academy-user-exists`

**New File:** `supabase/functions/check-academy-user-exists/index.ts`

This edge function uses the admin API to check if an email exists in Academy's auth.users table.

```typescript
// Key logic:
const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
const existingUser = existingUsers.users.find(u => u.email === email);
return { exists: !!existingUser };
```

---

### Step 2: Create Edge Function - `provision-financial-user`

**New File:** `supabase/functions/provision-financial-user/index.ts`

This function auto-creates an Academy account for an eligible Financial app user and returns session tokens for immediate login.

```typescript
// Key logic:
// 1. Verify eligibility with Financial app (double-check)
// 2. Create user with admin.createUser() 
// 3. Generate session using admin.generateLink() or signInWithPassword
// 4. Return access_token and refresh_token
```

---

### Step 3: Update `supabase/config.toml`

Add configuration for the two new edge functions:

```toml
[functions.check-academy-user-exists]
verify_jwt = false

[functions.provision-financial-user]
verify_jwt = false
```

---

### Step 4: Update Sign-In Logic in `useSimplifiedAuth.tsx`

**File:** `src/hooks/useSimplifiedAuth.tsx`

Completely restructure the `signIn` function:

```typescript
const signIn = async (email: string, password: string) => {
  // Step 1: Check if user exists in Academy
  const { data: existsCheck } = await supabase.functions.invoke(
    "check-academy-user-exists", 
    { body: { email: email.trim() } }
  );

  if (existsCheck?.exists) {
    // User EXISTS in Academy - try normal password login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (!error && data.user) {
      // Success - existing Academy user logged in
      toast({ title: "Welcome back!" });
      return;
    }

    // Wrong password for existing user
    toast({ 
      variant: "destructive", 
      title: "Invalid Credentials",
      description: "The password you entered is incorrect." 
    });
    return;
  }

  // Step 2: User does NOT exist in Academy - check Financial app
  const { data: eligibility } = await supabase.functions.invoke(
    "check-financial-eligibility",
    { body: { email: email.trim() } }
  );

  if (!eligibility?.eligible) {
    // Not eligible - show appropriate error
    if (eligibility?.reason === "User not approved") {
      toast({ 
        variant: "destructive",
        title: "Account Pending",
        description: "Your account is pending approval."
      });
    } else {
      toast({ 
        variant: "destructive",
        title: "Account Not Found",
        description: "No account found with this email. Please contact your administrator."
      });
    }
    return;
  }

  // Step 3: User is eligible - auto-provision and login
  const { data: provision } = await supabase.functions.invoke(
    "provision-financial-user",
    { body: { 
      email: email.trim(),
      password: password.trim(), // Use the password they entered
      full_name: eligibility.user?.full_name 
    } }
  );

  if (provision?.session) {
    // Set the session manually to log them in
    await supabase.auth.setSession({
      access_token: provision.session.access_token,
      refresh_token: provision.session.refresh_token,
    });
    
    toast({ 
      title: "Welcome to the Academy!",
      description: "Your account has been created and you're now logged in." 
    });
    return;
  }

  // Fallback error
  toast({ 
    variant: "destructive",
    title: "Login Failed",
    description: "Unable to create your account. Please try again."
  });
};
```

---

### Files to Create/Modify Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/check-academy-user-exists/index.ts` | **CREATE** | Check if email exists in Academy auth |
| `supabase/functions/provision-financial-user/index.ts` | **CREATE** | Auto-create account & return session tokens |
| `supabase/config.toml` | **MODIFY** | Register new functions |
| `src/hooks/useSimplifiedAuth.tsx` | **MODIFY** | Restructure signIn flow |

---

### Security Considerations

1. **check-academy-user-exists**: Returns only boolean (exists/not exists), never exposes user data
2. **provision-financial-user**: 
   - Double-checks eligibility with Financial app before creating account
   - Uses the password provided by the user (not auto-generated)
   - Returns session tokens only after successful account creation
3. **Rate limiting**: Financial app handles their rate limits; we should add basic abuse prevention

---

### Expected Behavior After Fix

| Scenario | Current Behavior | New Behavior |
|----------|-----------------|--------------|
| Academy user, correct password | ✅ Login works | ✅ Login works |
| Academy user, wrong password | ❌ Sends magic link (bug) | ✅ "Invalid credentials" error |
| Financial app user (eligible), any password | Magic link sent | ✅ Account auto-created, auto-logged in |
| Financial app user (not approved) | Generic error | ✅ "Account pending approval" |
| Unknown email | Magic link attempt | ✅ "Account not found" |

---

### Testing Checklist

1. ✅ Existing Academy users can log in with correct password
2. ✅ Existing Academy users see "Invalid credentials" with wrong password
3. ✅ Financial app eligible users get auto-provisioned and logged in immediately
4. ✅ Financial app users (not approved) see appropriate error
5. ✅ Unknown emails see "Account not found" error
6. ✅ No magic links sent (seamless auto-login instead)

