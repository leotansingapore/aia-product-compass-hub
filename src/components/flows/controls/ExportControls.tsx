import { Download, Image, FileText, Braces } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ExportFormat = 'png' | 'pdf' | 'json';

interface ExportControlsProps {
  onExport: (format: ExportFormat) => void;
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: typeof Image }[] = [
  { format: 'png', label: 'PNG Image', icon: Image },
  { format: 'pdf', label: 'PDF Document', icon: FileText },
  { format: 'json', label: 'JSON Data', icon: Braces },
];

export function ExportControls({ onExport }: ExportControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {EXPORT_OPTIONS.map(({ format, label, icon: Icon }) => (
          <button
            key={format}
            onClick={() => onExport(format)}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
