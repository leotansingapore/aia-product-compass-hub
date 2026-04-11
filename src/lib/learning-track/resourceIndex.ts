import { supabase } from "@/integrations/supabase/client";

export type ResourceKind =
  | "product"
  | "kb"
  | "script"
  | "concept_card"
  | "video"
  | "obsidian_doc"
  | "notebooklm";

export interface IndexedResource {
  id: string;
  kind: ResourceKind;
  title: string;
  body: string;
  href: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "on",
  "with", "is", "are", "be", "by", "as", "at", "from", "this", "that",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

let cachedIndex: IndexedResource[] | null = null;

export function clearResourceIndexCache() {
  cachedIndex = null;
}

export async function buildResourceIndex(): Promise<IndexedResource[]> {
  if (cachedIndex) return cachedIndex;

  const out: IndexedResource[] = [];

  // Products
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, title, description, tags");
    (products ?? []).forEach((p: any) => {
      out.push({
        id: `product:${p.id}`,
        kind: "product",
        title: p.title,
        body: `${p.description ?? ""} ${(p.tags ?? []).join(" ")}`,
        href: `/product/${p.id}`,
      });
    });
  } catch {
    // ignore
  }

  // Obsidian-ingested docs (RLS limits non-admins to shareable=true)
  try {
    const { data: obsidian } = await supabase
      .from("obsidian_resources")
      .select("id, title, body_md, category");
    (obsidian ?? []).forEach((o: any) => {
      out.push({
        id: `obsidian:${o.id}`,
        kind: "obsidian_doc",
        title: o.title,
        body: (o.body_md ?? "").slice(0, 5000),
        href: `/learning-track/resources?doc=${o.id}`,
      });
    });
  } catch {
    // ignore
  }

  cachedIndex = out;
  return out;
}

export async function suggestResources(query: string, limit = 5): Promise<IndexedResource[]> {
  const index = await buildResourceIndex();
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = index
    .map((r) => {
      const tokens = tokenize(`${r.title} ${r.body}`);
      const tokenSet = new Set(tokens);
      const score = queryTokens.reduce(
        (acc, q) => acc + (tokenSet.has(q) ? 1 : 0),
        0
      );
      return { resource: r, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.resource);
}
