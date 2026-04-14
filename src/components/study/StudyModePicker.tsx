import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Layers } from 'lucide-react';

export type StudyMode = 'fresh' | 'review' | 'all';

interface StudyModePickerProps {
  freshCount: number;
  reviewCount: number;
  totalCount: number;
  selectedMode?: StudyMode | null;
  onPick: (mode: StudyMode) => void;
}

interface ModeCard {
  mode: StudyMode;
  title: string;
  description: string;
  count: number;
  Icon: React.ElementType;
  tone: string;
}

/**
 * Three-card learning mode picker shown before a study session.
 * Fresh  = questions never attempted
 * Review = attempted but not yet mastered (2 in a row)
 * All    = entire study bank, including mastered questions
 */
export function StudyModePicker({
  freshCount,
  reviewCount,
  totalCount,
  selectedMode,
  onPick,
}: StudyModePickerProps) {
  const cards: ModeCard[] = [
    {
      mode: 'fresh',
      title: 'Fresh',
      description: 'Only questions you have never attempted.',
      count: freshCount,
      Icon: Sparkles,
      tone: 'text-emerald-600',
    },
    {
      mode: 'review',
      title: 'Review',
      description: 'Previously attempted but not yet mastered (2 in a row).',
      count: reviewCount,
      Icon: RotateCcw,
      tone: 'text-amber-600',
    },
    {
      mode: 'all',
      title: 'Redo All',
      description: 'Every question, including mastered ones.',
      count: totalCount,
      Icon: Layers,
      tone: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(({ mode, title, description, count, Icon, tone }) => {
        const disabled = count === 0;
        const isSelected = selectedMode === mode;
        return (
          <Card
            key={mode}
            className={[
              'transition-colors',
              disabled ? 'opacity-60' : 'hover:border-primary/40',
              isSelected ? 'border-primary ring-1 ring-primary/30' : '',
            ].filter(Boolean).join(' ')}
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${tone}`} />
                <span className="font-semibold text-sm">{title}</span>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{count} q</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">
                {description}
              </p>
              <Button
                size="sm"
                variant={isSelected ? 'default' : mode === 'all' ? 'default' : 'outline'}
                disabled={disabled}
                onClick={() => onPick(mode)}
              >
                {disabled ? '0 remaining' : isSelected ? `${title} selected` : `Choose ${title}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
