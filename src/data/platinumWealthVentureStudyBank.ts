export interface StudyQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay' | 'suitability';
}

export const platinumWealthVentureStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (40 questions) — Q1–Q40
  // ============================================================

  // Q1 — correct: 2
  {
    question: "What type of insurance product is AIA Platinum Wealth Venture?",
    options: [
      "A whole life participating plan with annual bonuses",
      "A single premium endowment savings plan",
      "A limited premium Investment-Linked Policy (ILP)",
      "A universal life policy with flexible coverage"
    ],
    correct: 2,
    explanation: "AIA Platinum Wealth Venture is a limited premium ILP designed for wealth accumulation with a 5-year premium payment term.",
    category: 'product-facts'
  },

  // Q2 — correct: 0
  {
    question: "How many years of premium payments are required for Platinum Wealth Venture?",
    options: [
      "5 years of regular premium payments",
      "10 years of regular premium payments",
      "3 years of regular premium payments",
      "7 years of regular premium payments"
    ],
    correct: 0,
    explanation: "PWV has a limited premium payment term of exactly 5 years, after which no further premiums are required.",
    category: 'product-facts'
  },

  // Q3 — correct: 3
  {
    question: "What is the minimum annual premium for Platinum Wealth Venture?",
    options: [
      "S$6,000 per year",
      "S$12,000 per year",
      "S$24,000 per year",
      "S$18,000 per year"
    ],
    correct: 3,
    explanation: "The minimum annual premium is S$18,000 (or S$1,500/month), reflecting its positioning as a high-net-worth product.",
    category: 'product-facts'
  },

  // Q4 — correct: 1
  {
    question: "What percentage of regular premiums is allocated to purchase units in PWV?",
    options: [
      "97% after a 3% premium charge",
      "100% with no premium charge on regular premiums",
      "95% after a 5% premium charge",
      "90% after administration fees"
    ],
    correct: 1,
    explanation: "100% of regular premiums are allocated to purchase units from Day 1. There is no premium charge on regular premiums — only top-ups incur a 3% charge.",
    category: 'product-facts'
  },

  // Q5 — correct: 2
  {
    question: "What is the total welcome bonus for a S$36,000/year PWV policy under Version 2.0?",
    options: [
      "30% of annualized premium over 3 years",
      "10% of annualized premium over 2 years",
      "15% of annualized premium over 3 years (5% each year)",
      "20% of annualized premium over 4 years"
    ],
    correct: 2,
    explanation: "Under Version 2.0, premiums of S$36,000 and above receive 5% in Year 1, 5% in Year 2, and 5% in Year 3, totaling 15%.",
    category: 'product-facts'
  },

  // Q6 — correct: 0
  {
    question: "What is the welcome bonus structure for a S$24,000/year PWV policy (Version 2.0)?",
    options: [
      "5% in Year 1 and 5% in Year 2, totaling 10%",
      "10% in Year 1 only",
      "5% in Years 1, 2, and 3, totaling 15%",
      "3% per year for 5 years, totaling 15%"
    ],
    correct: 0,
    explanation: "Premiums in the S$18,000-S$35,999 range receive a 10% total welcome bonus: 5% in Year 1 and 5% in Year 2.",
    category: 'product-facts'
  },

  // Q7 — correct: 3
  {
    question: "When is the one-time Investment Bonus paid in PWV?",
    options: [
      "At the end of Year 5 after all premiums are paid",
      "At the start of Year 10",
      "At the end of the surrender charge period",
      "At the beginning of the 8th policy year"
    ],
    correct: 3,
    explanation: "The Investment Bonus of 7% of annualized premium is paid once at the beginning of the 8th policy year, provided all premiums have been paid.",
    category: 'product-facts'
  },

  // Q8 — correct: 1
  {
    question: "What is the Investment Bonus rate in PWV?",
    options: [
      "5% of annualized regular premium",
      "7% of annualized regular premium",
      "10% of annualized regular premium",
      "3% of annualized regular premium"
    ],
    correct: 1,
    explanation: "The one-time Investment Bonus is 7% of annualized regular premium, credited at the beginning of Year 8.",
    category: 'product-facts'
  },

  // Q9 — correct: 0
  {
    question: "What is the Performance Bonus rate in PWV and when does it start?",
    options: [
      "0.50% p.a. of Regular Premium Policy Value from Year 8 onwards",
      "1.00% p.a. of total policy value from Year 5 onwards",
      "0.25% p.a. of total premiums paid from Year 10 onwards",
      "2.00% p.a. of fund value from Year 8 onwards"
    ],
    correct: 0,
    explanation: "The Performance Bonus is 0.50% p.a. of Regular Premium Policy Value, paid every year from the beginning of Year 8 onwards.",
    category: 'product-facts'
  },

  // Q10 — correct: 2
  {
    question: "What is the supplementary charge rate in PWV?",
    options: [
      "3.9% p.a. for the first 10 years",
      "2.5% p.a. for the first 5 years",
      "3.6% p.a. for the first 7 years",
      "4.0% p.a. for the first 8 years"
    ],
    correct: 2,
    explanation: "The supplementary charge is 3.6% p.a. of Regular Premium Policy Value, deducted monthly for the first 7 policy years only.",
    category: 'product-facts'
  },

  // Q11 — correct: 3
  {
    question: "After which year do supplementary charges drop to zero in PWV?",
    options: [
      "After Year 5 when premium payments end",
      "After Year 10 of the policy",
      "After Year 8 when bonuses begin",
      "After Year 7 of the policy"
    ],
    correct: 3,
    explanation: "Supplementary charges of 3.6% p.a. apply only for the first 7 policy years, then drop to zero permanently.",
    category: 'product-facts'
  },

  // Q12 — correct: 1
  {
    question: "What is the surrender charge in Years 1 and 2 of a PWV policy?",
    options: [
      "80% of Regular Premium Policy Value",
      "100% of Regular Premium Policy Value",
      "50% of Regular Premium Policy Value",
      "70% of Regular Premium Policy Value"
    ],
    correct: 1,
    explanation: "Surrendering in Years 1 or 2 means a 100% surrender charge on Regular Premium Policy Value — effectively zero net redemption proceeds.",
    category: 'product-facts'
  },

  // Q13 — correct: 0
  {
    question: "From which year onwards are there no surrender charges in PWV?",
    options: [
      "From Year 8 onwards the surrender charge is 0%",
      "From Year 5 onwards when premiums stop",
      "From Year 10 onwards after the lock-in period",
      "From Year 6 onwards after the minimum holding period"
    ],
    correct: 0,
    explanation: "Surrender charges reduce each year and reach 0% from Year 8 onwards. The schedule: Y1-2: 100%, Y3: 80%, Y4: 70%, Y5: 60%, Y6: 50%, Y7: 45%, Y8+: 0%.",
    category: 'product-facts'
  },

  // Q14 — correct: 2
  {
    question: "What does the death benefit of PWV provide?",
    options: [
      "A guaranteed sum assured regardless of fund performance",
      "Only the current fund value at the time of death",
      "The higher of total premiums paid (less withdrawals) or the policy value",
      "101% of total premiums paid, similar to Pro Achiever"
    ],
    correct: 2,
    explanation: "The death benefit is the higher of: (a) total regular + top-up premiums minus withdrawals, or (b) the policy value — less applicable charges.",
    category: 'product-facts'
  },

  // Q15 — correct: 3
  {
    question: "What additional benefit does PWV provide for accidental death in the first 2 years?",
    options: [
      "200% of the policy value as a bonus payout",
      "Waiver of all remaining premium payments",
      "Refund of surrender charges previously deducted",
      "100% of total regular premiums paid as an additional payout"
    ],
    correct: 3,
    explanation: "If death occurs due to accident within 90 days, and within the first 2 policy years, an additional 100% of total regular premiums paid is payable.",
    category: 'product-facts'
  },

  // Q16 — correct: 1
  {
    question: "What is the Secondary Insured option in PWV?",
    options: [
      "Adding a co-policyholder who shares the investment returns",
      "Appointing a spouse or child so the policy continues if the original insured dies",
      "Insuring a second person under a separate sub-policy",
      "Designating an alternate premium payer if the policyholder is unable to pay"
    ],
    correct: 1,
    explanation: "The Secondary Insured option allows appointment of a spouse or child (under 16). If the original insured dies, the policy continues with the Secondary Insured becoming the new insured.",
    category: 'product-facts'
  },

  // Q17 — correct: 0
  {
    question: "What is the maximum age for appointing a Secondary Insured in PWV?",
    options: [
      "The Secondary Insured cannot exceed age 70 at appointment",
      "The Secondary Insured must be under age 55",
      "The Secondary Insured must be under age 65",
      "There is no age limit for the Secondary Insured"
    ],
    correct: 0,
    explanation: "The Secondary Insured cannot exceed age 70 at the point of appointment.",
    category: 'product-facts'
  },

  // Q18 — correct: 2
  {
    question: "Does PWV require medical underwriting?",
    options: [
      "Yes, a full medical examination is mandatory for all applicants",
      "Yes, but only for applicants above age 50",
      "No, it is a Guaranteed Issuance Offer (GIO) plan",
      "Only a basic health declaration form is required"
    ],
    correct: 2,
    explanation: "PWV is a GIO (Guaranteed Issuance Offer) plan, meaning no medical checks are needed during application.",
    category: 'product-facts'
  },

  // Q19 — correct: 3
  {
    question: "What is the premium charge on top-up premiums in PWV?",
    options: [
      "0% — top-ups are fully allocated like regular premiums",
      "1% of each top-up amount",
      "5% of each top-up amount",
      "3% of each top-up amount"
    ],
    correct: 3,
    explanation: "Top-up premiums incur a 3% premium charge (97% is invested). Regular premiums have 0% charge.",
    category: 'product-facts'
  },

  // Q20 — correct: 1
  {
    question: "What is the minimum top-up premium for PWV?",
    options: [
      "S$5,000 per top-up",
      "S$1,000 per top-up",
      "S$500 per top-up",
      "S$2,000 per top-up"
    ],
    correct: 1,
    explanation: "The minimum top-up premium is S$1,000, whether ad-hoc or regular. It is subject to a 3% premium charge.",
    category: 'product-facts'
  },

  // Q21 — correct: 0
  {
    question: "Can regular premiums be varied in PWV?",
    options: [
      "No, varying of regular premiums is not allowed",
      "Yes, premiums can be increased annually by up to 10%",
      "Yes, premiums can be reduced after Year 3",
      "Only if the policyholder changes their fund allocation"
    ],
    correct: 0,
    explanation: "Regular premium amounts cannot be varied in PWV. The premium is fixed at inception for all 5 years.",
    category: 'product-facts'
  },

  // Q22 — correct: 2
  {
    question: "What payment methods are accepted for PWV premiums?",
    options: [
      "Cash, CPF, and SRS contributions",
      "Cash and SRS only",
      "Cash only — no CPF or SRS",
      "Cash, CPF, SRS, and Medisave"
    ],
    correct: 2,
    explanation: "PWV premiums are payable using cash only. CPF and SRS contributions are not accepted.",
    category: 'product-facts'
  },

  // Q23 — correct: 3
  {
    question: "What is the free-look period for PWV?",
    options: [
      "7 days from policy delivery",
      "21 days from policy delivery",
      "30 days from policy delivery",
      "14 days from receipt of policy documents"
    ],
    correct: 3,
    explanation: "Policyholders have 14 days from receipt of policy documents to cancel and receive a refund of premiums paid (adjusted for market value changes).",
    category: 'product-facts'
  },

  // Q24 — correct: 1
  {
    question: "Are partial withdrawals allowed in PWV Years 1-2?",
    options: [
      "Yes, with a 100% withdrawal charge",
      "No, partial withdrawals are not allowed in Years 1-2",
      "Yes, but limited to 10% of fund value",
      "Only withdrawals from top-up units are allowed"
    ],
    correct: 1,
    explanation: "Partial withdrawals are not permitted during Years 1 and 2. From Year 3, withdrawals are allowed but subject to partial withdrawal charges until Year 8.",
    category: 'product-facts'
  },

  // Q25 — correct: 0
  {
    question: "What is the minimum remaining policy value after a partial withdrawal in PWV?",
    options: [
      "S$10,000 must remain after the withdrawal",
      "S$5,000 must remain after the withdrawal",
      "S$1,000 must remain after the withdrawal",
      "There is no minimum — the full amount can be withdrawn"
    ],
    correct: 0,
    explanation: "After any partial withdrawal, a minimum policy value of S$10,000 must be maintained. The minimum withdrawal amount is S$1,000.",
    category: 'product-facts'
  },

  // Q26 — correct: 3
  {
    question: "How is the supplementary charge deducted in PWV?",
    options: [
      "Annually as a lump sum at each policy anniversary",
      "Quarterly from the fund value",
      "Semi-annually from the premium payments",
      "Monthly as 3.6%/12 of Regular Premium Policy Value"
    ],
    correct: 3,
    explanation: "The 3.6% p.a. supplementary charge is deducted on a monthly basis (3.6%/12 per month) for the first 7 policy years.",
    category: 'product-facts'
  },

  // Q27 — correct: 2
  {
    question: "What happens when a Secondary Insured takes over the PWV policy?",
    options: [
      "All terms remain exactly the same including riders",
      "The policy is terminated and a new one is issued",
      "Any attached riders are terminated and benefit charges recalculate based on the new insured",
      "The welcome bonus is forfeited upon transfer"
    ],
    correct: 2,
    explanation: "When the Secondary Insured becomes the new insured, any attached riders are terminated and benefit charges recalculate based on the new insured's gender and age.",
    category: 'product-facts'
  },

  // Q28 — correct: 1
  {
    question: "What types of coverage does PWV NOT provide?",
    options: [
      "Death benefit coverage",
      "Total Permanent Disability (TPD), Terminal Illness (TI), and Critical Illness (CI)",
      "Accidental death benefit in the first 2 years",
      "Fund-based investment returns"
    ],
    correct: 1,
    explanation: "PWV does not cover TPD, TI, CI, or Early CI. It is primarily a wealth accumulation vehicle with death benefit but minimal insurance coverage.",
    category: 'product-facts'
  },

  // Q29 — correct: 0
  {
    question: "What exclusive fund options does PWV offer?",
    options: [
      "AIA Elite Conservative, AIA Elite Balanced, and AIA Elite Adventurous",
      "Standard AIA fund range only with no exclusive options",
      "Only fixed income and money market funds",
      "External third-party fund house options exclusively"
    ],
    correct: 0,
    explanation: "PWV offers access to exclusive AIA Elite Funds (Conservative, Balanced, Adventurous) in addition to the broader AIA fund range.",
    category: 'product-facts'
  },

  // Q30 — correct: 3
  {
    question: "Which PWV fund pays quarterly dividends for income-seeking clients?",
    options: [
      "AIA Elite Balanced Fund",
      "AIA S$ Money Market Fund",
      "AIA Elite Conservative Fund",
      "AIA Global Adventurous Income Fund"
    ],
    correct: 3,
    explanation: "The AIA Global Adventurous Income Fund pays quarterly dividend distributions at approximately 7-8% p.a., suitable for income-seeking clients.",
    category: 'product-facts'
  },

  // Q31 — correct: 1
  {
    question: "What is the cut-off time for fund pricing in PWV?",
    options: [
      "12:00 p.m. Singapore time on each valuation day",
      "2:00 p.m. Singapore time on each valuation day",
      "5:00 p.m. Singapore time on each valuation day",
      "9:00 a.m. Singapore time on each valuation day"
    ],
    correct: 1,
    explanation: "Funds are priced on a forward pricing, bid-bid basis with a cut-off time of 2:00 p.m. Singapore time.",
    category: 'product-facts'
  },

  // Q32 — correct: 0
  {
    question: "What is the minimum fund switching amount in PWV?",
    options: [
      "S$50, waived for AIA S$ Money Market Fund",
      "S$100 for all fund switches",
      "S$500 per switch transaction",
      "S$1,000 per switch transaction"
    ],
    correct: 0,
    explanation: "The minimum switching amount is S$50, which is waived for switches involving the AIA S$ Money Market Fund.",
    category: 'product-facts'
  },

  // Q33 — correct: 2
  {
    question: "How does the Automatic Fund Switching feature work in PWV?",
    options: [
      "AIA's fund managers automatically rebalance based on market conditions",
      "Premiums are automatically split across all available funds equally",
      "Regular monthly or quarterly switches from the Money Market Fund to other chosen funds",
      "Funds are automatically switched to conservative options as the policy matures"
    ],
    correct: 2,
    explanation: "Automatic Fund Switching moves money from the AIA S$ Money Market Fund to other chosen funds on a monthly or quarterly basis, requiring minimum S$1,000 initial balance.",
    category: 'product-facts'
  },

  // Q34 — correct: 3
  {
    question: "How can dividend distributions be received in PWV?",
    options: [
      "Only as additional fund units automatically reinvested",
      "Only as a cheque mailed to the policyholder",
      "Only by direct bank transfer monthly",
      "Either cash via PayNow (NRIC/FIN) or reinvested as additional units"
    ],
    correct: 3,
    explanation: "Dividends can be received in cash via PayNow (minimum S$50 for cash payout — below S$50 is auto-reinvested) or reinvested as additional fund units.",
    category: 'product-facts'
  },

  // Q35 — correct: 1
  {
    question: "What is the total minimum premium commitment for a PWV policy over 5 years?",
    options: [
      "S$60,000 total over 5 years",
      "S$90,000 total over 5 years at the minimum annual premium",
      "S$120,000 total over 5 years",
      "S$50,000 total over 5 years"
    ],
    correct: 1,
    explanation: "At the minimum annual premium of S$18,000 over 5 years, the total commitment is S$90,000.",
    category: 'product-facts'
  },

  // Q36 — correct: 0
  {
    question: "What happens if the PWV policy value reaches zero?",
    options: [
      "The policy automatically terminates",
      "AIA provides a grace period of 90 days to top up",
      "The policy continues with suspended investment",
      "Premium payments restart automatically"
    ],
    correct: 0,
    explanation: "The policy terminates if the policy value reaches zero or negative on any valuation day.",
    category: 'product-facts'
  },

  // Q37 — correct: 2
  {
    question: "Within what period can a lapsed PWV policy be reinstated?",
    options: [
      "Within 1 year from the lapse date",
      "Within 3 years from the lapse date",
      "Within 5 years from the lapse date",
      "Lapsed policies cannot be reinstated"
    ],
    correct: 2,
    explanation: "A lapsed PWV policy may be reinstated within 5 years from the lapse date, but all outstanding past regular premiums must be back-paid.",
    category: 'product-facts'
  },

  // Q38 — correct: 3
  {
    question: "What is the Premium Holiday charge if premiums are missed after paying only 1 annual premium?",
    options: [
      "50% of annualized regular premium per year",
      "No charge — Premium Holiday is free from Year 1",
      "20% of annualized regular premium per year",
      "100% of annualized regular premium divided by 12 per month"
    ],
    correct: 3,
    explanation: "If only 1 annual premium has been paid and the policy goes on Premium Holiday, the charge is 100% annual rate (divided by 12 per month). It reduces to 30% after 2nd premium, 20% after 3rd-4th, and 0% after 5th.",
    category: 'product-facts'
  },

  // Q39 — correct: 1
  {
    question: "Are dividends and reinvested dividends subject to partial withdrawal charges?",
    options: [
      "Yes, all withdrawals are subject to the same charge schedule",
      "No, dividend and reinvested dividend withdrawals are exempt",
      "Only reinvested dividends are exempt; cash dividends are not",
      "Only after Year 5 are they exempt from charges"
    ],
    correct: 1,
    explanation: "Dividends and reinvested dividends withdrawals are exempt from partial withdrawal charges, providing extra liquidity flexibility.",
    category: 'product-facts'
  },

  // Q40 — correct: 2
  {
    question: "What happens to the death benefit if a Secondary Insured was appointed before the insured's death?",
    options: [
      "The death benefit is paid in full to the nominated beneficiary",
      "Half the death benefit is paid and half continues for the Secondary Insured",
      "The death benefit is NOT paid — the policy continues with the Secondary Insured",
      "The death benefit is held in escrow until the Secondary Insured reaches age 21"
    ],
    correct: 2,
    explanation: "If a Secondary Insured was appointed, the death benefit is not paid on the original insured's death. Instead, the policy continues with the Secondary Insured becoming the new insured.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (25 questions) — Q41–Q65
  // ============================================================

  // Q41 — correct: 0
  {
    question: "How should you position PWV's 5-year premium term to a busy executive?",
    options: [
      "As a short commitment that frees up cash flow after 5 years while wealth continues to grow",
      "As a way to pay less total premiums than any other insurance product",
      "As a trial period after which they can cancel for free",
      "As identical to a 5-year fixed deposit with guaranteed returns"
    ],
    correct: 0,
    explanation: "The 5-year limited premium is a key USP — position it as a short, defined commitment that lets the investment grow without ongoing premium obligations.",
    category: 'sales-angles'
  },

  // Q42 — correct: 3
  {
    question: "What is the strongest angle for presenting PWV's 100% allocation rate?",
    options: [
      "Compare it to savings accounts where interest is also applied to full balance",
      "Explain that 100% allocation is standard for all ILPs in Singapore",
      "Tell clients that other products charge hidden fees that PWV avoids entirely",
      "Emphasize that every dollar of their regular premium goes to work immediately — no premium charge"
    ],
    correct: 3,
    explanation: "100% allocation from Day 1 means zero premium charge on regular premiums — every dollar goes straight into their chosen funds, unlike many ILPs that deduct upfront.",
    category: 'sales-angles'
  },

  // Q43 — correct: 1
  {
    question: "How should you present the Secondary Insured feature to a client focused on legacy planning?",
    options: [
      "As a way to avoid paying estate duty on the policy proceeds",
      "As intergenerational wealth transfer — the policy continues for their spouse or child without triggering a new policy",
      "As a cheaper alternative to setting up a family trust",
      "As mandatory for all policies with beneficiaries under 21"
    ],
    correct: 1,
    explanation: "The Secondary Insured feature enables seamless intergenerational wealth transfer — the policy continues without termination, maintaining the investment and bonus structure.",
    category: 'sales-angles'
  },

  // Q44 — correct: 2
  {
    question: "A HNW client asks why they should choose PWV over a private bank's unit trust. What angle works best?",
    options: [
      "PWV guarantees higher returns than any private bank fund offering",
      "PWV has lower management fees than all private bank options",
      "PWV provides death benefit protection, triple bonus structure, and GIO — none of which unit trusts offer",
      "PWV funds consistently outperform private bank fund selections"
    ],
    correct: 2,
    explanation: "Unit trusts are pure investment. PWV adds death benefit (higher of premiums or fund value), three layers of bonuses, and requires no medical underwriting.",
    category: 'sales-angles'
  },

  // Q45 — correct: 0
  {
    question: "How should you position the triple bonus structure (Welcome + Investment + Performance)?",
    options: [
      "As three layers of rewards that compound over time — upfront, at Year 8, and annually thereafter",
      "As guaranteed returns that make PWV a risk-free investment",
      "As replacements for the supplementary charges paid in the first 7 years",
      "As bonuses that are only meaningful for policies above S$50,000/year"
    ],
    correct: 0,
    explanation: "Present the three bonuses as distinct layers: Welcome Bonus upfront (Years 1-3), Investment Bonus one-time at Year 8, and Performance Bonus annually from Year 8.",
    category: 'sales-angles'
  },

  // Q46 — correct: 3
  {
    question: "A prospect is concerned about market volatility. Which PWV feature should you lead with?",
    options: [
      "The policy guarantees no loss of capital in any market condition",
      "The supplementary charges protect against fund value drops",
      "The AIA fund managers will always beat the market index",
      "The death benefit ensures beneficiaries get at least the total premiums paid"
    ],
    correct: 3,
    explanation: "The death benefit (higher of premiums paid or fund value) provides downside protection for beneficiaries, even if markets underperform.",
    category: 'sales-angles'
  },

  // Q47 — correct: 1
  {
    question: "What is the best angle when presenting PWV to a client who already has Pro Achiever?",
    options: [
      "Recommend they surrender Pro Achiever and switch to PWV for better returns",
      "Position PWV as a complementary wealth accumulation vehicle with a shorter commitment and different bonus structure",
      "Explain that PWV will eventually replace Pro Achiever in AIA's product lineup",
      "Tell them PWV and Pro Achiever are the same product with different names"
    ],
    correct: 1,
    explanation: "PWV complements Pro Achiever — different premium term (5 vs 10-20 years), different bonus structure, and different target use case (wealth accumulation vs long-term planning).",
    category: 'sales-angles'
  },

  // Q48 — correct: 2
  {
    question: "How should you present the GIO (Guaranteed Issuance Offer) to clients with pre-existing conditions?",
    options: [
      "Explain that GIO means they get full critical illness coverage regardless of health",
      "Say GIO guarantees the best premium rates regardless of health status",
      "Highlight that no medical underwriting is required — they qualify automatically regardless of health",
      "GIO means the policy cannot be terminated for any reason"
    ],
    correct: 2,
    explanation: "GIO means no medical checks — clients with pre-existing conditions can still get the policy without health-based exclusions or loadings.",
    category: 'sales-angles'
  },

  // Q49 — correct: 0
  {
    question: "A client wants income from their investment. Which PWV feature should you highlight?",
    options: [
      "The AIA Global Adventurous Income Fund with quarterly dividend distributions at 7-8% p.a.",
      "The Performance Bonus which provides guaranteed annual income",
      "The ability to make partial withdrawals every month for income",
      "The supplementary charge refund that generates income from Year 8"
    ],
    correct: 0,
    explanation: "The AIA Global Adventurous Income Fund provides quarterly dividend distributions at approximately 7-8% p.a., ideal for income-seeking clients.",
    category: 'sales-angles'
  },

  // Q50 — correct: 3
  {
    question: "How do you position the 0% surrender charge from Year 8 to a commitment-averse client?",
    options: [
      "Tell them they can surrender penalty-free from Year 5 when premiums end",
      "Explain that surrender charges are waived for hardship cases at any time",
      "Say that AIA guarantees no loss upon surrender at any point",
      "Highlight that from Year 8 onwards they have full liquidity with zero exit costs"
    ],
    correct: 3,
    explanation: "From Year 8, there are zero surrender and withdrawal charges — full liquidity is available. This gives them a clear 'free exit' timeline.",
    category: 'sales-angles'
  },

  // Q51 — correct: 1
  {
    question: "A client compares PWV's 3.6% supplementary charge to Pro Achiever's 3.9%. How do you frame this?",
    options: [
      "Tell them the charges are not comparable since they apply to different policy values",
      "Highlight that PWV charges are lower (3.6% vs 3.9%) and end sooner (7 years vs 10 years)",
      "Explain that Pro Achiever's higher charge means better fund performance",
      "Suggest they ignore charges entirely and focus on returns"
    ],
    correct: 1,
    explanation: "PWV has a clear advantage: lower supplementary charge rate (3.6% vs 3.9%) that ends earlier (Year 7 vs Year 10).",
    category: 'sales-angles'
  },

  // Q52 — correct: 2
  {
    question: "How should you present PWV to a business owner looking to park excess business profits?",
    options: [
      "As a tax shelter that makes business income tax-deductible",
      "As a replacement for their company's corporate insurance plan",
      "As a structured wealth accumulation tool with a defined 5-year commitment and full liquidity from Year 8",
      "As a business expense that reduces their company's taxable income"
    ],
    correct: 2,
    explanation: "For business owners with excess cash, PWV offers structured, disciplined wealth building with a defined premium term and clear liquidity timeline from Year 8.",
    category: 'sales-angles'
  },

  // Q53 — correct: 0
  {
    question: "What is the best way to present the Automatic Fund Re-Balancing feature?",
    options: [
      "As a hands-off way to maintain their preferred asset allocation without manual intervention",
      "As a guarantee that their portfolio will always be optimally balanced",
      "As a mandatory feature required by MAS regulations",
      "As a tool that guarantees positive returns through rebalancing"
    ],
    correct: 0,
    explanation: "Automatic Re-Balancing maintains the client's preferred fund allocation without them having to manually switch funds — appealing to busy professionals.",
    category: 'sales-angles'
  },

  // Q54 — correct: 3
  {
    question: "How should you frame PWV's dividend option for a retiree seeking regular income?",
    options: [
      "As a guaranteed fixed income stream for life",
      "As replacing the need for CPF LIFE payouts",
      "As the only source of retirement income they need",
      "As flexible quarterly income via PayNow that complements their other retirement sources"
    ],
    correct: 3,
    explanation: "Position dividends as complementary quarterly income via PayNow (NRIC/FIN), not as a sole retirement plan — it supplements CPF, rental income, etc.",
    category: 'sales-angles'
  },

  // Q55 — correct: 1
  {
    question: "A couple wants to set up a child's education fund. How do you pitch PWV?",
    options: [
      "Recommend a 10-year Pro Achiever instead since PWV is not suitable for education planning",
      "Show how the 5-year premium period means they finish paying before the child starts school, with liquidity available from Year 8",
      "Explain that education funds should only use endowment plans, not ILPs",
      "Suggest they use CPF Education Scheme instead of PWV"
    ],
    correct: 1,
    explanation: "A newborn's parents finish paying in 5 years, the investment grows, and by Year 8 (child age 8) there's full liquidity — well before university at 18.",
    category: 'sales-angles'
  },

  // Q56 — correct: 2
  {
    question: "How do you present PWV's exclusive AIA Elite Funds to a sophisticated investor?",
    options: [
      "As the only funds available — there are no other options",
      "As guaranteed outperformers compared to retail fund options",
      "As curated institutional-grade funds across three risk profiles, exclusive to AIA's Platinum range",
      "As passive index funds with the lowest fees in the market"
    ],
    correct: 2,
    explanation: "Elite Funds are exclusive to the Platinum range, offering Conservative, Balanced, and Adventurous profiles with institutional-grade management.",
    category: 'sales-angles'
  },

  // Q57 — correct: 0
  {
    question: "A client says they prefer shorter commitments. What is PWV's strongest selling point?",
    options: [
      "PWV requires only 5 years of premiums — one of the shortest commitment periods for any ILP",
      "PWV can be surrendered at any time with no penalties",
      "PWV premiums can be paused after the first year",
      "PWV has a 3-year premium option for even shorter commitments"
    ],
    correct: 0,
    explanation: "PWV's 5-year limited premium term is one of the shortest in the ILP market, making it ideal for clients who dislike long-term premium commitments.",
    category: 'sales-angles'
  },

  // Q58 — correct: 3
  {
    question: "What is the most effective way to present PWV's bonuses to a numbers-oriented HNW client?",
    options: [
      "Focus only on the welcome bonus since it is paid first",
      "Avoid specific numbers and talk about the emotional security benefits",
      "Compare the bonus rates to fixed deposit interest rates only",
      "Show a timeline: Welcome Bonus Years 1-3, Investment Bonus Year 8, Performance Bonus Year 8 onwards"
    ],
    correct: 3,
    explanation: "Numbers-oriented clients respond best to a clear timeline showing when each bonus kicks in and how they compound over the policy duration.",
    category: 'sales-angles'
  },

  // Q59 — correct: 1
  {
    question: "How should you address a client who says PWV's minimum premium of S$18,000/year is too high?",
    options: [
      "Suggest they split the premium with a family member",
      "Reframe it as S$1,500/month and compare to what they spend on discretionary items",
      "Offer to waive the minimum premium requirement",
      "Recommend they wait until their income doubles"
    ],
    correct: 1,
    explanation: "S$18,000/year is S$1,500/month. Reframe the amount in monthly terms and compare to their lifestyle spending to show it's manageable for their income level.",
    category: 'sales-angles'
  },

  // Q60 — correct: 2
  {
    question: "A client is comparing PWV to a property investment. What angle should you use?",
    options: [
      "Tell them property investments always underperform ILPs",
      "Say PWV and property are interchangeable investment vehicles",
      "Highlight PWV's liquidity from Year 8, no maintenance costs, death benefit protection, and lower capital requirement than property",
      "Recommend they sell their property to fund PWV premiums"
    ],
    correct: 2,
    explanation: "PWV offers advantages property doesn't: liquidity from Year 8, no agent fees or maintenance, death benefit protection, and S$90,000 minimum vs hundreds of thousands for property.",
    category: 'sales-angles'
  },

  // Q61 — correct: 0
  {
    question: "How do you position PWV's Performance Bonus for long-term holders?",
    options: [
      "As a loyalty reward of 0.50% p.a. that compounds every year from Year 8 onwards",
      "As a guaranteed return that replaces fund performance",
      "As a one-time payout at policy maturity only",
      "As a rebate on the supplementary charges paid earlier"
    ],
    correct: 0,
    explanation: "The Performance Bonus is an ongoing 0.50% p.a. credit from Year 8, rewarding long-term holders and adding to the fund value each year.",
    category: 'sales-angles'
  },

  // Q62 — correct: 3
  {
    question: "A self-employed client with variable income asks about PWV. What feature should you emphasize?",
    options: [
      "The ability to vary premium amounts each year based on income",
      "The option to skip premiums with no penalty",
      "The low minimum premium of S$500/month",
      "The defined 5-year premium period — they can plan for a fixed commitment duration"
    ],
    correct: 3,
    explanation: "While PWV doesn't allow premium variation, the defined 5-year term lets self-employed clients plan and budget for a specific duration rather than an open-ended commitment.",
    category: 'sales-angles'
  },

  // Q63 — correct: 1
  {
    question: "How should you present the difference between PWV Version 1.0 and 2.0 to a new prospect?",
    options: [
      "Version 2.0 has higher bonuses and lower charges across the board",
      "Focus on Version 2.0's current terms without dwelling on version differences — present what's available now",
      "Explain that Version 1.0 was much better and they missed out",
      "Tell them Version 3.0 is coming soon and they should wait"
    ],
    correct: 1,
    explanation: "Present the current offering (Version 2.0) confidently. Dwelling on past versions creates confusion and potential regret rather than forward momentum.",
    category: 'sales-angles'
  },

  // Q64 — correct: 2
  {
    question: "What is the best way to present PWV to a client who already has multiple insurance policies?",
    options: [
      "Recommend they cancel existing policies to fund PWV",
      "Tell them PWV replaces the need for all their other policies",
      "Position PWV as a wealth accumulation vehicle, not insurance — it complements their existing protection portfolio",
      "Explain that having multiple policies is wasteful and they should consolidate into PWV"
    ],
    correct: 2,
    explanation: "PWV is primarily wealth accumulation with minimal insurance coverage (no CI/TPD/TI). Position it as complementary to their existing protection portfolio, not a replacement.",
    category: 'sales-angles'
  },

  // Q65 — correct: 0
  {
    question: "How should you present the S$90,000 total commitment to a prospect hesitant about the amount?",
    options: [
      "Break it down: S$1,500/month for 5 years — then nothing. Compare to other commitments that last 10-20 years",
      "Guarantee that they will get back more than S$90,000 within 8 years",
      "Offer a payment plan that extends beyond 5 years to reduce monthly amounts",
      "Suggest they borrow money to meet the minimum premium"
    ],
    correct: 0,
    explanation: "Reframe: S$1,500/month for just 5 years vs Pro Achiever at S$500/month for 20 years (S$120,000 total). PWV's total outlay is actually less with a shorter commitment.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (20 questions) — Q66–Q85
  // ============================================================

  // Q66 — correct: 2
  {
    question: "A prospect says: 'S$18,000/year is too much for insurance.' How do you respond?",
    options: [
      "Agree and suggest a cheaper product like Pro Achiever instead",
      "Tell them the minimum is negotiable if they sign up today",
      "Reframe PWV as a wealth accumulation tool, not insurance — it's an investment vehicle with protection benefits",
      "Say that all high-net-worth products require minimum S$18,000/year"
    ],
    correct: 2,
    explanation: "Reframe the conversation: PWV is primarily a wealth building tool with bonus structure and death benefit — not a traditional insurance expense.",
    category: 'objection-handling'
  },

  // Q67 — correct: 0
  {
    question: "A client objects: 'I can invest S$90,000 myself and get better returns.' What is the best counter?",
    options: [
      "Self-investing doesn't provide death benefit protection, triple bonus structure, or GIO — PWV bundles all of these",
      "PWV guarantees better returns than self-investing in all market conditions",
      "Self-investing is too risky for anyone without professional training",
      "Tell them investing on their own is illegal without a capital markets license"
    ],
    correct: 0,
    explanation: "Self-investing misses: death benefit (higher of premiums or fund value), triple bonuses, GIO access, exclusive Elite Funds, and Secondary Insured option.",
    category: 'objection-handling'
  },

  // Q68 — correct: 3
  {
    question: "A prospect says: 'The surrender charges are too punishing — 100% in Years 1-2!' How do you handle this?",
    options: [
      "Deny that surrender charges are that high",
      "Agree and suggest they consider a savings account instead",
      "Say surrender charges are the same across all insurance products",
      "Explain the charges enforce discipline, and from Year 8 there are zero charges — frame the 7-year timeline"
    ],
    correct: 3,
    explanation: "Be transparent about the charges, then reframe: they enforce long-term discipline, and the reward is zero charges from Year 8 onwards with full liquidity.",
    category: 'objection-handling'
  },

  // Q69 — correct: 1
  {
    question: "A client asks: 'Why doesn't PWV cover critical illness or disability?' Best response?",
    options: [
      "Promise that AIA will add these coverages in the next product version",
      "Explain PWV is designed for wealth accumulation, and CI/disability should be covered by separate dedicated policies",
      "Say critical illness coverage is unnecessary for high-net-worth individuals",
      "Suggest they buy a different product instead of PWV"
    ],
    correct: 1,
    explanation: "PWV is purpose-built for wealth accumulation. Critical illness and disability coverage should come from dedicated protection policies — recommend complementary solutions.",
    category: 'objection-handling'
  },

  // Q70 — correct: 2
  {
    question: "A prospect says: 'I don't trust ILPs — my friend lost money.' How do you address this for PWV?",
    options: [
      "Blame their friend for choosing wrong funds",
      "Guarantee that PWV cannot lose money due to the death benefit",
      "Validate the concern, then highlight PWV's death benefit floor, Automatic Re-Balancing, and Elite Fund access",
      "Dismiss ILP criticism as outdated and irrelevant"
    ],
    correct: 2,
    explanation: "Acknowledge the concern, then differentiate PWV: death benefit provides a floor (higher of premiums or fund value), plus exclusive funds and automatic rebalancing.",
    category: 'objection-handling'
  },

  // Q71 — correct: 0
  {
    question: "A client says: 'I'd rather wait for interest rates to be higher before investing.' What do you say?",
    options: [
      "Explain that PWV uses dollar cost averaging through regular premiums and that delaying means missing bonus credits",
      "Agree that waiting is always a better strategy for investments",
      "Guarantee that AIA fund returns will exceed current interest rates",
      "Tell them interest rates are irrelevant to ILP performance"
    ],
    correct: 0,
    explanation: "Each year of delay means one fewer year of welcome bonus growth and pushes back the Investment and Performance Bonus timelines.",
    category: 'objection-handling'
  },

  // Q72 — correct: 3
  {
    question: "A prospect objects: 'Why should I pay 3.6% supplementary charge when ETFs charge 0.1%?' How do you counter?",
    options: [
      "Say ETFs are too volatile for wealth accumulation",
      "Admit that ETFs are always better value and you have no counter",
      "Tell them the 3% charge is waived if they choose Elite Funds",
      "Explain the 3.6% stops after 7 years, plus PWV bundles death benefit, triple bonuses, GIO, and Secondary Insured that ETFs cannot provide"
    ],
    correct: 3,
    explanation: "The 3.6% supplementary charge covers only 7 years. Beyond fees, PWV provides death benefit, three bonus layers, GIO access, exclusive funds, and Secondary Insured — none available through ETFs.",
    category: 'objection-handling'
  },

  // Q73 — correct: 1
  {
    question: "A client says: 'Can't I just buy term insurance and invest S$90,000 in a robo-advisor?' Best response?",
    options: [
      "Tell them robo-advisors are unreliable and will lose their money",
      "Acknowledge the strategy, then show PWV's unique value: GIO, triple bonuses, Secondary Insured, and the discipline of structured investing",
      "Agree that BTIR with a robo-advisor is always the superior approach",
      "Say term insurance will be discontinued and they won't be able to buy it"
    ],
    correct: 1,
    explanation: "Respect the BTIR philosophy, then demonstrate what it misses: PWV's GIO (no medical), three bonus layers, Secondary Insured for legacy, and forced savings discipline.",
    category: 'objection-handling'
  },

  // Q74 — correct: 2
  {
    question: "A prospect says: 'I already have a private banker managing my wealth.' How do you position PWV?",
    options: [
      "Tell them private bankers charge higher fees and deliver worse results",
      "Suggest they fire their private banker and use PWV exclusively",
      "Position PWV as complementary — it adds death benefit protection and guaranteed issuance that private banks don't provide",
      "Say PWV funds are managed by the same people as private bank funds"
    ],
    correct: 2,
    explanation: "PWV complements private banking: it adds death benefit protection, bonus structure, GIO, and Secondary Insured — features private banks cannot replicate.",
    category: 'objection-handling'
  },

  // Q75 — correct: 0
  {
    question: "A client objects: 'The welcome bonus is lower in Version 2.0 than 1.0.' How do you handle this?",
    options: [
      "Focus on the current value proposition — the triple bonus structure still provides significant value over the policy lifetime",
      "Agree and promise that Version 3.0 will restore the higher bonuses",
      "Tell them the Version 1.0 bonuses were a promotional gimmick",
      "Offer to match the Version 1.0 bonus rates as a special exception"
    ],
    correct: 0,
    explanation: "Don't dwell on past versions. Focus forward: the current triple bonus structure (Welcome + Investment + Performance) compounds significantly over the policy lifetime.",
    category: 'objection-handling'
  },

  // Q76 — correct: 3
  {
    question: "A prospect asks: 'What if I need the money before Year 8?' How do you reassure them?",
    options: [
      "Tell them they will never need the money before Year 8",
      "Guarantee that AIA will waive surrender charges in emergencies",
      "Say the money can be accessed penalty-free at any time",
      "Explain that partial withdrawals are available from Year 3 (with charges), and dividend withdrawals are always charge-free"
    ],
    correct: 3,
    explanation: "Partial withdrawals start from Year 3 (with reducing charges). Dividend and reinvested dividend withdrawals are exempt from charges at any time.",
    category: 'objection-handling'
  },

  // Q77 — correct: 1
  {
    question: "A client says: 'I'm worried about locking S$90,000 into one product.' How do you respond?",
    options: [
      "Tell them S$90,000 is a small amount that should not worry them",
      "Reframe: it's S$1,500/month for 5 years — and from Year 8 they have full liquidity with zero charges",
      "Suggest they invest S$45,000 in PWV and S$45,000 in property",
      "Agree it's a lot of money and they should probably choose a cheaper plan"
    ],
    correct: 1,
    explanation: "Reframe the total as S$1,500/month for just 5 years, and emphasize the clear liquidity timeline: full access with zero exit costs from Year 8.",
    category: 'objection-handling'
  },

  // Q78 — correct: 2
  {
    question: "A prospect says: 'Dividends from the income fund aren't guaranteed.' How do you address this?",
    options: [
      "Guarantee that dividends will always be paid at 7-8% p.a.",
      "Deny that there is any risk to dividend payments",
      "Acknowledge they're not guaranteed, but explain the fund's income strategy and that dividends can be reinvested if not needed",
      "Suggest they avoid the income fund entirely and choose a growth fund"
    ],
    correct: 2,
    explanation: "Be transparent: dividends are not guaranteed. But the fund's strategy targets 7-8% p.a. income, and clients can choose to reinvest if they prefer growth over income.",
    category: 'objection-handling'
  },

  // Q79 — correct: 0
  {
    question: "A client objects: 'Insurance companies earn too much commission from products like this.' How do you respond?",
    options: [
      "Be transparent: PWV has 100% premium allocation on regular premiums — so their full contribution goes to investment, not commission",
      "Deny that any commission is earned on PWV",
      "Change the subject to the product benefits immediately",
      "Agree that commissions are high and offer to reduce yours"
    ],
    correct: 0,
    explanation: "Transparency builds trust: 100% of regular premiums are allocated to their investment from Day 1. The supplementary charge is separate and ends after 7 years.",
    category: 'objection-handling'
  },

  // Q80 — correct: 3
  {
    question: "A prospect says: 'I'll wait for the next version — maybe Version 3.0 will be better.' What do you say?",
    options: [
      "Confirm that Version 3.0 is coming soon with better features",
      "Tell them this is the final version and no updates are planned",
      "Offer a free upgrade to the next version if they sign up now",
      "Explain that every year they delay means missing welcome bonus credits, pushing back the Investment Bonus, and losing compound growth time"
    ],
    correct: 3,
    explanation: "Each year of delay costs: missed bonus credits, later Investment Bonus (Year 8 from inception), and one less year of compound growth and Performance Bonus.",
    category: 'objection-handling'
  },

  // Q81 — correct: 1
  {
    question: "A client asks: 'What if AIA's funds consistently underperform?' How do you reassure them?",
    options: [
      "Promise that AIA will compensate for any fund underperformance",
      "Highlight fund switching, Automatic Re-Balancing, multiple fund options including Elite Funds, and the death benefit floor",
      "Say fund underperformance is impossible with AIA's management team",
      "Recommend they move all funds to the Money Market Fund for safety"
    ],
    correct: 1,
    explanation: "Multiple safeguards: fund switching to reallocate, Automatic Re-Balancing, choice across Elite and other funds, and the death benefit providing a floor for beneficiaries.",
    category: 'objection-handling'
  },

  // Q82 — correct: 2
  {
    question: "A prospect objects: 'PWV doesn't offer comprehensive insurance protection like whole life plans.' How do you respond?",
    options: [
      "Agree and recommend they buy a whole life plan instead",
      "Tell them PWV's death benefit is equivalent to whole life coverage",
      "Position PWV's simplicity as a feature — it excels at wealth accumulation, and they should pair it with dedicated protection products",
      "Say comprehensive protection is unnecessary for high-net-worth individuals"
    ],
    correct: 2,
    explanation: "Turn the objection into a feature: PWV is focused and efficient at wealth building. Recommend pairing it with dedicated CI, TPD, and term life policies for complete coverage.",
    category: 'objection-handling'
  },

  // Q83 — correct: 0
  {
    question: "A client says: 'The Premium Holiday charges are harsh if I miss premiums.' How do you handle this?",
    options: [
      "Acknowledge the charges, then emphasize it's only 5 years of premiums — plan for the full commitment before starting",
      "Promise that AIA will waive Premium Holiday charges for first-time offenders",
      "Say Premium Holiday charges don't actually apply in practice",
      "Suggest they set up automatic payments and forget about it"
    ],
    correct: 0,
    explanation: "Be upfront about the charges, then reframe: 5 years is a short, defined commitment. Ensure the client is financially ready before signing up rather than risk Premium Holiday.",
    category: 'objection-handling'
  },

  // Q84 — correct: 3
  {
    question: "A prospect says: 'I can get higher yields in T-bills right now.' What is your best counter?",
    options: [
      "Guarantee that PWV returns will exceed T-bill yields in all periods",
      "Tell them T-bills are too risky for conservative investors",
      "Agree and suggest they buy T-bills instead of PWV",
      "Explain that T-bills are short-term and offer no death benefit, bonus structure, or long-term wealth accumulation features"
    ],
    correct: 3,
    explanation: "T-bills are short-term instruments that must be continually rolled over. PWV provides long-term wealth accumulation with death benefit, three bonus layers, and automatic compounding.",
    category: 'objection-handling'
  },

  // Q85 — correct: 1
  {
    question: "A client objects: 'Cash-only payment means I can't use CPF or SRS.' How do you address this?",
    options: [
      "Agree and recommend they choose a CPF-eligible product instead",
      "Explain that cash funding preserves their CPF/SRS for other uses, and PWV's bonuses compensate for the cash outlay",
      "Say AIA plans to add CPF/SRS eligibility in a future version",
      "Tell them CPF and SRS are inefficient anyway"
    ],
    correct: 1,
    explanation: "Reframe: using cash preserves their CPF/SRS balances for housing, healthcare, and retirement. PWV's triple bonus structure and exclusive funds provide value that justifies cash funding.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (15 questions) — Q86–Q100
  // ============================================================

  // Q86 — correct: 2
  {
    question: "During a roleplay, a HNW client asks: 'What happens to my PWV policy if I pass away in Year 3?' What do you say?",
    options: [
      "'Your beneficiary receives only the fund value, which may be less than premiums paid.'",
      "'The policy is void since you haven't finished the 5-year premium term.'",
      "'Your beneficiary receives the higher of total premiums paid (less withdrawals) or the fund value.'",
      "'AIA refunds exactly the premiums you paid with no adjustments.'"
    ],
    correct: 2,
    explanation: "The death benefit pays the higher of: total premiums paid minus withdrawals, or the current fund value — providing downside protection for beneficiaries.",
    category: 'roleplay'
  },

  // Q87 — correct: 0
  {
    question: "In a roleplay, a client asks: 'Can I appoint my 10-year-old child as the Secondary Insured?' What is correct?",
    options: [
      "'Yes, children under 16 can be appointed as Secondary Insured.'",
      "'No, the Secondary Insured must be at least 18 years old.'",
      "'Only a spouse can be appointed, not children.'",
      "'Children can only be appointed after the premium payment term ends.'"
    ],
    correct: 0,
    explanation: "A spouse or child below age 16 can be appointed as Secondary Insured. The Secondary Insured cannot exceed age 70 at the point of appointment.",
    category: 'roleplay'
  },

  // Q88 — correct: 3
  {
    question: "A roleplay client asks: 'When can I start withdrawing without any charges?' What is the correct answer?",
    options: [
      "'You can withdraw penalty-free from Year 5 when premiums end.'",
      "'Withdrawals are always free regardless of policy year.'",
      "'From Year 3, but with a small administrative fee.'",
      "'From Year 8 onwards, there are zero withdrawal charges. Dividend withdrawals are always charge-free.'"
    ],
    correct: 3,
    explanation: "Partial withdrawal charges drop to 0% from Year 8 onwards. Dividend and reinvested dividend withdrawals are exempt from charges at any time.",
    category: 'roleplay'
  },

  // Q89 — correct: 1
  {
    question: "In a roleplay, a prospect asks: 'Is my money guaranteed in PWV?' How do you respond honestly?",
    options: [
      "'Yes, all your premiums are 100% guaranteed by AIA at all times.'",
      "'The policy value is not guaranteed and can fluctuate with markets. However, the death benefit ensures beneficiaries receive at least total premiums paid.'",
      "'AIA guarantees a minimum return of 3% per year on all funds.'",
      "'Your money is guaranteed by the Singapore government deposit insurance scheme.'"
    ],
    correct: 1,
    explanation: "Be transparent: fund values are not guaranteed and can reach zero. But the death benefit provides a floor — beneficiaries get the higher of premiums paid or fund value.",
    category: 'roleplay'
  },

  // Q90 — correct: 2
  {
    question: "During roleplay, a client asks: 'Can I increase my premium from S$18,000 to S$36,000 after Year 1 to get a higher bonus?' Correct response?",
    options: [
      "'Yes, you can increase your premium at any policy anniversary.'",
      "'Yes, but you will need to pass medical underwriting first.'",
      "'No, regular premium amounts cannot be varied after inception.'",
      "'You can increase premiums only with a new top-up arrangement.'"
    ],
    correct: 2,
    explanation: "Regular premiums cannot be varied in PWV. The premium amount is fixed at inception for all 5 years. They would need a new policy for a higher premium tier.",
    category: 'roleplay'
  },

  // Q91 — correct: 0
  {
    question: "A roleplay client asks: 'How do I get the Investment Bonus?' What do you tell them?",
    options: [
      "'Pay all 5 years of premiums and the 7% bonus is automatically credited at the start of Year 8.'",
      "'You need to apply separately for the Investment Bonus after Year 7.'",
      "'The Investment Bonus is paid monthly from Year 5 onwards at 7% p.a.'",
      "'You receive it immediately upon policy inception as part of the welcome bonus.'"
    ],
    correct: 0,
    explanation: "The Investment Bonus of 7% of annualized premium is automatically credited at the beginning of Year 8, provided all regular premiums have been paid.",
    category: 'roleplay'
  },

  // Q92 — correct: 3
  {
    question: "In a roleplay, a client asks: 'What if I die accidentally in Year 1 — what does my family get?' Correct answer?",
    options: [
      "'Only the fund value at the time of death.'",
      "'Only the premiums paid so far, with no additional benefit.'",
      "'The standard death benefit only — accidental death doesn't add anything extra.'",
      "'The death benefit PLUS an additional 100% of total regular premiums paid as an accidental death benefit.'"
    ],
    correct: 3,
    explanation: "In Years 1-2, accidental death (within 90 days of accident) triggers both the regular death benefit AND an additional 100% of total regular premiums paid.",
    category: 'roleplay'
  },

  // Q93 — correct: 1
  {
    question: "A roleplay client asks: 'Can I use CPF to pay for PWV?' What is the correct answer?",
    options: [
      "'Yes, CPF OA can be used for all AIA investment products including PWV.'",
      "'No, PWV premiums are payable using cash only. CPF and SRS are not accepted.'",
      "'CPF can be used but only for the first year's premium.'",
      "'SRS is accepted but CPF is not for this particular product.'"
    ],
    correct: 1,
    explanation: "PWV premiums are payable using cash only. Neither CPF nor SRS contributions are accepted for this product.",
    category: 'roleplay'
  },

  // Q94 — correct: 2
  {
    question: "During a roleplay, the client asks: 'What funds should I choose if I want regular income?' Best response?",
    options: [
      "'Choose the AIA Elite Adventurous Fund for maximum returns and income.'",
      "'All PWV funds pay equal dividends, so it doesn't matter which you choose.'",
      "'The AIA Global Adventurous Income Fund pays quarterly dividends at approximately 7-8% p.a. and is designed for income seekers.'",
      "'Choose the AIA S$ Money Market Fund for the most reliable income stream.'"
    ],
    correct: 2,
    explanation: "The AIA Global Adventurous Income Fund is specifically designed for income, paying quarterly dividends at approximately 7-8% p.a. via PayNow or reinvestment.",
    category: 'roleplay'
  },

  // Q95 — correct: 0
  {
    question: "A roleplay client asks: 'What if I miss a premium payment in Year 3?' What do you tell them?",
    options: [
      "'A Premium Holiday charge of 30% annual rate applies, deducted monthly from your fund value.'",
      "'No charge applies since you've already paid for 2 years.'",
      "'The policy is immediately terminated with no refund.'",
      "'AIA waives all charges for missed payments after Year 2.'"
    ],
    correct: 0,
    explanation: "After paying 2 annual premiums, if the 3rd is missed, a Premium Holiday charge of 30% annual rate (divided by 12 per month) applies. The rate schedule is: after 1st premium = 100%, 2nd = 30%, 3rd = 20%, 4th = 20%, 5th+ = 0%.",
    category: 'roleplay'
  },

  // Q96 — correct: 3
  {
    question: "In a roleplay, a client asks: 'If I appoint my wife as Secondary Insured and I die, do my riders continue?' Correct response?",
    options: [
      "'Yes, all riders transfer to your wife automatically.'",
      "'Riders continue but at a higher premium based on your wife's age.'",
      "'Only the critical illness rider continues; others are terminated.'",
      "'No, any attached riders are terminated when the Secondary Insured becomes the new insured.'"
    ],
    correct: 3,
    explanation: "When the Secondary Insured takes over, all attached riders are terminated. Benefit charges recalculate based on the new insured's gender and age.",
    category: 'roleplay'
  },

  // Q97 — correct: 1
  {
    question: "A roleplay client asks: 'How does PWV compare to Pro Achiever on charges?' What is accurate?",
    options: [
      "'Both products have identical charge structures.'",
      "'PWV charges 3.6% for 7 years vs Pro Achiever's 3.9% for 10 years — PWV is lower and shorter.'",
      "'Pro Achiever has no charges while PWV charges 3% for 10 years.'",
      "'PWV charges 5% but for only 3 years, making it cheaper overall.'"
    ],
    correct: 1,
    explanation: "PWV has a clear charge advantage: 3.6% p.a. for 7 years versus Pro Achiever's 3.9% p.a. for 10 years — both lower rate and shorter duration.",
    category: 'roleplay'
  },

  // Q98 — correct: 2
  {
    question: "During roleplay, a client asks: 'Can I receive my dividends in cash?' What do you explain?",
    options: [
      "'Cash dividends are not available — all dividends must be reinvested.'",
      "'Cash dividends require a minimum of S$500 per distribution.'",
      "'Yes, dividends of S$50 or more can be paid via PayNow to your NRIC/FIN. Below S$50 is auto-reinvested.'",
      "'Cash dividends are paid by cheque mailed quarterly to your registered address.'"
    ],
    correct: 2,
    explanation: "Dividends of S$50 or above can be received as cash via PayNow (NRIC/FIN). Amounts below S$50 are automatically reinvested as additional units.",
    category: 'roleplay'
  },

  // Q99 — correct: 0
  {
    question: "A roleplay client asks: 'What is the maturity benefit of PWV?' How do you explain?",
    options: [
      "'At maturity, you receive the policy value less any applicable fees and charges. The policy then terminates.'",
      "'At maturity, you receive 101% of all premiums paid regardless of fund performance.'",
      "'There is no maturity benefit — PWV runs indefinitely until you surrender.'",
      "'At maturity, you receive double the welcome bonus as a final payout.'"
    ],
    correct: 0,
    explanation: "The maturity benefit is the policy value less applicable fees. The policy automatically terminates on the maturity date.",
    category: 'roleplay'
  },

  // Q100 — correct: 3
  {
    question: "In a roleplay, a prospect asks: 'Why should I choose PWV over keeping cash in a high-yield savings account?' Best response?",
    options: [
      "'PWV guarantees higher returns than any savings account in Singapore.'",
      "'Savings accounts will stop offering high yields soon, so lock in with PWV now.'",
      "'PWV is exactly the same as a savings account but with more features.'",
      "'PWV offers death benefit protection, triple bonuses, exclusive fund access, and Secondary Insured — savings accounts only offer interest.'"
    ],
    correct: 3,
    explanation: "Savings accounts offer liquidity and interest but nothing else. PWV bundles death benefit, three bonus layers, exclusive Elite Funds, and intergenerational transfer via Secondary Insured.",
    category: 'roleplay'
  },

  // ============================================================
  // FIELD-TESTED QUESTIONS (20 questions) — Q101–Q120
  // From real meeting transcripts and sales playbooks
  // ============================================================

  // Q101 — correct: 0
  {
    question: "What is the 'healthcare cost angle' for positioning PWV to pre-retirees?",
    options: [
      "Building a dividend-generating asset today to cover rising hospitalization premiums in retirement, preserving capital for inheritance",
      "Using PWV to replace their existing hospitalization plan with cheaper coverage",
      "Convincing clients that PWV is a medical insurance product that covers hospital bills",
      "Recommending they cancel their hospital plan and use PWV dividends for out-of-pocket expenses"
    ],
    correct: 0,
    explanation: "The healthcare cost angle positions PWV as a wealth-building tool whose dividends offset rising hospital plan premiums (often $300-400K lifetime), while preserving capital for legacy.",
    category: 'sales-angles'
  },

  // Q102 — correct: 2
  {
    question: "A pre-retiree client will pay approximately $412,000 in HealthShield Gold Max premiums by age 85. How do you use this to pitch PWV?",
    options: [
      "Tell them to cancel their hospitalization plan and self-insure using PWV",
      "Explain that PWV will pay their hospital bills directly as a rider",
      "Show that a PWV dividend portfolio at 6% yield can cover these premiums annually while preserving capital",
      "Guarantee that PWV dividends will always exceed their hospital plan premiums"
    ],
    correct: 2,
    explanation: "At 6% yield on a properly sized PWV portfolio, quarterly dividends can cover annual hospital premiums without depleting the capital — and the capital is preserved for inheritance.",
    category: 'sales-angles'
  },

  // Q103 — correct: 1
  {
    question: "When presenting PWV dividend projections, what conservative yield assumption should you use?",
    options: [
      "Always use 9-12% to show the maximum potential returns",
      "Use 6% as the conservative assumption, while noting actual historical returns average closer to 7-8%",
      "Use 3% to be as conservative as possible and underpromise",
      "Use the exact same rate as CPF OA (2.5%) for a fair comparison"
    ],
    correct: 1,
    explanation: "Using 6% conservative assumption builds trust. Clients see you're not overselling. Then show that actual funds have historically returned 7-8%, giving a comfortable buffer.",
    category: 'sales-angles'
  },

  // Q104 — correct: 3
  {
    question: "How should you present the concept of 'portfolio restructuring' when pitching PWV to a pre-retiree with old policies?",
    options: [
      "Tell them all their old policies are worthless and should be surrendered immediately",
      "Ignore their existing policies and focus only on selling the new PWV plan",
      "Criticize their previous advisor for selling them bad products",
      "Audit their existing policies, identify low-yielding ones (often 1-2% returns), and show how surrendering those can fund PWV for higher income"
    ],
    correct: 3,
    explanation: "Real field approach: audit every policy, show the actual yield (often shockingly low at 1-2%), then demonstrate how surrendering and redirecting into PWV's 6% dividend strategy creates significantly more retirement income.",
    category: 'sales-angles'
  },

  // Q105 — correct: 0
  {
    question: "A client has $460,000 in CPF OA earning 2.5%. How do you position PWV alongside their CPF strategy?",
    options: [
      "Show that CPF OA funds can be withdrawn to their bank account (after age 55) and the cash used to fund PWV premiums for potentially higher dividend returns",
      "Tell them to withdraw all CPF OA immediately and invest in PWV",
      "Explain that CPF OA returns are already optimal and no action is needed",
      "Say PWV accepts CPF OA direct contributions with no restrictions"
    ],
    correct: 0,
    explanation: "PWV is cash-only — CPF cannot be paid directly. But CPF OA funds can be withdrawn to a bank account (subject to CPF rules) and the cash used to fund PWV premiums. The staged approach lets money work harder at 6% vs CPF OA's 2.5%.",
    category: 'sales-angles'
  },

  // Q106 — correct: 2
  {
    question: "What is 'dividend stacking' in the context of PWV for pre-retirees?",
    options: [
      "Buying the maximum number of PWV units in a single lump sum payment",
      "Investing only in the highest-risk funds to maximize dividend yield",
      "Purchasing multiple PWV policies with staggered start dates to create multiple income streams",
      "Combining PWV dividends with stock market dividends in one account"
    ],
    correct: 2,
    explanation: "Clients can stack multiple PWV policies purchased at different times to create diversified, multi-stream income. Each policy generates its own quarterly dividends.",
    category: 'sales-angles'
  },

  // Q107 — correct: 1
  {
    question: "Why is the 'pain avoidance' framing more effective than 'gain seeking' when presenting PWV's healthcare angle?",
    options: [
      "Because pre-retirees don't care about making money — they only care about not losing it",
      "Because showing clients they'll lose $412,000 to insurance premiums without a plan creates stronger urgency than showing potential gains",
      "Because MAS regulations require advisors to focus on risks rather than benefits",
      "Because pain avoidance is the only ethically acceptable sales approach"
    ],
    correct: 1,
    explanation: "Psychological framing: showing the cost of inaction ($412K in premiums with nothing to show) motivates faster action than showing potential gains. This is a proven technique from real pre-retiree meetings.",
    category: 'sales-angles'
  },

  // Q108 — correct: 0
  {
    question: "A client holds nearly $1 million in fixed deposits earning 1.2-1.6%. What is the PWV opportunity?",
    options: [
      "Show the significant yield gap between FD rates (1.2-1.6%) and PWV dividend target (6%), and propose reallocating a portion",
      "Recommend they move their entire $1 million into PWV immediately",
      "Tell them fixed deposits are a terrible investment and they're wasting money",
      "Suggest they keep all money in FDs since they're guaranteed by SDIC"
    ],
    correct: 0,
    explanation: "Don't push all-in. Show the opportunity cost: $1M at 1.5% FD = $15K/year vs portion in PWV at 6% = significantly more. Propose reallocating a portion while keeping FD for liquidity.",
    category: 'objection-handling'
  },

  // Q109 — correct: 3
  {
    question: "A client says: 'I want to study the dividend plan before committing.' How should you respond?",
    options: [
      "Pressure them by saying the offer expires soon",
      "Tell them studying it is unnecessary since you're the expert",
      "Agree but then keep calling them daily until they sign up",
      "Send a detailed summary, offer to answer questions via chat, and set a specific follow-up date"
    ],
    correct: 3,
    explanation: "Patience builds trust with pre-retirees. Send materials, stay available via group chat, and set a concrete follow-up date. Don't push — they've been sold to for decades.",
    category: 'objection-handling'
  },

  // Q110 — correct: 1
  {
    question: "How should you handle the objection: 'My current DBS private bank fund is already managing my wealth'?",
    options: [
      "Tell the client that private banks always underperform insurance-linked funds",
      "Ask to review the fund's actual returns — often suboptimal (3-4%) — and show how PWV's dividend strategy targets 6% with death benefit",
      "Agree and suggest the client keep everything with DBS",
      "Say private banks will stop offering wealth management to individual clients soon"
    ],
    correct: 1,
    explanation: "From real meetings: many private bank managed funds return only 3-4%. Request a performance review, then demonstrate PWV's additional value: higher target yield plus death benefit.",
    category: 'objection-handling'
  },

  // Q111 — correct: 2
  {
    question: "When conducting a pre-retiree meeting, what should you check FIRST about their existing insurance policies?",
    options: [
      "Whether they are paying too much in premiums",
      "Which insurer offers the best commission for switching",
      "Whether beneficiary nominations are up to date on every policy",
      "Whether the policy design matches current market trends"
    ],
    correct: 2,
    explanation: "From field experience: many pre-retirees have NO beneficiary nominations on policies for 10+ years. Flagging this immediately builds trust and demonstrates thoroughness.",
    category: 'roleplay'
  },

  // Q112 — correct: 0
  {
    question: "In a real meeting, how do you present PWV's dividend flexibility to a retiree?",
    options: [
      "Explain they can choose quarterly: take dividends as cash via PayNow for living expenses, or reinvest to grow capital — adjustable anytime",
      "Tell them dividends must be reinvested for the first 10 years with no exceptions",
      "Say dividends are automatically paid out and cannot be reinvested",
      "Explain that dividend frequency is fixed at annual payouts only"
    ],
    correct: 0,
    explanation: "Flexibility is key for retirees. They can adjust quarterly: withdraw for income needs or reinvest when they don't need the cash. This adapts to changing retirement circumstances.",
    category: 'roleplay'
  },

  // Q113 — correct: 3
  {
    question: "How do you connect PWV to estate planning in a pre-retiree conversation?",
    options: [
      "Tell them PWV replaces the need for a will entirely",
      "Say estate planning is irrelevant to investment products like PWV",
      "Explain that PWV is primarily an estate planning tool, not an investment",
      "Position PWV as part of holistic planning: the Secondary Insured feature enables intergenerational transfer, while the death benefit provides for nominees"
    ],
    correct: 3,
    explanation: "Estate planning is a powerful door-opener for pre-retirees. PWV's Secondary Insured feature and death benefit naturally connect to their legacy planning goals — will, LPA, AMD.",
    category: 'sales-angles'
  },

  // Q114 — correct: 1
  {
    question: "A client's existing whole life policy shows a return of only 1.21% over 20 years. How do you use this in a PWV pitch?",
    options: [
      "Ignore their existing policy performance and focus only on PWV features",
      "Show the stark comparison: 1.21% from their old policy vs 6% target from PWV dividends — and ask if their money could work harder",
      "Guarantee that PWV will always return more than 1.21%",
      "Tell them their old policy was a scam and the advisor who sold it was dishonest"
    ],
    correct: 1,
    explanation: "Use real numbers from their own policies. Showing the actual low yield of their existing plans (often 1-2%) vs PWV's 6% target creates a compelling case without needing to criticize.",
    category: 'sales-angles'
  },

  // Q115 — correct: 2
  {
    question: "When pitching PWV to a couple, how should you adapt the DISC personality framework?",
    options: [
      "Identify only the husband's personality type since he makes the financial decisions",
      "Use the same presentation style for both regardless of their personalities",
      "Identify both partners' DISC profiles — adapt your approach to each, as one may be analytical (C) while the other is relationship-driven (I/S)",
      "Only focus on the partner who seems more receptive and ignore the other"
    ],
    correct: 2,
    explanation: "Couples often have different DISC profiles. A C-profile partner needs data and comparisons, while an I/S partner needs emotional connection and testimonials. Address both.",
    category: 'roleplay'
  },

  // Q116 — correct: 0
  {
    question: "What is the recommended approach for building a PWV portfolio over time for a pre-retiree?",
    options: [
      "Stage contributions over the 5-year premium term (e.g., $60-80K/year) to achieve dollar cost averaging while building toward target income",
      "Invest the entire amount as a single lump sum on day one for maximum immediate dividends",
      "Start with the minimum premium and never top up to minimize risk",
      "Wait for a market crash before investing any premium"
    ],
    correct: 0,
    explanation: "The staged approach (e.g., $80K/year for 5 years = $400K) implements dollar cost averaging. By Year 5, the portfolio targets approximately $24,000 annual dividends.",
    category: 'product-facts'
  },

  // Q117 — correct: 3
  {
    question: "How should you handle the SRS angle when discussing PWV with a pre-retiree?",
    options: [
      "Recommend they withdraw all SRS funds immediately to invest in PWV",
      "Tell them SRS is irrelevant to their retirement planning",
      "Suggest they ignore SRS and focus only on cash investments",
      "Explain that SRS funds can be strategically allocated — keep combined monthly income under $1,150 to avoid tax, and sequence withdrawals across policies"
    ],
    correct: 3,
    explanation: "SRS tax optimization is crucial for pre-retirees: keep combined SRS monthly income below $1,150 to stay tax-free. Sequence PWV dividend withdrawals and SRS withdrawals to avoid stacking into taxable thresholds.",
    category: 'sales-angles'
  },

  // Q118 — correct: 1
  {
    question: "A pre-retiree asks: 'What if I move overseas — will my PWV dividends still work?' What is the correct answer?",
    options: [
      "They must surrender the policy immediately if they leave Singapore",
      "PWV dividends can be paid to their Singapore bank account via PayNow regardless of where they live — recommend retaining a SGD account",
      "Dividends are automatically stopped if the policyholder's address changes to overseas",
      "They need to convert to a different product designed for overseas residents"
    ],
    correct: 1,
    explanation: "PWV dividends continue regardless of residency. Clients should retain a Singapore bank account for PayNow dividend receipts. The policy is not affected by relocation.",
    category: 'roleplay'
  },

  // Q119 — correct: 2
  {
    question: "What is the recommended meeting flow when presenting PWV to a pre-retiree for the first time?",
    options: [
      "Jump straight to the PWV product pitch within the first 5 minutes",
      "Focus the entire meeting on scaring them about rising healthcare costs",
      "Build context (10 min), audit their finances (15 min), educate with scenarios (20 min), then recommend PWV as part of the solution (10 min)",
      "Present PWV in the first meeting and push for immediate sign-up before they leave"
    ],
    correct: 2,
    explanation: "The proven 4-phase approach: personal rapport, financial landscape audit, scenario modelling with real numbers, then specific recommendations. Pre-retirees respond to education, not hard selling.",
    category: 'roleplay'
  },

  // Q120 — correct: 0
  {
    question: "Why should you frame PWV as 'building retirement income' rather than 'buying insurance' to pre-retirees?",
    options: [
      "Because pre-retirees want income streams, not more insurance products — framing PWV as income resonates with their actual retirement goal",
      "Because calling it insurance is illegal under MAS regulations",
      "Because PWV is not technically an insurance product",
      "Because the word 'insurance' makes the product sound more expensive"
    ],
    correct: 0,
    explanation: "Key principle from field experience: pre-retirees are tired of being sold insurance for decades. They want income. Frame everything as 'building your retirement income stream' — PWV is the vehicle, income is the goal.",
    category: 'sales-angles'
  }
];
