import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Loader2, ArrowDown, Bell, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageType {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface QuickQuestion {
  question: string;
  category: string;
}

interface EnhancedAIChatProps {
  productData?: {
    id?: string;
    name?: string;
    category?: string;
    summary?: string;
    highlights?: string[];
    assistant_id?: string;
    assistant_instructions?: string;
  };
}

export function EnhancedAIChat({ productData }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Product-specific quick questions
  const quickQuestions: QuickQuestion[] = [
    { question: `What are the key benefits of ${productData?.name}?`, category: "Benefits" },
    { question: `Who is the ideal customer for ${productData?.name}?`, category: "Target Market" },
    { question: `How does ${productData?.name} compare to competitors?`, category: "Comparison" },
    { question: `What are common objections for ${productData?.name} and how to handle them?`, category: "Sales Tips" },
    { question: `What documentation do I need for ${productData?.name} applications?`, category: "Process" },
    { question: `What are the premium payment options for ${productData?.name}?`, category: "Pricing" }
  ];

  // Smart scroll detection - check if user is near bottom
  const isNearBottom = () => {
    if (!scrollAreaRef.current) return true;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return true;
    const threshold = 100; // pixels from bottom
    const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= threshold;
    return isAtBottom;
  };

  // Scroll to bottom with smooth animation
  const scrollToBottom = (smooth = true) => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setShowScrollButton(false);
    setHasNewMessage(false);
    setUserScrolledUp(false);
  };

  // Handle scroll events to detect user scroll behavior
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;
    const isAtBottom = isNearBottom();
    const isUserScrolling = !isAtBottom;
    setUserScrolledUp(isUserScrolling);
    setShowScrollButton(isUserScrolling && messages.length > 0);
    if (isAtBottom) setHasNewMessage(false);
  };

  // Attach scroll event listener to viewport
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart auto-scroll logic
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage.role === 'user';
    const atBottom = isNearBottom();
    const shouldAutoScroll = isUserMessage || atBottom || messages.length === 1;
    if (shouldAutoScroll) setTimeout(() => scrollToBottom(true), 50);
    else setHasNewMessage(true);
  }, [messages.length]);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0 && productData?.name) {
      const welcomeMessage: ChatMessageType = {
        role: 'assistant',
        content: `👋 **Welcome to the ${productData.name} Expert Assistant!**\n\nI'm here to help you with everything about this product. You can:\n\n- Ask specific questions about features and benefits\n- Get sales tips and objection handling advice\n- Learn about target customers and positioning\n- Understand application processes and requirements\n\n**Try one of the quick questions below or ask me anything!** ⚡`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [productData?.name]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content || isLoading || !productData?.id) return;

    // Check if assistant exists
    if (!productData?.assistant_id) {
      toast({
        title: "Assistant Not Found",
        description: "Please create a specialized assistant for this product first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessageType = { role: 'user', content, timestamp: new Date() };

    // Add user message and streaming placeholder
    const streamingMessage: ChatMessageType = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, streamingMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'chat',
          productId: productData.id,
          threadId: threadId,
          messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content }))
        }
      });

      if (error) throw error;

      if (data.threadId && !threadId) setThreadId(data.threadId);

      // Remove streaming placeholder and add final response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        return newMessages;
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.slice(0, -1)); // Remove streaming placeholder
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setHasNewMessage(false);
    setUserScrolledUp(false);
    setShowScrollButton(false);

    if (productData?.name) {
      const welcomeMessage: ChatMessageType = {
        role: 'assistant',
        content: `👋 **Welcome back to the ${productData.name} Expert Assistant!**\n\nWhat would you like to know about this product today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [productData?.name]);

  return (
    <div className={`h-full flex flex-col bg-background relative ${isMobile ? 'overflow-hidden' : ''}`}>
      {/* Floating New Chat Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={startNewChat}
        className="absolute top-4 right-4 z-20 shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Start new chat"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        New Chat
      </Button>

      <div className={`${isMobile ? 'flex flex-col p-2 pb-0 space-y-2 flex-shrink-0' : 'flex flex-col p-4 space-y-4 flex-shrink-0'}`}>
        {/* Assistant Status Warning */}
        {!productData?.assistant_id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">⚠️ No Specialized Assistant Found</p>
            <p className="text-yellow-700 text-sm mt-1">
              Create a specialized assistant for this product to enable AI chat functionality.
            </p>
          </div>
        )}

        {/* Chat Area with Enhanced Scroll Controls */}
        <div className={`relative ${isMobile ? 'flex flex-col overflow-hidden max-h-[calc(100vh-350px)] flex-shrink-0' : 'flex flex-col overflow-hidden max-h-[calc(100vh-320px)] flex-shrink-0'}`}>
          <ScrollArea
            className={isMobile ? 'flex-1 border-0 rounded-none bg-transparent' : 'flex-1 border-0 rounded-lg bg-transparent'}
            ref={scrollAreaRef}
          >
            <div
              className={`${isMobile ? 'px-3 pt-3 pb-4 space-y-3' : 'p-4 pb-20 space-y-4'}`}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 animate-fade-in">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Ready to help with {productData?.name}!</p>
                  <p className="text-sm mt-2">Ask a question or use the quick start options below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                      isStreaming={message.isStreaming}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              )}

              {/* Quick Questions - shown in messages view */}
              {messages.length <= 1 && productData?.assistant_id && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-sm font-medium text-muted-foreground">💡 Quick Start Questions:</div>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-2`}>
                    {quickQuestions.map((q, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(q.question)}
                        disabled={isLoading}
                        className={isMobile
                          ? "justify-start h-9 text-micro"
                          : "text-left h-auto py-2 px-3 justify-start hover:bg-primary/5 transition-colors"
                        }
                      >
                        {isMobile ? (
                          <>
                            <Badge variant="secondary" className="text-[10px] mr-2">{q.category}</Badge>
                            <span className="truncate">{q.question}</span>
                          </>
                        ) : (
                          <div>
                            <Badge variant="secondary" className="text-micro mb-1">{q.category}</Badge>
                            <div className="text-micro text-muted-foreground">{q.question}</div>
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* New Message Indicator */}
          {!isMobile && hasNewMessage && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => scrollToBottom(true)}
                className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary shadow-lg animate-pulse"
              >
                <Bell className="h-3 w-3 mr-1" />
                New message
              </Button>
            </div>
          )}

          {/* Scroll to Bottom Button */}
          {!isMobile && showScrollButton && (
            <div className="absolute bottom-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => scrollToBottom(true)}
                className="bg-background/80 hover:bg-background border shadow-lg"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className={`${isMobile ? 'sticky bottom-36 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-4 pb-[env(safe-area-inset-bottom)] px-4' : 'flex-shrink-0 border-t-2 border-primary/20 bg-background pt-4 pb-4 px-4 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.05)]'}`}>
          <div className={`flex gap-2 ${isMobile ? 'items-end' : 'items-start'}`}>
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={productData?.assistant_id ? `Ask about ${productData?.name}...` : 'Create an assistant first to enable chat'}
              className={isMobile
                ? "min-h-[100px] max-h-[140px] resize-none flex-1 text-base border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
                : "min-h-[60px] resize-none flex-1 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors shadow-sm"
              }
              disabled={isLoading || !productData?.assistant_id}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading || !productData?.assistant_id}
              size={isMobile ? 'default' : 'lg'}
              className={isMobile ? 'h-12 px-4 shadow-md' : 'px-8 h-[60px] shadow-md hover:shadow-lg transition-shadow'}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
    </div>
  );
}
