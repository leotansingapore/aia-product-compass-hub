import { Button } from '@/components/ui/button';
import { Save, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoOrderActionsProps {
  changeCount: number;
  changeSummary: {
    reordered: number;
    moved: number;
    both: number;
  };
  isSaving: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
}

export function VideoOrderActions({
  changeCount,
  changeSummary,
  isSaving,
  onSave,
  onDiscard,
}: VideoOrderActionsProps) {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await onSave();
      toast({
        title: 'Changes Saved',
        description: `Successfully updated ${changeCount} video${changeCount !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save video order changes',
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    onDiscard();
    toast({
      title: 'Changes Discarded',
      description: 'Video order has been reset to the original state',
    });
  };

  const getChangeDescription = () => {
    const parts: string[] = [];
    if (changeSummary.both > 0) {
      parts.push(`${changeSummary.both} moved & reordered`);
    }
    if (changeSummary.moved > 0) {
      parts.push(`${changeSummary.moved} moved`);
    }
    if (changeSummary.reordered > 0) {
      parts.push(`${changeSummary.reordered} reordered`);
    }
    return parts.join(', ');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-sm">
                {changeCount} Unsaved Change{changeCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                {getChangeDescription()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Discard Changes
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
