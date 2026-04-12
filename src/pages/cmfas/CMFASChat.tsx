import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AITutorFABIcon } from "@/components/cmfas/AITutorFABIcon";
import { CMFASChatbot } from "@/components/cmfas/CMFASChatbot";
import { ProtectedPage } from "@/components/ProtectedPage";

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
    <ProtectedPage pageId="cmfas-chat">
      <div className="h-screen bg-background flex flex-col">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={`Chat with AI tutor about ${moduleName}`} />
          <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        </Helmet>

        {/* Mobile Header */}
        <div className="flex items-center gap-3 p-3 md:p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 mobile-header">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="shrink-0 mobile-touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-sm"
              aria-hidden
            >
              <AITutorFABIcon className="h-[22px] w-[22px]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-semibold text-foreground truncate">AI Tutor</h1>
              {moduleId && (
                <p className="text-micro md:text-sm text-muted-foreground truncate">
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
    </ProtectedPage>
  );
}