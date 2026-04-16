import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_LABELS: Record<string, string> = {
  explorer: "Explorer",
  papers_taker: "Papers Taker",
  post_rnf: "Post-RNF",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    const { userId, toTier, status, adminNote } = await req.json();

    if (!userId || !toTier || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, toTier, status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return new Response(
        JSON.stringify({ error: "status must be 'approved' or 'rejected'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller is admin
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerUid = userRes.user.id;
    const { data: isAdmin } = await authClient.rpc("has_role", { _user_id: callerUid, _role: "admin" });
    const { data: isMaster } = await authClient.rpc("has_role", { _user_id: callerUid, _role: "master_admin" });
    if (!isAdmin && !isMaster) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up target user email from profiles
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile, error: profileErr } = await serviceClient
      .from("profiles")
      .select("email, display_name, first_name")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile?.email) {
      console.error("Could not find profile for userId:", userId, profileErr);
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "No email found for user" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tierLabel = TIER_LABELS[toTier] || toTier;
    const userName = profile.display_name || profile.first_name || "there";

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const isApproved = status === "approved";
    const subject = isApproved
      ? `🎉 You're now ${tierLabel} on Academy`
      : `Update on your upgrade request`;

    const bodyLines = isApproved
      ? [
          `Hi ${userName},`,
          "",
          `Great news! Your tier upgrade request has been approved. You now have **${tierLabel}** access on FINternship Academy.`,
          "",
          "Log in to explore your newly unlocked features.",
          ...(adminNote ? ["", `Note from your admin: ${adminNote}`] : []),
        ]
      : [
          `Hi ${userName},`,
          "",
          `We've reviewed your tier upgrade request, and unfortunately it hasn't been approved at this time.`,
          ...(adminNote ? ["", `Admin feedback: ${adminNote}`] : []),
          "",
          "You can submit a new request when you're ready.",
        ];

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px;">${subject}</h1>
        <div style="color: #333; font-size: 16px; line-height: 1.6;">
          ${bodyLines.map(l => l === "" ? "<br/>" : `<p style="margin: 4px 0;">${l.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`).join("")}
        </div>
        <p style="color: #6c757d; font-size: 14px; margin-top: 32px;">
          — The FINternship Team
        </p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "FINternship <noreply@mail.themoneybees.co>",
      to: [profile.email],
      subject,
      html: htmlBody,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: emailError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Tier change notification sent to ${profile.email}: ${status} → ${tierLabel}`);

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-tier-change:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
