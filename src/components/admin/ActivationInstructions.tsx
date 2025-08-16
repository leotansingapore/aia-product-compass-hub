import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ActivationInstructions() {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>How the approval process works:</strong>
        <br />
        1. Users submit registration requests with their details
        <br />
        2. You approve users here in the admin panel
        <br />
        3. Approved users can then attempt to login with ANY password
        <br />
        4. On their first login attempt, a secure temporary password is generated
        <br />
        5. They'll be prompted to set a new password for security
      </AlertDescription>
    </Alert>
  );
}