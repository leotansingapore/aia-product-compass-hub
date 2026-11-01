// Ranking for knowledge_chunks reads, shared by product-knowledge-chat and
// scripts-chat. The database is asked for every chunk that holds any of the
// question's words (up to CANDIDATE_CAP), and the ranking happens here, in code,
// before the cut: a LIMIT with no ORDER BY keeps whichever rows come back first.

export interface Chunk {
  content: string;
  source_type: string;
  source_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export const CANDIDATE_CAP = 300;

const STOPWORDS = new Set(
  ("the and for are was were is can could should would will shall may might must does did has have had " +
    "what whats which when where who whom whose why how this that these those there their them they " +
    "you your our with from into about tell give show explain please any some all also just than then " +
    "its not but use using get got want need much many more most very per " +
    "plan plans product products aia").split(/\s+/),
);

/** The question's content words: three letters or more, no filler, none of `drop`, at most `max`. */
export function contentTerms(query: string, drop: Set<string> = new Set(), max = 8): string[] {
  const out: string[] = [];
  for (const w of query.toLowerCase().split(/[^a-z0-9$]+/)) {
    if (w.length > 2 && !STOPWORDS.has(w) && !drop.has(w) && !out.includes(w)) out.push(w);
  }
  return out.slice(0, max);
}

/** PostgREST `.or()` filter: content contains any of the terms. Terms are [a-z0-9$] only. */
export const termFilter = (terms: string[]) => terms.map((t) => `content.ilike.%${t}%`).join(",");

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
