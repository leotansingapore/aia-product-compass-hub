/**
 * Immersive backdrop for the CMFAS hub workspace.
 *
 * Layered from back to front:
 *   1. Deep navy base — the library-at-night canvas.
 *   2. Warm radial "desk lamp" glow bottom-left.
 *   3. A second softer pool at upper-right to balance.
 *   4. Subtle paper dot grid so surfaces have something to sit on.
 *   5. Deep vignette so attention falls into the centre.
 *
 * Purely decorative; always sits behind `relative z-10` content. No photos —
 * tasteful, layered, stays out of the way of the real content.
 */
export function CMFASWorkspaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* 1. Base canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1424] via-[#0f1c33] to-[#060b16]" />

      {/* 2. Desk-lamp pool, bottom-left — warm brass glow */}
      <div
        className="absolute -left-1/4 bottom-[-20%] h-[80%] w-[70%] rounded-full opacity-90 blur-[120px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(212, 165, 116, 0.22) 0%, rgba(184, 137, 79, 0.10) 45%, transparent 70%)',
        }}
      />

      {/* 3. Soft fill — upper right, quieter */}
      <div
        className="absolute right-[-10%] top-[-10%] h-[55%] w-[50%] rounded-full opacity-70 blur-[100px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(139, 165, 216, 0.12) 0%, transparent 65%)',
        }}
      />

      {/* 4. Paper dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(245, 232, 208, 1) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* 5. Deep vignette — funnel eye into centre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(6, 11, 22, 0.55) 100%)',
        }}
      />
    </div>
  );
}
