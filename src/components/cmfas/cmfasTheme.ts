/**
 * CMFAS palette — collapsed onto the app-wide shadcn semantic tokens so the
 * exam workspace reads as "same product, different section" rather than "a
 * separate dark-mode microsite". Interface is unchanged from the legacy
 * "library at night" palette — every `cmfasRoom.canvas`, `cmfasRoom.brassText`
 * etc. callsite downstream continues working — only the underlying classes
 * are swapped to `bg-background`, `text-primary`, etc.
 */

/** Workspace canvas tokens — the exam-prep hub shell, matching the rest of the app. */
export const cmfasRoom = {
  // Base canvas — app's default near-white background.
  canvas: 'bg-background',
  canvasSoft: 'bg-muted/30',

  // Card / surface — shadcn signature: white card with soft border + subtle shadow.
  surface: 'bg-card border border-border shadow-sm',
  surfaceStrong: 'bg-card border border-border shadow-md',
  surfaceHover: 'hover:bg-muted/40',

  // Text on the canvas — app's charcoal foreground.
  text: 'text-foreground',
  textMuted: 'text-muted-foreground',
  textFaint: 'text-muted-foreground/70',

  // Primary accent — app's blue primary replaces the old brass.
  brassText: 'text-primary',
  brassTextStrong: 'text-primary',
  brassBg: 'bg-primary',
  brassBgSoft: 'bg-primary/10',
  brassBgHover: 'hover:bg-primary/15',
  brassBorder: 'border-primary/40',
  brassBorderSoft: 'border-border',
  brassRing: 'ring-primary',

  // Positive — emerald, tuned for a light canvas with dark-mode fallback.
  positiveText: 'text-emerald-600 dark:text-emerald-400',
  positiveBg: 'bg-emerald-500',
  positiveBgSoft: 'bg-emerald-50 dark:bg-emerald-950/30',
  positiveBorder: 'border-emerald-300 dark:border-emerald-800',

  // Locked / dimmed.
  dim: 'opacity-50',
  dimmedText: 'text-muted-foreground/60',
  dimmedBorder: 'border-muted',
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
