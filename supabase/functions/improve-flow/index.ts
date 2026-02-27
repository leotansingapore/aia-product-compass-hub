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
    const { instruction, currentNodes, currentEdges, flowTitle } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an AI assistant that helps financial advisors in Singapore build and improve sales flowcharts. You receive the current flow (nodes + edges) and a user instruction, then return the updated full flow.

Node types available:
- "start": Entry point of the flow
- "script": A step where the advisor says/does something (e.g. make a call, send a text)
- "decision": A yes/no branching point (e.g. "Did they answer?", "Interested?")
- "action": A wait or follow-up step (e.g. "Wait 2 days")
- "end": Terminal node (e.g. "Meeting Booked", "Mark as Cold")

Edge conditions: "yes", "no", "no-reply", or "custom"

Layout rules:
- Start at y=50, increment y by ~120 for each row
- For branching, offset x: left branch at x=200, right at x=600, center at x=400
- Node IDs: use simple strings like "n1", "n2", "n3"... or descriptive ones

IMPORTANT:
- Always return the COMPLETE updated flow (all nodes + edges), not just the changes.
- When adding nodes, assign new unique IDs (don't reuse existing ones).
- Keep existing node IDs stable unless explicitly asked to change them.
- Every node must have: id, label (max 30 chars), type, x, y
- Every edge must have: id, from, to (optionally: label, condition)
- Provide a brief human-readable description of what you changed.`;

    const userPrompt = `Flow title: "${flowTitle || "Untitled Flow"}"

Current flow nodes:
${JSON.stringify(currentNodes, null, 2)}

Current flow edges:
${JSON.stringify(currentEdges, null, 2)}

User instruction: ${instruction}

Apply the instruction and return the complete updated flow.`;

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
                name: "update_flow",
                description: "Return the complete updated flow with all nodes and edges",
                parameters: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "string",
                      description: "Brief description of what was changed (1-2 sentences)",
                    },
                    nodes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          label: { type: "string" },
                          type: {
                            type: "string",
                            enum: ["start", "script", "decision", "action", "end"],
                          },
                          x: { type: "number" },
                          y: { type: "number" },
                        },
                        required: ["id", "label", "type", "x", "y"],
                        additionalProperties: false,
                      },
                    },
                    edges: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          from: { type: "string" },
                          to: { type: "string" },
                          label: { type: "string" },
                          condition: {
                            type: "string",
                            enum: ["yes", "no", "no-reply", "custom"],
                          },
                        },
                        required: ["id", "from", "to"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["summary", "nodes", "edges"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "update_flow" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
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

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return a valid flow update");
    }

    const result = JSON.parse(toolCall.function.arguments);
    result.nodes = result.nodes.map((n: any) => ({ ...n, scriptId: n.scriptId ?? null }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("improve-flow error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
