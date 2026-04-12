import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles } from 'lucide-react';
import { QuickAction } from './types';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  isLoading?: boolean;
  isMobile?: boolean;
  className?: string;
}

export function QuickActions({
  actions,
  onActionClick,
  isLoading = false,
  isMobile = false,
  className
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusedIndex === null) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev === null || prev === actions.length - 1 ? 0 : prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev === null || prev === 0 ? actions.length - 1 : prev - 1));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(actions.length - 1);
          break;
      }
    };

    if (focusedIndex !== null && buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex]?.focus();
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedIndex, actions.length]);

  if (actions.length === 0) return null;

  const content = (
    <nav aria-label="Quick questions" className="min-w-0 space-y-2">
      <div role="list" className="min-w-0 space-y-1">
        {actions.map((action, index) => (
          <div key={action.id} role="listitem">
            <Button
              ref={(el) => (buttonRefs.current[index] = el)}
              variant="outline"
              onClick={() => {
                onActionClick(action);
                if (isMobile) setIsOpen(false);
              }}
              disabled={isLoading}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              className={cn(
                "w-full min-w-0 max-w-full justify-start text-left h-auto py-3 px-3",
                "overflow-hidden",
                "hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-colors group"
              )}
              aria-label={`Ask: ${action.question}`}
            >
              <div className="flex min-w-0 w-full max-w-full items-start gap-2">
                <Sparkles
                  className="h-4 w-4 shrink-0 text-primary mt-0.5 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="mb-1 break-words text-sm font-medium leading-snug text-foreground">
                    {action.question}
                  </div>
                  <Badge
                    variant="secondary"
                    className="max-w-full whitespace-normal break-words text-left text-[10px] font-normal"
                  >
                    {action.category}
                  </Badge>
                </div>
              </div>
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-2 px-3 text-xs text-muted-foreground" role="status">
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border">↑↓</kbd>
        {' '}Navigate{' '}
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border">Enter</kbd>
        {' '}Select
      </div>
    </nav>
  );

  if (isMobile) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("border-b bg-muted/20", className)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 rounded-none"
            aria-expanded={isOpen}
            aria-controls="quick-actions-content"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Quick Questions ({actions.length})
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent id="quick-actions-content" className="px-4 pb-4">
          {content}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "w-80 min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-r bg-muted/10 p-4",
        className
      )}
      aria-label="Quick actions sidebar"
      role="complementary"
    >
      <div className="min-w-0 space-y-3">
        <div className="flex min-w-0 items-center gap-2 px-3">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="min-w-0 truncate text-sm font-semibold text-foreground">
            Quick Questions
          </h2>
        </div>

        {content}

        <div className="mt-4 px-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            These are suggested questions to help you get started. You can also type your own question below.
          </p>
        </div>
      </div>
    </aside>
  );
}
