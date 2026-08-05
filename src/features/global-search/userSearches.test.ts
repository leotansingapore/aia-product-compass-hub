// 500-query realistic user-search battery. Queries are generated
// deterministically from real content (day titles, lesson headings, page
// names) the way people actually type them — exact, cased differently,
// truncated, typo'd, padded — and each one must surface its source in the
// top results when scored against the full index corpus.
import { describe, it, expect } from "vitest";
import { scoreEntry } from "./score";
import { HEADING_INDEX } from "./headingIndex";
import { PAGE_ENTRIES } from "./pages";
import { DAY_SUMMARIES as F60_DAYS } from "../first-60-days/summaries";
import { DAY_SUMMARIES as PM_DAYS } from "../product-mastery-track/summaries";
import { DAY_SUMMARIES as N60_DAYS } from "../next-60-days/summaries";
import { DAY_SUMMARIES as F14_DAYS } from "../first-14-days/summaries";

interface CorpusEntry {
  value: string;
  title: string;
  keywords: string[];
}

// Mirror the dialog's value construction closely enough for ranking realism.
const corpus: CorpusEntry[] = [
  ...PAGE_ENTRIES.map((p) => ({
    value: `page-${p.href} ${p.title} ${p.meta}`,
    title: p.title,
    keywords: p.keywords,
  })),
  ...F60_DAYS.map((d) => ({
    value: `f60-day-${d.dayNumber} ${d.title}`,
    title: d.title,
    keywords: [`day ${d.dayNumber}`, `week ${d.week}`],
  })),
  ...PM_DAYS.map((d) => ({
    value: `pm-day-${d.dayNumber} ${d.title}`,
    title: d.title,
    keywords: [`day ${d.dayNumber}`],
  })),
  ...N60_DAYS.map((d) => ({
    value: `n60-day-${d.dayNumber} ${d.title}`,
    title: d.title,
    keywords: [`day ${d.dayNumber}`],
  })),
  ...F14_DAYS.map((d) => ({
    value: `f14-day-${d.dayNumber} ${d.title}`,
    title: d.title,
    keywords: [`day ${d.dayNumber}`, d.bigIdea ?? ""],
  })),
  ...HEADING_INDEX.map(([track, day, , text, slug]) => ({
    value: `h-${track}-${day}-${slug} ${text}`,
    title: text,
    keywords: [],
  })),
];

// Deterministic PRNG so every run tests the identical 500 queries.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260805);

type Variant = {
  name: string;
  make: (title: string) => string | null;
  /** How deep in the ranking the source may sit and still count as found. */
  topN: number;
};

const VARIANTS: Variant[] = [
  { name: "exact", make: (t) => t, topN: 5 },
  { name: "lowercase", make: (t) => t.toLowerCase(), topN: 5 },
  { name: "uppercase", make: (t) => t.toUpperCase(), topN: 5 },
  {
    name: "first-three-words",
    make: (t) => {
      const words = t.split(/\s+/).filter((w) => /\w/.test(w));
      return words.length >= 3 ? words.slice(0, 3).join(" ") : null;
    },
    topN: 10,
  },
  {
    name: "last-two-words",
    make: (t) => {
      const words = t.split(/\s+/).filter((w) => w.length > 2 && /^\w+$/.test(w));
      return words.length >= 2 ? words.slice(-2).join(" ") : null;
    },
    topN: 15,
  },
  {
    name: "adjacent-swap-typo",
    make: (t) => {
      const words = t.split(/\s+/).filter((w) => /^\w{5,}$/.test(w));
      if (!words.length) return null;
      const w = words[Math.floor(rand() * words.length)];
      const i = 1 + Math.floor(rand() * (w.length - 2));
      const typo = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
      return t
        .toLowerCase()
        .replace(w.toLowerCase(), typo.toLowerCase());
    },
    topN: 20,
  },
  {
    name: "padded-whitespace",
    make: (t) => `   ${t.replace(/ /g, "   ")}   `,
    topN: 8,
  },
  {
    name: "two-content-words",
    make: (t) => {
      const words = t.split(/\s+/).filter((w) => /^\w{4,}$/.test(w));
      if (words.length < 2) return null;
      const a = words[Math.floor(rand() * words.length)];
      let b = words[Math.floor(rand() * words.length)];
      if (a === b) b = words[(words.indexOf(a) + 1) % words.length];
      return `${a} ${b}`.toLowerCase();
    },
    topN: 20,
  },
];

function rankOfSource(query: string, sourceTitle: string): number {
  const scored = corpus
    .map((e) => ({ e, s: scoreEntry(e.value, query, e.keywords) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  const target = sourceTitle.toLowerCase();
  for (let i = 0; i < scored.length; i++) {
    if (scored[i].e.title.toLowerCase() === target) return i;
  }
  return -1;
}

// Sample sources: all 149 day titles + all page titles + a deterministic
// spread of substantial headings, then apply variants until we have 500.
const daySources = [...F60_DAYS, ...PM_DAYS, ...N60_DAYS, ...F14_DAYS].map((d) => d.title);
const pageSources = PAGE_ENTRIES.map((p) => p.title);
const headingSources = HEADING_INDEX.filter(([, , , text]) => text.length >= 12 && /\w{4}/.test(text))
  .filter((_, i) => i % 7 === 0)
  .map(([, , , text]) => text);

const allSources = [...daySources, ...pageSources, ...headingSources];

const cases: Array<{ label: string; query: string; source: string; topN: number }> = [];
outer: for (let round = 0; ; round++) {
  for (const source of allSources) {
    const variant = VARIANTS[(round + Math.floor(rand() * VARIANTS.length)) % VARIANTS.length];
    const q = variant.make(source);
    if (!q || !q.trim()) continue;
    cases.push({ label: `${variant.name}: ${q.slice(0, 60)}`, query: q, source, topN: variant.topN });
    if (cases.length >= 500) break outer;
  }
  if (round > 10) break;
}

describe(`500 realistic user searches (corpus: ${corpus.length} entries)`, () => {
  it("generated a full 500-case battery", () => {
    expect(cases.length).toBe(500);
  });

  const failures: string[] = [];
  it(
    "every query surfaces its source within the allowed rank",
    () => {
      for (const c of cases) {
        const rank = rankOfSource(c.query, c.source);
        if (rank === -1 || rank >= c.topN) {
          failures.push(`[rank ${rank}] ${c.label} -> expected "${c.source.slice(0, 50)}" in top ${c.topN}`);
        }
      }
      expect(failures, failures.slice(0, 15).join("\n")).toEqual([]);
    },
    // 500 queries × ~3.7k-entry corpus with typo-recovery scoring ≈ 12s.
    60_000,
  );
});
