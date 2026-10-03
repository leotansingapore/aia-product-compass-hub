// AIA Training Directory 2026, transcribed from AIA's Learning & Development
// catalogue (PDF last modified 9 Sep 2026). Course text follows the catalogue;
// the roadmap and schedule pages were images and are transcribed by hand.
//
// AIA marks the catalogue internal use only, so this file is served by the
// edge function after a tier check and must never be imported by src/.

export type Requirement = "mandatory" | "essential";
export type Format = "classroom" | "virtual" | "elearning";

export interface ScheduleEntry {
  /** 1-12, the 2026 month the session falls in (or starts in). */
  month: number;
  /** Last month a self-paced window stays open, e.g. May to Dec eLearning. */
  endMonth?: number;
  when: string;
}

export interface Course {
  id: string;
  section: string;
  title: string;
  requirement?: Requirement;
  isNew?: boolean;
  formats?: Format[];
  duration?: string;
  cpd?: string;
  /** Total CPD hours where the catalogue gives a number; drives the CPD sort. */
  cpdHours?: number;
  summary: string;
  outcomes?: string[];
  topics?: { heading: string; items: string[] }[];
  notes?: string[];
  eligibility?: string;
  access?: string;
  schedule?: ScheduleEntry[];
  scheduleNote?: string;
}

export interface Section {
  id: string;
  code: string;
  title: string;
  stage: "new" | "experienced" | "leaders";
}

export interface Roadmap {
  id: string;
  title: string;
  stage: "all" | "new" | "experienced" | "leaders";
  tagline?: string;
  columns: {
    heading: string;
    period?: string;
    focus?: string;
    groups: { heading?: string; items: string[] }[];
  }[];
  footnotes?: string[];
}

const SCHEDULE_NOTE = "Dates are subject to change. Confirm on iLearn before you register.";

export const sections: Section[] = [
  { id: "02a", code: "02A", title: "Pre-contract", stage: "new" },
  { id: "02b", code: "02B", title: "Onboarding", stage: "new" },
  { id: "02c", code: "02C", title: "Build to Succeed (Level 1)", stage: "new" },
  { id: "02d", code: "02D", title: "Build to Succeed (Level 2)", stage: "new" },
  { id: "03a", code: "03A", title: "Better Activity", stage: "experienced" },
  { id: "03b", code: "03B", title: "Better Productivity", stage: "experienced" },
  { id: "03c", code: "03C", title: "Better Professionalism", stage: "experienced" },
  { id: "03d", code: "03D", title: "AIA Health Academy", stage: "experienced" },
  { id: "03e", code: "03E", title: "Regulatory", stage: "experienced" },
  { id: "03f", code: "03F", title: "MDRT", stage: "experienced" },
  { id: "03g", code: "03G", title: "Affluent and High Net Worth", stage: "experienced" },
  { id: "03h", code: "03H", title: "Specialised Markets", stage: "experienced" },
  { id: "04a", code: "04A", title: "Aspiring Leaders", stage: "leaders" },
  { id: "04b", code: "04B", title: "New Leaders", stage: "leaders" },
  { id: "04c", code: "04C", title: "Experienced Leaders", stage: "leaders" },
];

const PRE_CONTRACT_PREP = [
  "Study Guide from SCI (available only once you register for the exam).",
  "Read the Study Guide and come with questions to clarify with the tutor.",
  "Attempt practice questions on iLearn or SCI and bring any difficult ones.",
  "A simple calculator.",
  "Latest tutorial schedule: see the Notice or the Talent Development PreContract iKNOW page.",
];

export const courses: Course[] = [
  // 02A Pre-contract
  {
    id: "cmfascanpass1-journey",
    section: "02a",
    title: "#CMFASCanPass1 Journey via iLearn",
    requirement: "mandatory",
    isNew: true,
    formats: ["elearning", "virtual"],
    summary:
      "A structured learning journey that prepares pre-contract candidates for their CMFAS examinations. It gives step-by-step guidance, best study practices and tools to plan, prepare and progress. Guided Study Tracks let candidates pick a pace that fits their schedule, while leaders can support exam bookings and tutorials.\n\nOnce exam planning is done, candidates get self-paced e-Learning videos covering the entire Study Guide and more than 3,000 MCQ practice questions. Learning Mode marks each question instantly with a chapter reference and an explanation for wrong answers; Exam Mode mimics the real paper and marks on completion. Chinese translations of the answers are available. Live Virtual Tutorials can also be booked for difficult concepts.",
    outcomes: [
      "Understand the entire CMFAS exam preparation journey from start to completion.",
      "Select and follow a study track that matches your confidence and availability.",
      "Work with your leader to be exam-ready on time and raise first-attempt pass rates.",
    ],
    notes: [
      "The online tutorials are extra help. You still need to read the SCI CMFAS eBook (at least twice is recommended), attempt the SCI mock paper, study the SCI Key Concepts PDF and attend the relevant AIA Pre-Contract tutorials.",
    ],
    access:
      "IRecruit+ Prospect Portal > iLearn > Journey Available > #CMFASCanPass1 Journey > Pre-examination Preparation Guide",
  },
  {
    id: "cmfas-res5-tutorial",
    section: "02a",
    title: "CMFAS Module RES5 Tutorial",
    formats: ["classroom", "virtual"],
    duration: "Day tutorial: 2 sessions (9:30 AM to 5:30 PM). Evening tutorial: 4 sessions (7:00 PM to 10:00 PM)",
    cpd: "Not applicable",
    summary:
      "Helps you understand the important and difficult concepts in the CMFAS Module RES5 exam: Rules, Ethics and Skills for Financial Advisory Services, in line with MAS requirements, including the laws, regulations, codes, notices, practice notes and guidelines that govern capital markets and life insurance intermediaries in Singapore.",
    outcomes: [
      "Understand important and difficult concepts in CMFAS Module RES5.",
      "Identify the areas that are frequently tested.",
      "Attempt the RES5 exam with more confidence.",
    ],
    notes: PRE_CONTRACT_PREP.map((n) => n.replace("Study Guide from SCI", "RES5 Study Guide from SCI")),
    schedule: [
      { month: 1, when: "Day: 5 and 6 (F2F, Alex); 10 and 11 (WV); 20 and 21 (V). Night: 13 to 16 (V); 27 to 30 (V)" },
      { month: 2, when: "Day: 2 and 3 (F2F, Tampines); 7 and 8 (WV); 24 and 25 (V). Night: 10 to 13 (V)" },
      { month: 3, when: "Day: 2 and 3 (F2F, Alex); 7 and 8 (WV); 17 and 18 (V). Night: 10 to 13 (V); 24 to 27 (V)" },
      { month: 4, when: "Day: 6 and 7 (V); 11 and 12 (WV); 21 and 22 (F2F, Tampines). Night: 14 to 17 (V)" },
      { month: 5, when: "Day: 4 and 5 (F2F, Alex); 9 and 10 (WV); 19 and 20 (V). Night: 12 to 14 (V)" },
      { month: 6, when: "Day: 2 and 3 (V); 6 and 7 (WV); 16 and 17 (F2F, Tampines). Night: 9 to 12 (V); 23 to 26 (V)" },
      { month: 7, when: "Day: 6 and 7 (F2F, Alex); 11 and 12 (WV); 21 and 22 (V). Night: 14 to 17 (V); 28 to 31 (V)" },
      { month: 8, when: "Day: 1 and 2 (WV); 3 and 4 (F2F, Tampines); 18 and 19 (V). Night: 11 to 14 (V); 25 to 28 (V)" },
      { month: 9, when: "Day: 5 and 6 (WV); 15 and 16 (F2F, Alex); 28 and 29 (V). Night: 8 to 11 (V); 22 to 25 (V)" },
      { month: 10, when: "Day: 5 and 6 (V); 10 and 11 (WV); 20 and 21 (F2F, Tampines). Night: 13 to 16 (V); 27 to 30 (V)" },
      { month: 11, when: "Day: 2 and 3 (F2F, Alex); 17 and 18 (V); 28 and 29 (WV). Night: 10 to 13 (V); 24 to 27 (V)" },
      { month: 12, when: "Day: 1 and 2 (V); 5 and 6 (V); 15 and 16 (F2F, Tampines). Night: 8 to 11 (V)" },
    ],
  },
  {
    id: "cmfas-m9-tutorial",
    section: "02a",
    title: "CMFAS Module 9 Tutorial",
    formats: ["virtual"],
    duration: "Day tutorial: 1 session (9:30 AM to 5:30 PM). Evening tutorial: 2 sessions (7:00 PM to 10:00 PM)",
    cpd: "Not applicable",
    summary:
      "Helps you understand the important and difficult concepts in the CMFAS Module 9 exam, which covers the basic knowledge of life insurance and investment-linked policies.",
    outcomes: [
      "Understand important and difficult concepts in CMFAS Module 9.",
      "Identify the areas that are more frequently tested.",
      "Solve investment-linked policy calculation questions.",
      "Attempt the M9 exam with more confidence.",
    ],
    notes: PRE_CONTRACT_PREP.map((n) => n.replace("Study Guide from SCI", "M9 Study Guide from SCI")),
    schedule: [
      { month: 1, when: "Day: 12 (V); 24 (WV); 26 (V). Night: 7 and 8 (V); 22 and 24 (V)" },
      { month: 2, when: "Day: 9 (V); 28 (WV). Night: 26 and 27 (V)" },
      { month: 3, when: "Day: 9 (V); 23 (V); 28 (WV). Night: 4 and 5 (V); 19 and 20 (V)" },
      { month: 4, when: "Day: 13 (V); 25 (WV). Night: 8 and 9 (V); 23 and 24 (V)" },
      { month: 5, when: "Day: 11 (V); 23 (WV); 25 (V). Night: 6 and 7 (V); 21 and 22 (V)" },
      { month: 6, when: "Day: 8 (V); 20 (WV); 22 (V). Night: 3 and 4 (V); 18 and 19 (V)" },
      { month: 7, when: "Day: 13 (V); 25 (WV); 27 (V). Night: 8 and 9 (V); 23 and 24 (V)" },
      { month: 8, when: "Day: 22 (WV); 24 (V). Night: 5 and 6 (V); 20 and 21 (V)" },
      { month: 9, when: "Day: 7 (V); 19 (WV); 21 (V). Night: 2 and 3 (V); 17 and 18 (V)" },
      { month: 10, when: "Day: 12 (V); 24 (WV); 26 (V). Night: 7 and 8 (V); 22 and 23 (V)" },
      { month: 11, when: "Day: 21 (WV); 23 (V); 30 (V). Night: 4 and 5 (V); 19 and 20 (V)" },
      { month: 12, when: "Day: 7 (V); 19 (WV); 21 (V). Night: 17 and 18 (V)" },
    ],
  },
  {
    id: "cmfas-m9a-tutorial",
    section: "02a",
    title: "CMFAS Module 9A Tutorial",
    formats: ["virtual"],
    duration: "Day tutorial: 1 session (9:30 AM to 5:30 PM). Evening tutorial: 2 sessions (7:00 PM to 10:00 PM)",
    cpd: "Not applicable",
    summary:
      "Helps you understand the important and difficult concepts in the CMFAS Module 9A exam: the features, types, advantages and disadvantages of structured products, how they compare with other investments, their governance, documentation and risks (particularly Structured ILPs), how to judge suitability from examples under different market conditions, and the derivatives traded on exchange and over the counter.",
    outcomes: [
      "Understand important and difficult concepts in CMFAS Module 9A.",
      "Identify the areas that are more frequently tested.",
      "Solve structured investment-linked policy calculation questions.",
      "Attempt the M9A exam with more confidence.",
    ],
    notes: PRE_CONTRACT_PREP.map((n) => n.replace("Study Guide from SCI", "M9A Study Guide from SCI")),
    schedule: [
      { month: 1, when: "Day: 9 (V); 17 (WV); 19 (V). Night: 14 and 15 (V); 28 and 29 (V)" },
      { month: 2, when: "Day: 6 (V); 14 (WV); 23 (V). Night: 11 and 12 (V)" },
      { month: 3, when: "Day: 6 (V); 14 (WV); 16 (V). Night: 11 and 12 (V); 25 and 26 (V)" },
      { month: 4, when: "Day: 10 (V); 18 (WV); 20 (V). Night: 15 and 16 (V); 28 and 29 (V)" },
      { month: 5, when: "Day: 8 (V); 16 (WV); 18 (V). Night: 12 and 13 (V); 28 and 29 (V)" },
      { month: 6, when: "Day: 5 (V); 13 (WV); 15 (V). Night: 11 and 12 (V); 24 and 25 (V)" },
      { month: 7, when: "Day: 10 (V); 18 (WV); 20 (V). Night: 15 and 16 (V); 29 and 30 (V)" },
      { month: 8, when: "Day: 7 (V); 15 (WV); 17 (V). Night: 12 and 13 (V); 26 and 27 (V)" },
      { month: 9, when: "Day: 4 (V); 12 (WV); 14 (V). Night: 9 and 10 (V); 23 and 24 (V)" },
      { month: 10, when: "Day: 9 (V); 17 (WV); 19 (V). Night: 14 and 15 (V); 28 and 29 (V)" },
      { month: 11, when: "Day: 6 (V); 14 (WV); 16 (V). Night: 11 and 12 (V); 25 and 26 (V)" },
      { month: 12, when: "Day: 4 (V); 12 (WV); 14 (V). Night: 9 and 10 (V); 23 and 24 (V)" },
    ],
  },
  {
    id: "cmfas-hi-tutorial",
    section: "02a",
    title: "Health Insurance (HI) Tutorial",
    formats: ["virtual"],
    duration: "Evening tutorial: 2 sessions (7:00 PM to 10:00 PM)",
    cpd: "Not applicable",
    summary:
      "Helps you understand the important and difficult concepts in the CMFAS Health Insurance exam, which covers the healthcare environment in Singapore and the types of health insurance products in the market.",
    outcomes: [
      "Understand important and difficult concepts in CMFAS Health Insurance.",
      "Identify the areas that are more frequently tested.",
      "Attempt the HI exam with more confidence.",
    ],
    notes: [
      "HI Study Guide from SCI (available only once you register for the exam).",
      "Read the Study Guide or complete the HI e-Tutorial and come with questions to clarify with the tutor.",
      ...PRE_CONTRACT_PREP.slice(2),
    ],
    schedule: [
      { month: 1, when: "Night: 9 (V)" },
      { month: 2, when: "Night: 6 (V)" },
      { month: 3, when: "Night: 6 (V)" },
      { month: 4, when: "Night: 10 (V)" },
      { month: 5, when: "Night: 8 (V)" },
      { month: 6, when: "Night: 5 (V)" },
      { month: 7, when: "Night: 10 (V)" },
      { month: 8, when: "Night: 7 (V)" },
      { month: 9, when: "Night: 4 (V)" },
      { month: 10, when: "Night: 9 (V)" },
      { month: 11, when: "Night: 6 (V)" },
      { month: 12, when: "Night: 4 (V)" },
    ],
  },

  // 02B Onboarding
  {
    id: "foundation-to-success",
    section: "02b",
    title: "Foundation To Success (FTS): IBF Accreditation Level 1",
    requirement: "mandatory",
    formats: ["classroom", "elearning"],
    duration: "2.5 days of classroom plus mandatory online eModules",
    cpd: "51.5 Supplementary hours and 4 Shield hours",
    cpdHours: 55.5,
    summary:
      "FTS creates a positive client engagement experience with the AIA Sales Advisory Process through AIA's digital tools. It gives New Representatives the regulatory and compliance knowledge and the technical know-how to conduct financial services activities in line with the AIA Sales Advisory Process, with extra curriculum from the Be 1% Better (#B1B) journey to strengthen activation and productivity.\n\nCandidates complete the mandatory product eModules that let them sell all AIA products except High Net Worth products and third-party tie-ups (for example CareShield enhancements with the AIA / Singlife with Aviva partnership); those are taken separately once you have your AIA representative code. You also learn the iPoS process on the iPOS trainee app. Other eModules: FTS Basic Information, Client Centricity, Guide to Non-Face-to-Face Sales and the Company Information Update assessments.\n\nComplete the course and the required Technical Skills and Competencies (TSCs) for your job role to apply for IBF Qualified (IBFQ) certification: https://www.ibf.org.sg/home/for-individuals/ibf-certification/why-be-ibf-certified",
    topics: [
      {
        heading: "Day 1 (9:30 AM to 6:30 PM): Habits for early success",
        items: ["The \"Big Rocks\" of your week", "Leading vs lagging indicators", "FSC Weekly Scoreboard", "Timeboxing and the ideal work week"],
      },
      {
        heading: "Day 1: Selling AIA and Vitality, and positioning yourself",
        items: ["Value proposition of AIA and Vitality", "Your own unique value proposition"],
      },
      {
        heading: "Day 1: Prospecting for early success",
        items: [
          "The Iceberg Model (values and beliefs, thinking, feeling, behaving, results)",
          "Key reasons for prospecting regularly",
          "The prospecting definition and how it is commonly misunderstood",
          "Two stages of prospecting: identifying, and reaching out",
          "10-3-1 and the sales funnel",
          "Methods in prospecting: traditional vs technological",
          "Communication effectiveness: texting vs calling (55:38:7)",
          "The universal sales ratio (20:60:20)",
          "Preparing to make an outbound call for an appointment",
          "Responding positively with the T.A.P. structure",
        ],
      },
      {
        heading: "Day 2 (9:30 AM to 6:30 PM): Compliance",
        items: [
          "Quiz and recap: Personal Data Protection Act",
          "Do Not Call (DNC) provisions",
          "Anti-Money Laundering and Countering the Financing of Terrorism: your role as an FSC",
        ],
      },
      {
        heading: "Day 2: Sales advisory for iPOS+",
        items: ["Financial ratios", "Client's budget", "Proposed plan's premium", "Product matrix", "Deviation"],
      },
      {
        heading: "Day 2: Standard of Living (SOL) concept",
        items: [
          "7 steps for the SOL presentation",
          "Draw the life graph to explain the SOL concept",
          "Link loss-of-income scenarios to protecting SOL, and the three inevitable events that affect it",
          "Create awareness of the need to analyse the client's current situation",
          "First part of the FSC's job: analyse the client's current situation",
          "Second part: understand and analyse the client's goal",
          "Final part: bridge the client's shortfalls",
          "Obtain the client's agreement to complete the FHR (AIA Plan360)",
          "AIA 360",
        ],
      },
      {
        heading: "Day 2: Sales process and the effective fact-finder (AIA Financial Health Check)",
        items: [
          "The definition of selling",
          "The OPEC model (Open, Present, Explore, Close) in every stage of sales",
          "The approach: definition, building trust, sequence of approach",
          "Talents of a good fact-finder: three levels of questions (casual, head, feelings), aware vs disturbing questions, avoiding mental wandering, manipulative questions to avoid, overcoming bad listening habits",
          "Gaining agreement (the discovery agreement)",
          "Six steps for expecting referrals",
          "The AIA Financial Health Check",
        ],
      },
      {
        heading: "Day 3 (2:00 PM to 6:30 PM): GROW questions in financial planning",
        items: [
          "The G.R.O.W. model and its benefits",
          "Using G.R.O.W. questions effectively (5W1H)",
          "Growing S.M.A.R.T.E.R. in financial planning (Specifics, Main actors, Responsibility, Time duration, Excuses, Rewards)",
        ],
      },
      {
        heading: "Day 3: AIA iPOS+ (trainee version)",
        items: ["Hands-on walkthrough of iPOS+", "Run-through of the entire submission process", "Case study: Alex Lee"],
      },
    ],
    notes: [
      "Pass all 4 CMFAS exams (M5, M9, M9A and HI) and provide soft copy certificates.",
      "Complete all product eModules and the \"Guide to iPoS Completion Process\" assessment eModule before class.",
      "Bring a fully charged device other than a phone (iPad or laptop) for notes.",
      "Attend Day 1 before Day 2 and Day 3.",
      "New Representatives (with RNF and AIA code) must complete FTS within 90 days of contract date, or the contract may be reviewed, or within 180 days of starting FTS (start of eModules or Day 1 of class, whichever is earlier). Otherwise you re-register and redo FTS.",
      "Latest updates: the Infosheet or the iKNOW Agency SharePoint.",
    ],
    schedule: [
      { month: 1, when: "PM only: 6, 7, 8; 13, 14, 15; 20, 21, 22; 27, 28, 29" },
      { month: 2, when: "PM only: 3, 4, 5; 10, 11, 12; 24, 25, 26" },
      { month: 3, when: "PM only: 3, 4, 5; 10, 11, 12; 17, 18, 19; 24, 25, 26; 31 Mar, 1 and 2 Apr" },
      { month: 4, when: "PM only: 7, 8, 9; 14, 15, 16; 21, 22, 23; 28, 29, 30" },
      { month: 5, when: "PM only: 5, 6, 7; 12, 13, 14; 19, 20, 21; 25, 26, 28" },
      { month: 6, when: "PM only: 2, 3, 4; 9, 10, 11; 16, 17, 18; 23, 24, 25; 30 Jun, 1 and 2 Jul" },
      { month: 7, when: "PM only: 7, 8, 9; 14, 15, 16; 21, 22, 23; 28, 29, 30" },
      { month: 8, when: "PM only: 4, 5, 6; 11, 12, 13; 18, 19, 20; 25, 26, 27" },
      { month: 9, when: "PM only: 1, 2, 3; 8, 9, 10; 15, 16, 17; 22, 23, 24; 29 and 30 Sep, 1 Oct" },
      { month: 10, when: "PM only: 6, 7, 8; 14, 15, 16; 20, 21, 22; 27, 28, 29" },
      { month: 11, when: "PM only: 3, 4, 5; 10, 11, 12; 17, 18, 19; 24, 25, 26" },
      { month: 12, when: "PM only: 1, 2, 3; 8, 9, 10; 15, 16, 17" },
    ],
  },

  // 02C Build to Succeed (Level 1)
  {
    id: "bts1-programme",
    section: "02c",
    title: "Build to Succeed Level 1 (BTS1): the programme",
    requirement: "essential",
    formats: ["classroom", "elearning"],
    duration: "7 weeks; classes every Wednesday, Thursday and Friday",
    summary:
      "An intensive 7-week programme of classroom sessions and eModules that gives representatives all-round sales skills for this business. You learn AIA's range of products and explore packaging ideas for your clients.",
    topics: [
      {
        heading: "Key modules",
        items: [
          "Sales skills: telephone call, SOL presentation, addressing client's concerns, getting endorsements from clients",
          "Product knowledge and packaging: whole life, endowment, ILP, critical illness and HNW",
          "Practical sessions on selected skill topics, and Weekly Scoreboard reporting",
          "Skill assessments",
        ],
      },
    ],
    schedule: [
      { month: 1, when: "Batch starts 8 Jan. Jan 9, 13, 14, 15, 20, 21, 22, 28, 29, 30; Feb 4, 5, 6, 11, 12, 13, 25, 26, 27" },
      { month: 2, when: "Batch starts 5 Feb. Feb 5, 6, 11, 12, 13, 25, 26, 27; Mar 4, 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27" },
      { month: 3, when: "Batch starts 5 Mar. Mar 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27, 31; Apr 1, 2, 8, 9, 10, 15, 16, 17" },
      { month: 4, when: "Batch starts 9 Apr. Apr 9, 10, 15, 16, 17, 22, 23, 24, 28, 29, 30; May 6, 7, 8, 13, 14, 15, 20, 21, 22" },
      { month: 5, when: "Batch starts 7 May. May 7, 8, 13, 14, 15, 20, 21, 22, 26, 28, 29; Jun 3, 4, 5, 10, 11, 12, 17, 18, 19" },
      { month: 6, when: "Batch starts 4 Jun. Jun 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26; Jul 1, 2, 3, 8, 9, 10, 15, 16, 17" },
      { month: 7, when: "Batch starts 9 Jul. Jul 9, 10, 15, 16, 17, 22, 23, 24, 29, 30, 31; Aug 5, 6, 7, 12, 13, 14, 19, 20, 21" },
      { month: 8, when: "Batch starts 6 Aug. Aug 6, 7, 12, 13, 14, 19, 20, 21, 26, 27, 28; Sep 2, 3, 4, 9, 10, 11, 16, 17, 18" },
      { month: 9, when: "Batch starts 10 Sep. Sep 10, 11, 16, 17, 18, 23, 24, 25, 30; Oct 1, 2, 7, 8, 9, 14, 15, 16, 21, 22, 23" },
      { month: 10, when: "Batch starts 8 Oct. Oct 8, 9, 14, 15, 16, 21, 22, 23, 28, 29, 30; Nov 4, 5, 6, 11, 12, 13, 18, 19, 20" },
      { month: 11, when: "Batch starts 5 Nov. Nov 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27; Dec 2, 3, 4, 9, 10, 11, 15, 16, 17" },
      { month: 12, when: "Batch starts 3 Dec. Dec 3, 4, 9, 10, 11; Jan 6, 7, 8, 13, 14, 15, 20, 21, 22, 27, 28, 29; Feb 2, 3, 4" },
    ],
  },
  {
    id: "bts1-introduction",
    section: "02c",
    title: "BTS1: Introduction",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "The welcome session for BTS1. It sets out the expectations and rules for the 7-week programme, and the Talent Acquisition department briefs you on financing schemes and the validation procedure.",
  },
  {
    id: "bts1-success-101",
    section: "02c",
    title: "BTS1: Success 101 (Robert Young)",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary:
      "The road map to success in this industry, and the mindset that helps you perform at your peak and remove the obstacles that stand between you and your goals.",
  },
  {
    id: "bts1-winners-keep-scores",
    section: "02c",
    title: "BTS1: Winners Keep Scores",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary:
      "Introduces the Weekly Scoreboard, a performance management tool designed for achieving MDRT within 24 months of your career with AIA. Also covers the telephone script for appointment setting and the SOL presentation.",
  },
  {
    id: "bts1-client-conversations",
    section: "02c",
    title: "BTS1: Client Conversations that Convert",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "The CLEAR + GROW Advisory Masterclass. Builds confidence in high-trust, client-centric financial conversations, and reduces client resistance with behavioural insights such as loss aversion, reactance and decision fatigue.\n\nIntroduces the CLEAR framework (Current situation, Latent gaps, Effects and exposure, Aspiration and impact, Resolution path) and the GROW coaching model to structure discovery and align recommendations to client goals. You also practise the 3-Number Budget Technique, objection reframing and a simple three-tier closing system.",
  },
  {
    id: "bts1-beyond-100",
    section: "02c",
    title: "BTS1: Beyond 100",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "Earning the right to referrals and endorsements: plant the referral seed before the presentation, ask for high-value feedback after it, get permission to brainstorm introductions to high-value prospects, and get clients to endorse your services to high-value contacts. Continues the Project 100 content from FTS.",
  },
  {
    id: "bts1-whole-life",
    section: "02c",
    title: "BTS1: Whole Life Plan",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "AIA's income and wealth protection product: how an AIA whole life product works, its key benefits, selling points and limitations.",
  },
  {
    id: "bts1-digital-tools",
    section: "02c",
    title: "BTS1: AIA Digital Tools",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "A hands-on walkthrough of iPoS+ and iSmart+, the two platforms behind the end-to-end advisory process. Through guided demos and practice in realistic scenarios you learn to navigate both, use their key functions in client engagements, needs analysis, product recommendations and policy submissions, and run more efficient, professional advisory conversations.",
  },
  {
    id: "bts1-endowment",
    section: "02c",
    title: "BTS1: Endowment Plans",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "How AIA's suite of endowment plans helps clients reach medium to long term objectives for both wealth accumulation and wealth protection.",
  },
  {
    id: "bts1-ilp",
    section: "02c",
    title: "BTS1: ILP Plans",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary:
      "AIA's ILP products: the markets they suit and how to share their key benefits, selling points and limitations.",
  },
  {
    id: "bts1-vitality-teladoc",
    section: "02c",
    title: "BTS1: AIA Vitality and Teladoc Health",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary:
      "A refresher on the AIA Vitality programme: insurance benefits beyond year one, the roadmap to level up, and the Vitality-integrated plans and riders, taught through knowledge sharing, quizzes, role-plays and sales pitches for different personas. Statistics show Vitality's value for productivity, repurchase and referrals. The Teladoc Health team explains how its medical management solutions help AIA policyholders.",
  },
  {
    id: "bts1-product-bundling",
    section: "02c",
    title: "BTS1: Product Bundling, from Immediate Needs to Holistic Solutions",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "Takes concept selling into real client situations. Many clients focus only on immediate needs; through practical discussion and case-based learning you learn to connect short-term concerns with long-term planning, turn one product into a portfolio of solutions, and bundle products that serve the client's best interests.",
  },
  {
    id: "bts1-ci-pa",
    section: "02c",
    title: "BTS1: Critical Illness and PA Plans",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary: "AIA's CI and PA products in depth: key benefits, selling points and limitations.",
  },
  {
    id: "bts1-tvm-retirement",
    section: "02c",
    title: "BTS1: Time Value of Money, Retirement Planning",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "The factors to consider when quantifying a client's retirement needs, and how to apply Time Value of Money with adjusted calculations to compute the retirement shortfall. Calculations are done on an app.",
  },
  {
    id: "bts1-telethon",
    section: "02c",
    title: "BTS1: Telethon Sessions 1 to 4",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary: "The skills to set at least 12 appointments in the next 7 days.",
    outcomes: [
      "Form productive habits.",
      "Meet the performance standard for setting appointments.",
      "Progress in telephone skills.",
    ],
  },
  {
    id: "bts1-skills-assessment",
    section: "02c",
    title: "BTS1: Skills Assessment",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day, in week 6 of the programme",
    cpd: "3 hours (100% Structured Training)",
    cpdHours: 3,
    summary:
      "You are assessed on appointment setting by telephone, the Standard of Living presentation, getting endorsements from prospects and clients, and addressing concerns (objection handling).",
  },
  {
    id: "bts1-celebratory-lunch",
    section: "02c",
    title: "BTS1: Celebratory Lunch",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (100% Supplementary)",
    cpdHours: 3,
    summary:
      "A celebration for representatives who have done well: a time to reflect on the BTS journey and spur each other on to MDRT.",
  },
  {
    id: "bts1-competency-test",
    section: "02c",
    title: "BTS1: New Representative Competency Test",
    requirement: "essential",
    formats: ["elearning"],
    cpd: "Nil",
    summary:
      "An online MCQ assessment on iLearn covering suitability of recommendations, interpersonal skills, ethical conduct, periodic reviews and complaints handling.",
    outcomes: [
      "Assess your understanding of the key areas of financial planning.",
      "Gauge your competency level and improve your financial knowledge.",
    ],
    notes: [
      "Passing score 80%, unlimited attempts until you pass.",
      "Required for IBF Level 1 Certification under AIA's onboarding framework, together with the Foundation Program (after 25 Sep 2017), 80% BTS1 attendance, the BTS1 Alternative Investment Products module and PDPA consent.",
    ],
    access: "iLearn",
  },
  {
    id: "bts1-alternative-investments",
    section: "02c",
    title: "BTS1: Alternative Investment Products",
    requirement: "essential",
    formats: ["elearning"],
    cpd: "Nil",
    summary:
      "A short eModule on the 4 common alternatives to ILPs (equities, bonds, unit trusts and money market instruments) with their pros and cons, plus 3 simple investment concepts.",
    outcomes: [
      "Differentiate ILPs from common alternative investments.",
      "Know the advantages and disadvantages of equities, bonds, unit trusts and money market instruments.",
      "Understand asset allocation, portfolio theory and the calculation of portfolio risk.",
    ],
    notes: [
      "Required for IBF Level 1 Certification, together with the Foundation Program (after 25 Sep 2017), 80% BTS1 attendance, passing the New Representative Competency Test and PDPA consent.",
    ],
    access: "iLearn",
  },

  // 02D Build to Succeed (Level 2)
  {
    id: "bts2",
    section: "02d",
    title: "AIA Build to Succeed Level 2 (BTS2)",
    requirement: "essential",
    formats: ["virtual", "classroom", "elearning"],
    duration: "Half day per monthly session, over a rolling 12 months",
    cpd: "2.5 hours per session (Supplementary)",
    cpdHours: 2.5,
    summary:
      "A rolling 12-month training programme that keeps new representatives moving towards MDRT. Monthly Builders (MBs) run by external subject matter experts cover mindset, soft skills and technical skills, with short \"burst\" sharing from in-house practitioners and corporate staff on product bundling and other ways to sell more and sell bigger. Self-paced iLearn content runs alongside. Delivered on MS Teams and face to face.",
    outcomes: [
      "Sharpen soft and technical skills in prospecting, consultative selling, presenting and negotiating.",
      "Build your personal and online brand to generate more leads, riding on the company's digital and marketing campaigns.",
      "Up-sell and cross-sell with product bundles, integrating Vitality plans for more holistic positioning.",
      "Explore Corporate Solutions and Life in Group opportunities to widen your client base.",
      "Raise self-awareness and pick up techniques for mindset breakthroughs in production and performance.",
    ],
    notes: ["Attend all scheduled sessions."],
    schedule: [
      { month: 1, when: "23 Jan" },
      { month: 2, when: "24 Feb" },
      { month: 3, when: "24 Mar" },
      { month: 4, when: "24 Apr" },
      { month: 5, when: "22 May" },
      { month: 6, when: "23 Jun" },
      { month: 7, when: "24 Jul" },
      { month: 8, when: "21 Aug" },
      { month: 9, when: "22 Sep" },
      { month: 10, when: "23 Oct" },
      { month: 11, when: "20 Nov" },
      { month: 12, when: "18 Dec" },
    ],
  },

  // 03A Better Activity
  {
    id: "appointment-booster",
    section: "03a",
    title: "Leads Gen Series: Appointment Booster",
    formats: ["classroom"],
    duration: "2 or 3 hours",
    cpd: "2 or 3 hours (Supplementary)",
    cpdHours: 3,
    summary:
      "Set appointments that convert into cases using iSMART+. Hands-on with Leads Generation (LG) campaigns, Customer LifeCycle Triggers (CLT), Existing Customer Marketing (ECM), birthday campaigns, the Resource Hub (brochures, LG links, AIA NOW, eCards) and ad-hoc AIA campaigns, plus conversation starters, campaign tips and product bundling ideas. Ends with a call to action to apply the tools straight away.",
    outcomes: [
      "Understand AIA's current campaigns and initiatives.",
      "Identify and act on leads from LG, CLT and ECM campaigns.",
      "Generate and share campaign URLs and resources from the Resource Hub, including AIA NOW.",
      "Start meaningful customer conversations that support campaign follow-up.",
    ],
    notes: ["Look out for the eDM in your AIA email for dates and registration."],
    schedule: [
      { month: 1, when: "19, 20 Jan" },
      { month: 2, when: "9, 11 Feb" },
      { month: 3, when: "19 Mar" },
      { month: 4, when: "13, 15 Apr" },
      { month: 5, when: "21 May" },
      { month: 6, when: "8, 17 Jun" },
      { month: 7, when: "15 Jul" },
      { month: 8, when: "17, 19 Aug" },
      { month: 9, when: "16 Sep" },
      { month: 10, when: "12, 14 Oct" },
      { month: 11, when: "18 Nov" },
      { month: 12, when: "9 Dec" },
    ],
  },
  {
    id: "social-media-competency",
    section: "03a",
    title: "Social Media Series: Increase Your Social Media Competency",
    formats: ["elearning"],
    duration: "5.45 hours",
    cpd: "5.45 hours (Supplementary)",
    cpdHours: 5.45,
    summary: "Three modules: Digital Branding and Marketing, Social Media Prospecting, and Virtual Selling.",
    outcomes: [
      "Run digital marketing strategies and campaigns that lift your online presence and deliver your value proposition.",
      "Build a visible, searchable brand on social media through sharing and creating content.",
      "Attract and engage potential clients on social platforms using SIM.",
      "Convert leads into sales appointments.",
      "Present insurance solutions virtually with comfort and confidence, with energy and impact.",
      "Adapt your selling approach to how clients like to buy virtually.",
    ],
    scheduleNote: "All year round (available soon)",
  },
  {
    id: "digital-content",
    section: "03a",
    title: "Social Media Series: Digital Content",
    formats: ["elearning"],
    duration: "1.35 hours",
    cpd: "1.35 hours (Supplementary)",
    cpdHours: 1.35,
    summary:
      "Five modules: Creating Content Just Got Easier With ChatGPT; 5 Common Misperceptions That Could Hijack Your Success; Content Constipation is a Symptom and Not a Problem; Grow Your Social Media Following; Content Tracking.",
    outcomes: [
      "Set up your own ChatGPT account and start creating quality content with it.",
      "Recognise the top 5 misbeliefs you may hold about your content journey.",
      "Gain the clarity and mental alignment you need to create content.",
      "Grow your Instagram and Facebook following.",
      "Track your content with simple methods.",
    ],
    scheduleNote: "All year round (available soon)",
  },

  // 03B Better Productivity
  {
    id: "health-wellness-matters",
    section: "03b",
    title: "Health and Wellness Matters!",
    formats: ["virtual"],
    duration: "2.0 to 2.5 hours (depending on the topic)",
    cpd: "2.0 to 2.5 hours (Supplementary)",
    cpdHours: 2.5,
    summary:
      "Webinars run by Talent Development with the Healthcare Department. Doctors share their knowledge of common critical illnesses (early detection, prevention and treatment), and practitioners share cases, so you can offer customer-centric AIA solutions for these medical concerns. Topics are announced closer to each date.",
    outcomes: [
      "Deepen your knowledge of medical conditions and their treatments.",
      "Recognise the importance of early detection and prevention.",
      "Bring this knowledge into client conversations.",
      "Share AIA's healthcare and critical illness range to close clients' protection gaps.",
    ],
    notes: ["Look out for the eDM in your AIA email."],
    schedule: [
      { month: 2, when: "11 Feb" },
      { month: 5, when: "21 May" },
      { month: 8, when: "20 Aug" },
      { month: 11, when: "19 Nov" },
    ],
  },
  {
    id: "investment-seminar",
    section: "03b",
    title: "Investment Seminar",
    isNew: true,
    formats: ["virtual", "classroom"],
    summary:
      "Held every quarter to keep you informed on market trends, portfolio strategies and the economic outlook, with time for questions, so you can help clients with their financial planning.",
    notes: ["Details are released closer to each date via eDM in your AIA email."],
    schedule: [
      { month: 1, when: "28 Jan" },
      { month: 3, when: "25 Mar" },
      { month: 8, when: "26 Aug" },
    ],
  },
  {
    id: "capital-group-workshop",
    section: "03b",
    title: "Capital Group Investment Learning Concept Workshop",
    isNew: true,
    formats: ["virtual", "classroom"],
    summary:
      "Capital Group's Capital Learning courses, delivered by a dedicated Singapore-based trainer and tailored to the AIA agency, to grow your investment knowledge.",
    notes: ["Details are released closer to each date via eDM in your AIA email."],
    schedule: [
      { month: 2, when: "3 Feb" },
      { month: 4, when: "7 Apr" },
      { month: 8, when: "4 Aug" },
      { month: 11, when: "10 Nov" },
    ],
  },
  {
    id: "intermediate-investment-education",
    section: "03b",
    title: "Intermediate Investment Education Series (Level 1 and 2)",
    isNew: true,
    formats: ["virtual", "classroom"],
    summary:
      "Run by Salmon Thrust and built for AIA consultants. Gives you a solid foundation in investment concepts so you can simplify complex ideas, tailor recommendations to client profiles and build trust through informed conversations, while mastering the customer-facing tools.",
    topics: [
      {
        heading: "Level 1: Key Macroeconomic Concepts for Financial Consultants",
        items: [
          "Economic growth: the fundamentals underlying asset prices",
          "Economic indicators: the window to the economic fundamentals",
          "Monetary policy: the primary focus of the central banks",
          "Fiscal policy",
        ],
      },
      {
        heading: "Level 2: Investing Framework and Fund Selection",
        items: [
          "Different portfolio structures for different needs",
          "Portfolio adjustment strategies for each structure",
          "Growth cycle analysis",
          "Economic indicators (revisited)",
          "Key fund facts and the insights in fact sheets",
          "Fund statistics",
          "Blending unit trusts and ETFs",
        ],
      },
    ],
    notes: ["Details are released closer to each date via eDM in your AIA email."],
    schedule: [
      { month: 2, when: "24 Feb" },
      { month: 3, when: "13 Mar" },
      { month: 4, when: "23 Apr" },
      { month: 5, when: "6 May" },
      { month: 8, when: "5 and 11 Aug" },
      { month: 11, when: "5, 11 and 12 Nov" },
    ],
  },
  {
    id: "get-to-know-product",
    section: "03b",
    title: "Get To Know Product Series Workshops",
    isNew: true,
    formats: ["classroom"],
    duration: "2.5 hours",
    cpd: "2.5 hours (100% Structured Training)",
    cpdHours: 2.5,
    summary:
      "Present products with confidence, uncover deeper client needs and position complete solutions. You get a firm grasp of each product's salient features and learn to turn technical benefits into client value, uncover underlying motivations, and catch up on current campaigns and lead generation opportunities.",
    outcomes: [
      "Explain key product benefits in terms of the client's goals and challenges.",
      "Use consultative techniques to surface hidden pain points and buying motivations.",
      "Stay current on initiatives and tools for prospecting and engagement.",
      "Bundle offerings into holistic solutions that raise perceived value and close rates.",
    ],
    notes: ["For new and experienced consultants. Topics and registration via eDM nearer the date."],
    schedule: [
      { month: 1, when: "15, 20 and 22 Jan" },
      { month: 2, when: "3, 10 and 24 Feb" },
      { month: 3, when: "3, 10, 17 and 24 Mar" },
      { month: 4, when: "7, 14, 21 and 28 Apr" },
      { month: 5, when: "5, 12, 19 and 26 May" },
      { month: 6, when: "2, 9, 16 and 23 Jun" },
      { month: 7, when: "7, 14, 21 and 28 Jul" },
      { month: 8, when: "4, 11, 18 and 25 Aug" },
      { month: 9, when: "1, 8, 15 and 22 Sep" },
      { month: 10, when: "6, 13, 20 and 27 Oct" },
      { month: 11, when: "3, 10, 17 and 24 Nov" },
      { month: 12, when: "1, 8 and 15 Dec" },
    ],
  },
  {
    id: "product-knowledge-emodules",
    section: "03b",
    title: "Product Knowledge eModules",
    formats: ["elearning"],
    duration: "Self-paced",
    cpd: "Varies by module",
    summary:
      "Self-paced eLearning on insurance concepts, product structures and matching solutions to client needs. Check iLearn for the latest list of eModules.",
    notes: ["For new and experienced consultants."],
    access: "iLearn",
  },
  {
    id: "product-licensing-emodules",
    section: "03b",
    title: "Product Licensing eModules",
    requirement: "essential",
    formats: ["elearning"],
    duration: "Self-paced",
    cpd: "Varies by module",
    summary:
      "Some AIA products require you to pass an assessment before you may sell them. These self-paced eLearning modules cover the concepts, product structures and client fit, and carry the licensing assessment. Check iLearn for the latest list.",
    notes: ["For new and experienced consultants."],
    access: "iLearn",
  },
  {
    id: "practitioner-sales-concept-sharing",
    section: "03b",
    title: "Practitioner Sales Concept Sharing Seminar",
    formats: ["classroom"],
    duration: "2 hours",
    cpd: "2 hours (100% Structured Training)",
    cpdHours: 2,
    summary:
      "Experienced practitioners share proven sales concepts, field-tested strategies and practical insights on presenting solutions, handling objections and deepening client relationships, through real case studies, peer sharing and discussion. The focus is on what works for people who do it daily.",
    topics: [
      {
        heading: "Key highlights",
        items: [
          "Sales concepts that work: how top practitioners frame conversations to build trust and urgency",
          "Client-centric advisory techniques to uncover priorities and position solutions",
          "Objection handling and value framing through reframing and storytelling",
          "Peer sharing and case studies from real client journeys",
          "Interactive Q&A and networking",
        ],
      },
    ],
    notes: ["For new and experienced consultants. Topic and keynote speaker announced via eDM nearer the date."],
    schedule: [
      { month: 2, when: "24 Feb" },
      { month: 4, when: "22 Apr" },
      { month: 7, when: "22 Jul" },
      { month: 10, when: "22 Oct" },
    ],
  },

  // 03C Better Professionalism
  {
    id: "propel-to-professional-planning",
    section: "03c",
    title: "Propel To Professional Planning (PPP), IBFA-Certified",
    requirement: "essential",
    formats: ["classroom"],
    duration: "2 full days",
    cpd: "13 hours (Supplementary)",
    cpdHours: 13,
    summary:
      "Part of IBFA-Certified Level Up. Brings AIA's brand purpose (helping clients live healthier, longer, better lives) to life through the AIA Financial Health Check process and AIA's digital tools.",
    topics: [
      { heading: "Session 1: Module 1, Establish Client-FSC Relationship", items: ["AIA unique value proposition", "Your value proposition", "3 Assurances and living the Professional Pledge"] },
      { heading: "Session 2: Module 2A, Gather Data including Goals", items: ["Gathering hard and soft facts"] },
      { heading: "Session 3: Module 2B, Gather Data including Goals (role-play)", items: ["COCOA questioning technique"] },
      {
        heading: "Session 4: Module 3, Analyse and Evaluate Financial Status, Develop and Present Solutions",
        items: ["Analyse and evaluate the client's financial status", "Develop solutions and present to clients"],
      },
      { heading: "Session 5: Module 4, Implement Solutions and Annual Review", items: ["Implement solutions", "Effectively obtain referrals", "Client review tips"] },
    ],
    notes: [
      "Update your iPad to the latest iPOS+ and iResource.",
      "The 13 CPD hours are given only for FULL attendance. No make-up and no pro-rating.",
      "IBF Advanced Certification details: see iKNOW.",
    ],
    schedule: [
      { month: 1, when: "26 and 27 Jan" },
      { month: 2, when: "23 and 24 Feb" },
      { month: 3, when: "24 and 25 Mar" },
      { month: 4, when: "21 and 22 Apr" },
      { month: 5, when: "19 and 20 May" },
      { month: 6, when: "23 and 24 Jun" },
      { month: 7, when: "21 and 22 Jul" },
      { month: 8, when: "25 and 26 Aug" },
      { month: 9, when: "22 and 23 Sep" },
      { month: 10, when: "20 and 21 Oct" },
      { month: 11, when: "17 and 18 Nov" },
      { month: 12, when: "15 and 16 Dec" },
    ],
  },
  {
    id: "discover-golden-relationships",
    section: "03c",
    title: "Discover Golden Relationships (DGR), IBFA-Certified",
    requirement: "essential",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (Supplementary)",
    cpdHours: 3,
    summary:
      "Stay connected with \"at-risk\" customers and reconnect with \"inactive\" ones through different touch points. Shows where your goldmine is and a systematic way to work it to lift your repurchase rate, plus the factors behind long-term success and time management tips.",
    outcomes: [
      "Identify the factors behind long-term business success.",
      "Keep \"at-risk\" customers and rebuild trust with \"inactive\" ones.",
      "Reconnect using customised content and touch points with iSMART+.",
      "Use birthday, Customer Lifecycle Triggers and ECM campaigns as conversation starters.",
      "Raise repurchase and referrals through a systematic approach.",
      "Apply effective time management to your business.",
    ],
    notes: [
      "For consultants with at least 2 years in the business; at least 3 years to be eligible for IBFA certification.",
      "Install the latest iSmart+ on your phone or iPad.",
      "IBF Advanced Certification details: see iKNOW.",
    ],
    schedule: [
      { month: 1, when: "28 Jan" },
      { month: 2, when: "25 Feb" },
      { month: 3, when: "26 Mar" },
      { month: 4, when: "23 Apr" },
      { month: 5, when: "21 May" },
      { month: 6, when: "25 Jun" },
      { month: 7, when: "23 Jul" },
      { month: 8, when: "27 Aug" },
      { month: 9, when: "24 Sep" },
      { month: 10, when: "22 Oct" },
      { month: 11, when: "19 Nov" },
      { month: 12, when: "17 Dec" },
    ],
  },
  {
    id: "client-centricity-emodule",
    section: "03c",
    title: "Client Centricity eModule, IBFA-Certified",
    requirement: "essential",
    isNew: true,
    formats: ["elearning"],
    duration: "0.5 hour",
    cpd: "0.5 hour (Supplementary)",
    cpdHours: 0.5,
    summary:
      "Focus on a positive client experience by making the most of service and product offerings and building relationships.",
    outcomes: [
      "Define client centricity and why it matters.",
      "Understand the typical customer life cycle and what the client expects.",
      "List ways to manage and exceed client expectations.",
      "List the steps to identify service gaps.",
      "State the complaints management and escalation process.",
      "List conflict management techniques, including verbal and non-verbal communication.",
    ],
    notes: ["IBF Advanced Certification details: see iKNOW."],
  },
  {
    id: "understanding-customer-needs",
    section: "03c",
    title: "Understanding Customer Needs with Product Solutions, IBFA-Certified",
    requirement: "essential",
    formats: ["elearning"],
    duration: "2 hours",
    cpd: "2 hours (Supplementary)",
    cpdHours: 2,
    summary:
      "Assess customer needs and match them with suitable insurance solutions, with emphasis on AIA's value proposition, customer segmentation, financial planning and product knowledge.",
    outcomes: [
      "Assess customer needs effectively and conduct financial planning.",
      "Recommend suitable insurance solutions.",
      "Use AIA digital tools.",
      "Raise advisory quality with scenario-based decisions.",
      "Comply with industry standards.",
    ],
    notes: ["IBF Advanced Certification details: see iKNOW."],
  },
  {
    id: "compliance-emodule",
    section: "03c",
    title: "Compliance eModule, IBFA-Certified",
    requirement: "essential",
    formats: ["elearning"],
    duration: "1 hour",
    cpd: "1 hour (Supplementary)",
    cpdHours: 1,
    summary: "Do the right things in the right way with the right people. Applied through case studies.",
    topics: [
      {
        heading: "Topics",
        items: [
          "Market misconduct",
          "Foreign Account Tax Compliance Act (FATCA)",
          "Common Reporting Standard (CRS)",
          "Personal Data Protection Act (PDPA)",
          "Do Not Call (DNC) provisions",
          "Spam Control Act",
          "Anti-Money Laundering (AML) and Countering the Financing of Terrorism (CFT)",
          "Offshore solicitation",
          "Prevention of Corruption Act, Chapter 241",
        ],
      },
    ],
    notes: ["IBF Advanced Certification details: see iKNOW."],
  },
  {
    id: "ethics-emodule",
    section: "03c",
    title: "Ethics eModule, IBFA-Certified",
    requirement: "essential",
    formats: ["elearning"],
    duration: "1 hour",
    cpd: "1 hour (Supplementary)",
    cpdHours: 1,
    summary:
      "The practical application of ethical theory to professional ethics for Financial Adviser Representatives, in the industry and in AIA.",
    outcomes: [
      "Define ethics and applied ethics, and the characteristics of ethical behaviour.",
      "State why ethics matters to financial services and why it is more than compliance.",
      "Define ethical culture and why it matters in AIA.",
      "List AIA's ethical business practices.",
    ],
    notes: ["IBF Advanced Certification details: see iKNOW."],
  },
  {
    id: "core-modules-2026",
    section: "03c",
    title: "Ethics, Rules and Regulations (Core Modules 2026)",
    requirement: "mandatory",
    formats: ["elearning"],
    duration: "6 hours",
    cpd: "6 hours (Core)",
    cpdHours: 6,
    summary: "The annual Core CPD module. Look out for the Keynote when it launches.",
    notes: [
      "e-Learning plus e-Assessment; the 6 Core hours are given only when all components are complete.",
      "Representatives newly appointed in the industry this calendar year (RNF from Jan to Dec 2026) are exempt from Core CPD hours for 2026. Example: contracted in Dec 2025, no Core hours needed for 2025; in his second year (2026) he must fulfil them.",
    ],
    schedule: [{ month: 5, endMonth: 12, when: "May to Dec (eLearning)" }],
  },
  {
    id: "life-operations",
    section: "03c",
    title: "Life Operations: New Business, Claims and Policy Services",
    formats: ["virtual"],
    duration: "See the eDM",
    cpd: "See the eDM (Structured Training / Shield)",
    summary:
      "Subject matter experts from New Business, Underwriting and Claims share Life Ops processes, tips and LO digital tools so you can service customers faster and better. Topics are announced closer to each date.",
    notes: ["For new and experienced consultants. Topic and registration via eDM in your AIA email."],
    schedule: [
      { month: 2, when: "25 Feb (webinar)" },
      { month: 3, when: "18 Mar" },
      { month: 4, when: "15 Apr" },
      { month: 5, when: "13 May" },
      { month: 6, when: "17 Jun" },
      { month: 7, when: "15 Jul" },
      { month: 8, when: "19 Aug" },
      { month: 9, when: "16 Sep" },
      { month: 10, when: "14 Oct" },
      { month: 11, when: "18 Nov" },
    ],
  },

  // 03D AIA Health Academy
  {
    id: "aia-health-academy",
    section: "03d",
    title: "AIA Health Academy (Health Advisor status)",
    formats: ["elearning"],
    summary:
      "A dedicated iLearn category of curated training, content and resources to make you a trusted health advisor and help customers live healthier, longer, better lives. Four sections: Local Healthcare System and Health Insurance; Underwriting and Claims; Value Proposition; Health and Wellness Continuous Learning. Plenty of optional modules sit beyond the essentials.",
    topics: [
      {
        heading: "Earn Health Advisor status on iLearn: complete these five Essential modules",
        items: [
          "SCI Health Insurance Certification (Local Healthcare System and Health Insurance)",
          "MAIA (Underwriting and Claims)",
          "Vitality e-Module (Value Proposition)",
          "Health Value Proposition, Health360 and AIA Health Value Proposition video (Value Proposition)",
          "Healthcare 101 e-Module (Value Proposition)",
        ],
      },
      {
        heading: "Technical skills: AIA Medical Underwriting and Claims Guidelines",
        items: [
          "Medical Underwriting Guidelines",
          "Health Claims Process, Insights and Guidelines",
          "Life Ops and Claims e-Modules: MAIA; Claims Refresher (major claims, minor claims, fraud management); Accident Claim Technical Workshop; POS HealthShield, Policy Renewals and Digital Payments; New Business Underwriting on Common Medical Conditions; Policy Servicing tools and timelines; Moratorium on Genetic Testing and Insurance; and others",
        ],
      },
      {
        heading: "General skills: AIA Health Value Proposition",
        items: [
          "AIA Integrated Healthcare Strategy (IHS): Healthcare 101 e-Module",
          "Agent and Customer Health Proposition: Health360 Training; AIA Health Value Proposition video",
          "Vitality: Vitality e-Module",
          "Handling Health Objections: Objections Handling e-Module with Playbook Resource",
        ],
      },
      {
        heading: "Ongoing support: Health and Wellness Workshops and Continuous Education",
        items: [
          "Health Talk e-Series: chronic conditions (hypertension, diabetes, stroke); cancer",
          "Life and Legacy Planning e-Series: Advance Care Planning; Lasting Power of Attorney; My Legacy @ LifeSG; Legacy Planning; CPF Nomination",
        ],
      },
    ],
    access: "iLearn > AIA Health Academy category",
  },

  // 03E Regulatory
  {
    id: "shield-updates",
    section: "03e",
    title: "Shield Updates (MediShield Life and HealthShield Gold Max)",
    requirement: "essential",
    formats: ["elearning"],
    duration: "See each module",
    cpd: "See each module; 2 Shield hours are mandatory",
    summary:
      "e-Learning and videos on product updates, market conduct guidelines and the claims process for MediShield Life and HealthShield Gold Max. Hours are given as you complete each module. Completing 2 Shield hours is mandatory.",
    notes: ["Updates are released closer to the date; look out for the eDM in your AIA email."],
    access: "iLearn > Courses Available > View All > Shield > 2026 Shield",
    scheduleNote: "All year round (eLearning)",
  },
  {
    id: "company-information-updates",
    section: "03e",
    title: "Company Information Updates (CIU)",
    requirement: "mandatory",
    formats: ["elearning"],
    summary: "Look out for the Keynote on the upcoming CIU.",
    schedule: [
      { month: 4, endMonth: 5, when: "Apr to May (eLearning)" },
      { month: 8, endMonth: 9, when: "Aug to Sep (eLearning)" },
    ],
  },

  // 03F MDRT
  {
    id: "mdrt-breakthrough-camp",
    section: "03f",
    title: "MDRT Breakthrough Camp",
    formats: ["virtual", "classroom"],
    summary:
      "A workshop for a mindset shift and breakthrough. Mixes motivation with practical strategies and builds the sales skills to get past the common barriers on the way to MDRT qualification.",
    notes: ["Details are released closer to each date via eDM in your AIA email."],
  },
  {
    id: "mdrt-university",
    section: "03f",
    title: "MDRT University",
    formats: ["virtual", "classroom"],
    summary:
      "Core sales competencies through practical strategies shared by MDRT Ambassadors: prospecting, time management, objection handling, managing new business, POS and claims queries, and client servicing tips and processes. Built to help you reach MDRT and keep performing beyond it.",
    notes: ["Details are released closer to each date via eDM in your AIA email."],
  },
  {
    id: "mdrt-seminars",
    section: "03f",
    title: "MDRT Seminars",
    formats: ["virtual", "classroom"],
    summary:
      "Held at the start of the year, mid-year and in the last quarter to bring MDRT members together to learn from MDRT platform speakers from Asia and around the world, with best practices, motivation and peer sharing through the year.",
    notes: ["Details are released closer to each date via eDM in your AIA email."],
  },
  {
    id: "mdrt-mentorship",
    section: "03f",
    title: "MDRT Mentorship Programme",
    formats: ["virtual", "classroom"],
    summary: "MDRT, COT and TOT qualifiers mentor MDRT aspirants or members and coach them on their journey towards MDRT, COT and TOT.",
  },
  {
    id: "ascend-with-mdrt",
    section: "03f",
    title: "Ascend with MDRT",
    formats: ["virtual", "classroom"],
    summary:
      "Peer-led study groups facilitated by MDRT Ambassadors that share best practices and drive consistent re-qualification, so consultants sustain and lift their MDRT journey.",
  },
  {
    id: "mdrt-videos",
    section: "03f",
    title: "MDRT videos (Go! MDRT and international producers)",
    formats: ["elearning"],
    summary:
      "Go! MDRT: recorded panel dialogues with MDRT producers, on iKNOW (MDRT Vision home on SharePoint). Videos from international MDRT producers on mindset and skillset, as eLearning modules you can listen to on the go.",
    access: "iKNOW > MDRT Vision; iLearn > Resources > MDRT > MDRT Resources",
  },

  // 03G Affluent and High Net Worth
  {
    id: "selling-to-hnw",
    section: "03g",
    title: "Selling to High Net Worth",
    isNew: true,
    formats: ["classroom"],
    duration: "To be advised",
    cpd: "To be advised",
    summary:
      "For those who want to enter the affluent and HNW space. Builds confidence in engaging the HNW segment with the knowledge and skills it needs.",
    outcomes: [
      "Identify the needs and desires of the HNW and understand their mindset.",
      "List the qualities of HNW networks and take practical steps into the HNW space.",
      "Identify types of clients and prospects, their values, personality and beliefs.",
      "Engage the HNW according to their buying behaviour.",
      "Use questioning techniques to create curiosity and handle objections.",
      "Create your brand story and use competency and client intimacy to win HNW referrals.",
      "Address affluent and HNWI concerns with AIA solutions.",
    ],
    eligibility: "With qualifying criteria set by the HNW team.",
    notes: ["Target launch Q2. Important notes to be advised."],
    schedule: [
      { month: 5, when: "20 and 21 May" },
      { month: 7, when: "22 and 23 Jul" },
      { month: 9, when: "2 and 3 Sep" },
      { month: 11, when: "10 and 11 Nov" },
    ],
  },
  {
    id: "hnw-sales-concepts-1",
    section: "03g",
    title: "High Net Worth Sales Concepts (I)",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "2.5 hours (Supplementary)",
    cpdHours: 2.5,
    summary:
      "The problems and pain points HNW individuals face, and how to open conversations that uncover their legacy and wealth planning needs.",
    outcomes: [
      "Multi-generational planning.",
      "Gifting more than what they have.",
      "Estate equalisation and equitable wealth distribution.",
      "Risk management.",
    ],
    schedule: [
      { month: 2, when: "5 Feb" },
      { month: 3, when: "5 Mar" },
      { month: 4, when: "22 Apr" },
      { month: 5, when: "26 May" },
      { month: 6, when: "18 Jun" },
      { month: 7, when: "15 Jul" },
      { month: 8, when: "19 Aug" },
      { month: 9, when: "24 Sep" },
      { month: 10, when: "15 Oct" },
      { month: 11, when: "26 Nov" },
      { month: 12, when: "9 Dec" },
    ],
  },
  {
    id: "hnw-sales-concepts-2",
    section: "03g",
    title: "High Net Worth Sales Concepts (II)",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "2.5 hours (Supplementary)",
    cpdHours: 2.5,
    summary:
      "More HNW pain points, and conversations that uncover legacy and wealth planning needs.",
    outcomes: ["Net worth optimisation.", "Regular income stream.", "Philanthropic giving.", "Business succession."],
    schedule: [
      { month: 1, when: "29 Jan" },
      { month: 2, when: "24 Feb" },
      { month: 3, when: "18 Mar" },
      { month: 4, when: "8 Apr" },
      { month: 5, when: "28 May" },
      { month: 6, when: "25 Jun" },
      { month: 7, when: "9 Jul" },
      { month: 8, when: "6 Aug" },
      { month: 9, when: "16 Sep" },
      { month: 10, when: "14 Oct" },
      { month: 11, when: "17 Nov" },
      { month: 12, when: "15 Dec" },
    ],
  },
  {
    id: "hnw-seminars",
    section: "03g",
    title: "HNW Seminars (Life Ops, Experts Sharing)",
    formats: ["classroom", "virtual"],
    summary:
      "Seminars from the Affluent and HNW roadmap. Onshore: experts sharing on how to penetrate the HNW market, and HNW financial underwriting. Offshore: experts sharing on offshore topics, HNW offshore new business underwriting, and underwriting tips for passers-by.",
    schedule: [
      { month: 3, when: "24 Mar (Life Ops)" },
      { month: 4, when: "1 Apr (Experts Sharing)" },
      { month: 5, when: "13 May (Experts Sharing)" },
      { month: 7, when: "1 Jul (Experts Sharing)" },
      { month: 8, when: "4 Aug (Life Ops)" },
      { month: 9, when: "9 Sep (Experts Sharing)" },
      { month: 10, when: "1 Oct (Life Ops)" },
      { month: 11, when: "4 Nov (Life Ops)" },
    ],
  },
  {
    id: "why-aia-emodule",
    section: "03g",
    title: "Why AIA e-module",
    formats: ["elearning"],
    duration: "20 minutes",
    cpd: "0.25 hour (Supplementary)",
    cpdHours: 0.25,
    summary:
      "AIA's strengths, and how its financial solutions, technology approach and purpose-led brand promise benefit onshore and offshore HNW clients.",
    outcomes: [
      "State how AIA's financial solutions benefit clients.",
      "State how AIA's technology approach benefits clients.",
      "State how AIA's purpose-led brand promise benefits clients.",
      "List what is exclusive for HNW clients.",
    ],
  },
  {
    id: "nftf-offshore-prerequisite",
    section: "03g",
    title: "Pre-requisite for NFTF Offshore Sales eModule [NFTFOFFS_V01]",
    requirement: "essential",
    formats: ["elearning"],
    duration: "30 minutes",
    cpd: "0.5 hour (Supplementary)",
    cpdHours: 0.5,
    summary: "Updates on the Non-Face-To-Face (NFTF) sales solution for offshore business.",
    outcomes: [
      "State the dos and don'ts of NFTF offshore sales.",
      "Define reverse enquiry and how an offshore customer makes one to you.",
      "List the approved regions for NFTF offshore sales.",
      "List the product restrictions.",
      "State the customer eligibility criteria.",
    ],
    notes: ["Compulsory before any Non-Face-to-Face (NFTF) offshore sale."],
  },
  {
    id: "offshore-hnw-selling",
    section: "03g",
    title: "Offshore High Net Worth Selling Workshop",
    formats: ["classroom"],
    duration: "6 hours",
    cpd: "6 hours (Supplementary)",
    cpdHours: 6,
    summary:
      "Find the offshore HNW market value proposition and business opportunities: what offshore business is, reverse enquiry and customer eligibility. You craft your own conversation starter script.",
    outcomes: [
      "Identify the offshore HNW value proposition and opportunities.",
      "State what reverse enquiry is.",
      "List the NFTF offshore customer eligibility criteria.",
      "Craft your own conversation starter script.",
      "Open new business through the offshore product proposition.",
    ],
    schedule: [
      { month: 1, when: "13 Jan" },
      { month: 2, when: "12 Feb" },
      { month: 3, when: "3 Mar" },
      { month: 4, when: "16 Apr" },
      { month: 6, when: "23 Jun" },
      { month: 7, when: "28 Jul" },
      { month: 8, when: "25 Aug" },
      { month: 9, when: "22 Sep" },
      { month: 10, when: "27 Oct" },
      { month: 11, when: "19 Nov" },
      { month: 12, when: "2 Dec" },
    ],
  },
  {
    id: "wealth-mastery-programme",
    section: "03g",
    title: "Wealth Mastery Programme",
    isNew: true,
    formats: ["classroom"],
    duration: "3 days",
    cpd: "Core 1: 6 Core SFA/FAA + 2 Supplementary. Core 2: 4 Core SFA/FAA + 4 Supplementary. Core 3: 7 Supplementary",
    cpdHours: 23,
    summary:
      "Three core modules, run jointly with the HNW team, AIA Investment Management, WMI and external tax consultants. Complete all assessments and the final group role-play to be certified and earn the title AIA Premier Affluent Wealth Adviser.",
    topics: [
      {
        heading: "Core 1: Investment Portfolio Advisory",
        items: [
          "Master investment fundamentals: economic cycles, policy impact and asset classes",
          "Balance risk and reward across traditional asset classes and plan for growth",
          "Explain structured products and align complex strategies with client objectives and risk tolerance",
          "Optimise portfolios with wealth management lending for liquidity and opportunistic investments",
        ],
      },
      {
        heading: "Core 2: Sales Strategies for Affluent Advisors",
        items: [
          "Fuse personal authenticity with institutional strength to become the affluent client's trusted advisor",
          "Build competence-based and benevolence-based trust that turns transactions into partnerships",
          "Turn the first call and first meeting into 90-day trust accelerators with a client-centric onboarding plan",
          "Use the company's ecosystem to automate advocacy and loyalty and lift client engagement",
        ],
      },
      {
        heading: "Core 3: AIA Managed Solutions",
        items: [
          "Advise clients on using AIA Investment Stewardship",
          "Apply risk management strategies when recommending model portfolios for different risk profiles",
          "Sell the benefits of AIA solutions to affluent and HNW clients",
          "Know where and how to access AIA tools and resources",
        ],
      },
    ],
    eligibility: "Qualifying criteria are set by the HNW department.",
    notes: ["CPD hours are given only for the full 3 days. No pro-rating."],
  },
  {
    id: "wealth-accelerator-programme",
    section: "03g",
    title: "Wealth Accelerator Programme",
    isNew: true,
    formats: ["virtual"],
    duration: "1 hour per module",
    cpd: "1 Supplementary hour per module",
    cpdHours: 1,
    summary:
      "Independent virtual modules on cross-border wealth: Module 1A Indonesia, 1B Thailand, 1C China and 1D Malaysia (Wealth Management, Legacy and Tax Planning), and Module 2 Family Office and Philanthropy.",
    topics: [
      {
        heading: "Modules 1A to 1D: Wealth Management, Legacy and Tax Planning",
        items: [
          "Key offshore tax jurisdictions and their implications for wealth planning",
          "Tax reporting obligations (CRS, FATCA) and how they affect offshore structures",
          "Common tax pitfalls such as unintended tax residency or double taxation",
          "Asset protection and liquidity planning across jurisdictions",
        ],
      },
      {
        heading: "Module 2: Family Office and Philanthropy",
        items: [
          "The role of family offices in Singapore's wealth ecosystem",
          "Why Singapore is a preferred hub for family offices",
          "Setting up a family office in Singapore vs Hong Kong or Malaysia",
          "Singapore's tax incentive schemes for family offices: features, benefits, eligibility",
          "Philanthropy-related tax incentives",
        ],
      },
    ],
    notes: ["Register for each module separately."],
  },

  // 03H Specialised Markets
  {
    id: "cs-1-1-intro",
    section: "03h",
    title: "Corporate Solutions Module 1.1: Introduction to Corporate Solutions",
    formats: ["elearning"],
    duration: "Not applicable",
    cpd: "1.5 hours (Supplementary)",
    cpdHours: 1.5,
    summary:
      "Discover the corporate business opportunities around you and your value to clients and prospects: the what, why, who and how of corporate opportunities, and how to use iResource for Corporate Solutions business.",
    outcomes: [
      "List why and how to explore corporate business.",
      "Discover the value you can deliver to clients and prospects.",
      "Look beyond the obvious market for opportunities around you.",
      "List the stages of the Corporate Solutions process.",
    ],
  },
  {
    id: "cs-1-2-flexi-vital-care",
    section: "03h",
    title: "Corporate Solutions Module 1.2: AIA Flexi Vital Care Plus",
    formats: ["elearning"],
    duration: "Not applicable",
    cpd: "1.5 hours (Supplementary)",
    cpdHours: 1.5,
    summary:
      "The Corporate Solutions packaged plan AIA Flexi Vital Care Plus: its benefits, coverage and eligibility, and what to watch for on the application form.",
    outcomes: [
      "Recap the reasons to start in Corporate Solutions.",
      "List the benefits, coverage, eligibility and limitations of Flexi Vital Care.",
      "Prepare and present solutions for different case studies.",
      "List what to note when completing the application form.",
    ],
  },
  {
    id: "cs-1-3-premier-international-medical",
    section: "03h",
    title: "Corporate Solutions Module 1.3: AIA Premier International Medical (eModule)",
    formats: ["elearning"],
    duration: "2 hours",
    cpd: "2 hours (Supplementary)",
    cpdHours: 2,
    summary:
      "AIA Premier International Medical (PIM), accepting new business since 1 January 2022: a premium medical plan with wide geographic coverage for global talent. Four as-charged hospitalisation plans with high limits, and optional riders for outpatient clinical and specialist, dental, optical, maternity and wellness.",
    topics: [
      {
        heading: "Covered",
        items: [
          "Key product features of the AIA Premier International Medical plan",
          "Other value-added services",
          "New business quotation and acceptance guidelines",
        ],
      },
    ],
    outcomes: ["Understand the PIM product construct before selling to new corporate customers."],
    eligibility: "All AIAS and AIAFA leaders and consultants with HI certification.",
  },
  {
    id: "cs-2-1-tailored-plans",
    section: "03h",
    title: "Corporate Solutions Module 2.1: AIA CS Tailored Plans",
    formats: ["elearning"],
    duration: "Not applicable",
    cpd: "1.5 hours (Supplementary)",
    cpdHours: 1.5,
    summary:
      "The Corporate Solutions Tailored plan: benefits, coverage and eligibility, completing a Group Insurance Fact Find (GIFF) form, and the general guidelines on take-over policies.",
    outcomes: [
      "List the benefits, coverage, eligibility and limitations of Tailored Plans.",
      "Know the steps to complete the GIFF form.",
      "List the information needed to generate a Tailored Plan quotation.",
      "Understand the general guidelines for a successful take-over policy.",
    ],
  },
  {
    id: "cs-2-2-after-closing",
    section: "03h",
    title: "Corporate Solutions Module 2.2: What you need to know after closing a CS account",
    formats: ["elearning"],
    duration: "1.5 hours",
    cpd: "1.5 hours (Supplementary)",
    cpdHours: 1.5,
    summary:
      "CS operations, claims functions and work processes, so you can manage corporate clients accurately and efficiently.",
    outcomes: [
      "Understand the processes and their turnaround times (TATs).",
      "Understand how the eBenefit system works.",
      "Know AIA's claims practices and the challenges faced.",
    ],
  },
  {
    id: "cs-3-1-lig",
    section: "03h",
    title: "Corporate Solutions Module 3.1: Learn, get Inspired and Grow Your Business with Life in Group (LIG)",
    formats: ["elearning"],
    duration: "Not applicable",
    cpd: "1.5 hours (Supplementary)",
    cpdHours: 1.5,
    summary: "The know-how of Life in Group business: its benefits and processes.",
    outcomes: ["State the benefits of LIG.", "Understand the LIG processes.", "Apply LIG product strategies and opportunities."],
  },
  {
    id: "lig-1-intro-to-worksite",
    section: "03h",
    title: "LIG Module 1: Introduction to Worksite",
    formats: ["classroom"],
    duration: "1 day",
    cpd: "6.0 hours (Supplementary)",
    cpdHours: 6,
    summary: "For those without LIG experience: how to engage customers for Life in Group business. Face-to-face.",
    outcomes: [
      "Identify LIG business potential.",
      "Use the email template to reach HR for a first appointment.",
      "Present AIA WorkWell to HR.",
      "List the process to run an employee engagement event.",
      "Use LIG Lead-Gen to follow up and close LIG cases.",
    ],
    schedule: [
      { month: 1, when: "8 Jan" },
      { month: 2, when: "3 Feb" },
      { month: 3, when: "12 Mar" },
      { month: 4, when: "14 Apr" },
      { month: 5, when: "12 May" },
      { month: 6, when: "9 Jun" },
      { month: 7, when: "7 Jul" },
      { month: 8, when: "13 Aug" },
      { month: 9, when: "1 Sep" },
      { month: 10, when: "13 Oct" },
      { month: 11, when: "5 Nov" },
      { month: 12, when: "1 Dec" },
    ],
  },
  {
    id: "lig-2-activities-conversion",
    section: "03h",
    title: "LIG Module 2: LIG Activities and Conversion",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3.5 hours (Supplementary)",
    cpdHours: 3.5,
    summary:
      "For those with LIG experience. A hands-on workshop on pre-, during- and post-event preparation, with success tips and plug-and-play tools. Face-to-face.",
    outcomes: [
      "Understand your roles and responsibilities.",
      "Role-play event planning, execution and wrap-up.",
      "Convert leads.",
    ],
    schedule: [
      { month: 1, when: "15 Jan" },
      { month: 2, when: "10 Feb" },
      { month: 3, when: "17 Mar" },
      { month: 4, when: "21 Apr" },
      { month: 5, when: "19 May" },
      { month: 6, when: "16 Jun" },
      { month: 7, when: "14 Jul" },
      { month: 8, when: "20 Aug" },
      { month: 9, when: "8 Sep" },
      { month: 10, when: "20 Oct" },
      { month: 11, when: "12 Nov" },
      { month: 12, when: "8 Dec" },
    ],
  },
  {
    id: "general-insurance",
    section: "03h",
    title: "General Insurance (online modules)",
    formats: ["elearning"],
    duration: "Not applicable",
    cpd: "8 hours (General Insurance hours)",
    cpdHours: 8,
    summary: "A resource portal for General Insurance and its regulations.",
    topics: [
      {
        heading: "Modules",
        items: [
          "GI Module 01: General Insurance Consultants' Registration Regulations (GIARR), 1 hour",
          "GI Module 02: The Singapore General Insurance Code of Practice, 0.5 hour",
          "GI Module 03: Motor Accidents and You + Motor Insurance, 1 hour",
          "GI Module 04: Fire, Property and Travel Insurance, 1.5 hours",
          "GI Module 05: Premium Payment Framework, Rules and Agent Outbound Call Practices, 1 hour",
          "GI Module 06: Data Loss Protection Guidelines, 0.5 hour",
          "GI Module 07: AIA Around the World Plus and AIA Elite HomeCare, 1 hour",
          "GI Module 08: Work Injury Compensation Act, 1.5 hours",
        ],
      },
    ],
  },
  {
    id: "business-insurance-planning",
    section: "03h",
    title: "Business Insurance Planning Workshop (2.5 days)",
    formats: ["classroom"],
    duration: "2.5 days",
    cpd: "17 hours (Supplementary)",
    cpdHours: 17,
    summary:
      "An external workshop run by SCI. Through practical case studies, a veteran financial consultant shows how you can help corporate clients use life insurance to mitigate business risks.",
    outcomes: [
      "Common business structures and the concerns of business owners.",
      "The business risks SMEs face and their potential financial impact.",
      "How a buy-sell agreement is structured.",
      "Business succession, key-employee protection, golden handcuff, credit protection, debtors' protection and other insurable risks planning.",
      "Approaches to business valuation.",
      "Ways to get started with business insurance planning.",
      "Common objections, with real case scenarios.",
    ],
    notes: [
      "Register and pay directly with SCI. Course fees to be advised.",
      "Content subject to change pending confirmation from SCI or the trainer.",
    ],
    schedule: [
      { month: 3, when: "3, 4, 5 Mar" },
      { month: 5, when: "18, 19, 20 May" },
      { month: 8, when: "12, 13, 14 Aug" },
      { month: 10, when: "14, 15, 16 Oct" },
    ],
  },

  // 04A Aspiring Leaders
  {
    id: "build-to-lead",
    section: "04a",
    title: "Build To Lead (BTL)",
    requirement: "essential",
    formats: ["classroom", "elearning"],
    duration: "4 months",
    cpd: "TBA (Supplementary)",
    summary:
      "A series that gives consultants who aspire to lead the mindset, knowledge and skills of the 5 pillars of agency management. It starts with the 5 e-modules of the Leaders Preparation Course (Planning and Goal Setting, Recruitment, Selection, Training, Motivating and Performance Management), then a 3-day 2-night bootcamp on the leader's mindset and recruitment skills, then bi-weekly Recruitment Activity group sessions to keep you on track for appointment. Leadership Profiling covers your leadership style.\n\nYou submit a Recruitment Plan, a 90-day training plan for new consultants, a 3-year Business Plan and a bi-weekly Recruitment Activity Log.",
    outcomes: [
      "Raise self-awareness of your leadership style.",
      "Build effective leadership skills.",
      "Develop a growth mindset on leadership.",
      "Sharpen recruitment skills through peer learning.",
    ],
    eligibility: "Consultants only, subject to selection criteria.",
    schedule: [
      { month: 2, when: "Batch 1: 4 Feb Orientation" },
      { month: 3, when: "Batch 1: 11 to 13 Mar Bootcamp; 17 Mar Mentoring for BTL parent leaders; 19 Mar Leadership Profiling" },
      { month: 4, when: "Batch 1: 1 Apr Recruitment 101; 15 and 29 Apr Recruitment Huddle" },
      { month: 5, when: "Batch 1: 13 May Recruitment Huddle" },
      { month: 7, when: "Batch 2: 8 Jul Orientation" },
      { month: 8, when: "Batch 2: 5 to 7 Aug Bootcamp; 11 Aug Mentoring for BTL parent leaders; 12 Aug Leadership Profiling; 19 Aug Recruitment 101" },
      { month: 9, when: "Batch 2: 2, 16 and 30 Sep Recruitment Huddle" },
    ],
  },
  {
    id: "leadership-profiling-natureseye",
    section: "04a",
    title: "Leadership Profiling (NaturesEye)",
    formats: ["classroom"],
    duration: "Half day",
    cpd: "3 hours (Supplementary)",
    cpdHours: 3,
    summary:
      "Included in BTL. NaturesEye is a method for understanding yourself and others \"through the eyes of nature\": it surfaces your conditioned mental and behavioural tendencies and how they shape your decisions and performance. Used in sales, leadership and team performance coaching across Asia.",
    outcomes: [
      "See the gems and gaps in your leadership psychology.",
      "Look at the limiting fears that come with your profile.",
      "Find ways to be a stronger leader and contributor to team goals and KPIs.",
      "Spot opportunities for sustained breakthroughs in leadership.",
    ],
    eligibility: "Consultants enrolled in the BTL programme.",
    schedule: [
      { month: 3, when: "19 Mar (BTL batch 1)" },
      { month: 8, when: "12 Aug (BTL batch 2)" },
    ],
  },
  {
    id: "leadership-appointment-workshop",
    section: "04a",
    title: "LAW (Leadership Appointment Workshop)",
    requirement: "mandatory",
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "Introduces aspiring leaders to the role and responsibilities of a leader, particularly the Financial Advisers Act and the T&C Plan.",
    outcomes: [
      "Use the FHR Assessment tool to coach your consultants.",
      "Evaluate what a complete FHR looks like, review and endorse the suitability of recommendations, and prescribe recovery actions for incomplete FHRs or weak or misleading recommendations.",
      "Understand a leader's role and responsibilities, the Financial Advisers Act and the T&C Plan.",
      "Understand a leader's responsibilities on marketing materials so you can endorse Level 1 complexity materials.",
    ],
    eligibility: "Compulsory for consultants to be appointed FSM/AD within 12 months of the course date.",
    schedule: [
      { month: 2, when: "26 Feb" },
      { month: 5, when: "21 May" },
      { month: 8, when: "20 Aug" },
      { month: 11, when: "18 Nov" },
    ],
  },

  // 04B New Leaders
  {
    id: "pacesetter-2",
    section: "04b",
    title: "Pacesetter 2.0 (LIMRA)",
    requirement: "mandatory",
    formats: ["classroom"],
    duration: "3 full days",
    cpd: "21 hours (Supplementary)",
    cpdHours: 21,
    summary:
      "Compulsory for all new FSMs and ADs. Managerial skills for agency managers in tune with demographic, social and technology trends: planning, recruiting and selecting, performance appraisal, training, motivation and time management. Includes the Anytown Simulation: run an agency for three years in three hours, make decisions and see results immediately, and sharpen decision making and team building.",
    outcomes: [
      "Learn the main functions of the management role.",
      "Practise the skills those functions need.",
      "Find ways to bring management skills into your organisation.",
      "Retain consultants for long-term profitability.",
    ],
    eligibility: "Newly appointed and existing leaders.",
    notes: [
      "A prerequisite for the Chartered Insurance Agency Manager (CIAM) designation. The other prerequisites: Essentials of Leadership and Management 2.0 (ELM) or Agency Manager Training Course (AMTC), Agency Enhancement Series (AES), and Managing Agency Profitability Seminar (MAPS).",
    ],
    schedule: [
      { month: 3, when: "4, 11, 18 Mar" },
      { month: 4, when: "8 Apr" },
      { month: 5, when: "7, 14, 28 May" },
      { month: 8, when: "5, 12, 26 Aug" },
      { month: 11, when: "4, 11, 25 Nov" },
    ],
  },
  {
    id: "leading-from-within",
    section: "04b",
    title: "Leading from Within: Your Vision and Mission",
    requirement: "essential",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "A one-day deep dive for newly promoted leaders to define a vision and mission that fits who they are. Instead of textbook statements, leaders reflect on their experiences, lessons and defining moments through guided storytelling, group dialogue and creative exercises, and turn the \"why\" behind their leadership into a clear vision and mission for their new teams.",
    outcomes: [
      "Reflect on your personal and professional journey to find the moments that shaped you as a leader.",
      "Identify the values, strengths and lessons behind your leadership philosophy.",
      "Articulate your leadership purpose, your \"why\".",
      "Craft a vision and mission statement that reflects personal conviction and team aspiration.",
      "Commit to action steps for leading and communicating your vision and mission.",
    ],
    schedule: [
      { month: 5, when: "19 May" },
      { month: 11, when: "5 Nov" },
    ],
  },
  {
    id: "attract-engage-recruit",
    section: "04b",
    title: "Attract, Engage and Recruit",
    requirement: "essential",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "Recruitment through coaching a career, not selling a job. Introduces career coaching as a recruitment strategy: use career conversations to generate leads, build trust and credibility, and develop the mindset of a leader who coaches rather than convinces. Includes the NaturesEye method and cards to profile behavioural styles and how they shape career choices and performance potential.",
    outcomes: [
      "Use career coaching to generate recruitment leads.",
      "Profile and coach a potential candidate with a simple structure (hands-on in class).",
      "Hold career conversations that make the insurance career worth exploring.",
    ],
    schedule: [
      { month: 4, when: "9 Apr" },
      { month: 10, when: "22 Oct" },
    ],
  },
  {
    id: "coaching-101",
    section: "04b",
    title: "Coaching 101",
    requirement: "essential",
    formats: ["classroom"],
    duration: "2 days",
    cpd: "14 hours (Supplementary)",
    cpdHours: 14,
    summary:
      "Help your team set goals, motivate them through coaching conversations and give feedback that improves performance, setting the tone for team accountability, communication and trust.",
    outcomes: [
      "Use professional coaching techniques to coach and mentor team members.",
      "Hold coaching conversations that build accountability.",
      "Run performance reviews that engage and motivate.",
      "Support team members' career plans.",
      "Recommend stretch goals and growth opportunities.",
    ],
    notes: ["For all leaders. SkillsFuture funded, with AIA subsidy."],
  },

  // 04C Experienced Leaders
  {
    id: "amtc",
    section: "04c",
    title: "Agency Management Training Course (AMTC, LIMRA)",
    formats: ["classroom"],
    duration: "25 weekly sessions of 3.5 hours",
    cpd: "3 hours per session (Supplementary)",
    cpdHours: 75,
    summary:
      "AIA's in-house AMTC, run with FSMA, gives you a systematic structure and blueprints for building a successful agency. Action projects and reading assignments let you practise in real field situations. By the end of the 25 weeks (including 2 IBF-sanctioned modules) you will have designed your own agency operation manual.",
    topics: [{ heading: "Five areas of agency management", items: ["Planning", "Recruitment", "Selection", "Training", "Performance management"] }],
    eligibility: "Leaders with 2 or more years in leadership.",
    notes: [
      "Level 3 IBF certification. Funding on graduation: 50% for SG citizens and PRs, 70% for SG citizens aged 40 and above.",
      "A prerequisite for the CIAM designation; it may be replaced by ELM 2.0. The other prerequisites: Pacesetter 2.0, Agency Enhancement Series (AES) and Managing Agency Profitability Seminar (MAPS).",
    ],
    schedule: [
      { month: 3, when: "6, 13, 27 Mar" },
      { month: 4, when: "10, 24 Apr" },
      { month: 5, when: "8, 22 May" },
      { month: 6, when: "5 Jun" },
      { month: 7, when: "3, 17, 31 Jul" },
      { month: 8, when: "14, 28 Aug" },
      { month: 9, when: "11, 25 Sep" },
      { month: 10, when: "2, 9, 16, 23, 30 Oct" },
      { month: 11, when: "6, 13, 20, 27 Nov" },
    ],
  },
  {
    id: "peak-performance-coaching",
    section: "04c",
    title: "Peak Performance Coaching",
    requirement: "essential",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "One day on coaching excellence for leaders. Hands-on exercises, role-plays and live coaching build your confidence leading high-performing sales teams through coaching. You leave with a personal coaching action plan.",
    outcomes: [
      "Core coaching skills: active listening, powerful questioning, trust-building.",
      "Structured frameworks such as GROW for impactful conversations.",
      "Techniques for resistance and coaching diverse personalities.",
      "Group coaching strategies for collaboration and peer learning.",
    ],
    eligibility: "Experienced leaders with 2 or more years tenure who already use coaching with their team.",
  },
  {
    id: "influencing-without-authority",
    section: "04c",
    title: "Influencing Without Authority",
    requirement: "essential",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "Advisors follow leaders they trust to help them win, not managers who only monitor numbers. Drawing on John Maxwell's principles, this day teaches agency leaders to win trust, inspire initiative and build loyalty without relying on authority, practised in real scenarios such as recruitment, performance motivation and client trust.",
    outcomes: [
      "Understand influence vs positional authority.",
      "Apply Maxwell's key principles for becoming a person of influence.",
      "Inspire, motivate and empower your agency team.",
      "Build a practical plan to strengthen your influence.",
    ],
    eligibility: "Experienced leaders with 2 or more years tenure.",
    schedule: [
      { month: 5, when: "26 May" },
      { month: 9, when: "23 Sep" },
    ],
  },
  {
    id: "strategic-thinking",
    section: "04c",
    title: "Strategic Thinking",
    requirement: "essential",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "Helps agency leaders anticipate shifts and lead with clarity, using proven frameworks, case studies and exercises to think several moves ahead and turn strategy into results.",
    outcomes: [
      "Develop a strategic leadership mindset for agency growth.",
      "Assess agency strengths, weaknesses and future opportunities.",
      "Attract, retain and build high-performing teams.",
      "Plan for succession, legacy and long-term sustainability.",
      "Anticipate disruptions and build actionable strategic roadmaps.",
    ],
    eligibility: "Experienced leaders with 3 or more years tenure.",
    schedule: [
      { month: 4, when: "22 Apr" },
      { month: 10, when: "21 Oct" },
    ],
  },
  {
    id: "maxwell-5-levels",
    section: "04c",
    title: "John C Maxwell's Transformational Leadership: 5 Levels of Leadership",
    isNew: true,
    formats: ["classroom"],
    duration: "5 days over 5 weeks",
    cpd: "35 hours (Supplementary), minimum 80% attendance",
    cpdHours: 35,
    summary:
      "Five modules built on Maxwell's 5 Levels of Leadership move leaders from understanding themselves to leading others with intention, from management to multiplication. Each module pairs frameworks with coaching practice on trust, communication and culture.",
    outcomes: [
      "Apply the 5 Levels of Leadership for greater impact.",
      "Communicate and connect in ways that build trust and influence.",
      "Coach, mentor and develop others for sustainable performance.",
      "Strengthen character and credibility.",
      "Develop the next generation of leaders.",
    ],
    eligibility: "Experienced FSADs and FSDs with more than 4 years tenure.",
  },
  {
    id: "insead",
    section: "04c",
    title: "INSEAD",
    isNew: true,
    formats: ["classroom"],
    duration: "4 days over 3 months",
    cpd: "TBA",
    summary:
      "For leaders who inspire high-performing teams and lead through change: an entrepreneurial mindset, advanced business planning and bold vision.",
    outcomes: [
      "Business planning skills to manage profitability, drive productivity and build scalable agency systems.",
      "An entrepreneurial mindset that spots growth and adapts to client needs.",
      "Think boldly and act decisively to grow the agency.",
    ],
    eligibility: "Selected leaders only (High Potential List).",
  },
  {
    id: "agency-enhancement-series",
    section: "04c",
    title: "Agency Enhancement Series (AES, LIMRA)",
    formats: ["classroom"],
    duration: "3 days",
    cpd: "21 hours (Supplementary)",
    cpdHours: 21,
    summary:
      "A sales-management programme for senior managers who want advanced practices in recruiting, developing and promoting consultants. Three interactive one-day courses: Recruiting To and From Target Markets; Building Your Business Through New Managers; Developing Your MDRT Consultants.",
    eligibility: "Leaders with 2 or more years in leadership.",
    notes: [
      "IBF funding on graduation: 50% for SG citizens and PRs under 40, 70% for SG citizens aged 40 and above.",
      "A prerequisite for the CIAM designation. The other prerequisites: ELM 2.0 or AMTC, MAPS and Pacesetter 2.0.",
    ],
    schedule: [
      { month: 1, when: "21 to 23 Jan" },
      { month: 4, when: "28 to 30 Apr" },
      { month: 7, when: "22 to 24 Jul" },
    ],
  },
  {
    id: "aes-recruiting-target-markets",
    section: "04c",
    title: "AES: Recruiting to and from Target Markets",
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "For senior sales managers with 3 or more years in sales management: the latest recruiting research, best practices and techniques for penetrating specific target markets.",
    outcomes: [
      "Identify target markets and position the career opportunity to them.",
      "Make the opportunity appeal to those markets and sources.",
      "Improve your approach with candidates from target markets.",
      "Confirm the quality of candidates entering recruiting and selection.",
      "Support quality recruits into the career to raise their odds of success.",
      "Create a steady flow of new candidates.",
    ],
    eligibility: "Leaders with 2 or more years in leadership.",
  },
  {
    id: "aes-new-managers",
    section: "04c",
    title: "AES: Building Your Business through New Managers",
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "For senior sales managers with 3 or more years in sales management: best practices for identifying, selecting and training first-year sales and unit managers.",
    outcomes: [
      "Define the key tasks of the sales management role and a shared set of expectations.",
      "Assess candidates for sales management through job sampling exercises.",
      "Set new managers up for early success on two key parts of the role.",
      "Confirm the quality of candidates entering recruiting and selection.",
      "Help new manager candidates meet and beat promotion criteria.",
      "Apply lessons from The Sales Manager's Crucible game, and build a sourcing strategy and network plan for recruitment.",
    ],
    eligibility: "Leaders with 2 or more years in leadership.",
  },
  {
    id: "aes-mdrt-consultants",
    section: "04c",
    title: "AES: Developing Your MDRT Consultants",
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary:
      "For senior sales managers with 3 or more years in sales management: what it takes to develop MDRT consultants and an MDRT-producing culture, with high activity standards, development opportunities and a coaching and mentoring environment.",
    outcomes: [
      "Communicate a new culture that sets MDRT expectations for your unit.",
      "Support new activity levels with weekly and monthly unit status reports.",
      "Deliver training and development that keeps consultants on track for MDRT.",
      "Measure, monitor and manage success through coaching and mentoring.",
    ],
    eligibility: "Leaders with 2 or more years in leadership.",
    notes: ["AES is a prerequisite for the CIAM designation, with Pacesetter 2.0, AMTC and MAPS."],
  },
  {
    id: "maps",
    section: "04c",
    title: "Managing Agency Profitability Seminar (MAPS, LIMRA)",
    formats: ["classroom"],
    duration: "4.5 days",
    cpd: "27 Supplementary hours",
    cpdHours: 27,
    summary:
      "Builds the capability to grow and sustain a profitable agency in a competitive market. In a safe simulation you see how decisions lead to success or failure, how key performance drivers depend on each other, and how to plan for long-term profitability, manage costs and use market conditions.",
    outcomes: [
      "Link tactical daily decisions to strategic agency profitability.",
      "Use agency resources effectively to hit KPIs.",
      "Identify and influence the key performance drivers (KPDs) of profitability.",
      "Create 3 to 5 year strategies for growth and profitability.",
    ],
    eligibility: "Financial Services Directors and Executive Directors.",
    notes: [
      "IBF funding on graduation: 50% for SG citizens and PRs under 40, 70% for SG citizens aged 40 and above.",
      "A prerequisite for the CIAM designation. The other prerequisites: ELM 2.0 or AMTC, AES and Pacesetter 2.0.",
    ],
    schedule: [
      { month: 3, when: "9 to 13 Mar" },
      { month: 8, when: "17 to 21 Aug" },
    ],
  },
  {
    id: "gama-masters-of-recruiting",
    section: "04c",
    title: "GAMA Master Series: Masters of Recruiting",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary: "Module 1 of the GAMA Master Series, based on GAMA International research: the recruiting and selection practices of top field leaders.",
    outcomes: [
      "Define and create ideal candidate profiles.",
      "Create a referral culture.",
      "Know your primary and secondary recruiting sources.",
      "Manage your COI network.",
    ],
    eligibility: "Leaders.",
  },
  {
    id: "gama-masters-of-selection",
    section: "04c",
    title: "GAMA Master Series: Masters of Selection",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary: "Module 2: how top field leaders launch new consultants into a successful start in the financial planning career.",
    outcomes: ["Create a deselection protocol.", "Create a complete selection process."],
    eligibility: "Leaders.",
  },
  {
    id: "gama-masters-of-retention",
    section: "04c",
    title: "GAMA Master Series: Masters of Retention",
    isNew: true,
    formats: ["classroom"],
    duration: "1 day",
    cpd: "7 hours (Supplementary)",
    cpdHours: 7,
    summary: "Module 3: why producers leave, what gets them to stay, and GAMA's researched best practices for retention.",
    outcomes: [
      "Understand retention challenges.",
      "Design and run a personalised retention framework.",
      "Give business and personal support that improves retention.",
      "Tailor coaching and development for top producers.",
      "Build loyalty and lasting relationships with top producers.",
    ],
    eligibility: "Leaders.",
  },
  {
    id: "leaders-lunch-and-learn",
    section: "04c",
    title: "Leaders' Lunch and Learn",
    formats: ["classroom"],
    summary: "Listed on the 2026 leadership schedule; details to be confirmed.",
    schedule: [{ month: 7, when: "TBC" }],
  },
];

export const roadmaps: Roadmap[] = [
  {
    id: "tied-distribution",
    title: "Tied Distribution Training and Development Roadmap",
    stage: "all",
    tagline: "Elevate professionalism through capability building",
    columns: [
      {
        heading: "Engage: New consultants",
        period: "Month 0 to 12 (Level 1)",
        focus: "Foundational sales readiness",
        groups: [
          { heading: "Pre-contract", items: ["#CMFASCanPass1", "Foundation to Success (FTS)"] },
          { heading: "Foundation", items: ["Build to Succeed (BTS) 1"] },
          { heading: "Selling skills", items: ["Build to Succeed (BTS) 2"] },
        ],
      },
      {
        heading: "Enable: Experienced consultants",
        period: "Month 13 onwards (Level 2)",
        focus: "Next-level sales enablement",
        groups: [
          { heading: "Advanced selling skills", items: ["Better Activity", "Better Productivity", "Better Professionalism"] },
          { heading: "MDRT growth", items: ["MDRT Aspirants", "MDRT Qualifiers Transformation"] },
          { heading: "Specialised markets", items: ["Affluent and High Net Worth", "Business Insurance", "Life in Group (LIG)"] },
        ],
      },
      {
        heading: "Elevate: Leaders",
        period: "Month 24 onwards (Level 3)",
        focus: "Leadership pathway development",
        groups: [
          { heading: "Aspiring leaders", items: ["Leader Appointment Workshop", "Build to Lead"] },
          { heading: "New leaders", items: ["Pacesetter 2.0 (LIMRA)", "Attract, Engage and Recruit", "Vision and Mission", "Coaching 101"] },
          { heading: "Experienced leaders", items: ["Strategic Thinking", "Influencing without Authority", "Advanced Coaching"] },
        ],
      },
    ],
    footnotes: ["From month 13, consultants chart their own path: step into leadership, deepen their sales expertise, or both."],
  },
  {
    id: "new-consultant",
    title: "New Consultant's Training and Development Roadmap",
    stage: "new",
    columns: [
      {
        heading: "Month 0: #CMFASCanPass1 and Foundation to Success (FTS)",
        focus: "Core competencies in licensing and a foundation for early success",
        groups: [
          {
            heading: "#CMFASCanPass1 (new, mandatory)",
            items: ["Structured guide to CMFAS exam preparation", "Tutorials (eLearn and virtual live)", "Chapter revision questions", "Leaders' guidance on a customised exam schedule"],
          },
          {
            heading: "Foundation to Success (mandatory, IBF Level 1)",
            items: [
              "Project 100",
              "Basic Financial Planning Guide (FHC process)",
              "Habits for early success",
              "Prospecting for early success",
              "Compliance and sales advisory",
              "AIA digital tools: iPOS+",
            ],
          },
        ],
      },
      {
        heading: "Month 1 and 2: Build to Succeed (BTS) 1",
        focus: "Develop MDRT aspirants with the right mindset, skillset and toolset",
        groups: [
          {
            heading: "Establish client relationship and build credibility",
            items: ["Standard of Living presentation and other sales concepts", "Basic Financial Planning Guide", "Social media and marketing branding"],
          },
          {
            heading: "Gather client data, understand needs, analyse and evaluate",
            items: ["Asking the right questions with GROW", "Proper fact-finding", "Time Value of Money"],
          },
          { heading: "Present and implement the recommended solution", items: ["Product knowledge and bundling", "Closing skills", "Vitality"] },
          { heading: "Review and maintain the relationship", items: ["Getting endorsements and referrals", "Customer centricity"] },
          {
            heading: "Field-readiness assessment",
            items: [
              "A full assessment of readiness for client interactions: appointment setting, presentations, endorsements and objection handling",
              "New: assignments and Gen AI role-play simulations, with leaders' coaching, instant feedback and personalised development",
            ],
          },
        ],
      },
      {
        heading: "Month 3 to 12: Build to Succeed (BTS) 2",
        focus: "Elevate mindset, skill and toolset: monthly topical engagement to keep consultants active and productive",
        groups: [
          { heading: "Better Activity", items: ["Intermediate skills for social media", "Skills in business expansion", "Lead gen campaigns"] },
          {
            heading: "Better Productivity",
            items: ["Mental toughness", "Success formula for student advisors", "Corporate Solutions; Life in Group", "Investment 101 (new)", "Sales ideas", "Objection handling"],
          },
        ],
      },
    ],
  },
  {
    id: "experienced-consultant",
    title: "Experienced Consultant's Training and Development Roadmap",
    stage: "experienced",
    columns: [
      {
        heading: "Advanced selling skills",
        period: "Month 13 onwards",
        focus: "Core selling competencies to engage and build trust with professionalism and client-centric advice",
        groups: [
          { heading: "Better Activity", items: ["Leads Gen Series", "Social Media Series"] },
          {
            heading: "Better Productivity",
            items: [
              "Practitioners' Sales Concept Sharing",
              "Doctors' webinar: Health and Wellness Matters!",
              "Get to Know Product series (new)",
              "Investment Seminar and Intermediate Investment Education (new)",
              "Product Licensing and Health Shield training (essential)",
              "Soft skill training",
            ],
          },
          {
            heading: "Better Professionalism",
            items: ["Life Operations", "IBF Certified Level Up, Level 2 and 3 (essential)", "Client Centricity (new, essential)", "Company Information Updates and Core Modules (mandatory)"],
          },
        ],
      },
      {
        heading: "MDRT",
        period: "Month 13 onwards",
        focus: "Develop MDRT aspirants with the mindset and skillset for a breakthrough that lasts",
        groups: [
          { heading: "MDRT aspirants", items: ["MDRT Breakthrough Programme", "MDRT University", "MDRT Experience"] },
          {
            heading: "MDRT qualifiers transformation",
            items: ["Ascend with MDRT", "COT/TOT Breakthrough Programme (new)", "MDRT Seminars: MDRT Day, MDRT Final Sprint", "Once MDRT, Always MDRT", "MDRT bite-size learning videos"],
          },
        ],
      },
      {
        heading: "Specialised markets",
        period: "Month 13 onwards",
        focus: "Core knowledge, skillset and mindset to expand into broader markets",
        groups: [
          {
            heading: "Affluent and HNW training",
            items: [
              "Platinum Series Product Licensing (essential)",
              "Pre-requisite for NFTF Offshore Sales (essential)",
              "Why AIA",
              "Selling to the HNW (TBC, new)",
              "HNW Sales Concepts I and II",
              "HNW Seminars",
              "Offshore HNW Selling Workshop",
              "Certified Affluent Wealth Advisor (WMI CAWA)*",
              "Offshore DOJO*",
              "Beyond Our Shores with Professional Regional Specialists*",
              "Wealth Mastery Programme# (new)",
              "Wealth Accelerator Programme (new)",
            ],
          },
          { heading: "Business Insurance", items: ["Core learning and application"] },
          { heading: "Life in Group (LIG)", items: ["Introduction to Worksite I", "LIG Activities and Conversion II"] },
        ],
      },
    ],
    footnotes: [
      "* With qualifying criteria set by the HNW team. Priority for CAWA goes to SPWMs and above.",
      "# Joint collaboration with the HNW team, AIA Investment Management, WMI and external tax consultants.",
    ],
  },
  {
    id: "health-academy",
    title: "AIA Health Academy: Certification of Health Advisors and Leaders",
    stage: "experienced",
    tagline: "Earn Health Advisor status by completing every Essential module (marked *)",
    columns: [
      {
        heading: "1. Overview of Local Healthcare System and Health Insurance",
        focus: "Technical skills",
        groups: [{ heading: "Overview of the local healthcare system", items: ["SCI Health Insurance Certification*"] }],
      },
      {
        heading: "2. AIA Medical Underwriting and Claims Guidelines",
        focus: "Technical skills",
        groups: [
          { heading: "Medical Underwriting Guidelines", items: [] },
          {
            heading: "Health claims process, insights and guidelines (Life Ops and Claims e-Modules)",
            items: [
              "MAIA*",
              "Claims Refresher: major claims, minor claims, fraud management",
              "Accident Claim Technical Workshop",
              "POS HealthShield, Policy Renewals and Digital Payments",
              "New Business Underwriting on Common Medical Conditions",
              "Policy Servicing: tools and timeline",
              "Moratorium on Genetic Testing and Insurance",
              "and others",
            ],
          },
        ],
      },
      {
        heading: "3. AIA Health Value Proposition",
        focus: "General skills",
        groups: [
          { heading: "AIA Integrated Healthcare Strategy (IHS)", items: ["Healthcare 101 e-Module*"] },
          { heading: "Agent and customer health proposition", items: ["Health360 Training*", "AIA Health Value Proposition video*"] },
          { heading: "Vitality", items: ["Vitality e-Module*"] },
          { heading: "Handling health objections", items: ["Objections Handling e-Module with Playbook Resource"] },
        ],
      },
      {
        heading: "Ongoing support and engagement",
        focus: "Health and wellness workshops and continuous education",
        groups: [
          { heading: "Health Talk e-Series", items: ["Chronic conditions (hypertension, diabetes, stroke)", "Cancer"] },
          {
            heading: "Life and Legacy Planning e-Series",
            items: ["Advance Care Planning", "Lasting Power of Attorney", "My Legacy @ LifeSG", "Legacy Planning", "CPF Nomination"],
          },
        ],
      },
    ],
  },
  {
    id: "affluent-hnw",
    title: "Affluent and High Net Worth Training and Development Roadmap",
    stage: "experienced",
    tagline: "Penetrate affluent onshore and offshore markets, then certify to the level of personal and private bankers",
    columns: [
      {
        heading: "Onshore",
        groups: [
          { heading: "e-Module", items: ["Platinum Series Product Licensing (essential)"] },
          { heading: "Workshops", items: ["Selling to the HNW (TBC)# (new)", "HNW Sales Concepts I and II"] },
          { heading: "HNW Seminars", items: ["Experts sharing on how to penetrate the HNW market", "HNW financial underwriting"] },
          { heading: "Professional certification*", items: ["Certified Affluent Wealth Advisor (WMI CAWA)"] },
          {
            heading: "Wealth Mastery Programme# (new)",
            items: ["Core Module 1: Investment Portfolio Advisory", "Core Module 2: Sales Strategies for Affluent Advisers", "Core Module 3: AIA Managed Solutions"],
          },
          { heading: "Wealth Accelerator Programme", items: ["Module 2: Family Office and Philanthropy"] },
        ],
      },
      {
        heading: "Offshore",
        groups: [
          { heading: "e-Modules", items: ["Pre-requisite for NFTF Offshore Sales (essential)", "Why AIA"] },
          { heading: "Workshop", items: ["Offshore HNW Selling Workshop"] },
          {
            heading: "HNW Seminars",
            items: ["Experts sharing on offshore topics", "HNW offshore new business underwriting", "Underwriting tips for passers-by"],
          },
          { heading: "Exclusive workshops*", items: ["Offshore DOJO", "Beyond Our Shores with Regional Specialists"] },
          {
            heading: "Wealth Accelerator Programme (new)",
            items: [
              "Module 1A: Wealth Management, Legacy and Tax Planning, Indonesia",
              "Module 1B: Thailand",
              "Module 1C: China",
              "Module 1D: Malaysia",
            ],
          },
        ],
      },
    ],
    footnotes: [
      "* With qualifying criteria set by the HNW team. Priority for CAWA goes to SPWMs and above.",
      "# Joint collaboration with the HNW team, AIA Investment Management, WMI and external tax consultants.",
    ],
  },
  {
    id: "leaders",
    title: "Leaders' Training and Development Roadmap",
    stage: "leaders",
    columns: [
      {
        heading: "Aspiring leaders",
        period: "Month 13 onwards",
        focus: "Core fundamental competencies for effective leadership",
        groups: [
          { heading: "Leader Appointment Workshop (mandatory)", items: ["Roles and responsibilities", "Regulatory knowledge"] },
          { heading: "Build to Lead (essential)", items: ["Mindset transformation", "Recruitment skills"] },
          { heading: "Masters Series (GAMA) (new)", items: ["Masters of Recruiting"] },
        ],
      },
      {
        heading: "New leaders",
        focus: "Agency management skillsets",
        groups: [
          { heading: "Pacesetter (mandatory)", items: ["5 key management levers", "Applying the skills in simulation"] },
          { heading: "Leading From Within: Vision and Mission (new)", items: ["Crafting an agency vision", "Building a team culture"] },
          { heading: "Attract, Engage and Recruit (new)", items: ["Career coaching techniques", "Converting candidates"] },
          { heading: "Coaching 101", items: ["Coaching skills acquisition", "Enhancing team vision and mission"] },
          {
            heading: "1. CIAM Certification",
            items: ["Agency Management Training Course", "Agency Enhancement Series", "Managing Agency Profitability Series"],
          },
          { heading: "2. Masters Series (GAMA) (new)", items: ["Masters of Selection", "Masters of Retention"] },
        ],
      },
      {
        heading: "Experienced leaders",
        focus: "Retaining and growing your agencies",
        groups: [
          { heading: "Peak Performance Coaching (new)", items: ["Intermediate coaching skills", "Enhancing the team's performance"] },
          { heading: "Strategic Thinking (new)", items: ["Agility and innovation", "Sharpening the strategic lens", "Leading with clarity and confidence"] },
          { heading: "Influencing without Authority (new)", items: ["Influential leadership", "Inspire, motivate and empower your team", "Building trust and credibility"] },
          { heading: "3. 5 Levels of Leadership (new)", items: [] },
          { heading: "High Potential List*", items: ["INSEAD (new)", "Executive Coaching (new)"] },
        ],
      },
    ],
    footnotes: ["* With qualifying criteria set by the Leaders team."],
  },
];

export const directory = {
  source: "AIA Learning and Development catalogue, updated 9 Sep 2026",
  notice:
    "AIA internal use only. Do not reproduce, amend or share any part of it with anyone, including policyholders and prospects.",
  legend: {
    mandatory: "Required by law, regulation or company policy to stay authorised.",
    essential: "Role-critical for success, but not legally required.",
  },
  scheduleYear: 2026,
  scheduleNote: SCHEDULE_NOTE,
  scheduleKey: "V = virtual, WV = weekend virtual, F2F = face to face",
  sections,
  courses,
  roadmaps,
};

export type Directory = typeof directory;
