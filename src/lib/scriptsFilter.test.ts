// Edge-case battery for the /scripts filter pipeline. Most cases are
// GENERATED: every filter dimension × every value present in a corpus built to
// contain the awkward shapes real data has (missing roles, unknown categories,
// unicode titles, [Name] placeholders, empty versions, duplicate titles).
//
// The three invariants that matter, each of which has been broken in prod:
//   1. Counts never lie: the number a dropdown/suggestion promises for a value
//      equals the number of results selecting that value produces. (D1)
//   2. Filters compose monotonically: adding a filter never ADDS results.
//   3. zeroResultRecovery is honest: every offered escape hatch, when taken,
//      shows exactly the promised number of scripts. (D3)
import { describe, it, expect } from "vitest";
import {
  OFFPAGE_CATEGORIES,
  CATEGORY_LABELS,
  audienceLabels,
  roleLabels,
  categoryLabelText,
  strictMatch,
  strictIncludes,
  matchesScriptSearch,
  applyScriptFilters,
  zeroResultRecovery,
  type FilterableScript,
  type ScriptFilterState,
  type FilterDimension,
} from "./scriptsFilter";

// ---------------------------------------------------------------------------
// Fixture corpus — deliberately awkward shapes.
// ---------------------------------------------------------------------------
let seq = 0;
function script(partial: Partial<FilterableScript> & { stage: string }): FilterableScript {
  seq += 1;
  return {
    id: `s-${seq}`,
    category: "cold-calling",
    target_audience: "general",
    script_role: "consultant",
    tags: [],
    versions: [{ author: "Leo", content: "Hi [Name], quick one." }],
    ...partial,
  };
}

const CORPUS: FilterableScript[] = [
  // one per known ON-page category × a spread of audiences
  script({ stage: "Warm Market — Introduction Text", category: "cold-calling", target_audience: "warm-market", tags: ["introduction", "warm-market"] }),
  script({ stage: "Warm Market — Coffee Catchup Ask", category: "cold-calling", target_audience: "warm-market" }),
  script({ stage: "Cold Call Opening (Telemarketer)", category: "cold-calling", target_audience: "cold-lead", script_role: "telemarketer" }),
  script({ stage: "NSF ORD Planning Call", category: "cold-calling", target_audience: "nsf" }),
  script({ stage: "Recruitment Intro Call", category: "cold-calling", target_audience: "recruitment", script_role: "va" }),
  script({ stage: "First Text After Opt-In", category: "initial-text", target_audience: "cold-lead", tags: ["initial-text"] }),
  script({ stage: "Post-Call Thanks", category: "post-call-text", target_audience: "working-adult", tags: ["post-call"] }),
  script({ stage: "Callback — Missed You", category: "callback", target_audience: "general" }),
  script({ stage: "Follow-Up Day 3", category: "follow-up", target_audience: "young-adult", tags: ["reminder-sequence"] }),
  script({ stage: "Follow-Up Day 7 (Parents)", category: "follow-up", target_audience: "parent", tags: ["reminder-sequence"] }),
  script({ stage: "Lead Gen Ad Reply", category: "ad-campaign", target_audience: "cold-lead", script_role: "va" }),
  script({ stage: "Referral Ask After Review", category: "referral", target_audience: "clients", tags: ["referral"] }),
  script({ stage: "Referral Ask — Warm Intro", category: "referral", target_audience: "warm-market" }),
  script({ stage: "Appointment Confirmation (Zoom)", category: "confirmation", target_audience: "pre-retiree", versions: [{ author: "Jia Min", content: "See you on Zoom at 7pm — link below." }] }),
  script({ stage: "Fact Finding Opener", category: "fact-finding", target_audience: "working-adult" }),
  script({ stage: "Sales Script — Close", category: "sales-scripts", target_audience: "hnw" }),
  // OFF-page categories — must never surface here
  script({ stage: "Servicing Policy Review", category: "servicing", target_audience: "clients" }),
  script({ stage: "Objection — Too Expensive", category: "objection-handling", target_audience: "general" }),
  script({ stage: "FAQ — Is This MLM", category: "faq", target_audience: "general" }),
  script({ stage: "Tips — Tonality", category: "tips", target_audience: "general" }),
  // unknown category from the DB (admin-created)
  script({ stage: "WhatsApp Broadcast Blast", category: "whatsapp-broadcast", target_audience: "clients" }),
  script({ stage: "Video Script — 30s Intro", category: "video-scripts", target_audience: "young-adult" }),
  // awkward shapes
  script({ stage: "No Role Set", category: "follow-up", target_audience: "general", script_role: undefined }),
  script({ stage: "Unknown Role", category: "follow-up", target_audience: "general", script_role: "intern" }),
  script({ stage: "Empty Versions", category: "callback", target_audience: "nsf", versions: [] }),
  script({ stage: "Ünïcode Tïtle — Café Chat ☕", category: "initial-text", target_audience: "young-adult" }),
  script({ stage: "中文脚本 — 保险介绍", category: "cold-calling", target_audience: "parent", versions: [{ author: "Wei", content: "您好，我是AIA的顾问。" }] }),
  script({ stage: "Blanks Script", category: "fact-finding", target_audience: "nsf", versions: [{ author: "Leo", content: "Is this _____? I'm calling about [Product Name] (10% off)." }] }),
  script({ stage: "Regex Chars (a+b)*c?", category: "sales-scripts", target_audience: "general", versions: [{ author: "Leo", content: "Cost is $100 (approx.) — 50% now [T&C apply]" }] }),
  script({ stage: "duplicate title", category: "follow-up", target_audience: "nsf" }),
  script({ stage: "Duplicate Title", category: "referral", target_audience: "nsf" }),
  script({ stage: "Long Content", category: "confirmation", target_audience: "hnw", versions: [{ author: "Leo", content: "start " + "lorem ipsum dolor sit amet ".repeat(400) + " needle-in-haystack end" }] }),
  script({ stage: "Tagged Oddly", category: "ad-campaign", target_audience: "recruitment", tags: ["multi word tag", "émoji-🏷️", "UPPER"] }),
  script({ stage: "No Tags Field", category: "post-call-text", target_audience: "parent", tags: undefined }),
];

const ON_PAGE = CORPUS.filter((s) => !OFFPAGE_CATEGORIES.has(s.category));
const bare: ScriptFilterState = { q: "", category: "all", audience: "all", role: "all", tag: "all" };
const st = (over: Partial<ScriptFilterState>): ScriptFilterState => ({ ...bare, ...over });

const corpusCategories = [...new Set(ON_PAGE.map((s) => s.category))];
const corpusAudiences = [...new Set(ON_PAGE.map((s) => s.target_audience))];
const corpusRoles = [...new Set(ON_PAGE.map((s) => s.script_role || "consultant"))];
const corpusTags = [...new Set(ON_PAGE.flatMap((s) => s.tags || []))];

// ---------------------------------------------------------------------------
// 1. strictMatch semantics — the substring contract people's thumbs rely on
// ---------------------------------------------------------------------------
describe("strictMatch semantics", () => {
  const CASES: Array<[target: string, query: string, match: boolean, label: string]> = [
    ["Warm Market Introduction", "warm", true, "single word"],
    ["Warm Market Introduction", "WARM", true, "uppercase query"],
    ["Warm Market Introduction", "wArM mArKeT", true, "mixed case phrase"],
    ["Warm Market Introduction", "warm ", true, "trailing space"],
    ["Warm Market Introduction", " warm", true, "leading space"],
    ["Warm Market Introduction", "  warm   market  ", true, "spaces everywhere"],
    ["Warm Market Introduction", "market warm", true, "words out of order"],
    ["Warm Market Introduction", "warm intro", true, "two words both present"],
    ["Warm Market Introduction", "warm zebra", false, "one word absent"],
    ["Warm Market Introduction", "warmmarket", false, "words concatenated"],
    ["Warm Market Introduction", "arm", true, "substring inside a word"],
    ["Warm Market Introduction", "", false, "empty query"],
    ["Warm Market Introduction", "   ", false, "whitespace-only query"],
    ["", "warm", false, "empty target"],
    ["Is this _____?", "_____", true, "underscore blank"],
    ["Hi [Name], quick one", "[name]", true, "bracket placeholder"],
    ["Cost is $100 (approx.)", "$100", true, "dollar sign"],
    ["Cost is $100 (approx.)", "(approx.)", true, "parens and dot"],
    ["Regex Chars (a+b)*c?", "(a+b)*c?", true, "regex metachars literal"],
    ["50% now [T&C apply]", "50%", true, "percent"],
    ["50% now [T&C apply]", "t&c", true, "ampersand"],
    ["Café opening line", "café", true, "accented exact"],
    ["Café opening line", "cafe", false, "accent-insensitivity NOT promised"],
    ["中文脚本 — 保险介绍", "保险", true, "CJK substring"],
    ["Emoji ☕ break", "☕", true, "emoji"],
    ["a".repeat(5000), "aaa", true, "very long target"],
    ["short", "s".repeat(300), false, "very long query"],
    ["What's up", "what's", true, "apostrophe"],
    ['He said "hello"', '"hello"', true, "double quotes"],
    ["Line\nbreak content", "break", true, "newline in target"],
    ["Tab\tseparated", "tab", true, "tab in target"],
    ["ALL CAPS TARGET", "all caps", true, "caps target"],
    ["MixedCase", "mixedcase", true, "case folded"],
    ["1234567890", "456", true, "digits"],
    ["v2.0 release", "v2.0", true, "dot in query"],
    ["path/to/thing", "path/to", true, "slash"],
    ["a|b pipe", "a|b", true, "pipe literal"],
    ["back\\slash", "back\\slash", true, "backslash literal"],
    ["question?", "question?", true, "question mark"],
    ["star*star", "star*", true, "asterisk literal"],
    ["caret^", "^", true, "caret literal"],
    ["三个 词 测试", "词 测试", true, "CJK multi word"],
    ["multi  space  target", "multi space", true, "multi-space phrase collapses via word match"],
  ];
  for (const [target, query, want, label] of CASES) {
    it(`${label}: "${query.length > 30 ? query.slice(0, 30) + "…" : query}" vs "${target.slice(0, 30)}"`, () => {
      expect(strictMatch(target, query).match).toBe(want);
      expect(strictIncludes(target, query)).toBe(want);
    });
  }

  it("phrase match outranks scattered-words match", () => {
    expect(strictMatch("warm market", "warm market").score).toBeGreaterThan(
      strictMatch("market says warm", "warm market").score
    );
  });
});

// ---------------------------------------------------------------------------
// 2. matchesScriptSearch — every surface the predicate promises to search
// ---------------------------------------------------------------------------
describe("matchesScriptSearch surfaces", () => {
  const base = script({ stage: "Surface Test", category: "cold-calling", target_audience: "warm-market", script_role: "telemarketer", tags: ["surface-tag"], versions: [{ author: "Author McTest", content: "unique-content-token here" }] });
  const surfaceCases: Array<[q: string, want: boolean, label: string]> = [
    ["surface test", true, "title"],
    ["unique-content-token", true, "version content"],
    ["author mctest", true, "version author"],
    ["surface-tag", true, "tag"],
    ["cold-calling", true, "category key"],
    ["cold calling", true, "category label"],
    ["warm market / friends", true, "audience label"],
    ["friends & family", true, "audience label fragment"],
    ["telemarketer", true, "role label"],
    ["zzz-absent", false, "no surface"],
  ];
  for (const [q, want, label] of surfaceCases) {
    it(`matches via ${label}`, () => {
      expect(matchesScriptSearch(base, q)).toBe(want);
    });
  }

  it("unknown category matches via its title-cased label", () => {
    const s = script({ stage: "X", category: "whatsapp-broadcast" });
    expect(categoryLabelText("whatsapp-broadcast")).toBe("Whatsapp Broadcast");
    expect(matchesScriptSearch(s, "whatsapp broadcast")).toBe(true);
  });

  it("missing role matches the Consultant label (default)", () => {
    const s = script({ stage: "X", script_role: undefined });
    expect(matchesScriptSearch(s, "consultant")).toBe(true);
  });

  it("script with zero versions still matches by title and never throws", () => {
    const s = script({ stage: "Empty Versions Here", versions: [] });
    expect(matchesScriptSearch(s, "empty versions")).toBe(true);
    expect(matchesScriptSearch(s, "anything-else")).toBe(false);
  });

  it("empty and whitespace queries match everything", () => {
    for (const q of ["", " ", "\t", "\n", "   "]) {
      expect(matchesScriptSearch(CORPUS[0], q)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Generated: every dimension × every value — results honour the filter
// ---------------------------------------------------------------------------
describe("generated: single-dimension filters return exactly the matching scripts", () => {
  for (const cat of corpusCategories) {
    it(`category=${cat}`, () => {
      const got = applyScriptFilters(CORPUS, st({ category: cat }));
      expect(got.every((s) => s.category === cat)).toBe(true);
      expect(got.length).toBe(ON_PAGE.filter((s) => s.category === cat).length);
    });
  }
  for (const aud of corpusAudiences) {
    it(`audience=${aud}`, () => {
      const got = applyScriptFilters(CORPUS, st({ audience: aud }));
      expect(got.every((s) => s.target_audience === aud)).toBe(true);
      expect(got.length).toBe(ON_PAGE.filter((s) => s.target_audience === aud).length);
    });
  }
  for (const role of corpusRoles) {
    it(`role=${role}`, () => {
      const got = applyScriptFilters(CORPUS, st({ role }));
      expect(got.every((s) => (s.script_role || "consultant") === role)).toBe(true);
    });
  }
  for (const tag of corpusTags) {
    it(`tag=${tag}`, () => {
      const got = applyScriptFilters(CORPUS, st({ tag }));
      expect(got.every((s) => (s.tags || []).includes(tag))).toBe(true);
      expect(got.length).toBe(ON_PAGE.filter((s) => (s.tags || []).includes(tag)).length);
    });
  }
  it("unknown filter values return zero, never throw", () => {
    expect(applyScriptFilters(CORPUS, st({ category: "no-such-cat" }))).toHaveLength(0);
    expect(applyScriptFilters(CORPUS, st({ audience: "martians" }))).toHaveLength(0);
    expect(applyScriptFilters(CORPUS, st({ role: "ceo" }))).toHaveLength(0);
    expect(applyScriptFilters(CORPUS, st({ tag: "no-such-tag" }))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Generated: every category × audience combo — composition + monotonicity
// ---------------------------------------------------------------------------
describe("generated: category × audience composition", () => {
  for (const cat of corpusCategories) {
    for (const aud of corpusAudiences) {
      it(`category=${cat} + audience=${aud}`, () => {
        const combined = applyScriptFilters(CORPUS, st({ category: cat, audience: aud }));
        const catOnly = applyScriptFilters(CORPUS, st({ category: cat }));
        // every result satisfies BOTH
        expect(combined.every((s) => s.category === cat && s.target_audience === aud)).toBe(true);
        // monotonic: narrowing never adds
        expect(combined.length).toBeLessThanOrEqual(catOnly.length);
        // set-equal to intersecting manually
        const manual = catOnly.filter((s) => s.target_audience === aud);
        expect(combined.map((s) => s.id).sort()).toEqual(manual.map((s) => s.id).sort());
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Generated: counts never lie (D1 regression class)
//    For queries that hit different surfaces, the exclude-dimension count for
//    every value must equal the result of actually selecting that value.
// ---------------------------------------------------------------------------
describe("generated: dropdown counts equal selection results under search", () => {
  const QUERIES = ["", "warm", "cold calling", "follow", "telemarketer", "referral", "介绍", "[name]", "zzz-nothing", "  warm  ", "WARM MARKET", "reminder-sequence"];
  const DIMENSIONS: Array<{ dim: FilterDimension; values: string[]; apply: (f: ScriptFilterState, v: string) => ScriptFilterState }> = [
    { dim: "category", values: corpusCategories, apply: (f, v) => ({ ...f, category: v }) },
    { dim: "audience", values: corpusAudiences, apply: (f, v) => ({ ...f, audience: v }) },
    { dim: "role", values: corpusRoles, apply: (f, v) => ({ ...f, role: v }) },
    { dim: "tag", values: corpusTags, apply: (f, v) => ({ ...f, tag: v }) },
  ];
  for (const q of QUERIES) {
    for (const { dim, values, apply } of DIMENSIONS) {
      it(`q="${q}" · ${dim} counts match selections`, () => {
        const f = st({ q });
        const base = applyScriptFilters(CORPUS, f, undefined, dim);
        for (const v of values) {
          const promised = base.filter((s) =>
            dim === "category" ? s.category === v
            : dim === "audience" ? s.target_audience === v
            : dim === "role" ? (s.script_role || "consultant") === v
            : (s.tags || []).includes(v)
          ).length;
          const actual = applyScriptFilters(CORPUS, apply(f, v)).length;
          expect(actual, `${dim}=${v} under q="${q}"`).toBe(promised);
        }
        // the "All" row equals the unexcluded pipeline with dim inactive
        expect(applyScriptFilters(CORPUS, f).length).toBe(
          base.filter((s) => matchesScriptSearch(s, q)).length
        );
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. OFF-page categories can never leak through any path
// ---------------------------------------------------------------------------
describe("off-page categories never surface", () => {
  const attempts: Array<[string, ScriptFilterState]> = [
    ["direct category select", st({ category: "servicing" })],
    ["faq category select", st({ category: "faq" })],
    ["tips category select", st({ category: "tips" })],
    ["objection-handling select", st({ category: "objection-handling" })],
    ["searching their label", st({ q: "servicing" })],
    ["searching faq", st({ q: "faq" })],
    ["searching tips content", st({ q: "tonality" })],
    ["searching objection title", st({ q: "too expensive" })],
    ["audience that only exists off-page", st({ audience: "clients", q: "policy review" })],
  ];
  for (const [label, f] of attempts) {
    it(label, () => {
      const got = applyScriptFilters(CORPUS, f);
      expect(got.every((s) => !OFFPAGE_CATEGORIES.has(s.category))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Favourites dimension
// ---------------------------------------------------------------------------
describe("favourites filter", () => {
  const favIds = new Set([ON_PAGE[0].id, ON_PAGE[3].id, "ghost-id"]);
  it("returns only favourited scripts", () => {
    const got = applyScriptFilters(CORPUS, st({ favouritesOnly: true }), favIds);
    expect(got.map((s) => s.id).sort()).toEqual([ON_PAGE[0].id, ON_PAGE[3].id].sort());
  });
  it("ids that no longer exist are ignored, not crashed on", () => {
    const got = applyScriptFilters(CORPUS, st({ favouritesOnly: true }), new Set(["ghost-only"]));
    expect(got).toHaveLength(0);
  });
  it("empty favourites set yields empty, not everything", () => {
    expect(applyScriptFilters(CORPUS, st({ favouritesOnly: true }), new Set())).toHaveLength(0);
  });
  it("favouritesOnly composes with category", () => {
    const got = applyScriptFilters(CORPUS, st({ favouritesOnly: true, category: ON_PAGE[0].category }), favIds);
    expect(got.every((s) => favIds.has(s.id) && s.category === ON_PAGE[0].category)).toBe(true);
  });
  it("favouritesOnly without a favourites set is a no-op (loading state)", () => {
    const got = applyScriptFilters(CORPUS, st({ favouritesOnly: true }), undefined);
    expect(got.length).toBe(ON_PAGE.length);
  });
});

// ---------------------------------------------------------------------------
// 8. Generated: zeroResultRecovery honesty (D3 regression class)
// ---------------------------------------------------------------------------
describe("generated: zero-result recovery is honest", () => {
  // build genuinely-zero states by crossing values that never co-occur
  const zeroStates: Array<[string, ScriptFilterState]> = [];
  for (const cat of corpusCategories) {
    for (const aud of corpusAudiences) {
      const f = st({ category: cat, audience: aud });
      if (applyScriptFilters(CORPUS, f).length === 0) {
        zeroStates.push([`${cat}+${aud}`, f]);
      }
    }
  }
  for (const q of ["zzz-nothing", "warm"]) {
    for (const cat of corpusCategories) {
      const f = st({ q, category: cat });
      if (applyScriptFilters(CORPUS, f).length === 0) {
        zeroStates.push([`q="${q}"+${cat}`, f]);
      }
    }
  }
  it("fixture actually produces zero-result states to test", () => {
    expect(zeroStates.length).toBeGreaterThan(10);
  });
  for (const [label, f] of zeroStates) {
    it(`recovery for ${label}`, () => {
      const recs = zeroResultRecovery(CORPUS, f);
      for (const r of recs) {
        expect(r.count).toBeGreaterThan(0);
        // taking the escape hatch shows exactly the promised number
        const cleared: ScriptFilterState = { ...f };
        if (r.dimension === "q") cleared.q = "";
        else if (r.dimension === "category") cleared.category = "all";
        else if (r.dimension === "audience") cleared.audience = "all";
        else if (r.dimension === "role") cleared.role = "all";
        else if (r.dimension === "tag") cleared.tag = "all";
        else cleared.favouritesOnly = false;
        expect(applyScriptFilters(CORPUS, cleared).length, `${label} minus ${r.dimension}`).toBe(r.count);
      }
      // sorted biggest recovery first
      const counts = recs.map((r) => r.count);
      expect([...counts].sort((a, b) => b - a)).toEqual(counts);
      // only ACTIVE dimensions are ever suggested
      const activeDims = new Set<FilterDimension>();
      if (f.q.trim()) activeDims.add("q");
      if (f.category !== "all") activeDims.add("category");
      if (f.audience !== "all") activeDims.add("audience");
      if (f.role !== "all") activeDims.add("role");
      if (f.tag !== "all") activeDims.add("tag");
      if (f.favouritesOnly) activeDims.add("favourites");
      expect(recs.every((r) => activeDims.has(r.dimension))).toBe(true);
    });
  }
  it("no recovery suggestions when results exist", () => {
    // contract: caller only asks on zero results, but a stray call must not
    // fabricate suggestions for a state that has results
    const recs = zeroResultRecovery(CORPUS, bare);
    expect(recs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Generated: search robustness sweep against the whole corpus
// ---------------------------------------------------------------------------
describe("generated: search robustness — never throws, subset invariant holds", () => {
  const NASTY_QUERIES = [
    "", " ", "  ", "\t", "\n",
    "a", "aa", "?", "*", "(", ")", "[", "]", "\\", "^", "$", ".", "|", "+",
    "(((((", ")))))", "[[[[", "]]]]", "\\\\\\", "$^.*+?()[]{}|",
    "'", '"', "`", "''", '""', "‘smart’", "“curly”",
    "🙂", "🙂🙂🙂", "☕", "🏷️",
    "café", "CAFÉ", "保险", "介绍", "中文脚本",
    "<script>alert(1)</script>", "<img src=x onerror=y>", "{{template}}", "${injection}",
    "%20", "%00", "&amp;", "&#x27;",
    "null", "undefined", "NaN", "0", "-1", "1e9",
    "SELECT * FROM scripts", "'; DROP TABLE scripts;--",
    "warm market", "warm  market", " warm market ", "WARM MARKET", "wArM MaRkEt",
    "market warm", "warm zebra market",
    "a ".repeat(50).trim(), "x".repeat(500), ("warm " + "y".repeat(200)).trim(),
    "name]", "[name", "[name]", "_____", "____",
    "follow-up", "follow up", "followup",
    "-", "--", "—", "–",
  ];
  for (const q of NASTY_QUERIES) {
    const shown = q.length > 24 ? `${q.slice(0, 24)}…` : q;
    it(`q=${JSON.stringify(shown)}`, () => {
      const got = applyScriptFilters(CORPUS, st({ q }));
      // subset of the unfiltered on-page corpus, no duplicates
      const ids = got.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(got.every((s) => ON_PAGE.some((o) => o.id === s.id))).toBe(true);
      // blank-ish queries return everything
      if (!q.trim()) expect(got.length).toBe(ON_PAGE.length);
      // whatever comes back genuinely matches
      if (q.trim()) expect(got.every((s) => matchesScriptSearch(s, q))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. Generated: three-dimension stacks — order independence
// ---------------------------------------------------------------------------
describe("generated: filter order independence", () => {
  // applying (cat, aud, role) must equal filtering manually in any order
  const stacks: Array<[string, string, string]> = [];
  for (const cat of corpusCategories.slice(0, 6)) {
    for (const aud of corpusAudiences.slice(0, 5)) {
      for (const role of corpusRoles) {
        stacks.push([cat, aud, role]);
      }
    }
  }
  for (const [cat, aud, role] of stacks) {
    it(`stack ${cat}·${aud}·${role}`, () => {
      const viaPipeline = applyScriptFilters(CORPUS, st({ category: cat, audience: aud, role }));
      const manual = ON_PAGE
        .filter((s) => s.category === cat)
        .filter((s) => s.target_audience === aud)
        .filter((s) => (s.script_role || "consultant") === role);
      expect(viaPipeline.map((s) => s.id).sort()).toEqual(manual.map((s) => s.id).sort());
    });
  }
});

// ---------------------------------------------------------------------------
// 11. Label maps stay consistent with the predicate's expectations
// ---------------------------------------------------------------------------
describe("label map integrity", () => {
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    it(`category label "${label}" is findable for ${key}`, () => {
      const s = script({ stage: "probe", category: key });
      if (!OFFPAGE_CATEGORIES.has(key)) {
        expect(applyScriptFilters([s], st({ q: label })).length).toBe(1);
      } else {
        expect(applyScriptFilters([s], st({ q: label })).length).toBe(0);
      }
    });
  }
  for (const [key, label] of Object.entries(audienceLabels)) {
    it(`audience label "${label}" is findable for ${key}`, () => {
      const s = script({ stage: "probe", target_audience: key });
      expect(applyScriptFilters([s], st({ q: label })).length).toBe(1);
    });
  }
  for (const [key, label] of Object.entries(roleLabels)) {
    it(`role label "${label}" is findable for ${key}`, () => {
      const s = script({ stage: "probe", script_role: key });
      expect(applyScriptFilters([s], st({ q: label })).length).toBe(1);
    });
  }
});
