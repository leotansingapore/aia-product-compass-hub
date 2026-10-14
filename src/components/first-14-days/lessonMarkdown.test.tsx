import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { lessonMarkdownComponents, ONBOARDING_CALL_URL } from "./lessonMarkdown";

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

  it("draws a layers fence as cards, side by side where a row splits on ||", () => {
    const { container } = renderLesson(
      "```layers\nYou | time goes to clients\nA | one || B | two, three || C | x | y\nBase | under all\n```",
    );
    expect(container.querySelector("pre, code")).toBeNull();
    const rows = container.querySelectorAll("figure > div");
    expect(Array.from(rows, (r) => r.children.length)).toEqual([1, 3, 1]);
    expect(screen.getByText("two, three")).toBeTruthy();
    expect(screen.getByText("x | y").previousSibling?.textContent).toBe("C");
  });

  it("lays a steps fence out as one row of steps, none highlighted", () => {
    const { container } = renderLesson("```steps\n1 · Brief | 30 min\n2 · Test | fit\n3 · Offer | sign\n```");
    const row = container.querySelectorAll("figure > div");
    expect(row).toHaveLength(1);
    expect(row[0].querySelectorAll(":scope > div")).toHaveLength(3);
    expect(row[0].querySelectorAll(":scope > svg")).toHaveLength(2);
    expect(container.querySelector(".bg-primary-glow\\/15")).toBeNull();
  });

  it("widens pyramid rows from the top down", () => {
    const { container } = renderLesson("```pyramid\nYou\nTier 1 | a\nTier 2 | b\n```");
    const widths = Array.from(container.querySelectorAll<HTMLElement>("figure > div"), (r) => r.style.getPropertyValue("--row-w"));
    expect(widths).toEqual(["40%", "70%", "100%"]);
  });
});
