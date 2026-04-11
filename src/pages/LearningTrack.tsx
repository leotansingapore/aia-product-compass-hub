import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";

const baseTabClass =
  "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors";
const activeTabClass = "border-primary text-foreground";

export default function LearningTrack() {
  const { isAdmin, isMasterAdmin } = usePermissions();
  const showAdminTab = isAdmin() || isMasterAdmin();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/learning-track" && location.pathname.startsWith("/learning-track/")) {
      localStorage.setItem("lt-last-tab", location.pathname);
    }
  }, [location.pathname]);

  return (
    <PageLayout>
      <BrandedPageHeader
        title="Learning Track"
        description="Your phased onboarding programme. Complete each phase in order."
      />

      <nav className="flex gap-1 border-b mt-4 mb-6 overflow-x-auto" aria-label="Learning track sections">
        <NavLink
          to="/learning-track/pre-rnf"
          className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}
        >
          Pre-RNF Training
        </NavLink>
        <NavLink
          to="/learning-track/post-rnf"
          className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}
        >
          Post-RNF Training
        </NavLink>
        <NavLink
          to="/learning-track/resources"
          className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}
        >
          Resources
        </NavLink>
        {showAdminTab && (
          <NavLink
            to="/learning-track/admin"
            className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}
          >
            Admin
          </NavLink>
        )}
      </nav>

      <Outlet />
    </PageLayout>
  );
}
