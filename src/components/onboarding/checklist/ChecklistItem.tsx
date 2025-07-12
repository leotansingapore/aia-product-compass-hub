import { CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem as ChecklistItemType, getCategoryColor, getCategoryLabel } from './ChecklistData';

interface ChecklistItemProps {
  item: ChecklistItemType;
  completed: boolean;
}

export function ChecklistItem({ item, completed }: ChecklistItemProps) {
  const Icon = item.icon;
  
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        completed 
          ? 'bg-accent/30 border-primary/20' 
          : 'hover:bg-accent/20 border-border'
      }`}
    >
      <div className="flex-shrink-0">
        {completed ? (
          <CheckCircle className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium ${completed ? 'text-muted-foreground line-through' : ''}`}>
            {item.title}
          </h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.category)}`} />
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(item.category)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              +{item.points} pts
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {item.description}
        </p>
      </div>

      {!completed && (
        <Button
          variant="outline"
          size="sm"
          onClick={item.action}
          className="flex-shrink-0"
        >
          Start
        </Button>
      )}
    </div>
  );
}