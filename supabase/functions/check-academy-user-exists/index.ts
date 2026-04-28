import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const normalizedEmail = email.trim().toLowerCase();
    console.log("Checking if user exists:", normalizedEmail);

    // listUsers is paginated - default is 50 per page. Walk every page so
    // users past page 1 aren't reported as missing - which would (incorrectly)
    // push them into provision-financial-user, whose updateUserById call
    // rotates the password and invalidates every existing session.
    let existingUser: { id: string; email: string | null } | null = null;
    const perPage = 1000;
    for (let page = 1; page <= 20; page++) {
      const { data: pageData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listError) {
        console.error("Error listing users on page", page, listError);
        return new Response(
          JSON.stringify({ error: "Failed to check user existence" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const found = pageData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (found) {
        existingUser = found;
        break;
      }
      if (!pageData?.users || pageData.users.length < perPage) break;
    }

    console.log("User exists check result:", {
      email: normalizedEmail,
      exists: !!existingUser,
    });

    return new Response(
      JSON.stringify({ exists: !!existingUser }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking user existence:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
