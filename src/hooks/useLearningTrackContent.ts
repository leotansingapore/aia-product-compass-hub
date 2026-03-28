import { useState, useEffect, useCallback } from "react";
import type { ContentBlock } from "@/data/learningTrackData";

const STORAGE_KEY = "learning-track-content";

interface AllContent {
  [itemId: string]: ContentBlock[];
}

export function useLearningTrackContent() {
  const [content, setContent] = useState<AllContent>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const getBlocks = useCallback(
    (itemId: string): ContentBlock[] => content[itemId] ?? [],
    [content]
  );

  const addBlock = useCallback((itemId: string, block: Omit<ContentBlock, "id">) => {
    const newBlock: ContentBlock = { ...block, id: crypto.randomUUID() };
    setContent((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), newBlock],
    }));
  }, []);

  const updateBlock = useCallback((itemId: string, blockId: string, updates: Partial<ContentBlock>) => {
    setContent((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }));
  }, []);

  const removeBlock = useCallback((itemId: string, blockId: string) => {
    setContent((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((b) => b.id !== blockId),
    }));
  }, []);

  const reorderBlocks = useCallback((itemId: string, blocks: ContentBlock[]) => {
    setContent((prev) => ({
      ...prev,
      [itemId]: blocks,
    }));
  }, []);

  return { getBlocks, addBlock, updateBlock, removeBlock, reorderBlocks };
}
