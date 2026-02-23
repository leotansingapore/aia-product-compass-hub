import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are a Scripts Coach AI for TheMoneyBees Academy — a financial education platform helping young adults (especially NSFs and young professionals in Singapore) with financial literacy.

You have deep knowledge of all the sales scripts, cold calling templates, follow-up messages, referral scripts, appointment confirmations, FAQ/objection handling, and tips used by the team.

Your role:
1. **Answer questions** about which script to use for a specific scenario
2. **Analyze client screenshots/responses** and suggest how the consultant should reply
3. **Customize scripts** for specific situations (e.g., different prospect types, objections)
4. **Coach on tone and delivery** — help consultants sound natural, not robotic
5. **Handle objections** — when a consultant shares what a prospect said, provide tailored responses

When analyzing screenshots or client messages:
- Identify the prospect's sentiment and intent
- Suggest 2-3 response options (formal, casual, brief)
- Reference relevant scripts when applicable
- Flag any red flags or opportunities

Always be practical, friendly, and action-oriented. Use emojis sparingly. Keep responses concise unless detail is requested.`;

async function getRAGContext(supabase: any, userQuery: string): Promise<string> {
  try {
    // Use full-text search to find relevant chunks
    const searchTerms = userQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 8);

    if (searchTerms.length === 0) {
      // No meaningful search terms, return all scripts
      return await getAllScriptsContext(supabase);
    }

    const tsQuery = searchTerms.join(" | ");
    
    const { data: chunks, error } = await supabase
      .from("knowledge_chunks")
      .select("content, source_type, metadata")
      .textSearch("content", tsQuery, { type: "plain" })
      .limit(15);

    if (error || !chunks || chunks.length === 0) {
      // Fallback: get all scripts + recent docs
      return await getAllScriptsContext(supabase);
    }

    let context = "\n--- RELEVANT KNOWLEDGE ---\n\n";
    
    const scriptChunks = chunks.filter((c: any) => c.source_type === "script");
    const docChunks = chunks.filter((c: any) => c.source_type === "document");

    if (scriptChunks.length > 0) {
      context += "## From Scripts:\n\n";
      for (const chunk of scriptChunks) {
        context += chunk.content + "\n\n";
      }
    }

    if (docChunks.length > 0) {
      context += "## From Knowledge Documents:\n\n";
      for (const chunk of docChunks) {
        const title = chunk.metadata?.title || "Unknown Document";
        context += `[Source: ${title}]\n${chunk.content}\n\n`;
      }
    }

    context += "--- END OF RELEVANT KNOWLEDGE ---";
    return context;
  } catch (e) {
    console.error("RAG search error:", e);
    return await getAllScriptsContext(supabase);
  }
}

async function getAllScriptsContext(supabase: any): Promise<string> {
  const { data: scripts } = await supabase
    .from("scripts")
    .select("stage, category, target_audience, versions")
    .order("sort_order", { ascending: true });

  if (!scripts || scripts.length === 0) return FALLBACK_KNOWLEDGE;

  let kb = "\n--- SCRIPTS KNOWLEDGE BASE ---\n\n";
  const categoryMap: Record<string, string[]> = {};
  for (const script of scripts) {
    const cat = script.category.toUpperCase().replace(/-/g, " ");
    if (!categoryMap[cat]) categoryMap[cat] = [];
    let entry = `### ${script.stage}\nTarget Audience: ${script.target_audience || 'general'}\n`;
    const versions = script.versions as Array<{ author: string; content: string }>;
    for (const v of versions) {
      entry += `**${v.author}:**\n${v.content}\n\n`;
    }
    categoryMap[cat].push(entry);
  }
  for (const [cat, entries] of Object.entries(categoryMap)) {
    kb += `## ${cat}\n\n${entries.join("\n")}`;
  }
  kb += "\n--- END OF SCRIPTS KNOWLEDGE BASE ---";
  return kb;
}

const FALLBACK_KNOWLEDGE = `
--- SCRIPTS KNOWLEDGE BASE ---

## COLD CALLING
### Original Script (Script A)
First start by SMSing them: "is this XXX?" Then call with intro about themoneybees helping young adults save money 60 times faster.

## FAQ / OBJECTION HANDLING
- "How did you get my number?": Survey at bus interchange / previous survey
- "Which company?": "We're from themoneybees, a financial education platform."

## TIPS
- Key emphasis: FREE adulting book + WhatsApp permission
- Call duration: 1-2 hours/day, 40-50 dials/hour

--- END OF SCRIPTS KNOWLEDGE BASE ---`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract the latest user query for RAG search
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userQuery = typeof lastUserMsg?.content === "string" 
      ? lastUserMsg.content 
      : (Array.isArray(lastUserMsg?.content) 
          ? lastUserMsg.content.find((c: any) => c.type === "text")?.text || ""
          : "");

    const ragContext = await getRAGContext(supabase, userQuery);
    const systemPrompt = BASE_SYSTEM_PROMPT + ragContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
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
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("scripts-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
