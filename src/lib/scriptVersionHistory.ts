import { supabase } from "@/integrations/supabase/client";
import type { ScriptVersion } from "@/hooks/useScripts";

/**
 * Shared write path for `scripts.versions`.
 *
 * Every edit of a script's official versions must first snapshot the versions
 * that are being replaced into `script_version_history` — that table is what
 * powers the admin "Version History" panel and its Rollback button. Only the
 * playbook editor and one inline path used to do this, so edits made from the
 * script editor dialog, the servicing page, the fundamentals course and the
 * merge flow overwrote content with no way back.
 *
 * The snapshot is best-effort: history is a safety net, so a failure to record
 * it is logged but never blocks (or fails) the actual save.
 */

export interface VersionHistoryUser {
  id: string;
  email?: string | null;
  user_metadata?: { display_name?: string | null } | null;
}

function editorNameOf(user: VersionHistoryUser): string {
  return user.user_metadata?.display_name || user.email?.split("@")[0] || "Unknown";
}

/** Record the versions a script currently has, before they get overwritten. */
export async function recordScriptVersionSnapshot(args: {
  scriptId: string;
  /** The versions as they are RIGHT NOW (i.e. the ones about to be replaced). */
  currentVersions: ScriptVersion[] | undefined;
  user: VersionHistoryUser | null | undefined;
}): Promise<void> {
  const { scriptId, currentVersions, user } = args;
  if (!user || !Array.isArray(currentVersions) || currentVersions.length === 0) return;
  try {
    const { error } = await supabase
      .from("script_version_history" as any)
      .insert({
        script_id: scriptId,
        versions: JSON.parse(JSON.stringify(currentVersions)),
        edited_by: user.id,
        editor_name: editorNameOf(user),
      } as any);
    if (error) throw error;
  } catch (e) {
    console.error("Failed to save version history:", e);
  }
}

/** Snapshot the previous versions, then write the new ones. */
export async function saveScriptVersions(args: {
  scriptId: string;
  versions: ScriptVersion[];
  currentVersions: ScriptVersion[] | undefined;
  user: VersionHistoryUser | null | undefined;
  updateScript: (id: string, updates: { versions: ScriptVersion[] }) => Promise<unknown>;
}): Promise<void> {
  const { scriptId, versions, currentVersions, user, updateScript } = args;
  await recordScriptVersionSnapshot({ scriptId, currentVersions, user });
  await updateScript(scriptId, { versions });
}
