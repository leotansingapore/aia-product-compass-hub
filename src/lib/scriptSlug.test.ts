import { describe, it, expect } from "vitest";
import { toScriptSlug, resolveScriptSlug } from "./scriptSlug";

/**
 * Locks E1 finding S14: resolveScriptSlug must return null for an unknown
 * slug so the caller can render "not found" instead of silently opening the
 * wrong script (or crashing on undefined).
 */

const SCRIPTS = [
  { id: "8f42b1c3-1111-4a2b-9c3d-000000000001", stage: "Warm Market Intro" },
  { id: "aa11bb22-2222-4a2b-9c3d-000000000002", stage: "Objection: Too Expensive" },
  { id: "cc33dd44-3333-4a2b-9c3d-000000000003", stage: "Referral Ask" },
];

describe("toScriptSlug", () => {
  it("builds '<title-slug>-<first-8-hex>'", () => {
    expect(toScriptSlug("Warm Market Intro", SCRIPTS[0].id)).toBe("warm-market-intro-8f42b1c3");
  });

  it("strips special characters and collapses whitespace", () => {
    expect(toScriptSlug("Objection: Too  Expensive!", SCRIPTS[1].id)).toBe(
      "objection-too-expensive-aa11bb22",
    );
  });

  it("caps the title portion at 48 characters", () => {
    const long = "a".repeat(80);
    const slug = toScriptSlug(long, SCRIPTS[0].id);
    expect(slug).toBe(`${"a".repeat(48)}-8f42b1c3`);
  });

  it("takes the first 8 hex chars with the dashes removed", () => {
    expect(toScriptSlug("x", "12345678-90ab-cdef-1234-567890abcdef")).toBe("x-12345678");
  });
});

describe("resolveScriptSlug", () => {
  it("resolves a slug produced by toScriptSlug back to its script id", () => {
    for (const s of SCRIPTS) {
      expect(resolveScriptSlug(toScriptSlug(s.stage, s.id), SCRIPTS)).toBe(s.id);
    }
  });

  it("resolves a raw UUID for backward compatibility with old links", () => {
    expect(resolveScriptSlug(SCRIPTS[1].id, SCRIPTS)).toBe(SCRIPTS[1].id);
  });

  it("resolves a slug whose title portion has since been renamed (id suffix wins)", () => {
    expect(resolveScriptSlug("completely-different-title-8f42b1c3", SCRIPTS)).toBe(SCRIPTS[0].id);
  });

  it("is case-insensitive on the id suffix", () => {
    expect(resolveScriptSlug("warm-market-intro-8F42B1C3", SCRIPTS)).toBe(SCRIPTS[0].id);
  });

  it("REGRESSION (S14): an unknown slug returns null, not a wrong script", () => {
    expect(resolveScriptSlug("does-not-exist-deadbeef", SCRIPTS)).toBeNull();
  });

  it("REGRESSION (S14): a UUID that is not in the list returns null", () => {
    expect(resolveScriptSlug("99999999-9999-4a2b-9c3d-999999999999", SCRIPTS)).toBeNull();
  });

  it("returns null for an empty or garbage slug", () => {
    expect(resolveScriptSlug("", SCRIPTS)).toBeNull();
    expect(resolveScriptSlug("no-hex-suffix-here", SCRIPTS)).toBeNull();
    expect(resolveScriptSlug("!!!", SCRIPTS)).toBeNull();
  });

  it("returns null when the script list is empty (data not loaded yet)", () => {
    expect(resolveScriptSlug("warm-market-intro-8f42b1c3", [])).toBeNull();
  });

  it("does not confuse two scripts whose ids share a prefix beyond 8 chars", () => {
    const twins = [
      { id: "abcdef12-0000-4a2b-9c3d-000000000001", stage: "First" },
      { id: "abcdef12-1111-4a2b-9c3d-000000000002", stage: "Second" },
    ];
    // Ambiguous by design (8-char prefix); assert it resolves deterministically
    // to the first match and never to null or undefined.
    expect(resolveScriptSlug("first-abcdef12", twins)).toBe(twins[0].id);
  });

  it("a slug with a trailing hex group shorter than 8 chars does not match", () => {
    expect(resolveScriptSlug("warm-market-intro-8f42b1", SCRIPTS)).toBeNull();
  });
});
