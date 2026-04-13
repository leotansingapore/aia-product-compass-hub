import type { ExamQuestion } from './proAchieverExamQuestions';

export const solitairePaExamQuestions: ExamQuestion[] = [

  // ============================================================
  // PRODUCT FACTS (12 questions)
  // ============================================================

  {
    question: "A client on Plan 1 suffers a major dismemberment after 6 claim-free years. What is the maximum payout including the renewal bonus?",
    options: [
      "$300,000",
      "$390,000",
      "$330,000",
      "$360,000"
    ],
    correct: 1,
    explanation: "Plan 1 major dismemberment is $300,000. After 6 claim-free years, the renewal bonus on Features 1-5 reaches the maximum of 30%. $300,000 x 1.30 = $390,000.",
    category: 'product-facts'
  },

  {
    question: "Which of the following would NOT trigger a reset of the renewal bonus on Features 1-5?",
    options: [
      "A claim for burns under Feature 4",
      "A claim for medical reimbursement under Feature 6",
      "A claim for burns and scalds under Feature 4",
      "Both A and C would reset the bonus"
    ],
    correct: 1,
    explanation: "The renewal bonus only resets if there is a claim under Feature 4 (burns/scalds). Claims under Feature 6 (medical reimbursement) or any other feature do not affect the bonus accumulation.",
    category: 'product-facts'
  },

  {
    question: "A Plan 4 policyholder dies in a taxi accident. What is the total death payout?",
    options: [
      "$750,000",
      "$2,250,000",
      "$1,500,000",
      "$1,000,000"
    ],
    correct: 2,
    explanation: "Plan 4 accidental death is $750,000. Feature 5 doubles the payout for public or private transport accidents. $750,000 + $750,000 = $1,500,000.",
    category: 'product-facts'
  },

  {
    question: "How much MORE does Plan 4 cost per day compared to Plan 1?",
    options: [
      "About $3.50 more per day",
      "About $2.00 more per day",
      "About $1.73 more per day",
      "About $1.00 more per day"
    ],
    correct: 2,
    explanation: "Plan 1 costs about $0.62/day ($224/yr) and Plan 4 costs about $2.35/day ($855/yr). The difference is approximately $1.73 per day for 7.5x the coverage.",
    category: 'product-facts'
  },

  {
    question: "A policyholder suffers three separate accidents in one year -- a fracture, a sprain, and food poisoning. How much total medical reimbursement can they claim under Feature 6?",
    options: [
      "$5,000 total for all three accidents",
      "$10,000 total across two claims",
      "$15,000 -- up to $5,000 per accident with unlimited claims",
      "$3,000 total with a per-year cap"
    ],
    correct: 2,
    explanation: "Feature 6 provides up to $5,000 per accident with unlimited claims per year. Three accidents means up to $5,000 each, for a potential total of $15,000.",
    category: 'product-facts'
  },

  {
    question: "Which step in the AIA Solitaire PA application process comes first?",
    options: [
      "Financial Health Review",
      "Medical examination",
      "SingPass verification",
      "Blood test and health screening"
    ],
    correct: 2,
    explanation: "The application starts with SingPass verification, followed by quotation generation and submission. No FHR or medical checkups are required at any stage.",
    category: 'product-facts'
  },

  {
    question: "A policyholder on Plan 2 visits a chiropractor after a sports injury. Which feature covers this treatment?",
    options: [
      "Feature 6 -- Medical Reimbursement",
      "Feature 5 -- Double Transport Payout",
      "Feature 3 -- Total Permanent Disability",
      "Feature 7 -- TCM and Chiropractor"
    ],
    correct: 3,
    explanation: "Feature 7 specifically covers Traditional Chinese Medicine (TCM) and chiropractor treatments with a separate limit from Feature 6's main medical reimbursement.",
    category: 'product-facts'
  },

  {
    question: "What is the annual premium for Plan 3, and what does it work out to per month?",
    options: [
      "$500/year, about $42/month",
      "$365/year, about $30/month",
      "$600/year, about $50/month",
      "$700/year, about $58/month"
    ],
    correct: 2,
    explanation: "Plan 3 costs $600/year, which is approximately $50/month. This sits between Plan 2 ($365/yr) and Plan 4 ($855/yr).",
    category: 'product-facts'
  },

  {
    question: "Which of the following is an optional rider for AIA Solitaire PA?",
    options: [
      "Critical Illness Rider",
      "Hospital Cash Benefit",
      "Fracture Cover",
      "Dental Expense Rider"
    ],
    correct: 2,
    explanation: "The three optional riders are Disability Income Benefit, Extended Medical Reimbursement, and Fracture Cover. Critical illness, hospital cash, and dental are not available as riders.",
    category: 'product-facts'
  },

  {
    question: "A policyholder is unable to eat, wash, or walk after an accident. What rider would provide monthly payouts?",
    options: [
      "Extended Medical Reimbursement",
      "Fracture Cover",
      "Feature 3 -- TPD",
      "Disability Income Benefit"
    ],
    correct: 3,
    explanation: "The Disability Income Benefit rider provides monthly payouts for up to 10 years when the insured cannot perform 2 or more Activities of Daily Living such as eating, washing, or walking.",
    category: 'product-facts'
  },

  {
    question: "A Singaporean on holiday in Europe has a skiing accident. Is this covered by AIA Solitaire PA?",
    options: [
      "No -- only accidents in Singapore are covered",
      "Only if the policyholder purchased the overseas rider",
      "Yes -- AIA Solitaire PA provides global coverage 24/7 and covers recreational sports",
      "Only emergency treatment is covered overseas"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA provides global 24/7 coverage and covers amateur/recreational sports injuries. A skiing accident in Europe would be fully covered.",
    category: 'product-facts'
  },

  {
    question: "Which of these events qualifies as a covered accident under AIA Solitaire PA?",
    options: [
      "A heart attack during exercise",
      "Chronic lower back pain from poor posture",
      "A mosquito bite leading to dengue fever",
      "Injuries from a professional boxing match"
    ],
    correct: 2,
    explanation: "Insect bites including dengue are covered because they are unexpected and unintentional. Heart attacks are illnesses, chronic pain is not accidental, and professional sports are excluded.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (10 questions)
  // ============================================================

  {
    question: "When a client has both a hospital plan and a term life plan, what is the correct way to position AIA Solitaire PA?",
    options: [
      "As a replacement for the hospital plan",
      "As a cheaper alternative to term life",
      "As complementary coverage filling the outpatient accident gap between inpatient and death coverage",
      "As unnecessary since the client already has sufficient coverage"
    ],
    correct: 2,
    explanation: "Hospital plans cover inpatient, term life covers death/TPD, but neither covers outpatient accident treatments. PA fills this specific gap as a complement, not a replacement.",
    category: 'sales-angles'
  },

  {
    question: "In the recommended sales flow, what is the correct sequence of steps?",
    options: [
      "Compare plans, share stories, highlight AIA service, break down cost, close",
      "Position as complement, share stories, highlight AIA service, compare plans, break down daily cost, close",
      "Share stories, compare plans, close",
      "Break down daily cost, position as complement, close"
    ],
    correct: 1,
    explanation: "The full recommended flow is: position as complement -> share stories -> highlight AIA service (Plus app) -> compare plans -> break down daily cost -> compare to daily spending -> close.",
    category: 'sales-angles'
  },

  {
    question: "Why does the probability argument make PA coverage compelling to sell?",
    options: [
      "PA covers high-probability, low-impact events like death and TPD",
      "PA covers the lowest-probability events at the lowest price",
      "Minor accidents have the highest probability of occurring, and PA covers them at a fraction of what Death/TPD costs",
      "PA and Death/TPD cover the same probability of events"
    ],
    correct: 2,
    explanation: "Death/TPD = very low probability. Major hospitalization = low probability. Minor accidents = very high probability. PA covers the most likely events at the lowest cost ($20/month vs $100-200/month).",
    category: 'sales-angles'
  },

  {
    question: "What makes the PA claim threshold fundamentally different from Death/TPD coverage?",
    options: [
      "PA requires hospitalization to claim; Death/TPD does not",
      "PA and Death/TPD have identical claim thresholds",
      "Death/TPD only requires losing one limb to claim",
      "PA pays for one cut, one finger, or one eye -- Death/TPD requires losing two limbs or two eyes"
    ],
    correct: 3,
    explanation: "PA has a much lower claim threshold. One finger, one eye, or one cut qualifies for a PA claim. Death/TPD typically requires losing two arms, two legs, or two eyes.",
    category: 'sales-angles'
  },

  {
    question: "A client earns $5,000/month and spends $6 daily on lunch. How should you frame Plan 1's cost?",
    options: [
      "Compare it to their monthly salary to show it is a small percentage",
      "Point out that Plan 1 costs less than their daily lunch -- just 62 cents a day, cheaper than an MRT fare",
      "Tell them Plan 1 is the cheapest insurance in Singapore",
      "Compare it to their annual tax payment"
    ],
    correct: 1,
    explanation: "The daily cost framing works best: 62 cents/day is less than an MRT fare, bubble tea, or coffee. Comparing to everyday spending makes the cost feel negligible.",
    category: 'sales-angles'
  },

  {
    question: "What closing technique does the recommended sales flow use?",
    options: [
      "The urgency close -- 'This offer expires today'",
      "The trial close -- 'Try it for one month free'",
      "The assumptive close -- 'Which plan do you prefer?'",
      "The discount close -- 'I can offer you 10% off'"
    ],
    correct: 2,
    explanation: "The recommended closing question is 'Which plan do you prefer?' -- an assumptive close that frames the decision as which plan to choose, not whether to buy at all.",
    category: 'sales-angles'
  },

  {
    question: "Why should advisors present all four plans rather than only recommending Plan 1?",
    options: [
      "Plan 1 is being discontinued by AIA",
      "Plan 1 does not include medical reimbursement",
      "Higher plans offer disproportionately more value -- 3.8x the price of Plan 1 yields 7.5x the coverage at Plan 4",
      "Commission is only paid on Plan 3 and Plan 4"
    ],
    correct: 2,
    explanation: "The value ratio improves dramatically with higher plans. Plan 4 costs 3.8x Plan 1 but provides 7.5x the coverage. Advisors should present this comparison and let clients choose.",
    category: 'sales-angles'
  },

  {
    question: "What three factors contribute to AIA Solitaire PA's high closing rates?",
    options: [
      "High coverage limits, low deductibles, and free riders",
      "Celebrity endorsements, limited-time offers, and referral bonuses",
      "No FHR required, no medical checkups, and simple SingPass application",
      "Guaranteed returns, cash value, and premium waivers"
    ],
    correct: 2,
    explanation: "The streamlined process -- no Financial Health Review, no medical checkups, and SingPass verification -- removes friction and enables very high closing rates.",
    category: 'sales-angles'
  },

  {
    question: "At what point in the sales flow should the AIA Plus app be mentioned?",
    options: [
      "As the very first topic before discussing any plan details",
      "Only after the client has signed up for a plan",
      "After sharing claim stories and before comparing plans -- as a service advantage",
      "Only if the client specifically asks about claims"
    ],
    correct: 2,
    explanation: "The AIA Plus app and 5-minute self-claiming is step 3 in the sales flow -- after positioning and stories, before plan comparison. It builds confidence in AIA's service.",
    category: 'sales-angles'
  },

  {
    question: "How does the recurring commission structure benefit advisors long-term?",
    options: [
      "Advisors earn a one-time bonus of 50% on the first premium",
      "Commission is paid for the first 3 years only",
      "The ~30% commission recurs for the life of the policy, creating a growing income stream as the client base expands",
      "Commission doubles every year for 5 years"
    ],
    correct: 2,
    explanation: "AIA Solitaire PA pays approximately 30% recurring commission for the life of the policy. As advisors sell more policies, this creates a compounding passive income stream.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (8 questions)
  // ============================================================

  {
    question: "Client: 'My company gives me group accident coverage already.' What is the strongest counter-argument?",
    options: [
      "Group coverage provides higher limits than personal PA",
      "Company group coverage ends when you leave or change jobs -- personal PA stays with you regardless of employment",
      "Group coverage and personal PA are identical products",
      "Company coverage is always sufficient for accident protection"
    ],
    correct: 1,
    explanation: "Company group PA is tied to employment. When the client changes jobs or retires, that coverage disappears. Personal PA provides continuous protection regardless of career changes.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'I have been setting aside $70 a month for emergencies instead of buying insurance.' How should you reframe this?",
    options: [
      "Agree that self-insurance is a valid strategy and move on",
      "Tell them their emergency fund is useless",
      "Point out that for $20/month (Plan 1), PA gives up to $5,000 per accident with unlimited claims -- far more protection than $70/month in savings could provide",
      "Suggest they increase their monthly savings to $200 instead"
    ],
    correct: 2,
    explanation: "Self-insuring at $70/month provides limited coverage. For just $20/month, PA guarantees up to $5,000 per accident with unlimited claims -- the math strongly favors PA.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'The $5,000 per-accident limit on Feature 6 is too low.' What is the best response?",
    options: [
      "Agree and suggest they look at a competitor product",
      "Explain that $5,000 is the maximum AIA can offer",
      "$5,000 covers most outpatient treatments, claims are unlimited per year, and the Extended Medical Reimbursement rider is available for higher limits",
      "Tell them to claim from their hospital plan for the excess amount"
    ],
    correct: 2,
    explanation: "$5,000 per accident covers the vast majority of outpatient treatments. Combined with unlimited annual claims and the optional Extended Medical Reimbursement rider, the coverage is comprehensive.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'I am 35 and have never had an accident. Why start paying now?' Which response uses both the probability argument and the renewal bonus?",
    options: [
      "'Accidents can happen to anyone. The earlier you start, the sooner you build the 5% annual renewal bonus -- up to 30% more coverage over 6 years. At 62 cents a day, it is peace of mind you can easily afford.'",
      "'You are right, you probably will not need it.'",
      "'Statistics show 35-year-olds have the most accidents.'",
      "'The premium increases after age 40, so buy now.'"
    ],
    correct: 0,
    explanation: "This combines the unpredictability argument with the concrete renewal bonus incentive (5% per year, up to 30%) and the minimal daily cost to create a compelling case for starting early.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'My MediSave should cover accident expenses.' What is the factual correction?",
    options: [
      "MediSave covers all accident-related expenses including outpatient",
      "MediSave can only be used for hospitalization and approved procedures -- outpatient accident treatments like stitches, X-rays, and physiotherapy are not covered",
      "MediSave is being replaced by PA insurance",
      "MediSave covers the same things as PA coverage"
    ],
    correct: 1,
    explanation: "MediSave has strict usage rules and primarily covers hospitalization and approved procedures. Outpatient treatments -- which are the most common accident expenses -- are not claimable from MediSave.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'I do not trust insurance companies to pay out.' How should you address this trust concern?",
    options: [
      "Tell them all insurance companies pay claims equally",
      "Suggest they do not need insurance then",
      "Offer to personally guarantee the payout",
      "Highlight AIA's reputation as one of Asia's largest insurers, plus the AIA Plus app where they can self-claim in 5 minutes and track claim status in real time"
    ],
    correct: 3,
    explanation: "Address the trust objection with AIA's established reputation, the transparent self-claiming process via the AIA Plus app, and real-time claim tracking -- all of which demonstrate accountability.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'My spouse thinks we already have enough insurance.' What is the recommended approach?",
    options: [
      "Offer to include the spouse in the conversation so both partners can see how PA fills the outpatient gap at just 62 cents a day",
      "Tell the client to sign up without their spouse knowing",
      "Agree and end the conversation",
      "Pressure the client to override their spouse's opinion"
    ],
    correct: 0,
    explanation: "Offer to involve the spouse so both partners understand the specific gap PA fills. The low daily cost (62 cents) makes it an easy conversation once the value is clear.",
    category: 'objection-handling'
  },

  {
    question: "Client: 'Can I claim from both my hospital plan and this PA plan for the same accident?' What is the correct answer?",
    options: [
      "No -- you must choose one plan to claim from",
      "Only if the total claim is under $10,000",
      "Only the hospital plan will pay for accident-related claims",
      "Yes -- the hospital plan covers inpatient costs while PA covers outpatient follow-up, so both can pay for the same accident"
    ],
    correct: 3,
    explanation: "Hospital plans and PA plans cover different aspects of the same accident. Inpatient hospitalization claims go to the hospital plan, while outpatient treatment claims go to PA.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (6 questions)
  // ============================================================

  {
    question: "A hawker stall owner who works with hot oil daily asks if burns from cooking are covered. What is the most effective response?",
    options: [
      "Suggest they get workers' compensation insurance instead",
      "Tell them cooking burns are excluded from PA coverage",
      "Explain that Feature 4 covers burns and scalds as a lump sum, Feature 6 covers medical treatment up to $5,000 per accident with unlimited claims -- making PA ideal for their occupation",
      "Recommend they switch to a less dangerous occupation"
    ],
    correct: 2,
    explanation: "Feature 4 specifically covers burns and scalds with a lump sum payout, and Feature 6 covers medical expenses. For someone working around hot oil daily, this is directly relevant.",
    category: 'roleplay'
  },

  {
    question: "A couple is comparing Plan 2 ($365/yr) and Plan 4 ($855/yr). The wife says Plan 4 is too expensive. What value argument should you use?",
    options: [
      "Tell her Plan 2 is good enough and stop pushing Plan 4",
      "Offer a discount on Plan 4",
      "Explain that the jump from Plan 2 to Plan 4 costs about $1.35 more per day but increases dismemberment coverage to $2.25M -- 3.8x the price of Plan 1 for 7.5x the coverage",
      "Tell her Plan 4 is cheaper than Plan 2 in the long run"
    ],
    correct: 2,
    explanation: "Frame the cost difference in daily terms ($1.35/day more) while emphasizing the disproportionate coverage increase. The 3.8x price for 7.5x coverage ratio is the key value argument.",
    category: 'roleplay'
  },

  {
    question: "An elderly client's daughter asks: 'My 75-year-old father falls frequently. Can he still get coverage and is the application process complicated?' What is the best response?",
    options: [
      "'At 75, the premiums would be prohibitively expensive.'",
      "'Your father is too old for personal accident coverage.'",
      "'He should rely on government healthcare subsidies instead.'",
      "'AIA Solitaire PA covers him up to age 80 -- perfect for fall risk. No medical checkup needed, just SingPass verification. This protects his savings from outpatient costs like X-rays, physiotherapy, and fracture treatment.'"
    ],
    correct: 3,
    explanation: "Coverage extends to age 80, no medical checkup is required, and the SingPass application is simple. For elderly clients with fall risks, outpatient treatment costs are the key concern PA addresses.",
    category: 'roleplay'
  },

  {
    question: "A young professional says: 'I cycle to work daily and play soccer on weekends. Last month I spent $2,500 on a knee injury that my hospital plan did not cover.' How should you respond?",
    options: [
      "'Your hospital plan should have covered that -- you should file a complaint.'",
      "'Hospital plans only cover inpatient stays. Your $2,500 outpatient treatment would have been fully covered under Feature 6, which pays up to $5,000 per accident. Cycling and soccer injuries are covered. All this from just 62 cents a day.'",
      "'You should stop cycling and playing soccer to avoid injuries.'",
      "'PA coverage would not have helped with a knee injury.'"
    ],
    correct: 1,
    explanation: "Use the client's real experience to demonstrate the exact gap. Their $2,500 is well within the $5,000 per-accident limit. Recreational sports are covered, and the daily cost framing makes it an easy decision.",
    category: 'roleplay'
  },

  {
    question: "A new mother on a tight budget says she cannot afford any more premiums with the baby. How should you address both the budget concern and the need for coverage?",
    options: [
      "Agree that insurance is not a priority with a new baby",
      "Pressure her to buy Plan 4 for maximum protection",
      "Acknowledge the tight budget, then explain Plan 1 is just 62 cents a day -- less than a packet drink -- and with a baby who will soon crawl and walk, outpatient accident coverage becomes critical",
      "Suggest she wait until the baby is older to consider insurance"
    ],
    correct: 2,
    explanation: "Acknowledge the budget concern first, then reframe with the daily cost (62 cents). Connect coverage to the baby's upcoming developmental milestones where accident risk increases significantly.",
    category: 'roleplay'
  },

  {
    question: "A grab driver who spends 10+ hours daily on the road asks what extra protection he gets for transport accidents. What should you highlight?",
    options: [
      "Tell him PA does not provide any extra protection for drivers",
      "Suggest he get commercial vehicle insurance instead of PA",
      "Explain that Feature 5 doubles the accidental death payout for private transport accidents -- under Plan 4, that means $750K + $750K = $1.5M, making this feature especially valuable for someone on the road all day",
      "Tell him only public transport passengers get the double payout"
    ],
    correct: 2,
    explanation: "Feature 5 covers both public and private transport accidents with a double payout. For a grab driver spending 10+ hours on the road daily, this benefit is highly relevant and compelling.",
    category: 'roleplay'
  }
];
