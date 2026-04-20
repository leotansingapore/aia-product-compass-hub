/**
 * Export the Explorer "FINternship Orientation" content from Supabase into a
 * folder structure suitable for dropping into an Obsidian vault.
 *
 * The RLS on learning_track_* tables blocks the anon key, so this runs in the
 * BROWSER CONSOLE using the admin's existing session. Output is a downloadable
 * ZIP containing one folder per module and one markdown file per lesson.
 *
 * HOW TO USE
 * ──────────────────────────────────────────────────────────────────────────
 * 1. Sign in to the app as a master_admin in the browser.
 * 2. Open DevTools → Console (⌥⌘I).
 * 3. Paste everything below the "BROWSER CONSOLE SNIPPET" divider and press Enter.
 * 4. Save the downloaded `finternship-orientation.zip`.
 * 5. Unzip into your Obsidian vault under `Content/finternship-orientation/`.
 *
 * ──────────────────────────────────────────────────
 * BROWSER CONSOLE SNIPPET (copy everything below):
 * ──────────────────────────────────────────────────

(async () => {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;

  const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";

  const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pull the current session from the app so RLS sees an admin identity.
  const authKey = Object.keys(localStorage).find((k) => k.includes("auth-token"));
  if (!authKey) { console.error("Not signed in. Sign in as admin first."); return; }
  const session = JSON.parse(localStorage.getItem(authKey));
  await sb.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  const PHASE_TITLE = "FINternship Orientation";

  // 1. Find the phase
  const { data: phases, error: phaseErr } = await sb
    .from("learning_track_phases")
    .select("id, title, description")
    .eq("track", "explorer")
    .ilike("title", PHASE_TITLE);
  if (phaseErr) { console.error(phaseErr); return; }
  if (!phases?.length) { console.error("Phase not found:", PHASE_TITLE); return; }
  const phase = phases[0];
  console.log("Phase:", phase.title, phase.id);

  // 2. Items in phase order
  const { data: items, error: itemErr } = await sb
    .from("learning_track_items")
    .select(
      "id, title, description, order_index, objectives, action_items, hidden_resources, published_at",
    )
    .eq("phase_id", phase.id)
    .order("order_index", { ascending: true });
  if (itemErr) { console.error(itemErr); return; }
  console.log("Items:", items.length);

  // 3. Content blocks for all items
  const ids = items.map((i) => i.id);
  const { data: blocks, error: blockErr } = await sb
    .from("learning_track_content_blocks")
    .select("item_id, order_index, block_type, title, body, url")
    .in("item_id", ids)
    .order("order_index", { ascending: true });
  if (blockErr) { console.error(blockErr); return; }
  const blocksByItem = new Map();
  for (const b of blocks) {
    if (!blocksByItem.has(b.item_id)) blocksByItem.set(b.item_id, []);
    blocksByItem.get(b.item_id).push(b);
  }

  // 4. Build folder structure — module folders group the lessons that follow
  //    until the next module folder. Items with hidden_resources containing
  //    "module" are folder markers. Standalone items (not inside a module) go
  //    at the root.
  const isModule = (i) =>
    Array.isArray(i.hidden_resources) && i.hidden_resources.includes("module");

  const slug = (s) =>
    String(s ?? "untitled")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "untitled";

  const zip = new JSZip();
  const root = zip.folder("finternship-orientation");

  // Phase-level README
  root.file(
    "README.md",
    [
      "---",
      `title: "${phase.title.replace(/"/g, '\\"')}"`,
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

  // Render a lesson markdown file from an item + its content blocks
  const renderLesson = (item, lessonNum) => {
    const lines = [];
    lines.push("---");
    lines.push(`title: "${String(item.title ?? "").replace(/"/g, '\\"')}"`);
    lines.push(`order: ${item.order_index}`);
    if (item.published_at) lines.push(`published_at: "${item.published_at}"`);
    lines.push("---");
    lines.push("");
    lines.push(`# ${item.title ?? "Untitled"}`);
    lines.push("");
    if (item.description) {
      lines.push(item.description.trim());
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
    const myBlocks = (blocksByItem.get(item.id) ?? []).slice().sort(
      (a, b) => a.order_index - b.order_index,
    );
    for (const b of myBlocks) {
      if (b.title) {
        lines.push(`## ${b.title}`);
        lines.push("");
      }
      if (b.block_type === "text" && b.body) {
        // Repair common Google-Docs paste artefacts: newlines inside image alt.
        const cleaned = b.body.replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          (_, alt, url) => `![${alt.replace(/\s+/g, " ").trim()}](${url.trim()})`,
        );
        lines.push(cleaned.trim());
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
  };

  // Walk the item list — track the current module folder as we go.
  let currentModule = null;
  let currentFolder = root;
  let moduleIdx = 0;
  let lessonIdxInModule = 0;

  for (const item of items) {
    if (isModule(item)) {
      moduleIdx += 1;
      lessonIdxInModule = 0;
      const folderName = `${String(moduleIdx).padStart(2, "0")}-${slug(item.title)}`;
      currentModule = item;
      currentFolder = root.folder(folderName);
      // module overview file
      currentFolder.file(
        "README.md",
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
    currentFolder.file(fileName, renderLesson(item, lessonIdxInModule));
  }

  // 5. Download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finternship-orientation.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  console.log(`Exported ${items.length} items across ${moduleIdx} modules.`);
})();

 */
