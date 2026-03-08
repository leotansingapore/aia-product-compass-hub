import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, Edit, Check, X, Folder } from 'lucide-react';

interface FolderManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialName?: string;
  parentPath?: string | null;   // non-null = creating sub-folder
  onSave: (name: string) => void;
}

export function FolderManagementDialog({
  open,
  onOpenChange,
  mode,
  initialName = '',
  parentPath = null,
  onSave
}: FolderManagementDialogProps) {
  const [folderName, setFolderName] = useState(initialName);

  // Sync when dialog opens with new initialName
  useEffect(() => {
    if (open) setFolderName(initialName);
  }, [open, initialName]);

  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName.trim());
      setFolderName('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setFolderName(initialName);
    onOpenChange(false);
  };

  const isSubFolder = mode === 'create' && !!parentPath;
  const parentName = parentPath ? parentPath.split('/').pop() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onCloseAutoFocus={() => { document.body.style.pointerEvents = ''; }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <FolderPlus className="h-5 w-5" />
                {isSubFolder ? 'Add Sub-folder' : 'Create New Folder'}
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                Rename Folder
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isSubFolder && parentName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm text-muted-foreground">
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>Inside <strong className="text-foreground">{parentName}</strong></span>
            </div>
          )}

          <div>
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={isSubFolder ? `Sub-folder name...` : 'Enter folder name'}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={!folderName.trim()}>
              <Check className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
