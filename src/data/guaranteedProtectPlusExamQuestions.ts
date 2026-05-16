import type { QuizQuestion as ExamQuestion } from '@/types/questionBank';

export const guaranteedProtectPlusExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "A client wants $300,000 of GPP coverage. Compare what remains as the lifelong (post-65) base under each multiplier choice.",
    options: [
      "2x: $50k base / 3x: $100k base / 5x: $150k base",
      "2x: $150k base / 3x: $100k base / 5x: $60k base",
      "2x: $300k base / 3x: $200k base / 5x: $100k base",
      "All three multipliers leave $300k base after 65"
    ],
    correct: 1,
    explanation: "The accumulator (base) is total coverage divided by the multiplier. On $300k: 2x leaves $150k base, 3x leaves $100k base, 5x leaves $60k base -- which is why 5x has the dramatic post-65 drop and 2x has the smallest.",
    category: 'product-facts'
  },
  {
    question: "Under GPP's CI riders, how do the per-episode and aggregate caps differ between Early CI and Major CI claims?",
    options: [
      "Early CI: $350,000 per episode (with no aggregate cap); Major CI: capped at $1m total across AIA",
      "Early CI: $350,000 per episode; Major CI: no per-episode cap but $3m aggregate across all AIA CI policies",
      "Early CI: no cap; Major CI: $350,000 per episode",
      "Early CI: $250,000 per episode; Major CI: $5m aggregate"
    ],
    correct: 1,
    explanation: "Early CI is capped at $350,000 per episode. Major CI has no per-episode cap, but is subject to a $3m aggregate cap across all AIA CI policies held by the insured.",
    category: 'product-facts'
  },
  {
    question: "Compare GPP's TPD definition pre-65 vs post-65.",
    options: [
      "Pre-65: ADL test (2 of 6); Post-65: loss of two limbs/eyes plus inability to work for 6 months",
      "Same definition at all ages: any 30-day disability",
      "Pre-65: loss of two limbs/eyes (or one eye + one limb) AND inability to work for 6 consecutive months. Post-65: failing 2 of 6 ADLs (washing, dressing, transferring, mobility, toileting, feeding) for 6 months. TPD coverage caps at age 70.",
      "Pre-65: loss of one limb only; Post-65: not covered"
    ],
    correct: 2,
    explanation: "GPP's TPD pre-65 requires gross physical loss + 6-month total inability to work. Post-65 switches to an ADL test (2 of 6 for 6+ months). Either way, TPD coverage ends at age 70 -- which is why a separate accident plan is essential.",
    category: 'product-facts'
  },
  {
    question: "Walk through the exact eligibility chain for the Premium Pause Option.",
    options: [
      "Must have paid premiums for 1 year, on voluntary resignation, and have been employed for at least 1 month before separation.",
      "Available immediately on policy inception with no employment history needed.",
      "Must have paid premiums for at least 3 years, suffered involuntary retrenchment, been employed for at least 6 months before retrenchment, fulfilled a 2-month deferment period, and submitted documentation within 2 months after the deferment ends. The pause is 12 months interest-free, then interest accrues on outstanding balance.",
      "Must have paid premiums for 5 years and be over age 60."
    ],
    correct: 2,
    explanation: "All five conditions must be met: 3 years of premiums + involuntary retrenchment + 6 months prior employment + 2-month deferment + documentation within 2 months. The pause is a 12-month interest-free loan, not a waiver.",
    category: 'product-facts'
  },
  {
    question: "How does the Income Drawdown Facility differ between 50% and 100% utilisation, and when does the availability window open and close?",
    options: [
      "50%: 5%/yr for 10 yrs, policy continues with 50% SA. 100%: 10%/yr for 10 yrs, policy terminates after. Window opens at the LATER of multiplier expiry or end of premium term, and closes on the policy anniversary following the insured's 85th birthday.",
      "50%: 5%/yr for 5 yrs. 100%: 10%/yr for 5 yrs. Window from age 60 to 80.",
      "Both modes pay the same; window is age 65-100.",
      "50%: instant lump sum. 100%: monthly forever."
    ],
    correct: 0,
    explanation: "50% IDF: 5%/yr for 10 yrs, 50% SA stays in force. 100% IDF: 10%/yr for 10 yrs, policy terminates. Window: later of multiplier expiry or premium-term end, ending on the anniversary following the insured's 85th birthday.",
    category: 'product-facts'
  },
  {
    question: "Which entry-age caps apply by GPP premium term, and what is the minimum sum assured on the 2x multiplier?",
    options: [
      "25-yr term max age 60, 20-yr max 65, 15-yr max 70; minimum SA $50,000",
      "25-yr term max age 50, 20-yr max 55, 15-yr max 60; minimum SA $25,000 on 2x (~$50-60/month minimum premium)",
      "All terms allow up to age 75; minimum SA $10,000",
      "25-yr term max age 30, 20-yr max 40, 15-yr max 50; minimum SA $100,000"
    ],
    correct: 1,
    explanation: "Entry caps: 50/55/60 for 25/20/15-year terms. Minimum SA on 2x is $25,000 with approximately $50-60/month minimum premium.",
    category: 'product-facts'
  },
  {
    question: "On a 25-year-old non-smoker / $200k coverage / 65 drop-off / 25-year term setup, what are the approximate annual premiums by multiplier from cheapest to most expensive?",
    options: [
      "5x ~$2,200, 3x ~$1,946, 2x ~$2,500",
      "All three identical at ~$2,000",
      "2x ~$1,500, 3x ~$1,946, 5x ~$3,000",
      "5x ~$5,000, 3x ~$3,500, 2x ~$2,500"
    ],
    correct: 0,
    explanation: "Cheapest is 5x at ~$2,200, then 3x at ~$1,946 (the recommended default), then 2x at ~$2,500. Note 5x is cheapest but coverage drops dramatically at 65.",
    category: 'product-facts'
  },
  {
    question: "What are the two key Power-Up Dollar mechanics under GPP?",
    options: [
      "Flat 10% coverage boost regardless of multiplier; never changes after year 1",
      "First-year Base PowerUp Dollar: 10% on 2x, 15% on 3x, 25% on 5x. At each policy anniversary, the PUD adjusts by a percentage of Base PUD per Vitality status: Bronze -10%, Silver -5%, Gold 0%, Platinum +5%. Subject to a Minimum of 0 and Maximum of 150% of Base PUD. Locks in at the later of multiplier cut-off age or 15th policy anniversary.",
      "First-year boost depends on premium amount only; Vitality has no effect",
      "Power-Up Dollar applies only on the riders, not the base plan"
    ],
    correct: 1,
    explanation: "Per Product Summary page 12 (Adjustment of PowerUp Dollar at Policy Anniversary): Base PUD = 10/15/25% on 2x/3x/5x. Annual adjustment is a percentage of Base PUD by Vitality status -- Bronze -10%, Silver -5%, Gold 0%, Platinum +5%. Capped at 150% of Base PUD. Locks in at the later of multiplier cut-off or 15th policy anniversary.",
    category: 'product-facts'
  },
  {
    question: "How does the OPAI feature work under GPP, and what are its strict limits?",
    options: [
      "Triggered by any life event; unlimited exercises; valid for life",
      "Only triggered by marriage; up to 3 times before age 70",
      "Triggered by qualifying life events (marriage, child birth, legal adoption, spouse death, age 18) within 90 days; can only be exercised once; expires when the insured reaches age 55; no further underwriting required even with new conditions; new premium based on attained age; same terms as original policy; only guarantees the basic plan, not optional riders",
      "Triggered automatically; no time limit"
    ],
    correct: 2,
    explanation: "OPAI is a one-time, no-underwriting top-up triggered by qualifying life events within 90 days, ending at the insured's age 55. New premium is at attained age, same terms, basic plan only -- not riders.",
    category: 'product-facts'
  },
  {
    question: "What payout structure applies to special conditions under GPP's Early CI rider?",
    options: [
      "100% of insured amount per claim, unlimited claims, no cap",
      "Additional 20% of basic coverage amount or S$25,000 (whichever is lower) per condition; 1 claim per condition with a max 5 claims per policy; coverage ceases at age 85; conditions include adult-onset issues like osteoporosis and diabetic complications; does NOT reduce the main ECI/basic sum assured",
      "50% of insured amount per condition, capped at $50,000",
      "10% per condition with no cap"
    ],
    correct: 1,
    explanation: "Per Brochure footnote 7 (Page 9): Special Conditions coverage ceases at age 85 (NOT age 21). Payout is an additional 20% of basic coverage amount or S$25,000, whichever is lower, with 1 claim per condition up to 5 claims per policy total. Brochure page 4 lists 15 special conditions including osteoporosis and diabetic complications -- these are adult-onset, not child-related.",
    category: 'product-facts'
  },
  {
    question: "What waiting periods, exclusions and free-look terms apply across the GPP base plan and its CI riders at policy inception?",
    options: [
      "30-day waiting on all conditions; no survival period; 7-day free-look",
      "Under the Critical Protector Life / Early Critical Protector Life riders: 90 days waiting period for most CI conditions, 1 year for ADHD-caused conditions, 7-day survival period after diagnosis. Under the GPP base plan: 14-day free-look from policy receipt, suicide excluded in the first policy year, pre-existing conditions/surgeries excluded, TPD not covered if from deliberate self-endangerment/suicide/war, Premium Pause not available to full-time MPs.",
      "180-day waiting; 30-day survival; 60-day free-look",
      "No waiting period or exclusions"
    ],
    correct: 1,
    explanation: "Split by where the rule lives. CI riders (Critical Protector Life / Early Critical Protector Life): 90-day waiting (1-year for ADHD) + 7-day survival. GPP base: 14-day free-look, year-1 suicide exclusion, pre-existing exclusion, TPD exclusions for self-endangerment/war, and no Premium Pause for full-time MPs. The base PS does not specify a CI waiting period -- that's a rider-level rule.",
    category: 'product-facts'
  },
  {
    question: "On a $200k / 25-year-old / 3x / 25-year sample, what are the rough total premiums vs cash value at maturity, and what implied yield does that represent?",
    options: [
      "$48,000 paid in over 25 years, ~$192,000 cash value at age 100, ~2% p.a. -- about 4x what was paid in",
      "$200,000 paid in, $200,000 back, 0% yield",
      "$1,000 paid in, $1,000,000 back, 100% yield",
      "$50,000 paid in, $50,000 back at 65"
    ],
    correct: 0,
    explanation: "On the lecture's sample: ~$48k paid in over 25 years (~$1.946k/yr), ~$192k cash value at maturity (age 100) -- about 4x the premiums paid in, implying around 2% p.a. yield. Bank account by comparison gives 0% and zero coverage.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (10 questions)
  // ============================================================

  {
    question: "A client says: 'GPP is much pricier than the term plan I saw online.' What is the cleanest reframe?",
    options: [
      "Drop the price.",
      "Switch to recommending term insurance.",
      "Acknowledge the gap, then reframe with the buying-vs-renting analogy: term is rent (forever expense, nothing back, premiums spike at 65 renewal); GPP is a mortgage (limited 15-25 year payment, then you 'own' coverage for life with cash value). Even total lifetime cost can favour GPP once renewal increases on term are factored in.",
      "Tell the client term is always inferior."
    ],
    correct: 2,
    explanation: "The buying-vs-renting analogy reframes price difference as ownership vs expense, and the lifetime-cost angle exposes that term renewal at older ages can make total cost higher than GPP's limited-pay structure.",
    category: 'sales-angles'
  },
  {
    question: "Compare the typical sample numbers used in the Phase 3 'start now vs start in 10 years' urgency pitch (3x / $200-300k case).",
    options: [
      "Start at 25: ~$2,800/yr, $72k total premiums, 75 yrs of coverage. Start at 35: ~$4,160/yr, $104k total premiums, only 65 yrs of coverage. Same policy: longer coverage AND ~$30k less in lifetime premiums by starting young.",
      "Both ages cost identically.",
      "Starting at 35 is cheaper than 25.",
      "Premium differences are under $50/yr regardless of age."
    ],
    correct: 0,
    explanation: "The standard urgency comparison: $2.8k/yr at 25 vs $4.16k/yr at 35 -- $1,400+/yr more, $30k+ more in lifetime premiums, AND 10 fewer years of coverage. Frame with the warranty analogy.",
    category: 'sales-angles'
  },
  {
    question: "What is the 'four hoops' decision framework used in the Phase 5 GPP close, in order?",
    options: [
      "Hoop 1: I need CI -> Hoop 2: I need to buy now -> Hoop 3: I need 3x or 2x (multiplier choice) -> Hoop 4: I need Early CI",
      "Hoop 1: I need savings -> Hoop 2: I need term -> Hoop 3: I need GPP -> Hoop 4: I need an annuity",
      "There are only two hoops.",
      "All four hoops can be passed at once at the start."
    ],
    correct: 0,
    explanation: "Four progressive yeses: need CI (acceptance), buy now (urgency), pick multiplier (sizing), add Early CI (comprehensive). Each yes makes the next easier.",
    category: 'sales-angles'
  },
  {
    question: "Why does the Phase 5 playbook recommend a 'half-half' split on Early and Major CI rather than full sums on both?",
    options: [
      "AIA mandates the split.",
      "Buying $300k Major CI + $300k Early CI is expensive (~$4.4k/yr in the sample). Splitting 50/50 (e.g. $150k ECI + $150k Major CI) keeps total payout capped at $300k while drastically lowering premium. Early-stage claim pays $150k; if it progresses to major, the remaining $150k pays out -- total still $300k.",
      "It increases the total payout to $600k.",
      "It is not a recommended strategy."
    ],
    correct: 1,
    explanation: "Half-half retains the $300k total payout in any progression scenario but slashes premium vs full sums on both riders -- the cleanest way to make Early CI affordable without sacrificing coverage.",
    category: 'sales-angles'
  },
  {
    question: "How does the lecture explain GPP's ~2% yield vs a savings/fixed-deposit account?",
    options: [
      "GPP's yield is identical to FD.",
      "GPP gives ~2% p.a. AND lifelong coverage. A savings/FD gives ~1.x% AND zero coverage. Frame as 'killing two birds with one stone' (returns + coverage), and three birds in the worst case (refund + coverage + bonuses).",
      "FDs always outperform GPP.",
      "GPP is purely a coverage product with no returns."
    ],
    correct: 1,
    explanation: "GPP wins on both axes: higher yield AND lifelong coverage AND a death/CI payout if claimed. Banks give 0-1.x% with no protection. Use the 'two/three birds with one stone' line.",
    category: 'sales-angles'
  },
  {
    question: "Why is 3x recommended as the default multiplier for most GPP cases?",
    options: [
      "Cheapest premium overall.",
      "Highest commission tier.",
      "It sits in the middle on premium and post-65 base coverage. The lecture's sample illustration suggests 3x has the highest yield-per-dollar. 5x is cheapest but the post-65 drop is dramatic; 2x is most expensive. 3x is the balanced 'business class' default unless the client explicitly wants more cash value (-> 2x) or maximum cheapness (-> 5x).",
      "It is the only multiplier available."
    ],
    correct: 2,
    explanation: "3x is the default for premium-vs-coverage balance and yield-per-dollar. 5x and 2x are only chosen when the client explicitly wants cheapness or maximum cash value.",
    category: 'sales-angles'
  },
  {
    question: "How is the 'cash value question' used to qualify a prospect for GPP vs term?",
    options: [
      "Ask about their salary.",
      "Ask: 'If you pay $500/month for insurance and at the end you don't get any money back, how would you feel?' If they say 'a waste', they want cash value -- pivot to GPP. If they say 'fine', term is the cleaner fit.",
      "Ask about their religion.",
      "Don't ask any qualifying questions."
    ],
    correct: 1,
    explanation: "The cash-value question is the cleanest single test of GPP fit. 'A waste' means cash value matters to them -> GPP. 'Fine' means cash value isn't a need -> term is more honest.",
    category: 'sales-angles'
  },
  {
    question: "Compare the Phase 6 'Life Plan + UCC' packaging strategy vs a fully loaded GPP.",
    options: [
      "Same product, different name.",
      "Instead of buying GPP with both Major CI and Early CI riders, structure: GPP carries the base + Major CI + savings + death/disability; UCC (Universal Critical Care) covers Early CI and recurring CI claims. Often cheaper overall, with the added benefit of recurring claims via UCC. Used when the budget can't fit fully loaded GPP.",
      "Sell GPP twice.",
      "Drop UCC; only sell GPP."
    ],
    correct: 1,
    explanation: "Phase 6 splits coverage across two products: GPP for base/major CI/savings, UCC for early/recurring CI. Often more affordable overall and adds recurring-claims capability.",
    category: 'sales-angles'
  },
  {
    question: "Why is choosing the 65 booster drop-off generally recommended over 75, and when might 75 still make sense?",
    options: [
      "Always pick 75 -- it is cheaper.",
      "Default to 65 because by then non-guaranteed bonuses typically exceed the SA, especially on 2x/3x. The ~$100+/yr extra premium for 75 buys little practical benefit. 75 is rarely needed; consider it only if the client expects high working income past 65 and wants the booster to align with retirement age, or for specific estate-planning reasons.",
      "75 is mandatory.",
      "Both options give identical cash value."
    ],
    correct: 1,
    explanation: "Default to 65 -- bonuses usually exceed SA by then so the 75 drop adds little value. 75 is the niche option for clients who want booster cover beyond 65 for specific planning reasons.",
    category: 'sales-angles'
  },
  {
    question: "How does the 'limited payment, lifelong coverage' framing pair with the buying-vs-renting analogy to close the GPP case?",
    options: [
      "They contradict each other.",
      "They are unrelated talking points.",
      "Together they form the spine of the close: limited payment (15/20/25 yrs) is a finite ask -- like a mortgage on a house. Once paid off, you 'own' coverage for life with cash value built up. Term insurance, by contrast, is an indefinite rent payment with nothing left at the end. The combination makes the higher upfront cost feel like an investment, not an expense.",
      "They are only used for retirement plans."
    ],
    correct: 2,
    explanation: "Limited-pay + buying-vs-renting reframes the higher GPP premium as ownership (finite cost, lifelong asset) vs term as ongoing rent (forever expense, no equity).",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (8 questions)
  // ============================================================

  {
    question: "A client says: 'I'd rather buy a cheap term plan and invest the rest (BTID).' What is the most useful response?",
    options: [
      "Insist GPP always outperforms BTID.",
      "Cancel the case.",
      "Acknowledge BTID's mathematical logic, but flag that in practice few clients invest the difference consistently. GPP gives a forced-savings discipline + guaranteed elements + lifelong coverage at a known yield (~2% p.a.). Frame as complementary -- pair GPP for protection-with-stability with an ILP/APA for upside, rather than substitutes.",
      "Tell the client BTID is illegal."
    ],
    correct: 2,
    explanation: "BTID assumes investment discipline most clients lack. GPP forces savings + offers stability; pair it with an ILP for upside rather than competing. Don't trash BTID, just qualify when it works in practice.",
    category: 'objection-handling'
  },
  {
    question: "A client objects: 'The booster drops at 65 -- doesn't most of my coverage disappear?'",
    options: [
      "Agree and cancel the case.",
      "Tell them coverage doesn't drop.",
      "Reframe by multiplier choice: on 2x, the post-65 base is 50% of total (small drop). On 3x, base is 33% (moderate drop). On 5x, base is 20% (sharp drop). Most clients pick 3x (or 2x for resilience) for this reason. Add: by 65, mortgage is paid, kids are independent, retirement savings exist -- needs naturally decrease, so the residual base + bonuses is usually sufficient.",
      "Promise no drop ever happens."
    ],
    correct: 2,
    explanation: "The booster-drop concern is fundamentally about multiplier choice. 2x/3x cushion the drop; 5x doesn't. Pair with the lifecycle argument: needs decrease post-65 anyway.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'Why do I need Early CI? I can claim Major CI.' How do you handle this?",
    options: [
      "Skip Early CI.",
      "Use the live-Google demonstration: search 'carcinoma in situ' in front of the client. It is a Stage-0 pre-cancerous condition -- not even cancer yet. Without Early CI, a stage-1 cancer diagnosis pays nothing. The client would (rightly) blame the advisor at claim time. Use the half-half strategy ($150k+$150k) to keep Early CI affordable -- ~$60-70/month more than Major-only.",
      "Force Early CI without explanation.",
      "Tell the client Early CI is mandatory."
    ],
    correct: 1,
    explanation: "Live-Google 'carcinoma in situ' to demonstrate how 'early' Early CI really is. Pair with the half-half affordability story and the 'I'm not doing my job' worst-case framing.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'What if I lose my job and can't afford GPP?' How do you respond accurately?",
    options: [
      "AIA permanently waives premiums.",
      "The Premium Pause Option allows up to 12 months of paused premiums after 3 years of premiums paid, on involuntary retrenchment, with at least 6 months prior employment + 2-month deferment + documentation within 2 months. CRITICALLY: this is an interest-free LOAN not a waiver. The client must repay over the next 12 months, after which interest accrues. Outstanding loan is deducted from death benefit if claim happens during the period.",
      "The policy auto-cancels.",
      "Premium Pause is unlimited."
    ],
    correct: 1,
    explanation: "Be precise: 3 years paid + involuntary retrenchment + 6 months prior employment + 2-month deferment. It is an interest-free loan, not a waiver -- repaid in 12 months, interest after.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'My friend's GPP returns were terrible -- the bonuses didn't materialise.' How do you handle this honestly?",
    options: [
      "Promise the bonuses are guaranteed.",
      "Tell them their friend was lying.",
      "Be transparent: bonuses are non-guaranteed and depend on the participating fund's performance. BEFORE multiplier expiry, coverage is unaffected by bonus performance. AFTER expiry, poor bonus performance does affect the death benefit (which equals base + bonuses). De-risk the structure: 2x or 3x for resilience, 65 drop-off so bonuses have less time pressure to outperform, and pair with an ILP for non-guaranteed upside elsewhere.",
      "Tell them to cancel the case."
    ],
    correct: 2,
    explanation: "Honesty about non-guaranteed bonuses is the right play. Then de-risk: 2x/3x cushion against poor bonus performance, and clients seeking guaranteed-only should be redirected to endowments.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I want to surrender after 5 years for cash.' What is the right counsel?",
    options: [
      "Encourage the surrender.",
      "Strongly caution: GPP surrender values are very low in the early years -- the client would lose most of what they paid. The plan is structured for a 15-25 year limited-pay horizon; early surrender defeats both protection and savings purposes. If the client genuinely cannot commit to 15+ years, GPP is the wrong product -- recommend a shorter-horizon plan (term, short endowment, or fixed deposit ladder) instead.",
      "Promise full refund on surrender.",
      "Tell them surrender values match premiums in year 5."
    ],
    correct: 1,
    explanation: "Early surrender wipes out most of what was paid. If the horizon is genuinely 5 years, GPP is the wrong product -- be honest and recommend a fitter alternative rather than force-fit.",
    category: 'objection-handling'
  },
  {
    question: "A client claims: 'I'll use the Income Drawdown Facility from age 60.' What do you correct, and what is the right answer?",
    options: [
      "Approve -- 60 is correct.",
      "IDF is only available from the LATER of multiplier expiry OR end of premium term, until the policy anniversary following the insured's 85th birthday. So if the client took a 65 drop-off and a 25-year term started at 25 (so premium ends at 50), IDF starts at 65 (the later of 65 or 50). 60 is incorrect for that setup.",
      "Tell the client IDF starts at 50.",
      "IDF starts at policy inception."
    ],
    correct: 1,
    explanation: "IDF availability = later of (multiplier expiry, end of premium term). So a 65 drop-off + 25-year term started at 25 means IDF opens at 65, not 60. The window closes on the anniversary following age 85.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I have a pre-existing condition -- will I be rejected?' How do you respond compliantly?",
    options: [
      "Advise them to omit it on the form.",
      "Promise standard rates.",
      "Tell them they're definitely uninsurable.",
      "Be honest: pre-existing conditions and prior surgeries are excluded under GPP. Underwriting may load the premium, apply specific exclusions, or accept standard. NEVER advise non-disclosure -- it voids the contract at claim time. Submit the application honestly. If GPP loads heavily, OPAI on existing AIA plans is a no-underwriting alternative (subject to its own life-event triggers and one-time use)."
    ],
    correct: 3,
    explanation: "Always submit with full disclosure -- non-disclosure voids claims later. Pre-existing conditions are excluded; loading or specific exclusions may apply. OPAI on existing AIA plans is a fallback no-underwriting path.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (6 questions)
  // ============================================================

  {
    question: "A 25-year-old fresh grad earning $60k/yr with no insurance and ~$400/month spare asks: 'Where do we start?' Walk through your Phase 1 + Phase 2 default quote.",
    options: [
      "Skip CST and quote the maximum coverage.",
      "Sell only term.",
      "Phase 1: anchor on the 10% rule (~$500/month) and the cash-value question. Run CST to identify CI shortfall (5x income = $300k CI need). Phase 2 default: $300k coverage, 3x multiplier, 65 drop-off, 25-year term -- around $2,800/year base. Then layer in Early CI half-half ($150k+$150k) -- ~$60/month more. Discuss complementary hospitalisation + accident plans within budget.",
      "Quote a 5x multiplier with 15-year term to maximise commission."
    ],
    correct: 2,
    explanation: "Standard Phase 1+2 flow: 10% rule + cash-value question + CST -> default $300k/3x/65/25-yr quote -> layer Early CI half-half -> hospitalisation + accident plans. Don't skip CST or force-fit a multiplier.",
    category: 'roleplay'
  },
  {
    question: "A 32-year-old new parent with a $4,000 mortgage and a newborn says: 'I want my family covered if anything happens.' Build the GPP package.",
    options: [
      "Sell only term insurance.",
      "GPP framed as mortgage-style protection: 20-year limited pay (matches working years), 3x multiplier (high coverage during peak responsibility), 65 drop-off (kids independent, mortgage paid by then). Add Early CI half-half. If wife is also expecting, add the Mum-to-Baby rider to her own GPP for child coverage at birth without underwriting + pregnancy complication cover. Plan child plan post-birth.",
      "Force the client to take a 25-year term in single income only.",
      "Skip GPP and sell only an ILP."
    ],
    correct: 1,
    explanation: "20-year pay + 3x + 65 drop-off matches life stage perfectly. Mum-to-Baby rider on the mother's GPP (if relevant) gives the child no-underwriting coverage at birth.",
    category: 'roleplay'
  },
  {
    question: "A 45-year-old executive with two existing whole-life plans (~$200k cover) earning $180k/yr says 'I'm already covered.' How do you proceed?",
    options: [
      "Cancel both existing plans.",
      "Walk away.",
      "Run CST: 5x his $180k income = $900k CI need. He's short ~$700k. Position GPP as a TOP-UP, not replacement: $500-700k coverage, 3x multiplier, 20-year term (max entry age 55 still allows it), half-half Early CI of ~$150k. Frame the gap quantitatively. If his cashflow can't sustain the top-up, propose the Phase 6 'GPP + UCC' split to keep total premium manageable.",
      "Recommend he cancel his term plans."
    ],
    correct: 2,
    explanation: "Use CST to quantify the gap objectively. Top-up GPP without disturbing existing plans, with the Phase 6 GPP+UCC split as a budget-friendly fallback.",
    category: 'roleplay'
  },
  {
    question: "A 38-year-old self-employed contractor with variable income asks: 'Can GPP flex with my cashflow?' How do you respond honestly?",
    options: [
      "Promise full flexibility.",
      "Be honest: GPP premiums are level and fixed -- not flexible like an ILP. The relief tools are: (1) Premium Pause -- but only for involuntary retrenchment from employment, which may not apply to self-employed; (2) Reduce sum assured anytime (but this also reduces coverage and returns); (3) Right-size at minimum SA on 2x (~$50-60/month) so missed payments are less likely. For genuine premium flexibility, recommend an ILP like APA or PLP instead.",
      "Tell them GPP premiums auto-adjust.",
      "Sell maximum coverage anyway."
    ],
    correct: 1,
    explanation: "Be honest: GPP is fixed. Self-employed clients are often a better fit for an ILP (APA/PLP) for flexibility, or for a minimal-SA GPP that fits even lean months.",
    category: 'roleplay'
  },
  {
    question: "A 28-year-old wants $500k of CI cover but only has $250/month budget. What is your structuring approach?",
    options: [
      "Tell them $500k is impossible.",
      "Push them to borrow.",
      "Sell $500k 5x and ignore the post-65 collapse.",
      "Right-size sum assured to budget: $250/month likely buys ~$300k on 3x with half-half Early CI. Pre-plan OPAI as the no-underwriting upgrade path on qualifying life events (marriage, child birth, etc. -- one-time, before age 55). Walk through the lifecycle: start at $300k now, OPAI to add ~50% later when income/life-event triggers fire. Document the 'aspirational $500k' goal in the file."
    ],
    correct: 3,
    explanation: "Match SA to budget today, half-half ECI for affordability, and pre-plan OPAI as the no-underwriting top-up path on qualifying life events.",
    category: 'roleplay'
  },
  {
    question: "A 60-year-old client with a 25-year-old GPP policy (paid up, accumulated bonuses) asks: 'Should I cash everything out now?'",
    options: [
      "Recommend full surrender.",
      "Walk through three options: (1) Partial withdrawal -- get cash now but coverage reduces proportionally (50% withdrawal = 50% coverage cut); (2) IDF 50% from age 65 -- 5%/yr for 10 yrs, 50% SA continues for life; (3) IDF 100% -- 10%/yr for 10 yrs, policy terminates after. Don't surrender outright -- 25 yrs of accumulated bonuses would be lost. Match recommendation to the client's actual income need: lump sum -> partial; steady income with residual cover -> IDF 50%; maximum income, accept termination -> IDF 100%.",
      "Refuse to advise.",
      "Tell them surrender is always best."
    ],
    correct: 1,
    explanation: "A 25-year-old policy has significant accumulated bonuses -- don't surrender outright. Lay out partial withdrawal vs IDF 50% vs IDF 100% based on the client's actual cashflow need.",
    category: 'roleplay'
  },

  // ============================================================
  // CATEGORY-PARITY EXAM QUESTIONS (Q37-Q56) -- 2026-05-09
  // Brings GPP exam to parity with other products (5 each in
  // suitability / compliance / advisory-skills / closing).
  // ============================================================

  // ---------- SUITABILITY (5) ----------

  // Q37
  {
    question: "Which of the following client profiles is the curriculum's strongest 'walk away from GPP' signal?",
    options: [
      "30-year-old earning $80k/year, married, 2 kids, looking for protection + savings",
      "55-year-old planning to retire in under 10 years, wants liquid savings with no protection requirement",
      "40-year-old self-employed, wants stable cash value as part of a diversified portfolio",
      "35-year-old single, $15k/yr CI gap, looking for limited-pay protection"
    ],
    correct: 1,
    explanation: "Day 5 walk-away rule #1: time horizon under 10 years. The early-year surrender value sits below total premiums paid for the first decade, so a sub-10-year client gets a worse deal than pure term + a separate savings vehicle. Walk away or recommend the alternative.",
    category: 'suitability'
  },

  // Q38
  {
    question: "Per the curriculum, what monthly budget threshold is required before limited-pay GPP becomes a sensible recommendation rather than over-stretching the client?",
    options: [
      "Any amount above $50/month",
      "Approximately $200-300/month at minimum -- below this the booster sum assured is too small for the limited-pay structure to outperform pure term + a separate savings plan",
      "Only clients earning above $200k/year",
      "There is no budget threshold; GPP scales linearly down to zero"
    ],
    correct: 1,
    explanation: "Below ~$200-300/month, the booster sum assured is too small for the limited-pay whole-life premium to be efficient on a per-dollar-of-cover basis. At that budget, term + separate savings dominates. Document the threshold rule in the fact-find before recommending.",
    category: 'suitability'
  },

  // Q39
  {
    question: "A 40-year-old client says: 'I already have $200k of term life through my employer, so I don't need GPP.' What's the suitability-driven response?",
    options: [
      "Agree and walk away",
      "Push GPP regardless of the existing cover",
      "Map the gap: employer term ends when employment ends (TPD ends at job loss, no portability), no CI, no cash value, no lifetime protection. GPP fills the portable + lifetime + CI + cash-value gaps that employer term cannot. Suitability is about gap analysis, not absolute cover.",
      "Tell them to drop the employer term"
    ],
    correct: 2,
    explanation: "Employer term is non-portable, no CI, no TPD post-employment, no cash value, no lifetime protection. The suitability case for GPP is the structural gap, not the absolute sum assured.",
    category: 'suitability'
  },

  // Q40
  {
    question: "Which client profile is the canonical 'wrong fit' for the 5x multiplier specifically (vs 2x or 3x)?",
    options: [
      "Young single client with high disposable income who wants the cheapest premium and accepts the post-65 coverage drop",
      "Mid-career parent who needs MAXIMUM lifelong protection because the breadwinner role extends past 65 and dependents remain",
      "Client who explicitly wants the largest day-1 cover for the lowest premium and has confirmed no post-65 dependents",
      "Sophisticated investor who treats GPP as a wealth tool with full understanding of the post-65 drop"
    ],
    correct: 1,
    explanation: "5x has the smallest residual base (1/5 of total cover) and the largest post-65 collapse. A breadwinner with dependents past 65 is the worst fit -- they need the LARGEST residual base, which is 2x. Suitability flag: surface the post-65 drop explicitly when 5x is chosen.",
    category: 'suitability'
  },

  // Q41
  {
    question: "Per Day 5, which THREE 'walk away from the case' signals together rule out GPP regardless of how persuasive the rest of the pitch could be?",
    options: [
      "Time horizon under 10 years; budget below the limited-pay floor; explicit need for fully liquid / penalty-free access in the early years",
      "Client is over 50; client is unmarried; client has no kids",
      "Client lives outside Singapore; client has Vitality Bronze; client smokes",
      "Client wants 5x; client is aged 30-40; client wants $1m cover"
    ],
    correct: 0,
    explanation: "Day 5 walk-away rules: (1) time horizon < 10 years (cash value gap), (2) budget too small for limited-pay structure (term + savings dominates), (3) liquidity-first need (early surrender penalty wipes out the value proposition). Any one is a yellow flag; all three together is a hard 'recommend a different product'.",
    category: 'suitability'
  },

  // ---------- COMPLIANCE (5) ----------

  // Q42
  {
    question: "Per the GPP curriculum, when is the 'anti-market' disclosure (year-1 cash value gap, non-guaranteed bonuses, 10-yr horizon required) ideally delivered in the appointment?",
    options: [
      "After the iPOS+ submission, as a closing formality",
      "Up-front in Phase 1 -- before the illustrator, before the pitch -- positioned as the trust move that distinguishes a fiduciary from a hard-seller",
      "Only if the client asks about downsides",
      "It is not required and should be avoided to protect the close"
    ],
    correct: 1,
    explanation: "Day 1 + Day 5 frame the anti-market disclosure as a Phase 1 trust move, BEFORE the illustrator and pitch. Stating downsides up-front pre-empts buyer's remorse, signals fiduciary stance, and protects against free-look cancellations. Delivering it late looks defensive.",
    category: 'compliance'
  },

  // Q43
  {
    question: "Per Day 5, which FOUR disclosures must be delivered as a single recited block before the iPOS+ binary close?",
    options: [
      "Cover amount, premium, pay term, multiplier",
      "Bonuses are non-guaranteed; early-year cash value sits below premiums paid; accelerated CI claims reduce the death benefit; Premium Pause is a 12-month interest-free LOAN, not a waiver",
      "Free-look period, GIRO date, Vitality enrolment, FHR signature",
      "Suicide year-1 exclusion, pre-existing exclusion, 90-day waiting, war exclusion"
    ],
    correct: 1,
    explanation: "The RNF-clean closing block is: (1) bonuses non-guaranteed, (2) early-year cash value below premiums, (3) accelerated CI reduces death benefit, (4) Premium Pause is a loan not a waiver. Delivering all four as a single recited block before iPOS+ submission is the standard FC discipline taught in Day 5.",
    category: 'compliance'
  },

  // Q44
  {
    question: "During fact-find, the client says 'I have nothing' when asked about pre-existing conditions. What is the compliance-driven action?",
    options: [
      "Skip the question -- the iPOS+ form will catch it later",
      "Document the question + the client's verbatim answer (e.g. 'Any hospitalisation in last 5 yrs? -- Client: No') and explicitly state that undisclosed pre-existing conditions can void claims; have the client initial the section",
      "Only ask about cancer history",
      "Move on without recording the response"
    ],
    correct: 1,
    explanation: "Document-the-question is a hard compliance rule. The PS exclusions list and Day 5 curriculum both require explicit disclosure that undisclosed pre-existing conditions are excluded from claims. Writing the question + verbatim answer + initialling protects both client and FC at claim time.",
    category: 'compliance'
  },

  // Q45
  {
    question: "Which of the following clients is explicitly excluded by the GPP Product Summary from exercising the Premium Pause Option?",
    options: [
      "Anyone earning under S$50,000/year",
      "Self-employed, family-business employees, voluntary resignation/retirement, AND full-time Members of Parliament",
      "Anyone aged over 60",
      "Clients on a 25-year premium term"
    ],
    correct: 1,
    explanation: "PS Page 7 Premium Pause exclusions: self-employed, family-business employees, voluntary resignation/retirement and other voluntary terminations are excluded. Day 5 also names full-time MPs explicitly. The compliance discipline is to confirm employment type at fact-find before promising the Premium Pause Option.",
    category: 'compliance'
  },

  // Q46
  {
    question: "Per the GPP base PS, what is the suicide exclusion window, and how must this be disclosed?",
    options: [
      "There is no suicide exclusion; full death benefit pays out from day 1",
      "Suicide within the FIRST POLICY YEAR is excluded from the death benefit; this must be disclosed as part of the iPOS+ exclusions block, not buried in fine print",
      "Suicide is excluded for 5 years",
      "Suicide is excluded only if undisclosed"
    ],
    correct: 1,
    explanation: "PS suicide clause: year-1 exclusion only. Compliance requires explicit disclosure during the exclusions block at iPOS+ time, alongside pre-existing, war, and self-endangerment TPD exclusions. Burying it in fine print is a free-look risk if the family later discovers it during a year-1 claim.",
    category: 'compliance'
  },

  // ---------- ADVISORY SKILLS (5) ----------

  // Q47
  {
    question: "Per Day 4's 'four-bucket' coverage map, which AIA product anchors each bucket: (1) CI + Death + Savings, (2) Hospitalisation, (3) Accident, (4) Wealth?",
    options: [
      "(1) Term, (2) GPP, (3) PWV, (4) HSGM",
      "(1) GPP, (2) HSGM, (3) Solitaire / Centurion PA, (4) APA / PWV",
      "All four sit inside GPP",
      "(1) PWV, (2) HSGM, (3) GPP, (4) Solitaire PA"
    ],
    correct: 1,
    explanation: "Day 4 four-bucket map: GPP (CI + Death + Savings), HSGM (Hospitalisation), Solitaire / Centurion PA (Accident), APA / PWV (Wealth). After every GPP close, walk the client through the remaining 3 buckets to seed the expansion roadmap.",
    category: 'advisory-skills'
  },

  // Q48
  {
    question: "Per Day 2's appointment pacing rule, what is the time-budget for the GPP single visit, and what's the explicit fallback if you can't compress to that?",
    options: [
      "60 minutes; if you hit the limit, drop the multiplier explanation",
      "25 minutes single visit; if you can't compress, BOOK A SECOND VISIT rather than rushing the close in the same session",
      "10 minutes; never extend",
      "No time budget -- take as long as the client wants"
    ],
    correct: 1,
    explanation: "Day 2 pacing rule: 25-minute single visit; if it doesn't fit, book a second visit rather than rush the close. A rushed close drives buyer's remorse and free-look cancellations. The advisory discipline is to PROTECT the close by deliberately walking away from same-day pressure when the conversation runs long.",
    category: 'advisory-skills'
  },

  // Q49
  {
    question: "Per Day 5's post-close cadence, what are the Day 30 and Day 60-90 service touches for a newly-issued GPP policy?",
    options: [
      "No cadence is needed once the policy is issued",
      "Day 30: confirm GIRO + Vitality enrolment + ask for one referral; Day 60-90: review-style call to check life changes and seed the next product (HSGM / PA / APA-ladder)",
      "Day 7: cancel call; Day 60: re-quote",
      "Day 365: annual review only"
    ],
    correct: 1,
    explanation: "Day 5 lines 339-358: Day 30 = service touch (confirm GIRO + Vitality + first referral ask), Day 60-90 = soft review (life changes + warm up next product). Skipping these makes the case feel transactional, kills repeat business, and concedes the next product to a competitor.",
    category: 'advisory-skills'
  },

  // Q50
  {
    question: "After a GPP close, which adjacent move is the highest-conversion expansion play per Day 4?",
    options: [
      "Cold-calling the parents on the FHR's emergency contact list",
      "Spouse cross-sell -- mirroring the same GPP + UCC pair on the spouse's life",
      "LinkedIn outbound to the client's colleagues",
      "Door-knocking the client's residential block"
    ],
    correct: 1,
    explanation: "Day 4 lines 332-338: spouse cross-sell is the highest-conversion adjacent move -- same risk profile, same household economics, plus trust transfer from the just-closed primary policy. Mirror the GPP + UCC pair on the spouse before chasing referrals further out.",
    category: 'advisory-skills'
  },

  // Q51
  {
    question: "Per Day 2's Phase 5 method, what is the 'Apple Store layering' analogy, and what sequencing rule does it enforce?",
    options: [
      "Show the most expensive bundle first to make GPP look cheap",
      "Quote the BASE plan first (without Early CI), then layer add-ons (Early CI, multiplier upgrades) the way Apple sells iPhone with optional AppleCare and storage tiers -- 'price first, then layer'",
      "Always discount the rider by 20%",
      "Bundle everything together upfront so the client sees one number"
    ],
    correct: 1,
    explanation: "Day 2 lines 216-219: Apple Store layering = base price first, layer add-ons. Never quote the rider already baked in -- you anchor on the bigger number and lose the binary close in Phase 5. The sequencing rule is the structural enabler of the 'with or without Early CI?' close.",
    category: 'advisory-skills'
  },

  // ---------- CLOSING (5) ----------

  // Q52
  {
    question: "What is the actual close-the-deal binary in the GPP 6-phase pitch flow, and which phase delivers it?",
    options: [
      "Phase 4 (iPOS+ quotation): 'Yearly or monthly premium?'",
      "Phase 5 (Layer Early CI): 'Would you prefer with Early CI or without Early CI?'",
      "Phase 1 (Open): 'Do you want CI cover?'",
      "Phase 6 (Package): 'GPP or term?'"
    ],
    correct: 1,
    explanation: "Day 2 + Day 5: Phase 5 ends with 'with or without Early CI?' -- the formal close binary. By that point the prospect has cleared the four hoops (need, fit, affordability, trust) and the binary turns the conversation into a yes-yes choice instead of yes-no.",
    category: 'closing'
  },

  // Q53
  {
    question: "Per Day 5, what 6 milestones must ALL be hit before the case is genuinely 'closed'?",
    options: [
      "FHR signed, iPOS+ submitted, first GIRO confirmed, free-look period passed, AIA Vitality enrolled, next-conversation booked",
      "Quotation sent, payment received, policy issued",
      "Free-look only -- once 14 days pass, the case is closed",
      "First call done, e-signature collected, first premium paid"
    ],
    correct: 0,
    explanation: "Day 5 lines 360-372: 'closed' = FHR signed + iPOS+ submitted + first GIRO + free-look passed + Vitality enrolled + next conversation booked. Skipping any one leaves a leaky pipeline -- e.g. no Vitality enrolment means no PUD adjustment leverage, no booked next call means no expansion path.",
    category: 'closing'
  },

  // Q54
  {
    question: "In Phase 5 of the pitch, the client clears all four hoops but says 'Let me think about it overnight.' What's the closing-discipline response?",
    options: [
      "Agree to call back tomorrow with no specific commitment",
      "Anchor a specific time + format ('Let's lock in 30 minutes tomorrow at 7pm via Zoom -- I'll bring two scenarios so you can pick'), restate the binary, and confirm what specifically they want to think about so you can address it then",
      "Push for an immediate signature with pressure tactics",
      "Walk away and stop following up"
    ],
    correct: 1,
    explanation: "Don't accept open-ended 'let me think' as the close. The discipline: (1) book a specific follow-up slot, (2) restate the binary so it doesn't dissolve overnight, (3) surface the specific concern so you prepare an answer. Open-ended deferrals close at <20%; anchored deferrals close at 60-70%.",
    category: 'closing'
  },

  // Q55
  {
    question: "What is the 'four hoops' decision framework in Phase 5, and what role does it play right before the close?",
    options: [
      "A pricing tier (Bronze, Silver, Gold, Platinum)",
      "Need confirmed, Fit confirmed, Affordability confirmed, Trust confirmed -- four explicit micro-commits the FC walks the client through before asking the binary, so the close lands on a primed yes-yes choice",
      "Four objections you must overcome",
      "Four product features you must list"
    ],
    correct: 1,
    explanation: "Four hoops = Need / Fit / Affordability / Trust -- each one a micro-yes the FC obtains before the Phase 5 binary. The close is built on the four hoops, not delivered cold. If a hoop hasn't cleared, the binary will fail; loop back to that hoop instead of forcing the close.",
    category: 'closing'
  },

  // Q56
  {
    question: "After the Phase 5 binary closes 'with Early CI', what is the immediate next move in Phase 6 before the FC leaves the appointment?",
    options: [
      "Pack up and schedule the iPOS+ for next week",
      "Lock in the package on the spot: confirm sum assured + multiplier + pay term + Early CI sizing + Vitality enrolment + GIRO date in writing, then start the iPOS+ submission while the commitment is fresh -- never wait days when the binary just landed",
      "Discuss whether to add other riders",
      "Re-open the multiplier choice"
    ],
    correct: 1,
    explanation: "Phase 6 (Package) immediately after the binary close: lock the package in writing, start iPOS+ live. Waiting days lets the commitment dissolve. The FC discipline is 'binary close -> immediate iPOS+' -- same appointment if possible, same day at minimum.",
    category: 'closing'
  }
];
