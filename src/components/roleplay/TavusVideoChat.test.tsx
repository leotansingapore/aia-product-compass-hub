import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TavusVideoChat } from "./TavusVideoChat";

const invoke = vi.fn();
const rpc = vi.fn();

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "learner-1" } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...a: unknown[]) => rpc(...a),
    functions: { invoke: (...a: unknown[]) => invoke(...a) },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: vi.fn(),
  },
}));

beforeAll(() => {
  // Camera check on mount: leave it pending, the setup screen still renders.
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia: () => new Promise(() => {}) },
    configurable: true,
  });
});

const scenario = {
  id: "s1",
  title: "First meeting",
  description: "Practice an opener",
  category: "sales" as const,
  difficulty: "beginner" as const,
  duration: "10 min",
  objectives: ["Open warmly"],
};

describe("roleplay recording notice", () => {
  it("tells the learner what is saved and who can read it, above Start, before any recording begins", () => {
    render(
      <MemoryRouter>
        <TavusVideoChat scenario={scenario} />
      </MemoryRouter>,
    );

    const notice = screen.getByText(
      "We save a written transcript of this roleplay, not a video. You and the academy team can read it.",
    );
    const start = screen.getByRole("button", { name: /start roleplay/i });

    expect(notice).toBeVisible();
    // Notice comes before the Start button in reading order.
    expect(notice.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Nothing has been created or recorded yet.
    expect(invoke).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
