// Splits a lesson into top-level blocks (separated by blank lines, a code fence
// kept whole) so an admin can edit one block in place, and joins them back
// byte for byte, so unedited blocks never change.

export type Block = { text: string; gap: string };
export type Blocks = { lead: string; blocks: Block[] };

const FENCE_RE = /^\s*(```|~~~)/;

export function splitBlocks(source: string): Blocks {
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const blocks: Block[] = [];
  let lead = "";
  let cur = "";
  let gap = "";
  let inFence = false;
  for (const raw of lines) {
    const content = raw.replace(/\n$/, "");
    if (!inFence && content.trim() === "") {
      if (cur === "") lead += raw;
      else gap += raw;
      continue;
    }
    if (gap !== "") {
      // cur ends with the newline that closed its last line; that newline opens the gap.
      blocks.push({ text: cur.slice(0, -1), gap: "\n" + gap });
      cur = "";
      gap = "";
    }
    cur += raw;
    if (FENCE_RE.test(content)) inFence = !inFence;
  }
  if (cur !== "") {
    const endsWithNewline = cur.endsWith("\n");
    blocks.push({ text: endsWithNewline ? cur.slice(0, -1) : cur, gap: (endsWithNewline ? "\n" : "") + gap });
  }
  return { lead, blocks };
}

export function joinBlocks({ lead, blocks }: Blocks): string {
  return lead + blocks.map((b) => b.text + b.gap).join("");
}

/** The source with block `index` replaced; empty text deletes the block. */
export function replaceBlock(source: string, index: number, text: string): string {
  const parsed = splitBlocks(source);
  const blocks = parsed.blocks.slice();
  if (index < 0 || index >= blocks.length) return source;
  const next = text.replace(/^\n+|\s+$/g, "");
  if (next) {
    blocks[index] = { ...blocks[index], text: next };
  } else {
    const [removed] = blocks.splice(index, 1);
    // The last block carries the file's trailing newline; hand it to the new last block.
    if (index === blocks.length && index > 0) blocks[index - 1] = { ...blocks[index - 1], gap: removed.gap };
  }
  return joinBlocks({ lead: parsed.lead, blocks });
}

/**
 * "raw" blocks are edited as their markdown text: code fences (poster diagrams,
 * the income calculator), tables, images and HTML, which a rich-text round trip
 * would mangle. Everything else is prose, edited as rich text.
 */
export function blockKind(text: string): "rich" | "raw" {
  const t = text.trim();
  if (FENCE_RE.test(t) || t.startsWith("<") || /^(-{3,}|\*{3,}|_{3,})$/.test(t)) return "raw";
  if (/^\s*\|/m.test(t) || t.includes("![")) return "raw";
  return "rich";
}
