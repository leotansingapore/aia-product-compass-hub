import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth as useAuth } from "@/hooks/useSimplifiedAuth";

const LOCAL_STORAGE_KEY = "learning-track-overrides";

/** Partial overrides for track items — only stores fields that differ from defaults */
interface TrackOverrides {
  /** Phase-level overrides keyed by phase id */
  phases?: Record<string, { title?: string; description?: string }>;
  /** Item-level overrides keyed by item id */
  items?: Record<string, {
    title?: string;
    description?: string;
    objectives?: string[];
    actionItems?: string[];
  }>;
  /** Hidden item ids */
  hiddenItems?: string[];
}

export function useTrackOverrides() {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<TrackOverrides>(() => {
    // Load from localStorage as initial/fallback value
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch from Supabase on mount
  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }

    const fetchOverrides = async () => {
      const { data, error } = await supabase
        .from('learning_track_overrides')
        .select('overrides')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.overrides) {
        const dbOverrides = data.overrides as unknown as TrackOverrides;
        setOverrides(dbOverrides);
        // Sync to localStorage as cache
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dbOverrides));
      }
      setLoaded(true);
    };

    fetchOverrides();
  }, [user]);

  // Debounced save to Supabase whenever overrides change
  useEffect(() => {
    if (!loaded || !user) return;

    // Always keep localStorage in sync
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));

    // Debounce the Supabase write
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('learning_track_overrides')
        .upsert(
          {
            user_id: user.id,
            overrides: overrides as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Failed to save track overrides:', error);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [overrides, loaded, user]);

  // Phase overrides
  const getPhaseTitle = useCallback(
    (phaseId: string, defaultTitle: string) =>
      overrides.phases?.[phaseId]?.title ?? defaultTitle,
    [overrides]
  );

  const getPhaseDescription = useCallback(
    (phaseId: string, defaultDesc: string) =>
      overrides.phases?.[phaseId]?.description ?? defaultDesc,
    [overrides]
  );

  const setPhaseField = useCallback(
    (phaseId: string, field: "title" | "description", value: string) => {
      setOverrides((prev) => ({
        ...prev,
        phases: {
          ...prev.phases,
          [phaseId]: { ...prev.phases?.[phaseId], [field]: value },
        },
      }));
    },
    []
  );

  // Item overrides
  const getItemTitle = useCallback(
    (itemId: string, defaultTitle: string) =>
      overrides.items?.[itemId]?.title ?? defaultTitle,
    [overrides]
  );

  const getItemDescription = useCallback(
    (itemId: string, defaultDesc: string) =>
      overrides.items?.[itemId]?.description ?? defaultDesc,
    [overrides]
  );

  const getItemObjectives = useCallback(
    (itemId: string, defaults: string[]) =>
      overrides.items?.[itemId]?.objectives ?? defaults,
    [overrides]
  );

  const getItemActionItems = useCallback(
    (itemId: string, defaults: string[]) =>
      overrides.items?.[itemId]?.actionItems ?? defaults,
    [overrides]
  );

  const setItemField = useCallback(
    (itemId: string, field: "title" | "description", value: string) => {
      setOverrides((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [itemId]: { ...prev.items?.[itemId], [field]: value },
        },
      }));
    },
    []
  );

  const setItemObjectives = useCallback(
    (itemId: string, objectives: string[]) => {
      setOverrides((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [itemId]: { ...prev.items?.[itemId], objectives },
        },
      }));
    },
    []
  );

  const setItemActionItems = useCallback(
    (itemId: string, actionItems: string[]) => {
      setOverrides((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [itemId]: { ...prev.items?.[itemId], actionItems },
        },
      }));
    },
    []
  );

  const isItemHidden = useCallback(
    (itemId: string) => overrides.hiddenItems?.includes(itemId) ?? false,
    [overrides]
  );

  const hideItem = useCallback(
    (itemId: string) => {
      setOverrides((prev) => ({
        ...prev,
        hiddenItems: [...(prev.hiddenItems ?? []), itemId],
      }));
    },
    []
  );

  const unhideItem = useCallback(
    (itemId: string) => {
      setOverrides((prev) => ({
        ...prev,
        hiddenItems: (prev.hiddenItems ?? []).filter((id) => id !== itemId),
      }));
    },
    []
  );

  return {
    getPhaseTitle,
    getPhaseDescription,
    setPhaseField,
    getItemTitle,
    getItemDescription,
    getItemObjectives,
    getItemActionItems,
    setItemField,
    setItemObjectives,
    setItemActionItems,
    isItemHidden,
    hideItem,
    unhideItem,
  };
}
