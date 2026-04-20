/**
 * Migrate "Financial Planning Basics" learning track phase to a product
 * under the Supplementary Training category.
 *
 * RLS blocks the anon key from reading learning_track tables.
 * Run this in the BROWSER CONSOLE while logged in as admin:
 *
 *   1. Log in to the app as admin
 *   2. Open browser console (F12 → Console)
 *   3. Paste the snippet below and press Enter
 *
 * ──────────────────────────────────────────────────
 * BROWSER CONSOLE SNIPPET (copy everything below):
 * ──────────────────────────────────────────────────

(async () => {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const url = "https://hgdbflprrficdoyxmdxe.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Grab the existing session token from the app's supabase client
  const storageKey = Object.keys(localStorage).find(k => k.includes("auth-token"));
  if (!storageKey) { console.error("Not logged in — sign in as admin first"); return; }
  const session = JSON.parse(localStorage.getItem(storageKey));
  await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });

  const SUPP_CAT = "5ef0b17f-a19f-4859-8349-3e4959620e94";
  const TITLE = "Financial Planning Basics";

  // 1. Find the phase
  const { data: phases } = await sb.from("learning_track_phases")
    .select("id, title, description")
    .eq("track", "explorer")
    .ilike("title", TITLE);
  if (!phases?.length) { console.error("Phase not found"); return; }
  const phase = phases[0];
  console.log("Phase:", phase.title, phase.id);

  // 2. Get items
  const { data: items } = await sb.from("learning_track_items")
    .select("id, title, description, order_index, hidden_resources, published_at")
    .eq("phase_id", phase.id)
    .order("order_index");
  console.log("Items:", items.length);

  // 3. Get content blocks
  const ids = items.map(i => i.id);
  const { data: blocks } = await sb.from("learning_track_content_blocks")
    .select("item_id, body")
    .in("item_id", ids)
    .eq("block_type", "text");
  const bodyMap = new Map(blocks.map(b => [b.item_id, b.body ?? ""]));

  // 4. Build training_videos
  const isModule = (i) => Array.isArray(i.hidden_resources) && i.hidden_resources.includes("module");
  const videos = [];
  let cat = "General";
  let ord = 0;
  for (const it of items) {
    if (isModule(it)) { cat = it.title; continue; }
    videos.push({
      id: it.id, title: it.title, url: "", description: it.description || "",
      duration: 0, order: ord++, published: !!it.published_at,
      category: cat, rich_content: bodyMap.get(it.id) || "", type: "video",
    });
  }
  console.log("Videos:", videos.length, "sections:", new Set(videos.map(v => v.category)).size);

  // 5. Upsert product
  const { data: existing } = await sb.from("products")
    .select("id").eq("category_id", SUPP_CAT).ilike("title", TITLE);
  if (existing?.length) {
    const { error } = await sb.from("products")
      .update({ training_videos: videos })
      .eq("id", existing[0].id);
    if (error) console.error("Update failed:", error);
    else console.log("Updated product", existing[0].id);
  } else {
    const { data, error } = await sb.from("products").insert({
      title: TITLE,
      description: phase.description || "Financial planning fundamentals — supplementary reference.",
      category_id: SUPP_CAT, published: true,
      training_videos: videos, tags: ["financial-planning", "supplementary"], sort_order: 0,
    }).select("id");
    if (error) console.error("Insert failed:", error);
    else console.log("Created product:", data?.[0]?.id);
  }
  console.log("Done!");
})();

 */
