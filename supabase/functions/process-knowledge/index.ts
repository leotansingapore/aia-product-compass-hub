import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;
  
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP / 5));
      currentChunk = overlapWords.join(" ") + "\n\n" + para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text.trim()];
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

      const allChunks: { content: string; source_type: string; source_id: string; metadata: any }[] = [];

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

        const textChunks = chunkText(fullText);
        for (const chunk of textChunks) {
          allChunks.push({
            content: chunk,
            source_type: "training_video",
            source_id: product_id,
            metadata: {
              video_title: title,
              product_title: product.title,
              category: (product as any).categories?.name || "Unknown",
            },
          });
        }
      }

      if (allChunks.length > 0) {
        // Insert chunks first
        const { data: insertedChunks, error: insertError } = await supabase
          .from("knowledge_chunks")
          .insert(allChunks)
          .select("id, content");

        if (insertError) throw new Error(`Failed to insert chunks: ${insertError.message}`);

        // Generate embeddings in batches of 5
        if (insertedChunks && insertedChunks.length > 0) {
          const batchSize = 5;
          for (let i = 0; i < insertedChunks.length; i += batchSize) {
            const batch = insertedChunks.slice(i, i + batchSize);
            const texts = batch.map((c: any) => c.content);
            const embeddings = await generateEmbeddings(texts, supabaseUrl);

            for (let j = 0; j < batch.length; j++) {
              if (embeddings[j] && embeddings[j].length === 768) {
                const embeddingStr = `[${embeddings[j].join(",")}]`;
                await supabase
                  .from("knowledge_chunks")
                  .update({ embedding: embeddingStr })
                  .eq("id", batch[j].id);
              }
            }
          }
        }
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

        // Generate embeddings
        if (insertedChunks) {
          const batchSize = 5;
          for (let i = 0; i < insertedChunks.length; i += batchSize) {
            const batch = insertedChunks.slice(i, i + batchSize);
            const texts = batch.map((c: any) => c.content);
            const embeddings = await generateEmbeddings(texts, supabaseUrl);
            for (let j = 0; j < batch.length; j++) {
              if (embeddings[j] && embeddings[j].length === 768) {
                const embeddingStr = `[${embeddings[j].join(",")}]`;
                await supabase
                  .from("knowledge_chunks")
                  .update({ embedding: embeddingStr })
                  .eq("id", batch[j].id);
              }
            }
          }
        }
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
        const textChunks = chunkText(text);
        
        await supabase
          .from("knowledge_chunks")
          .delete()
          .eq("document_id", document_id);
        
        const chunks = textChunks.map(chunk => ({
          document_id,
          source_type: "document",
          source_id: document_id,
          content: chunk,
          metadata: { title: doc.title, file_type: doc.file_type },
        }));

        if (chunks.length > 0) {
          const { data: insertedChunks, error: insertError } = await supabase
            .from("knowledge_chunks")
            .insert(chunks)
            .select("id, content");
          if (insertError) throw new Error(`Failed to insert chunks: ${insertError.message}`);

          // Generate embeddings
          if (insertedChunks) {
            const batchSize = 5;
            for (let i = 0; i < insertedChunks.length; i += batchSize) {
              const batch = insertedChunks.slice(i, i + batchSize);
              const texts = batch.map((c: any) => c.content);
              const embeddings = await generateEmbeddings(texts, supabaseUrl);
              for (let j = 0; j < batch.length; j++) {
                if (embeddings[j] && embeddings[j].length === 768) {
                  const embeddingStr = `[${embeddings[j].join(",")}]`;
                  await supabase
                    .from("knowledge_chunks")
                    .update({ embedding: embeddingStr })
                    .eq("id", batch[j].id);
                }
              }
            }
          }
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
