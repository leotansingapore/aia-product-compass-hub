import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedTab, ProtectedTabTrigger } from "@/components/ProtectedTab";
import { User, Shield, Settings, Users } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  component: ReactNode;
  protected?: boolean;
  condition?: boolean;
}

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabItem[];
}

export function AccountTabs({ activeTab, onTabChange, tabs }: AccountTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6 md:space-y-8">
      {/* Mobile-first tab navigation with larger touch targets */}
      <div className="w-full">
        <div className="flex overflow-x-auto pb-3 scrollbar-hide">
          <TabsList className="flex gap-2 min-w-max px-1 h-auto bg-transparent">
            {tabs.map((tab) => {
              if (tab.condition === false) return null;
              
              const TabTriggerComponent = (
                <TabsTrigger 
                  value={tab.id} 
                  className="flex-shrink-0 min-w-[120px] px-6 py-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span className="font-semibold">{tab.label}</span>
                  </div>
                </TabsTrigger>
              );

              return tab.protected ? (
                <ProtectedTabTrigger key={tab.id} tabId={tab.id}>
                  {TabTriggerComponent}
                </ProtectedTabTrigger>
              ) : (
                <div key={tab.id}>
                  {TabTriggerComponent}
                </div>
              );
            })}
          </TabsList>
        </div>
      </div>

      {/* Tab content with enhanced mobile spacing */}
      {tabs.map((tab) => {
        if (tab.condition === false) return null;
        
        const TabContentComponent = (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-6">
            {tab.component}
          </TabsContent>
        );

        return tab.protected ? (
          <ProtectedTab key={tab.id} tabId={tab.id}>
            {TabContentComponent}
          </ProtectedTab>
        ) : (
          TabContentComponent
        );
      })}
    </Tabs>
  );
}