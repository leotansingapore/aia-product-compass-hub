import { useEffect, useRef, useState } from 'react';
import { EditorState, StateEffect, StateField, Range } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle, HighlightStyle, syntaxTree } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { detectVideoEmbed } from '@/lib/video-embed-utils';
import { 
  Bold, Italic, Strikethrough, Code, Quote, Heading1, Heading2, Heading3, 
  List, ListOrdered, CheckSquare, Link as LinkIcon, Image as ImageIcon, 
  Video, Table, FileCode, Minus, Eye, EyeOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeMirrorMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Video embed widget for inline video rendering
class VideoEmbedWidget extends WidgetType {
  constructor(readonly embedUrl: string, readonly platform: string) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.className = 'cm-video-embed my-4';
    wrapper.style.cssText = 'position: relative; width: 100%; padding-bottom: 56.25%;';
    
    const iframe = document.createElement('iframe');
    iframe.src = this.embedUrl;
    iframe.className = 'absolute top-0 left-0 w-full h-full rounded-lg border';
    iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid hsl(var(--border)); border-radius: 0.5rem;';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('title', `${this.platform} video`);
    
    wrapper.appendChild(iframe);
    return wrapper;
  }
}

// Plugin to detect video URLs and replace them with embed widgets
const videoEmbedPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];
    const doc = view.state.doc.toString();
    
    // Regex to find standalone video URLs (YouTube, Vimeo, Loom)
    const urlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|loom\.com\/share\/)[^\s)]+/g;
    let match;
    
    while ((match = urlRegex.exec(doc)) !== null) {
      const url = match[0];
      const embedInfo = detectVideoEmbed(url);
      
      if (embedInfo.isVideo && embedInfo.embedUrl) {
        const from = match.index;
        const to = from + url.length;
        
        // Add widget decoration to replace the URL with embedded player
        decorations.push(
          Decoration.replace({
            widget: new VideoEmbedWidget(embedInfo.embedUrl, embedInfo.platform || 'video'),
            inclusive: true,
          }).range(from, to)
        );
      }
    }
    
    return Decoration.set(decorations);
  }
}, {
  decorations: v => v.decorations
});

// Formatting helper functions
function wrapSelection(view: EditorView, wrapper: string) {
  const selection = view.state.selection.main;
  const text = view.state.doc.sliceString(selection.from, selection.to);
  
  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: `${wrapper}${text}${wrapper}`
    },
    selection: {
      anchor: selection.from + wrapper.length,
      head: selection.to + wrapper.length
    }
  });
  
  view.focus();
}

function insertPrefix(view: EditorView, prefix: string) {
  const selection = view.state.selection.main;
  const line = view.state.doc.lineAt(selection.from);
  
  view.dispatch({
    changes: {
      from: line.from,
      to: line.from,
      insert: prefix
    }
  });
  
  view.focus();
}

function insertPrefixToLines(view: EditorView, prefix: string) {
  const selection = view.state.selection.main;
  const doc = view.state.doc;
  const startLine = doc.lineAt(selection.from);
  const endLine = doc.lineAt(selection.to);
  
  const changes: { from: number; to: number; insert: string }[] = [];
  
  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = doc.line(i);
    changes.push({
      from: line.from,
      to: line.from,
      insert: prefix
    });
  }
  
  view.dispatch({ changes });
  view.focus();
}

function insertAtCursor(view: EditorView, text: string, cursorOffset: number = 0) {
  const selection = view.state.selection.main;
  
  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: text
    },
    selection: {
      anchor: selection.from + text.length + cursorOffset,
    }
  });
  
  view.focus();
}

function insertLink(view: EditorView, text: string = '', url: string = '') {
  const selection = view.state.selection.main;
  const selectedText = view.state.doc.sliceString(selection.from, selection.to) || text || 'link text';
  const linkUrl = url || 'url';
  
  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: `[${selectedText}](${linkUrl})`
    },
    selection: {
      anchor: selection.from + selectedText.length + 3,
      head: selection.from + selectedText.length + 3 + linkUrl.length
    }
  });
  
  view.focus();
}

function insertImage(view: EditorView, alt: string = '', url: string = '') {
  const altText = alt || 'image';
  const imageUrl = url || 'url';
  
  insertAtCursor(view, `![${altText}](${imageUrl})`, -(imageUrl.length + 1));
}

function insertTable(view: EditorView) {
  const table = `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

`;
  insertAtCursor(view, table, -table.length);
}

function insertCodeBlock(view: EditorView) {
  const selection = view.state.selection.main;
  const text = view.state.doc.sliceString(selection.from, selection.to);
  
  const codeBlock = `\`\`\`\n${text || 'code here'}\n\`\`\`\n`;
  
  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: codeBlock
    }
  });
  
  view.focus();
}

function insertHorizontalRule(view: EditorView) {
  insertAtCursor(view, '\n---\n\n', 0);
}

// Custom keyboard shortcuts
const markdownKeymap = keymap.of([
  {
    key: 'Mod-b',
    run: (view) => {
      wrapSelection(view, '**');
      return true;
    }
  },
  {
    key: 'Mod-i',
    run: (view) => {
      wrapSelection(view, '*');
      return true;
    }
  },
  {
    key: 'Mod-k',
    run: (view) => {
      insertLink(view);
      return true;
    }
  },
  {
    key: 'Mod-Shift-c',
    run: (view) => {
      insertCodeBlock(view);
      return true;
    }
  },
  {
    key: 'Mod-Shift-l',
    run: (view) => {
      insertPrefix(view, '- ');
      return true;
    }
  },
  {
    key: 'Mod-e',
    run: (view) => {
      wrapSelection(view, '`');
      return true;
    }
  },
]);

export function CodeMirrorMarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your content using markdown...' 
}: CodeMirrorMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Toolbar button handlers
  const handleBold = () => {
    if (viewRef.current) wrapSelection(viewRef.current, '**');
  };

  const handleItalic = () => {
    if (viewRef.current) wrapSelection(viewRef.current, '*');
  };

  const handleStrikethrough = () => {
    if (viewRef.current) wrapSelection(viewRef.current, '~~');
  };

  const handleInlineCode = () => {
    if (viewRef.current) wrapSelection(viewRef.current, '`');
  };

  const handleHeading1 = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '# ');
  };

  const handleHeading2 = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '## ');
  };

  const handleHeading3 = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '### ');
  };

  const handleBlockquote = () => {
    if (viewRef.current) insertPrefixToLines(viewRef.current, '> ');
  };

  const handleHorizontalRule = () => {
    if (viewRef.current) insertHorizontalRule(viewRef.current);
  };

  const handleBulletedList = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '- ');
  };

  const handleNumberedList = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '1. ');
  };

  const handleTaskList = () => {
    if (viewRef.current) insertPrefix(viewRef.current, '- [ ] ');
  };

  const handleLinkDialog = () => {
    if (viewRef.current) {
      const selection = viewRef.current.state.selection.main;
      const selectedText = viewRef.current.state.doc.sliceString(selection.from, selection.to);
      setLinkText(selectedText || '');
      setLinkUrl('');
      setShowLinkDialog(true);
    }
  };

  const handleInsertLink = () => {
    if (viewRef.current) {
      insertLink(viewRef.current, linkText, linkUrl);
      setShowLinkDialog(false);
      setLinkText('');
      setLinkUrl('');
    }
  };

  const handleImageDialog = () => {
    setImageAlt('');
    setImageUrl('');
    setShowImageDialog(true);
  };

  const handleInsertImage = () => {
    if (viewRef.current) {
      insertImage(viewRef.current, imageAlt, imageUrl);
      setShowImageDialog(false);
      setImageAlt('');
      setImageUrl('');
    }
  };

  const handleInsertVideo = () => {
    if (viewRef.current) {
      const videoUrl = prompt('Enter YouTube, Vimeo, or Loom video URL:');
      if (videoUrl) {
        insertAtCursor(viewRef.current, `\n${videoUrl}\n\n`, 0);
      }
    }
  };

  const handleTable = () => {
    if (viewRef.current) insertTable(viewRef.current);
  };

  const handleCodeBlock = () => {
    if (viewRef.current) insertCodeBlock(viewRef.current);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Custom syntax highlighting with dimmed syntax tokens
    const customHighlightStyle = HighlightStyle.define([
      { tag: tags.heading1, class: 'cm-heading1' },
      { tag: tags.heading2, class: 'cm-heading2' },
      { tag: tags.heading3, class: 'cm-heading3' },
      { tag: tags.heading4, class: 'cm-heading4' },
      { tag: tags.strong, class: 'cm-strong' },
      { tag: tags.emphasis, class: 'cm-emphasis' },
      { tag: tags.link, class: 'cm-link' },
      { tag: tags.monospace, class: 'cm-code' },
      { tag: tags.quote, class: 'cm-quote' },
      { tag: tags.list, class: 'cm-list' },
      { tag: tags.contentSeparator, class: 'cm-syntax-token' },
      { tag: tags.processingInstruction, class: 'cm-syntax-token' },
    ]);

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(customHighlightStyle),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        videoEmbedPlugin,
        markdownKeymap,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '400px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          },
          '.cm-line': {
            padding: '2px 0',
            lineHeight: '1.6',
          },
          '&.cm-focused': {
            outline: 'none',
          },
          '.cm-activeLine': {
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          },
          '.cm-gutters': {
            backgroundColor: 'hsl(var(--muted) / 0.2)',
            color: 'hsl(var(--muted-foreground))',
            border: 'none',
          },
          '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 8px',
            minWidth: '40px',
          },
          // Markdown syntax styling - syntax tokens dimmed but visible
          '.cm-syntax-token': {
            opacity: '0.4',
            color: 'hsl(var(--muted-foreground))',
          },
          '.cm-heading1': {
            fontSize: '2em',
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.2',
          },
          '.cm-heading2': {
            fontSize: '1.5em',
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.3',
          },
          '.cm-heading3': {
            fontSize: '1.25em',
            fontWeight: '600',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.4',
          },
          '.cm-heading4': {
            fontSize: '1.1em',
            fontWeight: '600',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.4',
          },
          '.cm-strong': {
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
          },
          '.cm-emphasis': {
            fontStyle: 'italic',
            color: 'hsl(var(--foreground))',
          },
          '.cm-link': {
            color: 'hsl(var(--primary))',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          },
          '.cm-code': {
            backgroundColor: 'hsl(var(--muted))',
            padding: '2px 4px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '.cm-quote': {
            color: 'hsl(var(--muted-foreground))',
            fontStyle: 'italic',
            borderLeft: '3px solid hsl(var(--border))',
            paddingLeft: '12px',
          },
          '.cm-list': {
            color: 'hsl(var(--primary))',
          },
          '.cm-video-embed': {
            margin: '1rem 0',
            position: 'relative',
            width: '100%',
          },
        }),
        EditorView.editorAttributes.of({
          'data-placeholder': placeholder,
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only initialize once

  // Handle external value changes
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 px-3 py-2 flex items-center gap-1 flex-wrap">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleStrikethrough}
          className="h-8 w-8 p-0"
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInlineCode}
          className="h-8 w-8 p-0"
          title="Inline Code (Ctrl+E)"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading1}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading2}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading3}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBulletedList}
          className="h-8 w-8 p-0"
          title="Bulleted List (Ctrl+Shift+L)"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNumberedList}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTaskList}
          className="h-8 w-8 p-0"
          title="Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link & Media */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkDialog}
          className="h-8 w-8 p-0"
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageDialog}
          className="h-8 w-8 p-0"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInsertVideo}
          className="h-8 w-8 p-0"
          title="Insert Video (YouTube/Vimeo/Loom)"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTable}
          className="h-8 w-8 p-0"
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Code & Quotes */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCodeBlock}
          className="h-8 w-8 p-0"
          title="Code Block (Ctrl+Shift+C)"
        >
          <FileCode className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBlockquote}
          className="h-8 w-8 p-0"
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHorizontalRule}
          className="h-8 w-8 p-0"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Preview Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={togglePreview}
          className="h-8 w-8 p-0"
          title={showPreview ? "Hide Preview" : "Show Preview"}
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor Container */}
      <div 
        ref={editorRef} 
        className="min-h-[400px] w-full"
        style={{ height: '500px', display: showPreview ? 'none' : 'block' }}
      />

      {/* Preview Container */}
      {showPreview && (
        <div className="p-6 prose prose-sm max-w-none dark:prose-invert min-h-[400px] overflow-auto" style={{ height: '500px' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value}
          </ReactMarkdown>
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a hyperlink to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter link text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add an image to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertImage}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shortcuts Info */}
      <div className="border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Paste YouTube, Vimeo, or Loom links to auto-embed videos</span>
        <span>Ctrl+B: Bold | Ctrl+I: Italic | Ctrl+K: Link | Ctrl+E: Code | Ctrl+Shift+C: Code Block</span>
      </div>
    </div>
  );
}
