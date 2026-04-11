import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BarChart3, BrainCircuit, Mail, Waypoints } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SimplifiedAuthForm } from "@/components/auth/SimplifiedAuthForm";

const SUPPORT_EMAIL = "support@aiaproductcompass.com";

/** Marks: white on dark hero; navy PNG used as alpha mask for brand-colored mark on the form column */
const LOGO_WHITE = "/finternship-logo-white.png";
const LOGO_NAVY = "/finternship-logo-navy.png";

/** Translucent low-poly shards — right-weighted light, aligned to brand teal/cyan */
function AuthHeroPolyLayer() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="authPolySheen" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="hsl(200 95% 92%)" stopOpacity="0" />
          <stop offset="55%" stopColor="hsl(195 90% 88%)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="hsl(190 85% 90%)" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <g className="text-white">
        <polygon fill="url(#authPolySheen)" points="48,0 100,0 100,38 62,24" />
        <polygon fill="currentColor" fillOpacity={0.07} points="62,0 100,0 100,52 78,18" />
        <polygon fill="currentColor" fillOpacity={0.11} points="100,12 100,100 68,100 52,48" />
        <polygon fill="hsl(190 80% 96%)" fillOpacity={0.06} points="72,32 100,58 100,100 58,72" />
        <polygon fill="currentColor" fillOpacity={0.05} points="45,40 78,52 58,88 32,62" />
        <polygon fill="hsl(200 95% 98%)" fillOpacity={0.08} points="100,0 100,28 88,8" />
      </g>
    </svg>
  );
}

const SimplifiedAuth = () => {
  const { user, loading } = useSimplifiedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <Helmet>
        <title>Sign In - FINternship Learning Platform</title>
        <meta name="description" content="Sign in to access your learning platform with comprehensive financial product training and resources." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>

      {/* Left: brand gradient + low-poly (design system primary / hero tokens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col lg:min-h-screen self-stretch">
        <div
          className="absolute inset-0 min-h-[100svh] lg:min-h-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 100% 45%, hsl(var(--primary-glow) / 0.35), transparent 55%),
              radial-gradient(ellipse 60% 50% at 20% 80%, hsl(var(--primary) / 0.25), transparent 50%),
              var(--gradient-hero)
            `,
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[hsl(210_45%_8%)]/90 via-[hsl(var(--primary)_/_0.88)] to-[hsl(220_50%_18%)]"
          aria-hidden
        />
        <AuthHeroPolyLayer />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(210_50%_6%)_0%,transparent_42%)] opacity-80"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col flex-1 min-h-screen px-12 xl:px-16 py-10 xl:py-14 text-white">
          <header className="inline-flex items-center gap-0" aria-label="FINternship">
            <img
              src={LOGO_WHITE}
              alt=""
              width={44}
              height={44}
              decoding="async"
              className="h-11 w-11 shrink-0 object-contain object-left drop-shadow-sm -mr-2.5 sm:-mr-3"
            />
            <span className="text-lg font-bold tracking-tight text-white leading-none -ml-1">
              INternship
            </span>
          </header>

          <div className="flex-1 flex flex-col justify-center max-w-lg py-10">
            <h1 className="text-3xl xl:text-[2.35rem] font-bold leading-[1.12] tracking-tight text-white">
              Master Your Future.
            </h1>
            <p className="mt-5 text-base xl:text-lg leading-relaxed text-white/85 max-w-prose">
              The definitive training ecosystem for AIA Singapore financial advisors—bringing product depth, regulatory
              rigour, and client conversations together in one place. Stay exam-ready and conversation-ready, whether
              you&apos;re at your desk or on the move.
            </p>
          </div>

          <div className="mt-auto pt-4">
            <div className="grid grid-cols-3 gap-6 xl:gap-8 max-w-md">
              <div className="flex flex-col items-start gap-2.5">
                <Waypoints className="h-7 w-7 text-white/95 shrink-0" strokeWidth={1.15} aria-hidden />
                <span className="text-xs font-medium leading-snug text-white/80 tracking-wide uppercase">
                  Curated Paths
                </span>
              </div>
              <div className="flex flex-col items-start gap-2.5">
                <BrainCircuit className="h-7 w-7 text-white/95 shrink-0" strokeWidth={1.15} aria-hidden />
                <span className="text-xs font-medium leading-snug text-white/80 tracking-wide uppercase">
                  AI Coaching
                </span>
              </div>
              <div className="flex flex-col items-start gap-2.5">
                <BarChart3 className="h-7 w-7 text-white/95 shrink-0" strokeWidth={1.15} aria-hidden />
                <span className="text-xs font-medium leading-snug text-white/80 tracking-wide uppercase">
                  Sales Insights
                </span>
              </div>
            </div>
            <p className="mt-8 pt-6 border-t border-white/15 text-xs text-white/45">© {new Date().getFullYear()} AIA Singapore</p>
          </div>
        </div>
      </div>

      {/* Right: form column */}
      <div className="flex-1 lg:w-1/2 flex flex-col lg:min-h-screen bg-white">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 xl:px-16 py-10 w-full max-w-md mx-auto lg:max-w-lg">
          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-0">
              <div
                role="img"
                aria-hidden
                className="h-14 w-14 shrink-0 -mr-2.5 sm:-mr-3 bg-primary"
                style={{
                  maskImage: `url(${LOGO_NAVY})`,
                  WebkitMaskImage: `url(${LOGO_NAVY})`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "left center",
                  WebkitMaskPosition: "left center",
                }}
              />
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight leading-none -ml-1"
                aria-label="FINternship"
              >
                <span className="text-primary">IN</span>
                <span className="text-foreground">ternship</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to your advisor learning dashboard—products, CMFAS, scripts, and practice tools.
            </p>
          </div>

          <SimplifiedAuthForm hideTitle />
        </div>

        <div className="px-6 sm:px-10 xl:px-16 pb-8 pt-2 w-full max-w-md mx-auto lg:max-w-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground border-t border-border pt-6">
            <span>© {new Date().getFullYear()} AIA Singapore</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-2 font-medium"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAuth;
