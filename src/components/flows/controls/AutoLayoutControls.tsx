import { LayoutGrid, ArrowDown, ArrowRight, ArrowUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

interface AutoLayoutControlsProps {
  onLayout: (direction: LayoutDirection) => void;
}

const LAYOUT_OPTIONS: { direction: LayoutDirection; label: string; icon: typeof ArrowDown }[] = [
  { direction: 'TB', label: 'Top \u2192 Bottom', icon: ArrowDown },
  { direction: 'LR', label: 'Left \u2192 Right', icon: ArrowRight },
  { direction: 'BT', label: 'Bottom \u2192 Top', icon: ArrowUp },
  { direction: 'RL', label: 'Right \u2192 Left', icon: ArrowLeft },
];

export function AutoLayoutControls({ onLayout }: AutoLayoutControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <LayoutGrid className="w-3.5 h-3.5" />
          Auto Layout
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {LAYOUT_OPTIONS.map(({ direction, label, icon: Icon }) => (
          <button
            key={direction}
            onClick={() => onLayout(direction)}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
