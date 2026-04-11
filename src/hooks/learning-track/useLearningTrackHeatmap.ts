import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeatmapCell {
  user_id: string;
  display_name: string;
  phase_id: string;
  phase_title: string;
  track: "pre_rnf" | "post_rnf";
  completed_count: number;
  total_count: number;
}

export function useLearningTrackHeatmap() {
  return useQuery<HeatmapCell[]>({
    queryKey: ["learning-track-heatmap"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_learning_track_heatmap");
      if (error) throw error;
      return (data ?? []) as unknown as HeatmapCell[];
    },
  });
}
