import { describe, it, expect, beforeEach, vi } from "vitest";
import { suggestResources, clearResourceIndexCache } from "./resourceIndex";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => {
        if (table === "products") {
          return Promise.resolve({
            data: [
              {
                id: "p1",
                title: "Pro Achiever",
                description: "Investment-linked plan with strong returns",
                tags: ["ilp", "investment", "wealth"],
              },
              {
                id: "p2",
                title: "HealthShield Gold Max",
                description: "Comprehensive medical coverage hospital plan",
                tags: ["health", "medical", "hospital"],
              },
              {
                id: "p3",
                title: "Secure Flexi Term",
                description: "Term life insurance with flexible coverage",
                tags: ["term", "life", "protection"],
              },
            ],
          });
        }
        if (table === "obsidian_resources") {
          return Promise.resolve({
            data: [
              {
                id: "o1",
                title: "Pre-Retiree Sales Bible",
                body_md: "Comprehensive guide to selling investment products to pre-retirees",
                category: "reference",
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      },
    }),
  },
}));

describe("resourceIndex", () => {
  beforeEach(() => {
    clearResourceIndexCache();
  });

  it("returns no results for an empty query", async () => {
    const results = await suggestResources("");
    expect(results).toEqual([]);
  });

  it("ranks investment-related items higher for an investment query", async () => {
    const results = await suggestResources("investment plan for pre-retiree");
    expect(results.length).toBeGreaterThan(0);
    // Pro Achiever (matches "investment", "plan") and the Sales Bible (matches "investment", "pre-retiree") rank highest
    const topIds = results.slice(0, 2).map((r) => r.id);
    expect(topIds).toContain("product:p1");
    expect(topIds).toContain("obsidian:o1");
  });

  it("matches health-related items for a hospital query", async () => {
    const results = await suggestResources("medical hospital coverage");
    expect(results[0].id).toBe("product:p2");
  });

  it("filters out stopwords and short tokens from the query", async () => {
    const results = await suggestResources("the and or of a");
    expect(results).toEqual([]);
  });

  it("matches Pro Achiever for a tag-based query", async () => {
    const results = await suggestResources("wealth investment");
    const proAchiever = results.find((r) => r.id === "product:p1");
    expect(proAchiever).toBeDefined();
  });

  it("respects the limit parameter", async () => {
    const results = await suggestResources("investment", 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("returns deep-link hrefs for products and obsidian docs", async () => {
    const results = await suggestResources("investment");
    const product = results.find((r) => r.kind === "product");
    const obsidian = results.find((r) => r.kind === "obsidian_doc");
    expect(product?.href).toMatch(/^\/product\//);
    expect(obsidian?.href).toMatch(/^\/learning-track\/resources/);
  });
});
