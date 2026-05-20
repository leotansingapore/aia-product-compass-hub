/**
 * caseVault.ts
 *
 * Curated index of all 34 case study receipts shipped across the 7 AIA
 * product-sales tracks. Each case is a real or composite prospect scenario
 * with a verified close — used as drilling material for FCs.
 *
 * Source of truth: aia-product-sales/<product>/day-05.md (Case Study Vault
 * section). When a case is updated in the day-05.md, update the same entry
 * here so the Case Vault page stays in sync.
 *
 * Page consumers: src/pages/CaseVault.tsx
 */

export type CaseProduct =
  | "APA"
  | "PWV"
  | "UCC"
  | "GPP"
  | "HSGM"
  | "SPA"
  | "PLP";

export type CasePlay =
  | "Play A — Whole-life / endowment restructure"
  | "Play B — ILP fee + structure attack"
  | "Play B — Hybrid ILP restructure"
  | "Play C — BTIR fresh start"
  | "Consolidation"
  | "Net-yield attack"
  | "DIY supplement"
  | "Decoupling"
  | "Coverage upgrade"
  | "Retirement income"
  | "Legacy floor";

export interface CaseEntry {
  /** Stable URL slug / anchor reference. */
  id: string;
  /** Short code shown on the card (A, B, U1, H2, etc.). */
  code: string;
  /** Primary product the case closes into. */
  product: CaseProduct;
  /** One-line case title (matches the day-05 H2). */
  title: string;
  /** Prospect type — short label for filters. */
  prospect: string;
  /** Target play. */
  play: CasePlay;
  /** The "anchor" — duration, ticket size, or restructure shape. */
  anchor: string;
  /** Headline receipt — the close, the math, the differential. */
  headline: string;
  /** Tags for filtering — audience, lesson, drawing references. */
  tags: string[];
  /** Concept-card titles used to close this case (cross-link). */
  drawings: string[];
  /** Where to read the full case (anchor in the product-mastery-track). */
  sourcePath: string;
  /** Optional screenshot image (public/case-studies/...). */
  screenshot?: string;
}

export const CASE_PRODUCTS: Record<
  CaseProduct,
  { label: string; slug: string; day5Number: number }
> = {
  // `day5Number` = the global day number (1-35) for that product's day-05.md
  // in the product-mastery-track. Used to construct the learning-track URL,
  // because the learning track is globally numbered, not per-product.
  APA: { label: "Pro Achiever 3.0", slug: "pro-achiever", day5Number: 5 },
  PLP: { label: "Pro Lifetime Protector", slug: "pro-lifetime-protector", day5Number: 10 },
  GPP: { label: "Guaranteed Protect Plus", slug: "guaranteed-protect-plus", day5Number: 15 },
  UCC: { label: "Ultimate Critical Cover", slug: "ultimate-critical-cover", day5Number: 20 },
  HSGM: { label: "HealthShield Gold Max", slug: "healthshield-gold-max", day5Number: 25 },
  SPA: { label: "Solitaire PA", slug: "solitaire-pa", day5Number: 30 },
  PWV: { label: "Platinum Wealth Venture", slug: "platinum-wealth-venture", day5Number: 35 },
};

// Build a /learning-track/product-mastery/day/{N}#anchor URL.
// Anchors are produced by github-slugger from the H2 case heading — must
// match exactly what rehype-slug renders on the day page.
const sourcePath = (product: CaseProduct, anchor: string) =>
  `/learning-track/product-mastery/day/${CASE_PRODUCTS[product].day5Number}#${anchor}`;

export const CASES: CaseEntry[] = [
  // ─── APA — 11 cases ────────────────────────────────────────────────────
  {
    id: "apa-a",
    code: "A",
    product: "APA",
    title: "The Pru Active Life prospect (Play A receipt)",
    prospect: "35-yo whole-life holder",
    play: "Play A — Whole-life / endowment restructure",
    anchor: "$321/mo APA × 30 yrs vs Pru × 30 yrs",
    headline: "Pru: $124K @70 → APA: $338K @65",
    tags: ["restructure", "whole-life", "play-a", "pruvantage", "duration-matched"],
    drawings: [
      "The BTIR comparison (decoupling)",
      "The Term vs Life comparison",
      "The before / after restructure",
    ],
    sourcePath: sourcePath("APA", "case-a--the-pru-active-life-prospect-play-a-receipt"),
    screenshot: "/case-studies/case-a-pru-bundle.png",
  },
  {
    id: "apa-b",
    code: "B",
    product: "APA",
    title: "The FWD Invest First prospect (Play B / fee attack receipt)",
    prospect: "25-yo ILP holder",
    play: "Play B — ILP fee + structure attack",
    anchor: "$600/mo APA × 25 yrs vs FWD × 25 yrs",
    headline:
      "APA $1.19M vs FWD $1.31M @65 — close on absolute. Win on structure + tier-bump to $1K/mo.",
    tags: ["restructure", "ilp", "play-b", "fwd", "fee-attack", "duration-matched"],
    drawings: [
      "AIA APA vs S&P 500 / DIY — structural list",
      "The Welcome + Loyalty bonus stack",
      "The supplementary charge curve",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-b--the-fwd-invest-first-summit-prospect-play-b--fee-attack-receipt"
    ),
    screenshot: "/case-studies/case-b-fwd-tdc.png",
  },
  {
    id: "apa-c",
    code: "C",
    product: "APA",
    title: "The fragmented-coverage young adult (consolidation receipt)",
    prospect: "24-yo, 5 plans",
    play: "Consolidation",
    anchor: "$500/mo APA × 40 yrs continuous",
    headline: "Choice Saver $38K @35 → APA $1.14M @65 (same monthly, ×30 outcome)",
    tags: ["consolidation", "young-adult", "endowment", "duration-matched"],
    drawings: ["The before / after restructure", "Savings vs investing comparison"],
    sourcePath: sourcePath(
      "APA",
      "case-c--the-fragmented-coverage-young-adult-consolidation-receipt"
    ),
  },
  {
    id: "apa-d",
    code: "D",
    product: "APA",
    title: "The pre-retiree cash-value redirect (Play A pre-retiree variant)",
    prospect: "50-yo, paid-up whole-life",
    play: "Play A — Whole-life / endowment restructure",
    anchor: "$400/mo APA × 15 yrs + $50K cash-value redirect",
    headline:
      "$106K monthly slot + ~$150K lump-sum at 65 = ~$256K vs old whole-life $120K @70",
    tags: ["restructure", "pre-retiree", "play-a", "redirect"],
    drawings: [
      "Whole-life cash-value redirect (pre-retiree)",
      "The before / after restructure",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-d--the-pre-retiree-cash-value-redirect-play-a-pre-retiree-variant"
    ),
  },
  {
    id: "apa-e",
    code: "E",
    product: "APA",
    title: "The mid-career peak earner (Welcome tier 1 receipt)",
    prospect: "45-yo, peak earnings",
    play: "Play C — BTIR fresh start",
    anchor: "$1,200/mo APA × 20 yrs continuous",
    headline: "Welcome tier 1 stack ($12K+/yr = 53% Y1-3 bonus) + $550K @65",
    tags: ["btir", "mid-career", "welcome-bonus-tier-1"],
    drawings: [
      "The Welcome + Loyalty bonus stack",
      "The BTIR comparison (decoupling)",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-e--the-mid-career-peak-earner-welcome-tier-1-receipt"
    ),
  },
  {
    id: "apa-f",
    code: "F",
    product: "APA",
    title: "The DIY platform investor (supplement receipt)",
    prospect: "30-yo with $80K in Endowus/StashAway",
    play: "DIY supplement",
    anchor: "$1,000/mo APA × 35 yrs continuous",
    headline: "$1.60M @65 alongside existing DIY (S&P 500 stays — APA is the foundation layer)",
    tags: ["diy", "supplement", "endowus", "stashaway", "young-adult"],
    drawings: [
      "AIA APA vs S&P 500 / DIY — structural list",
      "The diversified portfolio pie chart",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-f--the-diy-platform-investor-supplement-receipt"
    ),
  },
  {
    id: "apa-g",
    code: "G",
    product: "APA",
    title: "The same-money FWD comparison (cross-shop close receipt)",
    prospect: "25-yo deciding FWD vs APA",
    play: "Play B — ILP fee + structure attack",
    anchor: "APA $1,500 × 10 yrs IIP vs FWD $600 × 25 yrs (same $180K total premium)",
    headline: "APA $1.69M vs FWD $1.31M @65 — front-load shape wins",
    tags: ["fwd", "front-load", "iip", "same-money"],
    drawings: [
      "Premium holiday / limited-pay variant",
      "The Welcome + Loyalty bonus stack",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-g--the-same-money-fwd-comparison-receipt-for-the-cross-shop-close"
    ),
  },
  {
    id: "apa-h",
    code: "H",
    product: "APA",
    title: "The HSBC Pulsar net-yield attack",
    prospect: "30-yo with HSBC Pulsar ILP",
    play: "Net-yield attack",
    anchor: "$1,000/mo APA × 25 yrs vs Pulsar",
    headline: "Pulsar net: 0.83% at 4% / 4.7% at 8%. APA: 2.74% / 6.68%. ~70% surrender-value gap.",
    tags: ["pulsar", "hsbc", "net-yield", "gimmick-exposure"],
    drawings: [
      "Pulsar / Tokio / Manulife net-yield exposure",
      "168% / 120% startup-bonus gimmick exposure",
    ],
    sourcePath: sourcePath("APA", "case-h--the-hsbc-pulsar-net-yield-attack"),
  },
  {
    id: "apa-i",
    code: "I",
    product: "APA",
    title: "The Tokio Marine IFA ILP attack",
    prospect: "Prospect sold $2K/mo Tokio Marine by IFA",
    play: "Net-yield attack",
    anchor: '"IFA" gimmick debunk + 30-yr lock attack',
    headline: "Tokio $3.8M vs AIA $5M long-term = $1.2M differential; 30-yr lock-in vs APA 0% from Y11",
    tags: ["tokio", "ifa", "lock-in", "perpetual-fees"],
    drawings: [
      "Pulsar / Tokio / Manulife net-yield exposure",
      "The supplementary charge curve",
    ],
    sourcePath: sourcePath("APA", "case-i--the-tokio-marine-ifa-ilp-attack"),
  },
  {
    id: "apa-j",
    code: "J",
    product: "APA",
    title: "The Manulife Ready Income poor-retirement receipt",
    prospect: "DBS-banker-sold Manulife Ready Income",
    play: "Play A — Whole-life / endowment restructure",
    anchor: "$350/mo APA × 10-yr IIP",
    headline:
      "Manulife $42K @65 + $1.2K/yr income vs APA $267K @65 + ~$2.6K/mo dividend potential",
    tags: ["manulife", "dbs", "banker-channel", "endowment", "income"],
    drawings: [
      "Dividend income vs lump-sum drawdown",
      "Lump sum vs dividend mode ('3 birds' reveal)",
    ],
    sourcePath: sourcePath(
      "APA",
      "case-j--the-manulife-ready-income-poor-retirement-receipt"
    ),
  },
  {
    id: "apa-k",
    code: "K",
    product: "APA",
    title: "The GE Flexi-cash endowment attack",
    prospect: "30-yo sold GE Flexi-cash endowment",
    play: "Play A — Whole-life / endowment restructure",
    anchor: "$500/mo APA × 25 yrs vs GE endowment",
    headline: "GE $200K @55 (break-even Y20, <3% return) vs APA $701K @65 at same money",
    tags: ["ge", "flexi-cash", "endowment", "break-even"],
    drawings: ["Savings vs investing comparison", "The before / after restructure"],
    sourcePath: sourcePath("APA", "case-k--the-ge-flexi-cash-endowment-attack"),
  },
  {
    id: "apa-gm",
    code: "GM",
    product: "APA",
    title: "The Goals Mapper breakthrough ($50/mo intent → $9,600/yr close)",
    prospect:
      "Working adult walking in to increase investments by +$50/mo, has $200K-300K sitting in the bank",
    play: "Retirement income",
    anchor: "Goals Mapper liquidity-fear reframe — two scenarios side by side",
    headline:
      "$50/mo intent → $9,600/yr close (16× the ask). Goals Mapper showed cash runs out at 60 (no investment) vs cash lasts till 85 (with $800/mo invest) — same retirement, dramatically different sustainability.",
    tags: ["goals-mapper", "breakthrough", "liquidity-fear", "16x-upsell"],
    drawings: [
      "The retirement-gap calculation",
      "Dividend income vs lump-sum drawdown",
      "Savings vs investing comparison",
    ],
    sourcePath: sourcePath("APA", "case-gm--the-goals-mapper-breakthrough"),
  },

  // ─── PWV — 5 cases ─────────────────────────────────────────────────────
  {
    id: "pwv-l",
    code: "L",
    product: "PWV",
    title: "The Citibank PIW SGD-redirect",
    prospect: "50-yo with Citibank PIW $300K, USD-denominated",
    play: "Play A — Whole-life / endowment restructure",
    anchor: "PWV / SWB / PGLP / RS comparison",
    headline:
      "Citibank PIW ~3% real return (after FX) vs PWV 3.9-6%+ SGD-domiciled — single-PI close",
    tags: ["citibank", "piw", "usd-fx", "pre-retiree", "sgd-endowment"],
    drawings: [
      "The retirement healthcare funding angle",
      "Source-of-funds vs needs (LHS / RHS ledger)",
    ],
    sourcePath: sourcePath("PWV", "case-l--the-citibank-piw-sgd-redirect"),
  },
  {
    id: "pwv-m",
    code: "M",
    product: "PWV",
    title: "The pre-retiree OA-redirect (retirement healthcare funding)",
    prospect: "58-yo with $185K OA + $52K matured Pru payout",
    play: "Retirement income",
    anchor: "$300K PWV opening",
    headline: "OA → dividend pot for hospital + lifestyle; capital preserved for bequest",
    tags: ["oa-redirect", "cpf", "pre-retiree", "healthcare-funding"],
    drawings: [
      "Retirement healthcare funding angle",
      "Source-of-funds vs needs (LHS / RHS ledger)",
    ],
    sourcePath: sourcePath(
      "PWV",
      "case-m--the-pre-retiree-oa-redirect-retirement-healthcare-funding"
    ),
  },
  {
    id: "pwv-n",
    code: "N",
    product: "PWV",
    title: "The Manulife multi-policy DBS-banker portfolio",
    prospect: "56-yo IT manager — 4 Manulife savings + 1 ILP from DBS bankers",
    play: "Consolidation",
    anchor: "PWV consolidation",
    headline: "Overbought 6 plans across 4 bankers, none servicing; consolidation proposal",
    tags: ["manulife", "dbs", "banker-channel", "consolidation", "single-fund"],
    drawings: [
      "The diversified portfolio pie chart",
      "The before / after restructure",
    ],
    sourcePath: sourcePath(
      "PWV",
      "case-n--the-manulife-multi-policy-dbs-banker-portfolio"
    ),
  },
  {
    id: "pwv-o",
    code: "O",
    product: "PWV",
    title: "The pre-retiree $7.2K/mo retirement target",
    prospect: "50-yo pre-retiree, multi-policy CI + endowment portfolio",
    play: "Retirement income",
    anchor: "$1M PWV target",
    headline: "$7,200/mo retirement target → $1M-1.5M dividend pot",
    tags: ["pre-retiree", "retirement-target", "dividend-mode"],
    drawings: [
      "Dividend income vs lump-sum drawdown",
      "Source-of-funds vs needs (LHS / RHS ledger)",
      "The retirement-gap calculation",
    ],
    sourcePath: sourcePath(
      "PWV",
      "case-o--the-pre-retiree-72kmo-retirement-target"
    ),
  },
  {
    id: "pwv-cy",
    code: "CY",
    product: "PWV",
    title: "The Cynthia breakthrough (2× $36K PWV + 2× $500K PRE + family referrals)",
    prospect: "Couple — Cynthia's first close after 3 months of zero results",
    play: "Retirement income",
    anchor: "2 PWVs + 2 PRE wholes; son + daughter referrals into APA",
    headline:
      "2 × $36K PWV + 2 × $500K PRE; clients then referred son ($12K APA) and daughter ($18K APA). First close drove $150-160K FYC by year-end on cold prospecting alone.",
    tags: ["cynthia", "breakthrough", "couple", "referrals", "cold-prospecting", "first-close"],
    drawings: [
      "Source-of-funds vs needs (LHS / RHS ledger)",
      "Lump sum vs dividend mode ('3 birds' reveal)",
    ],
    sourcePath: sourcePath("PWV", "case-cy--the-cynthia-breakthrough"),
  },

  // ─── UCC — 5 cases ─────────────────────────────────────────────────────
  {
    id: "ucc-u1",
    code: "U1",
    product: "UCC",
    title: 'The "company insurance" exposure (Full Suite close)',
    prospect: "Working adult with company-only insurance",
    play: "Coverage upgrade",
    anchor: "$1M SFT + $300K UCC",
    headline:
      "Company plan: $60K Death / $30K CI = 5-10 months expenses. Closed $4.6K UCC + $1.7K SFT + $1.9K HSG + $224 SPA + $1.7K SFT (Full Suite)",
    tags: ["company-insurance", "under-coverage", "full-suite", "ci"],
    drawings: ["The 4-quadrant coverage grid", "The before / after restructure"],
    sourcePath: sourcePath(
      "UCC",
      'case-u1--the-company-insurance-exposure-full-suite-close'
    ),
  },
  {
    id: "ucc-u2",
    code: "U2",
    product: "UCC",
    title: "The young adult's $200/mo whole-life restructure",
    prospect: "Young adult with $200K whole-life from parents' agent",
    play: "Decoupling",
    anchor: "UCC multi-claim + GPP term",
    headline:
      "$200/mo whole-life → $1.6K/yr UCC + term, $800/yr savings invested = +$100K at retirement, CI cover recurring",
    tags: ["young-adult", "whole-life", "restructure", "decoupling", "parents-agent"],
    drawings: [
      "Decoupling — term + standalone CI + pure invest",
      "The Term vs Life comparison",
    ],
    sourcePath: sourcePath(
      "UCC",
      "case-u2--the-young-adults-200mo-whole-life-restructure"
    ),
  },
  {
    id: "ucc-u3",
    code: "U3",
    product: "UCC",
    title: "The GPP-only upsell to add Early CI",
    prospect: "38-yo with GPP only (no Early CI)",
    play: "Coverage upgrade",
    anchor: "$300K ECI UCC layer",
    headline:
      "GPP-only client → adds Early CI ($1,852-2,185/yr to 65); buffet analogy unlocks '5 servings' reframe",
    tags: ["gpp", "eci", "upsell", "buffet-analogy"],
    drawings: [
      "Early CI vs Major CI definitions",
      "CI / ECI / Relapse buffet analogy",
    ],
    sourcePath: sourcePath(
      "UCC",
      "case-u3--the-gpp-only-upsell-to-add-early-ci"
    ),
  },
  {
    id: "ucc-u4",
    code: "U4",
    product: "UCC",
    title: "The pre-retiree CI restructure to standalone multi-claim",
    prospect: "Pre-retiree with mixed CI riders",
    play: "Decoupling",
    anchor: "$300K UCC + relapse",
    headline:
      "Existing $100K life-plan-bundled CI → $300K multi-claim recurring UCC, savings retained as cash value",
    tags: ["pre-retiree", "ci", "restructure", "multi-claim", "relapse"],
    drawings: [
      "CI / ECI / Relapse buffet analogy",
      "The BTIR comparison (decoupling)",
    ],
    sourcePath: sourcePath(
      "UCC",
      "case-u4--the-pre-retiree-ci-restructure-to-standalone-multi-claim"
    ),
  },
  {
    id: "ucc-u5",
    code: "U5",
    product: "UCC",
    title: "The mixed-portfolio Full Suite restructure (Aviva + GTL + GE → AIA)",
    prospect:
      "Working adult with existing wealth + risk management policies across GE, Aviva, GTL",
    play: "Consolidation",
    anchor: "BTIR decouple → 5-policy AIA suite",
    headline:
      "$4.8K APA + $1.8K UCC + $1.9K HSG + $224 SPA + $1.7K SFT = $10.4K/yr premiums. Added $600K retirement, $150K CI/ECI, $1M D/TPD; all under one roof.",
    tags: ["consolidation", "full-suite", "aviva", "gtl", "ge", "btir"],
    drawings: [
      "The 4-quadrant coverage grid",
      "The before / after restructure",
      "The BTIR comparison (decoupling)",
    ],
    sourcePath: sourcePath(
      "UCC",
      "case-u5--the-mixed-portfolio-full-suite-restructure"
    ),
  },

  // ─── GPP — 3 cases ─────────────────────────────────────────────────────
  {
    id: "gpp-g1",
    code: "G1",
    product: "GPP",
    title: "The 25-yo first-time $1M term buyer",
    prospect: "25-yo first-time term buyer",
    play: "Coverage upgrade",
    anchor: "$1M term till 65",
    headline:
      "$70/mo for $1M Death/TPD cover till 65 (vs whole-life equivalent $250+/mo)",
    tags: ["young-adult", "first-time", "term", "death-tpd"],
    drawings: ["The Term vs Life comparison", "The 4-quadrant coverage grid"],
    sourcePath: sourcePath(
      "GPP",
      "case-g1--the-25-yo-first-time-1m-term-buyer"
    ),
  },
  {
    id: "gpp-g2",
    code: "G2",
    product: "GPP",
    title: "The Singlife Elite Term price comparison",
    prospect: "Singlife Elite Term holder",
    play: "Coverage upgrade",
    anchor: "AIA term + standalone CI comparison",
    headline:
      "Singlife Elite Term $2,550/yr ≈ AIA Death/TPD $713 + CI/ECI multi-claim $1,837 = $2,550 same price, AIA wins on claims service",
    tags: ["singlife", "elite-term", "same-price", "claims-service"],
    drawings: ["GPP vs UCC comparison", "The Term vs Life comparison"],
    sourcePath: sourcePath(
      "GPP",
      "case-g2--the-singlife-elite-term-price-comparison"
    ),
  },
  {
    id: "gpp-g3",
    code: "G3",
    product: "GPP",
    title: "The MINDEF Singlife enlistee",
    prospect: "MINDEF Singlife enlistee",
    play: "Coverage upgrade",
    anchor: "NSF discount disappears post-NS",
    headline:
      "Cheap during NS, but no multi-claim CI, no recurring benefits — needs supplementation post-NS",
    tags: ["nsf", "mindef", "singlife", "post-ns"],
    drawings: ["The 4-quadrant coverage grid", "GPP vs UCC comparison"],
    sourcePath: sourcePath("GPP", "case-g3--the-mindef-singlife-enlistee"),
  },

  // ─── HSGM — 3 cases ────────────────────────────────────────────────────
  {
    id: "hsgm-h1",
    code: "H1",
    product: "HSGM",
    title: "The HSG B-Lite + no rider upgrade",
    prospect: "Prospect with HSG B-Lite, no rider",
    play: "Coverage upgrade",
    anchor: "Rider upgrade + plan upgrade",
    headline:
      "$3,500 deductible exposure + 10% co-pay → with rider, capped at $3K out-of-pocket",
    tags: ["hsg", "rider", "deductible", "b-lite"],
    drawings: ["Hospital plan with / without rider", "Plan A vs B vs C ward comparison"],
    sourcePath: sourcePath(
      "HSGM",
      "case-h1--the-hsg-b-lite--no-rider-upgrade"
    ),
  },
  {
    id: "hsgm-h2",
    code: "H2",
    product: "HSGM",
    title: "The GE P-Optimum private hospital cross-shop",
    prospect: "Prospect with GE P-Optimum",
    play: "Coverage upgrade",
    anchor: "AIA HSGM private vs GE P-Optimum",
    headline:
      "$800/yr AIA Vitalcare A vs $1.1K GE equivalent + GE limitations + pre-auth suspension",
    tags: ["ge", "p-optimum", "private-hospital", "cross-shop", "pre-auth"],
    drawings: ["Hospital plan with / without rider"],
    sourcePath: sourcePath(
      "HSGM",
      "case-h2--the-ge-p-optimum-private-hospital-cross-shop"
    ),
  },
  {
    id: "hsgm-h3",
    code: "H3",
    product: "HSGM",
    title: "The parents' plan upgrade for multi-generational coverage",
    prospect: "Hospital coverage on parents",
    play: "Coverage upgrade",
    anchor: "Parents' plan upgrade for hospitalisation gap",
    headline:
      "$1.3K/yr private B rider for parents — covers what MediShield doesn't",
    tags: ["parents", "multi-generational", "medishield-gap"],
    drawings: ["Hospital plan with / without rider", "Plan A vs B vs C ward comparison"],
    sourcePath: sourcePath(
      "HSGM",
      "case-h3--the-parents-plan-upgrade-for-multi-generational-coverage"
    ),
  },

  // ─── SPA — 3 cases ─────────────────────────────────────────────────────
  {
    id: "spa-s1",
    code: "S1",
    product: "SPA",
    title: "The young Singlife client redirect",
    prospect: "Young Singlife client paying $200/mo for wrong coverage",
    play: "Decoupling",
    anchor: "Cancel wrong plan, redirect to basic medical",
    headline:
      "$200/mo Singlife death/TPD/CI cancelled → $36/mo SPA + HSGM (basic medical)",
    tags: ["young-adult", "singlife", "wrong-coverage", "redirect"],
    drawings: ["The 4-quadrant coverage grid", "Accident vs hospital coverage scope"],
    sourcePath: sourcePath("SPA", "case-s1--the-young-singlife-client-redirect"),
  },
  {
    id: "spa-s2",
    code: "S2",
    product: "SPA",
    title: "The Plan 1 vs Plan 2 upsell",
    prospect: "SPA holder considering tier upgrade",
    play: "Coverage upgrade",
    anchor: "Plan tier upgrade",
    headline:
      "$10/mo more → 2.5× cover for death/disability/dismemberment + more reimbursement",
    tags: ["spa", "upsell", "plan-tiers"],
    drawings: ["Accident vs hospital coverage scope"],
    sourcePath: sourcePath("SPA", "case-s2--the-plan-1-vs-plan-2-upsell"),
  },
  {
    id: "spa-s3",
    code: "S3",
    product: "SPA",
    title: "Parents accident coverage (multi-generational)",
    prospect: "Adult child planning for parents",
    play: "Coverage upgrade",
    anchor: "Multi-generational accident cover",
    headline:
      "$400+/yr accident plan for both parents — covers fall-related injuries MediShield doesn't",
    tags: ["parents", "multi-generational", "accident"],
    drawings: ["Accident vs hospital coverage scope"],
    sourcePath: sourcePath(
      "SPA",
      "case-s3--parents-accident-coverage-multi-generational"
    ),
  },

  // ─── PLP — 3 cases ─────────────────────────────────────────────────────
  {
    id: "plp-p1",
    code: "P1",
    product: "PLP",
    title: "The young adult $200/mo bundled whole-life restructure",
    prospect: "Young adult, $200/mo whole-life from parents' agent",
    play: "Decoupling",
    anchor: "Bundled whole-life → BTIR",
    headline:
      "$200/mo bundled → $1.6K/yr term + UCC + $800/yr APA redirect = +$100K at retirement",
    tags: ["young-adult", "whole-life", "parents-agent", "btir"],
    drawings: [
      "Decoupling — term + standalone CI + pure invest",
      "The BTIR comparison (decoupling)",
    ],
    sourcePath: sourcePath(
      "PLP",
      "case-p1--the-young-adult-200mo-bundled-whole-life-restructure"
    ),
  },
  {
    id: "plp-p2",
    code: "P2",
    product: "PLP",
    title: "The pre-retiree NTUC Living Policy cash unlock",
    prospect: "Pre-retiree with $96K NTUC Living Policy",
    play: "Retirement income",
    anchor: "Cash-value redirect for cash flow",
    headline:
      "Surrender $96K cash value → $500/mo passive income via dividend mode + term keeps cover intact",
    tags: ["pre-retiree", "ntuc", "living-policy", "dividend-mode", "surrender"],
    drawings: [
      "Whole-life cash-value redirect (pre-retiree)",
      "Dividend income vs lump-sum drawdown",
    ],
    sourcePath: sourcePath(
      "PLP",
      "case-p2--the-pre-retiree-ntuc-living-policy-cash-unlock"
    ),
  },
  {
    id: "plp-p3",
    code: "P3",
    product: "PLP",
    title: "When PLP is genuinely the right answer (legacy floor)",
    prospect: "SME owner with legacy floor need",
    play: "Legacy floor",
    anchor: "PLP as legacy stack",
    headline:
      "When NOT to decouple — when PLP genuinely serves the legacy / inheritance / lifelong cover need",
    tags: ["sme", "legacy", "lifelong", "estate-planning"],
    drawings: ["The Term vs Life comparison"],
    sourcePath: sourcePath(
      "PLP",
      "case-p3--when-plp-is-genuinely-the-right-answer-legacy-floor"
    ),
  },
];

/**
 * Derived: all unique tags across the case vault, sorted alphabetically.
 * Used to populate filter chips on the Case Vault page.
 */
export const ALL_CASE_TAGS = Array.from(
  new Set(CASES.flatMap((c) => c.tags))
).sort();

/**
 * Derived: all unique plays across the case vault.
 */
export const ALL_CASE_PLAYS = Array.from(
  new Set(CASES.map((c) => c.play))
).sort();
