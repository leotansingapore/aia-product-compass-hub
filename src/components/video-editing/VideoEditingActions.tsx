import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface VideoEditingActionsProps {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function VideoEditingActions({ saving, onSave, onCancel }: VideoEditingActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={saving} size="lg">
        <Check className="h-4 w-4 mr-2" />
        Save All Changes
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={saving} size="lg">
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}