import { useState, useCallback } from 'react';
import { UnifiedUser } from './useUserManagement';

export function useUserSelection() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const handleUserSelect = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(userId);
      } else {
        newSelection.delete(userId);
      }
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean, users: UnifiedUser[]) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const isSelected = useCallback((userId: string) => selectedUsers.has(userId), [selectedUsers]);

  const isAllSelected = useCallback((users: UnifiedUser[]) => 
    selectedUsers.size === users.length && users.length > 0, [selectedUsers]);

  return {
    selectedUsers,
    selectedUserIds: Array.from(selectedUsers),
    handleUserSelect,
    handleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectedCount: selectedUsers.size
  };
}