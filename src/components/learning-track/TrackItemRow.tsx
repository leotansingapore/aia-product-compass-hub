import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Target, ClipboardList, ExternalLink, Play, FileText, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackItem, ContentBlock } from "@/data/learningTrackData";
import { ContentBlockEditor } from "./ContentBlockEditor";

interface TrackItemRowProps {
  item: TrackItem;
  isCompleted: boolean;
  onToggle: () => void;
  contentBlocks: ContentBlock[];
  onAddBlock: (block: Omit<ContentBlock, "id">) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ContentBlock>) => void;
  onRemoveBlock: (blockId: string) => void;
  isAdmin: boolean;
}

function getVideoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const videoId = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    // Loom
    if (u.hostname.includes("loom.com")) {
      const match = u.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
      if (match) return `https://www.loom.com/embed/${match[1]}`;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export function TrackItemRow({
  item,
  isCompleted,
  onToggle,
  contentBlocks,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  isAdmin,
}: TrackItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const defaultBlocks = item.defaultContent ?? [];
  const allBlocks = [...defaultBlocks, ...contentBlocks];
  const hasContent = allBlocks.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isCompleted
          ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
          : "bg-card"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="mt-0.5 shrink-0"
          aria-label={`Mark "${item.title}" as ${isCompleted ? "incomplete" : "complete"}`}
        />

        {/* Content */}
        <Collapsible open={expanded} onOpenChange={setExpanded} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-start justify-between text-left group">
              <div className="min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium leading-tight block",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 block line-clamp-1">
                  {item.description}
                </span>
                {hasContent && !expanded && (
                  <span className="text-[10px] text-primary mt-1 block">
                    {allBlocks.length} resource{allBlocks.length !== 1 ? "s" : ""} attached
                  </span>
                )}
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-0.5 ml-2",
                  expanded && "rotate-90"
                )}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-3 space-y-4 text-sm">
              {/* Objectives */}
              {item.objectives.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Target className="h-3 w-3" />
                    Learning Objectives
                  </div>
                  <ul className="space-y-1 pl-1">
                    {item.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {item.actionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <ClipboardList className="h-3 w-3" />
                    Action Items
                  </div>
                  <ul className="space-y-1 pl-1">
                    {item.actionItems.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content blocks (visible to everyone) */}
              {allBlocks.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resources
                  </div>
                  {allBlocks.map((block) => {
                    const isDefault = defaultBlocks.some((d) => d.id === block.id);
                    const isInternal = block.type === "link" && block.url?.startsWith("/");
                    return (
                      <div key={block.id} className="relative group">
                        {block.type === "text" && (
                          <div className="rounded-md border bg-muted/30 p-3">
                            <div className="flex items-start gap-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-sm whitespace-pre-wrap">{block.text}</p>
                            </div>
                          </div>
                        )}
                        {block.type === "link" && (
                          isInternal ? (
                            <a
                              href={block.url}
                              className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-sm font-medium text-primary">
                                {block.label || block.url}
                              </span>
                            </a>
                          ) : (
                            <a
                              href={block.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-md border p-3 transition-colors hover:bg-accent/50"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-sm text-primary underline underline-offset-2">
                                {block.label || block.url}
                              </span>
                            </a>
                          )
                        )}
                        {block.type === "video" && (
                          <div className="space-y-1.5">
                            {block.label && (
                              <div className="flex items-center gap-1.5">
                                <Play className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">{block.label}</span>
                              </div>
                            )}
                            {block.url && getVideoEmbedUrl(block.url) ? (
                              <div className="relative w-full rounded-md overflow-hidden border" style={{ paddingBottom: "56.25%" }}>
                                <iframe
                                  src={getVideoEmbedUrl(block.url)!}
                                  className="absolute inset-0 w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={block.label || "Video"}
                                />
                              </div>
                            ) : (
                              <a
                                href={block.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-md border p-3 transition-colors hover:bg-accent/50"
                              >
                                <Play className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-sm text-primary underline underline-offset-2">
                                  {block.label || block.url}
                                </span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Admin delete button — only for admin-added blocks, not defaults */}
                        {isAdmin && !isDefault && (
                          <button
                            onClick={() => onRemoveBlock(block.id)}
                            className="absolute -right-1 -top-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                            aria-label="Remove resource"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Admin: add content button */}
              {isAdmin && (
                <div className="pt-1">
                  {showEditor ? (
                    <ContentBlockEditor
                      onAdd={(block) => {
                        onAddBlock(block);
                        setShowEditor(false);
                      }}
                      onCancel={() => setShowEditor(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowEditor(true)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      Add resource
                    </button>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
