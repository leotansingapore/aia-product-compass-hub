import type { WorksheetSlug } from "./worksheets";

// A worksheet is a flat list of blocks. Inputs store their value in a flat
// Record<string,string> keyed by `id` (table cells by `${id}__r{r}c{c}`), so the
// same schema drives both the editable form and the print/PDF view.
export type WorksheetBlock =
  // `hint` guides the FC while filling the form in-app; `pdfHint` is the
  // reflective keepsake line they read back years later. The PDF shows pdfHint
  // (and nothing if it's absent) instead of the instructional hint.
  | { kind: "step"; id: string; label: string; hint?: string; pdfHint?: string }
  | { kind: "text"; id: string; label: string; hint?: string }
  | { kind: "textarea"; id: string; label: string; hint?: string; rows?: number }
  | {
      kind: "table";
      id: string;
      label?: string;
      columns: string[];
      /** Fixed labels down the first column; its length = number of rows. */
      rowLabels?: string[];
      /** When there are no rowLabels, how many blank rows to render. */
      rows?: number;
      /** When true, learners can add more blank rows beyond `rows`. */
      addRows?: boolean;
      /** Per-column widths for the PDF (e.g. "18%"); stops narrow columns
       *  squeezing headers/names into ugly mid-word breaks. */
      colWidths?: string[];
    }
  | { kind: "note"; id: string; text: string }
  | { kind: "image"; id: string; label?: string; hint?: string }
  /** Auto-populated from an assignment's text submission (editable afterwards). */
  | { kind: "whys"; id: string; label?: string; hint?: string; link: string }
  /** Official-looking closing pledge with a signature + date line. */
  | { kind: "pledge"; id: string; heading: string; text: string }
  | { kind: "timetable"; id: string }
  | { kind: "eps"; id: string }
  | { kind: "links"; id: string; label?: string; links: Array<{ label: string; url: string }> }
  | {
      kind: "objections";
      id: string;
      label?: string;
      hint?: string;
      /** Preset objections the learner can pick per row (plus "Other"). */
      options: string[];
      /** Starting number of rows (they can add more). */
      rows?: number;
    }
  | {
      kind: "checklist";
      id: string;
      label?: string;
      items: Array<{
        id: string;
        text: string;
        type: "check" | "scale" | "status" | "radio";
        /** For "radio" items: only one per group can be selected at a time. */
        group?: string;
        /** Optional link (e.g. to the relevant assignment) shown by the item. */
        link?: string;
      }>;
    };

// Tri-state options for "status" checklist items (policy-summary progress etc.).
export const STATUS_OPTIONS = ["Not done", "In progress", "Done"] as const;

// Common warm-market objections to choose from (plus "Other" and anything from
// the Objections library).
export const OBJECTION_OPTIONS = [
  "ETFs",
  "Stocks",
  "Robo advisors",
  "DIY",
  "Too long lock-in",
  "Not liquid",
  "Not flexible",
  "Fees too high",
  "Using another company",
  "Risk averse",
] as const;

export function cellKey(tableId: string, r: number, c: number): string {
  return `${tableId}__r${r}c${c}`;
}

const PLEDGE: WorksheetBlock[] = [
  { kind: "step", id: "s1", label: "1. Where you want to land", hint: "Start at the destination — the life, not the activity." },
  { kind: "text", id: "income_month", label: "Income I want per month (in 5 years)" },
  { kind: "text", id: "assets", label: "Assets / savings I want accumulated by then" },
  { kind: "text", id: "annual_income", label: "Annual income that implies (monthly × 12 + bonus)" },

  { kind: "step", id: "s2", label: "2. FYC & club target", hint: "Annual income ÷ your income-to-FYC ratio = the FYC you must write. Ask your leader for the current ratio and club / MDRT–COT–TOT thresholds." },
  { kind: "text", id: "fyc_year", label: "FYC I need to write this year" },
  { kind: "text", id: "club_tier", label: "Club tier / award this puts me in" },
  { kind: "text", id: "stretch_tier", label: "Stretch tier I'd be proud of (MDRT / COT / TOT)" },

  { kind: "step", id: "s3", label: "3. Cases & clients", hint: "FYC ÷ average FYC per case = cases per year. Divide by 12 for the monthly pace." },
  {
    kind: "table",
    id: "cases",
    columns: ["Per year", "Target", "Per month", "Target"],
    rowLabels: ["Avg FYC per case", "Cases", "Clients"],
  },

  { kind: "step", id: "s4", label: "4. Weekly activity — your pledge", hint: "This is the number you actually control. Work cases-per-month back to appointments and calls using your own conversion ratios." },
  {
    kind: "table",
    id: "weekly",
    columns: ["My weekly pledge", "How many", "My conversion ratio"],
    rowLabels: [
      "New contacts / calls per week",
      "Appointments held per week",
      "Fact-finds / presentations per week",
      "Cases closed per week",
    ],
  },

  { kind: "step", id: "s5", label: "My pledge" },
  { kind: "text", id: "pledge_appts", label: "Appointments I pledge to hold every week" },
  { kind: "text", id: "pledge_contacts", label: "New contacts I pledge to make every week" },
  { kind: "text", id: "pledge_signed", label: "Signed" },
  { kind: "text", id: "pledge_date", label: "Date" },
];

const BUSINESS_PLAN: WorksheetBlock[] = [
  { kind: "step", id: "svb", label: "My vision board" },
  { kind: "image", id: "vision_board", hint: "This is pulled from your Vision Board assignment — do it there and it appears here and in your exported PDF." },

  { kind: "step", id: "s100w", label: "My 100 Whys" },
  {
    kind: "whys",
    id: "hundred_whys_text",
    link: "/learning-track/pre-rnf/assignments/100-whys",
    hint: "Pulled from your 100 Whys assignment. Not done it yet? Do it and it appears here — you can also edit it here anytime.",
  },

  { kind: "step", id: "s1", label: "1. My goals", hint: "Carry the headline numbers from your Pledge Sheet here, then add the life behind them.", pdfHint: "The life I set out to build — and the numbers I said it would take." },
  {
    kind: "table",
    id: "goals",
    colWidths: ["66%", "34%"],
    columns: ["What I'm aiming at (in 5 years)", "Target"],
    rowLabels: [
      "Income per month",
      "Assets / savings accumulated",
      "FYC per year",
      "Club tier / award",
      "Clients & cases per year",
    ],
  },
  { kind: "textarea", id: "goals_why", label: "What hitting this changes for me and my family", rows: 3 },
  { kind: "textarea", id: "goals_dev", label: "Professional development I want (1–3 years)", rows: 3 },

  { kind: "step", id: "srec", label: "2. My recognition & EPS targets", hint: "Decide what you're gunning for — a production club, Convention, an MDRT level, or a mix. The figures are shown next to each.", pdfHint: "The stages I told myself I'd earn my way onto." },
  {
    kind: "checklist",
    id: "recognition",
    label: "Pick ONE production club to aim for, plus Convention and/or an MDRT level if you're going for them:",
    items: [
      { id: "centurion", text: "Premier Centurion — S$100,000 FYC", type: "radio", group: "club" },
      { id: "diamond", text: "Premier Prestige Diamond — S$80,000 FYC", type: "radio", group: "club" },
      { id: "platinum", text: "Premier Prestige Platinum — S$70,000 FYC", type: "radio", group: "club" },
      { id: "titanium", text: "Premier Prestige Titanium — S$50,000 FYC", type: "radio", group: "club" },
      { id: "gold", text: "Premier Prestige Gold — S$40,000 FYC", type: "radio", group: "club" },
      { id: "silver", text: "Premier Prestige Silver — S$30,000 FYC", type: "radio", group: "club" },
      { id: "convention", text: "Convention (new consultants) — S$138,000 ANP", type: "check" },
      { id: "mdrt", text: "MDRT — S$75,800 (raw FYC ≈ S$55,735, i.e. ÷ 1.36)", type: "radio", group: "mdrt" },
      { id: "cot", text: "COT — S$227,400 (raw FYC ≈ S$167,206)", type: "radio", group: "mdrt" },
      { id: "tot", text: "TOT — S$454,800 (raw FYC ≈ S$334,412)", type: "radio", group: "mdrt" },
    ],
  },
  { kind: "eps", id: "eps" },
  {
    kind: "links",
    id: "eps_calc",
    label: "Work out the FYC you need — and the number and mix of cases to close to hit it — with the Commission Calculator:",
    links: [{ label: "Commission Calculator", url: "https://present.financeillustrator.com/commission-calculator" }],
  },

  { kind: "step", id: "s2", label: "3. My strengths & areas to grow", hint: "Three of each. Write the honest version — the gaps are the part worth coaching.", pdfHint: "Who I was at the start — the edges I leaned on, and the gaps I chose to close." },
  {
    kind: "table",
    id: "strengths",
    colWidths: ["28%", "72%"],
    columns: ["Strength", "How it helps me advise well"],
    rows: 3,
    addRows: true,
  },
  {
    kind: "table",
    id: "weaknesses",
    colWidths: ["28%", "72%"],
    columns: ["Weakness", "How I'll work on it"],
    rows: 3,
    addRows: true,
  },

  { kind: "step", id: "s3", label: "4. My lead generation", hint: "Three markets you can operate in, with the real reason each fits. Tie each back to your Project 200 list.", pdfHint: "The markets I backed myself to win." },
  {
    kind: "table",
    id: "markets",
    colWidths: ["16%", "38%", "31%", "15%"],
    columns: ["Target market", "Why it fits me (trust, network, demographics)", "How I'll prospect it", "Monthly FYC"],
    rows: 3,
    addRows: true,
  },

  { kind: "step", id: "ssocial", label: "5. My social prospecting & personal brand", hint: "How you'll build a pipeline online — the plan, the content, and the brand people remember you by.", pdfHint: "The name I set out to build, and how I wanted to be remembered." },
  {
    kind: "links",
    id: "social_refs",
    links: [{ label: "Content Studio — generate your content", url: "https://content-studio-beige-eta.vercel.app/generate" }],
  },
  { kind: "textarea", id: "social_plan", label: "My social prospecting game plan (which platforms, how often, what's the goal)", rows: 3 },
  { kind: "textarea", id: "social_content", label: "The content I'll create — my 3–4 content pillars / themes", rows: 3 },
  { kind: "textarea", id: "social_brand", label: "My personal brand — who I am, my niche, and the hook people remember", rows: 3 },
  { kind: "textarea", id: "social_cadence", label: "My posting & engagement commitment (posts per week, DMs / comments per day)", rows: 2 },

  { kind: "step", id: "s4", label: "6. My weekly timetable", hint: "Colour-code a typical week hour by hour — prospecting, appointments, preparation, learning, study, me time. Count your prospecting slots: section 1 tells you how many you need.", pdfHint: "The week I committed to living — every hour spoken for." },
  { kind: "timetable", id: "timetable" },

  { kind: "step", id: "s5", label: "7. My warm prospecting system", hint: "This is exactly how you'll reach your warm market. Write it word for word — the way you'd send it and say it — so you're never improvising.", pdfHint: "The exact words I promised I'd use, so I'd never lose my nerve." },
  {
    kind: "links",
    id: "warm_refs",
    label: "Reference these for your outreach",
    links: [
      { label: "Warm-market scripts", url: "/scripts?audience=warm-market" },
      { label: "Warm-market objection handling", url: "/objections?audience=warm-market" },
    ],
  },
  { kind: "textarea", id: "warm_outreach", label: "How I'll reach out to my warm market (who first, on what channel, how many a day)", rows: 2 },
  { kind: "textarea", id: "warm_text", label: "My initial text message — word for word", rows: 3 },
  { kind: "textarea", id: "warm_call", label: "My initial call — word for word", rows: 3 },
  { kind: "textarea", id: "call_purpose", label: "My purpose for the call (market survey / setting an appointment)", rows: 2 },
  { kind: "textarea", id: "call_track", label: "How I'll track every prospect & follow up", rows: 2 },
  {
    kind: "objections",
    id: "objections",
    label: "Objection handling — what objections have you met, or do you foresee, and how will you handle them?",
    hint: "Handle at least 5. Pick an objection (or the Objections library above) and write how you'll respond, row by row.",
    options: [...OBJECTION_OPTIONS],
    rows: 5,
  },
  {
    kind: "checklist",
    id: "prospect_ready",
    label: "Am I ready to prospect? — a straight self-check",
    items: [
      { id: "project200", text: "Have I built my Project 200?", type: "check", link: "/learning-track/pre-rnf/assignments/project-200" },
      { id: "observed", text: "Have I observed at least 2 appointments of a senior?", type: "check", link: "/learning-track/pre-rnf/assignments/field-observation" },
      { id: "roleplays", text: "Have I done my roleplays?", type: "check", link: "/learning-track/pre-rnf/assignments/cst-roleplay" },
      { id: "flows_conf", text: "Am I confident of my appointment flows?", type: "scale" },
      { id: "script", text: "Do I have a script for the Risk Management CST and the Wealth Accumulation CST?", type: "check" },
      { id: "call_script", text: "Do I have my cold calling / warm calling script ready?", type: "check" },
      { id: "slidedeck", text: "Do I have my own slide deck for each CST?", type: "check" },
      { id: "prospect_conf", text: "Am I confident prospecting my warm and cold market?", type: "scale" },
      { id: "cold_call_conf", text: "How confident am I to start cold calling?", type: "scale" },
      { id: "policy_summary", text: "Have I done my own policy summary — for myself and 1 other person?", type: "check", link: "/learning-track/pre-rnf/assignments/policy-summary" },
      { id: "policy_conf", text: "Am I confident building a policy summary?", type: "scale" },
    ],
  },
  { kind: "textarea", id: "stored_cases", label: "Stored cases from my warm market for when I RNF (who · what case · how much)", rows: 3 },

  { kind: "step", id: "s6", label: "8. Sales competency — my first three prospects", hint: "Real people you could call this week. A specific need next to each name.", pdfHint: "The first people I believed I could help." },
  {
    kind: "table",
    id: "prospects",
    colWidths: ["17%", "15%", "16%", "52%"],
    columns: ["Name", "Occupation", "How I know them", "What I think they need + the plan"],
    rows: 3,
  },
  {
    kind: "checklist",
    id: "prospect_ps",
    label: "Have I built a policy summary for each of them?",
    items: [
      { id: "p1", text: "Prospect 1 — policy summary", type: "status", link: "/learning-track/pre-rnf/assignments/policy-summary" },
      { id: "p2", text: "Prospect 2 — policy summary", type: "status", link: "/learning-track/pre-rnf/assignments/policy-summary" },
      { id: "p3", text: "Prospect 3 — policy summary", type: "status", link: "/learning-track/pre-rnf/assignments/policy-summary" },
    ],
  },

  { kind: "step", id: "s7", label: "9. My KPIs", hint: "The activity you commit to at each cadence, and the points behind it. For your weekly points target, use the number your Pledge Sheet works out.", pdfHint: "The activity I pledged to, at every cadence." },
  {
    kind: "table",
    id: "kpi",
    colWidths: ["28%", "24%", "24%", "24%"],
    columns: ["", "Daily", "Weekly", "Monthly"],
    rowLabels: ["Activity commitment", "Points target"],
  },
  {
    kind: "note",
    id: "points_ref",
    text: "Points per activity, for reference: Appointment Set = 1 · Opening Interview = 3 · Closing Interview = 4 · Case Closed = 5 · Referral = 1 · Client Servicing = 2.",
  },

  { kind: "step", id: "s8", label: "10. My income goal", hint: "The FYC you're chasing, by when, and the weekly pace it takes (carry this from your Pledge Sheet).", pdfHint: "The number I was chasing, and the pace I swore to keep." },
  {
    kind: "table",
    id: "income",
    colWidths: ["20%", "18%", "62%"],
    columns: ["Goal (FYC)", "Deadline", "Weekly pace to hit it (cases / activity per week)"],
    rows: 2,
    addRows: true,
  },
  {
    kind: "links",
    id: "income_calc",
    label: "Break your target income into layers with the Income Calculator:",
    links: [{ label: "Income Calculator", url: "https://present.financeillustrator.com/income-calculator/income-layers/detailed" }],
  },

  { kind: "step", id: "s9", label: "11. My minimum weekly points target", hint: "The points floor you'll hold yourself to every week, and the stake if you miss it — make it sting.", pdfHint: "The floor I refused to drop below — and what it would cost me to miss it." },
  {
    kind: "table",
    id: "stake",
    colWidths: ["30%", "70%"],
    columns: ["Minimum weekly points", "The stake if I fall short (e.g. $50 to mentor, run 10km)"],
    rows: 1,
  },
  {
    kind: "table",
    id: "support",
    colWidths: ["50%", "50%"],
    columns: ["My pacer (who I'll race)", "My mentor (who holds me to it)"],
    rows: 1,
  },
  {
    kind: "checklist",
    id: "commit",
    items: [
      { id: "timetable", text: "I commit to adhere to my weekly timetable", type: "check" },
      { id: "target", text: "I commit to hit the minimum weekly points target I've set", type: "check" },
    ],
  },

  { kind: "step", id: "smotto", label: "My motto to live by" },
  {
    kind: "textarea",
    id: "motto",
    label: "My personal motto, vision, or favourite quote — the words I run on",
    hint: "In your own words: the belief, motto, or quote that keeps you going when the week gets hard.",
    rows: 3,
  },

  {
    kind: "note",
    id: "n1",
    text: "Nobody runs the plan they first write down. The value was in building it — seeing how much my goal asks of my week, and where my plan is still thin. I'm pre-licence, so I can't sell any of this yet — but this is the plan I'll run from the day I can.",
  },

  {
    kind: "pledge",
    id: "final_pledge",
    heading: "My Pledge",
    text: "have written this plan with my own hand, and I own it. I commit to run my week to the activity I have pledged, to hold my minimum weekly points target, and to answer to my mentor for every one of them. I know the future I mapped out here is not given to me — it is earned, week by week, by the work I put in before I can sell a thing. I will not let a good week fool me or a bad week stop me. From today, this is the standard I hold myself to. This is my word, and I am signing for it.",
  },
];

export const WORKSHEET_SCHEMAS: Record<WorksheetSlug, WorksheetBlock[]> = {
  "pledge-sheet": PLEDGE,
  "business-plan": BUSINESS_PLAN,
};
