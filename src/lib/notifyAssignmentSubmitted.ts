import { supabase } from "@/integrations/supabase/client";

interface NotifyArgs {
  userId: string;
  productId: string;
  itemId: string;
  assignmentTitle: string;
  submissionExcerpt?: string | null;
  fileName?: string | null;
}

/**
 * Fire-and-forget assignment-submission notification email to the admin inbox.
 * Wraps the `notify-assignment-submitted` edge function so callers don't have to
 * remember the payload shape. Failures are logged, never surfaced — the
 * learner's `assignment_submissions` insert has already succeeded by the time
 * this fires.
 */
export function notifyAssignmentSubmitted({
  userId,
  productId,
  itemId,
  assignmentTitle,
  submissionExcerpt,
  fileName,
}: NotifyArgs): void {
  void supabase.functions
    .invoke("notify-assignment-submitted", {
      body: {
        user_id: userId,
        product_id: productId,
        item_id: itemId,
        assignment_title: assignmentTitle,
        submission_excerpt: submissionExcerpt ?? null,
        file_name: fileName ?? null,
      },
    })
    .catch((err) => console.warn("Assignment notification email failed:", err));
}
