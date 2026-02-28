import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Changelog entries ─────────────────────────────────────────────────────────
// Mirror of src/pages/Changelog.tsx entries — update both when adding new entries.

interface ChangeEntry {
  date: string;        // "27 Feb"
  isoDate: string;     // "2026-02-27" — used for recency filtering
  type: "new" | "improved" | "fixed";
  title: string;
  description: string;
  category: "Platform" | "AI" | "Scripts" | "Admin" | "Videos" | "New Page";
  linkTo?: string;     // relative path on academy.finternship.com
}

const APP_URL = "https://academy.finternship.com";

const ALL_ENTRIES: ChangeEntry[] = [
  // February 2026
  { date: "27 Feb", isoDate: "2026-02-27", type: "new", title: "Script Categories — Fact Finding & Sales Scripts", description: "Added dedicated \"Fact Finding\" category to the Scripts Database for prospecting and discovery scripts. Sales-oriented scripts now live under their own \"Sales Scripts\" category for cleaner organisation.", category: "Scripts", linkTo: "/scripts" },
  { date: "27 Feb", isoDate: "2026-02-27", type: "improved", title: "Admin Category Management", description: "Admins can now delete script categories directly from the Scripts Database. Scripts inside a deleted category are automatically moved to Uncategorized so no content is lost.", category: "Admin" },
  { date: "25 Feb", isoDate: "2026-02-25", type: "new", title: "Script Flows — Visual Flow Builder", description: "Brand-new drag-and-drop flow builder for mapping out conversation flows, decision trees, and sales processes. Create, share, and annotate flows visually.", category: "New Page", linkTo: "/flows" },
  { date: "22 Feb", isoDate: "2026-02-22", type: "new", title: "Script Playbooks", description: "Compile your favourite scripts and objection responses into shareable playbooks. Each playbook can be shared via a public link with optional editing permissions.", category: "New Page", linkTo: "/playbooks" },
  { date: "18 Feb", isoDate: "2026-02-18", type: "new", title: "Servicing Templates Page", description: "Dedicated page for post-sale servicing scripts — renewals, policy reviews, claims guidance, and client retention scripts.", category: "New Page", linkTo: "/servicing" },
  { date: "15 Feb", isoDate: "2026-02-15", type: "new", title: "Scripts Database", description: "Central hub for all sales scripts, categorised by stage, audience, and type. Scripts support versioning, community contributions, favourites, and admin moderation.", category: "New Page", linkTo: "/scripts" },
  { date: "12 Feb", isoDate: "2026-02-12", type: "new", title: "Objections Tab — Community Responses", description: "The Objections subtab now aggregates common client objections with community-contributed responses. Advisors can upvote the best responses and submit their own.", category: "Scripts", linkTo: "/objections" },
  // January 2026
  { date: "28 Jan", isoDate: "2026-01-28", type: "improved", title: "AI Chat — Thread Persistence", description: "AI chat conversations now persist across sessions. Your conversation history is saved per product so you can continue where you left off.", category: "AI" },
  { date: "25 Jan", isoDate: "2026-01-25", type: "new", title: "Training Videos — Pro Achiever & Platinum Wealth Venture", description: "New training video series added for Pro Achiever and Platinum Wealth Venture products, covering product overview, key features, and objection handling.", category: "Videos", linkTo: "/category/investment" },
  { date: "22 Jan", isoDate: "2026-01-22", type: "new", title: "Knowledge Base (KB)", description: "Structured knowledge base portal for all products, organised by category. Each product page includes key highlights, useful links, explainer videos, and a direct link to its AI assistant.", category: "New Page", linkTo: "/kb" },
  { date: "20 Jan", isoDate: "2026-01-20", type: "new", title: "Training Videos — Healthshield Gold Max & Solitaire PA", description: "Medical insurance product training videos added — covering plan tiers, claims process, and common client questions for Healthshield Gold Max and Solitaire PA.", category: "Videos", linkTo: "/category/medical" },
  { date: "18 Jan", isoDate: "2026-01-18", type: "new", title: "AI Roleplay Training", description: "Practice sales conversations with a live AI avatar. Choose from 4 difficulty scenarios and receive automated feedback with scores across communication, objection handling, and product knowledge.", category: "New Page", linkTo: "/roleplay" },
  { date: "10 Jan", isoDate: "2026-01-10", type: "new", title: "CMFAS Exam Modules", description: "Study portal for CMFAS licensing exams covering M9, M9A, HI, and RES5. Each module includes learning videos with progress tracking and a dedicated AI tutor chatbot.", category: "New Page", linkTo: "/cmfas-exams" },
  { date: "5 Jan", isoDate: "2026-01-05", type: "improved", title: "Gamification — XP & Achievements", description: "Earn XP by completing quizzes, watching videos, and engaging with products. Unlock achievement badges and track your learning streak. Daily XP limits prevent farming.", category: "Platform" },
  // December 2025
  { date: "20 Dec", isoDate: "2025-12-20", type: "new", title: "Product AI Assistants", description: "Each product now has its own AI assistant pre-trained on product-specific knowledge. Ask questions, get benefit illustrations explained, and compare scenarios.", category: "AI" },
  { date: "18 Dec", isoDate: "2025-12-18", type: "new", title: "Training Videos — Guaranteed Protect Plus & Secure Flexi Term", description: "Whole life and term product training videos added for Guaranteed Protect Plus and Secure Flexi Term, including pitch walkthroughs and comparison guides.", category: "Videos", linkTo: "/category/whole-life" },
  { date: "15 Dec", isoDate: "2025-12-15", type: "new", title: "Product Categories & Detail Pages", description: "Products are organised into categories: Investment, Endowment, Whole Life, Term, and Medical. Each product has a dedicated page with training videos, useful links, and an AI chatbot.", category: "Platform" },
  { date: "8 Dec", isoDate: "2025-12-08", type: "new", title: "FINternship Platform Launch", description: "Initial launch of the FINternship Learning Platform — a centralised training and knowledge hub for financial advisors.", category: "Platform" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRecentEntries(windowDays = 14): ChangeEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  return ALL_ENTRIES.filter((e) => new Date(e.isoDate) >= cutoff);
}

// Category emoji map for the email
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

// ─── Email HTML builder ────────────────────────────────────────────────────────

function buildEmailHtml(entries: ChangeEntry[], userName: string, fromDate: Date, toDate: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const changelogUrl = `${APP_URL}/changelog`;

  // Group entries by category for the summary
  const grouped: Record<string, ChangeEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  }

  const totalCount = entries.length;
  const videoCount = entries.filter((e) => e.category === "Videos").length;
  const newPageCount = entries.filter((e) => e.category === "New Page").length;

  // Build entry rows
  const entryRows = entries
    .map((e) => {
      const link = e.linkTo ? `${APP_URL}${e.linkTo}` : changelogUrl;
      const typeColor = TYPE_COLOR[e.type];
      const typeLabel = TYPE_LABEL[e.type];
      const catEmoji = CAT_EMOJI[e.category] || "•";

      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div>
              <div style="margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 600; color: #ffffff; background-color: ${typeColor}; padding: 2px 8px; border-radius: 99px; margin-right: 6px;">${typeLabel}</span>
                <span style="font-size: 11px; color: #888; font-weight: 500;">${catEmoji} ${e.category}</span>
                <span style="font-size: 11px; color: #bbb; margin-left: 8px;">${e.date}</span>
              </div>
              <div style="font-size: 15px; font-weight: 600; color: #111; margin-bottom: 4px; line-height: 1.4;">${e.title}</div>
              <div style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 8px;">${e.description}</div>
              ${
                e.linkTo
                  ? `<a href="${link}" style="font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 500;">→ Explore this feature</a>`
                  : `<a href="${changelogUrl}" style="font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 500;">→ View on Changelog</a>`
              }
            </div>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  // Summary stats strip
  const statsItems = [
    { label: "Updates", value: totalCount },
    ...(newPageCount > 0 ? [{ label: "New Pages", value: newPageCount }] : []),
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

// ─── Main handler ──────────────────────────────────────────────────────────────

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
    // Support optional override: { windowDays: 30 } for manual sends
    let windowDays = 14;
    try {
      const body = await req.json();
      if (body?.windowDays) windowDays = body.windowDays;
    } catch { /* no body — use default */ }

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - windowDays);

    const recentEntries = getRecentEntries(windowDays);

    if (recentEntries.length === 0) {
      console.log("No changelog entries in the past", windowDays, "days — skipping digest.");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_recent_entries" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${recentEntries.length} recent entries. Fetching user list...`);

    // Fetch all active user emails from profiles
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
      const html = buildEmailHtml(recentEntries, userName, fromDate, toDate);

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

      // Respect Resend free tier: max 2 req/sec → wait 600ms between each send
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
