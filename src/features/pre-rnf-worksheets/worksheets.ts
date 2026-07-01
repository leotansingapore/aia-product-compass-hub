import { supabase } from "@/integrations/supabase/client";

// The in-app fillable versions of the Business Plan deliverables. They are the
// "second option" alongside the official downloadable PDFs: a learner fills them
// in here, saves, and can re-open or export them later. They persist as rows in
// `assignment_submissions` under a dedicated product_id so they ride the table's
// existing RLS — owners read their own, admins read everyone's — with no new
// migration. They are kept on a SEPARATE product_id from the graded
// `first-60-days-assignments` submissions so they never count toward assignment
// completion or the leaderboard.
export const WORKSHEET_PRODUCT_ID = "pre-rnf-worksheets";

export type WorksheetSlug = "pledge-sheet" | "business-plan";

export type WorksheetMeta = {
  slug: WorksheetSlug;
  title: string;
  short: string;
};

export const WORKSHEETS: Record<WorksheetSlug, WorksheetMeta> = {
  "pledge-sheet": {
    slug: "pledge-sheet",
    title: "My Pledge Sheet",
    short:
      "Set your FYC goal and the calculator works it back to the cases, appointments, and weekly activity you pledge.",
  },
  "business-plan": {
    slug: "business-plan",
    title: "Business Plan — Your First Five Years",
    short:
      "Your plan: goals, strengths, lead generation, weekly timetable, calling system, first three prospects, KPIs, income goal, and the accountability stakes you'll hold yourself to.",
  },
};

export const WORKSHEET_SLUGS = Object.keys(WORKSHEETS) as WorksheetSlug[];

export function isWorksheetSlug(s: string | undefined): s is WorksheetSlug {
  return !!s && (WORKSHEET_SLUGS as string[]).includes(s);
}

export type WorksheetValues = Record<string, string>;

export type WorksheetRecord = {
  id: string;
  values: WorksheetValues;
  updatedAt: string | null;
};

function parseValues(text: string | null): WorksheetValues {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]),
      );
    }
  } catch {
    /* not JSON — ignore */
  }
  return {};
}

/** Latest saved copy of one worksheet for one user (newest row wins). */
export async function loadWorksheet(
  userId: string,
  slug: WorksheetSlug,
): Promise<WorksheetRecord | null> {
  const { data, error } = await (supabase.from as any)("assignment_submissions")
    .select("id, submission_text, submitted_at")
    .eq("product_id", WORKSHEET_PRODUCT_ID)
    .eq("item_id", slug)
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = (data ?? [])[0];
  if (!row) return null;
  return { id: row.id, values: parseValues(row.submission_text), updatedAt: row.submitted_at };
}

/** Insert or update the user's single saved copy of a worksheet. */
export async function saveWorksheet(
  userId: string,
  slug: WorksheetSlug,
  values: WorksheetValues,
  existingId: string | null,
): Promise<string> {
  const submission_text = JSON.stringify(values);
  if (existingId) {
    const { error } = await (supabase.from as any)("assignment_submissions")
      .update({ submission_text, submitted_at: new Date().toISOString() })
      .eq("id", existingId);
    if (error) throw error;
    return existingId;
  }
  const { data, error } = await (supabase.from as any)("assignment_submissions")
    .insert({
      user_id: userId,
      product_id: WORKSHEET_PRODUCT_ID,
      item_id: slug,
      submission_text,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export type WorksheetSummaryRow = {
  userId: string;
  slug: WorksheetSlug;
  updatedAt: string | null;
  filledCount: number;
};

/**
 * Admin roll-up: the latest saved worksheet per (user, slug) across everyone.
 * Relies on the `assignment_submissions` admin-select RLS policy, so a non-admin
 * caller only ever sees their own rows.
 */
export async function loadAllWorksheets(): Promise<WorksheetSummaryRow[]> {
  const { data, error } = await (supabase.from as any)("assignment_submissions")
    .select("user_id, item_id, submission_text, submitted_at")
    .eq("product_id", WORKSHEET_PRODUCT_ID)
    .order("submitted_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  const seen = new Set<string>();
  const out: WorksheetSummaryRow[] = [];
  for (const r of (data ?? []) as Array<{
    user_id: string;
    item_id: string;
    submission_text: string | null;
    submitted_at: string | null;
  }>) {
    if (!isWorksheetSlug(r.item_id)) continue;
    const key = `${r.user_id}:${r.item_id}`;
    if (seen.has(key)) continue; // newest row already taken (ordered desc)
    seen.add(key);
    const values = parseValues(r.submission_text);
    out.push({
      userId: r.user_id,
      slug: r.item_id,
      updatedAt: r.submitted_at,
      filledCount: Object.values(values).filter((v) => v.trim().length > 0).length,
    });
  }
  return out;
}

/** Admin / read-only: one specific user's saved worksheet. */
export async function loadWorksheetFor(
  userId: string,
  slug: WorksheetSlug,
): Promise<WorksheetRecord | null> {
  return loadWorksheet(userId, slug);
}
