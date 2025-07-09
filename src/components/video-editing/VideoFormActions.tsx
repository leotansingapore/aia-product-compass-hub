import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface VideoFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export function VideoFormActions({ onSave, onCancel }: VideoFormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave}>
        <Check className="h-4 w-4 mr-1" />
        Save Changes
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
    </div>
  );
}