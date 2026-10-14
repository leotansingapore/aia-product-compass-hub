import { describe, expect, it } from "vitest";
import { DAY_SUMMARIES } from "./summaries";
import { nextStop } from "./nextStop";

const recaps = new Set([1, 2]);

describe("First 60 Days next stop", () => {
  it("goes day to day inside a week", () => {
    expect(nextStop(DAY_SUMMARIES, 5, recaps)).toEqual({ kind: "day", dayNumber: 6 });
  });

  it("sends the last day of a week with a recap to that recap, not the next week's first day", () => {
    const lastOfWeek1 = Math.max(...DAY_SUMMARIES.filter((d) => d.week === 1).map((d) => d.dayNumber));
    expect(nextStop(DAY_SUMMARIES, lastOfWeek1, recaps)).toEqual({ kind: "recap", week: 1 });
  });

  it("goes straight on when the week has no recap", () => {
    const lastOfWeek3 = Math.max(...DAY_SUMMARIES.filter((d) => d.week === 3).map((d) => d.dayNumber));
    expect(nextStop(DAY_SUMMARIES, lastOfWeek3, recaps)).toEqual({ kind: "day", dayNumber: lastOfWeek3 + 1 });
  });

  it("has nowhere to go after the last day unless its week has a recap", () => {
    const last = DAY_SUMMARIES[DAY_SUMMARIES.length - 1];
    expect(nextStop(DAY_SUMMARIES, last.dayNumber, recaps)).toBeNull();
    expect(nextStop(DAY_SUMMARIES, last.dayNumber, new Set([last.week]))).toEqual({ kind: "recap", week: last.week });
    expect(nextStop(DAY_SUMMARIES, 999, recaps)).toBeNull();
  });
});
