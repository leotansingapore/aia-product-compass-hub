import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, MessageSquare } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SimplifiedAuthForm } from "@/components/auth/SimplifiedAuthForm";

const SimplifiedAuth = () => {
  const { user, loading } = useSimplifiedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Helmet>
          <title>Sign In - FINternship Learning Platform</title>
          <meta name="description" content="Sign in to access your learning platform with comprehensive financial product training and resources." />
          <link rel="canonical" href={`${window.location.origin}/auth`} />
        </Helmet>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Helmet>
        <title>Sign In - FINternship Learning Platform</title>
        <meta name="description" content="Sign in to access your learning platform with comprehensive financial product training and resources." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>

      {/* Left Panel: Brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(200_95%_25%)] to-[hsl(220_85%_35%)] relative overflow-hidden p-12 flex-col">
        {/* Background texture circle */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -mr-48 -mb-48 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo and brand */}
          <div>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 mb-6 backdrop-blur">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-white font-bold text-xl tracking-tight">FINternship</h2>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center my-12">
            <h1 className="text-white font-bold text-3xl leading-tight mb-3 font-sans">
              Master the products.
              <br />
              Ace the exams.
              <br />
              Win the client.
            </h1>
            <p className="text-white/70 text-sm">
              Comprehensive training for AIA financial advisors.
            </p>

            {/* Feature list */}
            <div className="space-y-4 mt-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
                  <BookOpen className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <p className="text-white/90 text-sm pt-0.5">Full product knowledge library</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
                  <GraduationCap className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <p className="text-white/90 text-sm pt-0.5">CMFAS M9, M9A, HI & RES5 prep</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
                  <MessageSquare className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <p className="text-white/90 text-sm pt-0.5">AI roleplay coaching sessions</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs">© 2025 AIA Singapore</p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 shadow-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-bold text-foreground">FINternship</h1>
          </div>

          <SimplifiedAuthForm />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAuth;
