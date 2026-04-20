#!/usr/bin/env node
/**
 * CLI export: drops the Explorer "FINternship Orientation" content straight
 * into the Obsidian vault. Run with the service role key loaded:
 *
 *   node --env-file=.env.local scripts/export-explorer-cli.mjs
 *
 * The destination folder is truncated before writing so repeat runs stay clean.
 */
import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAULT_ROOT = join(homedir(), "Documents", "Obsidian Vault", "Content");
const OUT_DIR = join(VAULT_ROOT, "finternship-orientation");

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not set. Use --env-file=.env.local");
  process.exit(1);
}

const PHASE_TITLE = "FINternship Orientation";

async function sbSelect(path, params) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`${path} ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const slug = (s) =>
  String(s ?? "untitled")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "untitled";

const isModule = (i) =>
  Array.isArray(i.hidden_resources) && i.hidden_resources.includes("module");

function repairMarkdown(body) {
  if (!body) return "";
  return body.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `![${String(alt).replace(/\s+/g, " ").trim()}](${String(url).trim()})`,
  );
}

function renderLesson(item, blocks) {
  const lines = [];
  lines.push("---");
  lines.push(`title: "${String(item.title ?? "").replace(/"/g, '\\"')}"`);
  lines.push(`order: ${item.order_index}`);
  if (item.published_at) lines.push(`published_at: "${item.published_at}"`);
  lines.push("---");
  lines.push("");
  lines.push(`# ${item.title ?? "Untitled"}`);
  lines.push("");
  if (item.description && String(item.description).trim()) {
    lines.push(String(item.description).trim());
    lines.push("");
  }
  if (Array.isArray(item.objectives) && item.objectives.length > 0) {
    lines.push("## Objectives");
    for (const o of item.objectives) lines.push(`- ${o}`);
    lines.push("");
  }
  if (Array.isArray(item.action_items) && item.action_items.length > 0) {
    lines.push("## Action items");
    item.action_items.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push("");
  }
  const sorted = blocks.slice().sort((a, b) => a.order_index - b.order_index);
  for (const b of sorted) {
    if (b.title) {
      lines.push(`## ${b.title}`);
      lines.push("");
    }
    if (b.block_type === "text" && b.body) {
      lines.push(repairMarkdown(b.body).trim());
      lines.push("");
    } else if (b.block_type === "image" && b.url) {
      lines.push(`![${b.title ?? "image"}](${b.url})`);
      lines.push("");
    } else if (b.block_type === "video" && b.url) {
      lines.push(`🎥 [${b.title ?? "Watch video"}](${b.url})`);
      lines.push("");
    } else if (b.block_type === "link" && b.url) {
      lines.push(`[${b.title ?? b.url}](${b.url})`);
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

async function main() {
  if (!existsSync(VAULT_ROOT)) {
    console.error(`Obsidian vault root not found: ${VAULT_ROOT}`);
    process.exit(1);
  }
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Phase
  const phases = await sbSelect("learning_track_phases", {
    select: "id,title,description",
    track: "eq.explorer",
    title: `ilike.${PHASE_TITLE}`,
  });
  if (!phases.length) throw new Error(`Phase not found: ${PHASE_TITLE}`);
  const phase = phases[0];
  console.log("Phase:", phase.title, phase.id);

  // 2. Items
  const items = await sbSelect("learning_track_items", {
    select:
      "id,title,description,order_index,objectives,action_items,hidden_resources,published_at",
    phase_id: `eq.${phase.id}`,
    order: "order_index.asc",
  });
  console.log("Items:", items.length);

  // 3. Blocks
  const ids = items.map((i) => i.id);
  const blocks = ids.length
    ? await sbSelect("learning_track_content_blocks", {
        select: "item_id,order_index,block_type,title,body,url",
        item_id: `in.(${ids.join(",")})`,
        order: "order_index.asc",
      })
    : [];
  const blocksByItem = new Map();
  for (const b of blocks) {
    if (!blocksByItem.has(b.item_id)) blocksByItem.set(b.item_id, []);
    blocksByItem.get(b.item_id).push(b);
  }

  // 4. Write phase README
  writeFileSync(
    join(OUT_DIR, "README.md"),
    [
      "---",
      `title: "${String(phase.title).replace(/"/g, '\\"')}"`,
      "track: explorer",
      `exported: "${new Date().toISOString()}"`,
      "---",
      "",
      `# ${phase.title}`,
      "",
      phase.description ?? "",
      "",
    ].join("\n"),
  );

  // 5. Walk items — module items become folders, lessons become .md files
  let currentFolder = OUT_DIR;
  let moduleIdx = 0;
  let lessonIdxInModule = 0;
  for (const item of items) {
    if (isModule(item)) {
      moduleIdx += 1;
      lessonIdxInModule = 0;
      const folderName = `${String(moduleIdx).padStart(2, "0")}-${slug(item.title)}`;
      currentFolder = join(OUT_DIR, folderName);
      mkdirSync(currentFolder, { recursive: true });
      writeFileSync(
        join(currentFolder, "README.md"),
        [
          "---",
          `title: "${String(item.title ?? "").replace(/"/g, '\\"')}"`,
          "type: module",
          `order: ${item.order_index}`,
          "---",
          "",
          `# ${item.title ?? "Module"}`,
          "",
          item.description ?? "",
          "",
        ].join("\n"),
      );
      continue;
    }
    lessonIdxInModule += 1;
    const fileName = `${String(lessonIdxInModule).padStart(2, "0")}-${slug(item.title)}.md`;
    const myBlocks = blocksByItem.get(item.id) ?? [];
    writeFileSync(join(currentFolder, fileName), renderLesson(item, myBlocks));
  }

  console.log(
    `\n✓ Exported ${items.length - moduleIdx} lessons across ${moduleIdx} modules to:\n  ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
