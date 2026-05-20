/**
 * Canonical appointment flows for FC use.
 *
 * Each flow is a "track" a consultant runs in a real appointment. Pick a track
 * at the opening based on the entry decision, then run the branches.
 *
 * Skeleton seeded from 258 real Fireflies appointments (May 2025–May 2026).
 * Body copy is intentionally short — Leo fills in the canonical script per
 * branch. Cross-link example cases from /case-vault by appending case ids to
 * `exampleCaseIds` on the branch (curated codes like "P1" or real ids like
 * "real-2026-03-14-abc12345").
 */

export type FlowProductCode =
  | "APA"
  | "PWV"
  | "UCC"
  | "GPP"
  | "HSGM"
  | "SPA"
  | "PLP"
  | "CI"
  | "TermLife"
  | "Accident"
  | "Vitality";

export interface FlowBranch {
  /** Stable id used in URL fragments. */
  id: string;
  /** Short branch label e.g. "Foundation stack". */
  label: string;
  /** When to enter this branch — the audience signal / numbers. */
  condition: string;
  /** Recommended product stack (codes for badges). */
  productStack: FlowProductCode[];
  /** One-line receipt pattern the FC should aim to leave the meeting with. */
  receiptPattern: string;
  /** Optional canonical script body (markdown). Leo fills in. */
  body?: string;
  /** Case-Vault case ids that exemplify this branch. */
  exampleCaseIds: string[];
}

export interface AppointmentFlow {
  id: string;
  /** 1-indexed flow number for display. */
  number: number;
  title: string;
  /** Trigger conditions — who this track is for. */
  audienceSignal: string;
  /** The one-line frame the FC uses to open the appointment. */
  anchorFrame: string;
  /** Discovery questions to run before the decision diamond. */
  discoveryQuestions: string[];
  /** The decision branches. */
  branches: FlowBranch[];
  /** Add-ons that apply across branches. */
  addOns: string[];
  /** Approximate count of real appointments matching this flow. */
  realCaseCount: number;
}

export const APPOINTMENT_FLOWS: AppointmentFlow[] = [
  {
    id: "young-coverage-starter",
    number: 1,
    title: "Young Adult — Coverage starter",
    audienceSignal:
      "20s–early 30s, single OR newly married, no/thin existing policies, anchored on protection.",
    anchorFrame:
      "Before we talk wealth, let's get your floor right.",
    discoveryQuestions: [
      "Hospital ward preference (A / B1 / private)",
      "Family CI history",
      "Employer coverage today (yes/no, what level)",
      "Monthly budget for protection (target: 5–8% of take-home)",
      "Vitality eligibility (10% Y1 discount lever)",
    ],
    branches: [
      {
        id: "A-foundation-stack",
        label: "Foundation stack",
        condition: "Has zero personal cover",
        productStack: ["HSGM", "Accident", "TermLife", "CI", "Vitality"],
        receiptPattern:
          "Locked in ~$150-250/mo for hospital + accident + term life ($500K-$1M to age 65), optional standalone early-CI $100-200K.",
        body: `**Two discovery questions before you price anything**
1. "If something happened tomorrow, what ward do you see yourself in - public, A-class, or private?" That answer sets the HSGM tier.
2. "Has anyone in your family had cancer or a stroke before age 60?" That tells you how aggressive the CI sizing should be.

**The order on the page**
Price hospital + accident + term life as a bundle, not three line items. They map to three different fears:
- Hospital bill bankrupts the family
- Accident takes out income overnight
- Death leaves dependants without runway

Show all three numbers together. Total comes out around $150-250/month for someone in their 20s. We have a real case in this branch where a 22-year-old locked $500,000 term life at $42/month - that is the number to anchor on.

**Cancer plan timing**
For anyone hitting a milestone birthday in the next 6 months, frame the urgency on the premium curve, not on fear. Real case: 29-year-old locked $300,000 cancer plan at $150/month - the same plan at age 50 would have been $670/month. That difference is the receipt.

**Vitality**
Mention the 10% Y1 discount only after the bundle is agreed. If they already use the gym, it sells itself.

**Receipt to leave with**
- HSGM tier locked (with ward preference)
- Term life floor: $500K-$1M, to age 65
- Accident plan in place
- Cancer / CI plan, or parked for the next review

**If they push back on the bundle:**
"That's totally fair - three plans does feel like a lot at once. The reason I'd rather not bundle them is that one bundle plan that tries to do all three usually does each part badly. Three thin plans that each cover one risk well is the cheaper version, not the more expensive one. Let me show you the math."`,
        exampleCaseIds: [
          "real-2025-06-22-w77bzs1y",
          "real-2026-01-07-13q1ahvf",
        ],
      },
      {
        id: "B-portable-topup",
        label: "Portable top-up",
        condition: "Has employer cover only (no personal)",
        productStack: ["HSGM", "CI", "Accident", "TermLife"],
        receiptPattern:
          "Locked in ~$80-150/mo portable HSGM rider top-up + standalone early-CI $100-200K so cover doesn't disappear when job changes.",
        body: `**The frame that opens this branch**
Employer cover is rented, not owned. The day they leave the job, the cover leaves with them - and by then their health may have changed enough that the next medical underwriting comes back loaded or excluded.

Open with: "Tell me about your group cover - what ward, what CI lump sum, any rider on top?"

If they don't know the numbers, that's already the move. Most people on employer cover have never read the benefit table.

**What to price**
Two layers on top of the employer plan:
1. **Portable HSGM** - the rider that gives them lifelong private hospital cover regardless of employer. $80-100/month for someone in their 20s.
2. **Standalone early-CI** - $100-200K. Employer CI is almost always single-payout late-stage only; we layer early-stage recurring on top.

Total cost comes out around $80-150/month at this age bracket.

**Real anchor case**
26-year-old on a corporate hospital plan, no personal cover. Surrendered an existing 2% underperforming policy from another provider for $80/month with $100,000 death cover and re-deployed into a portable HSGM + doubled the death cover. Same monthly outlay, much better cover.

**Receipt to leave with**
- Portable HSGM rider booked - works whether they stay or leave the job
- Standalone early-CI $100-200K
- Employer cover treated as redundancy, not as the plan

**If they say "my company already covers me":**
"Totally fair, and you're right that the employer plan is real cover today. The thing I'd want you to know is what happens the day you change jobs - and most professionals change jobs four to five times in their career. The portable plan is what carries through. Worth a 15-minute look at the numbers together?"`,
        exampleCaseIds: [
          "real-2025-08-18-1bb6cjvp",
        ],
      },
      {
        id: "C-recurring-ci-fill",
        label: "Recurring CI gap fill",
        condition: "Has CI accelerator only (single-payout)",
        productStack: ["CI", "HSGM"],
        receiptPattern:
          "Added recurring early-CI layer ~$60-120/mo on top of existing accelerator; HSGM upgrade if ward mismatch.",
        body: `**The diagnosis question**
"Mind if I take a quick look at your CI rider? I just want to check whether it's single-payout or multi-payout."

If they don't know - that is already the move. Most people sold a CI accelerator have never been shown the difference.

**The gap to surface**
A CI accelerator pays once. After that first claim - even early-stage - the CI bucket is gone, and they re-underwrite as a cancer survivor. The premiums after that are either uninsurable or carry exclusions.

Real case: client held only single-payout accelerators across his portfolio. We added a UCC top-up as a recurring early-CI layer - a separate bucket that keeps paying through staged events.

**What to price**
- **Recurring early-CI** standalone (UCC or term-CI), sized 3-5x annual income. At this age bracket the monthly comes in around $60-120/month.
- **HSGM upgrade** only if their existing ward tier doesn't match what they actually want.

**Receipt to leave with**
- Existing accelerator stays (it still covers late-stage)
- Recurring early-CI layer on top - $100-200K to start
- HSGM ward upgraded if mismatch

**If they push back: "I already have CI cover":**
"That makes complete sense - and you do have CI cover. The bit I'd want to double-check together is whether it pays once or pays through. The version that pays once is fine if the first event is the big one - but stage-1 cancer pays out the same as stage-4 cancer on an accelerator, and you'd want a second bucket for the harder one. Worth 20 minutes to map it out?"`,
        exampleCaseIds: [
          "real-2025-05-09-925k5jhn",
        ],
      },
    ],
    addOns: [
      "AIA Vitality (10% Y1 premium discount)",
      "Prenatal / newborn rider (if planning family)",
      "Parent accident transfer",
    ],
    realCaseCount: 41,
  },
  {
    id: "young-investment-starter",
    number: 2,
    title: "Young Adult — Investment starter",
    audienceSignal:
      "20s–early 30s, professional, surplus cashflow, asking about wealth / retirement / 'where to start investing'.",
    anchorFrame:
      "You have one asset — time. Let's show you what 10 years of compounding actually does.",
    discoveryQuestions: [
      "Monthly free cashflow (after rent/CPF/expenses)",
      "Retirement target year + dream lifestyle number",
      "Lump sum sitting in bank earning <3%",
      "CPF-OA balance",
      "Existing protection floor in place? (else cross to Flow 1 first)",
    ],
    branches: [
      {
        id: "A-habit-anchor",
        label: "Habit anchor",
        condition: "Tight cashflow (<$500/mo free)",
        productStack: ["APA", "TermLife"],
        receiptPattern:
          "Started APA $200-300/mo, 10-year minimum + $100K term life floor. Re-review in 12 months to scale.",
        body: `**The shape of this conversation**
The client is interested but their cashflow is tight. The wrong move is to push for a $500-$1,000/month plan and watch them lapse it inside the year. The right move is to start small, lock the habit, and review.

**Run the retirement gap calculation before you price anything**
Pull out the calculator. Use their target retirement age, their lifestyle number, their current savings. The output usually lands somewhere like $2,000-$2,500/month for the next 30 years to hit their dream number.

Real case: the calculator said $2,317/month was needed. The client almost walked. What closed the meeting was reframing: "If we can't do $2,317, what can we do?" Answer: $200/month, committed today, with the agreement to review in 12 months.

**What to price**
- **APA $200-300/month**, 10-year minimum commitment
- **Term life floor**: $100K at age 25 is around $15/month, almost a rounding error

**The number that does the heavy lifting**
At this age, $300/month for 40 years compounding at 6% net is $570,000. Show that calculation - not the dream number, the achievable number.

**Receipt to leave with**
- APA $200-300/month started, 10-year minimum
- Term life floor in place
- Calendar invite for 12-month review locked

**If they hesitate: "It feels like too small to matter":**
"That's totally fair - $200 a month does feel small. The thing I'd want you to know is that the first 10 years of compounding does most of the work. Starting at 25 with $300 a month gets you to $1.5 million at 65; waiting until 35 to start gets you $611,000. That decade is worth $900,000. Worth locking the habit now and scaling later?"`,
        exampleCaseIds: [
          "real-2025-04-14-t9tc4bm4",
          "real-2025-05-06-183yqevb",
        ],
      },
      {
        id: "B-full-stack",
        label: "Full stack",
        condition: "Comfortable ($500-1,500/mo free)",
        productStack: ["APA", "CI", "HSGM"],
        receiptPattern:
          "APA $500-1,000/mo (Pro Achiever) + standalone CI $200-300K (BTIR separation) + HSGM if not already in place.",
        body: `**The frame: BTIR separation**
Buy term, invest the rest. Keep the protection layer and the investment layer separate so they each do one job well. This is the cleanest stack for someone with $500-1,500/month free cashflow.

**Run the gap calculation, then build three layers**
1. **APA $500-1,000/month** (Pro Achiever) - the compounding engine
2. **Standalone CI $200-300K** - critical illness as a separate bucket, not riderised onto the investment plan
3. **HSGM** - if it isn't already in place from a previous review

Total monthly outlay typically lands at $700-1,200/month.

**Why standalone CI matters here**
Real case: client had a combo CI plan at $94/month with $45K coverage. Restructured into standalone CI at $90/month with $150K coverage. Tripled the CI for $4 less per month. That's the kind of receipt the BTIR frame produces.

**Why APA over the alternatives**
Compared head-to-head with the bigger competitors, the Pro Achiever fund switch math projects ~$200,000 more at retirement on the same monthly contribution, driven mostly by the lower management fee. That is the number to draw.

**Receipt to leave with**
- APA $500-1,000/month started, fund tier chosen
- Standalone CI $200-300K
- HSGM tier confirmed or added

**If they ask: "Why three plans, not one?":**
"That's a fair question - the all-in-one is what most people get sold first. The reason I prefer three separate plans is each layer does its job without compromising the others. If you make a CI claim on a combo plan, your investment plan usually takes the hit too. With three separate buckets, the CI claim leaves the investment alone. Want me to show you what that looks like side by side?"`,
        exampleCaseIds: [
          "real-2025-08-29-41stkxk5",
          "real-2025-07-30-tj4tpqra",
        ],
      },
      {
        id: "C-twin-engine",
        label: "Twin-engine",
        condition: "Lump sum + monthly available",
        productStack: ["APA", "PWV"],
        receiptPattern:
          "APA $500-1,000/mo for compounding + PWV single-premium for retirement income angle. Or CPF-OA into CPFIS global equity fund.",
        body: `**The shape of this branch**
Two engines run in parallel: a monthly compounding engine (APA) and a lump-sum engine (PWV single-premium, or CPF-OA deployed via CPFIS). The monthly handles the slow build; the lump sum handles the head start.

**Discovery before you price**
"How much sitting in the bank right now is just there - not your emergency fund, not your next 6 months of expenses, but money you couldn't tell me what it's for?"

That number is the lump-sum side. Most professionals in their late 20s have somewhere between $20K-$100K answering that question - earning savings-account interest, which is sub-inflation.

**The two engines**
1. **APA $500-1,000/month** - monthly compounding, 10-year minimum
2. **Either**:
   - **PWV single-premium** for the lump sum if they want a retirement income angle, or
   - **CPF-OA deployment** into CPFIS global equity if the lump is sitting in CPF

**Real case: the CPF-OA angle**
Client had $40K sitting in CPF-OA earning 2.5%. Reframed a "conservative" 70/30 bond-heavy portfolio as a growth-risk - then deployed the $40K into global equity via CPFIS while keeping a smaller $16,500 buffer rebalanced.

**Real case: the side-by-side comparison**
Client on a $500/month plan from another insurer at higher fees. Side-by-side projection showed AIA Pro Achiever outperforming by $200,000 at retirement on the same contribution. That's the receipt.

**Receipt to leave with**
- APA $500-1,000/month started
- Lump sum deployed (PWV single-premium, OR CPF-OA via CPFIS)
- Annual review locked

**If they say: "I'd rather wait for the market to drop before deploying":**
"Honestly, fair - and that's the instinct most professionals have. The thing the data keeps showing is that time in market beats timing the market by a lot. The compromise that works for most people is to dollar-cost average the lump sum over 6-12 months instead of going in all at once. Same exposure to the growth, much lower regret if the market drops next week."`,
        exampleCaseIds: [
          "real-2025-05-24-vjg8w5ty",
          "real-2025-07-30-tj4tpqra",
        ],
      },
    ],
    addOns: [
      "BTIR fresh-start narrative (separate CI from investment)",
      "Fund tier choice (Pro Achiever sub-funds)",
      "CPF-OA deployment via CPFIS",
    ],
    realCaseCount: 51,
  },
  {
    id: "existing-policy-restructure",
    number: 3,
    title: "Existing Policyholder — Restructure / Review",
    audienceSignal:
      "Has 1+ existing policies; came for review; mentions GE / Pru / Manulife / Income / old AIA portfolio.",
    anchorFrame:
      "Before I recommend anything, let me audit what you have. We're looking for overlap, gaps, and stuck cashflow.",
    discoveryQuestions: [
      "Pull every policy via Singpass / MAS app",
      "Map: premium, coverage, surrender value, maturity year, riders",
      "Identify: (a) gaps  (b) overlaps  (c) underperforming ILPs  (d) cashflow drain",
      "Total premium as % of income (red flag if >15%)",
    ],
    branches: [
      {
        id: "A-play-a-restructure",
        label: "Play A - WL / endowment restructure",
        condition: "Old WL / endowment, no investment exposure",
        productStack: ["APA", "HSGM"],
        receiptPattern:
          "Freed $X/mo from legacy WL into APA + new HSGM. Projected $Y at age 65 vs $Z if kept.",
        body: `**When to use Play A**
The client has an old whole-life or endowment plan from 10-20 years ago. It's paying somewhere between 2-3% projected return. There is no investment-side exposure in the portfolio. The premium is real money - $200-$500/month - and it isn't doing much.

**The audit first**
Pull every policy via Singpass / MAS app. Map for each one:
- Monthly premium
- Sum assured (death / CI)
- Surrender value today
- Projected maturity value
- Maturity year

You are looking for the gap between what the legacy plan projects and what the same monthly contribution could do in a modern structure.

**Real anchor case**
Client had $80/month going into a Link Guard from another insurer - $100,000 death coverage, 2% projected return. Surrendered it, redeployed the same $80/month into AIA cover that doubled the sum assured AND freed $50/month for an investment plan on top. Same monthly outlay, much better trajectory.

**How to draw the comparison**
Three columns on a piece of paper:
1. **Keep** - what the legacy plan delivers at maturity
2. **Surrender** - the surrender value today + redeploy the freed monthly into APA
3. **Net difference** - what column 2 produces minus what column 1 produces

The math almost always favours surrender when the projected return is under 3% and there's 15+ years to retirement.

**Receipt to leave with**
- Legacy plan surrendered or made paid-up
- Same monthly outlay redeployed into APA + new HSGM
- Net projected uplift at 65 written down on paper

**If they hesitate: "I've been paying this for 12 years, I don't want to throw it away":**
"That's totally fair - 12 years of premiums feels like something you don't want to waste. The honest reframe is that the past 12 years are sunk cost either way; what matters is what the next 25 years look like. Keeping the plan just because it has 12 years behind it is the kind of decision that often costs more than starting over. Let me show you the side-by-side and you decide."`,
        exampleCaseIds: [
          "real-2025-08-18-1bb6cjvp",
        ],
      },
      {
        id: "B-play-b-restructure",
        label: "Play B - Hybrid ILP restructure",
        condition: "ILP underperforming (>1.3% mgmt fee)",
        productStack: ["APA"],
        receiptPattern:
          "Fund switch from 1.45% to 1% management fee + monthly top-up = +$200K by age 65 from fee switch alone.",
        body: `**When to use Play B**
The client has an existing ILP. The plan structure is fine - what's broken is the fund underneath. Management fees of 1.3% or higher quietly eat the return; over 30 years a 0.45% fee difference compounds into a six-figure gap.

**The audit move**
Get the fund fact sheet. Find the management fee. If it's above 1.3%, you have a Play B candidate.

Then check the contribution level. Most clients on legacy ILPs have never increased the monthly since they signed - and inflation has done the rest.

**Two moves on the same plan**
1. **Fund switch** - move from the high-fee fund (1.45%) to the modern equivalent (1%)
2. **Top-up the monthly** - the freed-up fee is the budget for the top-up

**The receipt**
Real case: $600/month plan, fund switch from 1.45% to 1% projected $100K-$200K more by age 65 with no change to the monthly outlay. The fund switch alone is the receipt.

**How to draw it**
Two lines on a chart, same horizon:
- Existing fund at 1.45% - end value at 65
- Same monthly at 1% - end value at 65
The wedge between them is the cost of doing nothing.

**Receipt to leave with**
- Fund switch executed
- Monthly contribution raised by the freed-up fee
- Net projected uplift written down on paper

**If they push back: "The fee difference looks small":**
"Honestly, fair - 0.45% does sound small when you say it out loud. The thing that makes the number land is the timeline. On a $600/month plan compounding for 38 years, 0.45% per year becomes about $200,000 by retirement. That's a quarter-million you'd be paying for the same fund family. The fix is the fund switch - same plan, same monthly, different sleeve."`,
        exampleCaseIds: [
          "real-2025-05-20-5qrkrp6k",
        ],
      },
      {
        id: "C-ci-recurring",
        label: "CI recurring layer",
        condition: "Single-payout CI only",
        productStack: ["CI"],
        receiptPattern:
          "Added early-CI standalone layer sized to 3-5x annual income on top of existing accelerator.",
        body: `**The same gap that shows up in Flow 1, now on a fuller portfolio**
The client has an active portfolio - hospital, accident, ILP - but the CI is single-payout only, usually riderised onto a whole-life or endowment plan as an accelerator.

**The diagnostic question**
"Mind if I check your CI rider real quick? I want to confirm whether it pays once or pays through."

**The gap to surface**
If their CI is an accelerator, the first claim - even an early-stage cancer - empties the bucket. After that they cannot re-buy CI cover cleanly because they're now a survivor with health loadings. The window to top up is now, while underwriting is clean.

**What to price**
A standalone recurring early-CI layer (UCC or term-CI), sized 3-5x annual income, on top of the existing accelerator. Don't touch the accelerator - it still covers late-stage. The new layer covers the staged events.

**Receipt to leave with**
- Existing accelerator stays in place
- Recurring early-CI layer added at 3-5x income
- Underwriting cleared while health is current

**If they say: "I already have CI cover":**
"That makes complete sense - and you do have CI cover. The bit I'd want to double-check together is whether it pays once or pays through. If the first event is a stage-1 cancer and we treat it, your CI bucket is empty - and the next round of underwriting is much harder. The standalone recurring layer is what keeps paying through. Worth 20 minutes to map both buckets together?"`,
        exampleCaseIds: [
          "real-2025-05-09-925k5jhn",
        ],
      },
      {
        id: "D-consolidate-decouple",
        label: "Consolidation / decoupling",
        condition: "Premium > 15% of income, or scattered policies",
        productStack: ["HSGM", "TermLife"],
        receiptPattern:
          "Consolidated $2K+/mo scattered policies and decoupled HSGM. Flipped premium outflow into projected passive income.",
        body: `**When to use this branch**
The client has 5+ policies across 2-3 providers, accumulated over a decade. Premium is now over 15% of income and they no longer remember what each plan does. The instinct is to add more cover - the actual move is to consolidate first.

**The audit is the meeting**
Bring a single sheet of paper. One column per policy:
- Provider, plan name, monthly premium
- What it covers (death / CI / hospital / investment)
- Surrender value today
- Maturity year

By the end of the audit the client can usually see the overlap themselves. Two life plans both covering the same death event. Two CI plans, both single-payout, that should be one recurring layer. A hospital plan whose ward tier no longer matches what they actually want.

**Real anchor case**
Client had $2,000+/month in scattered premium outflows across multiple providers. We consolidated the death cover, decoupled HSGM, and redeployed the difference into a dividend portfolio. The flip from outflow to passive income worked out to roughly $4,000/month in projected dividend on the restructured portfolio.

**The decoupling move**
For couples, HSGM premiums are often cheaper when each life is rated separately rather than as a household. Pull both quotes; if the decoupled version saves $50-150/month, that's the recommendation.

**Receipt to leave with**
- Scattered policies mapped on one sheet
- Overlap identified and named
- Consolidation plan with date locked
- Decoupling savings quantified

**If they hesitate: "Won't surrendering some of these cost me money?":**
"That's a fair concern - and the answer is sometimes yes, sometimes no, depending on the plan and how long it's been running. The decision isn't 'surrender or keep' - it's 'is what I'm paying for each of these plans the best version of that cover today?' For some plans the answer is yes and we leave them; for others, the freed monthly buys you better cover in a single, cleaner structure. Let me work through them one at a time with you."`,
        exampleCaseIds: [
          "real-2025-11-23-5m0qgc4y",
        ],
      },
      {
        id: "E-targeted-topup",
        label: "Targeted top-up",
        condition: "Portfolio is fine - just identified gaps",
        productStack: ["CI", "HSGM", "Accident"],
        receiptPattern:
          "Filled the specific gap identified in the audit ($X/mo). Full review scheduled in 12 months.",
        body: `**When to use this branch**
The audit is clean. The client has a sensible portfolio: protection in place, investment running, hospital sorted. There's one specific gap - usually CI under-sizing, or hospital ward mismatch, or a missing accident plan.

**Don't restructure for the sake of restructuring**
The temptation is to find more things to upgrade because the client is engaged. Resist it. A clean portfolio with one identified gap deserves a one-product close, not a five-product proposal.

**Real anchor case**
A 6-year client returned for a full coverage review. The audit surfaced CI under-sizing and a hospital plan that needed verifying against the existing other-provider app. The honest receipt was: "Your portfolio is solid - here is the one gap, here is the cost to fill it, and the next review is in 12 months." No upsell. That kept the client and produced 3 referrals over the next quarter.

**What to price**
- **CI top-up** at 3-5x income if under-sized
- **HSGM tier adjustment** if ward mismatch
- **Accident plan** if missing
Whichever is the identified gap - one product, not three.

**Receipt to leave with**
- The specific gap filled
- Confirmation of what is already working in the portfolio
- Next review date locked at 12 months

**If they ask: "Is there anything else I should be doing?":**
"Honestly, your portfolio is in good shape - the one gap we filled today is the one that mattered. The next thing to look at is in 12 months when we review your income, your dependants, and whether the gap math still holds. I'd rather you spend that monthly on something that compounds than buy more cover for the sake of buying it."`,
        exampleCaseIds: [
          "real-2025-03-22-tvvqt2qv",
        ],
      },
    ],
    addOns: [
      "Decoupling for HSGM premium efficiency",
      "Parent transfer / child policy carve-out",
      "Pro Achiever fund-tier switch within existing ILP",
    ],
    realCaseCount: 98,
  },
  {
    id: "pre-retiree-income-floor",
    number: 4,
    title: "Pre-Retiree — Retirement income floor",
    audienceSignal:
      "45+, asking about retirement; 'is CPF Life enough?'; spouse retiring soon; lump sum sitting idle.",
    anchorFrame:
      "Let me show you the CPF Life cliff first — then you decide if you want a floor under it.",
    discoveryQuestions: [
      "Target retirement age + monthly income need",
      "CPF balance (OA, SA, RA) + FRS / ERS status",
      "Other liquid assets (property, equities, cash)",
      "Dependants still on payroll",
      "Legacy / bequest priority (yes / no / conditional)",
    ],
    branches: [
      {
        id: "A-apa-to-pwv-bridge",
        label: "APA aggressive to PWV bridge",
        condition: "Still has 10+ years to retire",
        productStack: ["APA", "PWV", "HSGM"],
        receiptPattern:
          "10 yrs APA $X/mo to build pot, convert to PWV income stream at 60-65. HSGM lifelong locked at current health.",
        body: `**The frame**
The client is 45-55 and still earning well. There are 10-15 years to retirement. The job is to build the pot now and switch to income later - one plan that grows, then another that pays.

**Two-phase architecture**
- **Phase 1 (years 1-10)**: APA aggressive monthly contribution into a growth-tilted fund. The goal is end-of-phase capital.
- **Phase 2 (year 10 onward)**: Convert into PWV for dividend-paying income through retirement.

You don't have to sell both plans today. You sell the APA today and book the PWV conversation for year 8.

**Real anchor case**
38-year-old QS with $3K monthly surplus, looking at a $6K/month retirement gap. Opened a $500/month APA projecting $1.17M at age 67. The plan didn't try to close the full gap in one move - it locked the growth engine and committed to the year-8 review for the PWV side.

**The HSGM lock**
This branch always includes locking HSGM lifelong while health is current. The client is past 45; if they leave the upgrade for "later", "later" means with health loadings or exclusions. Lock it now.

**Receipt to leave with**
- APA monthly committed - growth fund chosen
- HSGM lifelong rider locked at current health
- Year-8 PWV conversion conversation booked in writing

**If they say: "Why don't I just pump everything into a single big plan now?":**
"That's totally fair, and a few people do it that way. The reason I'd separate the two phases is the math: a growth-tilted fund for the first 10 years compounds harder than a dividend-paying structure, and a dividend-paying structure delivers more reliable income in retirement than a growth fund. Each phase has the right tool. Cleaner that way, and we don't lock you into the income structure before we know what your retirement number actually is."`,
        exampleCaseIds: [
          "real-2025-12-12-jag9v0r4",
        ],
      },
      {
        id: "B-cpf-vs-pwv",
        label: "CPF top-up vs PWV comparison",
        condition: "CPF FRS not yet hit",
        productStack: ["PWV"],
        receiptPattern:
          "Side-by-side: CPF Life ERS locked vs PWV with dividend continuation + bequest. Client typically chooses partial top-up + PWV combo.",
        body: `**The opener that does most of the work**
"Let me show you the CPF Life cliff first - then you decide if you want a floor under it."

Pull up the CPF Life projection. Show the monthly payout. Then show the curve where capital depletes around age 81, with no bequest. That picture is the anchor.

**The side-by-side**
Three columns on the board:
1. **CPF Life ERS** - monthly payout, locked, depletes around 81, no bequest
2. **PWV equivalent lump** - monthly payout (often lower), dividend continues, bequest stays intact
3. **Combo** - partial CPF top-up + PWV for the rest

Most clients choose Column 3 once they see it laid out. The combo gives the security floor that CPF provides AND the legacy upside that PWV provides.

**Real anchor case**
Pre-retiree faced a $5,339/month income gap after CPF Life. We mapped a $1M managed portfolio at 6% yield against the existing $500-600/month premium outflows, restructured the policies, and built a combo that closed the gap with bequest intact.

**Where the math matters most**
For someone hitting CPF FRS at 55 with another 10+ years of work ahead, the lump sum doesn't have to go all into CPF top-up. The portion above FRS that would have gone into ERS top-up often does better in PWV - same risk profile, dividend continues, bequest preserved.

**Receipt to leave with**
- CPF Life vs PWV table drawn on paper
- Combo strategy agreed (which portion goes to top-up, which to PWV)
- Bequest impact quantified

**If they say: "CPF Life is the safe option, isn't it?":**
"Totally fair - and CPF Life is genuinely safe. The bit I'd want you to know is what 'safe' costs you. The lump you put into ERS to push the payout from FRS to ERS level - that lump is locked, it stops paying around 81, and there's no bequest from it. The same lump in PWV pays a similar amount, keeps paying through 90+ as long as the underlying does, and the bequest stays intact. Both options are real - I just want you choosing with the trade-off on the table."`,
        exampleCaseIds: [
          "real-2026-03-03-zd5j2hfc",
        ],
      },
      {
        id: "C-single-premium-floor",
        label: "Single-premium income floor",
        condition: "FRS done + lump sum available",
        productStack: ["PWV", "SPA"],
        receiptPattern:
          "Lump sum into dividend-paying tranche. $X lump produces $Y/mo for life + legacy of $Z.",
        body: `**The shape of this client**
CPF FRS is done. There's a lump - usually $100K-$1M+ - sitting in fixed deposits or low-yield bonds. The client doesn't need the lump to grow aggressively; they need it to start paying.

**The product question is simple**
PWV single-premium for most cases. SPA for the conservative end of the spectrum (capital-guaranteed, lower yield). The choice is yield appetite vs guarantee level.

**Real anchor case 1 - the dividend engine**
$58,000-$60,000 lump deployed into an income portfolio at 6% annual dividends, structured to offset projected parental hospitalisation premiums. The capital stayed intact, the dividend covered the parents' hospital plan effectively for free. That receipt closes meetings.

**Real anchor case 2 - the larger lump**
CPF-OA eligible client put $60,000+/year in a 5-year structured PWV commitment producing 6-7% dividend income. Bridge built between a $3,600-$4,600/month retirement gap and a $12,000/month dream lifestyle target.

**How to draw this on paper**
Three lines:
1. Lump sum today: $X
2. Monthly dividend / income produced: $Y/month
3. Capital remaining at age 90: still close to $X (or higher if compounding stays in)

The "still close to $X" line is the legacy column. That's the line most retirees haven't seen before.

**Receipt to leave with**
- Lump deployed (PWV / SPA), tranche chosen
- Monthly income generated written down on paper
- Legacy capital projected at 85 / 90

**If they push back: "What if the market drops the year I deploy?":**
"That's a real concern, and the way most clients solve it is by tranching the deployment - we put part of the lump in now, the rest over the next 6-12 months. Same exposure to the dividend stream, much less timing regret. Let me show you the schedule."`,
        exampleCaseIds: [
          "real-2025-11-30-89hznpxt",
          "real-2025-11-30-chw63qqt",
        ],
      },
      {
        id: "D-legacy-floor",
        label: "Legacy floor",
        condition: "Legacy-priority client",
        productStack: ["PWV", "UCC"],
        receiptPattern:
          "PWV with bequest emphasis + UCC top-up to lock final coverage. Trust / nomination conversation queued.",
        body: `**The frame**
This client doesn't need income from the lump. They have other income sources - rental, business equity, spouse still working. What they want is a clean legacy: a defined number going to defined people, with no probate friction.

**The discovery questions**
- "What's the number you'd want to leave behind, in today's dollars?"
- "Who are the beneficiaries - and do you want it equal, or weighted?"
- "Have you done CPF nomination, or named beneficiaries on each policy?"

Most clients can answer the first two; most can't answer the third confidently. That's where the work is.

**The structure**
- **PWV with bequest emphasis** - lump deployed into a dividend-paying structure where the capital column remains intact for legacy
- **UCC top-up** - lock final whole-life coverage at current health for the additional legacy buffer
- **Nomination / trust review** - separate work session, often with a lawyer if the legacy is complex

**Receipt to leave with**
- Legacy target number written down
- PWV legacy structure proposed
- UCC top-up sized
- Nomination review scheduled separately

**If they say: "Isn't a will enough?":**
"That's totally fair - a will does cover it. The reason I bring up nominations alongside is that insurance and CPF don't pass through the will - they go directly to whoever is nominated, or by default rules if no one is. So you can have a clear will and still have the wrong person collect on the insurance because the nomination wasn't updated. Worth a 30-minute session just to confirm both align."`,
        exampleCaseIds: [
          "real-2025-11-23-5m0qgc4y",
        ],
      },
    ],
    addOns: [
      "HSGM lifelong (lock at current health)",
      "Spouse second-life PWV",
      "CI bridging until retirement",
    ],
    realCaseCount: 53,
  },
  {
    id: "coverage-gap-audit",
    number: 5,
    title: "Coverage Gap Audit (event-triggered)",
    audienceSignal:
      "Came in with a specific fear / event: 'my colleague got CI', 'CI definition tightening', 'we just had a baby', 'my dad was hospitalised'.",
    anchorFrame:
      "Tell me what scared you. We'll fix that gap first, then look at the rest.",
    discoveryQuestions: [
      "What was the trigger event?",
      "Family history connected to the trigger?",
      "Current cover for that specific risk?",
      "Budget tolerance (this is usually a hot lead)",
    ],
    branches: [
      {
        id: "A-standalone-ci",
        label: "Standalone CI",
        condition: "CI tightening / family CI event",
        productStack: ["CI"],
        receiptPattern:
          "Locked CI $100-300K before definition change deadline; sized 3-5x annual income.",
        body: `**The trigger**
Either: a CI definition change is coming (industry-wide tightening usually publicised 6-12 months ahead), or someone in the client's circle - a colleague, a parent, a sibling - was just diagnosed.

This is the hottest lead pattern in the practice. The conversation doesn't need to be sold; it needs to be structured before the urgency fades.

**The opener**
"Tell me what scared you."

Let them talk. Don't pitch. The diagnosis story or the article they read about the CI tightening is the anchor; your job is to make sure the cover they buy matches the fear they walked in with.

**The sizing**
3-5x annual income for the standalone CI layer. Anchor on income replacement, not on a round number.

**Real anchor case**
29-year-old with a milestone birthday approaching. Locked $300,000 cancer plan at $150/month before his 30th birthday. The same plan at age 50 would have been $670/month. Showing him the premium curve on paper - what it costs today vs what it costs at 50 - was what closed the meeting.

**The definition-change angle (use only when real)**
When CIRA or industry CI definitions tighten, plans bought before the cutover date are grandfathered under the old definitions. If a cutover is genuinely coming, name the date and the deadline. Do not invent urgency.

**Receipt to leave with**
- Standalone CI $100-300K locked
- Premium curve shown on paper (cost today vs cost in 10/20 years)
- Underwriting timeline confirmed

**If they hesitate: "Let me think about it":**
"Honestly, fair - this is a real decision. The one thing I'd want you to know before you walk away is that the premium curve doesn't pause while you think. Whatever you decide, the rate you get today is the rate today's health buys you. If you'd prefer to take the medicals now to lock the rate and decide on coverage size after, that works too. The cost is zero and the option stays open."`,
        exampleCaseIds: [
          "real-2026-01-07-13q1ahvf",
        ],
      },
      {
        id: "B-hsgm-tier-up",
        label: "HSGM tier-up",
        condition: "Hospital admission story",
        productStack: ["HSGM"],
        receiptPattern:
          "Upgraded ward + lifelong rider. Decoupled from spouse if it improves rate.",
        body: `**The trigger**
A parent was admitted to hospital and the bill was visible. Or the client themselves had a recent admission. Or a colleague's story is fresh.

**The discovery**
- "What ward are you currently on?"
- "Was the recent admission in the ward you'd want for yourself?"
- "What does the rider on top look like - co-pay, deductible, lifetime limit?"

Most people on a base hospital plan have never read the rider. The audit is the meeting.

**The move**
Two adjustments, often together:
1. **Ward tier up** - move from public/B1 to A-class or private if mismatch
2. **Lifelong rider** - lock the lifelong rider while underwriting is clean

**Real anchor case - the Medisave-funded version**
First-time buyer with zero existing coverage signed an HSGM Plan B at $314/year (~$25/month), 100% Medisave-funded. Zero cash outlay. That receipt closes the conversation for cash-conscious clients.

**The decoupling check**
For married couples, run the HSGM premium quote both as a household and as decoupled (each life rated separately). If the decoupled version saves $50-150/month, that's the recommendation.

**Receipt to leave with**
- Ward tier confirmed or upgraded
- Lifelong rider added (or confirmed)
- Decoupling savings quantified if applicable
- Premium funding source confirmed (Medisave / cash)

**If they say: "But I haven't been admitted, it might be a waste":**
"Totally fair - and the honest answer is most people don't get admitted in any given year. The reason I push for the ward tier is that hospital coverage is the one thing you can't buy retrospectively after the admission. If you stay healthy, the premium is small. If you don't, the gap between the ward you have and the ward you'd want is the gap that becomes a real bill. Worth getting the ward right while you can."`,
        exampleCaseIds: [
          "real-2025-07-12-bqp86ekh",
        ],
      },
      {
        id: "C-term-or-wl-riders",
        label: "Term / WL with riders",
        condition: "Death / disability event",
        productStack: ["TermLife", "CI"],
        receiptPattern:
          "Income replacement + disability + early-CI riders. Decoupling for mortgage protection if applicable.",
        body: `**The trigger**
A friend or colleague died young, or had a disability event - stroke, accident, severe injury - and the financial fallout was visible. The client is now thinking about their own dependants and mortgage.

**The two questions to ask first**
1. "Who would the income loss hit hardest if it happened to you tomorrow?"
2. "What's the outstanding mortgage on the property?"

The first question sizes the income replacement layer. The second sizes the mortgage-protection layer. These are different numbers and they need different plans.

**The structure**
- **Term life** sized for income replacement (10-15x annual income, to age 65)
- **CI rider or standalone** for early-stage cover (3-5x income)
- **Disability rider** if profession is high-risk or income is single-source
- **Mortgage decoupling** for couples where the mortgage is in joint names

**Real anchor case**
Client held a combo CI/death/savings plan at $1,000/yr with $100K coverage, plus an ASCC at $1,900/yr. The combo had a forfeiture clause that emptied the savings if CI was triggered. We decoupled into separate plans: pure CI, pure death cover, pure savings. Each layer paid independently.

**Receipt to leave with**
- Income replacement plan sized to dependants' runway
- Mortgage protection layer separate from income replacement
- Disability rider added if profession warrants it
- Existing combo plans audited for forfeiture clauses

**If they say: "My CPF and existing life cover should be enough":**
"Honestly, fair to check that first. The thing I'd want to do together is map the actual numbers - CPF balance, existing life cover, mortgage outstanding, dependants' runway. We can do it in 30 minutes. If the gap is small, we close the conversation; if it's bigger than you thought, we fill it. Either way, you walk out knowing where you stand."`,
        exampleCaseIds: [
          "real-2025-08-13-05txsa0v",
        ],
      },
      {
        id: "D-family-floor",
        label: "Family floor package",
        condition: "Newborn / new family member",
        productStack: ["HSGM", "Accident", "TermLife"],
        receiptPattern:
          "Child policy + prenatal/birth rider + HSGM for child locked before age 1 + parent accident transfer.",
        body: `**The trigger**
Baby on the way, baby just arrived, or older child reaching school age. This is one of the cleanest "fix the floor" conversations because every gap is named and specific.

**The window**
Before age 1 is the cleanest underwriting window for the child. HSGM bought at this stage is locked with the lowest loadings of their lifetime. Don't let parents leave this branch without HSGM locked for the child.

**What to package**
- **Child HSGM** - locked before age 1
- **Child accident plan** - the cheapest coverage they will ever buy
- **Prenatal / birth rider** - if before delivery
- **Parent income replacement** - revisit if dependants count just changed
- **Parent accident transfer** - if applicable

**Real anchor case 1 - the newborn package**
Newborn HSGM public ward + child accident plan at ~$500/year total (~$40/month). Same conversation surfaced a personal life-coverage gap on the parent at $100K actual vs $500K needed. Two products, two close moments.

**Real anchor case 2 - the prenatal angle**
Locked prenatal rider + child life coverage at $280/month total before the 30-week cutover. The 30-week pregnancy window is a real deadline for the prenatal rider; name it.

**Receipt to leave with**
- Child HSGM locked
- Child accident plan in place
- Prenatal rider locked if pre-delivery
- Parent cover gap audited - flagged or filled

**If they say: "Let's just get the baby covered for now":**
"Totally fair, getting the baby covered today is the priority. The one thing I'd want to flag while we're here is that the income replacement number on you just changed - you now have one more dependant. We don't have to fix it today; I just want it noted so we look at it together in the next review. Otherwise it falls off."`,
        exampleCaseIds: [
          "real-2025-08-05-6yjsm20g",
        ],
      },
    ],
    addOns: [
      "Decoupling for mortgage protection",
      "Accident top-up for child / parent",
      "Parent transfer to client's policy umbrella",
    ],
    realCaseCount: 15,
  },
];

/** Look up a flow by id. */
export function getFlow(id: string): AppointmentFlow | undefined {
  return APPOINTMENT_FLOWS.find((f) => f.id === id);
}

/** Look up a branch globally — useful when linking from Case Vault. */
export function getFlowBranchByCaseId(caseId: string):
  | { flow: AppointmentFlow; branch: FlowBranch }
  | undefined {
  for (const flow of APPOINTMENT_FLOWS) {
    for (const branch of flow.branches) {
      if (branch.exampleCaseIds.includes(caseId)) {
        return { flow, branch };
      }
    }
  }
  return undefined;
}
