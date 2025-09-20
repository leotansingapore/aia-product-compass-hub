import { useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { CreateUserForm } from "./CreateUserForm";
import { UserDirectoryHeader } from "./UserDirectoryHeader";
import { UserDirectoryContent } from "./UserDirectoryContent";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserSelection } from "@/hooks/useUserSelection";

export function UnifiedUserDirectory() {
  const { users, loading, filters, setFilters, statusCounts, refetch } = useUserManagement();
  const {
    selectedUsers,
    selectedUserIds,
    handleUserSelect,
    handleSelectAll,
    clearSelection,
    isAllSelected
  } = useUserSelection();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (loading) {
    return <LoadingState message="Loading user directory..." />;
  }

  const handleSelectAllUsers = (checked: boolean) => {
    handleSelectAll(checked, users);
  };

  const handleActionComplete = () => {
    clearSelection();
    refetch();
  };

  return (
    <div className="space-y-6">
      <UserDirectoryHeader onCreateUser={() => setShowCreateForm(true)} />

      {showCreateForm && <CreateUserForm />}

      <UserDirectoryContent
        users={users}
        filters={filters}
        statusCounts={statusCounts}
        selectedUsers={selectedUsers}
        selectedUserIds={selectedUserIds}
        isAllSelected={isAllSelected(users)}
        onFiltersChange={setFilters}
        onRefresh={refetch}
        onUserSelect={handleUserSelect}
        onSelectAll={handleSelectAllUsers}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}