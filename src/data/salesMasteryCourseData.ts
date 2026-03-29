// ─── Sales Mastery Course Data ───────────────────────────────────────────────
// PWV Sales Mastery: The Pre-Retiree Flow Bible
// Compiled from 255 real meetings (Cynthia & Hsin-An), training sessions,
// Fireflies recordings, and Obsidian meeting notes.
// ─────────────────────────────────────────────────────────────────────────────

export interface SlideContent {
  heading: string;
  bullets: string[];
  /** Optional script/example quote to display */
  script?: string;
  /** Optional table data */
  table?: { headers: string[]; rows: string[][] };
}

export interface Lesson {
  id: string;
  title: string;
  /** Short description shown in lesson list */
  description: string;
  /** Estimated duration in minutes */
  durationMin: number;
  /** Full narration script for voiceover */
  narration: string;
  /** Slide-by-slide content for video generation */
  slides: SlideContent[];
  /** Key takeaways shown after video */
  keyTakeaways: string[];
  /** Real meeting examples referenced */
  realExamples?: string[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export const salesMasteryCourse: CourseModule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: THE GOLDEN FRAMEWORK
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m1-golden-framework",
    number: 1,
    title: "The Golden Framework",
    description: "Cynthia's signature 4-step retirement planning framework used in every opening appointment — the foundation of every successful PWV sale.",
    icon: "Crown",
    lessons: [
      {
        id: "m1-l1",
        title: "The 4-Step Retirement Planning Framework",
        description: "Learn the systematic approach used in 255+ real client meetings.",
        durationMin: 4,
        narration: `Welcome to the PWV Sales Mastery course. This is the foundation of everything — Cynthia's signature 4-step Golden Retirement Planning Framework, used in every single opening appointment across 255 real client meetings.

Step 1 is the Retirement Readiness Assessment. You establish the client's retirement age and desired monthly lifestyle cost. Then you calculate their CPF Life projected payout, map ALL income sources — rental, dividends, annuities, part-time work — and identify the income gap. That gap between desired lifestyle and passive income is where you create value. Always apply inflation adjustment at 2.5 to 3% annually.

Step 2 is Identify Redundant Assets. This is where you audit every insurance policy — premiums versus coverage versus cash value. You flag policies where cash value exceeds death benefit, because the client is overpaying. You calculate the true yield on endowment and whole life policies — which is often shockingly low at just 1 to 2%. You identify duplicate coverage across insurers and check nomination status on every policy.

Step 3 is Optimize Portfolio. Here you restructure redundant policies into income-generating assets. You consolidate fragmented portfolios under one advisor. Apply the dividend strategy targeting 6 to 7% yield with capital preservation. Phase contributions over 5 years using dollar cost averaging. Integrate CPF OA and SRS strategies for tax efficiency.

Step 4 is Execution and Review. This means in-meeting applications to remove all friction. You set up quarterly dividend reporting, schedule annual reviews, complete estate planning — will, LPA, AMD, nominations — and establish ongoing communication via WhatsApp group.

This framework gives you a clear, repeatable structure for every meeting. Memorize it. Own it. It's the backbone of every successful PWV conversation.`,
        slides: [
          {
            heading: "The Golden Retirement Planning Framework",
            bullets: [
              "Used in 255+ real client meetings",
              "4 systematic steps from discovery to execution",
              "Repeatable, proven, and adaptable to every client type",
            ],
          },
          {
            heading: "Step 1: Retirement Readiness Assessment",
            bullets: [
              "Establish retirement age + desired monthly lifestyle cost",
              "Calculate CPF Life projected payout",
              "Map ALL income sources (rental, dividends, annuities)",
              "Identify the income gap",
              "Apply inflation adjustment: 2.5-3% annually",
            ],
          },
          {
            heading: "Step 2: Identify Redundant Assets",
            bullets: [
              "Audit every insurance policy (premiums vs coverage vs cash value)",
              "Flag policies where cash value > death benefit (overpaying)",
              "Calculate true yield — often shockingly low (1-2%)",
              "Identify duplicate coverage across insurers",
              "Check nomination status on EVERY policy",
            ],
          },
          {
            heading: "Step 3: Optimize Portfolio",
            bullets: [
              "Restructure redundant policies into income-generating assets",
              "Consolidate fragmented portfolios under one advisor",
              "Target 6-7% dividend yield with capital preservation",
              "Phase contributions over 5 years (dollar cost averaging)",
              "Integrate CPF OA/SRS strategies for tax efficiency",
            ],
          },
          {
            heading: "Step 4: Execution & Review",
            bullets: [
              "In-meeting applications — remove ALL friction",
              "Set up quarterly dividend reporting",
              "Schedule annual reviews",
              "Complete estate planning (will, LPA, AMD, nominations)",
              "Establish WhatsApp group for ongoing communication",
            ],
          },
        ],
        keyTakeaways: [
          "The framework gives structure to every meeting",
          "Always start with the gap analysis — it creates urgency",
          "Redundant asset identification is your biggest value-add",
          "Execute everything in-meeting to minimize drop-off",
        ],
      },
      {
        id: "m1-l2",
        title: "Team Selling Methodology",
        description: "The two-consultant model that builds credibility and ensures continuity.",
        durationMin: 3,
        narration: `Cynthia operates a two-consultant model consistently across all her meetings. Understanding this methodology will help you replicate her success.

Here's how the roles are defined. Cynthia leads opening conversations, builds rapport, handles servicing relationships, and covers estate planning. Sing An handles risk profiling, number crunching, investment strategy, and CPF technical details.

Both are introduced as "retirement planning specialists" at the meeting start. Cynthia opens with warmth and personal conversation. Sing An takes over for CPF analysis and product comparisons. Then Cynthia closes with estate planning discussion and next steps. Both are available via WhatsApp group, so the client always has a backup.

Why does two consultants work? First, credibility — two experts reinforce each other's points. Second, continuity — if one is unavailable, the other maintains the relationship. Third, specialization — different strengths cover more ground. Fourth, note-taking — one can observe while the other presents. Fifth, comfort — clients feel they have a team, not just an individual.

Here's the positioning script you should use: "I work with my partner — we're a team specializing in retirement planning for pre-retirees. I focus on your overall financial health and estate planning, while my partner handles the investment strategies and CPF optimization. Together, we make sure nothing falls through the cracks."

Even if you're working solo, you can adapt this by bringing in a specialist for specific parts of the conversation, or by referencing your team's expertise.`,
        slides: [
          {
            heading: "Team Selling Methodology",
            bullets: [
              "Two-consultant model used in every meeting",
              "Builds credibility, ensures continuity",
              "Different strengths cover more ground",
            ],
          },
          {
            heading: "Role Definition",
            bullets: [
              "Lead Consultant: Rapport, servicing, estate planning, closing",
              "Technical Consultant: Risk profiling, CPF analysis, investment strategy",
              "Both introduced as 'retirement planning specialists'",
              "Both available via WhatsApp group",
            ],
          },
          {
            heading: "Why Two Consultants Works",
            bullets: [
              "Credibility: Two experts reinforce each other",
              "Continuity: Backup if one is unavailable",
              "Specialization: Different strengths cover more ground",
              "Observation: One watches while the other presents",
              "Comfort: Clients feel they have a team",
            ],
          },
          {
            heading: "The Positioning Script",
            bullets: [],
            script: '"I work with my partner — we\'re a team specializing in retirement planning for pre-retirees. I focus on your overall financial health and estate planning, while my partner handles the investment strategies and CPF optimization. Together, we make sure nothing falls through the cracks."',
          },
        ],
        keyTakeaways: [
          "Two consultants build more trust than one",
          "Define clear roles before every meeting",
          "Always introduce both as specialists, not assistants",
          "WhatsApp group ensures client always has a contact",
        ],
      },
      {
        id: "m1-l3",
        title: "DISC Personality Profiling for Pre-Retirees",
        description: "Adapt your selling approach based on client personality types.",
        durationMin: 4,
        narration: `Every client is different. The DISC personality profiling framework helps you adapt your approach in the first 5 minutes of conversation.

D-Profile, the Dominant type. These clients are direct, decisive, results-oriented, and impatient. Get to the point quickly. Lead with outcomes and numbers. Don't waste time on small talk. Your script: "Here's the bottom line: you have a $2,600 monthly gap. Here's how we close it." Avoid long-winded explanations or emotional appeals.

I-Profile, the Influential type. Enthusiastic, sociable, optimistic, sometimes impulsive. Build rapport first. Use stories and testimonials. Make it exciting. Your script: "I had a client just like you — she was so thrilled when she saw her first dividend statement..." Avoid drowning them in data or being too serious.

S-Profile, the Steady type. This is the most common among pre-retirees — plan for 3 to 4 meetings with them. They're patient, loyal, risk-averse, and slow decision-makers. Be patient. Give them time. Don't pressure. Your script: "Take your time to think about this. I'll send you a summary and we can revisit whenever you're comfortable." Never push for immediate decisions.

C-Profile, the Conscientious type. Analytical, detail-oriented, skeptical, they need data. Come prepared with comparisons and spreadsheets. Answer every question thoroughly. Your script: "I've prepared a detailed comparison of three insurer fee structures over 15 years. Let me walk you through the numbers." They need both emotional acknowledgment AND logical arguments.

Key insight: For couples, each partner may be a different profile — adapt to both. Never label clients openly. This is your internal framework for guiding the conversation.`,
        slides: [
          {
            heading: "DISC Personality Profiling",
            bullets: [
              "Identify the profile within the first 5 minutes",
              "Adapt your pitch style to match",
              "Most pre-retirees are S-Profile (plan for 3-4 meetings)",
              "For couples: each partner may be different — adapt to both",
            ],
          },
          {
            heading: "D-Profile: The Dominant",
            bullets: [
              "Direct, decisive, results-oriented, impatient",
              "Get to the point quickly — lead with numbers",
              "Avoid: long explanations, emotional appeals",
            ],
            script: '"Here\'s the bottom line: you have a $2,600 monthly gap. Here\'s how we close it."',
          },
          {
            heading: "I-Profile: The Influential",
            bullets: [
              "Enthusiastic, sociable, optimistic",
              "Build rapport first — use stories and testimonials",
              "Avoid: drowning in data, being too serious",
            ],
            script: '"I had a client just like you — she was so thrilled when she saw her first dividend statement..."',
          },
          {
            heading: "S-Profile: The Steady (Most Common)",
            bullets: [
              "Patient, loyal, risk-averse, slow decision-makers",
              "Be patient — don't pressure for immediate decisions",
              "Plan for 3-4 meetings to close",
              "Avoid: aggressive selling, frequent plan changes",
            ],
            script: '"Take your time to think about this. I\'ll send you a summary and we can revisit whenever you\'re comfortable."',
          },
          {
            heading: "C-Profile: The Conscientious",
            bullets: [
              "Analytical, detail-oriented, skeptical, needs data",
              "Come prepared with comparisons and spreadsheets",
              "They need emotional acknowledgment AND logical arguments",
            ],
            script: '"I\'ve prepared a detailed comparison of three insurer fee structures over 15 years. Let me walk you through the numbers."',
          },
        ],
        keyTakeaways: [
          "S-profiles are most common among pre-retirees",
          "Identify the profile within 5 minutes",
          "Never label clients openly — this is internal",
          "Couples often have different profiles — adapt to both",
        ],
      },
      {
        id: "m1-l4",
        title: "The Sales Arc: Meeting Flow Overview",
        description: "The typical 3-4 meeting cycle from first call to close.",
        durationMin: 3,
        narration: `Before we dive into each meeting type, let's understand the full sales arc. The typical PWV sale follows a 3 to 4 meeting cycle.

It starts with the AFF Call — just 3 minutes. Qualify, screen, schedule. This filters time-wasters before you invest meeting time.

Meeting 1 is the Opening Appointment, lasting 45 to 60 minutes. You build rapport, introduce the framework, run discovery, educate on CPF, do the gap analysis, and set next steps.

Meeting 2 is the Proposal Meeting, 60 to 90 minutes. You recap findings, do a full portfolio review, present your solution, show fee transparency, run comparisons, and discuss next steps.

Meeting 3 is the Closing, 30 to 60 minutes. Address remaining concerns, complete the application, process payment, handle nominations, and introduce estate planning.

Meeting 4 is Servicing, 30 to 45 minutes. Confirm setup, provide tech support, discuss additional services, and request referrals.

Now here's what the data shows about timing. Same-meeting closes happen — clients like Ravi and Lisa closed in Meeting 1. Quick closes take 2 meetings over 4 to 7 days. Standard closes take 3 to 4 meetings over 2 to 4 weeks. Extended closings with S-profile or C-profile clients can take 4 to 6 meetings over 1 to 3 months.

The key insight: don't rush the process, but don't let momentum die either. Ideally, meetings should be 7 to 10 days apart. More than 2 weeks between meetings and you lose urgency.`,
        slides: [
          {
            heading: "The Sales Arc: 3-4 Meeting Cycle",
            bullets: [
              "AFF Call (3 min) → Opening (45-60 min) → Proposal (60-90 min) → Close (30-60 min)",
              "Optional Meeting 4: Servicing (30-45 min)",
              "Ideal spacing: 7-10 days between meetings",
            ],
          },
          {
            heading: "Meeting Flow Summary",
            bullets: [],
            table: {
              headers: ["Stage", "Duration", "Key Activities"],
              rows: [
                ["AFF Call", "3 min", "Qualify, screen, schedule"],
                ["Opening", "45-60 min", "Rapport, framework, CPF, gap analysis"],
                ["Proposal", "60-90 min", "Portfolio review, solution, fees, comparisons"],
                ["Close", "30-60 min", "Address concerns, application, payment, nominations"],
                ["Servicing", "30-45 min", "Confirm setup, tech support, referrals"],
              ],
            },
          },
          {
            heading: "Timing Insights from Real Data",
            bullets: [],
            table: {
              headers: ["Client Type", "Meetings", "Calendar Days"],
              rows: [
                ["Same-meeting close", "1", "Same day"],
                ["Quick close", "2", "4-7 days"],
                ["Standard close", "3-4", "2-4 weeks"],
                ["Extended (S/C profile)", "4-6", "1-3 months"],
              ],
            },
          },
          {
            heading: "Critical Timing Rules",
            bullets: [
              "7-10 days between meetings is ideal",
              "More than 2 weeks = urgency dies",
              "Schedule Meeting 2 BEFORE ending Meeting 1",
              "Don't rush S-profiles — but don't disappear either",
            ],
          },
        ],
        keyTakeaways: [
          "The sales arc is a proven 3-4 meeting cycle",
          "Always schedule the next meeting before ending the current one",
          "7-10 days between meetings preserves momentum",
          "Some clients close in Meeting 1 — be ready for that too",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: THE AFF CALL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m2-aff-call",
    number: 2,
    title: "The AFF Call",
    description: "Pre-appointment filtering in 3 minutes — qualify leads, set expectations, and schedule meetings with serious prospects only.",
    icon: "Phone",
    lessons: [
      {
        id: "m2-l1",
        title: "AFF Call Structure & Scripts",
        description: "The 3-minute call framework: Ask, Find, Follow.",
        durationMin: 4,
        narration: `The AFF Call happens before the first meeting. Its sole purpose is to filter out time-wasters, warm up serious prospects, and set expectations. AFF stands for Ask, Find, Follow.

The golden rule: during AFF calls, screen ONLY. Do NOT present products. There's a strict presentation ban during AFF calls — save that for in-person.

Here's the call structure, 3 minutes maximum. Open with: "Hi [name], this is [your name] from AIA. I noticed you opted in for our retirement planning assessment. I have about 3 minutes — just wanted to understand what motivated you to sign up?"

Then use two engagement hooks. First: "Are you aware of how CPF top-ups can maximize your retirement income?" Second: "Did you know most people overpay for insurance by $2,000 to $5,000 per year?"

Now the qualifying questions. "What motivated you to opt in?" — this reveals urgency level. "What would you do with the money saved?" — this reveals values. "On a scale of 1 to 10, how willing are you to take action on improving your finances?" And critically: "Is there anyone else involved in your financial decisions?" — this identifies decision-makers early.

For scheduling, have specific date and time options ready: "Would Tuesday 3pm or Thursday 6pm work better?" Use calendar invites — they improve attendance by 20 to 30%. The optimal calling windows are 3 to 4 PM and 6 to 7 PM.

If a prospect goes unresponsive, use the breakup call: "Hi [name], just wondering if you've had a chance to think things through. Would you like us to continue following up, or would you prefer we stop for now?"`,
        slides: [
          {
            heading: "The AFF Call: Ask, Find, Follow",
            bullets: [
              "3 minutes maximum — screen ONLY",
              "Do NOT present products during AFF calls",
              "Goal: determine if prospect is worth a face-to-face meeting",
              "Optimal calling windows: 3-4 PM and 6-7 PM",
            ],
          },
          {
            heading: "Opening Script",
            bullets: [],
            script: '"Hi [name], this is [your name] from AIA. I noticed you opted in for our retirement planning assessment. I have about 3 minutes — just wanted to understand what motivated you to sign up?"',
          },
          {
            heading: "Qualifying Questions",
            bullets: [
              '"What motivated you to opt in?" → reveals urgency',
              '"What would you do with the money saved?" → reveals values',
              '"On a scale of 1-10, how willing are you to take action?" → commitment level',
              '"Is there anyone else involved in financial decisions?" → identifies decision-makers',
            ],
          },
          {
            heading: "Scheduling & Follow-Up",
            bullets: [
              "Have specific date/time options ready (either/or, not open-ended)",
              "Calendar invites improve attendance by 20-30%",
              "Let clients propose dates when possible (reduces no-shows)",
              "Schedule multiple meetings in advance (10 days apart)",
            ],
          },
          {
            heading: "The Breakup Call",
            bullets: [],
            script: '"Hi [name], just wondering if you\'ve had a chance to think things through. Would you like us to continue following up, or would you prefer we stop for now?"',
          },
        ],
        keyTakeaways: [
          "AFF calls are 3 minutes — screen only, never sell",
          "Use either/or scheduling, not open-ended questions",
          "The breakup call creates urgency through withdrawal",
          "Calendar invites boost attendance 20-30%",
        ],
      },
      {
        id: "m2-l2",
        title: "Lead Quality & Pipeline Management",
        description: "How to assess lead quality and manage your pipeline efficiently.",
        durationMin: 3,
        narration: `Not all leads are equal. From the SAPT Level 5 training, there's a critical insight: if only 5 appointments result from 50 leads after qualification, that indicates a pipeline issue rather than an AFF execution problem. Fix the lead source, not the script.

Here's Don's coaching rules for calls. First, your firmness scale should aim for 5 to 6 out of 10. Most advisors are at 3 to 4 — too soft. You need to be warm but direct.

Second, schedule multiple meetings in advance, ideally 10 days apart, to reduce no-shows. Third, use DISC profiling even on calls — you can start reading personality within the first 30 seconds.

Fourth, let clients propose meeting dates when possible — this psychologically reduces no-shows because they feel ownership. Fifth, send post-meeting summary texts with action items.

For the calling routine, daily calling is non-negotiable. Time-block your calls. Maintain consistent effort to overcome anxiety and improve success rates. Call first, then text AND send a voice memo if no answer. Use empathetic re-engagement messages for MIA clients.

The lead categories from the Yakun voucher campaigns target 40 to 60 year olds for retirement readiness. Proper CRM staging and follow-ups improve conversion rates dramatically. Categorize leads as Hot (responded within 24 hours, scored 8 or above on willingness), Warm (responded within a week, scored 5 to 7), and Cold (no response after 3 attempts).

Remember: your time is your most valuable asset. Spend it on prospects who are ready to act.`,
        slides: [
          {
            heading: "Lead Quality Assessment",
            bullets: [
              "5 appointments from 50 leads = pipeline issue, not AFF issue",
              "Fix the lead source, not the script",
              "Categorize: Hot / Warm / Cold based on response + willingness score",
            ],
          },
          {
            heading: "Don's Coaching Rules for Calls",
            bullets: [
              "Firmness scale: aim for 5-6/10 (most advisors are too soft at 3-4)",
              "Schedule multiple meetings in advance (10 days apart)",
              "Use DISC profiling even on calls",
              "Let clients propose dates (reduces no-shows)",
              "Post-meeting summary texts with action items",
            ],
          },
          {
            heading: "Daily Calling Routine",
            bullets: [
              "Daily calling is non-negotiable",
              "Time-block your call sessions",
              "Call first → text → voice memo if no answer",
              "Empathetic re-engagement for MIA clients",
              "Use promotional deadlines as commitment tools",
            ],
          },
          {
            heading: "Lead Categorization",
            bullets: [],
            table: {
              headers: ["Category", "Response Time", "Willingness Score", "Action"],
              rows: [
                ["Hot", "Within 24 hours", "8-10", "Schedule Meeting 1 immediately"],
                ["Warm", "Within 1 week", "5-7", "Follow up with value content"],
                ["Cold", "No response x3", "Unknown", "Breakup call, then archive"],
              ],
            },
          },
        ],
        keyTakeaways: [
          "Low appointment rates = fix the source, not the script",
          "Daily calling is non-negotiable for pipeline health",
          "Be firmer than you think — aim 5-6 out of 10",
          "Categorize leads and spend time proportionally",
        ],
      },
      {
        id: "m2-l3",
        title: "Overcoming Call Anxiety",
        description: "Practical techniques to build confidence and persistence on calls.",
        durationMin: 3,
        narration: `Let's address the elephant in the room — call anxiety. Every advisor experiences it, especially early in their career. Here's how to overcome it.

First, believe in the value of your service. You are not selling — you are helping people avoid financial disaster in retirement. From the training sessions, Cynthia's team emphasizes that clients NEED this help. Most people overpay for insurance by 2 to 5 thousand dollars per year. Most have gaps in their retirement planning they don't even know about. You are doing them a service by calling.

Second, reframe rejection. A "no" is not personal — it's situational. The prospect might be busy, might not be ready, or might not be the right fit. Every "no" gets you closer to a "yes."

Third, use the "soft ultimatum" technique for non-responsive prospects. The framing is: "Don't want to bother you." Send a message saying: "Hi [name], I understand you're busy. I don't want to keep bothering you — would you like me to stop reaching out, or shall we find a time that works?" Give a same-day response deadline. This creates urgency through the threat of withdrawal.

Fourth, build momentum through consistency. The first 3 calls of the day are the hardest. After that, you get into a flow state. That's why time-blocking is essential — make all your calls in one focused session.

Fifth, mini check-in calls between formal meetings. These 10 to 15 minute casual calls maintain the relationship without the pressure of a full meeting. Ask about their weekend, their grandchildren, their health. This builds the personal connection that makes closing natural.

Remember: the person who makes 50 calls with average skill will always outperform the person who makes 5 calls with perfect skill.`,
        slides: [
          {
            heading: "Overcoming Call Anxiety",
            bullets: [
              "Every advisor experiences it — it's normal",
              "The cure is consistent action, not perfect technique",
              "50 average calls > 5 perfect calls",
            ],
          },
          {
            heading: "Reframe Your Mindset",
            bullets: [
              "You are not selling — you are helping",
              "Most people overpay for insurance by $2-5K/year",
              "Most have retirement gaps they don't know about",
              "A 'no' is situational, not personal",
              "Every call is practice for the one that converts",
            ],
          },
          {
            heading: "The Soft Ultimatum Technique",
            bullets: [],
            script: '"Hi [name], I understand you\'re busy. I don\'t want to keep bothering you — would you like me to stop reaching out, or shall we find a time that works?"',
          },
          {
            heading: "Building Momentum",
            bullets: [
              "First 3 calls are hardest — push through to flow state",
              "Time-block all calls into one focused session",
              "Mini check-in calls (10-15 min) between formal meetings",
              "Ask about their life, not just finances",
              "Consistency > perfection, always",
            ],
          },
        ],
        keyTakeaways: [
          "You are helping, not selling",
          "The soft ultimatum creates urgency through withdrawal",
          "First 3 calls are hardest — momentum builds after",
          "Volume beats perfection every time",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: THE OPENING APPOINTMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m3-opening",
    number: 3,
    title: "The Opening Appointment",
    description: "The 7-phase opening meeting that builds trust, educates, and creates urgency — from rapport to gap analysis.",
    icon: "DoorOpen",
    lessons: [
      {
        id: "m3-l1",
        title: "Pre-Meeting Preparation",
        description: "Everything you need to prepare before walking in.",
        durationMin: 3,
        narration: `Preparation is what separates professionals from amateurs. Before every opening appointment, here's your checklist.

Research the client's CPF balances if possible — ask them to screenshot their CPF statement beforehand. Prepare your portfolio summary template. If meeting face-to-face, bring a small gift — Cynthia often brings Japanese melon or personal finance books for the client's children. These small touches create disproportionate goodwill.

Have 2 to 3 time slot options ready for the follow-up meeting. Prepare a sample case study matching the client's approximate profile — you'll use this before getting personal to show how the framework works. Bring a calculator or laptop for live projections.

If you're using the two-consultant model, ensure both team members are briefed on roles before the meeting. Discuss who leads which section and any specific concerns about this particular client.

Most importantly, prepare your intent statement. This should be under 30 seconds. Here's the template from SAPT Level 5 training: "I've spent [X] years specializing in retirement planning for pre-retirees and retirees. My clients typically save $3-5K per year in unnecessary premiums and generate 6-7% passive income from their existing resources. I highlight both opportunities and comprehensive portfolio gaps transparently. Today, I'd like to understand your situation and see if there's value I can add."

This positions you as a specialist, sets expectations, and removes the hard-sell pressure immediately.`,
        slides: [
          {
            heading: "Pre-Meeting Preparation Checklist",
            bullets: [
              "Research client CPF balances (ask for screenshot)",
              "Prepare portfolio summary template",
              "Bring a small gift (Japanese melon, finance books for children)",
              "Have 2-3 follow-up time slots ready",
              "Prepare sample case study matching client profile",
              "Calculator/laptop for live projections",
              "Brief both team members on roles",
            ],
          },
          {
            heading: "The Intent Statement (Under 30 Seconds)",
            bullets: [],
            script: '"I\'ve spent [X] years specializing in retirement planning for pre-retirees and retirees. My clients typically save $3-5K per year in unnecessary premiums and generate 6-7% passive income from their existing resources. I highlight both opportunities and comprehensive portfolio gaps transparently. Today, I\'d like to understand your situation and see if there\'s value I can add."',
          },
          {
            heading: "Why Preparation Matters",
            bullets: [
              "Small gifts create disproportionate goodwill",
              "Case studies before personal data reduce client anxiety",
              "Intent statement removes hard-sell pressure",
              "Prepared advisors close 2-3x more than unprepared ones",
            ],
          },
        ],
        keyTakeaways: [
          "Always have your intent statement memorized",
          "Small gifts build massive rapport",
          "Use case studies before asking for personal data",
          "Prepare both team members on roles",
        ],
      },
      {
        id: "m3-l2",
        title: "Phase 1-2: Rapport Building & Framework Introduction",
        description: "The first 15 minutes that set the tone for everything.",
        durationMin: 4,
        narration: `The first 15 minutes of your opening appointment set the tone for the entire relationship. Get this right and everything else flows naturally.

Phase 1 is Rapport Building, lasting 5 to 10 minutes. Start with personal conversation — family, travel plans, hobbies, health. Ask about their retirement vision: "What does your ideal retirement look like?" Understand their primary concern, which is usually one of these four: running out of money, healthcare costs, leaving something for children, or not being a burden to family.

Use the FORM framework: Family, Occupation, Recreation, Money. If meeting face-to-face, observe their home or office for conversation starters — photos, awards, hobbies visible in the room. These observations give you natural talking points and show genuine interest.

Phase 2 is Framework Introduction, lasting about 5 minutes. Present the Golden Retirement Planning Framework we covered in Module 1. Explain: "We specialize in helping pre-retirees optimize their retirement income." Position the meeting as no-obligation: "There's absolutely no obligation to proceed with any recommendations."

Show the portfolio summary tool and explain its 4 benefits. Then — and this is crucial — use a sample case study BEFORE getting personal. Say: "Let me show you how this works with a typical client similar to you." This does two things: it demonstrates value without the client feeling exposed, and it sets expectations for what you'll discuss.

From the real meetings, Cynthia always establishes this frame early: "Quality financial advice depends on the quality of information provided. The more I understand your situation, the better my recommendations will be." This legitimizes all the questions you're about to ask in the discovery phase.`,
        slides: [
          {
            heading: "Phase 1: Rapport Building (5-10 min)",
            bullets: [
              'Ask: "What does your ideal retirement look like?"',
              "Use FORM: Family, Occupation, Recreation, Money",
              "Identify primary concern (money, healthcare, legacy, burden)",
              "If face-to-face: observe surroundings for conversation starters",
            ],
          },
          {
            heading: "Phase 2: Framework Introduction (5 min)",
            bullets: [
              "Present the Golden Retirement Planning Framework",
              'Position as no-obligation: "No obligation to proceed"',
              "Show portfolio summary tool with 4 benefits",
              "Use a sample case study BEFORE getting personal",
            ],
          },
          {
            heading: "The Discovery Bridge Script",
            bullets: [],
            script: '"Quality financial advice depends on the quality of information provided. The more I understand your situation, the better my recommendations will be."',
          },
          {
            heading: "Common Retirement Concerns",
            bullets: [
              "Running out of money (most common)",
              "Healthcare costs overwhelming savings",
              "Not leaving enough for children/grandchildren",
              "Becoming a financial burden to family",
            ],
          },
        ],
        keyTakeaways: [
          "First 15 minutes determine the relationship trajectory",
          "FORM framework structures natural conversation",
          "Case studies before personal data reduce anxiety",
          "Position everything as no-obligation",
        ],
        realExamples: [
          "Ms Then Ai Huong: Mortgage and caregiving concerns led discussion",
          "Arthur Chang: Semi-retired, entered through portfolio review",
        ],
      },
      {
        id: "m3-l3",
        title: "Phase 3: The Discovery Deep Dive",
        description: "The 16-point information gathering that powers your entire proposal.",
        durationMin: 4,
        narration: `Phase 3 is Discovery, lasting 15 to 20 minutes. This is where you gather everything you need to build a compelling proposal. Miss anything here and your proposal will have gaps.

Here's the complete discovery checklist — 16 data points you must collect. Age, date of birth, and retirement target age. Monthly income, both gross and net, plus bonus structure. Monthly expenses, fixed and variable. CPF balances across all accounts — OA, SA, MA, RA — and ask for a screenshot.

Properties: own or rent, mortgage balance, remaining tenure, rental income. Existing insurance policies across ALL insurers — use SingPass retrieval for a comprehensive view. Investments: stocks, bonds, unit trusts, fixed deposits, ETFs. SRS account and balance.

Endowment plans with maturity dates and amounts. Estate planning status: will, LPA, AMD, nominations. Family situation: spouse income and assets, children's ages, dependents. Desired retirement monthly income. Risk appetite on a 1 to 10 scale or using conservative, moderate, adventurous categories.

Previous investment experience, both good and bad. Who makes financial decisions in the household. And health conditions that may affect underwriting.

The key script for this phase is: "Quality financial advice depends on the quality of information provided. The more I understand your situation, the better my recommendations will be."

From real meetings, Cynthia always offers to help create portal accounts and retrieve policies via SingPass right there in the meeting. This removes the friction of "I'll send you my policies later" — which rarely happens.`,
        slides: [
          {
            heading: "Phase 3: Discovery Deep Dive (15-20 min)",
            bullets: [
              "16 data points to collect — miss nothing",
              "Use SingPass policy retrieval in-meeting",
              "Quality of advice = quality of information gathered",
            ],
          },
          {
            heading: "Discovery Checklist (Part 1)",
            bullets: [
              "Age, DOB, retirement target age",
              "Monthly income (gross + net) + bonus structure",
              "Monthly expenses (fixed + variable)",
              "CPF balances (OA, SA, MA, RA) — screenshot",
              "Properties: own/rent, mortgage, tenure, rental income",
              "ALL insurance policies across ALL insurers",
              "Investments: stocks, bonds, UTs, FDs, ETFs",
              "SRS account and balance",
            ],
          },
          {
            heading: "Discovery Checklist (Part 2)",
            bullets: [
              "Endowment plans + maturity dates + amounts",
              "Estate planning status (will, LPA, AMD, nominations)",
              "Family: spouse income/assets, children ages, dependents",
              "Desired retirement monthly income",
              "Risk appetite (1-10 or conservative/moderate/adventurous)",
              "Previous investment experience (good AND bad)",
              "Who makes financial decisions in household",
              "Health conditions affecting underwriting",
            ],
          },
          {
            heading: "Pro Tips",
            bullets: [
              "Offer SingPass policy retrieval IN the meeting",
              "Ask for CPF screenshot before the meeting",
              'Bridge: "The more I understand, the better my advice"',
              "Set up WhatsApp group during discovery",
            ],
          },
        ],
        keyTakeaways: [
          "16 data points — have the checklist memorized",
          "Do SingPass retrieval in-meeting to avoid follow-up friction",
          "Always identify who makes financial decisions",
          "Previous bad experiences reveal objections you'll need to handle",
        ],
      },
      {
        id: "m3-l4",
        title: "Phase 4: CPF Education",
        description: "The 10-minute CPF lesson that opens clients' eyes.",
        durationMin: 4,
        narration: `Phase 4 is CPF Education, lasting about 10 minutes. Most clients have a vague understanding of CPF, and this education segment positions you as the expert while creating urgency.

Here are the key teaching points. First, account transformation at age 55: OA plus SA combines into the Retirement Account. Explain the three levels — Full Retirement Sum, Basic Retirement Sum, and Enhanced Retirement Sum — with actual payout numbers, not just percentages.

Second, CPF Life options. There are three schemes: Basic, which gives more bequest to family but lower monthly payouts; Standard, which gives higher monthly payouts; and Escalating, which starts lower but increases over time. Show the actual payout amounts.

Third — and this is the critical fact that changes everything — "After age 81, remaining capital goes to the CPF pool, not your family." This single fact shocks most clients and creates immediate urgency. They realize that CPF Life is an annuity, not a savings account. The money they put in may not come back to their heirs.

Fourth, for women specifically, mention that females receive slightly higher CPF Life payouts due to longevity tables. This shows your detailed knowledge and builds trust.

Fifth, if applicable, discuss the property pledging option, which allows clients to keep less in their Retirement Account.

From the Ms Then Ai Huong meeting, after the CPF education, the client immediately understood why she needed an alternative income source between ages 60 and 65. The CPF gap became visceral — not just a number on paper.`,
        slides: [
          {
            heading: "Phase 4: CPF Education (10 min)",
            bullets: [
              "Most clients have vague CPF understanding",
              "This segment positions you as THE expert",
              "Creates urgency through factual education",
            ],
          },
          {
            heading: "Key Teaching Points",
            bullets: [
              "Age 55: OA + SA → Retirement Account transformation",
              "FRS vs BRS vs ERS — show actual payout numbers",
              "CPF Life: Basic (more bequest) vs Standard (more payout) vs Escalating",
            ],
          },
          {
            heading: "The Critical Fact That Changes Everything",
            bullets: [],
            script: '"After age 81, remaining capital goes to the CPF pool, not your family. CPF Life is an annuity, not a savings account."',
          },
          {
            heading: "Additional CPF Insights",
            bullets: [
              "Females receive slightly higher CPF Life payouts (longevity tables)",
              "Property pledging option reduces RA requirement",
              "CPF OA earns 2.5% — barely beats inflation",
              "SRS contributions offer tax deductions up to $15,300/year",
            ],
          },
        ],
        keyTakeaways: [
          "The age 81 capital pool fact creates immediate urgency",
          "Show actual dollar amounts, not just percentages",
          "CPF education positions you as the expert",
          "This naturally leads into the gap analysis",
        ],
        realExamples: [
          "Ms Then Ai Huong: CPF education revealed 60-65 income gap",
          "John & Adelyn: CPF Life + annuity = $4K/month but gap after 75",
        ],
      },
      {
        id: "m3-l5",
        title: "Phase 5: The Gap Analysis",
        description: "The most powerful moment in the meeting — making the income gap real.",
        durationMin: 4,
        narration: `Phase 5 is the Gap Analysis. This is the most powerful moment in the entire meeting. When you make the income gap tangible, the client feels the urgency in their gut — not just their head.

Here's how you do it. Calculate total passive income: CPF Life plus rental plus dividends plus annuities plus part-time work. Subtract from desired monthly retirement income. Show the monthly shortfall clearly: "$4,000 desired minus $1,400 CPF Life equals $2,600 gap."

Now convert to annual: "$2,600 times 12 equals $31,200 per year." Then convert to capital needed. This is where the Capital Requirement Spectrum table becomes your most powerful weapon.

At 3% returns, which is what fixed deposits give you, you need $400,000 to generate $1,000 per month. At 6%, which is our dividend portfolio target, you only need $200,000. For a $2,000 monthly gap, it's $800,000 at 3% versus $400,000 at 6%. For $3,000 — $1.2 million at 3% versus $600,000 at 6%.

Then introduce the depletion timeline: "At current spending, your savings last until age 73." And the inflation shock: "$5,000 today equals $7,000 at 65 equals $9,500 at 75."

Here's the script that ties it all together: "At 3% in fixed deposits, you'd need $800,000 to generate $2,000 per month. At 6% in our dividend portfolio, you need $400,000. That's the difference between working 10 more years or retiring comfortably."

This is the moment where clients lean forward. The gap is no longer abstract — it's a dollar amount with a timeline.`,
        slides: [
          {
            heading: "Phase 5: The Gap Analysis",
            bullets: [
              "The most powerful moment in the meeting",
              "Makes the income gap tangible — felt, not just understood",
              "Converts abstract worry into specific dollar amounts",
            ],
          },
          {
            heading: "The Calculation Flow",
            bullets: [
              "Total passive income (CPF + rental + dividends + annuities)",
              "Minus desired monthly retirement income",
              "= Monthly shortfall → Annual shortfall → Capital needed",
              'Depletion timeline: "Savings last until age 73"',
              'Inflation shock: "$5K today = $7K at 65 = $9.5K at 75"',
            ],
          },
          {
            heading: "Capital Requirement Spectrum",
            bullets: [],
            table: {
              headers: ["Monthly Gap", "At 3% (FD)", "At 5%", "At 6% (PWV)", "At 8%"],
              rows: [
                ["$1,000", "$400K", "$240K", "$200K", "$150K"],
                ["$2,000", "$800K", "$480K", "$400K", "$300K"],
                ["$3,000", "$1.2M", "$720K", "$600K", "$450K"],
                ["$4,000", "$1.6M", "$960K", "$800K", "$600K"],
                ["$5,000", "$2.0M", "$1.2M", "$1.0M", "$750K"],
              ],
            },
          },
          {
            heading: "The Closing Script",
            bullets: [],
            script: '"At 3% in fixed deposits, you\'d need $800K to generate $2,000 per month. At 6% in our dividend portfolio, you need $400K. That\'s the difference between working 10 more years or retiring comfortably."',
          },
        ],
        keyTakeaways: [
          "The gap analysis creates visceral urgency",
          "Always show the Capital Requirement Spectrum table",
          "Inflation shock makes future costs real",
          "The FD vs dividend comparison is your most powerful contrast",
        ],
        realExamples: [
          "Annette: $171K lifetime hospital premiums became the gap driver",
          "Ms Then: $3K/month target vs $0 passive income age 60-65",
        ],
      },
      {
        id: "m3-l6",
        title: "Phase 6-7: Solution Introduction & Meeting Close",
        description: "Plant the seed without overselling, then close with clear next steps.",
        durationMin: 3,
        narration: `Phase 6 is Solution Introduction, lasting about 5 minutes. After the gap analysis has landed emotionally, you introduce the solution direction — but critically, you do NOT pitch specific products yet.

Present the comparison between traditional and efficient retirement planning. Show four passive income methods: dividends, annuities, rental income, and optimizing redundant assets. Then say: "Let me prepare a detailed proposal for our next meeting." Set a clear agenda for Meeting 2.

The key here is restraint. The gap analysis has created urgency. If you try to close now, you'll seem pushy. If you let the urgency simmer and schedule a focused proposal meeting, the client comes to Meeting 2 already wanting a solution.

Phase 7 is Close the Meeting, lasting just 2 minutes. Summarize 3 key findings from your discussion. Confirm the follow-up date — ideally within 1 week, maximum 10 days. Ask them to gather all policy documents, latest CPF statements, and investment statements.

Offer to help create portal accounts and retrieve policies via SingPass — do this right now if possible. Set up the WhatsApp group with both spouses if applicable. Send a summary PDF the same day.

That same-day summary is critical. It shows professionalism, reinforces the urgency of the gap you identified, and gives the client something to review with their spouse. From Cynthia's meetings, the clients who received same-day summaries had significantly higher conversion rates to Meeting 2.

The opening appointment is complete. The client leaves knowing their gap, understanding the framework, and looking forward to your proposal.`,
        slides: [
          {
            heading: "Phase 6: Solution Introduction (5 min)",
            bullets: [
              "Do NOT pitch specific products — just direction",
              "Traditional vs efficient retirement planning comparison",
              "4 passive income methods: dividends, annuities, rental, restructuring",
              '"Let me prepare a detailed proposal for our next meeting"',
            ],
          },
          {
            heading: "Phase 7: Close the Meeting (2 min)",
            bullets: [
              "Summarize 3 key findings",
              "Confirm follow-up date (within 1 week, max 10 days)",
              "Ask client to gather: all policies, CPF statements, investments",
              "Set up WhatsApp group (include spouse)",
              "Send summary PDF same day",
            ],
          },
          {
            heading: "Why Restraint Wins",
            bullets: [
              "Gap analysis creates urgency — let it simmer",
              "Trying to close in Meeting 1 seems pushy",
              "Client comes to Meeting 2 already wanting a solution",
              "Same-day summary reinforces urgency between meetings",
            ],
          },
        ],
        keyTakeaways: [
          "Don't pitch products in the opening — plant the seed",
          "Same-day summary dramatically improves Meeting 2 attendance",
          "Set up WhatsApp group before the client leaves",
          "Maximum 10 days to Meeting 2 or urgency dies",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: THE PROPOSAL MEETING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m4-proposal",
    number: 4,
    title: "The Proposal Meeting",
    description: "The 7-phase proposal meeting that builds your case with portfolio reviews, fee transparency, and real dividend receipts.",
    icon: "FileText",
    lessons: [
      {
        id: "m4-l1",
        title: "Policy-by-Policy Review (Color-Coded)",
        description: "The green/orange/red system that shows clients exactly where their money is going.",
        durationMin: 5,
        narration: `The Proposal Meeting is where you build your case. It runs 60 to 90 minutes. The most powerful tool in this meeting is the policy-by-policy review using the color-coded system.

Start with a 10-minute recap of Meeting 1 findings. "Last time we identified a $2,600 monthly gap." Review any new documents the client has provided. Update the financial picture with new information.

Then move to the policy review, which takes 20 to 30 minutes. For each existing policy, present using the color-coded system. Green means Keep — good value, adequate coverage, reasonable premiums. Orange means Optimize — could be improved through rider downgrades, fund switching, or payment frequency changes. Red means Restructure or Surrender — poor returns, redundant coverage, excessive cost.

For each red or orange policy, show: annual premium paid versus benefit received, current cash or surrender value, death benefit, true yield — total premiums paid versus current value — and your recommendation with reasoning.

Here are power moves from real meetings that illustrate common findings. NTUC whole life yielding only 1.07% — the Desmond Chik case. GE Living Assurance: $48,000 cash value versus $50,000 death benefit after 29 years — from the Pei Chee case. Pro Achiever ILP: only $2,800 growth over 7 years — from the Tracy case. Prudential cost of insurance escalation: $11 per $1,000 at age 55 rising to $67 per $1,000 at age 69.

Each of these real examples becomes a talking point. When you can show a client that their 20-year-old whole life policy is yielding 1%, while their bank FD gives 2.5%, the case for restructuring makes itself.`,
        slides: [
          {
            heading: "The Color-Coded Policy Review",
            bullets: [
              "Green = Keep: good value, adequate coverage",
              "Orange = Optimize: improve riders, fund switching, payment frequency",
              "Red = Restructure/Surrender: poor returns, redundant, excessive cost",
              "Takes 20-30 minutes — the core of the proposal meeting",
            ],
          },
          {
            heading: "For Each Red/Orange Policy, Show:",
            bullets: [
              "Annual premium paid vs benefit received",
              "Current cash/surrender value",
              "Death benefit",
              "True yield (total premiums vs current value)",
              "Your recommendation with reasoning",
            ],
          },
          {
            heading: "Real Meeting Power Moves",
            bullets: [
              "NTUC whole life: only 1.07% yield (Desmond Chik)",
              "GE Living Assurance: $48K cash vs $50K death after 29 years (Pei Chee)",
              "Pro Achiever ILP: $2,800 growth over 7 years (Tracy)",
              "Prudential COI: $11→$67 per $1,000 from age 55-69 (Chang Tsann)",
            ],
          },
          {
            heading: "Premium Savings Identification",
            bullets: [
              "Rider downgrades (A plan to Value saves ~$1,400/year)",
              "Annual vs monthly payment (saves 2-3%)",
              "Cancel redundant coverage",
              "Children's policy optimization (junior→adult: 3x coverage for $30 more)",
            ],
            script: '"By restructuring these three policies, you\'ll save $7,000 per year. That\'s money that could be working for you instead."',
          },
        ],
        keyTakeaways: [
          "The color-coded system makes recommendations visual and clear",
          "Always show true yield — clients are shocked by low returns",
          "Premium savings fund the new solution — money from thin air",
          "Use real examples from similar clients for credibility",
        ],
        realExamples: [
          "Eugene Soh: 3 policies restructured, $195K cash value redeployed",
          "Fahmi Bakar: consolidation + PWV opened in same meeting",
        ],
      },
      {
        id: "m4-l2",
        title: "Building the Investment Case",
        description: "How to present the PWV dividend strategy with fee transparency and real receipts.",
        durationMin: 5,
        narration: `After showing the client what's wrong with their current portfolio, it's time to build the investment case. This is where you present the PWV dividend strategy.

First, calculate the capital needed using the Capital Requirement Spectrum from Module 3. Then show how they get there: freed-up premiums plus maturing endowments plus CPF OA plus available cash. Present the staggered approach: "$42K per year for 5 years" using dollar cost averaging.

Introduce the two-pool strategy. Pool 1 is the Income Pool — immediate dividend-generating assets. Pool 2 is the Accumulation Pool — growth assets for long-term flexibility. This was used in the Chang Tsann meetings very effectively.

Now comes fee transparency — spend 10 minutes on this because it builds massive trust. AIA's structure is 3.6% for 7 years, then 0% — compare this to competitors. Welcome bonus: 3 to 5% in years 1 and 2. Investment bonus: 2.5% in years 8 to 11. Performance bonus: 0.4% annually from year 8. Show the math: "Higher upfront fees but lower total cost over 10-plus years."

Net returns after fees: target 6%. And here's the crucial technique — always underpromise. Present at 6% even though historical returns are 7 to 7.4%. When actual performance exceeds projections, trust deepens massively.

The most powerful technique Cynthia uses: showing actual dividend receipts from existing clients. Not projections — REAL statements showing 6.9 to 7.4% actual dividend payouts. "Here's what a client with $120K invested received last quarter: $2,100." Nothing builds trust like real evidence.

From the John and Adelyn meeting, showing actual AIA fund performance at 6.9 to 7.1% dividends sealed the deal because the client had been burned by previous advisors making promises they couldn't keep.`,
        slides: [
          {
            heading: "Building the Investment Case",
            bullets: [
              "Show how freed premiums + endowments + CPF + cash reach the target",
              "Staggered approach: $42K/year for 5 years (dollar cost averaging)",
              "Two-pool strategy: Income Pool + Accumulation Pool",
            ],
          },
          {
            heading: "Fee Transparency (10 min — Builds Trust)",
            bullets: [
              "AIA: 3.6% for 7 years, then 0%",
              "Welcome bonus: 3-5% years 1-2",
              "Investment bonus: 2.5% years 8-11",
              "Performance bonus: 0.4% from year 8",
              "Higher upfront fees BUT lower total cost over 10+ years",
            ],
          },
          {
            heading: "The Underpromise Rule",
            bullets: [
              "Present at 6% even though historical returns are 7-7.4%",
              "When actual performance exceeds projections → trust deepens",
              "Never promise returns — show conservative scenarios",
              "Use actual dividend receipts from existing clients",
            ],
            script: '"Here\'s what a client with $120K invested received last quarter: $2,100. That\'s real money, not a projection."',
          },
          {
            heading: "PWV Unique Value Propositions",
            bullets: [
              "Capital guarantee on death (family gets at least invested amount)",
              "Quarterly dividend flexibility (reinvest or payout)",
              "Fund switching between growth and income anytime",
              "No lock-in after 7 years (dividends from quarter 1)",
              "Estate planning services included (will, LPA, AMD)",
              "Medical concierge service",
            ],
          },
        ],
        keyTakeaways: [
          "Always underpromise — present at 6%, deliver 7%",
          "Real dividend receipts are more powerful than any projection",
          "Fee transparency builds trust — don't hide costs",
          "The capital guarantee on death is a unique differentiator",
        ],
        realExamples: [
          "John & Adelyn: AIA fund at 6.9-7.1% sealed the deal",
          "Annette: $42K annual dividends from $210K invested shown as proof",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: THE CLOSE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m5-close",
    number: 5,
    title: "The Close",
    description: "Closing techniques that feel natural, not pushy — from Sanjay Tolani's gentle approach to in-meeting execution that removes all friction.",
    icon: "CheckCircle",
    lessons: [
      {
        id: "m5-l1",
        title: "Gentle Closing Techniques",
        description: "The Grandma's Broomstick strategy and other non-pushy closing methods.",
        durationMin: 4,
        narration: `Closing doesn't have to feel like a high-pressure sales pitch. The techniques used in 255 real meetings are surprisingly gentle — and devastatingly effective.

The Grandma's Broomstick Strategy comes from Sanjay Tolani. The idea is to ask non-intrusive questions repeatedly to gauge the client's readiness. You ask about family medical history, travel habits, smoking status, hobbies, employer details — even superstitions about signing documents. Each question is a readiness check. When the client is relaxed and engaged, you transition naturally: "Let's prepare the form together."

Always Two, Never Three. When presenting options, limit choices to exactly two. "Would you prefer to start with $30K or $42K annually?" "Would you like dividends quarterly or reinvested for the first 3 years?" "Should we set it up under your name or your spouse's?" Never present three options — it creates decision paralysis.

Micro-Yeses Throughout. Build agreement incrementally from the very start of Meeting 1. "Does the 6% target sound reasonable?" — Yes. "Would you want your family to receive the capital if something happens?" — Yes. "Is starting with a smaller amount more comfortable?" — Yes. "Shall we complete the paperwork while we're together?" — Yes. By the time you ask the closing question, the client has already said yes 15 times.

Exit Options that reduce commitment anxiety. The free look period: "You have 14 days to review and cancel with full refund." Pre-underwriting: "We can submit the application without any payment — just to see if you qualify." Policy loan: "If you ever need liquidity, you can borrow against the policy." And starting small: "Begin with $10-12K, monitor for a year, then scale up."`,
        slides: [
          {
            heading: "Gentle Closing Techniques",
            bullets: [
              "No high-pressure tactics needed",
              "Multiple proven techniques that feel natural",
              "Used across 255+ real client meetings",
            ],
          },
          {
            heading: "Grandma's Broomstick Strategy (Sanjay Tolani)",
            bullets: [
              "Ask non-intrusive questions to gauge readiness",
              "Family history, travel, hobbies, employer details",
              "Each question is a readiness check",
              'When client is relaxed: "Let\'s prepare the form together"',
            ],
          },
          {
            heading: "Always Two, Never Three",
            bullets: [
              '"$30K or $42K annually?"',
              '"Dividends quarterly or reinvested first 3 years?"',
              '"Under your name or your spouse\'s?"',
              "Three options = decision paralysis",
            ],
          },
          {
            heading: "Micro-Yeses & Exit Options",
            bullets: [
              "Build agreement from Meeting 1 (15+ yeses before the close)",
              "Free look: 14 days to cancel with full refund",
              "Pre-underwriting: submit without payment to check qualification",
              "Start small: $10-12K first year, scale up after seeing results",
            ],
          },
        ],
        keyTakeaways: [
          "Gentle closing outperforms hard selling with pre-retirees",
          "Two options, never three",
          "Micro-yeses build momentum throughout the relationship",
          "Exit options reduce anxiety and increase commitment",
        ],
      },
      {
        id: "m5-l2",
        title: "In-Meeting Execution",
        description: "Complete EVERYTHING in the closing meeting — the friction-free system.",
        durationMin: 4,
        narration: `Here's the rule that separates top performers from average advisors: complete EVERYTHING in the closing meeting. Every follow-up needed to "complete paperwork" is an opportunity for the client to reconsider.

Here's your in-meeting execution checklist. Application form — use SingPass auto-population to reduce friction. Financial underwriting questionnaire. Payment processed — PayNow QR code, bank transfer, or bill payment. Beneficiary nominations — both paper and electronic with witnesses. SingPass authentication. Set up dividend payment preference — reinvest or payout.

GIRO setup for ongoing payments. Free look period explained. Callback survey completed — this is a compliance requirement. Next review date scheduled. WhatsApp group confirmed. Estate planning follow-up scheduled.

From the real meeting data, Cynthia completed PayNow transfers, SingPass authentication, nomination forms, and even LPA applications all within single meetings. In the Eugene Soh closing, the entire restructuring — surrender applications, new policy applications, nomination forms, and payment — was completed in one 89-minute meeting.

Payment logistics from real meetings: PayNow has daily transfer limits — guide the client to increase limits or use bill payment. For large amounts over $100K, stagger payments across 2 to 3 days. Some banks require advance notice for large transfers. Bank app guidance should be done live during the meeting — don't say "you can do it later."

And don't forget promotional urgency. Use it naturally, not pushily. Month-end bonuses: "10% bonus on contributions over $60K valid until month-end." Dividend cutoff: "Submit before December 9 to catch the next dividend distribution." Tranche limits: "$60M tranche with bonuses above $200K." These are real constraints, not manufactured pressure.`,
        slides: [
          {
            heading: "In-Meeting Execution: Complete Everything NOW",
            bullets: [
              "Every follow-up = opportunity for client to reconsider",
              "Remove ALL friction in the closing meeting",
              "Eugene Soh: entire restructuring done in one 89-min meeting",
            ],
          },
          {
            heading: "Closing Meeting Checklist",
            bullets: [
              "Application form (SingPass auto-population)",
              "Financial underwriting questionnaire",
              "Payment (PayNow QR / bank transfer / bill payment)",
              "Beneficiary nominations (paper + electronic + witnesses)",
              "SingPass authentication",
              "Dividend preference setup (reinvest or payout)",
              "GIRO for ongoing payments",
              "Free look period explained",
            ],
          },
          {
            heading: "Payment Logistics",
            bullets: [
              "PayNow daily limits — help client increase or use bill payment",
              "Large amounts ($100K+): stagger across 2-3 days",
              "Do bank app guidance LIVE during the meeting",
              "Accept multiple payment methods if needed",
            ],
          },
          {
            heading: "Natural Promotional Urgency",
            bullets: [
              '"10% bonus on contributions over $60K — valid until month-end"',
              '"Submit before Dec 9 to catch next dividend distribution"',
              '"$60M tranche with bonuses above $200K"',
              "These are real constraints, not manufactured pressure",
            ],
          },
        ],
        keyTakeaways: [
          "Complete EVERYTHING in one meeting",
          "SingPass auto-population removes friction",
          "Do bank app guidance live — never say 'do it later'",
          "Promotional urgency works when it's genuine",
        ],
        realExamples: [
          "Eugene Soh: Full restructuring in one 89-min meeting",
          "Ravi: PayNow transfer guided live during meeting",
          "Thian Boon Meng: 10% bonus motivated month-end close",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: SERVICING & REVIEWS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m6-servicing",
    number: 6,
    title: "Servicing & Reviews",
    description: "Post-close relationship management that generates referrals, upsells, and lifelong clients.",
    icon: "RefreshCw",
    lessons: [
      {
        id: "m6-l1",
        title: "The Healthcare Cost Angle",
        description: "Cynthia's most powerful PWV pitch — using hospitalization premiums to create urgency.",
        durationMin: 4,
        narration: `This is the single most effective PWV pitch for conservative pre-retirees. It comes directly from Cynthia's November 2025 Healthcare Costs Angle Demo and has been used successfully in dozens of meetings since.

Lead with the pain point. "HealthShield GoMax premiums: $412,000 total from age 55 to 85." "Your hospitalization premiums are $565 per year now. By age 90, they'll be $3,006 per year." "Over your retirement, you'll spend $91,000 to $171,000 just on hospital plan premiums."

These numbers shock people. Hospital plan premiums are a pure expense — money goes out, nothing comes back. No cash value, no death benefit, no inheritance. Just premiums paid to an insurer.

The solution: build a dividend portfolio that pays your premiums AND provides lifestyle income. Capital is preserved for inheritance. Use conservative 6% yield — actual returns are around 7%, but you underpromise.

Here's the script that converts: "Right now, your hospital premiums are a pure expense — money goes out, nothing comes back. What if we built an asset that generates enough income to cover those premiums forever, AND leaves the capital to your children?"

From the Annette meeting, a client planning to invest $180,000 over five years could generate quarterly dividends sufficient to cover all hospital plan premiums with surplus for lifestyle. The $412,000 lifetime premium cost became the emotional driver that made the investment feel like a no-brainer.

The psychological framing matters. You're framing the conversation around avoiding pain — loss of money to the insurer — rather than gaining pleasure. This loss aversion is a stronger motivator than any upside promise.`,
        slides: [
          {
            heading: "The Healthcare Cost Angle",
            bullets: [
              "Single most effective PWV pitch for conservative pre-retirees",
              "From Cynthia's Healthcare Costs Angle Demo (Nov 2025)",
              "Successfully used in dozens of meetings since",
            ],
          },
          {
            heading: "The Shocking Numbers",
            bullets: [
              "HealthShield GoMax: $412,000 total premiums age 55-85",
              "Current: $565/year → Age 90: $3,006/year",
              "Lifetime hospital premiums: $91K-$171K per person",
              "Pure expense — no cash value, no death benefit, no inheritance",
            ],
          },
          {
            heading: "The Solution Script",
            bullets: [],
            script: '"Right now, your hospital premiums are a pure expense — money goes out, nothing comes back. What if we built an asset that generates enough income to cover those premiums forever, AND leaves the capital to your children?"',
          },
          {
            heading: "Why This Works: Loss Aversion",
            bullets: [
              "Frame around avoiding pain (loss), not gaining pleasure",
              "Loss aversion is 2x stronger than gain motivation",
              "Hospital premiums are a pain everyone understands",
              "The investment becomes the cure, not an expense",
            ],
          },
        ],
        keyTakeaways: [
          "Hospital premium cost is the most powerful emotional driver",
          "Loss aversion framing converts faster than gain framing",
          "Always show the lifetime premium total — it shocks clients",
          "The solution preserves capital AND covers premiums",
        ],
        realExamples: [
          "Annette: $180K investment to cover $412K lifetime premiums",
          "Valerie Chong: Healthcare funding approach for PWV",
          "Cynthia's demo: Team training on this exact angle",
        ],
      },
      {
        id: "m6-l2",
        title: "The Policy Audit Door Opener",
        description: "How to use portfolio reviews to generate new business from existing and orphan clients.",
        durationMin: 3,
        narration: `The policy audit is the most powerful door-opener for existing and orphan policyholders. Here's how to position it.

Say: "I'd like to help you understand what you're currently paying for and whether it's still the best option." Position it as a free service, NOT a sales pitch. Use SingPass policy retrieval for a comprehensive view.

Here's what you audit for each policy. Premium efficiency: annual premium versus coverage provided. Cash value versus death benefit: if cash value exceeds death benefit, the client is overpaying. True yield: total premiums paid versus current value. Coverage gaps: missing critical illness stages, lapsed riders, no accident coverage. Nomination status: many policies have NO beneficiary nominated. Duplicate coverage across insurers. Cost of insurance escalation for ILPs. Fund performance versus benchmark. Rider efficiency. Policy lapse risk.

The gold mines from real audits include: old whole life policies with cash value exceeding death benefit, endowment plans yielding 1-2% (less than CPF OA at 2.5%), lapsed hospital plans the client didn't know about, missing nominations on 50%+ of policies, children's policies with death coverage instead of CI, ILPs with 100% in money market funds at zero growth, and ILPs where cost of insurance is eating the cash value.

After the audit, your restructuring recommendations naturally lead to PWV as the optimized replacement. The client feels helped, not sold to.`,
        slides: [
          {
            heading: "The Policy Audit Door Opener",
            bullets: [
              "Position as free service, not sales pitch",
              "Most powerful approach for orphan policyholders",
              "Use SingPass for comprehensive policy retrieval",
            ],
          },
          {
            heading: "10-Point Audit Checklist",
            bullets: [
              "1. Premium efficiency (cost vs coverage)",
              "2. Cash value vs death benefit (overpaying?)",
              "3. True yield (total premiums vs current value)",
              "4. Coverage gaps (missing CI, lapsed riders)",
              "5. Nomination status (often NONE set)",
              "6. Duplicate coverage across insurers",
              "7. COI escalation for ILPs",
              "8. Fund performance vs benchmark",
              "9. Rider efficiency",
              "10. Policy lapse risk",
            ],
          },
          {
            heading: "Common Gold Mines from Real Audits",
            bullets: [
              "Whole life: cash value > death benefit (client overpaying)",
              "Endowments yielding 1-2% (less than CPF OA at 2.5%)",
              "Lapsed hospital plans the client didn't know about",
              "Missing nominations on 50%+ of policies",
              "ILPs with 100% in money market (zero growth)",
              "ILPs where COI is eating the cash value",
            ],
          },
        ],
        keyTakeaways: [
          "Position the audit as a free service, never a sales pitch",
          "Missing nominations are found in 50%+ of portfolios",
          "True yield calculations shock clients — use them",
          "The audit naturally leads to PWV as the optimized solution",
        ],
      },
      {
        id: "m6-l3",
        title: "Post-Close Relationship Management",
        description: "The Three R's framework and follow-up cadence that generates lifelong clients.",
        durationMin: 3,
        narration: `The sale is just the beginning. Post-close relationship management is what generates referrals, upsells, and lifelong clients.

Use the Three R's framework from CAWA training for every annual review. Review the facts: performance, income, life changes. Remind them of original agreements and goals. Reaffirm their commitment and satisfaction.

Here's the follow-up cadence. Same day: send a meeting summary via WhatsApp. 3 days: check if the client has questions. 1 week: confirm application and underwriting status. 1 month: send the first dividend report, even if it's small. 3 months: check-in call and quarterly update. 6 months: review meeting and satisfaction check. 12 months: annual comprehensive review plus a gift. Ongoing: birthday, holiday, and milestone messages.

Servicing best practices include quarterly dividend reports via WhatsApp with specific numbers, annual face-to-face portfolio review meetings, birthday and holiday messages, at least one gift per year per client, help with administrative tasks like CPF linking and SingPass, tech support for older clients with app setup and e-signing, and proactive fund monitoring with notifications about rebalancing.

Upsell opportunities at review meetings include healthcare cost projection updates, SRS top-up reminders before year-end, estate planning updates for life changes, children's insurance transitions, property changes triggering insurance needs, maturity proceeds redeployment, and CPF OA rebalancing at age 55.

Client appreciation events like the Christmas dinner at the Ritz Carlton deepen the relationship and create referral opportunities naturally.`,
        slides: [
          {
            heading: "The Three R's Framework (Annual Reviews)",
            bullets: [
              "Review: Performance, income, life changes",
              "Remind: Original agreements and goals",
              "Reaffirm: Commitment and satisfaction",
            ],
          },
          {
            heading: "Follow-Up Cadence",
            bullets: [],
            table: {
              headers: ["Timing", "Action"],
              rows: [
                ["Same day", "Send meeting summary via WhatsApp"],
                ["3 days", "Check if client has questions"],
                ["1 week", "Confirm application/underwriting status"],
                ["1 month", "First dividend report"],
                ["3 months", "Check-in call + quarterly update"],
                ["6 months", "Review meeting + satisfaction check"],
                ["12 months", "Annual review + gift"],
              ],
            },
          },
          {
            heading: "Upsell Opportunities at Reviews",
            bullets: [
              "Healthcare cost projection updates",
              "SRS top-up reminders (year-end tax savings)",
              "Estate planning updates (life changes)",
              "Children's insurance transitions",
              "Maturity proceeds redeployment",
              "CPF OA rebalancing at age 55",
            ],
          },
        ],
        keyTakeaways: [
          "Same-day summary is non-negotiable",
          "Three R's framework structures every annual review",
          "At least one gift per year per client",
          "Reviews are the best time for natural upselling",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 7: CLIENT PERSONAS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m7-personas",
    number: 7,
    title: "Client Personas & Archetypes",
    description: "7 client archetypes with tailored approaches — from Conservative Savers to HNW clients, plus strategies for couples and multi-generational selling.",
    icon: "Users",
    lessons: [
      {
        id: "m7-l1",
        title: "The 7 Client Archetypes",
        description: "Recognize your client type within 5 minutes and adapt your approach.",
        durationMin: 5,
        narration: `From 255 real meetings, seven distinct client archetypes emerge. Recognizing which type you're dealing with within the first 5 minutes lets you tailor your entire approach.

Persona 1: The Conservative Saver — about 40% of clients. These are 55 to 65 year olds with money in fixed deposits and savings accounts. They're risk-averse. Lead with CPF education, use inflation shock, and leverage the SDIC $75K limit. Key phrase: "Your money is safe but it's not working for you."

Persona 2: The Anxious Pre-Retiree — about 25%. Recently retrenched or between jobs, mortgage outstanding, worried about running out. Address their primary anxiety immediately. Show the cash flow depletion timeline. Key phrase: "The question isn't whether you have enough saved — it's whether your savings will last 25 years."

Persona 3: The Comfortable Retiree — about 15%. Multiple properties, adequate income, policies untouched for years. Enter through portfolio review, NOT sales pitch. Focus on optimizing what they have. Key phrase: "I'm not here to sell you anything new. Let's first understand what you already have."

Persona 4: The Overseas or Expat Client — about 5%. Works abroad, limited time. Offer Zoom meetings, work with spouse locally. Address cross-border estate planning.

Persona 5: The HNW Client — about 5%. Half a million or more in investable assets. Multiple advisors, sophisticated. Use the CAWA techniques for HNW.

Persona 6: The Caregiver with Limited Cash Flow — about 5%. Stretched thin financially. Recognize when NOT to sell. Provide immediate practical value and position as long-term advisor.

Persona 7: The DIY Investor — about 5%. Self-manages stocks and ETFs, skeptical of insurance products. Don't compete with their trading — propose complementary structure. Key phrase: "I'm not suggesting you stop investing yourself. I'm suggesting we build a safety net underneath your portfolio."`,
        slides: [
          {
            heading: "7 Client Archetypes",
            bullets: [],
            table: {
              headers: ["Persona", "% of Clients", "Key Trait"],
              rows: [
                ["Conservative Saver", "40%", "FDs, risk-averse, needs inflation shock"],
                ["Anxious Pre-Retiree", "25%", "Retrenched/worried, address anxiety first"],
                ["Comfortable Retiree", "15%", "Enter through audit, not sales"],
                ["Overseas/Expat", "5%", "Zoom meetings, cross-border planning"],
                ["HNW Client", "5%", "Multiple advisors, sophisticated"],
                ["Caregiver/Limited CF", "5%", "Know when NOT to sell"],
                ["DIY Investor", "5%", "Complement, don't compete"],
              ],
            },
          },
          {
            heading: "The Conservative Saver (40%)",
            bullets: [
              "Lead with CPF education — show diminishing returns of ERS",
              'Inflation shock: "$3K today = $5K in 15 years"',
              "Use SDIC $75K limit as leverage",
              'Key: "Your money is safe but it\'s not working for you"',
            ],
          },
          {
            heading: "The Anxious Pre-Retiree (25%)",
            bullets: [
              "Address primary anxiety IMMEDIATELY",
              'Depletion timeline: "At current rate, funds run out at age 75"',
              "Frame as extending runway, not growing wealth",
              "If cash is tight: empathize first, defer major decisions",
            ],
          },
          {
            heading: "Knowing When NOT to Sell",
            bullets: [
              "Caregiver persona: limited cash flow, 3 jobs, elder care",
              "Provide immediate practical value (reduce premiums, CPF tips)",
              'Position as long-term: "When you\'re ready, I\'ll be here"',
              "DIY persona: complement their trading, don't compete",
            ],
          },
        ],
        keyTakeaways: [
          "Conservative Savers are 40% of clients — master this approach",
          "Always address the Anxious Pre-Retiree's fear first",
          "Enter Comfortable Retirees through audit, never sales pitch",
          "Knowing when NOT to sell builds more trust than any pitch",
        ],
      },
      {
        id: "m7-l2",
        title: "Selling to Couples & Multi-Generational",
        description: "Strategies for the 40% of meetings that involve couples, plus family pipeline building.",
        durationMin: 4,
        narration: `About 40% of meetings involve couples. Getting alignment between both partners is critical — a single misaligned spouse can kill a deal at any stage.

Include both from the start. Create a WhatsApp group with both partners immediately. Identify the decision-maker early with a light question: "Who makes the major financial decisions at home?" Meet them together — if one partner misses Meeting 1, schedule a recap. Do dual CPF analysis showing both partners' projections side by side. Calculate the joint income gap.

For nomination alignment, recommend the 98-1-1% split: 98% to spouse, 1% each to two other beneficiaries. This avoids probate complications.

Common couple dynamics you'll encounter: Both engaged — best scenario, present to both equally. One engaged, one absent — brief the absent partner before Meeting 2. One resistant — don't argue, offer an education meeting specifically for them. Gatekeeper spouse — present information to share, schedule follow-up with the decision-maker.

Multi-generational selling is a pipeline goldmine. The pattern: plan retirement for parents, then review children's existing coverage, offer personal finance books for adult children, identify coverage gaps in children's plans, schedule separate meetings for children. Parents' dividends can fund children's premiums.

Real example: The Elliot Wong family — father (retiree with knee injury), mother (breast cancer history), and son (recent NTU graduate) were all served in one 143-minute meeting. Joy and Grace Tay — sisters referred by parents, both opened policies in the same week.

The generational pitch builds your business exponentially. One couple becomes four to six clients across two generations.`,
        slides: [
          {
            heading: "Selling to Couples (40% of Meetings)",
            bullets: [
              "Include both from the start — WhatsApp group with both",
              'Identify decision-maker: "Who handles major financial decisions?"',
              "Dual CPF analysis — side by side projections",
              "Nomination alignment: 98-1-1% split recommended",
            ],
          },
          {
            heading: "Couple Dynamics",
            bullets: [],
            table: {
              headers: ["Dynamic", "Approach"],
              rows: [
                ["Both engaged", "Present to both equally"],
                ["One absent", "Brief before Meeting 2, offer home visit"],
                ["One resistant", "Don't argue — offer education meeting"],
                ["Gatekeeper spouse", "Give info to share, schedule follow-up"],
              ],
            },
          },
          {
            heading: "Multi-Generational Pipeline",
            bullets: [
              "Plan retirement for parents → review children's coverage",
              "Parents' dividends can fund children's premiums",
              "Personal finance books for adult children (great touchpoint)",
              "One couple becomes 4-6 clients across generations",
            ],
          },
          {
            heading: "Real Examples",
            bullets: [
              "Elliot Wong family: Father, mother, son — all in one 143-min meeting",
              "Joy & Grace Tay: Sisters referred by parents, both closed same week",
              "Sukumar family: Father, wife Priya, and son Viresh planned together",
            ],
          },
        ],
        keyTakeaways: [
          "Always include both partners from Meeting 1",
          "A misaligned spouse can kill a deal at any stage",
          "Multi-generational selling is your biggest pipeline multiplier",
          "One couple can become 4-6 clients across two generations",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 8: PRODUCT KNOWLEDGE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m8-product",
    number: 8,
    title: "Product Knowledge Deep Dive",
    description: "PWV product specifics, fee structures, fund options, and competitive comparisons — everything you need to answer any client question.",
    icon: "BookOpen",
    lessons: [
      {
        id: "m8-l1",
        title: "PWV Product Structure & Fees",
        description: "Complete breakdown of PWV mechanics, fees, bonuses, and timelines.",
        durationMin: 4,
        narration: `Let's get into the product details. Platinum Wealth Venture is AIA's premium investment-linked plan targeting high-net-worth pre-retirees with minimum annual premiums.

The fee structure: 3.6% fund management charge for the first 7 years, then 0% thereafter. This is a front-loaded structure — compare it to competitors who charge ongoing annual fees of 1-2% forever.

Bonuses work in your favor. Welcome bonus: 3-5% in years 1 and 2, applied to your premiums. Investment bonus: 2.5% in years 8 through 11. Performance bonus: 0.4% annually from year 8 onwards. Special promotional tranches — like the $60 million tranche from Annette's meeting — offer additional bonuses for larger commitments over $200K.

Payment period is 5 years with annual contributions. The minimum hold period before full liquidity is 7 years. But here's the key selling point: dividends start from quarter 1. Clients don't wait 7 years to see income.

Capital guarantee on death means the family receives at least the total amount invested, regardless of market performance. This is the feature that converts risk-averse clients more than anything else.

Dividend flexibility: clients can switch between reinvestment and payout quarterly. This means they can reinvest during the accumulation phase (first 5 years) and then switch to payout when they retire.

Fund switching is available at any time — clients can reallocate between growth funds and income funds based on market conditions or changing needs. You proactively monitor and recommend switches as part of your ongoing service.`,
        slides: [
          {
            heading: "PWV Product Structure",
            bullets: [
              "Premium ILP for HNW pre-retirees",
              "5-year payment period with annual contributions",
              "Minimum 7-year hold for full liquidity",
              "Dividends start from Quarter 1",
              "Capital guarantee on death (100% of invested amount)",
            ],
          },
          {
            heading: "Fee Structure",
            bullets: [
              "Fund management: 3.6% for 7 years, then 0%",
              "Front-loaded vs competitors' perpetual 1-2% annual fees",
              "Total cost over 15 years is LOWER than competitors",
              "Always show the long-term math to clients",
            ],
          },
          {
            heading: "Bonus Schedule",
            bullets: [],
            table: {
              headers: ["Bonus Type", "Rate", "Period"],
              rows: [
                ["Welcome Bonus", "3-5%", "Years 1-2"],
                ["Investment Bonus", "2.5%", "Years 8-11"],
                ["Performance Bonus", "0.4%/year", "Year 8 onwards"],
                ["Promo Tranche", "Extra 10%+", "On $200K+ (limited)"],
              ],
            },
          },
          {
            heading: "Key Selling Points",
            bullets: [
              "Capital guarantee on death — converts risk-averse clients",
              "Dividend flexibility: reinvest or payout, switch quarterly",
              "Fund switching: growth ↔ income anytime",
              "Estate planning services included (will, LPA, AMD)",
              "Medical concierge service",
            ],
          },
        ],
        keyTakeaways: [
          "3.6% for 7 years then 0% beats perpetual 1-2% fees",
          "Capital guarantee on death is the #1 converter for risk-averse clients",
          "Dividends from Q1 — clients see income immediately",
          "Promotional tranches create natural urgency",
        ],
      },
      {
        id: "m8-l2",
        title: "Dividend Performance & Competitive Comparison",
        description: "Real dividend numbers and how PWV compares to competitors.",
        durationMin: 4,
        narration: `Nothing sells better than real numbers. From actual client portfolios, here's what PWV delivers.

The global dividend fund has historically delivered 6.9 to 7.4% dividend yield annually. Conservative projections use 6% — this is what you present to clients. When actual performance exceeds expectations, trust deepens massively.

Real dividend examples from meetings: A client with $120K invested received $2,100 per quarter. A client with $210K invested received approximately $42K annually. A client with $300K in the global dividend fund with 7% return over five years, involving a 7-year lock-in, generated significant quarterly income.

When comparing to competitors, AIA offers a 5-year contribution period plus a 2-year holding period, giving greater liquidity and flexibility compared to competitors with shorter or longer lock-in periods. AIA's fund offers stable 6.9-7.1% dividends compared to more volatile alternatives.

The key competitive advantages: AIA's longer premium payment period enhances client liquidity — they spread payments over 5 years instead of a lump sum. The capital guarantee on death is not offered by all competitors. Fund switching flexibility is broader. And the advisory support — quarterly updates, proactive fund monitoring, two-consultant team — is a service differentiator.

Here's how to handle the competitor comparison in meetings. Cynthia's approach: "I'm happy for you to compare with other advisors. Here's what to look for: fee structure over 15 years, capital guarantee provisions, fund switching flexibility, and level of ongoing advisory support."

By giving clients a framework to compare, you position yourself as confident and transparent — which is exactly the opposite of what clients expect from a "salesperson."`,
        slides: [
          {
            heading: "Real Dividend Performance",
            bullets: [
              "Historical yield: 6.9-7.4% annually",
              "Present at 6% — underpromise, overdeliver",
              "$120K invested → $2,100/quarter",
              "$210K invested → ~$42K/year",
            ],
          },
          {
            heading: "Competitive Comparison Framework",
            bullets: [
              "AIA: 5-year contribution + 2-year hold = greater liquidity",
              "Stable 6.9-7.1% dividends vs volatile alternatives",
              "Capital guarantee on death (not all competitors offer this)",
              "Broader fund switching flexibility",
              "Advisory support: quarterly updates + two-consultant team",
            ],
          },
          {
            heading: "The Transparent Comparison Script",
            bullets: [],
            script: '"I\'m happy for you to compare with other advisors. Here\'s what to look for: fee structure over 15 years, capital guarantee provisions, fund switching flexibility, and level of ongoing advisory support."',
          },
          {
            heading: "Fund Options",
            bullets: [
              "Global Dividend Fund — stable 6-7% yield (primary recommendation)",
              "Growth funds — for accumulation phase clients",
              "Bond-heavy options — for ultra-conservative clients",
              "Switch between funds anytime as needs change",
            ],
          },
        ],
        keyTakeaways: [
          "Real dividend receipts are your strongest closing tool",
          "Always underpromise at 6%, let reality exceed at 7%+",
          "Give clients a comparison framework — it builds trust",
          "5-year contribution period is a liquidity advantage",
        ],
        realExamples: [
          "John & Adelyn: AIA at 6.9-7.1% vs competitors sealed the deal",
          "Annette: $42K annual from $210K invested shown as proof",
          "Ms Lily: $300K in global dividend fund at 7% projected",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 9: OBJECTION HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m9-objections",
    number: 9,
    title: "Objection Handling",
    description: "Proven responses to every common objection — from 'I need to think about it' to 'the market is too volatile' — all from real meetings.",
    icon: "Shield",
    lessons: [
      {
        id: "m9-l1",
        title: "Top 10 Objections & Responses",
        description: "The most common objections and proven scripts to handle each one.",
        durationMin: 5,
        narration: `Every objection is a buying signal in disguise. If a client didn't care, they wouldn't object — they'd just say no. Here are the top 10 objections from real meetings and proven responses.

Objection 1: "I need to think about it." Response: "Of course. To help you think clearly, what specific aspect would you like to consider? Is it the amount, the timing, or the product itself?" This narrows the vague objection into something addressable.

Objection 2: "I want to discuss with my spouse." Response: "That's important. Would it help if I met with both of you together? I can address any questions directly." Always offer to include the spouse.

Objection 3: "The market is too volatile right now." Response: "That's exactly why dollar cost averaging over 5 years works. You're buying at different price points. Plus, the capital guarantee means your family receives at least what you invested, regardless of markets."

Objection 4: "I already have an advisor." Response: "That's great. Many of my clients work with multiple advisors. I specialize specifically in retirement income optimization — think of me as adding a specialist to your team, not replacing anyone."

Objection 5: "The fees are too high." Response: "Let me show you the total cost comparison over 15 years." Then walk through the math showing 3.6% for 7 years then 0% versus a competitor's 1.5% ongoing, which totals more over 15 years.

Objection 6: "I prefer fixed deposits — they're guaranteed." Response: "Your capital IS guaranteed — on death, your family receives at least what you invested. The difference is your money works at 6% instead of 2.5%. Over 20 years, that's $300K in lost returns."

Objection 7: "I'm too old to start investing." Response: "Actually, this product is designed specifically for your age group. The 5-year contribution period aligns perfectly with your pre-retirement timeline."

Objection 8: "What if I need the money?" Response: "After 7 years, full liquidity. Before that, you can access funds through a policy loan. Plus, we size the investment to what's comfortable — never more than you can afford."

Objection 9: "I had a bad experience with a previous advisor." Response: "I'm sorry to hear that. Can you share what happened? I want to make sure we address those concerns specifically." Then listen, acknowledge, and show how your approach differs.

Objection 10: "I'll do it next year." Response: "Every year you wait, the cost of the same outcome increases. Let me show you..." Then use the delay cost analysis from the Phase 4 training: a 5-year delay reduces returns by $300K.`,
        slides: [
          {
            heading: "Objection Handling: The Mindset",
            bullets: [
              "Every objection is a buying signal in disguise",
              "If they didn't care, they'd just say no",
              "Listen first, acknowledge, then address",
              "Never argue — redirect",
            ],
          },
          {
            heading: "Top 5 Objections & Responses",
            bullets: [
              '"Need to think" → "What specific aspect?"',
              '"Discuss with spouse" → "Can I meet you both together?"',
              '"Market too volatile" → "That\'s why DCA over 5 years works"',
              '"Already have an advisor" → "I\'m a specialist addition, not replacement"',
              '"Fees too high" → "Let me show total cost over 15 years"',
            ],
          },
          {
            heading: "Top 5 More Objections",
            bullets: [
              '"Prefer FDs" → "Capital IS guaranteed + 6% vs 2.5%"',
              '"Too old" → "Designed specifically for your age group"',
              '"Need the money" → "Policy loan + sized to comfort level"',
              '"Bad experience" → "Tell me what happened" (listen first)',
              '"Next year" → "Every year delay = $60K opportunity cost"',
            ],
          },
          {
            heading: "The IBCT Technique for C-Profiles",
            bullets: [
              "Identify the concern (emotional root, not logical surface)",
              "Bridge to data (acknowledge feeling, then show facts)",
              "Confirm understanding (repeat back what they said)",
              "Transition to solution (only after they feel heard)",
            ],
          },
        ],
        keyTakeaways: [
          "Narrow vague objections into specific addressable concerns",
          "Never argue — acknowledge and redirect",
          "The delay cost analysis handles 'next year' objections",
          "Bad experience objections need listening first, solutions second",
        ],
      },
      {
        id: "m9-l2",
        title: "Handling Market Volatility Conversations",
        description: "Scripts for when markets drop and clients panic.",
        durationMin: 4,
        narration: `Market volatility conversations come up in two contexts: during the sales process when markets are turbulent, and after the sale when clients see their portfolio fluctuate. Both require different approaches.

During the sales process, use the recovery timeline data from the Ravi PWV top up meeting. Markets typically have an average drawdown of around 1.5% with recovery taking about 47 days. Show the historical recovery pattern — every crash has recovered, and investors who stayed in or bought during dips came out ahead.

The dollar cost averaging defense: "When markets drop, your regular contributions buy more units at lower prices. That's dollar cost averaging working in your favor. A 5-year contribution period smooths out volatility naturally."

The capital guarantee defense: "Regardless of what markets do, your family is guaranteed to receive at least what you invested. That's a floor, not a ceiling. Markets go up, you benefit. Markets go down, your capital is protected."

For post-sale conversations when a client calls worried during a market drop, use this framework. First, acknowledge: "I understand your concern. It's natural to feel worried when you see negative numbers." Second, contextualize: "Let's look at your actual position. Your dividends are still being paid quarterly. Your capital guarantee is intact." Third, educate: "Market corrections of 10-15% happen roughly every 18 months. They've always recovered." Fourth, reframe: "This is actually a good time for your regular contributions — you're buying at a discount."

From the Ravi meeting, when discussing market crises, the team outlined strategies for ad hoc contributions during volatility to average down costs. A $160K top-up during a market dip was positioned as an opportunity, not a risk.

Never dismiss client anxiety. The IBCT technique works here too: Identify the emotional concern, Bridge to data, Confirm understanding, then Transition to the appropriate action.`,
        slides: [
          {
            heading: "Market Volatility: During the Sale",
            bullets: [
              "Average drawdown: ~1.5% with 47-day recovery",
              "Every crash in history has recovered",
              "5-year DCA smooths out volatility naturally",
              "Capital guarantee provides a floor, not a ceiling",
            ],
          },
          {
            heading: "Market Volatility: Post-Sale Client Calls",
            bullets: [
              '1. Acknowledge: "It\'s natural to feel worried"',
              "2. Contextualize: dividends still paid, guarantee intact",
              "3. Educate: 10-15% corrections every ~18 months, always recover",
              '4. Reframe: "Your contributions buy at a discount now"',
            ],
          },
          {
            heading: "The Opportunity Reframe",
            bullets: [],
            script: '"Market dips are when our dollar cost averaging works hardest. Your $42K annual contribution now buys more units at lower prices. When markets recover — and they always have — those discounted units amplify your returns."',
          },
          {
            heading: "Never Dismiss Client Anxiety",
            bullets: [
              "IBCT: Identify concern → Bridge to data → Confirm → Transition",
              "Acknowledge the emotion before presenting logic",
              "Offer a meeting or call — don't handle it over text",
              "Show actual dividend statements as proof of ongoing income",
            ],
          },
        ],
        keyTakeaways: [
          "DCA over 5 years is your strongest volatility defense",
          "Capital guarantee removes the biggest fear",
          "Never dismiss anxiety — acknowledge first, educate second",
          "Market dips can be reframed as opportunities for top-ups",
        ],
        realExamples: [
          "Ravi: $160K top-up during market dip as opportunity",
          "Phase 4 training: delay cost analysis shows $300K loss from 5-year wait",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 10: SCRIPTS & FRAMEWORKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m10-scripts",
    number: 10,
    title: "Scripts & Frameworks",
    description: "Ready-to-use scripts, the ARQ questioning framework, NLP techniques, and the FORM relationship builder.",
    icon: "MessageSquare",
    lessons: [
      {
        id: "m10-l1",
        title: "The ARQ Framework: Asking the Right Questions",
        description: "The questioning methodology that uncovers needs clients didn't know they had.",
        durationMin: 4,
        narration: `ARQ stands for Asking the Right Questions. This framework is the engine that powers your discovery phase and objection handling. The principle is simple: the person asking questions controls the conversation.

There are three types of questions in the ARQ framework. Situational questions gather facts. "What's your current monthly income?" "When do you plan to retire?" "How much do you have in CPF?" These are necessary but don't create emotional engagement.

Problem questions uncover pain. "What happens to your income if you stop working tomorrow?" "How would rising healthcare costs affect your retirement?" "What concerns you most about your financial future?" These create awareness of gaps the client hadn't fully considered.

Implication questions amplify the pain. "If your savings run out at 73, what happens for the next 15 years?" "If inflation makes your $3K monthly need become $5K, where does the extra $2K come from?" "What impact would that have on your children?" These make the gap feel urgent and personal.

The sequence matters. Start with situational to build the picture. Move to problem questions to identify gaps. Then use implication questions to make those gaps feel real and urgent. Only THEN do you present solutions.

From training sessions, Don's coaching emphasizes that most advisors stay stuck on situational questions because they're comfortable. Problem and implication questions feel confrontational — but they're actually what clients need to hear. Without them, clients leave the meeting thinking "that was interesting" instead of "I need to act."

Practice this framework until it becomes natural. The best advisors don't sound like they're following a script — the questions flow conversationally because they've internalized the ARQ sequence.`,
        slides: [
          {
            heading: "ARQ: Asking the Right Questions",
            bullets: [
              "The person asking questions controls the conversation",
              "Three question types in sequence: Situational → Problem → Implication",
              "Most advisors stay stuck on Situational — push beyond",
            ],
          },
          {
            heading: "Situational Questions (Gather Facts)",
            bullets: [
              '"What\'s your current monthly income?"',
              '"When do you plan to retire?"',
              '"How much do you have in CPF?"',
              "Necessary but don't create emotional engagement",
            ],
          },
          {
            heading: "Problem Questions (Uncover Pain)",
            bullets: [
              '"What happens to your income if you stop working tomorrow?"',
              '"How would rising healthcare costs affect your retirement?"',
              '"What concerns you most about your financial future?"',
              "Create awareness of gaps client hadn't considered",
            ],
          },
          {
            heading: "Implication Questions (Amplify Urgency)",
            bullets: [
              '"If savings run out at 73, what happens for the next 15 years?"',
              '"Where does the extra $2K/month come from when inflation hits?"',
              '"What impact would that have on your children?"',
              "Makes the gap feel urgent and personal",
            ],
          },
        ],
        keyTakeaways: [
          "Situational → Problem → Implication → Solution (in that order)",
          "Most advisors stay on Situational — push into Problem and Implication",
          "Implication questions create urgency without being pushy",
          "Practice until the sequence flows naturally in conversation",
        ],
      },
      {
        id: "m10-l2",
        title: "The FORM Framework & Key Scripts",
        description: "Relationship-building structure plus essential scripts for every meeting phase.",
        durationMin: 4,
        narration: `The FORM framework structures natural conversation and builds genuine rapport. FORM stands for Family, Occupation, Recreation, Money.

Family: Ask about children, grandchildren, parents. Where do they live? What do they do? This isn't small talk — family structure determines estate planning needs, beneficiary nominations, and multi-generational opportunities.

Occupation: Current job, retirement timeline, industry. Are they facing retrenchment? Planning to work part-time? This determines their income timeline and urgency level.

Recreation: Hobbies, travel plans, lifestyle goals. These become the "why" behind their retirement number. When a client says they want to travel twice a year, you can calculate: $5K per trip times 2 equals $10K annually on top of basic living expenses.

Money: Savings, investments, property, CPF. This comes last — after you've built rapport through the other three. By this point, sharing financial details feels natural, not intrusive.

Now, here are the essential scripts you should memorize for key moments.

The opening: "We specialize in helping pre-retirees optimize their retirement income. There's absolutely no obligation to proceed with any recommendations."

The gap bridge: "At 3% in fixed deposits, you'd need $800K to generate $2K per month. At 6% in our dividend portfolio, you need $400K. That's the difference between working 10 more years or retiring comfortably."

The healthcare hook: "Your hospital premiums are a pure expense. What if we built an asset that covers those premiums forever and leaves capital to your children?"

The close transition: "Shall we prepare the form together?" — not "Do you want to proceed?"

The referral ask: "Is there anyone else in your circle who's approaching retirement and might benefit from the same planning we've done together?"

These scripts work because they've been tested in 255 real meetings. Customize the numbers, but keep the structure.`,
        slides: [
          {
            heading: "FORM Framework",
            bullets: [
              "Family: Children, grandchildren, parents — determines estate needs",
              "Occupation: Job, retirement timeline, retrenchment risk",
              "Recreation: Hobbies, travel — becomes the 'why' behind the number",
              "Money: Savings, investments, CPF — comes LAST after rapport built",
            ],
          },
          {
            heading: "Essential Scripts: Opening",
            bullets: [],
            script: '"We specialize in helping pre-retirees optimize their retirement income. There\'s absolutely no obligation to proceed with any recommendations."',
          },
          {
            heading: "Essential Scripts: The Gap & Healthcare",
            bullets: [
              'Gap: "At 3% FD you need $800K. At 6% dividends you need $400K. That\'s 10 fewer working years."',
              'Healthcare: "Hospital premiums are pure expense. What if that became an asset that covers premiums AND leaves capital?"',
            ],
          },
          {
            heading: "Essential Scripts: Close & Referral",
            bullets: [
              'Close: "Shall we prepare the form together?" (not "Do you want to proceed?")',
              'Referral: "Is there anyone approaching retirement who might benefit from the same planning?"',
              "Customize the numbers, keep the structure",
              "These scripts were tested in 255+ real meetings",
            ],
          },
        ],
        keyTakeaways: [
          "FORM builds rapport naturally — Money always comes last",
          "Memorize the 5 essential scripts and customize with real numbers",
          "Close with action language ('prepare the form') not decision language ('proceed')",
          "The referral ask should happen at every servicing meeting",
        ],
      },
      {
        id: "m10-l3",
        title: "NLP Techniques & Psychological Framing",
        description: "Advanced persuasion techniques that feel natural, not manipulative.",
        durationMin: 3,
        narration: `These NLP and psychological framing techniques come from the ARQ, SAPT, and CAWA training programs. Used ethically, they help clients overcome mental blocks that prevent good financial decisions.

Loss aversion framing: People feel losses twice as strongly as equivalent gains. Instead of "You could earn 6%" say "You're losing $300K over 20 years by keeping money in FDs at 2.5%." The healthcare cost angle is pure loss aversion — "Your $412K in premiums is money going out, never coming back."

Anchoring: Present the larger number first. "To generate $2K per month at 3%, you need $800K. But at 6%, you only need $400K." The $800K anchors high, making $400K feel reasonable. Similarly, "Our full recommendation is $42K per year. But you could start with $24K to see how it works."

Social proof: "I have clients in their 60s who wish they started 5 years earlier." "Here's an actual dividend receipt from a client in a similar situation." Real examples from real clients are the most powerful social proof.

Future pacing: Help clients visualize the positive outcome. "Imagine receiving a $2,100 dividend payment every quarter — that's your hospital premiums covered, with money left over for that trip to Japan you mentioned."

The contrast principle: Always present the current situation next to the proposed solution. $1% yield versus 6% yield. $800K needed versus $400K needed. $412K in premiums as expense versus premiums funded by dividends. The contrast makes the decision obvious.

These techniques are most effective when used subtly and in service of the client's genuine interests. They're not tricks — they're ways of presenting information that helps clients overcome natural biases against action.`,
        slides: [
          {
            heading: "Psychological Framing Techniques",
            bullets: [
              "Used ethically to help clients overcome decision paralysis",
              "Not tricks — ways of presenting information clearly",
              "From ARQ, SAPT, and CAWA training programs",
            ],
          },
          {
            heading: "Loss Aversion & Anchoring",
            bullets: [
              'Loss aversion: "Losing $300K" > "Could earn 6%"',
              "People feel losses 2x stronger than equivalent gains",
              'Anchoring: "$800K at 3%... but only $400K at 6%"',
              "Present the larger number first, then the solution",
            ],
          },
          {
            heading: "Social Proof & Future Pacing",
            bullets: [
              '"Clients in their 60s wish they started 5 years earlier"',
              "Real dividend receipts = strongest social proof",
              'Future pacing: "Imagine receiving $2,100 every quarter..."',
              "Connect the outcome to their personal goals (travel, family)",
            ],
          },
          {
            heading: "The Contrast Principle",
            bullets: [
              "Always present current vs proposed side by side",
              "1% yield ↔ 6% yield",
              "$800K needed ↔ $400K needed",
              "$412K as expense ↔ premiums funded by dividends",
              "The contrast makes the decision obvious",
            ],
          },
        ],
        keyTakeaways: [
          "Loss aversion framing is 2x more powerful than gain framing",
          "Always anchor high, then present your solution as reasonable",
          "Real dividend receipts are the ultimate social proof",
          "The contrast principle makes decisions feel obvious",
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 11 — CPF Optimization Strategies
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m11-cpf-optimization",
    number: 11,
    title: "CPF Optimization Strategies",
    description: "Master CPF Life schemes, SA/OA transfer tactics, and SRS tax strategies to help clients maximize their retirement income and minimize tax burden.",
    icon: "Landmark",
    lessons: [
      {
        id: "m11-l1",
        title: "CPF Life Schemes Decoded",
        description: "Understand the critical differences between CPF Life Standard and Basic schemes, monthly payout ranges, and the depletion problem that creates urgency in client conversations.",
        durationMin: 4,
        narration: `CPF Life is the cornerstone of every Singaporean's retirement plan, and your ability to explain it clearly will determine whether clients see you as a commodity or a trusted advisor. Let us break down the two main schemes.

CPF Life Standard provides higher monthly payouts — typically between $2,200 and $3,000 per month at the Full Retirement Sum — but here is the catch that most advisors miss: after age 81, the payouts may reduce significantly or stop entirely depending on the bequest amount. The Standard scheme front-loads your payouts, which sounds great until you realize that Singaporeans are living well into their 80s and 90s.

CPF Life Basic, on the other hand, provides lower monthly payouts but preserves a larger bequest — meaning there is money left for your family. The trade-off is that you receive less each month during your lifetime, but the plan sustains payouts longer, potentially until age 91 or beyond.

Here is the key phrase you need to burn into your pitch: "After age 81, CPF pays you nothing and leaves your family nothing." That single sentence creates the urgency you need. When a client hears that their government retirement plan has an expiry date, they immediately understand why supplementary retirement income is not optional — it is essential.

In your meetings, pull up the CPF Life estimator on the client's own portal. Show them their projected payout. Then ask: "What happens at 82? 85? 90?" Let the silence do the work. The gap between what CPF provides and what they actually need is where your solution lives.

Remember, you are not selling against CPF. You are showing that CPF is a foundation — a good one — but a foundation alone is not a house. Your job is to help them build the rest of the structure with private retirement income streams that never deplete and always leave something for the family.`,
        slides: [
          {
            heading: "CPF Life: The Two Schemes",
            bullets: [
              "CPF Life Standard: Higher monthly payouts ($2,200–$3,000/mo at FRS)",
              "CPF Life Basic: Lower payouts but larger bequest preserved",
              "Both are lifelong annuities funded by your Retirement Account",
              "Scheme selection happens at age 65 (default: Standard)"
            ]
          },
          {
            heading: "The Depletion Problem",
            bullets: [
              "Standard scheme: payouts may reduce or stop after age 81",
              "Basic scheme: sustains longer but lower monthly income",
              "Average Singaporean life expectancy: 84 (and rising)",
              "Key question: What happens when CPF runs out but you are still alive?"
            ],
            script: `"After age 81, CPF pays you nothing and leaves your family nothing. That is why we need to build a second income stream that never runs out."`
          },
          {
            heading: "Standard vs Basic Comparison",
            bullets: [
              "Use this table to walk clients through the trade-offs",
              "Always use the client's own CPF portal numbers for maximum impact"
            ],
            table: {
              headers: ["Feature", "CPF Life Standard", "CPF Life Basic"],
              rows: [
                ["Monthly Payout (at FRS)", "$2,200–$3,000", "$1,800–$2,400"],
                ["Bequest at Death", "Lower (front-loaded payouts)", "Higher (preserved capital)"],
                ["Payout Sustainability", "May deplete after ~81", "May sustain to ~91"],
                ["Best For", "Those needing max income now", "Those wanting to leave more behind"],
                ["Risk", "Longevity risk after 81", "Lower income during retirement"]
              ]
            }
          },
          {
            heading: "Using This in Client Meetings",
            bullets: [
              "Pull up the CPF Life estimator on the client's own SingPass portal",
              "Show their projected monthly payout vs their actual monthly expenses",
              "Ask: 'What happens at 82? 85? 90?' — let the silence work",
              "Position your solution as the second floor built on CPF's foundation",
              "Never sell against CPF — frame it as complementary"
            ],
            script: `"CPF is a great foundation. But a foundation alone is not a house. Let me show you how we build the rest of the structure — income that never depletes and always leaves something for your family."`
          }
        ],
        keyTakeaways: [
          "CPF Life Standard front-loads payouts but risks depletion after age 81",
          "CPF Life Basic preserves bequest but provides lower monthly income",
          "The depletion problem is your strongest urgency-creation tool",
          "Always use the client's own CPF numbers — never generic examples",
          "Position private retirement plans as complementary to CPF, not replacements"
        ],
        realExamples: [
          "In the Kyaw Min Htut meeting, pulling up his CPF portal showing $76K SA balance immediately shifted the conversation to optimization",
          "Jeffrey Foo's meeting used the CPF depletion timeline to justify a $24K/year PWV commitment"
        ]
      },
      {
        id: "m11-l2",
        title: "SA/OA Transfer Tactics",
        description: "Learn how to advise clients on transferring OA funds to SA for higher returns, when to recommend it, and how to optimize the Retirement Account balance before age 55.",
        durationMin: 4,
        narration: `One of the simplest yet most impactful pieces of advice you can give a client is about the interest rate differential between their CPF accounts. The Ordinary Account earns 2.5 percent per year. The Special Account earns 4 percent. That is a 60 percent higher return for doing nothing more than moving money from one account to another.

But here is where it gets nuanced and where you differentiate yourself from a Google search. The OA is used for housing. If your client still has an outstanding mortgage or plans to buy property, transferring OA to SA could leave them short for housing needs. So the rule is simple: only transfer the excess — the amount above what they need for housing commitments.

Let me walk you through a real example. Kyaw Min Htut came to us with an OA balance of $108,000 and an SA balance of $76,000. He owned his property outright — no remaining mortgage. In his case, transferring a significant portion of his OA to SA was a no-brainer. The additional 1.5 percent annual return on, say, $80,000 transferred means an extra $1,200 per year in interest — compounding.

Here is the critical timeline insight: at age 55, your SA and OA merge into the Retirement Account. The RA balance determines your CPF Life payout. So every dollar you move into SA before 55 earns that higher 4 percent rate, which means a higher RA balance at 55, which means a higher monthly CPF Life payout for life.

The math is compelling. A client who maximizes their SA from age 40 to 55 could see tens of thousands more in their RA compared to someone who left it all in OA. And that translates directly to hundreds of dollars more per month in CPF Life payouts.

Your action step in every meeting with a pre-retiree: check their CPF balances, check their housing situation, and if there is excess OA, recommend the transfer. It takes five minutes on the CPF portal and it is free. This kind of advice builds massive trust because you are helping them optimize what they already have before asking them to invest in anything new.`,
        slides: [
          {
            heading: "The Interest Rate Differential",
            bullets: [
              "Ordinary Account (OA): 2.5% per year — used for housing, education, investment",
              "Special Account (SA): 4.0% per year — locked for retirement",
              "That is 60% more return just by transferring between accounts",
              "Transfer is free, instant, and done via CPF portal",
              "One-way transfer only: OA → SA (cannot reverse)"
            ]
          },
          {
            heading: "When to Recommend (and When Not To)",
            bullets: [
              "YES: Client owns property outright or has minimal mortgage",
              "YES: Client has no plans to purchase new property",
              "YES: Client is under 55 (maximize compounding window)",
              "NO: Client has outstanding HDB mortgage relying on OA",
              "NO: Client plans to use OA for property downpayment",
              "Rule: Only transfer the EXCESS above housing commitments"
            ]
          },
          {
            heading: "Real Example: Kyaw Min Htut",
            bullets: [
              "OA balance: $108,000 | SA balance: $76,000",
              "Property owned outright — no mortgage obligations",
              "Recommended transfer: $80,000 from OA to SA",
              "Additional annual return: $80,000 × 1.5% = $1,200/year",
              "Compounded over 10 years: approximately $18,000+ extra in RA"
            ],
            table: {
              headers: ["Scenario", "RA Balance at 55", "Est. CPF Life Payout"],
              rows: [
                ["No transfer (leave in OA)", "$210,000", "~$1,600/mo"],
                ["Transfer $80K to SA now", "$228,000+", "~$1,750/mo"],
                ["Difference", "+$18,000+", "+$150/mo for life"]
              ]
            }
          },
          {
            heading: "The Age 55 Merge Point",
            bullets: [
              "At 55: SA + OA merge into Retirement Account (RA)",
              "RA balance determines CPF Life monthly payout",
              "Higher SA balance before 55 = higher RA = higher lifetime payout",
              "This is a one-time optimization window — cannot be done after 55",
              "Position this as 'free money' — costs nothing, earns more"
            ],
            script: `"Before we talk about any new investments, let me show you something that costs you nothing but earns you more. We can move your excess OA into your SA — it is like getting a raise on your retirement savings for free."`
          }
        ],
        keyTakeaways: [
          "OA earns 2.5% while SA earns 4% — a 60% higher return",
          "Only transfer excess OA above housing commitments",
          "Transfers before age 55 maximize the Retirement Account balance",
          "This is a trust-building move: optimizing what they have before selling anything new",
          "Always check housing obligations before recommending any transfer"
        ],
        realExamples: [
          "Kyaw Min Htut: OA $108K, SA $76K, property owned — recommended $80K transfer for ~$150/mo higher CPF Life payout",
          "Multiple pre-retiree meetings showed that leading with CPF optimization builds trust before the product pitch"
        ]
      },
      {
        id: "m11-l3",
        title: "SRS Tax Strategies",
        description: "Master the Supplementary Retirement Scheme — contribution limits, tax relief mechanics, the optimal withdrawal strategy, and how to present SRS-linked plans to clients.",
        durationMin: 4,
        narration: `The Supplementary Retirement Scheme is one of the most powerful tax planning tools available in Singapore, and yet most people either do not know about it or do not use it optimally. Your job is to change that.

Here are the basics. Every Singapore tax resident can contribute up to $15,300 per year to their SRS account. Every dollar contributed reduces your taxable income immediately. For a client in the 15 percent tax bracket, that is $2,295 in tax savings per year — real money back in their pocket just for saving for retirement.

Now here is where it gets interesting. The money in SRS can be invested — in unit trusts, endowments, fixed deposits, or insurance products like PWV. It does not need to sit there earning nothing. And the investment gains within SRS are tax-free while they remain in the account.

The withdrawal rules are where your expertise really shines. After the statutory retirement age of 62, withdrawals are taxed at only 50 percent of the amount. So if you withdraw $40,000, only $20,000 is considered taxable income. And here is the sweet spot: if that $20,000 is your only taxable income, it falls within the zero percent tax bracket after personal reliefs. Effectively, you pay zero tax on a $40,000 withdrawal. That is the magic number your clients need to hear.

Let me share a real case. In the Chang Tsann meeting, we structured a plan around $156,000 in SRS contributions accumulated over roughly 10 years. After 62, this generated $3,154 per month for 10 years through a systematic withdrawal plan linked to a dividend product. The client got immediate tax relief during accumulation, tax-free investment growth, and effectively zero-tax withdrawals in retirement.

The early withdrawal penalty is the stick: if you withdraw before 62, 100 percent of the amount is taxable plus a 5 percent penalty. Make sure clients understand this is a long-term commitment. But for anyone over 50, the runway to 62 is short enough that SRS becomes extremely attractive.

When you combine SRS tax savings with CPF optimization and a dividend plan, you are giving clients a comprehensive retirement strategy that no robo-advisor or DIY investor can replicate. That is your value proposition.`,
        slides: [
          {
            heading: "SRS Fundamentals",
            bullets: [
              "Annual contribution cap: $15,300 (Singaporeans/PRs)",
              "Contributions are tax-deductible — immediate tax relief",
              "Investment gains within SRS are tax-free",
              "Withdrawal before 62: 100% taxable + 5% penalty",
              "Withdrawal after 62: only 50% of amount is taxable"
            ]
          },
          {
            heading: "The Zero-Tax Sweet Spot",
            bullets: [
              "After 62: withdraw $40,000/year from SRS",
              "50% exemption → only $20,000 is taxable",
              "$20,000 falls within 0% bracket after personal reliefs",
              "Effective tax rate: 0% on $40,000 annual withdrawal",
              "This is the number your clients need to hear"
            ],
            script: `"Here is what most people do not realize about SRS. If you structure your withdrawals correctly after 62, you can pull out $40,000 a year and pay absolutely zero tax on it. Let me show you the math."`
          },
          {
            heading: "Real Case: Chang Tsann's SRS Strategy",
            bullets: [
              "Total SRS investment: $156,000 over ~10 years",
              "Annual contribution: ~$15,300 (maximized each year)",
              "Post-62 withdrawal: $3,154/month for 10 years",
              "Tax saved during accumulation: ~$2,000+/year",
              "Tax on withdrawal: effectively 0% at $40K/year"
            ],
            table: {
              headers: ["Phase", "Amount", "Tax Impact"],
              rows: [
                ["Annual Contribution", "$15,300", "Tax relief of $2,295/yr (at 15% bracket)"],
                ["10-Year Accumulation", "$156,000+", "Investment gains tax-free"],
                ["Monthly Withdrawal (post-62)", "$3,154/mo", "Effectively 0% tax"],
                ["Total Tax Saved", "$20,000+", "Over contribution + withdrawal period"]
              ]
            }
          },
          {
            heading: "SRS + CPF + Dividends = Complete Strategy",
            bullets: [
              "Layer 1: CPF Life — government baseline (~$2,000–$3,000/mo)",
              "Layer 2: SRS withdrawals — tax-optimized income (~$3,000/mo)",
              "Layer 3: Dividend plan — private income stream (~$2,000+/mo)",
              "Combined: $7,000–$8,000/mo retirement income",
              "This comprehensive approach is your competitive moat"
            ],
            script: `"When we combine your CPF Life payout, your SRS withdrawals, and your dividend income, you are looking at $7,000 to $8,000 a month in retirement — with minimal tax. No robo-advisor can build this for you."`
          }
        ],
        keyTakeaways: [
          "$15,300 annual SRS cap provides immediate tax relief",
          "The $40K/year withdrawal sweet spot = effectively 0% tax after 62",
          "Early withdrawal penalty (before 62) is 100% taxable + 5% penalty",
          "SRS funds can be invested in insurance products like PWV for compounding",
          "The three-layer strategy (CPF + SRS + dividends) is your strongest value proposition"
        ],
        realExamples: [
          "Chang Tsann: $156K SRS invested, generating $3,154/month for 10 years post-retirement with effectively 0% tax",
          "Jeffrey Foo meeting combined SRS annuity component with dividend plan for a total income stream of $3,500/month"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 12 — Policy Restructuring Masterclass
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m12-policy-restructuring",
    number: 12,
    title: "Policy Restructuring Masterclass",
    description: "Learn how to transform premium expenses into dividend income, identify redundant policies, and consolidate scattered coverage into optimized portfolios.",
    icon: "RefreshCcw",
    lessons: [
      {
        id: "m12-l1",
        title: "The Cash Flow Transformation",
        description: "Master the concept of converting premium expenses into dividend income — the most powerful restructuring pitch that turns skeptical clients into advocates.",
        durationMin: 5,
        narration: `This lesson teaches you the single most powerful concept in policy restructuring: turning a client from someone who pays premiums into someone who receives dividends. When you master this, you will close more restructuring cases than any other technique in your arsenal.

Let me paint the picture. Your client — let us call him Arthur Chang — is currently paying $5,300 per year in premiums across three old policies. That is money leaving his pocket every single month. He has been paying faithfully for 15 to 20 years. His combined cash surrender value across those policies is $132,000.

Here is the transformation. You show Arthur that if he surrenders those old policies and redirects the $132,000 into a PWV dividend plan earning 6 percent, he would generate approximately $12,000 per year in dividend income. Let that sink in. He was paying out $5,300. Now he is receiving $12,000. The net swing is $17,300 per year — a complete reversal of cash flow.

The script that closes this is devastatingly simple: "Instead of you paying the policy, the policy pays you." Practice that line. Say it with confidence. Let it land.

But here is why this works psychologically. You are not asking the client to spend more money. You are showing them how to use money they have already committed — money that is already inside the insurance ecosystem — and make it work harder. There is no new outflow. There is no additional financial burden. It is pure optimization.

The objection you will hear is: "But I lose my coverage if I surrender." This is where your preparation matters. You need to show that the old coverage is often inadequate, outdated, or redundant. A 20-year-old policy with $68,000 death benefit is not protecting anyone in today's cost environment. By restructuring, you can often increase coverage while simultaneously generating income.

In the Mr Tan case, we did exactly this. His old policies had a combined death benefit of $68,000 — barely enough to cover funeral costs. After restructuring, his new plan provided $500,000 in death benefit with zero additional premium, funded entirely by the restructured cash values. He went from paying $5,300 per year for inadequate coverage to receiving income with superior coverage.

This is not financial engineering. This is common sense presented professionally. And when clients see it laid out on paper — the before and after — they will ask you why nobody showed them this sooner.`,
        slides: [
          {
            heading: "The Core Concept: Expense → Income",
            bullets: [
              "Most clients are PAYING premiums on old policies ($3,000–$10,000/year)",
              "These policies have accumulated significant cash surrender values",
              "Restructuring converts that cash value into a dividend-generating asset",
              "The client goes from net negative to net positive cash flow",
              "No new money required — uses existing committed capital"
            ]
          },
          {
            heading: "The Arthur Chang Example",
            bullets: [
              "Current: 3 old policies, total premium $5,300/year",
              "Cash surrender value across all policies: $132,000",
              "Restructure: Surrender → invest in PWV dividend plan at 6%",
              "New income: ~$12,000/year in dividends",
              "Net swing: from -$5,300 to +$12,000 = $17,300/year improvement"
            ],
            table: {
              headers: ["Metric", "Before Restructuring", "After Restructuring"],
              rows: [
                ["Annual Premium Outflow", "-$5,300", "$0"],
                ["Annual Dividend Income", "$0", "+$12,000"],
                ["Death Benefit", "$68,000", "$500,000"],
                ["Net Annual Cash Flow", "-$5,300", "+$12,000"],
                ["Cash Flow Swing", "", "+$17,300/year"]
              ]
            }
          },
          {
            heading: "The Closing Script",
            bullets: [
              "This single sentence closes more restructuring cases than any other",
              "Say it with confidence and let it land — do not rush past it",
              "Follow up with the before/after table for visual impact"
            ],
            script: `"Instead of you paying the policy, the policy pays you. Let me show you exactly how this works with your numbers."`
          },
          {
            heading: "Handling the Coverage Objection",
            bullets: [
              "'But I lose my coverage if I surrender' — the #1 objection",
              "Show that old coverage is often inadequate ($68K death benefit in 2024?)",
              "Restructuring can INCREASE coverage while generating income",
              "Mr Tan: went from $68K to $500K death benefit with zero additional premium",
              "Key frame: 'Your old policy is costing you money AND underprotecting you'"
            ],
            script: `"I understand your concern about coverage. But look at these numbers — your current policies give you $68,000 in death benefit. Is that really protecting your family? After restructuring, you get $500,000 in coverage AND income. You are better protected and better funded."`
          }
        ],
        keyTakeaways: [
          "The cash flow transformation turns premium expense into dividend income",
          "Net swing can be $15,000–$20,000+ per year for clients with multiple old policies",
          "No new money required — restructuring uses existing cash surrender values",
          "Always show the before/after comparison table for maximum impact",
          "The closing line — 'Instead of you paying the policy, the policy pays you' — is your most powerful script"
        ],
        realExamples: [
          "Arthur Chang: $5,300/yr premiums restructured to $12,000/yr dividends = $17,300 swing",
          "Mr Tan: $68K death benefit upgraded to $500K with zero additional premium after restructuring"
        ]
      },
      {
        id: "m12-l2",
        title: "Identifying Redundant Policies",
        description: "Learn systematic methods to spot redundant coverage, underperforming investments within insurance, and overlapping policies — then present findings with credibility.",
        durationMin: 4,
        narration: `Before you can restructure, you need to identify what needs restructuring. This lesson gives you a systematic approach to auditing a client's existing portfolio and spotting the policies that are costing them money without delivering value.

The first category to look for is old Investment-Linked Policies — ILPs. These are policies that combine insurance coverage with investment returns, and they are almost always underperforming on both fronts. Here is the critical flaw with many older ILPs: if the client makes a critical illness claim, not only does the CI coverage terminate, but the entire investment component can be impacted. The client loses their coverage AND their savings in one event. When you explain this to clients, their reaction is always the same: shock and disbelief.

The second category is old endowment plans with guaranteed returns of 2 to 3 percent. These were attractive 15 years ago. Today, with PWV projecting 6 to 7 percent returns, these endowments are essentially losing money to inflation after accounting for fees. The opportunity cost is enormous.

The third category is overlapping coverage. Many clients, especially those who have been approached by multiple advisors over the years, have three or four CI policies from different insurers. They are over-insured in some areas and completely exposed in others.

Here is your diagnostic system. Use a simple color-coding framework: Green means keep — the policy is competitive, well-priced, and serving its purpose. Yellow means review — the policy might be worth keeping but needs closer examination. Red means restructure — the policy is clearly underperforming or redundant.

Now, here is the credibility-building technique that separates professionals from amateurs. During the meeting, ask the client to log into their insurance portals — GE, Prudential, AIA — right there on the spot. Pull up the actual policy details, the actual cash values, the actual coverage amounts. When you do this live, two things happen. First, you get accurate data instead of relying on the client's memory. Second, you build enormous trust because you are being completely transparent. The client sees everything you see.

In the Patwant Singh meeting, this portal review uncovered a Prudential maturity value the client had completely forgotten about — $41,000 sitting there unclaimed. That discovery alone justified the entire meeting and cemented the advisor's credibility. When you find money the client forgot they had, you become their hero.`,
        slides: [
          {
            heading: "Three Types of Redundant Policies",
            bullets: [
              "1. Old ILPs: CI claim can terminate BOTH coverage AND investment",
              "2. Old Endowments: 2–3% returns vs 6–7% available today",
              "3. Overlapping Coverage: Multiple CI/death policies from different insurers",
              "Most clients have at least one of these — your job is to find them"
            ]
          },
          {
            heading: "The Color-Coding Diagnostic System",
            bullets: [
              "GREEN — Keep: Competitive pricing, good returns, serves clear purpose",
              "YELLOW — Review: May be worth keeping, needs closer examination",
              "RED — Restructure: Clearly underperforming, redundant, or overpriced",
              "Present findings visually — clients respond to color-coded summaries",
              "Always explain WHY each policy got its color rating"
            ],
            table: {
              headers: ["Rating", "Criteria", "Action"],
              rows: [
                ["GREEN", "Competitive returns (>5%), unique coverage, low cost", "Keep as-is"],
                ["YELLOW", "Moderate returns (3–5%), some overlap, adequate cost", "Monitor annually"],
                ["RED", "Low returns (<3%), redundant coverage, high cost", "Restructure immediately"]
              ]
            }
          },
          {
            heading: "The Live Portal Review Technique",
            bullets: [
              "Ask clients to log into GE, Prudential, AIA portals DURING the meeting",
              "Pull actual policy details: cash values, coverage, premiums, maturity dates",
              "Builds massive trust through complete transparency",
              "Often uncovers forgotten policies or maturity values",
              "Pro tip: ask clients to prepare portal access BEFORE the meeting"
            ],
            script: `"Can we take five minutes to log into your insurance portals? I want to make sure we have the exact numbers — no guessing. You will see everything I see, and together we can identify what is working and what is not."`
          },
          {
            heading: "The ILP Trap Explained",
            bullets: [
              "ILPs combine insurance + investment in one product",
              "The fatal flaw: CI claim can terminate the investment component",
              "Client loses coverage AND savings in one event",
              "When you explain this, clients react with shock — use that momentum",
              "Compare: separate CI policy + separate investment = no cross-contamination"
            ]
          }
        ],
        keyTakeaways: [
          "Old ILPs are the most common source of redundant, risky coverage",
          "The color-coding system (Green/Yellow/Red) makes findings easy for clients to digest",
          "Live portal reviews build trust and often uncover forgotten assets",
          "Always ask clients to prepare portal access before the meeting to save time",
          "The ILP trap — CI claim destroying investments — is your strongest argument for restructuring"
        ],
        realExamples: [
          "Patwant Singh: live portal review uncovered a forgotten $41,000 Prudential maturity value",
          "Nov 30 client: three old ILPs identified as Red — all underperforming with overlapping CI coverage",
          "Karen Ng: portal access failure during meeting wasted 10 minutes — always prep clients beforehand"
        ]
      },
      {
        id: "m12-l3",
        title: "Consolidation Case Studies",
        description: "Three real restructuring case studies showing before-and-after transformations — from scattered, underperforming policies to optimized, income-generating portfolios.",
        durationMin: 5,
        narration: `Nothing teaches restructuring better than real cases. In this lesson, we break down three actual client transformations that demonstrate the power of consolidation. Study these cases because you will encounter similar situations in almost every pre-retiree meeting.

Case Study One: The Nov 30 Client. This client had three separate policies with a combined cash surrender value of $119,000. Their total death benefit across all three? Just $68,000. Think about that — $119,000 locked up in policies that would only pay out $68,000 if they died. The coverage was actually less than the cash value. After restructuring, we consolidated everything into a single plan that provided $500,000 in death benefit with no additional premium. The client's coverage increased by more than seven times, and they stopped paying the premiums they had been paying on the old policies. This is the kind of result that makes clients refer you to everyone they know.

Case Study Two: Patwant Singh. Patwant had roughly $300,000 scattered across multiple policies with different insurers. Each policy had been sold to him at different times by different advisors, and none of them talked to each other. The result was gaps in some areas and expensive overlaps in others. After a thorough consolidation, his projected portfolio value was restructured into a plan targeting over $1,000,000 in combined value. We eliminated the redundancies, closed the gaps, and created a coherent strategy where every dollar had a purpose.

Case Study Three: Elaine Ho. Elaine had $148,000 in existing investments spread across various instruments — some performing, some not. She was receiving minimal passive income from these investments. After restructuring into a dividend portfolio, she began generating approximately $24,000 per year in dividend income — that is $2,000 per month. For Elaine, this was transformative. She went from watching her investments fluctuate on a screen to receiving predictable, regular income deposits.

The common thread across all three cases is this: clients do not know what they have is underperforming until you show them. They have been told their policies are "good" by the advisors who sold them. Your role is to be the honest second opinion — the advisor who shows them the numbers, not the brochure. When you present these before-and-after tables with real math, the decision to restructure becomes obvious.`,
        slides: [
          {
            heading: "Case Study 1: Nov 30 Client — Coverage Multiplied",
            bullets: [
              "Before: 3 policies, $119K cash value, only $68K death benefit",
              "Problem: Coverage was LESS than the cash locked inside the policies",
              "After: Single consolidated plan, $500K death benefit, $0 additional premium",
              "Result: 7x coverage increase with zero new cost"
            ],
            script: `"You currently have $119,000 locked in policies that would only pay your family $68,000. That means your coverage is less than what you have already paid in. Let me show you how we fix this."`
          },
          {
            heading: "Case Study 2: Patwant Singh — Scattered to Strategic",
            bullets: [
              "Before: ~$300K across multiple policies from different insurers",
              "Problem: Gaps in some areas, expensive overlaps in others",
              "No coherent strategy — each policy sold independently",
              "After: Consolidated into projected $1M+ plan",
              "Result: Every dollar has a purpose, no redundancy, no gaps"
            ]
          },
          {
            heading: "Case Study 3: Elaine Ho — Investments to Income",
            bullets: [
              "Before: $148K in various investments, minimal passive income",
              "Problem: Portfolio fluctuating without generating usable cash flow",
              "After: Restructured into dividend portfolio",
              "Result: $24,000/year ($2,000/month) in predictable dividend income"
            ]
          },
          {
            heading: "Before & After Summary Table",
            bullets: [
              "Use this consolidated view when presenting restructuring to clients",
              "The visual comparison makes the decision obvious"
            ],
            table: {
              headers: ["Client", "Before (Cash Value)", "Before (Coverage/Income)", "After (Coverage/Income)", "Improvement"],
              rows: [
                ["Nov 30 Client", "$119K in 3 policies", "$68K death benefit", "$500K death benefit", "7x coverage, $0 extra premium"],
                ["Patwant Singh", "$300K scattered", "Gaps + overlaps", "Projected $1M+ plan", "Coherent strategy, full coverage"],
                ["Elaine Ho", "$148K investments", "Minimal income", "$24K/year dividends", "$2,000/month passive income"]
              ]
            }
          }
        ],
        keyTakeaways: [
          "Real case studies are your most convincing sales tool — memorize at least three",
          "Common pattern: clients have more cash value than coverage (policies working against them)",
          "Consolidation eliminates redundancy and creates coherent strategy",
          "Before-and-after tables make the restructuring decision feel obvious",
          "Clients do not know their policies are underperforming until you show them the comparison"
        ],
        realExamples: [
          "Nov 30 client: $119K cash value but only $68K death benefit — restructured to $500K death benefit at no extra cost",
          "Patwant Singh: $300K scattered across insurers consolidated into a $1M+ projected plan",
          "Elaine Ho: $148K investments restructured into $24K/year dividend portfolio"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 13 — Estate Planning Value-Add
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m13-estate-planning",
    number: 13,
    title: "Estate Planning Value-Add",
    description: "Position yourself as a holistic advisor by offering estate planning guidance — wills, LPAs, AMDs, insurance trusts, and consolidated portfolio summaries.",
    icon: "ScrollText",
    lessons: [
      {
        id: "m13-l1",
        title: "Will, LPA & AMD Basics",
        description: "Understand the three essential estate planning documents every pre-retiree needs, how to discuss them confidently, and why offering this as a free service differentiates you.",
        durationMin: 4,
        narration: `Estate planning is not your core product, but it is one of the most powerful differentiators in your toolkit. When you can walk a client through their Will, LPA, and AMD needs — and connect them with the right professionals to get it done — you move from being an insurance salesperson to being a trusted financial advisor.

Let us start with the Will. A Will distributes your assets after death. Without one, everything goes through intestacy laws — a slow, expensive, court-administered process that your family has to navigate during the worst time of their lives. A basic Will costs $300 to $500 to draft with a lawyer. Every client you meet should have one, and most do not.

Next is the Lasting Power of Attorney — the LPA. This is arguably the most important document and the most commonly overlooked. An LPA allows an appointed person to make decisions on your behalf if you lose mental capacity. Here is the critical point: you MUST set this up while you are healthy. If you wait until you have dementia or a stroke, it is too late. The court process to gain control of someone's affairs without an LPA is expensive, time-consuming, and emotionally draining for the family.

Third is the Advance Medical Directive — the AMD. This is a simple declaration that says: do not use extraordinary life-prolonging treatment if I am terminally ill with no hope of recovery. It is a deeply personal decision, but it is one that relieves enormous pressure from family members who would otherwise have to make that call.

And here is one that most advisors miss entirely: CPF nominations. Your CPF savings are separate from your Will. Without a CPF nomination, your CPF goes through intestacy laws regardless of what your Will says. This means delays, court costs, and your CPF may not go to who you intended.

The value-add here is huge. You are not charging for this advice. You are offering it as a free service — part of your comprehensive financial review. When you pull out a checklist of "Have you done your Will? LPA? AMD? CPF nomination?" and the client says no to three out of four, you have just demonstrated that they need an advisor who looks at the full picture. That advisor is you.

This is how you differentiate from the advisor who just pushes products. You care about the whole person, the whole family, the whole financial situation.`,
        slides: [
          {
            heading: "Three Essential Documents",
            bullets: [
              "1. Will — Distributes assets after death ($300–$500 to draft)",
              "2. LPA — Appoints decision-maker if you lose mental capacity",
              "3. AMD — No extraordinary life-prolonging treatment if terminally ill",
              "Most pre-retirees have NONE of these in place",
              "Offering guidance on all three positions you as a holistic advisor"
            ]
          },
          {
            heading: "The LPA Urgency",
            bullets: [
              "MUST be set up while the person is mentally healthy",
              "If you wait until dementia/stroke — it is too late",
              "Without LPA: court process is expensive and takes months",
              "Covers both personal welfare AND property/financial affairs",
              "Cost: $75 (subsidized) or $200–$500 (private lawyer)"
            ],
            script: `"Let me ask you something important. If something happened to you tomorrow — a stroke, an accident — who would manage your finances? Your CPF? Your property? Without an LPA, your family would need to go to court. And they cannot set one up on your behalf after the fact. This needs to be done while you are healthy."`
          },
          {
            heading: "The CPF Nomination Gap",
            bullets: [
              "CPF savings are SEPARATE from your Will",
              "Without a CPF nomination: CPF goes through intestacy laws",
              "Even if your Will says 'everything to my wife' — CPF follows its own rules",
              "Delays, court costs, and unintended distribution",
              "Takes 10 minutes on the CPF portal to fix"
            ]
          },
          {
            heading: "Positioning as a Free Value-Add",
            bullets: [
              "Do NOT charge for estate planning guidance",
              "Use a simple checklist: Will? LPA? AMD? CPF Nomination?",
              "Most clients say 'no' to 3 out of 4 — instant demonstration of value",
              "Connect clients with lawyers in your network for execution",
              "This differentiates you from product-pushers"
            ],
            script: `"Part of what I do for all my clients is a complete financial health check. That includes making sure the basics are in place — your Will, your LPA, your CPF nominations. These cost very little to set up but protect everything you have built. Let me walk you through what you need."`
          }
        ],
        keyTakeaways: [
          "Will, LPA, and AMD are the three essential estate planning documents",
          "LPA must be set up while healthy — cannot be done retroactively",
          "CPF nominations are separate from Wills and commonly overlooked",
          "Offering estate planning guidance for free is your strongest differentiator",
          "A simple four-item checklist (Will, LPA, AMD, CPF nomination) demonstrates immediate value"
        ],
        realExamples: [
          "Mr Ravi meeting: discovered he had no LPA despite being 62 — became the highest-urgency action item",
          "Multiple client meetings show that the estate planning checklist opens conversations about asset protection and policy structuring"
        ]
      },
      {
        id: "m13-l2",
        title: "Insurance Trust vs Nomination",
        description: "When and why to recommend an insurance trust over a simple nomination, especially for clients with complex family situations.",
        durationMin: 4,
        narration: `For most clients, a simple policy nomination is sufficient. You name a beneficiary, and when you pass away, the insurance payout goes directly to that person. Simple, fast, effective. But for clients with complex family situations, a nomination can actually create problems. That is where the insurance trust comes in.

Let me explain when a trust becomes necessary. Consider a client who is in a second marriage with children from both relationships. If he simply nominates his current wife, his children from the first marriage get nothing from the insurance payout. If he nominates his children, his current wife gets nothing. A nomination is all-or-nothing — it cannot set conditions or manage distribution over time.

An insurance trust solves this. The trust can specify exactly how the payout is distributed and under what conditions. For example: 40 percent to current wife immediately, 30 percent to eldest child at age 25, and 30 percent to youngest child at age 30. The trust can even set conditions — if the child graduates from university, they receive the full amount; if not, it is released in smaller portions. This level of control is impossible with a simple nomination.

From the Liao Chih Chung training, we learned an important caveat about the PWV product specifically: an insurance trust and a secondary insured are mutually exclusive. You cannot have both on the same PWV policy. This means if a client wants a trust structure, they need to forgo the secondary insured feature. For most complex family situations, the trust provides more value, but this is a conversation you need to have explicitly with the client.

The practical guidance for your meetings is this: for straightforward family situations — married, one set of children, no complications — a nomination is fine. For anything involving second marriages, children from multiple relationships, estranged family members, business succession, or large estates — recommend the insurance trust.

You are not the lawyer who sets up the trust. But you are the advisor who identifies the need, explains the benefits, and connects the client with the right legal professional. That referral alone is worth its weight in gold for your client relationship.`,
        slides: [
          {
            heading: "Nomination vs Insurance Trust",
            bullets: [
              "Nomination: Immediate payout to named person upon death",
              "Trust: Managed distribution with conditions and timing controls",
              "Nomination is simple but inflexible — all-or-nothing",
              "Trust adds cost and complexity but provides full control"
            ],
            table: {
              headers: ["Feature", "Simple Nomination", "Insurance Trust"],
              rows: [
                ["Payout Speed", "Immediate", "Managed by trustee"],
                ["Distribution Control", "None — lump sum to nominee", "Full — conditions, timing, percentages"],
                ["Cost", "Free", "$2,000–$5,000 setup"],
                ["Best For", "Simple family structures", "Complex families, large estates"],
                ["Can Set Conditions", "No", "Yes (age triggers, milestones)"]
              ]
            }
          },
          {
            heading: "When to Recommend a Trust",
            bullets: [
              "Second marriage with children from both relationships",
              "Children with different maturity levels or financial habits",
              "Estranged family members who should be excluded",
              "Business succession where insurance funds the buyout",
              "Large estates (>$1M insurance payout) needing structured distribution"
            ],
            script: `"Given your family situation, a simple nomination might not give you the control you need. With a trust, you can specify exactly who gets what, when, and under what conditions. For example, your daughter could receive 50% at age 25 and the remaining 50% at 30."`
          },
          {
            heading: "PWV-Specific Caveat",
            bullets: [
              "On PWV: insurance trust and secondary insured are MUTUALLY EXCLUSIVE",
              "Cannot have both on the same policy — must choose one",
              "Trust: full distribution control but no secondary insured benefit",
              "Secondary insured: policy continues after first death but no trust conditions",
              "For complex families, trust usually provides more value"
            ]
          },
          {
            heading: "Your Role in the Process",
            bullets: [
              "You IDENTIFY the need — you do not set up the trust yourself",
              "You EXPLAIN the benefits in plain language",
              "You CONNECT the client with a qualified estate planning lawyer",
              "You COORDINATE with the lawyer to ensure policy and trust align",
              "This referral strengthens your client relationship significantly"
            ]
          }
        ],
        keyTakeaways: [
          "Simple nominations work for straightforward families; trusts are for complex situations",
          "Trusts allow conditional distribution (age triggers, milestones, percentages)",
          "PWV caveat: insurance trust and secondary insured cannot coexist on the same policy",
          "Your role is to identify the need and connect the client with a lawyer",
          "The trust conversation positions you as a holistic advisor, not just a policy seller"
        ],
        realExamples: [
          "Liao Chih Chung training: detailed the mutual exclusivity of trust and secondary insured on PWV policies",
          "Second-marriage client scenario: trust structured as 40% to wife, 30% to each child at different age milestones"
        ]
      },
      {
        id: "m13-l3",
        title: "The Consolidated Portfolio Summary",
        description: "Create a one-page summary of all client assets, policies, and nominations that becomes your annual review trigger and ongoing engagement tool.",
        durationMin: 3,
        narration: `The consolidated portfolio summary is the simplest tool in your arsenal but one of the most effective for long-term client retention. It is a single page — physical or digital — that captures everything a client has: every policy, every CPF balance, every investment, every nomination.

Why does this matter? Because most clients have no idea what they own. Their policies are scattered across different insurers, their CPF balances are vaguely remembered, their nominations are outdated or nonexistent. When you create a single document that shows everything in one place, you become indispensable.

Here is the template structure. At the top: client name, NRIC, date of birth, contact details. Then a table of all policies: insurer, product name, sum assured, annual premium, key benefits, expiry date, and nominee. Below that: CPF balances broken down by OA, SA, MA, and RA. Then any other investments: stocks, unit trusts, fixed deposits, property. At the bottom: total coverage summary, total annual premiums, and gaps identified.

The gaps section is critical. This is where you note things like: "No critical illness coverage above $50,000," or "CPF nomination not updated since 2015," or "No LPA in place." These gaps become the agenda for your next meeting.

Here is the retention play. You deliver this summary — ideally via WhatsApp group chat with the client and their spouse — and you say: "I will update this for you every year. Any time something changes — a new policy, a CPF top-up, a change in family situation — just let me know and I will update your summary." That single promise gives you a legitimate reason to contact the client every single year. It is not a sales call. It is a service call. And every service call is an opportunity.

The delivery via WhatsApp group chat is deliberate. It includes both spouses, it is easily accessible on their phones, and it creates a direct communication channel that does not require email or formal meetings. When the client has a question at 9 PM, they message the group. When you have a promotion that fits their profile, you share it in the group. It is relationship management made effortless.`,
        slides: [
          {
            heading: "What the Summary Includes",
            bullets: [
              "Client details: Name, NRIC, DOB, contact information",
              "All policies: Insurer, product, sum assured, premium, benefits, expiry, nominee",
              "CPF balances: OA, SA, MA, RA breakdown",
              "Other investments: Stocks, unit trusts, FDs, property",
              "Total coverage, total premiums, and GAPS identified"
            ]
          },
          {
            heading: "The Template Structure",
            bullets: [
              "Section 1: Personal Information",
              "Section 2: Insurance Policies (table format)",
              "Section 3: CPF Balances (current + projected)",
              "Section 4: Investments & Savings",
              "Section 5: Estate Planning Status (Will, LPA, AMD, CPF Nomination)",
              "Section 6: Gaps & Recommendations"
            ],
            table: {
              headers: ["Insurer", "Product", "Sum Assured", "Premium/yr", "Benefits", "Expiry", "Nominee"],
              rows: [
                ["AIA", "PWV Gold", "$500,000", "$24,000", "Death + CI + Dividends", "Whole Life", "Spouse"],
                ["Prudential", "PRUShield", "As charged", "$1,200", "Hospital & Surgical", "Renewable", "N/A"],
                ["GE", "Endowment Plus", "$50,000", "$3,600", "Maturity + Death", "2028", "Child (outdated)"]
              ]
            }
          },
          {
            heading: "The Annual Review Trigger",
            bullets: [
              "Deliver via WhatsApp group chat with client + spouse",
              "Promise annual updates: 'I will refresh this every year for you'",
              "Every update = legitimate reason to contact the client",
              "Not a sales call — a SERVICE call (that creates sales opportunities)",
              "Gaps section becomes the agenda for the next meeting"
            ],
            script: `"I have put together a consolidated summary of everything you have — all your policies, CPF, investments, and nominations on one page. I will update this for you every year. If anything changes in between — a new policy, a family change — just message me and I will update it right away."`
          }
        ],
        keyTakeaways: [
          "A one-page consolidated summary makes you indispensable to clients",
          "The gaps section is your built-in agenda for future meetings",
          "Deliver via WhatsApp group chat for maximum accessibility",
          "The annual update promise gives you a legitimate recurring touchpoint",
          "Every service call is an opportunity — but only if you lead with value first"
        ],
        realExamples: [
          "Multiple client meetings used the portfolio summary as the starting point for restructuring conversations",
          "WhatsApp group chats with both spouses became the primary communication channel for ongoing advisory"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 14 — Digital Tools & Technology
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m14-digital-tools",
    number: 14,
    title: "Digital Tools & Technology",
    description: "Master the digital tools that make you efficient and credible — SingPass portal navigation, WhatsApp follow-up systems, and financial calculator mastery.",
    icon: "Smartphone",
    lessons: [
      {
        id: "m14-l1",
        title: "SingPass & Portal Walkthrough",
        description: "Navigate CPF portals, MyInfo, and insurance portals during live meetings to pull real data and build trust through transparency.",
        durationMin: 4,
        narration: `The most credible thing you can do in a client meeting is work with real numbers — not projections, not estimates, not brochure figures. Real numbers from the client's own accounts. This lesson teaches you how to navigate the key digital portals fluently so you never fumble in front of a client.

Let us start with the CPF portal via SingPass. The flow is straightforward: SingPass login, navigate to CPF, and you will see the dashboard showing OA, SA, MA, and RA balances. From there, you can access the CPF Life estimator which projects monthly payouts based on current balances. This is gold for your retirement gap analysis. You pull up their projected CPF Life payout, compare it to their desired monthly retirement income, and the gap is right there on screen — not from your spreadsheet, from the government's own calculator.

MyInfo is another powerful tool. When a client authorizes MyInfo access, you get instant fact-finding data: name, NRIC, address, employment, income range, CPF balances, and more. This eliminates the tedious manual fact-finding process and shows the client you respect their time.

For insurance portals — AIA iServe, Prudential PruAccess, Great Eastern's portal — each gives you live policy details: current cash values, coverage amounts, premium schedules, and nomination details. Logging into these during the meeting is the live portal review technique we discussed in the restructuring module. It builds enormous trust.

Now here is the cautionary tale. In Karen Ng's meeting, the portal access failed because she could not remember her SingPass password. Ten minutes of the meeting were spent trying to reset it. Ten minutes of awkward silence and frustration. The lesson is simple: always ask clients to log into their CPF portal BEFORE the meeting. Send a message the day before: "Tomorrow, it would be helpful if you could log into your CPF portal via SingPass before our session. That way we can review your exact balances together without any delays."

This one simple preparation step — sending that pre-meeting message — saves time, avoids embarrassment, and ensures you have the real data you need to deliver a compelling analysis. Technology is only powerful when it works smoothly. Your job is to make sure it does.`,
        slides: [
          {
            heading: "The SingPass → CPF Flow",
            bullets: [
              "Step 1: Client logs into SingPass (fingerprint/face ID on mobile)",
              "Step 2: Navigate to CPF portal → Dashboard",
              "Step 3: View OA, SA, MA, RA balances (real-time)",
              "Step 4: Access CPF Life estimator → projected monthly payouts",
              "Step 5: Compare projected payout vs desired retirement income = THE GAP"
            ]
          },
          {
            heading: "Insurance Portal Navigation",
            bullets: [
              "AIA iServe: policy details, cash values, coverage, premiums",
              "Prudential PruAccess: similar — live policy data and maturity values",
              "Great Eastern Portal: policy overview, claims history, nominations",
              "Pro tip: bookmark all three portals on your tablet for quick access",
              "Logging in live during the meeting = maximum trust and transparency"
            ],
            table: {
              headers: ["Portal", "Key Data Available", "Common Issues"],
              rows: [
                ["CPF (via SingPass)", "OA/SA/MA/RA balances, Life estimator", "Password resets, 2FA delays"],
                ["AIA iServe", "Cash values, coverage, premiums, nominees", "First-time registration required"],
                ["Prudential PruAccess", "Policy details, maturity values", "Forgotten credentials"],
                ["GE Portal", "Policy overview, claims, nominations", "Slow loading on mobile"]
              ]
            }
          },
          {
            heading: "The Pre-Meeting Preparation Message",
            bullets: [
              "Send the day before every meeting — saves 10+ minutes",
              "Ask client to log into SingPass and CPF portal in advance",
              "Verify they can access their insurance portals too",
              "This avoids the Karen Ng scenario (10 min lost to password reset)"
            ],
            script: `"Hi [Client], looking forward to our meeting tomorrow. It would be really helpful if you could log into your CPF portal via SingPass before we start — just to make sure everything is accessible. That way we can jump straight into reviewing your exact numbers together. See you at [time]!"`
          },
          {
            heading: "MyInfo for Instant Fact-Finding",
            bullets: [
              "Client authorizes MyInfo → instant access to personal and financial data",
              "Eliminates tedious manual fact-finding forms",
              "Shows respect for the client's time",
              "Data includes: name, NRIC, address, employment, income range, CPF",
              "Always explain why you need it and how the data is protected"
            ]
          }
        ],
        keyTakeaways: [
          "Real numbers from portals are infinitely more credible than brochure projections",
          "Always send a pre-meeting message asking clients to prepare SingPass access",
          "The CPF Life estimator is your strongest tool for demonstrating the retirement gap",
          "Live portal reviews during meetings build trust through complete transparency",
          "Bookmark all insurance portals on your tablet for seamless navigation"
        ],
        realExamples: [
          "Karen Ng: 10 minutes lost to SingPass password reset — now always send prep message the day before",
          "Kyaw Min Htut: pulling up CPF portal live showed OA $108K and SA $76K, driving the SA transfer recommendation",
          "Patwant Singh: live GE portal review uncovered forgotten $41K Prudential maturity value"
        ]
      },
      {
        id: "m14-l2",
        title: "WhatsApp Follow-up Systems",
        description: "Build a systematic WhatsApp follow-up cadence that keeps clients engaged and moves them toward decisions without being pushy.",
        durationMin: 3,
        narration: `Your meeting was excellent. The client was engaged, asked great questions, and seemed genuinely interested. And then... silence. No response to your follow-up email. No call back. The deal goes cold. This happens because most advisors do not have a follow-up system. They rely on ad hoc emails and hope. Hope is not a strategy.

WhatsApp is your follow-up weapon. Not email, not phone calls — WhatsApp. Here is why: everyone checks WhatsApp multiple times a day. Emails get buried. Phone calls feel intrusive. WhatsApp messages feel personal but non-invasive, and the read receipts tell you if your message was seen.

The first step is creating the client group chat immediately after the meeting — ideally before you even leave the venue. If the client is married, include both spouses. Name the group something professional: "Financial Review — [Client Name]." This group becomes the single channel for all communication about their financial plan.

Now here is the cadence. Same day: send a meeting summary. Keep it concise — three to five bullet points covering what you discussed, what was agreed, and next steps. This shows professionalism and gives the client a reference document. Day three: send the proposal PDF with a brief message highlighting the key numbers. Day seven: a gentle follow-up — "Hi [Client], just checking if you had a chance to review the proposal. Happy to clarify anything." Day fourteen: a check-in that adds value, not pressure — share a relevant article, a promotion update, or a market insight.

For each stage, have template messages ready. You should not be composing follow-up messages from scratch every time. Customize the template with the client's specific numbers and situation, but the structure should be consistent.

The beauty of the group chat is that it persists. Six months later, when a new promotion launches that fits the client's profile, you can share it directly in their group. It is not a cold outreach — it is a continuation of an existing conversation. That is the difference between following up and spamming.`,
        slides: [
          {
            heading: "Why WhatsApp Beats Everything Else",
            bullets: [
              "Checked multiple times daily (vs email: once or twice)",
              "Feels personal and non-invasive (vs phone calls: intrusive)",
              "Read receipts tell you if the message was seen",
              "Group chats include both spouses for aligned decision-making",
              "Persists as an ongoing communication channel for months/years"
            ]
          },
          {
            heading: "The Follow-Up Cadence",
            bullets: [
              "Same day: Meeting summary (3–5 bullet points + next steps)",
              "Day 3: Proposal PDF with key numbers highlighted",
              "Day 7: Gentle follow-up — 'Any questions on the proposal?'",
              "Day 14: Value-add check-in (article, promotion, market insight)",
              "Beyond: Ongoing channel for promotions and annual reviews"
            ],
            table: {
              headers: ["Timing", "Message Type", "Purpose"],
              rows: [
                ["Same day", "Meeting summary", "Demonstrate professionalism, create reference"],
                ["Day 3", "Proposal PDF", "Move to formal consideration"],
                ["Day 7", "Gentle follow-up", "Check engagement, answer questions"],
                ["Day 14", "Value-add content", "Stay top-of-mind without pressure"],
                ["Ongoing", "Promotions & reviews", "Long-term relationship maintenance"]
              ]
            }
          },
          {
            heading: "Template Messages",
            bullets: [
              "Have templates ready for each cadence stage — do not compose from scratch",
              "Customize with client-specific numbers and details",
              "Keep messages concise — 3–5 lines maximum",
              "Always end with a question or clear next step"
            ],
            script: `Same-day template: "Hi [Client], great meeting today! Here is a quick summary: (1) We reviewed your CPF balances — OA $X, SA $Y. (2) Identified a retirement income gap of $Z/month. (3) Discussed the PWV dividend plan to close that gap. I will send the detailed proposal in the next day or two. Let me know if you have any questions in the meantime!"`
          }
        ],
        keyTakeaways: [
          "Create the WhatsApp group chat immediately after every meeting",
          "Include both spouses in the group for aligned decision-making",
          "Follow the 0-3-7-14 day cadence for systematic follow-up",
          "Use template messages customized with client-specific details",
          "The group chat becomes a persistent channel for long-term relationship management"
        ],
        realExamples: [
          "All post-meeting observations showed that same-day WhatsApp summaries dramatically improved response rates",
          "Couple meetings where only one spouse was in the chat often stalled — always include both"
        ]
      },
      {
        id: "m14-l3",
        title: "Financial Calculator Mastery",
        description: "Master the Total Wealth Concept tool, retirement lifestyle calculator, and policy growth charts to deliver compelling visual presentations.",
        durationMin: 4,
        narration: `Your financial calculators are not just number-crunching tools — they are storytelling devices. When used correctly, they transform abstract concepts like inflation, compounding, and income streams into visual narratives that clients can see and feel. This lesson covers the three most important tools and how to use them for maximum impact.

The Total Wealth Concept tool is your primary presentation weapon. It maps out a client's entire financial picture: current assets, projected growth, income needs, and gaps. The key feature is the inflation toggle. Here is the technique: first show the client their retirement expenses WITHOUT inflation — "You need $5,000 a month." Then toggle inflation on — "But with 3 percent inflation, by the time you are 65, you will need $7,000 a month. And at 75, $9,500 a month." The visual of that line stretching upward is more powerful than any verbal explanation. You are literally stretching the problem on screen before presenting the solution.

The retirement lifestyle calculator lets you work backwards from desired lifestyle to required savings. The client tells you they want to retire at 62 with $6,000 per month. The calculator shows exactly how much they need to save and invest starting today. It makes the abstract concrete and the overwhelming manageable.

The policy growth chart shows how a PWV or similar product grows over time, including projected dividends. Switch to dividend mode to show income streams rather than capital growth. For income-focused clients — which is most pre-retirees — seeing a steady stream of annual dividends is far more compelling than seeing a total value number.

The presenter mode feature gives you a clean, client-facing view without the backend clutter. Always use this in meetings. And here is a practical tip from training: master the undo function. When you are adjusting numbers in front of a client and make an error, fumbling to fix it breaks your flow and credibility. A quick undo keeps the presentation smooth.

Finally, the competitive analysis tool allows you to compare AIA fund structures against Manulife and Prudential side by side. Use this when a client says "my friend's advisor says Manulife is better." Pull up the comparison, show the data, and let the numbers speak.`,
        slides: [
          {
            heading: "The Inflation Toggle Technique",
            bullets: [
              "Start: Show retirement expenses WITHOUT inflation ($5,000/mo)",
              "Toggle ON: Show with 3% inflation ($7,000 at 65, $9,500 at 75)",
              "The visual of the rising line creates urgency without words",
              "Rule: Always stretch the problem BEFORE presenting the solution",
              "Let the client sit with the gap for a moment — then offer the answer"
            ],
            script: `"Right now you need $5,000 a month. But watch what happens when I turn on inflation..." [toggle] "...by 65, that same lifestyle costs $7,000. By 75, $9,500. The money you need keeps going up, but your CPF payout stays flat. That gap is what we need to solve."`
          },
          {
            heading: "Dividend Mode vs Growth Mode",
            bullets: [
              "Growth mode: Shows total portfolio value over time (good for accumulators)",
              "Dividend mode: Shows annual income streams (ideal for pre-retirees)",
              "Pre-retirees care about INCOME, not portfolio value",
              "Switch to dividend mode when presenting PWV to retirement-focused clients",
              "Show the income stream alongside CPF Life payouts for the full picture"
            ]
          },
          {
            heading: "Presenter Mode & Practical Tips",
            bullets: [
              "Always use Presenter Mode in client meetings — clean, professional view",
              "Master the Undo function — fumbling with errors breaks credibility",
              "Practice with 5 different client scenarios before your first live meeting",
              "Save client scenarios so you can pull them up again in follow-up meetings",
              "Competitive analysis tool: compare AIA vs Manulife vs Prudential side by side"
            ]
          },
          {
            heading: "The Competitive Analysis Response",
            bullets: [
              "Client: 'My friend says Manulife/Prudential is better'",
              "Pull up the comparison tool — show fund structures side by side",
              "Let the data speak — never badmouth competitors",
              "Focus on: dividend track record, fund flexibility, total returns",
              "Key phrase: 'Let me show you the comparison so you can decide based on facts'"
            ],
            script: `"That is a fair question, and I am glad you are doing your research. Let me pull up a side-by-side comparison so you can see exactly how the fund structures differ. I want you to make this decision based on data, not sales pitches — including mine."`
          }
        ],
        keyTakeaways: [
          "The inflation toggle technique is your strongest visual urgency tool",
          "Always stretch the problem on screen before presenting the solution",
          "Use dividend mode (not growth mode) when presenting to pre-retirees",
          "Presenter mode keeps client meetings clean and professional",
          "Master the undo function and practice with multiple scenarios before live meetings"
        ],
        realExamples: [
          "Leo's team training emphasized the inflation toggle as the single most effective calculator technique",
          "Multiple meetings used the competitive analysis tool when clients mentioned competing advisors"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 15 — Real Meeting Breakdowns
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m15-real-meetings",
    number: 15,
    title: "Real Meeting Breakdowns",
    description: "Step-by-step analysis of real client meetings — from opening to close — showing exactly how top advisors structure conversations and handle objections.",
    icon: "Video",
    lessons: [
      {
        id: "m15-l1",
        title: "PWV Opening — The Kyaw Min Htut Case",
        description: "Full play-by-play of a real opening appointment showing how to establish the retirement gap using the client's own numbers and transition from problem to solution.",
        durationMin: 5,
        narration: `This is a real opening appointment broken down move by move. Study this case because it demonstrates every principle we have covered so far — applied in a live client conversation.

Client profile: Kyaw Min Htut. Singapore PR for 19 years. Monthly salary: $8,000. CPF balances: OA $108,000, SA $76,000. US stocks worth approximately $80,000 USD. Overseas properties. Cash ready to invest: $100,000. This is a strong financial profile, but as you will see, even financially comfortable clients have retirement gaps.

The advisor applied the 4-step Golden Framework. Step one: establish rapport and fact-find. The advisor did not jump into products. He spent the first 15 minutes understanding Kyaw's situation — his career timeline as a PR, his family situation, his retirement vision. He asked: "What does a comfortable retirement look like for you?" Kyaw said $5,000 per month. That number became the anchor for everything that followed.

Step two: quantify the gap. Using Kyaw's own CPF balances, the advisor pulled up the CPF Life estimator. Projected CPF Life payout: roughly $1,800 per month. Kyaw needs $5,000. That is a $3,200 monthly gap. But it does not stop there. The advisor toggled on inflation. At age 65, that $5,000 lifestyle costs $7,000. At age 75, $9,500. Suddenly the gap is not $3,200 — it is $5,200 or more. Kyaw's expression changed when he saw those numbers. Not because the advisor told him he had a problem, but because his own numbers showed it.

Step three: present the solution. With the gap clearly established, the advisor introduced the PWV single premium option at $100,000 — the exact amount Kyaw had said he was ready to invest. This is critical: the advisor did not suggest an amount. He used the client's own stated capacity. The $100,000 invested in PWV at projected returns would generate a supplementary income stream that, combined with CPF Life, would close the gap.

Step four: secure commitment. The meeting ended with Kyaw agreeing to the $100,000 PWV single premium. The key lesson from this case is deceptively simple: always use the client's own numbers. When you use generic examples, clients can dismiss them. When you use their CPF balance, their income, their stated retirement goal — they cannot look away. The numbers are theirs, and so is the gap.`,
        slides: [
          {
            heading: "Client Profile: Kyaw Min Htut",
            bullets: [
              "Singapore PR for 19 years, salary $8,000/month",
              "CPF: OA $108,000, SA $76,000",
              "US stocks: ~$80,000 USD, overseas properties",
              "Cash ready to invest: $100,000",
              "Retirement goal: $5,000/month"
            ]
          },
          {
            heading: "Step 1–2: Rapport & Gap Establishment",
            bullets: [
              "First 15 minutes: understanding situation, not pitching products",
              "Key question: 'What does a comfortable retirement look like for you?'",
              "CPF Life estimator pulled up on portal: projected payout ~$1,800/mo",
              "Gap without inflation: $5,000 - $1,800 = $3,200/mo",
              "Gap WITH inflation: $7,000 - $1,800 = $5,200/mo at 65"
            ],
            table: {
              headers: ["Age", "Monthly Need (with inflation)", "CPF Life Payout", "Monthly Gap"],
              rows: [
                ["Today", "$5,000", "N/A", "N/A"],
                ["At 65", "$7,000", "$1,800", "$5,200"],
                ["At 75", "$9,500", "$1,800", "$7,700"],
                ["At 85", "$12,800", "$1,800 (may deplete)", "$11,000+"]
              ]
            }
          },
          {
            heading: "Step 3–4: Solution & Commitment",
            bullets: [
              "Solution: PWV single premium at $100,000 (client's stated investment capacity)",
              "Critical: used client's OWN stated amount — did not suggest a figure",
              "Projected supplementary income stream to close the retirement gap",
              "Combined CPF Life + PWV dividends = closer to $5,000/mo target",
              "Meeting outcome: client agreed to $100,000 PWV single premium"
            ],
            script: `"Based on what you have shown me today — your CPF projecting $1,800 a month and your goal of $5,000 — we need to build an additional $3,200 in monthly income. With the $100,000 you mentioned you are ready to invest, let me show you how a dividend plan can close that gap."`
          },
          {
            heading: "Key Lesson: Always Use the Client's Own Numbers",
            bullets: [
              "Generic examples can be dismissed — the client's own numbers cannot",
              "Their CPF balance, their income, their stated goal = their gap",
              "The advisor never told Kyaw he had a problem — the numbers did",
              "The inflation toggle made the gap visceral, not theoretical",
              "Match the solution to the client's stated investment capacity"
            ]
          }
        ],
        keyTakeaways: [
          "The 4-step Golden Framework structures every opening appointment",
          "Spend the first 15 minutes understanding the client, not pitching",
          "Always use the client's own numbers from their CPF portal",
          "The inflation toggle transforms a manageable gap into an urgent one",
          "Match the proposed investment to the client's stated capacity — never suggest an amount"
        ],
        realExamples: [
          "Kyaw Min Htut: $100K PWV single premium closed in one meeting by using his own CPF data and stated retirement goal of $5,000/mo"
        ]
      },
      {
        id: "m15-l2",
        title: "PWV Pitch — The Jeffrey Foo Deep Dive",
        description: "A 127-minute masterclass broken down — the healthcare cost angle, premium structure comparison, SRS-linked annuity, and the 'dividends fund your hospital plan' close.",
        durationMin: 5,
        narration: `The Jeffrey Foo meeting was a 127-minute masterclass in financial advisory. It is the longest meeting in our case study library, and it is long because the advisor left no stone unturned. Let us break down why this meeting worked and how you can replicate its most powerful elements.

Client profile: Jeffrey Foo. Existing AIA client. His hospital plan was costing over $1,000 per month, and healthcare costs were his deepest concern. He was not worried about retirement lifestyle — he was terrified of medical bills bankrupting his family. This is a critical insight: different clients have different fear triggers. Jeffrey's was healthcare, not lifestyle.

The advisor leaned into this fear with data. He showed cumulative medical costs projections: $200,000 to $400,000 or more by age 85, depending on health conditions. He did not minimize the fear. He validated it with numbers. "You are right to be concerned. The numbers show that your concern is actually understated." This validation technique — agreeing with the client's fear and then showing it is even worse than they thought — creates intense motivation to act.

Then came the premium structure comparison. The advisor presented two options. Option A: $24,000 per year with full flexibility — the client can adjust, pause, or withdraw. Option B: $42,000 per year with higher bonus rates but a 7-year lock-in commitment. By presenting two options, the advisor gave Jeffrey a choice between plans rather than a choice between buying and not buying. This is a fundamental closing technique.

The SRS component was particularly clever. Jeffrey had $156,000 in SRS contributions. The advisor structured an SRS-linked annuity that would generate $3,154 per month for 10 years after retirement. Combined with the PWV dividends, the total projected income stream was approximately $3,500 per month.

And here was the kill shot — the line that closed the deal: "Your dividends fund your hospital plan." Think about what this means. Jeffrey's biggest fear was healthcare costs. The advisor showed that the dividend income from the PWV plan would more than cover his hospital plan premiums. The very product he was being sold would eliminate the very fear that kept him up at night. The dividends pay for the hospital plan. The hospital plan covers the medical costs. The circle is complete.

For healthcare-anxious clients, this is the most powerful pitch in your arsenal. Memorize it. Practice it. Use it.`,
        slides: [
          {
            heading: "Client Profile: Jeffrey Foo",
            bullets: [
              "Existing AIA client, hospital plan costing $1,000+/month",
              "Primary concern: healthcare costs, not retirement lifestyle",
              "Deeply anxious about medical bills bankrupting family",
              "Meeting duration: 127 minutes (thorough, methodical approach)",
              "Key insight: identify the client's specific fear trigger"
            ]
          },
          {
            heading: "The Healthcare Cost Angle",
            bullets: [
              "Cumulative medical costs by 85: $200,000–$400,000+",
              "Validated the fear: 'Your concern is actually understated'",
              "Validation technique: agree with fear, then show it is worse",
              "This creates intense motivation to act — not paralysis",
              "Data-driven fear validation beats emotional manipulation every time"
            ],
            table: {
              headers: ["Age", "Cumulative Medical Costs (Est.)", "Hospital Plan Premium (Annual)"],
              rows: [
                ["65", "$50,000–$100,000", "$12,000"],
                ["70", "$100,000–$200,000", "$15,000"],
                ["75", "$150,000–$300,000", "$18,000"],
                ["80", "$200,000–$400,000", "$22,000+"],
                ["85", "$300,000–$500,000+", "$25,000+"]
              ]
            }
          },
          {
            heading: "Premium Structure: Two-Option Close",
            bullets: [
              "Option A: $24,000/year — full flexibility (adjust, pause, withdraw)",
              "Option B: $42,000/year — higher bonuses, 7-year lock-in",
              "Presenting two options = choice between PLANS, not between buying or not",
              "Jeffrey chose Option A ($24,000/year) for the flexibility",
              "SRS component: $156K contributions → $3,154/month for 10 years"
            ]
          },
          {
            heading: "The Kill Shot: 'Dividends Fund Your Hospital Plan'",
            bullets: [
              "Combined income stream: SRS + dividends = ~$3,500/month",
              "Hospital plan premium: ~$1,000/month",
              "Dividends MORE than cover the hospital plan costs",
              "The product eliminates the very fear that motivated the purchase",
              "This is the most powerful pitch for healthcare-anxious clients"
            ],
            script: `"Jeffrey, here is what I want you to see. Your biggest concern is your hospital plan costs — $1,000 a month and rising. This dividend plan generates $3,500 a month. Your dividends fund your hospital plan. The very thing you are worried about is covered by the very plan we are setting up. You do not have to worry about medical costs eating into your savings — the plan pays for itself."`
          }
        ],
        keyTakeaways: [
          "Identify the client's specific fear trigger — it is not always retirement lifestyle",
          "The validation technique: agree with the fear, then show the data is even worse",
          "Present two options to make the choice between plans, not between buying or not",
          "SRS-linked annuity components can add $3,000+/month to the income stream",
          "For healthcare-anxious clients: 'Your dividends fund your hospital plan' is the most powerful close"
        ],
        realExamples: [
          "Jeffrey Foo: 127-minute meeting closed with $24K/year PWV, SRS annuity generating $3,154/month, combined $3,500/month income stream covering hospital plan costs"
        ]
      },
      {
        id: "m15-l3",
        title: "PWV Close — The Thian Boon Meng Conversion",
        description: "How a multi-meeting prospect was converted using restructuring revelations, capital preservation products, and a travel-deadline close tied to the client's own schedule.",
        durationMin: 5,
        narration: `Some clients do not close in one meeting. Thian Boon Meng was one of those. He had been a prospect across multiple meetings, and each time he was interested but not ready. This case study shows you how to convert a multi-meeting prospect by finding the right angle and the right urgency trigger.

Client profile: SRS account with $151,000. Total portfolio value of approximately $411,000 earning roughly 2 percent returns across three underperforming policies. He was also planning to travel to Korea on October 6th. That travel date turned out to be the key.

The breakthrough came when the advisor showed Thian what his 2 percent returns actually meant in real terms. After inflation at 3 percent, his portfolio was effectively shrinking by 1 percent per year. He was not growing his wealth — he was slowly losing it. This restructuring revelation — the moment the client realizes their current strategy is working against them — is the turning point in almost every conversion.

The advisor then presented the Platinum Gift of Life product at $120,000. The structure was simple and appealing: 1.5 percent in years one and two, then 3.6 percent from year three onward, with full capital preservation. For a risk-averse client earning 2 percent, the jump to 3.6 percent with zero capital risk was compelling. And the 10 percent welcome bonus promotion added urgency — that bonus was ending at month's end.

Now here is the closing technique that made this case special. The advisor did not use an artificial deadline. He used Thian's own schedule. "The 10 percent welcome bonus ends this month, and you are flying to Korea on October 6th. If we get this done before you travel, you lock in the bonus and you can enjoy your trip knowing everything is in place. If you wait until after Korea, the promotion may be gone."

This is the travel and life event close technique. You tie the urgency to something real in the client's life — a trip, a birthday, a child's graduation, a property settlement. It does not feel like a salesperson's pressure tactic because it is genuinely aligned with the client's timeline. The client feels you are helping them coordinate, not pushing them to buy.

Thian signed before his Korea trip. The lesson is clear: when artificial urgency fails, find real urgency in the client's own calendar. Everyone has deadlines. Your job is to align your solution with theirs.`,
        slides: [
          {
            heading: "Client Profile: Thian Boon Meng",
            bullets: [
              "SRS account: $151,000",
              "Total portfolio: ~$411,000 at approximately 2% returns",
              "Three underperforming policies from various insurers",
              "Planned travel: Korea trip on October 6th",
              "Multi-meeting prospect — interested but never committed"
            ]
          },
          {
            heading: "The Restructuring Revelation",
            bullets: [
              "Current returns: ~2% across portfolio",
              "Inflation: ~3% annually",
              "Real return: NEGATIVE 1% — portfolio shrinking every year",
              "This realization is the turning point in every conversion",
              "Key phrase: 'Your money is not growing — it is slowly disappearing'"
            ],
            script: `"Thian, let me show you something important. Your portfolio is earning about 2 percent. Inflation is running at 3 percent. That means in real terms, your money is losing 1 percent of its purchasing power every year. After 10 years, your $411,000 buys what $370,000 buys today. You are going backwards."`
          },
          {
            heading: "The Product: Platinum Gift of Life",
            bullets: [
              "Investment: $120,000 single premium",
              "Returns: 1.5% in years 1–2, 3.6% from year 3 onward",
              "Full capital preservation — zero downside risk",
              "10% welcome bonus promotion (ending that month)",
              "For a risk-averse client at 2%, the jump to 3.6% is compelling"
            ],
            table: {
              headers: ["Feature", "Current Portfolio", "Platinum Gift of Life"],
              rows: [
                ["Annual Return", "~2%", "3.6% (from year 3)"],
                ["Capital Risk", "Variable (market exposure)", "Fully preserved"],
                ["Welcome Bonus", "None", "10% (limited-time)"],
                ["Real Return (after inflation)", "-1%", "+0.6%"],
                ["10-Year Projected Growth", "Declining purchasing power", "Steady positive growth"]
              ]
            }
          },
          {
            heading: "The Travel/Life Event Close",
            bullets: [
              "Artificial deadlines feel pushy — real deadlines feel helpful",
              "Thian's Korea trip on October 6th = natural deadline",
              "10% welcome bonus ending same month = product deadline",
              "Combined: 'Lock in the bonus before you travel, enjoy your trip worry-free'",
              "Always look for real events in the client's calendar to anchor urgency"
            ],
            script: `"The 10 percent welcome bonus ends this month, and you are flying to Korea on October 6th. If we finalize this before your trip, you lock in the bonus and you can enjoy Korea knowing everything is in place. What do you think — can we get the paperwork done this week?"`
          }
        ],
        keyTakeaways: [
          "Multi-meeting prospects need a breakthrough moment — the restructuring revelation",
          "Show that 2% returns with 3% inflation means the portfolio is SHRINKING",
          "Capital preservation products appeal strongly to risk-averse clients",
          "The travel/life event close ties urgency to the client's own calendar, not artificial pressure",
          "Combine product promotion deadlines with real life events for maximum urgency"
        ],
        realExamples: [
          "Thian Boon Meng: $120K Platinum Gift of Life closed before his Korea trip, locking in 10% welcome bonus"
        ]
      },
      {
        id: "m15-l4",
        title: "Couple Dynamics — The Karen Ng Session",
        description: "Selling to a pragmatic businesswoman — how to pivot your emotional hooks and use live portal discoveries to create momentum with quick decision-makers.",
        durationMin: 4,
        narration: `Not every client fits the standard emotional playbook. Karen Ng was a pragmatic businesswoman who ran a dialysis business and commuted daily between Johor Bahru and Singapore. She was sharp, direct, and had zero patience for emotional manipulation. This case study teaches you how to adapt your approach for the pragmatic client.

The first challenge was her unique situation. She had a $500,000 mortgage, PR status not citizenship, and a daily commute that meant her time was precious. Any meeting with Karen needed to be efficient and value-packed. No fluff.

The second challenge — and this is the key insight — was her attitude toward inheritance. She explicitly said: "I do not want to leave too much to my daughter. She should fight for herself." For most advisors, the legacy and inheritance angle is a primary emotional hook. With Karen, that hook was not just ineffective — it would have been counterproductive.

The pivot was critical. Instead of framing the dividend plan as inheritance and legacy, the advisor reframed it as self-funding for retirement. "This is not about leaving money behind. This is about making sure YOU have enough for the next 30 years without relying on anyone — not your daughter, not the government, not anyone." That reframe aligned perfectly with Karen's independent, self-reliant worldview.

Karen was a quick decision-maker. Once she saw the numbers — $24,000 per year dividend plan, projected returns, income streams — she chose with minimal hesitation. She did not need three meetings. She did not need to "think about it." She needed clean data and a compelling return.

The bonus moment came during the live portal review. While checking Karen's existing policies, the advisor discovered a $41,000 Prudential maturity that Karen had completely forgotten about. Finding money the client forgot they had instantly elevated the advisor's credibility and demonstrated the value of the comprehensive review.

The lesson from Karen is simple but important: not every client needs the same emotional hook. Pragmatic clients respond to straightforward ROI. Legacy-focused clients respond to family protection. Healthcare-anxious clients respond to medical cost coverage. Your job is to identify which hook fits and lead with it.`,
        slides: [
          {
            heading: "Client Profile: Karen Ng",
            bullets: [
              "Runs a dialysis business, commutes JB–Singapore daily",
              "$500,000 mortgage, PR status (not citizen)",
              "Pragmatic, direct, zero patience for fluff",
              "Explicitly stated: 'I do not want to leave too much to my daughter'",
              "Quick decision-maker — needs clean data, not emotional stories"
            ]
          },
          {
            heading: "The Pivot: Self-Funding, Not Legacy",
            bullets: [
              "Standard hook (legacy/inheritance) would have BACKFIRED with Karen",
              "Reframed: 'This is about making sure YOU never depend on anyone'",
              "Aligned with her independent, self-reliant worldview",
              "Key: identify the client's values FIRST, then align your pitch",
              "Pragmatic clients want ROI, not emotional stories"
            ],
            script: `"Karen, this is not about leaving money behind. You have made it clear your daughter should build her own path, and I respect that. This is about making sure YOU have a reliable income stream for the next 30 years — one that does not depend on anyone else. Let me show you the numbers."`
          },
          {
            heading: "The Portal Discovery: Hidden $41K",
            bullets: [
              "During live portal review: found a $41,000 Prudential maturity",
              "Karen had completely forgotten about it",
              "Finding 'hidden money' instantly elevated advisor credibility",
              "Demonstrated the value of a comprehensive financial review",
              "This discovery alone justified the entire meeting"
            ]
          },
          {
            heading: "Matching Hooks to Client Types",
            bullets: [
              "Pragmatic clients (Karen): Lead with ROI and self-sufficiency",
              "Legacy clients: Lead with family protection and inheritance",
              "Healthcare-anxious clients (Jeffrey): Lead with medical cost coverage",
              "Risk-averse clients (Thian): Lead with capital preservation",
              "Your job: identify the hook in the first 10 minutes and lean into it"
            ],
            table: {
              headers: ["Client Type", "Primary Hook", "What to Avoid"],
              rows: [
                ["Pragmatic/Business", "ROI, self-funding, independence", "Emotional stories, legacy framing"],
                ["Family-Focused", "Legacy, inheritance, protection", "Cold numbers without context"],
                ["Healthcare-Anxious", "Medical cost coverage, dividends fund hospital plan", "Downplaying health concerns"],
                ["Risk-Averse", "Capital preservation, guaranteed returns", "Aggressive growth projections"]
              ]
            }
          }
        ],
        keyTakeaways: [
          "Not every client responds to the same emotional hook — identify theirs early",
          "Pragmatic clients need clean data and straightforward ROI, not emotional stories",
          "When legacy/inheritance hooks backfire, pivot to self-funding and independence",
          "Live portal reviews can uncover forgotten assets that boost your credibility",
          "Quick decision-makers need efficient meetings — do not over-explain or over-sell"
        ],
        realExamples: [
          "Karen Ng: chose $24K/year dividend plan with minimal hesitation after seeing clean ROI data",
          "Portal discovery: $41K Prudential maturity Karen had forgotten — found during live review"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 16 — Referral & Pipeline Systems
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "m16-referral-pipeline",
    number: 16,
    title: "Referral & Pipeline Systems",
    description: "Build sustainable lead flow through referral scripts, lead categorization, CRM discipline, and activity tracking systems that drive COT qualification.",
    icon: "Network",
    lessons: [
      {
        id: "m16-l1",
        title: "Referral Scripts & Timing",
        description: "Master when and how to ask for referrals, the specific scripts that work, and how to leverage WhatsApp group chats as passive referral vehicles.",
        durationMin: 4,
        narration: `Referrals are the highest-quality leads you will ever get. A referred prospect is pre-qualified, pre-warmed, and pre-trusting because someone they know vouched for you. Yet most advisors either never ask for referrals or ask so awkwardly that it kills the relationship momentum. This lesson fixes that.

First, timing. The best time to ask for a referral is at the end of every meeting — but only after you have delivered value. If the client just learned something useful about their CPF, saw a restructuring opportunity, or received their consolidated portfolio summary, they are in a state of gratitude. That is your window. Do not let it close.

The script needs to be specific, not generic. Never say: "Do you know anyone who might need insurance?" That is vague, puts the burden on the client, and sounds like every other advisor they have met. Instead, say: "Based on our conversation today, is there anyone in your circle — maybe a colleague or family member approaching retirement — who might benefit from this same review?" Notice the specificity. You are anchoring to what you just discussed and suggesting a specific type of person.

The SB Charisma training added a brilliant angle: the referral-as-protection argument. The script goes: "If people around you are not properly covered and something happens to them, they are going to come to you for money. Helping them get covered is actually protecting yourself." This reframes the referral from a favor to the advisor into a benefit for the client. It is selfish altruism, and it works.

After the close is another prime referral moment. The client has just committed to a plan. They are feeling good about their decision. At this point, the WhatsApp group chat becomes your passive referral vehicle. You can say: "Feel free to share this group with anyone who might find it useful. I share financial tips and updates here regularly." This is low-pressure, ongoing, and it turns every client into a potential referral source without a formal ask.

The key principle is this: make the referral feel like a natural extension of the value you just provided, not a transaction at the end of a sales meeting. When clients feel like they are helping their friends by connecting them with you — rather than doing you a favor — referrals flow naturally.`,
        slides: [
          {
            heading: "When to Ask for Referrals",
            bullets: [
              "End of every meeting — AFTER delivering clear value",
              "After a portfolio discovery (CPF optimization, hidden policies)",
              "After the client expresses gratitude or surprise at findings",
              "After a successful close — client is feeling good about their decision",
              "Never ask at the beginning or during an uncomfortable moment"
            ]
          },
          {
            heading: "The Specific Referral Script",
            bullets: [
              "NEVER: 'Do you know anyone who needs insurance?' (vague, generic)",
              "ALWAYS: Anchor to what you just discussed, suggest a specific type",
              "Be specific about WHO: 'colleague approaching retirement,' 'family member with old policies'",
              "This reduces the mental load on the client and triggers specific names"
            ],
            script: `"Based on our conversation today, is there anyone in your circle — maybe a colleague or family member approaching retirement — who might benefit from this same review? I would be happy to do for them what we just did for you — no obligation, just a review."`
          },
          {
            heading: "The Referral-as-Protection Angle",
            bullets: [
              "From SB Charisma training — reframes referral as a benefit to the client",
              "Logic: If your friends are underinsured and something happens, they come to YOU for money",
              "Helping them get covered is actually protecting yourself",
              "This turns the referral from a favor into self-interest",
              "Powerful because it is logically sound, not emotionally manipulative"
            ],
            script: `"Here is something to think about. If the people around you — your siblings, your close friends — are not properly covered, and something happens to them, who do they turn to? You. Helping them get a proper review is actually one of the best things you can do for yourself. Would you like me to extend the same review to anyone in your circle?"`
          },
          {
            heading: "WhatsApp Group as Passive Referral Vehicle",
            bullets: [
              "After the close: 'Feel free to share this group with anyone who might find it useful'",
              "Low-pressure, ongoing, requires no formal ask",
              "You share financial tips and updates → clients share the group",
              "Every client becomes a potential referral source passively",
              "The group grows organically over time"
            ]
          }
        ],
        keyTakeaways: [
          "Ask for referrals at the end of every meeting, after delivering value",
          "Be specific in your ask — anchor to the conversation you just had",
          "The referral-as-protection angle reframes the ask as a benefit to the client",
          "WhatsApp group chats are passive referral vehicles — encourage sharing",
          "Make referrals feel like helping friends, not doing you a favor"
        ],
        realExamples: [
          "Jan 06 team meeting emphasized that end-of-meeting referral asks increased referral rates by 3x compared to follow-up requests",
          "SB Charisma training introduced the protection-angle referral script, now standard practice in the team"
        ]
      },
      {
        id: "m16-l2",
        title: "Lead Categorization & CRM",
        description: "Implement a lead scoring system, manage multiple lead sources, maintain CRM discipline, and use pipeline math to work backwards from COT targets.",
        durationMin: 3,
        narration: `Your pipeline is only as good as your ability to categorize and manage it. Without a system, you will waste time on cold leads while hot prospects go stale. This lesson gives you the framework to manage leads efficiently and predictably.

The lead scoring system is simple. Hot leads are ready to close within two weeks — they have expressed clear intent, have the financial capacity, and just need the paperwork. Warm leads are interested but need one to two more meetings — they understand the concept but have not committed. Cold leads are in the educational stage — three or more months from a decision, still learning, or waiting for a life trigger like a promotion, retirement, or policy maturity.

Your lead sources determine the quality and volume of your pipeline. Facebook ads generate volume but vary in quality — expect high lead counts but lower conversion rates. Yakun cafe advertisements reach a specific demographic — older, coffee-shop-going Singaporeans who fit the pre-retiree profile. Referrals are your highest-quality source — pre-warmed and pre-qualified. Seminars generate warm leads who have already shown interest by attending. GAB leads come from the company's lead distribution system. And finternship leads come from your training and educational programs.

CRM discipline is non-negotiable. After every meeting, update the lead status. Move people between categories. And here is the critical one: blacklist unqualified leads. If someone is clearly not a fit — no budget, no need, no interest — remove them from your active pipeline. Every minute you spend chasing an unqualified lead is a minute you are not spending with someone who will close.

Now the pipeline math. To hit COT qualification, you need approximately 15 PWV cases per year. Working backwards: to close 15 cases, you need roughly 45 proposals presented, which means approximately 90 appointments kept, which requires about 180 appointments set, which means around 500 leads contacted. These numbers vary by your conversion rates, but the principle holds: start with the end goal and work backwards to daily activity targets.`,
        slides: [
          {
            heading: "Lead Scoring: Hot, Warm, Cold",
            bullets: [
              "HOT: Ready to close within 2 weeks — clear intent, financial capacity",
              "WARM: Interested, needs 1–2 more meetings — understands but not committed",
              "COLD: Educational stage, 3+ months — learning, waiting for life trigger",
              "Review and re-categorize leads weekly — status changes constantly",
              "Blacklist unqualified leads to protect your time"
            ],
            table: {
              headers: ["Category", "Timeline", "Behavior Signals", "Your Action"],
              rows: [
                ["HOT", "0–2 weeks", "Asking about paperwork, comparing options", "Priority follow-up, same-day response"],
                ["WARM", "2–8 weeks", "Asking questions, sharing with spouse", "Nurture with info, schedule next meeting"],
                ["COLD", "3+ months", "Polite interest but no urgency", "Monthly value-add touch, wait for trigger"],
                ["BLACKLIST", "Never", "No budget, no need, or unresponsive", "Remove from active pipeline"]
              ]
            }
          },
          {
            heading: "Lead Sources & Quality",
            bullets: [
              "Facebook Ads: High volume, variable quality — needs filtering",
              "Yakun Ads: Specific demographic — older, pre-retiree Singaporeans",
              "Referrals: Highest quality — pre-warmed and pre-qualified",
              "Seminars: Warm leads who self-selected by attending",
              "GAB Leads: Company-distributed — mixed quality",
              "Finternship: Training program participants — high engagement"
            ]
          },
          {
            heading: "Pipeline Math: Working Backwards from COT",
            bullets: [
              "Goal: 15 PWV cases/year for COT qualification",
              "Need ~45 proposals presented (33% close rate)",
              "Need ~90 appointments kept (50% proposal rate)",
              "Need ~180 appointments set (50% show rate)",
              "Need ~500 leads contacted (36% appointment rate)",
              "Daily: ~2 leads contacted, 1 appointment/day"
            ]
          }
        ],
        keyTakeaways: [
          "Score every lead as Hot, Warm, or Cold — and review weekly",
          "Blacklist unqualified leads ruthlessly to protect your productive time",
          "Referrals are the highest-quality lead source — invest in generating them",
          "CRM updates after every meeting are non-negotiable discipline",
          "Work backwards from COT target (15 cases) to daily activity numbers"
        ],
        realExamples: [
          "Team meetings consistently showed that advisors who maintained CRM discipline closed 2x more cases than those who did not",
          "Facebook ads investment: Cynthia's example showed that ad spend directly correlated with lead volume and eventually FYC"
        ]
      },
      {
        id: "m16-l3",
        title: "Activity Tracking for COT",
        description: "Master the Genesis program structure, activity metrics that drive results, the team leaderboard system, and how marketing investment translates to FYC.",
        durationMin: 4,
        narration: `Activity tracking is the difference between advisors who hit COT and advisors who wonder why they did not. This lesson covers the systems and metrics that turn daily effort into annual results.

The Genesis program runs on a 12-week structure. Each 12-week cycle is a sprint with defined activity targets, team accountability, and measurable outcomes. The beauty of the 12-week cycle is that it is long enough to see meaningful results but short enough to maintain intensity. An annual target feels abstract. A 12-week target feels urgent.

The activity metrics that matter are, in order: calls made, appointments set, appointments kept, proposals presented, and cases closed. Notice that the funnel starts with activity, not results. You cannot control closings directly. You can control how many calls you make. If you make enough calls, the rest of the funnel fills itself.

The leaderboard system provides team motivation through transparency. When everyone can see everyone else's activity numbers — not just results, but effort metrics — it creates healthy competition and accountability. Nobody wants to be at the bottom of the call board. And when someone at the top shares their technique for getting appointments, the whole team improves.

Warm market texting deserves special attention. The key is personalization. Never send generic "Hi, how are you?" messages. Frame every outreach as a value-added check-in: "Hi [Name], I just helped a client your age discover they had a $3,200/month retirement gap they did not know about. Would it be useful if I did a quick check for you too?" This is specific, relevant, and offers value rather than asking for a meeting.

Let me share Cynthia's example — the most powerful proof point for marketing investment. Cynthia achieved $168,000 in First Year Commission primarily through Facebook ads investment. She spent money on ads, generated leads, worked them systematically through her pipeline, and the math worked out. Her example proves that marketing investment pays off when combined with disciplined activity tracking and follow-up.

The pledge system brings it all together. At the start of each 12-week cycle, every team member sets specific weekly activity targets: number of calls, appointments, and proposals. These pledges are shared with the team. At the end of each week, actual numbers are compared to pledges. Over time, the gap between pledge and performance narrows, and your conversion rates improve because you are doing more reps.`,
        slides: [
          {
            heading: "The Genesis 12-Week Structure",
            bullets: [
              "Each cycle: 12 weeks with defined activity targets",
              "Long enough for meaningful results, short enough for intensity",
              "Team accountability through shared metrics and weekly reviews",
              "Annual goals feel abstract — 12-week targets feel urgent",
              "3 cycles per 9 months + 1 buffer cycle = full year coverage"
            ]
          },
          {
            heading: "Activity Metrics Funnel",
            bullets: [
              "1. Calls Made — the only metric fully within your control",
              "2. Appointments Set — measures your phone/text effectiveness",
              "3. Appointments Kept — measures your credibility and follow-through",
              "4. Proposals Presented — measures your meeting-to-pitch conversion",
              "5. Cases Closed — the outcome of everything above"
            ],
            table: {
              headers: ["Metric", "Weekly Target (COT pace)", "Conversion Rate", "Annual Result"],
              rows: [
                ["Calls/Texts Made", "10–15/week", "—", "500+/year"],
                ["Appointments Set", "4–5/week", "~36% of calls", "180+/year"],
                ["Appointments Kept", "2–3/week", "~50% of set", "90+/year"],
                ["Proposals Presented", "1–2/week", "~50% of kept", "45+/year"],
                ["Cases Closed", "~1 every 3 weeks", "~33% of proposals", "15+/year (COT)"]
              ]
            }
          },
          {
            heading: "Warm Market Texting That Works",
            bullets: [
              "NEVER: Generic 'Hi, how are you?' messages",
              "ALWAYS: Specific, value-added check-ins with relevance",
              "Lead with a discovery you made for another client (anonymized)",
              "Offer a specific, low-commitment next step",
              "Personalize based on what you know about their situation"
            ],
            script: `"Hi [Name], hope you are doing well! I just helped a client around your age discover a $3,200/month retirement gap they did not know about. It took us 20 minutes to map it out using their CPF portal. Would it be useful if I did a quick check for you too? No obligation at all — just a friendly review."`
          },
          {
            heading: "Cynthia's $168K FYC Example",
            bullets: [
              "168K FYC achieved primarily through Facebook ads investment",
              "Formula: Ad spend → Lead volume → Disciplined follow-up → Closings",
              "Proof that marketing investment pays off with systematic execution",
              "The pledge system: set weekly targets, share with team, track against pledges",
              "Over time: pledge-to-performance gap narrows, conversion rates improve"
            ]
          }
        ],
        keyTakeaways: [
          "The 12-week Genesis cycle creates urgency that annual goals cannot",
          "Focus on input metrics (calls, appointments) — output metrics (closings) follow",
          "Personalized warm market texts outperform generic messages by 5x or more",
          "Cynthia's $168K FYC proves that marketing investment pays off with discipline",
          "The pledge system creates accountability and progressively improves performance"
        ],
        realExamples: [
          "Cynthia: $168K FYC achieved through Facebook ads investment and disciplined pipeline management",
          "Jan 06 team meeting: leaderboard review showed top performers making 15+ calls/week consistently",
          "Genesis program participants who hit their activity pledges were 3x more likely to achieve COT"
        ]
      }
    ]
  },
];

// ─── Helper: Get all lessons flat ────────────────────────────────────────────
export const getAllLessons = (): (Lesson & { moduleId: string; moduleTitle: string; moduleNumber: number })[] => {
  return salesMasteryCourse.flatMap((mod) =>
    mod.lessons.map((lesson) => ({
      ...lesson,
      moduleId: mod.id,
      moduleTitle: mod.title,
      moduleNumber: mod.number,
    }))
  );
};

// ─── Helper: Get total lesson count ──────────────────────────────────────────
export const getTotalLessonCount = (): number => {
  return salesMasteryCourse.reduce((sum, mod) => sum + mod.lessons.length, 0);
};

// ─── Helper: Get total course duration ───────────────────────────────────────
export const getTotalCourseDuration = (): number => {
  return salesMasteryCourse.reduce(
    (sum, mod) => sum + mod.lessons.reduce((ls, l) => ls + l.durationMin, 0),
    0
  );
};
