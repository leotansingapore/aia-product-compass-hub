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
    const { playbookTitle, playbookDescription, existingScripts, availableScripts } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a sales training assistant for financial advisors in Singapore. You help curate script playbooks — ordered collections of sales scripts that advisors follow sequentially.

Given a playbook's current scripts and a list of available scripts NOT yet in the playbook, suggest which scripts should be added and in what order they'd fit best.

Consider:
- The playbook's stated purpose/goal
- Logical flow: what comes before/after in a sales conversation
- Target audience consistency
- Coverage gaps (e.g. missing follow-up, missing objection handling)
- Don't suggest scripts that don't fit the playbook's theme`;

    const existingList = existingScripts.map((s: any, i: number) =>
      `${i + 1}. "${s.stage}" [${s.category}] (audience: ${s.target_audience || 'general'})`
    ).join("\n");

    const availableList = availableScripts.map((s: any) =>
      `- id:"${s.id}" | "${s.stage}" [${s.category}] (audience: ${s.target_audience || 'general'}, tags: ${(s.tags || []).join(', ') || 'none'})`
    ).join("\n");

    const userPrompt = `Playbook: "${playbookTitle}"
Description: ${playbookDescription || "No description"}

Current scripts in order:
${existingList || "(empty playbook)"}

Available scripts to suggest from:
${availableList}

Suggest 3-6 scripts from the available list that would complement this playbook. For each, explain briefly why it fits.`;

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
                description: "Suggest scripts to add to the playbook",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          script_id: { type: "string", description: "The id of the script to suggest" },
                          reason: { type: "string", description: "Brief reason why this script fits (1-2 sentences)" },
                          suggested_position: { type: "string", description: "Where in the playbook it should go, e.g. 'after step 2', 'at the end', 'at the beginning'" },
                        },
                        required: ["script_id", "reason", "suggested_position"],
                        additionalProperties: false,
                      },
                    },
                    summary: {
                      type: "string",
                      description: "A brief overall summary of what gaps these suggestions fill",
                    },
                  },
                  required: ["suggestions", "summary"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "suggest_scripts" },
          },
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

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return valid suggestions");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-playbook-scripts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
