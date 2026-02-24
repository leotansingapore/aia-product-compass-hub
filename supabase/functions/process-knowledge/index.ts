import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;
const MIN_CHUNK_LENGTH = 50;

/**
 * Improved chunking: sentence-boundary aware, filters noise, prepends context metadata.
 */
function chunkText(text: string, contextPrefix?: string): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;
  
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: find last sentence boundary in the chunk
      const lastSentenceEnd = currentChunk.lastIndexOf(". ");
      const overlapStart = lastSentenceEnd > currentChunk.length - CHUNK_OVERLAP 
        ? lastSentenceEnd + 2 
        : Math.max(0, currentChunk.length - CHUNK_OVERLAP);
      const overlapText = currentChunk.slice(overlapStart);
      currentChunk = overlapText + "\n\n" + para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Filter out tiny noise chunks and prepend context
  return (chunks.length > 0 ? chunks : [text.trim()])
    .filter(c => c.length >= MIN_CHUNK_LENGTH)
    .map(c => contextPrefix ? `${contextPrefix}\n${c}` : c);
}

async function generateEmbeddings(texts: string[], supabaseUrl: string): Promise<number[][]> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ texts }),
      }
    );

    if (!response.ok) {
      console.error("Failed to generate embeddings:", response.status);
      return texts.map(() => []);
    }

    const data = await response.json();
    return data.embeddings || texts.map(() => []);
  } catch (e) {
    console.error("Embedding generation failed:", e);
    return texts.map(() => []);
  }
}

// Validate embedding: must be 768-dim with actual non-zero values
function isValidEmbedding(emb: number[]): boolean {
  if (!emb || emb.length !== 768) return false;
  const nonZero = emb.filter(v => v !== 0 && !isNaN(v)).length;
  return nonZero > 10; // At least some meaningful values
}

async function embedAndStore(supabase: any, insertedChunks: any[], supabaseUrl: string) {
  if (!insertedChunks || insertedChunks.length === 0) return;
  
  const batchSize = 5;
  for (let i = 0; i < insertedChunks.length; i += batchSize) {
    const batch = insertedChunks.slice(i, i + batchSize);
    const texts = batch.map((c: any) => c.content);
    const embeddings = await generateEmbeddings(texts, supabaseUrl);

    for (let j = 0; j < batch.length; j++) {
      if (isValidEmbedding(embeddings[j])) {
        const embeddingStr = `[${embeddings[j].join(",")}]`;
        await supabase
          .from("knowledge_chunks")
          .update({ embedding: embeddingStr })
          .eq("id", batch[j].id);
      }
    }
  }
}

async function extractTextFromFile(supabase: any, filePath: string, fileType: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("knowledge-files")
    .download(filePath);
  
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
  
  return `[Document: ${filePath}] - Binary content, text extraction not available for this format.`;
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

    // ============ SYNC TRAINING VIDEOS ============
    if (action === "sync_training_videos" && product_id) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        throw new Error(`Product not found: ${product_id}`);
      }

      const trainingVideos = (product.training_videos || []) as any[];
      
      // Delete existing training_video chunks for this product
      await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("source_type", "training_video")
        .eq("source_id", product_id);

      const categoryName = (product as any).categories?.name || "Unknown";
      const allChunks: { content: string; source_type: string; source_id: string; product_id: string; metadata: any }[] = [];

      for (const video of trainingVideos) {
        const title = video.title || "Untitled Video";
        const transcript = video.transcript || "";
        const richContent = video.rich_content || "";
        const notes = video.notes || "";

        let fullText = "";
        if (richContent) fullText += `Learning Notes for "${title}":\n${richContent}\n\n`;
        if (transcript) fullText += `Transcript for "${title}":\n${transcript}\n\n`;
        if (notes) fullText += `Notes for "${title}":\n${notes}\n\n`;

        if (fullText.trim().length === 0) continue;

        const contextPrefix = `Product: ${product.title} | Category: ${categoryName} | Source: ${title}`;
        const textChunks = chunkText(fullText, contextPrefix);
        
        for (const chunk of textChunks) {
          allChunks.push({
            content: chunk,
            source_type: "training_video",
            source_id: product_id,
            product_id: product_id,
            metadata: {
              video_title: title,
              product_title: product.title,
              category: categoryName,
            },
          });
        }
      }

      if (allChunks.length > 0) {
        const { data: insertedChunks, error: insertError } = await supabase
          .from("knowledge_chunks")
          .insert(allChunks)
          .select("id, content");

        if (insertError) throw new Error(`Failed to insert chunks: ${insertError.message}`);
        await embedAndStore(supabase, insertedChunks, supabaseUrl);
      }

      return new Response(JSON.stringify({ success: true, chunks_created: allChunks.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ SYNC SCRIPTS ============
    if (action === "sync_scripts") {
      const { data: scripts, error: scriptsError } = await supabase
        .from("scripts")
        .select("*")
        .order("sort_order", { ascending: true });

      if (scriptsError) throw new Error(`Failed to fetch scripts: ${scriptsError.message}`);

      await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("source_type", "script");

      const chunks: any[] = [];
      for (const script of scripts || []) {
        const versions = script.versions as Array<{ author: string; content: string }>;
        let content = `## ${script.stage}\nCategory: ${script.category}\nTarget Audience: ${script.target_audience || 'general'}\n\n`;
        for (const v of versions) {
          content += `**${v.author}:**\n${v.content}\n\n`;
        }
        
        const textChunks = chunkText(content);
        for (const chunk of textChunks) {
          chunks.push({
            source_type: "script",
            source_id: script.id,
            content: chunk,
            metadata: { stage: script.stage, category: script.category, target_audience: script.target_audience },
          });
        }
      }

      if (chunks.length > 0) {
        const { data: insertedChunks, error: insertError } = await supabase
          .from("knowledge_chunks")
          .insert(chunks)
          .select("id, content");
        if (insertError) throw new Error(`Failed to insert script chunks: ${insertError.message}`);
        await embedAndStore(supabase, insertedChunks, supabaseUrl);
      }

      return new Response(JSON.stringify({ success: true, chunks_created: chunks.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ PROCESS DOCUMENT ============
    if (action === "process_document" && document_id) {
      const { data: doc, error: docError } = await supabase
        .from("knowledge_documents")
        .select("*")
        .eq("id", document_id)
        .single();

      if (docError || !doc) throw new Error("Document not found");

      await supabase
        .from("knowledge_documents")
        .update({ status: "processing" })
        .eq("id", document_id);

      try {
        const text = await extractTextFromFile(supabase, doc.file_path, doc.file_type);
        
        const contextPrefix = doc.product_id
          ? `Document: ${doc.title} | Product: ${doc.product_id}`
          : `Document: ${doc.title}`;
        const textChunks = chunkText(text, contextPrefix);
        
        await supabase
          .from("knowledge_chunks")
          .delete()
          .eq("document_id", document_id);
        
        const chunks = textChunks.map(chunk => ({
          document_id,
          source_type: "document",
          source_id: doc.product_id || document_id,
          product_id: doc.product_id || null,
          content: chunk,
          metadata: { title: doc.title, file_type: doc.file_type },
        }));

        if (chunks.length > 0) {
          const { data: insertedChunks, error: insertError } = await supabase
            .from("knowledge_chunks")
            .insert(chunks)
            .select("id, content");
          if (insertError) throw new Error(`Failed to insert chunks: ${insertError.message}`);
          await embedAndStore(supabase, insertedChunks, supabaseUrl);
        }

        await supabase
          .from("knowledge_documents")
          .update({ status: "processed", chunk_count: chunks.length })
          .eq("id", document_id);

        return new Response(JSON.stringify({ success: true, chunks_created: chunks.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        await supabase
          .from("knowledge_documents")
          .update({ status: "error" })
          .eq("id", document_id);
        throw e;
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-knowledge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
