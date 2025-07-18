import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedSectionProps {
  sectionId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function ProtectedSection({ sectionId, children, fallback, className }: ProtectedSectionProps) {
  const { canAccessSection, isSectionLocked, isSectionReadOnly, getSectionPermission, loading } = usePermissions();

  // If still loading permissions, return null to avoid showing content
  if (loading) {
    return null;
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

  // If section is read-only, add read-only indicator
  if (isSectionReadOnly(sectionId)) {
    return (
      <div className={className}>
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs border border-amber-200">
              <Shield className="h-3 w-3" />
              Read Only
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Normal access - render children
  return <div className={className}>{children}</div>;
}