import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  email: string;
  send?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const { email, send }: Payload = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify requester (must be admin or master_admin)
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
    const origin = new URL(req.url).origin;
    const { data: linkData, error: linkErr } = await serviceClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/force-password` },
    });
    if (linkErr || !linkData) {
      return new Response(JSON.stringify({ error: linkErr?.message || 'Failed to generate link' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Optionally send email via Resend if configured and send flag provided
    if (send) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: "Email sending not configured (missing RESEND_API_KEY)", resetUrl: linkData.properties?.action_link || linkData.action_link }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
      try {
        const to = email;
        const actionLink = (linkData.properties?.action_link || linkData.action_link) as string;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FINternship <no-reply@resend.dev>",
            to: [to],
            subject: "Password reset instructions",
            html: `<p>You (or an admin) requested a password reset.</p><p>Click the button below to set a new password:</p><p><a href="${actionLink}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#0ea5e9;color:#fff;text-decoration:none">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p>`
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          console.log('Resend error', txt);
        }
      } catch (e) {
        console.log('Email send error', e);
      }
    }

    return new Response(JSON.stringify({ resetUrl: linkData.properties?.action_link || linkData.action_link }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
