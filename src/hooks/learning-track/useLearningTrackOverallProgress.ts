import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Track } from "@/types/learning-track";

export interface OverallProgress {
  totalCompleted: number;
  totalItems: number;
  explorerPct: number;
  preRnfPct: number;
  postRnfPct: number;
  combinedPct: number;
  nextItem: { id: string; title: string; track: Track } | null;
}

const TRACK_ORDER: Record<Track, number> = { explorer: 0, pre_rnf: 1, post_rnf: 2 };

export function useLearningTrackOverallProgress(userId: string | undefined) {
  return useQuery<OverallProgress>({
    queryKey: ["learning-track-overall-progress", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: phases, error: phasesErr } = await supabase
        .from("learning_track_phases")
        .select("id, track, order_index, learning_track_items(id, order_index, title)")
        .order("order_index", { ascending: true });
      if (phasesErr) throw phasesErr;

      const { data: progress, error: progressErr } = await supabase
        .from("learning_track_progress")
        .select("item_id, status")
        .eq("user_id", userId!);
      if (progressErr) throw progressErr;

      const completedSet = new Set(
        (progress ?? [])
          .filter((p: any) => p.status === "completed")
          .map((p: any) => p.item_id as string)
      );

      type FlatItem = {
        id: string;
        title: string;
        track: Track;
        phaseOrder: number;
        itemOrder: number;
      };
      const allItems: FlatItem[] = [];
      ((phases ?? []) as any[]).forEach((p) => {
        const track = p.track as Track;
        if (track !== "explorer" && track !== "pre_rnf" && track !== "post_rnf") return;
        ((p.learning_track_items ?? []) as any[]).forEach((i) => {
          allItems.push({
            id: i.id,
            title: i.title,
            track,
            phaseOrder: p.order_index,
            itemOrder: i.order_index,
          });
        });
      });
      allItems.sort((a, b) => {
        if (a.track !== b.track) return TRACK_ORDER[a.track] - TRACK_ORDER[b.track];
        if (a.phaseOrder !== b.phaseOrder) return a.phaseOrder - b.phaseOrder;
        return a.itemOrder - b.itemOrder;
      });

      const explorerItems = allItems.filter((i) => i.track === "explorer");
      const preItems = allItems.filter((i) => i.track === "pre_rnf");
      const postItems = allItems.filter((i) => i.track === "post_rnf");
      const explorerCompleted = explorerItems.filter((i) => completedSet.has(i.id)).length;
      const preCompleted = preItems.filter((i) => completedSet.has(i.id)).length;
      const postCompleted = postItems.filter((i) => completedSet.has(i.id)).length;
      const totalCompleted = explorerCompleted + preCompleted + postCompleted;
      const totalItems = allItems.length;
      const nextItem = allItems.find((i) => !completedSet.has(i.id)) ?? null;

      return {
        totalCompleted,
        totalItems,
        explorerPct: explorerItems.length ? Math.round((explorerCompleted / explorerItems.length) * 100) : 0,
        preRnfPct: preItems.length ? Math.round((preCompleted / preItems.length) * 100) : 0,
        postRnfPct: postItems.length ? Math.round((postCompleted / postItems.length) * 100) : 0,
        combinedPct: totalItems ? Math.round((totalCompleted / totalItems) * 100) : 0,
        nextItem: nextItem
          ? { id: nextItem.id, title: nextItem.title, track: nextItem.track }
          : null,
      };
    },
  });
}
