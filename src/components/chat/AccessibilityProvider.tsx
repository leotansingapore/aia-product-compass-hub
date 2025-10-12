import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AccessibilityPreferences } from './types';
import { prefersReducedMotion, prefersHighContrast, announceToScreenReader } from '@/lib/accessibility/aria-helpers';

interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
  initialPreferences?: Partial<AccessibilityPreferences>;
}

export function AccessibilityProvider({ children, initialPreferences }: AccessibilityProviderProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => ({
    announceMessages: true,
    announceStatus: true,
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    keyboardShortcutsEnabled: true,
    ...initialPreferences
  }));

  // Listen for system preference changes
  useEffect(() => {
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (preferences.announceMessages || priority === 'assertive') {
      announceToScreenReader(message, priority);
    }
  }, [preferences.announceMessages]);

  const value: AccessibilityContextValue = {
    preferences,
    updatePreferences,
    announce
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader only announcements container */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="chat-announcements"
      />
    </AccessibilityContext.Provider>
  );
}
