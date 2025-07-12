import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface ChecklistContextType {
  completedItems: Set<string>;
  completeItem: (itemId: string) => void;
  isItemCompleted: (itemId: string) => boolean;
  getCompletedCount: () => number;
  resetProgress: () => void;
}

const ChecklistContext = createContext<ChecklistContextType>({
  completedItems: new Set(),
  completeItem: () => {},
  isItemCompleted: () => false,
  getCompletedCount: () => 0,
  resetProgress: () => {},
});

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Load progress on mount and when user changes
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`checklist-progress-${user.id}`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          setCompletedItems(new Set(Array.isArray(parsed) ? parsed : []));
        } catch (error) {
          console.warn('Failed to parse checklist progress:', error);
          setCompletedItems(new Set());
        }
      }
    } else {
      setCompletedItems(new Set());
    }
  }, [user]);

  // Save progress whenever completedItems changes
  useEffect(() => {
    if (user && completedItems.size > 0) {
      localStorage.setItem(
        `checklist-progress-${user.id}`, 
        JSON.stringify(Array.from(completedItems))
      );
    }
  }, [completedItems, user]);

  const completeItem = (itemId: string) => {
    console.log('Completing checklist item:', itemId);
    setCompletedItems(prev => new Set([...prev, itemId]));
  };

  const isItemCompleted = (itemId: string) => {
    return completedItems.has(itemId);
  };

  const getCompletedCount = () => {
    return completedItems.size;
  };

  const resetProgress = () => {
    setCompletedItems(new Set());
    if (user) {
      localStorage.removeItem(`checklist-progress-${user.id}`);
    }
  };

  return (
    <ChecklistContext.Provider
      value={{
        completedItems,
        completeItem,
        isItemCompleted,
        getCompletedCount,
        resetProgress,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklistProgress = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklistProgress must be used within a ChecklistProvider');
  }
  return context;
};