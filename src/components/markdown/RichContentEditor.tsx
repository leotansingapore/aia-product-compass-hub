import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useState, useCallback, useRef, useEffect } from 'react';
import { marked } from 'marked';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorBubbleToolbar } from './editor/EditorBubbleToolbar';
import { SlashCommandMenu } from './editor/SlashCommandMenu';
import { VideoEmbedNode } from './editor/VideoEmbedNode';
import { CalloutNode } from './editor/CalloutNode';
import { VideoEmbedPopover } from './editor/VideoEmbedPopover';
import { TableControls } from './editor/TableControls';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { UsefulLink, VideoAttachment } from '@/hooks/useProducts';
import { ModuleResourcesSection } from '@/components/video-editing/ModuleResourcesSection';
import { AddResourceDropdown } from '@/components/video-editing/AddResourceDropdown';

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  // Inline title (Skool-style)
  title?: string;
  onTitleChange?: (title: string) => void;
  // Transcript below content
  transcript?: string;
  onTranscriptChange?: (transcript: string) => void;
  // Resources
  usefulLinks?: UsefulLink[];
  attachments?: VideoAttachment[];
  onAddLink?: (label: string, url: string) => void;
  onAddFile?: (attachment: VideoAttachment) => void;
  onDeleteLink?: (index: number) => void;
  onDeleteAttachment?: (id: string) => void;
  // Published toggle
  published?: boolean;
  onPublishedChange?: (published: boolean) => void;
}

// Configure marked for GFM
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Configure turndown for markdown export
function createTurndownService(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    hr: '---',
  });

  // Add GFM plugin (tables, strikethrough, task lists)
  if (turndownPluginGfm.gfm) {
    td.use(turndownPluginGfm.gfm);
  }

  // Handle video embeds
  td.addRule('videoEmbed', {
    filter: (node) => {
      return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'video-embed';
    },
    replacement: (_content, node) => {
      const src = (node as HTMLElement).getAttribute('data-src') || '';
      return `\n${src}\n`;
    },
  });

  // Handle callouts
  td.addRule('callout', {
    filter: (node) => {
      return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'callout';
    },
    replacement: (content, node) => {
      const variant = (node as HTMLElement).getAttribute('data-variant') || 'info';
      return `\n> **${variant.charAt(0).toUpperCase() + variant.slice(1)}:** ${content.trim()}\n`;
    },
  });

  return td;
}

// Detect if a URL is a video embed URL
function detectVideoUrl(url: string): { platform: string; embedUrl: string } | null {
  const patterns = [
    { regex: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/, platform: 'youtube', embed: (id: string) => `https://www.youtube.com/embed/${id}` },
    { regex: /vimeo\.com\/(\d+)/, platform: 'vimeo', embed: (id: string) => `https://player.vimeo.com/video/${id}` },
    { regex: /loom\.com\/share\/([a-zA-Z0-9]+)/, platform: 'loom', embed: (id: string) => `https://www.loom.com/embed/${id}` },
  ];

  for (const { regex, platform, embed } of patterns) {
    const match = url.match(regex);
    if (match) {
      return { platform, embedUrl: embed(match[1]) };
    }
  }
  return null;
}

// Convert markdown to HTML for Tiptap import
function markdownToHtml(md: string): string {
  if (!md || md.trim() === '') return '<p></p>';

  // Pre-process: convert standalone video URLs to video-embed divs
  const lines = md.split('\n');
  const processed = lines.map((line) => {
    const trimmed = line.trim();
    const videoInfo = detectVideoUrl(trimmed);
    if (videoInfo && !trimmed.startsWith('[') && !trimmed.startsWith('!')) {
      return `<div data-type="video-embed" data-src="${trimmed}" data-embed-url="${videoInfo.embedUrl}" data-platform="${videoInfo.platform}">${videoInfo.platform}</div>`;
    }
    return line;
  });

  const html = marked.parse(processed.join('\n'));
  return typeof html === 'string' ? html : '';
}

// Convert Tiptap HTML to markdown for storage
function htmlToMarkdown(html: string): string {
  const td = createTurndownService();
  return td.turndown(html);
}

export function RichContentEditor({
  value,
  onChange,
  placeholder = 'Start writing, or type "/" for commands...',
  className,
  autoSave = false,
  onSaveStatusChange,
  title,
  onTitleChange,
  transcript,
  onTranscriptChange,
  usefulLinks,
  attachments,
  onAddLink,
  onAddFile,
  onDeleteLink,
  onDeleteAttachment,
  published,
  onPublishedChange,
}: RichContentEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showTranscript, setShowTranscript] = useState(!!(transcript && transcript.trim()));
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [showVideoPopover, setShowVideoPopover] = useState(false);
  const [showSourceView, setShowSourceView] = useState(false);
  const [sourceValue, setSourceValue] = useState('');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalUpdate = useRef(false);
  const lastExternalValue = useRef(value);

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return null;
    }
    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `editor-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('knowledge-files')
        .upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('knowledge-files')
        .getPublicUrl(data.path);
      toast.success('Image uploaded');
      return urlData.publicUrl;
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {
          HTMLAttributes: { class: 'hljs' },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'tiptap-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapImage.configure({
        HTMLAttributes: { class: 'tiptap-image' },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Highlight,
      Typography,
      VideoEmbedNode,
      CalloutNode,
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: 'rich-content-editor-body prose prose-sm max-w-none dark:prose-invert focus:outline-none',
      },
      handlePaste: (view, event) => {
        // Handle image paste
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                handleImageUpload(file).then((url) => {
                  if (url && editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                });
              }
              return true;
            }
          }
        }

        // Handle video URL paste
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          const videoInfo = detectVideoUrl(text.trim());
          if (videoInfo) {
            event.preventDefault();
            if (editor) {
              editor.chain().focus().insertContent({
                type: 'videoEmbed',
                attrs: {
                  src: text.trim(),
                  embedUrl: videoInfo.embedUrl,
                  platform: videoInfo.platform,
                },
              }).run();
            }
            return true;
          }

          // Handle markdown paste - detect if it looks like markdown
          const html = event.clipboardData?.getData('text/html');
          if (!html && looksLikeMarkdown(text)) {
            event.preventDefault();
            const convertedHtml = markdownToHtml(text);
            if (editor) {
              editor.chain().focus().insertContent(convertedHtml).run();
            }
            return true;
          }
        }

        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(files[i]).then((url) => {
                if (url && editor) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              });
              return true;
            }
          }
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        // Slash command trigger
        if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
          const { from } = view.state.selection;
          const textBefore = view.state.doc.textBetween(
            Math.max(0, from - 1),
            from,
            '\n'
          );
          if (from === 0 || textBefore === '' || textBefore === '\n' || textBefore === ' ') {
            setTimeout(() => {
              const coords = view.coordsAtPos(from);
              if (coords && editorContainerRef.current) {
                const containerRect = editorContainerRef.current.getBoundingClientRect();
                setSlashMenuPos({
                  top: coords.bottom - containerRect.top + 4,
                  left: coords.left - containerRect.left,
                });
                setSlashQuery('');
                setShowSlashMenu(true);
              }
            }, 10);
          }
        }

        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false);
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (isInternalUpdate.current) return;

      const html = editor.getHTML();
      const md = htmlToMarkdown(html);

      isInternalUpdate.current = true;
      onChange(md);
      lastExternalValue.current = md;
      isInternalUpdate.current = false;

      // Auto-save with debounce
      if (autoSave && onSaveStatusChange) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        onSaveStatusChange('saving');
        saveTimeoutRef.current = setTimeout(() => {
          onSaveStatusChange('saved');
          setTimeout(() => onSaveStatusChange('idle'), 2000);
        }, 1500);
      }

      // Update slash command query
      if (showSlashMenu) {
        const { from } = editor.state.selection;
        const text = editor.state.doc.textBetween(
          Math.max(0, from - 20),
          from
        );
        const slashIndex = text.lastIndexOf('/');
        if (slashIndex >= 0) {
          setSlashQuery(text.slice(slashIndex + 1));
        } else {
          setShowSlashMenu(false);
        }
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (!editor || isInternalUpdate.current) return;
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      isInternalUpdate.current = true;
      const html = markdownToHtml(value);
      editor.commands.setContent(html, { emitUpdate: false });
      isInternalUpdate.current = false;
    }
  }, [value, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleSlashCommand = useCallback((command: string) => {
    if (!editor) return;
    setShowSlashMenu(false);

    const { from } = editor.state.selection;
    const text = editor.state.doc.textBetween(Math.max(0, from - 20), from);
    const slashIndex = text.lastIndexOf('/');
    if (slashIndex >= 0) {
      const deleteFrom = from - (text.length - slashIndex);
      editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
    }

    switch (command) {
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bullet-list':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'ordered-list':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'task-list':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'code-block':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'divider':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case 'image':
        handleImageInsert();
        break;
      case 'video':
        setShowVideoPopover(true);
        break;
      case 'callout-info':
        editor.chain().focus().insertContent({
          type: 'callout',
          attrs: { variant: 'info' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Info callout' }] }],
        }).run();
        break;
      case 'callout-warning':
        editor.chain().focus().insertContent({
          type: 'callout',
          attrs: { variant: 'warning' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Warning callout' }] }],
        }).run();
        break;
      case 'callout-tip':
        editor.chain().focus().insertContent({
          type: 'callout',
          attrs: { variant: 'tip' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tip callout' }] }],
        }).run();
        break;
    }
  }, [editor]);

  const handleImageInsert = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = await handleImageUpload(file);
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  const handleVideoEmbed = useCallback((url: string) => {
    if (!editor) return;
    const videoInfo = detectVideoUrl(url);
    if (videoInfo) {
      editor.chain().focus().insertContent({
        type: 'videoEmbed',
        attrs: {
          src: url,
          embedUrl: videoInfo.embedUrl,
          platform: videoInfo.platform,
        },
      }).run();
      setShowVideoPopover(false);
    } else {
      toast.error('Please enter a valid YouTube, Vimeo, or Loom URL');
    }
  }, [editor]);

  const handleToggleSource = useCallback(() => {
    if (!showSourceView) {
      if (editor) {
        const html = editor.getHTML();
        setSourceValue(htmlToMarkdown(html));
      }
    } else {
      if (editor) {
        const html = markdownToHtml(sourceValue);
        editor.commands.setContent(html, { emitUpdate: false });
        onChange(sourceValue);
      }
    }
    setShowSourceView(!showSourceView);
  }, [showSourceView, sourceValue, editor, onChange]);

  if (!editor) return null;

  return (
    <div
      ref={editorContainerRef}
      className={cn(
        'rich-content-editor border border-border rounded-lg overflow-hidden bg-card relative',
        className
      )}
    >
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onImageInsert={handleImageInsert}
        onImageUrlInsert={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
        }}
        onVideoInsert={() => setShowVideoPopover(true)}
        onToggleSource={handleToggleSource}
        isSourceView={showSourceView}
      />

      {/* Table Controls — floating near the table when cursor is inside one */}
      {!showSourceView && <TableControls editor={editor} containerRef={editorContainerRef} />}

      {/* Inline Title — Skool-style, borderless large input inside the editor card */}
      {onTitleChange !== undefined && (
        <div className="px-6 pt-6 pb-0">
          <input
            type="text"
            value={title ?? ''}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Untitled"
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
            style={{ letterSpacing: '0.02em', lineHeight: 1.2 }}
          />
        </div>
      )}

      {/* Bubble Menu */}
      {editor && !showSourceView && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => {
            const { from, to } = state.selection;
            return from !== to && !editor.isActive('codeBlock');
          }}
        >
          <EditorBubbleToolbar editor={editor} />
        </BubbleMenu>
      )}

      {/* Editor Content or Source View */}
      {showSourceView ? (
        <div className="min-h-[300px]">
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            className="w-full h-[400px] p-6 font-mono text-sm bg-muted/30 text-foreground resize-none focus:outline-none"
            placeholder="Raw markdown..."
          />
        </div>
      ) : (
        <div
          className="min-h-[300px] cursor-text"
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Resources Section */}
      {(onAddLink || (usefulLinks?.length || 0) > 0 || (attachments?.length || 0) > 0) && (
        <div className="px-6 py-4 border-t border-border mt-2 space-y-4">
          <ModuleResourcesSection
            links={usefulLinks || []}
            attachments={attachments || []}
            isAdmin={!!onAddLink}
            onDeleteLink={onDeleteLink}
            onDeleteAttachment={onDeleteAttachment}
          />
          {onAddLink && onAddFile && (
            <div className="flex items-center justify-between">
              <AddResourceDropdown
                onAddLink={onAddLink}
                onAddFile={onAddFile}
                onShowTranscript={() => setShowTranscript(true)}
              />
              {onPublishedChange !== undefined && (
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", published ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                    {published ? 'Published' : 'Draft'}
                  </span>
                  <Switch
                    checked={!!published}
                    onCheckedChange={onPublishedChange}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transcript — below resources, inside the card */}
      {onTranscriptChange !== undefined && showTranscript && (
        <div className="px-6 pb-4 pt-2 border-t border-border mt-2">
          <label className="text-sm font-semibold text-foreground block mb-2">
            Transcript
          </label>
          <textarea
            value={transcript ?? ''}
            onChange={(e) => onTranscriptChange?.(e.target.value)}
            placeholder="Add your transcript..."
            rows={6}
            className="w-full bg-muted/20 border border-border rounded-lg p-3 text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      {/* Slash Command Menu */}
      {showSlashMenu && !showSourceView && (
        <SlashCommandMenu
          query={slashQuery}
          position={slashMenuPos}
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Video Embed Popover */}
      {showVideoPopover && (
        <VideoEmbedPopover
          onEmbed={handleVideoEmbed}
          onClose={() => setShowVideoPopover(false)}
        />
      )}

    </div>
  );
}

// Heuristic: detect if pasted text looks like markdown
// Heuristic: detect if pasted text looks like markdown
function looksLikeMarkdown(text: string): boolean {
  const mdPatterns = [
    /^#{1,6}\s/m,
    /^\s*[-*+]\s/m,
    /^\s*\d+\.\s/m,
    /\*\*.+\*\*/,
    /\*.+\*/,
    /\[.+\]\(.+\)/,
    /!\[.*\]\(.+\)/,
    /^>\s/m,
    /```/,
    /^\|.+\|$/m,
    /^---$/m,
    /~~.+~~/,
  ];
  let matches = 0;
  for (const pattern of mdPatterns) {
    if (pattern.test(text)) matches++;
  }
  return matches >= 2;
}
