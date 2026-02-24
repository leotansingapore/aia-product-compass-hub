import { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link as LinkIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

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
  return td;
}

const turndown = createTurndown();

// Convert markdown to HTML using marked
function mdToHtml(md: string): string {
  if (!md) return '';
  try {
    const result = marked.parse(md, { async: false, gfm: true, breaks: true });
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
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
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
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
