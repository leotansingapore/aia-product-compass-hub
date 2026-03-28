export interface TrackItem {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  actionItems: string[];
}

export interface TrackWeek {
  id: string;
  title: string;
  sessions: TrackItem[];
}

export interface TrackModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  weeks?: TrackWeek[];
  items?: TrackItem[];
}

export const learningTracks: TrackModule[] = [
  {
    id: "post-aia",
    title: "Post-AIA Internship Enhanced Training",
    description: "4-week structured training plan to transition from intern to full-fledged Financial Consultant after your AIA Internship Programme.",
    icon: "graduation",
    weeks: [
      {
        id: "week-1",
        title: "Week 1 — Foundations & Market Survey",
        sessions: [
          {
            id: "w1s1",
            title: "Job Sampling: Project No. 1 & Market Survey Training",
            description: "Identify your personal market, create your Personal Business Plan, and learn market survey techniques for hot, warm, and luke-warm contacts.",
            objectives: [
              "Understand importance of Project 100",
              "Able to conduct Market Surveys confidently",
            ],
            actionItems: [
              "Complete filling in Project No. 1 excel",
              "Master asking for Market Surveys",
            ],
          },
          {
            id: "w1s2",
            title: "Role-Play & Conduct Real Market Surveys",
            description: "Practice market survey approaches through role-play, then conduct 20 real market surveys over the phone.",
            objectives: [
              "Conduct 20 Market Surveys over the phone",
            ],
            actionItems: [
              "Finish the rest of the Market Survey approaches",
            ],
          },
          {
            id: "w1s3",
            title: "Regulations, Expectations & Tools Setup",
            description: "Learn MAS regulations, AIA/District/Agency expectations. Install iPOS+, iSMART+, and CRM tools. Finalize your Personal Business Plan.",
            objectives: [
              "Understand the difference between District and Agency",
              "Understand importance of time management",
              "Understand importance of using CRM tools to follow-up and keep records",
            ],
            actionItems: [
              "Complete Personal Business Plan",
              "Improve and Finalize Personal Business Plan",
              "Familiarize with AIA products",
            ],
          },
          {
            id: "w1s4",
            title: "Joint Field Observation",
            description: "Shadow a senior advisor during a client appointment. Observe from the client's perspective and note what was done well and what can be improved.",
            objectives: [
              "Put yourself in the shoes of the client",
              "Take notes on what was done well and what can be improved",
            ],
            actionItems: [
              "Fill in feedback form and discuss the appointment with the senior",
            ],
          },
        ],
      },
      {
        id: "week-2",
        title: "Week 2 — Prospecting & Product Training",
        sessions: [
          {
            id: "w2s1",
            title: "Prospecting & Telephone Approach Training",
            description: "Learn the difference between warm, semi-warm (Opening-to-an-Opening), and cold prospecting. Master telephone scripts and the \"Fatal Alternatives\" technique.",
            objectives: [
              "Confident and able to conduct approaches",
              "Use of \"Fatal Alternatives\"",
              "Text them immediately after calling and 1 day prior to apt",
            ],
            actionItems: [
              "Prepare Personalized Scripts and Templates (WhatsApp etc.)",
            ],
          },
          {
            id: "w2s2",
            title: "Roleplay Approaches & 20 Point Card",
            description: "Practice approach scripts through roleplay, then conduct real approaches via telephone and messaging. Introduction to the 20 Point Card system.",
            objectives: [
              "Interact with at least 20 people to ask for an appointment",
            ],
            actionItems: [
              "Start filling in the 20 Point card",
            ],
          },
          {
            id: "w2s3",
            title: "Risk Management Product Training",
            description: "Overview of Personal Financial Planning. Deep dive into Risk Management products: PA, Hospitalization, Whole Life, and Term insurance.",
            objectives: [
              "Understand the difference between Medical Treatment and Income Replacement",
              "Identify where each common product fits into the Big Picture",
            ],
            actionItems: [
              "Familiarize yourself with the mentioned common products",
              "Master PA, Hospitalization, Whole Life presentation",
            ],
          },
          {
            id: "w2s4",
            title: "Joint Field Observation",
            description: "Second field observation with a senior advisor. Continue building client empathy and observational skills.",
            objectives: [
              "Put yourself in the shoes of the client",
              "Take notes on what was done well and what can be improved",
            ],
            actionItems: [
              "Fill in feedback form and discuss the appointment with the senior",
            ],
          },
        ],
      },
      {
        id: "week-3",
        title: "Week 3 — Presentations & Opening Appointments",
        sessions: [
          {
            id: "w3s1",
            title: "Roleplay of Risk Management Presentations",
            description: "Present PA, Hospitalization, and Whole Life products in a roleplay setting. Build confidence in explaining and presenting solutions.",
            objectives: [
              "Confident and able to explain and present the solutions",
            ],
            actionItems: [
              "Continue practising",
            ],
          },
          {
            id: "w3s2",
            title: "Opening Appointment Training",
            description: "Learn proper conduct of an Opening appointment. Master Questioning skills and prepare your Personal Writeup.",
            objectives: [
              "Proper conduct of Opening",
              "Importance of mastering Questioning skills",
            ],
            actionItems: [
              "Practice Opening",
              "Prepare Personal Writeup",
            ],
          },
          {
            id: "w3s3",
            title: "Roleplay Opening Appointment",
            description: "Practice conducting an Opening appointment through roleplay until confident.",
            objectives: [
              "Confident and able to conduct Opening",
            ],
            actionItems: [
              "Continue practising",
            ],
          },
          {
            id: "w3s4",
            title: "Joint Field Observation",
            description: "Third field observation. By now you should be noticing patterns and developing your own style.",
            objectives: [
              "Put yourself in the shoes of the client",
              "Take notes on what was done well and what can be improved",
            ],
            actionItems: [
              "Fill in feedback form and discuss the appointment with the senior",
            ],
          },
        ],
      },
      {
        id: "week-4",
        title: "Week 4 — Mastery & Wealth Products",
        sessions: [
          {
            id: "w4s1",
            title: "Review & Financial Calculator Training",
            description: "Review your Personal Writeup, go through the Opening process again, and learn to use the Financial Calculator effectively.",
            objectives: [
              "Focus on Questioning Techniques and Referral Asking",
            ],
            actionItems: [
              "Master the Opening and Questioning Techniques",
            ],
          },
          {
            id: "w4s2",
            title: "Roleplay Opening Appointment (Final)",
            description: "Final roleplay session to perfect your Opening appointment technique before going live.",
            objectives: [
              "Confident and able to conduct Opening",
            ],
            actionItems: [
              "Continue practising",
            ],
          },
          {
            id: "w4s3",
            title: "Portfolio Summary & COSA Training",
            description: "Learn to compile Portfolio Summaries and use Change of Servicing Agent (COSA) and Portfolio Summary Report Request forms.",
            objectives: [
              "Be aware of common AIA policies and common competitors' policies",
              "Know where and how to find relevant info",
              "Be able to compile Portfolio Summary",
            ],
            actionItems: [
              "Prepare prospects' Portfolio Summaries",
            ],
          },
          {
            id: "w4s4",
            title: "Wealth Accumulation Product Training",
            description: "Learn about ILP vs. Endowment products and how to structure hybrid solutions for the best of both worlds.",
            objectives: [
              "Know when to recommend ILP vs. Endowment",
              "Structuring hybrid to have best of both worlds",
            ],
            actionItems: [
              "Master ILP and Endowment product presentations",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "fast",
    title: "Foundation for Advisor Success Training (F.A.S.T.)",
    description: "22-topic comprehensive training programme covering goal setting, digital tools, product knowledge, sales skills, case studies, and business planning.",
    icon: "rocket",
    items: [
      {
        id: "fast-1",
        title: "1. Goal Setting and Business Preparation",
        description: "Set your goals and prepare for your advisory career.",
        objectives: ["Establish clear career goals", "Understand what success looks like"],
        actionItems: ["Pledge Sheet", "Name Card", "Profile Page", "Business Plan"],
      },
      {
        id: "fast-2",
        title: "2. Digital Tools for Success",
        description: "Set up the digital tools you'll use daily as an advisor.",
        objectives: ["Master key digital platforms", "Set up professional profiles"],
        actionItems: ["Biz WhatsApp", "Link Tree", "MyWai App", "AIA iSmart Platform"],
      },
      {
        id: "fast-3",
        title: "3. AIA New Advisor Welcome Booklet",
        description: "Go through the official AIA New Advisor Welcome Booklet.",
        objectives: ["Understand AIA's expectations and resources"],
        actionItems: ["Download Comp Portal and all necessary apps for iPad"],
      },
      {
        id: "fast-4",
        title: "4. Project Nos 1 / Market Survey",
        description: "Build your prospect list and conduct market surveys.",
        objectives: ["Build a comprehensive prospect list", "Understand market survey methodology"],
        actionItems: ["Review Project Nos 1", "Complete 100 Market Surveys"],
      },
      {
        id: "fast-5",
        title: "5. Time Management",
        description: "Master time management for maximum productivity.",
        objectives: ["Create effective scheduling habits"],
        actionItems: ["MS Calendar setup", "Create Masterplan"],
      },
      {
        id: "fast-6",
        title: "6. DISC / Closing with Confidence",
        description: "Understand personality types and develop closing confidence.",
        objectives: ["Develop a USP with strength", "Understand DISC personality framework"],
        actionItems: ["Complete DISC assessment", "Develop personal USP"],
      },
      {
        id: "fast-7",
        title: "7. Telethon Session x 2",
        description: "Participate in two telethon sessions to build call confidence.",
        objectives: ["Build confidence in phone outreach", "Practice live calling"],
        actionItems: ["Social Media Posting"],
      },
      {
        id: "fast-8",
        title: "8. Present Canned Sales Track / Call Pitch, ABCD",
        description: "Master the structured sales track and call pitch methodology.",
        objectives: ["Memorize and deliver the canned sales track fluently"],
        actionItems: ["FHR Challenge"],
      },
      {
        id: "fast-9",
        title: "9. How to Market Yourself / Elevator Pitch",
        description: "Develop your personal brand and craft a compelling elevator pitch.",
        objectives: ["Create a memorable elevator pitch", "Build personal marketing materials"],
        actionItems: ["Prepare Marketing Kit"],
      },
      {
        id: "fast-10",
        title: "10. Run Thru AIA iPOS",
        description: "Learn to navigate and use the AIA iPOS system effectively.",
        objectives: ["Navigate iPOS confidently", "Load and manage cases"],
        actionItems: ["Load own case"],
      },
      {
        id: "fast-11",
        title: "11. Prepare Closing Proposal",
        description: "Learn to prepare professional closing proposals.",
        objectives: ["Create compelling closing proposals"],
        actionItems: ["Create Closing Template"],
      },
      {
        id: "fast-12",
        title: "12. Case Study One — Opening",
        description: "Work through the first case study focusing on the Opening appointment.",
        objectives: ["Apply Opening techniques to a real scenario"],
        actionItems: ["Prepare Presentation Proposal"],
      },
      {
        id: "fast-13",
        title: "13. Case Study One — Closing",
        description: "Complete the first case study with the Closing appointment.",
        objectives: ["Apply closing techniques with leader support"],
        actionItems: ["Leader accompany FC for Closing Appt"],
      },
      {
        id: "fast-14",
        title: "14. Role Play VIPS",
        description: "Practice the VIPS (Values, Issues, Problems, Solutions) framework through role play.",
        objectives: ["Master the VIPS framework", "Handle different client scenarios"],
        actionItems: ["Practice VIPs (Forms in Office)"],
      },
      {
        id: "fast-15",
        title: "15. Case Study Two & Three",
        description: "Work through additional case studies to reinforce learning.",
        objectives: ["Apply all learned techniques to diverse scenarios"],
        actionItems: ["Complete both case studies"],
      },
      {
        id: "fast-16",
        title: "16. Time Value of Money Training",
        description: "Understand and explain the Time Value of Money concept to clients.",
        objectives: ["Master TVM calculations", "Explain TVM in simple terms"],
        actionItems: ["TVM Test"],
      },
      {
        id: "fast-17",
        title: "17. Case Submission",
        description: "Learn the complete case submission process and underwriting requirements.",
        objectives: ["Understand end-to-end submission process"],
        actionItems: ["Read Underwriting Guide"],
      },
      {
        id: "fast-18",
        title: "18. Policy Summary",
        description: "Learn to create comprehensive policy summaries for clients.",
        objectives: ["Create clear, professional policy summaries"],
        actionItems: ["Summary file for client"],
      },
      {
        id: "fast-19",
        title: "19. Business Plan",
        description: "Finalize your comprehensive business plan.",
        objectives: ["Complete a thorough business plan"],
        actionItems: ["To submit for EPS Requirement"],
      },
      {
        id: "fast-20",
        title: "20. Canned Sales Track Demo",
        description: "Demonstrate mastery of the canned sales track.",
        objectives: ["Deliver the full sales track confidently"],
        actionItems: ["Practise, Practise, Practice"],
      },
      {
        id: "fast-21",
        title: "21. Joint Field Observation with Leader or Senior",
        description: "Final joint field observation to demonstrate readiness.",
        objectives: ["Demonstrate observation skills", "Show readiness for independent work"],
        actionItems: ["Fill Joint Field Work Observation Form"],
      },
      {
        id: "fast-22",
        title: "22. Understanding Policy Contract and Contract Provisions",
        description: "Deep dive into policy contracts and their provisions.",
        objectives: ["Understand policy contract structure", "Know key contract provisions"],
        actionItems: ["Bring any Policy Contract"],
      },
    ],
  },
];
