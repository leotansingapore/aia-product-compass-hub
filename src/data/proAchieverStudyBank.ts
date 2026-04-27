export interface StudyQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay' | 'suitability' | 'compliance' | 'advisory-skills' | 'closing';
}

export const proAchieverStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (40 questions) — Q1–Q40
  // ============================================================

  // Q1 — correct: 2
  {
    question: "What type of insurance product is AIA Pro Achiever 3.0?",
    options: [
      "A whole life participating plan with bonuses",
      "A term life policy with investment options",
      "A regular premium Investment-Linked Policy (ILP)",
      "A universal life policy with flexible premiums"
    ],
    correct: 2,
    explanation: "AIA Pro Achiever 3.0 is a regular premium ILP that combines life insurance protection with investment components.",
    category: 'product-facts'
  },

  // Q2 — correct: 0
  {
    question: "How many investment period options does Pro Achiever 3.0 offer?",
    options: [
      "Three options: 10, 15, or 20 years",
      "Two options: 10 or 20 years",
      "Four options: 5, 10, 15, or 20 years",
      "One option: 10 years only"
    ],
    correct: 0,
    explanation: "Version 3.0 introduced 15 and 20-year options alongside the original 10-year period, giving three choices total.",
    category: 'product-facts'
  },

  // Q3 — correct: 3
  {
    question: "What range does the welcome bonus cover in Pro Achiever 3.0?",
    options: [
      "1% to 50% of annualized premium",
      "10% to 100% of annualized premium",
      "3% to 60% of annualized premium",
      "5% to 75% of annualized premium"
    ],
    correct: 3,
    explanation: "The welcome bonus ranges from 5% to 75% of annualized premium, scaling higher with larger premiums and longer investment periods.",
    category: 'product-facts'
  },

  // Q4 — correct: 0
  {
    question: "When is the welcome bonus credited to the policyholder's account?",
    options: [
      "Across the first three policy years (years 1, 2, and 3) on receipt of each annualised regular premium",
      "In the first year of the policy only",
      "After the 10-year lock-in period ends",
      "At the end of the second policy year"
    ],
    correct: 0,
    explanation: "The welcome bonus is paid upon receipt of each basic regular premium for the 1st, 2nd, AND 3rd policy years, split across the three years (Product Summary p.2 Section 3.3; Brochure p.1 footnote 1). It is NOT a single year-1 credit.",
    category: 'product-facts'
  },

  // Q5 — correct: 3
  {
    question: "What charges-and-fees framework applies to welcome bonus units during the Initial Investment Period (IIP)?",
    options: [
      "A discrete 10-year lock-in that blocks any access to the welcome bonus",
      "A 15-year lock-in regardless of IIP option",
      "No charges apply to welcome bonus units at any time",
      "Welcome bonus units are paid as regular-premium units and are subject to the same surrender, partial-withdrawal, and supplementary charges as other regular-premium units during the IIP"
    ],
    correct: 3,
    explanation: "There is no separate 10-year lock-in on the welcome bonus. The bonus is allocated as regular-premium units (Product Summary p.4 Section 4.3), so during the IIP (10, 15, or 20 years) it is subject to the standard surrender, partial-withdrawal, and supplementary charges (Product Summary p.6 Section 5.5, p.7 Section 5.6).",
    category: 'product-facts'
  },

  // Q6 — correct: 0
  {
    question: "What is the special bonus rate from year 10 onwards in Pro Achiever 3.0?",
    options: [
      "5% of annualized premium per year",
      "3% of annualized premium per year",
      "8% of annualized premium per year",
      "10% of annualized premium per year"
    ],
    correct: 0,
    explanation: "From year 10 onwards, the special bonus pays 5% of annualized premium per year. This increases to 8% from year 21 onwards.",
    category: 'product-facts'
  },

  // Q7 — correct: 3
  {
    question: "At what point does the special bonus rate increase to 8% per year?",
    options: [
      "From year 15 onwards",
      "From year 10 onwards",
      "From year 25 onwards",
      "From year 21 onwards"
    ],
    correct: 3,
    explanation: "The special bonus starts at 5% from year 10, then increases to 8% of annualized premium per year from year 21 onwards.",
    category: 'product-facts'
  },

  // Q8 — correct: 1
  {
    question: "When can the special bonus be withdrawn from Pro Achiever 3.0?",
    options: [
      "Only after the investment period ends entirely",
      "Anytime after year 10 of the policy",
      "Only upon policy surrender or death claim",
      "Only after year 15 of the policy duration"
    ],
    correct: 1,
    explanation: "The special bonus is credited from the 10th annual premium onwards (5%, then 8% from the 21st premium per Product Summary p.2 Section 3.4) and can be withdrawn from year 10. The welcome bonus has no separate lock-in; its units sit inside the IIP charge framework like other regular-premium units.",
    category: 'product-facts'
  },

  // Q9 — correct: 0
  {
    question: "What is the supplementary charge rate in Pro Achiever 3.0 during the first 10 policy years?",
    options: [
      "3.9% per annum, ceasing on receipt of the 11th annual (or 21st semi-annual / 41st quarterly / 121st monthly) regular premium",
      "2.5% per annum for the first 10 years",
      "5.0% per annum for the first 10 years",
      "4.5% per annum for the first 10 years"
    ],
    correct: 0,
    explanation: "The supplementary charge is 3.9% p.a. and ceases only upon receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2; Brochure p.2). If premiums are missed or Premium Pass is used, the charge extends beyond 10 calendar years.",
    category: 'product-facts'
  },

  // Q10 — correct: 3
  {
    question: "What happens to the supplementary charge once the relevant 11th-premium threshold is met in Pro Achiever 3.0?",
    options: [
      "It reduces to 2% per annum",
      "It remains at the same rate",
      "It converts to a flat dollar fee",
      "It drops to zero permanently"
    ],
    correct: 3,
    explanation: "Once the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium is received, the supplementary charge ceases permanently (Product Summary p.5 Section 5.2). This is a key advantage over competitors that charge perpetually.",
    category: 'product-facts'
  },

  // Q11 — correct: 2
  {
    question: "What does the Additional Term Rider (ATR) in Pro Achiever 3.0 cover?",
    options: [
      "Critical illness and hospitalization costs",
      "Accidental death and dismemberment only",
      "Death, terminal illness, terminal cancer, and total and permanent disability",
      "Medical expenses and outpatient treatments"
    ],
    correct: 2,
    explanation: "The Term Rider covers four events: death, terminal illness, terminal cancer, and total and permanent disability (Brochure p.6). Terminal cancer is a distinct trigger and is not subsumed under terminal illness.",
    category: 'product-facts'
  },

  // Q12 — correct: 1
  {
    question: "What is a key feature of ATR premiums in Pro Achiever 3.0?",
    options: [
      "They increase by 3% each year",
      "They remain fixed throughout the policy",
      "They adjust based on fund performance",
      "They are waived after year 10 entirely"
    ],
    correct: 1,
    explanation: "ATR premiums stay fixed for the duration of the policy, giving policyholders cost certainty for their protection coverage.",
    category: 'product-facts'
  },

  // Q13 — correct: 0
  {
    question: "What is 'commingling' in the context of Pro Achiever 3.0?",
    options: [
      "Mixing different risk fund profiles within one policy",
      "Combining two policies into a single account",
      "Splitting premium payments across months",
      "Merging investment returns with bonus payouts"
    ],
    correct: 0,
    explanation: "Commingling, new in v3.0, allows policyholders to mix Elite funds with a la carte funds in a single policy for diversified exposure.",
    category: 'product-facts'
  },

  // Q14 — correct: 3
  {
    question: "Which fund option was newly introduced in Pro Achiever 3.0?",
    options: [
      "AIA Global Equity Growth Fund",
      "AIA Asia Pacific Balanced Fund",
      "AIA Singapore Bond Income Fund",
      "AIA Global Dynamic Income Fund (GDIF)"
    ],
    correct: 3,
    explanation: "The AIA Global Dynamic Income Fund (GDIF) is a new fund option in v3.0 that pays quarterly dividends to policyholders.",
    category: 'product-facts'
  },

  // Q15 — correct: 1
  {
    question: "How often does the AIA Global Dynamic Income Fund (GDIF) pay dividends?",
    options: [
      "Monthly to the policyholder",
      "Quarterly to the policyholder",
      "Semi-annually to the policyholder",
      "Annually to the policyholder"
    ],
    correct: 1,
    explanation: "The GDIF pays dividends on a quarterly basis, providing regular income to policyholders who invest in this fund.",
    category: 'product-facts'
  },

  // Q16 — correct: 0
  {
    question: "What is the Premium Pass feature in Pro Achiever 3.0?",
    options: [
      "A way to pause premium payments for up to a cumulative total of 36 months across the policy, with the number of passes depending on the IIP option",
      "A discount on the first year's premiums",
      "An option to transfer premiums to another policy",
      "A facility to pay premiums via credit card points"
    ],
    correct: 0,
    explanation: "Premium Pass allows up to 36 cumulative policy months of paused premium payments (Brochure p.3). The number of passes depends on IIP: IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes, each up to 12 cumulative policy months (Product Summary p.4 Section 3.7).",
    category: 'product-facts'
  },

  // Q17 — correct: 2
  {
    question: "After how many years can a policyholder use the Premium Pass?",
    options: [
      "After 3 years of premium payments",
      "After 10 years of premium payments",
      "After 5 years of premium payments",
      "After 7 years of premium payments"
    ],
    correct: 2,
    explanation: "The Premium Pass is available after 5 years of premium payments, allowing a pause of up to 12 months with no charges.",
    category: 'product-facts'
  },

  // Q18 — correct: 3
  {
    question: "What does the capital guarantee on death provide in Pro Achiever 3.0?",
    options: [
      "Exactly 100% of all premiums paid to date with no withdrawal adjustment",
      "Fund value plus a fixed death benefit amount",
      "200% of the last year's annualized premium",
      "The higher of (a) total regular premiums paid + top-ups + premium-reduction top-ups less withdrawals, OR (b) the policy value, less applicable fees and charges"
    ],
    correct: 3,
    explanation: "The death benefit is the higher of 100% of net premiums in (regular premiums + top-ups + premium-reduction top-ups, less withdrawals) or the policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8). It is NOT 101%.",
    category: 'product-facts'
  },

  // Q19 — correct: 1
  {
    question: "What is the free-look period for Pro Achiever 3.0?",
    options: [
      "7 days from policy delivery",
      "14 days from policy delivery",
      "21 days from policy delivery",
      "30 days from policy delivery"
    ],
    correct: 1,
    explanation: "Policyholders have a 14-day free-look (cooling-off) period during which they can cancel and receive a full refund.",
    category: 'product-facts'
  },

  // Q20 — correct: 2
  {
    question: "What is the typical annual premium range for Pro Achiever 3.0?",
    options: [
      "$1,200 to $2,400 per year",
      "$8,000 to $12,000 per year",
      "$4,800 to $6,000 per year",
      "$2,400 to $3,600 per year"
    ],
    correct: 2,
    explanation: "Typical premiums range from $4,800 to $6,000 per year, which works out to approximately $400 to $500 per month.",
    category: 'product-facts'
  },

  // Q21 — correct: 0
  {
    question: "What percentage of AIA consultants sell Pro Achiever?",
    options: [
      "About 80% of AIA consultants",
      "About 50% of AIA consultants",
      "About 65% of AIA consultants",
      "About 95% of AIA consultants"
    ],
    correct: 0,
    explanation: "Approximately 80% of AIA consultants sell Pro Achiever, making it AIA's best-selling product by distribution reach (training/curriculum source: Day 1; this figure is not stated in the canonical Product Summary or Brochure).",
    category: 'product-facts'
  },

  // Q22 — correct: 3
  {
    question: "What was the main limitation of Pro Achiever 2.0 compared to 3.0?",
    options: [
      "It had higher supplementary charges overall",
      "It did not include any welcome bonus",
      "It required medical underwriting for all ages",
      "It only offered a 10-year investment period"
    ],
    correct: 3,
    explanation: "Version 2.0 only had the 10-year investment period. Version 3.0 added 15 and 20-year options, commingling, and the GDIF fund.",
    category: 'product-facts'
  },

  // Q23 — correct: 1
  {
    question: "Which feature was NOT available in Pro Achiever 2.0?",
    options: [
      "Welcome bonus on premiums paid",
      "Commingling of fund risk profiles",
      "Capital guarantee on death benefit",
      "Additional Term Rider coverage"
    ],
    correct: 1,
    explanation: "Commingling (mixing Elite funds with a la carte funds) is a new feature introduced in version 3.0.",
    category: 'product-facts'
  },

  // Q24 — correct: 0
  {
    question: "What is the grace period for late premium payments on Pro Achiever 3.0?",
    options: [
      "30 days from the due date",
      "14 days from the due date",
      "60 days from the due date",
      "45 days from the due date"
    ],
    correct: 0,
    explanation: "Policyholders have a 30-day grace period to make late premium payments before the policy lapses.",
    category: 'product-facts'
  },

  // Q25 — correct: 2
  {
    question: "Is medical underwriting required for the basic Pro Achiever 3.0 plan?",
    options: [
      "Yes, a full medical examination is required",
      "Yes, but only for applicants above age 45",
      "No, the basic plan does not require it",
      "No, but a health declaration form is needed"
    ],
    correct: 2,
    explanation: "The basic Pro Achiever 3.0 plan does not require medical underwriting, making it easier to qualify for.",
    category: 'product-facts'
  },

  // Q26 — correct: 3
  {
    question: "What investment strategy does Pro Achiever 3.0 use with regular premiums?",
    options: [
      "Lump sum allocation at policy start",
      "Market timing based on fund manager",
      "Fixed deposit laddering across maturities",
      "Dollar cost averaging over the term"
    ],
    correct: 3,
    explanation: "Regular premium payments naturally implement dollar cost averaging, buying more units when prices are low and fewer when prices are high.",
    category: 'product-facts'
  },

  // Q27 — correct: 1
  {
    question: "What determines the size of the welcome bonus in Pro Achiever 3.0?",
    options: [
      "The policyholder's age at entry only",
      "The premium amount and investment period",
      "The fund selection and risk tolerance",
      "The number of riders attached to the policy"
    ],
    correct: 1,
    explanation: "Higher premiums combined with longer investment periods yield larger welcome bonuses, ranging from 5% to 75% of annualized premium.",
    category: 'product-facts'
  },

  // Q28 — correct: 0
  {
    question: "What happens to coverage during the Premium Pass period?",
    options: [
      "Insurance coverage continues without charges",
      "The policy is suspended with no coverage",
      "Surrender charges are applied monthly",
      "The investment component is frozen entirely"
    ],
    correct: 0,
    explanation: "During Premium Pass, the policyholder's coverage continues and no charges are applied for the pause period of up to 12 months.",
    category: 'product-facts'
  },

  // Q29 — correct: 3
  {
    question: "What is the linearized monthly distribution cost of a 45-year Pro Achiever policy (total ~$6,194)?",
    options: [
      "Approximately $5 per month",
      "Approximately $3 per month",
      "Approximately $1 per month",
      "Approximately $11 per month"
    ],
    correct: 3,
    explanation: "$6,194 / 45 years / 12 months = $11.47/month, i.e. about $11/month (curriculum Day 3 Part 1: 'every month is actually just about $11. Very cheap'). The $1/month figure is off by an order of magnitude.",
    category: 'product-facts'
  },

  // Q30 — correct: 3
  {
    question: "Which CI-related rider is available for Pro Achiever 3.0?",
    options: [
      "A standalone Critical Illness lump-sum rider",
      "Only the ATR rider is available",
      "No CI-related rider is available",
      "Critical Protector Waiver of Premium (II) and Early Critical Protector Waiver of Premium (II) — these waive future premiums on diagnosis; they do not pay a CI lump sum"
    ],
    correct: 3,
    explanation: "Brochure p.6 lists Critical Protector Waiver of Premium (II) and Early Critical Protector Waiver of Premium (II) — these waive premiums on CI diagnosis but do not pay a CI lump sum. There is no standalone CI lump-sum rider on APA 3.0; the distinction matters for compliance.",
    category: 'product-facts'
  },

  // Q31 — correct: 1
  {
    question: "What is available to policyholders for managing their fund allocations?",
    options: [
      "Annual rebalancing by AIA fund managers",
      "Fund switching between available funds",
      "Automatic monthly rebalancing tools",
      "Quarterly portfolio review by advisors"
    ],
    correct: 1,
    explanation: "Fund switching allows policyholders to reallocate their investments between available funds as their needs or market outlook changes.",
    category: 'product-facts'
  },

  // Q32 — correct: 0
  {
    question: "What applies if a policyholder surrenders Pro Achiever 3.0 in the early years?",
    options: [
      "Surrender charges reduce the payout",
      "The full fund value is returned",
      "Only the welcome bonus is forfeited",
      "A flat cancellation fee of $500 applies"
    ],
    correct: 0,
    explanation: "Surrender charges apply in the early years, reducing the amount the policyholder receives if they terminate the policy prematurely.",
    category: 'product-facts'
  },

  // Q33 — correct: 2
  {
    question: "How does Pro Achiever 3.0 differ from competitors on supplementary charges?",
    options: [
      "It charges a lower rate but for the full term",
      "It uses a flat fee instead of a percentage",
      "It stops charging after the 11th annual premium is received vs perpetual competitor charges",
      "It waives charges entirely from the start"
    ],
    correct: 2,
    explanation: "APA's 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2; Brochure p.2). Competitors typically charge supplementary fees perpetually (e.g. GE 0.6%, Manulife 0.7%, FWD 1.2%).",
    category: 'product-facts'
  },

  // Q34 — correct: 3
  {
    question: "What two components does Pro Achiever 3.0 combine in one product?",
    options: [
      "Term insurance and endowment savings",
      "Critical illness cover and medical insurance",
      "Retirement income and disability coverage",
      "Life insurance protection and investment"
    ],
    correct: 3,
    explanation: "As a regular premium ILP, Pro Achiever 3.0 combines life insurance protection with an investment component in a single policy.",
    category: 'product-facts'
  },

  // Q35 — correct: 0
  {
    question: "What is the difference between Premium Pass and Premium Holiday?",
    options: [
      "Premium Pass has no charges; Premium Holiday may have charges if used early",
      "Premium Pass requires 10 years; Premium Holiday requires 5 years",
      "Premium Pass applies to riders only; Premium Holiday applies to the base plan",
      "Premium Pass is for 6 months max; Premium Holiday is for 12 months max"
    ],
    correct: 0,
    explanation: "Premium Pass (available after 5 years) has no charges, while Premium Holiday offers flexibility but charges may apply if used early in the policy.",
    category: 'product-facts'
  },

  // Q36 — correct: 1
  {
    question: "Which version of Pro Achiever first introduced the 15-year investment period?",
    options: [
      "Pro Achiever 1.0 at launch",
      "Pro Achiever 3.0 as a new feature",
      "Pro Achiever 2.0 with an update",
      "Pro Achiever 2.5 as a mid-cycle refresh"
    ],
    correct: 1,
    explanation: "The 15-year and 20-year investment periods were both introduced in version 3.0, expanding from the single 10-year option in v2.0.",
    category: 'product-facts'
  },

  // Q37 — correct: 2
  {
    question: "What is AIA Pro Achiever's market position within AIA's product lineup?",
    options: [
      "It is a niche product for high net worth clients",
      "It is AIA's entry-level term insurance plan",
      "It is AIA's best-selling insurance product",
      "It is positioned as a medical insurance rider"
    ],
    correct: 2,
    explanation: "Pro Achiever is AIA's best-selling plan, with approximately 80% of AIA consultants actively selling it.",
    category: 'product-facts'
  },

  // Q38 — correct: 3
  {
    question: "What type of funds can be commingled in Pro Achiever 3.0?",
    options: [
      "Only fixed income and equity funds",
      "Only funds from external fund houses",
      "Only index-tracking and passive funds",
      "Elite funds and a la carte fund selections"
    ],
    correct: 3,
    explanation: "Commingling in v3.0 allows mixing Elite funds with a la carte fund selections within a single policy for diversified allocation.",
    category: 'product-facts'
  },

  // Q39 — correct: 1
  {
    question: "What monthly premium does a $6,000/year Pro Achiever 3.0 policy translate to?",
    options: [
      "Approximately $600 per month",
      "Approximately $500 per month",
      "Approximately $350 per month",
      "Approximately $750 per month"
    ],
    correct: 1,
    explanation: "A $6,000 annual premium divides to $500 per month, which falls within the typical $400-$500 monthly premium range.",
    category: 'product-facts'
  },

  // Q40 — correct: 0
  {
    question: "Who receives the capital guarantee death benefit in Pro Achiever 3.0?",
    options: [
      "The nominated beneficiary or estate, ONLY if no Secondary Insured was appointed; otherwise no death benefit is paid and the policy continues with the Secondary Insured as the new Insured",
      "The policyholder's estate by default in all cases",
      "AIA to offset outstanding charges",
      "The policyholder upon terminal diagnosis"
    ],
    correct: 0,
    explanation: "If a Secondary Insured was appointed before the death of the Insured, no death benefit is paid; the Secondary Insured becomes the new Insured and the policy continues (Product Summary p.3 Section 3.6). The death benefit is paid (higher of 100% net premiums or policy value, less applicable fees and charges) to the beneficiary or estate only if no Secondary Insured was appointed.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (25 questions) — Q41–Q65
  // ============================================================

  // Q41 — correct: 2
  {
    question: "A prospect asks why they should choose Pro Achiever over a pure investment fund. What is the strongest angle?",
    options: [
      "Pro Achiever gives higher guaranteed returns than funds",
      "Pro Achiever has no management fees unlike investment funds",
      "Pro Achiever combines investment growth with life protection and capital guarantee",
      "Pro Achiever offers tax-deductible premium payments"
    ],
    correct: 2,
    explanation: "The key differentiator is the dual benefit: investment growth potential plus life insurance protection with a capital guarantee on death.",
    category: 'sales-angles'
  },

  // Q42 — correct: 3
  {
    question: "How should you position the supplementary charge structure of Pro Achiever 3.0?",
    options: [
      "Emphasize it is the lowest in the industry at all times",
      "Avoid discussing charges and focus on returns instead",
      "Compare it favorably to bank savings account fees",
      "Explain it stops after the 11th annual premium is received while competitors charge forever"
    ],
    correct: 3,
    explanation: "The 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2; Brochure p.2). Competitors typically charge perpetually, so APA holders pay zero supplementary charges for the rest of a long policy life.",
    category: 'sales-angles'
  },

  // Q43 — correct: 0
  {
    question: "A young professional earning $5,000/month asks if they can afford Pro Achiever. What is the best approach?",
    options: [
      "Frame $400-$500/month as building wealth and protection simultaneously",
      "Recommend they wait until their salary increases",
      "Suggest the minimum premium of $200/month instead",
      "Tell them insurance is more important than investing"
    ],
    correct: 0,
    explanation: "Position the $400-$500 monthly premium as a disciplined approach to building both wealth through investment and protection through insurance.",
    category: 'sales-angles'
  },

  // Q44 — correct: 1
  {
    question: "What is the best way to present the welcome bonus to a prospective client?",
    options: [
      "As free money that has no conditions attached",
      "As a three-year boost (paid years 1-3) that rewards a higher annualised premium and longer IIP",
      "As a guaranteed investment return on their policy",
      "As compensation for the supplementary charges paid"
    ],
    correct: 1,
    explanation: "The welcome bonus is paid upon receipt of each basic regular premium for the 1st, 2nd, AND 3rd policy years (Product Summary p.2 Section 3.3; Brochure p.1 footnote 1). It scales by IIP and premium band; e.g. IIP 20 + >=$12,000 premium = 20% / 25% / 30% across years 1/2/3 for a 75% total.",
    category: 'sales-angles'
  },

  // Q45 — correct: 2
  {
    question: "How should you position the 20-year investment period option to a client in their 30s?",
    options: [
      "As the only option worth considering at their age",
      "As a requirement for accessing the GDIF fund",
      "As a way to maximize the welcome bonus and earn 8% special bonus from year 21",
      "As mandatory for clients under age 40"
    ],
    correct: 2,
    explanation: "The 20-year period maximizes the welcome bonus percentage and positions the client to receive the enhanced 8% special bonus from year 21 onwards.",
    category: 'sales-angles'
  },

  // Q46 — correct: 3
  {
    question: "When pitching Pro Achiever to a risk-averse prospect, which feature should you lead with?",
    options: [
      "The wide range of aggressive equity funds",
      "The high welcome bonus percentages available",
      "The commingling feature for fund diversification",
      "The capital guarantee on death (higher of 100% net premiums in or policy value, less applicable fees and charges)"
    ],
    correct: 3,
    explanation: "For risk-averse prospects, the death benefit capital guarantee is the higher of (a) total regular premiums + top-ups + premium-reduction top-ups less withdrawals, or (b) the policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8) — i.e. 100% of net premiums in, NOT 101%.",
    category: 'sales-angles'
  },

  // Q47 — correct: 0
  {
    question: "A client worries about being locked into payments for 20 years. What feature addresses this?",
    options: [
      "The Premium Pass allowing up to 36 cumulative months of paused premiums on IIP 20 (3 passes, each up to 12 cumulative policy months)",
      "The 14-day free-look cancellation period",
      "The fund switching flexibility at any time",
      "The option to reduce the sum assured later"
    ],
    correct: 0,
    explanation: "On IIP 20, the policyholder gets 3 Premium Passes for up to 36 cumulative policy months (Product Summary p.4 Section 3.7; Brochure p.3). IIP 15 gets 2 passes (24 months); IIP 10 gets 1 pass (12 months). Each pass can run up to 12 cumulative policy months.",
    category: 'sales-angles'
  },

  // Q48 — correct: 1
  {
    question: "How should you present dollar cost averaging to a client nervous about market timing?",
    options: [
      "Explain that Pro Achiever guarantees positive returns",
      "Show how regular premiums automatically buy more units when prices drop",
      "Say the fund managers will time the market for them",
      "Recommend they switch to a fixed deposit instead"
    ],
    correct: 1,
    explanation: "Regular premium payments naturally implement dollar cost averaging — buying more units when markets dip and fewer when markets peak, smoothing out volatility.",
    category: 'sales-angles'
  },

  // Q49 — correct: 2
  {
    question: "What is the strongest way to present the special bonus to a long-term client?",
    options: [
      "As a replacement for the welcome bonus after year 10",
      "As a penalty-free early surrender incentive",
      "As a loyalty reward that grows from 5% to 8% over time",
      "As an automatic reinvestment into the GDIF fund"
    ],
    correct: 2,
    explanation: "Position the special bonus as a loyalty reward: 5% from year 10 and increasing to 8% from year 21, rewarding clients who stay committed long-term.",
    category: 'sales-angles'
  },

  // Q50 — correct: 3
  {
    question: "A prospect compares Pro Achiever to a competitor ILP. What charge advantage should you highlight?",
    options: [
      "Pro Achiever has no charges at all after year 5",
      "Pro Achiever refunds all charges upon policy maturity",
      "Pro Achiever charges are tax-deductible for the client",
      "Pro Achiever's supplementary charge ceases on receipt of the 11th annual regular premium"
    ],
    correct: 3,
    explanation: "The 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2). Most competitors charge supplementary fees for the entire policy term.",
    category: 'sales-angles'
  },

  // Q51 — correct: 0
  {
    question: "How should you use the distribution cost figure when explaining Pro Achiever's value?",
    options: [
      "Linearize the total ~$6,194 to about $11/month over 45 years - 'hiring an investment consultant for $11/month'",
      "Avoid mentioning costs entirely to close the sale faster",
      "Quote only the total figure of $6,194 for transparency",
      "Compare it to the cost of a competitor's whole life plan"
    ],
    correct: 0,
    explanation: "$6,194 / 45 years / 12 months = $11.47/month, i.e. about $11/month (curriculum Day 3 Part 1). The reframe 'hiring an investment consultant for $11/month' makes the distribution cost feel small relative to the benefits.",
    category: 'sales-angles'
  },

  // Q52 — correct: 1
  {
    question: "A couple with a newborn asks about Pro Achiever. What angle works best?",
    options: [
      "Focus on the 10-year period to match school enrollment",
      "Highlight the 20-year period to build a university fund with death benefit protection",
      "Recommend they buy two separate term and investment policies",
      "Suggest waiting until the child is old enough to be named beneficiary"
    ],
    correct: 1,
    explanation: "The 20-year period aligns with the child reaching university age, combining wealth accumulation for education with life protection for the parents.",
    category: 'sales-angles'
  },

  // Q53 — correct: 2
  {
    question: "How should you present the commingling feature to a sophisticated investor?",
    options: [
      "As a way to avoid paying advisory fees entirely",
      "As a guarantee that all funds will outperform benchmarks",
      "As a unique feature allowing diversified fund allocation in one policy",
      "As an automatic rebalancing tool managed by AIA"
    ],
    correct: 2,
    explanation: "Commingling appeals to sophisticated investors by allowing them to mix Elite funds with a la carte selections in one policy for tailored diversification.",
    category: 'sales-angles'
  },

  // Q54 — correct: 0
  {
    question: "What sales angle works best when presenting the GDIF to income-seeking retirees?",
    options: [
      "The fund provides quarterly income distributions for regular cash flow",
      "The fund guarantees a fixed dividend amount each quarter",
      "The fund has the highest returns of all AIA fund options",
      "The fund is only available to clients above age 55"
    ],
    correct: 0,
    explanation: "For retirees seeking income, the GDIF's quarterly dividend payments provide a regular cash flow stream, which is a compelling benefit.",
    category: 'sales-angles'
  },

  // Q55 — correct: 3
  {
    question: "A client says their company already provides group insurance. How do you position Pro Achiever?",
    options: [
      "Agree that group insurance is sufficient and no extra cover is needed",
      "Explain that Pro Achiever replaces group insurance with better terms",
      "Suggest cancelling group insurance to fund Pro Achiever premiums",
      "Highlight that group cover ends when employment ends, while Pro Achiever stays"
    ],
    correct: 3,
    explanation: "Group insurance is tied to employment. Pro Achiever provides portable, personal coverage that continues regardless of job changes, plus an investment component.",
    category: 'sales-angles'
  },

  // Q56 — correct: 1
  {
    question: "What is the best way to handle a prospect who wants to 'think about it' after a Pro Achiever presentation?",
    options: [
      "Pressure them by saying the welcome bonus rates may change soon",
      "Remind them of the 14-day free-look period as a safety net to decide risk-free",
      "Offer a steep discount on the first year's premium",
      "Tell them competitors offer worse products at higher prices"
    ],
    correct: 1,
    explanation: "The 14-day free-look period removes commitment anxiety — they can proceed knowing they have 14 days to cancel with a full refund if they change their mind.",
    category: 'sales-angles'
  },

  // Q57 — correct: 2
  {
    question: "How should you position the Term Rider when selling Pro Achiever to a breadwinner?",
    options: [
      "As an optional add-on that most clients skip",
      "As a replacement for medical insurance coverage",
      "As fixed-premium protection covering death, terminal illness, terminal cancer, and total and permanent disability",
      "As a savings vehicle that builds cash value over time"
    ],
    correct: 2,
    explanation: "For breadwinners, the Term Rider covers four events - death, terminal illness, terminal cancer, and total and permanent disability (Brochure p.6). Premiums stay fixed for the duration of the cover, giving predictable family protection.",
    category: 'sales-angles'
  },

  // Q58 — correct: 3
  {
    question: "A prospect earns variable income as a freelancer on an IIP 20 plan. Which Pro Achiever feature should you emphasize?",
    options: [
      "The requirement for consistent monthly payments",
      "The ability to top up premiums during high-income months",
      "The option to pay the full 20 years upfront at a discount",
      "Premium Pass: up to 3 passes on IIP 20 covering up to 36 cumulative policy months of paused premiums"
    ],
    correct: 3,
    explanation: "On IIP 20, the policyholder gets 3 Premium Passes for up to 36 cumulative policy months of paused premiums (Product Summary p.4 Section 3.7; Brochure p.3). Each pass is up to 12 cumulative policy months. This accommodates freelance income volatility without surrendering the policy.",
    category: 'sales-angles'
  },

  // Q59 — correct: 0
  {
    question: "How do you frame Pro Achiever 3.0 as an upgrade for existing v2.0 policyholders?",
    options: [
      "Highlight the new 15/20-year options, commingling, and GDIF that v2.0 lacks",
      "Tell them v2.0 will be discontinued and they must switch",
      "Explain that v3.0 has lower premiums for the same coverage",
      "Say v3.0 removes the supplementary charge entirely from day one"
    ],
    correct: 0,
    explanation: "The upgrade pitch focuses on v3.0 exclusive features: additional investment period options (15 and 20 years), commingling, and the GDIF fund.",
    category: 'sales-angles'
  },

  // Q60 — correct: 1
  {
    question: "What is the most effective way to present Pro Achiever's bonuses to a numbers-oriented client?",
    options: [
      "Focus only on the welcome bonus since it is the largest single payout",
      "Show a projection combining welcome bonus, special bonus, and fund growth over 20+ years",
      "Avoid specific numbers and talk about the emotional benefits of security",
      "Compare the bonus rates to current bank savings interest rates only"
    ],
    correct: 1,
    explanation: "Numbers-oriented clients respond best to projections showing the cumulative impact of welcome bonus, special bonus (5% then 8%), and investment growth.",
    category: 'sales-angles'
  },

  // Q61 — correct: 2
  {
    question: "A client asks if no medical underwriting means coverage is limited. How do you respond?",
    options: [
      "Confirm that coverage is significantly reduced as a trade-off",
      "Recommend they get a separate medical exam for better rates",
      "Explain the death benefit capital guarantee: higher of 100% net premiums in (regular premiums + top-ups + premium-reduction top-ups, less withdrawals) or policy value, less applicable fees and charges",
      "Suggest adding multiple riders to compensate for limited basic coverage"
    ],
    correct: 2,
    explanation: "Despite no medical underwriting on the basic plan, the death benefit capital guarantee gives the higher of 100% net premiums in or the policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8). It is NOT 101%.",
    category: 'sales-angles'
  },

  // Q62 — correct: 0
  {
    question: "How should you present the fund switching capability to a client who follows markets actively?",
    options: [
      "As a way to adapt their portfolio allocation as market conditions change",
      "As a tool to time the market and maximize short-term gains",
      "As a feature that guarantees they will always be in the top fund",
      "As an automatic feature that requires no client involvement"
    ],
    correct: 0,
    explanation: "Fund switching allows active clients to adapt their allocation as conditions change, giving them control over their investment mix within the policy.",
    category: 'sales-angles'
  },

  // Q63 — correct: 3
  {
    question: "What is the simplest way to explain why Pro Achiever charges more in early years?",
    options: [
      "Because AIA needs to recover setup costs upfront",
      "Because fund management fees are highest in the first decade",
      "Because the welcome bonus offsets these charges dollar for dollar",
      "Because the supplementary charge covers distribution and stops after 10 years"
    ],
    correct: 3,
    explanation: "Be transparent: the 3.9% supplementary charge covers distribution costs and stops after 10 years, unlike competitors who charge indefinitely.",
    category: 'sales-angles'
  },

  // Q64 — correct: 1
  {
    question: "When presenting Pro Achiever to a 25-year-old, which benefit resonates most?",
    options: [
      "The immediate tax benefits of the premium payments",
      "The special bonus increasing to 8% from year 21, when they are only 46",
      "The ability to surrender the policy within the first year",
      "The option to convert it to a whole life policy later"
    ],
    correct: 1,
    explanation: "A 25-year-old on a 20-year plan would be just 46 when the special bonus jumps to 8%, highlighting the advantage of starting young with Pro Achiever.",
    category: 'sales-angles'
  },

  // Q65 — correct: 2
  {
    question: "A prospect says they already save through CPF. How do you position Pro Achiever?",
    options: [
      "Suggest withdrawing CPF to fund Pro Achiever premiums",
      "Tell them CPF returns are inferior and should be ignored",
      "Explain that CPF is locked until 55, while Pro Achiever offers more flexibility and death benefit",
      "Recommend stopping CPF contributions to afford the premiums"
    ],
    correct: 2,
    explanation: "Pro Achiever complements CPF by offering investment flexibility, death benefit protection, and special bonuses — addressing gaps that CPF alone cannot fill.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (20 questions) — Q66–Q85
  // ============================================================

  // Q66 — correct: 0
  {
    question: "A prospect says: 'ILPs have high fees that eat into returns.' How should you respond about Pro Achiever?",
    options: [
      "Explain the supplementary charge ends after the 11th annual premium is received, unlike competitors who charge forever",
      "Deny that any fees exist in Pro Achiever 3.0",
      "Agree and suggest they buy a term policy and invest the rest instead",
      "Change the topic to the welcome bonus instead"
    ],
    correct: 0,
    explanation: "Acknowledge the concern, then differentiate: APA's 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2). Competitors typically charge perpetually.",
    category: 'objection-handling'
  },

  // Q67 — correct: 3
  {
    question: "A client says: 'I can get better returns investing on my own.' What is the best rebuttal?",
    options: [
      "Pro Achiever guarantees higher returns than self-investing",
      "Individual investors always underperform professional managers",
      "AIA's funds are the best-performing funds in Singapore",
      "Self-investing lacks the death benefit, capital guarantee (100% net premiums in or policy value, whichever higher), and bonus structure Pro Achiever offers"
    ],
    correct: 3,
    explanation: "The rebuttal focuses on what self-investing cannot provide: death benefit coverage, the 100%-of-net-premiums-in capital guarantee (Product Summary p.1-2 Section 3.1), and the welcome (5-75% across years 1-3) and special (5%/8%) bonus structure.",
    category: 'objection-handling'
  },

  // Q68 — correct: 1
  {
    question: "A prospect objects: 'I don't want to be locked in for 10 years.' How do you address this?",
    options: [
      "Agree and recommend a shorter-term product instead",
      "Clarify that there is no separate welcome-bonus lock-in; the IIP (10/15/20 yrs) is when surrender, partial-withdrawal, and supplementary charges apply, and Premium Pass plus fund switching give ongoing flexibility",
      "Explain there is no lock-in at all with Pro Achiever",
      "Say that all insurance products have the same lock-in period"
    ],
    correct: 1,
    explanation: "There is no discrete 10-year welcome-bonus lock-in. The IIP (10/15/20 years) is the period when surrender, partial-withdrawal, and supplementary charges apply (Product Summary p.4 Section 4.3, p.6 Section 5.5, p.7 Section 5.6). Premium Pass and fund switching provide flexibility within the IIP.",
    category: 'objection-handling'
  },

  // Q69 — correct: 2
  {
    question: "A client says: '$500/month is too expensive for me right now.' What should you do?",
    options: [
      "Tell them they cannot afford to not have insurance protection",
      "Suggest they borrow money from family to cover the premiums",
      "Explore a lower premium amount that still qualifies for a welcome bonus",
      "Recommend they skip all insurance until they earn more"
    ],
    correct: 2,
    explanation: "Work within their budget by adjusting the premium amount. Even lower premiums qualify for welcome bonuses, making the plan accessible.",
    category: 'objection-handling'
  },

  // Q70 — correct: 0
  {
    question: "A prospect says: 'My friend lost money on an ILP.' How do you handle this?",
    options: [
      "Acknowledge the concern and highlight the death benefit capital guarantee (higher of 100% net premiums in or policy value, less applicable fees and charges) and dollar cost averaging",
      "Dismiss their friend's experience as an isolated case",
      "Explain that losses are impossible with Pro Achiever",
      "Blame their friend for choosing the wrong funds"
    ],
    correct: 0,
    explanation: "Validate the concern, then explain Pro Achiever's safeguards: the death benefit capital guarantee giving the higher of 100% net premiums in or policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1), plus dollar cost averaging through regular premiums.",
    category: 'objection-handling'
  },

  // Q71 — correct: 3
  {
    question: "A client objects: 'I already have life insurance, I don't need more.' Best response?",
    options: [
      "Tell them existing coverage is likely outdated and insufficient",
      "Say they should cancel their existing policy and switch entirely",
      "Agree and end the conversation since they are covered",
      "Position Pro Achiever as an investment plan with bonus protection, not just insurance"
    ],
    correct: 3,
    explanation: "Reframe Pro Achiever as primarily an investment vehicle with bonus structure, protection, and capital guarantee — complementing, not replacing, existing coverage.",
    category: 'objection-handling'
  },

  // Q72 — correct: 1
  {
    question: "A prospect says: 'I heard the surrender charges are punishing if I quit early.' How do you respond?",
    options: [
      "Deny that surrender charges exist in Pro Achiever",
      "Explain that surrender charges encourage long-term discipline, and the Premium Pass provides flexibility",
      "Suggest they plan to surrender early if the market drops",
      "Say surrender charges are the same as all competitor products"
    ],
    correct: 1,
    explanation: "Frame surrender charges as aligned with long-term wealth building. Mention Premium Pass (12 months pause after year 5) as an alternative to surrendering.",
    category: 'objection-handling'
  },

  // Q73 — correct: 2
  {
    question: "A client asks: 'Why should I pay 3.9% when I can buy an ETF with 0.1% fees?' How do you counter?",
    options: [
      "Say ETFs are too risky for most retail investors to handle",
      "Admit that ETFs are always better value than ILPs",
      "Explain the 3.9% supplementary charge ceases on receipt of the 11th annual regular premium, then highlight life cover, the death-benefit capital guarantee, and the welcome/special bonuses that ETFs lack",
      "Tell them the 3.9% is waived if they choose the GDIF fund"
    ],
    correct: 2,
    explanation: "The 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2). Beyond fees, APA bundles life protection, the 100% net-premiums-in death benefit guarantee, welcome bonus (years 1-3), and special bonuses (5% from year 10, 8% from year 21) - none of which ETFs provide.",
    category: 'objection-handling'
  },

  // Q74 — correct: 0
  {
    question: "A prospect says: 'I want to wait for the market to drop before investing.' Best response?",
    options: [
      "Explain that dollar cost averaging with regular premiums removes the need to time the market",
      "Agree and tell them to call back when markets correct",
      "Guarantee that AIA's funds will outperform during downturns",
      "Tell them market timing is impossible for any investor"
    ],
    correct: 0,
    explanation: "Dollar cost averaging through regular premiums means they automatically buy more units when markets dip, removing the need to time their entry.",
    category: 'objection-handling'
  },

  // Q75 — correct: 3
  {
    question: "A young prospect says: 'I'm too young to think about insurance.' How should you respond?",
    options: [
      "Agree that they should wait until they have dependents",
      "Tell them something bad could happen to them at any time",
      "Say insurance is legally required for everyone above 18",
      "Explain starting young means lower cost, longer bonus accumulation, and reaching 8% special bonus sooner"
    ],
    correct: 3,
    explanation: "Starting young means more time for investment growth, a longer period to accumulate special bonuses, and reaching the 8% tier (year 21) while still in their prime.",
    category: 'objection-handling'
  },

  // Q76 — correct: 1
  {
    question: "A client says: 'I'll just buy term insurance and invest the rest myself.' What is your best counter?",
    options: [
      "Tell them BTIR is an outdated strategy that never works",
      "Acknowledge the strategy, then show how Pro Achiever's bonuses, capital guarantee, and structure offer combined value BTIR misses",
      "Say term insurance will be discontinued in Singapore soon",
      "Agree that BTIR is always the superior approach for everyone"
    ],
    correct: 1,
    explanation: "Respect the BTIR philosophy, then demonstrate Pro Achiever's unique value: welcome/special bonuses, capital guarantee on death, and the discipline of regular investing.",
    category: 'objection-handling'
  },

  // Q77 — correct: 2
  {
    question: "A prospect objects: 'I don't trust insurance companies with my investments.' How do you handle it?",
    options: [
      "Dismiss their concern as irrational fear",
      "Guarantee that their investment will never lose value",
      "Explain that AIA is one of the largest insurers in Asia and Pro Achiever is their best-selling investment plan, with broad consultant adoption (training/curriculum: ~80%)",
      "Suggest they research online before making a decision"
    ],
    correct: 2,
    explanation: "Address trust by highlighting AIA's scale and APA's status as the best-selling investment plan with broad consultant adoption (~80%, training/curriculum source - not stated in the canonical Product Summary or Brochure).",
    category: 'objection-handling'
  },

  // Q78 — correct: 0
  {
    question: "A client asks: 'What if I lose my job and can't pay premiums?' How do you reassure them?",
    options: [
      "Explain Premium Pass: 1 pass on IIP 10 (12 months), 2 passes on IIP 15 (24 months total), 3 passes on IIP 20 (36 months total)",
      "Tell them job loss is unlikely and they should not worry about it",
      "Suggest they take a personal loan to keep premiums current",
      "Recommend they surrender the policy immediately if unemployed"
    ],
    correct: 0,
    explanation: "Premium Pass scales with IIP: IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes, each up to 12 cumulative policy months (Product Summary p.4 Section 3.7; Brochure p.3). A maximum of 36 cumulative months on IIP 20 covers extended employment gaps without surrendering.",
    category: 'objection-handling'
  },

  // Q79 — correct: 3
  {
    question: "A prospect says: 'The welcome bonus is just a marketing gimmick.' How do you respond?",
    options: [
      "Agree that it is mainly a marketing tool with limited real value",
      "Explain the bonus is paid out in cash at the end of 10 years",
      "Say the bonus is only available for a limited promotional period",
      "The bonus is real: paid upon receipt of each basic regular premium for the 1st, 2nd, and 3rd policy years (allocated as regular-premium units that compound with fund performance)"
    ],
    correct: 3,
    explanation: "The welcome bonus is paid upon receipt of each basic regular premium for the 1st, 2nd, AND 3rd policy years (Product Summary p.2 Section 3.3; Brochure p.1 footnote 1). It is allocated as regular-premium units (Product Summary p.4 Section 4.3), so it compounds alongside premium units.",
    category: 'objection-handling'
  },

  // Q80 — correct: 1
  {
    question: "A client objects: 'I can withdraw from my savings account anytime, but your plan locks me in.' Best response?",
    options: [
      "Suggest they keep all their money in savings accounts instead",
      "Explain the lock-in helps enforce financial discipline while providing insurance coverage savings accounts lack",
      "Say the 14-day free-look period means there is no real lock-in",
      "Tell them savings accounts will be phased out by banks"
    ],
    correct: 1,
    explanation: "Frame the structure as enforcing financial discipline, while noting that savings accounts offer no death benefit, capital guarantee, or bonus structure.",
    category: 'objection-handling'
  },

  // Q81 — correct: 2
  {
    question: "A prospect says: 'I'd rather put money into property.' How do you handle this for Pro Achiever?",
    options: [
      "Agree that property is always superior to insurance products",
      "Tell them property values will crash and they should avoid it",
      "Position Pro Achiever as a liquid, diversified complement to illiquid property investment",
      "Suggest they sell property to fund Pro Achiever premiums"
    ],
    correct: 2,
    explanation: "Pro Achiever complements property: it is more liquid, provides diversification across asset classes, includes death benefit protection, and requires lower capital commitment.",
    category: 'objection-handling'
  },

  // Q82 — correct: 0
  {
    question: "A client says: 'Insurance agents just want to earn commission.' How do you address this with Pro Achiever?",
    options: [
      "Linearize the distribution cost: ~$6,194 / 45 yrs / 12 = ~$11/month, then refocus on the value delivered",
      "Deny that consultants earn any commission on Pro Achiever",
      "Change the topic to the product benefits immediately",
      "Agree and offer to reduce your commission for them"
    ],
    correct: 0,
    explanation: "Be transparent: total distribution cost ~$6,194 / 45 years / 12 months = ~$11/month (curriculum Day 3 Part 1). This is minimal relative to the protection, capital guarantee, and bonus structure delivered.",
    category: 'objection-handling'
  },

  // Q83 — correct: 3
  {
    question: "A prospect says: 'I'll wait for Pro Achiever 4.0 to come out.' How do you respond?",
    options: [
      "Confirm that 4.0 is coming soon and they should wait for it",
      "Tell them 3.0 is the final version and no updates are planned",
      "Offer a guaranteed upgrade clause if they sign up now",
      "Explain every year they delay is a year of missed bonuses, protection, and compound growth"
    ],
    correct: 3,
    explanation: "Each year of delay means one less year of welcome bonus growth, one year later to reach the special bonus, and one year less of life protection.",
    category: 'objection-handling'
  },

  // Q84 — correct: 1
  {
    question: "A client objects: 'ILPs always underperform compared to direct fund investing.' What is the best counter?",
    options: [
      "Guarantee that Pro Achiever funds will outperform the market index",
      "Explain that Pro Achiever includes death benefit, capital guarantee (100% net premiums in or policy value, whichever higher), and bonuses that direct investing cannot replicate",
      "Admit that ILPs always underperform and offer no added value",
      "Say fund performance data is confidential and cannot be shared"
    ],
    correct: 1,
    explanation: "Shift the comparison from pure returns to total value: death benefit, the 100% net-premiums-in capital guarantee (Product Summary p.1-2 Section 3.1), the up-to-75% welcome bonus across years 1-3 (Section 3.3), and special bonuses (5%/8%) are not available through direct fund investing.",
    category: 'objection-handling'
  },

  // Q85 — correct: 2
  {
    question: "A prospect says: 'What if AIA's funds perform badly?' How do you reassure them about Pro Achiever?",
    options: [
      "Promise that AIA will compensate them for any fund losses",
      "Say it is impossible for all AIA funds to underperform",
      "Highlight fund switching, commingling, dollar cost averaging, and the capital guarantee on death as safeguards",
      "Recommend they invest in a fixed deposit instead"
    ],
    correct: 2,
    explanation: "Multiple safeguards exist: fund switching to reallocate, commingling for diversification, dollar cost averaging to smooth volatility, and the capital guarantee on death.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (15 questions) — Q86–Q100
  // ============================================================

  // Q86 — correct: 3
  {
    question: "During a roleplay, your client asks: 'Can I access my welcome bonus after 5 years?' What is the correct response?",
    options: [
      "'Yes, the welcome bonus is fully accessible after 5 years with no charges.'",
      "'The welcome bonus is never accessible.'",
      "'You can access half after 5 years and the rest after 10 years.'",
      "'There is no separate welcome-bonus lock-in. The bonus is paid as regular-premium units across years 1-3 and is subject to the same surrender, partial-withdrawal, and supplementary charges that apply during the IIP (10/15/20 years) - so withdrawing in year 5 would incur those IIP charges.'"
    ],
    correct: 3,
    explanation: "The welcome bonus is allocated as regular-premium units (Product Summary p.4 Section 4.3) and is subject to the same charges as other regular-premium units during the IIP (Product Summary p.6 Section 5.5, p.7 Section 5.6). There is no discrete '10-year lock-in.'",
    category: 'roleplay'
  },

  // Q87 — correct: 0
  {
    question: "In a roleplay scenario, a client asks: 'What happens if I die 3 years into my Pro Achiever policy?' What do you say?",
    options: [
      "'If no Secondary Insured was appointed, your beneficiary or estate receives the higher of (a) total regular premiums paid + top-ups + premium-reduction top-ups less withdrawals, or (b) the policy value, less applicable fees and charges. If a Secondary Insured was appointed, no death benefit is paid and the policy continues with them as the new Insured.'",
      "'The policy is void since premiums were paid for less than 5 years.'",
      "'AIA refunds exactly what you paid in premiums, with no additions.'",
      "'Your beneficiary gets only the fund value at the time of death.'"
    ],
    correct: 0,
    explanation: "The death benefit is the higher of 100% of net premiums in or the policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8). If a Secondary Insured was appointed before the death of the Insured, no death benefit is paid and the policy continues (Product Summary p.3 Section 3.6).",
    category: 'roleplay'
  },

  // Q88 — correct: 1
  {
    question: "A roleplay client says: 'I chose the 10-year period. Can I extend it to 20 years later?' What is correct?",
    options: [
      "'Yes, you can extend at any time by calling AIA directly.'",
      "'No, the investment period is fixed at policy inception and cannot be changed.'",
      "'Yes, but only within the first 2 years of the policy.'",
      "'Yes, but you will forfeit the welcome bonus already credited.'"
    ],
    correct: 1,
    explanation: "The investment period (10, 15, or 20 years) is selected at inception and cannot be changed after. Clients should choose carefully from the start.",
    category: 'roleplay'
  },

  // Q89 — correct: 2
  {
    question: "In a roleplay, a prospect asks: 'Does the special bonus come from my own premiums?' How do you respond?",
    options: [
      "'Yes, it is deducted from your existing fund units each year.'",
      "'It is a rebate on the supplementary charges you previously paid.'",
      "'No, it is an additional bonus credited by AIA on top of your fund value.'",
      "'It comes from the performance fees earned by the fund manager.'"
    ],
    correct: 2,
    explanation: "The special bonus is an additional credit from AIA — 5% of annualized premium from year 10 and 8% from year 21 — not taken from the client's existing funds.",
    category: 'roleplay'
  },

  // Q90 — correct: 3
  {
    question: "During roleplay, a client asks: 'If markets crash, will I lose everything in Pro Achiever?' Best response?",
    options: [
      "'AIA guarantees your fund value will never decrease in any year.'",
      "'Yes, there is no protection against market losses during your lifetime.'",
      "'Market crashes do not affect ILP fund values because AIA absorbs all losses.'",
      "'Your fund value may fluctuate, but on death the capital guarantee gives the higher of 100% of net premiums in (regular premiums + top-ups + premium-reduction top-ups, less withdrawals) or the policy value, less applicable fees and charges.'"
    ],
    correct: 3,
    explanation: "Be honest that fund values can fluctuate with markets, while reassuring them about the death benefit capital guarantee (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8) and dollar cost averaging through regular premiums.",
    category: 'roleplay'
  },

  // Q91 — correct: 0
  {
    question: "A roleplay client asks: 'Can I put all my money into the GDIF for quarterly income?' What do you say?",
    options: [
      "'Yes, you can allocate your funds to GDIF for quarterly dividend distributions.'",
      "'No, GDIF is only available as part of a commingled portfolio with Elite funds.'",
      "'No, GDIF requires a minimum allocation of $100,000 to access.'",
      "'Yes, but GDIF is only available to clients over age 50.'"
    ],
    correct: 0,
    explanation: "The GDIF is available as a fund option in Pro Achiever 3.0 and clients can allocate to it for quarterly dividend income distributions.",
    category: 'roleplay'
  },

  // Q92 — correct: 1
  {
    question: "In a roleplay, the client says: 'I want to cancel within the first week.' What should you tell them?",
    options: [
      "'Cancellation is only possible after the first premium payment is processed.'",
      "'You have a 14-day free-look period to cancel and receive a full refund.'",
      "'Early cancellation incurs a 50% penalty on the first premium.'",
      "'You must wait 30 days before any cancellation can be processed.'"
    ],
    correct: 1,
    explanation: "The 14-day free-look (cooling-off) period allows cancellation with a full refund, giving clients confidence in their decision.",
    category: 'roleplay'
  },

  // Q93 — correct: 2
  {
    question: "During a roleplay presentation, how should you explain what commingling means to a client with no investment knowledge?",
    options: [
      "'It means AIA manages your funds and you have no control over the allocation.'",
      "'It is a tax strategy for reducing capital gains on your investment portfolio.'",
      "'It lets you mix different types of investment funds in one policy for better diversification.'",
      "'It means your premiums are pooled together with other policyholders' money.'"
    ],
    correct: 2,
    explanation: "For non-savvy clients, explain commingling simply: mixing different fund types (Elite + a la carte) in one policy to spread risk across more investments.",
    category: 'roleplay'
  },

  // Q94 — correct: 0
  {
    question: "A roleplay client asks: 'My premium is $500/month. How much is my welcome bonus?' What is the correct approach?",
    options: [
      "Explain the bonus depends on their annualized premium ($6,000) and chosen investment period",
      "Quote the exact dollar amount immediately based on a standard rate",
      "Tell them welcome bonuses are not available at that premium level",
      "Say the welcome bonus is always 50% regardless of premium"
    ],
    correct: 0,
    explanation: "The welcome bonus percentage depends on both the annualized premium amount and the investment period chosen. At $6,000/year, the exact percentage varies by period length.",
    category: 'roleplay'
  },

  // Q95 — correct: 3
  {
    question: "In a roleplay, a client asks: 'Do I need a medical check-up to buy Pro Achiever?' How do you respond?",
    options: [
      "'Yes, a full medical examination is mandatory for all applicants.'",
      "'Only applicants above age 35 need a medical check-up.'",
      "'A basic health questionnaire replaces the medical check-up.'",
      "'No medical underwriting is needed for the basic plan.'"
    ],
    correct: 3,
    explanation: "The basic Pro Achiever 3.0 plan does not require medical underwriting, making it accessible and quick to set up.",
    category: 'roleplay'
  },

  // Q96 — correct: 1
  {
    question: "During roleplay, a client asks: 'What if I miss a premium payment by two weeks?' What do you tell them?",
    options: [
      "'Your policy will be immediately terminated with no recourse.'",
      "'You have a 30-day grace period, so a two-week delay is within the window.'",
      "'A late fee of 10% of the premium will be applied automatically.'",
      "'Your coverage is suspended until the overdue payment is made.'"
    ],
    correct: 1,
    explanation: "The 30-day grace period means a two-week delay is well within the allowed window. The policy remains active during the grace period.",
    category: 'roleplay'
  },

  // Q97 — correct: 2
  {
    question: "A roleplay client says: 'I chose Pro Achiever 2.0 last year. Should I switch to 3.0?' How do you advise?",
    options: [
      "Tell them switching is free and they should upgrade immediately",
      "Say version 2.0 is being discontinued so they must switch",
      "Explain the new features (commingling, GDIF, 15/20-year options) and assess if they add value to their goals",
      "Recommend they keep 2.0 since both versions are identical in benefits"
    ],
    correct: 2,
    explanation: "Assess whether the v3.0 exclusive features (commingling, GDIF, additional period options) align with the client's specific financial goals before recommending a switch.",
    category: 'roleplay'
  },

  // Q98 — correct: 0
  {
    question: "In a roleplay, the client asks: 'Will my ATR premiums go up as I get older?' What is the correct answer?",
    options: [
      "'ATR premiums stay fixed for the life of the policy regardless of age.'",
      "'Yes, ATR premiums increase by 5% every 5 years as you age.'",
      "'ATR premiums are reviewed annually and may increase based on claims.'",
      "'ATR premiums increase only if you make a claim during the policy.'"
    ],
    correct: 0,
    explanation: "A key feature of the ATR is that premiums remain fixed throughout the policy, providing cost certainty regardless of the policyholder's age.",
    category: 'roleplay'
  },

  // Q99 — correct: 3
  {
    question: "During a roleplay, how do you explain the difference between Pro Achiever's two types of bonuses?",
    options: [
      "'Both bonuses are identical - they are just paid at different times.'",
      "'The welcome bonus is cash; the special bonus is additional fund units.'",
      "'The welcome bonus applies to new clients only; the special bonus applies to renewals.'",
      "'The welcome bonus is paid upon receipt of each basic regular premium for the 1st, 2nd, and 3rd policy years (allocated as regular-premium units, subject to IIP charges); the special bonus is paid upon receipt of each regular premium from the 10th annual onwards at 5%, increasing to 8% from the 21st annual premium.'"
    ],
    correct: 3,
    explanation: "The welcome bonus is paid across years 1-3 (Product Summary p.2 Section 3.3); the special bonus is 5% of annualised premium from the 10th annual premium and 8% from the 21st annual premium onwards (Section 3.4). Both are allocated as regular-premium units.",
    category: 'roleplay'
  },

  // Q100 — correct: 1
  {
    question: "A roleplay prospect asks: 'Can I add critical illness coverage to Pro Achiever?' What do you say?",
    options: [
      "'Critical illness riders are only available through a separate standalone policy.'",
      "'APA 3.0 offers Critical Protector Waiver of Premium (II) and Early Critical Protector Waiver of Premium (II) - these waive future premiums on CI/early-CI diagnosis. There is no standalone CI lump-sum rider on this plan; for that you would need a separate policy.'",
      "'You can only add riders within the first 30 days of the policy inception.'",
      "'Critical illness is already included in the basic Pro Achiever plan automatically.'"
    ],
    correct: 1,
    explanation: "Per Brochure p.6, the CI-related riders are Critical Protector Waiver of Premium (II) and Early Critical Protector Waiver of Premium (II) - they waive premiums on diagnosis but do not pay a CI lump sum. The compliance distinction matters for client expectations.",
    category: 'roleplay'
  },

  // ============================================================
  // SECTION D ADDITIONS (10 questions) — Q101-Q110
  // High-value MCQs from audit Section D, closing the most important gaps.
  // ============================================================

  // Q101 — correct: 1
  {
    question: "The Special Bonus is calculated on what base?",
    options: [
      "Account value at end of year",
      "Annualised regular premium",
      "Total premiums paid to date",
      "Cumulative welcome bonus credited"
    ],
    correct: 1,
    explanation: "The Special Bonus is 5% of the annualised regular premium from the 10th annual premium onwards, and 8% from the 21st annual premium onwards (Product Summary p.2 Section 3.4). It is NOT calculated on account value - this is the most-missed product detail.",
    category: 'product-facts'
  },

  // Q102 — correct: 2
  {
    question: "The Welcome Bonus for a $12,000+ annual premium on IIP 20 totals what across years 1-3?",
    options: [
      "53%",
      "63%",
      "75%",
      "45%"
    ],
    correct: 2,
    explanation: "IIP 20 + >=$12,000 annualised premium = 20% / 25% / 30% across years 1 / 2 / 3 = 75% total (Product Summary p.2 Section 3.3 tier table).",
    category: 'product-facts'
  },

  // Q103 — correct: 2
  {
    question: "How many Premium Passes are available across the policy if the IIP is 20 years?",
    options: [
      "1 pass for 12 cumulative months",
      "2 passes for 24 cumulative months total",
      "3 passes for up to 36 cumulative months total",
      "Unlimited passes after year 5"
    ],
    correct: 2,
    explanation: "IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes; each up to 12 cumulative policy months (Product Summary p.4 Section 3.7; Brochure p.3).",
    category: 'product-facts'
  },

  // Q104 — correct: 1
  {
    question: "What is the death benefit formula in AIA Pro Achiever 3.0?",
    options: [
      "101% of total premiums paid OR policy value, whichever higher",
      "100% of total regular premiums paid + top-ups + premium-reduction top-ups - withdrawals, OR policy value, whichever higher (less applicable fees and charges)",
      "Twice the policy value",
      "Only the current policy value"
    ],
    correct: 1,
    explanation: "Capital guarantee is 100% of net premiums in (NOT 101%) or policy value, whichever is higher, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8).",
    category: 'product-facts'
  },

  // Q105 — correct: 2
  {
    question: "In addition to the death benefit, what is paid if the Insured dies by accident within the first 2 policy years (within 90 days of the accident)?",
    options: [
      "Nothing additional",
      "An additional 50% of total regular premiums paid",
      "An additional 100% of total regular premium paid",
      "An additional 200% of the policy value"
    ],
    correct: 2,
    explanation: "The Accidental Death Benefit pays an additional 100% of total regular premiums paid if death by accident occurs within 90 days, with the accident occurring within the first 2 policy years (Product Summary p.2 Section 3.2; Brochure p.6).",
    category: 'product-facts'
  },

  // Q106 — correct: 1
  {
    question: "If a Secondary Insured was appointed before the Insured dies, what happens?",
    options: [
      "The death benefit is doubled",
      "No death benefit is paid; the Secondary Insured becomes the new Insured and the policy continues",
      "The policy terminates and beneficiary receives the policy value only",
      "The policy converts to a term plan"
    ],
    correct: 1,
    explanation: "Per Product Summary p.3 Section 3.6, the policy continues with the Secondary Insured as the new Insured; no death benefit is paid on the original Insured's death.",
    category: 'product-facts'
  },

  // Q107 — correct: 1
  {
    question: "The Term Rider available with APA 3.0 covers which combination of events?",
    options: [
      "Death and total permanent disability only",
      "Death, terminal illness, terminal cancer, and total and permanent disability",
      "Critical illness lump sum only",
      "Hospitalisation cash benefits only"
    ],
    correct: 1,
    explanation: "Brochure p.6 lists all four covered events under the Term Rider: death, terminal illness, terminal cancer, and total and permanent disability.",
    category: 'product-facts'
  },

  // Q108 — correct: 2
  {
    question: "A client says 'the 3.9% supplementary charge is too high.' What is the strongest break-even reframe?",
    options: [
      "'It's actually only 1% - the rest is fund management fee'",
      "'The 3.9% is for distribution; AIA refunds it at maturity'",
      "'The 3.9% ends after the 11th annual premium is paid. At a $12k/year premium, cumulative bonuses overtake cumulative charges around year 34 - from then on, AIA effectively pays you.'",
      "'All ILPs charge the same; it's industry standard'"
    ],
    correct: 2,
    explanation: "The structural-inversion + break-even argument is the canonical defence: the 3.9% supplementary charge ceases on the 11th annual premium (Product Summary p.5 Section 5.2), and at $12k/year cumulative bonuses overtake cumulative charges around year 34 (curriculum Day 3 Part 1; Day 4 Part 1).",
    category: 'objection-handling'
  },

  // Q109 — correct: 1
  {
    question: "A prospect already buys S&P500 ETF and says 'why do I need APA?' What is the canonical Day 4 frame?",
    options: [
      "'S&P500 is too risky - sell it and buy APA'",
      "'Perfect / Imperfect / Partially Perfect - you're betting one asset class in one geography all the time, which is the Fully Imperfect portfolio. APA is rebalanced across asset classes and geographies - Partially Perfect. Plus US estate tax 40% above USD 1M and 30% dividend withholding.'",
      "'APA always outperforms S&P500'",
      "'S&P500 returns are guaranteed but APA's are not'"
    ],
    correct: 1,
    explanation: "The Perfect / Imperfect / Partially Perfect frame plus US-specific drag (40% estate tax above USD 1M, 30% dividend withholding) is the canonical conviction story (curriculum Day 4 Part 1).",
    category: 'objection-handling'
  },

  // Q110 — correct: 1
  {
    question: "According to MAS / RNF compliance, what must the FC verbally disclose during an APA appointment?",
    options: [
      "The exact commission earned by the FC",
      "That returns (4% and 8% projections) are not guaranteed and depend on actual fund performance",
      "The names of all fund managers",
      "The historical worst-year drawdown of each fund"
    ],
    correct: 1,
    explanation: "Both 4% and 8% projection scenarios must appear in the illustration AND the FC must verbally state the returns are not guaranteed - this is the standard MAS requirement for ILPs (curriculum Day 5 Part 1).",
    category: 'compliance'
  }
];
