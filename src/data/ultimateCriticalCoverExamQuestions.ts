import type { ExamQuestion } from './proAchieverExamQuestions';

export const ultimateCriticalCoverExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "How many multi-stage critical illnesses does AIA Ultimate Critical Cover (UCC) cover?",
    options: [
      "53 illnesses across early and severe stages",
      "104 illnesses across early, intermediate, and severe stages",
      "150 illnesses across early, intermediate, and severe stages",
      "200 illnesses across all stages"
    ],
    correct: 2,
    explanation: "UCC covers 150 multi-stage critical illnesses across early, intermediate, and severe stages -- significantly more than competitors like Great Eastern (53) and BCC (104).",
    category: 'product-facts'
  },
  {
    question: "What does 'unlimited claims' mean under UCC's base plan (without the Enhancer rider)?",
    options: [
      "Unlimited claims for any illness including repeat occurrences of the same illness",
      "Unlimited claims for different illnesses only -- same-illness relapses are not covered",
      "Up to 10 claims for any combination of illnesses",
      "Unlimited claims but with a decreasing payout each time"
    ],
    correct: 1,
    explanation: "UCC's 'unlimited' means unlimited different illnesses. A second heart attack or cancer relapse is NOT covered without the Enhancer rider. The base plan is priced low specifically because relapse coverage is separated out.",
    category: 'product-facts'
  },
  {
    question: "How long must elapse between UCC claims for coverage to reset to 100%?",
    options: [
      "6 months",
      "12 months",
      "24 months",
      "36 months"
    ],
    correct: 1,
    explanation: "UCC coverage resets to 100% after a 12-month waiting period between claims, with no limit on the number of resets.",
    category: 'product-facts'
  },
  {
    question: "What is the approximate total monthly cost for a 20-year-old non-smoker with $100k UCC coverage until age 65, including Enhancer, Early CI, and Premium Waiver riders?",
    options: [
      "About $44 per month",
      "About $50 per month",
      "About $57 per month",
      "About $72 per month"
    ],
    correct: 2,
    explanation: "The total is approximately $57/month: base UCC ($44) + Enhancer ($7) + Early CI Trigger ($2) + Premium Waiver ECPWP ($4).",
    category: 'product-facts'
  },
  {
    question: "What happens to a GPP or SFT plan after a single critical illness claim?",
    options: [
      "Coverage resets after 12 months",
      "Coverage continues with reduced sum assured",
      "The plan terminates with maximum 100% payout, and the policyholder becomes uninsurable",
      "Premiums are waived but coverage continues"
    ],
    correct: 2,
    explanation: "GPP and SFT plans terminate after just 1 critical illness claim (max 100% payout). The policyholder then becomes uninsurable, unable to purchase new CI coverage.",
    category: 'product-facts'
  },
  {
    question: "What restriction does Prudential's CI plan have that UCC does not?",
    options: [
      "A maximum of 3 claims lifetime",
      "Coverage only until age 65",
      "A 'related illness' restriction blocking subsequent claims for related conditions",
      "No coverage for cardiovascular conditions"
    ],
    correct: 2,
    explanation: "Prudential has a 'related illness' restriction that blocks subsequent claims for related conditions. Under UCC, coronary heart disease, bypass, heart attack, and transplant can each be claimed separately.",
    category: 'product-facts'
  },
  {
    question: "What is the maximum total payout under Great Eastern's CI plan, and how does it compare to UCC?",
    options: [
      "Great Eastern: unlimited; UCC: 550%",
      "Great Eastern: 500%; UCC: 300%",
      "Great Eastern: 300% (policy ceases after 3 claims); UCC: 550% or more (unlimited)",
      "Great Eastern: 200%; UCC: 200%"
    ],
    correct: 2,
    explanation: "Great Eastern's CI policy ceases after 3 claims with max 300% payout. UCC allows unlimited claims for different illnesses with 550%+ total potential payout.",
    category: 'product-facts'
  },
  {
    question: "What does the UCC Enhancer rider cover, and what is the payout for a second relapse?",
    options: [
      "Early-stage illnesses at 100% payout",
      "Second occurrence of the same CI at 50% payout",
      "Second occurrence of the same CI at 100% payout",
      "Premium waiver after first claim"
    ],
    correct: 1,
    explanation: "The UCC Enhancer covers a second occurrence of the same critical illness but pays only 50% of sum assured. Without it, same-illness relapses get zero coverage.",
    category: 'product-facts'
  },
  {
    question: "What unique partnership benefit does AIA offer with UCC?",
    options: [
      "Raffles Medical priority access with 10,000 specialists",
      "Mount Elizabeth specialist referral covering all conditions",
      "Teladoc medical concierge with 50,000+ specialists worldwide covering cancer, cardiovascular, and neurological conditions",
      "National University Hospital second opinion service for surgical cases only"
    ],
    correct: 2,
    explanation: "AIA partners exclusively with Teladoc to provide medical concierge services including second opinions, treatment consultation, and access to 50,000+ specialists worldwide.",
    category: 'product-facts'
  },
  {
    question: "What key feature does BCC include in its base plan that UCC requires a separate rider for?",
    options: [
      "Early-stage critical illness coverage",
      "Premium waiver upon first claim",
      "Relapse coverage for same-illness second occurrences",
      "Access to Teladoc medical concierge"
    ],
    correct: 2,
    explanation: "BCC includes relapse coverage in its base plan, while UCC requires the separate Enhancer rider ($7/month) to cover second occurrences of the same illness.",
    category: 'product-facts'
  },
  {
    question: "What are the three flexible coverage term options available for UCC?",
    options: [
      "Until age 55, 65, or 75",
      "Until age 60, 70, or 80",
      "Until age 65, 75, or 85",
      "10, 20, or 30 years from purchase"
    ],
    correct: 2,
    explanation: "UCC offers three coverage term options: until age 65, 75, or 85. This flexibility allows advisors to present the Middle Ground close with three price points.",
    category: 'product-facts'
  },
  {
    question: "How does UCC compare in price to the four main competitors?",
    options: [
      "Cheaper than Prudential (11%) and SingLife (22%), but more expensive than Great Eastern and Manulife",
      "Cheaper than all four: Prudential (11%), Great Eastern (6%), Manulife (29%), SingLife (22%)",
      "About the same price as all competitors",
      "Cheaper than Manulife (29%) only; more expensive than the other three"
    ],
    correct: 1,
    explanation: "UCC is cheaper than all four main competitors: approximately 11% cheaper than Prudential, 6% cheaper than Great Eastern, 29% cheaper than Manulife, and 22% cheaper than SingLife.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (10 questions)
  // ============================================================

  {
    question: "What is the primary problem with merged death/CI/savings plans (GPP, SFT, whole life) that creates the opening for UCC?",
    options: [
      "The premiums are too expensive for adequate coverage",
      "One early CI claim wipes out death coverage, major CI protection, and surrender value simultaneously",
      "They do not cover any critical illnesses at all",
      "They only provide coverage until age 55"
    ],
    correct: 1,
    explanation: "Merged plans bundle death, CI, and savings together. One early CI claim eliminates all three benefits, leaving the client uninsured and unable to buy new coverage.",
    category: 'sales-angles'
  },
  {
    question: "In the 5-step UCC pitch process, what should be shown in step 1?",
    options: [
      "A premium comparison table with all competitors",
      "The three coverage term options with pricing",
      "One picture showing the heart condition progression (coronary heart disease to bypass to heart attack to transplant)",
      "The Teladoc partnership benefits"
    ],
    correct: 2,
    explanation: "Step 1 shows one picture of the heart condition progression to immediately demonstrate the power of multiple claims for related but different conditions.",
    category: 'sales-angles'
  },
  {
    question: "What is the 'Middle Ground' close technique and what psychological principle does it leverage?",
    options: [
      "Offer only one option and use scarcity bias to close",
      "Present 3 options (65/75/85) and advise against extremes, leveraging extremeness aversion",
      "Start with the most expensive option and negotiate down using anchoring",
      "Present 5 options and let the client choose freely using paradox of choice"
    ],
    correct: 1,
    explanation: "The Middle Ground close presents 3 options and positions the advisor as balanced by advising against both extremes. It leverages extremeness aversion -- the tendency to avoid extreme options.",
    category: 'sales-angles'
  },
  {
    question: "Using the Time Value of Money strategy for a 25-year-old female with $200k coverage, what is the monthly premium savings between the 65 and 85 options, and what could it grow to by age 65?",
    options: [
      "$80/month savings, growing to about $200k by age 65",
      "$160/month savings, growing to about $388k by age 65",
      "$200/month savings, growing to about $500k by age 65",
      "$100/month savings, growing to about $250k by age 65"
    ],
    correct: 1,
    explanation: "The annual difference is $3,320 - $1,400 = $1,920/year (~$160/month). Invested over time, this could grow to approximately $388k by age 65 or $1.5M by age 85.",
    category: 'sales-angles'
  },
  {
    question: "What is the 'Premium Waiver Attack' that competitor agents may use against UCC advisors?",
    options: [
      "Claiming UCC's premiums are the highest in the market",
      "Showing that UCC covers fewer illnesses than their product",
      "Asking the client 'Did your agent tell you about premium waiver?' to exploit the gap if ECPWP is not attached",
      "Pointing out that UCC has no investment component"
    ],
    correct: 2,
    explanation: "Without the ECPWP rider, clients must keep paying premiums after a claim. Competitor agents exploit this by questioning whether the advisor disclosed this limitation.",
    category: 'sales-angles'
  },
  {
    question: "What are the two main entry points for selling UCC to existing policyholders with merged plans?",
    options: [
      "Price comparison and commission structure",
      "Early CI gap identification and Coverage Gap Calculator (DBR)",
      "Teladoc benefits and unlimited claims feature",
      "Premium waiver and investment returns"
    ],
    correct: 1,
    explanation: "The two key entry points are identifying the Early CI gap (what happens after one claim) and using the Coverage Gap Calculator (DBR) to quantify the coverage shortfall.",
    category: 'sales-angles'
  },
  {
    question: "How should you frame the final decision in step 5 of the UCC pitch?",
    options: [
      "As a limited-time promotional offer",
      "As a mandatory financial planning requirement",
      "As a risk trade-off rather than a price decision",
      "As the cheapest option available in the market"
    ],
    correct: 2,
    explanation: "Step 5 frames the decision as a risk trade-off rather than focusing on price. This helps clients think about protection value and what they stand to lose, not just cost.",
    category: 'sales-angles'
  },
  {
    question: "When comparing UCC to BCC for a client, which scenario favors recommending UCC over BCC?",
    options: [
      "Client wants guaranteed premium refund at age 85",
      "Client prefers built-in relapse coverage without riders",
      "Client is budget-conscious, wants flexibility, and values unlimited claims over premium refund",
      "Client wants the simplest plan with fewest moving parts"
    ],
    correct: 2,
    explanation: "UCC is better for budget-conscious clients who value flexibility (65/75/85 options) and unlimited claims. BCC is better for those wanting built-in relapse and premium refund guarantee.",
    category: 'sales-angles'
  },
  {
    question: "What recommended solution addresses the vulnerability of merged death/CI/savings plans?",
    options: [
      "Add more riders to the existing merged plan",
      "Increase the sum assured on the merged plan by 50%",
      "Decouple into pure CI (UCC) + pure death + pure investment products",
      "Replace the merged plan with a higher-tier whole life policy"
    ],
    correct: 2,
    explanation: "The recommended approach is to decouple coverage into separate pure CI (UCC), pure death, and pure investment products for optimal protection without single-claim vulnerability.",
    category: 'sales-angles'
  },
  {
    question: "Which power question is most effective for opening a UCC conversation with existing policyholders?",
    options: [
      "How much are you paying in insurance premiums each month?",
      "When did you last review your insurance portfolio?",
      "If you claim early CI, what happens to your major CI coverage, death benefit, and savings? Can you buy new coverage again?",
      "Do you know how many illnesses your current plan covers?"
    ],
    correct: 2,
    explanation: "This question exposes the vulnerability of merged plans (one claim wipes everything) and the insurability gap (cannot buy new coverage after diagnosis), creating urgency for UCC.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (8 questions)
  // ============================================================

  {
    question: "A client says: 'UCC is too expensive for my budget.' What is the most effective response?",
    options: [
      "Agree and recommend a cheaper competitor product",
      "Show the 3 coverage term options and use Time Value of Money to demonstrate how choosing until 65 is affordable at ~$44/month while investing the savings",
      "Offer to reduce the coverage amount to $10k",
      "Tell the client they cannot afford to be uninsured"
    ],
    correct: 1,
    explanation: "Use the 3-option presentation and Time Value of Money strategy. Coverage until 65 at ~$44/month is very affordable, and the premium savings vs longer terms can be invested for greater returns.",
    category: 'objection-handling'
  },
  {
    question: "A client asks: 'Why should I pay for the Enhancer when UCC already says unlimited claims?' What is the best response?",
    options: [
      "The Enhancer is optional and not important for most people",
      "AIA requires the Enhancer on all policies",
      "'Unlimited' means unlimited different illnesses. Without the Enhancer, a cancer relapse or second heart attack gets zero coverage. At $7/month, it closes this critical gap.",
      "The Enhancer doubles your total payout from 550% to 1100%"
    ],
    correct: 2,
    explanation: "Directly address the misconception: 'unlimited' applies to different illnesses only. The Enhancer at just $7/month covers same-illness relapses -- a critical gap that the base plan intentionally excludes to keep premiums low.",
    category: 'objection-handling'
  },
  {
    question: "A Prudential agent tells your client their plan is better because it covers related illnesses. How do you counter this?",
    options: [
      "Agree that Prudential may be better for related illnesses",
      "Ignore the claim and focus on UCC's pricing advantage",
      "Explain that Prudential actually has a 'related illness' RESTRICTION that blocks subsequent heart claims, while UCC treats coronary heart disease, bypass, heart attack, and transplant as separate claimable events",
      "Tell the client to cancel Prudential immediately"
    ],
    correct: 2,
    explanation: "Prudential's 'related illness' restriction actually blocks subsequent claims for related conditions. UCC allows each condition in a progression to be claimed separately.",
    category: 'objection-handling'
  },
  {
    question: "A client objects: 'UCC has no cash value, so I lose all my premiums if I do not claim.' How do you handle this?",
    options: [
      "Suggest they buy BCC instead for the premium refund feature",
      "Agree that having no cash value is a significant drawback",
      "Reframe: UCC is pure protection like car insurance -- the value is the coverage itself. Lower premiums let you invest savings elsewhere for wealth building, potentially exceeding any cash value.",
      "Explain that UCC does build cash value after 10 years"
    ],
    correct: 2,
    explanation: "Reframe no cash value as a feature, not a bug: pure protection keeps premiums low, and the savings can be invested elsewhere for wealth accumulation that likely exceeds any cash value.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I do not want to pay premiums after making a CI claim.' What is the direct solution?",
    options: [
      "All CI plans require continued premium payment -- there is no solution",
      "Switch to BCC which automatically waives premiums",
      "The Premium Waiver rider (ECPWP) at $4/month waives all future premiums after the first claim -- a direct solution to this exact concern",
      "Pay all premiums upfront in a lump sum"
    ],
    correct: 2,
    explanation: "The ECPWP rider at just $4/month directly addresses this concern by waiving all future premiums after the first critical illness claim.",
    category: 'objection-handling'
  },
  {
    question: "A client says: 'I already have MediShield Life, so I do not need CI coverage.' How do you respond?",
    options: [
      "MediShield Life is sufficient for most people's needs",
      "Cancel MediShield Life and buy UCC instead",
      "MediShield Life covers hospital bills; CI provides a lump sum for income replacement, mortgage payments, and lifestyle adjustments that medical insurance does not cover",
      "MediShield Life and CI coverage are the same type of product"
    ],
    correct: 2,
    explanation: "MediShield Life covers medical bills. CI coverage like UCC provides a lump sum for non-medical costs: income replacement, mortgage, childcare, and daily expenses during recovery.",
    category: 'objection-handling'
  },
  {
    question: "A competitor agent tells your client: 'AIA's unlimited claims is misleading marketing.' How should you respond?",
    options: [
      "Deny the claim entirely and insist UCC covers everything unlimited",
      "Agree and apologize for the misleading marketing",
      "Acknowledge the nuance transparently: the base plan covers unlimited different illnesses, not same-illness relapses. Then show that the Enhancer at $7/month adds relapse coverage, giving truly comprehensive protection.",
      "Ignore the criticism and change the subject to Teladoc"
    ],
    correct: 2,
    explanation: "Transparency builds trust. Acknowledge the distinction between different-illness and same-illness claims, then show how the affordable Enhancer rider closes the gap completely.",
    category: 'objection-handling'
  },
  {
    question: "A client objects: 'BCC seems better because it includes relapse coverage and a premium refund.' How do you differentiate UCC?",
    options: [
      "Agree that BCC is the superior product in every way",
      "UCC covers 150 illnesses vs BCC's 104, offers unlimited claims vs BCC's 200% max, and the lower premiums can be invested. The right choice depends on prioritizing coverage breadth or built-in refund.",
      "Tell the client BCC is being discontinued by AIA",
      "Explain that the premium refund is not worth waiting until age 85"
    ],
    correct: 1,
    explanation: "Highlight UCC's advantages (46 more illnesses, unlimited vs 200% max claims, lower premiums) while acknowledging it is a trade-off, helping the client make an informed choice based on priorities.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (6 questions)
  // ============================================================

  {
    question: "A 28-year-old with a GPP plan says: 'My agent told me my GPP covers critical illness, so I am fully protected.' What is your best response?",
    options: [
      "Your agent is correct. GPP provides comprehensive CI coverage for life.",
      "Your GPP does cover CI, but it terminates after one claim. If you claim early CI, your death coverage, major CI, and surrender value are all gone. After that, can you buy new CI coverage?",
      "Your GPP is terrible. Cancel it immediately and buy UCC.",
      "I cannot comment on your existing coverage. Let me just show you UCC's brochure."
    ],
    correct: 1,
    explanation: "Acknowledge the existing coverage truthfully, then expose the single-claim vulnerability using the power question about post-claim insurability.",
    category: 'roleplay'
  },
  {
    question: "A 35-year-old female on a tight budget of $60/month wants comprehensive CI coverage. Which UCC configuration fits best?",
    options: [
      "UCC $200k until age 85 without any riders",
      "UCC $100k until age 65 with all three riders (Enhancer + Early CI + Premium Waiver) at approximately $57/month",
      "UCC $50k until age 75 with the Enhancer rider only",
      "BCC $100k until age 85 without riders"
    ],
    correct: 1,
    explanation: "For $60/month budget, UCC $100k until 65 with all three essential riders ($57/month) provides the most comprehensive coverage within budget, including relapse, early-stage, and premium waiver protection.",
    category: 'roleplay'
  },
  {
    question: "A client's spouse says: 'We already spend too much on insurance. Why add more?' How do you handle both stakeholders?",
    options: [
      "Ignore the spouse and continue presenting to the client",
      "Agree with the spouse and reduce the recommended coverage to minimum",
      "Acknowledge the concern, then ask both: 'If one of you claims early CI, what happens to the death benefit and savings? How would the family manage?' Let them discover the gap together.",
      "Tell the spouse they do not understand insurance"
    ],
    correct: 2,
    explanation: "Include the spouse by using a power question that helps both stakeholders discover the coverage gap. This turns the objection into a joint problem-solving exercise.",
    category: 'roleplay'
  },
  {
    question: "A client wants UCC but skips the Enhancer to save $7/month. How do you advise them?",
    options: [
      "That is smart -- the Enhancer is not important for most people",
      "Refuse to process the application without the Enhancer attached",
      "Tell them they will definitely get cancer twice if they skip it",
      "Explain: at $7/month, the Enhancer covers same-illness relapses. Without it, a cancer relapse or second heart attack gets zero coverage. Show a real scenario of what that looks like financially."
    ],
    correct: 3,
    explanation: "Emphasize the low cost ($7/month) vs high consequence (zero relapse coverage) and use a concrete scenario to make the risk tangible without being pushy.",
    category: 'roleplay'
  },
  {
    question: "You are meeting a 30-year-old couple who both have SFT plans. How do you open the UCC conversation?",
    options: [
      "Tell them their SFT plans are outdated products that need replacing",
      "Skip any discussion of their current plans and present UCC features directly",
      "Ask: 'If either of you claims early CI from your SFT, what happens to your death coverage, major CI, and savings? After that claim, can you buy new coverage?' Let them realize the gap before introducing UCC.",
      "Start with UCC premium rates and show how affordable it is"
    ],
    correct: 2,
    explanation: "Use power questions to help the couple discover the SFT vulnerability themselves before introducing UCC. Self-discovered gaps are more motivating than advisor-told gaps.",
    category: 'roleplay'
  },
  {
    question: "A client is deciding between UCC $100k and $200k coverage. They earn $5,000/month. What guidance framework do you use?",
    options: [
      "Always recommend the minimum to keep premiums low",
      "Always recommend the maximum for best protection",
      "Coverage amount does not matter -- focus only on riders",
      "CI coverage should replace 3-5 years of income. At $5,000/month, that is $180k-$300k. $200k covers about 3.3 years of income replacement -- a reasonable starting point."
    ],
    correct: 3,
    explanation: "The 3-5 years income replacement guideline helps clients choose appropriate coverage. At $5,000/month income, $200k provides about 3.3 years of replacement, which is a solid foundation.",
    category: 'roleplay'
  }
];
