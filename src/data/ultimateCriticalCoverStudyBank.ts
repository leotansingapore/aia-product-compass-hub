import type { StudyQuestion } from './proAchieverStudyBank';

export const ultimateCriticalCoverStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (45 questions) -- Q1-Q45
  // ============================================================

  // Q1 -- correct: 2
  {
    question: "What type of insurance product is AIA Ultimate Critical Cover (UCC)?",
    options: [
      "A single-premium endowment plan with critical illness riders",
      "An investment-linked policy with CI coverage",
      "A multi-pay critical illness plan",
      "A whole life participating plan with CI benefits"
    ],
    correct: 2,
    explanation: "UCC is a multi-pay critical illness plan designed for multiple payouts across different stages of critical illnesses.",
    category: 'product-facts'
  },

  // Q2 -- correct: 1
  {
    question: "How many critical illnesses and condition-stage entries does UCC cover?",
    options: [
      "104 critical illnesses across 200 stages",
      "73 underlying critical illnesses across 150 condition-stage entries (42 Early + 35 Intermediate + 73 Major)",
      "200 critical illnesses across all stages",
      "53 critical illnesses across early stage only"
    ],
    correct: 1,
    explanation: "UCC covers 73 underlying critical illnesses, generating 150 condition-stage entries: 42 Early + 35 Intermediate + 73 Major (Brochure p.13 totals row; PS p.3).",
    category: 'product-facts'
  },

  // Q3 -- correct: 0
  {
    question: "What are the coverage term options available for UCC?",
    options: [
      "Until age 65, 75, or 85",
      "Until age 55, 65, or 75",
      "Until age 70, 80, or 90",
      "Until age 60, 70, or 80"
    ],
    correct: 0,
    explanation: "UCC offers three flexible coverage term options: until age 65, 75, or 85.",
    category: 'product-facts'
  },

  // Q4 -- correct: 3
  {
    question: "Does UCC have any cash value or surrender value?",
    options: [
      "Yes, it builds cash value after 10 years",
      "Yes, it has guaranteed surrender value from year 3",
      "Yes, but only if coverage is until age 85",
      "No, it is a pure critical illness plan with no cash value"
    ],
    correct: 3,
    explanation: "UCC is a pure CI plan with no cash value. This keeps premiums lower but means there is no savings component.",
    category: 'product-facts'
  },

  // Q5 -- correct: 1
  {
    question: "What happens to premiums after a diagnosis under UCC's base plan?",
    options: [
      "All future premiums are automatically waived",
      "Premiums must continue to be paid unless the Premium Waiver rider is attached",
      "Premiums are reduced by 50% after the first claim",
      "Premiums are frozen at the current amount with no further increases"
    ],
    correct: 1,
    explanation: "The base UCC plan requires continued premium payments after a claim. The Premium Waiver rider (ECPWP) must be added separately to waive future premiums.",
    category: 'product-facts'
  },

  // Q6 -- correct: 0
  {
    question: "What is the approximate monthly premium for a 25-year-old male with $100k sum assured, paid to age 75?",
    options: [
      "About $50 per month",
      "About $80 per month",
      "About $120 per month",
      "About $35 per month"
    ],
    correct: 0,
    explanation: "A 25-year-old male with $100k sum assured pays approximately $50 per month with premiums paid to age 75.",
    category: 'product-facts'
  },

  // Q7 -- correct: 2
  {
    question: "What is the first-year commission range for UCC as a percentage of annual premium?",
    options: [
      "20-30% of annual premium",
      "55-65% of annual premium",
      "40-50% of annual premium",
      "30-40% of annual premium"
    ],
    correct: 2,
    explanation: "UCC pays 40-50% of annual premium as first-year commission, which works out to approximately $240-300 for a typical case.",
    category: 'product-facts'
  },

  // Q8 -- correct: 3
  {
    question: "How is the UCC base coverage restored to 100% after a claim?",
    options: [
      "6 months from the policy anniversary",
      "24 months from the date of policy issue",
      "36 months from the date the premium is paid",
      "If the policy is in force 12 months after the date of the latest diagnosed critical illness, the Current Insured Amount is restored to 100%"
    ],
    correct: 3,
    explanation: "Per PS p.7: the 12 months runs from the date of the latest diagnosed critical illness (the last admitted claim), not 'between claims' generically. After this period the Current Insured Amount restores to 100%.",
    category: 'product-facts'
  },

  // Q9 -- correct: 1
  {
    question: "How does the UCC payout structure split between major stage and earlier stages?",
    options: [
      "300% of sum assured combined",
      "Unlimited at major stage across DIFFERENT illnesses; early and intermediate stages capped at 500% combined of coverage amount",
      "500% of sum assured across all stages",
      "200% of sum assured across all stages"
    ],
    correct: 1,
    explanation: "Brochure footnote 1 (p.14): unlimited claims apply only to the major stage of critical illnesses. Early and intermediate stages are capped at 500% of coverage amount combined, with a S$350,000 per-life cap on the same CI across all UCC policies.",
    category: 'product-facts'
  },

  // Q10 -- correct: 0
  {
    question: "Which unique partnership does AIA offer exclusively with UCC?",
    options: [
      "Teladoc medical concierge service",
      "Mount Elizabeth specialist referral program",
      "Raffles Medical priority access",
      "National University Hospital second opinion service"
    ],
    correct: 0,
    explanation: "AIA partners with Teladoc to provide medical concierge services including second opinions and access to 50,000+ specialists worldwide.",
    category: 'product-facts'
  },

  // Q11 -- correct: 2
  {
    question: "How many specialists can UCC policyholders access through the Teladoc partnership?",
    options: [
      "10,000+ specialists",
      "25,000+ specialists",
      "50,000+ specialists",
      "100,000+ specialists"
    ],
    correct: 2,
    explanation: "The Teladoc partnership gives UCC policyholders access to over 50,000 specialists worldwide.",
    category: 'product-facts'
  },

  // Q12 -- correct: 1
  {
    question: "What conditions does the Teladoc Health service cover under UCC?",
    options: [
      "Only cancer-related conditions",
      "All conditions covered under UCC except Terminal Illness, covered Mental Illnesses, Emergency Care, and any urgent invasive or urgent surgical procedures",
      "Cancer, cardiovascular, and neurological conditions only",
      "Only conditions requiring surgery"
    ],
    correct: 1,
    explanation: "Per Brochure p.6: Teladoc Health covers ALL conditions under UCC except Terminal Illness, covered Mental Illnesses and Emergency Care, and any medical conditions of urgent invasive and/or urgent surgical procedures. The scope is broader than just cancer/cardio/neuro.",
    category: 'product-facts'
  },

  // Q13 -- correct: 3
  {
    question: "What does 'unlimited claims' precisely mean under UCC's base plan?",
    options: [
      "Unlimited claims for the same illness at any stage",
      "Unlimited claims for cancer relapses",
      "Unlimited claims regardless of illness or stage",
      "Unlimited claims at MAJOR STAGE across DIFFERENT illnesses (each capped by total payouts not exceeding 100% of insured amount per CI). Early and intermediate stages are capped at 500% of coverage amount combined and S$350,000 per-life on the same CI"
    ],
    correct: 3,
    explanation: "Brochure footnote 1 (p.14) and PS p.4: the 'unlimited' mechanic applies to the major stage of critical illnesses across different illnesses. Early + intermediate combined are capped at 500% of coverage amount, with a per-life S$350,000 cap on the same CI. Same-illness major-stage relapse needs the Enhancer.",
    category: 'product-facts'
  },

  // Q14 -- correct: 0
  {
    question: "Without the Enhancer, a client claims major-stage Heart Attack at 100%. Months later they suffer another major-stage heart attack. What happens?",
    options: [
      "The second major-stage heart attack is NOT paid because the first claim already exhausted that CI's 100% (PS p.3 caps total payouts on one CI at 100% of insured amount). However, stage-progression on a different CI, or a different CI entirely, would still be covered until 100% per CI is reached",
      "The second heart attack is covered at 100%",
      "The second heart attack is covered at 50%",
      "The second heart attack is covered after a 24-month waiting period"
    ],
    correct: 0,
    explanation: "Per PS p.3, total payouts across all stages of one CI cannot exceed 100% of insured amount. A second major-stage claim of the same CI is not paid because the first already exhausted 100%. The Enhancer's Ultimate Relapse Benefit is what covers same-illness recurrence after 100% has been paid, not generic 'second occurrences'.",
    category: 'product-facts'
  },

  // Q15 -- correct: 2
  {
    question: "What does the UCC Enhancer's Ultimate Relapse Benefit cover?",
    options: [
      "Additional early-stage critical illnesses",
      "Waiver of all future premiums",
      "Same-illness recurrence under 5 named conditions only: Re-diagnosed Major Cancer, Recurred Heart Attack, Recurred Stroke, Repeated Major Organ/Bone Marrow Transplant, Repeated Heart Valve Surgery; with a 2-year waiting period between claims; pays the lower of 50% of cover or current insured amount; capped at 100% of base cover total",
      "Higher payout for severe-stage illnesses"
    ],
    correct: 2,
    explanation: "Per Brochure p.4 and Enhancer p.6: the Ultimate Relapse Benefit applies to 5 named conditions only, with a 2-year waiting period between claims. It does NOT cover recurrences of, e.g., End Stage Liver Failure or Multiple Sclerosis.",
    category: 'product-facts'
  },

  // Q16 -- correct: 1
  {
    question: "How much does the UCC Enhancer rider cost for $100k sum assured?",
    options: [
      "About $3 per month",
      "About $7 per month",
      "About $12 per month",
      "About $15 per month"
    ],
    correct: 1,
    explanation: "The UCC Enhancer rider costs approximately $7 per month for $100k sum assured, making it very affordable to add same-illness relapse coverage.",
    category: 'product-facts'
  },

  // Q17 -- correct: 3
  {
    question: "What does the UCC Enhancer Ultimate Relapse Benefit pay per qualifying relapse?",
    options: [
      "100% of sum assured per relapse",
      "75% of sum assured per relapse",
      "25% of sum assured per relapse",
      "The lower of 50% of cover or the Current Insured Amount, with a 2-year waiting period between claims, capped at 100% of base cover total across relapse claims"
    ],
    correct: 3,
    explanation: "Per Brochure p.4 and Enhancer p.6: the Ultimate Relapse Benefit pays the lower of 50% of cover or the current insured amount per relapse, requires a 2-year waiting period between same-illness claims, and is capped at 100% of base cover total.",
    category: 'product-facts'
  },

  // Q18 -- correct: 0
  {
    question: "What does the Early Critical Illness Trigger rider add to UCC?",
    options: [
      "Coverage for early-stage critical illnesses",
      "Coverage for second occurrence of the same illness",
      "Waiver of premiums upon early-stage diagnosis",
      "Double payout for early-stage claims"
    ],
    correct: 0,
    explanation: "The Early Critical Illness Trigger rider adds coverage for early-stage critical illnesses to the UCC plan.",
    category: 'product-facts'
  },

  // Q19 -- correct: 2
  {
    question: "How much does the Early Critical Illness Trigger rider cost for $100k sum assured?",
    options: [
      "About $5 per month",
      "About $10 per month",
      "About $2 per month",
      "About $7 per month"
    ],
    correct: 2,
    explanation: "The Early Critical Illness Trigger rider costs approximately $2 per month for $100k sum assured.",
    category: 'product-facts'
  },

  // Q20 -- correct: 1
  {
    question: "What does the Premium Waiver (ECPWP) rider do?",
    options: [
      "Refunds all premiums paid at maturity",
      "Waives all future premiums after the first claim",
      "Reduces premiums by 50% after the first claim",
      "Freezes premiums at the current level permanently"
    ],
    correct: 1,
    explanation: "The Premium Waiver (ECPWP) rider ensures all future premiums are waived after the first critical illness claim.",
    category: 'product-facts'
  },

  // Q21 -- correct: 3
  {
    question: "How much does the Premium Waiver (ECPWP) rider cost for $100k sum assured?",
    options: [
      "About $2 per month",
      "About $7 per month",
      "About $10 per month",
      "About $4 per month"
    ],
    correct: 3,
    explanation: "The Premium Waiver (ECPWP) rider costs approximately $4 per month for $100k sum assured.",
    category: 'product-facts'
  },

  // Q22 -- correct: 0
  {
    question: "What is the total monthly cost for a 20-year-old non-smoker with $100k UCC coverage until age 65, including all three riders?",
    options: [
      "About $57 per month",
      "About $44 per month",
      "About $72 per month",
      "About $85 per month"
    ],
    correct: 0,
    explanation: "The total is approximately $57/month: base UCC ($44) + Enhancer ($7) + Early CI ($2) + Premium Waiver ($4).",
    category: 'product-facts'
  },

  // Q23 -- correct: 1
  {
    question: "What is the base UCC monthly premium for a 20-year-old non-smoker with $100k coverage until age 65?",
    options: [
      "About $57 per month",
      "About $44 per month",
      "About $50 per month",
      "About $35 per month"
    ],
    correct: 1,
    explanation: "The base UCC plan for a 20-year-old non-smoker with $100k coverage until age 65 costs approximately $44 per month.",
    category: 'product-facts'
  },

  // Q24 -- correct: 2
  {
    question: "Using canonical UCC condition names, what are the four major-stage claimable events in the heart progression staircase?",
    options: [
      "Coronary heart disease and heart attack (two claims only)",
      "Coronary heart disease, bypass and heart attack (three claims)",
      "Other Serious Coronary Artery Disease, Coronary Artery By-pass Surgery, Heart Attack of Specified Severity, and Heart Transplant (paid under Major Organ/Bone Marrow Transplantation)",
      "Only the most severe single condition"
    ],
    correct: 2,
    explanation: "Per Brochure p.11-13 condition list: the canonical names are 'Other Serious Coronary Artery Disease' (or 'Coronary Artery Disease'), 'Coronary Artery By-pass Surgery', 'Heart Attack of Specified Severity', and 'Major Organ / Bone Marrow Transplantation' (item 36) -- a heart transplant claim is paid under that condition; there is no standalone 'Heart Transplant' CI.",
    category: 'product-facts'
  },

  // Q25 -- correct: 3
  {
    question: "Per the Day 1 / Day 4 illustrative comparison, how does UCC's premium compare to Prudential's equivalent CI product?",
    options: [
      "UCC is approximately 11% more expensive",
      "UCC is approximately the same price",
      "UCC is approximately 6% cheaper",
      "UCC is approximately 11% cheaper based on Day 1 illustrative figures (always verify current iPOS quote -- competitor pricing is time-bound and not in any AIA-canonical PDF)"
    ],
    correct: 3,
    explanation: "Day 1 / Day 4 cite Video 1 with the explicit caveat that competitor figures are illustrative and time-bound. The 11% figure is not in any AIA-canonical PDF -- always verify in iPOS before quoting.",
    category: 'product-facts'
  },

  // Q26 -- correct: 0
  {
    question: "Per the Day 1 illustrative comparison, how does UCC's premium compare to Manulife's equivalent CI product?",
    options: [
      "UCC is approximately 29% cheaper based on Day 1 illustrative figures (always verify current iPOS quote -- competitor pricing is time-bound and not in any AIA-canonical PDF)",
      "UCC is approximately 15% cheaper",
      "UCC is approximately 29% more expensive",
      "UCC is approximately the same price"
    ],
    correct: 0,
    explanation: "Day 1 cites Video 1 with the explicit caveat that competitor pricing figures are illustrative and time-bound. The 29% figure is not in any AIA-canonical PDF -- always verify in iPOS before quoting.",
    category: 'product-facts'
  },

  // Q27 -- correct: 1
  {
    question: "Per the Day 1 illustrative comparison, how does UCC's premium compare to SingLife's equivalent CI product?",
    options: [
      "UCC is approximately 10% cheaper",
      "UCC is approximately 22% cheaper based on Day 1 illustrative figures (always verify current iPOS quote -- competitor pricing is time-bound and not in any AIA-canonical PDF)",
      "UCC is approximately 30% cheaper",
      "UCC is approximately 5% more expensive"
    ],
    correct: 1,
    explanation: "Day 1 cites Video 1 with the explicit caveat that competitor pricing figures are illustrative and time-bound. The 22% figure is not in any AIA-canonical PDF -- always verify in iPOS before quoting.",
    category: 'product-facts'
  },

  // Q28 -- correct: 2
  {
    question: "What restriction does Prudential's CI plan have that UCC does not?",
    options: [
      "Policy ceases after 3 claims",
      "Coverage only until age 65",
      "A 'related illness' restriction that blocks subsequent heart claims",
      "No coverage for early-stage illnesses"
    ],
    correct: 2,
    explanation: "Prudential has a 'related illness' restriction that blocks subsequent claims for related conditions (e.g., multiple heart conditions), which UCC does not have.",
    category: 'product-facts'
  },

  // Q29 -- correct: 0
  {
    question: "What happens to Great Eastern's CI policy after claims?",
    options: [
      "Policy ceases after 3 claims with a maximum payout of 300%",
      "Policy continues indefinitely with unlimited claims",
      "Policy ceases after 5 claims with a maximum payout of 500%",
      "Policy resets after each claim with no limit"
    ],
    correct: 0,
    explanation: "Great Eastern's CI policy ceases after 3 claims with a maximum total payout of 300% of sum assured.",
    category: 'product-facts'
  },

  // Q30 -- correct: 3
  {
    question: "Per Day 1 / Day 4 illustrative competitor data, how does Great Eastern's CI plan compare to UCC in covered conditions?",
    options: [
      "Great Eastern covers 150, UCC covers 200",
      "Great Eastern covers 100, UCC covers 150",
      "Great Eastern covers 75, UCC covers 104",
      "Day 1 / Day 4 cite Video 1: Great Eastern Great Critical Cover ~53 illnesses (illustrative, time-bound -- not in any AIA-canonical PDF) versus UCC's 73 underlying critical illnesses across 150 condition-stage entries (Brochure p.13). Always verify in iPOS"
    ],
    correct: 3,
    explanation: "Day 1 / Day 4 explicitly flag the 53-illness figure for Great Eastern as illustrative -- it does not appear in any AIA-canonical PDF. UCC's canonical figure is 73 CIs across 150 condition-stages (Brochure p.13).",
    category: 'product-facts'
  },

  // Q31 -- correct: 1
  {
    question: "What is the coverage reset mechanism for Great Eastern's CI plan?",
    options: [
      "Coverage resets to 100% after 12 months",
      "Coverage resets only twice (2x reset)",
      "Coverage never resets after a claim",
      "Coverage resets to 50% after each claim"
    ],
    correct: 1,
    explanation: "Great Eastern's CI plan only allows a 2x coverage reset, compared to UCC which resets after every 12-month waiting period with no limit.",
    category: 'product-facts'
  },

  // Q32 -- correct: 2
  {
    question: "What happens to a GPP or SFT plan after a critical illness claim?",
    options: [
      "The plan continues with reduced coverage",
      "The plan resets after 12 months",
      "The plan terminates after 1 claim with maximum 100% payout",
      "The plan continues with premium waiver"
    ],
    correct: 2,
    explanation: "GPP and SFT plans terminate after just 1 critical illness claim, paying a maximum of 100%. The policyholder then becomes uninsurable.",
    category: 'product-facts'
  },

  // Q33 -- correct: 0
  {
    question: "How is UCC best positioned in a client's portfolio?",
    options: [
      "As an add-on to GPP or SFT, not as a standalone product",
      "As a standalone replacement for all CI coverage",
      "As a replacement for medical insurance",
      "As a savings plan with CI benefits"
    ],
    correct: 0,
    explanation: "UCC is best positioned as an add-on to GPP or SFT plans to provide additional multi-claim CI coverage, not as a standalone product.",
    category: 'product-facts'
  },

  // Q34 -- correct: 1
  {
    question: "How does UCC structure its three-stage coverage by condition counts?",
    options: [
      "Only major-stage illnesses (73 conditions)",
      "Three stages -- 42 Early + 35 Intermediate + 73 Major = 150 condition-stage entries from 73 underlying critical illnesses",
      "Only early and major stages (no intermediate)",
      "Only intermediate and major stages"
    ],
    correct: 1,
    explanation: "Per Brochure p.13 totals row and PS p.3: UCC covers 73 underlying CIs split as 42 Early + 35 Intermediate + 73 Major = 150 condition-stage entries. Day 1 emphasises this as one of the 5 numbers to know cold.",
    category: 'product-facts'
  },

  // Q35 -- correct: 3
  {
    question: "What is the approximate annual premium for a 25-year-old female with $200k coverage until age 65?",
    options: [
      "About $2,328 per year",
      "About $3,320 per year",
      "About $1,000 per year",
      "About $1,400 per year"
    ],
    correct: 3,
    explanation: "A 25-year-old female with $200k coverage until age 65 pays approximately $1,400 per year.",
    category: 'product-facts'
  },

  // Q36 -- correct: 2
  {
    question: "What is the approximate annual premium for a 25-year-old female with $200k coverage until age 75?",
    options: [
      "About $1,400 per year",
      "About $3,320 per year",
      "About $2,328 per year",
      "About $1,800 per year"
    ],
    correct: 2,
    explanation: "A 25-year-old female with $200k coverage until age 75 pays approximately $2,328 per year.",
    category: 'product-facts'
  },

  // Q37 -- correct: 0
  {
    question: "What is the approximate annual premium for a 25-year-old female with $200k coverage until age 85?",
    options: [
      "About $3,320 per year",
      "About $2,328 per year",
      "About $4,500 per year",
      "About $1,400 per year"
    ],
    correct: 0,
    explanation: "A 25-year-old female with $200k coverage until age 85 pays approximately $3,320 per year.",
    category: 'product-facts'
  },

  // Q38 -- correct: 1
  {
    question: "What is the total premium outlay for a 25-year-old female with $200k coverage until age 75?",
    options: [
      "About $70,000 total",
      "About $116,000 total",
      "About $199,000 total",
      "About $85,000 total"
    ],
    correct: 1,
    explanation: "With $2,328/year paid from age 25 to 75 (50 years), the total premium outlay is approximately $116,000.",
    category: 'product-facts'
  },

  // Q39 -- correct: 3
  {
    question: "What is the total premium outlay for a 25-year-old female with $200k coverage until age 85?",
    options: [
      "About $116,000 total",
      "About $150,000 total",
      "About $70,000 total",
      "About $199,000 total"
    ],
    correct: 3,
    explanation: "With $3,320/year paid from age 25 to 85 (60 years), the total premium outlay is approximately $199,000.",
    category: 'product-facts'
  },

  // Q40 -- correct: 2
  {
    question: "What is the first-year commission amount for a typical UCC case with ~$600 annual premium?",
    options: [
      "About $120-180",
      "About $360-420",
      "About $240-300",
      "About $480-540"
    ],
    correct: 2,
    explanation: "With 40-50% first-year commission on annual premium, a typical case yields approximately $240-300 in first-year commission.",
    category: 'product-facts'
  },

  // Q41 -- correct: 0
  {
    question: "Why is the UCC base plan priced so competitively?",
    options: [
      "Because relapse/same-illness coverage is separated out into an optional rider",
      "Because it has no coverage for early-stage illnesses",
      "Because the coverage term is limited to age 65 only",
      "Because it only covers 50 illnesses"
    ],
    correct: 0,
    explanation: "UCC's base plan is cheap specifically because same-illness relapse coverage is separated out into the optional Enhancer rider.",
    category: 'product-facts'
  },

  // Q42 -- correct: 1
  {
    question: "Which of the following services does the Teladoc partnership NOT provide?",
    options: [
      "Second medical opinions",
      "Direct payment of hospital bills",
      "Treatment consultation",
      "Condition management"
    ],
    correct: 1,
    explanation: "Teladoc provides second opinions, treatment consultation, and condition management, but does not directly pay hospital bills.",
    category: 'product-facts'
  },

  // Q43 -- correct: 3
  {
    question: "How does UCC compare to Great Eastern in terms of coverage reset?",
    options: [
      "Both have unlimited resets",
      "UCC has 2x reset, Great Eastern has unlimited",
      "Neither has any reset mechanism",
      "UCC has unlimited 12-month resets, Great Eastern has only 2x reset"
    ],
    correct: 3,
    explanation: "UCC resets coverage to 100% after every 12-month waiting period with no limit, while Great Eastern only allows a 2x reset.",
    category: 'product-facts'
  },

  // Q44 -- correct: 2
  {
    question: "Per the Day 1 illustrative comparison, how does UCC's premium compare to Great Eastern's equivalent CI product?",
    options: [
      "About 11% cheaper",
      "About 22% cheaper",
      "About 6% cheaper based on Day 1 illustrative figures (always verify current iPOS quote -- competitor pricing is time-bound and not in any AIA-canonical PDF)",
      "About 29% cheaper"
    ],
    correct: 2,
    explanation: "Day 1 cites Video 1 with the explicit caveat that competitor pricing figures are illustrative and time-bound. The 6% figure is not in any AIA-canonical PDF -- always verify in iPOS before quoting.",
    category: 'product-facts'
  },

  // Q45 -- correct: 0
  {
    question: "How does UCC structure relapse coverage in its own canonical documents?",
    options: [
      "UCC's relapse coverage is provided by the optional Enhancer's Ultimate Relapse Benefit (5 named conditions, 2-year waiting, lower of 50% of cover or current insured amount, capped at 100% of base cover total). Cross-product comparisons to BCC are outside the UCC source-resources -- always cite BCC's own PDFs",
      "UCC includes relapse coverage in the base plan; BCC requires a separate rider",
      "Neither plan covers relapses",
      "Both plans include relapse coverage in the base plan"
    ],
    correct: 0,
    explanation: "UCC's relapse coverage sits in the optional Enhancer (Brochure p.4, Enhancer p.6). BCC (Beyond Critical Care) is a separate product not documented in the UCC source-resources -- cite BCC's own PDFs for any cross-product comparison.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (30 questions) -- Q46-Q75
  // ============================================================

  // Q46 -- correct: 1
  {
    question: "What is the primary problem with merged death/CI/savings plans like GPP or SFT?",
    options: [
      "The premiums are too expensive for most clients",
      "One early CI claim wipes out death coverage, major CI, and surrender value",
      "They do not cover any critical illnesses",
      "They only cover clients until age 55"
    ],
    correct: 1,
    explanation: "Merged plans bundle everything together, so one early CI claim can eliminate the death benefit, remaining CI coverage, and surrender value all at once.",
    category: 'sales-angles'
  },

  // Q47 -- correct: 0
  {
    question: "What is the recommended solution for clients with merged death/CI/savings plans?",
    options: [
      "Decouple coverage into pure CI (UCC) + pure death + pure investment",
      "Add more riders to the existing merged plan",
      "Increase the sum assured on the merged plan",
      "Replace the merged plan with a new whole life policy"
    ],
    correct: 0,
    explanation: "The recommended approach is to decouple coverage into separate pure CI (UCC), pure death, and pure investment products for optimal protection.",
    category: 'sales-angles'
  },

  // Q48 -- correct: 3
  {
    question: "Which of these is a powerful question to ask existing policyholders with merged plans?",
    options: [
      "How much premium are you paying each month?",
      "When did you buy your current policy?",
      "Which insurer is your current plan with?",
      "If you claim early CI, what happens to your major CI, death coverage, and savings?"
    ],
    correct: 3,
    explanation: "This question exposes the vulnerability of merged plans and creates awareness of the gap that UCC can fill.",
    category: 'sales-angles'
  },

  // Q49 -- correct: 2
  {
    question: "What are the two main entry points for selling UCC to existing policyholders?",
    options: [
      "Price comparison and product features",
      "Commission structure and ease of application",
      "Early CI gap and Coverage Gap Calculator (DBR)",
      "Teladoc partnership and unlimited claims"
    ],
    correct: 2,
    explanation: "The two key entry points are identifying the Early CI gap in existing plans and using the Coverage Gap Calculator (DBR) to quantify the coverage shortfall.",
    category: 'sales-angles'
  },

  // Q50 -- correct: 1
  {
    question: "In the 5-step pitch process, what should you show first?",
    options: [
      "The premium comparison with competitors",
      "One picture showing the heart condition progression",
      "Three coverage options (65/75/85)",
      "The Teladoc partnership benefits"
    ],
    correct: 1,
    explanation: "Step 1 is to show one picture of the heart condition progression to illustrate the power of multiple claims for related but different conditions.",
    category: 'sales-angles'
  },

  // Q51 -- correct: 0
  {
    question: "In step 2 of the pitch, what two things should you explain simultaneously?",
    options: [
      "The unlimited claims mechanics and competitor comparison",
      "The premium rates and commission structure",
      "The riders available and their costs",
      "The application process and underwriting requirements"
    ],
    correct: 0,
    explanation: "Step 2 combines explaining the unlimited claims mechanism with a direct comparison to competitors, showing UCC's superiority in the same conversation.",
    category: 'sales-angles'
  },

  // Q52 -- correct: 3
  {
    question: "What three cost factors should be discussed in step 3 of the pitch?",
    options: [
      "Age, gender, and smoking status",
      "Riders, add-ons, and optional benefits",
      "Commission, renewals, and bonuses",
      "Coverage amount, age, and duration"
    ],
    correct: 3,
    explanation: "Step 3 discusses the three main cost factors: coverage amount (sum assured), age of the client, and duration of coverage (65/75/85).",
    category: 'sales-angles'
  },

  // Q53 -- correct: 2
  {
    question: "How should the final step of the pitch frame the decision?",
    options: [
      "As a savings opportunity",
      "As a limited-time offer",
      "As a risk trade-off, not a price decision",
      "As a mandatory financial planning step"
    ],
    correct: 2,
    explanation: "Step 5 frames the decision as a risk trade-off rather than focusing on price, helping clients think about protection value rather than cost.",
    category: 'sales-angles'
  },

  // Q54 -- correct: 1
  {
    question: "What is the 'Middle Ground' close technique?",
    options: [
      "Offer only one option and push for immediate acceptance",
      "Present 3 options and advise against extremes -- not too cheap, not too expensive",
      "Start with the most expensive option and negotiate down",
      "Present 5 options and let the client choose freely"
    ],
    correct: 1,
    explanation: "The Middle Ground close presents 3 options and positions the advisor as balanced by advising against both extremes. Most people psychologically avoid extremes.",
    category: 'sales-angles'
  },

  // Q55 -- correct: 0
  {
    question: "What is the Time Value of Money strategy for UCC?",
    options: [
      "Invest the premium savings from choosing a shorter term, potentially building more wealth than the coverage amount",
      "Pay premiums in a lump sum upfront to save on total cost",
      "Use CPF to pay premiums to preserve cash flow",
      "Start with a small coverage amount and increase it annually"
    ],
    correct: 0,
    explanation: "By choosing coverage until 65 instead of 85, the monthly savings of ~$160 can be invested. At age 65 the investment could be worth $388k vs the $200k coverage.",
    category: 'sales-angles'
  },

  // Q56 -- correct: 3
  {
    question: "Using the Time Value of Money strategy, how much could the invested savings be worth at age 65?",
    options: [
      "About $200,000",
      "About $150,000",
      "About $500,000",
      "About $388,000"
    ],
    correct: 3,
    explanation: "By investing the $160/month premium difference between the 65 and 85 options, the invested savings could grow to approximately $388,000 by age 65.",
    category: 'sales-angles'
  },

  // Q57 -- correct: 2
  {
    question: "Using the Time Value of Money strategy, how much could the invested savings be worth at age 85?",
    options: [
      "About $388,000",
      "About $800,000",
      "About $1.5 million",
      "About $500,000"
    ],
    correct: 2,
    explanation: "If the invested savings continue to compound, they could grow to approximately $1.5 million by age 85, far exceeding the $200k coverage amount.",
    category: 'sales-angles'
  },

  // Q58 -- correct: 1
  {
    question: "What is the monthly premium savings when choosing coverage until 65 vs 85 for a 25-year-old female with $200k sum assured?",
    options: [
      "About $100 per month",
      "About $160 per month",
      "About $200 per month",
      "About $80 per month"
    ],
    correct: 1,
    explanation: "The annual premium difference is $3,320 - $1,400 = $1,920 per year, which is approximately $160 per month.",
    category: 'sales-angles'
  },

  // Q59 -- correct: 0
  {
    question: "How should you frame the choice between $200k coverage (needs illness) vs $388k-$1.5M cash (accessible anytime)?",
    options: [
      "As accessible cash vs locked-in coverage that requires a claim to access",
      "As insurance vs gambling on health",
      "As the safe option vs the risky option",
      "As the smart option vs the foolish option"
    ],
    correct: 0,
    explanation: "Frame it as a contrast: $200k that you can only access if you get sick vs $388k-$1.5M in cash that is accessible anytime regardless of health.",
    category: 'sales-angles'
  },

  // Q60 -- correct: 2
  {
    question: "What is the 'Premium Waiver Attack' that competitor agents may use?",
    options: [
      "Claiming UCC premiums are too expensive",
      "Showing that UCC has fewer covered illnesses",
      "Asking 'Did your agent tell you about premium waiver?' to exploit the gap if ECPWP is not attached",
      "Comparing UCC's commission rates unfavorably"
    ],
    correct: 2,
    explanation: "Competitor agents may point out that without the Premium Waiver rider, the client must keep paying premiums after a claim, creating doubt about the advisor's recommendation.",
    category: 'sales-angles'
  },

  // Q61 -- correct: 3
  {
    question: "Why should the Premium Waiver (ECPWP) rider always be recommended with UCC?",
    options: [
      "It increases the commission payout significantly",
      "It is required by AIA for all UCC policies",
      "It reduces the overall premium cost",
      "Without it, clients must continue paying premiums after a claim, and competitors will exploit this gap"
    ],
    correct: 3,
    explanation: "Without ECPWP, a client who claims must still pay premiums. Competitor agents will use this as an attack point, undermining trust in the advisor.",
    category: 'sales-angles'
  },

  // Q62 -- correct: 1
  {
    question: "When comparing UCC to Prudential, which specific restriction should you highlight?",
    options: [
      "Prudential has fewer covered illnesses",
      "Prudential's 'related illness' restriction blocks subsequent heart claims",
      "Prudential has no premium waiver option",
      "Prudential does not cover early-stage illnesses"
    ],
    correct: 1,
    explanation: "Prudential's 'related illness' restriction means that after claiming for coronary heart disease, subsequent heart-related claims may be blocked.",
    category: 'sales-angles'
  },

  // Q63 -- correct: 0
  {
    question: "What is the key advantage of UCC over Great Eastern's CI plan in terms of claim limits?",
    options: [
      "UCC has unlimited claims; Great Eastern ceases after 3 claims (max 300%)",
      "UCC covers 200 illnesses; Great Eastern covers 100",
      "UCC has no waiting period; Great Eastern has 24 months",
      "UCC includes relapse coverage; Great Eastern does not"
    ],
    correct: 0,
    explanation: "UCC allows unlimited claims for different illnesses, while Great Eastern's policy ceases after just 3 claims with a maximum payout of 300%.",
    category: 'sales-angles'
  },

  // Q64 -- correct: 2
  {
    question: "After a GPP/SFT claim, what critical problem does the policyholder face?",
    options: [
      "They must pay higher premiums",
      "They lose their investment returns",
      "They become uninsurable and cannot buy new CI coverage",
      "They must switch to a different insurer"
    ],
    correct: 2,
    explanation: "After claiming from a GPP/SFT plan, the policy terminates and the policyholder becomes uninsurable, meaning they cannot buy new CI coverage.",
    category: 'sales-angles'
  },

  // Q65 -- correct: 3
  {
    question: "Which type of client is BCC better suited for compared to UCC?",
    options: [
      "Budget-conscious clients who want flexibility",
      "Clients who value unlimited claims above all",
      "Young clients with low coverage needs",
      "Clients who want a premium refund guarantee and built-in relapse coverage"
    ],
    correct: 3,
    explanation: "BCC is better for clients who want a guaranteed premium refund at age 85 and prefer relapse coverage built into the base plan without needing riders.",
    category: 'sales-angles'
  },

  // Q66 -- correct: 0
  {
    question: "Which type of client is UCC better suited for compared to BCC?",
    options: [
      "Budget-conscious clients who want flexibility and value unlimited claims",
      "Clients who want guaranteed premium refund at maturity",
      "Clients who prefer built-in relapse coverage",
      "Clients who want the highest possible first-year commission"
    ],
    correct: 0,
    explanation: "UCC is better for budget-conscious clients who value flexibility in coverage term options and want the unlimited claims feature.",
    category: 'sales-angles'
  },

  // Q67 -- correct: 1
  {
    question: "What does BCC offer at age 85 that UCC does not?",
    options: [
      "Unlimited claims for same illness",
      "100% premium refund",
      "Coverage for 200 illnesses",
      "Free Teladoc membership for life"
    ],
    correct: 1,
    explanation: "BCC offers a 100% premium refund at age 85, while UCC has no premium refund feature.",
    category: 'sales-angles'
  },

  // Q68 -- correct: 2
  {
    question: "How many illnesses does BCC cover compared to UCC?",
    options: [
      "BCC covers 150, UCC covers 104",
      "BCC covers 200, UCC covers 150",
      "BCC covers 104, UCC covers 150",
      "Both cover 150 illnesses"
    ],
    correct: 2,
    explanation: "BCC covers 104 illnesses while UCC covers 150, giving UCC broader illness coverage.",
    category: 'sales-angles'
  },

  // Q69 -- correct: 3
  {
    question: "What is the maximum claim payout for BCC?",
    options: [
      "100% of sum assured",
      "Unlimited",
      "300% of sum assured",
      "200% of sum assured"
    ],
    correct: 3,
    explanation: "BCC has a maximum claim payout of 200% of sum assured, compared to UCC's unlimited potential payout.",
    category: 'sales-angles'
  },

  // Q70 -- correct: 0
  {
    question: "Why should step 2 of the pitch combine mechanics explanation with competitor comparison?",
    options: [
      "It saves time and shows UCC's superiority in context, making the advantage more tangible",
      "Clients prefer hearing about competitors before the product itself",
      "AIA requires competitor comparison in all presentations",
      "It reduces the need to discuss pricing later"
    ],
    correct: 0,
    explanation: "Combining mechanics with competitor comparison saves time and makes UCC's advantages more tangible when seen alongside competitor limitations.",
    category: 'sales-angles'
  },

  // Q71 -- correct: 1
  {
    question: "What psychological principle does the 'Middle Ground' close leverage?",
    options: [
      "Scarcity bias -- fear of missing out",
      "Extremeness aversion -- most people avoid the cheapest and most expensive options",
      "Authority bias -- trusting the advisor's expertise",
      "Anchoring effect -- fixating on the first number presented"
    ],
    correct: 1,
    explanation: "The Middle Ground close leverages extremeness aversion, the psychological tendency to avoid extreme options and choose the middle ground.",
    category: 'sales-angles'
  },

  // Q72 -- correct: 2
  {
    question: "What question should you ask to uncover whether a client can buy insurance again after a CI claim?",
    options: [
      "How much coverage do you currently have?",
      "When was your last medical check-up?",
      "If you claim early CI from your current plan, can you buy new CI coverage again?",
      "What is your monthly budget for insurance?"
    ],
    correct: 2,
    explanation: "This question helps the client realize that after claiming from a merged plan, they become uninsurable and cannot purchase new CI coverage.",
    category: 'sales-angles'
  },

  // Q73 -- correct: 3
  {
    question: "Why is early detection becoming an important talking point for UCC sales?",
    options: [
      "Because early detection reduces premiums",
      "Because early detection eliminates the need for CI coverage",
      "Because early detection is becoming less common",
      "Because early detection means more early-stage claims, and UCC covers multiple stages"
    ],
    correct: 3,
    explanation: "With early detection becoming more common, clients are more likely to make early-stage claims. UCC's multi-stage coverage means the policy continues to protect after an early claim.",
    category: 'sales-angles'
  },

  // Q74 -- correct: 0
  {
    question: "What is the key advantage of presenting 3 options (65/75/85) with a calculator exercise?",
    options: [
      "It empowers the client to make their own informed decision based on trade-offs they can see",
      "It makes the advisor appear more professional",
      "It fulfills regulatory requirements for CI sales",
      "It automatically selects the best option for the client"
    ],
    correct: 0,
    explanation: "Using a calculator exercise with 3 options empowers clients to see the trade-offs themselves and make an informed decision, building trust in the process.",
    category: 'sales-angles'
  },

  // Q75 -- correct: 1
  {
    question: "When presenting the Time Value of Money strategy, what contrast are you drawing for the client?",
    options: [
      "Insurance premiums vs CPF contributions",
      "Coverage you can only access if sick ($200k) vs cash accessible anytime ($388k-$1.5M)",
      "Monthly premiums vs annual premiums",
      "Current coverage vs future coverage needs"
    ],
    correct: 1,
    explanation: "The strategy contrasts $200k coverage (only accessible through illness) with $388k-$1.5M in investable cash (accessible anytime), helping clients see the opportunity cost.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (25 questions) -- Q76-Q100
  // ============================================================

  // Q76 -- correct: 2
  {
    question: "A client says: 'I already have CI coverage under my whole life plan.' What is the best response?",
    options: [
      "Your whole life plan is sufficient, no need for additional coverage.",
      "You should cancel your whole life plan and replace it with UCC.",
      "Your whole life plan terminates after one CI claim. UCC provides multiple claims so you remain covered after the first diagnosis.",
      "UCC is cheaper than your whole life plan, so you should switch."
    ],
    correct: 2,
    explanation: "Address the limitation of merged plans -- they terminate after one claim, leaving the client uninsured. UCC provides continued coverage through multiple claims.",
    category: 'objection-handling'
  },

  // Q77 -- correct: 0
  {
    question: "A client objects: 'UCC is too expensive.' What is the most effective response?",
    options: [
      "Show the 3 coverage term options and use the Time Value of Money strategy to demonstrate how choosing a shorter term can be financially advantageous.",
      "Agree that it is expensive and suggest a cheaper product instead.",
      "Offer a discount on the premium.",
      "Tell the client they cannot afford to be without CI coverage."
    ],
    correct: 0,
    explanation: "Use the 3-option presentation and Time Value of Money strategy to show that shorter coverage terms are affordable and the savings can be invested for potentially greater returns.",
    category: 'objection-handling'
  },

  // Q78 -- correct: 3
  {
    question: "A client asks: 'Why should I pay for the Enhancer rider when UCC already has unlimited claims?' What is the best response?",
    options: [
      "The Enhancer is optional and you do not really need it.",
      "The Enhancer increases your total payout from 550% to 1000%.",
      "AIA requires the Enhancer for all UCC policies.",
      "Unlimited claims means unlimited different illnesses. Without the Enhancer, a second heart attack or cancer relapse is not covered. At just $7/month, it closes this critical gap."
    ],
    correct: 3,
    explanation: "Clarify the misconception that 'unlimited' covers same-illness relapses. The Enhancer is essential because it covers second occurrences of the same CI for just $7/month.",
    category: 'objection-handling'
  },

  // Q79 -- correct: 1
  {
    question: "A client says: 'I will just invest the money instead of buying CI insurance.' What is the best response?",
    options: [
      "Investing is always better than insurance, you are right.",
      "If you get diagnosed in year 2, your investments will not have had time to grow. UCC provides immediate coverage of $100k+ from day one.",
      "You should buy UCC AND invest, there is no either/or.",
      "Insurance is always better than investing."
    ],
    correct: 1,
    explanation: "Address the timing risk -- investments need time to grow, but CI can strike early. UCC provides immediate large payouts that investments cannot match in the early years.",
    category: 'objection-handling'
  },

  // Q80 -- correct: 2
  {
    question: "A client asks: 'Why doesn't UCC have a premium refund like BCC?' How should you respond?",
    options: [
      "UCC is simply a worse product than BCC in this regard.",
      "Premium refunds are a gimmick that you should not consider.",
      "UCC trades the premium refund for lower premiums and unlimited claims. You can invest the premium savings to build a fund that potentially exceeds the refund amount.",
      "You should buy BCC instead if you want a premium refund."
    ],
    correct: 2,
    explanation: "Position the lack of premium refund as a trade-off: lower premiums and unlimited claims. The premium savings can be invested to potentially build more than the refund would return.",
    category: 'objection-handling'
  },

  // Q81 -- correct: 0
  {
    question: "A client objects: 'I am young and healthy, I do not need CI coverage now.' What is the best response?",
    options: [
      "Premiums are cheapest when you are young and healthy. A 20-year-old pays $44/month vs much higher premiums at 35 or 40. Plus, future health issues may make you uninsurable.",
      "You are right, wait until you are older to buy CI coverage.",
      "Statistics show young people never get critical illnesses.",
      "Buy the minimum coverage now and increase it later."
    ],
    correct: 0,
    explanation: "Emphasize that premiums are lowest when young and healthy, and future health conditions may prevent insurability altogether.",
    category: 'objection-handling'
  },

  // Q82 -- correct: 3
  {
    question: "A client says: 'Prudential's agent told me their plan is better because it covers related illnesses.' How do you respond?",
    options: [
      "Prudential's plan is indeed better for related illnesses.",
      "All CI plans cover related illnesses the same way.",
      "Ask the client to get a written comparison from Prudential.",
      "Actually, Prudential has a 'related illness' restriction that BLOCKS subsequent heart claims. UCC treats each condition separately, so coronary heart disease, bypass, heart attack, and transplant are all claimable."
    ],
    correct: 3,
    explanation: "Correct the misconception by explaining that Prudential's 'related illness' restriction actually blocks subsequent claims for related conditions, while UCC allows each to be claimed separately.",
    category: 'objection-handling'
  },

  // Q83 -- correct: 1
  {
    question: "A client asks: 'Why should I choose UCC over Great Eastern's plan?' What is the strongest factually-grounded argument?",
    options: [
      "UCC has a nicer brochure and brand reputation.",
      "UCC's canonical structure: 73 underlying CIs across 150 condition-stage entries (Brochure p.13), unlimited claims at major stage with a 12-month restoration after the latest diagnosed CI (PS p.7), and early+intermediate capped at 500% combined / S$350,000 per-life on the same CI. GE comparison figures (~53 illnesses, 3-claim limit, 2x reset) come from Day 1 / Video 1 -- illustrative and time-bound, always verify in iPOS",
      "UCC is the cheapest CI plan on the market.",
      "Great Eastern does not cover any heart conditions."
    ],
    correct: 1,
    explanation: "Lead with UCC's canonical numbers (Brochure p.13, PS p.7). Day 1 / Day 4 explicitly flag GE's 53-illness, 3-claim, 2x-reset figures as illustrative -- they do not appear in any AIA-canonical PDF.",
    category: 'objection-handling'
  },

  // Q84 -- correct: 2
  {
    question: "A client says: 'I do not want to pay premiums after a claim.' How should you respond?",
    options: [
      "Unfortunately, there is no way around this with UCC.",
      "All CI plans require continued premium payment after claims.",
      "That is exactly why we recommend the Premium Waiver rider (ECPWP). For just $4/month, all future premiums are waived after your first claim.",
      "You should choose BCC instead because it automatically waives premiums."
    ],
    correct: 2,
    explanation: "Recommend the ECPWP rider as the direct solution. At $4/month, it provides peace of mind that premiums stop after the first claim.",
    category: 'objection-handling'
  },

  // Q85 -- correct: 0
  {
    question: "A client objects: 'The 50% payout for second relapse under the Enhancer seems low.' What is the best response?",
    options: [
      "50% is still a significant payout. Without the Enhancer, a second occurrence gets 0%. Plus the base plan continues to cover any new different illnesses at 100%.",
      "You are right, 50% is not enough. Consider buying a separate plan for relapse coverage.",
      "The 50% is just a starting point -- you can negotiate for more.",
      "Most people never experience a second relapse, so it does not matter."
    ],
    correct: 0,
    explanation: "Reframe the 50% as significantly better than the 0% without the Enhancer, and remind them that new different illnesses are still covered at 100%.",
    category: 'objection-handling'
  },

  // Q86 -- correct: 3
  {
    question: "A client says: 'I heard UCC has no cash value. That means I lose all my premiums.' How do you handle this?",
    options: [
      "You are correct, you will lose all premiums if you do not claim.",
      "UCC actually does have some cash value after 20 years.",
      "All CI plans have no cash value.",
      "UCC is a pure protection plan, like car insurance -- the value is the coverage itself. The lower premiums let you invest the savings elsewhere for wealth building."
    ],
    correct: 3,
    explanation: "Reframe the no-cash-value feature as a benefit: pure protection keeps premiums low, and the savings can be invested elsewhere for wealth accumulation.",
    category: 'objection-handling'
  },

  // Q87 -- correct: 1
  {
    question: "A client says: 'I want to wait and see if I actually need CI coverage.' What is the best response?",
    options: [
      "That is a reasonable approach. Let me follow up with you next year.",
      "By the time you know you need it, you may already be uninsurable. A 25-year-old pays just $50/month -- waiting 10 years means higher premiums and potential exclusions.",
      "Most people never get critical illnesses, so waiting is fine.",
      "I cannot sell you the policy later, so you must decide now."
    ],
    correct: 1,
    explanation: "Address the timing risk: waiting increases premiums, and developing any health condition may make the client uninsurable or subject to exclusions.",
    category: 'objection-handling'
  },

  // Q88 -- correct: 2
  {
    question: "A client asks: 'Why does UCC need separate riders? Is the base plan incomplete?' How should you respond?",
    options: [
      "Yes, the base plan is incomplete without riders.",
      "The riders are just upselling tactics by AIA.",
      "The modular design is intentional -- it keeps the base premium low and lets you customize coverage to your exact needs and budget. Not everyone needs every rider.",
      "You must buy all riders or the plan does not work."
    ],
    correct: 2,
    explanation: "Position the modular rider design as a benefit: it keeps the base plan affordable and allows clients to customize coverage to their specific needs and budget.",
    category: 'objection-handling'
  },

  // Q89 -- correct: 0
  {
    question: "A client says: 'My friend told me CI insurance is a waste of money.' What is the best response?",
    options: [
      "Share that with early detection becoming more common, CI claims are increasing. Show the heart progression example where one person can claim 4 times, potentially receiving 400% of sum assured.",
      "Your friend is wrong, CI insurance is essential for everyone.",
      "Your friend probably has a different financial situation.",
      "I understand. Let me show you our investment products instead."
    ],
    correct: 0,
    explanation: "Use concrete examples and trends (early detection, multiple claims) to demonstrate the real value of CI coverage rather than dismissing the friend's opinion.",
    category: 'objection-handling'
  },

  // Q90 -- correct: 3
  {
    question: "A client objects: 'I already have MediShield Life, so I do not need CI coverage.' How do you respond?",
    options: [
      "MediShield Life is sufficient for most people.",
      "You should cancel MediShield Life and get UCC instead.",
      "MediShield Life and CI coverage serve the same purpose.",
      "MediShield Life covers hospital bills. CI coverage provides a lump sum for income replacement, mortgage payments, and lifestyle adjustments that medical insurance does not cover."
    ],
    correct: 3,
    explanation: "Clarify that MediShield Life covers medical bills, while CI provides a lump sum for non-medical costs like income replacement, mortgage, and daily expenses during recovery.",
    category: 'objection-handling'
  },

  // Q91 -- correct: 1
  {
    question: "A client asks: 'What if I never claim? Then I wasted all those premiums.' How should you respond?",
    options: [
      "You will definitely claim eventually, so do not worry about it.",
      "Not claiming means you stayed healthy -- that is the best outcome. But if you do claim, UCC could pay out 4-5 times your total premiums. The Time Value of Money strategy also lets you invest the savings.",
      "You can always surrender the policy for a cash refund.",
      "Statistics show that 90% of people will claim CI before age 65."
    ],
    correct: 1,
    explanation: "Reframe not claiming as a positive outcome (good health), while showing that if a claim does happen, the payout far exceeds premiums paid.",
    category: 'objection-handling'
  },

  // Q92 -- correct: 2
  {
    question: "A client says: 'I will just use my savings if I get sick.' How do you handle this objection?",
    options: [
      "Your savings are probably sufficient for most illnesses.",
      "You should not use savings because interest rates are too low.",
      "A critical illness can cost $200k-$500k in treatment plus years of lost income. UCC protects your savings by providing a separate pool of funds, so your retirement and family finances stay intact.",
      "Savings are better than insurance in all cases."
    ],
    correct: 2,
    explanation: "Quantify the potential cost of CI and position UCC as a way to protect savings rather than deplete them, preserving retirement funds and family finances.",
    category: 'objection-handling'
  },

  // Q93 -- correct: 0
  {
    question: "A competitor agent tells your client: 'AIA's unlimited claims is misleading.' How should you respond?",
    options: [
      "Acknowledge the nuance: the base plan covers unlimited different illnesses, not same-illness relapses. Then show that with the Enhancer at $7/month, relapse coverage is added too.",
      "Deny the claim and insist UCC covers everything unlimited.",
      "Ignore the competitor's comment and change the subject.",
      "Agree and recommend the competitor's product instead."
    ],
    correct: 0,
    explanation: "Be transparent about the distinction between different-illness and same-illness claims, then show how the Enhancer closes the gap affordably at $7/month.",
    category: 'objection-handling'
  },

  // Q94 -- correct: 3
  {
    question: "A client says: 'I prefer a plan with guaranteed returns.' What is the best way to redirect?",
    options: [
      "UCC has guaranteed returns after 20 years.",
      "Guaranteed return plans are always better than pure protection.",
      "You should buy a savings plan instead of CI coverage.",
      "CI coverage and guaranteed returns serve different purposes. UCC protects your income and lifestyle if illness strikes. You can pair it with a separate savings plan for guaranteed returns."
    ],
    correct: 3,
    explanation: "Separate the need for protection from the need for guaranteed returns, and suggest pairing UCC with a savings plan to address both needs.",
    category: 'objection-handling'
  },

  // Q95 -- correct: 1
  {
    question: "A client asks: 'Why is UCC cheaper than competitors? Is the coverage worse?' How do you respond?",
    options: [
      "Yes, the cheaper price means less coverage.",
      "UCC is cheaper because the base plan separates relapse coverage into an optional rider. This keeps costs low while actually covering more illnesses (150 vs competitors' 53-104).",
      "AIA is subsidizing the premium to gain market share.",
      "The competitors are overcharging their customers."
    ],
    correct: 1,
    explanation: "Explain the structural reason for lower pricing (modular design separating relapse coverage) while highlighting that UCC covers more illnesses than competitors.",
    category: 'objection-handling'
  },

  // Q96 -- correct: 2
  {
    question: "A client objects: 'I only want coverage until 65, but what if I get sick after that?' What should you say?",
    options: [
      "You probably will not get sick after 65.",
      "You should definitely choose coverage until 85 to be safe.",
      "Use the Time Value of Money strategy: invest the premium savings, and by 65 you could have $388k or more -- accessible anytime, not just when ill. This provides financial protection beyond the coverage term.",
      "Once coverage ends, you can always buy a new policy."
    ],
    correct: 2,
    explanation: "Use the Time Value of Money strategy to show that invested savings can provide more financial security after 65 than extended coverage, with the added benefit of accessibility.",
    category: 'objection-handling'
  },

  // Q97 -- correct: 0
  {
    question: "A client says: 'BCC seems better because it includes relapse coverage and a premium refund.' How do you differentiate UCC compliantly?",
    options: [
      "Lead with UCC's canonical structure: 73 CIs across 150 condition-stage entries, unlimited major-stage claims with 12-month restoration after the latest diagnosed CI, the optional Enhancer for 5 named relapse conditions, and the Catastrophic CI Benefit (one-time 100% top-up that does not reduce base cover). For BCC's exact figures and refund mechanics, cite BCC's own PDFs -- BCC is a separate product not documented in the UCC source-resources",
      "You are right, BCC is the better product overall.",
      "UCC and BCC are exactly the same product.",
      "BCC is being discontinued, so you should choose UCC."
    ],
    correct: 0,
    explanation: "Stay inside UCC's canonical scope. BCC (Beyond Critical Care) is a separate product not in the UCC source-resources; the 104-illness figure and built-in-refund framing must be sourced from BCC's own PDFs, not asserted from the UCC bank.",
    category: 'objection-handling'
  },

  // Q98 -- correct: 3
  {
    question: "A client says: 'I do not understand why I need both my existing whole life plan AND UCC.' How do you explain?",
    options: [
      "You do not need both -- cancel your whole life plan.",
      "It is too complicated to explain, just trust me.",
      "Your whole life plan is outdated and needs to be replaced.",
      "Your whole life plan terminates after one CI claim. UCC continues providing CI coverage after your first claim, so you remain protected when you are most vulnerable -- after a diagnosis."
    ],
    correct: 3,
    explanation: "Explain the complementary nature: the whole life plan provides first-claim coverage, while UCC provides ongoing protection for subsequent illnesses when the client is most vulnerable.",
    category: 'objection-handling'
  },

  // Q99 -- correct: 1
  {
    question: "A client says: 'I want to think about it.' What is the best way to handle this?",
    options: [
      "No problem, take your time. I will call you next month.",
      "Absolutely, it is an important decision. Let me leave you with this: every day without coverage is a day of risk. Shall we schedule a follow-up in 3 days to address any remaining questions?",
      "If you do not buy today, the premium will double next month.",
      "Thinking about it is a mistake -- you should decide now."
    ],
    correct: 1,
    explanation: "Respect the client's need to think while creating gentle urgency and securing a concrete follow-up date to keep the conversation moving.",
    category: 'objection-handling'
  },

  // Q100 -- correct: 2
  {
    question: "A client says: 'My company provides CI coverage through group insurance.' How should you respond?",
    options: [
      "Group insurance is usually sufficient for CI coverage.",
      "You should cancel your group insurance and buy UCC instead.",
      "Group CI coverage typically ends when you leave the company. UCC is portable and stays with you regardless of employment. Also, group coverage is often limited in amount and illness types.",
      "Group insurance and individual CI plans are the same."
    ],
    correct: 2,
    explanation: "Highlight that group insurance is tied to employment and may be insufficient in coverage amount and illness types, while UCC is portable and comprehensive.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (20 questions) -- Q101-Q120
  // ============================================================

  // Q101 -- correct: 1
  {
    question: "A 28-year-old client with a GPP plan says: 'My agent told me my GPP covers critical illness, so I am fully protected.' What is your best response?",
    options: [
      "Your agent is correct. GPP provides comprehensive CI coverage.",
      "Your GPP does cover CI, but it terminates after one claim. If you claim early CI, your death coverage, major CI, and surrender value are all gone. Can you buy new coverage after a diagnosis?",
      "Your GPP is a terrible product. You should replace it immediately.",
      "I cannot comment on your existing coverage. Let me just tell you about UCC."
    ],
    correct: 1,
    explanation: "Acknowledge the existing coverage but expose the single-claim limitation using the power question about buyability after diagnosis.",
    category: 'roleplay'
  },

  // Q102 -- correct: 0
  {
    question: "A 35-year-old female client says: 'I want the most comprehensive CI coverage but I am on a tight budget of $60/month.' Which recommendation is best?",
    options: [
      "UCC $100k until age 65 with all three riders (Enhancer + Early CI + Premium Waiver) at approximately $57/month.",
      "UCC $200k until age 85 without any riders.",
      "BCC $100k until age 85 for maximum refund at maturity.",
      "UCC $50k until age 75 with just the Enhancer rider."
    ],
    correct: 0,
    explanation: "For a tight budget, $100k until 65 with all three essential riders fits within $57/month and provides the most comprehensive coverage for the budget.",
    category: 'roleplay'
  },

  // Q103 -- correct: 3
  {
    question: "During a presentation, a client's spouse interjects: 'We already spend too much on insurance. Why add more?' What is the best approach?",
    options: [
      "Ignore the spouse and continue presenting to the client.",
      "Agree with the spouse and reduce the recommended coverage.",
      "Tell the spouse that they do not understand insurance.",
      "Acknowledge the concern, then ask both: 'If one of you claims early CI from your current plan, what happens to the death benefit and savings? How would the family manage?' Let them discover the gap together."
    ],
    correct: 3,
    explanation: "Include the spouse in the conversation by using a power question that helps both discover the coverage gap, turning the objection into a joint problem-solving exercise.",
    category: 'roleplay'
  },

  // Q104 -- correct: 2
  {
    question: "A 25-year-old male client asks you to compare coverage options. Using the Middle Ground close, how should you present the three options?",
    options: [
      "Start with the cheapest option and try to upsell.",
      "Only show the middle option and skip the other two.",
      "Present all three (65/75/85), explain the trade-offs for each, then say: 'Most clients find the middle option balances good coverage with reasonable cost. I would not go too extreme either way.'",
      "Present the most expensive option first and offer discounts."
    ],
    correct: 2,
    explanation: "The Middle Ground close presents all three options with their trade-offs, then gently guides toward the middle option without being pushy.",
    category: 'roleplay'
  },

  // Q105 -- correct: 1
  {
    question: "A client with existing Prudential CI coverage says their Prudential agent told them switching to AIA is risky. How do you respond?",
    options: [
      "Tell the client their Prudential agent is lying.",
      "Clarify that you are not suggesting they cancel Prudential. UCC can complement their existing coverage. Then ask: 'Does your Prudential plan have a related illness restriction? Let me show you what that means for heart conditions.'",
      "Agree that switching is risky and recommend staying with Prudential.",
      "Offer to match whatever Prudential is offering."
    ],
    correct: 1,
    explanation: "Position UCC as complementary rather than a replacement, then use the specific 'related illness' restriction to demonstrate UCC's advantage without attacking the competitor.",
    category: 'roleplay'
  },

  // Q106 -- correct: 0
  {
    question: "A 40-year-old client is concerned about the premium difference between UCC coverage until 65 vs 85. You want to use the Time Value of Money strategy. What do you say?",
    options: [
      "The premium difference of about $160/month can be invested. By 65, that could grow to about $388k -- nearly double the $200k coverage. You get accessible cash instead of coverage you can only use if you are sick.",
      "Just pick the cheapest option to save money.",
      "The longer term is always better because you get more years of coverage.",
      "The premium difference does not matter because both options have the same coverage amount."
    ],
    correct: 0,
    explanation: "The Time Value of Money strategy demonstrates how investing the premium savings can create more accessible wealth than the coverage amount, giving the client a clear comparison.",
    category: 'roleplay'
  },

  // Q107 -- correct: 3
  {
    question: "A client says they want to buy UCC but without the Enhancer rider to save money. How do you advise them?",
    options: [
      "That is a good idea -- the Enhancer is not important.",
      "Refuse to process the application without the Enhancer.",
      "Tell them they will regret it if they get cancer twice.",
      "I understand wanting to save, but at $7/month the Enhancer covers second occurrences of the same illness. Without it, a cancer relapse or second heart attack has zero coverage. Let me show you what happens in a real scenario."
    ],
    correct: 3,
    explanation: "Emphasize the low cost ($7/month) and high consequence (zero relapse coverage) while using a concrete scenario to illustrate the risk.",
    category: 'roleplay'
  },

  // Q108 -- correct: 2
  {
    question: "You are meeting a 30-year-old couple. Both have SFT plans. How do you open the conversation about UCC?",
    options: [
      "Tell them their SFT plans are bad products and they need UCC.",
      "Skip the SFT discussion and go straight into UCC features.",
      "Ask: 'If either of you claims early CI from your SFT, what happens to your death coverage, major CI, and savings? And after that claim, can you buy new CI coverage?' Let them realize the gap first.",
      "Start by showing UCC premium rates and commission benefits."
    ],
    correct: 2,
    explanation: "Use the power questions to help the couple discover the vulnerability in their SFT plans before introducing UCC as the solution.",
    category: 'roleplay'
  },

  // Q109 -- correct: 1
  {
    question: "A financially savvy client asks: 'What is the total cost of ownership for UCC with all riders until age 75?' How do you respond for a 25-year-old female with $200k coverage?",
    options: [
      "I do not have the exact numbers, but it is very affordable.",
      "Based on the $2,328/year premium until age 75, the total outlay over 50 years is approximately $116,000. With UCC's unlimited claims, the potential payout far exceeds this -- 550% or more of the $200k sum assured.",
      "The total cost is approximately $50,000 over the life of the policy.",
      "I would need to check with the actuarial team and get back to you."
    ],
    correct: 1,
    explanation: "Provide the specific numbers (total outlay vs potential payout) to satisfy a financially savvy client, demonstrating value through concrete figures.",
    category: 'roleplay'
  },

  // Q110 -- correct: 0
  {
    question: "A client mentions that their colleague just claimed CI from a whole life plan and lost all remaining coverage. How do you use this as a teaching moment?",
    options: [
      "That is exactly the risk with merged plans. Your colleague is now uninsurable. UCC is designed differently -- coverage resets after 12 months, and you can claim for different illnesses indefinitely. This is why we recommend decoupling CI from your main plan.",
      "That is unfortunate, but it rarely happens.",
      "Your colleague should have bought UCC instead.",
      "I cannot comment on other people's insurance situations."
    ],
    correct: 0,
    explanation: "Use the real example to validate the decoupling strategy, showing how UCC's multi-claim design addresses exactly the problem the colleague experienced.",
    category: 'roleplay'
  },

  // Q111 -- correct: 3
  {
    question: "A 22-year-old fresh graduate says: 'I barely have any savings. How can I afford CI coverage?' What is the best approach?",
    options: [
      "You cannot afford insurance right now. Come back when you earn more.",
      "Borrow money from your parents to buy the coverage.",
      "Buy the maximum coverage now before premiums go up.",
      "At your age, UCC base plan is about $44/month for $100k coverage until 65. That is less than one dinner out. Lock in this rate now -- the same coverage at 35 could cost 50% more."
    ],
    correct: 3,
    explanation: "Make the premium relatable (less than one dinner) and emphasize the advantage of locking in low rates while young and healthy.",
    category: 'roleplay'
  },

  // Q112 -- correct: 2
  {
    question: "A client asks you to walk through the heart condition staircase step by step using canonical UCC condition names. What is the correct sequence?",
    options: [
      "Heart attack, coronary heart disease, bypass, transplant -- claim once for the most severe",
      "Coronary heart disease, heart attack -- claim twice maximum",
      "Other Serious Coronary Artery Disease (claim 1), Coronary Artery By-pass Surgery (claim 2), Heart Attack of Specified Severity (claim 3), Major Organ / Bone Marrow Transplantation -- heart (claim 4). Each is a separate covered CI at major stage; the policy is restored to 100% if it is in force 12 months after the date of the latest diagnosed CI (PS p.7)",
      "Heart transplant only -- one large payout covering all stages"
    ],
    correct: 2,
    explanation: "Per Brochure p.11-13: 'coronary heart disease' is not the precise covered name -- use 'Other Serious Coronary Artery Disease' or 'Coronary Artery Disease'. A heart transplant claim is paid under 'Major Organ / Bone Marrow Transplantation' (item 36); there is no standalone 'Heart Transplant' CI. Per PS p.7, the 12 months runs from the date of the latest diagnosed CI.",
    category: 'roleplay'
  },

  // Q113 -- correct: 1
  {
    question: "A client's existing advisor calls them and warns against buying UCC. The client comes back to you confused. What is your best move?",
    options: [
      "Tell the client their advisor is incompetent.",
      "Ask the client what specific concerns the advisor raised, then address each one factually. Offer to do a side-by-side comparison of their current coverage vs UCC to let the numbers speak.",
      "Tell the client to stop talking to their other advisor.",
      "Lower the premium to win the client over."
    ],
    correct: 1,
    explanation: "Address specific concerns factually rather than attacking the other advisor. A side-by-side comparison lets objective data drive the decision.",
    category: 'roleplay'
  },

  // Q114 -- correct: 0
  {
    question: "During the presentation, a client asks: 'What is Teladoc and why should I care?' How do you position this benefit?",
    options: [
      "Teladoc gives you access to 50,000+ specialists worldwide for second opinions, treatment consultation, and condition management. If you are diagnosed with cancer, heart disease, or a neurological condition, having a world-class second opinion can be life-changing.",
      "Teladoc is a small bonus feature that is not very important.",
      "Teladoc replaces the need for a local doctor.",
      "Teladoc is available to everyone, not just UCC policyholders."
    ],
    correct: 0,
    explanation: "Position Teladoc as a unique, high-value benefit with specific use cases (cancer, heart, neuro) that demonstrates AIA's commitment to holistic care beyond just financial coverage.",
    category: 'roleplay'
  },

  // Q115 -- correct: 3
  {
    question: "A client wants to buy UCC but is deciding between $100k and $200k coverage. They earn $5,000/month. What guidance do you give?",
    options: [
      "Always buy the minimum to save on premiums.",
      "Always buy the maximum regardless of budget.",
      "Coverage amount does not matter -- the riders are more important.",
      "Consider that CI coverage should replace 3-5 years of income. At $5,000/month, that is $180k-$300k. $200k gives you about 3.3 years of income replacement, which is a reasonable starting point."
    ],
    correct: 3,
    explanation: "Use the 3-5 years income replacement guideline to help the client choose an appropriate coverage amount based on their actual income.",
    category: 'roleplay'
  },

  // Q116 -- correct: 2
  {
    question: "A client says: 'My parents never had CI coverage and they were fine.' How do you respond without dismissing their parents' experience?",
    options: [
      "Your parents were lucky. You might not be.",
      "Your parents probably did have CI coverage but forgot about it.",
      "I respect that. However, medical advances now detect CI earlier, meaning more claims at younger ages. Treatment costs have also increased significantly. The landscape is very different from your parents' generation.",
      "Your parents did not have access to products like UCC."
    ],
    correct: 2,
    explanation: "Acknowledge the parents' experience respectfully while explaining how changes in medical detection and treatment costs have made CI coverage more relevant today.",
    category: 'roleplay'
  },

  // Q117 -- correct: 1
  {
    question: "You are presenting UCC to a client who already has BCC. How do you position the difference?",
    options: [
      "Cancel your BCC and replace it with UCC.",
      "Your BCC gives you built-in relapse coverage and a premium refund at 85, which is great. UCC could complement it by covering the 46 additional illnesses BCC does not cover, with unlimited claims. Together they create comprehensive layered protection.",
      "BCC and UCC are the same product. You do not need both.",
      "BCC is being discontinued, so you need UCC as a replacement."
    ],
    correct: 1,
    explanation: "Position UCC as complementary to BCC rather than a replacement, highlighting the additional 46 illnesses and unlimited claims as added layers of protection.",
    category: 'roleplay'
  },

  // Q118 -- correct: 0
  {
    question: "A client is ready to proceed but asks: 'Should I add all three riders or just the Enhancer?' What is your recommendation?",
    options: [
      "I recommend all three: the Enhancer ($7/month) covers same-illness relapses, Early CI Trigger ($2/month) covers early-stage illnesses, and Premium Waiver ($4/month) stops premiums after a claim. Together that is only $13/month for complete protection.",
      "Just get the Enhancer -- the other riders are unnecessary.",
      "Skip all riders to keep costs low.",
      "Get the Premium Waiver only -- the other two are optional."
    ],
    correct: 0,
    explanation: "Recommend all three riders with specific costs to show the total is modest ($13/month) while each serves a distinct and important purpose.",
    category: 'roleplay'
  },

  // Q119 -- correct: 3
  {
    question: "A client says: 'I want to buy UCC but my spouse thinks we should save the money for our child's education instead.' How do you handle both stakeholders?",
    options: [
      "Tell the spouse they are wrong about prioritizing education over insurance.",
      "Agree with the spouse and suggest deferring UCC until after the child finishes school.",
      "Ignore the spouse's concern and close the deal with the client.",
      "Ask both: 'If you are diagnosed with CI and your plan terminates, how will you fund both the treatment and your child's education from savings alone? UCC at $57/month protects the education fund by keeping CI costs separate.'"
    ],
    correct: 3,
    explanation: "Reframe UCC as protecting the education fund rather than competing with it, addressing both stakeholders' priorities in one answer.",
    category: 'roleplay'
  },

  // Q120 -- correct: 2
  {
    question: "A client has agreed to purchase UCC with all riders until age 75 but asks for a final summary before signing. What key points should you cover?",
    options: [
      "Just mention the premium amount and coverage term.",
      "Read through the entire policy document word by word.",
      "Summarize: 150 illnesses covered, unlimited claims with 12-month reset, Enhancer covers same-illness relapses, Early CI adds early-stage coverage, Premium Waiver stops premiums after first claim, plus Teladoc access. Total cost and sum assured.",
      "Only mention the Teladoc benefit as it is the most unique feature."
    ],
    correct: 2,
    explanation: "A comprehensive summary covers the key features (150 illnesses, unlimited claims), all rider benefits, Teladoc, and the financial details -- giving the client confidence in their decision.",
    category: 'roleplay'
  },

  // ============================================================
  // SECTION D ADDITIONS (Q121-Q130) -- canonical numbers, caps, compliance
  // ============================================================

  // Q121 -- correct: 1 (Numbers cold)
  {
    question: "Which row correctly states UCC's covered conditions across the three stages?",
    options: [
      "100 conditions: 30 Early / 30 Intermediate / 40 Major",
      "150 condition-stage entries from 73 underlying CIs: 42 Early / 35 Intermediate / 73 Major",
      "150 separate CIs across early stage only",
      "73 CIs across early and major stage (no intermediate)"
    ],
    correct: 1,
    explanation: "Brochure p.13 totals row: 42 Early + 35 Intermediate + 73 Major = 150 stage-instances across 73 unique CI conditions.",
    category: 'product-facts'
  },

  // Q122 -- correct: 1 (Per-life caps)
  {
    question: "A client holds three UCC policies on his own life. He claims early-stage Major Cancer at S$200,000 on Policy 1 and intermediate-stage Major Cancer at S$200,000 on Policy 2. What happens at the third claim?",
    options: [
      "Both prior claims paid in full; Policy 3 will pay another S$200,000 for any Major Cancer stage",
      "Combined Early+Intermediate payouts for the SAME critical illness across all UCC policies are capped at S$350,000 per life -- Policy 2's intermediate claim is reduced to S$150,000",
      "The S$3,000,000 AIA aggregate cap kicks in immediately",
      "Policy 1 is voided"
    ],
    correct: 1,
    explanation: "Per PS p.4 and Brochure p.14: combined Early + Intermediate payouts on the SAME CI across all UCC policies covering the same insured are capped at S$350,000 per life.",
    category: 'compliance'
  },

  // Q123 -- correct: 1 (Catastrophic CI Benefit)
  {
    question: "Under the UCC Enhancer, the Catastrophic CI Benefit pays:",
    options: [
      "50% of cover, deducted from the base Insured Amount",
      "100% of cover one-time, regardless of prior claims, and does not reduce the base UCC Insured Amount",
      "Unlimited 100% top-ups for any catastrophic event",
      "Only payable if all 5 named relapse conditions occur first"
    ],
    correct: 1,
    explanation: "Per Brochure p.4 and Enhancer p.7-8: a one-time 100% top-up that does NOT reduce base UCC coverage, covering 5 named conditions (Major Cancer, Stroke, Heart Attack, Major Organ Transplant -- heart and lung, Paralysis).",
    category: 'product-facts'
  },

  // Q124 -- correct: 2 (ECPWP asymmetric ROI)
  {
    question: "A 25-year-old female buys UCC S$200,000 To Age 75 with the ECPWP rider. Base premium ~S$2,328/year, rider ~S$168/year. If she claims in policy year 2, roughly how much in premiums is waived across the remaining term?",
    options: [
      "~S$8,400",
      "~S$25,000",
      "~S$114,072 (~679x return on the rider)",
      "~S$200,000"
    ],
    correct: 2,
    explanation: "Per Day 3 / Day 5 / Video 7: best-case ECPWP ROI is approximately 679x (~S$168/year rider waiving ~S$114,072 of base premium across the remaining term). Worst case: ~S$8,400 paid over 50 years with no claim.",
    category: 'sales-angles'
  },

  // Q125 -- correct: 1 (Survival + waiting)
  {
    question: "Which set of waiting periods correctly describes UCC?",
    options: [
      "14-day survival; 30-day cardiac waiting; 1-year relapse",
      "7-day survival from diagnosis or surgery; 90-day waiting from issue/reinstatement on named cardiac and cancer CIs (Heart Attack of Specified Severity, Major Cancer, Coronary Artery By-pass Surgery, Angioplasty, Other Serious Coronary Artery Disease); 2-year same-illness relapse waiting under the Enhancer",
      "No survival period; 60-day waiting; 6-month relapse waiting",
      "7-day survival; 90-day waiting on ALL CIs; 5-year relapse waiting"
    ],
    correct: 1,
    explanation: "Per PS p.3 (7-day survival), PS p.7 (90-day waiting on the 5 named cardiac/cancer CIs from issue/reinstatement), and Enhancer p.6 (2-year waiting between same-illness relapse claims).",
    category: 'compliance'
  },

  // Q126 -- correct: 1 (Death benefit)
  {
    question: "A UCC policyholder dies of natural causes (non-accidental). What does the family receive?",
    options: [
      "100% of Insured Amount",
      "5% of Insured Amount (the policy then terminates)",
      "Premium refund only",
      "Nothing -- UCC has no death benefit"
    ],
    correct: 1,
    explanation: "Per PS p.1-2: non-accidental death pays 5% of Insured Amount; accidental death pays 100% of Insured Amount, capped at S$5,000,000 aggregate across all prior AIA policies on the same insured.",
    category: 'product-facts'
  },

  // Q127 -- correct: 1 (Unlimited mechanic limits)
  {
    question: "'Unlimited claims' under base UCC applies to:",
    options: [
      "Same-illness recurrence at any stage",
      "Major-stage critical illnesses across DIFFERENT illnesses, with restoration to 100% if the policy is in force 12 months after the date of the latest diagnosed CI; early+intermediate stages remain capped at 500% combined and S$350,000 per-life on the same CI",
      "All stages, all illnesses, no caps",
      "Only cancer-related conditions"
    ],
    correct: 1,
    explanation: "Per Brochure footnote 1 (p.14) and PS p.4: the unlimited mechanic is major-stage-only across different illnesses; early+intermediate are capped at 500% combined of coverage amount and S$350,000 per-life on the same CI.",
    category: 'product-facts'
  },

  // Q128 -- correct: 1 (Compliance pillar -- non-guaranteed premium)
  {
    question: "A client asks: 'Will my premium increase because I claimed?' The compliant answer is:",
    options: [
      "Yes, claimants face individual loadings.",
      "Premiums are not guaranteed and may be adjusted to meet AIA's obligations, but adjustments are made portfolio-wide -- not on an individual basis. Your premium does not rise because YOU claimed.",
      "Premiums are guaranteed for life.",
      "I am not allowed to discuss this."
    ],
    correct: 1,
    explanation: "Per PS p.9 and Day 5 Pillar 6: premiums are non-guaranteed and any adjustments are portfolio-wide, not per individual claimant.",
    category: 'compliance'
  },

  // Q129 -- correct: 0 (Heart progression staircase -- corrected names)
  {
    question: "Robert claims under UCC for the heart-condition progression. Which sequence correctly lists the 4 separate claimable major-stage events under canonical UCC condition names?",
    options: [
      "Other Serious Coronary Artery Disease -> Coronary Artery By-pass Surgery -> Heart Attack of Specified Severity -> Major Organ / Bone Marrow Transplantation (heart)",
      "Coronary Heart Disease -> Stent -> Heart Failure -> Heart Transplant",
      "Heart Attack -> Stroke -> Bypass -> Cancer",
      "Angioplasty -> Heart Attack -> Cancer -> Stroke"
    ],
    correct: 0,
    explanation: "Per Brochure p.11-13 and Day 1 staircase: canonical names are 'Other Serious Coronary Artery Disease', 'Coronary Artery By-pass Surgery', 'Heart Attack of Specified Severity', and 'Major Organ / Bone Marrow Transplantation' (item 36). 'Coronary Heart Disease' and standalone 'Heart Transplant' are NOT the policy's covered names.",
    category: 'product-facts'
  },

  // Q130 -- correct: 1 (Anti-market disclosure)
  {
    question: "A prospect's primary need is death cover and they want a guaranteed cash value. The compliant FC response is:",
    options: [
      "Sell UCC anyway and explain it later",
      "UCC has no cash value and only 5% non-accidental death benefit. If death cover is your primary need, UCC is not the right plan -- let us look at GPP, Term, or PLP instead.",
      "Add the Enhancer to convert UCC into a death plan",
      "Promise UCC will get cash value in version 2"
    ],
    correct: 1,
    explanation: "Per Day 5 anti-market disclosure: UCC is a pure CI plan with no cash value and only 5% non-accidental / 100% accidental death benefit (PS p.1-2). When death cover is the primary need, recommend GPP, Term, or PLP instead.",
    category: 'compliance'
  }
];
