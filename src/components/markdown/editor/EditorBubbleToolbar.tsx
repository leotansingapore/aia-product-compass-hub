import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Link as LinkIcon, Highlighter, Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorBubbleToolbarProps {
  editor: Editor;
}

function BubbleButton({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-7 w-7 p-0 ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Button>
  );
}

export function EditorBubbleToolbar({ editor }: EditorBubbleToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLinkInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showLinkInput]);

  const handleLinkClick = () => {
    if (editor.isActive('link')) {
      // If already a link, remove it
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  if (showLinkInput) {
    return (
      <div className="flex items-center gap-1 bg-foreground/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-foreground/10">
        <input
          ref={inputRef}
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyLink();
            }
            if (e.key === 'Escape') {
              setShowLinkInput(false);
              setLinkUrl('');
            }
          }}
          placeholder="https://..."
          className="bg-transparent text-white text-sm outline-none placeholder:text-white/40 w-48"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyLink}
          className="h-6 px-2 text-[11px] text-white/80 hover:text-white hover:bg-white/10"
        >
          Apply
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 bg-foreground/90 backdrop-blur-sm text-background rounded-lg px-1.5 py-1 shadow-lg border border-foreground/10">
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </BubbleButton>
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <BubbleButton
        onClick={handleLinkClick}
        isActive={editor.isActive('link')}
        title={editor.isActive('link') ? 'Remove link' : 'Add link'}
      >
        {editor.isActive('link') ? (
          <Unlink className="h-3.5 w-3.5" />
        ) : (
          <LinkIcon className="h-3.5 w-3.5" />
        )}
      </BubbleButton>
    </div>
  );
}
