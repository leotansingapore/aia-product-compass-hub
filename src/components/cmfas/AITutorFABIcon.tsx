import { cn } from "@/lib/utils";

/**
 * Friendly AI tutor mascot icon: smiling bot with graduation cap and headphones.
 * Inspired by modern educational AI mascots with approachable design.
 */
export function AITutorFABIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* Graduation cap */}
      <g fill="currentColor" opacity="0.9">
        <path d="M4 4.5L12 2L20 4.5V6H4V4.5Z" />
        <path d="M12 6V8" strokeWidth="0.5" stroke="currentColor" />
        <rect x="18.5" y="6.5" width="2" height="2" rx="1" />
      </g>

      {/* Left headphone ear cup */}
      <circle cx="2" cy="11" r="2" fill="currentColor" />
      <path
        d="M4 11C4 9.5 5 8.5 6.5 8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right headphone ear cup */}
      <circle cx="22" cy="11" r="2" fill="currentColor" />
      <path
        d="M20 11C20 9.5 19 8.5 17.5 8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Headphone band */}
      <path
        d="M6.5 8.5Q12 6 17.5 8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Main bot face - rounded rectangle */}
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2.5"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* Left eye */}
      <ellipse cx="8.5" cy="13.5" rx="1.2" ry="1.5" fill="currentColor" />

      {/* Right eye */}
      <ellipse cx="15.5" cy="13.5" rx="1.2" ry="1.5" fill="currentColor" />

      {/* Smile (warm arc) */}
      <path
        d="M8.5 16.5Q12 18 15.5 16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
