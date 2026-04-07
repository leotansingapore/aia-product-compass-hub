import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { VideoEmbedNode } from '@/components/markdown/editor/VideoEmbedNode';
import { detectVideoEmbed } from '@/lib/video-embed-utils';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link as LinkIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, Loader2, ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MinimalRichEditorProps {
  value: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
}

// Configure turndown for clean markdown output
function createTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    hr: '---',
    blankReplacement: (_content: string, node: any) => {
      if (node.nodeName === 'BR') return '\n';
      return '\n\n';
    },
  });
  td.use(gfm);
  // Keep line breaks inside blockquotes
  td.addRule('blockquoteParagraph', {
    filter: (node: any) => {
      return node.nodeName === 'P' && node.parentNode?.nodeName === 'BLOCKQUOTE';
    },
    replacement: (content: string) => {
      return content + '\n>\n';
    },
  });
  // Preserve images as markdown
  td.addRule('image', {
    filter: 'img',
    replacement: (_content: string, node: any) => {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    },
  });
  // Preserve video embeds as markdown link on its own line
  td.addRule('videoEmbed', {
    filter: (node: any) => {
      return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'video-embed';
    },
    replacement: (_content: string, node: any) => {
      const src = node.getAttribute('data-src') || '';
      const platform = node.getAttribute('data-platform') || 'video';
      return `\n[${platform} video](${src})\n`;
    },
  });
  return td;
}

const turndown = createTurndown();

// Convert markdown to HTML using marked
function mdToHtml(md: string): string {
  if (!md) return '';
  try {
    // Strip lone `>` lines used as visual spacers — they produce empty blockquotes
    const cleaned = md.replace(/^>\s*$/gm, '');
    const result = marked.parse(cleaned, { async: false, gfm: true, breaks: true });
    return typeof result === 'string' ? result : '';
  } catch {
    return md.replace(/\n/g, '<br>');
  }
}

// Convert HTML to markdown using turndown
function htmlToMd(html: string): string {
  if (!html || html === '<p></p>') return '';
  try {
    return turndown.turndown(html).trim();
  } catch {
    return html.replace(/<[^>]*>/g, '');
  }
}

async function uploadImageToStorage(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be under 10 MB');
  const ext = file.name.split('.').pop() || 'png';
  const path = `editor-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('knowledge-files').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('knowledge-files').getPublicUrl(path);
  return data.publicUrl;
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
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef(value);
  const isInitializedRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stable ref so paste/drop handlers in useEditor can call uploadImageToStorage
  // without needing a reference to `editor` (which isn't declared yet).
  const setIsUploadingRef = useRef(setIsUploading);
  setIsUploadingRef.current = setIsUploading;

  // We keep a ref to the editor instance for the paste/drop handlers
  // defined inside useEditor (which run before the hook returns).
  const editorInstanceRef = useRef<ReturnType<typeof useEditor> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        horizontalRule: {},
        blockquote: {},
        bulletList: {},
        orderedList: {},
        codeBlock: {},
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary hover:underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-md my-2' },
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      VideoEmbedNode,
    ],
    content: mdToHtml(value),
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[120px] p-3 text-sm leading-relaxed focus:outline-none',
          'prose prose-sm dark:prose-invert max-w-none',
          '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-foreground [&_h1]:border-b [&_h1]:border-border/50 [&_h1]:pb-1',
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-foreground',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-foreground',
          '[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:not-italic',
          '[&_table]:border-collapse [&_table]:w-full [&_table]:text-sm',
          '[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted/50 [&_th]:text-left [&_th]:font-medium',
          '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1',
          '[&_hr]:my-3 [&_hr]:border-border',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
          '[&_img]:max-w-full [&_img]:rounded-md [&_img]:my-2',
        ),
      },
      handleKeyDown: (_, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && onSave) {
          event.preventDefault();
          onSave();
          return true;
        }
        if (event.key === 'Escape' && onCancel) {
          event.preventDefault();
          onCancel();
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (!file) return false;
          setIsUploadingRef.current(true);
          uploadImageToStorage(file)
            .then(url => {
              editorInstanceRef.current?.chain().focus().setImage({ src: url, alt: file.name }).run();
            })
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to upload image'))
            .finally(() => setIsUploadingRef.current(false));
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFile = files.find(f => f.type.startsWith('image/'));
        if (imageFile) {
          event.preventDefault();
          setIsUploadingRef.current(true);
          uploadImageToStorage(imageFile)
            .then(url => {
              editorInstanceRef.current?.chain().focus().setImage({ src: url, alt: imageFile.name }).run();
            })
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to upload image'))
            .finally(() => setIsUploadingRef.current(false));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingRef.current) return;
      // Skip the initial onUpdate that fires when TipTap first renders content
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        return;
      }
      const md = htmlToMd(ed.getHTML());
      lastValueRef.current = md;
      onChange(md);
    },
  });

  // Keep the stable ref in sync
  useEffect(() => {
    editorInstanceRef.current = editor;
  }, [editor]);

  // Sync external value changes (e.g. AI classification filling in content)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    isUpdatingRef.current = true;
    editor.commands.setContent(mdToHtml(value));
    isUpdatingRef.current = false;
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success('Image added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleInsertVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Paste a YouTube, Vimeo, or Loom URL');
    if (!url) return;
    const info = detectVideoEmbed(url.trim());
    if (!info.isVideo || !info.embedUrl) {
      toast.error('Unsupported video URL. Supports YouTube, Vimeo, and Loom.');
      return;
    }
    editor.chain().focus().insertContent({
      type: 'videoEmbed',
      attrs: { src: url.trim(), embedUrl: info.embedUrl, platform: info.platform },
    }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="space-y-0">
      {showToolbar && (
        <div className="flex items-center gap-0.5 p-1.5 border-b border-border/40 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("h-7 w-7 p-0", editor.isActive('bold') && "bg-muted")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("h-7 w-7 p-0", editor.isActive('italic') && "bg-muted")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={cn("h-7 w-7 p-0", editor.isActive('link') && "bg-muted")}
            title="Link (Ctrl+K)"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn("h-7 px-1.5 text-xs font-bold", editor.isActive('heading', { level: 1 }) && "bg-muted")}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn("h-7 px-1.5 text-xs font-bold", editor.isActive('heading', { level: 2 }) && "bg-muted")}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn("h-7 px-1.5 text-xs font-bold", editor.isActive('heading', { level: 3 }) && "bg-muted")}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn("h-7 w-7 p-0", editor.isActive('bulletList') && "bg-muted")}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn("h-7 w-7 p-0", editor.isActive('orderedList') && "bg-muted")}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn("h-7 w-7 p-0", editor.isActive('blockquote') && "bg-muted")}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-7 w-7 p-0"
            title="Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          {/* Image upload button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 w-7 p-0"
            title="Insert image (or paste / drop)"
            disabled={isUploading}
          >
            {isUploading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <ImageIcon className="h-3.5 w-3.5" />
            }
          </Button>
          {/* Video embed button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInsertVideo}
            className="h-7 w-7 p-0"
            title="Embed video (YouTube, Vimeo, Loom)"
          >
            <Video className="h-3.5 w-3.5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground bg-muted/40 border-b border-border/30">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading image…
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
