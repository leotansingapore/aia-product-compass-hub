import { useEffect, useState } from "react";
import { signAssignmentFile } from "@/lib/assignmentFileUrl";

/**
 * Resolve a stored assignment-file value (a legacy public URL, a bucket path, or
 * an external link) to a viewable URL. Returns `null` until it resolves so
 * callers can fall back to the raw value: `href={signed ?? stored}`. Re-signs
 * whenever the stored value changes.
 */
export function useSignedAssignmentUrl(stored: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!stored) {
      setUrl(null);
      return;
    }
    signAssignmentFile(stored).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [stored]);

  return url;
}
