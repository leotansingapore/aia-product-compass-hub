import React, { ReactNode, useEffect, memo, useState, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
// The entire admin desktop layout (SidebarProvider, AppSidebar, ResizeHandle,
// shadcn sidebar primitives) is code-split into its own chunk — learners never
// download any of it.
const AdminDesktopLayout = lazy(() => import("./AdminDesktopLayout"));
const FloatingFeedbackButton = lazy(() => import("@/components/FloatingFeedbackButton").then(m => ({ default: m.FloatingFeedbackButton })));
// ProfileSheet is only shown when the user opens the avatar menu; lazy-load so
// its learning-track queries and sub-forms don't bloat the initial bundle.
const ProfileSheet = lazy(() => import("@/components/profile/ProfileSheet").then(m => ({ default: m.ProfileSheet })));
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
          <Suspense fallback={null}>
            <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
          </Suspense>
        )}
      </div>
    );
  }

  // Desktop Layout for authenticated users
  // Admins / master admins always get the sidebar; learners get the top nav
  if (isAdmin) {
    return (
      <>
        <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
          <AdminDesktopLayout
            sidebarDefaultOpen={sidebarDefaultOpen}
            userInitials={user?.email?.charAt(0).toUpperCase() || "U"}
            onProfileClick={() => setProfileOpen(true)}
          >
            {children}
          </AdminDesktopLayout>
        </Suspense>

        <Suspense fallback={null}>
          <FloatingFeedbackButton />
        </Suspense>
        {profileOpen && (
          <Suspense fallback={null}>
            <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
          </Suspense>
        )}
      </>
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
        <Suspense fallback={null}>
          <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
        </Suspense>
      )}
    </div>
  );
});

export { AppLayout };