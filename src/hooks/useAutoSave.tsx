import { useCallback, useEffect, useRef } from 'react';
import { useToast } from './use-toast';

interface UseAutoSaveProps {
  onSave: (content: string) => Promise<void>;
  delay?: number;
}

export function useAutoSave({ onSave, delay = 500 }: UseAutoSaveProps) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const savingRef = useRef(false);

  const debouncedSave = useCallback(async (content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (savingRef.current) return;
      
      try {
        savingRef.current = true;
        await onSave(content);
      } catch (error) {
        toast({
          title: "Failed to save",
          description: "Your changes could not be saved automatically.",
          variant: "destructive",
        });
      } finally {
        savingRef.current = false;
      }
    }, delay);
  }, [onSave, delay, toast]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, isSaving: savingRef.current };
}