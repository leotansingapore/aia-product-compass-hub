import { describe, expect, it } from "vitest"
import { fetchRecentChanges, pickRecentChanges, type RecentChange } from "@/lib/whatsNew"

const NOW = Date.parse("2026-09-28T12:00:00Z")
const entry = (id: string, type: RecentChange["type"], date: string): RecentChange => ({ id, slug: null, type, date, title: `t-${id}` })

describe("pickRecentChanges", () => {
  it("drops entries older than a week", () => {
    const picked = pickRecentChanges([entry("old", "new", "2026-09-20T00:00:00Z"), entry("fresh", "fixed", "2026-09-27T00:00:00Z")], NOW)
    expect(picked.map((e) => e.id)).toEqual(["fresh"])
  })

  it("leads with new, then improved, then fixed, newest first within a type", () => {
    const picked = pickRecentChanges(
      [
        entry("fix", "fixed", "2026-09-27T00:00:00Z"),
        entry("imp", "improved", "2026-09-26T00:00:00Z"),
        entry("newOld", "new", "2026-09-24T00:00:00Z"),
        entry("newNew", "new", "2026-09-25T00:00:00Z"),
      ],
      NOW,
    )
    expect(picked.map((e) => e.id)).toEqual(["newNew", "newOld", "imp", "fix"])
  })

  it("shows at most four lines", () => {
    const many = Array.from({ length: 9 }, (_, i) => entry(`e${i}`, "new", "2026-09-27T00:00:00Z"))
    expect(pickRecentChanges(many, NOW)).toHaveLength(4)
  })
})

describe("fetchRecentChanges", () => {
  it("returns no lines when the board fails, so the prompt still shows", async () => {
    const failing = (async () => {
      throw new Error("offline")
    }) as unknown as typeof fetch
    await expect(fetchRecentChanges(failing)).resolves.toEqual([])
  })
})
