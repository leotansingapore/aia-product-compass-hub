import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library, GraduationCap, FileText, MessageCircle, Bookmark, Users, BookOpen, MoreHorizontal, GitBranch, TrendingUp, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const shortcuts = [
  { title: "Products", icon: Library, href: "/kb", bg: "bg-blue-100 dark:bg-blue-950/40", color: "text-blue-600 dark:text-blue-400" },
  { title: "CMFAS", icon: GraduationCap, href: "/cmfas-exams", bg: "bg-emerald-100 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Scripts", icon: FileText, href: "/scripts", bg: "bg-amber-100 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
  { title: "Roleplay", icon: MessageCircle, href: "/roleplay", bg: "bg-orange-100 dark:bg-orange-950/40", color: "text-orange-600 dark:text-orange-400" },
  { title: "Bookmarks", icon: Bookmark, href: "/bookmarks", bg: "bg-rose-100 dark:bg-rose-950/40", color: "text-rose-600 dark:text-rose-400" },
  { title: "By Client", icon: Users, href: "/search-by-profile", bg: "bg-violet-100 dark:bg-violet-950/40", color: "text-violet-600 dark:text-violet-400" },
  { title: "Playbooks", icon: BookOpen, href: "/playbooks", bg: "bg-cyan-100 dark:bg-cyan-950/40", color: "text-cyan-600 dark:text-cyan-400" },
];

const moreItems = [
  { title: "Script Flows", icon: GitBranch, href: "/flows", color: "text-amber-500" },
  { title: "Sales Tools", icon: TrendingUp, href: "/product/sales-tools-objections", color: "text-orange-500" },
  { title: "How to Use", icon: HelpCircle, href: "/how-to-use", color: "text-teal-500" },
];

export function QuickActions() {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {shortcuts.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.href)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm", item.bg)}>
                <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", item.color)} />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight">{item.title}</span>
            </button>
          ))}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
              <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight">More</span>
          </button>
        </div>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle>More Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            {moreItems.map((item) => (
              <button
                key={item.title}
                onClick={() => { navigate(item.href); setMoreOpen(false); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center leading-tight">{item.title}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
