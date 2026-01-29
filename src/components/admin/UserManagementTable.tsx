import { useState } from "react";
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
import { UserMobileCard } from "./UserMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const handleSendEmail = (user: UnifiedUser) => {
    setSendEmailUser(user);
  };

  return (
    <div className="space-y-4">
      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {/* Select All for Mobile */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={selectedUsers.size === users.length && users.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="cursor-pointer h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">
              Select all ({users.length} users)
            </span>
          </div>
          
          {users.map((user) => (
            <UserMobileCard
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
        </div>
      ) : (
        // Desktop Table Layout with horizontal scroll
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="border rounded-lg">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Role</TableHead>
                    <TableHead>Access Tier</TableHead>
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
          </div>
        </div>
      )}

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