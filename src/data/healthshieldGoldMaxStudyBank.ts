export interface StudyQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';
}

export const healthshieldGoldMaxStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (45 questions) — Q1–Q45
  // ============================================================

  // Q1 — correct: 2
  {
    question: "What is the annual claim limit for AIA HealthShield Gold Max Plan A?",
    options: [
      "$1 million",
      "$1.5 million",
      "$2 million",
      "$500,000"
    ],
    correct: 2,
    explanation: "Plan A offers the highest annual claim limit of $2 million, covering private hospital stays on an as-charged basis.",
    category: 'product-facts'
  },

  // Q2 — correct: 0
  {
    question: "What is the lifetime claim limit for all AIA HealthShield Gold Max plans?",
    options: [
      "Unlimited",
      "$5 million",
      "$3 million",
      "$10 million"
    ],
    correct: 0,
    explanation: "All AIA HealthShield Gold Max plans come with an unlimited lifetime claim limit, providing peace of mind for long-term medical needs.",
    category: 'product-facts'
  },

  // Q3 — correct: 3
  {
    question: "Which ward class does Plan B Lite of HealthShield Gold Max cover?",
    options: [
      "Private hospital rooms",
      "Class A ward in public hospitals",
      "Class C ward in public hospitals",
      "Class B1 ward in public hospitals"
    ],
    correct: 3,
    explanation: "Plan B Lite covers up to Class B1 ward in restructured (public) hospitals with an annual limit of $500,000.",
    category: 'product-facts'
  },

  // Q4 — correct: 1
  {
    question: "What is the annual claim limit for HealthShield Gold Max Plan B?",
    options: [
      "$500,000",
      "$1 million",
      "$2 million",
      "$750,000"
    ],
    correct: 1,
    explanation: "Plan B provides coverage for Class A wards in public hospitals with a $1 million annual claim limit.",
    category: 'product-facts'
  },

  // Q5 — correct: 3
  {
    question: "What is the standard co-insurance rate for the base HealthShield Gold Max plan (without rider)?",
    options: [
      "5%",
      "20%",
      "15%",
      "10%"
    ],
    correct: 3,
    explanation: "The base plan requires 10% co-insurance, meaning the policyholder pays 10% of eligible expenses after deductible.",
    category: 'product-facts'
  },

  // Q6 — correct: 0
  {
    question: "What co-insurance rate does the VitalHealth rider reduce it to?",
    options: [
      "5%, capped at $3,000 per year",
      "0% with no cap",
      "10%, capped at $5,000 per year",
      "3%, capped at $2,000 per year"
    ],
    correct: 0,
    explanation: "The VitalHealth rider reduces co-insurance from 10% to 5% and caps the annual out-of-pocket at $3,000.",
    category: 'product-facts'
  },

  // Q7 — correct: 2
  {
    question: "What is the annual co-insurance cap for the VitalHealth A Value variant?",
    options: [
      "$3,000",
      "$4,500",
      "$6,000",
      "$10,000"
    ],
    correct: 2,
    explanation: "The VitalHealth A Value variant has a higher annual co-insurance cap of $6,000, which helps keep premium costs lower compared to the standard VitalHealth rider.",
    category: 'product-facts'
  },

  // Q8 — correct: 1
  {
    question: "What is the deductible for HealthShield Gold Max Plan A?",
    options: [
      "$2,500",
      "$3,500",
      "$5,000",
      "$1,500"
    ],
    correct: 1,
    explanation: "Plan A has a $3,500 deductible that applies per policy year before co-insurance kicks in.",
    category: 'product-facts'
  },

  // Q9 — correct: 0
  {
    question: "How long is the pre- and post-hospitalization coverage period for Plan A?",
    options: [
      "13 months",
      "12 months",
      "6 months",
      "180 days"
    ],
    correct: 0,
    explanation: "Plan A offers 13 months of pre- and post-hospitalization coverage, which is the longest in the market.",
    category: 'product-facts'
  },

  // Q10 — correct: 3
  {
    question: "What is the pre- and post-hospitalization coverage period for Plan B?",
    options: [
      "13 months",
      "100 days",
      "90 days",
      "180 days"
    ],
    correct: 3,
    explanation: "Plan B provides 180 days of pre- and post-hospitalization coverage for specialist consultations and follow-ups.",
    category: 'product-facts'
  },

  // Q11 — correct: 1
  {
    question: "How many private specialist doctors are in the AIA AQHP panel?",
    options: [
      "300+",
      "500+",
      "200+",
      "1,000+"
    ],
    correct: 1,
    explanation: "The AQHP (AIA Quality Healthcare Partners) panel includes over 500 private specialist doctors.",
    category: 'product-facts'
  },

  // Q12 — correct: 2
  {
    question: "What is the minimum specialist experience required for AQHP panel doctors?",
    options: [
      "3 years",
      "10 years",
      "5 years",
      "7 years"
    ],
    correct: 2,
    explanation: "AQHP panel doctors must have a minimum of 5 years of specialist experience, ensuring quality care.",
    category: 'product-facts'
  },

  // Q13 — correct: 0
  {
    question: "What proration applies when using a non-AQHP doctor without pre-authorization?",
    options: [
      "85% proration",
      "70% proration",
      "50% proration",
      "No proration"
    ],
    correct: 0,
    explanation: "Without pre-authorization and outside the AQHP panel, claims are prorated at 85%, meaning the insurer pays only 85% of eligible charges.",
    category: 'product-facts'
  },

  // Q14 — correct: 3
  {
    question: "What proration applies for Plan B or Plan B Lite policyholders who seek treatment at private hospitals?",
    options: [
      "85%",
      "50%",
      "No proration applies",
      "70%"
    ],
    correct: 3,
    explanation: "Plan B and Plan B Lite policyholders who choose private hospitals face a 70% proration on their claims.",
    category: 'product-facts'
  },

  // Q15 — correct: 1
  {
    question: "What happens to proration when using an AQHP doctor or obtaining pre-authorization?",
    options: [
      "Proration is reduced to 90%",
      "No proration applies",
      "A flat $500 fee replaces proration",
      "Proration remains at 85%"
    ],
    correct: 1,
    explanation: "Using an AQHP panel doctor or obtaining pre-authorization removes proration entirely — claims are settled at full eligible amounts.",
    category: 'product-facts'
  },

  // Q16 — correct: 2
  {
    question: "How many working days does AIA take to process a pre-authorization request?",
    options: [
      "1 working day",
      "5 working days",
      "3 working days",
      "7 working days"
    ],
    correct: 2,
    explanation: "Pre-authorization requests are processed within 3 working days, and once approved, AIA settles the bill directly with the hospital.",
    category: 'product-facts'
  },

  // Q17 — correct: 0
  {
    question: "Since when has the pre-authorization option been available for ALL private specialists?",
    options: [
      "April 2020",
      "January 2019",
      "October 2021",
      "July 2022"
    ],
    correct: 0,
    explanation: "Since April 2020, pre-authorization has been available for all private specialists, not just AQHP panel doctors.",
    category: 'product-facts'
  },

  // Q18 — correct: 3
  {
    question: "What is the MediSave Additional Withdrawal Limit (AWL) for policyholders aged 40 and below?",
    options: [
      "$600 per year",
      "$900 per year",
      "$150 per year",
      "$300 per year"
    ],
    correct: 3,
    explanation: "Policyholders aged 40 and below can withdraw up to $300 per year from MediSave for IP premium top-ups.",
    category: 'product-facts'
  },

  // Q19 — correct: 1
  {
    question: "What is the MediSave AWL for policyholders aged 41 to 70?",
    options: [
      "$300 per year",
      "$600 per year",
      "$900 per year",
      "$450 per year"
    ],
    correct: 1,
    explanation: "The MediSave AWL increases to $600 per year for policyholders between 41 and 70 years old.",
    category: 'product-facts'
  },

  // Q20 — correct: 2
  {
    question: "Can MediSave be used to pay for rider premiums on HealthShield Gold Max?",
    options: [
      "Yes, up to the AWL limit",
      "Yes, but only for the first 5 years",
      "No, rider premiums must be paid in cash",
      "Yes, for policyholders above age 65"
    ],
    correct: 2,
    explanation: "Rider premiums (e.g., VitalHealth) must be paid entirely in cash. MediSave can only be used for the base IP plan premium.",
    category: 'product-facts'
  },

  // Q21 — correct: 0
  {
    question: "What is the general waiting period for HealthShield Gold Max after policy inception?",
    options: [
      "30 days",
      "60 days",
      "90 days",
      "14 days"
    ],
    correct: 0,
    explanation: "There is a standard 30-day waiting period from policy commencement before coverage begins for most conditions.",
    category: 'product-facts'
  },

  // Q22 — correct: 3
  {
    question: "What is the waiting period for pregnancy-related complications?",
    options: [
      "30 days",
      "6 months",
      "12 months",
      "10 months"
    ],
    correct: 3,
    explanation: "Pregnancy-related complications have a 10-month waiting period from the policy start date.",
    category: 'product-facts'
  },

  // Q23 — correct: 1
  {
    question: "What is the waiting period for living donor organ donation coverage?",
    options: [
      "12 months",
      "24 months",
      "36 months",
      "10 months"
    ],
    correct: 1,
    explanation: "Living donor organ donation has the longest waiting period at 24 months from policy inception.",
    category: 'product-facts'
  },

  // Q24 — correct: 2
  {
    question: "What is the standard moratorium period for pre-existing conditions?",
    options: [
      "3 years",
      "7 years",
      "5 years",
      "10 years"
    ],
    correct: 2,
    explanation: "The standard moratorium period is 5 years, after which pre-existing conditions may be covered if no symptoms or treatment occurred during that period.",
    category: 'product-facts'
  },

  // Q25 — correct: 0
  {
    question: "What is the restriction period when switching from one Integrated Shield Plan to another?",
    options: [
      "40 days",
      "30 days",
      "90 days",
      "60 days"
    ],
    correct: 0,
    explanation: "There is a 40-day restriction period when switching between ISP plans, during which the new insurer may not cover certain conditions.",
    category: 'product-facts'
  },

  // Q26 — correct: 3
  {
    question: "What is the annual limit for outpatient chemotherapy under HealthShield Gold Max?",
    options: [
      "$24,000 per policy year",
      "$50,000 per policy year",
      "$12,000 per policy year",
      "$36,000 per policy year"
    ],
    correct: 3,
    explanation: "Outpatient chemotherapy is covered up to $36,000 per policy year, allowing patients to receive treatment without hospitalization.",
    category: 'product-facts'
  },

  // Q27 — correct: 1
  {
    question: "What does the Cancer Booster Rider provide in terms of coverage?",
    options: [
      "A flat $100,000 lump sum on cancer diagnosis",
      "16 times the MediShield Life limit per month",
      "Unlimited cancer treatment coverage",
      "50% co-insurance waiver for oncology"
    ],
    correct: 1,
    explanation: "The Cancer Booster Rider provides 16 times the MediShield Life limit per month, significantly boosting cancer treatment coverage.",
    category: 'product-facts'
  },

  // Q28 — correct: 0
  {
    question: "How much does the Cancer Care Rider cost per year?",
    options: [
      "$36",
      "$120",
      "$72",
      "$48"
    ],
    correct: 0,
    explanation: "The Cancer Care Rider is remarkably affordable at just $36 per year, making it an easy add-on for cancer coverage enhancement.",
    category: 'product-facts'
  },

  // Q29 — correct: 2
  {
    question: "What is the CTGTP (Cell, Tissue and Gene Therapy Products) coverage limit per indication per lifetime?",
    options: [
      "$100,000",
      "$200,000",
      "$250,000",
      "$500,000"
    ],
    correct: 2,
    explanation: "The CTGTP benefit provides up to $250,000 per indication per lifetime, effective from October 2025.",
    category: 'product-facts'
  },

  // Q30 — correct: 3
  {
    question: "What is the coverage limit for non-listed CTGTP treatments?",
    options: [
      "$250,000 per indication per lifetime",
      "$50,000 per indication per lifetime",
      "$100,000 per indication per lifetime",
      "$150,000 per indication per lifetime"
    ],
    correct: 3,
    explanation: "Non-listed CTGTP treatments are covered at a lower limit of $150,000 per indication per lifetime, compared to $250,000 for listed treatments.",
    category: 'product-facts'
  },

  // Q31 — correct: 1
  {
    question: "What is the organ transplant benefit per transplant under HealthShield Gold Max?",
    options: [
      "$100,000",
      "$60,000",
      "$80,000",
      "$40,000"
    ],
    correct: 1,
    explanation: "Organ transplant coverage is $60,000 per transplant, applicable per policy year and per lifetime.",
    category: 'product-facts'
  },

  // Q32 — correct: 0
  {
    question: "What is the annual limit for post-transplant immunosuppressant drugs?",
    options: [
      "$7,200 per year",
      "$12,000 per year",
      "$5,000 per year",
      "$10,000 per year"
    ],
    correct: 0,
    explanation: "Post-transplant immunosuppressants are covered up to $7,200 per year, helping transplant recipients manage ongoing medication costs.",
    category: 'product-facts'
  },

  // Q33 — correct: 2
  {
    question: "What is the annual limit for non-CDL (Community Drug List) coverage?",
    options: [
      "$100,000 per year",
      "$150,000 per year",
      "$200,000 per year",
      "$50,000 per year"
    ],
    correct: 2,
    explanation: "Non-CDL coverage provides up to $200,000 per year for drugs not on the Community Drug List.",
    category: 'product-facts'
  },

  // Q34 — correct: 3
  {
    question: "What is the annual claim limit for MediShield Life (the compulsory base layer)?",
    options: [
      "$100,000",
      "$500,000",
      "$150,000",
      "$200,000"
    ],
    correct: 3,
    explanation: "MediShield Life has an annual claim limit of $200,000 and covers B2/C ward stays in public hospitals.",
    category: 'product-facts'
  },

  // Q35 — correct: 1
  {
    question: "Which ward classes does MediShield Life cover?",
    options: [
      "All ward classes including private",
      "B2 and C wards only",
      "B1, B2, and C wards",
      "A and B1 wards only"
    ],
    correct: 1,
    explanation: "MediShield Life is designed to cover B2 and C ward stays in public hospitals. Higher ward classes require an Integrated Shield Plan.",
    category: 'product-facts'
  },

  // Q36 — correct: 0
  {
    question: "Is MediShield Life compulsory, and does it cover pre-existing conditions?",
    options: [
      "Yes, it is compulsory for all SC/PR and covers pre-existing conditions",
      "It is optional and excludes pre-existing conditions",
      "It is compulsory but excludes pre-existing conditions",
      "It is optional but covers pre-existing conditions"
    ],
    correct: 0,
    explanation: "MediShield Life is compulsory for all Singapore Citizens and Permanent Residents, and it covers pre-existing conditions.",
    category: 'product-facts'
  },

  // Q37 — correct: 2
  {
    question: "Under the Waiver Pass mechanism, what happens on the first claim?",
    options: [
      "An additional $1,000 deductible applies",
      "Claims are prorated at 85%",
      "No penalty applies",
      "Co-insurance increases to 20%"
    ],
    correct: 2,
    explanation: "The Waiver Pass grants a penalty-free first claim. The additional deductible only kicks in on the second claim within 36 months.",
    category: 'product-facts'
  },

  // Q38 — correct: 1
  {
    question: "What happens if a second claim is made within 36 months under the Waiver Pass?",
    options: [
      "Co-insurance doubles to 20%",
      "An additional $2,000 deductible applies",
      "The claim is rejected",
      "Proration drops to 70%"
    ],
    correct: 1,
    explanation: "A second claim within 36 months triggers an additional $2,000 deductible on top of the standard deductible.",
    category: 'product-facts'
  },

  // Q39 — correct: 3
  {
    question: "How does the Waiver Pass reset?",
    options: [
      "It resets annually",
      "It never resets once triggered",
      "It resets after 24 months of no claims",
      "It resets after 36 months of no claims"
    ],
    correct: 3,
    explanation: "The Waiver Pass resets after 36 consecutive months without a claim, removing the additional deductible requirement.",
    category: 'product-facts'
  },

  // Q40 — correct: 0
  {
    question: "What is the annual claim limit for HealthShield Gold Max Standard plan?",
    options: [
      "$200,000",
      "$500,000",
      "$1 million",
      "$100,000"
    ],
    correct: 0,
    explanation: "The Standard plan has a $200,000 annual limit and covers B1 ward stays, matching the MediShield Life base coverage level.",
    category: 'product-facts'
  },

  // Q41 — correct: 2
  {
    question: "What is the pre- and post-hospitalization coverage period for Plan B Lite?",
    options: [
      "180 days",
      "13 months",
      "100 days",
      "60 days"
    ],
    correct: 2,
    explanation: "Plan B Lite offers 100 days of pre- and post-hospitalization coverage, shorter than Plan B's 180 days and Plan A's 13 months.",
    category: 'product-facts'
  },

  // Q42 — correct: 1
  {
    question: "What happens when AIA grants pre-authorization for a hospital stay?",
    options: [
      "The deductible is waived entirely",
      "AIA settles the bill directly with the hospital",
      "Co-insurance is reduced to 0%",
      "The policyholder receives a cash advance"
    ],
    correct: 1,
    explanation: "With pre-authorization, AIA settles the bill directly with the hospital, so the policyholder does not need to pay upfront and claim later.",
    category: 'product-facts'
  },

  // Q43 — correct: 3
  {
    question: "What is the MediSave AWL for policyholders aged 71 and above?",
    options: [
      "$300 per year",
      "$600 per year",
      "$1,200 per year",
      "$900 per year"
    ],
    correct: 3,
    explanation: "Policyholders aged 71 and above have the highest MediSave AWL at $900 per year to help offset rising premiums.",
    category: 'product-facts'
  },

  // Q44 — correct: 0
  {
    question: "On what basis does Plan A cover hospital charges?",
    options: [
      "As-charged basis",
      "Per-diem basis with daily limits",
      "Fee schedule basis",
      "Capped at government-set rates"
    ],
    correct: 0,
    explanation: "Plan A covers private hospital charges on an as-charged basis, meaning there are no sub-limits on individual items — the full bill is covered up to the annual limit.",
    category: 'product-facts'
  },

  // Q45 — correct: 2
  {
    question: "What additional deductible applies if a Plan A policyholder has made a private hospital claim in the past 3 years?",
    options: [
      "$1,000",
      "$3,500",
      "$2,000",
      "$5,000"
    ],
    correct: 2,
    explanation: "An additional $2,000 deductible applies on top of the standard $3,500 deductible if the policyholder claimed from a private hospital within the preceding 3 years.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (30 questions) — Q46–Q75
  // ============================================================

  // Q46 — correct: 1
  {
    question: "When presenting healthcare costs to a prospect, what is the estimated lifetime hospital premium per person?",
    options: [
      "$50,000 to $100,000",
      "$171,000 to $412,000",
      "$500,000 to $1 million",
      "$80,000 to $150,000"
    ],
    correct: 1,
    explanation: "Field data shows lifetime hospital premiums range from $171K to $412K per person, making a compelling case for early planning.",
    category: 'sales-angles'
  },

  // Q47 — correct: 3
  {
    question: "What is the recommended framing when discussing premiums as a 'pure expense'?",
    options: [
      "Compare to vacation spending",
      "Show how premiums decrease over time",
      "Emphasize tax deductions on premiums",
      "Lead with the pain that premiums are a sunk cost, then show how a dividend portfolio at 6% yield can cover them"
    ],
    correct: 3,
    explanation: "The field-tested approach is to acknowledge premiums as a pure expense (pain point), then present a dividend portfolio at 6% yield as a strategy to make premiums self-funding.",
    category: 'sales-angles'
  },

  // Q48 — correct: 0
  {
    question: "For a pre-retiree prospect, what is the premium escalation range from working years to age 90?",
    options: [
      "$565/year escalating to $3,006/year",
      "$200/year escalating to $1,000/year",
      "$1,000/year escalating to $5,000/year",
      "$300/year escalating to $2,000/year"
    ],
    correct: 0,
    explanation: "Premiums escalate from approximately $565/year during working years to $3,006/year by age 90, making early planning critical.",
    category: 'sales-angles'
  },

  // Q49 — correct: 2
  {
    question: "What is the monthly affordability range when pitching HealthShield Gold Max to a young adult?",
    options: [
      "$5/month for all plans",
      "$50-$100/month regardless of plan",
      "$25/month for public ward plans, $80-$90/month for private",
      "$200/month for comprehensive coverage"
    ],
    correct: 2,
    explanation: "Public ward plans (B1) cost about $25/month, while private hospital coverage (Plan A) runs $80-$90/month — comparable to daily small expenses.",
    category: 'sales-angles'
  },

  // Q50 — correct: 1
  {
    question: "What everyday comparison is recommended when framing private ward premium costs?",
    options: [
      "A monthly gym membership",
      "Daily breakfast cost",
      "A weekly movie ticket",
      "Monthly mobile phone bill"
    ],
    correct: 1,
    explanation: "Comparing $80-$90/month to daily breakfast cost ($2.50-$3/day) makes the premium feel manageable and relatable.",
    category: 'sales-angles'
  },

  // Q51 — correct: 3
  {
    question: "What is the key sales message when pitching to young, healthy adults?",
    options: [
      "Premiums are tax-deductible",
      "They can skip coverage until older",
      "MediShield Life is sufficient for now",
      "Lock in insurability while healthy — conditions developed later may be excluded"
    ],
    correct: 3,
    explanation: "The core message for young adults is that insurability is a time-sensitive asset. Pre-existing conditions acquired later may be permanently excluded.",
    category: 'sales-angles'
  },

  // Q52 — correct: 0
  {
    question: "What is the annual savings when downgrading from Plan A with standard VitalHealth to VitalHealth A Value?",
    options: [
      "Approximately $1,400 per year",
      "Approximately $500 per year",
      "Approximately $2,000 per year",
      "Approximately $800 per year"
    ],
    correct: 0,
    explanation: "Switching from the standard VitalHealth rider to the Value variant saves approximately $1,400/year by accepting a higher co-insurance cap ($6,000 vs $3,000).",
    category: 'sales-angles'
  },

  // Q53 — correct: 2
  {
    question: "What is the 'delay cost' messaging used in field sales?",
    options: [
      "Premiums double every 5 years",
      "Coverage reduces by 10% each year delayed",
      "The delay is 5% more expensive every year",
      "Waiting adds a 2-year exclusion period"
    ],
    correct: 2,
    explanation: "Field advisors use the '5% more expensive every year' framing to create urgency — each year of delay means higher entry premiums.",
    category: 'sales-angles'
  },

  // Q54 — correct: 1
  {
    question: "How should you position the AQHP panel as a competitive advantage?",
    options: [
      "AQHP doctors charge lower fees",
      "500+ vetted specialists with no proration — clients get full coverage and quality assurance",
      "AQHP doctors guarantee faster recovery",
      "AQHP is the only option for claims"
    ],
    correct: 1,
    explanation: "The AQHP advantage is twofold: quality assurance (5+ years specialist experience) and financial benefit (no proration on claims).",
    category: 'sales-angles'
  },

  // Q55 — correct: 0
  {
    question: "When comparing AIA to Prudential, what is AIA's key advantage in annual limits?",
    options: [
      "AIA offers $2M annual vs Prudential's $1M annual",
      "AIA offers $1M annual vs Prudential's $500K",
      "Both have the same annual limits",
      "Prudential has higher limits than AIA"
    ],
    correct: 0,
    explanation: "AIA Plan A offers $2M annual limit compared to Prudential's $1M, giving AIA a clear edge for high-cost treatments.",
    category: 'sales-angles'
  },

  // Q56 — correct: 3
  {
    question: "What is AIA's advantage over Great Eastern in lifetime limits?",
    options: [
      "AIA offers $10M lifetime vs Great Eastern's $5M",
      "Both have unlimited lifetime limits",
      "Great Eastern has better lifetime limits",
      "AIA offers unlimited lifetime vs Great Eastern's $5M"
    ],
    correct: 3,
    explanation: "AIA's unlimited lifetime limit significantly outperforms Great Eastern's $5M cap, especially for chronic or recurring conditions.",
    category: 'sales-angles'
  },

  // Q57 — correct: 2
  {
    question: "What is AIA's pre- and post-hospitalization advantage over competitors?",
    options: [
      "AIA offers 90 days vs competitors' 30 days",
      "All insurers offer the same coverage period",
      "AIA's 13 months is the longest in the market",
      "AIA offers 6 months, same as most competitors"
    ],
    correct: 2,
    explanation: "AIA Plan A's 13-month pre- and post-hospitalization period is the longest in the Singapore market, covering more follow-up visits and tests.",
    category: 'sales-angles'
  },

  // Q58 — correct: 1
  {
    question: "When a prospect says they want to compare plans, which four competitor data points should you have ready?",
    options: [
      "Premium rates, cash value, investment returns, bonus rates",
      "Annual limits, lifetime limits, panel size, pre/post-hospitalization period",
      "Waiting periods, exclusion lists, rider names, premium modes",
      "Agent commission, claim settlement time, customer reviews, branch count"
    ],
    correct: 1,
    explanation: "The four key comparison points are: annual limits ($2M vs lower), lifetime limits (unlimited vs capped), AQHP panel (500+), and pre/post-hospitalization (13 months).",
    category: 'sales-angles'
  },

  // Q59 — correct: 0
  {
    question: "How should pre-authorization be positioned as a benefit during sales conversations?",
    options: [
      "Cashless hospitalization — AIA pays the hospital directly so clients avoid large upfront bills",
      "It guarantees approval of all claims",
      "It reduces the deductible by half",
      "It eliminates co-insurance entirely"
    ],
    correct: 0,
    explanation: "Pre-authorization means cashless admission — AIA settles directly with the hospital, removing the stress of paying large bills upfront and waiting for reimbursement.",
    category: 'sales-angles'
  },

  // Q60 — correct: 3
  {
    question: "What rider value proposition should you lead with for families?",
    options: [
      "The rider adds dental coverage",
      "The rider provides outpatient GP visits",
      "The rider includes maternity benefits",
      "VitalHealth reduces co-insurance to 5% with a $3,000 cap — families know their maximum exposure"
    ],
    correct: 3,
    explanation: "For families, the VitalHealth rider's predictability is key — 5% co-insurance capped at $3,000/year means they always know their maximum out-of-pocket.",
    category: 'sales-angles'
  },

  // Q61 — correct: 2
  {
    question: "What is the strongest closing angle for prospects who already have MediShield Life only?",
    options: [
      "MediShield Life premiums will increase faster than ISP premiums",
      "MediShield Life is being phased out by the government",
      "MediShield Life caps at B2/C wards — one serious illness in a private hospital could cost tens of thousands out of pocket",
      "MediShield Life does not cover outpatient treatments"
    ],
    correct: 2,
    explanation: "The gap between B2/C ward coverage and actual private hospital costs is the strongest argument. A single surgery can cost $50K+ beyond MediShield Life limits.",
    category: 'sales-angles'
  },

  // Q62 — correct: 1
  {
    question: "When pitching to a self-employed prospect, what financial angle works best?",
    options: [
      "Corporate plans are unavailable to them",
      "No employer coverage means they bear 100% of medical costs — an ISP is their safety net against catastrophic bills",
      "Self-employed people get special premium discounts",
      "They can claim premiums as business expenses"
    ],
    correct: 1,
    explanation: "Self-employed individuals lack employer medical benefits, making them fully exposed to large medical bills. An ISP provides the safety net that employees take for granted.",
    category: 'sales-angles'
  },

  // Q63 — correct: 0
  {
    question: "What is the recommended approach when presenting Plan A vs Plan B to a cost-conscious prospect?",
    options: [
      "Show the premium difference is only $50-60/month for double the annual limit and private hospital access",
      "Always push Plan A as the only viable option",
      "Recommend Plan B Lite to save the most money",
      "Suggest they skip the rider to reduce costs"
    ],
    correct: 0,
    explanation: "Framing the Plan A upgrade as just $50-60/month more than Plan B for double coverage ($2M vs $1M) and private hospital access makes it feel like an affordable upgrade.",
    category: 'sales-angles'
  },

  // Q64 — correct: 3
  {
    question: "How should the Cancer Care Rider be positioned during a sales conversation?",
    options: [
      "It is mandatory for all plans",
      "It replaces the need for critical illness coverage",
      "It is only needed for people with family cancer history",
      "At $36/year, it costs less than a single meal — and it significantly boosts cancer treatment coverage"
    ],
    correct: 3,
    explanation: "The $36/year price point makes the Cancer Care Rider a no-brainer add-on. Comparing it to a meal cost removes any price objection.",
    category: 'sales-angles'
  },

  // Q65 — correct: 2
  {
    question: "What is the most effective way to present the CTGTP benefit to prospects?",
    options: [
      "Explain the full regulatory framework behind CTGTP",
      "Skip it as most prospects won't need it",
      "Position it as future-proofing — gene therapies are the frontier of medicine and can cost $500K+ per treatment",
      "Mention it only if the prospect asks about it"
    ],
    correct: 2,
    explanation: "CTGTP coverage should be framed as future-proofing. Gene therapies like CAR-T can cost over $500K, making the $250K coverage a meaningful safety net.",
    category: 'sales-angles'
  },

  // Q66 — correct: 1
  {
    question: "When selling to parents for their children, what is the primary value proposition?",
    options: [
      "Children get higher annual limits",
      "Lock in coverage at the lowest possible premiums and ensure lifelong insurability before any conditions develop",
      "Children don't need the VitalHealth rider",
      "Pediatric conditions are always excluded"
    ],
    correct: 1,
    explanation: "Insuring children locks in extremely low premiums and guarantees insurability. Any conditions developed later won't affect their coverage.",
    category: 'sales-angles'
  },

  // Q67 — correct: 0
  {
    question: "How should you frame the comparison between AIA and NTUC Income?",
    options: [
      "AIA offers $2M annual and unlimited lifetime vs NTUC Income's $1.2M annual and $4M lifetime",
      "NTUC Income has better panel doctor access",
      "Both companies offer identical coverage",
      "NTUC Income offers lower premiums for the same coverage"
    ],
    correct: 0,
    explanation: "AIA's $2M annual / unlimited lifetime significantly outperforms NTUC Income's $1.2M annual / $4M lifetime, especially for prolonged or recurring treatments.",
    category: 'sales-angles'
  },

  // Q68 — correct: 3
  {
    question: "What is the best way to handle a prospect who wants to 'think about it'?",
    options: [
      "Give them a brochure and follow up in a month",
      "Offer a discount if they sign today",
      "Tell them premiums might double next month",
      "Remind them that every year of delay costs roughly 5% more, and their health status today is their best asset"
    ],
    correct: 3,
    explanation: "The 5% annual delay cost combined with the health status argument creates genuine urgency without being pushy.",
    category: 'sales-angles'
  },

  // Q69 — correct: 2
  {
    question: "What premium payment strategy should you recommend for a prospect concerned about long-term affordability?",
    options: [
      "Pay annually to get a discount",
      "Use SRS funds for premium payment",
      "Build a dividend portfolio at 6% yield to generate passive income covering premiums",
      "Switch to a lower plan every 5 years"
    ],
    correct: 2,
    explanation: "The dividend portfolio strategy turns premiums from a sunk cost into an investment outcome — at 6% yield, a modest portfolio can fully cover escalating premiums.",
    category: 'sales-angles'
  },

  // Q70 — correct: 1
  {
    question: "When positioning the VitalHealth Value rider, what is the key trade-off to explain?",
    options: [
      "Lower premium but longer waiting period",
      "Lower premium with a higher co-insurance cap ($6,000 vs $3,000), saving ~$1,400/year",
      "Same premium but reduced panel access",
      "Lower premium but no pre-authorization"
    ],
    correct: 1,
    explanation: "The Value variant saves ~$1,400/year by accepting a higher co-insurance cap of $6,000 instead of $3,000 — still a meaningful cap for most hospitalization scenarios.",
    category: 'sales-angles'
  },

  // Q71 — correct: 0
  {
    question: "For a prospect approaching retirement, what is the most compelling opening question?",
    options: [
      "Have you calculated how much you'll spend on health insurance from 65 to 90?",
      "Do you know what ward class your current plan covers?",
      "Are you aware that MediShield Life exists?",
      "Would you like to see our premium schedule?"
    ],
    correct: 0,
    explanation: "Opening with the lifetime cost question (potentially $171K-$412K) creates awareness of the magnitude and frames the conversation around planning rather than selling.",
    category: 'sales-angles'
  },

  // Q72 — correct: 3
  {
    question: "How should you position AIA's unlimited lifetime limit against competitors with capped limits?",
    options: [
      "It only matters for very wealthy clients",
      "Capped limits are sufficient for most people",
      "Focus on annual limits instead",
      "With rising medical costs, a $3-5M cap could be exhausted by one chronic condition over 20+ years — unlimited means true lifetime protection"
    ],
    correct: 3,
    explanation: "Chronic conditions like cancer or kidney disease can accumulate millions in treatment costs over decades. An unlimited lifetime limit ensures the policy never runs dry.",
    category: 'sales-angles'
  },

  // Q73 — correct: 2
  {
    question: "What is the best response when a prospect asks why AIA premiums are higher than a competitor?",
    options: [
      "AIA is a bigger company so costs more",
      "The competitor is cutting corners on coverage",
      "You're comparing the annual and lifetime limits, AQHP panel, and pre/post coverage — AIA's higher limits justify the premium difference",
      "AIA premiums are actually the lowest in the market"
    ],
    correct: 2,
    explanation: "Redirect from price to value — $2M annual, unlimited lifetime, 500+ AQHP doctors, and 13-month pre/post coverage justify any premium difference.",
    category: 'sales-angles'
  },

  // Q74 — correct: 1
  {
    question: "What MediSave angle works best for prospects worried about cash outflow?",
    options: [
      "MediSave covers the full premium",
      "MediSave AWL offsets part of the base premium, so the actual cash outlay is lower than the stated premium",
      "MediSave has no withdrawal limits",
      "MediSave can pay for rider premiums too"
    ],
    correct: 1,
    explanation: "Highlighting that MediSave AWL ($300-$900/year depending on age) reduces the actual cash portion helps prospects see the true out-of-pocket cost.",
    category: 'sales-angles'
  },

  // Q75 — correct: 0
  {
    question: "What closing technique works best after a comprehensive plan comparison?",
    options: [
      "Ask which plan feels right given their budget and peace of mind, then recommend the one that matches — don't oversell",
      "Always recommend Plan A regardless of budget",
      "Let them go home and decide on their own",
      "Push the cheapest plan to close quickly"
    ],
    correct: 0,
    explanation: "Matching the plan to their stated budget and comfort level builds trust. Recommending the right fit (not the most expensive) leads to higher close rates and fewer cancellations.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (25 questions) — Q76–Q100
  // ============================================================

  // Q76 — correct: 3
  {
    question: "A prospect says: 'It's too expensive — I can't afford $90/month.' What is the best response?",
    options: [
      "Offer to pay the first month for them",
      "Agree that it is expensive and move on",
      "Tell them to wait until they earn more",
      "Break it down: $90/month is $3/day — less than breakfast. Then show Plan B at $25/month as an alternative that still upgrades from MediShield Life"
    ],
    correct: 3,
    explanation: "Reframe to daily cost ($3/day), then offer Plan B as a stepping stone. This validates their concern while keeping them in the conversation.",
    category: 'objection-handling'
  },

  // Q77 — correct: 1
  {
    question: "A prospect says: 'I already have MediShield Life, that's enough.' How should you respond?",
    options: [
      "Tell them MediShield Life is being discontinued",
      "Explain the coverage gap: MediShield Life covers B2/C wards with a $200K annual limit. A private hospital surgery can easily cost $50K-$100K beyond those limits",
      "Agree that MediShield Life is sufficient",
      "Show them competitor plans instead"
    ],
    correct: 1,
    explanation: "Quantify the gap — MediShield Life's B2/C coverage leaves massive exposure in private hospitals. Real surgery cost examples make the gap tangible.",
    category: 'objection-handling'
  },

  // Q78 — correct: 0
  {
    question: "A prospect says: 'Premiums keep increasing every year — what's the point?' What is the best approach?",
    options: [
      "Acknowledge the increase, explain it tracks medical inflation, then present the dividend portfolio strategy at 6% yield to make premiums self-funding over time",
      "Promise that premiums won't increase",
      "Switch to a different product",
      "Tell them all insurance has the same problem"
    ],
    correct: 0,
    explanation: "Validate their frustration, explain the 'why' (medical inflation), then pivot to the solution: a dividend portfolio that grows to offset premium increases.",
    category: 'objection-handling'
  },

  // Q79 — correct: 2
  {
    question: "A prospect says: 'I don't need a private ward — public hospital is fine.' How do you handle this?",
    options: [
      "Insist that private wards are always better",
      "Tell them public hospitals are unreliable",
      "Agree that public hospitals are excellent, then explain that Plan B/B Lite covers public hospital B1/A wards with shorter wait times and single-bed privacy for only $25/month",
      "Show them Plan A pricing anyway"
    ],
    correct: 2,
    explanation: "Validate their trust in public healthcare, then reframe — upgrading within public hospitals (B1/A wards) gives privacy and shorter waits without private hospital costs.",
    category: 'objection-handling'
  },

  // Q80 — correct: 3
  {
    question: "A prospect says: 'I have pre-existing conditions, so I'll probably be rejected.' What should you say?",
    options: [
      "Confirm that they will likely be rejected",
      "Tell them to hide their conditions",
      "Suggest waiting until conditions resolve",
      "Explain the 5-year moratorium: after 5 years without symptoms or treatment, pre-existing conditions can be covered. Also, MediShield Life already covers pre-existing conditions as a base"
    ],
    correct: 3,
    explanation: "The moratorium mechanism gives hope — pre-existing conditions aren't permanent exclusions. Plus, MediShield Life's base covers them from day one.",
    category: 'objection-handling'
  },

  // Q81 — correct: 1
  {
    question: "A prospect says: 'I'll decide later — no rush.' How should you create urgency?",
    options: [
      "Tell them the promotion ends tomorrow",
      "Explain that every year of delay costs approximately 5% more in premiums, and their current good health is their most valuable asset for underwriting",
      "Say there's limited supply of policies",
      "Agree and schedule a follow-up in 6 months"
    ],
    correct: 1,
    explanation: "The 5% annual delay cost is factual and creates genuine urgency. Combining it with the health-as-an-asset argument makes waiting feel like a tangible loss.",
    category: 'objection-handling'
  },

  // Q82 — correct: 0
  {
    question: "A prospect says: 'I can self-insure — I have enough savings.' What is the best counter?",
    options: [
      "Ask if they've factored in $171K-$412K in lifetime hospital costs, plus the risk of a single catastrophic event wiping out years of savings that could otherwise grow through investments",
      "Agree that self-insurance is a valid strategy",
      "Tell them their savings won't be enough",
      "Show them the cheapest plan available"
    ],
    correct: 0,
    explanation: "Quantify the lifetime cost ($171K-$412K) and frame the opportunity cost — money spent on medical bills can't compound in investments. Insurance preserves wealth.",
    category: 'objection-handling'
  },

  // Q83 — correct: 2
  {
    question: "A prospect says: 'My company already covers my medical expenses.' How do you respond?",
    options: [
      "Tell them corporate coverage is always insufficient",
      "Agree and close the meeting",
      "Ask what happens when they change jobs, get retrenched, or retire — corporate coverage ends immediately, and buying at an older age means higher premiums and possible exclusions",
      "Suggest they wait until they leave the company"
    ],
    correct: 2,
    explanation: "Corporate coverage is temporary. The key question is: what happens when it ends? Buying personal coverage now locks in younger premiums and broader insurability.",
    category: 'objection-handling'
  },

  // Q84 — correct: 3
  {
    question: "A prospect says: 'I don't trust insurance companies — they always reject claims.' How should you address this?",
    options: [
      "Promise that AIA never rejects claims",
      "Criticize other insurance companies",
      "Show them the policy wording in detail",
      "Share AIA's claim approval rate, explain pre-authorization (AIA pays hospital directly), and offer to walk through a real claim example showing what's covered"
    ],
    correct: 3,
    explanation: "Address distrust with data (approval rates), process (pre-authorization shows commitment to paying), and transparency (walking through coverage builds confidence).",
    category: 'objection-handling'
  },

  // Q85 — correct: 1
  {
    question: "A prospect says: 'The co-insurance and deductible are confusing — I don't understand what I'll pay.' How do you simplify?",
    options: [
      "Tell them to ignore the details and trust the coverage",
      "Use a real example: '$30,000 bill → minus $3,500 deductible → $26,500 covered at 95% with VitalHealth → you pay $3,500 + $1,325 = $4,825 total'",
      "Give them the brochure to read at home",
      "Skip the explanation and focus on benefits"
    ],
    correct: 1,
    explanation: "Concrete dollar examples cut through confusion. Walking through a real claim scenario makes deductible + co-insurance tangible and manageable.",
    category: 'objection-handling'
  },

  // Q86 — correct: 0
  {
    question: "A prospect says: 'I'm young and healthy — I don't need this yet.' What is the strongest counter?",
    options: [
      "That's exactly when you should get it — premiums are lowest now, and any condition you develop later becomes a pre-existing condition that may be excluded or loaded",
      "You're right, wait until you're older",
      "Young people get injured too",
      "Show them cancer statistics for young adults"
    ],
    correct: 0,
    explanation: "Youth + health = lowest premiums and no exclusions. Frame current health as a depreciating asset — once conditions develop, the window for full coverage narrows.",
    category: 'objection-handling'
  },

  // Q87 — correct: 2
  {
    question: "A prospect says: 'I want to compare with Prudential/Great Eastern first.' How should you respond?",
    options: [
      "Discourage comparison and push for immediate close",
      "Say competitors are unreliable",
      "Encourage the comparison and provide a side-by-side: AIA's $2M annual, unlimited lifetime, 500+ AQHP, and 13-month pre/post vs their specific limits — let the numbers speak",
      "Offer a deeper discount to prevent comparison"
    ],
    correct: 2,
    explanation: "Welcoming comparison shows confidence. Providing a factual side-by-side positions you as transparent and lets AIA's stronger numbers win on merit.",
    category: 'objection-handling'
  },

  // Q88 — correct: 3
  {
    question: "A prospect says: 'What if I never make a claim? Then all those premiums are wasted.' How do you handle this?",
    options: [
      "Tell them they will definitely need to claim someday",
      "Offer a premium refund guarantee",
      "Agree that it's a valid concern",
      "Reframe: insurance protects your wealth, not just your health. The premiums buy freedom from a single $100K+ bill that could derail retirement plans"
    ],
    correct: 3,
    explanation: "Shift from 'will I claim?' to 'what would one major claim cost without coverage?' — framing premiums as wealth protection, not a bet on getting sick.",
    category: 'objection-handling'
  },

  // Q89 — correct: 1
  {
    question: "A prospect says: 'My parents never had insurance and they were fine.' How do you respond?",
    options: [
      "Tell them their parents were irresponsible",
      "Explain that medical costs have changed dramatically — a heart bypass today costs $50K-$80K vs $10K a generation ago, and survival rates mean longer treatment periods",
      "Agree that older generations managed without insurance",
      "Show them a premium comparison chart"
    ],
    correct: 1,
    explanation: "Acknowledge the past while highlighting that medical costs have multiplied. Modern medicine keeps people alive longer, meaning more treatments and higher cumulative costs.",
    category: 'objection-handling'
  },

  // Q90 — correct: 0
  {
    question: "A prospect says: 'I'll just go to JB (Johor Bahru) for medical treatment — it's much cheaper.' How should you respond?",
    options: [
      "Acknowledge that some treatments are cheaper overseas, but explain that emergencies don't wait — a heart attack or stroke requires immediate local treatment, and ISP ensures you're covered without hesitation",
      "Tell them overseas treatment is never covered",
      "Agree that JB is a better option",
      "Say AIA only covers Singapore hospitals"
    ],
    correct: 0,
    explanation: "Validate the medical tourism point for elective care, but pivot to emergencies where immediate local access is critical. An ISP removes the 'can I afford it?' question during crises.",
    category: 'objection-handling'
  },

  // Q91 — correct: 3
  {
    question: "A prospect says: 'I want to downgrade my current plan to save money.' What should you recommend?",
    options: [
      "Downgrade to MediShield Life only",
      "Cancel the rider first, then the base plan",
      "Switch to a completely different insurer",
      "Consider VitalHealth A Value (saves ~$1,400/year) before downgrading the base plan — maintains Plan A coverage with a higher co-insurance cap"
    ],
    correct: 3,
    explanation: "The VitalHealth A Value variant is the first lever to pull for savings (~$1,400/year) while keeping Plan A's private hospital coverage and $2M annual limit intact.",
    category: 'objection-handling'
  },

  // Q92 — correct: 2
  {
    question: "A prospect says: 'The 10% co-insurance means I'm still paying a lot out of pocket.' How do you address this?",
    options: [
      "Tell them co-insurance is unavoidable for all insurers",
      "Recommend they skip insurance entirely",
      "Explain the VitalHealth rider reduces it to 5% with a $3,000/year cap — so on a $100K bill, the maximum out-of-pocket is $3,000, not $10,000",
      "Say the co-insurance rarely applies in practice"
    ],
    correct: 2,
    explanation: "The VitalHealth rider transforms the co-insurance concern — from a potentially large 10% share to a predictable 5% capped at $3,000/year maximum.",
    category: 'objection-handling'
  },

  // Q93 — correct: 1
  {
    question: "A prospect says: 'I heard ISP plans don't cover outpatient treatments.' How should you correct this?",
    options: [
      "Confirm that outpatient is never covered",
      "Clarify that HealthShield Gold Max covers outpatient chemo ($36K/year), pre/post-hospitalization visits (up to 13 months for Plan A), and day surgery",
      "Tell them to buy a separate outpatient plan",
      "Explain that only GP visits are excluded"
    ],
    correct: 1,
    explanation: "ISPs do cover significant outpatient components — chemotherapy, pre/post-hospitalization, and day surgery. The misconception is that only inpatient stays are covered.",
    category: 'objection-handling'
  },

  // Q94 — correct: 0
  {
    question: "A prospect says: 'What if AIA goes bankrupt?' How do you address this concern?",
    options: [
      "Explain that ISPs are regulated by MAS, MediShield Life is government-backed, and AIA is one of the largest insurers in Asia-Pacific with over 100 years of history",
      "Promise that AIA will never go bankrupt",
      "Say the government will bail AIA out",
      "Tell them to diversify across multiple insurers"
    ],
    correct: 0,
    explanation: "Address with facts: MAS regulation, government-backed MediShield Life base layer, and AIA's scale and history. The regulatory framework protects policyholders.",
    category: 'objection-handling'
  },

  // Q95 — correct: 3
  {
    question: "A prospect says: 'My friend claimed and AIA only paid 85%. That's not fair.' How should you explain this?",
    options: [
      "Deny that this ever happens",
      "Blame the friend for choosing wrong",
      "Say proration is standard across all insurers",
      "Explain the 85% was likely proration for not using an AQHP doctor or getting pre-authorization — with either, claims are paid at 100% of eligible amounts"
    ],
    correct: 3,
    explanation: "This is almost certainly a proration issue. Educating about AQHP and pre-authorization turns a complaint into a selling point for AIA's structured panel system.",
    category: 'objection-handling'
  },

  // Q96 — correct: 2
  {
    question: "A prospect says: 'I'll just use my MediSave if I get hospitalized.' How do you respond?",
    options: [
      "MediSave can cover any hospital bill",
      "MediSave has no withdrawal limits",
      "MediSave has withdrawal limits ($450-$900/day depending on ward) that cover only a fraction of actual hospital bills — a 5-day private hospital stay can cost $30K+ while MediSave covers perhaps $4,500",
      "MediSave is only for retirement"
    ],
    correct: 2,
    explanation: "Quantify the gap between MediSave daily limits and actual costs. A real hospitalization example shows MediSave alone leaves significant out-of-pocket exposure.",
    category: 'objection-handling'
  },

  // Q97 — correct: 1
  {
    question: "A prospect says: 'Insurance agents just want commission.' How should you handle this professionally?",
    options: [
      "Deny that you earn commission",
      "Acknowledge it directly: 'Yes, I earn from this — but my income depends on renewals, which only happen if you're satisfied. My incentive is to find you the right plan, not the most expensive one'",
      "Change the subject immediately",
      "Offer to reduce your commission"
    ],
    correct: 1,
    explanation: "Transparency builds trust. Explaining that long-term income depends on client satisfaction aligns your interests with theirs — the right plan, not the priciest plan.",
    category: 'objection-handling'
  },

  // Q98 — correct: 0
  {
    question: "A prospect says: 'I want to wait until the next premium review — maybe rates will go down.' How do you respond?",
    options: [
      "Medical inflation means premiums trend upward, not down. Waiting a year means entering at an older age band with higher rates — you cannot go back to today's premium once you're a year older",
      "Premiums might actually decrease next year",
      "AIA guarantees premium stability",
      "Switching insurers resets your premiums"
    ],
    correct: 0,
    explanation: "Premiums are age-banded and linked to medical inflation — they only go up. Each birthday moves the prospect to a higher band permanently. Waiting has no upside.",
    category: 'objection-handling'
  },

  // Q99 — correct: 3
  {
    question: "A prospect says: 'My spouse handles all financial matters — I need to check with them.' How should you proceed?",
    options: [
      "Insist they can decide on their own",
      "Give them brochures and hope they return",
      "Call the spouse immediately",
      "Offer to arrange a joint meeting with both — explain that health planning decisions benefit from both partners understanding the coverage and costs together"
    ],
    correct: 3,
    explanation: "Respect the dynamic while staying proactive. A joint meeting is better than sending brochures — you control the narrative and can address both partners' concerns.",
    category: 'objection-handling'
  },

  // Q100 — correct: 2
  {
    question: "A prospect says: 'The $3,500 deductible is too high — I'm paying premium AND a deductible?' How do you handle this?",
    options: [
      "Tell them to choose a plan without a deductible",
      "Explain that deductibles are optional",
      "Reframe: the $3,500 deductible is the maximum you pay before AIA covers the rest. On a $100K bill, you pay $3,500 + 5% co-insurance (capped at $3,000) = $6,500 max. Without insurance, you pay $100K",
      "Agree that the deductible is excessive"
    ],
    correct: 2,
    explanation: "Compare the deductible + co-insurance total ($6,500 max) against the alternative (paying the full bill). The contrast between $6,500 and $100K makes the deductible feel insignificant.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (20 questions) — Q101–Q120
  // ============================================================

  // Q101 — correct: 1
  {
    question: "Scenario: A 28-year-old PME earning $5,000/month says they're healthy and don't see the point of insurance. What is your best opening?",
    options: [
      "Show them statistics about young adults getting cancer",
      "Ask: 'If you were diagnosed with something serious tomorrow, how would you pay a $50K hospital bill without touching your savings or career plans?'",
      "Start with the premium schedule for Plan A",
      "Tell them they're being irresponsible"
    ],
    correct: 1,
    explanation: "Creating a personal scenario makes the risk real. Linking it to their savings and career (things they care about) is more effective than abstract statistics.",
    category: 'roleplay'
  },

  // Q102 — correct: 3
  {
    question: "Scenario: A couple in their 40s with two young children asks why they should upgrade from MediShield Life. What angle should you lead with?",
    options: [
      "Focus on the investment returns of the premium",
      "Explain policy administration details",
      "Show the competitor comparison chart first",
      "Ask: 'If one of you was hospitalized for 2 weeks, could the family handle a $30K-$50K bill while also losing income? An ISP keeps your savings intact for your children's needs'"
    ],
    correct: 3,
    explanation: "For parents, the dual concern is medical costs AND family financial stability. Connecting hospitalization to their children's wellbeing creates emotional resonance.",
    category: 'roleplay'
  },

  // Q103 — correct: 0
  {
    question: "Scenario: A 55-year-old prospect with diabetes asks if they can still get coverage. What should you explain?",
    options: [
      "Yes, MediShield Life already covers pre-existing conditions. For the ISP upgrade, diabetes may be excluded initially but covered after the 5-year moratorium if well-managed with no complications",
      "No, diabetes is a permanent exclusion",
      "They need to hide their diabetes on the application",
      "Only MediShield Life is available to them"
    ],
    correct: 0,
    explanation: "Provide a complete picture: MediShield Life covers it now, the ISP may exclude it initially, but the moratorium pathway exists. This gives hope while being honest.",
    category: 'roleplay'
  },

  // Q104 — correct: 2
  {
    question: "Scenario: A prospect currently on a competitor's plan with a $3M lifetime cap is considering switching to AIA. What is the primary risk you should flag?",
    options: [
      "AIA premiums are always higher",
      "They will lose all accumulated benefits",
      "The 40-day restriction period when switching means they have a coverage gap — any condition developing during this window may not be covered by the new insurer",
      "Switching is never recommended"
    ],
    correct: 2,
    explanation: "The 40-day restriction period is the key risk when switching ISPs. Being transparent about it builds trust and lets the prospect make an informed decision.",
    category: 'roleplay'
  },

  // Q105 — correct: 1
  {
    question: "Scenario: A self-employed hawker earning $3,000/month says insurance is for rich people. How do you respond?",
    options: [
      "Tell them they can't afford NOT to have insurance",
      "Show that Plan B Lite costs about $25/month and is payable partly with MediSave — less than one day's earnings, but protects against a single hospitalization that could shut down their business",
      "Recommend Plan A for comprehensive coverage",
      "Agree that it might not be for everyone"
    ],
    correct: 1,
    explanation: "Match the plan to their budget (Plan B Lite at $25/month), use MediSave to reduce cash outlay, and connect to their specific risk — business closure during hospitalization.",
    category: 'roleplay'
  },

  // Q106 — correct: 0
  {
    question: "Scenario: A 35-year-old woman planning to start a family asks about maternity coverage. What should you clarify?",
    options: [
      "HealthShield Gold Max covers pregnancy complications (not normal delivery) with a 10-month waiting period — advise her to start the policy before conception for the waiting period to pass",
      "Full maternity coverage is included from day one",
      "Maternity is never covered by any ISP",
      "She needs a separate maternity rider"
    ],
    correct: 0,
    explanation: "Set accurate expectations: ISPs cover complications (not normal delivery), with a 10-month wait. Timing advice (start before conception) adds practical value.",
    category: 'roleplay'
  },

  // Q107 — correct: 3
  {
    question: "Scenario: A prospect's elderly parent (age 72) needs coverage. MediSave AWL is $900/year. What approach do you take?",
    options: [
      "Tell them it's too late to get coverage",
      "Recommend the most comprehensive plan available",
      "Focus only on the premium schedule",
      "Show that the $900 MediSave AWL offsets a significant portion of the base premium, calculate the actual cash top-up needed, and recommend Plan B or B Lite for affordability"
    ],
    correct: 3,
    explanation: "For elderly parents, affordability is key. Calculate the actual cash needed after MediSave AWL, and recommend a suitable plan tier (B/B Lite) rather than overselling.",
    category: 'roleplay'
  },

  // Q108 — correct: 2
  {
    question: "Scenario: A prospect asks you to compare Plan A with VitalHealth vs Plan A with VitalHealth A Value. What is the key difference to highlight?",
    options: [
      "Value has a lower annual claim limit",
      "Value excludes cancer coverage",
      "Value has a higher co-insurance cap ($6,000 vs $3,000/year) but saves approximately $1,400/year in premiums — same base coverage, different out-of-pocket ceiling",
      "Value has a longer waiting period"
    ],
    correct: 2,
    explanation: "The only meaningful difference is the co-insurance cap ($6,000 vs $3,000). For prospects who rarely claim, the $1,400/year savings outweigh the higher cap.",
    category: 'roleplay'
  },

  // Q109 — correct: 1
  {
    question: "Scenario: During a meeting, a prospect pulls out a competitor brochure showing lower premiums. What do you do?",
    options: [
      "Dismiss the competitor brochure",
      "Welcome the comparison, then walk through the four key differentiators: annual limit, lifetime limit, AQHP panel size, and pre/post coverage — showing that lower premiums come with lower coverage",
      "Match the competitor's price",
      "End the meeting and follow up later"
    ],
    correct: 1,
    explanation: "Never dismiss a comparison — embrace it. Walk through the numbers side by side. Lower premiums almost always mean lower limits, fewer panel doctors, or shorter coverage periods.",
    category: 'roleplay'
  },

  // Q110 — correct: 0
  {
    question: "Scenario: A prospect who just recovered from a minor surgery asks if their claim will trigger the Waiver Pass penalty. What should you explain?",
    options: [
      "The first claim has no penalty under the Waiver Pass. If a second claim occurs within 36 months, then an additional $2,000 deductible applies. After 36 months of no claims, the Waiver Pass resets",
      "Every claim triggers the additional deductible",
      "The Waiver Pass only applies to Plan A",
      "Claims under $5,000 never trigger the penalty"
    ],
    correct: 0,
    explanation: "Clearly explain the three-part Waiver Pass mechanism: first claim free, second within 36 months adds $2,000, reset after 36 months. This removes anxiety about claiming.",
    category: 'roleplay'
  },

  // Q111 — correct: 3
  {
    question: "Scenario: A 30-year-old IT professional says they will 'just invest the premium money in ETFs instead.' How should you respond?",
    options: [
      "Tell them ETFs are risky investments",
      "Agree that ETFs are a better use of money",
      "Show them guaranteed insurance returns",
      "Explain that insurance and investments serve different purposes — one hospitalization event could force them to liquidate ETF holdings at a loss. Insurance protects the portfolio, not replaces it"
    ],
    correct: 3,
    explanation: "Don't compete with investments — complement them. The risk of forced liquidation during a downturn to pay medical bills is the key argument for having both.",
    category: 'roleplay'
  },

  // Q112 — correct: 2
  {
    question: "Scenario: A prospect wants Plan A but their spouse thinks it's too expensive. How do you navigate the conversation?",
    options: [
      "Side with the prospect against the spouse",
      "Recommend the cheapest option to avoid conflict",
      "Present the VitalHealth A Value option as a compromise — same Plan A base with ~$1,400/year savings — then show the daily cost breakdown to the spouse",
      "Tell the spouse they're wrong"
    ],
    correct: 2,
    explanation: "The Value variant is the perfect compromise — it preserves Plan A coverage while saving $1,400/year. The daily cost breakdown ($2-3/day) addresses the spouse's price sensitivity.",
    category: 'roleplay'
  },

  // Q113 — correct: 1
  {
    question: "Scenario: A 62-year-old pre-retiree asks how premiums will change from now until age 90. What numbers should you share?",
    options: [
      "Premiums stay flat throughout retirement",
      "Share the escalation data: premiums rise from approximately $565/year to $3,006/year by age 90, then show how a dividend portfolio started now can cover this escalation",
      "Tell them not to worry about future premiums",
      "Recommend they cancel at 75 to save money"
    ],
    correct: 1,
    explanation: "Transparency about premium escalation ($565 to $3,006) builds trust. Following up with the dividend portfolio solution shows you're solving the problem, not hiding it.",
    category: 'roleplay'
  },

  // Q114 — correct: 0
  {
    question: "Scenario: A prospect asks if they can use pre-authorization with their preferred private surgeon who is not on the AQHP panel. What do you tell them?",
    options: [
      "Yes — since April 2020, pre-authorization is available for ALL private specialists, not just AQHP doctors. With pre-authorization, no proration applies even outside the panel",
      "No, pre-authorization is only for AQHP doctors",
      "They must switch to an AQHP doctor",
      "Pre-authorization is not available for surgery"
    ],
    correct: 0,
    explanation: "This is a common misconception. Since April 2020, pre-authorization works with ANY private specialist. This removes the perceived restriction of the AQHP panel.",
    category: 'roleplay'
  },

  // Q115 — correct: 3
  {
    question: "Scenario: A prospect's child (age 5) was recently diagnosed with asthma. The parent asks about coverage. How should you advise?",
    options: [
      "Asthma is permanently excluded from all ISPs",
      "Wait until the child outgrows asthma",
      "Apply to a different insurer that doesn't ask about asthma",
      "Apply now — asthma may be excluded initially, but the 5-year moratorium means it can be covered by age 10 if well-controlled. Delaying means the child enters at a higher age band"
    ],
    correct: 3,
    explanation: "Apply now for two reasons: the moratorium clock starts ticking (covered by age 10), and entering at age 5 locks in the lowest premiums. Waiting has no advantage.",
    category: 'roleplay'
  },

  // Q116 — correct: 2
  {
    question: "Scenario: A high-income professional ($15K/month) says they only need MediShield Life because they can afford to pay out of pocket. What do you say?",
    options: [
      "Agree they don't need additional coverage",
      "Tell them they're wasting their money",
      "Reframe: 'You can afford it now — but a $200K cancer treatment depletes savings you'd rather keep invested. Plan A at $90/month protects your portfolio and lifestyle, not just your health'",
      "Recommend the Standard plan only"
    ],
    correct: 2,
    explanation: "For high-income prospects, the argument isn't affordability — it's wealth preservation. Insurance protects their investment portfolio from being raided by medical bills.",
    category: 'roleplay'
  },

  // Q117 — correct: 1
  {
    question: "Scenario: A prospect asks what happens if they need organ transplant surgery. What coverage details should you share?",
    options: [
      "Organ transplants are excluded from all ISPs",
      "HealthShield Gold Max covers $60,000 per transplant (per policy year and lifetime), plus post-transplant immunosuppressants at $7,200/year — explain both the surgery and ongoing medication coverage",
      "Only kidney transplants are covered",
      "Coverage is limited to $10,000 per transplant"
    ],
    correct: 1,
    explanation: "Provide both the transplant benefit ($60K) and the often-overlooked immunosuppressant coverage ($7,200/year). Ongoing medication costs are a major concern for transplant patients.",
    category: 'roleplay'
  },

  // Q118 — correct: 0
  {
    question: "Scenario: A prospect with two policies (life insurance and health insurance from different insurers) asks if they should consolidate with AIA. What should you consider?",
    options: [
      "Focus on the health insurance switch — highlight AIA's superior limits and AQHP, but warn about the 40-day restriction period. Recommend maintaining the existing life policy unless there's a compelling reason to switch",
      "Always recommend consolidating everything with AIA",
      "Tell them to keep all existing policies unchanged",
      "Life and health insurance are the same thing"
    ],
    correct: 0,
    explanation: "Be strategic — health insurance may benefit from AIA's advantages, but life insurance switches carry different risks. The 40-day restriction period must be flagged transparently.",
    category: 'roleplay'
  },

  // Q119 — correct: 3
  {
    question: "Scenario: A newly married couple (both age 30) wants to cover both partners. What package approach should you recommend?",
    options: [
      "One policy for both of them",
      "Only the higher earner needs coverage",
      "Wait until they have children",
      "Individual policies for each — recommend Plan B with VitalHealth as a balanced starting point ($25/month each), with the option to upgrade to Plan A later. Emphasize locking in insurability before any pregnancies or conditions"
    ],
    correct: 3,
    explanation: "Individual policies (not joint), balanced plan recommendation (Plan B), and the insurability lock-in angle for a couple likely to start a family soon.",
    category: 'roleplay'
  },

  // Q120 — correct: 2
  {
    question: "Scenario: A prospect who is an existing AIA whole life policyholder asks if they get any benefit when adding HealthShield Gold Max. What should you highlight?",
    options: [
      "They get a 50% premium discount",
      "Whole life and health insurance can't be with the same insurer",
      "Having both with AIA simplifies claims coordination — one insurer handles everything. Additionally, their existing relationship may smooth underwriting, and they can manage all policies through one AIA app",
      "There is no benefit to consolidating"
    ],
    correct: 2,
    explanation: "The practical benefits of consolidation: simpler claims, relationship advantage for underwriting, and single-app management. Don't promise discounts that don't exist.",
    category: 'roleplay'
  }
];
