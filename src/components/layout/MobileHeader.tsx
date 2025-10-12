import { useLocation } from "react-router-dom";
import { MobileDrawer } from "./MobileDrawer";

interface MobileHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
}

export function MobileHeader({
  title,
  rightAction
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

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MobileDrawer />

          <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate">
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