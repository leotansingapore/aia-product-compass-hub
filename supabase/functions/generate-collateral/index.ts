import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TargetKind = "asset" | "slide" | "brochure-blurb";

interface CollateralTarget {
  kind: TargetKind;
  id: string;
  name: string;
  channelOrPurpose?: string;
  draft: string;
}

// Asset IDs that produce FC-facing scripts (must honour voice canon).
// All other assets are marketing collateral where the canon does not apply.
const FC_FACING_ASSET_IDS = new Set<string>([
  "wa-tagline",
  "origin-story-post",
  "referral-ask",
  "objection-bank",
  "intro-reel",
  "story-bank",
  "who-i-help-carousel",
]);

// Condensed Singapore FC voice canon. Source of truth:
// docs/_voice-canon-scripts.md in this repo.
const VOICE_CANON_CONDENSED = `
SINGAPORE FC SCRIPT VOICE — APPLY WHEN POLISHING ANY CONSULTANT-FACING DIALOGUE:

Register: professional warm — a Singaporean Financial Consultant in their late
20s writing to a friend or warm contact. Sentence-cased, full grammar, sincere,
but with disclaimers that signal "not a sales pitch".

Six rules:
1. Read it aloud — if it sounds scripted or American-business-polite, rewrite.
2. Cushion before reframing. Objection responses over 2 sentences open with
   "that's totally fair", "honestly, fair — and...", or equivalent.
3. End every warm opener on a low-bar invitation: "Would love to grab coffee
   sometime", "Free for a quick chat?", "Drop me a note anytime". Never end on
   "no need to reply", "that's it", "take care!" — those close the door.
4. Strip US business jargon. KILL: sounding board, drop you a line, plant a
   flag, opening the door, be your first call, reach out (between people who
   know each other), circle back, touch base, going forward, moving forward,
   leverage, synergy, end of the day, robust, comprehensive, solutions (when
   you mean policies/plans/products).
5. Sincere phrases are allowed when sincere: "it would be my privilege",
   "my pleasure to help", "to service your financial needs" — once per message.
6. No competitor brand names: IBCT, SAPT, ARQ, Lusi Group, Coach Mac, bootcamp.
   Never appear in FC-facing copy. Principles can stay; brand identifiers must not.

Allowed warm phrases: "sharing only", "just sharing", "no pitch, no agenda",
"quick one", "random question", "out of curiosity", "long time!",
"hope you're well", "totally fair", "honestly", "would love to grab a coffee".

Audience: Singapore — use "S$" for currency, "HDB / BTO / CPF" only where
relevant, never US examples (401k, IRA).

If the draft below already follows the canon, keep its structure and only
sharpen specificity. Do not over-write into LinkedIn-influencer prose.
`.trim();

function buildSystemPrompt(target: CollateralTarget): string {
  const isFcScript = target.kind === "slide" || FC_FACING_ASSET_IDS.has(target.id);
  const base =
    "You are a brand-and-script editor for a Singaporean Financial Consultant. " +
    "Polish the supplied draft using the advisor's brand brief. " +
    "Output ONLY the polished version — no preamble, no commentary, no markdown headings " +
    "unless they were already in the draft. Preserve the draft's structure (sections, " +
    "labels in square brackets, slide numbers, character-count headers, HTML tags). " +
    "Replace any [bracketed placeholders] with concrete language pulled from the brand " +
    "brief — never leave placeholders in the output. If the brief lacks a detail, " +
    "infer plausibly from what is given and keep it short and humble.";

  if (isFcScript) {
    return base + "\n\n" + VOICE_CANON_CONDENSED;
  }

  return base + "\n\n" +
    "This is marketing collateral (not a 1:1 script). Keep tone professional warm, " +
    "Singapore English, no US business jargon (kill: 'reach out', 'circle back', " +
    "'moving forward', 'leverage', 'synergy', 'robust', 'comprehensive', 'solutions' " +
    "as a euphemism for products). Use S$ for currency. Specific over generic.";
}

function buildUserPrompt(brandBrief: unknown, target: CollateralTarget): string {
  const briefStr = JSON.stringify(brandBrief, null, 2);
  const kindLabel =
    target.kind === "slide"
      ? "First-appointment deck slide"
      : target.kind === "brochure-blurb"
        ? "Brochure blurb"
        : "Personal branding asset";
  return [
    `ASSET TO POLISH: ${kindLabel} — "${target.name}" (id: ${target.id})`,
    target.channelOrPurpose ? `CHANNEL / PURPOSE: ${target.channelOrPurpose}` : "",
    ``,
    `ADVISOR BRAND BRIEF (JSON):`,
    "```json",
    briefStr,
    "```",
    ``,
    `CURRENT DRAFT (rule-based template — may contain [placeholders] to replace):`,
    "```",
    target.draft,
    "```",
    ``,
    `Polish this single asset. Output ONLY the polished asset body.`,
  ]
    .filter(Boolean)
    .join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const brandBrief = payload?.brandBrief;
    const target = payload?.target as CollateralTarget | undefined;

    if (!brandBrief || typeof brandBrief !== "object") {
      return new Response(JSON.stringify({ error: "Missing brandBrief" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (
      !target ||
      typeof target !== "object" ||
      !target.id ||
      !target.draft ||
      !["asset", "slide", "brochure-blurb"].includes(target.kind)
    ) {
      return new Response(JSON.stringify({ error: "Invalid target" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bodyStr = JSON.stringify(payload);
    if (bodyStr.length > 50000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(target);
    const userPrompt = buildUserPrompt(brandBrief, target);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const polished = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!polished) {
      throw new Error("Empty response from OpenAI");
    }

    return new Response(JSON.stringify({ polished, id: target.id, kind: target.kind }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-collateral error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Failed to generate collateral" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
