// deno test supabase/functions/product-knowledge-chat/prompt.test.ts
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { BOTH_VALUES_RULE, buildSystemPrompt, SOURCE_ORDER_RULE, sourceKind, sourceLabel } from "./prompt.ts";
import type { Chunk } from "./retrieval.ts";

// Shaped like the live rows: process-knowledge writes lectures and documents,
// scripts/sync-curriculum-knowledge.mjs writes curriculum rows with metadata.track.
const lecture: Chunk = {
  source_type: "training_video",
  source_id: "core-healthshield-gold-max",
  content: "With Max VitalHealth A there is zero deductible on the first private-hospital claim.",
  metadata: { video_title: "HSG Max riders explained" },
};
const lesson: Chunk = {
  source_type: "curriculum",
  source_id: "pm-day-23-4",
  content:
    "[Product Mastery — Day 23: HealthShield Gold Max — Riders]\nLink: /learning-track/product-mastery/day/23\n\nMax VitalHealth Pro A: the deductible is still paid; 5% co-payment capped at S$6,000.",
  metadata: { track: "pm", day: 23, href: "/learning-track/product-mastery/day/23" },
};
const cheat: Chunk = {
  source_type: "curriculum",
  source_id: "cheat-product-mastery-week-05-1",
  content: "[Cheat Sheet — Product Mastery - Week 5]\nLink: /cheat-sheets/product-mastery/week-05\n\nPro A / Pro B / Pro B Lite",
  metadata: { track: "cheat", href: "/cheat-sheets/product-mastery/week-05" },
};
const reference: Chunk = {
  source_type: "curriculum",
  source_id: "ref-cst-risks-script-full-0",
  content: "[Reference — CST script]\nLink: /learning-track/first-60-days/reference/cst-risks-script-full\n\n...",
  metadata: { track: "reference", title: "CST script" },
};
const doc: Chunk = {
  source_type: "document",
  source_id: "d1",
  content: "VitalHealth A covers the deductible.",
  metadata: { title: "HSG brochure 2025" },
};

const HSG = {
  title: "HealthShield Gold Max",
  description: "Integrated Shield plan",
  highlights: ["Pre and post hospitalization coverage"],
  categories: { name: "Medical" },
};

Deno.test("each chunk is labelled with the kind of source it is", () => {
  assertEquals([lecture, lesson, cheat, reference, doc].map(sourceKind), [
    "lecture",
    "lesson",
    "cheat_sheet",
    "reference",
    "document",
  ]);
  assertEquals(sourceLabel(lecture), "Lecture transcript (a recording, may predate a product change): HSG Max riders explained");
  assertEquals(sourceLabel(doc), "Uploaded document (may predate a product change): HSG brochure 2025");
  assertEquals(sourceLabel(reference), "Reference document (a captured source, may predate a product change): CST script");
  assert(sourceLabel(lesson).startsWith("Lesson (current curriculum"));
  assert(sourceLabel(cheat).startsWith("Cheat sheet (current curriculum"));
  assertEquals(sourceLabel({ source_type: "script", content: "x" }), "Source: script");
});

Deno.test("the rule names every label the context uses, in the right tier", () => {
  const [first, second] = SOURCE_ORDER_RULE.split("Second tier:");
  assert(second, "the rule has no second tier");
  for (const name of ["PRODUCT OVERVIEW", "Lessons", "Cheat sheets"]) assert(first.includes(name), `${name} not in the first tier`);
  for (const name of ["Lecture transcripts", "Uploaded documents", "Reference documents"]) {
    assert(second.includes(name), `${name} not in the second tier`);
  }
  // A label renamed without the rule would leave the model unable to match the two.
  for (const c of [lecture, lesson, cheat, reference, doc]) {
    const lead = sourceLabel(c).split(" (")[0];
    assert(SOURCE_ORDER_RULE.includes(lead), `the rule never names "${lead}"`);
  }
});

Deno.test("a lecture that contradicts a lesson reaches the model labelled, with the rule that the lesson wins", () => {
  const prompt = buildSystemPrompt(HSG, [lecture, lesson], "knowledge");
  assert(prompt.includes(`--- Lecture transcript (a recording, may predate a product change): HSG Max riders explained ---\n${lecture.content}`));
  assert(prompt.includes(`--- Lesson (current curriculum; track, day and Link are in the first lines) ---\n${lesson.content}`));
  assert(prompt.includes(SOURCE_ORDER_RULE), "the source-order rule is missing from the prompt");
  assert(prompt.includes(BOTH_VALUES_RULE), "the both-values rule is missing from the prompt");
  assert(!prompt.includes("--- Lecture: "), "the old untiered label is back");
  assert(prompt.includes("- **Key Highlights:** Pre and post hospitalization coverage"));
});

Deno.test("the both-values rule is kept for disagreements inside a tier", () => {
  assert(BOTH_VALUES_RULE.includes("same tier"));
  assert(BOTH_VALUES_RULE.includes("two Lessons"));
  assert(BOTH_VALUES_RULE.includes("Give both values"));
});

Deno.test("modes still switch, and an unknown mode falls back to knowledge", () => {
  assert(buildSystemPrompt(HSG, [], "roleplay").includes("## MODE: ROLE PLAY"));
  assert(buildSystemPrompt(HSG, [], "nonsense").includes("## MODE: KNOWLEDGE Q&A"));
  assert(buildSystemPrompt(HSG, []).includes("No specific knowledge chunks found for this query."));
});
