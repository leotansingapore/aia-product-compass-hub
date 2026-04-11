/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import { learningTrack, assignmentChecklist, type ContentBlock } from "../src/data/learningTrackData";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface PostRnfPhaseSpec {
  title: string;
  description: string;
  legacyIds: string[];
}

// Mapping reflects the current contents of assignmentChecklist (post-edit cleanup).
// Items removed since the original spec: telethon sessions, CMFAS modules,
// APA pitch, CST presentation, financial health check, and several others.
const POST_RNF_PHASES: PostRnfPhaseSpec[] = [
  {
    title: "Foundation & Compliance",
    description:
      "Regulatory baseline and foundational training before working at scale.",
    legacyIds: ["asgn-20", "asgn-21", "tc-7"],
  },
  {
    title: "Business Planning & Marketing Setup",
    description:
      "Build your personal infrastructure: business plan, marketing kit, pledge sheet.",
    legacyIds: ["asgn-4", "asgn-5", "asgn-6", "asgn-23"],
  },
  {
    title: "Sales Practice & Field Observation",
    description:
      "Live sales-skill development: cold-calling drills, financial planning concept, shadowing senior FCs.",
    legacyIds: ["asgn-22", "asgn-7", "asgn-8", "asgn-11"],
  },
  {
    title: "Learning & Team Contribution",
    description: "Continuous coaching and giving back to the team.",
    legacyIds: ["asgn-24", "asgn-18"],
  },
];

function blockRow(block: ContentBlock, itemId: string, idx: number) {
  return {
    item_id: itemId,
    order_index: idx + 1,
    block_type: block.type,
    title: block.label ?? null,
    body: block.text ?? null,
    url: block.url ?? null,
  };
}

async function clearExisting() {
  const { error } = await supabase
    .from("learning_track_phases")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

async function seedPreRnf() {
  for (let pIdx = 0; pIdx < learningTrack.length; pIdx++) {
    const phase = learningTrack[pIdx];
    const { data: phaseRow, error: phaseErr } = await supabase
      .from("learning_track_phases")
      .insert({
        track: "pre_rnf",
        order_index: pIdx + 1,
        title: phase.title,
        description: phase.description ?? null,
      })
      .select("id")
      .single();
    if (phaseErr) throw phaseErr;

    for (let iIdx = 0; iIdx < phase.items.length; iIdx++) {
      const item = phase.items[iIdx];
      const { data: itemRow, error: itemErr } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: phaseRow.id,
          order_index: iIdx + 1,
          title: item.title,
          description: item.description ?? null,
          objectives: item.objectives ?? null,
          action_items: item.actionItems ?? null,
          requires_submission: true,
          legacy_id: item.id,
        })
        .select("id")
        .single();
      if (itemErr) throw itemErr;

      const blocks = (item.defaultContent ?? []).map((b, bIdx) =>
        blockRow(b, itemRow.id, bIdx)
      );
      if (blocks.length > 0) {
        const { error: blockErr } = await supabase
          .from("learning_track_content_blocks")
          .insert(blocks);
        if (blockErr) throw blockErr;
      }
    }
    console.log(`  ✓ pre-RNF phase ${pIdx + 1} (${phase.items.length} items)`);
  }
}

async function seedPostRnf() {
  const legacyMap = new Map<string, { id: string; title: string }>();
  for (const section of assignmentChecklist) {
    for (const item of section.items) {
      legacyMap.set(item.id, item);
    }
  }

  for (let pIdx = 0; pIdx < POST_RNF_PHASES.length; pIdx++) {
    const phase = POST_RNF_PHASES[pIdx];
    const { data: phaseRow, error: phaseErr } = await supabase
      .from("learning_track_phases")
      .insert({
        track: "post_rnf",
        order_index: pIdx + 1,
        title: phase.title,
        description: phase.description,
      })
      .select("id")
      .single();
    if (phaseErr) throw phaseErr;

    for (let iIdx = 0; iIdx < phase.legacyIds.length; iIdx++) {
      const legacyId = phase.legacyIds[iIdx];
      const legacyItem = legacyMap.get(legacyId);
      if (!legacyItem) {
        throw new Error(
          `Legacy id not found in assignmentChecklist: ${legacyId}`
        );
      }
      const { error: itemErr } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: phaseRow.id,
          order_index: iIdx + 1,
          title: legacyItem.title,
          description: null,
          requires_submission: true,
          legacy_id: legacyId,
        });
      if (itemErr) throw itemErr;
    }
    console.log(
      `  ✓ post-RNF phase ${pIdx + 1} (${phase.legacyIds.length} items)`
    );
  }
}

async function main() {
  console.log("Clearing existing learning track data...");
  await clearExisting();
  console.log("Seeding pre-RNF...");
  await seedPreRnf();
  console.log("Seeding post-RNF...");
  await seedPostRnf();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
