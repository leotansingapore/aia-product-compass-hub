import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ResizableImageNode } from '@/components/markdown/editor/ResizableImageNode';
import { InlineVideoNode } from '@/components/markdown/editor/InlineVideoNode';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { VideoEmbedNode } from '@/components/markdown/editor/VideoEmbedNode';
import { detectVideoEmbed } from '@/lib/video-embed-utils';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link as LinkIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, Loader2, ImageIcon, Video, Paperclip, FileText, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { marked } from 'marked';
import type TurndownService from 'turndown';
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

/** Call before persisting: flushes debounced edits and returns markdown from the live editor HTML. */
export type MinimalRichEditorHandle = {
  getMarkdownForSave: () => Promise<string>;
};

// Configure turndown for clean markdown output — loaded on first use
let _turndownInstance: TurndownService | null = null;
async function getTurndown(): Promise<TurndownService> {
  if (_turndownInstance) return _turndownInstance;
  const [{ default: TurndownServiceCtor }, { gfm }] = await Promise.all([
    import('turndown'),
    import('turndown-plugin-gfm'),
  ]);
  _turndownInstance = createTurndown(TurndownServiceCtor, gfm);
  return _turndownInstance;
}

/**
 * ProseMirror plugin that adds `blank-spacer` class to empty paragraphs.
 * This lets us style them with reduced margins so that pressing Enter once
 * looks like ONE blank line — not double — after the markdown roundtrip.
 */
const EmptyParagraphSpacer = Extension.create({
  name: 'emptyParagraphSpacer',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('emptyParagraphSpacer'),
        props: {
          decorations(state) {
            const ds: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && node.content.size === 0) {
                ds.push(Decoration.node(pos, pos + node.nodeSize, { class: 'blank-spacer' }));
              }
            });
            return DecorationSet.create(state.doc, ds);
          },
        },
      }),
    ];
  },
});

function createTurndown(TurndownServiceCtor: typeof TurndownService, gfm: any) {
  const td = new TurndownServiceCtor({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    hr: '---',
    // Empty blocks default to "\n\n" which marked collapses — blank lines disappear on reload.
    // TipTap empty paragraphs are often <p></p> (blank) or <p><br></p> (handled by emptyParagraphBr rule).
    blankReplacement: (_content: string, node: any) => {
      if (node.nodeName === 'BR') return '\n';
      if (node.nodeName === 'P' && node.parentNode?.nodeName !== 'BLOCKQUOTE') {
        return '\n\n&nbsp;\n\n';
      }
      return node.isBlock ? '\n\n' : '';
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
  // Preserve images as markdown — encode width/alignment/crop in alt text
  td.addRule('image', {
    filter: 'img',
    replacement: (_content: string, node: any) => {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      const width = node.getAttribute('data-width');
      const alignment = node.getAttribute('data-alignment');
      const cropX = node.getAttribute('data-crop-x');
      const cropY = node.getAttribute('data-crop-y');
      const cropW = node.getAttribute('data-crop-w');
      const cropH = node.getAttribute('data-crop-h');

      const meta: string[] = [];
      if (width && width !== 'null') meta.push(`width=${width}`);
      if (alignment && alignment !== 'center') meta.push(`align=${alignment}`);
      if (cropX && Number(cropX) !== 0) meta.push(`cx=${cropX}`);
      if (cropY && Number(cropY) !== 0) meta.push(`cy=${cropY}`);
      if (cropW && Number(cropW) !== 100) meta.push(`cw=${cropW}`);
      if (cropH && Number(cropH) !== 100) meta.push(`ch=${cropH}`);

      const altPart = meta.length > 0 ? `${alt}|${meta.join(',')}` : alt;
      return `![${altPart}](${src})`;
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
  // Preserve inline uploaded videos as markdown link
  td.addRule('inlineVideo', {
    filter: (node: any) => {
      return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'inline-video';
    },
    replacement: (_content: string, node: any) => {
      const src = node.getAttribute('data-src') || '';
      return `\n[video](${src})\n`;
    },
  });
  // <p> with only <br> (ProseMirror empty line) is not "blank" in Turndown because of hasVoid — without this,
  // it becomes "  \n" hard breaks and round-trips poorly vs Enter between real paragraphs.
  td.addRule('emptyParagraphBr', {
    filter: (node: any) => {
      if (node.nodeName !== 'P') return false;
      if (node.parentNode?.nodeName === 'BLOCKQUOTE') return false;
      const children = node.childNodes;
      if (children.length === 0) return false;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (c.nodeName === 'BR') continue;
        if (c.nodeType === 3 && /^\s*$/.test(c.textContent || '')) continue;
        return false;
      }
      return true;
    },
    replacement: () => '\n\n&nbsp;\n\n',
  });
  return td;
}

// Convert markdown to HTML using marked
function mdToHtml(md: string): string {
  if (!md) return '';
  try {
    // Strip lone `>` lines used as visual spacers — they produce empty blockquotes
    const cleaned = md.replace(/^>\s*$/gm, '');
    let result = marked.parse(cleaned, { async: false, gfm: true, breaks: true });
    if (typeof result !== 'string') return md.replace(/\n/g, '<br>');

    // Turndown stores intentional blank lines as `<p>&nbsp;</p>` so markdown round-trips. Marked renders
    // that as a normal paragraph, so prose margins stack (gap looks ~2× TipTap’s native `<p><br></p>`).
    result = result.replace(/<p>\s*(?:&nbsp;|&#160;|&#x0*A0;)\s*<\/p>/gi, '<p><br></p>');

    // Post-process: convert video markdown links back to video embed / inline-video nodes
    // Turndown saves embeds as [platform video](url) or [video](url) — marked turns those
    // into <p><a href="url">platform video</a></p> which TipTap treats as a plain link.
    result = result.replace(
      /<p>\s*<a\s+href="([^"]+)"[^>]*>((?:youtube|vimeo|loom|mp4)\s+video|video)<\/a>\s*<\/p>/gi,
      (_m, url, label) => {
        const info = detectVideoEmbed(url);
        if (info.isVideo && info.embedUrl) {
          return `<div data-type="video-embed" data-src="${url}" data-embed-url="${info.embedUrl}" data-platform="${info.platform}">${info.platform}</div>`;
        }
        // Uploaded video files (label is just "video")
        if (/^video$/i.test(label.trim())) {
          return `<div data-type="inline-video" data-src="${url}">video</div>`;
        }
        return _m;
      }
    );

    // Post-process: extract image metadata from alt text (e.g. "alt|width=300,align=left")
    result = result.replace(/<img\s+src="([^"]*?)"\s+alt="([^"]*?)"\s*\/?>/g, (_match, src, alt) => {
      const pipeIdx = alt.indexOf('|');
      if (pipeIdx === -1) return `<img src="${src}" alt="${alt}">`;

      const realAlt = alt.substring(0, pipeIdx);
      const metaStr = alt.substring(pipeIdx + 1);
      const attrs: Record<string, string> = {};
      metaStr.split(',').forEach((pair: string) => {
        const [k, v] = pair.split('=');
        if (k && v) attrs[k.trim()] = v.trim();
      });

      const parts = [`src="${src}"`, `alt="${realAlt}"`];
      if (attrs.width) parts.push(`data-width="${attrs.width}"`);
      if (attrs.align) parts.push(`data-alignment="${attrs.align}"`);
      if (attrs.cx) parts.push(`data-crop-x="${attrs.cx}"`);
      if (attrs.cy) parts.push(`data-crop-y="${attrs.cy}"`);
      if (attrs.cw) parts.push(`data-crop-w="${attrs.cw}"`);
      if (attrs.ch) parts.push(`data-crop-h="${attrs.ch}"`);
      return `<img ${parts.join(' ')}>`;
    });

    // Post-process: convert &nbsp; blank-line markers back to <br> empty paragraphs.
    // Turndown saves empty paragraphs (from pressing Enter) as "&nbsp;" in markdown.
    // Marked produces <p>&nbsp;</p>, but TipTap expects <p><br></p> for empty lines.
    result = result.replace(/<p>&nbsp;<\/p>/g, '<p><br></p>');

    return result;
  } catch {
    return md.replace(/\n/g, '<br>');
  }
}

// Convert HTML to markdown using turndown (lazy-loaded)
async function htmlToMd(html: string): Promise<string> {
  if (!html || html === '<p></p>') return '';
  try {
    const td = await getTurndown();
    return td.turndown(html).trim();
  } catch {
    return html.replace(/<[^>]*>/g, '');
  }
}

async function uploadMediaToStorage(file: File): Promise<string> {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  const label = isVideo ? 'Video' : 'Image';
  if (file.size > maxSize) throw new Error(`${label} must be under ${maxSize / 1024 / 1024} MB`);
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'png');
  const folder = isVideo ? 'editor-videos' : 'editor-images';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('knowledge-files').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('knowledge-files').getPublicUrl(path);
  return data.publicUrl;
}

export const MinimalRichEditor = forwardRef<MinimalRichEditorHandle, MinimalRichEditorProps>(function MinimalRichEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = "Start typing...",
  autoFocus = false,
  showToolbar = true,
}, ref) {
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef(value);
  const isInitializedRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
      ResizableImageNode,
      InlineVideoNode,
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      VideoEmbedNode,
      EmptyParagraphSpacer,
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
          '[&_p.blank-spacer]:!my-0 [&_p.blank-spacer]:!leading-[0.5]',
        ),
      },
      handleKeyDown: (view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && onSave) {
          event.preventDefault();
          dirtyRef.current = true;
          const ed = editorInstanceRef.current;
          if (ed && !ed.isDestroyed) {
            htmlToMd(ed.getHTML()).then(md => {
              lastValueRef.current = md;
              onChangeRef.current(md);
              dirtyRef.current = false;
              onSave();
            });
          } else {
            onSave();
          }
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
        const ed = editorInstanceRef.current;
        if (!ed || ed.isDestroyed) return false;

        // Paste a bare YouTube / Loom / Vimeo / MP4 URL → embed player (not a plain link).
        // Run this BEFORE binary clipboard items: many apps put a preview image + URL; we prefer the embed.
        const tryEmbedFromUrl = (raw: string): boolean => {
          const trimmed = raw.trim();
          if (!trimmed) return false;
          const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          if (lines.length !== 1) return false;
          const url = lines[0];
          if (!/^https?:\/\//i.test(url)) return false;
          const info = detectVideoEmbed(url);
          if (!info.isVideo || !info.embedUrl) return false;
          event.preventDefault();
          ed.chain()
            .focus()
            .insertContent({
              type: 'videoEmbed',
              attrs: { src: url, embedUrl: info.embedUrl, platform: info.platform },
            })
            .run();
          return true;
        };

        const plain = event.clipboardData?.getData('text/plain') ?? '';
        if (tryEmbedFromUrl(plain)) return true;

        const uriList = event.clipboardData?.getData('text/uri-list') ?? '';
        const uriFromList = uriList
          .split(/\r?\n/)
          .map((l) => l.trim())
          .find((l) => /^https?:\/\//i.test(l) && !l.startsWith('#'));
        if (uriFromList && tryEmbedFromUrl(uriFromList)) return true;

        const items = Array.from(event.clipboardData?.items ?? []);
        const mediaItem = items.find(item => item.type.startsWith('image/') || item.type.startsWith('video/'));
        if (mediaItem) {
          event.preventDefault();
          const file = mediaItem.getAsFile();
          if (!file) return false;
          const isVideo = file.type.startsWith('video/');
          setIsUploadingRef.current(true);
          uploadMediaToStorage(file)
            .then(url => {
              if (isVideo) {
                editorInstanceRef.current?.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run();
              } else {
                editorInstanceRef.current?.chain().focus().insertContent({ type: 'resizableImage', attrs: { src: url, alt: file.name } }).run();
              }
            })
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to upload'))
            .finally(() => setIsUploadingRef.current(false));
          return true;
        }

        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const mediaFile = files.find(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
        if (mediaFile) {
          event.preventDefault();
          const isVideo = mediaFile.type.startsWith('video/');
          setIsUploadingRef.current(true);
          uploadMediaToStorage(mediaFile)
            .then(url => {
              if (isVideo) {
                editorInstanceRef.current?.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run();
              } else {
                editorInstanceRef.current?.chain().focus().insertContent({ type: 'resizableImage', attrs: { src: url, alt: mediaFile.name } }).run();
              }
            })
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to upload'))
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
      // Mark dirty — defer expensive htmlToMd conversion.
      // Flush immediately only after 500ms idle (not every keystroke).
      dirtyRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(async () => {
        if (!ed.isDestroyed && dirtyRef.current) {
          dirtyRef.current = false;
          const md = await htmlToMd(ed.getHTML());
          lastValueRef.current = md;
          onChangeRef.current(md);
        }
      }, 500);
    },
  });

  // Flush pending changes — converts HTML to markdown and notifies parent
  const flushChanges = useCallback(async () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    const ed = editorInstanceRef.current;
    if (!dirtyRef.current || !ed || ed.isDestroyed) return;
    dirtyRef.current = false;
    const md = await htmlToMd(ed.getHTML());
    lastValueRef.current = md;
    onChangeRef.current(md);
  }, []);

  // Flush on blur so parent always has latest content
  useEffect(() => {
    const el = editorWrapperRef.current;
    if (!el) return;
    const handler = () => flushChanges();
    el.addEventListener('focusout', handler);
    return () => el.removeEventListener('focusout', handler);
  }, [flushChanges]);

  // Clean up idle timer on unmount
  useEffect(() => {
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, []);

  // Keep the stable ref in sync
  useEffect(() => {
    editorInstanceRef.current = editor;
  }, [editor]);

  useImperativeHandle(
    ref,
    () => ({
      getMarkdownForSave: async () => {
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
        const ed = editorInstanceRef.current;
        if (!ed || ed.isDestroyed) {
          return lastValueRef.current ?? "";
        }
        const md = await htmlToMd(ed.getHTML());
        lastValueRef.current = md;
        onChangeRef.current(md);
        dirtyRef.current = false;
        return md;
      },
    }),
    []
  );

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

  const handleMediaUpload = useCallback(async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;
    setIsUploading(true);
    try {
      const url = await uploadMediaToStorage(file);
      if (isVideo) {
        editor?.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run();
      } else {
        editor?.chain().focus().insertContent({ type: 'resizableImage', attrs: { src: url, alt: file.name } }).run();
      }
      toast.success(isVideo ? 'Video added' : 'Image added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload');
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

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!editor) return;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('File must be under 20 MB'); return; }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `editor-resources/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('knowledge-files').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('knowledge-files').getPublicUrl(path);
      const displayName = file.name;
      editor.chain().focus().insertContent(`<p>📎 <a href="${data.publicUrl}" target="_blank" rel="noopener noreferrer">${displayName}</a></p>`).run();
      toast.success('Resource attached');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload resource');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleAttachLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Paste a link (e.g. Google Drive, website)');
    if (!url) return;
    const label = window.prompt('Display name for the link', url) || url;
    editor.chain().focus().insertContent(`<p>🔗 <a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="space-y-0" ref={editorWrapperRef}>
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
            title="Insert image or video (or paste / drop)"
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
          <div className="w-px h-4 bg-border mx-0.5" />
          {/* Resource attachment dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Attach resource (PDF, link)"
                disabled={isUploading}
              >
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => pdfInputRef.current?.click()}>
                <FileText className="h-3.5 w-3.5 mr-2" />
                Upload PDF / File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAttachLink}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                Add external link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleMediaUpload(file);
              e.target.value = '';
            }}
          />
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.pptx"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handlePdfUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground bg-muted/40 border-b border-border/30">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading media…
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
});

MinimalRichEditor.displayName = "MinimalRichEditor";
