import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;
const MIN_CHUNK_LENGTH = 50;
const EMBED_BATCH_SIZE = 2;
const EMBED_TIMEOUT_MS = 25000;

function chunkText(text: string, contextPrefix?: string): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;
  
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const lastSentenceEnd = currentChunk.lastIndexOf(". ");
      const overlapStart = lastSentenceEnd > currentChunk.length - CHUNK_OVERLAP 
        ? lastSentenceEnd + 2 
        : Math.max(0, currentChunk.length - CHUNK_OVERLAP);
      currentChunk = currentChunk.slice(overlapStart) + "\n\n" + para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  
  return (chunks.length > 0 ? chunks : [text.trim()])
    .filter(c => c.length >= MIN_CHUNK_LENGTH)
    .map(c => contextPrefix ? `${contextPrefix}\n${c}` : c);
}

async function generateEmbeddings(texts: string[], supabaseUrl: string): Promise<number[][]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        signal: controller.signal,
        body: JSON.stringify({ texts }),
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Embedding generation failed:", response.status);
      return texts.map(() => []);
    }
    const data = await response.json();
    return data.embeddings || texts.map(() => []);
  } catch (e) {
    console.error("Embedding generation error:", e instanceof Error ? e.message : e);
    return texts.map(() => []);
  }
}

function isValidEmbedding(emb: number[]): boolean {
  if (!emb || emb.length !== 768) return false;
  return emb.filter(v => v !== 0 && !isNaN(v)).length > 10;
}

async function embedAndStore(supabase: any, chunks: any[], supabaseUrl: string): Promise<number> {
  if (!chunks || chunks.length === 0) return 0;
  let embedded = 0;
  
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    try {
      const texts = batch.map((c: any) => c.content);
      const embeddings = await generateEmbeddings(texts, supabaseUrl);

      for (let j = 0; j < batch.length; j++) {
        if (isValidEmbedding(embeddings[j])) {
          const embeddingStr = `[${embeddings[j].join(",")}]`;
          await supabase
            .from("knowledge_chunks")
            .update({ embedding: embeddingStr })
            .eq("id", batch[j].id);
          embedded++;
        }
      }
    } catch (e) {
      console.error(`Batch ${i} embedding failed:`, e instanceof Error ? e.message : e);
    }
  }
  return embedded;
}

async function extractTextFromFile(supabase: any, filePath: string, fileType: string): Promise<string> {
  const { data, error } = await supabase.storage.from("knowledge-files").download(filePath);
  if (error) throw new Error(`Failed to download file: ${error.message}`);
  
  if (["text/plain", "text/markdown", "text/csv"].includes(fileType) || 
      filePath.endsWith(".txt") || filePath.endsWith(".md") || filePath.endsWith(".csv")) {
    return await data.text();
  }
  try {
    const text = await data.text();
    const cleaned = text.replace(/[^\\x20-\\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n\n");
    if (cleaned.trim().length > 50) return cleaned;
  } catch { /* fall through */ }
  return `[Document: ${filePath}] - Binary content, text extraction not available.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { document_id, action, product_id } = await req.json();

    // ============ SYNC ALL TRAINING VIDEOS ============
    if (action === "sync_all_training_videos") {
      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("id, title, training_videos, categories(name)")
        .not("training_videos", "eq", "[]");

      if (prodErr) throw new Error(`Failed to fetch products: ${prodErr.message}`);

      let totalChunks = 0;
      let totalEmbedded = 0;
      let productsProcessed = 0;

      for (const product of (products || [])) {
        const trainingVideos = (product.training_videos || []) as any[];
        if (trainingVideos.length === 0) continue;

        // Delete old chunks for this product
        await supabase.from("knowledge_chunks").delete()
          .eq("source_type", "training_video").eq("source_id", product.id);

        const categoryName = (product as any).categories?.name || "Unknown";
        const allChunks: any[] = [];

        for (const video of trainingVideos) {
          const title = video.title || "Untitled";
          let fullText = "";
          if (video.rich_content) fullText += `Learning Notes for "${title}":\n${video.rich_content}\n\n`;
          if (video.transcript) fullText += `Transcript for "${title}":\n${video.transcript}\n\n`;
          if (video.notes) fullText += `Notes for "${title}":\n${video.notes}\n\n`;
          if (!fullText.trim()) continue;

          const contextPrefix = `Product: ${product.title} | Category: ${categoryName} | Source: ${title}`;
          for (const chunk of chunkText(fullText, contextPrefix)) {
            allChunks.push({
              content: chunk,
              source_type: "training_video",
              source_id: product.id,
              product_id: product.id,
              metadata: { video_title: title, product_title: product.title, category: categoryName },
            });
          }
        }

        if (allChunks.length > 0) {
          const { data: inserted, error: insErr } = await supabase
            .from("knowledge_chunks").insert(allChunks).select("id, content");
          if (insErr) { console.error(`Insert failed for ${product.id}:`, insErr.message); continue; }
          const embedded = await embedAndStore(supabase, inserted, supabaseUrl);
          totalEmbedded += embedded;
          totalChunks += allChunks.length;
        }
        productsProcessed++;
      }

      return new Response(JSON.stringify({ 
        success: true, products_processed: productsProcessed, 
        chunks_created: totalChunks, chunks_embedded: totalEmbedded 
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ REEMBED MISSING ============
    if (action === "reembed_missing") {
      const { data: chunks, error: chunkErr } = await supabase
        .from("knowledge_chunks")
        .select("id, content")
        .is("embedding", null)
        .limit(50);

      if (chunkErr) throw new Error(`Failed to fetch chunks: ${chunkErr.message}`);
      const embedded = await embedAndStore(supabase, chunks || [], supabaseUrl);

      return new Response(JSON.stringify({ 
        success: true, total_missing: (chunks || []).length, chunks_embedded: embedded 
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ SYNC TRAINING VIDEOS (single product) ============
    if (action === "sync_training_videos" && product_id) {
      const { data: product, error: productError } = await supabase
        .from("products").select("*, categories(name)").eq("id", product_id).single();
      if (productError || !product) throw new Error(`Product not found: ${product_id}`);

      const trainingVideos = (product.training_videos || []) as any[];
      await supabase.from("knowledge_chunks").delete()
        .eq("source_type", "training_video").eq("source_id", product_id);

      const categoryName = (product as any).categories?.name || "Unknown";
      const allChunks: any[] = [];

      for (const video of trainingVideos) {
        const title = video.title || "Untitled";
        let fullText = "";
        if (video.rich_content) fullText += `Learning Notes for "${title}":\n${video.rich_content}\n\n`;
        if (video.transcript) fullText += `Transcript for "${title}":\n${video.transcript}\n\n`;
        if (video.notes) fullText += `Notes for "${title}":\n${video.notes}\n\n`;
        if (!fullText.trim()) continue;

        const contextPrefix = `Product: ${product.title} | Category: ${categoryName} | Source: ${title}`;
        for (const chunk of chunkText(fullText, contextPrefix)) {
          allChunks.push({
            content: chunk, source_type: "training_video", source_id: product_id,
            product_id: product_id,
            metadata: { video_title: title, product_title: product.title, category: categoryName },
          });
        }
      }

      if (allChunks.length > 0) {
        const { error: insErr } = await supabase
          .from("knowledge_chunks").insert(allChunks);
        if (insErr) throw new Error(`Failed to insert chunks: ${insErr.message}`);
        // Fire-and-forget embedding to avoid timeout
        supabase.functions.invoke("process-knowledge", {
          body: { action: "reembed_missing" },
        }).catch(() => {/* fire-and-forget */});
      }

      return new Response(JSON.stringify({ success: true, chunks_created: allChunks.length, chunks_embedded: 0, note: "Embedding running in background" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ SYNC SCRIPTS ============
    if (action === "sync_scripts") {
      const { data: scripts, error: scriptsError } = await supabase
        .from("scripts").select("*").order("sort_order", { ascending: true });
      if (scriptsError) throw new Error(`Failed to fetch scripts: ${scriptsError.message}`);

      await supabase.from("knowledge_chunks").delete().eq("source_type", "script");

      const chunks: any[] = [];
      for (const script of scripts || []) {
        const versions = script.versions as Array<{ author: string; content: string; title?: string }>;
        let content = `## ${script.stage}\nCategory: ${script.category}\nTarget Audience: ${script.target_audience || 'general'}\n\n`;
        for (const v of versions) {
          const label = v.title || v.author || "Version";
          content += `**${label}:**\n${v.content}\n\n`;
        }
        
        for (const chunk of chunkText(content)) {
          chunks.push({
            source_type: "script", source_id: script.id, content: chunk,
            metadata: { stage: script.stage, category: script.category, target_audience: script.target_audience },
          });
        }
      }

      if (chunks.length > 0) {
        const { error: insErr } = await supabase
          .from("knowledge_chunks").insert(chunks);
        if (insErr) throw new Error(`Failed to insert script chunks: ${insErr.message}`);
        // Embedding happens asynchronously via reembed_missing to avoid timeout
        supabase.functions.invoke("process-knowledge", {
          body: { action: "reembed_missing" },
        }).catch(() => {/* fire-and-forget */});
      }

      return new Response(JSON.stringify({ success: true, chunks_created: chunks.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ PROCESS DOCUMENT ============
    if (action === "process_document" && document_id) {
      const { data: doc, error: docError } = await supabase
        .from("knowledge_documents").select("*").eq("id", document_id).single();
      if (docError || !doc) throw new Error("Document not found");

      await supabase.from("knowledge_documents").update({ status: "processing" }).eq("id", document_id);

      try {
        const text = await extractTextFromFile(supabase, doc.file_path, doc.file_type);
        const contextPrefix = doc.product_id
          ? `Document: ${doc.title} | Product: ${doc.product_id}`
          : `Document: ${doc.title}`;
        const textChunks = chunkText(text, contextPrefix);
        
        await supabase.from("knowledge_chunks").delete().eq("document_id", document_id);
        
        const chunks = textChunks.map(chunk => ({
          document_id, source_type: "document",
          source_id: doc.product_id || document_id,
          product_id: doc.product_id || null,
          content: chunk,
          metadata: { title: doc.title, file_type: doc.file_type },
        }));

        if (chunks.length > 0) {
          const { data: inserted, error: insErr } = await supabase
            .from("knowledge_chunks").insert(chunks).select("id, content");
          if (insErr) throw new Error(`Failed to insert chunks: ${insErr.message}`);
          await embedAndStore(supabase, inserted, supabaseUrl);
        }

        await supabase.from("knowledge_documents")
          .update({ status: "processed", chunk_count: chunks.length }).eq("id", document_id);

        return new Response(JSON.stringify({ success: true, chunks_created: chunks.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        await supabase.from("knowledge_documents").update({ status: "error" }).eq("id", document_id);
        throw e;
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-knowledge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
