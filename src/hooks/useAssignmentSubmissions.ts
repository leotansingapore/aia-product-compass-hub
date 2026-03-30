import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "learning-track-assignment-submissions";

export type SubmissionType = "pdf" | "image" | "url" | "loom" | "text";

export interface AssignmentSubmission {
  id: string;
  type: SubmissionType;
  /** Display label */
  label: string;
  /** URL or data URI */
  value: string;
  submittedAt: string;
}

interface SubmissionsState {
  [itemId: string]: AssignmentSubmission[];
}

export function useAssignmentSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  const getSubmissions = useCallback(
    (itemId: string): AssignmentSubmission[] => submissions[itemId] ?? [],
    [submissions]
  );

  const addSubmission = useCallback(
    (itemId: string, submission: Omit<AssignmentSubmission, "id" | "submittedAt">) => {
      const newSub: AssignmentSubmission = {
        ...submission,
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        submittedAt: new Date().toISOString(),
      };
      setSubmissions((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] ?? []), newSub],
      }));
    },
    []
  );

  const removeSubmission = useCallback(
    (itemId: string, submissionId: string) => {
      setSubmissions((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] ?? []).filter((s) => s.id !== submissionId),
      }));
    },
    []
  );

  const hasSubmissions = useCallback(
    (itemId: string) => (submissions[itemId] ?? []).length > 0,
    [submissions]
  );

  return { getSubmissions, addSubmission, removeSubmission, hasSubmissions };
}
