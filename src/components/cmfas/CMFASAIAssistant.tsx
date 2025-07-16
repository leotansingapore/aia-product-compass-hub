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
    <Card className="bg-gradient-to-br from-card via-card to-purple-50/20 dark:to-purple-900/10 border-2 hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent font-bold text-xl">
              Ask the AI (Custom GPT)
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/80 mt-2">
          Get personalized help and guidance for this CMFAS module
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted/30 rounded-xl p-4 border border-muted space-y-4">
          {isAdmin && (
            <div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-background/50 hover:bg-background border-2 hover:border-primary/50 transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  Configure GPT Link
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="Enter Custom GPT URL..."
                    className="bg-background/80 border-2 focus:border-primary/50"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Save className="h-3 w-3" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-1 border-2"
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
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold group/btn"
                  size="lg"
                >
                  <Bot className="mr-3 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-200" />
                  Chat with AI Assistant
                  <ExternalLink className="ml-3 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Button>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Bot className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                    {isAdmin 
                      ? "Configure a custom GPT link to enable AI assistance for this module"
                      : "AI assistant is not yet configured for this module"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}