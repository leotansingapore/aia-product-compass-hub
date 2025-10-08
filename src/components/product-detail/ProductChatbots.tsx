import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { Edit, Check, X, ExternalLink, MessageCircle, Sparkles } from "lucide-react";

interface ProductChatbotsProps {
  chatbotLink1?: string;
  chatbotLink2?: string;
  chatbotLink3?: string;
  productName?: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductChatbots({ 
  chatbotLink1, 
  chatbotLink2, 
  chatbotLink3, 
  productName,
  onUpdate 
}: ProductChatbotsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink1, setEditLink1] = useState(chatbotLink1 || '');
  const [editLink2, setEditLink2] = useState(chatbotLink2 || '');
  const [editLink3, setEditLink3] = useState(chatbotLink3 || '');
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    console.log('🤖 ProductChatbots saving links');
    
    try {
      await onUpdate('custom_gpt_link', editLink1);
      await onUpdate('chatbot_link_2', editLink2);
      await onUpdate('chatbot_link_3', editLink3);
      setIsEditing(false);
      console.log('✅ ProductChatbots save successful');
      toast({
        title: "Saved",
        description: "Chatbot links updated successfully",
      });
    } catch (error) {
      console.error('❌ ProductChatbots save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save chatbot links",
        variant: "destructive",
      });
      setEditLink1(chatbotLink1 || '');
      setEditLink2(chatbotLink2 || '');
      setEditLink3(chatbotLink3 || '');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLink1(chatbotLink1 || '');
    setEditLink2(chatbotLink2 || '');
    setEditLink3(chatbotLink3 || '');
    setIsEditing(false);
  };

  const openChatbot = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const chatbots = [
    { id: 1, link: chatbotLink1, title: "AI Assistant", description: `Get instant help with ${productName || 'product'} details, comparisons, and sales tips` },
    { id: 2, link: chatbotLink2, title: "Chatbot 2", description: "Additional AI support for specialized queries" },
    { id: 3, link: chatbotLink3, title: "Chatbot 3", description: "Expert guidance and advanced product insights" },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Configuration Panel */}
      {isAdminMode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <span>⚙️</span> 
              Chatbot Links Configuration
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
              Configure external chatbot links (Pirlo, NotebookLM, or custom)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chatbot-link-1">Chatbot 1 Link (AI Assistant)</Label>
                  <Input
                    id="chatbot-link-1"
                    value={editLink1}
                    onChange={(e) => setEditLink1(e.target.value)}
                    placeholder="https://pirlo.ai/your-bot or https://notebooklm.google.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Primary chatbot link
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="chatbot-link-2">Chatbot 2 Link</Label>
                  <Input
                    id="chatbot-link-2"
                    value={editLink2}
                    onChange={(e) => setEditLink2(e.target.value)}
                    placeholder="https://pirlo.ai/your-bot or https://notebooklm.google.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Secondary chatbot link
                  </p>
                </div>

                <div>
                  <Label htmlFor="chatbot-link-3">Chatbot 3 Link</Label>
                  <Input
                    id="chatbot-link-3"
                    value={editLink3}
                    onChange={(e) => setEditLink3(e.target.value)}
                    placeholder="https://pirlo.ai/your-bot or https://notebooklm.google.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tertiary chatbot link
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
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Chatbot 1:</strong> {chatbotLink1 || 'Not configured'}
                </div>
                <div className="text-sm">
                  <strong>Chatbot 2:</strong> {chatbotLink2 || 'Not configured'}
                </div>
                <div className="text-sm">
                  <strong>Chatbot 3:</strong> {chatbotLink3 || 'Not configured'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chatbot Launchers Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {chatbots.map((chatbot) => (
          <Card 
            key={chatbot.id}
            className={`group transition-all duration-300 ${
              chatbot.link 
                ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer border-primary/20 hover:border-primary/40' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => chatbot.link && openChatbot(chatbot.link)}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center gap-3">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {chatbot.title}
                    </h3>
                    {chatbot.link && (
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {chatbot.description}
                  </p>
                  
                  <Button 
                    type="button"
                    disabled={!chatbot.link}
                    className="w-full group-hover:shadow-md transition-all duration-300"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (chatbot.link) openChatbot(chatbot.link);
                    }}
                  >
                    {chatbot.link ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Chat
                      </>
                    ) : (
                      'Not configured'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
