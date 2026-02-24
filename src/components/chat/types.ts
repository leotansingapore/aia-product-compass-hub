/**
 * Type definitions for the accessible AI chat interface
 */

export type ChatMode = 'knowledge' | 'sales' | 'objections';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    model?: string;
    tokens?: number;
    error?: string;
  };
}

export interface QuickAction {
  id: string;
  question: string;
  category: string;
  icon?: string;
}

export interface ProductData {
  id?: string;
  name?: string;
  category?: string;
  summary?: string;
  highlights?: string[];
  assistant_id?: string;
  assistant_instructions?: string;
}

export interface ChatStatus {
  isLoading: boolean;
  isConnected: boolean;
  error?: string;
  typingIndicator?: boolean;
}

export interface AccessibilityPreferences {
  announceMessages: boolean;
  announceStatus: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardShortcutsEnabled: boolean;
}

export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  handler: () => void;
}

export interface MessageAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (messageId: string) => void;
  ariaLabel?: string;
}

export interface ChatContainerProps {
  productData?: ProductData;
  initialMessages?: ChatMessage[];
  onSendMessage?: (content: string) => Promise<void>;
  quickActions?: QuickAction[];
  className?: string;
}
