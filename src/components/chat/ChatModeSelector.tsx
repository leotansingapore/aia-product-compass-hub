import { Search, TrendingUp, Shield } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChatMode } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  className?: string;
}

const modes = [
  { value: 'knowledge' as const, label: 'Knowledge Q&A', icon: Search },
  { value: 'sales' as const, label: 'Sales Coach', icon: TrendingUp },
  { value: 'objections' as const, label: 'Objection Handling', icon: Shield },
];

export function ChatModeSelector({ mode, onModeChange, className }: ChatModeSelectorProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("border-b bg-muted/30 px-3 py-2 flex justify-center", className)}>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(v) => { if (v) onModeChange(v as ChatMode); }}
        className="gap-1"
      >
        {modes.map(({ value, label, icon: Icon }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={label}
            className={cn(
              "gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {!isMobile && <span>{label}</span>}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
