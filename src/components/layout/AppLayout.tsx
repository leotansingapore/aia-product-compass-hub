import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { LogIn, Settings } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  console.log("AppLayout rendering");
  const { isAdminMode, toggleAdminMode, isAdmin } = useAdmin();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
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
            
            <div className="flex items-center gap-2">
              {/* Admin Toggle - shown when user is logged in (temporary for demo) */}
              {user && (
                <Button
                  variant={isAdminMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAdminMode}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isAdminMode ? "Exit Admin" : "Admin Mode"}
                </Button>
              )}
              
              {/* Login/Signup Button - shown when user is not logged in */}
              {!user ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4 rotate-180" />
                  Sign Out
                </Button>
              )}
            </div>
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