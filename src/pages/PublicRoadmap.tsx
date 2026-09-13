// PublicRoadmap - /roadmap: FINternship Academy's public page for what people have asked for, what
// is being built, and what has shipped. Open to everyone, signed in or not.
//
// The UI is the shared portal copied verbatim from
// github.com/leotansingapore/feedback-board/client/FeedbackBoard.tsx; the key in
// components/feedback/config names exactly one board on the service, so this page can
// only ever reach FINternship Academy's own posts.

import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";
import { FEEDBACK_API, FEEDBACK_BOARD_KEY } from "@/components/feedback/config";

export default function PublicRoadmap() {
  return (
    <FeedbackBoard
      apiUrl={FEEDBACK_API}
      boardKey={FEEDBACK_BOARD_KEY}
      appName="FINternship Academy"
      homeUrl="/"
    />
  );
}
