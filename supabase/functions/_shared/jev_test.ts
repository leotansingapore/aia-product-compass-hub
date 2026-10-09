// deno test --allow-env supabase/functions/_shared/jev_test.ts
// Jev's pick replaces the LLM's only when confident, offered and English; the output shape never changes.
import { mostlyLatin, type JevAnswer } from "./jev.ts";
import { applyJev as applyScript, cleanCategories } from "../classify-script/jev.ts";
import { applyJev as applyObjection } from "../classify-objection/jev.ts";

const eq = (a: unknown, b: unknown, m: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
};
const choice = (c: string, confidence: number): JevAnswer => ({ type: "choice", choice: c, confidence });
const llm = { category: "confirmation", target_audience: "general", script_role: "consultant", tags: ["a"], suggested_title: "T" };

Deno.test("script category: confident pick replaces, unsure pick and null keep the LLM's", () => {
  eq(applyScript(llm, { category: choice("post-call-text", 0.82) }, false, []), { ...llm, category: "post-call-text" }, "confident");
  eq(applyScript(llm, { category: choice("cold-calling", 0.44) }, false, []), llm, "below bar");
  eq(applyScript(llm, null, false, []), llm, "no Jev");
  eq(applyScript(llm, { category: choice("servicing", 1) }, false, []), llm, "not an offered option");
});

Deno.test("servicing: an existing slug replaces the LLM's, none-fits keeps its new slug", () => {
  const s = { servicing_category: "court-of-table", script_role: "consultant", tags: [], suggested_title: "T" };
  eq(applyScript(s, { servicing_category: choice("client-appreciation", 0.2) }, true, ["client-appreciation"]).servicing_category, "client-appreciation", "existing");
  eq(applyScript(s, { servicing_category: choice("festive-greetings", 0.9) }, true, []).servicing_category, "festive-greetings", "standard");
  eq(applyScript(s, { servicing_category: choice("none-fits", 0.9) }, true, []), s, "none fits");
});

Deno.test("objections: each item gets its own confident pick, other fields untouched", () => {
  const items = [
    { title: "Market too volatile", category: "product", description: "d", tags: [], initial_response: "" },
    { title: "Call you back", category: "tactical", description: "d", tags: [], initial_response: "" },
  ];
  const out = applyObjection(items, { category_0: choice("timing", 0.77), category_1: choice("timing", 0.42) });
  eq(out.map((o) => o.category), ["timing", "tactical"], "per item");
  eq(out[0], { ...items[0], category: "timing" }, "shape");
  eq(applyObjection(items, null), items, "no Jev");
});

Deno.test("mostlyLatin: English and Singlish pass, Chinese does not", () => {
  eq(mostlyLatin("Hi [Name]! 👋 Can check with you ah, still keen?"), true, "english");
  eq(mostlyLatin("你好，我想了解一下你的保险计划"), false, "chinese");
  eq(mostlyLatin("Hi 你好，我想了解一下你的保险计划"), false, "mostly chinese");
  eq(mostlyLatin("👋 123"), false, "no letters");
});

Deno.test("existingCategories from the caller: only unique slugs, at most 200", () => {
  const huge = Array.from({ length: 10_000 }, (_, i) => `slug-${i}`);
  eq(cleanCategories(huge).length, 200, "10,000 cut to 200");
  eq(cleanCategories([1, null, { a: 1 }, "Premium Payments", "x".repeat(61), "claims", "claims", "gift-set"]), ["claims", "gift-set"], "non-strings, non-slugs, overlong, dupes");
  eq(cleanCategories("premium-payments"), [], "not an array");
});
