import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Check, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductChatbotsProps {
  chatbot1Name?: string;
  chatbot1Link?: string;
  chatbot2Name?: string;
  chatbot3Name?: string;
  chatbot2Link?: string;
  chatbot3Link?: string;
  buttonText?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export function ProductChatbots({
  chatbot1Name = "Chat with AI Assistant",
  chatbot1Link,
  chatbot2Name = "Chat with Chatbot",
  chatbot3Name = "Chat with Notebook",
  chatbot2Link,
  chatbot3Link,
  buttonText = "Open Chat",
  onUpdate,
  isEditing,
  setIsEditing,
}: ProductChatbotsProps) {
  const [editData, setEditData] = useState({
    chatbot1Name,
    chatbot1Link: chatbot1Link || "",
    chatbot2Name,
    chatbot3Name,
    chatbot2Link: chatbot2Link || "",
    chatbot3Link: chatbot3Link || "",
    buttonText,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sync local state when props change (after successful save)
  useEffect(() => {
    setEditData({
      chatbot1Name,
      chatbot1Link: chatbot1Link || "",
      chatbot2Name,
      chatbot3Name,
      chatbot2Link: chatbot2Link || "",
      chatbot3Link: chatbot3Link || "",
      buttonText,
    });
  }, [chatbot1Name, chatbot1Link, chatbot2Name, chatbot3Name, chatbot2Link, chatbot3Link, buttonText]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate("chatbot_1_name", editData.chatbot1Name);
      await onUpdate("custom_gpt_link", editData.chatbot1Link);
      await onUpdate("chatbot_2_name", editData.chatbot2Name);
      await onUpdate("chatbot_link_2", editData.chatbot2Link);
      await onUpdate("chatbot_3_name", editData.chatbot3Name);
      await onUpdate("chatbot_link_3", editData.chatbot3Link);
      await onUpdate("chatbot_button_text", editData.buttonText);

      setIsEditing(false);
      toast({
        title: "Saved",
        description: "All chat settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to save chat settings:", error);
      toast({
        title: "Error",
        description: "Failed to save chat settings",
        variant: "destructive",
      });
      setEditData({
        chatbot1Name,
        chatbot1Link: chatbot1Link || "",
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
      chatbot1Name,
      chatbot1Link: chatbot1Link || "",
      chatbot2Name,
      chatbot3Name,
      chatbot2Link: chatbot2Link || "",
      chatbot3Link: chatbot3Link || "",
      buttonText,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="col-span-full">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-800">
                ⚙️ Edit All Chat Assistance
              </h3>
            </div>

            <div className="space-y-6">
              {/* 3-Column Layout for All 3 Chats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1st Chat */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-orange-900">1st Chat (AI Assistant)</h4>
                  <div>
                    <Label htmlFor="chatbot1-name">Chat Name</Label>
                    <Input
                      id="chatbot1-name"
                      value={editData.chatbot1Name}
                      onChange={(e) =>
                        setEditData({ ...editData, chatbot1Name: e.target.value })
                      }
                      placeholder="Chat with AI Assistant"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatbot1-link">Chat Link (Optional)</Label>
                    <Input
                      id="chatbot1-link"
                      value={editData.chatbot1Link}
                      onChange={(e) =>
                        setEditData({ ...editData, chatbot1Link: e.target.value })
                      }
                      placeholder="https://..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for built-in assistant
                    </p>
                  </div>
                </div>

                {/* 2nd Chat */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-orange-900">2nd Chat</h4>
                  <div>
                    <Label htmlFor="chatbot2-name">Chat Name</Label>
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
                    <Label htmlFor="chatbot2-link">Chat Link</Label>
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

                {/* 3rd Chat */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-orange-900">3rd Chat</h4>
                  <div>
                    <Label htmlFor="chatbot3-name">Chat Name</Label>
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
                    <Label htmlFor="chatbot3-link">Chat Link</Label>
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
              </div>

              {/* Shared Button Text */}
              <div className="max-w-md">
                <Label htmlFor="button-text">Button Text (for 2nd & 3rd chats)</Label>
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

              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={handleSave} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save All"}
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
      </div>
    );
  }

  return (
    <>
      {/* Chatbot 2 */}
      <Card className="h-full group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card">
        <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6 flex flex-col justify-center h-full">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {chatbot2Name}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                Additional AI support for specialized queries
              </p>
            </div>

            {/* Button */}
            {chatbot2Link ? (
              <Button
                asChild
                className="w-full h-10 text-sm"
                size="default"
              >
                <a
                  href={chatbot2Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {buttonText}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              <Button
                disabled
                className="w-full h-10"
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
      <Card className="h-full group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card">
        <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6 flex flex-col justify-center h-full">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {chatbot3Name}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                Expert guidance and advanced product insights
              </p>
            </div>

            {/* Button */}
            {chatbot3Link ? (
              <Button
                asChild
                className="w-full h-10 text-sm"
                size="default"
              >
                <a
                  href={chatbot3Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {buttonText}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              <Button
                disabled
                className="w-full h-10"
                size="default"
                variant="outline"
              >
                No link configured
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
