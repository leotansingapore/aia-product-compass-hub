import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { openaiFetch } from "../_shared/openaiChat.ts";
import { buildSystemPrompt } from "./prompt.ts";
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

    // The prompt labels each chunk by kind (lesson, cheat sheet, lecture transcript,
    // document) and tells the model which one wins when they disagree: prompt.ts.
    const systemPrompt = buildSystemPrompt(product, relevantChunks, mode);

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
