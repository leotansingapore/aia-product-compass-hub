/**
 * caseNarratives.ts
 *
 * Long-form, consultant-to-consultant narratives for each case in the
 * Case Vault. Rendered on /case-vault/:caseId as the main reading content,
 * replacing the previous bullet-only summary.
 *
 * Style guide for new entries — write like you're briefing another FC who is
 * about to walk into a similar appointment:
 *
 *  1. **Who they were** — paint the prospect (age, life stage, what's in their
 *     portfolio). Avoid the "35-yo whole-life holder" shorthand.
 *  2. **What they had / were paying** — concrete numbers on the existing setup
 *     so the reader can picture the policy schedule on the table.
 *  3. **Where it broke down** — the structural flaw most prospects can't see.
 *     This is the conceptual hinge.
 *  4. **The reframe** — the conceptual pivot the FC delivered. One paragraph.
 *  5. **The numbers, side by side** — verified math, presented as a clean
 *     comparison the FC can recite from memory.
 *  6. **What the pitch sounded like** — the actual script (italicised block
 *     quote). This is the line the reader will rehearse.
 *  7. **What closed** — the receipt.
 *  8. **The lesson for any FC** — what this case teaches that transfers to
 *     other prospects.
 *
 * Source of truth for the verified math: aia-product-sales/<product>/day-05.md
 * Case Study Vault sections. When a case is updated there, update here too.
 */

export const CASE_NARRATIVES: Record<string, string> = {
  // ─── APA ─────────────────────────────────────────────────────────────────

  "apa-a": `
### Who they were

A working professional in their mid-30s. The kind of prospect who already feels "covered" — they bought a Pru Active Life bundle some years back at $371.86 a month. The bundle stacks three policies: the base Pru Active Life whole-life, a Pru Active Protect rider that scales the death and TPD cover up to about $500K, and a small Pru Accident plan. On paper it looks like a complete wealth-and-protection stack. That's what makes the case hard to open.

### What they were paying — and what they thought they were getting

$371.86 a month for life. The breakdown:

- Pru Active Life (base) — $236.50/mo
- Pru Active Protect (rider till 80) — $117.59/mo
- Pru Accident — $17.77/mo

The headline cover looks reassuring: $500K Death/TPD, $100K Late CI, $100K Early CI (claimable up to 5x), $100K severe-infection cover. Most prospects in this shape will tell you, "I've got it sorted, my agent set me up properly."

### Where it broke down

Two structural flaws sit invisible under the bundle.

**Flaw one — the cash-value side is barely keeping up with itself.** Pull the deduction table out of their illustration and walk to age 70 at the 8% projected case (which is the upper bound the BI is allowed to show). Total surrender value: **$124,038**. By 70 they will have paid in roughly $134,000 of premium. That isn't a wealth plan. That is an expensive emergency fund — at the best projection, after 30 years they get back roughly what they put in. At the 4% projection (closer to long-run reality for a participating fund), the math is net-negative by 80 even with $170K of premium paid in.

**Flaw two — the cover cannibalises itself the day it's used.** Pru Active Life has an accelerated-CI structure. If the prospect ever claims for CI, the death/TPD benefit drops by the claim amount. If they claim TPD, the cash value they're saving for 65 evaporates the day the policy pays. They are paying for a structure that erodes itself in the one scenario that justifies owning it.

### The reframe

Whole-life is doing two jobs at once — life cover and cash accumulation. The trade-off is that the cash side is forced to be conservative and the cover side is bundled, so neither piece can be optimised. The cleaner answer is to split the two jobs. A low-cost pure term policy for the cover (cheaper per dollar of cover, doesn't erode when claimed), and APA for the accumulation slot (Welcome Bonus stack in Y1-3, Special Bonus from Y10, 0% supplementary from Y11, 100% premium allocation working on the wealth side).

### The numbers, side by side

Matched to the same 30-year horizon (age 35 → 65), at the same monthly outflow:

| Setup | Monthly | Total in over 30 yrs | Cover for 30 yrs | Cash at 65 (8%) | Cash at 65 (4%) |
|---|---|---|---|---|---|
| Pru Active Life bundle | $371.86 | ~$133,870 | $500K Death + $150K CI (erodes on claim) | $124,038 @ **age 70** | meaningfully lower |
| BTIR — APA $321/mo + term ~$50/mo | $371 | ~$133,560 | $500K-$1M pure term (does NOT erode) | **$338,366 @ 65** | $175,068 |

Same monthly outflow. Roughly $214K more cash at 65 — and five years sooner of usable retirement runway. The cover stays whole through any CI claim.

### What the pitch sounded like

> *"You've been paying $371.86 a month. At 70, even on the most optimistic 8% projection in your own illustration, your surrender value is $124,038. You've paid about $134,000 in premium by then. That's not a wealth plan — that's an expensive emergency fund.*
>
> *And the part most people don't realise: if you ever claim on the CI rider, your death and TPD cover drops by the amount paid out. If you claim TPD, the cash value you're hoping to use at 70 is gone the moment the policy pays. The structure cannibalises itself the one time you actually need it.*
>
> *Same $371.86 a month, decoupled across the same 30-year horizon. About $50 a month buys $500K-$1M of pure term cover till 65, and $321 a month goes into APA. APA at the 8% projection lands $338K at 65 versus your $124K at 70. And the cover stays intact even if you claim."*

### What closed

The prospect signed a BTIR restructure: $321/mo APA on continuous-pay to 65, with a $50/mo standalone term policy carrying the cover. The Pru policy was costed honestly — surrender penalty was small enough by then for full restructure to net positive.

### The lesson for any FC

The Pru Active Life prospect looks like a closed case from the outside. They have a "comprehensive policy" and they trust the person who sold it. The opening is never an attack on Pru — it's the cash-value deduction table on their own illustration, plus the accelerated-CI clause they didn't realise was there. The math does the work. Your job is to surface it without making the prospect feel stupid for the original purchase.
`,

  "apa-b": `
### Who they were

A 25-year-old non-smoker — early-career, finance-curious, comparing ILPs before signing. Quoted FWD Invest First Summit at $600/mo for 25 years on a 5-fund allocation. The kind of prospect who already knows what FMC means and will eat any pitch alive if you don't bring real receipts.

### What they were being quoted

- $600/mo × 25 years = **$180,000 total premium**
- 5-fund allocation: Allianz Best Styles Global Equity, Guinness Global Innovators, GS Global Credit (Hedged), UOB High Grade Corporate Bond, Guinness Global Equity Income
- Stated fund management fee: 1.30% p.a.
- Sum insured: 105% of policy value — a token death-benefit wrapper on what is effectively a pure investment ILP

### Where it broke down

FWD's pitch hangs on a low headline charge in the early years. It's true — their Y1 supplementary is lower than APA's 3.9% Y1-10 supplementary. The structural flaw lives further down the policy life. Pull up their own Total Distribution Cost table:

| Year | Age | Total premiums paid | TDC |
|---|---|---|---|
| 10 | 35 | $72,000 | **12.5%** |
| 25 | 50 | $180,000 | 7.6% |
| 40 | 65 | $180,000 | **11.2%** |

TDC keeps growing for the entire life of the policy — even after premium payments end at year 25. There is no "cliff to zero" the way APA cuts supplementary to 0% from Y11. FWD just keeps deducting. And the sum-insured field reads "105% of policy value" — meaning the death cover crashes with the market. That isn't cover, that's a refund.

### The reframe

Don't argue FWD down. The prospect cross-shopped because they're price-sensitive — so attacking the company makes you sound desperate. Walk them through their own illustration's TDC line at year 40. Then walk them through APA's cost curve — high early (Y1-10), zero from Y11, with Welcome Bonus tier 1 of 15/18/20% in Y1-3 and Special Bonus 5% then 8% from Y10 onwards. Same prospect tier, opposite shape. Their deductions never stop. Ours stop at Y11 and start crediting.

### The numbers, side by side

Apples-to-apples at the same shape (25-yr pay):

| Setup | Monthly | Total paid | At 65 (8%) | Multiple |
|---|---|---|---|---|
| FWD Invest First Summit | $600 × 25 yrs | $180,000 | $1,306,872 | 7.26× |
| APA — same monthly, same 25-yr pay | $600 × 25 yrs | $180,000 | $1,187,405 | 6.60× |

Honest read: at this premium tier, FWD's absolute return at matched duration is ~9% higher. APA's edge here is *structural*, not raw ROI — death-benefit floor of 100% of premiums, no FX exposure, secondary insured for inheritance, SGD-domiciled.

If you want to win on raw return at this prospect, switch the shape. Same $180,000 paid into APA over 10 years instead of 25:

| Setup | Monthly | Pay term | Total paid | At 65 (8%) |
|---|---|---|---|---|
| FWD (25-yr pay) | $600 | 25 yrs | $180,000 | $1,306,872 |
| **APA 10-yr IIP at $1,500/mo** | **$1,500** | **10 yrs** | **$180,000** | **$1,692,753** |

Same total money in. Front-load shape. $385,881 more at 65 — and 15 freed years where the FWD prospect is still paying premium.

### What the pitch sounded like

> *"FWD positions itself as the low-fee ILP. That's true in year 1 — their headline charge is lower than APA's first-10-year supplementary. But pull up their own illustration and walk to year 40. Their TDC is 11.2% of premiums paid. APA's is around half that, because APA cliffs the supplementary charge to 0% from year 11. FWD never cliffs. They just keep deducting.*
>
> *Look at your sum insured: 105% of policy value. If the market drops 30%, your life cover drops with it. APA's death-benefit floor is 100% of total premiums paid, contractually guaranteed.*
>
> *And if you're willing to front-load — same total money in, but over 10 years instead of 25 — you walk away at 65 with $385,000 more, and 15 years where you don't owe premium. Same money. Different shape. Different number."*

### What closed

Two paths sit here depending on cash flow. If the prospect can stretch to $1,000+/mo, the Welcome Bonus tier 1 ($12K+ tier) kicks in and the case closes on the bonus stack alone (~$7,632 in Y1-3 of guaranteed bonus credits). If they can front-load to $1,500/mo for 10 years, the front-load shape wins on raw return (see Case G). If they can't do either and stay at $600 — close honestly on structural certainty (death-benefit floor, no FX, no estate-tax exposure, SGD-domiciled, secondary insured). Don't oversell the absolute return at the matched-shape comparison.

### The lesson for any FC

FWD prospects are the ones who'll google your numbers in front of you. Bring the receipts they didn't see — the TDC table at year 40 in their own illustration, the death-benefit floor language, the SGD vs USD currency risk on long-horizon money. And know your shape moves. If matched-duration doesn't win, front-load wins. If front-load doesn't fit cash flow, tier-bump wins. There is always a shape that wins this comparison — but only if you've drilled all three.
`,

  "apa-c": `
### Who they were

A 24-year-old young professional. Already paying for five different plans across two insurers totalling $807.80 a month. None of it was wrong, exactly — but none of it was holistic. The classic "I have so many plans, I must be covered" prospect.

### What they were paying

| Plan | Insurer | Monthly | What it does |
|---|---|---|---|
| Singlife Choice Saver | Singlife | $296.30 | Endowment at 4.25% PIRR, maturity ~$38K at age 35 |
| Singlife Multipay CI | Singlife | $94.00 | $45K CI cover, $5K death |
| AIA CI plan (small) | AIA | $30.00 | $45K CI/ECI |
| AIA CI plan (larger) | AIA | $87.50 | $150K CI/ECI |
| AIA Investment | AIA | $300.00 | Investment plan |
| **Total** | | **$807.80** | |

### Where it broke down

The Singlife Choice Saver was eating the largest slice — $296.30/mo — into a 4.25% PIRR endowment. They were putting $61,000 in over 17 years to get $38,000 out at 35. Worse than CPF OA's guaranteed 2.5%. Meanwhile their actual protection cover was a disaster: $35K of death, $34,500 TPD, $45K CI, zero hospital, zero accident, zero income protection. Five policies, $807 a month, and underwater on every protection line.

This is the consolidation pattern in its purest form — a fragmented portfolio that *feels* extensive but, on inspection, is over-paying for low-yield savings while structurally exposed on every actual risk.

### The reframe

Don't ask the prospect to spend more. Show them what their existing $807/mo could become if it were structured properly. The Singlife Choice Saver's job (wealth accumulation) is the worst-performing line — that's the slot APA fills at 8% projection vs 4.25%. The remaining premiums plug the actual gaps: term cover for the death/TPD exposure, hospital plan, accident plan. Same money. Five policies down to four. Proper coverage.

### The numbers, side by side

| Plan | Old monthly | New monthly | Change |
|---|---|---|---|
| Singlife Choice Saver | $296.30 | $0 (paid-up / surrendered) | Cash value redirected as APA top-up |
| Singlife Multipay CI | $94.00 | $0 (replaced by AIA CI consolidation) | Premium freed |
| AIA CI ($45K) | $30.00 | $30.00 (kept) | — |
| AIA CI ($150K) | $87.50 | $87.50 (kept) | — |
| AIA Investment | $300.00 | $0 (rolled into APA) | Consolidated |
| **APA (new)** | — | **~$500/mo** | Wealth slot consolidated |
| **Term policy ($500K-$1M)** | — | **~$50/mo** | Death gap closed |
| **Hospital plan (HSGM)** | — | **~$100/mo** | Hospitalisation gap closed |
| **Accident plan** | — | **~$15/mo** | Accident gap closed |
| **Total** | **$807.80** | **~$782.50** | Same monthly, holistic coverage |

Run the APA engine on $500/mo continuous to 65:

| Age | At 8% | At 4% floor |
|---|---|---|
| 35 | $70,394 | $58,889 |
| 45 | $230,470 | $154,649 |
| 55 | $539,184 | $281,178 |
| **65** | **$1,135,467** | **$444,085** |

$234,000 of total premium paid in. At 65, $1.14M projected. Versus the Singlife Choice Saver's projected $38,135 at age 35 on $60,560 paid in.

### What the pitch sounded like

> *"Five plans, $807 a month, across two insurers. Your Singlife Choice Saver is the biggest piece — $296 a month — and the projected maturity at 35 is $38,000. You're putting $61,000 in over 17 years to get $38,000 out at 4.25%. That's worse than CPF OA's guaranteed 2.5%.*
>
> *Meanwhile your death cover is $35,000 and your TPD cover is $34,500. If anything serious happened, you'd be exposed.*
>
> *Same $807 a month, restructured. Keep the AIA CI policies — they're already paid into. Replace the Singlife Choice Saver and the AIA Investment with one APA at $500/mo continuous to 65. At 65 on the 8% projection: $1,135,467. The remaining $200-250 a month plugs the protection gap with term, hospital, and accident."*

### What closed

The full consolidation — $500/mo APA + $50/mo term + $100/mo HSGM + $15/mo SPA. Singlife policies surrendered (or paid-up if surrender penalty was material). Same total monthly outflow, properly structured cover, wealth slot moved from 4.25% to 8% projection.

### The lesson for any FC

The fragmented-portfolio prospect is the easiest "no new money" close in the AIA stack — if you can articulate the trade. They aren't being asked to commit more cash. They're being asked to rearrange the same cash into a structure that actually does the job. Pull the worst-performing line (almost always the low-PIRR endowment), redirect to APA, and use the freed premium to close the cover gaps. Always run the surrender penalty math honestly before recommending — if the penalty wipes the gain, paid-up status beats full surrender.
`,

  "apa-d": `
### Who they were

A 50-year-old prospect with a long-running whole-life policy — paying $300-500/mo for the past 15-20+ years. The kids are through university. The mortgage is mostly paid. The original cover need — protecting their income while they were the breadwinner — has expired. But the premium is still going out the door, and the cash-value side is sitting at a participating-fund projection of 3-4%.

### What they had

Two pieces, both under-utilised:

- **Accumulated cash value** — roughly $50-150K depending on how long they'd been paying. Sitting locked in the whole-life's par fund, earning ~3-4% projected over the next 15 years.
- **The freed monthly premium slot** — the $300-500/mo they'll keep paying for the next 15 years until age 65 on cover the original need for has already expired.

### Where it broke down

This isn't a case of an underperforming policy. It's a case of *a policy whose job is done*. The cover was originally about income replacement. Income replacement is no longer the risk — they've already accumulated assets, dependants are independent, debt is paid down. Yet they're still paying for an income-replacement structure that no longer matches their actual life. And the dormant cash value inside the policy is earning participating-fund returns rather than working on the retirement-income job that *is* the current risk.

### The reframe

Stop paying for cover they no longer need. Wake up the dormant cash value. Same monthly budget, fundamentally different retirement picture.

Three moves stack into one restructure:

1. Stop further premium payments on the whole-life (paid-up status, or surrender if the penalty has worn off — most whole-life policies have minimal or zero penalty after 15+ years).
2. Redirect the accumulated cash value as a lump-sum top-up into a fresh APA.
3. Redirect the freed $400/mo premium into APA regular contributions.

### The numbers, side by side

Run the engine on $400/mo continuous to 65 (15 years of pay):

| Setup | Total premium | At 65 (8%) | At 65 (4%) |
|---|---|---|---|
| $400/mo continuous to 65 | $67,200 | **$106,201** | $78,780 |

Add the lump-sum cash-value redirect (~$50K from the whole-life, ~3% APA top-up charge, compounding 15 years at 8% projection):

| Stream | At 8% | At 4% |
|---|---|---|
| Monthly APA ($400 × 15 yrs) | $106,201 | $78,780 |
| Lump-sum redirect (~$50K) | ~$150,000 | ~$85,000 |
| **Combined at 65** | **~$256,000** | **~$164,000** |

Versus the do-nothing scenario where the whole-life produces ~$120K at age 70 — five years later, on the same money, with no liquidity until then.

### What the pitch sounded like

> *"You've been paying $400 a month for the past 18 years. The kids are through university, the mortgage is paid down. The cover this policy was originally for — protecting your income while you were the breadwinner — that job is done. But the policy is still charging you $400 a month for the next 15 years, and the cash-value side projects at about 3-4% over that time. You're paying for cover you no longer need, and your savings side is barely keeping up with inflation.*
>
> *The cleaner move: stop premiums on the existing whole-life. Let it go paid-up. Take the accumulated cash value — roughly $50K — and redirect it as a lump-sum top-up into a fresh APA. Then redirect the $400/mo into the APA's regular premium.*
>
> *Combined at 65: around $256K versus your current trajectory of ~$120K at 70. Different shape, much bigger pot, full liquidity."*

### The four-question honesty check before recommending

Before writing the proposal, run these four:

1. What's the current cash value if surrendered today? Pull the in-force illustration.
2. What's the surrender penalty? After 15+ years it's usually near-zero — verify, don't assume.
3. What's the projected APA value at 65 with the lump-sum + monthly redirect?
4. Is the cover loss material? Anyone still materially dependent on their income?

If all four answer in favour of the move, the restructure is a clean win. If question 4 doesn't — they still have a working spouse depending on them, or a younger child — keep a small term backup ($200K-$500K decreasing term till 70 is usually enough).

### What closed

The full restructure: whole-life surrendered (zero penalty after 18 years), $50K cash unlocked as APA top-up, $400/mo redirected as APA regular premium continuous to 65. A small $300K decreasing term till 70 layered alongside for residual cover. Same monthly outflow. Projected retirement pot more than doubled.

### The lesson for any FC

The pre-retiree cash-value redirect is one of the highest-leverage moves in the book. The prospect already has the capital and the cash flow — they just need the structure rearranged. The opening line isn't about Pru/AIA/anyone — it's about the policy whose job is done. Once the prospect sees that the cover need has changed but the structure hasn't, the restructure logic writes itself.
`,

  "apa-e": `
### Who they were

A 45-year-old peak earner. Household income $200K+, no major dependants left in the system, fixed costs handled, sitting on $1,500-2,000/mo of surplus cash flow they want to allocate to long-term wealth. They have some legacy ILP or middling endowment from earlier years. They know they have a 20-year window before retirement and they want to build a serious retirement engine in the time they have left.

### What they were considering

The mid-career prospect at this profile typically self-anchors at "around $600/mo seems reasonable" — they're used to thinking of premium in mortgage-payment terms. The case isn't about convincing them they have the money. The case is about why the *premium tier* matters more than the absolute number.

### Where it broke down (for most FCs working this prospect)

Most FCs miss the structural asymmetry of APA's Welcome Bonus tier 1. Premium at $600/mo lands in the lower bonus tier. Premium at $1,200/mo ($14,400/yr annualised) hits tier 1: **15% Y1 + 18% Y2 + 20% Y3 = 53% across Y1-3 = $7,632 of bonus stack on $43,200 of premium paid in those three years**. That's the structural reason the $1,200/mo entry looks materially smarter than the $600/mo entry that just clips the lower tier.

If the FC doesn't surface the tier curve, the prospect anchors at $600 and the case closes at a fraction of its real ceiling.

### The reframe

This prospect doesn't need the "wealth building" story — they understand it. They need the *tier-stack math* exposed. The Welcome Bonus stack is contractually paid in Y1-3 regardless of market performance — it's a guaranteed kicker. Add the Special Bonus from Y10 (5% then 8% of annualised premium per year) and the 0% supplementary from Y11. The bonus structure is doing two things a DIY ETF can't replicate at this premium level: loading the front, and removing the recurring drag from the back.

### The numbers, side by side

$1,200/mo APA, continuous pay age 45 → 65 (20 years, $273,600 total premium):

| Age | At 8% | At 4% floor |
|---|---|---|
| 50 | $83,143 | — |
| 55 | $174,766 | $145,634 |
| 60 | $342,187 | — |
| **65** | **$549,836** | **$362,030** |

Premium-to-value multiple at 65 is ~2.0× — much lower than younger-prospect cases (40 years of compounding vs 20). Be honest about this when pitching — the raw return isn't where this case wins. It wins on the structural certainty.

### What the pitch sounded like

> *"At your premium level — $1,200 a month — you hit the top Welcome Bonus tier. Year 1 you get 15% bonus on your premium. Year 2: 18%. Year 3: 20%. Across Year 1-3, the bonus stack is 53% of your annual premium — that's $7,632 of bonus added on top of $43,200 of premium you've paid in. It's like a 17% kicker in the first three years before compounding even starts.*
>
> *Then from Year 11 onwards, the supplementary charge cliffs to zero, and the Special Bonus kicks in at 5% of annualised premium per year — going to 8% from year 21 — credited every year you keep paying. The structure is doing two things you can't replicate with a DIY ETF: it's loading the front with bonuses, and removing the recurring drag from the back.*
>
> *At 65, on the 8% projection, continuous-pay $1,200 a month across 20 years projects to $549,836."*

### What closed

$1,200/mo APA on continuous-pay to 65. Welcome Bonus tier 1 locked in. The legacy ILP was costed honestly — modest paid-up status, no full restructure (the legacy plan's cash value was decent and the surrender penalty was non-trivial at that stage).

### The lesson for any FC

The mid-career peak-earner case is *not* won on raw ROI — the 20-year window is too short. It's won on structural certainty: the Welcome Bonus stack, the 0% supplementary cliff, the Special Bonus from Y10, the secondary-insured for legacy. Bring the tier curve out explicitly. Most prospects at $200K+ household income can stretch to the $12K+ annualised tier — they just need to see the bonus differential to justify it. Show the curve.
`,

  "apa-f": `
### Who they were

A 30-year-old prospect with $50K-$100K already sitting in Endowus, StashAway, iFAST, or Tiger Brokers. Finance-aware. Knows what FMC means. Reads finance content. Comfortable with markets, comfortable picking allocation. This isn't a prospect who needs APA *explained* — they need APA *positioned* as a different job from what they're already doing.

### What they had

A working DIY portfolio at the trading-account layer. $50K-$100K, short-to-medium horizon, active management, occasional tilts. They like it. They know how it works. They will fight you if you try to position APA as a "better" version of it.

### Where it broke down (when FCs work this prospect badly)

The mistake most FCs make: positioning APA as a replacement for DIY. The finance-aware prospect eats this pitch alive on cost, on platform, on flexibility. They aren't wrong — at the trading-account layer, DIY is structurally better than an ILP. The framing has to change.

DIY platforms and APA aren't doing the same job:

- **DIY (Endowus / StashAway / Tiger / IBKR)** — trading-account layer. $10K-$100K, short-to-medium term, prospect-managed, high-effort.
- **APA** — retirement-portfolio layer. $300K-$2M+ target by 65, long-term, professionally managed, no market-timing temptation, Welcome + Special Bonus stack the DIY platforms can't replicate.

Same money, two different tools, two different jobs. The pitch is *not* "switch from DIY to APA." It's *"keep doing DIY for what it does well, and run APA alongside as the retirement layer."*

### The reframe

The structural argument is about cost curve, not cost level. DIY platforms charge 0.4-0.6% AUM fee. That's fair for what they do — fund execution and rebalancing on the trading-account side. But that 0.4-0.6% applies forever, every year, on the entire balance. On a $1M retirement pot at 65, that's $4,000-$6,000/year in fee drag, perpetually.

APA's cost curve is the opposite. 3.9% supplementary in Y1-10, then 0% from Y11. Welcome Bonus tier 1 at the $1,000/mo level ($12,000/yr): 15% + 18% + 20% across Y1-3 = $6,360 in guaranteed bonus credits. From Y10 onwards the Special Bonus credits 5% then 8% of annualised premium every year premium is paid.

Front-loaded charge, back-loaded bonuses. Different cost curve, different job.

### The numbers, side by side

$1,000/mo APA, continuous pay 30 → 65 (35 years, $408,000 total premium):

| Age | At 8% | Cumulative premium |
|---|---|---|
| 35 | $69,286 | $60,000 |
| 40 | $145,638 | $120,000 |
| 45 | $285,156 | $180,000 |
| 55 | $732,263 | $300,000 |
| **65** | **$1,595,164** | **$408,000** |

That's the retirement layer. The Endowus portfolio keeps doing the trading-account layer alongside.

### What the pitch sounded like

> *"You're already doing the trading-account layer well. Your Endowus portfolio is doing what Endowus does. I'm not going to tell you to move that.*
>
> *What I want to show you is a different layer: the retirement portfolio.*
>
> *Endowus charges 0.4-0.6% AUM fee. That's fair for what it does. But that 0.4-0.6% applies forever, every year, on the entire balance. On a $1M retirement pot at 65, that's $4,000-$6,000 a year in fee drag, perpetually.*
>
> *APA's structure is the opposite. 3.9% supplementary charge in the first 10 years, then it cliffs to zero from year 11. At $1,000 a month, you hit the top Welcome Bonus tier — 15% / 18% / 20% across Y1-3 = $6,360 of bonus credits in the first three years. From year 10 onwards the Special Bonus credits 5% of your annualised premium every year, going to 8% from year 21.*
>
> *Different cost curve. Front-loaded charge, back-loaded bonuses. On $1,000 a month continuous to 65 — $408K total in — the engine projects $1,595,164 at 65. Your Endowus portfolio keeps doing its job. This is the second engine running alongside it."*

### What closed

$1,000/mo APA on continuous-pay to 65, Welcome Bonus tier 1 attached. The DIY portfolio stayed exactly where it was — not touched, not migrated, not "rebalanced." That's the structural integrity of the close.

### The lesson for any FC

The DIY-savvy prospect is the future of every advisor's book. They won't be sold by "trust me, this is better than what you have" — they need to see the structural difference and conclude it themselves. The pitch architecture for this prospect is *additive, not replacement*. Same prospect, two parallel engines. The moment you try to displace the DIY portfolio, you've lost them.
`,

  "apa-g": `
### Who they were

The same 25-year-old from Case B — cross-shopping FWD vs APA before signing anything. The prospect wants the apples-to-apples answer: *same money in, what comes out?*

This case is the front-load shape variant of Case B. When matched-duration ($600/mo × 25 yrs both sides) gives FWD a slim raw-return win, the front-load shape flips the result.

### What they were being quoted

FWD Invest First Summit — $600/mo for 25 years = $180,000 total premium.

### The structural question

Same total premium outlay. Different shape. FWD pays $180K over 25 years at $600/mo. What does $180K paid into APA over 10 years at $1,500/mo look like?

The answer is the case that wins the cross-shop.

### Where the shape matters

Front-loaded dollars get more compounding time before deductions slow them down. APA's structure rewards this specifically — the Welcome Bonus stack credits 15/18/20% in Y1-3, supplementary cuts to 0% from Y11, Special Bonus credits 5% (then 8%) of annualised premium every year premium is paid. On the 10-year IIP, you're stacking the Welcome Bonus on the biggest dollars and giving them the longest compounding runway.

The FWD prospect doesn't see this — they're comparing monthly premium ($600 vs $1,500) and reading the larger APA monthly as "more expensive." Show them the total premium, not the monthly. Same $180K. Different shape.

### The numbers, side by side

$1,500/mo APA, 10-yr IIP, age 25 → 65:

| Age | At 8% | At 4% floor |
|---|---|---|
| 30 | $103,929 | — |
| 35 | $218,457 | $182,043 |
| 45 | $444,032 | $253,698 |
| 55 | $866,970 | $339,628 |
| 60 | $1,211,431 | — |
| **65** | **$1,692,753** | **$454,662** |

Versus FWD:

| Setup | Monthly | Pay term | Total premium | At 65 (8%) | Multiple |
|---|---|---|---|---|---|
| FWD Invest First Summit | $600 | 25 years | $180,000 | $1,306,872 | 7.26× |
| **APA 10-yr IIP at $1,500/mo** | **$1,500** | **10 years** | **$180,000** | **$1,692,753** | **9.40×** |

Same money in. APA delivers $385,881 more at 65.

Plus a cash-flow advantage: after Year 10, APA stops taking premium. The FWD prospect is still paying $600/mo through age 50 — another $108,000 of cash flow committed to premiums between Y11 and Y25. The APA prospect has 15 freed years where the $1,500/mo budget is gone — available for second APA, kids' education, additional cover, early-retirement runway.

### What the pitch sounded like

> *"Let's do the apples-to-apples. You're being quoted FWD at $600 a month for 25 years — $180,000 total premium going in over your career. At 65, FWD's 8% projection on their own illustration shows $1,306,872 surrender value.*
>
> *Same exact $180,000 going into APA. The shape is different: $1,500 a month for 10 years instead of $600 for 25. Same money, just front-loaded. After year 10, APA stops taking premium — your monthly is freed for the next 30 years.*
>
> *At 65, APA's 8% projection on $180K paid in projects $1,692,753. That's $385,881 more than FWD on the exact same money in. And you stop paying after 10 years. FWD makes you pay for 25.*
>
> *The reason: APA cliffs the supplementary charge to zero from year 11, FWD never does. APA gives you a 15-18-20% Welcome Bonus stack in years 1-3, FWD doesn't. APA gives you a 5%-then-8% Special Bonus from year 10 onwards, FWD doesn't. The structure is different — and the math at 65 reflects it."*

### What closed

$1,500/mo APA 10-yr IIP. FWD didn't sign. The prospect walked out with the cash-flow advantage clearly understood — Y11-25 freed for whatever life looked like by then.

### The lesson for any FC

When the matched-duration FWD comparison comes close (within ~10% on raw return), the shape move wins. Same total premium, front-loaded into 10 years vs stretched over 25. The math compounds harder, the bonus stack credits on bigger Y1-3 dollars, and the prospect walks away with 15 years of freed cash flow on the back end. Always have both shape options ready — Case B for matched-duration and Case G for front-load.
`,

  "apa-h": `
### Who they were

A 30-year-old sold a $1,000/mo HSBC Pulsar plan — the AXA-legacy ILP. The Pulsar pitch lives on the 168% startup bonus — a visually compelling number on a pitch deck. The prospect remembers the bonus. They don't remember (or never saw) the net-yield calculation.

### What they were paying

$1,000/mo into Pulsar. USD-denominated funds. Stated projection rates of 4% and 8%. Underneath: FMC of 1-1.5%, advisory fee up to 1%, ongoing charge perpetual.

### Where it broke down

The Pulsar illustration shows *gross* returns. The net yield — what the prospect keeps after every fee — is dramatically lower:

| Stated projection | Pulsar net yield | APA net yield |
|---|---|---|
| 4% gross | **0.83%** | **2.74%** |
| 8% gross | **4.7%** | **6.68%** |

The 4% case is the regulatory floor. **Pulsar's net yield at the regulatory floor is below CPF OA's guaranteed 2.5%.** That isn't a wealth product. It's structured underperformance with a 168% startup-bonus headline distracting from it.

And the USD denomination adds another structural drag: 1.5-2% per year of currency depreciation against SGD over a 25-year horizon. That's 1.5-2 percentage points of effective yield reduction sitting *on top* of the FMC drag.

Plus the stewardship gap. Pulsar is a single-fund ILP — the prospect (or their agent) picks the allocation, and the agent rebalances. Leo has seen real Pulsar portfolios at 50% China / 50% Tech because the original agent went MIA and the prospect never adjusted. The single-fund architecture creates an agent-dependency that breaks the moment the agent disappears.

### The reframe

The 168% startup bonus is real. It's just offset by perpetual fees that never stop deducting. The structural one-liner: APA's curve is high early, then zero. Pulsar's curve is low early, then perpetual. Over a 25-year hold, the 2-percentage-point net-yield gap compounds into roughly 70% more surrender value at the end on the APA side.

### The numbers, side by side

\`simulateTraditionalGrowth(1000, 30, 65, 8)\` — 25-yr premium pay matching Pulsar's typical structure:

| Age | At 8% | At 4% floor |
|---|---|---|
| 35 | $69,286 | — |
| 45 | $285,156 | — |
| 55 | $732,263 | $314,292 |
| **65** | **$1,429,738** | **$578,850** |

Total premium paid: $300,000. Versus Pulsar at the same monthly, where the net-yield drag erodes roughly 70% of the surrender-value gap by 65.

### What the pitch sounded like

> *"Pull up your Pulsar illustration. They show you 4% and 8% projection rates — those are the gross returns before any of their charges apply. Now look at their fee schedule: FMC of 1-1.5%, advisory fee up to 1%, ongoing charge perpetual. By the time you account for everything, your net yield at the 4% projection is 0.83%. That's below what your CPF Ordinary Account guarantees you — 2.5%, no risk.*
>
> *At the 8% projection, your net is 4.7%. APA's equivalent net at 8% is 6.68%. Over a 25-year hold, that 2-percentage-point gap compounds into roughly 70% more surrender value at the end.*
>
> *The 168% startup bonus you were sold on is real — but it's offset by perpetual fees that just keep deducting forever. APA's curve is the opposite: heavy charges in Y1-10, then cliff to zero from Y11 onwards, with the Special Bonus stack credited every year you keep paying."*

### What closed

For prospects pre-signing, the comparison is decisive — 2-3× higher net yield at both 4% and 8% projections. For Pulsar prospects already locked in, the math has to be costed case-by-case. The 168% startup bonus may be partially clawed back on early surrender — verify in the in-force illustration before recommending the move.

### The lesson for any FC

The Pulsar prospect's anchor is the 168% bonus number. Don't argue the number — argue the curve. Walk them through their *own* illustration's net-yield calculation step by step. Then put APA's curve next to it. The bonus is real but it's the structural equivalent of a "100% off your first month" subscription pitch — meaningful for one moment, meaningless against the lifetime cost. This pattern repeats across every "high startup bonus" competitor ILP (Pulsar, Tokio Marine, Manulife Invest Ready). Drill the net-yield calculation once and it transfers across them all.
`,

  "apa-i": `
### Who they were

A 30-year-old SGD professional. Sold a $2,000/mo Tokio Marine ILP through an "Independent Financial Adviser" — branded as objective, unbiased, cross-company advice. What got placed: one product, from one company.

### What they were paying

$2,000/mo into Tokio Marine. The pitch hung on:

- The "Independent" framing
- A 120% startup bonus rate
- The IFA's claim of company-agnostic advice

The reality: a fee stack that never stops deducting, a 30-year surrender lock, and an IFA channel where the original placing agent will likely be at a different firm before year 5.

### Where it broke down

Three structural flaws — and one framing flaw.

**Framing flaw — "Independent" sounds objective but means "still only sold you one product."** The IFA could have placed APA, Singlife, Manulife, AIA, Pru, FWD. They picked Tokio. The "Independent" label is brand positioning, not a guarantee of cross-company comparison.

**Fee-stack flaw.** Tokio's structure stacks three perpetual fees:

| Cost dimension | Tokio Marine | AIA APA |
|---|---|---|
| FMC | ~1.3-1.5% | ~1.0% on the Adventurous Index Fund |
| Advisory fee | **1.0% p.a. perpetual** | 0% — built into supplementary during Y1-10 only |
| Ongoing charge | **1.2% p.a. perpetual** | 3.9% Y1-10, **0% from Y11** |
| Surrender lock | **30 years** | 10 years (0% surrender charge from Y11) |
| Startup bonus | 120% gimmick | 15/18/20% Welcome Bonus on premium |

**Lock-in flaw.** 30-year surrender lock. If anything changes — retrenchment, medical emergency, premium pause needed — the surrender charge eats principal. APA cliffs to 0% surrender charge from Y11.

**Agent-continuity flaw.** IFA channels rotate. The Finexis → Synergy IFA pattern Leo has seen multiple times — the placing agent leaves, the case gets passed to whoever is available, who leaves a year later. By year 5 the policy is effectively orphaned.

### The reframe

"Independent" is marketing language. The real comparison is the cost curve over 30 years. Tokio's three perpetual fee layers compound on a growing base. At $3M of account value, 3.5% of perpetual fees is $105,000 per year — forever. APA's curve runs the opposite direction: heavy in Y1-10, zero from Y11, with the Special Bonus crediting 5% (then 8%) of annualised premium every year premium is paid.

### The numbers, side by side

\`simulateTraditionalGrowth(2000, 30, 65, 8)\` continuous pay:

| Age | At 8% | At 4% floor |
|---|---|---|
| 35 | $138,571 | — |
| 45 | $570,312 | $427,736 |
| 55 | $1,464,526 | $864,790 |
| 65 | **$3,190,328** | **$1,428,377** |

From Leo's real Tokio Marine case: **AIA $5M vs Tokio $3.8M long-term = $1.2M gap** on the same $24K/year outflow (the $5M figure runs to a later age — 75 or 80 per the iPOS illustration; verify the time horizon when citing). The structural reason for the gap is consistent across both views: APA's supplementary cliffs at Y11, Tokio's three fees never do.

### What the pitch sounded like

> *"You're paying $2,000 a month for 30 years. That's $720K of premium. Tokio's projection at the end of the lock-in shows you around $3.8M long-term. AIA's projection at the same money — same monthly, same horizon — shows you around $5M. $1.2M difference.*
>
> *The reason: Tokio's fees never stop deducting. There's a 1.3% FMC inside the fund, a 1% advisory fee on top of that, and a 1.2% ongoing charge perpetually. As your account value grows, those percentages turn into bigger and bigger dollar amounts. At $3M of account value, 3.5% of perpetual fees is $105,000 per year — forever.*
>
> *AIA's curve is opposite. 3.9% supplementary in Y1-10, then 0% from Y11. The Special Bonus actually credits 5% then 8% of your annualised premium every year from Y10 onwards. The longer you hold, the less you pay in fees — and the more bonus you accrue.*
>
> *And Tokio locks you in for 30 years. If you surrender before then, the surrender charge eats your principal. APA's surrender cliffs to 0% from Year 11. If your life situation changes, APA gives you the flexibility. Tokio doesn't."*

### What closed

For pre-sign prospects, the case usually closes on the fee-stack comparison plus the lock-in attack. For locked-in Tokio holders, the math has to be costed — the 120% startup bonus may have a clawback, the 30-year lock has explicit surrender penalties. Sometimes the right answer is paid-up status + redirect, not full surrender.

### The lesson for any FC

The "Independent / IFA" framing is one of the most common cross-shop attacks you'll see. The instinct is to argue the word "Independent." Don't. Argue the cost curve, the lock-in, and the agent-continuity pattern. The prospect bought the brand-positioning of "independence" — the structural argument is that tied AIA agents have 30-year compensation alignment and AIA's fee curve actually goes to zero. Different category of certainty. Different category of relationship.
`,

  "apa-j": `
### Who they were

A working adult, around 30. Cold-called by a DBS banker. Sold a Manulife Ready Income plan because "the bank rep said it's a good retirement plan." Then never heard from the banker again.

### What they had

| Manulife Ready Income line | Amount |
|---|---|
| Annual premium | $4,200 |
| Premium term | 10 years |
| Total premium paid | $42,000 |
| Cash value at 65 | **$42,000** (~0% real return) |
| Retirement income from 65 | **$1,200/yr = $100/mo** |

Pull up the illustration. The "retirement income" the prospect was sold on is $100/mo at age 65. In a 2.5%-inflation-adjusted world, $100/mo at 65 won't cover one utility bill.

### Where it broke down

Two layers — the product, and the channel.

**Product flaw.** Manulife Ready Income is structurally a low-yield endowment dressed up as a "retirement income" plan. $42K in, $42K out, $100/mo income stream. Effectively 0% real return on the money. CPF OA's guaranteed 2.5% would do better than this.

**Channel flaw.** DBS bankers don't service the policy after sale. The compensation model rewards initial placement, not ongoing servicing. The banker calls, sells, takes the commission, and rotates roles within 12-24 months. The next banker who "services" the prospect's case has never met them. By year 3 the plan is effectively orphaned.

### The reframe

Same $42,000 of premium. Same 10-year pay term. Re-routed into APA, switched to dividend mode at 65. The structural difference isn't about taking on more risk — it's about the structural inefficiency of the original product.

### The numbers, side by side

\`simulateTraditionalGrowth(350, 30, 65, 8)\` — 10-yr IIP matching Manulife's premium term:

| Age | At 8% | At 4% floor |
|---|---|---|
| 40 | $48,279 | — |
| 50 | $98,131 | $56,399 |
| 60 | $191,600 | — |
| **65** | **$267,725** | **$87,357** |

At 65 with $267,725 in APA, switching to dividend mode at 7% yield (GDIF default): roughly $18,740/yr = **$1,562/mo** of retirement income — for life, with capital preserved.

**15× the Manulife income stream from the same $42K of premium.**

### What the pitch sounded like

> *"Your DBS banker sold you Manulife Ready Income at $4,200 a year for 10 years — $42,000 total. Pull up the illustration: at 65, you get back about $42,000 in cash value, and a retirement income of $1,200 a year. That's $100 a month. Inflated forward 35 years, $100 a month at age 65 won't even cover one utility bill.*
>
> *Same exact $42,000 going into APA at $350 a month for 10 years. At 65 on the 8% projection, you have $267,725 sitting in the policy. Switch on dividend mode, you get roughly $1,500 a month of retirement income, for life, and your capital stays intact. Same money in. 15× the retirement income out.*
>
> *And — your DBS banker. When was the last time they followed up with you? They don't service the policy after the sale. They're pure transactional. You don't have an agent — you have a salesperson who closed you and moved on. When they leave the bank in 2-3 years, the policy gets passed to whoever happens to handle it next — usually a different banker who's never met you."*

### What closed

The full restructure: Manulife Ready Income surrendered, $42K of freed premium redirected as APA top-up + 10-year IIP at $350/mo. The dividend-mode reframe was what closed it — the prospect had been told they were "building retirement income" but had never seen the actual monthly number ($100) until the meeting.

### The lesson for any FC

The banker-channel prospect is one of the easiest closes in the book *if* you can get the in-force illustration in front of them. They were sold on the *idea* of retirement income without ever being shown the actual dollar amount the plan delivers. Once they see $100/mo against the inflation-adjusted reality of age 65, the math closes the case for you. The closer line — *"You don't have an agent — you have a salesperson who closed you and moved on"* — is the emotional anchor that converts the structural math into a felt decision.
`,

  "apa-k": `
### Who they were

A 30-year-old young professional. Sold a GE Flexi-cash endowment by a friend who's since left the industry. The policy has been sitting untouched for 5+ years — the friend never reviewed it, the prospect never thought about it. The classic orphaned-policy case.

### What they had

| GE Flexi-cash line | Amount |
|---|---|
| Annual premium | $6,000 |
| Premium term | 25 years |
| Total premium paid | $150,000 |
| Maturity value at 25 yrs (age 55) | **$200,000** |
| Break-even point | **Year 20** (i.e., 20 years to recover principal) |
| Effective return | **<3% p.a.** |

For the first 20 years of holding this policy, they're underwater on what they put in. Effective return under 3%. The "savings plan" label is misleading — at sub-3% effective, this is structurally inferior to CPF OA at 2.5% guaranteed (and CPF OA is liquid).

### Where it broke down

Endowments are designed for capital preservation, not growth. They're positioned as "safe savings" but at the cost of meaningful return. If the prospect wanted true safety at 2.5% guaranteed, CPF OA does that without any insurance wrapper. If they wanted growth, an ILP is the structural answer. GE Flexi-cash sits in the worst part of the trade-off — neither high-yield nor truly guaranteed.

Plus the orphan-pattern overlay. The friend-agent left the industry years ago. No one has reviewed this policy with the prospect in five+ years. The plan keeps deducting premium every month and no one is watching what it delivers.

### The reframe

Don't attack GE — attack the structural choice between "safe at 2.5% guaranteed" and "growth at 6-8% projected." A 25-year endowment delivering <3% effective sits in neither bucket. It's the worst of both worlds. The cleaner answer for someone with a 35-year horizon to 65 is an ILP that captures growth.

### The numbers, side by side

\`simulateTraditionalGrowth(500, 30, 65, 8)\` with 25-yr continuous pay (matching GE's outlay):

| Age | At 8% | At 4% floor |
|---|---|---|
| 35 | $32,630 | — |
| 45 | $139,051 | $104,775 |
| 55 | $359,245 | $213,308 |
| **65** | **$701,423** | **$285,557** |

Total premium paid: $150,000 — matching GE's outlay exactly.

At 55 (GE's maturity), APA delivers ~$359K versus GE's $200K — already 80% more. Hold to 65: $701,423. **3.5× what GE delivers** on the same money in.

### What the pitch sounded like

> *"Your GE Flexi-cash plan is paying $6,000 a year for 25 years — $150,000 of premium going in. At maturity at 55, you get back $200,000. Break-even point — when you first have your principal back — is at year 20. So for the first 20 years of holding this plan, you're underwater on what you put in. Effective return: under 3% per year.*
>
> *Same exact $150,000 going into APA at $500/mo for 25 years. At 55, you have around $359K — already 80% more than GE delivers at the same age. Hold to 65, you have $701,423 — that's 3.5× what GE delivers. Same money in.*
>
> *The reason GE underperforms here isn't bad luck — it's structural. Endowments are designed for capital preservation, not growth. They're positioned as 'safe savings' but at the cost of meaningful return. If you wanted real safety at 2.5% guaranteed, CPF OA does that without any insurance wrapper. If you wanted growth, an investment-linked plan is the structural answer."*

### What closed

For mid-tenure GE Flexi-cash holders, the answer depends on surrender penalty. Most endowments have heavy penalties in the early years that ease off after Y15-20. If the prospect is 8+ years in, the penalty is usually modest — cash value redirected as APA top-up is the cleaner move. If they're earlier than that, paid-up status + redirect the freed monthly premium often beats full surrender.

### The lesson for any FC

The orphaned-endowment case has two attack vectors: the structural underperformance (the math), and the relationship erosion (the friend-agent who left). The structural math closes the case logically. The orphan-pattern observation — *"who has been reviewing this with you?"* — closes it emotionally. Pull the in-force illustration before the appointment. Calculate the effective return. Show it next to APA's projection at the same money. Endowments at <3% effective are structurally indefensible against an ILP at 6-8% projected over the same horizon.
`,

  "apa-gm": `
### Who they were

A working adult who walked in saying they wanted to "increase their investments by $50 a month." A small ask. The kind of conversation most FCs would have closed at $50/mo and called it a win.

What changed the case wasn't a pitch. It was Goals Mapper.

### What they had

$200K-$300K sitting in the bank. Modest existing savings habit. No clear retirement plan. They were doing the prudent-feeling thing — keeping cash liquid for "in case something happens" — without seeing what that liquidity costs them on the retirement timeline.

### Where it broke down

The structural blind spot is liquidity-fear at the *expense* of compounding. They felt safer keeping the money in cash because it's available "any time." What they couldn't see, until Goals Mapper showed it, was the trade: a 60-year-old with cash but no compounding engine runs out by their late 60s. A 60-year-old with $800/mo invested has cash that lasts to 85.

Same retirement spending. Dramatically different sustainability. Until they saw both scenarios side by side, the trade-off was invisible.

### The reframe

This wasn't a number-vs-number close. It was a **two-scenarios-side-by-side** close, using Goals Mapper as the visualisation tool.

- **Scenario 1: do nothing.** Keep the $200-300K liquid. Continue saving $50/mo. At retirement, cash runs out at 60.
- **Scenario 2: redirect $800/mo into APA.** Same retirement lifestyle. Cash lasts till 85.

The prospect's stated intent was +$50/mo. The Goals Mapper visualisation pulled the real anchor to +$800/mo because the prospect could see — visually, not abstractly — that the smaller commitment doesn't solve the actual problem.

### The numbers, side by side

The headline: **$50/mo intent → $9,600/yr close. 16× the original ask.**

Goals Mapper showed the prospect two retirement runways at the same annual spend:

| Path | Retirement spend | When cash runs out |
|---|---|---|
| Keep cash liquid, save $50/mo | Same monthly spend at retirement | **Age 60** |
| Redirect $800/mo into APA | Same monthly spend at retirement | **Age 85** |

Same retirement. Twenty-five additional years of sustainability. The 16× upsell wasn't a stretch — it was the answer Goals Mapper surfaced once liquidity-fear got reframed against actual longevity risk.

### What the pitch sounded like

> *"You came in wanting to add $50 a month to your investments. Let me show you what that looks like on the Goals Mapper, alongside what $800 a month looks like. Same retirement lifestyle. Same monthly spend at 65.*
>
> *On $50 a month, your cash runs out around age 60. On $800 a month into APA, your cash lasts till 85. Same monthly retirement spend. Twenty-five additional years of having money to spend.*
>
> *The reason you're holding $200-300K in the bank is because it feels safer — you can get to it any time. But that liquidity comes at a cost. The cost is that the money isn't compounding while it sits there. Cash sitting in the bank loses to inflation; cash in APA compounds at the projection rate.*
>
> *I'm not asking you to lock up the $200-300K. Keep your emergency fund. Redirect $800/mo of recurring income into APA. Different bucket, different job, same liquidity for the emergency fund piece."*

### What closed

$9,600/yr APA — 16× the prospect's original $50/mo intent. The breakthrough came from the visualisation, not the math. The prospect's existing mental model was "$50/mo is what I'm willing to commit." Goals Mapper showed them that $50/mo doesn't solve the actual problem they're worried about.

### The lesson for any FC

The Goals Mapper case is a discipline lesson: never close on the prospect's *stated* number when the visualisation tells you their actual problem is bigger. The prospect anchored at $50/mo because that's what felt comfortable. The job of the appointment is to surface the actual trade-off (liquidity vs sustainability) and let the tool do the showing. The 16× upsell isn't aggressive selling — it's honest reframing of what the prospect's stated goal actually requires.

When you have a prospect with significant idle cash and a small stated investment intent, Goals Mapper is the close. Use it.
`,

  // ─── PWV ─────────────────────────────────────────────────────────────────

  "pwv-l": `
### Who they were

A 50-year-old pre-retiree. Citibank private banker had proposed a $300K Premier Income Wealth (PIW). The prospect's source funds were sitting in Ringgit at a Malaysian bank, earning about 1.2% on fixed deposits. They wanted *something better than FD yields*. Citi quoted them PIW at 4.39% p.a. on USD-denominated US bonds. On the brochure, that's a 3-4× yield improvement. The pitch was easy.

### What they were being quoted

- $300K single-premium PIW
- Headline yield: 4.39% p.a.
- USD-denominated (US bonds)
- Citi positions it as a "premium" wealth instrument because of the private-banking channel

### Where it broke down

The 4.39% headline yield is right on the brochure. What Citi doesn't show: it's USD-denominated, and over a 15-year horizon, USD typically depreciates 1.5-2% per year against SGD. Strip the FX risk and the **real net return is closer to 3%** — and the prospect carries currency risk for the entire holding period.

Plus the secondary issue: no Singapore safety net, no SDIC backing, no familiar regulatory recourse. The "premium" framing of private-banking-channel PIW is largely brand positioning. Structurally, the prospect is being asked to take a USD currency bet to earn 3% real after the FX drag.

### The reframe

Same money. SGD instead of USD. Comparable or better net yield. And — depending on the prospect's goal — a structure that pays monthly income or keeps capital for inheritance.

Three AIA SGD-denominated alternatives, all at 3.5-3.9% net with no FX exposure:

| Product | Currency | Net yield | Capital preservation | Notes |
|---|---|---|---|---|
| Citibank PIW | USD | ~3% after FX | Yes (US bonds, principal at maturity) | Currency risk, no SG safety net |
| **AIA Smart Wealth Builder (SWB)** | SGD | 3.62-3.70% p.a. | Yes (par fund) | Endowment, capital guaranteed at maturity |
| **AIA Platinum Gift for Life (PGLP)** | SGD | ~3.5% p.a. dividends from Y4 | Yes (lifelong) | 3-generation play, secondary insured supported |
| **AIA Retirement Saver (RS)** | SGD | ~3.90% p.a. | Yes | Monthly retirement income from start |

### What the pitch sounded like

> *"Citibank quoted you 4.39% on a $300K PIW. That number is right on the brochure. What they didn't show you: it's USD-denominated, and over a 15-year horizon, USD typically depreciates 1.5-2% per year against SGD. So your real net return is closer to 3% — and you carry the currency risk for the entire holding period.*
>
> *On the SGD side, we have three options that all sit at 3.5-3.9% net, with no FX exposure. Same return, less risk. And if you want monthly income flowing rather than just accumulation, Retirement Saver gives you ~3.9% as a monthly dividend stream from year 1, or PGLP gives you ~3.5% income from year 4 onwards while the capital stays locked for life — that's a passive-income engine for you, and a managed-policy inheritance for your spouse and kids.*
>
> *Same money. SGD instead of USD. No FX risk. Comparable or better net yield. And — for the PGLP route — the capital stays in the policy for life and gets inherited with the dividend stream still flowing. The PIW pays you back the principal at maturity. PGLP keeps the principal earning for you, your spouse, and your kids."*

### What closed

PGLP closed because the prospect's deeper interest wasn't "best yield" — it was "what happens to this money when I'm gone." PGLP's secondary-insured + lifelong dividend mechanic answered that. Same $300K, SGD, no FX, with a 3-generation legacy structure.

### The lesson for any FC

Private-banking-channel USD-denominated products are everywhere in the pre-retiree segment. They look premium because of the channel, but structurally they fail the FX drag test on long-horizon SGD prospects. The pitch isn't *"Citi is bad"* — it's *"same money, SGD, no FX, with a structure that matches what you actually want this money to do over 20-30 years."* Always surface what the prospect wants the *capital* to do at the end (income for life? lump sum for kids? both?) — that's what selects PGLP vs RS vs SWB.
`,

  "pwv-m": `
### Who they were

A 58-year-old pre-retiree. Two slugs of capital sitting idle:

- **$185K in CPF OA** — earning 2.5% now, then dropping to 0% after 65 (or getting locked into RA on top-up).
- **$52K matured Prudential payout** — sitting in a bank savings account at ~0.5%.

Plus a legacy AIA Pro Achiever from years back at 1.4% IRR (poorly performing — can be paid-up and redirected) and an existing AIA private hospital plan with rider.

The case looks fine on the surface. Capital is "preserved." Hospital cover is in place. But the structure is doing nothing for the next 25-30 years of retirement.

### Where it broke down

The pre-retiree's biggest blind spot: **hospital plan premiums escalate steeply from age 60 onwards.** A private hospital plan that costs $1,000/yr in their 40s costs $3,000-5,000/yr in their 60s and **$8,000-12,000/yr in their 70s**. Over a 30-year retirement, that's **$200K-$400K of cumulative hospital premiums alone**.

If the prospect funds these from OA drawdown or savings, they're chipping away at the principal. By 85, the principal is materially smaller — sometimes zero. Their bequest at death: $0.

The do-nothing scenario looks fine in their 60s. It collapses in their 80s.

### The reframe

Stop funding hospital premiums from depleting capital. Redirect the idle capital ($237K combined) into a dividend pot. Use the *dividends* to fund the hospital plan. Principal stays intact. Capital gets inherited.

Same $237K. Different job.

### The numbers, side by side

| Scenario | OA / cash trajectory | Bequest at 85 |
|---|---|---|
| **Do nothing** — keep OA in CPF, fund hospital premiums from drawdown | Depletes from $237K to ~$0 by age 85-90 | $0 |
| **Redirect** — $237K into PWV dividend mode | Capital stays at $237K, generates dividends that cover hospital + lifestyle | $237K + dividends for spouse |

At 6% dividend yield, $237K = **$14,220/year of dividends** — comfortably covers hospital plan premiums for the rest of life, with surplus for lifestyle. And the secondary-insured mechanic on PWV means the spouse inherits a working dividend engine, not just leftover cash.

### What the pitch sounded like

> *"Your $185K in OA is doing nothing for you after age 65 — interest stops, and if you top up to RA it gets locked. Your $52K Pru payout is sitting in the bank earning 0.5%. Combined that's $237K of capital that's structurally idle.*
>
> *Over the next 25 years, your hospital plan premiums will compound — by your 70s you're paying $8K-12K a year just for the cover. If you fund that from drawdown, that's $200-300K of principal gone over your retirement. Your bequest at 85: zero.*
>
> *Alternative: same $237K, redirected into a PWV dividend-mode policy. At a 6% yield, that's $14,220/year of dividends — perpetually. That covers your hospital plan, leaves something for lifestyle, and the principal stays intact. When you pass, your spouse inherits a working dividend engine, not just the leftover cash. Three generations of income from one redirect today."*

### What closed

The full redirect. $237K into PWV dividend mode. Hospital plan premiums perpetually covered by the dividend stream. Capital preserved for spouse + kids via secondary insured. The Pro Achiever was costed honestly — paid-up status, no full surrender (the 1.4% IRR cash value wasn't worth the surrender penalty hit).

### The lesson for any FC

The "retirement healthcare funding angle" is one of the most underused pitches in the pre-retiree segment. Every prospect at 55+ has *some* combination of idle OA, matured policies, or bank savings sitting at <2%. The pitch isn't about "growing wealth" — it's about *funding the unavoidable spend* (hospital premiums, lifestyle costs) from the dividend stream rather than chipping at principal. The bequest math is the emotional anchor — most pre-retirees haven't done the calculation of "what does my bequest actually look like in the do-nothing scenario?" When you show them, the redirect closes itself.
`,

  "pwv-n": `
### Who they were

A 56-year-old IT manager. Five separate Manulife plans placed by four different DBS bankers over the course of five years. Plus an AIA HSG B-Lite (no rider) and a $40K/year PWV already with Leo.

The portfolio reads "well-diversified." Pull the policy schedule and the structure is the opposite: five separate single-fund products, none being rebalanced, all bought transactionally by bankers who have since rotated out of the relationship.

### What they had — the agent-disappearance map

| Plan | Sold by | Currently serviced? |
|---|---|---|
| Manulife ILP | DBS banker #1 (left 3 yrs ago) | No |
| Manulife savings plan #1 | DBS banker #2 (rotated to different role) | No |
| Manulife savings plan #2 | DBS banker #3 (left the bank) | No |
| Manulife savings plan #3 | DBS banker #4 (current rep, never met the prospect) | No (transactional only) |
| Manulife savings plan #4 | Same DBS banker | No |
| AIA HSG B-Lite (no rider) | Different AIA agent | Not actively reviewed |
| AIA PWV $40K/year | Leo | Yes |

Five separate Manulife plans. Zero active servicing.

### Where it broke down

Two structural issues.

**Banker-channel pattern.** Banker compensation rewards initial placement, not retention. The agent who closed each plan rotated out within 2-3 years. The next banker who "services" the case is someone the prospect has never met. By year 5, every plan is effectively orphaned — premium keeps deducting, no one is monitoring.

**Single-fund architecture.** Manulife savings plans are single-fund products where the prospect (or their agent) is supposed to actively rebalance. With no agent servicing, the allocations drift. Leo has seen prospects with 50% China + 50% Tech because the original agent set that allocation 5 years ago and no one's touched it since.

### The reframe

Audit each of the four Manulife savings plans honestly. Pull the in-force illustrations. Calculate the projected monthly income at 65 from each. Many low-tier Manulife savings plans deliver under $200/mo income at 65 on $100K+ of premium. The case for consolidation writes itself once the actual numbers are on the table.

The framing isn't "Manulife is bad." It's *"You bought from four bankers who don't service you anymore. That's the structural problem — not the brand."*

### What the pitch sounded like

> *"You've got 4 separate Manulife savings plans, bought from 4 different DBS bankers over 5 years. Pull up your statements — when was the last time any of them did a review with you? When was the last time anyone explained how each plan was performing?*
>
> *That's the banker pattern. They close, get the commission, and rotate to a different role within 18-24 months. The next banker who 'services' your case is someone you've never met. By year 5, your plans are effectively orphaned — they keep deducting premiums, but no one's monitoring them.*
>
> *And Manulife specifically — they're single-fund products. Your agent is supposed to actively rebalance the allocation. If no one's doing that, your funds drift. I've seen prospects with 50% China + 50% Tech because the original agent set that allocation 5 years ago and no one's touched it since.*
>
> *We can audit each of the 4 plans, identify the underperformers, and consolidate into a structurally cleaner setup."*

### What closed

The audit. Each of the four Manulife plans pulled, illustrations examined, projected income at 65 calculated per plan. The underperformers got restructured into a consolidated PWV expansion. The HSG B-Lite got upgraded to HSG B + rider (the single biggest hospital-coverage upgrade — waives the $3,500 deductible, caps co-insurance at 5%). The existing PWV stayed and grew.

### The lesson for any FC

The over-bought-and-under-serviced pattern is common in the 50+ banker-channel segment. The prospect doesn't see it because each individual plan looked reasonable at the time of purchase. The aggregate picture is what reveals the orphan problem. The audit itself — pulling each in-force illustration in front of the prospect — is the close. You don't need to "sell" the consolidation. You need to surface the agent-disappearance pattern and let the math do the rest. *"When was the last time anyone reviewed this with you?"* is the question that opens the case.
`,

  "pwv-o": `
### Who they were

A 50-year-old pre-retiree. Currently on track for the Full Retirement Sum (FRS) via SA alone. Holds multiple CI plans (mostly bundled in older life plans with little cash value) and a couple of legacy endowments from their younger years. Considering an ERS top-up — locking another $200K+ into CPF for higher CPF Life payouts at 65.

Stated retirement target: **$7,200/mo at 65**, factoring 2.5% annual inflation on their current $5K/mo lifestyle.

### Where it broke down

The ERS top-up *looks* like the right move on the surface. Guaranteed CPF Life payouts, locked-in income for life, "safest" option. But run the numbers honestly against the alternatives and the structural trade-off becomes clear.

The retirement-gap math:

| Component | Amount |
|---|---|
| Current monthly spending | $5,000 |
| Inflated to age 65 (2.5% × 15 yrs) | $7,200/mo |
| Projected CPF Life payout at 65 (FRS) | ~$1,800/mo |
| **Monthly shortfall** | **$5,400/mo** ($64,800/yr) |
| **Capital needed at 65** (at 6% dividend yield) | **~$1.08M** |

The shortfall is real — $5,400/mo at 65, every month, for life. ERS adds ~$1,500/mo of CPF Life payout for $200K locked in. PWV adds ~$1,000-1,100/mo of dividends for the same $200K with full liquidity and full bequest. Different trade-offs.

### The reframe

ERS makes sense for prospects who need *maximum income certainty* and have *no legacy goals*. PWV makes sense for prospects who want *comparable income, full flexibility, and a structured inheritance*. The right answer depends on what they actually want this $200K to do over 30 years of retirement.

### The numbers, side by side

| Option | $200K committed | Monthly income at 65 | Liquidity | Inheritance |
|---|---|---|---|---|
| **CPF ERS top-up** | $200K to RA | ~$1,500/mo CPF Life | Zero (locked in RA) | Zero bequest after age 80-ish (Standard payout pattern) |
| **AIA PWV (SGD)** | $200K single-premium or phased | ~$1,000-1,100/mo dividends @ 6% yield | Full (surrender any time after Y11) | Full bequest + dividend continuation via secondary insured |
| **DIY (S&P 500 + dividend ETFs)** | $200K | ~$700-900/mo at 5% yield after taxes | Full | 40% US estate tax + 30% dividend withholding — heirs inherit 60-70% |

ERS gives ~50% more monthly income than PWV — but zero bequest after the payout window and zero liquidity. PWV gives slightly lower monthly income with full bequest, full liquidity, and the secondary-insured continuation. Net total benefit over 30 years (income + bequest combined) favours PWV materially.

### What the pitch sounded like

> *"If you top up to ERS, you're committing $200K to CPF for a marginal $1,500/mo income lift. That money is locked, illiquid, and once CPF Life Standard pays out for 30 years, the bequest stops. You've effectively given $200K to CPF.*
>
> *The PWV alternative: same $200K, generates $1,000-1,100/mo of dividends — slightly less monthly than ERS, but the capital stays intact, and your spouse inherits a working dividend engine. Net total benefit over 30 years: meaningfully larger when you include the bequest. Net total flexibility: vastly larger because you can surrender / withdraw / restructure at any point from Y11.*
>
> *ERS makes sense for prospects who need maximum income certainty and have no legacy goals. PWV makes sense for prospects who want comparable income, full flexibility, and a structured inheritance. Different jobs. Pick the one that matches what you want this $200K to actually do."*

### What closed

PWV. The prospect's deeper anchor wasn't "highest monthly income" — it was "I want my spouse and kids taken care of when I'm gone." PWV's secondary-insured + lifelong dividend mechanic delivered that in a way ERS structurally cannot.

### The lesson for any FC

The ERS-vs-PWV comparison is one of the most common pre-retiree decisions you'll work. Most FCs default to "ERS is safer" framing because it's true *if income certainty is the only criterion*. The job is to surface the other two criteria — liquidity and bequest — and let the prospect decide what trade-off they want. *"What do you want this $200K to actually do over your retirement?"* is the question that opens the case. The answer almost always includes "leave something for the kids" — and that selects PWV.
`,

  "pwv-cy": `
### Who they were

Cynthia — the FC behind this case, not the prospect. Three months into the business. Zero closes. Cold prospecting only. Discouraged. About to walk away from the industry.

This is the case that turned her year around. One first close that drove $150-160K of FYC by year-end. The lesson isn't about the prospect — it's about what one well-run appointment can unlock for a new FC who is doing the work but hasn't seen a result yet.

### The prospect

A couple — pre-retiree husband and wife, household ready for retirement planning. Cynthia worked the appointment through the full discovery flow, surfaced the retirement-income gap, walked the source-of-funds vs needs ledger, and closed both spouses simultaneously.

### What closed

Four policies in one appointment:

- **2 × $36K PWV** (one for each spouse)
- **2 × $500K PRE** (whole-life floor for legacy)

Then the referrals stacked:

- **Son referred → $12K APA**
- **Daughter referred → $18K APA**

One first close. Two PWVs, two whole-life policies, plus two adjacent APA closes via referral within weeks. The compounding effect of one well-run case driving a year's worth of pipeline.

### Where most FCs get this wrong

The temptation, three months in with zero closes, is to over-pitch. To bring product information into the room because the FC is anxious to demonstrate value. Cynthia did the opposite. She ran the appointment as a discovery — the retirement-income gap, the source-of-funds ledger, the dividend-vs-drawdown comparison. Let the prospects arrive at the conclusion themselves. Closed on the *fit*, not the *sell*.

### The drawings used

The two drawings that closed this case:

1. **Source-of-funds vs needs ledger (LHS / RHS).** What the couple has on the LHS — CPF, savings, existing policies. What they need on the RHS — retirement income at 65, healthcare funding, legacy. The mismatch is the case.
2. **Lump sum vs dividend mode ('3 birds' reveal).** Showing that the same capital can deliver three outcomes — income for them, capital intact, bequest for kids. The "I get all three?" moment is what closed both PWVs.

### What the pitch sounded like (Cynthia's framing)

> *"You've spent your working years building. Now the question is what you want this capital to do over the next 30 years of retirement. Three things matter: income for you both, capital staying intact, something for your son and daughter when you're gone.*
>
> *Most retirement plans give you one of those three. PWV gives you all three at once. The same capital generates a dividend stream that funds your retirement, the capital stays in the policy compounding, and the secondary-insured mechanic means your kids inherit a working dividend engine — not just leftover cash.*
>
> *Three birds, one structure."*

The simplicity of the framing — three outcomes, one structure — is what made the close land for the couple. And it's what made the case so transferable for Cynthia. She ran the same shape on the next appointment, then the next, and built the rest of the year on that pattern.

### The referral mechanic

When both spouses bought together, the conversation naturally surfaced the kids. *"You're setting your retirement up. What about the kids — what's their setup right now?"* The son was 28, just started a stable job. The daughter was 26, finance-curious. Both became APA closes within weeks of the parents' close. Total: ~$30K of additional annual premium from one parent appointment.

### The lesson for any FC

This case is the answer to "what does one good close actually unlock?" When you run the appointment cleanly, on discovery rather than pitch, on the prospect's frame rather than the product's frame, you don't close one case. You open a household — both spouses, the kids, the referrals from each. Cynthia's $150-160K FYC by year-end came from one disciplined appointment that did the work other FCs were skipping in their hurry to pitch.

For any new FC three months in with zero closes: this case is the proof that the work compounds. You don't need a closing technique. You need one cleanly-run appointment that demonstrates what discovery-led selling can do. The rest follows.
`,

  // ─── UCC ─────────────────────────────────────────────────────────────────

  "ucc-u1": `
### Who they were

A working professional. Income-earning, family-relevant, the kind of prospect every FC encounters dozens of times: someone who has been telling themselves "I have company insurance" for many years.

### What they actually had

Pull the company-insurance policy summary in the meeting. The actual numbers:

- **Death cover:** $60,000
- **CI cover:** $30,000
- **Hospital:** group medical (limited)
- **Accident:** workplace accident only

That's it. The prospect's mental model — *"I'm covered through work"* — has been doing the heavy lifting for years. The actual figures have never been read.

### Where it broke down

Two structural exposures that company insurance never solves.

**Cover sizing is structurally inadequate.** $60K of death cover on a $60-100K earner is 5-10 months of expenses. That's not income replacement. That's a brief runway before the family is on its own. The CI cover of $30K is worse — a single Major-stage diagnosis with treatment costs that easily exceed $30K, and the cover ends.

**Cover lapses on job change.** The day the prospect resigns or gets retrenched, the policy is gone. The next job, they're older, possibly with pre-existing conditions on the medical declaration. Private cover at that point is either much more expensive or impossible. The $60K / $30K isn't even guaranteed for life — it's guaranteed only while they're at the current employer.

### The gap analysis

| Need | Company cover | Norm for income replacement | Gap |
|---|---|---|---|
| Death | $60K | 10-20× annual income (~$1M for $60-100K earner) | $940K |
| CI | $30K | 5-10× annual income | $270-470K |
| Hospital | Group medical (limited) | Private rider | Significant |
| Accident | Workplace only | Off-work hours + outpatient | Significant |
| Cover continuity on job change | Lapses immediately | Permanent until policy term | Critical |

### The reframe

The prospect doesn't need to be convinced they're under-covered. They need to see the *actual numbers* on the company policy schedule. Once they read "$60K death / $30K CI" out loud, the case opens itself. The job of the FC is to surface the actual figures and then build the structurally complete replacement at a known cost.

### The full-suite restructure that closed

| Component | Annual premium | Coverage / value |
|---|---|---|
| **AIA Pro Achiever (APA) wealth** | $4,800 | Long-term wealth build |
| **Ultimate Critical Cover (UCC)** | $1,800 | $300K CI / ECI multi-claim |
| **HealthShield Gold Max (HSGM)** | $1,900 | Private hospital plan |
| **Solitaire PA (SPA)** | $224 | $5K/accident reimbursement + accidental DD |
| **Singapore Family Term (SFT)** | $1,700 | $1M Death / TPD term |
| **Total premium** | **$10,424/yr** | |

The full-suite outcome:

- $1M Death / TPD (replaces the $60K company gap with proper income replacement)
- $300K recurring CI / ECI (replaces the $30K gap with multi-claim depth)
- Private hospital plan (closes the group-medical limitations)
- Accident plan (covers off-work hours)
- Wealth slot for retirement (APA, the structural foundation)

**FYC: ~$2K in one hour.** All from one meeting where the FC asked to see the actual policy summary.

### What the pitch sounded like

> *"For many years, you've said you've got 'company insurance.' Let me pull up the actual policy summary with you... ok. Death cover: $60,000. CI cover: $30,000.*
>
> *If something happens — death or CI — your family has roughly 5-10 months of your current expenses covered. After that, they're on their own.*
>
> *And the part most people don't realise: company insurance lapses the moment you change jobs. The next job, you'll be older, possibly with conditions that make private cover more expensive — or impossible. So this $60K / $30K isn't even guaranteed; it goes away with the job.*
>
> *The structural answer: build the actual cover now, while you're young and healthy. $1M term plan for death — that's just $70-100/month at your age. $300K Critical Illness with multi-claim depth — that's another $150/month. Private hospital plan, accident plan, and a wealth slot for retirement. All in, roughly $800-1,000/month. Your family is then properly covered, and the cover doesn't depend on your job."*

### The lesson for any FC

Don't take "I have company insurance" at face value. Always pull the actual policy summary. The discovery moment — when the prospect reads "$60K death / $30K CI" out of their own document — is what opens the case. The full-suite restructure isn't an upsell. It's the structurally adequate replacement for what they thought they already had. The one-hour-FYC pattern repeats across every prospect at this profile.
`,

  "ucc-u2": `
### Who they were

A young working adult. Bought a $200/mo whole-life plan years ago through their parents' family agent. The kind of policy that gets placed when an 18-year-old's parents introduce them to "our family agent" and the agent recommends "a comprehensive plan to lock in young." The prospect has paid the premium quietly ever since without ever reviewing what it actually delivers.

### What they had

| Whole-life plan line | Amount |
|---|---|
| Monthly premium | $200 ($2,400/yr) |
| Death / TPD cover | $200K |
| CI cover | $200K |
| Early CI cover | $100K |
| Cash value | Modest, projected ~$50-100K at 65 |

The plan is doing three jobs in one premium:

1. Death / TPD cover
2. CI + Early CI cover
3. Cash-value accumulation

### Where it broke down

The bundled-whole-life trade-off makes every piece structurally weaker than it would be if separated:

**Cover erodes on claim.** Claim Early CI → death cover reduced by claim amount. Claim full CI → death cover wiped, cash value forfeited. The plan partially terminates the day the prospect actually uses it.

**Single-claim only.** No multi-claim depth. Cancer at 45, recovery, heart attack at 60 — the second event doesn't pay.

**Cash-value side projects at 2-3% effective.** Lower than CPF OA's guaranteed 2.5%. The "investment" piece is structurally forced to be conservative because it has to fund the cover.

**Premium-to-cover ratio is poor.** $2,400/yr for $200K death + $200K CI bundled. A term plan at the same age delivers $1M death cover for ~$840/yr. Standalone CI (UCC) delivers $300K recurring multi-claim at $1,600/yr. Decoupled, the same prospect can get vastly better coverage for less premium.

### The reframe

The parents' agent placed an adequate plan for *1995*. The structure no longer makes sense for someone planning to retire in 2055. Decouple it: term for death cover, standalone UCC for multi-claim CI, freed savings into APA.

### The decoupled restructure

| Component | Old | New |
|---|---|---|
| Death cover | $200K (erodes on CI claim) | $500K-$1M term ($60-90/mo) |
| CI cover | $200K single-claim | **$300K recurring multi-claim** (UCC) |
| Cash value | $50-100K @65 (bundled) | $0 (no bundled investment) |
| Investment | Bundled, ~2-3% effective | **$800/yr (or more) into APA at 8%** |
| Monthly | $200 ($2,400/yr) | $130/mo combined or $200/mo with APA redirect |

If just the $800/yr savings is redirected (the lower-commitment version): $800/yr × 35 years × 8% compounding = **~$100K of additional retirement value** at 65. Plus the recurring CI cover that pays multi-claim. Plus the death cover that doesn't erode.

### What the pitch sounded like

> *"You've had this whole-life plan since you were 18 — your parents' family agent set it up. $200 a month, $200K of death cover, $200K of CI, $100K Early CI. Let me show you what most people don't realise about whole-life plans.*
>
> *Once you claim for CI, the death cover gets reduced by the same amount. Claim TPD, the cash value goes to zero. The plan partially terminates the moment you actually use it. And it only pays once — if you recover from cancer at 45 and have a heart attack at 60, the second event doesn't pay.*
>
> *Same $200 a month, decoupled: a term plan with recurring CI multi-claim ($500K-$1M death + $300K CI that pays multiple times) for about $130 a month, and you save $70 a month — roughly $800 a year — to invest in APA. That $800 invested over the next 35 years at 8% compounds to about $100K at retirement.*
>
> *Yes, you lose the surrender value from the existing whole-life. But you gain: CI cover that pays out repeatedly, death cover that stays intact, and an additional ~$100K of liquid retirement savings. More coverage, more cash value, more flexibility."*

### What closed

The full decouple. Whole-life surrendered (or paid-up depending on penalty math). $130/mo for term + UCC combined. $70/mo freed and redirected into APA. The honesty check on surrender penalty: most whole-life policies bought 5-10 years ago have minimal penalty by now — verify, don't assume.

### The lesson for any FC

The parents'-agent-bundled-whole-life prospect is the most common decouple case in the young-adult segment. The plan isn't *wrong* — it was reasonable when placed. The plan is *outdated for the current structural toolkit*. The pitch isn't an attack on the parents' agent — it's an upgrade of the structure. Honest framing: *"This plan was adequate for the products available in 1995. Today's structurally cleaner answer is term + standalone CI + pure invest."* The prospect's relationship with the parents' agent isn't being challenged. The product structure is.
`,

  "ucc-u3": `
### Who they were

A 38-year-old client. Bought GPP at 25, around 13 years ago. Solid Major CI cover through the GPP base. **No Early CI rider, no multi-claim feature.** Has been paying premium quietly for 13 years on a structurally incomplete CI setup without realising.

### What they had

- $300K GPP term plan, Major CI accelerated
- No Early CI layer
- No multi-claim depth — single Major CI claim ends the cover

The setup is reasonable on paper. The structural gap is invisible until you walk them through what modern CI diagnoses actually look like.

### Where it broke down

The medical landscape has shifted in the 13 years since the policy was placed. Most serious illnesses now get caught at **Stage 0 or Stage 1** — before they qualify for Major CI claims. Carcinoma in situ, Stage 0 cancer, mild stroke, early-stage heart attack. These are the diagnoses that show up at routine medical checkups in your 40s-50s — and GPP alone wouldn't pay out for any of them.

The prospect thinks they have CI cover. They have *Major* CI cover only. That's the structural blind spot.

### The reframe — the "buffet" analogy

This case closed on a visceral mental model, not a number. The buffet analogy:

> *"Think of CI claims as a buffet. There are three tables.*
>
> *The Major CI buffet is the biggest — unlimited servings of every dish. Stage 3 cancer, severe stroke, major heart attack, every late-stage illness. You can claim as many times as you need, as long as it's a different illness. That's what your GPP covers right now.*
>
> *But there's a second table — the Early CI buffet. It covers Stage 0 cancer, carcinoma in situ, mild stroke, early-stage heart attack. Up to 5 servings — meaning up to 5 separate Early CI claims over your life. Same illnesses as Major CI, but caught earlier and claimable when the diagnosis is far less severe.*
>
> *The third table — Relapse — is for 6 specific illnesses: cancer, heart attack, stroke, organ transplant, paralysis, and one more. If you've already claimed and recovered, you can come back to the buffet 2 years later and claim again for the same illness.*
>
> *Right now you're at the Major CI buffet only. Most of the cases that actually arise — and the ones where early intervention matters most — are at the Early CI buffet. Adding the Early CI layer is roughly $150-180/month for $300K of recurring multi-claim coverage. The earlier the diagnosis, the easier the recovery, and the less your career and income get disrupted."*

The buffet image makes the gap visceral. The prospect can *see* the empty tables.

### The numbers

$300K recurring Early CI via UCC layered on top of the existing GPP. Pricing: **$1,852-2,185/yr** depending on the coverage term (to 65 or 75). At ~$150-180/mo, the prospect adds:

- $300K of recurring Early CI cover (multi-claim depth — up to 5 servings)
- Coverage runs through the most likely diagnosis window (40s-60s)
- The cover doesn't erode the existing GPP — UCC is a separate decoupled product

Over 27 years to 65, that's roughly $48K-$58K of total premium for what could be a $300K-$1.5M (multi-claim) payout if cancer / heart attack / stroke gets caught early.

### What closed

$300K UCC Early CI layer added on top of the existing GPP. The buffet analogy converted the structural argument into something the prospect could visualise — and the close followed naturally. The upsell didn't disrupt the existing policy, didn't require restructure, didn't ask the prospect to give anything up. Pure additive.

### The lesson for any FC

The GPP-only client is one of the highest-leverage upsell pools in the AIA stack. They already trust the product, they're already paying premium, and the structural gap (Early CI / multi-claim) closes for ~$150-180/mo. The buffet analogy is the single best closing tool here because it makes the gap *visceral* rather than *abstract*. Drill the analogy until it sounds natural — three tables, unlimited Major servings, 5 Early servings, 6 Relapse illnesses. Once the prospect sees the empty tables, the upsell closes itself.
`,

  "ucc-u4": `
### Who they were

A pre-retiree, around 55. CI cover is bundled inside a $100K whole-life plan placed years ago. Single-claim only. The cash value sits at around $33K — modest, but unlocks if surrendered or paid-up.

The prospect believes they have CI cover. They have *$100K, single-claim, cover-erodes-on-claim* CI cover — and they're entering the highest-likelihood CI exposure window of their life.

### What they had

| Existing structure | Detail |
|---|---|
| Bundled life plan | $100K death cover + $100K CI bundled |
| CI claim mechanics | Single-claim only, death cover reduces on claim |
| Cash value | ~$33K (trapped) |
| Cash value on full CI claim | **Forfeited** |
| Monthly premium | $108/mo |

### Where it broke down

**CI risk peaks 50-70.** This is the window where exposure is highest and where multi-claim depth matters most. One cancer event in their 50s. Possible cardiovascular event in their 60s. The chance of more than one CI event over 20 years is meaningful — and the existing single-claim bundled CI doesn't pay the second time.

**Cash value is held hostage.** $33K of accumulated cash value sits in the policy. The day a full CI claim is paid, that $33K evaporates. The prospect is paying every month for cover that confiscates their own retirement savings if used.

### The reframe

Decouple. Replace the bundled $100K single-claim CI with $300K recurring multi-claim CI via UCC. Layer a small term policy for death cover. Surrender the existing whole-life to unlock the $33K cash value, redirect as APA top-up.

The monthly premium comparison closes the case structurally:

| Plan | Old ($108/mo) | New ($96/mo) |
|---|---|---|
| Death cover | $100K from bundled life plan | $200K-500K from term rider |
| CI cover | $100K single-claim, erodes death cover | **$300K recurring multi-claim ECI** via UCC |
| Cash value | $33K trapped in policy | $33K released as APA top-up |
| Premium | $108/mo | **$96/mo (lower)** |

3× the CI cover. Multi-claim depth. Death cover intact regardless of claim. $33K unlocked. **$12/mo cheaper.**

### What the pitch sounded like

> *"Your current life plan gives you $100K of CI cover, single-claim. If you have one CI event, the cover pays out and your death cover reduces. If a second CI event happens later — different illness, same body — the policy doesn't pay again. Your cash value is also gone the moment the CI claim is paid.*
>
> *At 55, your CI risk window is just starting. Most prospects in their 50s and 60s will have either a cancer scare, a cardiovascular event, or a metabolic complication — and the chance of more than one event over 20 years is meaningful.*
>
> *Restructure: standalone $300K recurring multi-claim CI from UCC, plus a separate term rider for death cover. Same monthly outflow — actually $12/mo cheaper. 3× the CI cover, multi-claim depth, death cover doesn't erode on CI claim, and your existing $33K cash value gets released as an APA top-up to compound for retirement. Multiple wins from one restructure."*

### What closed

The full decouple. Whole-life surrendered. UCC $300K recurring Early CI + term rider in place. $33K cash unlocked as APA top-up. Monthly premium reduced by $12. The prospect gained more CI cover, more flexibility, and additional retirement value — at lower monthly outflow.

### The lesson for any FC

The pre-retiree with bundled CI is the highest-leverage decouple case in the 50+ segment. They are *one CI event away* from losing their accumulated cash value, and they don't realise it. The framing — *"You're paying every month for cover that confiscates your retirement savings if used"* — is the emotional anchor. Once the prospect sees the math (3× cover + multi-claim + cash unlocked + lower premium), the structural argument is overwhelming. Always run the surrender penalty math first; for whole-life plans 20+ years in, the penalty is typically near-zero.
`,

  "ucc-u5": `
### Who they were

A working adult mid-career, household-income SGD professional. Holds a sprawling mixed portfolio of wealth + risk policies placed across three competitors over the years: Aviva, GTL (Great Eastern), and GE. Plus some legacy AIA business. No single FC has been managing the aggregate picture.

The portfolio looks busy. On audit, it's redundant, under-coordinated, and structurally over-paying for under-coverage.

### What they had

A grab-bag of policies acquired across different life moments:

- Wealth side: bundled hybrid ILP from Aviva, two endowments from GTL, a GE Flexi-cash
- Cover side: assorted CI + life plans across the same three carriers
- No accident plan
- No private hospital cover above MediShield Life

Total monthly premium outflow: substantial. Total coverage clarity: zero.

### Where it broke down

Three structural issues stacked:

**Fragmented carrier relationships.** Aviva, GTL, GE — three different claims departments, three different service standards, three different agents who have all rotated over time. Nobody is "the agent" for this prospect's overall portfolio. Each policy gets serviced (or not) by whoever is available at that carrier on that day.

**Wealth slot is split across underperforming structures.** Multiple low-PIRR endowments doing the same job badly, plus a hybrid ILP eating insurance charges from investment units. The aggregate effective return is well below what a single consolidated wealth slot would deliver.

**Cover side is incomplete despite the premium spend.** No private hospital plan. No accident plan. CI cover is bundled into life plans (single-claim, erodes on claim).

### The reframe

Consolidate everything into the AIA full-suite structure. Same approximate monthly outflow, structurally complete coverage, one carrier, one agent, one claims department. The BTIR decouple does the structural heavy lifting — term for death, standalone UCC for CI, APA for the wealth slot — plus HSGM and SPA close the cover gaps.

### The full-suite restructure that closed

| Component | Annual premium | What it does |
|---|---|---|
| **APA** | $4,800 | Wealth slot consolidated, 8% projected vs scattered ~3-4% across competitors |
| **UCC** | $1,800 | $150K CI/ECI multi-claim recurring |
| **HSGM** | $1,900 | Private hospital plan, fills the largest cover gap |
| **SPA** | $224 | Accident plan, fills the second-largest gap |
| **SFT (Singapore Family Term)** | $1,700 | $1M Death/TPD term, replaces the bundled life-plan CI |
| **Total** | **$10,424/yr** | |

Net effect for the prospect:

- $600K retirement target (APA continuous-pay)
- $150K CI/ECI recurring multi-claim (UCC)
- $1M Death/TPD (SFT)
- Private hospital cover (HSGM)
- Accident coverage (SPA)
- All under one carrier, one agent, one ecosystem

The competitor policies got costed honestly — paid-up where surrender penalties were material, surrendered where the penalty had worn off, cash values redirected as APA top-ups where it made sense.

### What the pitch sounded like

> *"You've built a portfolio across three different carriers over the years — Aviva, GTL, GE. Each policy was reasonable at the time it was placed. The aggregate problem is that nobody is managing the overall picture. Three different claims departments. Three different service standards. Agents have rotated. You don't have an advisor for your portfolio — you have three carriers each holding a slice of it.*
>
> *Same approximate monthly outflow, restructured: APA for the wealth slot (8% projection vs your scattered 3-4%), UCC for recurring multi-claim CI, HSGM for private hospital, SPA for accident, and term for death/TPD. All under one carrier. One agent. One claims department.*
>
> *The cover gaps close. The wealth slot consolidates. And — most importantly — there's one person responsible for the whole picture over the next 30 years."*

### What closed

The full-suite restructure. Total annual premium: ~$10.4K. Coverage went from fragmented-and-incomplete to consolidated-and-comprehensive. The wealth slot's projected outcome at 65 improved materially because the underperforming endowments and hybrid ILP got swapped for a single APA running at 8% projection.

### The lesson for any FC

The multi-carrier-portfolio prospect is a case the wealth-side and protection-side FCs both tend to under-attack. Wealth FCs see only the underperforming endowments. Protection FCs see only the cover gaps. The full-suite restructure requires you to walk both sides simultaneously — and to do that, you need to pull every in-force illustration in the meeting. Once the prospect sees the aggregate picture (premium spend, coverage gaps, fragmented service), the consolidation case closes itself. The hardest part is gathering the policy schedules; the easiest part is the math.
`,

  // ─── GPP ─────────────────────────────────────────────────────────────────

  "gpp-g1": `
### Who they were

A 25-year-old working adult. New income, no major dependants yet, but knows enough to want to "lock in cover while I'm young and healthy." First-time term buyer. Hasn't yet been pitched whole-life by a family agent — the buying decision is still open.

### What they're being quoted

The case is at the decision point: term vs whole-life for $1M of cover. The numbers:

| Setup | Premium | Cover till | Cover quality | Cash value |
|---|---|---|---|---|
| **GPP term till 65** | $70/mo | 65 | $1M Death / TPD, fixed | $0 (premium-only) |
| **Whole-life equivalent for $1M** | ~$250/mo | Lifelong | Often $200-300K Death/TPD (smaller for same premium) | ~$100-200K @65 |

The whole-life pitch is "you keep cash at the end." The structural cost of that cash is the 3.5× premium and the smaller cover-per-dollar.

### Where it breaks down (for prospects pulled toward whole-life)

The whole-life appeal is emotional — "I get something back." The structural cost is hidden:

1. **The cover need is during working years.** Dependants, mortgage, income replacement obligations. After 65, the cover need has dropped — kids are independent, mortgage is paid. Buying lifelong cover means paying for cover they may not need *after* 65 at 3.5× the cost.

2. **The cash-value side is conservative.** The whole-life's "investment" projects at 2-3% effective. Below CPF OA's guaranteed 2.5%.

3. **The $180/mo differential, invested at 8% for 40 years, compounds to ~$560K.** That's vastly more than any whole-life cash value at 65, and it's fully liquid.

### The reframe

At 25, the question isn't *"should I get lifelong cover or term?"* — it's *"what does my cover actually need to do?"* The cover needs to replace income during years with dependants, mortgage, kids in school. That's roughly the next 40 years to retirement. Term covers exactly that window at $70/mo. The cash-value pitch on whole-life is solving a problem term doesn't have — and creating a worse retirement vehicle than APA at the same dollar.

### What the pitch sounded like

> *"At 25, the question isn't 'should I get lifelong cover or term?' — it's 'what does my cover actually need to do?' Your cover needs to replace your income during the years you have dependants, a mortgage, kids in school. That's roughly the next 40 years until retirement.*
>
> *$1M term till 65: $70 a month. $1M of cover for the entire window when you need it most. After 65, your cover need has dropped — your kids are independent, mortgage is paid down.*
>
> *Whole-life equivalent for the same $1M would be $250+ a month — and you'd be paying that premium for life. Yes, you get cash value at the end. But that $180 a month difference, invested at 8% over 40 years, compounds to about $560K. That's vastly more than any whole-life cash value at 65, and it's fully liquid.*
>
> *Term + invest the rest. The cover need is solved by the term. The 'lifelong cash value' is solved by the investment — more efficiently."*

### What closed

$1M term till 65 at $70/mo (GPP). The freed $180/mo redirected into APA at $180/mo continuous-pay — a young-adult-tier APA that compounds the full 40-year horizon. Same monthly outflow as the whole-life pitch would have been, vastly more cover, vastly more retirement value.

### The lesson for any FC

The 25-year-old first-time term buyer is one of the cleanest closes in the AIA stack — but only if you reframe the comparison from "term vs whole-life" to *"what does my cover actually need to do?"* Most family-agent whole-life pitches at this age win because the cover-vs-investment trade-off never gets surfaced. Pull the math out explicitly. $180/mo × 40 years × 8% = $560K. That's the number that closes the case against whole-life. Term + APA is structurally cleaner, structurally cheaper, and gives the prospect both the cover *and* the retirement vehicle they actually need.
`,

  "gpp-g2": `
### Who they were

A working adult holding (or being quoted) Singlife Elite Term — Singlife's flagship term offering bundling Death + TPD + multi-claim CI/ECI into one premium. The pitch points to "comprehensive coverage in one plan." The price feels reasonable on the surface.

### What they were paying / being quoted

- **Singlife Elite Term:** $2,550/yr — bundled Death + TPD + CI/ECI multi-claim

The headline pitch is "everything in one policy." The structural comparison is where the case opens.

### Where it broke down

When you decouple AIA's equivalent components, the price comes out *to the dollar*:

- **AIA GPP — Death/TPD only (if bought with APA):** $713/yr
- **AIA UCC — CI/ECI Multi-claim:** $1,837/yr
- **Total: $2,550/yr**

Same price. Different ecosystem.

The case isn't about price. The case is about everything *around* the price — claims department, agent continuity, value-add ecosystem.

### The reframe

When the headline numbers match, the decision moves to service. Singlife is a smaller, IFA-channel-heavy insurer. AIA is a tied-agency, in-house-claims insurer with a 30-year servicing relationship structure. Same dollars on the table. Very different claims experience when something actually happens.

### The structural comparison

| Dimension | Singlife Elite Term | AIA GPP + UCC |
|---|---|---|
| Annual premium | $2,550 | $2,550 ($713 + $1,837) |
| Death / TPD | Included | $713/yr standalone (GPP) |
| CI / ECI multi-claim | Included | $1,837/yr standalone (UCC) |
| Claims department | Singlife (smaller, often outsourced) | AIA in-house |
| Agent continuity | IFA (channel switches frequently) | Tied agent (long-term servicing) |
| Value-add ecosystem | Limited | Vitality, TeleDoc, Altitude, priority hospital |

### What the pitch sounded like

> *"On price, Singlife Elite Term and AIA's equivalent setup are within $5 of each other — basically the same. So the question becomes: when you actually need to claim, which company processes faster? Which agent is still going to be here in 10 years? Which ecosystem of services do you actually use?*
>
> *Singlife outsources most claims processing. AIA has in-house claims, same building, single point of accountability. Singlife agents are typically IFAs who rotate firms every 2-3 years. I'm a tied AIA agent — my compensation is structured for the 30-year servicing relationship.*
>
> *And on the value-add side, AIA bundles Vitality (premium discounts for staying healthy), TeleDoc (medical concierge), AIA Altitude (rewards), and priority hospital access. Singlife doesn't have that ecosystem.*
>
> *Same price. AIA wins on service, continuity, and ecosystem."*

### What closed

$713/yr GPP + $1,837/yr UCC = $2,550/yr. Same total premium as the Singlife quote. The prospect signed AIA because the decision was reframed from "price" to "service" — and on service, the comparison is one-sided.

### The lesson for any FC

When the price comparison comes out flat, the close moves to ecosystem. Most FCs default to arguing the cover details (multi-claim depth, ECI inclusion, etc.) — but those are typically comparable across both products. The differentiators are claims department, agent continuity, and value-add ecosystem. Drill the agent-continuity argument specifically: IFA channels rotate, tied agents don't, and over a 30-year hold that matters more than the marginal cover-detail differences. This pattern repeats across every "comparable price" cross-shop — the close moves from product to service.
`,

  "gpp-g3": `
### Who they were

An NSF or NSman client. Subscribed to **three MINDEF Singlife plans** — Term, Accident, and CI — because the premiums are heavily subsidised during NS. Total monthly outflow: ~$30-50/mo for ~$100-150K death/TPD + $50K CI + $50K accident cover.

The pitch coming into the conversation: *"I already have MINDEF coverage — I'm covered."* The instinct is to defend the existing plans because they feel cheap and adequate.

### Where it broke down

The MINDEF plans are a **subsidised entry-level cover** designed for the NS / NSman tier. They're good for what they are — cheap, basic cover during low-income years. They're structurally inadequate as a long-term cover plan because:

1. **Post-NS pricing rises sharply.** What costs $20/mo as an NSman costs $80-120/mo as a working adult. The cheap-premium era ends with NS.

2. **No multi-claim CI depth.** Single-claim CI — after the first event the cover ends. In a 50-year horizon, single-claim is structurally insufficient.

3. **No Early CI / recurring features.** MINDEF covers Major CI only — not Stage 0 / carcinoma in situ, the tier that catches most modern diagnoses.

4. **Cover continuity tied to NS service status.** When NS obligations end, the structure can lapse or convert to a much more expensive private plan — at older age, possibly with conditions on the medical declaration.

### The reframe

The pitch isn't *"cancel MINDEF."* It's *"layer AIA on top while the prospect is still in their 20s."* MINDEF stays as the cheap immediate-years safety net. AIA GPP + UCC build the proper long-term structure at age-25 pricing locked in for life.

### The numbers

| Setup | Monthly | Cover |
|---|---|---|
| Keep MINDEF plans (during NS) | ~$30-50 | Basic safety net |
| **Layer AIA GPP ($1M Death/TPD till 65)** | ~$70 | Long-term Death/TPD at age-25 pricing |
| **Layer AIA UCC ($300K recurring Early CI till 65)** | ~$155 | Multi-claim Early CI catches early-stage diagnoses |
| **Total combined** | ~$255-275/mo | Comprehensive cover; future-proof |

### What the pitch sounded like

> *"MINDEF Singlife plans are a great deal during NS — cheap premiums, basic cover. Keep them. But here's the structural blind spot: when NS ends, your premiums rise. And MINDEF plans only cover Major CI single-claim — they don't cover Early CI or recurring claims.*
>
> *Most serious illnesses today get caught at Stage 0 or Stage 1, which is Early CI territory, not Major CI. MINDEF wouldn't pay out for those. And if you have one event in your 40s and a different illness in your 50s, MINDEF's single-claim structure means the second event doesn't pay.*
>
> *Layer AIA GPP + UCC on top while you're still 25. Premiums are locked at age-25 pricing — $70/mo for $1M Death/TPD, $155/mo for $300K recurring Early CI. The MINDEF plans handle the immediate years. The AIA plans build the structurally complete cover for the rest of your life."*

### What closed

GPP + UCC layered on top of the existing MINDEF Singlife plans. ~$225/mo of new AIA premium. MINDEF stayed exactly as it was. The prospect locked in age-25 pricing on cover that runs through the most likely diagnosis window (40s-60s).

### The lesson for any FC

The MINDEF Singlife prospect's instinct is "I'm covered, I don't need more." The reframe — *"MINDEF is your immediate-years plan; AIA is your long-term plan, locked in now at 25"* — converts the case from competitive to additive. Never ask the prospect to give up the MINDEF plans. They're cheap, they work for what they do, and arguing against them creates unnecessary friction. The structural argument is about the 40-year horizon, not the 5-year NS window. Lock in AIA at 25, let the MINDEF coverage run its course in parallel.
`,

  // ─── HSGM ────────────────────────────────────────────────────────────────

  "hsgm-h1": `
### Who they were

A working adult holding AIA HSG B-Lite — basic hospital cover at the lowest tier — with **no rider**. The prospect's mental model: *"I have hospital coverage. I'm covered."* They've never read the deductible mechanics.

### What they had

- **AIA HSG B-Lite, no rider**
- Implied coverage assumption: hospital bills are mostly paid by the plan
- Actual exposure: $3,500 deductible upfront + 10% co-insurance on the remainder

### Where it broke down — the deductible math

Walk the prospect through the actual claim math on a few bill scenarios:

| Bill scenario | HSG B-Lite, no rider | HSG B + rider |
|---|---|---|
| $5,000 bill | $3,500 deductible + 10% ($150) = **$3,650** | 5% of $5,000 = **$250** |
| $10,000 bill | $3,500 + 10% ($650) = **$4,150** | 5% of $10K = **$500** |
| $30,000 bill | $3,500 + 10% ($2,650) = **$6,150** | 5% capped at $3,000 = **$3,000** |
| $100,000 bill | $3,500 + 10% ($9,650) = **$13,150** | 5% capped at $3,000 = **$3,000** |

The rider isn't a marginal upgrade. It's **the single biggest cover delta in the entire AIA hospital product line**. At ~$200-500/yr depending on ward tier, it saves $3,000-$10,000 on any single significant claim.

### The reframe

Most prospects don't realise the deductible exists. They assume "hospital plan = bills paid." The reframe is mechanical, not emotional — just walk the claim math on their actual policy at three bill levels ($10K, $30K, $100K). The conclusion writes itself.

Plus a regulatory urgency layer: from April 2026, MAS rules around riders are tightening — the maximum co-insurance cap on the rider rises from $3,000 to $6,000. Existing riders bought before the deadline are typically grandfathered at the lower cap. This is a **time-sensitive close moment** — prospects who buy / upgrade before the deadline lock in the better terms permanently.

### What the pitch sounded like

> *"Your HSG B-Lite covers the hospital bill — that's true. What it doesn't tell you on the surface is that there's a $3,500 deductible you pay upfront, plus 10% of everything above that. On a $10,000 bill, that's $4,150 out of your pocket. On a $30,000 bill, $6,150. The cover isn't 'fully paid' — there's a meaningful exposure window.*
>
> *Adding the rider: no deductible, just 5% of the bill capped at $3,000. So on a $30K bill, you pay $3,000. On a $100K bill, you also pay $3,000. The rider is the single biggest cover delta in the entire hospital plan structure.*
>
> *Cost: roughly $200-500/year depending on ward tier. For a fraction of one expected hospital claim, you eliminate the deductible exposure for life. And — heads up — MAS is changing rider terms in April. Locking in the rider before the deadline grandfathers you at the better cap. Worth doing now, not later."*

### The second move — ward tier upgrade

While the prospect is in restructure mode, layer the second move: upgrade from B-Lite to B or A. Differential pricing is small, ward access doubles:

- **B-Lite** → C ward only
- **B** → B or C
- **A** → A, B, or C (full flexibility)

Typical upgrade cost: $50-100/mo. Combined with the rider, the prospect goes from *"$3,500 deductible exposed + restricted to C ward"* to *"$3,000 cap + can choose any ward"*. That's the actual structurally complete answer.

### What closed

Rider added (~$300-500/yr depending on tier). Ward tier upgraded from B-Lite to B. The April deadline created the urgency that closed the rider piece. The deductible math closed the structural piece.

### The lesson for any FC

The HSG B-Lite / no-rider prospect is the most common hospital-plan upsell in the book. The math is mechanical — pull the policy schedule, calculate the out-of-pocket at three bill levels, show the rider math next to it. The April deadline urgency is real (verify the exact effective date in iPOS before citing). And the ward-tier upgrade adds another $50-100/mo of premium for a structural cover improvement the prospect didn't know they were missing. Always layer the two moves — rider + ward tier — in the same conversation.
`,

  "hsgm-h2": `
### Who they were

A prospect's mother quoted **GE P-Optimum private hospital rider at $300+/yr** vs AIA Vitalcare A rider at $800+/yr. The pitch from GE's side: cheaper headline price, "same private hospital coverage."

### What was being compared

| Dimension | GE P-Optimum | AIA HSGM with Vitalcare A rider |
|---|---|---|
| Premium | ~$300-500/yr | ~$800-1,100/yr |
| Pre-authorisation | **Recently suspended** (claim delays) | Active and routine |
| Coverage limits | Multiple sub-limits per category | Higher per-condition limits |
| 12-month pre/post coverage | Limited | Yes |
| Claim limit per year | Capped lower | Up to $1M private hospital |
| Hospital network | Selected | Full panel, including premier private |
| Doctor ratings | N/A | Rated #1 by 200+ Singapore doctors (latest poll) |

### Where it broke down

The GE pitch hangs on the cheaper headline price ($300-500 vs $800-1,100). The structural issues live in the fine print and recent operational changes.

**Pre-authorisation suspension.** GE recently suspended pre-authorisation — meaning the prospect can't get treatment pre-approved before going in. That's a real exposure for anyone with elective procedures, scheduled surgeries, or major treatments. Pay upfront, claim back, hope the claim processes cleanly.

**Multiple sub-limits per category.** GE has sub-limits stacking inside each claim category — total cap per year, plus sub-cap per condition, plus sub-cap per stay. The headline "$X coverage" doesn't tell the prospect that a hospitalisation with multiple procedures may hit individual sub-limits before the overall cap.

**Hospital panel.** GE's accepted private hospital network is narrower. AIA's HSGM + Vitalcare A covers the full premier private panel — important for prospects who want choice of doctor / hospital, especially for elective specialist work.

### The reframe

Cheaper headline price doesn't mean better coverage. On a hospital plan for someone in their 50s-60s — where the likelihood of using the plan within 10-15 years is meaningful — the structural completeness of the cover matters more than $500/year of premium difference.

### What the pitch sounded like

> *"GE P-Optimum is cheaper on the brochure — about $300 a year vs $800-1,100 for AIA's equivalent. But pull up the actual policy summary and you'll see GE has multiple sub-limits per claim category, and they recently suspended pre-authorisation — meaning you can't get treatment pre-approved before going in. That's a real exposure for anyone with elective procedures.*
>
> *AIA's HSGM with the Vitalcare A rider gives you up to $1M of private hospital coverage per year, active pre-authorisation, 12 months of cover before and after each event, and access to the full premier private panel. Plus, the plan was rated #1 by over 200 Singapore doctors in the latest poll.*
>
> *The price difference is $500-700/year. For a mother who'll likely use the plan within the next 10-15 years, that's structurally well worth the upgrade — and arguing the lower-cost plan would only save money if you never claim, which is the opposite of why you bought the plan."*

### What closed

AIA HSGM with Vitalcare A rider for the mother. The pre-authorisation argument was the structural decider — the prospect (a working adult planning for their mother's care) didn't want to handle upfront-pay-and-claim-back logistics for a 70-year-old parent.

### The lesson for any FC

The "cheaper competitor private plan" cross-shop closes on operational details, not headline price. Pre-authorisation status, sub-limit stacking, hospital panel breadth — these are the structural levers. Always pull the actual policy summary in the meeting. Most prospects shopping on price don't realise that "private hospital plan" doesn't mean "covers any private hospital" — the panel narrowness alone can be the close. And the doctor-rating data point ("rated #1 by 200+ Singapore doctors") is a credibility anchor most competitors can't replicate.
`,

  "hsgm-h3": `
### Who they were

A working adult prospect (35-45) considering hospital coverage for their elderly parents. Mother is on a basic group plan (GE DPS — Dependent Protection Scheme, token coverage at most) or MediShield Life only. No private rider, no accident plan.

The prospect's anchor going in: *"My parents have MediShield, they're covered."*

### Where it broke down

Older parents typically sit in a coverage gap that becomes critical exactly when they're most likely to claim:

- **MediShield Life** — universal but limited claim caps, only covers C / B2 wards in restructured hospitals
- **No private rider** — exposed to large out-of-pocket on significant claims
- **No accident plan** — exposed to fall-related injuries, fractures, etc.

The common elderly-parent claim scenario:

- Mother falls, breaks hip, requires surgery + 2 weeks of inpatient rehab
- Total bill: $25,000-40,000 in private hospital
- **Out of pocket on MediShield only: $15K+**

The prospect (adult child) ends up funding the gap. Either from their own savings, or by watching the parents draw down their retirement capital. Either way, the family financial exposure is real.

### The reframe

This isn't a case of "your parents need more coverage." It's a case of *"what does a typical claim in their 70s actually cost, and who pays the gap?"* Once the bill math is on the table, the upgrade case writes itself.

### The numbers — the recommended upgrade

| Plan | Cost/yr | Coverage |
|---|---|---|
| MediShield Life (existing) | ~$1,000 | C / B2 ward, limited caps |
| **AIA HSG B + rider for parent** | ~$1,300 | Up to B ward, rider waives deductible, caps co-pay at $3K |
| **AIA Solitaire PA Plan 2 for parent** | ~$200-400 | Accident reimbursement up to $5K/event |

Total upgrade cost per parent: ~$1,500-1,700/yr. For two parents: ~$3,000-3,400/yr.

For a working adult earning $80K+/yr, this is a small fraction of income that translates to dramatically reduced family financial exposure on parental medical events.

### What the pitch sounded like

> *"Your parents are on MediShield Life with a basic GE DPS plan. That gives them C-tier ward access and minimal claim caps. The structural problem: most elderly hospital claims are bigger than MediShield's caps. A hip fracture, a stroke, a cancer diagnosis — these run $30K-$80K in private hospital, and MediShield covers maybe 30-50% of that. The rest is out of pocket — yours or theirs.*
>
> *Upgrade plan: B + rider for both parents at ~$1,300/yr each. The rider waives the $3,500 deductible and caps the co-pay at 5%, max $3,000. Plus an accident plan at ~$200-400/yr each for fall-related coverage that the hospital plan doesn't fully address.*
>
> *Total: about $3,000-3,400/yr for both parents. Versus the alternative — a single uncovered medical event in your parents' 70s costing $30K-50K out of pocket. The math is structurally one-sided."*

### What closed

B + rider for both parents + SPA Plan 2 for both. ~$3,000-3,400/yr in total premium. The closing anchor wasn't the parents' coverage — it was the prospect's exposure to funding the gap. Adult children paying for parents' coverage is a high-LTV moment because the prospect bears both the emotional and financial weight of any unfunded claim.

### The lesson for any FC

The multi-generational parent-coverage case is one of the most under-utilised pitches in the hospital-plan segment. Most prospects don't think to upgrade parents' coverage because it feels like "their decision, not mine." Reframe — *"the gap isn't your parents' exposure, it's yours"* — and the case opens. Always run the actual bill math: hip fracture, stroke, cancer diagnosis at typical private-hospital costs vs MediShield's cap. The $15K+ out-of-pocket number is what closes the case. The prospect doesn't want to be the one who has to find $15K when the call comes.
`,

  // ─── SPA ─────────────────────────────────────────────────────────────────

  "spa-s1": `
### Who they were

A young working adult, around 26. Less than $1,000 in savings. No dependants. No accident or hospital plan. A Singlife agent had sold them a **$200/mo Death/TPD/CI plan** — structurally backwards for their actual situation.

### What they had

| Singlife coverage | Monthly cost |
|---|---|
| Death cover | included |
| TPD cover | included |
| Critical Illness | included |
| **Total premium** | **$200/mo** |

And what they *didn't* have:

- No hospital plan
- No accident plan
- No emergency savings buffer

### Where it broke down

Coverage hierarchy for a young single adult with no dependants and minimal savings:

1. **First:** Hospital plan (medical expense protection — the most likely large claim)
2. **Second:** Accident plan (covers minor injuries, accidental death, dismemberment — high-frequency, low-severity)
3. **Third:** CI / ECI (income replacement when ill — matters more once income is meaningful)
4. **Fourth:** Death / TPD (for dependants — irrelevant until there are dependants or significant debt)

The Singlife agent inverted this hierarchy. They sold a $200/mo Death/TPD/CI plan to a young client with no dependants, no debt, no savings, and no basic medical coverage. Structurally wrong for this stage of life.

### The reframe — responsible-advisor frame

This case is a *downsell*, not an upsell. The right move is to **cancel the wrong plan** ($200/mo Singlife) and **buy the right basic coverage** ($36/mo SPA + HSGM). The prospect ends up with proper coverage and $164/mo saved.

The pitch isn't "buy more from me." It's *"buy the right thing — and what you currently have isn't it."*

### What the pitch sounded like

> *"Let's pause and look at what you actually need at your stage of life. You're 26, working, no dependants, less than $1,000 in savings. The thing most likely to wipe you out financially is a $5K-$20K medical bill from a hospital stay or an accident. That's the first protection priority.*
>
> *What you currently have: a $200-a-month Singlife plan covering Death and CI. The Death coverage is structurally irrelevant — you have no dependants to protect. The CI coverage might matter eventually, but at your income level the priority is far lower than medical.*
>
> *What you don't have: hospital plan, accident plan. The two things most likely to actually trigger a claim at your age.*
>
> *Honest recommendation: cancel the Singlife plan, save $200 a month. Buy a Solitaire PA accident plan and a HealthShield Gold Max hospital plan for about $36 a month combined. You'll have $164 a month saved, the right coverage for your situation, and a structure that scales up as your life situation changes."*

### What closed

Cancellation of the Singlife plan. SPA + HSGM at $36/mo combined for proper basic coverage. $164/mo of cash flow freed up. The prospect ended up with the *right* coverage at *less* premium — and a new advisor who'd told them the truth instead of pushing more product.

### The lesson for any FC

Responsible advisory pays compound interest. The short-term math is a downsell — $200/mo of premium walked away from. The long-term math is LTV: this prospect will return for every future financial decision. As their income grows, dependants arrive, debt appears, the coverage stack will grow with them. The first close (a $36/mo downsell) earns the right to write the next $5K/yr APA when their salary doubles.

Leo's framing on the case: *"I think we need to be responsible advisors, looking out for our clients, ensuring what they buy is really what they need at their current situation."* The $200/mo prospect today is the $1,000/mo prospect in five years — but only if the first conversation was honest.
`,

  "spa-s2": `
### Who they were

A prospect already considering Solitaire PA — quoted at Plan 1, the entry tier. The case isn't about whether to buy. It's about which plan tier to buy at.

### What they were being quoted

| Coverage area | Plan 1 (entry) | Plan 2 (recommended) |
|---|---|---|
| Accidental death | $100K | $250K |
| Accidental TPD | $100K | $250K |
| Permanent dismemberment | scaled | 2.5× scaled |
| Medical reimbursement per event | $3K | $5K |
| Daily hospital cash | $50/day | $100/day |
| Monthly premium (approx) | $20 | $30 |

The differential between Plan 1 and Plan 2: **about $10/mo**.

### Where it broke down

Most FCs default to "the cheaper plan, easier close." The structural problem with Plan 1 entry is that the coverage levels don't actually solve the claim scenarios the plan is designed for.

A typical accident scenario:

- Slip-and-fall fracture, A&E visit + outpatient follow-up + 2-week recovery
- Bill: $4,000-6,000
- Plan 1 reimburses up to $3K
- Plan 2 reimburses up to $5K

On the more serious end — a vehicle accident with permanent partial disability — the dismemberment payout difference is 2-3×. Plan 1 entry covers the case partially. Plan 2 covers it properly.

### The reframe

The decision isn't "Plan 1 or Plan 2." It's *"are we buying coverage that handles the actual claim, or coverage that handles half of it?"* At $10/mo differential — the price of a meal — the coverage uplift is 2-3× across every line.

### What the pitch sounded like

> *"Plan 1 is the entry plan, Plan 2 is what I'd actually recommend for you. The differential is about $10 a month — basically a meal out. For that $10/mo, your accidental death cover jumps from $100K to $250K, your permanent dismemberment cover scales similarly, and your per-event medical reimbursement goes from $3K to $5K. Same structural plan, just sized to actually handle a real claim. It's structurally one-sided to skip the upgrade."*

### What closed

Plan 2 (or Plan 3 / Plan 4 if cash flow allowed). The $10/mo differential anchor closed the case — once the prospect saw the coverage uplift against a meal-out cost, the decision wrote itself.

### The lesson for any FC

The Plan 1 vs Plan 2 upsell is one of the lowest-friction closes in the AIA stack. The differential cost is trivial. The coverage uplift is significant. The framing is structural — *"are we buying coverage that handles the actual claim, or coverage that handles half of it?"* — and the $10/mo anchor against a routine purchase (meal, coffee, transport) makes the decision visceral. Always default to recommending Plan 3 or Plan 4 unless cash flow genuinely doesn't allow; Plan 1 is the floor, not the target.
`,

  "spa-s3": `
### Who they were

A working-adult prospect (35-45) considering accident coverage for their elderly parents. Parents are on MediShield Life or a basic hospital plan. No accident plan. The mental model coming in: *"Parents are covered through the hospital plan."*

### Where it broke down

MediShield Life and most hospital plans require **hospitalisation ≥6 hours or surgery** to trigger a claim. They don't cover:

- TCM treatment
- Outpatient injury (sprains, minor fractures handled at A&E)
- Dengue / food poisoning treatment
- Daily expenses while injured but not hospitalised
- Accidental death lump sum
- Permanent dismemberment

For elderly parents, **falls are the dominant claim trigger** — and most fall injuries are either outpatient (sprain, hairline fracture) or short hospital stays that may not meet the hospital plan's claim threshold. SPA covers the wider scope.

The structural gap: the hospital plan is sized for major surgical events. The most common elderly-parent claims are sub-surgical accidents. The hospital plan doesn't cover the very thing parents are most likely to need.

### The reframe

Don't replace the hospital plan. Layer SPA on top. SPA closes the coverage gap that hospital plans don't address — and it's cheap.

### The numbers

| Parent | SPA Plan 2 cost | Coverage |
|---|---|---|
| Mother | ~$200-300/yr | $250K accidental death + $5K per accident medical + $100/day hospital cash |
| Father | ~$200-300/yr | Same |
| **Total for both** | **~$400-600/yr** | Comprehensive accident cover |

### What the pitch sounded like

> *"Your parents' hospital plan covers them if they're warded for 6 hours or have surgery. What it doesn't cover: a sprain at A&E, a TCM visit for a back injury, dengue treatment, food poisoning. And those are the most common claims for people in their 60s and 70s — they're not always hospitalised, but they generate real expenses.*
>
> *Solitaire PA Plan 2 for both your parents is about $400-600 a year combined. That covers $5K per accident in medical reimbursement, $100/day hospital cash if they are warded, and $250K of accidental death cover each. For a few hundred a year, you've closed a coverage gap that has a real claim probability for elderly parents."*

### What closed

SPA Plan 2 for both parents. ~$400-600/yr in total premium. The closing anchor was the *type* of claim — fall injuries that don't trigger the hospital plan but generate real out-of-pocket costs.

### The lesson for any FC

Elderly-parent accident coverage is the most under-pitched gap in the AIA stack. Prospects assume "hospital plan covers it" — and they're structurally wrong, because the most common elderly claims (outpatient sprains, TCM, dengue) don't meet hospital-plan claim thresholds. The pitch is mechanical: walk the prospect through what does and doesn't trigger a hospital claim, then show what SPA covers. The premium is low enough ($400-600/yr for both parents) that the close is friction-free once the gap is visible.
`,

  // ─── PLP ─────────────────────────────────────────────────────────────────

  "plp-p1": `
### Who they were

A young working adult, paying **$200/mo whole-life** for $200K death/TPD/CI + $100K Early CI — bundled in one life plan. Originally placed by their parents' family agent years ago. Never reviewed. The premium just keeps going out.

### What they had

| Bundled whole-life | Detail |
|---|---|
| Monthly premium | $200 ($2,400/yr) |
| Death / TPD | $200K (erodes on CI claim) |
| CI | $200K (single-claim) |
| Early CI | $100K |
| Cash value at 65 | ~$50-100K (depending on age started) |
| Investment side | Bundled, ~2-3% effective |

### Where it broke down — three structural failures

**Cover erodes on claim.** Pay premiums for 30+ years, claim CI once, see the death cover reduced by the claim amount and the cash value forfeited on full CI. The plan partially terminates the moment you use it.

**Single-claim only.** No multi-claim depth. Recovery from cancer at 45 doesn't entitle you to cover for a heart attack at 60.

**Cash value drag.** The "investment" side projects at 2-3% — lower than CPF OA's guaranteed 2.5%. The bundled structure forces the investment to be conservative because it has to fund the cover.

### The reframe

Parents' agent placed an adequate plan for 1995. The structure no longer makes sense for someone planning to retire in 2055. Decouple it: term for death, standalone UCC for multi-claim CI, freed savings into APA. This isn't a critique of the parents' agent — it's a structural upgrade.

### The restructure

| Component | Old | New |
|---|---|---|
| Death cover | $200K (erodes on CI claim) | $500K-$1M term ($60-90/mo) |
| CI cover | $200K single-claim | **$300K recurring multi-claim** (UCC) |
| Cash value | $50-100K @65 | $0 (no bundled investment) |
| Investment | Bundled, ~2-3% effective | **$800/yr into APA at 8%** |
| Monthly | $200 ($2,400/yr) | $130 + $70 APA = $200/mo combined |

Same monthly outflow. Multi-claim CI. Death cover doesn't erode. Cash compounding at 8% instead of 2-3%.

$800/yr into APA × 35 years × 8% compounding = **~$100K of additional retirement value** at 65 — on top of the recurring multi-claim CI cover and the intact death cover.

### What the pitch sounded like

> *"Your parents' family agent set this plan up for you when you were 18. $200 a month, $200K of death cover, $200K of CI, $100K Early CI. At the time, it was reasonable.*
>
> *But here's what the plan does structurally. Once you claim for CI, the death cover gets reduced by the same amount. Claim the Early CI, the death cover shrinks. Claim full CI, the cash value goes to zero. The plan partially terminates the moment you actually use it. And it only pays once — no multi-claim depth.*
>
> *Same $200 a month, decoupled: $60-90/month for $500K-$1M term cover, plus $130/month for $300K recurring multi-claim Early CI via UCC. That's $190-220/mo. Or — if you can squeeze it — keep the $200/mo total and redirect what's left into APA. Either way, you have: better death cover, multi-claim CI that pays repeatedly, and the investment side compounding at 8% instead of 2-3%.*
>
> *Yes, you lose the surrender value from the existing whole-life. Run the math. If you've been paying for 5-10 years, the surrender penalty is probably small. The upgrade is structurally clear-cut."*

### What closed

The decouple: whole-life surrendered (or paid-up depending on penalty math). $130/mo for term + UCC. $70/mo of freed premium into APA. Same monthly outflow, structurally cleaner setup, plus ~$100K of additional retirement value over the 35-year horizon.

### The lesson for any FC

The parents'-agent-bundled-whole-life prospect is the canonical decouple case in the young-adult segment. The plan isn't wrong — it was reasonable when placed. The plan is outdated for the current structural toolkit. Pitch the upgrade, not the attack. *"This plan was adequate for the products available in 1995. Today's structurally cleaner answer is term + standalone CI + pure invest."* The prospect's relationship with the parents' agent isn't being challenged. The product structure is.
`,

  "plp-p2": `
### Who they were

A pre-retiree with a long-running **NTUC Living Policy** — $93/mo premium, $96K accumulated cash value, modest death + CI coverage bundled. The policy has been quietly running for 25+ years. The cover side is now mostly irrelevant (kids grown, mortgage paid). The cash value side is sitting at ~2-3% effective return.

The premium keeps going out every month for a structure that no longer serves the prospect's current life.

### What they had

- NTUC Living Policy at $93/mo for 25+ years
- $96K of accumulated cash value
- ~$50-100K of bundled death/CI cover
- Effective cash-value return: 2-3% p.a.

### Where it broke down

The Living Policy was placed in their 30s, when the cover need was real (young family, mortgage). At pre-retirement, the cover need has dropped to near-zero — kids are independent, mortgage is paid down, primary income earner is approaching retirement.

But $93/mo is still going out the door. And $96K of cash value is trapped, earning a participating-fund rate that's barely keeping up with inflation.

### The reframe

Three moves in one restructure:

1. **Surrender the Living Policy** — unlock $96K of cash value
2. **Replace the bundled cover with a small term policy** — ~$30-40/mo for equivalent or larger cover
3. **Redirect the $96K into APA / PWV dividend mode** — at 6% yield, that's ~$480/mo of passive income for life

### The numbers

| Component | Old structure | New structure |
|---|---|---|
| NTUC Living Policy | $93/mo premium, $96K cash value, ~$50-100K bundled cover | **Surrendered** — $96K cash released |
| Death / CI cover | Bundled in Living Policy | Small term: ~$30-40/mo for equivalent |
| Cash flow | -$93/mo (premium out) | -$30-40/mo (term premium only) |
| $96K cash | Trapped, earning 2-3% | **Redirected into APA / PWV dividend mode @ 6% yield** = **$5,760/yr = $480/mo of dividends** |

Net change for the prospect:

- **$500/mo of new dividend income** (from $96K cash redirect at 6% yield)
- **$50-60/mo of premium freed up** ($93 old − $30-40 new term)
- Death/CI cover preserved via the term replacement
- Capital ($96K) stays intact for inheritance vs being drawn down by ongoing premiums

### What the pitch sounded like

> *"Your NTUC Living Policy is paying $93 a month. It's been doing that for 25+ years. Pull up the in-force illustration — you've got about $96K of cash value sitting in there, earning roughly 2-3% effective. The cover side is modest, bundled with the cash, and at your current age the cover need has dropped significantly anyway.*
>
> *Restructure: surrender the Living Policy. That unlocks $96K in cash. Replace the death/CI cover with a small term policy at $30-40/mo — same or better cover, decoupled from the cash.*
>
> *Then redirect the $96K into a dividend-mode product at 6% yield. That generates about $480 a month of passive income — for life. Plus you save $50-60/mo on the freed premium. Net effect: you gain ~$540/mo of cash flow, your cover is preserved, and the $96K stays intact for inheritance instead of slowly being drawn down by ongoing premiums on a plan that's not doing real work anymore."*

### The honesty check

Always run the surrender penalty math before recommending this move. Most life policies bought 20-25 years ago have minimal surrender penalty by now — verify, don't assume. If the prospect is mid-tenure (5-15 years in), paid-up status may be the cleaner move than full surrender.

### What closed

Full surrender of the NTUC Living Policy (the 25-year holding period had eliminated the surrender penalty). $96K redirected into dividend mode. Small term policy covering the residual cover need at $30/mo. The prospect gained ~$540/mo of net cash flow, preserved capital for inheritance, and converted a dormant cash value into a working dividend engine.

### The lesson for any FC

The legacy bundled-life policy with substantial cash value is one of the highest-leverage pre-retiree restructure cases. The prospect doesn't realise the cover need has dropped *and* the cash value is held hostage. The framing — *"this plan is doing premium out, dormant cash sitting, low effective return, on a cover need that doesn't exist anymore"* — is what surfaces the inefficiency. The dividend redirect converts a passive policy into an income engine. Always pull the in-force illustration before the appointment so the cash-value number is on the table from the start.
`,

  "plp-p3": `
### Who they were

An SME owner. $300K+ household income. Two kids. Already has the BTIR pieces in place — term cover for working-years income replacement, APA running for retirement. Wants a **legacy floor**: a guaranteed lump sum at death that pays out regardless of investment outcomes, sized to cover the kids' inheritance and business succession.

This is the case that proves not every prospect is a decouple case. PLP genuinely serves a real structural need here — and the framing matters.

### Where most FCs misread this case

The instinct, after drilling decoupling cases for weeks, is to push BTIR on every prospect. For this profile that's structurally wrong. Decoupling into pure term + APA actually loses the very thing this prospect wants: the guaranteed lifelong cover with capital floor.

- Term ends at 65-75
- APA's death benefit floor is 100% of premium paid (not a fixed sum assured)
- The prospect's legacy isn't tied to a contractually defined lump sum

For a prospect whose deeper anchor is *"my family inherits a known dollar amount no matter what the market does,"* BTIR is the wrong tool.

### Where PLP is structurally correct

The prospect profile where PLP fits:

- **Has dependants** (spouse, children, ageing parents)
- **High income, surplus cash flow** ($200K+/yr household)
- **Already has term cover** for working-years income replacement
- **Wants lifelong cover** beyond 65 — for legacy / inheritance certainty
- **Values guaranteed cash value** — accepts lower effective return for capital stability
- **Wants limited-pay structure** — pay for 10-25 years, then cover continues for life without further premium

For this profile, PLP delivers:

| Feature | PLP | BTIR (term + APA) |
|---|---|---|
| Lifelong cover | ✅ Yes | ❌ Term ends at 65-75 |
| Limited-pay | ✅ 10-25 years, then cover continues | ❌ Lifelong premium until lapse |
| Guaranteed cash value | ✅ Par fund mechanism | ❌ Market-linked |
| Premium discontinuance | ✅ Use cash value to suspend | ⚠️ Term lapses without premium |
| Legacy lump sum | ✅ Contractually defined SA | ⚠️ Depends on APA value at death + term in force |

### When NOT to recommend PLP

The corollary cases:

- Young prospect (under 35) with no dependants and no surplus cash — PLP premiums are heavy at $300-500/mo for meaningful cover, and the cover need is term-shaped, not lifelong-shaped
- Prospect with limited budget who can only afford one product — term + investment is better risk-adjusted return
- Investment-savvy prospect who wants growth-optimised returns and accepts no cover floor

### What the pitch sounded like (defending PLP against the prospect's own BTIR challenge)

> *"PLP isn't trying to deliver the best investment return — that's APA's job. PLP is doing a different job: it's the lifelong cover floor with a guaranteed lump sum at the end. If you're looking for the best risk-adjusted return, decoupled term + APA wins. If you're looking for lifelong cover, limited premium pay, and a contractually defined legacy that doesn't depend on market outcomes, PLP is the structurally correct answer.*
>
> *The structural difference: APA gives you a death benefit floor of 100% of premiums paid. PLP gives you a contractually defined sum assured for life. For prospects who want their family to inherit a fixed dollar amount no matter what the market does, PLP is the answer. For prospects who want growth-optimised retirement with full liquidity, decoupled wins.*
>
> *Different jobs. Different tools. Most high-income families with dependants want both — PLP at the foundation of the pyramid (legacy floor), APA at the next tier (growth pot). Not either-or."*

### What closed

PLP at the legacy-floor layer, layered on top of the existing term + APA structure. Premium sized to deliver the contractually defined sum assured the prospect wanted for the kids. APA continued running the retirement-growth job. The two products solving two different jobs, not competing for the same dollar.

### The lesson for any FC

PLP is the case where the FC has to defend a product against their *own* decoupling pitch. The instinct, after running BTIR cases all week, is to push BTIR universally. For high-income prospects with legacy goals and dependants, PLP is structurally correct — and the framing is *"different jobs, different tools."* Pull both into the pyramid: PLP at the foundation, APA above it. Once the prospect sees the two-tool framing, the case stops being PLP-vs-BTIR and becomes PLP-and-APA. That's the cleanest answer for this profile.
`,
};

/**
 * Returns the narrative markdown for a given case id, or null if none exists.
 * Used by CaseDetail.tsx to render the main reading content.
 */
export function getCaseNarrative(caseId: string): string | null {
  const narrative = CASE_NARRATIVES[caseId];
  return narrative ? narrative.trim() : null;
}
