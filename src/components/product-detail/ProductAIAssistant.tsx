import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Edit, Check, X, ExternalLink, Send, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProductAIAssistantProps {
  customGptLink?: string;
  productData?: {
    id?: string;
    name?: string;
    category?: string;
    summary?: string;
    highlights?: string[];
    assistant_id?: string;
    assistant_instructions?: string;
  };
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductAIAssistant({ customGptLink, productData, onUpdate }: ProductAIAssistantProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(customGptLink || '');
  const [editInstructions, setEditInstructions] = useState(productData?.assistant_instructions || '');
  const [saving, setSaving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creatingAssistant, setCreatingAssistant] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSave = async () => {
    setSaving(true);
    console.log('🤖 ProductAIAssistant saving data');
    
    try {
      await onUpdate('custom_gpt_link', editLink);
      await onUpdate('assistant_instructions', editInstructions);
      setIsEditing(false);
      console.log('✅ ProductAIAssistant save successful');
      toast({
        title: "Saved",
        description: "AI assistant settings updated successfully",
      });
    } catch (error) {
      console.error('❌ ProductAIAssistant save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save AI assistant settings",
        variant: "destructive",
      });
      setEditLink(customGptLink || '');
      setEditInstructions(productData?.assistant_instructions || '');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink(customGptLink || '');
    setEditInstructions(productData?.assistant_instructions || '');
    setIsEditing(false);
  };

  const openCustomGPT = () => {
    if (customGptLink) {
      window.open(customGptLink, '_blank');
    }
  };

  const createAssistant = async () => {
    if (!productData?.id) {
      toast({
        title: "Error",
        description: "Product ID is required to create assistant",
        variant: "destructive",
      });
      return;
    }

    setCreatingAssistant(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'create_assistant',
          productId: productData.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product-specific assistant created successfully!",
      });

      // Refresh the page to show the new assistant
      window.location.reload();
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to create assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingAssistant(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !productData?.id) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending message to fast Chat API...');
      const startTime = Date.now();

      // Always use the fast chat endpoint for better performance
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'chat',
          productId: productData.id,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      const responseTime = Date.now() - startTime;
      console.log(`⚡ Response received in ${responseTime}ms`);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setIsChatOpen(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🤖</span> 
          Ask the AI ({productData?.name} Expert) ⚡
          {isAdminMode && !isEditing && !isChatOpen && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="ml-auto"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Fast AI responses powered by optimized Chat API - get instant answers about {productData?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdminMode && isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gpt-link">Custom GPT Link (Optional)</Label>
              <Input
                id="gpt-link"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://chatgpt.com/g/your-custom-gpt-id"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL to your custom GPT (for external link option)
              </p>
            </div>
            
            <div>
              <Label htmlFor="assistant-instructions">Assistant Instructions (Optional)</Label>
              <Textarea
                id="assistant-instructions"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="Custom instructions for the AI assistant"
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These instructions will customize how the AI responds for this product
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : isChatOpen ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                ⚡ Fast Chat with {productData?.name} Expert
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startNewChat}
                >
                  New Chat
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-64 border rounded-lg p-3" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation about this product!</p>
                  <p className="text-xs mt-1">⚡ Optimized for fast responses</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="markdown-content">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                pre: ({ children }) => <pre className="bg-background/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-2 italic mb-2">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this product..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => setIsChatOpen(true)}
              className="w-full"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              ⚡ Fast Chat with {productData?.name} Expert
            </Button>
            
            {isAdminMode && !productData?.assistant_id && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={createAssistant}
                disabled={creatingAssistant}
                className="w-full"
              >
                {creatingAssistant ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <span className="mr-2">🚀</span>
                )}
                {creatingAssistant ? 'Creating...' : 'Create Specialized Assistant'}
              </Button>
            )}
            
            {customGptLink && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={openCustomGPT}
                className="w-full"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                ➡️ Open Custom GPT
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
