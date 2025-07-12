import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { createChecklistItems } from './checklist/ChecklistData';
import { ChecklistItem } from './checklist/ChecklistItem';
import { ChecklistHeader } from './checklist/ChecklistHeader';
import { CompletionCelebration } from './checklist/CompletionCelebration';

export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startOnboarding } = useOnboarding();
  const { completeItem, isItemCompleted } = useChecklistProgress();
  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const checklistItems = createChecklistItems(completeItem, navigate, startOnboarding);
  const completedItems = checklistItems.filter(item => isItemCompleted(item.id));
  const totalPoints = checklistItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = Math.round((earnedPoints / totalPoints) * 100);

  return (
    <Card className="mb-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <ChecklistHeader
          isExpanded={isExpanded}
          completedCount={completedItems.length}
          totalCount={checklistItems.length}
          earnedPoints={earnedPoints}
          totalPoints={totalPoints}
          progressPercentage={progressPercentage}
        />

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  completed={isItemCompleted(item.id)}
                />
              ))}
            </div>

            {progressPercentage === 100 && (
              <CompletionCelebration
                onStartLearning={() => navigate('/category/c7cde8f4-12d4-4ddc-9150-7b32008a4e19')}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}