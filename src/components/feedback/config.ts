// FINternship Academy's board on the feedback service. The key names exactly one board
// there and nothing lists boards, so it can only ever reach this academy's posts.
// Shared by the board page and the assistant's feedback and support doors.
// No import from ./FeedbackBoard here: the sidebar and the assistant dock import this
// file on every page, and that import pulled the whole ~110 KB board in with it.

export const FEEDBACK_API = "https://leotan-feedback.vercel.app/api/v1";
export const FEEDBACK_BOARD_KEY = "fb_2bcc032ed22a0cca11bc0ed2a95ab938e59f96dab3e64967";
export const FEEDBACK_PATH = "/feedback";

/** The board's own "seen" key (feedbackSeenKey in FeedbackBoard.tsx; config.test.ts keeps them equal). */
export const FEEDBACK_SEEN_KEY = `fb_seen_${FEEDBACK_BOARD_KEY.slice(-8)}`;

/** True until the person has opened the board once in this browser; nav entries show New. */
export function feedbackIsNew() {
  try {
    return typeof window !== "undefined" && !localStorage.getItem(FEEDBACK_SEEN_KEY);
  } catch {
    return false;
  }
}
