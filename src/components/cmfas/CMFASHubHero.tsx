import {
  useCallback,
  useMemo,
  useRef,
  useState,
  memo,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calculator, GraduationCap, ScrollText, Timer, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/components/layout/BrandedPageHeader";

const CMFAS_GRADIENT = "from-[#422006] via-[#713f12] to-[#a16207]";

export function stripLeadingEmojiTitle(title: string): string {
  const trimmed = title.trim();
  const i = trimmed.search(/[\p{L}\p{N}]/u);
  if (i <= 0) return trimmed;
  return trimmed.slice(i).trimStart();
}

/** Full-bleed study / exam room atmosphere — warm lamp, paper dot grid, soft vignette. */
export function CMFASStudyRoomBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Deep room base + tour-aligned amber wash */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", CMFAS_GRADIENT)} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a08]/40 via-transparent to-[#0a0805]/80" />
      {/* “Desk lamp” pool — top-left, like a study corner */}
      <div
        className="absolute -left-1/4 -top-1/4 h-[85%] w-[70%] rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(251, 191, 36, 0.14) 0%, rgba(120, 53, 15, 0.08) 45%, transparent 70%)",
        }}
      />
      {/* Secondary fill — center-right, exam focus */}
      <div
        className="absolute right-0 top-1/4 h-2/3 w-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245, 158, 11, 0.1) 0%, transparent 65%)",
        }}
      />
      {/* Dot grid (paper / blueprint) */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Fine line grid (subtle) */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 24px 24px",
        }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.45)]"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}

/** Orbit + exam-themed tiles (illustrative), inspired by the onboarding tour welcome visual. */
function CMFASExamRoomVisual() {
  const tiles = [
    { icon: Timer, pos: "top-4 left-8", delay: "0s", label: "Timer" },
    { icon: ScrollText, pos: "top-9 right-4", delay: "0.15s", label: "Paper" },
    { icon: Calculator, pos: "bottom-8 right-8", delay: "0.3s", label: "Calc" },
    { icon: Trophy, pos: "bottom-3 left-12", delay: "0.45s", label: "Results" },
  ] as const;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(100%,20rem)] sm:max-w-sm">
      <div className="absolute inset-0 rounded-full border border-amber-200/15 animate-cmfas-study-spin-slow" />
      <div
        className="absolute inset-8 rounded-full border border-amber-200/10 animate-cmfas-study-spin-slow-reverse"
      />
      <div className="absolute inset-16 rounded-full border border-amber-100/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/40 to-amber-900/30 blur-2xl" />
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-200/25 bg-gradient-to-br from-amber-600 to-amber-900 shadow-2xl sm:h-28 sm:w-28"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 20px 50px -12px rgba(0,0,0,0.5)" }}
          >
            <GraduationCap className="h-11 w-11 text-amber-50 sm:h-12 sm:w-12" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {tiles.map(({ icon: Icon, pos, delay, label }, i) => (
        <div
          key={i}
          className={cn("absolute flex flex-col items-center gap-0.5 animate-cmfas-study-float", pos)}
          style={{ animationDelay: delay }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-950/35 shadow-lg backdrop-blur-sm sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 text-amber-100/95" strokeWidth={1.75} />
          </div>
          <span className="text-[9px] font-medium uppercase tracking-wider text-amber-200/55">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const PAPER_CHIPS = ["Onboarding", "M9", "M9A", "HI", "RES5"] as const;

// ——— Hub (tops the CMFAS dashboard; use `embedInPage` when the full page is already the study room) ———

export interface CMFASHubHeroProps {
  title: string;
  subtitle: string;
  /**
   * When true, no inner backdrop, no min-height slab, no bottom border — sits on
   * `CMFASStudyRoomBackdrop` from the parent. Prefer paper chips + `statusLine` over long copy.
   */
  embedInPage?: boolean;
  /** One short line (e.g. unlock hint). Replaces the old long tertiary paragraph. */
  statusLine?: string | null;
  /** M9 / M9A / HI / RES5 + Onboarding — compact pills. Default true when `!tertiaryLine`. */
  showPaperChips?: boolean;
  /** @deprecated use `statusLine` + `showPaperChips` */
  tertiaryLine?: string;
  showHomeLink?: boolean;
  onTitleEdit?: (newTitle: string) => Promise<void>;
  onSubtitleEdit?: (newSubtitle: string) => Promise<void>;
  className?: string;
  loading?: boolean;
}

export const CMFASHubHero = memo(function CMFASHubHero({
  title,
  subtitle,
  embedInPage = false,
  statusLine,
  showPaperChips = true,
  tertiaryLine,
  showHomeLink = true,
  onTitleEdit,
  onSubtitleEdit,
  className,
  loading,
}: CMFASHubHeroProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [subtitleEditValue, setSubtitleEditValue] = useState(subtitle);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const displayTitle = stripLeadingEmojiTitle(title);

  const handleTitleClick = useCallback(() => {
    if (!onTitleEdit) return;
    setEditValue(displayTitle);
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [onTitleEdit, displayTitle]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    setIsEditingTitle(false);
    if (trimmed && trimmed !== displayTitle && onTitleEdit) {
      await onTitleEdit(trimmed);
    }
  }, [editValue, displayTitle, onTitleEdit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void handleSave();
      }
      if (e.key === "Escape") {
        setEditValue(displayTitle);
        setIsEditingTitle(false);
      }
    },
    [handleSave, displayTitle],
  );

  const handleSubtitleClick = useCallback(() => {
    if (!onSubtitleEdit) return;
    setSubtitleEditValue(subtitle);
    setIsEditingSubtitle(true);
    setTimeout(() => subtitleInputRef.current?.select(), 0);
  }, [onSubtitleEdit, subtitle]);

  const handleSubtitleSave = useCallback(async () => {
    const trimmed = subtitleEditValue.trim();
    setIsEditingSubtitle(false);
    if (trimmed && trimmed !== subtitle && onSubtitleEdit) {
      await onSubtitleEdit(trimmed);
    }
  }, [subtitleEditValue, subtitle, onSubtitleEdit]);

  const handleSubtitleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void handleSubtitleSave();
      }
      if (e.key === "Escape") {
        setSubtitleEditValue(subtitle);
        setIsEditingSubtitle(false);
      }
    },
    [handleSubtitleSave, subtitle],
  );

  const showLegacyTertiary = Boolean(tertiaryLine) && !embedInPage;
  const statusUnderChips =
    embedInPage && statusLine && statusLine.trim()
      ? statusLine.trim()
      : null;

  const introShell = (child: ReactNode) =>
    embedInPage ? (
      <div
        className={cn("relative text-white", className)}
        aria-labelledby="cmfas-hub-heading"
      >
        {child}
      </div>
    ) : (
      <section
        className={cn(
          "relative min-h-[min(52vh,520px)] text-white md:min-h-[min(58vh,640px)]",
          "border-b border-amber-950/25",
          className,
        )}
        aria-labelledby="cmfas-hub-heading"
      >
        <CMFASStudyRoomBackdrop />
        {child}
      </section>
    );

  return introShell(
    <div
      className={cn(
        "relative z-10 mx-auto flex w-full max-w-6xl flex-col",
        embedInPage
          ? "px-3 pb-2 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-5 lg:px-8"
          : "min-h-inherit px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10 lg:px-8",
      )}
    >
      {showHomeLink && (
        <div className={cn("mb-4", embedInPage && "md:mb-3")}>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-200/70 transition-colors hover:text-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 rounded-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
            Home
          </Link>
        </div>
      )}

      <div
        className={cn(
          "grid items-center gap-6 md:grid-cols-2 md:gap-6 lg:gap-10",
          !embedInPage && "flex-1",
        )}
      >
        <div className="min-w-0 order-1">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-200/90">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-amber-300/90" strokeWidth={2.25} />
              <span>CMFAS exam preparation</span>
            </p>

            {isEditingTitle ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.slice(0, 100))}
                onBlur={() => void handleSave()}
                onKeyDown={handleKeyDown}
                maxLength={100}
                autoFocus
                className="mb-1 w-full rounded border border-amber-200/25 bg-black/25 px-2 py-2 text-2xl font-semibold tracking-tight text-white outline-none ring-0 placeholder:text-amber-200/40 focus:border-amber-200/50 sm:text-3xl md:text-4xl"
                id="cmfas-hub-heading"
                aria-label="Page title"
              />
            ) : (
              <h1
                id="cmfas-hub-heading"
                className={cn(
                  "text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl md:text-4xl md:leading-tight",
                  "bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200/95 bg-clip-text text-transparent",
                  onTitleEdit && "cursor-text rounded-sm hover:bg-white/5",
                  loading && "animate-pulse",
                )}
                onClick={onTitleEdit ? handleTitleClick : undefined}
              >
                {displayTitle}
              </h1>
            )}

            {isEditingSubtitle ? (
              <input
                ref={subtitleInputRef}
                value={subtitleEditValue}
                onChange={(e) => setSubtitleEditValue(e.target.value.slice(0, 240))}
                onBlur={() => void handleSubtitleSave()}
                onKeyDown={handleSubtitleKeyDown}
                maxLength={240}
                autoFocus
                className="mt-3 w-full rounded border border-amber-200/25 bg-black/25 px-2 py-1.5 text-sm text-amber-50 outline-none sm:text-base"
                aria-label="Page subtitle"
              />
            ) : (
              <p
                className={cn(
                  "mt-3 max-w-xl text-sm leading-relaxed text-amber-100/90 sm:text-base",
                  onSubtitleEdit && "cursor-text rounded-sm hover:bg-white/5",
                  loading && "animate-pulse",
                )}
                onClick={onSubtitleEdit ? handleSubtitleClick : undefined}
              >
                {subtitle}
              </p>
            )}

            {showLegacyTertiary && (
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-amber-200/80 sm:text-sm">
                {tertiaryLine}
              </p>
            )}

            {embedInPage && showPaperChips && !showLegacyTertiary && (
              <div
                className="mt-3 flex flex-wrap gap-1.5"
                role="list"
                aria-label="Papers in this program"
              >
                {PAPER_CHIPS.map((p) => (
                  <span
                    key={p}
                    role="listitem"
                    className="rounded-md border border-amber-200/20 bg-amber-950/35 px-2 py-0.5 text-[11px] font-medium text-amber-100/90"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            {statusUnderChips && (
              <p className="mt-2 max-w-xl text-xs leading-snug text-amber-200/75 sm:text-sm">
                {statusUnderChips}
              </p>
            )}
          </div>

          <div
            className="relative order-2 flex w-full justify-center md:order-2 md:justify-end"
            aria-hidden
          >
            <div
              className={cn(
                "w-full opacity-95 md:translate-y-1",
                embedInPage ? "max-w-[14rem] sm:max-w-xs" : "max-w-sm",
              )}
            >
              <CMFASExamRoomVisual />
            </div>
          </div>
        </div>
    </div>
  );
});

// ——— Module (compact) ———

export interface CMFASModuleHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItemType[];
  className?: string;
}

const CMFAS_GRADIENT_MODULE = "from-[#422006] via-[#713f12] to-[#a16207]";

function CMFASRegionBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", CMFAS_GRADIENT_MODULE)} />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-amber-900/30 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 20px 20px",
        }}
      />
    </div>
  );
}

export const CMFASModuleHeader = memo(function CMFASModuleHeader({
  title,
  subtitle,
  breadcrumbs,
  className,
}: CMFASModuleHeaderProps) {
  const linkClass =
    "text-amber-100/70 hover:text-amber-50 transition-colors focus-visible:outline-none focus-visible:underline";
  const currentClass = "text-amber-50/95 font-medium";
  const sepClass = "text-amber-200/35";

  const crumbNodes = useMemo(() => {
    if (!breadcrumbs.length) return null;
    return breadcrumbs
      .map((item, index) => [
        <BreadcrumbItem key={`m-${index}`}>
          {item.href ? (
            <BreadcrumbLink asChild>
              <Link to={item.href} className={linkClass}>
                {item.label}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className={currentClass}>{item.label}</BreadcrumbPage>
          )}
        </BreadcrumbItem>,
        index < breadcrumbs.length - 1 && (
          <BreadcrumbSeparator key={`ms-${index}`} className={sepClass} />
        ),
      ])
      .flat()
      .filter(Boolean) as ReactNode[];
  }, [breadcrumbs, linkClass, currentClass, sepClass]);

  const displayTitle = stripLeadingEmojiTitle(title);
  const displaySubtitle = subtitle ? stripLeadingEmojiTitle(subtitle) : "";

  return (
    <div
      className={cn(
        "relative border-b border-amber-950/30 py-4 text-white md:py-5",
        "block px-3 sm:px-4 md:px-6",
        className,
      )}
    >
      <CMFASRegionBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-6xl min-w-0">
        {crumbNodes && (
          <div className="-mx-0 mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Breadcrumb>
              <BreadcrumbList className="min-w-0 flex-nowrap text-xs sm:text-sm">
                {crumbNodes}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-snug text-amber-50 sm:text-xl md:text-2xl">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="mt-1 text-sm text-amber-100/85 sm:text-base">{displaySubtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
});
