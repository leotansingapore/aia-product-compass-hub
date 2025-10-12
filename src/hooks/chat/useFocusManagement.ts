import { useCallback, useRef, useEffect } from 'react';
import { createFocusRestorer, trapFocus } from '@/lib/accessibility/aria-helpers';

/**
 * Hook for managing focus in the chat interface
 * Handles focus restoration and trapping for accessibility
 */
export function useFocusManagement() {
  const restoreFocusRef = useRef<(() => void) | null>(null);
  const trapCleanupRef = useRef<(() => void) | null>(null);

  // Save current focus for later restoration
  const saveFocus = useCallback(() => {
    restoreFocusRef.current = createFocusRestorer();
  }, []);

  // Restore previously saved focus
  const restoreFocus = useCallback(() => {
    if (restoreFocusRef.current) {
      restoreFocusRef.current();
      restoreFocusRef.current = null;
    }
  }, []);

  // Trap focus within a container (for modals, dialogs)
  const trapFocusInContainer = useCallback((container: HTMLElement | null) => {
    // Clean up previous trap
    if (trapCleanupRef.current) {
      trapCleanupRef.current();
      trapCleanupRef.current = null;
    }

    if (container) {
      trapCleanupRef.current = trapFocus(container);
    }
  }, []);

  // Release focus trap
  const releaseFocusTrap = useCallback(() => {
    if (trapCleanupRef.current) {
      trapCleanupRef.current();
      trapCleanupRef.current = null;
    }
  }, []);

  // Focus input area
  const focusInput = useCallback((inputRef: React.RefObject<HTMLTextAreaElement>) => {
    inputRef.current?.focus();
  }, []);

  // Focus first message
  const focusFirstMessage = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const firstMessage = containerRef.current?.querySelector('[role="article"]') as HTMLElement;
    firstMessage?.focus();
  }, []);

  // Focus last message
  const focusLastMessage = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const messages = containerRef.current?.querySelectorAll('[role="article"]');
    const lastMessage = messages?.[messages.length - 1] as HTMLElement;
    lastMessage?.focus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trapCleanupRef.current) {
        trapCleanupRef.current();
      }
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocusInContainer,
    releaseFocusTrap,
    focusInput,
    focusFirstMessage,
    focusLastMessage
  };
}
