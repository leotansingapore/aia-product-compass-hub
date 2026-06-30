import type { WorksheetSlug } from "./worksheets";

// A worksheet is a flat list of blocks. Inputs store their value in a flat
// Record<string,string> keyed by `id` (table cells by `${id}__r{r}c{c}`), so the
// same schema drives both the editable form and the print/PDF view.
export type WorksheetBlock =
  | { kind: "step"; id: string; label: string; hint?: string }
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
    }
  | { kind: "note"; id: string; text: string };

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
  { kind: "step", id: "s1", label: "1. My goals", hint: "Carry the headline numbers from your Pledge Sheet here, then add the life behind them." },
  {
    kind: "table",
    id: "goals",
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

  { kind: "step", id: "s2", label: "2. My strengths & areas to grow", hint: "Three of each. Write the honest version — the gaps are the part worth coaching." },
  {
    kind: "table",
    id: "strengths",
    columns: ["Strength", "How it helps me advise well"],
    rows: 3,
  },
  {
    kind: "table",
    id: "weaknesses",
    columns: ["Weakness", "How I'll work on it"],
    rows: 3,
  },

  { kind: "step", id: "s3", label: "3. My lead generation", hint: "Three markets you can operate in, with the real reason each fits. Tie each back to your Project 200 list." },
  {
    kind: "table",
    id: "markets",
    columns: ["Target market", "Why it fits me (trust, network, demographics)", "How I'll prospect it", "Monthly FYC"],
    rows: 3,
  },
  { kind: "textarea", id: "market_prospecting", label: "For each method — advantages & disadvantages", rows: 3 },

  { kind: "step", id: "s4", label: "4. My weekly timetable", hint: "Block a typical week across prospecting, preparation, me time, learning, and study. Count your prospecting slots — section 1 tells you how many you need." },
  {
    kind: "table",
    id: "timetable",
    columns: ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rowLabels: ["Morning", "Afternoon", "Evening"],
  },

  { kind: "step", id: "s5", label: "5. My calling system", hint: "Write the script the way you'd say it out loud. Read it back — if it sounds like a brochure, rewrite it until it sounds like you." },
  { kind: "textarea", id: "call_intro", label: "How I introduce myself & my new career", rows: 2 },
  { kind: "textarea", id: "call_purpose", label: "My purpose for the call (market survey / setting an appointment)", rows: 2 },
  { kind: "textarea", id: "call_close", label: "How I close — and keep the door open if they say no", rows: 2 },
  { kind: "textarea", id: "call_track", label: "How I'll track every prospect & follow up", rows: 2 },

  { kind: "step", id: "s6", label: "6. Sales competency — my first three prospects", hint: "Real people you could call this week. A specific need next to each name." },
  {
    kind: "table",
    id: "prospects",
    columns: ["Name", "Occupation", "How I know them", "What I think they need + the plan"],
    rows: 3,
  },
  {
    kind: "note",
    id: "n1",
    text: "Nobody runs the plan they first write down. The value is in building it — seeing how much the goal asks of your week, and where the plan is still thin. You're pre-licence, so you can't sell any of this yet, but the plan is what you'll run from the day you can.",
  },
];

export const WORKSHEET_SCHEMAS: Record<WorksheetSlug, WorksheetBlock[]> = {
  "pledge-sheet": PLEDGE,
  "business-plan": BUSINESS_PLAN,
};
