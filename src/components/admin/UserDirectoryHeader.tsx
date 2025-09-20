import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserDirectoryHeaderProps {
  onCreateUser: () => void;
}

export function UserDirectoryHeader({ onCreateUser }: UserDirectoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">User Directory</h2>
        <p className="text-muted-foreground">
          Manage all users from registration to activation in one place
        </p>
      </div>
      <Button onClick={onCreateUser} className="gap-2">
        <Plus className="h-4 w-4" />
        Create User
      </Button>
    </div>
  );
}