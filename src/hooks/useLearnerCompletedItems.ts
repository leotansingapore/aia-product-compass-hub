import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CompletedItemSource =
  | "first_14_days"
  | "first_60_days"
  | "next_60_days"
  | "product_mastery"
  | "assignments"
  | "videos";

export type CompletedItem = {
  source: CompletedItemSource;
  itemKey: string;
  itemLabel: string;
  completedOn: string;
};

type RpcRow = {
  source: string;
  item_key: string;
  item_label: string;
  completed_on: string;
};

/**
 * Item-level completions behind a learner's leaderboard points, via the
 * `get_learner_completed_items` RPC. The RPC is SECURITY DEFINER and only
 * answers for admins or the learner themself — keep `enabled` aligned with
 * that so peers' expanded rows never fire a call that can only fail.
 */
export function useLearnerCompletedItems(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["learner-completed-items", userId],
    queryFn: async (): Promise<CompletedItem[]> => {
      const { data, error } = await (supabase.rpc as any)(
        "get_learner_completed_items",
        { p_user_id: userId },
      );
      if (error) throw new Error(error.message ?? "Failed to load completed items");
      return ((data ?? []) as RpcRow[]).map((r) => ({
        source: r.source as CompletedItemSource,
        itemKey: r.item_key,
        itemLabel: r.item_label,
        completedOn: r.completed_on,
      }));
    },
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
}
