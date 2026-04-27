import type { StudyQuestion } from './proAchieverStudyBank';

export const proLifetimeProtectorStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (45 questions) -- Q1-Q45
  // ============================================================

  // Q1 -- correct: 2
  {
    question: "What type of insurance product is AIA Pro Lifetime Protector (PLP)?",
    options: [
      "A whole life participating plan with guaranteed bonuses",
      "A term life policy with renewable premiums",
      "A comprehensive Investment-Linked Policy (ILP) for protection and investment",
      "A universal life plan with fixed crediting rates"
    ],
    correct: 2,
    explanation: "PLP is a comprehensive ILP designed as a one-stop protection and investment solution, combining insurance coverage with investment components.",
    category: 'product-facts'
  },

  // Q2 -- correct: 2
  {
    question: "Up to what age does AIA Pro Lifetime Protector provide coverage?",
    options: [
      "Age 99",
      "Age 85",
      "Age 100",
      "Age 75"
    ],
    correct: 2,
    explanation: "PLP matures at the Insured's age 100 and terminates automatically on the maturity date [PS section 3.4]. The brochure example (p.7) confirms protection until age 100.",
    category: 'product-facts'
  },

  // Q3 -- correct: 1
  {
    question: "What are the two main components of the PLP plan structure?",
    options: [
      "Savings Account + Insurance Riders",
      "Base Plan + Optional Benefits (Riders)",
      "Death Benefit + Cash Value",
      "Premium Account + Protection Fund"
    ],
    correct: 1,
    explanation: "PLP consists of two components: the Base Plan and Optional Benefits (riders) that can be added for additional coverage.",
    category: 'product-facts'
  },

  // Q4 -- correct: 3
  {
    question: "How many conditions does the Multi-Pay Critical Illness Rider cover?",
    options: [
      "100 conditions",
      "120 conditions",
      "130 conditions",
      "150 conditions"
    ],
    correct: 3,
    explanation: "The Multi-Pay Critical Illness Rider covers 150 conditions and includes a reset feature with multiple claims up to 3 times.",
    category: 'product-facts'
  },

  // Q5 -- correct: 2
  {
    question: "How many times can the Multi-Pay Critical Illness Rider pay out?",
    options: [
      "1 time only",
      "2 times",
      "Up to 3 times",
      "Up to 5 times"
    ],
    correct: 2,
    explanation: "The Multi-Pay Critical Illness Rider allows multiple claims up to 3 times, providing ongoing critical illness protection.",
    category: 'product-facts'
  },

  // Q6 -- correct: 1
  {
    question: "Approximately how many early-stage conditions does the Early Critical Illness rider cover?",
    options: [
      "About 10 conditions",
      "About 20 conditions",
      "About 30 conditions",
      "About 50 conditions"
    ],
    correct: 1,
    explanation: "The Early Critical Illness rider covers approximately 20 early-stage conditions and includes a reset feature.",
    category: 'product-facts'
  },

  // Q7 -- correct: 0
  {
    question: "What is the premium allocation rate in Year 1 of PLP?",
    options: [
      "80%",
      "55%",
      "50%",
      "100%"
    ],
    correct: 0,
    explanation: "In Year 1, 80% of the premium is allocated to the investment component. This decreases to 55% in Year 2.",
    category: 'product-facts'
  },

  // Q8 -- correct: 3
  {
    question: "What is the premium allocation rate in Year 2 of PLP?",
    options: [
      "80%",
      "100%",
      "50%",
      "55%"
    ],
    correct: 3,
    explanation: "In Year 2, the premium allocation rate is 55%, down from 80% in Year 1.",
    category: 'product-facts'
  },

  // Q9 -- correct: 1
  {
    question: "What is the premium allocation rate in Year 3 of PLP?",
    options: [
      "55%",
      "50%",
      "45%",
      "8%"
    ],
    correct: 1,
    explanation: "In Year 3, 50% of premiums are allocated. The allocation drops significantly to 8% in Year 4.",
    category: 'product-facts'
  },

  // Q10 -- correct: 2
  {
    question: "What is the premium allocation rate in Year 4 of PLP?",
    options: [
      "50%",
      "15%",
      "8%",
      "0%"
    ],
    correct: 2,
    explanation: "Year 4 has an 8% allocation rate. From Year 5 onwards, the allocation drops to 0%.",
    category: 'product-facts'
  },

  // Q11 -- correct: 1
  {
    question: "From which policy year onwards does PLP allocate 100% of premiums to the investment component?",
    options: [
      "From Year 6 onwards",
      "From Year 5 onwards",
      "From Year 10 onwards",
      "From Year 3 onwards"
    ],
    correct: 1,
    explanation: "The Year 1-5 premium charge schedule is 80% / 55% / 50% / 8% / 0%, so from Year 5 onwards there is no premium charge and 100% of every premium is allocated to the investment component (Day 3 cheat sheet).",
    category: 'product-facts'
  },

  // Q12 -- correct: 3
  {
    question: "When does the PLP Special Bonus begin to be paid, per the Product Summary?",
    options: [
      "1% bonus from Year 5",
      "5% bonus from Year 15",
      "3% bonus from Year 8",
      "2% bonus from the 10th annual / 19th semi-annual / 37th quarterly / 109th monthly regular premium paid onwards"
    ],
    correct: 3,
    explanation: "PLP pays a 2% Special Bonus from the 10th annual / 19th semi-annual / 37th quarterly / 109th monthly regular premium paid onwards [PS section 3.3]. The trigger is premium count by frequency, not simply a calendar year cutoff.",
    category: 'product-facts'
  },

  // Q13 -- correct: 1
  {
    question: "What sum-assured discount on the monthly Death Benefit Charge applies for an Insured Amount of $250,000 or more?",
    options: [
      "5%",
      "8%",
      "10%",
      "12%"
    ],
    correct: 1,
    explanation: "An 8% reduction of the monthly Death Benefit Charge is given when the Insured Amount of the basic policy is equal to or more than S$250,000 [PS section 5.5]. A separate 5% tier applies at S$120,000 to S$249,999.",
    category: 'product-facts'
  },

  // Q14 -- correct: 0
  {
    question: "What sum-assured discount applies when the PLP Insured Amount is at least $120,000 but less than $250,000?",
    options: [
      "5%",
      "8%",
      "No discount",
      "10%"
    ],
    correct: 0,
    explanation: "A 5% reduction of the monthly Death Benefit Charge applies when the Insured Amount is at least S$120,000 [PS section 5.5]. Below S$120,000 there is no sum-assured discount; at S$250,000 or more the discount steps up to 8%.",
    category: 'product-facts'
  },

  // Q15 -- correct: 2
  {
    question: "How many Milestone Event Increases are allowed under PLP?",
    options: [
      "1 increase",
      "3 increases",
      "Maximum 2 increases",
      "Unlimited increases"
    ],
    correct: 2,
    explanation: "PLP allows a maximum of 2 Milestone Event Increases, each capped at 50% or $100,000 (whichever is lower), before the 60th birthday.",
    category: 'product-facts'
  },

  // Q16 -- correct: 3
  {
    question: "What is the cap for each Milestone Event Increase?",
    options: [
      "25% or $50,000, whichever is lower",
      "100% or $200,000, whichever is lower",
      "75% or $150,000, whichever is lower",
      "50% or $100,000, whichever is lower"
    ],
    correct: 3,
    explanation: "Each Milestone Event Increase is capped at 50% of the existing coverage or $100,000, whichever is lower.",
    category: 'product-facts'
  },

  // Q17 -- correct: 1
  {
    question: "By what age must Milestone Event Increases be exercised?",
    options: [
      "Before the 55th birthday",
      "Before the 60th birthday",
      "Before the 65th birthday",
      "Before the 50th birthday"
    ],
    correct: 1,
    explanation: "All Milestone Event Increases must be exercised before the policyholder's 60th birthday.",
    category: 'product-facts'
  },

  // Q18 -- correct: 3
  {
    question: "What is the lifetime cap on Medical Condition Benefit claims under the LCC (Lifetime Critical Cover) Rider?",
    options: [
      "$350,000 fixed",
      "$500,000 fixed",
      "200% of the Insured Amount",
      "300% of the Insured Amount under the supplementary agreement"
    ],
    correct: 3,
    explanation: "The total amount payable under Medical Condition Benefits shall not exceed 300% of the Insured Amount under this Supplementary Agreement [PS section 3.1 of LCC]. The cap scales with the Insured Amount chosen at issue -- there is no fixed dollar cap. A client buying LCC at $200K Insured Amount has a $600K cap.",
    category: 'product-facts'
  },

  // Q19 -- correct: 2
  {
    question: "How many special conditions does the LCC Rider cover, and what is the payout per claim?",
    options: [
      "10 conditions, 25% payout each",
      "20 conditions, 10% payout each",
      "15 conditions, 20% payout each",
      "15 conditions, 25% payout each"
    ],
    correct: 2,
    explanation: "The LCC Rider covers 15 special conditions with a 20% payout each, claimable up to 10 times, with a maximum of $25,000 per special condition claim.",
    category: 'product-facts'
  },

  // Q20 -- correct: 3
  {
    question: "What is the maximum payout per special condition claim under the LCC Rider?",
    options: [
      "$10,000",
      "$15,000",
      "$20,000",
      "$25,000"
    ],
    correct: 3,
    explanation: "Each special condition claim under the LCC Rider pays out a maximum of $25,000 (20% of insured amount, up to 10 times).",
    category: 'product-facts'
  },

  // Q21 -- correct: 1
  {
    question: "What is the waiting period for the Optional Relapse Benefit?",
    options: [
      "1 year",
      "2 years",
      "3 years",
      "5 years"
    ],
    correct: 1,
    explanation: "The Optional Relapse Benefit has a 2-year waiting period before a 100% payout can be claimed for relapse of a critical illness.",
    category: 'product-facts'
  },

  // Q22 -- correct: 0
  {
    question: "What is the payout percentage for the Optional Relapse Benefit?",
    options: [
      "100%",
      "75%",
      "50%",
      "150%"
    ],
    correct: 0,
    explanation: "The Optional Relapse Benefit provides a 100% payout after the 2-year waiting period.",
    category: 'product-facts'
  },

  // Q23 -- correct: 2
  {
    question: "What is the monthly policy fee for PLP?",
    options: [
      "$3/month",
      "$10/month",
      "$5/month",
      "$7.50/month"
    ],
    correct: 2,
    explanation: "PLP charges a monthly policy fee of $5.",
    category: 'product-facts'
  },

  // Q24 -- correct: 1
  {
    question: "What is the surrender charge in Year 1 for PLP?",
    options: [
      "50%",
      "75%",
      "100%",
      "25%"
    ],
    correct: 1,
    explanation: "The surrender charge in Year 1 is 75%, dropping to 50% in Year 2.",
    category: 'product-facts'
  },

  // Q25 -- correct: 3
  {
    question: "What is the surrender charge in Year 2 for PLP?",
    options: [
      "75%",
      "25%",
      "60%",
      "50%"
    ],
    correct: 3,
    explanation: "The surrender charge in Year 2 is 50%, reduced from 75% in Year 1.",
    category: 'product-facts'
  },

  // Q26 -- correct: 0
  {
    question: "What is the entry age range for adults purchasing PLP?",
    options: [
      "18 to 70",
      "21 to 65",
      "16 to 75",
      "18 to 65"
    ],
    correct: 0,
    explanation: "Adults can purchase PLP from age 18 to age 70.",
    category: 'product-facts'
  },

  // Q27 -- correct: 2
  {
    question: "What is the minimum annual premium for PLP?",
    options: [
      "$600",
      "$900",
      "$1,200",
      "$2,400"
    ],
    correct: 2,
    explanation: "The minimum annual premium for PLP is $1,200, which works out to $100 per month.",
    category: 'product-facts'
  },

  // Q28 -- correct: 2
  {
    question: "When can partial withdrawals be made from a PLP policy?",
    options: [
      "After age 55 OR 15 years",
      "After age 62 OR 20 years",
      "Any time after the end of Policy Year 2, subject to a minimum withdrawal of S$1,000 and a minimum remaining balance of S$1,000",
      "Anytime after Year 5"
    ],
    correct: 2,
    explanation: "Partial withdrawals are allowed any time after the end of Year 2, with a minimum withdrawal of S$1,000 and a minimum balance of S$1,000 [PS section 6.4]. The age 62 / 20-year rule is the dial-down (reduce coverage) mechanic, not the withdrawal mechanic -- the two are separate.",
    category: 'product-facts'
  },

  // Q29 -- correct: 3
  {
    question: "How long does the No Lapse Privilege protect the policy if the value hits zero?",
    options: [
      "5 years",
      "7 years",
      "15 years",
      "10 years"
    ],
    correct: 3,
    explanation: "The No Lapse Privilege provides 10 years of continued protection even if the policy value hits zero.",
    category: 'product-facts'
  },

  // Q30 -- correct: 0
  {
    question: "When is the Dial Down (reduce coverage) feature available under PLP?",
    options: [
      "Issue age below 52: 20 years from policy date OR the 62nd birthday, whichever is earlier. Issue age 52 and above: 10 years from policy date.",
      "20 years from policy date OR the 62nd birthday for all issue ages",
      "10 years from policy date OR the 60th birthday for all issue ages",
      "25 years from policy date OR the 65th birthday for all issue ages"
    ],
    correct: 0,
    explanation: "Dial-down rule depends on Issue Age [PS section 6.1(b)(ii)]. Issue age below 52: 20 years OR 62nd birthday, whichever is earlier. Issue age 52 and above: 10 years from Policy Date.",
    category: 'product-facts'
  },

  // Q31 -- correct: 2
  {
    question: "Can premiums be reduced in the first 2 years of a PLP policy?",
    options: [
      "Yes, with a small penalty fee",
      "Yes, but only by up to 25%",
      "No, premium reductions are not allowed in the first 2 years",
      "Yes, at any time without restrictions"
    ],
    correct: 2,
    explanation: "Policyholders cannot reduce their premiums during the first 2 years of the PLP policy.",
    category: 'product-facts'
  },

  // Q32 -- correct: 1
  {
    question: "Until what age does the LCC Rider provide coverage?",
    options: [
      "75th birthday anniversary",
      "85th birthday anniversary",
      "90th birthday anniversary",
      "99th birthday anniversary"
    ],
    correct: 1,
    explanation: "The LCC Rider provides coverage until the policyholder's 85th birthday anniversary.",
    category: 'product-facts'
  },

  // Q33 -- correct: 3
  {
    question: "What percentage of the insured amount does angioplasty pay out under PLP?",
    options: [
      "50%",
      "25%",
      "20%",
      "10%"
    ],
    correct: 3,
    explanation: "Angioplasty only pays out 10% of the insured amount, which is a commonly tested detail.",
    category: 'product-facts'
  },

  // Q34 -- correct: 0
  {
    question: "What survival period is required for critical illness claims under PLP?",
    options: [
      "7 days",
      "14 days",
      "30 days",
      "No survival period"
    ],
    correct: 0,
    explanation: "A 7-day survival period is required for critical illness claims. The claimant must survive at least 7 days after diagnosis.",
    category: 'product-facts'
  },

  // Q35 -- correct: 2
  {
    question: "What is the premium holiday charge during the first 2 years of PLP?",
    options: [
      "$25/month",
      "$75/month",
      "$50/month",
      "Free"
    ],
    correct: 2,
    explanation: "The premium holiday charge is $50/month during the first 2 years. After the first 2 years, premium holidays are free.",
    category: 'product-facts'
  },

  // Q36 -- correct: 1
  {
    question: "How many investment portfolios are available in PLP?",
    options: [
      "Two: Conservative and Aggressive",
      "Three: Cautious, Balanced, and Adventurous",
      "Four: Conservative, Moderate, Balanced, and Aggressive",
      "Five portfolios across the risk spectrum"
    ],
    correct: 1,
    explanation: "PLP offers three portfolios: Cautious, Balanced, and Adventurous, guided by investment firm Mercer.",
    category: 'product-facts'
  },

  // Q37 -- correct: 3
  {
    question: "Which investment advisory firm guides PLP's portfolio strategies?",
    options: [
      "BlackRock",
      "Vanguard",
      "Fidelity",
      "Mercer"
    ],
    correct: 3,
    explanation: "Mercer guides PLP's Pro Cautious, Pro Balanced, and Pro Adventurous portfolios. Per the brochure (p.4), Mercer has US$12.9 trillion in assets under advisement (as at 30 June 2019) and over 40 years of providing investment advice.",
    category: 'product-facts'
  },

  // Q38 -- correct: 1
  {
    question: "What are Mercer's credentials as cited in the PLP brochure?",
    options: [
      "US$1.29 trillion AUM, 25 years experience",
      "US$12.9 trillion in assets under advisement (30 June 2019), 40+ years of investment advice",
      "US$16 trillion in assets, $267 billion managed",
      "US$50 trillion AUM, founded 1880"
    ],
    correct: 1,
    explanation: "Brochure p.4: US$12.9 trillion in assets under advisement as at 30 June 2019, with over 40 years of providing investment advice. The $16T / $267B figures are not in the brochure or PS.",
    category: 'product-facts'
  },

  // Q39 -- correct: 2
  {
    question: "In the PLP Plus plan, how is the death benefit calculated?",
    options: [
      "Higher of Insured Amount OR Policy Value",
      "Policy Value only",
      "Insured Amount + Policy Value, less applicable fees and charges",
      "Insured Amount only"
    ],
    correct: 2,
    explanation: "Plus death benefit = Insured Amount + policy value, less applicable fees and charges [PS section 3.1(A)]. The SAR remains constant so insurance charges escalate with age.",
    category: 'product-facts'
  },

  // Q40 -- correct: 1
  {
    question: "In the PLP Max plan, how is the death benefit calculated?",
    options: [
      "Insured Amount + Policy Value",
      "Higher of (Insured Amount + total top-up premiums - total withdrawals) OR policy value, less applicable fees and charges",
      "Policy Value minus charges",
      "Fixed insured amount regardless of policy value"
    ],
    correct: 1,
    explanation: "Max death benefit = higher of (Insured Amount + total top-up premiums - total withdrawals) OR policy value, less applicable fees and charges [PS section 3.1(A)]. As the policy value grows, the Sum-at-Risk decreases toward zero, reducing insurance charges.",
    category: 'product-facts'
  },

  // Q41 -- correct: 3
  {
    question: "What happens to the Sum at Risk (SAR) in PLP Max as the policy value grows?",
    options: [
      "SAR remains constant",
      "SAR increases proportionally",
      "SAR fluctuates with market conditions",
      "SAR decreases and eventually reaches zero"
    ],
    correct: 3,
    explanation: "In PLP Max, as the policy value grows, the SAR decreases to zero, meaning insurance charges eventually drop to zero -- a major advantage over Plus.",
    category: 'product-facts'
  },

  // Q42 -- correct: 0
  {
    question: "What does the Vitality PowerUp Dollar provide, and what is the full annual tier adjustment table?",
    options: [
      "An extra 10% of Base sum assured. Annual change to Base by tier: Bronze -10%, Silver -5%, Gold +0%, Platinum +5%. Min 0%, max 150% of Base. Adjustment locks at later of 75th birthday or 15th policy anniversary.",
      "An extra 5% of sum assured for all tiers, no annual change",
      "An extra 20% of sum assured for all tiers",
      "A cash rebate on premiums only"
    ],
    correct: 0,
    explanation: "The Vitality PowerUp Dollar provides extra Base sum assured with annual tier-based adjustments [PS p.15-16]: Bronze -10%, Silver -5%, Gold +0%, Platinum +5%, subject to a minimum of 0% and maximum of 150% of Base. The annual adjustment locks at the later of the 75th birthday or the 15th policy anniversary.",
    category: 'product-facts'
  },

  // Q43 -- correct: 2
  {
    question: "Under the Vitality PowerUp Dollar tier table, what is the annual adjustment to Base sum assured at Bronze and Silver tiers?",
    options: [
      "Bronze +5%, Silver +0%",
      "Bronze 0%, Silver -10%",
      "Bronze -10%, Silver -5%",
      "Bronze -5%, Silver +0%"
    ],
    correct: 2,
    explanation: "The full tier table is Bronze -10%, Silver -5%, Gold +0%, Platinum +5% [Day 3, Day 5, PS p.15-16]. Silver is a real tier and was previously omitted from this bank.",
    category: 'product-facts'
  },

  // Q44 -- correct: 1
  {
    question: "What is the typical monthly cost range for Premium Paying Riders?",
    options: [
      "$5-$15 per month",
      "$10-$30 per month",
      "$30-$50 per month",
      "$50-$100 per month"
    ],
    correct: 1,
    explanation: "Premium Paying Riders cost an additional $10 to $30 per month, paid separately from the base premium.",
    category: 'product-facts'
  },

  // Q45 -- correct: 3
  {
    question: "Which PLP plan type is most commonly sold?",
    options: [
      "PLP Plus",
      "PLP Basic",
      "PLP Lite",
      "PLP Max"
    ],
    correct: 3,
    explanation: "PLP Max is the most commonly sold plan variant due to its superior long-term value and decreasing insurance charges.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (30 questions) -- Q46-Q75
  // ============================================================

  // Q46 -- correct: 2
  {
    question: "What is PLP's key two-in-one value proposition?",
    options: [
      "Medical coverage + savings",
      "Term insurance + endowment",
      "Protection coverage + investment growth",
      "Disability income + retirement planning"
    ],
    correct: 2,
    explanation: "PLP's core selling angle is the two-in-one concept: comprehensive protection coverage combined with investment growth in a single plan.",
    category: 'sales-angles'
  },

  // Q47 -- correct: 0
  {
    question: "How much coverage does a $200/month PLP premium typically provide?",
    options: [
      "$100,000",
      "$150,000",
      "$200,000",
      "$250,000"
    ],
    correct: 0,
    explanation: "The budget-to-coverage mapping is: $200/month = $100,000 coverage, $300/month = $150,000, $400/month = $200,000.",
    category: 'sales-angles'
  },

  // Q48 -- correct: 1
  {
    question: "How much coverage does a $300/month PLP premium typically provide?",
    options: [
      "$100,000",
      "$150,000",
      "$200,000",
      "$250,000"
    ],
    correct: 1,
    explanation: "A $300/month premium provides approximately $150,000 of coverage under PLP.",
    category: 'sales-angles'
  },

  // Q49 -- correct: 3
  {
    question: "How much coverage does a $400/month PLP premium typically provide?",
    options: [
      "$100,000",
      "$150,000",
      "$300,000",
      "$200,000"
    ],
    correct: 3,
    explanation: "A $400/month premium provides approximately $200,000 of coverage under PLP.",
    category: 'sales-angles'
  },

  // Q50 -- correct: 2
  {
    question: "What is the minimum recommended payment period for PLP?",
    options: [
      "5 years",
      "7 years",
      "10 years",
      "15 years"
    ],
    correct: 2,
    explanation: "A minimum 10-year payment period is recommended for PLP to maximize the investment component and benefit from full premium allocation.",
    category: 'sales-angles'
  },

  // Q51 -- correct: 0
  {
    question: "How can PLP be positioned as a retirement income plan?",
    options: [
      "Withdrawals of $2,000-$5,000/month from age 60",
      "Guaranteed annuity payments from age 55",
      "Fixed monthly payouts from age 65",
      "Lump sum payout at retirement only"
    ],
    correct: 0,
    explanation: "PLP can be structured as a retirement income plan where the policyholder withdraws $2,000 to $5,000 per month from the accumulated policy value starting at age 60.",
    category: 'sales-angles'
  },

  // Q52 -- correct: 1
  {
    question: "What projected returns does PLP Max generate at $200/month over the long term?",
    options: [
      "Approximately $2.9 million",
      "Approximately $5.1 million",
      "Approximately $3.5 million",
      "Approximately $7 million"
    ],
    correct: 1,
    explanation: "At $200/month, PLP Max projects approximately $5.1 million in returns, compared to approximately $2.9 million for PLP Plus.",
    category: 'sales-angles'
  },

  // Q53 -- correct: 3
  {
    question: "What projected returns does PLP Plus generate at $200/month?",
    options: [
      "Approximately $1.5 million",
      "Approximately $5.1 million",
      "Approximately $4 million",
      "Approximately $2.9 million"
    ],
    correct: 3,
    explanation: "PLP Plus projects approximately $2.9 million at $200/month, significantly less than PLP Max's $5.1 million due to escalating insurance charges.",
    category: 'sales-angles'
  },

  // Q54 -- correct: 2
  {
    question: "Why does PLP Max outperform PLP Plus in long-term returns?",
    options: [
      "Max has a higher premium allocation rate",
      "Max invests in different funds",
      "Max's insurance charges decrease to zero as policy value grows",
      "Max has lower management fees"
    ],
    correct: 2,
    explanation: "In PLP Max, the SAR decreases to zero as the policy value grows, meaning insurance charges eventually drop to zero. In Plus, the SAR stays constant so charges keep escalating.",
    category: 'sales-angles'
  },

  // Q55 -- correct: 0
  {
    question: "What is a key advantage of PLP's flexibility during job loss?",
    options: [
      "The policyholder can pause the plan and coverage continues",
      "AIA waives all premiums automatically",
      "The policy converts to term insurance",
      "The policyholder receives unemployment benefits"
    ],
    correct: 0,
    explanation: "PLP allows policyholders to pause their plan upon job loss while coverage continues, providing a safety net during financial hardship.",
    category: 'sales-angles'
  },

  // Q56 -- correct: 1
  {
    question: "What is the 'dial-down' strategy for PLP in the 50s/60s?",
    options: [
      "Cancel the policy entirely",
      "Reduce coverage to maximize the investment component",
      "Switch to a term life plan",
      "Increase premiums for higher death benefit"
    ],
    correct: 1,
    explanation: "The dial-down option allows policyholders to reduce their coverage in their 50s/60s to maximize the investment component for retirement.",
    category: 'sales-angles'
  },

  // Q57 -- correct: 3
  {
    question: "How does PLP evolve across life stages from 20s to 60s?",
    options: [
      "Investment-focused throughout all stages",
      "Protection decreases automatically with age",
      "Fixed coverage and investment throughout",
      "Protection-focused in 20s-40s, retirement-focused in 50s-60s"
    ],
    correct: 3,
    explanation: "PLP is designed to evolve with life stages: protection-focused during the 20s-40s when family responsibilities are high, then shifting to retirement-focused in the 50s-60s.",
    category: 'sales-angles'
  },

  // Q58 -- correct: 2
  {
    question: "Why is PLP advantageous for younger buyers in their 20s-30s?",
    options: [
      "They get guaranteed returns",
      "They pay lower management fees",
      "They get higher coverage at lower cost",
      "They have more fund choices"
    ],
    correct: 2,
    explanation: "Younger buyers benefit from higher coverage at lower cost due to lower mortality charges at younger ages.",
    category: 'sales-angles'
  },

  // Q59 -- correct: 0
  {
    question: "When comparing PLP vs GPP at the same premiums, approximately how much does PLP project vs GPP?",
    options: [
      "PLP approximately $3 million vs GPP approximately $300,000-$400,000",
      "PLP approximately $1 million vs GPP approximately $800,000",
      "PLP approximately $500,000 vs GPP approximately $400,000",
      "Both project similar returns"
    ],
    correct: 0,
    explanation: "For the same premiums, PLP projects approximately $3 million in returns compared to GPP's approximately $300,000-$400,000, though PLP's returns are non-guaranteed.",
    category: 'sales-angles'
  },

  // Q60 -- correct: 1
  {
    question: "What is a key flexibility advantage PLP has over GPP?",
    options: [
      "PLP has guaranteed returns",
      "PLP allows premium adjustments between $200-$400/month for the same coverage",
      "PLP has lower surrender charges",
      "PLP covers more critical illnesses"
    ],
    correct: 1,
    explanation: "Unlike GPP which has fixed pricing, PLP offers flexible premiums that can be adjusted between $200-$400/month for the same coverage level.",
    category: 'sales-angles'
  },

  // Q61 -- correct: 3
  {
    question: "What happens if a GPP policyholder loses their job?",
    options: [
      "Coverage is automatically paused",
      "AIA provides a premium loan",
      "The policyholder can dial down coverage",
      "The policyholder cannot pause; premiums are fixed"
    ],
    correct: 3,
    explanation: "Unlike PLP which can be paused, GPP cannot be paused and has fixed pricing, making it less flexible during financial difficulties.",
    category: 'sales-angles'
  },

  // Q62 -- correct: 2
  {
    question: "At a $400/month budget, how does PLP compare to APA+GPP combo in total returns?",
    options: [
      "PLP approximately $4.7 million vs combo approximately $7 million",
      "Both approximately $5 million",
      "PLP approximately $7 million vs combo approximately $4.7 million",
      "PLP approximately $3 million vs combo approximately $6 million"
    ],
    correct: 2,
    explanation: "At the same $400/month budget, PLP projects approximately $7 million compared to approximately $4.7 million for the APA+GPP combo, making PLP the superior choice for total returns.",
    category: 'sales-angles'
  },

  // Q63 -- correct: 0
  {
    question: "What is the 'start now vs start later' comparison used for in PLP sales?",
    options: [
      "To show the cost advantage of buying young due to lower mortality charges",
      "To compare PLP with competitor products",
      "To explain the premium holiday feature",
      "To demonstrate the dial-down option"
    ],
    correct: 0,
    explanation: "The 'start now vs start later' comparison demonstrates how buying PLP at a younger age results in significantly lower costs and higher long-term returns.",
    category: 'sales-angles'
  },

  // Q64 -- correct: 1
  {
    question: "What is the primary age group that buys PLP?",
    options: [
      "40s and 50s",
      "20s and 30s",
      "Teenagers with parents",
      "Retirees in their 60s"
    ],
    correct: 1,
    explanation: "The primary buyers of PLP are people in their 20s and 30s, who benefit most from the protection-focused early years and long-term investment growth.",
    category: 'sales-angles'
  },

  // Q65 -- correct: 3
  {
    question: "What is the most popular add-on rider for PLP?",
    options: [
      "Disability Income Rider",
      "Early Critical Illness Rider",
      "Premium Waiver Rider",
      "DCC (Double Critical Cover)"
    ],
    correct: 3,
    explanation: "DCC (Double Critical Cover) is the most popular add-on rider for PLP, providing enhanced critical illness protection.",
    category: 'sales-angles'
  },

  // Q66 -- correct: 2
  {
    question: "What common misconception about ILP insurance costs does PLP Max disprove?",
    options: [
      "That ILPs have no insurance charges",
      "That ILPs always lose money",
      "That ILP insurance costs always increase with age",
      "That ILPs cannot provide death benefits"
    ],
    correct: 2,
    explanation: "A common misconception is that ILP insurance costs always increase with age. PLP Max disproves this because its SAR decreases to zero as the policy value grows, eliminating insurance charges entirely.",
    category: 'sales-angles'
  },

  // Q67 -- correct: 0
  {
    question: "How should you explain the premium holiday feature to a client concerned about job security?",
    options: [
      "If you lose your job, you can pause premium payments while your coverage continues",
      "AIA will pay your premiums if you lose your job",
      "Your premiums are automatically reduced by 50%",
      "You receive cash benefits during unemployment"
    ],
    correct: 0,
    explanation: "The premium holiday feature allows clients to pause premium payments during financial difficulties while their coverage continues, providing peace of mind.",
    category: 'sales-angles'
  },

  // Q68 -- correct: 1
  {
    question: "Why did PLP sales drop around 2020?",
    options: [
      "Due to market downturn",
      "Due to the launch of ProAchiever",
      "Due to regulatory changes",
      "Due to premium increases"
    ],
    correct: 1,
    explanation: "PLP sales dropped around 2020 primarily because ProAchiever was launched as an alternative investment-linked product.",
    category: 'sales-angles'
  },

  // Q69 -- correct: 3
  {
    question: "When positioning PLP for a client in their 30s with a young family, what should you emphasize?",
    options: [
      "The retirement withdrawal feature",
      "The dial-down option in their 60s",
      "The Vitality rewards program",
      "High protection coverage at lower cost during younger years"
    ],
    correct: 3,
    explanation: "For young families, emphasize the higher coverage at lower cost advantage, as mortality charges are lower at younger ages, giving more protection per dollar.",
    category: 'sales-angles'
  },

  // Q70 -- correct: 2
  {
    question: "What is the key investment advantage PLP has over endowment plans?",
    options: [
      "Guaranteed returns",
      "Lower premiums",
      "Potentially much higher returns through market-linked investments",
      "Government backing"
    ],
    correct: 2,
    explanation: "PLP offers potentially much higher returns through market-linked investments compared to endowment plans, though these returns are non-guaranteed.",
    category: 'sales-angles'
  },

  // Q71 -- correct: 0
  {
    question: "How should you frame PLP for a client who already has term insurance?",
    options: [
      "PLP complements term insurance by adding an investment component that grows over time",
      "PLP should replace their term insurance immediately",
      "Term insurance is always better than PLP",
      "PLP and term insurance serve identical purposes"
    ],
    correct: 0,
    explanation: "PLP complements term insurance by adding a long-term investment component. While term covers immediate protection needs, PLP builds wealth simultaneously.",
    category: 'sales-angles'
  },

  // Q72 -- correct: 1
  {
    question: "What makes PLP suitable as a retirement planning tool?",
    options: [
      "Guaranteed monthly pension from age 55",
      "Accumulated policy value can be withdrawn as regular income from age 60",
      "Fixed annuity payments backed by the government",
      "Automatic conversion to an annuity plan at age 65"
    ],
    correct: 1,
    explanation: "PLP can serve as a retirement planning tool because the accumulated policy value can be withdrawn as regular income ($2,000-$5,000/month) starting from age 60.",
    category: 'sales-angles'
  },

  // Q73 -- correct: 3
  {
    question: "What is a persuasive way to explain the difference between PLP Max and Plus to a client?",
    options: [
      "Max is cheaper but has less coverage",
      "Plus is better for young clients",
      "Max and Plus perform identically",
      "Max's charges decrease over time, so more of your money stays invested and grows"
    ],
    correct: 3,
    explanation: "The most persuasive framing is that Max's charges decrease over time as the policy value grows, meaning more money stays invested and compounds for greater long-term returns.",
    category: 'sales-angles'
  },

  // Q74 -- correct: 2
  {
    question: "How do Unit Deducting Riders differ from Premium Paying Riders?",
    options: [
      "Unit Deducting Riders are more expensive",
      "Premium Paying Riders are deducted from account value",
      "Unit Deducting Riders are deducted from account value; Premium Paying Riders require additional monthly payment",
      "There is no difference"
    ],
    correct: 2,
    explanation: "Unit Deducting Riders are deducted from the account value, while Premium Paying Riders require an additional monthly payment of $10-$30.",
    category: 'sales-angles'
  },

  // Q75 -- correct: 0
  {
    question: "What Vitality tier should clients aim for to maintain the Power-Up Dollar benefit?",
    options: [
      "Gold, which maintains the benefit; Platinum increases it by 5% per year",
      "Bronze, which gives the highest benefit",
      "Silver, which doubles the benefit",
      "Any tier maintains the benefit equally"
    ],
    correct: 0,
    explanation: "Clients should aim for at least Gold tier to maintain the Power-Up Dollar benefit. Platinum is even better as it increases the benefit by 5% per year.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (25 questions) -- Q76-Q100
  // ============================================================

  // Q76 -- correct: 1
  {
    question: "A client says: 'ILPs are too risky -- I might lose all my money.' What is the best response?",
    options: [
      "You are right, ILPs are risky. Consider a savings plan instead.",
      "PLP has the No Lapse Privilege that maintains coverage for 10 years even if the policy value drops to zero, plus you can choose from Cautious, Balanced, or Adventurous portfolios to match your risk tolerance.",
      "ILPs have zero risk because AIA guarantees returns.",
      "Just ignore the investment part and focus on the insurance."
    ],
    correct: 1,
    explanation: "Address the concern with facts: the No Lapse Privilege protects coverage for 10 years, and portfolio choices allow risk management.",
    category: 'objection-handling'
  },

  // Q77 -- correct: 3
  {
    question: "A client objects: 'I cannot commit to paying premiums for 10 years.' What is the best response?",
    options: [
      "Then this product is not for you.",
      "You can cancel anytime without penalties.",
      "Just pay for 5 years and stop.",
      "PLP offers a premium holiday feature -- if you face financial difficulties, you can pause payments while your coverage continues."
    ],
    correct: 3,
    explanation: "The premium holiday feature directly addresses this concern by allowing pauses during financial difficulties while maintaining coverage.",
    category: 'objection-handling'
  },

  // Q78 -- correct: 0
  {
    question: "A client says: 'The insurance charges will eat into my returns as I age.' How do you respond for PLP Max?",
    options: [
      "With PLP Max, the Sum at Risk decreases as your policy value grows, so insurance charges actually decrease to zero over time.",
      "That is true for all ILPs, including PLP Max.",
      "The charges are fixed and never change.",
      "AIA will refund excess charges at maturity."
    ],
    correct: 0,
    explanation: "PLP Max's decreasing SAR mechanism means insurance charges reduce to zero over time -- the opposite of what the client fears.",
    category: 'objection-handling'
  },

  // Q79 -- correct: 2
  {
    question: "A client says: 'I can invest on my own and get better returns.' What is the best response?",
    options: [
      "You are probably right, investing on your own is always better.",
      "PLP returns are guaranteed to beat the market.",
      "PLP combines insurance protection with investment management by Mercer, who has US$12.9 trillion in assets under advisement (as at 30 June 2019) and over 40 years of investment advice (Brochure p.4). You get the convenience of protection and investment in one plan without having to manage both separately.",
      "You should just buy term insurance then."
    ],
    correct: 2,
    explanation: "Highlight the two-in-one value proposition and Mercer's expertise, emphasizing convenience rather than competing purely on returns.",
    category: 'objection-handling'
  },

  // Q80 -- correct: 1
  {
    question: "A client objects: 'The surrender charges in the first 2 years are too high.' How should you respond?",
    options: [
      "You can withdraw without any charges at any time.",
      "The 75% and 50% surrender charges in Years 1 and 2 are there to encourage long-term commitment, which is essential for compounding returns. After Year 2, the charges drop significantly.",
      "The charges are only 10% in Year 1.",
      "We can waive the surrender charges for you."
    ],
    correct: 1,
    explanation: "Acknowledge the charges honestly and reframe them as an incentive for long-term commitment, which benefits the policyholder through compounding.",
    category: 'objection-handling'
  },

  // Q81 -- correct: 3
  {
    question: "A client says: 'I already have enough insurance coverage.' What is the best approach?",
    options: [
      "You can never have too much insurance.",
      "Cancel your existing plans and switch to PLP.",
      "Insurance is the most important financial product.",
      "Review their existing coverage and position PLP as a wealth-building complement with its investment component, not just additional insurance."
    ],
    correct: 3,
    explanation: "Position PLP as a wealth-building complement rather than competing with existing coverage. Focus on the investment component.",
    category: 'objection-handling'
  },

  // Q82 -- correct: 0
  {
    question: "A client says: 'I will wait until I am older and earning more to start.' How do you counter this?",
    options: [
      "Use the start now vs start later comparison to show that buying young gives higher coverage at lower cost, and the time value of compounding makes a massive difference.",
      "You are right, it is better to wait until you earn more.",
      "There is no difference between starting now and later.",
      "You will be rejected when you are older."
    ],
    correct: 0,
    explanation: "The start now vs start later comparison demonstrates the significant cost advantage and compounding benefit of buying young.",
    category: 'objection-handling'
  },

  // Q83 -- correct: 2
  {
    question: "A client objects: 'I prefer guaranteed returns like endowment plans.' What is the best response?",
    options: [
      "PLP also has guaranteed returns.",
      "Endowment plans are always the wrong choice.",
      "I understand the appeal of guarantees. Consider that PLP at $200/month projects approximately $5.1 million with Max, compared to much lower guaranteed returns from endowments. The risk is managed through Mercer's professional portfolio management.",
      "You should split your money equally between PLP and endowments."
    ],
    correct: 2,
    explanation: "Acknowledge the client's preference, then contrast the projected returns with hard numbers while highlighting professional risk management.",
    category: 'objection-handling'
  },

  // Q84 -- correct: 1
  {
    question: "A client says: 'My friend lost money on their ILP.' How do you address this?",
    options: [
      "Your friend probably chose the wrong plan.",
      "That could happen if they surrendered early or chose Plus instead of Max. PLP Max's structure ensures charges decrease over time. The key is committing for at least 10 years and choosing the right portfolio for your risk profile.",
      "That never happens with AIA products.",
      "ILPs always make money in the long run."
    ],
    correct: 1,
    explanation: "Acknowledge the concern, explain likely reasons, and differentiate PLP Max's structure while emphasizing the importance of long-term commitment.",
    category: 'objection-handling'
  },

  // Q85 -- correct: 3
  {
    question: "A client says: '$200/month is too expensive for me right now.' What is the best response?",
    options: [
      "Then you cannot afford insurance.",
      "We can lower it to $50/month.",
      "Just borrow money to pay the premiums.",
      "The minimum annual premium is $1,200, which is $100/month. We can start there and increase as your income grows, using the flexible premium feature."
    ],
    correct: 3,
    explanation: "PLP's minimum is $100/month ($1,200 annually) and premiums are flexible, so you can start smaller and increase over time.",
    category: 'objection-handling'
  },

  // Q86 -- correct: 0
  {
    question: "A client asks: 'What if I need the money before age 62?' How do you respond?",
    options: [
      "While regular withdrawals are available after age 62 or 20 years, you can take a premium holiday if needed, and partial withdrawals may be possible depending on your policy terms.",
      "You cannot access your money at all before age 62.",
      "You can withdraw freely at any time.",
      "Surrender the policy and get a full refund."
    ],
    correct: 0,
    explanation: "Explain the withdrawal rules honestly while highlighting the premium holiday as an alternative for short-term financial needs.",
    category: 'objection-handling'
  },

  // Q87 -- correct: 2
  {
    question: "A client objects: 'I do not trust investment-linked products because returns are not guaranteed.' What angle should you take?",
    options: [
      "AIA guarantees all returns.",
      "Non-guaranteed means you will definitely lose money.",
      "While returns are non-guaranteed, PLP's portfolios are managed by Mercer, one of the world's largest investment advisors. Historical projections show PLP returns far exceeding guaranteed products.",
      "You are right to be cautious -- do not buy PLP."
    ],
    correct: 2,
    explanation: "Build trust by referencing Mercer's credibility and expertise while comparing projected returns to guaranteed alternatives.",
    category: 'objection-handling'
  },

  // Q88 -- correct: 1
  {
    question: "A client says: 'Why should I not just buy term and invest the rest?' How do you respond?",
    options: [
      "Term insurance is always better than ILPs.",
      "PLP gives you the discipline of regular investing with professional management by Mercer, plus you get coverage all the way to age 100 [PS section 3.4]. With buy term invest the rest, most people lack the discipline to invest consistently, and term coverage typically ends at 65-70.",
      "Because ILPs always outperform self-directed investing.",
      "There is no good answer to that question."
    ],
    correct: 1,
    explanation: "Address the behavioral aspect (investment discipline) and the coverage duration advantage (PLP matures at age 100 [PS section 3.4] vs typical term ending at 65-70).",
    category: 'objection-handling'
  },

  // Q89 -- correct: 3
  {
    question: "A client asks: 'What happens to my coverage if the market crashes?' How do you reassure them?",
    options: [
      "Your coverage is automatically cancelled.",
      "AIA will top up your account.",
      "Market crashes do not affect insurance policies.",
      "The No Lapse Privilege maintains your coverage for 10 years even if your policy value drops to zero. You can also choose the Cautious portfolio to reduce market exposure."
    ],
    correct: 3,
    explanation: "The No Lapse Privilege is the key reassurance, combined with the ability to choose lower-risk portfolios.",
    category: 'objection-handling'
  },

  // Q90 -- correct: 0
  {
    question: "A client says: 'The 80% allocation in Year 1 means 20% is wasted.' How do you reframe this?",
    options: [
      "The 20% covers your insurance protection charges and administration costs. Think of it as paying for immediate coverage from day one, while the 80% starts building your investment. After Year 6, you get 100% allocation.",
      "That 20% is pure profit for AIA.",
      "You are right, that 20% is wasted.",
      "All insurance products take 50% in Year 1, so 80% is actually generous."
    ],
    correct: 0,
    explanation: "Reframe the 20% as covering insurance costs (immediate value) and highlight the 100% allocation after Year 6 as a long-term benefit.",
    category: 'objection-handling'
  },

  // Q91 -- correct: 2
  {
    question: "A client objects: 'I heard PLP sales have been declining since 2020. Is it still a good product?' How do you respond?",
    options: [
      "Yes, sales have been declining so maybe it is not the best choice.",
      "That is not true, sales have been increasing.",
      "The sales shift was due to the launch of ProAchiever, another AIA product. PLP remains excellent for clients who want comprehensive protection with investment growth. The product features have not changed.",
      "You should buy ProAchiever instead."
    ],
    correct: 2,
    explanation: "Explain the context behind the sales decline honestly and reassure that PLP's value proposition remains strong.",
    category: 'objection-handling'
  },

  // Q92 -- correct: 1
  {
    question: "A client says: 'I do not want to pay $50/month for a premium holiday.' How do you address this?",
    options: [
      "The $50 is non-negotiable.",
      "The $50/month premium holiday charge only applies during the first 2 years. After that, premium holidays are completely free. So it is really a short-term cost for long-term flexibility.",
      "You can avoid the charge by never taking a premium holiday.",
      "AIA will waive the charge for loyal customers."
    ],
    correct: 1,
    explanation: "Clarify that the $50/month charge is only for the first 2 years, after which premium holidays become free.",
    category: 'objection-handling'
  },

  // Q93 -- correct: 3
  {
    question: "A client asks: 'Why should I choose PLP when there are cheaper ILPs available?' What is the best angle?",
    options: [
      "PLP is the cheapest ILP in the market.",
      "Cheaper ILPs are always worse products.",
      "Price does not matter for insurance.",
      "PLP's value is in its comprehensive features: 150-condition CI coverage, premium flexibility, No Lapse Privilege, Mercer-managed portfolios, Vitality rewards, and coverage to maturity at age 100 [PS section 3.4]. The total package justifies the premium."
    ],
    correct: 3,
    explanation: "Shift the conversation from price to total value by listing PLP's comprehensive feature set that cheaper alternatives lack.",
    category: 'objection-handling'
  },

  // Q94 -- correct: 0
  {
    question: "A client objects: 'I do not understand how the investment component works.' What should you do?",
    options: [
      "Simplify the explanation: PLP invests your premiums in professionally managed portfolios. You choose your risk level -- Cautious, Balanced, or Adventurous -- and Mercer handles the rest. Over time, your money grows while you are protected.",
      "Tell them not to worry about it and just sign up.",
      "Show them a 50-page investment prospectus.",
      "Suggest they take a finance course first."
    ],
    correct: 0,
    explanation: "Keep the explanation simple and focus on the three portfolio choices and Mercer's professional management to make it accessible.",
    category: 'objection-handling'
  },

  // Q95 -- correct: 2
  {
    question: "A client says: 'I only need coverage until my kids are grown, not until age 100.' How do you respond?",
    options: [
      "You are right, buy term insurance instead.",
      "You are legally required to have coverage until age 100.",
      "PLP is flexible -- you can dial down your coverage when your kids are grown and shift focus to the investment component for retirement income. The coverage to maturity at age 100 [PS section 3.4] is a benefit, not a requirement you have to maximize.",
      "Age 99 coverage is the only option; it cannot be changed."
    ],
    correct: 2,
    explanation: "Reframe the long coverage period as flexibility, highlighting the dial-down option and the transition to retirement income.",
    category: 'objection-handling'
  },

  // Q96 -- correct: 1
  {
    question: "A client asks: 'What if AIA goes bankrupt? I lose everything, right?' How do you respond?",
    options: [
      "That is a valid concern with no good answer.",
      "AIA is one of the largest insurance groups in Asia-Pacific with over 100 years of history. Additionally, Singapore's Policy Owners' Protection Scheme provides a safety net for life insurance policies.",
      "Insurance companies never go bankrupt.",
      "You should spread your policies across 10 different insurers."
    ],
    correct: 1,
    explanation: "Reassure with AIA's track record and size, plus Singapore's regulatory protections for policyholders.",
    category: 'objection-handling'
  },

  // Q97 -- correct: 3
  {
    question: "A client says: 'I would rather put my money in property.' How do you position PLP alongside property investment?",
    options: [
      "Property is always a bad investment.",
      "Sell your property and buy PLP instead.",
      "PLP and property are exactly the same.",
      "Property and PLP serve different purposes. PLP provides immediate protection your family can access without selling assets, plus liquidity that property lacks. Many successful investors diversify with both."
    ],
    correct: 3,
    explanation: "Position PLP as complementary to property, highlighting liquidity and immediate protection benefits that property cannot provide.",
    category: 'objection-handling'
  },

  // Q98 -- correct: 0
  {
    question: "A client objects: 'The 7-day survival period for CI claims seems unfair.' How do you address this?",
    options: [
      "The 7-day survival period is a standard industry practice across all insurers, not unique to PLP. It ensures the diagnosis is confirmed and accurate before claims are processed.",
      "You are right, it is unfair. Choose a different product.",
      "There is no survival period for PLP claims.",
      "AIA can waive the survival period for preferred clients."
    ],
    correct: 0,
    explanation: "Normalize the 7-day survival period as an industry standard and explain its purpose in ensuring accurate diagnoses.",
    category: 'objection-handling'
  },

  // Q99 -- correct: 2
  {
    question: "A client says: 'Angioplasty only pays 10% -- that seems very low.' How do you handle this objection?",
    options: [
      "10% is actually very generous for angioplasty.",
      "AIA is planning to increase it to 50% soon.",
      "Angioplasty is classified as a less severe procedure compared to major surgeries. The 10% payout reflects this, while major critical illnesses receive full payouts. The LCC Rider can also provide additional coverage with its 15 special conditions.",
      "You should buy a separate angioplasty insurance plan."
    ],
    correct: 2,
    explanation: "Explain the severity-based payout structure and redirect to the broader coverage available through the LCC Rider.",
    category: 'objection-handling'
  },

  // Q100 -- correct: 1
  {
    question: "A client says: 'I do not exercise, so AIA Vitality will not benefit me.' How do you respond?",
    options: [
      "Then you will not get any benefits from PLP.",
      "Even without Vitality, PLP's core protection and investment features stand on their own. Vitality is an additional perk, not a requirement. And the program rewards more than just exercise -- health screenings and wellness activities also count.",
      "You must exercise to qualify for PLP.",
      "Vitality is the main reason to buy PLP."
    ],
    correct: 1,
    explanation: "Separate PLP's core value from Vitality and clarify that Vitality rewards extend beyond exercise to include health screenings and other activities.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (20 questions) -- Q101-Q120
  // ============================================================

  // Q101 -- correct: 2
  {
    question: "A 25-year-old fresh graduate earning $3,500/month says: 'I just started working and cannot afford insurance right now.' What is the best response?",
    options: [
      "Come back when you earn more money.",
      "You need at least $500/month for proper coverage.",
      "Starting now at your age gives you the lowest rates. PLP's minimum is just $100/month -- less than $4 a day. The protection you build now will be much more expensive if you wait.",
      "You should focus on saving first and buy insurance in your 30s."
    ],
    correct: 2,
    explanation: "Emphasize affordability ($100/month minimum) and the cost advantage of buying young, making it relatable with the $4/day framing.",
    category: 'roleplay'
  },

  // Q102 -- correct: 1
  {
    question: "A 32-year-old with a newborn asks: 'What is the most important coverage I need right now?' How do you position PLP?",
    options: [
      "You only need term insurance for now.",
      "With a new baby, your priority is protection. PLP gives you comprehensive coverage -- death, TPD, disability income, and critical illness -- all in one plan. Start at $200/month for $100,000 coverage, and the investment component builds a nest egg for your child's future.",
      "You should focus on buying an endowment plan for your child's education.",
      "You do not need insurance -- just save more money."
    ],
    correct: 1,
    explanation: "Address the new parent's protection needs comprehensively and connect the investment component to the child's future.",
    category: 'roleplay'
  },

  // Q103 -- correct: 3
  {
    question: "A 45-year-old executive earning $15,000/month says: 'I already have whole life and term plans. Why do I need PLP?' What is the best approach?",
    options: [
      "Cancel your existing plans and consolidate into PLP.",
      "You are right, you do not need any more insurance.",
      "PLP is cheaper than your existing plans.",
      "Review their existing coverage gaps, then position PLP's investment component as a wealth-building tool for retirement. At $400/month, PLP Max can accumulate approximately $7 million for retirement income."
    ],
    correct: 3,
    explanation: "For high earners with existing coverage, shift the conversation to wealth building and retirement income rather than pure protection.",
    category: 'roleplay'
  },

  // Q104 -- correct: 0
  {
    question: "A couple in their late 20s asks: 'Should we each get our own PLP or can we share one policy?' What is the correct advice?",
    options: [
      "Each person should have their own PLP policy for individual coverage. You can use the child coverage rider for your future children. Having separate policies ensures each of you is independently protected.",
      "One policy is enough for a married couple.",
      "Share one policy to save money.",
      "Only the higher earner needs insurance."
    ],
    correct: 0,
    explanation: "Each person needs their own policy for proper individual coverage. Sharing a policy would leave one spouse unprotected.",
    category: 'roleplay'
  },

  // Q105 -- correct: 2
  {
    question: "A 38-year-old self-employed client says: 'My income is irregular -- I cannot commit to fixed monthly premiums.' How do you address this?",
    options: [
      "Self-employed people cannot buy ILPs.",
      "You must have a fixed income to qualify for PLP.",
      "PLP is actually ideal for irregular income. You can adjust premiums between $200-$400/month for the same coverage, and if you hit a rough patch, the premium holiday feature lets you pause payments while coverage continues.",
      "Pay annually instead of monthly to avoid this issue."
    ],
    correct: 2,
    explanation: "Highlight PLP's premium flexibility and premium holiday feature as specifically suited for irregular income situations.",
    category: 'roleplay'
  },

  // Q106 -- correct: 1
  {
    question: "A 55-year-old client approaching retirement asks: 'Is it too late for me to start PLP?' What is the best response?",
    options: [
      "Yes, it is too late -- you should have started in your 20s.",
      "You can still apply up to age 70. At your stage, we can focus PLP more on the investment component. You could also use the dial-down feature in a few years to reduce coverage and maximize your retirement fund.",
      "PLP is only for young people.",
      "You should buy a pure annuity plan instead."
    ],
    correct: 1,
    explanation: "The entry age goes up to 70, and the dial-down feature makes PLP relevant even for older clients focused on retirement.",
    category: 'roleplay'
  },

  // Q107 -- correct: 3
  {
    question: "A client asks: 'My colleague bought ProAchiever -- should I get that instead of PLP?' How do you differentiate?",
    options: [
      "ProAchiever is always better than PLP.",
      "PLP is always better than ProAchiever.",
      "They are exactly the same product.",
      "PLP and ProAchiever serve different needs. PLP is a comprehensive protection plan that evolves with your life stages and matures at age 100 [PS section 3.4]. ProAchiever focuses more on the investment component with a defined investment period. Let us look at your specific needs to determine which fits better."
    ],
    correct: 3,
    explanation: "Differentiate based on the client's needs rather than making blanket comparisons. PLP emphasizes comprehensive lifetime protection; ProAchiever emphasizes investment.",
    category: 'roleplay'
  },

  // Q108 -- correct: 0
  {
    question: "A 30-year-old client with existing medical conditions asks: 'Can I still apply for PLP?' What is the appropriate response?",
    options: [
      "You can apply, and AIA will assess your application based on your medical history. Some conditions may result in exclusions or loading, but many people with medical conditions are still approved. Let us start the application and see what underwriting offers.",
      "You will definitely be rejected.",
      "Pre-existing conditions are not covered by any insurer.",
      "You should not disclose your medical conditions."
    ],
    correct: 0,
    explanation: "Be honest about the underwriting process, reassure that approval is possible, and never advise non-disclosure of medical conditions.",
    category: 'roleplay'
  },

  // Q109 -- correct: 2
  {
    question: "A client says: 'I want the highest returns possible -- put everything in the Adventurous portfolio.' What should you advise?",
    options: [
      "Great choice -- maximum risk means maximum returns.",
      "You cannot choose the Adventurous portfolio.",
      "I appreciate your confidence, but let us first assess your risk tolerance and time horizon. The Adventurous portfolio has higher potential returns but also higher volatility. If you are young with a long time horizon, it could work, but diversifying across portfolios may be more prudent.",
      "The Cautious portfolio always outperforms Adventurous."
    ],
    correct: 2,
    explanation: "A responsible advisor should assess risk tolerance and time horizon before recommending a portfolio, not simply agree with the client's preference.",
    category: 'roleplay'
  },

  // Q110 -- correct: 1
  {
    question: "A client's spouse says: 'We do not need insurance -- we have enough savings.' How do you engage both of them?",
    options: [
      "Ignore the spouse and focus on closing the sale with the client.",
      "Acknowledge the strong savings position, then explain that insurance and savings serve different purposes. Savings can be depleted by a single critical illness or disability. PLP protects your savings from being wiped out while adding an investment growth component.",
      "Tell the spouse they are wrong about not needing insurance.",
      "Suggest they invest all their savings in PLP instead."
    ],
    correct: 1,
    explanation: "Validate the spouse's position, then differentiate between savings and insurance protection, showing how PLP protects their existing wealth.",
    category: 'roleplay'
  },

  // Q111 -- correct: 3
  {
    question: "A 28-year-old client earning $5,000/month says: 'I want $300,000 of coverage but I can only afford $200/month.' What do you propose?",
    options: [
      "Tell them $300,000 coverage is impossible at $200/month.",
      "Suggest they borrow money to pay higher premiums.",
      "Recommend they only get $50,000 of coverage.",
      "Start with PLP at $200/month for $100,000 coverage now. You can use the Milestone Event Increase to add up to 50% more coverage at life events like marriage or having a child, and gradually increase premiums as your income grows."
    ],
    correct: 3,
    explanation: "Use PLP's flexibility -- start with affordable coverage and build up using Milestone Event Increases and premium adjustments over time.",
    category: 'roleplay'
  },

  // Q112 -- correct: 0
  {
    question: "A client who recently experienced a market downturn says: 'I am scared my PLP investments will drop too.' What is the best approach?",
    options: [
      "I understand your concern. PLP offers the Cautious portfolio for lower risk exposure, and the No Lapse Privilege ensures your coverage continues for 10 years even if the policy value drops to zero. Also, with regular monthly contributions, you benefit from dollar-cost averaging during downturns.",
      "Markets always recover so there is nothing to worry about.",
      "Switch all your money to a fixed deposit instead.",
      "AIA guarantees your policy value will never decrease."
    ],
    correct: 0,
    explanation: "Address fear with concrete protections: Cautious portfolio option, No Lapse Privilege, and the dollar-cost averaging benefit of regular contributions.",
    category: 'roleplay'
  },

  // Q113 -- correct: 2
  {
    question: "A 35-year-old client asks: 'Should I choose PLP Max or PLP Plus?' What factors should guide your recommendation?",
    options: [
      "Always recommend Plus because it is simpler.",
      "Always recommend Max because it is cheaper.",
      "For a 35-year-old with a long time horizon, PLP Max is typically better because insurance charges decrease to zero over time, resulting in significantly higher long-term returns -- approximately $5.1 million vs $2.9 million at $200/month. Plus may suit someone who wants the combined death benefit (insured amount plus policy value).",
      "It does not matter -- they perform identically."
    ],
    correct: 2,
    explanation: "Guide the decision based on the client's profile: Max is typically better for long-term growth; Plus offers a different death benefit structure.",
    category: 'roleplay'
  },

  // Q114 -- correct: 1
  {
    question: "A client in their early 40s says: 'I want to retire at 55 with $3,000/month income. Can PLP help?' How do you position PLP?",
    options: [
      "PLP cannot help with retirement planning.",
      "PLP can absolutely support this goal. If you start with $400/month now, the investment component grows over time. At retirement, you can dial down your coverage and withdraw $2,000-$5,000/month from the accumulated policy value starting from age 60, or even earlier through partial withdrawals.",
      "You need at least $1,000/month in premiums for that goal.",
      "Buy a pure investment fund instead of PLP."
    ],
    correct: 1,
    explanation: "Connect PLP's dial-down and withdrawal features to the client's specific retirement income goal, making the product tangible.",
    category: 'roleplay'
  },

  // Q115 -- correct: 3
  {
    question: "A client's parent calls and says: 'Why are you selling my son an ILP? Those are scams.' How do you handle this professionally?",
    options: [
      "Hang up and continue with the client.",
      "Tell the parent they are wrong and uninformed.",
      "Agree that ILPs can be problematic and cancel the application.",
      "Thank the parent for their concern, offer to include them in the next meeting to address their questions, and briefly explain PLP's structure -- professional management by Mercer, No Lapse Privilege, and AIA Vitality integration."
    ],
    correct: 3,
    explanation: "Remain professional, invite the parent to be involved, and address their concerns with facts rather than dismissing them.",
    category: 'roleplay'
  },

  // Q116 -- correct: 0
  {
    question: "A 27-year-old client asks: 'Can I use PLP to save for my children's education?' What is the best advice?",
    options: [
      "PLP can serve as a savings vehicle for education through its investment component, but it is primarily a protection plan. The investment growth over 15-20 years can help fund education while keeping you protected. Consider adding the child coverage rider for your children's protection.",
      "PLP is only for retirement -- use an education fund instead.",
      "Withdraw all money from PLP when your child turns 18.",
      "PLP is not suitable for any savings goals."
    ],
    correct: 0,
    explanation: "Position PLP's investment component as a potential education savings vehicle while being honest that it is primarily a protection plan.",
    category: 'roleplay'
  },

  // Q117 -- correct: 2
  {
    question: "During a sales meeting, a client compares PLP to Prudential's ILP product. What approach should you take?",
    options: [
      "Criticize Prudential's product aggressively.",
      "Say all ILPs are the same.",
      "Focus on PLP's unique strengths: 150-condition CI coverage, Mercer-managed portfolios, No Lapse Privilege, AIA Vitality rewards, and the flexibility to dial down coverage. Avoid criticizing competitors directly.",
      "Tell the client to buy the Prudential product if they prefer it."
    ],
    correct: 2,
    explanation: "Always focus on your product's unique strengths rather than attacking competitors. Let the features speak for themselves.",
    category: 'roleplay'
  },

  // Q118 -- correct: 1
  {
    question: "A client who just got married says: 'My wife and I together earn $12,000/month. How much PLP coverage should we get?' What is the recommended approach?",
    options: [
      "Buy as much coverage as possible.",
      "As a guideline, each of you should consider separate PLP policies. At $300/month each, you would get approximately $150,000 coverage per person, within a comfortable budget. You can increase coverage later using Milestone Event Increases when you have children.",
      "One $200/month policy is enough for both of you.",
      "Spend 50% of your income on insurance premiums."
    ],
    correct: 1,
    explanation: "Recommend separate policies for proper individual coverage, suggest a comfortable premium level, and mention Milestone Event Increases for future life events.",
    category: 'roleplay'
  },

  // Q119 -- correct: 3
  {
    question: "A 60-year-old client asks: 'Should I surrender my existing PLP policy that I have held for 25 years?' What should you advise?",
    options: [
      "Yes, surrender it and reinvest the money.",
      "It does not matter either way.",
      "Surrender half the policy.",
      "After 25 years, your policy value should have grown significantly. Rather than surrendering, consider using the dial-down feature to reduce coverage and start withdrawing $2,000-$5,000/month as retirement income while keeping the remaining coverage."
    ],
    correct: 3,
    explanation: "A 25-year-old policy has significant accumulated value. The dial-down and withdrawal features let the client access funds without losing all coverage.",
    category: 'roleplay'
  },

  // Q120 -- correct: 0
  {
    question: "A client asks you to compare PLP with putting $400/month into a robo-advisor. What is the best approach?",
    options: [
      "Acknowledge that robo-advisors offer low-cost investing, but PLP provides something they cannot: comprehensive insurance coverage including death, TPD, disability income, and critical illness -- all while investing through Mercer-managed portfolios. If something happens to you, a robo-advisor cannot pay your family a death benefit.",
      "Robo-advisors are always better than ILPs.",
      "PLP always outperforms robo-advisors.",
      "Tell the client robo-advisors are scams."
    ],
    correct: 0,
    explanation: "Highlight PLP's unique insurance component that robo-advisors cannot replicate, while acknowledging the valid investment comparison.",
    category: 'roleplay'
  },

  // ============================================================
  // SECTION D ADDITIONS (8 questions) -- Q121-Q128
  // ============================================================

  // Q121 -- correct: 2
  {
    question: "What is the maturity age of AIA Pro Lifetime Protector (II)?",
    options: [
      "Age 85",
      "Age 95",
      "Age 100",
      "Age 99"
    ],
    correct: 2,
    explanation: "The policy matures at the Insured's age 100 and terminates automatically on the maturity date [PS section 3.4].",
    category: 'product-facts'
  },

  // Q122 -- correct: 1
  {
    question: "What are Mercer's credentials as cited in the PLP brochure?",
    options: [
      "US$1.29 trillion AUM, 25 years experience",
      "US$12.9 trillion in assets under advisement (30 June 2019), 40+ years of investment advice",
      "US$16 trillion in assets, $267 billion managed",
      "US$50 trillion AUM, founded 1880"
    ],
    correct: 1,
    explanation: "Brochure p.4: US$12.9 trillion in assets under advisement as at 30 June 2019, with over 40 years of providing investment advice.",
    category: 'product-facts'
  },

  // Q123 -- correct: 2
  {
    question: "What is the lifetime cap on Medical Condition Benefit claims under the Lifetime Critical Cover (LCC) rider?",
    options: [
      "S$350,000 fixed",
      "S$500,000 fixed",
      "300% of the Insured Amount under the supplementary agreement",
      "200% of the Insured Amount"
    ],
    correct: 2,
    explanation: "The total amount payable under Medical Condition Benefits shall not be more than 300% of the Insured Amount [PS section 3.1 of LCC]. The cap scales with the Insured Amount -- there is no fixed dollar cap.",
    category: 'product-facts'
  },

  // Q124 -- correct: 1
  {
    question: "The Sum-at-Risk on PLP Max is calculated as:",
    options: [
      "Insured Amount minus all premiums paid",
      "Insured Amount + total top-up premiums - total withdrawals - policy value",
      "Policy value minus the Insured Amount",
      "Annual premium x number of years to age 100"
    ],
    correct: 1,
    explanation: "Sum-at-Risk = Insured Amount + total top-up premiums - total withdrawals - policy value [PS section 5.5(B)]. When SAR is at or below zero in any month, no Benefit Charge is payable for that month -- this is the structural feature that lets Max insurance go free once policy value crosses Insured Amount.",
    category: 'product-facts'
  },

  // Q125 -- correct: 1
  {
    question: "Which set of statements must be delivered verbatim at every PLP meeting under ILP compliance?",
    options: [
      "Premiums guaranteed, policy values guaranteed, past performance indicative",
      "Premiums NOT guaranteed, policy values NOT guaranteed, past performance NOT indicative of future performance",
      "AIA guarantees minimum 3% return",
      "Past performance over 10 years is the best predictor"
    ],
    correct: 1,
    explanation: "The three pillar disclosures (Brochure p.9 / PS p.11) are the foundation of every ILP sale and are RNF-audited: premiums are not guaranteed, policy values are not guaranteed, and past performance is not indicative of future performance.",
    category: 'compliance'
  },

  // Q126 -- correct: 2
  {
    question: "A prospect needs S$5,000/month of passive income in retirement. By the 25X rule, what is the portfolio target?",
    options: [
      "S$600,000",
      "S$900,000",
      "S$1,500,000",
      "S$3,000,000"
    ],
    correct: 2,
    explanation: "Monthly expense x 12 x 25 = portfolio target. $5,000 x 12 x 25 = $1.5M. The 25X rule converts vague retirement language into an Insured-Amount target (Day 2 anchor).",
    category: 'sales-angles'
  },

  // Q127 -- correct: 1
  {
    question: "PLP's Death Benefit Charge sum-assured discounts are:",
    options: [
      "5% at any coverage level",
      "5% at Insured Amount >= S$120,000; 8% at Insured Amount >= S$250,000",
      "8% at any coverage >= S$100,000",
      "10% at coverage >= S$500,000"
    ],
    correct: 1,
    explanation: "5% at $120K+ and 8% at $250K+ [PS section 5.5]. There is no sum-assured discount below $120K. A separate 50% first-year Benefit Charge discount also applies.",
    category: 'product-facts'
  },

  // Q128 -- correct: 1
  {
    question: "When recommending a Mercer-guided portfolio, the discipline rule is:",
    options: [
      "Always recommend Pro Adventurous to maximize return",
      "Match the portfolio to the prospect's risk profile -- go lower or similar, never higher",
      "Default to Pro Cautious unless the client is under 30",
      "Let the client choose with no FC input"
    ],
    correct: 1,
    explanation: "Never propose above the prospect's stated risk profile (Day 5 Part 2 + Video 2). This is an RNF-tested rule that is trust-critical and audit-critical.",
    category: 'compliance'
  }
];
