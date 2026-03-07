import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Quote,
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Link as LinkIcon, Image as ImageIcon, Video, Table as TableIcon,
  FileCode, Minus, Code2, Undo2, Redo2, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Upload, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';

interface EditorToolbarProps {
  editor: Editor;
  onImageInsert: () => void;
  onImageUrlInsert?: (url: string) => void;
  onVideoInsert: () => void;
  onToggleSource: () => void;
  isSourceView: boolean;
}

function ToolbarButton({
  onClick,
  isActive = false,
  title,
  shortcut,
  children,
  disabled = false,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  shortcut?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={`h-7 w-7 p-0 transition-colors ${
            isActive
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {title}{shortcut && <span className="ml-1 opacity-60">({shortcut})</span>}
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

export function EditorToolbar({
  editor,
  onImageInsert,
  onImageUrlInsert,
  onVideoInsert,
  onToggleSource,
  isSourceView,
}: EditorToolbarProps) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSetLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkPopover(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleLinkClick = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkPopover(true);
  }, [editor]);

  return (
    <div className="border-b border-border bg-muted/30 px-2 py-1.5 flex items-center gap-0.5 flex-wrap sticky top-0 z-10">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        shortcut="Ctrl+Z"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        shortcut="Ctrl+Shift+Z"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
        shortcut="Ctrl+B"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
        shortcut="Ctrl+I"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
        shortcut="Ctrl+U"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
        shortcut="Ctrl+E"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
        title="Task List"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <FileCode className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Media & Links */}
      <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
        <PopoverTrigger asChild>
          <span>
            <ToolbarButton
              onClick={handleLinkClick}
              isActive={editor.isActive('link')}
              title="Link"
              shortcut="Ctrl+K"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-2">
            <p className="text-sm font-medium">Insert Link</p>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSetLink();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              {editor.isActive('link') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkPopover(false);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
              <Button size="sm" onClick={handleSetLink}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
        <PopoverTrigger asChild>
          <span>
            <ToolbarButton
              onClick={() => setShowImagePopover(!showImagePopover)}
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setShowImagePopover(false);
                onImageInsert();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
            >
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="font-medium">Upload Image</div>
                <div className="text-xs text-muted-foreground">Choose a file from your device</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left ${imageUrl !== '' ? 'hidden' : ''}`}
              style={{ display: imageUrl !== '' ? 'none' : undefined }}
            >
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="font-medium">Embed URL</div>
                <div className="text-xs text-muted-foreground">Paste an image link</div>
              </div>
            </button>
            {/* URL input — always visible as an inline field */}
            <div className="pt-1 border-t border-border mt-1">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && imageUrl.trim()) {
                    e.preventDefault();
                    if (onImageUrlInsert) {
                      onImageUrlInsert(imageUrl.trim());
                    } else {
                      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
                    }
                    setImageUrl('');
                    setShowImagePopover(false);
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="w-full mt-1.5 h-7 text-xs"
                disabled={!imageUrl.trim()}
                onClick={() => {
                  if (imageUrl.trim()) {
                    if (onImageUrlInsert) {
                      onImageUrlInsert(imageUrl.trim());
                    } else {
                      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
                    }
                    setImageUrl('');
                    setShowImagePopover(false);
                  }
                }}
              >
                Insert
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ToolbarButton
        onClick={onVideoInsert}
        title="Embed Video"
      >
        <Video className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Source Toggle */}
      <ToolbarButton
        onClick={onToggleSource}
        isActive={isSourceView}
        title={isSourceView ? 'Rich Editor' : 'Markdown Source'}
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
