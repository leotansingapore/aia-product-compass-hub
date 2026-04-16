export type Track = "pre_rnf" | "post_rnf" | "explorer";
export type ItemStatus = "not_started" | "in_progress" | "completed";
export type ReviewStatus = "pending" | "approved" | "changes_requested";
export type BlockType = "text" | "link" | "video" | "resource_ref" | "image";
export type ResourceType =
  | "product"
  | "kb"
  | "script"
  | "concept_card"
  | "video"
  | "obsidian_doc"
  | "notebooklm";
export type FileType = "pdf" | "image" | "url" | "loom" | "text";

export interface LearningTrackContentBlock {
  id: string;
  item_id: string;
  order_index: number;
  block_type: BlockType;
  title: string | null;
  body: string | null;
  url: string | null;
  resource_type: ResourceType | null;
  resource_id: string | null;
}

export interface LearningTrackItem {
  id: string;
  phase_id: string;
  order_index: number;
  title: string;
  description: string | null;
  objectives: string[] | null;
  action_items: string[] | null;
  requires_submission: boolean;
  hidden_resources: string[];
  legacy_id: string | null;
  published_at: string | null;
  content_blocks: LearningTrackContentBlock[];
}

export interface LearningTrackPhase {
  id: string;
  track: Track;
  order_index: number;
  title: string;
  description: string | null;
  published_at: string | null;
  items: LearningTrackItem[];
}
