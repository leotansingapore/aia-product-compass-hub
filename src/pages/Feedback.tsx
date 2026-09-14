// /feedback: the academy's own public feedback board. Ask for what you need, see what
// others asked for, vote. The UI is the shared component copied verbatim from
// github.com/leotansingapore/feedback-board/client/FeedbackBoard.tsx; the key in
// components/feedback/config.ts names exactly one board on the service.

import { Helmet } from "react-helmet-async";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";
import { FEEDBACK_API, FEEDBACK_BOARD_KEY } from "@/components/feedback/config";

export default function Feedback() {
  const { user } = useSimplifiedAuth();
  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Helmet>
        <title>Feedback - FINternship Academy</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <FeedbackBoard
        apiUrl={FEEDBACK_API}
        boardKey={FEEDBACK_BOARD_KEY}
        appName="FINternship Academy"
        identity={
          user
            ? { id: user.id, name: meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? null, email: user.email ?? null }
            : undefined
        }
        chrome={false}
      />
    </div>
  );
}
