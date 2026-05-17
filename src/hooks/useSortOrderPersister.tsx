import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Returns a function that resequences a list of (table, id) rows by their new
 * order and persists the change. Sort orders are renumbered in 10-increments
 * so future inserts can slot between siblings without a full resequence —
 * same convention used by `CategoryTreeEditor.renumber()`.
 *
 * Updates are sent in parallel — fine for the ~10-20 sibling rows this is
 * called with. If a row fails, we toast and rely on the caller's refetch to
 * roll the UI back to the DB truth.
 */
export function useSortOrderPersister(table: "categories" | "products") {
  return useCallback(
    async (orderedIds: string[], onSuccess?: () => void) => {
      const updates = orderedIds.map((id, i) =>
        supabase
          .from(table)
          .update({ sort_order: (i + 1) * 10 })
          .eq("id", id),
      );
      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) {
        toast.error("Failed to save order");
        console.error(`[sort-order:${table}]`, firstError);
        return;
      }
      toast.success("Order saved");
      onSuccess?.();
    },
    [table],
  );
}
