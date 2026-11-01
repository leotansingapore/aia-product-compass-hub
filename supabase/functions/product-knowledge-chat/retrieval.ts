// What the product chat reads: the product's own chunks (training videos and
// documents tagged with its id) plus the curriculum chunks that name the
// product. Curriculum rows carry no product_id (scripts/sync-curriculum-knowledge.mjs),
// so before this the chat never saw the Product Mastery days and answered
// "I don't have" to figures the hub teaches. Every candidate is ranked here,
// in code, before the cut: the old SQL keyword search kept an arbitrary 20 rows
// first (LIMIT with no ORDER BY in 20260224015940).

export interface Chunk {
  content: string;
  source_type: string;
  source_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface Aliases {
  /** Matched case-insensitively as substrings ("Platinum Wealth Venture"). */
  names: string[];
  /** Matched case-sensitively as whole words, so "UCC" never matches "success". */
  acronyms: string[];
}

/** The two reads, so a test can stand in for the database. */
export interface ChunkStore {
  productChunks(productId: string, terms: string[], cap: number): Promise<{ rows: Chunk[]; error: string | null }>;
  curriculumChunks(aliases: Aliases, terms: string[], cap: number): Promise<{ rows: Chunk[]; error: string | null }>;
}

// Short names the curriculum uses for the core products (docs/product-mastery-track).
const SHORT_NAMES: Record<string, string[]> = {
  "pro-achiever": ["APA"],
  "pro-lifetime-protector": ["PLP"],
  "guaranteed-protect-plus": ["GPP"],
  "ultimate-critical-cover": ["UCC"],
  "healthshield-gold-max": ["HSGM", "HSG Max"],
  "solitaire-pa": ["SPA"],
  "platinum-wealth-venture": ["PWV"],
};

const STOPWORDS = new Set(
  ("the and for are was were is can could should would will shall may might must does did has have had " +
    "what whats which when where who whom whose why how this that these those there their them they " +
    "you your our with from into about tell give show explain please any some all also just than then " +
    "its not but use using get got want need much many more most very per " +
    "plan plans product products aia").split(/\s+/),
);

/** Words only, so a name is safe inside a PostgREST filter string. */
const clean = (s: string) => s.replace(/[^A-Za-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export function productAliases(product: { id: string; title?: string | null }): Aliases {
  const slug = product.id.replace(/^core-/, "");
  const title = clean(
    (product.title ?? "")
      .replace(/\(.*?\)/g, " ")
      .replace(/^\s*AIA\s+/i, "")
      .replace(/\s+\d+(\.\d+)*\s*$/, ""),
  );
  const names = [title];
  const fromId = slug.replace(/-/g, " ");
  if (product.id.startsWith("core-") && fromId !== title.toLowerCase()) names.push(fromId);
  return {
    // Five characters or more: a short title would match half the curriculum.
    names: names.filter((n) => n.length >= 5),
    acronyms: SHORT_NAMES[slug] ?? [],
  };
}

/** The question's content words, minus the product's own name (every candidate has it). */
export function queryTerms(query: string, aliases: Aliases): string[] {
  const nameWords = new Set(
    [...aliases.names, ...aliases.acronyms].join(" ").toLowerCase().split(/\s+/),
  );
  const out: string[] = [];
  for (const w of query.toLowerCase().split(/[^a-z0-9$]+/)) {
    if (w.length > 2 && !STOPWORDS.has(w) && !nameWords.has(w) && !out.includes(w)) out.push(w);
  }
  return out.slice(0, 8);
}

/** PostgREST `.or()` filter: content contains any of the terms. Terms are [a-z0-9$] only. */
export const termFilter = (terms: string[]) => terms.map((t) => `content.ilike.%${t}%`).join(",");

/** PostgREST `.or()` filter: content names the product. A superset of aboutProduct. */
export const aliasFilter = (a: Aliases) =>
  [...a.names.map((n) => `content.ilike.%${n}%`), ...a.acronyms.map((x) => `content.like.%${x}%`)].join(",");

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function aboutProduct(content: string, a: Aliases): boolean {
  const lower = content.toLowerCase();
  if (a.names.some((n) => lower.includes(n.toLowerCase()))) return true;
  return a.acronyms.some((x) => new RegExp(`(^|[^A-Za-z0-9])${escapeRe(x)}([^A-Za-z0-9]|$)`).test(content));
}

/**
 * Most relevant first. Each query term found in a chunk adds its rarity among
 * the candidates (log(1 + N/df)), so "minimum" outweighs "premium" in a pile
 * where every chunk says premium; two terms side by side in the chunk, as in
 * the question ("minimum premium"), add a bonus. Ties keep their input order.
 */
export function rankChunks<T extends Chunk>(chunks: T[], terms: string[]): T[] {
  if (terms.length === 0) return [...chunks];
  const lower = chunks.map((c) => c.content.toLowerCase());
  const idf = terms.map((t) => {
    const df = lower.filter((l) => l.includes(t)).length;
    return df ? Math.log(1 + chunks.length / df) : 0;
  });
  const score = (l: string) => {
    let s = 0;
    terms.forEach((t, i) => {
      if (l.includes(t)) s += idf[i];
      if (i > 0 && l.includes(`${terms[i - 1]} ${t}`)) s += Math.max(idf[i - 1], idf[i]);
    });
    return s;
  };
  return chunks
    .map((c, i) => ({ c, i, s: score(lower[i]) }))
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .map((x) => x.c);
}

export const CANDIDATE_CAP = 300;

export async function retrieveChunks(
  store: ChunkStore,
  product: { id: string; title?: string | null },
  query: string,
  k = 12,
): Promise<Chunk[]> {
  const aliases = productAliases(product);
  const terms = queryTerms(query, aliases);
  const hasAlias = aliases.names.length + aliases.acronyms.length > 0;
  const [own, lessons] = await Promise.all([
    store.productChunks(product.id, terms, CANDIDATE_CAP),
    hasAlias ? store.curriculumChunks(aliases, terms, CANDIDATE_CAP) : Promise.resolve({ rows: [], error: null }),
  ]);
  for (const [label, r] of [["product", own], ["curriculum", lessons]] as const) {
    if (r.error) console.error(`product-knowledge-chat ${label} chunks error:`, r.error);
    // shortcut: past the cap the database's order decides what is left out; raise CANDIDATE_CAP or rank in SQL if this logs.
    if (r.rows.length >= CANDIDATE_CAP) console.warn(`product-knowledge-chat ${label} chunks hit the ${CANDIDATE_CAP} cap`);
  }
  const candidates = [...own.rows, ...lessons.rows.filter((c) => aboutProduct(c.content, aliases))];
  return rankChunks(candidates, terms).slice(0, k);
}
