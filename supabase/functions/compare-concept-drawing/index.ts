import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userDrawingBase64, referenceImageUrl, cardTitle } = await req.json();

    if (!userDrawingBase64 || !referenceImageUrl) {
      return new Response(JSON.stringify({ error: "userDrawingBase64 and referenceImageUrl are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert visual learning coach who evaluates hand-drawn concept diagrams for financial advisors in training.
Your job is to compare a student's drawing with the reference concept drawing and give constructive feedback.

Return your analysis as a JSON object using the compare_drawings function. Be encouraging but honest.
Score from 0–100:
- 90–100: Excellent — nearly identical structure and content
- 70–89: Good — main concept captured, minor details missing
- 50–69: Fair — key elements present but structure/labels incomplete
- 30–49: Partial — some relevant content but significant gaps
- 0–29: Needs work — significantly different from reference`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please compare these two drawings about "${cardTitle || 'a financial concept'}".\n\nImage 1 is the REFERENCE (the correct concept drawing).\nImage 2 is the STUDENT'S attempt.\n\nEvaluate how well the student's drawing captures the reference concept.`,
              },
              {
                type: "image_url",
                image_url: { url: referenceImageUrl },
              },
              {
                type: "image_url",
                image_url: { url: userDrawingBase64 },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "compare_drawings",
              description: "Return similarity score and structured feedback comparing the student drawing to the reference.",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Similarity score from 0 to 100"
                  },
                  grade: {
                    type: "string",
                    enum: ["Excellent", "Good", "Fair", "Partial", "Needs Work"],
                    description: "Letter-grade equivalent"
                  },
                  summary: {
                    type: "string",
                    description: "One-sentence overall assessment (max 120 chars)"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "2–3 specific things the student drew correctly"
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "2–3 specific things missing or incorrect"
                  },
                  tip: {
                    type: "string",
                    description: "One actionable tip to improve next attempt (max 150 chars)"
                  }
                },
                required: ["score", "grade", "summary", "strengths", "improvements", "tip"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "compare_drawings" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI compare error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI comparison failed", details: errText }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No comparison result from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("compare-concept-drawing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
