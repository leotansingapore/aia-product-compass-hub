import { describe, it, expect, vi } from "vitest";
import { fetchAllRows } from "./fetchAllRows";

/**
 * Locks the E1 "1000-row PostgREST cap" finding: PostgREST silently truncates
 * every response to max-rows (1000), which made the question-bank list show
 * "Study (0)" for products whose rows fell past the first thousand.
 * fetchAllRows must keep paging until a short page arrives.
 *
 * The query builder is a plain fake — no Supabase client is imported.
 */

const PAGE = 1000;

/** A fake PostgREST-ish table that honours .range(from, to) and caps at 1000. */
function fakeTable(totalRows: number) {
  const all = Array.from({ length: totalRows }, (_, i) => ({ id: i }));
  const calls: Array<[number, number]> = [];
  const build = vi.fn(async (from: number, to: number) => {
    calls.push([from, to]);
    const capped = Math.min(to, from + PAGE - 1);
    return { data: all.slice(from, capped + 1), error: null };
  });
  return { build, calls, all };
}

describe("fetchAllRows", () => {
  it("returns everything in one request when the table is smaller than a page", () => {
    const { build } = fakeTable(37);
    return fetchAllRows<{ id: number }>(build).then((rows) => {
      expect(rows).toHaveLength(37);
      expect(build).toHaveBeenCalledTimes(1);
    });
  });

  it("REGRESSION: pages past the 1000-row cap instead of returning a truncated list", async () => {
    const { build, calls } = fakeTable(2500);
    const rows = await fetchAllRows<{ id: number }>(build);
    expect(rows).toHaveLength(2500);
    // The bug was stopping at 1000.
    expect(rows.length).toBeGreaterThan(PAGE);
    expect(rows[0].id).toBe(0);
    expect(rows[2499].id).toBe(2499);
    expect(build).toHaveBeenCalledTimes(3);
    expect(calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });

  it("no rows are skipped or duplicated across page boundaries", async () => {
    const { build } = fakeTable(2500);
    const rows = await fetchAllRows<{ id: number }>(build);
    expect(new Set(rows.map((r) => r.id)).size).toBe(2500);
    expect(rows.map((r) => r.id)).toEqual(Array.from({ length: 2500 }, (_, i) => i));
  });

  it("an exact multiple of the page size still terminates (one extra empty page)", async () => {
    const { build } = fakeTable(2000);
    const rows = await fetchAllRows<{ id: number }>(build);
    expect(rows).toHaveLength(2000);
    // 1000, 1000, then a 0-row page proves the end.
    expect(build).toHaveBeenCalledTimes(3);
  });

  it("an empty table yields an empty array after a single request", async () => {
    const { build } = fakeTable(0);
    expect(await fetchAllRows(build)).toEqual([]);
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("requests each page with a 1000-row range window", async () => {
    const { build, calls } = fakeTable(1500);
    await fetchAllRows(build);
    for (const [from, to] of calls) {
      expect(to - from + 1).toBe(PAGE);
    }
  });

  it("throws the PostgREST error rather than silently returning a partial list", async () => {
    const err = { code: "PGRST103", message: "Requested range not satisfiable" };
    const build = vi.fn(async (from: number) =>
      from === 0
        ? { data: Array.from({ length: PAGE }, (_, i) => ({ id: i })), error: null }
        : { data: null, error: err },
    );
    await expect(fetchAllRows(build)).rejects.toEqual(err);
  });

  it("throws on a first-page error instead of reporting a genuine empty result", async () => {
    const err = new Error("network down");
    const build = vi.fn(async () => ({ data: null, error: err }));
    await expect(fetchAllRows(build)).rejects.toThrow("network down");
  });

  it("treats null data as an empty page and stops", async () => {
    const build = vi.fn(async () => ({ data: null, error: null }));
    expect(await fetchAllRows(build)).toEqual([]);
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("honours the maxRows ceiling so a mis-ordered query cannot loop forever", async () => {
    // A query with no stable .order() could keep returning full pages.
    const build = vi.fn(async () => ({
      data: Array.from({ length: PAGE }, (_, i) => ({ id: i })),
      error: null,
    }));
    const rows = await fetchAllRows<{ id: number }>(build, 3000);
    expect(build).toHaveBeenCalledTimes(3);
    expect(rows).toHaveLength(3000);
  });

  it("preserves row order across pages", async () => {
    const build = vi.fn(async (from: number) => ({
      data:
        from === 0
          ? Array.from({ length: PAGE }, (_, i) => ({ id: `a${i}` }))
          : [{ id: "z" }],
      error: null,
    }));
    const rows = await fetchAllRows<{ id: string }>(build);
    expect(rows[0].id).toBe("a0");
    expect(rows[rows.length - 1].id).toBe("z");
  });
});
