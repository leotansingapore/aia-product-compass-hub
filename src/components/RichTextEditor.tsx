import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MediaUploadZone } from './MediaUploadZone';
import ReactMarkdown from 'react-markdown';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Image, 
  Link, 
  Video
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Type your content..." }: RichTextEditorProps) {
  const [content, setContent] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save current cursor position/selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    } else if (editorRef.current) {
      // If no selection, create one at the end of the content
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to end
      setSavedSelection(range);
    }
  };

  // Restore saved cursor position/selection
  const restoreSelection = () => {
    if (savedSelection && editorRef.current) {
      try {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelection);
          editorRef.current.focus();
        }
      } catch (error) {
        // If restoring fails, place cursor at end
        console.warn('Failed to restore selection, placing at end');
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  // Initialize editor with HTML content
  useEffect(() => {
    if (editorRef.current && value) {
      // If value is already HTML (contains tags), use it directly
      // Otherwise treat it as plain text
      const isHtml = /<[^>]+>/.test(value);
      const htmlContent = isHtml ? value : value.replace(/\n/g, '<br>');
      
      // Only update if different to avoid cursor jumps
      if (editorRef.current.innerHTML !== htmlContent) {
        // Save cursor position before update
        const selection = window.getSelection();
        let cursorPosition: { node: Node | null; offset: number } | null = null;
        
        if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
          const range = selection.getRangeAt(0);
          cursorPosition = {
            node: range.startContainer,
            offset: range.startOffset
          };
        }
        
        // Update content
        editorRef.current.innerHTML = htmlContent;
        setContent(htmlContent);
        
        // Restore cursor position
        if (cursorPosition && cursorPosition.node && editorRef.current.contains(cursorPosition.node)) {
          try {
            const newRange = document.createRange();
            newRange.setStart(cursorPosition.node, Math.min(cursorPosition.offset, cursorPosition.node.textContent?.length || 0));
            newRange.collapse(true);
            
            const newSelection = window.getSelection();
            if (newSelection) {
              newSelection.removeAllRanges();
              newSelection.addRange(newRange);
            }
          } catch (error) {
            // Cursor restoration failed, that's okay
            console.warn('Could not restore cursor position:', error);
          }
        }
      }
    } else if (editorRef.current && !value) {
      editorRef.current.innerHTML = '';
      setContent('');
    }
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    try {
      // Focus editor first to ensure commands work
      editorRef.current?.focus();
      
      // Execute the command
      document.execCommand(command, false, value);
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.warn('execCommand failed:', error);
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    editorRef.current?.focus();
    execCommand(command, value);
  };

  const insertHeading = (level: number) => {
    try {
      editorRef.current?.focus();
      
      // Use formatBlock to convert the current block to a heading
      document.execCommand('formatBlock', false, `<h${level}>`);
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.warn('Failed to insert heading:', error);
      toast({
        title: "Error",
        description: "Failed to format as heading",
        variant: "destructive",
      });
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editorRef.current?.focus();
      
      // Add protocol if missing
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      
      let linkHtml;
      if (selectedText) {
        // If text is selected, wrap it in a link
        linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${selectedText}</a>`;
      } else {
        // If no text is selected, insert the URL as link text
        linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
      }
      
      if (editorRef.current) {
        document.execCommand('insertHTML', false, linkHtml);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const insertBlockquote = () => {
    try {
      editorRef.current?.focus();
      
      // Use formatBlock to convert the current block to a blockquote
      document.execCommand('formatBlock', false, '<blockquote>');
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.warn('Failed to insert blockquote:', error);
      toast({
        title: "Error",
        description: "Failed to format as quote",
        variant: "destructive",
      });
    }
  };

  const insertCodeBlock = () => {
    try {
      editorRef.current?.focus();
      
      // Use formatBlock to convert the current block to a pre tag
      document.execCommand('formatBlock', false, '<pre>');
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.warn('Failed to insert code block:', error);
      toast({
        title: "Error",
        description: "Failed to format as code block",
        variant: "destructive",
      });
    }
  };

  const toggleMediaUpload = () => {
    if (!showMediaUpload) {
      // Save cursor position before opening media upload
      saveSelection();
    }
    setShowMediaUpload(!showMediaUpload);
  };

  const handleMediaAdd = async (url: string, type: 'gif' | 'image') => {
    if (!editorRef.current) return;
    
    // Create responsive image HTML with proper styling
    const imageHtml = `<img src="${url}" alt="${type === 'gif' ? 'GIF' : 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
    
    // Focus the editor first
    editorRef.current.focus();
    
    // Try to restore selection if we have one saved
    if (savedSelection) {
      try {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelection);
        }
      } catch (error) {
        console.warn('Could not restore selection, inserting at current position');
      }
    }
    
    // Insert the image at the current cursor position
    document.execCommand('insertHTML', false, imageHtml);
    
    // Update content state and notify parent
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    onChange(newContent);
    
    toast({
      title: "Image added",
      description: "Image has been added successfully",
    });
    
    // Hide the upload zone after successful insertion
    setShowMediaUpload(false);
  };

  const insertVideo = () => {
    const url = prompt('Enter video URL (YouTube or Loom):');
    if (url) {
      let embedCode = '';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()?.split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        embedCode = `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      } else if (url.includes('loom.com')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        embedCode = `<div class="video-embed"><iframe src="https://www.loom.com/embed/${videoId}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        embedCode = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      } else {
        embedCode = `<div class="video-embed"><video controls><source src="${url}" type="video/mp4"></video></div>`;
      }
      
      if (editorRef.current) {
        document.execCommand('insertHTML', false, embedCode);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  return (
    <div className="border border-border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          className="text-sm font-bold"
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          className="text-sm font-bold"
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          className="text-sm font-bold"
          title="Heading 3"
        >
          H3
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(4)}
          className="text-sm font-bold"
          title="Heading 4"
        >
          H4
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('strikeThrough')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertCodeBlock}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists and quotes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertBlockquote}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Media */}
        <Button
          variant={showMediaUpload ? "default" : "ghost"}
          size="sm"
          onClick={toggleMediaUpload}
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertVideo}
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>

      {/* Media Upload Zone */}
      {showMediaUpload && (
        <div className="p-4 border-b border-border bg-muted/30">
          <MediaUploadZone onMediaAdd={handleMediaAdd} />
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:text-sm [&_code]:font-mono [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground [&_.video-embed]:relative [&_.video-embed]:pb-[56.25%] [&_.video-embed]:h-0 [&_.video-embed]:my-4 [&_.video-embed_iframe]:absolute [&_.video-embed_iframe]:top-0 [&_.video-embed_iframe]:left-0 [&_.video-embed_iframe]:w-full [&_.video-embed_iframe]:h-full [&_.video-embed_iframe]:rounded-lg"
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{
          lineHeight: '1.6',
        }}
      />

    </div>
  );
}