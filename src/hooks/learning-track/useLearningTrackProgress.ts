import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ItemStatus } from "@/types/learning-track";

interface ProgressRow {
  item_id: string;
  status: ItemStatus;
  completed_at: string | null;
}

export function useLearningTrackProgress(userId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery<Record<string, ProgressRow>>({
    queryKey: ["learning-track-progress", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_progress")
        .select("item_id, status, completed_at")
        .eq("user_id", userId!);
      if (error) throw error;
      const map: Record<string, ProgressRow> = {};
      (data ?? []).forEach((row: any) => {
        map[row.item_id] = {
          item_id: row.item_id,
          status: row.status as ItemStatus,
          completed_at: row.completed_at,
        };
      });
      return map;
    },
  });

  const setStatus = useMutation({
    mutationFn: async (params: { itemId: string; status: ItemStatus }) => {
      if (!userId) throw new Error("Not signed in");
      const completedAt = params.status === "completed" ? new Date().toISOString() : null;
      const { error } = await supabase.from("learning_track_progress").upsert(
        {
          user_id: userId,
          item_id: params.itemId,
          status: params.status,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_id" }
      );
      if (error) throw error;
    },
    onMutate: async (params) => {
      await qc.cancelQueries({ queryKey: ["learning-track-progress", userId] });
      const previous = qc.getQueryData<Record<string, ProgressRow>>(["learning-track-progress", userId]);
      qc.setQueryData<Record<string, ProgressRow>>(["learning-track-progress", userId], (old) => ({
        ...(old ?? {}),
        [params.itemId]: {
          item_id: params.itemId,
          status: params.status,
          completed_at: params.status === "completed" ? new Date().toISOString() : null,
        },
      }));
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      console.error("setStatus failed:", err);
      if (ctx?.previous) qc.setQueryData(["learning-track-progress", userId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-progress", userId] });
      qc.invalidateQueries({ queryKey: ["learning-track-overall-progress", userId] });
    },
  });

  const isCompleted = (itemId: string) => query.data?.[itemId]?.status === "completed";
  const getStatus = (itemId: string): ItemStatus =>
    query.data?.[itemId]?.status ?? "not_started";

  return {
    progress: query.data ?? {},
    isLoading: query.isLoading,
    setStatus,
    isCompleted,
    getStatus,
  };
}
