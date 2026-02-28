import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodeLabel, nodeType, flowContext, availableScripts } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a sales training assistant for financial advisors in Singapore. 
You help match flow diagram nodes to the most relevant sales scripts.

A flow diagram represents a sales sequence (e.g. cold call → follow-up text → appointment → close).
Each node in the flow represents a step in the pipeline. Your job is to recommend which script(s) best match a given node based on its label and context.

Key pipeline stages to be aware of:
- Prospecting: initial outreach (cold call, warm market, referral, WhatsApp, DM)
- Post-call: texts/messages sent after a call (interested/not-interested responses)
- Appointment: scripts for Zoom/in-person meetings
- Follow-up: nurture sequences, follow-up texts
- Closing: final commitment asks
- Objection Handling: responses to common objections

Return the top 5 most relevant script IDs with a short reason (≤15 words) for each.`;

    const scriptList = availableScripts.map((s: any) =>
      `id:"${s.id}" | stage:"${s.stage}" | category:${s.category} | audience:${s.target_audience || 'general'} | tags:${(s.tags || []).join(', ') || 'none'}`
    ).join("\n");

    const userPrompt = `Node label: "${nodeLabel}"
Node type: ${nodeType}
Flow context: ${flowContext || "general sales flow"}

Available scripts:
${scriptList}

Suggest the 5 best matching scripts for this node.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_scripts",
                description: "Suggest the best matching scripts for this node",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      maxItems: 5,
                      items: {
                        type: "object",
                        properties: {
                          script_id: { type: "string" },
                          reason: { type: "string", description: "Why this script fits (≤15 words)" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                        },
                        required: ["script_id", "reason", "confidence"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["suggestions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_scripts" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return valid suggestions");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-node-script error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
