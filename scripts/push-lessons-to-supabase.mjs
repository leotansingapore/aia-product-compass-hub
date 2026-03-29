/**
 * Push Sales Mastery course lessons (all modules) to Supabase as training_videos.
 *
 * Usage: node scripts/push-lessons-to-supabase.mjs
 *
 * Extracts lesson data from salesMasteryCourseData.ts via npx tsx,
 * converts each lesson to a training_video entry with rich markdown lecture notes,
 * authenticates as admin, fetches existing training_videos, appends new entries,
 * and PATCHes the product.
 */

import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";
const PRODUCT_ID = "platinum-wealth-venture";
const REST = `${SUPABASE_URL}/rest/v1/products?id=eq.${PRODUCT_ID}`;
const DATA_PATH = resolve(
  __dirname,
  "../src/data/salesMasteryCourseData.ts"
);

// ── Step 0: Authenticate as admin ───────────────────────────────────────────
console.log("Authenticating as admin ...");

const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "master_admin@demo.com",
    password: "demo123456",
  }),
});

if (!authRes.ok) {
  throw new Error(`Auth failed: ${authRes.status} ${await authRes.text()}`);
}

const { access_token } = await authRes.json();
console.log("  Authenticated successfully.");

// ── Step 1: Extract lessons from TS via npx tsx ─────────────────────────────
console.log("Extracting lessons from salesMasteryCourseData.ts ...");

const extractScript = `
import { salesMasteryCourse } from "${DATA_PATH.replace(/\\\\/g, "/")}";

const lessons = [];
for (const mod of salesMasteryCourse) {
  for (const lesson of mod.lessons) {
    lessons.push({
      lessonId: lesson.id,
      title: lesson.title,
      description: lesson.description,
      narration: lesson.narration,
      durationMin: lesson.durationMin,
      moduleNumber: mod.number,
      moduleTitle: mod.title,
      slides: lesson.slides,
      keyTakeaways: lesson.keyTakeaways,
      realExamples: lesson.realExamples || [],
    });
  }
}

process.stdout.write(JSON.stringify(lessons));
`;

const tmpFile = join(tmpdir(), `extract-sm-${Date.now()}.ts`);
writeFileSync(tmpFile, extractScript);

let lessons;
try {
  const raw = execFileSync("npx", ["tsx", tmpFile], {
    cwd: resolve(__dirname, ".."),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 30_000,
  });
  lessons = JSON.parse(raw);
} finally {
  try { unlinkSync(tmpFile); } catch {}
}

console.log(`  Found ${lessons.length} lessons across all modules.`);

// ── Step 2: Build rich_content markdown for each lesson ─────────────────────

function buildRichContent(lesson) {
  const parts = ["# Lecture Notes\n"];

  for (const slide of lesson.slides) {
    parts.push("---\n");
    parts.push(`## ${slide.heading}\n`);

    if (slide.bullets && slide.bullets.length > 0) {
      for (const b of slide.bullets) {
        parts.push(`- ${b}`);
      }
      parts.push("");
    }

    if (slide.script) {
      parts.push("### Script");
      parts.push(`> ${slide.script}\n`);
    }

    if (slide.table) {
      const { headers, rows } = slide.table;
      parts.push("### Table");
      parts.push(`| ${headers.join(" | ")} |`);
      parts.push(`| ${headers.map(() => "--------").join(" | ")} |`);
      for (const row of rows) {
        parts.push(`| ${row.join(" | ")} |`);
      }
      parts.push("");
    }
  }

  // Key Takeaways
  if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
    parts.push("---\n");
    parts.push("## Key Takeaways\n");
    for (const t of lesson.keyTakeaways) {
      parts.push(`- ${t}`);
    }
    parts.push("");
  }

  // Real Meeting Examples
  if (lesson.realExamples && lesson.realExamples.length > 0) {
    parts.push("## Real Meeting Examples\n");
    for (const e of lesson.realExamples) {
      parts.push(`- ${e}`);
    }
    parts.push("");
  }

  return parts.join("\n");
}

// ── Step 3: Convert lessons to training_video entries ───────────────────────

const ts = Date.now();
const newVideos = lessons.map((lesson, i) => ({
  id: `sm-m${lesson.moduleNumber}-${lesson.lessonId}-${ts}`,
  title: lesson.title,
  category: lesson.moduleTitle,
  order: 6 + i, // existing videos are orders 0-5
  url: "",
  description: lesson.description,
  rich_content: buildRichContent(lesson),
  transcript: lesson.narration,
}));

console.log(`  Built ${newVideos.length} training_video entries.`);

// ── Step 4: Fetch existing training_videos ──────────────────────────────────
console.log("Fetching existing training_videos from Supabase ...");

const authHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${access_token}`,
  "Content-Type": "application/json",
};

const getRes = await fetch(`${REST}&select=training_videos`, {
  headers: authHeaders,
});
if (!getRes.ok) {
  throw new Error(`GET failed: ${getRes.status} ${await getRes.text()}`);
}
const [product] = await getRes.json();
const existing = product.training_videos || [];
console.log(`  Existing count: ${existing.length}`);

// ── Step 5: Append and PATCH ────────────────────────────────────────────────
const merged = [...existing, ...newVideos];
console.log(`  Merged count: ${merged.length} (${existing.length} existing + ${newVideos.length} new)`);

console.log("PATCHing product ...");
const patchRes = await fetch(REST, {
  method: "PATCH",
  headers: {
    ...authHeaders,
    Prefer: "return=representation",
  },
  body: JSON.stringify({ training_videos: merged }),
});

if (!patchRes.ok) {
  const errText = await patchRes.text();
  throw new Error(`PATCH failed: ${patchRes.status} ${errText}`);
}

const patchBody = await patchRes.json();
const updated = Array.isArray(patchBody) ? patchBody[0] : patchBody;
const finalCount = updated?.training_videos?.length ?? "unknown";
console.log(`  PATCH successful. Final training_videos count: ${finalCount}`);

// ── Step 6: Verify ──────────────────────────────────────────────────────────
console.log("\nVerification:");
const verifyRes = await fetch(`${REST}&select=training_videos`, {
  headers: authHeaders,
});
const [verified] = await verifyRes.json();
const vids = verified.training_videos || [];
console.log(`  Total training_videos in Supabase: ${vids.length}`);
console.log(`  Last 5 entries:`);
for (const v of vids.slice(-5)) {
  console.log(`    [${v.order}] ${v.id}: ${v.title} (${v.category})`);
}
console.log("\nDone.");
