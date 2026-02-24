import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function embedQuery(text: string, supabaseUrl: string): Promise<number[] | null> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ texts: [text] }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.embeddings?.[0] || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, productId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    // Try semantic search first
    let relevantChunks: { content: string; source_type: string; similarity: number; metadata: any }[] = [];
    
    const queryEmbedding = await embedQuery(queryText, supabaseUrl);
    
    if (queryEmbedding && queryEmbedding.length === 768) {
      // Use pgvector semantic search
      const embeddingStr = `[${queryEmbedding.join(",")}]`;
      const { data: matches, error: matchError } = await supabase.rpc(
        "match_knowledge_chunks",
        {
          query_embedding: embeddingStr,
          match_count: 10,
          filter_product_id: productId,
        }
      );

      if (!matchError && matches && matches.length > 0) {
        relevantChunks = matches;
      }
    }

    // Fallback: if no vector results, fetch recent chunks directly
    if (relevantChunks.length === 0) {
      const { data: fallbackChunks } = await supabase
        .from("knowledge_chunks")
        .select("content, source_type, metadata")
        .eq("source_id", productId)
        .limit(15);

      if (fallbackChunks) {
        relevantChunks = fallbackChunks.map(c => ({ ...c, similarity: 0 }));
      }
    }

    // Build context from relevant chunks
    const chunkContext = relevantChunks
      .map((c, i) => {
        const source = c.source_type === "training_video"
          ? `Lecture: ${c.metadata?.video_title || "Unknown"}`
          : c.source_type === "document"
            ? `Document: ${c.metadata?.title || "Unknown"}`
            : `Source: ${c.source_type}`;
        return `--- ${source} (relevance: ${(c.similarity * 100).toFixed(0)}%) ---\n${c.content}`;
      })
      .join("\n\n");

    // Build system prompt with smart context
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

## RELEVANT KNOWLEDGE (Semantic Search Results)
The following are the most relevant sections from training materials, transcripts, and documents based on the user's question. Use these as your primary source of truth.

${chunkContext || "No specific knowledge chunks found for this query. Use the product overview to answer."}

## RESPONSE GUIDELINES
- **Be practical and actionable** — give specific talking points, not generic advice
- **Use examples from the lectures** — reference what the trainer said, use their analogies
- **Format with markdown** — use headers, bullet points, bold for emphasis
- **For objection handling** — provide the objection, acknowledge it, then give a reframe/response
- **For comparisons** — reference the competitive advantages mentioned in training
- **If asked about something not in your knowledge base** — say so honestly and suggest consulting official AIA documentation
- **Keep it conversational** — you're a helpful colleague, not a textbook
- When users share images of documents, benefit illustrations, or product materials, analyze them in the context of ${product.title}

## IMPORTANT
- Never make up product features, numbers, or charges that aren't in your knowledge base
- Always ground answers in the training material provided above
- If a question requires specific numerical data (e.g., exact fund performance), recommend checking the latest AIA factsheets`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

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
