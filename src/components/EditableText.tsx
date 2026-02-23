import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { RichTextEditor } from './RichTextEditor';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

interface EditableTextProps {
  value: string;
  onSave?: (newValue: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  richText?: boolean;
}

export function EditableText({ 
  value, 
  onSave, 
  multiline = false, 
  className = "",
  placeholder = "Click to edit...",
  readOnly = false,
  richText = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const { isAdmin: isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave!(editValue);
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Changes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
      setEditValue(value); // Reset on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isAdminMode || readOnly || !onSave) {
    if (richText && value) {
      // Check if content is HTML or markdown
      if (value.includes('<')) {
        // Content is HTML - sanitize before rendering
        const sanitizedHTML = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'span', 'div'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
        });
        return (
          <div
            className={`${className} break-words`}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        );
      } else {
        // Content is Markdown
        return (
          <div className={`${className} break-words`}>
            <ReactMarkdown
              components={{
                a: ({ children, href }) => (
                  <a href={href} className="text-blue-600 underline hover:text-blue-800 break-all" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                )
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        );
      }
    }
    return <span className={`${className} break-words`}>{value}</span>;
  }

  if (isEditing) {
    if (richText) {
      return (
        <RichTextEditor
          value={editValue}
          onChange={(content) => {
            setEditValue(content);
            // Auto-save on change
            onSave!(content).then(() => {
              setIsEditing(false);
            }).catch(() => {
              // Error handling is done in handleSave
            });
          }}
          placeholder={placeholder}
        />
      );
    }

    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <div className="space-y-2">
        <InputComponent
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className={className}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-2 rounded group transition-all duration-200 bg-primary/5`}
      onClick={() => {
        console.log('EditableText clicked, setting editing to true');
        setIsEditing(true);
      }}
      title="🔧 ADMIN MODE: Click to edit this content"
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className={`${value ? "" : "text-muted-foreground italic"} break-words flex-1 min-w-0`}>
          {value || placeholder}
        </span>
        <Button
          variant="default"
          size="sm"
          className="shrink-0 h-7 w-7 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}