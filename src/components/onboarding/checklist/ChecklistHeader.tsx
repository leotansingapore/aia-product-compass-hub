import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChecklistHeaderProps {
  isExpanded: boolean;
  completedCount: number;
  totalCount: number;
  earnedPoints: number;
  totalPoints: number;
  progressPercentage: number;
}

export function ChecklistHeader({
  isExpanded,
  completedCount,
  totalCount,
  earnedPoints,
  totalPoints,
  progressPercentage
}: ChecklistHeaderProps) {
  return (
    <CollapsibleTrigger asChild>
      <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Getting Started Checklist
              <Badge variant="secondary">{completedCount}/{totalCount}</Badge>
            </CardTitle>
            <CardDescription>
              Complete these tasks to master the platform • {earnedPoints}/{totalPoints} points
            </CardDescription>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2 mt-3">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercentage}% Complete</span>
            <span>{completedCount} of {totalCount} tasks done</span>
          </div>
        </div>
      </CardHeader>
    </CollapsibleTrigger>
  );
}