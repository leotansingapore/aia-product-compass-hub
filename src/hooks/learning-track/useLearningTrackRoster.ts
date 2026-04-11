import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RosterRow {
  user_id: string;
  display_name: string;
  pre_rnf_progress_pct: number;
  post_rnf_progress_pct: number;
  pending_submissions: number;
  last_activity: string | null;
}

export function useLearningTrackRoster() {
  return useQuery<RosterRow[]>({
    queryKey: ["learning-track-roster"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_learning_track_roster");
      if (error) throw error;
      return (data ?? []) as unknown as RosterRow[];
    },
  });
}
