import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch existing concept card images from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cards, error: fetchError } = await supabase
      .from("concept_cards")
      .select("id, title, image_url, original_image_url, image_urls")
      .not("image_url", "is", null);

    if (fetchError) throw fetchError;
    if (!cards || cards.length === 0) {
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a list of reference images (up to 8 to keep the prompt manageable)
    const references: { id: string; title: string; url: string }[] = [];
    for (const card of cards) {
      const url = card.image_url || card.original_image_url;
      if (url) references.push({ id: card.id, title: card.title, url });
      if (references.length >= 8) break;
    }

    if (references.length === 0) {
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
      const errText = await aiResponse.text();
      console.error("AI duplicate check error:", aiResponse.status, errText);
      // Return non-blocking on AI error — don't block the upload
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null, aiError: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("check-duplicate-concept-image error:", e);
    // Non-blocking — return safe default on error
    return new Response(JSON.stringify({ isDuplicate: false, similarity: 0, matchedCard: null, aiError: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
