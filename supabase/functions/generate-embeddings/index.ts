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
    const { texts } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: "texts array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Generate embeddings by asking the model to produce them via tool calling
    // We batch texts and get embeddings one at a time to avoid issues
    const embeddings: number[][] = [];

    for (const text of texts) {
      // Use a structured output approach: ask the model to produce a normalized embedding
      const truncatedText = text.slice(0, 2000); // Keep input manageable
      
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are an embedding generator. Given text, produce a 768-dimensional numerical embedding vector that captures the semantic meaning. Output ONLY a JSON array of 768 floating point numbers between -1 and 1. No other text.`,
              },
              {
                role: "user",
                content: `Generate a 768-dimensional embedding vector for this text:\n\n${truncatedText}`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Embedding generation error:", response.status, errorText);
        // Return a zero vector as fallback
        embeddings.push(new Array(768).fill(0));
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        // Extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length === 768) {
            embeddings.push(parsed);
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            // Pad or truncate to 768
            const normalized = parsed.slice(0, 768);
            while (normalized.length < 768) normalized.push(0);
            embeddings.push(normalized);
          } else {
            embeddings.push(new Array(768).fill(0));
          }
        } else {
          embeddings.push(new Array(768).fill(0));
        }
      } catch {
        console.error("Failed to parse embedding from response:", content.slice(0, 200));
        embeddings.push(new Array(768).fill(0));
      }
    }

    return new Response(
      JSON.stringify({ embeddings }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-embeddings error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
