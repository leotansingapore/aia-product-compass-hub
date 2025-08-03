import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { CMFASChatbot } from "@/components/cmfas/CMFASChatbot";

const moduleNames: Record<string, string> = {
  m9: "M9 Module - Life Insurance & Investment-Linked Policies",
  m9a: "M9A Module - Investment-Linked Life Insurance",
  hi: "HI Module - Health Insurance",
  res5: "RES5 Module - Rules & Regulations",
  onboarding: "CMFAS Onboarding - Getting Started Guide"
};

export default function CMFASChat() {
  const { moduleId } = useParams<{ moduleId?: string }>();
  const navigate = useNavigate();

  const moduleName = moduleId ? moduleNames[moduleId] : "CMFAS AI Tutor";
  const pageTitle = moduleId ? `Chat - ${moduleName}` : "CMFAS AI Tutor";

  const handleBack = () => {
    if (moduleId) {
      navigate(`/cmfas/module/${moduleId}`);
    } else {
      navigate('/cmfas-exams');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Chat with AI tutor about ${moduleName}`} />
      </Helmet>

      {/* Mobile Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shrink-0">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground truncate">AI Tutor</h1>
            {moduleId && (
              <p className="text-sm text-muted-foreground truncate">
                {moduleId.toUpperCase()} Module
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface - Full height minus header */}
      <div className="flex-1 min-h-0">
        <CMFASChatbot
          moduleId={moduleId}
          moduleName={moduleName}
        />
      </div>
    </div>
  );
}