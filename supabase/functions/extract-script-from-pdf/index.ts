import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pdfUrls } = await req.json();
    if (!pdfUrls || pdfUrls.length === 0) {
      return new Response(JSON.stringify({ error: "No PDF URLs provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Download and convert each PDF to base64
    const pdfContents: string[] = [];
    for (const url of pdfUrls) {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch PDF: ${url}`);
      const buffer = await resp.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      pdfContents.push(base64);
    }

    // Build message content with PDFs as file data
    const fileContents = pdfContents.map((b64) => ({
      type: "image_url",
      image_url: {
        url: `data:application/pdf;base64,${b64}`,
      },
    }));

    const prompt = `You are extracting sales scripts from PDF documents.

Analyze the PDF carefully and extract ALL scripts present in the document.

A "script" is any sales conversation, call script, message template, text template, or dialogue meant to be used in client communication.

Return a JSON object with this exact structure:
{
  "scripts": [
    {
      "title": "Short descriptive title for this script",
      "content": "Full text of the script, preserving formatting and line breaks"
    }
  ]
}

Rules:
- If there is only ONE script (or the entire PDF is one script), return an array with a single item.
- If there are MULTIPLE scripts (e.g., different sections, different audiences, numbered scripts), return each as a separate item.
- Preserve the original wording exactly. Do NOT paraphrase or summarize.
- If the PDF has no script content, return { "scripts": [] }.
- Return ONLY the JSON object, no extra commentary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...fileContents,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
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
      throw new Error("AI extraction failed");
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let scripts: { title: string; content: string }[] = [];
    try {
      const parsed = JSON.parse(raw);
      scripts = Array.isArray(parsed.scripts) ? parsed.scripts : [];
    } catch {
      // If JSON parse fails, treat entire response as single script
      if (raw.length > 10) {
        scripts = [{ title: "Extracted Script", content: raw }];
      }
    }

    return new Response(JSON.stringify({ scripts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-script-from-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
