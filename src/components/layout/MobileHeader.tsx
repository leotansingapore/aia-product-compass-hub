import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileDrawer } from "./MobileDrawer";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ 
  title, 
  showBackButton = false, 
  rightAction 
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-determine if back button should be shown
  const shouldShowBack = showBackButton || (
    location.pathname !== "/" && 
    location.pathname !== "/search" && 
    location.pathname !== "/cmfas-exams" && 
    location.pathname !== "/bookmarks" && 
    location.pathname !== "/account"
  );

  // Auto-determine title based on route
  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/search") return "Search";
    if (path === "/cmfas-exams") return "CMFAS Exams";
    if (path === "/bookmarks") return "Bookmarks";
    if (path === "/account") return "My Account";
    if (path.startsWith("/cmfas/module/")) {
      const module = path.split("/").pop();
      return module?.toUpperCase() || "CMFAS Module";
    }
    if (path.startsWith("/category/")) return "Products";
    if (path.startsWith("/product/")) return "Product Details";
    return "AIA Learning Platform";
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {shouldShowBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          ) : (
            <MobileDrawer />
          )}
          
          <h1 className="font-semibold text-lg truncate">
            {getPageTitle()}
          </h1>
        </div>

        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}