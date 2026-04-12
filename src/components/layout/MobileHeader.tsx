import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

interface MobileHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
  onAvatarClick?: () => void;
}

export function MobileHeader({
  title,
  rightAction,
  showBackButton = true,
  onAvatarClick,
}: MobileHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Safe auth hook
  let user: any = null;
  try {
    const auth = useSimplifiedAuth();
    user = auth.user;
  } catch {}

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === "/") return "Home";
    if (path === "/search") return "Search";
    if (path === "/cmfas-exams") return "CMFAS Exams";
    if (path === "/bookmarks") return "Bookmarks";
    if (path === "/my-account") return "My Account";
    if (path.startsWith("/cmfas/module/")) {
      const module = path.split("/").pop();
      return module?.toUpperCase() || "CMFAS Module";
    }
    if (path.startsWith("/category/")) return "Products";
    if (path.startsWith("/product/")) return "Product Details";
    return "FINternship";
  };

  // Top-level pages where back should go home instead of history.back()
  const topLevelPages = ['/learning-track', '/bookmarks', '/cmfas-exams', '/roleplay', '/my-account', '/scripts', '/how-to-use', '/search-by-profile', '/playbooks', '/flows', '/concept-cards'];
  const isTopLevel = location.pathname === '/' || topLevelPages.some(p => location.pathname === p);
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    if (isTopLevel) {
      navigate('/');
    } else {
      window.history.back();
    }
  };

  // Get user initials
  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBackButton && !isHomePage && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="font-semibold text-sm sm:text-base truncate">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {rightAction}
          {user && (
            <button
              onClick={() => {
                if (onAvatarClick) {
                  onAvatarClick();
                } else {
                  navigate('/my-account');
                }
              }}
              className="shrink-0 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="My Profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
