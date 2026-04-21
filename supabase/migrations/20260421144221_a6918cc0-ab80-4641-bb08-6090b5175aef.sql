-- Expand category whitelist
ALTER TABLE public.question_bank_questions
  DROP CONSTRAINT IF EXISTS question_bank_questions_category_check;

ALTER TABLE public.question_bank_questions
  ADD CONSTRAINT question_bank_questions_category_check
  CHECK (category IN (
    'product-facts',
    'sales-angles',
    'objection-handling',
    'roleplay',
    'suitability',
    'compliance',
    'advisory-skills',
    'closing'
  ));

INSERT INTO public.question_bank_questions
  (product_slug, bank_type, category, question, options, correct_answer, explanation, sort_order)
VALUES
-- #99
('pro-achiever','study','suitability',
 'Which client profile is most suitable for Pro Achiever 3.0?',
 '["A client who needs full liquidity within 1 to 2 years","A client with no emergency fund who wants to invest all their savings immediately","A client with stable income, a long-term horizon, and willingness to accept market fluctuations","A client who wants guaranteed capital access at any time"]'::jsonb,
 2,
 'Pro Achiever 3.0 is more suitable for clients with stable cash flow, a long-term investment horizon, and tolerance for market volatility. It is generally not ideal for clients with short-term liquidity needs.',
 98),
-- #100
('pro-achiever','study','suitability',
 'Which client is least suitable for Pro Achiever 3.0?',
 '["A young professional building long-term wealth","A parent planning for a child''s future over 15 to 20 years","A freelancer with irregular income but strong emergency savings","A client who may need most of their invested money within the next 2 years"]'::jsonb,
 3,
 'Clients with near-term liquidity needs may not be suitable for a long-term regular premium ILP.',
 99),
-- #101
('pro-achiever','study','suitability',
 'Before recommending Pro Achiever 3.0, what is the most important financial foundation to confirm?',
 '["The client has already maxed out all bank fixed deposits","The client has sufficient emergency savings and can commit to long-term premiums","The client prefers quarterly dividends","The client has no other insurance policies at all"]'::jsonb,
 1,
 'Long-term investing should not come at the expense of emergency liquidity. The adviser should confirm that the client can sustain premiums comfortably.',
 100),
-- #102
('pro-achiever','study','sales-angles',
 'A client is interested in Pro Achiever 3.0 but says they only have very tight monthly cash flow. What is the best response?',
 '["Encourage them to stretch their budget because starting early matters most","Recommend using all spare cash for the policy to maximize bonuses","Assess affordability first and consider a lower premium or postponing until their cash flow is more stable","Tell them to cancel existing savings plans to free up money"]'::jsonb,
 2,
 'A good adviser prioritizes affordability and sustainability over forcing a sale.',
 101),
-- #103
('pro-achiever','study','objection-handling',
 'A client says: "I can invest, but I don''t want to commit too much each month." What is the best response?',
 '["\"Then this plan is not for you.\"","\"Let''s structure an amount that still fits your long-term goals without straining your monthly budget.\"","\"The higher the premium, the better — you should just commit now.\"","\"You should borrow temporarily to start at a higher amount.\""]'::jsonb,
 1,
 'The right response is to balance commitment with affordability.',
 102),
-- #104
('pro-achiever','study','objection-handling',
 'A client says: "I''m worried I may need this money for emergencies." What is the best response?',
 '["\"Emergencies are rare, so it should be fine.\"","\"That''s why we should first make sure your emergency fund is set aside before committing too much into a long-term plan.\"","\"The welcome bonus will offset any emergency need.\"","\"You can always ignore emergencies and stay invested.\""]'::jsonb,
 1,
 'A responsible adviser separates emergency liquidity from long-term investing.',
 103),
-- #105
('pro-achiever','study','roleplay',
 'A client asks: "Should I put all my savings into Pro Achiever?" What is the best response?',
 '["\"Yes, that is the fastest way to maximize long-term growth.\"","\"Yes, because long-term plans always outperform cash savings.\"","\"No, this should usually form part of your overall plan, while short-term and emergency needs remain liquid.\"","\"Only if you also add the maximum ATR.\""]'::jsonb,
 2,
 'The adviser should position APA as one component of a broader financial plan, not as a place for all available savings.',
 104),
-- #106
('pro-achiever','study','roleplay',
 'A client asks: "Can this plan lose money?" What is the best response?',
 '["\"No, because the bonuses protect you fully.\"","\"Yes, fund values can fluctuate, especially in the short term, which is why this plan should be positioned for long-term investing.\"","\"No, AIA absorbs all investment risk.\"","\"Only if you choose the wrong rider.\""]'::jsonb,
 1,
 'This answer is honest and frames expectations correctly.',
 105),
-- #107
('pro-achiever','study','roleplay',
 'What is the best way to explain dollar cost averaging to a cautious client?',
 '["\"It guarantees profit over time.\"","\"It removes all market risk.\"","\"By investing regularly, you buy units at different prices over time, which can reduce the impact of trying to enter the market at one wrong point.\"","\"It means AIA will rebalance your portfolio monthly.\""]'::jsonb,
 2,
 'Dollar cost averaging helps manage entry timing risk, but it does not guarantee gains.',
 106),
-- #108
('pro-achiever','study','sales-angles',
 'How should Pro Achiever 3.0 be positioned versus a pure endowment plan?',
 '["As a guaranteed savings product with fixed maturity payout","As a market-linked long-term plan with investment upside, rather than a guaranteed maturity product","As a short-term parking tool for excess cash","As a medical insurance substitute"]'::jsonb,
 1,
 'This sharpens product differentiation.',
 107),
-- #109
('pro-achiever','study','sales-angles',
 'A client compares Pro Achiever 3.0 with self-investing into ETFs. What is the best balanced response?',
 '["ETFs are always inferior to ILPs","Self-investing and Pro Achiever can both be valid; the difference is that Pro Achiever adds structure, policy benefits, and a death benefit component","Self-investing is illegal for most people","Pro Achiever guarantees better fund performance than ETFs"]'::jsonb,
 1,
 'This trains advisors to acknowledge valid alternatives rather than sounding defensive.',
 108),
-- #110
('pro-achiever','study','sales-angles',
 'A client compares Pro Achiever 3.0 with a whole life plan. What is the best distinction?',
 '["Both are mainly the same product with different names","Pro Achiever 3.0 is more investment-linked, while whole life plans are typically protection-focused with participating or guaranteed structures depending on plan design","Whole life plans are only for retirees","Pro Achiever 3.0 has no insurance element at all"]'::jsonb,
 1,
 'This trains category-level product understanding.',
 109),
-- #111
('pro-achiever','study','roleplay',
 'A client already has Pro Achiever 2.0 and asks whether they should switch to 3.0. What is the best approach?',
 '["Always recommend switching because newer is better","Compare the additional features of 3.0 against the costs and implications of replacing the existing plan before making any recommendation","Tell them to surrender immediately and restart","Say switching is mandatory to remain eligible for bonuses"]'::jsonb,
 1,
 'Advisers should assess replacement carefully, not assume upgrade equals suitability.',
 110),
-- #112
('pro-achiever','study','compliance',
 'Which statement is most appropriate when discussing a possible switch from an existing policy into Pro Achiever 3.0?',
 '["\"There is no downside to replacing your old plan.\"","\"We should compare benefits, charges, surrender implications, and your current goals before deciding whether switching makes sense.\"","\"Newer products are always superior.\"","\"Switching mainly helps you maximize adviser support.\""]'::jsonb,
 1,
 'A proper switch discussion requires comparing benefits, costs, surrender implications, and the client''s goals.',
 111),
-- #113
('pro-achiever','study','advisory-skills',
 'Before presenting Pro Achiever 3.0, what is the most useful discovery question?',
 '["\"How much can you commit monthly without affecting your emergency savings or short-term goals?\"","\"Do you want the biggest welcome bonus possible?\"","\"Do you prefer term riders or waiver riders?\"","\"Would you like to start with 20 years automatically?\""]'::jsonb,
 0,
 'This trains advisers to diagnose before presenting.',
 112),
-- #114
('pro-achiever','study','advisory-skills',
 'Which question best helps assess whether APA should be positioned as wealth accumulation rather than protection?',
 '["\"How much total insurance do you already have, and what are you hoping this plan will mainly do for you?\"","\"Do you like quarterly dividends?\"","\"Would you prefer to start with the highest bonus band?\"","\"Should I show you the illustration first?\""]'::jsonb,
 0,
 'Understanding existing coverage and the client''s primary goal helps frame APA correctly as accumulation versus protection.',
 113),
-- #115
('pro-achiever','study','closing',
 'A prospect says: "I understand the plan, but I''m not ready to commit today." What is the best next step?',
 '["Push urgency by warning them they may regret waiting","Close the conversation and never follow up","Clarify what they still need to feel comfortable deciding, then agree on a specific follow-up step","Offer to skip suitability discussion and just submit first"]'::jsonb,
 2,
 'A good close respects the client''s pace, surfaces remaining concerns, and sets a concrete next step.',
 114),
-- #116
('pro-achiever','study','closing',
 'A client says: "I like the idea, but I want to review my cash flow first." What is the best response?',
 '["\"No problem — let''s review your budget properly and decide on a comfortable amount, if any.\"","\"You should lock in first and think later.\"","\"Cash flow does not matter for long-term investing.\"","\"Then you probably are not serious.\""]'::jsonb,
 0,
 'Reviewing cash flow with the client respects their decision process and supports a sustainable commitment.',
 115);