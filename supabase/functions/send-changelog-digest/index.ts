import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://academy.finternship.com";

interface ChangeEntry {
  entry_date: string;
  type: "new" | "improved" | "fixed";
  title: string;
  description: string;
  category: string;
  link_to: string | null;
}

const CAT_EMOJI: Record<string, string> = {
  "New Page": "🆕",
  Platform: "⚙️",
  AI: "🤖",
  Scripts: "📝",
  Videos: "🎥",
  Admin: "🛡️",
};

const TYPE_LABEL: Record<string, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

const TYPE_COLOR: Record<string, string> = {
  new: "#16a34a",
  improved: "#2563eb",
  fixed: "#d97706",
};

function buildEmailHtml(entries: ChangeEntry[], userName: string, fromDate: Date, toDate: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const changelogUrl = `${APP_URL}/changelog`;
  const totalCount = entries.length;
  const newCount = entries.filter((e) => e.type === "new").length;
  const videoCount = entries.filter((e) => e.category === "Videos").length;

  const statsItems = [
    { label: "Updates", value: totalCount },
    ...(newCount > 0 ? [{ label: "New Features", value: newCount }] : []),
    ...(videoCount > 0 ? [{ label: "Video Releases", value: videoCount }] : []),
  ];

  const statsHtml = statsItems
    .map(
      (s) => `
    <td style="text-align: center; padding: 0 20px;">
      <div style="font-size: 28px; font-weight: 700; color: #111;">${s.value}</div>
      <div style="font-size: 12px; color: #666; margin-top: 2px;">${s.label}</div>
    </td>`
    )
    .join(`<td style="width: 1px; background: #e5e7eb; padding: 0;"></td>`);

  const entryRows = entries
    .map((e) => {
      const link = e.link_to ? `${APP_URL}${e.link_to}` : changelogUrl;
      const typeColor = TYPE_COLOR[e.type] ?? "#666";
      const typeLabel = TYPE_LABEL[e.type] ?? e.type;
      const catEmoji = CAT_EMOJI[e.category] || "•";
      const dateLabel = new Date(e.entry_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div>
            <div style="margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #ffffff; background-color: ${typeColor}; padding: 2px 8px; border-radius: 99px; margin-right: 6px;">${typeLabel}</span>
              <span style="font-size: 11px; color: #888; font-weight: 500;">${catEmoji} ${e.category}</span>
              <span style="font-size: 11px; color: #bbb; margin-left: 8px;">${dateLabel}</span>
            </div>
            <div style="font-size: 15px; font-weight: 600; color: #111; margin-bottom: 4px; line-height: 1.4;">${e.title}</div>
            <div style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 8px;">${e.description}</div>
            <a href="${link}" style="font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 500;">${e.link_to ? "→ Explore this feature" : "→ View on Changelog"}</a>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FINternship Fortnightly Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f6f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); border-radius: 16px 16px 0 0; padding: 36px 40px 32px;">
              <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">Fortnightly Update</div>
              <div style="font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 6px;">What's New on FINternship</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.75);">${fmt(fromDate)} – ${fmt(toDate)}</div>
            </td>
          </tr>

          <!-- White body -->
          <tr>
            <td style="background: #ffffff; padding: 32px 40px 0;">
              <p style="font-size: 16px; color: #333; margin: 0 0 6px; line-height: 1.6;">Hi ${userName},</p>
              <p style="font-size: 15px; color: #555; margin: 0 0 28px; line-height: 1.7;">
                Here's a quick roundup of everything that's been added or improved on the platform over the past two weeks.
                Click any link below to jump straight in and explore.
              </p>

              <!-- Stats strip -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 28px;">
                <tr style="padding: 20px 0;">${statsHtml}</tr>
              </table>

              <!-- Entries -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${entryRows}
              </table>
            </td>
          </tr>

          <!-- CTA footer -->
          <tr>
            <td style="background: #ffffff; padding: 28px 40px 36px; border-radius: 0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #f0f5ff; border-radius: 10px; padding: 20px 24px;">
                    <p style="font-size: 14px; color: #374151; margin: 0 0 12px; font-weight: 600;">Explore everything at once</p>
                    <p style="font-size: 13px; color: #6b7280; margin: 0 0 14px; line-height: 1.6;">Visit the full changelog for a complete history of all platform updates, or head to the dashboard to start exploring.</p>
                    <a href="${changelogUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 8px; margin-right: 8px;">View Full Changelog</a>
                    <a href="${APP_URL}" style="display: inline-block; background: #ffffff; color: #374151; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 8px; border: 1px solid #d1d5db;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.6;">
                You received this because you're a registered FINternship user.<br/>
                This digest is sent every two weeks. Questions? Contact your platform admin.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const resend = new Resend(resendApiKey);

  try {
    let windowDays = 14;
    try {
      const body = await req.json();
      if (body?.windowDays) windowDays = body.windowDays;
    } catch { /* no body — use default */ }

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - windowDays);

    // Fetch recent published entries from the DB
    const { data: recentEntries, error: entriesError } = await supabase
      .from("changelog_entries")
      .select("entry_date, type, title, description, category, link_to")
      .eq("is_published", true)
      .gte("entry_date", fromDate.toISOString().split("T")[0])
      .order("entry_date", { ascending: false });

    if (entriesError) throw new Error(`Failed to fetch changelog entries: ${entriesError.message}`);

    if (!recentEntries || recentEntries.length === 0) {
      console.log("No changelog entries in the past", windowDays, "days — skipping digest.");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_recent_entries" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${recentEntries.length} recent entries. Fetching user list...`);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email, display_name, first_name")
      .not("email", "is", null);

    if (profileError) throw new Error(`Failed to fetch profiles: ${profileError.message}`);

    const recipients = (profiles || []).filter((p) => p.email && p.email.includes("@"));

    console.log(`Sending digest to ${recipients.length} users...`);

    let sent = 0;
    let failed = 0;

    for (const profile of recipients) {
      const userName = profile.display_name || profile.first_name || "Advisor";
      const html = buildEmailHtml(recentEntries as ChangeEntry[], userName, fromDate, toDate);

      const fmt = (d: Date) =>
        d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

      const { error: emailError } = await resend.emails.send({
        from: "FINternship Updates <noreply@mail.themoneybees.co>",
        to: [profile.email],
        subject: `🗞️ FINternship Update: ${recentEntries.length} new changes (${fmt(fromDate)} – ${fmt(toDate)})`,
        html,
      });

      if (emailError) {
        console.error(`Failed to send to ${profile.email}:`, emailError);
        failed++;
      } else {
        sent++;
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`Digest complete: ${sent} sent, ${failed} failed.`);

    return new Response(
      JSON.stringify({
        success: true,
        entriesIncluded: recentEntries.length,
        recipientCount: recipients.length,
        sent,
        failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-changelog-digest error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
