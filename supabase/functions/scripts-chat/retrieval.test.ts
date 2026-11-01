// deno test --allow-read supabase/functions/scripts-chat/retrieval.test.ts
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  cheatHref,
  type Chunk,
  dayHref,
  type KnowledgeStore,
  lessonLinks,
  poolTerms,
  rankedSearch,
  retrieveLessons,
  TRACKS,
  weekDays,
} from "./retrieval.ts";

const PM = TRACKS.find((t) => t.key === "pm")!;
const pmDay = (d: number) => `/learning-track/product-mastery/day/${d}`;

// Shaped like scripts/sync-curriculum-knowledge.mjs rows: header lines, Link, metadata.href, ids ending in the position.
const lesson = (track: string, label: string, day: number, i: number, body: string): Chunk => {
  const t = TRACKS.find((x) => x.key === track)!;
  return {
    source_type: "curriculum",
    source_id: `${track}-day-${day}-${i}`,
    content: `[${label} — Day ${day}: Day ${day} title]\nSection: Part ${i}\nLink: ${dayHref(t, day)}\n\n${body}`,
    metadata: { track, day, href: dayHref(t, day) },
  };
};
const cheat = (week: number, i: number, body: string): Chunk => ({
  source_type: "curriculum",
  source_id: `cheat-product-mastery-week-0${week}-${i}`,
  content: `[Cheat Sheet — Product Mastery - Week ${week} - Cheat Sheet]\nLink: ${cheatHref(PM, week)}\n\n${body}`,
  metadata: { track: "cheat", href: cheatHref(PM, week) },
});

/** Filters the way the PostgREST reads do, and records what each was asked. */
function fakeStore(rows: Chunk[], seen: { search?: string[][]; links?: string[][] } = {}): KnowledgeStore {
  return {
    search: async (types, terms, cap) => {
      (seen.search ??= []).push(terms);
      const out = rows.filter((c) => types.includes(c.source_type) && terms.some((t) => c.content.toLowerCase().includes(t)));
      return { rows: out.slice(0, cap), error: null };
    },
    count: async (types, term) => rows.filter((c) => types.includes(c.source_type) && c.content.toLowerCase().includes(term)).length,
    lessonsAt: async (hrefs, cap) => {
      (seen.links ??= []).push(hrefs);
      const out = rows.filter((c) => c.source_type === "curriculum" && hrefs.includes(String(c.metadata?.href)));
      return { rows: out.slice(0, cap), error: null };
    },
  };
}

// Product Mastery days 1-6 (week 1 is days 1-5), four chunks a day, plus two week cheat sheets
// and a First 60 Days day 1. Returned in the database's order, not the lesson order.
const ROWS: Chunk[] = [
  cheat(2, 0, "Week 2 covers Pro Lifetime Protector objections."),
  ...[6, 5, 4, 3, 2, 1].flatMap((d) =>
    [3, 2, 1, 0].map((i) =>
      lesson("pm", "Product Mastery", d, i, d === 1 && i === 3 ? "Coverage of the welcome bonus tiers." : `Day ${d} part ${i}.`)
    )
  ),
  cheat(1, 1, "Week 1 summary, part 2."),
  cheat(1, 0, "Week 1: Pro Achiever 3.0."),
  lesson("f60", "First 60 Days", 1, 0, "Welcome to the First 60 Days."),
];

Deno.test("a question naming a track and a week gets that week's cheat sheet and days", () => {
  assertEquals(lessonLinks("What does week 1 of the Product Mastery track cover?"), [
    "/cheat-sheets/product-mastery/week-01",
    pmDay(1), pmDay(2), pmDay(3), pmDay(4), pmDay(5),
  ]);
  assertEquals(lessonLinks("week two of product mastery"), [
    "/cheat-sheets/product-mastery/week-02",
    pmDay(6), pmDay(7), pmDay(8), pmDay(9), pmDay(10),
  ]);
  assertEquals(lessonLinks("What's in week 1 of the First 14 Days?"), [1, 2, 3, 4, 5, 6, 7].map((d) => `/learning-track/first-14-days/day/${d}`));
});

Deno.test("a day with no track names that day in every track that has one", () => {
  assertEquals(lessonLinks("What does day 23 cover?"), [
    "/learning-track/first-60-days/day/23",
    pmDay(23),
    "/learning-track/next-60-days/day/23",
  ]);
  assertEquals(lessonLinks("days 3-5 of Product Mastery"), [pmDay(3), pmDay(4), pmDay(5)]);
  assertEquals(lessonLinks("day 3 of the first 14 days"), ["/learning-track/first-14-days/day/3"]);
});

Deno.test("no day or week named, or one the track does not have, names no lesson", () => {
  assertEquals(lessonLinks("How do I answer 'I need to think about it'?"), []);
  assertEquals(lessonLinks("What does the First 60 Days track teach?"), []);
  assertEquals(lessonLinks("Can we meet on Monday at 3?"), []);
  assertEquals(lessonLinks("It's my 3rd day and I have 2 weeks left"), []);
  assertEquals(lessonLinks("week 9 of Product Mastery"), []);
  assertEquals(lessonLinks("day 123"), []);
});

Deno.test("the tracks match the docs folders and the sync script's Links", async () => {
  const root = new URL("../../../", import.meta.url);
  const dirs: Record<string, string> = {
    f14: "docs/first-14-days",
    f60: "docs/first-60-days",
    pm: "docs/product-mastery-track",
    n60: "docs/next-60-days",
  };
  const sync = await Deno.readTextFile(new URL("scripts/sync-curriculum-knowledge.mjs", root));
  for (const t of TRACKS) {
    assert(sync.includes("`/learning-track/" + t.slug + "/day/${day}`"), `sync script links ${t.key} differently`);
    let total = 0;
    for await (const w of Deno.readDir(new URL(dirs[t.key] + "/", root))) {
      const week = Number(/^week-(\d+)$/.exec(w.name)?.[1]);
      if (!w.isDirectory || !week) continue;
      const files: number[] = [];
      for await (const f of Deno.readDir(new URL(`${dirs[t.key]}/${w.name}/`, root))) {
        const m = /^day-(\d+)\.md$/.exec(f.name);
        if (m) files.push(Number(m[1]));
      }
      files.sort((a, b) => a - b);
      assertEquals(weekDays(t, week), files, `${t.key} ${w.name}`);
      total += files.length;
      if (t.cheat) {
        const sheet = cheatHref(t, week).replace("/cheat-sheets/", "docs/cheat-sheets/") + ".md";
        assert((await Deno.stat(new URL(sheet, root))).isFile, `${sheet} is missing`);
      }
    }
    assertEquals(total, t.days, `${t.key} day count`);
  }
});

Deno.test("lessons mode answers a week question from that week's days, one chunk from each in turn", async () => {
  const seen: { search?: string[][]; links?: string[][] } = {};
  const got = await retrieveLessons(fakeStore(ROWS, seen), "What does week 1 of the Product Mastery track cover?", 12, {
    byLink: true,
  });
  assertEquals(seen.search, undefined, "a named week should not fall back to the word search");
  assertEquals(got.length, 12);
  assertEquals(got.slice(0, 6).map((c) => c.metadata?.href), [
    "/cheat-sheets/product-mastery/week-01",
    pmDay(1), pmDay(2), pmDay(3), pmDay(4), pmDay(5),
  ]);
  assertEquals(got[0].source_id, "cheat-product-mastery-week-01-0", "each day starts at its first chunk");
  assertEquals(got[1].source_id, "pm-day-1-0");
  assert(!got.some((c) => c.content.includes("Week 2")), "the week 2 cheat sheet leaked in");
  assert(!got.some((c) => c.metadata?.href === pmDay(6)), "day 6 is week 2");
});

Deno.test("words beyond the reference rank the named lesson's chunks", async () => {
  const got = await retrieveLessons(fakeStore(ROWS), "What does day 1 of Product Mastery say about the welcome bonus?", 3, {
    byLink: true,
  });
  assertEquals(got[0].source_id, "pm-day-1-3");
  assert(got.every((c) => c.metadata?.href === pmDay(1)));
});

Deno.test("a named lesson with no rows, and every other mode, use the ranked word search", async () => {
  const seen: { search?: string[][]; links?: string[][] } = {};
  const store = fakeStore(ROWS, seen);
  const none = await retrieveLessons(store, "day 30 of Product Mastery: welcome bonus", 12, { byLink: true });
  assertEquals(seen.links, [[pmDay(30)]]);
  assertEquals(none[0].source_id, "pm-day-1-3");
  const topUp = await retrieveLessons(store, "What does week 1 of the Product Mastery track cover?", 4);
  assertEquals(seen.links?.length, 1, "a top-up read looked lessons up by Link");
  assert(topUp.length <= 4);
});

Deno.test("the search uses the rarest words whose chunks fit under the cap", () => {
  assertEquals(poolTerms(["client", "expensive", "premium"], [900, 12, 250]), ["expensive", "premium"]);
  assertEquals(poolTerms(["client", "expensive"], [900, 400]), ["expensive"], "the rarest word is always kept");
  assertEquals(poolTerms(["client", "lemme"], [120, 0]), ["client"], "a word no chunk holds is dropped");
  assertEquals(poolTerms(["lemme"], [0]), []);
  assertEquals(poolTerms(["client", "expensive"], [900, null]), ["client", "expensive"], "a failed count keeps every word");
});

Deno.test("every candidate is ranked before the cut, however late the database returns the best one", async () => {
  const seen: { search?: string[][] } = {};
  // 400 chunks say "client": searched on that word, the database would return 300 of them and stop.
  const scripts: Chunk[] = [
    ...Array.from({ length: 400 }, (_, i) => ({ source_type: "script", source_id: `s${i}`, content: `Client follow-up script ${i}.` })),
    { source_type: "script", source_id: "best", content: "When the client says it is too expensive: break the premium down per day." },
    { source_type: "training_video", source_id: "v", content: "Too expensive? Expensive premium talk." },
  ];
  const got = await rankedSearch(fakeStore(scripts, seen), ["script", "document"], "What do I say when a client says it's too expensive?", 15);
  assertEquals(seen.search?.map((t) => [...t].sort()), [["expensive", "say", "says", "too"]], "the common word was not left out of the search");
  assertEquals(got[0].source_id, "best");
  assert(!got.some((c) => c.source_type === "training_video"));
  assertEquals(await rankedSearch(fakeStore(scripts), ["script"], "hi", 15), []);
});
