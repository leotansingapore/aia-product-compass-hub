# Live quiz fixes (2026-11-01)

The study and exam pages read the live table `question_bank_questions`. Those rows were edited directly between 2026-06-30 and 2026-07-03, so the repo's corrected bank text could not be copied over them. This list carries each product-fact correction into the row's current wording and changes nothing else. The Presenter is the source of truth; each entry names the Presenter file it comes from.

- Change file: `scripts/quiz-live-fixes-2026-11-01.json` (row id, field, live old value, new value, reason, Presenter source, and the full live snapshot used as the guard).
- Apply with `scripts/update-question-bank-product-facts.mjs` (`--dry-run` first). A row is updated only while all four fields still equal the snapshot.
- Display note: quoted live text below shows em dashes and curly quotes as ASCII, and bold marks the changed words. The JSON holds the exact text.

**133 rows to change**, 67 questions already correct, 44 questions with no live row.

| Product | Rows to change | Already correct | No live row |
|---|---|---|---|
| AIA Platinum Wealth Venture | 44 | 23 | 3 |
| AIA HealthShield Gold Max | 33 | 7 | 4 |
| AIA Ultimate Critical Cover | 18 | 4 | 30 |
| AIA Pro Achiever 3.0 | 11 | 12 | 0 |
| AIA Guaranteed Protect Plus (IV) | 15 | 3 | 5 |
| AIA Pro Lifetime Protector (II) | 2 | 10 | 1 |
| AIA Solitaire PA (II) | 10 | 8 | 1 |

## Rows whose correct answer moves

- AIA Platinum Wealth Venture, exam sort 9 (`2315b9a4-0ab0-40b5-8d8d-cc45cbbabe7c`): option 1 -> option 3 ("Cash and SRS contributions"). PWV is not cash only: the 1-year single premium is paid from SRS only, so the right option is now "Cash and SRS contributions" (CPF still not accepted).
- AIA Platinum Wealth Venture, study sort 21 (`413e8ca2-9cda-4b87-92a2-595e58c51862`): option 1 -> option 2 ("Cash and SRS contributions only are accepted"). PWV is not cash only: the 1-year single premium is paid from SRS only, so the right option is now "Cash and SRS contributions only" (CPF still not accepted).
- AIA Platinum Wealth Venture, study sort 92 (`28e0f81a-9f47-4fbf-b7af-d32934d29b81`): option 2 -> option 3 ("'SRS is accepted for PWV's 1-year single premium, although CPF specifically is not allowed for this plan.'"). SRS is accepted for the 1-year single premium, so "CPF and SRS are not accepted" is wrong and the SRS-yes, CPF-no option is now right.
- AIA HealthShield Gold Max, study sort 55 (`8fe7532b-f72e-420f-b18e-96881a61c0ff`): option 2 -> option 3 ("Both insurers actually offer a fully unlimited lifetime claim limit on the top plan"). Competing flagship private-hospital IPs also have unlimited lifetime limits, so the right answer is "both unlimited" (option 3), not "AIA unlimited vs capped competitors".
- AIA Pro Achiever 3.0, study sort 164 (`a278299f-9cb8-4dd7-bc66-24487f10b6c8`): option 1 -> option 0 ("No maturity; it is a whole-life policy"). Pro Achiever 3.0 policy term is whole life, not maturity at age 100.

## AIA Platinum Wealth Venture

### exam sort 1 (`9ea59767-8b0c-4831-9543-319688a5734f`)

- Why: Surrender schedule already correct (60/60/50/40/30/20/10%, 0% from Year 8); version 2.0 / PS v1.0 042025 -> 3.0 / PS ver 1.0 (Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx:813; src/lib/translations/fiveYearOtherDetailsTab.ts:128`.
- question: "...the surrender charge schedule for PWV **2.0** in Years 1 through 7?..." -> "...the surrender charge schedule for PWV **3.0** in Years 1 through 7?..."
- explanation: "...Per the canonical PWV **2.0** Product Summary (v1.0 042025, Section 5.5),..." -> "...Per the canonical PWV **3.0** Product Summary (ver 1.0, Oct 2026,..."
- explanation: "...the canonical PWV 2.0 Product Summary **(v1.0 042025,** Section 5.5), the surrender charge on..." -> "...the canonical PWV 3.0 Product Summary **(ver 1.0, Oct 2026,** Section 5.5), the surrender charge on..."
- explanation: "...1-2 figure is incorrect for PWV **2.0.** ..." -> "...1-2 figure is incorrect for PWV **3.0.** ..."

### exam sort 2 (`799bfca0-8a58-4ea1-b6a8-a8f3a710e3e5`)

- Why: Investment Bonus years already correct (start of Years 8 to 11); Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:715-717`.
- question: "...the Investment Bonus work in PWV **2.0?** ..." -> "...the Investment Bonus work in PWV **3.0?** ..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.4), the Investment Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.4), the Investment Bonus..."

### exam sort 3 (`344b5587-e814-4a7d-8fe8-37ef63815525`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Welcome Bonus band figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Under PWV **2.0,** what total Welcome Bonus does a..." -> "...Under PWV **3.0,** what total Welcome Bonus does a..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.3), the Welcome Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.3), the Welcome Bonus..."

### exam sort 4 (`50785f27-121f-47fc-be24-b4c69db88fcb`)

- Why: Premium Holiday charge already stops once the 5 years of premiums are paid; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/lib/translations/fiveYearOtherDetailsTab.ts:120`.
- question: "...Premium Holiday charge if a PWV **2.0** policyholder stops paying after only the..." -> "...Premium Holiday charge if a PWV **3.0** policyholder stops paying after only the..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 5.4), the Premium Holiday..." -> "...Per the canonical PWV **3.0** PS (Section 5.4), the Premium Holiday..."

### exam sort 8 (`3d95ba75-db2d-4045-9417-95da7c23bc95`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); Performance Bonus figures already correct. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...is the Performance Bonus in PWV **2.0?** ..." -> "...is the Performance Bonus in PWV **3.0?** ..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.5), the Performance Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.5), the Performance Bonus..."

### exam sort 9 (`2315b9a4-0ab0-40b5-8d8d-cc45cbbabe7c`)

- Why: PWV is not cash only: the 1-year single premium is paid from SRS only, so the right option is now "Cash and SRS contributions" (CPF still not accepted). Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- correct_answer: 1 -> 3
- explanation: "... **PWV** premiums are payable using cash only...." -> "... **PWV's 5-year and 2-year** premiums are payable in cash, and..."
- explanation: "...PWV premiums are payable **using cash only. Neither** CPF nor SRS contributions are accepted...." -> "...5-year and 2-year premiums are payable **in cash, and the 1-year single premium is paid from SRS only, not cash.** CPF contributions are not accepted...."
- explanation: "...payable using cash only. Neither CPF **nor SRS** contributions are accepted. This means all..." -> "...from SRS only, not cash. CPF **(nothing)** contributions are not accepted...."
- explanation: "...Neither CPF nor SRS contributions are **(nothing)** accepted. This means all premiums come..." -> "...only, not cash. CPF contributions are **not** accepted...."
- explanation: "...CPF nor SRS contributions are accepted. **This means all premiums come from the policyholder's liquid assets.** ..." -> "...cash. CPF contributions are not accepted. **(nothing)** ..."

### exam sort 23 (`7adada9e-9782-4623-95ca-440ff61368e5`)

- Why: Surrender taper already correct (60% to 0% from Year 8); Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx:813; src/lib/translations/fiveYearOtherDetailsTab.ts:128`.
- explanation: "...builds trust. Per the canonical PWV **2.0** PS the surrender charge is 60%..." -> "...builds trust. Per the canonical PWV **3.0** PS the surrender charge is 60%..."

### exam sort 27 (`4b0d82c5-edce-4884-a791-8b0664106211`)

- Why: 3.0 is the current version, so the client can no longer be waiting for Version 3.0. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...A client says: 'I'll wait for **Version 3.0** -- maybe the bonuses will be..." -> "...A client says: 'I'll wait for **the next version** -- maybe the bonuses will be..."
- option 0: "...Confirm that **Version 3.0** is indeed coming very soon with..." -> "...Confirm that **a new version** is indeed coming very soon with..."
- explanation: "...be more generous -- speculating about **Version 3.0** (option A) is both unfounded and..." -> "...be more generous -- speculating about **a new version** (option A) is both unfounded and..."

### exam sort 30 (`145a76b3-974c-4085-94fa-839e20d25ec5`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Secondary Insured figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.7), the Secondary Insured..." -> "...Per the canonical PWV **3.0** PS (Section 3.7), the Secondary Insured..."

### study sort 1 (`ac661253-197c-4c14-95aa-dd72e865c74f`)

- Why: 5 years is the main plan only; a 2-year term and a 1-year single premium paid from SRS are also offered. Source: `src/hooks/useFiveYearPlanCalculation.ts:85-90,103-127; src/components/FiveYearPlan/FiveYearInputForm.tsx:239-252; src/data/pwvFeatureComparison.ts:72`.
- question: "...of premium payments are required for **(nothing)** Platinum Wealth Venture?..." -> "...of premium payments are required for **the main plan of** Platinum Wealth Venture?..."
- explanation: "... **PWV** has a limited premium payment term..." -> "... **PWV's main plan** has a limited premium payment term..."
- explanation: "...which no further premiums are required. **(nothing)** ..." -> "...which no further premiums are required. **A 2-year term and a 1-year single premium paid from SRS are also offered.** ..."

### study sort 2 (`b739a354-614a-4aa6-9832-21badc5a43ee`)

- Why: S$18,000 (S$1,500 a month) is the 5-year plan minimum; the 2-year plan needs S$48,000 a year and the 1-year single premium S$15,000. Source: `src/hooks/useFiveYearPlanCalculation.ts:107,114,121`.
- question: "...is the minimum annual premium for **(nothing)** Platinum Wealth Venture?..." -> "...is the minimum annual premium for **the 5-year plan of** Platinum Wealth Venture?..."
- explanation: "...The minimum annual premium **(nothing)** is S$18,000 (or S$1,500/month), reflecting its..." -> "...The minimum annual premium **on the 5-year plan** is S$18,000 (or S$1,500/month), reflecting its..."
- explanation: "...its positioning as a high-net-worth product. **(nothing)** ..." -> "...its positioning as a high-net-worth product. **The 2-year plan needs S$48,000 a year and the 1-year single premium S$15,000.** ..."

### study sort 4 (`81ecdba5-0fbd-476f-ac92-884ca8315ebd`)

- Why: Top band already S$42,000+ = 3%/4%/5% (12%); Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:111`.
- question: "...Welcome Bonus for a S$42,000/year PWV **2.0** policy?..." -> "...Welcome Bonus for a S$42,000/year PWV **3.0** policy?..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.3), premiums of S$42,000..." -> "...Per the canonical PWV **3.0** PS (Section 3.3), premiums of S$42,000..."

### study sort 5 (`f172a6a6-b8c1-4f8f-9198-868c04f57cef`)

- Why: Middle band already S$24,000-41,999 = 3% in Year 1 only; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:111`.
- question: "...Welcome Bonus for a S$24,000/year PWV **2.0** policy?..." -> "...Welcome Bonus for a S$24,000/year PWV **3.0** policy?..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.3), the S$24,000-S$41,999 band..." -> "...Per the canonical PWV **3.0** PS (Section 3.3), the S$24,000-S$41,999 band..."

### study sort 6 (`c84cea84-d060-41da-8e35-255aedb71a22`)

- Why: Investment Bonus years already Years 8 to 11; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:715-717`.
- question: "...the Investment Bonus paid in PWV **2.0?** ..." -> "...the Investment Bonus paid in PWV **3.0?** ..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.4), the Investment Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.4), the Investment Bonus..."

### study sort 7 (`4fddea39-2def-4531-be78-b7973dd8df04`)

- Why: Investment Bonus already 2.5% a year across Years 8 to 11; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:109,715-717`.
- question: "...Bonus rate per year in PWV **2.0?** ..." -> "...Bonus rate per year in PWV **3.0?** ..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.4), the Investment Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.4), the Investment Bonus..."
- explanation: "...7%' figure is incorrect for PWV **2.0.** ..." -> "...7%' figure is incorrect for PWV **3.0.** ..."

### study sort 8 (`0cdc90bc-db67-4164-b80a-c933f94adb01`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); Performance Bonus figures already correct. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...the Performance Bonus rate in PWV **2.0** and when does it start?..." -> "...the Performance Bonus rate in PWV **3.0** and when does it start?..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.5), the Performance Bonus..." -> "...Per the canonical PWV **3.0** PS (Section 3.5), the Performance Bonus..."

### study sort 9 (`8de1bcd4-ac66-4776-9966-e7d1e9226716`)

- Why: 3.6% for 7 years is the 5-year plan rate; the 2-year and 1-year plans charge 2.9%. Source: `src/hooks/useFiveYearPlanCalculation.ts:108,115,122,702-704`.
- question: "...What is the supplementary charge rate **in PWV?** ..." -> "...What is the supplementary charge rate **on the PWV 5-year plan?** ..."
- explanation: "...the first 7 policy years only. **(nothing)** ..." -> "...the first 7 policy years only. **The 2-year and 1-year plans charge 2.9% p.a. over the same 7 years.** ..."

### study sort 11 (`7e28f32c-aacc-4f2a-ad2a-d4398e04f0fb`)

- Why: Year 1 surrender charge already 60%; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx:813; src/lib/translations/fiveYearOtherDetailsTab.ts:128`.
- question: "...1 and 2 of a PWV **2.0** policy?..." -> "...1 and 2 of a PWV **3.0** policy?..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 5.5), the surrender charge..." -> "...Per the canonical PWV **3.0** PS (Section 5.5), the surrender charge..."
- explanation: "...sometimes quoted is incorrect for PWV **2.0.** ..." -> "...sometimes quoted is incorrect for PWV **3.0.** ..."

### study sort 12 (`51d99374-6ed0-4fa4-98c7-6a02273ea0e9`)

- Why: Already marks 0% from Year 8; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx:813; src/lib/translations/fiveYearOtherDetailsTab.ts:128`.
- question: "...there no surrender charges in PWV **2.0?** ..." -> "...there no surrender charges in PWV **3.0?** ..."
- explanation: "...8 onwards. Per the canonical PWV **2.0** PS the schedule is Y1: 60%,..." -> "...8 onwards. Per the canonical PWV **3.0** PS the schedule is Y1: 60%,..."

### study sort 16 (`ad1a28f7-7422-4557-8f82-c59c8c802d85`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Secondary Insured age figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...appointing a Secondary Insured in PWV **2.0?** ..." -> "...appointing a Secondary Insured in PWV **3.0?** ..."
- explanation: "...Per the canonical PWV **2.0** PS (Section 3.7), the Secondary Insured..." -> "...Per the canonical PWV **3.0** PS (Section 3.7), the Secondary Insured..."

### study sort 21 (`413e8ca2-9cda-4b87-92a2-595e58c51862`)

- Why: PWV is not cash only: the 1-year single premium is paid from SRS only, so the right option is now "Cash and SRS contributions only" (CPF still not accepted). Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- correct_answer: 1 -> 2
- explanation: "... **PWV** premiums are payable using cash only...." -> "... **PWV's 5-year and 2-year** premiums are payable using cash, and..."
- explanation: "...PWV premiums are payable using **cash only.** CPF and SRS contributions are not..." -> "...and 2-year premiums are payable using **cash, and the 1-year single premium is paid from SRS only, not cash.** CPF contributions are not accepted...."
- explanation: "...are payable using cash only. CPF **and SRS** contributions are not accepted...." -> "...from SRS only, not cash. CPF **(nothing)** contributions are not accepted...."

### study sort 29 (`d1c119c5-57e5-40ab-860d-ceeca0bf8b32`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the income fund figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Which PWV **2.0** fund is designed to pay quarterly..." -> "...Which PWV **3.0** fund is designed to pay quarterly..."

### study sort 37 (`8bb1c644-a700-40b8-ad41-54d28aad1f07`)

- Why: Premium Holiday figures already stop at the 5th premium; PS v1.0 042025 / 2.0 -> PS ver 1.0 (Oct 2026) / 3.0. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/lib/translations/fiveYearOtherDetailsTab.ts:120`.
- explanation: "...Per PWV **2.0** PS v1.0 042025 Section 5.4, after..." -> "...Per PWV **3.0** PS ver 1.0 (Oct 2026) Section..."
- explanation: "...Per PWV 2.0 PS **v1.0 042025** Section 5.4, after only the 1st..." -> "...Per PWV 3.0 PS **ver 1.0 (Oct 2026)** Section 5.4, after only the 1st..."

### study sort 62 (`4287ed2e-38a7-4a5d-b95b-3abce322a87e`)

- Why: The current version is 3.0, so every version number moves up one (current 3.0, previous 2.0, hypothetical next 4.0), as in the repo. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...present the difference between PWV Version **1.0** and 2.0 to a new prospect?..." -> "...present the difference between PWV Version **2.0** and 3.0 to a new prospect?..."
- question: "...difference between PWV Version 1.0 and **2.0** to a new prospect?..." -> "...difference between PWV Version 2.0 and **3.0** to a new prospect?..."
- option 0: "...Show that Version **2.0** carries higher bonuses and lower charges..." -> "...Show that Version **3.0** carries higher bonuses and lower charges..."
- option 1: "...what is available now under Version **2.0** without dwelling on version differences..." -> "...what is available now under Version **3.0** without dwelling on version differences..."
- option 2: "...Tell them an improved Version **3.0** launches soon, so it is worth..." -> "...Tell them an improved Version **4.0** launches soon, so it is worth..."
- option 3: "...Explain that Version **1.0** was the better deal and they..." -> "...Explain that Version **2.0** was the better deal and they..."
- explanation: "...Present the current offering (Version **2.0)** confidently. Dwelling on past versions creates..." -> "...Present the current offering (Version **3.0)** confidently. Dwelling on past versions creates..."

### study sort 74 (`a857e71e-7da3-4488-9b8e-e3d9473742bf`)

- Why: 3.0 is the current version, so the objection no longer names Version 2.0 and the distractor no longer promises Version 3.0. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...objects: 'The welcome bonus is lower **(nothing)** in Version 2.0 than 1.0.' How..." -> "...objects: 'The welcome bonus is lower **now than** in Version 1.0.' How do you..."
- question: "...welcome bonus is lower in Version **2.0 than** 1.0.' How do you handle this?..." -> "...is lower now than in Version **(nothing)** 1.0.' How do you handle this?..."
- option 3: "...Agree, and promise that the **upcoming Version 3.0** will restore the higher bonus rates..." -> "...Agree, and promise that the **next version** will restore the higher bonus rates..."

### study sort 79 (`6200af61-1fef-4019-848e-25f471dc7ba3`)

- Why: 3.0 is the current version, so the prospect can no longer be waiting for Version 3.0. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...for the next version  -  maybe **Version 3.0** will be better.' What do you..." -> "...for the next version  -  maybe **it** will be better.' What do you..."
- option 0: "...Confirm that a stronger **Version 3.0** is coming soon and is worth..." -> "...Confirm that a stronger **new version** is coming soon and is worth..."

### study sort 84 (`06f8b5ad-709a-481b-8b92-90dd6fa0a9be`)

- Why: The client's premise is wrong: the 1-year single premium (from S$15,000) is paid from SRS only; only CPF is ruled out. Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121; src/data/changelog.ts:49`.
- option 1: "...Explain **cash funding keeps their** CPF and SRS free, and PWV's..." -> "...Explain **the 1-year single premium is paid from SRS, from S$15,000; only** CPF is ruled out..."
- option 1: "...Explain cash funding keeps their CPF **and SRS free, and PWV's bonuses offset the outlay** ..." -> "...from SRS, from S$15,000; only CPF **is ruled out** ..."
- explanation: "...Reframe: **(nothing)** using cash preserves their CPF/SRS balances..." -> "...Reframe: **PWV 3.0's 1-year single premium (from S$15,000) is paid from SRS only, not cash, so only CPF is ruled out. For the regular-premium plans,** using cash preserves their CPF balances..."
- explanation: "...Reframe: using cash preserves their **CPF/SRS** balances for housing, healthcare, and retirement...." -> "...regular-premium plans, using cash preserves their **CPF** balances for housing, healthcare, and retirement...."

### study sort 92 (`28e0f81a-9f47-4fbf-b7af-d32934d29b81`)

- Why: SRS is accepted for the 1-year single premium, so "CPF and SRS are not accepted" is wrong and the SRS-yes, CPF-no option is now right. Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- option 3: "...'SRS is accepted for **PWV,** although CPF specifically is not allowed..." -> "...'SRS is accepted for **PWV's 1-year single premium,** although CPF specifically is not allowed..."
- correct_answer: 2 -> 3
- explanation: "... **PWV premiums are payable using cash only. Neither** CPF nor SRS contributions are accepted..." -> "... **(nothing)** CPF contributions are not accepted for..."
- explanation: "...payable using cash only. Neither CPF **nor SRS** contributions are accepted for this product...." -> "...CPF **(nothing)** contributions are not accepted for this..."
- explanation: "...Neither CPF nor SRS contributions are **(nothing)** accepted for this product...." -> "...CPF contributions are **not** accepted for this product. PWV 3.0's..."
- explanation: "...contributions are accepted for this product. **(nothing)** ..." -> "...are not accepted for this product. **PWV 3.0's 1-year single premium is paid from SRS only, not cash, and the 5-year and 2-year premiums are paid in cash.** ..."

### study sort 104 (`23304b9f-39f0-4279-aa61-dd88429780f9`)

- Why: PWV is not cash only (the single premium is paid from SRS); the point that stands is that CPF is not accepted. Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- explanation: "...PWV **is cash only,** so CPF cannot be paid in..." -> "...PWV **does not accept CPF,** so CPF cannot be paid in..."

### study sort 116 (`1e6f2418-1d34-4b0d-a263-42717e7448b0`)

- Why: SRS can fund PWV: the 1-year single premium is paid from SRS only, so "cash only, SRS cannot fund the policy" is wrong. Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- option 2: "...Note **PWV is cash-funded,** but SRS withdrawals can be sequenced..." -> "...Note **SRS funds only PWV's single premium,** but SRS withdrawals can be sequenced..."
- explanation: "... **PWV** premiums are cash only, so SRS..." -> "... **PWV's regular** premiums are paid in cash, and..."
- explanation: "...PWV premiums are **cash only, so** SRS cannot fund the policy directly...." -> "...PWV's regular premiums are **paid in cash, and** SRS can fund only the 1-year..."
- explanation: "...premiums are cash only, so SRS **cannot** fund the policy directly. The planning..." -> "...are paid in cash, and SRS **can** fund only the 1-year single premium...."
- explanation: "...cash only, so SRS cannot fund **(nothing)** the policy directly. The planning value..." -> "...in cash, and SRS can fund **only** the 1-year single premium. The planning..."
- explanation: "...only, so SRS cannot fund the **policy directly.** The planning value is in sequencing:..." -> "...and SRS can fund only the **1-year single premium.** The planning value is in sequencing:..."

### study sort 154 (`0e3725fe-f387-4612-8251-2c0905860324`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the target profile figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...PWV **2.0** is built for a specific life-stage...." -> "...PWV **3.0** is built for a specific life-stage...."
- explanation: "...Day 1 defines PWV **2.0** as the pre-retiree spine product for..." -> "...Day 1 defines PWV **3.0** as the pre-retiree spine product for..."

### study sort 180 (`ae7030cf-101f-466d-8332-562e17f21a8b`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Year 1 surrender charge figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the canonical PWV **2.0** Product Summary (Section 5.5), what is..." -> "...Per the canonical PWV **3.0** Product Summary (Section 5.5), what is..."
- explanation: "...The canonical PWV **2.0** PS Section 5.5 sets the Year-1..." -> "...The canonical PWV **3.0** PS Section 5.5 sets the Year-1..."

### study sort 181 (`32ae6d08-5f14-4efa-a3bf-fac6978ac64c`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the 0% surrender year figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, from which policy year..." -> "...Per the PWV **3.0** Product Summary, from which policy year..."

### study sort 182 (`d6bf38ae-0f96-4506-82b3-db0007b94fde`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the partial-withdrawal factor figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary partial-withdrawal table (Section 5.6),..." -> "...Per the PWV **3.0** Product Summary partial-withdrawal table (Section 5.6),..."

### study sort 183 (`62a99c91-e81e-4cbf-b281-dfaa826e8fb3`)

- Why: Investment Bonus already Years 8 to 11; Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:715-717`.
- Note: Repo index 121 maps to live sort 183 (the live sort 121 row is a suitability question).
- question: "...Per the PWV **2.0** Product Summary, the Investment Bonus is..." -> "...Per the PWV **3.0** Product Summary, the Investment Bonus is..."

### study sort 184 (`e74a54ca-25c8-4839-8dd0-fa14015d5845`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Performance Bonus figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, what is the Performance..." -> "...Per the PWV **3.0** Product Summary, what is the Performance..."

### study sort 185 (`96258528-286d-40e6-badb-a7801c66c784`)

- Why: 3.60% for 7 years is the 5-year plan charge (2.9% on the other terms); Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026). Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/hooks/useFiveYearPlanCalculation.ts:108,115,122`.
- Note: Repo index 120 maps to live sort 185 (the live sort 120 row is a suitability question).
- question: "...Per the PWV **2.0** Product Summary, the Supplementary Charge runs..." -> "...Per the PWV **3.0** Product Summary, the Supplementary Charge on..."
- question: "...2.0 Product Summary, the Supplementary Charge **(nothing)** runs for how long and is..." -> "...3.0 Product Summary, the Supplementary Charge **on the 5-year plan** runs for how long and is..."

### study sort 186 (`b764fb6c-42fe-4747-b4e3-f14560e5a6f5`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Premium Holiday charge figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, what is the Premium..." -> "...Per the PWV **3.0** Product Summary, what is the Premium..."

### study sort 216 (`a50f0d73-98bb-41d3-b03e-e6c36bbbe6ae`)

- Why: Full surrender liquidity is from Year 8 (charges in Years 1-7 only), not Year 11; the repo made the same Case O fix (day-35 "after Y7"). Source: `src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx:813; src/lib/translations/fiveYearOtherDetailsTab.ts:128; src/data/pwvFeatureComparison.ts:187`.
- explanation: "...the capital intact (full flexibility from **Y8/Y11,** spouse inherits a working dividend engine)...." -> "...the capital intact (full flexibility from **Y8,** spouse inherits a working dividend engine)...."

### study sort 217 (`a5cfd702-ed0b-41b1-8ed9-2dd24425ccf2`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Death Benefit figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, what does the Death..." -> "...Per the PWV **3.0** Product Summary, what does the Death..."

### study sort 218 (`9be9f702-e9b3-47fe-9fe6-92c4d48b9999`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Accidental Death Benefit figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, what is the Accidental..." -> "...Per the PWV **3.0** Product Summary, what is the Accidental..."
- option 1: "...kind is offered under the PWV **2.0** policy at all..." -> "...kind is offered under the PWV **3.0** policy at all..."

### study sort 219 (`a463ba15-03bd-49c7-82cc-24fcc2ac4100`)

- Why: Version 2.0 -> 3.0 (current version; Product Summary ver 1.0, Oct 2026); the Secondary Insured rules figures are unchanged. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11`.
- question: "...Per the PWV **2.0** Product Summary, what are the rules..." -> "...Per the PWV **3.0** Product Summary, what are the rules..."

### study sort 220 (`7687d9de-90dd-4fbf-b05b-ef4e6f7b5a0f`)

- Why: PWV 3.0 is not cash only: the 1-year single premium is paid from SRS only (CPF still not accepted); version 2.0 -> 3.0. Source: `src/hooks/useFiveYearPlanCalculation.ts:88-90; src/data/pwvFeatureComparison.ts:5-11; src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- question: "...Per the PWV **2.0** Product Summary, in what currency and..." -> "...Per the PWV **3.0** Product Summary, in what currency and..."
- option 3: "...SGD only, cash **only,** and varying of the regular premium..." -> "...SGD only, cash **or SRS (single premium only),** and varying of the regular premium..."
- explanation: "...Per the PS: PWV **2.0** is S$-denominated and available in CASH..." -> "...Per the PS: PWV **3.0** is S$-denominated and available in cash..."
- explanation: "...2.0 is S$-denominated and available in **CASH ONLY** (not CPF, not SRS), and varying..." -> "...3.0 is S$-denominated and available in **cash** (not CPF), with the 1-year single..."
- explanation: "...and available in CASH ONLY (not **CPF, not SRS),** and varying the regular premium is..." -> "...S$-denominated and available in cash (not **CPF), with the 1-year single premium paid from SRS only,** and varying the regular premium is..."

### study sort 221 (`32946dee-06f6-4f7f-bd02-eb463e837dc5`)

- Why: PWV is not cash-only funded (the single premium is paid from SRS); what still rules out her CPF idea is that CPF is not accepted. Source: `src/components/FiveYearPlan/FiveYearInputForm.tsx:241,251; src/hooks/useFiveYearPlanCalculation.ts:90,121`.
- explanation: "...in Y1-Y2 per the PS) plus **cash-only** funding make it wrong for her...." -> "...in Y1-Y2 per the PS) plus **the lack of CPF** funding make it wrong for her...."

## AIA HealthShield Gold Max

### exam sort 0 (`14b58f21-26ec-4e45-8e99-23712c70600f`)

- Why: Max A limit is S$1M, up to S$1.35M at an Extended Partner Facility and S$2M at an AIA Partner Facility, not S$2M under a preferred provider. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- explanation: "...annual limit that steps up to **(nothing)** $2 million when the insured is..." -> "...annual limit that steps up to **$1.35 million at an Extended Partner Facility and** $2 million when the insured is..."
- explanation: "...million when the insured is hospitalised **under** an AIA preferred provider, covering a..." -> "...million when the insured is hospitalised **at** an AIA Partner Facility, covering a..."
- explanation: "...insured is hospitalised under an AIA **preferred provider,** covering a standard private hospital room..." -> "...insured is hospitalised at an AIA **Partner Facility,** covering a standard private hospital room..."

### exam sort 7 (`26f6e134-68c9-40ce-b44e-7c6c5b3c17af`)

- Why: Non-listed CTGTP is a VitalHealth Pro rider benefit (S$150,000, less 10% co-insurance); listed CTGTP is the base plan. Source: `src/data/ipFeatureComparison.ts:159-163,212-216`.
- option 3: "...$250,000 for listed **(nothing)** and $150,000 for non-listed, per indication..." -> "...$250,000 for listed **on the base plan** and $150,000 for non-listed with AIA..."
- option 3: "...$250,000 for listed and $150,000 for **non-listed,** per indication per lifetime..." -> "...the base plan and $150,000 for **non-listed with AIA Max VitalHealth Pro,** per indication per lifetime..."
- explanation: "...Listed CTGTP treatments are covered **(nothing)** up to $250,000 per indication per..." -> "...Listed CTGTP treatments are covered **by the base plan** up to $250,000 per indication per..."
- explanation: "...indication per lifetime, while non-listed treatments **have** a lower limit of $150,000. This..." -> "...indication per lifetime, while non-listed treatments **are covered only with the AIA Max VitalHealth Pro rider, at** a lower limit of $150,000 less..."
- explanation: "...treatments have a lower limit of **$150,000.** This benefit becomes effective from October..." -> "...rider, at a lower limit of **$150,000 less 10% co-insurance.** This benefit becomes effective from October..."

### exam sort 17 (`2921bca7-eae8-4557-916c-b18f3b725e1b`)

- Why: Competing flagship private-hospital IPs also have unlimited lifetime limits, so no competitor $3-5M lifetime cap. Source: `src/data/ipFeatureComparison.ts:175`.
- Note: Distractor [2] still mentions a hypothetical "$3-5M lifetime cap" as bad advice; left as a false distractor.
- question: "...should you position AIA's unlimited lifetime **limit against competitors with capped limits?** ..." -> "...should you position AIA's unlimited lifetime **limit?** ..."
- option 1: "...Note that rising costs can **drain a $3-5M cap over** a 20-year chronic illness, so unlimited..." -> "...Note that rising costs can **run** a 20-year chronic illness into millions,..."
- option 1: "...$3-5M cap over a 20-year chronic **illness,** so unlimited gives true lifetime protection..." -> "...costs can run a 20-year chronic **illness into millions,** so unlimited gives true lifetime protection..."
- explanation: "...means the policy never runs out. **(nothing)** ..." -> "...means the policy never runs out. **The other flagship private-hospital IPs are unlimited too (MOH comparison, Jun 2026), so do not claim a competitor caps it.** ..."

### exam sort 39 (`a79325ae-14e2-4062-a0a7-11b37e8f8349`)

- Why: Plan B S$1.2M limit applies at an AIA Partner Facility, not with a preferred provider. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:685`.
- explanation: "...$1M annual limit (up to $1.2M **with** an AIA preferred provider) at a..." -> "...$1M annual limit (up to $1.2M **at** an AIA Partner Facility) at a..."
- explanation: "...(up to $1.2M with an AIA **preferred provider)** at a much lower premium than..." -> "...(up to $1.2M at an AIA **Partner Facility)** at a much lower premium than..."

### study sort 0 (`64ec7796-2bb6-488e-a7ac-7278af59c28c`)

- Why: Max A limit steps up at Partner Facilities (S$1.35M Extended, S$2M AIA Partner Facility), not under a preferred provider. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- question: "...What is the **(nothing)** annual claim limit for AIA HealthShield..." -> "...What is the **highest** annual claim limit AIA HealthShield Gold..."
- question: "...What is the annual claim limit **for** AIA HealthShield Gold Max Plan A?..." -> "...is the highest annual claim limit **(nothing)** AIA HealthShield Gold Max Plan A..."
- question: "...for AIA HealthShield Gold Max Plan **A?** ..." -> "...limit AIA HealthShield Gold Max Plan **A can pay?** ..."
- option 2: "...$2 million **under** an AIA preferred provider, the highest..." -> "...$2 million **at** an AIA Partner Facility, the highest..."
- option 2: "...$2 million under an AIA **preferred provider,** the highest in the range..." -> "...$2 million at an AIA **Partner Facility,** the highest in the range..."
- explanation: "...limit is $1 million, rising to **(nothing)** $2 million when the insured is..." -> "...limit is $1 million, rising to **$1.35 million at an Extended Partner Facility and to** $2 million when the insured is..."
- explanation: "...million when the insured is hospitalised **under** an AIA preferred provider, the highest..." -> "...million when the insured is hospitalised **at** an AIA Partner Facility, the highest..."
- explanation: "...insured is hospitalised under an AIA **preferred provider,** the highest in the HSGM range...." -> "...insured is hospitalised at an AIA **Partner Facility,** the highest in the HSGM range...."

### study sort 3 (`ad855d42-a8f5-49b7-9455-829d0d5aefa1`)

- Why: Plan B S$1.2M limit applies at an AIA Partner Facility, not with a preferred provider. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:685`.
- option 2: "...million, stepping up to $1.2 million **under a preferred provider** ..." -> "...million, stepping up to $1.2 million **at an AIA Partner Facility** ..."
- explanation: "...up to $1.2 million when hospitalised **under** an AIA preferred provider. Knowing the..." -> "...up to $1.2 million when hospitalised **at** an AIA Partner Facility. Knowing the..."
- explanation: "...million when hospitalised under an AIA **preferred provider.** Knowing the preferred-provider step-up lets you..." -> "...million when hospitalised at an AIA **Partner Facility.** Knowing the Partner Facility step-up lets..."
- explanation: "...an AIA preferred provider. Knowing the **preferred-provider** step-up lets you advise clients to..." -> "...an AIA Partner Facility. Knowing the **Partner Facility** step-up lets you advise clients to..."

### study sort 13 (`05745080-41f9-4746-9ebf-66090433a330`)

- Why: Max B Lite private-hospital pro-ration is unresolved in the Presenter (50% vs 70%), so it becomes "check the current AIA product summary". Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:743-744 vs src/lib/translations/hsgMaxTranslations.ts:123,244`.
- explanation: "...a 70% proration on their claims. **(B** Lite prorates further, to 50% for..." -> "...a 70% proration on their claims. **(For B** Lite at a private hospital, check..."
- explanation: "...proration on their claims. (B Lite **prorates further, to 50%** for private admissions - it is..." -> "...on their claims. (For B Lite **at a private hospital, check the current AIA product summary** for the exact rate, and quote..."
- explanation: "...Lite prorates further, to 50% for **private admissions - it is a different factor, so** quote each tier separately.)..." -> "...the current AIA product summary for **the exact rate, and** quote each tier separately.)..."

### study sort 29 (`e2abc239-ce90-4667-8dd8-63876f8b798b`)

- Why: Non-listed CTGTP is covered only by the VitalHealth Pro rider, less 10% co-insurance; listed CTGTP is the base plan. Source: `src/data/ipFeatureComparison.ts:159-163,212-216`.
- question: "...the coverage limit for non-listed CTGTP **treatments?** ..." -> "...the coverage limit for non-listed CTGTP **treatments under AIA Max VitalHealth Pro?** ..."
- explanation: "...Non-listed CTGTP treatments are **(nothing)** covered at $150,000 per indication per..." -> "...Non-listed CTGTP treatments are **a VitalHealth Pro rider benefit,** covered at $150,000 per indication per..."
- explanation: "...covered at $150,000 per indication per **lifetime,** versus $250,000 for listed treatments (brochure..." -> "...covered at $150,000 per indication per **lifetime less 10% co-insurance,** versus $250,000 for listed treatments on..."
- explanation: "...lifetime, versus $250,000 for listed treatments **(nothing)** (brochure p.18). The split matters when..." -> "...co-insurance, versus $250,000 for listed treatments **on the base plan** (brochure p.18). The split matters when..."
- explanation: "...a client asks about cutting-edge therapies; **(nothing)** you can confirm coverage applies either..." -> "...a client asks about cutting-edge therapies; **with the rider** you can confirm coverage applies either..."

### study sort 30 (`b062d29d-0e2f-48a1-9be6-d774a92ed748`)

- Why: The $60,000 is the living donor transplant benefit (the transplant itself is as charged), and immunosuppressants are as charged on every tier, not capped at $7,200 on Plan B. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:544-548,997-1012; src/data/ipFeatureComparison.ts:120-122`.
- question: "...What is the **(nothing)** organ transplant benefit per transplant under..." -> "...What is the **living donor** organ transplant benefit per transplant under..."
- explanation: "...Plan A covers $60,000 per **(nothing)** organ transplant (Plan B is $40,000,..." -> "...Plan A covers $60,000 per **living donor** organ transplant (Plan B is $40,000,..."
- explanation: "...(Plan B is $40,000, B Lite **$20,000).** Pair this with the immunosuppressant benefit..." -> "...(Plan B is $40,000, B Lite **$20,000); the major organ transplant itself is covered as charged.** Pair this with the immunosuppressant benefit..."
- explanation: "...the immunosuppressant benefit (as-charged on Plan **A; $7,200/year cap on Plan B)** when a client asks about transplant..." -> "...the immunosuppressant benefit (as-charged on Plan **A, B and B Lite)** when a client asks about transplant..."

### study sort 31 (`a2ea3d69-e05e-4af9-96b7-352bb36ec27a`)

- Why: Approved immunosuppressants for organ transplant are as charged on Plan A, B and B Lite, not $7,200 a year. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:544-548; src/data/ipFeatureComparison.ts:94`.
- question: "... **What is the annual limit for** approved post-transplant immunosuppressant drugs under Plan..." -> "... **How are** approved post-transplant immunosuppressant drugs covered under..."
- question: "...limit for approved post-transplant immunosuppressant drugs **(nothing)** under Plan B?..." -> "...How are approved post-transplant immunosuppressant drugs **covered** under Plan B?..."
- option 1: "... **$7,200 per year** ..." -> "... **As charged, with no fixed yearly dollar cap** ..."
- explanation: "...B, approved post-transplant immunosuppressants are covered **up to $7,200 per policy year. Plan A covers them** on an as-charged basis (no fixed..." -> "...B, approved post-transplant immunosuppressants are covered **(nothing)** on an as-charged basis (no fixed..."
- explanation: "...on an as-charged basis (no fixed **sub-limit).** Raising the ongoing medication cost proactively..." -> "...on an as-charged basis (no fixed **sub-limit), the same as Plan A and B Lite; MediShield Life alone pays up to S$710 a month.** Raising the ongoing medication cost proactively..."

### study sort 32 (`f0aac070-fa8b-4d86-95dc-8bd010d5e373`)

- Why: The $200,000 non-CDL cancer drug limit is a Cancer Care Pro rider benefit, not the base plan. Source: `src/data/ipFeatureComparison.ts:208-211`.
- question: "...non-CDL (Cancer Drug List) cancer drug **coverage?** ..." -> "...non-CDL (Cancer Drug List) cancer drug **coverage under Cancer Care Pro?** ..."
- explanation: "... **Non-CDL** cancer drug treatment is covered up..." -> "... **Cancer Care Pro covers non-CDL** cancer drug treatment up to $200,000..."
- explanation: "...Non-CDL cancer drug treatment **is covered** up to $200,000 per policy year..." -> "...Pro covers non-CDL cancer drug treatment **(nothing)** up to $200,000 per policy year..."
- explanation: "...cancer drugs can be very expensive; **the plan** still funds them at a high..." -> "...cancer drugs can be very expensive; **Cancer Care Pro** still funds them at a high..."

### study sort 43 (`176c6f08-f24a-4c5b-bba8-221c2a07f656`)

- Why: Max A limit is S$1M, up to S$2M only at an AIA Partner Facility. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- explanation: "...no item-by-item sub-limits, up to the **(nothing)** $2M annual limit. This is the..." -> "...no item-by-item sub-limits, up to the **annual limit ($1M, or up to** $2M at an AIA Partner Facility)...."
- explanation: "...item-by-item sub-limits, up to the $2M **annual limit.** This is the core reason to..." -> "...limit ($1M, or up to $2M **at an AIA Partner Facility).** This is the core reason to..."

### study sort 51 (`f2e3bca2-3dba-485a-8293-4928151d6d4e`)

- Why: Riders sold now are VitalHealth Pro A / Pro B / Pro B Lite, not VitalHealth A / B. Source: `src/components/twfps/hsgQuote.ts:49-53`.
- option 2: "...lower rider tier (e.g. Max VitalHealth **(nothing)** B) costs less but accepts proration..." -> "...lower rider tier (e.g. Max VitalHealth **Pro** B) costs less but accepts proration..."
- explanation: "...down - e.g. from Max VitalHealth **(nothing)** A to B - which lowers..." -> "...down - e.g. from Max VitalHealth **Pro** A to Pro B - which..."
- explanation: "...e.g. from Max VitalHealth A to **(nothing)** B - which lowers the premium..." -> "...from Max VitalHealth Pro A to **Pro** B - which lowers the premium..."

### study sort 54 (`5c6ac58a-8e3d-4ea9-bdac-13c6e0dc75dc`)

- Why: Prudential PRUShield Premier also reaches S$2,000,000 (S$1,200,000 base), so AIA has no top-tier annual limit edge; its edge is 13 months pre/post vs 180/365 days. Source: `src/data/ipFeatureComparison.ts:107-117,172-174`.
- Note: Question premise was false, so all four options were rewritten in the live voice (repo did the same); correct_answer stays 3.
- question: "...what is AIA's key advantage in **the top-tier annual limit?** ..." -> "...what is AIA's key advantage in **pre- and post-hospitalisation cover?** ..."
- option 0: "...to settle on exactly the same **top-tier annual claim limit** ..." -> "...to settle on exactly the same **pre- and post-hospitalisation window** ..."
- option 1: "...AIA offers **a $1M annual limit** against the competitor's lower $500K annual..." -> "...AIA offers **90 days of pre/post cover** against the competitor's shorter 30 days..."
- option 1: "...$1M annual limit against the competitor's **lower $500K annual limit** ..." -> "...of pre/post cover against the competitor's **shorter 30 days** ..."
- option 2: "...Prudential's top tier actually **carries a higher annual limit** than AIA's Plan A..." -> "...Prudential's top tier actually **covers 13 months either side, longer** than AIA's Plan A..."
- option 3: "...AIA Plan A **offers a $2M annual limit** versus the competitor's lower top tier..." -> "...AIA Plan A **covers 13 months either side with an AIA Preferred Provider,** versus 180 days before and 365..."
- option 3: "...offers a $2M annual limit versus **the competitor's lower top tier** ..." -> "...with an AIA Preferred Provider, versus **180 days before and 365 days after** ..."
- explanation: "...AIA Plan A's **$2M annual limit** is a clear edge for high-cost..." -> "...AIA Plan A's **13-month pre- and post-hospitalisation window with an AIA Preferred Provider (100 days otherwise)** is a clear edge for prolonged..."
- explanation: "...limit is a clear edge for **high-cost or** prolonged treatment compared with a competitor..." -> "...otherwise) is a clear edge for **(nothing)** prolonged follow-up treatment compared with Prudential..."
- explanation: "...clear edge for high-cost or prolonged **(nothing)** treatment compared with a competitor whose..." -> "...is a clear edge for prolonged **follow-up** treatment compared with Prudential PRUShield Premier's..."
- explanation: "...high-cost or prolonged treatment compared with **a competitor whose top tier sits lower.** Always confirm the competitor's current limit..." -> "...for prolonged follow-up treatment compared with **Prudential PRUShield Premier's 180 days before and 365 days after (MOH comparison of private-hospital IPs, Jun 2026). Annual limits are no edge: AIA Plan A pays S$1,000,000 (S$2,000,000 at an AIA Partner Facility) and Prudential lists S$1,200,000 (up to S$2,000,000 via its panel).** Always confirm the competitor's current limit..."

### study sort 55 (`8fe7532b-f72e-420f-b18e-96881a61c0ff`)

- Why: Competing flagship private-hospital IPs also have unlimited lifetime limits, so the right answer is "both unlimited" (option 3), not "AIA unlimited vs capped competitors". Source: `src/data/ipFeatureComparison.ts:175; src/data/ipFeatureComparison.ts:107-117`.
- question: "... **What is AIA's structural advantage over many competitors in** lifetime limits?..." -> "... **How does AIA compare with a major competitor's top plan on** lifetime limits?..."
- correct_answer: 2 -> 3
- explanation: "...carry an unlimited lifetime claim limit, **which beats any competitor that caps lifetime claims, especially for chronic or recurring conditions** over decades. Position unlimited as true..." -> "...carry an unlimited lifetime claim limit, **and so do the other flagship private-hospital IPs (MOH comparison, Jun 2026), so it is not an edge** over them. Position unlimited as true..."
- explanation: "...for chronic or recurring conditions over **decades.** Position unlimited as true lifetime protection:..." -> "...it is not an edge over **them.** Position unlimited as true lifetime protection:..."
- explanation: "...run dry on a long illness. **Verify** a specific competitor's current cap before..." -> "...run dry on a long illness. **Lead a comparison with AIA's 13-month pre- and post-hospitalisation window with an AIA Preferred Provider instead, and verify** a specific competitor's current terms before..."
- explanation: "...illness. Verify a specific competitor's current **cap** before naming it in a comparison...." -> "...and verify a specific competitor's current **terms** before naming it...."
- explanation: "...specific competitor's current cap before naming **it in a comparison.** ..." -> "...specific competitor's current terms before naming **it.** ..."

### study sort 57 (`612f83ee-0a9f-47ad-9f49-074dc7cead38`)

- Why: Max A pays S$2M only at an AIA Partner Facility, and AIA does not lead on lifetime limit (competitors are unlimited too). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684; src/data/ipFeatureComparison.ts:175`.
- explanation: "...The four comparison points **where AIA tends** to lead are annual limit ($2M..." -> "...The four comparison points **(nothing)** to have ready are annual limit..."
- explanation: "...comparison points where AIA tends to **lead** are annual limit ($2M on Plan..." -> "...The four comparison points to **have ready** are annual limit (up to $2M..."
- explanation: "...tends to lead are annual limit **($2M** on Plan A), lifetime limit (unlimited),..." -> "...to have ready are annual limit **(up to $2M** on Plan A at an AIA..."
- explanation: "...are annual limit ($2M on Plan **A),** lifetime limit (unlimited), AQHP panel size,..." -> "...limit (up to $2M on Plan **A at an AIA Partner Facility),** lifetime limit (unlimited), AQHP panel size,..."

### study sort 62 (`c624654a-6149-499d-8cec-ae00e03d6609`)

- Why: Plan A does not double Plan B's limit: both are S$1M base; at an AIA Partner Facility it is S$2M vs S$1.2M. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684-685`.
- option 0: "...a modest premium step up buys **double the annual limit and** private access..." -> "...a modest premium step up buys **(nothing)** private access and a higher limit..."
- option 0: "...the annual limit and private access **(nothing)** ..." -> "...premium step up buys private access **and a higher limit at a Partner Facility** ..."
- explanation: "...small monthly step up that buys **double the annual limit ($2M vs $1M) and** full private hospital access. Anchoring on..." -> "...small monthly step up that buys **(nothing)** full private hospital access and a..."
- explanation: "...vs $1M) and full private hospital **access.** Anchoring on the incremental cost, not..." -> "...up that buys full private hospital **access and a higher limit at an AIA Partner Facility ($2M vs $1.2M).** Anchoring on the incremental cost, not..."

### study sort 66 (`55934586-db3a-4fd4-86e5-e57cd44207d0`)

- Why: Competitors do not cap lifetime limits and their annual limits are comparable; AIA's edge is 13 months pre/post vs 180/365 days. Source: `src/data/ipFeatureComparison.ts:107-117,172-175`.
- Note: Answer premise was false, so the marked option and explanation were rewritten (repo did the same); correct_answer stays 3.
- question: "...How should you frame **the AIA top-tier limits** when comparing against another major ISP..." -> "...How should you frame **AIA's top tier** when comparing against another major ISP..."
- option 3: "...AIA Plan A **offers a $2M annual limit** and unlimited lifetime limit, beating a..." -> "...AIA Plan A **covers 13 months either side with an AIA Preferred Provider, beating the competitor's 180 days before** and 365 days after..."
- option 3: "...offers a $2M annual limit and **unlimited lifetime limit, beating a competitor that caps both** ..." -> "...the competitor's 180 days before and **365 days after** ..."
- explanation: "...AIA Plan A's **$2M annual** and unlimited lifetime limits are the..." -> "...AIA Plan A's **13-month pre-** and post-hospitalisation window with an AIA..."
- explanation: "...AIA Plan A's $2M annual and **unlimited lifetime limits are** the differentiators to lead with against..." -> "...AIA Plan A's 13-month pre- and **post-hospitalisation window with an AIA Preferred Provider (100 days otherwise) is** the differentiator to lead with against..."
- explanation: "...and unlimited lifetime limits are the **differentiators** to lead with against a competitor..." -> "...Provider (100 days otherwise) is the **differentiator** to lead with against a competitor..."
- explanation: "...against a competitor whose top tier **caps either figure,** especially for prolonged or recurring treatment...." -> "...against a competitor whose top tier **covers 180 days before and 365 days after,** especially for prolonged or recurring treatment...."
- explanation: "...especially for prolonged or recurring treatment. **(nothing)** Pull the competitor's current annual and..." -> "...especially for prolonged or recurring treatment. **Lifetime limits are unlimited on every flagship private-hospital IP (MOH comparison, Jun 2026), and AIA Plan A's annual limit of S$1,000,000 (S$2,000,000 at an AIA Partner Facility) is not a clear edge.** Pull the competitor's current annual and..."

### study sort 71 (`4c54a510-890d-482d-b65c-2af9258fd4db`)

- Why: Competing flagship private-hospital IPs also have unlimited lifetime limits, so do not claim a competitor caps it. Source: `src/data/ipFeatureComparison.ts:175`.
- question: "...should you position AIA's unlimited lifetime **limit against competitors with capped limits?** ..." -> "...should you position AIA's unlimited lifetime **limit?** ..."
- option 0: "...chronic condition over 20+ years can **exhaust a cap,** so unlimited means true protection..." -> "...chronic condition over 20+ years can **run into millions,** so unlimited means true protection..."
- explanation: "...cost over decades, and a capped **competitor** policy can run dry mid-treatment. AIA's..." -> "...cost over decades, and a capped **(nothing)** policy could run dry mid-treatment. AIA's..."
- explanation: "...decades, and a capped competitor policy **can** run dry mid-treatment. AIA's unlimited lifetime..." -> "...over decades, and a capped policy **could** run dry mid-treatment. AIA's unlimited lifetime..."
- explanation: "...when the client needs it most. **(nothing)** ..." -> "...when the client needs it most. **The other flagship private-hospital IPs are unlimited too (MOH comparison, Jun 2026), so do not claim a competitor caps it.** ..."

### study sort 72 (`83a2e220-abd9-4fb6-b221-698906f50af5`)

- Why: Max A pays up to S$2M a year only at an AIA Partner Facility (S$1M base). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- option 0: "...Redirect from price to value: **the** $2M limit, unlimited lifetime, panel, and..." -> "...Redirect from price to value: **up to** $2M a year, unlimited lifetime, panel,..."
- option 0: "...from price to value: the $2M **limit,** unlimited lifetime, panel, and 13-month pre/post..." -> "...price to value: up to $2M **a year,** unlimited lifetime, panel, and 13-month pre/post..."

### study sort 86 (`d2d59862-d498-4e89-b196-6f3ace3c97f7`)

- Why: Max A pays S$2M only at an AIA Partner Facility, and AIA does not lead Prudential / Great Eastern on lifetime limit (all unlimited). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684; src/data/ipFeatureComparison.ts:175`.
- option 3: "...and offer a side-by-side on the **$2M** limit, unlimited lifetime, panel, and pre/post..." -> "...and offer a side-by-side on the **up-to-$2M** limit, unlimited lifetime, panel, and pre/post..."
- explanation: "...a like-for-like grid on the four **(nothing)** points where AIA leads and let..." -> "...a like-for-like grid on the four **value-stack** points and let the numbers win..."
- explanation: "...like-for-like grid on the four points **where AIA leads** and let the numbers win on..." -> "...grid on the four value-stack points **(nothing)** and let the numbers win on..."

### study sort 90 (`c4d38ce9-735b-4e7c-aab8-4fd56e2ad501`)

- Why: Max A limit is S$1M, up to S$2M only at an AIA Partner Facility. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- explanation: "...rider tier down preserves Plan A's **(nothing)** $2M limit and private-hospital access while..." -> "...rider tier down preserves Plan A's **limit (up to** $2M at an AIA Partner Facility)..."
- explanation: "...tier down preserves Plan A's $2M **limit** and private-hospital access while trimming cost..." -> "...Plan A's limit (up to $2M **at an AIA Partner Facility)** and private-hospital access while trimming cost..."

### study sort 108 (`fa7f1661-ac4b-476b-ad58-ec74c3d1d446`)

- Why: Max A pays S$2M only at an AIA Partner Facility, and unlimited lifetime is not a differentiator (competitors are unlimited too). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684; src/data/ipFeatureComparison.ts:175`.
- option 3: "...the comparison and walk the four **differentiators: $2M** limit, unlimited lifetime, AQHP panel, 13-month..." -> "...the comparison and walk the four **value points: up-to-$2M** limit, unlimited lifetime, AQHP panel, 13-month..."
- explanation: "...side by side. AIA Plan A's **(nothing)** $2M annual limit, unlimited lifetime limit,..." -> "...side by side. AIA Plan A's **annual limit (up to** $2M at an AIA Partner Facility),..."
- explanation: "...by side. AIA Plan A's $2M **annual limit,** unlimited lifetime limit, 500-plus AQHP specialists..." -> "...A's annual limit (up to $2M **at an AIA Partner Facility),** unlimited lifetime limit, 500-plus AQHP specialists..."

### study sort 111 (`b3ccae06-20dd-4f18-a8ac-aff4ec0965a5`)

- Why: Max A limit is S$1M, up to S$2M only at an AIA Partner Facility. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- option 0: "...MediSave trims the cash while keeping **$2M** cover..." -> "...MediSave trims the cash while keeping **up-to-$2M** cover..."
- explanation: "...price sensitivity while preserving Plan A's **$2M** annual limit and private-hospital access...." -> "...price sensitivity while preserving Plan A's **(nothing)** annual limit (up to $2M at..."
- explanation: "...preserving Plan A's $2M annual limit **(nothing)** and private-hospital access...." -> "...while preserving Plan A's annual limit **(up to $2M at an AIA Partner Facility)** and private-hospital access...."

### study sort 116 (`dc3f9301-d067-427c-89c4-67bcc2702a30`)

- Why: Major organ transplant is as charged, $60K/$40K is the living donor benefit, and immunosuppressants are as charged on Plan B too (not $7,200 a year). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:544-548,997-1012; src/data/ipFeatureComparison.ts:120-122`.
- option 0: "... **It covers** $60,000 per transplant on Plan A..." -> "... **The transplant is as-charged, living donor cover is** $60,000 per transplant on Plan A..."
- option 0: "...$60,000 per transplant on Plan A **with** immunosuppressants as-charged; Plan B pays $40,000..." -> "...$60,000 per transplant on Plan A **($40,000 on Plan B), and** immunosuppressants are as-charged..."
- option 0: "...transplant on Plan A with immunosuppressants **as-charged; Plan B pays $40,000 plus $7,200 a year for the drugs** ..." -> "...($40,000 on Plan B), and immunosuppressants **are as-charged** ..."
- explanation: "...often-overlooked immunosuppressant coverage, tier by tier: **Plan A pays** $60K per transplant with approved immunosuppressants..." -> "...often-overlooked immunosuppressant coverage, tier by tier: **the major organ transplant is as-charged; living donor cover is** $60K per transplant on Plan A..."
- explanation: "...Plan A pays $60K per transplant **with** approved immunosuppressants as-charged; Plan B pays..." -> "...donor cover is $60K per transplant **on Plan A and $40K on Plan B;** approved immunosuppressants are as-charged on every..."
- explanation: "...$60K per transplant with approved immunosuppressants **as-charged; Plan B pays $40K with the drugs capped at $7,200/year.** Ongoing medication costs are a major..." -> "...$40K on Plan B; approved immunosuppressants **are as-charged on every tier.** Ongoing medication costs are a major..."

### study sort 147 (`f30e4198-223e-4ee0-ad8e-0715bb818637`)

- Why: Plan A gives up to 13 months (with a preferred provider); competitors cap pre/post at 180 days before and 365 days after, not 6 months. Source: `src/data/ipFeatureComparison.ts:107-117`.
- option 0: "...covered too - pre- and post-hospitalisation, **(nothing)** 13 months each side..." -> "...covered too - pre- and post-hospitalisation, **up to** 13 months each side..."
- explanation: "...Most competitor IPs cap this at **6 months,** so it is a real differentiator..." -> "...Most competitor IPs cap this at **180 days before and 365 days after,** so it is a real differentiator..."

### study sort 150 (`49ba460f-078f-4bb5-b3e9-043f72fc77d2`)

- Why: The S$2M limit is tied to an AIA Partner Facility (S$1.35M Extended, S$1M otherwise), not a preferred provider; competitors stop at 180/365 days, not 6 months. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684; src/data/ipFeatureComparison.ts:107-117`.
- question: "...On HSG Max **A** with an AIA preferred provider, what..." -> "...On HSG Max **A, what is the highest annual claim limit, and what are the pre/post-hospitalisation windows** with an AIA preferred provider?..."
- question: "...Max A with an AIA preferred **provider, what are the annual claim limit and the pre/post-hospitalisation windows?** ..." -> "...pre/post-hospitalisation windows with an AIA preferred **provider?** ..."
- explanation: "...HSG Max A **with an AIA preferred provider** pays up to S$2,000,000 per policy..." -> "...HSG Max A **(nothing)** pays up to S$2,000,000 per policy..."
- explanation: "...up to S$2,000,000 per policy year **(nothing)** with 13 months of pre-hospitalisation and..." -> "...up to S$2,000,000 per policy year **at an AIA Partner Facility, and** with an AIA preferred provider gives..."
- explanation: "...to S$2,000,000 per policy year with **(nothing)** 13 months of pre-hospitalisation and 13..." -> "...an AIA Partner Facility, and with **an AIA preferred provider gives** 13 months of pre-hospitalisation and 13..."
- explanation: "...of post-hospitalisation cover (Brochure p.10, p.12). **Without** a preferred provider the annual limit..." -> "...of post-hospitalisation cover (Brochure p.10, p.12). **The limit is S$1,350,000 at an Extended Partner Facility and S$1,000,000 elsewhere, and without** a preferred provider pre/post cover is..."
- explanation: "...p.10, p.12). Without a preferred provider **the annual limit drops to S$1,000,000.** The 13-month wraparound is the longest..." -> "...elsewhere, and without a preferred provider **pre/post cover is 100 days.** The 13-month wraparound is the longest..."
- explanation: "...- most competitor IPs stop at **6 months** - so it is a strong..." -> "...- most competitor IPs stop at **180 days before and 365 days after** - so it is a strong..."

### study sort 160 (`9f19977d-9a34-4ce9-9f87-e2652c622126`)

- Why: MediShield Life pro-rates a Citizen's private-hospital bill to 16% (ward) / 10% (surgical), not 35%. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:739-740`.
- option 1: "...Pro-rated to about **35%;** HSG Max A removes pro-ration on..." -> "...Pro-rated to about **16% (10% for surgery);** HSG Max A removes pro-ration on..."
- explanation: "...bill is pro-rated down to about **35%** before it pays anything, leaving a..." -> "...bill is pro-rated down to about **16% of ward charges and 10% of surgical charges (Singapore Citizens)** before it pays anything, leaving a..."

### study sort 161 (`b623a7b6-57ce-4194-b008-be61a05f6a80`)

- Why: Max B Lite private-hospital pro-ration is unresolved in the Presenter (50% vs 70%), so it becomes "check the current AIA product summary". Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:743-744 vs src/lib/translations/hsgMaxTranslations.ts:123,244`.
- Note: B Lite 65% private outpatient kept: the report names only the B Lite private-hospital (inpatient) figure as unresolved.
- option 0: "...B is 70% for private; B **Lite is 50% private** ..." -> "...B is 70% for private; B **Lite: see the current product summary** ..."
- explanation: "...pro-rates 90% for B1 (PR), 80% **A-class, 50% private,** and 65% private outpatient. This is..." -> "...pro-rates 90% for B1 (PR), 80% **A-class** and 65% private outpatient; for a..."
- explanation: "...A-class, 50% private, and 65% private **outpatient.** This is why even a client..." -> "...(PR), 80% A-class and 65% private **outpatient; for a B Lite private-hospital stay, check the current AIA product summary for the exact rate.** This is why even a client..."

### study sort 167 (`6452a1ab-c043-422f-b1cb-56ed336cf8c0`)

- Why: The final expense benefit is per policy, not per policy year. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:631-637`.
- question: "...What are the inpatient psychiatric treatment **(nothing)** and final expense benefits per policy..." -> "...What are the inpatient psychiatric treatment **(per policy year)** and final expense (per policy) benefits..."
- question: "...inpatient psychiatric treatment and final expense **(nothing)** benefits per policy year for Plan..." -> "...(per policy year) and final expense **(per policy)** benefits for Plan A?..."
- question: "...psychiatric treatment and final expense benefits **per policy year** for Plan A?..." -> "...and final expense (per policy) benefits **(nothing)** for Plan A?..."
- explanation: "...expense benefit is S$5,000 per policy **year** (Brochure p.10-12). These scale down across..." -> "...expense benefit is S$5,000 per policy **(nothing)** (Brochure p.10-12). These scale down across..."

### study sort 185 (`57c235a1-ac01-430e-b70d-7825e36a60a1`)

- Why: Max A limit is S$1M, up to S$2M only at an AIA Partner Facility (distractor qualified). Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- option 0: "...The **S$2M** annual claim limit and the ward-tied..." -> "...The **up-to-S$2M** annual claim limit and the ward-tied..."

### study sort 203 (`e10fc9b4-2dc2-4995-9401-40be2dd30d7a`)

- Why: Max A pays S$2M only at an AIA Partner Facility, and the 13 months needs an AIA preferred provider. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684; src/data/ipFeatureComparison.ts:107-117`.
- option 3: "... **'S$2M** a year, covered for life, 13..." -> "... **'Up to S$2M** a year, covered for life, 13..."
- option 3: "...life, 13 months either side of **any stay,** claim yearly with the limit resetting,..." -> "...life, 13 months either side of **a stay with a preferred provider,** claim yearly with the limit resetting,..."
- explanation: "...reinforce value with the headline stack: **S$2M/year,** lifetime, 13-month wraparound (with preferred provider),..." -> "...reinforce value with the headline stack: **up to S$2M/year at an AIA Partner Facility,** lifetime, 13-month wraparound (with preferred provider),..."

### study sort 214 (`9c43cd6b-f448-4209-8bcd-84efab180d3a`)

- Why: Max A limit is S$1M, up to S$2M only at an AIA Partner Facility. Source: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:684`.
- Note: Correct option [1] still says "(caps below S$2M)" about corporate caps; left as is.
- explanation: "...annual caps are typically far below **HSGM's S$2M.** The clean move is to layer..." -> "...annual caps are typically far below **HSGM Max A's limit (S$1M, up to S$2M at an AIA Partner Facility).** The clean move is to layer..."

## AIA Ultimate Critical Cover

### exam sort 1 (`20b82217-4c84-4d8a-91fd-bcd236f40e89`)

- Why: Great Eastern's 2 resets and 3 claims come only with its optional Protect Me Again rider; its base plan pays once. Source: `src/data/uccFeatureComparison.ts:146`.
- explanation: "...Eastern allows only a 2x reset **(nothing)** and caps at 3 claims...." -> "...Eastern allows only a 2x reset **(with its optional Protect Me Again rider)** and caps at 3 claims...."

### exam sort 5 (`0f8cdda2-89a7-45c5-9dd9-3b1ca61ecc3f`)

- Why: UCC has no limit on major-stage claims; only early and intermediate claims are capped at 500%, so 500% is not the total maximum. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%. Distractor 1 ('Over 550% ... with no aggregate dollar cap at all') stays false only because of the S$3,000,000 CI per-life limit (live study 147).
- option 2: "... **Up** to 500% of the coverage amount,..." -> "... **No limit on different-illness major claims; early and intermediate claims up** to 500%..."
- option 2: "...Up to 500% **of the coverage amount, with unlimited different-illness major claims** ..." -> "...and intermediate claims up to 500% **(nothing)** ..."
- explanation: "...Per the AIA brochure, UCC **pays out up to** 500% of the coverage amount in..." -> "...Per the AIA brochure, UCC **has no limit on major-stage claims for different illnesses, while early and intermediate claims are capped at** 500% of the coverage amount; the..."
- explanation: "...up to 500% of the coverage **amount in total;** the worked Robert example reaches exactly..." -> "...capped at 500% of the coverage **amount;** the worked Robert example reaches exactly..."
- explanation: "...an unlimited dollar cap. Quote 500% **(nothing)** as the headline so you never..." -> "...an unlimited dollar cap. Quote 500% **only** as the early and intermediate cap..."
- explanation: "...dollar cap. Quote 500% as the **headline** so you never overstate the product...." -> "...cap. Quote 500% only as the **early and intermediate cap** so you never overstate the product...."

### exam sort 21 (`4fca7670-6599-46b8-ab69-2ab301a71791`)

- Why: UCC's major-stage claims are unlimited; the 500% cap applies only to early and intermediate claims. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%.
- option 3: "...BCC with broader staged cover and **multi-claim up to 500%** ..." -> "...BCC with broader staged cover and **unlimited major-stage claims** ..."
- explanation: "...condition-stage entries from 73 CIs) and **multi-claim cover** up to a 500% aggregate, layering..." -> "...condition-stage entries from 73 CIs) and **unlimited major-stage claims (early and intermediate** up to 500%), layering on top..."
- explanation: "...CIs) and multi-claim cover up to **a 500% aggregate,** layering on top of BCC's built-in..." -> "...claims (early and intermediate up to **500%),** layering on top of BCC's built-in..."

### exam sort 25 (`33a1457e-1c51-45ed-874a-3e7baf1bb042`)

- Why: UCC's major-stage claims are unlimited; the 500% cap applies only to early and intermediate claims. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%.
- explanation: "...(150 condition-stage entries from 73 CIs), **multi-claim** up to a 500% aggregate, and..." -> "...(150 condition-stage entries from 73 CIs), **unlimited major-stage claims (early and intermediate** up to 500%), and lower premiums..."
- explanation: "...from 73 CIs), multi-claim up to **a 500% aggregate,** and lower premiums you can invest...." -> "...claims (early and intermediate up to **500%),** and lower premiums you can invest...."

### exam sort 31 (`51daf569-bc76-4f49-a1d1-7c92e287a656`)

- Why: The about $57/month all-rider cost for S$100k to 65 is the 20-year-old male non-smoker rate (base 513 x 0.087 = about $45); a 35-year-old male non-smoker pays about $82/month for the base alone. Source: `src/data/uccPremiums.ts:66,81,36`.
- question: "...A budget-conscious **35-year-old** wants maximum CI protection for $60/month...." -> "...A budget-conscious **20-year-old male non-smoker** wants maximum CI protection for $60/month...."

### exam sort 32 (`6fd82f13-2945-42f4-9d67-4569d8411450`)

- Why: UCC's major-stage claims are unlimited, so the heart staircase does not build toward a 500% aggregate; 500% caps only early and intermediate claims. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%.
- explanation: "...pays 100% of the current cover, **building toward** the 500% aggregate. This staircase is..." -> "...pays 100% of the current cover, **with no limit on** the number of major-stage claims. This..."
- explanation: "...the current cover, building toward the **500% aggregate.** This staircase is the single most..." -> "...cover, with no limit on the **number of major-stage claims.** This staircase is the single most..."

### exam sort 34 (`44cf1681-73fd-43bb-8ff6-5f599ba00e02`)

- Why: Prudential makes a claim in the same category wait 24 months (12 for a different category); it has no related-illness restriction that blocks the claim. Source: `src/data/uccFeatureComparison.ts:167`.
- option 3: "...it. Then ask if their plan **has** a related-illness restriction...." -> "...it. Then ask if their plan **makes** a same-category claim wait 24 months...."
- option 3: "...ask if their plan has a **related-illness restriction.** ..." -> "...ask if their plan makes a **same-category claim wait 24 months.** ..."
- explanation: "...replacement defuses the conflict. Then using **the specific related-illness restriction** educates the client on UCC's advantage..." -> "...replacement defuses the conflict. Then using **Prudential's 24-month same-category wait** educates the client on UCC's advantage..."

### exam sort 49 (`82f56f38-6575-43c4-a9c1-82cf34609996`)

- Why: UCC's major-stage claims are unlimited; the 500% cap applies only to early and intermediate claims. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%.
- explanation: "...UCC's 73 CIs, built-in multi-claim and **500% aggregate** speak for themselves. Respecting the client's..." -> "...UCC's 73 CIs, built-in multi-claim and **unlimited major-stage claims** speak for themselves. Respecting the client's..."

### study sort 1 (`1723684b-6fe2-403c-bf08-0fc015778664`)

- Why: PRUActive Protect II covers 64 severe-stage CIs, not 37. Source: `src/data/uccFeatureComparison.ts:62`.
- explanation: "...since competitors quote CI counts (Prudential **37,** GE 53). Do not describe the..." -> "...since competitors quote CI counts (Prudential **64 at severe stage,** GE 53). Do not describe the..."

### study sort 8 (`80610982-d824-4b54-9063-5a614414258c`)

- Why: UCC has no limit on major-stage claims; only early and intermediate claims are capped at 500%, so 500% is not the total maximum. Source: `src/data/uccFeatureComparison.ts:144,155`.
- Note: Leo's June/July edit taught 500% as the total headline; the Presenter (and live study 119, 224, 225) say major-stage claims are unlimited and only early and intermediate claims are capped at 500%. Distractor 2 ('550% or more with no aggregate dollar cap') stays false only because of the S$3,000,000 CI per-life limit (live study 147).
- option 0: "... **Up** to 500% of the coverage amount..." -> "... **No limit at major stage; early and intermediate up** to 500%..."
- option 0: "...Up to 500% **of the coverage amount in total** ..." -> "...early and intermediate up to 500% **(nothing)** ..."
- explanation: "...Per the AIA brochure, **the maximum total payout** is up to 500% of the..." -> "...Per the AIA brochure, **there** is no limit on major-stage claims,..."
- explanation: "...brochure, the maximum total payout is **up to** 500% of the coverage amount; the..." -> "...Per the AIA brochure, there is **no limit on major-stage claims, while early and intermediate claims are capped at** 500% of the coverage amount; the..."
- explanation: "...an unlimited dollar figure. Quote 500% **(nothing)** so you never overstate the benefit...." -> "...an unlimited dollar figure. Quote 500% **only for early and intermediate claims** so you never overstate the benefit...."

### study sort 23 (`4081666a-a17d-4f08-8282-b67814eee219`)

- Why: Prudential makes a same-category claim wait 24 months rather than blocking it, and Great Eastern's 3 claims need its optional Protect Me Again rider. Source: `src/data/uccFeatureComparison.ts:146,167`.
- explanation: "...pitch and is exactly where Prudential's **related-illness block** and Great Eastern's 3-claim cap fall..." -> "...pitch and is exactly where Prudential's **24-month same-category wait** and Great Eastern's 3-claim cap (with..."
- explanation: "...block and Great Eastern's 3-claim cap **(nothing)** fall short...." -> "...wait and Great Eastern's 3-claim cap **(with its optional Protect Me Again rider)** fall short...."

### study sort 58 (`984f6cab-9e28-4794-851c-6a66e3c06d47`)

- Why: With the Presenter premium the to-65 versus to-85 saving is about $90 a month, so the repo's scaled projection is $217k-$840k, not $388k-$1.5M; the live row used the same old figures. Source: `src/data/uccPremiums.ts:167`.
- Note: The $217k / $840k projection is the hub repo scaling, not a Presenter figure; only the premium comes from the Presenter.
- question: "...between $200k coverage (needs illness) vs **$388k-$1.5M** cash (accessible anytime)?..." -> "...between $200k coverage (needs illness) vs **$217k-$840k** cash (accessible anytime)?..."
- explanation: "...touch if you fall ill versus **$388k** to $1.5M in cash you can..." -> "...touch if you fall ill versus **$217k** to $840k in cash you can..."
- explanation: "...you fall ill versus $388k to **$1.5M** in cash you can access anytime,..." -> "...you fall ill versus $217k to **$840k** in cash you can access anytime,..."

### study sort 74 (`0027607f-f3ce-4c5a-b3d6-0e2c61877838`)

- Why: With the Presenter premium the scaled projection is $217k-$840k, not $388k-$1.5M; the live row used the same old figures. Source: `src/data/uccPremiums.ts:167`.
- Note: The $217k / $840k projection is the hub repo scaling, not a Presenter figure; only the premium comes from the Presenter.
- explanation: "...only unlock by falling ill versus **$388k** to $1.5M of cash you can..." -> "...only unlock by falling ill versus **$217k** to $840k of cash you can..."
- explanation: "...by falling ill versus $388k to **$1.5M** of cash you can reach anytime,..." -> "...by falling ill versus $217k to **$840k** of cash you can reach anytime,..."

### study sort 101 (`9e78f0e9-2336-4971-a93b-fa56b0e3cada`)

- Why: The about $57/month all-rider cost for S$100k to 65 fits a 20-year-old male non-smoker; a 35-year-old female non-smoker pays about $101/month for the base alone (1,166 x 0.087), so the marked answer did not fit her $60 budget. Source: `src/data/uccPremiums.ts:66,177,36`.
- Note: Options 0 and 2 change only the pronoun (she/her to he/his) to match the new client.
- question: "...A **35-year-old female** client says: 'I want the most..." -> "...A **20-year-old male non-smoker** client says: 'I want the most..."
- option 0: "...to maximise the lump-sum premium refund **she** would receive back when the policy..." -> "...to maximise the lump-sum premium refund **he** would receive back when the policy..."
- option 2: "...assured is what matters most within **her** tight budget...." -> "...assured is what matters most within **his** tight budget...."
- explanation: "...~$57 figure is for a 20-year-old **non-smoker, so a 35-year-old will differ.** Confirm on a live BI before..." -> "...~$57 figure is for a 20-year-old **male non-smoker like this client.** Confirm on a live BI before..."

### study sort 183 (`5ed2409d-2dfb-4cdf-97fd-d2e368dd18ba`)

- Why: For the 25-year-old female non-smoker S$200k case, To 85 is about S$2,512 and To 65 about S$1,436 a year, not S$3,320 and S$1,400. Source: `src/data/uccPremiums.ts:167`.
- question: "...presenting the To 85 term at **S$3,320** versus the To 65 term at..." -> "...presenting the To 85 term at **S$2,512** versus the To 65 term at..."
- question: "...versus the To 65 term at **S$1,400?** ..." -> "...versus the To 65 term at **S$1,436?** ..."

### study sort 188 (`4631777b-5d7f-4d87-9bb8-3953f17a5e51`)

- Why: With the Presenter premium the ECPWP best case waives about S$93,492, about 557x the rider, not 679x; the live row used the same old figure. Source: `src/data/uccPremiums.ts:167`.
- Note: The 557x ratio is the hub repo scaling (S$93,492 / S$168), not a Presenter figure.
- explanation: "...in the asymmetric framing: best case **~679x** return, worst case a modest sunk..." -> "...in the asymmetric framing: best case **~557x** return, worst case a modest sunk..."

### study sort 237 (`a8b44a10-a429-4e7d-a333-2502c940b36b`)

- Why: Prudential has no related-illness block: early stages come only with its Early Protect rider and further claims only with its Protect Plus rider. Source: `src/data/uccFeatureComparison.ts:73,145`.
- explanation: "...the Early CI and multi-claim gaps **left by Prudential's related-illness block,** with no replacement and no underwriting..." -> "...the Early CI and multi-claim gaps **a Prudential plan has without its optional Early Protect and Protect Plus riders,** with no replacement and no underwriting..."

### study sort 239 (`85496d68-ad75-4460-963b-29f9db59579b`)

- Why: Prudential makes a same-category claim wait 24 months rather than blocking it, and Great Eastern's 3 claims need its optional Protect Me Again rider. Source: `src/data/uccFeatureComparison.ts:146,167`.
- option 3: "...so when you walk the mechanics **(related-illness block,** 3-claim cap) it lands as education..." -> "...so when you walk the mechanics **(24-month same-category wait,** 3-claim cap) it lands as education..."
- explanation: "...differentiate on verifiable mechanics like Prudential's **related-illness block** or GE's 3-claim cap (Day 16)...." -> "...differentiate on verifiable mechanics like Prudential's **24-month same-category wait** or GE's 3-claim cap with its..."
- explanation: "...related-illness block or GE's 3-claim cap **(nothing)** (Day 16). It frames the comparison..." -> "...same-category wait or GE's 3-claim cap **with its Protect Me Again rider** (Day 16). It frames the comparison..."

## AIA Pro Achiever 3.0

### exam sort 7 (`0aef3600-c68c-4bf2-a3e2-7ef76f4a31dd`)

- Why: GDIF dividends are reinvested during the IIP, with a cash option only after it. Source: `src/data/proAchieverFeatureComparison.ts:255`.
- explanation: "...for quarterly income, averaging around 5% **p.a.** Note that APA cannot access the..." -> "...for quarterly income, averaging around 5% **p.a.; during the IIP the dividends are reinvested, and after the IIP they can be taken as cash.** Note that APA cannot access the..."

### exam sort 25 (`2cf26dee-ad26-4a20-ab6d-142baeaa2990`)

- Why: Partial withdrawals are allowed from policy year 3 (charged during the IIP), not only after a lock-in; the explanation already said so. Source: `src/data/proAchieverFeatureComparison.ts:222`.
- option 0: "...Partial withdrawals are allowed **after the lock-in,** and pauses cover difficulty..." -> "...Partial withdrawals are allowed **from policy year 3,** and pauses cover difficulty..."

### study sort 7 (`ac3e67f3-aa17-47cb-9a68-e9133c2f0059`)

- Why: Partial withdrawals are allowed from policy year 3, so special-bonus units (credited from the 10th annual premium) can be withdrawn once credited, charged only during the IIP; the live answer said only after the IIP ends. Source: `src/data/proAchieverFeatureComparison.ts:222; src/data/proAchieverFeatureComparison.ts:128`.
- Note: Marked option text changed (index stays 1). The live row had re-framed the question as charge-free withdrawal; the new option keeps the IIP charge in view.
- option 1: "... **After the relevant IIP ends (e.g.** from Year 11 on IIP-10)..." -> "... **Once credited** from Year 10, with a charge..."
- option 1: "...relevant IIP ends (e.g. from Year **11 on IIP-10)** ..." -> "...Once credited from Year **10, with a charge during the IIP** ..."
- explanation: "...credited as regular-premium units (PS Section **4.4).** Those units are subject to partial..." -> "...credited as regular-premium units (PS Section **4.4) from the 10th annual premium, and partial withdrawals are allowed from policy year 3, so once credited it can be withdrawn like other units.** Those units are subject to partial..."
- explanation: "...16th; for IIP-20 from the 21st. **The phrasing 'after** year 10' is only accurate for..." -> "...16th; for IIP-20 from the 21st. **A charge-free withdrawal after** year 10 is only open to..."
- explanation: "...the 21st. The phrasing 'after year **10'** is only accurate for IIP-10 policyholders..." -> "...21st. A charge-free withdrawal after year **10** is only open to IIP-10 policyholders;..."
- explanation: "...phrasing 'after year 10' is only **accurate for** IIP-10 policyholders and misleads IIP-15 and..." -> "...withdrawal after year 10 is only **open to** IIP-10 policyholders; IIP-15 and IIP-20 clients..."
- explanation: "...10' is only accurate for IIP-10 **policyholders and misleads** IIP-15 and IIP-20 clients...." -> "...10 is only open to IIP-10 **policyholders;** IIP-15 and IIP-20 clients pay the..."
- explanation: "...policyholders and misleads IIP-15 and IIP-20 **clients.** ..." -> "...to IIP-10 policyholders; IIP-15 and IIP-20 **clients pay the charge until their IIP ends.** ..."

### study sort 13 (`90bc522b-2485-4087-b3bc-f804acc139c9`)

- Why: GDIF dividends are reinvested during the IIP, not paid to policyholders; cash option only after the IIP. Source: `src/data/proAchieverFeatureComparison.ts:255`.
- explanation: "...in v3.0 that pays quarterly dividends **to policyholders.** ..." -> "...in v3.0 that pays quarterly dividends **(reinvested during the IIP, with a cash payout option after it).** ..."

### study sort 14 (`767436b0-ebbf-4f93-8d62-35cb96555e65`)

- Why: GDIF dividends are not paid to the policyholder during the IIP (reinvested); cash option only after it. Source: `src/data/proAchieverFeatureComparison.ts:255`.
- option 0: "...Monthly **to the policyholder** ..." -> "...Monthly **(nothing)** ..."
- option 1: "...Annually **to the policyholder** ..." -> "...Annually **(nothing)** ..."
- option 2: "...Quarterly **to the policyholder** ..." -> "...Quarterly **(nothing)** ..."
- option 3: "...Semi-annually **to the policyholder** ..." -> "...Semi-annually **(nothing)** ..."
- explanation: "...GDIF pays dividends on a quarterly **basis, providing** regular income to policyholders who invest..." -> "...GDIF pays dividends on a quarterly **basis. During the IIP they are reinvested; after the IIP the policyholder can take them as cash for** regular income...."
- explanation: "...on a quarterly basis, providing regular **income to policyholders who invest in this fund.** ..." -> "...take them as cash for regular **income.** ..."

### study sort 16 (`53f3c806-056b-45e6-8373-9f0b89b644f6`)

- Why: Premium Pass gives up to 12 months per pass (1/2/3 passes on IIP 10/15/20), not a 12-month total cap. Source: `src/data/proAchieverFeatureComparison.ts:244; src/lib/translations/tenYearOtherDetailsTab.ts:126`.
- explanation: "...(max 1/2/3 passes for IIP 10/15/20). **Cumulative use is capped at** 12 policy months with no charges...." -> "...(max 1/2/3 passes for IIP 10/15/20). **Each pass covers up to** 12 policy months with no charges...."

### study sort 53 (`d6f6f1ad-fc97-4624-a809-ae6d6c375851`)

- Why: GDIF dividends become a cash-flow stream only after the IIP; during it they are reinvested. Source: `src/data/proAchieverFeatureComparison.ts:255`.
- explanation: "...giving income-seeking retirees a regular cash-flow **stream.** Be careful with language: dividends are..." -> "...giving income-seeking retirees a regular cash-flow **stream once the IIP has ended (during the IIP they are reinvested).** Be careful with language: dividends are..."

### study sort 128 (`3609794c-054e-44a8-9074-ad0050985e9a`)

- Why: Premium Pass gives up to 12 months per pass, not a 12-month total cap. Source: `src/data/proAchieverFeatureComparison.ts:244; src/lib/translations/tenYearOtherDetailsTab.ts:126`.
- explanation: "...available after 5 annual premiums and **(nothing)** is capped at 12 months cumulatively,..." -> "...available after 5 annual premiums and **each pass** is capped at 12 months, so..."
- explanation: "...premiums and is capped at 12 **months cumulatively,** so it is a safety net,..." -> "...each pass is capped at 12 **months,** so it is a safety net,..."

### study sort 164 (`a278299f-9cb8-4dd7-bc66-24487f10b6c8`)

- Why: Pro Achiever 3.0 policy term is whole life, not maturity at age 100. Source: `src/data/proAchieverFeatureComparison.ts:96`.
- Note: correct_answer moves 1 -> 0 (option 0 reworded); "Age 100 of the original Insured" becomes a distractor. Question wording kept.
- option 0: "...No maturity; it **pays out only on death** ..." -> "...No maturity; it **is a whole-life policy** ..."
- correct_answer: 1 -> 0
- explanation: "...APA **matures at age 100** of the original Insured (or the..." -> "...APA **has no maturity age: it is a whole-life policy that runs for the life** of the original Insured (or the..."
- explanation: "...endowment. In the field, anchor the **age-100 maturity** to make the 40-year compounding story..." -> "...endowment. In the field, anchor the **whole-life term** to make the 40-year compounding story..."

### study sort 173 (`68f59662-b9e7-42c0-83c6-4bad70cf0d07`)

- Why: IIP-10 partial withdrawal charge factor runs 70% (3 premiums paid) to 10% (9 paid), free after the IIP. Source: `src/components/TenYearPlan/OtherDetailsTab.tsx:3078-3085; src/data/proAchieverFeatureComparison.ts:222`.
- Note: The live 4.000x / 0.053x figures may be the product summary's own factor on a different base; the Presenter shows 70% to 10%. Leo may want to confirm before applying.
- explanation: "...partial withdrawal charge factor applies (e.g. **4.000x** in Y3, tapering to 0.053x in..." -> "...partial withdrawal charge factor applies (e.g. **70%** in Y3, tapering to 10% in..."
- explanation: "...(e.g. 4.000x in Y3, tapering to **0.053x** in Y10, then 0 from Y11)...." -> "...(e.g. 70% in Y3, tapering to **10%** in Y9, then 0% once the..."
- explanation: "...in Y3, tapering to 0.053x in **Y10,** then 0 from Y11). These limits..." -> "...in Y3, tapering to 10% in **Y9,** then 0% once the IIP ends)...."
- explanation: "...tapering to 0.053x in Y10, then **0 from Y11).** These limits steer clients away from..." -> "...tapering to 10% in Y9, then **0% once the IIP ends).** These limits steer clients away from..."

### study sort 179 (`0f24974c-d76a-45e4-bd92-e62cff1e1244`)

- Why: GDIF dividends are reinvested during the IIP; cash only after it (the row implied payouts from year 10-11 for every IIP). Source: `src/data/proAchieverFeatureComparison.ts:255`.
- explanation: "...dividends of 4-5% p.a. paid quarterly **(nothing)** while the capital stays invested. Fund..." -> "...dividends of 4-5% p.a. paid quarterly **(reinvested during the IIP, cash option after it)** while the capital stays invested. Fund..."

## AIA Guaranteed Protect Plus (IV)

### exam sort 3 (`1cafb679-3269-43d5-aa9f-c84b615423ca`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- question: "...exact eligibility chain for the Premium **Pause** Option...." -> "...exact eligibility chain for the Premium **Pass** Option...."

### exam sort 25 (`8179d208-7d89-47f9-b251-3e183acf1181`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 2: "...The Premium **Pause** Option can be exercised an unlimited..." -> "...The Premium **Pass** Option can be exercised an unlimited..."
- option 3: "... **(nothing)** Premium Pause defers up to 12..." -> "... **The** Premium Pass Option defers up to..."
- option 3: "...Premium **Pause** defers up to 12 months on..." -> "...The Premium **Pass Option** defers up to 12 months on..."

### exam sort 42 (`afafaf48-fac1-4746-bbd6-03b5255d842f`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 3: "...premiums; accelerated CI cuts death benefit; **Pause** a loan..." -> "...premiums; accelerated CI cuts death benefit; **Premium Pass** a loan..."
- explanation: "...CI reduces death benefit, (4) Premium **Pause** is a loan not a waiver...." -> "...CI reduces death benefit, (4) Premium **Pass Option** is a loan not a waiver...."

### study sort 17 (`24a956fd-ba08-44e4-beaf-1761ee99760a`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- question: "...When is the GPP Premium **Pause** Option available, and what is its..." -> "...When is the GPP Premium **Pass** Option available, and what is its..."
- explanation: "... **(nothing)** Premium Pause requires 3 years of..." -> "... **The** Premium Pass Option requires 3 years..."
- explanation: "...Premium **Pause** requires 3 years of premiums paid,..." -> "...The Premium **Pass Option** requires 3 years of premiums paid,..."

### study sort 18 (`1508089e-5cf2-41cc-bba5-39da0c552ab6`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- question: "...How does the Premium **Pause** Option actually work financially?..." -> "...How does the Premium **Pass** Option actually work financially?..."

### study sort 31 (`af4c6e72-befb-4b86-ab7a-6d4d3a9fb0cd`)

- Why: Maximum entry age is 63 for the 20-year term and 65 for the 15-year term (SQS quoting rules), not 55 / 60 from an underwriting guide. Source: `src/lib/gppIVEligibility.ts:50`.
- explanation: "...Per **AIA's internal underwriting guide** (not the canonical Product Summary or..." -> "...Per **SQS quoting rules** (not the canonical Product Summary or..."
- explanation: "...max entry age 50, 20-year max **55,** 15-year max 60. Remember the longer..." -> "...max entry age 50, 20-year max **63,** 15-year max 65. Remember the longer..."
- explanation: "...50, 20-year max 55, 15-year max **60.** Remember the longer the pay term,..." -> "...50, 20-year max 63, 15-year max **65.** Remember the longer the pay term,..."

### study sort 78 (`21669593-e3cc-4b9a-9982-6c2d68b41430`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 0: "...After 3 years, **(nothing)** Premium Pause defers up to 12..." -> "...After 3 years, **the** Premium Pass Option defers up to..."
- option 0: "...After 3 years, Premium **Pause** defers up to 12 months as..." -> "...After 3 years, the Premium **Pass Option** defers up to 12 months as..."
- explanation: "...Be precise: **(nothing)** Premium Pause is a 12-month interest-free..." -> "...Be precise: **the** Premium Pass Option is a 12-month..."
- explanation: "...Be precise: Premium **Pause** is a 12-month interest-free LOAN, not..." -> "...Be precise: the Premium **Pass Option** is a 12-month interest-free LOAN, not..."

### study sort 95 (`68c90e18-290f-4487-8ade-c99a5b7d0cd8`)

- Why: Entry-age caps are 50 / 63 / 65 for the 25 / 20 / 15-year terms, not 50 / 55 / 60. Source: `src/lib/gppIVEligibility.ts:50`.
- option 1: "...caps entry at 50, 20-pay at **55,** 15-pay at 60); premiums are just..." -> "...caps entry at 50, 20-pay at **63,** 15-pay at 65); premiums are just..."
- option 1: "...50, 20-pay at 55, 15-pay at **60);** premiums are just higher...." -> "...50, 20-pay at 63, 15-pay at **65);** premiums are just higher...."
- explanation: "...premium term are 50 for 25-pay, **55** for 20-pay, 60 for 15-pay, so..." -> "...premium term are 50 for 25-pay, **63** for 20-pay, 65 for 15-pay, so..."
- explanation: "...50 for 25-pay, 55 for 20-pay, **60** for 15-pay, so a 50-year-old still..." -> "...50 for 25-pay, 63 for 20-pay, **65** for 15-pay, so a 50-year-old still..."

### study sort 99 (`a1202fd5-067e-40b7-a3ca-c20e359c82b8`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 2: "...level; the only relief tools are **(nothing)** Premium Pause, a sum-assured reduction, and..." -> "...level; the only relief tools are **the** Premium Pass Option, a sum-assured reduction,..."
- option 2: "...the only relief tools are Premium **Pause,** a sum-assured reduction, and OPAI...." -> "...only relief tools are the Premium **Pass Option,** a sum-assured reduction, and OPAI...."
- explanation: "...ILP. The only relief levers are **(nothing)** Premium Pause (narrow: involuntary retrenchment, after..." -> "...ILP. The only relief levers are **the** Premium Pass Option (narrow: involuntary retrenchment,..."
- explanation: "...The only relief levers are Premium **Pause** (narrow: involuntary retrenchment, after 3 years),..." -> "...only relief levers are the Premium **Pass Option** (narrow: involuntary retrenchment, after 3 years),..."

### study sort 104 (`366dad44-9828-429d-a577-ef8b41ce818b`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 3: "...GPP premiums are level and fixed; **(nothing)** Premium Pause excludes the self-employed, so..." -> "...GPP premiums are level and fixed; **the** Premium Pass Option excludes the self-employed,..."
- option 3: "...premiums are level and fixed; Premium **Pause** excludes the self-employed, so right-size or..." -> "...are level and fixed; the Premium **Pass Option** excludes the self-employed, so right-size or..."

### study sort 105 (`f1187319-f5cb-4b9c-ad5b-12663e09a79b`)

- Why: Maximum entry age is 65 for the 15-year term and 63 for the 20-year term, not 60 / 55. Source: `src/lib/gppIVEligibility.ts:50`.
- option 0: "...Yes: the 15-year (entry **60)** and 20-year (entry 55) terms still..." -> "...Yes: the 15-year (entry **65)** and 20-year (entry 63) terms still..."
- option 0: "...15-year (entry 60) and 20-year (entry **55)** terms still work; default to 2x..." -> "...15-year (entry 65) and 20-year (entry **63)** terms still work; default to 2x..."
- explanation: "...At 55 the 15-year (max entry **60)** and 20-year (max entry 55) terms..." -> "...At 55 the 15-year (max entry **65)** and 20-year (max entry 63) terms..."
- explanation: "...entry 60) and 20-year (max entry **55)** terms both apply, so GPP is..." -> "...entry 65) and 20-year (max entry **63)** terms both apply, so GPP is..."

### study sort 116 (`6aef24bb-5137-4396-a0a8-28994b2e447e`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- explanation: "...+ 15 special conditions, IDF, Premium **Pause,** Vitality, OPAI) and let the side-by-side..." -> "...+ 15 special conditions, IDF, Premium **Pass Option,** Vitality, OPAI) and let the side-by-side..."

### study sort 127 (`1d619924-9624-41a2-aea5-5bd7e61bb8fb`)

- Why: The retrenchment option is the Premium Pass Option, not 'Premium Pause'. Source: `src/data/gppFeatureComparison.ts:253`.
- option 1: "...accelerated CI cuts death benefit, Premium **Pause** is a loan...." -> "...accelerated CI cuts death benefit, Premium **Pass Option** is a loan...."
- explanation: "...reduces the remaining death benefit, and **(nothing)** Premium Pause is a repayable deferral..." -> "...reduces the remaining death benefit, and **the** Premium Pass Option is a repayable..."
- explanation: "...the remaining death benefit, and Premium **Pause** is a repayable deferral rather than..." -> "...remaining death benefit, and the Premium **Pass Option** is a repayable deferral rather than..."

### study sort 175 (`bfeb4c83-55e2-4d47-af8f-b98d505aaba0`)

- Why: GPP's ~2% is an illustrated yield with non-guaranteed bonuses, not a ~2% floor. Source: `src/data/gppFeatureComparison.ts:229`.
- Note: The marked option and the line 'a guaranteed floor underneath equity upside' are left: they read as GPP's guaranteed cover and cash value, not a guaranteed yield. Study 82's 'GPP for the guaranteed floor' left for the same reason; Leo may want both softened.
- explanation: "...invests the difference, outperforms GPP's ~2% **floor,** and keeps discipline for 25+ years...." -> "...invests the difference, outperforms GPP's ~2% **illustrated yield,** and keeps discipline for 25+ years...."

### study sort 188 (`5603262c-4b97-4b50-914d-c7e48b095e99`)

- Why: The child-policy payer rider is Early Critical Protector Payor (II), not 'CPWP'. Source: `src/data/gppFeatureComparison.ts:205`.
- Note: Presenter says the payor waives the child's premiums to age 25 on the payer's multi-stage CI, TPD or death; the live row says 'for the rest of the term'. Not in the corrections, so not changed; worth a look.
- question: "...What does the Payer Benefit **(CPWP)** do on a child's policy?..." -> "...What does the Payer Benefit **(Early Critical Protector Payor (II))** do on a child's policy?..."

## AIA Pro Lifetime Protector (II)

### study sort 89 (`b7d68b4b-a5e3-407c-a5b7-bc0a4b961dac`)

- Why: Year 1's 80% is the premium charge, not the allocation (20% is invested), with 100% invested from Year 5. Source: `src/lib/plpSimulator.ts:244-258; src/data/plpFeatureComparison.ts:215`.
- Note: Marked option [3] dropped 'covers protection charges and admin': in the Presenter cover is paid by separate benefit charges, not the premium charge. Live study 148 and 213 still say the early charge 'funds the cover'; left alone as outside the corrections.
- question: "...A client says: 'The 80% **allocation** in Year 1 means 20% is..." -> "...A client says: 'The 80% **premium charge** in Year 1 means most of..."
- question: "...80% allocation in Year 1 means **20%** is wasted.' How do you reframe..." -> "...premium charge in Year 1 means **most of my first premium** is wasted.' How do you reframe..."
- option 0: "...That **20%** is essentially just pure profit that..." -> "...That **80%** is essentially just pure profit that..."
- option 1: "...plan out there takes a full **50%** in Year 1, so an 80%..." -> "...plan out there takes a full **90%** in Year 1, so an 80%..."
- option 1: "...in Year 1, so an 80% **allocation** is actually unusually generous here..." -> "...in Year 1, so an 80% **charge** is actually unusually generous here..."
- option 2: "...You are right that the whole **20%** is genuinely lost, but the strong..." -> "...You are right that the whole **80%** is genuinely lost, but the strong..."
- option 3: "...The **20% covers protection charges and admin, so it buys immediate cover;** 100% goes in from year 5,..." -> "...The **80% charge is front-loaded, like buying a laptop, then falls away;** 100% goes in from year 5,..."
- explanation: "...Reframe the **non-allocated portion** as the cost of immediate protection,..." -> "...Reframe the **Year 1 premium charge** as front-loading (the laptop analogy), not..."
- explanation: "...Reframe the non-allocated portion as **the cost of immediate protection,** not waste, then point to the..." -> "...the Year 1 premium charge as **front-loading (the laptop analogy),** not waste, then point to the..."

### study sort 129 (`11b6454a-f2c5-4f83-8441-9afe394b586f`)

- Why: PLP has no early-years booster, so the question about boosters is made general (ILP) and the explanation says PLP has none. Source: `src/data/plpFeatureComparison.ts:215,225`.
- Note: Other PLP rows mention boosters or a welcome bonus only in false distractors (exam 37, 39, 41; study 122, 124, 126, 127, 128, 132) or in a general compliance line (exam 44 explanation: 'boosters add units'); left unchanged. Leo may prefer to replace study 129 entirely.
- question: "...Which claim about **PLP** boosters and welcome bonus is NOT..." -> "...Which claim about **ILP** boosters and welcome bonus is NOT..."
- explanation: "...terms, not as a return guarantee. **(nothing)** ..." -> "...terms, not as a return guarantee. **PLP itself has no early-years booster.** ..."

## AIA Solitaire PA (II)

### exam sort 0 (`a072c16a-b161-477c-a011-224d83a11d48`)

- Why: Renewal bonus is +5% per renewal up to 30%, reset only by an Accidental Dismemberment and Burns claim, not per claim-free year. Source: `src/data/paFeatureComparison.ts:103,105`.
- question: "...suffers a major dismemberment after 6 **claim-free years.** What is the maximum payout including..." -> "...suffers a major dismemberment after 6 **renewals with no Accidental Dismemberment and Burns claim.** What is the maximum payout including..."
- explanation: "...The renewal bonus adds 5% per **claim-free year** on Benefits 1-5, up to a..." -> "...The renewal bonus adds 5% per **renewal** on Benefits 1-5, up to a..."
- explanation: "...to a maximum of 6 renewals **(30%).** $300,000 x 1.30 = $390,000. Use..." -> "...to a maximum of 6 renewals **(30%), and only a Benefit 4 (Accidental Dismemberment and Burns) claim resets it.** $300,000 x 1.30 = $390,000. Use..."
- explanation: "...clients their cover grows just by **staying claim-free.** ..." -> "...clients their cover grows just by **renewing without a Benefit 4 claim.** ..."

### exam sort 30 (`7f0d191a-ae6b-446c-afec-b2b4b37c6cc1`)

- Why: Benefit 6 medical limit is plan-tiered, S$2,000 on Plan 1 up to S$5,000 on Plan 4, not a flat $5,000. Source: `src/data/paFeatureComparison.ts:115`.
- explanation: "...6 covers medical expenses up to **(nothing)** $5,000 per accident...." -> "...6 covers medical expenses up to **$2,000 (Plan 1) to** $5,000 (Plan 4) per accident...."
- explanation: "...covers medical expenses up to $5,000 **(nothing)** per accident...." -> "...to $2,000 (Plan 1) to $5,000 **(Plan 4)** per accident...."

### exam sort 31 (`ceb29afb-1f22-4baa-ba7c-0767ff651a4b`)

- Why: Plan 2 is S$371.82 and Plan 4 S$855.69 a year: about $1.33 a day more, about 2.3x the price for 3x the dismemberment cover (not 3.8x for 7.5x, which is Plan 1 vs Plan 4). Source: `src/data/paFeatureComparison.ts:70,295`.
- option 2: "...Explain it is about **$1.35** more a day for roughly 3x..." -> "...Explain it is about **$1.33** more a day for roughly 3x..."
- explanation: "...the cost difference in daily terms **($1.35/day** more) while emphasizing the disproportionate coverage..." -> "...the cost difference in daily terms **($1.33/day** more) while emphasizing the disproportionate coverage..."
- explanation: "...emphasizing the disproportionate coverage increase. The **3.8x** price for 7.5x coverage ratio is..." -> "...emphasizing the disproportionate coverage increase. The **2.3x** price for 3x coverage ratio is..."
- explanation: "...coverage increase. The 3.8x price for **7.5x** coverage ratio is the key value..." -> "...coverage increase. The 2.3x price for **3x** coverage ratio is the key value..."

### exam sort 32 (`28918c75-a382-4345-86e7-03ac88b907a2`)

- Why: Entry age is 16 to 70, so the scenario father is 68; the distractor still used the old age 75. Source: `src/data/paFeatureComparison.ts:279`.
- Note: Question, answer and explanation were already on 68 / entry to 70; only the leftover age in a distractor changes.
- option 3: "...At **75,** the premiums for someone his age..." -> "...At **68,** the premiums for someone his age..."

### study sort 14 (`e0c4f533-8240-4c4c-baca-3131bbd7970b`)

- Why: Renewal bonus is +5% per renewal up to 30%, reset only by an Accidental Dismemberment and Burns claim, not per claim-free year. Source: `src/data/paFeatureComparison.ts:103,105`.
- question: "...is the renewal bonus percentage per **claim-free year** on Features 1-5?..." -> "...is the renewal bonus percentage per **renewal** on Features 1-5?..."
- explanation: "...bonus increases Features 1-5 by 5% **per year for** each claim-free year, up to a..." -> "...bonus increases Features 1-5 by 5% **at** each renewal, up to a maximum..."
- explanation: "...by 5% per year for each **claim-free year,** up to a maximum of 6..." -> "...Features 1-5 by 5% at each **renewal,** up to a maximum of 6..."
- explanation: "...up to a maximum of 6 **years.** ..." -> "...up to a maximum of 6 **renewals (30%). It resets only after a claim under Feature 4 (Accidental Dismemberment and Burns).** ..."

### study sort 81 (`fbf00408-56ca-4a66-b854-862c9c558072`)

- Why: Renewal bonus grows per renewal and resets only on an Accidental Dismemberment and Burns claim, not per claim-free year. Source: `src/data/paFeatureComparison.ts:103,105`.
- explanation: "...to 30% extra cover over 6 **claim-free years),** which is a concrete reason not..." -> "...to 30% extra cover over 6 **renewals with no Accidental Dismemberment and Burns claim),** which is a concrete reason not..."

### study sort 97 (`9ff26057-439c-4630-924a-5300749bfc17`)

- Why: Renewal bonus grows per renewal and resets only on an Accidental Dismemberment and Burns claim, not per claim-free year. Source: `src/data/paFeatureComparison.ts:103,105`.
- explanation: "...accrues up to 30% over six **claim-free years.** Pairing the incentive with the 62-cents-a-day..." -> "...accrues up to 30% over six **renewals with no Accidental Dismemberment and Burns claim.** Pairing the incentive with the 62-cents-a-day..."

### study sort 99 (`3e22964d-a516-45bc-a4b8-1e63a8a0e04c`)

- Why: Renewal bonus grows per renewal and resets only on an Accidental Dismemberment and Burns claim, not per claim-free year. Source: `src/data/paFeatureComparison.ts:103,105`.
- explanation: "...by up to 30% over six **claim-free years** at no extra cost. This answers..." -> "...by up to 30% over six **renewals** at no extra cost (only an..."
- explanation: "...six claim-free years at no extra **cost.** This answers the worry without overpromising..." -> "...over six renewals at no extra **cost (only an Accidental Dismemberment and Burns claim resets it).** This answers the worry without overpromising..."

### study sort 106 (`902f1d5b-2890-419c-a080-79c629ac92d1`)

- Why: With Plan 2 at S$371.82 and Plan 4 at S$855.69, the gap is about $1.33 a day; ratio 2.3x / 3x was already right. Source: `src/data/paFeatureComparison.ts:70,295`.
- explanation: "...and frame the gap as about **$1.35** a day...." -> "...and frame the gap as about **$1.33** a day...."

### study sort 148 (`99c12edb-b97b-4000-aff4-ada1663cef7e`)

- Why: When Solitaire PA optional benefits end stays "check the current AIA product summary" (Presenter disagrees with itself). Source: `src/data/paFeatureComparison.ts:284 vs src/data/accidentPlanRates.ts:107-147 (report section 2, not ruled)`.
- Note: Same treatment as repo study#126; marked option does not mention optional benefits.
- explanation: "...birthday, basic benefits reduce by 50% **and** optional benefits stop entirely; the policy..." -> "...birthday, basic benefits reduce by 50% **(check the current AIA product summary for when the** optional benefits end); the policy itself..."
- explanation: "...reduce by 50% and optional benefits **stop entirely;** the policy itself terminates at age..." -> "...summary for when the optional benefits **end);** the policy itself terminates at age..."

## Already correct in the live rows (no change)

- AIA Platinum Wealth Venture: exam sort 0, exam sort 15, exam sort 20, exam sort 28, exam sort 33, study sort 10, study sort 23, study sort 34, study sort 44, study sort 49, study sort 50, study sort 57, study sort 58, study sort 64, study sort 65, study sort 67, study sort 75, study sort 76, study sort 87, study sort 90, study sort 94, study sort 96, study sort 107
- AIA HealthShield Gold Max: exam sort 8, exam sort 26, study sort 8, study sort 40, study sort 56, study sort 91, study sort 92
- AIA Ultimate Critical Cover: exam sort 28, study sort 94, study sort 104, study sort 110
- AIA Pro Achiever 3.0: exam sort 32, study sort 32, study sort 90, exam sort 3, exam sort 33, study sort 5, study sort 6, study sort 48, study sort 72, study sort 88, study sort 98, study sort 169
- AIA Guaranteed Protect Plus (IV): exam sort 32, exam sort 33, study sort 123
- AIA Pro Lifetime Protector (II): exam sort 1, exam sort 3, study sort 3, study sort 4, study sort 6, study sort 7, study sort 8, study sort 9, study sort 31, study sort 85
- AIA Solitaire PA (II): exam sort 4, exam sort 23, exam sort 33, study sort 21, study sort 59, study sort 98, study sort 111, study sort 118

## Questions with no live row

The live bank has no row asking these. Most fall on sort_order gaps left when rows were removed in June/July. Nothing to change.

- AIA Platinum Wealth Venture exam#16: No live exam row asks this: the live exam bank has no sort_order 16 or 17 and no fixed-deposit pre-retiree question. The study version (study#107, live 7e601501) is already correct.
- AIA Platinum Wealth Venture exam#17: No live exam row asks this: the live exam bank has no sort_order 16 or 17 and no premium-too-high question. The study versions (study#58 / study#65, live 0a92007e / 8f61fa2c) already say S$1,500 a month.
- AIA Platinum Wealth Venture study#122: Same question as study#4; its live row 81ecdba5 (sort 4) already teaches 12% at S$42,000+ and is handled under study#4. No other live row asks this.
- AIA Ultimate Critical Cover exam#2: No live exam row asks this question: live sort_order 2 is absent and no other live exam row matches it by meaning. The old 'Prudential 37' count also appears in live study 1, fixed as an extra.
- AIA Ultimate Critical Cover exam#9: No live exam row asks this question: live sort_order 9 is absent and no other live exam row matches it by meaning. The old S$3,320 / S$1,400 pair also appears in live study 183, fixed as an extra.
- AIA Ultimate Critical Cover exam#15: No live exam row asks this question: live sort_order 15 is absent and no other live exam row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover exam#17: No live exam row asks this question: live sort_order 17 is absent and no other live exam row matches it by meaning. The 'related-illness block' wording also appears in live study 23, 237 and 239, fixed as extras.
- AIA Ultimate Critical Cover exam#20: No live exam row asks this question: live sort_order 20 is absent and no other live exam row matches it by meaning.
- AIA Ultimate Critical Cover exam#26: No live exam row asks this question: live sort_order 26 is absent and no other live exam row matches it by meaning. The 'related-illness block' wording also appears in live study 23, 237 and 239, fixed as extras.
- AIA Ultimate Critical Cover study#5: No live study row asks this question: live sort_order 5 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#24: No live study row asks this question: live sort_order 24 is absent and no other live study row matches it by meaning. The old 'Prudential 37' count also appears in live study 1, fixed as an extra.
- AIA Ultimate Critical Cover study#26: No live study row asks this question: live sort_order 26 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#27: No live study row asks this question: live sort_order 27 is absent and no other live study row matches it by meaning. The 'related-illness block' wording also appears in live study 23, 237 and 239, fixed as extras.
- AIA Ultimate Critical Cover study#28: No live study row asks this question: live sort_order 28 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#30: No live study row asks this question: live sort_order 30 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#34: No live study row asks this question: live sort_order 34 is absent and no other live study row matches it by meaning. The old S$3,320 / S$1,400 pair also appears in live study 183, fixed as an extra.
- AIA Ultimate Critical Cover study#35: No live study row asks this question: live sort_order 35 is absent and no other live study row matches it by meaning. The old S$3,320 / S$1,400 pair also appears in live study 183, fixed as an extra.
- AIA Ultimate Critical Cover study#36: No live study row asks this question: live sort_order 36 is absent and no other live study row matches it by meaning. The old S$3,320 / S$1,400 pair also appears in live study 183, fixed as an extra.
- AIA Ultimate Critical Cover study#37: No live study row asks this question: live sort_order 37 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#38: No live study row asks this question: live sort_order 38 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#42: No live study row asks this question: live sort_order 42 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#43: No live study row asks this question: live sort_order 43 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#54: No live study row asks this question: live sort_order 54 is absent and no other live study row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover study#55: No live study row asks this question: live sort_order 55 is absent and no other live study row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover study#56: No live study row asks this question: live sort_order 56 is absent and no other live study row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover study#57: No live study row asks this question: live sort_order 57 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#61: No live study row asks this question: live sort_order 61 is absent and no other live study row matches it by meaning. The old 'Prudential 37' count also appears in live study 1, fixed as an extra.
- AIA Ultimate Critical Cover study#62: No live study row asks this question: live sort_order 62 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#81: No live study row asks this question: live sort_order 81 is absent and no other live study row matches it by meaning. The 'related-illness block' wording also appears in live study 23, 237 and 239, fixed as extras.
- AIA Ultimate Critical Cover study#95: No live study row asks this question: live sort_order 95 is absent and no other live study row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover study#105: No live study row asks this question: live sort_order 105 is absent and no other live study row matches it by meaning. Live study 58 and 74 carry the same $388k-$1.5M projection and are changed.
- AIA Ultimate Critical Cover study#108: No live study row asks this question: live sort_order 108 is absent and no other live study row matches it by meaning.
- AIA Ultimate Critical Cover study#123: No live study row asks this question: live sort_order 123 is absent and no other live study row matches it by meaning. The old 679x figure also appears in live study 188, fixed as an extra.
- AIA HealthShield Gold Max exam#14: Live exam sort_order 14 does not exist; the same question lives in the study bank (612f83ee, study 57), handled under study#57.
- AIA HealthShield Gold Max exam#20: Live exam sort_order 20 does not exist; the study-bank twin (c624654a, study 62) is handled under study#62.
- AIA HealthShield Gold Max study#25: Live study sort_order 25 (215e5036) asks how base-plan CDL cancer drug cover is expressed and is already correct (5x MSHL, 16x with Cancer Care Pro).
- AIA HealthShield Gold Max study#48: Live study sort_order 48 does not exist. Exam 12 (370c4847) frames Plan A at $80-90/month and has no B1 $25 figure. The hawker rows (exam 32 4d605c45, study 104 e856c97f) still say "Plan B Lite about $25/month"; the repo kept that wording too, so not changed.
- AIA Pro Lifetime Protector (II) study#5: No live PLP study row at sort_order 5 and no live row asks which rider covers early-stage CI or how many early-stage conditions. The Early CI rider appears only as a false distractor (exam 21, study 64), which is fine.
- AIA Guaranteed Protect Plus (IV) exam#5: No live GPP exam row at sort_order 5 and no live exam row asks about entry-age caps or the 2x minimum SA. The same fact is fixed in study rows 31, 95 and 105.
- AIA Guaranteed Protect Plus (IV) exam#10: No live GPP exam row at sort_order 10 and no live exam row asks about waiting periods, survival period and free-look together. No other live row says the option is unavailable to full-time MPs.
- AIA Guaranteed Protect Plus (IV) exam#44: No live GPP exam row at sort_order 44 and no live exam row asks who is excluded from the option. The study rows that ask it (123, 157) already say Premium Pass Option.
- AIA Guaranteed Protect Plus (IV) study#32: No live GPP study row at sort_order 32 and no live row asks the 20-year entry age on its own; study 31's explanation (fixed above) now carries 63.
- AIA Guaranteed Protect Plus (IV) study#33: No live GPP study row at sort_order 33 and no live row asks the 15-year entry age on its own; study 31's explanation (fixed above) now carries 65.
- AIA Solitaire PA (II) study#126: No live row asks what happens at the renewal after the 75th birthday. Closest is study so=148 (entry ages + step-down + termination), which states "optional benefits stop entirely"; fixed as an extra entry.
