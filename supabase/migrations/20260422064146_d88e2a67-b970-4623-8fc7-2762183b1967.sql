
INSERT INTO public.question_bank_questions
(product_slug, bank_type, category, question, options, correct_answer, explanation, sort_order)
VALUES
-- ============ STUDY BANK (sort_order 120-143) ============
-- Suitability (120-125)
('solitaire-pa','study','suitability','A 42-year-old construction site supervisor with two dependants asks about Solitaire PA. Why is he a strong fit?',
 '["He works in a high-risk occupation with elevated accident exposure and dependants relying on his income","He already has a hospitalisation plan, so PA is redundant","PA covers illness, which is his main concern","He earns too much to qualify for other plans"]'::jsonb,
 0,
 'PA is occupation-rated. High-risk occupations face higher accident frequency, and dependants amplify the financial impact of TPD or accidental death.',120),

('solitaire-pa','study','suitability','Which client profile is LEAST suitable for Solitaire PA as a standalone solution?',
 '["A frequent business traveller","An active marathon runner","A 70-year-old retiree wanting comprehensive medical reimbursement for chronic illness","A young parent with school-age children"]'::jsonb,
 2,
 'PA only covers accidents, not illness. A retiree needing chronic illness coverage requires IP/CI, not PA alone.',121),

('solitaire-pa','study','suitability','A client says: "I already have a CI plan, why do I need PA?" Best suitability response?',
 '["CI replaces PA entirely","PA covers accidents and accidental death/TPD with daily-life benefits CI does not address — they complement each other","PA pays out faster than CI always","Drop the CI to fund PA"]'::jsonb,
 1,
 'CI covers defined illnesses; PA covers accident-related events including fractures, burns, mobility aids, and accidental medical reimbursement. They serve different risk pools.',122),

('solitaire-pa','study','suitability','A self-employed delivery rider with no MediShield top-up asks for PA. What should you prioritise first?',
 '["Sell PA immediately — it is what he asked for","Conduct a needs analysis and recommend hospitalisation cover before or alongside PA","Refuse to advise","Sell only the cheapest rider"]'::jsonb,
 1,
 'Suitability requires addressing the larger gap (hospitalisation) first or together. Selling only what the client asks without analysis breaches fact-finding obligations.',123),

('solitaire-pa','study','suitability','A dual-income family with two young children is reviewing PA for the household. Best structuring approach?',
 '["Cover only the higher earner","Family bundle with both adults and children covered, sized to income replacement and caregiving needs","Cover only the children","Buy one plan and rotate it"]'::jsonb,
 1,
 'Family bundles address both earner risk and caregiving disruption if a child is injured. Sizing should reflect each member''s economic and caregiving role.',124),

('solitaire-pa','study','suitability','A client''s occupation changes from office worker to offshore engineer mid-policy. What is the suitability implication?',
 '["No action needed","Reassess sum assured, premium class, and add appropriate riders — disclose occupation change to insurer","Cancel the policy","Switch to CI instead"]'::jsonb,
 1,
 'Occupation change affects risk class and premium. Non-disclosure can void claims. Advisor must trigger a review.',125),

-- Compliance (126-131)
('solitaire-pa','study','compliance','Under FAA, what must you document before recommending Solitaire PA?',
 '["Just the client signature","A documented needs analysis (fact-find), basis of recommendation, and disclosures","Only the premium amount","Verbal agreement is enough"]'::jsonb,
 1,
 'FAA Section 27 and MAS Notice FAA-N16 require documented fact-find, suitability rationale, and product disclosures.',126),

('solitaire-pa','study','compliance','A client refuses to disclose a previous PA claim. What is the correct compliance action?',
 '["Submit anyway and hope for the best","Explain duty of disclosure under the Insurance Act and that non-disclosure may void claims; do not proceed without proper declaration","Reduce the sum assured to avoid issues","Sell as a new policy"]'::jsonb,
 1,
 'Duty of disclosure is statutory. Advisor must educate the client; proceeding with known non-disclosure is a serious breach.',127),

('solitaire-pa','study','compliance','Which marketing statement about Solitaire PA would breach MAS guidelines?',
 '["This plan covers accidents as defined in the policy","Premiums are based on occupation class","This is the best PA plan in Singapore — guaranteed payout for any injury","Riders can be added subject to underwriting"]'::jsonb,
 2,
 'Absolute, comparative, or guarantee statements without basis breach MAS Notice FAA-N03 (advertising). PA payouts depend on policy definitions.',128),

('solitaire-pa','study','compliance','When recommending PA to a vulnerable client (elderly, low literacy), what additional compliance step applies?',
 '["None — same process","Selected Client requirements: enhanced explanation, trusted individual involvement where possible, and documented understanding","Skip the fact-find to save time","Use only verbal disclosure"]'::jsonb,
 1,
 'MAS''s Selected Client framework (under FAA-N16) requires enhanced safeguards for vulnerable clients including elderly and those with limited financial literacy.',129),

('solitaire-pa','study','compliance','A client wants to replace an existing PA policy with Solitaire PA. What compliance step is mandatory?',
 '["No paperwork needed","Complete a Switching/Replacement Form and disclose pros and cons including loss of in-force benefits or new exclusions","Cancel old plan first","Sell silently"]'::jsonb,
 1,
 'Replacement of life/health-related policies requires disclosure under MAS rules to prevent churning and protect client interests.',130),

('solitaire-pa','study','compliance','You discover a colleague misrepresented PA exclusions to close a sale. What should you do?',
 '["Stay silent — not your business","Report internally per the firm''s whistleblowing/compliance policy","Confront the client directly","Take the client for yourself"]'::jsonb,
 1,
 'Advisors have a duty to escalate suspected misconduct. Internal compliance channels exist precisely for this.',131),

-- Advisory Skills (132-137)
('solitaire-pa','study','advisory-skills','A client says "I don''t do dangerous activities, I don''t need PA." Best advisory response?',
 '["Agree and move on","Explore daily-life accident statistics (slips, traffic, kitchen) and quantify financial impact of a 3-month income loss","Push harder on fear","Discount the premium"]'::jsonb,
 1,
 'Advanced advisory reframes perception with data and personalisation rather than pressure or capitulation.',132),

('solitaire-pa','study','advisory-skills','During fact-finding, the client''s spouse keeps interrupting. Best skill to apply?',
 '["Ignore the spouse","Acknowledge the spouse, invite their input, and use joint discovery to surface shared priorities","Ask the spouse to leave","Rush the meeting"]'::jsonb,
 1,
 'Joint stakeholders influence the decision. Inclusive facilitation builds trust and surfaces real concerns.',133),

('solitaire-pa','study','advisory-skills','A client gives a vague answer: "I just want some protection." What is the next-best advisory move?',
 '["Recommend the most expensive plan","Use clarifying questions: against what risk, for whom, and what would ''enough'' look like financially","Pick a default product","End the meeting"]'::jsonb,
 1,
 'Clarifying questions convert vague desires into measurable needs — the foundation of suitability.',134),

('solitaire-pa','study','advisory-skills','You sense the client is not telling you their real objection. Best technique?',
 '["Ignore it","Use a permission-based probe: ''Often clients in your situation also worry about X — is that on your mind?''","Push for the close","Offer a discount"]'::jsonb,
 1,
 'Permission-based probing uncovers hidden objections without pressure and signals empathy.',135),

('solitaire-pa','study','advisory-skills','The client compares Solitaire PA to a cheaper competitor plan. Strongest advisory response?',
 '["Bash the competitor","Walk through coverage scope, claim experience, and definitions side-by-side and let the client decide on value, not price","Match the price","Drop the case"]'::jsonb,
 1,
 'Value-based comparison respects client autonomy and demonstrates technical mastery — both build long-term trust.',136),

('solitaire-pa','study','advisory-skills','Client objection: "PA payouts are small — not worth it." Best reframing?',
 '["Agree","Quantify total benefits across accidental death, TPD, medical reimbursement, and daily benefits over the policy term — show cumulative protection value","Discount premium","Drop PA"]'::jsonb,
 1,
 'Showing cumulative and scenario-based payouts reframes "small" into meaningful financial protection.',137),

-- Closing (138-143)
('solitaire-pa','study','closing','Which closing approach reflects ethical practice?',
 '["Pressure: ''Sign now or lose the rate''","Assumptive close after confirming understanding and suitability","Hide exclusions until after signing","Promise non-existent benefits"]'::jsonb,
 1,
 'Ethical closes are built on confirmed understanding and aligned recommendation, not pressure or omission.',138),

('solitaire-pa','study','closing','Client says: "Let me think about it." Best response?',
 '["Walk away frustrated","Acknowledge, then ask: ''What specifically would you like to think through? — I can address it now or send info''","Push for immediate signature","Give up on the case"]'::jsonb,
 1,
 'Specific clarification surfaces the real hesitation and keeps momentum without pressure.',139),

('solitaire-pa','study','closing','When is a trial close most useful?',
 '["At the very start","After presenting a recommendation, to test alignment before formal close","Never","Only with referrals"]'::jsonb,
 1,
 'Trial closes (e.g., "How does this sound so far?") test buy-in and surface objections early.',140),

('solitaire-pa','study','closing','A client agrees in principle but stalls on payment method. Best move?',
 '["Drop the case","Offer payment options (annual/half-yearly/monthly, GIRO/credit), confirm preference, and proceed","Demand annual payment","Reduce coverage"]'::jsonb,
 1,
 'Removing logistical friction at the close converts intent to action.',141),

('solitaire-pa','study','closing','Post-close, what is the most important advisor action?',
 '["Move to the next prospect immediately","Confirm policy issuance, schedule a delivery meeting, and set a review cadence","Stop contact","Upsell aggressively next week"]'::jsonb,
 1,
 'Onboarding and review cadence drive retention, referrals, and lifetime client value — the real metric of advisor success.',142),

('solitaire-pa','study','closing','Ultimate goal of a closing conversation?',
 '["Hit monthly target","Earn the right to a long-term advisory relationship through a suitable, well-understood recommendation","Maximise commission","Close fastest"]'::jsonb,
 1,
 'Sustainable practice prioritises trust and suitability — commissions follow, not lead.',143),

-- ============ EXAM BANK (sort_order 36-55) ============
-- Suitability (36-40)
('solitaire-pa','exam','suitability','MOST suitable Solitaire PA client?',
 '["Frequent traveller and active parent with dependants","Retiree wanting illness coverage","Client with no income or dependants","Client already over-insured for PA"]'::jsonb,
 0,
 'Active lifestyle plus dependants creates clear accident-risk and financial-impact alignment.',36),

('solitaire-pa','exam','suitability','LEAST suitable for PA as standalone?',
 '["Site engineer","Delivery rider","Client needing chronic illness reimbursement","Active senior"]'::jsonb,
 2,
 'PA does not cover illness; chronic illness needs IP/CI cover.',37),

('solitaire-pa','exam','suitability','Client''s occupation upgrades to higher-risk class. What must you do?',
 '["Nothing","Disclose to insurer and reassess coverage","Cancel policy","Hide the change"]'::jsonb,
 1,
 'Non-disclosure may void claims; reassessment is mandatory.',38),

('solitaire-pa','exam','suitability','Best structure for a dual-income family with kids?',
 '["Cover only breadwinner","Family bundle sized to income and caregiving roles","Cover only kids","Single small policy"]'::jsonb,
 1,
 'Family bundles address both earner and caregiving risk.',39),

('solitaire-pa','exam','suitability','Cost-sensitive client wanting basic accident protection — best move?',
 '["Push the most expensive bundle","Right-size base PA with essential riders within budget","Refuse to advise","Recommend ILP instead"]'::jsonb,
 1,
 'Suitability includes affordability; right-sizing keeps cover sustainable.',40),

-- Compliance (41-45)
('solitaire-pa','exam','compliance','Mandatory documentation before PA recommendation?',
 '["Client signature only","Fact-find, basis of recommendation, and disclosures","Verbal note","None"]'::jsonb,
 1,
 'FAA requires documented suitability process.',41),

('solitaire-pa','exam','compliance','Client conceals previous PA claim. Correct action?',
 '["Submit anyway","Educate on duty of disclosure; do not proceed without proper declaration","Reduce SA","Ignore"]'::jsonb,
 1,
 'Duty of disclosure is statutory under the Insurance Act.',42),

('solitaire-pa','exam','compliance','Which statement breaches MAS advertising rules?',
 '["Premium based on occupation","Coverage per policy definitions","''Guaranteed payout for any injury''","Riders subject to underwriting"]'::jsonb,
 2,
 'Absolute/guarantee claims without basis breach MAS Notice FAA-N03.',43),

('solitaire-pa','exam','compliance','Replacing existing PA with Solitaire PA requires?',
 '["Nothing extra","Switching/Replacement disclosure form","Cancel old plan first","Hide the switch"]'::jsonb,
 1,
 'Mandatory to prevent churning and protect client interests.',44),

('solitaire-pa','exam','compliance','Selected Client (vulnerable) framework requires?',
 '["Same process","Enhanced explanation and safeguards","Skip fact-find","Verbal only"]'::jsonb,
 1,
 'MAS FAA-N16 mandates additional safeguards for vulnerable clients.',45),

-- Advisory Skills (46-50)
('solitaire-pa','exam','advisory-skills','Client: "I don''t do anything dangerous." Best response?',
 '["Agree and stop","Reframe with daily-life accident data and income-loss impact","Pressure-sell","Discount"]'::jsonb,
 1,
 'Data-driven reframing surfaces real exposure without pressure.',46),

('solitaire-pa','exam','advisory-skills','Vague client need ("just some protection") — next move?',
 '["Pick default product","Use clarifying questions to define risk, beneficiary, and ''enough''","Sell most expensive","End meeting"]'::jsonb,
 1,
 'Clarifying questions convert intent to measurable needs.',47),

('solitaire-pa','exam','advisory-skills','Hidden objection suspected. Best technique?',
 '["Ignore","Permission-based probe","Push close","Offer discount"]'::jsonb,
 1,
 'Permission-based probing uncovers concerns ethically.',48),

('solitaire-pa','exam','advisory-skills','Competitor comparison from client. Best response?',
 '["Bash competitor","Side-by-side coverage and value comparison","Match price","Walk away"]'::jsonb,
 1,
 'Value-based comparison respects autonomy and shows mastery.',49),

('solitaire-pa','exam','advisory-skills','Strongest sign of advanced advisory skill?',
 '["Fast talking","Active listening and tailored reframing","Memorised script","Aggressive closing"]'::jsonb,
 1,
 'Listening and tailoring drive trust and suitability.',50),

-- Closing (51-55)
('solitaire-pa','exam','closing','Most ethical closing approach?',
 '["Pressure tactics","Assumptive close after confirmed understanding","Hide exclusions","Overpromise"]'::jsonb,
 1,
 'Ethical closes rest on understanding and suitability.',51),

('solitaire-pa','exam','closing','"Let me think about it" — best response?',
 '["Walk away","Clarify the specific concern and address it now","Push signature","Drop case"]'::jsonb,
 1,
 'Specific clarification surfaces the real hesitation.',52),

('solitaire-pa','exam','closing','Purpose of a trial close?',
 '["End the meeting","Test alignment and surface objections early","Pressure client","Skip suitability"]'::jsonb,
 1,
 'Trial closes confirm buy-in before formal close.',53),

('solitaire-pa','exam','closing','Client stalls on payment method. Best move?',
 '["Drop case","Offer payment options and confirm preference","Demand annual","Reduce cover"]'::jsonb,
 1,
 'Removing friction converts intent to action.',54),

('solitaire-pa','exam','closing','Ultimate closing goal?',
 '["Hit target","Earn long-term advisory relationship via suitable, understood recommendation","Max commission","Close fastest"]'::jsonb,
 1,
 'Sustainable practice prioritises trust — commissions follow.',55);
