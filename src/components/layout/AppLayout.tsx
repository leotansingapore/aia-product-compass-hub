import { ReactNode, useEffect, memo, useMemo } from "react";
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
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStructureSync } from "@/hooks/useAppStructureSync";
import { usePermissions } from "@/hooks/usePermissions";
import { useIsMobile } from "@/hooks/use-mobile";

// Safe fallback to avoid crash if AdminProvider isn't mounted (e.g., during boot/HMR)
const useAdminSafe = () => {
  try {
    return useAdmin();
  } catch {
    return { isAdminMode: false, toggleAdminMode: () => {}, isAdmin: false };
  }
};

// Safe fallback to avoid crash if SimplifiedAuthProvider isn't mounted
const useSimplifiedAuthSafe = () => {
  try {
    return useSimplifiedAuth();
  } catch {
    return { user: null, loading: true, signOut: () => Promise.resolve() };
  }
};

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const { isAdminMode, toggleAdminMode, isAdmin } = useAdminSafe();
  const { user, loading, signOut } = useSimplifiedAuthSafe();
  const navigate = useNavigate();
  const { autoSync } = useAppStructureSync();
  const { loading: permissionsLoading } = usePermissions();
  const isMobile = useIsMobile();

  // Auto-sync disabled to improve performance
  // useEffect(() => {
  //   if (isAdmin) {
  //     autoSync();
  //   }
  // }, [autoSync, isAdmin]);

  // Password change is optional now; previously enforced via redirect
  const location = useLocation();
  useEffect(() => {
    // No-op: keep effect to reference variables and avoid unused warnings
  }, [user?.id, location.pathname, navigate]);
  
  // Show loading state while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }
  
  // For unauthenticated users, show simple layout without sidebar
  if (!user) {
    if (isMobile) {
      return (
        <div className="min-h-screen w-full">
          <MobileHeader 
            title="FINternship Learning Platform"
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
          <MobileBottomNav />
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full">
        {/* Top Bar for unauthenticated users */}
        <header className="flex h-12 items-center justify-between gap-2 border-b bg-card px-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold">FINternship Learning Platform</h1>
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
              <h1 className="text-lg font-semibold">FINternship Learning Platform</h1>
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
});

export { AppLayout };