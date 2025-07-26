import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinimalRichEditorProps {
  value: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
}

export function MinimalRichEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = "Start typing...",
  autoFocus = false,
  showToolbar = true
}: MinimalRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = convertTextToHtml(value);
    }
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  // Convert plain text with basic markdown to HTML
  const convertTextToHtml = (text: string): string => {
    if (!text) return '';
    
    return text
      // Convert URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert line breaks
      .replace(/\n/g, '<br>');
  };

  // Convert HTML back to plain text with markdown
  const convertHtmlToText = (html: string): string => {
    if (!html) return '';
    
    return html
      // Convert links back to URLs
      .replace(/<a[^>]*href="([^"]*)"[^>]*>.*?<\/a>/g, '$1')
      // Convert <strong> to **bold**
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      // Convert <em> to *italic*
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      // Convert <br> to line breaks
      .replace(/<br\s*\/?>/g, '\n')
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = convertHtmlToText(editorRef.current.innerHTML);
      onChange(content);
    }
  }, [onChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Cmd+B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Handle Cmd+I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    // Handle Cmd+K for link
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      handleAddLink();
    }
    // Handle Enter for save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSave) {
      e.preventDefault();
      onSave();
    }
    // Handle Escape for cancel
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const handleAddLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        setShowLinkInput(true);
        setTimeout(() => {
          linkInputRef.current?.focus();
        }, 100);
      } else {
        const url = prompt('Enter URL:');
        if (url) {
          execCommand('createLink', url);
        }
      }
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const html = convertTextToHtml(text);
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  return (
    <div className="space-y-2">
      {showToolbar && (
        <div className="flex items-center gap-1 p-2 border-b border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddLink}
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', 'h3')}
            className="h-8 w-8 p-0"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
          <input
            ref={linkInputRef}
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                insertLink();
              }
              if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
            className="flex-1 px-2 py-1 text-sm border rounded bg-background"
          />
          <Button size="sm" onClick={insertLink} disabled={!linkUrl}>
            Add
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "min-h-[120px] p-3 text-sm leading-relaxed",
          "focus:outline-none focus:ring-0",
          "prose prose-sm max-w-none",
          "[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline",
          "[&_strong]:font-semibold [&_em]:italic",
          "placeholder:text-muted-foreground",
          !value && "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        )}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}