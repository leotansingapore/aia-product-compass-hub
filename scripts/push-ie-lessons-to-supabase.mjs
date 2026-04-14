/**
 * Push Invest Easy lessons to Supabase as training_videos.
 *
 * Usage: node scripts/push-ie-lessons-to-supabase.mjs
 *
 * Reads lesson JSON + narration files from my-video/.tmp/ie-props/,
 * converts each to a training_video entry with rich markdown lecture notes,
 * authenticates as admin, fetches existing training_videos, appends new entries,
 * and PATCHes the product.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// -- Config --
const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";
const PRODUCT_ID = "invest-easy";
const REST = `${SUPABASE_URL}/rest/v1/products?id=eq.${PRODUCT_ID}`;
const PROPS_DIR = resolve(__dirname, "../../my-video/.tmp/ie-props");

// -- Lesson definitions (order matters) --
const LESSON_IDS = [
  "ie-m1-l1", "ie-m1-l2", "ie-m1-l3", "ie-m1-l4", "ie-m1-l5", "ie-m1-l6",
  "ie-m2-l1", "ie-m2-l2", "ie-m2-l3", "ie-m2-l4",
];

// -- Step 0: Auth setup --
// Try admin auth first, fall back to anon key for RLS-open tables
let access_token = null;

try {
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

  if (authRes.ok) {
    const authData = await authRes.json();
    access_token = authData.access_token;
    console.log("  Authenticated as admin.");
  } else {
    console.log("  Admin auth failed, using anon key (RLS must allow updates).");
  }
} catch {
  console.log("  Auth error, using anon key.");
}

// -- Step 1: Read lesson files --
console.log("Reading lesson files ...");

const lessons = [];
for (const id of LESSON_IDS) {
  const propsPath = resolve(PROPS_DIR, `${id}.json`);
  const narrationPath = resolve(PROPS_DIR, `${id}.narration.txt`);

  const props = JSON.parse(readFileSync(propsPath, "utf8"));
  const narration = readFileSync(narrationPath, "utf8");

  lessons.push({ id, props, narration });
}

console.log(`  Loaded ${lessons.length} lessons.`);

// -- Step 2: Build rich_content markdown --

function buildRichContent(lesson) {
  const { props, narration } = lesson;
  const parts = ["# Lecture Notes\n"];

  for (const slide of props.slides) {
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

  return parts.join("\n");
}

// -- Step 3: Convert to training_video entries --

const ts = Date.now();
const newVideos = lessons.map((lesson, i) => ({
  id: `${lesson.id}-${ts}`,
  title: lesson.props.lessonTitle,
  category: lesson.props.moduleTitle,
  order: i,
  url: "",
  description: `Module ${lesson.props.moduleNumber}, Lesson ${i + 1}`,
  rich_content: buildRichContent(lesson),
  transcript: lesson.narration,
  published: true,
  type: "video",
}));

console.log(`  Built ${newVideos.length} training_video entries.`);

// -- Step 4: Fetch existing training_videos --
console.log("Fetching existing training_videos from Supabase ...");

const authHeaders = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
  ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
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

// -- Step 5: Replace (not append) -- fresh ESI content --
// Remove any previous ESI entries (ids starting with "ie-")
const filtered = existing.filter((v) => !v.id.startsWith("ie-"));
const merged = [...filtered, ...newVideos];
console.log(`  Final count: ${merged.length} (${filtered.length} kept + ${newVideos.length} new)`);

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

// -- Step 6: Verify --
console.log("\nVerification:");
const verifyRes = await fetch(`${REST}&select=training_videos`, {
  headers: authHeaders,
});
const [verified] = await verifyRes.json();
const vids = verified.training_videos || [];
console.log(`  Total training_videos in Supabase: ${vids.length}`);
console.log(`  ESI entries:`);
for (const v of vids.filter((v) => v.id.startsWith("ie-"))) {
  console.log(`    [${v.order}] ${v.title} (${v.category})`);
}
console.log("\nDone.");
