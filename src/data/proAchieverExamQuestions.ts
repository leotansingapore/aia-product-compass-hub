export interface ExamQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling';
}

export const proAchieverExamQuestions: ExamQuestion[] = [

  // ══════════════════════════════════════════
  // PRODUCT FACTS (15 questions)
  // Based on Pro Achiever 3.0 training materials
  // ══════════════════════════════════════════

  {
    question: "What type of insurance product is Pro Achiever 3.0?",
    options: [
      "Term life insurance with a savings component",
      "Regular premium Investment-Linked Policy (ILP)",
      "Whole life endowment with guaranteed maturity value",
      "Universal life policy with a fixed crediting rate"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 is a regular premium ILP — it combines life insurance protection with investment in sub-funds. Unlike endowments, returns are not guaranteed and depend on fund performance. It is AIA's best-selling investment plan as of 2024.",
    category: 'product-facts'
  },
  {
    question: "What are the three available investment period options for Pro Achiever 3.0?",
    options: [
      "5 years, 10 years, 15 years",
      "10 years, 20 years, 30 years",
      "10 years, 15 years, 20 years",
      "7 years, 14 years, 21 years"
    ],
    correct: 2,
    explanation: "Pro Achiever 3.0 introduced three investment period choices: 10, 15, or 20 years. This was an enhancement over Pro Achiever 2.0, which only had a 10-year period. A longer period generally qualifies for a higher welcome bonus.",
    category: 'product-facts'
  },
  {
    question: "What is the welcome bonus range for Pro Achiever 3.0, and what factors determine it?",
    options: [
      "A flat 3% welcome bonus for all clients, regardless of premium",
      "5% to 75%, depending on the annualised premium amount and the chosen investment period",
      "10% to 50%, based solely on the client's age at entry",
      "There is no welcome bonus — only the special bonus applies"
    ],
    correct: 1,
    explanation: "The welcome bonus ranges from 5% to 75% of the annualised premium. The higher the annual premium and the longer the investment period chosen, the higher the welcome bonus. It is credited in the first year and is designed to incentivise higher, longer-term commitments.",
    category: 'product-facts'
  },
  {
    question: "Can the welcome bonus be withdrawn during the policy's lock-in period?",
    options: [
      "Yes, it can be withdrawn immediately after the first anniversary",
      "Yes, but only 50% can be withdrawn before year 5",
      "No — the welcome bonus cannot be withdrawn within the first 10 years",
      "Yes, it is automatically paid out as cash each year"
    ],
    correct: 2,
    explanation: "The welcome bonus (5%–75%) cannot be withdrawn within the lock-in period of 10 years. It is invested into the policy and grows with the fund, but remains locked until the 10-year mark. This is a key point to explain to clients to manage expectations.",
    category: 'product-facts'
  },
  {
    question: "What is the 'special bonus' in Pro Achiever 3.0, and how is it calculated?",
    options: [
      "A 5% bonus of the total fund value paid at maturity only",
      "5% of the annualised premium from year 10, increasing to 8% from year 21 onwards — paid annually and withdrawable",
      "An 8% flat bonus on all premiums paid after year 5",
      "A one-time bonus of 10% of the fund value at the 10th anniversary"
    ],
    correct: 1,
    explanation: "From year 10, an additional 5% special bonus of the annualised premium is credited each year. This increases to 8% from year 21 onwards. For example, if the annualised premium is $10,000, the client gets an extra $500/year from year 10, and $800/year from year 21. Unlike the welcome bonus, the special bonus can be withdrawn at any time.",
    category: 'product-facts'
  },
  {
    question: "How long does the supplementary charge apply in Pro Achiever 3.0?",
    options: [
      "For the entire duration of the policy",
      "For the first 5 years only",
      "For the first 10–11 years only (3.9% p.a.); no supplementary charges after that",
      "There are no supplementary charges in Pro Achiever 3.0"
    ],
    correct: 2,
    explanation: "The supplementary charge is 3.9% p.a. and applies for approximately the first 10–11 years. After this period, the supplementary charge is capped — no further supplementary charges are deducted. This means more of the client's money goes toward investments in the later years of the policy.",
    category: 'product-facts'
  },
  {
    question: "What is the 'Premium Pass' feature in Pro Achiever 3.0?",
    options: [
      "A discount on premiums for loyal policyholders after 5 years",
      "The ability to take a break from paying premiums for up to 36 months, with no charges during this period",
      "A feature that automatically reduces the premium amount if the fund value drops",
      "An option to prepay multiple years of premiums in advance"
    ],
    correct: 1,
    explanation: "Premium Pass allows clients to pause their premium payments for up to 36 months (3 years) with no charges during the pause period. The number of years available depends on the initial investment period chosen. This is a new feature in Pro Achiever 3.0 that provides flexibility for clients facing temporary financial pressure.",
    category: 'product-facts'
  },
  {
    question: "What is 'commingling' in the context of Pro Achiever 3.0's fund selection?",
    options: [
      "Mixing two different insurance policies together under one premium",
      "The ability to combine AIA Elite Funds (e.g., Conservative, Balanced, Adventurous) with à la carte funds in a single portfolio",
      "Pooling investments with other policyholders to reduce risk",
      "A feature exclusive to joint policies held by couples"
    ],
    correct: 1,
    explanation: "Commingling refers to the ability to mix different fund types within one Pro Achiever policy — for example, allocating 30% to AIA Elite Balanced, 20% to AIA Elite Conservative, and 50% to an à la carte fund of choice. This was not possible in Pro Achiever 2.0, where clients had to choose just one risk profile (conservative, balanced, or adventurous).",
    category: 'product-facts'
  },
  {
    question: "What is the AIA Global Dynamic Income Fund, and what makes it unique to Pro Achiever 3.0?",
    options: [
      "A government bond fund available across all AIA products",
      "A high-yield emerging market equity fund available since 2018",
      "A fund that pays quarterly dividends, available exclusively to Pro Achiever 3.0 policyholders",
      "A fixed-deposit-like fund with a guaranteed 3% annual return"
    ],
    correct: 2,
    explanation: "The AIA Global Dynamic Income Fund is exclusive to Pro Achiever 3.0. It pays dividends every quarter and is designed for clients who want regular income from their investment. This makes it suitable for clients who want the growth of an ILP but also appreciate periodic payouts.",
    category: 'product-facts'
  },
  {
    question: "What is the typical annualised premium range for most Pro Achiever clients, based on training materials?",
    options: [
      "$1,200 to $2,400 per year ($100–$200/month)",
      "$4,800 to $6,000 per year, with some going above $12,000",
      "$500 to $1,000 per year",
      "$10,000 to $20,000 per year minimum"
    ],
    correct: 1,
    explanation: "According to training materials, most Pro Achiever clients pay between $4,800 and $6,000 per year (roughly $400–$500/month), with some higher-commitment clients exceeding $12,000/year. The case size average has grown from $3,800 to $5,000 in recent years. This is an important benchmark for advisors when sizing up proposals.",
    category: 'product-facts'
  },
  {
    question: "Who are the primary target market segments for Pro Achiever, according to the training?",
    options: [
      "Retirees aged 60+ with large lump sums to invest",
      "Fresh graduates, young working professionals, and parents planning for their children's education",
      "Business owners only who need key-man insurance",
      "High-net-worth clients with >$1 million in investable assets"
    ],
    correct: 1,
    explanation: "The primary target for Pro Achiever is fresh graduates and young working professionals in the wealth accumulation stage. A secondary use case is parents buying it for their children's education savings. About 80% of AIA consultants sell Pro Achiever, reflecting its broad applicability across the mass market.",
    category: 'product-facts'
  },
  {
    question: "What does Pro Achiever 3.0 offer in terms of additional protection through a rider?",
    options: [
      "A critical illness rider with premiums that increase with age",
      "An Additional Term Rider for death, terminal illness, and disability coverage with premiums that stay fixed throughout the coverage period",
      "A hospitalisation rider covering daily hospital cash",
      "A waiver of premium rider triggered by any illness"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 offers an Additional Term Rider that provides coverage for death, terminal illness, and disability. The premiums for this rider remain the same throughout the coverage period — unlike many term riders whose premiums increase with age. This provides stable and predictable protection costs alongside the investment.",
    category: 'product-facts'
  },
  {
    question: "What is the Legacy Planning feature in Pro Achiever 3.0?",
    options: [
      "A special fund portfolio designed for estate planning with tax benefits",
      "The ability to transfer the plan to a spouse or child for continued coverage and financial security",
      "A will-writing service offered free to all Pro Achiever policyholders",
      "An automatic payout to beneficiaries after a 30-day waiting period"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 includes a Legacy Planning feature that allows the policyholder to transfer the plan to a spouse or child, enabling continued coverage and financial security across generations. This makes it a useful tool for clients who want to pass on an investment vehicle to their loved ones.",
    category: 'product-facts'
  },
  {
    question: "What is the key difference between the 'Premium Pass' and 'Premium Holiday' in Pro Achiever 3.0?",
    options: [
      "They are the same feature with different names",
      "Premium Pass allows a structured break of up to 36 months with no charges; Premium Holiday pauses payments when facing financial difficulty, also with no premium holiday charges",
      "Premium Pass reduces the premium amount; Premium Holiday suspends the policy entirely",
      "Premium Holiday is only available after year 15; Premium Pass can be used from year 1"
    ],
    correct: 1,
    explanation: "Both are flexibility features. Premium Pass is a planned break from premium payments for up to 36 months with no charges — useful for sabbaticals or planned career breaks. Premium Holiday is for clients facing unexpected financial difficulties, allowing them to pause without premium holiday charges. Both help prevent unnecessary policy lapses.",
    category: 'product-facts'
  },
  {
    question: "What was a key enhancement of Pro Achiever 3.0 over the previous version 2.0?",
    options: [
      "Pro Achiever 3.0 removed all supplementary charges entirely",
      "Pro Achiever 3.0 reduced the minimum investment period from 20 years to 5 years",
      "Pro Achiever 3.0 introduced three investment period options (10/15/20 years), higher welcome bonus (up to 75%), fund commingling, Premium Pass, and the AIA Global Dynamic Income Fund",
      "Pro Achiever 3.0 introduced a guaranteed minimum return of 3% per year"
    ],
    correct: 2,
    explanation: "Pro Achiever 3.0 (launched August 2024) significantly enhanced over 2.0: (1) Three period choices instead of one 10-year period; (2) Welcome bonus increased from 10% to up to 75%; (3) Fund commingling allowing mixed portfolio; (4) New Premium Pass feature; (5) Exclusive AIA Global Dynamic Income Fund with quarterly dividends.",
    category: 'product-facts'
  },

  // ══════════════════════════════════════════
  // SALES ANGLES (10 questions)
  // ══════════════════════════════════════════

  {
    question: "A 26-year-old fresh graduate earns $3,500/month and wants to 'start building wealth properly'. Which Pro Achiever 3.0 benefit do you lead with?",
    options: [
      "The guaranteed maturity value and fixed returns",
      "The welcome bonus (up to 75%) that boosts their investment from year 1, combined with the 10/15/20-year investment period flexibility",
      "The short-term liquidity through Premium Holiday",
      "The critical illness coverage component"
    ],
    correct: 1,
    explanation: "For a fresh grad starting wealth accumulation, lead with the welcome bonus — it's a tangible, exciting benefit that makes starting early feel rewarding. Pair it with the investment period choice (younger = longer period = higher bonus). This creates urgency to start now rather than wait.",
    category: 'sales-angles'
  },
  {
    question: "A client asks how Pro Achiever 3.0 compares to simply putting $500/month into a robo-advisor. What is your most compelling response?",
    options: [
      "Pro Achiever always beats robo-advisors on returns",
      "Robo-advisors charge higher fees than ILPs",
      "Pro Achiever bundles life protection and a welcome bonus into the investment — the client gets comparable fund diversification plus a death/disability benefit and a structured bonus, all in one plan",
      "Pro Achiever's funds are government-backed unlike robo-advisors"
    ],
    correct: 2,
    explanation: "The key differentiators vs robo-advisors are: (1) Integrated life protection — robo-advisors pay nothing if you die; (2) The welcome bonus (up to 75%) — a robo-advisor has no equivalent; (3) Structured discipline — the regular premium commitment builds the savings habit. Ask: 'Does your robo-advisor give you a bonus on day one and pay your family if something happens?'",
    category: 'sales-angles'
  },
  {
    question: "When using goal-based selling for Pro Achiever 3.0, which technique creates the most emotional engagement?",
    options: [
      "Show the client a table comparing ILP vs term plan charges",
      "Use a goal-based projection illustration tied to a specific personal milestone — e.g., 'Based on your chosen period, here's what this could look like when your child is ready for university'",
      "Explain the mechanics of supplementary charges in detail",
      "List all available AIA Elite Funds and their past performance"
    ],
    correct: 1,
    explanation: "Goal-based selling creates urgency and personal relevance. Tie the projection to a specific life event — child's education (secondary use case confirmed in training), retirement, or a business goal. Pro Achiever is explicitly used by parents for children's education, making this a proven and emotionally resonant angle.",
    category: 'sales-angles'
  },
  {
    question: "A client is deciding between the 10-year and 20-year investment periods for Pro Achiever 3.0. How do you guide this conversation?",
    options: [
      "Always recommend 10 years as it is the safest option",
      "Guide them based on their goal timeline and explain that a longer period unlocks a higher welcome bonus and a better special bonus trajectory — use the illustration to show the difference",
      "Tell them both periods are identical in returns",
      "Recommend 20 years only for clients above age 40"
    ],
    correct: 1,
    explanation: "The 20-year period offers a higher welcome bonus and longer compounding from the special bonus (5% from year 10, 8% from year 21). Use an illustration to show the actual numbers — the difference can be tens of thousands of dollars. Help clients match the period to a real goal: '20 years aligns perfectly with your retirement at 60.'",
    category: 'sales-angles'
  },
  {
    question: "A client who just received a year-end bonus wants to invest a lump sum into Pro Achiever 3.0. What do you advise?",
    options: [
      "Pro Achiever only accepts regular monthly premiums — lump sums are not possible",
      "Advise them to start a new policy with the lump sum as the first-year premium to maximise the welcome bonus, and set regular premiums going forward",
      "Tell them to put the lump sum in a fixed deposit first, then use it to fund the policy",
      "Suggest they split it across multiple insurance companies for diversification"
    ],
    correct: 1,
    explanation: "Pro Achiever 3.0 supports top-up premiums. A lump sum deployed as a large first-year contribution directly increases the welcome bonus (since the bonus is tied to annualised premium). This is a powerful onboarding technique — use the illustration to show how a higher starting premium unlocks the upper end of the welcome bonus range.",
    category: 'sales-angles'
  },
  {
    question: "A self-employed client with fluctuating income is interested in Pro Achiever 3.0 but worried about the commitment. What features do you highlight?",
    options: [
      "Tell them the fixed premium schedule is actually beneficial for self-employed people",
      "Highlight the Premium Pass (up to 36 months break, no charges) and Premium Holiday features — they can pause without surrendering the policy during lean periods",
      "Advise them to wait until their income stabilises before starting",
      "Suggest a savings account as a lower-commitment alternative"
    ],
    correct: 1,
    explanation: "The Premium Pass and Premium Holiday features were built exactly for this concern. Premium Pass allows up to 36 months of planned breaks; Premium Holiday covers unexpected financial difficulty — both with no charges. Reassure them: 'If business slows down, you can press pause. You don't lose what you've built.'",
    category: 'sales-angles'
  },
  {
    question: "A married couple with two young children wants to plan for both retirement AND education funding. How do you frame the Pro Achiever 3.0 conversation?",
    options: [
      "Tell them to take out two separate Pro Achiever policies — one per goal",
      "Show a 20-year illustration: the special bonus from year 10 can fund education milestones while the full fund continues growing for retirement — one plan, two goals",
      "Suggest an endowment for education and Pro Achiever for retirement separately",
      "Tell them Pro Achiever is only for retirement, not education"
    ],
    correct: 1,
    explanation: "Pro Achiever is explicitly used by parents for their children's education — this is confirmed in the training materials as a key secondary use case. A 20-year policy with a child aged 3 matures when the child is ~23. The special bonus from year 10 onwards (withdrawable at any time) can also fund secondary school or university costs along the way.",
    category: 'sales-angles'
  },
  {
    question: "During a product presentation, a client says they prefer 'safe' investments. How do you position Pro Achiever 3.0 without misrepresenting it?",
    options: [
      "Tell them Pro Achiever is safe because AIA is a large reputable company",
      "Acknowledge their preference, guide them toward the lower-risk AIA Elite Conservative or balanced fund options within Pro Achiever, while being clear about the non-guaranteed nature of returns",
      "Agree and recommend an endowment plan instead",
      "Avoid mentioning market risk to prevent alarming them"
    ],
    correct: 1,
    explanation: "Never obscure market risk — this is a compliance and ethical requirement. Instead, acknowledge their preference and show how the AIA Elite Funds (Conservative, Balanced) within Pro Achiever accommodate cautious investors. Highlight the commingling feature: they can start conservative and gradually shift to more growth-oriented funds using the free switching option.",
    category: 'sales-angles'
  },
  {
    question: "A prospect asks: 'Why should I choose Pro Achiever over just keeping money in a fixed deposit?' What are the three strongest points?",
    options: [
      "Higher safety, lower fees, fixed returns",
      "Guaranteed 6% annual return, zero charges, free withdrawal anytime",
      "Higher long-term growth potential through AIA Elite Funds; a welcome bonus of up to 75% that FD has no equivalent for; built-in life protection — FD pays nothing on death",
      "Government-backed returns; lower expense ratio than any other product; fixed deposit interest is taxable"
    ],
    correct: 2,
    explanation: "The three pillars vs FD: (1) Growth potential — diversified fund exposure vs FD's ~2–3% per year; (2) The welcome bonus (up to 75%) — FD offers no equivalent upfront boost; (3) Life protection built in — FD pays zero to your family if you pass away. Acknowledge trade-offs honestly: Pro Achiever carries market risk and is not for money needed short-term.",
    category: 'sales-angles'
  },
  {
    question: "About what percentage of AIA consultants sell Pro Achiever, and what does this tell you about how to position it?",
    options: [
      "About 20% — it is a specialist product for high-net-worth clients only",
      "About 80% — it is a core, widely applicable product suitable for most working adults in the wealth accumulation stage",
      "About 50% — it splits evenly between investment and protection-focused consultants",
      "About 5% — it is a niche product for specific client profiles only"
    ],
    correct: 1,
    explanation: "About 80% of AIA consultants sell Pro Achiever — making it a flagship mass-market product, not a niche offering. This means it is suitable for a broad range of clients: young professionals, fresh grads, parents saving for children, and even clients with higher disposable income. Its broad suitability is a key selling point when a prospect asks if it's 'right for them'.",
    category: 'sales-angles'
  },

  // ══════════════════════════════════════════
  // OBJECTION HANDLING (10 questions)
  // ══════════════════════════════════════════

  {
    question: "A prospect says: 'ILPs have very high charges — I read about it online.' How do you handle this?",
    options: [
      "Deny the charges exist and redirect to fund performance numbers",
      "Agree and suggest a term plan paired with a unit trust instead",
      "Acknowledge that charges exist (3.9% p.a. supplementary charge for ~10 years), explain they are capped after year 10–11, and show how the welcome bonus (up to 75%) helps offset the early charge impact",
      "Tell them the internet is wrong and only trust AIA's materials"
    ],
    correct: 2,
    explanation: "Transparency builds trust. Acknowledge: yes, there is a 3.9% p.a. supplementary charge for the first 10–11 years — this is factual. Then contextualise: (1) The welcome bonus (up to 75%) directly offsets early costs; (2) After year 10–11, no more supplementary charges; (3) The special bonus from year 10 adds returns. Use the actual illustration to make the net effect visible.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I don't like the idea that my money can go down in value.' What is the most effective response?",
    options: [
      "Promise that markets always recover and they should not worry",
      "Acknowledge the concern, guide them toward the AIA Elite Conservative fund for lower volatility, explain the commingling option lets them adjust over time, and emphasise that regular premiums provide DCA benefits",
      "Tell them to only use the money market fund option",
      "Agree with them and recommend a guaranteed endowment plan"
    ],
    correct: 1,
    explanation: "Address the fear with concrete mitigants: (1) The AIA Elite Conservative fund provides lower volatility within Pro Achiever; (2) Commingling lets them diversify gradually into growth funds at their own pace; (3) Regular premiums provide natural dollar-cost averaging — buying more units when prices are low. Never promise recovery — this is a compliance red flag.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'My friend surrendered his ILP after 3 years and lost a lot of money.' How do you respond?",
    options: [
      "Tell them their friend made a mistake and you would not do the same",
      "Acknowledge that early surrender is one of the biggest risks in ILPs; the supplementary charge applies for 10 years, so year 2–3 surrender almost always results in a loss — this is why Pro Achiever is a commitment for the full investment period",
      "Tell them Pro Achiever is different and this would never happen",
      "Avoid the topic and change the subject to the welcome bonus"
    ],
    correct: 1,
    explanation: "Your friend's experience is completely valid — early surrender within the supplementary charge period (first 10 years) locks in a loss. Be honest: 'Pro Achiever is designed to be held for the full 10, 15, or 20 years. I would only recommend it if it truly fits your long-term plan. If you might need this money in under 5 years, we should look at a different vehicle.' This builds credibility.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I can get better returns just buying S&P 500 ETFs myself. Why pay ILP charges?' How do you counter?",
    options: [
      "Tell them Pro Achiever's funds consistently outperform the S&P 500",
      "Agree and suggest they invest directly in ETFs instead",
      "Acknowledge their point on charges (3.9% supplementary charge for 10 years), then highlight the gaps ETFs don't fill: life protection, the welcome bonus of up to 75%, the disciplined savings structure, and legacy planning",
      "Tell them ILP charges are actually lower than ETF brokerage fees"
    ],
    correct: 2,
    explanation: "A financially savvy client may be right that ETF fees are lower. Don't fight on charges — instead identify the structural gaps: 'ETFs don't give you a welcome bonus of up to 75% on your first year. They don't pay your family a death benefit. And they don't come with a legacy transfer feature. If those have value to you, Pro Achiever justifies its additional cost.'",
    category: 'objection-handling'
  },
  {
    question: "A prospect asks: 'What if AIA goes bankrupt? What happens to my money?' How do you address this?",
    options: [
      "Tell them AIA has never lost money so this will never happen",
      "Explain that ILP sub-funds are held separately from AIA's own assets in a segregated fund account; also mention MAS regulatory oversight and the Policy Owners' Protection (PPF) Scheme for Singapore policyholders",
      "Tell them to just trust that AIA is a large company",
      "Acknowledge the risk and say there are no protections"
    ],
    correct: 1,
    explanation: "This is a legitimate concern. Key reassurances: (1) ILP sub-funds are legally segregated from AIA's own balance sheet — they cannot be used to settle AIA's liabilities; (2) MAS strictly regulates AIA, requiring capital reserves; (3) The Policy Owners' Protection (PPF) Scheme provides additional protection for Singapore policyholders. These structural protections significantly reduce (though don't eliminate) the risk.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I already have savings and CPF. I don't need another product.' How do you uncover a genuine need?",
    options: [
      "Tell them they definitely still need Pro Achiever regardless",
      "Ask discovery questions: 'Does CPF cover your family if something happened tomorrow? Do you have a vehicle for long-term growth beyond CPF limits? Does your savings account offer a welcome bonus and a structured investment plan?' — let the gaps emerge naturally",
      "Agree and end the meeting",
      "Tell them CPF returns are too low to rely on"
    ],
    correct: 1,
    explanation: "Never push the product — ask questions that reveal gaps. CPF has withdrawal restrictions and caps. Savings accounts grow slowly with no bonus. Pro Achiever offers: (1) Life protection; (2) AIA Elite Fund growth potential; (3) A welcome bonus with no CPF equivalent; (4) Legacy transfer to a spouse or child. Usually at least one gap emerges from discovery questions.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I'm not sure I can commit to a 20-year policy. What if my circumstances change?' What is the best reassurance?",
    options: [
      "Tell them they must commit or not take the policy",
      "Explain that Pro Achiever 3.0 has built-in flexibility: Premium Pass allows up to 36 months of paused payments with no charges; Premium Holiday covers unexpected hardship — they can pause without surrendering",
      "Offer to write the policy as a 5-year term instead",
      "Promise that they can surrender at any time with no cost"
    ],
    correct: 1,
    explanation: "Address commitment anxiety directly with Pro Achiever 3.0's flexibility toolkit: Premium Pass (up to 36 months, no charges) for planned breaks, and Premium Holiday for unexpected difficulty. The worst case is a pause — not a lapse. Reassure them: 'Life changes. Pro Achiever was designed knowing that. You have a built-in safety valve.'",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I'll think about it and get back to you.' What is the ideal response?",
    options: [
      "Accept it and wait for them to call back",
      "Pressure them to sign today before the offer expires",
      "Acknowledge their position, ask which specific aspect they want to think through to uncover a hidden objection, and set a specific follow-up date and time before ending the meeting",
      "Send them daily messages until they respond"
    ],
    correct: 2,
    explanation: "'Think about it' is almost always a hidden objection. Ask: 'Of course — is there a specific part you'd like more clarity on? Sometimes I can address it now.' Then close with a specific next touchpoint: 'How about a quick call next Thursday at 4pm? If you've decided it's not for you, just say so — I'll respect that completely.' Vague timelines almost never result in callbacks.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'My spouse needs to agree before I can proceed.' How do you handle this?",
    options: [
      "Tell them they don't need their spouse's approval for a financial plan",
      "Offer to arrange a meeting or call that includes the spouse, so both can hear the presentation together and any concerns can be addressed directly — especially how the legacy planning feature benefits the family",
      "Give all the materials and hope the client convinces the spouse",
      "Ask the client to proceed without telling their spouse"
    ],
    correct: 1,
    explanation: "A joint decision is legitimate and should be respected. The right move is to request an opportunity to present to both together: 'I'd love to walk through this with both of you — even a 30-minute call works. I can show how the legacy transfer feature directly benefits your family.' The spouse meeting often accelerates the close because it removes the relay game and surfaces real concerns directly.",
    category: 'objection-handling'
  },
  {
    question: "A client who purchased Pro Achiever 2 years ago calls wanting to surrender because the fund value is lower than what they paid in. How do you handle this retention conversation?",
    options: [
      "Support their decision and process the surrender immediately",
      "Acknowledge the frustration, explain that year 2 is the typical trough — the supplementary charge (3.9% p.a.) is still in effect for ~8 more years, surrendering now locks in the loss. Show the long-term projection and explore Premium Holiday or fund switching as alternatives",
      "Tell them they should have read the product illustration more carefully",
      "Offer to switch them to a different AIA product as retention"
    ],
    correct: 1,
    explanation: "Year 2 in the red is expected and was shown in the product illustration at point of sale. The supplementary charge runs for ~10 years — surrendering at year 2 locks in the worst possible outcome. Retention approach: validate the frustration, re-show the long-term projection, explain that the special bonus starting at year 10 changes the equation significantly, and explore Premium Holiday or switching to a more defensive fund rather than full surrender.",
    category: 'objection-handling'
  }
];
