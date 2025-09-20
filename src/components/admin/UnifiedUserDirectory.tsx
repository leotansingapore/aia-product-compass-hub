import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Loader2 } from "lucide-react";
import { CreateUserForm } from "./CreateUserForm";
import { BulkUserActions } from "./BulkUserActions";
import { UserManagementTable } from "./UserManagementTable";
import { EnhancedUserFilters } from "./EnhancedUserFilters";
import { useUserManagement } from "@/hooks/useUserManagement";

export function UnifiedUserDirectory() {
  const { users, loading, filters, setFilters, statusCounts, refetch } = useUserManagement();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleUserSelect = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Directory</h2>
          <p className="text-muted-foreground">
            Manage all users from registration to activation in one place
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {showCreateForm && (
        <CreateUserForm />
      )}

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
            onFiltersChange={setFilters}
            onRefresh={refetch}
          />

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mb-6">
              <BulkUserActions
                selectedUserIds={Array.from(selectedUsers)}
                selectedUsers={users.filter(u => selectedUsers.has(u.id))}
                onActionComplete={() => {
                  setSelectedUsers(new Set());
                  refetch();
                }}
              />
            </div>
          )}

          {/* User Table */}
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium mb-2">No users found</p>
              <p className="text-sm">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <UserManagementTable
              users={users}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
              onSelectAll={handleSelectAll}
              onUpdate={refetch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}