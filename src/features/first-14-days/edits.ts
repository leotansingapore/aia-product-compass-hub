// Admin edits to a day's lesson text live in first_14_days_day_edits, newest
// first. A row with markdown null sends the day back to its lesson file.

export type DayEdit = {
  id: number;
  markdown: string | null;
  base_hash: string;
  created_at: string;
};

export const MAX_EDIT_CHARS = 200000;

// shortcut: FNV-1a 32-bit only has to notice that a lesson file changed, it is
// not a security hash; switch to SHA-256 if it ever guards anything.
export function hashSource(source: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < source.length; i++) {
    h ^= source.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** The lesson text the page shows: the newest edit, else the lesson file. */
export function shownSource(edits: DayEdit[], fileSource: string): string {
  return edits[0]?.markdown ?? fileSource;
}

/** True when the newest edit was made against a lesson file that has since changed in code. */
export function fileChangedSinceEdit(edits: DayEdit[], fileSource: string): boolean {
  const latest = edits[0];
  return Boolean(latest && latest.markdown !== null && latest.base_hash !== hashSource(fileSource));
}
