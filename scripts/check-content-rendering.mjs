#!/usr/bin/env node
// Guards against markdown that renders BROKEN in the learning-track viewer.
//
// The day-lesson renderer (ReactMarkdown + remark-gfm + rehype-sanitize,
// see src/lib/markdown-sanitize.ts) STRIPS every inline `style=""` attribute,
// so any <div style="..."> "designer" block renders as garbled unstyled text.
// Horizontal mermaid (`flowchart LR`) shrinks to an illegible sketch on phones.
// Both keep getting reintroduced by external authoring; this fails the build.
//
// Scope: only RENDERED day files — docs/**/week-*/day-*.md. Source archives
// under _source-* / _reference are not rendered and are intentionally skipped.
//
// Run: node scripts/check-content-rendering.mjs   (wired into `prebuild`)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(__dirname, '..', 'docs');

// Only files matching this are rendered as student day pages.
const DAY_FILE_RE = /(^|\/)week-\d+\/day-\d+\.md$/;

const RULES = [
  {
    id: 'inline-style',
    pattern: /style\s*=\s*["']/,
    reason: 'inline style="" is stripped by the sanitizer; use markdown tables/lists/blockquotes or a ```mermaid diagram',
  },
  {
    id: 'flowchart-lr',
    pattern: /```mermaid[\s\S]*?flowchart\s+LR\b/,
    perLine: /flowchart\s+LR\b/,
    reason: 'horizontal mermaid is illegible on mobile; use `flowchart TD` (vertical)',
  },
  {
    id: 'leaked-metadata',
    pattern: /audience=general|category=tips/,
    reason: 'leaked CMS field metadata in a _Source:_ line; trim to a clean attribution',
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

const all = walk(docsDir);
const dayFiles = all.filter((f) => DAY_FILE_RE.test(f.replace(/\\/g, '/')));

const failures = [];
for (const file of dayFiles) {
  const content = readFileSync(file, 'utf8');
  const rel = relative(resolve(__dirname, '..'), file);
  for (const rule of RULES) {
    if (!rule.pattern.test(content)) continue;
    // Report the first offending line for a helpful pointer.
    const lineRe = rule.perLine ?? rule.pattern;
    const lines = content.split('\n');
    const lineNo = lines.findIndex((l) => lineRe.test(l)) + 1;
    failures.push({ file: rel, line: lineNo || '?', id: rule.id, reason: rule.reason });
  }
}

if (failures.length === 0) {
  console.log(`✓ content-rendering guard: ${dayFiles.length} day files clean (no inline style, no flowchart LR, no leaked metadata)`);
  process.exit(0);
}

console.error(`✗ content-rendering guard: ${failures.length} rendering issue(s) found in day files\n`);
for (const f of failures) {
  console.error(`  [${f.id}] ${f.file}:${f.line}`);
  console.error(`    ${f.reason}\n`);
}
console.error('See docs/CONTENT-AUTHORING.md for the rendering rules.');
process.exit(1);
