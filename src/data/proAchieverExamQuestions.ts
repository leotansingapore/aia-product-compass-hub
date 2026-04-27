export interface ExamQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';
}

export const proAchieverExamQuestions: ExamQuestion[] = [

  // ══════════════════════════════════════════
  // PRODUCT Q&A (10 questions)
  // Sourced from: Pro Achiever Overview, AIA's Materials, APA Charges, Overview of Product Features
  // ══════════════════════════════════════════

  {
    question: "What type of insurance product is Pro Achiever (APA) 3.0?",
    options: [
      "A whole life endowment plan with guaranteed maturity value",
      "A regular premium Investment-Linked Policy (ILP)",
      "A term life policy with a cash savings component",
      "A universal life policy with a fixed crediting rate"
    ],
    correct: 1,
    explanation: "Pro Achiever is a regular premium ILP — it combines life insurance protection with investment in sub-funds. Unlike endowments, returns are not guaranteed and depend on fund performance. It is AIA's best-selling investment plan as of August 2024.",
    category: 'product-facts'
  },
  {
    question: "What are the three investment period options available in Pro Achiever 3.0?",
    options: [
      "5, 10, and 15 years",
      "10, 20, and 30 years",
      "10, 15, and 20 years",
      "7, 14, and 21 years"
    ],
    correct: 2,
    explanation: "Pro Achiever 3.0 introduced three investment period choices: 10, 15, or 20 years. Previously in version 2.0, only a 10-year period was available. A longer period generally qualifies for a higher welcome bonus.",
    category: 'product-facts'
  },
  {
    question: "What is the welcome bonus range in Pro Achiever 3.0, and how is it credited?",
    options: [
      "A flat 3% for all clients regardless of premium",
      "5% to 75% total, based on annualised premium and IIP, paid upon receipt of each basic regular premium for the 1st, 2nd, AND 3rd policy years (split across years 1-3)",
      "10% to 50%, based solely on the client's age, paid in year 1",
      "There is no welcome bonus - only the special bonus applies"
    ],
    correct: 1,
    explanation: "The welcome bonus totals 5% to 75% of the annualised regular premium across years 1-3, paid upon receipt of each basic regular premium for the 1st, 2nd, AND 3rd policy years (Product Summary p.2 Section 3.3; Brochure p.1 footnote 1). For example, IIP 20 + >=$12,000 premium = 20% / 25% / 30% across years 1 / 2 / 3 = 75% total.",
    category: 'product-facts'
  },
  {
    question: "When does the 5% special bonus kick in, and what happens from year 21 onwards?",
    options: [
      "5% from year 5, increasing to 10% from year 15",
      "5% of annualised premium from receipt of the 10th annual premium, increasing to 8% from receipt of the 21st annual premium onwards",
      "8% from year 10 onwards, no change after that",
      "A one-time 5% bonus paid at the 10th anniversary only"
    ],
    correct: 1,
    explanation: "Per Product Summary p.2 Section 3.4, the Special Bonus is 5% of the annualised regular premium upon receipt of each regular premium from the 10th annual premium onwards, increasing to 8% from the 21st annual premium onwards. Calculated on annualised premium - NOT on account value. For example, on a $10,000/year premium, the client gets an extra $500/year from year 10 and $800/year from year 21.",
    category: 'product-facts'
  },
  {
    question: "How long do supplementary charges apply in Pro Achiever 3.0?",
    options: [
      "For the entire duration of the policy",
      "For the first 5 years only",
      "3.9% p.a. ceasing on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium",
      "There are no supplementary charges in Pro Achiever 3.0"
    ],
    correct: 2,
    explanation: "The 3.9% p.a. supplementary charge ceases only upon receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2; Brochure p.2). If premiums are missed or Premium Pass is used, the charge extends beyond 10 calendar years. Most competitor ILPs have perpetual supplementary charges.",
    category: 'product-facts'
  },
  {
    question: "What is the 'Premium Pass' feature in Pro Achiever 3.0?",
    options: [
      "A discount on premiums for loyal policyholders after 5 years",
      "The ability to pause premium payments for up to a cumulative total of 36 months across the policy, with the number of passes depending on IIP (IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes), each up to 12 cumulative policy months",
      "A feature that automatically reduces premium amounts if fund value drops",
      "An option to prepay multiple years of premiums in advance"
    ],
    correct: 1,
    explanation: "Premium Pass scales with IIP option: IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes (Product Summary p.4 Section 3.7; Brochure p.3). Each pass runs up to 12 cumulative policy months. Maximum pause is 36 cumulative months on IIP 20.",
    category: 'product-facts'
  },
  {
    question: "What is 'commingling' in Pro Achiever 3.0's fund selection?",
    options: [
      "Pooling investments with other policyholders to reduce risk",
      "Mixing different AIA Elite Fund risk profiles (e.g. Conservative, Balanced, Adventurous) with à la carte funds in one portfolio",
      "Mixing two different insurance policies under one premium",
      "A feature exclusive to joint policies held by couples"
    ],
    correct: 1,
    explanation: "Commingling means you can mix different fund types in one Pro Achiever policy — e.g. 50% AIA Elite Balanced, 20% à la carte fund, 30% Elite Conservative. This was not possible in Pro Achiever 2.0, where clients had to choose just one risk profile. AIA can offer this because of the large assets under management.",
    category: 'product-facts'
  },
  {
    question: "What makes the AIA Global Dynamic Income Fund (GDIF) unique to Pro Achiever 3.0?",
    options: [
      "It is a government bond fund available across all AIA products",
      "It guarantees a 3% annual return with no market risk",
      "It pays dividends every quarter and is only available for Pro Achiever 3.0",
      "It is an emerging market equity fund available since 2018"
    ],
    correct: 2,
    explanation: "The AIA Global Dynamic Income Fund pays dividends every quarter and is only available for Pro Achiever 3.0. It is designed for clients who want regular income from their investment alongside the growth potential of an ILP.",
    category: 'product-facts'
  },
  {
    question: "What does Pro Achiever 3.0's Term Rider cover?",
    options: [
      "A critical illness rider with premiums that increase with age",
      "Coverage for death, terminal illness, terminal cancer, and total and permanent disability, with premiums that stay the same throughout the coverage period",
      "A hospitalisation rider covering daily hospital cash",
      "A waiver of premium triggered by any illness"
    ],
    correct: 1,
    explanation: "The Term Rider covers four events - death, terminal illness, terminal cancer, and total and permanent disability (Brochure p.6). Terminal cancer is a distinct trigger, not subsumed under terminal illness. The premiums stay fixed for the duration of the cover.",
    category: 'product-facts'
  },
  {
    question: "According to training materials, what is the typical annualised premium range for most Pro Achiever clients?",
    options: [
      "$1,200 to $2,400 per year ($100–$200/month)",
      "$4,800 to $6,000 per year, with some exceeding $12,000",
      "$500 to $1,000 per year",
      "$10,000 to $20,000 per year minimum"
    ],
    correct: 1,
    explanation: "Most Pro Achiever clients pay between $4,800 and $6,000 per year (roughly $400–$500/month), with some exceeding $12,000/year. The average case size has grown from $3,800 to $5,000. About 80% of AIA consultants sell Pro Achiever, making it the most widely sold investment plan.",
    category: 'product-facts'
  },
  {
    question: "What is the capital guarantee feature in Pro Achiever 3.0 upon death?",
    options: [
      "There is no capital guarantee - the death benefit is purely market-linked",
      "Upon death (and if no Secondary Insured was appointed), the beneficiary receives the higher of (a) total regular premiums paid + top-ups + premium-reduction top-ups less withdrawals, or (b) the policy value, less applicable fees and charges",
      "The policy pays back only the welcome bonus amount upon death",
      "Capital is guaranteed only if the policy has been held for more than 10 years"
    ],
    correct: 1,
    explanation: "The death benefit is the higher of 100% of net premiums in (regular premiums + top-ups + premium-reduction top-ups, less withdrawals) or the policy value, less applicable fees and charges (Product Summary p.1-2 Section 3.1; Brochure p.9 footnote 8). It is NOT 101%. If a Secondary Insured was appointed, no death benefit is paid and the policy continues with them as the new Insured (Product Summary p.3 Section 3.6).",
    category: 'product-facts'
  },

  // ══════════════════════════════════════════
  // SALES TECHNIQUES (10 questions)
  // Sourced from: Commentary of My Own Closing, Simple Way to Intro APA, APA Close Demo,
  //               Summary of how to sell APA, Linearizing Policy Returns, Retirement Income Concepts
  // ══════════════════════════════════════════

  {
    question: "According to the 'Linearizing Policy Returns' technique, how should you make a large future payout feel relatable to a client?",
    options: [
      "Show them the total amount they will receive at maturity",
      "Compare the total return to a lump sum deposit at the bank",
      "Break the return down into a monthly income figure — e.g. '$315k over 45 years = $54/month passive income on $200/month invested'",
      "Show a table comparing ILP vs term plan charges"
    ],
    correct: 2,
    explanation: "Telling a client they'll earn '$315,000 in 45 years' doesn't feel impactful. The better approach is to linearize it: divide the profit over the years and months to show it as passive income. '$54/month for every $200/month you invest' is far more tangible. You can also compare $315k to the value of a car, BTO flat, or house to make it emotionally resonant.",
    category: 'sales-angles'
  },
  {
    question: "What is the recommended approach when discussing Pro Achiever's total fees and charges with a client to build trust?",
    options: [
      "Avoid mentioning fees until after the client signs",
      "Show the total cost figure (e.g. $6,194) and divide it over the full policy duration: $6,194 / 45 years / 12 months = ~$11/month - then compare to hiring a private investment consultant",
      "Tell the client fees are negligible and move on quickly",
      "Only mention the supplementary charge percentage, not the total cost"
    ],
    correct: 1,
    explanation: "Curriculum Day 3 Part 1: 'Total cost over the 45 years is $6,194. Divide this by 45 years - every month is actually just about $11. Very cheap.' The reframe 'hiring an investment consultant for $11/month' is the canonical move. (The $1/month figure circulating in older training material is off by an order of magnitude.)",
    category: 'sales-angles'
  },
  {
    question: "According to the 'Simple Way to Intro APA' training, what is the 4-layer diversification argument used to educate prospects?",
    options: [
      "Diversify by time, risk, geography, and currency",
      "Number of stocks → number of industries → multiple asset classes → geographic diversification",
      "Equities, bonds, REITs, and commodities only",
      "Singapore stocks, US stocks, Asian stocks, and emerging markets"
    ],
    correct: 1,
    explanation: "The 4-layer approach: Layer 1 — it's not just one stock, but many stocks. Layer 2 — not just many stocks, but across many industries (e.g. all bank stocks collapsed in the US banking crisis). Layer 3 — not just stocks, but multiple asset classes (stocks, bonds, gold, commodities). Layer 4 — not just domestic, but geographically diversified globally. This pre-empts DIY investing objections.",
    category: 'sales-angles'
  },
  {
    question: "What is the key sales positioning of APA vs ETFs, according to training?",
    options: [
      "APA has better returns than ETFs on average",
      "ETFs are just a tool; APA combines the tool with a professional service — like a chef vs. just buying ingredients",
      "ETFs charge higher fees than APA",
      "APA funds are government-guaranteed while ETFs are not"
    ],
    correct: 1,
    explanation: "From 'APA vs. ETFs': ETFs are investment tools without added value. APA combines the tool with a consultative service — selecting, monitoring, and adjusting investments for you. The analogy: an ETF is like buying raw ingredients; APA is like hiring a chef who prepares the meal, monitors quality, and adjusts based on your taste. You're selling the service, not just the product.",
    category: 'sales-angles'
  },
  {
    question: "When selling to a young adult, what is the core emotional argument against DIY stock investing (from 'APA vs DIY' training)?",
    options: [
      "DIY investing is illegal without a financial advisor",
      "DIY investors pay more tax than those with insurance-linked investments",
      "Most DIY investors fall into a cycle of buying high out of FOMO and selling low out of fear — leading to consistent underperformance and emotional stress",
      "DIY investing requires a minimum capital of $50,000"
    ],
    correct: 2,
    explanation: "From 'APA vs DIY': The emotional cycle traps most DIY investors — buy high (FOMO when market rises) → sell low (panic when market drops) → regret when market rebounds → buy high again. APA's dollar-cost averaging approach removes emotion, enforces discipline, and avoids this destructive cycle. The key message: 'APA invests consistently every month regardless of market conditions.'",
    category: 'sales-angles'
  },
  {
    question: "Which client profile is the 'Simple Way to Intro APA' book approach ideally suited for?",
    options: [
      "Elderly clients focused on healthcare funding",
      "Clients who are already convinced of advisor value and just need product details",
      "Prospects skeptical of financial advisors, DIY investors, and those concerned about fees",
      "Business owners looking for key-man insurance"
    ],
    correct: 2,
    explanation: "The book intro is ideal for: prospects skeptical of financial advisors, DIY investors who think they can do better, people who follow friends' advice, and those concerned about fees. It is NOT ideal for: urgent insurance needs, very elderly clients focused on healthcare, or clients already sold on advisor value. The book positions the advisor as an educator, not a salesperson.",
    category: 'sales-angles'
  },
  {
    question: "What is the recommended way to introduce Pro Achiever's welcome bonus during a client appointment?",
    options: [
      "Lead with the product brochure and list all technical features first",
      "Tell the client 'if you invest a bit more, you can get a higher welcome bonus' — use this to anchor a higher premium amount",
      "Only mention the welcome bonus at the end as a closing incentive",
      "Never mention bonuses as they can be misleading"
    ],
    correct: 1,
    explanation: "From 'Pro Achiever Overview': the welcome bonus is an incentive lever during the appointment. Advisors are coached to say: 'If you invest a bit more, you can have a higher welcome bonus.' This both anchors a higher premium and makes starting now feel immediately rewarding - since the client receives bonus credits across years 1, 2, and 3 (Product Summary p.2 Section 3.3) on top of premium units.",
    category: 'sales-angles'
  },
  {
    question: "According to training, why should advisors generally recommend the 10-year period over the 20-year period?",
    options: [
      "The 10-year period gives a higher welcome bonus",
      "The commission earned is the same for both periods, and the 10-year option avoids surrender charges if the client needs flexibility within a longer lock-in",
      "The 20-year period has much higher supplementary charges",
      "AIA only recommends 20 years for clients above 40"
    ],
    correct: 1,
    explanation: "Commissions are identical regardless of investment period. The 20-year lock-in exposes the client to surrender charges if they need to withdraw early. The 10-year option gives the client greater flexibility — after 10 years, they can withdraw, top up, or continue without being locked into a longer commitment. Recommending 10 years is the client-centric approach.",
    category: 'sales-angles'
  },
  {
    question: "What is the 'Retirement Income Concept' sales approach used for Pro Achiever?",
    options: [
      "Selling Pro Achiever as a replacement for CPF Life",
      "Using Pro Achiever's projected fund value to create a retirement income stream — showing how regular withdrawals from the matured fund can supplement retirement expenses for 20–30 years",
      "Positioning Pro Achiever as a short-term emergency fund",
      "Recommending Pro Achiever only for clients with existing retirement plans"
    ],
    correct: 1,
    explanation: "The Retirement Income Concept (Phase 1–3) shows clients how to use Pro Achiever's accumulated fund at maturity as a retirement income source — making systematic withdrawals to supplement living expenses for decades. This reframes APA from a savings plan into a long-term income vehicle, making it highly relevant for young adults planning for retirement.",
    category: 'sales-angles'
  },
  {
    question: "What is a key advantage of APA's fee structure compared to hiring your own private investment consultant?",
    options: [
      "APA charges zero fees while private consultants charge $10,000+",
      "APA's fees are spread over ~1 million policyholders — so even though the fund managers are well-paid, the cost per individual is very low",
      "APA has no fund management fees; only mortality charges apply",
      "Private investment consultants are always more expensive than APA by law"
    ],
    correct: 1,
    explanation: "From 'Commentary of My Own Closing': AIA has about 1 million policyholders, so even highly paid investment consultants managing the funds result in a very low cost per individual. Compare this to hiring a private wealth manager at $10,000+/year, or the brokerage costs and time spent on DIY investing. The total cost in APA is roughly $1/month when spread over the policy life.",
    category: 'sales-angles'
  },

  // ══════════════════════════════════════════
  // OBJECTION HANDLING (8 questions)
  // Sourced from: Attacking and Defending APA, Countering S&P500, APA Charges, Competitor Analysis
  // ══════════════════════════════════════════

  {
    question: "A client says: 'I'd rather just invest in the S&P 500 — it's consistently returned 10% per year.' What is the best response?",
    options: [
      "Agree that S&P 500 is better and suggest combining both",
      "Tell them the S&P 500 is too risky and they will lose everything",
      "Acknowledge the S&P 500's strong historical returns, then highlight APA's advantages: diversification beyond US equities, the welcome bonus that S&P500 doesn't have, built-in life protection, and the discipline of regular premiums vs. timing the market yourself",
      "Tell them S&P 500 returns are not guaranteed either, so APA is safer"
    ],
    correct: 2,
    explanation: "From 'Countering S&P500': Don't dismiss the S&P 500 — acknowledge it. Then position APA's advantages: (1) Geographic diversification beyond US, (2) The welcome bonus (5–75%) which the S&P 500 has no equivalent of, (3) Built-in life protection, (4) Dollar-cost averaging discipline so they don't have to time the market, (5) The S&P 500 is US-only — APA diversifies globally.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'The fees in ILPs are too high.' What is the correct framework to handle this?",
    options: [
      "Apologise and offer to reduce the premium",
      "Compare the total cost to DIY alternatives: personal investment manager fees, brokerage trading costs, and the value of time saved - APA's distribution cost is about $11/month when ~$6,194 is spread over the 45-year policy life, plus the 3.9% supplementary charge ceases on receipt of the 11th annual regular premium",
      "Tell them fees don't matter because returns are good",
      "Redirect to the welcome bonus and change the subject"
    ],
    correct: 1,
    explanation: "Two-part counter: (1) Total distribution cost ~$6,194 / 45 years / 12 months = ~$11/month (curriculum Day 3 Part 1). (2) The 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2). Compare to a private investment manager ($10,000+/year) or DIY brokerage costs.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'My friend lost money in an ILP before.' How do you handle this?",
    options: [
      "Tell them their friend made a mistake and should have stayed invested",
      "Acknowledge the concern, explain that ILP returns depend on fund selection and time horizon, then highlight that APA's professional management and diversified funds reduce single-stock/sector risk compared to DIY investing",
      "Ignore the objection and show the benefit illustration",
      "Suggest they buy a fixed deposit instead if they are risk-averse"
    ],
    correct: 1,
    explanation: "From 'Attacking and Defending APA': Validate the concern first. Then educate: the friend likely suffered from poor timing (bought high, sold low during panic) or single-stock concentration. APA counters this with: (1) Professional fund management, (2) Dollar-cost averaging — invest consistently regardless of market, (3) Diversification across 1000+ stocks, industries, asset classes, and geographies.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I can just buy ETFs myself — lower fees and more control.' What is the APA counter-argument?",
    options: [
      "ETFs are illegal for retail investors in Singapore",
      "ETFs are just a tool with no advisory service; APA provides the tool plus professional management, monitoring, rebalancing, and a built-in welcome bonus that no ETF can match",
      "APA has better returns than all ETFs historically",
      "ETFs have higher management fees than APA"
    ],
    correct: 1,
    explanation: "From 'APA vs. ETFs': ETFs are tools, not a service. APA gives you: (1) The tool (diversified funds), (2) Professional management and monitoring, (3) Automatic rebalancing, (4) A welcome bonus (no ETF gives this), (5) Life protection built-in. The analogy: buying ETF ingredients vs. hiring a chef. You could cook yourself, but do you have the time, skill, and discipline to do it for 40 years?",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'What if I need the money before 10 years?' What is the correct response?",
    options: [
      "Tell them they will lose all their money if they withdraw early",
      "Explain that they can make partial withdrawals after the lock-in, and that within the first 10 years, Premium Holiday is available if they face financial difficulty — though charges apply if used in the early years",
      "Advise them to put only money they don't need into APA",
      "Tell them the policy can be surrendered at any time for full value"
    ],
    correct: 1,
    explanation: "From 'Pro Achiever Overview' and training: Partial withdrawals are available after the 10-year lock-in. Within the first 10 years, Premium Holiday allows pausing payments if facing financial difficulty (though charges may apply). After 5 years of payments, Premium Pass gives a charge-free pause of up to 12 months. The key message: worst case is a pause — not a total loss.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I already have savings in my CPF — why do I need this?' What is your response?",
    options: [
      "Tell them CPF is enough and they don't need Pro Achiever",
      "Explain that CPF is capped and locked away until retirement — APA supplements CPF by building an accessible investment fund for mid-life goals, with a bonus on top that CPF doesn't offer",
      "Tell them CPF interest rates are too low to rely on",
      "Suggest they transfer all CPF into an APA policy"
    ],
    correct: 1,
    explanation: "CPF is restricted, capped, and inaccessible until retirement age. APA complements CPF by: (1) Providing an accessible investment fund that grows over time, (2) Giving a welcome bonus (CPF gives no bonus), (3) Allowing goal-based withdrawals before retirement (education, property, business), (4) Providing life protection alongside accumulation. APA is not a CPF replacement — it fills the gaps CPF can't cover.",
    category: 'objection-handling'
  },
  {
    question: "What is a key advantage of Pro Achiever's charges compared to most competitor ILPs?",
    options: [
      "Pro Achiever has no charges at all - only competitor ILPs charge",
      "Both APA and most competitors stop charges after 10 years",
      "Most competitor ILPs have perpetual supplementary charges, whereas APA's 3.9% p.a. supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium",
      "APA charges more upfront but refunds fees at maturity"
    ],
    correct: 2,
    explanation: "APA's 3.9% supplementary charge ceases on receipt of the 11th annual / 21st semi-annual / 41st quarterly / 121st monthly regular premium (Product Summary p.5 Section 5.2; Brochure p.2). Most competitor ILPs deduct supplementary charges perpetually - over a 20-40 year policy this difference compounds significantly in favour of APA clients.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I'll think about it and get back to you.' What is the ideal advisor response?",
    options: [
      "Accept it and wait for them to call back",
      "Pressure them to sign before the offer expires today",
      "Acknowledge their position, ask which specific aspect they want to think through to uncover the hidden objection, then set a specific follow-up date and time before the meeting ends",
      "Send them the benefit illustration by email and follow up in two weeks"
    ],
    correct: 2,
    explanation: "From closing training: 'I'll think about it' is a hidden objection — something specific is unresolved. Don't accept it at face value. Ask: 'Of course — just so I can prepare better for our next chat, which part would you like to think through more? The commitment, the returns, or something else?' This surfaces the real concern. Then always lock in a specific next meeting time before ending.",
    category: 'objection-handling'
  },

  // ══════════════════════════════════════════
  // ROLEPLAY SCENARIOS (7 questions)
  // Sourced from: APA Close Demo for Young Adults, Commentary of My Own Closing, Summary of how to sell APA
  // ══════════════════════════════════════════

  {
    question: "You're in a roleplay as a prospect who says: 'I'm only 23 — I don't think I need to invest yet. I'll start when I'm 30.' What is the most effective advisor response?",
    options: [
      "Agree and tell them to come back in 7 years",
      "Show them the compound interest effect: starting at 23 vs 30 results in vastly different fund values — plus the welcome bonus is locked in at the start, so waiting means losing those extra years of compounding on a bonus they can never reclaim",
      "Tell them they're being irresponsible with their money",
      "Offer to lower the premium to make it feel less like a commitment"
    ],
    correct: 1,
    explanation: "From 'APA Close Demo for Young Adults': The earlier you start, the longer compounding works. A 7-year head start at 23 vs 30 = significant fund value difference at retirement. More critically: the welcome bonus is paid across years 1-3 (Product Summary p.2 Section 3.3) and immediately starts compounding. Waiting 7 years means losing 7 years of compounding on bonus units the client cannot reclaim later.",
    category: 'roleplay'
  },
  {
    question: "You're roleplaying a closing call. The client says: 'Can I start with $200/month?' How do you respond to anchor a higher premium?",
    options: [
      "Accept $200/month — any amount is fine",
      "Tell them the minimum is $400/month so they have to pay more",
      "Show them that a slightly higher premium (e.g. $400/month) unlocks a significantly higher welcome bonus tier — use the illustration to show the actual dollar difference in year 1",
      "Tell them $200/month is too low and they need to save more first"
    ],
    correct: 2,
    explanation: "From 'Pro Achiever Overview' and closing training: Use the welcome bonus tiers as an anchoring tool. Show the client the benefit illustration at $200/month vs $400/month — the difference in welcome bonus can be thousands of dollars. The question becomes: 'For an extra $200/month, you get $X more in year 1. Does that make sense?' This makes increasing the premium feel like a rational decision, not a sales push.",
    category: 'roleplay'
  },
  {
    question: "In a roleplay, a prospect says: 'I invest in stocks myself — I don't need someone to manage my money.' What is the best advisor opening move?",
    options: [
      "Immediately list all the charges in competitor brokerage accounts",
      "Use the book 'The Psychology of Money' or similar reference to educate them on diversification — position yourself as sharing wisdom, not selling",
      "Tell them DIY investing is for gamblers",
      "Ask them which stocks they own and criticise their portfolio"
    ],
    correct: 1,
    explanation: "From 'Simple Way to Intro APA': For DIY investors, lead with education not product. Use a credible third-party reference (e.g. a finance book) to discuss diversification across stocks, industries, asset classes, and geographies. This positions you as an educator sharing wisdom rather than a salesperson. Pre-empt the fee objection and the 'I can do it myself' objection before they raise them.",
    category: 'roleplay'
  },
  {
    question: "In a roleplay, you've shown the benefit illustration and the client asks: 'Are these returns guaranteed?' What do you say?",
    options: [
      "Yes, the returns shown are guaranteed by AIA",
      "No — but honestly explain that ILP returns are not guaranteed as they depend on fund performance; then pivot to the advantages: professional management, diversification, and the welcome/special bonuses which are contractually creditable",
      "Tell them to ignore the illustration and focus on the minimum guaranteed amount",
      "Change the subject to the life protection component instead"
    ],
    correct: 1,
    explanation: "Honesty builds trust. The projected returns in the benefit illustration are NOT guaranteed — they are based on assumed fund performance. Acknowledge this directly, then pivot: (1) The welcome bonus is real and credited in year 1, (2) The special bonus from year 10 is real, (3) Professional fund management and diversification maximise the probability of strong long-term returns. Risk is managed, not eliminated.",
    category: 'roleplay'
  },
  {
    question: "In a roleplay closing demo, the prospect says: 'Let me see the numbers first.' What do you do?",
    options: [
      "Email them the benefit illustration and follow up next week",
      "Run the benefit illustration with them live in the meeting — show the welcome bonus in year 1, the special bonus from year 10, and linearize the projected returns into a monthly income figure they can relate to",
      "Tell them you don't have the numbers handy and reschedule",
      "Show them a competitor comparison chart instead"
    ],
    correct: 1,
    explanation: "From 'Explanation of Sales Illustrator for APA' and 'Commentary of My Own Closing': Always run the illustration live with the client, not in advance. Walk them through: (1) Welcome bonus credited across years 1-3 (Product Summary p.2 Section 3.3), (2) 100% invested from the start, (3) Special bonus from the 10th annual premium (Section 3.4), (4) Projected fund value at maturity. Then linearize - divide the projected profit into monthly income equivalent. Never leave the illustration for them to interpret alone.",
    category: 'roleplay'
  },
  {
    question: "In a roleplay, a self-employed client says: 'I like the plan but I'm worried about cash flow — business can be unpredictable.' How do you reassure them?",
    options: [
      "Tell them to wait until their business is stable",
      "Highlight Premium Pass (charge-free 12-month pause after 5 years of premiums paid) and Premium Holiday — explain they can pause without surrendering the policy, and that the worst case is a pause, not a loss",
      "Offer to lower the premium to $100/month",
      "Tell them the policy can be surrendered at any time with no penalties"
    ],
    correct: 1,
    explanation: "From training: for self-employed clients, flexibility features are the closing tool. Premium Pass scales with IIP - IIP 10 = 1 pass, IIP 15 = 2 passes, IIP 20 = 3 passes, each up to 12 cumulative policy months (Product Summary p.4 Section 3.7; Brochure p.3) - so up to 36 cumulative months on IIP 20. Premium Holiday is also available if needed earlier. The key message: 'If business slows, you press pause - not stop. You don't lose what you've built over those years.'",
    category: 'roleplay'
  },
  {
    question: "In a roleplay with a young couple, they say: 'We're planning to have kids soon — should we buy Pro Achiever for ourselves or for the child?' What do you advise?",
    options: [
      "Always buy for the child — they will benefit more",
      "Always buy for the parents first — they need protection and accumulation before the child's plan",
      "Advise buying for the parents first since they need coverage now; later, use the Legacy Planning feature to transfer the plan to a child, or start a new policy for the child when they arrive",
      "Tell them to wait until the child is born to decide"
    ],
    correct: 2,
    explanation: "From training: parents' financial protection comes first — they need life coverage and wealth accumulation in case something happens to them. Once the parents' plan is in place, Pro Achiever's Legacy Planning feature allows the policy to be transferred to a spouse or child for continued coverage. A separate child policy can also be started when the child is born, using the parent's APA as education funding.",
    category: 'roleplay'
  },

];
