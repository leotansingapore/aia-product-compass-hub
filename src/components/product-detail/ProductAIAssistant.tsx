import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Edit, Check, X, ExternalLink } from "lucide-react";

interface ProductAIAssistantProps {
  customGptLink?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductAIAssistant({ customGptLink, onUpdate }: ProductAIAssistantProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(customGptLink || '');
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    console.log('🤖 ProductAIAssistant saving link:', editLink);
    
    try {
      await onUpdate('custom_gpt_link', editLink);
      setIsEditing(false);
      console.log('✅ ProductAIAssistant save successful');
      toast({
        title: "Saved",
        description: "Custom GPT link updated successfully",
      });
    } catch (error) {
      console.error('❌ ProductAIAssistant save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save custom GPT link",
        variant: "destructive",
      });
      setEditLink(customGptLink || '');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink(customGptLink || '');
    setIsEditing(false);
  };

  const openCustomGPT = () => {
    if (customGptLink) {
      window.open(customGptLink, '_blank');
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🤖</span> Ask the AI (Custom GPT)
          {isAdminMode && !isEditing && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="ml-auto"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Get instant answers about this product's features, benefits, and objection handling
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdminMode && isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gpt-link">Custom GPT Link</Label>
              <Input
                id="gpt-link"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://chatgpt.com/g/your-custom-gpt-id"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL to your custom GPT
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="hero" 
            size="lg" 
            onClick={openCustomGPT}
            disabled={!customGptLink}
            className="w-full"
          >
            {customGptLink ? (
              <>
                <ExternalLink className="h-5 w-5 mr-2" />
                ➡️ Ask the AI Assistant
              </>
            ) : (
              <>
                ➡️ AI Assistant (Coming Soon)
              </>
            )}
          </Button>
        )}
        
        {isAdminMode && !isEditing && !customGptLink && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Click edit to add your custom GPT link
          </p>
        )}
      </CardContent>
    </Card>
  );
}