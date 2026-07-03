import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAllRows";

// In-progress assignment answers, saved to the learner's account so nothing is
// lost across refresh / logout / device — and so admins can see work that has
// not been submitted yet. Stored in `assignment_submissions` under a DEDICATED
// product_id, completely separate from the graded submission rows (which live
// under `first-60-days-assignments`), so a draft never fires a submit
// notification, counts toward completion, or shows in the cohort gallery. One
// row per (user, assignment) — emulated upsert via "load latest, update by id".
export const ASSIGNMENT_DRAFT_PRODUCT_ID = "first-60-days-assignments-draft";

// Mirrors the learner form's shape: `t` = free-text answer, `f` = form fields
// keyed by label.
export type AssignmentDraftBlob = { t?: string; f?: Record<string, string> };

export function draftHasContent(b: AssignmentDraftBlob | null | undefined): boolean {
  if (!b) return false;
  if (b.t && b.t.trim().length > 0) return true;
  return Object.values(b.f ?? {}).some((v) => typeof v === "string" && v.trim().length > 0);
}

function parseBlob(text: string | null): AssignmentDraftBlob | null {
  if (!text) return null;
  try {
    const o = JSON.parse(text);
    if (o && typeof o === "object" && !Array.isArray(o)) {
      const f: Record<string, string> = {};
      if (o.f && typeof o.f === "object" && !Array.isArray(o.f)) {
        for (const [k, v] of Object.entries(o.f)) if (typeof v === "string") f[k] = v;
      }
      return { t: typeof o.t === "string" ? o.t : "", f };
    }
  } catch {
    /* not JSON — ignore */
  }
  return null;
}

export async function loadAssignmentDraft(
  userId: string,
  statusKey: string,
): Promise<{ id: string; blob: AssignmentDraftBlob } | null> {
  const { data, error } = await (supabase.from as any)("assignment_submissions")
    .select("id, submission_text, submitted_at")
    .eq("product_id", ASSIGNMENT_DRAFT_PRODUCT_ID)
    .eq("item_id", statusKey)
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = (data ?? [])[0];
  if (!row) return null;
  return { id: row.id, blob: parseBlob(row.submission_text) ?? {} };
}

export async function saveAssignmentDraft(
  userId: string,
  statusKey: string,
  blob: AssignmentDraftBlob,
  existingId: string | null,
): Promise<string> {
  const submission_text = JSON.stringify(blob);
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
      product_id: ASSIGNMENT_DRAFT_PRODUCT_ID,
      item_id: statusKey,
      submission_text,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteAssignmentDraft(userId: string, statusKey: string): Promise<void> {
  const { error } = await (supabase.from as any)("assignment_submissions")
    .delete()
    .eq("product_id", ASSIGNMENT_DRAFT_PRODUCT_ID)
    .eq("item_id", statusKey)
    .eq("user_id", userId);
  if (error) throw error;
}

export type AssignmentDraftRow = {
  userId: string;
  statusKey: string;
  blob: AssignmentDraftBlob;
  updatedAt: string | null;
};

/**
 * Admin roll-up: the latest in-progress draft per (user, assignment) across
 * everyone. Relies on the `assignment_submissions` admin-select RLS policy, so a
 * non-admin caller only ever gets their own drafts back. Empty drafts are
 * dropped so a stale zero-content row never shows as "in progress".
 */
export async function loadAllAssignmentDrafts(): Promise<AssignmentDraftRow[]> {
  const data = await fetchAllRows<{
    user_id: string;
    item_id: string;
    submission_text: string | null;
    submitted_at: string | null;
  }>((from, to) =>
    (supabase.from as any)("assignment_submissions")
      .select("user_id, item_id, submission_text, submitted_at")
      .eq("product_id", ASSIGNMENT_DRAFT_PRODUCT_ID)
      .order("submitted_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to),
  );
  const seen = new Set<string>();
  const out: AssignmentDraftRow[] = [];
  for (const r of data) {
    const key = `${r.user_id}:${r.item_id}`;
    if (seen.has(key)) continue; // newest row already taken (ordered desc)
    seen.add(key);
    const blob = parseBlob(r.submission_text);
    if (!draftHasContent(blob)) continue;
    out.push({ userId: r.user_id, statusKey: r.item_id, blob: blob!, updatedAt: r.submitted_at });
  }
  return out;
}
