import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Link2, Upload, FileText } from 'lucide-react';
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

export function AddResourceDropdown({ onAddLink, onAddFile, onShowTranscript }: AddResourceDropdownProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB');
      return;
    }

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

      const attachment: VideoAttachment = {
        id: Date.now().toString(),
        name: file.name,
        url: urlData.publicUrl,
        file_size: file.size,
        file_type: ext.toUpperCase(),
      };

      onAddFile(attachment);
      toast.success('File uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1 font-semibold">
            ADD
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background">
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
    </>
  );
}
