import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import type { LearningTrackPhase, Track } from "@/types/learning-track";

export function useLearningTrackPhases(track: Track) {
  const { isAdmin } = useAdmin();
  return useQuery<LearningTrackPhase[]>({
    queryKey: ["learning-track-phases", track, isAdmin ? "admin" : "learner"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_phases")
        .select(
          `
          id, track, order_index, title, description, published_at,
          learning_track_items (
            id, phase_id, order_index, title, description,
            objectives, action_items, requires_submission, legacy_id, published_at,
            learning_track_content_blocks (
              id, item_id, order_index, block_type, title, body, url, resource_type, resource_id
            )
          )
        `
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
            hidden_resources: [],
            legacy_id: i.legacy_id,
            published_at: i.published_at ?? null,
            content_blocks: ((i.learning_track_content_blocks ?? []) as any[]).sort(
              (a, b) => a.order_index - b.order_index
            ),
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
