// deno-lint-ignore-file no-explicit-any

// Unprintable characters in text pulled from a file that is not plain text.
const UNPRINTABLE = /[^\x20-\x7E\n\r\t]/g;
// Above this share of unprintable characters the file is a binary format we cannot read
// (a compressed PDF stream, a DOCX zip); its "text" would only make garbage chunks.
const MAX_UNPRINTABLE_SHARE = 0.1;

export async function extractTextFromFile(supabase: any, filePath: string, fileType: string): Promise<string> {
  const { data, error } = await supabase.storage.from("knowledge-files").download(filePath);
  if (error) throw new Error(`Failed to download file: ${error.message}`);

  if (["text/plain", "text/markdown", "text/csv"].includes(fileType) ||
      filePath.endsWith(".txt") || filePath.endsWith(".md") || filePath.endsWith(".csv")) {
    return await data.text();
  }
  try {
    const text = await data.text();
    const unprintable = text.match(UNPRINTABLE)?.length ?? 0;
    if (unprintable / Math.max(text.length, 1) <= MAX_UNPRINTABLE_SHARE) {
      const cleaned = text.replace(UNPRINTABLE, " ").replace(/\s{3,}/g, "\n\n");
      if (cleaned.trim().length > 50) return cleaned;
    }
  } catch { /* fall through */ }
  return `[Document: ${filePath}] - Binary content, text extraction not available.`;
}

// Swap one source's chunks with no moment where it has none: insert the new rows, then
// delete only the rows created before them. One insert statement shares one now(), so
// every new row has the same created_at and every old row an earlier one. A failed
// insert throws before anything is deleted.
export async function replaceChunks(
  supabase: any,
  scope: Record<string, string>,
  rows: Record<string, unknown>[],
): Promise<{ id: string; content: string }[]> {
  let inserted: { id: string; content: string; created_at: string }[] = [];
  if (rows.length > 0) {
    const { data, error } = await supabase.from("knowledge_chunks").insert(rows).select("id, content, created_at");
    if (error) throw new Error(`Failed to insert chunks: ${error.message}`);
    inserted = data ?? [];
  }
  let old = supabase.from("knowledge_chunks").delete();
  for (const [column, value] of Object.entries(scope)) old = old.eq(column, value);
  if (inserted.length > 0) old = old.lt("created_at", inserted.map((r) => r.created_at).sort()[0]);
  const { error } = await old;
  if (error) throw new Error(`Failed to delete old chunks: ${error.message}`);
  return inserted;
}
