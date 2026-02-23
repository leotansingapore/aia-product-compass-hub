import { useEffect, useRef, useState } from 'react';
import {
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Quote, FileCode, Minus, Table, Image, Video, Info, AlertTriangle, Lightbulb,
} from 'lucide-react';

interface SlashCommandMenuProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (command: string) => void;
  onClose: () => void;
}

const commands = [
  { id: 'heading1', label: 'Heading 1', description: 'Large section heading', icon: Heading1, group: 'Text' },
  { id: 'heading2', label: 'Heading 2', description: 'Medium section heading', icon: Heading2, group: 'Text' },
  { id: 'heading3', label: 'Heading 3', description: 'Small section heading', icon: Heading3, group: 'Text' },
  { id: 'bullet-list', label: 'Bullet List', description: 'Unordered list', icon: List, group: 'Lists' },
  { id: 'ordered-list', label: 'Numbered List', description: 'Ordered list', icon: ListOrdered, group: 'Lists' },
  { id: 'task-list', label: 'Task List', description: 'Checklist with checkboxes', icon: CheckSquare, group: 'Lists' },
  { id: 'blockquote', label: 'Quote', description: 'Block quote', icon: Quote, group: 'Blocks' },
  { id: 'code-block', label: 'Code Block', description: 'Fenced code block', icon: FileCode, group: 'Blocks' },
  { id: 'divider', label: 'Divider', description: 'Horizontal separator', icon: Minus, group: 'Blocks' },
  { id: 'table', label: 'Table', description: '3x3 table with header', icon: Table, group: 'Media' },
  { id: 'image', label: 'Image', description: 'Upload or link an image', icon: Image, group: 'Media' },
  { id: 'video', label: 'Video', description: 'YouTube, Vimeo, or Loom', icon: Video, group: 'Media' },
  { id: 'callout-info', label: 'Info Callout', description: 'Informational note', icon: Info, group: 'Callouts' },
  { id: 'callout-warning', label: 'Warning', description: 'Warning callout', icon: AlertTriangle, group: 'Callouts' },
  { id: 'callout-tip', label: 'Tip', description: 'Helpful tip', icon: Lightbulb, group: 'Callouts' },
];

export function SlashCommandMenu({ query, position, onSelect, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = commands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.group.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (filtered.length === 0) {
    return (
      <div
        ref={menuRef}
        className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg p-3 text-sm text-muted-foreground animate-in fade-in-0 zoom-in-95"
        style={{ top: position.top, left: position.left, minWidth: 240 }}
      >
        No matching commands
      </div>
    );
  }

  // Group items
  const groups: Record<string, typeof filtered> = {};
  filtered.forEach((cmd) => {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group].push(cmd);
  });

  let globalIndex = 0;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 max-h-[340px] overflow-y-auto"
      style={{ top: position.top, left: position.left, minWidth: 260 }}
    >
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
            {group}
          </div>
          {items.map((cmd) => {
            const idx = globalIndex++;
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                data-index={idx}
                onClick={() => onSelect(cmd.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-primary/10 text-foreground'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  idx === selectedIndex ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cmd.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
