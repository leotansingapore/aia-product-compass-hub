import type { ExamQuestion } from './proAchieverExamQuestions';

export const healthshieldGoldMaxExamQuestions: ExamQuestion[] = [

  // ══════════════════════════════════════════
  // PRODUCT FACTS (12 questions)
  // ══════════════════════════════════════════

  {
    question: "What is the annual claim limit and ward class coverage for HealthShield Gold Max Plan A?",
    options: [
      "$2 million covering private hospital rooms on an as-charged basis",
      "$500,000 covering private hospital rooms",
      "$1 million covering Class A wards in public hospitals",
      "$2 million covering Class B1 wards only"
    ],
    correct: 0,
    explanation: "Plan A is the top-tier option with a $2 million annual claim limit covering private hospital stays on an as-charged basis, meaning there are no sub-limits on individual items up to the annual cap.",
    category: 'product-facts'
  },

  {
    question: "What is the VitalHealth rider's effect on co-insurance, and how does the Value variant differ?",
    options: [
      "VitalHealth removes co-insurance entirely; the Value variant caps it at $3,000/year",
      "VitalHealth reduces co-insurance to 5% capped at $3,000/year; VitalHealth A Value has a higher cap of $6,000/year",
      "Both variants reduce co-insurance to 5% with identical $3,000 caps",
      "VitalHealth reduces co-insurance to 3% capped at $2,000/year; the Value variant has no cap"
    ],
    correct: 1,
    explanation: "The standard VitalHealth rider reduces co-insurance from 10% to 5% with a $3,000 annual cap. The VitalHealth A Value variant also reduces to 5% but with a higher $6,000 cap, saving approximately $1,400/year in premiums.",
    category: 'product-facts'
  },

  {
    question: "What proration applies when a Plan A policyholder uses a non-AQHP doctor without obtaining pre-authorization?",
    options: [
      "70% proration",
      "No proration applies",
      "50% proration",
      "85% proration"
    ],
    correct: 3,
    explanation: "Without pre-authorization and outside the AQHP panel, claims are prorated at 85%, meaning the insurer pays only 85% of eligible charges. Using an AQHP doctor or getting pre-authorization removes proration entirely.",
    category: 'product-facts'
  },

  {
    question: "What are the three different waiting periods for HealthShield Gold Max?",
    options: [
      "30 days general, 6 months pregnancy, 12 months organ donation",
      "30 days general, 10 months pregnancy complications, 24 months living donor organ donation",
      "14 days general, 10 months pregnancy, 36 months organ donation",
      "60 days general, 12 months pregnancy, 24 months organ donation"
    ],
    correct: 1,
    explanation: "HealthShield Gold Max has three waiting periods: 30 days for general conditions, 10 months for pregnancy-related complications, and 24 months for living donor organ donation (the longest waiting period).",
    category: 'product-facts'
  },

  {
    question: "How does the Waiver Pass mechanism work for HealthShield Gold Max claims?",
    options: [
      "Every claim triggers an additional $2,000 deductible",
      "First claim has no penalty; second claim within 36 months adds a $2,000 deductible; resets after 36 months without claims",
      "The first two claims are penalty-free; the third adds $1,000",
      "All claims within a policy year share a single additional deductible"
    ],
    correct: 1,
    explanation: "The Waiver Pass grants a penalty-free first claim. A second claim within 36 months triggers an additional $2,000 deductible on top of the standard deductible. After 36 consecutive months without a claim, the Waiver Pass resets.",
    category: 'product-facts'
  },

  {
    question: "What is the MediSave Additional Withdrawal Limit (AWL) for policyholders in different age bands?",
    options: [
      "$300/year for all ages",
      "$300/year (age 40 and below), $600/year (age 41-70), $900/year (age 71+)",
      "$600/year for all ages",
      "$500/year (under 50), $1,000/year (50-70), $1,500/year (71+)"
    ],
    correct: 1,
    explanation: "MediSave AWL increases with age: $300/year for those 40 and below, $600/year for ages 41-70, and $900/year for those 71 and above. This helps offset higher premiums at older ages.",
    category: 'product-facts'
  },

  {
    question: "What coverage does the Cancer Booster Rider provide, and what does it cost?",
    options: [
      "A flat $100,000 lump sum on cancer diagnosis for $120/year",
      "16 times the MediShield Life limit per month for cancer treatment, costing $36/year",
      "Unlimited cancer treatment coverage for $72/year",
      "50% co-insurance waiver for oncology treatments for $48/year"
    ],
    correct: 1,
    explanation: "The Cancer Booster Rider provides 16 times the MediShield Life limit per month, significantly boosting cancer treatment coverage. At just $36/year, it is one of the most affordable add-ons for meaningful coverage enhancement.",
    category: 'product-facts'
  },

  {
    question: "What is the CTGTP (Cell, Tissue and Gene Therapy Products) coverage, and how do listed vs non-listed treatments differ?",
    options: [
      "$250,000 for listed treatments and $150,000 for non-listed treatments, per indication per lifetime",
      "$500,000 for all CTGTP treatments with no distinction",
      "$100,000 for listed and $50,000 for non-listed treatments",
      "$150,000 for listed and $250,000 for non-listed treatments"
    ],
    correct: 0,
    explanation: "Listed CTGTP treatments are covered up to $250,000 per indication per lifetime, while non-listed treatments have a lower limit of $150,000. This benefit becomes effective from October 2025 and covers frontier treatments like CAR-T cell therapy.",
    category: 'product-facts'
  },

  {
    question: "What is the pre- and post-hospitalization coverage period for each HealthShield Gold Max plan tier?",
    options: [
      "Plan A: 13 months, Plan B: 180 days, Plan B Lite: 100 days",
      "All plans: 180 days",
      "Plan A: 12 months, Plan B: 6 months, Plan B Lite: 90 days",
      "Plan A: 6 months, Plan B: 100 days, Plan B Lite: 60 days"
    ],
    correct: 0,
    explanation: "Plan A offers the longest pre/post-hospitalization coverage at 13 months (the longest in the Singapore market). Plan B provides 180 days, and Plan B Lite provides 100 days.",
    category: 'product-facts'
  },

  {
    question: "Can MediSave be used to pay for rider premiums such as VitalHealth?",
    options: [
      "Yes, MediSave covers both base plan and rider premiums",
      "Yes, but only for the first 5 years of the rider",
      "No, rider premiums must be paid entirely in cash",
      "Yes, but only for policyholders aged 65 and above"
    ],
    correct: 2,
    explanation: "Rider premiums (such as VitalHealth or Cancer Care Rider) must be paid entirely in cash. MediSave can only be used for the base Integrated Shield Plan premium, up to the applicable AWL limit.",
    category: 'product-facts'
  },

  {
    question: "What is the restriction period when switching from one Integrated Shield Plan to another?",
    options: [
      "30 days",
      "60 days",
      "90 days",
      "40 days"
    ],
    correct: 3,
    explanation: "There is a 40-day restriction period when switching ISP providers. During this window, the new insurer may not cover certain conditions that arise, creating a coverage gap that prospects should understand before switching.",
    category: 'product-facts'
  },

  {
    question: "What is the standard moratorium period for pre-existing conditions, and what does it mean?",
    options: [
      "3 years -- after which all conditions are automatically covered",
      "5 years -- after which pre-existing conditions may be covered if no symptoms or treatment occurred during that period",
      "7 years -- conditions are excluded permanently until the moratorium expires",
      "10 years -- only applies to cancer and heart disease"
    ],
    correct: 1,
    explanation: "The standard moratorium period is 5 years. If the policyholder experiences no symptoms, treatment, or consultation related to the pre-existing condition during this 5-year window, the condition may then be covered under the plan.",
    category: 'product-facts'
  },

  // ══════════════════════════════════════════
  // SALES ANGLES (10 questions)
  // ══════════════════════════════════════════

  {
    question: "When presenting HealthShield Gold Max to a young adult, what everyday comparison is recommended for framing the Plan A premium?",
    options: [
      "A monthly gym membership ($50-60/month)",
      "Daily breakfast cost -- $80-90/month works out to about $2.50-$3/day",
      "A weekly movie ticket ($15-20/week)",
      "Monthly Netflix subscription ($15/month)"
    ],
    correct: 1,
    explanation: "Comparing $80-90/month to the daily cost of breakfast ($2.50-$3/day) makes private hospital coverage feel manageable and relatable. It reframes what sounds like a significant monthly expense into a negligible daily one.",
    category: 'sales-angles'
  },

  {
    question: "What is the most compelling argument when pitching to self-employed prospects?",
    options: [
      "Self-employed people get special premium discounts from AIA",
      "Self-employed professionals can claim ISP premiums as business expenses",
      "No employer coverage means they bear 100% of medical costs -- an ISP is their safety net against catastrophic bills that could shut down their business",
      "Corporate plans are always inferior to individual ISPs"
    ],
    correct: 2,
    explanation: "Self-employed individuals lack the employer medical benefits that employees take for granted. A single hospitalization could both generate massive bills AND force business closure, making an ISP essential as a financial safety net.",
    category: 'sales-angles'
  },

  {
    question: "When comparing AIA to key competitors, which four data points should you have ready?",
    options: [
      "Premium rates, cash value, investment returns, and bonus rates",
      "Annual limits, lifetime limits, AQHP panel size, and pre/post-hospitalization period",
      "Waiting periods, exclusion lists, rider names, and premium payment modes",
      "Agent commission rates, claim settlement time, customer reviews, and branch count"
    ],
    correct: 1,
    explanation: "The four key comparison points where AIA leads are: annual limit ($2M vs lower), lifetime limit (unlimited vs capped), AQHP panel (500+ vetted specialists), and pre/post-hospitalization (13 months -- longest in market).",
    category: 'sales-angles'
  },

  {
    question: "What is the recommended framing when discussing ISP premiums as a 'pure expense'?",
    options: [
      "Emphasize that premiums are tax-deductible for most policyholders",
      "Compare to vacation spending to put the cost in perspective",
      "Show how premiums decrease over time as claims are made",
      "Acknowledge premiums are a sunk cost, then present a dividend portfolio at 6% yield as a strategy to make premiums self-funding over time"
    ],
    correct: 3,
    explanation: "The field-tested approach is to acknowledge the pain point (premiums are a pure expense), then pivot to the solution: building a dividend-generating portfolio at 6% yield that eventually covers annual ISP premiums without depleting the capital.",
    category: 'sales-angles'
  },

  {
    question: "What closing angle works best for prospects who currently have only MediShield Life?",
    options: [
      "MediShield Life premiums will increase faster than ISP premiums",
      "MediShield Life is being phased out by the government",
      "MediShield Life does not cover any outpatient treatments",
      "MediShield Life caps at B2/C wards -- one serious illness in a private hospital could cost tens of thousands out of pocket beyond those limits"
    ],
    correct: 3,
    explanation: "The gap between MediShield Life's B2/C ward coverage and actual private hospital costs is the most powerful argument. A single surgery can cost $50K-$100K beyond what MediShield Life covers, making the gap tangible and urgent.",
    category: 'sales-angles'
  },

  {
    question: "How should you position AIA's unlimited lifetime limit against competitors with capped limits?",
    options: [
      "It only matters for very wealthy clients who want premium coverage",
      "Focus on annual limits instead since lifetime limits rarely matter",
      "Capped limits like $3-5M are sufficient for most people in practice",
      "With rising medical costs, a $3-5M cap could be exhausted by one chronic condition over 20+ years -- unlimited means true lifetime protection"
    ],
    correct: 3,
    explanation: "Chronic conditions like cancer or kidney disease can accumulate millions in treatment costs over decades. A capped lifetime limit could run dry, leaving the policyholder unprotected when they need coverage most. Unlimited means the policy never runs out.",
    category: 'sales-angles'
  },

  {
    question: "What is the 'delay cost' messaging used in field sales to create urgency?",
    options: [
      "Premiums double every 5 years of delay",
      "Coverage reduces by 10% for each year the prospect waits",
      "Each year of delay costs approximately 5% more in premiums, and any conditions developed during the delay may be permanently excluded",
      "A 2-year exclusion period is added for every year of delay"
    ],
    correct: 2,
    explanation: "The 5% annual delay cost is factual (age-banded premium increases) and combining it with the insurability risk (conditions developed while uninsured become pre-existing) creates genuine urgency without being pushy.",
    category: 'sales-angles'
  },

  {
    question: "How should the Cancer Care Rider be positioned during a sales conversation?",
    options: [
      "It is mandatory for all HealthShield Gold Max plans",
      "It replaces the need for a separate critical illness policy",
      "It is only relevant for people with a family history of cancer",
      "At $36/year (less than a single meal), it significantly boosts cancer treatment coverage -- making it a no-brainer add-on"
    ],
    correct: 3,
    explanation: "The $36/year price point makes the Cancer Care Rider an easy yes. Comparing it to a meal cost eliminates any price objection, and cancer being the leading cause of death in Singapore makes the relevance clear.",
    category: 'sales-angles'
  },

  {
    question: "What is the recommended approach when presenting Plan A vs Plan B to a cost-conscious prospect?",
    options: [
      "Always push Plan A regardless of the prospect's budget",
      "Recommend Plan B Lite to save the maximum amount of money",
      "Suggest they skip the rider to keep costs down",
      "Show that the Plan A upgrade costs only $50-60/month more than Plan B for double the annual limit ($2M vs $1M) and private hospital access"
    ],
    correct: 3,
    explanation: "Framing the Plan A upgrade as just $50-60/month for double the coverage ($2M vs $1M) and private hospital access makes it feel like an affordable step-up rather than a major expense.",
    category: 'sales-angles'
  },

  {
    question: "When selling to parents for their children, what is the primary value proposition?",
    options: [
      "Children receive higher annual claim limits than adults",
      "Pediatric conditions are always fully covered without exclusions",
      "Children do not need the VitalHealth rider, saving money",
      "Lock in coverage at the lowest possible premiums and guarantee lifelong insurability before any conditions develop"
    ],
    correct: 3,
    explanation: "Insuring children early locks in extremely low premiums based on the youngest age band and guarantees full insurability. Any conditions developed later in life will not affect their existing coverage, making early enrollment a strategic advantage.",
    category: 'sales-angles'
  },

  // ══════════════════════════════════════════
  // OBJECTION HANDLING (8 questions)
  // ══════════════════════════════════════════

  {
    question: "A prospect says: 'I already have MediShield Life -- that should be enough.' How should you respond?",
    options: [
      "Tell them MediShield Life is being discontinued soon",
      "Explain the coverage gap: MediShield Life covers B2/C wards with a $200K annual limit, and a single private hospital surgery can cost $50K-$100K beyond those limits",
      "Agree that MediShield Life is sufficient for most people",
      "Show competitor ISP plans instead of AIA's offering"
    ],
    correct: 1,
    explanation: "Quantify the gap rather than making abstract arguments. MediShield Life's B2/C ward coverage leaves massive exposure for anyone who needs private hospital care. Real surgery cost examples make the shortfall tangible.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'My company already covers my medical expenses.' What is the best counter?",
    options: [
      "Tell them corporate coverage is always insufficient",
      "Agree and close the conversation",
      "Ask what happens when they change jobs, get retrenched, or retire -- corporate coverage ends immediately, and buying at an older age means higher premiums and possible exclusions",
      "Suggest they wait until they leave their company to get coverage"
    ],
    correct: 2,
    explanation: "Corporate coverage is temporary -- it ends the moment employment ends. The key insight: buying personal coverage now locks in younger premiums and full insurability. Waiting until corporate coverage ends means entering at higher premiums with potential exclusions.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'I can self-insure -- I have enough savings.' What is the strongest counter?",
    options: [
      "Ask if they have factored in $171K-$412K in lifetime hospital costs, plus the risk of one catastrophic event wiping out years of savings that could otherwise grow through investments",
      "Tell them their savings are not enough no matter how much they have",
      "Agree that self-insurance is a valid approach for wealthy individuals",
      "Show them the cheapest plan to minimize the premium expense"
    ],
    correct: 0,
    explanation: "Quantify the lifetime cost ($171K-$412K in premiums alone) and frame the opportunity cost. Money spent on medical bills cannot compound in investments. Insurance preserves wealth; self-insuring depletes it.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'I'm young and healthy -- I don't need this yet.' What is the strongest counter?",
    options: [
      "Show them cancer statistics for young adults to scare them",
      "Agree and recommend they come back at age 40",
      "That is exactly when they should get it -- premiums are lowest now, and any condition developed later becomes pre-existing and may be excluded or loaded permanently",
      "Young people never get hospitalized so the premium is wasted"
    ],
    correct: 2,
    explanation: "Youth and health are depreciating assets when it comes to insurance. Current health locks in the lowest premiums and broadest coverage. Once conditions develop, the window for full coverage narrows or closes permanently.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'The 10% co-insurance means I'm still paying a lot out of pocket.' How do you address this?",
    options: [
      "The VitalHealth rider reduces it to 5% with a $3,000/year cap -- so on a $100K bill, the maximum out-of-pocket is $3,000 instead of $10,000",
      "Recommend they skip insurance entirely if they are worried about out-of-pocket costs",
      "Tell them co-insurance is unavoidable across all insurers",
      "Say the co-insurance rarely applies in real claims"
    ],
    correct: 0,
    explanation: "The VitalHealth rider transforms the co-insurance concern from a potentially large open-ended cost (10% of a big bill) into a predictable, capped expense (5% with a $3,000 annual ceiling). On a $100K bill, that is $3,000 vs $10,000.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'My friend claimed and AIA only paid 85%. That does not seem fair.' How should you explain?",
    options: [
      "Deny that this ever happens with AIA policies",
      "Blame the friend for making a bad choice",
      "Say that 85% proration is standard across all insurance companies",
      "Explain the 85% was likely proration for not using an AQHP doctor or getting pre-authorization -- with either option, claims are paid at 100% of eligible amounts"
    ],
    correct: 3,
    explanation: "This is almost certainly a proration issue. Educating the prospect about AQHP and pre-authorization turns a complaint into a positive -- AIA offers clear paths to 100% claim settlement, and the 500+ doctor panel makes it easy to avoid proration.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'I have pre-existing conditions, so I will probably be rejected.' What should you say?",
    options: [
      "Confirm that they will likely face permanent exclusions",
      "Tell them to omit their conditions from the application",
      "Suggest waiting until their conditions resolve before applying",
      "Explain the 5-year moratorium: after 5 years without symptoms or treatment, pre-existing conditions can be covered. Also, MediShield Life already covers pre-existing conditions as a base layer"
    ],
    correct: 3,
    explanation: "The moratorium mechanism offers genuine hope -- pre-existing conditions are not permanent exclusions. Additionally, MediShield Life (the compulsory base layer) covers pre-existing conditions from day one, providing an immediate safety net.",
    category: 'objection-handling'
  },

  {
    question: "A prospect says: 'The $3,500 deductible is too high -- I am paying a premium AND a deductible?' How do you handle this?",
    options: [
      "Tell them to choose a plan without any deductible",
      "Explain that deductibles are optional and can be waived",
      "Reframe: on a $100K bill, they pay $3,500 deductible plus 5% co-insurance (capped at $3,000 with VitalHealth) for a maximum of $6,500 total. Without insurance, they pay the full $100K.",
      "Agree that the deductible is excessive compared to competitors"
    ],
    correct: 2,
    explanation: "The contrast between $6,500 maximum out-of-pocket and a $100,000 uninsured bill makes the deductible feel insignificant. Walking through a real dollar example cuts through the abstract objection and makes the value concrete.",
    category: 'objection-handling'
  },

  // ══════════════════════════════════════════
  // ROLEPLAY (6 questions)
  // ══════════════════════════════════════════

  {
    question: "Scenario: A 28-year-old earning $5,000/month says they are healthy and do not need insurance. What is the best opening question?",
    options: [
      "Start by showing them the Plan A premium schedule",
      "Tell them they are being irresponsible about their health",
      "'If you were diagnosed with something serious tomorrow, how would you pay a $50K hospital bill without touching your savings or career plans?'",
      "Show them cancer statistics for young adults in Singapore"
    ],
    correct: 2,
    explanation: "Creating a personal scenario linked to things they care about (savings and career trajectory) is more effective than statistics or product features. The question makes the abstract risk feel real and immediate.",
    category: 'roleplay'
  },

  {
    question: "Scenario: A prospect currently on a competitor plan with a $3M lifetime cap is considering switching to AIA. What risk must you flag?",
    options: [
      "AIA premiums are significantly higher than all competitors",
      "They will permanently lose all accumulated benefits from their current insurer",
      "The 40-day restriction period when switching means any condition developing during this window may not be covered by AIA",
      "Switching ISPs is never recommended under any circumstances"
    ],
    correct: 2,
    explanation: "The 40-day restriction period is the primary risk when switching ISPs. Being transparent about this coverage gap builds trust and lets the prospect make a fully informed decision, even though AIA's coverage is superior.",
    category: 'roleplay'
  },

  {
    question: "Scenario: A self-employed hawker earning $3,000/month says insurance is for rich people. How do you respond?",
    options: [
      "Recommend Plan A for the most comprehensive coverage possible",
      "Agree that it might not be for everyone at their income level",
      "Tell them they cannot afford NOT to have insurance",
      "Show that Plan B Lite costs about $25/month, partly payable with MediSave -- less than one day of earnings, but protects against a hospitalization that could force them to close their business"
    ],
    correct: 3,
    explanation: "Match the plan to their budget (Plan B Lite), use MediSave to reduce cash outlay, and connect the risk to their specific situation -- business closure during hospitalization. This makes coverage feel both affordable and essential.",
    category: 'roleplay'
  },

  {
    question: "Scenario: A couple in their 40s with two young children asks why they should upgrade from MediShield Life. What angle should you lead with?",
    options: [
      "Focus on the investment returns of the premium over time",
      "Show the detailed competitor comparison chart first",
      "Explain the full policy administration and claims process",
      "'If one of you was hospitalized for 2 weeks, could the family handle a $30K-$50K bill while also losing income? An ISP keeps your savings intact for your children's needs.'"
    ],
    correct: 3,
    explanation: "For parents, the dual concern is medical costs AND family financial stability. Connecting hospitalization costs to their children's wellbeing creates emotional resonance that product features alone cannot achieve.",
    category: 'roleplay'
  },

  {
    question: "Scenario: A prospect asks you to compare Plan A with VitalHealth vs Plan A with VitalHealth A Value. What is the key difference to highlight?",
    options: [
      "The Value variant has a lower annual claim limit",
      "The Value variant excludes cancer treatment coverage",
      "The Value variant has a higher co-insurance cap ($6,000 vs $3,000/year) but saves approximately $1,400/year -- same base Plan A coverage with a different out-of-pocket ceiling",
      "The Value variant has a longer waiting period for all conditions"
    ],
    correct: 2,
    explanation: "The only meaningful difference is the annual co-insurance cap: $6,000 vs $3,000. For prospects who claim infrequently, the $1,400/year premium savings outweigh the higher cap. This makes Value the ideal option for healthy policyholders on a budget.",
    category: 'roleplay'
  },

  {
    question: "Scenario: A prospect who just recovered from minor surgery asks if their claim will trigger the Waiver Pass penalty. What should you explain?",
    options: [
      "Every claim automatically triggers the additional $2,000 deductible",
      "The Waiver Pass only applies to Plan A policyholders",
      "Claims under $5,000 never trigger any additional penalties",
      "The first claim has no penalty. Only a second claim within 36 months adds the $2,000 extra deductible. After 36 months without claims, the Waiver Pass resets completely."
    ],
    correct: 3,
    explanation: "Clearly explaining the three-part Waiver Pass mechanism (first claim free, second within 36 months adds $2,000, reset after 36 months) removes anxiety about claiming and shows the system is reasonable rather than punitive.",
    category: 'roleplay'
  }

];
