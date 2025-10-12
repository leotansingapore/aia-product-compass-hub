import { useCallback } from 'react';
import { useAccessibility } from '@/components/chat/AccessibilityProvider';

/**
 * Hook for announcing messages to screen readers
 * Uses the accessibility context to respect user preferences
 */
export function useAnnouncer() {
  const { announce, preferences } = useAccessibility();

  const announceMessage = useCallback(
    (content: string, role: 'user' | 'assistant') => {
      if (!preferences.announceMessages) return;

      const prefix = role === 'user' ? 'You said:' : 'Assistant replied:';
      const message = `${prefix} ${content}`;

      announce(message, 'polite');
    },
    [announce, preferences.announceMessages]
  );

  const announceStatus = useCallback(
    (status: string, isError = false) => {
      if (!preferences.announceStatus && !isError) return;

      announce(status, isError ? 'assertive' : 'polite');
    },
    [announce, preferences.announceStatus]
  );

  const announceNewMessage = useCallback(() => {
    if (!preferences.announceMessages) return;
    announce('New message received', 'polite');
  }, [announce, preferences.announceMessages]);

  const announceTyping = useCallback(() => {
    if (!preferences.announceStatus) return;
    announce('Assistant is typing', 'polite');
  }, [announce, preferences.announceStatus]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  return {
    announceMessage,
    announceStatus,
    announceNewMessage,
    announceTyping,
    announceError
  };
}
