import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, BookOpen, User, Bookmark, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Knowledge",
    href: "/kb",
    icon: Library,
  },
  {
    name: "CMFAS",
    href: "/cmfas-exams",
    icon: BookOpen,
  },
  {
    name: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
  {
    name: "Account",
    href: "/my-account",
    icon: User,
  },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2">
        {navigationItems.map((item) => {
const isActive = location.pathname === item.href || 
            (item.href === "/cmfas-exams" && location.pathname.startsWith("/cmfas")) ||
            (item.href === "/kb" && (location.pathname === "/kb" || location.pathname.startsWith("/kb/")));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-3 min-h-[60px] flex-1 transition-colors mobile-touch-target",
                "active:bg-muted/50 active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}