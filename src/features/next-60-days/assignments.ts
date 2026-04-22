export type AssignmentFormFieldKind = "text" | "textarea";

export interface AssignmentFormField {
  label: string;
  kind: AssignmentFormFieldKind;
  hint?: string;
  rows?: number;
}

export interface AssignmentFrontmatter {
  id: string;
  order: number;
  title: string;
  short: string;
  icon: string;
  deliverable: string;
  submission_type: "file" | "text" | "both" | "form";
  estimated_time: string;
  weeks_covered: number[];
  related_days: number[];
  status_key: string;
  form_fields?: AssignmentFormField[];
}

export interface Assignment {
  slug: string;
  frontmatter: AssignmentFrontmatter;
  markdown: string;
}

const rawLoaders = import.meta.glob<string>(
  "/docs/next-60-days/assignments/assignment-*.md",
  { query: "?raw", import: "default" },
);

const PATH_RE = /\/docs\/next-60-days\/assignments\/(assignment-\d+)\.md$/;

const loaderBySlug: Record<string, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderBySlug[m[1]] = loader as () => Promise<string>;
}

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function parseFlexYaml(yaml: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawVal = kv[2].trim();
    if (rawVal === "") {
      const children: string[] = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        const raw = lines[i + 1].replace(/^\s+-\s+/, "").trim();
        children.push(raw.replace(/^["']|["']$/g, ""));
        i++;
      }
      out[key] = children;
    } else if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
      const inner = rawVal.slice(1, -1).trim();
      out[key] =
        inner === ""
          ? []
          : inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (
      (rawVal.startsWith('"') && rawVal.endsWith('"')) ||
      (rawVal.startsWith("'") && rawVal.endsWith("'"))
    ) {
      out[key] = rawVal.slice(1, -1);
    } else if (/^-?\d+(\.\d+)?$/.test(rawVal)) {
      out[key] = Number(rawVal);
    } else {
      out[key] = rawVal;
    }
  }
  return out;
}

function splitFrontmatter(raw: string): { fm: Record<string, unknown>; body: string } {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return { fm: {}, body: raw };
  return { fm: parseFlexYaml(m[1]), body: raw.slice(m[0].length) };
}

function coerceList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""))))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function coerceString(raw: unknown, fallback = ""): string {
  return typeof raw === "string" ? raw : fallback;
}

function coerceFormFields(raw: unknown): AssignmentFormField[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const fields: AssignmentFormField[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const parts = entry.split("|").map((p) => p.trim());
    const [label, kindStr = "textarea", hintRaw = "", rowsStr = ""] = parts;
    if (!label) continue;
    const kind: AssignmentFormFieldKind = kindStr === "text" ? "text" : "textarea";
    const rows = rowsStr ? Math.max(2, Math.min(12, Number(rowsStr) || 0)) : undefined;
    const hint = hintRaw ? hintRaw.replace(/\\n/g, "\n") : undefined;
    fields.push({ label, kind, hint, rows });
  }
  return fields.length ? fields : undefined;
}

async function loadSlug(slug: string): Promise<Assignment | undefined> {
  const loader = loaderBySlug[slug];
  if (!loader) return undefined;
  const raw = await loader();
  const { fm, body } = splitFrontmatter(raw);
  return {
    slug,
    frontmatter: {
      id: coerceString(fm.id, slug),
      order: Number(fm.order ?? 0),
      title: coerceString(fm.title, slug),
      short: coerceString(fm.short),
      icon: coerceString(fm.icon, "clipboard"),
      deliverable: coerceString(fm.deliverable),
      submission_type:
        (fm.submission_type as AssignmentFrontmatter["submission_type"]) ?? "file",
      estimated_time: coerceString(fm.estimated_time),
      weeks_covered: coerceList(fm.weeks_covered),
      related_days: coerceList(fm.related_days),
      status_key: coerceString(fm.status_key, slug),
      form_fields: coerceFormFields(fm.form_fields),
    },
    markdown: body.trim(),
  };
}

let cache: Assignment[] | null = null;

export async function loadAllAssignments(): Promise<Assignment[]> {
  if (cache) return cache;
  const slugs = Object.keys(loaderBySlug).sort();
  const all = await Promise.all(slugs.map(loadSlug));
  cache = all
    .filter((a): a is Assignment => !!a)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return cache;
}

/** The 6 First-60-Days assignment status_keys that must all be submitted before Next 60 Days assignments unlock. */
export const FIRST_60_DAYS_REQUIRED_KEYS: string[] = [
  "assignment-01-roleplay",
  "assignment-02-outreach",
  "assignment-03-field-observation",
  "assignment-04-book-review",
  "assignment-05-cold-calling-shadow",
  "assignment-06-vision-board",
];
