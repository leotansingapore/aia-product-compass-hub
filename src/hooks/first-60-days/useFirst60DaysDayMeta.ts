import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DayMeta = {
  day_number: number;
  slides_url: string | null;
  video_url: string | null;
  video_duration_sec: number | null;
  published: boolean;
  notes: string | null;
};

export function useFirst60DaysDayMeta(dayNumber: number) {
  return useQuery<DayMeta | null>({
    queryKey: ["first-60-days-day-meta", dayNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("first_60_days_day_meta")
        .select("day_number, slides_url, video_url, video_duration_sec, published, notes")
        .eq("day_number", dayNumber)
        .maybeSingle();
      if (error) throw error;
      return (data as DayMeta | null) ?? null;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAllFirst60DaysDayMeta() {
  return useQuery<DayMeta[]>({
    queryKey: ["first-60-days-day-meta", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("first_60_days_day_meta")
        .select("day_number, slides_url, video_url, video_duration_sec, published, notes")
        .order("day_number", { ascending: true })
        .range(0, 99);
      if (error) throw error;
      return (data as DayMeta[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}
