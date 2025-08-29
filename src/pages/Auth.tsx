import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Trophy } from "lucide-react";
import { AuthService } from "@/services/authService";
import { useSimpleAuthOperations } from "@/hooks/useSimpleAuthOperations";
import { QuickLoginButtons } from "@/components/auth/QuickLoginButtons";
import { AuthTabs } from "@/components/auth/AuthTabs";

const Auth = () => {
  const { loading, signIn, signUp, resetPassword, demoSignIn } = useSimpleAuthOperations();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const isLoggedIn = await AuthService.checkSession();
      if (isLoggedIn) {
        // Force redirect to avoid any caching issues
        window.location.replace('/');
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-1 sm:px-4 py-4">
      <Helmet>
        <title>Sign In - Access Your Learning Platform | FINternship</title>
        <meta name="description" content="Sign in to FINternship Learning Platform. Track progress, earn achievements, access comprehensive financial product training, and enhance your advisory skills with AI assistance." />
        <meta name="keywords" content="sign in, login, financial advisor platform, learning platform, training portal, financial education" />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sign In - Access Your Learning Platform | FINternship" />
        <meta property="og:description" content="Join thousands of financial advisors enhancing their skills with comprehensive product training and AI assistance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign In - Access Your Learning Platform | FINternship" />
        <meta name="twitter:description" content="Join thousands of financial advisors enhancing their skills with comprehensive product training." />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Sign In - FINternship Learning Platform",
            "description": "Sign in to access comprehensive financial advisory training and education resources",
            "url": `${window.location.origin}${window.location.pathname}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "FINternship Learning Platform",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>
      
      <div className="w-full max-w-lg space-y-4 sm:space-y-6">
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
    </div>
  );
};

export default Auth;