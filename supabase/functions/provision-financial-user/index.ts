import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FINANCIAL_APP_ENDPOINT = "https://dmvbzkushldwfxuipjxe.supabase.co/functions/v1/verify-academy-eligibility";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const financialApiKey = Deno.env.get("FINANCIAL_APP_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!financialApiKey) {
      console.error("FINANCIAL_APP_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Financial app integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const normalizedEmail = email.trim().toLowerCase();
    console.log("Provisioning user from Financial app:", normalizedEmail);

    // Step 1: Double-check eligibility with Financial app (including password verification)
    console.log("Verifying eligibility with Financial app...");
    const eligibilityResponse = await fetch(FINANCIAL_APP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": financialApiKey,
      },
      body: JSON.stringify({ email: normalizedEmail, password: password }),
    });

    const eligibility = await eligibilityResponse.json();
    console.log("Financial app eligibility response:", eligibility);

    if (!eligibility?.eligible) {
      console.log("User not eligible:", eligibility?.reason);
      return new Response(
        JSON.stringify({ 
          error: "User not eligible for Academy access",
          reason: eligibility?.reason 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Check if auth user already exists (orphan detection / self-heal)
    // listUsers is paginated (default 50/page) — search all pages for the email
    let existingAuthUser: any = null;
    const perPage = 1000;
    for (let page = 1; page <= 20; page++) {
      const { data: pageData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (listErr) {
        console.error("Error listing users on page", page, listErr);
        break;
      }
      const found = pageData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
      if (found) {
        existingAuthUser = found;
        break;
      }
      if (!pageData?.users || pageData.users.length < perPage) break;
    }

    // Step 3: Create or recover the user account
    const displayName = full_name || eligibility.user?.full_name || "User";
    const [firstName, ...lastNameParts] = displayName.split(" ");
    const lastName = lastNameParts.join(" ");

    let userId: string;

    if (existingAuthUser) {
      console.log("Auth user already exists, self-healing (updating password + backfilling):", existingAuthUser.id);
      userId = existingAuthUser.id;

      // Update password + metadata so the Financial app password works going forward
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
        password: password,
        email_confirm: true,
        user_metadata: {
          ...(existingAuthUser.user_metadata || {}),
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          source: "financial_app",
        },
      });

      if (updateError) {
        console.error("Error updating existing auth user:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to sync existing account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log("Creating new user account...");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true, // Auto-confirm email since they're verified via Financial app
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          source: "financial_app",
        },
      });

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      console.log("User created successfully:", userId);
    }

    // Step 4: Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: userId,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName || null,
        display_name: displayName,
        first_login: false, // They're setting their own password
      }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    // Step 5: Assign roles based on Financial app response
    const financialRoles: string[] = eligibility.user?.roles || [];
    console.log("Roles from Financial app:", financialRoles);

    let adminRole = 'user';
    if (financialRoles.includes('master_admin')) {
      adminRole = 'master_admin';
    } else if (financialRoles.includes('admin')) {
      adminRole = 'admin';
    }

    const hasElevatedRole = financialRoles.some(r =>
      ['admin', 'master_admin', 'consultant'].includes(r)
    );
    const accessTier = hasElevatedRole ? 'level_2' : 'level_1';

    console.log("Mapped roles:", { adminRole, accessTier });

    // Sync admin role (clear stale rows first)
    await supabaseAdmin.from("user_admin_roles").delete().eq("user_id", userId);
    const { error: adminRoleError } = await supabaseAdmin
      .from("user_admin_roles")
      .insert({ user_id: userId, admin_role: adminRole });
    if (adminRoleError) console.error("Error assigning admin role:", adminRoleError);

    // Upsert access tier
    const { error: tierError } = await supabaseAdmin
      .from("user_access_tiers")
      .upsert({ user_id: userId, tier_level: accessTier }, { onConflict: "user_id" });
    if (tierError) console.error("Error assigning access tier:", tierError);

    // Sync user_roles for backwards compatibility
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: adminRole });
    if (roleError) console.error("Error assigning user role:", roleError);

    // Step 6: Sign in to get session tokens
    console.log("Signing in to get session tokens...");
    
    // Create a regular client for sign-in
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false }
    });

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    if (signInError || !signInData.session) {
      console.error("Error signing in new user:", signInError);
      return new Response(
        JSON.stringify({ 
          error: "Account created but failed to sign in. Please try logging in.",
          user_created: true 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User provisioned and signed in successfully:", normalizedEmail);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created and logged in successfully",
        user: {
          id: userId,
          email: normalizedEmail,
          display_name: displayName,
        },
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error provisioning user:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
