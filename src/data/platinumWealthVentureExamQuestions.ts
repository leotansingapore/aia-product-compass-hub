import type { ExamQuestion } from './proAchieverExamQuestions';

export const platinumWealthVentureExamQuestions: ExamQuestion[] = [

  // ══════════════════════════════════════════
  // PRODUCT FACTS (12 questions)
  // ══════════════════════════════════════════

  {
    question: "What is the supplementary charge rate and duration for AIA Platinum Wealth Venture?",
    options: [
      "3.9% p.a. for the first 10 years",
      "3.6% p.a. for the first 5 years only",
      "4.0% p.a. for the first 8 years",
      "3.6% p.a. for the first 7 years only"
    ],
    correct: 3,
    explanation: "PWV's supplementary charge is 3.6% p.a. deducted monthly for the first 7 policy years, after which it drops to zero permanently. This is both a lower rate and shorter duration than Pro Achiever's 3.9% for 10 years.",
    category: 'product-facts'
  },

  {
    question: "What is the surrender charge schedule for PWV in Years 3 through 7?",
    options: [
      "80%, 70%, 60%, 50%, 45%",
      "90%, 80%, 70%, 60%, 50%",
      "70%, 60%, 50%, 40%, 30%",
      "80%, 60%, 40%, 20%, 10%"
    ],
    correct: 0,
    explanation: "The surrender charge on Regular Premium Policy Value decreases as follows: Y1-2: 100%, Y3: 80%, Y4: 70%, Y5: 60%, Y6: 50%, Y7: 45%, and from Y8 onwards it reaches 0%.",
    category: 'product-facts'
  },

  {
    question: "How does the Investment Bonus work in PWV?",
    options: [
      "7% of annualized premium paid once at the beginning of Year 8",
      "10% of annualized premium paid once at Year 10",
      "5% of annualized premium paid annually from Year 5 onwards",
      "7% of annualized premium spread equally across Years 6 to 8"
    ],
    correct: 0,
    explanation: "The Investment Bonus is a one-time credit of 7% of annualized regular premium, automatically credited at the beginning of the 8th policy year. All regular premiums must have been paid to qualify.",
    category: 'product-facts'
  },

  {
    question: "What is the welcome bonus structure for a PWV policy with S$24,000 annual premium under Version 2.0?",
    options: [
      "5% in Years 1, 2, and 3 totaling 15%",
      "5% in Year 1 and 5% in Year 2, totaling 10%",
      "10% in Year 1 only",
      "3% per year for 5 years totaling 15%"
    ],
    correct: 1,
    explanation: "For premiums in the S$18,000 to S$35,999 range under Version 2.0, the welcome bonus is 5% in Year 1 plus 5% in Year 2, totaling 10% of annualized premium. Premiums of S$36,000 and above qualify for the higher 15% tier.",
    category: 'product-facts'
  },

  {
    question: "What is the Premium Holiday charge if a PWV policyholder misses premiums after paying only the first 2 annual premiums?",
    options: [
      "100% annual rate divided by 12 per month",
      "30% annual rate divided by 12 per month",
      "50% annual rate divided by 12 per month",
      "0% -- no charge after paying 2 premiums"
    ],
    correct: 1,
    explanation: "The Premium Holiday charge schedule is: after 1st premium = 100% annual rate, after 2nd premium = 30%, after 3rd or 4th premium = 20%, and after 5th premium = 0%. So missing after 2 premiums triggers a 30% rate.",
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
    question: "What is the Performance Bonus in PWV?",
    options: [
      "A one-time 7% bonus at the beginning of Year 8",
      "0.50% p.a. of Regular Premium Policy Value from Year 8 onwards",
      "1% p.a. of total fund value from Year 5 onwards",
      "An annual bonus equal to the fund's actual performance minus a benchmark"
    ],
    correct: 1,
    explanation: "The Performance Bonus is 0.50% p.a. of Regular Premium Policy Value, credited every year from the beginning of Year 8 onwards. It is separate from the one-time Investment Bonus (7%) also paid at Year 8.",
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
    explanation: "Never push all-in. Show the opportunity cost: a portion earning 6% via PWV dividends produces significantly more income than the same amount at 1.5% FD. Keeping some in FDs for liquidity makes the recommendation balanced and trustworthy.",
    category: 'sales-angles'
  },

  {
    question: "How should you address a client who says PWV's minimum premium of S$18,000/year feels too high?",
    options: [
      "Offer to waive the minimum premium requirement",
      "Suggest they wait until their income doubles before starting",
      "Reframe it as S$1,500/month and compare to their discretionary spending -- then note the total 5-year outlay (S$90,000) is actually less than a 20-year Pro Achiever at S$500/month (S$120,000)",
      "Recommend Pro Achiever instead since PWV is only for wealthy clients"
    ],
    correct: 2,
    explanation: "Reframing to monthly (S$1,500) and comparing total outlay (S$90K over 5 years vs S$120K over 20 years for Pro Achiever) makes the amount manageable and shows PWV actually requires less total capital with a shorter commitment.",
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
    question: "How should you present PWV's charge advantage versus Pro Achiever?",
    options: [
      "Tell them the charges are identical between both products",
      "Highlight that PWV has a lower rate (3.6% vs 3.9%) that ends sooner (7 years vs 10 years)",
      "Explain that Pro Achiever has higher charges because it offers better fund performance",
      "Suggest clients should ignore charges entirely and focus only on returns"
    ],
    correct: 1,
    explanation: "PWV has a clear double advantage on charges: a lower supplementary charge rate (3.6% vs Pro Achiever's 3.9%) that also ends earlier (after Year 7 vs Year 10). This means more of the client's money is working in the investment for more years.",
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
    question: "A client objects: 'The 100% surrender charge in Years 1-2 is terrifying.' How should you handle this?",
    options: [
      "Deny that surrender charges are that high",
      "Agree and suggest a savings account instead",
      "Tell them surrender charges are identical across all insurance products",
      "Be transparent about the charges, explain they enforce long-term discipline, and frame the timeline: zero charges from Year 8 with full liquidity"
    ],
    correct: 3,
    explanation: "Honesty about the charges builds trust. Reframe them as a feature that prevents impulsive early withdrawal. The clear reward is zero charges from Year 8 onwards, and dividend withdrawals are always charge-free even before Year 8.",
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
    question: "A prospect objects: 'Insurance companies earn too much commission from products like this.' How do you counter?",
    options: [
      "PWV has 100% premium allocation on regular premiums -- their full contribution goes to investment from Day 1, and the supplementary charge is separate and ends after 7 years",
      "Deny that any commission is earned on PWV policies",
      "Change the subject to the product benefits without addressing the concern",
      "Agree that commissions are high and offer to reduce yours"
    ],
    correct: 0,
    explanation: "Transparency is the best approach. 100% of regular premiums are allocated to investment immediately, which directly counters the perception that their money is going to commissions. The supplementary charge is disclosed and has a clear end date.",
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
    question: "A prospect says: 'I'm worried about locking S$90,000 into one product for years.' How do you reassure them?",
    options: [
      "Tell them S$90,000 is a small amount that should not worry them",
      "Reframe: it is S$1,500/month for just 5 years, and from Year 8 they have full liquidity with zero charges. Dividend withdrawals are always charge-free even earlier.",
      "Suggest they invest only half the amount in PWV",
      "Agree it is a significant lock-up and recommend they reconsider"
    ],
    correct: 1,
    explanation: "Reframing the total as a monthly figure (S$1,500) for a finite 5-year period makes it manageable. The clear liquidity timeline (zero charges from Year 8, dividend withdrawals always free) addresses the lock-up concern directly.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'Why should I pay 3.6% supplementary charge when ETFs charge 0.1%?' How do you handle this?",
    options: [
      "Tell them the 3.6% charge is waived if they choose Elite Funds",
      "Admit that ETFs are always better value with no counter-argument",
      "The 3.6% stops after 7 years, and PWV bundles death benefit, triple bonuses, GIO, and Secondary Insured -- none of which ETFs provide",
      "Say ETFs are too volatile for any serious wealth accumulation"
    ],
    correct: 2,
    explanation: "The charge comparison is apples to oranges. PWV's 3.6% covers only 7 years and includes death benefit, three bonus layers (which add to returns), guaranteed issuance, exclusive fund access, and intergenerational transfer -- all impossible with ETFs.",
    category: 'objection-handling'
  },

  // ══════════════════════════════════════════
  // ROLEPLAY (6 questions)
  // ══════════════════════════════════════════

  {
    question: "In a roleplay, a HNW client asks: 'My wife is 68. Can I appoint her as Secondary Insured, and what happens to my riders if I die?' What is the correct response?",
    options: [
      "'Your wife is too old to be appointed as Secondary Insured.'",
      "'Yes, she qualifies since the Secondary Insured cannot exceed age 70 at appointment. However, any attached riders will be terminated when she becomes the new insured, and benefit charges will recalculate based on her age and gender.'",
      "'Yes, and all riders will transfer to her automatically with no changes.'",
      "'She can only be appointed after the premium payment term ends.'"
    ],
    correct: 1,
    explanation: "At age 68, the wife qualifies since the limit is age 70 at appointment. However, clients must understand that riders are terminated upon transfer and benefit charges recalculate based on the new insured's profile.",
    category: 'roleplay'
  },

  {
    question: "During a roleplay, a prospect asks: 'I want to invest S$18,000/year but want income from dividends. How does that work?' What do you explain?",
    options: [
      "'All dividends must be reinvested for the first 10 years.'",
      "'Dividends are paid annually by cheque.'",
      "'The AIA Global Adventurous Income Fund pays quarterly dividends at approximately 7-8% p.a. Dividends of S$50 or more are paid via PayNow; below S$50 they are auto-reinvested.'",
      "'Dividend income is only available after the 5-year premium term ends.'"
    ],
    correct: 2,
    explanation: "The AIA Global Adventurous Income Fund is designed for income seekers, paying quarterly dividends. Cash payouts via PayNow require a minimum of S$50 per distribution; smaller amounts are automatically reinvested as additional units.",
    category: 'roleplay'
  },

  {
    question: "A roleplay client asks: 'Can I increase my premium from S$18,000 to S$36,000 after Year 1 to get the higher welcome bonus tier?' What is the correct answer?",
    options: [
      "'Yes, you can increase your premium at any policy anniversary.'",
      "'Yes, but it requires fresh medical underwriting.'",
      "'Regular premium amounts cannot be varied after inception. You would need to start a separate new policy at the higher premium tier.'",
      "'You can increase premiums through the top-up mechanism to get the higher bonus.'"
    ],
    correct: 2,
    explanation: "Regular premiums in PWV are fixed at inception for all 5 years and cannot be varied. To access a higher welcome bonus tier, the client would need to purchase a new policy. Top-ups are separate and do not count toward the welcome bonus calculation.",
    category: 'roleplay'
  },

  {
    question: "In a roleplay, a retiree asks: 'I need access to some funds before Year 8. What are my options?' What should you explain?",
    options: [
      "'You have no access to any funds until Year 8.'",
      "'You can surrender the full policy at any time with no charges.'",
      "'Partial withdrawals are available from Year 3 with reducing charges, but dividend withdrawals are always charge-free. A minimum policy value of S$10,000 must remain after any withdrawal.'",
      "'Only top-up withdrawals are available before Year 8.'"
    ],
    correct: 2,
    explanation: "There are two paths to pre-Year 8 liquidity: partial withdrawals from Year 3 onwards (with reducing charges), and dividend/reinvested dividend withdrawals which are always exempt from charges. The minimum remaining policy value of S$10,000 must be maintained.",
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
