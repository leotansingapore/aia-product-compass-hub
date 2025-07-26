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
  Video,
  Check,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onSave, onCancel, placeholder = "Type your content..." }: RichTextEditorProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Convert markdown to HTML for initial display
  useEffect(() => {
    // Only update if content is significantly different to avoid overwriting user changes
    if (editorRef.current && Math.abs(editorRef.current.innerHTML.length - value.length) > 10) {
      const convertMarkdownToHtml = (markdown: string) => {
        return markdown
          // Headers
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          // Bold
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // Lists (handle multiple lines)
          .replace(/^- (.*$)/gm, '<li>$1</li>')
          .replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')
          // Numbered lists
          .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
          .replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, (match) => {
            if (!match.includes('<ul>')) {
              return `<ol>${match}</ol>`;
            }
            return match;
          })
          // Line breaks and paragraphs
          .replace(/\n\n+/g, '</p><p>')
          .replace(/^(?!<[h|u|o|l])(.+)$/gm, '<p>$1</p>')
          // Clean up
          .replace(/<p><\/p>/g, '')
          .replace(/<p>(<[h|u|o])/g, '$1')
          .replace(/(<\/[h|u|o][^>]*>)<\/p>/g, '$1')
          .replace(/\n/g, '<br>');
      };

      const htmlContent = convertMarkdownToHtml(value);
      setContent(htmlContent);
      
      // Set initial content in editor
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    editorRef.current?.focus();
    execCommand(command, value);
  };

  const insertHeading = (level: number) => {
    formatText('formatBlock', `h${level}`);
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
        linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
      } else {
        // If no text is selected, insert the original URL as link text but use formatted URL for href
        linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
      
      if (editorRef.current) {
        document.execCommand('insertHTML', false, linkHtml);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const toggleMediaUpload = () => {
    setShowMediaUpload(!showMediaUpload);
  };

  const handleMediaAdd = async (url: string, type: 'gif' | 'image') => {
    editorRef.current?.focus();
    
    // Create responsive image HTML with proper styling
    const imageHtml = `<img src="${url}" alt="${type === 'gif' ? 'GIF' : 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
    
    if (editorRef.current) {
      document.execCommand('insertHTML', false, imageHtml);
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      // Auto-save the content with the new image
      try {
        await onSave(newContent);
        toast({
          title: "Image added",
          description: "Image has been added and saved successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save image",
          variant: "destructive",
        });
      }
    }
    
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
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      } else if (url.includes('loom.com')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        embedCode = `<iframe src="https://www.loom.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        embedCode = `<video controls><source src="${url}" type="video/mp4"></video>`;
      }
      
      if (editorRef.current) {
        document.execCommand('insertHTML', false, embedCode);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as HTML since we're now working with HTML content
      await onSave(content);
      toast({
        title: "Saved",
        description: "Content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
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
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          className="text-sm font-bold"
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          className="text-sm font-bold"
        >
          H3
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(4)}
          className="text-sm font-bold"
        >
          H4
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('strikeThrough')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('formatBlock', 'pre')}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists and quotes */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertUnorderedList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertOrderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('formatBlock', 'blockquote')}
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
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
        onInput={handleContentChange}
        onBlur={handleContentChange}
        suppressContentEditableWarning={true}
        style={{
          lineHeight: '1.6',
        }}
      />

      {/* Actions */}
      <div className="flex gap-2 p-3 border-t border-border bg-muted/50">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}