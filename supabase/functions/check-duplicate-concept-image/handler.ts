import { openaiFetch } from "../_shared/openaiChat.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Library images per model call, and the newest cards compared in all.
// shortcut: cards older than the newest MAX_CARDS are not compared; raise it as the library grows.
const BATCH_SIZE = 16;
const MAX_CARDS = 160;

type Reference = { id: string; title: string; url: string };
type Verdict = {
  isDuplicate: boolean;
  isSimilar: boolean;
  similarity: number;
  matchedCardId: string;
  matchedCardTitle: string;
  reason: string;
};

// deno-lint-ignore no-explicit-any
export async function handle(req: Request, deps: { supabase: any }): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) throw new Error("No AI API key is configured");
    const useOwnKey = !!OPENAI_API_KEY;

    const { data: cards, error: fetchError } = await deps.supabase
      .from("concept_cards")
      .select("id, title, image_url, original_image_url, image_urls")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(MAX_CARDS);

    if (fetchError) throw fetchError;
    if (!cards || cards.length === 0) {
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const references: Reference[] = [];
    for (const card of cards) {
      const url = card.image_url || card.original_image_url;
      if (url) references.push({ id: card.id, title: card.title, url });
    }

    if (references.length === 0) {
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Every batch must answer: one unanswered batch means its cards were never compared,
    // so the upload is not called unique. The closest match across batches wins.
    const batches: Reference[][] = [];
    for (let i = 0; i < references.length; i += BATCH_SIZE) batches.push(references.slice(i, i + BATCH_SIZE));
    const verdicts = await Promise.all(
      batches.map((batch) => compareBatch(imageBase64, batch, useOwnKey, useOwnKey ? OPENAI_API_KEY! : LOVABLE_API_KEY!)),
    );
    const best = verdicts.sort((a, b) => Number(b.isDuplicate) - Number(a.isDuplicate) || b.similarity - a.similarity)[0];

    return new Response(JSON.stringify(best), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("check-duplicate-concept-image error:", e);
    // An unchecked image is not a unique one: say the check failed.
    return new Response(JSON.stringify({ error: `Duplicate check failed: ${e instanceof Error ? e.message : String(e)}` }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function compareBatch(imageBase64: string, references: Reference[], useOwnKey: boolean, key: string): Promise<Verdict> {
  // Build message content: new image first, then references
  const content: object[] = [
    {
      type: "text",
      text: `You are a duplicate image detector for a concept card library.\n\nI will show you a NEW image that someone wants to upload, followed by ${references.length} EXISTING images already in the library.\n\nDetermine if the new image is a duplicate or very similar to any existing image.\n\nTwo images are considered duplicates/similar if they depict the same diagram, concept drawing, or visual content — even if one is a cleaner/enhanced version of the other.\n\nUse the check_duplicate function to return your findings.`,
    },
    {
      type: "image_url",
      image_url: { url: imageBase64, detail: "low" },
    },
    { type: "text", text: "— The above is the NEW image to check. Below are the EXISTING library images —" },
  ];

  references.forEach((ref, i) => {
    content.push({ type: "text", text: `Existing image ${i + 1}: "${ref.title}" (id: ${ref.id})` });
    content.push({ type: "image_url", image_url: { url: ref.url, detail: "low" } });
  });

  const aiResponse = await openaiFetch((useOwnKey ? "https://api.openai.com/v1/chat/completions" : "https://ai.gateway.lovable.dev/v1/chat/completions"), {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: useOwnKey ? "gpt-4o-mini" : "google/gemini-2.5-flash",
      messages: [{ role: "user", content }],
      tools: [
        {
          type: "function",
          function: {
            name: "check_duplicate",
            description: "Report whether the new image is a duplicate or very similar to any existing image.",
            parameters: {
              type: "object",
              properties: {
                isDuplicate: {
                  type: "boolean",
                  description: "True if the new image is visually identical or near-identical to an existing image (same diagram/concept)"
                },
                isSimilar: {
                  type: "boolean",
                  description: "True if the new image depicts the same concept/topic as an existing image but is noticeably different (e.g. different drawing style)"
                },
                similarity: {
                  type: "number",
                  description: "Similarity score 0–100. 90+ = duplicate, 60–89 = very similar, below 60 = different"
                },
                matchedCardId: {
                  type: "string",
                  description: "The id of the most similar existing card, or empty string if none"
                },
                matchedCardTitle: {
                  type: "string",
                  description: "The title of the most similar existing card, or empty string if none"
                },
                reason: {
                  type: "string",
                  description: "One sentence explaining the similarity or why it's considered unique"
                }
              },
              required: ["isDuplicate", "isSimilar", "similarity", "matchedCardId", "matchedCardTitle", "reason"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "check_duplicate" } },
    }),
  });

  if (!aiResponse.ok) {
    throw new Error(`AI answered ${aiResponse.status}: ${(await aiResponse.text()).slice(0, 300)}`);
  }
  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI gave no verdict");
  const verdict = JSON.parse(toolCall.function.arguments) as Verdict;
  if (typeof verdict.isDuplicate !== "boolean" || typeof verdict.similarity !== "number") {
    throw new Error("AI verdict is missing isDuplicate or similarity");
  }
  // "Replace" and "add as version" write to the matched card, so it must be one we showed.
  if ((verdict.isDuplicate || verdict.isSimilar) && !references.some((r) => r.id === verdict.matchedCardId)) {
    throw new Error(`AI matched a card it was not shown: ${verdict.matchedCardId}`);
  }
  return verdict;
}
