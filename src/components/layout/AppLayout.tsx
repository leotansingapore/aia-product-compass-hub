import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Bar with Sidebar Toggle */}
          <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SidebarTrigger>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}