/**
 * seed-concept-cards.ts
 *
 * Seeds the `concept_cards` table with the 37 drawings from the APA Drawings
 * Playbook (docs/product-mastery-track/_drawings-playbook.md).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE=... bun run tools/seed-concept-cards.ts
 *
 * Or fetch the service-role key from the macOS keychain + Management API:
 *   PAT_B64=$(security find-generic-password -s "Supabase CLI" -a supabase -w | sed 's/go-keyring-base64://')
 *   PAT=$(echo "$PAT_B64" | base64 -d)
 *   SUPABASE_SERVICE_ROLE=$(curl -s -H "Authorization: Bearer $PAT" \
 *     "https://api.supabase.com/v1/projects/hgdbflprrficdoyxmdxe/api-keys?reveal=true" \
 *     | python3 -c "import sys,json; print([k['api_key'] for k in json.load(sys.stdin) if k['name']=='service_role'][0])")
 *   bun run tools/seed-concept-cards.ts
 *
 * Idempotent: titles are unique within this seed; existing rows with the same
 * title are skipped (we never overwrite manually edited descriptions).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
if (!SERVICE_ROLE) {
  console.error("SUPABASE_SERVICE_ROLE env var required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

interface SeedCard {
  title: string;
  description: string;
  audience: string[];
  product_type: string[];
  tags: string[];
  sort_order: number;
}

// Audience and product taxonomies must match AUDIENCE_OPTIONS / PRODUCT_OPTIONS
// in src/pages/ConceptCards.tsx exactly.

const cards: SeedCard[] = [
  // ─── Tier 1 — 10 must-memorize core drawings ───────────────────────────
  {
    title: "The 1/3 Rule circle",
    description:
      "Allocation drawing. Draw a circle, divide into 3 equal wedges: short-term (daily expenses), medium-term (renovation/car/wedding/holidays), long-term (retirement + protection). Inside long-term, sub-divide 10-15% risk management + 15-25% wealth accumulation. Write dollar amounts using prospect's actual income.\n\nScript: \"Most people get short-term right. Most over-spend the medium-term slot. Most skip the long-term entirely. The 1/3 rule keeps all three slots funded without overthinking.\"\n\nUse in Phase 2 or Phase 3. Variation: surface imbalance for prospects with high bank savings but no investments.",
    audience: ["General", "Working Adults"],
    product_type: ["General"],
    tags: ["tier-1", "must-memorize", "phase-2", "phase-3", "allocation"],
    sort_order: 1,
  },
  {
    title: "The diversified portfolio pie chart",
    description:
      "DIY-attack drawing. Circle divided across three diversification axes: country (US/Global/Asia/China/India/EM), sector (Tech/Healthcare/Finance/Consumer/Industrials), asset class (Equities/Bonds/REITs/Covered Calls/ELBs). Add three small business-cycle timelines below showing different cycles peak/trough at different times.\n\nScript: \"S&P 500 only diversifies across US large-cap. Real diversification is three dimensions. AIA's Adventurous Index Fund is structurally built across all three.\"\n\nVariation: draw a second circle labelled \"50% China + 50% Tech\" — common DIY mis-allocation. Use in Phase 3 / Phase 4.",
    audience: ["General", "Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-1", "must-memorize", "phase-3", "phase-4", "diy-attack", "diversification"],
    sort_order: 2,
  },
  {
    title: "The 4-quadrant coverage grid",
    description:
      "Canonical CST opener. 2x2 grid: top-left Death/TPD (10-20x annual income), top-right CI/ECI (5-10x, recurring), bottom-left Hospital (full coverage), bottom-right Accident. Each quadrant: current cover (red if gap) + recommended (green). Circle any material gap.\n\nScript: \"Four areas of coverage everyone needs. Let me write what you have and what's recommended. Red = gap to plan for. Green = you're in good shape.\"\n\nVariation: for young prospects with only company insurance, the grid usually shows red in all four boxes — exposes under-coverage.",
    audience: ["General", "Working Adults", "NSF / NS"],
    product_type: ["Term", "Critical Illness", "Medical"],
    tags: ["tier-1", "must-memorize", "phase-1", "phase-2", "coverage", "cst-opener"],
    sort_order: 3,
  },
  {
    title: "The retirement-gap calculation",
    description:
      "Spend today $X/mo → inflated to age 65 (2.5%/yr) = $Y/mo. CPF Life payout $3K/mo. Shortfall = $Y - 3K. Pot needed = shortfall × 12 ÷ 5% dividend yield. Two routes: bank @ 0.5% (huge monthly save needed) vs APA @ 8% (manageable monthly invest).\n\nScript: \"$3,500 today inflates to $11,000 at 65 for the same lifestyle. CPF gives ~$3K. Shortfall $8K/mo = $96K/yr. To generate that at 5% yield you need $1.9M. Bank route: $5K/mo save. APA route: $1.5K/mo invest. Investing isn't optional — it's the only way the math works.\"",
    audience: ["Working Adults", "Pre-Retirees (50-65)"],
    product_type: ["Investment", "Endowment"],
    tags: ["tier-1", "must-memorize", "phase-2", "phase-3", "retirement"],
    sort_order: 4,
  },
  {
    title: "The BTIR comparison (decoupling)",
    description:
      "Restructure drawing. Two boxes side-by-side. Left: \"Whole-life / Hybrid ILP\" with Insurance + Investment sharing same premium, label \"Both jobs done badly\". Right: \"BTIR — Decoupled\" with separate Term cover (~$50/mo) + Pure APA (~$300-450/mo), label \"Same $X/mo, two jobs done well\". Add note: CI claim on Term doesn't touch APA — accumulation keeps compounding.\n\nScript: \"Whole-life does two jobs at once — does neither well. BTIR splits them. CI claim on term doesn't reduce your APA. Accumulation keeps compounding.\"\n\nUse in Phase 4/5 against existing whole-life or hybrid ILP.",
    audience: ["Working Adults"],
    product_type: ["Investment", "Whole Life", "Term"],
    tags: ["tier-1", "must-memorize", "phase-4", "phase-5", "restructure", "btir"],
    sort_order: 5,
  },
  {
    title: "The Term vs Life comparison",
    description:
      "Two-column table. Term: $1,600/yr premium, $500K death + $200K CI till 65, CI claim doesn't reduce cover. Life: $2,400/yr, $200K lifelong, CI claim reduces/eliminates death/TPD cover. Cash value at 65 — Term: $0 (but $800/yr savings × 35yr @ 8% = ~$150K). Life: ~$100-200K. Arrow shows $800/yr from Term flowing into invested box.\n\nScript: \"Lifelong cover of a Life plan is illusory — once you claim CI, cover shrinks. Term + APA gives you both pieces, structurally separate.\"\n\nUse when prospect asks Term vs Life, or when restructuring an old whole-life.",
    audience: ["General", "Working Adults", "Young Adults"],
    product_type: ["Term", "Whole Life"],
    tags: ["tier-1", "must-memorize", "comparison", "restructure"],
    sort_order: 6,
  },
  {
    title: "AIA APA vs S&P 500 / DIY — structural list",
    description:
      "DIY-attack drawing. Two columns, six rows. AIA APA vs DIY (S&P 500 / Tiger / IBKR): dividend tax (None vs 30% US withholding), estate tax (None vs 40% above USD 60K), currency risk (SGD-hedged vs USD depreciation), capital protection on death (100% premiums vs market value), secondary insured (spouse inherits managed policy vs cash lump sum), fund stewardship (Wellington/BlackRock/Baillie Gifford/Capital Group vs you).\n\nScript: \"S&P is great — put it at the top of your wealth pyramid. APA isn't competing on equity exposure. APA is the foundation layer with structural protections DIY can't replicate. Different jobs. Both at the same time.\"",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-1", "must-memorize", "phase-4", "diy-attack"],
    sort_order: 7,
  },
  {
    title: "The Welcome + Loyalty bonus stack",
    description:
      "Fee-objection drawing. Horizontal timeline Y1-Y30+. Y1/Y2/Y3 bars: 15%/18%/20% Welcome Bonus = 53% of annualised premium credited. Y10-Y20: continuous 5% Special Bonus per year. Y21+: 8% Special Bonus. Above the timeline: supplementary charge curve (3.9% Y1-10, 0% Y11+). Cumulative totals: ~$18K-$23K bonus stack over policy life.\n\nScript: \"3.9% charge is real, but there's a 53% Welcome Bonus offsetting Y1-3. From Y10 the Special Bonus credits every year you keep paying. From Y11 the supplementary charge cliffs to 0%. Heavy in Y1-10, zero from Y11 — different category of fee math.\"",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-1", "must-memorize", "phase-4", "apa", "fees"],
    sort_order: 8,
  },
  {
    title: "The hospital-income 'pit' drawing",
    description:
      "Hospital-income closer. Horizontal timeline of working life (25-65). At midpoint, draw a downward dip = \"hospitalisation: 30 days off work\". Left of pit: horizontal line at monthly income ($5K/mo). Inside pit: zero. Calculate dollar value of pit (30 days × $5K ÷ 20 working days = $7,500 lost). Draw second line filling pit at hospital-income payout level ($250/day × 30 = $7,500).\n\nScript: \"Regular hospital plan covers the bill. It doesn't cover the income you lose while warded. Hospital income at $250/day exactly fills the pit. $20-30/mo. Single most useful add-on once you have a regular hospital plan.\"\n\nVariation: self-employed prospects have a deeper pit (no sick pay).",
    audience: ["Working Adults"],
    product_type: ["Medical"],
    tags: ["tier-1", "must-memorize", "hospital", "income"],
    sort_order: 9,
  },
  {
    title: "The before / after restructure",
    description:
      "Close drawing for every restructure case. Two columns: BEFORE and AFTER. List every policy in each column with monthly premium, coverage, projected value at 65. Sum at bottom of each column (monthly outflow, wealth at 65, coverage). Use red ink for gaps in BEFORE. Green ink for improvements in AFTER. Three-line summary: \"Same monthly. More coverage. More cash at 65.\"\n\nLeave this drawing with the prospect. Their family will see it. Re-readable artefact = reduced buyer's remorse.\n\nUse in Phase 5 / 5B for every multi-policy restructure close.",
    audience: ["General"],
    product_type: ["General"],
    tags: ["tier-1", "must-memorize", "phase-5", "restructure", "close"],
    sort_order: 10,
  },

  // ─── Tier 2 — Drawings by appointment phase ────────────────────────────
  {
    title: "The 4-ratio liquidity grid",
    description:
      "Phase 2 Financial Health Check. 2x2 grid with the four ratios: liquidity, asset-to-net-worth, debt-to-asset, solvency. For each, write the prospect's current value, the healthy range, and a green/amber/red indicator. Surfaces specific imbalances objectively.",
    audience: ["Working Adults"],
    product_type: ["General"],
    tags: ["tier-2", "phase-2", "financial-health"],
    sort_order: 11,
  },
  {
    title: "Income / expense waterfall",
    description:
      "Phase 2. Draw monthly income at the top, then a vertical bar showing expenses flowing out (rent, food, transport, etc.). What's left over is the \"investable surplus.\" Quantify it — that's the prospect's budget headroom for new commitments.",
    audience: ["Working Adults"],
    product_type: ["General"],
    tags: ["tier-2", "phase-2", "budget"],
    sort_order: 12,
  },
  {
    title: "The procrastination compounding curve",
    description:
      "Phase 3. Two compounding curves on the same chart. Curve A: starts at age 25, reaches $1M at 65. Curve B: starts at 35 (10 yrs later), only reaches $400K at 65 with double the monthly contribution. Annotate: \"The cost of waiting 10 years isn't 10 years of contribution — it's 60% of your retirement pot.\"",
    audience: ["Young Adults"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-3", "compounding"],
    sort_order: 13,
  },
  {
    title: "The 25-year-old anchor",
    description:
      "Phase 3 for young prospects. $3,000 today × inflation (2.5%/yr) × 40 yrs = $10,000/mo at 65. Then: $10,000/mo × 12 ÷ 5% dividend yield = $2.4M pot needed. Then: $2.4M at 5% yield = $10K/mo dividends for life. Surfaces the magnitude of the long-term gap in concrete dollars.",
    audience: ["Young Adults", "NSF / NS"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-3", "retirement", "young-prospect"],
    sort_order: 14,
  },
  {
    title: "Lump sum vs dividend mode ('3 birds' reveal)",
    description:
      "Phase 3. Three boxes labelled Capital (the pot), Dividends (paid monthly), Bequest (left to family). Draw arrows showing all three flow simultaneously from the same APA. Annotate: \"One plan, three benefits at retirement.\" Best used with pre-retirees who want both income and legacy.",
    audience: ["Pre-Retirees (50-65)", "Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-3", "retirement", "dividend"],
    sort_order: 15,
  },
  {
    title: "Savings vs investing comparison",
    description:
      "Phase 3. Table comparing $1,000/mo saved in the bank (0.5%) vs invested in APA (8%) over 40 years. Bank: $480K. APA: $3.5M. Annotate: \"Same money, $3M difference.\" Simple, dramatic, hard to argue with.",
    audience: ["General"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-3", "comparison"],
    sort_order: 16,
  },
  {
    title: "The supplementary charge curve",
    description:
      "Phase 4. Horizontal timeline Y1-Y30. Above Y1-Y10, a bar at 3.9%. From Y11 onwards, drop the bar to 0%. Annotate: \"AIA: high early, zero forever after. Competitors: low early, perpetual.\" The key contrast that defends APA's fee shape.",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-4", "apa", "fees"],
    sort_order: 17,
  },
  {
    title: "Cost-of-delay compounding (APA bonus stack)",
    description:
      "Phase 4. Same as procrastination curve, but specifically applied to APA's bonus stack: start at 25 vs 30 vs 35, showing cumulative bonus stack difference at 65. Frames \"start now\" not as opinion but as compound math.",
    audience: ["Young Adults"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-4", "apa", "compounding"],
    sort_order: 18,
  },
  {
    title: "Premium holiday / limited-pay variant",
    description:
      "Phase 4. Two scenarios side-by-side. Scenario A: pay $600/mo for 10 years (10-yr IIP), then stop. Scenario B: pay $600/mo continuously to 65. Show cash value at 65 for both. Annotate: \"10-yr IIP is the minimum. Most clients elect to continue paying for the Special Bonus stack.\" Critical for apples-to-apples comparisons.",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-4", "apa", "iip"],
    sort_order: 19,
  },
  {
    title: "Dividend mode mechanic",
    description:
      "Phase 4 for pre-retirees. Horizontal timeline. Years 1-30: a growing bar labelled \"Accumulation phase\" — APA value growing to $1M+ at 60. Year 60 onwards: horizontal bar at $1M, arrows pointing down labelled \"$6,000/mo dividends paid out\". Capital stays same; only dividends flow.",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-4", "dividend", "retirement"],
    sort_order: 20,
  },
  {
    title: "The Three Cost Circles",
    description:
      "Phase 5. Three overlapping circles Venn-style: Insurance / risk management, Investment / wealth accumulation, Lifestyle / current needs. The overlap region is where APA sits — covering risk-management while accumulating wealth, leaving lifestyle untouched. Frames APA's place in the prospect's full financial picture.",
    audience: ["General"],
    product_type: ["General"],
    tags: ["tier-2", "phase-5", "allocation"],
    sort_order: 21,
  },
  {
    title: "Option A / B close",
    description:
      "Phase 5 close. Two boxes labelled \"Option A: $500/mo\" and \"Option B: $800/mo\". Inside each: projected APA value at 65 + projected retirement income. Annotate: \"Both work. A is the floor, B is the path to your stated retirement income goal.\" Lets the prospect pick one — never offers \"no\" as an option.",
    audience: ["General"],
    product_type: ["General"],
    tags: ["tier-2", "phase-5", "close"],
    sort_order: 22,
  },
  {
    title: "Free-advisor / zero-fees structure",
    description:
      "Phase 5 fee-objection drawing. Show the prospect, the APA policy, and AIA's institutional fund managers (Wellington / BlackRock / Baillie Gifford / Capital Group). Annotate: \"You pay AIA for the policy. AIA pays the fund managers. You don't pay an ongoing advisor fee — your financial planner is included.\" Removes the \"how are you paid\" awkwardness.",
    audience: ["General"],
    product_type: ["Investment"],
    tags: ["tier-2", "phase-5", "fees", "structure"],
    sort_order: 23,
  },

  // ─── Tier 3 — Drawings by use case ─────────────────────────────────────
  {
    title: "Hospital plan with / without rider",
    description:
      "Coverage. Two horizontal bars representing a $10,000 hospital bill. Without rider: $3,500 deductible + 10% co-insurance = $4,150 out of pocket. With rider: $0 deductible + 5% co-insurance capped at $3,000 = max $3,000 (often less). Annotate: \"Rider waives deductible, caps co-insurance. Single biggest add-on for hospital coverage.\"",
    audience: ["General"],
    product_type: ["Medical"],
    tags: ["tier-3", "coverage", "hospital", "rider"],
    sort_order: 24,
  },
  {
    title: "Accident vs hospital coverage scope",
    description:
      "Coverage. Venn diagram with two overlapping circles. Hospital plan: covers when warded >=6 hrs or surgery. Accident plan: covers minor injuries without hospitalisation — TCM, sprains, dengue, food poisoning, accidental amputation, accidental death. Overlap region holds most claims; accident plan is much wider for minor incidents.",
    audience: ["General"],
    product_type: ["Medical"],
    tags: ["tier-3", "coverage", "accident", "comparison"],
    sort_order: 25,
  },
  {
    title: "Plan A vs B vs C ward comparison",
    description:
      "Coverage. 3-row table. Plan A: can stay A, B, or C ward (most flexible, most expensive). Plan B: can stay B or C. Plan C: C only. Annotate: \"You can always step down. You can never step up without paying the difference.\" Helps prospects pick the right tier without over-spending.",
    audience: ["General"],
    product_type: ["Medical"],
    tags: ["tier-3", "coverage", "hospital", "ward"],
    sort_order: 26,
  },
  {
    title: "CI / ECI / Relapse buffet analogy",
    description:
      "Coverage. Three buffet tables labelled Major CI / Early CI / Relapse. Major CI: unlimited servings, all 73 CIs covered, 1-yr wait between. Early CI: 5 claims total, all dishes, 1-yr wait. Relapse: 6 specific dishes (heart attack, stroke, organ transplant, cancer, paralysis, +1), each claimable once more, 2-yr wait.\n\nScript: \"Think of CI claims like a buffet. Major CI table has unlimited servings. Early CI is smaller. Relapse is for 6 specific illnesses you might face again.\"",
    audience: ["General"],
    product_type: ["Critical Illness"],
    tags: ["tier-3", "coverage", "ci", "eci"],
    sort_order: 27,
  },
  {
    title: "GPP vs UCC comparison",
    description:
      "Coverage. Two columns. GPP (term): cheaper premium, coverage till specified age (65/75/85), 3X or 2X multiplier, optional ECI rider, no cash value. UCC (whole-life CI): more expensive, coverage to chosen age or lifelong, cash value, multi-claim across 73 CIs / 150 condition-stages.\n\nAnnotate: \"GPP for term protection at lowest cost. UCC for CI cash value + multi-claim depth.\"",
    audience: ["General"],
    product_type: ["Term", "Critical Illness"],
    tags: ["tier-3", "coverage", "ci", "comparison"],
    sort_order: 28,
  },
  {
    title: "Early CI vs Major CI definitions",
    description:
      "Coverage. Timeline of illness progression. Left: early stages (Carcinoma in Situ, Stage 0 cancer, mild stroke). Right: late stages (Stage 3+ cancer, severe stroke). ECI covers everything from left side onwards. Major CI only covers late-stage.\n\nAnnotate: \"ECI is the wider definition. By the time Major CI triggers, treatment costs have already mounted. ECI catches you earlier.\"",
    audience: ["General"],
    product_type: ["Critical Illness"],
    tags: ["tier-3", "coverage", "ci", "eci"],
    sort_order: 29,
  },
  {
    title: "CPF Life FRS / ERS / BRS",
    description:
      "Retirement. Three boxes labelled BRS / FRS / ERS with current dollar amounts (verify year). Inside each: projected monthly payout at 65. BRS: ~$1,000/mo. FRS: ~$1,800/mo. ERS: ~$2,700/mo. Show prospect's projected RA balance at 55 and which sum they'll qualify for. Sets the floor that APA tops up.",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["General"],
    tags: ["tier-3", "retirement", "cpf"],
    sort_order: 30,
  },
  {
    title: "Retirement healthcare funding angle",
    description:
      "Retirement. Two scenarios. Do nothing: OA savings deplete to $0 by 80-85 because hospital plan premiums + out-of-pocket costs eat into them. Bequest at death: $0. Do something: OA → APA/PWV dividend pot. Dividends fund hospital plan premiums. Capital stays intact. Bequest: full capital + ongoing dividends for spouse.\n\nAnnotate: \"Same money. One plan loses it all. The other preserves it for three generations.\"",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["Investment", "Medical"],
    tags: ["tier-3", "retirement", "restructure"],
    sort_order: 31,
  },
  {
    title: "Source-of-funds vs needs (LHS / RHS ledger)",
    description:
      "Retirement / restructure. Vertical line down the middle. LHS: sources of funds (CPF Life, AIA APA dividends, Manulife/GE endowment maturities, rental income) with monthly $ values. RHS: needs (retirement income, hospital plan premium). Subtract at bottom — shortfall or surplus.\n\nAnnotate: \"Existing policies on the left are ammunition, not obstacles. Use them to fund the shortfall.\"",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["General"],
    tags: ["tier-3", "retirement", "restructure", "ledger"],
    sort_order: 32,
  },
  {
    title: "Dividend income vs lump-sum drawdown",
    description:
      "Retirement. Two boxes side-by-side. Box 1 — Drawdown: $1M pot, withdraw $4K/mo, \"pot depletes by age 85\" (downward-sloping line). Box 2 — Dividends: $1M pot, withdraw $5K/mo as 6% yield, \"pot stays at $1M, income flows forever\" (flat line, arrows pointing out).\n\nAnnotate: \"Drawdown is finite. Dividends are infinite. Same starting capital, different sustainability.\"",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["Investment"],
    tags: ["tier-3", "retirement", "dividend", "drawdown"],
    sort_order: 33,
  },
  {
    title: "Whole-life cash-value redirect (pre-retiree)",
    description:
      "Restructure. Existing whole-life as box on left: \"Cash value: $50K (paid-up). Monthly premium: $400/mo.\" Two arrows pointing right: cash value → new APA \"Lump-sum top-up: $48,500 (after 3% top-up charge)\"; monthly premium → same new APA \"Regular premium: $400/mo continuous.\" Project combined value at 65.\n\nAnnotate: \"~$256K at 65 (8%), vs old whole-life's ~$120K cash value at 70.\"",
    audience: ["Pre-Retirees (50-65)"],
    product_type: ["Whole Life", "Investment"],
    tags: ["tier-3", "restructure", "redirect"],
    sort_order: 34,
  },
  {
    title: "Decoupling — term + standalone CI + pure invest",
    description:
      "Restructure. Horizontal line = monthly budget ($500/mo). Below: three separate boxes. Box 1: Pure term — $50/mo, $500K-$1M cover till 65. Box 2: Pure CI/ECI (UCC or GPP) — $100/mo, $200K multi-claim. Box 3: Pure APA — $350/mo, full investment.\n\nAnnotate: \"Each piece does one job. CI claim on Box 2 doesn't touch Box 3. Death claim on Box 1 doesn't touch Box 3. Each piece optimised independently.\"",
    audience: ["Working Adults"],
    product_type: ["Term", "Critical Illness", "Investment"],
    tags: ["tier-3", "restructure", "btir"],
    sort_order: 35,
  },
  {
    title: "Pulsar / Tokio / Manulife net-yield exposure",
    description:
      "Restructure / cross-shop attack. Three columns: Stated projection rate | Fees deducted | Net yield delivered. HSBC Pulsar: 8% → 4.7% net | 4% → 0.83% net. Tokio Marine ILP: 8% → ~4.5% net | 4% → ~1% net. Manulife / single-fund: 8% → ~5% net | 4% → ~1.5% net. AIA APA: 8% → 6.68% net | 4% → 2.74% net.\n\nAnnotate: \"The brochure number is gross. The real number is net of fees. That's where the structural difference shows up.\"",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-3", "restructure", "comparison", "competitor"],
    sort_order: 36,
  },
  {
    title: "168% / 120% startup-bonus gimmick exposure",
    description:
      "Restructure / cross-shop attack. Line chart. Y-axis = policy value. X-axis = years. Competitor (e.g., Pulsar with 168% bonus): shoots up dramatically in Y1-3, peaks, then plateaus or declines as perpetual fees eat away. APA: starts lower (no aggressive startup bonus) but rises steadily as supplementary charge cliffs to 0% and Special Bonus credits accrue. Lines cross around Y10-12. By Y20, APA well above.\n\nAnnotate: \"Startup bonus is real. Perpetual fees are also real. Over 25+ years, the second wins.\"",
    audience: ["Working Adults"],
    product_type: ["Investment"],
    tags: ["tier-3", "restructure", "competitor", "bonus"],
    sort_order: 37,
  },
];

// ─── Seed runner ─────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${cards.length} concept cards...`);

  // Fetch existing titles so we skip duplicates (idempotent)
  const { data: existing, error: fetchErr } = await supabase
    .from("concept_cards")
    .select("title");
  if (fetchErr) {
    console.error("Failed to fetch existing cards:", fetchErr);
    process.exit(1);
  }
  const existingTitles = new Set((existing || []).map((c) => c.title));
  console.log(`  ${existingTitles.size} cards already in DB`);

  const newCards = cards.filter((c) => !existingTitles.has(c.title));
  console.log(`  ${newCards.length} cards to insert`);

  if (newCards.length === 0) {
    console.log("Nothing to seed. Exiting.");
    return;
  }

  const { error: insertErr, count } = await supabase
    .from("concept_cards")
    .insert(newCards, { count: "exact" });

  if (insertErr) {
    console.error("Insert failed:", insertErr);
    process.exit(1);
  }

  console.log(`  ✓ Inserted ${count} concept cards`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
