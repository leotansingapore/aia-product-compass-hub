import { supabase } from "@/integrations/supabase/client";

const FLAG_KEY = "lt-migration-complete";
const PROGRESS_KEYS = ["learning-track-progress", "learning-track-assignments"];
const SUBMISSIONS_KEY = "learning-track-assignment-submissions";

interface LegacyProgressEntry {
  completed?: boolean;
  completedAt?: string;
}

interface LegacyFile {
  type: string;
  url?: string;
  text?: string;
  label?: string;
}

interface LegacySubmission {
  remarks?: string;
  files?: LegacyFile[];
}

/**
 * One-time migration of legacy localStorage learning-track state into Supabase.
 * Idempotent — sets a flag on success and clears legacy keys.
 */
export async function migrateLocalProgress(userId: string): Promise<void> {
  if (localStorage.getItem(FLAG_KEY) === "1") return;

  try {
    await _doMigrate(userId);
  } catch (err) {
    // If migration fails (e.g. FK constraint), mark it done so we stop retrying
    console.warn("Learning track migration failed, skipping future attempts:", err);
  }
  // Always mark complete to prevent retries on every page load
  localStorage.setItem(FLAG_KEY, "1");
}

async function _doMigrate(userId: string): Promise<void> {

  const localProgress: Record<string, LegacyProgressEntry> = {};
  for (const key of PROGRESS_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      Object.assign(localProgress, JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }

  const completedLegacyIds = Object.entries(localProgress)
    .filter(([, v]) => v?.completed)
    .map(([id]) => id);

  if (completedLegacyIds.length > 0) {
    const { data: items, error } = await supabase
      .from("learning_track_items")
      .select("id, legacy_id")
      .in("legacy_id", completedLegacyIds);
    if (error) throw error;

    const rows = (items ?? []).map((row: any) => ({
      user_id: userId,
      item_id: row.id,
      status: "completed" as const,
      completed_at:
        localProgress[row.legacy_id as string]?.completedAt ?? new Date().toISOString(),
    }));
    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from("learning_track_progress")
        .upsert(rows, { onConflict: "user_id,item_id" });
      if (upsertErr) throw upsertErr;
    }
  }

  // Submissions: only url/loom/text types — files were never actually uploaded
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (raw) {
      const local: Record<string, LegacySubmission> = JSON.parse(raw);
      const legacyIds = Object.keys(local);
      if (legacyIds.length > 0) {
        const { data: items } = await supabase
          .from("learning_track_items")
          .select("id, legacy_id")
          .in("legacy_id", legacyIds);
        const idMap = new Map(
          (items ?? []).map((i: any) => [i.legacy_id as string, i.id as string])
        );
        for (const [legacyId, payload] of Object.entries(local)) {
          const itemId = idMap.get(legacyId);
          if (!itemId) continue;
          const { data: subRow, error: subErr } = await supabase
            .from("learning_track_submissions")
            .upsert(
              {
                user_id: userId,
                item_id: itemId,
                remarks: payload.remarks ?? null,
                review_status: "pending",
              },
              { onConflict: "user_id,item_id" }
            )
            .select("id")
            .single();
          if (subErr || !subRow) continue;
          for (const f of payload.files ?? []) {
            if (f.type === "url" || f.type === "loom") {
              await supabase.from("learning_track_submission_files").insert({
                submission_id: subRow.id,
                file_type: f.type,
                external_url: f.url ?? null,
                label: f.label ?? null,
              });
            } else if (f.type === "text") {
              await supabase.from("learning_track_submission_files").insert({
                submission_id: subRow.id,
                file_type: "text",
                content_text: f.text ?? null,
                label: f.label ?? null,
              });
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  PROGRESS_KEYS.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(SUBMISSIONS_KEY);
}
