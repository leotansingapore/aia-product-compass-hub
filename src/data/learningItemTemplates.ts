import type { BlockType } from "@/types/learning-track";

export type TemplateCategory = "General" | "Lesson" | "Practice" | "Assessment";

/**
 * Learning item templates — boilerplates instructors can pick from when
 * adding a new item to a phase. Add/edit templates here; changes ship
 * with the next deploy.
 *
 * Each template produces:
 *   - Item fields (title, description, objectives, action_items, requires_submission)
 *   - An optional list of content blocks (pre-structured text/link/video blocks)
 *
 * Everything is a starting point — admins edit inline after creation.
 */

export interface TemplateContentBlock {
  block_type: BlockType;
  title?: string;
  body?: string;
  url?: string;
}

export interface LearningItemTemplate {
  /** Stable key used in the dropdown */
  key: string;
  /** Label shown in the picker */
  label: string;
  /** One-line helper shown under the label */
  hint: string;
  /** Grouping in the picker UI */
  category: TemplateCategory;
  /** Default title — admins rename after creation */
  title: string;
  description?: string;
  objectives?: string[];
  action_items?: string[];
  requires_submission?: boolean;
  content_blocks?: TemplateContentBlock[];
}

export const LEARNING_ITEM_TEMPLATES: LearningItemTemplate[] = [
  {
    key: "blank",
    label: "Blank item",
    hint: "Title only — fill in the rest inline.",
    category: "General",
    title: "New item",
  },
  {
    key: "video_lesson",
    label: "Video lesson",
    hint: "Watch a video, then reflect.",
    category: "Lesson",
    title: "Video lesson: [topic]",
    description: "Watch the video below and note the three key takeaways.",
    objectives: [
      "Understand the core concept covered in the video",
      "Identify how it applies to client conversations",
    ],
    action_items: [
      "Watch the full video",
      "Write down 3 takeaways in your notes",
    ],
    content_blocks: [
      {
        block_type: "video",
        title: "Lesson video",
        url: "https://",
      },
      {
        block_type: "text",
        title: "Reflection prompts",
        body: "1. What was the most surprising point?\n2. Where have you seen this come up with clients?\n3. How will you apply it this week?",
      },
    ],
  },
  {
    key: "reading",
    label: "Reading / reference",
    hint: "Read a document or external resource.",
    category: "Lesson",
    title: "Reading: [topic]",
    description: "Review the linked material and be ready to discuss in your next check-in.",
    objectives: [
      "Familiarise yourself with the reference material",
    ],
    action_items: [
      "Read the full document",
      "Highlight or note any unclear sections for follow-up",
    ],
    content_blocks: [
      {
        block_type: "link",
        title: "Reference material",
        url: "https://",
      },
    ],
  },
  {
    key: "roleplay",
    label: "Role-play exercise",
    hint: "Practice a conversation, get scored.",
    category: "Practice",
    title: "Role-play: [scenario]",
    description: "Run the role-play scenario with the AI avatar and review your feedback.",
    objectives: [
      "Practice handling a realistic client conversation",
      "Identify one strength and one area to improve",
    ],
    action_items: [
      "Complete at least one full role-play session",
      "Review the AI feedback report",
      "Note one concrete improvement for next time",
    ],
    requires_submission: false,
    content_blocks: [
      {
        block_type: "link",
        title: "Start role-play",
        url: "/roleplay",
      },
    ],
  },
  {
    key: "submission",
    label: "Submission task",
    hint: "Submit work for admin review.",
    category: "Assessment",
    title: "Submit: [deliverable]",
    description: "Complete the task below and submit your work for review.",
    objectives: [
      "Produce the required deliverable",
    ],
    action_items: [
      "Follow the instructions in the content block",
      "Upload your work in the submission panel",
      "Wait for admin feedback",
    ],
    requires_submission: true,
    content_blocks: [
      {
        block_type: "text",
        title: "Instructions",
        body: "Describe what the learner needs to produce and how it will be evaluated.",
      },
    ],
  },
  {
    key: "knowledge_check",
    label: "Knowledge check / quiz",
    hint: "Short quiz to reinforce learning.",
    category: "Assessment",
    title: "Knowledge check: [topic]",
    description: "Test your understanding with this short quiz.",
    objectives: [
      "Confirm recall of the key concepts",
    ],
    action_items: [
      "Complete the quiz",
      "Review any questions you got wrong",
    ],
    content_blocks: [
      {
        block_type: "link",
        title: "Take the quiz",
        url: "https://",
      },
    ],
  },
  {
    key: "checklist",
    label: "Action checklist",
    hint: "Structured list of real-world actions.",
    category: "Practice",
    title: "Checklist: [goal]",
    description: "Work through the checklist below. Tick each action as you complete it.",
    action_items: [
      "Action 1",
      "Action 2",
      "Action 3",
    ],
  },
];

export function getTemplate(key: string): LearningItemTemplate | undefined {
  return LEARNING_ITEM_TEMPLATES.find((t) => t.key === key);
}
