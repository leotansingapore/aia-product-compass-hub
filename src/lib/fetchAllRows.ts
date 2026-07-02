const PAGE_SIZE = 1000;

/**
 * Pages through a Supabase select that may exceed the server's 1,000-row
 * response cap. PostgREST silently truncates any request — even
 * `.range(0, 9999)` — to `max-rows` (1,000 here), which is how the
 * question-bank list showed "Study (0)" for products whose rows fell past
 * the first thousand. Keeps requesting the next page until a short page
 * arrives.
 *
 * The query built by `buildQuery` MUST have a stable `.order(...)` so pages
 * don't overlap or skip rows between requests.
 */
export async function fetchAllRows<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
  maxRows = 50_000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return out;
}
