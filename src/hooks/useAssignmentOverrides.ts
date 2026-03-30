import { useState, useEffect, useCallback } from "react";
import type { AssignmentSection, AssignmentItem } from "@/data/learningTrackData";

const STORAGE_KEY = "learning-track-assignment-overrides";

interface AssignmentOverrides {
  /** Section-level overrides keyed by section id */
  sections?: Record<string, { title?: string; description?: string }>;
  /** Item title overrides keyed by item id */
  items?: Record<string, { title?: string }>;
  /** Custom items added by admin, keyed by section id */
  addedItems?: Record<string, AssignmentItem[]>;
  /** Removed item ids */
  removedItems?: string[];
  /** Item order overrides: sectionId -> ordered item ids */
  itemOrder?: Record<string, string[]>;
}

export function useAssignmentOverrides() {
  const [overrides, setOverrides] = useState<AssignmentOverrides>(() => {
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

  const getSectionTitle = useCallback(
    (sectionId: string, defaultTitle: string) =>
      overrides.sections?.[sectionId]?.title ?? defaultTitle,
    [overrides]
  );

  const getSectionDescription = useCallback(
    (sectionId: string, defaultDesc?: string) =>
      overrides.sections?.[sectionId]?.description ?? defaultDesc,
    [overrides]
  );

  const setSectionField = useCallback(
    (sectionId: string, field: "title" | "description", value: string) => {
      setOverrides((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: { ...prev.sections?.[sectionId], [field]: value },
        },
      }));
    },
    []
  );

  const getItemTitle = useCallback(
    (itemId: string, defaultTitle: string) =>
      overrides.items?.[itemId]?.title ?? defaultTitle,
    [overrides]
  );

  const setItemTitle = useCallback(
    (itemId: string, title: string) => {
      setOverrides((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [itemId]: { ...prev.items?.[itemId], title },
        },
      }));
    },
    []
  );

  /** Get effective items for a section (default + added - removed, in order) */
  const getEffectiveItems = useCallback(
    (section: AssignmentSection): AssignmentItem[] => {
      const baseItems = section.items.filter(
        (i) => !(overrides.removedItems ?? []).includes(i.id)
      );
      const added = overrides.addedItems?.[section.id] ?? [];
      const allItems = [...baseItems, ...added];

      // Apply ordering if set
      const order = overrides.itemOrder?.[section.id];
      if (order) {
        const ordered: AssignmentItem[] = [];
        for (const id of order) {
          const item = allItems.find((i) => i.id === id);
          if (item) ordered.push(item);
        }
        // Append any items not in the order list
        for (const item of allItems) {
          if (!order.includes(item.id)) ordered.push(item);
        }
        return ordered;
      }
      return allItems;
    },
    [overrides]
  );

  const addItem = useCallback(
    (sectionId: string, title: string) => {
      const newItem: AssignmentItem = {
        id: `custom-${Date.now()}`,
        title,
      };
      setOverrides((prev) => ({
        ...prev,
        addedItems: {
          ...prev.addedItems,
          [sectionId]: [...(prev.addedItems?.[sectionId] ?? []), newItem],
        },
      }));
    },
    []
  );

  const removeItem = useCallback(
    (sectionId: string, itemId: string) => {
      setOverrides((prev) => {
        // If it's a custom item, remove from addedItems
        const addedForSection = prev.addedItems?.[sectionId] ?? [];
        const isCustom = addedForSection.some((i) => i.id === itemId);
        if (isCustom) {
          return {
            ...prev,
            addedItems: {
              ...prev.addedItems,
              [sectionId]: addedForSection.filter((i) => i.id !== itemId),
            },
          };
        }
        // Otherwise mark as removed
        return {
          ...prev,
          removedItems: [...(prev.removedItems ?? []), itemId],
        };
      });
    },
    []
  );

  const reorderItems = useCallback(
    (sectionId: string, orderedIds: string[]) => {
      setOverrides((prev) => ({
        ...prev,
        itemOrder: {
          ...prev.itemOrder,
          [sectionId]: orderedIds,
        },
      }));
    },
    []
  );

  return {
    getSectionTitle,
    getSectionDescription,
    setSectionField,
    getItemTitle,
    setItemTitle,
    getEffectiveItems,
    addItem,
    removeItem,
    reorderItems,
  };
}
