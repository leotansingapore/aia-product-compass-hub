// deno test supabase/functions/process-knowledge/chunks.test.ts
import { assert, assertEquals, assertRejects } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { extractTextFromFile, replaceChunks } from "./chunks.ts";

const bytes = (...parts: (string | number[])[]): Uint8Array<ArrayBuffer> =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...new TextEncoder().encode(p)] : p)));
const storage = (file: Uint8Array<ArrayBuffer>) => ({
  storage: { from: () => ({ download: () => Promise.resolve({ data: new Blob([file]), error: null }) }) },
});

// An uncompressed PDF: the binary marker line every PDF writer adds, then the page text.
const PDF = bytes(
  "%PDF-1.4\n%", [0xe2, 0xe3, 0xcf, 0xd3], "\n1 0 obj << /Type /Page >> endobj\n",
  "BT /F1 12 Tf (Pro Achiever pays a Welcome Bonus on the first two annual premiums.) Tj ET\n",
  "BT (Partial withdrawals are allowed from policy year 3.) Tj ET\n%%EOF\n",
);

Deno.test("text in a non-text file keeps its lowercase letters", async () => {
  const text = await extractTextFromFile(storage(PDF), "docs/pro-achiever.pdf", "application/pdf");
  assert(text.includes("Pro Achiever pays a Welcome Bonus on the first two annual premiums."), text);
  assert(text.includes("Partial withdrawals are allowed from policy year 3."), text);
  assertEquals(/[^\x20-\x7E\n\r\t]/.test(text), false);
});

Deno.test("a compressed binary file becomes the placeholder, not garbage chunks", async () => {
  const words = "Pro Achiever premium term and Welcome Bonus bands. ".repeat(80);
  const zipped = new Uint8Array(
    await new Response(new Blob([words]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer(),
  );
  const text = await extractTextFromFile(storage(bytes("PK", [3, 4], ...[[...zipped]])), "docs/notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assertEquals(text, "[Document: docs/notes.docx] - Binary content, text extraction not available.");
});

Deno.test("a plain text file is returned as written", async () => {
  const text = await extractTextFromFile(storage(bytes("Line one\n\nLine two, with an S$ figure.")), "a.txt", "text/plain");
  assertEquals(text, "Line one\n\nLine two, with an S$ figure.");
});

function fakeDb(insertError?: string, deleteError?: string) {
  const ops: { op: string; filters?: string[]; rows?: unknown[] }[] = [];
  return {
    ops,
    from: () => ({
      insert: (rows: Record<string, unknown>[]) => ({
        select: () => {
          ops.push({ op: "insert", rows });
          return Promise.resolve(insertError
            ? { data: null, error: { message: insertError } }
            : { data: rows.map((r, i) => ({ id: `n${i}`, content: r.content, created_at: `2026-11-02T10:00:00.12345${i}+00:00` })), error: null });
        },
      }),
      delete: () => {
        const filters: string[] = [];
        // deno-lint-ignore no-explicit-any
        const b: any = {
          eq: (c: string, v: string) => (filters.push(`${c}=eq.${v}`), b),
          lt: (c: string, v: string) => (filters.push(`${c}=lt.${v}`), b),
          then: (ok: (v: unknown) => unknown) => {
            ops.push({ op: "delete", filters });
            return Promise.resolve({ error: deleteError ? { message: deleteError } : null }).then(ok);
          },
        };
        return b;
      },
    }),
  };
}

Deno.test("new chunks go in first, then only the rows older than them are deleted", async () => {
  const db = fakeDb();
  const inserted = await replaceChunks(db, { source_type: "training_video", source_id: "pro-achiever" }, [{ content: "a" }, { content: "b" }]);
  assertEquals(inserted.map((r) => r.id), ["n0", "n1"]);
  assertEquals(db.ops.map((o) => o.op), ["insert", "delete"]);
  assertEquals(db.ops[1].filters, [
    "source_type=eq.training_video",
    "source_id=eq.pro-achiever",
    "created_at=lt.2026-11-02T10:00:00.123450+00:00",
  ]);
});

Deno.test("a failed insert deletes nothing, so the product keeps its old knowledge", async () => {
  const db = fakeDb("value too long");
  await assertRejects(() => replaceChunks(db, { document_id: "d1" }, [{ content: "a" }]), Error, "value too long");
  assertEquals(db.ops.map((o) => o.op), ["insert"]);
});

Deno.test("no new chunks clears the old ones (the source has no text left)", async () => {
  const db = fakeDb();
  assertEquals(await replaceChunks(db, { source_type: "script" }, []), []);
  assertEquals(db.ops, [{ op: "delete", filters: ["source_type=eq.script"] }]);
});

Deno.test("a failed delete is reported, not swallowed", async () => {
  const db = fakeDb(undefined, "timeout");
  await assertRejects(() => replaceChunks(db, { source_type: "script" }, [{ content: "a" }]), Error, "timeout");
});
