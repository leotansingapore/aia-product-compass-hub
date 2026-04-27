#!/usr/bin/env node
// Copies the per-product 5-day curricula from the Obsidian vault into the
// repo at docs/product-mastery-track/week-N/day-NN.md, transforming the
// quiz and frontmatter into the format expected by
// src/features/first-60-days/parse.ts so the same parser can be reused.
//
// Run from the repo root: node scripts/sync-product-mastery-track.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const vaultRoot = '/Users/leo/Documents/Obsidian Vault/Content/product-sales';
const outputRoot = resolve(repoRoot, 'docs', 'product-mastery-track');

// Week ordering — week 1 is Pro Achiever (user-specified). The rest follows
// pedagogical complexity: build foundations, layer protection, end on PWV
// as the capstone since it draws on every prior product's framing.
const WEEKS = [
  { week: 1, slug: 'pro-achiever',             label: 'Pro Achiever 3.0',                tagSuffix: 'pro-achiever' },
  { week: 2, slug: 'pro-lifetime-protector',   label: 'Pro Lifetime Protector',          tagSuffix: 'pro-lifetime-protector' },
  { week: 3, slug: 'guaranteed-protect-plus',  label: 'Guaranteed Protect Plus',         tagSuffix: 'guaranteed-protect-plus' },
  { week: 4, slug: 'ultimate-critical-cover',  label: 'Ultimate Critical Cover',         tagSuffix: 'ultimate-critical-cover' },
  { week: 5, slug: 'healthshield-gold-max',    label: 'HealthShield Gold Max',           tagSuffix: 'healthshield-gold-max' },
  { week: 6, slug: 'solitaire-pa',             label: 'Solitaire PA',                    tagSuffix: 'solitaire-pa' },
  { week: 7, slug: 'platinum-wealth-venture',  label: 'Platinum Wealth Venture',         tagSuffix: 'platinum-wealth-venture' },
];

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) throw new Error('missing frontmatter');
  const yaml = m[1];
  const body = raw.slice(m[0].length);
  const fm = {};
  const lines = yaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawVal = kv[2].trim();
    if (rawVal === '') {
      const children = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        children.push(lines[i + 1].replace(/^\s+-\s+/, '').trim());
        i++;
      }
      fm[key] = children;
    } else {
      fm[key] = rawVal.replace(/^["']|["']$/g, '');
    }
  }
  return { fm, body };
}

// Strip Obsidian wikilinks (vault-relative) so the parser doesn't choke.
// We replace [[path|label]] with a plain text label, since none of these
// targets exist inside the repo's docs/ tree.
function stripWikilinks(body) {
  return body.replace(/\[\[([^\]]+)\]\]/g, (_full, inner) => {
    const pipe = inner.indexOf('|');
    return pipe === -1 ? inner.split('/').pop() : inner.slice(pipe + 1);
  });
}

// Convert "## Quiz (10 questions)" -> "## Quiz" and rewrite each question
// from `**N. ...?**` -> `N. **...?**`, mark the correct option with " ✓",
// and rewrite `**Answer:** L. text` to `**Why:** text`.
function convertQuiz(body) {
  let out = body.replace(/^##\s+Quiz\s*\(\d+\s+questions?\)\s*$/m, '## Quiz');

  // Find the Quiz section and rewrite within it
  const start = out.indexOf('\n## Quiz\n');
  if (start === -1) return out;
  const sectionStart = start + 1; // skip leading newline
  const afterHeading = sectionStart + '## Quiz'.length;
  const nextHeading = out.slice(afterHeading).search(/\n##\s+\S/);
  const sectionEnd = nextHeading === -1 ? out.length : afterHeading + nextHeading;
  const before = out.slice(0, sectionStart);
  const section = out.slice(sectionStart, sectionEnd);
  const after = out.slice(sectionEnd);

  // Split section into question blocks at "**N. " boundaries (after the heading)
  const blockRe = /\*\*(\d+)\.\s+([^*]+?)\*\*([\s\S]*?)(?=\n\*\*\d+\.\s|\n##\s+\S|$)/g;
  const rewritten = section.replace(blockRe, (_full, num, qtext, rest) => {
    // Parse out the answer letter and explanation from "**Answer:** X. text"
    const ansMatch = rest.match(/\*\*Answer:\*\*\s*([A-Z])\.\s*([\s\S]*?)(?=\n\n|$)/);
    let body = rest;
    let correctLetter = null;
    let explanation = '';
    if (ansMatch) {
      correctLetter = ansMatch[1];
      explanation = ansMatch[2].trim().replace(/\s+/g, ' ');
      body = rest.slice(0, ansMatch.index);
    }

    // Mark the correct option line
    if (correctLetter) {
      const optRe = new RegExp(`(^|\\n)(-\\s+${correctLetter}\\)\\s+[^\\n]+?)(\\s*)(?=\\n|$)`, '');
      body = body.replace(optRe, (_m, lead, line) => `${lead}${line} \u2713`);
    }

    // Rewrite header from `**N. Q?**` -> `N. **Q?**`
    const newHeader = `${num}. **${qtext.trim()}**`;
    const explBlock = explanation ? `\n\n**Why:** ${explanation}\n` : '\n';
    return `${newHeader}${body.replace(/\n+$/, '')}${explBlock}`;
  });

  return before + rewritten + after;
}

// Strip the trailing `## Related` section — it relies on Obsidian wikilinks
// and the page already has prev/next buttons in the UI.
function stripRelated(body) {
  const m = body.match(/\n##\s+Related\s*\n[\s\S]*$/);
  return m ? body.slice(0, m.index).trimEnd() + '\n' : body;
}

function buildFrontmatter({ globalDay, weekNum, productLabel, originalTitle, originalDuration, productSlug, originalTags }) {
  const tags = new Set([
    'product-mastery-track',
    `week-${weekNum}`,
    productSlug,
  ]);
  if (Array.isArray(originalTags)) {
    for (const t of originalTags) {
      const cleaned = String(t).trim().replace(/^["']|["']$/g, '');
      if (cleaned && cleaned !== productSlug) tags.add(cleaned);
    }
  }
  const tagList = `[${[...tags].join(', ')}]`;
  const duration = Number.isFinite(Number(originalDuration)) ? Number(originalDuration) : 30;

  return [
    '---',
    `week: ${weekNum}`,
    `day: ${globalDay}`,
    `title: "${productLabel} — ${originalTitle.replace(/^["']|["']$/g, '')}"`,
    `primary_source: ${productSlug}-product-summary`,
    `primary_slides: "n/a"`,
    `duration_minutes: ${duration}`,
    `tags: ${tagList}`,
    '---',
    '',
  ].join('\n');
}

let totalWritten = 0;
const summaries = [];

for (const { week, slug, label } of WEEKS) {
  const weekDir = resolve(outputRoot, `week-${week}`);
  if (!existsSync(weekDir)) mkdirSync(weekDir, { recursive: true });

  for (let dayInWeek = 1; dayInWeek <= 5; dayInWeek++) {
    const sourcePath = resolve(vaultRoot, slug, `day-0${dayInWeek}.md`);
    const globalDay = (week - 1) * 5 + dayInWeek;
    const targetPath = resolve(weekDir, `day-${String(globalDay).padStart(2, '0')}.md`);

    let raw;
    try {
      raw = readFileSync(sourcePath, 'utf8');
    } catch (err) {
      console.error(`SKIP ${slug} day ${dayInWeek}: ${err.message}`);
      continue;
    }

    const { fm, body } = parseFrontmatter(raw);
    const originalTitle = String(fm.title ?? `${label} Day ${dayInWeek}`);
    const originalDuration = fm.duration_minutes;
    const originalTags = fm.tags;

    let processed = stripWikilinks(body);
    processed = convertQuiz(processed);
    processed = stripRelated(processed);
    processed = processed.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

    const newFrontmatter = buildFrontmatter({
      globalDay,
      weekNum: week,
      productLabel: label,
      originalTitle,
      originalDuration,
      productSlug: slug,
      originalTags,
    });

    writeFileSync(targetPath, newFrontmatter + processed);
    totalWritten++;
    summaries.push({
      day: globalDay,
      week,
      title: `${label} — ${originalTitle.replace(/^["']|["']$/g, '')}`,
      durationMinutes: Number.isFinite(Number(originalDuration)) ? Number(originalDuration) : 30,
      productSlug: slug,
    });
  }
}

// Emit a JSON summary so the front-end loader has a stable manifest
const manifestPath = resolve(outputRoot, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify({ totalDays: totalWritten, summaries }, null, 2) + '\n');

console.log(`\u2713 wrote ${totalWritten} day files to ${outputRoot}`);
console.log(`\u2713 wrote manifest to ${manifestPath}`);
