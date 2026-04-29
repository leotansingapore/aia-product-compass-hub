---
title: Curriculum-Anchored Objection Library
last_updated: 2026-04-29
source_of_truth: src/data/curatedObjections.ts
related:
  - week-8/day-44.md
  - week-8/day-47.md
  - ../next-60-days/week-7/day-40.md
  - week-10/day-56.md
---

# Curriculum-anchored objection library

The single source of truth for objection-handling scripts on `/objections`. Every entry is tagged to one of the **3 ARQ frameworks**:

- **Framework A — Acknowledge → Question (ARQ) → Reframe** — the workhorse. ~70% of objections close on this alone.
- **Framework B — Feel, Felt, Found** — for emotional / relationship-weighted objections.
- **Framework C — Boomerang ("that's exactly why")** — turn the disqualifier into the qualifier.
- **Skip-Q** — Framework A with the question step skipped, used only when the reflex is unmistakably stock.

> **ARQ — Asking the Right Questions.** A hundred statements are never as powerful as one right question. People defend statements; they own conclusions they reach themselves.

## How to use this file

- **Live page:** `/objections` mirrors this content via `src/data/curatedObjections.ts`. Edit the TS file (or this markdown + regenerate) — both should agree.
- **Day reference:** Each entry links back to the Day file where the framework is taught.
- **Voice rules:** Acknowledge first, never argue, always close on a time ask (or use the soft exit).

---

## Push-away / reflex objections

### "Not interested"

- **Framework:** A (with skip-Q fallback)
- **Trigger:** First 60 seconds of a call — reflex social defence.
- **Approach:** Run full ARQ if it caught you off-guard. The Q step is the diagnostic — "not interested" can mean three different things.

**Acknowledge:** "Totally fair."

**Question (ARQ):** "Just so I respect your time — is that not interested in insurance specifically, not interested in talking to advisors at all, or not the right timing? Any of those is fine, I just want to know which."

**Skip-Q reframe (when reflex is obvious):** "Fair — wouldn't expect you to be interested in something you haven't seen yet. Just so you can judge for yourself, would Tuesday 7pm or Saturday 10am work?"

---

### "Not in the market"

- **Framework:** Skip-Q
- **Trigger:** Prospect signals they're not buying right now.
- **Approach:** Acknowledge, reframe to "when you ARE ready," close on time.

**Stock response:** "Honestly I'd have been surprised if you said you were. I do have ideas that'll be useful for you when you're ready, though — quicker to share them now than from scratch later. Tuesday 7pm or Saturday 10am?"

---

### "No need"

- **Framework:** Skip-Q
- **Trigger:** Prospect dismisses the value before hearing it.
- **Approach:** Acknowledge their authority to judge, then reframe to letting them judge for themselves.

**Stock response:** "Fair, and you'd be the only person who can call that. Since it's only 20 minutes, would Tuesday 7pm or Saturday 10am work to let you make that call for yourself?"

---

### "What's the idea?"

- **Framework:** Skip-Q
- **Trigger:** Prospect testing whether to give you the meeting.
- **Approach:** Refuse to summarise badly over the phone — the meeting IS the demo.

**Stock response:** "Honestly the worst thing I could do is summarise it badly over the phone. Give me 20 minutes to walk you through it properly with the actual numbers — Tuesday 7pm or Saturday 10am?"

---

### "Is it insurance?"

- **Framework:** Skip-Q
- **Trigger:** Prospect screening for sales pressure.
- **Approach:** Honest "maybe" — sometimes it's insurance, sometimes it's restructuring what they already pay.

**Stock response:** "Could be, depending on your situation. For some people it's insurance, for others it's actually just rearranging what they already pay for. Easier to figure out in 20 minutes than over the phone — Tuesday 7pm or Saturday 10am?"

---

### Obstinate objector (the soft fallback)

- **Framework:** Skip-Q (drops the time ask entirely)
- **Trigger:** Prospect closing the door but you want to keep it cracked open.
- **Approach:** Soft exit that preserves the relationship for a future approach.

**Soft exit:** "Could we leave it this way — I'd like to meet you, and if I'm in your neighbourhood over the next few months, I'd like to drop in and say hello. If you have a few moments at that time, I'll be glad to share what I have in mind."

> **Watch out:** Use this last — the moment you drop the time ask, you're handing the relationship back to passive nurture. Don't default to it.

---

### "I don't believe in insurance"

- **Framework:** A
- **Trigger:** Prospect dismisses the entire concept — usually rooted in a specific past experience or generational view.
- **Approach:** Run full ARQ. The objection is too vague to handle directly. Surface the specific experience or belief underneath. Never argue the concept itself.

**Acknowledge + ARQ:** "Fair — and you wouldn't be the first. Quick one before I respond — what shaped that view? Was it a specific experience (someone in the family burned by a policy, a claim that got rejected), or more of a general feeling that the industry's rigged? I want to make sure I'm not arguing the wrong thing."

**Reframe (after they share):** "Got it — that makes sense given what you went through. So just to be clear, what I do is less about selling insurance and more about figuring out which parts of your money work for you and which don't. Sometimes the answer is a policy. Sometimes it's restructuring what you already pay. 30 minutes — Tuesday 7pm or Saturday 10am?"

> **Watch out:** Don't try to defend the industry. The belief is rarely about insurance itself — it's about a specific bad experience. Surface that, and the objection often dissolves.

---

### "I'm too young to worry about this"

- **Framework:** C (Boomerang)
- **Trigger:** Prospect uses age as the disqualifier — common from NSFs, fresh grads, 20-somethings.
- **Approach:** Young IS the qualifier — premiums lock at today's age and today's health. Make the time-to-act point, then close.

**Boomerang version:** "That's exactly why — premiums lock in at the age and health you sign at. The 25-year-old version of you can buy cover the 35-year-old version can't afford. The window is now, and it closes quietly. 20 minutes — Tuesday 7pm or Saturday 10am?"

**Skip-Q stock:** "Honest answer — being young is the only reason this makes sense to even talk about. Premiums and underwriting both get harder fast. 20 minutes is all I'm asking for."

---

### "Why pay for something I may never use?"

- **Framework:** A
- **Trigger:** Prospect framing insurance as a wager rather than a hedge.
- **Approach:** ARQ. Surface what they think 'using it' means — almost always 'making a claim' — then reframe to protection-of-savings.

**Acknowledge + ARQ:** "Fair point — and I want to make sure I respond to what you actually mean. When you say 'use it,' are you thinking about making a claim — like a hospital stay or a critical illness payout? Or more like getting some kind of money back?"

**Reframe (after they answer):** "Got it. The way I think about it — you're not paying so something happens. You're paying so that IF something happens, your savings, your home, and your family's lifestyle don't get drained to fix it. The hope is you never claim. The reason it's worth it is because the alternative is paying out of pocket. 20 minutes to map what that looks like for your situation?"

> **Watch out:** Don't lead with cancer or hospitalisation stats. Fear-mongering reframes feel manipulative and undo the rapport.

---

### "Insurance companies just want my money"

- **Framework:** A
- **Trigger:** Industry-level skepticism — usually a specific story or general 'big corporation' frame.
- **Approach:** ARQ to surface the source. Don't defend the industry — acknowledge there are reasons that view exists, then show how YOU work differently.

**Acknowledge + ARQ:** "Honestly — fair, and the industry's earned some of that. Quick one before I respond: is that based on something specific (a claim that got denied, an agent that vanished, a friend's bad experience), or more of a general feeling? Want to make sure I'm not defending against the wrong thing."

**Reframe (after they share):** "Got it. Here's how I work — I don't pitch products on the first meeting. I show you what you've already got, where the gaps are, and what to do with what you already pay. If you walk away saying 'no thanks,' I haven't lost anything — I'd rather you trust me later than oversell you now. 30 minutes — worth it?"

---

### "My friend had a terrible claims experience"

- **Framework:** B (Feel-Felt-Found)
- **Trigger:** Story-based objection — emotional weight from someone close.
- **Approach:** Never dismiss the friend's experience. Acknowledge it can happen, then reframe to how YOUR role prevents the common causes (bad disclosure, bad documentation, no one in their corner).

**Feel-Felt-Found:** "(Feel) I'm sorry — that sounds rough, and it sticks with you when it's someone close. (Felt) A handful of my clients walked in with the exact same story. (Found) What they found was that the difference between a clean claim and a denied one is almost always the prep — disclosure at sign-up, the documentation, having someone in their corner when the assessor pushes back. That's the thing I do that the friend's advisor probably didn't. So less about 'will the company pay,' more about 'will I make sure you get paid.' 30 minutes to walk you through how that works?"

---

## Already have policies

### "I already have policies"

- **Framework:** C (Boomerang) — with ARQ-A diagnostic up front
- **Trigger:** Prospect has cover already — basic, parent-bought, or 'comprehensive'.
- **Approach:** ARQ to surface which sub-flavour, then Boomerang the specific sub-flavour. Never tell them their existing policy is bad — reframe from policy to plan.

**Step 1 — Acknowledge + ARQ to surface the sub-flavour:** "Smart — most people I respect already have something in place. Quick one before I assume — when you say 'already have', is it: (a) something from when you were younger and you haven't checked it in a while, (b) a plan a parent or employer set up for you, or (c) something you reviewed recently and feel solid about? Just so I don't talk over what you've got."

**Step 2a — Old plan, never reviewed:** "Quick one — if you had to draw your current cover from memory right now, could you? Most people can't, and that's not carelessness, it's just that policies pile up over time. The 30 minutes I'm asking for is exactly that — you walk me through what you've got, I tell you what I'd flag if it were my own family. No products on the table that day. Just a free second opinion. Worth doing?"

**Step 2b — Parent or employer-bought:** "Got it — and you'd be surprised how often the cover that made sense at 25 isn't the cover that makes sense at 32. Parents tend to buy the plan they would've wanted at your age, which is usually conservative. Employer cover dies the day you change jobs. Both are good starting points; neither is the finish line. 30 minutes to map yours — Tuesday 7pm or Saturday 10am?"

**Step 2c — Comprehensive, recently reviewed:** "Honestly — then you're already ahead of 80% of the people I speak to. Just one ask: a same-life-stage second opinion never costs you anything, and even on solid plans I usually find one tweak worth $3-5k of value over the lifetime. If I find nothing, you've validated your own work. If I find something, you've made $4k off a coffee. 30 minutes — worth it?"

> **Watch out:** Never label the existing policy as bad. Reframe to free second opinion. The deliverable is the canonical Policy Summary deck (template + sample in Day 58).

---

## Already have an advisor

### "I already have an advisor"

- **Framework:** B (Feel-Felt-Found)
- **Trigger:** Prospect mentions an existing advisor — especially family, long-time agent, or employer-tied.
- **Approach:** Never attack the existing advisor. Reframe to complement — same-life-stage second pair of eyes that the existing advisor can't give.

**Family / loyalty version:** "Honestly — totally respect that, especially if it's family or someone you've trusted for years. (Feel) I get it — swapping advisors feels like you're being disloyal, and I'd never ask you to do that. (Felt) Most of the clients I work with felt exactly the same when we first met. (Found) What they found was that keeping their existing advisor and adding me as a same-life-stage second pair of eyes was the actual win — your aunt's got the long view of your family, which is irreplaceable. What I do differently is I'm in your life stage, watching the same products and CPF changes coming out for our generation, and that perspective fades a bit once an advisor is 20 years ahead of you. So no replacement, just a coffee where I share what I'm seeing — and you take what's useful back to your aunt for action. Sound reasonable?"

**Shorter version when rapport is good:** "Totally fair. My honest take: most of my clients in your situation kept their existing advisor and added me as a same-life-stage second pair of eyes. They stay the long-view person; I'm the 'what's the new product this year' person. 30-min coffee, no pressure, you walk away with one or two takeaways for whoever you work with. Open to it?"

> **Watch out:** If the prospect says 'my advisor is my best friend's father and we're really close,' drop the ask. Use the obstinate-objector exit.

---

### "I've been burned by an advisor before"

- **Framework:** B (Feel-Felt-Found)
- **Trigger:** Personal bad experience with a previous advisor — emotional, requires empathy frame.
- **Approach:** Don't promise you're different — show it through how you frame the next step (small, low-commitment, you do most of the listening).

**Feel-Felt-Found:** "(Feel) Genuinely sorry. That experience makes you slow to trust again, and it should. (Felt) A few of my best clients came to me the same way — burned, cautious, expecting me to be like the last guy. (Found) What they found was that the way to rebuild trust is small. So I'm not asking you to commit to anything — I'm asking for 30 minutes where you do most of the talking, I take notes, and you decide afterwards if the next conversation's worth having. Earn it slow. Tuesday 7pm or Saturday 10am?"

---

## Cost of delay / time

### "I'm too busy"

- **Framework:** C (Boomerang)
- **Trigger:** Time scarcity as the disqualifier.
- **Approach:** Busy people without a plan compound problems. 30 minutes saves 3 hours later.

**Boomerang:** "That's exactly why — busy people without a plan compound their problems. 30 minutes now saves the 3 hours of admin you'll need later."

**Skip-Q stock:** "I guessed you would be — that's why I called to schedule rather than just showing up. 20 minutes on Tuesday 7pm, or Saturday 10am?"

---

### "No money"

- **Framework:** C (Boomerang)
- **Trigger:** Lack of disposable income framed as the disqualifier.
- **Approach:** No buffer means the wrong $50/month decision costs more. The plan frees up the buffer.

**Boomerang:** "That's exactly why — when there's no buffer, the wrong $50/month decision costs you more. The plan is what frees up the buffer."

**Skip-Q stock:** "Totally fair — and that's actually a good reason to talk, not a reason to skip it. What I'd cover is more about what you already pay for than adding new expenses. Free 20 minutes — Tuesday 7pm or Saturday 10am?"

---

### "Let me think about it"

- **Framework:** A
- **Trigger:** Post-pitch ambiguous objection — could mean (1) the offer, (2) timing, (3) trust in you, or (4) needing to consult someone.
- **Approach:** Run full ARQ. Each meaning needs a different response.

**ARQ diagnostic:** "Totally fair — and I want to make sure I'm not the reason you're hesitating. Is the part you want to think about the offer itself, the timing, or whether I'm the right person to do it with?"

**Iceberg-style probe (Day 40 next-60-days):** "Got it. Is it the premium, the commitment, needing to talk to someone, or a hidden concern? Genuinely no wrong answer — I just want to address the right thing."

---

### "Let me check with my spouse first"

- **Framework:** A
- **Trigger:** Post-pitch deferral — could be genuine or stall.
- **Approach:** ARQ to surface which. If genuine, joint meeting. If stall, isolate the real concern.

**Acknowledge + ARQ:** "Fully respect that — these calls should be made together. Quick one so I don't get this wrong: is this a 'I want my partner in the room when we make the decision' or more of a 'I want to think it through with them first'? Both are fine, just changes what I do next."

**If 'partner in the room' — joint meeting close:** "Perfect. The right move is to have your partner there from the start so you're not playing telephone with my answers. Weekday evening or Saturday morning easier for both of you?"

**If 'think it through first' — isolate the concern:** "Got it. If you had to bet on what they'll push back on — premium, commitment, or whether I'm the right person — what would it be? Easier if I address it now so you go home with a real answer rather than 'the agent will follow up.'"

---

### "It's too expensive"

- **Framework:** A
- **Trigger:** Pricing pushback — sticker shock, value mismatch, or genuine cash flow.
- **Approach:** ARQ first. 'Compared to what?' surfaces the real concern. Avoid '$10/day = 2 coffees' — sounds glib.

**Acknowledge + ARQ:** "Fair feedback. Quick one — when you say expensive, is it expensive vs your monthly budget, or expensive vs what you thought protection would cost? Different problem each way and I'd hate to fix the wrong one."

**If budget-tight — restructure:** "Got it. Then let's not look at this plan — let's look at your budget first and reverse-engineer what protection actually fits in. Better to have $80/month of the right thing than $300/month of the wrong thing. 20 minutes to map it?"

**If perception — show the numbers:** "Fair — and I'd rather show you the math than argue about it. The illustration shows exactly where every dollar goes. Tuesday 7pm or Saturday 10am to walk through it?"

> **Watch out:** Avoid the '$10/day = 2 coffees' reframe. It sounds glib and skips ARQ entirely.

---

### "I'll do it next year"

- **Framework:** C (Boomerang)
- **Trigger:** Procrastination framed as scheduling.
- **Approach:** Next-year is a moving target. Make the cost concrete, close on a small first step today.

**Boomerang:** "Honestly — every client of mine who said 'next year' said the same thing the year after, and the year after that. Not because they're flaky, but because life adds new priorities every year. The smaller version of this — just hospitalisation, mostly MediSave-paid, zero cash out — locks the principle in now and we expand later. 20 minutes to set that up?"

---

### "I'll wait until I earn more"

- **Framework:** C (Boomerang)
- **Trigger:** Income-tied delay — assumes future-them will have more headroom.
- **Approach:** Address lifestyle creep directly. Lock in the principle at low cost now, scale up as income grows.

**Boomerang:** "That's exactly why now matters — income going up almost never means savings go up, because lifestyle goes up first. The clients I respect locked in the protection version while premiums were lowest, then added on as income grew. The reverse doesn't work — you can't undo a health condition you developed during the wait. 20 minutes to set the small version?"

---

## Format / channel

### "Send me info / post it out"

- **Framework:** Skip-Q
- **Trigger:** Prospect deflecting to async channel to avoid the meeting.
- **Approach:** Generic info wastes their time more than a 20-minute call.

**Stock response:** "Happy to — but anything I send blind will either be too generic to use or too long to read. Quicker if I see your situation first, then I send the relevant 2 pages after. Tuesday 7pm or Saturday 10am?"

---

## Product-specific (post-pitch)

These need product knowledge, not pure ARQ — but they still slot into one of the 3 frameworks. Sourced from Day 56 product sales tracks.

### "ILPs have high charges"

- **Framework:** A
- **Trigger:** Pro-Achiever / ILP product objection — usually after the prospect read forum posts.
- **Approach:** Acknowledge the charges are real. ARQ on what they're comparing against (DIY ETF vs another insurance plan). Reframe to total-cost-of-ownership.

**Acknowledge + ARQ:** "Fair — the charges ARE there, I won't pretend otherwise. Quick one — are you comparing this against ETFs / robo-advisors, or against another insurance plan? Different conversation each way."

**Reframe (vs DIY ETF):** "Got it. Then let's actually compare apples to apples. The charges in an ILP cover three things: the insurance coverage built in, the fund management, and someone in your corner when markets crash. If you go DIY, you'd pay for term insurance separately (~$50-100/month), platform fees on the ETF, and you're on your own when markets drop 30%. When I add it up, the gap is much smaller than the headline charge suggests."

> **Watch out:** Don't get into a fee-defending debate. The right answer is total-cost-of-ownership, not 'our fees are reasonable.'

---

### "Endowment returns are too low"

- **Framework:** A
- **Trigger:** Smart Wealth Builder / endowment objection — comparing 2-3% returns to stock market.
- **Approach:** ARQ on the goal first. Endowments compete with bank savings for short-to-mid-term goals, not with the stock market.

**Acknowledge + ARQ:** "Fair — and you're right that they don't compete with the stock market. Quick one — what's the money for? Wedding fund, house down payment, child's education, or general savings?"

**Reframe (after they share goal):** "Got it. So this isn't actually a 'beat the market' decision — it's a 'will the money definitely be there when I need it' decision. Endowments win on certainty and on the discipline of forced saving. Stocks win on long-term growth but lose on the panic-sell problem. Different jobs. The right move is to use both — endowment for the goal you can't miss, stocks for the goal that can wait."

---

### "Whole life premium is too expensive vs term"

- **Framework:** A
- **Trigger:** GPP / whole life objection — comparing monthly premium against term.
- **Approach:** Acknowledge gap is real. ARQ on what 'covered' means (working years vs lifetime). Most claims happen at 65+.

**Acknowledge + ARQ:** "True — whole life is more per month, no argument. Quick one before I respond: when you imagine 'covered,' do you mean covered through working years, or covered for life — including 65+ when most claims actually happen?"

**Reframe (after they answer):** "Got it. So the trade-off is: term gives you the cheapest premium today but ends right when you're most likely to claim. Whole life is more per month but locks in cover at today's price for life and builds cash value you can borrow against. Most of my clients use BOTH — whole life for the lifetime base, term layered on for the high-responsibility years (kids, mortgage)."

---

### "Term insurance has no cash value"

- **Framework:** A
- **Trigger:** Term objection — prospect dislikes paying for protection that 'leaves nothing.'
- **Approach:** Honest BTIR question. BTIR is mathematically right and behaviourally wrong for most people.

**Acknowledge + ARQ:** "Correct — term is pure protection, no cash value. The case FOR it is 'Buy Term, Invest the Rest' — cheapest protection, you invest the savings separately. The honest question is: will you actually invest the difference every month, even when markets drop?"

**Reframe (after they answer):** "If yes — term is the right call, you'll come out ahead. If no, or you're not sure — whole life forces the saving for you, and you'll thank yourself in 20 years. Which one sounds more like you?"

> **Watch out:** Don't sell BTIR as 'always better.' It's only better if the discipline is real.

---

### "I have MediShield Life — why do I need a rider?"

- **Framework:** C (Boomerang)
- **Trigger:** HealthShield objection — assumes basic government coverage is enough.
- **Approach:** MediShield Life IS the reason a rider matters — it plugs the specific gap (private ward, $150K cap, large cancer treatments).

**Boomerang + numbers:** "That's exactly why this conversation matters — MediShield Life is great basic cover for B2/C ward stays with a $150K annual claim limit. The gap shows up the day you walk into a private ward or face a $300K+ cancer treatment. The rider exists specifically to plug that gap, mostly payable from MediSave so the cash impact is small. Want me to show you the actual numbers for your age band?"

---

## Index by framework

- **Framework A (ARQ):** Not interested · Let me think · Let me check with my spouse · It's too expensive · I don't believe in insurance · Why pay for something I may never use · Insurance just wants my money · ILPs have high charges · Endowment returns too low · Whole life too expensive · Term has no cash value
- **Framework B (Feel-Felt-Found):** Already have an advisor · I've been burned by an advisor · My friend had a bad claims experience
- **Framework C (Boomerang):** I'm too busy · No money · I already have policies · I'll do it next year · I'll wait until I earn more · I'm too young · MediShield Life is enough
- **Skip-Q:** Not in the market · No need · What's the idea · Is it insurance · Send me info · Obstinate objector

## Migration history

- **2026-04-29:** Legacy seeded objections (26 entries from `objection_entries` table) audited. Duplicates of existing curated entries removed. Salvageable content rewritten in ARQ voice and merged in. Bad patterns (preachy education-dump, '$10/day = 2 coffees' reframes, fear-mongering stats) destroyed. Legacy DB hidden from `/objections` for non-admins; admins can still access it via collapsible.
