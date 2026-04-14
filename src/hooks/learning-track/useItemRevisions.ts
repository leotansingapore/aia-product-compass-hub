import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Revisions are written by a DB trigger on every UPDATE to
 * `learning_track_items` — snapshot captures the item + its content_blocks
 * as they existed *before* the update. Reverting replays the snapshot back
 * into the live tables.
 */

export interface ItemRevision {
  id: string;
  item_id: string;
  snapshot: {
    id: string;
    phase_id: string;
    title: string;
    description: string | null;
    objectives: string[] | null;
    action_items: string[] | null;
    requires_submission: boolean;
    hidden_resources: string[];
    order_index: number;
    content_blocks: Array<{
      block_type: string;
      title: string | null;
      body: string | null;
      url: string | null;
      resource_type: string | null;
      resource_id: string | null;
      order_index: number;
    }>;
  };
  changed_by: string | null;
  change_reason: string | null;
  created_at: string;
}

export function useItemRevisions(itemId: string, enabled = true) {
  return useQuery({
    queryKey: ["learning-track-item-revisions", itemId],
    queryFn: async (): Promise<ItemRevision[]> => {
      const { data, error } = await supabase
        .from("learning_track_item_revisions")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as ItemRevision[];
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useRevertItemRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (revision: ItemRevision) => {
      const s = revision.snapshot;

      // Update the item in place (do NOT change phase_id or order_index to
      // avoid unique-constraint collisions; users can reorder afterwards).
      const { error: itemErr } = await supabase
        .from("learning_track_items")
        .update({
          title: s.title,
          description: s.description,
          objectives: s.objectives,
          action_items: s.action_items,
          requires_submission: s.requires_submission,
          hidden_resources: s.hidden_resources,
        })
        .eq("id", revision.item_id);
      if (itemErr) throw itemErr;

      // Replace content blocks wholesale.
      const { error: delErr } = await supabase
        .from("learning_track_content_blocks")
        .delete()
        .eq("item_id", revision.item_id);
      if (delErr) throw delErr;

      if (s.content_blocks && s.content_blocks.length > 0) {
        const rows = s.content_blocks.map((b, idx) => ({
          item_id: revision.item_id,
          block_type: b.block_type as "text" | "link" | "video" | "resource_ref" | "image",
          title: b.title,
          body: b.body,
          url: b.url,
          resource_type: b.resource_type,
          resource_id: b.resource_id,
          order_index: idx,
        }));
        const { error: insErr } = await supabase
          .from("learning_track_content_blocks")
          .insert(rows);
        if (insErr) throw insErr;
      }
    },
    onSuccess: (_, revision) => {
      toast.success("Reverted to earlier version");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
      qc.invalidateQueries({ queryKey: ["learning-track-item-revisions", revision.item_id] });
    },
    onError: () => toast.error("Failed to revert"),
  });
}
