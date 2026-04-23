/**
 * Backdrop for the CMFAS hub workspace — matches the app's signature
 * decorative-orb treatment: two soft blurs positioned top-right and
 * bottom-left, one from primary, one from accent. Purely atmospheric;
 * always sits behind `relative z-10` content.
 */
export function CMFASWorkspaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base canvas — app's near-white background */}
      <div className="absolute inset-0 bg-background" />

      {/* Primary orb, top-right */}
      <div className="absolute -right-24 -top-24 h-[60%] w-[60%] rounded-full bg-primary/15 blur-3xl" />

      {/* Accent orb, bottom-left */}
      <div className="absolute -bottom-24 -left-24 h-[55%] w-[55%] rounded-full bg-accent/15 blur-3xl" />
    </div>
  );
}
