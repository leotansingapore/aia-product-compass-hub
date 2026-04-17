/**
 * Push Hospital Income lessons to Supabase as training_videos.
 *
 * Usage: node scripts/push-hi-lessons-to-supabase.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// -- Config --
const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";
const PRODUCT_ID = "hospital-income";
const REST = `${SUPABASE_URL}/rest/v1/products?id=eq.${PRODUCT_ID}`;
const PROPS_DIR = resolve(__dirname, "../../my-video/.tmp/hi-props");
const GH_RELEASE_BASE =
  "https://github.com/leotansingapore/aia-product-compass-hub/releases/download/hi-videos";

// -- Lesson definitions (order matters) --
const LESSON_IDS = [
  "hi-m1-l1", "hi-m1-l2", "hi-m1-l3", "hi-m1-l4", "hi-m1-l5", "hi-m1-l6",
  "hi-m2-l1", "hi-m2-l2", "hi-m2-l3", "hi-m2-l4",
];

// -- Step 0: Auth setup --
let access_token = null;

async function ensureDemoAccount() {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/ensure-demo-account`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {}
}

async function authenticate() {
  console.log("Authenticating as admin ...");
  let authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "master_admin@demo.com", password: "demo123456" }),
  });
  if (!authRes.ok) {
    console.log("  First auth failed; calling ensure-demo-account and retrying ...");
    await ensureDemoAccount();
    authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: "master_admin@demo.com", password: "demo123456" }),
    });
  }
  if (authRes.ok) {
    const d = await authRes.json();
    access_token = d.access_token;
    console.log("  Authenticated as admin.");
  } else {
    console.log("  Admin auth failed; falling back to anon key.");
  }
}

await authenticate();

// -- Step 1: Read lesson files --
console.log("Reading lesson files ...");
const lessons = [];
for (const id of LESSON_IDS) {
  const props = JSON.parse(readFileSync(resolve(PROPS_DIR, `${id}.json`), "utf8"));
  const narration = readFileSync(resolve(PROPS_DIR, `${id}.narration.txt`), "utf8");
  lessons.push({ id, props, narration });
}
console.log(`  Loaded ${lessons.length} lessons.`);

// -- Step 2: Build rich_content markdown --
function buildRichContent(lesson) {
  const { props } = lesson;
  const parts = ["# Lecture Notes\n"];
  for (const slide of props.slides) {
    parts.push("---\n");
    parts.push(`## ${slide.heading}\n`);
    if (slide.bullets && slide.bullets.length > 0) {
      for (const b of slide.bullets) parts.push(`- ${b}`);
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
      for (const row of rows) parts.push(`| ${row.join(" | ")} |`);
      parts.push("");
    }
  }
  return parts.join("\n");
}

// -- Step 3: Build training_video entries --
const ts = Date.now();
const newVideos = lessons.map((lesson, i) => ({
  id: `${lesson.id}-${ts}`,
  title: lesson.props.lessonTitle,
  category: lesson.props.moduleTitle,
  order: i,
  url: `${GH_RELEASE_BASE}/${lesson.id}.mp4`,
  description: `Module ${lesson.props.moduleNumber}, Lesson ${i + 1}`,
  rich_content: buildRichContent(lesson),
  transcript: lesson.narration,
  published: true,
  type: "video",
}));
console.log(`  Built ${newVideos.length} training_video entries.`);

// -- Step 4: Fetch existing --
console.log("Fetching existing training_videos ...");
const authHeaders = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
  ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
};
const getRes = await fetch(`${REST}&select=training_videos`, { headers: authHeaders });
if (!getRes.ok) throw new Error(`GET failed: ${getRes.status} ${await getRes.text()}`);
const [product] = await getRes.json();
const existing = product.training_videos || [];
console.log(`  Existing count: ${existing.length}`);

// Remove any previous hi- entries before merging
const filtered = existing.filter((v) => !v.id.startsWith("hi-"));
const merged = [...filtered, ...newVideos];
console.log(`  Final count: ${merged.length} (${filtered.length} kept + ${newVideos.length} new)`);

console.log("PATCHing product ...");
const patchRes = await fetch(REST, {
  method: "PATCH",
  headers: { ...authHeaders, Prefer: "return=representation" },
  body: JSON.stringify({ training_videos: merged }),
});
if (!patchRes.ok) throw new Error(`PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
const patchBody = await patchRes.json();
const updated = Array.isArray(patchBody) ? patchBody[0] : patchBody;
console.log(`  PATCH successful. Final count: ${updated?.training_videos?.length ?? "?"}`);

// -- Step 6: Verify --
console.log("\nVerification:");
const verifyRes = await fetch(`${REST}&select=training_videos`, { headers: authHeaders });
const [verified] = await verifyRes.json();
const vids = verified.training_videos || [];
console.log(`  Total training_videos: ${vids.length}`);
console.log(`  HI entries:`);
for (const v of vids.filter((v) => v.id.startsWith("hi-"))) {
  console.log(`    [${v.order}] ${v.title} (${v.category}) -> ${v.url}`);
}
console.log("\nDone.");
