import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blockKind, groupParts, joinBlocks, replaceBlocks, splitBlocks, tidyRichMarkdown } from "./blocks";
import { parseFrontmatter, stripAppendix } from "./parse";

const daySources = readdirSync("docs/first-14-days", { recursive: true, encoding: "utf8" })
  .filter((f) => /day-\d+\.md$/.test(f))
  .map((f) => [f, stripAppendix(parseFrontmatter(readFileSync(`docs/first-14-days/${f}`, "utf8")).body)] as const);

describe("lesson blocks", () => {
  it("splits and rejoins every First 14 Days lesson byte for byte", () => {
    expect(daySources).toHaveLength(14);
    for (const [file, source] of daySources) {
      const parsed = splitBlocks(source);
      expect(parsed.blocks.length, file).toBeGreaterThan(3);
      expect(joinBlocks(parsed), file).toBe(source);
    }
  });

  it("keeps a code fence with blank lines inside as one block", () => {
    const src = "Intro\n\n```steps\nA | a\n\nB | b\n```\n\nOutro\n";
    const { blocks } = splitBlocks(src);
    expect(blocks.map((b) => b.text)).toEqual(["Intro", "```steps\nA | a\n\nB | b\n```", "Outro"]);
    expect(joinBlocks(splitBlocks(src))).toBe(src);
  });

  it("round-trips leading blank lines, extra gaps and no trailing newline", () => {
    for (const src of ["\n\nA\n\n\nB", "A", "", "A\n", "\nA\n\n"]) expect(joinBlocks(splitBlocks(src))).toBe(src);
  });

  it("replaces only the blocks asked for", () => {
    const src = "One\n\nTwo two\n\nThree\n";
    expect(replaceBlocks(src, 1, 2, "Second")).toBe("One\n\nSecond\n\nThree\n");
    expect(replaceBlocks(src, 1, 2, "Second\n\nAnd more")).toBe("One\n\nSecond\n\nAnd more\n\nThree\n");
    expect(replaceBlocks(src, 0, 2, "Merged")).toBe("Merged\n\nThree\n");
    expect(replaceBlocks(src, 9, 10, "x")).toBe(src);
  });

  it("deletes blocks that are emptied, keeping the file's trailing newline", () => {
    const src = "One\n\nTwo\n\nThree\n";
    expect(replaceBlocks(src, 1, 2, "  ")).toBe("One\n\nThree\n");
    expect(replaceBlocks(src, 2, 3, "")).toBe("One\n\nTwo\n");
    expect(replaceBlocks(src, 1, 3, "")).toBe("One\n");
    expect(replaceBlocks(src, 0, 1, "")).toBe("Two\n\nThree\n");
  });

  it("keeps the exact markdown of every block in a section that renders the same", () => {
    // Stand-in for the editor's round trip: list markers respaced, escapes added.
    const render = (md: string) => md.replace(/^(-|\d+\.)\s+/gm, "$1 ").replace(/\\/g, "");
    const src = "Intro\n\n- a\n- b\n\nSay 1. here\n\n\nTail\n\n1. Long one\n\n2. Long two\n";
    // The loose numbered list at the end comes back tight, as one block.
    const roundTrip = "Intro\n\n-   a\n-   b\n\nSay 1\\. here\n\nTail\n\n1.  Long one\n2.  Long two";
    expect(replaceBlocks(src, 0, 6, roundTrip, render)).toBe(src);
    expect(replaceBlocks(src, 0, 6, roundTrip.replace("Intro", "New intro"), render)).toBe(
      "New intro\n\n- a\n- b\n\nSay 1. here\n\nTail\n\n1. Long one\n\n2. Long two\n",
    );
  });

  it("tightens the editor's loose lists and drops its empty paragraphs", () => {
    // Turndown's output for the editor's <li><p> lists (real output, nested list and two lists in a row).
    const editor =
      "Intro\n\n&nbsp;\n\n-   One\n    \n-   Two\n    \n    -   Nested\n        \n-   Three\n    \n\n1.  First\n    \n2.  Second\n    \n\nAfter";
    expect(tidyRichMarkdown(editor)).toBe(
      "Intro\n\n\n\n-   One\n-   Two\n    -   Nested\n-   Three\n    \n\n1.  First\n2.  Second\n    \n\nAfter",
    );
    expect(tidyRichMarkdown("> One quote\n> >\n\nAfter")).toBe("> One quote\n\nAfter");
    expect(tidyRichMarkdown("> A\n> >\n> B\n> >")).toBe("> A\n>\n> B");
    // Rebuilt into blocks, the two lists stay two blocks and the empty paragraph is gone.
    expect(splitBlocks(tidyRichMarkdown(editor)).blocks.map((b) => b.text)).toEqual([
      "Intro",
      "-   One\n-   Two\n    -   Nested\n-   Three",
      "1.  First\n2.  Second",
      "After",
    ]);
  });

  it("groups consecutive prose into one part and keeps each raw block apart", () => {
    const { blocks } = splitBlocks("A\n\nB\n\n![[x.webp|X]]\n\nC\n\n```steps\nS\n```\n\n---\n\nD\n");
    expect(groupParts(blocks)).toEqual([
      { start: 0, end: 2, rich: true },
      { start: 2, end: 3, rich: false },
      { start: 3, end: 4, rich: true },
      { start: 4, end: 5, rich: false },
      { start: 5, end: 6, rich: false },
      { start: 6, end: 7, rich: true },
    ]);
  });

  it("edits fences, tables, images and rules as raw text and prose as rich text", () => {
    expect(blockKind("```steps\nA | a\n```")).toBe("raw");
    expect(blockKind("```income-calculator\n```")).toBe("raw");
    expect(blockKind("| a | b |\n|---|---|")).toBe("raw");
    expect(blockKind("![[first-14-days/images/x.webp|X]]")).toBe("raw");
    expect(blockKind("---")).toBe("raw");
    expect(blockKind("## Heading")).toBe("rich");
    expect(blockKind("1. Read the [kit](https://x).\n2. Join.")).toBe("rich");
    expect(blockKind("Plain paragraph with a | pipe in it.")).toBe("rich");
  });
});
