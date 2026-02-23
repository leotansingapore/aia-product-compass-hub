/**
 * Color utilities for flow nodes — determines readable text color on any background.
 */

/**
 * Returns 'white' or 'black' depending on the luminance of the given hex color.
 * Falls back to 'inherit' for non-hex inputs (CSS variables, etc.).
 */
export function getContrastTextColor(bgColor: string): string {
  if (!bgColor || !bgColor.startsWith('#')) return 'inherit';

  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // W3C luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

/** Preset colors for the node color picker */
export const NODE_COLOR_PRESETS = [
  { label: 'Default', value: '' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
] as const;

/** Condition colors for edges */
export const CONDITION_COLORS: Record<string, string> = {
  yes: '#22c55e',
  no: '#ef4444',
  'no-reply': '#f59e0b',
  custom: '#8b5cf6',
};

/** Default solid fill colors per React Flow node type */
export const NODE_TYPE_DEFAULTS: Record<string, string> = {
  scriptStart: '#16a34a',
  scriptEnd: '#dc2626',
  scriptNode: '#2563eb',
  decisionNode: '#d97706',
  actionNode: '#7c3aed',
  hexagonNode: '#0891b2',
  parallelogramNode: '#ea580c',
  cylinderNode: '#4f46e5',
  documentNode: '#0d9488',
};

/**
 * Returns computed colors for a node based on its React Flow type and optional custom color.
 */
export function getNodeColors(rfType: string, customColor?: string) {
  const bg = customColor || NODE_TYPE_DEFAULTS[rfType] || '#64748b';
  const text = getContrastTextColor(bg);
  const border = bg;
  const handleBorder = bg;
  return { bg, border, text, handleBorder };
}
