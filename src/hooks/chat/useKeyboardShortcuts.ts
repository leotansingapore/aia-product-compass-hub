import { useEffect, useCallback, useRef } from 'react';
import { shouldEnableKeyboardShortcuts } from '@/lib/accessibility/aria-helpers';
import { useAccessibility } from '@/components/chat/AccessibilityProvider';

interface ShortcutConfig {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  handler: () => void;
  description: string;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts in the chat interface
 * Respects accessibility preferences and input focus
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const { preferences } = useAccessibility();
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if disabled
    if (!preferences.keyboardShortcutsEnabled) return;

    // Don't trigger shortcuts in input fields (except Escape)
    if (!shouldEnableKeyboardShortcuts() && event.key !== 'Escape') return;

    const pressedKey = event.key.toLowerCase();
    const hasCtrl = event.ctrlKey || event.metaKey; // metaKey for Mac Cmd
    const hasAlt = event.altKey;
    const hasShift = event.shiftKey;

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = shortcut.key.toLowerCase() === pressedKey;
      if (!keyMatches) continue;

      const modifiers = shortcut.modifiers || [];
      const ctrlMatches = modifiers.includes('ctrl') ? hasCtrl : !hasCtrl;
      const altMatches = modifiers.includes('alt') ? hasAlt : !hasAlt;
      const shiftMatches = modifiers.includes('shift') ? hasShift : !hasShift;

      if (ctrlMatches && altMatches && shiftMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [preferences.keyboardShortcutsEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
    isEnabled: preferences.keyboardShortcutsEnabled
  };
}
