import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "learning-track-overrides";

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
}

export function useTrackOverrides() {
  const [overrides, setOverrides] = useState<TrackOverrides>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

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
  };
}
