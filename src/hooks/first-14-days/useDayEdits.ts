import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DayEdit } from "@/features/first-14-days/edits";

const TABLE = "first_14_days_day_edits";

/** Someone saved this day after the editor opened; carries when, so the admin can decide. */
export class EditConflictError extends Error {
  constructor(public savedAt: string) {
    super("This day was saved by someone else after you opened it.");
  }
}

type SaveArgs = {
  markdown: string | null;
  baseHash: string;
  /** Newest edit id when the editor opened; null when there was none. */
  expectedLatestId: number | null;
  force?: boolean;
};

// Admin edits for one First 14 Days day, newest first (the last 10 saves).
export function useDayEdits(dayNumber: number) {
  const qc = useQueryClient();
  const queryKey = ["first-14-days-day-edits", dayNumber];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<DayEdit[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, markdown, base_hash, created_at")
        .eq("day_number", dayNumber)
        .order("id", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 14,
    staleTime: 60_000,
    retry: 1,
  });

  const save = useMutation({
    mutationFn: async ({ markdown, baseHash, expectedLatestId, force }: SaveArgs) => {
      if (!force) {
        const { data, error } = await supabase
          .from(TABLE)
          .select("id, created_at")
          .eq("day_number", dayNumber)
          .order("id", { ascending: false })
          .limit(1);
        if (error) throw error;
        const latest = data[0];
        if ((latest?.id ?? null) !== expectedLatestId) throw new EditConflictError(latest.created_at);
      }
      const { error } = await supabase.from(TABLE).insert({ day_number: dayNumber, markdown, base_hash: baseHash });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return { edits: query.data ?? [], isLoading: query.isLoading, isError: query.isError, save };
}
