import React from 'react';
import { NavigableUserPreview } from './NavigableUserPreview';

interface User {
  id: string;
  email?: string;
  roles?: string[];
}

interface Section {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  user_id: string;
  section_id: string;
  permission_type: string;
  lock_message?: string;
}

interface UserInterfacePreviewProps {
  selectedUser: User | null;
  sections: Section[];
  permissions: UserPermission[];
  onPermissionUpdate: () => void;
}

export function UserInterfacePreview({ 
  selectedUser, 
  sections, 
  permissions, 
  onPermissionUpdate 
}: UserInterfacePreviewProps) {
  return (
    <NavigableUserPreview
      selectedUser={selectedUser}
      sections={sections}
      permissions={permissions}
      onPermissionUpdate={onPermissionUpdate}
    />
  );
}