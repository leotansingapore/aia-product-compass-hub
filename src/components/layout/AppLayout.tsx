import React, { ReactNode, useEffect, memo, useRef, useState, useCallback, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import { AvatarWithProgress } from "@/components/profile/AvatarWithProgress";
import { ProfileSheet } from "@/components/profile/ProfileSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
// WelcomeModal, OnboardingTutorial, OnboardingHelpButton are rendered once at
// the App.tsx root (inside OnboardingProvider) — don't re-render them here.
const FloatingFeedbackButton = lazy(() => import("@/components/FloatingFeedbackButton").then(m => ({ default: m.FloatingFeedbackButton })));
import { useAdmin } from "@/hooks/useAdmin";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { useNavigate, useLocation } from "react-router-dom";

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
  const isMobile = useIsMobile();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // Prompt user to refresh when a new build is deployed.
  useVersionCheck();

  // Hide generic mobile top bar on script hub routes (each page uses BrandedPageHeader + hub tabs)
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
      <div className="min-h-screen w-full overflow-x-clip">
        <MobileHeader onAvatarClick={() => setProfileOpen(true)} />

        <main className="flex-1 pb-20 page-transition">
          {children}
        </main>
        
        <MobileBottomNav />

        <Suspense fallback={null}>
          <FloatingFeedbackButton />
        </Suspense>
        {profileOpen && (
          <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
        )}
      </div>
    );
  }

  // Desktop Layout for authenticated users
  // Admins / master admins always get the sidebar; learners get the top nav
  const useSidebarLayout = isAdmin;

  if (useSidebarLayout) {
    return (
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>
        <div className="min-h-screen flex w-full">
          <AppSidebar onProfileClick={() => setProfileOpen(true)} />
          <ResizeHandle />

          <SidebarInset className="flex-1 min-w-0 flex flex-col">
            <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <ThemeToggle />
              <button
                onClick={() => setProfileOpen(true)}
                className="rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="My Profile"
              >
                <AvatarWithProgress
                  size={32}
                  initials={user?.email?.charAt(0).toUpperCase() || 'U'}
                />
              </button>
            </header>

            <main className="flex-1 page-transition">
              {children}
            </main>
          </SidebarInset>
        </div>

        <Suspense fallback={null}>
          <FloatingFeedbackButton />
        </Suspense>
        {profileOpen && (
          <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
        )}
      </SidebarProvider>
    );
  }

  // Learner routes: top nav, full-width content, no sidebar
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav onProfileClick={() => setProfileOpen(true)} />

      <main className="flex-1 page-transition">
        {children}
      </main>

      <Suspense fallback={null}>
        <FloatingFeedbackButton />
      </Suspense>
      {profileOpen && (
        <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      )}
    </div>
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