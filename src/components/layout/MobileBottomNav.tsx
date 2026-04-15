import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Library, FileText, MessageCircle, Grid3X3, Package, HelpCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bookmark, GraduationCap, BookOpen, GitBranch, TrendingUp, MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackButton";
import { useAdmin } from "@/hooks/useAdmin";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/category/core-products", icon: Package },
  { name: "Scripts", href: "/scripts", icon: FileText },
  { name: "Q-Banks", href: "/question-banks", icon: HelpCircle },
];

const FEEDBACK_HREF = "__feedback__" as const;

const quickLinkItems = [
  { name: "Roleplay", href: "/roleplay", icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { name: "Feedback", href: FEEDBACK_HREF, icon: MessageSquarePlus, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/40" },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { name: "Learning Track", href: "/learning-track", icon: Library, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { name: "Categories", href: "/categories", icon: Library, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { name: "Playbooks", href: "/playbooks", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { name: "Script Flows", href: "/flows", icon: GitBranch, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { name: "Sales Tools", href: "/scripts", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
];

const adminQuickLink = { name: "Admin Panel", href: "/admin", icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" };

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 safe-area-pb">
        <div className="flex items-stretch justify-around">
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/scripts" && (
                location.pathname.startsWith("/scripts") ||
                location.pathname.startsWith("/objections") ||
                location.pathname.startsWith("/servicing")
              ));

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center px-1 py-2 min-h-[56px] flex-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
                <item.icon className={cn("h-5 w-5 mb-0.5 transition-all duration-200", isActive && "scale-110 drop-shadow-sm")} />
                <span className={cn("text-[10px] font-medium leading-none transition-all duration-200", isActive ? "font-semibold" : "")}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center px-1 py-2 min-h-[56px] flex-1 transition-colors",
              sheetOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {sheetOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
            <Grid3X3 className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Quick Links Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base">Quick Links</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3">
            {quickLinkItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  if (item.href === FEEDBACK_HREF) {
                    setFeedbackOpen(true);
                    setSheetOpen(false);
                    return;
                  }
                  navigate(item.href);
                  setSheetOpen(false);
                }}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                  item.bg
                )}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
