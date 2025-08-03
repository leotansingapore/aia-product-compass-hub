import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, MessageCircle, ArrowDown, RotateCcw, Menu } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface CMFASChatbotProps {
  moduleId?: string;
  moduleName?: string;
}

export function CMFASChatbot({ moduleId, moduleName }: CMFASChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const quickQuestions: QuickQuestion[] = [
    { question: "What are the key topics I need to study for this module?", category: "Study Guide" },
    { question: "How should I prepare for the exam?", category: "Exam Prep" },
    { question: "What are the most important regulations to remember?", category: "Regulations" },
    { question: "Can you explain investment-linked policies?", category: "Products" },
    { question: "What are common exam question types?", category: "Exam Format" },
    { question: "How do I calculate premiums and benefits?", category: "Calculations" }
  ];

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage = {
      role: 'assistant' as const,
      content: `👋 Hello! I'm your CMFAS exam tutor. I'm here to help you prepare for your ${moduleName || 'CMFAS'} exam.

You can ask me about:
• Key concepts and topics
• Exam preparation strategies  
• Regulations and compliance
• Product knowledge
• Practice questions
• Study tips

Feel free to ask me anything or use one of the quick questions below to get started!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [moduleName]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          cmfasMode: true,
          moduleId,
          moduleName
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
    setMessages([{
      role: 'assistant',
      content: `👋 Hello! I'm your CMFAS exam tutor. I'm here to help you prepare for your ${moduleName || 'CMFAS'} exam.

You can ask me about:
• Key concepts and topics
• Exam preparation strategies  
• Regulations and compliance
• Product knowledge
• Practice questions
• Study tips

Feel free to ask me anything or use one of the quick questions below to get started!`,
      timestamp: new Date()
    }]);
  };

  // Mobile layout - ChatGPT style
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">CMFAS AI Tutor</h3>
              {moduleName && (
                <p className="text-xs text-muted-foreground">{moduleName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickQuestions(!showQuickQuestions)}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Questions Collapsible */}
        <Collapsible open={showQuickQuestions} onOpenChange={setShowQuickQuestions}>
          <CollapsibleContent className="border-b bg-muted/30">
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Questions</h4>
              <div className="grid gap-2">
                {quickQuestions.slice(0, 6).map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3 text-xs font-normal"
                    onClick={() => {
                      handleQuickQuestion(q.question);
                      setShowQuickQuestions(false);
                    }}
                  >
                    {q.question}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Chat Messages Area */}
        <ScrollArea 
          className="flex-1 px-4" 
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.role === 'user' ? 'You' : 'CMFAS Tutor'}
                    </span>
                    <span className="text-xs text-muted-foreground/60 ml-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-muted">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="text-xs font-medium text-muted-foreground">CMFAS Tutor</span>
                  </div>
                  <div className="flex gap-1 py-2">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showScrollButton && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-20 right-4 h-8 w-8 p-0 rounded-full shadow-lg z-10"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        {/* Mobile Input Area - Sticky Bottom */}
        <div className="p-3 border-t bg-card/95 backdrop-blur-sm sticky bottom-0">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about CMFAS..."
              disabled={isLoading}
              className="flex-1 h-10"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
              size="sm"
              className="h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - Enhanced card design
  return (
    <Card className="bg-gradient-to-br from-card via-card to-blue-50/20 dark:to-blue-900/10 border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent font-bold text-xl">
              CMFAS AI Tutor
            </span>
            {moduleName && (
              <p className="text-sm text-muted-foreground mt-1">{moduleName}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Quick Questions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Quick Questions:</h4>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 4).map((q, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-2 py-1"
                onClick={() => handleQuickQuestion(q.question)}
              >
                {q.question}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="border rounded-lg bg-background/50">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Chat</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              className="h-7 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              New Chat
            </Button>
          </div>

          <ScrollArea 
            className="h-96 p-4" 
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    } ${message.role === 'user' ? 'inline-block' : ''}`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg px-3 py-2 max-w-[85%]">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {showScrollButton && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-20 right-6 h-8 w-8 p-0 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}

          {/* Input Area */}
          <div className="p-3 border-t bg-background/80">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about CMFAS exam preparation..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}