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
}: BrandedPageHeaderProps) {

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [subtitleEditValue, setSubtitleEditValue] = useState(subtitle || '');
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = useCallback(() => {
    if (!onTitleEdit) return;
    setEditValue(title);
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [onTitleEdit, title]);

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

  const breadcrumbElements = useMemo(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return breadcrumbs.map((item, index) => [
      <BreadcrumbItem key={`item-${index}`}>
        {item.href ? (
          <BreadcrumbLink asChild>
            <Link
              to={item.href}
              className="text-white/70 hover:text-white transition-colors focus-visible:text-white focus-visible:underline"
            >
              {item.label}
            </Link>
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage className="text-white font-medium">{item.label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>,
      index < breadcrumbs.length - 1 && (
        <BreadcrumbSeparator key={`sep-${index}`} className="text-white/50" />
      )
    ]).flat().filter(Boolean);
  }, [breadcrumbs]);

  /** `dark` = same brand hero gradient as default (see `--gradient-hero`), not neutral gray. */
  const toneClasses =
    tone === "dark"
      ? "bg-gradient-hero text-white border-b border-white/20"
      : "bg-gradient-hero text-white";

  const visibilityClasses =
    variant === "compact"
      ? "py-2 sm:py-3 px-2 sm:px-3"
      : showOnMobile
        ? "block py-4 px-3 sm:py-3 md:py-6 sm:px-3 md:px-4"
        : "hidden sm:block sm:py-3 md:py-6 sm:px-3 md:px-4";

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
