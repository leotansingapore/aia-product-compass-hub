import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, ExternalLink, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

interface CMFASAIAssistantProps {
  customGptLink?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function CMFASAIAssistant({ customGptLink, onUpdate }: CMFASAIAssistantProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(customGptLink || "");
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate('custom_gpt_link', editLink);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Custom GPT link updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update custom GPT link",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink(customGptLink || "");
    setIsEditing(false);
  };

  const openCustomGPT = () => {
    if (customGptLink) {
      window.open(customGptLink, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Ask the AI (Custom GPT)
        </CardTitle>
        <CardDescription>
          Get personalized help and guidance for this CMFAS module
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin && (
          <div className="mb-4">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Configure GPT Link
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="Enter Custom GPT URL..."
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <>
            {customGptLink ? (
              <Button
                onClick={openCustomGPT}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Bot className="mr-2 h-4 w-4" />
                Chat with AI Assistant
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">
                  {isAdmin 
                    ? "Configure a custom GPT link to enable AI assistance for this module"
                    : "AI assistant is not yet configured for this module"
                  }
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}