#!/usr/bin/env node
// Push the curriculum into the AI assistant's knowledge base.
//
// The assistant retrieves from `knowledge_chunks`, which held only scripts and
// training-video transcripts — so it could not answer a single question about
// the lessons learners actually read. This walks all four tracks' day markdown,
// splits each day into heading-sized chunks, and replaces the `curriculum`
// rows in one transaction.
//
// Re-run after ANY curriculum change so new content reaches the assistant:
//   node scripts/sync-curriculum-knowledge.mjs           # apply
//   node scripts/sync-curriculum-knowledge.mjs --dry-run # count only
//
// Auth: Supabase Management API token at ~/.local/state/va-watchdog/token
// (knowledge_chunks is service-role-only under RLS, so the anon key cannot
// write here).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");

const TOKEN_PATH = join(homedir(), ".local/state/va-watchdog/token");
const PROJECT_REF = (
  readFileSync(join(ROOT, ".env"), "utf8").match(/VITE_SUPABASE_PROJECT_ID="?([^"\n]+)/) || []
)[1];

const TRACKS = [
  {
    key: "f60",
    label: "First 60 Days",
    dir: "docs/first-60-days",
    href: (day) => `/learning-track/first-60-days/day/${day}`,
  },
  {
    key: "pm",
    label: "Product Mastery",
    dir: "docs/product-mastery-track",
    href: (day) => `/learning-track/product-mastery/day/${day}`,
  },
  {
    key: "n60",
    label: "Next 60 Days",
    dir: "docs/next-60-days",
    href: (day) => `/learning-track/next-60-days/day/${day}`,
  },
  {
    key: "f14",
    label: "First 14 Days",
    dir: "docs/first-14-days",
    href: (day) => `/learning-track/first-14-days/day/${day}`,
  },
];

const MIN_CHUNK = 400;
const MAX_CHUNK = 2500;

function stripFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { fm, body: raw.slice(m[0].length) };
}

// Quiz answer keys would let the assistant hand out answers; teaching content
// is what learners need help with.
function stripQuiz(body) {
  const i = body.search(/^##\s+Quiz\s*$/im);
  return i === -1 ? body : body.slice(0, i);
}

/** Split a day into chunks that each start at a heading, merging tiny
 *  sections and hard-splitting oversized ones so no chunk dominates a
 *  retrieval window. */
function chunkDay(body) {
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: "", lines: [] };
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (h) {
      if (current.lines.join("").trim()) sections.push(current);
      current = { heading: h[2].trim(), lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join("").trim()) sections.push(current);

  const chunks = [];
  let buf = null;
  const flush = () => {
    if (buf && buf.text.trim()) chunks.push(buf);
    buf = null;
  };
  for (const s of sections) {
    const text = s.lines.join("\n").trim();
    if (!text) continue;
    if (text.length > MAX_CHUNK) {
      flush();
      const paras = text.split(/\n{2,}/);
      let part = "";
      for (const p of paras) {
        if ((part + "\n\n" + p).length > MAX_CHUNK && part) {
          chunks.push({ heading: s.heading, text: part.trim() });
          part = p;
        } else {
          part = part ? `${part}\n\n${p}` : p;
        }
      }
      if (part.trim()) chunks.push({ heading: s.heading, text: part.trim() });
      continue;
    }
    if (buf && buf.text.length + text.length < MIN_CHUNK * 2) {
      buf.text += `\n\n${text}`;
    } else {
      flush();
      buf = { heading: s.heading, text };
    }
  }
  flush();
  return chunks;
}

const rows = [];

/** Push one document's chunks as rows. */
function addDoc({ label, title, href, body, idPrefix, meta }) {
  const chunks = chunkDay(stripQuiz(body));
  chunks.forEach((c, i) => {
    const content =
      `[${label} — ${title}]` +
      (c.heading ? `\nSection: ${c.heading}` : "") +
      `\nLink: ${href}\n\n${c.text}`;
    rows.push({
      source_type: "curriculum",
      source_id: `${idPrefix}-${i}`,
      content,
      metadata: { ...meta, heading: c.heading, href, title },
    });
  });
}

for (const track of TRACKS) {
  const dir = join(ROOT, track.dir);
  if (!existsSync(dir)) continue;
  for (const week of readdirSync(dir).filter((d) => /^week-\d+$/.test(d))) {
    for (const file of readdirSync(join(dir, week))) {
      const m = file.match(/^day-(\d+)\.md$/);
      if (!m) continue;
      const day = Number(m[1]);
      const raw = readFileSync(join(dir, week, file), "utf8");
      const { fm, body } = stripFrontmatter(raw);
      const dayTitle = fm.title || `Day ${day}`;
      const href = track.href(day);
      const chunks = chunkDay(stripQuiz(body));
      chunks.forEach((c, i) => {
        // Each chunk carries its own provenance header: retrieval returns the
        // chunk alone, so without this the model cannot say which day or link
        // an answer came from.
        const content =
          `[${track.label} — Day ${day}: ${dayTitle}]` +
          (c.heading ? `\nSection: ${c.heading}` : "") +
          `\nLink: ${href}\n\n${c.text}`;
        rows.push({
          source_type: "curriculum",
          source_id: `${track.key}-day-${day}-${i}`,
          content,
          metadata: {
            track: track.key,
            track_label: track.label,
            day,
            day_title: dayTitle,
            heading: c.heading,
            href,
          },
        });
      });
    }
  }
}

// Cheat sheets — the one-page summaries at /cheat-sheets/:section/:slug.
const CHEAT_DIR = join(ROOT, "docs/cheat-sheets");
if (existsSync(CHEAT_DIR)) {
  for (const section of readdirSync(CHEAT_DIR)) {
    const secDir = join(CHEAT_DIR, section);
    let files = [];
    try {
      files = readdirSync(secDir).filter((f) => f.endsWith(".md"));
    } catch {
      continue; // a stray file rather than a section directory
    }
    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      if (/^index$/i.test(slug)) continue;
      const { fm, body } = stripFrontmatter(readFileSync(join(secDir, file), "utf8"));
      addDoc({
        label: "Cheat Sheet",
        title: fm.title || slug,
        href: `/cheat-sheets/${section}/${slug}`,
        body,
        idPrefix: `cheat-${section}-${slug}`,
        meta: { track: "cheat", track_label: "Cheat Sheet", section, slug },
      });
    }
  }
}

// Reference documents shipped alongside the First 60 Days days.
const REF_DIR = join(ROOT, "docs/first-60-days/_source-supplementary");
if (existsSync(REF_DIR)) {
  for (const file of readdirSync(REF_DIR).filter((f) => f.endsWith(".md"))) {
    const slug = file.replace(/\.md$/, "");
    // Internal index docs are hidden from learners, so keep them out too.
    if (/^INDEX-/i.test(slug)) continue;
    const { fm, body } = stripFrontmatter(readFileSync(join(REF_DIR, file), "utf8"));
    addDoc({
      label: "Reference",
      title: fm.title || slug,
      href: `/learning-track/first-60-days/reference/${slug}`,
      body,
      idPrefix: `ref-${slug}`,
      meta: { track: "reference", track_label: "Reference", slug },
    });
  }
}

const byTrack = {};
for (const r of rows) byTrack[r.metadata.track] = (byTrack[r.metadata.track] || 0) + 1;
const totalChars = rows.reduce((n, r) => n + r.content.length, 0);
console.log(
  `Prepared ${rows.length} curriculum chunks (${JSON.stringify(byTrack)}), ` +
    `${(totalChars / 1e6).toFixed(2)}M chars, avg ${Math.round(totalChars / rows.length)}.`,
);

if (DRY) {
  console.log("Dry run — nothing written.");
  console.log("Sample:\n" + rows[0].content.slice(0, 400));
  process.exit(0);
}

const token = readFileSync(TOKEN_PATH, "utf8").trim();
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function runSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Cloudflare rejects the default fetch UA on this endpoint.
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 400)}`);
  return text;
}

// Replace rather than diff: these rows are derived from files in git, so a
// clean rebuild is always correct and cannot leave orphans behind.
await runSql(`delete from knowledge_chunks where source_type = 'curriculum';`);
console.log("Cleared previous curriculum chunks.");

const BATCH = 60;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const values = batch
    .map(
      (r) =>
        `(${q(r.source_type)}, ${q(r.source_id)}, ${q(r.content)}, ${q(JSON.stringify(r.metadata))}::jsonb)`,
    )
    .join(",\n");
  await runSql(
    `insert into knowledge_chunks (source_type, source_id, content, metadata) values\n${values};`,
  );
  process.stdout.write(`\rInserted ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
}
console.log("\nDone.");

const check = await runSql(
  `select source_type, count(*) from knowledge_chunks group by 1 order by 2 desc;`,
);
console.log(check);
