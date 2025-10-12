import { memo } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './types';
import { createMessageAriaLabel, formatTimeForA11y } from '@/lib/accessibility/aria-helpers';
import { markdownComponents } from '@/lib/markdown-config';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MessageProps {
  message: ChatMessage;
  isMobile?: boolean;
  onCopy?: (content: string) => void;
}

export const Message = memo(({ message, isMobile = false, onCopy }: MessageProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { role, content, timestamp, isStreaming } = message;

  const ariaLabel = createMessageAriaLabel(role, content, timestamp);
  const timeString = formatTimeForA11y(timestamp);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isMobile) {
    return (
      <article
        role="article"
        aria-label={ariaLabel}
        className={cn(
          "flex gap-3 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg",
          "transition-colors hover:bg-muted/30"
        )}
        tabIndex={0}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
          aria-hidden="true"
        >
          {role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              {role === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <time
              dateTime={timestamp.toISOString()}
              className="text-xs text-muted-foreground"
              aria-label={`Sent ${timeString}`}
            >
              {timeString}
            </time>
          </div>

          {isStreaming ? (
            <div className="flex gap-1 py-2" aria-label="Assistant is typing">
              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              {role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{content}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {!isStreaming && role === 'assistant' && (
            <div className="mt-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs"
                aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
              >
                {isCopied ? (
                  <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
                )}
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Desktop view
  return (
    <article
      role="article"
      aria-label={ariaLabel}
      className={cn(
        "group relative px-6 py-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg",
        "transition-colors hover:bg-muted/20",
        role === 'user' && "bg-muted/30"
      )}
      tabIndex={0}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
          )}
          aria-hidden="true"
        >
          {role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              {role === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <time
              dateTime={timestamp.toISOString()}
              className="text-xs text-muted-foreground"
              aria-label={`Sent ${timeString}`}
            >
              {timeString}
            </time>
          </div>

          {isStreaming ? (
            <div className="flex gap-1.5 py-3" aria-label="Assistant is typing">
              <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2.5 h-2.5 bg-muted-foreground/50 rounded-full animate-bounce" />
            </div>
          ) : (
            <>
              <div className="text-base leading-relaxed">
                {role === 'assistant' ? (
                  <div className="prose prose-base dark:prose-invert max-w-none">
                    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{content}</p>
                )}
              </div>

              {/* Actions - Show on hover for desktop */}
              {role === 'assistant' && (
                <div className="mt-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 px-3 text-xs"
                    aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    prevProps.isMobile === nextProps.isMobile
  );
});

Message.displayName = 'Message';
