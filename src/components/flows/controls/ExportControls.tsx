import { useRef } from 'react';
import { Download, Image, FileText, Braces, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ExportFormat = 'png' | 'pdf' | 'json';

interface ExportControlsProps {
  onExport: (format: ExportFormat) => void;
  onImportJson?: (data: { nodes: any[]; edges: any[] }) => void;
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: typeof Image }[] = [
  { format: 'png', label: 'PNG Image', icon: Image },
  { format: 'pdf', label: 'PDF Document', icon: FileText },
  { format: 'json', label: 'JSON Data', icon: Braces },
];

export function ExportControls({ onExport, onImportJson }: ExportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportJson) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
          throw new Error('Invalid flow JSON: missing nodes array');
        }
        onImportJson({
          nodes: parsed.nodes,
          edges: parsed.edges || [],
        });
      } catch {
        // Error handling done by parent via toast
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

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
        {onImportJson && (
          <>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>Import JSON</span>
            </button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </PopoverContent>
    </Popover>
  );
}
