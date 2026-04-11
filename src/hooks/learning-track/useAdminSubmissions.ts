import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewStatus } from "@/types/learning-track";

export interface AdminSubmissionRow {
  id: string;
  user_id: string;
  item_id: string;
  remarks: string | null;
  submitted_at: string;
  review_status: ReviewStatus;
  review_feedback: string | null;
  item: {
    id: string;
    title: string;
    phase: { title: string; track: "pre_rnf" | "post_rnf" } | null;
  } | null;
  user: { id: string; display_name: string | null } | null;
  files: Array<{
    id: string;
    file_type: string;
    label: string | null;
    storage_path: string | null;
    external_url: string | null;
    content_text: string | null;
  }>;
}

export function useAdminSubmissions(filterStatus: ReviewStatus | "all") {
  return useQuery<AdminSubmissionRow[]>({
    queryKey: ["admin-submissions", filterStatus],
    staleTime: 30 * 1000,
    queryFn: async () => {
      let query = supabase
        .from("learning_track_submissions")
        .select(
          `
          id, user_id, item_id, remarks, submitted_at, review_status, review_feedback,
          item:learning_track_items(id, title, phase:learning_track_phases(title, track)),
          user:profiles(id, display_name),
          files:learning_track_submission_files(*)
        `
        )
        .order("submitted_at", { ascending: true });
      if (filterStatus !== "all") query = query.eq("review_status", filterStatus);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AdminSubmissionRow[];
    },
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      action: "approve" | "request_changes";
      feedback?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("learning_track_submissions")
        .update({
          review_status: params.action === "approve" ? "approved" : "changes_requested",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
          review_feedback: params.feedback ?? null,
        })
        .eq("id", params.submissionId);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      qc.invalidateQueries({ queryKey: ["learning-track-roster"] });
    },
  });
}
