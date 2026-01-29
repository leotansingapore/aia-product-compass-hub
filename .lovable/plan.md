

## Cross-App Authentication: Financial App Eligibility Verification

### Overview
Implement a feature that allows users approved in the Financial app to automatically gain access to the Academy without signing up again. When a user tries to log in but doesn't have an Academy account, we check if they're eligible via the Financial app's API and auto-provision them.

---

### Step 1: Store the Financial App API Key

**Action Required:** Add a new Supabase secret

You'll need to add the `FINANCIAL_APP_API_KEY` secret to your Supabase project. This is the ACADEMY_API_KEY value shared with you from the Financial app.

---

### Step 2: Create Edge Function - `check-financial-eligibility`

**New File:** `supabase/functions/check-financial-eligibility/index.ts`

This edge function will:
1. Receive an email from the Academy login flow
2. Call the Financial app's `verify-academy-eligibility` endpoint
3. Return the eligibility result to the frontend

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FINANCIAL_APP_ENDPOINT = "https://dmvbzkushldwfxuipjxe.supabase.co/functions/v1/verify-academy-eligibility";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const financialApiKey = Deno.env.get("FINANCIAL_APP_API_KEY");
    
    if (!financialApiKey) {
      console.error("FINANCIAL_APP_API_KEY not configured");
      return new Response(
        JSON.stringify({ eligible: false, reason: "Service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking Financial app eligibility for:", email);

    const response = await fetch(FINANCIAL_APP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": financialApiKey,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const result = await response.json();
    console.log("Financial app response:", { status: response.status, result });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return new Response(
      JSON.stringify({ eligible: false, reason: "Failed to check eligibility" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Step 3: Update Supabase Config

**File:** `supabase/config.toml`

Add configuration for the new edge function:

```toml
[functions.check-financial-eligibility]
verify_jwt = false
```

---

### Step 4: Modify Sign-In Logic

**File:** `src/hooks/useSimplifiedAuth.tsx`

Update the `signIn` function to check Financial app eligibility when login fails:

```typescript
const signIn = async (email: string, password: string) => {
  // ... existing validation ...

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    // If login succeeds, user is an existing Academy user
    if (!error && data.user) {
      clearPermissionsCache(data.user.id);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      return;
    }

    // If login fails with invalid credentials, check Financial app
    if (error?.message === "Invalid login credentials") {
      console.log("[SimplifiedAuth] Checking Financial app eligibility...");
      
      const { data: eligibility, error: eligibilityError } = 
        await supabase.functions.invoke("check-financial-eligibility", {
          body: { email: email.trim() },
        });

      if (!eligibilityError && eligibility?.eligible) {
        // User is eligible from Financial app - send magic link
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: eligibility.user?.full_name },
          },
        });

        if (!otpError) {
          toast({
            title: "Welcome to the Academy!",
            description: "Check your email for a login link to complete your setup.",
          });
          return;
        }
      } else if (eligibility?.reason === "User not approved") {
        toast({
          variant: "destructive",
          title: "Account Pending",
          description: "Your account is pending approval. Please contact your administrator.",
        });
        return;
      }
    }

    // Fall through to default error handling
    toast({
      variant: "destructive",
      title: "Sign In Failed",
      description: error?.message || "Invalid credentials",
    });
  } catch (error) {
    // ... existing error handling ...
  }
};
```

---

### Step 5: Update Profile Sync (Optional Enhancement)

When a Financial app user successfully logs in via magic link, their profile should be synced. The existing `handle_new_user` database trigger already creates profiles from user metadata.

If additional syncing is needed, we can add a check in the auth state listener:

```typescript
// In onAuthStateChange callback
if (event === 'SIGNED_IN' && session?.user) {
  // Check if user metadata indicates Financial app source
  const metadata = session.user.user_metadata;
  if (metadata?.source === 'financial_app') {
    // Sync profile data
    await supabase.from("profiles").upsert({
      user_id: session.user.id,
      email: session.user.email,
      display_name: metadata.full_name,
    }, { onConflict: 'user_id' });
  }
}
```

---

### Flow Diagram

```text
User enters email/password
         │
         ▼
┌─────────────────────┐
│ Try Academy Login   │
└─────────────────────┘
         │
    ┌────┴────┐
    │ Success │─────► User logged in (existing Academy user)
    └────┬────┘
         │ Invalid credentials
         ▼
┌─────────────────────────────┐
│ Call check-financial-       │
│ eligibility edge function   │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Financial App API call      │
│ verify-academy-eligibility  │
└─────────────────────────────┘
         │
    ┌────┴────┐
    │ Eligible│─────► Send magic link email
    └────┬────┘       "Check your email..."
         │
    Not eligible
         │
         ▼
┌─────────────────────┐
│ Show error message  │
│ based on reason     │
└─────────────────────┘
```

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/check-financial-eligibility/index.ts` | **CREATE** | New edge function to call Financial app API |
| `supabase/config.toml` | **MODIFY** | Add config for new edge function |
| `src/hooks/useSimplifiedAuth.tsx` | **MODIFY** | Update signIn to check eligibility on failure |

---

### Security Considerations

1. **API Key Protection**: The `FINANCIAL_APP_API_KEY` is only used server-side in the edge function, never exposed to the client
2. **Rate Limiting**: The Financial app handles rate limiting; we just pass through their response
3. **Audit Logging**: Console logs in edge function track all cross-app auth attempts
4. **Graceful Degradation**: If the Financial app is unavailable, users see a generic error and can still use normal signup

---

### Required Secret

Before implementation, you need to add the secret:

**Secret Name:** `FINANCIAL_APP_API_KEY`
**Value:** The ACADEMY_API_KEY value shared from the Financial app

---

### Testing Checklist

1. ✅ Existing Academy users can still log in normally
2. ✅ Financial app users (approved) receive magic link
3. ✅ Financial app users (not approved) see appropriate error
4. ✅ Non-existent users see standard "invalid credentials" error
5. ✅ Network failures handled gracefully
6. ✅ Missing API key doesn't crash the app

