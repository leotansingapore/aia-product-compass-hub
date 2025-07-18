import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from './ui/card';
import { Lock } from 'lucide-react';

interface ProtectedTabProps {
  tabId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedTab({ tabId, children, fallback }: ProtectedTabProps) {
  const { getTabPermission, canAccessTab, isTabLocked } = usePermissions();
  
  // If tab is hidden, don't render anything
  if (!canAccessTab(tabId)) {
    return fallback || null;
  }

  // If tab is locked, show locked state
  if (isTabLocked(tabId)) {
    const permission = getTabPermission(tabId);
    
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tab Locked</h3>
          <p className="text-muted-foreground">
            {permission.lock_message || 'This tab is currently locked and requires special access.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

interface ProtectedTabTriggerProps {
  tabId: string;
  children: ReactNode;
}

export function ProtectedTabTrigger({ tabId, children }: ProtectedTabTriggerProps) {
  const { canAccessTab } = usePermissions();
  
  // If tab is hidden, don't render the trigger
  if (!canAccessTab(tabId)) {
    return null;
  }

  return <>{children}</>;
}