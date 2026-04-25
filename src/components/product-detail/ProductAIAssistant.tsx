
import { lazy, Suspense, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Edit, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

// EnhancedAIChat (~426 lines) plus its OpenAI/markdown deps load in their own
// chunk so the assistant tab's static UI (custom GPT link, header, edit form)
// paints first and the chat hydrates after.
const EnhancedAIChat = lazy(() =>
  import("./EnhancedAIChat").then((m) => ({ default: m.EnhancedAIChat }))
);

interface ProductAIAssistantProps {
  customGptLink?: string;
  productData?: {
    id?: string;
    name?: string;
    category?: string;
    summary?: string;
    highlights?: string[];
    assistant_id?: string;
    assistant_instructions?: string;
  };
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductAIAssistant({ customGptLink, productData, onUpdate }: ProductAIAssistantProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(customGptLink || '');
  const [editInstructions, setEditInstructions] = useState(productData?.assistant_instructions || '');
  const [saving, setSaving] = useState(false);
  const [creatingAssistant, setCreatingAssistant] = useState(false);
  const { isAdmin: isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    console.log('🤖 ProductAIAssistant saving data');
    
    try {
      await onUpdate('custom_gpt_link', editLink);
      await onUpdate('assistant_instructions', editInstructions);
      setIsEditing(false);
      console.log('✅ ProductAIAssistant save successful');
      toast({
        title: "Saved",
        description: "AI assistant settings updated successfully",
      });
    } catch (error) {
      console.error('❌ ProductAIAssistant save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save AI assistant settings",
        variant: "destructive",
      });
      setEditLink(customGptLink || '');
      setEditInstructions(productData?.assistant_instructions || '');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink(customGptLink || '');
    setEditInstructions(productData?.assistant_instructions || '');
    setIsEditing(false);
  };

  const openCustomGPT = () => {
    if (customGptLink) {
      window.open(customGptLink, '_blank');
    }
  };

  const createAssistant = async () => {
    if (!productData?.id) {
      toast({
        title: "Error",
        description: "Product ID is required to create assistant",
        variant: "destructive",
      });
      return;
    }

    setCreatingAssistant(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: {
          action: 'create_assistant',
          productId: productData.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product-specific assistant created successfully!",
      });

      // Refresh the page to show the new assistant
      window.location.reload();
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to create assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingAssistant(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-6">
      {/* Admin Configuration Panel */}
      {isAdminMode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <span>⚙️</span> 
              Admin Settings
              {!isEditing && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing(true)}
                  className="ml-auto text-orange-600 hover:text-orange-800"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-orange-700">
              Configure AI assistant settings and external links
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gpt-link">Custom GPT Link (Optional)</Label>
                  <Input
                    id="gpt-link"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://chatgpt.com/g/your-custom-gpt-id"
                    className="mt-1"
                  />
                  <p className="text-micro text-muted-foreground mt-1">
                    Enter the full URL to your custom GPT (for external link option)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="assistant-instructions">Assistant Instructions (Optional)</Label>
                  <Textarea
                    id="assistant-instructions"
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="Custom instructions for the AI assistant"
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-micro text-muted-foreground mt-1">
                    These instructions will customize how the AI responds for this product
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
              <div className="space-y-3">
                {!productData?.assistant_id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={createAssistant}
                    disabled={creatingAssistant}
                    className="w-full"
                  >
                    {creatingAssistant ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <span className="mr-2">🚀</span>
                    )}
                    {creatingAssistant ? 'Creating...' : 'Create Specialized Assistant'}
                  </Button>
                )}
                
                {customGptLink && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="w-full"
                  >
                    <a href={customGptLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ➡️ Open Custom GPT
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced AI Chat Interface */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <EnhancedAIChat productData={productData} />
      </Suspense>
    </div>
  );
}
