import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Brain,
  MessageCircle,
  Bookmark,
  Shield,
  Trophy,
} from "lucide-react";
import { FINTERNSHIP_LOGO_NAVY } from "@/constants/branding";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useAdmin } from "@/hooks/useAdmin";
import { FEATURES } from "@/lib/tiers";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  features?: readonly string[];
  adminOnly?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    title: "My Learning",
    url: "/learning-track",
    icon: GraduationCap,
    features: [FEATURES.EXPLORER_TRACK, FEATURES.PRE_RNF_TRACK, FEATURES.POST_RNF_TRACK],
  },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Library", url: "/library", icon: BookOpen, features: [FEATURES.PRODUCTS, FEATURES.QUESTION_BANKS] },
  { title: "Roleplay", url: "/roleplay", icon: MessageCircle, features: [FEATURES.ROLEPLAY] },
  { title: "Exams", url: "/cmfas-exams", icon: GraduationCap, features: [FEATURES.CMFAS] },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, features: [FEATURES.BOOKMARKS] },
  { title: "Admin", url: "/admin", icon: Shield, adminOnly: true },
];

// `shrink-0` + `whitespace-nowrap` keep labels on a single line even when the
// nav is over-full at md (768px) widths — items overflow horizontally instead
// of wrapping into two lines (which looked broken on the FINternship logo +
// 6-item row at 768-900px). Outer container scrolls horizontally if needed.
const LINK_BASE =
  "shrink-0 inline-flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap";
const LINK_ACTIVE = "bg-primary/10 text-primary font-semibold";

export const TopNav = memo(function TopNav({
  onProfileClick,
}: {
  onProfileClick?: () => void;
}) {
  const { user } = useSimplifiedAuth();
  const { canAny, isAdminBypass } = useFeatureAccess();
  const { isAdmin: isAdminUser } = useAdmin();

  const visibleItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.adminOnly) return isAdminUser;
      if (!item.features) return true;
      if (isAdminBypass) return true;
      return canAny(item.features as any);
    });
  }, [isAdminUser, isAdminBypass, canAny]);

  return (
    <nav className="sticky top-0 z-40 hidden md:flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 md:px-3 lg:px-4 gap-1">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center gap-2 shrink-0 mr-2 lg:mr-4 hover:opacity-80 transition-opacity"
      >
        <img
          src={FINTERNSHIP_LOGO_NAVY}
          alt="FINternship"
          className="h-8 w-auto object-contain"
          decoding="async"
        />
      </NavLink>

      {/* Nav links — horizontal scroll if over-full at narrow md widths so
          labels stay on one line instead of wrapping. */}
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            title={item.title}
            className={({ isActive }) =>
              cn(LINK_BASE, isActive && LINK_ACTIVE)
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {/* Show text label on lg+ only — at md (768-1023px) we go
                icon-only with a tooltip so the row never overflows on
                tablet. Avatar/Theme buttons on the right stay full size. */}
            <span className="hidden lg:inline">{item.title}</span>
            <span className="sr-only lg:hidden">{item.title}</span>
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => onProfileClick?.()}
          // Larger 44x44 hit target (WCAG min) with padding so the click area
          // extends well beyond the visible 32px avatar — much easier to hit
          // near the edge of the viewport.
          className="flex h-11 w-11 items-center justify-center rounded-full ring-offset-background transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open profile"
        >
          <Avatar className="h-8 w-8 pointer-events-none">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </nav>
  );
});
