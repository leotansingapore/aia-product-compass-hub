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
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep overlap from end of previous chunk
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

async function extractTextFromFile(supabase: any, filePath: string, fileType: string): Promise<string> {
  // Download file from storage
  const { data, error } = await supabase.storage
    .from("knowledge-files")
    .download(filePath);
  
  if (error) throw new Error(`Failed to download file: ${error.message}`);
  
  // For text-based files, read directly
  if (["text/plain", "text/markdown", "text/csv"].includes(fileType) || 
      filePath.endsWith(".txt") || filePath.endsWith(".md") || filePath.endsWith(".csv")) {
    return await data.text();
  }
  
  // For PDFs and other docs, extract text content
  // We'll use a simple approach: read as text and clean up
  try {
    const text = await data.text();
    // Clean up any binary artifacts
    const cleaned = text.replace(/[^\\x20-\\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n\n");
    if (cleaned.trim().length > 50) return cleaned;
  } catch { /* fall through */ }
  
  // If we can't extract meaningful text, return a note
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

    const { document_id, action } = await req.json();

    if (action === "sync_scripts") {
      // Sync all scripts from the scripts table into knowledge_chunks
      const { data: scripts, error: scriptsError } = await supabase
        .from("scripts")
        .select("*")
        .order("sort_order", { ascending: true });

      if (scriptsError) throw new Error(`Failed to fetch scripts: ${scriptsError.message}`);

      // Delete existing script chunks
      await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("source_type", "script");

      // Insert new chunks from scripts
      const chunks = [];
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
        const { error: insertError } = await supabase
          .from("knowledge_chunks")
          .insert(chunks);
        if (insertError) throw new Error(`Failed to insert script chunks: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ success: true, chunks_created: chunks.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "process_document" && document_id) {
      // Get document details
      const { data: doc, error: docError } = await supabase
        .from("knowledge_documents")
        .select("*")
        .eq("id", document_id)
        .single();

      if (docError || !doc) throw new Error("Document not found");

      // Update status to processing
      await supabase
        .from("knowledge_documents")
        .update({ status: "processing" })
        .eq("id", document_id);

      try {
        // Extract text from file
        const text = await extractTextFromFile(supabase, doc.file_path, doc.file_type);
        
        // Chunk the text
        const textChunks = chunkText(text);
        
        // Delete existing chunks for this document
        await supabase
          .from("knowledge_chunks")
          .delete()
          .eq("document_id", document_id);
        
        // Insert chunks
        const chunks = textChunks.map(chunk => ({
          document_id,
          source_type: "document",
          source_id: document_id,
          content: chunk,
          metadata: { title: doc.title, file_type: doc.file_type },
        }));

        if (chunks.length > 0) {
          const { error: insertError } = await supabase
            .from("knowledge_chunks")
            .insert(chunks);
          if (insertError) throw new Error(`Failed to insert chunks: ${insertError.message}`);
        }

        // Update document status
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
