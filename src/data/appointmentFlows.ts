/**
 * Canonical appointment flows for FC use.
 *
 * Each flow is a "track" a consultant runs in a real appointment. Pick a track
 * at the opening based on the entry decision, then run the branches.
 *
 * Skeleton seeded from 258 real Fireflies appointments (May 2025–May 2026).
 * Body copy is intentionally short — Leo fills in the canonical script per
 * branch. Cross-link example cases from /case-vault by appending case ids to
 * `exampleCaseIds` on the branch (curated codes like "P1" or real ids like
 * "real-2026-03-14-abc12345").
 */

export type FlowProductCode =
  | "APA"
  | "PWV"
  | "UCC"
  | "GPP"
  | "HSGM"
  | "SPA"
  | "PLP"
  | "CI"
  | "TermLife"
  | "Accident"
  | "Vitality";

export interface FlowBranch {
  /** Stable id used in URL fragments. */
  id: string;
  /** Short branch label e.g. "Foundation stack". */
  label: string;
  /** When to enter this branch — the audience signal / numbers. */
  condition: string;
  /** Recommended product stack (codes for badges). */
  productStack: FlowProductCode[];
  /** One-line receipt pattern the FC should aim to leave the meeting with. */
  receiptPattern: string;
  /** Optional canonical script body (markdown). Leo fills in. */
  body?: string;
  /** Case-Vault case ids that exemplify this branch. */
  exampleCaseIds: string[];
}

export interface AppointmentFlow {
  id: string;
  /** 1-indexed flow number for display. */
  number: number;
  title: string;
  /** Trigger conditions — who this track is for. */
  audienceSignal: string;
  /** The one-line frame the FC uses to open the appointment. */
  anchorFrame: string;
  /** Discovery questions to run before the decision diamond. */
  discoveryQuestions: string[];
  /** The decision branches. */
  branches: FlowBranch[];
  /** Add-ons that apply across branches. */
  addOns: string[];
  /** Approximate count of real appointments matching this flow. */
  realCaseCount: number;
}

export const APPOINTMENT_FLOWS: AppointmentFlow[] = [
  {
    id: "young-coverage-starter",
    number: 1,
    title: "Young Adult — Coverage starter",
    audienceSignal:
      "20s–early 30s, single OR newly married, no/thin existing policies, anchored on protection.",
    anchorFrame:
      "Before we talk wealth, let's get your floor right.",
    discoveryQuestions: [
      "Hospital ward preference (A / B1 / private)",
      "Family CI history",
      "Employer coverage today (yes/no, what level)",
      "Monthly budget for protection (target: 5–8% of take-home)",
      "Vitality eligibility (10% Y1 discount lever)",
    ],
    branches: [
      {
        id: "A-foundation-stack",
        label: "Foundation stack",
        condition: "Has zero personal cover",
        productStack: ["HSGM", "Accident", "TermLife", "CI", "Vitality"],
        receiptPattern:
          "Locked in ~$150–250/mo for hospital + accident + term life ($500K–$1M to age 65), optional standalone early-CI $100–200K.",
        exampleCaseIds: [],
      },
      {
        id: "B-portable-topup",
        label: "Portable top-up",
        condition: "Has employer cover only (no personal)",
        productStack: ["HSGM", "CI", "Accident", "TermLife"],
        receiptPattern:
          "Locked in ~$80–150/mo portable HSGM rider top-up + standalone early-CI $100–200K so cover doesn't disappear when job changes.",
        exampleCaseIds: [],
      },
      {
        id: "C-recurring-ci-fill",
        label: "Recurring CI gap fill",
        condition: "Has CI accelerator only (single-payout)",
        productStack: ["CI", "HSGM"],
        receiptPattern:
          "Added recurring early-CI layer ~$60–120/mo on top of existing accelerator; HSGM upgrade if ward mismatch.",
        exampleCaseIds: [],
      },
    ],
    addOns: [
      "AIA Vitality (10% Y1 premium discount)",
      "Prenatal / newborn rider (if planning family)",
      "Parent accident transfer",
    ],
    realCaseCount: 41,
  },
  {
    id: "young-investment-starter",
    number: 2,
    title: "Young Adult — Investment starter",
    audienceSignal:
      "20s–early 30s, professional, surplus cashflow, asking about wealth / retirement / 'where to start investing'.",
    anchorFrame:
      "You have one asset — time. Let's show you what 10 years of compounding actually does.",
    discoveryQuestions: [
      "Monthly free cashflow (after rent/CPF/expenses)",
      "Retirement target year + dream lifestyle number",
      "Lump sum sitting in bank earning <3%",
      "CPF-OA balance",
      "Existing protection floor in place? (else cross to Flow 1 first)",
    ],
    branches: [
      {
        id: "A-habit-anchor",
        label: "Habit anchor",
        condition: "Tight cashflow (<$500/mo free)",
        productStack: ["APA", "TermLife"],
        receiptPattern:
          "Started APA $200–300/mo, 10-year minimum + $100K term life floor. Re-review in 12 months to scale.",
        exampleCaseIds: [],
      },
      {
        id: "B-full-stack",
        label: "Full stack",
        condition: "Comfortable ($500–1,500/mo free)",
        productStack: ["APA", "CI", "HSGM"],
        receiptPattern:
          "APA $500–1,000/mo (Pro Achiever) + standalone CI $200–300K (BTIR separation) + HSGM if not already in place.",
        exampleCaseIds: [],
      },
      {
        id: "C-twin-engine",
        label: "Twin-engine",
        condition: "Lump sum + monthly available",
        productStack: ["APA", "PWV"],
        receiptPattern:
          "APA $500–1,000/mo for compounding + PWV single-premium for retirement income angle. Or CPF-OA into CPFIS global equity fund.",
        exampleCaseIds: [],
      },
    ],
    addOns: [
      "BTIR fresh-start narrative (separate CI from investment)",
      "Fund tier choice (Pro Achiever sub-funds)",
      "CPF-OA deployment via CPFIS",
    ],
    realCaseCount: 51,
  },
  {
    id: "existing-policy-restructure",
    number: 3,
    title: "Existing Policyholder — Restructure / Review",
    audienceSignal:
      "Has 1+ existing policies; came for review; mentions GE / Pru / Manulife / Income / old AIA portfolio.",
    anchorFrame:
      "Before I recommend anything, let me audit what you have. We're looking for overlap, gaps, and stuck cashflow.",
    discoveryQuestions: [
      "Pull every policy via Singpass / MAS app",
      "Map: premium, coverage, surrender value, maturity year, riders",
      "Identify: (a) gaps  (b) overlaps  (c) underperforming ILPs  (d) cashflow drain",
      "Total premium as % of income (red flag if >15%)",
    ],
    branches: [
      {
        id: "A-play-a-restructure",
        label: "Play A — WL / endowment restructure",
        condition: "Old WL / endowment, no investment exposure",
        productStack: ["APA", "HSGM"],
        receiptPattern:
          "Freed $X/mo from legacy WL → projected $Y at age 65 (vs $Z if kept). Redeploy into APA + new HSGM.",
        exampleCaseIds: [],
      },
      {
        id: "B-play-b-restructure",
        label: "Play B — Hybrid ILP restructure",
        condition: "ILP underperforming (>1.3% mgmt fee)",
        productStack: ["APA"],
        receiptPattern:
          "Fund switch from 1.45% → 1% management fee + top-up monthly contribution = +$200K by age 65 from fee switch alone.",
        exampleCaseIds: [],
      },
      {
        id: "C-ci-recurring",
        label: "CI recurring layer",
        condition: "Single-payout CI only",
        productStack: ["CI"],
        receiptPattern:
          "Added early-CI standalone layer sized to 3–5× annual income on top of existing accelerator.",
        exampleCaseIds: [],
      },
      {
        id: "D-consolidate-decouple",
        label: "Consolidation / decoupling",
        condition: "Premium > 15% of income, or scattered policies",
        productStack: ["HSGM", "TermLife"],
        receiptPattern:
          "Consolidated $X scattered policies; decoupled HSGM from spouse for $Y/yr saving.",
        exampleCaseIds: [],
      },
      {
        id: "E-targeted-topup",
        label: "Targeted top-up",
        condition: "Portfolio is fine — just identified gaps",
        productStack: ["CI", "HSGM", "Accident"],
        receiptPattern:
          "Filled specific gap only ($X/mo). Full review scheduled in 12 months.",
        exampleCaseIds: [],
      },
    ],
    addOns: [
      "Decoupling for HSGM premium efficiency",
      "Parent transfer / child policy carve-out",
      "Pro Achiever fund-tier switch within existing ILP",
    ],
    realCaseCount: 98,
  },
  {
    id: "pre-retiree-income-floor",
    number: 4,
    title: "Pre-Retiree — Retirement income floor",
    audienceSignal:
      "45+, asking about retirement; 'is CPF Life enough?'; spouse retiring soon; lump sum sitting idle.",
    anchorFrame:
      "Let me show you the CPF Life cliff first — then you decide if you want a floor under it.",
    discoveryQuestions: [
      "Target retirement age + monthly income need",
      "CPF balance (OA, SA, RA) + FRS / ERS status",
      "Other liquid assets (property, equities, cash)",
      "Dependants still on payroll",
      "Legacy / bequest priority (yes / no / conditional)",
    ],
    branches: [
      {
        id: "A-apa-to-pwv-bridge",
        label: "APA aggressive → PWV bridge",
        condition: "Still has 10+ years to retire",
        productStack: ["APA", "PWV", "HSGM"],
        receiptPattern:
          "10 yrs APA $X/mo to build pot → convert to PWV income stream at 60–65. HSGM lifelong locked at current health.",
        exampleCaseIds: [],
      },
      {
        id: "B-cpf-vs-pwv",
        label: "CPF top-up vs PWV comparison",
        condition: "CPF FRS not yet hit",
        productStack: ["PWV"],
        receiptPattern:
          "Side-by-side: CPF Life ERS ~$2,770/mo locked (depletes ~81) vs PWV ~$1,300/mo + dividend continuation + bequest. Client chose partial top-up + PWV combo.",
        exampleCaseIds: [],
      },
      {
        id: "C-single-premium-floor",
        label: "Single-premium income floor",
        condition: "FRS done + lump sum available",
        productStack: ["PWV", "SPA"],
        receiptPattern:
          "PWV / SPA lump-sum into dividend-paying tranche. $X lump → $Y/mo for life + legacy of $Z.",
        exampleCaseIds: [],
      },
      {
        id: "D-legacy-floor",
        label: "Legacy floor",
        condition: "Legacy-priority client",
        productStack: ["PWV", "UCC"],
        receiptPattern:
          "PWV bequest emphasis + UCC top-up to lock final coverage. Trust / nomination conversation queued.",
        exampleCaseIds: [],
      },
    ],
    addOns: [
      "HSGM lifelong (lock at current health)",
      "Spouse second-life PWV",
      "CI bridging until retirement",
    ],
    realCaseCount: 53,
  },
  {
    id: "coverage-gap-audit",
    number: 5,
    title: "Coverage Gap Audit (event-triggered)",
    audienceSignal:
      "Came in with a specific fear / event: 'my colleague got CI', 'CI definition tightening', 'we just had a baby', 'my dad was hospitalised'.",
    anchorFrame:
      "Tell me what scared you. We'll fix that gap first, then look at the rest.",
    discoveryQuestions: [
      "What was the trigger event?",
      "Family history connected to the trigger?",
      "Current cover for that specific risk?",
      "Budget tolerance (this is usually a hot lead)",
    ],
    branches: [
      {
        id: "A-standalone-ci",
        label: "Standalone CI",
        condition: "CI tightening / family CI event",
        productStack: ["CI"],
        receiptPattern:
          "Locked CI $100–300K before definition change deadline; sized 3–5× annual income.",
        exampleCaseIds: [],
      },
      {
        id: "B-hsgm-tier-up",
        label: "HSGM tier-up",
        condition: "Hospital admission story",
        productStack: ["HSGM"],
        receiptPattern:
          "Upgraded ward + lifelong rider. Decoupled from spouse if it improves rate.",
        exampleCaseIds: [],
      },
      {
        id: "C-term-or-wl-riders",
        label: "Term / WL with riders",
        condition: "Death / disability event",
        productStack: ["TermLife", "CI"],
        receiptPattern:
          "Income replacement + disability + early-CI riders. Decoupling for mortgage protection.",
        exampleCaseIds: [],
      },
      {
        id: "D-family-floor",
        label: "Family floor package",
        condition: "Newborn / new family member",
        productStack: ["HSGM", "Accident", "TermLife"],
        receiptPattern:
          "Child policy + prenatal/birth rider + HSGM for child locked before age 1 + parent accident transfer.",
        exampleCaseIds: [],
      },
    ],
    addOns: [
      "Decoupling for mortgage protection",
      "Accident top-up for child / parent",
      "Parent transfer to client's policy umbrella",
    ],
    realCaseCount: 15,
  },
];

/** Look up a flow by id. */
export function getFlow(id: string): AppointmentFlow | undefined {
  return APPOINTMENT_FLOWS.find((f) => f.id === id);
}

/** Look up a branch globally — useful when linking from Case Vault. */
export function getFlowBranchByCaseId(caseId: string):
  | { flow: AppointmentFlow; branch: FlowBranch }
  | undefined {
  for (const flow of APPOINTMENT_FLOWS) {
    for (const branch of flow.branches) {
      if (branch.exampleCaseIds.includes(caseId)) {
        return { flow, branch };
      }
    }
  }
  return undefined;
}
