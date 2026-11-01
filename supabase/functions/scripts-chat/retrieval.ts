// What scripts-chat reads from knowledge_chunks. Each read used to be a Postgres
// full-text search with type "plain" (plainto_tsquery, so a chunk had to hold
// EVERY word of the question) and a LIMIT with no ORDER BY. "What does week 1 of
// the Product Mastery track cover?" matched no lesson at all, and when rows did
// match, whichever 15 the database returned first were kept. Now the database
// returns every chunk holding any of the question's rarer words (poolTerms), and
// all of them are ranked here before the cut (the product chat's ranking,
// ../_shared/rank-chunks.ts). In lessons mode a question that names a day or a
// week ("week 1 of the Product Mastery track", "day 23") reads those lessons by
// their Link instead of by its words.

import { CANDIDATE_CAP, type Chunk, contentTerms, rankChunks } from "../_shared/rank-chunks.ts";

export type { Chunk };

export interface Rows {
  rows: Chunk[];
  error: string | null;
}

/** The two reads, so a test can stand in for the database. */
export interface KnowledgeStore {
  /** Chunks of these source types whose content holds any of the terms. */
  search(types: string[], terms: string[], cap: number): Promise<Rows>;
  /** How many chunks of these source types hold the term; null when the count failed. */
  count(types: string[], term: string): Promise<number | null>;
  /** Curriculum chunks whose metadata.href is one of these Links. */
  lessonsAt(hrefs: string[], cap: number): Promise<Rows>;
}

export interface Track {
  key: string;
  /** The path segment in the Link: /learning-track/<slug>/day/<n>. */
  slug: string;
  days: number;
  /** Days in each docs/<track>/week-N folder; the days are numbered through the whole track. */
  perWeek: number;
  /** The docs/cheat-sheets/<section> holding week-NN.md, if the track has week cheat sheets. */
  cheat: string | null;
  name: RegExp;
}

// The Links match scripts/sync-curriculum-knowledge.mjs; retrieval.test.ts checks
// the day counts and the week folders against docs/.
export const TRACKS: Track[] = [
  { key: "f14", slug: "first-14-days", days: 14, perWeek: 7, cheat: null, name: /\bfirst[\s-]*(?:14|fourteen)\b/ },
  { key: "f60", slug: "first-60-days", days: 60, perWeek: 6, cheat: "first-60-days", name: /\bfirst[\s-]*(?:60|sixty)\b/ },
  { key: "pm", slug: "product-mastery", days: 35, perWeek: 5, cheat: "product-mastery", name: /\bproduct[\s-]*mastery\b/ },
  { key: "n60", slug: "next-60-days", days: 60, perWeek: 6, cheat: "next-60-days", name: /\bnext[\s-]*(?:60|sixty)\b/ },
];

export const dayHref = (t: Track, day: number) => `/learning-track/${t.slug}/day/${day}`;
export const cheatHref = (t: Track, week: number) => `/cheat-sheets/${t.cheat}/week-${String(week).padStart(2, "0")}`;

export function weekDays(t: Track, week: number): number[] {
  const out: number[] = [];
  for (let d = (week - 1) * t.perWeek + 1; d <= Math.min(week * t.perWeek, t.days); d++) if (d >= 1) out.push(d);
  return out;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const toNum = (s?: string) => (s === undefined ? undefined : /^\d+$/.test(s) ? Number(s) : NUMBER_WORDS[s]);
const WEEK_NO = "(\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)";
const DAY_RE = /\bdays?[\s-]*(\d{1,2})(?:\s*(?:-|to)\s*(\d{1,2}))?\b/g;
const WEEK_RE = new RegExp(`\\bweeks?[\\s-]*${WEEK_NO}(?:\\s*(?:-|to)\\s*${WEEK_NO})?\\b`, "g");

/** Every number a pattern names, ranges ("days 3-5") included, at most ten from one range. */
function numbersNamed(q: string, re: RegExp): number[] {
  const out: number[] = [];
  for (const m of q.matchAll(re)) {
    const a = toNum(m[1]);
    const b = toNum(m[2]) ?? a;
    if (a === undefined || b === undefined) continue;
    const lo = Math.min(a, b);
    for (let n = lo; n <= Math.max(a, b) && n < lo + 10; n++) if (!out.includes(n)) out.push(n);
  }
  return out;
}

/**
 * The lesson Links a question names: a day ("day 23", "days 3-5") or a week
 * ("week 1", "week one", with that week's cheat sheet first), in the tracks it
 * names, or in every track that has that day or week. Empty when it names neither.
 */
export function lessonLinks(query: string): string[] {
  const q = query.toLowerCase();
  const days = numbersNamed(q, DAY_RE);
  const weeks = days.length ? [] : numbersNamed(q, WEEK_RE);
  if (days.length === 0 && weeks.length === 0) return [];
  const named = TRACKS.filter((t) => t.name.test(q));
  const links: string[] = [];
  for (const t of named.length ? named : TRACKS) {
    for (const w of weeks) {
      const ds = weekDays(t, w);
      if (ds.length === 0) continue;
      if (t.cheat) links.push(cheatHref(t, w));
      for (const d of ds) links.push(dayHref(t, d));
    }
    for (const d of days) if (d >= 1 && d <= t.days) links.push(dayHref(t, d));
  }
  return links;
}

// Words that only point at the lesson ("what does week 1 of the track cover"):
// once the Links are found they say nothing about which part of it to read.
const REFERENCE_WORDS = new Set(
  ("week weeks day days track tracks first next product mastery fourteen sixty " +
    "one two three four five six seven eight nine ten " +
    "cover covers covered covering teach teaches taught learn learnt learned lesson lessons " +
    "say says said talk talks").split(" "),
);

const hrefOf = (c: Chunk) => String(c.metadata?.href ?? "");
/** sync-curriculum-knowledge.mjs ids end in the chunk's position in its day: pm-day-1-0, pm-day-1-1, ... */
const chunkNo = (c: Chunk) => Number(/-(\d+)$/.exec(c.source_id ?? "")?.[1] ?? 0);

/** One chunk from each Link in turn, so a week reads as all of its days, not the first day twice over. */
function interleave(chunks: Chunk[], links: string[]): Chunk[] {
  const groups = links.map((l) => chunks.filter((c) => hrefOf(c) === l)).filter((g) => g.length > 0);
  const out: Chunk[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < longest; i++) for (const g of groups) if (i < g.length) out.push(g[i]);
  return out;
}

function logRead(label: string, r: Rows) {
  if (r.error) console.error(`scripts-chat ${label} chunks error:`, r.error);
  // shortcut: past the cap the database's order decides what is left out; raise CANDIDATE_CAP or rank in SQL if this logs.
  if (r.rows.length >= CANDIDATE_CAP) console.warn(`scripts-chat ${label} chunks hit the ${CANDIDATE_CAP} cap`);
}

/**
 * The rarest of the question's words whose chunks fit under the cap together
 * (always at least one). The curriculum alone is 3,400 chunks, and "client" or
 * "new" is in most of them: searched on every word, the 300 rows the database
 * happens to return first would be all that gets ranked. A chunk that holds only
 * the common words would rank low anyway, so leaving those words out of the
 * search loses nothing. Words no chunk holds are dropped; a failed count keeps
 * every word, as before.
 */
export function poolTerms(terms: string[], counts: (number | null)[], cap = CANDIDATE_CAP): string[] {
  if (counts.some((n) => n === null)) return terms;
  const byRarity = terms
    .map((t, i) => ({ t, n: counts[i] as number }))
    .filter((x) => x.n > 0)
    .sort((a, b) => a.n - b.n);
  const out: string[] = [];
  let total = 0;
  for (const x of byRarity) {
    if (out.length > 0 && total + x.n > cap) break;
    out.push(x.t);
    total += x.n;
  }
  return out;
}

/** Chunks of these types holding the question's words, every candidate ranked, best first, top k. */
export async function rankedSearch(store: KnowledgeStore, types: string[], query: string, k: number): Promise<Chunk[]> {
  const terms = contentTerms(query);
  if (terms.length === 0) return [];
  const pool = poolTerms(terms, await Promise.all(terms.map((t) => store.count(types, t))));
  if (pool.length === 0) return [];
  const r = await store.search(types, pool, CANDIDATE_CAP);
  logRead(types.join("+"), r);
  // Ranked on every word, so a chunk with the common words as well still comes first.
  return rankChunks(r.rows, terms).slice(0, k);
}

/**
 * Curriculum chunks for a question. With byLink (lessons mode), a question that
 * names a day or a week reads those lessons by Link: ranked by its remaining
 * words when any of them appear, otherwise one chunk from each day in turn.
 * Everything else, and a Link with no rows, falls back to the ranked word search.
 */
export async function retrieveLessons(
  store: KnowledgeStore,
  query: string,
  k: number,
  { byLink = false }: { byLink?: boolean } = {},
): Promise<Chunk[]> {
  const links = byLink ? lessonLinks(query) : [];
  if (links.length > 0) {
    const r = await store.lessonsAt(links, CANDIDATE_CAP);
    logRead("lesson-link", r);
    if (r.rows.length > 0) {
      const at = (c: Chunk) => links.indexOf(hrefOf(c));
      const rows = [...r.rows].sort((a, b) => at(a) - at(b) || chunkNo(a) - chunkNo(b));
      const terms = contentTerms(query, REFERENCE_WORDS).filter((t) => !/^\d+$/.test(t));
      const hit = rows.some((c) => terms.some((t) => c.content.toLowerCase().includes(t)));
      return (hit ? rankChunks(rows, terms) : interleave(rows, links)).slice(0, k);
    }
  }
  return rankedSearch(store, ["curriculum"], query, k);
}
