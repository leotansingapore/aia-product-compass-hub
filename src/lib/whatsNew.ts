// The "What's new" lines under the new-version prompt. They come from the
// changelog board, whose entries are already written for customers, so nothing
// here decides what is worth telling someone - only which recent ones lead.

export type ChangeType = "new" | "improved" | "fixed" | "removed";

export interface RecentChange {
  id: string;
  slug: string | null;
  date: string;
  type: ChangeType;
  title: string;
}

/** The board's changelog tab. */
export const CHANGELOG_PATH = "/roadmap?tab=changelog";

const WINDOW_DAYS = 7;
const MAX_LINES = 4;
// New things first: a person refreshing cares most about what they can now do.
const TYPE_ORDER: Record<ChangeType, number> = { new: 0, improved: 1, fixed: 2, removed: 3 };

export function pickRecentChanges(items: RecentChange[], now = Date.now()): RecentChange[] {
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return items
    .filter((e) => e.title?.trim() && Date.parse(e.date) >= cutoff)
    .sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9) || Date.parse(b.date) - Date.parse(a.date))
    .slice(0, MAX_LINES);
}

/** Never throws and never waits long: the prompt still shows with no lines. */
export async function fetchRecentChanges(fetchImpl: typeof fetch = fetch, timeoutMs = 4000): Promise<RecentChange[]> {
  try {
    // Loaded only once an update is found: the config module pulls in the whole board.
    const { FEEDBACK_API, FEEDBACK_BOARD_KEY } = await import("@/components/feedback/config");
    const res = await fetchImpl(`${FEEDBACK_API}/changelog?limit=20`, {
      headers: { "X-Board-Key": FEEDBACK_BOARD_KEY },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: RecentChange[] };
    return pickRecentChanges(data.items ?? []);
  } catch {
    return [];
  }
}
