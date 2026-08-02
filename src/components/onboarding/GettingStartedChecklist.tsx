import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useNavigate } from 'react-router-dom';
import { createChecklistItems } from './checklist/ChecklistData';
import { ChecklistItem } from './checklist/ChecklistItem';
import { ChecklistHeader } from './checklist/ChecklistHeader';
import { CompletionCelebration } from './checklist/CompletionCelebration';
import { FEATURES, type FeatureKey } from '@/lib/tiers';

export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startOnboarding } = useOnboarding();
  const { completeItem, isItemCompleted } = useChecklistProgress();
  const { can } = useFeatureAccess();
  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Items whose destination the current tier can't open render locked, and
  // are left out of the progress maths so the checklist stays completable.
  const isLocked = (item: { feature?: FeatureKey }) => !!item.feature && !can(item.feature);

  const checklistItems = createChecklistItems(completeItem, navigate, startOnboarding);
  const availableItems = checklistItems.filter((item) => !isLocked(item));
  const completedItems = availableItems.filter(item => isItemCompleted(item.id));
  const totalPoints = availableItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  const canBrowseProducts = can(FEATURES.PRODUCTS);

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
                  locked={isLocked(item)}
                />
              ))}
            </div>

            {progressPercentage === 100 && (
              <CompletionCelebration
                onStartLearning={() =>
                  navigate(canBrowseProducts ? '/category/investment-products' : '/')
                }
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}