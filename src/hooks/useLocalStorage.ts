import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(nextValue));
      } catch {
        console.warn(`Failed to save "${key}" to localStorage`);
      }
      return nextValue;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      console.warn(`Failed to remove "${key}" from localStorage`);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        sessionStorage.setItem(key, JSON.stringify(nextValue));
      } catch {
        console.warn(`Failed to save "${key}" to sessionStorage`);
      }
      return nextValue;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}
