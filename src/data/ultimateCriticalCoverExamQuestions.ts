import type { ExamQuestion } from './proAchieverExamQuestions';

export const ultimateCriticalCoverExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "A client asks how many illnesses UCC covers. What is the canonical answer?",
    options: [
      "104 illnesses across early, intermediate, and severe stages",
      "200 illnesses but limited to severe stage only",
      "73 underlying critical illnesses across 150 condition-stage entries (42 Early + 35 Intermediate + 73 Major)",
      "75 illnesses across early and severe stages only"
    ],
    correct: 2,
    explanation: "Per Brochure p.13 totals row and PS p.3: UCC covers 73 underlying critical illnesses, generating 150 condition-stage entries split as 42 Early + 35 Intermediate + 73 Major. The Great Eastern 53-illness comparison from Day 1 / Video 1 is illustrative and time-bound -- always verify in iPOS.",
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
    question: "A prospect is comparing prices. Per the Day 1 / Video 1 illustrative comparison (Prudential equivalent at ~$56/month for the same profile), how should you frame UCC's price?",
    options: [
      "UCC would cost about $63/month -- roughly 11% more expensive",
      "UCC is illustratively ~11% cheaper based on Day 1 / Video 1 figures (e.g., ~$50/month for a 25-year-old male, $100k SA, paid to age 75) -- always verify the current iPOS quote because competitor pricing is time-bound and not in any AIA-canonical PDF",
      "UCC would cost about $53/month -- roughly 6% cheaper",
      "UCC would cost the same at $56/month"
    ],
    correct: 1,
    explanation: "Per Day 1: competitor pricing comparisons are illustrative and time-bound -- always verify in iPOS before quoting. The 11%-cheaper figure is not in any AIA-canonical PDF.",
    category: 'product-facts'
  },

  {
    question: "A client adds the Enhancer rider and asks what they would receive for a same-illness recurrence. What is the precise canonical answer?",
    options: [
      "100% of sum assured, same as the first occurrence",
      "75% of sum assured",
      "25% of sum assured",
      "Lower of 50% of cover or the Current Insured Amount per relapse, with a 2-year waiting period between claims, capped at 100% of base cover total -- and only on 5 named conditions: Re-diagnosed Major Cancer, Recurred Heart Attack, Recurred Stroke, Repeated Major Organ/Bone Marrow Transplant, Repeated Heart Valve Surgery"
    ],
    correct: 3,
    explanation: "Per Brochure p.4 and Enhancer p.6: the Ultimate Relapse Benefit is restricted to the 5 named conditions (e.g. it does NOT cover a recurrence of End Stage Liver Failure or Multiple Sclerosis), pays the lower of 50% of cover or the current insured amount, requires a 2-year waiting period between claims, and is capped at 100% of base cover total.",
    category: 'product-facts'
  },

  {
    question: "You are quoting a 20-year-old non-smoker with $100k coverage until age 65 plus all three riders. Using the Day 1 illustrative figures, what should you quote -- and why must you re-check iPOS?",
    options: [
      "About $44/month -- the riders are included free",
      "Approximately $57/month using Day 1 illustrative figures (base ~$44 + Enhancer ~$7 + Early CI ~$2 + ECPWP ~$4 at S$100K SA). ECPWP cost scales with sum assured -- e.g., Day 3 cites ~S$15/month (~S$168/year) for 25yo S$200K To-75. Always run the live iPOS quote before binding any number",
      "About $63/month -- base $50 plus Enhancer $7, Early CI $2, Premium Waiver $4",
      "About $72/month -- base $59 plus Enhancer $7, Early CI $2, Premium Waiver $4"
    ],
    correct: 1,
    explanation: "The $4/month ECPWP figure is illustrative for $100K SA. Day 3 cites ECPWP at ~S$15/month (~S$168/year) for the canonical 25yo S$200K To-Age-75 case, because ECPWP scales with sum assured. Always verify in iPOS.",
    category: 'product-facts'
  },

  {
    question: "How does UCC's payout structure split between major stage and earlier stages?",
    options: [
      "300% of sum assured, after which the policy terminates",
      "500% of sum assured across all stages",
      "200% of sum assured with a premium refund",
      "Unlimited at MAJOR STAGE across DIFFERENT illnesses (with restoration to 100% if the policy is in force 12 months after the date of the latest diagnosed CI), while early and intermediate stages are capped at 500% combined of coverage amount and S$350,000 per-life on the same CI across all UCC policies"
    ],
    correct: 3,
    explanation: "Per Brochure footnote 1 (p.14) and PS p.4 / p.7: the unlimited mechanic is major-stage-only across different illnesses; early+intermediate are capped at 500% combined and S$350,000 per-life on the same CI. Restoration to 100% applies when the policy is in force 12 months after the latest diagnosed CI.",
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
    question: "Which medical service partnership is exclusive to UCC policyholders, and what is its actual scope?",
    options: [
      "Raffles Medical priority access covering all conditions",
      "Mount Elizabeth specialist network for surgical conditions",
      "Teladoc Health, covering ALL conditions under UCC EXCEPT Terminal Illness, covered Mental Illnesses, Emergency Care, and any urgent invasive or urgent surgical procedures (Brochure p.6) -- via a network of 50,000+ specialists worldwide",
      "National University Hospital second opinion service for cancer patients only"
    ],
    correct: 2,
    explanation: "Per Brochure p.6: Teladoc Health covers all UCC-covered conditions EXCEPT Terminal Illness, covered Mental Illnesses and Emergency Care, and any medical conditions of urgent invasive and/or urgent surgical procedures. The narrower 'cancer/cardio/neuro' framing is incorrect.",
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
    question: "How does UCC structure same-illness relapse coverage in its own canonical documents?",
    options: [
      "Both UCC and BCC cover relapse the same way",
      "Neither plan covers same-illness relapses",
      "UCC's relapse coverage is provided by the optional Enhancer's Ultimate Relapse Benefit (5 named conditions, 2-year waiting, lower of 50% of cover or current insured amount, capped at 100% of base cover total). BCC (Beyond Critical Care) is a separate product not documented in the UCC source-resources -- always cite BCC's own PDFs for any cross-product comparison",
      "UCC includes relapse coverage in its base plan; BCC requires a separate rider"
    ],
    correct: 2,
    explanation: "Per Brochure p.4 and Enhancer p.6: UCC's relapse coverage sits in the optional Enhancer. BCC is a separate product not documented in the UCC source-resources -- the 104-illness figure and built-in-refund framing must be sourced from BCC's own PDFs, not asserted from the UCC bank.",
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
    question: "How should you compliantly position UCC's claim structure against Great Eastern's CI plan?",
    options: [
      "Great Eastern's 3-claim limit is actually better because it keeps premiums low",
      "There is no advantage -- both plans have the same claim limits",
      "Lead with UCC's canonical structure: unlimited claims at MAJOR stage across different illnesses (early+intermediate capped at 500% combined / S$350,000 per-life on the same CI), with restoration to 100% if the policy is in force 12 months after the date of the latest diagnosed CI. The Great Eastern '~53 illnesses, 3-claim limit, 300% cap, 2x reset' figures come from Day 1 / Video 1 -- illustrative and time-bound, always verify in iPOS",
      "Great Eastern covers more illnesses despite the 3-claim limit"
    ],
    correct: 2,
    explanation: "Lead with UCC's canonical numbers (Brochure p.13, PS p.4 / p.7). Day 1 / Day 4 explicitly flag the GE 53-illness, 3-claim, 300% cap figures as illustrative -- they are not in any AIA-canonical PDF.",
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
    question: "A financially savvy client asks you to walk through the heart condition staircase step by step using canonical UCC condition names. What is the correct sequence?",
    options: [
      "Heart attack at 100%, then transplant at 50% -- two claims totaling 150%",
      "Other Serious Coronary Artery Disease (claim 1), Coronary Artery By-pass Surgery (claim 2), Heart Attack of Specified Severity (claim 3), Major Organ / Bone Marrow Transplantation -- heart (claim 4). Each is a separate covered CI at major stage; the policy is restored to 100% if it is in force 12 months after the date of the latest diagnosed CI",
      "One lump-sum payout for the most severe heart condition diagnosed",
      "Three claims maximum for heart-related conditions, then coverage for heart issues ends"
    ],
    correct: 1,
    explanation: "Per Brochure p.11-13 and PS p.7: 'coronary heart disease' is not the precise covered name -- use 'Other Serious Coronary Artery Disease' or 'Coronary Artery Disease'. A heart transplant claim is paid under 'Major Organ / Bone Marrow Transplantation' (item 36); there is no standalone 'Heart Transplant' CI. Restoration runs from the date of the latest diagnosed CI.",
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
