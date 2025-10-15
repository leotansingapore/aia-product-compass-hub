import { useState, useRef, useCallback, useEffect } from 'react';
import { AccessibilityProvider } from './AccessibilityProvider';
import { ChatHeader } from './ChatHeader';
import { MessageList, MessageListHandle } from './MessageList';
import { InputArea, InputAreaHandle } from './InputArea';
import { QuickActions } from './QuickActions';
import { ChatMessage, QuickAction, ProductData, ChatStatus } from './types';
import { useAnnouncer } from '@/hooks/chat/useAnnouncer';
import { useFocusManagement } from '@/hooks/chat/useFocusManagement';
import { useKeyboardShortcuts } from '@/hooks/chat/useKeyboardShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AccessibleAIChatProps {
  productData?: ProductData;
  className?: string;
}

function AccessibleAIChatInner({ productData, className }: AccessibleAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus>({
    isLoading: false,
    isConnected: true
  });

  const messageListRef = useRef<MessageListHandle>(null);
  const inputAreaRef = useRef<InputAreaHandle>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { announceMessage, announceStatus, announceError } = useAnnouncer();
  const { focusInput } = useFocusManagement();

  // Quick actions for the product
  const quickActions: QuickAction[] = productData
    ? [
        { id: '1', question: `What are the key benefits of ${productData.name}?`, category: 'Benefits' },
        { id: '2', question: `Who is the ideal customer for ${productData.name}?`, category: 'Target Market' },
        { id: '3', question: `How does ${productData.name} compare to competitors?`, category: 'Comparison' },
        { id: '4', question: `What are common objections for ${productData.name}?`, category: 'Sales Tips' },
        { id: '5', question: `What documentation do I need for ${productData.name}?`, category: 'Process' },
        { id: '6', question: `What are the premium payment options for ${productData.name}?`, category: 'Pricing' }
      ]
    : [];

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && productData?.name) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to the ${productData.name} Expert Assistant!**\n\nI'm here to help you with everything about this product. You can:\n\n- Ask specific questions about features and benefits\n- Get sales tips and objection handling advice\n- Learn about target customers and positioning\n- Understand application processes and requirements\n\n**Try one of the quick questions below or ask me anything!** ⚡`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [productData?.name]);

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    if (!productData?.id || !productData?.assistant_id) {
      announceError('Assistant not configured for this product');
      toast({
        title: 'Assistant Not Found',
        description: 'Please configure an assistant for this product first.',
        variant: 'destructive'
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    const streamingMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMessage, streamingMessage]);
    setIsLoading(true);
    setStatus((prev) => ({ ...prev, isLoading: true }));
    announceMessage(content, 'user');
    announceStatus('Sending message');

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'chat',
          productId: productData.id,
          threadId: threadId,
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
      }

      // Update streaming message with response
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...streamingMessage,
          content: data.message,
          isStreaming: false
        };
        return updated;
      });

      announceMessage(data.message, 'assistant');
      announceStatus('Message received');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.slice(0, -1)); // Remove streaming placeholder

      const errorMessage = error.message || 'Failed to send message';
      announceError(errorMessage);
      setStatus((prev) => ({ ...prev, error: errorMessage }));

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [productData, threadId, messages, announceMessage, announceStatus, announceError, toast]);

  // Quick action handler
  const handleQuickAction = useCallback((action: QuickAction) => {
    handleSendMessage(action.question);
  }, [handleSendMessage]);

  // New chat handler
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setStatus({ isLoading: false, isConnected: true });
    inputAreaRef.current?.clear();
    messageListRef.current?.scrollToTop();

    if (productData?.name) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-new',
        role: 'assistant',
        content: `👋 **Welcome back to the ${productData.name} Expert Assistant!**\n\nWhat would you like to know about this product today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }

    announceStatus('Started new chat');
    toast({
      title: 'New Chat',
      description: 'Started a fresh conversation'
    });
  }, [productData, announceStatus, toast]);

  // Copy message handler
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    announceStatus('Copied to clipboard');
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard'
    });
  }, [announceStatus, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      modifiers: ['alt'],
      handler: handleNewChat,
      description: 'Start new chat'
    },
    {
      key: '/',
      modifiers: ['ctrl'],
      handler: () => inputAreaRef.current?.focus(),
      description: 'Focus input'
    },
    {
      key: 'Escape',
      handler: () => inputAreaRef.current?.clear(),
      description: 'Clear input'
    }
  ]);

  if (isMobile) {
    return (
      <div className={cn("h-full flex flex-col bg-background", className)}>
        <ChatHeader
          productData={productData}
          status={status}
          onNewChat={handleNewChat}
          isMobile={isMobile}
        />

        {messages.length <= 1 && (
          <QuickActions
            actions={quickActions}
            onActionClick={handleQuickAction}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        )}

        <MessageList
          ref={messageListRef}
          messages={messages}
          isLoading={isLoading}
          isMobile={isMobile}
          onCopyMessage={handleCopyMessage}
        />

        <InputArea
          ref={inputAreaRef}
          onSend={handleSendMessage}
          isLoading={isLoading}
          isMobile={isMobile}
          placeholder={productData?.name ? `Ask about ${productData.name}...` : 'Ask me anything...'}
          disabled={!productData?.assistant_id}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      <ChatHeader
        productData={productData}
        status={status}
        onNewChat={handleNewChat}
        isMobile={isMobile}
      />

      <div className="flex-1 flex min-h-0">
        {messages.length <= 1 && quickActions.length > 0 && (
          <QuickActions
            actions={quickActions}
            onActionClick={handleQuickAction}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        )}

        <MessageList
          ref={messageListRef}
          messages={messages}
          isLoading={isLoading}
          isMobile={isMobile}
          onCopyMessage={handleCopyMessage}
          className="flex-1"
        />
      </div>

      <InputArea
        ref={inputAreaRef}
        onSend={handleSendMessage}
        isLoading={isLoading}
        isMobile={isMobile}
        placeholder={productData?.name ? `Ask about ${productData.name}...` : 'Ask me anything...'}
        disabled={!productData?.assistant_id}
      />
    </div>
  );
}

// Main export with accessibility provider
export function AccessibleAIChat(props: AccessibleAIChatProps) {
  return (
    <AccessibilityProvider>
      <AccessibleAIChatInner {...props} />
    </AccessibilityProvider>
  );
}
