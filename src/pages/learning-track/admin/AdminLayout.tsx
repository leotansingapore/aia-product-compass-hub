import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const tab =
  "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap";
const active = "border-primary text-foreground";

export default function AdminLayout() {
  return (
    <div className="space-y-4" data-testid="admin-layout-page">
      <div className="relative">
        <nav className="flex gap-1 border-b overflow-x-auto" aria-label="Admin sections">
          <NavLink to="first-14-days" className={({ isActive }) => cn(tab, isActive && active)}>
            First 14 Days
          </NavLink>
          <NavLink to="first-60-days" className={({ isActive }) => cn(tab, isActive && active)}>
            First 60 Days
          </NavLink>
          <NavLink to="assignments" className={({ isActive }) => cn(tab, isActive && active)}>
            Assignments
          </NavLink>
          <NavLink to="question-banks" className={({ isActive }) => cn(tab, isActive && active)}>
            Question Banks
          </NavLink>
          <NavLink to="roleplay" className={({ isActive }) => cn(tab, isActive && active)}>
            Roleplay
          </NavLink>
        </nav>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
        />
      </div>
      <Outlet />
    </div>
  );
}
