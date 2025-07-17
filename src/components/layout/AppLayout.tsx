import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Settings } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { useAdmin } from "@/hooks/useAdmin";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  console.log("AppLayout rendering");
  const { isAdminMode, toggleAdminMode, isAdmin } = useAdmin();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Bar with Sidebar Toggle */}
          <header className="flex h-12 items-center justify-between gap-2 border-b bg-card px-4 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-onboarding="sidebar-trigger" />
              <h1 className="text-lg font-semibold">AIA Learning Platform</h1>
            </div>
            
            {/* Admin Mode Toggle */}
            <Button
              variant={isAdminMode ? "default" : "ghost"}
              size="sm"
              onClick={toggleAdminMode}
              className={isAdminMode ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
              title={isAdminMode ? "Disable Admin Mode" : "Enable Admin Mode"}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
      
      {/* Onboarding Components */}
      <WelcomeModal />
      <OnboardingTutorial />
      <OnboardingHelpButton />
    </SidebarProvider>
  );
}