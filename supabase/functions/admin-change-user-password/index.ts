import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  userId: string;
  newPassword: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const { userId, newPassword }: Payload = await req.json();
    if (!userId || !newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify requester is admin
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const uid = userRes.user.id;
    const { data: roleCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'admin' });
    const { data: masterCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'master_admin' });
    if (!roleCheck && !masterCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);

    // Try to update the user's password
    const { error: updErr } = await serviceClient.auth.admin.updateUserById(userId, { password: newPassword });

    if (updErr) {
      // If user not found in auth, check profiles and create auth user first
      if (updErr.message?.includes("User not found") || updErr.status === 404) {
        console.log(`User ${userId} not found in auth, checking profiles...`);

        const { data: profile } = await serviceClient
          .from("profiles")
          .select("email, first_name, last_name, display_name")
          .eq("user_id", userId)
          .single();

        if (!profile?.email) {
          return new Response(JSON.stringify({ error: "User not found in auth or profiles" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        console.log(`Creating auth user for ${profile.email}...`);

        // Create the auth user with the given password
        const { error: createErr } = await serviceClient.auth.admin.createUser({
          email: profile.email,
          password: newPassword,
          email_confirm: true,
          user_metadata: {
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            display_name: profile.display_name || "",
          },
        });

        if (createErr) {
          console.error(`Failed to create auth user: ${createErr.message}`);
          return new Response(JSON.stringify({ error: `Failed to create auth user: ${createErr.message}` }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        console.log(`Auth user created and password set for ${profile.email}`);
        return new Response(JSON.stringify({ success: true, created: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error("Unexpected error:", e?.message);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
