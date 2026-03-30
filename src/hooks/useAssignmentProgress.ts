import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "learning-track-assignments";

interface AssignmentProgress {
  [itemId: string]: {
    completed: boolean;
    completedAt?: string;
    remarks?: string;
  };
}

export function useAssignmentProgress() {
  const [progress, setProgress] = useState<AssignmentProgress>(() => {
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
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: { completed: true, completedAt: new Date().toISOString() },
      };
    });
  }, []);

  const setRemarks = useCallback((itemId: string, remarks: string) => {
    setProgress((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], completed: prev[itemId]?.completed ?? false, remarks },
    }));
  }, []);

  const isCompleted = useCallback(
    (itemId: string) => !!progress[itemId]?.completed,
    [progress]
  );

  const getCompletedAt = useCallback(
    (itemId: string) => progress[itemId]?.completedAt ?? null,
    [progress]
  );

  const getRemarks = useCallback(
    (itemId: string) => progress[itemId]?.remarks ?? "",
    [progress]
  );

  const getCompletedCount = useCallback(
    (itemIds: string[]) => itemIds.filter((id) => progress[id]?.completed).length,
    [progress]
  );

  return { progress, toggleItem, isCompleted, getCompletedAt, getRemarks, setRemarks, getCompletedCount };
}
