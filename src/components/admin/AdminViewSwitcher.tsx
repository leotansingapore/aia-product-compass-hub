import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Eye, EyeOff, ChevronDown, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TIER_LEVELS, TIER_META, type TierLevel } from '@/lib/tiers';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'view-as-tier';

interface ViewModeContextType {
  /** When non-null, the admin is impersonating a specific tier. */
  viewAsTier: TierLevel | null;
  /** Set (or clear, by passing null) the tier impersonation. */
  setViewAsTier: (tier: TierLevel | null) => void;
  /** Derived: true whenever the admin is viewing as any user tier. */
  isViewingAsUser: boolean;
  /** Back-compat: toggles between admin and "explorer" as a generic user view. */
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewAsTier: null,
  setViewAsTier: () => {},
  isViewingAsUser: false,
  toggleViewMode: () => {},
});

function readStoredTier(): TierLevel | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if ((TIER_LEVELS as readonly string[]).includes(raw)) return raw as TierLevel;
  } catch {
    /* ignore */
  }
  return null;
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewAsTier, setViewAsTierState] = useState<TierLevel | null>(() => readStoredTier());

  const setViewAsTier = useCallback((tier: TierLevel | null) => {
    setViewAsTierState(tier);
    if (typeof window === 'undefined') return;
    try {
      if (tier) window.localStorage.setItem(STORAGE_KEY, tier);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewAsTier(viewAsTier ? null : 'explorer');
  }, [viewAsTier, setViewAsTier]);

  const value = useMemo(
    () => ({
      viewAsTier,
      setViewAsTier,
      isViewingAsUser: viewAsTier !== null,
      toggleViewMode,
    }),
    [viewAsTier, setViewAsTier, toggleViewMode],
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

export function AdminViewSwitcher() {
  const { isActualAdmin } = useAdmin();
  const { viewAsTier, setViewAsTier } = useViewMode();
  const [open, setOpen] = useState(false);

  // If the user loses admin, drop impersonation so they don't get stuck.
  useEffect(() => {
    if (!isActualAdmin && viewAsTier !== null) setViewAsTier(null);
  }, [isActualAdmin, viewAsTier, setViewAsTier]);

  if (!isActualAdmin) return null;

  const activeLabel = viewAsTier ? TIER_META[viewAsTier].label : 'Admin';
  const ActiveIcon = viewAsTier ? TIER_META[viewAsTier].icon : Shield;

  return (
    <div className="fixed bottom-20 md:bottom-16 left-4 z-[9991]">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={viewAsTier ? 'destructive' : 'secondary'}
            size="sm"
            className="shadow-lg gap-2"
          >
            {viewAsTier ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {viewAsTier ? `View: ${activeLabel}` : 'View as…'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-52">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Debug view
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setViewAsTier(null)}
            className={cn('gap-2', viewAsTier === null && 'bg-accent')}
          >
            <Shield className="h-4 w-4 text-primary" />
            <span className="flex-1">Admin (full access)</span>
            {viewAsTier === null && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Impersonate tier
          </DropdownMenuLabel>
          {TIER_LEVELS.map((tier) => {
            const meta = TIER_META[tier];
            const Icon = meta.icon;
            const active = viewAsTier === tier;
            return (
              <DropdownMenuItem
                key={tier}
                onClick={() => setViewAsTier(tier)}
                className={cn('gap-2', active && 'bg-accent')}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{meta.label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
                {active && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
