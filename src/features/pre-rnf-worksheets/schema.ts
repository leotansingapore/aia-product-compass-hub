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
      /** When true, learners can add more blank rows beyond `rows`. */
      addRows?: boolean;
    }
  | { kind: "note"; id: string; text: string }
  | { kind: "image"; id: string; label?: string; hint?: string }
  | { kind: "timetable"; id: string }
  | { kind: "eps"; id: string }
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
      }>;
    };

// Tri-state options for "status" checklist items (policy-summary progress etc.).
export const STATUS_OPTIONS = ["Not done", "In progress", "Done"] as const;

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

  { kind: "step", id: "srec", label: "2. My recognition & EPS targets", hint: "Decide what you're gunning for — a production club, Convention, an MDRT level, or a mix. The figures are shown next to each." },
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

  { kind: "step", id: "s2", label: "3. My strengths & areas to grow", hint: "Three of each. Write the honest version — the gaps are the part worth coaching." },
  {
    kind: "table",
    id: "strengths",
    columns: ["Strength", "How it helps me advise well"],
    rows: 3,
    addRows: true,
  },
  {
    kind: "table",
    id: "weaknesses",
    columns: ["Weakness", "How I'll work on it"],
    rows: 3,
    addRows: true,
  },

  { kind: "step", id: "s3", label: "4. My lead generation", hint: "Three markets you can operate in, with the real reason each fits. Tie each back to your Project 200 list." },
  {
    kind: "table",
    id: "markets",
    columns: ["Target market", "Why it fits me (trust, network, demographics)", "How I'll prospect it", "Monthly FYC"],
    rows: 3,
    addRows: true,
  },

  { kind: "step", id: "ssocial", label: "5. My social prospecting & personal brand", hint: "How you'll build a pipeline online — the plan, the content, and the brand people remember you by." },
  { kind: "textarea", id: "social_plan", label: "My social prospecting game plan (which platforms, how often, what's the goal)", rows: 3 },
  { kind: "textarea", id: "social_content", label: "The content I'll create — my 3–4 content pillars / themes", rows: 3 },
  { kind: "textarea", id: "social_brand", label: "My personal brand — who I am, my niche, and the hook people remember", rows: 3 },
  { kind: "textarea", id: "social_cadence", label: "My posting & engagement commitment (posts per week, DMs / comments per day)", rows: 2 },

  { kind: "step", id: "s4", label: "6. My weekly timetable", hint: "Colour-code a typical week hour by hour — prospecting, appointments, preparation, learning, study, me time. Count your prospecting slots: section 1 tells you how many you need." },
  { kind: "timetable", id: "timetable" },

  { kind: "step", id: "s5", label: "7. My warm prospecting system", hint: "This is exactly how you'll reach your warm market. Write it word for word — the way you'd send it and say it — so you're never improvising." },
  { kind: "textarea", id: "warm_outreach", label: "How I'll reach out to my warm market (who first, on what channel, how many a day)", rows: 2 },
  { kind: "textarea", id: "warm_text", label: "My initial text message — word for word", rows: 3 },
  { kind: "textarea", id: "warm_call", label: "My initial call — word for word", rows: 3 },
  { kind: "textarea", id: "call_purpose", label: "My purpose for the call (market survey / setting an appointment)", rows: 2 },
  { kind: "textarea", id: "call_close", label: "How I close — and keep the door open if they say no", rows: 2 },
  { kind: "textarea", id: "call_track", label: "How I'll track every prospect & follow up", rows: 2 },
  {
    kind: "checklist",
    id: "prospect_ready",
    label: "Am I ready to prospect? — a straight self-check",
    items: [
      { id: "project200", text: "Have I built my Project 200?", type: "check" },
      { id: "observed", text: "Have I observed at least 2 appointments of a senior?", type: "check" },
      { id: "visionboard", text: "Have I done my vision board?", type: "check" },
      { id: "roleplays", text: "Have I done my roleplays?", type: "check" },
      { id: "flows_conf", text: "Am I confident of my flows?", type: "scale" },
      { id: "script", text: "Do I have a script for the Risk Management CST and the Wealth Accumulation CST?", type: "check" },
      { id: "slidedeck", text: "Do I have my own slide deck for each CST?", type: "check" },
      { id: "prospect_conf", text: "Am I confident prospecting my warm and cold market?", type: "scale" },
      { id: "policy_summary", text: "Have I done my own policy summary — for myself and 1 other person?", type: "check" },
      { id: "policy_conf", text: "Am I confident building a policy summary?", type: "scale" },
    ],
  },
  { kind: "textarea", id: "stored_cases", label: "Stored cases from my warm market for when I RNF (who · what case · how much)", rows: 3 },

  { kind: "step", id: "s6", label: "8. Sales competency — my first three prospects", hint: "Real people you could call this week. A specific need next to each name." },
  {
    kind: "table",
    id: "prospects",
    columns: ["Name", "Occupation", "How I know them", "What I think they need + the plan"],
    rows: 3,
  },
  {
    kind: "checklist",
    id: "prospect_ps",
    label: "Have I built a policy summary for each of them?",
    items: [
      { id: "p1", text: "Prospect 1 — policy summary", type: "status" },
      { id: "p2", text: "Prospect 2 — policy summary", type: "status" },
      { id: "p3", text: "Prospect 3 — policy summary", type: "status" },
    ],
  },

  { kind: "step", id: "s7", label: "9. My KPIs", hint: "The activity you commit to at each cadence, and the points behind it. For your weekly points target, use the number your Pledge Sheet works out." },
  {
    kind: "table",
    id: "kpi",
    columns: ["", "Daily", "Weekly", "Monthly"],
    rowLabels: ["Activity commitment", "Points target"],
  },
  {
    kind: "note",
    id: "points_ref",
    text: "Points per activity, for reference: Appointment Set = 1 · Opening Interview = 3 · Closing Interview = 4 · Case Closed = 5 · Referral = 1 · Client Servicing = 2.",
  },

  { kind: "step", id: "s8", label: "10. My income goal", hint: "The FYC you're chasing, by when, and the weekly pace it takes (carry this from your Pledge Sheet)." },
  {
    kind: "table",
    id: "income",
    columns: ["Goal (FYC)", "Deadline", "Weekly pace to hit it (cases / activity per week)"],
    rows: 2,
    addRows: true,
  },

  { kind: "step", id: "s9", label: "11. My minimum weekly points target", hint: "The points floor you'll hold yourself to every week, and the stake if you miss it — make it sting." },
  {
    kind: "table",
    id: "stake",
    columns: ["Minimum weekly points", "The stake if I fall short (e.g. $50 to mentor, run 10km)"],
    rows: 1,
  },
  {
    kind: "table",
    id: "support",
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
