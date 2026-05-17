import { UnifiedUser } from '@/hooks/useUserManagement';

export const getDisplayName = (user: UnifiedUser) => {
  return user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusConfig = (status: UnifiedUser['status']) => {
  const configs = {
    pending_approval: { 
      variant: "secondary" as const, 
      label: "Pending", 
      icon: "AlertTriangle",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    approved: { 
      variant: "default" as const, 
      label: "Approved", 
      icon: "UserCheck",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    active: { 
      variant: "default" as const, 
      label: "Active", 
      icon: "UserCheck",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    suspended: { 
      variant: "destructive" as const, 
      label: "Suspended", 
      icon: "UserX",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    rejected: { 
      variant: "destructive" as const, 
      label: "Rejected", 
      icon: "UserX",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
  };
  
  return configs[status];
};

export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'master_admin': return 'destructive';
    case 'admin': return 'default';
    case 'consultant': return 'secondary';
    default: return 'outline';
  }
};

export const AVAILABLE_STATUSES = ['pending_approval', 'approved', 'active', 'suspended', 'rejected'] as const;
// `mentor` role removed — the Mentor Dashboard feature was deleted in commit
// 8405541c and the role was never wired up anywhere else (no permission
// checks, no UI gates, no edge-function paths). Existing DB rows with role
// 'mentor' still render as a generic outline badge via the default branch
// above, so this change is non-destructive at the data layer.
export const AVAILABLE_ADMIN_ROLES = ['user', 'consultant', 'admin'] as const;
