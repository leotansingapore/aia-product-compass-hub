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

/**
 * The source with blocks [start, end) replaced by `text`; empty text deletes them.
 * With `render`, a new block that renders like one of the replaced blocks keeps
 * that block's exact markdown, so a rich-text round trip of a whole section only
 * rewrites the paragraphs that were actually edited.
 */
export function replaceBlocks(source: string, start: number, end: number, text: string, render?: (md: string) => string): string {
  const parsed = splitBlocks(source);
  if (start < 0 || end > parsed.blocks.length || start >= end) return source;
  const old = parsed.blocks.slice(start, end);
  const byLook = new Map(render ? old.map((b) => [render(b.text), b.text] as const) : []);
  const next = splitBlocks(text).blocks.flatMap((b) => {
    const same = render && byLook.get(render(b.text));
    if (same || !render) return [same || b.text];
    // A list written loose (a blank line between items) comes back as one tight list.
    const items = b.text.split(/\n(?=(?:[-*+]|\d+\.)[ \t])/);
    const originals = items.map((t) => byLook.get(render(t)));
    return items.length > 1 && originals.every(Boolean) ? (originals as string[]) : [b.text];
  });
  if (next.length === old.length && next.every((t, i) => t === old[i].text)) return source;
  // The last replaced block carries the gap after the section (the file's trailing newline at the end).
  const lastGap = old[old.length - 1].gap;
  const blocks = [
    ...parsed.blocks.slice(0, start),
    ...next.map((t, i) => ({ text: t, gap: i === next.length - 1 ? lastGap : "\n\n" })),
    ...parsed.blocks.slice(end),
  ];
  if (!next.length && end === parsed.blocks.length && start > 0) blocks[start - 1] = { ...blocks[start - 1], gap: lastGap };
  return joinBlocks({ lead: parsed.lead, blocks });
}

const LIST_ITEM = /^[ \t]*([-*+]|\d+\.)[ \t]/;

/**
 * Markdown from the rich-text editor, made lesson-shaped. It comes back with empty
 * paragraphs as "&nbsp;" lines, a spaces-only line between list items (which makes
 * every list loose, spaced out like paragraphs), and "> >" after each quoted
 * paragraph (an empty nested quote). Drop all three.
 */
export function tidyRichMarkdown(md: string): string {
  const lines = md
    .replace(/^[ \t]*&nbsp;[ \t]*$/gm, "")
    .replace(/^>[ \t]*>[ \t]*$/gm, ">")
    .split("\n");
  return lines
    .filter((line, i) => {
      const next = lines[i + 1] ?? "";
      if (/^[ \t]+$/.test(line) && LIST_ITEM.test(next)) return false;
      return !(line === ">" && !next.startsWith(">"));
    })
    .join("\n");
}

export type Part = { start: number; end: number; rich: boolean };

/** Consecutive prose blocks form one part, edited together; each raw block is a part of its own. */
export function groupParts(blocks: Block[]): Part[] {
  const parts: Part[] = [];
  blocks.forEach((b, i) => {
    const rich = blockKind(b.text) === "rich";
    const last = parts[parts.length - 1];
    if (rich && last?.rich) last.end = i + 1;
    else parts.push({ start: i, end: i + 1, rich });
  });
  return parts;
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
