import { describe, it, expect } from "vitest";
import { parseFrontmatter, parseQuiz, parseReflection, stripAppendix } from "./parse";

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

describe("parseReflection", () => {
  const WITH_REFLECTION = `# Day

## Reflection worksheet

Write your answers — don't just think them.

**1. Why are you really here?**
> Not the "tell mum and dad" answer. Keep it to 3 sentences.

**2. Which skill are you weakest in?**
> And give one example.

**3. What does growth look like?**

---

## Quick quiz
`;

  it("extracts numbered questions with optional hints", () => {
    const prompts = parseReflection(WITH_REFLECTION);
    expect(prompts).toHaveLength(3);
    expect(prompts[0].question).toBe("Why are you really here?");
    expect(prompts[0].hint).toMatch(/tell mum and dad/);
    expect(prompts[1].question).toBe("Which skill are you weakest in?");
    expect(prompts[2].question).toBe("What does growth look like?");
    expect(prompts[2].hint).toBeUndefined();
  });

  it("matches the Final reflection heading used on Day 60", () => {
    const dy60 = `## Final reflection — the 60-day wrap\n\n**1. What did you learn?**\n> one sentence.\n\n**2. What will you keep?**\n`;
    const prompts = parseReflection(dy60);
    expect(prompts).toHaveLength(2);
    expect(prompts[0].question).toBe("What did you learn?");
  });

  it("returns [] when no reflection heading present", () => {
    expect(parseReflection("# just content\n\n## Some other\n")).toEqual([]);
  });

  it("strips trailing colon from question text", () => {
    const withColon = `## Reflection worksheet\n\n**1. The most valuable thing:**\n> one sentence.`;
    const prompts = parseReflection(withColon);
    expect(prompts[0].question).toBe("The most valuable thing");
  });
});

describe("stripAppendix", () => {
  it("removes the Quick quiz section and everything after", () => {
    const { body } = parseFrontmatter(SAMPLE);
    const stripped = stripAppendix(body);
    expect(stripped).not.toMatch(/Quick quiz/);
    expect(stripped).not.toMatch(/Correct answer/);
    expect(stripped).not.toMatch(/✓/);
    expect(stripped).toMatch(/Body content here/);
  });

  it("removes the Related section when it appears first", () => {
    const onlyRelated = `body text\n\n## Related\n- Next: [[day-02|...]]`;
    expect(stripAppendix(onlyRelated)).toBe("body text");
  });

  it("strips trailing --- horizontal rule before the cut", () => {
    const withRule = `some content\n\n---\n\n## Quick quiz\n\n1. **q?**\n - A) x\n`;
    expect(stripAppendix(withRule)).toBe("some content");
  });
});
