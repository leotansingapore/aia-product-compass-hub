import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { PitchAnalysisCompleteEmail } from "./_templates/pitch-analysis-complete.tsx";

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

async function getLoomTranscriptDirect(videoId: string): Promise<string | null> {
  // Loom exposes a public transcript endpoint for videos that have transcripts enabled
  try {
    // Try the transcript API endpoint directly
    const apiUrl = `https://www.loom.com/api/transcripts/${videoId}`;
    console.log("Trying Loom transcript API:", apiUrl);
    const resp = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": `https://www.loom.com/share/${videoId}`,
      },
    });

    if (resp.ok) {
      const data = await resp.json();
      // Loom transcript format: { transcript: [ { startTime, endTime, text } ] } or similar
      const segments: any[] = data?.transcript ?? data?.segments ?? data?.captions ?? [];
      if (Array.isArray(segments) && segments.length > 0) {
        const text = segments
          .map((s: any) => s.text ?? s.caption ?? s.content ?? "")
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length > 50) {
          console.log("Loom transcript API succeeded, chars:", text.length);
          return text;
        }
      }
      // Maybe raw text
      if (typeof data?.text === "string" && data.text.length > 50) return data.text;
    }

    // Try the CDN-hosted transcript VTT/JSON
    const videoPageResp = await fetch(`https://www.loom.com/share/${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!videoPageResp.ok) return null;
    const html = await videoPageResp.text();

    // Look for __NEXT_DATA__ JSON which contains Loom's full page state
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nextDataMatch) {
      try {
        const pageData = JSON.parse(nextDataMatch[1]);
        const str = JSON.stringify(pageData);

        // Find transcript URL in the page data (Loom stores it as a CDN URL)
        const transcriptUrlMatch = str.match(/"transcriptUrl"\s*:\s*"([^"]+)"/);
        if (transcriptUrlMatch) {
          const transcriptUrl = transcriptUrlMatch[1].replace(/\\u0026/g, "&");
          console.log("Found Loom transcript URL:", transcriptUrl.slice(0, 80));
          const tResp = await fetch(transcriptUrl);
          if (tResp.ok) {
            const contentType = tResp.headers.get("content-type") || "";
            const tText = await tResp.text();
            // VTT format — strip timestamps and headers
            if (contentType.includes("vtt") || tText.startsWith("WEBVTT")) {
              const lines = tText.split("\n");
              const textLines = lines.filter(l =>
                l.trim() &&
                !l.startsWith("WEBVTT") &&
                !l.startsWith("NOTE") &&
                !/^\d{2}:\d{2}/.test(l) &&  // timestamps
                !/^[\d]+$/.test(l.trim())    // cue numbers
              );
              const vttText = textLines.join(" ").replace(/\s+/g, " ").trim();
              if (vttText.length > 50) {
                console.log("Loom VTT transcript extracted, chars:", vttText.length);
                return vttText;
              }
            }
            // Try JSON format
            try {
              const tJson = JSON.parse(tText);
              const segs: any[] = tJson?.transcript ?? tJson?.segments ?? tJson?.captions ?? [];
              if (Array.isArray(segs) && segs.length > 0) {
                const text = segs.map((s: any) => s.text ?? s.caption ?? "").filter(Boolean).join(" ").trim();
                if (text.length > 50) return text;
              }
            } catch { /* not JSON */ }
          }
        }

        // Also try extracting transcript segments directly from page data
        const transcriptMatch = str.match(/"transcript"\s*:\s*\[([^\]]{100,})\]/);
        if (transcriptMatch) {
          try {
            const segs = JSON.parse(`[${transcriptMatch[1]}]`);
            const text = segs.map((s: any) => s.text ?? s.content ?? "").filter(Boolean).join(" ").trim();
            if (text.length > 50) return text;
          } catch { /* continue */ }
        }
      } catch { /* JSON parse failed */ }
    }

    return null;
  } catch (e) {
    console.error("Loom direct transcript failed:", e);
    return null;
  }
}

async function getLoomTranscriptViaFirecrawl(videoId: string, firecrawlKey: string): Promise<string | null> {
  try {
    const shareUrl = `https://www.loom.com/share/${videoId}`;
    console.log("Firecrawl scraping Loom:", shareUrl);

    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({
        url: shareUrl,
        formats: ["markdown"],
        actions: [
          { type: "wait", milliseconds: 4000 },
          // Scroll down to trigger lazy-loaded transcript
          { type: "scroll", direction: "down", amount: 800 },
          { type: "wait", milliseconds: 1000 },
        ],
        onlyMainContent: false,
        waitFor: 3000,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Firecrawl error:", resp.status, errText);
      return null;
    }

    const data = await resp.json();
    const markdown: string = data?.data?.markdown || "";
    console.log("Firecrawl markdown length:", markdown.length, "preview:", markdown.slice(0, 200));

    if (!markdown) return null;

    const lines = markdown.split("\n");
    const transcriptLines: string[] = [];
    let inTranscriptSection = false;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("transcript") || lower.includes("caption")) {
        inTranscriptSection = true;
        continue;
      }
      if (inTranscriptSection) {
        if (line.startsWith("## ") || line.startsWith("# ")) break;
        const clean = line.replace(/^\s*[-*•]\s*/, "").replace(/\*\*/g, "").trim();
        if (clean && !/^\[?\d+:\d+\]?$/.test(clean) && clean.length > 3) {
          transcriptLines.push(clean);
        }
      }
    }

    if (transcriptLines.length > 5) {
      const joined = transcriptLines.join(" ").replace(/\s+/g, " ").trim();
      // Make sure it's actual speech, not nav/UI text
      if (joined.split(" ").length > 20) return joined;
    }

    return null;
  } catch (e) {
    console.error("Loom Firecrawl extraction failed:", e);
    return null;
  }
}

async function getLoomTranscriptFallback(videoId: string): Promise<string | null> {
  // Fallback: raw HTML fetch (less reliable for JS-heavy pages)
  try {
    const shareUrl = `https://www.loom.com/share/${videoId}`;
    const resp = await fetch(shareUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nextDataMatch) {
      const str = JSON.stringify(JSON.parse(nextDataMatch[1]));
      const transcriptMatch = str.match(/"transcript"\s*:\s*"([^"]{100,})"/);
      if (transcriptMatch) return transcriptMatch[1].replace(/\\n/g, " ").replace(/\\"/g, '"');
      const captionsMatch = str.match(/"captions"\s*:\s*(\[[^\]]{50,}\])/);
      if (captionsMatch) {
        try {
          const captions = JSON.parse(captionsMatch[1]);
          if (Array.isArray(captions)) {
            return captions.map((c: any) => c.text || c.caption || "").filter(Boolean).join(" ").trim();
          }
        } catch { /* continue */ }
      }
    }
    return null;
  } catch (e) {
    console.error("Loom fallback scrape failed:", e);
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
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

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
          // Try Firecrawl first (JS-rendered page scraping) then fallback to raw HTML
          if (firecrawlKey) {
            console.log("Attempting Loom transcript via Firecrawl...");
            transcript = (await getLoomTranscriptViaFirecrawl(loomId, firecrawlKey)) || "";
          }
          if (!transcript || transcript.length < 50) {
            console.log("Firecrawl failed or unavailable, trying raw HTML fallback...");
            transcript = (await getLoomTranscriptFallback(loomId)) || "";
          }
          transcriptSource = "loom";
        }
      }
    }

    if (!transcript || transcript.length < 50) {
      await supabase.from("pitch_analyses").update({
        status: "needs_transcript",
        error_message: "Auto-extraction failed. Please paste the transcript manually to continue.",
      }).eq("id", analysisId);
      return new Response(JSON.stringify({ error: "transcript_unavailable", needs_manual: true }), {
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
      // Include product highlights and description first
      if (product.highlights?.length) {
        knowledgeContext = `Product Highlights:\n${product.highlights.join("\n")}\n\n`;
      }
      if (product.description) {
        knowledgeContext = `Product Description: ${product.description}\n\n` + knowledgeContext;
      }

      // Try RAG search — wrap fully so any vector/embedding errors don't crash the function
      try {
        const queryText = "Pro Achiever investment linked policy features benefits pitch ILP returns guaranteed";
        const embedding = await embedText(queryText, supabaseUrl, serviceKey);

        if (embedding) {
          const { data: chunks, error: ragError } = await supabase.rpc("hybrid_search_knowledge_chunks", {
            query_embedding: embedding,
            query_text: queryText,
            match_count: 12,
            filter_product_id: realProductId,
          });

          if (ragError) {
            console.warn("RAG search error (non-fatal):", ragError.message);
          } else if (chunks && chunks.length > 0) {
            knowledgeContext += chunks
              .slice(0, 10)
              .map((c: any, i: number) => `[KB ${i + 1}] ${c.content}`)
              .join("\n\n");
          }
        }
      } catch (ragErr) {
        console.warn("RAG embedding step failed (non-fatal):", ragErr);
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

    // ── 9. Send email notification ──────────────────────────────────────────
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && userId) {
      try {
        // Fetch user profile email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name, first_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (profile?.email) {
          const resend = new Resend(resendApiKey);
          const userName = profile.display_name || profile.first_name || "Advisor";
          const appUrl = "https://academy.finternship.com";
          const feedbackUrl = `${appUrl}/roleplay/pitch-analysis`;

          const html = await renderAsync(
            React.createElement(PitchAnalysisCompleteEmail, {
              userName,
              videoTitle: parsed.video_title || videoUrl,
              overallScore: parsed.overall_score || 0,
              productKnowledgeScore: parsed.product_knowledge_score || 0,
              needsDiscoveryScore: parsed.needs_discovery_score || 0,
              objectionHandlingScore: parsed.objection_handling_score || 0,
              closingTechniqueScore: parsed.closing_technique_score || 0,
              communicationScore: parsed.communication_score || 0,
              executiveSummary: parsed.executive_summary || "",
              feedbackUrl,
            })
          );

          await resend.emails.send({
            from: "FINternship <noreply@mail.themoneybees.co>",
            to: [profile.email],
            subject: `📊 Your Pitch Analysis is Ready — Score: ${parsed.overall_score || 0}/10`,
            html,
          });
          console.log("Pitch analysis email sent to:", profile.email);
        }
      } catch (emailErr) {
        // Non-fatal — log but don't fail the response
        console.error("Failed to send pitch analysis email:", emailErr);
      }
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
