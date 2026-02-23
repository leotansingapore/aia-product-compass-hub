
-- Seed objection entries across all categories
DO $$
DECLARE
  -- Generic
  g1 uuid := gen_random_uuid();
  g2 uuid := gen_random_uuid();
  g3 uuid := gen_random_uuid();
  g4 uuid := gen_random_uuid();
  g5 uuid := gen_random_uuid();
  -- Tactical
  t1 uuid := gen_random_uuid();
  t2 uuid := gen_random_uuid();
  t3 uuid := gen_random_uuid();
  t4 uuid := gen_random_uuid();
  -- Product
  p1 uuid := gen_random_uuid();
  p2 uuid := gen_random_uuid();
  p3 uuid := gen_random_uuid();
  p4 uuid := gen_random_uuid();
  p5 uuid := gen_random_uuid();
  -- Pricing
  pr1 uuid := gen_random_uuid();
  pr2 uuid := gen_random_uuid();
  pr3 uuid := gen_random_uuid();
  pr4 uuid := gen_random_uuid();
  -- Trust
  tr1 uuid := gen_random_uuid();
  tr2 uuid := gen_random_uuid();
  tr3 uuid := gen_random_uuid();
  tr4 uuid := gen_random_uuid();
  -- Timing
  tm1 uuid := gen_random_uuid();
  tm2 uuid := gen_random_uuid();
  tm3 uuid := gen_random_uuid();
  tm4 uuid := gen_random_uuid();
BEGIN

-- ============ GENERIC OBJECTIONS ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(g1, 'I already have an agent', 'generic', 'Prospect claims they already have an existing financial advisor or insurance agent.', ARRAY['common','rapport','switching'], 1),
(g2, 'I''m not interested', 'generic', 'A flat rejection with no specific reason given. Often a reflex response.', ARRAY['cold-call','opening','common'], 2),
(g3, 'I need to think about it', 'generic', 'Prospect wants time to consider. Could be genuine or a polite brush-off.', ARRAY['common','stalling','closing'], 3),
(g4, 'I don''t believe in insurance', 'generic', 'Prospect has a fundamental objection to the concept of insurance.', ARRAY['mindset','education','common'], 4),
(g5, 'I''m too young to worry about this', 'generic', 'Young prospects who feel financial planning is not relevant to them yet.', ARRAY['youth','nsf','fresh-grad'], 5);

-- ============ TACTICAL OBJECTIONS ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(t1, 'Just send me an email / brochure', 'tactical', 'Prospect tries to end the conversation by requesting written materials instead.', ARRAY['deflection','cold-call','common'], 1),
(t2, 'Let me check with my spouse first', 'tactical', 'Prospect defers the decision to a partner. May be genuine or a delay tactic.', ARRAY['spouse','deferral','common'], 2),
(t3, 'I just bought a policy recently', 'tactical', 'Prospect feels they''ve already addressed their insurance needs with a recent purchase.', ARRAY['recent-purchase','review','common'], 3),
(t4, 'I''ll call you back when I''m ready', 'tactical', 'A polite way to end the conversation without commitment.', ARRAY['callback','stalling','deflection'], 4);

-- ============ PRODUCT-SPECIFIC OBJECTIONS ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(p1, 'ILPs have high charges', 'product', 'Prospect is concerned about the fee structure of Investment-Linked Policies.', ARRAY['ILP','charges','fees','pro-achiever'], 1),
(p2, 'Endowment returns are too low', 'product', 'Prospect compares endowment returns unfavourably to other investment vehicles.', ARRAY['endowment','returns','smart-wealth-builder'], 2),
(p3, 'Whole life premiums are too expensive', 'product', 'Prospect finds whole life insurance premiums unaffordable compared to term.', ARRAY['whole-life','premium','guaranteed-protect-plus'], 3),
(p4, 'Term insurance has no cash value', 'product', 'Prospect dislikes that term insurance doesn''t build any savings or cash value.', ARRAY['term','cash-value','secure-flexi-term'], 4),
(p5, 'Why do I need a rider when I have MediShield Life?', 'product', 'Prospect questions the need for private medical insurance on top of government coverage.', ARRAY['medical','rider','healthshield','medishield'], 5);

-- ============ PRICING & FEES ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(pr1, 'It''s too expensive', 'pricing', 'The most common pricing objection — prospect feels the premium is beyond their budget.', ARRAY['common','budget','premium'], 1),
(pr2, 'I can''t afford it right now', 'pricing', 'Prospect claims current financial constraints prevent them from committing.', ARRAY['affordability','budget','cashflow'], 2),
(pr3, 'ETFs and robo-advisors are cheaper', 'pricing', 'Prospect compares insurance product fees to low-cost investment alternatives.', ARRAY['ETF','robo','fees','comparison'], 3),
(pr4, 'Why should I pay for something I may never use?', 'pricing', 'Prospect questions the value of paying premiums for a risk that may not materialize.', ARRAY['value','mindset','common'], 4);

-- ============ TRUST & CREDIBILITY ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(tr1, 'Insurance companies just want my money', 'trust', 'Prospect is skeptical about the insurance industry''s motives.', ARRAY['skepticism','industry','common'], 1),
(tr2, 'My friend had a terrible claims experience', 'trust', 'Prospect has heard negative stories about claims being rejected or delayed.', ARRAY['claims','bad-experience','referral'], 2),
(tr3, 'How do I know you won''t disappear after I sign?', 'trust', 'Prospect is concerned about post-sale service and agent retention.', ARRAY['service','retention','agent-trust'], 3),
(tr4, 'I''ve been burned by an agent before', 'trust', 'Prospect had a negative personal experience with a previous financial advisor.', ARRAY['past-experience','trust','rapport'], 4);

-- ============ TIMING & DELAY ============
INSERT INTO objection_entries (id, title, category, description, tags, sort_order) VALUES
(tm1, 'Now is not the right time', 'timing', 'A generic timing objection — prospect feels the timing isn''t ideal.', ARRAY['common','stalling','timing'], 1),
(tm2, 'I''ll do it next year', 'timing', 'Prospect procrastinates by pushing the decision to an unspecified future date.', ARRAY['procrastination','delay','common'], 2),
(tm3, 'The market is too volatile right now', 'timing', 'Prospect is hesitant due to current market conditions.', ARRAY['market','volatility','investment'], 3),
(tm4, 'I want to wait until I earn more', 'timing', 'Prospect believes they need a higher income before starting financial planning.', ARRAY['income','career','young-professional'], 4);

-- ============ RESPONSES ============
-- Using a system user placeholder for seeded responses
-- Generic: g1 - "I already have an agent"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(g1, E'**Acknowledge & Pivot:**\n\n"That''s great that you already have someone looking after your finances! I''m not here to replace them. Many of my clients actually work with multiple advisors — it''s like getting a second opinion from a doctor.\n\nCould I ask — when was the last time your agent did a full review of your portfolio? Sometimes a fresh pair of eyes can spot gaps."\n\n**Key:** Don''t bash the existing agent. Position yourself as complementary, not competitive.', 'System (Best Practice)', 'system-seed'),
(g1, E'**The Review Angle:**\n\n"I totally respect that! Quick question though — does your current agent cover all five areas: protection, savings, investment, medical, and retirement? Most people find they have strong coverage in one or two areas but gaps in others.\n\nI''d be happy to do a complimentary gap analysis — no obligation at all."', 'System (Alternative)', 'system-seed');

-- Generic: g2 - "I'm not interested"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(g2, E'**Pattern Interrupt:**\n\n"I appreciate your honesty! And honestly, most of my best clients said the exact same thing when we first spoke. They weren''t interested in *insurance* per se — they were interested in making sure their family was protected if something unexpected happened.\n\nCan I ask — if something happened to you tomorrow, would your family be financially okay for the next 5 years?"\n\n**Key:** Shift from selling a product to addressing a real concern.', 'System (Best Practice)', 'system-seed'),
(g2, E'**The Curiosity Hook:**\n\n"Totally fair! Most people aren''t interested in insurance — I wasn''t either until I learned how much money I was leaving on the table with tax savings and CPF optimization.\n\nWould you be open to a 10-minute coffee chat? If it''s not relevant, I''ll be the first to tell you."', 'System (Alternative)', 'system-seed');

-- Generic: g3 - "I need to think about it"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(g3, E'**Isolate the Concern:**\n\n"Absolutely, it''s an important decision. Can I ask — is there a specific part you''d like to think through? Is it the coverage amount, the premium, or something else entirely?\n\nI ask because sometimes I can clarify things right now that might save you time."\n\n**Key:** "Think about it" usually means there''s an unresolved concern. Isolate it.', 'System (Best Practice)', 'system-seed'),
(g3, E'**The Deadline Reframe:**\n\n"Of course, take your time. Just so you know, your health is assessed at the point of application — not when you decide later. I''ve had clients who waited and ended up paying 30-40% more because of a new health finding.\n\nHow about I pencil in a follow-up for [specific date]? That gives you time to think, and I can answer any new questions then."', 'System (Alternative)', 'system-seed');

-- Generic: g4 - "I don't believe in insurance"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(g4, E'**Reframe with Math:**\n\n"I get it — insurance can feel abstract. Let me put it in practical terms:\n\nIf you earn $5,000/month, that''s $60,000/year. Over 20 working years, that''s $1.2 million in income. A critical illness policy essentially *protects* that $1.2M asset for a fraction of the cost.\n\nYou insure your car for $30K. Why not insure your ability to earn $1.2M?"\n\n**Key:** Use concrete numbers, not abstract concepts.', 'System (Best Practice)', 'system-seed');

-- Generic: g5 - "I'm too young"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(g5, E'**The Compound Advantage:**\n\n"Actually, being young is your *biggest* advantage! Here''s why:\n\n1. **Premiums are lowest now** — a 25-year-old pays ~40% less than a 35-year-old for the same coverage\n2. **Compound interest** — starting a savings plan at 25 vs 35 can mean 2x the retirement fund\n3. **Health is on your side** — no pre-existing conditions = no exclusions or loading\n\nThe best time to plant a tree was 10 years ago. The second best time is now."\n\n**Tip:** Use age-specific examples. For NSF/fresh grads, relate to their first paycheck excitement.', 'System (Best Practice)', 'system-seed');

-- Tactical: t1 - "Send me an email"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(t1, E'**Agree and Advance:**\n\n"Sure, I''d be happy to send you something! But honestly, a generic brochure won''t be very useful — every person''s situation is different.\n\nHow about this: let me ask you 3 quick questions so I can send you something actually relevant to YOUR situation. Would that be okay?"\n\n**Key:** Don''t refuse the request. Agree, then pivot to engagement.', 'System (Best Practice)', 'system-seed');

-- Tactical: t2 - "Check with spouse"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(t2, E'**Include the Spouse:**\n\n"That makes total sense — financial decisions should definitely be made together. Why don''t we set up a time where both of you can be present? That way your spouse hears everything firsthand and can ask questions too.\n\nWould evenings or weekends work better for both of you?"\n\n**Key:** Turn the objection into an opportunity to meet more decision-makers.', 'System (Best Practice)', 'system-seed');

-- Tactical: t3 - "Just bought a policy"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(t3, E'**The Gap Check:**\n\n"That''s great — it means you already see the value of protection! Do you mind sharing what type of policy you got?\n\nMany people find that their first policy covers one need (usually death/TPD) but leaves gaps in critical illness, hospitalization, or income protection. A quick 15-minute review can confirm if you''re fully covered.\n\nNo selling — just a health check for your portfolio."', 'System (Best Practice)', 'system-seed');

-- Tactical: t4 - "I'll call you back"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(t4, E'**Gentle Persistence:**\n\n"I appreciate that! In my experience though, life gets busy and these things tend to fall off the radar. How about I give you a quick call next [specific day] just to touch base?\n\nIf you''ve decided it''s not for you, just tell me and I''ll respect that completely. Deal?"\n\n**Key:** Set a specific follow-up. Vague "call me" = never.', 'System (Best Practice)', 'system-seed');

-- Product: p1 - "ILP high charges"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(p1, E'**Break Down the Value:**\n\n"You''re right that ILPs have charges — and I appreciate you asking about that. Let me break it down:\n\n| Fee Component | What You Get |\n|---|---|\n| Insurance charge | Death/TPD/CI coverage built in |\n| Fund management | Professional fund managers |\n| Admin fee | Policy admin, switching, rebalancing |\n\nCompare this to DIY investing:\n- You''d pay for term insurance separately (~$50-100/month)\n- ETF platform fees (0.2-0.5%)\n- No behavioral coaching when markets drop\n\nWhen you add it all up, the *net* cost difference is often much smaller than the headline fee suggests.\n\n**The real question is:** Do you value having protection + investment in one solution with someone to guide you?"', 'System (Best Practice)', 'system-seed'),
(p1, E'**Acknowledge and Redirect:**\n\n"That''s a valid concern. Let me be transparent — in the early years, charges are higher because the insurance coverage cost is front-loaded. But after year 5-7, the fund value typically starts to compound meaningfully.\n\nFor clients concerned about charges, I often recommend **Pro Achiever** which has a welcome bonus that effectively offsets the early charges. Would you like me to show you the numbers?"', 'System (Alternative)', 'system-seed');

-- Product: p2 - "Endowment returns too low"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(p2, E'**Reframe the Purpose:**\n\n"You''re comparing apples and oranges. An endowment isn''t meant to beat the stock market — it''s designed for **guaranteed, disciplined savings** with a modest bonus on top.\n\nThink of it this way:\n- 🏦 Bank savings: 0.05% interest, zero discipline\n- 📈 Stocks: 7-10% potential but you might panic-sell during a crash\n- 🎯 Endowment: 2-3% guaranteed + non-guaranteed bonuses, **forced savings**\n\nFor goals like a wedding fund, child''s education, or house down payment, the *certainty* of having the money when you need it is worth more than chasing higher returns.\n\nWhat specific goal are you saving for?"', 'System (Best Practice)', 'system-seed');

-- Product: p3 - "Whole life too expensive"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(p3, E'**Cost vs Value:**\n\n"Whole life does have higher premiums than term — that''s true. But here''s what you get for that difference:\n\n| | Term | Whole Life |\n|---|---|---|\n| Coverage period | 20-30 years | Lifetime |\n| Cash value | ❌ None | ✅ Builds over time |\n| Premiums after term | Renewal at 5-10x cost | Same premium forever |\n| At age 65 | Policy ends | Still covered + cash value |\n\nThe real question is: **What happens at 65 when your term policy expires?** You''ll be uninsurable or paying astronomical premiums.\n\nA blend strategy — whole life for base coverage + term for peak responsibility years — gives you the best of both worlds."', 'System (Best Practice)', 'system-seed');

-- Product: p4 - "Term has no cash value"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(p4, E'**The BTIR Philosophy:**\n\n"You''re right — term insurance is pure protection with no savings component. And that''s actually its **strength**.\n\nThe philosophy is called **Buy Term, Invest the Rest (BTIR)**:\n1. Get maximum coverage at the lowest cost with term\n2. Take the premium savings and invest them separately\n3. Over 20-30 years, your investments grow independently\n\nBut here''s the catch most people miss: **BTIR only works if you actually invest the difference.** In reality, most people spend it.\n\nSo the right choice depends on your discipline. Are you the type who will consistently invest the savings?"', 'System (Best Practice)', 'system-seed');

-- Product: p5 - "Why rider when I have MediShield Life?"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(p5, E'**The Gap Illustration:**\n\n"MediShield Life is excellent basic coverage — but it''s designed for **subsidized ward** stays. Here''s what happens in reality:\n\n| Scenario | MediShield Life | With Rider |\n|---|---|---|\n| Ward class | B2/C only | Private A/B1 |\n| Annual claim limit | $150K | $1M+ |\n| Cancer treatment | Partial coverage | Full coverage incl. targeted therapy |\n| Out-of-pocket | Can be $20-50K+ | Minimal with full rider |\n\nA single cancer treatment can cost $200-500K. MediShield Life covers perhaps $100K of that. The rest comes from your savings.\n\n**HealthShield Gold Max** plugs this gap for roughly $200-400/year (depending on age), largely payable by MediSave. That''s less than $1/day for peace of mind."', 'System (Best Practice)', 'system-seed');

-- Pricing: pr1 - "Too expensive"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(pr1, E'**The Daily Cost Reframe:**\n\n"I understand the concern. Let me put the premium in perspective:\n\n$300/month = $10/day = about 2 cups of coffee ☕☕\n\nFor that, you get:\n- $500K death/TPD coverage\n- $200K critical illness coverage\n- Hospital plan covering private wards\n\nWould you trade 2 coffees a day to know your family is fully protected?\n\n**If budget is genuinely tight**, we can:\n1. Start with essentials (hospitalization + CI) and add more later\n2. Use a shorter payment term to reduce total cost\n3. Optimize your CPF/MediSave to pay part of the premium\n\nWhat''s a comfortable monthly amount for you?"', 'System (Best Practice)', 'system-seed');

-- Pricing: pr2 - "Can't afford it"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(pr2, E'**Empathize and Problem-Solve:**\n\n"I completely understand — cash flow is tight for many people. Let me ask: is it that you can''t afford *any* protection, or that the plan I showed is beyond your current budget?\n\nBecause here''s the thing — doing *nothing* is the most expensive option. If something happens without coverage, the financial impact is devastating.\n\nLet''s work backwards from your budget:\n- **$50/month?** We can get basic term + hospital coverage\n- **$100/month?** Add critical illness protection\n- **$200/month?** Comprehensive coverage with savings\n\nProtection is not all-or-nothing. Even a basic plan is infinitely better than zero coverage."', 'System (Best Practice)', 'system-seed');

-- Pricing: pr3 - "ETFs are cheaper"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(pr3, E'**Fair Comparison:**\n\n"You''re right — ETFs have lower fees, typically 0.2-0.5% vs 1-2% for insurance products. But here''s what that comparison misses:\n\n**ETFs give you:** Investment returns\n**Insurance products give you:** Investment returns + insurance coverage + forced discipline\n\nIf you''re comparing purely on investment returns, ETFs win. But ask yourself:\n\n1. Do you have separate term insurance? (Add ~$100/month)\n2. Do you have critical illness coverage? (Add ~$80/month)\n3. Will you consistently invest every month without fail?\n4. Will you stay invested when markets drop 30%?\n\nWhen you factor in the *total cost of protection + investing*, the gap narrows significantly. And the behavioral coaching — having someone stop you from panic-selling — is worth its weight in gold.\n\n**My recommendation:** Use ETFs for pure investment. Use insurance for protection + guaranteed goals. Both have a role."', 'System (Best Practice)', 'system-seed');

-- Pricing: pr4 - "Why pay for something I may never use"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(pr4, E'**The Probability Reframe:**\n\n"That''s actually the best possible outcome! If you never claim, it means you stayed healthy — and that''s worth celebrating.\n\nBut consider the statistics:\n- **1 in 4** Singaporeans will get cancer before age 75\n- **1 in 3** will be hospitalized for a serious condition\n- Average critical illness treatment cost: **$200,000-$500,000**\n\nInsurance isn''t about *expecting* something bad to happen. It''s about making sure that IF it happens, your savings, your home, and your family''s lifestyle are protected.\n\nThink of it like a seatbelt — you wear it hoping you''ll never need it. But the one time you do, it saves everything."', 'System (Best Practice)', 'system-seed');

-- Trust: tr1 - "Insurance companies just want money"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tr1, E'**Transparency Approach:**\n\n"I understand that perception, and honestly, there have been cases in the industry that fueled it. But let me share some facts:\n\n- AIA paid out **$3.5 billion** in claims last year across Asia\n- The claims approval rate is **over 97%** for properly documented claims\n- Insurance is one of the most heavily **regulated industries** — MAS oversees every product and practice\n\nAs for me personally — I earn my living from this, yes. But my business is built on referrals. If I sell you something you don''t need, you won''t refer me to anyone. It''s in my self-interest to do right by you.\n\nI''d rather recommend *less* coverage that you can afford and feel good about, than oversell and lose your trust."', 'System (Best Practice)', 'system-seed');

-- Trust: tr2 - "Friend had bad claims experience"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tr2, E'**Acknowledge and Educate:**\n\n"I''m sorry to hear that — bad claims experiences do happen, and they''re frustrating. In most cases, claims issues come down to:\n\n1. **Non-disclosure** — health conditions not declared during application\n2. **Policy exclusions** — claiming for something not covered\n3. **Documentation gaps** — incomplete medical records\n\nMy role is to prevent ALL of these:\n- I walk you through the health declaration thoroughly\n- I explain every exclusion clearly before you sign\n- I help you with the entire claims process when the time comes\n\nWould it help if I showed you some real claims case studies (anonymized) so you can see how the process actually works?"', 'System (Best Practice)', 'system-seed');

-- Trust: tr3 - "Won't you disappear?"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tr3, E'**Service Commitment:**\n\n"That''s a really fair question, and it tells me you value long-term service — which I respect.\n\nHere''s my commitment:\n- **Annual reviews** — I schedule a yearly portfolio check-in with every client\n- **Claims support** — I personally handle claims submissions\n- **Accessibility** — You have my WhatsApp, email, and office number\n- **Track record** — I''ve been in this industry for [X] years with [Y] active clients\n\nAnd even in the unlikely event I leave the industry, AIA will assign you a new servicing advisor. Your policy is with the company, not with me.\n\nBut between us — I''m not going anywhere. My clients *are* my business."', 'System (Best Practice)', 'system-seed');

-- Trust: tr4 - "Burned by agent before"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tr4, E'**Empathy First:**\n\n"I''m really sorry you had that experience. Unfortunately, not every advisor in this industry operates with the same standards, and that gives all of us a bad name.\n\nCan I ask what happened? Understanding your past experience helps me make sure I don''t repeat the same mistakes.\n\n**Common issues I hear:**\n- Agent recommended products that weren''t suitable\n- No follow-up after the sale\n- Unclear explanations of fees and coverage\n\nHere''s how I work differently:\n- I always explain the **why** behind every recommendation\n- I document everything and give you a written summary\n- I schedule follow-ups proactively, not just when I have something to sell\n\nI don''t expect you to trust me based on words alone — let me earn it over time. Would you be open to a no-obligation review just to see how I work?"', 'System (Best Practice)', 'system-seed');

-- Timing: tm1 - "Not the right time"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tm1, E'**The Cost of Waiting:**\n\n"I understand — timing matters. But here''s something most people don''t realize:\n\n**Every year you wait:**\n- Premiums increase by 3-8% (age-based pricing)\n- Health conditions may develop (loading or exclusions)\n- You''re unprotected during the gap\n\nA 30-year-old who waits until 35 to buy CI coverage pays roughly **25-35% more** for the same coverage — and that''s assuming perfect health.\n\nIs there a specific event you''re waiting for? Maybe we can plan around it rather than delay entirely."', 'System (Best Practice)', 'system-seed');

-- Timing: tm2 - "I'll do it next year"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tm2, E'**The Next-Year Trap:**\n\n"I hear this a lot, and I said it myself before I became an advisor! The challenge is that *next year* has its own priorities:\n\n- Next year: \"I''m saving for a holiday\"\n- Year after: \"Just got married, expenses are high\"\n- Year after that: \"Baby on the way\"\n\nThere''s never a *perfect* time. But the math is clear — starting now, even small, is better than a big plan later.\n\nHow about we start with something minimal — just hospitalization coverage — which is mostly MediSave-payable anyway? Zero cash outlay, maximum peace of mind."', 'System (Best Practice)', 'system-seed');

-- Timing: tm3 - "Market too volatile"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tm3, E'**Volatility is Normal:**\n\n"I completely understand the concern. But consider this:\n\n- In the last 30 years, markets have crashed in 2000, 2008, 2020, and 2022\n- **Every single time**, they recovered and hit new highs\n- People who stayed invested through 2008-2009 saw 300%+ returns over the next decade\n\nTiming the market is nearly impossible — even professional fund managers can''t do it consistently. What works is **time IN the market**, not timing the market.\n\nWith dollar-cost averaging through a regular premium plan, volatility actually *helps* you — you buy more units when prices are low.\n\nWould you like me to show you a backtest of what would have happened if you started investing during the 2008 crash?"', 'System (Best Practice)', 'system-seed');

-- Timing: tm4 - "Wait until I earn more"
INSERT INTO objection_responses (objection_id, content, author_name, user_id) VALUES
(tm4, E'**The Lifestyle Creep Warning:**\n\n"That makes logical sense — more income = more budget for insurance. But here''s what actually happens:\n\n📈 Income goes up → Lifestyle goes up → Savings stay the same\n\nThis is called **lifestyle inflation**, and it''s the #1 reason people never \"get around to it.\"\n\nThe advisors I respect most told their younger clients: **\"Lock in your protection at today''s low premiums while your health is perfect. You can always upgrade coverage later, but you can''t undo a health condition.\"**\n\nEven $100/month now gets you meaningful coverage. And as your income grows, we gradually expand the plan. Sound reasonable?"', 'System (Best Practice)', 'system-seed');

END $$;
