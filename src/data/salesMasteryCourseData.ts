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
