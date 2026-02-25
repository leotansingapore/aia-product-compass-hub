import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (label: string, url: string) => void;
}

const MAX_LABEL_LENGTH = 34;

export function AddLinkDialog({ open, onOpenChange, onAdd }: AddLinkDialogProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const isValid = label.trim().length > 0 && url.trim().length > 0;

  const handleAdd = () => {
    if (!isValid) return;
    onAdd(label.trim(), url.trim());
    setLabel('');
    setUrl('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLabel('');
    setUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="link-label">Label</Label>
            <Input
              id="link-label"
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))}
              maxLength={MAX_LABEL_LENGTH}
              placeholder="Resource name"
            />
            <p className="text-xs text-muted-foreground text-right">
              {label.length} / {MAX_LABEL_LENGTH}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              type="url"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            CANCEL
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!isValid}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold"
          >
            ADD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
