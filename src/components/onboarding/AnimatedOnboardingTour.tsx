import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Compass,
  GraduationCap,
  BookOpen,
  Mic,
  Bot,
  Trophy,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Flame,
  Star,
  Play,
  MessageSquare,
  Heart,
  Shield,
  TrendingUp,
  Stethoscope,
  Gift,
  Award,
  Pause,
} from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  icon: typeof Sparkles;
  bg: string;
  accent: string;
  visual: ReactNode;
};

const AUTO_ADVANCE_MS = 9000;

export {
  hasSeenAnimatedTour,
  markAnimatedTourSeen,
  clearAnimatedTourSeen,
} from "./tourStorage";
import { markAnimatedTourSeen } from "./tourStorage";

interface AnimatedOnboardingTourProps {
  open: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export function AnimatedOnboardingTour({ open, onClose, onFinish }: AnimatedOnboardingTourProps) {
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const userName = useMemo(() => {
    const raw = user?.email?.split("@")[0] ?? "there";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user?.email]);

  const slides: Slide[] = useMemo(
    () => [
      {
        id: "welcome",
        eyebrow: "FINternship Learning Platform",
        title: (
          <>
            Welcome,{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </>
        ),
        subtitle:
          "This is your complete training cockpit. In 60 seconds, we'll show you everything waiting for you.",
        icon: Sparkles,
        bg: "from-[#1a1150] via-[#2a1065] to-[#4c1d95]",
        accent: "from-fuchsia-500 to-violet-500",
        visual: <WelcomeVisual />,
      },
      {
        id: "journey",
        eyebrow: "Your Learning Journey",
        title: (
          <>
            A <span className="text-emerald-300">guided path</span> from day 1 to certified
          </>
        ),
        subtitle:
          "First 14 days, first 30 days, first 60 days — each unlocks day-by-day so you never feel lost.",
        icon: Compass,
        bg: "from-[#022c22] via-[#064e3b] to-[#047857]",
        accent: "from-emerald-400 to-teal-400",
        visual: <JourneyVisual />,
      },
      {
        id: "products",
        eyebrow: "Product Knowledge",
        title: (
          <>
            Every product, <span className="text-sky-300">organised and explained</span>
          </>
        ),
        subtitle:
          "Investment, Endowment, Whole Life, Term, and Medical — deep-dive pages, videos, and use cases.",
        icon: BookOpen,
        bg: "from-[#082f49] via-[#0c4a6e] to-[#0369a1]",
        accent: "from-sky-400 to-cyan-400",
        visual: <ProductsVisual />,
      },
      {
        id: "cmfas",
        eyebrow: "CMFAS Exam Prep",
        title: (
          <>
            Pass <span className="text-amber-300">M9, M9A, HI, RES5</span> with confidence
          </>
        ),
        subtitle:
          "Bite-sized video modules, module-specific AI tutor, and a question bank that tracks every attempt.",
        icon: GraduationCap,
        bg: "from-[#422006] via-[#713f12] to-[#a16207]",
        accent: "from-amber-400 to-yellow-400",
        visual: <CmfasVisual />,
      },
      {
        id: "roleplay",
        eyebrow: "AI Roleplay",
        title: (
          <>
            Practice sales pitches with a <span className="text-rose-300">real AI avatar</span>
          </>
        ),
        subtitle:
          "Four scenarios from beginner to advanced. Video, voice, and a full scorecard after every session.",
        icon: Mic,
        bg: "from-[#4c0519] via-[#881337] to-[#be123c]",
        accent: "from-rose-400 to-pink-400",
        visual: <RoleplayVisual />,
      },
      {
        id: "assistant",
        eyebrow: "AI Assistant",
        title: (
          <>
            An <span className="text-indigo-300">expert co-pilot</span> on every product page
          </>
        ),
        subtitle:
          "Ask anything — features, objections, comparisons, scripts. Threaded, contextual, always on.",
        icon: Bot,
        bg: "from-[#1e1b4b] via-[#312e81] to-[#4338ca]",
        accent: "from-indigo-400 to-blue-400",
        visual: <AssistantVisual />,
      },
      {
        id: "progress",
        eyebrow: "XP, Streaks & Achievements",
        title: (
          <>
            Level up as you <span className="text-orange-300">actually learn</span>
          </>
        ),
        subtitle:
          "Earn XP on every quiz, unlock badges, keep your streak alive. Your progress is always visible.",
        icon: Trophy,
        bg: "from-[#431407] via-[#7c2d12] to-[#c2410c]",
        accent: "from-orange-400 to-red-400",
        visual: <ProgressVisual />,
      },
      {
        id: "ready",
        eyebrow: "You're set",
        title: (
          <>
            Ready to <span className="bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">start learning?</span>
          </>
        ),
        subtitle:
          "Jump straight into your track, or explore on your own. You can replay this tour anytime from your account.",
        icon: Rocket,
        bg: "from-[#022c22] via-[#064e3b] to-[#065f46]",
        accent: "from-lime-400 to-emerald-400",
        visual: <ReadyVisual />,
      },
    ],
    [userName]
  );

  const total = slides.length;
  const slide = slides[index];
  const isLast = index === total - 1;

  const finish = useCallback(() => {
    markAnimatedTourSeen(user?.id);
    onFinish?.();
    onClose();
  }, [user?.id, onClose, onFinish]);

  const next = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setDirection(1);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [isLast, finish, total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const jump = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, next, prev, finish]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    if (paused || isLast) return;
    const startedAt = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const pct = Math.min(1, elapsed / AUTO_ADVANCE_MS);
      setProgress(pct);
      if (pct >= 1) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, index, paused, isLast, next]);

  if (!open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Animated onboarding tour"
      className="fixed inset-0 z-[9999] overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{TOUR_KEYFRAMES}</style>

      {/* Top auto-advance progress bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-white/80 to-white transition-[width]"
          style={{
            width: `${progress * 100}%`,
            transitionDuration: progress === 0 ? "0ms" : "120ms",
          }}
        />
      </div>

      {/* Horizontal camera track containing all slides */}
      <div
        className="flex h-full transition-transform duration-[1100ms] will-change-transform motion-reduce:duration-300"
        style={{
          width: `${total * 100}%`,
          transform: `translate3d(-${(index * 100) / total}%, 0, 0)`,
          transitionTimingFunction: "cubic-bezier(0.77, 0, 0.175, 1)",
        }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <section
              key={s.id}
              aria-hidden={!active}
              style={{ width: `${100 / total}%` }}
              className={cn(
                "relative h-full shrink-0 overflow-hidden bg-gradient-to-br",
                s.bg
              )}
            >
              {/* Ambient blobs */}
              <div className="absolute inset-0 opacity-60" aria-hidden>
                <div
                  className="absolute -top-40 -left-40 h-[42rem] w-[42rem] rounded-full bg-white/10 blur-3xl animate-tour-blob"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <div
                  className="absolute -bottom-40 -right-40 h-[38rem] w-[38rem] rounded-full bg-white/10 blur-3xl animate-tour-blob-slow"
                  style={{ animationDelay: `${1.5 + i * 0.3}s` }}
                />
                <div
                  className="absolute top-1/3 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl animate-tour-blob"
                  style={{ animationDelay: `${0.7 + i * 0.3}s` }}
                />
              </div>

              {/* Dot grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                aria-hidden
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Parallax floating text + visual */}
              <div className="relative z-10 flex h-full flex-col overflow-y-auto px-4 pb-32 sm:px-6 md:px-16 md:pb-0">
                <div className="flex items-center gap-3 pt-4 sm:pt-5 md:pt-8">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                      s.accent,
                      active && "animate-tour-rise"
                    )}
                  >
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-xs",
                      active && "animate-tour-rise"
                    )}
                  >
                    {s.eyebrow}
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-start justify-center gap-6 py-6 md:flex-row md:items-center md:gap-16 md:py-10">
                  <div
                    className={cn(
                      "w-full max-w-xl transition-all duration-[900ms]",
                      active
                        ? "translate-x-0 opacity-100 blur-0"
                        : direction === 1
                        ? "-translate-x-6 opacity-0 blur-sm"
                        : "translate-x-6 opacity-0 blur-sm"
                    )}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    <h1 className="text-[clamp(1.75rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-tight lg:text-7xl">
                      {s.title}
                    </h1>
                    <p className="mt-4 max-w-lg text-sm text-white/75 sm:text-base md:mt-6 md:text-lg">
                      {s.subtitle}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "relative w-full max-w-xl transition-all duration-[900ms]",
                      active
                        ? "translate-x-0 scale-100 opacity-100 blur-0"
                        : direction === 1
                        ? "translate-x-8 scale-95 opacity-0 blur-sm"
                        : "-translate-x-8 scale-95 opacity-0 blur-sm"
                    )}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    {s.visual}
                  </div>
                </div>
              </div>

            </section>
          );
        })}
      </div>

      {/* Fixed top-right skip */}
      <div className="absolute right-6 top-5 z-40 md:right-12 md:top-6">
        <button
          onClick={finish}
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/20"
        >
          {paused ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <span className="hidden sm:inline">Skip tour</span>
          )}
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Fixed bottom controls */}
      <div
        className="absolute inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 backdrop-blur-sm sm:px-6 md:flex-row md:items-center md:justify-between md:border-0 md:bg-none md:px-12 md:pb-10 md:pt-0 md:backdrop-blur-none"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {slides.map((s, i) => {
            const done = i < index;
            const active = i === index;
            return (
              <button
                key={s.id}
                onClick={() => jump(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  active
                    ? "w-8 bg-white sm:w-10"
                    : done
                    ? "w-4 bg-white/70 sm:w-6"
                    : "w-4 bg-white/20 hover:bg-white/40 sm:w-6"
                )}
              />
            );
          })}
          <span className="ml-2 text-[10px] text-white/60 sm:ml-3 sm:text-xs">
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={index === 0}
            className="text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {isLast ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  markAnimatedTourSeen(user?.id);
                  onClose();
                  navigate("/learning-track");
                }}
                className="border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <span className="hidden sm:inline">Open my track</span>
                <span className="sm:hidden">My track</span>
              </Button>
              <Button
                size="sm"
                onClick={finish}
                className="bg-white text-slate-900 hover:bg-white/90"
              >
                <span className="hidden sm:inline">Start exploring</span>
                <span className="sm:hidden">Start</span>
                <Rocket className="ml-1.5 h-4 w-4 sm:ml-2" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={next}
              className="bg-white text-slate-900 hover:bg-white/90"
            >
              Next
              <ArrowRight className="ml-1.5 h-4 w-4 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

const TOUR_KEYFRAMES = `
@keyframes tour-blob {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(40px,-30px) scale(1.08); }
  66% { transform: translate(-30px,40px) scale(0.94); }
}
@keyframes tour-blob-slow {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-40px,30px) scale(1.12); }
}
@keyframes tour-in-left {
  0% { opacity: 0; transform: translate3d(-24px,0,0); filter: blur(6px); }
  100% { opacity: 1; transform: translate3d(0,0,0); filter: blur(0); }
}
@keyframes tour-in-right {
  0% { opacity: 0; transform: translate3d(24px,0,0); filter: blur(6px); }
  100% { opacity: 1; transform: translate3d(0,0,0); filter: blur(0); }
}
@keyframes tour-rise {
  0% { opacity: 0; transform: translate3d(0,16px,0); }
  100% { opacity: 1; transform: translate3d(0,0,0); }
}
@keyframes tour-pulse-ring {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes tour-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes tour-bar-fill {
  0% { width: 0%; }
  100% { width: var(--fill, 72%); }
}
@keyframes tour-spin-slow {
  to { transform: rotate(360deg); }
}
@keyframes tour-type {
  0%, 8% { opacity: 0; transform: translateY(6px); }
  18%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes tour-badge-pop {
  0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  60% { transform: scale(1.1) rotate(4deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes tour-shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
.animate-tour-blob { animation: tour-blob 12s ease-in-out infinite; }
.animate-tour-blob-slow { animation: tour-blob-slow 16s ease-in-out infinite; }
.animate-tour-in-left { animation: tour-in-left 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.animate-tour-in-right { animation: tour-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.animate-tour-rise { animation: tour-rise 0.6s cubic-bezier(0.22,1,0.36,1) both; }
.animate-tour-pulse-ring { animation: tour-pulse-ring 2.2s ease-out infinite; }
.animate-tour-float { animation: tour-float 4s ease-in-out infinite; }
.animate-tour-bar { animation: tour-bar-fill 1.4s cubic-bezier(0.22,1,0.36,1) both; }
.animate-tour-spin-slow { animation: tour-spin-slow 20s linear infinite; }
.animate-tour-type { animation: tour-type 0.9s ease-out both; }
.animate-tour-badge { animation: tour-badge-pop 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.animate-tour-shimmer { animation: tour-shimmer 2.2s linear infinite; }
`;

function WelcomeVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <div className="absolute inset-0 rounded-full border border-white/20 animate-tour-spin-slow" />
      <div
        className="absolute inset-8 rounded-full border border-white/15 animate-tour-spin-slow"
        style={{ animationDirection: "reverse", animationDuration: "28s" }}
      />
      <div className="absolute inset-16 rounded-full border border-white/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-500 blur-2xl opacity-70" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-500 shadow-2xl">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      {[
        { icon: BookOpen, pos: "top-4 left-10", delay: "0.1s" },
        { icon: Mic, pos: "top-10 right-4", delay: "0.3s" },
        { icon: Bot, pos: "bottom-10 right-10", delay: "0.5s" },
        { icon: Trophy, pos: "bottom-4 left-16", delay: "0.7s" },
      ].map(({ icon: Icon, pos, delay }, i) => (
        <div
          key={i}
          className={cn("absolute animate-tour-float", pos)}
          style={{ animationDelay: delay }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneyVisual() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  return (
    <div className="space-y-5">
      {[
        { label: "First 14 Days", sub: "Explorer onboarding", tone: "bg-emerald-400" },
        { label: "First 30 Days", sub: "Post-RNF launch", tone: "bg-teal-400" },
        { label: "First 60 Days", sub: "Pre-RNF mastery", tone: "bg-cyan-400" },
      ].map((track, trackIdx) => (
        <div
          key={track.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur animate-tour-rise"
          style={{ animationDelay: `${0.15 + trackIdx * 0.12}s` }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{track.label}</div>
              <div className="text-xs text-white/60">{track.sub}</div>
            </div>
            <div className={cn("h-2 w-2 rounded-full", track.tone)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {days.slice(0, 14 - trackIdx * 2).map((d, i) => {
              const unlocked = i < 6 - trackIdx;
              const current = i === 6 - trackIdx;
              return (
                <div
                  key={d}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold transition",
                    unlocked
                      ? "bg-white text-slate-900"
                      : current
                      ? "bg-white/80 text-slate-900 ring-2 ring-white"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {unlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : d}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsVisual() {
  const cats = [
    { name: "Investment", icon: TrendingUp, color: "from-sky-400 to-cyan-400" },
    { name: "Endowment", icon: Gift, color: "from-blue-400 to-indigo-400" },
    { name: "Whole Life", icon: Heart, color: "from-rose-400 to-pink-400" },
    { name: "Term", icon: Shield, color: "from-emerald-400 to-teal-400" },
    { name: "Medical", icon: Stethoscope, color: "from-amber-400 to-orange-400" },
    { name: "AI Assistant", icon: Bot, color: "from-violet-400 to-purple-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cats.map((c, i) => (
        <div
          key={c.name}
          className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur animate-tour-rise hover:border-white/40"
          style={{ animationDelay: `${0.1 + i * 0.08}s` }}
        >
          <div
            className={cn(
              "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
              c.color
            )}
          >
            <c.icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-sm font-semibold">{c.name}</div>
          <div className="mt-1 text-xs text-white/60">Videos · Scripts · AI</div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

function CmfasVisual() {
  return (
    <div className="space-y-4">
      <div
        className="overflow-hidden rounded-2xl border border-white/15 bg-black/30 backdrop-blur animate-tour-rise"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative aspect-video bg-gradient-to-br from-amber-500/30 to-orange-500/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/30 animate-tour-pulse-ring" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl">
                <Play className="ml-1 h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/50 px-3 py-2 text-xs backdrop-blur">
            <div className="font-semibold">Module 9A · Investment Products</div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-amber-300 animate-tour-bar"
                style={{ ["--fill" as any]: "62%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "M9 Rules & Ethics", pct: "88%" },
          { label: "M9A Investment", pct: "62%" },
          { label: "Health Insurance", pct: "34%" },
          { label: "RES5 Property", pct: "12%" },
        ].map((m, i) => (
          <div
            key={m.label}
            className="rounded-xl border border-white/10 bg-white/5 p-3 animate-tour-rise"
            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
          >
            <div className="text-xs font-medium">{m.label}</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 animate-tour-bar"
                style={{ ["--fill" as any]: m.pct, animationDelay: `${0.4 + i * 0.1}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleplayVisual() {
  const messages = [
    { who: "client", text: "I'm worried about locking my money away for 20 years..." },
    { who: "you", text: "That's a fair concern. Let me show you the flexibility built in." },
    { who: "client", text: "What if I need it in an emergency?" },
    { who: "you", text: "You can access the surrender value anytime after year 3." },
  ];
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur animate-tour-rise"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
            AI
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Scenario · Intermediate</div>
          <div className="text-xs text-white/60">First-time investor, age 32</div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-rose-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          LIVE
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm animate-tour-type",
              m.who === "client"
                ? "bg-white/10 border border-white/15 backdrop-blur"
                : "ml-auto bg-gradient-to-br from-rose-400 to-pink-500 text-white"
            )}
            style={{ animationDelay: `${0.3 + i * 0.25}s` }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-3 gap-2 animate-tour-rise"
        style={{ animationDelay: "1.5s" }}
      >
        {[
          { k: "Rapport", v: "8.4" },
          { k: "Clarity", v: "7.9" },
          { k: "Close", v: "6.7" },
        ].map((s) => (
          <div
            key={s.k}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
          >
            <div className="text-[10px] uppercase tracking-wider text-white/60">
              {s.k}
            </div>
            <div className="mt-1 text-xl font-bold text-rose-200">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssistantVisual() {
  const chats = [
    { who: "me", text: "Compare ProAchiever vs Platinum Wealth Venture" },
    {
      who: "ai",
      text: "ProAchiever locks in guaranteed returns from year 5. Platinum Wealth Venture offers investment-linked upside but no floor. Here's a side-by-side...",
    },
  ];
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur animate-tour-rise"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">Product AI Assistant</div>
          <div className="text-xs text-white/60">Context: ProAchiever 2030</div>
        </div>
      </div>

      {chats.map((c, i) => (
        <div
          key={i}
          className={cn(
            "rounded-2xl px-4 py-3 text-sm animate-tour-type",
            c.who === "me"
              ? "ml-auto max-w-[80%] bg-gradient-to-br from-indigo-400 to-blue-500 text-white"
              : "max-w-[90%] border border-white/15 bg-white/10 backdrop-blur"
          )}
          style={{ animationDelay: `${0.3 + i * 0.35}s` }}
        >
          {c.text}
        </div>
      ))}

      <div
        className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur animate-tour-rise"
        style={{ animationDelay: "1.2s" }}
      >
        <MessageSquare className="h-4 w-4 text-white/60" />
        <div className="flex-1 text-sm text-white/50">Ask anything about this product...</div>
        <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 p-2">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}

function ProgressVisual() {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur animate-tour-rise"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Advisor level
            </div>
            <div className="text-2xl font-bold">Level 7 · Rising Star</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1.5 text-sm font-bold text-orange-200">
            <Flame className="h-4 w-4" />
            12
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between text-xs text-white/70">
          <span>2,840 XP</span>
          <span>3,500 XP</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 animate-tour-bar"
            style={{ ["--fill" as any]: "81%" }}
          >
            <div className="absolute inset-0 animate-tour-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:40%_100%]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Star, label: "First Quiz", color: "from-yellow-400 to-amber-500" },
          { icon: Award, label: "M9 Pass", color: "from-sky-400 to-blue-500" },
          { icon: Flame, label: "7-day", color: "from-rose-400 to-pink-500" },
          { icon: Trophy, label: "Top 10", color: "from-violet-400 to-purple-500" },
        ].map((b, i) => (
          <div
            key={b.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 animate-tour-badge"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-lg",
                b.color
              )}
            >
              <b.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-[10px] font-medium text-white/80">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadyVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-tour-pulse-ring rounded-full bg-lime-300/30" />
          <div
            className="absolute inset-0 animate-tour-pulse-ring rounded-full bg-emerald-300/30"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-0 animate-tour-pulse-ring rounded-full bg-white/20"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-emerald-400 shadow-2xl">
            <Rocket className="h-14 w-14 text-emerald-900" />
          </div>
        </div>
      </div>

      {[
        { label: "Track unlocked", pos: "top-0 left-0", delay: "0.2s" },
        { label: "AI tutor ready", pos: "top-8 right-0", delay: "0.4s" },
        { label: "Roleplay live", pos: "bottom-8 left-0", delay: "0.6s" },
        { label: "XP engaged", pos: "bottom-0 right-4", delay: "0.8s" },
      ].map((c, i) => (
        <div
          key={i}
          className={cn(
            "absolute flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur animate-tour-rise",
            c.pos
          )}
          style={{ animationDelay: c.delay }}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-lime-300" />
          {c.label}
        </div>
      ))}
    </div>
  );
}
