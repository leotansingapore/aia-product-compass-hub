import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Edit } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableText({ 
  value, 
  onSave, 
  multiline = false, 
  className = "",
  placeholder = "Click to edit..."
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(editValue);
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

  if (!isAdminMode) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
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
      className={`${className} cursor-pointer hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent p-2 rounded group transition-all duration-200`}
      onClick={() => setIsEditing(true)}
      title="Click to edit this content"
    >
      <div className="flex items-center justify-between">
        <span className={value ? "" : "text-muted-foreground italic"}>
          {value || placeholder}
        </span>
        <Edit className="h-4 w-4 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
      </div>
    </div>
  );
}