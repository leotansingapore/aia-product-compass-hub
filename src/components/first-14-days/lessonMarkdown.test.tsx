import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { lessonMarkdownComponents, ONBOARDING_CALL_URL } from "./lessonMarkdown";
import { parseDiagram } from "./LayersDiagram";

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

  it("lays a steps fence out as a numbered road", () => {
    renderLesson("```steps\nBrief | 30 min\nTest | fit\nOffer | sign\n```");
    const steps = screen.getAllByRole("listitem");
    expect(steps.map((li) => li.textContent)).toEqual(["1Brief30 min", "2Testfit", "3Offersign"]);
  });
});
