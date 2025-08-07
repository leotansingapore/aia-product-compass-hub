import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function ClerkAuth() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user) {
      navigate('/');
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome to Knowledge Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignIn 
                fallbackRedirectUrl="/"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden'
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUp 
                fallbackRedirectUrl="/signup-request"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden'
                  }
                }}
              />
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>After signing up, you'll need to request access.</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs"
                  onClick={() => navigate('/signup-request')}
                >
                  Already have an account? Request access here
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}