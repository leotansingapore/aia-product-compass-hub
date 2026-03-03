import { Button } from '@/components/ui/button';
import { Link2, FileText, Trash2 } from 'lucide-react';
import type { UsefulLink, VideoAttachment } from '@/hooks/useProducts';

export interface ResourceItem {
  type: 'link' | 'file';
  label: string;
  url: string;
  id?: string; // for files
  fileType?: string;
}

interface ModuleResourcesSectionProps {
  links: UsefulLink[];
  attachments: VideoAttachment[];
  isAdmin?: boolean;
  onDeleteLink?: (index: number) => void;
  onDeleteAttachment?: (id: string) => void;
}

function getFileIcon(fileType?: string) {
  const ft = (fileType || '').toLowerCase();
  if (ft === 'pdf') {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">PDF</span>;
  }
  return <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
}

export function ModuleResourcesSection({
  links,
  attachments,
  isAdmin = false,
  onDeleteLink,
  onDeleteAttachment,
}: ModuleResourcesSectionProps) {
  const hasResources = (links?.length || 0) > 0 || (attachments?.length || 0) > 0;

  if (!hasResources) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">Resources</h3>
      <div className="space-y-1.5">
        {/* Links */}
        {links?.map((link, index) => (
          <div key={`link-${index}`} className="flex items-center justify-between gap-2 group">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {link.name}
              </a>
            </div>
            {isAdmin && onDeleteLink && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => onDeleteLink(index)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}

        {/* Attachments / Files */}
        {attachments?.map((att) => (
          <div key={`file-${att.id}`} className="flex items-center justify-between gap-2 group">
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(att.file_type)}
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {att.name}
              </a>
            </div>
            {isAdmin && onDeleteAttachment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => onDeleteAttachment(att.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
