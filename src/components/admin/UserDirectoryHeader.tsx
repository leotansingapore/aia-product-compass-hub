import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserDirectoryHeaderProps {
  onCreateUser: () => void;
}

export function UserDirectoryHeader({ onCreateUser }: UserDirectoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h2 className="text-2xl font-bold">User Directory</h2>
      <Button onClick={onCreateUser} className="gap-2 w-full sm:w-auto shrink-0">
        <Plus className="h-4 w-4" />
        Create User
      </Button>
    </div>
  );
}