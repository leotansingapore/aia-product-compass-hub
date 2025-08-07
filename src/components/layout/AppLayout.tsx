import { ReactNode, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { Button } from "@/components/ui/button";
import { LogIn, Settings } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAppStructureSync } from "@/hooks/useAppStructureSync";
import { usePermissions } from "@/hooks/usePermissions";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  console.log("AppLayout rendering");
  const { isAdminMode, toggleAdminMode, isAdmin } = useAdmin();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { autoSync } = useAppStructureSync();
  const { loading: permissionsLoading } = usePermissions();
  const isMobile = useIsMobile();

  // Auto-sync app structure when layout mounts (for admin users)
  useEffect(() => {
    autoSync();
  }, [autoSync]);
  
  // For unauthenticated users, show simple layout without sidebar
  if (!user) {
    if (isMobile) {
      return (
        <div className="min-h-screen w-full">
          <MobileHeader 
            title="AIA Learning Platform"
            rightAction={
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            }
          />
          <main className="flex-1 pb-20">
            {children}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full">
        {/* Top Bar for unauthenticated users */}
        <header className="flex h-12 items-center justify-between gap-2 border-b bg-card px-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold">AIA Learning Platform</h1>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }
  
  // Mobile Layout for authenticated users
  if (isMobile) {
    return (
      <div className="min-h-screen w-full">
        <MobileHeader 
          rightAction={
            !permissionsLoading && isAdmin ? (
              <Button
                variant={isAdminMode ? "default" : "outline"}
                size="sm"
                onClick={toggleAdminMode}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {isAdminMode ? "Exit" : "Admin"}
              </Button>
            ) : undefined
          }
        />
        
        <main className="flex-1 pb-20">
          {children}
        </main>
        
        <MobileBottomNav />
        
        {/* Onboarding Components */}
        <WelcomeModal />
        <OnboardingTutorial />
        <OnboardingHelpButton />
      </div>
    );
  }

  // Desktop Layout for authenticated users
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
              {/* Admin Toggle - only shown to master admins after permissions are loaded */}
              {!permissionsLoading && isAdmin && (
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