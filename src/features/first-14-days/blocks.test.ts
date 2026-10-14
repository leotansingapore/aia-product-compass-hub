import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blockKind, joinBlocks, replaceBlock, splitBlocks } from "./blocks";
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

  it("replaces only the block asked for", () => {
    const src = "One\n\nTwo two\n\nThree\n";
    expect(replaceBlock(src, 1, "Second")).toBe("One\n\nSecond\n\nThree\n");
    expect(replaceBlock(src, 1, "Second\n\nAnd more")).toBe("One\n\nSecond\n\nAnd more\n\nThree\n");
    expect(replaceBlock(src, 9, "x")).toBe(src);
  });

  it("deletes a block that is emptied, keeping the file's trailing newline", () => {
    const src = "One\n\nTwo\n\nThree\n";
    expect(replaceBlock(src, 1, "  ")).toBe("One\n\nThree\n");
    expect(replaceBlock(src, 2, "")).toBe("One\n\nTwo\n");
    expect(replaceBlock(src, 0, "")).toBe("Two\n\nThree\n");
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
