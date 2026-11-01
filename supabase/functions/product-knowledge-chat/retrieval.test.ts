// deno test supabase/functions/product-knowledge-chat/retrieval.test.ts
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  aboutProduct,
  aliasFilter,
  type Chunk,
  type ChunkStore,
  productAliases,
  queryTerms,
  rankChunks,
  retrieveChunks,
  termFilter,
} from "./retrieval.ts";

const PWV = { id: "core-platinum-wealth-venture", title: "Platinum Wealth Venture" };
const pwvAliases = productAliases(PWV);

// Shaped like scripts/sync-curriculum-knowledge.mjs rows: no product_id, the day header in the content.
const lesson = (day: number, title: string, body: string, i = 0): Chunk & { product_id?: string } => ({
  source_type: "curriculum",
  source_id: `pm-day-${day}-${i}`,
  content: `[Product Mastery - Day ${day}: ${title}]\nLink: /learning-track/product-mastery/day/${day}\n\n${body}`,
});
const lecture = (body: string): Chunk & { product_id?: string } => ({
  source_type: "training_video",
  source_id: PWV.id,
  product_id: PWV.id,
  content: body,
  metadata: { video_title: "PWV walkthrough" },
});

/** An in-memory store that filters the way the PostgREST queries do (substring, a superset). */
function fakeStore(rows: (Chunk & { product_id?: string })[], seen: { terms?: string[] } = {}): ChunkStore {
  const anyTerm = (c: Chunk, terms: string[]) =>
    terms.length === 0 || terms.some((t) => c.content.toLowerCase().includes(t));
  return {
    productChunks: async (id, terms, cap) => {
      seen.terms = terms;
      const out = rows.filter((c) => (c.source_id === id || c.product_id === id) && anyTerm(c, terms));
      return { rows: out.slice(0, cap), error: null };
    },
    curriculumChunks: async (a, terms, cap) => {
      const named = (c: Chunk) =>
        a.names.some((n) => c.content.toLowerCase().includes(n.toLowerCase())) ||
        a.acronyms.some((x) => c.content.includes(x));
      const out = rows.filter((c) => c.source_type === "curriculum" && named(c) && anyTerm(c, terms));
      return { rows: out.slice(0, cap), error: null };
    },
  };
}

Deno.test("aliases come from the title and the core id, with the curriculum's short name", () => {
  assertEquals(pwvAliases, { names: ["Platinum Wealth Venture"], acronyms: ["PWV"] });
  assertEquals(productAliases({ id: "core-pro-achiever", title: "AIA Pro Achiever 3.0" }), {
    names: ["Pro Achiever"],
    acronyms: ["APA"],
  });
  assertEquals(productAliases({ id: "core-healthshield-gold-max", title: "HealthShield Gold Max (Plan A)" }).names, [
    "HealthShield Gold Max",
  ]);
  // Not a core product: title only, and a too-short title is dropped rather than matching everything.
  assertEquals(productAliases({ id: "3f1c9a", title: "PA" }), { names: [], acronyms: [] });
});

Deno.test("a short name matches only as a whole, upper-case word", () => {
  const ucc = productAliases({ id: "core-ultimate-critical-cover", title: "Ultimate Critical Cover" });
  assert(aboutProduct("UCC vs GPP: the multi-claim staircase", ucc));
  assert(!aboutProduct("Success looks like three referrals a week", ucc));
  assert(aboutProduct("why ultimate critical cover pays per stage", ucc));
  const apa = productAliases({ id: "core-pro-achiever", title: "Pro Achiever" });
  assert(!aboutProduct("APAC funds and premium capacity", apa));
});

Deno.test("query terms drop filler words and the product's own name", () => {
  assertEquals(queryTerms("What is the minimum premium for PWV?", pwvAliases), ["minimum", "premium"]);
  assertEquals(queryTerms("Can I pay Platinum Wealth Venture with SRS?", pwvAliases), ["pay", "srs"]);
  assertEquals(queryTerms("Tell me about PWV", pwvAliases), []);
});

Deno.test("filter strings carry only words, so a question cannot break the query", () => {
  const terms = queryTerms("minimum premium),content.ilike.%", pwvAliases);
  assertEquals(termFilter(terms), "content.ilike.%minimum%,content.ilike.%premium%,content.ilike.%content%,content.ilike.%ilike%");
  assertEquals(aliasFilter(pwvAliases), "content.ilike.%Platinum Wealth Venture%,content.like.%PWV%");
});

Deno.test("the best match ranks first however late the database returns it", () => {
  const filler = Array.from({ length: 25 }, (_, i) => lecture(`Premium holiday story ${i}: the premium keeps the policy going.`));
  const best = lesson(31, "Platinum Wealth Venture - PWV Foundations", "Minimum premium: S$18,000/year (S$1,500 monthly)");
  const ranked = rankChunks([...filler, best], ["minimum", "premium"]);
  assertEquals(ranked[0], best);
  assertEquals(ranked.length, 26);
});

Deno.test("product chat reads the curriculum days that name the product, and only those", async () => {
  const seen: { terms?: string[] } = {};
  const rows = [
    ...Array.from({ length: 20 }, (_, i) => lecture(`Premium talk ${i}`)),
    lesson(31, "Platinum Wealth Venture - PWV Foundations", "| 5 years | Premium-paying term |", 3),
    lesson(31, "Platinum Wealth Venture - PWV Foundations", "| S$18,000/year | Minimum annual regular premium |", 2),
    lesson(1, "Pro Achiever 3.0 - APA Foundations", "Minimum premium $200 a month"),
  ];
  const got = await retrieveChunks(fakeStore(rows, seen), PWV, "What is the minimum premium for PWV?", 3);
  assertEquals(seen.terms, ["minimum", "premium"]);
  assertEquals(got[0].source_id, "pm-day-31-2");
  assert(!got.some((c) => c.content.includes("Pro Achiever")), "another product's day leaked in");
  assertEquals(got.length, 3);
});

Deno.test("a short-name hit the database lets through is dropped when it is not the product", async () => {
  const UCC = { id: "core-ultimate-critical-cover", title: "Ultimate Critical Cover" };
  const rows = [
    lesson(9, "Prospecting", "## SUCCESS STORIES\nHow one claim paid out"),
    lesson(16, "Ultimate Critical Cover - UCC Foundations", "Each claim pays per stage"),
  ];
  const got = await retrieveChunks(fakeStore(rows), UCC, "how does a claim pay out", 12);
  assertEquals(got.map((c) => c.source_id), ["pm-day-16-0"]);
});

Deno.test("a question with no content words still gets the product's material", async () => {
  const rows = [lecture("Intro lecture"), lesson(31, "Platinum Wealth Venture - PWV Foundations", "Two sentences")];
  const got = await retrieveChunks(fakeStore(rows), PWV, "hi", 12);
  assertEquals(got.map((c) => c.source_type), ["training_video", "curriculum"]);
});

Deno.test("a failed read leaves the other source in play", async () => {
  const store: ChunkStore = {
    productChunks: async () => ({ rows: [], error: "boom" }),
    curriculumChunks: async () => ({ rows: [lesson(31, "Platinum Wealth Venture", "Free-look 14 days")], error: null }),
  };
  const got = await retrieveChunks(store, PWV, "free-look period", 12);
  assertEquals(got.length, 1);
});
