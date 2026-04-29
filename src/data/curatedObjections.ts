// Curriculum-anchored objection handling library.
// Mirrored from docs/first-60-days/week-8/day-44.md and the canonical ARQ
// database in Obsidian (Content/first-60-days/_source-scripts/arq-database.md).
// Each entry references its source-of-truth markdown file so the curriculum
// remains canonical - this constant is the rendering surface for /objections.

export type ArqFramework = "A" | "B" | "C" | "skip-q";

export interface CuratedObjection {
  id: string;
  title: string;
  family: "push-away" | "have-policies" | "have-advisor" | "format" | "cost-of-delay" | "format-recruitment";
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
];

export function objectionsByFramework(framework: ArqFramework): CuratedObjection[] {
  return CURATED_OBJECTIONS.filter((o) => o.framework === framework);
}

export function objectionsByFamily(family: CuratedObjection["family"]): CuratedObjection[] {
  return CURATED_OBJECTIONS.filter((o) => o.family === family);
}
