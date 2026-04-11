import React, { ReactNode, useEffect, memo, useRef, useState, useCallback, lazy, Suspense } from "react";
import { ScriptsTabBar } from "@/components/scripts/ScriptsTabBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const ProfileSheet = lazy(() => import("@/components/profile/ProfileSheet").then(m => ({ default: m.ProfileSheet })));
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { useAdmin } from "@/hooks/useAdmin";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStructureSync } from "@/hooks/useAppStructureSync";
import { usePermissions } from "@/hooks/usePermissions";
import { FeedbackButton } from "@/components/FeedbackButton";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // Pages that manage their own mobile header (show ScriptsTabBar instead)
  const scriptsRoutes = ['/scripts', '/servicing', '/objections', '/playbooks', '/flows', '/concept-cards'];
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
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth');

    // On the auth page itself, strip all chrome — no nav, no header
    if (isAuthPage) {
      return <main className="min-h-screen">{children}</main>;
    }

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
        {/* Top Bar for unauthenticated users on non-auth pages */}
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
      <div className="min-h-screen w-full overflow-x-hidden">
        <MobileHeader />
        {hideMobileHeader && (
          <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <ScriptsTabBar />
          </div>
        )}
        
        <main className="flex-1 pb-20 page-transition">
          {children}
        </main>
        
        <MobileBottomNav />
        
        {/* Onboarding Components */}
        <WelcomeModal />
        <OnboardingTutorial />
        <OnboardingHelpButton />
        <FeedbackButton />
      </div>
    );
  }

  // Desktop Layout for authenticated users
  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <ResizeHandle />
        
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          {/* Desktop Top Bar */}
          <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/my-account')}
              className="rounded-full h-8 w-8 p-0"
              aria-label="My Account"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </header>

          <main className="flex-1 page-transition">
            {children}
          </main>
        </SidebarInset>
      </div>
      
      {/* Onboarding Components */}
      <WelcomeModal />
      <OnboardingTutorial />
      <OnboardingHelpButton />
      <FeedbackButton />
    </SidebarProvider>
  );
});

/** Drag handle that sits on the right edge of the sidebar */
const ResizeHandle = memo(function ResizeHandle() {
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { state, toggleSidebar, open, setOpen } = useSidebar();
  // Use a ref so the mousemove closure always reads the latest value
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    hasDragged.current = false;
    isDragging.current = true;
    setActive(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      hasDragged.current = true;
      const collapsed = stateRef.current === "collapsed";
      const x = ev.clientX;

      if (collapsed) {
        // Only expand once dragged far enough right
        if (x > 160) {
          setOpen(true);
          const clamped = Math.min(480, Math.max(180, x));
          document.documentElement.style.setProperty("--sidebar-width", `${clamped}px`);
        }
        return;
      }

      // Collapse when dragged too far left
      if (x < 140) {
        setOpen(false);
        return;
      }

      const clamped = Math.min(480, Math.max(180, x));
      document.documentElement.style.setProperty("--sidebar-width", `${clamped}px`);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const w = document.documentElement.style.getPropertyValue("--sidebar-width");
      if (w) localStorage.setItem("sidebar-width", w);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [setOpen]);

  // Click (no drag) toggles expand/collapse
  const onClick = useCallback(() => {
    if (!hasDragged.current) toggleSidebar();
  }, [toggleSidebar]);

  const isCollapsed = state === "collapsed";

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCollapsed ? "Click or drag right to expand" : "Drag to resize · Click to collapse"}
      className={`
        relative z-20 flex items-center justify-center
        shrink-0 select-none transition-colors duration-150
        w-2 cursor-col-resize
        ${active ? "bg-primary/20" : hovered ? "bg-primary/10" : "bg-transparent"}
      `}
    >
      <div className={`
        absolute rounded-full transition-all duration-200
        ${active ? "w-1 h-12 bg-primary" :
          hovered ? "w-1 h-10 bg-primary/60" :
          "w-px h-8 bg-border"}
      `} />
    </div>
  );
});

export { AppLayout };