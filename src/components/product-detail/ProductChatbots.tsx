import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Sparkles, Edit, Check, X, ExternalLink } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

interface ProductChatbotsProps {
  chatbot2Name?: string;
  chatbot3Name?: string;
  chatbot2Link?: string;
  chatbot3Link?: string;
  buttonText?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductChatbots({
  chatbot2Name = "Chat with Chatbot",
  chatbot3Name = "Chat with Notebook",
  chatbot2Link,
  chatbot3Link,
  buttonText = "Open Chat",
  onUpdate,
}: ProductChatbotsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    chatbot2Name,
    chatbot3Name,
    chatbot2Link: chatbot2Link || "",
    chatbot3Link: chatbot3Link || "",
    buttonText,
  });
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate("chatbot_2_name", editData.chatbot2Name);
      await onUpdate("chatbot_3_name", editData.chatbot3Name);
      await onUpdate("chatbot_link_2", editData.chatbot2Link);
      await onUpdate("chatbot_link_3", editData.chatbot3Link);
      await onUpdate("chatbot_button_text", editData.buttonText);
      
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Chatbot settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to save chatbot settings:", error);
      toast({
        title: "Error",
        description: "Failed to save chatbot settings",
        variant: "destructive",
      });
      setEditData({
        chatbot2Name,
        chatbot3Name,
        chatbot2Link: chatbot2Link || "",
        chatbot3Link: chatbot3Link || "",
        buttonText,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      chatbot2Name,
      chatbot3Name,
      chatbot2Link: chatbot2Link || "",
      chatbot3Link: chatbot3Link || "",
      buttonText,
    });
    setIsEditing(false);
  };

  if (isAdminMode && isEditing) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-800">
              ⚙️ Edit Chatbot Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chatbot2-name">Chatbot 2 Name</Label>
                <Input
                  id="chatbot2-name"
                  value={editData.chatbot2Name}
                  onChange={(e) =>
                    setEditData({ ...editData, chatbot2Name: e.target.value })
                  }
                  placeholder="Chat with Chatbot"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chatbot2-link">Chatbot 2 Link</Label>
                <Input
                  id="chatbot2-link"
                  value={editData.chatbot2Link}
                  onChange={(e) =>
                    setEditData({ ...editData, chatbot2Link: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chatbot3-name">Chatbot 3 Name</Label>
                <Input
                  id="chatbot3-name"
                  value={editData.chatbot3Name}
                  onChange={(e) =>
                    setEditData({ ...editData, chatbot3Name: e.target.value })
                  }
                  placeholder="Chat with Notebook"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chatbot3-link">Chatbot 3 Link</Label>
                <Input
                  id="chatbot3-link"
                  value={editData.chatbot3Link}
                  onChange={(e) =>
                    setEditData({ ...editData, chatbot3Link: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={editData.buttonText}
                onChange={(e) =>
                  setEditData({ ...editData, buttonText: e.target.value })
                }
                placeholder="Open Chat"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
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
    <div className="space-y-4">
      {isAdminMode && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="text-orange-600 hover:text-orange-800"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Chatbots
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Chatbot 2 */}
        <Card className="group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-foreground">
                  {chatbot2Name}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  Additional AI support for specialized queries
                </p>
              </div>

              {/* Button */}
              {chatbot2Link ? (
                <Button
                  asChild
                  className="w-full h-11 text-sm font-medium"
                  size="default"
                >
                  <a
                    href={chatbot2Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    {buttonText}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full h-11"
                  size="default"
                  variant="outline"
                >
                  No link configured
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot 3 */}
        <Card className="group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-foreground">
                  {chatbot3Name}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  Expert guidance and advanced product insights
                </p>
              </div>

              {/* Button */}
              {chatbot3Link ? (
                <Button
                  asChild
                  className="w-full h-11 text-sm font-medium"
                  size="default"
                >
                  <a
                    href={chatbot3Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    {buttonText}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full h-11"
                  size="default"
                  variant="outline"
                >
                  No link configured
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
