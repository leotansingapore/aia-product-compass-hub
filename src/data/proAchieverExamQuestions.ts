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
  // ══════════════════════════════════════════

  {
    question: "What type of insurance product is Pro Achiever?",
    options: [
      "Term life insurance with a savings component",
      "Regular premium Investment-Linked Policy (ILP)",
      "Whole life endowment with guaranteed maturity",
      "Universal life policy with fixed crediting rate"
    ],
    correct: 1,
    explanation: "Pro Achiever is a regular premium ILP — it combines life insurance protection with investment in sub-funds. Unlike endowments, returns are not guaranteed and depend on fund performance.",
    category: 'product-facts'
  },
  {
    question: "What is the minimum regular premium amount for Pro Achiever?",
    options: [
      "$50/month",
      "$100/month",
      "$200/month",
      "$500/month"
    ],
    correct: 1,
    explanation: "The minimum regular premium for Pro Achiever starts at $100/month, making it accessible to a wide range of clients including young working adults starting out on their wealth-building journey.",
    category: 'product-facts'
  },
  {
    question: "Approximately how many investment sub-funds does Pro Achiever offer access to?",
    options: [
      "5 funds",
      "10 funds",
      "Over 20 funds",
      "Over 100 funds"
    ],
    correct: 2,
    explanation: "Pro Achiever provides access to over 20 curated investment sub-funds, spanning different asset classes and geographies. This gives clients genuine diversification options to match varying risk appetites.",
    category: 'product-facts'
  },
  {
    question: "How are the bonus allocation units in Pro Achiever structured?",
    options: [
      "A flat 3% bonus on all premiums regardless of amount",
      "Bonus units are tiered — higher premium bands unlock larger bonus allocation percentages",
      "Bonus units are only awarded after the 5th policy anniversary",
      "There are no bonus units; only fund growth applies"
    ],
    correct: 1,
    explanation: "Pro Achiever uses a tiered bonus allocation system. Clients paying higher premiums benefit from larger bonus allocation rates, which effectively offsets the impact of early-year charges on the fund value.",
    category: 'product-facts'
  },
  {
    question: "What does 'front-loaded charges' mean in the context of Pro Achiever?",
    options: [
      "All charges are collected in a lump sum at inception",
      "Insurance and distribution charges are proportionally higher in the early policy years and reduce over time",
      "Charges are only deducted from bonus units, not the base premium",
      "All charges are taken from the investment returns, never the principal"
    ],
    correct: 1,
    explanation: "Front-loaded means the charges (distribution/initial charges) are higher in the early years — typically the first 5-7 years. This is why ILPs like Pro Achiever are best suited for long-term commitments of 10+ years when the investment can compound past the initial charge impact.",
    category: 'product-facts'
  },
  {
    question: "What is the policy loan feature in Pro Achiever and when can it be used?",
    options: [
      "Clients can borrow up to 100% of fund value anytime from day one",
      "Clients can take a loan against a portion of their accumulated fund value once sufficient value has built up, without surrendering the policy",
      "The loan feature is only available in the final 5 years of the policy",
      "Policy loans are only available to clients above age 55"
    ],
    correct: 1,
    explanation: "The policy loan feature allows clients to borrow against their accumulated fund value without surrendering the policy. This provides liquidity access while keeping the investment intact and growing. It is particularly useful for business owners or clients facing unexpected expenses.",
    category: 'product-facts'
  },
  {
    question: "Can clients make ad-hoc top-up contributions to their Pro Achiever policy?",
    options: [
      "No — only fixed regular premiums are allowed",
      "Yes — clients can make single-premium top-ups on top of regular premiums to accelerate wealth accumulation",
      "Yes — but only up to a maximum of $1,000 per top-up",
      "Yes — but top-ups are placed into a separate policy and not the same fund"
    ],
    correct: 1,
    explanation: "Pro Achiever supports ad-hoc single-premium top-ups, allowing clients to invest additional lump sums whenever they have spare cash — such as a bonus or inheritance. These top-ups are allocated into their chosen funds and compound alongside regular premiums.",
    category: 'product-facts'
  },
  {
    question: "What is the fund switching feature and is there a charge for it?",
    options: [
      "Clients can switch once per year at a cost of 1% of switched amount",
      "Clients cannot switch funds — they must surrender and re-purchase",
      "Clients can switch between available sub-funds for free, allowing them to adjust investment strategy without exiting the policy",
      "Fund switching is available but triggers a 5-year reset on bonus eligibility"
    ],
    correct: 2,
    explanation: "Free fund switching is a key Pro Achiever feature. Clients can reallocate their fund holdings without charge, enabling them to respond to market changes (e.g., moving to bonds during equity downturns) or life stage changes (e.g., becoming more conservative near retirement).",
    category: 'product-facts'
  },
  {
    question: "What is the primary risk that a Pro Achiever policyholder bears?",
    options: [
      "Counterparty risk — if AIA becomes insolvent",
      "Currency risk — all funds are denominated in USD only",
      "Market risk — the policy value is directly tied to the performance of chosen investment sub-funds",
      "Liquidity risk — the policy cannot be surrendered for 10 years"
    ],
    correct: 2,
    explanation: "As an ILP, Pro Achiever's fund value rises and falls with the underlying sub-fund performance. This is market risk — there are no guaranteed returns. Advisors must clearly explain this and ensure clients understand they may receive less than they put in if markets perform poorly.",
    category: 'product-facts'
  },
  {
    question: "What categories of investment sub-funds are typically available in Pro Achiever?",
    options: [
      "Only Singapore equities and Singapore bonds",
      "A mix including equity funds, balanced funds, bond funds, and money market funds across various geographies and risk profiles",
      "Only ETFs tracking major indices like the S&P 500",
      "Only AIA-managed proprietary funds with no external fund managers"
    ],
    correct: 1,
    explanation: "Pro Achiever's sub-fund range covers multiple asset classes (equity, balanced, bonds, money market) and geographies (Asia, global, sector-specific). This breadth lets advisors build a diversified, goal-appropriate portfolio for each client.",
    category: 'product-facts'
  },
  {
    question: "How does dollar cost averaging (DCA) work within Pro Achiever's regular premium structure?",
    options: [
      "The policy automatically buys more units when fund prices are high",
      "Regular premium contributions buy more fund units when prices are low and fewer when prices are high, smoothing average cost over time",
      "DCA only applies to top-up premiums, not regular premiums",
      "DCA is a manual feature clients must activate each month"
    ],
    correct: 1,
    explanation: "Because Pro Achiever collects regular premiums monthly, the premium automatically purchases more units when fund prices are low and fewer when prices are high. This natural DCA effect smooths out market volatility and reduces the risk of investing a large sum at a market peak.",
    category: 'product-facts'
  },
  {
    question: "At what life stage is Pro Achiever most suitable for?",
    options: [
      "Only retirees with a lump sum to invest",
      "Working adults (typically 25–50) in the wealth accumulation stage with a long investment horizon of 10–25 years",
      "Children aged below 18 for education savings only",
      "Clients who need coverage for only 1–3 years"
    ],
    correct: 1,
    explanation: "Pro Achiever is designed for the wealth accumulation life stage — typically working adults aged 25–50. The front-loaded charge structure means clients need a long-term horizon (10+ years) for the investment to compound sufficiently past the early charges.",
    category: 'product-facts'
  },
  {
    question: "What happens to a Pro Achiever policy if the client stops paying premiums?",
    options: [
      "The policy immediately lapses with no fund value returned",
      "If there is sufficient fund value, the policy can remain in force with ongoing charges deducted from the fund (premium holiday); otherwise it lapses",
      "The policy automatically converts to a paid-up whole life plan",
      "Premiums are automatically borrowed from the policy loan facility until the fund is depleted"
    ],
    correct: 1,
    explanation: "If a client cannot pay premiums, a premium holiday may be possible if sufficient fund value exists — ongoing charges (insurance, policy fees) continue to be deducted from the fund. If the fund is depleted, the policy lapses. Advisors should flag this risk for clients with irregular income.",
    category: 'product-facts'
  },
  {
    question: "What is a 'sub-fund expense ratio' and how does it affect Pro Achiever?",
    options: [
      "It is a one-time setup fee deducted only at inception",
      "It is an annual management fee charged within the sub-fund itself, reducing the net returns investors receive from their units",
      "It is the percentage of premiums that go toward insurance coverage",
      "It is a government levy on all ILP investments"
    ],
    correct: 1,
    explanation: "Sub-fund expense ratios (also called fund management charges or TERs) are ongoing fees charged within each sub-fund — typically 0.75%–2% p.a. These are embedded in the unit price and reduce net returns. Advisors should reference the sub-fund factsheets when comparing fund options for clients.",
    category: 'product-facts'
  },
  {
    question: "How does Pro Achiever handle the death benefit?",
    options: [
      "Only the accumulated fund value is paid out on death, with no additional sum assured",
      "The death benefit is the higher of (a) the sum assured or (b) the total fund value at the time of death",
      "A fixed $100,000 lump sum is paid regardless of fund value or premium amount",
      "Death benefits are only paid if the policy has been in force for at least 10 years"
    ],
    correct: 1,
    explanation: "Pro Achiever's death benefit is typically the higher of the sum assured or the fund value. This ensures the beneficiary receives at least the coverage amount even if the fund has not yet grown significantly — and more if the fund has outperformed expectations.",
    category: 'product-facts'
  },

  // ══════════════════════════════════════════
  // SALES ANGLES (10 questions)
  // ══════════════════════════════════════════

  {
    question: "A 28-year-old engineer earns $5,000/month and wants to 'grow money seriously over the next 20 years'. Which Pro Achiever benefit do you lead with?",
    options: [
      "The guaranteed maturity value and fixed returns",
      "The free fund switching and access to 20+ diversified sub-funds to build a customised long-term growth portfolio",
      "The short-term liquidity through premium holidays",
      "The fixed-income bond fund option"
    ],
    correct: 1,
    explanation: "For a young professional with a 20-year horizon, the core proposition is customised long-term wealth accumulation through 20+ curated funds with free switching. Lead with growth potential and flexibility — these are what resonate with a growth-focused, analytical client.",
    category: 'sales-angles'
  },
  {
    question: "A client asks how Pro Achiever compares to simply putting $500/month into a robo-advisor. What is your most compelling response?",
    options: [
      "Pro Achiever always beats robo-advisors on returns",
      "Robo-advisors charge higher fees than ILPs",
      "Pro Achiever bundles life protection into the investment — the client gets comparable fund diversification plus a guaranteed death benefit, all in one plan",
      "Pro Achiever's funds are government-backed unlike robo-advisors"
    ],
    correct: 2,
    explanation: "The key differentiator vs robo-advisors is the integrated life protection. A robo-advisor is purely investment; Pro Achiever combines disciplined wealth accumulation with a death benefit. Ask the client: 'Does your robo-advisor pay out a sum assured to your family if something happens to you?' That's the gap Pro Achiever fills.",
    category: 'sales-angles'
  },
  {
    question: "A client is 45 years old and concerned that it might be 'too late' to start an ILP. How do you reframe this?",
    options: [
      "Agree with them and suggest a term plan instead",
      "Tell them Pro Achiever works the same regardless of age",
      "Reframe around their 15–20 year horizon to retirement: starting at 45 still gives a meaningful accumulation window, and the bonus allocation helps offset early charges",
      "Tell them to invest a very small amount to test it first"
    ],
    correct: 2,
    explanation: "A 45-year-old retiring at 65 still has a 20-year investment horizon — arguably the most productive accumulation years. Reframe: 'You have two decades for this to compound. Many of our most successful policyholders started in their mid-40s.' Use a projection illustration to make the numbers real.",
    category: 'sales-angles'
  },
  {
    question: "When using goal-based selling for Pro Achiever, which technique creates the most emotional engagement?",
    options: [
      "Show the client a table comparing ILP vs term plan charges",
      "Use a goal-based projection illustration tied to a specific personal milestone — e.g., 'Based on your $500/month, here's what this could look like when your daughter is ready for university'",
      "Explain the mechanics of dollar cost averaging in detail",
      "List all 20+ sub-funds and their 3-year performance figures"
    ],
    correct: 1,
    explanation: "Goal-based selling creates urgency and personal relevance. Tying the projection to a specific life event — child's education, your own retirement, a business goal — transforms Pro Achiever from an abstract financial product into a concrete plan toward something the client deeply cares about.",
    category: 'sales-angles'
  },
  {
    question: "A high-income client ($15,000/month) is already maximally funded in CPF. What is the best positioning for Pro Achiever?",
    options: [
      "Tell them Pro Achiever is for lower-income clients and suggest another product",
      "Position Pro Achiever as a private wealth accumulation vehicle: a flexible, professionally managed portfolio that sits outside CPF, with liquidity through policy loans when needed",
      "Focus only on the insurance coverage aspect",
      "Compare Pro Achiever to CPF OA interest rates"
    ],
    correct: 1,
    explanation: "For CPF-maxed high earners, the key message is tax-efficient, private-sector wealth accumulation. Pro Achiever offers professional fund management, flexible premium control, and a policy loan facility — filling the gap that CPF cannot: private liquidity and higher potential growth without CPF withdrawal restrictions.",
    category: 'sales-angles'
  },
  {
    question: "A client who just received a $50,000 bonus asks if Pro Achiever is suitable for a lump-sum investment. What do you advise?",
    options: [
      "Pro Achiever cannot accept lump sums at all",
      "Use the top-up feature: deploy $50,000 as a single-premium top-up into their existing or new Pro Achiever policy, supplemented by monthly regular premiums",
      "Tell them to split it across multiple ILPs from different insurers",
      "Advise them to hold cash for 12 months before investing"
    ],
    correct: 1,
    explanation: "The single-premium top-up feature was built exactly for this. The $50,000 is deployed into the client's chosen sub-funds immediately, benefiting from fund growth from day one. Pairing with ongoing regular premiums then provides DCA benefits on the continuing contributions.",
    category: 'sales-angles'
  },
  {
    question: "A self-employed client with fluctuating income is interested in Pro Achiever but worried about commitment. What features do you highlight?",
    options: [
      "The fixed premium schedule is actually beneficial for self-employed people",
      "The flexible premium structure: minimum monthly premiums can be set at an affordable level, with top-ups during good months and a potential premium holiday feature when cash is tight",
      "Advise them to wait until their income stabilises before starting",
      "Suggest they open a savings account instead"
    ],
    correct: 1,
    explanation: "Flexibility is the headline for self-employed clients. Set the minimum regular premium at a manageable base level; when business is strong, add top-ups to accelerate growth. If income drops, a premium holiday (subject to sufficient fund value) provides breathing room without surrendering the policy.",
    category: 'sales-angles'
  },
  {
    question: "A married couple with two young children wants to plan for both retirement AND education funding. How do you structure the Pro Achiever conversation?",
    options: [
      "Tell them to take out two separate Pro Achiever policies — one per goal",
      "Show a single integrated projection illustration: by year 15, the fund could fund university; the residual continues growing for retirement by year 25 — one plan, two goals, single-premium stream",
      "Suggest endowment for education and Pro Achiever for retirement separately",
      "Tell them Pro Achiever is only for retirement, not education"
    ],
    correct: 1,
    explanation: "Dual-purpose goal illustrations are powerful for young families. Show how one Pro Achiever policy can potentially serve both goals: a partial withdrawal or policy loan at year 15–16 funds education, while the remainder continues compounding for retirement. One plan, two milestones — this simplifies their financial picture and increases stickiness.",
    category: 'sales-angles'
  },
  {
    question: "During a product presentation, a client says they prefer 'safe' investments. How do you position Pro Achiever without misrepresenting it?",
    options: [
      "Tell them Pro Achiever is safe because AIA is a reputable company",
      "Acknowledge their preference, then guide them toward the lower-risk sub-funds (bond/balanced/money market) within Pro Achiever while being clear about the non-guaranteed nature of returns",
      "Agree and recommend an endowment plan instead",
      "Avoid mentioning market risk to prevent alarming them"
    ],
    correct: 1,
    explanation: "Never obscure market risk — this is a compliance and ethical issue. Instead, acknowledge their preference and show how Pro Achiever's fund menu accommodates conservative investors through bond/balanced/money market sub-funds. Use historical data to illustrate lower volatility. Then offer free switching as a safety valve if they want to adjust over time.",
    category: 'sales-angles'
  },
  {
    question: "A prospect asks for a '1-page summary of why I should choose Pro Achiever over just keeping money in a fixed deposit.' What are the three key points?",
    options: [
      "Higher safety, lower fees, fixed returns",
      "Guaranteed 6% annual return, zero charges, free withdrawal anytime",
      "Higher long-term growth potential through diversified funds; built-in life protection; flexibility (fund switching, top-ups, policy loans) — all in one structured plan",
      "Government guarantee on returns; lower expense ratio than any other product; fixed deposit interest is taxable"
    ],
    correct: 2,
    explanation: "The three pillars vs FD: (1) Higher growth potential — diversified equity/fund exposure vs FD's ~2–3%; (2) Life protection built in — FD pays nothing on death; (3) Flexibility — fund switching, top-ups, policy loans. Acknowledge trade-offs honestly: ILP carries market risk and is not suitable for money needed within 1–3 years.",
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
      "Acknowledge that charges exist, explain front-loaded structure reduces over time, show how the tiered bonus allocation offsets early charges, and use an illustration to show the net fund value trajectory",
      "Tell them the internet is wrong and only trust AIA's materials"
    ],
    correct: 2,
    explanation: "Transparency builds trust. Acknowledge that yes, ILPs have charges — this is a fact. Then contextualise: (1) Charges are highest early and reduce over time; (2) The bonus allocation helps offset this in the early years; (3) Over a 15–20 year horizon, the net fund value can significantly outperform what a simple savings account would produce. Use the actual illustration to show this clearly.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I don't like the idea that my money can go down in value.' What is the most effective response?",
    options: [
      "Promise that markets always recover and they should not worry",
      "Acknowledge the concern, explain DCA through regular premiums reduces volatility impact, show they can switch to conservative funds during downturns, and use historical data to illustrate long-term resilience",
      "Tell them to only use money market funds then",
      "Agree with them and recommend a guaranteed endowment plan"
    ],
    correct: 1,
    explanation: "Address the fear with three concrete mitigants: (1) DCA through regular premiums reduces the impact of short-term market falls; (2) Free fund switching lets them move defensively during downturns without surrendering; (3) Long-term data shows diversified equity portfolios historically recover and grow. Never promise recovery — this is a compliance red flag.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'My friend surrendered his ILP after 3 years and lost a lot of money. Why should I trust this?' How do you respond?",
    options: [
      "Tell them their friend made a mistake and you would not do the same",
      "Acknowledge that early surrender is one of the biggest risks in ILPs; this is exactly why Pro Achiever is designed for 10+ year horizons, and you will only recommend it if it fits their long-term goals",
      "Tell them Pro Achiever is different and this would never happen",
      "Avoid the topic and change the subject to fund performance"
    ],
    correct: 1,
    explanation: "Your friend's experience is completely valid — early surrender is a known risk in ILPs due to front-loaded charges. The honest answer is: 'This is why I would never recommend Pro Achiever unless it is truly a long-term plan for you. If there is any chance you need this money in under 5 years, we should look at a different vehicle.' This builds credibility and prevents future regret.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I can get better returns just buying S&P 500 ETFs myself. Why pay ILP charges?' How do you counter?",
    options: [
      "Tell them Pro Achiever's funds consistently outperform the S&P 500",
      "Agree and suggest they invest directly in ETFs instead",
      "Acknowledge their point on charges, then highlight the three gaps ETFs don't fill: life protection, disciplined regular savings structure, and policy loan liquidity — then ask if those have value to them",
      "Tell them ILP charges are actually lower than ETF brokerage fees"
    ],
    correct: 2,
    explanation: "Don't fight on returns — a financially savvy client is right that ETF charges are lower. Instead, identify the gaps: 'A pure ETF investment doesn't include life coverage for your family. It also doesn't give you the structure of committed regular savings, or a policy loan for emergencies. Are those components valuable to you?' If the answer is yes, Pro Achiever justifies its additional cost.",
    category: 'objection-handling'
  },
  {
    question: "A prospect asks: 'What if AIA goes bankrupt? What happens to my money?' How do you address this?",
    options: [
      "Tell them AIA has never lost money so this will never happen",
      "Explain that ILP sub-funds are held separately from AIA's own assets in a segregated fund account, providing protection even in the unlikely event of insurer insolvency; also mention regulatory oversight by MAS and the Policy Owners' Protection Scheme",
      "Tell them to just trust that AIA is a big company",
      "Acknowledge the risk and say there are no protections"
    ],
    correct: 1,
    explanation: "This is a legitimate concern. Key reassurances: (1) ILP sub-funds are legally segregated from AIA's own balance sheet — they cannot be used to pay AIA's liabilities; (2) MAS regulates AIA strictly, requiring capital reserves; (3) The Policy Owners' Protection (PPF) Scheme provides additional protection for Singaporean policyholders. These structural protections significantly reduce (though don't eliminate) the risk.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I already have savings and CPF. I don't need another product.' How do you uncover a genuine need?",
    options: [
      "Tell them they definitely still need Pro Achiever regardless",
      "Ask discovery questions: 'Do your savings and CPF cover your family if something happened to you tomorrow? Do you have a vehicle specifically for long-term growth beyond CPF limits? Is your emergency liquidity separate from your long-term savings?' — then let the gaps speak for themselves",
      "Agree and end the meeting",
      "Tell them CPF returns are too low to rely on"
    ],
    correct: 1,
    explanation: "Never push the product — ask questions that reveal gaps. CPF has withdrawal restrictions and limited flexibility. Savings accounts grow slowly. If the client confirms they have adequate life cover, long-term growth vehicle, and emergency liquidity — great, Pro Achiever may not be right for them now. But usually, at least one gap emerges during discovery.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I'm not sure I can commit to $300/month for 20 years. What if my circumstances change?' What is the best reassurance?",
    options: [
      "Tell them they must commit to $300/month or not take the policy",
      "Start them at the minimum premium level ($100/month) and explain that Pro Achiever has flexibility: premiums can be adjusted, top-ups added when income is strong, and a premium holiday is possible if the fund value is sufficient",
      "Offer to write the policy as a 5-year term instead",
      "Promise that they can surrender at any time with no cost"
    ],
    correct: 1,
    explanation: "Address the commitment fear directly with Pro Achiever's flexibility toolkit: start at a minimum premium that feels comfortable, increase when life gets better, use top-ups for lump-sum contributions, and use premium holiday if things get tight. The worst case scenario is a reduced premium, not a policy lapse — and they should know that from day one.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I'll think about it and get back to you.' What is the ideal response?",
    options: [
      "Accept it and wait for them to call",
      "Pressure them to sign today before the offer expires",
      "Acknowledge their position, ask what specific aspect they want to think through (to uncover a hidden objection), and set a specific follow-up date and time before ending the meeting",
      "Send them daily WhatsApp messages until they respond"
    ],
    correct: 2,
    explanation: "'Think about it' is rarely a decision to think — it's usually a hidden objection. Ask: 'Of course — is there a specific aspect you'd like more time on? Sometimes I can address it now and save you the wait.' Then close with a specific next appointment: 'How about a quick 15-minute call next Thursday at 4pm? If you've decided it's not for you, just tell me and I'll respect that completely.' Vague timelines almost never result in callbacks.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'My spouse needs to agree before I can proceed.' How do you handle this?",
    options: [
      "Tell them they don't need their spouse's approval for a financial plan",
      "Offer to arrange a meeting or call that includes the spouse, so both can hear the presentation together and any concerns can be addressed in real time",
      "Give all the materials and hope the client convinces the spouse",
      "Ask the client to proceed without telling their spouse"
    ],
    correct: 1,
    explanation: "A joint decision is legitimate and should be respected — not worked around. The right move is to request an opportunity to present to both together: 'I'd love to walk through this with both of you — even a 30-minute call would work. That way I can answer any questions your spouse has directly, and you're both fully confident in the decision.' A spouse meeting often accelerates the close because it removes the relay game.",
    category: 'objection-handling'
  },
  {
    question: "A client who purchased Pro Achiever 2 years ago calls and says they want to surrender because the fund value is lower than what they paid in. How do you handle this retention conversation?",
    options: [
      "Support their decision and process the surrender immediately",
      "Acknowledge the frustration, explain that year 2 is the typical trough due to front-loaded charges, show a projection of what continuing to hold will look like by year 10, and explore if a premium reduction or holiday is possible rather than full surrender",
      "Tell them they should have read the product illustration more carefully",
      "Offer to switch them to a different AIA product as a retention measure"
    ],
    correct: 1,
    explanation: "Year 2 is almost always in the red for an ILP — this is expected and was shown in the product illustration at point of sale. The retention approach: validate the frustration, re-show the long-term projection, explain that surrendering now locks in the loss, and explore flexible options (premium reduction, holiday, fund switch to defensive allocation). Surrendering at year 2 is almost always the worst financial outcome for the client.",
    category: 'objection-handling'
  }
];
