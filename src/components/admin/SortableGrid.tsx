import { ReactNode, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

/**
 * Long-press distance/time before a drag activates. Tuned so:
 * - quick taps on inner buttons (Learn more, ⋮ menu, bookmark) pass through
 * - holding a card for ~500ms grabs it for reorder
 * Mirrors the touch-friendly defaults Apple uses for icon-rearrange mode.
 */
const LONG_PRESS_DELAY_MS = 500;
const LONG_PRESS_TOLERANCE_PX = 8;

interface SortableGridProps {
  /** Stable IDs of items in current display order. */
  orderedIds: string[];
  /** Disable DnD (renders children unchanged). Set true for non-admins. */
  enabled: boolean;
  /**
   * Called after a successful reorder with the new ID order. Implementer is
   * responsible for resequencing sort_order in DB and refetching.
   */
  onReorder: (newOrderedIds: string[]) => void | Promise<void>;
  children: ReactNode;
}

/**
 * Wraps a grid of cards in DnD context. Each child must be a `<SortableItem>`
 * (or a `<Fragment>` wrapping one) so its `id` is registered. When `enabled`
 * is false, the wrapper short-circuits — no listeners attached, behaviour is
 * identical to a plain `<div>`.
 *
 * Layout is left to the caller — wrap this component in your existing
 * `<div className="grid …">` and it won't interfere with Tailwind classes.
 */
export function SortableGrid({
  orderedIds,
  enabled,
  onReorder,
  children,
}: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: LONG_PRESS_DELAY_MS,
        tolerance: LONG_PRESS_TOLERANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderedIds, oldIndex, newIndex);
    void onReorder(next);
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  enabled: boolean;
  /** Element wrapping the card. Defaults to `div`. */
  as?: "div" | "li";
  className?: string;
  children: ReactNode;
}

/**
 * Wraps one card in `useSortable`. Listeners attach to the whole wrapper, so
 * a long-press anywhere on the card grabs it. A normal click still passes
 * through to inner buttons (the activation delay is the bouncer).
 *
 * When `enabled` is false, renders a plain wrapper — no hook overhead, no
 * pointer handlers, no chance of interfering with anchor/button click paths.
 */
export function SortableItem({
  id,
  enabled,
  as = "div",
  className,
  children,
}: SortableItemProps) {
  if (!enabled) {
    return <Wrapper as={as} className={className}>{children}</Wrapper>;
  }
  return <SortableItemInner id={id} as={as} className={className}>{children}</SortableItemInner>;
}

function Wrapper({
  as,
  className,
  children,
}: {
  as: "div" | "li";
  className?: string;
  children: ReactNode;
}) {
  if (as === "li") {
    return <li className={className}>{children}</li>;
  }
  return <div className={className}>{children}</div>;
}

function SortableItemInner({
  id,
  as,
  className,
  children,
}: {
  id: string;
  as: "div" | "li";
  className?: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
    }),
    [transform, transition, isDragging],
  );

  const Component = as === "li" ? "li" : "div";

  return (
    <Component
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none",
        isDragging && "scale-[1.02] shadow-2xl cursor-grabbing",
        className,
      )}
      aria-grabbed={isDragging}
    >
      {children}
    </Component>
  );
}
