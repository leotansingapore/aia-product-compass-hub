import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { QuickLoginButtons } from "@/components/auth/QuickLoginButtons";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { AuthHeader } from "@/components/auth/AuthHeader";

const Auth = () => {
  const { loading, signIn, signUp, resetPassword, demoSignIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <PageLayout
      title="Sign In - Access Your Learning Platform | FINternship"
      description="Sign in to FINternship Learning Platform. Track progress, earn achievements, access comprehensive financial product training, and enhance your advisory skills with AI assistance."
      keywords="sign in, login, financial advisor platform, learning platform, training portal, financial education"
      openGraph={{
        title: "Sign In - Access Your Learning Platform | FINternship",
        description: "Join thousands of financial advisors enhancing their skills with comprehensive product training and AI assistance.",
        type: "website",
        image: "/og-default.jpg"
      }}
      className="min-h-screen bg-background flex items-center justify-center px-1 sm:px-4 py-4"
    >
      <div className="w-full max-w-lg space-y-4 sm:space-y-6">
        <AuthHeader />

        <QuickLoginButtons onDemoLogin={demoSignIn} loading={loading} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <AuthTabs
          onSignIn={signIn}
          onSignUp={signUp}
          onResetPassword={resetPassword}
          loading={loading}
        />

        <div className="text-center text-xs text-muted-foreground px-4">
          <p>
            New users need admin approval before accessing the platform.
            Demo accounts provide instant access for testing.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;