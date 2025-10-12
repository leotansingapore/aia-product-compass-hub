/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliant helper functions and components
 */

/**
 * Announce message to screen readers using ARIA live regions
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
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
 * Generate unique ID for aria-labelledby and aria-describedby
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get ARIA props for progress indicator
 */
export function getProgressAriaProps(value: number, max: number = 100, min: number = 0) {
  return {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-label': `Progress: ${value} out of ${max}`,
  };
}

/**
 * Get ARIA props for tabs
 */
export function getTabAriaProps(id: string, isSelected: boolean, controls: string) {
  return {
    role: 'tab',
    id,
    'aria-selected': isSelected,
    'aria-controls': controls,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Get ARIA props for tab panels
 */
export function getTabPanelAriaProps(id: string, labelledBy: string, isHidden: boolean) {
  return {
    role: 'tabpanel',
    id,
    'aria-labelledby': labelledBy,
    hidden: isHidden,
    tabIndex: 0,
  };
}

/**
 * Manage focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private previousActiveElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = this.getFocusableElements();
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private getFocusableElements(): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(this.container.querySelectorAll(selectors)) as HTMLElement[];
  }

  activate(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.firstFocusable?.focus();

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.previousActiveElement?.focus();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

/**
 * Visually hidden class for screen-reader-only content
 */
export const visuallyHiddenClass = 'sr-only';

/**
 * Get minimum touch target size (44x44px per WCAG 2.5.5)
 */
export const MINIMUM_TOUCH_TARGET = 44; // pixels
