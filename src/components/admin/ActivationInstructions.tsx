import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ActivationInstructions() {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>How the approval process works:</strong>
        <br />
        1. Users submit registration requests with their email, name, and password
        <br />
        2. You approve users here in the admin panel
        <br />
        3. Approved users can login with their original signup password
        <br />
        4. Their account gets created automatically on first login attempt
      </AlertDescription>
    </Alert>
  );
}