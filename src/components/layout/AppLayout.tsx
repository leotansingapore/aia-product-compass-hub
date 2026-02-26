import React, { ReactNode, useEffect, memo, useMemo, useRef, useState, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
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
    return { isAdmin: false };
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
  const { isAdmin } = useAdminSafe();
  const { user, loading, signOut } = useSimplifiedAuthSafe();
  const navigate = useNavigate();
  const { autoSync } = useAppStructureSync();
  const { loading: permissionsLoading } = usePermissions();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Pages that manage their own mobile header (show ScriptsTabBar instead)
  const scriptsRoutes = ['/scripts', '/servicing', '/objections', '/playbooks', '/flows'];
  const hideMobileHeader = isMobile && scriptsRoutes.some(r => location.pathname.startsWith(r));

  // Read sidebar state from cookie for persistence
  const sidebarDefaultOpen = React.useMemo(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)sidebar:state=([^;]*)/);
      if (match) return match[1] === 'true';
    } catch {}
    return true;
  }, []);

  // Restore saved sidebar width
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-width");
      if (saved) document.documentElement.style.setProperty("--sidebar-width", saved);
    } catch {}
  }, []);

  // Auto-sync disabled to improve performance
  // useEffect(() => {
  //   if (isAdmin) {
  //     autoSync();
  //   }
  // }, [autoSync, isAdmin]);

  // Password change is optional now; previously enforced via redirect
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
          {!hideMobileHeader && (
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
          )}
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
        {!hideMobileHeader && <MobileHeader />}
        
        <main className="flex-1 pb-20 page-transition">
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
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <ResizeHandle />
        
        <SidebarInset className="flex-1 min-w-0">
          <main className="flex-1 page-transition">
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

/** Drag handle that sits on the right edge of the sidebar */
const ResizeHandle = memo(function ResizeHandle() {
  const isDragging = useRef(false);
  const [active, setActive] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setActive(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      // Clamp between 180px and 480px
      const newWidth = Math.min(480, Math.max(180, ev.clientX));
      document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Persist
      const w = document.documentElement.style.getPropertyValue("--sidebar-width");
      if (w) localStorage.setItem("sidebar-width", w);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div
      onMouseDown={onMouseDown}
      title="Drag to resize"
      className={`
        relative z-20 flex items-center justify-center
        w-1 shrink-0 cursor-col-resize select-none
        transition-colors duration-150
        ${active ? "bg-primary/40" : "bg-transparent hover:bg-primary/20"}
      `}
    >
      {/* Visual pill indicator */}
      <div className={`
        absolute rounded-full w-1 h-8
        transition-all duration-150
        ${active ? "bg-primary scale-y-110" : "bg-border group-hover:bg-primary/50"}
      `} />
    </div>
  );
});

export { AppLayout };