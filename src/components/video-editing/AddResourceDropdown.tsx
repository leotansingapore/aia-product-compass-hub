import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Link2, Upload, FileText, FileIcon } from 'lucide-react';
import { AddLinkDialog } from './AddLinkDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VideoAttachment } from '@/hooks/useProducts';

interface AddResourceDropdownProps {
  onAddLink: (label: string, url: string) => void;
  onAddFile: (attachment: VideoAttachment) => void;
  onShowTranscript: () => void;
}

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp';
const MAX_LABEL_LENGTH = 34;

function getFileIcon(ext: string) {
  if (ext.toLowerCase() === 'pdf') return '📕';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext.toLowerCase())) return '🖼️';
  return '📄';
}

export function AddResourceDropdown({ onAddLink, onAddFile, onShowTranscript }: AddResourceDropdownProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showFileLabelDialog, setShowFileLabelDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; url: string; size: number; ext: string } | null>(null);
  const [fileLabel, setFileLabel] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || '';
      const filePath = `resources/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('knowledge-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('knowledge-files')
        .getPublicUrl(data.path);

      // Show label dialog with the uploaded file info
      setPendingFile({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        ext: ext.toUpperCase(),
      });
      setFileLabel('');
      setShowFileLabelDialog(true);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileLabelConfirm = () => {
    if (!pendingFile) return;
    const attachment: VideoAttachment = {
      id: Date.now().toString(),
      name: fileLabel.trim() || pendingFile.name,
      url: pendingFile.url,
      file_size: pendingFile.size,
      file_type: pendingFile.ext,
    };
    onAddFile(attachment);
    toast.success('File added');
    setShowFileLabelDialog(false);
    setPendingFile(null);
    setFileLabel('');
  };

  const handleFileLabelCancel = () => {
    setShowFileLabelDialog(false);
    setPendingFile(null);
    setFileLabel('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1 font-semibold" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'ADD'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background">
          <DropdownMenuItem onClick={() => setShowLinkDialog(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Add resource link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Add resource file
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShowTranscript}>
            <FileText className="h-4 w-4 mr-2" />
            Add transcript
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleFileUpload}
      />

      <AddLinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onAdd={onAddLink}
      />

      {/* File label dialog — shown after upload */}
      <Dialog open={showFileLabelDialog} onOpenChange={setShowFileLabelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add file</DialogTitle>
          </DialogHeader>

          {pendingFile && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">{getFileIcon(pendingFile.ext)}</span>
              <span className="truncate text-muted-foreground">{pendingFile.name}</span>
            </div>
          )}

          <div className="space-y-2 py-2">
            <Input
              value={fileLabel}
              onChange={(e) => setFileLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))}
              maxLength={MAX_LABEL_LENGTH}
              placeholder="Label"
            />
            <p className="text-xs text-muted-foreground text-right">
              {fileLabel.length} / {MAX_LABEL_LENGTH}
            </p>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="ghost" onClick={handleFileLabelCancel}>
              CANCEL
            </Button>
            <Button
              onClick={handleFileLabelConfirm}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold"
            >
              ADD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
