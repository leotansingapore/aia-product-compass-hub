import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const tab =
  "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors";
const active = "border-primary text-foreground";

export default function AdminLayout() {
  return (
    <div className="space-y-4" data-testid="admin-layout-page">
      <nav className="flex gap-1 border-b" aria-label="Admin sections">
        <NavLink to="roster" className={({ isActive }) => cn(tab, isActive && active)}>
          Roster
        </NavLink>
        <NavLink to="heatmap" className={({ isActive }) => cn(tab, isActive && active)}>
          Heatmap
        </NavLink>
        <NavLink to="submissions" className={({ isActive }) => cn(tab, isActive && active)}>
          Submissions
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
