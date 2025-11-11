import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { FileText, X } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface AddPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  onAdd: (newPage: Partial<TrainingVideo>) => void;
}

export function AddPageDialog({ open, onOpenChange, folderName, onAdd }: AddPageDialogProps) {
  const [title, setTitle] = useState('');
  const [richContent, setRichContent] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      return;
    }

    // Create new page with rich content
    const newPage: Partial<TrainingVideo> = {
      id: `temp-${Date.now()}`, // Temporary ID until saved to database
      title: title.trim(),
      category: folderName,
      rich_content: richContent,
      url: '', // Empty URL for rich text pages
      order: 999, // Will be reordered by parent
    };

    onAdd(newPage);
    
    // Reset form
    setTitle('');
    setRichContent('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTitle('');
    setRichContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add New Page to "{folderName}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div>
            <Label htmlFor="page-title">Page Title *</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title..."
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="page-category">Category (Folder)</Label>
            <Input
              id="page-category"
              value={folderName}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label>Content (Rich Editor)</Label>
            <div className="mt-1">
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                placeholder="Start writing your page content... Use the toolbar to format text, add headings, lists, images, videos, and more."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>
            <FileText className="h-4 w-4 mr-2" />
            Add Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
