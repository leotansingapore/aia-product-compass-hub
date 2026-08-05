// Deterministic tiered scorer shared by the global search palette. Extracted
// from LearningSearch, where cmdk's fuzzy default ranked scattered-letter
// matches ("The Lifeblood of Your Business / Productivity Principles") above
// the literal "Business Plan" hit for the query "business plan". Tiers: exact
// phrase in the value (4), phrase in keywords (3.5), every token an exact
// substring (3), then a fuzzy tier (0–2) where each token may
// subsequence-match with typos/omissions — so "prospcting" still finds
// Prospecting, but never outranks a literal hit.

// Subsequence score for one token: 1 for an exact substring, otherwise all the
// token's chars must appear in order; consecutive runs score quadratically so
// near-contiguous matches beat scattered letters. Returns 0–1.
export function fuzzyTokenScore(token: string, hay: string): number {
  if (hay.includes(token)) return 1;
  let ti = 0;
  let streak = 0;
  let score = 0;
  for (let hi = 0; hi < hay.length && ti < token.length; hi++) {
    if (hay[hi] === token[ti]) {
      streak++;
      score += streak;
      ti++;
    } else {
      streak = 0;
    }
  }
  if (ti < token.length) return 0;
  const max = (token.length * (token.length + 1)) / 2;
  return (score / max) * 0.9;
}

// Subsequence matching tolerates omissions ("prospcting") but not
// transpositions ("dashbaord") — swapping two letters breaks in-order
// matching for one of them. Deleting either swapped char restores an in-order
// subsequence, so a one-deletion fallback recovers transposition AND
// insertion typos. Penalised so a typo never outranks a clean match, and only
// attempted when the plain match already failed.
function tokenScoreWithTypo(token: string, hay: string): number {
  const base = fuzzyTokenScore(token, hay);
  if (base > 0 || token.length < 4) return base;
  let best = 0;
  for (let i = 0; i < token.length; i++) {
    const s = fuzzyTokenScore(token.slice(0, i) + token.slice(i + 1), hay);
    if (s > best) best = s;
  }
  return best * 0.7;
}

export function scoreEntry(value: string, search: string, keywords?: string[]): number {
  const q = search.toLowerCase().trim();
  if (!q) return 1;
  const v = value.toLowerCase();
  const kw = (keywords ?? []).join(" ").toLowerCase();
  if (v.includes(q)) return 4;
  if (kw.includes(q)) return 3.5;
  const tokens = q.split(/\s+/);
  let total = 0;
  for (const t of tokens) {
    let s = Math.max(tokenScoreWithTypo(t, v), tokenScoreWithTypo(t, kw));
    // 1–2 char tokens must match literally — subsequence matching on them is
    // pure noise ("of" would light up half the index).
    if (t.length <= 2 && s < 1) s = 0;
    if (s === 0) return 0;
    total += s;
  }
  const avg = total / tokens.length;
  if (avg === 1) return 3;
  // Scattered matches score low and get cut; plausible typos survive.
  return avg < 0.3 ? 0 : avg * 2;
}
