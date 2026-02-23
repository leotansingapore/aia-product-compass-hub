import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "generic", "tactical", "product", "pricing", "trust", "timing"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a classifier for a financial advisory objection handling database. Given raw text about a client objection (or multiple objections), extract structured objection entries.

The text may contain one or multiple objections. For each objection found, determine:

1. **title** — A concise objection statement in quotes, e.g. "I already have an agent" or "I need to check with my spouse first"
2. **category** — one of: ${CATEGORIES.join(", ")}
   - generic: general objections like "not interested", "no time"
   - tactical: stalling tactics like "checking with spouse", "need to think about it"
   - product: objections about specific product features or suitability
   - pricing: objections about cost, fees, affordability
   - trust: credibility concerns like "I don't trust insurance companies"
   - timing: delay tactics like "maybe next year", "not the right time"
3. **description** — Brief context about when/why this objection arises (1-2 sentences)
4. **tags** — 2-4 relevant lowercase tags from: common, nsf, young-adult, working-adult, pre-retiree, parent, hnw, cold-lead, warm-market, phone, whatsapp, face-to-face, first-meeting, follow-up, closing, ghosting, stalling, price-sensitive, competitor
5. **initial_response** — If the pasted text includes a suggested response/rebuttal, include it here. Otherwise leave empty string.

Return an array of objection objects. If the text clearly describes just one objection, return an array with one item.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Objection text:\n${content.slice(0, 4000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_objections",
            description: "Classify one or more client objections from pasted text.",
            parameters: {
              type: "object",
              properties: {
                objections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      category: { type: "string", enum: CATEGORIES },
                      description: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      initial_response: { type: "string" },
                    },
                    required: ["title", "category", "description", "tags", "initial_response"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["objections"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_objections" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI classification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No classification result");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-objection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
