import type { StudyQuestion } from './proAchieverStudyBank';

export const guaranteedProtectPlusStudyBank: StudyQuestion[] = [
  // ============================================================
  // PRODUCT FACTS (45 questions) -- Q1-Q45
  // ============================================================

  // Q1 -- correct: 0
  {
    question: "What type of insurance product is AIA Guaranteed Protect Plus (GPP)?",
    options: [
      "A whole life participating plan covering death, TPD and critical illness with cash value",
      "A pure term life plan with no cash value",
      "A regular premium Investment-Linked Policy (ILP)",
      "A standalone hospitalisation and surgical plan"
    ],
    correct: 0,
    explanation: "GPP is a participating whole life plan that covers death, TPD and (with a rider) critical illness, while accumulating guaranteed and non-guaranteed cash value.",
    category: 'product-facts'
  },

  // Q2 -- correct: 2
  {
    question: "Up to what age does GPP's accumulator (base) component provide coverage?",
    options: [
      "Age 65",
      "Age 75",
      "Age 100",
      "Age 85"
    ],
    correct: 2,
    explanation: "The accumulator is the whole-life base and stays in force until age 100, regardless of the multiplier drop-off chosen.",
    category: 'product-facts'
  },

  // Q3 -- correct: 1
  {
    question: "Which two age options does the policyholder have for the GPP booster (multiplier) drop-off?",
    options: [
      "Age 60 or 70",
      "Age 65 or 75",
      "Age 70 or 80",
      "Age 55 or 65"
    ],
    correct: 1,
    explanation: "The booster expires at either age 65 or age 75 -- the client picks one at policy inception.",
    category: 'product-facts'
  },

  // Q4 -- correct: 3
  {
    question: "Which three multiplier options does GPP offer on the boosted coverage?",
    options: [
      "1x, 2x and 3x",
      "2x, 4x and 6x",
      "3x, 5x and 10x",
      "2x, 3x and 5x"
    ],
    correct: 3,
    explanation: "GPP boosted coverage comes in three flavours: 2x, 3x or 5x of the accumulator -- with 3x being the recommended default.",
    category: 'product-facts'
  },

  // Q5 -- correct: 0
  {
    question: "Which three premium payment terms does GPP allow?",
    options: [
      "15, 20 or 25 years",
      "10, 15 or 20 years",
      "5, 10 or 20 years",
      "Pay until age 65 only"
    ],
    correct: 0,
    explanation: "GPP is a limited-pay whole life plan: clients pay for 15, 20 or 25 years and stay covered until age 100.",
    category: 'product-facts'
  },

  // Q6 -- correct: 2
  {
    question: "On a 3x multiplier with $150,000 total coverage, what is the breakdown between accumulator and booster?",
    options: [
      "$75,000 base + $75,000 booster",
      "$30,000 base + $120,000 booster",
      "$50,000 base + $100,000 booster",
      "$100,000 base + $50,000 booster"
    ],
    correct: 2,
    explanation: "On 3x, the accumulator is one-third of total coverage. So $150k total = $50k base + $100k booster.",
    category: 'product-facts'
  },

  // Q7 -- correct: 1
  {
    question: "On a 5x multiplier with $150,000 total coverage, what is the accumulator amount?",
    options: [
      "$50,000",
      "$30,000",
      "$75,000",
      "$15,000"
    ],
    correct: 1,
    explanation: "On 5x, the accumulator is one-fifth of total coverage -- so $150k total leaves only $30k as the lifelong base after the booster drops.",
    category: 'product-facts'
  },

  // Q8 -- correct: 3
  {
    question: "On a 2x multiplier with $150,000 total coverage, what is the accumulator amount?",
    options: [
      "$30,000",
      "$50,000",
      "$100,000",
      "$75,000"
    ],
    correct: 3,
    explanation: "On 2x, the accumulator is half the total coverage -- $75k base + $75k booster -- giving the strongest residual coverage post drop-off.",
    category: 'product-facts'
  },

  // Q9 -- correct: 0
  {
    question: "Until what age does TPD coverage apply under GPP, regardless of the multiplier drop-off chosen?",
    options: [
      "Age 70",
      "Age 65",
      "Age 75",
      "Age 100"
    ],
    correct: 0,
    explanation: "TPD coverage caps at age 70 in GPP, even if the booster runs to 75 -- always flag this when comparing against accident plans.",
    category: 'product-facts'
  },

  // Q10 -- correct: 2
  {
    question: "Before age 65, what does GPP's TPD definition require?",
    options: [
      "Loss of any one limb only",
      "Inability to perform 1 of 6 ADLs",
      "Loss of both eyes, two limbs, or one eye plus one limb, AND incapable of any work for at least 6 consecutive months",
      "Any disability lasting more than 30 days"
    ],
    correct: 2,
    explanation: "GPP's pre-65 TPD is very strict: total loss of two major body parts plus an inability to do any work for 6+ months -- which is why a separate accident plan is essential.",
    category: 'product-facts'
  },

  // Q11 -- correct: 1
  {
    question: "From age 65 onwards, how is TPD assessed under GPP?",
    options: [
      "Same loss-of-limbs/eyes definition as pre-65",
      "Inability to perform at least 2 of 6 Activities of Daily Living for at least 6 months",
      "Doctor's certification of permanent unemployment",
      "Loss of all 6 ADLs for 12 months"
    ],
    correct: 1,
    explanation: "Post-65, GPP switches to an ADL test -- failing at least 2 of the 6 ADLs (washing, dressing, transferring, mobility, toileting, feeding) for at least 6 months.",
    category: 'product-facts'
  },

  // Q12 -- correct: 3
  {
    question: "How many critical illnesses does the optional Early CI rider on GPP cover, plus how many special conditions?",
    options: [
      "73 illnesses, 0 special conditions",
      "100 illnesses, 10 special conditions",
      "37 illnesses, 5 special conditions",
      "Around 150 illnesses plus 15 special conditions"
    ],
    correct: 3,
    explanation: "The Early CI rider covers approximately 150 critical illnesses across early/intermediate/major stages, plus 15 special conditions -- comprehensive vs LIA's 37 standard CIs.",
    category: 'product-facts'
  },

  // Q13 -- correct: 0
  {
    question: "How many major-stage critical illness conditions does the Major CI rider cover under GPP?",
    options: [
      "73 conditions",
      "37 conditions",
      "150 conditions",
      "100 conditions"
    ],
    correct: 0,
    explanation: "The Major CI rider covers 73 conditions -- almost double LIA's 37 standard major CIs.",
    category: 'product-facts'
  },

  // Q14 -- correct: 2
  {
    question: "What is the maximum claim per episode for early/intermediate stage CI under the Early CI rider?",
    options: [
      "$100,000",
      "$250,000",
      "$350,000",
      "Unlimited (subject to sum assured)"
    ],
    correct: 2,
    explanation: "Early/intermediate CI claims are capped at $350,000 per episode, even if the rider sum assured is higher. Major-stage CI is not capped per episode.",
    category: 'product-facts'
  },

  // Q15 -- correct: 1
  {
    question: "How does the CI rider's acceleration feature affect the death benefit?",
    options: [
      "It does not -- death benefit is paid in full on top",
      "Each CI claim reduces the remaining death benefit by the claimed amount",
      "It cancels the death benefit entirely",
      "It doubles the death benefit"
    ],
    correct: 1,
    explanation: "GPP's CI riders are accelerated: a CI payout reduces the death benefit by the same amount. So $500k death + $100k CI claim leaves $400k death cover remaining.",
    category: 'product-facts'
  },

  // Q16 -- correct: 3
  {
    question: "What payout percentage applies to a special-condition claim under the Early CI rider, and what is the cap?",
    options: [
      "100%, capped at $50,000",
      "50%, capped at $25,000",
      "25%, capped at $50,000",
      "20% of insured amount, capped at $25,000 per condition"
    ],
    correct: 3,
    explanation: "Special conditions pay 20% of the rider sum assured, capped at $25,000 per condition, and do not reduce the main ECI/basic sum assured.",
    category: 'product-facts'
  },

  // Q17 -- correct: 0
  {
    question: "What is the total CI coverage cap across all AIA CI policies for major-stage critical illness?",
    options: [
      "$3 million",
      "$1 million",
      "$5 million",
      "$10 million"
    ],
    correct: 0,
    explanation: "Major-stage CI has no per-episode cap, but total coverage across all AIA CI policies is capped at $3 million.",
    category: 'product-facts'
  },

  // Q18 -- correct: 1
  {
    question: "When is the GPP Premium Pause Option available, and what is its core eligibility rule?",
    options: [
      "Anytime after the first policy year, no work history required",
      "After 3 years of premiums paid, on involuntary retrenchment, with at least 6 months of prior employment",
      "Only after age 55, regardless of employment status",
      "Whenever the policyholder requests it"
    ],
    correct: 1,
    explanation: "Premium Pause requires 3 years of premiums paid, involuntary retrenchment, and at least 6 months of prior employment, plus a 2-month deferment period.",
    category: 'product-facts'
  },

  // Q19 -- correct: 2
  {
    question: "How does the Premium Pause Option actually work financially?",
    options: [
      "Premiums are waived permanently with no repayment",
      "AIA pays premiums on the client's behalf and writes them off",
      "Up to 12 months of premiums are paused as an interest-free loan that must be repaid; interest accrues if not repaid in the next 12 months",
      "The policy is converted to a paid-up plan with reduced sum assured"
    ],
    correct: 2,
    explanation: "It is essentially a 12-month interest-free loan, not a waiver. Repayment must begin in the following 12 months, after which interest accrues on any unpaid balance.",
    category: 'product-facts'
  },

  // Q20 -- correct: 0
  {
    question: "Under the Income Drawdown Facility (IDF) at 100% utilisation, how much of the accumulator is withdrawn each year and for how long?",
    options: [
      "10% per year for 10 years; the policy terminates after",
      "5% per year for 20 years; the policy continues",
      "20% per year for 5 years; the policy continues",
      "100% in a single payout"
    ],
    correct: 0,
    explanation: "100% IDF withdraws 10% of the accumulator annually for 10 years, after which the policy terminates with nothing remaining.",
    category: 'product-facts'
  },

  // Q21 -- correct: 1
  {
    question: "Under the Income Drawdown Facility at 50% utilisation, how does it work?",
    options: [
      "Withdraw 10% per year for 5 years; policy terminates",
      "Withdraw 5% of the accumulator annually for 10 years; 50% of sum assured remains and policy continues",
      "Withdraw 50% in a lump sum; policy continues unchanged",
      "Withdraw 5% indefinitely until age 100"
    ],
    correct: 1,
    explanation: "At 50% utilisation, the client withdraws 5% per year for 10 years; 50% of the sum assured stays in force and the policy continues.",
    category: 'product-facts'
  },

  // Q22 -- correct: 3
  {
    question: "When does the Income Drawdown Facility's availability period start?",
    options: [
      "Always at age 60 regardless of plan setup",
      "At policy inception",
      "Only at age 100 maturity",
      "At the later of the multiplier expiry date or the end of the premium term"
    ],
    correct: 3,
    explanation: "IDF availability starts at the later of the multiplier expiry date or the end of the premium term, and ends on the policy anniversary following the insured's 85th birthday.",
    category: 'product-facts'
  },

  // Q23 -- correct: 2
  {
    question: "When does the IDF availability window close?",
    options: [
      "On the policyholder's 75th birthday",
      "On the policyholder's 80th birthday",
      "On the policy anniversary immediately following the insured's 85th birthday",
      "On the policy anniversary immediately following age 100"
    ],
    correct: 2,
    explanation: "The IDF window closes on the policy anniversary right after the insured turns 85.",
    category: 'product-facts'
  },

  // Q24 -- correct: 0
  {
    question: "Can the policyholder withdraw bonuses from GPP before age 65?",
    options: [
      "No -- withdrawals are only allowed after age 65 (or after the multiplier expiry)",
      "Yes, anytime after Year 5",
      "Yes, but only up to 25% of bonuses",
      "Yes, with a 50% penalty"
    ],
    correct: 0,
    explanation: "Bonus withdrawals are not allowed before age 65 or before the multiplier expiry. After that, partial withdrawal is allowed but it proportionally reduces coverage.",
    category: 'product-facts'
  },

  // Q25 -- correct: 1
  {
    question: "What happens to the GPP coverage if the policyholder makes a partial withdrawal of 50% of bonuses after age 65?",
    options: [
      "Coverage stays unchanged because bonuses are separate",
      "Coverage reduces proportionally -- by approximately 50%",
      "Coverage doubles because the amount is paid as cash",
      "The policy terminates immediately"
    ],
    correct: 1,
    explanation: "Withdrawing 50% of bonuses cuts the corresponding coverage by 50% -- bonuses and coverage are proportionally tied.",
    category: 'product-facts'
  },

  // Q26 -- correct: 2
  {
    question: "When can a GPP policyholder use the Option to Purchase Additional Insurance (OPAI), and what is its biggest advantage?",
    options: [
      "Whenever they want, with full underwriting required",
      "Once a year, with a flat 5% loading",
      "Within 90 days of qualifying life events (marriage, child birth/adoption, spouse death, age 18) -- with no further underwriting",
      "Only at age 55, with full underwriting"
    ],
    correct: 2,
    explanation: "OPAI must be exercised within 90 days of a qualifying life event. The big advantage is no further underwriting -- so even clients with new conditions can still increase coverage.",
    category: 'product-facts'
  },

  // Q27 -- correct: 3
  {
    question: "How many times can the OPAI be exercised, and at what age does it expire?",
    options: [
      "Twice, expires at 65",
      "Three times, expires at 60",
      "Unlimited, expires at 55",
      "Once, expires when the insured reaches age 55"
    ],
    correct: 3,
    explanation: "OPAI can only be exercised once, and it expires when the insured reaches age 55.",
    category: 'product-facts'
  },

  // Q28 -- correct: 0
  {
    question: "What is the survival period required for a critical illness claim under GPP's CI riders?",
    options: [
      "At least 7 days from diagnosis",
      "At least 14 days from diagnosis",
      "At least 30 days from diagnosis",
      "No survival period"
    ],
    correct: 0,
    explanation: "GPP CI riders require the insured to survive at least 7 days after diagnosis -- a standard industry survival clause.",
    category: 'product-facts'
  },

  // Q29 -- correct: 1
  {
    question: "What is the standard waiting period for most CI conditions under GPP, and how long for ADHD-related conditions?",
    options: [
      "30 days for CI; 6 months for ADHD",
      "90 days for most CI conditions; 1 year for conditions caused by ADHD",
      "180 days for CI; 30 days for ADHD",
      "No waiting period for either"
    ],
    correct: 1,
    explanation: "Most CI conditions have a 90-day waiting period from policy inception; conditions caused by ADHD have a 1-year waiting period.",
    category: 'product-facts'
  },

  // Q30 -- correct: 2
  {
    question: "What is the free-look (cooling-off) period for GPP?",
    options: [
      "7 days",
      "10 days",
      "14 days",
      "30 days"
    ],
    correct: 2,
    explanation: "GPP gives a 14-day free-look period during which the policy can be cancelled with a refund.",
    category: 'product-facts'
  },

  // Q31 -- correct: 3
  {
    question: "Under GPP, suicide within how long of policy inception is excluded from the death benefit?",
    options: [
      "Within 6 months",
      "Within 30 days",
      "Within 90 days",
      "Within the first policy year"
    ],
    correct: 3,
    explanation: "Suicide within the first policy year is excluded from the death benefit. After year 1, suicide is covered.",
    category: 'product-facts'
  },

  // Q32 -- correct: 0
  {
    question: "What is the maximum entry age for the GPP 25-year premium term?",
    options: [
      "Age 50",
      "Age 55",
      "Age 60",
      "Age 65"
    ],
    correct: 0,
    explanation: "Entry-age caps depend on premium term: 25-year max age 50, 20-year max age 55, 15-year max age 60.",
    category: 'product-facts'
  },

  // Q33 -- correct: 1
  {
    question: "What is the maximum entry age for the GPP 20-year premium term?",
    options: [
      "Age 50",
      "Age 55",
      "Age 60",
      "Age 65"
    ],
    correct: 1,
    explanation: "The 20-year term caps entry at age 55.",
    category: 'product-facts'
  },

  // Q34 -- correct: 2
  {
    question: "What is the maximum entry age for the GPP 15-year premium term?",
    options: [
      "Age 50",
      "Age 55",
      "Age 60",
      "Age 70"
    ],
    correct: 2,
    explanation: "The 15-year term caps entry at age 60 -- the longest age window of the three.",
    category: 'product-facts'
  },

  // Q35 -- correct: 3
  {
    question: "What is the minimum sum assured for a GPP policy on the 2x multiplier?",
    options: [
      "$10,000",
      "$15,000",
      "$20,000",
      "$25,000"
    ],
    correct: 3,
    explanation: "The 2x multiplier has a minimum sum assured of $25,000, with approximate minimum premium around $50-$60/month.",
    category: 'product-facts'
  },

  // Q36 -- correct: 0
  {
    question: "Which policy alteration on GPP is only allowed in the first policy year?",
    options: [
      "Increasing the insured amount",
      "Reducing the insured amount",
      "Switching the multiplier",
      "Changing the payment term"
    ],
    correct: 0,
    explanation: "Increases in the insured amount are only allowed in the first policy year. Reductions are allowed anytime, but reduce both coverage and returns.",
    category: 'product-facts'
  },

  // Q37 -- correct: 1
  {
    question: "What does GPP pay at policy maturity (age 100)?",
    options: [
      "Only the guaranteed cash value, no bonuses",
      "Total premiums paid plus all accumulated bonuses",
      "Only the death benefit, paid as a lump sum",
      "The booster amount only"
    ],
    correct: 1,
    explanation: "At age 100 maturity, the policy pays out total premiums paid plus all accumulated bonuses.",
    category: 'product-facts'
  },

  // Q38 -- correct: 2
  {
    question: "On a $200,000 GPP policy with 3x multiplier dropping at 65, what is the approximate annual premium for a healthy 25-year-old non-smoker (base only, no Early CI)?",
    options: [
      "Around $1,200/year",
      "Around $5,000/year",
      "Around $1,946/year",
      "Around $3,500/year"
    ],
    correct: 2,
    explanation: "From the lecture sample illustration: a 25-year-old non-smoker with $200,000 coverage on 3x dropping at 65 sees annual premiums around $1,946.",
    category: 'product-facts'
  },

  // Q39 -- correct: 3
  {
    question: "On the same $200,000 / age 25 / drop-at-65 setup, how does the 5x multiplier annual premium compare to the 3x?",
    options: [
      "Around the same as 3x",
      "About double the 3x premium",
      "About $500 more than 3x",
      "Cheaper than 3x (around $2,200), but coverage drops dramatically at 65"
    ],
    correct: 3,
    explanation: "5x is the cheapest premium-wise (around $2,200/year in the example) but the booster drop-off at 65 is dramatic -- coverage falls to roughly $75k.",
    category: 'product-facts'
  },

  // Q40 -- correct: 0
  {
    question: "On the same setup, how does the 2x multiplier annual premium compare to the 3x?",
    options: [
      "More expensive (around $2,500-plus), but coverage barely drops at 65",
      "Same price as 3x",
      "Cheaper than 5x",
      "Identical to 1x term insurance"
    ],
    correct: 0,
    explanation: "2x costs around $2,500/year in the example -- pricier than 3x, but the post-65 coverage drop is minimal because the base is half of total coverage.",
    category: 'product-facts'
  },

  // Q41 -- correct: 1
  {
    question: "Roughly how much extra annual premium does choosing booster drop-off at 75 (vs 65) add on a sample 3x plan?",
    options: [
      "$500-$700 more",
      "Around $100+ more (e.g. $2,200-$2,600 vs $1,946)",
      "Nothing -- premium is the same",
      "$1,000+ more"
    ],
    correct: 1,
    explanation: "Choosing a 75 drop-off adds roughly $100+/year on the sample. Most clients should still pick 65 -- by then bonuses usually exceed the SA anyway.",
    category: 'product-facts'
  },

  // Q42 -- correct: 2
  {
    question: "What additional first-year coverage boost does the Power-Up Dollar feature provide on a 5x multiplier?",
    options: [
      "10%",
      "15%",
      "25%",
      "5%"
    ],
    correct: 2,
    explanation: "Power-Up Dollar boosts first-year coverage by 25% on 5x, 15% on 3x, and 10% on 2x.",
    category: 'product-facts'
  },

  // Q43 -- correct: 3
  {
    question: "What happens to the Power-Up Dollar coverage if the client is on AIA Vitality 'Bronze' status?",
    options: [
      "Coverage stays the same",
      "Coverage increases by $500 per year",
      "Coverage doubles",
      "Coverage reduces by 10% of Base PowerUp Dollar per year (Platinum increases it by 5% of Base PUD per year)"
    ],
    correct: 3,
    explanation: "Per Product Summary page 12 (Adjustment of PowerUp Dollar at Policy Anniversary): Bronze -10%, Silver -5%, Gold 0%, Platinum +5% of Base PowerUp Dollar each year. Capped at Min 0 and Max 150% of Base PUD.",
    category: 'product-facts'
  },

  // Q44 -- correct: 0
  {
    question: "On a sample $200k / 3x / 25-year setup, what is the rough cash value at age 100 vs total premiums paid -- and what is the implied yield?",
    options: [
      "About $48k paid in, ~$192k back at 100, roughly 2% p.a.",
      "About $100k paid in, ~$110k back at 100, roughly 0.5% p.a.",
      "About $48k paid in, ~$48k back at 100, 0% p.a.",
      "About $30k paid in, ~$1m back at 100, 8% p.a."
    ],
    correct: 0,
    explanation: "From the lecture: putting in roughly $48k over 25 years and getting back ~$192k at age 100 is roughly 2% p.a. -- about 4x what you paid in.",
    category: 'product-facts'
  },

  // Q45 -- correct: 1
  {
    question: "Under GPP's 'half-half' Early CI strategy on $300k of CI cover, how is the coverage typically split?",
    options: [
      "$300k Early CI + $300k Major CI (full both sides)",
      "$150k Early CI + $150k Major CI -- with total payout still capped at $300k",
      "$100k Early CI + $200k Major CI",
      "$300k Major CI only -- no Early CI"
    ],
    correct: 1,
    explanation: "Half-half splits Early and Major CI at 50/50 of the desired total. Early-stage claim pays $150k; if it later progresses to major, the remaining $150k pays out.",
    category: 'product-facts'
  },

  // ============================================================
  // SALES ANGLES (30 questions) -- Q46-Q75
  // ============================================================

  // Q46 -- correct: 2
  {
    question: "What is the headline analogy used to position GPP vs term insurance?",
    options: [
      "Public bus vs taxi",
      "Pay-TV vs free-to-air",
      "Buying a house (GPP) vs renting a house (term)",
      "Premium economy vs business class"
    ],
    correct: 2,
    explanation: "GPP is framed as 'buying a house' -- limited payment then you own it for life with cash value. Term is 'renting' -- you pay forever and own nothing at the end.",
    category: 'sales-angles'
  },

  // Q47 -- correct: 0
  {
    question: "Which multiplier should be the default starting recommendation for most GPP cases?",
    options: [
      "3x -- balanced, middle-tier on cost and cash value",
      "5x -- cheapest premium",
      "2x -- best cash value",
      "Whichever the client picks first"
    ],
    correct: 0,
    explanation: "3x is the default because it sits in the middle on premium and offers the best yield-per-dollar in the lecture's sample illustration.",
    category: 'sales-angles'
  },

  // Q48 -- correct: 1
  {
    question: "How is the multiplier explained to clients using a travel-class analogy?",
    options: [
      "5x = First Class, 3x = Business, 2x = Economy",
      "5x = Economy, 3x = Business, 2x = First Class",
      "All three are the same class, just different prices",
      "There is no analogy used"
    ],
    correct: 1,
    explanation: "5x is Economy (cheap, weak base after 65), 3x is Business (balanced), 2x is First Class (premium price, strongest residual base).",
    category: 'sales-angles'
  },

  // Q49 -- correct: 3
  {
    question: "Which analogy is used to explain how the booster drops at age 65/75?",
    options: [
      "An umbrella opening and closing",
      "A bank deposit maturing",
      "A balloon deflating slowly",
      "A spaceship with booster rockets that detach once the ship has reached altitude"
    ],
    correct: 3,
    explanation: "The booster is described as the launch rockets that drop off mid-flight -- once you have reached altitude (age 65/75) you do not need them anymore, the base ship continues alone.",
    category: 'sales-angles'
  },

  // Q50 -- correct: 0
  {
    question: "Why is starting GPP earlier framed as a 'sure win' for the client?",
    options: [
      "Locks in lower premiums for life and allows cash value/coverage to compound longer",
      "AIA pays a sign-on bonus for clients under 25",
      "Premiums actually decrease over time",
      "It guarantees maximum stock market returns"
    ],
    correct: 0,
    explanation: "Premiums on GPP are level for life and rise roughly 5% per year of delay. Starting young locks in cheaper rates and gives more years for cash value to accumulate.",
    category: 'sales-angles'
  },

  // Q51 -- correct: 1
  {
    question: "What is the 'sure win' three-outcome positioning used to open GPP cases?",
    options: [
      "Discount, refund, or upgrade -- whichever happens, you save money",
      "Don't claim -> get refund + interest at 65; claim CI -> get CI payout; pass away -> family gets death benefit",
      "Cancer, accident or stroke -- all three trigger a doubled payout",
      "Singapore, Malaysia or overseas -- all geographies covered"
    ],
    correct: 1,
    explanation: "GPP is sold as a sure-win: never claim and you still get money back at 65; claim CI and you get a payout; pass away and your family is paid -- you cannot 'lose' on the money.",
    category: 'sales-angles'
  },

  // Q52 -- correct: 2
  {
    question: "What budgeting rule does the lecture suggest as a planning anchor when opening a GPP conversation?",
    options: [
      "5% of monthly income for all insurance",
      "20% of annual income for life insurance only",
      "Allocate roughly 10% of income for long-term insurance protection",
      "$1,000/month flat regardless of income"
    ],
    correct: 2,
    explanation: "The opening framework uses a 10% of income rule -- e.g. $60k income = ~$500/month for life, CI, hospitalisation and accident.",
    category: 'sales-angles'
  },

  // Q53 -- correct: 3
  {
    question: "What is the recommended income multiple for Major CI coverage when sizing GPP?",
    options: [
      "1 year of income",
      "2 years of income",
      "3 years of income",
      "5 years of income"
    ],
    correct: 3,
    explanation: "Major CI coverage targets 5 years of annual income, because recovery from major illness is long and the client may not return to work.",
    category: 'sales-angles'
  },

  // Q54 -- correct: 0
  {
    question: "What is the recommended income multiple for Early CI coverage in GPP packaging?",
    options: [
      "3 years of income",
      "5 years of income",
      "1 year of income",
      "10 years of income"
    ],
    correct: 0,
    explanation: "Early CI is sized at 3 years of income because most clients recover from early-stage CI within a few years -- it also signals you are not over-selling.",
    category: 'sales-angles'
  },

  // Q55 -- correct: 1
  {
    question: "What is the 'cash value question' used to flush out GPP-suitable prospects?",
    options: [
      "'Have you ever bought stocks before?'",
      "'If you pay $500/month and at the end you don't get any money back, how would you feel?'",
      "'How many policies do you currently own?'",
      "'Do you trust insurance companies?'"
    ],
    correct: 1,
    explanation: "The cash value question reveals whether the client cares about getting money back -- a 'feels like a waste' answer signals they want a whole-life plan with cash value, not a term plan.",
    category: 'sales-angles'
  },

  // Q56 -- correct: 2
  {
    question: "What is the warranty analogy used in Phase 3 to make GPP feel like a bargain when started young?",
    options: [
      "Starbucks reward stamps -- the more you collect the cheaper coffee gets",
      "Buy 1 get 1 free promotions",
      "Buying a longer warranty usually costs MORE; but starting GPP young gets you LONGER coverage for LESS total premium",
      "Annual sales for big-ticket electronics"
    ],
    correct: 2,
    explanation: "Apple-style warranties cost more for longer cover. GPP flips this: start at 25 and you pay less in total ($72k vs $104k at 35) AND get more years of cover (75 vs 65).",
    category: 'sales-angles'
  },

  // Q57 -- correct: 3
  {
    question: "Why does the GPP playbook always default to a 25-year payment term for young adults?",
    options: [
      "It is the only option allowed for under-30s",
      "Cash flow is identical regardless of term length",
      "Compulsory under MAS rules",
      "Lower monthly premiums and higher first-year commission (50% vs 30% on 15-year)"
    ],
    correct: 3,
    explanation: "25-year term gives the client the lowest monthly premium AND yields the highest first-year commission tier (50% vs 40% on 20-year, 30% on 15-year).",
    category: 'sales-angles'
  },

  // Q58 -- correct: 0
  {
    question: "When pitching GPP, what is the 'two birds with one stone' line used for?",
    options: [
      "Position GPP as both protection coverage AND returns -- vs a bank account which gives neither",
      "Position GPP as covering both spouse and child",
      "Position GPP as covering both Singapore and overseas",
      "Position GPP as both savings and term life"
    ],
    correct: 0,
    explanation: "Bank accounts give 0% and zero coverage. GPP gives ~2% yield AND lifelong coverage -- 'killing two to three birds with one stone' (coverage, returns, refund).",
    category: 'sales-angles'
  },

  // Q59 -- correct: 1
  {
    question: "Why is the LIA 37 vs GPP 73 comparison used during the CI rider pitch?",
    options: [
      "To convince the client to buy term insurance instead",
      "To demonstrate GPP's CI rider is more comprehensive than the LIA standard definition (37 illnesses)",
      "To show GPP is twice as expensive as the market",
      "Because LIA mandates this disclosure"
    ],
    correct: 1,
    explanation: "Showing 73 vs 37 visually demonstrates GPP's CI rider goes well beyond the LIA standard 37 -- the comprehensiveness sells the upgrade.",
    category: 'sales-angles'
  },

  // Q60 -- correct: 2
  {
    question: "Why is 'carcinoma in situ' Googled in front of the client when introducing the Early CI rider?",
    options: [
      "To prove the advisor knows medical terminology",
      "To remove the rider from the recommendation",
      "To show how 'early' early CI can mean -- it is a pre-cancerous Stage 0 condition that is still claimable",
      "To compute the exact premium for the rider"
    ],
    correct: 2,
    explanation: "Live Googling 'carcinoma in situ' shows the client a real Stage-0 pre-cancerous condition that GPP's Early CI rider would cover -- demonstrating value transparently.",
    category: 'sales-angles'
  },

  // Q61 -- correct: 3
  {
    question: "Why is the Early CI rider deliberately layered onto the pitch AFTER the base GPP plan, not bundled at the start?",
    options: [
      "To hide the cost from the client",
      "Required by MAS regulations",
      "Because Early CI is rarely sold",
      "Layering the upsell after base commitment is a proven sequence (like Apple Store: Mac first, then AppleCare, then accessories)"
    ],
    correct: 3,
    explanation: "Front-loading every benefit dilutes the impact. The Apple Store analogy: announce the base price first, then layer add-ons -- the client commits to the base, then evaluates each add-on on its own merits.",
    category: 'sales-angles'
  },

  // Q62 -- correct: 0
  {
    question: "What is the 'half-half' Early CI strategy used to make comprehensive cover more affordable on GPP?",
    options: [
      "Split the desired CI total 50/50 between Early CI and Major CI riders, instead of full sums on both",
      "Charge half the premium for the first year",
      "Pay half the premium upfront and half at age 65",
      "Cover half the family on the same policy"
    ],
    correct: 0,
    explanation: "Instead of buying full sums on both Early and Major CI, split it -- e.g. $150k + $150k. Total payout on a major claim is still $300k, but the premium is much cheaper.",
    category: 'sales-angles'
  },

  // Q63 -- correct: 1
  {
    question: "On a sample 25-year-old / $300k / 3x case, roughly how much more per month does adding the Early CI rider cost?",
    options: [
      "Around $200/month more",
      "About $60-70/month more (e.g. $3,995/yr vs $3,200/yr)",
      "Identical price",
      "$500/month more"
    ],
    correct: 1,
    explanation: "Adding Early CI on the half-half setup adds roughly $60-70/month -- 'less than $30 a month for $150k extra' -- which makes the upgrade an easy yes.",
    category: 'sales-angles'
  },

  // Q64 -- correct: 2
  {
    question: "What is the 'four hoops' close used in the Phase 5 GPP pitch?",
    options: [
      "Four discounts the advisor stacks together",
      "Four different products to bundle",
      "Hoop 1: I need CI; Hoop 2: I need to buy now; Hoop 3: 3x vs 2x; Hoop 4: I need Early CI",
      "Four phone calls before the close"
    ],
    correct: 2,
    explanation: "The client passes through four progressive yeses: (1) need CI, (2) need to buy now, (3) which multiplier, (4) add Early CI. Each yes makes the next easier.",
    category: 'sales-angles'
  },

  // Q65 -- correct: 3
  {
    question: "What philosophical line is used to justify recommending the Early CI rider over a cheaper base-only plan?",
    options: [
      "'I always sell the cheapest plan possible.'",
      "'Cheaper is always better.'",
      "'You decide -- I have no opinion.'",
      "'My job is not to make things cheap, but to make things comprehensive.'"
    ],
    correct: 3,
    explanation: "Positioning the advisor as comprehensive (not cheap) builds trust and protects the client from a worst-case 'I got Stage 0 cancer but I cannot claim' scenario.",
    category: 'sales-angles'
  },

  // Q66 -- correct: 0
  {
    question: "How is the Phase 3 'start now vs start in 10 years' comparison framed in concrete numbers (sample case)?",
    options: [
      "$72k total premiums + 75 years of cover at 25 vs $104k + only 65 years of cover at 35",
      "$50k total premiums at 25 vs $50k at 35",
      "Always identical -- premiums never increase",
      "$200k total premiums at 25 vs $20k at 35"
    ],
    correct: 0,
    explanation: "Starting at 25: $72k total, 75 years coverage. Wait until 35: $104k total, only 65 years coverage. You pay 50%+ more for less coverage.",
    category: 'sales-angles'
  },

  // Q67 -- correct: 1
  {
    question: "How is GPP's potential return positioned vs putting money in a fixed deposit?",
    options: [
      "GPP returns are guaranteed equal to FD",
      "GPP yields about 2% p.a. AND gives lifelong coverage; FDs give around 1.something % AND no coverage",
      "GPP is always lower than FD",
      "GPP and FD pay the same -- the choice is style preference"
    ],
    correct: 1,
    explanation: "Sample illustrations show GPP yielding around 2% p.a. with full coverage on top, vs FD giving ~1.x% and zero coverage. You get returns AND protection, not either/or.",
    category: 'sales-angles'
  },

  // Q68 -- correct: 2
  {
    question: "Why is the 'limited payment, lifelong coverage' phrase used so heavily in the GPP pitch?",
    options: [
      "Because limited-pay is a regulatory requirement",
      "It is a script tic with no real meaning",
      "It crystallises GPP's mortgage-style proposition: pay for 15-25 years, then own coverage and cash value for life",
      "Because GPP cannot be paid for life"
    ],
    correct: 2,
    explanation: "'Limited payment, lifelong coverage' is the spine of the GPP pitch -- it ties to the buy-vs-rent house analogy and frames the limited 15/20/25-year commitment as a finite ask.",
    category: 'sales-angles'
  },

  // Q69 -- correct: 3
  {
    question: "Phase 4 (iPOS+ quotation) -- which single line is most emphasised when explaining the benefit illustration?",
    options: [
      "The number of pages in the BI",
      "The exact percentage of guaranteed bonuses",
      "The colour of the chart",
      "The surrender value at age 65 (or maturity) vs total premiums paid -- 'you put in X, you get back Y'"
    ],
    correct: 3,
    explanation: "Phase 4 zeroes in on the surrender value box -- e.g. 'you paid $100k, you get back $169k at 65' -- because that is what crystallises the cash-value selling angle for the client.",
    category: 'sales-angles'
  },

  // Q70 -- correct: 0
  {
    question: "What is the Phase 6 'Life Plan + UCC' packaging strategy used to make GPP more affordable?",
    options: [
      "Sell GPP for Major CI/death/savings + use UCC (Universal Critical Care) for Early CI and recurring CI claims",
      "Sell two GPPs side by side",
      "Sell GPP plus a separate term plan for everything",
      "Drop GPP entirely and only sell UCC"
    ],
    correct: 0,
    explanation: "If GPP with both CI riders blows the budget, Phase 6 splits coverage: GPP carries the base plus Major CI, and a UCC plan carries Early CI + recurring claims -- often cheaper overall.",
    category: 'sales-angles'
  },

  // Q71 -- correct: 1
  {
    question: "Which client trigger does the lecture call out as the 'biggest' indicator that GPP (not term) is the right fit?",
    options: [
      "Client wants the cheapest possible premium",
      "Client is worried that pure-term is 'a waste of money' if they don't claim -- they want some money back",
      "Client only wants accident coverage",
      "Client already has 5 ILPs"
    ],
    correct: 1,
    explanation: "When a prospect's chief concern is not getting money back from term, that cash-value pain point is the strongest signal to position GPP -- not term -- as the right plan.",
    category: 'sales-angles'
  },

  // Q72 -- correct: 2
  {
    question: "How is the 'pay for limited time, free phone for life' analogy used in opening GPP?",
    options: [
      "To explain mobile insurance riders",
      "To upsell tablet add-ons",
      "Whole life = prepay short-term, then get a 'free handphone plan + refund' for life. Term = pay-as-you-go circle of life bill -- you pay forever",
      "It is not used in the GPP playbook"
    ],
    correct: 2,
    explanation: "The mobile-plan analogy makes 'limited pay, lifelong coverage + refund' tangible: GPP is a prepaid plan that ends but keeps giving; term is a never-ending bill that gives nothing back.",
    category: 'sales-angles'
  },

  // Q73 -- correct: 3
  {
    question: "Why is the 75-year drop-off generally NOT recommended even though it extends boosted coverage?",
    options: [
      "It is cheaper than 65-year drop-off",
      "It cancels the lifetime base coverage",
      "It is only available to smokers",
      "By 65, accumulated bonuses usually already exceed the SA -- paying ~$100+ more/year buys little practical benefit, especially on 2x"
    ],
    correct: 3,
    explanation: "The 75 drop-off costs more but adds limited value: by 65 the non-guaranteed bonuses typically exceed the minimum death benefit anyway, especially on 2x. Default to 65 for most clients.",
    category: 'sales-angles'
  },

  // Q74 -- correct: 0
  {
    question: "How does the Phase 6 close 'value stack' the client to wrap up the case?",
    options: [
      "Reinforce that death, disability, CI, Early CI (if taken) and savings are now all settled, and remind them buying early was the smart move",
      "Hand the client a discount voucher",
      "Promise free dinners for a year",
      "Tell them to buy two more plans next month"
    ],
    correct: 0,
    explanation: "Phase 6 closes by walking the client through everything that's now covered (death, disability, CI, Early CI, savings) and reinforcing that locking it in young is the smartest move.",
    category: 'sales-angles'
  },

  // Q75 -- correct: 1
  {
    question: "What is the Phase 1 sequence of meetings recommended to convert a GPP case?",
    options: [
      "One single meeting -- close immediately",
      "Meeting 1: Total Wealth concept + 10% budget + 'cash value question'. Meeting 2: pitch GPP plus hospitalisation/accident plans",
      "Three meetings before any product is mentioned",
      "Four meetings, all virtual"
    ],
    correct: 1,
    explanation: "Phase 1 splits across 2 meetings: Meeting 1 establishes need and budget via the cash-value question; Meeting 2 pitches GPP alongside hospitalisation and accident plans.",
    category: 'sales-angles'
  },

  // ============================================================
  // OBJECTION HANDLING (25 questions) -- Q76-Q100
  // ============================================================

  // Q76 -- correct: 1
  {
    question: "Client says: 'GPP is too expensive compared to a term plan I saw online.' What is the strongest first response?",
    options: [
      "You are right, term is always better -- buy that.",
      "Reframe: term is cheaper monthly but is pure expense. GPP costs more upfront but you get cash value, lifelong coverage, and if you ever stop paying with cash value present the policy continues for a while -- term lapses immediately.",
      "Promise to match the term price.",
      "Tell them GPP is actually cheaper than term."
    ],
    correct: 1,
    explanation: "Acknowledge the price gap, then reframe with three concrete advantages: cash value, lifelong cover, and lapse protection if cash value exists.",
    category: 'objection-handling'
  },

  // Q77 -- correct: 2
  {
    question: "Client says: 'I would rather buy term and invest the difference (BTID).' How do you respond?",
    options: [
      "Agree -- BTID is mathematically optimal.",
      "Refuse to discuss.",
      "Acknowledge BTID's logic, then highlight: GPP gives guaranteed elements + non-guaranteed bonuses with low risk, complements an investment-linked plan rather than competing, and most people lack the discipline to actually invest the difference consistently.",
      "Tell them BTID is illegal."
    ],
    correct: 2,
    explanation: "BTID is logically clean, but in practice few clients invest the difference. GPP brings stability + a forced savings discipline, which works alongside (not against) an investment plan like APA.",
    category: 'objection-handling'
  },

  // Q78 -- correct: 3
  {
    question: "Client says: 'I cannot afford this -- $200/month is too much.' What is the most useful response?",
    options: [
      "Tell them GPP is not for them.",
      "Quote a 5x multiplier with a 15-year term so commission is even higher.",
      "Push them to take a loan.",
      "Reset the multiplier to 5x and the term to 25 years to bring premium down (~$50-60/month minimum on 2x), and explain coverage trade-offs honestly. They can also dial down the sum assured."
    ],
    correct: 3,
    explanation: "GPP has flexibility: 5x is the cheapest multiplier, 25-year is the cheapest term, and sum assured can be reduced. Minimum premium on 2x is around $50-60/month. Be honest about post-65 coverage trade-offs.",
    category: 'objection-handling'
  },

  // Q79 -- correct: 0
  {
    question: "Client objects: 'What if I lose my job and cannot pay premiums?' How do you handle it?",
    options: [
      "After 3 years, the Premium Pause Option lets you pause for up to 12 months on involuntary retrenchment -- it is an interest-free loan, repaid in the next 12 months, then interest accrues on the unpaid balance.",
      "AIA permanently waives premiums on retrenchment.",
      "The policy will auto-cancel.",
      "You should never buy GPP if you have job-loss risk."
    ],
    correct: 0,
    explanation: "Be precise: Premium Pause is a 12-month interest-free loan, not a waiver, and it requires 3 years of premiums + 6 months prior employment + 2-month deferment.",
    category: 'objection-handling'
  },

  // Q80 -- correct: 1
  {
    question: "Client says: 'I already have an Eldershield/CareShield plan -- isn't that enough disability cover?'",
    options: [
      "Agree and skip TPD discussion.",
      "Distinguish: GPP's TPD is very strict (loss of two limbs/eyes pre-65, ADL test post-65) and caps at age 70 -- it does not replace a proper accident plan or disability income plan, which cover partial disabilities.",
      "Tell them to cancel CareShield.",
      "Claim GPP TPD covers everything."
    ],
    correct: 1,
    explanation: "GPP's TPD is severe-disability only and ends at age 70 -- always recommend a separate accident plan to cover partial disability scenarios.",
    category: 'objection-handling'
  },

  // Q81 -- correct: 2
  {
    question: "Client says: 'But the booster drops at 65 -- doesn't that mean I lose most of my coverage?'",
    options: [
      "Tell them coverage stays the same forever.",
      "Suggest they buy three policies to compensate.",
      "Reframe by multiplier: on 2x, the drop is small (base = 50% of total). On 5x, it is sharp -- which is why most clients take 3x as the balanced default. Plus by 65, accumulated bonuses partially offset the drop.",
      "Agree and recommend they cancel."
    ],
    correct: 2,
    explanation: "Concrete numbers neutralise this objection: 2x has a small drop, 5x has a big drop. Mention that bonuses cushion the drop and that financial obligations typically reduce by 65 anyway.",
    category: 'objection-handling'
  },

  // Q82 -- correct: 3
  {
    question: "Client says: 'I will think about it and start when I am 35 instead.' What is the strongest counter?",
    options: [
      "Agree and call them in 10 years.",
      "Tell them they will be uninsurable at 35.",
      "Promise a discount in 10 years.",
      "Show concrete numbers: at 25 = ~$2,800/year and 75 yrs of coverage; at 35 = ~$4,160/year and only 65 yrs of coverage. Same plan, $30k more in lifetime premiums for less coverage."
    ],
    correct: 3,
    explanation: "The cost-of-waiting comparison is the most concrete: $30k extra for less coverage. Premiums also rise about 5% per year of delay.",
    category: 'objection-handling'
  },

  // Q83 -- correct: 0
  {
    question: "Client says: 'The yield is only 2% -- I can do better in stocks.' How do you respond?",
    options: [
      "Reframe: GPP is not competing with stocks. It gives ~2% p.a. with low risk PLUS lifelong protection and CI claim payouts. Pair it with an investment plan for upside; do not replace one with the other.",
      "Promise GPP will outperform stocks.",
      "Tell them stocks are dangerous.",
      "Agree and cancel the case."
    ],
    correct: 0,
    explanation: "GPP is the protection-with-stability layer of a portfolio, not a stock substitute. The right answer is diversification: GPP for guaranteed elements, an ILP/APA for upside.",
    category: 'objection-handling'
  },

  // Q84 -- correct: 1
  {
    question: "Client says: 'I do not need cash value -- I just want the cheapest CI cover possible.'",
    options: [
      "Insist they take GPP anyway.",
      "Acknowledge the budget priority. Honest answer: a pure CI/term plan or UCC may be cheaper. But also flag the trade-off -- nothing back if they never claim, and premiums on term renewals balloon after 65.",
      "Tell them no plan exists for that.",
      "Sell them a 5x GPP at minimum SA without discussing alternatives."
    ],
    correct: 1,
    explanation: "If cash value isn't a need, recommend honestly. GPP is a fit for clients who want money back; for pure cheapness, term/UCC is more honest.",
    category: 'objection-handling'
  },

  // Q85 -- correct: 2
  {
    question: "Client objects: 'My friend's GPP returns were terrible -- the bonuses didn't materialise.'",
    options: [
      "Promise it will not happen this time.",
      "Agree and cancel the case.",
      "Be transparent: bonuses are non-guaranteed and depend on the participating fund. Before multiplier expiry, coverage is unaffected. After expiry, poor bonus performance does affect death benefit. Recommend 2x or 3x for resilience and 65 drop-off so cash value has time to outweigh shortfalls.",
      "Tell them their friend was lying."
    ],
    correct: 2,
    explanation: "Honesty about non-guaranteed bonuses builds trust. Then de-risk the structure: 2x/3x and 65 drop-off cushion against poor bonus performance.",
    category: 'objection-handling'
  },

  // Q86 -- correct: 3
  {
    question: "Client says: 'I do not understand the multiplier -- can you just pick something for me?'",
    options: [
      "Default to 5x because it is cheapest.",
      "Default to 2x because it has the highest commission.",
      "Skip the discussion entirely.",
      "Use the rocket-ship/travel-class analogies, default to 3x as the balanced middle, and explain the post-65 trade-off in plain numbers (e.g. 5x drops $200k -> $75k at 65)."
    ],
    correct: 3,
    explanation: "Default to 3x because it balances premium and post-65 coverage. Use simple analogies to explain it -- never just decide silently for the client.",
    category: 'objection-handling'
  },

  // Q87 -- correct: 0
  {
    question: "Client says: 'Why do I need Early CI? Major CI is enough.' What is the response?",
    options: [
      "Use the carcinoma-in-situ Google example to show how 'early' Early CI can be (Stage 0). Without Early CI, a Stage 1 cancer diagnosis pays nothing -- and the client will (rightly) blame you. The half-half strategy keeps it affordable.",
      "Agree -- skip Early CI.",
      "Tell them Early CI is mandatory.",
      "Force them to buy full Early CI on top of full Major CI."
    ],
    correct: 0,
    explanation: "Demonstrate that 'early' really means pre-cancerous Stage 0. Without ECI, a stage-1 diagnosis is uncovered -- a real risk. Half-half makes the upgrade affordable.",
    category: 'objection-handling'
  },

  // Q88 -- correct: 1
  {
    question: "Client says: 'My existing whole-life plan covers me already -- why GPP?' How do you respond?",
    options: [
      "Tell them to cancel the existing plan.",
      "Run the calculator: 5 years of income for major CI is the target. If existing coverage is below this shortfall, GPP fills the gap. If they're already adequately covered, recommend reviewing other gaps (hospitalisation, accident) instead of stacking another whole life.",
      "Insist they buy GPP regardless.",
      "Tell them GPP is always better than every existing plan."
    ],
    correct: 1,
    explanation: "Run the CST calculation honestly. If they're under-covered for 5x income on CI, GPP closes the gap. If not, redirect to genuine gaps -- this builds trust over the long term.",
    category: 'objection-handling'
  },

  // Q89 -- correct: 2
  {
    question: "Client says: 'I want $500k of CI cover.' How do you size the GPP plan responsibly?",
    options: [
      "Just sell $500k Major CI to maximise commission.",
      "Refuse the request.",
      "Confirm 5x annual income rule. If $500k = ~5 years income, fine. Otherwise discuss capping. Note major CI total across all AIA CI policies is capped at $3m, and Early CI claims are capped at $350k per episode.",
      "Tell them $500k isn't possible."
    ],
    correct: 2,
    explanation: "Tie sum assured to the 5x income guideline, and disclose two AIA caps: $3m group total on major CI, $350k per episode on Early CI.",
    category: 'objection-handling'
  },

  // Q90 -- correct: 3
  {
    question: "Client objects: 'What if I claim Early CI -- does my death benefit disappear?'",
    options: [
      "Yes, the entire death benefit cancels.",
      "No, Early CI claims do not affect death benefit.",
      "Yes, but only after age 65.",
      "Death benefit is reduced by the CI amount paid (acceleration). E.g. $500k death + $100k Early CI claim leaves $400k death cover. The base is still in force."
    ],
    correct: 3,
    explanation: "GPP CI riders are accelerated -- the CI payout reduces the remaining death benefit by the same amount, but the policy continues with the lower death cover.",
    category: 'objection-handling'
  },

  // Q91 -- correct: 0
  {
    question: "Client says: 'I plan to surrender the policy after 5 years to free up cash.'",
    options: [
      "Strongly caution: surrender values are very low in early years (especially first few) -- they would lose most of what they paid. The plan is structured for limited-pay over 15-25 years; surrendering early defeats both the protection and savings purpose.",
      "Agree -- surrender early.",
      "Tell them surrender values match premiums paid in year 1.",
      "Promise full refund on surrender."
    ],
    correct: 0,
    explanation: "Early surrender wipes out most of what was paid; GPP is built for long-term commitment. Be honest -- if they cannot commit to the term, GPP isn't the right product.",
    category: 'objection-handling'
  },

  // Q92 -- correct: 1
  {
    question: "Client says: 'My pre-existing condition will get me rejected.' What is the appropriate stance?",
    options: [
      "Advise them to hide it.",
      "Be honest: pre-existing conditions and prior surgeries are excluded under GPP, and underwriting may load or exclude. Submit honestly, because non-disclosure can void claims later. If GPP loads heavily, OPAI on existing AIA plans may be a better path.",
      "Tell them GPP covers everything regardless.",
      "Refuse to take the application."
    ],
    correct: 1,
    explanation: "Never advise non-disclosure -- it voids the policy at claim time. Submit honestly; OPAI is one no-underwriting workaround on existing AIA policies.",
    category: 'objection-handling'
  },

  // Q93 -- correct: 2
  {
    question: "Client says: 'I will use the Income Drawdown Facility from age 60.' What do you correct?",
    options: [
      "Approve -- IDF starts at 60.",
      "Approve -- IDF starts at policy inception.",
      "Correct: IDF is only available from the LATER of multiplier expiry or end of premium term, until age 85. So if they chose 65 drop-off, IDF can start at 65, not 60.",
      "Tell them IDF doesn't exist."
    ],
    correct: 2,
    explanation: "IDF starts at the later of multiplier expiry or end of premium term. So 60 is too early for someone with a 65 drop-off.",
    category: 'objection-handling'
  },

  // Q94 -- correct: 3
  {
    question: "Client objects: 'Other insurers cover 100+ early CI conditions -- why does GPP only cover ~150?'",
    options: [
      "Tell them 150 is too many.",
      "Insist GPP covers more than competitors no matter what.",
      "Cancel the case.",
      "GPP's Early CI rider covers around 150 conditions PLUS 15 special conditions -- well above the LIA standard 37 majors. Comparing 'condition counts' across insurers is not apples-to-apples; what matters is severity definitions and per-episode caps."
    ],
    correct: 3,
    explanation: "GPP's count is competitive (~150 + 15 special). Move the conversation away from raw counts and toward what is actually claimable in real cases.",
    category: 'objection-handling'
  },

  // Q95 -- correct: 0
  {
    question: "Client says: 'The 7-day survival period feels unfair -- what if I die at day 6?'",
    options: [
      "Acknowledge it is industry-standard across insurers, included to ensure the diagnosis is verified. Sudden death on day 6 would be paid under the death benefit (if the policy is in force), not the CI rider -- so the family is not left empty-handed.",
      "Promise it doesn't apply.",
      "Tell them it's a 1-day rule.",
      "Cancel the rider."
    ],
    correct: 0,
    explanation: "The 7-day survival is industry standard. If the insured dies before the 7 days, the death benefit pays out instead -- not zero.",
    category: 'objection-handling'
  },

  // Q96 -- correct: 1
  {
    question: "Client says: 'I am 50 -- am I too old for GPP?'",
    options: [
      "Yes, GPP is only for under-30s.",
      "Not necessarily. The 25-year term caps at age 50, the 20-year at 55, the 15-year at 60. So at 50, all three terms are still possible -- but premiums are noticeably higher than for a 25-year-old. Run the numbers honestly.",
      "Force them onto a 5-year term.",
      "Refuse to quote."
    ],
    correct: 1,
    explanation: "Entry-age caps: 50/55/60 for 25/20/15-year terms. A 50-year-old can still take GPP -- just expect a higher premium and likely shorter term.",
    category: 'objection-handling'
  },

  // Q97 -- correct: 2
  {
    question: "Client objects: 'I only want a 5-year commitment.' How do you respond?",
    options: [
      "Sell GPP anyway.",
      "Promise to give a refund after 5 years.",
      "Honest: GPP's shortest term is 15 years. If a 5-year horizon is firm, GPP is not the right plan -- a short-term endowment, term plan or fixed-deposit setup is more honest. Don't force-fit.",
      "Tell them every plan locks them in for life."
    ],
    correct: 2,
    explanation: "GPP's shortest pay-term is 15 years, with high early surrender charges. A 5-year horizon means GPP is the wrong fit -- be honest and recommend a shorter-horizon product.",
    category: 'objection-handling'
  },

  // Q98 -- correct: 3
  {
    question: "Client says: 'Why should I trust the 'Power-Up Dollar' boost? It feels like marketing fluff.'",
    options: [
      "Promise it's worth millions.",
      "Tell them to ignore it.",
      "Drop the conversation.",
      "Be honest about what it is: a first-year coverage boost (10/15/25% on 2x/3x/5x), Vitality-status linked. Bronze drops it 10%/yr, Platinum adds $500/yr. It is real but small -- treat it as a bonus, not the core reason to buy."
    ],
    correct: 3,
    explanation: "Power-Up Dollar is real but modest. Mechanically explain it (boost % by multiplier, Vitality-tier dependent) and don't oversell it.",
    category: 'objection-handling'
  },

  // Q99 -- correct: 0
  {
    question: "Client objects: 'The Mum-to-Baby rider sounds great but I have no plans for kids.'",
    options: [
      "Skip the rider -- it is only relevant for expectant mothers. The base GPP plan stands on its own without it. Revisit only if circumstances change.",
      "Force them to buy it.",
      "Cancel the entire case.",
      "Tell them every female client must take it."
    ],
    correct: 0,
    explanation: "Mum-to-Baby is only useful for expectant mothers. If kids are not planned, omit the rider -- never force-fit irrelevant riders.",
    category: 'objection-handling'
  },

  // Q100 -- correct: 1
  {
    question: "Client says: 'My income is variable -- can GPP flex with me like an ILP?'",
    options: [
      "Yes, premiums on GPP are fully flexible like ILPs.",
      "GPP premiums are fixed and level -- not flexible. The relief tools are: Premium Pause (12-month interest-free loan after 3 years on involuntary retrenchment), reducing sum assured (allowed anytime), and OPAI for one-time increase. For genuine premium flexibility, an ILP like PLP or APA is a better fit.",
      "GPP can be paused indefinitely.",
      "GPP automatically adjusts to your income."
    ],
    correct: 1,
    explanation: "GPP premiums are fixed -- not flexible like an ILP. If genuine flexibility matters more than the cash value structure, recommend PLP or APA instead.",
    category: 'objection-handling'
  },

  // ============================================================
  // ROLEPLAY (20 questions) -- Q101-Q120
  // ============================================================

  // Q101 -- correct: 2
  {
    question: "A 25-year-old fresh grad earning $60k/yr says: 'I have no insurance and only $400/month to spare.' How do you open the GPP conversation?",
    options: [
      "Quote the maximum coverage immediately.",
      "Tell them to come back at 30.",
      "Anchor on the 10% rule (~$500/month) and the cash-value question; show CST shortfall (5x income = $300k CI need). Default a quotation: $300k coverage, 3x, 65 drop-off, 25-year term -- around $2,800/year base, then layer Early CI later.",
      "Skip CI and sell only term."
    ],
    correct: 2,
    explanation: "Phase 1 mechanics: open with Total Wealth + 10% rule + cash-value question, run CST, then default a 3x/$300k/25-year/drop-65 quote and progressively layer Early CI.",
    category: 'roleplay'
  },

  // Q102 -- correct: 0
  {
    question: "A 32-year-old new parent with a $4,000 monthly mortgage says: 'I want my baby covered if anything happens to me.' How do you frame GPP?",
    options: [
      "Position GPP as 'mortgage-style' protection: limited 20-year pay matches their working years, 3x multiplier gives high coverage during peak responsibility (kids + mortgage), drops to a meaningful base at 65 when obligations have eased. Add the Mum-to-Baby rider if relevant or recommend a child plan.",
      "Tell them to focus on savings first.",
      "Sell only term.",
      "Ignore the baby and quote a 15-year term."
    ],
    correct: 0,
    explanation: "Match the structure to life stage: 20-year limited pay aligns with peak earning years, 3x boosts coverage during the mortgage+kids phase, and the Mum-to-Baby rider extends to the child without underwriting.",
    category: 'roleplay'
  },

  // Q103 -- correct: 1
  {
    question: "A 45-year-old executive with two existing whole-life plans (around $200k cover) says 'I am already covered.' How do you proceed?",
    options: [
      "Cancel both existing plans and replace with GPP.",
      "Run CST: 5x his $180k income = $900k CI need. He is short ~$700k. Position a layered GPP top-up rather than replacement -- maybe $500k on 3x with a 20-year term, half-half Early CI of $150k. Reframe GPP as filling the shortfall, not duplicating.",
      "Tell him no top-up exists.",
      "Sell only an investment plan."
    ],
    correct: 1,
    explanation: "Use CST to quantify the shortfall objectively. GPP top-ups are a normal use case for under-covered higher earners -- never cancel existing valid policies.",
    category: 'roleplay'
  },

  // Q104 -- correct: 3
  {
    question: "A couple in their late 20s ask: 'Can we share one GPP policy?'",
    options: [
      "Yes, joint life is the default.",
      "Yes, half premium each.",
      "Yes, but it doubles as a property plan.",
      "GPP is single-life -- each spouse needs their own policy. Quote two parallel GPPs sized to each person's income and CI need, and keep premium total within the household 10% budget."
    ],
    correct: 3,
    explanation: "GPP is single-life. Each spouse needs their own contract. Size each independently and budget the combined premium against the household income.",
    category: 'roleplay'
  },

  // Q105 -- correct: 0
  {
    question: "A 38-year-old self-employed contractor says: 'My income is unstable -- I might miss premiums.' How do you address this?",
    options: [
      "Be honest: GPP premiums are level and fixed (not flexible). Walk through Premium Pause (after 3 years, on involuntary retrenchment -- but does it apply to self-employed?). For variable income, suggest an ILP like APA/PLP for premium flexibility, or right-size GPP at the minimum sum assured (~$50-60/month).",
      "Tell them GPP premiums are flexible.",
      "Promise auto-pause anytime.",
      "Sell maximum coverage anyway."
    ],
    correct: 0,
    explanation: "Be honest: GPP is fixed, and Premium Pause is for involuntary retrenchment from employment. For genuinely variable income, recommend an ILP for flexibility, or size GPP minimally.",
    category: 'roleplay'
  },

  // Q106 -- correct: 2
  {
    question: "A 55-year-old client says: 'Is GPP still relevant for me?'",
    options: [
      "No -- only for under-30s.",
      "Yes, but quote only 5x for cheapness.",
      "Yes -- 15-year term still works (max entry 60), 20-year still works (max 55). Premiums will be higher, but the cash value is still useful as retirement supplement via IDF or partial withdrawal after 65. Default to 2x or 3x; avoid 5x since post-65 base would be tiny.",
      "Refuse to quote."
    ],
    correct: 2,
    explanation: "55 is workable: 15- or 20-year term applies. Skew toward 2x/3x for stronger residual coverage, and frame IDF + partial withdrawal as the retirement use-case.",
    category: 'roleplay'
  },

  // Q107 -- correct: 1
  {
    question: "A 30-year-old client with childhood asthma asks: 'Will I be rejected?'",
    options: [
      "Tell them not to disclose it.",
      "Be honest: pre-existing conditions are excluded for those specific conditions. AIA may load the premium or apply exclusions, or accept standard. Submit honestly with full disclosure -- non-disclosure voids the contract. If GPP is loaded heavily, consider OPAI on any existing AIA plan as a non-underwritten alternative.",
      "Promise standard rates.",
      "Promise full coverage with no exclusion."
    ],
    correct: 1,
    explanation: "Always submit with full disclosure. Pre-existing conditions are excluded; underwriting may still accept with loading. OPAI on existing AIA plans is one no-underwriting backup path.",
    category: 'roleplay'
  },

  // Q108 -- correct: 3
  {
    question: "A 27-year-old client says: 'I want to retire at 55 with a passive income.' How do you position GPP for that goal?",
    options: [
      "Promise GPP guarantees retirement income.",
      "Tell them GPP cannot help.",
      "Suggest term insurance only.",
      "GPP alone is not a retirement plan -- the IDF only starts at the later of multiplier expiry/premium-term end (so 65 at the earliest on a 65 drop-off). Recommend GPP for protection layer, plus a separate ILP/APA for retirement income generation. Frame the 25-year limited pay as ending right when retirement begins."
    ],
    correct: 3,
    explanation: "GPP's drawdown is age-bound (later of multiplier expiry or premium-term end, ending at 85). It is the protection layer; pair with an ILP/APA for active retirement income.",
    category: 'roleplay'
  },

  // Q109 -- correct: 0
  {
    question: "A client mid-pitch interrupts: 'Just tell me which multiplier you would pick.' How do you answer?",
    options: [
      "Recommend 3x as the balanced default with a 65 drop-off and 25-year term, then walk back through why 5x and 2x didn't fit. Use the rocket-ship and travel-class analogies if needed.",
      "Refuse to recommend.",
      "Recommend 5x for the highest commission.",
      "Recommend 2x without explaining."
    ],
    correct: 0,
    explanation: "Default to 3x with the 65 drop-off and 25-year term. Use simple analogies and contrast with why 5x and 2x didn't fit -- never silently default for the client.",
    category: 'roleplay'
  },

  // Q110 -- correct: 2
  {
    question: "A client's spouse jumps in: 'We have $200k saved -- we don't need insurance.' How do you engage them both?",
    options: [
      "Ignore the spouse.",
      "Tell the spouse they are wrong.",
      "Validate the savings position. Then make the savings-vs-insurance distinction: $200k can vanish in one major CI episode (Singapore averages can run $100-200k for major treatment). GPP protects savings from being depleted while adding cash value. Budget GPP within 10% of household income so savings stay intact.",
      "Recommend they convert all savings into a single annual GPP premium."
    ],
    correct: 2,
    explanation: "Validate, then differentiate: savings deplete on a single major event; insurance shields the savings. Budget so GPP doesn't disrupt their existing savings buffer.",
    category: 'roleplay'
  },

  // Q111 -- correct: 1
  {
    question: "A 28-year-old client wants $500k of CI cover but can only afford $250/month. What do you propose?",
    options: [
      "Tell them $500k is impossible at that budget.",
      "Reduce sum assured to a number $250/month buys (likely ~$300k on 3x), and use the half-half Early CI strategy to fit Early CI within the budget. Plan to use OPAI later (within 90 days of marriage, child birth, etc.) to scale up coverage without further underwriting.",
      "Push them to borrow.",
      "Sell $500k 5x and ignore the post-65 drop."
    ],
    correct: 1,
    explanation: "Right-size sum assured to budget, use half-half ECI for affordability, and pre-plan OPAI as the no-underwriting upgrade path on qualifying life events.",
    category: 'roleplay'
  },

  // Q112 -- correct: 3
  {
    question: "Client asks mid-quote: 'What happens if I just take the cash value out at 65 and surrender the policy?'",
    options: [
      "You'll get back nothing.",
      "Encourage immediate surrender.",
      "Lie and say the policy continues.",
      "Walk through the trade-off honestly: surrender at 65 returns cash value (often higher than premiums paid -- e.g. $56k in, $77k out on a sample illustration), but coverage ends. Better alternatives: partial withdrawal (reduces coverage proportionally) or IDF 50% (5%/yr for 10 years, 50% SA continues)."
    ],
    correct: 3,
    explanation: "Lay out three choices honestly: full surrender (lose cover), partial withdrawal (proportional reduction), or 50% IDF (annuity-style, 50% SA continues). Let the client choose.",
    category: 'roleplay'
  },

  // Q113 -- correct: 0
  {
    question: "Client says: 'Show me the 25 vs 35 comparison.' How do you walk through it on iPOS?",
    options: [
      "Pull up two side-by-side quotes for the same coverage. At age 25 / $300k / 3x / 25-yr: ~$2,800/yr, 75 yrs of coverage, ~$285k cash value at maturity. At age 35: ~$4,160/yr, 65 yrs of coverage, lower cash value. Total premiums: $72k vs $104k. Use the warranty analogy: longer coverage AND cheaper.",
      "Promise identical numbers.",
      "Refuse to compare.",
      "Show only the 35-year-old quote."
    ],
    correct: 0,
    explanation: "Run two quotes side-by-side. Anchor on three numbers: annual premium (~$2.8k vs ~$4.2k), total premium ($72k vs $104k), cash value at maturity. Frame with the warranty analogy.",
    category: 'roleplay'
  },

  // Q114 -- correct: 2
  {
    question: "A risk-averse client says: 'I want the guaranteed cash value only -- ignore the bonuses.' How do you respond?",
    options: [
      "Promise the bonuses are guaranteed.",
      "Sell only term insurance.",
      "Be transparent: GPP has both guaranteed and non-guaranteed components. The guaranteed cash value alone gives lower yield than the illustrated total. Show them both columns in the BI; if guarantees-only still meets their needs, the case still holds. If not, pivot to an endowment or guaranteed-element-heavy product.",
      "Refuse to discuss."
    ],
    correct: 2,
    explanation: "Show guaranteed and non-guaranteed columns separately. If guaranteed-only is still attractive, GPP fits; if not, recommend a more guaranteed product. Never gloss over the non-guaranteed nature of bonuses.",
    category: 'roleplay'
  },

  // Q115 -- correct: 1
  {
    question: "A client's parent calls afterwards saying: 'My son was sold an expensive whole-life plan -- this is wrong.' How do you respond?",
    options: [
      "Cancel the policy without speaking to the client.",
      "Stay professional. Offer to include the parent in a follow-up meeting. Walk them through the CST need analysis, the 10% budget rule, and the cash-value benefit. If after a fair conversation they still want to cancel, support a clean cancellation within free-look (14 days).",
      "Argue with the parent.",
      "Hide from the call."
    ],
    correct: 1,
    explanation: "Professional response: include the parent, walk them through the rationale, respect the free-look period if they still object. Do not cancel unilaterally without speaking to the client.",
    category: 'roleplay'
  },

  // Q116 -- correct: 3
  {
    question: "A client mid-meeting says: 'Forget the riders, just sell me the cheapest base GPP.' How do you proceed?",
    options: [
      "Force-fit Early CI anyway.",
      "Argue with the client.",
      "Walk away.",
      "Respect the budget call. Quote the base GPP without Early CI, document the discussion that the recommendation was Early CI + base, and ask the client to acknowledge they declined. Plan a 6-month follow-up to revisit Early CI when budget improves."
    ],
    correct: 3,
    explanation: "Respect the client's budget decision, document the rejected recommendation properly (regulatory compliance), and book a follow-up to re-pitch Early CI later.",
    category: 'roleplay'
  },

  // Q117 -- correct: 0
  {
    question: "A client compares GPP to a Prudential whole-life plan they were quoted. What is the right approach?",
    options: [
      "Don't trash the competitor. Highlight GPP's specific strengths in the client's case: 73 vs 37 LIA-standard CI conditions on Major CI rider, ~150 conditions on Early CI rider, the IDF flexibility, Premium Pause for retrenchment, AIA Vitality integration, and OPAI without further underwriting. Anchor on the BI numbers.",
      "Tell the client Prudential is fraudulent.",
      "Match Prudential's quote regardless of profitability.",
      "Refuse to discuss the competitor."
    ],
    correct: 0,
    explanation: "Never trash competitors. Anchor on GPP's specific strengths (CI count, IDF, Premium Pause, Vitality, OPAI) and let the BI numbers speak.",
    category: 'roleplay'
  },

  // Q118 -- correct: 2
  {
    question: "A 60-year-old client with a 25-year-old GPP policy asks: 'Should I cash out everything now?'",
    options: [
      "Recommend total surrender.",
      "Tell them to keep paying.",
      "Walk through three options: (1) Partial withdrawal -- access cash but reduce coverage proportionally; (2) IDF 50% from age 65 -- 5%/yr for 10 years, 50% SA continues; (3) IDF 100% -- 10%/yr for 10 years, policy terminates. Don't surrender outright; the long-held policy has accumulated bonuses they would otherwise lose.",
      "Refuse to advise."
    ],
    correct: 2,
    explanation: "Don't outright surrender a 25-year-old policy. Lay out partial withdrawal, IDF 50%, and IDF 100% as three legitimate exit paths and let the client choose.",
    category: 'roleplay'
  },

  // Q119 -- correct: 1
  {
    question: "A young couple expecting their first child asks: 'How do we cover the baby?'",
    options: [
      "Buy a baby insurance plan only.",
      "Add the Mum-to-Baby (or 'Mum-to-be') rider on the mother's GPP -- it gives the child guaranteed life insurance coverage without underwriting after birth, and covers pregnancy complications. Plan a separate child plan after birth, possibly using the rider's converted child policy.",
      "Wait until the baby turns 3.",
      "Buy GPP for the unborn child directly."
    ],
    correct: 1,
    explanation: "Mum-to-Baby rider gives the child no-underwriting coverage post-birth and covers pregnancy complications. After birth, transition to a proper child plan.",
    category: 'roleplay'
  },

  // Q120 -- correct: 3
  {
    question: "A client just signed and asks: 'When does the cooling-off start?' How do you set proper expectations?",
    options: [
      "Tell them no cooling-off exists.",
      "Promise lifetime cancellation rights.",
      "Promise instant refund anytime.",
      "Free-look is 14 days from receipt of the policy document. They can cancel within that window with full refund (less any medical fees). Also flag that the first-year suicide exclusion runs from policy inception, not from free-look end. Confirm policy document delivery."
    ],
    correct: 3,
    explanation: "14-day free-look from receipt of the policy document. Confirm delivery so the client knows their cancellation window; flag the first-year suicide exclusion at the same time.",
    category: 'roleplay'
  },

  // ============================================================
  // CURRICULUM ALIGNMENT ADDITIONS (Q121-Q130) -- per audit Section D
  // ============================================================

  // Q121 -- correct: 2
  {
    question: "Per the Product Brochure, until what age does Special Conditions coverage on the Early CI rider remain in force, and what is the per-condition payout structure?",
    options: [
      "Ends at age 21 -- 50% of SA, capped at S$50,000",
      "Ends at age 65 -- 100% of SA, no cap",
      "Ends at age 85 -- additional 20% of basic coverage amount or S$25,000 (whichever lower), 1 claim per condition, max 5 claims",
      "No end age -- 10% of SA, capped at S$10,000"
    ],
    correct: 2,
    explanation: "Per Brochure footnote 7 (Page 9): Special Conditions cease at age 85, payout is additional 20% of basic coverage or S$25,000 (whichever lower), 1 claim per condition with a 5-claim policy total.",
    category: 'product-facts'
  },

  // Q122 -- correct: 0
  {
    question: "Per the Product Summary, how does the PowerUp Dollar adjust at each policy anniversary based on AIA Vitality status?",
    options: [
      "Bronze -10%, Silver -5%, Gold 0%, Platinum +5% of Base PowerUp Dollar; capped at 150% of Base PUD",
      "Bronze -$500/yr, Platinum +$500/yr, no cap",
      "All statuses give the same flat 10% boost regardless of tier",
      "Adjustments only apply to riders, not the base plan"
    ],
    correct: 0,
    explanation: "Per Product Summary Page 12 (Adjustment of PowerUp Dollar at Policy Anniversary): percentage-of-Base-PUD adjustments by Vitality status, with a Minimum Limit of 0 and Maximum Limit of 150% of Base PUD.",
    category: 'product-facts'
  },

  // Q123 -- correct: 2
  {
    question: "Per the Product Summary, what is the TPD per-life aggregate limit across all AIA policies and supplementary benefits on the same life?",
    options: [
      "S$1,000,000",
      "S$3,000,000",
      "S$7,500,000",
      "Unlimited"
    ],
    correct: 2,
    explanation: "Per Product Summary Page 3: the TPD benefit is subject to a per-life limit of S$7,500,000, aggregated with other policies or supplementary benefits issued on the same life.",
    category: 'product-facts'
  },

  // Q124 -- correct: 1
  {
    question: "Which group of clients is explicitly excluded from exercising the Premium Pause Option?",
    options: [
      "Anyone earning under S$50,000/year",
      "Self-employed or family-business employees, those who resigned or retired voluntarily, and full-time MPs (Members of Parliament)",
      "Anyone aged over 60",
      "Clients on a 25-year premium term"
    ],
    correct: 1,
    explanation: "Per Product Summary Page 7 (Premium Pass Option exclusions): self-employed, family-business employed, voluntary resignation/retirement, and other voluntary terminations are excluded. Day 5 curriculum specifically calls out full-time MPs as a named exclusion in the FC training script.",
    category: 'compliance'
  },

  // Q125 -- correct: 1
  {
    question: "What is the actual close-the-deal moment in the GPP 6-phase pitch flow, and what binary does the FC ask?",
    options: [
      "Phase 4 (iPOS+ quotation): 'Yearly or monthly premium?'",
      "Phase 5 (Layer Early CI): 'Would you prefer with Early CI or without Early CI?'",
      "Phase 1 (Open): 'Do you want CI cover?'",
      "Phase 6 (Package): 'GPP or term?'"
    ],
    correct: 1,
    explanation: "Day 2 + Day 5 specify Phase 5 ends with a binary 'with or without Early CI' -- by then the prospect has cleared all four hoops and the binary is the formal close.",
    category: 'closing'
  },

  // Q126 -- correct: 1
  {
    question: "Per the source-explicit packaging strategy, which product covers Major CI / death / savings, and which product covers Early CI and recurring CI claims?",
    options: [
      "GPP for Early CI; UCC for Major CI",
      "GPP for Major CI / death / savings; UCC (Universal Critical Care) for Early CI and recurring CI claims",
      "Both Major and Early CI inside GPP only",
      "UCC for everything; GPP only for cash value"
    ],
    correct: 1,
    explanation: "Day 4 Part 2 (lines 235-258) cites the verbatim trainer pattern -- sell only Major CI inside GPP and package Early CI / multi-claim coverage via a separate UCC plan.",
    category: 'sales-angles'
  },

  // Q127 -- correct: 1
  {
    question: "Which rider is the highest-leverage adjacent sell for an expectant client, and what does it specifically guarantee?",
    options: [
      "OPAI -- guarantees a discount on future plans",
      "Mum-to-Baby Protect -- covers pregnancy complications for the mother AND guarantees the child's future insurability with no medical underwriting at birth",
      "Payer Benefit -- pays the mother's premium during maternity leave",
      "Vitality Platinum -- guarantees no premium increase post-birth"
    ],
    correct: 1,
    explanation: "Day 4 Part 2 (lines 285-301) calls Mum-to-Baby the highest-leverage rider in AIA's stack for expectant clients -- pregnancy complications + locked-in child insurability with no underwriting.",
    category: 'sales-angles'
  },

  // Q128 -- correct: 1
  {
    question: "Per Day 5 compliance, which FOUR disclosures must be delivered as a single recited block before the iPOS+ binary close?",
    options: [
      "Cover amount / premium / pay term / multiplier",
      "Bonuses non-guaranteed / early-year cash value below premiums paid / accelerated CI reduces death benefit / Premium Pause is a 12-month interest-free loan, not a waiver",
      "Free-look / GIRO date / Vitality enrolment / FHR",
      "Suicide / pre-existing / 90-day wait / war exclusion"
    ],
    correct: 1,
    explanation: "Day 5 Part 1 prescribes the RNF-clean closing block: non-guaranteed bonus, early cash-value gap, accelerated CI mechanic, Premium Pause as loan.",
    category: 'compliance'
  },

  // Q129 -- correct: 2
  {
    question: "The curriculum says 'GPP is the wrong product' if the client's time horizon is under what threshold?",
    options: [
      "Under 3 years",
      "Under 5 years",
      "Under 10 years (early-year cash value below premiums paid; recommend pure term + a separate savings plan instead)",
      "Under 20 years"
    ],
    correct: 2,
    explanation: "Day 5 Part 1 explicitly lists time-horizon-under-10-years as one of three 'walk away from the case' rules, because the early-year surrender value is below total premiums paid.",
    category: 'suitability'
  },

  // Q130 -- correct: 1
  {
    question: "In the GPP TPD definition, what change happens at the policy anniversary on or immediately following the Insured's 65th birthday?",
    options: [
      "TPD coverage ends entirely",
      "TPD definition switches from the 'loss of two limbs / two eyes / one of each + inability to work 6 months' test to an ADL test (inability to perform at least 2 of 6 ADLs for 6 consecutive months); coverage continues until age 70",
      "TPD becomes a partial-disability test",
      "Premium doubles to maintain TPD cover"
    ],
    correct: 1,
    explanation: "Per Product Summary Page 2: pre-65 uses the severe-disability test (loss of 2 limbs/eyes or combinations + 6-month inability to work); from age 65, it switches to the ADL test (2 of 6 -- transferring, mobility, toileting, dressing, washing, feeding); TPD coverage ends at age 70.",
    category: 'product-facts'
  }
];
