

## Update: Improve Error Handling for Financial App Password Verification

### Current State Analysis

The Academy app is **already configured** to send passwords to the Financial app:

1. ✅ `check-financial-eligibility/index.ts` - Already sends `email` and `password`
2. ✅ `useSimplifiedAuth.tsx` - Already passes password to eligibility check

### Issue Found

The error handling in `useSimplifiedAuth.tsx` doesn't specifically handle the new "Invalid credentials" response from the Financial app. Currently:

```typescript
if (!eligibility?.eligible) {
  if (eligibility?.reason === "User not approved") {
    // Shows "Account Pending" message
  } else {
    // Shows generic "Account Not Found" for ALL other cases
  }
}
```

This means when the Financial app returns `{ eligible: false, reason: "Invalid credentials" }`, the user will see "Account Not Found" instead of "Invalid Credentials".

---

### Required Change

**File:** `src/hooks/useSimplifiedAuth.tsx`

Update the error handling to properly distinguish between different failure reasons:

```typescript
if (!eligibility?.eligible) {
  // Handle specific error reasons from Financial app
  if (eligibility?.reason === "Invalid credentials") {
    toast({
      variant: "destructive",
      title: "Invalid Credentials",
      description: "The email or password you entered is incorrect."
    });
  } else if (eligibility?.reason === "User not approved") {
    toast({
      variant: "destructive",
      title: "Account Pending",
      description: "Your account is pending approval. Please contact your administrator."
    });
  } else if (eligibility?.reason === "User not found") {
    toast({
      variant: "destructive",
      title: "Account Not Found",
      description: "No account found with this email. Please sign up or contact your administrator."
    });
  } else {
    // Generic fallback
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: eligibility?.reason || "Unable to verify your credentials. Please try again."
    });
  }
  return;
}
```

---

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useSimplifiedAuth.tsx` | Add specific handling for "Invalid credentials" response |

---

### Expected Behavior After Update

| Financial App Response | Current Message | New Message |
|------------------------|-----------------|-------------|
| `{ eligible: false, reason: "Invalid credentials" }` | ❌ "Account Not Found" | ✅ "Invalid Credentials - The email or password you entered is incorrect" |
| `{ eligible: false, reason: "User not approved" }` | ✅ "Account Pending" | ✅ "Account Pending" |
| `{ eligible: false, reason: "User not found" }` | ✅ "Account Not Found" | ✅ "Account Not Found" |

---

### Summary

This is a minor update to improve error message clarity. The core integration is already complete - we just need to add proper handling for the new "Invalid credentials" error response from the Financial app.

