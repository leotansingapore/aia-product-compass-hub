import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewStatus, FileType } from "@/types/learning-track";

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_type: FileType;
  label: string | null;
  storage_path: string | null;
  external_url: string | null;
  content_text: string | null;
}

export interface Submission {
  id: string;
  user_id: string;
  item_id: string;
  remarks: string | null;
  submitted_at: string;
  review_status: ReviewStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_feedback: string | null;
  files: SubmissionFile[];
}

export function useUserSubmissionForItem(userId: string | undefined, itemId: string | undefined) {
  return useQuery<Submission | null>({
    queryKey: ["learning-track-submission", userId, itemId],
    enabled: !!userId && !!itemId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_submissions")
        .select("*, files:learning_track_submission_files(*)")
        .eq("user_id", userId!)
        .eq("item_id", itemId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown) as Submission | null;
    },
  });
}

export function useUpsertSubmission(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; remarks: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("learning_track_submissions")
        .upsert(
          {
            user_id: userId,
            item_id: params.itemId,
            remarks: params.remarks,
            review_status: "pending",
            reviewed_at: null,
            reviewed_by: null,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: "user_id,item_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
      qc.invalidateQueries({ queryKey: ["learning-track-progress", userId] });
    },
  });
}

export function useUploadSubmissionFile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      itemId: string;
      file: File;
      fileType: FileType;
      label?: string;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const ext = params.file.name.split(".").pop() ?? "bin";
      const path = `${userId}/${params.itemId}/${params.submissionId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("learning-track-submissions")
        .upload(path, params.file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { error: rowErr } = await supabase.from("learning_track_submission_files").insert({
        submission_id: params.submissionId,
        file_type: params.fileType,
        label: params.label ?? params.file.name,
        storage_path: path,
      });
      if (rowErr) throw rowErr;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}

export function useAddSubmissionLink(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      itemId: string;
      fileType: Extract<FileType, "url" | "loom" | "text">;
      url?: string;
      text?: string;
      label?: string;
    }) => {
      const { error } = await supabase.from("learning_track_submission_files").insert({
        submission_id: params.submissionId,
        file_type: params.fileType,
        label: params.label ?? null,
        external_url: params.url ?? null,
        content_text: params.text ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}

export function useDeleteSubmissionFile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { fileId: string; storagePath: string | null; itemId: string }) => {
      if (params.storagePath) {
        await supabase.storage.from("learning-track-submissions").remove([params.storagePath]);
      }
      const { error } = await supabase
        .from("learning_track_submission_files")
        .delete()
        .eq("id", params.fileId);
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}
