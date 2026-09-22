// A descriptor kept out of the way: a small info mark beside a heading or a
// control that opens one short sentence.
//
// A Popover, not a Tooltip: a Radix tooltip never opens on a phone tap, and on
// a phone that would make the explanation unreachable. A mouse gets hover; a
// click or a tap pins it open until the next click, Escape or a tap outside.
// Lives outside components/ui because that folder is generated and protected.

import * as React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function InfoTip({
  children,
  label = "More info",
  className,
}: {
  children: React.ReactNode;
  /** What a screen reader hears for the icon, e.g. "About Engagement by Product". */
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pinned = React.useRef(false);
  const timer = React.useRef<number>();
  // Opened from the keyboard, the bubble takes focus; opened by hover it must
  // not, or the pointer would drag focus around the page.
  const viaKeyboard = React.useRef(false);
  const contentId = React.useId();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  // The gap between the icon and the bubble would close it on the way across,
  // so leaving waits a moment for the pointer to arrive in the bubble.
  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || pinned.current) return;
    window.clearTimeout(timer.current);
    if (next) {
      viaKeyboard.current = false;
      setOpen(true);
    } else {
      timer.current = window.setTimeout(() => setOpen(false), 120);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          pinned.current = false;
          viaKeyboard.current = false;
        }
        setOpen(v);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          // Radix links the bubble with aria-controls, which screen readers do
          // not read out. Described-by is the part that gets spoken.
          aria-describedby={open ? contentId : undefined}
          data-testid="info-tip"
          className={cn(
            "inline-grid h-6 w-6 shrink-0 place-items-center rounded-full align-middle text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          onPointerEnter={hover(true)}
          onPointerLeave={hover(false)}
          onClick={(e) => {
            // Ours, not Radix's toggle: after a hover has opened it, the
            // click that follows should keep it open, not close it.
            e.preventDefault();
            e.stopPropagation();
            window.clearTimeout(timer.current);
            // detail is 0 when the "click" came from Enter or Space.
            viaKeyboard.current = e.detail === 0;
            pinned.current = !pinned.current;
            setOpen(pinned.current);
          }}
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={contentId}
        className="w-auto max-w-[260px] px-3 py-2 text-xs font-normal leading-relaxed"
        collisionPadding={12}
        onOpenAutoFocus={(e) => {
          if (!viaKeyboard.current) e.preventDefault();
        }}
        onPointerEnter={hover(true)}
        onPointerLeave={hover(false)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
