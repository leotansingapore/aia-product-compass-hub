/**
 * Seeds curated `resource_ref` content blocks for each learning track item.
 * This replaces the noisy auto-suggested resources with hand-picked links.
 *
 * Run:
 *   SUPABASE_URL=https://hgdbflprrficdoyxmdxe.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node_modules/.bin/tsx scripts/seed-related-resources.ts
 *
 * Idempotent: deletes existing resource_ref blocks per item, then re-inserts.
 */
/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface ResourceLink {
  title: string;
  url: string;
}

// product slug → app route helper
const product = (slug: string, displayTitle: string): ResourceLink => ({
  title: displayTitle,
  url: `/product/${slug}`,
});

// obsidian doc UUID → resource hub deep link
const obsidian = (uuid: string, displayTitle: string): ResourceLink => ({
  title: `📄 ${displayTitle}`,
  url: `/learning-track/resources?doc=${uuid}`,
});

// external URL → opens in new tab
const ext = (title: string, url: string): ResourceLink => ({
  title: `🔗 ${title}`,
  url,
});

// Stable Obsidian doc UUIDs (from current sync)
const SALES_BIBLE = "c4973b95-35a7-43bd-9e90-1873c607b470";
const SALES_PLAYBOOK = "021d8c9f-f93e-4d7b-9066-60c6ec8a913f";
const PRODUCTS_MOC = "1a64596c-b4be-4229-9e2e-d19caa609cd4";
const FINTERNSHIP_MOC = "11f67747-197e-4dea-a72c-2e28f9a1f504";
const WIN_FINANCIAL_MOC = "94bb8515-6e33-4489-8d2c-2b13228089a8";

// External institutional URLs
const MAS_INSURANCE = ext("MAS Insurance Regulation", "https://www.mas.gov.sg/regulation/insurance");
const MAS_FA = ext("MAS Financial Advisers Act", "https://www.mas.gov.sg/regulation/acts/financial-advisers-act");
const IBF_PORTAL = ext("Institute of Banking & Finance", "https://www.ibf.org.sg/");
const SCI_CMFAS = ext("SCI CMFAS Portal", "https://www.scisingapore.com/");
const MDRT_HOME = ext("MDRT", "https://www.mdrt.org/");
const MDRT_MAGAZINE = ext("MDRT Round the Table Magazine", "https://www.mdrt.org/round-the-table-magazine");
const AIA_CAREERS = ext("AIA Singapore Careers", "https://www.aia.com.sg/en/about-aia/careers.html");

const MAPPING: Record<string, ResourceLink[]> = {
  // ── PRE-RNF ──────────────────────────────────────────────────────────
  "p1-1": [
    product("training-meetings", "Training Meetings"),
    product("soft-skills-10", "Soft Skills 1.0"),
    obsidian(WIN_FINANCIAL_MOC, "Win Financial Group — Advisor OS"),
  ],
  "p1-6": [
    product("cmfas-exams-page", "CMFAS Exams Overview"),
    product("m9-module", "CMFAS M9 Module"),
    product("m9a-module", "CMFAS M9A Module"),
    product("hi-module", "CMFAS HI Module"),
    product("res5-module", "CMFAS RES5 Module"),
    SCI_CMFAS,
  ],
  "p1-7": [
    product("soft-skills-10", "Soft Skills 1.0"),
    product("training-meetings", "Training Meetings"),
    obsidian(FINTERNSHIP_MOC, "FINternship Programme"),
  ],
  "p1-8": [
    product("soft-skills-20", "Soft Skills 2.0"),
    product("training-meetings", "Training Meetings"),
    obsidian(WIN_FINANCIAL_MOC, "Win Financial Group"),
    AIA_CAREERS,
  ],

  "p2-2": [
    product("financial-presenter-walkthrough", "Financial Presenter Walkthrough"),
    product("concept-drawings", "Concept Drawings"),
    product("basic-cpf-knowledge", "Basic CPF Knowledge"),
    obsidian(SALES_BIBLE, "Pre-Retiree Sales Bible"),
  ],
  "p2-5": [
    product("pro-achiever", "Pro Achiever (APA)"),
    product("financial-presenter-walkthrough", "Financial Presenter Walkthrough"),
    obsidian(SALES_PLAYBOOK, "Pre-Retiree Sales Playbook"),
  ],

  "p3-1": [
    product("warm-market-flow", "Warm Market Flow"),
    product("appointment-setting", "Appointment Setting"),
    obsidian(SALES_PLAYBOOK, "Pre-Retiree Sales Playbook"),
    MDRT_HOME,
  ],
  "p3-2": [
    product("appointment-setting", "Appointment Setting"),
    product("sales-tools-objections", "Sales Tools & Objection Handling"),
  ],

  "p4-1": [
    product("appointment-setting", "Appointment Setting"),
    product("debrief-flow", "Debrief Flow"),
    product("general-flow", "General Flow"),
    obsidian(SALES_BIBLE, "Pre-Retiree Sales Bible"),
  ],
  "p4-2": [
    product("pro-lifetime-protector", "Pro Lifetime Protector"),
    product("healthshield-gold-max", "Healthshield Gold Max"),
    product("ultimate-critical-cover", "Ultimate Critical Cover"),
  ],

  "p5-2": [
    product("pro-achiever", "Pro Achiever"),
    product("platinum-wealth-venture", "Platinum Wealth Venture"),
    product("healthshield-gold-max", "Healthshield Gold Max"),
    product("pro-lifetime-protector", "Pro Lifetime Protector"),
    obsidian(PRODUCTS_MOC, "Products MOC (NotebookLM index)"),
  ],
  "p5-3": [
    MDRT_HOME,
    ext("MDRT Recommended Reading", "https://www.mdrt.org/resources/"),
  ],
  "p6-4": [MDRT_MAGAZINE],

  // ── POST-RNF ─────────────────────────────────────────────────────────
  "asgn-20": [
    product("goalsmapper-training", "GoalsMapper Training"),
    product("financial-presenter-walkthrough", "Financial Presenter Walkthrough"),
    product("finternship-online", "FINTERNSHIP Online"),
    obsidian(FINTERNSHIP_MOC, "FINternship Programme"),
  ],
  "asgn-21": [
    product("cmfas-exams-page", "CMFAS Exams Overview"),
    MAS_INSURANCE,
    MAS_FA,
    IBF_PORTAL,
  ],
  "tc-7": [
    product("training-meetings", "Training Meetings"),
    product("soft-skills-10", "Soft Skills 1.0"),
    obsidian(FINTERNSHIP_MOC, "FINternship Programme"),
  ],

  "asgn-23": [
    product("appointment-setting", "Appointment Setting"),
    product("soft-skills-10", "Soft Skills 1.0"),
    obsidian(WIN_FINANCIAL_MOC, "Win Financial Group"),
  ],
  "asgn-4": [
    product("training-meetings", "Training Meetings"),
    product("soft-skills-20", "Soft Skills 2.0"),
    obsidian(WIN_FINANCIAL_MOC, "Win Financial Group"),
  ],
  "asgn-5": [
    product("appointment-setting", "Appointment Setting"),
    product("warm-market-flow", "Warm Market Flow"),
  ],
  "asgn-6": [obsidian(FINTERNSHIP_MOC, "FINternship Programme")],

  "asgn-11": [
    product("pro-lifetime-protector", "Pro Lifetime Protector"),
    product("healthshield-gold-max", "Healthshield Gold Max"),
    product("secure-flexi-term", "Secure Flexi Term"),
  ],
  "asgn-22": [
    product("appointment-setting", "Appointment Setting"),
    product("sales-tools-objections", "Sales Tools & Objection Handling"),
    product("soft-skills-10", "Soft Skills 1.0"),
    obsidian(SALES_PLAYBOOK, "Pre-Retiree Sales Playbook"),
  ],
  "asgn-7": [
    product("concept-drawings", "Concept Drawings"),
    product("financial-presenter-walkthrough", "Financial Presenter Walkthrough"),
    product("soft-skills-20", "Soft Skills 2.0"),
    obsidian(SALES_BIBLE, "Pre-Retiree Sales Bible"),
  ],
  "asgn-8": [
    product("appointment-setting", "Appointment Setting"),
    product("debrief-flow", "Debrief Flow"),
    product("general-flow", "General Flow"),
    obsidian(SALES_BIBLE, "Pre-Retiree Sales Bible"),
  ],

  "asgn-18": [MDRT_MAGAZINE],
  "asgn-24": [
    product("training-meetings", "Training Meetings"),
    product("soft-skills-20", "Soft Skills 2.0"),
    obsidian(FINTERNSHIP_MOC, "FINternship Programme"),
  ],
};

async function main() {
  console.log("Loading items...");
  const { data: items, error: itemsErr } = await supabase
    .from("learning_track_items")
    .select("id, legacy_id");
  if (itemsErr) throw itemsErr;
  if (!items?.length) throw new Error("No items found — run the seed-learning-track first");

  const idByLegacy = new Map<string, string>();
  for (const i of items) {
    if (i.legacy_id) idByLegacy.set(i.legacy_id, i.id);
  }

  console.log(`Found ${items.length} items, ${idByLegacy.size} with legacy_id`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [legacyId, links] of Object.entries(MAPPING)) {
    const itemId = idByLegacy.get(legacyId);
    if (!itemId) {
      console.warn(`  ⚠ skipping ${legacyId} — not found in DB`);
      totalSkipped++;
      continue;
    }

    // Clear existing resource_ref blocks for this item
    await supabase
      .from("learning_track_content_blocks")
      .delete()
      .eq("item_id", itemId)
      .eq("block_type", "resource_ref");

    // Insert curated links
    const rows = links.map((link, idx) => ({
      item_id: itemId,
      order_index: idx + 1,
      block_type: "resource_ref",
      title: link.title,
      url: link.url,
    }));

    const { error } = await supabase
      .from("learning_track_content_blocks")
      .insert(rows);
    if (error) {
      console.error(`  ✗ ${legacyId}: ${error.message}`);
      continue;
    }
    console.log(`  ✓ ${legacyId} (${rows.length} resources)`);
    totalInserted += rows.length;
  }

  console.log(`\nDone. Inserted ${totalInserted} resource_ref blocks across ${Object.keys(MAPPING).length} items. Skipped ${totalSkipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
