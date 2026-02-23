

## Homepage Navigation Overhaul

Inspired by the reference app, this plan restructures navigation to make every tap count -- moving the rarely-used Account button out of the bottom bar, adding a quick-access icon grid, and ensuring all major app sections are reachable from the homepage.

---

### 1. Move Profile/Account to the Top-Right Header

The Account button is rarely tapped compared to core features. It will move from the bottom navigation bar into the mobile header as a small avatar/user icon button (top-right), similar to the reference screenshot.

**Changes:**
- **`MobileHeader.tsx`** -- Add a user avatar/icon button (top-right) that navigates to `/my-account`. Show user initials or a `User` icon.
- **`AppLayout.tsx`** -- Pass the account button as `rightAction` to `MobileHeader` for authenticated users (replacing the current empty slot).

---

### 2. Redesign Mobile Bottom Nav with More Useful Tabs

Replace "Account" with a more useful destination. The new bottom nav becomes:

| Tab | Route | Icon |
|-----|-------|------|
| Home | `/` | Home |
| Products | `/kb` | Library |
| Scripts | `/scripts` | FileText |
| Roleplay | `/roleplay` | MessageCircle |
| Quick Links | (opens a sheet/popover with all links) | Link |

The "Quick Links" tab opens a bottom sheet with shortcuts to: Bookmarks, CMFAS Exams, Search by Client, How to Use, Playbooks, Script Flows, Sales Tools.

**Changes:**
- **`MobileBottomNav.tsx`** -- Replace the 5 tabs; add a `QuickLinksSheet` component triggered by the last tab.

---

### 3. Add Quick Shortcut Icon Grid on Homepage

Inspired by the reference's circular icon grid (Leads, NB Cases, etc.), add a prominent icon grid near the top of the dashboard with the most-used features. These are colorful, round icon buttons in a 4-column grid.

Shortcuts:
- Row 1: Products, CMFAS, Scripts, Roleplay
- Row 2: Bookmarks, Search by Client, Playbooks, More (opens sheet)

**Changes:**
- **`QuickActions.tsx` (dashboard)** -- Redesign from rectangular cards to a compact circular icon grid (4 columns), matching the reference's visual style. Each icon gets a colored circle background with a label underneath.

---

### 4. Desktop Top Bar -- Add Profile Avatar

On desktop, add a small avatar/user button next to the Sign Out button in the top header bar for quick access to My Account.

**Changes:**
- **`AppLayout.tsx`** -- Add a clickable avatar/initials button in the desktop header that navigates to `/my-account`.

---

### Summary of Files to Edit

| File | Change |
|------|--------|
| `src/components/layout/MobileBottomNav.tsx` | Replace Account tab with Scripts + Quick Links sheet |
| `src/components/layout/MobileHeader.tsx` | Add user avatar button (top-right) |
| `src/components/layout/AppLayout.tsx` | Pass avatar as rightAction; add desktop avatar |
| `src/components/dashboard/QuickActions.tsx` | Redesign as circular icon grid (4-col, colorful) |

