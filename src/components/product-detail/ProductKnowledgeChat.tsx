import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Loader2,
  ArrowDown,
  RotateCcw,
  ImagePlus,
  X,
  Bot,
  Sparkles,
  Search,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatMessage } from "./ChatMessage";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { ChatMode } from "@/components/chat/types";

interface ChatMessageType {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  imageUrl?: string;
}

interface ProductKnowledgeChatProps {
  productId: string;
  productName: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-knowledge-chat`;

const modeConfig = [
  { value: 'knowledge' as ChatMode, label: 'Q&A', icon: Search },
  { value: 'sales' as ChatMode, label: 'Sales', icon: TrendingUp },
  { value: 'objections' as ChatMode, label: 'Objections', icon: Shield },
  { value: 'roleplay' as ChatMode, label: 'Role Play', icon: Users },
];

function getModeWelcome(mode: ChatMode, name: string): string {
  const welcomes: Record<ChatMode, string> = {
    knowledge: `🔍 **${name} — Knowledge Q&A**\n\nAsk me anything about this product. I'll give you concise, factual answers.\n\n**Try a quick question below or ask me anything!**`,
    sales: `📈 **${name} — Sales Coach**\n\nI'll help you position this product, craft pitches, and close deals.\n\n**Pick a prompt below to get started.**`,
    objections: `🛡️ **${name} — Objection Handling**\n\nPractice handling client pushbacks using the 4-step framework:\n1. **Acknowledge** 2. **Common Ground** 3. **Different Perspective** 4. **Safety Valve**\n\n**Choose a scenario below!**`,
    roleplay: `🎭 **${name} — Role Play**\n\nI'll act as a **skeptical client**. Pitch me ${name} and handle my pushbacks.\n\nType **"end session"** when done for your scorecard.\n\n**Pick a client profile or just start pitching!**`,
  };
  return welcomes[mode];
}

function getQuickQuestions(mode: ChatMode, name: string) {
  const qs: Record<ChatMode, { question: string; category: string }[]> = {
    knowledge: [
      { question: `What are the key features of ${name}?`, category: "Features" },
      { question: "What are the charges and fees?", category: "Charges" },
      { question: "How does the premium payment work?", category: "Premiums" },
      { question: "What are the fund options available?", category: "Funds" },
      { question: "What is the lock-in period?", category: "Terms" },
      { question: "What bonuses or boosters are included?", category: "Bonuses" },
    ],
    sales: [
      { question: `Give me a 2-minute elevator pitch for ${name}`, category: "Pitch" },
      { question: `Who is the ideal customer for ${name}?`, category: "Target" },
      { question: `How to position ${name} against competitors?`, category: "Positioning" },
      { question: "What closing techniques work best?", category: "Closing" },
      { question: "Give me 3 talking points for a client meeting", category: "Talking Points" },
      { question: `What analogies can I use to explain ${name}?`, category: "Analogies" },
    ],
    objections: [
      { question: `Client says "${name} is too expensive"`, category: "Price" },
      { question: 'Client says "I want to wait and think about it"', category: "Timing" },
      { question: 'Client says "I already have a similar policy"', category: "Existing" },
      { question: 'Client says "I don\'t trust insurance companies"', category: "Trust" },
      { question: 'Client says "My friend recommended a different product"', category: "Competition" },
      { question: 'Client says "I\'d rather invest on my own"', category: "DIY" },
    ],
    roleplay: [
      { question: `I'm a 30-year-old professional saving for retirement. Pitch me ${name}.`, category: "Young Pro" },
      { question: `I'm a parent wanting to save for my child's education. Why ${name}?`, category: "Parent" },
      { question: `I already have investments. Convince me I need ${name} too.`, category: "Experienced" },
      { question: `I'm risk-averse and prefer fixed deposits. Why should I consider ${name}?`, category: "Conservative" },
      { question: "end session", category: "Score Me" },
    ],
  };
  return qs[mode];
}

const modePlaceholders: Record<ChatMode, (name: string) => string> = {
  knowledge: (n) => `Ask about ${n}...`,
  sales: (n) => `How do I sell ${n}?`,
  objections: () => 'Type a client objection to practice...',
  roleplay: () => 'Start your pitch or respond to the client...',
};

export const ProductKnowledgeChat = memo(function ProductKnowledgeChat({
  productId,
  productName,
}: ProductKnowledgeChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('knowledge');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `👋 **Hey! I'm your ${productName} Expert.**\n\nI've studied all the training lectures and product materials. Ask me anything about:\n\n- 📊 **Product features** — bonuses, charges, fund selection, premium pass\n- 🎯 **Sales strategies** — positioning, target market, closing techniques\n- 🛡️ **Objection handling** — how to address common pushbacks\n- 🔢 **Technical details** — calculations, lock-in periods, comparisons\n\nYou can also **paste images** of benefit illustrations or documents for me to analyze.\n\n**Try a quick question below or ask me anything!**`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [productName]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    setShowScrollButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;
    const threshold = 100;
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
      threshold;
    setShowScrollButton(!isAtBottom && messages.length > 0);
  }, [messages.length]);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 50);
    }
  }, [messages.length, scrollToBottom]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      setAttachedFileName(file.name);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachedImage(null);
    setAttachedFileName(null);
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if ((!content && !attachedImage) || isLoading) return;

    // Build user message content
    let userMessageContent: any;
    let displayContent = content;

    if (attachedImage) {
      // Multimodal message with image
      userMessageContent = [
        {
          type: "image_url",
          image_url: { url: attachedImage },
        },
      ];
      if (content) {
        userMessageContent.unshift({ type: "text", text: content });
      } else {
        userMessageContent.unshift({
          type: "text",
          text: "Please analyze this image in the context of the product.",
        });
      }
      displayContent = content || "📎 [Image uploaded for analysis]";
    } else {
      userMessageContent = content;
    }

    const userMessage: ChatMessageType = {
      role: "user",
      content: displayContent,
      timestamp: new Date(),
      imageUrl: attachedImage || undefined,
    };

    const streamingMessage: ChatMessageType = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, streamingMessage]);
    setCurrentMessage("");
    setAttachedImage(null);
    setAttachedFileName(null);
    setIsLoading(true);

    try {
      // Build conversation history for API
      const apiMessages = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Add the new user message
      apiMessages.push({ role: "user", content: userMessageContent });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, productId }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (resp.status === 402) {
          throw new Error("AI credits exhausted. Please contact your administrator.");
        }
        throw new Error("Failed to get response");
      }

      // Stream the response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as
              | string
              | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantSoFar,
                  timestamp: new Date(),
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as
              | string
              | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantSoFar,
                  timestamp: new Date(),
                };
                return newMessages;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }

      // Ensure final state is correct
      if (!assistantSoFar) {
        setMessages((prev) => prev.slice(0, -1));
        toast({
          title: "No response",
          description: "The assistant didn't return a response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => prev.slice(0, -1));
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setAttachedImage(null);
    setAttachedFileName(null);
    setShowScrollButton(false);

    setMessages([
      {
        role: "assistant",
        content: `👋 **New conversation started!** What would you like to know about ${productName}?`,
        timestamp: new Date(),
      },
    ]);
  }, [productName]);

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{productName} Expert</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Trained on all lecture transcripts
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={startNewChat}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className={`${isMobile ? "px-3 py-3 space-y-3" : "px-4 py-4 space-y-4"}`}>
            {messages.map((message, index) => (
              <div key={index}>
                {/* Show attached image in user messages */}
                {message.imageUrl && message.role === "user" && (
                  <div className="flex justify-end mb-2">
                    <img
                      src={message.imageUrl}
                      alt="Uploaded"
                      className="max-w-[200px] max-h-[150px] rounded-lg border object-cover"
                    />
                  </div>
                )}
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  isStreaming={message.isStreaming}
                  isMobile={isMobile}
                />
              </div>
            ))}

            {/* Quick questions on initial view */}
            {messages.length <= 1 && (
              <div className="space-y-3 animate-fade-in pt-2">
                <div className="text-sm font-medium text-muted-foreground">
                  💡 Quick Start:
                </div>
                <div
                  className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`}
                >
                  {quickQuestions.map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(q.question)}
                      disabled={isLoading}
                      className="text-left h-auto py-2 px-3 justify-start hover:bg-primary/5 transition-colors"
                    >
                      <div>
                        <Badge variant="secondary" className="text-[10px] mb-1">
                          {q.category}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {q.question}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Scroll to bottom */}
        {showScrollButton && (
          <div className="absolute bottom-2 right-2 z-10">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => scrollToBottom(true)}
              className="shadow-lg"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Image preview */}
      {attachedImage && (
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2">
          <img
            src={attachedImage}
            alt="Preview"
            className="h-12 w-12 rounded border object-cover"
          />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {attachedFileName}
          </span>
          <Button size="sm" variant="ghost" onClick={removeAttachment}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t bg-background px-4 py-3">
        <div className="flex gap-2 items-end">
          {/* File upload buttons */}
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Attach image"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask about ${productName}...`}
            className={`${
              isMobile ? "min-h-[80px]" : "min-h-[50px]"
            } max-h-[120px] resize-none flex-1 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors`}
            disabled={isLoading}
          />

          <Button
            onClick={() => sendMessage()}
            disabled={(!currentMessage.trim() && !attachedImage) || isLoading}
            size="lg"
            className="h-[50px] px-6 shadow-md hover:shadow-lg transition-shadow"
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
});
