# Product facts alignment with the Financial Presenter (2026-11-01)

Leo chose the Financial Presenter's product data (repo growing-age-calculator) as the single source of truth for product facts. This report lists every hub change made to match it, the figures replaced with "check the current AIA product summary" because the Presenter disagrees with itself, proposed SQL for stale `products` rows (not applied), and what `scripts/sync-curriculum-knowledge.mjs` does when run.

Seven local commits made the changes, one per product (AIA Wealth Venture needed none): 404bf5be (Platinum Wealth Venture), 61939524 (HealthShield Gold Max), 74033cc9 (Pro Achiever), 6815edb1 (Solitaire PA), c0d30a3e (Ultimate Critical Cover), f952cf2d (Guaranteed Protect Plus), 57f64bdc (Pro Lifetime Protector). After Leo's rulings, cd5c5331 (Pro Achiever special bonus) and f8a90153 (HSG Max A limit, MediShield Life pro-ration) put three groups of figures back; section 2 has the details. `npm run build` and `npx vitest run` (1477 tests) pass.

The live database changes Leo approved are prepared, not run. They run after the knowledge re-sync; section 5 has the order.

How to read the paths:
- Hub paths are relative to this repo. Line numbers are as of each product's commit; in files several products touched they may be off by a few lines.
- Presenter paths are relative to the growing-age-calculator repo (for example `src/hooks/useFiveYearPlanCalculation.ts`).

## The in-app quizzes read the database, not the bank files

The study page loads its questions from the live table `question_bank_questions` (`src/hooks/useQuestionBank.tsx:36`), not from the `src/data/*StudyBank.ts` and `src/data/*ExamQuestions.ts` files changed here. Those rows were seeded once from these files by `scripts/seed-question-bank.ts`. Learners keep seeing the old questions and answers until the rows are updated. `scripts/update-question-bank-product-facts.mjs` does that with the live-row edits in `scripts/quiz-live-fixes-2026-11-01.json` (section 5). It has not been applied.

## 1. Change list

Each entry: the fact, old value -> new value, the hub file and lines changed, and the Presenter source.

### AIA Platinum Wealth Venture (PWV)

Study bank: `src/data/platinumWealthVentureStudyBank.ts`. Exam questions: `src/data/platinumWealthVentureExamQuestions.ts`.

- **Version.** "2.0", "PS v1.0 042025" -> "3.0", "PS ver 1.0 (Oct 2026)".
  - Hub: study bank :30,38,46,136,888-896,1713,1718; exam questions :122; `docs/product-mastery-track/week-7/day-31.md`:12,20,30,70-82,316,348,354,362; `docs/product-mastery-track/week-7/day-33.md`:120,125,145-148,253; `docs/product-mastery-track/week-7/day-34.md`:263,272; `docs/product-mastery-track/week-7/day-35.md`:28; `docs/cheat-sheets/product-mastery/week-07.md`:7,11,41,103; `docs/next-60-days/week-8/day-45.md`:75; `docs/cheat-sheets/next-60-days/week-08.md`:80; `docs/competitor-products-singapore.md`:101; `src/features/global-search/headingIndex.ts`:3325.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:87-90; `src/data/pwvFeatureComparison.ts`:5-11,43-44,304.
- **Brochure link.** `aia-platinum-wealth-venture-ii.pdf` (now a dead link) -> `aia-platinum-wealth-venture-iii.pdf`.
  - Hub: `src/data/competitorProductLinks.ts`:146,148.
  - Presenter: `src/data/pwvFeatureComparison.ts`:44.
- **Premium term.** "8 years" marked correct, and "5 years only" -> a 5-year main plan, plus a 2-year term and a 1-year single premium paid from SRS.
  - Hub: study bank :30-38 (answer key 3 -> 0); `docs/product-mastery-track/week-7/day-31.md`:30; `docs/cheat-sheets/product-mastery/week-07.md`:41; `docs/first-60-days/week-10/day-57.md`:77,123; `docs/competitor-products-singapore.md`:101.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:85-90,103-127; `src/components/FiveYearPlan/FiveYearInputForm.tsx`:239-252; `src/data/pwvFeatureComparison.ts`:72.
- **Payment method.** "Cash only, no CPF or SRS" -> the 1-year single premium is paid from SRS only, not cash.
  - Hub: study bank :310-318,1200-1208,1319-1324,1497; exam questions :127-135.
  - Presenter: `src/components/FiveYearPlan/FiveYearInputForm.tsx`:251; `src/data/changelog.ts`:47-49.
- **Single premium in sales flows.** "PWV single-premium" -> "(paid from SRS only)".
  - Hub: `src/data/appointmentFlows.ts`:274,276,283,293,590; `docs/product-mastery-track/week-7/day-35.md`:416; `src/data/caseNarratives.ts`:970.
  - Presenter: `src/components/FiveYearPlan/FiveYearInputForm.tsx`:251.
- **Minimum premium by payment mode.** S$3,900 semi-annual / S$1,950 quarterly / S$650 monthly -> S$9,000 / S$4,500 / S$1,500.
  - Hub: study bank :46,52,835,840,938,942,1091,1096; exam questions :239,243,385,390.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:107; `src/components/FiveYearPlan/FiveYearInputForm.tsx`:225.
- **Minimums on the other terms.** Added: 2-year S$48,000 a year, 1-year single premium S$15,000.
  - Hub: study bank :52,318,1203,1208; exam questions :135.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:114,121.
- **Total minimum commitment.** S$39,000 marked correct -> S$90,000.
  - Hub: study bank :494-500.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:107.
- **Welcome bonus, top band.** S$12,000 and above, 35% -> S$42,000 and above, 3% / 4% / 5% (12% in all).
  - Hub: study bank :72,75,840,1746-1754.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:111,139-144.
- **Welcome bonus, middle band.** S$9,000 to S$11,999 -> S$24,000 to S$41,999 earns 3% in year 1 only; nothing below S$24,000.
  - Hub: study bank :86,94.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:111.
- **Investment bonus timing.** Years 9-12, or one-time at year 8 -> the start of years 8 to 11.
  - Hub: study bank :102-122,638,644,823,1290,1296,1735,1740; exam questions :38,44,217.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:109,715-717; `src/lib/translations/fiveYearOtherDetailsTab.ts`:47; `src/data/pwvFeatureComparison.ts`:143.
- **Supplementary charge end.** "After year 10" marked correct -> after year 7.
  - Hub: study bank :154-159 (answer key 1 -> 3).
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:702-704; `src/lib/translations/fiveYearOtherDetailsTab.ts`:110.
- **Supplementary charge vs Pro Achiever.** "Same 10-year duration" -> 7 vs 10 years.
  - Hub: study bank :723,1375; exam questions :18,277.
  - Presenter: `src/lib/translations/fiveYearOtherDetailsTab.ts`:110.
- **Supplementary charge on the other terms.** Added: 2.9% on the 2-year and 1-year terms.
  - Hub: study bank :145,150,1718-1726.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:115,122.
- **Surrender charges.** 70% down to 5%, 0% from year 11 -> 60/60/50/40/30/20/10% over years 1 to 7, 0% from year 8.
  - Hub: study bank :175-192 (answer key 1 -> 0),706-714,967,970,1091,1096,1539; exam questions :27,31,230,322,325,385,390; `docs/product-mastery-track/week-7/day-31.md`:104; `docs/product-mastery-track/week-7/day-33.md`:127,171-172,226,228,337-343; `docs/product-mastery-track/week-7/day-34.md`:267-270; `docs/product-mastery-track/week-7/day-35.md`:56,416,498; `docs/cheat-sheets/product-mastery/week-07.md`:37; `src/data/caseNarratives.ts`:970,979.
  - Presenter: `src/components/FiveYearPlan/FiveYearThreeYearMatchComparison.tsx`:812-813; `src/lib/translations/fiveYearOtherDetailsTab.ts`:128; `src/data/pwvFeatureComparison.ts`:187.
- **Partial withdrawal.** "From year 3" -> from year 1, charged in years 1 to 7, none from year 8.
  - Hub: study bank :342,346,1079,1082,1251,1254; exam questions :451-459; `docs/product-mastery-track/week-7/day-33.md`:157,225,228; `docs/product-mastery-track/week-7/day-35.md`:56,498.
  - Presenter: `src/lib/translations/fiveYearOtherDetailsTab.ts`:102,124; `src/data/pwvFeatureComparison.ts`:215.
- **Premium holiday charge.** "Until the 8th premium" -> only before the 5 years of regular premiums are paid.
  - Hub: study bank :542,1352; exam questions :70; `docs/product-mastery-track/week-7/day-33.md`:126; `docs/product-mastery-track/week-7/day-35.md`:66.
  - Presenter: `src/lib/translations/fiveYearOtherDetailsTab.ts`:120.
- **Knowledge-base highlight.** "Preferential charges at premium tiers" -> "Welcome bonus tiered by premium size".
  - Hub: `src/kb/products/investment-products/platinum-wealth-venture.md`:7.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:111.
- **Guard reason text.** "PWV 2.0 PS v1.0 042025" -> 3.0 (patterns unchanged).
  - Hub: `scripts/check-question-banks-canonical.mjs`:83-93.
  - Presenter: `src/hooks/useFiveYearPlanCalculation.ts`:87-90.

### AIA HealthShield Gold Max (HSG Max)

Study bank: `src/data/healthshieldGoldMaxStudyBank.ts`. Exam questions: `src/data/healthshieldGoldMaxExamQuestions.ts`.

- **Riders.** VitalHealth A / A Value / B, deductible covered, $3,000 cap -> VitalHealth Pro A / Pro B / Pro B Lite: deductible not covered, 5% co-payment capped at $6,000, and the cap applies only with an AIA Preferred Provider, a pre-authorisation or an A&E referral.
  - Hub: `docs/first-60-days/week-10/day-56.md`:356-364; `docs/competitor-products-singapore.md`:82; `src/data/competitorProductLinks.ts`:113.
  - Presenter: `src/lib/hsgClaims.ts`:1-35; `src/data/ipFeatureComparison.ts`:181-197.
- **Waiver Pass and claim-triggered deductible.** Removed -> the deductible is paid first, then 5% capped at $6,000; worst case $9,500.
  - Hub: `docs/first-60-days/week-10/day-56.md`:366-370.
  - Presenter: `src/lib/hsgClaims.ts`:6-11.
- **"The rider covers the deductible."** -> not covered since 1 Apr 2026.
  - Hub: `docs/first-60-days/week-10/day-56.md`:503; `docs/first-60-days/week-10/day-58.md`:340; `docs/product-mastery-track/week-7/day-35.md`:373; `src/data/caseNarratives.ts`:931,1673,1684; `docs/product-mastery-track/_drawings-playbook.md`:350,352 (now $3,500 + $325 = $3,825).
  - Presenter: `src/data/ipFeatureComparison.ts`:195; `src/lib/hsgClaims.ts`:41-43.
- **Maximum out of pocket with the rider.** $6,000 -> $9,500; "caps lifetime risk" -> caps the co-payment.
  - Hub: `docs/product-mastery-track/week-5/day-23.md`:74,336; `docs/product-mastery-track/week-5/day-24.md`:256.
  - Presenter: `src/lib/hsgClaims.ts`:11.
- **Cases on the old rider.** Added a note that the rider is no longer sold and what Pro A does instead.
  - Hub: `docs/product-mastery-track/week-5/day-25.md`:293; `src/data/caseNarratives.ts`:1556,1596; `src/data/caseNarrativesReal.ts`:1762,3954,6081; `docs/first-60-days/assignments/assignment-11.md`:381.
  - Presenter: `src/components/twfps/hsgQuote.ts`:45-48.
- **Rider names.** Cancer Care Booster -> Cancer Care Pro; Emergency & Outpatient -> Emergency Care Pro; "+5x" -> 5x including MediShield Life.
  - Hub: `docs/first-60-days/week-10/day-56.md`:381-387,401,662,668; `docs/first-60-days/week-9/recap.md`:76.
  - Presenter: `src/data/ipFeatureComparison.ts`:204-209.
- **MediSave.** "Riders are Medisave-payable" -> the base plan is paid from MediSave up to the AWL, riders in cash.
  - Hub: `docs/first-60-days/week-10/day-56.md`:305.
  - Presenter: `src/components/twfps/hsgQuote.ts`:72-82.
- **Ward cover.** B Lite "B ward" -> B1; Plan B "B or C" -> A ward and below; "HSGM B (B2 ward)" -> A ward.
  - Hub: `docs/first-60-days/week-10/day-56.md`:354; `docs/product-mastery-track/week-5/day-25.md`:277-281,346; `src/data/caseNarratives.ts`:1576-1580,1673; `docs/product-mastery-track/week-6/day-29.md`:68,155,265.
  - Presenter: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:218-222.
- **B Lite case.** $3,500 deductible -> $2,500 (B1 ward), totals recomputed.
  - Hub: `docs/product-mastery-track/week-5/day-25.md`:226-281; `src/data/caseNarratives.ts`:1541-1566; `src/data/caseVault.ts`:588.
  - Presenter: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:812-905.
- **Pre- and post-hospitalisation.** "13 months across the board", or 12 months -> 13 months with an AIA Preferred Provider, 100 days otherwise.
  - Hub: `docs/first-60-days/week-10/day-56.md`:391; `docs/product-mastery-track/week-5/day-21.md`:249; `docs/product-mastery-track/week-5/day-25.md`:304,313; study bank :136,584,812; exam questions :116,122; `docs/_competitor-pricing-reference.md`:165.
  - Presenter: `src/data/ipFeatureComparison.ts`:107-116.
- **Competitor pre- and post-hospitalisation limits.** 6 months -> 180 days before, 365 days after.
  - Hub: `docs/product-mastery-track/week-5/day-21.md`:140,249; `docs/cheat-sheets/product-mastery/week-05.md`:34.
  - Presenter: `src/data/ipFeatureComparison.ts`:107-116.
- **Proton beam therapy and cell, tissue and gene therapy (CTGTP).** Listed under Cancer Care Pro -> base plan.
  - Hub: `docs/product-mastery-track/week-5/day-21.md`:185-186.
  - Presenter: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:655-666.
- **Plan B in the real-case files.** $2M limit -> $1M; "$2M lifetime" -> unlimited.
  - Hub: `src/data/caseNarrativesReal.ts`:373,1757,3633,5518,6075,6080; `src/data/caseVaultReal.ts`:275,2404.
  - Presenter: `src/components/twfps/hospitalPlanPresets.ts`:90; `src/data/ipFeatureComparison.ts`:175.
- **Plan B $1.2M limit.** "At a preferred provider" -> at an AIA Partner Facility.
  - Hub: `docs/product-mastery-track/week-5/day-23.md`:146; study bank :61,66.
  - Presenter: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:685.
- **Final expense benefit.** Per policy year -> per policy.
  - Hub: `docs/product-mastery-track/week-5/day-23.md`:152.
  - Presenter: `src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:633-637.
- **Premiums.** Plan B from S$18-20 a month -> S$15-16; Plan A shortfall at age 25 and below about S$329 a year (S$29 cash) -> about S$348 (S$48 cash).
  - Hub: `docs/product-mastery-track/week-5/day-21.md`:170; `docs/product-mastery-track/week-5/day-22.md`:203,205; `docs/cheat-sheets/product-mastery/week-05.md`:65,100; `docs/product-mastery-track/week-5/day-23.md`:37,41,169,219,312.
  - Presenter: `src/data/hsgMaxPremiums.ts`:32,137,147.
- **Study bank and exam items.** Presenter source for all of these: `src/data/ipFeatureComparison.ts`:88-209.
  - Renal dialysis and immunosuppressants -> as charged: study bank :366,450,1312.
  - Transplants: study bank :436,1652.
  - Non-listed CTGTP and non-CDL cancer drugs: study bank :422,464; exam questions :101-109.
  - Co-payment example, $4,825 vs $9,650: study bank :1298; exam questions :358.
  - Plan A vs Plan B premium gap: study bank :888; exam questions :279-282.
  - Competitor limits, with one answer key changed 3 -> 1: study bank :776,790,944,1014; exam questions :235-243.

### AIA Pro Achiever 3.0

Study bank: `src/data/proAchieverStudyBank.ts`. Exam questions: `src/data/proAchieverExamQuestions.ts`.

- **Premium Pass.** "After 10 years you can stop paying for good" -> up to 12 months per pass during the IIP (Initial Investment Period); 1 pass per 5 annual premiums (IIP 10 / 15 / 20 = 1 / 2 / 3 passes).
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:350.
  - Presenter: `src/lib/translations/tenYearOtherDetailsTab.ts`:126; `src/components/TenYearPlan/OtherDetailsTab.tsx`:2600-2622.
- **Limited-pay wording.** -> premiums continue after the IIP.
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:110; `docs/product-mastery-track/_drawings-playbook.md`:314,316; `src/data/caseNarratives.ts`:451,628; `src/data/caseVault.ts`:219; `docs/first-60-days/week-9/recap.md`:199.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:85; `src/lib/translations/tenYearOtherDetailsTab.ts`:177.
- **Minimum premium.** S$300 a month -> S$200 a month.
  - Hub: `docs/competitor-products-singapore.md`:97; `src/components/FlashcardStudyInterface.tsx`:27.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:74.
- **Top-up charge.** 0% or 3% -> 5%.
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:323,324,356; `docs/cheat-sheets/product-mastery/week-01.md`:40; `docs/product-mastery-track/_drawings-playbook.md`:446; `src/data/caseNarratives.ts`:256.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:198.
- **Partial withdrawal.** "Once the IIP ends" -> from policy year 3, charged during the IIP. The charge factor runs from 70% (3 premiums paid) to 10% (9 paid) on IIP 10.
  - Hub: exam questions :333,338; study bank :122; `src/components/FlashcardStudyInterface.tsx`:31; `docs/product-mastery-track/week-1/day-01.md`:359; `docs/product-mastery-track/week-1/day-03.md`:175-176; `docs/product-mastery-track/week-1/day-04.md`:393.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:222; `src/lib/translations/tenYearOtherDetailsTab.ts`:198-200; `src/components/TenYearPlan/OtherDetailsTab.tsx`:3078-3085.
- **IIP name.** "Investment Insurance Period" -> Initial Investment Period.
  - Hub: exam questions :338.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:1-2.
- **Premium reduction.** Only after the 4th annual premium, with its charge.
  - Hub: `docs/product-mastery-track/week-1/day-03.md`:185-186.
  - Presenter: `src/lib/translations/tenYearOtherDetailsTab.ts`:188-191; `src/components/TenYearPlan/OtherDetailsTab.tsx`:2967-2973.
- **Charge bases.** The premium holiday charge is on the annualised premium. The supplementary charge is on the regular premium policy value and stops once the 11th annual premium is paid.
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:319,345,443,444; `docs/product-mastery-track/week-1/day-03.md`:38,79,441; `docs/product-mastery-track/week-1/day-04.md`:125; `docs/cheat-sheets/product-mastery/week-01.md`:38; `docs/first-60-days/week-10/day-57.md`:243; `src/kb/products/investment-products/pro-achiever.md`:9.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:152,165; `src/lib/translations/tenYearOtherDetailsTab.ts`:153-178.
- **Welcome bonus.** S$12,000 tier -> 15% / 18% / 20%. Under S$12,000: 5-53% -> 5-38% (IIP 10), 8-48% (IIP 15), 10-60% (IIP 20).
  - Hub: `docs/product-mastery-track/week-1/day-02.md`:680,683; `docs/cheat-sheets/core-training/concept-drawings.md`:100,134; `docs/first-60-days/week-10/day-57.md`:269-271; `docs/product-mastery-track/week-1/day-04.md`:192-196; `docs/_competitor-pricing-reference.md`:67-71.
  - Presenter: `src/components/TenYearPlan/OtherDetailsTab.tsx`:2250-2411; `src/data/proAchieverFeatureComparison.ts`:115.
- **Special bonus 8% start.** From year 20 -> year 21.
  - Hub: `docs/cheat-sheets/core-training/concept-drawings.md`:100,135; `docs/cheat-sheets/core-training/financial-presenter-walkthrough.md`:42,160; `docs/first-60-days/week-10/day-57.md`:274; `src/data/caseNarratives.ts`:114.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:128.
- **Policy term.** "Matures at 100" -> whole life.
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:158,260,388,392; `docs/product-mastery-track/week-1/day-03.md`:226; `docs/cheat-sheets/product-mastery/week-01.md`:19,30.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:96.
- **Other facts.** The secondary insured is a spouse or a child under 16. Guided Portfolios are still offered. A benefit charge applies. Accidental death cover is built in. There are 6 riders.
  - Hub: `docs/product-mastery-track/week-1/day-01.md`:177,253,295,316; `docs/product-mastery-track/week-1/day-02.md`:888; `docs/product-mastery-track/week-1/day-03.md`:193,355,380.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:176,268,294,316; `src/lib/translations/tenYearOtherDetailsTab.ts`:166-244.
- **Dividends.** Paid out from year 10 -> reinvested during the IIP, cash option after it.
  - Hub: `docs/product-mastery-track/week-1/day-02.md`:590,592; study bank :206-220,770,1290,1296; exam questions :109.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:255.
- **Odds and ends.**
  - The flashcard's surrender period: `src/components/FlashcardStudyInterface.tsx`:30.
  - The onboarding tour's "guaranteed returns" line: `src/components/onboarding/AnimatedOnboardingTour.tsx`:835.
  - Great Eastern's charge, 0.6% -> 0.7%: study bank :472.
  - Presenter: `src/data/proAchieverFeatureComparison.ts`:167,187,281.

### AIA Solitaire PA (II)

Study bank: `src/data/solitairePaStudyBank.ts`. Exam questions: `src/data/solitairePaExamQuestions.ts`.

- **Renewal bonus.** "For each claim-free year" -> +5% per renewal up to 30%, reset only by an Accidental Dismemberment and Burns claim.
  - Hub: study bank :206,214; exam questions :10,18.
  - Presenter: `src/data/paFeatureComparison.ts`:103,105.
- **Plan 2 premium.** $365 a year -> S$371.82.
  - Hub: study bank :312,848; exam questions :425.
  - Presenter: `src/data/paFeatureComparison.ts`:295.
- **Plan 4 vs Plan 2.** "3.8 times the price" -> about 2.3 times.
  - Hub: study bank :1508,1514; exam questions :429,433.
  - Presenter: `src/data/paFeatureComparison.ts`:62,295.
- **Plan 1 medical limit.** $5,000 -> $2,000 per accident; cases now use each plan's own limit.
  - Hub: study bank :1393,1580; exam questions :62,70,321,325,454,459; `docs/product-mastery-track/week-4/day-20.md`:293; `src/data/caseNarratives.ts`:1096.
  - Presenter: `src/data/paFeatureComparison.ts`:115.
- **Entry age 16 to 70.** Applicants aged 72 and 75 -> 68.
  - Hub: study bank :1674,1677; exam questions :438,440.
  - Presenter: `src/data/paFeatureComparison.ts`:279.
- **Case figures.** Premiums, TPD, medical limits and hospital cash in the parents, S2 and S3 cases.
  - Hub: `docs/product-mastery-track/week-5/day-25.md`:346-348; `docs/product-mastery-track/week-6/day-30.md`:275-386; `src/data/caseVault.ts`:655,669; `src/data/caseNarratives.ts`:1670-1845; `docs/first-60-days/week-10/day-56.md`:264,265.
  - Presenter: `src/data/paFeatureComparison.ts`:62-150,295; `src/data/accidentPlanRates.ts`:36,50.
- **Name.** "Solitaire PA Secure" -> "Solitaire PA (II)".
  - Hub: `public/slides/day-53-insurance-cst-practice.html`:375.
  - Presenter: `src/data/paFeatureComparison.ts`:24.

### AIA Ultimate Critical Cover (UCC)

Study bank: `src/data/ultimateCriticalCoverStudyBank.ts`. Exam questions: `src/data/ultimateCriticalCoverExamQuestions.ts`.

- **Death benefit.** "No death benefit" -> 5% of cover, 100% for accidental death. The video quote was kept, with a note added after it.
  - Hub: `docs/product-mastery-track/week-4/day-16.md`:39; `docs/first-60-days/week-10/day-56.md`:187.
  - Presenter: `src/data/uccFeatureComparison.ts`:190,202.
- **Claims.** "Up to 5 claims, $500K" -> unlimited major-stage claims, early and intermediate up to 500%. Catastrophic CI "200%" -> +100% once.
  - Hub: `docs/first-60-days/week-10/day-56.md`:196,204,221,622,626; `docs/first-60-days/week-10/day-58.md`:174.
  - Presenter: `src/data/uccFeatureComparison.ts`:107,144,155.
- **UCC Enhancer relapse cover.** 6 illnesses -> 5.
  - Hub: `docs/product-mastery-track/week-4/day-20.md`:387; `src/data/caseNarratives.ts`:1222.
  - Presenter: `src/data/uccFeatureComparison.ts`:177.
- **Cover term.** "Whole life" -> to age 65, 75 or 85.
  - Hub: `docs/product-mastery-track/_drawings-playbook.md`:389,391.
  - Presenter: `src/data/uccFeatureComparison.ts`:248.
- **Premiums, from the Presenter's premium tables.** For example, a 25-year-old female non-smoker with S$200K cover pays 1,908 a year, not 2,328. The ECPWP best case is 93,492, not 114,072.
  - Hub: `docs/product-mastery-track/week-4/day-16.md`:91,315-321; `docs/product-mastery-track/week-4/day-17.md`:134-289; `docs/product-mastery-track/week-4/day-18.md`:100-108,257,261; `docs/product-mastery-track/week-4/day-20.md`:116-149,498,503; `docs/cheat-sheets/product-mastery/week-04.md`:43,78,92; study bank :80-88,486-550,1436,1534-1567,1748-1756; exam questions :127-135,425.
  - Presenter: `src/data/uccPremiums.ts`:36-177.
- **Time-value pitch.** $160 -> $90 a month; $388k -> $217k; $1.5M -> $840k. Only the premium is a Presenter figure; the projections were scaled from the hub's own numbers to match it.
  - Hub: study bank :778-834,1053,1058,1352,1492,1494; exam questions :209-217.
  - Presenter: `src/data/uccPremiums.ts`:167.
- **Competitors.** Prudential is now PRUActive Protect II with its Protect Plus rider. Great Eastern covers to age 65 or 85 and pays multiple claims only with its rider. Singlife's plan is Multipay CI II. Condition counts were updated.
  - Hub: `docs/product-mastery-track/week-4/day-16.md`; `docs/product-mastery-track/week-4/day-19.md`; `docs/_competitor-pricing-reference.md`:109-138; `docs/cheat-sheets/product-mastery/week-04.md`:68; study bank :346-438,606-620,866-890,1157-1160,1337-1342,1481,1486; exam questions :31-44,239,243,278,282,360-390,468,472.
  - Presenter: `src/data/uccFeatureComparison.ts`:36-66,145-178,250-252.

### AIA Guaranteed Protect Plus (IV) (GPP)

Study bank: `src/data/guaranteedProtectPlusStudyBank.ts`. Exam questions: `src/data/guaranteedProtectPlusExamQuestions.ts`.

- **Special conditions end age.** 21 -> 85.
  - Hub: `docs/product-mastery-track/week-3/day-13.md`:62,189.
  - Presenter: `src/data/gppFeatureComparison.ts`:183.
- **Retrenchment option.** "Premium Pause" -> Premium Pass Option.
  - Hub: `docs/product-mastery-track/week-3/day-13.md`:290,302; `docs/product-mastery-track/week-3/day-14.md`:67,417; `docs/product-mastery-track/week-3/day-15.md`:44-516; study bank :248-262,1112-1812; exam questions :46-589; `src/features/global-search/headingIndex.ts`:2833,2837.
  - Presenter: `src/data/gppFeatureComparison.ts`:253.
- **PowerUp Dollar on Vitality Platinum.** Grows up to 37.5% of basic cover.
  - Hub: `docs/product-mastery-track/week-3/day-13.md`:349; `docs/product-mastery-track/week-3/day-15.md`:233.
  - Presenter: `src/data/gppFeatureComparison.ts`:137.
- **Yield.** "Guaranteed" -> illustrated, bonuses not guaranteed.
  - Hub: `docs/product-mastery-track/week-3/day-14.md`:141; `docs/cheat-sheets/product-mastery/week-03.md`:72; `docs/cheat-sheets/core-training/finternship-online.md`:65.
  - Presenter: `src/data/gppFeatureComparison.ts`:229.
- **Rider names.** Early Critical Protector Payor (II). Critical Protector Life (IV) covers 73 major-stage CIs, not 42.
  - Hub: `docs/product-mastery-track/week-3/day-14.md`:282,303; `docs/first-60-days/week-10/day-56.md`:145,146; `src/features/global-search/headingIndex.ts`:2822.
  - Presenter: `src/data/gppFeatureComparison.ts`:161,172,205,264.
- **Maximum entry age.** 20-year term 55 -> 63; 15-year term 60 -> 65. These are the oldest ages seen in captured SQS quotes, and the Presenter file says they may be too tight.
  - Hub: study bank :452-480,1351,1356,1496; exam questions :73,78,413.
  - Presenter: `src/lib/gppIVEligibility.ts`:11-12,50.
- **"Term plan".** -> whole life, cash value, 2X / 3X / 5X multiplier; TPD to age 70.
  - Hub: `docs/product-mastery-track/_drawings-playbook.md`:383-395; `tools/seed-concept-cards.ts`:299; `docs/product-mastery-track/week-4/day-20.md`:373; `src/data/caseNarratives.ts`:1200; `src/features/product-mastery-track/content.ts`:30; `docs/first-60-days/week-9/recap.md`:196.
  - Presenter: `src/data/gppFeatureComparison.ts`:67-113,229.

### AIA Pro Lifetime Protector (II) (PLP)

Study bank: `src/data/proLifetimeProtectorStudyBank.ts`. Exam questions: `src/data/proLifetimeProtectorExamQuestions.ts`.

- **Years 1 to 4.** "Allocation rate 80/55/50/8%, then 0%" -> premium charge 80/55/50/8%, 100% invested from year 5 (102% from year 10).
  - Hub: study bank :94-144,1266,1272; exam questions :22,30.
  - Presenter: `src/lib/plpSimulator.ts`:5,245-256,339; `src/data/plpFeatureComparison.ts`:215.
- **Multi-claim rider.** "Multi-Pay CI rider, 3 claims" -> Lifetime Critical Cover (LCC), up to 300% of cover, to age 100.
  - Hub: study bank :52-88,447,452; exam questions :49,54.
  - Presenter: `src/data/plpFeatureComparison.ts`:100,110,112,144.
- **Partial withdrawals.** Any time after year 2, no charges.
  - Hub: study bank :1210,1216.
  - Presenter: `src/data/plpFeatureComparison.ts`:183.
- **Life events.** Cover can be raised at 5 life events.
  - Hub: `docs/product-mastery-track/week-2/day-08.md`:182.
  - Presenter: `src/data/plpFeatureComparison.ts`:151.
- **Booster.** "Booster options for early years" -> no early-years booster.
  - Hub: `src/kb/products/investment-products/pro-lifetime-protector.md`:8.
  - Presenter: `src/data/plpFeatureComparison.ts`:215,225.
- **Name.** "Premier Life Protector" -> Pro Lifetime Protector.
  - Hub: `docs/cheat-sheets/core-training/finternship-online.md`:64.
  - Presenter: `src/data/plpFeatureComparison.ts`:41.
- **TPD.** -> covered to age 70.
  - Hub: `docs/competitor-products-singapore.md`:47; `docs/next-60-days/week-8/day-45.md`:107.
  - Presenter: `src/data/plpFeatureComparison.ts`:86.

## 2. Figures replaced with "check the current AIA product summary"

These are places where the Presenter disagrees with itself. The first commits replaced each figure with a line telling the adviser to check the current AIA product summary. Leo then ruled on three of the six groups, and those figures are back in the hub; the other three still carry the check line.

### Ruled by Leo and restored

- **Pro Achiever special bonus: 5% of the annualised regular premium upon receipt of each regular premium from the 10th annual premium onwards, increasing to 8% from the 21st annual premium.** This is the Product Summary p.2 section 3.4 wording, matching the Presenter's comparison data (`src/data/proAchieverFeatureComparison.ts`:128).
  - Leo first ruled "from policy year 11", following the Presenter's calculator (`src/hooks/useTenYearPlanCalculation.ts`:564-566, which pays from year 11). Commit cd5c5331 taught that.
  - He re-ruled after reading the Product Summary quote. The later commit changes the same 61 places to the 10th annual premium, or "from policy year 10" / "Y10" where a lesson counts in years.
  - Files: `docs/product-mastery-track/week-1/day-01.md` to `day-05.md`, `docs/cheat-sheets/product-mastery/week-01.md`, `docs/cheat-sheets/core-training/concept-drawings.md`, `docs/cheat-sheets/core-training/financial-presenter-walkthrough.md`, `docs/first-60-days/week-10/day-57.md`, `docs/product-mastery-track/_drawings-playbook.md`, `src/data/caseNarratives.ts`, `src/data/proAchieverStudyBank.ts` and `src/data/proAchieverExamQuestions.ts`.
  - Quizzes test the start again: `src/data/proAchieverStudyBank.ts`:86 ("from year 10 onwards"), `src/data/proAchieverExamQuestions.ts`:53 ("When does the 5% special bonus kick in", correct option "from receipt of the 10th annual premium").
  - The day-03 heading is "Q3: How does the Special Bonus pay out from Year 10 onwards?"; `src/features/global-search/headingIndex.ts` was regenerated.
  - Two sentences that tied the bonus to year 11 now say year 10:
    - `docs/product-mastery-track/week-1/day-04.md`:395 reads "From the 10th year the Special Bonus kicks in". The supplementary charge's end at year 11 is unchanged.
    - `src/data/caseNarratives.ts`:330 reads "the Special Bonus, which started at Year 10".
  - The verbatim quote at `docs/product-mastery-track/week-1/day-01.md`:239 and the image alt text at `docs/product-mastery-track/week-1/day-02.md`:60,670 already say year 10 and are unchanged.
  - The Presenter's calculator still pays from year 11 and needs the matching fix.
- **HSG Max A annual limit is tiered: S$1,000,000 a policy year, up to S$1,350,000 at an Extended Partner Facility, up to S$2,000,000 at an AIA Partner Facility.** Commit f8a90153.
  - Restored at:
    - `docs/product-mastery-track/week-5/day-21.md`:81,102,154,164,241,269
    - `docs/product-mastery-track/week-5/day-22.md`:127,142
    - `docs/product-mastery-track/week-5/day-23.md`:146-147,162
    - `docs/product-mastery-track/week-5/day-25.md`:135,305,313
    - `docs/cheat-sheets/product-mastery/week-05.md`:33,61,93
    - `docs/cheat-sheets/index.md`:71
    - `docs/competitor-products-singapore.md`:74
    - `src/data/caseNarratives.ts`:1606,1628
    - `src/data/healthshieldGoldMaxStudyBank.ts`:24,784,826,896,952,1036,1232,1236
    - `src/data/healthshieldGoldMaxExamQuestions.ts`:18,204,282
  - Quizzes test the tiers: the "highest limit" items (`docs/product-mastery-track/week-5/day-21.md`:235-241, `src/data/healthshieldGoldMaxStudyBank.ts`:16-24, `src/data/healthshieldGoldMaxExamQuestions.ts`:10-18) keep S$2M as the answer and now explain the S$1M / S$1.35M / S$2M tiers.
  - Also qualified where a flat "$2M/year" stood for Max A: `docs/first-60-days/week-2/recap.md`:47, `docs/first-60-days/week-3/recap.md`:70, `docs/first-60-days/week-3/day-14.md`:89.
- **MediShield Life pro-ration at a private hospital, Singapore Citizens: 16% of ward charges, 10% of surgical charges.** Commit f8a90153.
  - Restored at `docs/product-mastery-track/week-5/day-23.md`:119 and `docs/product-mastery-track/week-5/day-24.md`:244. No other hub file states this figure.

### Still "check the current AIA product summary" (not ruled)

- **Pro Achiever surrender charge rates.** `src/data/proAchieverFeatureComparison.ts`:187 vs `src/components/TenYearPlan/OtherDetailsTab.tsx`:3193-3202.
  - Replaced at `docs/product-mastery-track/week-1/day-01.md`:334, `docs/product-mastery-track/week-1/day-03.md`:168, `docs/cheat-sheets/product-mastery/week-01.md`:39, `docs/product-mastery-track/week-1/day-04.md`:203 and `docs/_competitor-pricing-reference.md`:78.
  - The day-03 quiz (:451-457) now tests "0% from year 11", which both agree on.
- **Max B Lite pro-ration at a private hospital.** 50% (`src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx`:744) vs "HSG B plans 70%" (`src/lib/translations/hsgMaxTranslations.ts`:123,244).
  - Replaced at `docs/product-mastery-track/week-5/day-23.md`:125.
  - `src/data/healthshieldGoldMaxStudyBank.ts`:198-206 now asks about Plan B, where both say 70%.
- **When Solitaire PA optional benefits end.** "At 75" (`src/data/paFeatureComparison.ts`:284) vs rider rates priced for ages 66-79 (`src/data/accidentPlanRates.ts`:107-147).
  - Replaced at `docs/product-mastery-track/week-6/day-28.md`:20,130,167,235,321,325; `docs/product-mastery-track/week-6/day-30.md`:38,59; `docs/cheat-sheets/product-mastery/week-06.md`:42; `src/data/solitairePaStudyBank.ts`:1793,1798.

### Other Presenter inconsistencies found but not used to change the hub

- **Pro Achiever:**
  - The supplementary charge is 3.6% in one file header (`src/data/longTermInvestmentPreciseIllustration.ts`:6) and 3.9% everywhere else; the hub keeps 3.9%.
  - The top-up charge is 3% in one preset (`src/lib/universalInvestmentTypes.ts`:176) and 5% elsewhere; the hub keeps 5%.
  - The calculator takes a 1% fee from year 15 (`src/hooks/useTenYearPlanCalculation.ts`:467-474), while the comparison says there is no charge after the 11th premium.
- **HSG:** Pro A shows a $3,000 cap in one string that is never displayed (`src/lib/translations/hsgMaxTranslations.ts`:248).
- **Solitaire PA plan names.** Plan 1-4 in the comparison vs Essential / Standard / Enhanced / Premier in `src/pages/AccidentPlanIllustrator.tsx`:142-155. The hub keeps Plan 1-4.
- **PWV:**
  - The comparison says the minimum premium and charge rates are "not published" (`src/data/pwvFeatureComparison.ts`:11,83,165). The calculator uses S$18,000 and 3.6% from the product summary; the hub follows the calculator.
  - `src/lib/fiveYearCompanyPresets.ts`:33 still labels the preset "2.0".
- **PLP:** "No bonuses" (`src/data/plpFeatureComparison.ts`:225) vs "2% special bonus" (`src/lib/plpSimulator.ts`:7). The hub keeps 2%.

### Inventory items that turned out not to be conflicts

The HSG cancer totals of 21x and 15x match the Presenter. Only the rider names and labels were changed.

### Left alone because the Presenter says nothing about them

- **PWV:** secondary insured maximum age 75; "CPF not accepted".
- **Pro Achiever:** minimum partial withdrawal ($500 vs $1,000).
- **HSG:**
  - 85% pro-ration off the panel.
  - The 30-day general waiting period and the 5-year moratorium.
  - Premium figures that give no age.
- **GPP:** all premium and yield figures, because the Presenter has no matching case.
- **UCC:** the S$5M accidental death cap.

### Also not changed

- **Verbatim sources:** the `docs/first-60-days/_source-supplementary` video transcripts and `docs/next-60-days/_source-articles/_reference`.
- **Real meetings:** dated before Apr 2026 that quote the then-current $3,000 cap.
- **Section and page numbers:** the PWV lessons cite section and page numbers carried over from the 2.0 product summary; they are unchecked against 3.0.
- **`src/data/appointmentFlows.ts`:580-606:** still sends a bank or fixed-deposit lump sum into the PWV single premium. That premium is now SRS-only, so the flow needs a person to rewrite it.
- **Duplicate quiz option:** `src/data/platinumWealthVentureStudyBank.ts` Q17 (:240-246) has two identical options, a defect that predates this work.

## 3. Proposed SQL for products rows (not applied)

The same SQL is in `scripts/product-facts-2026-11-01-products.sql`. Leo's rulings change none of it.

Migration `20260412070148` copied these products into `core-*` rows, and `20260423154824` then unpublished the originals, so each update covers both ids. Each update only fires while the old text is still there, because the live rows may have been edited since the 2025 seed (`supabase/migrations/20250708030731-aa6b093c-2012-4c6a-8018-513e00aee64e.sql`:55-93). Run the select first.

```sql
select id, title, description, highlights, tags from public.products
where id in ('guaranteed-protect-plus','core-guaranteed-protect-plus','ultimate-critical-cover','core-ultimate-critical-cover',
 'solitaire-pa','core-solitaire-pa','platinum-wealth-venture','core-platinum-wealth-venture','pro-achiever','core-pro-achiever',
 'healthshield-gold-max','core-healthshield-gold-max','pro-lifetime-protector','core-pro-lifetime-protector');

-- GPP: "dividends" -> non-guaranteed bonuses (Presenter src/data/gppFeatureComparison.ts:229)
update public.products set
  highlights = array_replace(highlights, 'Participating policy with dividends', 'Participating policy with non-guaranteed bonuses; annual bonuses become guaranteed once declared'),
  tags = array_replace(tags, 'Dividends', 'Bonuses'), updated_at = now()
where id in ('guaranteed-protect-plus','core-guaranteed-protect-plus')
  and ('Participating policy with dividends' = any(highlights) or 'Dividends' = any(tags))
returning id, highlights, tags;

-- UCC: "100+ critical illnesses" -> 150 conditions / 73 major CIs; the waiver is a rider (Presenter src/data/uccFeatureComparison.ts:61,224)
update public.products set
  highlights = array_replace(array_replace(highlights,
    'Coverage for 100+ critical illnesses', 'Covers 150 medical conditions, with 73 critical illnesses at major stage'),
    'Premium waiver benefit', 'Optional premium waiver riders'), updated_at = now()
where id in ('ultimate-critical-cover','core-ultimate-critical-cover')
  and ('Coverage for 100+ critical illnesses' = any(highlights) or 'Premium waiver benefit' = any(highlights))
returning id, highlights;

-- Solitaire PA: weekly income and disability care are optional benefits (Presenter src/data/paFeatureComparison.ts:172,185)
update public.products set
  highlights = array_replace(highlights, 'Disability income benefits', 'Optional weekly income and monthly disability care benefits'), updated_at = now()
where id in ('solitaire-pa','core-solitaire-pa') and 'Disability income benefits' = any(highlights)
returning id, highlights;

-- PWV: the overview names no version or terms (an addition rather than a fix; the chat always includes this row)
update public.products set
  description = 'AIA Platinum Wealth Venture 3.0: a whole-life investment-linked plan with a 5-year premium term from S$18,000 a year, also offered as a 2-year term from S$48,000 a year or a 1-year single premium from S$15,000 paid from SRS',
  updated_at = now()
where id in ('platinum-wealth-venture','core-platinum-wealth-venture')
  and description = 'Premium investment solution for high net worth individuals'
returning id, description;

-- Not a products row, but chat-visible seed (supabase/migrations/20260223090927_ba748ee9-27e3-4ce4-935e-fb1c25cd47ae.sql:143):
-- MediShield Life annual limit $150K -> $200K (Presenter src/components/HealthshieldGoldMax/MedicalPlanComparisonContent.tsx:683)
update public.objection_responses
set content = replace(content, '| Annual claim limit | $150K | $1M+ |', '| Annual claim limit | $200K | $1M+ |')
where content like '%| Annual claim limit | $150K | $1M+ |%' returning id;
```

Seed claims the Presenter says nothing about, so there is no SQL for them; they are Leo's call:
- **Pro Achiever:** "Choice of over 20 investment funds".
- **PWV:** "Dedicated relationship management" and "Access to exclusive investment funds".
- **HSG:** "No claim bonus benefits" and "Cashless treatment at panel hospitals".
- **PLP:** "Flexible premium payment terms".

## 4. What `scripts/sync-curriculum-knowledge.mjs` does

- **Reads:**
  - Only files named `day-N.md` inside `week-N` folders under four tracks: `docs/first-60-days`, `docs/product-mastery-track`, `docs/next-60-days` and `docs/first-14-days`.
  - Every `docs/cheat-sheets/<section>/*.md` except `index.md`.
  - Top-level `docs/first-60-days/_source-supplementary/*.md`, skipping `INDEX-*` files and subfolders.
- **Not read:**
  - `recap.md`, `assignments/` and `docs/product-mastery-track/_drawings-playbook.md`.
  - `docs/competitor-products-singapore.md` and `docs/_competitor-pricing-reference.md`.
  - `src/data` and `src/kb`.
  - The video-course subfolder, and this report.
- **Processing:** strips the frontmatter and everything from a `## Quiz` heading down. Splits at `#` to `###` headings, merges sections under 800 characters and splits any over 2,500.
- **Deletes before inserting:**
  - First `delete from knowledge_chunks where source_type = 'curriculum'`.
  - Then inserts in batches of 60 rows with `source_type 'curriculum'`: content plus metadata, no embeddings.
  - Script, video and document rows are untouched.
  - Each step is a separate call to the Supabase Management API, so despite the header comment it is not one transaction. A failure mid-run leaves the curriculum rows partly empty until it is rerun; a full rerun is the fix.
- **Auth:** the token at `~/.local/state/va-watchdog/token` and the project ref from `VITE_SUPABASE_PROJECT_ID` in `.env`.
- **`--dry-run`:** only counts and prints a sample. It exits before reading the token and makes no network call.
- **Safe order:** run with `--dry-run`, then for real, then compare the per-source counts it prints at the end.

Also stale outside the sync: `tools/seed-concept-cards.ts` skips cards that already exist, so the live "GPP vs UCC comparison" concept card keeps its old text.

## 5. Live database updates Leo approved (prepared, not applied)

Run these after the knowledge re-sync, in this order. Only the quiz dry run has been run; it only reads.

1. **Quiz rows, `scripts/update-question-bank-product-facts.mjs`.**
   - **Why not the repo text:** the live rows were edited directly between 2026-06-30 and 2026-07-03 (options reshuffled, explanations rewritten). A first dry run that matched rows on the repo's pre-correction text matched 0 of 188.
   - **Leo's pick:** carry each fact correction into the row's current wording and keep the June/July edits.
   - **Change file:** `scripts/quiz-live-fixes-2026-11-01.json`. Each row holds:
     - its id, field, live old value, new value, reason and Presenter source;
     - the full live snapshot read on 2026-11-01.
   - **Readable list:** `docs/quiz-live-fixes-2026-11-01.md`.
   - **Scope:** 133 live rows to change, of which 56 are extra rows that carried the same wrong fact.
     - 67 of the corrected repo questions already state the right fact in the live wording.
     - 44 have no live row, mostly on `sort_order` gaps from rows removed in June/July.
     - 5 changes move `correct_answer`; the readable list names them.
   - **Guard:** a row is updated only while its question, options, `correct_answer` and explanation all still equal the snapshot. A row edited since then is skipped and reported. Ids are kept, so learner progress still points at its questions.
   - **How it connects:** through the Supabase Management API SQL endpoint, with the token at `~/.local/state/va-watchdog/token` and a browser User-Agent. It never uses the service-role key.
   - **Run:**
     - `node scripts/update-question-bank-product-facts.mjs --self-test` checks the guard and SQL offline.
     - `node scripts/update-question-bank-product-facts.mjs --dry-run` only reads. On 2026-11-02 it printed: "133 rows in the change file: 133 to update, 0 already updated, 0 edited since the snapshot, 0 missing."
     - Then `node scripts/update-question-bank-product-facts.mjs --apply`.
   - **Progress note:** for the 5 rows whose answer key moves, a learner's earlier answer keeps its old right or wrong mark.
2. **Products and objection rows, `scripts/product-facts-2026-11-01-products.sql`.** This is the section 3 SQL. Run the select first.
