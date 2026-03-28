export interface TrackItem {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  actionItems: string[];
  /** Pre-seeded resources that ship with the track (not admin-editable) */
  defaultContent?: ContentBlock[];
}

export interface TrackPhase {
  id: string;
  title: string;
  description: string;
  items: TrackItem[];
}

/** Content block types that admins can attach to any track item */
export type ContentBlockType = "text" | "link" | "video";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  /** For text: the markdown/plain text content */
  text?: string;
  /** For link: the URL */
  url?: string;
  /** For link/video: display label */
  label?: string;
}

// ─── Helper ──────────────────────────────────────────────────────────
const link = (id: string, label: string, url: string): ContentBlock => ({
  id,
  type: "link",
  label,
  url,
});

const text = (id: string, content: string): ContentBlock => ({
  id,
  type: "text",
  text: content,
});

const video = (id: string, label: string, url: string): ContentBlock => ({
  id,
  type: "video",
  label,
  url,
});

// ─── Track Data ──────────────────────────────────────────────────────

/**
 * Unified Advisor Onboarding Track
 * Merged from Post-AIA Internship Enhanced Training + F.A.S.T. programme.
 * Organized into 6 progressive phases.
 */
export const learningTrack: TrackPhase[] = [
  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1 — Foundation & Setup
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-1",
    title: "Phase 1 — Foundation & Setup",
    description: "Set your goals, prepare your tools, and build your prospect list.",
    items: [
      {
        id: "p1-1",
        title: "Goal Setting & Business Preparation",
        description: "Establish career goals and create your Personal Business Plan with time management and scheduling.",
        objectives: [
          "Establish clear career goals",
          "Understand importance of time management",
          "Create a comprehensive Personal Business Plan",
        ],
        actionItems: [
          "Pledge Sheet, Name Card, Profile Page",
          "Complete Personal Business Plan",
          "Set up MS Calendar and Masterplan",
        ],
        defaultContent: [
          link("p1-1-a", "How to Use the Academy Portal", "/how-to-use"),
          link("p1-1-b", "MDRT — Building Your Practice", "https://www.mdrt.org/build-your-business"),
          text("p1-1-c", "Tip: Block out 2 hours each morning for prospecting in your calendar before filling in client meetings. Protect this time — it's the engine of your business."),
        ],
      },
      {
        id: "p1-2",
        title: "Digital Tools & Platform Setup",
        description: "Set up all the digital tools and platforms you'll use daily as an advisor.",
        objectives: [
          "Master key digital platforms",
          "Set up professional profiles and communication channels",
        ],
        actionItems: [
          "Biz WhatsApp, Link Tree, MyWai App, AIA iSmart Platform",
          "Install iPOS+ / iSMART+",
          "Install and set up CRM",
        ],
        defaultContent: [
          link("p1-2-a", "Academy Portal Guide", "/how-to-use"),
          link("p1-2-b", "AIA Singapore Official Website", "https://www.aia.com.sg"),
          text("p1-2-c", "Checklist: (1) Download WhatsApp Business and set up your professional profile with photo, business description, and catalogue. (2) Create a Linktree with your booking link, testimonials page, and social profiles. (3) Install the MyWai App and complete your profile. (4) Log into AIA iSmart and explore the dashboard."),
        ],
      },
      {
        id: "p1-3",
        title: "AIA New Advisor Welcome Booklet",
        description: "Go through the official AIA New Advisor Welcome Booklet and download all necessary tools.",
        objectives: [
          "Understand AIA's expectations, resources, and support systems",
        ],
        actionItems: [
          "Download Comp Portal and all necessary apps for iPad",
        ],
        defaultContent: [
          link("p1-3-a", "CMFAS Onboarding Module", "/cmfas/module/onboarding"),
          link("p1-3-b", "AIA Singapore — Our Products", "https://www.aia.com.sg/en/our-products.html"),
          text("p1-3-c", "The Welcome Booklet covers your first 12 weeks, compliance requirements, and the support structure available to you. Make sure you understand the sales competency timeline and CPD requirements."),
        ],
      },
      {
        id: "p1-4",
        title: "Regulations, Expectations & Compliance",
        description: "Understand MAS regulations, AIA expectations, and the difference between District and Agency structures.",
        objectives: [
          "Understand MAS regulations (first 12 weeks, sales competency, etc.)",
          "Understand AIA expectations (FTS training, E-modules, LMS CPD hours)",
          "Know District expectations (DCM/DMM, Telethons, email protocol)",
          "Know Agency expectations (Meetings, Telethon, Activities)",
        ],
        actionItems: [
          "Familiarize with AIA products",
          "Understand the difference between District and Agency",
        ],
        defaultContent: [
          link("p1-4-a", "MAS — Financial Advisers Act (FAA)", "https://www.mas.gov.sg/regulation/acts/financial-advisers-act"),
          link("p1-4-b", "MAS — Guidelines on Fair Dealing", "https://www.mas.gov.sg/regulation/guidelines/guidelines-on-fair-dealing"),
          link("p1-4-c", "Browse All Product Categories", "/"),
          text("p1-4-d", "Key MAS rules for your first 12 weeks: You must be supervised by a qualified representative for all client meetings. You cannot give advice independently until you pass your sales competency assessments. Always disclose your status as a new representative."),
        ],
      },
      {
        id: "p1-5",
        title: "DISC Personality & Personal Branding",
        description: "Understand DISC personality types, develop your USP, and craft a compelling elevator pitch.",
        objectives: [
          "Understand the DISC personality framework",
          "Develop a USP with your strengths",
          "Create a memorable elevator pitch",
        ],
        actionItems: [
          "Complete DISC assessment",
          "Prepare Marketing Kit",
          "Prepare Personal Writeup",
        ],
        defaultContent: [
          link("p1-5-a", "What is DISC? — Official Overview", "https://www.discprofile.com/what-is-disc"),
          video("p1-5-b", "Simon Sinek — Start With Why (TED Talk)", "https://www.youtube.com/watch?v=u4ZoJKF_VuA"),
          text("p1-5-c", "Your elevator pitch formula: \"I help [specific audience] [achieve specific outcome] so they can [emotional benefit].\" Example: \"I help young professionals protect their families and build wealth so they never have to worry about unexpected medical bills or retirement.\""),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2 — Prospecting & Market Survey
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-2",
    title: "Phase 2 — Prospecting & Market Survey",
    description: "Build your prospect list and master outreach techniques.",
    items: [
      {
        id: "p2-1",
        title: "Project 100 & Market Survey Training",
        description: "Identify your personal market and learn market survey techniques for hot, warm, and luke-warm contacts.",
        objectives: [
          "Understand importance of Project 100",
          "Able to conduct Market Surveys confidently",
          "Understand approaches for 3 types of warm market",
        ],
        actionItems: [
          "Complete filling in Project No. 1 excel",
          "Master asking for Market Surveys",
          "Complete 100 Market Surveys",
        ],
        defaultContent: [
          link("p2-1-a", "Concept Cards — Product Knowledge Flashcards", "/concept-cards"),
          link("p2-1-b", "MDRT — Prospecting Resources", "https://www.mdrt.org"),
          text("p2-1-c", "The 3 warm market tiers:\n• Hot market — family, close friends (highest trust, easiest to approach)\n• Warm market — colleagues, acquaintances, ex-classmates\n• Luke-warm market — friends of friends, social media connections\n\nStart with hot, then work outward. The goal is 100 names before you make your first call."),
        ],
      },
      {
        id: "p2-2",
        title: "Role-Play & Conduct Real Market Surveys",
        description: "Practice through role-play, then conduct 20 real market surveys over the phone.",
        objectives: [
          "Conduct 20 Market Surveys over the phone",
        ],
        actionItems: [
          "Finish all Market Survey approaches",
        ],
        defaultContent: [
          link("p2-2-a", "AI Roleplay Training — Practice with AI Clients", "/roleplay"),
          text("p2-2-b", "Market Survey script framework:\n1. Open: \"Hey [name], I'm doing a quick survey for my training — takes 2 min, mind helping?\"\n2. Questions: Current insurance coverage? Biggest financial concern? Saving for anything specific?\n3. Close: \"Thanks! Based on what you shared, I might have some insights — would you be open to a 15-min chat sometime?\""),
        ],
      },
      {
        id: "p2-3",
        title: "Telephone Approach & Prospecting Training",
        description: "Learn warm, semi-warm (Opening-to-an-Opening), and cold prospecting. Master telephone scripts and the \"Fatal Alternatives\" technique.",
        objectives: [
          "Confident and able to conduct approaches",
          "Use of \"Fatal Alternatives\"",
          "Text immediately after calling and 1 day before appointment",
        ],
        actionItems: [
          "Prepare Personalized Scripts and Templates (WhatsApp etc.)",
        ],
        defaultContent: [
          link("p2-3-a", "Scripts Database — Cold Calling Scripts", "/scripts"),
          link("p2-3-b", "Objection Handling Scripts", "/objections"),
          text("p2-3-c", "\"Fatal Alternatives\" technique: Always give two specific time options instead of asking \"when are you free?\" Example: \"Would Tuesday at 7pm or Thursday at 3pm work better for you?\" This doubles your booking rate compared to open-ended scheduling."),
        ],
      },
      {
        id: "p2-4",
        title: "Roleplay Approaches & 20 Point Card",
        description: "Practice approach scripts through roleplay, conduct real approaches, and start tracking activity with the 20 Point Card system.",
        objectives: [
          "Interact with at least 20 people to ask for an appointment",
        ],
        actionItems: [
          "Start filling in the 20 Point card",
        ],
        defaultContent: [
          link("p2-4-a", "Scripts Database — All Categories", "/scripts"),
          link("p2-4-b", "Script Playbooks", "/playbooks"),
          text("p2-4-c", "20 Point Card scoring:\n• Phone call attempt = 1 point\n• Appointment set = 3 points\n• Face-to-face meeting = 5 points\n• Referral received = 2 points\n\nTarget: 20 points per day. Track daily to build momentum."),
        ],
      },
      {
        id: "p2-5",
        title: "Telethon Sessions",
        description: "Participate in telethon sessions to build call confidence with live practice.",
        objectives: [
          "Build confidence in phone outreach",
          "Practice live calling in a group setting",
        ],
        actionItems: [
          "Complete at least 2 Telethon Sessions",
          "Social Media Posting",
        ],
        defaultContent: [
          link("p2-5-a", "Scripts Database — Follow-Up Messages", "/scripts"),
          text("p2-5-b", "Telethon tips: (1) Prepare your call list the night before. (2) Have your script in front of you but don't read it word-for-word. (3) Stand up while calling — it makes your voice more energetic. (4) Track every call outcome. (5) Debrief with your team after each session."),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3 — Product Knowledge
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-3",
    title: "Phase 3 — Product Knowledge",
    description: "Master the core insurance and investment products you'll recommend to clients.",
    items: [
      {
        id: "p3-1",
        title: "Overview of Personal Financial Planning",
        description: "Understand the big picture of financial planning and where each product category fits.",
        objectives: [
          "Understand the full financial planning landscape",
          "Identify where each common product fits into the Big Picture",
        ],
        actionItems: [
          "Study the Personal Financial Planning framework",
        ],
        defaultContent: [
          link("p3-1-a", "MoneySense — Guide to Financial Planning", "https://www.moneysense.gov.sg/financial-planning"),
          link("p3-1-b", "Knowledge Base — All Product Categories", "/kb"),
          link("p3-1-c", "Search Products by Client Profile", "/search-by-profile"),
          text("p3-1-d", "The financial planning pyramid (bottom to top):\n1. Protection (insurance) — the foundation\n2. Savings (emergency fund) — 3-6 months expenses\n3. Investment (wealth accumulation) — grow your money\n4. Distribution (retirement/estate) — enjoy and pass on\n\nAlways address the bottom layers first before recommending wealth products."),
        ],
      },
      {
        id: "p3-2",
        title: "Risk Management Products: PA, Hospitalization, Whole Life, Term",
        description: "Deep dive into the four core risk management products and understand when to recommend each.",
        objectives: [
          "Understand the difference between Medical Treatment and Income Replacement",
          "Identify where each product fits into the Big Picture",
        ],
        actionItems: [
          "Familiarize with all common products",
          "Master PA, Hospitalization, Whole Life presentations",
        ],
        defaultContent: [
          link("p3-2-a", "KB — Medical Insurance Products", "/kb/medical-insurance"),
          link("p3-2-b", "KB — Term Products", "/kb/term-products"),
          link("p3-2-c", "KB — Whole Life Products", "/kb/whole-life-products"),
          link("p3-2-d", "MoneySense — Guide to Life Insurance", "https://www.moneysense.gov.sg/insurance/life-insurance"),
          link("p3-2-e", "CMFAS M9 Module — Risk & Insurance", "/cmfas/module/m9"),
          link("p3-2-f2", "Pro Achiever Study Bank — 1000 Practice Questions", "/product/pro-achiever/study"),
          text("p3-2-f", "Key distinction for clients:\n• Medical Treatment coverage (Hospitalization, PA) = pays for medical bills directly\n• Income Replacement coverage (Whole Life, Term) = replaces lost income if you can't work\n\nMost clients need BOTH. A hospitalization plan covers the bill, but who pays the mortgage while you're recovering?"),
        ],
      },
      {
        id: "p3-3",
        title: "Roleplay Risk Management Presentations",
        description: "Present PA, Hospitalization, and Whole Life products in roleplay to build confidence.",
        objectives: [
          "Confident and able to explain and present risk management solutions",
        ],
        actionItems: [
          "Continue practising until fluent",
        ],
        defaultContent: [
          link("p3-3-a", "AI Roleplay — Investment Basics (Beginner)", "/roleplay"),
          link("p3-3-b", "Pitch Analysis Tool", "/roleplay/pitch-analysis"),
          link("p3-3-c", "Concept Cards — Study Flashcards", "/concept-cards"),
          text("p3-3-d", "Presentation flow for risk management:\n1. \"What would happen to your family if...\" (create urgency)\n2. Show the gap between current coverage and actual need\n3. Present the solution that fills the gap\n4. Use stories/examples of real claims (anonymized)\n5. Summarize the cost vs. the risk"),
        ],
      },
      {
        id: "p3-4",
        title: "Wealth Accumulation Products: ILP & Endowment",
        description: "Learn about Investment-Linked Policies vs. Endowment plans, and how to structure hybrid solutions.",
        objectives: [
          "Know when to recommend ILP vs. Endowment",
          "Structuring hybrid to have best of both worlds",
        ],
        actionItems: [
          "Master ILP and Endowment product presentations",
        ],
        defaultContent: [
          link("p3-4-a", "KB — Investment Products", "/kb/investment-products"),
          link("p3-4-b", "KB — Endowment Products", "/kb/endowment-products"),
          link("p3-4-c", "MoneySense — Investment-Linked Policies", "https://www.moneysense.gov.sg/insurance/life-insurance/investment-linked-insurance-policies"),
          text("p3-4-d", "ILP vs Endowment — when to recommend each:\n• ILP: Client wants market-linked returns, comfortable with risk, long horizon (10+ years), wants flexibility to adjust\n• Endowment: Client wants guaranteed returns, risk-averse, specific savings goal (e.g. child's education in 15 years), prefers certainty\n• Hybrid: Use endowment for the \"must-have\" goal and ILP for the \"nice-to-have\" growth"),
        ],
      },
      {
        id: "p3-5",
        title: "Time Value of Money",
        description: "Understand and explain the Time Value of Money concept to clients using a financial calculator.",
        objectives: [
          "Master TVM calculations",
          "Explain TVM in simple, relatable terms",
        ],
        actionItems: [
          "Complete TVM Test",
          "Practice using the Financial Calculator",
        ],
        defaultContent: [
          link("p3-5-a", "Khan Academy — Time Value of Money", "https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial"),
          link("p3-5-b", "Investopedia — Time Value of Money Explained", "https://www.investopedia.com/terms/t/timevalueofmoney.asp"),
          text("p3-5-c", "Simple TVM explanation for clients: \"$1,000 today is worth more than $1,000 in 10 years because you can invest it and earn returns. At 5% per year, that $1,000 becomes $1,629 in 10 years. Now flip it — to have $1,000 in 10 years, you only need to invest $614 today. The earlier you start, the less you need to put in.\""),
        ],
      },
      {
        id: "p3-6",
        title: "Run Through AIA iPOS",
        description: "Learn to navigate and use the AIA iPOS system to load and manage cases.",
        objectives: [
          "Navigate iPOS confidently",
          "Load and manage client cases",
        ],
        actionItems: [
          "Load own case in iPOS",
        ],
        defaultContent: [
          text("p3-6-a", "iPOS key workflows to master:\n1. Create new client profile\n2. Run a needs analysis\n3. Generate a product illustration\n4. Compare product options side by side\n5. Save and share proposals with clients\n\nPractice with your own case first — load your personal details, run a needs analysis, and generate a sample proposal."),
          link("p3-6-b", "AIA Singapore — Our Products", "https://www.aia.com.sg/en/our-products.html"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4 — Sales Process & Client Meetings
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-4",
    title: "Phase 4 — Sales Process & Client Meetings",
    description: "Master the Opening appointment, questioning techniques, and sales scripts.",
    items: [
      {
        id: "p4-1",
        title: "Canned Sales Track & Call Pitch (ABCD)",
        description: "Master the structured sales track and call pitch methodology.",
        objectives: [
          "Memorize and deliver the canned sales track fluently",
        ],
        actionItems: [
          "Complete FHR Challenge",
        ],
        defaultContent: [
          link("p4-1-a", "Scripts Database — Sales Scripts", "/scripts"),
          link("p4-1-b", "Script Playbooks", "/playbooks"),
          text("p4-1-c", "ABCD framework:\n• A — Attention: Hook them in the first 10 seconds\n• B — Brief intro: Who you are and why you're calling (keep it under 20 seconds)\n• C — Connect: Ask about their situation, show you understand\n• D — Direct to action: Propose a specific meeting time (use Fatal Alternatives)"),
        ],
      },
      {
        id: "p4-2",
        title: "Opening Appointment Training",
        description: "Learn the proper conduct of an Opening appointment with emphasis on questioning skills.",
        objectives: [
          "Proper conduct of Opening",
          "Importance of mastering Questioning skills",
          "Focus on Referral Asking",
        ],
        actionItems: [
          "Practice Opening",
          "Master the Opening and Questioning Techniques",
        ],
        defaultContent: [
          link("p4-2-a", "Script Flows — Visual Process Maps", "/flows"),
          link("p4-2-b", "Objection Handling Scripts", "/objections"),
          text("p4-2-c", "Opening appointment structure (60-90 minutes):\n1. Rapport building (5-10 min) — personal connection, common ground\n2. Personal writeup (5 min) — your story, why you became an advisor\n3. Agenda setting (2 min) — outline what you'll cover today\n4. Fact-finding questions (20-30 min) — THE most important part\n5. Identify gaps & needs (10 min) — summarize what you heard\n6. Next steps (5 min) — schedule the closing appointment\n7. Ask for referrals (5 min) — \"Who else might benefit from this?\""),
        ],
      },
      {
        id: "p4-3",
        title: "Roleplay Opening Appointment",
        description: "Multiple roleplay sessions to perfect your Opening appointment technique.",
        objectives: [
          "Confident and able to conduct Opening independently",
        ],
        actionItems: [
          "Continue practising until consistently smooth",
        ],
        defaultContent: [
          link("p4-3-a", "AI Roleplay — Practice with AI Clients", "/roleplay"),
          link("p4-3-b", "Roleplay — Family Financial Planning (Intermediate)", "/roleplay"),
          link("p4-3-c", "Pitch Analysis — Analyze Your Delivery", "/roleplay/pitch-analysis"),
        ],
      },
      {
        id: "p4-4",
        title: "Closing Proposal Preparation",
        description: "Learn to prepare professional, compelling closing proposals.",
        objectives: [
          "Create clear, persuasive closing proposals",
        ],
        actionItems: [
          "Create your Closing Template",
        ],
        defaultContent: [
          link("p4-4-a", "Scripts Database", "/scripts"),
          text("p4-4-b", "Closing proposal checklist:\n1. Client's key concerns (from fact-finding) restated\n2. Gap analysis — what they have vs. what they need\n3. Recommended solution with clear benefits\n4. Premium breakdown (monthly/annual)\n5. Comparison with doing nothing (cost of delay)\n6. Next steps and timeline\n\nKeep proposals under 5 pages. Clients skim — make the key numbers stand out."),
        ],
      },
      {
        id: "p4-5",
        title: "Canned Sales Track Demo",
        description: "Demonstrate full mastery of the canned sales track in a live demo.",
        objectives: [
          "Deliver the complete sales track confidently and naturally",
        ],
        actionItems: [
          "Practise, Practise, Practice",
        ],
        defaultContent: [
          link("p4-5-a", "Pitch Analysis Tool", "/roleplay/pitch-analysis"),
          link("p4-5-b", "AI Roleplay Training", "/roleplay"),
          text("p4-5-c", "Demo success criteria:\n• Natural delivery (not robotic or memorized-sounding)\n• Smooth transitions between sections\n• Handles interruptions/questions without losing track\n• Makes eye contact and reads the room\n• Closes with a clear call to action"),
        ],
      },
      {
        id: "p4-6",
        title: "Role Play VIPS",
        description: "Practice the VIPS (Values, Issues, Problems, Solutions) framework through role play.",
        objectives: [
          "Master the VIPS framework",
          "Handle different client scenarios confidently",
        ],
        actionItems: [
          "Practice VIPs (Forms in Office)",
        ],
        defaultContent: [
          link("p4-6-a", "Objection Handling Scripts", "/objections"),
          link("p4-6-b", "AI Roleplay — Advanced Scenario", "/roleplay"),
          text("p4-6-c", "VIPS framework:\n• V — Values: \"What matters most to you?\" (family, security, freedom)\n• I — Issues: \"What keeps you up at night financially?\"\n• P — Problems: Quantify the gap between current state and desired state\n• S — Solutions: Present your recommendation tied directly to their values\n\nThe key insight: People buy based on Values, not product features. Always connect your solution back to what they told you matters most."),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5 — Case Studies & Field Work
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-5",
    title: "Phase 5 — Case Studies & Field Work",
    description: "Apply everything you've learned through real case studies and field observations.",
    items: [
      {
        id: "p5-1",
        title: "Case Study One — Opening",
        description: "Work through the first case study focusing on the Opening appointment.",
        objectives: [
          "Apply Opening techniques to a real scenario",
        ],
        actionItems: [
          "Prepare Presentation Proposal",
        ],
        defaultContent: [
          link("p5-1-a", "Concept Cards — Review Product Knowledge", "/concept-cards"),
          link("p5-1-b", "Search by Client Profile", "/search-by-profile"),
          text("p5-1-c", "Preparation for your first case study:\n1. Review the client brief thoroughly\n2. Prepare your fact-finding questions specific to this client's profile\n3. Research relevant products in the Knowledge Base\n4. Draft a preliminary proposal structure\n5. Practice your opening script one more time\n\nRemember: your leader will observe but not intervene unless necessary."),
        ],
      },
      {
        id: "p5-2",
        title: "Case Study One — Closing",
        description: "Complete the first case study with the Closing appointment, accompanied by a leader.",
        objectives: [
          "Apply closing techniques with leader support",
          "Experience a full client engagement cycle",
        ],
        actionItems: [
          "Leader to accompany FC for Closing Appt",
        ],
        defaultContent: [
          link("p5-2-a", "Scripts Database — Closing Scripts", "/scripts"),
          text("p5-2-b", "Closing appointment flow:\n1. Recap the Opening findings (show you listened)\n2. Present your customized proposal\n3. Walk through the numbers — premiums, coverage, benefits\n4. Handle objections using the techniques you've practiced\n5. Ask for the commitment: \"Shall we proceed with this plan?\"\n6. Complete the application forms together\n7. Set expectations for next steps (medical checkup, approval timeline)"),
        ],
      },
      {
        id: "p5-3",
        title: "Case Study Two & Three",
        description: "Work through additional case studies to reinforce all learned techniques.",
        objectives: [
          "Apply all learned techniques to diverse client scenarios",
        ],
        actionItems: [
          "Complete both case studies independently",
        ],
        defaultContent: [
          link("p5-3-a", "Pro Achiever Product Exam", "/product/pro-achiever/exam"),
          link("p5-3-b", "AI Roleplay — High-Net-Worth Advisory (Advanced)", "/roleplay"),
          text("p5-3-c", "By your second and third case studies, you should be operating more independently. Focus on:\n• Identifying the client's unique situation quickly\n• Adapting your standard script to fit their needs\n• Handling objections smoothly without looking at notes\n• Asking for referrals naturally at the end"),
        ],
      },
      {
        id: "p5-4",
        title: "Joint Field Observations (x4)",
        description: "Shadow senior advisors during client appointments. Observe from the client's perspective across multiple sessions.",
        objectives: [
          "Put yourself in the shoes of the client",
          "Identify what was done well and what can be improved",
          "Develop your own advisory style from observing others",
        ],
        actionItems: [
          "Fill in feedback form after each observation",
          "Discuss each appointment with the senior who brought you",
          "Complete all 4 Joint Field Observations",
        ],
        defaultContent: [
          text("p5-4-a", "Observation framework — ask yourself after each session:\n1. How did the advisor build rapport in the first 5 minutes?\n2. What questions did they ask? In what order?\n3. How did they handle objections or resistance?\n4. What body language did you notice (both advisor and client)?\n5. How did they transition from fact-finding to presenting a solution?\n6. How did they ask for the close?\n7. What would YOU do differently?\n\nWrite your observations immediately after the meeting — don't wait until the next day."),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 6 — Operations & Business Planning
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-6",
    title: "Phase 6 — Operations & Business Planning",
    description: "Master the operational side of the business and finalize your plan for success.",
    items: [
      {
        id: "p6-1",
        title: "Portfolio Summary & Template Training",
        description: "Learn to compile Portfolio Summaries using COSA and Portfolio Summary Report Request forms.",
        objectives: [
          "Be aware of common AIA and competitors' policies",
          "Know where and how to find relevant info",
          "Be able to compile a complete Portfolio Summary",
        ],
        actionItems: [
          "Prepare prospects' Portfolio Summaries",
        ],
        defaultContent: [
          link("p6-1-a", "Knowledge Base — All Products", "/kb"),
          link("p6-1-b", "MoneySense — Comparing Insurance Policies", "https://www.moneysense.gov.sg/insurance/life-insurance/comparing-life-insurance"),
          text("p6-1-c", "Portfolio Summary steps:\n1. Request existing policies from the client (or use COSA to obtain from insurers)\n2. List all current coverage: type, sum assured, premium, maturity date\n3. Identify gaps against recommended coverage levels\n4. Note any duplicate coverage or areas of over-insurance\n5. Present the summary with clear recommendations for each gap\n\nThe portfolio summary is your strongest tool for winning over clients who already have an advisor — it shows professionalism and thoroughness."),
        ],
      },
      {
        id: "p6-2",
        title: "Case Submission & Underwriting",
        description: "Learn the complete case submission process and underwriting requirements.",
        objectives: [
          "Understand the end-to-end submission process",
        ],
        actionItems: [
          "Read Underwriting Guide",
        ],
        defaultContent: [
          link("p6-2-a", "LIA Singapore — Industry Guidelines", "https://www.lia.org.sg"),
          text("p6-2-b", "Case submission checklist:\n1. All application forms completed and signed\n2. NRIC/Passport copies\n3. Income documentation (if required for sum assured)\n4. Medical questionnaire completed\n5. Payment method set up (GIRO/credit card)\n6. Financial Needs Analysis documented\n7. Product summary and benefit illustration signed\n\nCommon rejection reasons: incomplete forms, missing signatures, undisclosed medical history. Double-check everything before submission."),
        ],
      },
      {
        id: "p6-3",
        title: "Policy Summary & Client Files",
        description: "Create comprehensive policy summaries for clients.",
        objectives: [
          "Create clear, professional policy summaries",
        ],
        actionItems: [
          "Prepare a summary file for a client",
        ],
        defaultContent: [
          link("p6-3-a", "Knowledge Base — Product Details", "/kb"),
          text("p6-3-b", "A good policy summary includes:\n1. Client's name and policy number\n2. Product name and type\n3. Coverage amount and key benefits\n4. Premium amount and payment frequency\n5. Policy term and maturity date\n6. Key riders and add-ons\n7. Exclusions to be aware of\n8. Claims process and hotline number\n\nSend this to your client within 48 hours of policy issuance. It shows professionalism and gives them a reference document."),
        ],
      },
      {
        id: "p6-4",
        title: "Policy Contract & Contract Provisions",
        description: "Deep dive into policy contracts and their key provisions.",
        objectives: [
          "Understand policy contract structure",
          "Know key contract provisions and their implications",
        ],
        actionItems: [
          "Study a real Policy Contract",
        ],
        defaultContent: [
          link("p6-4-a", "MAS — Insurance Regulations", "https://www.mas.gov.sg/regulation/insurance"),
          text("p6-4-b", "Key contract provisions to know:\n• Free-look period (14 days) — client can cancel and get full refund\n• Grace period (30 days) — for late premium payments\n• Incontestability clause (after 2 years) — insurer can't void for non-disclosure\n• Policy loan — borrow against cash value\n• Non-forfeiture options — what happens if premiums stop\n• Assignment — transferring policy ownership\n• Nomination — who receives the payout\n\nYou must be able to explain each of these to clients in plain language."),
        ],
      },
      {
        id: "p6-5",
        title: "Finalize Business Plan",
        description: "Complete and submit your comprehensive business plan for EPS requirements.",
        objectives: [
          "Complete a thorough, actionable business plan",
        ],
        actionItems: [
          "Submit for EPS Requirement",
        ],
        defaultContent: [
          link("p6-5-a", "MDRT — Building Your Practice", "https://www.mdrt.org/build-your-business"),
          link("p6-5-b", "IBF — Continuing Professional Development", "https://www.ibf.org.sg/programmes/cpd"),
          text("p6-5-c", "Business plan structure:\n1. Your 12-month income target\n2. Average case size and cases needed per month\n3. Conversion rate and meetings needed per month\n4. Calls/approaches needed per week\n5. Daily activity targets (calls, meetings, proposals)\n6. Key market segments you'll focus on\n7. Marketing and prospecting strategy\n8. Skills development goals\n9. Monthly milestone checkpoints\n\nWork backwards from income → cases → meetings → calls. This makes your daily activity targets crystal clear."),
        ],
      },
    ],
  },
];
