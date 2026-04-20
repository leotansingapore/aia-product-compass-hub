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

const QUIZ_HEADING_RE = /^##\s+Quick quiz\s*$/m;
const REFLECTION_HEADING_RE = /^##\s+(Reflection worksheet|Final reflection[^\n]*)$/m;
const NEXT_HEADING_RE = /^##\s+\S/m;
const APPENDIX_CUT_RE = /\n##\s+(Reflection worksheet|Final reflection|Quick quiz|Related)\b/;

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
  const blocks = section.split(/\n(?=\d+\.\s+\*\*)/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!/^\d+\.\s+\*\*/.test(trimmed)) continue;
    const q = parseQuestionBlock(trimmed, questions.length + 1);
    if (q) questions.push(q);
  }
  return questions;
}

function parseQuestionBlock(block: string, index: number): QuizQuestion | null {
  const lines = block.split("\n");
  const header = lines[0] ?? "";
  const questionMatch = header.match(/^\d+\.\s+\*\*(.+?)\*\*\s*$/);
  if (!questionMatch) return null;
  const question = questionMatch[1].trim();

  const options: QuizOption[] = [];
  const explanationLines: string[] = [];
  let sawOption = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optMatch = line.match(/^\s*[-*]\s+([A-Z])\)\s+(.+?)\s*$/);
    if (optMatch) {
      sawOption = true;
      const key = optMatch[1];
      let text = optMatch[2];
      const correct = /\s*✓\s*$/.test(text);
      if (correct) text = text.replace(/\s*✓\s*$/, "").trim();
      options.push({ key, text, correct });
      continue;
    }
    if (!sawOption) continue;
    const quoteMatch = line.match(/^\s*>\s?(.*)$/);
    if (quoteMatch) {
      explanationLines.push(quoteMatch[1].trim());
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
