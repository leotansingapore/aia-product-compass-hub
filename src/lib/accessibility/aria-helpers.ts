/**
 * ARIA and accessibility utility functions
 * Following WAI-ARIA best practices and WCAG 2.1 Level AA guidelines
 */

/**
 * Generate a unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp for screen readers
 */
export function formatTimeForA11y(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Create accessible label for messages
 */
export function createMessageAriaLabel(
  role: 'user' | 'assistant',
  content: string,
  timestamp: Date
): string {
  const timeStr = formatTimeForA11y(timestamp);
  const roleStr = role === 'user' ? 'You' : 'Assistant';
  const preview = content.substring(0, 100);

  return `${roleStr} said, ${timeStr}: ${preview}${content.length > 100 ? '...' : ''}`;
}

/**
 * Get ARIA live region politeness level based on message type
 */
export function getAriaLivePoliteness(
  isError: boolean,
  isImportant: boolean
): 'off' | 'polite' | 'assertive' {
  if (isError) return 'assertive';
  if (isImportant) return 'assertive';
  return 'polite';
}

/**
 * Check if keyboard shortcuts should be enabled
 */
export function shouldEnableKeyboardShortcuts(): boolean {
  // Disable in input fields to avoid conflicts
  const activeElement = document.activeElement;
  const tagName = activeElement?.tagName.toLowerCase();

  return !['input', 'textarea', 'select'].includes(tagName || '');
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches
  );
}

/**
 * Announce message to screen readers
 * Uses a live region to announce content
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get accessible keyboard shortcut description
 */
export function formatKeyboardShortcut(
  key: string,
  modifiers: string[] = []
): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierMap: Record<string, string> = {
    ctrl: isMac ? '⌘' : 'Ctrl',
    alt: isMac ? '⌥' : 'Alt',
    shift: isMac ? '⇧' : 'Shift',
    meta: isMac ? '⌘' : 'Win'
  };

  const parts = [
    ...modifiers.map(m => modifierMap[m] || m),
    key.toUpperCase()
  ];

  return parts.join(isMac ? '' : '+');
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  firstFocusable?.focus();

  return () => container.removeEventListener('keydown', handleTabKey);
}

/**
 * Restore focus to previous element
 */
export function createFocusRestorer(): () => void {
  const previouslyFocused = document.activeElement as HTMLElement;

  return () => {
    previouslyFocused?.focus();
  };
}
