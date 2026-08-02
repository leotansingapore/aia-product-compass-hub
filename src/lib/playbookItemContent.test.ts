import { describe, it, expect } from "vitest";
import {
  resolveItemContent,
  buildEditedCustomContent,
  sectionAnchor,
} from "./playbookItemContent";
import type { ScriptVersion } from "@/hooks/useScripts";

/**
 * Locks E1 / PB "share page crash": `script_playbook_items.custom_content`
 * accumulated four shapes and a pin object `{ version_index: n }` was being
 * treated as a versions array, throwing `versions.map is not a function`
 * on the public playbook share view.
 *
 * These tests assert BEHAVIOUR: given a stored custom_content shape, what
 * does the reader see, and does an edit preserve the pin.
 */

const v = (author: string, content: string, title?: string): ScriptVersion => ({
  author,
  content,
  ...(title ? { title } : {}),
});

const SCRIPT_VERSIONS: ScriptVersion[] = [
  v("Alice", "Version A body", "A"),
  v("Bob", "Version B body", "B"),
  v("Cara", "Version C body", "C"),
];

const script = { versions: SCRIPT_VERSIONS };

describe("resolveItemContent — custom_content shapes", () => {
  it("null custom_content shows every script version, no pin, no local edits", () => {
    const r = resolveItemContent(null, script);
    expect(r.display).toHaveLength(3);
    expect(r.display.map((d) => d.version.author)).toEqual(["Alice", "Bob", "Cara"]);
    expect(r.display.map((d) => d.originalIndex)).toEqual([0, 1, 2]);
    expect(r.allVersions).toEqual(SCRIPT_VERSIONS);
    expect(r.pinnedIndex).toBeUndefined();
    expect(r.hasLocalEdits).toBe(false);
  });

  it("undefined custom_content behaves like null", () => {
    const r = resolveItemContent(undefined, script);
    expect(r.display).toHaveLength(3);
    expect(r.hasLocalEdits).toBe(false);
  });

  it("REGRESSION: a pin object { version_index } does not crash and shows exactly one version", () => {
    // This is the exact shape written by AddToPlaybookDialog that used to be
    // .map()-ed as if it were an array.
    expect(() => resolveItemContent({ version_index: 1 }, script)).not.toThrow();

    const r = resolveItemContent({ version_index: 1 }, script);
    expect(r.display).toHaveLength(1);
    expect(r.display[0].version.author).toBe("Bob");
    // originalIndex must stay the index into the FULL array, not 0.
    expect(r.display[0].originalIndex).toBe(1);
    expect(r.pinnedIndex).toBe(1);
    // A pin is not a local edit — the script is still the source of truth.
    expect(r.hasLocalEdits).toBe(false);
    expect(r.allVersions).toEqual(SCRIPT_VERSIONS);
  });

  it("pin at index 0 is honoured (falsy index must not be mistaken for absent)", () => {
    const r = resolveItemContent({ version_index: 0 }, script);
    expect(r.display).toHaveLength(1);
    expect(r.display[0].version.author).toBe("Alice");
    expect(r.pinnedIndex).toBe(0);
  });

  it("out-of-range pin falls back to showing all versions instead of an empty page", () => {
    const r = resolveItemContent({ version_index: 9 }, script);
    expect(r.display).toHaveLength(3);
    expect(r.pinnedIndex).toBe(9);
  });

  it("legacy raw array custom_content overrides the script versions", () => {
    const local = [v("Editor", "Playbook-local edit")];
    const r = resolveItemContent(local, script);
    expect(r.display).toHaveLength(1);
    expect(r.display[0].version.content).toBe("Playbook-local edit");
    expect(r.allVersions).toEqual(local);
    expect(r.hasLocalEdits).toBe(true);
    expect(r.pinnedIndex).toBeUndefined();
  });

  it("current shape { versions } overrides the script versions", () => {
    const local = [v("Editor", "Edited 1"), v("Editor", "Edited 2")];
    const r = resolveItemContent({ versions: local }, script);
    expect(r.display).toHaveLength(2);
    expect(r.allVersions).toEqual(local);
    expect(r.hasLocalEdits).toBe(true);
  });

  it("current shape { versions, version_index } shows only the pinned LOCAL version", () => {
    const local = [v("Editor", "Edited 1"), v("Editor", "Edited 2")];
    const r = resolveItemContent({ versions: local, version_index: 1 }, script);
    expect(r.display).toHaveLength(1);
    expect(r.display[0].version.content).toBe("Edited 2");
    expect(r.display[0].originalIndex).toBe(1);
    expect(r.pinnedIndex).toBe(1);
    expect(r.hasLocalEdits).toBe(true);
  });

  it("section-header shape { label, level } yields the script versions untouched", () => {
    const r = resolveItemContent({ label: "Opening", level: 1 }, script);
    expect(r.display).toHaveLength(3);
    expect(r.hasLocalEdits).toBe(false);
    expect(r.pinnedIndex).toBeUndefined();
  });

  it("non-array script.versions degrades to an empty list rather than crashing", () => {
    expect(() => resolveItemContent(null, { versions: "oops" as never })).not.toThrow();
    expect(resolveItemContent(null, { versions: "oops" as never }).display).toEqual([]);
    expect(resolveItemContent(null, { versions: null as never }).display).toEqual([]);
    expect(resolveItemContent(null, {}).display).toEqual([]);
    expect(resolveItemContent(null, undefined).display).toEqual([]);
    expect(resolveItemContent(null, null).display).toEqual([]);
  });

  it("a pin with no script versions to point at shows nothing, does not throw", () => {
    const r = resolveItemContent({ version_index: 2 }, { versions: [] });
    expect(r.display).toEqual([]);
    expect(r.pinnedIndex).toBe(2);
  });

  it("a non-numeric version_index is ignored", () => {
    const r = resolveItemContent({ version_index: "1" }, script);
    expect(r.pinnedIndex).toBeUndefined();
    expect(r.display).toHaveLength(3);
  });

  it("scalar custom_content (string/number/boolean) is ignored", () => {
    for (const cc of ["", "junk", 0, 42, true, false]) {
      const r = resolveItemContent(cc, script);
      expect(r.display).toHaveLength(3);
      expect(r.hasLocalEdits).toBe(false);
    }
  });
});

describe("buildEditedCustomContent — editing must not lose the pin", () => {
  it("REGRESSION: editing a pinned item preserves version_index", () => {
    const next = buildEditedCustomContent({ version_index: 1 }, script, 1, "Rewritten B");
    expect(next.version_index).toBe(1);
    expect(next.versions).toHaveLength(3);
    expect((next.versions as ScriptVersion[])[1].content).toBe("Rewritten B");
    // Non-edited versions untouched.
    expect((next.versions as ScriptVersion[])[0].content).toBe("Version A body");

    // And the result round-trips: still exactly one displayed version.
    const r = resolveItemContent(next, script);
    expect(r.display).toHaveLength(1);
    expect(r.display[0].version.content).toBe("Rewritten B");
    expect(r.pinnedIndex).toBe(1);
  });

  it("preserves a pin of 0", () => {
    const next = buildEditedCustomContent({ version_index: 0 }, script, 0, "Rewritten A");
    expect(next.version_index).toBe(0);
    expect(resolveItemContent(next, script).display).toHaveLength(1);
  });

  it("editing an unpinned item writes { versions } with no version_index key", () => {
    const next = buildEditedCustomContent(null, script, 2, "Rewritten C");
    expect(next).not.toHaveProperty("version_index");
    expect((next.versions as ScriptVersion[])[2].content).toBe("Rewritten C");
    expect(resolveItemContent(next, script).display).toHaveLength(3);
  });

  it("editing a legacy raw-array item normalises to { versions }", () => {
    const legacy = [v("Editor", "old")];
    const next = buildEditedCustomContent(legacy, script, 0, "new");
    expect(next.versions).toEqual([{ author: "Editor", content: "new" }]);
    expect(next).not.toHaveProperty("version_index");
  });

  it("preserves the other fields of the edited version (author/title)", () => {
    const next = buildEditedCustomContent(null, script, 0, "body only changed");
    const edited = (next.versions as ScriptVersion[])[0];
    expect(edited.author).toBe("Alice");
    expect(edited.title).toBe("A");
    expect(edited.content).toBe("body only changed");
  });

  it("an out-of-range editIndex is a no-op on content, never a crash", () => {
    const next = buildEditedCustomContent(null, script, 99, "nowhere");
    expect(next.versions).toEqual(SCRIPT_VERSIONS);
  });

  it("editing with no versions anywhere produces an empty versions array", () => {
    const next = buildEditedCustomContent(null, { versions: [] }, 0, "x");
    expect(next.versions).toEqual([]);
  });

  it("two successive edits both stick and the pin survives", () => {
    const first = buildEditedCustomContent({ version_index: 2 }, script, 2, "edit one");
    const second = buildEditedCustomContent(first, script, 0, "edit two");
    const versions = second.versions as ScriptVersion[];
    expect(versions[2].content).toBe("edit one");
    expect(versions[0].content).toBe("edit two");
    expect(second.version_index).toBe(2);
  });
});

describe("sectionAnchor", () => {
  it("slugifies a normal label", () => {
    expect(sectionAnchor("Opening Questions", "abcdef12-3456")).toBe("opening-questions");
  });

  it("collapses punctuation and trims leading/trailing hyphens", () => {
    expect(sectionAnchor("  Step 1: Warm-up!! ", "abcdef12-3456")).toBe("step-1-warm-up");
  });

  it("REGRESSION: emoji-only / symbol-only labels get a stable id-based anchor, not an empty one", () => {
    expect(sectionAnchor("🔥🔥", "abcdef12-3456-7890")).toBe("section-abcdef12");
    expect(sectionAnchor("!!!", "abcdef12-3456-7890")).toBe("section-abcdef12");
  });

  it("missing label falls back to the literal 'section' slug", () => {
    expect(sectionAnchor(undefined, "abcdef12-3456")).toBe("section");
    expect(sectionAnchor(null, "abcdef12-3456")).toBe("section");
  });

  it("empty-string label is treated as a missing label, not as an unslugifiable one", () => {
    // "" is falsy so it takes the `label || "section"` path and slugifies to
    // "section" — same as undefined. Only NON-empty unslugifiable labels
    // (emoji/symbols) reach the id-based fallback.
    expect(sectionAnchor("", "abcdef12-3456")).toBe("section");
  });

  it("two symbol-only sections with different ids get different anchors", () => {
    expect(sectionAnchor("★", "11111111-aaaa")).not.toBe(sectionAnchor("★", "22222222-bbbb"));
  });
});
