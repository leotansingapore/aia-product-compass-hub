import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, Type, List } from "lucide-react";
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

  // Convert markdown text to HTML for display
  const convertTextToHtml = (text: string): string => {
    if (!text) return '';

    const lines = text.split('\n');
    const htmlLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        // First row = header, second row = separator (skip), rest = body
        const headerCells = tableRows[0].split('|').map(c => c.trim()).filter(Boolean);
        let html = '<table class="border-collapse w-full text-sm my-2"><thead><tr>';
        headerCells.forEach(c => { html += `<th class="border border-border px-2 py-1 bg-muted/50 text-left font-medium">${inlineMarkdown(c)}</th>`; });
        html += '</tr></thead><tbody>';
        for (let r = 2; r < tableRows.length; r++) {
          const cells = tableRows[r].split('|').map(c => c.trim()).filter(Boolean);
          html += '<tr>';
          cells.forEach(c => { html += `<td class="border border-border px-2 py-1">${inlineMarkdown(c)}</td>`; });
          html += '</tr>';
        }
        html += '</tbody></table>';
        htmlLines.push(html);
        tableRows = [];
      }
      inTable = false;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Table row detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Skip separator rows like |---|---|
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
          if (!inTable) { inTable = true; }
          tableRows.push(trimmed);
          continue;
        }
        inTable = true;
        tableRows.push(trimmed);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        htmlLines.push('<hr class="my-3 border-border">');
        continue;
      }

      // Headings
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const sizes: Record<number, string> = { 1: 'text-xl font-bold', 2: 'text-lg font-semibold', 3: 'text-base font-semibold', 4: 'text-sm font-semibold', 5: 'text-sm font-medium', 6: 'text-xs font-medium' };
        htmlLines.push(`<div class="${sizes[level] || sizes[3]} mt-2 mb-1">${inlineMarkdown(headingMatch[2])}</div>`);
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const content = trimmed.replace(/^>\s?/, '');
        htmlLines.push(`<div class="border-l-2 border-primary/40 pl-3 text-muted-foreground italic my-0.5">${inlineMarkdown(content)}</div>`);
        continue;
      }

      // Unordered list
      if (/^[-*+]\s/.test(trimmed)) {
        const content = trimmed.replace(/^[-*+]\s+/, '');
        htmlLines.push(`<div class="flex gap-1.5 ml-2"><span class="text-muted-foreground">•</span><span>${inlineMarkdown(content)}</span></div>`);
        continue;
      }

      // Checkbox items
      if (/^[-*]\s\[[ x]\]/.test(trimmed)) {
        const checked = trimmed.includes('[x]');
        const content = trimmed.replace(/^[-*]\s\[[ x]\]\s*/, '');
        htmlLines.push(`<div class="flex gap-1.5 ml-2"><span>${checked ? '✅' : '☐'}</span><span>${inlineMarkdown(content)}</span></div>`);
        continue;
      }

      // Empty line
      if (!trimmed) {
        htmlLines.push('<br>');
        continue;
      }

      // Regular paragraph
      htmlLines.push(`<div>${inlineMarkdown(trimmed)}</div>`);
    }

    flushTable();
    return htmlLines.join('');
  };

  // Convert inline markdown (bold, italic, links, code)
  const inlineMarkdown = (text: string): string => {
    return text
      // Markdown links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // Bare URLs
      .replace(/(?<!\])\((https?:\/\/[^\s)]+)\)|(?<!["\w/])(https?:\/\/[^\s<]+)/g, (match, g1, g2) => {
        const url = g1 || g2;
        if (!url) return match;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>');
  };

  // Convert HTML back to plain text with markdown
  const convertHtmlToText = (html: string): string => {
    if (!html) return '';
    
    return html
      // Convert list items to markdown bullets
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      // Remove list wrappers
      .replace(/<\/?ul[^>]*>/g, '')
      .replace(/<\/?ol[^>]*>/g, '')
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
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('formatBlock', 'h3')}
            className="h-8 w-8 p-0"
            title="Heading"
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