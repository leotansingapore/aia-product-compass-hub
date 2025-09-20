import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = "py-12" 
}: EmptyStateProps) {
  return (
    <div className={`text-center text-muted-foreground border rounded-lg bg-muted/20 ${className}`}>
      <div className="mx-auto mb-4 opacity-40">
        {icon}
      </div>
      <p className="text-lg font-medium mb-2">{title}</p>
      <p className="text-sm mb-4">{description}</p>
      {action && action}
    </div>
  );
}