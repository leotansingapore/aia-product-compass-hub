import type { ExamQuestion } from './proAchieverExamQuestions';

export const proLifetimeProtectorExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "What type of insurance product is AIA Pro Lifetime Protector?",
    options: [
      "A whole life participating plan with guaranteed cash values",
      "A comprehensive Investment-Linked Policy (ILP) for protection and investment",
      "A term life plan with renewable options up to age 85",
      "A universal life plan with a fixed crediting rate"
    ],
    correct: 1,
    explanation: "PLP is a comprehensive ILP designed as a one-stop protection and investment solution, combining insurance coverage with investment in professionally managed portfolios up to age 99.",
    category: 'product-facts'
  },
  {
    question: "What is the premium allocation rate progression for PLP from Year 1 to Year 5?",
    options: [
      "100%, 95%, 90%, 85%, 80%",
      "80%, 55%, 50%, 8%, 0%",
      "90%, 80%, 70%, 60%, 50%",
      "75%, 60%, 45%, 30%, 15%"
    ],
    correct: 1,
    explanation: "PLP's premium allocation decreases from Year 1 (80%) through Year 4 (8%) to Year 5 (0%). After Year 6, the allocation jumps to 100%, rewarding long-term policyholders.",
    category: 'product-facts'
  },
  {
    question: "How is the death benefit calculated for PLP Max vs PLP Plus?",
    options: [
      "Max: Insured Amount + Policy Value; Plus: Higher of Insured Amount or Policy Value",
      "Both calculate the same way: Insured Amount + Policy Value",
      "Max: Higher of Insured Amount or Policy Value; Plus: Insured Amount + Policy Value",
      "Max: Policy Value only; Plus: Insured Amount only"
    ],
    correct: 2,
    explanation: "PLP Max pays the higher of Insured Amount OR Policy Value (SAR decreases to zero, charges disappear). PLP Plus pays Insured Amount PLUS Policy Value (SAR constant, charges keep escalating). This structural difference leads to Max projecting approximately $5.1M vs Plus approximately $2.9M at $200/month.",
    category: 'product-facts'
  },
  {
    question: "What are the key parameters of the LCC (Life Changing Conditions) Rider?",
    options: [
      "100 conditions, $250,000 limit, 2 claims, 10 special conditions",
      "150 conditions, $350,000 limit, 3 claims, 15 special conditions at 20% payout each",
      "200 conditions, $500,000 limit, 5 claims, 20 special conditions",
      "150 conditions, $500,000 limit, 3 claims, 10 special conditions at 25% payout each"
    ],
    correct: 1,
    explanation: "The LCC Rider covers 150 conditions with a $350,000 limit and up to 3 claims. It also covers 15 special conditions at 20% payout each, claimable up to 10 times, with a maximum of $25,000 per special condition claim.",
    category: 'product-facts'
  },
  {
    question: "What are the conditions for exercising the Milestone Event Increase?",
    options: [
      "Maximum 3 increases, 75% or $150,000 cap, before 65th birthday",
      "Maximum 2 increases, 50% or $100,000 cap (whichever lower), before 60th birthday",
      "Maximum 1 increase, 100% or $200,000 cap, before 55th birthday",
      "Unlimited increases up to $50,000 each, before 70th birthday"
    ],
    correct: 1,
    explanation: "PLP allows a maximum of 2 Milestone Event Increases, each capped at 50% of existing coverage or $100,000 (whichever is lower), and must be exercised before the policyholder's 60th birthday.",
    category: 'product-facts'
  },
  {
    question: "What are the surrender charges for PLP in the first two years?",
    options: [
      "Year 1: 50%, Year 2: 25%",
      "Year 1: 100%, Year 2: 75%",
      "Year 1: 75%, Year 2: 50%",
      "Year 1: 60%, Year 2: 30%"
    ],
    correct: 2,
    explanation: "PLP's surrender charges are 75% in Year 1 and 50% in Year 2. These high early charges encourage long-term commitment, which is essential for the investment component to compound effectively.",
    category: 'product-facts'
  },
  {
    question: "When can withdrawals be made from PLP, and when is the Dial Down feature available?",
    options: [
      "Withdrawals after age 55 or 15 years; Dial Down at 15 years or age 55",
      "Withdrawals after age 62 or 20 years; Dial Down at 20 years or 62nd birthday",
      "Withdrawals after age 60 or 25 years; Dial Down at 25 years or age 65",
      "Withdrawals anytime after Year 5; Dial Down at 10 years or age 50"
    ],
    correct: 1,
    explanation: "Withdrawals are available after age 62 OR 20 years from policy start. The Dial Down feature is available at 20 years from policy date OR the 62nd birthday, whichever comes first.",
    category: 'product-facts'
  },
  {
    question: "How does the Vitality Power-Up Dollar work across different tiers?",
    options: [
      "All tiers provide a flat 10% extra sum assured with no changes",
      "Bronze: +5%, Silver: +10%, Gold: +15%, Platinum: +20%",
      "Extra 10% sum assured; Bronze decreases 10%, Gold maintains, Platinum increases 5%/year",
      "No extra sum assured; Vitality only provides premium discounts"
    ],
    correct: 2,
    explanation: "The Vitality Power-Up Dollar provides an extra 10% of sum assured. At Bronze tier it decreases by 10%, Gold tier maintains it, and Platinum tier increases it by 5% per year.",
    category: 'product-facts'
  },
  {
    question: "What is the death discount structure for PLP?",
    options: [
      "5% for all coverage amounts",
      "10% for coverage >= $500,000, 5% for < $500,000",
      "8% for coverage >= $250,000, 5% for coverage < $250,000",
      "No death discount is offered"
    ],
    correct: 2,
    explanation: "PLP offers an 8% death discount for coverage of $250,000 or more, and a 5% discount for coverage below $250,000.",
    category: 'product-facts'
  },
  {
    question: "What is the No Lapse Privilege and how long does it last?",
    options: [
      "5 years of continued coverage if premium payments stop",
      "10 years of continued protection if the policy value drops to zero",
      "Lifetime coverage guarantee regardless of policy value",
      "3 years of coverage with automatic premium loans"
    ],
    correct: 1,
    explanation: "The No Lapse Privilege provides 10 years of continued protection even if the policy value hits zero, giving policyholders a significant safety net during market downturns.",
    category: 'product-facts'
  },
  {
    question: "What are the three investment portfolios available in PLP, and who manages them?",
    options: [
      "Conservative, Moderate, and Aggressive, managed by BlackRock",
      "Cautious, Balanced, and Adventurous, guided by Mercer",
      "Low Risk, Medium Risk, and High Risk, managed by Vanguard",
      "Growth, Income, and Hybrid, guided by Fidelity"
    ],
    correct: 1,
    explanation: "PLP offers three portfolios -- Cautious, Balanced, and Adventurous -- guided by Mercer, which advises on over $16 trillion of assets and manages over $267 billion.",
    category: 'product-facts'
  },
  {
    question: "What is the angioplasty payout under PLP, and what survival period is required for CI claims?",
    options: [
      "25% payout, 14-day survival period",
      "50% payout, no survival period",
      "10% payout, 7-day survival period",
      "20% payout, 30-day survival period"
    ],
    correct: 2,
    explanation: "Angioplasty pays only 10% of the insured amount, classified as a less severe procedure. All critical illness claims require a 7-day survival period after diagnosis.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (10 questions)
  // ============================================================

  {
    question: "What is PLP's budget-to-coverage mapping for monthly premiums?",
    options: [
      "$100 = $50k, $200 = $100k, $300 = $150k",
      "$200 = $100k, $300 = $150k, $400 = $200k",
      "$200 = $200k, $300 = $300k, $400 = $400k",
      "$150 = $100k, $250 = $150k, $350 = $200k"
    ],
    correct: 1,
    explanation: "PLP's standard budget-to-coverage mapping is $200/month for $100,000, $300/month for $150,000, and $400/month for $200,000 of coverage.",
    category: 'sales-angles'
  },
  {
    question: "How does PLP Max compare to PLP Plus at $200/month in projected returns?",
    options: [
      "Max approximately $2.9M vs Plus approximately $5.1M",
      "Both approximately $4M",
      "Max approximately $5.1M vs Plus approximately $2.9M",
      "Max approximately $3.5M vs Plus approximately $3.5M"
    ],
    correct: 2,
    explanation: "PLP Max projects approximately $5.1 million vs PLP Plus approximately $2.9 million at $200/month. The difference is because Max's SAR decreases to zero, eliminating insurance charges, while Plus's constant SAR means escalating charges that erode returns.",
    category: 'sales-angles'
  },
  {
    question: "How does PLP compare to a GPP plan at equivalent premiums?",
    options: [
      "PLP approximately $300k-$400k vs GPP approximately $3M (PLP is guaranteed)",
      "PLP approximately $3M vs GPP approximately $300k-$400k (PLP returns are non-guaranteed)",
      "Both return approximately $1M with different risk profiles",
      "GPP always outperforms PLP in the long run"
    ],
    correct: 1,
    explanation: "For the same premiums, PLP projects approximately $3 million vs GPP's approximately $300,000-$400,000. However, PLP's returns are non-guaranteed while GPP has guaranteed elements. PLP also offers flexibility that GPP lacks.",
    category: 'sales-angles'
  },
  {
    question: "At a $400/month budget, how does PLP compare to an APA+GPP combo?",
    options: [
      "PLP approximately $4.7M vs combo approximately $7M",
      "PLP approximately $7M vs combo approximately $4.7M",
      "Both approximately $6M",
      "Combo always outperforms PLP at any budget"
    ],
    correct: 1,
    explanation: "At the same $400/month budget, PLP projects approximately $7 million compared to approximately $4.7 million for the APA+GPP combo, making PLP the superior choice for total returns.",
    category: 'sales-angles'
  },
  {
    question: "How does PLP evolve across a policyholder's life stages?",
    options: [
      "Fixed coverage and investment throughout all stages",
      "Investment-focused in 20s-40s, protection-focused in 50s-60s",
      "Protection-focused in 20s-40s, retirement-focused in 50s-60s with dial-down option",
      "Automatically reduces coverage by 10% every decade"
    ],
    correct: 2,
    explanation: "PLP is designed to evolve: protection-focused during the 20s-40s when family responsibilities peak, then shifting to retirement-focused in the 50s-60s using the dial-down option to reduce coverage and maximize the investment component.",
    category: 'sales-angles'
  },
  {
    question: "What are PLP's key flexibility features that differentiate it from fixed plans like GPP?",
    options: [
      "Guaranteed returns and fixed premiums",
      "Premium adjustments ($200-$400/month), premium holiday, and dial-down option",
      "Free switching between term and whole life",
      "Automatic premium increases tied to inflation"
    ],
    correct: 1,
    explanation: "PLP's flexibility includes adjustable premiums ($200-$400/month for the same coverage), premium holiday during financial difficulties, and the dial-down option in later years. GPP has fixed pricing and cannot be paused.",
    category: 'sales-angles'
  },
  {
    question: "How should PLP be positioned as a retirement income plan?",
    options: [
      "Guaranteed annuity payments from age 55",
      "Lump sum payout at age 65 only",
      "Withdrawals of $2,000-$5,000/month from age 60 using accumulated policy value",
      "Government-subsidized pension from age 62"
    ],
    correct: 2,
    explanation: "PLP can be structured as a retirement income plan where the policyholder withdraws $2,000 to $5,000 per month from the accumulated policy value starting at age 60.",
    category: 'sales-angles'
  },
  {
    question: "What is the 'start now vs start later' sales argument for PLP?",
    options: [
      "Starting later gives you higher returns due to compound interest",
      "Starting earlier gives you lower rates, higher coverage per dollar, and more time for compounding",
      "There is no difference in cost between starting at 25 vs 35",
      "Starting later is better because you can afford higher premiums"
    ],
    correct: 1,
    explanation: "The start now vs start later comparison shows that buying young gives lower mortality charges, higher coverage per dollar, and significantly more time for the investment to compound.",
    category: 'sales-angles'
  },
  {
    question: "What common misconception about ILP insurance costs does PLP Max disprove?",
    options: [
      "That ILPs have no insurance charges",
      "That ILPs always lose money in market downturns",
      "That ILP insurance costs always increase with age",
      "That ILPs cannot provide death benefits"
    ],
    correct: 2,
    explanation: "The common misconception is that ILP insurance costs always increase with age. PLP Max disproves this because its SAR decreases to zero as the policy value grows, eliminating insurance charges entirely.",
    category: 'sales-angles'
  },
  {
    question: "What is the most popular PLP plan variant and add-on rider?",
    options: [
      "PLP Plus with Early Critical Illness Rider",
      "PLP Basic with Disability Income Rider",
      "PLP Max with DCC (Double Critical Cover)",
      "PLP Lite with Premium Waiver Rider"
    ],
    correct: 2,
    explanation: "PLP Max is the most commonly sold plan variant due to superior long-term returns, and DCC (Double Critical Cover) is the most popular add-on rider for enhanced critical illness protection.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (8 questions)
  // ============================================================

  {
    question: "A client says: 'ILPs are too risky -- I might lose all my money.' What is the best response?",
    options: [
      "You are right, consider a savings plan instead.",
      "ILPs have zero risk because AIA guarantees returns.",
      "PLP has the No Lapse Privilege that maintains coverage for 10 years even if the policy value drops to zero, plus you choose from three risk-profiled portfolios managed by Mercer.",
      "Just ignore the investment component."
    ],
    correct: 2,
    explanation: "Address risk concerns with concrete protections: No Lapse Privilege (10-year safety net), portfolio choice for risk management, and Mercer's professional oversight.",
    category: 'objection-handling'
  },
  {
    question: "A client objects: 'The insurance charges will eat into my returns as I get older.' How do you respond for PLP Max?",
    options: [
      "That is true for all ILPs including PLP Max.",
      "With PLP Max, the Sum at Risk decreases as your policy value grows, so insurance charges decrease to zero over time -- the opposite of what you fear.",
      "The charges are fixed and never change.",
      "AIA refunds excess charges at maturity."
    ],
    correct: 1,
    explanation: "PLP Max's unique SAR mechanism means insurance charges decrease to zero as the policy value grows, directly countering this common objection.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I prefer guaranteed returns like endowment plans.' What is the most effective response?",
    options: [
      "PLP also has guaranteed returns.",
      "Endowment plans are always inferior.",
      "I understand the appeal of guarantees. PLP Max at $200/month projects approximately $5.1 million vs much lower endowment returns. Risk is managed through Mercer's professional portfolios, and the No Lapse Privilege protects your coverage.",
      "You should split money equally between PLP and endowments."
    ],
    correct: 2,
    explanation: "Acknowledge the client's preference, then contrast with specific projected numbers while highlighting professional risk management and the No Lapse Privilege.",
    category: 'objection-handling'
  },
  {
    question: "A client says: '$200/month is too expensive for me.' What is the best response?",
    options: [
      "Then you cannot afford insurance.",
      "The minimum annual premium is $1,200 ($100/month). Start there and increase as your income grows using PLP's flexible premium feature.",
      "Borrow money to pay the premiums.",
      "We can lower it to $50/month."
    ],
    correct: 1,
    explanation: "PLP's minimum is $100/month ($1,200 annually) with flexible premiums, allowing clients to start small and increase over time.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I do not want to pay $50/month for a premium holiday.' How do you address this?",
    options: [
      "The $50 is non-negotiable and applies for the entire policy duration.",
      "AIA will waive the charge for loyal customers.",
      "The $50/month charge only applies in the first 2 years. After that, premium holidays are completely free -- a short-term cost for long-term flexibility.",
      "You can avoid the charge by never taking a premium holiday."
    ],
    correct: 2,
    explanation: "The $50/month premium holiday charge is only for the first 2 years. After year 2, premium holidays become free, making it a minimal short-term cost.",
    category: 'objection-handling'
  },
  {
    question: "A client objects: 'Why not just buy term and invest the rest?' What is the best counter?",
    options: [
      "Term insurance is always better.",
      "PLP gives you investment discipline with professional management by Mercer, coverage up to age 99 (vs term ending at 65-70), and the two-in-one convenience. Most people lack the discipline to invest consistently on their own.",
      "ILPs always outperform self-directed investing.",
      "There is no good answer to that."
    ],
    correct: 1,
    explanation: "Address the behavioral discipline gap, the coverage duration advantage (age 99 vs 65-70), and the convenience of professional management in a single product.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'My friend lost money on their ILP.' How should you respond?",
    options: [
      "Your friend probably made bad choices.",
      "That never happens with AIA.",
      "Early surrender or choosing Plus over Max are common reasons. PLP Max's structure ensures charges decrease over time. Committing for at least 10 years and choosing the right risk portfolio are key to positive outcomes.",
      "ILPs always make money eventually."
    ],
    correct: 2,
    explanation: "Acknowledge the concern, explain likely causes (early surrender, wrong plan type), and differentiate PLP Max's structure while emphasizing long-term commitment.",
    category: 'objection-handling'
  },
  {
    question: "A client asks: 'What happens to my coverage if the market crashes?' How do you reassure them?",
    options: [
      "Your coverage is automatically cancelled.",
      "Markets always recover quickly.",
      "AIA will top up your account to cover losses.",
      "The No Lapse Privilege maintains coverage for 10 years even if your policy value drops to zero. You can also choose the Cautious portfolio for lower market exposure, and regular monthly contributions benefit from dollar-cost averaging during downturns."
    ],
    correct: 3,
    explanation: "Combine the No Lapse Privilege (10-year safety net), portfolio choice (Cautious for risk-averse), and dollar-cost averaging to comprehensively address market crash fears.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (6 questions)
  // ============================================================

  {
    question: "A 25-year-old earning $3,500/month says: 'I just started working and cannot afford insurance.' What is the best response?",
    options: [
      "Come back when you earn more.",
      "You need at least $300/month for proper coverage.",
      "Starting now at your age gives you the lowest rates. PLP's minimum is $100/month -- less than $4 a day. The protection you build now would cost much more if you wait even 5 years.",
      "Focus on saving first and buy insurance in your 30s."
    ],
    correct: 2,
    explanation: "Make it accessible ($100/month minimum, $4/day framing) and emphasize the cost advantage of buying young.",
    category: 'roleplay'
  },
  {
    question: "A 32-year-old with a newborn asks: 'What is the most important coverage I need?' How do you position PLP?",
    options: [
      "Just buy term insurance for maximum coverage.",
      "PLP gives you comprehensive coverage -- death, TPD, disability income, and CI -- in one plan. Start at $200/month for $100,000. The investment component builds a nest egg for your child's future education and your family's long-term security.",
      "Focus on an education endowment for your child instead.",
      "You do not need insurance if you have savings."
    ],
    correct: 1,
    explanation: "Address the new parent's comprehensive protection needs and connect the investment component to the child's future.",
    category: 'roleplay'
  },
  {
    question: "A 38-year-old self-employed client says: 'My income is irregular -- I cannot commit to fixed premiums.' How do you address this?",
    options: [
      "Self-employed people should not buy ILPs.",
      "You must have fixed income to qualify.",
      "PLP is ideal for irregular income: adjust premiums between $200-$400/month for the same coverage, and use the premium holiday feature to pause payments during lean months while coverage continues.",
      "Pay annually instead of monthly."
    ],
    correct: 2,
    explanation: "PLP's premium flexibility and premium holiday feature directly address the concerns of self-employed clients with variable income.",
    category: 'roleplay'
  },
  {
    question: "A 45-year-old executive with existing whole life and term plans asks: 'Why do I need PLP?' What is the best approach?",
    options: [
      "Cancel your existing plans and consolidate into PLP.",
      "You do not need any more coverage.",
      "PLP is cheaper than whole life plans.",
      "Review their coverage gaps, then position PLP's investment component for wealth building. At $400/month, PLP Max projects approximately $7 million -- framing it as a retirement income tool generating $2,000-$5,000/month from age 60."
    ],
    correct: 3,
    explanation: "For high earners with existing coverage, shift focus to wealth building and retirement income rather than pure protection.",
    category: 'roleplay'
  },
  {
    question: "A client's spouse says: 'We do not need insurance -- we have enough savings.' How do you engage both of them?",
    options: [
      "Ignore the spouse and close the sale.",
      "Tell the spouse they are wrong.",
      "Acknowledge their savings, then explain that a single critical illness or disability can deplete savings quickly. PLP protects their wealth from being wiped out while adding investment growth. Insurance and savings serve fundamentally different purposes.",
      "Suggest converting all savings to insurance."
    ],
    correct: 2,
    explanation: "Validate the spouse's position, then differentiate between savings (can be depleted) and insurance (protects against depletion), showing PLP as complementary.",
    category: 'roleplay'
  },
  {
    question: "A client asks: 'Should I choose PLP Max or Plus? And should I pick the Adventurous portfolio?' What is the best advisory approach?",
    options: [
      "Always choose Max and Adventurous for maximum returns.",
      "Always choose Plus and Cautious for safety.",
      "For most clients with a long horizon, Max is superior (approximately $5.1M vs $2.9M at $200/month). For the portfolio, assess their risk tolerance first -- Adventurous has higher potential but more volatility. A Balanced approach may be more prudent unless they have a very long horizon and high risk tolerance.",
      "It does not matter -- both plans and all portfolios perform the same."
    ],
    correct: 2,
    explanation: "Recommend Max with specific numbers, but tailor the portfolio recommendation to the client's risk profile rather than defaulting to the highest-risk option.",
    category: 'roleplay'
  }
];
