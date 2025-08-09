import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Loader2, Sparkles, User, Bot, Maximize2, Minimize2, ArrowDown, Bell, Menu, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface ChatMessage {
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);

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
    const viewport = scrollViewportRef.current;
    if (!viewport) return true;
    const threshold = 100; // pixels from bottom
    const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= threshold;
    return isAtBottom;
  };

  // Scroll to bottom with smooth animation
  const scrollToBottom = (smooth = true) => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setShowScrollButton(false);
    setHasNewMessage(false);
    setUserScrolledUp(false);
  };

  // Handle scroll events to detect user scroll behavior
  const handleScroll = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    const isAtBottom = isNearBottom();
    const isUserScrolling = !isAtBottom;
    setUserScrolledUp(isUserScrolling);
    setShowScrollButton(isUserScrolling && messages.length > 0);
    if (isAtBottom) setHasNewMessage(false);
  };

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
      const welcomeMessage: ChatMessage = {
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

    const userMessage: ChatMessage = { role: 'user', content, timestamp: new Date() };

    // Add user message and streaming placeholder
    const streamingMessage: ChatMessage = {
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

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setThreadId(null);
    setHasNewMessage(false);
    setUserScrolledUp(false);
    setShowScrollButton(false);

    if (productData?.name) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `👋 **Welcome back to the ${productData.name} Expert Assistant!**\n\nWhat would you like to know about this product today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <Card className={`${isMobile ? 'shadow-none border-0 rounded-none h-[85vh] flex flex-col bg-background' : 'border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50'} transition-all duration-300 ${isFullscreen && !isMobile ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''}`}>
      <CardHeader className={`pb-3 ${isMobile ? 'sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isMobile && (
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                🤖 {productData?.name} Assistant
              </CardTitle>
              {!isMobile && (
                <CardDescription className="text-sm">
                  {productData?.assistant_id ? 
                    `Powered by specialized AI • Assistant ID: ${productData.assistant_id.slice(-8)}` : 
                    'No assistant configured - create one to get started'
                  }
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isMobile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-2"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={startNewChat} className={isMobile ? 'h-8 px-2' : ''}>
              {isMobile ? <RotateCcw className="h-4 w-4" /> : 'New Chat'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${isMobile ? 'flex-1 flex flex-col p-3' : ''}`}>
        {/* Assistant Status Warning */}
        {!productData?.assistant_id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">⚠️ No Specialized Assistant Found</p>
            <p className="text-yellow-700 text-sm mt-1">
              Create a specialized assistant for this product to enable AI chat functionality.
            </p>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length <= 1 && productData?.assistant_id && (
          isMobile ? (
            <Collapsible open={showQuickQuestions} onOpenChange={setShowQuickQuestions}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Guiding questions</div>
                <Button variant="ghost" size="sm" onClick={() => setShowQuickQuestions(!showQuickQuestions)} className="-mr-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(q.question)}
                      disabled={isLoading}
                      className="justify-start h-9 text-xs"
                    >
                      <Badge variant="secondary" className="text-[10px] mr-2">{q.category}</Badge>
                      <span className="truncate">{q.question}</span>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="text-sm font-medium text-muted-foreground">💡 Quick Start Questions:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(q.question)}
                    disabled={isLoading}
                    className="text-left h-auto py-2 px-3 justify-start hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1">{q.category}</Badge>
                      <div className="text-xs text-muted-foreground">{q.question}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )
        )}

        {/* Chat Area with Enhanced Scroll Controls */}
        <div className={`relative ${isMobile ? 'flex-1 flex flex-col' : ''}`}>
          <ScrollArea 
            className={`border rounded-lg bg-background/50 ${isMobile ? 'flex-1' : (isFullscreen ? 'h-[calc(100vh-16rem)]' : 'h-96')}`}
            ref={scrollAreaRef}
          >
            <div 
              className="p-4 space-y-4"
              ref={scrollViewportRef}
              onScroll={handleScroll}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 animate-fade-in">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Ready to help with {productData?.name}!</p>
                  <p className="text-sm mt-2">Ask a question or use the quick start options above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] ${isMobile ? 'rounded-lg px-3 py-2 shadow-none' : 'rounded-2xl px-4 py-3 shadow-sm'} ${
                          message.role === 'user'
                            ? `bg-primary text-primary-foreground ${isMobile ? '' : 'ml-4'}`
                            : `${isMobile ? 'bg-muted/40 text-foreground' : 'bg-card text-card-foreground border mr-4'}`
                        }`}
                      >
                        {!isMobile && (
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`p-1 rounded-full ${message.role === 'user' ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                              {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                            </div>
                            <div className="text-xs opacity-75">
                              {message.role === 'user' ? 'You' : 'AI Expert'}
                            </div>
                          </div>
                        )}

                        {message.isStreaming ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        ) : message.role === 'assistant' ? (
                          <div className="markdown-content prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-card-foreground">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-card-foreground">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-card-foreground">{children}</h3>,
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-card-foreground">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-card-foreground">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-card-foreground">{children}</ol>,
                                li: ({ children }) => <li className="text-sm text-card-foreground">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-card-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic text-card-foreground">{children}</em>,
                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-card-foreground">{children}</code>,
                                pre: ({ children }) => <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto mb-2 text-card-foreground">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-2 italic mb-2 text-card-foreground">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}

                        {!isMobile && (
                          <div className="text-xs opacity-50 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

        {/* Input Area */}
        <div className={`${isMobile ? 'sticky bottom-0 bg-background border-t pt-2' : ''} space-y-3`}>
          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={productData?.assistant_id ? `Ask about ${productData?.name}...` : 'Create an assistant first to enable chat'}
              className={`${isMobile ? 'min-h-[44px]' : 'min-h-[60px]'} resize-none flex-1`}
              disabled={isLoading || !productData?.assistant_id}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading || !productData?.assistant_id}
              size={isMobile ? 'default' : 'lg'}
              className={isMobile ? 'px-3' : 'px-6'}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center hidden sm:block">
            💡 Pro tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs mx-1">Shift + Enter</kbd> for new line
            {threadId && <span className="ml-2">• Thread: {threadId.slice(-8)}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
