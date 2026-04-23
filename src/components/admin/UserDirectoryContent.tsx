import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnhancedUserFilters } from "./EnhancedUserFilters";
import { BulkUserActions } from "./BulkUserActions";
import { UserManagementTable } from "./UserManagementTable";
import { UnifiedUser } from "@/hooks/useUserManagement";

interface FilterState {
  search: string;
  status: string;
  role: string;
  tier: string;
  sortBy: 'name' | 'email' | 'created_at' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface StatusCounts {
  all: number;
  pending_approval: number;
  approved: number;
  active: number;
  suspended: number;
  rejected: number;
}

interface UserDirectoryContentProps {
  users: UnifiedUser[];
  filters: FilterState;
  statusCounts: StatusCounts;
  selectedUsers: Set<string>;
  selectedUserIds: string[];
  isAllSelected: boolean;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh: () => void;
  onUserSelect: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onActionComplete: () => void;
}

export function UserDirectoryContent({
  users,
  filters,
  statusCounts,
  selectedUsers,
  selectedUserIds,
  isAllSelected,
  onFiltersChange,
  onRefresh,
  onUserSelect,
  onSelectAll,
  onActionComplete
}: UserDirectoryContentProps) {
  const selectedUserObjects = users.filter(u => selectedUsers.has(u.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Users ({users.length})
        </CardTitle>
        <CardDescription>
          Complete user lifecycle management from registration to activation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Enhanced Filters */}
        <EnhancedUserFilters
          filters={filters}
          statusCounts={statusCounts}
          onFiltersChange={onFiltersChange}
          onRefresh={onRefresh}
        />

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-6">
            <BulkUserActions
              selectedUserIds={selectedUserIds}
              selectedUsers={selectedUserObjects}
              onActionComplete={onActionComplete}
            />
          </div>
        )}

        {/* User Table or Empty State */}
        {users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="No users found"
            description="Try adjusting your search criteria or filters"
          />
        ) : (
          <UserManagementTable
            users={users}
            selectedUsers={selectedUsers}
            onUserSelect={onUserSelect}
            onSelectAll={onSelectAll}
            onUpdate={onRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
}