import { afterEach, describe, expect, it } from "vitest";
import { FEEDBACK_BOARD_KEY, FEEDBACK_SEEN_KEY, feedbackIsNew } from "./config";
import { feedbackSeenKey, isFeedbackNew } from "./FeedbackBoard";

// config.ts copies the board's "seen" check so pages don't load the board to run it.
describe("feedback config", () => {
  afterEach(() => localStorage.clear());

  it("uses the same seen key as the board itself", () => {
    expect(FEEDBACK_SEEN_KEY).toBe(feedbackSeenKey(FEEDBACK_BOARD_KEY));
  });

  it("agrees with the board on new vs seen", () => {
    expect(feedbackIsNew()).toBe(true);
    expect(feedbackIsNew()).toBe(isFeedbackNew(FEEDBACK_BOARD_KEY));
    localStorage.setItem(feedbackSeenKey(FEEDBACK_BOARD_KEY), "1");
    expect(feedbackIsNew()).toBe(false);
    expect(feedbackIsNew()).toBe(isFeedbackNew(FEEDBACK_BOARD_KEY));
  });
});
