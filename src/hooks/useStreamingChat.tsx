
import { useState, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface StreamingMessage {
  type: 'metadata' | 'content' | 'done' | 'error';
  content?: string;
  threadId?: string;
  usage?: any;
  isComplete?: boolean;
  error?: string;
}

interface UseStreamingChatProps {
  productId: string;
  onMessage?: (content: string, isComplete: boolean) => void;
  onError?: (error: string) => void;
  onComplete?: (threadId: string) => void;
}

export function useStreamingChat({ 
  productId, 
  onMessage, 
  onError, 
  onComplete 
}: UseStreamingChatProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendStreamingMessage = useCallback(async (
    messages: any[], 
    threadId?: string
  ): Promise<string | null> => {
    if (isStreaming) {
      console.warn('Already streaming, ignoring new request');
      return null;
    }

    setIsStreaming(true);
    setCurrentContent('');

    try {
      // First, invoke the edge function to get the streaming URL
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'chat',
          productId,
          threadId,
          stream: true,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      // Since we can't directly stream from Supabase functions invoke,
      // we'll use a different approach with a direct fetch to the function URL
      const functionUrl = `https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/chat-with-assistant`;
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'chat',
          productId,
          threadId,
          stream: true,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let finalThreadId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingMessage = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'metadata':
                  if (data.threadId) {
                    finalThreadId = data.threadId;
                  }
                  break;
                
                case 'content':
                  if (data.content) {
                    setCurrentContent(data.content);
                    onMessage?.(data.content, data.isComplete || false);
                  }
                  break;
                
                case 'done':
                  if (data.threadId) {
                    finalThreadId = data.threadId;
                  }
                  onComplete?.(finalThreadId || '');
                  setIsStreaming(false);
                  return finalThreadId;
                
                case 'error':
                  throw new Error(data.error || 'Streaming error');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      return finalThreadId;

    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      onError?.(error.message || 'Failed to stream response');
      return null;
    }
  }, [productId, isStreaming, onMessage, onError, onComplete]);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsStreaming(false);
  }, []);

  return {
    sendStreamingMessage,
    stopStreaming,
    isStreaming,
    currentContent
  };
}
