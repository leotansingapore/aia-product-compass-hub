import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Pillar = "interest" | "identity" | "topic" | "market";
type Format = "carousel" | "short-video" | "text-post" | "story";
type Platform = "linkedin" | "instagram" | "facebook" | "tiktok";
type CtaType = "dm-keyword" | "comment-keyword" | "save-share" | "book-call" | "open-question";

interface RequestBody {
  pillar: Pillar;
  pillarDetail: string;
  ideaSource: string;
  ideaContext?: string;
  format: Format;
  platform: Platform;
  ctaType: CtaType;
}

const PILLAR_GUIDE: Record<Pillar, string> = {
  interest:
    "Centre on a hobby/passion of the FC (e.g. running, gaming, photography). Open with a personal moment from that interest, then bridge to a financial insight. Humanises the FC; attracts similar-interest prospects.",
  identity:
    "Centre on a life-stage or role the FC and audience share (e.g. mum of two, fresh grad, career-switcher). Speak in a 'us, not them' voice. People engage because the FC 'gets them'.",
  topic:
    "Centre on a specific financial area (CPF, ILPs, critical illness, retirement, estate planning, taxes). The FC becomes known for THIS topic. Be concrete - real numbers, real Singapore rules.",
  market:
    "Centre on a specific client segment (fresh grads, families, single parents, SME owners, teachers). Prospects in that segment self-select. Use language and pain-points that segment recognises instantly.",
};

const FORMAT_GUIDE: Record<Format, string> = {
  carousel:
    "Output 5-8 slides. One idea per slide. Slide 1 = hook. Slides 2-N = teaching (one micro-point each). Final slide = CTA. Format the response as: 'SLIDE 1', 'SLIDE 2', etc., each with a slide title and 1-3 lines of body copy.",
  "short-video":
    "Output a 30-60 second face-to-camera script. Include: HOOK (first 3 seconds, must stop the scroll), BODY (one tight teaching point with a concrete number/example), CTA (one ask). Add suggested CAPTION for the video post separately. Burned-in caption suggestions optional.",
  "text-post":
    "Output a text post: 100-250 words. Open with a one-line hook (no 'In this post' meta-talk). Use short paragraphs, white space, plain English, mobile-readable. End with a CTA + an open question.",
  story:
    "Output 3-5 story frames suitable for Instagram/Facebook stories. Each frame = one short sentence + one design suggestion (e.g. 'Bold text on dark gradient', 'Selfie with caption overlay'). Last frame = CTA with sticker/poll/DM prompt.",
};

const PLATFORM_VOICE: Record<Platform, string> = {
  linkedin:
    "Voice: thought leadership / professional. No emojis or 1-2 max. Industry-credible. First-person stories OK. Hashtags: 3-5, relevant.",
  instagram:
    "Voice: warm, personal, magazine-feel. Emojis OK but sparing. Visual-first: assume the photo/graphic does heavy lifting. Hashtags: 8-15, mix of broad + niche SG tags.",
  facebook:
    "Voice: conversational, family-living-room. No emoji-spam. Shareable angle. Local SG references welcome. Hashtags: 0-3.",
  tiktok:
    "Voice: punchy, hook-first, conversational. Native TikTok tone (not corporate). One idea, fast. Captions short. Hashtags: 3-5, trend-aware.",
};

const CTA_GUIDE: Record<CtaType, string> = {
  "dm-keyword":
    "End with a soft DM-keyword CTA. Example pattern: 'DM me [WORD] for the [resource]'. Pick a single short uppercase keyword.",
  "comment-keyword":
    "End with a comment-keyword CTA. Example pattern: 'Comment [WORD] below and I'll send you the [resource].'",
  "save-share":
    "End with a save/share CTA. Example pattern: 'Save this for when you next look at your CPF statement' or 'Share with a friend who's drowning in this question.'",
  "book-call":
    "End with a soft 15-min call CTA. Example pattern: 'If you'd like a no-pressure 15-min review of your own plan, DM me.' Avoid hard pitches.",
  "open-question":
    "End with an open question that invites comments. Example pattern: 'What's the one CPF question you've never had answered? Drop it below.'",
};

function systemPrompt(body: RequestBody): string {
  return [
    "You are a content drafting assistant for an AIA financial consultant in Singapore.",
    "You produce one social-media post draft at a time, using the framework taught in Day 40-42 of their training:",
    "- Every post must hit Authority + Social + a soft CTA. The CTA is mandatory.",
    "- Authority = demonstrate competence. Social = demonstrate humanity. CTA = invite interaction.",
    "- Audience starts as a 'Skeptical Stranger'. The post's job is to move them one step toward 'Curious Follower' or 'Trusted Choice'. No hard pitches.",
    "- Singapore-specific where relevant (CPF, MAS, SGD, local context).",
    "- No political opinions. No religious proselytising. No claims of guaranteed returns. No naming specific competitor products in a disparaging way.",
    "- Concrete > abstract. Use real numbers, real ratios, real situations. Avoid platitudes ('investment is important for your future').",
    "- The FC's voice should sound human, not corporate. Match the platform.",
    "- Output the draft as ready-to-paste copy. No preamble, no 'Here is your post:'. Just the post. If multiple slides/frames, label them clearly.",
    "",
    `## Pillar: ${body.pillar}`,
    PILLAR_GUIDE[body.pillar],
    body.pillarDetail ? `Specific pillar detail: ${body.pillarDetail}` : "",
    "",
    `## Idea source: ${body.ideaSource}`,
    body.ideaContext ? `Context from FC: ${body.ideaContext}` : "If no context provided, infer a plausible Singapore-specific scenario.",
    "",
    `## Platform: ${body.platform}`,
    PLATFORM_VOICE[body.platform],
    "",
    `## Format: ${body.format}`,
    FORMAT_GUIDE[body.format],
    "",
    `## CTA style: ${body.ctaType}`,
    CTA_GUIDE[body.ctaType],
    "",
    "Now produce the draft.",
  ]
    .filter(Boolean)
    .join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.pillar || !body.format || !body.platform || !body.ideaSource || !body.ctaType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: pillar, format, platform, ideaSource, ctaType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt(body) },
          {
            role: "user",
            content: `Draft my ${body.platform} ${body.format} now, following the system instructions.`,
          },
        ],
        temperature: 0.85,
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", response.status, text);
      throw new Error(`OpenAI request failed (${response.status})`);
    }

    const data = await response.json();
    const draft = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-social-content error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
