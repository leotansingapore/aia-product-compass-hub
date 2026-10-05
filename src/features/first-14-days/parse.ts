import type { DayFrontmatter } from "./types";

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

export function parseFrontmatter(raw: string): { frontmatter: DayFrontmatter; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error("Missing frontmatter");
  }
  const yaml = match[1];
  const body = raw.slice(match[0].length);

  const fm: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const kvMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kvMatch) continue;
    const key = kvMatch[1];
    const rawVal = kvMatch[2].trim();
    if (rawVal === "") {
      const children: string[] = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        children.push(lines[i + 1].replace(/^\s+-\s+/, "").trim());
        i++;
      }
      fm[key] = children;
    } else {
      fm[key] = coerceYamlValue(rawVal);
    }
  }

  return {
    frontmatter: {
      week: Number(fm.week ?? 0),
      day: Number(fm.day ?? 0),
      title: String(fm.title ?? ""),
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
      duration_minutes: Number(fm.duration_minutes ?? 15),
      big_idea: fm.big_idea as string | undefined,
      author: fm.author as string | undefined,
    },
    body,
  };
}

function coerceYamlValue(raw: string): unknown {
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    if (inner === "") return [];
    return inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
  }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  const asNumber = Number(raw);
  if (!Number.isNaN(asNumber) && /^-?\d+(\.\d+)?$/.test(raw)) return asNumber;
  return raw;
}

const APPENDIX_CUT_RE = /\n##\s+Related\b/;

/**
 * Cut the Related section (Obsidian wiki links) from a day's body; the page
 * has its own previous/next navigation.
 */
export function stripAppendix(body: string): string {
  const match = body.match(APPENDIX_CUT_RE);
  if (!match || match.index === undefined) return body;
  let out = body.slice(0, match.index);
  out = out.replace(/\n+---\s*$/, "");
  return out.trimEnd();
}
