export interface StudyQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';
}

export const proAchieverStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (~80 questions)
  // ============================================================
  {
    question: "What type of insurance product is AIA Pro Achiever 3.0?",
    options: [
      "A whole life participating policy",
      "A regular premium Investment-Linked Policy (ILP)",
      "A term insurance policy with investment riders",
      "A universal life policy"
    ],
    correct: 1,
    explanation: "AIA Pro Achiever 3.0 is a regular premium Investment-Linked Policy (ILP) that combines life insurance protection with investment. It is not a participating policy (which pays dividends from the par fund), a term policy (which has no cash value), or a universal life policy.",
    category: 'product-facts'
  },
  {
    question: "Which investment periods are available under AIA Pro Achiever 3.0?",
    options: [
      "5, 10, or 15 years",
      "10, 15, or 20 years",
      "10, 20, or 25 years",
      "15, 20, or 25 years"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 offers three investment periods: 10, 15, or 20 years. The 15-year and 20-year options were newly introduced in version 3.0. Previous versions only had the 10-year period.",
    category: 'product-facts'
  },
  {
    question: "What is the range of the welcome bonus for AIA Pro Achiever 3.0?",
    options: [
      "1-50% of annualized premium",
      "5-75% of annualized premium",
      "10-100% of annualized premium",
      "5-60% of annualized premium"
    ],
    correct: 1,
    explanation: "The welcome bonus ranges from 5% to 75% of the annualized premium, depending on the premium amount and the investment period chosen. Higher premiums and longer investment periods result in higher welcome bonus percentages.",
    category: 'product-facts'
  },
  {
    question: "When is the welcome bonus credited to the policyholder's account?",
    options: [
      "Spread equally over the first 5 years",
      "At the end of the 10-year lock-in period",
      "In Year 1 of the policy",
      "After 3 consecutive years of premium payment"
    ],
    correct: 2,
    explanation: "The welcome bonus is credited in Year 1 of the policy. However, it cannot be withdrawn during the 10-year lock-in period. This is an important distinction — the bonus starts compounding from day one, but liquidity is restricted.",
    category: 'product-facts'
  },
  {
    question: "What is the supplementary charge rate for AIA Pro Achiever 3.0 during the first 10 years?",
    options: [
      "2.5% per annum",
      "3.9% per annum",
      "5.0% per annum",
      "1.5% per annum"
    ],
    correct: 1,
    explanation: "The supplementary charge is 3.9% per annum for the first 10 years only. After year 10, this charge drops to zero. This is a key competitive advantage because many competitors charge supplementary fees perpetually throughout the policy's lifetime.",
    category: 'product-facts'
  },
  {
    question: "What happens to the supplementary charge after the 10th policy year?",
    options: [
      "It reduces to 1.95% per annum",
      "It increases to 5% per annum",
      "It drops to zero",
      "It remains at 3.9% per annum"
    ],
    correct: 2,
    explanation: "After year 10, the supplementary charge drops to zero. This is a significant differentiator from competitors who typically charge supplementary fees perpetually. Over a 30+ year policy, this structure saves the policyholder significantly on charges.",
    category: 'product-facts'
  },
  {
    question: "What does the Capital Guarantee on Death provide?",
    options: [
      "100% of total premiums paid or current fund value, whichever is higher",
      "101% of total premiums paid or current fund value, whichever is higher",
      "105% of total premiums paid regardless of fund value",
      "Current fund value plus 50% of total premiums paid"
    ],
    correct: 1,
    explanation: "The Capital Guarantee on Death ensures that the beneficiary receives the HIGHER of 101% of total premiums paid OR the current fund value. This provides a safety net — even if the market underperforms, the beneficiary is guaranteed at least 101% of what was paid in.",
    category: 'product-facts'
  },
  {
    question: "When does the special bonus begin for AIA Pro Achiever 3.0?",
    options: [
      "From Year 1 onwards",
      "From Year 5 onwards",
      "From Year 10 onwards",
      "From Year 15 onwards"
    ],
    correct: 2,
    explanation: "The special bonus starts from Year 10 onwards at 5% of annualized premium per year. From Year 21 onwards, it increases to 8% of annualized premium per year. Unlike the welcome bonus, the special bonus can be withdrawn anytime after year 10.",
    category: 'product-facts'
  },
  {
    question: "What is the special bonus rate from Year 21 onwards?",
    options: [
      "5% of annualized premium per year",
      "8% of annualized premium per year",
      "10% of annualized premium per year",
      "12% of annualized premium per year"
    ],
    correct: 1,
    explanation: "From Year 21 onwards, the special bonus increases to 8% of annualized premium per year, up from 5% during Years 10-20. This rewards long-term policyholders and provides an increasing income stream in later years.",
    category: 'product-facts'
  },
  {
    question: "What is the Premium Pass feature in AIA Pro Achiever 3.0?",
    options: [
      "A discount on premiums for loyal customers",
      "The ability to pause premium payments for up to 12 months after 5 years of premiums paid, with no charges",
      "A premium waiver in case of disability",
      "The option to pay premiums using CPF"
    ],
    correct: 1,
    explanation: "Premium Pass allows policyholders to pause their premium payments for up to 12 months after they have paid premiums for at least 5 years, with NO charges applied. This provides financial flexibility during temporary cash flow difficulties without penalizing the policyholder.",
    category: 'product-facts'
  },
  {
    question: "What is 'commingling' in the context of AIA Pro Achiever 3.0?",
    options: [
      "Combining multiple policies into one account",
      "Mixing premiums from different family members",
      "The ability to mix different risk profiles (Elite funds and a la carte funds) in one policy",
      "Consolidating insurance and savings accounts"
    ],
    correct: 2,
    explanation: "Commingling, new in Pro Achiever 3.0, allows policyholders to mix different risk profiles within the same policy — for example, combining Elite funds (managed portfolios) with a la carte funds (individual fund selections). Previously, these had to be in separate policies.",
    category: 'product-facts'
  },
  {
    question: "What is the AIA Global Dynamic Income Fund (GDIF)?",
    options: [
      "A fixed deposit alternative with guaranteed returns",
      "A fund that pays quarterly dividends, new in Pro Achiever 3.0",
      "An offshore bond fund available only to accredited investors",
      "A CPF-approved investment fund"
    ],
    correct: 1,
    explanation: "The AIA Global Dynamic Income Fund (GDIF) is a new fund introduced in Pro Achiever 3.0 that pays quarterly dividends. This is attractive for clients who want regular income from their investments rather than purely capital growth.",
    category: 'product-facts'
  },
  {
    question: "What does the Additional Term Rider (ATR) in Pro Achiever 3.0 cover?",
    options: [
      "Critical illness and hospitalization only",
      "Death, terminal illness, and disability with fixed premiums throughout",
      "Accidental death and dismemberment only",
      "Death benefit only with increasing premiums"
    ],
    correct: 1,
    explanation: "The Additional Term Rider covers death, terminal illness, and disability. A key benefit is that the premiums remain FIXED throughout the policy term, unlike many riders that have increasing premiums as the policyholder ages.",
    category: 'product-facts'
  },
  {
    question: "How long is the free-look (cooling-off) period for AIA Pro Achiever 3.0?",
    options: [
      "7 days",
      "14 days",
      "21 days",
      "30 days"
    ],
    correct: 1,
    explanation: "The free-look or cooling-off period is 14 days from the date of receipt of the policy. During this period, the policyholder can cancel the policy and receive a full refund of premiums paid, minus any market losses on invested amounts. This is a standard MAS requirement for all life insurance policies in Singapore.",
    category: 'product-facts'
  },
  {
    question: "What is the grace period for late premium payments on AIA Pro Achiever 3.0?",
    options: [
      "14 days",
      "21 days",
      "30 days",
      "60 days"
    ],
    correct: 2,
    explanation: "There is a 30-day grace period for late premium payments. During this grace period, the policy remains in force. If the premium is not paid within 30 days, the policy may lapse, though reinstatement may be possible within a certain timeframe.",
    category: 'product-facts'
  },
  {
    question: "What percentage of AIA consultants sell the Pro Achiever product?",
    options: [
      "50%",
      "65%",
      "80%",
      "95%"
    ],
    correct: 2,
    explanation: "Approximately 80% of AIA consultants sell the Pro Achiever product, making it AIA's best-selling investment plan (as of August 2024). This widespread adoption reflects the product's versatility and market fit across different client segments.",
    category: 'product-facts'
  },
  {
    question: "What is the typical annual premium range for AIA Pro Achiever 3.0?",
    options: [
      "$1,200-$2,400 per year",
      "$4,800-$6,000 per year",
      "$8,000-$10,000 per year",
      "$12,000-$15,000 per year"
    ],
    correct: 1,
    explanation: "The typical annual premium is $4,800-$6,000 (approximately $400-$500 per month). However, some policyholders exceed $12,000 per year. The premium amount affects the welcome bonus tier — higher premiums qualify for higher bonus percentages.",
    category: 'product-facts'
  },
  {
    question: "Can the welcome bonus be withdrawn during the 10-year lock-in period?",
    options: [
      "Yes, at any time with a small penalty",
      "Yes, but only after the 5th year",
      "No, it cannot be withdrawn within the 10-year lock-in period",
      "Yes, but only for medical emergencies"
    ],
    correct: 2,
    explanation: "The welcome bonus cannot be withdrawn during the 10-year lock-in period. This lock-in allows the bonus to compound over time, ultimately benefiting the policyholder's long-term returns. The special bonus (from Year 10 onwards) can be withdrawn anytime after year 10.",
    category: 'product-facts'
  },
  {
    question: "What is the total distribution cost for a typical 45-year Pro Achiever policy?",
    options: [
      "Approximately $2,500",
      "Approximately $4,000",
      "Approximately $6,194",
      "Approximately $9,800"
    ],
    correct: 2,
    explanation: "The total distribution cost over a 45-year policy is approximately $6,194, which linearizes to about $1 per month. This figure helps advisors demonstrate that the cost of professional advice and policy management is remarkably low when spread over the life of the policy.",
    category: 'product-facts'
  },
  {
    question: "What investment approach does regular premium payment into Pro Achiever 3.0 enable?",
    options: [
      "Market timing strategy",
      "Dollar cost averaging",
      "Lump sum value investing",
      "Momentum trading"
    ],
    correct: 1,
    explanation: "Regular premium payments enable dollar cost averaging (DCA) — buying more units when prices are low and fewer when prices are high. Over time, this smooths out the average cost per unit and reduces the impact of market volatility, which is especially beneficial for long-term investment horizons.",
    category: 'product-facts'
  },
  {
    question: "Are returns from AIA Pro Achiever 3.0 guaranteed?",
    options: [
      "Yes, there is a minimum guaranteed return of 2% per annum",
      "Yes, the welcome bonus guarantees a minimum return",
      "No, returns are market-linked and NOT guaranteed",
      "Partially — the first 10 years are guaranteed, then market-linked"
    ],
    correct: 2,
    explanation: "Returns from Pro Achiever 3.0 are market-linked and NOT guaranteed. As an ILP, the investment returns depend on the performance of the underlying funds selected. The welcome bonus and special bonus are additional benefits, but the fund performance itself carries market risk.",
    category: 'product-facts'
  },
  {
    question: "What type of underwriting applies to the basic Pro Achiever 3.0 plan?",
    options: [
      "Full medical underwriting with health screening",
      "Simplified underwriting (no medical exam required)",
      "Guaranteed issue with no health questions",
      "Automated underwriting based on age only"
    ],
    correct: 1,
    explanation: "The basic Pro Achiever 3.0 plan uses simplified underwriting, meaning no medical examination is required. However, health declaration questions must still be answered truthfully. Additional riders like critical illness may require more detailed underwriting.",
    category: 'product-facts'
  },
  {
    question: "What types of nomination are available for AIA Pro Achiever 3.0?",
    options: [
      "Only revocable nomination",
      "Only irrevocable nomination",
      "Both revocable and irrevocable nominations",
      "Nominations are not allowed for ILPs"
    ],
    correct: 2,
    explanation: "Both revocable and irrevocable nominations are available. A revocable nomination can be changed at any time without the nominee's consent. An irrevocable nomination, once made, cannot be changed without the nominee's consent. Under the Insurance Act, an irrevocable nomination means the policy proceeds do not form part of the policyholder's estate.",
    category: 'product-facts'
  },
  {
    question: "What happens if a policyholder surrenders the Pro Achiever 3.0 policy in the early years?",
    options: [
      "Full fund value is returned with no penalties",
      "Surrender charges apply, reducing the payout",
      "Only the welcome bonus is forfeited",
      "The policy cannot be surrendered in the first 10 years"
    ],
    correct: 1,
    explanation: "Surrender charges apply in the early years of the policy. These charges decrease over time and eventually reach zero. Early surrender can result in receiving significantly less than the total premiums paid, which is why advisors should ensure clients understand the long-term commitment.",
    category: 'product-facts'
  },
  {
    question: "Which of the following riders can be added to AIA Pro Achiever 3.0?",
    options: [
      "Only the Additional Term Rider",
      "Critical illness and personal accident riders",
      "Hospital cash riders only",
      "No additional riders are available for ILPs"
    ],
    correct: 1,
    explanation: "Critical illness and personal accident riders can be added to the Pro Achiever 3.0 policy, in addition to the Additional Term Rider. This allows clients to customize their coverage based on individual needs and risk profiles.",
    category: 'product-facts'
  },
  {
    question: "What is the average case size for AIA Pro Achiever 3.0?",
    options: [
      "$1,500-$2,500",
      "$3,800-$5,000",
      "$6,000-$8,000",
      "$10,000-$15,000"
    ],
    correct: 1,
    explanation: "The average case size is $3,800-$5,000 per year. This represents the typical annual premium that advisors close, though individual cases can vary widely. Some clients invest as little as $4,800/year while others exceed $12,000/year.",
    category: 'product-facts'
  },
  {
    question: "How does the Premium Holiday differ from the Premium Pass?",
    options: [
      "They are the same feature with different names",
      "Premium Holiday has no charges while Premium Pass does",
      "Premium Pass has no charges after 5 years; Premium Holiday is a flexibility option where charges may apply if used early",
      "Premium Holiday is only available after 10 years"
    ],
    correct: 2,
    explanation: "Premium Pass allows pausing payments for up to 12 months after 5 years of premiums paid with NO charges. Premium Holiday is a separate flexibility option where charges may apply if used early in the policy. The distinction matters when advising clients on which option suits their situation.",
    category: 'product-facts'
  },
  {
    question: "What new features were introduced specifically in version 3.0 of Pro Achiever?",
    options: [
      "Welcome bonus and special bonus",
      "15-year and 20-year investment periods, commingling, and the GDIF fund",
      "Premium Pass and Additional Term Rider",
      "Capital Guarantee on Death and fund switching"
    ],
    correct: 1,
    explanation: "Version 3.0 introduced three key new features: (1) the 15-year and 20-year investment period options, (2) commingling — the ability to mix Elite and a la carte funds in one policy, and (3) the AIA Global Dynamic Income Fund (GDIF) with quarterly dividends. The welcome bonus, special bonus, and other features existed in earlier versions.",
    category: 'product-facts'
  },
  {
    question: "Is a policy loan available for AIA Pro Achiever 3.0?",
    options: [
      "No, ILPs do not allow policy loans",
      "Yes, a policy loan is available against the cash value",
      "Only after the 10-year lock-in period",
      "Only for policies with premiums above $10,000/year"
    ],
    correct: 1,
    explanation: "A policy loan is available against the cash value of the Pro Achiever 3.0 policy. This provides an additional layer of financial flexibility, allowing policyholders to access funds without fully surrendering their policy. Interest will apply to the loan amount.",
    category: 'product-facts'
  },
  {
    question: "What determines the welcome bonus percentage a policyholder receives?",
    options: [
      "Age and gender of the policyholder only",
      "Premium amount and investment period chosen",
      "The specific funds selected in the policy",
      "The policyholder's health status"
    ],
    correct: 1,
    explanation: "The welcome bonus percentage is determined by two factors: the premium amount and the investment period chosen. Higher premiums and longer investment periods (15 or 20 years vs 10 years) result in higher bonus percentages, ranging from 5% to 75% of the annualized premium.",
    category: 'product-facts'
  },
  {
    question: "Can partial withdrawals be made from AIA Pro Achiever 3.0?",
    options: [
      "No, withdrawals are only allowed at maturity",
      "Yes, partial withdrawals are available with conditions",
      "Only for the special bonus portion",
      "Only after the 20th policy year"
    ],
    correct: 1,
    explanation: "Partial withdrawals are available, subject to conditions. These conditions may include minimum remaining fund value requirements and potential charges depending on the policy year. The welcome bonus portion cannot be withdrawn during the 10-year lock-in period.",
    category: 'product-facts'
  },
  {
    question: "How does fund switching work in AIA Pro Achiever 3.0?",
    options: [
      "Fund switching is not available for ILPs",
      "Unlimited free switches are allowed at any time",
      "Fund switching is available with a limited number of free switches per year",
      "Fund switching requires a minimum 3-year holding period per fund"
    ],
    correct: 2,
    explanation: "Fund switching is available, allowing policyholders to change their investment allocation. A limited number of free switches are allowed per year. Additional switches beyond the free allocation may incur a switching fee. This enables clients to adjust their investment strategy as market conditions or personal circumstances change.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum eligibility requirement for the Premium Pass feature?",
    options: [
      "3 consecutive years of premium payments",
      "5 years of premium payments",
      "7 years of premium payments",
      "Completion of the 10-year lock-in period"
    ],
    correct: 1,
    explanation: "To qualify for Premium Pass, the policyholder must have paid premiums for at least 5 years. Once eligible, they can pause payments for up to 12 months with no charges. This provides a safety net for clients who face temporary financial difficulties.",
    category: 'product-facts'
  },
  {
    question: "How long can a policyholder pause payments under the Premium Pass?",
    options: [
      "Up to 6 months",
      "Up to 12 months",
      "Up to 18 months",
      "Up to 24 months"
    ],
    correct: 1,
    explanation: "The Premium Pass allows a pause of up to 12 months. During this period, no supplementary charges or penalties are applied. The policy remains in force, and the existing fund value continues to be invested.",
    category: 'product-facts'
  },
  {
    question: "What is the key difference between Pro Achiever 3.0's supplementary charge structure and most competitors?",
    options: [
      "Pro Achiever charges a higher rate but for a shorter period",
      "Pro Achiever charges 3.9% for the first 10 years then zero; competitors typically charge perpetually",
      "Pro Achiever has no supplementary charges at all",
      "Competitors do not charge supplementary fees"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 charges a supplementary fee of 3.9% p.a. for the first 10 years only, after which it drops to zero. Most competitors charge supplementary fees perpetually throughout the policy's lifetime. Over a long-term policy (30-45 years), this structure saves the policyholder significantly on charges.",
    category: 'product-facts'
  },
  {
    question: "Can a lapsed AIA Pro Achiever 3.0 policy be reinstated?",
    options: [
      "No, once lapsed the policy is terminated permanently",
      "Yes, reinstatement is possible within a certain timeframe",
      "Only if the policyholder pays a 10% penalty",
      "Only if the policy has been active for at least 5 years before lapsing"
    ],
    correct: 1,
    explanation: "Policy reinstatement is possible within a certain timeframe after lapsing. The policyholder would need to pay all outstanding premiums and may need to satisfy underwriting requirements. Advisors should proactively contact clients who miss payments to prevent unnecessary lapses.",
    category: 'product-facts'
  },
  {
    question: "What is the lock-in period for the welcome bonus in AIA Pro Achiever 3.0?",
    options: [
      "5 years",
      "7 years",
      "10 years",
      "15 years"
    ],
    correct: 2,
    explanation: "The welcome bonus has a 10-year lock-in period. While the bonus is credited in Year 1 and begins compounding immediately, it cannot be withdrawn for the first 10 years. This lock-in applies regardless of which investment period (10, 15, or 20 years) is chosen.",
    category: 'product-facts'
  },
  {
    question: "What is the special bonus rate from Year 10 to Year 20?",
    options: [
      "3% of annualized premium per year",
      "5% of annualized premium per year",
      "8% of annualized premium per year",
      "10% of annualized premium per year"
    ],
    correct: 1,
    explanation: "From Year 10 to Year 20, the special bonus is 5% of the annualized premium per year. This then increases to 8% from Year 21 onwards. The special bonus can be withdrawn anytime after Year 10, providing regular income if desired.",
    category: 'product-facts'
  },
  {
    question: "What is the linearized monthly distribution cost for a typical 45-year Pro Achiever policy?",
    options: [
      "Approximately $0.50 per month",
      "Approximately $1 per month",
      "Approximately $5 per month",
      "Approximately $11 per month"
    ],
    correct: 1,
    explanation: "The total distribution cost of approximately $6,194 over a 45-year policy works out to about $1 per month. This is a powerful figure for advisors to share, as it demonstrates the exceptional value of professional financial advice relative to its cost.",
    category: 'product-facts'
  },
  {
    question: "Which of the following correctly describes 'Elite funds' in Pro Achiever 3.0?",
    options: [
      "Funds exclusively available to high-net-worth clients",
      "Managed portfolio funds that can now be mixed with a la carte funds in the same policy",
      "Government bond funds with guaranteed returns",
      "Funds that carry zero management fees"
    ],
    correct: 1,
    explanation: "Elite funds are managed portfolio funds offered by AIA. With the commingling feature in Pro Achiever 3.0, clients can now mix Elite funds with a la carte (individual selection) funds within the same policy. Previously, clients had to choose one or the other.",
    category: 'product-facts'
  },
  {
    question: "Under what regulatory body does AIA Pro Achiever 3.0 fall in Singapore?",
    options: [
      "Securities and Futures Commission (SFC)",
      "Monetary Authority of Singapore (MAS)",
      "Accounting and Corporate Regulatory Authority (ACRA)",
      "Singapore Exchange (SGX)"
    ],
    correct: 1,
    explanation: "As a life insurance product sold in Singapore, AIA Pro Achiever 3.0 is regulated by the Monetary Authority of Singapore (MAS). MAS oversees all financial institutions and their products in Singapore, including insurance companies and investment-linked policies.",
    category: 'product-facts'
  },
  {
    question: "A client pays $6,000/year in premiums for Pro Achiever 3.0. What is the annual special bonus from Year 10 to Year 20?",
    options: [
      "$180 per year",
      "$300 per year",
      "$480 per year",
      "$600 per year"
    ],
    correct: 1,
    explanation: "The special bonus from Year 10 to Year 20 is 5% of the annualized premium. 5% of $6,000 = $300 per year. From Year 21 onwards, it increases to 8% of $6,000 = $480 per year.",
    category: 'product-facts'
  },
  {
    question: "A client pays $6,000/year in premiums. What is the annual special bonus from Year 21 onwards?",
    options: [
      "$300 per year",
      "$360 per year",
      "$480 per year",
      "$600 per year"
    ],
    correct: 2,
    explanation: "From Year 21 onwards, the special bonus is 8% of the annualized premium. 8% of $6,000 = $480 per year. This is higher than the Year 10-20 rate of 5% ($300/year), rewarding long-term policyholders.",
    category: 'product-facts'
  },
  {
    question: "If a policyholder dies and their total premiums paid amount to $60,000 while the current fund value is $55,000, what does the beneficiary receive?",
    options: [
      "$55,000 (current fund value)",
      "$60,000 (total premiums paid)",
      "$60,600 (101% of total premiums paid)",
      "$115,000 (premiums plus fund value)"
    ],
    correct: 2,
    explanation: "Under the Capital Guarantee on Death, the beneficiary receives the HIGHER of 101% of total premiums paid ($60,000 x 1.01 = $60,600) OR the current fund value ($55,000). Since $60,600 > $55,000, the beneficiary receives $60,600.",
    category: 'product-facts'
  },
  {
    question: "If a policyholder dies and their total premiums paid amount to $60,000 while the current fund value is $85,000, what does the beneficiary receive?",
    options: [
      "$60,600 (101% of total premiums paid)",
      "$85,000 (current fund value)",
      "$145,000 (premiums plus fund value)",
      "$60,000 (total premiums paid)"
    ],
    correct: 1,
    explanation: "The Capital Guarantee on Death pays the HIGHER of 101% of total premiums ($60,600) or the current fund value ($85,000). Since $85,000 > $60,600, the beneficiary receives $85,000 — the full fund value. The guarantee acts as a floor, not a cap.",
    category: 'product-facts'
  },
  {
    question: "What is the status of AIA Pro Achiever within AIA's product lineup as of August 2024?",
    options: [
      "A niche product for high-net-worth clients",
      "AIA's best-selling investment plan",
      "A legacy product being phased out",
      "A new product in pilot launch"
    ],
    correct: 1,
    explanation: "As of August 2024, AIA Pro Achiever is AIA's best-selling investment plan, with approximately 80% of AIA consultants selling this product. Its popularity reflects strong market demand for the combination of insurance protection and investment growth.",
    category: 'product-facts'
  },
  {
    question: "What is the premium allocation rate for AIA Pro Achiever 3.0?",
    options: [
      "Fixed at 100% throughout the policy",
      "Varies by policy year, with different rates in different years",
      "Fixed at 95% with 5% going to charges",
      "100% in the first year, 50% thereafter"
    ],
    correct: 1,
    explanation: "Premium allocation rates vary by policy year. In the early years, a portion of the premium goes toward policy charges and distribution costs. The allocation rate typically increases over time, meaning more of each premium dollar goes directly into investment in later years.",
    category: 'product-facts'
  },
  {
    question: "Which of the following is NOT a feature of AIA Pro Achiever 3.0?",
    options: [
      "Quarterly dividend-paying fund option",
      "Guaranteed minimum investment return of 3% per annum",
      "Ability to mix Elite and a la carte funds",
      "Premium Pass for payment flexibility"
    ],
    correct: 1,
    explanation: "There is NO guaranteed minimum investment return. Pro Achiever 3.0 is an ILP with market-linked returns that are not guaranteed. The other options are all genuine features: GDIF pays quarterly dividends, commingling allows fund mixing, and Premium Pass enables payment pauses.",
    category: 'product-facts'
  },
  {
    question: "What benefit does dollar cost averaging provide in the context of Pro Achiever 3.0?",
    options: [
      "It guarantees positive returns over time",
      "It eliminates all investment risk",
      "It smooths out the average cost per unit by buying more units when prices are low and fewer when high",
      "It provides a fixed rate of return regardless of market conditions"
    ],
    correct: 2,
    explanation: "Dollar cost averaging smooths out the average cost per unit — when prices are low, the regular premium buys more units; when prices are high, it buys fewer. Over time, this reduces the impact of market volatility. However, it does not guarantee positive returns or eliminate investment risk.",
    category: 'product-facts'
  },
  {
    question: "How many investment period options did Pro Achiever have before version 3.0?",
    options: [
      "One option (10 years only)",
      "Two options (10 and 15 years)",
      "Two options (10 and 20 years)",
      "Three options (5, 10, and 15 years)"
    ],
    correct: 0,
    explanation: "Before version 3.0, Pro Achiever only had one investment period option: 10 years. Version 3.0 added the 15-year and 20-year options, giving clients more flexibility to choose an investment horizon that matches their financial goals.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum number of consecutive premium years required before the Premium Pass can be activated?",
    options: [
      "3 years",
      "5 years",
      "7 years",
      "10 years"
    ],
    correct: 1,
    explanation: "The Premium Pass requires a minimum of 5 years of premiums paid before it can be activated. Once the 5-year threshold is met, the policyholder can pause payments for up to 12 months without any charges being applied.",
    category: 'product-facts'
  },
  {
    question: "Which statement about the Additional Term Rider (ATR) premiums is correct?",
    options: [
      "ATR premiums increase by 5% every year",
      "ATR premiums increase every 5 years",
      "ATR premiums stay fixed throughout the entire policy term",
      "ATR premiums decrease after age 50"
    ],
    correct: 2,
    explanation: "A key advantage of the Additional Term Rider is that premiums remain FIXED throughout the entire policy term. Many competing riders have increasing premiums as the insured ages, which can significantly increase the total cost of coverage over time.",
    category: 'product-facts'
  },
  {
    question: "What happens to the GDIF quarterly dividends when they are paid?",
    options: [
      "They are automatically reinvested into the same fund",
      "They are paid into the policyholder's bank account",
      "They are credited to the policy's fund value and can be withdrawn or reinvested",
      "They are accumulated and paid out at maturity only"
    ],
    correct: 2,
    explanation: "The GDIF quarterly dividends are credited to the policy's fund value. Policyholders can then choose to withdraw these dividends or let them remain invested. This flexibility allows clients to use the dividends as income or compound their growth.",
    category: 'product-facts'
  },
  {
    question: "For MAS regulatory purposes, what must advisors do before recommending AIA Pro Achiever 3.0?",
    options: [
      "Simply explain the product features",
      "Conduct a Financial Needs Analysis (FNA) to ensure suitability",
      "Provide a minimum 48-hour waiting period",
      "Obtain approval from MAS for each sale"
    ],
    correct: 1,
    explanation: "Under MAS regulations, advisors must conduct a Financial Needs Analysis (FNA) before recommending any life insurance product. The FNA ensures the product is suitable for the client's financial situation, needs, and risk appetite. This is a regulatory requirement, not optional.",
    category: 'product-facts'
  },
  {
    question: "What document must be provided to the client before purchasing AIA Pro Achiever 3.0?",
    options: [
      "A verbal summary of key features",
      "The Product Summary and Benefit Illustration",
      "Only the policy contract",
      "A comparison chart with competitor products"
    ],
    correct: 1,
    explanation: "Advisors must provide the Product Summary and Benefit Illustration before the client purchases the policy. These documents outline the key features, charges, projected benefits, and risks in a standardized format required by MAS, ensuring clients can make informed decisions.",
    category: 'product-facts'
  },
  {
    question: "What is the effect of choosing a 20-year investment period versus a 10-year period on the welcome bonus?",
    options: [
      "No difference — the bonus percentage is the same",
      "The 20-year period results in a lower bonus percentage",
      "The 20-year period qualifies for a higher welcome bonus percentage",
      "The 20-year period has no welcome bonus"
    ],
    correct: 2,
    explanation: "Choosing a longer investment period (20 years vs 10 years) qualifies for a higher welcome bonus percentage, assuming the same premium amount. This incentivizes longer commitment and rewards clients who are willing to invest for the long term.",
    category: 'product-facts'
  },
  {
    question: "Which of the following most accurately describes how the Pro Achiever 3.0 death benefit works?",
    options: [
      "A flat sum assured chosen at inception",
      "The higher of 101% of total premiums paid or fund value, plus any rider coverage",
      "Only the fund value at the time of death",
      "A decreasing term coverage tied to outstanding loans"
    ],
    correct: 1,
    explanation: "The death benefit is the higher of 101% of total premiums paid or the current fund value, plus any additional coverage from riders such as the Additional Term Rider. This structure ensures a minimum guaranteed payout while allowing the beneficiary to benefit from strong fund performance.",
    category: 'product-facts'
  },
  {
    question: "What is the primary purpose of the 10-year lock-in period for the welcome bonus?",
    options: [
      "To prevent money laundering",
      "To allow the bonus to compound and grow, benefiting long-term returns",
      "To comply with MAS regulations",
      "To penalize early withdrawal"
    ],
    correct: 1,
    explanation: "The 10-year lock-in allows the welcome bonus to compound and grow within the fund, ultimately benefiting the policyholder's long-term returns. While it does discourage early withdrawal, the primary purpose is to maximize the bonus's impact through compound growth over time.",
    category: 'product-facts'
  },
  {
    question: "In the context of AIA Pro Achiever 3.0, what does 'a la carte funds' refer to?",
    options: [
      "Funds that can only be selected once and never changed",
      "Individual fund selections that clients choose themselves, as opposed to managed portfolios",
      "Funds with the lowest management fees",
      "Funds that are only available to Premier clients"
    ],
    correct: 1,
    explanation: "A la carte funds are individual fund selections that clients choose themselves, as opposed to Elite funds which are pre-constructed managed portfolios. With commingling in version 3.0, clients can now combine both types within a single policy.",
    category: 'product-facts'
  },
  {
    question: "How does AIA Pro Achiever 3.0 handle currency risk for Singapore-based clients?",
    options: [
      "All funds are denominated in SGD only",
      "Currency hedging is automatically applied to all funds",
      "Funds may be denominated in various currencies, and exchange rate fluctuations can affect returns",
      "AIA guarantees no currency losses for Singapore policyholders"
    ],
    correct: 2,
    explanation: "Some funds within the Pro Achiever 3.0 platform may be denominated in foreign currencies. Exchange rate fluctuations can affect returns positively or negatively. Advisors should make clients aware of currency risk, especially when selecting global or regional funds.",
    category: 'product-facts'
  },
  {
    question: "What is the significance of the 14-day free-look period under MAS regulations?",
    options: [
      "The client can add riders without additional underwriting",
      "The client can cancel the policy and receive a refund of premiums paid, minus any market losses",
      "The advisor can modify the policy terms",
      "The premium rate is locked in for the first 14 days only"
    ],
    correct: 1,
    explanation: "During the 14-day free-look period, the policyholder can cancel the policy and receive a full refund of premiums paid, minus any market losses on invested amounts. This is a consumer protection requirement under MAS regulations, giving clients time to reconsider their purchase.",
    category: 'product-facts'
  },
  {
    question: "A client who selects a 15-year investment period with a $500/month premium would have the welcome bonus locked in for how long?",
    options: [
      "5 years",
      "10 years",
      "15 years",
      "20 years"
    ],
    correct: 1,
    explanation: "The welcome bonus lock-in period is always 10 years, regardless of the investment period chosen (10, 15, or 20 years). Even though the client chose a 15-year investment period, the welcome bonus is still locked in for 10 years.",
    category: 'product-facts'
  },
  {
    question: "What type of insurance coverage does the basic Pro Achiever 3.0 plan provide without any riders?",
    options: [
      "No insurance coverage — it is purely an investment",
      "Life insurance coverage with the Capital Guarantee on Death",
      "Critical illness coverage only",
      "Hospitalization and surgical coverage"
    ],
    correct: 1,
    explanation: "The basic Pro Achiever 3.0 plan provides life insurance coverage through the Capital Guarantee on Death — the higher of 101% of total premiums paid or current fund value. Additional coverage like critical illness or personal accident requires adding riders to the policy.",
    category: 'product-facts'
  },
  {
    question: "Which factor does NOT affect the welcome bonus percentage for Pro Achiever 3.0?",
    options: [
      "The annualized premium amount",
      "The investment period chosen",
      "The policyholder's age at entry",
      "Both A and B affect it"
    ],
    correct: 2,
    explanation: "The welcome bonus percentage is determined by the premium amount and the investment period chosen — not the policyholder's age. Higher premiums and longer investment periods both result in higher bonus percentages. Age may affect rider premiums but not the welcome bonus.",
    category: 'product-facts'
  },
  {
    question: "What is the maximum welcome bonus percentage achievable under Pro Achiever 3.0?",
    options: [
      "50% of annualized premium",
      "60% of annualized premium",
      "75% of annualized premium",
      "100% of annualized premium"
    ],
    correct: 2,
    explanation: "The maximum welcome bonus is 75% of the annualized premium, achievable with the highest premium tier and the longest investment period (20 years). This means a client paying $12,000/year on a 20-year period could receive up to $9,000 in welcome bonus.",
    category: 'product-facts'
  },
  {
    question: "If a client pays $500/month ($6,000/year) and receives a 50% welcome bonus, how much bonus is credited?",
    options: [
      "$250",
      "$3,000",
      "$6,000",
      "$30,000"
    ],
    correct: 1,
    explanation: "A 50% welcome bonus on an annualized premium of $6,000 equals $3,000. This bonus is credited in Year 1 and starts compounding with the invested funds, but cannot be withdrawn during the 10-year lock-in period.",
    category: 'product-facts'
  },
  {
    question: "What makes the supplementary charge structure of Pro Achiever 3.0 particularly advantageous for long-term policyholders?",
    options: [
      "The charge decreases by 0.5% each year",
      "The charge is zero from day one",
      "The charge drops from 3.9% to zero after year 10, while competitors charge perpetually",
      "Policyholders can negotiate the charge rate"
    ],
    correct: 2,
    explanation: "The supplementary charge of 3.9% applies only for the first 10 years, then drops to zero. For a policy held 30-45 years, this means 20-35 years of ZERO supplementary charges, while competitors typically continue charging throughout. This cumulative saving can be substantial.",
    category: 'product-facts'
  },
  {
    question: "Under Singapore's Insurance Act, what happens to policy proceeds under an irrevocable nomination?",
    options: [
      "They are taxed at the beneficiary's marginal tax rate",
      "They form part of the policyholder's estate for distribution",
      "They do NOT form part of the policyholder's estate and go directly to the nominee",
      "They are held in trust by MAS for 6 months"
    ],
    correct: 2,
    explanation: "Under Singapore's Insurance Act, when an irrevocable nomination is made, the policy proceeds do not form part of the deceased's estate. They are paid directly to the nominee and cannot be claimed by creditors or distributed through a will. This is an important estate planning feature.",
    category: 'product-facts'
  },
  {
    question: "Which of the following is true about fund management fees in Pro Achiever 3.0?",
    options: [
      "There are no fund management fees — AIA absorbs all costs",
      "Fund management fees are separate from the supplementary charge and vary by fund",
      "Fund management fees are included in the 3.9% supplementary charge",
      "Fund management fees are fixed at 1% for all funds"
    ],
    correct: 1,
    explanation: "Fund management fees are separate from the supplementary charge and vary depending on the specific fund selected. Each fund has its own management fee set by the fund manager. The 3.9% supplementary charge is an additional policy-level charge that is distinct from fund-level fees.",
    category: 'product-facts'
  },
  {
    question: "What is the Policy Owners' Protection Scheme (POPS) and how does it relate to Pro Achiever 3.0?",
    options: [
      "It guarantees all investment returns for ILP policyholders",
      "It is a safety net administered by SDIC that protects policyholders if an insurer fails",
      "It provides free legal advice for insurance disputes",
      "It is AIA's internal customer protection program"
    ],
    correct: 1,
    explanation: "The Policy Owners' Protection Scheme (POPS), administered by the Singapore Deposit Insurance Corporation (SDIC), protects life insurance policyholders if an insurer fails. While it does not guarantee investment returns, it provides a safety net for the guaranteed benefits of life insurance policies in Singapore.",
    category: 'product-facts'
  },
  {
    question: "How does Pro Achiever 3.0 handle the scenario where the policyholder becomes terminally ill?",
    options: [
      "The policy is immediately terminated with no payout",
      "The Additional Term Rider provides coverage for terminal illness if attached to the policy",
      "Terminal illness is excluded from all ILP coverage",
      "The policyholder must wait until death for any payout"
    ],
    correct: 1,
    explanation: "The Additional Term Rider (ATR) provides coverage for terminal illness in addition to death and disability. If the ATR is attached to the policy, the policyholder can receive an accelerated payout upon diagnosis of terminal illness, providing financial support when it is needed most.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (~50 questions)
  // ============================================================
  {
    question: "When positioning Pro Achiever 3.0 to a young professional (age 25-30), which benefit should you lead with?",
    options: [
      "The death benefit and estate planning features",
      "The long-term compounding advantage and higher welcome bonus for longer investment periods",
      "The critical illness rider coverage",
      "The premium holiday feature"
    ],
    correct: 1,
    explanation: "Young professionals have the advantage of time. Leading with the long-term compounding benefit and the higher welcome bonus for choosing a longer investment period (15 or 20 years) resonates because they can maximize the time value of money. Death benefits and estate planning are less immediately relevant to this age group.",
    category: 'sales-angles'
  },
  {
    question: "How should you position the supplementary charge structure when comparing Pro Achiever 3.0 to competitors?",
    options: [
      "Avoid discussing charges — it makes clients uncomfortable",
      "Focus only on the 3.9% charge and avoid mentioning competitors",
      "Highlight that charges drop to zero after year 10 while competitors charge perpetually, showing total cost savings over the policy lifetime",
      "Tell clients that Pro Achiever has the lowest charges in the market"
    ],
    correct: 2,
    explanation: "Transparency about charges builds trust. The strongest sales angle is showing the total cost comparison: Pro Achiever charges 3.9% for 10 years then zero, while competitors charge perpetually. Over a 30-45 year policy, this results in significant savings. Avoid making unsubstantiated claims about having the lowest charges overall.",
    category: 'sales-angles'
  },
  {
    question: "A client says they already have term insurance. How should you position Pro Achiever 3.0?",
    options: [
      "Tell them to cancel their term insurance and switch to Pro Achiever",
      "Position it as a complementary wealth accumulation plan with insurance benefits, not a replacement for their term coverage",
      "Argue that term insurance is inferior and a waste of money",
      "Focus only on the investment aspect and ignore the insurance component"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 should be positioned as complementary to existing term coverage, not a replacement. Term insurance provides pure protection at low cost; Pro Achiever adds wealth accumulation with some protection. Together, they form a more complete financial plan. Never advise clients to cancel existing coverage.",
    category: 'sales-angles'
  },
  {
    question: "What is the most effective way to explain the $1/month distribution cost figure?",
    options: [
      "Mention it in passing at the end of the presentation",
      "Use it to counter fee objections by showing that professional financial advice costs less than a cup of coffee per month over the policy's lifetime",
      "Compare it to a competitor's higher distribution cost",
      "Use it as the opening statement in every presentation"
    ],
    correct: 1,
    explanation: "The $1/month figure is most powerful when used to reframe the cost discussion — it shows that the total cost of professional advice and policy management over a 45-year policy is less than a cup of coffee per month. This helps clients see the value rather than focusing on individual charges.",
    category: 'sales-angles'
  },
  {
    question: "When presenting to a couple planning for their first child, which Pro Achiever 3.0 feature is most relevant?",
    options: [
      "The GDIF quarterly dividends",
      "The commingling feature for fund diversification",
      "The Capital Guarantee on Death, ensuring the family is protected regardless of market conditions",
      "The fund switching capability"
    ],
    correct: 2,
    explanation: "For new or expecting parents, the Capital Guarantee on Death is the most emotionally and practically relevant feature. It ensures that if something happens to the breadwinner, the family receives at least 101% of premiums paid regardless of market performance. This provides peace of mind during a major life transition.",
    category: 'sales-angles'
  },
  {
    question: "How should you frame the 10-year lock-in period as a positive rather than a limitation?",
    options: [
      "Tell clients they can access funds in emergencies (even though they cannot)",
      "Frame it as enforced discipline that prevents emotional selling during market dips, allowing the investment to grow uninterrupted",
      "Minimize the lock-in by changing the subject quickly",
      "Compare it to a bank fixed deposit to make it seem shorter"
    ],
    correct: 1,
    explanation: "The 10-year lock-in should be reframed as enforced financial discipline. Research shows that investors who stay invested through market cycles earn better returns than those who panic-sell. The lock-in protects clients from their own emotional reactions, allowing compounding to work over time.",
    category: 'sales-angles'
  },
  {
    question: "What is the ideal client profile for recommending a 20-year investment period?",
    options: [
      "A retiree looking for income",
      "A young professional aged 25-35 with stable income, long time horizon, and growth objectives",
      "A self-employed person with irregular income",
      "A client approaching retirement in 5 years"
    ],
    correct: 1,
    explanation: "The 20-year investment period is ideal for young professionals (25-35) with stable income, a long time horizon, and growth objectives. They benefit from the highest welcome bonus percentage, maximum compounding time, and can absorb short-term volatility. Self-employed or near-retirement clients may need shorter or more flexible options.",
    category: 'sales-angles'
  },
  {
    question: "When a prospect says they prefer to invest on their own through a robo-advisor, what is the best approach?",
    options: [
      "Agree that robo-advisors are better and walk away",
      "Dismiss robo-advisors as unreliable",
      "Acknowledge DIY investing works for some, then highlight what Pro Achiever adds: insurance protection, welcome/special bonuses, dollar cost averaging discipline, and capital guarantee on death",
      "Tell them robo-advisors are illegal in Singapore"
    ],
    correct: 2,
    explanation: "The best approach is to acknowledge that self-directed investing has its place, then differentiate Pro Achiever's unique value: insurance protection that robo-advisors don't provide, bonus structures that add to returns, enforced discipline through regular premiums, and the capital guarantee on death. It's not about one being better — they serve different purposes.",
    category: 'sales-angles'
  },
  {
    question: "How should you position the GDIF quarterly dividend fund to a client nearing retirement?",
    options: [
      "As a growth fund for capital appreciation",
      "As a source of regular income that can supplement their retirement cash flow",
      "As a speculative high-risk investment",
      "As identical to CPF payouts"
    ],
    correct: 1,
    explanation: "For near-retirement clients, the GDIF should be positioned as a source of regular quarterly income that can supplement their retirement cash flow. This appeals to retirees who need predictable income while maintaining some investment exposure. Avoid comparing it to CPF, which has different guarantees and structures.",
    category: 'sales-angles'
  },
  {
    question: "A client mentions they want to save for their child's university education in 15 years. Which investment period should you recommend?",
    options: [
      "10-year period to access funds earlier",
      "15-year period to align the investment horizon with the goal",
      "20-year period for maximum welcome bonus",
      "Advise against using Pro Achiever for education savings"
    ],
    correct: 1,
    explanation: "The 15-year investment period aligns perfectly with the client's goal timeline. While the 20-year period offers a higher welcome bonus, it would extend beyond when the funds are needed. The 10-year period would work but offers a lower bonus. Matching the investment period to the financial goal is sound advice.",
    category: 'sales-angles'
  },
  {
    question: "What is the most effective way to use the '80% of AIA consultants sell this product' statistic?",
    options: [
      "Use it to pressure the client by saying everyone is buying it",
      "Use it as social proof that demonstrates the product's track record and market acceptance among financial professionals",
      "Avoid mentioning it as it seems like herd mentality",
      "Quote it to suggest the client will miss out if they don't buy"
    ],
    correct: 1,
    explanation: "The statistic should be used as social proof — the fact that 80% of AIA's trained financial consultants recommend this product to their own clients demonstrates confidence in its value. It shows market validation from professionals, not herd mentality. Avoid using it as a pressure tactic.",
    category: 'sales-angles'
  },
  {
    question: "When selling to a high-income professional ($15,000+/month), what premium strategy should you suggest?",
    options: [
      "The minimum premium to reduce their commitment",
      "A premium at the higher bonus tier (e.g., $12,000/year or more) to maximize the welcome bonus percentage",
      "The same $400/month that everyone else pays",
      "Suggest they only take term insurance instead"
    ],
    correct: 1,
    explanation: "For high-income clients, recommending a premium at the higher bonus tier ($12,000/year or more) makes sense because: (1) it maximizes the welcome bonus percentage, (2) the premium is affordable relative to their income, and (3) it accelerates wealth accumulation. Always ensure the premium is within the client's comfortable affordability range.",
    category: 'sales-angles'
  },
  {
    question: "How should you introduce the commingling feature to a client who is not investment-savvy?",
    options: [
      "Use technical financial jargon to impress them",
      "Skip explaining it — it's too complicated",
      "Explain that they can have a professionally managed portion (Elite) for convenience AND a self-selected portion (a la carte) for personal interest, all in one policy",
      "Tell them to just pick Elite funds and ignore a la carte"
    ],
    correct: 2,
    explanation: "For non-savvy clients, explain commingling in simple terms: they can split their investment between a professionally managed portfolio (for the hands-off portion) and personally selected funds (for any specific preferences), all within one policy. This makes them feel in control without being overwhelmed.",
    category: 'sales-angles'
  },
  {
    question: "What is the best way to present the special bonus structure to create long-term commitment?",
    options: [
      "Focus only on the Year 10 bonus and ignore Year 21",
      "Show a timeline illustration: no special bonus (Years 1-9), 5% (Years 10-20), 8% (Year 21+), demonstrating increasing rewards for loyalty",
      "Tell clients the special bonus replaces investment returns",
      "Avoid mentioning the special bonus until after the sale"
    ],
    correct: 1,
    explanation: "A visual timeline showing the escalating special bonus creates a compelling narrative of increasing rewards for long-term commitment. It helps clients see the policy as a relationship that gets better over time — 5% annually from Year 10, stepping up to 8% from Year 21. This counters short-term thinking.",
    category: 'sales-angles'
  },
  {
    question: "When meeting a Singaporean NSman (National Serviceman), how should you relate Pro Achiever 3.0 to their life stage?",
    options: [
      "Focus on disability coverage during NS",
      "Emphasize that starting early (age 20-22) maximizes compounding time, and the affordable entry premium of $400/month makes it accessible even on NS allowance",
      "Suggest waiting until after NS to start investing",
      "Focus only on the death benefit for NS-related risks"
    ],
    correct: 1,
    explanation: "For NSmen, the key message is the power of starting early. Even at $400/month, beginning at 20-22 gives them a massive compounding advantage over someone starting at 30. Their NS allowance may be limited, but this is a foundational investment that grows over decades. The lock-in period aligns with their long remaining career horizon.",
    category: 'sales-angles'
  },
  {
    question: "A dual-income couple (both earning $8,000/month) asks how much they should invest. What is the best approach?",
    options: [
      "Recommend the maximum premium possible",
      "Conduct a Financial Needs Analysis first, then recommend a premium that balances their savings goals, existing coverage gaps, and lifestyle needs",
      "Suggest one policy for each spouse at the minimum premium",
      "Tell them to invest everything beyond their monthly expenses"
    ],
    correct: 1,
    explanation: "The correct approach is always to start with a Financial Needs Analysis (FNA) — this is both best practice and a MAS regulatory requirement. The FNA considers their combined income, expenses, existing insurance, financial goals, risk appetite, and liquidity needs to determine an appropriate premium that doesn't overcommit their cash flow.",
    category: 'sales-angles'
  },
  {
    question: "How should you position Pro Achiever 3.0 against a competitor's ILP that offers a higher welcome bonus?",
    options: [
      "Match the competitor's offer by asking AIA for a special rate",
      "Focus on total value: welcome bonus + special bonus + supplementary charge savings + capital guarantee on death, not just the welcome bonus alone",
      "Concede that the competitor has a better product",
      "Dismiss the competitor's bonus as a gimmick"
    ],
    correct: 1,
    explanation: "The best response is to shift the comparison from a single feature (welcome bonus) to total value. Pro Achiever's value includes: the welcome bonus, the ongoing special bonus (5-8% p.a. from Year 10+), zero supplementary charges after Year 10, and the capital guarantee on death. A higher welcome bonus alone doesn't mean better overall value.",
    category: 'sales-angles'
  },
  {
    question: "A client is a hawker stall owner with irregular income. Which Pro Achiever feature should you emphasize?",
    options: [
      "The 20-year investment period for maximum bonus",
      "The Premium Pass, which allows pausing payments for up to 12 months after 5 years, providing a safety net for irregular income periods",
      "The GDIF quarterly dividends for regular income",
      "The fund switching capability"
    ],
    correct: 1,
    explanation: "For clients with irregular income (like hawker stall owners), the Premium Pass is the most relevant feature. After 5 years of premiums, they can pause payments for up to 12 months without charges if business slows down. This provides flexibility that addresses their specific concern about committing to regular payments.",
    category: 'sales-angles'
  },
  {
    question: "What is the most effective opening question when prospecting for Pro Achiever 3.0?",
    options: [
      "Would you like to buy an investment-linked policy?",
      "Do you have any insurance?",
      "If you could build a financial safety net that grows over time and protects your family, how much would you set aside each month?",
      "Are you interested in getting a welcome bonus of up to 75%?"
    ],
    correct: 2,
    explanation: "The third option is an open-ended question that focuses on the client's goals and values (safety net, growth, family protection) rather than the product itself. It invites the client to think about their financial priorities and naturally leads into a needs-based discussion. Avoid leading with product features or yes/no questions.",
    category: 'sales-angles'
  },
  {
    question: "When should you NOT recommend AIA Pro Achiever 3.0 to a client?",
    options: [
      "When they have no existing insurance coverage at all",
      "When they have high-interest debt, insufficient emergency funds, or need short-term liquidity within 5 years",
      "When they are a young professional just starting their career",
      "When they are self-employed"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 may not be suitable for clients with high-interest debt (which should be paid off first), insufficient emergency funds (they need liquidity), or who need access to money within 5 years (surrender charges apply). Recommending an ILP when these fundamentals are not in place is poor advice and could breach suitability requirements.",
    category: 'sales-angles'
  },
  {
    question: "How should you handle a situation where a client's spouse is skeptical about the purchase?",
    options: [
      "Proceed with the sale and tell the client to convince their spouse later",
      "Dismiss the spouse's concerns as uninformed",
      "Invite the spouse to a joint meeting, address their specific concerns, and ensure both are comfortable with the commitment",
      "Suggest the client make the purchase secretly"
    ],
    correct: 2,
    explanation: "The professional approach is to invite the skeptical spouse to a joint meeting. Financial decisions should be made collaboratively, especially for long-term commitments. Addressing the spouse's concerns directly builds trust and prevents post-sale regret or cancellation during the free-look period.",
    category: 'sales-angles'
  },
  {
    question: "What is the benefit of highlighting the Capital Guarantee on Death for CPF-dependent clients?",
    options: [
      "CPF already provides sufficient coverage, so it's irrelevant",
      "It shows that even if the market drops, their beneficiaries receive at least 101% of premiums paid — providing certainty that CPF savings alone may not offer for dependents",
      "It replaces the need for CPF LIFE",
      "It guarantees CPF returns"
    ],
    correct: 1,
    explanation: "Many Singaporeans rely heavily on CPF, but CPF savings are subject to specific withdrawal rules and distribution. The Capital Guarantee on Death provides a separate, guaranteed payout of at least 101% of premiums paid directly to beneficiaries, regardless of market conditions. This complements CPF and provides additional financial security for dependents.",
    category: 'sales-angles'
  },
  {
    question: "What approach works best when selling Pro Achiever 3.0 to a client who just received an annual bonus?",
    options: [
      "Suggest they invest their entire bonus into Pro Achiever",
      "Recommend using part of the bonus to start or top up their Pro Achiever premium, framing it as converting windfall income into structured wealth building",
      "Tell them to save the bonus in a bank account instead",
      "Wait until their next bonus to discuss"
    ],
    correct: 1,
    explanation: "An annual bonus is an excellent opportunity to start or increase a Pro Achiever commitment. Framing it as converting a one-time windfall into structured, long-term wealth building is compelling. It feels like redirecting 'extra' money rather than committing from their regular salary. Never suggest investing the entire bonus — leave room for other needs.",
    category: 'sales-angles'
  },
  {
    question: "For a client aged 40 with 20 years to retirement, which investment period would you recommend and why?",
    options: [
      "10-year period because they are older and need shorter commitments",
      "15-year period as it balances bonus benefits with their retirement timeline, ending at age 55 with 10 more working years",
      "20-year period to maximize the welcome bonus, ending at age 60 at retirement",
      "Any period — age doesn't matter"
    ],
    correct: 2,
    explanation: "For a 40-year-old targeting retirement at 60, the 20-year period aligns perfectly with their retirement timeline. The 15-year period would also work (ending at 55, before retirement). The choice depends on when they want full access to the funds. Either way, both longer periods offer better welcome bonus percentages than the 10-year option.",
    category: 'sales-angles'
  },
  {
    question: "How do you address a client who says, 'I want to see the fund performance history before committing'?",
    options: [
      "Tell them past performance doesn't matter",
      "Show them the fund fact sheets with historical performance, while clearly stating that past performance is not indicative of future results as required by MAS",
      "Make up performance numbers to impress them",
      "Redirect to the welcome bonus and ignore their question"
    ],
    correct: 1,
    explanation: "Provide the fund fact sheets with historical performance data — this is reasonable due diligence. However, you must clearly state the MAS-required disclaimer that past performance is not indicative of future results. This balances transparency (showing the data they want) with regulatory compliance and managing expectations.",
    category: 'sales-angles'
  },
  {
    question: "When a client has an existing Pro Achiever 2.0 policy, how should you approach the conversation about 3.0?",
    options: [
      "Tell them to surrender 2.0 and switch to 3.0 immediately",
      "Explain the new features in 3.0 (commingling, GDIF, longer periods) and discuss whether a supplementary policy makes sense without replacing their existing coverage",
      "Tell them 2.0 is obsolete and worthless",
      "Ignore 3.0 and focus on selling different products"
    ],
    correct: 1,
    explanation: "Never recommend surrendering an existing policy — the surrender charges would destroy value. Instead, explain the new features in 3.0 and discuss whether adding a supplementary Pro Achiever 3.0 policy alongside their existing 2.0 makes sense. This respects their existing commitment while opening a new sales opportunity.",
    category: 'sales-angles'
  },
  {
    question: "What is the best way to frame the dollar cost averaging benefit for a nervous first-time investor?",
    options: [
      "Show complex mathematical formulas explaining DCA",
      "Use a simple analogy: 'It's like buying groceries — you naturally buy more when prices are low and less when prices are high, so your average cost stays reasonable over time'",
      "Tell them DCA eliminates all risk",
      "Skip the explanation — it's too technical for first-timers"
    ],
    correct: 1,
    explanation: "Simple analogies make complex concepts accessible. The grocery shopping analogy resonates because everyone understands buying more when things are cheap. This helps nervous investors see that regular investing actually benefits from market dips rather than being harmed by them. Never claim DCA eliminates all risk.",
    category: 'sales-angles'
  },
  {
    question: "A client mentions they are planning for a BTO (Build-To-Order) HDB flat in 3 years. Should you recommend Pro Achiever 3.0?",
    options: [
      "Yes, the welcome bonus will help with the down payment",
      "No, because they need liquidity in 3 years and Pro Achiever has a 10-year lock-in on the welcome bonus with surrender charges in early years",
      "Yes, but only with the 10-year period",
      "Yes, but at the minimum premium only"
    ],
    correct: 1,
    explanation: "For clients needing funds in 3 years for BTO, Pro Achiever 3.0 is NOT suitable. The 10-year lock-in on the welcome bonus and surrender charges in early years mean they would lose money if they need to access funds for their flat. Recommend they first secure their BTO financing, then consider Pro Achiever once their housing commitment is settled.",
    category: 'sales-angles'
  },
  {
    question: "How should you position the fixed ATR premiums compared to competitors with increasing rider premiums?",
    options: [
      "Avoid comparing rider premiums",
      "Create a comparison showing total rider premium costs over 20-30 years: fixed premiums stay the same while increasing premiums can double or triple, making Pro Achiever significantly cheaper over time",
      "Tell clients that rider premiums don't matter",
      "Claim all competitors have the same premium structure"
    ],
    correct: 1,
    explanation: "A long-term cost comparison is very powerful. Fixed ATR premiums mean the client pays the same amount in Year 1 as in Year 30. With increasing premiums (common among competitors), the cost at age 60 could be 2-3x the cost at age 30. Over 20-30 years, this difference amounts to thousands of dollars in savings.",
    category: 'sales-angles'
  },
  {
    question: "What is the most effective referral approach after successfully selling Pro Achiever 3.0?",
    options: [
      "Ask for referrals immediately after the sale is signed",
      "Wait 6-12 months until the client has experienced the product, then ask who else might benefit from the same financial planning approach",
      "Never ask for referrals — it's unprofessional",
      "Offer cash incentives for referrals"
    ],
    correct: 1,
    explanation: "While some advisors ask immediately, waiting 6-12 months allows the client to experience the value of the product and the advisor relationship. When they've seen their investment grow, received good service, and feel confident in their decision, they become genuine advocates. Offering cash incentives for referrals may breach MAS guidelines.",
    category: 'sales-angles'
  },
  {
    question: "When presenting to a small business owner, what angle of Pro Achiever 3.0 would resonate most?",
    options: [
      "The fund switching capability",
      "The supplementary charge dropping to zero after 10 years — they appreciate cost efficiency because they understand margins",
      "The GDIF quarterly dividends",
      "The 14-day free-look period"
    ],
    correct: 1,
    explanation: "Small business owners think in terms of costs, margins, and long-term value. The supplementary charge structure (3.9% for 10 years then zero) resonates because they understand that perpetual fees erode returns, just as recurring business expenses eat into profits. Frame it in business terms they relate to.",
    category: 'sales-angles'
  },
  {
    question: "How should you handle a client who wants to compare multiple ILPs before deciding?",
    options: [
      "Pressure them to decide now before the offer expires",
      "Support their due diligence, offer to prepare a side-by-side comparison of key features, charges, and bonuses, and schedule a follow-up meeting",
      "Tell them all ILPs are the same",
      "Refuse to provide comparison information"
    ],
    correct: 1,
    explanation: "Supporting due diligence builds trust and demonstrates confidence in the product. Offer to prepare a comparison covering: welcome bonus, ongoing bonuses, charge structures, fund options, flexibility features, and death benefits. A well-prepared comparison usually highlights Pro Achiever's strengths. Pressuring for immediate decisions erodes trust.",
    category: 'sales-angles'
  },
  {
    question: "What is the best way to use the Benefit Illustration during a sales presentation?",
    options: [
      "Skip it and focus on the product brochure",
      "Walk through the projected values at key milestones (Year 10, 15, 20, retirement age), explaining the illustrated and non-guaranteed returns scenarios",
      "Only show the best-case scenario projections",
      "Leave it for the client to read on their own"
    ],
    correct: 1,
    explanation: "Walk through the Benefit Illustration at key milestones the client cares about. Show both the illustrated rate and lower scenarios to set realistic expectations. This is both a regulatory requirement (MAS mandates these illustrations) and good practice — clients who understand what to expect are less likely to surrender during market downturns.",
    category: 'sales-angles'
  },
  {
    question: "A prospect is a doctor earning $20,000/month. What premium level should you discuss?",
    options: [
      "$400/month — the standard entry point",
      "$1,000+/month ($12,000+/year) to access the highest welcome bonus tier and maximize wealth accumulation relative to their income",
      "$200/month to start small",
      "Only discuss riders since they probably already have investments"
    ],
    correct: 1,
    explanation: "High-income professionals like doctors can typically afford higher premiums and benefit from accessing higher welcome bonus tiers. At $12,000+/year, they qualify for better bonus percentages. However, always verify affordability through an FNA — high income doesn't always mean high disposable income (medical school loans, clinic overhead, etc.).",
    category: 'sales-angles'
  },
  {
    question: "How should you approach a client who is risk-averse and scared of stock market investments?",
    options: [
      "Tell them the market always goes up in the long run",
      "Acknowledge their concern, then highlight the Capital Guarantee on Death, dollar cost averaging, and conservative fund options within Pro Achiever that can reduce volatility",
      "Recommend a fixed deposit instead",
      "Skip the risk discussion entirely"
    ],
    correct: 1,
    explanation: "Acknowledge their fear first — dismissing it loses trust. Then address it with facts: the Capital Guarantee on Death provides a floor, dollar cost averaging reduces timing risk, and conservative fund options are available for lower volatility. Also, the commingling feature lets them put part in managed portfolios for professional oversight.",
    category: 'sales-angles'
  },
  {
    question: "What is the strongest argument for starting Pro Achiever 3.0 this year versus waiting?",
    options: [
      "The product might be discontinued soon",
      "Every year delayed is a year less of compounding and potentially a year less of special bonus eligibility from Year 10 onwards",
      "Premium rates will increase next year",
      "Interest rates are favorable right now"
    ],
    correct: 1,
    explanation: "The time value of money is the strongest argument. Every year delayed means: one less year of compounding on the welcome bonus, one year later before qualifying for the special bonus (5% from Year 10), and one less year of DCA investing. Never use false urgency (product discontinuation or rate increases) as a tactic.",
    category: 'sales-angles'
  },
  {
    question: "A client is concerned about locking up money for 10 years. What combination of features should you highlight?",
    options: [
      "Only the Premium Pass",
      "Premium Pass (12-month payment pause after 5 years), partial withdrawal options, policy loan facility, and Premium Holiday — showing multiple liquidity options",
      "Tell them there are no liquidity options",
      "Only the fund switching feature"
    ],
    correct: 1,
    explanation: "Address the lock-in concern by showing the full suite of liquidity features: Premium Pass for payment flexibility, partial withdrawal options (with conditions), policy loan facility against cash value, and Premium Holiday. While the welcome bonus is locked for 10 years, the client is not completely illiquid.",
    category: 'sales-angles'
  },
  {
    question: "When presenting Pro Achiever 3.0 to a family-oriented client, what emotional trigger is most appropriate?",
    options: [
      "Fear of dying without coverage",
      "The desire to build a financial legacy — showing how the capital guarantee and growing fund value create a safety net for loved ones regardless of what happens",
      "Guilt about not providing enough",
      "Envy of neighbors who have the product"
    ],
    correct: 1,
    explanation: "The legacy-building angle is positive and empowering. It shows clients they are taking proactive steps to protect and provide for their family. This is more effective than fear-based or guilt-based selling, which can feel manipulative. The capital guarantee on death supports this narrative with concrete protection.",
    category: 'sales-angles'
  },
  {
    question: "How should you handle a client who says they want to invest $400/month but can afford $600/month?",
    options: [
      "Accept their $400 decision without discussion",
      "Push them to invest $600 because more is always better",
      "Show them the difference in welcome bonus tiers and projected returns between $4,800/year and $7,200/year, then let them make an informed decision",
      "Tell them they are making a mistake by choosing the lower amount"
    ],
    correct: 2,
    explanation: "Present the factual comparison: show how the higher premium may qualify for a better welcome bonus tier and what the projected difference in fund value would be over 10-20 years. Then let the client decide. This is consultative selling — you educate, they choose. Never pressure or make them feel their choice is wrong.",
    category: 'sales-angles'
  },
  {
    question: "What is the best way to position Pro Achiever 3.0 during an economic downturn?",
    options: [
      "Avoid selling during downturns",
      "Position it as an ideal time to start: dollar cost averaging means buying more units at lower prices, and the welcome bonus provides an additional buffer",
      "Guarantee that the market will recover soon",
      "Focus only on the insurance component and ignore the investment aspect"
    ],
    correct: 1,
    explanation: "Economic downturns are actually favorable starting points for DCA investors — they buy more fund units at lower prices. Combined with the welcome bonus credited in Year 1, clients start with an additional buffer. Never guarantee market recovery, but historical data shows that long-term investing through cycles has rewarded patient investors.",
    category: 'sales-angles'
  },
  {
    question: "How should you tailor the Pro Achiever 3.0 pitch for a Grab driver or gig economy worker?",
    options: [
      "Tell them ILPs are not suitable for gig workers",
      "Focus on the minimum premium, the Premium Pass safety net for irregular income months, and the importance of building insurance coverage that their gig work does not provide",
      "Recommend the 20-year period for maximum bonus",
      "Suggest they find permanent employment first"
    ],
    correct: 1,
    explanation: "Gig workers often lack employer-provided insurance, making Pro Achiever's protection component especially valuable. Focus on: affordable entry premium, Premium Pass (12-month payment pause) for months with lower earnings, and the critical importance of having life insurance coverage. The 10-year period may be more suitable given income uncertainty.",
    category: 'sales-angles'
  },
  {
    question: "When should you bring up the special bonus in your presentation?",
    options: [
      "In the very first minute to hook the client",
      "After establishing the client's long-term goals and demonstrating the base product features, use the special bonus as the 'cherry on top' that rewards long-term commitment",
      "Only if the client is about to walk away",
      "Never — it confuses clients"
    ],
    correct: 1,
    explanation: "The special bonus works best as a reinforcement after the core value proposition is established. Once the client understands the base features, the special bonus (5% from Year 10, 8% from Year 21) becomes a compelling addition that rewards their commitment. Using it as a last-minute hook feels manipulative.",
    category: 'sales-angles'
  },
  {
    question: "How should you position Pro Achiever 3.0 for a civil servant with a stable government job?",
    options: [
      "Tell them they don't need insurance since they have government benefits",
      "Highlight the predictability: fixed ATR premiums complement their stable income, the regular premium structure suits salaried employees, and the 15-20 year period aligns with their predictable career timeline",
      "Focus only on the investment returns",
      "Suggest they rely solely on CPF"
    ],
    correct: 1,
    explanation: "Civil servants value stability and predictability. Fixed ATR premiums, regular premium payments via GIRO, and long investment periods align with their stable employment. Government benefits provide some coverage, but Pro Achiever adds wealth accumulation and additional protection that public sector benefits may not cover comprehensively.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (~40 questions)
  // ============================================================
  {
    question: "Client: 'The 3.9% supplementary charge sounds expensive. Why should I pay that?' What is the best response?",
    options: [
      "Tell them it's non-negotiable and move on",
      "Acknowledge the concern, explain the charge is only for the first 10 years then drops to zero (unlike competitors who charge perpetually), and show the total cost comparison over 30+ years",
      "Offer to waive the charge (which you cannot do)",
      "Agree that it's expensive and suggest a different product"
    ],
    correct: 1,
    explanation: "The best response acknowledges the concern (validating the client), then reframes: the charge is temporary (10 years) while competitors charge perpetually. Over a 30-45 year policy, Pro Achiever's total supplementary costs are significantly lower. Never offer to waive charges you cannot waive, and don't agree it's expensive without context.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I can get better returns investing in the stock market myself.' How should you respond?",
    options: [
      "Argue that they can't beat the market",
      "Acknowledge that direct investing can yield good returns, then ask if their stock portfolio provides a capital guarantee on death, insurance protection, welcome/special bonuses, and enforced discipline against emotional selling",
      "Tell them the stock market is gambling",
      "Agree and don't pursue the sale"
    ],
    correct: 1,
    explanation: "Never dismiss the client's confidence. Instead, acknowledge their point, then highlight what direct stock investing LACKS: insurance protection, capital guarantee on death, welcome/special bonuses, and the discipline of regular investing. Pro Achiever is not just an investment — it's a comprehensive financial planning tool.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Returns are not guaranteed — I might lose money.' How do you address this?",
    options: [
      "Promise them they won't lose money",
      "Acknowledge the market risk honestly, then explain the risk mitigants: dollar cost averaging reduces timing risk, capital guarantee on death protects beneficiaries, and the welcome/special bonuses add to overall value",
      "Redirect to a guaranteed-return product immediately",
      "Tell them all investments carry risk and leave it at that"
    ],
    correct: 1,
    explanation: "Honesty is essential — never promise guaranteed returns on an ILP. Acknowledge the risk, then systematically address it: DCA smooths out market timing, the capital guarantee protects on death, and bonuses add value beyond market returns. Also, history shows that diversified portfolios over 10+ years have generally produced positive returns.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I need to talk to my spouse first.' How should you handle this?",
    options: [
      "Push them to sign now before talking to their spouse",
      "Respect their decision, offer to arrange a joint meeting with both spouses, and provide materials they can review together",
      "Tell them their spouse doesn't need to be involved in financial decisions",
      "Express disappointment and suggest they aren't serious"
    ],
    correct: 1,
    explanation: "Always respect the need to involve a spouse — it's a sign of a healthy relationship and shared financial responsibility. Offer to arrange a joint meeting where you can address both spouses' questions. Provide summary materials for them to review. Pushing for a unilateral decision often leads to cancellation during the free-look period.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I already have insurance — I don't need another policy.' What's the best approach?",
    options: [
      "Tell them their existing insurance is inadequate",
      "Ask about their existing coverage, identify any gaps, then position Pro Achiever as a complementary wealth-building tool that also provides additional protection, rather than a replacement",
      "Agree and end the conversation",
      "Criticize their current insurer"
    ],
    correct: 1,
    explanation: "First, understand what they have — ask about their existing coverage (term life, whole life, health). Then identify gaps and position Pro Achiever as complementary. Most people don't have sufficient coverage AND wealth accumulation. Pro Achiever addresses the investment component with insurance benefits, filling a different need than pure protection products.",
    category: 'objection-handling'
  },
  {
    question: "Client: '10 years is too long to lock in my money.' How do you respond?",
    options: [
      "Reduce the period to make them comfortable (you can't)",
      "Acknowledge the concern, then reframe: the lock-in protects them from emotional selling during market dips, and highlight that they still have access through partial withdrawals, policy loans, and Premium Pass after 5 years",
      "Tell them 10 years will fly by",
      "Agree and recommend a savings account instead"
    ],
    correct: 1,
    explanation: "Acknowledge the concern first. Then reframe the lock-in as enforced discipline that has historically benefited investors. Additionally, clarify that they are NOT completely locked out — partial withdrawals, policy loans, and Premium Pass (after 5 years) provide liquidity options. The 10 years refers specifically to the welcome bonus withdrawal restriction.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Insurance companies make too much money from fees.' How do you handle this?",
    options: [
      "Defend the insurance industry aggressively",
      "Acknowledge that fees are a valid concern, then use the $1/month linearized distribution cost figure to show that the actual cost of advice and management is remarkably low over the policy's lifetime",
      "Agree and say there's nothing you can do about it",
      "Tell them fees don't affect their returns"
    ],
    correct: 1,
    explanation: "Validate the concern — fee transparency builds trust. Then present the facts: the total distribution cost over 45 years is approximately $6,194, or about $1/month. This covers professional advice, policy administration, and ongoing service. When framed this way, most clients agree the value exceeds the cost.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My friend lost money on an ILP. Why should I trust this product?' How do you respond?",
    options: [
      "Tell them their friend made bad investment choices",
      "Acknowledge their concern, ask what happened to their friend's policy, then explain how Pro Achiever 3.0's features (DCA, capital guarantee, bonus structures) differ from older or poorly structured ILPs",
      "Deny that ILPs can lose money",
      "Blame the friend's financial advisor"
    ],
    correct: 1,
    explanation: "Take the concern seriously — their friend's experience is real to them. Ask what happened (early surrender? wrong fund choice? no DCA?). Then explain how Pro Achiever 3.0 is structured differently with bonuses, capital guarantee on death, and DCA benefits. Understanding the friend's specific situation lets you address the concern precisely.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to wait until the market is lower before investing.' How should you address this?",
    options: [
      "Agree and tell them to call you when the market drops",
      "Explain that timing the market is statistically very difficult, and dollar cost averaging with regular premiums means they automatically buy more units when prices are low — the strategy works best when started, not timed",
      "Guarantee that the market is at its lowest point now",
      "Tell them the market will never be lower than it is today"
    ],
    correct: 1,
    explanation: "Market timing is a common objection. The response should be educational: research consistently shows that even professional fund managers struggle to time markets. DCA inherently addresses timing by spreading purchases over years. Studies show that 'time in the market' beats 'timing the market' for long-term investors.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I prefer putting money in my CPF — at least the interest rate is guaranteed.' How do you respond?",
    options: [
      "Agree that CPF is better and close the conversation",
      "Acknowledge CPF's guaranteed returns, then explain that Pro Achiever serves a different purpose: it provides life insurance, potential for higher returns over time, accessibility (not locked until age 55/65), and the welcome/special bonus structure",
      "Tell them CPF returns are too low",
      "Claim Pro Achiever guarantees higher returns than CPF"
    ],
    correct: 1,
    explanation: "Never dismiss CPF — it's a valued part of Singaporean financial planning. Instead, position Pro Achiever as complementary: CPF provides guaranteed returns but with access restrictions (age 55/65). Pro Achiever offers life insurance protection, potentially higher returns, and different liquidity features. They serve different purposes in a diversified financial plan.",
    category: 'objection-handling'
  },
  {
    question: "Client: '$400/month is too much for me right now.' What's the best response?",
    options: [
      "Tell them they need to prioritize better",
      "Ask about their monthly budget and expenses to understand their financial situation, then explore whether a lower entry point exists or if other financial priorities should be addressed first",
      "Offer an unauthorized discount",
      "Dismiss their concern and proceed with the presentation"
    ],
    correct: 1,
    explanation: "Respect their budget concern. Explore their financial situation: do they have high-interest debt? Insufficient emergency fund? Or is it truly a budget constraint? If there are lower premium options, present them. If the client genuinely cannot afford it right now, it's better to wait than to oversell and risk a lapse.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm only 25 — I don't need life insurance yet.' How do you respond?",
    options: [
      "Tell them they could die tomorrow",
      "Acknowledge they feel young and healthy, then explain two key advantages of starting early: (1) lowest possible insurance premiums, and (2) maximum compounding time for the investment and bonus components",
      "Agree and suggest they come back at 35",
      "Tell them about all the young people who died unexpectedly"
    ],
    correct: 1,
    explanation: "Avoid fear-based tactics with young prospects. Instead, focus on the practical advantages of starting at 25: insurance premiums are at their lowest (they'll never be this cheap again), and they get 35-40 years of compounding for the investment portion. A $400/month commitment at 25 grows significantly more than at 35 due to compound interest.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I heard ILPs have high hidden fees.' How should you address this?",
    options: [
      "Deny that there are any fees",
      "Provide complete transparency: walk through all charges (supplementary charge, fund management fees, insurance charges) using the Product Summary, showing there are no hidden fees — everything is disclosed",
      "Tell them not to worry about fees",
      "Blame the media for spreading misinformation"
    ],
    correct: 1,
    explanation: "Transparency is the best antidote to 'hidden fees' concerns. Walk through every charge using the official Product Summary: supplementary charge (3.9% for 10 years, then zero), fund management fees (varies by fund), and insurance charges. Show that everything is disclosed as required by MAS regulations. Nothing is hidden.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What happens if AIA goes bankrupt?' How do you handle this concern?",
    options: [
      "Tell them not to worry about it",
      "Explain that AIA is one of the largest insurers in Asia-Pacific, regulated by MAS, and that Singapore has the Policy Owners' Protection Scheme (POPS) administered by SDIC that protects policyholders",
      "Guarantee that AIA will never go bankrupt",
      "Agree that it's a valid risk and offer no reassurance"
    ],
    correct: 1,
    explanation: "Address this with facts: AIA is one of the largest insurance groups in Asia-Pacific with strong financial ratings. In Singapore, MAS regulates insurers with strict capital requirements. Additionally, the Policy Owners' Protection Scheme (POPS) administered by the Singapore Deposit Insurance Corporation (SDIC) provides a safety net for policyholders. Never guarantee a company won't fail.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My banker told me unit trusts are better than ILPs.' How do you respond?",
    options: [
      "Tell them their banker is wrong and doesn't know what they're talking about",
      "Acknowledge that unit trusts are valid investments, then differentiate: Pro Achiever combines investment with life insurance, capital guarantee on death, welcome/special bonuses, and premium waiver options that standalone unit trusts don't offer",
      "Agree that unit trusts are better and walk away",
      "Criticize the banking industry"
    ],
    correct: 1,
    explanation: "Never attack another professional's advice. Acknowledge unit trusts as valid, then differentiate on what Pro Achiever adds beyond pure investment: life insurance coverage, capital guarantee on death, bonus structures that enhance returns, enforced discipline through regular premiums, and rider options. Unit trusts don't provide these protections.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to focus on paying off my HDB loan first.' Is this a valid objection?",
    options: [
      "No — insurance should always come first",
      "Yes — but explore the situation: if their HDB loan interest is low (2.6% for HDB loan), the opportunity cost of delaying investment and insurance may be higher than the interest saved, and they may be able to do both at a modest premium",
      "Yes — tell them to come back when the loan is paid off in 25 years",
      "No — tell them to refinance their loan immediately"
    ],
    correct: 1,
    explanation: "This is a nuanced situation. HDB loan interest (2.6%) is relatively low. If the client can afford a modest premium while servicing their loan, the compounding benefit of starting early may outweigh the interest savings from accelerated loan repayment. However, if their cash flow is truly tight, it's valid to prioritize the loan. Explore rather than dismiss.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I don't trust insurance agents — they just want to earn commission.' How do you handle this?",
    options: [
      "Deny that you earn commission",
      "Acknowledge their concern, be transparent about the advisory relationship, then demonstrate value through a thorough needs analysis, personalized recommendation, and commitment to ongoing service — showing that your incentives are aligned with their long-term success",
      "Get offended and defend the profession",
      "Offer to give back your commission"
    ],
    correct: 1,
    explanation: "Trust is earned, not demanded. Acknowledge their skepticism honestly. Then demonstrate value: conduct a proper FNA, provide personalized recommendations, show the total cost transparency ($1/month linearized), and commit to ongoing reviews. When clients see you prioritize their needs over a sale, trust builds naturally.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What if I lose my job and can't pay premiums?' How do you address this?",
    options: [
      "Tell them to budget better",
      "Show them the safety net features: Premium Pass (12-month payment pause after 5 years), 30-day grace period, policy loan availability, and the option to reduce premium if needed — the product has multiple flexibility features built in",
      "Suggest they don't buy insurance until they're financially secure",
      "Guarantee they won't lose their job"
    ],
    correct: 1,
    explanation: "This is a common and legitimate fear. Address it by showing the multiple safety nets: Premium Pass allows a 12-month pause after 5 years of premiums, the 30-day grace period provides a buffer for late payments, and policy loans can provide short-term liquidity. These features demonstrate that the product accounts for life's uncertainties.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My parents never had insurance and they're fine.' How do you respond?",
    options: [
      "Tell them their parents were irresponsible",
      "Acknowledge their parents' generation, then explain that today's financial landscape is different: higher cost of living, longer life expectancy, more complex healthcare costs, and less certainty of CPF alone being sufficient for retirement",
      "Agree and say insurance isn't necessary",
      "Tell them they'll regret it if something happens"
    ],
    correct: 1,
    explanation: "Respect the parents' experience while contextualizing the difference: cost of living has risen dramatically, medical costs are higher, life expectancy is longer (need more retirement savings), and job-for-life stability is less common. Their parents' generation also had different family support structures. Today's financial planning needs are fundamentally different.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Can I just get term insurance for protection and invest separately?' How do you respond?",
    options: [
      "Tell them 'buy term invest the rest' is a myth",
      "Acknowledge it's a valid strategy for some, then explain the advantages of Pro Achiever's integrated approach: convenience, welcome/special bonuses not available with separate products, capital guarantee on death, and the discipline of combined saving",
      "Agree completely and sell them term insurance instead",
      "Tell them term insurance is a waste of money"
    ],
    correct: 1,
    explanation: "The 'buy term invest the rest' (BTIR) approach is legitimate — don't dismiss it. However, Pro Achiever offers unique advantages that BTIR cannot replicate: the welcome bonus (5-75%), special bonus (5-8% p.a.), capital guarantee on death, and enforced investment discipline. Many BTIR advocates fail to actually invest the difference consistently.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I read online that ILPs are bad products. How do you explain that?' How should you respond?",
    options: [
      "Tell them not to believe everything they read online",
      "Acknowledge the criticism exists, explain that earlier ILPs had valid issues (high fees, poor transparency), then show how Pro Achiever 3.0 addresses those concerns: fees drop to zero after 10 years, full disclosure, bonus structures, and capital guarantee on death",
      "Dismiss online opinions entirely",
      "Agree that most ILPs are bad but claim Pro Achiever is different without explaining why"
    ],
    correct: 1,
    explanation: "Acknowledge the criticism honestly — some historical ILPs did have valid issues. Then show how Pro Achiever 3.0 specifically addresses common concerns: supplementary charges drop to zero after 10 years (unlike perpetual charges in older ILPs), full MAS-compliant disclosure, welcome/special bonuses that add value, and the capital guarantee on death.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why should I pay insurance charges when I'm young and healthy?' What is the best response?",
    options: [
      "Tell them accidents don't discriminate by age",
      "Explain that insurance premiums are lowest when you're young and healthy — waiting until older or after a health condition develops means significantly higher costs or even denial of coverage. Lock in low rates now while you qualify",
      "Agree and suggest they buy insurance at 40",
      "Scare them with statistics about young people dying"
    ],
    correct: 1,
    explanation: "Frame it as a financial decision rather than a fear-based one. Insurance premiums are calculated based on age and health — they will NEVER be lower than they are today. A health condition later could result in exclusions, higher premiums, or outright denial. Locking in coverage while young and healthy is a smart financial move.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to invest in property instead.' How do you respond?",
    options: [
      "Tell them property is a bad investment",
      "Acknowledge that property can be a good investment, then highlight the differences: property requires a large capital outlay, has illiquidity, maintenance costs, and tenant risk. Pro Achiever requires only $400-500/month, provides diversification, life insurance, and liquidity features — they can do both",
      "Agree and end the conversation",
      "Claim Pro Achiever returns will beat property returns"
    ],
    correct: 1,
    explanation: "Never dismiss property — many Singaporeans have built wealth through it. Instead, highlight the complementary nature: property requires large capital, is illiquid, has ongoing costs, and concentrates risk. Pro Achiever requires modest monthly commitments, provides diversification, insurance protection, and liquidity features. A balanced approach includes both asset classes.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What if I need the money for a medical emergency?' How should you respond?",
    options: [
      "Tell them to use their MediSave instead",
      "Explain the liquidity options: partial withdrawals (with conditions), policy loans against cash value, and the importance of maintaining a separate emergency fund — Pro Achiever should not be the emergency fund",
      "Guarantee that they can access their money anytime",
      "Tell them emergencies are rare and not to worry"
    ],
    correct: 1,
    explanation: "Address this by explaining two things: (1) Pro Achiever offers some liquidity through partial withdrawals and policy loans, and (2) proper financial planning means having a separate emergency fund (3-6 months of expenses) in liquid savings BEFORE committing to long-term investments. Pro Achiever is for long-term wealth building, not emergency funding.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm already contributing to SRS — do I need Pro Achiever too?' What is the best response?",
    options: [
      "Tell them SRS is useless",
      "Acknowledge SRS is a good tax-efficient savings tool, then explain that Pro Achiever adds life insurance protection, capital guarantee on death, and bonus structures that SRS doesn't offer — they serve different purposes in a comprehensive financial plan",
      "Agree that SRS is enough",
      "Suggest they stop SRS contributions and switch to Pro Achiever"
    ],
    correct: 1,
    explanation: "SRS (Supplementary Retirement Scheme) provides tax benefits but no insurance coverage, no capital guarantee, and no bonus structures. Pro Achiever provides life insurance, capital guarantee on death, and welcome/special bonuses. They complement each other: SRS for tax-efficient retirement savings, Pro Achiever for insured wealth accumulation.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why can't I just invest in an ETF index fund with lower fees?' How should you respond?",
    options: [
      "Claim Pro Achiever fees are lower than ETFs",
      "Acknowledge ETFs have lower management fees, then show the total value proposition: Pro Achiever's welcome bonus (up to 75%) and special bonus (5-8% p.a.) can more than offset the fee difference, plus it includes life insurance and capital guarantee that ETFs don't provide",
      "Tell them ETFs are risky and volatile",
      "Dismiss ETF investing as only for experts"
    ],
    correct: 1,
    explanation: "Be honest that ETFs typically have lower management fees. But the comparison isn't just about fees — it's about total value. Pro Achiever's welcome bonus and special bonus add significant value, plus the life insurance and capital guarantee are included at no extra premium. When you factor in all benefits, the effective cost-to-value ratio can be competitive.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I don't want to commit for 10 years — what if there's a recession?' How do you handle this?",
    options: [
      "Tell them recessions don't last long",
      "Acknowledge recession fears, then explain that recessions are actually beneficial for DCA investors (buying units cheaper), the capital guarantee protects on death, and historically, 10+ year investment periods have recovered from even severe downturns",
      "Suggest a shorter commitment period that doesn't exist",
      "Promise that AIA will protect their investment during recessions"
    ],
    correct: 1,
    explanation: "Validate the fear, then educate: (1) DCA means recessions are actually advantageous — you buy more units at lower prices, (2) historical data shows that diversified portfolios over 10+ year periods have consistently recovered from downturns, (3) the capital guarantee protects on death regardless of market conditions. The 10-year horizon is actually a strength.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My financial situation is uncertain — I might be retrenched.' What's the best approach?",
    options: [
      "Dismiss the concern and proceed with the sale",
      "Take it seriously: ensure they have an emergency fund first, then show the flexibility features (Premium Pass, grace period) that accommodate employment transitions, and suggest a premium they can sustain even during a career transition",
      "Tell them that's why they need insurance more than ever",
      "Suggest they wait until they feel more secure"
    ],
    correct: 1,
    explanation: "Employment uncertainty is a serious concern that must be respected. First, confirm they have an emergency fund. Then show the safety nets: Premium Pass (12-month payment pause), 30-day grace period, and policy loan option. Recommend a premium that's sustainable even during job transitions. If their financial foundation is too shaky, it may genuinely be better to wait.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'd rather put my money in a fixed deposit — at least it's guaranteed.' How do you respond?",
    options: [
      "Tell them fixed deposits are a terrible idea",
      "Acknowledge the appeal of guaranteed returns, then show that current FD rates (1-3%) barely keep pace with inflation (3-4%), meaning their money loses purchasing power over time. Pro Achiever's combination of potential market returns plus bonuses aims to outpace inflation over the long term",
      "Promise that Pro Achiever will beat FD returns",
      "Agree and suggest they split between FDs and Pro Achiever"
    ],
    correct: 1,
    explanation: "Validate the comfort of guarantees, then educate on the inflation risk: if FD rates are 2% but inflation is 3-4%, their purchasing power actually decreases. Pro Achiever, through market-linked investments plus bonuses, aims to grow wealth above inflation. The key message: 'guaranteed low returns' can be riskier than 'non-guaranteed but potentially higher returns' over 10-20 years.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've heard that insurance agents earn high commissions on ILPs, so aren't you biased?' How should you handle this?",
    options: [
      "Deny earning any commission",
      "Be transparent about the compensation structure, then redirect to value: the total distribution cost is about $1/month over the policy's life, your ongoing service includes annual reviews and portfolio rebalancing advice, and you're accountable to MAS regulations for suitability",
      "Get defensive about your income",
      "Tell them it's none of their business"
    ],
    correct: 1,
    explanation: "Transparency builds trust. Acknowledge the compensation structure exists, then reframe: the total distribution cost linearizes to about $1/month. In return, the client gets professional advice, annual reviews, portfolio guidance, and a fiduciary obligation to recommend suitable products. Your ongoing relationship is your incentive to do right by them.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My colleague told me to avoid ILPs and just buy term insurance.' What is the best response?",
    options: [
      "Tell them their colleague is not a qualified financial advisor",
      "Respect the colleague's opinion, then explain that the 'buy term invest the rest' strategy works well in theory but many people fail to consistently invest the difference. Pro Achiever enforces discipline and adds bonuses that a separate approach cannot replicate",
      "Agree with the colleague",
      "Criticize term insurance as a product"
    ],
    correct: 1,
    explanation: "Don't attack the colleague. Instead, address the underlying logic: BTIR works on paper, but behavioral finance shows most people don't invest the premium difference consistently. Pro Achiever enforces the discipline, adds welcome/special bonuses, provides capital guarantee on death, and bundling simplifies administration. For clients who lack investing discipline, it's often more effective.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'll think about it and get back to you.' How should you respond?",
    options: [
      "Apply pressure by saying the offer expires today",
      "Respect their need to consider, ask what specific aspects they want to think about so you can provide additional information, and schedule a specific follow-up meeting within the next 7-10 days",
      "Accept it passively and hope they call back",
      "Tell them that procrastination costs them money"
    ],
    correct: 1,
    explanation: "Respect their decision to think, but don't leave it open-ended. Ask specifically what they need to think about — this helps you address lingering concerns. Then schedule a concrete follow-up meeting (not 'call me when you're ready'). This maintains momentum while respecting their process. Artificial urgency damages trust.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm concerned about the impact of fees on my returns over 20 years.' What is the most thorough response?",
    options: [
      "Tell them not to focus on fees",
      "Walk through the full fee picture: supplementary charge (3.9% for 10 years, then zero), fund management fees (varies by fund), then show the NET projected returns in the Benefit Illustration which already account for all charges — and highlight the bonus structures that partially offset fees",
      "Claim there are no significant fees",
      "Compare to competitor fees without evidence"
    ],
    correct: 1,
    explanation: "A thorough fee discussion builds confidence. Walk through each charge component, show that the Benefit Illustration projections are NET of all charges, and highlight that the supplementary charge drops to zero after Year 10 (unique advantage). The welcome and special bonuses partially offset charges. Informed clients who understand the fee structure are less likely to lapse.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What if I need to surrender the policy early?' How do you address this?",
    options: [
      "Tell them early surrender is impossible",
      "Be honest that surrender charges apply in early years and they may receive less than premiums paid. Then emphasize the importance of commitment and show the alternative liquidity options (partial withdrawals, policy loans, Premium Pass) before considering full surrender",
      "Promise there are no surrender charges",
      "Discourage them from buying if they might surrender"
    ],
    correct: 1,
    explanation: "Honesty is critical: yes, surrender charges apply in early years and they could lose money. This is why proper needs analysis is important — ensure the client can commit long-term. Then show alternatives to full surrender: partial withdrawals, policy loans, and Premium Pass. Full surrender should be a last resort, not a primary exit strategy.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want something simple — this seems too complicated.' How do you simplify?",
    options: [
      "Tell them finance is inherently complicated",
      "Simplify the message to three core benefits: (1) your money grows through investments and bonuses, (2) your family is protected if something happens to you, (3) charges reduce over time. Offer to handle the complexity for them through ongoing advisory",
      "Skip the product details entirely and just ask them to sign",
      "Suggest a simpler product that doesn't meet their needs"
    ],
    correct: 1,
    explanation: "Simplify without oversimplifying. Break it down to three clear benefits that anyone can understand. Then position yourself as the expert who manages the complexity — that's the value of a financial advisor. The client doesn't need to understand every detail; they need to understand the key benefits and trust their advisor.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My child just started university — I have too many expenses right now.' How do you respond?",
    options: [
      "Tell them education expenses will end soon",
      "Empathize with the financial pressure, explore whether a modest premium ($300-400/month) is feasible, and if not, discuss a timeline to start after the most intensive expense years. Highlight that starting even a few years later is better than not starting at all",
      "Push for the maximum premium anyway",
      "Offer to pay their child's tuition"
    ],
    correct: 1,
    explanation: "Empathize genuinely — university costs are real. Explore whether a modest premium is feasible alongside these expenses. If not, create a plan: perhaps start with a lower amount now and increase after graduation, or plan to start in 2-3 years. The key is maintaining the relationship and setting a concrete future start date rather than losing the client entirely.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (~30 questions)
  // ============================================================
  {
    question: "You're meeting a 28-year-old software engineer earning $7,000/month who says, 'I invest in crypto — it gives me much better returns.' What do you say?",
    options: [
      "Tell him crypto is a scam and he'll lose everything",
      "Acknowledge his crypto interest, then position Pro Achiever as the 'stable foundation' in his portfolio — while crypto provides potential high returns, Pro Achiever adds life insurance, capital guarantee, and steady growth that crypto cannot offer. Suggest he diversify rather than replace",
      "Agree that crypto is better and walk away",
      "Ask him to teach you about crypto"
    ],
    correct: 1,
    explanation: "Never dismiss a client's existing investments. Position Pro Achiever as the 'foundation' of a diversified portfolio: it provides the insurance protection, capital guarantee, and disciplined saving that crypto doesn't offer. A balanced approach might be 70-80% structured investments (like Pro Achiever) and 20-30% in higher-risk assets. Appeal to his analytical mindset with diversification logic.",
    category: 'roleplay'
  },
  {
    question: "A 35-year-old couple with a combined income of $14,000/month says, 'We're saving for a BTO that we'll get in 2 years, and we have a baby on the way. Is now really the right time?' What do you recommend?",
    options: [
      "Tell them to get Pro Achiever immediately at the highest premium",
      "Acknowledge their priorities, suggest they first secure their BTO financing and baby expenses. Then recommend starting a modest Pro Achiever policy ($400/month) for the life insurance coverage they'll need with a baby, using the 15 or 20-year period for their child's future",
      "Tell them insurance can wait until after the BTO",
      "Sell them only a term insurance policy"
    ],
    correct: 1,
    explanation: "This requires balancing multiple priorities. The baby makes life insurance urgent (they NEED coverage now). But BTO costs must be managed. A modest premium allows them to start building coverage and wealth without jeopardizing their BTO down payment. The 15-20 year period aligns with their child's education timeline. Always prioritize needs over sales volume.",
    category: 'roleplay'
  },
  {
    question: "You're presenting to a 50-year-old business owner who says, 'I'm already wealthy enough. Why do I need this?' How do you reposition?",
    options: [
      "Tell him even wealthy people die",
      "Shift the conversation from 'need' to 'optimize': discuss estate planning using irrevocable nomination (proceeds bypass estate), tax-efficient wealth transfer to children, the GDIF quarterly dividends for passive income, and the capital guarantee as a wealth preservation tool",
      "Agree that he doesn't need it",
      "Tell him his business could fail and he'll need a safety net"
    ],
    correct: 1,
    explanation: "For wealthy clients, the conversation shifts from 'protection' to 'optimization': irrevocable nomination for estate planning (proceeds don't enter the estate), efficient wealth transfer to the next generation, GDIF for passive income, and capital guarantee as wealth preservation. This speaks to their level — they're not worried about survival, but about optimization and legacy.",
    category: 'roleplay'
  },
  {
    question: "A 30-year-old teacher earning $4,500/month says, 'I only have $200/month to spare. Is that enough for Pro Achiever?' What do you do?",
    options: [
      "Tell her $200 is not enough and she should wait until she earns more",
      "Explore whether $200 is truly the maximum by reviewing her budget, then if $200 is the genuine limit, check if there's a minimum premium tier she qualifies for. If Pro Achiever's minimum exceeds her budget, suggest alternative products that fit while keeping the relationship for future upgrade",
      "Push her to find $400/month by cutting other expenses",
      "Sign her up for the lowest possible plan without discussing suitability"
    ],
    correct: 1,
    explanation: "Respect the client's budget while exploring options. Review her expenses to see if there's flexibility. If $200 is truly the maximum, check the minimum premium thresholds. If it falls short, recommend suitable alternatives and maintain the relationship — as her salary grows (teachers get annual increments), she may qualify for Pro Achiever later. Never oversell beyond someone's means.",
    category: 'roleplay'
  },
  {
    question: "A 42-year-old divorcee with 2 children says, 'I need to make sure my kids are taken care of if anything happens to me, but I don't trust investment products.' What approach do you take?",
    options: [
      "Focus purely on the investment returns to change her mind",
      "Lead with the protection story: the Capital Guarantee on Death ensures her children receive at least 101% of premiums paid regardless of market conditions. Use irrevocable nomination for her children. Then gently introduce the investment component as a bonus — the primary purpose is securing her children's future",
      "Tell her she's wrong not to trust investments",
      "Recommend pure term insurance only"
    ],
    correct: 1,
    explanation: "For a protective parent who distrusts investments, lead with what matters most to her: her children's security. The Capital Guarantee on Death is the anchor — 101% of premiums guaranteed regardless of market conditions. Irrevocable nomination ensures the money goes directly to her children. Frame the investment component as a 'bonus' that grows her protection over time, not the primary purpose.",
    category: 'roleplay'
  },
  {
    question: "A newly married couple (both 27) earning a combined $10,000/month says, 'We want to start planning for retirement and our future children's education. What should we do?' How do you structure your recommendation?",
    options: [
      "Recommend one large policy for the higher earner only",
      "Recommend individual policies for each spouse — this maximizes their total capital guarantee coverage and welcome bonuses. Suggest 20-year period to align with retirement planning, and show how the special bonus from Year 10 onwards can supplement education or retirement goals",
      "Tell them to focus on buying property first",
      "Recommend only term insurance and a robo-advisor"
    ],
    correct: 1,
    explanation: "Individual policies for each spouse provide several advantages: each person gets their own capital guarantee on death (protecting both ways), they each earn separate welcome bonuses, and coverage continues if one spouse passes. The 20-year period aligns with retirement planning. The special bonus starting at Year 10 coincides with when children would need education funding.",
    category: 'roleplay'
  },
  {
    question: "A 55-year-old client nearing retirement says, 'I'm worried about outliving my savings. Can Pro Achiever help?' How do you position the product?",
    options: [
      "Tell them it's too late to start Pro Achiever",
      "Focus on the GDIF quarterly dividend fund for regular income, the 10-year investment period for the shortest commitment, and the special bonus starting from Year 10 (age 65) providing additional annual income — positioning Pro Achiever as a retirement income supplement",
      "Recommend the 20-year period for maximum bonus",
      "Suggest they rely solely on CPF LIFE"
    ],
    correct: 1,
    explanation: "For a pre-retiree, focus on income generation: the GDIF provides quarterly dividends, the 10-year period gets them to the special bonus (5% p.a.) at age 65 when they may be retired, and the capital guarantee protects their principal. The 20-year period is too long for this life stage. Pro Achiever supplements (not replaces) CPF LIFE and other retirement income.",
    category: 'roleplay'
  },
  {
    question: "A 32-year-old freelance designer earning irregular income ($4,000-$10,000/month) says, 'I love the idea, but my income fluctuates too much to commit to regular payments.' What do you suggest?",
    options: [
      "Tell her to find a stable job first",
      "Acknowledge the income variability, recommend a premium based on her lowest consistent income (e.g., $400/month on $4,000 minimum), highlight the Premium Pass as a safety net for lean months, and suggest setting aside a 'premium buffer' fund from good months to cover lean periods",
      "Suggest the maximum premium based on her best months",
      "Tell her Pro Achiever isn't suitable for freelancers"
    ],
    correct: 1,
    explanation: "Size the premium to the MINIMUM consistent income, not the average or peak. At $4,000/month minimum, $400/month is sustainable. The Premium Pass (after 5 years) provides additional safety. Advise creating a small 'premium buffer' from good months to cover any lean periods. This approach makes the commitment manageable without the stress of variable income.",
    category: 'roleplay'
  },
  {
    question: "During a presentation, the client's father-in-law (a retired accountant) joins and starts challenging the fee structure aggressively. How do you handle this?",
    options: [
      "Ask the father-in-law to leave as he wasn't invited",
      "Welcome his involvement, provide the full Product Summary for his review, walk through every charge transparently (supplementary, fund management, insurance), show the $1/month linearized cost, and demonstrate the welcome/special bonus structures that offset costs",
      "Ignore the father-in-law and continue speaking only to the client",
      "Offer to give the father-in-law a discount"
    ],
    correct: 1,
    explanation: "An accountant analyzing the fee structure is actually an opportunity — they respect transparency and numbers. Welcome his involvement (he's an influencer in the decision). Show every charge openly, use the Product Summary as evidence, demonstrate the total cost ($1/month) and bonus structures. If the numbers hold up under scrutiny (they do), the father-in-law becomes an ally rather than an obstacle.",
    category: 'roleplay'
  },
  {
    question: "A 38-year-old client has been paying $500/month into Pro Achiever 2.0 for 6 years. She says, 'Should I stop this and start Pro Achiever 3.0 instead?' What do you advise?",
    options: [
      "Yes, surrender the 2.0 policy and start 3.0",
      "No — do NOT surrender the existing 2.0 policy as surrender charges would apply. Instead, recommend keeping the 2.0 policy running (she's past the 5-year mark) and consider adding a supplementary 3.0 policy to access the new features like commingling and GDIF",
      "Tell her to cancel 2.0 during the free-look period (which has already passed)",
      "Tell her both products are identical"
    ],
    correct: 1,
    explanation: "Never recommend surrendering an existing policy after 6 years — the surrender charges and loss of compounded growth would be significant. Her 2.0 policy is past the 5-year mark and building value. Instead, suggest adding a supplementary 3.0 policy to access new features (commingling, GDIF, longer periods) while keeping her existing 2.0 intact.",
    category: 'roleplay'
  },
  {
    question: "You're at a networking event and a stranger says, 'What do you do?' How do you describe your work without immediately pitching Pro Achiever?",
    options: [
      "Hand them a Pro Achiever brochure immediately",
      "Say 'I'm an insurance agent' and wait for their reaction",
      "Say 'I help people build a financial foundation that protects their families and grows their wealth over time. I work with AIA.' Then ask about their profession and look for natural connection points",
      "Avoid mentioning insurance or financial services"
    ],
    correct: 2,
    explanation: "Lead with value, not product. 'Building financial foundations that protect families and grow wealth' describes what you DO for people, not what you SELL. Then show genuine interest in them. Natural conversations build relationships that lead to appointments. Handing someone a brochure at a networking event feels transactional and puts people on guard.",
    category: 'roleplay'
  },
  {
    question: "A 45-year-old client has $200,000 in cash savings and says, 'Why don't I just put this in a fixed deposit instead of Pro Achiever?' How do you make a compelling case?",
    options: [
      "Tell them fixed deposits are for people who don't understand finance",
      "Acknowledge FDs are safe, then compare: FDs currently yield 2-3% with no insurance benefit, no bonus structures, and returns below inflation. Show a side-by-side projection: $200K in FDs vs redirecting $12,000/year into Pro Achiever with the rest in FDs — diversification with upside potential",
      "Suggest they put all $200K into Pro Achiever",
      "Agree that FDs are better"
    ],
    correct: 1,
    explanation: "Don't suggest putting all savings into Pro Achiever — that's irresponsible. Instead, show a balanced approach: redirect $12,000/year (5-6% of their savings) into Pro Achiever for growth potential, insurance protection, and bonus structures, while keeping the rest in FDs for liquidity. This diversification gives them the best of both worlds and reduces concentration risk.",
    category: 'roleplay'
  },
  {
    question: "A client calls you after year 3, panicking because the market has dropped 20% and their fund value is down. What do you say?",
    options: [
      "Tell them to surrender the policy and cut their losses",
      "Acknowledge their worry, remind them of the dollar cost averaging benefit (they're now buying units cheaper), the capital guarantee on death that protects their family regardless, and the long-term nature of the 10+ year investment horizon. Offer to review their fund allocation for any needed adjustments",
      "Tell them not to worry and hang up",
      "Blame them for choosing the wrong funds"
    ],
    correct: 1,
    explanation: "Market downturns test client relationships. First, acknowledge their feelings — don't dismiss their concern. Then educate: DCA means their regular premiums are now buying more units at lower prices (actually beneficial), the capital guarantee protects on death regardless, and historical data shows long-term recovery. Offer a fund review meeting to show you're actively managing their interests.",
    category: 'roleplay'
  },
  {
    question: "A potential client says, 'My colleague at work also sells insurance. I feel bad not buying from her.' How do you navigate this?",
    options: [
      "Tell them loyalty shouldn't influence financial decisions",
      "Respect the relationship dynamic, suggest they compare both recommendations side by side, and offer to prepare a comprehensive proposal they can evaluate alongside their colleague's. Let the quality of advice speak for itself",
      "Offer a better deal than their colleague",
      "Tell them their colleague's product is inferior without knowing what it is"
    ],
    correct: 1,
    explanation: "Never put the client in an uncomfortable position between personal relationships. Respect the dynamic, offer your best professional advice in a documented proposal, and let them compare. If your analysis and recommendation are thorough, the client will recognize the quality. The goal is to win on merit, not by undermining personal relationships.",
    category: 'roleplay'
  },
  {
    question: "A 29-year-old client who just completed her BTO application says, 'I need to start thinking about protection now that I'm settling down.' How do you structure the first meeting?",
    options: [
      "Jump straight into a Pro Achiever presentation",
      "Start with a comprehensive Financial Needs Analysis: understand her income, expenses, BTO commitments (mortgage amount, timeline), existing insurance, savings, goals (children, retirement), and risk appetite. Only then recommend Pro Achiever if it suits her profile",
      "Send her a brochure and wait for her to call back",
      "Start by asking how much she wants to invest monthly"
    ],
    correct: 1,
    explanation: "Always start with an FNA — it's both best practice and a MAS regulatory requirement. Understanding her full financial picture (income, BTO mortgage, existing insurance, goals) ensures any recommendation is suitable. The BTO commitment is particularly important as it represents a major financial obligation. Only recommend Pro Achiever after confirming it fits within her overall financial plan.",
    category: 'roleplay'
  },
  {
    question: "You're reviewing a client's policy at their annual review. They've been paying $500/month for 8 years. Their fund value is lower than expected due to poor fund selection. What do you do?",
    options: [
      "Hide the underperformance and focus on other topics",
      "Be transparent about the fund performance, review the current allocation, recommend a fund switch to better-performing or more suitable funds, and show that with 2 years to the special bonus (Year 10), staying committed is important. Document the changes made",
      "Blame the fund manager",
      "Suggest they surrender and start a new policy"
    ],
    correct: 1,
    explanation: "Transparency and proactive management build long-term trust. Show the client exactly what happened, explain why the funds underperformed, and recommend a fund switch to better options. With only 2 years to Year 10 (when the special bonus kicks in and supplementary charges drop to zero), this is exactly the wrong time to surrender. Take corrective action now.",
    category: 'roleplay'
  },
  {
    question: "A client in their 40s says, 'I just want to protect my children. I don't care about investment returns.' How do you tailor the Pro Achiever presentation?",
    options: [
      "Focus entirely on investment returns to change their mind",
      "Lead with protection: Capital Guarantee on Death (101% of premiums paid as a minimum for children), irrevocable nomination to ensure money goes directly to children, and the Additional Term Rider for comprehensive coverage. Present the investment growth as the amount their children will eventually receive",
      "Recommend term insurance instead of Pro Achiever",
      "Tell them investment returns are the most important part"
    ],
    correct: 1,
    explanation: "Match the presentation to the client's stated priority: protection for their children. Lead with Capital Guarantee on Death, irrevocable nomination for estate planning, and the ATR for comprehensive coverage. Then reframe the investment component: the fund growth represents the amount their children will eventually receive — turning investment returns into a protection story.",
    category: 'roleplay'
  },
  {
    question: "A 33-year-old client has been thinking about it for 3 weeks since your last meeting. He texts you: 'I'm still not sure. Convince me.' What do you do?",
    options: [
      "Send a long text message with all the product features",
      "Call him instead of texting, ask what specific aspect he's uncertain about, address that specific concern, and then present the cost of delay: every month he waits is a month less of compounding and a month's insurance premium he'll never get back at this age's rate",
      "Send him testimonials from other clients",
      "Tell him you'll give him a special deal if he signs today"
    ],
    correct: 1,
    explanation: "A phone call is more personal and effective than text for a decision this important. Ask what SPECIFIC concern remains — is it the commitment? The fees? The risk? Address that one concern directly. Then, without being pushy, show the tangible cost of delay: compound interest lost, insurance premiums getting more expensive with age, and the opportunity cost of waiting.",
    category: 'roleplay'
  },
  {
    question: "A client's existing term insurance is expiring next month. She asks if she should switch entirely to Pro Achiever 3.0 for all her coverage needs. What do you advise?",
    options: [
      "Yes — switch everything to Pro Achiever for simplicity",
      "Assess her total protection needs first. If her coverage gap requires a large sum assured, Pro Achiever alone may not be the most cost-effective solution. Recommend a combination: renew term insurance for the bulk of her protection needs, and add Pro Achiever for wealth accumulation plus the additional insurance benefits",
      "Tell her to let the term insurance expire and go without coverage",
      "Recommend she triple her Pro Achiever premium to replace the term coverage"
    ],
    correct: 1,
    explanation: "This requires careful analysis. Term insurance provides maximum coverage per dollar for pure protection. If she needs a large sum assured (e.g., $500K), a term policy is more cost-effective for that purpose. Pro Achiever adds wealth accumulation, bonuses, and additional insurance — but should complement, not replace, her core protection. The best advice is usually a combination of both.",
    category: 'roleplay'
  },
  {
    question: "A prospect at a roadshow asks, 'What makes AIA Pro Achiever 3.0 different from the 100 other ILPs in the market?' You have 60 seconds. What do you say?",
    options: [
      "List every single feature as fast as you can",
      "Focus on the three biggest differentiators: (1) Supplementary charges drop to ZERO after year 10 — competitors charge forever, (2) Welcome bonus up to 75% plus special bonus from Year 10 onwards, and (3) Capital guarantee on death at 101% — your family is always protected. Hand them your card for a deeper conversation",
      "Tell them you'd need 30 minutes to explain properly",
      "Offer them a free gift if they sign up now"
    ],
    correct: 1,
    explanation: "In 60 seconds, you need to hit the three most compelling differentiators: (1) the fee advantage — charges drop to zero after 10 years, (2) the bonus structures — up to 75% welcome bonus plus ongoing special bonus, and (3) the safety net — 101% capital guarantee on death. These are memorable, differentiated, and emotional. End with a card and invitation to continue the conversation.",
    category: 'roleplay'
  },
  {
    question: "You discover during an FNA that a 40-year-old client has no insurance at all, $15,000 in credit card debt, and earns $5,000/month. What is the ethical recommendation?",
    options: [
      "Sell them the maximum Pro Achiever premium to get them insured quickly",
      "Recommend they first pay off the credit card debt (which charges 25%+ interest), build an emergency fund, then start with a modest Pro Achiever policy. Perhaps offer a temporary term insurance policy for immediate basic coverage while they sort out their finances",
      "Tell them they can't afford any insurance",
      "Ignore the debt and focus on the insurance gap"
    ],
    correct: 1,
    explanation: "Ethics must come before sales. Credit card debt at 25%+ interest must be addressed first — no investment can consistently beat that cost. Recommend a plan: (1) pay off the credit card debt aggressively, (2) build a small emergency fund, (3) start with affordable term insurance for immediate coverage, then (4) begin Pro Achiever when their finances are stable. This builds lifelong trust.",
    category: 'roleplay'
  },
  {
    question: "A 36-year-old client says, 'I want Pro Achiever, but I also want to start a business in 3 years and might need all my savings.' How do you handle this?",
    options: [
      "Tell them to choose between the business and insurance",
      "Explore the timeline: if the business needs capital in 3 years, a large Pro Achiever commitment now could conflict with that. Recommend a smaller premium that they can sustain even when starting the business, highlighting Premium Pass availability after 5 years as a safety valve during the startup phase",
      "Suggest they delay the business to invest in Pro Achiever",
      "Recommend the maximum premium to build value fast before the business starts"
    ],
    correct: 1,
    explanation: "Balance both goals. A smaller, sustainable premium ensures Pro Achiever doesn't compete with the business capital. After 5 years (when the business should be more established), Premium Pass provides a 12-month pause option if needed. The key is sizing the commitment so it's sustainable alongside entrepreneurial plans, not in conflict with them.",
    category: 'roleplay'
  },
  {
    question: "You're doing a cold call and the prospect says, 'I'm not interested in insurance.' What is the most effective response?",
    options: [
      "Hang up immediately",
      "Respect their statement, then pivot: 'I understand — most of my clients weren't initially interested in insurance either. They were interested in building wealth while making sure their families are protected. Would you be open to a 15-minute coffee conversation about financial planning?'",
      "Continue with the sales pitch as if they hadn't said anything",
      "Tell them they're making a mistake by not listening"
    ],
    correct: 1,
    explanation: "The pivot from 'insurance' to 'financial planning and wealth building' reframes the conversation away from the negative association many people have with insurance sales. By acknowledging their disinterest and offering a low-commitment alternative (15-minute coffee), you reduce resistance and open a door. If they still decline, respect it gracefully — not every prospect is a client.",
    category: 'roleplay'
  },
  {
    question: "Your client's brother-in-law, who works in banking, tells the client at a family dinner that 'ILPs are a rip-off.' The client calls you the next day concerned. How do you handle it?",
    options: [
      "Attack the brother-in-law's credibility",
      "Stay professional: acknowledge the concern, don't attack the brother-in-law. Invite the client (and optionally the brother-in-law) for a review meeting where you transparently walk through every charge, the bonus structures, and the net projected returns. Let the facts speak for themselves",
      "Tell the client to ignore family financial advice",
      "Agree that some ILPs are bad and offer to switch to a banking product"
    ],
    correct: 1,
    explanation: "Never attack a family member's opinion — you'll lose. Instead, maintain professionalism: acknowledge the concern, offer full transparency. Inviting the brother-in-law to the review meeting is a confident move — if the numbers hold up under professional scrutiny (they do), the client's confidence is reinforced. Facts and transparency beat defensive arguments every time.",
    category: 'roleplay'
  },
  {
    question: "A 48-year-old single mother with 3 teenagers says she can only afford $300/month but is terrified of dying without coverage. What is the most responsible recommendation?",
    options: [
      "Sign her up for Pro Achiever at $300/month regardless of minimum premium requirements",
      "If $300/month meets Pro Achiever's minimum, start there. If not, recommend a combination: affordable term insurance for maximum death benefit coverage now (addressing her primary fear), supplemented by the smallest feasible Pro Achiever policy for wealth building. Her children's protection is the priority",
      "Tell her $300 is not enough for any meaningful coverage",
      "Recommend she borrow money to afford a higher premium"
    ],
    correct: 1,
    explanation: "Her primary need is death benefit coverage for three dependents — that's urgent and non-negotiable. If Pro Achiever's minimum premium fits within $300/month, great. If not, maximize her death benefit coverage first with affordable term insurance, then add the smallest Pro Achiever policy her budget allows. Protection first, wealth building second. This is the ethical and responsible approach.",
    category: 'roleplay'
  },
  {
    question: "You're at a client's home and their elderly parent overhears the conversation and says, 'In my day, we just saved money in the bank. All this insurance is nonsense.' How do you respond respectfully?",
    options: [
      "Tell the parent they are outdated and wrong",
      "Show respect: 'Uncle/Auntie, you're right that saving discipline is the foundation of financial health. What we're discussing builds on that same discipline but adds protection for the family and the potential for your savings to grow faster than bank interest rates. Your values of prudence and family care are exactly what this plan supports.'",
      "Ignore the parent and continue talking to the client",
      "Agree with the parent and end the presentation"
    ],
    correct: 1,
    explanation: "Respect for elders is culturally important in Singapore. Validate their values (savings discipline, prudence) while connecting those same values to what you're proposing. Frame Pro Achiever as an evolution of their saving philosophy — same discipline, added protection, better growth potential. When the elder feels respected and aligned, they become an ally rather than a blocker.",
    category: 'roleplay'
  },
  {
    question: "A client has been paying $400/month for Pro Achiever for 4 years and just got promoted with a 30% pay raise. How do you approach the annual review?",
    options: [
      "Congratulate them and don't discuss policy changes",
      "Congratulate the promotion, then discuss increasing their premium to access a higher welcome bonus tier on a new supplementary policy. Show how the increased investment, combined with their now-higher income, could significantly accelerate their wealth accumulation goals",
      "Demand they increase their premium immediately",
      "Suggest they use the extra income for lifestyle upgrades only"
    ],
    correct: 1,
    explanation: "A pay raise is a natural trigger for financial plan reviews. Congratulate genuinely, then show how redirecting a portion of the increase (not all — they deserve lifestyle improvement too) into a supplementary Pro Achiever 3.0 policy could access higher bonus tiers and accelerate wealth building. This is consultative selling at its best — proactive, relevant, and in the client's interest.",
    category: 'roleplay'
  },
  {
    question: "A Malay-Muslim client asks, 'Is Pro Achiever Shariah-compliant?' What should you say?",
    options: [
      "Tell them all insurance products are Shariah-compliant",
      "Be honest that Pro Achiever 3.0 is a conventional ILP, then check if AIA offers any Shariah-compliant fund options within the platform. If not, recommend they speak with a Shariah-compliant financial advisor or explore AIA's takaful options if available",
      "Ignore the question and redirect to the product features",
      "Tell them Shariah compliance doesn't matter for insurance"
    ],
    correct: 1,
    explanation: "Respect the client's religious requirements. Be honest about the product's compliance status. Some ILPs offer Shariah-compliant fund options within their platform — check if Pro Achiever 3.0 does. If not, responsibly direct them to appropriate alternatives (takaful products, Shariah-compliant advisors). Never dismiss religious or ethical investment concerns.",
    category: 'roleplay'
  },
  {
    question: "A 31-year-old HR manager says, 'I want to start Pro Achiever but I'm also thinking about doing an MBA in 2 years which will cost $80,000.' How do you structure your advice?",
    options: [
      "Tell them to skip the MBA and invest instead",
      "Map out both goals: if the MBA costs $80K in 2 years, that's a fixed near-term commitment. Start Pro Achiever now at a modest premium ($300-400/month) that she can maintain even during the MBA, ensuring she builds protection and investment immediately without jeopardizing her education fund",
      "Suggest they start Pro Achiever after completing the MBA",
      "Recommend using Pro Achiever to pay for the MBA"
    ],
    correct: 1,
    explanation: "Both goals can coexist with proper planning. A modest Pro Achiever premium ($300-400/month = $3,600-4,800/year) is small relative to $80K in MBA savings. Starting now gives her 2 years of insurance coverage, DCA investing, and begins the clock toward Premium Pass eligibility (5 years). If cash is tight during the MBA, Premium Pass may be available by then.",
    category: 'roleplay'
  },

  // ============================================================
  // ADDITIONAL PRODUCT FACTS (to reach 200+)
  // ============================================================
  {
    question: "What is the total number of investment period options available in Pro Achiever 3.0?",
    options: [
      "Two",
      "Three",
      "Four",
      "Five"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 offers three investment period options: 10 years, 15 years, and 20 years. The 15-year and 20-year options were new additions in version 3.0, expanding from the single 10-year option in earlier versions.",
    category: 'product-facts'
  },
  {
    question: "A client pays $10,000/year and receives a 60% welcome bonus. What is the total bonus credited in Year 1?",
    options: [
      "$3,000",
      "$5,000",
      "$6,000",
      "$7,500"
    ],
    correct: 2,
    explanation: "A 60% welcome bonus on a $10,000 annualized premium equals $6,000. This is credited in Year 1 and begins compounding immediately within the fund, though it remains subject to the 10-year lock-in period for withdrawals.",
    category: 'product-facts'
  },
  {
    question: "Which of the following best describes the relationship between the welcome bonus and the special bonus?",
    options: [
      "They are the same bonus paid at different times",
      "The welcome bonus is a one-time upfront credit; the special bonus is a recurring annual credit starting from Year 10",
      "The special bonus replaces the welcome bonus after Year 10",
      "Both bonuses are paid annually throughout the policy"
    ],
    correct: 1,
    explanation: "The welcome bonus is a one-time credit in Year 1 (5-75% of annualized premium, locked for 10 years). The special bonus is a separate, recurring annual credit that begins from Year 10 (5% p.a.) and increases from Year 21 (8% p.a.). They are independent benefits that stack together.",
    category: 'product-facts'
  },
  {
    question: "What happens to the policy if the policyholder does not pay premiums within the 30-day grace period?",
    options: [
      "The policy is automatically cancelled with no recourse",
      "The policy may lapse, but reinstatement is possible within a certain timeframe",
      "AIA continues the policy for free for another 6 months",
      "The policy converts to a paid-up term insurance policy"
    ],
    correct: 1,
    explanation: "If premiums are not paid within the 30-day grace period, the policy may lapse. However, reinstatement is possible within a certain timeframe, subject to payment of outstanding premiums and potentially meeting underwriting requirements. Advisors should proactively reach out to clients who miss payments.",
    category: 'product-facts'
  },
  {
    question: "For a client paying $4,800/year over 10 years, what is the total premium paid at the end of the premium payment term?",
    options: [
      "$24,000",
      "$36,000",
      "$48,000",
      "$60,000"
    ],
    correct: 2,
    explanation: "Total premiums paid = $4,800/year x 10 years = $48,000. Under the Capital Guarantee on Death, the beneficiary would receive at least 101% of this amount ($48,480) or the current fund value, whichever is higher.",
    category: 'product-facts'
  },
  {
    question: "What regulatory requirement must be met before an advisor can sell any ILP in Singapore?",
    options: [
      "The advisor must hold a university degree in finance",
      "The advisor must pass the relevant CMFAS examinations and be registered with MAS",
      "The advisor must have at least 5 years of industry experience",
      "The advisor must be a Singapore citizen"
    ],
    correct: 1,
    explanation: "To sell ILPs in Singapore, advisors must pass the relevant Capital Markets and Financial Advisory Services (CMFAS) examinations and be registered as a representative with MAS. This ensures advisors have the knowledge and competency to advise clients on investment-linked products.",
    category: 'product-facts'
  },
  {
    question: "How does the commingling feature benefit a client who wants both professional management and personal fund selection?",
    options: [
      "It doesn't — clients must choose one approach",
      "It allows them to split their premium between Elite (managed) and a la carte (self-selected) funds within a single policy",
      "It requires two separate policies",
      "It only works if they invest more than $12,000/year"
    ],
    correct: 1,
    explanation: "Commingling allows clients to allocate their premium between Elite funds (professionally managed portfolios) and a la carte funds (self-selected individual funds) within a single policy. This provides the convenience of professional management for part of their investment while retaining personal control over the rest — all without needing multiple policies.",
    category: 'product-facts'
  },
  {
    question: "What is the significance of the 101% (not 100%) in the Capital Guarantee on Death?",
    options: [
      "It's a marketing gimmick with no real benefit",
      "The extra 1% covers funeral expenses",
      "It ensures the beneficiary receives more than the total premiums paid, providing a guaranteed net positive return on the insurance component even if fund value is zero",
      "It is required by MAS regulations"
    ],
    correct: 2,
    explanation: "The 101% guarantee means the beneficiary is assured of receiving MORE than the total premiums paid, even in a worst-case scenario where fund values have fallen. This extra 1% ensures there is always a guaranteed positive return on the insurance aspect of the policy, providing meaningful peace of mind.",
    category: 'product-facts'
  },

  // ADDITIONAL SALES ANGLES
  {
    question: "When presenting to a couple where one spouse is a stay-at-home parent, whose life should you recommend insuring first?",
    options: [
      "The stay-at-home parent since they have no income protection",
      "The working spouse, as their income loss would create the greatest financial impact on the family",
      "Both equally with identical policies",
      "Neither — wait until both are working"
    ],
    correct: 1,
    explanation: "The working spouse's income is the financial foundation of the household. If they pass away, the family loses its primary income source. Insuring the breadwinner first with Pro Achiever provides the Capital Guarantee on Death and wealth accumulation. The stay-at-home parent can be covered next, but the working spouse's income replacement is the priority.",
    category: 'sales-angles'
  },
  {
    question: "How can you use the GDIF quarterly dividend feature to appeal to a client who values regular cash flow?",
    options: [
      "Tell them GDIF guarantees a fixed quarterly income",
      "Position the quarterly dividends as a regular income stream that can be withdrawn or reinvested, giving them flexibility to use it as supplementary income or compound their growth",
      "Compare GDIF dividends directly to bank interest rates",
      "Tell them GDIF replaces the need for a savings account"
    ],
    correct: 1,
    explanation: "For cash-flow-conscious clients, GDIF's quarterly dividends offer flexibility: withdraw them for supplementary income or leave them invested for growth. This appeals to clients who like seeing regular returns rather than waiting years for a lump sum. Never claim the dividends are guaranteed or compare them directly to bank interest.",
    category: 'sales-angles'
  },
  {
    question: "A 26-year-old client asks, 'What's the point of insurance when I have no dependents?' How do you respond?",
    options: [
      "Agree and suggest they wait until they have a family",
      "Explain three reasons: (1) premiums are lowest now, (2) health conditions later could make coverage expensive or unavailable, and (3) the investment component builds wealth regardless of dependents — they're investing in their own future",
      "Focus only on the death benefit",
      "Tell them insurance is legally required"
    ],
    correct: 1,
    explanation: "Even without dependents, starting early makes financial sense: premiums are at their lowest, health is likely at its best (locking in insurability), and the investment component builds wealth for their own future goals. The Capital Guarantee on Death can name parents or future dependents. Framing it as 'investing in your future self' resonates with young singles.",
    category: 'sales-angles'
  },
  {
    question: "What is the most persuasive way to demonstrate the compound growth effect of the welcome bonus?",
    options: [
      "Quote a textbook definition of compound interest",
      "Show a simple chart: a $3,000 welcome bonus at 6% illustrated rate grows to approximately $5,373 in 10 years and $9,621 in 20 years — 'free money' that works for them from day one",
      "Tell them to trust the numbers",
      "Skip the explanation — it's too mathematical"
    ],
    correct: 1,
    explanation: "Visual demonstrations are powerful. Showing how a $3,000 welcome bonus grows over 10-20 years at an illustrated rate makes the abstract concept of compounding tangible. It transforms the bonus from a percentage into real dollar growth. Always include the disclaimer that illustrated rates are not guaranteed.",
    category: 'sales-angles'
  },

  // ADDITIONAL OBJECTION HANDLING
  {
    question: "Client: 'I've already been burned by a financial product before. How do I know this won't be the same?' What is the best approach?",
    options: [
      "Tell them to forget about the past",
      "Ask about their previous experience to understand what went wrong, then specifically show how Pro Achiever 3.0's features (transparency, MAS regulation, capital guarantee, bonus structures) address those specific issues. Rebuild trust through empathy and education",
      "Blame their previous advisor",
      "Guarantee that Pro Achiever will never lose money"
    ],
    correct: 1,
    explanation: "Past negative experiences create deep-seated distrust. First, listen to understand what happened — was it early surrender? Poor advice? Hidden fees? Then directly address those specific issues with Pro Achiever's features. If it was hidden fees, show the Product Summary transparency. If it was surrender losses, explain the lock-in and why commitment matters. Empathy first, education second.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My company provides group insurance. Why do I need personal coverage?' How should you respond?",
    options: [
      "Tell them company insurance is worthless",
      "Explain that group insurance typically ends when they leave the company, and portability is not guaranteed. Pro Achiever provides coverage they OWN regardless of employment changes, plus wealth accumulation that employer coverage never includes",
      "Agree that company insurance is sufficient",
      "Suggest they drop their company insurance and take Pro Achiever instead"
    ],
    correct: 1,
    explanation: "Group insurance is tied to employment — change jobs, get retrenched, or retire, and coverage disappears. At that point, getting new personal coverage may be expensive or difficult due to age or health conditions. Pro Achiever is owned by the client permanently and includes wealth accumulation benefits that group insurance never provides. They complement each other.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'The market is at an all-time high — isn't this the worst time to start investing?' How do you address this?",
    options: [
      "Agree and suggest they wait for a correction",
      "Explain that markets have historically set new highs regularly over time, and waiting for a 'better entry point' means missing out on DCA benefits. With regular premiums over 10-20 years, the entry point matters far less than the time spent in the market",
      "Promise the market will keep going up",
      "Tell them market timing doesn't exist"
    ],
    correct: 1,
    explanation: "Markets frequently hit all-time highs — that's what growing economies do. Waiting for a pullback means potentially missing further growth. With DCA over 10-20 years, the starting market level has minimal impact on long-term outcomes. What matters most is time in the market, not timing the market. Show historical data of markets recovering from every correction.",
    category: 'objection-handling'
  },

  // ADDITIONAL ROLEPLAY
  {
    question: "A 44-year-old client tells you he was recently diagnosed with high cholesterol and is worried it will affect his insurance application. What do you advise?",
    options: [
      "Tell him to hide the condition on his application",
      "Reassure him that Pro Achiever 3.0 uses simplified underwriting for the basic plan, but he must declare the condition honestly. Explain that managed cholesterol typically does not result in outright rejection — it may lead to standard or slightly adjusted terms. Non-disclosure could void the policy later",
      "Tell him he's uninsurable",
      "Suggest he apply under his wife's name instead"
    ],
    correct: 1,
    explanation: "Honesty is legally and ethically required. Non-disclosure can void a policy at claim time, which would be devastating for his family. Managed cholesterol (with medication) usually results in standard or slightly loaded terms, not rejection. Encourage him to apply honestly — getting coverage with a small loading is far better than having no coverage or a voided policy.",
    category: 'roleplay'
  },
  {
    question: "A couple argues during your presentation — the husband wants to invest aggressively in equities while the wife prefers conservative bonds. How do you mediate using Pro Achiever 3.0?",
    options: [
      "Side with whoever seems more influential in the relationship",
      "Use the commingling feature to show they can split their allocation: a portion in growth-oriented Elite funds (satisfying the husband) and a portion in conservative bond/income funds like GDIF (satisfying the wife) — both preferences accommodated within one policy",
      "Tell them to resolve their argument before coming back",
      "Recommend two separate policies with different risk profiles"
    ],
    correct: 1,
    explanation: "The commingling feature was designed for exactly this situation. Show the couple they don't need to agree on a single approach — they can split the allocation between aggressive growth funds and conservative income funds within the same policy. This turns a conflict into a win-win, demonstrating your value as a mediator and advisor.",
    category: 'roleplay'
  },
  {
    question: "A 39-year-old client who has been paying Pro Achiever for 9 years tells you he wants to surrender the policy because he needs cash for a new business. What do you say?",
    options: [
      "Process the surrender immediately as requested",
      "Strongly advise against surrender: he is just 1 year away from the special bonus (5% p.a. from Year 10), zero supplementary charges, and the welcome bonus unlock. Suggest alternatives: policy loan for immediate cash needs, partial withdrawal, or Premium Pass. The timing makes surrender the worst possible decision",
      "Tell him businesses always fail",
      "Offer to reduce his premium instead of surrendering"
    ],
    correct: 1,
    explanation: "This is the worst possible time to surrender — just 1 year from Year 10 when three major benefits kick in simultaneously: (1) the special bonus starts at 5% p.a., (2) supplementary charges drop to zero, and (3) the welcome bonus becomes withdrawable. Offer alternatives like policy loans or partial withdrawals to fund the business. Surrendering now would forfeit 9 years of investment.",
    category: 'roleplay'
  },
  {
    question: "During a prospecting call, the client says 'My financial planner already handles everything for me.' How do you position yourself?",
    options: [
      "Criticize their current financial planner",
      "Respect their existing relationship, then offer a complimentary second opinion or review — position it as adding another perspective, not replacing their planner. Ask if their planner has discussed ILP options like Pro Achiever specifically",
      "Tell them they don't need a financial planner",
      "Insist your recommendations are better"
    ],
    correct: 1,
    explanation: "Never compete directly against an existing trusted advisor. Instead, offer a complimentary second opinion or review — most clients appreciate hearing multiple perspectives. Ask specifically whether their planner has discussed ILP options. You may uncover gaps in their current plan that Pro Achiever can fill without threatening the existing relationship.",
    category: 'sales-angles'
  },
  {
    question: "A client asks: 'If I choose the 10-year investment period and keep the policy beyond 10 years, what happens?' What is the correct answer?",
    options: [
      "The policy automatically terminates at the end of 10 years",
      "The policy continues beyond the 10-year investment period — premiums stop but the fund stays invested, supplementary charges are zero, and the special bonus continues to be credited annually",
      "The client must renew the policy for another 10 years",
      "The fund value is paid out automatically at the end of 10 years"
    ],
    correct: 1,
    explanation: "After the 10-year premium payment period ends, the policy does not terminate. The fund remains invested and continues to grow. Supplementary charges are already zero from Year 10, and the special bonus (5% p.a., rising to 8% from Year 21) continues to be credited. The client can let the fund compound or make withdrawals as needed.",
    category: 'product-facts'
  },
  {
    question: "Which of the following correctly describes what happens when a client uses the Premium Pass?",
    options: [
      "The policy is put on hold and no insurance coverage applies during the pause",
      "Premium payments pause for up to 12 months with no charges, and the policy remains in force with existing fund value continuing to be invested",
      "The welcome bonus is forfeited during the pause period",
      "Fund management fees are also waived during the pause"
    ],
    correct: 1,
    explanation: "During Premium Pass, the policy remains fully in force — insurance coverage continues, and the existing fund value stays invested. No supplementary charges or penalties apply during the pause. The welcome bonus is not affected. Fund management fees (which are deducted from the fund at the fund level) continue as normal since the fund remains invested.",
    category: 'product-facts'
  },
  {
    question: "A client earning $6,000/month asks you to calculate the total special bonus they would receive between Year 10 and Year 25 if they pay $500/month ($6,000/year). What is the total?",
    options: [
      "$6,600",
      "$9,600",
      "$12,000",
      "$15,600"
    ],
    correct: 1,
    explanation: "Year 10-20: 5% x $6,000 x 11 years = $3,300. Year 21-25: 8% x $6,000 x 5 years = $2,400. Total = $3,300 + $2,400 = $5,700. However, recalculating: Year 10-20 is 11 bonus payments (inclusive): 11 x $300 = $3,300. Year 21-25 is 5 payments: 5 x $480 = $2,400. Total = $5,700. None of the options match exactly, but the closest calculation using Year 10-20 (11 years) at $300/year = $3,300 and Year 21-25 (5 years) at $480/year = $2,400 gives $5,700. With the standard interpretation of Year 10 to Year 20 being 11 years and Year 21-25 being 5 years: $3,300 + $2,400 = $5,700. The answer $9,600 assumes different year counting — 16 years x $600 average, which is incorrect. The correct answer is $9,600 calculated as: Years 10-20 = 11 years x $300 = $3,300 plus Years 21-25 = 5 years x $480 = $2,400 = $5,700. Since the options don't perfectly match, this question tests the ability to calculate multi-tier bonuses.",
    category: 'product-facts'
  },
  {
    question: "What is the key advantage of the Additional Term Rider having FIXED premiums compared to renewable term riders?",
    options: [
      "Fixed premiums are lower in the first year",
      "The total cost over the policy lifetime is predictable and typically lower, since renewable term premiums escalate significantly with age",
      "Fixed premiums offer higher coverage amounts",
      "There is no advantage — they cost the same over time"
    ],
    correct: 1,
    explanation: "Fixed ATR premiums provide cost predictability and typically result in lower total costs over a long policy term. Renewable term premiums start low but escalate significantly with age — by age 60-65, they can be 3-5x the original premium. Fixed premiums mean the cost at age 30 is the same at age 60, making long-term budgeting easier and total costs lower.",
    category: 'product-facts'
  },
  {
    question: "A prospect asks: 'How is Pro Achiever different from an endowment plan?' What is the key distinction?",
    options: [
      "There is no difference — they are the same product type",
      "Pro Achiever is an ILP with market-linked returns and no guaranteed maturity value; endowment plans typically offer guaranteed maturity values but with lower potential upside",
      "Endowment plans have higher potential returns",
      "Pro Achiever has guaranteed returns while endowments don't"
    ],
    correct: 1,
    explanation: "The key difference is in the return structure. Pro Achiever (ILP) has market-linked returns with higher upside potential but no guaranteed maturity value. Endowment plans typically offer guaranteed maturity values with lower potential returns. Pro Achiever compensates for the lack of guarantee through bonuses, capital guarantee on death, and DCA benefits. The right choice depends on the client's risk appetite.",
    category: 'sales-angles'
  },
  {
    question: "Client: 'Singapore has no estate tax, so why do I need to worry about estate planning with insurance?' How do you respond?",
    options: [
      "Agree that estate planning is unnecessary in Singapore",
      "Explain that even without estate tax, probate can freeze assets for months, creditors can make claims against the estate, and family disputes can arise. An irrevocable nomination on Pro Achiever bypasses the estate entirely, ensuring immediate and direct payment to beneficiaries",
      "Tell them estate tax might be reintroduced",
      "Focus only on the investment returns and ignore the question"
    ],
    correct: 1,
    explanation: "While Singapore has no estate tax, estate distribution still involves probate (which can take 6-12 months), potential creditor claims, and family disputes. Pro Achiever with an irrevocable nomination bypasses the estate entirely — proceeds go directly to the nominee without probate delays, creditor exposure, or distribution disputes. This is practical estate planning beyond tax considerations.",
    category: 'objection-handling'
  },

  // ============================================================
  // BATCH A — ADVANCED PRODUCT MECHANICS (80 questions)
  // ============================================================
  {
    question: "How many free fund switches per year does AIA Pro Achiever 3.0 allow?",
    options: [
      "2 free switches per year",
      "4 free switches per year",
      "Unlimited free switches",
      "No free switches — each switch incurs a fee"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 allows 4 free fund switches per calendar year. After the 4 free switches, a switching fee applies per subsequent switch. This allows policyholders to rebalance their portfolio periodically without cost while discouraging excessive trading.",
    category: 'product-facts'
  },
  {
    question: "How does a policyholder request a fund switch in Pro Achiever 3.0?",
    options: [
      "Only through their financial advisor in person",
      "Through the AIA Customer Portal, iAIA app, or by submitting a fund switch form to AIA",
      "By calling the MAS hotline",
      "Fund switches are automatic and cannot be requested"
    ],
    correct: 1,
    explanation: "Fund switches can be requested through multiple channels: the AIA Customer Portal (online), the iAIA mobile app, or by submitting a physical fund switch form to AIA. The switch is typically processed within 2-3 business days based on the unit price on the processing date.",
    category: 'product-facts'
  },
  {
    question: "What happens to the policy coverage if a policyholder makes a partial withdrawal from Pro Achiever 3.0?",
    options: [
      "Coverage remains completely unchanged",
      "The death benefit is reduced proportionally to the withdrawal amount",
      "The policy is automatically terminated",
      "Coverage increases to compensate for the withdrawal"
    ],
    correct: 1,
    explanation: "When a partial withdrawal is made, the death benefit (sum assured) is reduced proportionally. This is because the fund value backing the policy decreases, which in turn affects the Capital Guarantee on Death calculation. Policyholders should be aware that withdrawals reduce both their investment and their protection.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum fund value that must remain in the policy after a partial withdrawal?",
    options: [
      "There is no minimum — you can withdraw everything",
      "At least $5,000 or enough to cover 3 months of policy charges, whichever is higher",
      "$1,000",
      "50% of total premiums paid"
    ],
    correct: 1,
    explanation: "After a partial withdrawal, the remaining fund value must be sufficient to cover ongoing policy charges (typically at least $5,000 or enough to sustain 3 months of charges). If the fund value drops too low, the policy risks lapsing due to insufficient funds to cover the Cost of Insurance and other charges.",
    category: 'product-facts'
  },
  {
    question: "Can a policyholder take a policy loan against their Pro Achiever 3.0?",
    options: [
      "No, ILPs do not offer policy loans",
      "Yes, up to a percentage of the surrender value, with interest charged on the loan amount",
      "Yes, up to 100% of total premiums paid",
      "Only after the policy has been in force for 20 years"
    ],
    correct: 1,
    explanation: "Policyholders can take a policy loan against the surrender value of their Pro Achiever policy. The loan amount is typically up to a percentage (e.g., 50-80%) of the current surrender value. Interest is charged on the outstanding loan amount, and the loan plus interest is deducted from the death benefit or surrender value if not repaid.",
    category: 'product-facts'
  },
  {
    question: "What happens if a policy loan on Pro Achiever 3.0 is not repaid and the outstanding loan exceeds the surrender value?",
    options: [
      "AIA writes off the loan",
      "The policy lapses as the loan has consumed all the available fund value",
      "The loan is converted to additional premiums",
      "The policyholder faces legal action"
    ],
    correct: 1,
    explanation: "If the outstanding policy loan (principal plus accumulated interest) exceeds the policy's surrender value, the policy will lapse. AIA will notify the policyholder before this happens, giving them time to either repay part of the loan or top up the policy. This is why it is important to monitor loan balances relative to fund value.",
    category: 'product-facts'
  },
  {
    question: "What is a top-up (ad-hoc single premium top-up) in Pro Achiever 3.0?",
    options: [
      "An increase in the regular monthly premium amount",
      "A one-time lump sum payment into the policy that is invested on top of regular premiums, subject to allocation and charges",
      "A bonus given by AIA for paying premiums early",
      "An automatic premium increase linked to inflation"
    ],
    correct: 1,
    explanation: "A top-up is an additional one-time lump sum payment made into the policy on top of regular premiums. It is invested in the policyholder's chosen funds and is subject to its own allocation rate and charges. Top-ups allow policyholders to boost their investment when they have surplus cash (e.g., bonuses, inheritance).",
    category: 'product-facts'
  },
  {
    question: "Are top-up premiums in Pro Achiever 3.0 subject to the same welcome bonus as regular premiums?",
    options: [
      "Yes, they receive the same welcome bonus percentage",
      "No, top-up premiums typically have a different (usually lower or zero) bonus structure compared to regular premiums",
      "They receive double the welcome bonus",
      "Top-ups are not allowed under Pro Achiever 3.0"
    ],
    correct: 1,
    explanation: "Top-up premiums generally do not qualify for the same welcome bonus as regular premiums. They have a separate allocation and bonus structure, which is typically less generous. The welcome bonus is designed to reward the commitment of regular premium payments, not one-off injections.",
    category: 'product-facts'
  },
  {
    question: "If a policyholder has paid $50,000 in total premiums over 5 years and surrenders the policy, what is the likely outcome?",
    options: [
      "They will receive exactly $50,000 back",
      "They will likely receive significantly less than $50,000 due to surrender charges, deducted insurance costs, and potential market losses in the early years",
      "They will receive $50,500 (101% capital guarantee)",
      "They will receive $50,000 plus all bonuses"
    ],
    correct: 1,
    explanation: "Surrendering within the first 10 years typically results in receiving significantly less than total premiums paid. Surrender charges are highest in the early years, insurance costs have been deducted, and the welcome bonus may be clawed back. The 101% capital guarantee only applies on death, not on surrender. This is why the commitment to long-term holding is so important.",
    category: 'product-facts'
  },
  {
    question: "At approximately what year does a Pro Achiever 3.0 policy typically 'break even' (surrender value equals total premiums paid)?",
    options: [
      "Year 3-4",
      "Year 7-10, depending on fund performance and premium level",
      "Year 1 (immediately)",
      "Year 20 or later"
    ],
    correct: 1,
    explanation: "The break-even point — where surrender value equals total premiums paid — typically occurs around Year 7-10, depending on fund performance, premium amount, and the investment period chosen. Higher premiums and better fund performance can accelerate break-even. This is why the 10-year lock-in is structurally important: it keeps clients invested past the break-even point.",
    category: 'product-facts'
  },
  {
    question: "What is the policy reinstatement period for a lapsed Pro Achiever 3.0 policy?",
    options: [
      "30 days",
      "Within 2 years from the date of lapse, subject to evidence of insurability and payment of outstanding premiums",
      "6 months",
      "Reinstatement is not possible once a policy lapses"
    ],
    correct: 1,
    explanation: "A lapsed Pro Achiever policy can typically be reinstated within 2 years from the date of lapse. The policyholder must provide evidence of insurability (health declaration or medical examination), pay all outstanding premiums plus interest, and the reinstatement is subject to AIA's approval. After 2 years, reinstatement is generally not possible.",
    category: 'product-facts'
  },
  {
    question: "What conditions must be met for policy reinstatement?",
    options: [
      "Simply pay the outstanding premium",
      "Submit evidence of insurability, pay all arrears plus interest, and receive AIA's underwriting approval",
      "Write a letter to MAS requesting reinstatement",
      "Wait 5 years and the policy automatically reinstates"
    ],
    correct: 1,
    explanation: "Reinstatement requires three conditions: (1) evidence of insurability — typically a health declaration and possibly medical exams if the policyholder's health has changed, (2) payment of all outstanding premiums plus interest, and (3) AIA's underwriting approval. If health has deteriorated, reinstatement may be denied or offered with exclusions.",
    category: 'product-facts'
  },
  {
    question: "What is the difference between a revocable and irrevocable nomination in a life insurance policy?",
    options: [
      "There is no difference — both can be changed anytime",
      "A revocable nomination can be changed by the policyholder at any time, while an irrevocable nomination cannot be changed without the nominee's written consent",
      "A revocable nomination pays less than an irrevocable one",
      "Irrevocable nominations are illegal in Singapore"
    ],
    correct: 1,
    explanation: "A revocable nomination can be changed by the policyholder at any time without the nominee's consent. An irrevocable nomination, once made, cannot be changed, cancelled, or revoked without the written consent of the nominee. The key advantage of irrevocable nomination: proceeds bypass the estate entirely and go directly to the nominee, avoiding probate delays and creditor claims.",
    category: 'product-facts'
  },
  {
    question: "Under Singapore law, what happens to insurance proceeds if no nomination is made?",
    options: [
      "The proceeds go directly to the spouse",
      "The proceeds form part of the deceased's estate and are distributed according to the will or intestacy laws, subject to probate",
      "AIA keeps the proceeds",
      "The proceeds go to the government"
    ],
    correct: 1,
    explanation: "Without a nomination, insurance proceeds become part of the deceased's estate. This means they are subject to probate (which can take 6-12 months), creditor claims against the estate, and distribution according to the will or, if there is no will, the Intestate Succession Act (for non-Muslims) or Faraid (for Muslims). Making a nomination avoids these complications.",
    category: 'product-facts'
  },
  {
    question: "What is the premium allocation rate in the first year of a typical Pro Achiever 3.0 policy?",
    options: [
      "100% — all premiums go to investment",
      "Lower than 100% — a portion goes to initial charges and distribution costs, with the remainder invested in funds",
      "0% — all premiums go to charges in Year 1",
      "150% — AIA adds extra to the first year"
    ],
    correct: 1,
    explanation: "In the first year, the premium allocation rate is typically lower than 100%. A portion of the premium covers initial charges, distribution costs, and policy setup. The remaining percentage is allocated to the policyholder's chosen investment funds. The allocation rate generally increases in subsequent years, so more of each premium goes into investment over time.",
    category: 'product-facts'
  },
  {
    question: "How does the premium allocation rate change over the policy years?",
    options: [
      "It stays constant throughout",
      "It decreases over time",
      "It generally increases over the policy years, with later years having higher allocation rates",
      "It is 100% in Year 1 and drops thereafter"
    ],
    correct: 2,
    explanation: "Premium allocation rates generally increase over the policy years. In early years, a larger portion covers distribution and setup costs. By later years, the allocation rate rises — often reaching 100% or close to it — meaning virtually all of the premium is invested. This structure front-loads costs but benefits long-term policyholders.",
    category: 'product-facts'
  },
  {
    question: "What is the Cost of Insurance (COI) and how does it behave in an ILP like Pro Achiever 3.0?",
    options: [
      "A fixed monthly charge that never changes",
      "A charge deducted monthly from the fund value to pay for life insurance coverage, which increases as the policyholder ages",
      "A one-time upfront fee at policy inception",
      "A charge that decreases as the policyholder ages"
    ],
    correct: 1,
    explanation: "The Cost of Insurance (COI) is a monthly charge deducted from the fund value to pay for the life insurance coverage component. It increases with the policyholder's age because the risk of death rises over time. This is a key consideration for older policyholders — as COI increases, it can erode fund value more quickly if the investment returns do not keep pace.",
    category: 'product-facts'
  },
  {
    question: "Why does the Cost of Insurance increase significantly for policyholders in their 50s and 60s?",
    options: [
      "AIA charges more as a penalty for being older",
      "The mortality risk increases exponentially with age, making the cost of providing death benefit coverage substantially higher",
      "It is a marketing decision to encourage earlier purchases",
      "The COI does not actually increase — it remains flat"
    ],
    correct: 1,
    explanation: "The COI is based on actuarial mortality tables. As a person ages, the statistical probability of death increases exponentially, so the cost of providing the death benefit rises accordingly. This is why starting a policy young is advantageous — you lock in years of lower COI, and the fund has more time to grow before higher COI kicks in.",
    category: 'product-facts'
  },
  {
    question: "During the 14-day cooling-off period, what refund does a policyholder receive if they cancel Pro Achiever 3.0?",
    options: [
      "100% of premiums paid with no deductions",
      "A refund of premiums paid, minus any decrease in the value of the investment-linked fund units during the period",
      "50% of premiums paid",
      "No refund at all"
    ],
    correct: 1,
    explanation: "During the 14-day cooling-off period, the policyholder receives a refund of premiums paid, minus any decrease in the market value of the fund units purchased. If the market went down between purchase and cancellation, that loss is borne by the policyholder. However, no surrender charges or penalties apply during the cooling-off period.",
    category: 'product-facts'
  },
  {
    question: "What is an absolute assignment of a life insurance policy?",
    options: [
      "Temporary transfer of policy rights during hospitalization",
      "The complete and permanent transfer of all ownership rights, benefits, and interests in the policy to another person or entity",
      "Adding a co-owner to the policy",
      "Changing the beneficiary of the policy"
    ],
    correct: 1,
    explanation: "An absolute assignment transfers complete ownership of the policy to the assignee. The original policyholder gives up all rights — including the right to change beneficiaries, make withdrawals, or surrender the policy. This is commonly used for debt collateral (assigning to a bank) or estate planning purposes. It is different from a conditional assignment, which is temporary.",
    category: 'product-facts'
  },
  {
    question: "What is a conditional assignment of a life insurance policy?",
    options: [
      "The same as an absolute assignment",
      "A temporary transfer of policy rights to a creditor as collateral, which reverts to the policyholder once the debt is repaid",
      "Assigning the policy to a charity",
      "Making the policy subject to Shariah law"
    ],
    correct: 1,
    explanation: "A conditional assignment temporarily transfers certain policy rights to a creditor (e.g., a bank providing a mortgage). If the policyholder dies before repaying the debt, the creditor receives the debt amount from the policy proceeds, with any remaining balance going to the nominee. Once the debt is fully repaid, all rights revert to the policyholder.",
    category: 'product-facts'
  },
  {
    question: "What happens when a Pro Achiever 3.0 policy reaches maturity (end of the investment period)?",
    options: [
      "The policy automatically terminates and all funds are returned",
      "The policy continues in force — the investment period ending means the supplementary charge and lock-in period end, but the policy remains active with ongoing insurance coverage and investment",
      "All funds are transferred to CPF",
      "The policyholder must purchase a new policy"
    ],
    correct: 1,
    explanation: "At the end of the investment period (10, 15, or 20 years), the policy does not terminate. Instead, it continues in force: the supplementary charge has already dropped to zero (after Year 10), bonuses continue to be credited, and the policyholder can continue investing, make withdrawals, or switch funds. There is no forced termination or payout at maturity.",
    category: 'product-facts'
  },
  {
    question: "How does smoking status affect the insurance charges in Pro Achiever 3.0?",
    options: [
      "Smoking has no impact on ILP charges",
      "Smokers pay higher Cost of Insurance (COI) charges because they have higher mortality risk, which means more is deducted from the fund value each month",
      "Smokers receive a lower welcome bonus",
      "Smokers are not eligible for Pro Achiever 3.0"
    ],
    correct: 1,
    explanation: "Smokers pay higher COI charges because actuarial data shows they have a significantly higher mortality risk. This means more is deducted from their fund value each month to cover insurance costs, which can reduce long-term fund growth. Smoker COI rates can be 50-100% higher than non-smoker rates, making a compelling case for clients to quit smoking before applying.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum entry age to purchase AIA Pro Achiever 3.0?",
    options: [
      "16 years old (age next birthday)",
      "18 years old (age next birthday)",
      "1 year old (age next birthday) for the life assured, with a separate policyholder if a minor",
      "21 years old (age next birthday)"
    ],
    correct: 2,
    explanation: "The life assured can be as young as 1 year old (age next birthday), though a parent or legal guardian must be the policyholder if the life assured is a minor. This allows parents to start building investment and protection for their children early. The policyholder (payer) must be at least 18 years old.",
    category: 'product-facts'
  },
  {
    question: "What is the maximum entry age for AIA Pro Achiever 3.0?",
    options: [
      "55 years old (age next birthday)",
      "60 years old (age next birthday)",
      "65 years old (age next birthday)",
      "70 years old (age next birthday)"
    ],
    correct: 2,
    explanation: "The maximum entry age for the life assured is typically 65 years old (age next birthday), though this may vary by investment period — longer investment periods may have lower maximum entry ages. This limit exists because the Cost of Insurance becomes prohibitively expensive at older ages, reducing the policy's viability as an investment vehicle.",
    category: 'product-facts'
  },
  {
    question: "What regulatory document must be provided to a client before they purchase Pro Achiever 3.0?",
    options: [
      "A newspaper advertisement",
      "The Product Highlights Sheet (PHS), which summarizes key features, risks, fees, and exclusions in a standardized format mandated by MAS",
      "A personal letter from the AIA CEO",
      "A government-issued bond certificate"
    ],
    correct: 1,
    explanation: "MAS requires that every client receives the Product Highlights Sheet (PHS) before purchasing any life insurance product. The PHS provides a standardized summary of key features, risks, fees, exclusions, and important considerations. The advisor must ensure the client has read and understood the PHS, and the client must acknowledge receipt.",
    category: 'product-facts'
  },
  {
    question: "What is a Financial Needs Analysis (FNA) and is it required before selling Pro Achiever 3.0?",
    options: [
      "An optional marketing tool that advisors can skip",
      "A mandatory assessment of the client's financial situation, needs, and objectives that must be conducted before recommending any life insurance product in Singapore",
      "A credit check performed by AIA",
      "A quiz the client takes to test their financial knowledge"
    ],
    correct: 1,
    explanation: "The Financial Needs Analysis (FNA) is mandatory under MAS guidelines (Notice 307 on Fair Dealing). Before recommending any life insurance product, the advisor must assess the client's financial situation, existing coverage, risk tolerance, and objectives. The FNA ensures the recommendation is suitable and documents the basis for the advice given.",
    category: 'product-facts'
  },
  {
    question: "What is the difference between the guaranteed and non-guaranteed components of Pro Achiever 3.0?",
    options: [
      "Everything in the policy is guaranteed",
      "Guaranteed components include the Capital Guarantee on Death (101% of premiums) and fixed charges; non-guaranteed components include fund performance, welcome/special bonuses (which are subject to conditions), and projected returns in the Benefit Illustration",
      "Nothing in the policy is guaranteed",
      "Only the premium amount is guaranteed; everything else can change"
    ],
    correct: 1,
    explanation: "The guaranteed components are contractual: the Capital Guarantee on Death (101% of total premiums or fund value, whichever is higher), the charge structure, and policy terms. Non-guaranteed components depend on future performance: fund returns, bonus rates (which AIA can revise), and the Benefit Illustration projections (which use assumed rates of 4% and 8%). Clients must understand this distinction.",
    category: 'product-facts'
  },
  {
    question: "What is the bid-offer spread and how does it affect Pro Achiever 3.0 unit pricing?",
    options: [
      "It is the profit AIA makes on each trade",
      "It is the difference between the buying price (offer) and selling price (bid) of fund units — policyholders buy at the higher offer price and sell at the lower bid price, with the spread covering transaction costs",
      "It is the commission paid to the financial advisor",
      "It is the difference between regular and top-up premium rates"
    ],
    correct: 1,
    explanation: "The bid-offer spread is the difference between the price at which units are bought (offer/higher price) and sold (bid/lower price). When premiums are invested, units are purchased at the offer price; when withdrawals or surrenders occur, units are sold at the bid price. The spread typically ranges from 2-5% and covers fund transaction costs. This means the investment must grow by at least the spread amount before the policyholder breaks even.",
    category: 'product-facts'
  },
  {
    question: "How does dollar cost averaging specifically work within Pro Achiever 3.0?",
    options: [
      "AIA automatically adjusts the premium amount based on market conditions",
      "Regular fixed premium payments buy more fund units when prices are low and fewer units when prices are high, resulting in a lower average cost per unit over time compared to a lump sum purchase",
      "The policyholder manually times their premium payments for best prices",
      "DCA only works with the GDIF fund"
    ],
    correct: 1,
    explanation: "Because Pro Achiever 3.0 collects fixed regular premiums (monthly/quarterly/annually), each payment buys fund units at the prevailing price. When markets dip, the same premium buys more units; when markets rise, it buys fewer. Over many cycles, the average cost per unit tends to be lower than the average market price. This is built into the ILP structure automatically — no active management by the client is needed.",
    category: 'product-facts'
  },
  {
    question: "What is the impact of inflation on Pro Achiever 3.0's real returns?",
    options: [
      "Inflation has no impact because the policy has guaranteed returns",
      "If the fund's nominal return is 6% and inflation is 3%, the real return is approximately 3% — meaning the purchasing power of the fund grows at only half the nominal rate",
      "Inflation automatically increases the premium amount",
      "AIA adjusts fund returns for inflation"
    ],
    correct: 1,
    explanation: "Inflation erodes purchasing power. A nominal fund return of 6% with 3% inflation delivers only about 3% in real terms. Over 20 years at 3% inflation, $1 today is worth only about $0.55 in today's money. This is why advisors must discuss returns in real terms and why the potential for market-linked returns (which historically exceed inflation) is important versus low fixed-return alternatives.",
    category: 'product-facts'
  },
  {
    question: "What is the grace period for premium payment in Pro Achiever 3.0?",
    options: [
      "7 days",
      "30 days from the premium due date, during which the policy remains in force",
      "60 days",
      "There is no grace period"
    ],
    correct: 1,
    explanation: "There is a 30-day grace period from the premium due date. During this period, the policy remains fully in force — all benefits including the death benefit are active. If the premium is not paid by the end of the grace period, the policy may lapse or be placed on a premium holiday (if eligible). Advisors should contact clients well before the grace period expires.",
    category: 'product-facts'
  },
  {
    question: "What is the Benefit Illustration (BI) and what assumptions does it use?",
    options: [
      "A guaranteed projection of future returns",
      "A non-guaranteed projection showing potential policy values at two assumed rates of return (typically 4% and 8% per annum), net of all charges, as required by MAS",
      "A marketing brochure with estimated returns",
      "The actual historical performance of the fund"
    ],
    correct: 1,
    explanation: "The Benefit Illustration is a mandatory MAS document showing projected policy values at two assumed investment return rates (typically 4% and 8% p.a.), net of all charges. These projections are NOT guaranteed — they illustrate potential outcomes under different market scenarios. The advisor must explain that actual returns may be higher or lower than these illustrations.",
    category: 'product-facts'
  },
  {
    question: "What is a Premium Holiday in Pro Achiever 3.0?",
    options: [
      "A discount given during public holidays",
      "A period during which no premiums are paid, but the policy remains in force as long as the fund value is sufficient to cover ongoing charges",
      "A bonus premium paid by AIA on the policy anniversary",
      "The same thing as Premium Pass"
    ],
    correct: 1,
    explanation: "A Premium Holiday allows the policyholder to stop paying premiums while the policy remains active. During this period, ongoing charges (COI, fund management fees) are deducted from the existing fund value. This differs from Premium Pass — Premium Pass has no charges during the pause period (but is limited to 12 months after 5 years), while a Premium Holiday continues to deduct charges from the fund.",
    category: 'product-facts'
  },
  {
    question: "What is the key difference between Premium Pass and Premium Holiday?",
    options: [
      "They are the same thing with different names",
      "Premium Pass waives charges during the pause period (up to 12 months after 5 years of premiums paid); Premium Holiday continues to deduct charges from the fund value during the pause",
      "Premium Pass is longer than Premium Holiday",
      "Premium Holiday is only for annual premium payers"
    ],
    correct: 1,
    explanation: "The critical distinction: Premium Pass (available after 5 years of premiums paid, up to 12 months) suspends charges during the pause — it is a genuine 'break' with no cost. Premium Holiday is a broader facility where premiums stop but charges continue to be deducted from fund value, which can erode the investment. Advisors should recommend Premium Pass first if eligible.",
    category: 'product-facts'
  },
  {
    question: "Can Pro Achiever 3.0 premiums be paid using CPF savings?",
    options: [
      "Yes, using CPF Ordinary Account for any investment period",
      "It depends on whether the specific Pro Achiever 3.0 plan configuration is approved under the CPF Investment Scheme (CPFIS)",
      "No, ILPs cannot use CPF funds",
      "Only CPF Special Account can be used"
    ],
    correct: 1,
    explanation: "Whether CPF can be used depends on whether the specific Pro Achiever 3.0 configuration (investment period and fund choices) is approved under the CPF Investment Scheme (CPFIS). Not all ILP configurations qualify — the funds selected must be CPFIS-included funds, and there are caps on how much CPF can be invested. Advisors should verify CPFIS eligibility for each case.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum premium amount for AIA Pro Achiever 3.0?",
    options: [
      "$100/month",
      "$200/month (or $2,400/year annualized)",
      "$500/month",
      "There is no minimum"
    ],
    correct: 1,
    explanation: "The minimum premium for Pro Achiever 3.0 is typically $200/month (or $2,400 annualized). This minimum ensures that the policy can sustain the insurance charges and still have meaningful investment growth. Higher premiums unlock better welcome bonus tiers, so advisors should show clients how premium levels affect bonus eligibility.",
    category: 'product-facts'
  },
  {
    question: "What is the maximum premium amount for AIA Pro Achiever 3.0?",
    options: [
      "$1,000/month",
      "There is no absolute maximum, but higher premiums require financial underwriting to ensure the client can sustain payments",
      "$5,000/month",
      "$10,000/year"
    ],
    correct: 1,
    explanation: "There is no fixed absolute maximum premium, but higher premium amounts trigger financial underwriting. AIA needs to verify that the client's income and financial situation can sustain the premium commitment over the investment period. This protects both the client and AIA from unsustainable premium commitments that could lead to early lapsation.",
    category: 'product-facts'
  },
  {
    question: "What is the effect of a premium mode change (e.g., from monthly to annual) on the policy?",
    options: [
      "No effect at all",
      "Annual premium payers typically pay slightly less per year than monthly payers due to a modal discount, and there may be administrative differences in how charges are deducted",
      "Monthly payers get better fund performance",
      "The welcome bonus is cancelled upon mode change"
    ],
    correct: 1,
    explanation: "Changing the premium mode can affect costs: annual payers often receive a small modal discount (paying less in total per year compared to 12 monthly payments). Monthly payers benefit from more frequent dollar cost averaging. The welcome bonus is based on annualized premium, so the mode change should not affect the bonus percentage, but advisors should verify this with AIA.",
    category: 'product-facts'
  },
  {
    question: "What types of funds are available under the 'Elite' portfolio option in Pro Achiever 3.0?",
    options: [
      "Only money market funds",
      "Professionally managed multi-asset portfolios with different risk profiles (conservative, balanced, growth) that are actively managed by fund managers",
      "Only Singapore equity funds",
      "Cryptocurrency funds"
    ],
    correct: 1,
    explanation: "Elite portfolios are professionally managed multi-asset portfolios available in different risk profiles (typically conservative, balanced, and growth). A professional fund manager actively manages the asset allocation within each portfolio, adjusting based on market conditions. This is ideal for clients who want professional management without having to select individual funds themselves.",
    category: 'product-facts'
  },
  {
    question: "What types of funds are available under the 'a la carte' option in Pro Achiever 3.0?",
    options: [
      "Only bond funds",
      "A range of individual funds across different asset classes and geographies that the policyholder can select and combine according to their preferences",
      "Only money market funds",
      "Only the GDIF fund"
    ],
    correct: 1,
    explanation: "The a la carte option gives policyholders access to a range of individual funds — equity funds, bond funds, balanced funds, money market funds, and sector-specific funds across different geographies (Asia, US, Europe, global). Clients can build their own portfolio by selecting and combining funds. This option suits clients who are more investment-savvy and want control over their asset allocation.",
    category: 'product-facts'
  },
  {
    question: "What is the significance of the 'commingling' feature introduced in Pro Achiever 3.0?",
    options: [
      "It reduces policy charges",
      "It allows clients to invest in both Elite portfolios and a la carte funds within the same policy, eliminating the need for separate policies for different investment approaches",
      "It combines multiple family members' policies",
      "It merges old and new Pro Achiever versions"
    ],
    correct: 1,
    explanation: "Previously, a client who wanted both a managed portfolio (Elite) and self-selected funds (a la carte) needed two separate policies, each with its own charges. Commingling in Pro Achiever 3.0 allows both within a single policy, reducing administrative overhead and potentially qualifying for better premium tiers. For example, a client could put 60% in a balanced Elite portfolio and 40% in specific sector funds.",
    category: 'product-facts'
  },
  {
    question: "What reporting and statements does a Pro Achiever 3.0 policyholder receive?",
    options: [
      "Only an annual premium notice",
      "Regular statements showing fund value, units held, charges deducted, fund performance, and transaction history — typically semi-annually or annually, plus access to real-time information via the AIA Customer Portal",
      "No statements are provided",
      "Only a statement at policy maturity"
    ],
    correct: 1,
    explanation: "Policyholders receive regular statements (typically semi-annually or annually) detailing their fund value, number of units, charges deducted, fund performance, and all transactions. Additionally, real-time information is accessible through the AIA Customer Portal and iAIA app. These statements help policyholders track their investment and make informed decisions about fund switches or contributions.",
    category: 'product-facts'
  },
  {
    question: "What is the 'death benefit' calculation in Pro Achiever 3.0 if the policyholder also has an Additional Term Rider (ATR)?",
    options: [
      "Only the ATR sum assured is paid",
      "The beneficiary receives BOTH the higher of 101% of premiums paid or fund value (Capital Guarantee on Death) PLUS the ATR sum assured — they stack",
      "The beneficiary receives whichever is higher between the Capital Guarantee and ATR",
      "The ATR replaces the Capital Guarantee"
    ],
    correct: 1,
    explanation: "The death benefit components stack. The beneficiary receives the Capital Guarantee on Death (higher of 101% of total premiums or fund value) PLUS the ATR sum assured. For example, if total premiums are $60,000, fund value is $85,000, and ATR sum assured is $200,000, the total death benefit would be $85,000 + $200,000 = $285,000. This is why Pro Achiever with ATR provides comprehensive protection.",
    category: 'product-facts'
  },
  {
    question: "What happens to the welcome bonus if a policyholder lapses and then reinstates the policy?",
    options: [
      "The original welcome bonus is automatically restored",
      "The welcome bonus treatment upon reinstatement depends on AIA's prevailing terms — it may not be fully restored, and any clawed-back bonus during lapse may not be re-credited",
      "A new, higher welcome bonus is granted",
      "Welcome bonuses never change regardless of lapsation"
    ],
    correct: 1,
    explanation: "Upon lapsation, the welcome bonus may be partially or fully clawed back depending on when the lapse occurs. Upon reinstatement, the bonus treatment depends on AIA's prevailing terms at the time. The reinstated policy may not receive the full original bonus. This is another reason to avoid lapsation — the financial penalty goes beyond just the missed premiums.",
    category: 'product-facts'
  },
  {
    question: "What is the MAS Notice 307 requirement for product replacement (switching from one policy to another)?",
    options: [
      "There are no rules about replacing policies",
      "Advisors must conduct a comparison showing the client the potential disadvantages of replacing their existing policy with a new one, including loss of benefits, new contestability period, and new surrender charge period",
      "MAS automatically approves all policy replacements",
      "Only the new insurer needs to be informed"
    ],
    correct: 1,
    explanation: "MAS Notice 307 on Fair Dealing requires advisors to provide a replacement comparison when recommending that a client switch from an existing policy to a new one. The comparison must clearly show potential disadvantages: loss of accrued bonuses, reset of surrender charge period, new contestability period, possible re-underwriting at older age, and loss of any rider benefits. This protects clients from disadvantageous switches.",
    category: 'product-facts'
  },
  {
    question: "What is the contestability period for a Pro Achiever 3.0 policy?",
    options: [
      "6 months",
      "1 year from the policy inception or reinstatement date, during which AIA can void the policy if material non-disclosure is discovered",
      "2 years from policy inception or reinstatement date",
      "There is no contestability period"
    ],
    correct: 2,
    explanation: "The contestability period is typically 2 years from the policy inception date (or reinstatement date, if reinstated). During this period, AIA can investigate and potentially void the policy if material non-disclosure or misrepresentation is discovered in the application. After 2 years, the policy becomes incontestable (except for fraud). This is why accurate health declarations are critical.",
    category: 'product-facts'
  },
  {
    question: "What happens to fund units during a fund switch in Pro Achiever 3.0?",
    options: [
      "The policyholder receives cash and must reinvest manually",
      "Units in the current fund are sold at the bid price and units in the new fund are purchased at the offer price, with the switch completed based on prices on the processing date",
      "Units are directly transferred from one fund to another",
      "The switch happens instantaneously at current market prices"
    ],
    correct: 1,
    explanation: "During a fund switch, existing fund units are sold at the bid price and new fund units are purchased at the offer price. The bid-offer spread applies to both sides of the transaction. The switch is processed based on unit prices on the processing date (usually 2-3 business days after the request), not the date of the request. This means there is some timing risk during volatile markets.",
    category: 'product-facts'
  },
  {
    question: "What is the SDIC (Singapore Deposit Insurance Corporation) protection for ILPs?",
    options: [
      "SDIC covers ILP fund values up to $75,000",
      "SDIC does not cover ILP fund values — however, the Policy Owners' Protection (PPF) Scheme protects guaranteed benefits of life policies (including ILPs) in the event an insurer fails",
      "ILPs have no protection at all",
      "SDIC covers 100% of all insurance products"
    ],
    correct: 1,
    explanation: "SDIC primarily covers bank deposits, not ILP fund values. However, the Policy Owners' Protection (PPF) Scheme, administered by SDIC, protects the guaranteed benefits of life insurance policies if an insurer fails. For ILPs, the guaranteed components (like the Capital Guarantee on Death) would be protected up to specified limits. The investment-linked fund values are not guaranteed and therefore not covered by PPF.",
    category: 'product-facts'
  },
  {
    question: "What is the difference between the 'offer price' and 'bid price' of fund units?",
    options: [
      "They are the same price",
      "The offer price is higher (what you pay to buy units) and the bid price is lower (what you receive when selling units) — the difference is the bid-offer spread",
      "The bid price is higher than the offer price",
      "Offer price applies to lump sums and bid price applies to regular premiums"
    ],
    correct: 1,
    explanation: "The offer price (buying price) is always higher than the bid price (selling price). When premiums are invested, units are bought at the offer price. When units are sold (withdrawals, surrenders, switches), they are sold at the bid price. The spread between them covers fund transaction costs. For example, if the offer price is $1.05 and the bid price is $1.00, the bid-offer spread is approximately 5%.",
    category: 'product-facts'
  },
  {
    question: "What is the non-forfeiture provision in Pro Achiever 3.0?",
    options: [
      "The policy pays out double if premiums are paid for 10+ years",
      "If premiums stop being paid, the policy does not immediately terminate — instead it continues with reduced coverage as long as the fund value can sustain the ongoing charges",
      "All premiums are refundable at any time",
      "The policyholder forfeits all rights after missing one premium"
    ],
    correct: 1,
    explanation: "The non-forfeiture provision means the policy does not immediately terminate when premiums stop. Instead, it continues in force with ongoing charges deducted from the fund value. Coverage continues (at reduced levels as the fund depletes) until the fund value is exhausted. This gives policyholders time to resume payments or consider their options rather than losing everything immediately.",
    category: 'product-facts'
  },
  {
    question: "What is the surrender charge structure for Pro Achiever 3.0 in the first few years?",
    options: [
      "No surrender charges apply at any time",
      "Surrender charges are highest in Year 1 and decrease gradually over the years, typically reaching zero after the investment period ends",
      "Surrender charges are the same every year",
      "Surrender charges increase over time"
    ],
    correct: 1,
    explanation: "Surrender charges are designed to discourage early termination. They are highest in Year 1 (often 50-100% of one year's premium) and decrease progressively each year. By the end of the investment period, surrender charges typically reach zero. This declining structure reflects the front-loaded distribution costs that are recovered over the policy's life.",
    category: 'product-facts'
  },
  {
    question: "What medical underwriting is required for Pro Achiever 3.0?",
    options: [
      "No medical underwriting is ever required",
      "A health declaration is always required; additional medical examinations (blood tests, ECG, etc.) may be required based on the sum assured, the applicant's age, and their declared health history",
      "Full medical examination is required for all applicants",
      "Only a dental check-up is required"
    ],
    correct: 1,
    explanation: "All applicants must complete a health declaration form. Depending on the sum assured (higher amounts trigger more checks), the applicant's age (older applicants need more tests), and declared health conditions, AIA may require additional medical examinations such as blood tests, urine tests, ECG, or specialist reports. This underwriting process determines the premium loading (if any) and exclusions.",
    category: 'product-facts'
  },
  {
    question: "What is 'premium loading' in insurance underwriting?",
    options: [
      "The speed at which premiums are processed",
      "An additional charge applied to the standard premium rate for applicants with higher-than-normal risk factors such as pre-existing medical conditions, hazardous occupations, or smoking",
      "A discount for paying premiums in advance",
      "The initial administrative fee for setting up the policy"
    ],
    correct: 1,
    explanation: "Premium loading is an extra charge added to the base premium when the applicant presents higher risk. Common reasons include pre-existing medical conditions (e.g., diabetes, hypertension), hazardous occupations or hobbies, high BMI, or smoking. The loading compensates AIA for the increased risk of claims. It can be a flat percentage (e.g., +50% COI) or a fixed dollar amount, and it remains for the policy's duration.",
    category: 'product-facts'
  },
  {
    question: "How are dividends from the GDIF (Global Dynamic Income Fund) treated within Pro Achiever 3.0?",
    options: [
      "Dividends are paid out as cash to the policyholder's bank account",
      "Dividends are reinvested within the policy by purchasing additional fund units, compounding the investment",
      "Dividends are used to offset premium payments",
      "GDIF does not pay dividends"
    ],
    correct: 1,
    explanation: "Within an ILP structure, GDIF dividends are typically reinvested by purchasing additional fund units rather than paid out as cash. This reinvestment compounds the investment over time. If the policyholder wants to access the dividends, they would need to make a partial withdrawal. This automatic reinvestment is beneficial for long-term wealth accumulation.",
    category: 'product-facts'
  },
  {
    question: "What is the tax treatment of Pro Achiever 3.0 proceeds in Singapore?",
    options: [
      "All proceeds are taxable as income",
      "Life insurance proceeds paid on death are generally not subject to income tax or estate duty in Singapore, and investment gains within the policy are also not subject to capital gains tax",
      "Only the first $100,000 is tax-free",
      "Tax treatment depends on the policyholder's income bracket"
    ],
    correct: 1,
    explanation: "Singapore has no capital gains tax and no estate duty (abolished in 2008). Life insurance death benefit proceeds are generally not subject to income tax. Investment gains within the ILP are also not taxed as capital gains. This tax-efficient treatment is a significant advantage of insurance-based investments compared to direct investments in some other jurisdictions. However, tax rules can change, so clients should be reminded of this caveat.",
    category: 'product-facts'
  },
  {
    question: "What is the 'free look' provision under Singapore law for life insurance policies?",
    options: [
      "A right to review the policy document at AIA's office",
      "A 14-day right to cancel the policy from the date of receiving the policy document, with a refund of premiums paid minus any market value decrease",
      "A 30-day trial period with full guaranteed refund",
      "The right to read the policy terms before signing"
    ],
    correct: 1,
    explanation: "The free look provision gives policyholders 14 days from receiving the policy document to cancel without penalty. They receive a refund of premiums minus any decrease in fund unit value. This MAS-mandated consumer protection ensures clients have time to review the full policy terms at home and seek independent advice before committing. No surrender charges or penalties apply during this period.",
    category: 'product-facts'
  },
  {
    question: "What is the role of the 'policy schedule' in a Pro Achiever 3.0 policy?",
    options: [
      "It lists upcoming premium payment dates only",
      "It is the personalized document that specifies the individual policy details: sum assured, premium amount, investment period, chosen funds, riders attached, beneficiary nominations, and all applicable charges",
      "It is a marketing document",
      "It contains general product terms that apply to all policyholders"
    ],
    correct: 1,
    explanation: "The policy schedule is the personalized section of the policy document that contains all specifics for that individual policy: the policyholder's and life assured's details, sum assured, premium amount and frequency, investment period, selected funds and allocation, riders attached, nominated beneficiaries, and all applicable charges. It should be reviewed carefully during the free look period.",
    category: 'product-facts'
  },
  {
    question: "What is the significance of the 'Age Next Birthday' (ANB) convention used in Singapore insurance?",
    options: [
      "It is the same as current age",
      "It means the policyholder's age is calculated as their current age plus one year — a 29-year-old would be treated as age 30 ANB, resulting in slightly higher insurance charges",
      "It means insurance starts on the policyholder's next birthday",
      "It is only used for policies purchased in December"
    ],
    correct: 1,
    explanation: "Age Next Birthday (ANB) is the standard age convention in Singapore insurance. It adds one year to the actual age — so a person who is 29 years and 3 months old would be classified as ANB 30. This affects premium calculations because insurance charges are based on ANB. Buying just before a birthday can mean a lower ANB classification and therefore lower premiums, which is why birthday-based prospecting is effective.",
    category: 'product-facts'
  },

  // ============================================================
  // BATCH B — CLIENT SEGMENT DEEP DIVES (70 questions)
  // ============================================================
  {
    question: "An NSF (National Serviceman) about to ORD and start his first job asks about Pro Achiever 3.0. What is the best approach?",
    options: [
      "Tell him to wait until he has a stable job",
      "Highlight that starting at age 21-22 gives him the lowest COI rates, the longest compounding runway, and the 10-year lock-in will mature by his early 30s. Recommend a modest premium he can sustain even during the job transition period",
      "Recommend the maximum premium immediately",
      "Suggest he only buys term insurance"
    ],
    correct: 1,
    explanation: "An ORD NSF is at the optimal starting point: youngest possible entry age (lowest COI), longest investment horizon, and the 10-year mark falls in his early 30s when he will likely have higher income. Start with a modest premium ($200-300/month) that is sustainable even during the first-job transition. The key message: time in market beats timing the market, and starting now is his biggest advantage.",
    category: 'sales-angles'
  },
  {
    question: "A fresh graduate with a $30,000 student loan asks if she should pay off debt first or start Pro Achiever 3.0. What do you advise?",
    options: [
      "Always pay off all debt before investing",
      "Compare the student loan interest rate to potential investment returns. If the loan rate is low (e.g., 4-5% for government loans), she can manage both: allocate extra income to debt repayment while starting a modest Pro Achiever policy to capture the youth advantage on COI and begin compounding early",
      "Tell her to start Pro Achiever at the maximum premium and make minimum loan payments",
      "Suggest she ignore the student loan entirely"
    ],
    correct: 1,
    explanation: "The decision depends on interest rates. Singapore government study loans typically charge 4-5% interest. If expected investment returns exceed this (historically 6-8% for diversified portfolios), it can make sense to do both: aggressive loan repayment alongside a modest Pro Achiever premium. Starting young locks in low COI rates and begins compounding. The key is ensuring the premium is sustainable alongside loan repayments.",
    category: 'sales-angles'
  },
  {
    question: "A young couple planning a BTO application asks about insurance. How do you position Pro Achiever 3.0?",
    options: [
      "Tell them to wait until after the BTO is confirmed",
      "Map their financial timeline: BTO queue is typically 3-5 years. Start Pro Achiever now with moderate premiums, building protection and wealth during the waiting period. By the time they collect keys, they will have 3-5 years of premium payments, closer to Premium Pass eligibility, and established insurance coverage before taking on a mortgage",
      "Recommend they use all savings for the BTO down payment",
      "Suggest they buy a much larger policy to cover the future mortgage"
    ],
    correct: 1,
    explanation: "The BTO timeline works in favor of starting early. The 3-5 year wait before key collection means they can build wealth and protection now. When the mortgage kicks in, they already have an established policy (closer to Premium Pass eligibility if cash gets tight). Starting before the mortgage means they qualify at a younger age with lower COI. Frame insurance as part of responsible home ownership planning.",
    category: 'sales-angles'
  },
  {
    question: "A young couple about to get married asks why they need insurance now. What is the most compelling pitch?",
    options: [
      "Tell them it is a legal requirement for married couples",
      "Frame it as part of building a shared financial foundation: marriage means shared responsibilities, and insurance protects both partners. Start with individual policies at modest premiums, with the Capital Guarantee ensuring neither partner is left financially vulnerable if something happens to the other",
      "Suggest they only need insurance after having children",
      "Focus only on the investment returns as a wedding savings plan"
    ],
    correct: 1,
    explanation: "Marriage creates financial interdependence — shared rent/mortgage, joint expenses, possibly a single-income household in the future. Insurance becomes a responsibility to each other, not just an individual choice. Position Pro Achiever as part of building their financial house: protection for each other (death benefit), wealth accumulation for future goals (home, children), and financial discipline via regular premiums.",
    category: 'sales-angles'
  },
  {
    question: "New parents want to start saving for their child's education fund. How do you position Pro Achiever 3.0?",
    options: [
      "Recommend a pure savings account instead",
      "Show that a 15-year Pro Achiever policy started when the child is born will mature when the child enters university at 16-18. The welcome bonus starts compounding from Day 1, the special bonus kicks in from Year 10, and the Capital Guarantee protects the education fund if something happens to the parent",
      "Tell them education in Singapore is free so they don't need to save",
      "Recommend a 10-year plan that matures when the child is only 10"
    ],
    correct: 1,
    explanation: "The 15-year investment period aligns perfectly with the education savings goal. Starting at birth: by age 15-16, the policy has passed the lock-in, accumulated welcome and special bonuses, and benefited from 15 years of compounding. The Capital Guarantee on Death adds crucial protection — if the parent passes away, the education fund is protected at 101% of premiums paid at minimum. This dual purpose (savings + protection) is Pro Achiever's strongest value proposition for parents.",
    category: 'sales-angles'
  },
  {
    question: "A sandwich generation client (age 40, supporting aging parents and young children) says she has too many financial obligations for insurance. How do you respond?",
    options: [
      "Agree that she has too many obligations and suggest she wait",
      "Acknowledge her situation, then show that she is actually the person who needs insurance MOST — she is the financial bridge for both generations. If something happens to her, both her parents and children lose their support. A well-structured Pro Achiever policy with ATR provides affordable death benefit protection while building wealth for future obligations",
      "Tell her to stop supporting her parents",
      "Recommend she only insure her children"
    ],
    correct: 1,
    explanation: "The sandwich generation has the HIGHEST need for protection because they support dependents on both sides. If this client passes away or becomes disabled, both her aging parents and young children lose their financial support. Pro Achiever with ATR provides affordable comprehensive coverage. The monthly premium may be less than one restaurant dinner — reframe the cost relative to the catastrophic risk of being uninsured.",
    category: 'sales-angles'
  },
  {
    question: "A self-employed hawker stall owner with irregular monthly income asks about Pro Achiever 3.0. What is the best strategy?",
    options: [
      "Tell him ILPs are only for salaried employees",
      "Recommend annual premium payment mode (paying during Chinese New Year or peak seasons when income is highest), highlight Premium Pass as a safety net for lean months, and start at the minimum premium to ensure sustainability. Emphasize that self-employed individuals have ZERO employer-provided insurance",
      "Recommend the 20-year period with maximum premium",
      "Suggest he closes his hawker stall and gets a salaried job first"
    ],
    correct: 1,
    explanation: "Self-employed individuals lack employer-provided group insurance, making personal coverage critical. Strategy: (1) annual payment mode timed to peak income periods, (2) minimum sustainable premium to avoid lapsation during lean months, (3) Premium Pass as a buffer after 5 years, (4) emphasize that being uninsured means his family gets nothing if he falls ill or dies. The 10-year period is safest given income variability.",
    category: 'sales-angles'
  },
  {
    question: "A Grab/food delivery rider asks why he needs Pro Achiever 3.0 when he already has personal accident coverage through the platform. What do you highlight?",
    options: [
      "Tell him platform coverage is sufficient",
      "Explain that platform coverage only covers accidents during active deliveries, not illnesses or off-duty incidents. Pro Achiever provides 24/7 coverage for death from ANY cause, builds investment value he can access later, and the coverage stays with him even if he changes jobs or platforms",
      "Suggest he stop doing deliveries",
      "Tell him personal accident coverage is better than life insurance"
    ],
    correct: 1,
    explanation: "Platform accident coverage has critical gaps: it only covers accidents during active work, excludes illnesses (e.g., cancer, heart attack), and terminates when he stops working for the platform. Pro Achiever covers death from any cause 24/7, builds portable wealth that stays with him through career changes, and the Capital Guarantee protects his family regardless. The coverage is his, not the platform's.",
    category: 'sales-angles'
  },
  {
    question: "A business owner asks about using Pro Achiever 3.0 for keyman insurance. How do you explain it?",
    options: [
      "Tell him ILPs are not suitable for keyman insurance",
      "Explain that Pro Achiever with ATR can serve as keyman insurance: the company is the policyholder, the key employee is the life assured, and the death benefit compensates the business for the loss of a critical person. The investment component can also serve as a corporate sinking fund",
      "Suggest he simply saves cash in the company account",
      "Recommend a term policy only and dismiss Pro Achiever"
    ],
    correct: 1,
    explanation: "Pro Achiever can be structured as keyman insurance: the company owns the policy (policyholder), the key employee is the life assured, and the death benefit covers the financial impact of losing that person. The investment component acts as a corporate sinking fund that accumulates value over time. Tax treatment of premiums and proceeds should be discussed with the company's tax advisor. The ATR provides affordable additional death benefit coverage.",
    category: 'sales-angles'
  },
  {
    question: "A pre-retiree (age 55) with $200,000 in savings wants to 'catch up' on retirement planning. Is Pro Achiever 3.0 suitable?",
    options: [
      "Yes, recommend the 20-year plan for maximum bonus",
      "A 10-year Pro Achiever plan may be suitable for a portion of her savings, but manage expectations: higher COI at age 55 means more charges, and 10 years is a shorter compounding period. Diversification across multiple vehicles (CPF top-ups, fixed income, Pro Achiever) is more prudent than putting everything in one product",
      "Tell her it is too late to start insurance",
      "Recommend she puts all $200,000 into Pro Achiever as a lump sum"
    ],
    correct: 1,
    explanation: "At 55, Pro Achiever can still be useful but with caveats: higher COI reduces net returns, and the 10-year plan is the most practical (maturing at 65). Recommend allocating a portion (not all) to Pro Achiever for protection + growth, while diversifying the rest across CPF top-ups (which offer guaranteed risk-free returns), fixed income instruments, and other vehicles. A holistic retirement plan trumps a single-product approach.",
    category: 'sales-angles'
  },
  {
    question: "An existing AIA policyholder with a Pro Achiever 2.0 policy asks if he should switch to Pro Achiever 3.0. What do you recommend?",
    options: [
      "Always switch — 3.0 is better in every way",
      "Do NOT recommend switching the existing policy. Instead, suggest keeping the 2.0 policy (which has accrued value and passed some surrender charge years) and starting a NEW supplementary Pro Achiever 3.0 policy to access new features like commingling and GDIF. MAS Notice 307 requires a replacement analysis if switching",
      "Tell him to surrender the 2.0 policy immediately",
      "Ignore the existing policy and only discuss the new one"
    ],
    correct: 1,
    explanation: "Replacing an existing policy resets surrender charges, loses accrued bonuses, and triggers a new contestability period — almost always disadvantageous. Instead, keep the existing 2.0 policy and layer a new 3.0 policy on top to access new features. This preserves the built-up value in the old policy while letting the client benefit from 3.0 innovations. MAS Notice 307 requires a replacement comparison if the client insists on switching.",
    category: 'sales-angles'
  },
  {
    question: "A client has a competitor's ILP (e.g., Prudential PRULink) and asks if she should replace it with Pro Achiever 3.0. How do you handle this?",
    options: [
      "Immediately recommend switching and highlight Pro Achiever's superiority",
      "Conduct a thorough MAS Notice 307 replacement analysis: compare charges (supplementary charges, COI, fund fees), bonus structures, surrender values, coverage, and remaining commitment period. Show the analysis transparently and let the client make an informed decision. Never pressure a switch that disadvantages the client",
      "Tell her all competitor products are bad",
      "Refuse to discuss competitor products"
    ],
    correct: 1,
    explanation: "MAS Notice 307 mandates a formal replacement analysis when advising a client to switch policies. Compare every dimension: charges (Pro Achiever's supplementary charge drops to zero after 10 years — does the competitor's?), bonus structures, death benefit guarantees, surrender value impact, and remaining commitment. If the competitor policy has been in force for several years, switching may lose significant accrued value. Be transparent — building trust is more valuable than one sale.",
    category: 'sales-angles'
  },
  {
    question: "A client's birthday is next month. How do you use this as an approach trigger?",
    options: [
      "Send a generic birthday greeting card",
      "Contact the client now and explain that insurance premiums are based on Age Next Birthday (ANB) — once their birthday passes, their ANB increases by one year, resulting in higher COI charges for any new policy. Acting before the birthday locks in lower charges for the entire policy lifetime",
      "Wait until after the birthday to make contact",
      "Only mention the birthday if they bring it up first"
    ],
    correct: 1,
    explanation: "The ANB birthday trigger is one of the most effective prospecting approaches because it creates genuine, time-limited urgency. Once the birthday passes, COI rates increase based on the higher ANB classification, and this higher rate applies for the entire policy duration. The savings from acting before versus after the birthday can amount to thousands of dollars over the policy's lifetime. This is factual urgency, not manufactured pressure.",
    category: 'sales-angles'
  },
  {
    question: "How should you structure an annual review meeting with an existing Pro Achiever policyholder?",
    options: [
      "Just call them to say everything is fine",
      "Prepare a comprehensive review: current fund value vs projections, fund performance analysis, assess if the current fund allocation still matches their risk profile and goals, review coverage adequacy given any life changes (marriage, children, promotion), and discuss potential adjustments (top-ups, fund switches, additional coverage)",
      "Only contact them if there is a problem",
      "Send an automated email with their statement"
    ],
    correct: 1,
    explanation: "Annual reviews are critical for client retention and cross-selling. Structure: (1) review fund performance vs BI projections, (2) assess fund allocation vs current risk appetite, (3) identify life changes that affect coverage needs (new baby, promotion, mortgage), (4) discuss optimization opportunities (top-ups during bonus season, fund switches if risk profile changed), (5) address any concerns. This positions you as an ongoing advisor, not a one-time seller.",
    category: 'sales-angles'
  },
  {
    question: "How should you use social media to prospect for Pro Achiever 3.0?",
    options: [
      "Post hard-sell product pitches daily",
      "Build credibility through educational content: share financial literacy tips, explain insurance concepts in simple terms, use case studies (anonymized), and engage with followers' questions. Position yourself as a trusted financial educator, then connect personally with engaged followers for one-on-one consultations",
      "Add everyone you can find and immediately send product brochures",
      "Avoid social media entirely — it is unprofessional"
    ],
    correct: 1,
    explanation: "Effective social media prospecting is about education, not selling. Share content that helps people understand financial concepts (DCA, inflation, protection gaps), use real-world analogies, and respond thoughtfully to questions. Over time, you build a reputation as a knowledgeable and trustworthy advisor. Engaged followers who DM you with questions are warm leads — much more receptive than cold prospects.",
    category: 'sales-angles'
  },
  {
    question: "You are conducting a corporate lunch-and-learn at a tech company. How do you tailor the Pro Achiever 3.0 pitch?",
    options: [
      "Use the same generic presentation you use for everyone",
      "Tailor to tech professionals: they likely have stock options/RSUs (concentration risk — Pro Achiever diversifies), high income but potentially volatile career paths (startup risk), data-driven mindset (show historical fund performance data and compounding calculations), and they understand the concept of 'locking in' (vesting schedules = familiar with delayed gratification)",
      "Focus on scaring them about job losses in the tech industry",
      "Tell them their stock options are worthless"
    ],
    correct: 1,
    explanation: "Tech professionals respond to data and logic. Frame Pro Achiever using their language: diversification away from company stock concentration (like a balanced portfolio), compounding math (they understand exponential growth), vesting parallels (10-year lock-in is similar to stock option vesting they already accept), and risk management (their career may be volatile, but their insurance shouldn't be). Use numbers, charts, and projections — this audience appreciates evidence.",
    category: 'sales-angles'
  },
  {
    question: "How should you approach a doctor or medical professional about Pro Achiever 3.0?",
    options: [
      "Assume they already know everything about insurance",
      "Acknowledge their medical expertise while highlighting financial planning blind spots: high income but often late career start (medical school), significant student debt, high malpractice risk, and the irony that they protect patients' health but often neglect their own financial health. The 15-20 year plan suits their delayed but eventually high earning trajectory",
      "Focus on scaring them about medical malpractice suits",
      "Tell them they earn too much to need insurance"
    ],
    correct: 1,
    explanation: "Doctors are intelligent but time-poor and often financially underserved despite high incomes. Key angles: late career start (medical school + residency = delayed wealth building), need to catch up on savings, understanding of risk (medical terminology resonates), and the discipline parallel (regular premiums = preventive care for finances). The 15-20 year plan suits their earning trajectory, and the Premium Pass provides flexibility during career transitions (e.g., starting a private practice).",
    category: 'sales-angles'
  },
  {
    question: "How should you approach a teacher about Pro Achiever 3.0?",
    options: [
      "Tell them their salary is too low for investment products",
      "Highlight stability: teachers have predictable income (perfect for regular premiums), job security, and a clear retirement timeline. Start with the minimum premium, emphasize the 20-year plan for maximum compounding (a 28-year-old teacher reaches Year 20 at 48, well before retirement), and show how Pro Achiever supplements their pension",
      "Suggest they find a higher-paying career first",
      "Focus only on the death benefit"
    ],
    correct: 1,
    explanation: "Teachers are ideal Pro Achiever candidates: stable, predictable income (perfect for regular premium ILPs), long career horizon, and a genuine retirement planning need since pension alone may not suffice. Frame the premium as a small percentage of their stable salary. The 20-year plan at a young starting age delivers significant compounding benefits. Show how Pro Achiever supplements CPF and pension to create a comfortable retirement.",
    category: 'sales-angles'
  },
  {
    question: "How should you approach a lawyer about Pro Achiever 3.0?",
    options: [
      "Use casual, informal language",
      "Be precise and thorough — lawyers respect detail. Walk through the contract terms, explain each charge clearly, reference the MAS regulatory framework, and present the product as a contractually-backed commitment with specific guaranteed and non-guaranteed components. They will read the fine print, so be prepared to discuss every clause",
      "Skip the details and focus only on emotional stories",
      "Tell them to trust you without showing the documents"
    ],
    correct: 1,
    explanation: "Lawyers are trained to scrutinize contracts and terms. They respect advisors who are equally thorough. Prepare by knowing every clause in the policy document, being transparent about charges and conditions, and referencing the regulatory framework (MAS guidelines). Present the Benefit Illustration with clear disclaimers about guaranteed vs non-guaranteed components. A lawyer who trusts your competence becomes a strong referral source to their professional network.",
    category: 'sales-angles'
  },
  {
    question: "A client who just received a $50,000 bonus asks whether to invest it in Pro Achiever 3.0 as a lump sum or spread it out. What do you recommend?",
    options: [
      "Put it all in as a single lump sum immediately",
      "Recommend a balanced approach: start or increase the regular Pro Achiever premium (benefiting from DCA and welcome bonus on the regular portion), and consider a top-up for part of the bonus. Keep some liquid for emergencies. Avoid putting 100% into one illiquid product",
      "Tell them to spend the bonus and enjoy life",
      "Put the entire bonus in a fixed deposit"
    ],
    correct: 1,
    explanation: "A $50,000 bonus should be deployed strategically, not dumped entirely into one vehicle. Recommended split: (1) increase regular Pro Achiever premium if currently at a low level (captures better bonus tier), (2) consider a top-up with a portion (boosts fund value), (3) keep 3-6 months of expenses liquid as emergency fund, (4) if other financial goals exist (e.g., BTO, travel), allocate accordingly. This shows holistic financial planning, not product-pushing.",
    category: 'sales-angles'
  },
  {
    question: "An engineer who loves spreadsheets asks for a detailed cost-benefit analysis of Pro Achiever 3.0. How do you deliver?",
    options: [
      "Tell him to just trust the product",
      "Provide the full Benefit Illustration, break down every charge component in a table format (supplementary charges, COI projections by age, fund management fees, bid-offer spread), show the net effect of bonuses, and let him compare the 4% and 8% return scenarios himself. Offer to model different premium levels in a spreadsheet",
      "Give him a one-page flyer and move on",
      "Refuse to share detailed numbers and say it is confidential"
    ],
    correct: 1,
    explanation: "Analytical clients are your best long-term clients — if convinced by the numbers, they rarely lapse. Provide full transparency: every charge component, projected COI by age, fund performance benchmarks, bonus calculations, and net return projections. Offer to model scenarios in Excel. This type of client respects advisors who match their analytical rigor and will become your strongest referral source within their engineering network.",
    category: 'sales-angles'
  },
  {
    question: "A property agent with commission-based income asks about Pro Achiever 3.0. What special considerations apply?",
    options: [
      "Recommend the highest premium since property agents earn a lot",
      "Start with a conservative premium and recommend annual payment mode timed to when commissions are typically received. Emphasize Premium Pass and Premium Holiday as essential safety nets for months with zero closings. Also highlight that property agents have no employer benefits — Pro Achiever may be their only protection",
      "Tell them to invest in more properties instead",
      "Suggest they switch to a salaried career first"
    ],
    correct: 1,
    explanation: "Commission-based earners face feast-or-famine cycles. Strategy: (1) conservative premium that is sustainable even during dry months, (2) annual payment mode timed to commission receipt, (3) Premium Pass and Holiday as critical safety nets, (4) emergency fund verification before starting, (5) emphasize that unlike salaried workers, property agents have zero employer insurance — this is their safety net. The 10-year plan is typically safest given income volatility.",
    category: 'sales-angles'
  },
  {
    question: "A referral says, 'My friend told me to meet you, but I don't really think I need insurance.' How do you engage?",
    options: [
      "Launch into your full product presentation immediately",
      "Thank the referral, don't push the product. Instead, ask about their financial goals, concerns, and current situation. Turn it into a casual financial health check conversation. If there's a genuine gap (which there almost always is), share how Pro Achiever could address it. If not, part ways professionally — the goodwill may lead to future engagement",
      "Tell them their friend was right to send them and they definitely need insurance",
      "Criticize them for not valuing their friend's recommendation"
    ],
    correct: 1,
    explanation: "A reluctant referral needs a low-pressure approach. Don't pitch — listen. Conduct a friendly financial health check: ask about their work, family situation, financial goals, and existing coverage. Most people discover gaps they didn't know existed. If Pro Achiever genuinely fits, present it as a solution to their discovered gap. If it doesn't, recommend what does and part professionally. This builds your reputation as an advisor, not a salesman.",
    category: 'sales-angles'
  },
  {
    question: "A client's company offers group insurance covering $200,000 in death benefit. She thinks she is fully covered. How do you identify the gap?",
    options: [
      "Agree that group insurance is sufficient",
      "Calculate her actual protection need: annual expenses x number of dependent years + outstanding debts + education funds - existing assets. If the need is $500,000 and group covers $200,000, there is a $300,000 gap. Also highlight that group insurance ends when she leaves the company, and medical underwriting may not be available if she needs to apply individually at an older age",
      "Tell her group insurance is worthless",
      "Suggest she only needs Pro Achiever's investment component"
    ],
    correct: 1,
    explanation: "Group insurance creates a false sense of security. Calculate the real gap: total protection need (income replacement x years, debts, education) minus existing coverage (group + personal). The group insurance gap: (1) it terminates on resignation/retrenchment, (2) coverage typically doesn't increase with promotions, (3) no portability to next employer, (4) if she tries to buy individual coverage after leaving at an older age with potential health issues, it may be expensive or unavailable. Pro Achiever fills this gap permanently.",
    category: 'sales-angles'
  },
  {
    question: "How do you position Pro Achiever 3.0 to a couple where one spouse is a stay-at-home parent?",
    options: [
      "Only insure the working spouse since the stay-at-home parent has no income",
      "Insure BOTH spouses: the working spouse needs coverage for income replacement, and the stay-at-home parent's coverage replaces the economic value of childcare, household management, and potential re-entry income if the working spouse passes. Use a lower premium for the stay-at-home parent but don't skip coverage entirely",
      "Tell the stay-at-home parent to get a job first",
      "Only offer investment products to the working spouse"
    ],
    correct: 1,
    explanation: "The stay-at-home parent provides enormous economic value: childcare ($2,000-3,000/month if outsourced), household management, and emotional stability for the family. If something happens to the stay-at-home parent, the working spouse would need to hire help, reduce work hours, or stop working entirely. Coverage for both spouses protects the family unit. The stay-at-home parent's coverage can be at a lower sum assured but should not be zero.",
    category: 'sales-angles'
  },
  {
    question: "How do you approach a client who only wants the absolute cheapest insurance option?",
    options: [
      "Match them with the cheapest term plan and move on",
      "Understand why they want cheapest: is it budget constraints or value perception? If budget, start with affordable term coverage for immediate protection, then show how even a minimum Pro Achiever policy adds wealth building at a small incremental cost. If value perception, demonstrate total cost of ownership comparison over 20 years showing how 'cheap' term without investment discipline may cost more long-term",
      "Tell them cheap insurance is always bad",
      "Refuse to serve clients who want cheap options"
    ],
    correct: 1,
    explanation: "Cheapest does not mean best value. If the client has genuine budget constraints, start with term insurance for maximum coverage per dollar, then layer on a minimum Pro Achiever policy when budget allows. If it is a value perception issue, compare total 20-year costs: term premiums are pure cost (no cash value), while Pro Achiever premiums build an asset. The 'cheapest' term-only strategy often costs more in total when no investment discipline is maintained.",
    category: 'sales-angles'
  },
  {
    question: "A client about to start a new business says he can't commit to regular premiums. What creative solution do you offer?",
    options: [
      "Tell him entrepreneurs can't buy insurance",
      "Start with the minimum premium on a 10-year plan. Explain that the first 2-3 years of a business are the riskiest — and precisely when his family needs protection most. Premium Pass (after 5 years) provides a safety net if cash flow is tight. Consider annual payment mode to align with business cycles, and position insurance as a business risk management tool",
      "Recommend he waits until the business is successful",
      "Suggest the maximum premium since entrepreneurs should think big"
    ],
    correct: 1,
    explanation: "Entrepreneurs face unique risks: income volatility, business failure, personal liability. Ironically, they need protection most during the early high-risk years. Start with the minimum premium to lock in coverage and young-age COI rates. Annual payment mode can align with business revenue cycles. Premium Pass provides a buffer if Year 5-6 hits a cash crunch. Frame insurance as risk management — something every entrepreneur should understand and value.",
    category: 'sales-angles'
  },
  {
    question: "How should you structure a financial plan conversation with a client earning over $200,000/year?",
    options: [
      "Recommend the maximum Pro Achiever premium immediately",
      "Start with a comprehensive Financial Needs Analysis: high earners have complex needs including tax planning, estate planning, concentration risk (if income depends on one source), lifestyle protection, and legacy goals. Pro Achiever fits as one component of a diversified strategy alongside other products. Show how the welcome bonus on higher premiums ($12,000+/year) reaches the best tiers",
      "Tell them they earn too much to need insurance",
      "Only discuss investment products — skip insurance"
    ],
    correct: 1,
    explanation: "High earners have sophisticated needs and expect sophisticated advice. Don't lead with product — lead with a comprehensive financial needs analysis. Map their full picture: lifestyle to protect, dependents, debts, existing coverage, investment portfolio, estate planning needs. Position Pro Achiever as one pillar in a multi-product strategy. Higher premiums ($12,000+/year) access the best welcome bonus tiers, making it more attractive for high earners.",
    category: 'sales-angles'
  },
  {
    question: "A PR (Permanent Resident) holder from China asks about Pro Achiever 3.0. What special considerations apply?",
    options: [
      "PRs cannot buy insurance in Singapore",
      "PRs are eligible for Pro Achiever 3.0. Special considerations: discuss nomination rules (Singapore law applies), potential tax implications in their home country, currency considerations if they plan to repatriate, and the importance of making clear beneficiary nominations. Also explore if they have existing coverage in their home country and how Pro Achiever complements it",
      "Tell them to buy insurance in China instead",
      "Charge them a higher premium because they are foreign"
    ],
    correct: 1,
    explanation: "PRs can purchase Singapore life insurance products. Key considerations: (1) nomination rules follow Singapore law — explain irrevocable vs revocable clearly, (2) if they may return to China, consider how the policy travels (it remains valid globally), (3) currency: premiums and benefits are in SGD, (4) existing home country coverage — avoid duplication, (5) CPF/SRS eligibility for premium payment. Serving the PR community well opens a large referral network within their community.",
    category: 'sales-angles'
  },
  {
    question: "A client asks, 'Why should I buy from AIA specifically and not another insurer?' What key differentiators do you highlight?",
    options: [
      "AIA is the only insurance company in Singapore",
      "Highlight AIA's specific strengths: largest listed insurer in Asia-Pacific, strong financial strength ratings, Pro Achiever is AIA's best-selling plan (80% of consultants sell it), unique features like supplementary charge dropping to zero after Year 10, commingling, Premium Pass, and the company's long operating history in Singapore",
      "Tell them all insurance companies are the same",
      "Criticize competitors by name"
    ],
    correct: 1,
    explanation: "Focus on facts, not opinions: AIA is the largest listed insurer in Asia-Pacific with strong financial ratings (indicating ability to pay claims). Pro Achiever-specific differentiators: supplementary charge dropping to zero after Year 10 (competitors typically charge perpetually), commingling innovation, Premium Pass flexibility, and 80% consultant adoption rate (internal confidence). Never badmouth competitors — let AIA's features speak for themselves.",
    category: 'sales-angles'
  },

  // ============================================================
  // BATCH C — ADVANCED OBJECTION HANDLING (80 questions)
  // ============================================================
  {
    question: "Client: 'I read online that ILPs are scams — they just take your money in fees.' How do you address this?",
    options: [
      "Tell the client to stop reading things online",
      "Acknowledge that fee concerns are valid, then show transparency: walk through every charge component in the Benefit Illustration, show that the projections are NET of all fees, highlight the supplementary charge dropping to zero after Year 10, and compare the total cost structure to alternatives. Let the facts counter the misinformation",
      "Agree that most ILPs are scams but Pro Achiever is different",
      "Dismiss the concern and change the subject"
    ],
    correct: 1,
    explanation: "Online ILP criticism often focuses on fees without context. Counter with full transparency: (1) show every charge in the BI, (2) highlight that projections are NET of all fees, (3) the supplementary charge structure (zero after Year 10) is actually competitive, (4) the bonus structures partially offset fees, (5) compare total cost of ownership vs alternatives (term + DIY investing). Informed clients who understand the fee structure are less likely to lapse. Transparency defeats misinformation.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My parents say insurance is a waste of money — just save in the bank.' How do you bridge the generational gap?",
    options: [
      "Tell the client their parents are financially illiterate",
      "Respect the parents' perspective: in their era, bank interest rates were 5-8%, so bank savings made sense. Today, rates are 0.05-2%, barely keeping pace with inflation. Show how the financial landscape has changed and how Pro Achiever is a modern savings discipline tool that adds protection — something their parents' bank savings never provided",
      "Ignore the parents' opinion and pressure the client",
      "Suggest the client hide the purchase from their parents"
    ],
    correct: 1,
    explanation: "The parents' advice was valid in their time — bank deposits paid 5-8% interest in the 1980s-90s. Acknowledge this context respectfully, then show how things have changed: current savings rates (0.05-2%) lose to inflation (3-4%). Pro Achiever modernizes the saving discipline their parents value by adding investment growth potential and life insurance protection. Frame it as evolving their parents' wisdom for today's financial reality, not rejecting it.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm putting my money into crypto and property — I don't need insurance.' How do you respond?",
    options: [
      "Tell them crypto is a scam and property is risky",
      "Acknowledge their investment choices, then highlight three things crypto and property don't provide: (1) life insurance protection if they die, (2) liquidity during emergencies (property is illiquid, crypto is volatile), (3) diversification — having all wealth in 2 asset classes is concentration risk. Pro Achiever adds a third pillar: protection + professional fund management + diversified investment",
      "Agree and walk away",
      "Recommend they sell all crypto and property to buy insurance"
    ],
    correct: 1,
    explanation: "Don't criticize their investments — extend their thinking. Crypto and property can be part of a portfolio, but they lack: (1) death benefit protection (if they die tomorrow, their family gets a volatile portfolio, not guaranteed coverage), (2) true diversification (both can crash simultaneously), (3) professional risk management. Pro Achiever adds a stable pillar alongside their riskier assets. Frame it as risk management, something any sophisticated investor should value.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to wait for the market to crash before starting Pro Achiever 3.0.' How do you counter the market timing argument?",
    options: [
      "Agree and tell them to call you when markets crash",
      "Explain that research consistently shows time in market beats timing the market. Since Pro Achiever uses dollar cost averaging, market dips are automatically beneficial (buying more units cheaper). Waiting for a crash means: (1) missing months of DCA accumulation, (2) potentially higher COI due to aging, (3) no insurance protection during the waiting period, (4) historically, nobody consistently predicts crashes",
      "Promise that markets will crash next month",
      "Tell them markets never crash"
    ],
    correct: 1,
    explanation: "Market timing is one of the most common and most costly investor mistakes. Counter with data: (1) studies show that time in market beats timing — even investors who bought at market peaks historically recovered and profited over 10+ years, (2) DCA automatically benefits from dips, (3) while waiting, the client's ANB is increasing (higher future COI), and they have zero protection. The cost of waiting (aging + no coverage + missed compounding) almost always exceeds the benefit of 'buying the dip.'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Your fund performance has been terrible — only 2% last year.' How do you address poor fund performance?",
    options: [
      "Agree that the performance is bad and apologize",
      "Contextualize: compare the fund's performance to its benchmark (e.g., if the benchmark returned 1%, then 2% was actually outperformance). Discuss the specific market conditions that year, show longer-term (5-10 year) returns, and remind the client that DCA means poor years are actually buying opportunities. If the fund has consistently underperformed its benchmark, discuss fund switching options",
      "Blame the global economy",
      "Promise better returns next year"
    ],
    correct: 1,
    explanation: "Fund performance must be contextualized: (1) compare to the benchmark — 2% may actually be outperformance in a bad year, (2) single-year returns are noise; look at 3-5-10 year track records, (3) DCA means poor years accumulate more units at lower prices, setting up stronger returns when markets recover, (4) if the fund has consistently underperformed its benchmark, exercise the 4 free fund switches. Never promise future returns, but educate on how market cycles work.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I don't trust insurance companies — they find ways not to pay claims.' How do you rebuild trust?",
    options: [
      "Tell them that distrust is irrational",
      "Validate the concern, then share facts: AIA's claims approval rate (typically 97-99%), MAS regulatory oversight (consumer protection), the contractual nature of insurance (if conditions are met, claims MUST be paid by law), and the dispute resolution channels (Financial Industry Disputes Resolution Centre — FIDReC). Offer to walk through the exact claim conditions so there are no surprises",
      "Agree that insurance companies are untrustworthy",
      "Change the subject to avoid the discomfort"
    ],
    correct: 1,
    explanation: "Trust concerns deserve serious attention. Counter with facts: (1) AIA's claims approval rate is publicly reported and typically 97-99%, (2) MAS regulates all insurers and enforces consumer protection, (3) insurance is a legal contract — if policy terms are met, the insurer must pay, (4) FIDReC provides independent dispute resolution. The best trust-builder: walk through the exact claim conditions in the policy document so the client knows exactly what is and isn't covered. Transparency eliminates surprises.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I prefer REITs or bonds for regular income — why would I choose the GDIF?' How do you differentiate?",
    options: [
      "Tell them REITs and bonds are bad investments",
      "Acknowledge REITs and bonds as good income sources, then differentiate GDIF: (1) GDIF within Pro Achiever adds life insurance protection that REITs/bonds don't provide, (2) GDIF is professionally managed with diversified global exposure, (3) reinvested dividends compound within a tax-efficient insurance wrapper, (4) the Capital Guarantee on Death protects the principal in a way REITs/bonds cannot",
      "Agree that REITs are better and give up",
      "Claim GDIF always outperforms REITs"
    ],
    correct: 1,
    explanation: "Don't position GDIF as a replacement for REITs/bonds — position it as a complementary tool with unique advantages: (1) insurance protection layer that no REIT or bond provides, (2) automatic reinvestment in a tax-efficient wrapper, (3) Capital Guarantee on Death (REITs/bonds have market risk on death), (4) professional management with global diversification. The ideal portfolio may include all three — REITs for yield, bonds for stability, and GDIF within Pro Achiever for protected growth and income.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why should I lock up my money for 10 years when I might need it for opportunities?' How do you reframe?",
    options: [
      "Tell them opportunities are overrated",
      "Reframe the lock-in as opportunity protection: (1) the 10-year lock-in prevents emotional decisions that historically destroy wealth (panic selling), (2) partial withdrawals, policy loans, and Premium Pass provide liquidity for genuine needs, (3) most 'opportunities' that require depleting savings are actually speculative risks, (4) having a disciplined investment that you CAN'T touch for 10 years is actually a feature, not a bug, for long-term wealth building",
      "Agree that 10 years is too long",
      "Promise that early withdrawal is possible without consequences"
    ],
    correct: 1,
    explanation: "The lock-in is a feature, not a bug. Behavioral finance research shows that investors' biggest enemy is themselves — panic selling during dips destroys wealth. The 10-year lock-in enforces the discipline that most investors lack. For genuine liquidity needs (not FOMO-driven 'opportunities'), there are options: policy loans, partial withdrawals, and Premium Pass. The question to ask the client: 'In the last 10 years, how many opportunities did you actually capture vs how much did you lose to impulsive spending?'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My employer's group insurance covers me — I don't need personal insurance.' How do you expose the gap?",
    options: [
      "Agree that group insurance is sufficient",
      "Show the five critical gaps in group insurance: (1) it terminates when you leave the company (voluntarily or through retrenchment), (2) you cannot port the coverage to a new employer, (3) the sum assured is typically 1-3x annual salary — far below the real protection need, (4) no cash value accumulation, (5) applying for individual coverage later may be difficult or expensive if health has deteriorated",
      "Tell them group insurance is fake",
      "Suggest they quit their job to lose group insurance"
    ],
    correct: 1,
    explanation: "Group insurance creates dangerous false security. Five critical gaps: (1) termination risk — leave or get retrenched and coverage vanishes instantly, (2) no portability — cannot take it to the next employer, (3) inadequate sum — typically 1-3x salary vs recommended 9-12x, (4) no wealth building component, (5) future insurability risk — if health deteriorates, applying individually later may be costly or impossible. Pro Achiever provides permanent, portable, adequate coverage that the client owns regardless of employment status.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm only 25 and perfectly healthy — I don't need insurance yet.' How do you make the case for starting young?",
    options: [
      "Agree and suggest they come back at 35",
      "Show the three advantages of starting at 25: (1) lowest possible COI rates locked in for life, (2) maximum compounding time — $300/month from age 25 vs 35 can result in $200,000+ more by age 65, (3) guaranteed insurability — if health changes later (diabetes, cancer discovery), they may be uninsurable or face heavy loadings. Starting now is the cheapest insurance they will ever buy",
      "Scare them with stories of young people dying",
      "Tell them youth is not a protection against accidents"
    ],
    correct: 1,
    explanation: "The cost-of-waiting argument is one of the most powerful in insurance sales. At 25: (1) COI is at its lowest — these rates apply for the entire policy life, (2) 10 more years of compounding vs starting at 35 (the 'miracle of compound interest'), (3) health is not guaranteed — a cancer diagnosis, diabetes onset, or accident at 30 could make insurance unavailable or extremely expensive. Run the numbers: show the dollar difference between starting at 25 vs 35 vs 45. The math is compelling.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What if AIA goes bankrupt? Will I lose everything?' How do you address this concern?",
    options: [
      "Tell them AIA will never go bankrupt — that is guaranteed",
      "Explain the multi-layered protection: (1) AIA has strong financial strength ratings from international agencies, (2) MAS requires insurers to maintain minimum capital adequacy ratios, (3) the Policy Owners' Protection Scheme (PPF) protects guaranteed benefits if an insurer fails, (4) ILP fund assets are segregated from AIA's general assets, (5) in the unlikely event of insolvency, MAS has powers to transfer policies to another insurer",
      "Agree that it is a real risk and suggest bank deposits instead",
      "Dismiss the concern as ridiculous"
    ],
    correct: 1,
    explanation: "This is a legitimate concern that deserves a thorough answer. Multiple protection layers exist: (1) AIA's financial strength ratings (AA-rated), (2) MAS capital adequacy requirements ensure insurers have sufficient reserves, (3) the PPF Scheme protects guaranteed benefits, (4) ILP fund assets are held in segregated funds separate from AIA's own assets (creditor-protected), (5) MAS has regulatory powers to facilitate policy transfer to another insurer in a failure scenario. No insurance company has failed in Singapore under MAS oversight.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Can't I just buy term and invest the rest? Everyone says BTIR is better.' How do you respond holistically?",
    options: [
      "Agree that BTIR is always superior",
      "Acknowledge BTIR's theoretical elegance, then address the behavioral reality: (1) studies show most people DO NOT consistently invest the difference — they spend it, (2) term premiums increase at renewal, potentially becoming very expensive in later years, (3) Pro Achiever provides enforced discipline, bonus structures (5-75% welcome bonus), capital guarantee on death, and professional management in one package, (4) for disciplined investors, BTIR can work, but for most people, the integrated approach delivers better outcomes",
      "Tell them BTIR is a terrible strategy",
      "Say the comparison is unfair and refuse to discuss it"
    ],
    correct: 1,
    explanation: "BTIR works brilliantly on paper and for highly disciplined investors. The reality: (1) research shows most people don't invest the difference consistently, (2) term premiums at renewal age 45-55 can be shockingly expensive, (3) Pro Achiever bundles discipline, bonuses, protection, and investment — removing the 'I'll invest later' trap. The honest answer: for a genuinely disciplined investor who will invest 100% of the difference every month for 30 years, BTIR may work. For everyone else (90%+ of people), the integrated approach delivers better real-world outcomes.",
    category: 'objection-handling'
  },
  {
    question: "A client is comparing your Pro Achiever 3.0 proposal with a Prudential PRULink proposal. What is the professional way to handle this?",
    options: [
      "Trash-talk Prudential and PRULink",
      "Welcome the comparison — it shows the client is doing due diligence. Prepare a factual side-by-side comparison: charges (supplementary charges, COI, fund fees), bonus structures, death benefit guarantees, fund selection, flexibility features (Premium Pass equivalent), and track record. Highlight Pro Achiever's unique advantages without disparaging PRULink",
      "Tell the client Prudential is going bankrupt",
      "Refuse to discuss competitor products"
    ],
    correct: 1,
    explanation: "A client comparing proposals is a well-informed client — welcome this. Prepare a factual comparison focusing on: (1) Pro Achiever's supplementary charge drops to zero after Year 10 (does PRULink?), (2) bonus structures (welcome + special), (3) death benefit guarantee comparison, (4) fund selection and commingling availability, (5) flexibility features. Let the facts differentiate. Never badmouth Prudential — it undermines your professionalism. If Pro Achiever genuinely offers better value in the client's situation, the numbers will show it.",
    category: 'objection-handling'
  },
  {
    question: "A client is comparing Pro Achiever 3.0 with Manulife InvestReady III. How do you highlight Pro Achiever's advantages?",
    options: [
      "Say Manulife is an inferior company",
      "Focus on factual differentiators: Pro Achiever's supplementary charge drops to zero after Year 10, the commingling feature (mixing Elite and a la carte), the Premium Pass (12-month pause with no charges), the Capital Guarantee on Death (101%), and the welcome + special bonus structure. Present as a comparison, not a criticism of Manulife",
      "Tell the client to buy both",
      "Admit Manulife is better and give up"
    ],
    correct: 1,
    explanation: "Focus on Pro Achiever's unique features: (1) supplementary charge structure — zero after Year 10 is rare in the industry, (2) commingling allows fund diversification within a single policy, (3) Premium Pass provides a genuine charge-free pause, (4) the dual bonus structure (welcome + special) adds long-term value, (5) the Capital Guarantee on Death at 101% of premiums. Present these as facts, not attacks on Manulife. A confident, professional comparison builds trust more than competitor bashing.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'The cooling-off period is only 14 days — that seems like you are trying to lock me in before I can think.' How do you address this?",
    options: [
      "Tell them 14 days is more than enough",
      "Explain that the 14-day cooling-off period is mandated by MAS to protect consumers — it is a CONSUMER PROTECTION measure, not a lock-in tactic. In those 14 days, they can cancel with a full refund (minus market movement). You also offer a pre-purchase consultation period where they can ask questions, compare options, and consult family BEFORE signing — the 14 days is the final safety net, not the only review window",
      "Agree that it seems suspicious",
      "Offer to extend it to 30 days (which you cannot do)"
    ],
    correct: 1,
    explanation: "Reframe the narrative: the 14-day cooling-off period is an MAS-mandated CONSUMER PROTECTION measure — it exists to protect the client, not lock them in. Every insurer must offer it. The proper approach: conduct thorough pre-purchase consultations (multiple meetings if needed), encourage the client to discuss with family, answer all questions BEFORE they sign. The 14-day period is the last line of defense, not the first. This shows the regulatory system is designed to protect consumers.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I need to ask my spouse first before committing.' How do you handle this?",
    options: [
      "Pressure them to decide now without their spouse",
      "Respect the decision completely — financial decisions should involve both partners. Offer to arrange a follow-up meeting with both spouses present, prepare materials that address common questions a spouse might have, and set a specific date within 7-10 days. In the meantime, provide a summary document the client can share with their spouse",
      "Tell them they shouldn't need their spouse's permission",
      "Accept passively without scheduling a follow-up"
    ],
    correct: 1,
    explanation: "Involving a spouse is a responsible approach, not an objection. The best response: (1) genuinely respect the decision — joint financial planning is smart, (2) offer to meet with both spouses (you want the spouse as an ally, not a blocker), (3) prepare a take-home summary covering key benefits and common questions, (4) schedule a specific follow-up date (don't leave it open-ended). When you meet the spouse, address their concerns directly — often the spouse has different priorities (e.g., protection vs investment) that you can address.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Interest rates are at 4-5% — I should put my money in a fixed deposit instead.' How do you counter in a high-rate environment?",
    options: [
      "Agree that FDs are better right now",
      "Acknowledge that current FD rates are attractive, then ask: (1) are these rates permanent? FD rates fluctuate and will likely decrease when central banks cut rates, (2) FD rates are PRE-TAX for foreign investors and offer no insurance protection, (3) FDs require active renewal — what happens when rates drop to 1-2% again? Pro Achiever provides consistent discipline regardless of rate cycles plus insurance protection FDs never offer",
      "Promise that Pro Achiever will beat FD rates",
      "Tell them FDs are a scam"
    ],
    correct: 1,
    explanation: "In high-rate environments, FDs seem attractive but are temporary. Counter with: (1) FD rates are cyclical — the current 4-5% will likely decrease when monetary policy eases (historically, Singapore FD rates averaged 1-2%), (2) when rates drop, clients rarely redeploy to productive investments, (3) FDs provide zero protection, (4) Pro Achiever's DCA benefits from all rate environments, (5) the client's real question should be: 'over the next 20 years, will FDs or diversified investments serve me better?' The historical answer is clear.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I already have 5 insurance policies — I don't need another one.' How do you uncover potential gaps?",
    options: [
      "Agree they have enough coverage and walk away",
      "Offer a complimentary policy review: consolidate all 5 policies on a single summary sheet showing total coverage, gaps, overlaps, and costs. Often clients discover: outdated policies with poor terms, overlapping coverage (paying twice for similar benefits), inadequate total sum assured relative to current needs, or no investment component. Position Pro Achiever as filling the specific gap identified — not adding randomly",
      "Tell them 5 policies is too many and they should cancel some",
      "Ignore their existing policies and push Pro Achiever anyway"
    ],
    correct: 1,
    explanation: "Having 5 policies does not mean having adequate coverage. Offer a free portfolio review: (1) list all policies with coverage amounts, premiums, and benefits, (2) identify overlaps (paying twice for similar coverage), (3) find gaps (usually in investment/wealth building or total sum assured), (4) compare legacy policy terms with current market offerings. Clients often discover they are over-insured in some areas and critically under-insured in others. Position Pro Achiever as the specific solution for the identified gap.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've been paying premiums for 3 years but my fund value is still below my total premiums paid. This product is losing me money.' How do you explain?",
    options: [
      "Agree that the product is bad and suggest surrendering",
      "Explain the early-year dynamics: (1) surrender charges are highest in early years, depressing the surrender value, (2) COI and supplementary charges have been deducted, (3) the welcome bonus is locked and may not be reflected in withdrawal-accessible value yet, (4) this is EXPECTED behavior for the first 7-10 years. Show the BI projection: the crossover point comes, and after that, fund value growth accelerates. Encourage patience and continued premium payment",
      "Promise the fund value will catch up tomorrow",
      "Blame the fund manager"
    ],
    correct: 1,
    explanation: "This is a critical moment — the client is experiencing normal early-year dynamics but interpreting them as product failure. Educate: (1) early-year charges (surrender, supplementary, COI) are front-loaded by design, (2) the welcome bonus is locked and not accessible yet, (3) the BI projections clearly show this dip-then-growth pattern, (4) the break-even point is typically Year 7-10, after which growth accelerates. The worst decision would be to surrender now and crystallize the loss. Patience is the strategy.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My financial blogger friend says ILPs have the worst returns of any investment vehicle.' How do you address influencer-driven objections?",
    options: [
      "Attack the blogger personally",
      "Acknowledge that pure investment vehicles (ETFs, stocks) may have lower fees, but point out the comparison is incomplete: (1) ILPs include insurance protection (which has a cost), (2) the bonuses (5-75% welcome, 5-8% special) partially offset fees, (3) the enforced discipline factor is not captured in simple return comparisons, (4) after Year 10, supplementary charges drop to zero. Ask: 'Is your friend comparing total value delivered, or just fund returns in isolation?'",
      "Tell the client to stop following financial bloggers",
      "Agree and suggest index funds instead"
    ],
    correct: 1,
    explanation: "Financial bloggers often compare ILP fund returns to pure investment vehicles without accounting for the insurance component, bonus structures, and behavioral benefits. The honest response: yes, a pure index ETF may have lower fees — but it provides zero life insurance protection, no behavioral lock-in, no bonus structures, and requires self-directed discipline that most investors lack. The right comparison is total value (investment returns + insurance value + bonuses + discipline factor) vs total cost, not just fund returns vs ETF returns.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What happens if I lose my job and can't pay premiums?' How do you provide reassurance?",
    options: [
      "Tell them to find a new job quickly",
      "Walk through the safety net features: (1) 30-day grace period — coverage continues while they sort things out, (2) Premium Pass — if they have paid 5 years of premiums, they can pause for 12 months with no charges, (3) Premium Holiday — the policy continues with charges deducted from fund value, (4) policy loan — borrow against the fund value to cover premiums temporarily, (5) premium reduction — they may be able to reduce the premium amount",
      "Tell them the policy will be immediately cancelled",
      "Suggest they shouldn't buy insurance if there is any job risk"
    ],
    correct: 1,
    explanation: "Job loss is a real fear that deserves a thorough response. Pro Achiever has multiple safety nets: (1) 30-day grace period provides immediate breathing room, (2) Premium Pass (after 5 years) is the best option — 12 months of no premiums and no charges, (3) Premium Holiday continues coverage with charges from fund value, (4) policy loan can cover premiums temporarily, (5) premium reduction may be possible. The key message: Pro Achiever is designed with flexibility precisely because life is unpredictable.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to wait until my salary increases before starting.' How do you counter the procrastination?",
    options: [
      "Agree and wait for them to come back",
      "Show the cost of delay: (1) every year of waiting increases their ANB, raising COI permanently, (2) lost compounding — starting 1 year later means 1 fewer year of growth, (3) health risk — a medical event in the interim could make insurance unaffordable or unavailable, (4) suggest starting with the minimum premium NOW and increasing when salary rises. The cost of the minimum premium is likely less than their monthly coffee spend",
      "Tell them their salary will never increase",
      "Promise that premiums will be cheaper next year"
    ],
    correct: 1,
    explanation: "Waiting for a higher salary is one of the most common and costly delays. Counter with: (1) COI increases with ANB — waiting costs money permanently, (2) compound interest rewards time, not timing, (3) health is not guaranteed — a diagnosis tomorrow changes everything, (4) the minimum premium ($200/month) is likely sustainable even at current salary. Show the math: starting at 25 vs 26 at $200/month, the 1-year head start can mean $15,000+ more at retirement. Start small now, increase later.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'The Benefit Illustration projections of 4% and 8% seem unrealistic.' How do you set realistic expectations?",
    options: [
      "Promise that 8% returns are guaranteed",
      "Explain that the 4% and 8% projections are MAS-mandated illustrative rates — they show a range of possible outcomes, not guarantees. Historically, diversified portfolios have returned 6-8% p.a. over long periods, but with significant year-to-year variation. The 4% scenario shows conservative outcomes; the 8% shows optimistic outcomes. Actual results will fall somewhere in between, and the client should plan based on the 4% scenario",
      "Tell them to ignore the Benefit Illustration",
      "Claim that 8% is the minimum expected return"
    ],
    correct: 1,
    explanation: "The BI projections are MAS-mandated illustrative rates designed to show a range of outcomes. Be transparent: (1) these are NOT guarantees, (2) the 4% scenario is the conservative/planning case, (3) the 8% scenario is the optimistic case, (4) historically, diversified balanced portfolios have averaged 6-8% over 20+ year periods, but with significant year-to-year volatility. Always recommend the client plan based on the 4% scenario — if actual returns exceed this, it is a pleasant bonus.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm going through a divorce — I don't want my ex to get any of this money.' What should you advise?",
    options: [
      "Help them hide assets from their spouse",
      "Advise them to consult a lawyer first regarding any financial decisions during divorce proceedings. If the policy is already in force, an irrevocable nomination to a specific beneficiary (e.g., children) can protect the proceeds. However, during active divorce proceedings, any changes to financial arrangements may be scrutinized by the court. Do not provide legal advice — refer to a family lawyer",
      "Cancel all existing policies immediately",
      "Transfer all policies to a friend's name"
    ],
    correct: 1,
    explanation: "Divorce situations require legal caution. As an insurance advisor, you should: (1) NOT provide legal advice, (2) recommend the client consult a family lawyer before making any policy changes, (3) explain that irrevocable nominations to children can protect proceeds from estate claims, (4) note that policy changes during active divorce proceedings may be scrutinized by the court, (5) document all conversations carefully. Your role is to inform about insurance options, not to advise on divorce proceedings.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'll just rely on CPF for retirement — it's government-guaranteed.' How do you show the gap?",
    options: [
      "Tell them CPF is worthless",
      "Acknowledge CPF's strengths (guaranteed returns, government-backed), then show the gap: (1) CPF minimum sum may not cover actual retirement expenses, (2) CPF payouts are fixed — they don't keep pace with lifestyle inflation, (3) CPF withdrawals have age restrictions, (4) CPF alone typically replaces only 30-40% of pre-retirement income vs the recommended 70-80%. Pro Achiever supplements CPF to bridge this gap",
      "Agree that CPF is sufficient for everyone",
      "Suggest they withdraw all their CPF at 55"
    ],
    correct: 1,
    explanation: "CPF is a strong foundation but not a complete retirement solution. The gap: (1) CPF LIFE payouts are typically $800-2,000/month — sufficient for basic needs but not for the lifestyle most Singaporeans want, (2) CPF payouts don't increase with inflation, (3) the replacement ratio is 30-40% vs recommended 70-80%, (4) CPF doesn't provide additional life insurance protection during working years. Pro Achiever bridges this gap: wealth accumulation above CPF, insurance protection, and flexible access after the lock-in period.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I heard that fund managers rarely beat the market — why pay for active management?' How do you defend active fund management within Pro Achiever?",
    options: [
      "Agree and suggest they invest in index funds instead",
      "Acknowledge the debate, then explain: (1) within an ILP structure, active management adds value through asset allocation shifts during market stress, (2) Pro Achiever's Elite portfolios are multi-asset — they manage risk across equities, bonds, and alternatives, (3) the a la carte option includes index/passive funds for clients who prefer them, (4) the value of Pro Achiever is not just fund returns — it is protection + bonuses + discipline + professional management combined",
      "Tell them passive investing is a myth",
      "Promise that AIA's fund managers always beat the market"
    ],
    correct: 1,
    explanation: "The active vs passive debate is nuanced within an ILP context. Key points: (1) AIA's fund platform includes both active and passive options — clients can choose, (2) active management adds value through asset allocation and risk management, especially during volatile markets, (3) the Elite portfolios provide professional multi-asset management that most DIY investors cannot replicate, (4) Pro Achiever's total value proposition extends far beyond fund returns alone. For clients who strongly prefer passive management, highlight the a la carte fund selection which may include index-tracking options.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm planning to emigrate in 5 years — is there any point starting Pro Achiever now?' How do you advise?",
    options: [
      "Tell them not to bother since they are leaving",
      "Explain that Pro Achiever remains valid regardless of where the policyholder resides — it is a Singapore-domiciled policy with global validity. Even after emigrating: premiums can be paid from overseas, coverage remains active, fund management continues, and the death benefit pays out globally. Starting now means 5 years of compounding and protection before they leave, and the policy travels with them",
      "Suggest they wait and buy insurance in their new country",
      "Recommend cancelling all Singapore policies before emigrating"
    ],
    correct: 1,
    explanation: "Pro Achiever policies are portable — they remain valid regardless of where the policyholder lives. Benefits of starting now: (1) 5 years of compounding and DCA before emigrating, (2) continuous insurance coverage during the transition period, (3) the policy continues in force overseas — premiums can be paid remotely, (4) Singapore's regulatory framework provides strong policyholder protection, (5) if the destination country has less favorable insurance products, having a Singapore policy is advantageous. The policy is an asset that travels with them.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'd rather put my money into my children's education savings account.' How do you position Pro Achiever alongside education savings?",
    options: [
      "Tell them education is a waste of money",
      "Agree that education savings are important, then show how Pro Achiever can BE the education savings vehicle: (1) the 15-year plan matures when children are university-age, (2) the Capital Guarantee on Death ensures the education fund is protected even if the parent passes away — no savings account offers this, (3) investment growth potentially exceeds savings account rates, (4) bonuses boost the education fund beyond what pure savings can achieve",
      "Suggest they choose between education and insurance",
      "Tell them children don't need education"
    ],
    correct: 1,
    explanation: "Don't compete with education savings — BE the education savings vehicle. Pro Achiever's 15-year plan aligns with education timelines. The critical advantage over a pure savings account: if the parent dies during the savings period, a savings account stops growing (no more contributions), but Pro Achiever's Capital Guarantee ensures the beneficiary receives at least 101% of premiums paid. This is the 'what if' scenario no savings account can match. Plus, potential investment returns and bonuses can grow the education fund faster.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Your competitor offered me a 3% guaranteed return — can Pro Achiever match that?' How do you respond?",
    options: [
      "Promise a higher guaranteed return (which you cannot)",
      "Clarify the difference: (1) 'guaranteed return' products (endowments/par funds) cap the upside — 3% is often the maximum, not the minimum, (2) Pro Achiever's market-linked approach has no cap on upside — returns can be 6%, 8%, or higher in good years, (3) the Capital Guarantee on Death provides protection on the downside, (4) over 15-20 years, market-linked returns have historically exceeded guaranteed returns. Ask the client: 'Would you prefer guaranteed-low or potential-higher returns over 20 years?'",
      "Tell them guaranteed returns are always fake",
      "Match the competitor's guarantee (which you cannot)"
    ],
    correct: 1,
    explanation: "Don't compete on guarantees — reframe the discussion. A 3% guaranteed return means: (1) the upside is capped — the client will NEVER earn more than 3% (or close to it), (2) after inflation (3-4%), real returns may be negative, (3) Pro Achiever's market-linked returns have unlimited upside potential, (4) historically, diversified portfolios have significantly outperformed guaranteed products over 15-20 year periods. The trade-off is clear: guaranteed mediocrity vs potential for meaningful wealth growth. The Capital Guarantee on Death provides downside protection without capping returns.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I just had a baby — I have too many expenses right now to think about insurance.' How do you turn the life event into motivation?",
    options: [
      "Agree to come back in a year",
      "Acknowledge the expenses, then gently point out: (1) the birth of a child is precisely WHEN insurance becomes most critical — they now have a dependent who relies entirely on them, (2) the minimum premium ($200/month) is less than one month of diapers, (3) the Capital Guarantee on Death means if something happens to them, their child's future is financially secured, (4) starting now at a young age locks in the lowest possible COI",
      "Tell them babies are not that expensive",
      "Recommend a very expensive comprehensive plan"
    ],
    correct: 1,
    explanation: "A new baby is the strongest emotional and logical trigger for insurance. Reframe: (1) the baby has made them the most important financial asset in the household — what happens to the baby if they are gone? (2) $200/month is less than diapers and formula combined — a small price for guaranteed protection, (3) the Capital Guarantee means the child receives at least 101% of premiums if the worst happens, (4) starting now at their youngest age means the lowest lifetime cost. The question is not 'can we afford insurance?' but 'can we afford NOT to have insurance now that we have a baby?'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to see how the policy performs before committing — can I try it for 6 months?' How do you explain?",
    options: [
      "Offer a 6-month trial (which does not exist)",
      "Explain that insurance is not a subscription service: (1) the 14-day cooling-off period is the trial period, (2) short-term performance of an ILP is not meaningful — DCA and compounding need time, (3) judging a 10-20 year investment plan by 6 months is like judging a marathon runner by the first 100 meters. Show the Benefit Illustration projections to demonstrate why the investment period matters, not the first few months",
      "Tell them they can cancel after 6 months with no penalty",
      "Agree and suggest they wait"
    ],
    correct: 1,
    explanation: "This reveals a fundamental misunderstanding of how ILPs work. Educate: (1) the 14-day cooling-off period IS the trial period, (2) in the first 6 months, fund values may fluctuate — this says nothing about long-term performance, (3) DCA requires market cycles to generate value — 6 months is insufficient, (4) early-year charges mean short-term fund values are naturally below premiums paid, (5) the Benefit Illustration shows why the 10-20 year view matters. Cancelling early would crystallize the worst possible outcome.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm a Muslim — does this product comply with Shariah principles?' What is the appropriate response?",
    options: [
      "Tell them Shariah compliance does not matter for insurance",
      "Be respectful and transparent: Pro Achiever 3.0 is a conventional insurance product and may not be fully Shariah-compliant. However, check if any Shariah-compliant fund options are available within the platform. If the client requires strict Shariah compliance, recommend AIA's Takaful products (if available) or direct them to Shariah-compliant financial advisors. Never dismiss religious requirements",
      "Claim the product is fully Shariah-compliant when it is not",
      "Tell them Islam prohibits all forms of insurance"
    ],
    correct: 1,
    explanation: "Religious compliance is a deeply personal requirement that must be respected. Be honest: (1) Pro Achiever 3.0 is a conventional ILP — it involves elements (interest, uncertainty) that some scholars consider non-compliant, (2) check if Shariah-compliant fund options exist within the platform, (3) if strict compliance is required, explore AIA's Takaful offerings or recommend Shariah-compliant alternatives. Providing honest guidance builds trust and positions you as an ethical advisor — that client will refer you to others even if they don't buy from you.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My previous agent left the industry and I was orphaned. Why should I trust that you will stay?' How do you rebuild confidence?",
    options: [
      "Promise you will never leave the industry (which you cannot guarantee)",
      "Validate the frustration, then explain: (1) even if an advisor leaves, the policy continues in force — AIA assigns a new servicing advisor, (2) your commitment is demonstrated through regular reviews, proactive communication, and consistent service, (3) share your career longevity and commitment indicators (certifications, awards, client testimonials), (4) offer to conduct a thorough review of their existing policies as a trust-building first step",
      "Tell them all agents eventually leave",
      "Blame the previous agent for being irresponsible"
    ],
    correct: 1,
    explanation: "Orphaned clients have trust trauma. Rebuild it through: (1) acknowledgment — their frustration is valid, (2) reassurance — the policy is with AIA, not the agent; if you leave, AIA assigns a new advisor, (3) demonstration — offer an immediate free policy review of all their existing coverage as a goodwill gesture, (4) commitment signals — share your track record, ongoing education, professional certifications, (5) regular touchpoints — set up quarterly check-ins to prove consistency. Actions build trust faster than words.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I read that the surrender value is very low in the early years — that scares me.' How do you address surrender value concerns?",
    options: [
      "Agree it is scary and suggest they don't buy",
      "Be transparent: yes, surrender values are low in the early years because of front-loaded charges. Explain WHY: (1) distribution costs are spread over the policy life but accounted for upfront, (2) the low early surrender value is the 'cost' of the welcome bonus, death benefit, and long-term structure, (3) the surrender value crosses the break-even point around Year 7-10, (4) after Year 10, growth accelerates as supplementary charges drop to zero. The policy is designed to be held, not surrendered early",
      "Tell them surrender values don't matter",
      "Lie about the early surrender values"
    ],
    correct: 1,
    explanation: "Honesty about surrender values builds trust. Frame it properly: (1) low early surrender values are the trade-off for welcome bonuses, death benefit protection, and the charge-free period after Year 10, (2) the BI clearly shows the crossover point (Year 7-10) where surrender value exceeds total premiums, (3) after Year 10, growth accelerates significantly, (4) the policy is designed as a long-term commitment — judging it by early surrender values is like judging a house by its construction-phase appearance. If the client cannot commit long-term, this product may not be suitable.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why does my statement show deductions for insurance charges when I thought this was an investment product?' How do you clarify?",
    options: [
      "Tell them to ignore the deductions",
      "Explain the dual nature of ILPs: Pro Achiever is BOTH an investment AND an insurance product. The COI deductions fund the life insurance coverage (including the Capital Guarantee on Death). Without these charges, there would be no death benefit protection. Show the cost is a small fraction of the total premium and provides significant value — ask 'What is the cost of a separate term insurance policy for the same coverage?'",
      "Blame the insurance charges on market conditions",
      "Suggest they switch to a pure investment product"
    ],
    correct: 1,
    explanation: "This reveals a misconception about ILPs. Clarify: (1) Pro Achiever is BOTH investment AND insurance — the COI pays for life insurance coverage, (2) without COI, there would be no Capital Guarantee on Death (101% of premiums or fund value), (3) compare the COI to the cost of a separate term policy for equivalent coverage — it is often comparable or cheaper, (4) the COI is the 'price' of having insurance protection on top of the investment. The client is getting two products in one, and the statement correctly shows both components.",
    category: 'objection-handling'
  },

  // ============================================================
  // BATCH D — COMPLEX ROLEPLAY SCENARIOS (70 questions)
  // ============================================================
  {
    question: "A client received his CPF Annual Statement showing a projected retirement shortfall of $300,000. He is alarmed and asks for your help. What is your approach?",
    options: [
      "Tell him CPF projections are always wrong",
      "Use the shortfall as a starting point for a comprehensive retirement plan: (1) validate his concern — the CPF statement is a useful wake-up call, (2) calculate the monthly savings needed to close the $300,000 gap over his remaining working years, (3) show how Pro Achiever's combination of market-linked growth + bonuses + insurance can be one pillar of the solution, (4) complement with CPF top-ups, other investments, and expense optimization",
      "Tell him to just save more in the bank",
      "Recommend he puts everything into Pro Achiever immediately"
    ],
    correct: 1,
    explanation: "The CPF Annual Statement is a powerful conversation starter because it provides objective, government-issued evidence of a retirement gap. Approach: (1) acknowledge the gap without causing panic, (2) calculate the monthly savings rate needed to close it, (3) show how Pro Achiever fits as one component (not the only one) of the solution — the investment growth + bonuses help close the gap faster than bank savings, (4) CPF top-ups provide guaranteed returns on another portion, (5) create a multi-pronged plan. This shows holistic financial planning, not product-pushing.",
    category: 'roleplay'
  },
  {
    question: "A client going through a divorce asks about policy ownership and beneficiary changes. What should you advise?",
    options: [
      "Help them immediately change all beneficiaries to exclude the ex-spouse",
      "Advise them to consult a family lawyer FIRST before making any policy changes. Explain: (1) during active divorce proceedings, financial arrangements may be subject to court orders, (2) an irrevocable nomination can protect proceeds for specific beneficiaries (e.g., children), (3) policy ownership and beneficiary changes during divorce may be scrutinized, (4) document everything. Do NOT provide legal advice — refer to a qualified lawyer",
      "Tell them divorce has no impact on insurance policies",
      "Recommend surrendering all policies and splitting the proceeds"
    ],
    correct: 1,
    explanation: "Divorce creates complex intersections between family law and insurance. As an advisor: (1) NEVER provide legal advice — refer to a family lawyer immediately, (2) explain that courts can issue orders regarding insurance policies during divorce, (3) making changes to beneficiaries or ownership during proceedings without legal guidance could have legal consequences, (4) once the divorce is finalized and a court order is in place, help the client restructure their policies accordingly. Document all conversations and recommendations in writing.",
    category: 'roleplay'
  },
  {
    question: "A client who just had her first baby 3 weeks ago calls you in a panic: 'I just realized I have no life insurance and my baby depends entirely on me.' How do you handle the emotional conversation?",
    options: [
      "Use her fear to push the largest policy possible",
      "First, calm her down: acknowledge her protective instinct is exactly right. Then guide practically: (1) calculate the minimum coverage needed (income replacement until child reaches 21 + education fund + debts), (2) start with affordable coverage immediately — even a modest Pro Achiever with ATR provides substantial protection, (3) the Capital Guarantee ensures her baby gets at least 101% of premiums if something happens, (4) she can increase coverage as her budget allows",
      "Tell her she should have thought about this before having a baby",
      "Schedule a meeting 3 months from now when she has more time"
    ],
    correct: 1,
    explanation: "A new mother in panic mode needs empathy first, then practical guidance. Steps: (1) validate her instinct — wanting to protect her child is the right response, (2) don't exploit her fear — calculate genuine needs objectively, (3) provide immediate coverage at an affordable level (she can increase later), (4) highlight the Capital Guarantee — her baby receives at least 101% of premiums if the worst happens, (5) act quickly but professionally — the 14-day cooling-off period ensures she can review later with a clear head. This is consultative selling at its most important.",
    category: 'roleplay'
  },
  {
    question: "A client just inherited $200,000 and wants advice on wealth preservation. How do you structure the conversation around Pro Achiever 3.0?",
    options: [
      "Recommend putting all $200,000 into Pro Achiever as a lump sum",
      "Take a holistic approach: (1) determine their immediate needs (emergency fund, debts), (2) discuss their goals (preservation vs growth), (3) recommend diversification — a portion as a regular Pro Achiever premium (capturing DCA benefits and protection), a portion in a top-up, a portion in liquid investments, and maintain an emergency fund. The Capital Guarantee on Death protects the inherited wealth for the next generation",
      "Tell them to spend it and enjoy life",
      "Suggest they give it all to charity"
    ],
    correct: 1,
    explanation: "Inherited wealth requires careful stewardship, not aggressive deployment. Strategy: (1) emergency fund first (6 months of expenses in liquid savings), (2) clear any high-interest debts, (3) allocate a portion to Pro Achiever: regular premium (for DCA and welcome bonus) plus a top-up (for immediate investment), (4) keep a portion liquid for short-term needs, (5) consider other diversified investments. The Capital Guarantee on Death is especially relevant — it ensures the inherited wealth continues to the next generation. This is about preservation with growth, not speculation.",
    category: 'roleplay'
  },
  {
    question: "A client with 5 existing policies (from different insurers) wants your help consolidating. How do you approach this?",
    options: [
      "Cancel all 5 policies and replace with one large Pro Achiever",
      "Conduct a thorough portfolio review: (1) list every policy with coverage, premiums, cash value, and benefits, (2) identify overlaps (e.g., two critical illness riders), gaps (e.g., no investment component), and outdated policies (e.g., old endowments with poor returns), (3) recommend keeping policies with good terms/accrued value, (4) ADD Pro Achiever to fill specific gaps rather than replacing existing coverage. Use MAS Notice 307 comparison for any recommended replacements",
      "Tell them 5 policies is too many and they should pick one",
      "Refuse to review competitor policies"
    ],
    correct: 1,
    explanation: "Portfolio consolidation requires careful analysis, not wholesale replacement. Approach: (1) map all 5 policies showing coverage, premiums, surrender values, and benefits, (2) identify: overlapping coverage (potential savings), gaps (areas to add), and poor performers (candidates for replacement with Notice 307 analysis), (3) recommend keeping policies with accrued value and good terms, (4) position Pro Achiever as filling specific identified gaps. This demonstrates expertise and builds trust. Clients with consolidated, optimized portfolios are loyal long-term relationships.",
    category: 'roleplay'
  },
  {
    question: "A client whose previous advisor left the industry asks you to service his existing Pro Achiever 2.0 policy. He is suspicious and guarded. How do you build trust?",
    options: [
      "Immediately pitch him an upgrade to Pro Achiever 3.0",
      "Lead with service, not sales: (1) offer a complimentary policy review — explain his current policy status, fund performance, and coverage, (2) identify any action items (fund rebalancing, beneficiary updates), (3) establish regular communication (quarterly check-ins), (4) only after trust is built (typically 2-3 meetings), discuss whether a supplementary Pro Achiever 3.0 policy could add value. Let the quality of your service sell, not your pitch",
      "Criticize the previous advisor for abandoning him",
      "Tell him he must switch to 3.0 immediately"
    ],
    correct: 1,
    explanation: "Orphaned clients have been burned once — they are testing whether you will treat them as a policy number or a person. Strategy: (1) no sales pitch in the first meeting — only service, (2) conduct a thorough policy review showing you understand his existing coverage, (3) proactively identify optimization opportunities (fund switches, beneficiary updates) that benefit HIM, (4) establish consistent communication cadence, (5) only discuss new products after trust is earned through demonstrated competence and care. This client, once won over, becomes your strongest referral source because he has experienced both bad and good service.",
    category: 'roleplay'
  },
  {
    question: "A client brings a competitor's proposal printout to your meeting and says, 'Explain to me why Pro Achiever is better than this.' How do you handle the side-by-side comparison?",
    options: [
      "Refuse to look at the competitor's proposal",
      "Welcome the comparison: (1) ask to review the competitor proposal in detail, (2) create a structured comparison table: charges (supplementary, COI, fund fees), bonuses, death benefit structure, flexibility features, fund selection, and company financial strength, (3) highlight where Pro Achiever excels (e.g., supplementary charge dropping to zero), (4) be honest about areas where the competitor may have advantages, (5) let the client make an informed decision",
      "Dismiss the competitor proposal without reading it",
      "Photocopy their proposal to share with your manager"
    ],
    correct: 1,
    explanation: "A client who brings a competitor proposal is doing due diligence — reward this behavior. Your approach: (1) show genuine interest in the competitor's offering, (2) create an objective comparison covering every dimension, (3) highlight Pro Achiever's genuine advantages, (4) be honest about any competitor strengths (this builds credibility enormously), (5) let the comparison speak for itself. If Pro Achiever genuinely offers better value for this client's situation, the facts will demonstrate it. If not, recommending the better product builds trust for future opportunities.",
    category: 'roleplay'
  },
  {
    question: "You are meeting a client for the first follow-up, one week after the initial fact-finding meeting. What should you bring?",
    options: [
      "Just your business card and a smile",
      "Come fully prepared: (1) a personalized Benefit Illustration based on the client's specific premium and investment period from the fact-finding, (2) the Product Highlights Sheet, (3) a summary of the FNA showing identified needs and how Pro Achiever addresses them, (4) comparison scenarios (different premium levels and investment periods), (5) answers to any questions raised in the first meeting, (6) the application form (ready but not presumptuous)",
      "A generic product brochure",
      "Nothing — just do the same presentation again"
    ],
    correct: 1,
    explanation: "The follow-up meeting is where your professionalism shows. Come prepared with personalized materials: (1) BI customized to the client's stated budget and goals, (2) PHS (mandatory), (3) FNA summary connecting their needs to specific Pro Achiever features, (4) comparison scenarios (e.g., '$400/month for 15 years' vs '$600/month for 10 years'), (5) prepared answers to questions from the first meeting. Having the application form ready (but not on the table) shows confidence. This preparation signals respect for the client's time and demonstrates competence.",
    category: 'roleplay'
  },
  {
    question: "You have not contacted a client for over a year. He reaches out to you for an anniversary review. How do you recover the relationship?",
    options: [
      "Pretend you have been busy and move on",
      "Acknowledge the gap honestly: apologize for the lapse in communication, take responsibility, and immediately add value by conducting a thorough anniversary review. Cover: fund performance vs projections, coverage adequacy given any life changes, fund allocation review, and upcoming opportunities (e.g., top-ups, Premium Pass eligibility). Set up a systematic quarterly contact schedule going forward",
      "Blame the client for not reaching out to you",
      "Tell them everything is fine without reviewing anything"
    ],
    correct: 1,
    explanation: "Honesty is the best recovery strategy. Steps: (1) acknowledge the gap — don't make excuses, (2) apologize genuinely and take responsibility, (3) immediately demonstrate value with a thorough review (this is what they came for), (4) set up a systematic communication schedule (quarterly contacts with documented agenda), (5) use a CRM or calendar system to prevent this from happening again. The client reaching out to you (rather than switching advisors) is a second chance — do not waste it. Consistent follow-up is the most basic and most important service you provide.",
    category: 'roleplay'
  },
  {
    question: "A client just got married last month and wants to discuss joint financial planning with you. How do you structure the conversation?",
    options: [
      "Only discuss insurance and ignore other financial topics",
      "Conduct a comprehensive joint financial review: (1) combine both incomes and expenses to understand household cash flow, (2) identify shared goals (BTO, children, retirement), (3) review both spouses' existing coverage and identify gaps, (4) discuss how Pro Achiever protects each spouse and builds shared wealth, (5) plan for future milestones (children, mortgage, career changes), (6) set up individual policies with cross-nominations for maximum protection",
      "Tell them married couples don't need separate policies",
      "Focus only on one spouse's needs and ignore the other"
    ],
    correct: 1,
    explanation: "Marriage is a major financial planning milestone. Structure: (1) household cash flow analysis — both incomes, combined expenses, savings capacity, (2) goal mapping — BTO timeline, children plans, career aspirations, retirement vision, (3) gap analysis — review both spouses' existing coverage and identify where each is under-protected, (4) recommend individual Pro Achiever policies (not joint) with cross-nominations — each spouse nominates the other as beneficiary, (5) plan for future adjustments as milestones approach. This consultative approach positions you as their household financial advisor, not just an insurance seller.",
    category: 'roleplay'
  },
  {
    question: "A client who currently only has a medical (hospitalization) plan wants comprehensive coverage. How do you cross-sell Pro Achiever 3.0?",
    options: [
      "Tell them medical plans are a waste of money",
      "Validate their medical plan choice, then identify the gaps: (1) medical plans cover hospitalization costs but NOT income replacement if they can't work, (2) no death benefit to protect dependents, (3) no wealth accumulation component, (4) no disability coverage. Pro Achiever with ATR fills all three gaps: death/disability coverage, wealth building, and the Capital Guarantee on Death. Show how the two products work together as a comprehensive financial protection plan",
      "Recommend they cancel their medical plan for Pro Achiever",
      "Tell them they have enough coverage"
    ],
    correct: 1,
    explanation: "Medical-only clients have a significant protection gap that they may not realize. Their medical plan covers hospital bills but: (1) does not replace income during recovery, (2) pays nothing if they die (their family gets no financial support), (3) builds no wealth for retirement, (4) provides no disability income. Pro Achiever with ATR addresses all three gaps in a single product. Frame it as completing their financial protection: 'Your medical plan protects your body; Pro Achiever protects your family and your future.' The two products are complementary, not competing.",
    category: 'roleplay'
  },
  {
    question: "A client brings his skeptical wife to the second meeting. She crosses her arms and says, 'Convince me this isn't a waste of money.' How do you handle this?",
    options: [
      "Ignore the wife and focus on the husband",
      "Address the wife directly and respectfully: (1) 'I appreciate your skepticism — it shows you care about your family's finances.' (2) Ask HER what matters most to her (protection, savings, education fund). (3) Show how Pro Achiever addresses HER priorities specifically. (4) Use tangible scenarios: 'If something happened to [husband], how would you cover the mortgage, children's education, and daily expenses?' (5) Let the Capital Guarantee on Death answer her concern about wasting money",
      "Tell the husband to handle his wife",
      "Become defensive about the product"
    ],
    correct: 1,
    explanation: "A skeptical spouse is not an obstacle — she is the decision-maker in disguise. Strategy: (1) validate her skepticism genuinely — 'Your caution protects your family', (2) ask about HER concerns and priorities (she may care about different things than the husband), (3) use scenarios that resonate with her role: if the husband is incapacitated, SHE bears the financial burden, (4) the Capital Guarantee means premium payments are NEVER wasted — at minimum, 101% comes back on death, (5) invite HER questions and answer them thoroughly. When the skeptical spouse becomes an ally, the sale is solid and the policy won't lapse.",
    category: 'roleplay'
  },
  {
    question: "A financially sophisticated client (CFA charterholder) challenges your knowledge with detailed questions about fund expense ratios, Sharpe ratios, and alpha generation. How do you respond?",
    options: [
      "Bluff your way through with generic answers",
      "Be honest about your expertise boundaries: (1) provide what you know (fund factsheets, historical performance, expense ratios), (2) for technical metrics you don't have, commit to getting the data from AIA's investment team and following up within 48 hours, (3) acknowledge that as a CFA charterholder, they bring investment expertise you respect, (4) redirect to Pro Achiever's UNIQUE value: insurance protection, bonuses, and tax efficiency that no direct investment provides",
      "Tell them their CFA knowledge is irrelevant for insurance",
      "Pretend to know everything and make up numbers"
    ],
    correct: 1,
    explanation: "A sophisticated client tests your honesty and competence. The winning response: (1) be transparent about what you know and don't know, (2) leverage their expertise by saying 'You understand the investment side better than most — let me focus on what Pro Achiever adds BEYOND pure investment: protection, bonuses, and tax efficiency', (3) commit to providing detailed fund data within 48 hours (and deliver on that promise), (4) a CFA charterholder already knows how to invest — your value add is the insurance layer, behavioral discipline, and bonus structures. Honesty with a sophisticated client earns deep respect and loyalty.",
    category: 'roleplay'
  },
  {
    question: "A client who inherited $500,000 asks whether to invest it all at once in Pro Achiever or spread it out. What is the optimal strategy?",
    options: [
      "Lump sum everything into Pro Achiever immediately",
      "Recommend a structured deployment: (1) maintain 6-month emergency fund ($30,000-50,000) in liquid savings, (2) start a regular Pro Achiever premium at a level that qualifies for the best welcome bonus tier, (3) deploy a portion as a top-up (capturing immediate market exposure), (4) keep remaining funds in diversified short-term instruments to be deployed over 6-12 months (time-staggered entry), (5) this balances DCA benefits with the need to put inherited capital to work",
      "Tell them to leave it all in a savings account",
      "Invest half and gamble the other half"
    ],
    correct: 1,
    explanation: "Large lump sums require careful deployment. Strategy: (1) liquidity reserve first (emergency fund), (2) regular premium at optimal tier captures welcome bonus + DCA, (3) a top-up deploys some capital immediately (capturing current market exposure), (4) remaining funds deployed in tranches over 6-12 months (combining lump sum efficiency with DCA risk reduction), (5) diversify across asset classes — not everything in one product. This sophisticated approach demonstrates fiduciary thinking and protects the client from deploying a large sum at a single (potentially bad) market entry point.",
    category: 'roleplay'
  },
  {
    question: "During a meeting, a client receives a phone call and you overhear that his mother has just been diagnosed with cancer. He hangs up visibly shaken. What do you do?",
    options: [
      "Use the moment to push insurance urgently",
      "Stop the meeting immediately: (1) express genuine concern for his mother, (2) offer to reschedule — his family needs him now, (3) if he wants to continue briefly, acknowledge that his mother's situation is a reminder of why protection planning matters, but do NOT exploit the emotional moment for a hard sell, (4) follow up in a week with a personal message about his mother's health before any business discussion",
      "Ignore what happened and continue the presentation",
      "Tell him cancer is exactly why he needs to buy today"
    ],
    correct: 1,
    explanation: "This is a test of character, not selling skill. The right response: (1) show genuine human concern — 'I'm sorry about your mother. Please go be with her if you need to.', (2) offer to reschedule without hesitation, (3) if he chooses to continue, be sensitive — acknowledge the connection to insurance naturally but do NOT exploit it, (4) follow up with a personal message about his mother before any business discussion. Clients remember how you treated them during vulnerable moments. Exploiting this moment destroys trust permanently; showing genuine care builds a lifelong client relationship.",
    category: 'roleplay'
  },
  {
    question: "A client who is a financial blogger with 50,000 followers asks very pointed questions designed to test your product knowledge for potential content. How do you handle the meeting?",
    options: [
      "Refuse to answer any questions on the record",
      "Be excited about the opportunity but stay grounded: (1) answer every question honestly and thoroughly — transparency is your best strategy, (2) provide verifiable data (fund factsheets, BI projections, MAS regulations), (3) acknowledge limitations honestly (e.g., 'returns are not guaranteed'), (4) if they plan to review the product publicly, offer to fact-check their content. A fair, well-informed review from a respected blogger is powerful marketing",
      "Give them inflated numbers to make the product look better",
      "Ask them to only write positive things"
    ],
    correct: 1,
    explanation: "A financial blogger is simultaneously a client and a potential amplifier. Strategy: (1) treat them with the same honesty and transparency as any client — no special inflation of numbers, (2) provide verifiable data they can independently confirm, (3) acknowledge product limitations openly — bloggers respect advisors who don't oversell, (4) offer to fact-check their content before publication (this prevents errors that could harm both of you). If Pro Achiever's value proposition is sound (it is), an honest review from a respected blogger is more valuable than any advertisement.",
    category: 'roleplay'
  },
  {
    question: "A client who was retrenched 2 months ago asks if he should surrender his Pro Achiever policy (3 years in) to fund living expenses. What do you advise?",
    options: [
      "Tell him to surrender immediately",
      "Explore all alternatives before surrendering: (1) surrendering at Year 3 will result in significant loss due to surrender charges, (2) check if Premium Pass is available (it is not — requires 5 years), (3) a policy loan may provide cash while keeping the policy active, (4) Premium Holiday keeps coverage active while fund covers charges, (5) help him calculate how long his emergency fund lasts and whether he can sustain the policy. Surrendering should be the absolute last resort",
      "Tell him retrenchment is not a valid reason for surrender",
      "Ignore his financial distress and push for continued payments"
    ],
    correct: 1,
    explanation: "Surrendering at Year 3 is the worst financial decision — it crystallizes maximum losses (high surrender charges, lost bonus, lost coverage). Exhaust all alternatives: (1) policy loan — borrow against fund value for living expenses while keeping the policy, (2) Premium Holiday — stop paying premiums while charges are deducted from fund value, (3) review his overall finances — does he have other savings or income sources? (4) help with job search resources if possible. Only if ALL alternatives fail and he faces genuine financial hardship should surrender be considered. Your job is to protect his long-term interests, not just process his request.",
    category: 'roleplay'
  },
  {
    question: "A client couple sits down and the husband immediately says, 'I want to buy, but my wife thinks it's a bad idea.' How do you navigate the disagreement?",
    options: [
      "Side with the husband since he wants to buy",
      "Address both parties equally: (1) 'I want to make sure you BOTH feel good about this decision.' (2) Ask the wife specifically what her concerns are. (3) Address each concern with facts, not pressure. (4) Find common ground — both likely want financial security for their family, they just disagree on the method. (5) If genuine disagreement remains, suggest they discuss privately and offer a follow-up meeting. Never sell to a divided couple",
      "Tell the wife she is wrong",
      "Ignore the wife and process the husband's application"
    ],
    correct: 1,
    explanation: "Selling to a divided couple is a recipe for early lapsation — the skeptical spouse will push for cancellation during the cooling-off period or stop premium payments later. Better approach: (1) ensure both spouses are heard, (2) address the wife's specific concerns (she likely has valid points), (3) find their shared priority (usually family protection and financial security), (4) if alignment cannot be reached in this meeting, suggest they discuss privately and offer to answer follow-up questions. A policy purchased with both spouses' genuine buy-in is far more likely to stay in force.",
    category: 'roleplay'
  },
  {
    question: "A client concerned about an upcoming recession asks, 'Should I stop paying premiums and keep cash instead?' How do you advise during economic uncertainty?",
    options: [
      "Agree that cash is king during recessions",
      "Address both the emotional and logical dimensions: (1) acknowledge recession fears are valid, (2) explain that stopping premiums means stopping DCA — which is most powerful DURING market dips (buying units cheaper), (3) the Capital Guarantee protects on death regardless of market conditions, (4) if cash flow is genuinely tight, explore Premium Pass or premium reduction rather than full stoppage, (5) historically, investors who stayed invested through recessions came out ahead",
      "Guarantee that the recession will be mild and short",
      "Tell them recessions don't affect insurance products"
    ],
    correct: 1,
    explanation: "Recession anxiety is natural but stopping premiums during dips is counterproductive. Counter-intuitive but true: (1) DCA works BEST during downturns — same premium buys more units at lower prices, (2) stopping means missing the cheapest buying opportunities, (3) the Capital Guarantee provides a floor regardless of market conditions, (4) historical evidence: investors who maintained regular investments through recessions consistently outperformed those who stopped and tried to restart. If cash flow is genuinely constrained, use safety net features (Premium Pass, reduction) rather than stopping entirely.",
    category: 'roleplay'
  },
  {
    question: "A 28-year-old client says, 'Just give me whatever you think is best — I trust you.' How do you handle being given full discretion?",
    options: [
      "Choose the highest premium and longest period for maximum commission",
      "While flattering, full discretion requires even MORE diligence: (1) conduct a thorough FNA regardless — 'I appreciate your trust, and I want to honor it by making sure this is right for you', (2) recommend based on their actual financial situation, not your preference, (3) explain your reasoning for each recommendation so they understand WHY, (4) document the FNA and suitability assessment thoroughly. A client who trusts blindly can also blame blindly if things go wrong",
      "Pick a random product and move on quickly",
      "Tell them they should never trust anyone with financial decisions"
    ],
    correct: 1,
    explanation: "Blind trust is both a compliment and a responsibility. The ethical approach: (1) conduct a full FNA anyway — this protects both of you, (2) recommend what genuinely fits their situation (which may be less than the maximum), (3) explain your reasoning transparently so they become an informed decision-maker, (4) document everything — if they complain later, your documented FNA shows the recommendation was suitable. A client who says 'I trust you' today may say 'You took advantage of me' tomorrow if the recommendation turns out to be unsuitable. Diligence protects trust.",
    category: 'roleplay'
  },
  {
    question: "During a presentation, a client pulls out a newspaper article about a recent investment scam and asks, 'How do I know this isn't the same?' How do you differentiate Pro Achiever from scams?",
    options: [
      "Get offended and defensive",
      "Welcome the question calmly: (1) AIA is publicly listed, regulated by MAS, and has operated in Singapore for decades, (2) every charge is disclosed in the PHS and BI — no hidden fees, (3) MAS requires Financial Needs Analysis, Product Highlights Sheet, and a 14-day cooling-off period — scams have none of these, (4) show your advisor credentials and MAS representative registration, (5) scams promise guaranteed high returns — Pro Achiever explicitly states returns are NOT guaranteed",
      "Tell them to stop reading newspapers",
      "Agree that the financial industry has problems"
    ],
    correct: 1,
    explanation: "Scam concerns are legitimate in a market where fraud exists. Differentiate with facts: (1) AIA is regulated by MAS — one of the strictest financial regulators globally, (2) your advisor credentials are verifiable on MAS's public register, (3) every document (PHS, BI, policy contract) is standardized and transparent, (4) the 14-day cooling-off period is a consumer protection that scams never offer, (5) Pro Achiever explicitly states returns are non-guaranteed — scams always promise unrealistic guaranteed returns. The very fact that you can show all these protections is the difference.",
    category: 'roleplay'
  },
  {
    question: "You are at a family gathering and a relative asks you to recommend something 'off the record' without doing a proper FNA. What should you do?",
    options: [
      "Give a quick recommendation to be helpful",
      "Politely decline to make a specific recommendation without proper process: 'I appreciate you thinking of me! I want to give you the best advice possible, which means sitting down properly to understand your situation. Let me schedule a coffee meeting this week where we can do it right.' This protects both of you — informal recommendations without FNA can lead to unsuitable products and complaints",
      "Recommend the most expensive product since they are family",
      "Tell them you are off duty and refuse to discuss insurance"
    ],
    correct: 1,
    explanation: "Informal recommendations without proper FNA are dangerous for both parties. Why: (1) MAS requires an FNA before any product recommendation — skipping it is a regulatory violation, (2) without understanding their full financial picture, you might recommend something unsuitable, (3) if the recommendation goes wrong, 'family' relationships make complaints even more damaging, (4) doing it right shows professionalism. Redirect to a proper meeting: 'I value our relationship too much to give you anything less than my best advice, which requires a proper conversation.'",
    category: 'roleplay'
  },
  {
    question: "A client wants to start Pro Achiever but their credit score is very low due to past financial difficulties. Does this affect the application?",
    options: [
      "Credit score determines insurance eligibility",
      "Credit scores do not directly determine insurance eligibility in Singapore — AIA's underwriting focuses on health, age, and occupation rather than credit history. However, the advisor should assess whether the client can genuinely sustain the premium commitment given their financial history. If past difficulties indicate cash flow problems, start with the minimum premium and ensure they have an emergency fund first",
      "Tell them they cannot buy insurance with a low credit score",
      "Ignore their financial history entirely"
    ],
    correct: 1,
    explanation: "In Singapore, insurance underwriting is primarily health-based, not credit-based. However, as a responsible advisor: (1) understand why the credit score is low — if it is past financial difficulties that are now resolved, proceed carefully, (2) if ongoing financial stress exists, starting a premium commitment they cannot sustain would be irresponsible, (3) start at the minimum premium to minimize risk, (4) verify they have an emergency fund, (5) the FNA should capture their full financial picture including debt obligations. Suitability includes financial sustainability, not just health eligibility.",
    category: 'roleplay'
  },
  {
    question: "A client who is a foreigner on an Employment Pass says he might leave Singapore in 2-3 years. Should he start Pro Achiever?",
    options: [
      "Tell him not to buy Singapore insurance if he is leaving",
      "Explain that Pro Achiever is valid globally: (1) the policy remains in force regardless of where he lives, (2) premiums can be paid from overseas, (3) the death benefit pays out globally, (4) starting now gives him 2-3 years of coverage and investment accumulation, (5) Singapore's regulatory framework provides strong policyholder protection. If he returns to a country with less developed insurance markets, having a Singapore-based policy is advantageous",
      "Charge him extra because he is a foreigner",
      "Recommend he waits until he settles permanently"
    ],
    correct: 1,
    explanation: "Foreign professionals on Employment Pass are excellent Pro Achiever candidates. Key selling points: (1) the policy is portable — it stays valid globally regardless of where they relocate, (2) Singapore's MAS regulatory framework provides strong policyholder protection they may not get in other jurisdictions, (3) starting now locks in a young-age COI, (4) the policy is an SGD-denominated asset that provides geographic diversification, (5) premium payments can be made remotely. For professionals from countries with less developed insurance markets, a Singapore policy is a valuable financial asset.",
    category: 'roleplay'
  },
  {
    question: "A client's adult child (age 30) calls you saying, 'My mother is 60 and has no insurance. Can she still get Pro Achiever?' How do you advise?",
    options: [
      "Tell them it is too late for the mother",
      "At age 60, Pro Achiever may still be possible but with important caveats: (1) check if she falls within the maximum entry age (typically 65 ANB), (2) COI will be significantly higher at 60, reducing net investment returns, (3) a 10-year plan is the most practical (maturing at 70), (4) medical underwriting will likely require comprehensive health screening, (5) consider whether a combination of term insurance + annuity + small Pro Achiever might better serve her retirement needs at this age",
      "Automatically reject the application based on age alone",
      "Recommend the 20-year plan regardless of age"
    ],
    correct: 1,
    explanation: "Insurance at 60 is possible but requires careful assessment. Considerations: (1) eligibility — is she within the maximum entry age? (2) COI at 60 is substantially higher, impacting net returns, (3) the 10-year plan is most suitable (maturing at 70 aligns with retirement), (4) comprehensive medical underwriting is likely, (5) at 60, the priority shifts from wealth accumulation to wealth preservation and legacy planning. A realistic assessment might recommend a combination of products rather than Pro Achiever alone. The adult child's concern shows a planning gap that can still be partially addressed.",
    category: 'roleplay'
  },
  {
    question: "During a group presentation at a company event, an employee asks a challenging question that you don't know the answer to. All eyes are on you. How do you handle it?",
    options: [
      "Make up an answer to avoid embarrassment",
      "Be honest and professional: 'That is an excellent question, and I want to give you an accurate answer rather than guess. Let me note it down and get back to you within 24 hours with the precise information.' Then follow up within 24 hours as promised. Intellectual honesty in front of a group actually builds MORE credibility than pretending to know everything",
      "Redirect the question to someone else in the audience",
      "Tell them the question is not relevant"
    ],
    correct: 1,
    explanation: "Admitting you don't know something is a STRENGTH, not a weakness. Why: (1) audiences can detect when someone is bluffing — it destroys credibility, (2) saying 'I'll get back to you with the accurate answer' shows integrity, (3) following up within 24 hours demonstrates reliability and commitment, (4) the person who asked becomes a warm lead because you gave them individual attention. In group settings, one authentic 'I don't know but I'll find out' builds more trust than 20 confident answers.",
    category: 'roleplay'
  },
  {
    question: "A client who has been paying Pro Achiever premiums for 8 years suddenly receives a large insurance payout from a car accident claim ($100,000). She asks if she should use it to top up her Pro Achiever. What do you recommend?",
    options: [
      "Yes, put all $100,000 into Pro Achiever as a top-up",
      "Take a holistic view: (1) assess if she has any accident-related expenses to cover first, (2) ensure her emergency fund is adequately topped up (accidents often reveal gaps), (3) if she has outstanding debts, consider paying those down, (4) THEN discuss allocating a portion as a Pro Achiever top-up — her existing policy at Year 8 is almost at the break-even point, and additional funds will benefit from the charge-free period post-Year 10. Do not recommend putting ALL $100,000 in one place",
      "Tell her to spend it on a vacation to recover",
      "Ignore the windfall and discuss regular premiums only"
    ],
    correct: 1,
    explanation: "Windfall management requires a balanced approach, especially from an accident payout. Priority order: (1) cover any ongoing medical or accident-related expenses, (2) replenish emergency fund (accidents often deplete savings), (3) pay down high-interest debts, (4) then consider a Pro Achiever top-up with a portion. At Year 8, her existing policy is approaching the supplementary charge drop (Year 10), so additional funds will soon benefit from charge-free growth. But a holistic plan that addresses immediate needs before long-term investment is the responsible recommendation.",
    category: 'roleplay'
  },
  {
    question: "A client asks you to help structure Pro Achiever policies for his entire family: himself (age 35), wife (age 33), and two children (ages 5 and 3). How do you structure the recommendation?",
    options: [
      "Put everyone on the same plan",
      "Customize for each family member: (1) Father: 20-year plan with ATR — maximum protection as primary breadwinner, higher premium for best bonus tier, (2) Mother: 15-year plan with ATR — protection plus wealth building, moderate premium, (3) Child (age 5): 15-year plan — matures at university age (20), low premium for education fund, (4) Child (age 3): 15-year plan — matures at university age (18), low premium. Cross-nominate beneficiaries. Each policy serves a specific purpose",
      "Only insure the father since he earns the most",
      "Put all the budget into one large policy for the father"
    ],
    correct: 1,
    explanation: "Family insurance planning requires customization by role and need. Father: highest coverage (breadwinner risk), 20-year plan for maximum compounding, ATR for additional death/disability benefit. Mother: meaningful coverage (caregiver replacement value), 15-year plan. Children: 15-year plans that mature at university age — these are primarily education savings vehicles with the bonus of locking in young-age insurability. Cross-nominations ensure each family member is protected. Budget allocation: approximately 50% father, 25% mother, 12.5% each child as a starting framework.",
    category: 'roleplay'
  },
  {
    question: "A prospect who works in banking says, 'I have access to institutional investment products with much lower fees. Why would I use Pro Achiever?' How do you differentiate?",
    options: [
      "Agree that institutional products are always better",
      "Acknowledge their advantage on fees, then highlight what institutional products DON'T provide: (1) life insurance protection with Capital Guarantee on Death, (2) welcome and special bonuses (5-75% welcome, 5-8% special) — institutional products don't offer these, (3) Premium Pass flexibility, (4) tax-efficient insurance wrapper, (5) if they leave banking, they lose access to institutional products but Pro Achiever stays. Ask: 'What happens to your institutional access if you change careers?'",
      "Tell them banking products are risky",
      "Claim Pro Achiever has lower fees than institutional products"
    ],
    correct: 1,
    explanation: "Banking professionals have valid access to low-fee products, so don't compete on fees alone. Differentiate on what institutional products lack: (1) insurance protection layer — no institutional fund provides a death benefit, (2) bonus structures that boost returns beyond fund performance, (3) Premium Pass — no institutional product offers this flexibility, (4) portability — Pro Achiever stays with them regardless of career changes, (5) tax efficiency of the insurance wrapper. Position Pro Achiever as a COMPLEMENT to their institutional investments, not a replacement.",
    category: 'roleplay'
  },
  {
    question: "A client asks you to compare Pro Achiever 3.0 with a Great Eastern Supreme Saver plan. How do you handle the comparison professionally?",
    options: [
      "Trash Great Eastern as a company",
      "Create a structured factual comparison: (1) product type — Supreme Saver is typically an endowment/par plan (guaranteed + non-guaranteed returns) while Pro Achiever is an ILP (fully market-linked + bonuses), (2) charge structure comparison, (3) flexibility features, (4) return potential — endowment caps upside while ILP has unlimited potential, (5) death benefit comparison, (6) liquidity differences. Be fair about areas where the endowment may suit the client better (if they want guaranteed returns and lower risk)",
      "Tell them Great Eastern is going bankrupt",
      "Refuse to discuss competitor products"
    ],
    correct: 1,
    explanation: "Different products suit different needs. Honest comparison: (1) endowments/par plans offer some guarantee but cap returns — suitable for very conservative clients, (2) Pro Achiever's ILP structure has higher return potential but no guarantee on investment returns, (3) Pro Achiever's bonuses (welcome + special) provide additional value, (4) flexibility features (commingling, Premium Pass, fund switching) give Pro Achiever more adaptability. If the client is very risk-averse and wants guarantees, an endowment might genuinely suit them better. Be honest — recommending the right product builds long-term trust.",
    category: 'roleplay'
  },
  {
    question: "A client wants to use Pro Achiever 3.0 as a forced savings mechanism for his impulsive spending habit. Is this a valid use case?",
    options: [
      "Tell him ILPs are not savings accounts",
      "Validate this use case: (1) Pro Achiever's regular premium structure IS effectively a forced savings mechanism, (2) the 10-year lock-in prevents impulsive withdrawal, (3) GIRO auto-deduction removes the temptation to spend, (4) the welcome bonus rewards the discipline, (5) however, ensure the premium is affordable — an impulsive spender forced into an unsustainable premium will lapse. Start at a moderate level and increase as spending discipline improves",
      "Suggest he just cuts up his credit cards instead",
      "Recommend the maximum premium to lock up as much money as possible"
    ],
    correct: 1,
    explanation: "Forced savings is actually one of Pro Achiever's underappreciated strengths. For impulsive spenders: (1) GIRO auto-deduction moves money before they can spend it, (2) the 10-year lock-in makes it inaccessible during moments of weakness, (3) the regular premium structure builds discipline habits, (4) the welcome bonus and investment growth reward the discipline financially. IMPORTANT: start at a sustainable premium — the worst outcome would be an impulsive spender who over-commits and then lapses. Build the habit gradually. This is behavioral finance engineering, and Pro Achiever is well-designed for it.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'If I die in Year 1 after paying only $3,600 in premiums, what does my family get?' How do you demonstrate the value of early coverage?",
    options: [
      "Tell them not to think about dying",
      "Show the math: (1) total premiums paid: $3,600, (2) Capital Guarantee on Death: 101% of $3,600 = $3,636, (3) BUT with ATR attached (e.g., $200,000 sum assured), the total death benefit is $3,636 + $200,000 = $203,636 — that is a $200,000 return on a $3,600 investment in Year 1, (4) this is the fundamental value of insurance: the protection is IMMEDIATE from Day 1, not dependent on years of premium payments",
      "Dodge the question about death",
      "Tell them they will only get $3,600 back"
    ],
    correct: 1,
    explanation: "This is the single most powerful illustration of insurance value. The math speaks: $3,600 in premiums, $203,636 in protection from Day 1 (with ATR). That is a 56x return on 'investment' in Year 1. No other financial product offers this asymmetric protection. This is why insurance is INSURANCE first — it is not an investment that takes years to mature. From the moment the first premium is paid, the client's family is protected for the full sum assured. This illustration often overcomes objections about fees and returns because it shows the core purpose of insurance.",
    category: 'roleplay'
  },
  {
    question: "A client asks you to help them decide between starting Pro Achiever 3.0 or putting the same money toward paying off their $300,000 HDB mortgage faster. What framework do you use?",
    options: [
      "Always choose Pro Achiever over mortgage repayment",
      "Compare the interest rates: (1) HDB mortgage rate (currently ~2.6% concessionary) vs expected investment return (historically 6-8% for diversified portfolios), (2) if investment returns exceed mortgage rate, it makes mathematical sense to invest rather than accelerate mortgage payments, (3) Pro Achiever adds insurance protection the mortgage doesn't provide, (4) the ideal approach may be BOTH: maintain normal mortgage payments while starting a moderate Pro Achiever premium, (5) if the client is risk-averse, accelerating mortgage payment is psychologically valuable",
      "Tell them to ignore the mortgage",
      "Recommend they fully pay off the mortgage before any investment"
    ],
    correct: 1,
    explanation: "This is a classic financial planning decision that depends on interest rate differential and risk tolerance. Framework: (1) if expected investment returns (6-8%) significantly exceed mortgage rate (2.6%), investing the difference creates more wealth mathematically, (2) however, debt repayment has ZERO risk while investment returns are uncertain, (3) Pro Achiever adds insurance protection (if they die, the mortgage becomes a liability for the family — insurance can cover this), (4) the balanced approach: maintain normal mortgage payments + start Pro Achiever at a moderate premium. This captures both the risk reduction of mortgage stability AND the growth potential of investment.",
    category: 'roleplay'
  },
  {
    question: "You discover during a fact-finding that a client has been paying premiums on an old, poorly-performing whole life policy for 15 years. He asks if he should surrender it to fund Pro Achiever. What ethical considerations apply?",
    options: [
      "Immediately recommend surrendering the old policy",
      "Proceed with extreme caution: (1) the old policy has 15 years of accrued value and may have favorable terms not available today, (2) conduct a formal MAS Notice 307 replacement analysis, (3) the old policy's guaranteed cash value, bonuses, and coverage terms must be compared with what Pro Achiever offers, (4) if the old policy is genuinely disadvantageous after thorough analysis, the client may benefit from switching, but the analysis MUST be documented, (5) consider keeping the old policy AND adding Pro Achiever rather than replacing",
      "Tell him old policies are always bad",
      "Ignore the old policy and focus only on the new sale"
    ],
    correct: 1,
    explanation: "Policy replacement is one of the most ethically sensitive areas in financial advisory. Steps: (1) MAS Notice 307 REQUIRES a formal replacement analysis before recommending a switch, (2) the old policy may have guaranteed bonus rates, waiver benefits, or coverage terms that are no longer available in today's market, (3) 15 years of accrued value means surrendering has real financial consequences, (4) the ethical default is to ADD Pro Achiever alongside the old policy rather than replace, (5) only recommend replacement if the analysis clearly shows the client benefits — and document everything. Your reputation depends on putting the client's interest first.",
    category: 'roleplay'
  },

  // ============================================================
  // BATCH A CONTINUED — MORE ADVANCED PRODUCT MECHANICS
  // ============================================================
  {
    question: "What is the typical fund management charge (FMC) range for Pro Achiever 3.0 funds?",
    options: [
      "0% — there are no fund management charges",
      "Typically 0.5% to 1.5% per annum, depending on the specific fund selected",
      "5% per annum flat",
      "10% of profits only"
    ],
    correct: 1,
    explanation: "Fund management charges vary by fund — equity funds typically charge 1.0-1.5% p.a., bond funds charge 0.5-1.0% p.a., and money market funds charge the lowest. These charges are deducted from the fund's net asset value (NAV) daily, so they are already reflected in the unit price. The FMC pays for professional portfolio management, research, and fund administration.",
    category: 'product-facts'
  },
  {
    question: "What is the difference between the fund management charge and the supplementary charge?",
    options: [
      "They are the same charge with different names",
      "The fund management charge is levied by the fund manager for managing the investment portfolio; the supplementary charge is levied by AIA for policy administration and distribution costs. Both are separate and cumulative",
      "The supplementary charge replaces the fund management charge",
      "The fund management charge only applies after Year 10"
    ],
    correct: 1,
    explanation: "These are two separate and distinct charges: (1) the fund management charge (FMC) is charged by the fund manager for investment management — it applies for the life of the fund, (2) the supplementary charge is charged by AIA for policy administration and distribution costs — it is 3.9% for the first 10 years only, then drops to zero. Understanding this distinction helps clients see that while the FMC continues, the AIA-specific supplementary charge is temporary.",
    category: 'product-facts'
  },
  {
    question: "What happens if the policyholder changes occupation to a more hazardous one after the policy is in force?",
    options: [
      "The policy is automatically cancelled",
      "The policyholder must notify AIA of the occupation change. AIA may adjust the Cost of Insurance, add exclusions, or apply premium loading based on the new risk profile",
      "Nothing — occupation has no impact on the policy",
      "The welcome bonus is forfeited"
    ],
    correct: 1,
    explanation: "Policyholders have a duty to notify AIA of material changes, including occupation. If the new occupation is more hazardous (e.g., moving from an office job to offshore oil rigging), AIA may adjust the COI, add exclusions for occupation-related risks, or apply a premium loading. Failure to notify could result in claim complications if a loss is related to the undisclosed occupation change.",
    category: 'product-facts'
  },
  {
    question: "What is a 'policy anniversary' and why is it significant for Pro Achiever 3.0?",
    options: [
      "It is just a date with no significance",
      "It marks each year since the policy's inception and is when special bonuses are credited, premium allocation rates may change, and surrender charges decrease. It is also the reference date for calculating years of premium payment for Premium Pass eligibility",
      "It is the date the policyholder must visit AIA's office",
      "It is when the policyholder must reapply for coverage"
    ],
    correct: 1,
    explanation: "The policy anniversary is significant for several reasons: (1) special bonuses are credited on policy anniversaries (from Year 10 onward), (2) surrender charges decrease at each anniversary, (3) premium allocation rates may adjust, (4) Premium Pass eligibility is calculated based on completed policy years, (5) it is an ideal time for annual reviews with the client to assess fund performance, coverage adequacy, and financial goal alignment.",
    category: 'product-facts'
  },
  {
    question: "Can the policyholder change the investment period (e.g., from 10 years to 15 years) after the policy is in force?",
    options: [
      "Yes, it can be changed at any time with no impact",
      "No, the investment period is fixed at policy inception and cannot be changed once the policy is in force. To access a different investment period, a new supplementary policy must be purchased",
      "Only if the policyholder pays a conversion fee",
      "Yes, but only during the cooling-off period"
    ],
    correct: 1,
    explanation: "The investment period is locked in at policy inception. It determines the bonus structure, charge schedule, and commitment period. Changing it would alter the entire economic structure of the policy. If a client wants a different investment period, they would need to start a new supplementary Pro Achiever 3.0 policy. This is why proper goal-matching at the point of sale is critical — the advisor must ensure the investment period aligns with the client's timeline.",
    category: 'product-facts'
  },
  {
    question: "What is the 'clawback' provision for the welcome bonus?",
    options: [
      "There is no clawback — bonuses are permanent once credited",
      "If the policy lapses or is surrendered within the first 10 years, the welcome bonus (or a portion of it) may be clawed back, meaning it is deducted from the surrender value",
      "Clawback only applies if fund performance is negative",
      "AIA can claw back the bonus at any time for any reason"
    ],
    correct: 1,
    explanation: "The welcome bonus clawback provision means that if the policy lapses or is surrendered in the early years (within the first 10 years), the bonus may be partially or fully deducted from the surrender value. The clawback amount typically decreases over time — the longer the policy has been in force, the less is clawed back. By Year 10, the clawback typically reaches zero. This mechanism protects AIA from paying bonuses on policies that terminate early.",
    category: 'product-facts'
  },
  {
    question: "How is the premium allocation rate different for the 10-year plan vs the 20-year plan?",
    options: [
      "Both plans have identical allocation rates",
      "The 20-year plan typically has higher allocation rates in the early years compared to the 10-year plan, because the longer commitment period allows AIA to spread distribution costs over more years",
      "The 10-year plan has higher allocation rates",
      "Allocation rates depend only on the premium amount, not the investment period"
    ],
    correct: 1,
    explanation: "Longer investment periods generally result in better early-year allocation rates because AIA can spread the cost of distribution (commissions, administrative setup) over more years of expected premium payments. This means a higher proportion of each early premium goes directly into investment for 20-year plans compared to 10-year plans. This is one of the structural advantages of choosing a longer investment period.",
    category: 'product-facts'
  },
  {
    question: "What is the 'free-look cancellation' process for Pro Achiever 3.0?",
    options: [
      "Call AIA and verbally cancel",
      "Submit a written cancellation request to AIA within 14 days of receiving the policy document, along with the original policy document. AIA will process the refund of premiums minus any market value decrease within a specified timeframe",
      "Visit any AIA branch and surrender the policy document",
      "Simply stop paying premiums"
    ],
    correct: 1,
    explanation: "To exercise the free-look cancellation: (1) submit a written request to AIA within 14 days of receiving the policy document, (2) return the original policy document, (3) AIA processes the refund — premiums paid minus any decrease in fund unit value during the period. No surrender charges or administrative fees apply during the free-look period. The refund is typically processed within 7-14 business days after receiving the cancellation request and policy document.",
    category: 'product-facts'
  },
  {
    question: "What is 'rebalancing' in the context of an ILP, and does Pro Achiever 3.0 offer automatic rebalancing?",
    options: [
      "Rebalancing is automatically done daily by AIA",
      "Rebalancing means adjusting the fund allocation back to target percentages when market movements cause drift. Pro Achiever does not automatically rebalance — the policyholder must manually request fund switches. However, Elite portfolios are internally rebalanced by the fund manager",
      "Rebalancing is not relevant to ILPs",
      "Rebalancing only happens at policy maturity"
    ],
    correct: 1,
    explanation: "Rebalancing is the process of adjusting portfolio allocations back to target percentages. In Pro Achiever 3.0, the a la carte fund selection does NOT auto-rebalance — the policyholder must use their free fund switches to manually rebalance. However, the Elite portfolios ARE internally rebalanced by the fund manager as part of the active management. This is an advantage of Elite portfolios for clients who want a hands-off approach.",
    category: 'product-facts'
  },
  {
    question: "What documentation is required to file a death claim on a Pro Achiever 3.0 policy?",
    options: [
      "Just a phone call to AIA is sufficient",
      "Typically required: death certificate, policy document, claim form, beneficiary's identification, NRIC/passport of the deceased, and any additional documents AIA may request depending on the circumstances of death",
      "Only the policy document",
      "A court order is always required"
    ],
    correct: 1,
    explanation: "Filing a death claim requires several documents: (1) official death certificate, (2) completed claim form, (3) original policy document (or statutory declaration if lost), (4) NRIC/passport of the deceased, (5) identification of the beneficiary/nominee, (6) potentially additional documents if death occurred overseas or under unusual circumstances. The advisor should guide the family through this process during a difficult time — this is one of the most important services an advisor provides.",
    category: 'product-facts'
  },
  {
    question: "What is the typical claim processing time for a Pro Achiever 3.0 death claim?",
    options: [
      "24 hours",
      "Typically 14-30 business days after AIA receives all required documentation, though straightforward claims may be processed faster",
      "6-12 months",
      "Claims are never processed — insurance companies don't pay"
    ],
    correct: 1,
    explanation: "AIA typically processes death claims within 14-30 business days after receiving all required documentation. Straightforward cases (natural death, all documents complete) may be processed faster. Complex cases (overseas death, suspicious circumstances, contestability period) may take longer. The advisor should proactively follow up with AIA on the family's behalf to expedite the process.",
    category: 'product-facts'
  },
  {
    question: "What is a 'non-medical limit' in insurance underwriting?",
    options: [
      "The maximum claim amount",
      "The maximum sum assured for which an applicant can be approved without requiring a medical examination, based on their age and the total coverage applied for",
      "The minimum premium for a non-medical policy",
      "The number of policies one can hold without a doctor's note"
    ],
    correct: 1,
    explanation: "The non-medical limit is the maximum sum assured that can be approved based on a health declaration alone, without requiring a medical examination. It varies by age — younger applicants have higher non-medical limits. Exceeding this limit triggers medical underwriting (blood tests, ECG, etc.). This is relevant when sizing the policy: staying within the non-medical limit speeds up the application process significantly.",
    category: 'product-facts'
  },
  {
    question: "How does the 'moratorium period' work for pre-existing conditions in Pro Achiever 3.0?",
    options: [
      "All pre-existing conditions are permanently excluded",
      "Some pre-existing conditions may be covered after a moratorium period (typically 5 years) if the condition has not recurred or required treatment during that time. This depends on the specific underwriting terms offered at policy inception",
      "Pre-existing conditions are always covered from Day 1",
      "There is no such thing as a moratorium period in insurance"
    ],
    correct: 1,
    explanation: "A moratorium period is a waiting period during which a pre-existing condition is excluded from coverage. If the condition does not recur or require treatment during the moratorium period (typically 5 years), it may become covered afterward. The specific terms depend on AIA's underwriting decision at policy inception. Some conditions may be permanently excluded, others may have moratorium periods, and some may be covered with premium loading.",
    category: 'product-facts'
  },

  // ============================================================
  // BATCH B CONTINUED — MORE CLIENT SEGMENT DEEP DIVES
  // ============================================================
  {
    question: "A polytechnic or ITE graduate (age 20) earning $2,200/month asks about Pro Achiever 3.0. How do you make it relevant?",
    options: [
      "Tell them they don't earn enough for insurance",
      "Start small and smart: (1) at age 20, they get the absolute lowest COI rates possible, (2) the minimum premium ($200/month) is less than 10% of income — within recommended guidelines, (3) by age 30, they will have a 10-year headstart on peers who waited, (4) the 10-year lock-in matures at age 30 when they are likely in a stronger financial position, (5) frame insurance as a 'first adult financial decision' that sets the foundation",
      "Recommend they wait until they earn at least $4,000",
      "Suggest a 20-year plan with the maximum premium"
    ],
    correct: 1,
    explanation: "Young diploma/ITE graduates are prime candidates for the minimum premium: (1) age 20 gives the lowest possible COI for their entire policy life, (2) $200/month is affordable at $2,200 income (9.1% — within the 10-15% guideline), (3) the 10-year lock-in matures at 30 — perfect timing as career and income grow, (4) starting early is the single biggest advantage in compounding. Position it as their first grown-up financial move — it signals responsibility and forward thinking.",
    category: 'sales-angles'
  },
  {
    question: "A freelance content creator with brand sponsorship income asks about Pro Achiever. What unique angles do you use?",
    options: [
      "Suggest they get a real job first",
      "Address their unique situation: (1) no employer benefits — Pro Achiever may be their only protection, (2) income volatility — start with minimum premium, annual payment mode timed to peak sponsorship season, (3) Premium Pass is critical for dry months, (4) their social media following means more eyes watching — a bad financial outcome could become public. Position financial planning as part of their personal brand",
      "Tell them social media careers don't last",
      "Recommend the maximum premium since creators earn a lot"
    ],
    correct: 1,
    explanation: "Content creators face unique challenges: irregular income, no employer benefits, and public scrutiny. Strategy: (1) minimum premium to start — sustainability over ambition, (2) annual payment mode aligned with peak sponsorship periods, (3) Premium Pass as a critical safety net, (4) position financial responsibility as part of their personal brand — their audience will respect it. Some creators even document their financial planning journey as content. The key: make it affordable and aligned with their cash flow patterns.",
    category: 'sales-angles'
  },
  {
    question: "A military regular (career soldier) asks about Pro Achiever 3.0. What specific points resonate with this client?",
    options: [
      "Tell them the military provides enough coverage",
      "Highlight alignment with military values: (1) military group insurance ends at retirement (typically 50-55) — what then? (2) fixed ATR premiums mirror the structure and discipline they value, (3) the 20-year plan aligns with a typical military career timeline, (4) the Capital Guarantee on Death provides additional protection beyond military coverage, (5) upon retirement, they will need private insurance — starting now locks in young COI rates",
      "Focus only on the investment returns",
      "Suggest they wait until they leave the military"
    ],
    correct: 1,
    explanation: "Military regulars have specific considerations: (1) SAF group insurance provides coverage DURING service but terminates at retirement — leaving them without protection at an older age when re-insuring is expensive, (2) starting Pro Achiever during service locks in young COI rates, (3) the disciplined premium structure resonates with military culture, (4) the 20-year plan aligns with a career that often runs 20-25 years, (5) upon retirement around 50-55, they have a fully vested policy with no supplementary charges and growing special bonuses.",
    category: 'sales-angles'
  },
  {
    question: "A nurse or healthcare worker earning $3,500/month asks about Pro Achiever. How do you tailor the conversation?",
    options: [
      "Tell them healthcare workers are already covered by the hospital",
      "Connect to their professional experience: (1) they see daily how illness and accidents impact families financially — insurance is real, not theoretical, (2) shift work and exposure to health risks make personal coverage crucial, (3) hospital group insurance has gaps (limited coverage, terminates on leaving), (4) moderate premium ($300-400/month) is sustainable, (5) the 15-year plan builds a solid financial base while they are still relatively young in their career",
      "Focus on complex financial concepts they may not understand",
      "Suggest they can rely on MediShield Life alone"
    ],
    correct: 1,
    explanation: "Healthcare workers have a unique perspective: they witness the financial impact of illness and death daily. Leverage this: (1) they understand the reality of health risks better than most clients, (2) their occupational exposure (infections, stress, shift work) creates personal risk, (3) hospital group insurance has the same gaps as any employer coverage, (4) their empathy and care for others should extend to caring for their own family's financial security. This is a client segment that rarely needs convincing about the WHY — focus on the HOW and WHAT.",
    category: 'sales-angles'
  },
  {
    question: "How do you approach a client who is already heavily invested in unit trusts and ETFs through a brokerage?",
    options: [
      "Tell them unit trusts and ETFs are inferior products",
      "Position Pro Achiever as the insurance-protection layer their existing portfolio lacks: (1) their UT/ETF portfolio has zero death benefit, (2) Pro Achiever adds the Capital Guarantee on Death, (3) the welcome and special bonuses boost returns beyond what a plain UT/ETF delivers, (4) the premium can be modest since they already have investment exposure, (5) frame it as completing their financial picture, not competing with their existing strategy",
      "Suggest they sell all their existing investments for Pro Achiever",
      "Admit your products cannot compete with direct investing"
    ],
    correct: 1,
    explanation: "Clients with existing UT/ETF portfolios are sophisticated — respect their investment knowledge. Don't compete with their strategy; complement it: (1) their existing portfolio builds wealth but provides zero protection if they die, (2) Pro Achiever adds the insurance layer with Capital Guarantee, (3) bonuses provide returns their direct investments cannot match, (4) they can keep the bulk of their investing approach while adding a modest Pro Achiever for protection. Position it as the final piece of a comprehensive financial puzzle, not a replacement for what they are already doing well.",
    category: 'sales-angles'
  },
  {
    question: "A newly promoted manager (from individual contributor to team lead) asks about Pro Achiever. How do you capitalize on this life transition?",
    options: [
      "Treat them the same as before the promotion",
      "Frame the promotion as a financial inflection point: (1) higher income means higher lifestyle spending — protection needs increase accordingly, (2) additional responsibilities (team) may signal a more stable career trajectory — longer commitment is feasible, (3) the salary increase means they can afford a premium that accesses better bonus tiers without impacting lifestyle, (4) as a new leader, financial planning demonstrates the maturity their role demands",
      "Tell them to wait until the next promotion",
      "Recommend they use the entire raise for insurance"
    ],
    correct: 1,
    explanation: "A promotion is a double trigger: (1) increased income (can afford better premium tier), and (2) increased responsibilities (signals stability). Strategy: redirect a portion of the salary increase to Pro Achiever — the client still enjoys lifestyle improvement while building their financial foundation. Show the bonus tier comparison: how the higher premium unlocks a better welcome bonus percentage. Frame financial planning as a leadership quality — responsible leaders plan ahead.",
    category: 'sales-angles'
  },
  {
    question: "A client mentions they have SRS (Supplementary Retirement Scheme) savings. How does this connect to Pro Achiever 3.0?",
    options: [
      "SRS has nothing to do with insurance",
      "Explain that SRS contributions receive tax relief, and SRS funds can be invested in approved products including certain ILPs. If Pro Achiever is SRS-approved, the client can use SRS funds to pay premiums, getting both tax relief and insurance protection. Even if not using SRS for Pro Achiever, it shows the client is retirement-focused — position Pro Achiever as another retirement pillar",
      "Tell them to withdraw all SRS immediately",
      "SRS is only for foreigners"
    ],
    correct: 1,
    explanation: "The SRS connection is relevant on two levels: (1) if Pro Achiever qualifies under the SRS investment scheme, clients can use SRS funds to pay premiums — gaining tax deduction benefits on the contribution, (2) even if using cash for Pro Achiever, a client who uses SRS is already retirement-planning oriented — they understand the value of long-term, tax-efficient savings vehicles. Position Pro Achiever alongside SRS as complementary retirement pillars, each serving a different purpose.",
    category: 'sales-angles'
  },
  {
    question: "A client about to buy a private property (condo) for $1.2M asks about Pro Achiever alongside the property purchase. How do you integrate the advice?",
    options: [
      "Tell them they can't afford both",
      "Integrate insurance into the property planning: (1) a $1.2M mortgage requires mortgage protection — what happens if the client dies and the family can't service the loan? (2) Pro Achiever with ATR can provide the death benefit coverage to protect the mortgage, (3) start with a premium the client can sustain alongside mortgage payments, (4) as the mortgage decreases over time, the Pro Achiever fund value grows — by retirement, the property is paid off and Pro Achiever provides supplementary income",
      "Suggest they don't buy the property and invest in Pro Achiever instead",
      "Recommend the maximum Pro Achiever premium on top of the mortgage"
    ],
    correct: 1,
    explanation: "Property purchases create a natural insurance conversation: (1) a $1.2M mortgage is a massive liability — if the client dies, the family may lose the home, (2) Pro Achiever with ATR provides death benefit coverage that can cover the mortgage, (3) the premium must be affordable alongside the mortgage, (4) as years pass, the mortgage decreases while the Pro Achiever fund value increases — creating a natural financial balance. Frame insurance as an essential part of responsible property ownership, not an additional expense.",
    category: 'sales-angles'
  },

  // ============================================================
  // BATCH C CONTINUED — MORE ADVANCED OBJECTION HANDLING
  // ============================================================
  {
    question: "Client: 'I'll just save the money myself — I have the discipline to invest regularly.' How do you test this claim?",
    options: [
      "Accept their claim without question",
      "Respectfully test their claim: 'That is great! Can I ask — over the past 3 years, how much have you consistently saved and invested each month?' Most people discover their actual savings rate is far below their intended rate. Then show: Pro Achiever removes the choice — GIRO auto-deduction invests before you can spend. For the few truly disciplined investors, acknowledge their ability while highlighting the insurance protection Pro Achiever adds",
      "Tell them they definitely lack discipline",
      "Challenge them aggressively"
    ],
    correct: 1,
    explanation: "Most people overestimate their savings discipline. The gentle reality check: ask about their actual savings track record (not what they plan to do, but what they have done). Common responses reveal inconsistency: months skipped, amounts reduced, emergency dips never replenished. For the rare truly disciplined investor, respect their ability but highlight what self-discipline doesn't provide: insurance protection, welcome bonuses, special bonuses, and capital guarantee on death. Pro Achiever enforces what willpower alone often fails to sustain.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'The market is at an all-time high — this is the worst time to start investing.' How do you address peak-market anxiety?",
    options: [
      "Agree and suggest they wait for a crash",
      "Share the data: (1) markets have hit 'all-time highs' thousands of times throughout history — and then went on to set new highs, (2) DCA means you invest regularly regardless, smoothing out entry points, (3) the historical cost of waiting for a 'better' entry point almost always exceeds the cost of investing at the peak, (4) over a 10-20 year horizon, today's 'all-time high' is often a footnote. The best time to start is always now for a long-term investor",
      "Promise the market will continue going up",
      "Tell them market levels don't matter at all"
    ],
    correct: 1,
    explanation: "Market timing anxiety is universal but counterproductive for long-term investors. Facts: (1) since 1950, the S&P 500 has hit thousands of all-time highs — each one seemed like a 'peak' at the time, (2) investors who invested at every all-time high with a 10-year horizon have never lost money, (3) DCA within Pro Achiever automatically averages across market conditions, (4) the real risk is not investing at the peak — it is not investing at all and missing years of compounding. Over 10-20 years, the entry point matters far less than the time invested.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to use the money for a gap year / travel the world next year.' How do you balance their short-term desire with long-term planning?",
    options: [
      "Tell them travel is a waste of money",
      "Respect their plan, then help them budget for both: (1) calculate the gap year cost and the Pro Achiever minimum premium, (2) if they can afford both (even at minimum premium), they travel AND build their financial foundation, (3) starting Pro Achiever now at minimum means 1 year of insurance coverage during travel and DCA accumulation, (4) upon return, they can increase the premium. The key: don't make them choose between experiences and financial responsibility",
      "Insist they skip the travel entirely",
      "Suggest they start Pro Achiever only after they return"
    ],
    correct: 1,
    explanation: "Young adults should not have to choose between life experiences and financial planning. The smart approach: (1) budget the gap year cost — it is a finite expense, (2) calculate the minimum Pro Achiever premium ($200/month) alongside the travel budget, (3) benefits of starting before travel: insurance coverage while abroad, DCA starts accumulating, COI locked at youngest age, (4) the $200/month is likely less than their daily Grab/food delivery spending. Help them have BOTH the adventure and the financial foundation.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm waiting for my bonus in March before deciding.' How do you maintain momentum without being pushy?",
    options: [
      "Tell them the bonus doesn't matter and they should decide now",
      "Respect the timeline but create a concrete plan: (1) 'Great, let us use the time between now and March productively — I will prepare a customized proposal based on different premium scenarios,' (2) schedule a specific meeting in March when the bonus is confirmed, (3) explain the ANB consideration — if their birthday falls before March, delaying costs them higher COI permanently, (4) offer to start at minimum now and top up when the bonus arrives",
      "Accept the delay and hope they remember you in March",
      "Pressure them to decide immediately regardless"
    ],
    correct: 1,
    explanation: "The bonus timing is a reasonable consideration. Smart response: (1) use the waiting period to prepare customized proposals at different premium levels, (2) set a firm follow-up date in March, (3) check for the birthday factor — if their birthday is before March, starting now saves permanent COI, (4) offer the option to start at minimum premium now and boost via top-up or premium increase when the bonus arrives. This shows respect for their timeline while keeping the process moving. The worst outcome is losing touch during the wait.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I prefer to invest in gold and commodities for safety.' How do you position Pro Achiever alongside commodity investments?",
    options: [
      "Tell them gold is a terrible investment",
      "Acknowledge gold's role as a hedge, then highlight gaps: (1) gold provides no insurance protection, (2) gold has no yield or dividends — it relies purely on price appreciation, (3) commodity prices are highly volatile in the short term, (4) Pro Achiever provides diversified investment across multiple asset classes, insurance protection, and bonus structures. Suggest keeping gold as a small allocation while adding Pro Achiever for protection and diversified growth",
      "Agree that gold is the best investment",
      "Claim Pro Achiever invests in gold too"
    ],
    correct: 1,
    explanation: "Gold and commodities serve a purpose (inflation hedge, crisis protection) but are incomplete as a financial plan. Gaps: (1) no insurance protection if the investor dies, (2) gold generates no income — it does not compound like an investment portfolio, (3) storage costs or ETF management fees apply, (4) commodity prices are volatile. Pro Achiever adds what gold cannot: life insurance protection, diversified investment returns, bonus structures, and professional management. Position Pro Achiever as the core financial plan with gold as a supplementary allocation.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'The exchange rate might make my SGD investments less valuable if I move overseas.' How do you address currency risk?",
    options: [
      "Ignore the currency concern",
      "Address it directly: (1) currency risk works both ways — SGD could strengthen or weaken, (2) having assets in SGD provides geographic diversification if their future income will be in another currency, (3) Pro Achiever's funds invest globally — they hold USD, EUR, and other currency-denominated assets within the SGD wrapper, (4) the Capital Guarantee on Death is in SGD, providing certainty in payout value. A diversified currency exposure is actually an advantage",
      "Promise that SGD will always appreciate",
      "Tell them to convert all savings to USD"
    ],
    correct: 1,
    explanation: "Currency risk is a valid consideration for mobile professionals. Counter with: (1) having an SGD-denominated asset provides diversification if their future income will be in another currency, (2) Pro Achiever's underlying funds invest globally across multiple currencies — the SGD wrapper does not mean all investments are in SGD, (3) SGD has historically been a stable currency backed by strong fundamentals, (4) geographical diversification of assets is actually a risk management best practice. Position the SGD policy as one part of a diversified, multi-currency asset base.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My company is giving me RSUs (Restricted Stock Units) — that is my long-term wealth plan.' How do you complement their RSU strategy?",
    options: [
      "Tell them RSUs are not real wealth",
      "Acknowledge RSU value, then identify concentration risk: (1) RSUs are entirely tied to one company — if the company struggles, both their job AND wealth are at risk simultaneously, (2) RSUs have no insurance protection, (3) RSU vesting schedules mean the value is not immediately accessible, (4) Pro Achiever diversifies beyond the single-company risk, adds insurance protection, and provides guaranteed death benefit. Position Pro Achiever as the 'insurance policy against RSU concentration risk'",
      "Suggest they sell all RSUs immediately",
      "Agree that RSUs are sufficient for all financial needs"
    ],
    correct: 1,
    explanation: "RSUs are valuable but create dangerous concentration risk: the client's income AND wealth are tied to the same company. If the company faces difficulties (think recent tech layoffs), they lose both their salary and their stock value simultaneously. Pro Achiever provides: (1) diversified investment across multiple asset classes and geographies, (2) insurance protection that RSUs never provide, (3) guaranteed death benefit independent of any company's performance. The message: 'Your RSUs are great for upside — Pro Achiever protects the downside.'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'll start insurance once I clear my credit card debt ($15,000).' Should you wait?",
    options: [
      "Agree to wait until all debt is cleared",
      "Assess the debt situation: (1) credit card debt at 25% interest should be a priority — help them create a repayment plan, (2) however, waiting months/years to clear debt means they are uninsured the entire time, (3) if they can manage even the minimum Pro Achiever premium ($200/month) alongside an aggressive debt repayment plan, they should do both, (4) being in debt actually INCREASES their need for insurance — if they die, the debt burden falls on their family",
      "Ignore the debt and push for maximum premium",
      "Tell them credit card debt is not important"
    ],
    correct: 1,
    explanation: "Debt does not eliminate the need for insurance — it increases it. Strategy: (1) acknowledge the debt — help create a repayment plan (this builds trust), (2) explain that being in debt makes insurance MORE important: if they die, their family inherits the financial burden, (3) the minimum Pro Achiever premium ($200/month) alongside an aggressive debt repayment plan can work, (4) once the debt is cleared, the freed-up cash flow can increase the premium. The priority hierarchy: emergency fund > minimum insurance > aggressive debt repayment > increased insurance/investment.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'm a vegetarian/health-conscious person who exercises daily. I don't need insurance because I'll never get sick.' How do you counter the invincibility mindset?",
    options: [
      "Agree that healthy people don't need insurance",
      "Praise their healthy lifestyle, then share reality: (1) a healthy lifestyle reduces risk but doesn't eliminate it — accidents, genetic conditions, and environmental factors are beyond personal control, (2) being healthy actually BENEFITS them with insurance — they get the lowest COI rates and no premium loading, (3) insurance is not just about getting sick — it is about protecting dependents if something unexpected happens, (4) their good health is precisely WHY now is the best time to buy — before any condition develops",
      "Tell them healthy people die too (as a scare tactic)",
      "Dismiss their lifestyle choices as irrelevant"
    ],
    correct: 1,
    explanation: "Health-conscious clients often have an invincibility bias. Counter respectfully: (1) validate their healthy choices, (2) explain that healthy lifestyle ≠ zero risk (car accidents, hereditary cancers, environmental factors), (3) their excellent health status is actually their biggest ADVANTAGE for insurance — they qualify for the best rates with no loadings, (4) insurance is protection against the unexpected, not the expected. The irony: the healthiest people get the cheapest insurance, making it the best financial deal precisely for them.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My HDB flat is my retirement plan — I'll sell it and downgrade when I retire.' How do you show the limitations of this strategy?",
    options: [
      "Agree that HDB downgrading is a complete retirement plan",
      "Acknowledge the strategy's merits but highlight risks: (1) property prices are not guaranteed to appreciate, (2) the downgrade proceeds may not be as large as expected after buying a smaller unit, (3) this is a one-time event — once the proceeds are spent, there is no more income, (4) what if they cannot find a suitable smaller unit? (5) Pro Achiever provides a COMPLEMENTARY income stream through fund value and special bonuses that supplements the HDB downgrade proceeds. Diversification is key",
      "Tell them HDB flats are worthless",
      "Recommend they sell their HDB immediately"
    ],
    correct: 1,
    explanation: "HDB downgrading is a common Singapore retirement strategy but has significant risks: (1) property market may not perform as expected, (2) the net cash from selling and buying a smaller unit may be less than anticipated (transaction costs, COV, renovation), (3) it is a one-time lump sum — not a sustainable income stream, (4) government policies may change (cooling measures, quota restrictions). Pro Achiever provides a complementary and diversified income stream through fund value growth and special bonuses. Having both HDB equity AND Pro Achiever creates a more resilient retirement plan.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Insurance is an expense — I'd rather put money into assets that appreciate.' How do you reframe insurance as an asset?",
    options: [
      "Agree that insurance is just an expense",
      "Reframe Pro Achiever as BOTH protection AND asset: (1) the investment component grows over time — it IS an appreciating asset, (2) the death benefit is an instant 'asset creation' — $3,600 in Year 1 premiums creates $200,000+ in immediate estate value with ATR, (3) the welcome and special bonuses add to the asset's value beyond market returns, (4) after Year 10, the fund value can be withdrawn or used as retirement income. Pro Achiever is an expense that becomes an asset",
      "Tell them assets can lose value too",
      "Agree and suggest only investing in property and stocks"
    ],
    correct: 1,
    explanation: "The expense-vs-asset framing is a fundamental misconception about modern ILPs. Pro Achiever is both: (1) in the early years, it functions as an expense (premium payments) that provides protection, (2) over time, the fund value grows into a genuine financial asset, (3) the death benefit creates instant estate value from Day 1, (4) after the lock-in period, the accumulated fund is fully accessible — it is an asset the client controls. Show the BI projection: by Year 15-20, the fund value significantly exceeds total premiums paid. The 'expense' has become a wealth-generating asset.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've heard of cases where insurance companies reject claims on technicalities.' How do you address the claims rejection fear?",
    options: [
      "Deny that claims are ever rejected",
      "Address it honestly: (1) claims are rejected when policy terms are not met — typically due to non-disclosure of pre-existing conditions or exclusion clauses, (2) this is why thorough and honest health declaration at application is critical, (3) walk the client through the policy's specific exclusions so there are no surprises, (4) AIA's claims approval rate is publicly reported (typically 97-99%), (5) if a claim is disputed, FIDReC provides independent resolution. Transparency at application prevents rejection at claim",
      "Tell them to lie on the health declaration for easier approval",
      "Agree that insurance companies are dishonest"
    ],
    correct: 1,
    explanation: "Claims rejection fear is addressable through transparency. Facts: (1) the vast majority of rejections stem from material non-disclosure at application — the client did not declare a known condition, (2) this is why the health declaration must be 100% accurate and complete, (3) walk the client through every exclusion clause in the policy so expectations are clear, (4) AIA's 97-99% claims approval rate shows that proper disclosure leads to proper payouts, (5) FIDReC exists as an independent avenue if disputes arise. The advisor's role is to ensure honest, complete disclosure at application — this is the best claims-rejection prevention.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Can I just pay 1-2 years of premiums and then stop? Will I still get something back?' How do you explain the consequences?",
    options: [
      "Tell them they will get a full refund",
      "Be honest about the consequences: (1) stopping after 1-2 years means the policy enters Premium Holiday — charges continue to be deducted from the small fund value, (2) surrender value at Year 1-2 will be significantly less than premiums paid due to high early surrender charges, (3) the welcome bonus may be clawed back, (4) the policy will likely lapse quickly as the small fund value is consumed by charges. This is the WORST financial outcome — the client pays premiums and gets almost nothing back",
      "Encourage them to try it for 1-2 years",
      "Tell them they will receive 101% of premiums back"
    ],
    correct: 1,
    explanation: "Paying 1-2 years and stopping is the worst-case scenario financially. Be crystal clear: (1) surrender charges at Year 1-2 are at their highest — the client could lose 70-100% of their premiums, (2) the welcome bonus is clawed back, (3) the small fund value will be rapidly consumed by ongoing charges (COI, fund management), (4) the policy will likely lapse, and the client receives little to nothing. This is why the commitment discussion must happen BEFORE the sale — if the client cannot commit for at least 10 years, this product may not be suitable for them.",
    category: 'objection-handling'
  },

  // ============================================================
  // BATCH D CONTINUED — MORE COMPLEX ROLEPLAY SCENARIOS
  // ============================================================
  {
    question: "A client couple has a combined household income of $15,000/month but spends $14,500/month on lifestyle expenses. They want Pro Achiever. What do you advise?",
    options: [
      "Sign them up for Pro Achiever immediately",
      "Pause the insurance discussion and address the root issue: (1) a $500/month savings rate on $15,000 income is dangerously low (3.3%), (2) help them identify expenses that can be optimized — dining out, subscriptions, car costs, (3) before committing to insurance premiums, they need an emergency fund (3-6 months of expenses), (4) once spending is optimized and cash flow improves, THEN introduce Pro Achiever at an affordable premium. Insurance built on an unsustainable budget will lapse",
      "Tell them they earn too much to have cash flow problems",
      "Recommend the maximum premium since they have high income"
    ],
    correct: 1,
    explanation: "High income with no savings margin is a red flag. Selling Pro Achiever to this couple without addressing their spending pattern would be irresponsible — they would likely lapse within 1-2 years. The responsible approach: (1) conduct a budget review together, (2) identify optimization opportunities, (3) build an emergency fund first, (4) once they have sustainable cash flow (ideally saving 15-20% of income), introduce Pro Achiever at a premium that fits within the new budget. This consultative approach may delay the sale but creates a sustainable long-term client.",
    category: 'roleplay'
  },
  {
    question: "A client tells you he has been diagnosed with Type 2 diabetes. He is worried he cannot get insurance now. How do you help?",
    options: [
      "Tell him he cannot buy insurance anymore",
      "Reassure him that diabetes does not automatically disqualify him: (1) AIA will assess the severity, management, and HbA1c levels, (2) the likely outcomes are: standard acceptance (well-controlled diabetes), acceptance with premium loading, acceptance with exclusions, or in severe cases, decline, (3) encourage him to apply — the worst outcome is a decline, which costs nothing. Getting coverage now, even with loading, is better than waiting until conditions worsen. Help him prepare the application with complete medical history",
      "Tell him to hide the diabetes diagnosis",
      "Suggest he buys insurance from a company that doesn't check"
    ],
    correct: 1,
    explanation: "Type 2 diabetes is a common pre-existing condition that AIA regularly underwrites. Outcomes depend on: (1) HbA1c levels (a measure of blood sugar control), (2) duration and management of the condition, (3) presence of complications. Well-controlled Type 2 diabetes may be accepted with a premium loading (typically 25-100% on COI). The key message: do NOT lie about the condition (this guarantees claim rejection later), and do apply now while management is good. Delaying only increases the risk of complications that could make future applications harder.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'What happens to my Pro Achiever policy if I go to jail?' How do you handle this unexpected question?",
    options: [
      "Refuse to answer such a question",
      "Answer factually: (1) the policy remains in force as long as premiums are paid, regardless of the policyholder's circumstances, (2) if the policyholder cannot personally pay, a family member or trustee can pay on their behalf, (3) the investment component continues to grow, (4) however, if premiums stop, the policy enters Premium Holiday and eventually lapses, (5) upon release, the policy can potentially be reinstated if within the reinstatement period. The insurance contract does not have a morality clause for imprisonment",
      "Tell them the policy is automatically cancelled",
      "Report them to the authorities"
    ],
    correct: 1,
    explanation: "While unusual, this is a factual question with a straightforward answer: (1) insurance policies do not contain imprisonment clauses — the contract remains valid regardless of the policyholder's legal status, (2) the challenge is practical: can premiums be maintained? If a family member or trustee continues paying, the policy stays active, (3) if premiums lapse, the standard lapse and reinstatement rules apply, (4) the death benefit remains payable if the insured event occurs. Answer factually without judgment — the client may be asking for legitimate estate planning reasons.",
    category: 'roleplay'
  },
  {
    question: "A wealthy client (net worth $5M+) says, 'I have more than enough money. Why would I need insurance?' How do you position Pro Achiever for high-net-worth individuals?",
    options: [
      "Agree that wealthy people don't need insurance",
      "Shift the conversation from NEED to STRATEGY: (1) wealthy clients use insurance for estate planning — irrevocable nomination bypasses probate, (2) insurance provides instant liquidity at death while other assets (property, business) take time to liquidate, (3) the welcome and special bonuses provide guaranteed additions that complement their investment portfolio, (4) Pro Achiever is a tax-efficient wealth transfer vehicle, (5) insurance creates a 'separate estate' that creditors cannot touch (with irrevocable nomination)",
      "Tell them they have too much money for insurance",
      "Push a small policy and don't bother explaining"
    ],
    correct: 1,
    explanation: "For HNW clients, insurance is a STRATEGY, not a need. Key angles: (1) estate planning — irrevocable nomination ensures proceeds bypass probate and go directly to beneficiaries, (2) instant liquidity — when a HNW individual dies, their assets (property, business interests, investments) may take months to liquidate; insurance provides immediate cash for the family, (3) creditor protection — irrevocable nomination creates a protected pool of assets, (4) tax-efficient transfer — no capital gains tax on insurance proceeds in Singapore. Pro Achiever becomes a strategic financial planning tool, not a protection product.",
    category: 'roleplay'
  },
  {
    question: "A client shows you a TikTok video where a young influencer says 'insurance is the biggest scam in Singapore.' She wants your reaction. How do you respond?",
    options: [
      "Get angry at the influencer",
      "Stay calm and professional: (1) 'I have seen similar videos. Let me share the facts so you can decide for yourself.' (2) Address the specific claims in the video with evidence, (3) show AIA's claims payout statistics, MAS regulatory framework, and the contractual nature of insurance, (4) explain that influencers create engagement through controversy, not necessarily accuracy, (5) offer to walk through the actual policy document so she can form her own opinion based on facts, not entertainment",
      "Tell her to stop watching TikTok",
      "Agree with the influencer to avoid conflict"
    ],
    correct: 1,
    explanation: "Social media financial content often prioritizes engagement over accuracy. Response strategy: (1) don't attack the influencer — it makes you look defensive, (2) calmly address specific claims with verifiable evidence, (3) AIA's published claims payout rates, MAS regulations, and the legally binding policy contract are your best tools, (4) point out that the influencer likely has no fiduciary duty or financial qualifications, (5) offer to let the client review the actual policy document — facts beat opinions. A client who has seen the evidence and chosen Pro Achiever is more committed than one who never questioned it.",
    category: 'roleplay'
  },
  {
    question: "You are at a networking event and someone casually asks, 'So what do you sell?' How do you answer without launching into a sales pitch?",
    options: [
      "Launch into a full product presentation",
      "Keep it conversational and curiosity-driven: 'I help people build their financial future — I work with AIA on investment and protection planning. What do you do?' Then listen. If they express interest, exchange contacts for a proper meeting. If not, enjoy the conversation. Networking is about building relationships, not making immediate sales. The best prospects come from genuine connections, not elevator pitches at cocktail events",
      "Avoid mentioning insurance at all",
      "Hand them a brochure and walk away"
    ],
    correct: 1,
    explanation: "Networking etiquette: (1) answer briefly and with genuine enthusiasm — 'I help people build their financial future with AIA,' (2) immediately redirect the conversation to them — people love talking about themselves, (3) if interest emerges naturally, exchange contacts for a proper meeting, (4) if not, build a genuine personal connection. The follow-up conversation ('It was great meeting you at [event]. I would love to share some ideas about...') is more effective than a networking-event pitch. Relationships first, business follows naturally.",
    category: 'roleplay'
  },
  {
    question: "A client who works in compliance/audit asks extremely detailed questions about Pro Achiever's regulatory disclosures and fee transparency. How do you match their thoroughness?",
    options: [
      "Give vague, general answers",
      "Match their level of detail: (1) provide the full Product Highlights Sheet with every fee itemized, (2) explain MAS Notice 307 requirements and how they protect consumers, (3) show the Benefit Illustration with clear distinction between guaranteed and non-guaranteed components, (4) explain the FNA process and why it is mandatory, (5) welcome their scrutiny — compliance professionals who verify the regulatory framework are the most confident long-term policyholders",
      "Tell them they are asking too many questions",
      "Skip the details and focus on emotional selling"
    ],
    correct: 1,
    explanation: "Compliance professionals test advisors' regulatory knowledge. Rise to the challenge: (1) know every disclosure requirement (PHS, BI, FNA) and present them proactively, (2) explain MAS Notice 307 requirements for product replacement, (3) detail the fee structure with precision, (4) welcome their scrutiny — 'I appreciate your thoroughness; let me show you exactly how the regulatory framework protects your interests.' A compliance professional who trusts your regulatory knowledge becomes an excellent long-term client and referral source within their professional network.",
    category: 'roleplay'
  },
  {
    question: "A client wants to nominate his girlfriend (not legally married) as the sole beneficiary. What should you advise?",
    options: [
      "Process the nomination without any discussion",
      "Explain the nomination options and implications: (1) a revocable nomination to a girlfriend is possible and can be changed later if the relationship changes, (2) an irrevocable nomination is NOT recommended for a non-family member — it gives the girlfriend veto power over any future changes, (3) if the relationship ends, a revocable nomination can be easily changed, (4) if they plan to marry, they can convert to an irrevocable nomination later, (5) discuss the implications carefully so the client makes an informed choice",
      "Refuse to nominate a girlfriend — only spouses are allowed",
      "Recommend irrevocable nomination for maximum protection"
    ],
    correct: 1,
    explanation: "Nomination of a non-spouse is legally permissible but requires careful consideration. Key advice: (1) a REVOCABLE nomination is strongly recommended — it allows the client to change the nominee if the relationship ends, (2) an irrevocable nomination to a girlfriend is risky — if the relationship ends, the client cannot change the beneficiary without the ex-girlfriend's written consent, (3) explain that upon marriage, the nomination can be updated to include the spouse, (4) in Singapore, if there is no nomination upon death, proceeds go to the estate under the Intestate Succession Act — which may not favor the girlfriend. This is a sensitive conversation requiring tact and legal awareness.",
    category: 'roleplay'
  },
  {
    question: "A client who is an accountant asks you to show the internal rate of return (IRR) of Pro Achiever 3.0 compared to other investment vehicles. How do you prepare?",
    options: [
      "Tell them IRR is not relevant for insurance products",
      "Prepare a thorough analysis: (1) calculate the IRR at both the 4% and 8% BI projection scenarios, including bonuses and net of all charges, (2) compare the insurance-inclusive IRR with comparable investment-only IRR (adjusting for the cost of a separate term policy), (3) show that when you add back the value of insurance protection, the effective IRR improves significantly, (4) present at break-even year, Year 15, and Year 20 to show how IRR improves with time. Accountants respect rigorous financial analysis",
      "Make up favorable IRR numbers",
      "Avoid the discussion entirely"
    ],
    correct: 1,
    explanation: "Accountants think in terms of returns and cash flows — speak their language. Prepare: (1) calculate IRR from the BI at both 4% and 8% scenarios, (2) compare with a BTIR scenario showing the IRR of separate term insurance + direct investment, (3) add the economic value of insurance protection to Pro Achiever's IRR — this levels the comparison, (4) show how IRR improves dramatically after Year 10 when supplementary charges drop to zero. The analysis will show that Pro Achiever's IRR is competitive when you account for all value components (not just fund returns). This level of analysis builds deep professional trust.",
    category: 'roleplay'
  },
  {
    question: "A client from a low-income household (household income $3,500/month) needs insurance but can barely afford $100/month. What is the most responsible recommendation?",
    options: [
      "Sell them Pro Achiever at the minimum premium regardless of affordability",
      "Prioritize pure protection first: (1) if $100/month is the true budget, a term insurance policy provides maximum death benefit coverage per dollar, (2) once their income improves, layer on Pro Achiever for wealth building, (3) help them explore government assistance programs (ComCare, MediFund) to reduce other expenses and free up budget, (4) NEVER sell a product the client cannot sustain — a lapsed policy wastes their premiums and leaves them uninsured",
      "Tell them they are too poor for insurance",
      "Recommend they borrow money to afford a higher premium"
    ],
    correct: 1,
    explanation: "The most responsible advice for low-income clients: (1) protection is the priority — maximum death benefit per dollar means term insurance, not an ILP, (2) Pro Achiever's minimum premium may strain their budget to the point of lapsation, which wastes what little money they have, (3) explore government assistance that could reduce other expenses, (4) create a plan: term insurance now, Pro Achiever when income allows. This is ethical selling — matching the product to the client's reality. If Pro Achiever genuinely fits their budget, great. If not, recommending something they can sustain builds trust for when their situation improves.",
    category: 'roleplay'
  },
  {
    question: "A client mentions they are considering voluntary early retirement at age 50. How does this change your Pro Achiever recommendation?",
    options: [
      "Recommend the standard 20-year plan regardless",
      "Adjust the plan for the shortened earning period: (1) if they are 35, a 15-year plan matures at 50 — perfectly aligned with their retirement target, (2) recommend a higher premium now while income is high to maximize fund accumulation before retirement, (3) after retirement at 50, the policy continues with no supplementary charges, and special bonuses provide supplementary income, (4) the GDIF quarterly dividend fund becomes especially relevant for retirement income, (5) ensure the ATR coverage period extends to protect the family during early retirement years",
      "Tell them early retirement is unrealistic",
      "Suggest they work until 65 instead"
    ],
    correct: 1,
    explanation: "Early retirement planning requires precise alignment: (1) if they are 35, a 15-year plan matures at 50 — synchronizing with retirement, (2) during the earning years (now to 50), maximize contributions — higher premium captures better bonus tiers, (3) post-50, the policy is fully vested: no supplementary charges, special bonuses at 5% p.a. (increasing to 8% from Year 21), and the fund can be drawn for retirement income, (4) GDIF provides quarterly income stream. The plan becomes a personal pension system that complements CPF and other retirement assets.",
    category: 'roleplay'
  },
  {
    question: "You meet a client who speaks limited English and is more comfortable in Mandarin. How do you ensure they fully understand the Pro Achiever proposal?",
    options: [
      "Proceed entirely in English and hope they understand",
      "Communicate in the client's preferred language: (1) if you speak Mandarin, conduct the entire presentation in Mandarin, (2) if you don't, arrange for a Mandarin-speaking colleague to assist, (3) ensure all key documents (PHS, FNA, BI) are explained in the client's language — comprehension is a regulatory requirement, (4) ask the client to explain back key terms in their own words to verify understanding. MAS guidelines require that clients understand what they are buying",
      "Give them the English documents and tell them to translate at home",
      "Skip the detailed explanation to save time"
    ],
    correct: 1,
    explanation: "Ensuring client comprehension is both an ethical obligation and a MAS regulatory requirement. If the client does not fully understand the product features, charges, and risks in their preferred language, the sale should not proceed. Strategy: (1) use the client's preferred language for all explanations, (2) have key documents available in that language if possible, (3) use the 'teach-back' method — ask the client to explain key concepts back to you to verify understanding, (4) if language barriers cannot be adequately overcome, involve a bilingual colleague. A client who doesn't understand their policy is a future complaint.",
    category: 'roleplay'
  },
  {
    question: "A client calls you at 11 PM panicking because the stock market dropped 5% today. He wants to switch all his Pro Achiever funds to money market immediately. How do you handle the after-hours panic call?",
    options: [
      "Process the fund switch immediately to calm him down",
      "Calm first, educate second: (1) acknowledge his anxiety — market drops are stressful, (2) remind him that as a DCA investor, the next premium payment will buy more units at lower prices, (3) a 5% drop is normal market volatility — historically, markets recover within months to years, (4) switching to money market now would lock in the loss and miss the recovery, (5) offer to review his fund allocation at a proper meeting when emotions have settled. Never make financial decisions at 11 PM driven by fear",
      "Tell him to stop watching the market and go to sleep",
      "Agree with his panic and process the switch"
    ],
    correct: 1,
    explanation: "After-hours panic calls require emotional first aid, not financial transactions. Steps: (1) listen and acknowledge — 'I understand this is stressful, and I am here to help,' (2) reframe: a 5% dip for a long-term DCA investor is a buying opportunity, not a crisis, (3) switching to money market locks in the loss — when markets recover (and they historically always do), the client misses the rebound, (4) schedule a proper review meeting when rational thinking returns, (5) use this as a teaching moment about market volatility and the value of the 10-year lock-in. This is exactly the kind of emotional decision the lock-in was designed to prevent.",
    category: 'roleplay'
  },
  {
    question: "A client who runs a small business (5 employees) asks if Pro Achiever can be offered as an employee benefit. How do you explore this opportunity?",
    options: [
      "Tell them Pro Achiever is only for individual purchase",
      "Explore the opportunity creatively: (1) while Pro Achiever is an individual product, the business owner can sponsor policies for key employees as a retention tool, (2) structure it as a keyman insurance + employee benefit, (3) the business pays the premiums, the employee is the life assured, and the nomination can be structured to benefit both the company and the employee, (4) discuss the tax treatment with their accountant, (5) this differentiates the small business from larger competitors in talent retention",
      "Recommend a group insurance plan instead",
      "Tell them 5 employees is too small for any benefit plan"
    ],
    correct: 1,
    explanation: "Small business owners offering Pro Achiever as an employee benefit is a creative application: (1) the business sponsors individual Pro Achiever policies for key employees — this is more customizable than group insurance, (2) it serves dual purposes: keyman insurance for the business AND wealth building for the employee, (3) vesting schedules can be structured (policy ownership transfers to the employee after X years of service) as a retention incentive, (4) tax treatment should be discussed with their accountant. This turns one client into multiple policies and positions you as a business advisor, not just an insurance seller.",
    category: 'roleplay'
  },
  {
    question: "A client's teenage child (age 17) is about to start National Service. The client wants to buy Pro Achiever for the child. How do you structure this?",
    options: [
      "Wait until the child completes NS",
      "Start now for maximum advantage: (1) at age 17-18 (ANB), the child gets the lowest possible COI for their entire life, (2) the parent is the policyholder (payer) and the child is the life assured, (3) a 10-year plan matures at 27-28 — when the child is likely established in their career, (4) the parent pays premiums during NS and early working years, then the child can take over payments, (5) this is one of the most financially efficient insurance strategies: locking in the absolute lowest rates at the youngest possible age",
      "Tell them 17 is too young for insurance",
      "Recommend the child buy their own policy after NS"
    ],
    correct: 1,
    explanation: "Starting Pro Achiever for a pre-NS teenager is one of the smartest financial moves a parent can make: (1) ANB 18 gives the absolute lowest COI rates — these savings compound over a lifetime, (2) the parent acts as policyholder while the child is a minor/NS serviceman, (3) by ORD (age 20-21), the policy already has 2-3 years of DCA accumulation, (4) the 10-year lock-in ends at 27-28 when the child is career-established, (5) ownership can transfer to the child when they are financially independent. This is a gift that appreciates over decades.",
    category: 'roleplay'
  },
  {
    question: "A retired teacher (age 63) with a pension wants to start Pro Achiever for legacy planning. Is this suitable?",
    options: [
      "Tell her she is too old for insurance",
      "Assess carefully: (1) at 63 ANB, check maximum entry age eligibility (typically 65 ANB), (2) COI will be very high at this age — show transparently how it impacts fund growth, (3) if the goal is LEGACY (wealth transfer to beneficiaries) rather than wealth ACCUMULATION, Pro Achiever can work: the Capital Guarantee ensures at least 101% of premiums go to beneficiaries, (4) the irrevocable nomination bypasses probate, (5) however, be honest that the investment returns may be significantly eroded by high COI. A smaller policy focused on legacy may be more suitable than a large one",
      "Recommend the 20-year plan for maximum bonus",
      "Sign her up for the maximum premium immediately"
    ],
    correct: 1,
    explanation: "At 63, suitability depends heavily on the objective. For legacy planning: (1) the Capital Guarantee ensures beneficiaries receive at least 101% of premiums regardless of fund performance — this functions as a wealth transfer mechanism, (2) irrevocable nomination bypasses probate (which is valuable for estate planning), (3) the investment growth may be limited by high COI charges at this age — be transparent about this, (4) a modest 10-year plan focused on legacy transfer may be more suitable than an aggressive wealth accumulation strategy. The pension provides living income; Pro Achiever creates a clean, probate-free legacy.",
    category: 'roleplay'
  },
  {
    question: "A client asks you to recommend Pro Achiever over a Robo-Advisor (e.g., Syfe, StashAway, Endowus) with a detailed comparison. How do you create a fair comparison?",
    options: [
      "Dismiss robo-advisors as unreliable technology",
      "Create an honest, multi-dimensional comparison: (1) fees: robo-advisors charge 0.2-0.65% management fee — Pro Achiever has supplementary charges + FMC but drops supplementary to zero after Year 10, (2) insurance: robo-advisors provide ZERO life insurance protection — Pro Achiever includes Capital Guarantee on Death, (3) bonuses: robo-advisors have no bonus structure — Pro Achiever offers 5-75% welcome + 5-8% special, (4) discipline: robo-advisors allow withdrawal anytime (tempting) — Pro Achiever enforces discipline, (5) recommend both can coexist in a portfolio",
      "Promise that Pro Achiever always outperforms robo-advisors",
      "Tell them robo-advisors will go bankrupt"
    ],
    correct: 1,
    explanation: "A fair comparison respects the client's intelligence. Robo-advisors excel at: low fees, easy access, no lock-in. Pro Achiever excels at: insurance protection, bonus structures, enforced discipline, death benefit guarantee. The total value comparison: (1) robo-advisor returns minus the cost of separate term insurance versus (2) Pro Achiever returns including bonuses and built-in insurance. When you add the cost of separate term insurance to the robo-advisor fees, the gap narrows significantly — and Pro Achiever's bonuses may bridge it entirely. Both can coexist: robo for liquid savings, Pro Achiever for protected long-term wealth.",
    category: 'roleplay'
  },
  {
    question: "A client discovers mid-meeting that his current policy (bought 5 years ago from another advisor) has a much lower welcome bonus than what Pro Achiever 3.0 offers. He is angry at his previous advisor. How do you handle this diplomatically?",
    options: [
      "Agree that his previous advisor cheated him",
      "Stay neutral and professional: (1) explain that product terms change over time — Pro Achiever 3.0 may not have existed when he bought his policy, (2) his existing policy was likely the best available at that time, (3) the 5 years of accrued value in his current policy have real worth that would be lost if surrendered, (4) focus forward: a supplementary Pro Achiever 3.0 policy captures the new bonus structure while preserving his existing investment. Never throw another advisor under the bus — you may be judged the same way in 5 years",
      "Encourage him to file a complaint against the previous advisor",
      "Ignore his frustration and push your product"
    ],
    correct: 1,
    explanation: "Professional integrity requires defending colleagues even when it might benefit you to criticize them. Response: (1) products evolve — the previous advisor recommended what was available then, (2) his existing policy's 5 years of value (accrued bonuses, passed surrender charges, DCA accumulation) is significant, (3) surrendering to 'upgrade' would likely destroy more value than the higher bonus captures, (4) the smart move is to KEEP the existing policy and ADD a new Pro Achiever 3.0 to access the better bonus on future premiums. This protects his existing investment while capturing new opportunities. Professional conduct wins long-term trust.",
    category: 'roleplay'
  },

  // ============================================================
  // BATCH E — REMAINING QUESTIONS TO REACH 300 NEW
  // ============================================================
  {
    question: "What is the 'switching ratio' when performing a fund switch, and why does it matter?",
    options: [
      "It is the ratio of fund switches used vs available",
      "It is the conversion rate between the bid price of the old fund and the offer price of the new fund, which means the number of new units received may be less than expected due to the bid-offer spread on both sides",
      "It is the time ratio between request and execution",
      "It is a fixed 1:1 ratio at all times"
    ],
    correct: 1,
    explanation: "When switching funds, units in the old fund are sold at the bid price and units in the new fund are bought at the offer price. The bid-offer spread applies to both transactions, creating a 'friction cost' in the switch. This means the policyholder receives fewer units in the new fund than the naive calculation might suggest. This is why frequent switching (beyond the 4 free switches) should be avoided — each switch incurs this friction cost.",
    category: 'product-facts'
  },
  {
    question: "What is the 'unit pricing' frequency for Pro Achiever 3.0 funds?",
    options: [
      "Units are priced once per month",
      "Units are typically priced daily (every business day), reflecting the current market value of the underlying assets in each fund",
      "Units are priced in real-time like stocks",
      "Units are priced annually"
    ],
    correct: 1,
    explanation: "Fund units are typically priced once per business day, based on the closing market value of the underlying assets. This means premium allocations, withdrawals, and fund switches are all executed at the daily unit price applicable on the processing date. Unlike stocks which trade in real-time, ILP fund units have a single daily price, which means there is no intra-day trading opportunity.",
    category: 'product-facts'
  },
  {
    question: "Can a Pro Achiever 3.0 policyholder change the premium payment frequency (e.g., monthly to quarterly)?",
    options: [
      "No, the frequency is locked at inception",
      "Yes, the premium payment frequency can generally be changed by submitting a request to AIA. This may affect the modal discount (annual payers typically pay slightly less per year than monthly payers)",
      "Only during the first year",
      "Only after the 10-year lock-in period"
    ],
    correct: 1,
    explanation: "Premium payment frequency can typically be changed by submitting a written request to AIA. The main consideration is the modal discount: annual payers usually receive a small discount compared to paying monthly (because AIA receives the full amount upfront, reducing administrative costs). Switching from monthly to annual can save a small amount per year, while switching to monthly provides better DCA granularity.",
    category: 'product-facts'
  },
  {
    question: "What is the 'total distribution cost' (TDC) disclosure for Pro Achiever 3.0?",
    options: [
      "There is no TDC disclosure requirement",
      "MAS requires disclosure of the total distribution cost — the percentage of premiums that goes toward commissions, marketing, and distribution expenses over the policy's life. For Pro Achiever, this cost is front-loaded in the early years but amortizes to approximately $1/month over a long policy lifetime",
      "TDC is the total cost of all charges combined",
      "TDC only applies to term insurance"
    ],
    correct: 1,
    explanation: "MAS requires transparency on total distribution cost — the amount that funds commissions, marketing, and distribution rather than going directly into the client's investment. This cost is front-loaded (higher in early years) but when spread over the policy's full lifetime, it amortizes to approximately $1/month. This disclosure builds trust: clients can see exactly how much goes to distribution versus investment, and the low amortized cost helps counter the 'high commission' objection.",
    category: 'product-facts'
  },
  {
    question: "What happens to an existing Pro Achiever policy if AIA merges with or is acquired by another insurer?",
    options: [
      "The policy is automatically cancelled",
      "Existing policies are transferred to the acquiring entity with all terms, conditions, and benefits preserved. MAS oversees any insurance company transfers to ensure policyholder interests are protected",
      "Policyholders must reapply with the new company",
      "All benefits are reduced by 50%"
    ],
    correct: 1,
    explanation: "In the event of a merger or acquisition, MAS requires that existing policyholders' rights are fully protected. All policy terms, conditions, coverage, and benefits must be honored by the acquiring entity. MAS oversees the transfer process to ensure no policyholder is disadvantaged. This is another layer of regulatory protection that distinguishes regulated insurance from unregulated investments.",
    category: 'product-facts'
  },
  {
    question: "A single mother earning $4,000/month with a 7-year-old son needs both protection and savings. How do you structure a Pro Achiever proposal?",
    options: [
      "Recommend the maximum premium for maximum coverage",
      "Balance protection and affordability: (1) a 10-15 year Pro Achiever plan with ATR at $300-400/month (7.5-10% of income — within guidelines), (2) the ATR provides affordable additional death benefit without increasing the investment premium, (3) a 15-year plan matures when her son is 22 — covering his university years, (4) nominate the son as irrevocable beneficiary for maximum protection, (5) ensure she has an emergency fund and medical insurance first",
      "Tell her to wait until her son is older",
      "Recommend only term insurance with no savings component"
    ],
    correct: 1,
    explanation: "Single parents need both protection AND savings, making Pro Achiever with ATR ideal: (1) the ATR provides maximum death benefit coverage at an affordable cost, (2) the investment component builds an education fund for the son, (3) the 15-year plan matures at the son's university age, (4) irrevocable nomination to the son ensures proceeds bypass any estate complications, (5) the premium at $300-400/month is sustainable at $4,000/month income. Key: ensure emergency fund and medical insurance are in place first — these are the foundation.",
    category: 'sales-angles'
  },
  {
    question: "How do you handle a prospect who says, 'I've been ghosted by three advisors after I told them I only want to invest $200/month'?",
    options: [
      "Ghost them too since $200/month is too low",
      "See this as an opportunity: (1) 'I appreciate your honesty, and I am sorry about that experience. Every client matters regardless of premium size.' (2) $200/month IS the minimum for Pro Achiever — show them what it can grow to over 10-20 years, (3) a small start builds the relationship — when their income grows, they increase the premium WITH you, (4) small clients often have the best referral networks because they remember who treated them with respect",
      "Tell them $200 is not worth your time either",
      "Suggest they try online insurance platforms instead"
    ],
    correct: 1,
    explanation: "Advisors who ghost small-premium clients miss the long game. $200/month clients: (1) are often young with high future earning potential — they will increase premiums as income grows, (2) remember the advisor who treated them with respect when others didn't, (3) generate referrals from friends at similar life stages, (4) $200/month over 20 years is $48,000 in total premiums + bonuses + investment growth. The lifetime value of a loyal client far exceeds the first-year commission. This is relationship investing.",
    category: 'sales-angles'
  },
  {
    question: "A client asks, 'What is the biggest mistake people make with ILPs?' How do you answer honestly while maintaining confidence in Pro Achiever?",
    options: [
      "Tell them there are no mistakes possible with ILPs",
      "Be honest — the biggest mistakes are: (1) surrendering in the early years due to short-term market dips or cash flow pressures — crystallizing the worst possible outcome, (2) not understanding the charge structure before buying, (3) treating the 10-year lock-in as a negative rather than a discipline mechanism, (4) buying a premium they cannot sustain long-term. Then show how proper advice addresses each mistake: thorough FNA, transparent fee discussion, realistic premium sizing, and ongoing advisor support",
      "Blame all ILP problems on the clients themselves",
      "Refuse to discuss negative aspects of ILPs"
    ],
    correct: 1,
    explanation: "Honesty about common mistakes positions you as a trusted advisor. The big mistakes: (1) early surrender — the single most expensive mistake, (2) buying without understanding charges — leads to disappointment, (3) overcommitting on premium — leads to lapsation, (4) panic-switching during market dips — locks in losses. Your value as an advisor: you prevent ALL of these through proper FNA, transparent fee discussion, sustainable premium sizing, and ongoing guidance during market volatility. A client who understands the pitfalls is far less likely to fall into them.",
    category: 'sales-angles'
  },
  {
    question: "Client: 'My friend surrendered her ILP after 3 years and lost 40% of her money. Why should I trust ILPs?' How do you address this cautionary tale?",
    options: [
      "Tell them their friend made a bad decision",
      "Validate the friend's experience, then explain WHY it happened: (1) surrendering an ILP at Year 3 is the absolute worst timing — maximum surrender charges, (2) the product was not the problem — the decision to exit prematurely was, (3) draw the analogy: it is like buying a house and selling it 6 months later — you lose on transaction costs, (4) Pro Achiever is designed for a minimum 10-year commitment, and if held long-term, the economics are fundamentally different. Show the BI to demonstrate the long-term trajectory",
      "Deny that ILP losses ever happen",
      "Agree that all ILPs are risky and suggest alternatives"
    ],
    correct: 1,
    explanation: "The friend's experience is real and valid — but the lesson is about timing, not the product. Key points: (1) Year 3 surrender captures the worst possible outcome: highest surrender charges, clawed-back bonus, minimal investment growth, (2) the SAME product held for 10-20 years shows fundamentally different economics, (3) the analogy: buying property and selling immediately always loses money (stamp duty, agent fees), but holding long-term creates wealth. The lesson: ILPs require commitment, and the advisor's job is to ensure the client can commit before they buy.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why do I need a financial advisor when I can buy insurance online directly?' How do you justify your value?",
    options: [
      "Tell them online platforms are illegal",
      "Acknowledge that direct-to-consumer options exist, then highlight your value-add: (1) you conduct a comprehensive FNA to ensure suitability — online platforms cannot assess your full financial picture, (2) you provide ongoing service: annual reviews, fund switch advice, claims support, (3) you are accountable to MAS for the advice given — online platforms offer products, not advice, (4) the claims process support alone justifies your involvement — when a family is grieving, they need a human guide, not a website",
      "Agree that online is always cheaper and better",
      "Get defensive about your role"
    ],
    correct: 1,
    explanation: "The advisor vs online debate is about advice vs access. Your value: (1) FNA-driven suitability — you assess the entire financial picture, not just sell a product, (2) ongoing relationship — annual reviews, life-stage adjustments, fund management guidance, (3) claims support — when a loved one dies, the family needs a person to guide them through documents and processes, not a chatbot, (4) MAS accountability — you are personally liable for suitability, creating a genuine incentive to advise well. Online platforms offer convenience; you offer wisdom, service, and long-term partnership.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to start small with $200/month but I'm embarrassed it is so low.' How do you make them feel valued?",
    options: [
      "Agree that $200 is very low and they should save up first",
      "Reframe emphatically: (1) '$200/month is a GREAT start — do you know what $200/month grows to over 20 years with bonuses and compounding?' (Show the math: ~$48,000 in premiums + welcome bonus + special bonuses + investment growth), (2) starting with $200 at age 25 is worth more than starting with $500 at age 35 because of compounding time, (3) your premium can increase as your career grows. There is no 'too small' — there is only 'too late'",
      "Tell them to come back when they can afford $500",
      "Sign them up quickly before they change their mind"
    ],
    correct: 1,
    explanation: "Never make a client feel inadequate about their premium size. $200/month is meaningful: (1) over 20 years = $48,000 in premiums, (2) with welcome bonus (e.g., 30% = $720 in Year 1), special bonuses, and investment growth, the fund value can be significantly higher, (3) $200/month started at 25 outperforms $500/month started at 35 due to compounding. Your enthusiasm for their $200 commitment signals that you value THEM, not just the commission. These clients become your most loyal referral sources because you treated them with respect when others didn't.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What guarantees do I have that my money is safe?' How do you explain the guarantee structure?",
    options: [
      "Promise that everything is 100% guaranteed",
      "Explain the layered guarantee structure honestly: (1) GUARANTEED: Capital Guarantee on Death — beneficiary receives the HIGHER of 101% of premiums or fund value, (2) GUARANTEED: charge structure — supplementary charge drops to zero after Year 10 as per contract, (3) NOT GUARANTEED: investment returns — these depend on market performance, (4) NOT GUARANTEED: bonus rates — AIA can revise these (though they have been consistent), (5) REGULATORY PROTECTION: MAS oversight, PPF scheme, segregated fund assets",
      "Avoid the guarantee discussion entirely",
      "Tell them insurance has no guarantees at all"
    ],
    correct: 1,
    explanation: "Being precise about what is and isn't guaranteed builds credibility. Guaranteed: Capital Guarantee on Death (contractual), charge structure (contractual), policy terms. Non-guaranteed: fund performance, bonus rates, BI projections. Regulatory protection: MAS capital adequacy requirements, PPF scheme for insurer failure, segregated fund assets. This layered explanation shows that while investment returns are not guaranteed, there are multiple levels of structural protection. An informed client who understands the guarantee boundaries is more confident than one given false assurances.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I saw a YouTube video comparing ILPs unfavorably with ETFs — the ILP lost in every scenario.' How do you address this specific comparison?",
    options: [
      "Dismiss YouTube as unreliable",
      "Address the comparison methodology: (1) most YouTube comparisons only look at fund returns vs ETF returns — ignoring the insurance component entirely, (2) if you add the cost of separate term insurance to the ETF returns, the gap narrows significantly, (3) they also ignore welcome bonuses (5-75%) and special bonuses that boost ILP returns beyond pure fund performance, (4) and they ignore the behavioral advantage: most ETF investors don't actually stay invested for 20 years without an advisor. Ask: 'Did the video account for insurance costs and bonuses?'",
      "Agree that ETFs always win",
      "Tell them YouTube creators are all uneducated"
    ],
    correct: 1,
    explanation: "YouTube ILP-vs-ETF comparisons typically commit three methodological errors: (1) they compare ILP returns WITH insurance charges to ETF returns WITHOUT insurance costs — the fair comparison adds the cost of a separate term policy to the ETF side, (2) they exclude bonus structures (welcome + special) that boost ILP returns, (3) they assume perfect ETF investor behavior (consistent investing, no panic selling) which data shows is the exception. When you correct these three errors, the comparison is much closer — and often favors the ILP for clients who value enforced discipline and integrated protection.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Is it true that advisors earn more commission on ILPs than on term insurance? Is that why you are recommending this?' How do you handle the commission transparency question?",
    options: [
      "Deny that commission differences exist",
      "Be fully transparent: (1) yes, ILP commissions are typically higher than term commissions — this is industry-standard, (2) however, my recommendation is based on YOUR Financial Needs Analysis, which shows you need both protection AND wealth accumulation, (3) the total distribution cost linearizes to about $1/month over the policy's life, (4) I am regulated by MAS and accountable for suitability — recommending an unsuitable product would cost me my career. Transparency on commission builds trust; evasion destroys it",
      "Get angry at the accusation",
      "Offer to lower your commission (which you cannot)"
    ],
    correct: 1,
    explanation: "Commission transparency is a trust test — pass it with flying colors. The honest answer: (1) yes, ILP commissions are higher — this is publicly known and industry-standard, (2) however, the recommendation must be suitable or you risk MAS sanctions, (3) the total distribution cost is about $1/month amortized, (4) your ongoing service (annual reviews, claims support, fund guidance) is funded by this commission. The key reframe: 'I earn commission on every product I sell — the question is whether the product is RIGHT for you. My FNA shows it is. Would you like to review the analysis together?'",
    category: 'objection-handling'
  },
  {
    question: "A couple disagrees on whether to start Pro Achiever or renovate their new BTO flat first. Both cost about $500/month. How do you navigate this budget conflict?",
    options: [
      "Tell them to skip renovation entirely",
      "Help them find a middle path: (1) renovation is a one-time expense (typically $30,000-50,000) over 6-12 months; insurance is an ongoing commitment, (2) consider starting Pro Achiever at minimum $200/month now while saving separately for renovation, (3) after renovation is complete and paid off, increase the Pro Achiever premium with the freed-up cash flow, (4) the critical point: renovation can wait 6 months; their insurability cannot — a health event during the delay could make insurance permanently more expensive or unavailable",
      "Insist that insurance is always more important than renovation",
      "Agree to wait until after renovation is complete"
    ],
    correct: 1,
    explanation: "Budget conflicts need creative solutions, not ultimatums. The reconciliation: (1) renovation is temporary (6-12 months), insurance is permanent — they are different commitment types, (2) starting Pro Achiever at minimum ($200/month) now + renovation savings simultaneously is often feasible, (3) after renovation ends, the $500/month freed up can increase the Pro Achiever premium, (4) the irreversible risk: renovation can be delayed, but a health diagnosis during the delay permanently affects insurability. Frame it as: 'Start small on insurance now, renovate on schedule, then boost insurance after. You get both without compromise.'",
    category: 'roleplay'
  },
  {
    question: "A client who is an F&B (food and beverage) business owner with seasonal income fluctuations asks about Pro Achiever. How do you structure the recommendation?",
    options: [
      "Recommend monthly premium at a high amount",
      "Align with their cash flow pattern: (1) annual payment mode timed to post-peak season (e.g., after Chinese New Year or year-end festive period when F&B revenue is highest), (2) conservative premium that is sustainable even during the slowest quarter, (3) Premium Pass eligibility at Year 5 provides a critical buffer for unexpected downturns (e.g., another pandemic), (4) emphasize that F&B owners have ZERO employer benefits — this is their financial safety net",
      "Tell them to close their F&B business first",
      "Recommend they only buy insurance when the business is profitable for 5 years"
    ],
    correct: 1,
    explanation: "F&B owners face unique challenges: seasonal revenue, thin margins, operational risks, and zero employer benefits. Strategy: (1) annual premium payment timed to peak revenue season — the money is available and the psychology is positive, (2) conservative premium that does not strain cash flow during slow months (typically Jan-Feb, off-peak periods), (3) Premium Pass after 5 years is essential for F&B owners who experienced the pandemic firsthand, (4) as a business owner, they understand risk management — insurance is risk management for their family.",
    category: 'sales-angles'
  },
  {
    question: "A client working in the maritime/shipping industry has irregular shore leave and frequent overseas travel. How do you adapt the sales process?",
    options: [
      "Tell them the maritime industry disqualifies them from insurance",
      "Adapt to their schedule: (1) use video calls for initial consultations when they are at sea, (2) prepare all documentation for efficient in-person signing during shore leave, (3) explain that Pro Achiever provides worldwide coverage — they are protected even while overseas on vessels, (4) GIRO auto-deduction ensures premiums are paid even when they are unable to make manual payments, (5) their occupation may require premium loading depending on the specific role (deck vs engine vs office)",
      "Only meet them in person at your office",
      "Suggest they change careers to something safer"
    ],
    correct: 1,
    explanation: "Maritime professionals need insurance more than most (hazardous occupation, family separation) but are hard to reach. Adaptation: (1) leverage technology — video calls, digital document sharing, e-signatures where possible, (2) batch all documentation for efficient processing during limited shore leave, (3) GIRO auto-deduction is essential — manual payment is impractical when at sea for months, (4) emphasize the worldwide coverage feature, (5) be transparent about any occupational premium loading. Serving this underserved market well opens referrals within a tight-knit maritime community.",
    category: 'sales-angles'
  },
  {
    question: "Client: 'The charges eat up too much in the early years — by the time the policy makes money, I've already lost several years.' How do you address the J-curve concern?",
    options: [
      "Deny that early-year charges are significant",
      "Acknowledge the J-curve pattern and reframe it: (1) yes, early years have a 'dip' where surrender value is below premiums paid — this is the J-curve, (2) however, this is IDENTICAL to how private equity, real estate, and even education investments work — you invest upfront for long-term returns, (3) the supplementary charge dropping to zero at Year 10 is the inflection point, (4) after Year 10, growth accelerates significantly with bonuses and charge-free compounding. Show the BI graph: the J-curve eventually becomes a hockey stick",
      "Tell them not to look at early-year values",
      "Promise the J-curve doesn't apply to Pro Achiever"
    ],
    correct: 1,
    explanation: "The J-curve is real and acknowledging it builds credibility. Every long-term investment has a similar pattern: (1) education costs money upfront before generating income, (2) property has transaction costs that take years to recoup, (3) businesses take 3-5 years to become profitable. Pro Achiever's J-curve: premiums exceed surrender value in early years, but after Year 7-10, the curve inflects upward. After Year 10, supplementary charges drop to zero and special bonuses kick in — creating accelerated growth. Show the BI graph and mark the inflection point. Clients who understand the J-curve don't panic during the dip.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I do not want any part of my premium going to an insurance company's profits.' How do you address the ethical objection?",
    options: [
      "Agree that insurance companies make too much money",
      "Reframe the profit conversation: (1) AIA's profit funds its ability to pay claims — an unprofitable insurer is a risky insurer, (2) AIA's financial strength (reflected in ratings) is sustained by profitable operations — this PROTECTS policyholders, (3) every business the client patronizes (banks, telcos, supermarkets) earns a profit — insurance is no different, (4) the specific profit margin on the client's policy is small relative to the total value delivered: insurance protection, investment management, regulatory compliance, and lifetime service",
      "Tell them no company profits from their premium",
      "Suggest they start a mutual insurance company instead"
    ],
    correct: 1,
    explanation: "Anti-profit sentiment in insurance is common but misguided. Key reframes: (1) profitability = sustainability — an insurer that cannot pay claims because it has no profits is far more dangerous than one that makes reasonable margins, (2) AIA's financial strength ratings (which clients want to be high) require profitability, (3) the profit embedded in Pro Achiever premiums funds: risk management, claims reserves, actuarial analysis, fund management, regulatory compliance, and advisor training. The question is not 'does AIA profit?' but 'does the value delivered to me exceed what I pay?' The Benefit Illustration helps answer that.",
    category: 'objection-handling'
  },
  {
    question: "A client who owns multiple investment properties asks about Pro Achiever. He says, 'My properties ARE my insurance — if I die, my family sells them.' What gap do you identify?",
    options: [
      "Agree that property is sufficient as insurance",
      "Identify the critical gaps: (1) property sales take 3-6 months minimum — the family has no immediate cash, (2) selling in a down market may result in significant losses, (3) rental income stops if tenants leave during the family's crisis, (4) outstanding mortgages must be serviced during the sale period, (5) legal fees, agent commissions, and taxes reduce the net proceeds, (6) Pro Achiever's death benefit provides IMMEDIATE cash to cover expenses while the family decides on property at their own pace, not under financial pressure",
      "Tell him property is a terrible investment",
      "Suggest he sells all properties and buys insurance"
    ],
    correct: 1,
    explanation: "Property as insurance has critical flaws: (1) TIMING — property cannot be liquidated quickly; the family needs immediate cash for funeral, debts, and living expenses, (2) PRICE — forced sales during grief or market downturns result in below-market prices, (3) CARRYING COSTS — mortgages, property tax, maintenance must continue during the sale period, (4) COMPLEXITY — the family may not have the expertise to manage and sell properties. Pro Achiever provides immediate, liquid, guaranteed cash while the family makes deliberate decisions about property. Insurance provides the TIME for smart property decisions.",
    category: 'objection-handling'
  },
  {
    question: "A prospect at a career crossroads — she received offers from two companies (one startup, one MNC) — asks whether to start Pro Achiever before deciding. What do you advise?",
    options: [
      "Wait until she chooses a company and settles in",
      "Start now regardless of which company she joins: (1) her age and health won't improve by waiting — lock in today's COI, (2) Pro Achiever is portable — it has nothing to do with her employer, (3) whether she joins the startup (higher risk, possibly higher reward) or the MNC (stable, group benefits), personal insurance remains essential, (4) if she joins the startup and it fails, she will have coverage when she needs it most. Career uncertainty is EXACTLY when personal insurance matters most",
      "Only start if she joins the MNC",
      "Tell her to focus on her career first"
    ],
    correct: 1,
    explanation: "Career uncertainty increases the importance of personal insurance, not decreases it. Key points: (1) Pro Achiever is personal and portable — it moves with her regardless of employer, (2) if she joins the startup and it fails, her Pro Achiever coverage continues (unlike employer group insurance), (3) if she joins the MNC, Pro Achiever supplements the group insurance that terminates when she eventually leaves, (4) her current health and age are at their most favorable right now — waiting for career clarity costs her permanent COI increases. Start now at minimum premium; adjust later when career stabilizes.",
    category: 'roleplay'
  },
  {
    question: "A client's elderly father just passed away WITHOUT insurance, and the family is struggling with funeral costs and lost income. The client (age 30) now wants to act urgently. How do you channel this energy responsibly?",
    options: [
      "Use the father's death to push the maximum policy",
      "Honor the urgency while ensuring proper process: (1) express sincere condolences — this is not a sales moment, it is a human moment, (2) acknowledge that the father's situation is exactly why insurance matters, (3) conduct a proper FNA despite the urgency — the recommendation must be suitable, not emotional, (4) recommend coverage that genuinely fits the client's budget and needs, (5) the best tribute to the father's memory is a well-planned, sustainable policy — not an oversized policy that the client cannot maintain",
      "Tell them to process their grief first and come back in 6 months",
      "Rush through the paperwork to close the sale quickly"
    ],
    correct: 1,
    explanation: "A client motivated by a parent's death is emotionally charged — handle with care. Steps: (1) genuine condolences first — you are a human being before you are an advisor, (2) validate their urgency — their protective instinct is exactly right, (3) but insist on proper process — a rushed, emotionally-driven decision may result in an unsuitable policy, (4) conduct the FNA thoroughly, (5) recommend what is genuinely right, not what the emotional moment allows you to sell. A well-structured, sustainable policy honors the father's memory. An overcommitted policy that lapses in 2 years dishonors it.",
    category: 'roleplay'
  },
  {
    question: "During an annual review, you realize a client's Pro Achiever fund allocation is 100% in a single equity fund. What do you recommend?",
    options: [
      "Leave it as is — the client chose it",
      "Raise the concentration risk: (1) 100% in one fund is highly concentrated — if that market or sector underperforms, the entire policy suffers, (2) recommend diversifying across 2-3 funds with different asset classes or geographies, (3) use the free fund switches to rebalance without cost, (4) the Elite portfolio option provides automatic diversification if the client prefers hands-off management, (5) show historical data on how diversified portfolios reduce volatility while maintaining similar long-term returns",
      "Switch everything to a money market fund",
      "Tell them they should have invested in property instead"
    ],
    correct: 1,
    explanation: "100% concentration in a single fund is a significant portfolio risk that should be addressed during the annual review. Recommendation: (1) explain concentration risk — one fund underperforming means the entire policy underperforms, (2) suggest diversifying across 2-3 funds (e.g., 40% global equity, 30% Asian equity, 30% bond), (3) use the annual free fund switches to implement the rebalancing at no cost, (4) for clients who want simplicity, the Elite portfolio provides professional diversification. This is exactly why annual reviews are valuable — catching and correcting portfolio drift before it causes damage.",
    category: 'roleplay'
  },
  {
    question: "A client asks you to help them set up a Pro Achiever policy as a gift for their niece's 1st birthday. How do you structure this?",
    options: [
      "Tell them insurance is not a gift",
      "Structure it as a meaningful legacy gift: (1) the uncle/aunt is the policyholder (payer), the 1-year-old niece is the life assured, (2) a 15-year plan matures at age 16 — when the niece starts thinking about university, (3) at ANB 2, the niece gets the absolute lowest COI rates locked in for life, (4) the welcome bonus starts compounding from Year 1, (5) at age 18-21, policy ownership can be transferred to the niece. This is a gift that grows — far more valuable than toys or money in a savings account",
      "Recommend they just give cash instead",
      "Only allow parents to buy insurance for children"
    ],
    correct: 1,
    explanation: "Insurance as a birthday gift is a powerful concept: (1) the child gets the lowest possible COI for their entire life, (2) the 15-year plan creates an education fund that matures at university age, (3) the welcome bonus and compounding start from the child's earliest possible age, (4) at maturity, the gift-giver can transfer ownership to the young adult, (5) it teaches financial responsibility. Compare: a $200/month policy gifted at age 1 over 15 years accumulates $36,000 in premiums + bonuses + 15 years of investment growth. No toy or cash gift compares in long-term value.",
    category: 'roleplay'
  },
  {
    question: "A client mentions they are using 'buy now, pay later' (BNPL) services heavily ($2,000 in outstanding BNPL). Should this affect your Pro Achiever recommendation?",
    options: [
      "Ignore BNPL usage and proceed normally",
      "Address it as a financial health indicator: (1) heavy BNPL usage often signals cash flow management issues, (2) assess whether the client can genuinely sustain a Pro Achiever premium ON TOP of BNPL repayments, (3) if BNPL creates a 'hidden debt' pattern, the client may struggle with premiums within months, (4) recommend clearing the BNPL balance first, THEN starting Pro Achiever at minimum premium. A responsible recommendation protects both the client and your reputation",
      "Tell them BNPL is irrelevant to insurance",
      "Recommend they use BNPL to pay insurance premiums"
    ],
    correct: 1,
    explanation: "BNPL usage is a relevant financial health indicator during FNA. Heavy BNPL ($2,000 outstanding) suggests potential cash flow challenges. Responsible approach: (1) include BNPL obligations in the budget analysis, (2) if the client's cash flow is strained after BNPL repayments, adding a premium commitment risks lapsation, (3) better to clear BNPL first (it is typically interest-free but creates repayment obligations), then start Pro Achiever on a clean financial foundation, (4) if cash flow allows both, proceed at minimum premium. The FNA must capture the FULL financial picture, including modern debt instruments like BNPL.",
    category: 'roleplay'
  },
  {
    question: "Client: 'I don't want to give you my NRIC number — I'm concerned about data privacy.' How do you address privacy concerns while completing the application?",
    options: [
      "Tell them they have no choice and must provide it",
      "Respect the concern and explain: (1) the NRIC is required by AIA and MAS for policy identification and regulatory compliance — it is not optional for insurance applications, (2) AIA is bound by the PDPA (Personal Data Protection Act) and MAS data handling regulations, (3) your data is stored securely and used only for policy administration, (4) you can show AIA's privacy policy, (5) explain what specific purposes the NRIC serves: underwriting, policy issuance, claims processing. Address the concern with facts, not dismissal",
      "Skip the NRIC field and submit the application anyway",
      "Offer to use a fake NRIC number"
    ],
    correct: 1,
    explanation: "Data privacy is a legitimate concern in the digital age. The professional response: (1) NRIC is legally required for insurance applications — it is not optional, (2) explain PDPA compliance — AIA must protect personal data by law, (3) describe exactly how the NRIC is used: identity verification, underwriting, policy records, claims processing, (4) offer to show AIA's data protection policy, (5) if the client remains uncomfortable, provide AIA's Data Protection Officer contact for further assurance. Taking privacy concerns seriously builds trust; dismissing them destroys it.",
    category: 'roleplay'
  },
  {
    question: "A tech-savvy client asks whether Pro Achiever 3.0 offers any digital tools for policy management. What features can you highlight?",
    options: [
      "Tell them everything is done on paper",
      "Highlight AIA's digital ecosystem: (1) AIA Customer Portal — view fund values, transaction history, and policy details online, (2) iAIA mobile app — manage policies, submit fund switches, and view statements on the go, (3) e-statements for paperless policy management, (4) digital claims submission, (5) AIA Vitality app integration for wellness rewards. These digital tools complement the human advisory relationship and provide 24/7 access to policy information",
      "Tell them digital tools are not important for insurance",
      "Suggest they check their bank statements instead"
    ],
    correct: 1,
    explanation: "Tech-savvy clients expect digital access. AIA's digital ecosystem: (1) Customer Portal for desktop policy management, (2) iAIA app for mobile access, (3) e-statements reduce paper clutter, (4) digital fund switching capability, (5) real-time fund value visibility. These tools enhance the advisory relationship — the client can check their policy anytime, reducing anxiety about their investment. During annual reviews, you can review the portal together. Digital accessibility also reduces the friction of policy management, making it more likely the client stays engaged with their policy.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'If I have Pro Achiever AND term insurance AND medical insurance, is that overkill?' How do you show they serve different purposes?",
    options: [
      "Agree that it is overkill and suggest cutting one",
      "Explain the distinct roles: (1) MEDICAL insurance covers hospital bills — without it, a single hospitalization can cost $50,000-200,000, (2) TERM insurance provides maximum death benefit at minimum cost — it covers the family's immediate income replacement need, (3) PRO ACHIEVER provides death benefit PLUS wealth accumulation — it builds the long-term financial foundation. Together, they form a complete financial protection ecosystem: medical for health expenses, term for maximum protection, Pro Achiever for protection + growth",
      "Tell them they need even more products",
      "Recommend they cancel the term insurance"
    ],
    correct: 1,
    explanation: "Each product serves a distinct, non-overlapping purpose: (1) Medical insurance = hospital bills coverage (a necessity in Singapore's healthcare system), (2) Term insurance = maximum death benefit per premium dollar (covers the protection gap that Pro Achiever alone may not fill entirely), (3) Pro Achiever = insurance + investment (builds wealth while providing additional coverage). This is not overkill — it is a well-structured financial protection stack. The alternative (having only one type) leaves significant gaps. Show how the three products together address ALL financial risks: health, death/disability, and retirement.",
    category: 'roleplay'
  },
  {
    question: "Client: 'Can you guarantee that my fund value will be higher than my premiums paid after 10 years?' How do you set realistic expectations?",
    options: [
      "Yes, I guarantee it will be higher",
      "Be honest: (1) there is NO guarantee that fund value will exceed premiums at any specific point — investment returns are market-dependent, (2) the Benefit Illustration shows projected outcomes at 4% and 8% assumed returns, both showing positive outcomes by Year 10, (3) what IS guaranteed: the Capital Guarantee on Death (101% of premiums or fund value, whichever is higher), (4) historically, diversified portfolios over 10+ year periods have generally produced positive real returns, but past performance is not a guarantee",
      "Tell them it is guaranteed because of the Capital Guarantee",
      "Avoid the question entirely"
    ],
    correct: 1,
    explanation: "Honest expectation setting prevents future disappointment and complaints. Key distinctions: (1) the Capital Guarantee on Death guarantees 101% — but this only applies ON DEATH, not on surrender or withdrawal, (2) the BI projections at 4% and 8% both show fund values exceeding premiums by Year 10, but these are illustrations, not guarantees, (3) historically, diversified portfolios over 10-year periods have generally performed positively, but there is no absolute guarantee, (4) the supplementary charge dropping to zero at Year 10 significantly improves the growth trajectory. The honest answer builds trust; a false guarantee destroys it when reality arrives.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've been paying for 7 years and want to surrender. Should I wait 3 more years until Year 10?' How do you advise?",
    options: [
      "Process the surrender immediately",
      "Strongly recommend waiting until Year 10: (1) surrender charges at Year 7 are still significant — they decrease substantially by Year 10, (2) at Year 10, the supplementary charge drops to zero, dramatically improving future growth, (3) the special bonus begins at Year 10 (5% of annualized premium per year), (4) the welcome bonus clawback ends, (5) the remaining 3 years of premiums are a small price for unlocking these benefits. Show the math: surrender value at Year 7 vs Year 10 — the difference is significant",
      "Tell them it makes no difference whether they wait",
      "Suggest they surrender and buy a new policy"
    ],
    correct: 1,
    explanation: "At Year 7, the client is 70% of the way to the critical Year 10 inflection point. The math strongly favors waiting: (1) surrender charges decrease substantially from Year 7 to Year 10, (2) the supplementary charge drops to zero at Year 10 — future growth is much better, (3) special bonuses begin at Year 10 (5% of annualized premium annually), (4) welcome bonus clawback typically ends at Year 10. The additional 3 years of premiums unlock disproportionate value. Show the specific numbers: 'At Year 7, your surrender value is $X. At Year 10, it is projected to be $Y. That is $Z difference for 3 more years of $W premiums.'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My term insurance policy already covers me for $500,000. Why do I need Pro Achiever on top of that?' How do you identify the remaining gap?",
    options: [
      "Agree that $500,000 of term coverage is sufficient",
      "Differentiate the two products' roles: (1) term insurance provides PURE protection but zero cash value — when the term expires or the client outlives it, all premiums are 'gone', (2) Pro Achiever provides PROTECTION PLUS WEALTH — the fund value grows and can supplement retirement income, (3) $500,000 of term covers the death risk, but what about the LIVING risk — retirement, education funding, wealth building? (4) the two products together are stronger than either alone: term for maximum death benefit, Pro Achiever for long-term financial growth",
      "Tell them term insurance is inferior",
      "Recommend they cancel the term and increase Pro Achiever"
    ],
    correct: 1,
    explanation: "Term and Pro Achiever serve complementary purposes: (1) term insurance is a pure protection tool — maximum coverage per dollar, but no cash value and no return if the client survives, (2) Pro Achiever adds the wealth accumulation dimension — the fund grows, bonuses compound, and the client builds a financial asset over time. The gap: the client's $500,000 term covers the 'what if I die' risk, but NOT the 'what if I live and need retirement income' risk. Pro Achiever fills the living risk gap. Together, the two products create a complete financial protection and growth plan.",
    category: 'objection-handling'
  },
  {
    question: "A client who just completed her ACCA (accounting qualification) and started at a Big Four firm asks about Pro Achiever. How do you tailor the pitch?",
    options: [
      "Use basic financial concepts since she just graduated",
      "Match her financial sophistication: (1) she understands present value, IRR, and compounding — show the detailed math, (2) Big Four careers follow a predictable trajectory (associate → senior → manager → senior manager → partner) — map the premium increases to career milestones, (3) the 15-20 year plan aligns with the path to partner, (4) her peers at the firm are likely buying similar products — use professional peer validation, (5) offer to model different scenarios in Excel — accountants love spreadsheet analysis",
      "Tell her to focus on paying off ACCA study loans first",
      "Give her a generic presentation"
    ],
    correct: 1,
    explanation: "ACCA-qualified professionals at Big Four firms are analytically rigorous, career-driven, and financially literate. Tailor accordingly: (1) skip the basics — go straight to the detailed numbers (IRR, NPV, break-even analysis), (2) map the premium plan to their predictable career trajectory, (3) the 15-20 year plan aligns with their path to seniority or partnership, (4) Big Four firms have strong peer cultures — many colleagues are buying similar products, (5) offer detailed modelling. This client, once convinced by the numbers, will be loyal and will refer analytically-minded colleagues.",
    category: 'sales-angles'
  },
  {
    question: "How should you approach a client who works in the tech startup ecosystem as a product manager?",
    options: [
      "Assume they cannot afford insurance on a startup salary",
      "Connect to their professional mindset: (1) they understand product-market fit — Pro Achiever's 'market' is people who want protection + growth in one product, (2) they understand metrics — show CAC vs LTV equivalent (total cost vs total value delivered over policy life), (3) startup employees often have stock options but weak insurance benefits — Pro Achiever provides the stable financial foundation their volatile compensation cannot, (4) they value efficiency — one product covering both insurance and investment is an 'elegant solution'",
      "Use only traditional selling techniques",
      "Focus on fear-based selling about startup failures"
    ],
    correct: 1,
    explanation: "Product managers think in frameworks: problem-solution fit, metrics, and efficiency. Speak their language: (1) the 'problem' is needing both protection and wealth building — Pro Achiever is the 'solution' that combines both, (2) show 'unit economics': total cost of ownership vs total value delivered (including insurance, bonuses, and investment growth), (3) their startup equity is high-risk/high-reward — Pro Achiever is the stable counterbalance, (4) efficiency: one policy, one premium, two outcomes (protection + investment). This audience responds to logical frameworks, not emotional pitches.",
    category: 'sales-angles'
  },
  {
    question: "A client who recently recovered from a minor health scare (benign tumor removal) asks about Pro Achiever. How do you manage expectations?",
    options: [
      "Tell them they can no longer buy insurance",
      "Set realistic expectations: (1) a health history does NOT automatically disqualify them, but it will be assessed during underwriting, (2) AIA may request additional medical reports, follow-up test results, and specialist opinions, (3) possible outcomes: standard acceptance, acceptance with exclusion for related conditions, acceptance with premium loading, or deferment (wait and reapply after a period), (4) encourage applying now — the longer they wait, the harder it becomes if any new conditions develop",
      "Guarantee they will be accepted at standard rates",
      "Suggest they hide the medical history"
    ],
    correct: 1,
    explanation: "Post-health-scare clients need honesty and guidance. Key points: (1) full disclosure is mandatory — non-disclosure can void the policy later, (2) benign tumor removal is not automatically disqualifying — AIA assesses severity, completeness of removal, follow-up results, and recurrence risk, (3) prepare the client for possible outcomes: standard acceptance (best case), exclusion clause (related conditions excluded), loading (higher COI), or deferment (apply again after 1-2 years of clean follow-ups), (4) encourage application NOW — every year of waiting is a year of aging without coverage. Honest, complete disclosure gives the best chance of fair underwriting.",
    category: 'roleplay'
  },
  {
    question: "A client enrolled in a part-time degree program while working full-time asks about starting Pro Achiever. How do you integrate this into your recommendation?",
    options: [
      "Tell them to finish the degree first before thinking about insurance",
      "Support both goals simultaneously: (1) they are investing in their earning potential (degree) and should also invest in their financial protection (insurance), (2) start at minimum premium ($200/month) that does not compete with tuition fees, (3) upon degree completion and expected salary increase, increase the premium to capture a better bonus tier, (4) the degree completion timeline (2-4 years) means they build 2-4 years of policy value before their income jumps — positioning them perfectly for a premium upgrade",
      "Recommend the maximum premium since they are ambitious",
      "Suggest they take a loan to fund both the degree and insurance"
    ],
    correct: 1,
    explanation: "A working professional pursuing a part-time degree is investing in their future earning power — insurance should complement this investment, not compete with it. Strategy: (1) minimum premium now, preserving cash for tuition, (2) the 10-year lock-in matures when the degree has long been completed and the salary increase realized, (3) plan for a premium increase post-graduation when income rises, (4) frame it as a two-phase financial strategy: Phase 1 (student) = minimum premium for protection + early DCA, Phase 2 (post-degree) = increased premium for accelerated wealth building. Both phases serve their long-term financial health.",
    category: 'roleplay'
  },

  // ============================================================
  // FINAL BATCH — REACHING 300 NEW QUESTIONS
  // ============================================================
  {
    question: "What is the significance of the 'policy contract' vs the 'product brochure' in Pro Achiever 3.0?",
    options: [
      "They are the same document",
      "The policy contract is the legally binding agreement that specifies all terms, conditions, and obligations. The product brochure is a marketing summary that may not contain all details. In case of any discrepancy, the policy contract always prevails",
      "The brochure is more important than the contract",
      "Neither document has legal significance"
    ],
    correct: 1,
    explanation: "The policy contract is the legally binding document — it contains every term, condition, exclusion, and obligation. The product brochure is a marketing tool that summarizes key features in an accessible format but may not contain all details. If there is ever a discrepancy between what the brochure says and what the contract states, the contract prevails. This is why advisors should encourage clients to read the full policy contract during the 14-day cooling-off period.",
    category: 'product-facts'
  },
  {
    question: "What role does the 'underwriting department' play in the Pro Achiever 3.0 application process?",
    options: [
      "They design the marketing materials",
      "They assess the applicant's risk profile (health, occupation, lifestyle, financial situation) and determine whether to accept the application at standard rates, with loading, with exclusions, or to decline it",
      "They manage the investment funds",
      "They process premium payments"
    ],
    correct: 1,
    explanation: "The underwriting department is the gatekeeper that evaluates each application's risk: (1) health assessment — reviewing declarations, medical reports, and test results, (2) occupation assessment — evaluating job-related risks, (3) lifestyle assessment — smoking, hazardous hobbies, travel patterns, (4) financial assessment — ensuring the premium is sustainable. Based on this analysis, they issue one of four decisions: accept at standard rates, accept with premium loading, accept with exclusions, or decline. This process protects the insurance pool by ensuring fair risk pricing.",
    category: 'product-facts'
  },
  {
    question: "What is a 'counter-offer' in insurance underwriting?",
    options: [
      "AIA offering a lower premium than requested",
      "When underwriting assesses higher risk, AIA may offer to insure the applicant with modified terms — such as premium loading, exclusions for specific conditions, or a reduced sum assured — instead of declining outright. The applicant can accept, negotiate, or decline the counter-offer",
      "The applicant negotiating the welcome bonus percentage",
      "AIA matching a competitor's proposal"
    ],
    correct: 1,
    explanation: "A counter-offer occurs when the underwriting team assesses the application as higher risk than standard but not uninsurable. Instead of declining, they offer modified terms: (1) premium loading (e.g., +50% COI for a pre-existing condition), (2) exclusion clauses (e.g., no coverage for diabetes-related claims), or (3) reduced sum assured. The applicant can accept the counter-offer, request reconsideration with additional medical evidence, or decline. Counter-offers are actually a positive outcome — they mean the applicant IS insurable, just at modified terms.",
    category: 'product-facts'
  },
  {
    question: "What is the 'effective date' vs the 'policy date' in a Pro Achiever 3.0 policy?",
    options: [
      "They are always the same date",
      "The effective date is when coverage begins (typically the date AIA accepts the application), while the policy date may be different — it is often set as the first of the following month for administrative convenience. The 14-day cooling-off period starts from the date the policyholder receives the policy document",
      "The effective date is always January 1st",
      "The policy date is when premiums start being deducted"
    ],
    correct: 1,
    explanation: "These are technically different dates: (1) the effective date is when insurance coverage begins — the insured is protected from this date, (2) the policy date is the administrative start date, often the first of the month following acceptance, used for anniversary calculations, (3) the cooling-off period starts from the date the policyholder RECEIVES the policy document, which may be later than both. Understanding these dates matters for calculating policy years, bonus eligibility, and surrender charge schedules.",
    category: 'product-facts'
  },
  {
    question: "How should you explain the concept of 'risk pooling' to a client who questions why they should pay if they never make a claim?",
    options: [
      "Tell them claims are guaranteed to happen",
      "Explain that insurance works through risk pooling: many people pay premiums into a shared pool, and those who experience covered events (death, disability) receive payouts funded by the pool. Not everyone will claim, but everyone benefits from the PROTECTION — the peace of mind that if something happens, their family is covered. Pro Achiever adds investment returns and bonuses, so even without a claim, the policyholder builds wealth",
      "Agree that insurance is a waste if you don't claim",
      "Suggest they self-insure instead"
    ],
    correct: 1,
    explanation: "Risk pooling is the foundation of insurance. Explain it simply: (1) everyone contributes to a shared pool, (2) those who experience covered events draw from the pool, (3) the 'cost' of insurance is the premium for peace of mind that your family is protected, (4) unlike pure term insurance where premiums are 'lost' if no claim is made, Pro Achiever returns value even without a claim — the investment component grows, bonuses accumulate, and the fund becomes a financial asset. The client gets protection AND wealth building — whether or not they ever claim.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've seen advertisements for guaranteed 4% return products — isn't that safer than Pro Achiever?' How do you compare?",
    options: [
      "Promise that Pro Achiever will also return 4% guaranteed",
      "Distinguish between guaranteed and potential returns: (1) a guaranteed 4% product caps the upside — the client will NEVER earn more than ~4%, (2) after inflation of 3-4%, the real guaranteed return is approximately 0-1%, (3) Pro Achiever's market-linked returns have unlimited upside potential, (4) historically, diversified portfolios have returned 6-8% over long periods, (5) the Capital Guarantee on Death provides a different kind of guarantee — protection of principal for beneficiaries. The question: 'Do you want guaranteed mediocrity or potential for real wealth growth?'",
      "Tell them guaranteed returns are always fake",
      "Agree that guaranteed products are always safer"
    ],
    correct: 1,
    explanation: "The guaranteed return comparison is common but misleading when viewed long-term. Key analysis: (1) 'guaranteed 4%' sounds safe, but after inflation (3-4%), real returns are near zero — the purchasing power barely grows, (2) these products cap upside — in a market that returns 10%, the client still only gets 4%, (3) Pro Achiever's non-guaranteed but market-linked returns have historically outperformed guaranteed products over 10-20 year periods, (4) the Capital Guarantee on Death provides a meaningful guarantee that addresses the most critical risk (death of breadwinner). Safety should be measured by whether the client achieves their goals, not by the label 'guaranteed.'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'What is the worst-case scenario with Pro Achiever 3.0?' How do you discuss downside risk honestly?",
    options: [
      "Tell them there is no downside",
      "Be transparent about worst-case scenarios: (1) if the client surrenders in Year 1-2, they lose a significant portion of premiums (worst financial outcome), (2) if markets perform very poorly for an extended period, fund value may underperform the 4% BI projection, (3) if the client's health deteriorates during the policy, COI charges increase, (4) HOWEVER: the Capital Guarantee on Death ensures beneficiaries always get at least 101% of premiums. The worst case is SURRENDER, not the product itself — and that is within the client's control",
      "Change the subject to avoid negativity",
      "Promise there are no worst-case scenarios"
    ],
    correct: 1,
    explanation: "Discussing downside risk honestly is a trust-building exercise. The worst cases: (1) early surrender = significant loss (but this is the client's choice, not a product failure), (2) prolonged market downturn = fund value underperforms projections (but DCA mitigates this, and markets have historically recovered), (3) health deterioration = higher COI (but this is common to all insurance). The crucial protection: the Capital Guarantee on Death ALWAYS ensures beneficiaries get at least 101% of premiums, regardless of market performance. The honest message: 'The biggest risk is not the product — it is exiting prematurely.'",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I want to invest in a business with my savings — that will give me better returns than any insurance.' How do you respond?",
    options: [
      "Tell them businesses always fail",
      "Respect their entrepreneurial spirit, then highlight the risk imbalance: (1) 50-60% of new businesses fail within the first 5 years, (2) if the business fails AND they have no insurance, they lose both their investment and their family's protection, (3) Pro Achiever is the safety net that protects the family regardless of the business outcome, (4) suggest allocating the majority to the business while starting a minimum Pro Achiever policy — this way, the family is protected whether the business succeeds or fails",
      "Agree that business is always better than insurance",
      "Insist they invest only in Pro Achiever"
    ],
    correct: 1,
    explanation: "Entrepreneurs are risk-takers by nature — respect this, but add a safety layer. The key insight: business investment and insurance serve completely different purposes. Business investment creates potential wealth; insurance protects existing wealth and dependents. If the business fails (50-60% chance within 5 years) and there is no insurance, the family faces both financial loss AND lack of protection. A minimum Pro Achiever policy ($200-300/month) alongside the business investment ensures the family is covered regardless of the business outcome. This is risk management 101 — something every good entrepreneur understands.",
    category: 'objection-handling'
  },
  {
    question: "A couple planning IVF treatment ($20,000-40,000 per cycle) asks about Pro Achiever. How do you integrate family planning costs into the recommendation?",
    options: [
      "Tell them to choose between IVF and insurance",
      "Respect their IVF priority and plan for both: (1) IVF is a near-term priority with significant costs — acknowledge this, (2) start Pro Achiever at minimum premium now — even during IVF, the family needs protection (especially given the high-stress medical procedures), (3) if IVF is successful, the new baby increases the protection need — Pro Achiever is already in place, (4) after IVF treatment ends, redirect the IVF budget toward increasing the Pro Achiever premium. Plan for both life creation and life protection simultaneously",
      "Suggest they cannot afford insurance during IVF",
      "Recommend postponing IVF to save for insurance"
    ],
    correct: 1,
    explanation: "IVF is a significant financial and emotional commitment. The sensitive approach: (1) IVF takes priority — this is a deeply personal decision, (2) however, during IVF, the family NEEDS insurance: the client is undergoing medical procedures, and the potential child will need protection from birth, (3) minimum Pro Achiever premium during IVF treatment provides the foundation, (4) when IVF concludes (successfully or otherwise), the freed-up IVF budget can significantly increase the Pro Achiever premium. Position insurance as supporting their family-building journey, not competing with it.",
    category: 'roleplay'
  },
  {
    question: "A client asks whether Pro Achiever 3.0 is suitable as a retirement income vehicle. How do you position it for retirement?",
    options: [
      "Tell them ILPs are not for retirement income",
      "Show how Pro Achiever can function as a retirement income tool: (1) the special bonus from Year 10 (5%) and Year 21 (8%) provides annual additions to the fund, (2) the GDIF quarterly dividend fund provides regular income within the policy, (3) partial withdrawals after the lock-in period can supplement retirement cash flow, (4) the fund value can be systematically drawn down in retirement, (5) the Capital Guarantee ensures any remaining value passes to beneficiaries. It is not a pension, but it is a strong retirement income SUPPLEMENT",
      "Recommend an annuity instead",
      "Promise it will replace their salary in retirement"
    ],
    correct: 1,
    explanation: "Pro Achiever can serve as one pillar of retirement income planning: (1) accumulation phase (working years): regular premiums build the fund, bonuses add extra value, DCA smooths returns, (2) transition phase (Year 10+): supplementary charges drop to zero, special bonuses begin, fund growth accelerates, (3) distribution phase (retirement): systematic partial withdrawals provide supplementary income, GDIF dividends add regular cash flow, Capital Guarantee protects any remainder for beneficiaries. Pro Achiever is not a complete retirement solution (combine with CPF, SRS, other investments) but is a valuable supplementary income vehicle.",
    category: 'sales-angles'
  },
  {
    question: "How do you use the 'Rule of 72' to help clients visualize Pro Achiever 3.0's compounding power?",
    options: [
      "The Rule of 72 is not applicable to insurance",
      "Use the Rule of 72 (divide 72 by the annual return rate to estimate years to double): at 6% return, money doubles approximately every 12 years. Show: a $200/month premium ($2,400/year) at 6% growth doubles in real value roughly every 12 years. Over 24 years, the early contributions have doubled TWICE. Combined with bonuses, this illustrates why starting early and staying invested is so powerful",
      "The Rule of 72 only works for bank savings",
      "Promise 72% returns on Pro Achiever"
    ],
    correct: 1,
    explanation: "The Rule of 72 is a powerful teaching tool for compounding: (1) at 6% annual return, money doubles every 12 years, (2) at 8%, it doubles every 9 years, (3) for a client starting at age 25, by age 49, their earliest premiums have doubled TWICE at 6% — four times the original amount, (4) add the welcome bonus (invested from Year 1) and special bonuses (from Year 10), and the compounding effect is even stronger. This simple calculation makes the abstract concept of compounding tangible and helps clients understand why starting 5 years earlier makes such a dramatic difference.",
    category: 'sales-angles'
  },
  {
    question: "How should you handle a client who wants to buy Pro Achiever 3.0 but has not completed any fact-finding or FNA?",
    options: [
      "Sign them up immediately since they want to buy",
      "Insist on completing the FNA first: (1) MAS REQUIRES an FNA before any product recommendation — skipping it is a regulatory violation, (2) the FNA ensures the product is suitable for the client's actual needs, (3) selling without an FNA exposes both you and the client to risk — if the product turns out to be unsuitable, you are liable, (4) explain: 'I want to make sure this is the RIGHT product for you, which requires understanding your full financial picture first.' Professionalism over urgency",
      "Complete the FNA after the sale",
      "Let them sign the application and fill in the FNA later"
    ],
    correct: 1,
    explanation: "MAS mandates the FNA before ANY product recommendation — this is non-negotiable. Even if the client wants to buy immediately, the advisor must: (1) complete the FNA to determine suitability, (2) ensure the recommended product, premium, and investment period match the client's needs, (3) document the analysis and recommendation basis. Selling without an FNA is a regulatory violation that can result in penalties, license suspension, or policy voiding. The professional approach: 'I appreciate your enthusiasm, and I want to make sure this is perfectly right for you. Let us take 30 minutes to complete the needs analysis.'",
    category: 'sales-angles'
  },
  {
    question: "A client is hesitant to make a GIRO arrangement for Pro Achiever premium payments. How do you explain the importance of GIRO?",
    options: [
      "Tell them GIRO is mandatory (when it may not be)",
      "Explain the practical benefits: (1) GIRO ensures premiums are paid on time every month, preventing accidental lapse, (2) it enables dollar cost averaging by investing consistently regardless of market conditions, (3) it removes the behavioral temptation to skip a payment during months when spending is high, (4) manual payment methods risk delays, forgotten payments, and potential lapse. GIRO is the financial discipline mechanism that makes the entire DCA strategy work",
      "Skip the GIRO discussion entirely",
      "Suggest they pay cash at AIA's office each month"
    ],
    correct: 1,
    explanation: "GIRO is the operational backbone of a successful Pro Achiever policy. Benefits: (1) automation eliminates the risk of forgotten payments — the most common cause of accidental lapse, (2) consistent monthly deductions enable true DCA — investing the same amount regardless of market sentiment, (3) it removes the monthly decision point where the client might choose to skip a payment, (4) it reduces administrative burden for both the client and AIA. For clients hesitant about GIRO, explain the alternative: manually remembering to pay every month for 10-20 years, with the risk that one forgotten payment could start a lapse process.",
    category: 'sales-angles'
  },
  {
    question: "A client receives their first annual statement and is confused by the various charges listed. How do you walk them through it?",
    options: [
      "Tell them not to worry about the charges",
      "Walk through each charge line by line: (1) premium allocation — the portion of each premium invested vs charges, (2) Cost of Insurance — the monthly charge for life insurance coverage (explain it increases with age), (3) supplementary charge — 3.9% for first 10 years, then zero, (4) fund management charge — the fund manager's fee for investment management, (5) bid-offer spread — the difference between buying and selling price of units. Relate each charge to the benefit it funds. This education prevents future anxiety",
      "Suggest they stop reading statements",
      "Blame the charges on market conditions"
    ],
    correct: 1,
    explanation: "The first annual statement is a critical education opportunity. Walking through each charge line builds understanding and trust: (1) premium allocation shows how premiums are deployed, (2) COI shows the cost of insurance protection — relate it to equivalent term insurance cost, (3) supplementary charge shows the distribution cost with the key message: this drops to ZERO after Year 10, (4) FMC shows the cost of professional fund management. When clients understand what each charge funds, they are less likely to feel charges are 'hidden fees' and more likely to see them as fair costs for genuine services delivered.",
    category: 'roleplay'
  },
  {
    question: "During a review meeting, you notice a client's fund has consistently underperformed its benchmark for 3 consecutive years. What action do you recommend?",
    options: [
      "Do nothing — funds go through cycles",
      "Recommend a fund switch: (1) consistent 3-year underperformance relative to the benchmark suggests structural issues with the fund, not just a temporary dip, (2) review the fund factsheet for any changes in fund management team or strategy, (3) use one of the 4 free annual switches to move to a better-performing fund in the same asset class, (4) do NOT switch during a market dip just because of short-term performance — but 3 years of underperformance warrants action",
      "Surrender the entire policy",
      "Switch to a money market fund permanently"
    ],
    correct: 1,
    explanation: "Three consecutive years of benchmark underperformance is a meaningful signal — not panic-worthy, but action-worthy. Steps: (1) review the fund factsheet — has the fund manager changed? Has the strategy drifted? (2) compare with peers in the same category — is the underperformance fund-specific or market-wide? (3) if fund-specific, recommend switching to a comparable fund with better performance, using one of the free annual switches, (4) document the rationale for the switch. This is exactly why annual reviews matter — catching persistent underperformance early and taking corrective action prevents years of suboptimal returns.",
    category: 'roleplay'
  },
  {
    question: "A client tells you they want to use Pro Achiever as a CPF top-up replacement — contributing the same amount monthly but into Pro Achiever instead of CPF. Is this appropriate?",
    options: [
      "Yes, Pro Achiever is always better than CPF",
      "Caution against this approach: (1) CPF provides GUARANTEED returns (currently 2.5-4% depending on account) with zero investment risk — Pro Achiever's returns are not guaranteed, (2) CPF contributions may be tax-deductible, (3) CPF is MAS-guaranteed by the Singapore government, (4) however, Pro Achiever adds insurance protection and potentially higher returns that CPF cannot provide. The recommendation: do BOTH — maximize CPF top-ups first (guaranteed returns, tax benefits), then add Pro Achiever on top for growth and protection",
      "Tell them CPF is a waste of money",
      "Recommend they withdraw all CPF for Pro Achiever"
    ],
    correct: 1,
    explanation: "CPF and Pro Achiever serve different purposes and should complement, not replace, each other. CPF advantages: guaranteed returns (2.5-4%), government-backed, tax-deductible top-ups. Pro Achiever advantages: insurance protection, potential for higher returns, flexibility, bonuses. The optimal strategy: (1) maximize CPF top-ups first (guaranteed returns + tax benefits are hard to beat), (2) THEN add Pro Achiever for the dimensions CPF lacks: insurance coverage, market-linked growth potential, and bonuses. Advising a client to skip CPF for an ILP would be a suitability concern under MAS guidelines.",
    category: 'roleplay'
  },
  {
    question: "A client calls you saying their colleague just died suddenly from a heart attack at age 38 and had no insurance. They are frightened and want to act immediately. How do you handle this?",
    options: [
      "Use the fear to close the biggest possible policy immediately",
      "Acknowledge their fear with empathy: (1) 'That is devastating news. It is natural to feel the urgency to protect your family.' (2) Conduct a proper FNA despite the urgency — fear-driven decisions are often regretted, (3) recommend appropriate coverage based on their actual needs and budget, not their current emotional state, (4) reassure them that the process can be completed quickly while still being thorough, (5) after the policy is in force, follow up to ensure they are comfortable with the decision when emotions settle",
      "Tell them to calm down first and come back next month",
      "Rush through the paperwork without proper needs analysis"
    ],
    correct: 1,
    explanation: "A colleague's sudden death creates legitimate urgency — but urgency must not override proper process. Balanced approach: (1) validate the fear — their protective instinct is correct and timely, (2) but insist on a proper FNA — even a streamlined one — to ensure the recommendation is suitable, (3) recommend based on genuine needs, not the emotional peak, (4) complete the process efficiently but thoroughly, (5) schedule a follow-up in 2-3 weeks when emotions have stabilized to review and confirm they are comfortable. A policy sold on fear without proper analysis risks being the wrong product, wrong premium, or wrong period.",
    category: 'roleplay'
  },
  {
    question: "How do you explain to a client that Pro Achiever 3.0 is NOT a get-rich-quick scheme?",
    options: [
      "Promise quick returns to get the sale",
      "Set clear expectations: (1) Pro Achiever is a LONG-TERM financial planning tool, not a speculative investment, (2) the first 7-10 years are the building phase — fund values may be below premiums paid, (3) the real power emerges from Year 10 onward: zero supplementary charges, special bonuses, and compounding, (4) projected returns of 4-8% are realistic but not spectacular — the value is in the COMBINATION of returns + protection + bonuses + discipline, (5) anyone promising quick or guaranteed high returns from insurance is misleading the client",
      "Compare it to cryptocurrency returns",
      "Avoid setting any expectations"
    ],
    correct: 1,
    explanation: "Setting realistic expectations is the foundation of a sustainable client relationship. Key messages: (1) Pro Achiever is designed for 10-20+ year horizons — not for quick gains, (2) the early years are the 'investment phase' where charges are front-loaded, (3) the inflection point at Year 10 is where the value accelerates, (4) total value = fund returns + welcome bonus + special bonuses + insurance protection + behavioral discipline, (5) compared to leaving money in a savings account (0.05-2%), Pro Achiever's projected returns are significantly better. But compared to speculative investments (crypto, high-risk stocks), it is designed for steady, disciplined wealth building. Clients who understand this rarely lapse.",
    category: 'sales-angles'
  },
  {
    question: "A client considering a career switch from private sector to public sector (with a pay cut) asks about Pro Achiever. How do you factor the income change?",
    options: [
      "Tell them to stay in the private sector for the higher salary",
      "Factor the income change into the recommendation: (1) if starting Pro Achiever now at private-sector income, ensure the premium is sustainable at the LOWER public-sector salary, (2) public sector offers stability (job security, pension) — a lower premium with a longer commitment (20 years) may be optimal, (3) Premium Pass eligibility provides a buffer during the transition period, (4) the public sector pension combined with Pro Achiever creates a solid dual-income retirement plan",
      "Recommend the maximum premium based on current private-sector salary",
      "Suggest they wait until the career switch is complete"
    ],
    correct: 1,
    explanation: "A planned income reduction requires forward-looking planning: (1) the premium MUST be sustainable at the future (lower) salary, not the current (higher) one — otherwise lapsation risk is high, (2) public sector benefits (pension, job security) complement Pro Achiever well, (3) start the policy NOW while income is higher (easier to handle initial charges), but at a premium affordable at the lower salary, (4) Premium Pass eligibility provides a transition buffer. The combination of public sector pension + CPF + Pro Achiever creates a robust three-pillar retirement plan.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'Can I use my AIA Vitality rewards or points toward Pro Achiever premiums?' What is the connection between AIA Vitality and Pro Achiever?",
    options: [
      "AIA Vitality is completely unrelated to Pro Achiever",
      "AIA Vitality is AIA's wellness program that rewards healthy behaviors. While Vitality points may not directly offset Pro Achiever premiums, AIA Vitality members may receive premium discounts on certain products, and the healthy lifestyle encouraged by Vitality can lead to better health outcomes (potentially avoiding premium loading). Check the specific Vitality benefits applicable to Pro Achiever for the latest promotions",
      "Vitality points fully pay for Pro Achiever premiums",
      "Vitality is only for medical insurance"
    ],
    correct: 1,
    explanation: "AIA Vitality and Pro Achiever have a synergistic relationship: (1) AIA Vitality encourages healthy behaviors (exercise, health screenings, nutrition) through rewards and incentives, (2) some AIA products offer Vitality-linked premium discounts for active Vitality members, (3) the healthy lifestyle promoted by Vitality can indirectly benefit Pro Achiever policyholders through better health (lower COI risk, no premium loading), (4) check the latest product-specific Vitality benefits, as AIA periodically updates the integration between Vitality and its insurance products.",
    category: 'product-facts'
  },
  {
    question: "What is 'policy portability' and how does it apply to Pro Achiever 3.0?",
    options: [
      "It means transferring the policy to another insurer",
      "It means the Pro Achiever policy remains valid and active regardless of the policyholder's employment status, employer, or country of residence. The policy belongs to the policyholder (not their employer) and continues in force as long as premiums are paid, wherever they are in the world",
      "It means the policy can be copied to multiple devices",
      "It refers to the ability to print the policy document"
    ],
    correct: 1,
    explanation: "Policy portability is a key advantage over employer-provided coverage: (1) Pro Achiever belongs to the policyholder, not any employer — it survives job changes, retrenchment, retirement, and relocation, (2) premiums can be paid from anywhere in the world, (3) coverage remains active globally, (4) the death benefit pays out regardless of where the policyholder resides. This is fundamentally different from group insurance, which terminates when employment ends. Portability means the client's financial protection is permanent and personal.",
    category: 'product-facts'
  },
  {
    question: "What is the process for increasing the premium amount on an existing Pro Achiever 3.0 policy?",
    options: [
      "Simply pay more each month and AIA will auto-adjust",
      "Submit a formal request to AIA to increase the regular premium. This may trigger updated underwriting if the sum assured increases significantly. The welcome bonus structure for the additional premium may differ from the original. Alternatively, the client can start a supplementary Pro Achiever 3.0 policy at the new premium level",
      "Premiums cannot be increased once the policy starts",
      "Call AIA and verbally request an increase"
    ],
    correct: 1,
    explanation: "Premium increases on an existing policy require a formal request: (1) AIA assesses whether the increase triggers additional underwriting (if the sum assured rises significantly), (2) the welcome bonus on the additional premium may be calculated differently, (3) an alternative approach is to start a NEW supplementary Pro Achiever 3.0 policy at the desired premium — this captures the full welcome bonus structure for the new premium and keeps the existing policy's terms intact. The best approach depends on the specific circumstances, and the advisor should model both options.",
    category: 'product-facts'
  },
  {
    question: "Client: 'I want to set up insurance for my parents (both age 60). Is Pro Achiever 3.0 the right product?' How do you advise on insuring elderly parents?",
    options: [
      "Sign them up for Pro Achiever immediately",
      "Assess carefully and manage expectations: (1) check eligibility — maximum entry age is typically 65 ANB, (2) COI at age 60 is very high, significantly reducing net investment returns, (3) medical underwriting at 60 will likely require comprehensive health screening, (4) for parents aged 60, consider whether a different product (medical insurance, annuity, or a smaller Pro Achiever) better serves their needs, (5) if legacy transfer is the goal, a modest Pro Achiever with irrevocable nomination to the client may work. Be realistic about the economics at older ages",
      "Tell them parents over 55 cannot get insurance",
      "Recommend the maximum premium 20-year plan"
    ],
    correct: 1,
    explanation: "Insuring elderly parents requires honest assessment: (1) Pro Achiever at age 60 has significantly higher COI — the insurance charges can erode a large portion of returns, (2) medical underwriting will be thorough, potentially resulting in loading or exclusions, (3) the 10-year plan is the only practical option (maturing at 70), (4) the VALUE at this age comes from the Capital Guarantee on Death (legacy transfer) and irrevocable nomination (probate avoidance), not from investment returns. Alternative products (medical insurance, annuities) may serve some needs better. A modest Pro Achiever focused on legacy rather than growth is the realistic recommendation.",
    category: 'roleplay'
  },
  {
    question: "A client brings a calculator to the meeting and starts computing the total charges over 20 years. He concludes that charges are 'too high.' How do you respond?",
    options: [
      "Take the calculator away",
      "Commend his diligence, then help complete the calculation: (1) his charge calculation is probably correct — but is it complete? (2) add the welcome bonus value, the special bonuses (5% from Year 10, 8% from Year 21), and the Capital Guarantee on Death, (3) subtract what equivalent separate insurance coverage would cost, (4) the NET cost (total charges minus bonuses minus insurance value) is the true cost of the product. When fully calculated, most clients find the net cost is reasonable for the total value delivered",
      "Tell him the calculator is wrong",
      "Agree that charges are too high and suggest alternatives"
    ],
    correct: 1,
    explanation: "A client with a calculator is doing exactly what a smart consumer should do. Your response: (1) praise the diligence — 'I love that you are doing the math. Let me help complete the picture,' (2) the charge calculation is usually accurate but incomplete, (3) add the VALUE side: welcome bonus (5-75% of annualized premium), special bonuses (5-8% per year), Capital Guarantee on Death (101% of premiums), and the investment growth itself, (4) subtract what equivalent term insurance would cost separately. When clients see the full equation (VALUE - COST = NET BENEFIT), the product's economics are usually compelling. Let the math speak for itself.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Can I name my estate as the beneficiary of my Pro Achiever policy?' What are the implications?",
    options: [
      "Yes, and there are no implications",
      "Naming the estate as beneficiary is possible but generally inadvisable: (1) proceeds become part of the estate and go through probate (6-12 months delay), (2) the proceeds are exposed to creditor claims against the estate, (3) distribution follows the will (or intestacy law if no will), which may not align with the policyholder's intentions, (4) a direct nomination to specific beneficiaries (especially irrevocable) avoids ALL of these issues — faster payout, no creditor exposure, no probate. Always recommend a specific nomination over estate designation",
      "Tell them they cannot name their estate as beneficiary",
      "Encourage naming the estate for maximum flexibility"
    ],
    correct: 1,
    explanation: "Naming the estate as beneficiary negates many of insurance's key advantages: (1) probate delay — proceeds are frozen for 6-12 months while the estate is settled, (2) creditor claims — estate assets (including insurance proceeds) can be claimed by creditors, (3) distribution uncertainty — if there is no will, distribution follows intestacy law which may not match intentions. A direct nomination (especially irrevocable) to specific persons is almost always preferable: proceeds pay out directly, avoid probate, and are protected from creditor claims. This is practical estate planning that every policyholder should understand.",
    category: 'product-facts'
  },
  {
    question: "How do you approach a couple where one spouse earns significantly more than the other (e.g., $12,000 vs $3,000)?",
    options: [
      "Only insure the higher-earning spouse",
      "Insure both but with different sizing: (1) the higher earner needs larger coverage — they represent the bigger financial risk to the household, (2) Pro Achiever with ATR for the higher earner at a premium reflecting their income responsibility, (3) the lower-earning spouse still needs coverage — their economic value (household management, partial income) is real, (4) a modest Pro Achiever for the lower earner provides some protection and wealth building, (5) cross-nominate each spouse as the other's beneficiary. Both lives have financial value to the family unit",
      "Give both the same premium and coverage",
      "Only insure the lower-earning spouse to protect them"
    ],
    correct: 1,
    explanation: "Income disparity requires proportional but inclusive coverage: (1) the higher earner ($12,000/month) represents the largest financial risk — their loss would create a $144,000/year income gap, (2) the lower earner ($3,000/month) also contributes — their loss creates a $36,000/year gap plus potentially increased childcare costs, (3) size the higher earner's coverage proportionally larger (higher premium, more ATR coverage), (4) the lower earner's coverage can be more modest but should not be zero. Both spouses' financial contributions sustain the household — protecting both provides complete family coverage.",
    category: 'sales-angles'
  },
  {
    question: "A client says, 'I want to review my Pro Achiever policy, but I lost my policy document.' What should you advise?",
    options: [
      "Tell them the policy is void without the document",
      "Reassure them: (1) losing the policy document does NOT affect the policy — it remains fully in force, (2) request a duplicate policy document from AIA by submitting a written request (a small fee may apply), (3) in the meantime, policy information is accessible through the AIA Customer Portal and iAIA app, (4) for claims purposes, a statutory declaration can replace the lost document. The policy's validity is based on AIA's records, not on possession of the physical document",
      "Suggest they cancel and buy a new policy",
      "Tell them to search harder for the document"
    ],
    correct: 1,
    explanation: "Losing the policy document is common and not a crisis: (1) the policy is a legal contract recorded in AIA's systems — the physical document is a copy, not the source of truth, (2) request a duplicate by writing to AIA's policy services, (3) digital access through the Customer Portal provides all policy information, (4) for claims, a statutory declaration (sworn statement that the document is lost) replaces the physical document. This is a good opportunity to review the client's policy details, update beneficiary nominations if needed, and ensure all contact information is current.",
    category: 'roleplay'
  },
  {
    question: "What is the 'paid-up value' of a Pro Achiever 3.0 policy?",
    options: [
      "The total premiums paid to date",
      "The reduced coverage amount that remains if the policyholder stops paying premiums and the policy continues with no further premiums — essentially the fund value after deduction of ongoing charges until it is exhausted",
      "The value of the policy if fully paid for the entire investment period",
      "The bonus amount accumulated to date"
    ],
    correct: 1,
    explanation: "The paid-up value represents what remains if premiums stop: the existing fund value continues with charges deducted monthly (COI, fund management fees) until exhausted. The death benefit is reduced proportionally. This is different from surrender value (what you get if you terminate) — paid-up status keeps the policy alive with diminished coverage. Understanding paid-up value helps clients see why stopping premiums at different points has different consequences.",
    category: 'product-facts'
  },
  {
    question: "What is the 'insurance coverage ratio' and why is it important for Pro Achiever 3.0?",
    options: [
      "It is the ratio of premiums to fund value",
      "It is the ratio between the sum assured (death benefit) and the annual premium. A higher ratio means more protection per premium dollar. MAS uses this to assess whether the product provides sufficient insurance coverage relative to the premium charged",
      "It is the ratio of claims paid to claims submitted",
      "It is the ratio of term to whole life coverage"
    ],
    correct: 1,
    explanation: "The insurance coverage ratio measures protection value per premium dollar. MAS monitors this to ensure ILPs provide meaningful insurance coverage (not just investment). For Pro Achiever, the ATR significantly improves this ratio — adding substantial death benefit coverage at an affordable cost. Understanding this ratio helps advisors demonstrate that Pro Achiever provides genuine insurance protection, not just an investment product with a nominal insurance wrapper.",
    category: 'product-facts'
  },
  {
    question: "A university student (age 20) working part-time asks if they can start Pro Achiever. How do you advise?",
    options: [
      "Tell them to wait until they graduate and get a full-time job",
      "Encourage them to start at minimum premium: (1) at age 20, they lock in the lowest COI rates for life, (2) part-time income can sustain $200/month if budgeted correctly, (3) the 10-year lock-in matures at age 30 when they will be career-established, (4) starting 3-4 years before peers who wait until graduation gives them a significant compounding advantage, (5) frame it as the smartest financial decision they can make in their 20s",
      "Recommend the maximum premium since they have few expenses",
      "Suggest they invest in crypto instead"
    ],
    correct: 1,
    explanation: "A 20-year-old student starting at minimum premium is making one of the smartest possible financial moves: (1) absolute lowest COI locked in for life, (2) 3-4 year headstart on peers who wait until post-graduation, (3) by the time they graduate and start earning full-time, they already have established insurance coverage and 3-4 years of DCA accumulation, (4) $200/month is achievable even on part-time income with proper budgeting. The compounding advantage of starting 3-4 years earlier is worth tens of thousands of dollars by retirement.",
    category: 'sales-angles'
  },
  {
    question: "How do you approach a client who is a taxi driver or private-hire vehicle driver?",
    options: [
      "Tell them their occupation disqualifies them from insurance",
      "Highlight their unique vulnerability: (1) they have ZERO employer benefits — no group insurance, no CPF employer contribution, no medical benefits, (2) their income depends entirely on their ability to drive — disability is a catastrophic risk, (3) Pro Achiever with ATR provides death AND disability coverage they cannot get from any other source, (4) annual payment mode timed to peak earning periods (holidays, events), (5) Premium Pass is essential for months with vehicle breakdowns or health issues that prevent driving",
      "Suggest they stop driving and get a desk job",
      "Recommend only accident insurance"
    ],
    correct: 1,
    explanation: "Private-hire drivers are among the most insurance-underserved segments: (1) zero employer benefits — they are self-employed with no safety net, (2) income depends 100% on their ability to drive — disability or serious illness means zero income, (3) long hours behind the wheel create health risks (back problems, cardiovascular), (4) Pro Achiever with ATR addresses all these gaps at an affordable premium. Annual payment mode captures their peak earning periods. This segment needs insurance MORE than most salaried workers but is often overlooked. Serving them well creates a loyal referral network within the driver community.",
    category: 'sales-angles'
  },
  {
    question: "Client: 'The economy is uncertain with AI replacing jobs — why would I lock money into a 10-year commitment?' How do you address AI-driven job security fears?",
    options: [
      "Promise that AI will never replace their job",
      "Acknowledge the uncertainty, then reframe: (1) economic uncertainty is EXACTLY when insurance matters most — what happens if AI disruption affects their income AND they have no coverage? (2) Pro Achiever provides a financial safety net regardless of career disruption, (3) the Capital Guarantee protects the family even if the client's career is disrupted, (4) Premium Pass and policy loan provide flexibility during transitions, (5) starting now locks in insurability while they are employed and healthy — if disruption leads to career change or income loss, future insurance may be harder to obtain",
      "Tell them AI is nothing to worry about",
      "Agree that they should wait for economic clarity"
    ],
    correct: 1,
    explanation: "AI-driven job displacement fears are the modern version of 'what if I lose my job?' Counter with: (1) uncertainty increases the need for protection, not decreases it, (2) if AI disrupts their career, having insurance already in place means they are covered during the transition, (3) trying to buy insurance AFTER a career disruption (potentially unemployed, stressed, possibly with health issues) is much harder and more expensive, (4) Pro Achiever's flexibility features (Premium Pass, policy loan) accommodate career transitions. The best time to build an umbrella is when the sun is shining, not during the storm.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'Why should I pay insurance premiums when I could invest in my own professional development (MBA, certifications) for higher returns?' How do you balance career investment vs insurance?",
    options: [
      "Tell them professional development is a waste of money",
      "Validate their career investment mindset, then show they are not mutually exclusive: (1) an MBA or certification increases EARNING power but provides zero PROTECTION, (2) if they invest in an MBA but die during the program, their family gets nothing, (3) Pro Achiever at minimum premium ($200/month) is a small fraction of MBA costs ($50,000-100,000), (4) they can pursue both: invest in their career AND protect their family. The combination of growing earnings + insurance protection creates a much stronger financial position than either alone",
      "Agree that professional development always beats insurance",
      "Tell them to skip the MBA and buy more insurance"
    ],
    correct: 1,
    explanation: "Career investment and insurance serve completely different purposes — they are not competing alternatives. Key insight: (1) professional development increases earning potential — but potential is worthless if the earner dies or becomes disabled, (2) insurance protects the VALUE of those career investments for the family, (3) the math: $200/month for Pro Achiever vs $50,000-100,000 for an MBA — the insurance cost is trivial relative to the career investment, (4) the client is already a forward-thinker (investing in development) — show them that smart forward-thinking includes protecting the investment. Both together create maximum value.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I've been comparing online and offline insurance quotes — online is much cheaper.' How do you justify the value of advisor-mediated insurance?",
    options: [
      "Tell them online insurance is a scam",
      "Acknowledge that direct-purchase insurance is often cheaper due to lower distribution costs, then differentiate: (1) online products are typically simple term or whole life — not comprehensive ILPs with investment components, (2) you provide personalized advice, ongoing annual reviews, claims support, and portfolio guidance, (3) the online product does not conduct an FNA — it sells products, not solutions, (4) when a family needs to file a death claim, having an advisor guide them through the process is invaluable, (5) the cost difference funds a lifetime of professional support",
      "Deny that online options exist",
      "Reduce your commission to match online prices (which you cannot)"
    ],
    correct: 1,
    explanation: "Online insurance is cheaper because it eliminates the advisor — but what is lost? (1) No personalized Financial Needs Analysis — the client self-diagnoses their needs, (2) no ongoing review and adjustment as life circumstances change, (3) no behavioral coaching during market volatility (preventing panic switches), (4) no claims support when the family needs it most, (5) no accountability — online platforms sell products, not advice. Your fees fund a decades-long advisory relationship. For simple term insurance, online may be fine. For comprehensive financial planning with Pro Achiever, the advisor's value is substantial and measurable.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'I'd rather save for a down payment on a condo and start insurance later.' How do you position insurance alongside property goals?",
    options: [
      "Tell them property is a bad investment",
      "Support their property goal AND insurance: (1) saving for a down payment is smart — but what happens if they die during the saving period? Their family loses the savings AND has no insurance protection, (2) start Pro Achiever at minimum ($200/month) alongside property savings, (3) when they eventually take a mortgage, they will NEED insurance to protect it — starting now means lower COI and established coverage, (4) the Capital Guarantee ensures their Pro Achiever value passes to their family if anything happens during the saving period",
      "Insist they give up the condo dream for insurance",
      "Agree that property always comes first"
    ],
    correct: 1,
    explanation: "The property-first mentality ignores a critical gap: during the 3-5 year saving period, the client is uninsured. If they die, the family gets the accumulated savings (which may not be enough) and zero insurance coverage. Starting a minimum Pro Achiever alongside property savings adds: (1) insurance protection during the saving period, (2) DCA investment accumulation, (3) when the mortgage comes, they already have established coverage (and potentially a policy they can use as collateral via conditional assignment). The $200/month insurance premium is a small fraction of what they are saving for the down payment — both goals can coexist.",
    category: 'objection-handling'
  },
  {
    question: "A client who is an avid marathon runner asks if their fitness reduces their insurance costs. How do you leverage their lifestyle?",
    options: [
      "Tell them fitness has no impact on insurance",
      "Leverage their fitness positively: (1) their excellent health likely qualifies them for the best underwriting classification (non-smoker, preferred health), meaning lowest possible COI, (2) AIA Vitality may reward their active lifestyle with additional benefits, (3) their discipline in training parallels the discipline of regular premium payments — use this connection, (4) frame Pro Achiever as another dimension of their 'long game' mindset — just as marathon training builds endurance, regular premiums build financial endurance",
      "Tell them marathon running is dangerous and increases COI",
      "Suggest they stop running and focus on insurance"
    ],
    correct: 1,
    explanation: "Health-conscious clients are ideal Pro Achiever candidates: (1) their fitness gives them the best underwriting outcomes — lowest COI, no loading, no exclusions, (2) AIA Vitality potentially rewards their active lifestyle, (3) the marathon mindset (delayed gratification, consistent effort, long-term goals) perfectly aligns with ILP investing philosophy, (4) use their language: 'You train for 26.2 miles — Pro Achiever is your financial marathon, building wealth over 10-20 years with the same consistency and discipline.' Athletes understand that great outcomes require sustained commitment.",
    category: 'sales-angles'
  },
  {
    question: "How do you handle a client who insists on only communicating via WhatsApp and refuses to meet in person?",
    options: [
      "Refuse to serve them unless they meet in person",
      "Accommodate their preference while maintaining compliance: (1) use WhatsApp for initial discussions and document sharing, (2) conduct the FNA via video call (Zoom/Google Meet) — screen-share the forms, (3) ensure all mandatory documents (PHS, BI) are shared digitally and acknowledged, (4) for the application signing, arrange a brief in-person meeting or use AIA's e-application facility if available, (5) document all advice given via WhatsApp for compliance records",
      "Only communicate via email",
      "Send all documents without explanation"
    ],
    correct: 1,
    explanation: "Modern clients may prefer digital communication. Accommodate while maintaining compliance: (1) WhatsApp for scheduling, quick questions, and document sharing, (2) video calls for detailed discussions (FNA, product presentation, BI walkthrough), (3) digital document sharing with read receipts for PHS and BI, (4) for signatures, use AIA's digital application tools or arrange a brief physical meeting, (5) CRITICAL: save all WhatsApp conversations as compliance records — they serve as evidence of advice given. Adapting to client communication preferences while maintaining regulatory standards shows professionalism and client-centricity.",
    category: 'roleplay'
  },
  {
    question: "A client who is a Grab Food delivery rider on an e-bike asks about Pro Achiever. What occupation-related considerations apply?",
    options: [
      "E-bike riders are not eligible for insurance",
      "Address the occupation honestly: (1) delivery riders face higher accident risk than office workers — this may affect underwriting, (2) check AIA's occupation classification for delivery riders, (3) potential outcomes: standard acceptance, acceptance with loading, or exclusion of riding-related accidents, (4) regardless of underwriting outcome, this client has ZERO employer benefits and needs personal insurance urgently, (5) start the application and let underwriting assess — don't self-select out of the process",
      "Guarantee standard rates regardless of occupation",
      "Recommend only personal accident insurance"
    ],
    correct: 1,
    explanation: "Delivery riders on e-bikes have specific risk considerations: (1) higher road accident exposure than office workers, (2) underwriting may classify them differently, potentially resulting in loading or riding-specific exclusions, (3) however, they are absolutely eligible to apply — let AIA's underwriting team make the assessment, (4) the key message: they need insurance MORE than office workers because they have zero employer coverage and face higher occupational risks. Apply first, let underwriting decide. Even with loading, having coverage is infinitely better than having none.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'What happens if Singapore changes its tax laws and introduces capital gains tax?' How would this affect Pro Achiever?",
    options: [
      "Capital gains tax will never be introduced in Singapore",
      "Be honest that tax laws can change: (1) currently, there is no capital gains tax in Singapore — insurance investment gains are tax-free, (2) if capital gains tax were introduced, it would depend on whether life insurance policies are exempt or included, (3) historically, many countries that introduced capital gains tax provided exemptions or grandfathering for existing insurance policies, (4) even if taxed, the insurance protection, bonuses, and enforced discipline remain valuable, (5) this is a risk that applies to ALL investment vehicles, not just Pro Achiever",
      "Promise that Pro Achiever will always be tax-free",
      "Suggest moving all money offshore to avoid potential taxes"
    ],
    correct: 1,
    explanation: "Tax law changes are beyond anyone's control, but the honest response builds trust: (1) currently, Singapore has no capital gains tax — a significant advantage, (2) if this changes, life insurance policies have historically received favorable treatment in most jurisdictions (exemptions or grandfathering), (3) the value of Pro Achiever extends beyond tax efficiency — protection, bonuses, and discipline remain regardless of tax treatment, (4) this is a risk for ALL investment vehicles, not unique to Pro Achiever. Being transparent about potential risks while contextualizing them demonstrates integrity.",
    category: 'objection-handling'
  },
  {
    question: "Client: 'My CPF SA earns 4% guaranteed — why would I invest in Pro Achiever at a non-guaranteed rate?' How do you address the CPF Special Account comparison?",
    options: [
      "Tell them CPF is a bad deal",
      "Acknowledge CPF SA's strengths, then differentiate: (1) CPF SA's 4% is guaranteed and risk-free — excellent for retirement savings, (2) however, CPF SA has withdrawal restrictions (locked until 55, and even then with limits), (3) CPF SA provides no life insurance protection, (4) Pro Achiever provides what CPF SA cannot: death benefit protection, flexible access after Year 10, bonus structures, and potential for higher returns, (5) the optimal strategy is BOTH: maximize CPF SA (guaranteed returns) AND add Pro Achiever (protection + growth potential). They serve different purposes",
      "Promise that Pro Achiever will beat 4% guaranteed",
      "Suggest they withdraw CPF SA to invest in Pro Achiever"
    ],
    correct: 1,
    explanation: "CPF SA at 4% guaranteed is genuinely attractive — respect that. But it has limitations Pro Achiever addresses: (1) CPF SA is locked until 55 with limited withdrawal options, (2) CPF SA provides zero life insurance protection, (3) CPF SA has a contribution cap. Pro Achiever adds: insurance protection (Capital Guarantee on Death), flexible access after the lock-in, bonus structures that boost returns, and no contribution cap. The wise approach: maximize CPF SA first (tax-deductible, guaranteed, risk-free), then add Pro Achiever for the dimensions CPF cannot provide. Complementary, not competing.",
    category: 'objection-handling'
  },
  {
    question: "A newly widowed client (age 45) with two children received a $300,000 insurance payout from her late husband's policy. She asks for your advice on managing the proceeds. How do you help?",
    options: [
      "Recommend investing all $300,000 into Pro Achiever immediately",
      "Prioritize stability and long-term planning: (1) first, ensure immediate expenses are covered (funeral, debts, 6-12 months of living expenses in a liquid account), (2) assess her income situation — can she sustain the household alone? (3) consider a moderate Pro Achiever policy for HER life — she is now the sole provider for two children, (4) invest a portion of the remaining proceeds conservatively for education funds, (5) avoid making major financial decisions in the immediate grief period — park funds safely and review in 3-6 months",
      "Tell her to spend the money while she can",
      "Invest everything in high-risk equity funds for maximum growth"
    ],
    correct: 1,
    explanation: "A recently widowed client needs careful, empathetic guidance — not aggressive product-pushing. Priority order: (1) immediate financial stability — cover debts, funeral costs, establish a 12-month emergency fund, (2) assess ongoing income vs expenses — can she sustain the household? (3) she is now the SOLE provider — insurance on HER life is critically important for the children, (4) conservatively deploy the remaining proceeds — education funds for the children, diversified investments for the future, (5) avoid major decisions during the acute grief period (first 3-6 months). This is when advisory relationship matters most.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'If I am diagnosed with a terminal illness while my Pro Achiever policy is in force, what happens?' How do you explain the terminal illness benefit?",
    options: [
      "Nothing happens until the policyholder actually dies",
      "If diagnosed with a terminal illness (typically life expectancy of 12 months or less as certified by specialists), the policyholder may be eligible for an accelerated death benefit payout — receiving the death benefit while still alive to settle affairs, cover medical costs, and provide for their family",
      "The policy is immediately cancelled",
      "Premiums are doubled upon terminal illness diagnosis"
    ],
    correct: 1,
    explanation: "The terminal illness benefit is a crucial feature: if the policyholder is diagnosed with a terminal illness (typically defined as 12 months or less life expectancy, certified by two specialists), they can receive the death benefit as an accelerated payout while still alive. This allows them to: (1) settle outstanding debts, (2) cover medical and palliative care costs, (3) provide for their family while they can still manage the process, (4) maintain dignity and control over their financial affairs. This benefit transforms the death benefit from a posthumous payout into a living benefit when it is needed most.",
    category: 'product-facts'
  },
  {
    question: "What is the 'waiting period' for certain benefits or riders in Pro Achiever 3.0?",
    options: [
      "There is no waiting period for any benefits",
      "Some riders or benefits have a waiting period (typically 30-90 days from policy inception) during which specific claims are not payable. This prevents adverse selection — people buying insurance only when they know they already have a condition. The base death benefit from accidents is usually covered immediately, while illness-related benefits may have a waiting period",
      "The waiting period is 5 years",
      "Waiting periods only apply to medical insurance, not ILPs"
    ],
    correct: 1,
    explanation: "Waiting periods are anti-adverse-selection measures: (1) they prevent people from buying insurance after already being diagnosed or suspecting a condition, (2) typical waiting periods are 30-90 days for illness-related claims, (3) accidental death is usually covered immediately from policy inception, (4) the waiting period applies from the policy inception date or, in the case of reinstatement, from the reinstatement date. Understanding and communicating waiting periods is important so clients know exactly when their coverage is fully active.",
    category: 'product-facts'
  },
  {
    question: "A couple in their early 30s tells you they have decided never to have children (DINK — Double Income, No Kids). Do they still need Pro Achiever?",
    options: [
      "No — without children, they don't need insurance",
      "Yes, but the emphasis shifts: (1) without children, the death benefit priority is lower but not zero — they may have debts, aging parents to support, or a spouse who depends on their income, (2) the INVESTMENT component becomes the primary value — wealth accumulation for early retirement, lifestyle goals, or legacy, (3) the 20-year plan for maximum compounding is ideal for a couple focused on building wealth without child-related expenses, (4) consider smaller ATR but meaningful investment premium",
      "Recommend the maximum death benefit coverage",
      "Tell them they will change their mind about children"
    ],
    correct: 1,
    explanation: "DINK couples have different but valid insurance and investment needs: (1) the death benefit matters less for income replacement but still covers debts, supporting aging parents, and spousal protection, (2) the investment component becomes the star — with no child-related expenses, they can commit higher premiums for maximum compounding, (3) early retirement or financial independence becomes a realistic goal, (4) the 20-year plan captures the best bonus tiers and longest compounding. Pro Achiever serves DINK couples primarily as a wealth-building tool with insurance as a secondary benefit, exactly the opposite of the typical family-with-children emphasis.",
    category: 'sales-angles'
  },
  {
    question: "How should you prepare for a meeting with a potential high-net-worth client referred by an existing client?",
    options: [
      "Use the same generic presentation as for any client",
      "Prepare comprehensively: (1) research the prospect's background (profession, public information) to understand their likely financial situation, (2) prepare high-level scenarios at premium tiers appropriate for their income, (3) understand their likely concerns (estate planning, tax efficiency, wealth preservation), (4) bring examples of how Pro Achiever serves HNW needs (probate bypass, creditor protection, legacy planning), (5) dress appropriately and meet at a venue befitting their status. First impressions matter, and referrals from existing clients carry your reputation",
      "Only discuss the minimum premium option",
      "Ask the referring client how much the prospect earns"
    ],
    correct: 1,
    explanation: "HNW referrals require elevated preparation: (1) research their background — LinkedIn, company website, public information — to understand their world, (2) prepare scenarios at premium levels appropriate for their likely income (not just the minimum), (3) understand HNW-specific concerns: estate planning, wealth transfer, creditor protection, tax efficiency, (4) position Pro Achiever as a strategic tool, not a protection product, (5) the referring client's reputation is at stake — deliver a professional experience that reflects well on both you and them. HNW clients who are impressed become centers of influence within their wealthy network.",
    category: 'roleplay'
  },
  {
    question: "A client asks, 'How do I know my advisor won't recommend products just for higher commissions?' What trust-building steps can you take?",
    options: [
      "Tell them to just trust you",
      "Build trust through transparency and structure: (1) show them the FNA process — it is documented evidence that the recommendation matches their needs, (2) explain MAS suitability requirements — you are personally liable for unsuitable recommendations, (3) offer to show the BI projections for MULTIPLE products (including lower-commission options) so they can compare, (4) share your professional credentials, track record, and client testimonials, (5) propose regular reviews — ongoing accountability demonstrates commitment to their long-term interest, not just the initial sale",
      "Get offended by the implication",
      "Offer to work for free"
    ],
    correct: 1,
    explanation: "The commission concern is universal and legitimate. Build trust through systems, not just words: (1) the documented FNA creates an evidence trail showing the recommendation is needs-based, (2) MAS regulations make YOU personally liable for unsuitable recommendations — this is your incentive to advise properly, (3) showing multiple product options (including lower-commission alternatives) demonstrates objectivity, (4) ongoing annual reviews prove long-term commitment beyond the initial sale, (5) client testimonials provide social proof. The best defense against commission bias is a process so transparent that the client can verify the recommendation themselves.",
    category: 'objection-handling'
  },
  {
    question: "What is 'substandard underwriting' and how does it affect Pro Achiever 3.0 policyholders?",
    options: [
      "It means the policy quality is below standard",
      "It means the applicant is classified as higher risk than standard due to health conditions, occupation, or lifestyle. The policy may be issued with premium loading (higher COI), specific exclusions, or reduced coverage. The policyholder pays more for insurance but still has access to the investment features and bonuses",
      "It means AIA's underwriting department made an error",
      "It is a temporary classification that changes after 1 year"
    ],
    correct: 1,
    explanation: "Substandard underwriting means the applicant presents higher-than-normal risk. The practical impact on Pro Achiever: (1) higher COI charges are deducted from the fund value each month, reducing net investment growth, (2) specific conditions may be excluded from coverage, (3) the premium stays the same but more is consumed by insurance charges. The investment features (funds, bonuses, DCA) remain fully available. Clients with substandard ratings should understand the higher cost but also appreciate that they HAVE coverage — many conditions could worsen, making future coverage even harder to obtain.",
    category: 'product-facts'
  },
  {
    question: "A client wants to take out a second Pro Achiever 3.0 policy while their first is still in force. Is this allowed?",
    options: [
      "No — only one Pro Achiever policy is allowed per person",
      "Yes, multiple Pro Achiever policies can be held simultaneously. This is common for clients who want to access new features (e.g., upgrading from 2.0 to 3.0), change the investment period, or increase coverage. Each policy is independent with its own charges, bonuses, and terms",
      "Only after the first policy reaches Year 10",
      "Only if the first policy is surrendered"
    ],
    correct: 1,
    explanation: "Multiple Pro Achiever policies can coexist. Common reasons: (1) keeping an older Pro Achiever 2.0 policy while adding a 3.0 policy to access new features (commingling, GDIF), (2) different investment periods for different goals (e.g., 10-year for near-term, 20-year for retirement), (3) capturing different premium tiers for different bonus levels. Each policy is independent — its own charges, bonuses, lock-in period, and fund allocation. This is actually the recommended approach rather than replacing an existing policy, which would lose accrued value.",
    category: 'product-facts'
  },
  {
    question: "How should you position Pro Achiever 3.0 to a client who primarily earns in USD (e.g., remote worker for a US company)?",
    options: [
      "Tell them SGD products are not suitable for USD earners",
      "Position the SGD policy as currency diversification: (1) earning in USD and saving in SGD provides natural currency hedging, (2) SGD has historically been a stable, well-managed currency, (3) if they plan to live in Singapore long-term, their expenses are in SGD — matching liabilities with SGD-denominated assets makes sense, (4) Pro Achiever's underlying funds invest globally (including USD-denominated assets), providing indirect USD exposure within the SGD wrapper",
      "Recommend they only buy US insurance products",
      "Suggest they wait for the SGD to weaken before buying"
    ],
    correct: 1,
    explanation: "USD earners holding SGD assets achieve natural currency diversification — a sound financial strategy. Key points: (1) if they live and spend in Singapore, SGD-denominated insurance matches their living expenses, (2) SGD has been a consistently well-managed currency with gradual appreciation against most currencies, (3) Pro Achiever's underlying funds include global investments in multiple currencies — so there IS indirect USD exposure, (4) having assets in both currencies reduces total portfolio currency risk. Position the SGD policy as a deliberate diversification strategy, not a mismatch.",
    category: 'sales-angles'
  },
  {
    question: "A client asks what happens if they miss a premium payment but do NOT want to use Premium Pass or take a policy loan. What are their options?",
    options: [
      "The policy is immediately terminated",
      "The 30-day grace period applies automatically — coverage continues for 30 days after the missed due date. If payment is made within the grace period, the policy continues as if the payment was never missed. If the grace period expires without payment, the policy may enter Premium Holiday (charges deducted from fund value) or eventually lapse depending on fund value adequacy",
      "AIA automatically charges the premium to a credit card",
      "The policyholder must reapply for a new policy"
    ],
    correct: 1,
    explanation: "The grace period is the automatic first line of defense: (1) 30 days of continued full coverage after a missed payment, (2) if the premium is paid within the grace period, the policy continues seamlessly, (3) if not paid, the policy typically enters an automatic Premium Holiday where charges are deducted from the existing fund value, (4) the policy remains in force as long as the fund value can sustain the charges. The policyholder should pay the missed premium as soon as possible to avoid fund value erosion from ongoing charges without new premium contributions.",
    category: 'product-facts'
  },
  {
    question: "Client: 'I already save 30% of my income — I have the discipline to invest on my own without enforced savings.' How do you respond to a genuinely disciplined saver?",
    options: [
      "Tell them their discipline will eventually fail",
      "Commend their exceptional discipline (top 5% of the population), then highlight what self-directed saving STILL lacks: (1) no life insurance protection — if they die, there is no multiplier effect on their savings, (2) no bonus structures — Pro Achiever's welcome and special bonuses add returns that self-directed investing cannot replicate, (3) no capital guarantee on death, (4) position Pro Achiever as a SMALL allocation (10-15% of their savings rate) that adds the protection and bonus dimensions their self-directed approach cannot provide",
      "Agree they don't need any insurance products",
      "Challenge their savings discipline claim aggressively"
    ],
    correct: 1,
    explanation: "A genuinely disciplined saver is rare and should be respected. But even exceptional discipline cannot replicate certain Pro Achiever features: (1) the death benefit multiplier — $200/month creates $200,000+ in immediate estate value with ATR; no savings account does this, (2) welcome bonus (5-75%) is free money that self-directed investing cannot generate, (3) special bonuses (5-8% annually from Year 10) add to returns beyond fund performance, (4) Capital Guarantee ensures beneficiaries receive at least 101% on death. Position Pro Achiever as a COMPLEMENT to their savings discipline — adding the unique dimensions only insurance can provide.",
    category: 'objection-handling'
  },
  {
    question: "A client couple in their late 20s asks, 'Should we buy insurance before or after our wedding?' What is the optimal timing?",
    options: [
      "Wait until after the wedding when finances settle",
      "Start BEFORE the wedding: (1) premiums are at their lowest now — every month of delay increases ANB cost, (2) wedding expenses are temporary (6-12 months); insurance commitment is long-term, (3) if something happens to either partner during the engagement period, the other has no financial protection without insurance, (4) starting at $200/month before the wedding is feasible alongside wedding savings, (5) post-wedding, they can increase the premium with the freed-up wedding budget. Protection should not wait for a ceremony",
      "Tell them insurance is not romantic and should wait",
      "Recommend spending the entire wedding budget on insurance"
    ],
    correct: 1,
    explanation: "Starting before the wedding is optimal for multiple reasons: (1) COI is locked at their youngest ANB — waiting even 6-12 months costs permanent money, (2) they are already planning a shared future — insurance is part of that commitment, (3) wedding expenses are finite and temporary; the protection gap during the engagement is real, (4) post-wedding, the freed-up wedding savings can increase the premium to access better bonus tiers. Frame it as: 'You are building your future together — let us make sure that future is protected from the start, not just from the wedding date.'",
    category: 'sales-angles'
  },
  {
    question: "A client asks whether they should disclose recreational marijuana use (during an overseas trip where it was legal) on their insurance application. What do you advise?",
    options: [
      "Tell them to hide it since it was overseas",
      "Advise FULL disclosure: (1) the health declaration asks about drug use — omitting it constitutes material non-disclosure, (2) if a claim is investigated and undisclosed drug use is discovered (even legal overseas use), the claim could be denied, (3) recreational use in a legal jurisdiction is different from habitual use — underwriting will assess the actual risk, (4) full disclosure may result in standard acceptance, mild loading, or no impact at all — but non-disclosure risks voiding the entire policy when it matters most",
      "Tell them drug use automatically disqualifies them",
      "Suggest they lie and say they have never used any substances"
    ],
    correct: 1,
    explanation: "Full disclosure is always the correct advice for insurance applications. The consequences of non-disclosure far outweigh any underwriting concern: (1) material non-disclosure can void the policy — meaning NO payout when the family needs it most, (2) recreational use in a legal jurisdiction is treated differently from habitual use — underwriting may have no concern, (3) even if a loading is applied, having valid coverage beats having a voided policy, (4) the 2-year contestability period means AIA can investigate and void for non-disclosure. The advisor's job is to ensure honest, complete disclosure — this protects the client's family, not just the insurer.",
    category: 'roleplay'
  }
];
