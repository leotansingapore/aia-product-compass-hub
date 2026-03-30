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

// ─── Assignment Checklist Types ──────────────────────────────────────
export interface AssignmentItem {
  id: string;
  title: string;
}

export interface AssignmentSection {
  id: string;
  title: string;
  description?: string;
  items: AssignmentItem[];
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
 * Intern Training Requirements
 * The Intern agrees to complete the following training requirements
 * during the internship programme.
 */
export const learningTrack: TrackPhase[] = [
  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1 — Foundation & Compliance
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-1",
    title: "Phase 1 — Foundation & Compliance",
    description: "Set up your tools, understand regulations, and prepare for the field.",
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
          text("p1-2-c", "Checklist: (1) Download WhatsApp Business and set up your professional profile. (2) Create a Linktree with your booking link. (3) Install the MyWai App. (4) Log into AIA iSmart."),
        ],
      },
      {
        id: "p1-3",
        title: "Regulations, Expectations & Compliance",
        description: "Understand MAS regulations, AIA expectations, and the difference between District and Agency structures.",
        objectives: [
          "Understand MAS regulations (first 12 weeks, sales competency, etc.)",
          "Understand AIA expectations (FTS training, E-modules, LMS CPD hours)",
          "Know District and Agency expectations",
        ],
        actionItems: [
          "Familiarize with AIA products",
          "Understand the difference between District and Agency",
        ],
        defaultContent: [
          link("p1-3-a", "MAS — Financial Advisers Act (FAA)", "https://www.mas.gov.sg/regulation/acts/financial-advisers-act"),
          link("p1-3-b", "Browse All Product Categories", "/"),
          text("p1-3-c", "Key MAS rules for your first 12 weeks: You must be supervised by a qualified representative for all client meetings. You cannot give advice independently until you pass your sales competency assessments."),
        ],
      },
      {
        id: "p1-4",
        title: "CMFAS HI Paper",
        description: "Sit for and pass the CMFAS Health Insurance (HI) Paper.",
        objectives: [
          "Understand the HI exam format and syllabus",
          "Pass the CMFAS HI Paper on first attempt",
        ],
        actionItems: [
          "Complete all HI study modules",
          "Sit for the CMFAS HI Paper",
        ],
        defaultContent: [
          link("p1-4-a", "CMFAS HI Module", "/cmfas/module/hi"),
          link("p1-4-b", "CMFAS Exam Modules", "/cmfas-exams"),
          text("p1-4-c", "The HI paper is mandatory for selling health insurance products. Study the key topics: MediShield Life, Integrated Shield Plans, disability income, long-term care, and claims procedures."),
        ],
      },
      {
        id: "p1-5",
        title: "Attendance of 3 Days FTS Training",
        description: "Complete the full 3-day Foundation to Success (FTS) training programme conducted by AIA.",
        objectives: [
          "Complete all 3 days of FTS training",
          "Understand the AIA sales process end-to-end",
        ],
        actionItems: [
          "Register for FTS training dates",
          "Attend all 3 days of FTS training",
          "Complete all FTS assessments",
        ],
        defaultContent: [
          text("p1-5-a", "FTS (Foundation to Success) is AIA's foundational training programme covering product knowledge, sales process, compliance, and client relationship management. Attendance for all 3 days is mandatory."),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2 — Sales Skills & Presentations
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-2",
    title: "Phase 2 — Sales Skills & Presentations",
    description: "Develop core sales competencies and master key presentations.",
    items: [
      {
        id: "p2-1",
        title: "CST Presentation Competency",
        description: "Demonstrate competency in the Canned Sales Track (CST) Presentation, graded by the Direct Leader.",
        objectives: [
          "Master the CST Presentation end-to-end",
          "Deliver confidently and naturally without notes",
          "Receive passing grade from Direct Leader",
        ],
        actionItems: [
          "Practice CST Presentation until fluent",
          "Schedule grading session with Direct Leader",
          "Pass the CST Presentation assessment",
        ],
        defaultContent: [
          link("p2-1-a", "Scripts Database — Sales Scripts", "/scripts"),
          link("p2-1-b", "Script Playbooks", "/playbooks"),
          link("p2-1-c", "AI Roleplay — Practice with AI Clients", "/roleplay"),
          text("p2-1-d", "CST grading criteria:\n• Natural delivery (not robotic)\n• Smooth transitions between sections\n• Handles interruptions/questions confidently\n• Eye contact and rapport\n• Clear call to action at the close"),
        ],
      },
      {
        id: "p2-2",
        title: "Total Wealth Concept Competency",
        description: "Demonstrate competency in the Total Wealth Concept, graded by the Direct Leader.",
        objectives: [
          "Understand and articulate the Total Wealth Concept clearly",
          "Present the concept to different client profiles",
          "Receive passing grade from Direct Leader",
        ],
        actionItems: [
          "Study the Total Wealth Concept framework",
          "Practice presenting to peers",
          "Schedule grading session with Direct Leader",
          "Pass the Total Wealth Concept assessment",
        ],
        defaultContent: [
          link("p2-2-a", "Concept Cards — Product Knowledge", "/concept-cards"),
          link("p2-2-b", "Browse All Product Categories", "/"),
          link("p2-2-c", "Pitch Analysis Tool", "/roleplay/pitch-analysis"),
          text("p2-2-d", "The Total Wealth Concept covers the full financial planning pyramid:\n1. Protection — insurance foundation\n2. Savings — emergency fund (3-6 months)\n3. Investment — wealth accumulation\n4. Distribution — retirement & estate\n\nAlways address the bottom layers first before recommending wealth products."),
        ],
      },
      {
        id: "p2-3",
        title: "Simulated Cold-Calling Sessions (x2)",
        description: "Participate in 2 simulated cold-calling sessions with guidance from team Financial Consultants.",
        objectives: [
          "Build confidence in cold-calling techniques",
          "Practice handling objections in real-time",
          "Receive feedback from senior FCs",
        ],
        actionItems: [
          "Complete simulated cold-calling session 1",
          "Complete simulated cold-calling session 2",
          "Debrief with guiding FC after each session",
        ],
        defaultContent: [
          link("p2-3-a", "Scripts Database — Cold Calling Scripts", "/scripts"),
          link("p2-3-b", "Objection Handling Scripts", "/objections"),
          text("p2-3-c", "Cold-calling tips:\n1. Have your script in front of you but don't read word-for-word\n2. Stand up while calling — it makes your voice more energetic\n3. Use \"Fatal Alternatives\" — always give two specific time options\n4. Track every call outcome\n5. Debrief with your FC after each session"),
        ],
      },
      {
        id: "p2-5",
        title: "AIA Pro Achiever (APA) Product Pitch",
        description: "Learn how to pitch AIA Pro Achiever — a goal-driven Investment-Linked Policy (ILP) for growth-focused clients seeking flexibility and long-term accumulation.",
        objectives: [
          "Understand APA's key features: regular premium ILP, curated fund access, top-up and policy loan options",
          "Articulate the value of bonus allocation tiers and how charges vary by premium band",
          "Confidently handle common objections like 'high fees' using cost-averaging and fund access arguments",
          "Tailor the pitch using goal-based illustrations aligned to client milestones",
        ],
        actionItems: [
          "Study the Pro Achiever product page and resources",
          "Practice a 5-minute APA pitch with a peer or AI roleplay",
          "Complete a graded roleplay submission pitching APA",
        ],
        defaultContent: [
          link("p2-5-a", "Pro Achiever — Product Page", "/category/investment-products"),
          link("p2-5-b", "Investment Products Category", "/category/investment-products"),
          link("p2-5-c", "AI Roleplay — Practice Your Pitch", "/roleplay"),
          link("p2-5-d", "Concept Cards — ILP Flashcards", "/concept-cards"),
          link("p2-5-e", "Pitch Analysis Tool", "/roleplay/pitch-analysis"),
          text("p2-5-f", "**Key selling points for APA:**\n• Goal-driven ILP — ideal for clients with specific milestones (children's education, retirement, wealth accumulation)\n• Curated fund selection with top-up flexibility\n• Policy loan feature for liquidity without surrendering\n• Bonus allocation tiers reward higher premiums\n\n**Handling the 'high fees' objection:**\nExplain dollar-cost averaging — regular premiums smooth out market volatility over time. Emphasise the value of curated fund access and professional fund management vs. DIY investing.\n\n**Advisor tip:** Always use goal-based illustrations. Don't sell the product — sell the outcome. \"In 15 years, this could fund your child's university education.\""),
        ],
      },
      {
        id: "p2-4",
        title: "Personal Marketing Kit",
        description: "Prepare a professional Personal Marketing Kit for use in client meetings and networking.",
        objectives: [
          "Create a polished, professional marketing kit",
          "Include all essential materials for client meetings",
        ],
        actionItems: [
          "Design and print business cards",
          "Prepare personal writeup / introduction page",
          "Compile digital and physical marketing materials",
          "Get marketing kit reviewed by Direct Leader",
        ],
        defaultContent: [
          text("p2-4-a", "Marketing Kit should include:\n• Professional business cards\n• Personal writeup / bio page\n• Product summary sheets for your key products\n• Testimonials (when available)\n• Digital presence links (LinkedIn, Linktree)\n• Calculator / iPad with iPOS loaded"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3 — Prospecting & Market Outreach
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-3",
    title: "Phase 3 — Prospecting & Market Outreach",
    description: "Build your prospect list and conduct market surveys.",
    items: [
      {
        id: "p3-1",
        title: "Project 100 — Warm Market",
        description: "Complete Project 100 with the Intern's warm market. Identify and list 100 contacts to approach.",
        objectives: [
          "Identify your personal warm market of 100+ people",
          "Categorize contacts into hot, warm, and luke-warm tiers",
          "Begin systematic outreach",
        ],
        actionItems: [
          "Complete filling in Project 100 list",
          "Categorize all 100 contacts by tier",
          "Begin approaching contacts systematically",
        ],
        defaultContent: [
          link("p3-1-a", "Concept Cards — Product Knowledge Flashcards", "/concept-cards"),
          text("p3-1-b", "The 3 warm market tiers:\n• Hot market — family, close friends (highest trust, easiest to approach)\n• Warm market — colleagues, acquaintances, ex-classmates\n• Luke-warm market — friends of friends, social media connections\n\nStart with hot, then work outward. The goal is 100 names before you make your first call."),
        ],
      },
      {
        id: "p3-2",
        title: "50 Market Surveys",
        description: "Complete 50 Market Surveys to practice needs discovery and build your pipeline.",
        objectives: [
          "Conduct 50 Market Surveys confidently",
          "Practice asking financial planning questions",
          "Build a pipeline of potential prospects",
        ],
        actionItems: [
          "Complete 50 Market Surveys",
          "Log all survey results",
          "Identify top prospects from survey results",
        ],
        defaultContent: [
          link("p3-2-a", "AI Roleplay Training — Practice with AI Clients", "/roleplay"),
          text("p3-2-b", "Market Survey script framework:\n1. Open: \"Hey [name], I'm doing a quick survey for my training — takes 2 min, mind helping?\"\n2. Questions: Current insurance coverage? Biggest financial concern? Saving for anything specific?\n3. Close: \"Thanks! Based on what you shared, I might have some insights — would you be open to a 15-min chat sometime?\""),
        ],
      },
      {
        id: "p3-3",
        title: "Group Coaching — 13 Weeks",
        description: "Participate in weekly Group Coaching for the first 13 weeks, conducted by the Direct Leader.",
        objectives: [
          "Attend all 13 weeks of group coaching",
          "Apply learnings from each session to fieldwork",
          "Share experiences and learn from peers",
        ],
        actionItems: [
          "Attend weekly group coaching sessions",
          "Complete any assigned homework from coaching",
          "Track progress against weekly goals",
        ],
        defaultContent: [
          text("p3-3-a", "Group coaching covers:\n• Weekly activity review and accountability\n• Skills practice and roleplay\n• Case study discussions\n• Objection handling practice\n• Peer learning and experience sharing\n\nCome prepared each week with questions from your field experience."),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4 — Field Work & Observations
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-4",
    title: "Phase 4 — Field Work & Observations",
    description: "Shadow senior advisors and apply your skills in real client situations.",
    items: [
      {
        id: "p4-1",
        title: "Joint Field Work — 10 Appointments",
        description: "Shadow 10 Joint Field Work (JFW) appointments with senior team members and submit a learning log for each.",
        objectives: [
          "Observe 10 real client appointments with senior FCs",
          "Learn different advisory styles and techniques",
          "Submit a detailed learning log after each appointment",
        ],
        actionItems: [
          "Schedule 10 JFW appointments with senior team members",
          "Attend and observe each appointment",
          "Submit learning log after each session",
        ],
        defaultContent: [
          text("p4-1-a", "Observation framework — ask yourself after each session:\n1. How did the advisor build rapport in the first 5 minutes?\n2. What questions did they ask? In what order?\n3. How did they handle objections or resistance?\n4. What body language did you notice (both advisor and client)?\n5. How did they transition from fact-finding to presenting a solution?\n6. How did they ask for the close?\n7. What would YOU do differently?\n\nWrite your observations immediately after the meeting — don't wait."),
        ],
      },
      {
        id: "p4-2",
        title: "Family Policy Summary",
        description: "Complete a comprehensive policy summary for one family member, relative, or close friend.",
        objectives: [
          "Compile a complete portfolio summary for a real person",
          "Identify gaps in their existing coverage",
          "Present findings with clear recommendations",
        ],
        actionItems: [
          "Select a family member, relative, or close friend",
          "Gather their existing policy information",
          "Complete and present the policy summary",
        ],
        defaultContent: [
          link("p4-2-a", "Browse All Products", "/"),
          link("p4-2-b", "Search Products by Client Profile", "/search-by-profile"),
          text("p4-2-c", "Portfolio Summary steps:\n1. Request existing policies from the person\n2. List all current coverage: type, sum assured, premium, maturity date\n3. Identify gaps against recommended coverage levels\n4. Note any duplicate or over-insured areas\n5. Present the summary with clear recommendations"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5 — Learning & Development
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-5",
    title: "Phase 5 — Learning & Development",
    description: "Complete all online learning modules and product knowledge requirements.",
    items: [
      {
        id: "p5-1",
        title: "8 Online Learning Modules",
        description: "Complete all 8 learning modules in the team's online learning platform.",
        objectives: [
          "Complete all 8 required learning modules",
          "Achieve passing scores on all module assessments",
        ],
        actionItems: [
          "Complete Module 1 — Financial Health Check Process",
          "Complete Module 2 — Goal Setting & 20 Point Card",
          "Complete Module 3 — Pre Approach Tools (Project 100, Market Surveys)",
          "Complete Module 4 — Canned Sales Track",
          "Complete Module 5 — Telethon Session 1 (15 Market Surveys)",
          "Complete Module 6 — Telethon Session 2 (15 Market Surveys)",
          "Complete Module 7 — 2.5 Days Foundation to Success",
          "Complete Module 8 — Business Leadership Program",
        ],
        defaultContent: [
          link("p5-1-a", "CMFAS Exam Modules", "/cmfas-exams"),
          link("p5-1-b", "Browse Product Categories", "/"),
          text("p5-1-c", "Tip: Complete modules in order — each builds on the previous one. Take notes and revisit concepts you find challenging. The modules cover both theory and practical application."),
        ],
      },
      {
        id: "p5-2",
        title: "Product Knowledge Mastery",
        description: "Deep dive into all core product categories and master presentations for each.",
        objectives: [
          "Understand the full financial planning landscape",
          "Master key product categories: PA, Hospitalization, Whole Life, Term, ILP, Endowment",
        ],
        actionItems: [
          "Study all product categories in the Knowledge Base",
          "Complete Concept Card reviews for all products",
          "Pass product knowledge assessments",
        ],
        defaultContent: [
          link("p5-2-a", "Medical Insurance Products", "/category/medical-insurance"),
          link("p5-2-b", "Term Products", "/category/term-products"),
          link("p5-2-c", "Whole Life Products", "/category/whole-life-products"),
          link("p5-2-d", "Investment Products", "/category/investment-products"),
          link("p5-2-e", "Endowment Products", "/category/endowment-products"),
          link("p5-2-f", "Concept Cards — Study Flashcards", "/concept-cards"),
        ],
      },
    ],
  },
];

// ─── Assignment Checklist Data ───────────────────────────────────────

export const assignmentChecklist: AssignmentSection[] = [
  {
    id: "assignments",
    title: "Assignments",
    description: "Core assignments to be completed during the START programme.",
    items: [
      { id: "asgn-1", title: "Completion of Remaining CMFAS Module(s)" },
      { id: "asgn-2", title: "Project 100" },
      { id: "asgn-3", title: "30 Market Surveys" },
      { id: "asgn-4", title: "FC Business Plan" },
      { id: "asgn-5", title: "FC Marketing Kit" },
      { id: "asgn-6", title: "Pledge Sheet" },
      { id: "asgn-7", title: "Concept of Financial Planning Presentation (CST, SOL, etc)" },
      { id: "asgn-8", title: "Joint Field Observation on one Opening Interview of a Senior FC / Leader" },
      { id: "asgn-9", title: "Joint Field Observation on one Closing Interview of a Senior FC / Leader" },
      { id: "asgn-10", title: "Joint Field Observation on one Servicing Appointment of a Senior FC / Leader" },
      { id: "asgn-11", title: "Completion of Policy Summary of one Family Member, Relative or Close Friend" },
      { id: "asgn-12", title: "Book Review on 1 Industry Related Book" },
      { id: "asgn-13", title: "Passed all 4 CMFAS Modules" },
      { id: "asgn-14", title: "Submit 1 Roleplay of AIA Pro Achiever (APA) Pitch" },
    ],
  },
  {
    id: "training-components",
    title: "Training Components",
    description: "Training modules to be completed during the programme.",
    items: [
      { id: "tc-1", title: "Financial Health Check Process" },
      { id: "tc-2", title: "Introduction to Goal Setting and 20 Point Card" },
      { id: "tc-3", title: "Pre Approach Tools (Project 100, Market Surveys)" },
      { id: "tc-4", title: "Introduction to Canned Sales Track" },
      { id: "tc-5", title: "Telethon Session 1 : 15 Market Surveys" },
      { id: "tc-6", title: "Telethon Session 2 : 15 Market Surveys" },
      { id: "tc-7", title: "2.5 Days of Foundation to Success" },
      { id: "tc-8", title: "Business Leadership Program" },
    ],
  },
];
