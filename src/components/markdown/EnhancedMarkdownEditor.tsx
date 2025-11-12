import { useRef, useCallback, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heading1, Heading2, Heading3, Heading4, 
  Bold, Italic, Strikethrough, Code, 
  List, ListOrdered, Quote, Image, Link2, 
  Minus, Video 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown-config';

interface EnhancedMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EnhancedMarkdownEditor({ value, onChange, placeholder }: EnhancedMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const syncingScroll = useRef(false);

  // Debounce preview rendering for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 150);
    return () => clearTimeout(timer);
  }, [value]);

  // Synchronized scrolling
  const handleTextareaScroll = useCallback(() => {
    if (syncingScroll.current || !textareaRef.current || !previewRef.current) return;
    syncingScroll.current = true;
    
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    
    setTimeout(() => { syncingScroll.current = false; }, 10);
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (syncingScroll.current || !textareaRef.current || !previewRef.current) return;
    syncingScroll.current = true;
    
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    textarea.scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight);
    
    setTimeout(() => { syncingScroll.current = false; }, 10);
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', 'italic text');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', 'link text');
          break;
      }
    }

    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
    }

    // Auto-pair brackets and quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    if (pairs[e.key] && !modKey) {
      const textarea = textareaRef.current;
      if (textarea && textarea.selectionStart === textarea.selectionEnd) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const newText = value.substring(0, start) + e.key + pairs[e.key] + value.substring(start);
        onChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 1);
        }, 0);
      }
    }
  }, [value, onChange, insertMarkdown, insertAtCursor]);

  const toolbarButtons = [
    { icon: Heading1, label: 'H1', action: () => insertAtCursor('\n# ') },
    { icon: Heading2, label: 'H2', action: () => insertAtCursor('\n## ') },
    { icon: Heading3, label: 'H3', action: () => insertAtCursor('\n### ') },
    { icon: Heading4, label: 'H4', action: () => insertAtCursor('\n#### ') },
    { icon: Bold, label: 'Bold (Cmd/Ctrl+B)', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic (Cmd/Ctrl+I)', action: () => insertMarkdown('*', '*', 'italic text') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => insertMarkdown('~~', '~~', 'strikethrough') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: List, label: 'Bullet List', action: () => insertAtCursor('\n- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('\n1. ') },
    { icon: Quote, label: 'Quote', action: () => insertAtCursor('\n> ') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![', '](url)', 'alt text') },
    { icon: Link2, label: 'Link (Cmd/Ctrl+K)', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: Minus, label: 'Divider', action: () => insertAtCursor('\n\n---\n\n') },
    { icon: Video, label: 'Video Link', action: () => insertMarkdown('[🎥 ', '](video-url)', 'Video Title') },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            className="h-8 w-8 p-0"
            title={button.label}
            type="button"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Side-by-side Editor and Preview */}
      <div className="grid grid-cols-2 gap-4 border rounded-lg overflow-hidden" style={{ height: '600px' }}>
        {/* Markdown Input */}
        <div className="border-r">
          <div className="bg-muted/30 px-3 py-2 border-b">
            <span className="text-xs font-medium text-muted-foreground">Markdown</span>
          </div>
          <ScrollArea className="h-[calc(600px-41px)]">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleTextareaScroll}
              placeholder={placeholder || 'Write your content using markdown...'}
              className="font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-full"
              style={{ height: 'calc(600px - 41px)' }}
            />
          </ScrollArea>
        </div>

        {/* Live Preview */}
        <div>
          <div className="bg-muted/30 px-3 py-2 border-b">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
          </div>
          <ScrollArea className="h-[calc(600px-41px)]">
            <div 
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="p-6 overflow-auto"
              style={{ height: 'calc(600px - 41px)' }}
            >
              {debouncedValue ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                  >
                    {debouncedValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Live preview will appear here as you type...</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Shortcuts:</span> Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic), Cmd/Ctrl+K (link), Tab (indent)
      </div>
    </div>
  );
}
