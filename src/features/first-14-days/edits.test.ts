import { describe, expect, it } from "vitest";
import { fileChangedSinceEdit, hashSource, shownSource, type DayEdit } from "./edits";

const edit = (id: number, markdown: string | null, base: string): DayEdit => ({
  id,
  markdown,
  base_hash: hashSource(base),
  created_at: "2026-10-14T06:00:00Z",
});

describe("First 14 Days admin edits", () => {
  it("shows the lesson file when there are no edits", () => {
    expect(shownSource([], "file text")).toBe("file text");
  });

  it("shows the newest edit, and the file again after a 'use the lesson file' row", () => {
    expect(shownSource([edit(2, "new text", "file"), edit(1, "old text", "file")], "file")).toBe("new text");
    expect(shownSource([edit(3, null, "file"), edit(2, "new text", "file")], "file")).toBe("file");
  });

  it("flags an edit whose lesson file changed in code afterwards", () => {
    expect(fileChangedSinceEdit([edit(1, "edited", "file v1")], "file v1")).toBe(false);
    expect(fileChangedSinceEdit([edit(1, "edited", "file v1")], "file v2")).toBe(true);
    expect(fileChangedSinceEdit([edit(1, null, "file v1")], "file v2")).toBe(false);
    expect(fileChangedSinceEdit([], "file v2")).toBe(false);
  });

  it("hashes stably and tells small changes apart", () => {
    expect(hashSource("abc")).toBe(hashSource("abc"));
    expect(hashSource("abc")).not.toBe(hashSource("abd"));
    expect(hashSource("")).toMatch(/^[0-9a-f]{8}$/);
  });
});
