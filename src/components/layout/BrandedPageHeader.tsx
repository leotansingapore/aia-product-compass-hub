import { memo, useMemo, useState, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import InlineEditIcon from "@/assets/inline-edit-icon.svg";
import { Button } from "@/components/ui/button";
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
  showBackButton?: boolean;
  onBack?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  searchBar?: React.ReactNode;
  variant?: "default" | "compact";
  className?: string;
  onTitleEdit?: (newTitle: string) => Promise<void>;
  onSubtitleEdit?: (newSubtitle: string) => Promise<void>;
}

export const BrandedPageHeader = memo(function BrandedPageHeader({
  title,
  titlePrefix,
  subtitle,
  showBackButton,
  onBack,
  breadcrumbs,
  actions,
  searchBar,
  variant = "default",
  className,
  onTitleEdit,
  onSubtitleEdit
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

  return (
    <div className={cn(
      "bg-gradient-hero text-white",
      variant === "compact" ? "py-2 sm:py-3 px-2 sm:px-3" : "py-2 sm:py-3 md:py-6 px-2 sm:px-3 md:px-4",
      className
    )}>
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20 mobile-touch-target transition-colors"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button>
            )}
            <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="inline-grid min-w-[120px] max-w-full">
                  <span
                    className={cn(
                      "invisible whitespace-pre col-start-1 row-start-1 font-bold px-1",
                      variant === "compact" ? "text-base sm:text-lg" : "text-base sm:text-lg md:text-2xl"
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
                      variant === "compact" ? "text-base sm:text-lg" : "text-base sm:text-lg md:text-2xl"
                    )}
                  />
                </div>
              ) : (
                <h1
                  className={cn(
                    "font-bold break-words",
                    variant === "compact" ? "text-base sm:text-lg" : "text-base sm:text-lg md:text-2xl",
                    onTitleEdit && "cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-colors group/title inline-flex items-center gap-1.5"
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
                    "hidden text-white/90 mt-1 break-words",
                    variant === "compact" ? "text-micro md:text-sm" : "text-sm md:text-base",
                    onSubtitleEdit ? "sm:inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-all duration-300 ease-in-out group/subtitle" : "sm:block"
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
    </div>
  );
});
