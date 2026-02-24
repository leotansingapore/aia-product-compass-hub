import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Deterministic semantic embedding strategy:
 * 1. Use LLM to extract semantic keywords/concepts from text (grounded, deterministic)
 * 2. Convert keywords into a deterministic 768-dim vector using hash-based random projection
 * 
 * This produces meaningful, consistent vectors where similar texts produce similar embeddings.
 */

// Deterministic seeded random number generator (Mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simple string hash for seeding
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

// Generate a deterministic 768-dim vector from a keyword
function keywordToVector(keyword: string): number[] {
  const seed = hashString(keyword.toLowerCase().trim());
  const rng = mulberry32(seed);
  const vec = new Array(768);
  for (let i = 0; i < 768; i++) {
    // Generate values between -1 and 1 using Box-Muller transform approximation
    vec[i] = (rng() - 0.5) * 2;
  }
  return vec;
}

// Combine multiple keyword vectors into a single embedding via averaging + normalization
function combineKeywordVectors(keywords: string[]): number[] {
  if (keywords.length === 0) return new Array(768).fill(0);

  const combined = new Array(768).fill(0);
  for (const kw of keywords) {
    const vec = keywordToVector(kw);
    for (let i = 0; i < 768; i++) {
      combined[i] += vec[i];
    }
  }

  // Normalize to unit vector
  let magnitude = 0;
  for (let i = 0; i < 768; i++) {
    magnitude += combined[i] * combined[i];
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude > 0) {
    for (let i = 0; i < 768; i++) {
      combined[i] /= magnitude;
    }
  }

  return combined;
}

async function extractKeywords(text: string, apiKey: string): Promise<string[]> {
  const truncated = text.slice(0, 3000);

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a keyword extractor for a financial advisory training platform. Extract 15-30 semantic keywords and short phrases that capture the core concepts, product names, features, sales techniques, and financial terms from the text. Output ONLY a JSON array of lowercase strings. No other text.

Example: ["premium pass", "fund switching", "welcome bonus", "lock-in period", "objection handling", "investment-linked policy", "surrender charge", "dollar cost averaging"]`,
          },
          {
            role: "user",
            content: truncated,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    console.error("Keyword extraction failed:", response.status);
    // Fallback: extract words from text directly
    return fallbackKeywords(truncated);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((k: any) => typeof k === "string" && k.length > 1).slice(0, 30);
      }
    }
  } catch {
    console.error("Failed to parse keywords:", content.slice(0, 200));
  }

  return fallbackKeywords(truncated);
}

// Fallback: extract meaningful words when LLM fails
function fallbackKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "up",
    "down", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "because",
    "but", "and", "or", "if", "while", "about", "this", "that", "these",
    "those", "it", "its", "we", "our", "you", "your", "they", "their",
    "he", "she", "him", "her", "his", "my", "me", "i", "what", "which",
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Get unique words by frequency
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);
}

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

    const embeddings: number[][] = [];

    for (const text of texts) {
      if (!text || text.trim().length < 10) {
        embeddings.push(new Array(768).fill(0));
        continue;
      }

      const keywords = await extractKeywords(text, LOVABLE_API_KEY);
      
      if (keywords.length === 0) {
        embeddings.push(new Array(768).fill(0));
        continue;
      }

      const embedding = combineKeywordVectors(keywords);
      
      // Validate: reject if all zeros or NaN
      const hasValue = embedding.some(v => v !== 0 && !isNaN(v));
      if (!hasValue) {
        embeddings.push(new Array(768).fill(0));
        continue;
      }

      embeddings.push(embedding);
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
