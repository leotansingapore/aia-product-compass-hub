import React, { useState, useRef, useEffect } from 'react';
import { SlashCommandMenu } from './SlashCommandMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { useAutoSave } from '../../hooks/useAutoSave';

interface NotionStyleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
}

export function NotionStyleEditor({ 
  value, 
  onChange, 
  onSave, 
  placeholder = "Type '/' for commands...",
  autoFocus = false 
}: NotionStyleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  const { debouncedSave } = useAutoSave({ onSave });

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = convertTextToHtml(value);
    }
  }, [value]);

  const convertTextToHtml = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-2 mb-1">$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-border pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">1. $1</li>')
      .replace(/^--- *$/gm, '<hr class="my-4 border-border">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>')
      .split('\n').join('<br>');
  };

  const convertHtmlToText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    const textContent = convertHtmlToText(content);
    onChange(textContent);
    debouncedSave(textContent);

    // Check for slash command
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || '';
      
      if (textBeforeCursor.endsWith('/')) {
        const rect = range.getBoundingClientRect();
        setSlashPosition({ x: rect.left, y: rect.top });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top 
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Hide slash menu on escape
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setShowFloatingToolbar(false);
      return;
    }

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'k':
          e.preventDefault();
          handleAddLink();
          break;
      }
    }

    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      const content = convertHtmlToText(editorRef.current.innerHTML);
      onChange(content);
      debouncedSave(content);
    }
  };

  const handleSlashCommand = (command: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Remove the '/' character
      if (range.startOffset > 0) {
        range.setStart(range.startContainer, range.startOffset - 1);
        range.deleteContents();
      }

      let insertText = '';
      switch (command) {
        case 'heading1':
          insertText = '# ';
          break;
        case 'heading2':
          insertText = '## ';
          break;
        case 'heading3':
          insertText = '### ';
          break;
        case 'bullet':
          insertText = '- ';
          break;
        case 'numbered':
          insertText = '1. ';
          break;
        case 'todo':
          insertText = '- [ ] ';
          break;
        case 'quote':
          insertText = '> ';
          break;
        case 'code':
          insertText = '`code`';
          break;
        case 'divider':
          insertText = '---';
          break;
      }

      document.execCommand('insertText', false, insertText);
      
      if (editorRef.current) {
        const content = convertHtmlToText(editorRef.current.innerHTML);
        onChange(content);
        debouncedSave(content);
      }
    }
    setShowSlashMenu(false);
  };

  const handleAddLink = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setLinkInputVisible(true);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      document.execCommand('createLink', false, linkUrl);
      if (editorRef.current) {
        const content = convertHtmlToText(editorRef.current.innerHTML);
        onChange(content);
        debouncedSave(content);
      }
    }
    setLinkInputVisible(false);
    setLinkUrl('');
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[100px] p-4 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground prose prose-sm max-w-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        data-placeholder={placeholder}
        style={{
          lineHeight: '1.6',
        }}
      />

      {showSlashMenu && (
        <SlashCommandMenu
          onCommand={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          position={slashPosition}
        />
      )}

      {showFloatingToolbar && (
        <FloatingToolbar
          onFormat={execCommand}
          onLink={handleAddLink}
          position={toolbarPosition}
          visible={showFloatingToolbar}
        />
      )}

      {linkInputVisible && (
        <div className="absolute top-0 left-0 right-0 p-2 bg-card border border-border rounded-md shadow-lg z-50">
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 px-2 py-1 text-sm border border-border rounded"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink();
                } else if (e.key === 'Escape') {
                  setLinkInputVisible(false);
                  setLinkUrl('');
                }
              }}
            />
            <button
              onClick={insertLink}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}