import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccessibilityProvider } from "@/components/chat/AccessibilityProvider";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList, MessageListHandle } from "@/components/chat/MessageList";
import { InputArea, InputAreaHandle } from "@/components/chat/InputArea";
import { QuickActions } from "@/components/chat/QuickActions";
import { ChatMessage as SharedChatMessage, QuickAction, ChatStatus } from "@/components/chat/types";

interface CMFASChatbotProps {
  moduleId?: string;
  moduleName?: string;
}

function CMFASChatbotInner({ moduleId, moduleName }: CMFASChatbotProps) {
  const [messages, setMessages] = useState<SharedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<MessageListHandle>(null);
  const inputAreaRef = useRef<InputAreaHandle>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const quickActions: QuickAction[] = [
    { id: "cmfas-1", question: "What are the key topics I need to study for this module?", category: "Study Guide" },
    { id: "cmfas-2", question: "How should I prepare for the exam?", category: "Exam Prep" },
    { id: "cmfas-3", question: "What are the most important regulations to remember?", category: "Regulations" },
    { id: "cmfas-4", question: "Can you explain investment-linked policies?", category: "Products" },
    { id: "cmfas-5", question: "What are common exam question types?", category: "Exam Format" },
    { id: "cmfas-6", question: "How do I calculate premiums and benefits?", category: "Calculations" },
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: SharedChatMessage = {
      id: "welcome-init",
      role: "assistant",
      content: `👋 Hello! I'm your CMFAS exam tutor. I'm here to help you prepare for your ${moduleName || "CMFAS"} exam.

You can ask me about:
• Key concepts and topics
• Exam preparation strategies
• Regulations and compliance
• Product knowledge
• Practice questions
• Study tips

Feel free to ask me anything or use one of the quick starters above to get going.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [moduleName]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: SharedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-with-gpt", {
        body: {
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          cmfasMode: true,
          moduleId,
          moduleName,
        },
      });

      if (error) throw error;

      const assistantMessage: SharedChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const welcomeMessage: SharedChatMessage = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      content: `👋 Hello! I'm your CMFAS exam tutor. I'm here to help you prepare for your ${moduleName || "CMFAS"} exam.

You can ask me about:
• Key concepts and topics
• Exam preparation strategies
• Regulations and compliance
• Product knowledge
• Practice questions
• Study tips

Feel free to ask me anything or use one of the quick starters above to get going.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    inputAreaRef.current?.clear();
    messageListRef.current?.scrollToBottom();
  };

  const chatStatus = (isLoading ? "typing" : "idle") as ChatStatus;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Desktop header only — mobile uses CMFASChat.tsx page header */}
      {!isMobile && (
        <ChatHeader
          productData={{ name: moduleName || "CMFAS AI Tutor" }}
          status={chatStatus}
          onNewChat={startNewChat}
          isMobile={false}
        />
      )}

      {/* Desktop: sidebar + messages. Mobile: full width */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Quick Actions sidebar — visible only on desktop */}
        {!isMobile && (
          <QuickActions
            actions={quickActions}
            onActionClick={(action) => sendMessage(action.question)}
            isLoading={isLoading}
            isMobile={false}
          />
        )}

        {/* Messages + Input column */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages area */}
          <MessageList
            ref={messageListRef}
            messages={messages}
            isLoading={isLoading}
            isMobile={isMobile}
            className="flex-1"
          />

          {/* Input area */}
          <InputArea
            ref={inputAreaRef}
            onSend={sendMessage}
            isLoading={isLoading}
            isMobile={isMobile}
            placeholder="Ask about CMFAS…"
          />

          {/* Disclaimer */}
          <div className="shrink-0 border-t bg-background/95 px-3 py-2 md:px-4 md:py-3">
            <p className="text-[11px] leading-snug text-muted-foreground">
              AI-generated guidance — verify critical facts with official materials and your compliance team.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: Quick Actions as overlay */}
      {isMobile && (
        <div className="flex-shrink-0 border-t bg-background">
          <QuickActions
            actions={quickActions}
            onActionClick={(action) => sendMessage(action.question)}
            isLoading={isLoading}
            isMobile={true}
          />
        </div>
      )}
    </div>
  );
}

export function CMFASChatbot(props: CMFASChatbotProps) {
  return (
    <AccessibilityProvider>
      <CMFASChatbotInner {...props} />
    </AccessibilityProvider>
  );
}
