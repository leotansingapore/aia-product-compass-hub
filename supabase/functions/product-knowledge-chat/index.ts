import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FEEDBACK_DOORS_PROMPT } from "../_shared/feedback-doors.ts";
import { openaiFetch } from "../_shared/openaiChat.ts";
import { aliasFilter, retrieveChunks, termFilter, type ChunkStore } from "./retrieval.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_HISTORY_MESSAGES = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, productId, mode } = await req.json();

    // Prefer the team's own OpenAI key — the Lovable AI gateway runs on
    // prepaid credits and returns 402 when they run out. Both endpoints use
    // the same OpenAI-compatible request/stream shape.
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) throw new Error("No AI API key is configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch product overview (always included)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Get the user's latest message for semantic search
    const latestUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    const queryText = typeof latestUserMessage?.content === "string"
      ? latestUserMessage.content
      : Array.isArray(latestUserMessage?.content)
        ? latestUserMessage.content.find((c: any) => c.type === "text")?.text || ""
        : "";

    // No generate-embeddings call: its vectors are hashed keywords, not meaning,
    // and the search weighted them 0, so each turn paid an LLM call for nothing.
    const cols = "content, source_type, source_id, metadata";
    const store: ChunkStore = {
      productChunks: async (id, terms, cap) => {
        let q = supabase.from("knowledge_chunks").select(cols).or(`source_id.eq.${id},product_id.eq.${id}`);
        if (terms.length) q = q.or(termFilter(terms));
        const { data, error } = await q.order("created_at", { ascending: true }).limit(cap);
        return { rows: data ?? [], error: error?.message ?? null };
      },
      curriculumChunks: async (aliases, terms, cap) => {
        let q = supabase.from("knowledge_chunks").select(cols).eq("source_type", "curriculum").or(aliasFilter(aliases));
        if (terms.length) q = q.or(termFilter(terms));
        const { data, error } = await q.order("source_id", { ascending: true }).limit(cap);
        return { rows: data ?? [], error: error?.message ?? null };
      },
    };
    const relevantChunks = await retrieveChunks(store, product, queryText);

    // Build context from relevant chunks
    const chunkContext = relevantChunks
      .map((c) => {
        const source = c.source_type === "training_video"
          ? `Lecture: ${c.metadata?.video_title || "Unknown"}`
          : c.source_type === "document"
            ? `Document: ${c.metadata?.title || "Unknown"}`
            : c.source_type === "curriculum"
              ? "Curriculum (track, day and Link are in the first lines)"
              : `Source: ${c.source_type}`;
        return `--- ${source} ---\n${c.content}`;
      })
      .join("\n\n");

    // Mode-specific instructions
    const modeInstructions: Record<string, string> = {
      knowledge: `\n\n## MODE: KNOWLEDGE Q&A
- Be concise and factual. Use bullet points and tables where appropriate.
- Answer directly without sales language or persuasive framing.
- If the answer isn't in your knowledge base, say so clearly.
- Think of yourself as a product encyclopedia — accurate, structured, brief.`,
      sales: `\n\n## MODE: SALES COACH
- Be a sales coach. Provide scripts, talking points, and analogies the advisor can use verbatim.
- Help the advisor sell effectively with positioning strategies and closing techniques.
- Use role-play scenarios when helpful — e.g. "Here's how you could say it..."
- Be conversational, motivating, and actionable.`,
      objections: `\n\n## MODE: OBJECTION HANDLING
- Focus on objection handling using the 4-step framework:
  1. **Acknowledge** — validate the client's concern casually
  2. **Common Ground** — establish relatability
  3. **Different Perspective** — pivot the value proposition
  4. **Safety Valve** — give the client control
- Always structure responses as: **Objection → Acknowledgment → Reframe → Suggested Response**
- Provide word-for-word scripts the advisor can adapt.`,
      roleplay: `\n\n## MODE: ROLE PLAY (CLIENT SIMULATION)
You are NOW playing the role of a **skeptical prospective client**, NOT an AI assistant. Stay in character at all times.

### YOUR CHARACTER
- You are a potential client considering financial products
- You are skeptical, ask tough questions, and don't commit easily
- You have realistic concerns: cost, trust, existing policies, opportunity cost
- You respond naturally like a real person in a meeting — short sentences, pushback, follow-up questions
- Do NOT break character unless the user says "end session"

### RULES
- Let the advisor pitch to you. React realistically.
- Push back with 1-2 objections per response. Don't make it too easy.
- Ask clarifying questions a real client would ask
- If the advisor makes a strong point, acknowledge it but raise a new concern
- Keep responses conversational and brief (2-4 sentences max)

### WHEN USER SAYS "end session"
Break character and provide a **performance scorecard** in this format:

---
## 🎯 Role Play Scorecard

| Category | Score (1-10) | Notes |
|----------|-------------|-------|
| **Opening & Rapport** | X | ... |
| **Product Knowledge** | X | ... |
| **Needs Discovery** | X | ... |
| **Objection Handling** | X | ... |
| **Closing Technique** | X | ... |
| **Overall Confidence** | X | ... |

### 📊 Overall Score: X/10

### ✅ Strengths
- ...

### 🔧 Areas to Improve
- ...

### 💡 Pro Tips
- ...
---`,
    };

    const activeMode = mode || 'knowledge';

    // Build system prompt
    const systemPrompt = `You are **${product.title} Expert** — an AI sales coach and product specialist for AIA's ${product.title} product.

## YOUR ROLE
You help financial advisors and sales consultants:
1. **Learn the product** — features, benefits, mechanics, fund options, charges, bonuses
2. **Handle objections** — common client pushbacks and how to address them persuasively
3. **Sell effectively** — positioning, target market, sales techniques, closing strategies
4. **Answer technical questions** — premium calculations, lock-in periods, surrender charges, fund switching, premium pass rules

## PRODUCT OVERVIEW
- **Product Name:** ${product.title}
- **Category:** ${(product as any).categories?.name || "Financial Product"}
- **Description:** ${product.description || "N/A"}
- **Key Highlights:** ${product.highlights?.join(", ") || "N/A"}

## RELEVANT KNOWLEDGE
The following are the most relevant sections from the curriculum, lecture transcripts and documents based on the user's question. Use these as your primary source of truth.

${chunkContext || "No specific knowledge chunks found for this query. Use the product overview to answer."}

## RESPONSE GUIDELINES
- **Be practical and actionable** — give specific talking points, not generic advice
- **Use examples from the lectures** — reference what the trainer said, use their analogies
- **Format with markdown** — use headers, bullet points, bold for emphasis
- **If asked about something not in your knowledge base** — say so honestly and suggest consulting official AIA documentation
- **Keep it conversational** — you're a helpful colleague, not a textbook
- When users share images of documents, benefit illustrations, or product materials, analyze them in the context of ${product.title}

## IMPORTANT
- Never make up product features, numbers, or charges that aren't in your knowledge base
- Always ground answers in the training material provided above
- If a question requires specific numerical data (e.g., exact fund performance), recommend checking the latest AIA factsheets${modeInstructions[activeMode] || modeInstructions.knowledge}${FEEDBACK_DOORS_PROMPT}`;

    // Conversation history management: keep only last N messages to prevent token bloat
    const userMessages = messages.filter((m: any) => m.role !== "system");
    const trimmedMessages = userMessages.length > MAX_HISTORY_MESSAGES
      ? userMessages.slice(-MAX_HISTORY_MESSAGES)
      : userMessages;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...trimmedMessages,
    ];

    const useOwnKey = !!OPENAI_API_KEY;
    const response = await openaiFetch(
      useOwnKey
        ? "https://api.openai.com/v1/chat/completions"
        : "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useOwnKey ? OPENAI_API_KEY : LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // gpt-4o-mini is the fallback: openaiFetch asks OPENAI_MODEL (gpt-6-luna) first.
          model: useOwnKey ? "gpt-4o-mini" : "google/gemini-3-flash-preview",
          messages: apiMessages,
          stream: true,
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("product-knowledge-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
