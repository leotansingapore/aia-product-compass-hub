/**
 * Canonical appointment flows for FC use.
 *
 * Each flow is a "track" a consultant runs in a real appointment. Pick a track
 * at the opening based on the entry decision, then run the branches.
 *
 * Skeleton seeded from 258 real Fireflies appointments (May 2025–May 2026).
 * Each branch body is the canonical script for that branch, written in the
 * voice-canon register (see docs/_voice-canon-scripts.md): plain teaching prose
 * with cushion-first objection responses. Cross-link example cases from
 * /case-vault by appending case ids to `exampleCaseIds` on the branch (curated
 * codes like "P1" or real ids like "real-2026-03-14-abc12345").
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
        body: `**Two questions before you price anything**
1. "If something happened tomorrow, what ward do you see yourself in - public, A-class, or private?" That sets the HSGM tier.
2. "Has anyone in your family had cancer or a stroke before 60?" That sets how big the CI cover needs to be.

**Price the bundle, not three line items**
Hospital, accident and term life cover three different fears: a hospital bill that drains the family, an accident that ends income overnight, and death that leaves dependants with no runway. Show all three numbers together - about $150-250/month for someone in their 20s. One real case here: a 22-year-old locked $500,000 of term life at $42/month. Anchor on that.

**Cancer cover, while it's cheap**
If they have a milestone birthday in the next six months, show the premium curve, not the fear. A 29-year-old here locked $300,000 of cancer cover at $150/month; the same plan at 50 costs $670/month.

**Vitality**
Bring up the 10% first-year discount only once the bundle is agreed. If they already go to the gym, it sells itself.

**Receipt to leave with**
- HSGM tier locked, ward chosen
- Term life $500K-$1M to age 65
- Accident plan in place
- Cancer/CI cover bought, or parked for the next review

**If they push back on the bundle**
"That's totally fair - three plans is a lot to take in at once. The reason I'd keep them separate is that one plan trying to do all three usually does each part badly. Three plans that each cover one risk well is the cheaper version, not the dearer one. Let me show you the math."`,
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
        body: `**The frame**
Employer cover is rented, not owned. The day they leave the job, it leaves with them - and by then their health may have changed enough that the next medical comes back loaded or excluded.

Open with: "Tell me about your group cover - what ward, what CI lump sum, any rider on top?" If they don't know the numbers, that's your opening. Most people on employer cover have never read the benefit table.

**Two layers on top of the employer plan**
- Portable HSGM - lifelong private hospital cover that stays whichever job they're in. About $80-100/month in their 20s.
- Standalone early-CI, $100-200K. Employer CI is almost always single-payout late-stage; layer early-stage recurring on top.

Total lands around $80-150/month at this age.

**Real case**
A 26-year-old on a corporate hospital plan, no personal cover. Surrendered a 2% underperforming policy from another insurer ($80/month, $100,000 death cover) and put the same $80/month into a portable HSGM with double the death cover.

**Receipt to leave with**
- Portable HSGM rider booked - works whether they stay or leave
- Standalone early-CI $100-200K
- Employer cover treated as backup, not the plan

**If they say "my company already covers me"**
"Totally fair, and you're right that the group plan is real cover today. The bit worth knowing is what happens the day you change jobs - and most people change jobs four or five times in a career. The portable plan is what carries through. Worth a 15-minute look at the numbers together?"`,
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
"Mind if I check your CI rider? I just want to see whether it's single-payout or multi-payout." If they don't know, that's your opening - most people sold an accelerator have never been shown the difference.

**The gap**
An accelerator pays once. After that first claim - even early-stage - the CI bucket is gone, and they re-underwrite as a cancer survivor. Cover after that is either declined or carries exclusions.

Real case: a client held only single-payout accelerators across his portfolio. We added a UCC top-up as a recurring early-CI layer - a separate bucket that keeps paying through staged events.

**What to price**
- Recurring early-CI standalone (UCC or term-CI), sized 3-5x annual income - about $60-120/month at this age
- HSGM upgrade only if their ward tier doesn't match what they want

**Receipt to leave with**
- Existing accelerator stays (it still covers late-stage)
- Recurring early-CI layer on top, $100-200K to start
- HSGM ward upgraded if there's a mismatch

**If they say "I already have CI cover"**
"That makes complete sense - and you do. The bit I'd double-check together is whether it pays once or pays through. Paying once is fine if the first event is the big one, but on an accelerator a stage-1 cancer pays out the same as stage-4 and empties the cover. A second bucket handles the harder one. Worth 20 minutes to map it out?"`,
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
They're interested but cashflow is tight. Push a $500-1,000/month plan now and you'll watch them lapse it inside a year. Start small, lock the habit, review.

**Run the retirement gap first**
Use their target retirement age, lifestyle number and current savings. The output usually lands around $2,000-2,500/month for the next 30 years to hit the dream number.

Real case: the calculator said $2,317/month. The client almost walked. What closed it was the reframe - "If we can't do $2,317, what can we do?" Answer: $200/month, committed today, review in 12 months.

**What to price**
- APA $200-300/month, 10-year minimum
- Term life floor: $100K at age 25 is about $15/month

At this age, $300/month for 40 years at 6% net compounds to about $570,000. Show the achievable number, not the dream number.

**Receipt to leave with**
- APA $200-300/month started, 10-year minimum
- Term life floor in place
- 12-month review in the calendar

**If they hesitate - "it feels too small to matter"**
"That's totally fair - $200 a month does feel small. But the first ten years of compounding carry most of the result. Starting at 25 with $300 a month gets you to $1.5 million by 65; waiting until 35 gets you $611,000. That decade is worth $900,000. Worth locking the habit now and scaling later?"`,
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
Buy term, invest the rest. Keep protection and investment in separate plans so each does one job well. This is the cleanest stack for someone with $500-1,500/month free.

**Three layers**
- APA $500-1,000/month (Pro Achiever) - the compounding engine
- Standalone CI $200-300K - kept separate, not riderised onto the investment plan
- HSGM - if it isn't already in place

Total usually lands at $700-1,200/month.

**Why standalone CI**
Real case: a client had a combo CI plan at $94/month for $45K of cover. Restructured into standalone CI at $90/month for $150K - triple the cover for $4 less a month.

**Why APA**
Head-to-head with the bigger competitors, the Pro Achiever projects about $200,000 more at retirement on the same monthly, mostly from the lower management fee. Draw that number.

**Receipt to leave with**
- APA $500-1,000/month started, fund tier chosen
- Standalone CI $200-300K
- HSGM tier confirmed or added

**If they ask "why three plans, not one?"**
"Fair question - the all-in-one is what most people get sold first. I prefer three because each layer does its job without dragging on the others. Claim CI on a combo plan and your investment usually takes the hit too; with separate buckets, the CI claim leaves the investment alone. Want to see it side by side?"`,
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
Two engines run in parallel: a monthly compounding engine (APA) and a lump-sum engine (PWV single-premium, or CPF-OA deployed through CPFIS). The monthly handles the slow build; the lump sum is the head start.

**Discovery before you price**
"How much is sitting in the bank right now that's just there - not your emergency fund, not the next six months of expenses, but money you couldn't tell me the purpose of?" That number is the lump-sum side. Most professionals in their late 20s have $20K-$100K answering it, earning sub-inflation in a savings account.

**The two engines**
- APA $500-1,000/month - monthly compounding, 10-year minimum
- The lump sum: PWV single-premium if they want a retirement income angle, or CPF-OA into CPFIS global equity if the lump is in CPF

**Real case - the CPF-OA angle**
A client had $40K in CPF-OA earning 2.5%. We reframed his "conservative" 70/30 bond-heavy mix as its own risk, then deployed the $40K into global equity via CPFIS, keeping a $16,500 buffer rebalanced.

**Real case - the side-by-side**
A client on a $500/month plan from another insurer at higher fees. Side by side, AIA Pro Achiever projected $200,000 more at retirement on the same contribution.

**Receipt to leave with**
- APA $500-1,000/month started
- Lump sum deployed (PWV single-premium, or CPF-OA via CPFIS)
- Annual review locked

**If they say "I'd rather wait for the market to drop"**
"Honestly, fair - most people have that instinct. The trouble is the data keeps showing time in the market beats timing it. The compromise that works for most people is to spread the lump sum over 6-12 months instead of going in all at once. Same exposure to the growth, far less regret if it dips next week."`,
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
An old whole-life or endowment plan from 10-20 years ago, projecting 2-3%, with no investment exposure anywhere in the portfolio. The premium is real money - $200-500/month - and it isn't doing much.

**Audit first**
Pull every policy through Singpass / the MAS app and map each one: monthly premium, sum assured (death and CI), surrender value today, projected maturity value, maturity year. You're looking for the gap between what the legacy plan projects and what the same monthly could do in a modern structure.

**Real case**
A client had $80/month going into a Link Guard from another insurer - $100,000 death cover, 2% projected. Surrendered it, put the same $80/month into AIA cover that doubled the sum assured, and still freed $50/month for an investment plan on top.

**Draw the comparison in three columns**
1. Keep - what the legacy plan delivers at maturity
2. Surrender - surrender value today plus the freed monthly into APA
3. Net difference - column 2 minus column 1

The math almost always favours surrender when the projected return is under 3% and there are 15+ years to retirement.

**Receipt to leave with**
- Legacy plan surrendered or made paid-up
- Same monthly redeployed into APA + new HSGM
- Net projected uplift at 65 written on paper

**If they hesitate - "I've paid this 12 years, I don't want to throw it away"**
"That's totally fair - 12 years of premiums feels like something you shouldn't waste. The honest reframe is that those 12 years are sunk either way; what matters is the next 25. Keeping a plan just because it has history behind it usually costs more than starting over. Let me show you the side by side and you decide."`,
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
The client has an existing ILP. The plan structure is fine - what's broken is the fund underneath. A management fee of 1.3% or higher quietly eats the return; over 30 years a 0.45% difference compounds into a six-figure gap.

**The audit move**
Get the fund fact sheet and find the management fee. Above 1.3% and you have a Play B candidate. Then check the contribution - most clients on legacy ILPs have never raised the monthly since they signed, and inflation has done the rest.

**Two moves on the same plan**
- Fund switch from the high-fee fund (1.45%) to the modern equivalent (1%)
- Top up the monthly, using the freed-up fee as the budget

**Real case**
A $600/month plan. The fund switch from 1.45% to 1% projected $100K-$200K more by age 65 with no change to the monthly outlay.

Draw two lines on the same horizon: the existing fund at 1.45% and the same monthly at 1%. The wedge between them is the cost of doing nothing.

**Receipt to leave with**
- Fund switch executed
- Monthly raised by the freed-up fee
- Net projected uplift written on paper

**If they push back - "the fee difference looks small"**
"Honestly, fair - 0.45% sounds tiny out loud. What makes it land is the timeline: on a $600/month plan compounding for 38 years, 0.45% a year becomes about $200,000 by retirement. That's a quarter of a million for the same fund family. The fix is the fund switch - same plan, same monthly, different sleeve."`,
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
        body: `**The same gap as Flow 1, now on a fuller portfolio**
Hospital, accident and an ILP are all in place, but the CI is single-payout only - usually riderised onto a whole-life or endowment plan as an accelerator.

**The diagnostic**
"Mind if I check your CI rider? I want to confirm whether it pays once or pays through."

**The gap**
On an accelerator, the first claim - even an early-stage cancer - empties the bucket. After that they can't re-buy CI cleanly, because they're now a survivor with health loadings. The window to top up is now, while underwriting is still clean.

**What to price**
A standalone recurring early-CI layer (UCC or term-CI), sized 3-5x annual income, on top of the existing accelerator. Leave the accelerator alone - it still covers late-stage. The new layer covers the staged events.

**Receipt to leave with**
- Existing accelerator stays in place
- Recurring early-CI layer added at 3-5x income
- Underwriting cleared while health is current

**If they say "I already have CI cover"**
"That makes complete sense - and you do. The bit I'd double-check is whether it pays once or pays through. If the first event is a stage-1 cancer and we treat it, the cover is empty and the next round of underwriting is much harder. The standalone recurring layer is what keeps paying through. Worth 20 minutes to map both buckets?"`,
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
Five or more policies across two or three providers, built up over a decade. Premium is now over 15% of income and they no longer remember what each plan does. The instinct is to add cover. Consolidate first - sort out what's already there before selling anything new.

**The audit is the meeting**
One sheet of paper, one column per policy: provider, plan name, monthly premium, what it covers (death / CI / hospital / investment), surrender value today, maturity year. By the end the client can usually see the overlap themselves - two life plans covering the same death, two single-payout CI plans that should be one recurring layer, a hospital plan whose ward no longer fits.

**Real case**
A client had $2,000+/month in scattered premiums across providers. We consolidated the death cover, decoupled HSGM, and redeployed the difference into a dividend portfolio - turning the outflow into roughly $4,000/month of projected dividend income.

**The decoupling move**
For couples, HSGM is often cheaper with each life rated separately rather than as a household. Pull both quotes; if decoupling saves $50-150/month, that's the recommendation.

**Receipt to leave with**
- Scattered policies mapped on one sheet
- Overlap identified and named
- Consolidation plan with a date
- Decoupling savings quantified

**If they hesitate - "won't surrendering some of these cost me money?"**
"Fair concern - sometimes yes, sometimes no, depending on the plan and how long it's run. The question isn't 'surrender or keep', it's 'is what I'm paying for each plan the best version of that cover today?' For some the answer is yes and we leave them; for others, the freed monthly buys better cover in one cleaner structure. Let me work through them one at a time with you."`,
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
The audit is clean. Protection in place, investment running, hospital sorted. There's one specific gap - usually CI under-sized, a hospital ward mismatch, or a missing accident plan.

**Don't restructure for the sake of it**
The temptation is to find more to upgrade because the client is engaged. Resist it. A clean portfolio with one gap deserves a one-product close, not a five-product proposal.

**Real case**
A six-year client came back for a full review. The audit surfaced CI under-sizing and a hospital plan to verify against the existing other-provider app. The honest version closed it: "Your portfolio is solid - here's the one gap, here's the cost to fill it, next review in 12 months." No upsell. It kept the client and produced three referrals the next quarter.

**What to price**
- CI top-up at 3-5x income if under-sized
- HSGM tier adjustment if the ward doesn't fit
- Accident plan if missing

Whichever is the gap - one product, not three.

**Receipt to leave with**
- The specific gap filled
- Confirmation of what's already working
- Next review booked at 12 months

**If they ask "is there anything else I should be doing?"**
"Honestly, your portfolio's in good shape - the gap we filled today is the one that mattered. The next thing to look at is in 12 months: your income, your dependants, and whether the gap math still holds. I'd rather you put that monthly into something that compounds than buy cover for the sake of it."`,
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
The client is 45-55 and still earning well, with 10-15 years to retirement. Build the pot now, switch to income later - one plan that grows, then another that pays.

**Two phases**
- Years 1-10: APA aggressive into a growth-tilted fund. The goal is end-of-phase capital.
- Year 10 on: convert into PWV for dividend-paying income through retirement.

You don't sell both today. You sell the APA now and book the PWV conversation for year 8.

**Real case**
A 38-year-old QS with $3K monthly surplus, facing a $6K/month retirement gap. Opened a $500/month APA projecting $1.17M at age 67. It didn't try to close the whole gap in one move - it locked the growth engine and committed to a year-8 review for the PWV side.

**Lock HSGM now**
This branch always includes locking HSGM lifelong while health is current. The client is past 45; leave the upgrade for "later" and "later" means loadings or exclusions.

**Receipt to leave with**
- APA monthly committed, growth fund chosen
- HSGM lifelong rider locked at current health
- Year-8 PWV conversion booked in writing

**If they say "why not pump everything into one big plan now?"**
"Totally fair, and some people do. I'd split the two phases because the math rewards it: a growth-tilted fund compounds harder over the first ten years, and a dividend structure pays more reliably in retirement. Each phase has the right tool - and we don't lock you into an income structure before we know your actual retirement number."`,
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
        body: `**The opener**
"Let me show you the CPF Life cliff first - then you decide if you want a floor under it." Pull up the CPF Life projection. Show the monthly payout, then the point around age 81 where the capital depletes with no bequest. That picture is the anchor.

**The side-by-side, three columns**
1. CPF Life ERS - monthly payout, locked, depletes around 81, no bequest
2. PWV equivalent lump - monthly payout (often lower), dividend continues, bequest stays intact
3. Combo - partial CPF top-up plus PWV for the rest

Most clients pick column 3 once it's laid out: the CPF floor plus the PWV legacy.

**Real case**
A pre-retiree faced a $5,339/month gap after CPF Life. We mapped a $1M managed portfolio at 6% yield against $500-600/month of existing premium outflows, restructured the policies, and built a combo that closed the gap with the bequest intact.

**Where the math matters most**
For someone hitting FRS at 55 with 10+ years of work left, the lump doesn't all have to go into a CPF top-up. The portion above FRS that would have gone to ERS often does better in PWV - same risk profile, dividend continues, bequest preserved.

**Receipt to leave with**
- CPF Life vs PWV table on paper
- Combo agreed (which portion to top-up, which to PWV)
- Bequest impact quantified

**If they say "CPF Life is the safe option, isn't it?"**
"Totally fair - CPF Life is genuinely safe. The bit worth knowing is what 'safe' costs. The lump you put in to push the payout from FRS to ERS is locked, it stops paying around 81, and there's no bequest from it. The same lump in PWV pays a similar amount, keeps paying through 90+ as long as the underlying holds, and the bequest stays intact. Both are real - I just want you choosing with the trade-off on the table."`,
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
CPF FRS is done. There's a lump - usually $100K-$1M+ - sitting in fixed deposits or low-yield bonds. They don't need it to grow aggressively; they need it to start paying.

**The product choice is simple**
PWV single-premium for most cases. SPA at the conservative end (capital-guaranteed, lower yield). The call is yield appetite versus guarantee.

**Real case - the dividend engine**
A $58,000-$60,000 lump into an income portfolio at 6% annual dividends, structured to offset projected parental hospitalisation premiums. The capital stayed intact and the dividend covered the parents' hospital plan effectively for free.

**Real case - the larger lump**
A CPF-OA-eligible client put $60,000+/year into a 5-year structured PWV commitment producing 6-7% dividend income, bridging a $3,600-$4,600/month retirement gap toward a $12,000/month dream lifestyle.

**Draw it in three lines**
1. Lump today: $X
2. Monthly income produced: $Y
3. Capital remaining at 90: still close to $X

That third line is the legacy column - the one most retirees haven't been shown.

**Receipt to leave with**
- Lump deployed (PWV / SPA), tranche chosen
- Monthly income written on paper
- Legacy capital projected at 85 / 90

**If they push back - "what if the market drops the year I deploy?"**
"That's a real concern, and most clients solve it by tranching - part of the lump now, the rest over the next 6-12 months. Same exposure to the dividend stream, far less timing regret. Let me show you the schedule."`,
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
This client doesn't need income from the lump - they have other sources (rental, business, a working spouse). What they want is a clean legacy: a defined number to defined people, with no probate friction.

**Discovery**
- "What's the number you'd want to leave behind, in today's dollars?"
- "Who are the beneficiaries - equal, or weighted?"
- "Have you done CPF nomination, or named beneficiaries on each policy?"

Most can answer the first two. Most can't answer the third confidently, and that's where the work is.

**The structure**
- PWV with bequest emphasis - lump into a dividend-paying structure where the capital stays intact for legacy
- UCC top-up - lock final whole-life cover at current health as the extra legacy buffer
- Nomination / trust review - a separate session, with a lawyer if the legacy is complex

**Receipt to leave with**
- Legacy target number written down
- PWV legacy structure proposed
- UCC top-up sized
- Nomination review scheduled separately

**If they say "isn't a will enough?"**
"Totally fair - a will does cover a lot. The reason I raise nominations alongside it is that insurance and CPF don't pass through the will; they go straight to whoever's nominated, or by default rules if no one is. So you can have a clear will and still have the wrong person collect on the insurance because the nomination was never updated. Worth a 30-minute session to confirm both line up."`,
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
Either a CI definition change is coming (industry-wide tightening, usually flagged 6-12 months ahead), or someone in the client's circle - a colleague, a parent, a sibling - was just diagnosed. This is the hottest lead pattern in the practice. They walk in already sold - your job is to structure the cover before the urgency fades.

**The opener**
"Tell me what scared you." Let them talk. Don't pitch. The diagnosis story, or the article they read, is the anchor - your job is to make the cover match the fear they walked in with.

**Sizing**
3-5x annual income for the standalone CI layer. Anchor on income replacement, not a round number.

**Real case**
A 29-year-old with a milestone birthday approaching locked $300,000 of cancer cover at $150/month before turning 30. The same plan at 50 costs $670/month. Showing him the premium curve on paper - cost today versus cost at 50 - closed the meeting.

**The definition-change angle (only when real)**
When CIRA or industry CI definitions tighten, plans bought before the cutover are grandfathered under the old definitions. If a cutover is genuinely coming, name the date and the deadline. Don't invent urgency.

**Receipt to leave with**
- Standalone CI $100-300K locked
- Premium curve shown on paper (cost now versus in 10-20 years)
- Underwriting timeline confirmed

**If they hesitate - "let me think about it"**
"Honestly, fair - this is a real decision. The one thing worth knowing before you walk away is that the premium curve doesn't pause while you think; the rate today is the rate today's health buys. If you'd rather take the medicals now to lock the rate and decide on the cover size after, that works too. Costs nothing and keeps the option open."`,
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
A parent was admitted and the bill was visible, or the client had a recent admission, or a colleague's story is fresh.

**Discovery**
- "What ward are you on now?"
- "Was the recent admission in the ward you'd want for yourself?"
- "What does the rider look like - co-pay, deductible, lifetime limit?"

Most people on a base hospital plan have never read the rider. The audit is the meeting.

**Two adjustments, usually together**
- Ward tier up - from public/B1 to A-class or private if there's a mismatch
- Lifelong rider - lock it while underwriting is clean

**Real case - the Medisave-funded version**
A first-time buyer with zero existing cover signed an HSGM Plan B at $314/year (about $25/month), 100% Medisave-funded - zero cash outlay. That closes it for cash-conscious clients.

**The decoupling check**
For married couples, quote HSGM both ways - household and decoupled (each life rated separately). If decoupling saves $50-150/month, that's the recommendation.

**Receipt to leave with**
- Ward tier confirmed or upgraded
- Lifelong rider added or confirmed
- Decoupling savings quantified if relevant
- Funding source confirmed (Medisave / cash)

**If they say "I haven't been admitted, it might be a waste"**
"Totally fair - most people aren't admitted in any given year. The reason I push on the ward is that hospital cover is the one thing you can't buy after the admission. Stay healthy and the premium's small; if you don't, the gap between the ward you have and the ward you'd want becomes a real bill. Worth getting it right while you can."`,
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
A friend or colleague died young, or had a disability event - stroke, accident, severe injury - and the financial fallout was visible. The client is now thinking about their dependants and their mortgage.

**Two questions first**
- "Who would the income loss hit hardest if it happened to you tomorrow?" - sizes the income-replacement layer
- "What's the outstanding mortgage on the property?" - sizes the mortgage-protection layer

Different numbers, different plans.

**The structure**
- Term life for income replacement - 10-15x annual income, to age 65
- CI rider or standalone for early-stage cover - 3-5x income
- Disability rider if the profession is high-risk or the income is single-source
- Mortgage decoupling for couples where the mortgage is in joint names

**Real case**
A client held a combo CI/death/savings plan at $1,000/year for $100K of cover, plus an ASCC at $1,900/year. The combo had a forfeiture clause that emptied the savings if CI was triggered. We decoupled it into separate plans - pure CI, pure death, pure savings - so each pays independently.

**Receipt to leave with**
- Income replacement sized to the dependants' runway
- Mortgage protection separate from income replacement
- Disability rider added if the profession warrants it
- Existing combo plans audited for forfeiture clauses

**If they say "my CPF and existing life cover should be enough"**
"Fair to check that first. What I'd do together is map the actual numbers - CPF balance, existing life cover, mortgage outstanding, dependants' runway. Thirty minutes. If the gap's small, we close it out; if it's bigger than you thought, we fill it. Either way you walk out knowing where you stand."`,
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
A baby on the way, just arrived, or an older child reaching school age. One of the cleanest "fix the floor" conversations, because every gap is named and specific.

**The window**
Before age 1 is the cleanest underwriting window for the child. HSGM bought now is locked at the lowest loadings of their life. Don't let parents leave this branch without HSGM locked for the child.

**What to package**
- Child HSGM - locked before age 1
- Child accident plan - the cheapest cover they'll ever buy
- Prenatal / birth rider - if before delivery
- Parent income replacement - revisit now that the dependant count changed
- Parent accident transfer - if applicable

**Real case - the newborn package**
Newborn HSGM public ward plus a child accident plan, about $500/year total (~$40/month). The same conversation surfaced a personal life-cover gap on the parent - $100K in place versus $500K needed. Two products, two close moments.

**Real case - the prenatal angle**
Locked a prenatal rider plus child life cover at $280/month total before the 30-week cutover. The 30-week window is a real deadline for the prenatal rider - name it.

**Receipt to leave with**
- Child HSGM locked
- Child accident plan in place
- Prenatal rider locked if pre-delivery
- Parent cover gap audited - flagged or filled

**If they say "let's just get the baby covered for now"**
"Totally fair - getting the baby covered today is the priority. The one thing I'd flag while we're here is that your own income-replacement number just changed; you've got one more dependant. We don't have to fix it today, I just want it noted so we look at it next review. Otherwise it falls off the radar."`,
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
