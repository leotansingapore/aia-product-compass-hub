import { useLocation } from "react-router-dom";
import { MobileDrawer } from "./MobileDrawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MobileHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
}

export function MobileHeader({
  title,
  rightAction,
  showBackButton = true
}: MobileHeaderProps) {
  const location = useLocation();

  // Auto-determine title based on route
  const getPageTitle = () => {
    if (title) return title;

    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/search") return "Search";
    if (path === "/kb") return "Knowledge Base";
    if (path.startsWith("/kb/")) return "Knowledge Base";
    if (path === "/cmfas-exams") return "CMFAS Exams";
    if (path === "/bookmarks") return "Bookmarks";
    if (path === "/my-account") return "My Account";
    if (path.startsWith("/cmfas/module/")) {
      const module = path.split("/").pop();
      return module?.toUpperCase() || "CMFAS Module";
    }
    if (path.startsWith("/category/")) return "Products";
    if (path.startsWith("/product/")) return "Product Details";
    return "FINternship Learning Platform";
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MobileDrawer />

          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {rightAction}
        </div>
      </div>
    </header>
  );
}