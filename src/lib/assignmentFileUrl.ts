import { supabase } from "@/integrations/supabase/client";

/**
 * The `assignment-files` bucket is PRIVATE — objects can only be reached through
 * short-lived signed URLs, not the permanent public URL that older rows store in
 * `assignment_submissions.file_url`. These helpers turn whatever is stored (a
 * legacy public URL, or an external link a learner pasted) into something safe
 * to render.
 */

const BUCKET = "assignment-files";
const MARKER = `/${BUCKET}/`;
const DEFAULT_TTL_SEC = 3600;

/** Pull the in-bucket object path out of a stored value that may be a full
 *  public URL (`…/object/public/assignment-files/<path>`) or already a path. */
export function assignmentStoragePath(stored: string): string {
  const i = stored.indexOf(MARKER);
  if (i === -1) return stored.replace(/^\/+/, "");
  return stored.slice(i + MARKER.length).split("?")[0];
}

/**
 * Resolve a stored value to a viewable URL. Bucket objects are signed for
 * temporary access; anything that isn't one of our objects (e.g. a pasted
 * Lark/Drive link) passes through untouched. Falls back to the original string
 * if signing fails, so a link is never worse off than before.
 */
export async function signAssignmentFile(
  stored: string | null | undefined,
  ttlSec = DEFAULT_TTL_SEC,
): Promise<string | null> {
  if (!stored) return null;
  if (!stored.includes(MARKER)) return stored; // external link — leave as-is
  const path = assignmentStoragePath(stored);
  if (!path) return stored;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, ttlSec);
  if (error || !data?.signedUrl) return stored;
  return data.signedUrl;
}
