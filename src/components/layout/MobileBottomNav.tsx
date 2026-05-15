import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  GraduationCap,
  Brain,
  BookOpen,
  Grid3X3,
  Bookmark,
  MessageCircle,
  MessageSquarePlus,
  ShieldCheck,
  Trophy,
  TrendingUp,
  Pencil,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FeedbackModal } from "@/components/FeedbackButton";
import { useAdmin } from "@/hooks/useAdmin";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/lib/tiers";
import { prefetchHandlers, prefetchRoute } from "@/utils/routePrefetch";

const FEEDBACK_HREF = "__feedback__" as const;

interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  features?: readonly string[];
}

// Sales Playbooks deep-links to the user's last-visited sub-tab when present —
// scripts/servicing/objections/playbooks/flows/concept-cards/case-vault all
// write `sales-playbooks-last-route` into localStorage when navigated to.
function readSalesPlaybooksRoute(): string {
  try {
    return localStorage.getItem("sales-playbooks-last-route") || "/scripts";
  } catch {
    return "/scripts";
  }
}

const SALES_PLAYBOOK_ROUTES = [
  "/scripts",
  "/servicing",
  "/objections",
  "/playbooks",
  "/flows",
  "/concept-cards",
  "/case-vault",
  "/drawings-playbook",
];

const PRIMARY_ITEMS: MobileNavItem[] = [
  {
    name: "Learning",
    href: "/learning-track",
    icon: GraduationCap,
    features: [FEATURES.EXPLORER_TRACK, FEATURES.PRE_RNF_TRACK, FEATURES.POST_RNF_TRACK],
  },
  { name: "Library", href: "/library", icon: BookOpen, features: [FEATURES.PRODUCTS, FEATURES.QUESTION_BANKS] },
  { name: "Exams", href: "/cmfas-exams", icon: GraduationCap, features: [FEATURES.CMFAS] },
  // Sales Playbooks — daily-use for post-RNF consultants. Deep-links to the
  // last-visited tab (scripts / servicing / objections / playbooks / flows /
  // concept-cards / case-vault).
  {
    name: "Sales",
    href: "/scripts",
    icon: TrendingUp,
    features: [FEATURES.PLAYBOOKS, FEATURES.SCRIPTS],
  },
  { name: "Board", href: "/leaderboard", icon: Trophy },
];

interface QuickLink {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  features?: readonly string[];
}

const QUICK_LINKS: QuickLink[] = [
  // Sales Playbooks sub-tabs surfaced individually so post-RNF consultants can
  // deep-link to the exact tool they need (Concept Cards for drilling drawings,
  // Case Vault for browsing real-prospect receipts).
  { name: "Concept Cards", href: "/concept-cards", icon: Pencil, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", features: [FEATURES.CONCEPT_CARDS] },
  { name: "Case Vault", href: "/case-vault", icon: Archive, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", features: [FEATURES.CASE_VAULT] },
  { name: "Question Banks", href: "/library?tab=banks", icon: Brain, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", features: [FEATURES.QUESTION_BANKS] },
  { name: "Roleplay", href: "/roleplay", icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", features: [FEATURES.ROLEPLAY] },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", features: [FEATURES.BOOKMARKS] },
  { name: "Feedback", href: FEEDBACK_HREF, icon: MessageSquarePlus, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/40" },
];

const ADMIN_LINKS: QuickLink[] = [
  {
    name: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    name: "Track Admin",
    href: "/learning-track/admin",
    icon: GraduationCap,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const { isViewingAsUser } = useViewMode();
  const { canAny, isAdminBypass } = useFeatureAccess();
  const showAdmin = isAdmin && !isViewingAsUser;

  const visiblePrimary = useMemo(() => {
    return PRIMARY_ITEMS.filter((item) => {
      if (!item.features) return true;
      if (isAdminBypass) return true;
      return canAny(item.features as any);
    });
  }, [canAny, isAdminBypass]);

  const visibleQuickLinks = useMemo(() => {
    const filtered = QUICK_LINKS.filter((item) => {
      if (!item.features) return true;
      if (isAdminBypass) return true;
      return canAny(item.features as any);
    });
    return showAdmin ? [...filtered, ...ADMIN_LINKS] : filtered;
  }, [canAny, isAdminBypass, showAdmin]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 safe-area-pb">
        <div className="flex items-stretch justify-around">
          {visiblePrimary.map((item) => {
            // Sales tab is active on any Sales Playbooks sub-route — and
            // deep-links to whichever sub-tab the user last visited.
            const isSales = item.name === "Sales";
            const effectiveHref = isSales ? readSalesPlaybooksRoute() : item.href;
            const isActive = (() => {
              if (isSales) return SALES_PLAYBOOK_ROUTES.some((r) => location.pathname.startsWith(r));
              if (item.href === "/") return location.pathname === "/";
              return location.pathname.startsWith(item.href);
            })();

            return (
              <NavLink
                key={item.name}
                to={effectiveHref}
                {...prefetchHandlers(effectiveHref)}
                className={cn(
                  "relative flex flex-col items-center justify-center px-1 py-2 min-h-[56px] flex-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
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
            {visibleQuickLinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onMouseEnter={() => item.href !== FEEDBACK_HREF && prefetchRoute(item.href)}
                onTouchStart={() => item.href !== FEEDBACK_HREF && prefetchRoute(item.href)}
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
