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
        id: "p1-6",
        title: "Completion of Remaining CMFAS Modules",
        description: "Complete all outstanding CMFAS certification modules required for advisory practice.",
        objectives: [
          "Pass all remaining CMFAS modules",
          "Meet MAS certification requirements for advisory practice",
        ],
        actionItems: [
          "Identify which CMFAS modules are still outstanding",
          "Study and prepare for each remaining module",
          "Register and sit for the exams",
        ],
        defaultContent: [
          link("p1-6-a", "CMFAS Exam Modules", "/cmfas-exams"),
          text("p1-6-b", "Ensure all required CMFAS modules are completed before proceeding to field work. Check with your Direct Leader on which modules are mandatory for your role."),
        ],
      },
      {
        id: "p1-7",
        title: "Introduction to Goal Setting and 20 Point Card",
        description: "Learn the goal setting framework and how to use the 20 Point Card for daily activity tracking.",
        objectives: [
          "Understand the 20 Point Card system",
          "Set daily and weekly activity goals",
        ],
        actionItems: [
          "Complete the 20 Point Card training",
          "Begin tracking daily activities using the card",
        ],
        defaultContent: [],
      },
      {
        id: "p1-8",
        title: "Business Leadership Program",
        description: "Complete the Business Leadership Program to build foundational leadership and business management skills.",
        objectives: [
          "Understand leadership principles for financial advisory",
          "Develop business management skills",
        ],
        actionItems: [
          "Attend and complete the Business Leadership Program",
        ],
        defaultContent: [],
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
  // PHASE 5 — Learning & Team Contributions
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "phase-5",
    title: "Phase 5 — Learning & Team Contributions",
    description: "Deepen product knowledge and contribute to the team through knowledge sharing.",
    items: [
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
      {
        id: "p6-4",
        title: "Article or MDRT Journal Sharing",
        description: "Present an Article or MDRT Journal sharing during one Team Monthly Meeting. Select a relevant article, prepare a summary, and share key insights with the team.",
        objectives: [
          "Develop public speaking and presentation skills",
          "Stay current with industry best practices and thought leadership",
          "Contribute knowledge back to the team",
        ],
        actionItems: [
          "Select an article or MDRT Journal piece relevant to the team",
          "Prepare a 10-15 minute presentation with key takeaways",
          "Present at the Team Monthly Meeting",
          "Lead a brief Q&A discussion after the presentation",
        ],
        defaultContent: [
          link("p6-4-a", "MDRT — Round the Table Magazine", "https://www.mdrt.org/round-the-table-magazine"),
          text("p6-4-b", "Presentation structure:\n1. Why this article — what caught your attention, why it's relevant\n2. Key insights — 3-5 main takeaways (analyse, don't just summarize)\n3. How we can apply this — practical applications for the team\n4. Discussion — pose 1-2 questions to spark team conversation"),
        ],
      },
      {
        id: "p5-3",
        title: "Book Review on 1 Industry Related Book",
        description: "Read and review one industry-related book, then share key takeaways.",
        objectives: [
          "Broaden industry knowledge through reading",
          "Extract and articulate key learnings",
        ],
        actionItems: [
          "Select an industry-related book",
          "Read and prepare a review with key takeaways",
          "Submit the book review",
        ],
        defaultContent: [],
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
      { id: "asgn-4", title: "FC Business Plan" },
      { id: "asgn-5", title: "FC Marketing Kit" },
      { id: "asgn-6", title: "Pledge Sheet" },
      { id: "asgn-20", title: "Digital Tools & Platform Setup" },
      { id: "asgn-21", title: "Regulations, Expectations & Compliance" },
      { id: "asgn-22", title: "Simulated Cold-Calling Sessions (x2)" },
      { id: "asgn-23", title: "Personal Marketing Kit" },
      { id: "asgn-24", title: "Group Coaching — 13 Weeks" },
      { id: "asgn-7", title: "Concept of Financial Planning Presentation (CST, SOL, etc)" },
      { id: "asgn-8", title: "Joint Field Observation on Opening, Closing, and Servicing Appointments of a Senior FC / Leader" },
      { id: "asgn-11", title: "Completion of Policy Summary of one Family Member, Relative or Close Friend" },
      
      { id: "asgn-14", title: "Submit 1 Roleplay of AIA Pro Achiever (APA) Pitch" },
      { id: "asgn-18", title: "Present an Article or MDRT Journal sharing during one Team Monthly Meeting" },
    ],
  },
  {
    id: "training-components",
    title: "Training Components",
    description: "Training modules to be completed during the programme.",
    items: [
      { id: "tc-1", title: "Financial Health Check Process" },
      
      { id: "tc-7", title: "2.5 Days of Foundation to Success" },
    ],
  },
];
