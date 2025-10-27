import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ExternalLink, Edit, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

interface ProductChatLauncherProps {
  productName?: string;
  description?: string;
  className?: string;
  productId: string;
  customLink?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductChatLauncher({
  productName,
  description,
  className = "",
  productId,
  customLink,
  onUpdate,
}: ProductChatLauncherProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(customLink || "");
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const defaultDescription = productName
    ? `Get instant help with ${productName} details, comparisons, and sales tips`
    : "Get instant help with product details and sales guidance";

  const handleLaunch = () => {
    if (customLink) {
      window.open(customLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/product/${productId}/ai-assistant`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate("custom_gpt_link", editLink);
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "AI Assistant link updated successfully",
      });
    } catch (error) {
      console.error("Failed to save AI Assistant link:", error);
      toast({
        title: "Error",
        description: "Failed to save AI Assistant link",
        variant: "destructive",
      });
      setEditLink(customLink || "");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink(customLink || "");
    setIsEditing(false);
  };

  if (isAdminMode && isEditing) {
    return (
      <Card className="border-orange-200 bg-orange-50 h-full">
        <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-orange-800">
                ⚙️ Edit AI Assistant Link
              </h3>
            </div>

            <div>
              <Label htmlFor="custom-link">Custom AI Assistant Link (Optional)</Label>
              <Input
                id="custom-link"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://chatgpt.com/g/..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use the built-in assistant
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Check className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card ${className}`}>
      <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6 flex flex-col justify-center h-full relative">
        {isAdminMode && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 text-orange-600 hover:text-orange-800 h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Chat with AI Assistant
            </h3>
            {productName && (
              <p className="text-xs font-medium text-primary">
                for {productName}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-snug">
              {description || defaultDescription}
            </p>
          </div>

          {/* Button */}
          <Button
            type="button"
            onClick={handleLaunch}
            aria-label="Start chat with AI assistant"
            className="w-full h-10 text-sm"
            size="default"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {customLink ? "Open Chat" : "Start Chat"}
            {customLink && <ExternalLink className="h-3.5 w-3.5 ml-1" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
