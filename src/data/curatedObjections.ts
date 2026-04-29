// Curriculum-anchored objection handling library.
// Mirrored from docs/first-60-days/week-8/day-44.md and the canonical ARQ
// database in Obsidian (Content/first-60-days/_source-scripts/arq-database.md).
// Each entry references its source-of-truth markdown file so the curriculum
// remains canonical - this constant is the rendering surface for /objections.

export type ArqFramework = "A" | "B" | "C" | "skip-q";

export interface CuratedObjection {
  id: string;
  title: string;
  family: "push-away" | "have-policies" | "have-advisor" | "format" | "cost-of-delay" | "format-recruitment" | "product";
  framework: ArqFramework;
  trigger: string;
  approach: string;
  scripts: { label: string; content: string }[];
  watchOut?: string;
  source: { day: string; path: string };
}

export const FRAMEWORK_NAMES: Record<ArqFramework, string> = {
  A: "Framework A — Acknowledge → Question (ARQ) → Reframe",
  B: "Framework B — Feel, Felt, Found (empathy frame)",
  C: "Framework C — Boomerang (that's exactly why)",
  "skip-q": "Framework A (skip-Q) — for unmistakable stock reflexes",
};

export const FRAMEWORK_PRIMER = {
  arqPrinciple:
    "ARQ — Asking the Right Questions. A hundred statements are never as powerful as one right question. People defend statements; they own conclusions they reach themselves.",
  arqChecklist: [
    "Does it lead to my objective? (clear path from this answer to where I want the conversation to go)",
    "Is it specific? (forces a specific answer, doesn't allow a hedge)",
    "Is it logical and indisputable? (can the prospect disagree without sounding unreasonable?)",
  ],
  decisionTree: [
    {
      question: "Does the objection have emotional or relationship weight?",
      yes: "Framework B — Feel, Felt, Found",
      no: "next gate",
    },
    {
      question: "Is the prospect naming a state they think disqualifies them?",
      yes: "Framework C — Boomerang (turn the disqualifier into the qualifier)",
      no: "next gate",
    },
    {
      question: "Default",
      yes: "Framework A — Acknowledge → Question (ARQ) → Reframe",
      no: "(skip-Q if the reflex is unambiguous)",
    },
  ],
};

export const CURATED_OBJECTIONS: CuratedObjection[] = [
  {
    id: "i-already-have-policies",
    title: "I already have policies",
    family: "have-policies",
    framework: "C",
    trigger: "Prospect has cover already - basic, parent-bought, or 'comprehensive'.",
    approach:
      "Use ARQ to surface which sub-flavour you're dealing with, then Boomerang the specific sub-flavour. Never tell them their existing policy is bad - reframe from policy to plan.",
    scripts: [
      {
        label: "Step 1 — Acknowledge + ARQ to surface the sub-flavour",
        content:
          "Smart - most people I respect already have something in place. Quick one before I assume - when you say 'already have', is it: (a) something from when you were younger and you haven't checked it in a while, (b) a plan a parent or employer set up for you, or (c) something you reviewed recently and feel solid about? Just so I don't talk over what you've got.",
      },
      {
        label: "Step 2a — Old plan, never reviewed",
        content:
          "Quick one - if you had to draw your current cover from memory right now, could you? Most people can't, and that's not carelessness, it's just that policies pile up over time. The 30 minutes I'm asking for is exactly that - you walk me through what you've got, I tell you what I'd flag if it were my own family. No products on the table that day. Just a free second opinion. Worth doing?",
      },
      {
        label: "Step 2b — Parent or employer-bought",
        content:
          "Got it - and you'd be surprised how often the cover that made sense at 25 isn't the cover that makes sense at 32. Parents tend to buy the plan they would've wanted at your age, which is usually conservative. Employer cover dies the day you change jobs. Both are good starting points; neither is the finish line. 30 minutes to map yours - Tuesday 7pm or Saturday 10am?",
      },
      {
        label: "Step 2c — Comprehensive, recently reviewed",
        content:
          "Honestly - then you're already ahead of 80% of the people I speak to. Just one ask: a same-life-stage second opinion never costs you anything, and even on solid plans I usually find one tweak worth $3-5k of value over the lifetime. If I find nothing, you've validated your own work. If I find something, you've made $4k off a coffee. 30 minutes - worth it?",
      },
    ],
    watchOut:
      "Never label the existing policy as bad. Reframe to free second opinion - they own a policy; you'd help them turn it into a plan. The deliverable for the free second opinion is the canonical Policy Summary deck (template + sample linked from Day 58 'Policy Summary - Riders, Exclusions, Structure').",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "already-have-an-advisor",
    title: "I already have an advisor",
    family: "have-advisor",
    framework: "B",
    trigger:
      "Prospect mentions an existing advisor - especially family, long-time agent, or employer-tied. Carries emotional and relationship weight.",
    approach:
      "Feel-Felt-Found. Never attack the existing advisor. Reframe to complement - same-life-stage second pair of eyes that the existing advisor can't give.",
    scripts: [
      {
        label: "Family / loyalty version",
        content:
          'Honestly - totally respect that, especially if it\'s family or someone you\'ve trusted for years. (Feel) I get it - swapping advisors feels like you\'re being disloyal, and I\'d never ask you to do that. (Felt) Most of the clients I work with felt exactly the same when we first met. (Found) What they found was that keeping their existing advisor and adding me as a same-life-stage second pair of eyes was the actual win - your aunt\'s got the long view of your family, which is irreplaceable. What I do differently is I\'m in your life stage, watching the same products and CPF changes coming out for our generation, and that perspective fades a bit once an advisor is 20 years ahead of you. So no replacement, just a coffee where I share what I\'m seeing - and you take what\'s useful back to your aunt for action. Sound reasonable?',
      },
      {
        label: "Shorter version when rapport is good",
        content:
          'Totally fair. My honest take: most of my clients in your situation kept their existing advisor and added me as a same-life-stage second pair of eyes. They stay the long-view person; I\'m the "what\'s the new product this year" person. 30-min coffee, no pressure, you walk away with one or two takeaways for whoever you work with. Open to it?',
      },
    ],
    watchOut:
      "If the prospect says 'my advisor is my best friend's father and we're really close,' drop the ask. Use the obstinate-objector exit and walk away with the relationship intact.",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "not-interested",
    title: "Not interested",
    family: "push-away",
    framework: "A",
    trigger: "First 60 seconds of a call - reflex social defence.",
    approach:
      "Run full ARQ if the objection caught you off-guard. The Q step is the diagnostic - 'not interested' can mean three different things and each needs a different reframe.",
    scripts: [
      {
        label: "Acknowledge",
        content: "Totally fair.",
      },
      {
        label: "Question (ARQ)",
        content:
          "Just so I respect your time - is that not interested in insurance specifically, not interested in talking to advisors at all, or not the right timing? Any of those is fine, I just want to know which.",
      },
      {
        label: "Skip-Q reframe (when the reflex is obvious)",
        content:
          "Fair - wouldn't expect you to be interested in something you haven't seen yet. Just so you can judge for yourself, would Tuesday 7pm or Saturday 10am work?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "not-in-the-market",
    title: "Not in the market",
    family: "push-away",
    framework: "skip-q",
    trigger: "Prospect signals they're not buying right now.",
    approach: "Skip-Q. Acknowledge, reframe to 'when you ARE ready,' close on time.",
    scripts: [
      {
        label: "Stock response",
        content:
          "Honestly I'd have been surprised if you said you were. I do have ideas that'll be useful for you when you're ready, though - quicker to share them now than from scratch later. Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "no-money",
    title: "No money",
    family: "cost-of-delay",
    framework: "C",
    trigger: "Prospect frames lack of disposable income as the disqualifier.",
    approach:
      "Boomerang. The objection itself is why the meeting matters - no buffer means the wrong $50/month decision costs more.",
    scripts: [
      {
        label: "Boomerang version",
        content:
          "That's exactly why - when there's no buffer, the wrong $50/month decision costs you more. The plan is what frees up the buffer.",
      },
      {
        label: "Skip-Q stock response",
        content:
          "Totally fair - and that's actually a good reason to talk, not a reason to skip it. What I'd cover is more about what you already pay for than adding new expenses. Free 20 minutes - Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "too-busy",
    title: "Too busy",
    family: "cost-of-delay",
    framework: "C",
    trigger: "Prospect uses time scarcity as the disqualifier.",
    approach: "Boomerang - busy people without a plan compound problems. 30 minutes saves 3 hours later.",
    scripts: [
      {
        label: "Boomerang version",
        content:
          "That's exactly why - busy people without a plan compound their problems. 30 minutes now saves the 3 hours of admin you'll need later.",
      },
      {
        label: "Skip-Q stock response",
        content:
          "I guessed you would be - that's why I called to schedule rather than just showing up. 20 minutes on Tuesday 7pm, or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "no-need",
    title: "No need",
    family: "push-away",
    framework: "skip-q",
    trigger: "Prospect dismisses the value before hearing it.",
    approach: "Skip-Q. Acknowledge their authority to judge, then reframe to letting them judge for themselves.",
    scripts: [
      {
        label: "Stock response",
        content:
          "Fair, and you'd be the only person who can call that. Since it's only 20 minutes, would Tuesday 7pm or Saturday 10am work to let you make that call for yourself?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "whats-the-idea",
    title: "What's the idea?",
    family: "push-away",
    framework: "skip-q",
    trigger: "Prospect testing whether to give you the meeting.",
    approach: "Skip-Q. Refuse to summarise badly over the phone - the meeting IS the demo.",
    scripts: [
      {
        label: "Stock response",
        content:
          "Honestly the worst thing I could do is summarise it badly over the phone. Give me 20 minutes to walk you through it properly with the actual numbers - Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "is-it-insurance",
    title: "Is it insurance?",
    family: "push-away",
    framework: "skip-q",
    trigger: "Prospect screening for sales pressure.",
    approach: "Skip-Q. Honest 'maybe' - sometimes it's insurance, sometimes it's restructuring what they already pay.",
    scripts: [
      {
        label: "Stock response",
        content:
          "Could be, depending on your situation. For some people it's insurance, for others it's actually just rearranging what they already pay for. Easier to figure out in 20 minutes than over the phone - Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "post-it-out",
    title: "Send me info / post it out",
    family: "format",
    framework: "skip-q",
    trigger: "Prospect deflecting to async channel to avoid the meeting.",
    approach: "Reframe - generic info wastes their time more than a 20-minute call.",
    scripts: [
      {
        label: "Stock response",
        content:
          "Happy to - but anything I send blind will either be too generic to use or too long to read. Quicker if I see your situation first, then I send the relevant 2 pages after. Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "obstinate-objector",
    title: "Obstinate objector (the soft fallback)",
    family: "push-away",
    framework: "skip-q",
    trigger: "Prospect closing the door but you want to keep it cracked open.",
    approach:
      "Drops the time ask entirely - the only response in the set that does. Soft exit that preserves the relationship for a future approach.",
    scripts: [
      {
        label: "Soft exit",
        content:
          "Could we leave it this way - I'd like to meet you, and if I'm in your neighbourhood over the next few months, I'd like to drop in and say hello. If you have a few moments at that time, I'll be glad to share what I have in mind.",
      },
    ],
    watchOut:
      "Use this last - the moment you drop the time ask, you're handing the relationship back to passive nurture. Don't default to it.",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "let-me-think",
    title: "Let me think about it",
    family: "cost-of-delay",
    framework: "A",
    trigger: "Post-pitch ambiguous objection - could mean four different things.",
    approach:
      "Run full ARQ. 'Let me think' can mean (1) the offer itself, (2) timing, (3) trust in you, or (4) needing to consult someone. Each needs a different response.",
    scripts: [
      {
        label: "ARQ diagnostic",
        content:
          "Totally fair - and I want to make sure I'm not the reason you're hesitating. Is the part you want to think about the offer itself, the timing, or whether I'm the right person to do it with?",
      },
      {
        label: "Iceberg-style probe (Day 40 next-60-days)",
        content:
          "Got it. Is it the premium, the commitment, needing to talk to someone, or a hidden concern? Genuinely no wrong answer - I just want to address the right thing.",
      },
    ],
    source: { day: "Day 40 (next-60-days) — Objection Turnaround", path: "/learning-track/next-60-days/day/40" },
  },
  // ----------------------------------------------------------------------
  // Revamped from the legacy seeded objections database (objection_entries
  // table). Each entry rewritten to fit one of the 3 ARQ frameworks. Bad
  // patterns from the originals (preachy education-dump, salesy reframes,
  // fear-mongering stats) have been removed.
  // ----------------------------------------------------------------------
  {
    id: "i-dont-believe-in-insurance",
    title: "I don't believe in insurance",
    family: "push-away",
    framework: "A",
    trigger:
      "Prospect dismisses the entire concept of insurance — usually rooted in a specific past experience or a generational view, not the actual product.",
    approach:
      "Run full ARQ. The objection is too vague to handle directly — surface the specific experience or belief underneath. Never argue the concept itself.",
    scripts: [
      {
        label: "Acknowledge + ARQ to surface the root",
        content:
          "Fair — and you wouldn't be the first. Quick one before I respond — what shaped that view? Was it a specific experience (someone in the family burned by a policy, a claim that got rejected), or more of a general feeling that the industry's rigged? I want to make sure I'm not arguing the wrong thing.",
      },
      {
        label: "Reframe (after they share)",
        content:
          "Got it — that makes sense given what you went through. So just to be clear, what I do is less about selling insurance and more about figuring out which parts of your money work for you and which don't. Sometimes the answer is a policy. Sometimes it's restructuring what you already pay. 30 minutes — Tuesday 7pm or Saturday 10am?",
      },
    ],
    watchOut:
      "Don't try to defend the industry. The belief is rarely about insurance itself — it's about a specific bad experience. Surface that, and the objection often dissolves.",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "im-too-young",
    title: "I'm too young to worry about this",
    family: "push-away",
    framework: "C",
    trigger:
      "Prospect uses age as the disqualifier — common from NSFs, fresh grads, and 20-somethings.",
    approach:
      "Boomerang. Young IS the qualifier — premiums lock at today's age and today's health, and the window closes quietly. Make the time-to-act point, then close.",
    scripts: [
      {
        label: "Boomerang version",
        content:
          "That's exactly why — premiums lock in at the age and health you sign at. The 25-year-old version of you can buy cover the 35-year-old version can't afford. The window is now, and it closes quietly. 20 minutes — Tuesday 7pm or Saturday 10am?",
      },
      {
        label: "Skip-Q stock response",
        content:
          "Honest answer — being young is the only reason this makes sense to even talk about. Premiums and underwriting both get harder fast. 20 minutes is all I'm asking for.",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "check-with-spouse",
    title: "Let me check with my spouse first",
    family: "cost-of-delay",
    framework: "A",
    trigger:
      "Post-pitch deferral — could be genuine (real partner-decision) or stall.",
    approach:
      "Run ARQ to surface which it is. If genuine, offer joint meeting so the partner hears it firsthand. If stall, isolate the real concern before they leave the room.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Fully respect that — these calls should be made together. Quick one so I don't get this wrong: is this a 'I want my partner in the room when we make the decision' or more of a 'I want to think it through with them first'? Both are fine, just changes what I do next.",
      },
      {
        label: "If 'partner in the room' — joint meeting close",
        content:
          "Perfect. The right move is to have your partner there from the start so you're not playing telephone with my answers. Weekday evening or Saturday morning easier for both of you?",
      },
      {
        label: "If 'think it through first' — isolate the concern",
        content:
          "Got it. If you had to bet on what they'll push back on — premium, commitment, or whether I'm the right person — what would it be? Easier if I address it now so you go home with a real answer rather than 'the agent will follow up.'",
      },
    ],
    source: { day: "Day 40 (next-60-days) — Objection Turnaround", path: "/learning-track/next-60-days/day/40" },
  },
  {
    id: "too-expensive",
    title: "It's too expensive",
    family: "cost-of-delay",
    framework: "A",
    trigger:
      "Pricing pushback — could be sticker shock, value mismatch, or genuine cash-flow constraint.",
    approach:
      "ARQ first to find out which one. 'Compared to what?' surfaces the real concern in one move. Avoid '$10/day = 2 coffees' reframes — they sound like sales tricks and don't answer the real question.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Fair feedback. Quick one — when you say expensive, is it expensive vs your monthly budget, or expensive vs what you thought protection would cost? Different problem each way and I'd hate to fix the wrong one.",
      },
      {
        label: "If budget-tight — restructure",
        content:
          "Got it. Then let's not look at this plan — let's look at your budget first and reverse-engineer what protection actually fits in. Better to have $80/month of the right thing than $300/month of the wrong thing. 20 minutes to map it?",
      },
      {
        label: "If perception — show the numbers",
        content:
          "Fair — and I'd rather show you the math than argue about it. The illustration shows exactly where every dollar goes. Tuesday 7pm or Saturday 10am to walk through it?",
      },
    ],
    watchOut:
      "Avoid the '$10/day = 2 coffees' reframe. It sounds glib and skips ARQ entirely. Find out which kind of 'expensive' it is first.",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "may-never-use",
    title: "Why pay for something I may never use?",
    family: "push-away",
    framework: "A",
    trigger:
      "Prospect framing insurance as a wager rather than a hedge.",
    approach:
      "ARQ. The objection assumes insurance is gambling. Surface what they think 'using it' means — almost always 'making a claim' — then reframe to protection-of-savings.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Fair point — and I want to make sure I respond to what you actually mean. When you say 'use it,' are you thinking about making a claim — like a hospital stay or a critical illness payout? Or more like getting some kind of money back?",
      },
      {
        label: "Reframe (after they answer)",
        content:
          "Got it. The way I think about it — you're not paying so something happens. You're paying so that IF something happens, your savings, your home, and your family's lifestyle don't get drained to fix it. The hope is you never claim. The reason it's worth it is because the alternative is paying out of pocket. 20 minutes to map what that looks like for your situation?",
      },
    ],
    watchOut:
      "Don't lead with cancer or hospitalisation stats. Fear-mongering reframes feel manipulative and undo the rapport you just built.",
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "insurance-just-wants-money",
    title: "Insurance companies just want my money",
    family: "push-away",
    framework: "A",
    trigger:
      "Industry-level skepticism — usually based on a specific story or general 'big corporation' frame.",
    approach:
      "ARQ to surface the source. Don't defend the industry. Acknowledge there are reasons that view exists, then show how you personally work differently.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Honestly — fair, and the industry's earned some of that. Quick one before I respond: is that based on something specific (a claim that got denied, an agent that vanished, a friend's bad experience), or more of a general feeling? Want to make sure I'm not defending against the wrong thing.",
      },
      {
        label: "Reframe (after they share)",
        content:
          "Got it. Here's how I work — I don't pitch products on the first meeting. I show you what you've already got, where the gaps are, and what to do with what you already pay. If you walk away saying 'no thanks,' I haven't lost anything — I'd rather you trust me later than oversell you now. 30 minutes — worth it?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "friend-bad-claim",
    title: "My friend had a terrible claims experience",
    family: "push-away",
    framework: "B",
    trigger:
      "Story-based objection — emotional weight from someone close to the prospect.",
    approach:
      "Feel-Felt-Found. Never dismiss the friend's experience. Acknowledge it can happen, then reframe to how YOUR role prevents the common causes (bad disclosure, bad documentation, no one in their corner).",
    scripts: [
      {
        label: "Feel-Felt-Found",
        content:
          "(Feel) I'm sorry — that sounds rough, and it sticks with you when it's someone close. (Felt) A handful of my clients walked in with the exact same story. (Found) What they found was that the difference between a clean claim and a denied one is almost always the prep — disclosure at sign-up, the documentation, having someone in their corner when the assessor pushes back. That's the thing I do that the friend's advisor probably didn't. So less about 'will the company pay,' more about 'will I make sure you get paid.' 30 minutes to walk you through how that works?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "burned-by-agent",
    title: "I've been burned by an agent before",
    family: "have-advisor",
    framework: "B",
    trigger:
      "Personal bad experience with a previous advisor — emotional, requires empathy frame.",
    approach:
      "Feel-Felt-Found. Don't promise you're different — show it through how you frame the next step (small, low-commitment, you do most of the listening).",
    scripts: [
      {
        label: "Feel-Felt-Found",
        content:
          "(Feel) Genuinely sorry. That experience makes you slow to trust again, and it should. (Felt) A few of my best clients came to me the same way — burned, cautious, expecting me to be like the last guy. (Found) What they found was that the way to rebuild trust is small. So I'm not asking you to commit to anything — I'm asking for 30 minutes where you do most of the talking, I take notes, and you decide afterwards if the next conversation's worth having. Earn it slow. Tuesday 7pm or Saturday 10am?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "next-year",
    title: "I'll do it next year",
    family: "cost-of-delay",
    framework: "C",
    trigger:
      "Procrastination framed as scheduling.",
    approach:
      "Boomerang. Next-year is a moving target — life adds new priorities every year. Make the cost concrete, then close on a small first step today.",
    scripts: [
      {
        label: "Boomerang",
        content:
          "Honestly — every client of mine who said 'next year' said the same thing the year after, and the year after that. Not because they're flaky, but because life adds new priorities every year. The smaller version of this — just hospitalisation, mostly MediSave-paid, zero cash out — locks the principle in now and we expand later. 20 minutes to set that up?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  {
    id: "wait-til-i-earn-more",
    title: "I'll wait until I earn more",
    family: "cost-of-delay",
    framework: "C",
    trigger:
      "Income-tied delay — assumes future-them will have more headroom.",
    approach:
      "Boomerang. Address lifestyle creep directly. Lock in the principle at low cost now, scale up as income grows.",
    scripts: [
      {
        label: "Boomerang",
        content:
          "That's exactly why now matters — income going up almost never means savings go up, because lifestyle goes up first. The clients I respect locked in the protection version while premiums were lowest, then added on as income grew. The reverse doesn't work — you can't undo a health condition you developed during the wait. 20 minutes to set the small version?",
      },
    ],
    source: { day: "Day 44 — Handling Resistance & Objections", path: "/learning-track/first-60-days/day/44" },
  },
  // ----------------------------------------------------------------------
  // Product-specific objections (post-pitch). These need product knowledge,
  // not pure ARQ — but they still slot into one of the 3 frameworks. Sourced
  // from Day 56 product sales tracks.
  // ----------------------------------------------------------------------
  {
    id: "ilp-high-charges",
    title: "ILPs have high charges",
    family: "product",
    framework: "A",
    trigger:
      "Pro-Achiever / ILP product objection — usually after the prospect read forum posts.",
    approach:
      "Acknowledge the charges are real. ARQ on what they're comparing against (DIY ETF vs another insurance plan). Reframe to total-cost-of-ownership — DIY skips the insurance + behavioural coaching they'd still need to buy.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Fair — the charges ARE there, I won't pretend otherwise. Quick one — are you comparing this against ETFs / robo-advisors, or against another insurance plan? Different conversation each way.",
      },
      {
        label: "Reframe (vs DIY ETF)",
        content:
          "Got it. Then let's actually compare apples to apples. The charges in an ILP cover three things: the insurance coverage built in, the fund management, and someone in your corner when markets crash. If you go DIY, you'd pay for term insurance separately (~$50-100/month), platform fees on the ETF, and you're on your own when markets drop 30%. When I add it up, the gap is much smaller than the headline charge suggests. Want me to walk through your specific case?",
      },
    ],
    watchOut:
      "Don't get into a fee-defending debate. The right answer is total-cost-of-ownership, not 'our fees are reasonable.'",
    source: { day: "Day 56 — Product Sales Tracks", path: "/learning-track/first-60-days/day/56" },
  },
  {
    id: "endowment-low-returns",
    title: "Endowment returns are too low",
    family: "product",
    framework: "A",
    trigger:
      "Smart Wealth Builder / endowment objection — comparing 2-3% returns to stock market returns.",
    approach:
      "ARQ on the goal first. Endowments aren't competing with the stock market — they're competing with bank savings for short-to-mid-term goals. Reframe to discipline and certainty.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Fair — and you're right that they don't compete with the stock market. Quick one — what's the money for? Wedding fund, house down payment, child's education, or general savings?",
      },
      {
        label: "Reframe (after they share goal)",
        content:
          "Got it. So this isn't actually a 'beat the market' decision — it's a 'will the money definitely be there when I need it' decision. Endowments win on certainty and on the discipline of forced saving. Stocks win on long-term growth but lose on the panic-sell problem. Different jobs. The right move is to use both — endowment for the goal you can't miss, stocks for the goal that can wait. Want to map which is which?",
      },
    ],
    source: { day: "Day 56 — Product Sales Tracks", path: "/learning-track/first-60-days/day/56" },
  },
  {
    id: "whole-life-too-expensive",
    title: "Whole life premium is too expensive vs term",
    family: "product",
    framework: "A",
    trigger:
      "GPP / whole life objection — comparing monthly premium against term.",
    approach:
      "Acknowledge the premium gap is real. ARQ on what 'covered' means to them (working years vs lifetime). Reframe to lifetime vs limited window — term ends, whole life doesn't, and most claims happen at 65+.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "True — whole life is more per month, no argument. Quick one before I respond: when you imagine 'covered,' do you mean covered through working years, or covered for life — including 65+ when most claims actually happen?",
      },
      {
        label: "Reframe (after they answer)",
        content:
          "Got it. So the trade-off is: term gives you the cheapest premium today but ends right when you're most likely to claim. Whole life is more per month but locks in cover at today's price for life and builds cash value you can borrow against. Most of my clients use BOTH — whole life for the lifetime base, term layered on for the high-responsibility years (kids, mortgage). 20 minutes to map the right mix for your situation?",
      },
    ],
    source: { day: "Day 56 — Product Sales Tracks", path: "/learning-track/first-60-days/day/56" },
  },
  {
    id: "term-no-cash-value",
    title: "Term insurance has no cash value",
    family: "product",
    framework: "A",
    trigger:
      "Term objection — prospect dislikes paying for protection that 'leaves nothing.'",
    approach:
      "Reframe term as pure protection. ARQ on whether they'll actually invest the difference (the BTIR question) — be honest. BTIR is mathematically right and behaviourally wrong for most people.",
    scripts: [
      {
        label: "Acknowledge + ARQ",
        content:
          "Correct — term is pure protection, no cash value. The case FOR it is 'Buy Term, Invest the Rest' — cheapest protection, you invest the savings separately. The honest question is: will you actually invest the difference every month, even when markets drop?",
      },
      {
        label: "Reframe (after they answer)",
        content:
          "If yes — term is the right call, you'll come out ahead. If no, or you're not sure — whole life forces the saving for you, and you'll thank yourself in 20 years. Which one sounds more like you?",
      },
    ],
    watchOut:
      "Don't sell BTIR as 'always better.' It's only better if the discipline is real. Match the product to the behaviour, not to the spreadsheet.",
    source: { day: "Day 56 — Product Sales Tracks", path: "/learning-track/first-60-days/day/56" },
  },
  {
    id: "medishield-only",
    title: "I have MediShield Life — why do I need a rider?",
    family: "product",
    framework: "C",
    trigger:
      "HealthShield / hospital plan objection — assumes basic government coverage is enough.",
    approach:
      "Boomerang. MediShield Life IS the reason a rider matters — the rider plugs the specific gap (private ward, $150K cap, large cancer treatments). Use specific numbers, not abstract claims.",
    scripts: [
      {
        label: "Boomerang + numbers",
        content:
          "That's exactly why this conversation matters — MediShield Life is great basic cover for B2/C ward stays with a $150K annual claim limit. The gap shows up the day you walk into a private ward or face a $300K+ cancer treatment. The rider exists specifically to plug that gap, mostly payable from MediSave so the cash impact is small. Want me to show you the actual numbers for your age band?",
      },
    ],
    source: { day: "Day 56 — Product Sales Tracks", path: "/learning-track/first-60-days/day/56" },
  },
];

export function objectionsByFramework(framework: ArqFramework): CuratedObjection[] {
  return CURATED_OBJECTIONS.filter((o) => o.framework === framework);
}

export function objectionsByFamily(family: CuratedObjection["family"]): CuratedObjection[] {
  return CURATED_OBJECTIONS.filter((o) => o.family === family);
}
