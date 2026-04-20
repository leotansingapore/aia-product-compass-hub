import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import type { LearningTrackContentBlock, LearningTrackPhase, Track } from "@/types/learning-track";

export interface UseLearningTrackPhasesOptions {
  enabled?: boolean;
  /**
   * When true (default for back-compat), content_blocks are fetched inline for
   * every item. Pass `false` from list-view callers (Explorer, PreRnf, PostRnf
   * hub pages) so the initial payload stays small; fetch per-item blocks lazily
   * via `useItemContentBlocks(itemId)` when a lesson is opened.
   */
  includeContent?: boolean;
}

export function useLearningTrackPhases(
  track: Track,
  options: UseLearningTrackPhasesOptions = {},
) {
  const { isAdmin } = useAdmin();
  const enabled = options.enabled ?? true;
  const includeContent = options.includeContent ?? true;
  return useQuery<LearningTrackPhase[]>({
    queryKey: [
      "learning-track-phases",
      track,
      isAdmin ? "admin" : "learner",
      includeContent ? "full" : "lite",
    ],
    staleTime: 5 * 60 * 1000,
    enabled,
    queryFn: async () => {
      const itemsSelect = includeContent
        ? `
          id, phase_id, order_index, title, description,
          objectives, action_items, requires_submission, legacy_id, published_at, prerequisite_item_ids,
          hidden_resources,
          learning_track_content_blocks (
            id, item_id, order_index, block_type, title, body, url, resource_type, resource_id
          )
        `
        : `
          id, phase_id, order_index, title, description,
          objectives, action_items, requires_submission, legacy_id, published_at, prerequisite_item_ids,
          hidden_resources
        `;
      const { data, error } = await supabase
        .from("learning_track_phases")
        .select(
          `id, track, order_index, title, description, published_at, prerequisite_phase_id,
           learning_track_items (${itemsSelect})`
        )
        .eq("track", track)
        .order("order_index", { ascending: true });

      if (error) throw error;

      const phases = (data ?? []).map((p: any) => ({
        id: p.id,
        track: p.track as Track,
        order_index: p.order_index,
        title: p.title,
        description: p.description,
        published_at: p.published_at ?? null,
        prerequisite_phase_id: p.prerequisite_phase_id ?? null,
        items: ((p.learning_track_items ?? []) as any[])
          .sort((a, b) => a.order_index - b.order_index)
          .map((i: any) => ({
            id: i.id,
            phase_id: i.phase_id,
            order_index: i.order_index,
            title: i.title,
            description: i.description,
            objectives: i.objectives,
            action_items: i.action_items,
            requires_submission: i.requires_submission,
            hidden_resources: Array.isArray(i.hidden_resources) ? i.hidden_resources : [],
            legacy_id: i.legacy_id,
            published_at: i.published_at ?? null,
            prerequisite_item_ids: i.prerequisite_item_ids ?? null,
            content_blocks: includeContent
              ? ((i.learning_track_content_blocks ?? []) as any[]).sort(
                  (a, b) => a.order_index - b.order_index,
                )
              : [],
          })),
      }));

      // Non-admins only see published phases/items.
      if (!isAdmin) {
        return phases
          .filter((p) => p.published_at !== null)
          .map((p) => ({ ...p, items: p.items.filter((i) => i.published_at !== null) }));
      }
      return phases;
    },
  });
}

/**
 * Lazy per-item content blocks — loaded only when a lesson is actually opened.
 * Paired with `useLearningTrackPhases(track, { includeContent: false })` to
 * keep the hub list small and defer block payloads to the lesson panel.
 */
export function useItemContentBlocks(
  itemId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled = (options.enabled ?? true) && Boolean(itemId);
  return useQuery<LearningTrackContentBlock[]>({
    queryKey: ["learning-track-item-blocks", itemId],
    staleTime: 5 * 60 * 1000,
    enabled,
    queryFn: async () => {
      if (!itemId) return [];
      const { data, error } = await supabase
        .from("learning_track_content_blocks")
        .select("id, item_id, order_index, block_type, title, body, url, resource_type, resource_id")
        .eq("item_id", itemId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as LearningTrackContentBlock[];
    },
  });
}
