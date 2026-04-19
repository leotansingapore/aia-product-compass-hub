import { describe, it, expect } from "vitest";
import { parseFrontmatter, parseQuiz } from "./parse";

const SAMPLE = `---
week: 1
day: 2
title: "Why Financial Planning Matters"
primary_source: internal-reference
primary_slides: "n/a"
supporting_sources: []
duration_minutes: 20
tags: [first-60-days, week-1, mindset]
---

# Day 2 — Why Financial Planning Matters

> **The one idea for today:** everyone needs a plan.

## Something else

Body content here.

## Quick quiz

1. **First question text?**
 - A) Wrong answer
 - B) Correct answer ✓
 - C) Also wrong
 - D) Nope

2. **Second question?**
 - A) Right ✓
 - B) Wrong

3. **Third question?**
 - A) Foo
 - B) Bar
 - C) Baz ✓

---

## Related
- Next: [[day-03|...]]
`;

describe("parseFrontmatter", () => {
  it("extracts week/day/title/tags", () => {
    const { frontmatter, body } = parseFrontmatter(SAMPLE);
    expect(frontmatter.week).toBe(1);
    expect(frontmatter.day).toBe(2);
    expect(frontmatter.title).toBe("Why Financial Planning Matters");
    expect(frontmatter.tags).toEqual(["first-60-days", "week-1", "mindset"]);
    expect(frontmatter.duration_minutes).toBe(20);
    expect(body.startsWith("# Day 2")).toBe(true);
  });
});

describe("parseQuiz", () => {
  it("extracts all questions with correct option flagged", () => {
    const { body } = parseFrontmatter(SAMPLE);
    const quiz = parseQuiz(body);
    expect(quiz).toHaveLength(3);

    expect(quiz[0].question).toBe("First question text?");
    expect(quiz[0].options).toHaveLength(4);
    const correctQ1 = quiz[0].options.find((o) => o.correct);
    expect(correctQ1?.key).toBe("B");
    expect(correctQ1?.text).toBe("Correct answer");

    expect(quiz[1].options.find((o) => o.correct)?.key).toBe("A");
    expect(quiz[2].options.find((o) => o.correct)?.key).toBe("C");
  });

  it("returns [] when no Quick quiz section", () => {
    const noQuiz = SAMPLE.split("## Quick quiz")[0];
    expect(parseQuiz(noQuiz)).toEqual([]);
  });
});
