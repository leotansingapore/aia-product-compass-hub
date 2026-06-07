import type { DayFrontmatter, QuizQuestion, QuizOption, ReflectionPrompt } from "./types";

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
      duration_minutes: Number(fm.duration_minutes ?? 20),
      primary_source: fm.primary_source as string | undefined,
      primary_slides: fm.primary_slides as string | undefined,
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

const QUIZ_HEADING_RE = /^##\s+(?:Quick quiz|Quiz)\s*$/m;
const REFLECTION_HEADING_RE = /^##\s+(Reflection worksheet|Final reflection[^\n]*)$/m;
const NEXT_HEADING_RE = /^##\s+\S/m;
const APPENDIX_CUT_RE = /\n##\s+(Reflection worksheet|Final reflection|Quick quiz|Quiz|Related)\b/;

/**
 * Remove the Reflection worksheet, Quick quiz, and Related sections from a day's
 * body markdown. Each lives in its own tab now (Reflection / Quiz); the Related
 * section uses Obsidian wikilinks that don't render cleanly and its navigation
 * is handled by the page's prev/next buttons.
 */
export function stripAppendix(body: string): string {
  const match = body.match(APPENDIX_CUT_RE);
  if (!match || match.index === undefined) return body;
  let out = body.slice(0, match.index);
  out = out.replace(/\n+---\s*$/, "");
  return out.trimEnd();
}

// Obsidian wikilinks must be rewritten to standard markdown links so
// ReactMarkdown can render them as React Router <Link>s. The curriculum is
// authored in Obsidian, so links take several shapes that all have to resolve
// on the web:
//   [[day-07|Title]]                  same-week day reference
//   [[day-07\|Title]]                 table-escaped pipe
//   [[../week-9/day-52|Title]]        cross-week day reference (path-prefixed)
//   [[../assignments/assignment-02|]] assignment reference
//   [[README|Week 3 - ...]]           this week's overview
//   [[../INDEX|The First 60 Days]]    track index
//   [[../_source-supplementary/...]]  source material NOT shipped to the web
// Anything that can't be routed (other tracks, ingest folders, source decks)
// is rendered as plain label text rather than a raw `[[...]]` or a dead link.
const WIKILINK_RE = /(!?)\[\[([^\]]+?)\]\]/g;

// Targets that point outside the shipped first-60-days day/assignment/reference
// set — other learning tracks and Obsidian-only source folders. These have no
// web route, so the wikilink becomes plain text (its label).
const NON_SHIPPED_TARGET =
  /(?:next-60-days|first-14-days|first-30-days|product-mastery|pre-retiree|_source-|product-sales|appointment-setting|warm-market-flow|basic-cpf|behavioural-competency|right-questions-ingest|sales-training-ingest|weekly-recaps)/i;

export function convertWikilinks(body: string): string {
  return body.replace(WIKILINK_RE, (match: string, bang: string, inner: string) => {
    // Image embeds (`![[...]]`) are handled by convertImageEmbeds — leave alone.
    if (bang === "!") return match;

    const pipe = inner.search(/\\?\|/);
    const target = (pipe >= 0 ? inner.slice(0, pipe) : inner).trim();
    const label = (pipe >= 0 ? inner.slice(pipe).replace(/^\\?\|/, "") : "").trim();
    const plain = () => label || target.split("/").pop() || target;

    // Source material / other tracks — no web route, keep the readable label.
    if (NON_SHIPPED_TARGET.test(target)) return plain();

    // Day reference, with or without a `../week-N/` path prefix.
    const dayM = target.match(/(?:^|\/)day-0*(\d+)$/);
    if (dayM) {
      const n = Number(dayM[1]);
      return `[${label || `Day ${n}`}](/learning-track/first-60-days/day/${n})`;
    }

    // Assignment reference.
    const asgM = target.match(/(?:^|\/)assignment-0*(\d+)$/);
    if (asgM) {
      const padded = String(asgM[1]).padStart(2, "0");
      return `[${label || `Assignment ${Number(asgM[1])}`}](/learning-track/pre-rnf/assignments/assignment-${padded})`;
    }

    // This week's README overview, or the track INDEX — both resolve to the hub.
    if (/(?:^|\/)README$/i.test(target)) return `[${label || "Week overview"}](/learning-track/first-60-days)`;
    if (/(?:^|\/)INDEX$/i.test(target)) return `[${label || "The First 60 Days"}](/learning-track/first-60-days)`;

    // Top-level reference doc (e.g. `../_source-supplementary/cst-risks-script-full`)
    // is caught by NON_SHIPPED_TARGET above; anything else left here is unroutable.
    return plain();
  });
}

// Obsidian image embeds like `![[pro-achiever/day-02/drawing-01.png]]` or
// `![[drawing-01.png|alt text]]` need to become standard markdown image tags so
// the web renderer can show them. Source markdowns use this syntax so the same
// files render natively in Obsidian (which resolves the path through vault-root
// symlinks into compass-hub/public/).
const IMAGE_EMBED_RE = /!\[\[([^\]|]+\.(?:png|jpe?g|gif|svg|webp))(?:\|([^\]]+))?\]\]/gi;

export function convertImageEmbeds(body: string): string {
  return body.replace(IMAGE_EMBED_RE, (_match, rawPath: string, alt?: string) => {
    const path = rawPath.trim();
    const url = path.startsWith("/") ? path : `/${path}`;
    const fileName = path.split("/").pop() ?? path;
    const baseName = fileName.replace(/\.[^.]+$/, "");
    const altText = (alt?.trim() || baseName).replace(/[\[\]]/g, "");
    return `![${altText}](${url})`;
  });
}

export function parseReflection(body: string): ReflectionPrompt[] {
  const heading = body.match(REFLECTION_HEADING_RE);
  if (!heading || heading.index === undefined) return [];
  const afterHeading = body.slice(heading.index + heading[0].length);
  const nextMatch = afterHeading.match(NEXT_HEADING_RE);
  const section = nextMatch ? afterHeading.slice(0, nextMatch.index) : afterHeading;

  const prompts: ReflectionPrompt[] = [];
  const blocks = section.split(/\n(?=\*\*\d+\.\s)/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!/^\*\*\d+\.\s/.test(trimmed)) continue;
    const p = parseReflectionBlock(trimmed, prompts.length + 1);
    if (p) prompts.push(p);
  }
  return prompts;
}

function parseReflectionBlock(block: string, index: number): ReflectionPrompt | null {
  const questionMatch = block.match(/^\*\*\d+\.\s+(.+?)\*\*\s*(?:\n|$)/s);
  if (!questionMatch) return null;
  const question = questionMatch[1].trim().replace(/\s*:\s*$/, "");

  const rest = block.slice(questionMatch[0].length);
  const hintLines: string[] = [];
  for (const line of rest.split("\n")) {
    const hintMatch = line.match(/^\s*>\s*(.*)$/);
    if (hintMatch) hintLines.push(hintMatch[1].trim());
    else if (line.trim() === "") continue;
    else break;
  }
  const hint = hintLines.join(" ").trim() || undefined;
  return { index, question, hint };
}

export function parseQuiz(body: string): QuizQuestion[] {
  const quizMatch = body.match(QUIZ_HEADING_RE);
  if (!quizMatch || quizMatch.index === undefined) return [];
  const afterHeading = body.slice(quizMatch.index + quizMatch[0].length);
  const nextMatch = afterHeading.match(NEXT_HEADING_RE);
  const section = nextMatch ? afterHeading.slice(0, nextMatch.index) : afterHeading;

  const questions: QuizQuestion[] = [];
  const blocks = section.split(/\n(?=(?:\d+\.\s+\*\*|\*\*Q\d+[.)]\s))/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!/^(?:\d+\.\s+\*\*|\*\*Q\d+[.)]\s)/.test(trimmed)) continue;
    const q = parseQuestionBlock(trimmed, questions.length + 1);
    if (q) questions.push(q);
  }
  return questions;
}

function parseQuestionBlock(block: string, index: number): QuizQuestion | null {
  const lines = block.split("\n");
  const header = lines[0] ?? "";
  const questionMatch =
    header.match(/^\d+\.\s+\*\*(.+?)\*\*\s*$/) ??
    header.match(/^\*\*Q\d+[.)]\s+(.+?)\*\*\s*$/);
  if (!questionMatch) return null;
  const question = questionMatch[1].trim();

  const options: QuizOption[] = [];
  const explanationLines: string[] = [];
  let sawOption = false;
  let inExplanationParagraph = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optMatch = line.match(/^\s*[-*]\s+([A-Z])\)\s+(.+?)\s*$/);
    if (optMatch) {
      sawOption = true;
      inExplanationParagraph = false;
      const key = optMatch[1];
      let text = optMatch[2];
      // Day quizzes use either a trailing checkmark (✓) or a literal "(correct)" suffix
      // to flag the right answer. Both must be stripped from the displayed text and
      // surfaced as the `correct` boolean.
      const correctRe = /\s*(?:✓|\(correct\))\s*$/i;
      const correct = correctRe.test(text);
      if (correct) text = text.replace(correctRe, "").trim();
      options.push({ key, text, correct });
      continue;
    }
    if (!sawOption) continue;
    const quoteMatch = line.match(/^\s*>\s?(.*)$/);
    if (quoteMatch) {
      explanationLines.push(quoteMatch[1].trim());
      continue;
    }
    const whyStart = line.match(/^\s*\*\*(?:Why|Explanation|Because)[:：]?\*\*\s*[:：]?\s*(.*)$/i);
    if (whyStart) {
      inExplanationParagraph = true;
      if (whyStart[1].trim()) explanationLines.push(whyStart[1].trim());
      continue;
    }
    if (inExplanationParagraph) {
      if (line.trim() === "") {
        inExplanationParagraph = false;
        continue;
      }
      explanationLines.push(line.trim());
    }
  }

  if (options.length === 0) return null;
  const explanation = explanationLines
    .join(" ")
    .replace(/^(?:Explanation|Why|Because)\s*[:—-]\s*/i, "")
    .trim();
  return {
    index,
    question,
    options,
    explanation: explanation.length > 0 ? explanation : undefined,
  };
}
