// FINternship Academy's board on the feedback service. The key names exactly one board
// there and nothing lists boards, so it can only ever reach this academy's posts.
// Shared by the board page and the assistant's feedback and support doors.
import { isFeedbackNew } from "./FeedbackBoard";

export const FEEDBACK_API = "https://leotan-feedback.vercel.app/api/v1";
export const FEEDBACK_BOARD_KEY = "fb_2bcc032ed22a0cca11bc0ed2a95ab938e59f96dab3e64967";
export const FEEDBACK_PATH = "/feedback";

/** True until the person has opened the board once in this browser; nav entries show New. */
export function feedbackIsNew() {
  return isFeedbackNew(FEEDBACK_BOARD_KEY);
}
