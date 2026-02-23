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
    const { targetAudience, goal, context, numSteps } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a sales flow builder for financial advisors in Singapore. You create structured sales/prospecting flowcharts.

Given a target audience, goal, and context, generate a flow with nodes and edges.

Node types:
- "start": The entry point of the flow
- "script": A step where the advisor says/does something (e.g. make a call, send a text)
- "decision": A yes/no branching point (e.g. "Did they answer?", "Interested?")
- "action": A wait or follow-up step (e.g. "Wait 2 days")
- "end": Terminal node (e.g. "Meeting Booked", "Mark as Cold")

Edge conditions: "yes", "no", "no-reply", or "custom"

Layout the nodes vertically with proper spacing:
- Start at y=50, increment y by ~120 for each row
- For branching, offset x: left branch at x=200, right at x=600, center at x=400
- Decision nodes should branch into 2-3 paths

Make the flow practical and specific to the financial advisory context in Singapore. Use realistic step names like "Send WhatsApp intro", "Cold Call", "Offer Adulting Guidebook", etc.`;

    const userPrompt = `Create a sales flow for:
- Target Audience: ${targetAudience}
- Goal: ${goal}
- Additional Context: ${context || "None"}
- Desired number of steps: ${numSteps || "6-10"}

Generate a practical, actionable flow.`;

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
                name: "create_flow",
                description:
                  "Create a sales flow with nodes and edges for the flowchart builder",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "A short descriptive title for the flow",
                    },
                    description: {
                      type: "string",
                      description:
                        "A one-sentence description of what this flow does",
                    },
                    nodes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          label: {
                            type: "string",
                            description: "Short label for the node (max 25 chars)",
                          },
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
                  required: ["title", "description", "nodes", "edges"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_flow" },
          },
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
      throw new Error("AI did not return a valid flow");
    }

    const flow = JSON.parse(toolCall.function.arguments);

    // Ensure scriptId is null on all nodes
    flow.nodes = flow.nodes.map((n: any) => ({ ...n, scriptId: null }));

    return new Response(JSON.stringify(flow), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-flow error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
