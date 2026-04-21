import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  currentPassword?: string;
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
    const { currentPassword, newPassword }: Payload = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const email = userRes.user.email;
    const userId = userRes.user.id;

    if (currentPassword) {
      const verifyClient = createClient(SUPABASE_URL, ANON_KEY);
      const { error: verifyErr } = await verifyClient.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyErr) {
        return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error: updErr } = await serviceClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let growingAgeResult: { success: boolean; error?: string; skipped?: boolean } = { success: false };
    const gaUrl = Deno.env.get("GROWING_AGE_SUPABASE_URL");
    const gaKey = Deno.env.get("GROWING_AGE_SUPABASE_SERVICE_ROLE_KEY");

    if (!gaUrl || !gaKey) {
      growingAgeResult = { success: false, error: "Cross-project sync not configured" };
    } else {
      try {
        const gaClient = createClient(gaUrl, gaKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: gaList, error: gaListErr } = await gaClient.auth.admin.listUsers();
        if (gaListErr) throw gaListErr;
        const existing = gaList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existing) {
          const { error: gaUpdErr } = await gaClient.auth.admin.updateUserById(existing.id, {
            password: newPassword,
            email_confirm: true,
          });
          if (gaUpdErr) throw gaUpdErr;
          growingAgeResult = { success: true };
        } else {
          growingAgeResult = { success: false, skipped: true };
        }
      } catch (gaErr: any) {
        console.error("Growing-age password sync failed:", gaErr);
        growingAgeResult = { success: false, error: gaErr.message || String(gaErr) };
      }
    }

    return new Response(
      JSON.stringify({ success: true, growingAge: growingAgeResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("Unexpected error:", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
