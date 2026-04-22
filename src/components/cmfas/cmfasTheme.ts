/**
 * CMFAS brand palette — "study room at night" lane.
 *
 * The hub workspace runs on a deep navy/slate canvas with warm brass accents
 * (desk-lamp glow). Cyan remains for in-lesson learner chrome so the action
 * steps panel and module list feel connected to the original CMFAS visual
 * language. Emerald = positive progress; muted = locked / inactive.
 */

/** Workspace canvas tokens — the immersive hub shell. */
export const cmfasRoom = {
  // Base ink: deep navy, like a library at night.
  canvas: 'bg-[#0a1424]',
  canvasSoft: 'bg-[#0f1c33]',

  // Surface cards sitting on the canvas — subtly lifted, warm.
  surface: 'bg-[#131f38]/80 backdrop-blur-sm border-[#b8894f]/15',
  surfaceStrong: 'bg-[#17253f]/90 backdrop-blur-sm border-[#b8894f]/25',
  surfaceHover: 'hover:bg-[#17253f]/90',

  // Text on the canvas — warm cream, not stark white.
  text: 'text-[#f5e8d0]',
  textMuted: 'text-[#c9b896]',
  textFaint: 'text-[#8b7355]',

  // Brass accent — the desk-lamp warmth. Primary CTA + active nav item.
  brassText: 'text-[#d4a574]',
  brassTextStrong: 'text-[#e8bb82]',
  brassBg: 'bg-[#d4a574]',
  brassBgSoft: 'bg-[#d4a574]/10',
  brassBgHover: 'hover:bg-[#d4a574]/20',
  brassBorder: 'border-[#d4a574]/40',
  brassBorderSoft: 'border-[#b8894f]/20',
  brassRing: 'ring-[#d4a574]',

  // Positive — emerald, kept from before.
  positiveText: 'text-emerald-400',
  positiveBg: 'bg-emerald-500',
  positiveBgSoft: 'bg-emerald-500/10',
  positiveBorder: 'border-emerald-500/40',

  // Locked / dimmed.
  dim: 'opacity-40',
  dimmedText: 'text-[#8b7355]',
  dimmedBorder: 'border-[#8b7355]/20',
} as const;

/**
 * Legacy in-lesson CMFAS tones — keep cyan accent for LessonActionStepsPanel
 * and CMFASExamModuleList so those surfaces feel consistent with
 * OnboardingChecklist. The hub workspace uses `cmfasRoom` above.
 */

export const cmfasTone = {
  // Accent — headers, active states, primary chrome on CMFAS surfaces.
  accentText: 'text-cyan-700 dark:text-cyan-300',
  accentTextStrong: 'text-cyan-800 dark:text-cyan-200',
  accentBg: 'bg-cyan-50 dark:bg-cyan-950/20',
  accentBgSoft: 'bg-cyan-50/40 dark:bg-cyan-950/10',
  accentBgStrong: 'bg-cyan-100/40 dark:bg-cyan-950/20',
  accentBorder: 'border-cyan-200 dark:border-cyan-800/40',
  accentBorderSoft: 'border-cyan-200/60 dark:border-cyan-800/30',
  accentCheckbox: 'border-cyan-400',
  accentHoverBg: 'hover:bg-cyan-100/30 dark:hover:bg-cyan-950/20',
  accentRing: 'ring-cyan-400',

  // Positive — "you're advancing". Used sparingly so it stays meaningful.
  positiveText: 'text-emerald-600 dark:text-emerald-400',
  positiveTextStrong: 'text-emerald-700 dark:text-emerald-300',
  positiveBg: 'bg-emerald-50 dark:bg-emerald-950/20',
  positiveBorder: 'border-emerald-200 dark:border-emerald-800/40',
  positiveCheckboxChecked:
    'data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500',
  positiveSwitchOn: 'data-[state=checked]:bg-emerald-500',

  // Neutral / locked.
  neutralText: 'text-muted-foreground',
  neutralBorder: 'border-border',
} as const;
