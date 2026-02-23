import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Library, FileText, MessageCircle, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bookmark, GraduationCap, Users, HelpCircle, BookOpen, GitBranch, TrendingUp } from "lucide-react";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/kb", icon: Library },
  { name: "Scripts", href: "/scripts", icon: FileText },
  { name: "Roleplay", href: "/roleplay", icon: MessageCircle },
];

const quickLinkItems = [
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, color: "text-rose-500" },
  { name: "CMFAS Exams", href: "/cmfas-exams", icon: GraduationCap, color: "text-emerald-500" },
  { name: "Search by Client", href: "/search-by-profile", icon: Users, color: "text-violet-500" },
  { name: "How to Use", href: "/how-to-use", icon: HelpCircle, color: "text-teal-500" },
  { name: "Playbooks", href: "/playbooks", icon: BookOpen, color: "text-blue-500" },
  { name: "Script Flows", href: "/flows", icon: GitBranch, color: "text-amber-500" },
  { name: "Sales Tools", href: "/product/sales-tools-objections", icon: TrendingUp, color: "text-orange-500" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
        <div className="flex items-center justify-around px-1 py-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href === "/roleplay" && location.pathname.startsWith("/roleplay")) ||
              (item.href === "/kb" && (location.pathname === "/kb" || location.pathname.startsWith("/kb/"))) ||
              (item.href === "/scripts" && location.pathname.startsWith("/scripts"));

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-3 min-h-[60px] flex-1 transition-colors mobile-touch-target",
                  "active:bg-muted/50 active:scale-95",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

          {/* Quick Links tab */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-3 min-h-[60px] flex-1 transition-colors mobile-touch-target",
              "active:bg-muted/50 active:scale-95",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid3X3 className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">More</span>
          </button>
        </div>
      </nav>

      {/* Quick Links Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle>Quick Links</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            {quickLinkItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.href); setSheetOpen(false); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
