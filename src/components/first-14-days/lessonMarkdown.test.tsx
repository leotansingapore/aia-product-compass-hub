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
});
