import { SignInButton } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AuthPrompt() {
  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">🚀 Unlock Your Learning Journey</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to track your progress, earn achievements, and level up your expertise!
          </p>
          <SignInButton fallbackRedirectUrl="/">
            <Button 
              variant="hero" 
              className="px-8"
            >
              Sign In to Get Started
            </Button>
          </SignInButton>
        </div>
      </CardContent>
    </Card>
  );
}