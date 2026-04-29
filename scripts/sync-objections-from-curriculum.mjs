#!/usr/bin/env node
// Parses curriculum objection content into src/data/curatedObjections.generated.ts.
// Sources: docs/first-60-days/week-8/day-44.md + docs/next-60-days/week-7/day-40.md.
// Pure file I/O - no shell calls. Review the output and merge useful additions
// into the canonical src/data/curatedObjections.ts by hand.
//
// Usage: node scripts/sync-objections-from-curriculum.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

const SOURCES = [
  {
    path: "docs/first-60-days/week-8/day-44.md",
    label: "Day 44 - Handling Resistance & Objections",
    href: "/learning-track/first-60-days/day/44",
    parser: "day44",
  },
  {
    path: "docs/next-60-days/week-7/day-40.md",
    label: "Day 40 (next-60-days) - Objection Turnaround",
    href: "/learning-track/next-60-days/day/40",
    parser: "day40",
  },
];

function inferFamily(title) {
  const t = title.toLowerCase();
  if (t.includes("advisor") || t.includes("aunt") || t.includes("uncle")) return "have-advisor";
  if (t.includes("policies") || t.includes("already covered") || t.includes("already have insurance")) return "have-policies";
  if (t.includes("email") || t.includes("post it") || t.includes("send me") || t.includes("video off")) return "format";
  if (t.includes("think") || t.includes("later") || t.includes("not now") || t.includes("not the time") || t.includes("busy") || t.includes("no money")) return "cost-of-delay";
  return "push-away";
}

function inferFramework(title, body, family) {
  const text = (title + " " + body).toLowerCase();
  if (text.includes("feel-felt-found") || text.includes("framework b") || text.includes("(feel)") || text.includes("(felt)")) return "B";
  if (text.includes("boomerang") || text.includes("framework c") || text.includes("that's exactly why")) return "C";
  if (text.includes("framework a") || text.includes("acknowledge -> question") || text.includes("acknowledge → question")) return "A";
  if (text.includes("skip-q") || text.includes("skip the q")) return "skip-q";
  if (family === "have-advisor") return "B";
  if (family === "have-policies") return "C";
  return "skip-q";
}

function extractScripts(body) {
  const scripts = [];
  const lines = body.split("\n");
  let label = "Stock response";
  let block = [];
  let inBlock = false;

  const flush = () => {
    if (block.length > 0) {
      const content = block.join(" ").replace(/^"|"$/g, "").replace(/\s+/g, " ").trim();
      if (content.length > 0) scripts.push({ label, content });
      block = [];
    }
  };

  for (const line of lines) {
    const labelMatch = line.match(/^\*\*([^*]+?)[:\*]\*?\*?$/) || line.match(/^####?\s+(.+?)\s*$/);
    if (labelMatch && !inBlock) label = labelMatch[1].trim();

    const quoteMatch = line.match(/^\s*>\s*"?(.*?)"?\s*$/);
    if (quoteMatch) {
      const content = quoteMatch[1].trim();
      if (content.length > 0) {
        block.push(content);
        inBlock = true;
      }
    } else if (inBlock) {
      flush();
      inBlock = false;
    }
  }
  flush();
  return scripts;
}

function extractTrigger(body) {
  const useWhen = body.match(/^\s*\*\*Use this when\*\*\s+(.+?)$/m);
  if (useWhen) return useWhen[1].trim().replace(/\s+/g, " ");
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith(">") && !trimmed.startsWith("**") && !trimmed.startsWith("#") && !trimmed.startsWith("|")) {
      return trimmed.replace(/^\*\*[^*]+\*\*\s*/, "").substring(0, 200).replace(/\s+/g, " ");
    }
  }
  return "";
}

function extractWatchOut(body) {
  const m = body.match(/\*\*Watch out:?\*\*\s*(.+?)(?:\n\n|\n\*\*|$)/s);
  if (m) return m[1].trim().replace(/\s+/g, " ");
  return undefined;
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function parseDay44(content, source) {
  const out = [];
  const re = /^### "([^"]+)"(?:\s*\([^)]+\))?\s*\n([\s\S]*?)(?=^### |^## |\Z)/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const title = m[1].trim();
    const body = m[2];
    if (title.toLowerCase().includes("for the obstinate")) continue;
    const family = inferFamily(title);
    const framework = inferFramework(title, body, family);
    const scripts = extractScripts(body);
    if (scripts.length === 0) continue;
    out.push({
      id: slugify(title),
      title,
      family,
      framework,
      trigger: extractTrigger(body) || `Stock objection from ${source.label}.`,
      approach: `Generated from curriculum source. Framework: ${framework}. Review and refine before using.`,
      scripts,
      watchOut: extractWatchOut(body),
      source: { day: source.label, path: source.href },
    });
  }
  return out;
}

function parseDay40(content, source) {
  const out = [];
  const re = /\*\*Prospect:?\*\*\s*\*"([^"]+)"\*?\s*\n+\*\*You:?\*\*\s*\*?"([\s\S]+?)"\*?\s*(?=\n\n|$)/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    const title = m[1].trim();
    if (seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    const family = inferFamily(title);
    const start = Math.max(0, m.index - 800);
    const surrounding = content.substring(start, m.index).toLowerCase();
    let framework = "skip-q";
    if (surrounding.includes("art —") || surrounding.includes("clear objection")) framework = "A";
    else if (surrounding.includes("iceberg") || surrounding.includes("ambiguous")) framework = "A";
    else if (surrounding.includes("anchor-disrupt-ask")) framework = "skip-q";

    out.push({
      id: slugify(title) + "-day40",
      title,
      family,
      framework,
      trigger: `Worked example from ${source.label}.`,
      approach: `From the Day 40 worked examples. Review for fit before using.`,
      scripts: [{ label: "Worked response", content: m[2].replace(/\s+/g, " ").trim() }],
      source: { day: source.label, path: source.href },
    });
  }
  return out;
}

function renderTs(objections) {
  const lines = [];
  lines.push("// AUTO-GENERATED FILE - do not edit directly.");
  lines.push("// Run `node scripts/sync-objections-from-curriculum.mjs` to regenerate.");
  lines.push("// Source: docs/first-60-days/week-8/day-44.md + docs/next-60-days/week-7/day-40.md");
  lines.push("");
  lines.push('import type { CuratedObjection } from "./curatedObjections";');
  lines.push("");
  lines.push("export const GENERATED_OBJECTIONS: CuratedObjection[] = [");
  for (const o of objections) {
    lines.push("  {");
    lines.push(`    id: ${JSON.stringify(o.id)},`);
    lines.push(`    title: ${JSON.stringify(o.title)},`);
    lines.push(`    family: ${JSON.stringify(o.family)},`);
    lines.push(`    framework: ${JSON.stringify(o.framework)},`);
    lines.push(`    trigger: ${JSON.stringify(o.trigger)},`);
    lines.push(`    approach: ${JSON.stringify(o.approach)},`);
    lines.push(`    scripts: [`);
    for (const s of o.scripts) {
      lines.push(`      { label: ${JSON.stringify(s.label)}, content: ${JSON.stringify(s.content)} },`);
    }
    lines.push(`    ],`);
    if (o.watchOut) lines.push(`    watchOut: ${JSON.stringify(o.watchOut)},`);
    lines.push(`    source: { day: ${JSON.stringify(o.source.day)}, path: ${JSON.stringify(o.source.path)} },`);
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

const all = [];
for (const src of SOURCES) {
  const full = resolve(REPO_ROOT, src.path);
  let content;
  try {
    content = readFileSync(full, "utf8");
  } catch (e) {
    console.error(`[sync-objections] cannot read ${full}:`, e.message);
    continue;
  }
  const parsed = src.parser === "day44" ? parseDay44(content, src) : parseDay40(content, src);
  console.log(`[sync-objections] ${src.path}: extracted ${parsed.length} objections`);
  for (const p of parsed) {
    console.log(`  - ${p.title}  ->  family=${p.family} framework=${p.framework} scripts=${p.scripts.length}`);
  }
  all.push(...parsed);
}

const outPath = resolve(REPO_ROOT, "src/data/curatedObjections.generated.ts");
writeFileSync(outPath, renderTs(all), "utf8");
console.log(`\n[sync-objections] wrote ${all.length} objections to src/data/curatedObjections.generated.ts`);
console.log(`[sync-objections] review the generated file and merge useful additions into src/data/curatedObjections.ts by hand`);
