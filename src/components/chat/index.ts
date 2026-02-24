/**
 * Accessible AI Chat Interface
 *
 * A fully accessible, WCAG 2.1 Level AA compliant chat interface
 * with keyboard navigation, screen reader support, and modern UX.
 */

export { AccessibleAIChat } from './AccessibleAIChat';
export { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';
export { Message } from './Message';
export { MessageList } from './MessageList';
export { InputArea } from './InputArea';
export { ChatHeader } from './ChatHeader';
export { QuickActions } from './QuickActions';

export type {
  ChatMessage,
  ChatMode,
  QuickAction,
  ProductData,
  ChatStatus,
  AccessibilityPreferences,
  KeyboardShortcut,
  MessageAction,
  ChatContainerProps
} from './types';
