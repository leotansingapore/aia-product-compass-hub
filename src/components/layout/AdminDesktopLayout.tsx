import React, { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AvatarWithProgress } from "@/components/profile/AvatarWithProgress";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminDesktopLayoutProps {
  children: ReactNode;
  sidebarDefaultOpen: boolean;
  userInitials: string;
  onProfileClick: () => void;
}

function AdminDesktopLayoutImpl({
  children,
  sidebarDefaultOpen,
  userInitials,
  onProfileClick,
}: AdminDesktopLayoutProps) {
  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="min-h-screen flex w-full">
        <AppSidebar onProfileClick={onProfileClick} />
        <ResizeHandle />

        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <ThemeToggle />
            <button
              onClick={onProfileClick}
              className="rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="My Profile"
            >
              <AvatarWithProgress size={32} initials={userInitials} />
            </button>
          </header>

          <main className="min-h-0 flex-1 page-transition">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export const AdminDesktopLayout = memo(AdminDesktopLayoutImpl);
export default AdminDesktopLayout;

/** Drag handle that sits on the right edge of the sidebar */
const ResizeHandle = memo(function ResizeHandle() {
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { state, toggleSidebar, setOpen } = useSidebar();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      hasDragged.current = false;
      isDragging.current = true;
      setActive(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        hasDragged.current = true;
        const collapsed = stateRef.current === "collapsed";
        const x = ev.clientX;

        if (collapsed) {
          if (x > 160) {
            setOpen(true);
            const clamped = Math.min(480, Math.max(180, x));
            document.documentElement.style.setProperty("--sidebar-width", `${clamped}px`);
          }
          return;
        }

        if (x < 140) {
          setOpen(false);
          return;
        }

        const clamped = Math.min(480, Math.max(180, x));
        document.documentElement.style.setProperty("--sidebar-width", `${clamped}px`);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        setActive(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        const w = document.documentElement.style.getPropertyValue("--sidebar-width");
        if (w) localStorage.setItem("sidebar-width", w);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setOpen]
  );

  const onClick = useCallback(() => {
    if (!hasDragged.current) toggleSidebar();
  }, [toggleSidebar]);

  const isCollapsed = state === "collapsed";

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCollapsed ? "Click or drag right to expand" : "Drag to resize · Click to collapse"}
      className={`
        relative z-20 flex items-center justify-center
        shrink-0 select-none transition-colors duration-150
        w-2 cursor-col-resize
        ${active ? "bg-primary/20" : hovered ? "bg-primary/10" : "bg-transparent"}
      `}
    >
      <div
        className={`
          absolute rounded-full transition-all duration-200
          ${active ? "w-1 h-12 bg-primary" :
            hovered ? "w-1 h-10 bg-primary/60" :
            "w-px h-8 bg-border"}
        `}
      />
    </div>
  );
});
