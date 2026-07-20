import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TestimonialGenerator from "./TestimonialGenerator";

vi.mock("@/hooks/useSimplifiedAuth", () => ({
  useSimplifiedAuth: () => ({ user: { id: "test-user" } }),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderTool() {
  return render(
    <MemoryRouter>
      <TestimonialGenerator />
    </MemoryRouter>,
  );
}

describe("TestimonialGenerator", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds the starter statement bank on first load", () => {
    renderTool();
    expect(screen.getByRole("heading", { name: /Testimonial Generator/i })).toBeInTheDocument();
    // A known starter statement is present as an editable input value.
    expect(
      screen.getByDisplayValue(/Never pushy - I felt they were on my side/i),
    ).toBeInTheDocument();
    // All 15 starters included by default.
    expect(screen.getByText(/15 included/i)).toBeInTheDocument();
  });

  it("adds a custom statement", () => {
    renderTool();
    const input = screen.getByPlaceholderText(/Add your own statement/i);
    fireEvent.change(input, { target: { value: "Made my parents feel at ease too." } });
    fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));
    expect(screen.getByDisplayValue("Made my parents feel at ease too.")).toBeInTheDocument();
    expect(screen.getByText(/16 included/i)).toBeInTheDocument();
  });

  it("untick reduces the included count", () => {
    renderTool();
    const firstToggle = screen.getAllByLabelText("Include this statement")[0];
    fireEvent.click(firstToggle);
    expect(screen.getByText(/14 included/i)).toBeInTheDocument();
  });

  it("assembles a testimonial from picked statements in the preview", () => {
    renderTool();
    const preview = screen.getByText(/what your client sees/i).closest("div")!.parentElement!
      .parentElement as HTMLElement;
    // Tick the first two client-preview checkboxes.
    const previewBoxes = within(preview).getAllByRole("checkbox");
    fireEvent.click(previewBoxes[0]);
    fireEvent.click(previewBoxes[1]);
    expect(screen.getByText(/Their testimonial/i)).toBeInTheDocument();
  });

  it("persists the bank to localStorage", () => {
    renderTool();
    const input = screen.getByPlaceholderText(/Add your own statement/i);
    fireEvent.change(input, { target: { value: "Persisted line." } });
    fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));
    const saved = localStorage.getItem("testimonial-generator-v1:test-user");
    expect(saved).toBeTruthy();
    expect(saved).toContain("Persisted line.");
  });
});
