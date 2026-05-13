import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

export function useAutoFillVideoDuration(productId: string | undefined) {
  const { isAdmin } = useAdmin();
  const inFlight = useRef<Set<string>>(new Set());

  return useCallback(
    async (videoId: string | undefined, seconds: number | null | undefined) => {
      if (!isAdmin || !productId || !videoId) return;
      const rounded = Math.floor(seconds ?? 0);
      if (!Number.isFinite(rounded) || rounded <= 0) return;
      const key = `${productId}:${videoId}`;
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);
      try {
        const { data: prod } = await supabase
          .from("products")
          .select("training_videos")
          .eq("id", productId)
          .single();
        const arr = Array.isArray(prod?.training_videos)
          ? ([...(prod!.training_videos as unknown as Array<Record<string, unknown>>)])
          : [];
        const idx = arr.findIndex((v) => (v as { id?: string })?.id === videoId);
        if (idx < 0) return;
        const existing = Number((arr[idx] as { duration?: number }).duration ?? 0);
        if (existing >= rounded) return;
        arr[idx] = { ...arr[idx], duration: rounded };
        await supabase
          .from("products")
          .update({ training_videos: arr as unknown as never })
          .eq("id", productId);
      } catch (e) {
        if (import.meta.env.DEV) console.warn("auto-fill duration failed", e);
      } finally {
        inFlight.current.delete(key);
      }
    },
    [isAdmin, productId],
  );
}
