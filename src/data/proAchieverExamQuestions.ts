export interface ExamQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling';
}

export const proAchieverExamQuestions: ExamQuestion[] = [
  // ── Product Facts ──
  {
    question: "What type of insurance product is Pro Achiever?",
    options: [
      "Term life insurance",
      "Regular premium Investment-Linked Policy (ILP)",
      "Whole life endowment plan",
      "Universal life policy"
    ],
    correct: 1,
    explanation: "Pro Achiever is a regular premium ILP designed for growth-focused clients seeking flexibility and long-term wealth accumulation through curated investment funds.",
    category: 'product-facts'
  },
  {
    question: "Approximately how many investment funds does Pro Achiever offer access to?",
    options: [
      "5 funds",
      "10 funds",
      "Over 20 funds",
      "Over 50 funds"
    ],
    correct: 2,
    explanation: "Pro Achiever provides a choice of over 20 curated investment funds, giving clients diversification options suited to different risk appetites and goals.",
    category: 'product-facts'
  },
  {
    question: "Which of the following is a key feature of Pro Achiever?",
    options: [
      "Guaranteed capital return after 5 years",
      "Free fund switching",
      "Fixed interest rate of 3% p.a.",
      "No insurance charges apply"
    ],
    correct: 1,
    explanation: "Pro Achiever allows free fund switching so clients can adjust their investment allocation as market conditions or personal goals change, without incurring switching fees.",
    category: 'product-facts'
  },
  {
    question: "What additional feature does Pro Achiever offer besides regular premiums?",
    options: [
      "Automatic premium waiver",
      "Top-up options and policy loan features",
      "No-claims bonus",
      "Premium holiday from year 1"
    ],
    correct: 1,
    explanation: "Pro Achiever offers top-up options (to boost investment when clients have extra funds) and policy loan features for liquidity, adding flexibility to the plan.",
    category: 'product-facts'
  },
  {
    question: "How does the bonus allocation in Pro Achiever work?",
    options: [
      "A flat 5% bonus on all premiums",
      "Bonus allocation tiers that vary by premium band",
      "Bonus only applies after 10 years",
      "No bonus allocation is offered"
    ],
    correct: 1,
    explanation: "Pro Achiever features tiered bonus allocations where the bonus percentage varies depending on the premium band. Higher premiums unlock larger bonus allocations, effectively offsetting early charges.",
    category: 'product-facts'
  },
  {
    question: "What is the primary risk associated with Pro Achiever?",
    options: [
      "Currency exchange risk only",
      "No risk — returns are guaranteed",
      "Market risk — returns are not guaranteed and depend on fund performance",
      "Inflation risk only"
    ],
    correct: 2,
    explanation: "As an ILP, Pro Achiever's returns depend on the performance of the underlying funds. It is not a guaranteed return plan, and clients bear market risk on their investments.",
    category: 'product-facts'
  },
  {
    question: "What happens to insurance charges in the early years of Pro Achiever?",
    options: [
      "No insurance charges in the first 3 years",
      "Charges are evenly spread over the policy term",
      "Insurance coverage cost is front-loaded, meaning higher charges in early years",
      "Charges are deducted only upon maturity"
    ],
    correct: 2,
    explanation: "In the early years, insurance charges are higher because the coverage cost is front-loaded. After around year 5-7, the fund value typically starts to compound more meaningfully as the charges reduce proportionally.",
    category: 'product-facts'
  },

  // ── Sales Angles ──
  {
    question: "A 30-year-old client wants to build long-term wealth but wants flexibility to adjust investments. Which Pro Achiever feature would you highlight?",
    options: [
      "The guaranteed maturity benefit",
      "Free fund switching and choice of over 20 funds",
      "The fixed premium lock-in",
      "The cash surrender value guarantee"
    ],
    correct: 1,
    explanation: "For a young client focused on long-term growth with flexibility, the ability to switch between 20+ funds for free is a powerful selling point — it means they can adapt their strategy as life circumstances change.",
    category: 'sales-angles'
  },
  {
    question: "A client with irregular income asks about Pro Achiever. What is the best sales approach?",
    options: [
      "Tell them ILPs are not suitable for irregular income earners",
      "Highlight the flexible premium payment options and top-up features",
      "Recommend they wait until they have a stable income",
      "Suggest a term plan instead"
    ],
    correct: 1,
    explanation: "Pro Achiever's flexible premium options and ad-hoc top-up features make it suitable even for clients with irregular income — they can increase contributions when business is good and maintain minimum premiums during lean periods.",
    category: 'sales-angles'
  },
  {
    question: "When using goal-based selling for Pro Achiever, what approach works best?",
    options: [
      "Focus on the product's insurance charges breakdown",
      "Compare Pro Achiever's IRR against fixed deposits",
      "Use goal-based illustrations to align the plan with client milestones (e.g. children's education, retirement)",
      "Emphasise the surrender value in the first 3 years"
    ],
    correct: 2,
    explanation: "Goal-based illustrations are the most effective approach — they help clients visualise how Pro Achiever can grow towards specific milestones like children's education or retirement, making the product tangible and personal.",
    category: 'sales-angles'
  },
  {
    question: "A client is comparing Pro Achiever to investing directly in unit trusts. What is your strongest argument?",
    options: [
      "Pro Achiever has zero charges unlike unit trusts",
      "Pro Achiever provides both investment growth AND life protection in a single plan",
      "Unit trusts always underperform ILPs",
      "Pro Achiever guarantees higher returns than unit trusts"
    ],
    correct: 1,
    explanation: "The key differentiator is that Pro Achiever bundles investment growth with life protection — the client gets both wealth accumulation and insurance coverage, which standalone unit trusts don't provide.",
    category: 'sales-angles'
  },
  {
    question: "A client is starting a business and considering Pro Achiever. Which feature is most relevant?",
    options: [
      "The fixed premium schedule",
      "The policy loan feature for liquidity when cash flow is tight",
      "The guaranteed surrender value",
      "The automatic claims feature"
    ],
    correct: 1,
    explanation: "For business owners, the policy loan feature is particularly valuable — it provides a source of liquidity they can tap into during cash flow crunches without surrendering the policy or losing their investment growth.",
    category: 'sales-angles'
  },

  // ── Objection Handling ──
  {
    question: "A prospect says: 'ILPs have high charges.' What is the best response?",
    options: [
      "Deny that charges exist and redirect to fund performance",
      "Acknowledge the concern, explain front-loaded charges reduce over time, and highlight the welcome bonus that offsets early charges",
      "Agree and suggest a different product entirely",
      "Tell them all investments have charges so it doesn't matter"
    ],
    correct: 1,
    explanation: "The best approach is to acknowledge the valid concern transparently, explain that charges are front-loaded but reduce over time (fund value compounds after year 5-7), and highlight Pro Achiever's welcome bonus that effectively offsets early charges.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I can get better returns investing on my own.' How should you respond?",
    options: [
      "Agree and close the conversation",
      "Tell them they are wrong and show historical ILP returns",
      "Acknowledge their point, then explain the value of disciplined savings, diversification across 20+ funds, and built-in life coverage they wouldn't get from self-investing",
      "Show them worst-case scenarios of self-investing"
    ],
    correct: 2,
    explanation: "Acknowledge their capability, then highlight what self-investing misses: disciplined regular contributions (dollar cost averaging), professional fund management, access to 20+ diversified funds, and life protection — all bundled in one plan.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I already bought a policy recently, I don't need another one.' What approach works best?",
    options: [
      "Insist they need Pro Achiever regardless",
      "Ask what their existing policy covers, then position Pro Achiever as complementary for investment growth if their current plan focuses on protection",
      "Offer a discount on Pro Achiever premiums",
      "Tell them their existing policy is probably not good enough"
    ],
    correct: 1,
    explanation: "A consultative approach works best — understand what they already have, then position Pro Achiever as a complementary plan. If their existing policy is protection-focused, Pro Achiever fills the investment growth gap.",
    category: 'objection-handling'
  },
  {
    question: "A prospect says: 'I'll call you back when I'm ready.' How should you handle this?",
    options: [
      "Accept it and wait for their call",
      "Pressure them into signing immediately",
      "Set a specific follow-up date and time, acknowledging their position while gently noting that life gets busy and these things tend to fall off the radar",
      "Send them daily reminders until they respond"
    ],
    correct: 2,
    explanation: "Set a specific follow-up: 'How about I give you a quick call next Tuesday just to touch base? If you've decided it's not for you, just tell me and I'll respect that completely.' Vague 'call me' usually means never — a specific date creates gentle accountability.",
    category: 'objection-handling'
  },
  {
    question: "A prospect is worried about losing money in an ILP. What is the most effective reassurance?",
    options: [
      "Promise them they won't lose money",
      "Tell them risk is just part of investing and they should accept it",
      "Explain dollar cost averaging with regular premiums, show how fund switching lets them move to conservative funds in downturns, and use historical data to illustrate long-term growth trends",
      "Suggest they put all their money in the most conservative fund"
    ],
    correct: 2,
    explanation: "Address the fear with concrete strategies: dollar cost averaging through regular premiums smooths out market volatility, free fund switching allows defensive moves during downturns, and long-term historical data shows that markets tend to recover and grow over time.",
    category: 'objection-handling'
  },
  {
    question: "A prospect asks: 'What if I need the money urgently in 2 years?' How do you respond?",
    options: [
      "Tell them Pro Achiever is perfect for short-term needs",
      "Be transparent that ILPs are designed for long-term growth (5+ years), but highlight the policy loan feature for emergency liquidity without full surrender",
      "Guarantee they can withdraw anytime with no penalty",
      "Ignore the concern and focus on fund performance"
    ],
    correct: 1,
    explanation: "Honesty builds trust. Be upfront that Pro Achiever is best suited for long-term goals (5+ years), but reassure them that the policy loan feature provides emergency liquidity access without needing to surrender the policy entirely.",
    category: 'objection-handling'
  }
];
