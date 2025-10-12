import { memo } from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-config';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isMobile: boolean;
}

export const ChatMessage = memo(({ role, content, timestamp, isStreaming, isMobile }: ChatMessageProps) => {
  if (isMobile) {
    return (
      <div className="flex gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="text-micro font-medium text-muted-foreground">{role === 'user' ? 'You' : 'Assistant'}</span>
            <span className="text-micro text-muted-foreground/60 ml-2">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-sm leading-relaxed">
            {isStreaming ? (
              <div className="flex gap-1 py-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
              </div>
            ) : role === 'assistant' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
              </div>
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
        role === 'user'
          ? 'bg-primary text-primary-foreground ml-4'
          : 'bg-card text-card-foreground border mr-4'
      }`}>
        <div className="flex items-start gap-2 mb-2">
          <div className={`p-1 rounded-full ${role === 'user' ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
            {role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          </div>
          <div className="text-micro opacity-75">
            {role === 'user' ? 'You' : 'AI Expert'}
          </div>
        </div>

        {isStreaming ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : role === 'assistant' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        )}

        <div className="text-micro opacity-50 mt-2">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.content === nextProps.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.role === nextProps.role
  );
});

ChatMessage.displayName = 'ChatMessage';
