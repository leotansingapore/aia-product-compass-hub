import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadAllAssignments, type Assignment } from "@/features/first-60-days/assignments";

const PRODUCT_ID = "first-60-days-assignments";

export type TrackerColumn = {
  statusKey: string;
  order: number;
  title: string;
  short: string;
  urlSlug: string;
};

export type TrackerUser = {
  userId: string;
  name: string;
  /** item_id (status_key) -> earliest submitted_at ISO for that assignment. */
  completedAt: Record<string, string | null>;
  completedCount: number;
};

export type AssignmentTracker = {
  columns: TrackerColumn[];
  users: TrackerUser[];
  /** statusKey -> how many distinct learners have submitted it. */
  perColumnCount: Record<string, number>;
};

async function resolveNames(ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  if (!ids.length) return names;
  const { data } = await (supabase.rpc as any)("get_cohort_display_names", {
    p_user_ids: ids,
  });
  if (Array.isArray(data)) {
    for (const n of data) {
      const nm = (n?.display_name ?? "").trim();
      if (nm) names[n.user_id] = nm;
    }
  }
  return names;
}

/**
 * Admin-only completion matrix for the Pre-RNF assignments: every learner who
 * has submitted at least one assignment, and which ones they've cleared.
 *
 * Reads `assignment_submissions` directly — the `assignment_submissions_admin_select`
 * RLS policy lets admins see every row, so a non-admin caller would only ever get
 * their own submissions back (the hook is gated to admins at the call site).
 */
async function fetchTracker(): Promise<AssignmentTracker> {
  const assignments = await loadAllAssignments();
  const columns: TrackerColumn[] = assignments
    .slice()
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order)
    .map((a: Assignment) => ({
      statusKey: a.frontmatter.status_key,
      order: a.frontmatter.order,
      title: a.frontmatter.title,
      short: a.frontmatter.short,
      urlSlug: a.frontmatter.url_slug ?? a.slug,
    }));
  const validKeys = new Set(columns.map((c) => c.statusKey));

  const { data, error } = await (supabase.from as any)("assignment_submissions")
    .select("user_id, item_id, submitted_at")
    .eq("product_id", PRODUCT_ID)
    .order("submitted_at", { ascending: true })
    .limit(5000);
  if (error) throw error;

  type Row = { user_id: string; item_id: string; submitted_at: string | null };
  const rows = ((data ?? []) as Row[]).filter((r) => validKeys.has(r.item_id));

  const byUser = new Map<string, Record<string, string | null>>();
  for (const r of rows) {
    const map = byUser.get(r.user_id) ?? {};
    // Rows arrive oldest-first, so the first time we see an item_id is its
    // earliest submission — keep that and ignore later resubmissions.
    if (!(r.item_id in map)) map[r.item_id] = r.submitted_at;
    byUser.set(r.user_id, map);
  }

  const names = await resolveNames(Array.from(byUser.keys()));

  const users: TrackerUser[] = Array.from(byUser.entries()).map(([userId, completedAt]) => ({
    userId,
    name: names[userId] ?? `${userId.slice(0, 8)}…`,
    completedAt,
    completedCount: Object.keys(completedAt).length,
  }));
  // Most-complete first; ties broken by name so the order is stable.
  users.sort((a, b) => b.completedCount - a.completedCount || a.name.localeCompare(b.name));

  const perColumnCount: Record<string, number> = {};
  for (const c of columns) {
    perColumnCount[c.statusKey] = users.reduce(
      (n, u) => n + (u.completedAt[c.statusKey] !== undefined ? 1 : 0),
      0,
    );
  }

  return { columns, users, perColumnCount };
}

export function useAssignmentTracker(enabled: boolean) {
  return useQuery({
    queryKey: ["assignment-tracker"],
    queryFn: fetchTracker,
    enabled,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}
