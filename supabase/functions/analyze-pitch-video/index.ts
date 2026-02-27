import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Transcript extraction ────────────────────────────────────────────────────

function detectVideoType(url: string): "youtube" | "loom" | "unknown" {
  if (/youtu\.be|youtube\.com/i.test(url)) return "youtube";
  if (/loom\.com/i.test(url)) return "loom";
  return "unknown";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractLoomId(url: string): string | null {
  // https://www.loom.com/share/XXXX or https://www.loom.com/embed/XXXX
  const m = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  // Use YouTube's timedtext API (no API key needed for most public videos)
  try {
    const listUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`;
    const listResp = await fetch(listUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!listResp.ok) return null;
    const listText = await listResp.text();

    // Try English first, then auto-generated
    let langCode = "en";
    if (!listText.includes('lang_code="en"')) {
      const firstLang = listText.match(/lang_code="([^"]+)"/);
      if (firstLang) langCode = firstLang[1];
    }

    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}&fmt=json3`;
    const resp = await fetch(transcriptUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return null;
    const data = await resp.json();

    if (!data.events) return null;
    const lines: string[] = [];
    for (const event of data.events) {
      if (!event.segs) continue;
      const text = event.segs.map((s: any) => s.utf8 || "").join("").trim();
      if (text && text !== "\n") lines.push(text);
    }
    return lines.join(" ").replace(/\s+/g, " ").trim() || null;
  } catch {
    return null;
  }
}

async function getLoomTranscript(videoId: string): Promise<string | null> {
  // Loom's public transcript endpoint
  try {
    const url = `https://www.loom.com/api/campaigns/sessions/${videoId}/transcript`;
    const resp = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (Array.isArray(data)) {
      return data.map((s: any) => s.transcript_message || s.text || "").join(" ").trim();
    }
    if (data.transcript) {
      if (Array.isArray(data.transcript)) {
        return data.transcript.map((s: any) => s.text || s.transcript_message || "").join(" ").trim();
      }
      return String(data.transcript);
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Embedding helper (reuses generate-embeddings) ──────────────────────────

async function embedText(text: string, supabaseUrl: string, serviceKey: string): Promise<number[] | null> {
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ texts: [text.slice(0, 2000)] }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const emb = data.embeddings?.[0];
    if (emb && emb.length === 768 && emb.some((v: number) => v !== 0)) return emb;
    return null;
  } catch {
    return null;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  if (!lovableKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { analysisId, videoUrl, transcript: manualTranscript, userId } = await req.json();

    if (!analysisId || !videoUrl) {
      return new Response(JSON.stringify({ error: "analysisId and videoUrl required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 1. Update status: transcribing ────────────────────────────────────────
    await supabase.from("pitch_analyses").update({ status: "transcribing" }).eq("id", analysisId);

    // ── 2. Get transcript ─────────────────────────────────────────────────────
    let transcript = manualTranscript || "";
    let transcriptSource = "manual";

    if (!transcript) {
      const videoType = detectVideoType(videoUrl);

      if (videoType === "youtube") {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          transcript = (await getYouTubeTranscript(videoId)) || "";
          transcriptSource = "youtube";
        }
      } else if (videoType === "loom") {
        const loomId = extractLoomId(videoUrl);
        if (loomId) {
          transcript = (await getLoomTranscript(loomId)) || "";
          transcriptSource = "loom";
        }
      }
    }

    if (!transcript || transcript.length < 50) {
      await supabase.from("pitch_analyses").update({
        status: "failed",
        error_message: "Could not extract transcript from the video. For Loom videos, try sharing the link with transcript enabled. For YouTube, ensure captions are available. Alternatively paste the transcript manually.",
      }).eq("id", analysisId);
      return new Response(JSON.stringify({ error: "transcript_unavailable" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3. Update DB with transcript, change status to analysing ─────────────
    await supabase.from("pitch_analyses").update({
      transcript,
      transcript_source: transcriptSource,
      status: "analysing",
    }).eq("id", analysisId);

    // ── 4. Retrieve Pro Achiever knowledge from RAG ──────────────────────────
    const productId = "pro-achiever"; // slug used in DB
    let knowledgeContext = "";

    // Fetch product from DB (try slug then look up by title)
    const { data: product } = await supabase
      .from("products")
      .select("id, title, description, highlights, rich_content")
      .or(`id.eq.${productId},title.ilike.%pro achiever%`)
      .limit(1)
      .single();

    const realProductId = product?.id;

    if (realProductId) {
      // Generate embedding for key query terms about pro achiever pitch
      const queryText = "Pro Achiever investment linked policy features benefits pitch ILP returns guaranteed";
      const embedding = await embedText(queryText, supabaseUrl, serviceKey);

      if (embedding) {
        const { data: chunks } = await supabase.rpc("hybrid_search_knowledge_chunks", {
          query_embedding: embedding,
          query_text: queryText,
          match_count: 12,
          filter_product_id: realProductId,
        });

        if (chunks && chunks.length > 0) {
          knowledgeContext = chunks
            .slice(0, 10)
            .map((c: any, i: number) => `[KB ${i + 1}] ${c.content}`)
            .join("\n\n");
        }
      }

      // Also include product highlights
      if (product.highlights?.length) {
        knowledgeContext = `Product Highlights:\n${product.highlights.join("\n")}\n\n${knowledgeContext}`;
      }
      if (product.description) {
        knowledgeContext = `Product Description: ${product.description}\n\n${knowledgeContext}`;
      }
    }

    // Fallback context if nothing in KB
    if (!knowledgeContext) {
      knowledgeContext = `Pro Achiever is an Investment-Linked Policy (ILP) offered by AIA. Key features include:
- Regular premium ILP with investment component
- Choice of funds across different risk profiles
- Insurance protection with investment growth potential
- Flexibility in premium payment and fund switching
- Potential for wealth accumulation over long term`;
    }

    // ── 5. Build assessment prompt ────────────────────────────────────────────
    const systemPrompt = `You are an elite financial advisory coach specialising in evaluating how advisors pitch the AIA Pro Achiever Investment-Linked Policy (ILP). 
You have deep knowledge of the product, regulatory best practices (MAS FAA), and consultative selling techniques.

Your job is to analyse a sales pitch transcript and produce a structured, actionable assessment.

Always be specific — reference EXACT quotes from the transcript in your feedback. Be constructive but honest.

PRODUCT KNOWLEDGE BASE:
${knowledgeContext}

SCORING CRITERIA (1–10 scale):
- Product Knowledge (1-10): Accuracy of features, benefits, risks, fees explained
- Needs Discovery (1-10): Did the advisor uncover client goals, risk appetite, time horizon?
- Objection Handling (1-10): How well were concerns/questions addressed?
- Closing Technique (1-10): Was there a clear call to action? Was it natural and non-pushy?
- Communication (1-10): Clarity, pace, structure, confidence, use of jargon vs plain language

Return ONLY a valid JSON object (no markdown, no code blocks). Structure:
{
  "overall_score": <1-10 number>,
  "product_knowledge_score": <1-10>,
  "needs_discovery_score": <1-10>,
  "objection_handling_score": <1-10>,
  "closing_technique_score": <1-10>,
  "communication_score": <1-10>,
  "executive_summary": "<2-3 sentence overall verdict>",
  "strengths": ["<specific strength with quote>", "..."],
  "improvement_areas": [
    { "area": "<area name>", "issue": "<what went wrong>", "suggestion": "<how to fix it>", "quote": "<relevant transcript excerpt>" }
  ],
  "missed_key_points": ["<product feature/fact that should have been mentioned but wasn't>", "..."],
  "recommended_follow_up": ["<specific action to take before next meeting>", "..."],
  "detailed_rubric": {
    "product_knowledge": { "score": <n>, "notes": "<specific feedback>" },
    "needs_discovery": { "score": <n>, "notes": "<specific feedback>" },
    "objection_handling": { "score": <n>, "notes": "<specific feedback>" },
    "closing_technique": { "score": <n>, "notes": "<specific feedback>" },
    "communication": { "score": <n>, "notes": "<specific feedback>" }
  }
}`;

    const userPrompt = `Here is the sales pitch transcript to analyse:\n\n${transcript.slice(0, 8000)}`;

    // ── 6. Call AI ────────────────────────────────────────────────────────────
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
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
      console.error("AI error:", aiResponse.status, errText);
      await supabase.from("pitch_analyses").update({
        status: "failed",
        error_message: `AI analysis failed (${aiResponse.status})`,
      }).eq("id", analysisId);
      return new Response(JSON.stringify({ error: "ai_failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // ── 7. Parse AI JSON ──────────────────────────────────────────────────────
    let parsed: any = {};
    try {
      // Strip any stray markdown fences
      const cleaned = rawContent.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON fails, store raw and mark failed
      await supabase.from("pitch_analyses").update({
        status: "failed",
        error_message: "AI returned unparseable response",
        raw_feedback: { raw: rawContent },
      }).eq("id", analysisId);
      return new Response(JSON.stringify({ error: "parse_failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 8. Store results ──────────────────────────────────────────────────────
    const { error: updateError } = await supabase.from("pitch_analyses").update({
      status: "completed",
      overall_score: parsed.overall_score,
      product_knowledge_score: parsed.product_knowledge_score,
      needs_discovery_score: parsed.needs_discovery_score,
      objection_handling_score: parsed.objection_handling_score,
      closing_technique_score: parsed.closing_technique_score,
      communication_score: parsed.communication_score,
      executive_summary: parsed.executive_summary,
      strengths: JSON.stringify(parsed.strengths || []),
      improvement_areas: JSON.stringify(parsed.improvement_areas || []),
      missed_key_points: JSON.stringify(parsed.missed_key_points || []),
      recommended_follow_up: JSON.stringify(parsed.recommended_follow_up || []),
      detailed_rubric: JSON.stringify(parsed.detailed_rubric || {}),
      raw_feedback: { raw: rawContent },
    }).eq("id", analysisId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(JSON.stringify({ success: true, analysisId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-pitch-video error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
