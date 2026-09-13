import { describe, expect, it } from "vitest";
import { parseDoors, stripDoors } from "./feedbackDoors";

describe("feedback doors", () => {
  it("reads a feedback directive and strips it from the prose", () => {
    const text = "The mock exams have no timer today.\n\n[[feedback:feature|Add a timer to the CMFAS mock exams|I lose track of time in the M9 mock]]";
    expect(parseDoors(text)).toEqual([{ kind: "feedback", category: "feature", title: "Add a timer to the CMFAS mock exams", body: "I lose track of time in the M9 mock" }]);
    expect(stripDoors(text)).toBe("The mock exams have no timer today.");
  });
  it("reads a support directive and offers both for a bug, deduped, at most two", () => {
    const out = parseDoors(["[[feedback:bug|Day 12 video will not load|Spinner forever]]", "[[support:Day 12 video will not load for me]]", "[[feedback:bug|Day 12 video will not load|Spinner forever]]", "[[support:another]]"].join("\n"));
    expect(out.map((d) => d.kind)).toEqual(["feedback", "support"]);
  });
  it("allowlists the category, caps the text, drops junk", () => {
    const [d] = parseDoors(`[[feedback:wish|${"t".repeat(300)}|${"b".repeat(5000)}]]`);
    expect(d.kind === "feedback" && d.category).toBe("feature");
    expect(d.kind === "feedback" && d.title.length).toBe(120);
    expect(parseDoors("[[feedback:bug|]] [[support:]] [[support:4242 4242]]")).toEqual([]);
  });
  it("hides a half-streamed directive and never spans lines", () => {
    expect(stripDoors("Reported below. [[feedback:bug|Day 12")).toBe("Reported below.");
    expect(stripDoors("Reported below. [[feedb")).toBe("Reported below.");
    expect(parseDoors("[[support:line one\nline two]]")).toEqual([]);
  });
});
