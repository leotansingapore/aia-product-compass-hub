import type { StudyQuestion } from './proAchieverStudyBank';

export const solitairePaStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (45 questions) -- Q1-Q45
  // ============================================================

  // Q1 -- correct: 2
  {
    question: "What is the maximum payout for severe disability or dismemberment under AIA Solitaire PA?",
    options: [
      "Up to S$1.5 million",
      "Up to S$2 million",
      "Up to S$2.25 million",
      "Up to S$3 million"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA provides up to S$2.25 million for severe disability or dismemberment under the highest plan.",
    category: 'product-facts'
  },

  // Q2 -- correct: 0
  {
    question: "Up to what age can AIA Solitaire PA provide coverage?",
    options: [
      "Up to 80 years old",
      "Up to 75 years old",
      "Up to 70 years old",
      "Up to 65 years old"
    ],
    correct: 0,
    explanation: "AIA Solitaire PA offers extended age coverage up to 80 years old, which is broader than many competing products.",
    category: 'product-facts'
  },

  // Q3 -- correct: 3
  {
    question: "How many plan options does AIA Solitaire PA offer?",
    options: [
      "Two plans",
      "Three plans",
      "Five plans",
      "Four plans"
    ],
    correct: 3,
    explanation: "AIA Solitaire PA offers four plan options (Plan 1 through Plan 4), ranging from basic to comprehensive coverage.",
    category: 'product-facts'
  },

  // Q4 -- correct: 1
  {
    question: "What is the annual premium for Plan 1 of AIA Solitaire PA?",
    options: [
      "$200/year",
      "$224/year",
      "$250/year",
      "$300/year"
    ],
    correct: 1,
    explanation: "Plan 1 costs $224/year, which works out to approximately $20/month or 62 cents per day.",
    category: 'product-facts'
  },

  // Q5 -- correct: 0
  {
    question: "What is the accidental death payout under Plan 1?",
    options: [
      "$100,000",
      "$200,000",
      "$300,000",
      "$500,000"
    ],
    correct: 0,
    explanation: "Plan 1 provides $100,000 for accidental death. The major dismemberment payout under Plan 1 is $300,000.",
    category: 'product-facts'
  },

  // Q6 -- correct: 2
  {
    question: "What is the accidental death payout under Plan 4?",
    options: [
      "$500,000",
      "$600,000",
      "$750,000",
      "$1,000,000"
    ],
    correct: 2,
    explanation: "Plan 4 provides $750,000 for accidental death, with major dismemberment coverage of $2.25 million.",
    category: 'product-facts'
  },

  // Q7 -- correct: 1
  {
    question: "What is the major dismemberment payout under Plan 4?",
    options: [
      "$1.5 million",
      "$2.25 million",
      "$2 million",
      "$3 million"
    ],
    correct: 1,
    explanation: "Plan 4 provides up to $2.25 million for major dismemberment, which is 7.5 times the Plan 1 coverage.",
    category: 'product-facts'
  },

  // Q8 -- correct: 3
  {
    question: "What is the annual premium for Plan 4 of AIA Solitaire PA?",
    options: [
      "$700/year",
      "$800/year",
      "$900/year",
      "$855/year"
    ],
    correct: 3,
    explanation: "Plan 4 costs $855/year, approximately $70/month or about $2.35 per day.",
    category: 'product-facts'
  },

  // Q9 -- correct: 0
  {
    question: "What does Feature 5 (double payout) cover under AIA Solitaire PA?",
    options: [
      "Death due to public or private transport accidents",
      "Death due to natural disasters only",
      "Death due to terrorism only",
      "Death while overseas"
    ],
    correct: 0,
    explanation: "Feature 5 provides a double payout for death caused by public or private transport accidents, potentially doubling the accidental death benefit.",
    category: 'product-facts'
  },

  // Q10 -- correct: 2
  {
    question: "Under Plan 4, what is the maximum payout if death occurs in a public transport accident (with Feature 5)?",
    options: [
      "$750,000",
      "$1,000,000",
      "$1,500,000",
      "$2,250,000"
    ],
    correct: 2,
    explanation: "Feature 5 doubles the accidental death payout: $750,000 + $750,000 = $1,500,000 for public/private transport death under Plan 4.",
    category: 'product-facts'
  },

  // Q11 -- correct: 1
  {
    question: "What is the medical reimbursement limit per accident under Feature 6?",
    options: [
      "Up to $3,000",
      "Up to $5,000",
      "Up to $10,000",
      "Up to $8,000"
    ],
    correct: 1,
    explanation: "Feature 6 provides up to $5,000 in medical reimbursement per accident, with unlimited claims throughout the policy year.",
    category: 'product-facts'
  },

  // Q12 -- correct: 3
  {
    question: "How many times can you claim medical reimbursement under Feature 6 in a year?",
    options: [
      "Once per year",
      "Twice per year",
      "Up to five times per year",
      "Unlimited claims"
    ],
    correct: 3,
    explanation: "Feature 6 allows unlimited medical reimbursement claims, making it the most commonly used feature of the policy.",
    category: 'product-facts'
  },

  // Q13 -- correct: 0
  {
    question: "Which features of AIA Solitaire PA provide lump sum payouts?",
    options: [
      "Features 1 to 5",
      "Features 1 to 3 only",
      "Features 6 and 7 only",
      "All features"
    ],
    correct: 0,
    explanation: "Features 1 through 5 provide lump sum payouts covering death, dismemberment, TPD, burns, and double transport payout.",
    category: 'product-facts'
  },

  // Q14 -- correct: 2
  {
    question: "What does Feature 7 of AIA Solitaire PA cover?",
    options: [
      "Hospital cash benefit",
      "Disability income",
      "TCM and chiropractor treatments",
      "Dental expenses"
    ],
    correct: 2,
    explanation: "Feature 7 covers Traditional Chinese Medicine (TCM) and chiropractor treatments with a separate limit from the main medical reimbursement.",
    category: 'product-facts'
  },

  // Q15 -- correct: 1
  {
    question: "What is the renewal bonus percentage per claim-free year on Features 1-5?",
    options: [
      "3% per year",
      "5% per year",
      "10% per year",
      "7% per year"
    ],
    correct: 1,
    explanation: "The renewal bonus increases Features 1-5 by 5% per year for each claim-free year, up to a maximum of 6 years.",
    category: 'product-facts'
  },

  // Q16 -- correct: 3
  {
    question: "What is the maximum total renewal bonus that can accumulate on Features 1-5?",
    options: [
      "10%",
      "15%",
      "25%",
      "30%"
    ],
    correct: 3,
    explanation: "The renewal bonus accumulates at 5% per year for a maximum of 6 years, reaching a total of 30%.",
    category: 'product-facts'
  },

  // Q17 -- correct: 0
  {
    question: "What condition must be met to maintain the renewal bonus?",
    options: [
      "No claims under Feature 4 (burns/scalds)",
      "No claims under any feature",
      "No claims under Feature 6 (medical reimbursement)",
      "Continuous premium payment without lapses"
    ],
    correct: 0,
    explanation: "The renewal bonus on Features 1-5 is maintained as long as there are no claims under Feature 4. Claims under other features do not affect it.",
    category: 'product-facts'
  },

  // Q18 -- correct: 1
  {
    question: "Is a medical checkup required to apply for AIA Solitaire PA?",
    options: [
      "Yes, a full medical examination is required",
      "No, no medical checkups are required",
      "Only for applicants above age 50",
      "Only for Plan 3 and Plan 4"
    ],
    correct: 1,
    explanation: "AIA Solitaire PA does not require any medical checkups for application, making the enrollment process simple and fast.",
    category: 'product-facts'
  },

  // Q19 -- correct: 2
  {
    question: "What verification method is used during the AIA Solitaire PA application process?",
    options: [
      "NRIC verification at AIA branch",
      "Video call verification",
      "SingPass verification",
      "Email verification only"
    ],
    correct: 2,
    explanation: "The application process uses SingPass verification, followed by quotation generation and submission.",
    category: 'product-facts'
  },

  // Q20 -- correct: 0
  {
    question: "Is a Financial Health Review (FHR) required for AIA Solitaire PA?",
    options: [
      "No, FHR is not required",
      "Yes, FHR is mandatory",
      "Only for premiums above $500/year",
      "Only for Plan 4"
    ],
    correct: 0,
    explanation: "No Financial Health Review is required for AIA Solitaire PA, which simplifies the application process significantly.",
    category: 'product-facts'
  },

  // Q21 -- correct: 3
  {
    question: "What is the approximate daily cost of Plan 1?",
    options: [
      "$1.00 per day",
      "$0.80 per day",
      "$0.50 per day",
      "$0.62 per day"
    ],
    correct: 3,
    explanation: "Plan 1 at $224/year works out to approximately 62 cents per day -- cheaper than an MRT fare or a cup of coffee.",
    category: 'product-facts'
  },

  // Q22 -- correct: 1
  {
    question: "What is the approximate daily cost of Plan 2?",
    options: [
      "$0.80 per day",
      "About $1 per day",
      "$1.50 per day",
      "$2.00 per day"
    ],
    correct: 1,
    explanation: "Plan 2 at $365/year costs about $1 per day, or approximately $30/month.",
    category: 'product-facts'
  },

  // Q23 -- correct: 2
  {
    question: "What is the annual premium for Plan 2 of AIA Solitaire PA?",
    options: [
      "$300/year",
      "$350/year",
      "$365/year",
      "$400/year"
    ],
    correct: 2,
    explanation: "Plan 2 costs $365/year, which is approximately $30/month or about $1 per day.",
    category: 'product-facts'
  },

  // Q24 -- correct: 0
  {
    question: "Which of the following is covered under AIA Solitaire PA's definition of 'accident'?",
    options: [
      "Food poisoning",
      "Heart attack",
      "Self-inflicted injuries",
      "Chronic back pain"
    ],
    correct: 0,
    explanation: "AIA Solitaire PA covers food poisoning as it is unexpected and unintentional. Self-inflicted injuries and illnesses like heart attacks are not covered.",
    category: 'product-facts'
  },

  // Q25 -- correct: 3
  {
    question: "Which of the following is NOT covered under AIA Solitaire PA?",
    options: [
      "Insect bites including dengue",
      "Drowning incidents",
      "Assault and violence",
      "Self-inflicted injuries"
    ],
    correct: 3,
    explanation: "Self-inflicted injuries are excluded. An accident must be unexpected and unintentional to qualify for coverage.",
    category: 'product-facts'
  },

  // Q26 -- correct: 1
  {
    question: "Does AIA Solitaire PA cover injuries from amateur or recreational sports?",
    options: [
      "No, sports injuries are excluded",
      "Yes, amateur and recreational sports injuries are covered",
      "Only if the sport is played in Singapore",
      "Only team sports are covered"
    ],
    correct: 1,
    explanation: "AIA Solitaire PA covers injuries sustained during amateur and recreational sports activities.",
    category: 'product-facts'
  },

  // Q27 -- correct: 2
  {
    question: "Does AIA Solitaire PA provide coverage outside of Singapore?",
    options: [
      "Only in ASEAN countries",
      "Only in Asia-Pacific",
      "Yes, it provides global coverage 24/7",
      "No, Singapore only"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA provides global coverage 24 hours a day, 7 days a week -- not limited to Singapore.",
    category: 'product-facts'
  },

  // Q28 -- correct: 0
  {
    question: "Which of the following events is covered under AIA Solitaire PA?",
    options: [
      "Terrorism and hijacking",
      "Participation in professional motorsports",
      "Injuries from military service",
      "Drug overdose"
    ],
    correct: 0,
    explanation: "AIA Solitaire PA covers injuries or death resulting from terrorism, hijacking, riots/strikes, and natural disasters.",
    category: 'product-facts'
  },

  // Q29 -- correct: 3
  {
    question: "What optional rider provides monthly payouts if the insured cannot perform daily activities?",
    options: [
      "Extended Medical Reimbursement",
      "Fracture Cover",
      "Critical Illness Rider",
      "Disability Income Benefit"
    ],
    correct: 3,
    explanation: "The Disability Income Benefit rider provides monthly payouts if the insured is unable to perform 2 or more Activities of Daily Living (ADLs).",
    category: 'product-facts'
  },

  // Q30 -- correct: 1
  {
    question: "How many Activities of Daily Living (ADLs) must the insured be unable to perform to claim the Disability Income Benefit?",
    options: [
      "1 or more ADLs",
      "2 or more ADLs",
      "3 or more ADLs",
      "4 or more ADLs"
    ],
    correct: 1,
    explanation: "The Disability Income Benefit pays out when the insured cannot perform 2 or more ADLs such as eating, washing, or walking.",
    category: 'product-facts'
  },

  // Q31 -- correct: 2
  {
    question: "For how long can the Disability Income Benefit provide monthly payouts?",
    options: [
      "Up to 5 years",
      "Up to 7 years",
      "Up to 10 years",
      "For life"
    ],
    correct: 2,
    explanation: "The optional Disability Income Benefit can provide monthly payouts for up to 10 years.",
    category: 'product-facts'
  },

  // Q32 -- correct: 0
  {
    question: "Which of the following are examples of Activities of Daily Living (ADLs) under the Disability Income Benefit?",
    options: [
      "Eating, washing, and walking",
      "Driving, cooking, and reading",
      "Working, exercising, and sleeping",
      "Shopping, cleaning, and gardening"
    ],
    correct: 0,
    explanation: "The ADLs referenced in the Disability Income Benefit include eating, washing, and walking.",
    category: 'product-facts'
  },

  // Q33 -- correct: 3
  {
    question: "What are the three optional riders available for AIA Solitaire PA?",
    options: [
      "Hospital Cash, Critical Illness, and Disability Income",
      "Outpatient Cover, Dental, and Vision",
      "Life Cover, Hospital Cash, and Fracture Cover",
      "Disability Income Benefit, Extended Medical Reimbursement, and Fracture Cover"
    ],
    correct: 3,
    explanation: "The three optional riders are Disability Income Benefit, Extended Medical Reimbursement, and Fracture Cover.",
    category: 'product-facts'
  },

  // Q34 -- correct: 1
  {
    question: "What loyalty benefits are available to AIA Vitality members with Solitaire PA?",
    options: [
      "Premium discounts only",
      "Bonuses and health screenings",
      "Free gym memberships",
      "Cashback on premiums"
    ],
    correct: 1,
    explanation: "AIA Vitality members enjoy loyalty benefits including bonuses and health screenings.",
    category: 'product-facts'
  },

  // Q35 -- correct: 0
  {
    question: "What is the approximate commission rate for AIA Solitaire PA?",
    options: [
      "About 30% of premiums",
      "About 20% of premiums",
      "About 40% of premiums",
      "About 15% of premiums"
    ],
    correct: 0,
    explanation: "Commission for AIA Solitaire PA is approximately 30% of premiums, and it recurs for the life of the policy.",
    category: 'product-facts'
  },

  // Q36 -- correct: 2
  {
    question: "How does the commission structure for AIA Solitaire PA work?",
    options: [
      "First-year commission only",
      "Commission for the first 5 years",
      "Recurring commission for life of the policy",
      "Flat fee per policy sold"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA pays approximately 30% recurring commission for the life of the policy, providing ongoing income for advisors.",
    category: 'product-facts'
  },

  // Q37 -- correct: 1
  {
    question: "What is the approximate monthly premium for Plan 3?",
    options: [
      "$40/month",
      "$50/month",
      "$60/month",
      "$55/month"
    ],
    correct: 1,
    explanation: "Plan 3 costs approximately $600/year or $50/month.",
    category: 'product-facts'
  },

  // Q38 -- correct: 3
  {
    question: "What app can policyholders use to self-claim for AIA Solitaire PA?",
    options: [
      "MySingLife app",
      "AIA Connect app",
      "AIA iService app",
      "AIA Plus app"
    ],
    correct: 3,
    explanation: "Policyholders can use the AIA Plus app for self-claiming, with the process taking approximately 5 minutes.",
    category: 'product-facts'
  },

  // Q39 -- correct: 0
  {
    question: "How long does the self-claiming process take on the AIA Plus app?",
    options: [
      "About 5 minutes",
      "About 15 minutes",
      "About 30 minutes",
      "About 1 hour"
    ],
    correct: 0,
    explanation: "The AIA Plus app enables a fast 5-minute self-claiming process, which is a key service advantage for policyholders.",
    category: 'product-facts'
  },

  // Q40 -- correct: 2
  {
    question: "Does AIA Solitaire PA cover injuries from natural disasters?",
    options: [
      "No, natural disasters are excluded",
      "Only earthquakes are covered",
      "Yes, natural disasters are covered",
      "Only if the policyholder is in Singapore"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA covers injuries and death from natural disasters as part of its comprehensive accident protection.",
    category: 'product-facts'
  },

  // Q41 -- correct: 1
  {
    question: "Which feature of AIA Solitaire PA is most commonly used by policyholders?",
    options: [
      "Feature 1 (Accidental Death)",
      "Feature 6 (Medical Reimbursement)",
      "Feature 5 (Double Transport Payout)",
      "Feature 7 (TCM & Chiropractor)"
    ],
    correct: 1,
    explanation: "Feature 6 (Medical Reimbursement) is the most commonly used feature, providing up to $5,000 per accident with unlimited claims.",
    category: 'product-facts'
  },

  // Q42 -- correct: 3
  {
    question: "What is the price multiplier from Plan 1 to Plan 4?",
    options: [
      "2x the price",
      "5x the price",
      "4.5x the price",
      "3.8x the price"
    ],
    correct: 3,
    explanation: "Going from Plan 1 to Plan 4 is 3.8 times the price, but provides 7.5 times the coverage -- a key value argument.",
    category: 'product-facts'
  },

  // Q43 -- correct: 0
  {
    question: "What is the coverage multiplier from Plan 1 to Plan 4?",
    options: [
      "7.5x the coverage",
      "5x the coverage",
      "3.8x the coverage",
      "10x the coverage"
    ],
    correct: 0,
    explanation: "Plan 4 provides 7.5 times the coverage of Plan 1 (from $300K to $2.25M dismemberment) while only costing 3.8 times the price.",
    category: 'product-facts'
  },

  // Q44 -- correct: 2
  {
    question: "Does AIA Solitaire PA cover insect bites, including dengue?",
    options: [
      "No, insect bites are not covered",
      "Only mosquito bites causing hospitalization",
      "Yes, insect bites including dengue are covered",
      "Only if treatment is sought within 24 hours"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA covers insect bites including dengue as these are unexpected and unintentional events.",
    category: 'product-facts'
  },

  // Q45 -- correct: 1
  {
    question: "What does AIA Solitaire PA cover for burns?",
    options: [
      "Only third-degree burns",
      "Burns and scalds as a lump sum payout under Features 1-5",
      "Burns only if hospitalized for more than 3 days",
      "Burns are not covered"
    ],
    correct: 1,
    explanation: "Burns coverage is included as a lump sum payout under the first five features of the policy, including Feature 4 specifically for burns.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (30 questions) -- Q46-Q75
  // ============================================================

  // Q46 -- correct: 2
  {
    question: "What is the key positioning of AIA Solitaire PA relative to a hospital plan?",
    options: [
      "It replaces the hospital plan entirely",
      "It provides the same coverage as a hospital plan",
      "Hospital plan covers inpatient; accident plan covers outpatient",
      "It is cheaper than a hospital plan so it is a better value"
    ],
    correct: 2,
    explanation: "The key positioning is: 'Hospital plan is inpatient. Accident plan is outpatient.' They complement each other.",
    category: 'sales-angles'
  },

  // Q47 -- correct: 0
  {
    question: "In the 'KK Hospital Story', why was the child's treatment not covered by the family's health insurance?",
    options: [
      "Because the stitches were done as outpatient treatment",
      "Because the child was too young for coverage",
      "Because the hospital was not in-network",
      "Because the injury was self-inflicted"
    ],
    correct: 0,
    explanation: "The child needed stitches at KK Hospital but it was an outpatient visit, and hospital plans only cover inpatient stays. This is where an accident plan fills the gap.",
    category: 'sales-angles'
  },

  // Q48 -- correct: 3
  {
    question: "What types of outpatient treatments does the accident plan cover that a hospital plan would not?",
    options: [
      "Annual health screenings",
      "Routine dental checkups",
      "Chronic disease management",
      "Stitches, fractures, chiropractor, and physiotherapist visits"
    ],
    correct: 3,
    explanation: "Accident plans cover outpatient treatments like stitches, fractures, chiropractor visits, and physiotherapy -- treatments not covered by inpatient hospital plans.",
    category: 'sales-angles'
  },

  // Q49 -- correct: 1
  {
    question: "How should an advisor position AIA Solitaire PA in relation to existing life and hospital plans?",
    options: [
      "As a replacement for both plans",
      "As a complement that fills the gap between hospital and life plans",
      "As a cheaper alternative to life insurance",
      "As optional coverage only for high-risk individuals"
    ],
    correct: 1,
    explanation: "AIA Solitaire PA should be positioned as a complement that fills the gap -- hospital plans cover inpatient, life plans cover death/TPD, and PA covers the frequent minor accidents.",
    category: 'sales-angles'
  },

  // Q50 -- correct: 2
  {
    question: "What is the probability argument for selling PA coverage?",
    options: [
      "Death and TPD are the most likely events to happen",
      "Major hospitalization is the most common insurance claim",
      "Minor accidents have the highest probability and that is what PA covers",
      "PA covers events with the lowest probability but highest impact"
    ],
    correct: 2,
    explanation: "Death/TPD = very low probability. Major hospitalization = low probability. Minor accident = VERY HIGH probability. PA covers the most likely events.",
    category: 'sales-angles'
  },

  // Q51 -- correct: 0
  {
    question: "How does PA coverage compare to Death/TPD coverage in terms of claim threshold?",
    options: [
      "PA: one finger, one eye, one cut = claim. Death/TPD: must lose two limbs or two eyes.",
      "PA and Death/TPD have the same claim thresholds",
      "PA requires hospitalization; Death/TPD does not",
      "PA only covers total disability; Death/TPD covers partial"
    ],
    correct: 0,
    explanation: "PA has a much lower claim threshold -- losing one finger, one eye, or getting one cut qualifies for a claim. Death/TPD typically requires losing two arms, two legs, or two eyes.",
    category: 'sales-angles'
  },

  // Q52 -- correct: 3
  {
    question: "How does the monthly cost of PA coverage compare to Death/TPD coverage?",
    options: [
      "PA costs $100-200/month; Death/TPD costs $20/month",
      "They cost about the same",
      "PA costs $50-100/month; Death/TPD costs $200-300/month",
      "PA starts from $20/month; Death/TPD costs $100-200/month"
    ],
    correct: 3,
    explanation: "PA coverage starts from just $20/month, while Death/TPD coverage typically costs $100-200/month. PA is much cheaper and much easier to claim.",
    category: 'sales-angles'
  },

  // Q53 -- correct: 1
  {
    question: "What is the recommended value argument when comparing Plan 1 to Plan 4?",
    options: [
      "Plan 4 is twice the price for twice the coverage",
      "Plan 4 is 3.8 times the price but 7.5 times the coverage -- look at the value, not the price",
      "Plan 4 is 10 times the price but worth it for peace of mind",
      "Plan 1 and Plan 4 have the same value per dollar"
    ],
    correct: 1,
    explanation: "The value argument is: 3.8x the price gets you 7.5x the coverage. The advisor should say 'Look at the value, not the price.'",
    category: 'sales-angles'
  },

  // Q54 -- correct: 2
  {
    question: "What daily spending comparisons should advisors use to frame the cost of Plan 1?",
    options: [
      "A Netflix subscription",
      "A taxi ride",
      "MRT fare, bubble tea, or coffee",
      "A meal at a restaurant"
    ],
    correct: 2,
    explanation: "Plan 1 costs about 62 cents a day -- cheaper than an MRT fare, bubble tea, or a cup of coffee. These familiar comparisons make the cost feel manageable.",
    category: 'sales-angles'
  },

  // Q55 -- correct: 0
  {
    question: "What is the recommended closing question for AIA Solitaire PA?",
    options: [
      "'Which plan do you prefer?'",
      "'Would you like to think about it?'",
      "'Do you want Plan 1 or no plan at all?'",
      "'Can I send you more information?'"
    ],
    correct: 0,
    explanation: "The recommended close is 'Which plan do you prefer?' -- an assumptive close that presents the decision as which plan, not whether to buy.",
    category: 'sales-angles'
  },

  // Q56 -- correct: 3
  {
    question: "In the recommended sales flow, what should come after positioning PA as a complement to existing plans?",
    options: [
      "Immediately ask which plan they prefer",
      "Compare daily costs to spending habits",
      "Discuss the application process",
      "Share stories and claim examples"
    ],
    correct: 3,
    explanation: "After positioning, the next step is to share stories and claim examples to make the coverage tangible and relatable.",
    category: 'sales-angles'
  },

  // Q57 -- correct: 1
  {
    question: "What is the AIA service advantage that advisors should highlight?",
    options: [
      "24/7 phone hotline with instant approval",
      "AIA Plus app with self-claiming in about 5 minutes",
      "Free annual medical checkups",
      "Dedicated claims manager for every policyholder"
    ],
    correct: 1,
    explanation: "The AIA Plus app allows self-claiming in approximately 5 minutes, which is a key service differentiator to highlight during the sales process.",
    category: 'sales-angles'
  },

  // Q58 -- correct: 2
  {
    question: "What is the correct order of the recommended sales flow?",
    options: [
      "Compare plans, break down daily cost, share stories, close",
      "Share stories, discuss application, compare plans, close",
      "Position as complement, share stories, highlight AIA service, compare plans, break down daily cost, close",
      "Highlight AIA service, compare plans, share stories, close"
    ],
    correct: 2,
    explanation: "The full flow: position as complement -> share stories -> highlight AIA service -> compare plans -> break down daily cost -> compare to daily spending -> close.",
    category: 'sales-angles'
  },

  // Q59 -- correct: 0
  {
    question: "Why is AIA Solitaire PA described as having 'very high closing rates'?",
    options: [
      "No FHR required, no medical checkups, simple SingPass application process",
      "It is the cheapest product on the market",
      "It provides the highest coverage in the industry",
      "It includes a money-back guarantee"
    ],
    correct: 0,
    explanation: "The simple process -- no FHR, no medical checkups, SingPass verification -- removes friction and leads to very high closing rates.",
    category: 'sales-angles'
  },

  // Q60 -- correct: 3
  {
    question: "When comparing Plan 2 cost, what is the most effective daily cost framing?",
    options: [
      "About $2 per day",
      "About $1.50 per day",
      "About 62 cents per day",
      "About $1 per day"
    ],
    correct: 3,
    explanation: "Plan 2 at $365/year costs about $1 per day. Advisors should frame it as 'about $1 a day' to make it feel accessible.",
    category: 'sales-angles'
  },

  // Q61 -- correct: 1
  {
    question: "What key phrase summarizes the difference between hospital plans and accident plans?",
    options: [
      "'Hospital plan covers everything; accident plan covers the rest'",
      "'Hospital plan is inpatient. Accident plan is outpatient.'",
      "'Hospital plan is expensive; accident plan is affordable'",
      "'Hospital plan is basic; accident plan is comprehensive'"
    ],
    correct: 1,
    explanation: "The key phrase is: 'Hospital plan is inpatient. Accident plan is outpatient.' This simple distinction clearly communicates the value of PA coverage.",
    category: 'sales-angles'
  },

  // Q62 -- correct: 0
  {
    question: "What is the daily cost of Plan 4 when broken down?",
    options: [
      "About $2.35 per day",
      "About $3.00 per day",
      "About $1.50 per day",
      "About $5.00 per day"
    ],
    correct: 0,
    explanation: "Plan 4 at $855/year works out to about $2.35 per day -- still cheaper than a bowl of cai fan or bubble tea.",
    category: 'sales-angles'
  },

  // Q63 -- correct: 2
  {
    question: "Why should advisors emphasize the value ratio rather than the absolute price of Plan 4?",
    options: [
      "Because Plan 4 is the cheapest option",
      "Because clients only care about price, not coverage",
      "Because paying 3.8x the price for 7.5x the coverage is excellent value",
      "Because Plan 4 has a lower commission rate"
    ],
    correct: 2,
    explanation: "The value argument is compelling: 3.8x the price yields 7.5x the coverage. Advisors should focus on value per dollar, not just the premium amount.",
    category: 'sales-angles'
  },

  // Q64 -- correct: 1
  {
    question: "What is the 'cai fan' argument used in selling AIA Solitaire PA?",
    options: [
      "That insurance is as essential as food",
      "That the daily cost of the plan is comparable to everyday items like cai fan, bubble tea, or MRT fare",
      "That eating cai fan saves money to afford insurance",
      "That the plan covers food poisoning from cai fan"
    ],
    correct: 1,
    explanation: "The 'cai fan' argument frames the daily premium cost as comparable to everyday spending -- making the cost feel negligible compared to the protection received.",
    category: 'sales-angles'
  },

  // Q65 -- correct: 3
  {
    question: "How should an advisor handle a client who already has a Death/TPD plan but no PA coverage?",
    options: [
      "Suggest they cancel their Death/TPD plan and switch to PA",
      "Tell them Death/TPD is enough and PA is unnecessary",
      "Wait until they have a claim before suggesting PA",
      "Explain that Death/TPD covers severe events while PA covers the frequent minor accidents at a fraction of the cost"
    ],
    correct: 3,
    explanation: "PA complements Death/TPD. Death/TPD covers severe events (very low probability), while PA covers minor accidents (very high probability) at a much lower cost.",
    category: 'sales-angles'
  },

  // Q66 -- correct: 0
  {
    question: "What makes AIA Solitaire PA an effective product for new advisors to sell?",
    options: [
      "Low price, no medical checkups, no FHR, simple application, high closing rate",
      "It has the highest commission in AIA's product range",
      "It requires extensive product knowledge to explain",
      "It is only sold through senior advisors"
    ],
    correct: 0,
    explanation: "The simple process (no FHR, no medical checkups, SingPass application), low price point, and high closing rates make it ideal for new advisors.",
    category: 'sales-angles'
  },

  // Q67 -- correct: 2
  {
    question: "What is the best approach when a client says they want to 'think about it'?",
    options: [
      "Give them a week and follow up",
      "Drop the conversation and move on",
      "Reframe with the daily cost comparison and ask which plan they prefer",
      "Offer a discount on the premium"
    ],
    correct: 2,
    explanation: "Reframe by comparing the daily cost to everyday expenses (62 cents to $2.35/day) and use the assumptive close: 'Which plan do you prefer?'",
    category: 'sales-angles'
  },

  // Q68 -- correct: 1
  {
    question: "Why is the recurring commission structure of AIA Solitaire PA attractive for advisors?",
    options: [
      "It provides a one-time large bonus",
      "The ~30% commission recurs for the life of the policy, building long-term income",
      "It pays commission only for the first 3 years",
      "The commission rate increases each year"
    ],
    correct: 1,
    explanation: "The approximately 30% recurring commission for the life of the policy creates a steady income stream for advisors as they build their client base.",
    category: 'sales-angles'
  },

  // Q69 -- correct: 0
  {
    question: "What role do claim stories play in the PA sales process?",
    options: [
      "They make the coverage tangible and help clients see themselves benefiting from the plan",
      "They are used to scare clients into buying",
      "They are optional and not part of the recommended flow",
      "They should only be shared after the client has signed up"
    ],
    correct: 0,
    explanation: "Claim stories and examples are step 2 in the sales flow because they make abstract coverage tangible and help clients relate to real scenarios.",
    category: 'sales-angles'
  },

  // Q70 -- correct: 3
  {
    question: "How should an advisor present the four plan options to maximize conversions?",
    options: [
      "Only present Plan 1 as the cheapest option",
      "Only present Plan 4 as the best option",
      "Present Plan 2 and Plan 3 only",
      "Compare all plans highlighting the 3.8x price vs 7.5x coverage ratio from Plan 1 to Plan 4"
    ],
    correct: 3,
    explanation: "Present all plans and highlight the value ratio -- 3.8x the price for 7.5x the coverage -- letting the client choose based on value, not just cost.",
    category: 'sales-angles'
  },

  // Q71 -- correct: 2
  {
    question: "What makes the AIA Solitaire PA application process a selling point?",
    options: [
      "It requires a 30-minute phone interview",
      "It must be done at an AIA branch",
      "SingPass verification, no medical checkups, no FHR -- quotation and submit",
      "It requires a medical examination and blood test"
    ],
    correct: 2,
    explanation: "The streamlined process -- SingPass verification, no medical checkups, no FHR -- makes it easy to close on the spot.",
    category: 'sales-angles'
  },

  // Q72 -- correct: 1
  {
    question: "When should an advisor bring up the AIA Plus app during the sales process?",
    options: [
      "Before discussing any plan details",
      "After sharing stories and before comparing plans -- as a service advantage",
      "Only after the client has signed up",
      "Only if the client asks about claims"
    ],
    correct: 1,
    explanation: "The AIA Plus app and 5-minute self-claiming should be highlighted as step 3 in the sales flow, after stories and before plan comparison.",
    category: 'sales-angles'
  },

  // Q73 -- correct: 0
  {
    question: "What is the strategic importance of the 'starts at just 62 cents a day' framing?",
    options: [
      "It anchors the cost to an amount so small it removes price as an objection",
      "It makes the product sound cheap and low quality",
      "It is only used for Plan 4",
      "It compares the cost to other insurance products"
    ],
    correct: 0,
    explanation: "Framing the cost at 62 cents per day makes it feel trivial compared to daily expenses, effectively removing price as a barrier to purchase.",
    category: 'sales-angles'
  },

  // Q74 -- correct: 3
  {
    question: "Why should advisors avoid only selling Plan 1?",
    options: [
      "Plan 1 has no medical reimbursement",
      "Plan 1 is being discontinued",
      "Plan 1 does not qualify for renewal bonuses",
      "Higher plans offer disproportionately more value -- 3.8x price for 7.5x coverage"
    ],
    correct: 3,
    explanation: "While Plan 1 is affordable, the jump to Plan 4 offers 7.5x the coverage for only 3.8x the price. Advisors should present the value comparison and let clients choose.",
    category: 'sales-angles'
  },

  // Q75 -- correct: 1
  {
    question: "What is the benefit of customizable coverage in AIA Solitaire PA for the sales conversation?",
    options: [
      "It makes the product more complicated to explain",
      "It allows advisors to tailor the plan to each client's needs and budget",
      "It means every client must buy all riders",
      "It only applies to Plan 4"
    ],
    correct: 1,
    explanation: "Customizable coverage with optional riders lets advisors match the plan to each client's specific needs and budget, increasing the chance of closing.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (25 questions) -- Q76-Q100
  // ============================================================

  // Q76 -- correct: 2
  {
    question: "A client says: 'I already have health insurance, so I do not need this.' What is the best response?",
    options: [
      "'You are right, health insurance covers everything.'",
      "'This plan is better than your health insurance.'",
      "'Health insurance covers illness. PA covers accidents, which are more frequent. PA also covers minor injuries, insect bites, and food poisoning. Together, you are fully protected.'",
      "'You should cancel your health insurance and get this instead.'"
    ],
    correct: 2,
    explanation: "The correct response differentiates between health insurance (illness, inpatient) and PA (accidents, outpatient) and positions them as complementary.",
    category: 'objection-handling'
  },

  // Q77 -- correct: 0
  {
    question: "A client says: 'I rarely get into accidents.' What is the best response?",
    options: [
      "'Accidents are unpredictable. Costs add up quickly. It is better to have it and not need it than to need it and not have it.'",
      "'You are probably right, maybe you do not need this.'",
      "'Everyone gets into accidents eventually.'",
      "'The statistics show you will definitely have an accident this year.'"
    ],
    correct: 0,
    explanation: "Acknowledge the client's point while reminding them that accidents are unpredictable and the cost of coverage is minimal compared to potential expenses.",
    category: 'objection-handling'
  },

  // Q78 -- correct: 3
  {
    question: "A client says: 'I cannot afford another insurance premium.' How should you respond?",
    options: [
      "'Then this product is not for you.'",
      "'You can always buy it later when you have more money.'",
      "'Let me show you our most expensive plan.'",
      "'Plan 1 starts at just 62 cents a day -- less than a cup of coffee. Can you afford NOT to have accident coverage?'"
    ],
    correct: 3,
    explanation: "Reframe the cost using daily spending comparisons to show how affordable the coverage is. Plan 1 at 62 cents/day is less than most daily expenses.",
    category: 'objection-handling'
  },

  // Q79 -- correct: 1
  {
    question: "A client says: 'My company provides group accident coverage.' What is the best response?",
    options: [
      "'Then you definitely do not need personal PA coverage.'",
      "'Company coverage usually ends when you leave the job. Personal PA stays with you regardless of employment changes.'",
      "'Company coverage is always better than personal coverage.'",
      "'You should check with HR before making any decisions.'"
    ],
    correct: 1,
    explanation: "Company group coverage is tied to employment. Personal PA provides continuous coverage regardless of job changes, and group plans often have lower limits.",
    category: 'objection-handling'
  },

  // Q80 -- correct: 2
  {
    question: "A client says: 'Insurance is a waste of money.' How should you respond?",
    options: [
      "'You are wrong, insurance is very important.'",
      "'I understand, let me move on to another product.'",
      "'Spending 62 cents a day to protect against unexpected accident costs is not a waste -- it is the cheapest form of protection you can get.'",
      "'Everyone says that until they need it.'"
    ],
    correct: 2,
    explanation: "Reframe by connecting the minimal daily cost to the tangible protection received, positioning PA as the most affordable form of financial protection.",
    category: 'objection-handling'
  },

  // Q81 -- correct: 0
  {
    question: "A client says: 'I will think about it and get back to you.' What is the best approach?",
    options: [
      "Reframe with daily cost, then ask 'Which plan do you prefer?' to guide toward a decision",
      "Say 'Sure, take your time' and end the conversation",
      "Pressure them to sign immediately",
      "Send them a follow-up email with more product details"
    ],
    correct: 0,
    explanation: "Use the daily cost reframe and the assumptive close 'Which plan do you prefer?' to help the client make a decision rather than delay.",
    category: 'objection-handling'
  },

  // Q82 -- correct: 3
  {
    question: "A client says: 'I am young and healthy, I do not need accident coverage.' What is the best response?",
    options: [
      "'You are right, you probably do not need it yet.'",
      "'Only older people get into accidents.'",
      "'You should wait until you are older to buy this.'",
      "'Young people are actually more active and exposed to accident risk. Plus, premiums are lower when you are younger.'"
    ],
    correct: 3,
    explanation: "Young people are often more active (sports, travel, nightlife) and therefore more exposed to accidents. Starting coverage young also locks in lower premiums.",
    category: 'objection-handling'
  },

  // Q83 -- correct: 1
  {
    question: "A client says: 'Why do I need both hospital and PA coverage?' What is the best response?",
    options: [
      "'You do not really need both, one is enough.'",
      "'Hospital covers inpatient stays. But most accidents are outpatient -- stitches, sprains, fractures. PA fills that gap.'",
      "'PA is just a more expensive version of hospital coverage.'",
      "'Hospital plans are being phased out, so PA is the replacement.'"
    ],
    correct: 1,
    explanation: "Most accidents result in outpatient treatment, which hospital plans do not cover. PA fills this gap with coverage for stitches, sprains, fractures, and more.",
    category: 'objection-handling'
  },

  // Q84 -- correct: 2
  {
    question: "A client says: 'The coverage amount seems too low for the premium.' How should you respond?",
    options: [
      "'You are right, the coverage is quite low.'",
      "'Just buy the cheapest plan then.'",
      "'Look at the value, not just the price. Plan 4 gives you 7.5x the coverage of Plan 1 for only 3.8x the price. Which plan suits your needs?'",
      "'The coverage is the same across all plans.'"
    ],
    correct: 2,
    explanation: "Redirect to the value argument: the coverage-to-price ratio improves significantly with higher plans, and the client should focus on value per dollar.",
    category: 'objection-handling'
  },

  // Q85 -- correct: 0
  {
    question: "A client says: 'I have savings to cover any accident expenses.' What is the best response?",
    options: [
      "'Why use your savings when 62 cents a day can protect them? Keep your savings for planned expenses.'",
      "'That is great, you do not need PA then.'",
      "'Your savings will not be enough for a serious accident.'",
      "'Savings do not earn interest anyway, so you might as well spend them on insurance.'"
    ],
    correct: 0,
    explanation: "Position PA as a way to protect savings. For 62 cents a day, the client preserves their savings for planned purposes instead of depleting them on unexpected accidents.",
    category: 'objection-handling'
  },

  // Q86 -- correct: 3
  {
    question: "A client says: 'Can I claim from both my hospital plan and PA plan for the same accident?' What is the correct answer?",
    options: [
      "No, you can only claim from one plan",
      "Only if the hospital plan does not pay out",
      "Only for accidents that result in hospitalization",
      "Yes, if you are hospitalized for an accident, you can claim inpatient from your hospital plan and any outpatient follow-up from PA"
    ],
    correct: 3,
    explanation: "The two plans cover different aspects. Hospital plan covers inpatient costs, while PA covers outpatient treatments. For the same accident, both can be claimed.",
    category: 'objection-handling'
  },

  // Q87 -- correct: 1
  {
    question: "A client says: 'I do not understand why I need to pay separately for accident coverage.' How should you explain?",
    options: [
      "'It is just how insurance works in Singapore.'",
      "'Your hospital plan only covers you when admitted. But most accident injuries -- cuts, sprains, fractures -- are treated outpatient. That is the gap PA fills, starting from just $20/month.'",
      "'You do not need to, this is just an add-on.'",
      "'All your friends are buying it, so you should too.'"
    ],
    correct: 1,
    explanation: "Explain the specific gap: hospital plans cover admission, but most accident treatments are outpatient. PA covers this gap affordably.",
    category: 'objection-handling'
  },

  // Q88 -- correct: 2
  {
    question: "A client says: 'I heard claims are difficult to process.' How should you respond?",
    options: [
      "'Yes, claims can be complicated.'",
      "'You will never need to make a claim anyway.'",
      "'With AIA Plus app, you can self-claim in about 5 minutes. It is one of the simplest claims processes in the industry.'",
      "'You need to submit physical forms at the AIA branch.'"
    ],
    correct: 2,
    explanation: "Counter the objection with the AIA Plus app's 5-minute self-claiming feature, demonstrating how simple and fast the claims process is.",
    category: 'objection-handling'
  },

  // Q89 -- correct: 0
  {
    question: "A client says: 'I will wait until I am older to get accident coverage.' What is the best response?",
    options: [
      "'Accidents do not wait until you are older. The earlier you start, the sooner you build up the 5% annual renewal bonus on Features 1-5.'",
      "'That is a good idea, older people need it more.'",
      "'The premiums are the same regardless of age.'",
      "'You cannot buy this product after age 50.'"
    ],
    correct: 0,
    explanation: "Accidents can happen at any age. Starting earlier lets policyholders accumulate the 5% annual renewal bonus sooner, up to 30% over 6 years.",
    category: 'objection-handling'
  },

  // Q90 -- correct: 3
  {
    question: "A client says: 'I only want the medical reimbursement feature, not the death benefit.' How should you handle this?",
    options: [
      "'We can remove the death benefit and just give you medical reimbursement.'",
      "'The medical reimbursement is not available separately.'",
      "'You should only focus on the death benefit.'",
      "'The beauty of this plan is you get everything bundled. Medical reimbursement (Feature 6) is the most commonly used feature, and all the other features come included at the same low price.'"
    ],
    correct: 3,
    explanation: "All features are bundled together. Rather than viewing unwanted features as waste, frame them as added protection that comes included at no extra cost.",
    category: 'objection-handling'
  },

  // Q91 -- correct: 1
  {
    question: "A client says: 'My MediSave already covers accidents.' How should you respond?",
    options: [
      "'You are right, MediSave covers everything.'",
      "'MediSave can only be used for hospitalization and certain approved procedures. Outpatient accident treatments like stitches, X-rays, and physiotherapy are not covered by MediSave.'",
      "'MediSave is being phased out soon.'",
      "'MediSave covers more than PA does.'"
    ],
    correct: 1,
    explanation: "MediSave has strict usage rules and primarily covers hospitalization. Outpatient accident treatments are not claimable from MediSave, which is exactly what PA covers.",
    category: 'objection-handling'
  },

  // Q92 -- correct: 2
  {
    question: "A client with children says: 'My kids do not need accident coverage.' How should you respond?",
    options: [
      "'Children rarely get into accidents.'",
      "'Only adults need PA coverage.'",
      "'Children are actually the most accident-prone. Remember the KK Hospital story -- stitches as outpatient are not covered by hospital plans. PA fills that gap for just $20/month.'",
      "'We do not cover children under this plan.'"
    ],
    correct: 2,
    explanation: "Use the KK Hospital story to illustrate how children frequently need outpatient accident treatment (stitches, fractures) that hospital plans do not cover.",
    category: 'objection-handling'
  },

  // Q93 -- correct: 0
  {
    question: "A client says: 'I already have PA coverage with another insurer.' How should you handle this?",
    options: [
      "Ask about their current coverage limits and compare -- many plans have lower medical reimbursement limits, no TCM coverage, or no renewal bonus",
      "'Then you do not need this at all.'",
      "'Cancel your other plan and switch to AIA immediately.'",
      "'All PA plans are the same.'"
    ],
    correct: 0,
    explanation: "Ask about their current plan details and compare. AIA Solitaire PA may offer advantages like unlimited medical claims, TCM coverage, and the 5% renewal bonus.",
    category: 'objection-handling'
  },

  // Q94 -- correct: 3
  {
    question: "A client says: 'I do not trust insurance companies to pay claims.' What is the best response?",
    options: [
      "'That is a valid concern, maybe insurance is not for you.'",
      "'All insurance companies are the same.'",
      "'Just trust me, AIA will pay.'",
      "'AIA is one of the largest and most established insurers in Asia. With the AIA Plus app, you can self-claim in 5 minutes and track your claim status in real time.'"
    ],
    correct: 3,
    explanation: "Address the trust concern by highlighting AIA's reputation, the transparent self-claiming process via AIA Plus app, and the ability to track claims in real time.",
    category: 'objection-handling'
  },

  // Q95 -- correct: 1
  {
    question: "A client says: 'The renewal bonus condition is too restrictive.' How should you clarify?",
    options: [
      "'You are right, it is very restrictive.'",
      "'The renewal bonus only resets if you claim under Feature 4 (burns/scalds). You can still claim under all other features -- including medical reimbursement -- and keep your bonus.'",
      "'You cannot claim anything if you want to keep the bonus.'",
      "'The renewal bonus is automatic with no conditions.'"
    ],
    correct: 1,
    explanation: "The renewal bonus is only affected by claims under Feature 4 (burns/scalds). Claims under Features 1-3, 5, 6, and 7 do not affect the bonus accumulation.",
    category: 'objection-handling'
  },

  // Q96 -- correct: 2
  {
    question: "A client says: '$5,000 per accident for medical reimbursement is not enough.' How should you respond?",
    options: [
      "'You are right, $5,000 is quite low.'",
      "'There is nothing we can do about the limit.'",
      "'$5,000 covers the vast majority of outpatient accident treatments. Plus, you get unlimited claims per year, and you can add the Extended Medical Reimbursement rider for higher limits.'",
      "'You should look at a different product.'"
    ],
    correct: 2,
    explanation: "$5,000 per accident covers most outpatient treatments, claims are unlimited, and the Extended Medical Reimbursement rider is available for those wanting higher limits.",
    category: 'objection-handling'
  },

  // Q97 -- correct: 0
  {
    question: "A client says: 'My spouse says we do not need more insurance.' How should you handle this?",
    options: [
      "'I understand. Would it help if we discussed this together so your spouse can see how PA fills the gap your current plans do not cover? It starts at just 62 cents a day.'",
      "'Your spouse is wrong.'",
      "'Just sign up without telling your spouse.'",
      "'Forget about it then.'"
    ],
    correct: 0,
    explanation: "Offer to include the spouse in the conversation so both partners understand the gap PA fills. The low daily cost makes it an easy conversation.",
    category: 'objection-handling'
  },

  // Q98 -- correct: 3
  {
    question: "A client says: 'I have been accident-free for 20 years.' What is the best response?",
    options: [
      "'You will probably stay accident-free forever.'",
      "'That means you are overdue for an accident.'",
      "'Twenty years of luck does not matter.'",
      "'That is great! If you start now, you will build up the 5% annual renewal bonus quickly. And at 62 cents a day, it is peace of mind you can easily afford.'"
    ],
    correct: 3,
    explanation: "Acknowledge their track record positively, then highlight the renewal bonus incentive and the minimal daily cost for ongoing peace of mind.",
    category: 'objection-handling'
  },

  // Q99 -- correct: 1
  {
    question: "A client says: 'I prefer to self-insure by setting aside money each month.' How should you respond?",
    options: [
      "'That is a better strategy than insurance.'",
      "'Self-insuring costs more. Setting aside $70/month for accident expenses means your savings are at risk. For $20/month, PA gives you up to $5,000 per accident with unlimited claims.'",
      "'You cannot self-insure for accidents.'",
      "'Self-insurance is the same as having PA coverage.'"
    ],
    correct: 1,
    explanation: "Compare the cost of self-insuring versus the PA premium. PA provides guaranteed coverage at a fraction of what self-insurance would require.",
    category: 'objection-handling'
  },

  // Q100 -- correct: 2
  {
    question: "A client says: 'I am worried about premium increases over time.' How should you address this concern?",
    options: [
      "'Premiums will definitely increase every year.'",
      "'There is no way to know if premiums will increase.'",
      "'The premiums are affordable even at current rates. And the renewal bonus of 5% per year on Features 1-5 means your coverage actually increases over time without paying more.'",
      "'If premiums increase, you can just cancel the policy.'"
    ],
    correct: 2,
    explanation: "Address by highlighting that the renewal bonus effectively increases coverage over time. The 5% annual bonus on Features 1-5 adds value without additional cost.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (20 questions) -- Q101-Q120
  // ============================================================

  // Q101 -- correct: 1
  {
    question: "A 28-year-old client says: 'I play recreational basketball every weekend and I am worried about sports injuries.' Which response best addresses their concern?",
    options: [
      "'You should stop playing basketball to avoid injuries.'",
      "'Great news -- AIA Solitaire PA covers amateur and recreational sports injuries. If you sprain your ankle or fracture a finger during a game, you can claim up to $5,000 per accident for medical expenses.'",
      "'Sports injuries are not covered by any insurance plan.'",
      "'You need a sports-specific insurance plan, not PA.'"
    ],
    correct: 1,
    explanation: "AIA Solitaire PA covers amateur and recreational sports injuries, making it perfect for active individuals who play sports regularly.",
    category: 'roleplay'
  },

  // Q102 -- correct: 3
  {
    question: "A mother asks about covering her 5-year-old child. She says: 'My child is always running around and getting small cuts and bruises.' What is the best response?",
    options: [
      "'Small cuts and bruises are not worth insuring for.'",
      "'You should keep your child indoors to prevent injuries.'",
      "'Children's injuries are not covered under PA.'",
      "'That is exactly why PA coverage is important for kids. When your child needs stitches or an X-ray from a fall, hospital plans will not cover the outpatient visit. PA covers that, starting from just $20/month.'"
    ],
    correct: 3,
    explanation: "Use the KK Hospital story approach -- children frequently need outpatient treatment for injuries, which hospital plans do not cover. PA fills this gap.",
    category: 'roleplay'
  },

  // Q103 -- correct: 0
  {
    question: "A 45-year-old executive says: 'I commute daily on the MRT and by car. Are transport accidents covered?' What is the best response?",
    options: [
      "'Yes, and with Feature 5, if something happens during your commute on public or private transport, the accidental death payout is doubled. Under Plan 4, that means up to $1.5 million.'",
      "'Only car accidents are covered, not MRT accidents.'",
      "'Transport accidents are the same as regular accidents under this plan.'",
      "'You should get a separate travel insurance for commuting.'"
    ],
    correct: 0,
    explanation: "Feature 5 provides double payout for public or private transport accidents. For a daily commuter, this is a highly relevant benefit to highlight.",
    category: 'roleplay'
  },

  // Q104 -- correct: 2
  {
    question: "A client says: 'I already have a hospital plan from AIA and a term life plan. Why do I need PA?' What is the best response?",
    options: [
      "'You have too much insurance already.'",
      "'PA is the same as your term life plan.'",
      "'Your hospital plan covers inpatient stays. Your term life covers death. But neither covers the outpatient accident treatments you are most likely to need -- stitches, fractures, physiotherapy. PA fills that gap for just 62 cents a day.'",
      "'You should cancel your other plans and just get PA.'"
    ],
    correct: 2,
    explanation: "Position PA as the missing piece that complements existing coverage. Hospital = inpatient, term life = death, PA = outpatient accidents (highest probability).",
    category: 'roleplay'
  },

  // Q105 -- correct: 1
  {
    question: "A 60-year-old retiree says: 'I am too old for accident insurance. Is there even a plan for my age?' What is the best response?",
    options: [
      "'Unfortunately, accident coverage is only for people under 55.'",
      "'AIA Solitaire PA covers you up to age 80. As we get older, fall risks and injuries become more common. This coverage ensures you do not deplete your retirement savings on unexpected accident costs.'",
      "'At your age, you should focus on critical illness coverage instead.'",
      "'Older people do not get into accidents often enough to justify the cost.'"
    ],
    correct: 1,
    explanation: "AIA Solitaire PA extends coverage to age 80. For retirees, the product protects retirement savings from being depleted by unexpected accident expenses.",
    category: 'roleplay'
  },

  // Q106 -- correct: 3
  {
    question: "A freelance photographer says: 'I travel frequently for work to different countries. Will I be covered overseas?' What is the best response?",
    options: [
      "'You need a separate travel insurance for overseas coverage.'",
      "'Only accidents in Singapore are covered.'",
      "'Overseas coverage requires an additional rider.'",
      "'AIA Solitaire PA provides global coverage 24/7. Whether you are shooting in Japan or hiking in New Zealand, you are covered for accidental injuries anywhere in the world.'"
    ],
    correct: 3,
    explanation: "AIA Solitaire PA provides global coverage 24/7, making it ideal for frequent travelers who need accident protection anywhere in the world.",
    category: 'roleplay'
  },

  // Q107 -- correct: 0
  {
    question: "A couple is deciding between Plan 2 and Plan 4. The husband says: 'Plan 4 is almost triple the price of Plan 2.' How should you respond?",
    options: [
      "'It is only 3.8 times the price but gives you 7.5 times the coverage. For an extra $1.35 per day over Plan 2, you get $2.25 million in dismemberment coverage instead of a lower amount. Look at the value, not just the price.'",
      "'If you cannot afford Plan 4, just go with Plan 2.'",
      "'Plan 2 and Plan 4 have the same coverage.'",
      "'Plan 4 is too expensive for most people.'"
    ],
    correct: 0,
    explanation: "Use the value argument: 3.8x the price for 7.5x the coverage. Frame the price difference in daily terms to make it feel manageable.",
    category: 'roleplay'
  },

  // Q108 -- correct: 2
  {
    question: "A hawker stall owner says: 'I work with hot oil and sharp knives every day. Is this the right product for me?' What is the best response?",
    options: [
      "'This product is not designed for people in your line of work.'",
      "'You should get a specialized occupational hazard policy.'",
      "'Absolutely. Burns and cuts from cooking are accidental injuries covered by PA. Feature 4 covers burns, and Feature 6 covers medical expenses up to $5,000 per accident with unlimited claims. This is perfect for your situation.'",
      "'You need workers compensation, not PA.'"
    ],
    correct: 2,
    explanation: "PA covers burns (Feature 4) and medical expenses for cuts and injuries (Feature 6), making it highly relevant for food service workers exposed to daily hazards.",
    category: 'roleplay'
  },

  // Q109 -- correct: 1
  {
    question: "A client who recently recovered from dengue says: 'I did not know dengue was covered by accident insurance. Can you tell me more?' What is the best response?",
    options: [
      "'Dengue is only covered if you are hospitalized.'",
      "'Yes, insect bites including dengue are covered under AIA Solitaire PA because they are unexpected and unintentional. If you had this plan, your outpatient treatment costs would have been reimbursed up to $5,000.'",
      "'Dengue is classified as an illness, not an accident.'",
      "'Only certain strains of dengue are covered.'"
    ],
    correct: 1,
    explanation: "Insect bites including dengue are covered because they meet the definition of an accident -- unexpected and unintentional. This is a strong selling point in tropical Singapore.",
    category: 'roleplay'
  },

  // Q110 -- correct: 3
  {
    question: "A young professional says: 'I am comparing PA plans from different insurers. What makes AIA Solitaire PA stand out?' What should you highlight?",
    options: [
      "'All PA plans are basically the same.'",
      "'AIA is the cheapest option.'",
      "'AIA has the most agents.'",
      "'AIA Solitaire PA stands out with unlimited medical claims, TCM and chiropractor coverage, a 5% annual renewal bonus up to 30%, the AIA Plus app for 5-minute self-claiming, global 24/7 coverage, and coverage up to age 80.'"
    ],
    correct: 3,
    explanation: "Key differentiators include unlimited claims, TCM coverage, renewal bonus, AIA Plus app, global coverage, and extended age limit -- all strong competitive advantages.",
    category: 'roleplay'
  },

  // Q111 -- correct: 0
  {
    question: "A client says: 'My friend claimed from his PA plan for a fracture and it was very troublesome. How is AIA different?' What is the best response?",
    options: [
      "'With AIA, you can self-claim through the AIA Plus app in about 5 minutes. Just upload your documents and submit. No need to visit a branch or fill out paper forms.'",
      "'All insurance claims are troublesome, that is just how it works.'",
      "'Your friend probably did something wrong with his claim.'",
      "'AIA claims take about the same time as other insurers.'"
    ],
    correct: 0,
    explanation: "Highlight the AIA Plus app's 5-minute self-claiming process as a key differentiator -- no branch visits, no paper forms, just upload and submit.",
    category: 'roleplay'
  },

  // Q112 -- correct: 2
  {
    question: "A father of three says: 'I want to cover my whole family. Is it worth getting PA for everyone?' What is the best response?",
    options: [
      "'Just cover yourself, the breadwinner.'",
      "'Children do not need PA coverage.'",
      "'Absolutely. Children are the most accident-prone, and your spouse also needs coverage. At $20/month per person, covering your family of five would cost about $100/month -- and everyone gets up to $5,000 per accident with unlimited claims.'",
      "'Family plans are not available for PA.'"
    ],
    correct: 2,
    explanation: "Emphasize that children are highly accident-prone and the per-person cost is low. Multiply by family size to show total cost is still affordable.",
    category: 'roleplay'
  },

  // Q113 -- correct: 1
  {
    question: "A grab driver says: 'I spend 10 hours a day on the road. Do I get extra coverage for being in a vehicle?' What is the best response?",
    options: [
      "'No, driving is excluded from PA coverage.'",
      "'Yes. Feature 5 provides double payout for death in a private transport accident. Under Plan 4, that means $750K + $750K = $1.5 million. Since you spend so much time on the road, this feature is especially valuable for you.'",
      "'You need commercial vehicle insurance, not PA.'",
      "'Only public transport accidents get the double payout.'"
    ],
    correct: 1,
    explanation: "Feature 5 covers both public and private transport, making it especially relevant for someone who spends extensive time driving.",
    category: 'roleplay'
  },

  // Q114 -- correct: 3
  {
    question: "A client recovering from a wrist sprain says: 'I have been seeing a chiropractor and it is expensive. Would PA have covered this?' What is the best response?",
    options: [
      "'Chiropractor visits are not covered by any insurance.'",
      "'Only if the injury required surgery.'",
      "'Chiropractor coverage requires a separate specialized plan.'",
      "'Yes! Feature 7 specifically covers TCM and chiropractor treatments with a separate limit. If you had PA, those chiropractor visits would have been claimable.'"
    ],
    correct: 3,
    explanation: "Feature 7 covers TCM and chiropractor treatments with a separate limit from the main medical reimbursement, directly addressing this client's situation.",
    category: 'roleplay'
  },

  // Q115 -- correct: 0
  {
    question: "A client asks: 'If I buy Plan 1 now, can I upgrade to Plan 4 later?' What is the best response?",
    options: [
      "'You can always discuss upgrading later. But consider this: Plan 4 is only 3.8 times the price of Plan 1 but gives you 7.5 times the coverage. Starting with Plan 4 now also means you begin building your renewal bonus sooner.'",
      "'No, you are locked into the plan you choose.'",
      "'You should always start with Plan 4, Plan 1 is not worth it.'",
      "'Upgrading will require a full medical examination.'"
    ],
    correct: 0,
    explanation: "While upgrades are possible, use this as an opportunity to present the value argument for choosing a higher plan from the start, including the renewal bonus benefit.",
    category: 'roleplay'
  },

  // Q116 -- correct: 2
  {
    question: "During a lunch meeting, a client says: 'Insurance is so complicated. Just tell me simply -- what does this plan do?' What is the best simple explanation?",
    options: [
      "'It is a comprehensive multi-feature personal accident plan with optional riders and renewal bonuses.'",
      "'It covers you for everything related to your health.'",
      "'Simple: if you have an accident -- a fall, a cut, a fracture, even food poisoning or an insect bite -- this plan pays for your treatment. Up to $5,000 per accident, unlimited claims, starting from 62 cents a day.'",
      "'It is like health insurance but for accidents only.'"
    ],
    correct: 2,
    explanation: "Keep it simple with concrete examples and key numbers: $5,000 per accident, unlimited claims, 62 cents a day. Avoid jargon and technical terms.",
    category: 'roleplay'
  },

  // Q117 -- correct: 1
  {
    question: "A client who is an avid cyclist says: 'I had a cycling accident last year and spent $3,000 on outpatient treatment. My hospital plan did not cover any of it.' How should you respond?",
    options: [
      "'That is unfortunate, but it happens.'",
      "'That is exactly the gap PA fills. Your hospital plan only covers inpatient stays. With AIA Solitaire PA, that entire $3,000 would have been covered under Feature 6, which pays up to $5,000 per accident. And cycling injuries are fully covered.'",
      "'Cycling injuries might not be covered under PA either.'",
      "'You should stop cycling to avoid future expenses.'"
    ],
    correct: 1,
    explanation: "Use the client's real experience to demonstrate the exact gap PA fills. Their $3,000 outpatient expense would have been fully covered under Feature 6.",
    category: 'roleplay'
  },

  // Q118 -- correct: 3
  {
    question: "A new mother says: 'I am on a tight budget with the new baby. I really cannot afford another premium right now.' What is the best response?",
    options: [
      "'I understand, insurance is not a priority for you right now.'",
      "'You should buy it for the baby first and yourself later.'",
      "'Skip two bubble teas a month and you can afford a family PA plan.'",
      "'I understand budgets are tight with a new baby. Plan 1 is just 62 cents a day -- less than a packet drink. With a baby who will start crawling and walking soon, outpatient accident coverage becomes really important. Which plan fits your budget?'"
    ],
    correct: 3,
    explanation: "Acknowledge the budget concern, then reframe with daily cost and connect it to the baby's upcoming developmental stage where accidents become more likely.",
    category: 'roleplay'
  },

  // Q119 -- correct: 0
  {
    question: "An elderly client's adult child asks: 'My mother is 72. Can she still get coverage, and is it worth it at her age?' What is the best response?",
    options: [
      "'Yes, AIA Solitaire PA covers her up to age 80. At her age, fall risks increase significantly. A hip fracture or wrist injury could mean expensive outpatient treatment. No medical checkup is needed to apply -- just SingPass verification.'",
      "'At 72, insurance premiums would be too expensive.'",
      "'She is too old for any personal accident plan.'",
      "'She should rely on government subsidies instead.'"
    ],
    correct: 0,
    explanation: "Highlight the extended age coverage to 80, the increased fall risks for elderly, the no-medical-checkup requirement, and the simple application process.",
    category: 'roleplay'
  },

  // Q120 -- correct: 2
  {
    question: "A client who just signed up for Plan 2 asks: 'Now that I have the plan, how do I actually make a claim if something happens?' What is the best response?",
    options: [
      "'Call the AIA hotline and they will guide you.'",
      "'Visit the nearest AIA branch with your receipts.'",
      "'Download the AIA Plus app. When you have an accident, just open the app, submit your claim with photos of receipts, and it takes about 5 minutes. You can also track your claim status right in the app.'",
      "'Your advisor will handle all claims for you.'"
    ],
    correct: 2,
    explanation: "Walk them through the AIA Plus app self-claiming process -- it takes about 5 minutes, reinforcing the service advantage that was part of the sales pitch.",
    category: 'roleplay'
  }
];
