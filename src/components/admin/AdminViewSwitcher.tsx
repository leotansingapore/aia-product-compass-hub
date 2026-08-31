import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Eye, EyeOff, ChevronDown, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { usePermissions } from '@/hooks/usePermissions';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
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
  const [storedTier, setStoredTierState] = useState<TierLevel | null>(() => readStoredTier());
  const { isMasterAdmin, hasRole, loading: permissionsLoading } = usePermissions();
  const { loading: authLoading, user } = useSimplifiedAuth();

  // Tier impersonation is an ADMIN debug tool. `view-as-tier` lives in
  // localStorage, which any user can write, so admin status is re-checked
  // here — the resolved `viewAsTier` is null for everyone else no matter what
  // the key says. Without this, a regular user could set the key to
  // `post_rnf` and unlock every tier-gated route in the client.
  const isActualAdmin =
    !permissionsLoading && !authLoading && !!user && (isMasterAdmin() || hasRole('admin'));
  const viewAsTier = isActualAdmin ? storedTier : null;

  const setViewAsTier = useCallback((tier: TierLevel | null) => {
    setStoredTierState(tier);
    if (typeof window === 'undefined') return;
    try {
      if (tier) window.localStorage.setItem(STORAGE_KEY, tier);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Drop a persisted impersonation once we're sure the signed-in user is not
  // an admin (e.g. their role was revoked, or they set the key by hand).
  //
  // WAIT for BOTH auth AND permissions to finish loading first.
  // `usePermissions.loading` flips false the moment `user` is null (which is
  // the initial state before auth resolves on every page load) — clearing
  // during that gap stomped `view-as-tier` back to null on every refresh, so
  // an admin's "View as Papers-taker" reverted to admin view after any reload.
  useEffect(() => {
    if (permissionsLoading || authLoading || !user) return;
    if (!isActualAdmin && storedTier !== null) setViewAsTier(null);
  }, [isActualAdmin, permissionsLoading, authLoading, user, storedTier, setViewAsTier]);

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
  const { isActualAdmin, loading } = useAdmin();
  const { loading: authLoading, user } = useSimplifiedAuth();
  const { viewAsTier, setViewAsTier } = useViewMode();
  const [open, setOpen] = useState(false);

  // Losing admin drops the impersonation — handled in ViewModeProvider, which
  // owns the localStorage key and re-checks admin status before honouring it.

  if (loading || authLoading || !isActualAdmin) return null;

  const activeLabel = viewAsTier ? TIER_META[viewAsTier].label : 'Admin';
  const ActiveIcon = viewAsTier ? TIER_META[viewAsTier].icon : Shield;

  // Desktop offset clears the sidebar footer (account row + Sign out, ~121px
  // tall). At md:bottom-16 the pill landed exactly on the account row and hid
  // the signed-in email and role badge on every page an admin opened.
  return (
    <div className="fixed bottom-[4.75rem] md:bottom-36 left-2 sm:left-4 z-[9991]">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={viewAsTier ? 'destructive' : 'secondary'}
            size="sm"
            aria-label={viewAsTier ? `View as ${activeLabel}` : 'View as…'}
            className={cn(
              'shadow-md gap-2 transition-opacity',
              // Mobile: small, low-opacity icon button parked just above the bottom nav on
              // the left edge. Kept tiny + faded so it doesn't visually compete with page CTAs.
              'h-7 w-7 p-0 rounded-full opacity-30 hover:opacity-100 active:opacity-100 focus-visible:opacity-100',
              'sm:h-9 sm:w-auto sm:px-3 sm:rounded-md sm:opacity-100 sm:shadow-lg',
            )}
          >
            {viewAsTier ? (
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">
              {viewAsTier ? `View: ${activeLabel}` : 'View as…'}
            </span>
            <ChevronDown className="hidden sm:inline h-3 w-3 opacity-70" />
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
