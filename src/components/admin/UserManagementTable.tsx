import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UnifiedUser } from "@/hooks/useUserManagement";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { ProvisionUserDialog } from "./ProvisionUserDialog";
import { SendEmailDialog } from "./SendEmailDialog";
import { UserTableRow } from "./UserTableRow";

interface UserManagementTableProps {
  users: UnifiedUser[];
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdate: () => void;
}

export function UserManagementTable({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onSelectAll, 
  onUpdate 
}: UserManagementTableProps) {
  const [passwordResetUser, setPasswordResetUser] = useState<UnifiedUser | null>(null);
  const [provisionUser, setProvisionUser] = useState<UnifiedUser | null>(null);
  const [sendEmailUser, setSendEmailUser] = useState<UnifiedUser | null>(null);

  const handleSendEmail = (user: UnifiedUser) => {
    setSendEmailUser(user);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.has(user.id)}
                onSelect={(checked) => onUserSelect(user.id, checked)}
                onUpdate={onUpdate}
                onPasswordReset={setPasswordResetUser}
                onProvision={setProvisionUser}
                onSendEmail={handleSendEmail}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {passwordResetUser && (
        <PasswordResetDialog
          user={passwordResetUser}
          open={true}
          onOpenChange={() => setPasswordResetUser(null)}
          onSuccess={onUpdate}
        />
      )}

      {provisionUser && (
        <ProvisionUserDialog
          user={provisionUser}
          open={true}
          onOpenChange={() => setProvisionUser(null)}
          onSuccess={onUpdate}
        />
      )}

      {sendEmailUser && (
        <SendEmailDialog
          user={sendEmailUser}
          open={true}
          onOpenChange={() => setSendEmailUser(null)}
        />
      )}
    </div>
  );
}