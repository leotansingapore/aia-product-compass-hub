import { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heading1, Heading2, Heading3, Heading4, 
  Bold, Italic, Strikethrough, Code, 
  List, ListOrdered, Quote, Image, Link2, 
  Minus, Video 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown-config';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newText);

    // Set cursor position after insertion
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

  const toolbarButtons = [
    { icon: Heading1, label: 'H1', action: () => insertAtCursor('\n# ') },
    { icon: Heading2, label: 'H2', action: () => insertAtCursor('\n## ') },
    { icon: Heading3, label: 'H3', action: () => insertAtCursor('\n### ') },
    { icon: Heading4, label: 'H4', action: () => insertAtCursor('\n#### ') },
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'italic text') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => insertMarkdown('~~', '~~', 'strikethrough') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: List, label: 'Bullet List', action: () => insertAtCursor('\n- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('\n1. ') },
    { icon: Quote, label: 'Quote', action: () => insertAtCursor('\n> ') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![', '](url)', 'alt text') },
    { icon: Link2, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: Minus, label: 'Divider', action: () => insertAtCursor('\n\n---\n\n') },
    { icon: Video, label: 'Video Link', action: () => insertMarkdown('[🎥 ', '](video-url)', 'Video Title') },
  ];

  return (
    <div className="space-y-2">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="mt-0 space-y-2">
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

          {/* Editor */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your content using markdown...'}
            rows={20}
            className="font-mono text-sm resize-none"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="border rounded-lg p-6 bg-card min-h-[500px]">
            {value ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nothing to preview yet. Start writing in the Edit tab.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
