

## Fix: Add Password Verification to Cross-App Authentication

### Problem
The current implementation only verifies that an email is eligible in the Financial app, but **never validates the password**. This allows anyone who knows an eligible email to create an Academy account with any password they choose.

### Solution
Update the flow to require password verification from the Financial app before provisioning an account.

---

### Option A: Verify Password via Financial App (Recommended)

This requires the Financial app to expose a password verification endpoint that the Academy can call.

#### Step 1: Update `check-financial-eligibility` Edge Function

**File:** `supabase/functions/check-financial-eligibility/index.ts`

Modify to also send the password and expect the Financial app to verify it:

```typescript
// Change from:
body: JSON.stringify({ email: email.trim().toLowerCase() }),

// To:
body: JSON.stringify({ 
  email: email.trim().toLowerCase(),
  password: password  // Add password for verification
}),
```

The Financial app's `verify-academy-eligibility` endpoint would need to:
1. Check if email exists and is approved
2. Verify the password is correct
3. Return `eligible: true` only if BOTH checks pass

#### Step 2: Update `useSimplifiedAuth.tsx`

Pass the password to the eligibility check:

```typescript
const { data: eligibility } = await supabase.functions.invoke(
  "check-financial-eligibility",
  { body: { 
    email: email.trim(),
    password: password.trim()  // Add password
  } }
);
```

---

### Option B: Use Passwordless Flow (Alternative)

If the Financial app cannot verify passwords, an alternative is to NOT allow password-based auto-provisioning:

1. Check eligibility by email only (current behavior)
2. If eligible, send a **magic link** to the user's email
3. User clicks the link to create their Academy account and set a NEW password
4. This ensures only the email owner can create the account

---

### Required Financial App Changes

For Option A to work, the Financial app's `verify-academy-eligibility` endpoint needs to be updated to:

1. Accept both `email` and `password` in the request body
2. Verify the password against the Financial app's auth system
3. Return `eligible: false` with `reason: "Invalid credentials"` if password is wrong

---

### Files to Modify (Academy Side)

| File | Change |
|------|--------|
| `supabase/functions/check-financial-eligibility/index.ts` | Accept and forward password |
| `src/hooks/useSimplifiedAuth.tsx` | Pass password to eligibility check |

---

### Expected Behavior After Fix

| Scenario | Current (Bug) | After Fix |
|----------|--------------|-----------|
| Financial app user, correct password | ✅ Auto-provisioned | ✅ Auto-provisioned |
| Financial app user, wrong password | ❌ Auto-provisioned (bad!) | ✅ "Invalid credentials" |
| Non-eligible email | ✅ "Account not found" | ✅ "Account not found" |

---

### Recommendation

**Option A is preferred** because it provides seamless login for legitimate Financial app users while preventing unauthorized account creation.

However, this requires coordination with the Financial app team to update the `verify-academy-eligibility` endpoint to also verify passwords.

**Do you want me to:**
1. Proceed with Option A (Academy-side changes, requires Financial app update)
2. Implement Option B (Magic link flow, no Financial app changes needed)

