import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedSectionProps {
  sectionId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function ProtectedSection({ sectionId, children, fallback, className }: ProtectedSectionProps) {
  const { canAccessSection, isSectionLocked, getSectionPermission, loading } = usePermissions();

  // If still loading permissions, show a loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If section is hidden, don't render anything
  if (!canAccessSection(sectionId)) {
    console.log('Section hidden:', sectionId);
    return null;
  }

  // If section is locked, show lock message
  if (isSectionLocked(sectionId)) {
    const permission = getSectionPermission(sectionId);
    const lockMessage = permission.lock_message || 'This section is locked. Contact your administrator for access.';

    return (
      <div className={className}>
        {fallback || (
          <Card className="border-muted-foreground/20 bg-muted/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5" />
                Section Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{lockMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Normal access - render children
  return <div className={className}>{children}</div>;
}