import { Trophy } from "lucide-react";

export function AuthHeader() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-primary p-4 rounded-full">
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Knowledge Portal
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Choose your access level or sign in with your account
      </p>
    </div>
  );
}