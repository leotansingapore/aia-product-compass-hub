import { useState, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface InputAreaProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
  isMobile?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

export interface InputAreaHandle {
  focus: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

export const InputArea = forwardRef<InputAreaHandle, InputAreaProps>(
  (
    {
      onSend,
      isLoading = false,
      isMobile = false,
      placeholder = 'Ask me anything...',
      maxLength = 4000,
      className,
      disabled = false
    },
    ref
  ) => {
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => setValue(''),
      setValue: (newValue: string) => setValue(newValue)
    }));

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, isMobile ? 120 : 200);
      textarea.style.height = `${newHeight}px`;
    }, [value, isMobile]);

    const handleSend = async () => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        toast({
          title: 'Empty message',
          description: 'Please enter a message before sending.',
          variant: 'destructive'
        });
        return;
      }

      if (trimmedValue.length > maxLength) {
        toast({
          title: 'Message too long',
          description: `Please keep your message under ${maxLength} characters.`,
          variant: 'destructive'
        });
        return;
      }

      try {
        await onSend(trimmedValue);
        setValue('');
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({
          title: 'Failed to send',
          description: 'There was an error sending your message. Please try again.',
          variant: 'destructive'
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
        e.preventDefault();
        if (!isLoading && !disabled) {
          handleSend();
        }
      }

      // Clear on Escape
      if (e.key === 'Escape') {
        setValue('');
        textareaRef.current?.blur();
      }
    };

    const characterCount = value.length;
    const isNearLimit = characterCount > maxLength * 0.8;
    const isOverLimit = characterCount > maxLength;

    return (
      <div
        className={cn(
          "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isMobile ? "p-3 pb-safe" : "p-4",
          className
        )}
      >
        <div className="max-w-4xl mx-auto">
          {/* Input container */}
          <div
            className={cn(
              "relative rounded-lg border-2 transition-colors",
              isFocused ? "border-primary shadow-md" : "border-border",
              isOverLimit && "border-destructive"
            )}
          >
            <label htmlFor="chat-input" className="sr-only">
              Enter your message. Press Enter to send, Shift+Enter for new line
            </label>

            <Textarea
              id="chat-input"
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              className={cn(
                "min-h-[60px] resize-none border-0 focus-visible:ring-0 pr-24",
                isMobile && "text-base" // Prevent zoom on mobile
              )}
              aria-label="Message input"
              aria-describedby={isNearLimit ? "character-count" : undefined}
              maxLength={maxLength}
            />

            {/* Action buttons */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {/* Clear button */}
              {value.length > 0 && !isLoading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue('')}
                  className="h-8 w-8 p-0"
                  aria-label="Clear message"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Send button */}
              <Button
                type="submit"
                size="sm"
                onClick={handleSend}
                disabled={!value.trim() || isLoading || disabled || isOverLimit}
                className={cn(
                  "h-8 px-3",
                  isMobile ? "w-auto" : "min-w-[80px]"
                )}
                aria-label={isLoading ? 'Sending message' : 'Send message'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" aria-hidden="true" />
                    {!isMobile && 'Sending'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {!isMobile && 'Send'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Helper text */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-muted-foreground">
              {isMobile ? 'Tap Send' : 'Press Enter to send, Shift+Enter for new line'}
            </p>

            {/* Character count */}
            {isNearLimit && (
              <span
                id="character-count"
                className={cn(
                  "text-xs font-medium",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
                aria-live="polite"
              >
                {characterCount} / {maxLength}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

InputArea.displayName = 'InputArea';
