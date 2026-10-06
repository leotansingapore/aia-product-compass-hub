import { describe, it, expect, vi, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import PublicPlaybookView from "./PublicPlaybookView";
import PublicFlowView from "./PublicFlowView";

// Every query stays pending, so both pages sit in their loading state: the
// noindex must already be there before any shared content arrives.
vi.mock("@/integrations/supabase/client", () => {
  const pending = new Promise(() => {});
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "order"]) chain[m] = () => chain;
  chain.single = () => pending;
  chain.maybeSingle = () => pending;
  return { supabase: { from: () => chain } };
});

function renderAt(path: string, pattern: string, element: JSX.Element) {
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={pattern} element={element} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

const robots = () =>
  Array.from(document.head.querySelectorAll('meta[name="robots"]')).map((m) => m.getAttribute("content"));

afterEach(() => {
  cleanup();
  document.head.replaceChildren();
});

describe("public share pages stay out of search engines", () => {
  it("shared playbook renders a noindex meta", async () => {
    renderAt("/playbooks/share/abc123", "/playbooks/share/:shareToken", <PublicPlaybookView />);
    await waitFor(() => expect(robots()).toContain("noindex, nofollow"));
  });

  it("shared flow renders a noindex meta", async () => {
    renderAt("/flows/view/abc123", "/flows/view/:flowId", <PublicFlowView />);
    await waitFor(() => expect(robots()).toContain("noindex, nofollow"));
  });

  it("vercel.json sends X-Robots-Tag noindex on both share paths and nowhere else", () => {
    const config = JSON.parse(readFileSync(resolve(__dirname, "../../vercel.json"), "utf8"));
    const noindexSources = (config.headers as Array<{ source: string; headers: Array<{ key: string; value: string }> }>)
      .filter((h) => h.headers.some((x) => x.key.toLowerCase() === "x-robots-tag" && x.value.includes("noindex")))
      .map((h) => h.source)
      .sort();
    expect(noindexSources).toEqual(["/flows/view/(.*)", "/playbooks/share/(.*)"]);
  });
});
