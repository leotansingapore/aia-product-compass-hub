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

/**
 * Labels for the "Change Status" menu.
 *
 * Most of these are written to `user_approval_requests.status`, which is a
 * record only — nothing in the sign-in path reads it.
 *
 * "Suspended" is the exception and is now real: it calls the admin-gated
 * `admin-set-user-suspension` edge function, which bans the account in
 * GoTrue (`auth.admin.updateUserById(id, { ban_duration })`) so
 * `signInWithPassword` is refused. Moving a suspended user back to Active or
 * Approved lifts the ban. The displayed status comes from the real ban state,
 * not from the approval-request row — see `useUserManagement`.
 */
export const STATUS_ACTION_LABELS: Record<(typeof AVAILABLE_STATUSES)[number], string> = {
  pending_approval: 'Pending approval',
  approved: 'Approved',
  active: 'Active',
  suspended: 'Suspend access (blocks sign-in)',
  rejected: 'Rejected',
};
// `mentor` role removed — the Mentor Dashboard feature was deleted in commit
// 8405541c and the role was never wired up anywhere else (no permission
// checks, no UI gates, no edge-function paths). Existing DB rows with role
// 'mentor' still render as a generic outline badge via the default branch
// above, so this change is non-destructive at the data layer.
export const AVAILABLE_ADMIN_ROLES = ['user', 'consultant', 'admin'] as const;
