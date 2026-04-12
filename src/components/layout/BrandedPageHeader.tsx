import { memo, useMemo, useState, useRef, useCallback, type ReactNode } from "react";
import InlineEditIcon from "@/assets/inline-edit-icon.svg";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FINTERNSHIP_LOGO_WHITE } from "@/constants/branding";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BrandedPageHeaderProps {
  title: string;
  titlePrefix?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  searchBar?: React.ReactNode;
  variant?: "default" | "compact";
  className?: string;
  onTitleEdit?: (newTitle: string) => Promise<void>;
  onSubtitleEdit?: (newSubtitle: string) => Promise<void>;
  /** Renders below the title row (e.g. underline-style tabs). */
  headerTabs?: ReactNode;
  /** When true, header is shown on small screens (default hero is `sm`+ only). */
  showOnMobile?: boolean;
  /** `hero` = brand gradient; `dark` = near-black slab (e.g. learning-style header). */
  tone?: "hero" | "dark";
  /**
   * Udemy-style slim bar: dark row with `brandLabel | title`, compact breadcrumbs above.
   * Ignores `tone` surface colors in favor of a neutral dark bar.
   */
  layout?: "default" | "course";
  /** Shown before the separator when no logo. Only used when `layout="course"`. */
  brandLabel?: string;
  /**
   * Light logo for dark course bar. `undefined` = same asset as login (`FINTERNSHIP_LOGO_WHITE`).
   * Pass `null` to use text `brandLabel` instead of an image.
   */
  brandLogoSrc?: string | null;
}

/** Trim leading non-text decoration (emoji, symbols) so the visible title starts at the first letter/digit. */
function stripLeadingEmojiTitle(title: string): string {
  const trimmed = title.trim();
  const i = trimmed.search(/[\p{L}\p{N}]/u);
  if (i <= 0) return trimmed;
  return trimmed.slice(i).trimStart();
}

export const BrandedPageHeader = memo(function BrandedPageHeader({
  title,
  titlePrefix,
  subtitle,
  breadcrumbs,
  actions,
  searchBar,
  variant = "default",
  className,
  onTitleEdit,
  onSubtitleEdit,
  headerTabs,
  showOnMobile = false,
  tone = "hero",
  layout = "default",
  brandLabel = "FINternship",
  brandLogoSrc,
}: BrandedPageHeaderProps) {
  const resolvedBrandLogo =
    brandLogoSrc === null || brandLogoSrc === ""
      ? null
      : brandLogoSrc === undefined
        ? FINTERNSHIP_LOGO_WHITE
        : brandLogoSrc;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [subtitleEditValue, setSubtitleEditValue] = useState(subtitle || '');
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = useCallback(() => {
    if (!onTitleEdit) return;
    const initial =
      layout === "course"
        ? stripLeadingEmojiTitle(titlePrefix ? `${titlePrefix} ${title}` : title)
        : title;
    setEditValue(initial);
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [onTitleEdit, title, layout, titlePrefix]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    setIsEditingTitle(false);
    if (trimmed && trimmed !== title && onTitleEdit) {
      await onTitleEdit(trimmed);
    }
  }, [editValue, title, onTitleEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setEditValue(title); setIsEditingTitle(false); }
  }, [handleSave, title]);

  const handleSubtitleClick = useCallback(() => {
    if (!onSubtitleEdit) return;
    setSubtitleEditValue(subtitle || '');
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

  const handleSubtitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubtitleSave(); }
    if (e.key === 'Escape') { setSubtitleEditValue(subtitle || ''); setIsEditingSubtitle(false); }
  }, [handleSubtitleSave, subtitle]);

  const breadcrumbLinkClass =
    layout === "course"
      ? "text-white/55 hover:text-white/95 transition-colors focus-visible:outline-none focus-visible:underline focus-visible:decoration-white/80"
      : "text-white/70 hover:text-white transition-colors focus-visible:text-white focus-visible:underline";
  const breadcrumbCurrentClass =
    layout === "course" ? "text-white/90 font-medium" : "text-white font-medium";
  const breadcrumbSepClass = layout === "course" ? "text-white/35" : "text-white/50";

  const breadcrumbElements = useMemo(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return breadcrumbs.map((item, index) => [
      <BreadcrumbItem key={`item-${index}`}>
        {item.href ? (
          <BreadcrumbLink asChild>
            <Link to={item.href} className={breadcrumbLinkClass}>
              {item.label}
            </Link>
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage className={breadcrumbCurrentClass}>{item.label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>,
      index < breadcrumbs.length - 1 && (
        <BreadcrumbSeparator key={`sep-${index}`} className={breadcrumbSepClass} />
      )
    ]).flat().filter(Boolean);
  }, [breadcrumbs, breadcrumbLinkClass, breadcrumbCurrentClass, breadcrumbSepClass]);

  /** `course` / `dark` = brand hero gradient + bottom border; default hero omits border. */
  const toneClasses =
    layout === "course" || tone === "dark"
      ? "bg-gradient-hero text-white border-b border-white/20"
      : "bg-gradient-hero text-white";

  const visibilityClasses =
    layout === "course"
      ? "block py-3 md:py-4 px-4 md:px-6"
      : variant === "compact"
        ? "py-2 sm:py-3 px-2 sm:px-3"
        : showOnMobile
          ? "block py-4 px-3 sm:py-3 md:py-6 sm:px-3 md:px-4"
          : "hidden sm:block sm:py-3 md:py-6 sm:px-3 md:px-4";

  const displayTitle = stripLeadingEmojiTitle(titlePrefix ? `${titlePrefix} ${title}` : title);

  if (layout === "course") {
    /** Topic / description as main `h1` when `subtitle` is set (module code stays in breadcrumbs only). */
    const showCourseTopicFirst = Boolean(subtitle?.trim());
    const displaySubtitle = subtitle ? stripLeadingEmojiTitle(subtitle) : "";

    return (
      <div className={cn(toneClasses, visibilityClasses, className)}>
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col">
          {breadcrumbElements && (
            <div className="-mx-1 mb-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Breadcrumb>
                <BreadcrumbList className="min-w-0 flex-nowrap text-xs sm:text-sm">
                  {breadcrumbElements}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex min-w-0 w-full flex-col gap-2 text-sm font-medium sm:flex-row sm:items-center sm:gap-2 md:gap-3 md:text-base">
              <div className="flex shrink-0 items-center gap-2">
                {resolvedBrandLogo ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-0"
                    aria-label="FINternship"
                  >
                    <img
                      src={resolvedBrandLogo}
                      alt=""
                      decoding="async"
                      className="h-6 w-6 shrink-0 object-contain object-left sm:-mr-2 sm:h-7 sm:w-7 md:h-8 md:w-8"
                    />
                    <span className="-ml-0.5 hidden text-sm font-bold leading-none tracking-tight text-white/95 sm:inline sm:text-base md:text-lg">
                      INternship
                    </span>
                  </span>
                ) : (
                  <span className="shrink-0 font-semibold tracking-tight text-white/90">{brandLabel}</span>
                )}
                <span
                  className="hidden shrink-0 text-white/30 select-none sm:inline"
                  aria-hidden="true"
                >
                  |
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-0 sm:gap-0">
                {showCourseTopicFirst ? (
                  isEditingSubtitle ? (
                    <input
                      ref={subtitleInputRef}
                      value={subtitleEditValue}
                      onChange={(e) => setSubtitleEditValue(e.target.value.slice(0, 200))}
                      onBlur={handleSubtitleSave}
                      onKeyDown={handleSubtitleKeyDown}
                      maxLength={200}
                      autoFocus
                      className="min-w-0 w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm font-semibold text-white outline-none ring-0 focus:border-white/40 sm:py-1 sm:text-base"
                    />
                  ) : (
                    <h1
                      className={cn(
                        "min-w-0 w-full text-[15px] font-normal leading-snug text-white sm:text-base md:text-lg",
                        "line-clamp-3 sm:line-clamp-none sm:truncate sm:leading-normal",
                        onSubtitleEdit && "cursor-pointer rounded hover:bg-white/10"
                      )}
                      onClick={handleSubtitleClick}
                    >
                      {displaySubtitle}
                    </h1>
                  )
                ) : isEditingTitle ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value.slice(0, 100))}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    autoFocus
                    className="min-w-0 w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-sm font-semibold text-white outline-none ring-0 focus:border-white/40 sm:py-1 sm:text-base"
                  />
                ) : (
                  <h1
                    className={cn(
                      "min-w-0 w-full text-[15px] font-normal leading-snug text-white sm:text-base md:text-lg",
                      "line-clamp-3 sm:line-clamp-none sm:truncate sm:leading-normal",
                      onTitleEdit && "cursor-pointer rounded hover:bg-white/10"
                    )}
                    onClick={handleTitleClick}
                  >
                    {displayTitle}
                  </h1>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex shrink-0 items-center justify-end gap-2 self-stretch sm:self-center">
                {actions}
              </div>
            )}
          </div>

          {!showCourseTopicFirst && (
            <>
              {subtitle && !isEditingSubtitle && (
                <p
                  className={cn(
                    "mt-1.5 text-sm text-white/55",
                    onSubtitleEdit && "cursor-pointer rounded hover:bg-white/10"
                  )}
                  onClick={onSubtitleEdit ? handleSubtitleClick : undefined}
                >
                  {subtitle}
                </p>
              )}
              {isEditingSubtitle && (
                <input
                  ref={subtitleInputRef}
                  value={subtitleEditValue}
                  onChange={(e) => setSubtitleEditValue(e.target.value.slice(0, 200))}
                  onBlur={handleSubtitleSave}
                  onKeyDown={handleSubtitleKeyDown}
                  maxLength={200}
                  autoFocus
                  className="mt-1.5 w-full max-w-2xl rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white/90 outline-none"
                />
              )}
            </>
          )}

          {searchBar && <div className="mt-3">{searchBar}</div>}

          {headerTabs && (
            <div className="mt-4 w-full min-w-0 border-t border-white/10 pt-3 -mx-3 px-3 md:-mx-4 md:px-4 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {headerTabs}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(toneClasses, visibilityClasses, className)}>
      <div className="flex w-full flex-col">
        <div className="w-full">
        {breadcrumbElements && (
          <div className="mb-2 md:mb-3 hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbElements}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="grid min-w-[120px] max-w-full">
                  <span
                    className={cn(
                      "invisible whitespace-pre col-start-1 row-start-1 font-bold px-1",
                      variant === "compact"
                        ? "text-base sm:text-lg"
                        : tone === "dark"
                          ? "text-2xl sm:text-3xl md:text-4xl tracking-tight"
                          : "text-base sm:text-lg md:text-2xl"
                    )}
                  >
                    {editValue || " "}
                  </span>
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value.slice(0, 100))}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    autoFocus
                    className={cn(
                      "col-start-1 row-start-1 font-bold bg-transparent border-none outline-none text-white",
                      "ring-1 ring-white/30 rounded px-1",
                      variant === "compact"
                        ? "text-base sm:text-lg"
                        : tone === "dark"
                          ? "text-2xl sm:text-3xl md:text-4xl tracking-tight"
                          : "text-base sm:text-lg md:text-2xl"
                    )}
                  />
                </div>
              ) : (
                <h1
                  className={cn(
                    "font-bold break-words",
                    variant === "compact"
                      ? "text-base sm:text-lg"
                      : tone === "dark"
                        ? "text-2xl sm:text-3xl md:text-4xl tracking-tight"
                        : "text-base sm:text-lg md:text-2xl",
                    onTitleEdit && "cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-colors group/title flex items-center gap-1.5"
                  )}
                  onClick={handleTitleClick}
                >
                  {onTitleEdit && (
                    <img src={InlineEditIcon} alt="" className="h-5 w-5 opacity-0 group-hover/title:opacity-70 transition-opacity shrink-0 invert" aria-hidden="true" />
                  )}
                  {titlePrefix && <span>{titlePrefix}</span>}{title}
                </h1>
              )}
              {subtitle && !isEditingSubtitle && (
                <p
                  className={cn(
                    "text-white/90 mt-1 break-words",
                    showOnMobile
                      ? onSubtitleEdit
                        ? "flex flex-wrap items-center gap-1.5 cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-all duration-300 ease-in-out group/subtitle"
                        : "block"
                      : cn(
                          "hidden sm:block",
                          onSubtitleEdit &&
                            "sm:inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-all duration-300 ease-in-out group/subtitle"
                        ),
                    variant === "compact" ? "text-micro md:text-sm" : "text-sm md:text-base"
                  )}
                  onClick={onSubtitleEdit ? handleSubtitleClick : undefined}
                >
                  {onSubtitleEdit && (
                    <img src={InlineEditIcon} alt="" className="h-3.5 w-3.5 opacity-0 group-hover/subtitle:opacity-70 transition-opacity shrink-0 invert" aria-hidden="true" />
                  )}
                  {subtitle}
                </p>
              )}
              {isEditingSubtitle && (
                <div className="hidden sm:grid min-w-[200px] max-w-full mt-1" style={{ gridTemplateColumns: 'min-content' }}>
                  <span
                    className={cn(
                      "invisible whitespace-pre col-start-1 row-start-1 px-1",
                      variant === "compact" ? "text-micro md:text-sm" : "text-sm md:text-base"
                    )}
                  >
                    {subtitleEditValue || " "}
                  </span>
                  <input
                    ref={subtitleInputRef}
                    value={subtitleEditValue}
                    onChange={(e) => setSubtitleEditValue(e.target.value.slice(0, 200))}
                    onBlur={handleSubtitleSave}
                    onKeyDown={handleSubtitleKeyDown}
                    maxLength={200}
                    autoFocus
                    className={cn(
                      "col-start-1 row-start-1 text-white/90 bg-transparent border-none outline-none",
                      "ring-1 ring-white/30 rounded px-1",
                      variant === "compact" ? "text-micro md:text-sm" : "text-sm md:text-base"
                    )}
                  />
                </div>
              )}
            </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>

        {searchBar && (
          <div className="mt-4">
            {searchBar}
          </div>
        )}
        </div>

        {headerTabs && (
          <div
            className={cn(
              "mt-5 w-full border-t border-white/15 pt-3 sm:mt-6 sm:pt-4",
              tone === "dark" && "-mx-3 px-0 sm:mx-0 sm:px-0"
            )}
          >
            {headerTabs}
          </div>
        )}
      </div>
    </div>
  );
});
