import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "animated_tour_reset_at";

export function useGlobalTourReset() {
  const [resetAt, setResetAt] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase.from as any)("platform_settings")
          .select("value, updated_at")
          .eq("key", KEY)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setLoaded(true);
          return;
        }
        const raw = data?.value ?? data?.updated_at ?? null;
        if (raw) {
          const iso = typeof raw === "string" ? raw : String(raw);
          const d = new Date(iso);
          if (!Number.isNaN(d.getTime())) setResetAt(d);
        }
      } catch {
        /* table missing — fall back to local-only */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { resetAt, loaded };
}

export async function triggerGlobalTourReset(userId: string | undefined) {
  const nowIso = new Date().toISOString();
  const { error } = await (supabase.from as any)("platform_settings").upsert(
    {
      key: KEY,
      value: nowIso,
      updated_at: nowIso,
      updated_by: userId ?? null,
    },
    { onConflict: "key" }
  );
  if (error) throw error;
  return nowIso;
}
