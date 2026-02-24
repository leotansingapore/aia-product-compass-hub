import { useState, useRef, useCallback, useEffect } from 'react';
import { AccessibilityProvider } from './AccessibilityProvider';
import { ChatHeader } from './ChatHeader';
import { ChatModeSelector } from './ChatModeSelector';
import { MessageList, MessageListHandle } from './MessageList';
import { InputArea, InputAreaHandle } from './InputArea';
import { QuickActions } from './QuickActions';
import { ChatMessage, QuickAction, ProductData, ChatStatus, ChatMode } from './types';
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

// ── Mode-specific config ──────────────────────────────────────────────

const modeWelcome: Record<ChatMode, (name: string) => string> = {
  knowledge: (name) =>
    `🔍 **${name} — Knowledge Q&A**\n\nAsk me anything about this product and I'll give you concise, factual answers. Think of me as your product encyclopedia.\n\n**Try a quick question below!**`,
  sales: (name) =>
    `📈 **${name} — Sales Coach**\n\nI'll help you position this product, craft elevator pitches, and close deals. Let's sharpen your sales game!\n\n**Pick a prompt below to get started.**`,
  objections: (name) =>
    `🛡️ **${name} — Objection Handling**\n\nPractice handling client pushbacks using the 4-step framework:\n1. **Acknowledge** — validate the concern\n2. **Common Ground** — relate to them\n3. **Different Perspective** — reframe the value\n4. **Safety Valve** — give them control\n\n**Choose a scenario below!**`,
  roleplay: (name) =>
    `🎭 **${name} — Role Play**\n\nI'll act as a **skeptical client**. Your job is to pitch ${name} and handle my questions and pushbacks.\n\nWhen you're done, type **"end session"** and I'll score your performance across key areas.\n\n**Pick a client profile below or just start pitching!**`,
};

const modePlaceholder: Record<ChatMode, (name?: string) => string> = {
  knowledge: (n) => n ? `Ask a question about ${n}...` : 'Ask a factual question...',
  sales: (n) => n ? `How do I sell ${n}?` : 'Ask for sales tips...',
  objections: () => 'Type a client objection to practice...',
  roleplay: () => 'Start your pitch or respond to the client...',
};

function getQuickActions(mode: ChatMode, productData?: ProductData): QuickAction[] {
  const name = productData?.name || 'this product';
  const actions: Record<ChatMode, QuickAction[]> = {
    knowledge: [
      { id: 'k1', question: `What are the key features of ${name}?`, category: 'Features' },
      { id: 'k2', question: `What are the charges and fees?`, category: 'Charges' },
      { id: 'k3', question: `How does the premium payment work?`, category: 'Premiums' },
      { id: 'k4', question: `What are the fund options available?`, category: 'Funds' },
      { id: 'k5', question: `What is the lock-in period?`, category: 'Terms' },
      { id: 'k6', question: `What bonuses or boosters are included?`, category: 'Bonuses' },
    ],
    sales: [
      { id: 's1', question: `Give me a 2-minute elevator pitch for ${name}`, category: 'Pitch' },
      { id: 's2', question: `Who is the ideal customer for ${name}?`, category: 'Target' },
      { id: 's3', question: `How to position ${name} against competitors?`, category: 'Positioning' },
      { id: 's4', question: `What closing techniques work best?`, category: 'Closing' },
      { id: 's5', question: `Give me 3 talking points for a client meeting`, category: 'Talking Points' },
      { id: 's6', question: `What analogies can I use to explain ${name}?`, category: 'Analogies' },
    ],
    objections: [
      { id: 'o1', question: `Client says "${name} is too expensive"`, category: 'Price' },
      { id: 'o2', question: `Client says "I want to wait and think about it"`, category: 'Timing' },
      { id: 'o3', question: `Client says "I already have a similar policy"`, category: 'Existing' },
      { id: 'o4', question: `Client says "I don't trust insurance companies"`, category: 'Trust' },
      { id: 'o5', question: `Client says "My friend recommended a different product"`, category: 'Competition' },
      { id: 'o6', question: `Client says "I'd rather invest on my own"`, category: 'DIY' },
    ],
    roleplay: [
      { id: 'r1', question: `I'm a 30-year-old professional saving for retirement. Pitch me ${name}.`, category: 'Young Pro' },
      { id: 'r2', question: `I'm a parent wanting to save for my child's education. Why ${name}?`, category: 'Parent' },
      { id: 'r3', question: `I already have investments. Convince me I need ${name} too.`, category: 'Experienced' },
      { id: 'r4', question: `I'm risk-averse and prefer fixed deposits. Why should I consider ${name}?`, category: 'Conservative' },
      { id: 'r5', question: `I'm a high-net-worth individual. Is ${name} worth my time?`, category: 'HNW' },
      { id: 'r6', question: `end session`, category: 'Score Me' },
    ],
  };
  return actions[mode];
}

// ── Inner component ───────────────────────────────────────────────────

function AccessibleAIChatInner({ productData, className }: AccessibleAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('knowledge');
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

  const quickActions = getQuickActions(chatMode, productData);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && productData?.name) {
      setMessages([{
        id: `welcome-${chatMode}`,
        role: 'assistant',
        content: modeWelcome[chatMode](productData.name),
        timestamp: new Date()
      }]);
    }
  }, [productData?.name, chatMode]);

  // Mode change handler
  const handleModeChange = useCallback((newMode: ChatMode) => {
    setChatMode(newMode);
    setMessages([]);
    setThreadId(null);
    setStatus({ isLoading: false, isConnected: true });
    inputAreaRef.current?.clear();
    messageListRef.current?.scrollToTop();
    announceStatus(`Switched to ${newMode} mode`);
  }, [announceStatus]);

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    if (!productData?.id) {
      announceError('Product not configured');
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
      const { data, error } = await supabase.functions.invoke('product-knowledge-chat', {
        body: {
          productId: productData.id,
          mode: chatMode,
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      // Handle streaming response
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: fullContent,
                    isStreaming: true
                  };
                  return updated;
                });
              }
            } catch { /* skip malformed chunks */ }
          }
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: fullContent,
            isStreaming: false
          };
          return updated;
        });

        announceMessage(fullContent, 'assistant');
      } else if (data?.message) {
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
      }

      if (data?.threadId && !threadId) {
        setThreadId(data.threadId);
      }

      announceStatus('Message received');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.slice(0, -1));

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
  }, [productData, threadId, messages, chatMode, announceMessage, announceStatus, announceError, toast]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    handleSendMessage(action.question);
  }, [handleSendMessage]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setStatus({ isLoading: false, isConnected: true });
    inputAreaRef.current?.clear();
    messageListRef.current?.scrollToTop();

    if (productData?.name) {
      setMessages([{
        id: `welcome-new-${Date.now()}`,
        role: 'assistant',
        content: modeWelcome[chatMode](productData.name),
        timestamp: new Date()
      }]);
    }

    announceStatus('Started new chat');
    toast({ title: 'New Chat', description: 'Started a fresh conversation' });
  }, [productData, chatMode, announceStatus, toast]);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    announceStatus('Copied to clipboard');
    toast({ title: 'Copied', description: 'Message copied to clipboard' });
  }, [announceStatus, toast]);

  useKeyboardShortcuts([
    { key: 'n', modifiers: ['alt'], handler: handleNewChat, description: 'Start new chat' },
    { key: '/', modifiers: ['ctrl'], handler: () => inputAreaRef.current?.focus(), description: 'Focus input' },
    { key: 'Escape', handler: () => inputAreaRef.current?.clear(), description: 'Clear input' }
  ]);

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      <ChatHeader
        productData={productData}
        status={status}
        chatMode={chatMode}
        onNewChat={handleNewChat}
        isMobile={isMobile}
      />

      <ChatModeSelector mode={chatMode} onModeChange={handleModeChange} />

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

      <InputArea
        ref={inputAreaRef}
        onSend={handleSendMessage}
        isLoading={isLoading}
        isMobile={isMobile}
        placeholder={modePlaceholder[chatMode](productData?.name)}
        disabled={!productData?.id}
      />
    </div>
  );
}

export function AccessibleAIChat(props: AccessibleAIChatProps) {
  return (
    <AccessibilityProvider>
      <AccessibleAIChatInner {...props} />
    </AccessibilityProvider>
  );
}
