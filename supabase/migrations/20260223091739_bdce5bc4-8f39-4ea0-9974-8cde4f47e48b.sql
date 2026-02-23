
-- New objection entries from Texting EQ guide
INSERT INTO public.objection_entries (id, title, category, description, tags, sort_order) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000001', 'If I need it, I''ll let you know', 'generic', 'Prospect deflects by putting the ball in their court, signaling disinterest without confrontation.', ARRAY['warm-market','deflection','texting-eq'], 1),
('a1b2c3d4-1111-4aaa-bbbb-000000000002', 'I just did a review with my advisor', 'generic', 'Prospect feels they are already covered and sees no reason for another review.', ARRAY['warm-market','existing-advisor','timing'], 2),
('a1b2c3d4-1111-4aaa-bbbb-000000000003', 'I''m not looking to invest right now', 'timing', 'Prospect is not in an investing mindset — could be risk-averse or overwhelmed by market conditions.', ARRAY['timing','investment','market-fear'], 3),
('a1b2c3d4-1111-4aaa-bbbb-000000000004', 'I''m getting married / buying a house — bad time', 'timing', 'Major life event makes the prospect feel financially stretched and unwilling to commit to anything new.', ARRAY['life-event','timing','housing','marriage'], 4),
('a1b2c3d4-1111-4aaa-bbbb-000000000005', 'Prospect ghosts / stops replying', 'tactical', 'Prospect reads messages but never responds — the most common outcome of text prospecting.', ARRAY['ghosting','follow-up','texting-eq'], 5),
('a1b2c3d4-1111-4aaa-bbbb-000000000006', 'Bad past experience with friends as advisors', 'trust', 'Prospect has been burned by mixing friendships with financial advice and is wary of repeating the pattern.', ARRAY['trust','friendship','warm-market'], 6),
('a1b2c3d4-1111-4aaa-bbbb-000000000007', 'Not at the moment / Maybe later', 'timing', 'Polite delay — prospect isn''t saying no, but has no urgency to act.', ARRAY['timing','delay','follow-up'], 7),
('a1b2c3d4-1111-4aaa-bbbb-000000000008', 'It''s ok, thank you / I''m good, thank you', 'generic', 'Polite brush-off that closes the conversation without giving a specific reason.', ARRAY['generic','polite-rejection','warm-market'], 8);

-- Responses for NEW entries (Texting EQ methodology)

-- "If I need it, I'll let you know"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000001',
'"Haha totally, I wouldn''t want you to get something you don''t need either! Actually most of my clients also met me without feeling interested — they didn''t know how I plan for my clients'' portfolios prior to meeting me. I just wanted to show you how I''ve been helping our friends with their investments. Then from there you can decide for yourself if it''s relevant? 😊 Which days are you usually in office?"

**Texting EQ Framework (4 Steps):**
1. **Acknowledge** — Validate their position casually
2. **Common ground** — "Most of my clients felt the same way"
3. **Different perspective** — Show what you actually do
4. **Make them feel safe** — They decide, no pressure

> 💡 **Tip:** Never leave the ball in their court. If you say "sure, let me know!", you lose all follow-up rights. Instead, pivot to an easy-to-answer question that keeps the conversation alive.',
'FINternship Team', 'system');

-- "I just did a review with my advisor"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000002',
'"That''s great that you''re proactive about your planning! Actually that makes it even better — since everything is fresh in your mind, it''d be super easy for us to have a quick chat. Some of my clients have two advisors working concurrently: one as a mentor figure, and one who''s in the same life stage who can relate better. Not saying you need that, but I''d love to show you how I complement what you already have. Catch you for 20 mins before the month ends?"

**Why this works:**
- Reframes the recent review as an *advantage* (everything is fresh)
- Introduces the "concurrent advisor" concept without threatening the existing relationship
- Low commitment ask (20 mins, specific timeframe)

> 💡 **Tip:** This is from a real case study where the prospect''s advisor was her aunt. The advisor acknowledged the family relationship, then positioned himself as a complementary resource in the same life stage.',
'FINternship Team', 'system');

-- "I'm not looking to invest right now"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000003',
'"Haha YES the markets are crazy right now right?? 😂 Actually that''s exactly why I wanted to reach out — I''ve been working with some of our friends especially now when markets are volatile, and if we do the right things right, we can potentially position well over the next few years. BUTTTT sometimes I also tell people NOT to invest at all if they''re not financially ready. Catch you for 20 mins then you decide for yourself??"

**Texting EQ Technique:**
- Match their energy (casual, emoji-friendly)
- Acknowledge the market concern
- Flip the objection: volatile markets = more reason to plan
- Safety valve: "sometimes I tell people NOT to invest"
- Easy question at the end

> 💡 **Tip:** Split your text into chunks — it creates a more casual, unscripted feel compared to one long wall of text.',
'FINternship Team', 'system');

-- "Getting married / buying house"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000004',
'"Congrats!! 🎉 That''s actually exactly what I''ve been helping a lot of couples with recently — detailed planning towards financial freedom while making sure they can afford their house and everything else. I set a reminder to text you today actually haha. After your wedding/BTO, can I show you what I usually do for people? No pressure at all 😊"

**Why this works:**
- Celebrate their milestone first (genuine warmth)
- Reframe: marriage/house = you NEED planning more, not less
- Reference social proof (other couples)
- Offer to meet *after* the life event — removes timing pressure
- "No pressure" makes them feel safe

> 💡 **Case Study:** An advisor reprospected someone who rejected him years ago. When the prospect mentioned getting married, the advisor said "After your wedding can I show you what I usually do for people?" The prospect replied: "Sure! But no pressure."',
'FINternship Team', 'system');

-- "Prospect ghosts"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000005',
'**The Bump Follow-Up:**
Simply send their name: "Hi Sarah!" — 90% of the time, people fail to reply because they forgot, not because they''re rejecting you.

**The Playful Nudge (for closer friends):**
"Eh bro... Don''t ignore me leh 😂 Don''t like FA just say…"
→ Usually gets: "Paiseh bro HAHA damn busy with work"
→ Then: "Me TOO! Let''s schedule for a few weeks later when we''re both more free"

**The Check-In Approach:**
"No worries! I''ll check in with you around [month]!" — This keeps the ball in YOUR court for follow-up rights.

**Texting EQ Rules for Ghosting:**
1. **Never take it personally** — laugh it off, maintain confidence
2. **Keep an Excel sheet** of people who didn''t reply — follow up systematically
3. **Reply quickly** when they DO respond (within 3-4 hours)
4. **Create touchpoints** before re-approaching (react to stories, comment on posts)
5. **Set the follow-up date further away** — "I''ll text you in Feb to arrange a date?" gives them breathing room

> 💡 **Mindset:** "I''ve had plenty of people ghost me, but I have 175 clients that I love and serve, and I honestly can''t remember who the last person that ghosted me was."',
'FINternship Team', 'system');

-- "Bad past experience with friends as advisors"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000006',
'"I totally get that — and honestly I really appreciate you being upfront with me about it 🙏 I''ve actually heard this from a few friends before. The last thing I''d want is for this to affect our friendship. That''s why I approach it differently — I just want to show you what I do, and you decide if it''s useful. If at the end you say ''nah not for me'', that''s completely fine and we go back to being friends. I''d rather you make an informed decision than wonder ''what if''. Can I buy you lunch and we chat for 20 mins?"

**Why this works:**
- Validates their past negative experience
- Acknowledges the friendship risk explicitly
- Differentiates yourself from the bad experience
- Low-stakes offer (lunch + 20 mins, not a "consultation")
- Empowers them to decide

**Real Case Study:**
A prospect said: "I have bad experiences of such dealings with friends so I tend to stay away... just being honest with you." The advisor acknowledged, empathised, and let her know some clients felt the same way before giving an alternate perspective about having concurrent advisors. The prospect eventually replied: "Lemme give it some thought."

> 💡 **Tip:** When someone shares a vulnerable reason like this, NEVER push harder in the same message. Acknowledge → Empathise → Offer an alternative → Wait.',
'FINternship Team', 'system');

-- "Not at the moment / Maybe later"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000007',
'"No worries at all! I''ll check in with you around [specific month]! 😊"

**Then ACTUALLY follow up.** Set a calendar reminder and text them when you said you would.

**Why this works (Texting EQ principles):**
- Gracefully accepts the delay (no pushing)
- **Takes the ball back** — YOU control when the next touchpoint happens
- Specific month shows reliability and professionalism
- When you DO follow up as promised, it builds massive trust

**Advanced Follow-Up Template:**
When the time comes:
"Hey [Name]! Hope work hasn''t been too busy for you 😊 I set a reminder to text you today haha. I''ve been working with a few people in [their industry/situation] recently and I wanted to show you something they found useful. Catch you before the month ends?"

> 💡 **Key Rule:** Never use the word "FREE" when scheduling. People are never "free." Instead: "When is a better time for a 30 min call? Would next Thursday or Friday be better?" — This streamlines their thinking to just pick between two options.',
'FINternship Team', 'system');

-- "It's ok, thank you / I'm good, thank you"
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('a1b2c3d4-1111-4aaa-bbbb-000000000008',
'"Hahaha YES I expected you to say that — if you were interested you would have already texted me 😂 Actually most of my clients also met me without feeling interested in anything I had to say, because they didn''t know how I plan for my clients'' portfolios prior to meeting me. So I want to show you how I improve my clients'' returns to complement what you have. Then from there you can decide for yourself if it''s relevant? Sometimes the conclusion would be to keep your portfolio unchanged also 😄 Which days are you usually in office?"

**The Texting EQ 4-Step Framework:**
1. ✅ **Casually acknowledge** — "YES I expected you to say that"
2. 🤝 **Common ground** — "most of my clients also felt this way"
3. 💡 **Different perspective** — "I want to show you how..."
4. 🛡️ **Make them feel safe** — "you decide for yourself"
5. ❓ **Easy question** — "Which days are you in office?"

> 💡 **Tip:** Add a personal touch: "I haven''t seen you in so long anyway / It''ll be fun! / You''ll love what you hear hehe" — this humanises the interaction beyond business.',
'FINternship Team', 'system');

-- Also add a Texting EQ response to the EXISTING "I'm not interested" entry
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('07d98f56-3a0f-46c2-bdff-49035ce17a87',
'**Texting EQ Version (Casual/WhatsApp):**

"Hahaha YES I expected you to be not interested — if you''re interested in it you would have already texted me 😂

Actually most of my clients also met me without feeling interested in anything I have to say because after all they didn''t know how I plan for my clients'' portfolio prior to meeting me.

So I want to show you, how I improve my clients'' investment returns to complement what you have.

Then from there you can decide for yourself if it''s relevant to you? Heh sometimes the conclusion would be to keep your portfolio unchanged also 😄

Which days are you usually in office? / Do you work from home or office?"

**Why this works (Texting EQ 4-Step):**
1. Acknowledge with humour — disarms defensiveness
2. Normalise — "most clients felt the same"
3. Redirect to value — show, don''t tell
4. Safety — they decide, not you
5. Easy question — keeps convo alive

> 💡 **Pro Tip:** Split this into multiple short messages (chunking) for a more natural texting feel. Don''t send it as one block.',
'FINternship Team', 'system');

-- Add Texting EQ response to existing "I already have an agent" entry
INSERT INTO public.objection_responses (objection_id, content, author_name, user_id) VALUES
('6640c9d3-55fd-43c2-9716-235b40fceef8',
'**Texting EQ Version (for warm market / friends):**

"Ahhhh I see — that''s great that you actually have some planning done up! 👍

I actually wanted to reach out because recently I''ve been working hard to learn about retirement planning and I''ve been helping friends with their retirement and tax planning.

I understand you have an advisor working with you also. I have no idea whether you need any form of additional planning, but I was hoping we can have a discussion about how you''re doing your planning, then we can see whether I''ll be of value to you!

Something clients have shared is how they wanted an advisor in the same life stage — someone who''ll be there for the next 4-5 decades, while an older advisor can be a concurrent mentor at the same time 😊

Anyway, I''m really hoping we can have a super casual chat about this. I''ll catch you before the end of the year for a meal? 🍽️"

**Case Study Result:** Prospect initially objected that her aunt was her advisor and she avoids mixing friendships with financial dealings. After this approach, she replied: "Lemme give it some thought." The advisor later secured the meeting.

> 💡 **Key Concept:** Position yourself as *complementary*, not *replacement*. The "concurrent advisor" frame removes the threat to their existing relationship.',
'FINternship Team', 'system');
