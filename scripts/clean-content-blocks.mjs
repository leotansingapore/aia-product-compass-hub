#!/usr/bin/env node
/**
 * Clean up Google-Docs paste artefacts in learning_track_content_blocks.body:
 *   - Collapse newlines inside image alt text:  ![alt\n...]\(url\)  →  ![alt ...](url)
 *   - Collapse newlines inside link labels:      [text\n...]\(url\)  →  [text ...](url)
 *   - Trim whitespace on URLs:                   [text]( url )       →  [text](url)
 *   - Drop transient Google Slides export images whose URL starts with
 *     https://lh7-rt.googleusercontent.com/slidesz/ or https://lh3.googleusercontent.com/slidesz/
 *     (they require the author's session + expire). Replaced with the alt text
 *     italicised so the document still flows.
 *
 * Usage:
 *   node --env-file=.env.local scripts/clean-content-blocks.mjs            # dry run
 *   node --env-file=.env.local scripts/clean-content-blocks.mjs --apply    # write changes
 */
const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPLY = process.argv.includes("--apply");

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not set. Use --env-file=.env.local");
  process.exit(1);
}

async function fetchAllTextBlocks() {
  const results = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/learning_track_content_blocks`);
    url.searchParams.set("select", "id,body");
    url.searchParams.set("block_type", "eq.text");
    url.searchParams.set("body", "not.is.null");
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Range: `${from}-${from + pageSize - 1}`,
        "Range-Unit": "items",
        Prefer: "count=exact",
      },
    });
    if (!res.ok) throw new Error(await res.text());
    const chunk = await res.json();
    results.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return results;
}

async function updateBody(id, body) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/learning_track_content_blocks?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) throw new Error(await res.text());
}

const TRANSIENT_IMAGE_HOSTS = [
  "https://lh7-rt.googleusercontent.com/slidesz/",
  "https://lh3.googleusercontent.com/slidesz/",
  "https://lh4.googleusercontent.com/slidesz/",
  "https://lh5.googleusercontent.com/slidesz/",
  "https://lh6.googleusercontent.com/slidesz/",
];

function isTransientImage(url) {
  return TRANSIENT_IMAGE_HOSTS.some((host) => url.startsWith(host));
}

function cleanBody(raw) {
  if (!raw) return raw;
  let out = raw;

  // 1. Collapse newlines inside image alt text AND trim URL whitespace.
  out = out.replace(/!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g, (_m, alt, url) => {
    const cleanAlt = String(alt).replace(/\s+/g, " ").trim();
    const cleanUrl = String(url).trim();
    if (isTransientImage(cleanUrl)) {
      // Drop the broken image, keep the alt text as an italic caption so the
      // surrounding paragraph isn't left dangling.
      return cleanAlt ? `*${cleanAlt}*` : "";
    }
    return `![${cleanAlt}](${cleanUrl})`;
  });

  // 2. Collapse newlines inside link labels and trim URLs (not preceded by !).
  out = out.replace(
    /(^|[^!])\[([^\]]*?)\]\(\s*([^)]+?)\s*\)/g,
    (_m, lead, text, url) =>
      `${lead}[${String(text).replace(/\s+/g, " ").trim()}](${String(url).trim()})`,
  );

  // 3. Collapse 3+ consecutive blank lines to 2.
  out = out.replace(/\n{3,}/g, "\n\n");

  return out;
}

async function main() {
  const blocks = await fetchAllTextBlocks();
  console.log(`Scanning ${blocks.length} text blocks…`);

  let changed = 0;
  let droppedImages = 0;
  let collapsedAlts = 0;

  for (const b of blocks) {
    const before = b.body ?? "";
    const after = cleanBody(before);
    if (before === after) continue;
    changed += 1;
    droppedImages +=
      (before.match(/!\[[^\]]*\]\([^)]*googleusercontent\.com\/slidesz\/[^)]*\)/g) ?? []).length;
    collapsedAlts +=
      (before.match(/!\[[^\]]*\n[^\]]*\]\([^)]*\)/g) ?? []).length;
    if (APPLY) {
      await updateBody(b.id, after);
      process.stdout.write(".");
    }
  }

  console.log();
  console.log(`Blocks with changes: ${changed}/${blocks.length}`);
  console.log(`  transient slide images dropped: ${droppedImages}`);
  console.log(`  multi-line alt texts collapsed: ${collapsedAlts}`);
  if (!APPLY) {
    console.log("\nDry run — no changes written. Re-run with --apply to persist.");
  } else {
    console.log("\n✓ Writes applied.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
