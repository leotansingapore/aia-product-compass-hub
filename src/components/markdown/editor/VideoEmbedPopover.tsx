import { useState, useRef, useEffect } from 'react';
import { Video, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface VideoEmbedPopoverProps {
  onEmbed: (url: string) => void;
  onClose: () => void;
}

export function VideoEmbedPopover({ onEmbed, onClose }: VideoEmbedPopoverProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onEmbed(url.trim());
    }
  };

  return (
    <div className="absolute inset-x-0 top-0 z-50 flex justify-center pt-16 pointer-events-none">
      <div
        ref={containerRef}
        className="pointer-events-auto bg-popover border border-border rounded-lg shadow-lg p-4 w-full max-w-md animate-in fade-in-0 slide-in-from-top-2"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Video className="h-4 w-4 text-primary" />
            Embed Video
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube, Vimeo, or Loom URL..."
            className="text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Supports YouTube, Vimeo, and Loom
            </p>
            <Button type="submit" size="sm" disabled={!url.trim()}>
              Embed
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
