import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
};

type Pillar = "interest" | "identity" | "topic" | "market";
type Format = "carousel" | "short-video" | "text-post" | "story";
type Platform = "linkedin" | "instagram" | "facebook" | "tiktok";
type CtaType = "dm-keyword" | "comment-keyword" | "save-share" | "book-call" | "open-question";
type Audience = "young-adult" | "working-adult" | "parent" | "pre-retiree" | "general";
type Mode = "hooks" | "body" | "post";

interface RequestBody {
  pillar: Pillar;
  pillarDetail: string;
  ideaSource: string;
  ideaContext?: string;
  format: Format;
  platform: Platform;
  ctaType: CtaType;
  styleReference?: string;
  audience?: Audience;
  mode?: Mode;
  n?: number;
  chosenHook?: string;
  stream?: boolean;
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

const AUDIENCE_GUIDE: Record<Audience, string> = {
  "young-adult":
    "Audience: young adults aged 21-27 in Singapore. Fresh grads, early-career, often first job. Pain-points: HDB BTO timing, first insurance buy, CPF SA basics, student loan repayment, lifestyle inflation. Voice: relatable, peer-to-peer, no jargon, no parent-talk.",
  "working-adult":
    "Audience: working adults aged 28-40 in Singapore. Mid-career, dual-income or single, building savings, mortgage holders. Pain-points: ILP regret, term-vs-whole-life, CPF SA top-up timing, MediShield Life integration, salary protection. Voice: peer, practical, specific numbers.",
  parent:
    "Audience: parents in Singapore with kids under 16. Concerns: education endowment vs investment, child CI/hospital plan, family income protection, legacy. Voice: empathetic, family-first, no scare tactics.",
  "pre-retiree":
    "Audience: pre-retirees aged 50-62 in Singapore. Concerns: CPF Life payout timing, retirement income gap, healthcare costs in retirement, legacy/estate, downsizing HDB. Voice: respectful, concrete, longer time horizons.",
  general:
    "Audience: general Singapore adults. Don't over-narrow; speak to a broad working/family audience.",
};

const VARIANT_NUDGES = [
  "Variant tone: lean toward myth-busting framing - call out a common misconception in the opening, then correct it with the concrete teaching point.",
  "Variant tone: lean toward client-story framing - open with an anonymised real-client moment ('A client asked me last week...'), then teach.",
  "Variant tone: lean toward question-driven framing - open with a sharp question the reader is already asking themselves, then answer it.",
  "Variant tone: lean toward number-led framing - open with a concrete Singapore number/stat that reframes the issue, then unpack it.",
  "Variant tone: lean toward contrarian framing - take the opposite of the popular advice and defend it with one specific reason.",
];

const HOOK_NUDGES = [
  "Hook style: a sharp question the reader is already asking themselves.",
  "Hook style: a myth-busting one-liner that reverses common belief.",
  "Hook style: a concrete Singapore number/stat that reframes the issue.",
  "Hook style: an anonymised client moment, told in one line.",
  "Hook style: a contrarian take on popular advice.",
];

function audienceLine(audience?: Audience): string {
  if (!audience || audience === "general") return AUDIENCE_GUIDE.general;
  return AUDIENCE_GUIDE[audience];
}

function basePromptLines(body: RequestBody): string[] {
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
    `## Audience`,
    audienceLine(body.audience),
    "",
    `## Pillar: ${body.pillar}`,
    PILLAR_GUIDE[body.pillar],
    body.pillarDetail ? `Specific pillar detail: ${body.pillarDetail}` : "",
    "",
    `## Idea source: ${body.ideaSource}`,
    body.ideaContext
      ? `Context from FC: ${body.ideaContext}`
      : "If no context provided, infer a plausible Singapore-specific scenario.",
    "",
    `## Platform: ${body.platform}`,
    PLATFORM_VOICE[body.platform],
    "",
    `## Format: ${body.format}`,
    FORMAT_GUIDE[body.format],
    "",
    `## CTA style: ${body.ctaType}`,
    CTA_GUIDE[body.ctaType],
    body.styleReference ? `\n## Style reference (match the structural pattern, don't copy verbatim)\n${body.styleReference}` : "",
  ];
}

function postSystemPrompt(body: RequestBody, variantIndex: number): string {
  const lines = basePromptLines(body);
  const nudge = VARIANT_NUDGES[variantIndex % VARIANT_NUDGES.length];
  lines.push("", `## ${nudge}`, "", "Now produce the draft.");
  return lines.filter(Boolean).join("\n");
}

function hooksSystemPrompt(body: RequestBody, variantIndex: number): string {
  const lines = basePromptLines(body);
  const nudge = HOOK_NUDGES[variantIndex % HOOK_NUDGES.length];
  lines.push(
    "",
    "## Output mode: HOOK ONLY",
    "Produce ONLY the opening hook for the post. 1-2 lines maximum. No body, no CTA, no slide labels. Just the hook line(s) ready to paste as the first line of a post.",
    `## ${nudge}`,
    "",
    "Now produce the hook.",
  );
  return lines.filter(Boolean).join("\n");
}

function bodySystemPrompt(body: RequestBody, variantIndex: number, chosenHook: string): string {
  const lines = basePromptLines(body);
  const nudge = VARIANT_NUDGES[variantIndex % VARIANT_NUDGES.length];
  lines.push(
    "",
    "## Required opening",
    `The post MUST open with this exact hook (do not rewrite it):`,
    chosenHook,
    "After the hook, deliver the body and CTA per the platform/format/CTA rules above.",
    `## ${nudge}`,
    "",
    "Now produce the full draft, leading with the required hook above.",
  );
  return lines.filter(Boolean).join("\n");
}

function userPrompt(body: RequestBody, mode: Mode): string {
  if (mode === "hooks") {
    return `Produce one ${body.platform} hook for a ${body.format}, following the system instructions.`;
  }
  return `Draft my ${body.platform} ${body.format} now, following the system instructions.`;
}

interface ResolvedRequest {
  body: RequestBody;
  mode: Mode;
  n: number;
  wantStream: boolean;
}

function resolveRequest(req: Request, raw: RequestBody): ResolvedRequest {
  const mode: Mode = raw.mode ?? "post";
  let n = typeof raw.n === "number" && raw.n > 0 ? Math.floor(raw.n) : 1;
  if (n > 5) n = 5;
  const url = new URL(req.url);
  const accept = req.headers.get("accept") ?? "";
  const wantStream =
    raw.stream === true ||
    accept.includes("text/event-stream") ||
    url.searchParams.get("stream") === "1";
  return { body: raw, mode, n, wantStream };
}

function buildSystemForVariant(
  body: RequestBody,
  mode: Mode,
  variantIndex: number,
): string {
  if (mode === "hooks") return hooksSystemPrompt(body, variantIndex);
  if (mode === "body") {
    const hook = body.chosenHook?.trim();
    if (!hook) {
      throw new Error("mode 'body' requires chosenHook");
    }
    return bodySystemPrompt(body, variantIndex, hook);
  }
  return postSystemPrompt(body, variantIndex);
}

async function callOpenAINonStream(
  apiKey: string,
  systemContent: string,
  userContent: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-2025-04-14",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
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
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callOpenAIStreamToController(
  apiKey: string,
  systemContent: string,
  userContent: string,
  variantIndex: number,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-2025-04-14",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      temperature: 0.85,
      max_tokens: 1400,
      stream: true,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const text = response.body ? await response.text() : "";
    console.error("OpenAI stream error:", response.status, text);
    throw new Error(`OpenAI stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assembled = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            assembled += delta;
            const event = `data: ${JSON.stringify({
              type: "token",
              variantIndex,
              text: delta,
            })}\n\n`;
            controller.enqueue(encoder.encode(event));
          }
        } catch (err) {
          console.error("OpenAI stream chunk parse error:", err);
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch (_) {
      // ignore
    }
  }

  return assembled;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleNonStream(
  apiKey: string,
  body: RequestBody,
  mode: Mode,
  n: number,
): Promise<Response> {
  const userContent = userPrompt(body, mode);
  try {
    const calls = Array.from({ length: n }, (_, i) =>
      callOpenAINonStream(apiKey, buildSystemForVariant(body, mode, i), userContent),
    );
    const results = await Promise.all(calls);
    if (n === 1 && mode === "post") {
      // legacy shape for old callers
      return jsonResponse({ draft: results[0] });
    }
    if (mode === "hooks") {
      return jsonResponse({ mode, hooks: results });
    }
    return jsonResponse({ mode, drafts: results });
  } catch (err) {
    console.error("non-stream error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
}

function handleStream(
  apiKey: string,
  body: RequestBody,
  mode: Mode,
  n: number,
): Response {
  const encoder = new TextEncoder();
  const abortController = new AbortController();
  const userContent = userPrompt(body, mode);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const sendEvent = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch (err) {
          console.error("sendEvent failed:", err);
        }
      };

      sendEvent({ type: "start", totalVariants: n, mode });

      const tasks = Array.from({ length: n }, async (_, i) => {
        try {
          const systemContent = buildSystemForVariant(body, mode, i);
          const text = await callOpenAIStreamToController(
            apiKey,
            systemContent,
            userContent,
            i,
            controller,
            encoder,
            abortController.signal,
          );
          sendEvent({ type: "variant_complete", variantIndex: i, text });
        } catch (err) {
          console.error(`variant ${i} stream error:`, err);
          sendEvent({
            type: "error",
            variantIndex: i,
            message: err instanceof Error ? err.message : "Variant failed",
          });
        }
      });

      Promise.all(tasks)
        .catch((err) => {
          console.error("stream tasks error:", err);
          sendEvent({
            type: "error",
            message: err instanceof Error ? err.message : "Stream failed",
          });
        })
        .finally(() => {
          sendEvent({ type: "done" });
          try {
            controller.close();
          } catch (_) {
            // ignore double-close
          }
        });
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let raw: RequestBody;
  try {
    raw = (await req.json()) as RequestBody;
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!raw.pillar || !raw.format || !raw.platform || !raw.ideaSource || !raw.ctaType) {
    return jsonResponse(
      { error: "Missing required fields: pillar, format, platform, ideaSource, ctaType" },
      400,
    );
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "OpenAI API key not configured" }, 500);
  }

  const { body, mode, n, wantStream } = resolveRequest(req, raw);

  if (mode === "body" && !body.chosenHook?.trim()) {
    return jsonResponse({ error: "mode 'body' requires chosenHook" }, 400);
  }

  if (wantStream) {
    return handleStream(apiKey, body, mode, n);
  }
  return handleNonStream(apiKey, body, mode, n);
});
