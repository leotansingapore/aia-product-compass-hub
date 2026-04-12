

## Plan: Consolidate Sales Playbooks into a single nav entry with last-visited memory

### What changes

The sidebar and mobile drawer currently show two buttons under "Sales Playbooks": one for "Sales Playbooks" and one for "Concept Cards". The user wants just the group label "Sales Playbooks" to act as a single clickable link that navigates to the last visited sub-page (sales tools, scripts, servicing, objections, playbooks, flows, or concept cards).

### Implementation

1. **Add last-visited persistence** — Store the last visited sales playbook sub-route in `localStorage` (key: `sales-playbooks-last-route`, default: `/scripts`). Update it in `ScriptsTabBar.tsx` whenever a tab is clicked.

2. **AppSidebar.tsx** — Remove the "Concept Cards" entry from `allResourceItems`. Replace the `SidebarGroup` that renders both "Sales Playbooks" and "Concept Cards" buttons (lines 482-499) with a single clickable group label that reads `localStorage` for the last route and navigates there. The active highlight logic already covers all sub-routes.

3. **MobileDrawer.tsx** — Remove "Concept Cards" from `resourceItems`. Update the "Sales Playbooks" `href` to use the last-visited route from localStorage.

4. **Fix build error** — The `analyze-pitch-video` edge function has an unrelated import error for `@react-email/render`. Will remove or fix the problematic import.

### Files touched
- `src/components/scripts/ScriptsTabBar.tsx` — save last route to localStorage on tab click
- `src/components/layout/AppSidebar.tsx` — single Sales Playbooks link using last-visited route
- `src/components/layout/MobileDrawer.tsx` — same consolidation
- `supabase/functions/analyze-pitch-video/index.ts` — fix import error

