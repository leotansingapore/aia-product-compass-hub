import { ReactNode, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
  // Three sensors so the same long-press gesture works across input types:
  // - PointerSensor: modern desktop + most mobile browsers (Pointer Events API)
  // - TouchSensor: explicit fallback for older mobile browsers / iOS quirks
  //   where Pointer Events don't fire as expected on long-press
  // - KeyboardSensor: a11y — Space/Enter to pick up, arrows to move
  // Both pointer-based sensors share the same delay+tolerance, so the gesture
  // (hold still ~500ms) feels identical on desktop and mobile.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: LONG_PRESS_DELAY_MS,
        tolerance: LONG_PRESS_TOLERANCE_PX,
      },
    }),
    useSensor(TouchSensor, {
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
        // Only lock touch behaviour DURING an active drag. Before the long-press
        // activates, leave touch-action alone so users can scroll the page by
        // swiping from any card. The delay+tolerance activation constraint
        // means a scroll gesture (movement > 8px) cancels the press before the
        // sensor captures it, so the browser keeps handling the scroll natively.
        isDragging
          ? "touch-none scale-[1.02] shadow-2xl cursor-grabbing"
          : "touch-pan-y",
        // Stop iOS Safari from showing the native callout (copy/share menu)
        // when the user long-presses a card, and stop text selection from
        // kicking in. Both are confusing on a card that's becoming draggable.
        "select-none [-webkit-touch-callout:none] [-webkit-user-select:none]",
        className,
      )}
      aria-grabbed={isDragging}
    >
      {children}
    </Component>
  );
}
