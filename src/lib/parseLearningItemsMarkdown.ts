/**
 * Parse a markdown doc into a list of learning-track items.
 *
 * Accepted structure:
 *
 *   ## Item title (or `# Item title`)
 *   Optional description line(s)
 *
 *   ### Objectives
 *   - objective one
 *   - objective two
 *
 *   ### Action items
 *   - action one
 *   - action two
 *
 *   ### Content
 *   - [Link text](https://example.com)
 *   - [Watch video](https://youtu.be/abc)   ← auto-detected as video
 *   - > Plain text body for a text block
 *
 * Unknown sections fall into description. Parsing is best-effort —
 * admins can tweak individual items after import.
 */

import { isVideoUrl } from "./learning-track-url";

export interface ParsedBlock {
  block_type: "text" | "link" | "video";
  title?: string;
  body?: string;
  url?: string;
}

export interface ParsedItem {
  title: string;
  description?: string;
  objectives: string[];
  action_items: string[];
  content_blocks: ParsedBlock[];
}

type Section = "description" | "objectives" | "actions" | "content";

const HEADING_ITEM = /^#{1,2}\s+(.+)$/;
const HEADING_SECTION = /^#{3,}\s+(.+)$/;
const BULLET = /^[-*]\s+(.+)$/;
const LINK = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)$/;
const QUOTED_TEXT = /^>\s+(.+)$/;

function detectSection(heading: string): Section | null {
  const h = heading.trim().toLowerCase();
  if (h.startsWith("objective")) return "objectives";
  if (h.startsWith("action")) return "actions";
  if (h.startsWith("content") || h.startsWith("resources")) return "content";
  return null;
}

export function parseLearningItemsMarkdown(raw: string): ParsedItem[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const items: ParsedItem[] = [];
  let current: ParsedItem | null = null;
  let section: Section = "description";
  let descBuffer: string[] = [];

  const flushDescription = () => {
    if (current && descBuffer.length > 0) {
      const joined = descBuffer.join("\n").trim();
      if (joined) current.description = current.description
        ? current.description + "\n" + joined
        : joined;
    }
    descBuffer = [];
  };

  const pushCurrent = () => {
    flushDescription();
    if (current) items.push(current);
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const itemMatch = trimmed.match(HEADING_ITEM);
    if (itemMatch) {
      pushCurrent();
      current = {
        title: itemMatch[1].trim(),
        objectives: [],
        action_items: [],
        content_blocks: [],
      };
      section = "description";
      descBuffer = [];
      continue;
    }

    if (!current) continue;

    const sectionMatch = trimmed.match(HEADING_SECTION);
    if (sectionMatch) {
      flushDescription();
      const detected = detectSection(sectionMatch[1]);
      section = detected ?? "description";
      continue;
    }

    if (!trimmed) {
      if (section === "description") descBuffer.push("");
      continue;
    }

    if (section === "objectives") {
      const b = trimmed.match(BULLET);
      if (b) current.objectives.push(b[1].trim());
      continue;
    }

    if (section === "actions") {
      const b = trimmed.match(BULLET);
      if (b) current.action_items.push(b[1].trim());
      continue;
    }

    if (section === "content") {
      const quoted = trimmed.match(QUOTED_TEXT);
      if (quoted) {
        current.content_blocks.push({ block_type: "text", body: quoted[1].trim() });
        continue;
      }
      const b = trimmed.match(BULLET);
      if (b) {
        const inner = b[1].trim();
        const linkMatch = inner.match(LINK);
        if (linkMatch) {
          const [, title, url] = linkMatch;
          current.content_blocks.push({
            block_type: isVideoUrl(url) ? "video" : "link",
            title,
            url,
          });
        } else {
          current.content_blocks.push({ block_type: "text", body: inner });
        }
      }
      continue;
    }

    // description section — plain prose
    descBuffer.push(trimmed);
  }

  pushCurrent();
  return items.filter((it) => it.title.length > 0);
}
