import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import { Message } from './Message';
import { ChatMessage } from './types';
import { useAnnouncer } from '@/hooks/chat/useAnnouncer';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isMobile?: boolean;
  className?: string;
  onCopyMessage?: (content: string) => void;
}

export interface MessageListHandle {
  scrollToBottom: () => void;
  scrollToTop: () => void;
}

export const MessageList = forwardRef<MessageListHandle, MessageListProps>(
  ({ messages, isLoading, isMobile = false, className, onCopyMessage }, ref) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { announceNewMessage } = useAnnouncer();
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const [userScrolledUp, setUserScrolledUp] = React.useState(false);
    const prevMessagesLength = useRef(messages.length);

    // Scroll to bottom function
    const scrollToBottom = (smooth = true) => {
      if (!scrollAreaRef.current) return;
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
        setShowScrollButton(false);
        setUserScrolledUp(false);
      }
    };

    // Scroll to top function
    const scrollToTop = (smooth = true) => {
      if (!scrollAreaRef.current) return;
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToBottom: () => scrollToBottom(true),
      scrollToTop: () => scrollToTop(true)
    }));

    // Check if user is near bottom
    const isNearBottom = () => {
      if (!scrollAreaRef.current) return true;
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (!viewport) return true;
      const threshold = 100;
      return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= threshold;
    };

    // Handle scroll events
    const handleScroll = () => {
      const atBottom = isNearBottom();
      setUserScrolledUp(!atBottom);
      setShowScrollButton(!atBottom && messages.length > 3);
    };

    // Auto-scroll on new messages
    useEffect(() => {
      if (messages.length > prevMessagesLength.current) {
        const isNewMessage = messages.length > 0;
        if (isNewMessage && !userScrolledUp) {
          setTimeout(() => scrollToBottom(true), 100);
          announceNewMessage();
        }
      }
      prevMessagesLength.current = messages.length;
    }, [messages.length, userScrolledUp, announceNewMessage]);

    // Attach scroll listener
    useEffect(() => {
      if (!scrollAreaRef.current) return;
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (!viewport) return;

      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }, [messages.length]);

    // Initial scroll to bottom
    useEffect(() => {
      setTimeout(() => scrollToBottom(false), 100);
    }, []);

    return (
      <div className={cn("relative flex-1 min-h-0", className)}>
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full"
        >
          {/* ARIA live region for new messages */}
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-atomic="false"
            className="min-h-full flex flex-col"
          >
            {messages.length === 0 ? (
              <div
                className="flex-1 flex items-center justify-center p-8 text-center"
                role="status"
                aria-label="No messages yet"
              >
                <div className="max-w-md space-y-3">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Ready to help!</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything or use the quick questions to get started.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    isMobile={isMobile}
                    onCopy={onCopyMessage}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div
                    className="px-6 py-4"
                    role="status"
                    aria-label="Loading response"
                  >
                    <div className="max-w-4xl mx-auto flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-2">AI Assistant</div>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-4" aria-hidden="true" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scrollToBottom(true)}
            className={cn(
              "absolute bottom-4 right-4 z-10 rounded-full shadow-lg",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
