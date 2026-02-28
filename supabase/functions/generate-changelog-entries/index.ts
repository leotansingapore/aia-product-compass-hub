import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChangelogEntry {
  entry_date: string;
  type: "new" | "improved" | "fixed";
  title: string;
  description: string;
  category: "Platform" | "AI" | "Scripts" | "Admin" | "Videos" | "New Page";
  link_to: string | null;
  source: "ai_generated";
  ai_week_start: string;
  is_published: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    let daysBack = 7;
    let forceRegenerate = false;
    try {
      const body = await req.json();
      if (body?.daysBack) daysBack = body.daysBack;
      if (body?.force) forceRegenerate = body.force;
    } catch { /* no body */ }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - daysBack);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    // Check if we've already generated entries for this week
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from("changelog_entries")
        .select("id")
        .eq("source", "ai_generated")
        .eq("ai_week_start", weekStartStr)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Already generated changelog entries for week starting ${weekStartStr}. Skipping.`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "already_generated_this_week" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Gather recent platform activity signals
    const [productsRes, videosRes, roleplayRes, pitchRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, title, description, updated_at, created_at")
        .gte("updated_at", weekStart.toISOString())
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("products")
        .select("id, title, training_videos")
        .not("training_videos", "eq", "[]")
        .gte("updated_at", weekStart.toISOString())
        .limit(20),
      supabase
        .from("roleplay_sessions")
        .select("id, scenario_title, scenario_difficulty, created_at")
        .gte("created_at", weekStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("pitch_analyses")
        .select("id, status, created_at")
        .gte("created_at", weekStart.toISOString())
        .limit(20),
    ]);

    const updatedProducts = productsRes.data ?? [];
    const newVideos = videosRes.data ?? [];
    const roleplaySessions = roleplayRes.data ?? [];
    const pitchAnalyses = pitchRes.data ?? [];

    // Build activity summary for AI
    const activityLines: string[] = [];

    if (updatedProducts.length > 0) {
      const newProducts = updatedProducts.filter((p) => {
        const created = new Date(p.created_at);
        return created >= weekStart;
      });
      const updatedOnly = updatedProducts.filter((p) => {
        const created = new Date(p.created_at);
        return created < weekStart;
      });
      if (newProducts.length > 0) {
        activityLines.push(`NEW PRODUCTS ADDED: ${newProducts.map((p) => `"${p.title}"`).join(", ")}`);
      }
      if (updatedOnly.length > 0) {
        activityLines.push(`PRODUCTS UPDATED: ${updatedOnly.map((p) => `"${p.title}"`).join(", ")}`);
      }
    }

    if (newVideos.length > 0) {
      activityLines.push(`PRODUCTS WITH TRAINING VIDEOS UPDATED: ${newVideos.map((p) => `"${p.title}"`).join(", ")}`);
    }

    if (roleplaySessions.length > 0) {
      const scenarios = [...new Set(roleplaySessions.map((r) => r.scenario_title))];
      activityLines.push(`ROLEPLAY USAGE: ${roleplaySessions.length} sessions completed across scenarios: ${scenarios.join(", ")}`);
    }

    if (pitchAnalyses.length > 0) {
      const completed = pitchAnalyses.filter((p) => p.status === "completed").length;
      activityLines.push(`PITCH ANALYSES: ${pitchAnalyses.length} analyses submitted, ${completed} completed this week`);
    }

    if (activityLines.length === 0) {
      console.log("No meaningful platform activity detected this week — skipping AI generation.");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "no_activity", entriesGenerated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activitySummary = activityLines.join("\n");

    const systemPrompt = `You are a platform changelog writer for "FINternship" — a financial advisor training and education platform. It has products (insurance/investment), training videos, AI roleplay scenarios, CMFAS exam modules, scripts, playbooks, and AI-powered features.

Your job is to analyze a week's worth of platform activity signals and write 1–4 concise, human-friendly changelog entries summarizing the most meaningful changes.

RULES:
- Group related activity into single meaningful entries
- Focus on things meaningful to advisors — skip low-signal noise
- Each entry: type (new/improved/fixed), title (short, specific), description (1–2 sentences, plain English)
- Categories: Platform, AI, Scripts, Admin, Videos, New Page
- Types: "new" (new feature/content), "improved" (enhancement), "fixed" (bug fix)
- link_to: suggest a relevant app path like "/category/investment" if applicable, otherwise null
- entry_date must be today: ${today}
- Do NOT fabricate features not evident from the signals
- Write in present tense: "Advisors can now..." not "We added..."
- If the week was quiet, generate 1–2 entries that accurately reflect what happened

Return valid JSON array only, no markdown, no commentary.`;

    const userPrompt = `Here is this week's platform activity (${weekStart.toLocaleDateString("en-GB")} to ${new Date().toLocaleDateString("en-GB")}):

${activitySummary}

Generate changelog entries as a JSON array with this exact structure:
[
  {
    "entry_date": "${today}",
    "type": "new" | "improved" | "fixed",
    "title": "Short descriptive title",
    "description": "1–2 sentences describing the change in plain language.",
    "category": "Platform" | "AI" | "Scripts" | "Admin" | "Videos" | "New Page",
    "link_to": "/relevant/path" | null
  }
]`;

    console.log(`Sending activity signals to AI:\n${activitySummary}`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI gateway error ${aiResponse.status}: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    console.log("AI response:", rawContent.slice(0, 500));

    // Parse AI JSON response (strip markdown fences if present)
    let parsed: ChangelogEntry[];
    try {
      const cleaned = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      const arr = JSON.parse(cleaned);
      if (!Array.isArray(arr)) throw new Error("AI response is not an array");

      const validCategories = ["Platform", "AI", "Scripts", "Admin", "Videos", "New Page"];
      const validTypes = ["new", "improved", "fixed"];

      parsed = arr
        .filter((e: Record<string, unknown>) =>
          e.title && e.description &&
          validCategories.includes(e.category as string) &&
          validTypes.includes(e.type as string)
        )
        .map((e: Record<string, unknown>) => ({
          entry_date: today,
          type: e.type as "new" | "improved" | "fixed",
          title: String(e.title).slice(0, 200),
          description: String(e.description).slice(0, 1000),
          category: e.category as ChangelogEntry["category"],
          link_to: e.link_to ? String(e.link_to).slice(0, 200) : null,
          source: "ai_generated" as const,
          ai_week_start: weekStartStr,
          is_published: true,
        }));
    } catch (parseErr) {
      throw new Error(`Failed to parse AI response: ${parseErr}. Raw: ${rawContent.slice(0, 500)}`);
    }

    if (parsed.length === 0) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "ai_generated_no_valid_entries" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertError } = await supabase
      .from("changelog_entries")
      .insert(parsed);

    if (insertError) throw new Error(`Failed to insert changelog entries: ${insertError.message}`);

    console.log(`Successfully generated and inserted ${parsed.length} changelog entries.`);

    return new Response(
      JSON.stringify({ success: true, entriesGenerated: parsed.length, weekStart: weekStartStr }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-changelog-entries error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
