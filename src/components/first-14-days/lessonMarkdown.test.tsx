import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { lessonMarkdownComponents, ONBOARDING_CALL_URL } from "./lessonMarkdown";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { DIAGRAM_KINDS, parseDiagram } from "./LayersDiagram";

const capture = vi.fn();
vi.mock("posthog-js", () => ({ default: { capture: (...args: unknown[]) => capture(...args) } }));

const renderLesson = (md: string) =>
  render(
    <MemoryRouter>
      <ReactMarkdown components={lessonMarkdownComponents}>{md}</ReactMarkdown>
    </MemoryRouter>,
  );

describe("First 14 Days lesson markdown", () => {
  it("opens an image full size in a new tab", () => {
    renderLesson("![Salary list](/first-14-days/images/salary-top-jobs.webp)");
    const link = screen.getByRole("link", { name: "Open full size: Salary list" });
    expect(link.getAttribute("href")).toBe("/first-14-days/images/salary-top-jobs.webp");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("counts a click on a booking link, and only on a booking link", async () => {
    renderLesson(`[Book a call](${ONBOARDING_CALL_URL}) and [Telegram](https://t.me/+x)`);
    fireEvent.click(screen.getByRole("link", { name: "Telegram" }));
    fireEvent.click(screen.getByRole("link", { name: "Book a call" }));
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50)); // a late Telegram capture would land here
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith("onboarding_call_clicked", { source: "link" });
  });

  it("reads a diagram fence: title and art lines first, then rows of Title | detail cells", () => {
    expect(parseDiagram("title: Lead | bar\nart: /a.webp\nYou | me\nA | one || B | x | y\n")).toEqual({
      title: "Lead | bar",
      art: "/a.webp",
      rows: [[{ title: "You", detail: "me" }], [{ title: "A", detail: "one" }, { title: "B", detail: "x | y" }]],
    });
  });

  it("draws a layers fence as a poster: reader on top, cards side by side, base bar last", () => {
    const { container } = renderLesson(
      "```layers\ntitle: Tripod | system\nart: /first-14-days/diagrams/tss.webp\nYou | clients first\nA | one || B | two || C | three\nBase | under all\n```",
    );
    expect(container.querySelector("pre, code")).toBeNull();
    expect(screen.getByText("Tripod")).toBeTruthy();
    expect(screen.getByText("system")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/first-14-days/diagrams/tss.webp");
    expect(screen.getByText("You").classList.contains("-rotate-6")).toBe(true);
    const card = (t: string) => screen.getByText(t).closest(".flex-1");
    expect(card("A")?.parentElement).toBe(card("C")?.parentElement);
    expect(screen.getByText("Base").closest(".-rotate-1")).toBeTruthy();
  });

  it("draws a one-row layers fence as plain cards, with no reader and no base", () => {
    const { container } = renderLesson("```layers\nIncome | a || Independence | b || Impact | c\n```");
    expect(container.querySelector(".-rotate-6, .-rotate-1")).toBeNull();
    expect(screen.getByText("Income").closest(".flex-1")?.parentElement?.children).toHaveLength(3);
  });

  it("numbers pyramid tiers under the reader", () => {
    renderLesson("```pyramid\nYou | me\nCompany | a\nDistrict | b\n```");
    expect(screen.getByText("You").classList.contains("-rotate-6")).toBe(true);
    expect(screen.getByText("Company").closest(".flex-1")?.textContent).toMatch(/^1Company/);
    expect(screen.getByText("District").closest(".flex-1")?.textContent).toMatch(/^2District/);
  });

  it("draws a stats fence as big numbers, with a single-cell last row as the base bar", () => {
    renderLesson("```stats\n$200K+ | franchise || $650K | clinic\n$0 upfront | our model\n```");
    expect(screen.getByText("$200K+").className).toMatch(/Anton/);
    expect(screen.getByText("$650K").nextSibling?.textContent).toBe("clinic");
    expect(screen.getByText("$0 upfront").closest(".-rotate-1")).toBeTruthy();
    expect(screen.queryByText("YOU")).toBeNull();
  });

  it("draws a compare fence as rows of topic, them and us, naming each side on a phone", () => {
    renderLesson("```compare\n|| Typical agency || With us\nLeads || buy your own || booked for you\nAdmin || on your desk || our VA team\n```");
    const row = screen.getByText("Leads").parentElement!;
    expect(row.children).toHaveLength(3);
    expect(row.children[1].textContent).toBe("Typical agencybuy your own");
    expect(row.children[2].textContent).toBe("With usbooked for you");
    expect(screen.getByText("Admin").parentElement?.children[2].textContent).toBe("With usour VA team");
  });

  it("puts a row of four or more cells under the headline, two to a line on a phone", () => {
    const { container } = renderLesson("```layers\ntitle: Ideal | career\nart: /a.webp\nA || B || C || D || E\n```");
    const row = screen.getByText("A").closest(".grid");
    expect(row?.className).toMatch(/grid-cols-2/);
    expect(row?.children).toHaveLength(5);
    expect(container.querySelector("img")?.parentElement?.className).toMatch(/sm:col-start-2/);
  });

  it("lays a steps fence out as a numbered road", () => {
    renderLesson("```steps\nBrief | 30 min\nTest | fit\nOffer | sign\n```");
    const steps = screen.getAllByRole("listitem");
    expect(steps.map((li) => li.textContent)).toEqual(["1Brief30 min", "2Testfit", "3Offersign"]);
  });
  it("draws a press fence as linked article cards, and drops a non-http link", () => {
    renderLesson("```press\nThe Paper, 1 Jan 2026 | Big headline | One fact. | https://example.com/a\nOther, 2026 | Second | Fact two. | https://example.com/b | See the ranking\nBad, 2026 | Third | Fact three. | javascript:alert(1)\n```");
    expect(screen.getAllByRole("article")).toHaveLength(3);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href"), a.getAttribute("target")])).toEqual([
      ["Read the article", "https://example.com/a", "_blank"],
      ["See the ranking", "https://example.com/b", "_blank"],
    ]);
    expect(screen.getByText("The Paper, 1 Jan 2026")).toBeTruthy();
  });
  it("shows a step titled '(done)' with a tick instead of its number", () => {
    renderLesson("```steps\nOrientation (done) | First 14 Days\nPapers | next\n```");
    const steps = screen.getAllByRole("listitem");
    expect(steps.map((li) => li.textContent)).toEqual(["OrientationFirst 14 Days", "2Papersnext"]);
    expect(screen.getByLabelText("Done")).toBeTruthy();
  });
  it("every fence in a First 14 Days lesson is the income calculator or a diagram kind, and its art file exists", () => {
    const days = readdirSync("docs/first-14-days", { recursive: true, encoding: "utf8" }).filter((f) => /day-\d+\.md$/.test(f));
    expect(days).toHaveLength(14);
    for (const day of days) {
      const md = readFileSync(`docs/first-14-days/${day}`, "utf8");
      for (const [, lang, body] of md.matchAll(/^```([\w-]*)\n([\s\S]*?)^```$/gm)) {
        if (lang === "income-calculator") continue;
        expect(DIAGRAM_KINDS, `${day}: \`\`\`${lang}`).toContain(lang);
        const { art, rows } = parseDiagram(body);
        expect(rows.length, `${day}: ${lang} has no rows`).toBeGreaterThan(0);
        if (art) expect(existsSync(`public${art}`), `${day}: missing ${art}`).toBe(true);
      }
    }
  });
});
