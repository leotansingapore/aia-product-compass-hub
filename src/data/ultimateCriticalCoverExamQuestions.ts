import type { ExamQuestion } from './proAchieverExamQuestions';

export const ultimateCriticalCoverExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "A client asks how many illnesses UCC covers. You recall the number is significantly more than Great Eastern's 53. What is the correct figure?",
    options: [
      "104 illnesses across early, intermediate, and severe stages",
      "200 illnesses but limited to severe stage only",
      "150 illnesses across early, intermediate, and severe stages",
      "75 illnesses across early and severe stages only"
    ],
    correct: 2,
    explanation: "UCC covers 150 multi-stage critical illnesses spanning early, intermediate, and severe stages. This is nearly three times Great Eastern's 53 illnesses.",
    category: 'product-facts'
  },

  {
    question: "Your client wants to know when coverage resets to 100% after a claim. What do you tell them?",
    options: [
      "Coverage resets after a 12-month waiting period between claims",
      "Coverage resets after a 24-month waiting period between claims",
      "Coverage resets after a 6-month waiting period between claims",
      "Coverage never resets -- each subsequent claim pays a reduced percentage"
    ],
    correct: 0,
    explanation: "UCC resets coverage to 100% after a 12-month waiting period. Unlike Great Eastern which only allows 2 resets, UCC has no limit on the number of resets.",
    category: 'product-facts'
  },

  {
    question: "A prospect is comparing prices. Prudential's equivalent CI plan costs $56/month for the same profile. How does UCC compare?",
    options: [
      "UCC would cost about $63/month -- roughly 11% more expensive",
      "UCC would cost about $50/month -- roughly 11% cheaper",
      "UCC would cost about $53/month -- roughly 6% cheaper",
      "UCC would cost the same at $56/month"
    ],
    correct: 1,
    explanation: "UCC is approximately 11% cheaper than Prudential's equivalent CI product. For a 25-year-old male with $100k sum assured paid to age 75, the premium is about $50/month.",
    category: 'product-facts'
  },

  {
    question: "A client adds the Enhancer rider and asks what payout they would receive for a second occurrence of the same illness. What is the correct answer?",
    options: [
      "100% of sum assured, same as the first occurrence",
      "75% of sum assured",
      "25% of sum assured",
      "50% of sum assured"
    ],
    correct: 3,
    explanation: "The UCC Enhancer rider pays 50% of sum assured for a second occurrence of the same illness. Without the Enhancer, a same-illness relapse receives 0% payout.",
    category: 'product-facts'
  },

  {
    question: "You are quoting a 20-year-old non-smoker with $100k coverage until age 65. The client wants the base plan plus all three riders. What total monthly premium should you quote?",
    options: [
      "About $44/month -- the riders are included free",
      "About $57/month -- base $44 plus Enhancer $7, Early CI $2, Premium Waiver $4",
      "About $63/month -- base $50 plus Enhancer $7, Early CI $2, Premium Waiver $4",
      "About $72/month -- base $59 plus Enhancer $7, Early CI $2, Premium Waiver $4"
    ],
    correct: 1,
    explanation: "The total is approximately $57/month: base UCC at $44/month, plus Enhancer at $7/month, Early CI Trigger at $2/month, and Premium Waiver (ECPWP) at $4/month.",
    category: 'product-facts'
  },

  {
    question: "What is the theoretical maximum total payout percentage under UCC?",
    options: [
      "300% of sum assured, after which the policy terminates",
      "500% of sum assured across all stages",
      "200% of sum assured with a premium refund",
      "550% or more -- unlimited because there is no cap on the number of different-illness claims"
    ],
    correct: 3,
    explanation: "UCC's total payout potential is 550% or more because the number of claims is unlimited, as long as each claim is for a different illness with a 12-month gap between claims.",
    category: 'product-facts'
  },

  {
    question: "A client wants to know why UCC has no cash value or surrender value. What is the structural reason?",
    options: [
      "AIA decided to exclude cash value to increase commission payouts",
      "UCC is a pure critical illness protection plan -- removing the savings component keeps premiums lower",
      "Cash value is only available for plans covering fewer than 100 illnesses",
      "UCC does have cash value, but only after 20 years of premium payments"
    ],
    correct: 1,
    explanation: "UCC is a pure CI protection plan with no savings component. This design choice keeps premiums competitive while focusing entirely on critical illness coverage.",
    category: 'product-facts'
  },

  {
    question: "Which medical service partnership is exclusive to UCC policyholders?",
    options: [
      "Raffles Medical priority access covering all conditions",
      "Mount Elizabeth specialist network for surgical conditions",
      "Teladoc medical concierge covering cancer, cardiovascular, and neurological conditions with access to 50,000+ specialists",
      "National University Hospital second opinion service for cancer patients only"
    ],
    correct: 2,
    explanation: "UCC policyholders get exclusive access to Teladoc, which provides second opinions, treatment consultation, and condition management through a network of over 50,000 specialists worldwide.",
    category: 'product-facts'
  },

  {
    question: "Without the Premium Waiver (ECPWP) rider, what happens to a policyholder's premiums after their first critical illness claim?",
    options: [
      "Premiums are automatically waived for 12 months",
      "Premiums are reduced by 50% for the remaining term",
      "Premiums must continue to be paid as normal",
      "Premiums are frozen at the pre-claim amount with no future increases"
    ],
    correct: 2,
    explanation: "Without the ECPWP rider, premiums must continue after a claim. This is a key vulnerability that competitor agents may exploit, which is why the ECPWP rider at $4/month is strongly recommended.",
    category: 'product-facts'
  },

  {
    question: "A 25-year-old female is choosing between coverage until age 65, 75, or 85 for $200k sum assured. What are the approximate annual premiums for each option?",
    options: [
      "$1,400/year (age 65), $2,328/year (age 75), $3,320/year (age 85)",
      "$1,000/year (age 65), $1,800/year (age 75), $2,500/year (age 85)",
      "$2,328/year (age 65), $3,320/year (age 75), $4,500/year (age 85)",
      "$800/year (age 65), $1,400/year (age 75), $2,328/year (age 85)"
    ],
    correct: 0,
    explanation: "For a 25-year-old female with $200k coverage: age 65 costs about $1,400/year, age 75 costs about $2,328/year, and age 85 costs about $3,320/year.",
    category: 'product-facts'
  },

  {
    question: "What first-year commission can an advisor expect on a typical UCC case with approximately $600 annual premium?",
    options: [
      "About $60-120 (10-20% of annual premium)",
      "About $240-300 (40-50% of annual premium)",
      "About $360-420 (60-70% of annual premium)",
      "About $480-540 (80-90% of annual premium)"
    ],
    correct: 1,
    explanation: "UCC pays 40-50% of annual premium as first-year commission. On a typical case with approximately $600 annual premium, that yields approximately $240-300.",
    category: 'product-facts'
  },

  {
    question: "How does BCC differ from UCC in its approach to same-illness relapse coverage?",
    options: [
      "Both require a separate Enhancer rider for relapse coverage",
      "Neither plan covers same-illness relapses under any circumstances",
      "BCC includes relapse coverage in its base plan; UCC requires the separate Enhancer rider",
      "UCC includes relapse coverage in its base plan; BCC requires a separate rider"
    ],
    correct: 2,
    explanation: "BCC builds relapse coverage into the base plan, while UCC separates it into the optional Enhancer rider at $7/month. This modular design is why UCC's base premium is lower.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (10 questions)
  // ============================================================

  {
    question: "A client has a GPP plan. You want to expose the vulnerability of merged death/CI/savings plans. Which question most effectively opens the conversation?",
    options: [
      "How much are you paying for your GPP plan each month?",
      "When was the last time you reviewed your coverage?",
      "If you claim early CI, what happens to your major CI coverage, death benefit, and surrender value?",
      "Are you aware that AIA has a better product available?"
    ],
    correct: 2,
    explanation: "This power question forces the client to realize that one early CI claim from a merged plan wipes out their death coverage, remaining CI protection, and surrender value all at once.",
    category: 'sales-angles'
  },

  {
    question: "You are using the 5-step pitch process. What should be the very first thing you show the client?",
    options: [
      "A table comparing UCC premiums against Prudential, Manulife, and Great Eastern",
      "The heart condition progression picture showing four separate claimable events",
      "Three coverage options (age 65, 75, and 85) with their respective premiums",
      "The Teladoc partnership benefits and specialist network"
    ],
    correct: 1,
    explanation: "Step 1 of the pitch shows one picture of the heart condition progression (coronary heart disease, bypass, heart attack, transplant) to illustrate the power of unlimited different-illness claims.",
    category: 'sales-angles'
  },

  {
    question: "You present three UCC coverage options: until age 65, 75, and 85. Using the Middle Ground close, how should you frame the recommendation?",
    options: [
      "Push hard for the age 85 option because it provides the longest coverage",
      "Recommend the cheapest option (age 65) to make the sale easier",
      "Present all three with trade-offs, then advise against extremes -- most clients find the middle option (age 75) balances good coverage with reasonable cost",
      "Let the client choose without any guidance to avoid being pushy"
    ],
    correct: 2,
    explanation: "The Middle Ground close leverages extremeness aversion -- the psychological tendency to avoid the cheapest and most expensive options -- by gently guiding toward the balanced middle option.",
    category: 'sales-angles'
  },

  {
    question: "A client chooses coverage until age 65 instead of 85, saving about $160/month. Using the Time Value of Money strategy, what growth potential should you illustrate?",
    options: [
      "The $160/month could grow to about $100k by age 65",
      "The $160/month could grow to about $200k by age 65, matching the coverage amount",
      "The $160/month could grow to about $388k by age 65 and potentially $1.5 million by age 85",
      "The $160/month should be kept in a savings account earning fixed interest"
    ],
    correct: 2,
    explanation: "By investing the $160/month premium savings, the fund could grow to approximately $388k by age 65 and $1.5 million by age 85 -- far exceeding the $200k coverage amount and accessible anytime.",
    category: 'sales-angles'
  },

  {
    question: "Why should the Premium Waiver (ECPWP) rider always be recommended, even though it is optional?",
    options: [
      "It significantly increases the advisor's commission payout",
      "AIA requires it for all UCC applications to be processed",
      "Without it, clients must continue paying premiums after a claim, and competitor agents will exploit this as the 'Premium Waiver Attack'",
      "It is the only rider that provides coverage for early-stage illnesses"
    ],
    correct: 2,
    explanation: "Without ECPWP, a client who claims must still pay premiums. Competitor agents specifically ask 'Did your agent tell you about premium waiver?' to undermine trust if this rider was not included.",
    category: 'sales-angles'
  },

  {
    question: "When comparing UCC to Prudential's CI plan, which specific restriction gives UCC a clear advantage?",
    options: [
      "Prudential does not cover any early-stage critical illnesses",
      "Prudential's plan has no premium waiver option available",
      "Prudential has a 'related illness' restriction that blocks subsequent heart-related claims after the first one",
      "Prudential limits coverage to age 65 only with no extension options"
    ],
    correct: 2,
    explanation: "Prudential's 'related illness' restriction means that after claiming for coronary heart disease, subsequent heart-related conditions may be blocked. UCC treats each heart condition as separately claimable.",
    category: 'sales-angles'
  },

  {
    question: "A client has an SFT plan that will terminate after one CI claim. What is the recommended strategy?",
    options: [
      "Cancel the SFT plan and replace it entirely with UCC",
      "Keep the SFT as-is since it provides adequate CI coverage",
      "Decouple coverage into pure CI (UCC) plus pure death plus pure investment for optimal protection",
      "Add riders to the existing SFT plan to increase its CI coverage"
    ],
    correct: 2,
    explanation: "The recommended approach is to decouple merged plans into separate pure CI (UCC), pure death, and pure investment products. This prevents one claim from wiping out all coverage types.",
    category: 'sales-angles'
  },

  {
    question: "Why is early detection becoming an increasingly important talking point when selling UCC?",
    options: [
      "Early detection eliminates the need for CI coverage altogether",
      "Early detection reduces UCC premiums for clients who get regular screenings",
      "Early detection means more early-stage claims are happening, and UCC's multi-stage coverage keeps protecting after an early claim",
      "Early detection allows clients to buy UCC at lower rates after diagnosis"
    ],
    correct: 2,
    explanation: "Medical advances detect CI earlier, leading to more early-stage claims. With merged plans this would terminate coverage, but UCC continues protecting through multiple stages and illnesses.",
    category: 'sales-angles'
  },

  {
    question: "What is the key advantage of Great Eastern's CI plan ceasing after 3 claims when positioning UCC?",
    options: [
      "Great Eastern's 3-claim limit is actually better because it keeps premiums low",
      "There is no advantage -- both plans have the same claim limits",
      "UCC has unlimited claims for different illnesses with no cap, while Great Eastern stops at 3 claims and a maximum 300% payout",
      "Great Eastern covers more illnesses despite the 3-claim limit"
    ],
    correct: 2,
    explanation: "UCC allows unlimited claims for different illnesses with no maximum payout cap, while Great Eastern ceases after just 3 claims with a maximum of 300% of sum assured.",
    category: 'sales-angles'
  },

  {
    question: "A client already has BCC. How should you position UCC relative to their existing coverage?",
    options: [
      "Recommend cancelling BCC since UCC is strictly superior",
      "UCC complements BCC by covering 46 additional illnesses (150 vs 104) with unlimited claims, creating layered protection",
      "Advise the client that BCC and UCC cannot be held simultaneously",
      "Suggest replacing BCC with UCC to avoid paying two premiums"
    ],
    correct: 1,
    explanation: "UCC is best positioned as complementary to BCC, not a replacement. UCC covers 46 more illnesses than BCC's 104 and offers unlimited claims vs BCC's 200% maximum payout.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (8 questions)
  // ============================================================

  {
    question: "A client says: 'Your unlimited claims feature sounds too good to be true. What is the catch?' What is the most transparent response?",
    options: [
      "There is no catch -- UCC truly covers everything unlimited with no restrictions",
      "The base plan covers unlimited different illnesses, but a second occurrence of the same illness needs the Enhancer rider at $7/month. Full transparency builds more trust than glossing over details.",
      "The catch is that premiums increase after each claim",
      "Unlimited claims only apply if you purchase all three riders together"
    ],
    correct: 1,
    explanation: "Being transparent about the distinction between different-illness and same-illness claims builds trust. The Enhancer at $7/month closes the gap affordably, and honesty strengthens the advisor relationship.",
    category: 'objection-handling'
  },

  {
    question: "A client objects: 'I will just use my savings if I get critically ill.' What is the strongest counter-argument?",
    options: [
      "Savings accounts earn too little interest to be useful for medical bills",
      "You should never use savings for any medical expenses under any circumstances",
      "A critical illness can cost $200k-$500k in treatment plus years of lost income. UCC protects your savings by providing a separate fund, keeping retirement and family finances intact.",
      "Your savings will run out within the first month of treatment"
    ],
    correct: 2,
    explanation: "Quantifying the potential cost ($200k-$500k plus lost income) and positioning UCC as savings protection rather than an expense reframes the client's perspective on the value of CI coverage.",
    category: 'objection-handling'
  },

  {
    question: "A client says: 'I am only 25 -- critical illness is an old person's problem.' How do you address this without being alarmist?",
    options: [
      "You are right, you probably do not need CI coverage until you are 40",
      "Premiums are cheapest at 25 -- about $50/month for $100k. Waiting 10 years means significantly higher premiums, and any health issue in between could make you uninsurable entirely.",
      "Statistics show that 50% of 25-year-olds will get a critical illness within 5 years",
      "Buy the maximum coverage now because your health will only get worse"
    ],
    correct: 1,
    explanation: "Focus on the financial advantage of buying young ($50/month at 25 vs much more at 35) and the insurability risk, rather than trying to scare the client about imminent illness.",
    category: 'objection-handling'
  },

  {
    question: "A client says: 'BCC is better because it refunds 100% of premiums at age 85.' How do you differentiate UCC?",
    options: [
      "Agree and recommend BCC instead since the premium refund is objectively better",
      "UCC will also offer a premium refund in a future product update",
      "UCC trades the refund for lower premiums and unlimited claims (vs BCC's 200% cap). Investing the premium savings can potentially build more than the refund amount. It depends on the client's priority: breadth of coverage or built-in refund.",
      "The premium refund from BCC is taxable, making it less valuable than it appears"
    ],
    correct: 2,
    explanation: "Position the trade-off honestly: UCC offers more illnesses (150 vs 104), unlimited claims (vs 200% cap), and lower premiums. The savings can be invested for potentially greater returns than the refund.",
    category: 'objection-handling'
  },

  {
    question: "A client's Prudential agent told them: 'Prudential covers related illnesses better than AIA.' How do you correct this?",
    options: [
      "Agree that Prudential has better related-illness coverage and offer a different selling point",
      "Tell the client their Prudential agent is dishonest and cannot be trusted",
      "Actually, Prudential's 'related illness' restriction blocks subsequent heart claims. Under UCC, coronary heart disease, bypass, heart attack, and transplant are each claimable separately with no related-illness restriction.",
      "Explain that related illness coverage is not important for most clients"
    ],
    correct: 2,
    explanation: "Correct the misconception factually: Prudential's restriction actually blocks related claims, while UCC allows each condition in a progression to be claimed separately after the 12-month reset.",
    category: 'objection-handling'
  },

  {
    question: "A client objects: 'The base plan requires separate riders -- that makes it feel incomplete.' What is the best reframe?",
    options: [
      "You are right, the base plan is incomplete without all three riders",
      "The modular design is intentional -- it keeps the base premium at $44/month and lets you customize to your exact needs. Not everyone needs every rider, so you only pay for what you want.",
      "All insurance plans require riders to function properly",
      "The riders will eventually be merged into the base plan in a future update"
    ],
    correct: 1,
    explanation: "Reframing the modular design as a benefit (customization and lower base cost) turns a perceived weakness into an advantage. The $44/month base price demonstrates the cost savings.",
    category: 'objection-handling'
  },

  {
    question: "A client says: 'My company group insurance already covers critical illness.' Why is this insufficient?",
    options: [
      "Group CI coverage is usually more comprehensive than individual plans like UCC",
      "Group CI coverage ends when you leave the company, is often limited in amount and illness types, and is not portable. UCC stays with you regardless of employment changes.",
      "Group insurance and UCC are interchangeable, so the client is correct",
      "Group CI coverage is only valid for workplace injuries and accidents"
    ],
    correct: 1,
    explanation: "Group CI insurance is tied to employment -- changing jobs or retrenchment means losing coverage. It is also typically limited in coverage amount and number of illnesses compared to UCC's 150.",
    category: 'objection-handling'
  },

  {
    question: "A client says: 'I want to think about it and maybe decide next year.' What response balances respect with urgency?",
    options: [
      "No problem, there is no rush. Insurance will always be available when you are ready.",
      "If you do not sign today, the offer expires and premiums will double.",
      "Every day without coverage is a day of risk. Premiums increase with age, and health changes can make you uninsurable. Let us schedule a follow-up in 3 days to address any remaining questions.",
      "I cannot hold this rate for you, so it must be today or never."
    ],
    correct: 2,
    explanation: "Respecting the client's decision while creating gentle urgency (aging and insurability risk) and securing a concrete follow-up date keeps the conversation alive without being pushy.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (6 questions)
  // ============================================================

  {
    question: "A 30-year-old couple both have SFT plans. You want to help them discover the coverage gap themselves. What is your opening move?",
    options: [
      "Immediately present UCC features and pricing to both of them",
      "Tell them their SFT plans are outdated and need replacing",
      "Ask: 'If either of you claims early CI from your SFT, what happens to your death coverage, major CI, and savings? After that claim, can you buy new CI coverage?' Let them discover the gap.",
      "Start with a detailed competitor comparison showing UCC vs their SFT"
    ],
    correct: 2,
    explanation: "Power questions help clients discover the vulnerability themselves, which is far more persuasive than telling them. SFT terminates after one claim, leaving them uninsurable.",
    category: 'roleplay'
  },

  {
    question: "A budget-conscious 35-year-old wants maximum CI protection for $60/month. What is your best recommendation?",
    options: [
      "UCC $200k until age 85 without any riders at about $55/month",
      "UCC $100k until age 65 with all three riders (Enhancer + Early CI + Premium Waiver) at approximately $57/month",
      "UCC $150k until age 75 with just the Enhancer rider",
      "BCC $100k until age 85 for the premium refund guarantee"
    ],
    correct: 1,
    explanation: "For a $60/month budget, $100k coverage until age 65 with all three essential riders at $57/month gives the most comprehensive protection: relapse coverage, early-stage coverage, and premium waiver.",
    category: 'roleplay'
  },

  {
    question: "A financially savvy client asks you to explain the heart condition progression claim example step by step. What is the correct sequence and outcome?",
    options: [
      "Heart attack at 100%, then transplant at 50% -- two claims totaling 150%",
      "Coronary heart disease, bypass surgery, heart attack, heart transplant -- four separate claims each after a 12-month reset, each paying out at the applicable stage percentage",
      "One lump-sum payout for the most severe heart condition diagnosed",
      "Three claims maximum for heart-related conditions, then coverage for heart issues ends"
    ],
    correct: 1,
    explanation: "UCC treats each heart condition as a separate claimable event: coronary heart disease (claim 1), bypass (claim 2 after 12 months), heart attack (claim 3), transplant (claim 4). This is the most powerful illustration of unlimited different-illness claims.",
    category: 'roleplay'
  },

  {
    question: "A client wants UCC but is skipping the Enhancer rider to save $7/month. How do you illustrate the real risk?",
    options: [
      "Respect their decision and process the application without the Enhancer",
      "Refuse to submit the application until they add the Enhancer",
      "Say: 'At $7/month, the Enhancer covers second occurrences of the same illness. Without it, if you survive cancer and it returns, the relapse has zero coverage. That is $7/month for peace of mind against a scenario that is statistically common.'",
      "Tell them cancer always comes back so they will definitely need it"
    ],
    correct: 2,
    explanation: "Framing the $7/month cost against the zero-coverage scenario for a cancer relapse makes the risk tangible. Cancer relapse is statistically common, making this rider essential rather than optional.",
    category: 'roleplay'
  },

  {
    question: "A client with existing Prudential CI coverage is hesitant because their Prudential agent warned against switching. How do you navigate this?",
    options: [
      "Tell the client to fire their Prudential agent immediately",
      "Agree that switching is risky and drop the recommendation",
      "Clarify you are not suggesting they cancel Prudential -- UCC complements it. Then ask: 'Does your Prudential plan have a related illness restriction? Let me show you what that means for heart conditions.'",
      "Offer to undercut Prudential's pricing with a special discount"
    ],
    correct: 2,
    explanation: "Positioning UCC as complementary rather than a replacement defuses the conflict. Then using the specific related-illness restriction educates the client on UCC's advantage without attacking the competitor.",
    category: 'roleplay'
  },

  {
    question: "A client earning $5,000/month asks whether $100k or $200k coverage is right for them. How do you guide the decision?",
    options: [
      "Always recommend the minimum $100k to keep premiums affordable",
      "CI coverage should replace 3-5 years of income. At $5,000/month, that means $180k-$300k. $200k provides about 3.3 years of income replacement, making it a reasonable starting point.",
      "The coverage amount does not matter -- the riders are what make the plan valuable",
      "Always recommend the maximum affordable coverage regardless of income"
    ],
    correct: 1,
    explanation: "The 3-5 years income replacement guideline provides a concrete framework. At $5,000/month income, $200k covers 3.3 years -- a data-driven recommendation that builds client confidence.",
    category: 'roleplay'
  }
];
