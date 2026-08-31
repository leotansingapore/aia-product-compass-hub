import { describe, it, expect } from "vitest";
import { isTourLandingPath } from "./tourStorage";

/**
 * Locks the fix for "the welcome tour opens on top of a shared link".
 *
 * The 8-slide tour used to fire on ANY route 600ms after landing, so anyone
 * who followed a playbook or lesson link a colleague sent them got the tour
 * over the page they were sent and had to dismiss it first.
 *
 * The rule: the tour may open itself on the app's own landing surfaces only.
 * Anything deeper is content somebody navigated to on purpose.
 */
describe("isTourLandingPath", () => {
  it("allows the app home", () => {
    expect(isTourLandingPath("/")).toBe(true);
  });

  it("allows the learning-track index and a track's own home page", () => {
    expect(isTourLandingPath("/learning-track")).toBe(true);
    expect(isTourLandingPath("/learning-track/first-14-days")).toBe(true);
    expect(isTourLandingPath("/learning-track/first-60-days")).toBe(true);
    expect(isTourLandingPath("/learning-track/next-60-days")).toBe(true);
  });

  it("ignores a trailing slash", () => {
    expect(isTourLandingPath("/learning-track/")).toBe(true);
    expect(isTourLandingPath("/learning-track/first-14-days/")).toBe(true);
    expect(isTourLandingPath("")).toBe(true);
  });

  it("holds the tour back on a shared playbook link", () => {
    expect(isTourLandingPath("/playbooks/7ebe4510-69e4-48ec-b49c-e7e0597bb6f3")).toBe(false);
    expect(isTourLandingPath("/playbooks")).toBe(false);
    expect(isTourLandingPath("/playbooks/share/abc123")).toBe(false);
  });

  it("holds the tour back on a specific lesson under a track", () => {
    expect(isTourLandingPath("/learning-track/first-14-days/day/3")).toBe(false);
    expect(isTourLandingPath("/learning-track/pre-rnf/assignments/case-study-competition")).toBe(
      false,
    );
  });

  it("holds the tour back on other deep content routes", () => {
    expect(isTourLandingPath("/product/proachiever")).toBe(false);
    expect(isTourLandingPath("/cmfas/module/m9")).toBe(false);
    expect(isTourLandingPath("/roleplay")).toBe(false);
    expect(isTourLandingPath("/bookmarks")).toBe(false);
  });
});
