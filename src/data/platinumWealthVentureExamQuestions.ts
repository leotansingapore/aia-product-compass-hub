import type { ExamQuestion } from './proAchieverExamQuestions';

export const platinumWealthVentureExamQuestions: ExamQuestion[] = [

  // ══════════════════════════════════════════
  // PRODUCT FACTS (12 questions)
  // ══════════════════════════════════════════

  {
    question: "What is the supplementary charge rate and duration for AIA Platinum Wealth Venture per the canonical Product Summary?",
    options: [
      "3.9% p.a. for the first 10 years",
      "3.6% p.a. for the first 5 years only",
      "4.0% p.a. for the first 8 years",
      "3.60% p.a. for the first 10 policy years, deducted monthly even during Premium Holiday"
    ],
    correct: 3,
    explanation: "PS Section 5.2 (p.4): PWV's Supplementary Charge is 3.60% p.a. of Regular Premium Policy Value, deducted monthly for the first 10 policy years (including during Premium Holiday). Pro Achiever runs 3.9% p.a. for the same 10-year duration, so PWV has the lower rate at the same duration.",
    category: 'product-facts'
  },

  {
    question: "What is the surrender charge schedule for PWV in policy years 3 through 7 per the canonical Product Summary?",
    options: [
      "80%, 70%, 60%, 50%, 45%",
      "90%, 80%, 70%, 60%, 50%",
      "60%, 55%, 50%, 40%, 30%",
      "80%, 60%, 40%, 20%, 10%"
    ],
    correct: 2,
    explanation: "PS Section 5.5 (p.5) Full Surrender Charge schedule: Y1: 70% / Y2: 65% / Y3: 60% / Y4: 55% / Y5: 50% / Y6: 40% / Y7: 30% / Y8: 20% / Y9: 10% / Y10: 5% / Y11+: 0%. The Years 3-7 sequence is therefore 60%, 55%, 50%, 40%, 30%.",
    category: 'product-facts'
  },

  {
    question: "How does the Investment Bonus work in PWV per the canonical Product Summary?",
    options: [
      "2.5% of annualised regular premium credited at the beginning of each of policy years 9, 10, 11 and 12 (10% cumulative), provided premiums are paid and the policy is not on Premium Holiday",
      "10% of annualised premium paid once at Year 10",
      "5% of annualised premium paid annually from Year 5 onwards",
      "7% of annualised premium spread equally across Years 6 to 8"
    ],
    correct: 0,
    explanation: "PS Section 3.4 (p.2): the Investment Bonus is 2.5% of annualised regular premium credited at the beginning of each of policy years 9, 10, 11 and 12, totalling 10% cumulative. The bonus is paid as regular premium units, provided the policy is in force and not on Premium Holiday.",
    category: 'product-facts'
  },

  {
    question: "What is the Welcome Bonus structure for a PWV policy with S$12,000 annualised regular premium per the canonical Product Summary?",
    options: [
      "5% in Years 1, 2, and 3 totaling 15%",
      "5% in Year 1 and 5% in Year 2, totaling 10%",
      "Year-by-year rates of 3%, 5%, 7%, 9%, 11% across the first 5 policy years (35% cumulative)",
      "3% per year for 5 years totaling 15%"
    ],
    correct: 2,
    explanation: "PS Section 3.3 (p.2): for annualised regular premium in the S$12,000-and-above band, Welcome Bonus rates per policy year are 3%, 5%, 7%, 9%, 11% in policy years 1 through 5, totalling 35%. The middle band (S$9,000-S$11,999) totals 26%; the lowest band (S$7,800-S$8,999) totals 16%.",
    category: 'product-facts'
  },

  {
    question: "What is the Premium Holiday charge if a PWV policyholder misses premiums after paying only the first 2 annual premiums per the canonical Product Summary?",
    options: [
      "60% annual rate divided by 12 per month",
      "30% annual rate divided by 12 per month",
      "50% annual rate divided by 12 per month",
      "0% — no charge after paying 2 premiums"
    ],
    correct: 1,
    explanation: "PS Section 5.4 (p.5) Premium Holiday Charge Annual Rate: 1st premium = 60%, 2nd = 30%, 3rd = 20%, 4th = 20%, 5th = 10%, 6th = 10%, 7th = 5%, 8th onwards = 0%. After 2 annual premiums paid, the applicable annual rate is 30% (charged monthly as 30%/12 of annualised regular premium).",
    category: 'product-facts'
  },

  {
    question: "Which of the following is NOT a coverage provided by PWV?",
    options: [
      "Terminal Illness and Total Permanent Disability coverage",
      "Accidental death benefit in the first 2 policy years",
      "Death benefit (higher of premiums paid or fund value)",
      "Secondary Insured continuation option"
    ],
    correct: 0,
    explanation: "PWV does not cover Terminal Illness (TI), Total Permanent Disability (TPD), Critical Illness (CI), or Early CI. It is primarily a wealth accumulation vehicle with death benefit and accidental death benefit in Years 1-2.",
    category: 'product-facts'
  },

  {
    question: "What happens to a PWV policy if the original insured dies and a Secondary Insured was previously appointed?",
    options: [
      "The death benefit is paid to the nominated beneficiary and the policy terminates",
      "Half the death benefit is paid and the policy continues for the Secondary Insured",
      "The Secondary Insured receives the death benefit and a new policy is issued",
      "The death benefit is not paid -- the policy continues with the Secondary Insured as the new insured"
    ],
    correct: 3,
    explanation: "When a Secondary Insured was appointed before the original insured's death, the death benefit is NOT paid. Instead, the policy continues with the Secondary Insured becoming the new insured, and any attached riders are terminated.",
    category: 'product-facts'
  },

  {
    question: "What premium charge applies to top-up premiums in PWV, and what is the minimum top-up amount?",
    options: [
      "0% charge with a minimum of S$500",
      "3% charge with a minimum of S$1,000",
      "5% charge with a minimum of S$2,000",
      "1% charge with a minimum of S$5,000"
    ],
    correct: 1,
    explanation: "Top-up premiums incur a 3% premium charge (so 97% is invested), with a minimum top-up amount of S$1,000. Regular premiums by contrast have a 0% charge with 100% allocation.",
    category: 'product-facts'
  },

  {
    question: "What is the Performance Bonus in PWV per the canonical Product Summary?",
    options: [
      "A one-time 7% bonus at the beginning of Year 8",
      "0.30% p.a. of Regular Premium Policy Value, payable yearly from the beginning of policy year 9 onwards",
      "1% p.a. of total fund value from Year 5 onwards",
      "An annual bonus equal to the fund's actual performance minus a benchmark"
    ],
    correct: 1,
    explanation: "PS Section 3.5 (p.2): Performance Bonus is 0.30% p.a. of Regular Premium Policy Value, paid yearly from the beginning of the 9th policy year onwards as long as the policy is in force and not on Premium Holiday. The brochure communicates 0.4% from Year 8; PS overrides.",
    category: 'product-facts'
  },

  {
    question: "What methods of premium payment does PWV accept?",
    options: [
      "Cash and CPF OA contributions",
      "Cash and SRS contributions",
      "Cash, CPF, and SRS contributions",
      "Cash only -- no CPF or SRS"
    ],
    correct: 3,
    explanation: "PWV premiums are payable using cash only. Neither CPF nor SRS contributions are accepted. This means all premiums come from the policyholder's liquid assets.",
    category: 'product-facts'
  },

  {
    question: "Are partial withdrawals from dividend and reinvested dividend units subject to withdrawal charges in PWV?",
    options: [
      "Yes, all withdrawals follow the same charge schedule regardless of source",
      "No, dividend and reinvested dividend withdrawals are exempt from charges",
      "Only reinvested dividends are exempt; cash dividends are not",
      "They are exempt only after Year 8"
    ],
    correct: 1,
    explanation: "Dividends and reinvested dividend withdrawals are exempt from partial withdrawal charges at any time, providing extra liquidity flexibility even during the early policy years when other withdrawals would incur charges.",
    category: 'product-facts'
  },

  {
    question: "Within what timeframe can a lapsed PWV policy be reinstated?",
    options: [
      "Within 1 year from the lapse date",
      "Within 3 years from the lapse date",
      "Lapsed policies cannot be reinstated",
      "Within 5 years from the lapse date"
    ],
    correct: 3,
    explanation: "A lapsed PWV policy may be reinstated within 5 years from the lapse date, but all outstanding past regular premiums must be back-paid. This provides a reasonable window for policyholders who face temporary financial difficulties.",
    category: 'product-facts'
  },

  // ══════════════════════════════════════════
  // SALES ANGLES (10 questions)
  // ══════════════════════════════════════════

  {
    question: "When pitching PWV to a HNW client who already uses a private banker, what is the most effective positioning?",
    options: [
      "PWV will deliver higher returns than any private bank fund",
      "Position PWV as complementary -- it adds death benefit, GIO, triple bonuses, and Secondary Insured that private banks cannot replicate",
      "Tell them to fire their private banker and consolidate into PWV",
      "Private banks charge more fees than PWV across the board"
    ],
    correct: 1,
    explanation: "PWV is not a replacement for private banking but a complement. It uniquely bundles death benefit protection, guaranteed issuance (no medical), three bonus layers, and intergenerational transfer -- features no private bank fund can offer.",
    category: 'sales-angles'
  },

  {
    question: "A couple wants to use PWV for their newborn's education fund. How should you frame the timeline?",
    options: [
      "Show that they finish paying in 5 years, the fund grows, and by Year 8 (child age 8) there is full liquidity -- well before university at 18",
      "Explain that an endowment plan is always better than an ILP for education planning",
      "Suggest they wait until the child is older to start PWV",
      "Recommend the 20-year Pro Achiever instead since education is a long-term goal"
    ],
    correct: 0,
    explanation: "The PWV timeline aligns perfectly with education planning: 5 years of premiums, full liquidity from Year 8 when the child is 8, and over 10 more years of growth before university at 18. The short premium commitment is a key advantage over longer-term plans.",
    category: 'sales-angles'
  },

  {
    question: "What is the strongest angle for presenting PWV's 100% premium allocation to a prospect comparing ILPs?",
    options: [
      "Compare it to savings account interest rates",
      "Tell them 100% allocation is standard across all ILPs",
      "Focus on the supplementary charge instead since allocation rate is less important",
      "Emphasize that every dollar of regular premium goes to work from Day 1 with zero premium charge deducted upfront"
    ],
    correct: 3,
    explanation: "100% allocation from Day 1 means zero premium charge on regular premiums. Many competitor ILPs deduct upfront charges before investing, so PWV's full allocation is a genuine differentiator.",
    category: 'sales-angles'
  },

  {
    question: "How should you present the triple bonus structure to a numbers-oriented client?",
    options: [
      "Avoid specific timelines and focus on emotional benefits",
      "Only mention the Welcome Bonus since it comes first",
      "Compare all three bonuses to fixed deposit interest rates",
      "Show a timeline: Welcome Bonus in Years 1-3, Investment Bonus at Year 8, Performance Bonus annually from Year 8 onwards"
    ],
    correct: 3,
    explanation: "Numbers-oriented clients respond best to a clear, visual timeline showing when each bonus activates and how they compound. The three distinct layers (upfront, one-time at Year 8, and recurring from Year 8) demonstrate how the policy rewards long-term commitment.",
    category: 'sales-angles'
  },

  {
    question: "A pre-retiree holds nearly S$1 million in fixed deposits earning 1.5%. How should you position PWV?",
    options: [
      "Show the yield gap (1.5% FD vs 6% PWV dividend target) and propose reallocating a portion while keeping FDs for liquidity",
      "Tell them fixed deposits are a terrible investment",
      "Recommend they move the entire amount into PWV immediately",
      "Suggest they wait for fixed deposit rates to drop further"
    ],
    correct: 0,
    explanation: "Never push all-in. Show the opportunity cost: a portion earning 6% via PWV dividends produces significantly more income than the same amount at 1.5% FD. Keeping some in FDs for liquidity makes the recommendation balanced and trustworthy. PS Section 5.5 (p.5): full liquidity (0% surrender charge) is reached from policy year 11.",
    category: 'sales-angles'
  },

  {
    question: "How should you address a client who says PWV's premium feels too high per the canonical Product Summary?",
    options: [
      "Offer to waive the minimum premium requirement",
      "Suggest they wait until their income doubles before starting",
      "Cite PS Section 6.1 (p.6) — minimum is S$7,800/year (S$650/month) — and reframe a flagship S$12,000/year structure as S$1,000/month to compare to their discretionary spending and to longer-term commitments",
      "Recommend Pro Achiever instead since PWV is only for wealthy clients"
    ],
    correct: 2,
    explanation: "PS Section 6.1 (p.6): minimum regular premium is S$7,800 annual / S$650 monthly. Reframing a flagship S$12,000/year structure as S$1,000/month (qualifying for the 35% Welcome Bonus band per PS Section 3.3) makes the amount manageable and lands the long-vs-short-commitment comparison.",
    category: 'sales-angles'
  },

  {
    question: "What is the best way to position PWV's GIO (Guaranteed Issuance Offer) feature?",
    options: [
      "GIO means the policy cannot be cancelled for any reason",
      "GIO guarantees the lowest premium regardless of health",
      "GIO guarantees full critical illness coverage even with pre-existing conditions",
      "GIO means no medical underwriting is required -- clients qualify automatically regardless of health conditions"
    ],
    correct: 3,
    explanation: "GIO means no medical checks, no health-based exclusions, and no premium loadings. Clients with pre-existing conditions can access PWV without the barriers that conventional insurance underwriting would impose.",
    category: 'sales-angles'
  },

  {
    question: "A self-employed client worries about committing to fixed premiums. What PWV feature should you emphasize?",
    options: [
      "The defined 5-year premium period -- they can plan for a specific, finite commitment rather than an open-ended obligation",
      "Premium Pass allowing charge-free pauses after 5 years",
      "The ability to vary premium amounts each year based on cash flow",
      "Automatic premium reduction when business income drops"
    ],
    correct: 0,
    explanation: "While PWV does not allow premium variation, the defined 5-year term is actually an advantage for self-employed clients. They can budget and plan for a specific duration rather than committing to premiums that stretch 10-20 years.",
    category: 'sales-angles'
  },

  {
    question: "How should you present PWV's supplementary charge versus Pro Achiever per the canonical Product Summary?",
    options: [
      "Tell them the charges are identical between both products",
      "Highlight that PWV has a lower rate (3.60% vs 3.9%) for the same 10-year duration on Regular Premium Policy Value",
      "Explain that Pro Achiever has higher charges because it offers better fund performance",
      "Suggest clients should ignore charges entirely and focus only on returns"
    ],
    correct: 1,
    explanation: "PS Section 5.2 (p.4): PWV's Supplementary Charge is 3.60% p.a. for the first 10 policy years. Pro Achiever runs 3.9% p.a. for 10 years. Same duration, lower rate on PWV.",
    category: 'sales-angles'
  },

  {
    question: "What is 'dividend stacking' and how should you present it to a pre-retiree?",
    options: [
      "Reinvesting all dividends into a single fund for maximum growth",
      "Buying multiple PWV policies with staggered start dates to create multiple independent income streams",
      "Combining PWV dividends with stock market dividends in one portfolio",
      "Automatically increasing the premium each year to stack more bonus credits"
    ],
    correct: 1,
    explanation: "Dividend stacking means purchasing multiple PWV policies at different times. Each generates its own quarterly dividends, creating diversified income streams that smooth out market fluctuations and provide more predictable retirement income.",
    category: 'sales-angles'
  },

  // ══════════════════════════════════════════
  // OBJECTION HANDLING (8 questions)
  // ══════════════════════════════════════════

  {
    question: "A prospect says: 'I can get higher yields in T-bills right now with zero risk.' What is the best counter?",
    options: [
      "Guarantee that PWV will outperform T-bill yields in every period",
      "Agree that T-bills are the better choice for all investors",
      "Tell them T-bill yields are about to drop significantly",
      "Explain that T-bills are short-term instruments requiring constant rollover, with no death benefit, bonus structure, or long-term wealth accumulation features"
    ],
    correct: 3,
    explanation: "T-bills must be continually rolled over at uncertain future rates. PWV provides long-term compounding with three bonus layers, death benefit protection, and automatic growth -- features that short-term instruments cannot replicate over a 20-30 year horizon.",
    category: 'objection-handling'
  },

  {
    question: "A client objects: 'The early-year surrender charges feel punishing.' How should you handle this per the canonical Product Summary?",
    options: [
      "Deny that surrender charges exist",
      "Agree and suggest a savings account instead",
      "Tell them surrender charges are identical across all insurance products",
      "Be transparent about the canonical taper (Y1 70%, Y5 50%, Y10 5%, Y11+ 0%) and frame Year 11 as the full-liquidity milestone, while noting dividend withdrawals are always charge-free"
    ],
    correct: 3,
    explanation: "PS Section 5.5 (p.5): the surrender taper runs Y1 70% / Y2 65% / Y3 60% / Y4 55% / Y5 50% / Y6 40% / Y7 30% / Y8 20% / Y9 10% / Y10 5% / Y11+ 0%. Dividends and reinvested-dividend unit withdrawals are always exempt from partial-withdrawal charges per PS Section 8.4.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'I already invest through a robo-advisor. Why would I need PWV?' What is your best response?",
    options: [
      "Tell them robo-advisors are unreliable and will lose their money",
      "Agree that robo-advisors are always the better approach for wealth building",
      "Acknowledge the strategy, then show what it misses: GIO, triple bonuses, death benefit protection, Secondary Insured for legacy, and forced savings discipline",
      "Say robo-advisors will be discontinued in Singapore soon"
    ],
    correct: 2,
    explanation: "Respect their existing strategy, then demonstrate PWV's unique value-adds that no robo-advisor can provide: guaranteed issuance, three bonus layers, death benefit floor, intergenerational transfer, and the discipline of structured commitment.",
    category: 'objection-handling'
  },

  {
    question: "A client asks: 'Why doesn't PWV cover critical illness like other plans?' How do you respond?",
    options: [
      "Promise that AIA will add CI coverage in the next version",
      "Explain that PWV is purpose-built for wealth accumulation, and CI/disability should be covered by separate dedicated protection policies",
      "Say critical illness coverage is unnecessary for high-net-worth individuals",
      "Suggest they buy a different product instead of PWV"
    ],
    correct: 1,
    explanation: "Turn the objection into a feature: PWV excels at what it is designed for -- wealth building with bonuses and death benefit. Critical illness and disability coverage are best handled by dedicated protection products that complement PWV.",
    category: 'objection-handling'
  },

  {
    question: "A prospect objects: 'Insurance companies earn too much commission from products like this.' How do you counter per the canonical Product Summary?",
    options: [
      "PWV has 100% allocation on regular premiums per PS Section 4.1 — full contribution goes into invested units from Day 1, and the Supplementary Charge applies separately for the first 10 policy years",
      "Deny that any commission is earned on PWV policies",
      "Change the subject to the product benefits without addressing the concern",
      "Agree that commissions are high and offer to reduce yours"
    ],
    correct: 0,
    explanation: "PS Section 4.1 (p.3): 100% of regular premium is used to purchase units at bid price. PS Section 5.2 (p.4): the 3.60% p.a. Supplementary Charge applies separately for the first 10 policy years, deducted monthly from policy value.",
    category: 'objection-handling'
  },

  {
    question: "A client says: 'I'll wait for Version 3.0 -- maybe the bonuses will be better.' What is your best response?",
    options: [
      "Confirm that Version 3.0 is coming soon with improved features",
      "Tell them this is the final version with no future updates",
      "Every year of delay means missing welcome bonus credits, pushing back the Investment Bonus timeline, and losing compound growth time",
      "Offer a free upgrade to the next version as a special arrangement"
    ],
    correct: 2,
    explanation: "Each year of delay has a real cost: missed bonus credits from Day 1, the Investment Bonus (Year 8 from inception) starts later, and compound growth time is permanently lost. There is no guarantee a future version will be better.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'I'm worried about locking up multi-year premiums in one product.' How do you reassure them per the canonical Product Summary?",
    options: [
      "Tell them the amount is small and should not worry them",
      "Reframe to a monthly figure (PS Section 6.1 minimum is S$650/month) over the 5-year flagship structure, walk through the canonical surrender taper (PS Section 5.5: Y1 70% to Y11+ 0%), and note dividend withdrawals are always charge-free",
      "Suggest they invest only half the amount in PWV",
      "Agree it is a significant lock-up and recommend they reconsider"
    ],
    correct: 1,
    explanation: "Reframing to monthly (PS Section 6.1: S$650/month minimum) plus walking through the canonical surrender taper (PS Section 5.5: 70% in Y1 down to 0% from Y11) addresses the lock-up directly. Dividend and reinvested-dividend unit withdrawals are exempt from partial-withdrawal charges (PS Section 8.4).",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'Why should I pay a 3.60% supplementary charge when ETFs charge 0.1%?' How do you handle this per the canonical Product Summary?",
    options: [
      "Tell them the 3.6% charge is waived if they choose Elite Funds",
      "Admit that ETFs are always better value with no counter-argument",
      "The 3.60% supplementary charge runs for the first 10 policy years (PS Section 5.2), and PWV bundles death benefit, three bonus layers, GIO, and Secondary Insured — none of which ETFs provide",
      "Say ETFs are too volatile for any serious wealth accumulation"
    ],
    correct: 2,
    explanation: "PS Section 5.2 (p.4): the 3.60% p.a. Supplementary Charge applies for the first 10 policy years. PWV bundles benefits ETFs cannot replicate: death benefit (PS Section 3.1), three bonus layers (PS Sections 3.3-3.5), GIO, and Secondary Insured (PS Section 3.7).",
    category: 'objection-handling'
  },

  // ══════════════════════════════════════════
  // ROLEPLAY (6 questions)
  // ══════════════════════════════════════════

  {
    question: "In a roleplay, a HNW client asks: 'My wife is 68. Can I appoint her as Secondary Insured, and what happens to my riders if I die?' What is the correct response per the canonical Product Summary?",
    options: [
      "'Your wife is too old to be appointed as Secondary Insured.'",
      "'Yes, she qualifies since the Secondary Insured cannot exceed age 75 at appointment per PS Section 3.7. However, any attached riders will be terminated when she becomes the new insured, and benefit charges will recalculate based on her age and gender.'",
      "'Yes, and all riders will transfer to her automatically with no changes.'",
      "'She can only be appointed after the premium payment term ends.'"
    ],
    correct: 1,
    explanation: "PS Section 3.7 (p.2): the Secondary Insured cannot exceed age 75 at appointment. At 68, the wife qualifies. On transfer, attached riders are terminated and benefit charges recalculate based on the new insured's gender and attained age.",
    category: 'roleplay'
  },

  {
    question: "During a roleplay, a prospect asks: 'I want to invest S$12,000/year (top Welcome Bonus band) but want income from dividends. How does that work?' What do you explain?",
    options: [
      "'All dividends must be reinvested for the first 10 years.'",
      "'Dividends are paid annually by cheque.'",
      "'The AIA Global Adventurous Income Fund pays quarterly dividends at approximately 7-8% p.a. Per PS Section 8.4, cash dividends of S$50 or more are paid via PayNow (NRIC/FIN); below S$50 they are auto-reinvested.'",
      "'Dividend income is only available after the 5-year premium term ends.'"
    ],
    correct: 2,
    explanation: "PS Section 3.3 (p.2): annualised regular premium of S$12,000 and above earns the top Welcome Bonus band (35% cumulative). PS Section 8.4 (p.10): dividends of S$50 or above are paid via PayNow (NRIC/FIN); smaller amounts are automatically reinvested as additional units.",
    category: 'roleplay'
  },

  {
    question: "A roleplay client asks: 'Can I increase my regular premium after Year 1 to qualify for the higher Welcome Bonus tier?' What is the correct answer per the canonical Product Summary?",
    options: [
      "'Yes, you can increase your premium at any policy anniversary.'",
      "'Yes, but it requires fresh medical underwriting.'",
      "'Regular premium amounts cannot be varied after inception (PS Section 6.1). To access a higher Welcome Bonus tier, you would need to purchase a separate new policy at the higher premium band.'",
      "'You can increase premiums through the top-up mechanism to get the higher bonus.'"
    ],
    correct: 2,
    explanation: "PS Section 6.1 (p.6) states 'Varying of regular premium is not allowed.' To access a higher Welcome Bonus band (PS Section 3.3 sets the bands at S$7,800-$8,999 / $9,000-$11,999 / $12,000+), the client would need a new policy. Top-ups are subject to a 3% premium charge and do not count toward the Welcome Bonus.",
    category: 'roleplay'
  },

  {
    question: "In a roleplay, a retiree asks: 'I need access to some funds before full liquidity at Year 11. What are my options?' What should you explain per the canonical Product Summary?",
    options: [
      "'You have no access to any funds until Year 11.'",
      "'You can surrender the full policy at any time with no charges.'",
      "'Partial withdrawals are allowed from policy year 1 with a declining Charge Factor (Y1: 2.333; Y5: 1.000; Y10: 0.053; Y11+: 0). Dividend and reinvested-dividend unit withdrawals are always charge-free. A minimum policy value of S$10,000 must remain after any withdrawal, with a S$1,000 minimum withdrawal amount.'",
      "'Only top-up withdrawals are available before Year 11.'"
    ],
    correct: 2,
    explanation: "PS Sections 5.6 (p.4) and 6.4 (pp.6-7): partial withdrawals are allowed from policy year 1, with the Partial Withdrawal Charge Factor declining each year and reaching 0 from Year 11. Minimum withdrawal is S$1,000 with S$10,000 minimum policy value remaining. Dividend distributions and reinvested-dividend unit withdrawals are exempt per PS Section 8.4.",
    category: 'roleplay'
  },

  {
    question: "During a roleplay, a prospect asks: 'If I die in an accident during Year 1, what exactly does my family receive?' What is the accurate answer?",
    options: [
      "'Only the current fund value at the time of death.'",
      "'The standard death benefit only -- accidental death adds nothing extra in PWV.'",
      "'AIA refunds only the premiums paid so far with no additions.'",
      "'The death benefit (higher of premiums paid or fund value) PLUS an additional 100% of total regular premiums paid as an accidental death benefit.'"
    ],
    correct: 3,
    explanation: "In Years 1-2, accidental death (within 90 days of the accident) triggers both the regular death benefit AND an additional 100% of total regular premiums paid. This effectively doubles the payout for accidental death in the early years.",
    category: 'roleplay'
  },

  {
    question: "A roleplay client in their late 50s asks: 'My old endowment policies return about 1.5% per year. Should I surrender them to fund PWV?' How should you advise?",
    options: [
      "'Never surrender existing policies -- always keep what you have.'",
      "'Surrender everything immediately and put it all into PWV.'",
      "'Audit each policy individually. For low-yielding policies (1-2%), show how surrendering and redirecting into PWV with a 6% dividend target creates significantly more retirement income -- but keep policies with acceptable returns.'",
      "'Old policies are always better because they have guaranteed returns.'"
    ],
    correct: 2,
    explanation: "The field-tested approach is a proper audit: review each policy's actual yield, identify underperformers, and show the income difference. This is objective, respectful of their past decisions, and lets the numbers drive the recommendation rather than a hard sell.",
    category: 'roleplay'
  }

];
