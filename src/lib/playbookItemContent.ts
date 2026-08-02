import type { ScriptVersion } from "@/hooks/useScripts";

/**
 * `script_playbook_items.custom_content` has accumulated three shapes:
 * - `{ version_index: n }`            — a version pinned via AddToPlaybookDialog
 * - `ScriptVersion[]`                 — legacy playbook-local edits saved by the
 *                                       public share view (raw array)
 * - `{ versions: [...], version_index?: n }` — current shape for local edits,
 *                                       which preserves any pin
 * - `{ label, level }`                — section headers (never passed here)
 *
 * Treating a pin object as a versions array crashed the share page
 * (`versions.map is not a function`), so every reader goes through here.
 */

export interface ResolvedVersion {
  version: ScriptVersion;
  /** Index into the full (possibly overridden) versions array */
  originalIndex: number;
}

export interface ResolvedItemContent {
  /** Versions to display, honouring a pinned version if one exists */
  display: ResolvedVersion[];
  /** The full versions array edits should be applied against */
  allVersions: ScriptVersion[];
  /** Pinned version index, if the item was added as a single version */
  pinnedIndex?: number;
  /** True when the item carries playbook-local edits overriding the script */
  hasLocalEdits: boolean;
}

export function resolveItemContent(
  customContent: unknown,
  script: { versions?: ScriptVersion[] } | undefined | null,
): ResolvedItemContent {
  const scriptVersions = Array.isArray(script?.versions) ? script!.versions! : [];
  let versions = scriptVersions;
  let pinnedIndex: number | undefined;
  let hasLocalEdits = false;

  const cc = customContent as any;
  if (Array.isArray(cc)) {
    versions = cc;
    hasLocalEdits = true;
  } else if (cc && typeof cc === "object") {
    if (Array.isArray(cc.versions)) {
      versions = cc.versions;
      hasLocalEdits = true;
    }
    if (typeof cc.version_index === "number") pinnedIndex = cc.version_index;
  }

  const all = versions.map((version, originalIndex) => ({ version, originalIndex }));
  const display = pinnedIndex !== undefined && all[pinnedIndex] ? [all[pinnedIndex]] : all;
  return { display, allVersions: versions, pinnedIndex, hasLocalEdits };
}

/**
 * Build the next `custom_content` value after editing one version's content,
 * preserving a pin and tolerating all legacy shapes.
 */
export function buildEditedCustomContent(
  customContent: unknown,
  script: { versions?: ScriptVersion[] } | undefined | null,
  editIndex: number,
  newContent: string,
): Record<string, unknown> {
  const { allVersions, pinnedIndex } = resolveItemContent(customContent, script);
  const updated = allVersions.map((v, i) => (i === editIndex ? { ...v, content: newContent } : v));
  const next: Record<string, unknown> = { versions: updated };
  if (pinnedIndex !== undefined) next.version_index = pinnedIndex;
  return next;
}
