export interface TrackItem {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  actionItems: string[];
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

/**
 * Unified Advisor Onboarding Track
 * Merged from Post-AIA Internship Enhanced Training + F.A.S.T. programme.
 * Organized into 6 progressive phases.
 */
export const learningTrack: TrackPhase[] = [
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
      },
    ],
  },
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
      },
    ],
  },
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
      },
    ],
  },
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
      },
    ],
  },
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
      },
    ],
  },
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
      },
    ],
  },
];
