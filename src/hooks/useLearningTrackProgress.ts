import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "learning-track-progress";

interface TrackProgress {
  [itemId: string]: {
    completed: boolean;
    completedAt?: string;
  };
}

export function useLearningTrackProgress() {
  const [progress, setProgress] = useState<TrackProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleItem = useCallback((itemId: string) => {
    setProgress((prev) => {
      const current = prev[itemId];
      if (current?.completed) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { completed: true, completedAt: new Date().toISOString() },
      };
    });
  }, []);

  const isCompleted = useCallback(
    (itemId: string) => !!progress[itemId]?.completed,
    [progress]
  );

  const getCompletedCount = useCallback(
    (itemIds: string[]) => itemIds.filter((id) => progress[id]?.completed).length,
    [progress]
  );

  const getProgressPercent = useCallback(
    (itemIds: string[]) => {
      if (itemIds.length === 0) return 0;
      return Math.round((getCompletedCount(itemIds) / itemIds.length) * 100);
    },
    [getCompletedCount]
  );

  const resetTrack = useCallback((trackId: string, itemIds: string[]) => {
    setProgress((prev) => {
      const next = { ...prev };
      itemIds.forEach((id) => delete next[id]);
      return next;
    });
  }, []);

  return { progress, toggleItem, isCompleted, getCompletedCount, getProgressPercent, resetTrack };
}
