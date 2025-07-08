import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface EditableTagsProps {
  tags: string[];
  onSave: (newTags: string[]) => Promise<void>;
  className?: string;
}

export function EditableTags({ tags, onSave, className = "" }: EditableTagsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editTags);
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Tags updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tags",
        variant: "destructive",
      });
      setEditTags(tags); // Reset on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTags(tags);
    setNewTag('');
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  if (!isAdminMode) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary">{tag}</Badge>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {editTags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeTag(tag)}
            >
              {tag}
              <Trash2 className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add new tag..."
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1"
          />
          <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-wrap gap-2 ${className} cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors`}
      onClick={() => setIsEditing(true)}
    >
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary">{tag}</Badge>
      ))}
      <Badge variant="outline" className="opacity-50">
        <Plus className="h-3 w-3" />
      </Badge>
    </div>
  );
}