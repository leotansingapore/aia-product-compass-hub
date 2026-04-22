import { Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasTone } from './cmfasTheme';

interface OrientCardProps {
  aboutText: string;
  className?: string;
  /** Rich text tuned for the amber / dark study-room hub. */
  proseOnDark?: boolean;
}

/**
 * Collapsed "Rules of the Game" card at the top of the hub. Expands to show
 * the about text (stored on the cmfas-exams-page meta-product) as rendered
 * markdown. Replaces the old About tab — same content, more discoverable.
 */
export function OrientCard({ aboutText, className, proseOnDark }: OrientCardProps) {
  return (
    <Collapsible>
      <div className={cn('rounded-xl border bg-card', className)}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cmfasTone.accentBg)}>
              <Info className={cn('h-4 w-4', cmfasTone.accentText)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">New here? Start with the rules of the game.</p>
              <p className="text-xs text-muted-foreground">
                What the CMFAS program is, how to pass, what counts as "done".
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-amber-200/15 px-5 py-4">
            <div
              className={cn(
                'prose prose-sm max-w-none',
                proseOnDark ? 'prose-invert text-amber-100/95' : 'dark:prose-invert',
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aboutText}</ReactMarkdown>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
