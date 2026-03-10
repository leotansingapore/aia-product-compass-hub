import React, { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FolderOpen, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface NestedProduct {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  published?: boolean;
  parent_product_id?: string | null;
  sort_order?: number;
  children?: NestedProduct[];
}

/** Recursively build a tree from a flat list */
function buildTree(products: NestedProduct[]): NestedProduct[] {
  const map: Record<string, NestedProduct> = {};
  const roots: NestedProduct[] = [];

  // Clone each product and init children array
  products.forEach(p => {
    map[p.id] = { ...p, children: [] };
  });

  products.forEach(p => {
    if (p.parent_product_id && map[p.parent_product_id]) {
      map[p.parent_product_id].children!.push(map[p.id]);
    } else if (!p.parent_product_id) {
      roots.push(map[p.id]);
    }
  });

  // Sort children by sort_order
  const sortChildren = (nodes: NestedProduct[]) => {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    nodes.forEach(n => sortChildren(n.children || []));
  };
  sortChildren(roots);

  return roots;
}

/** Collect all descendant IDs of a node */
function getDescendantIds(product: NestedProduct): string[] {
  const ids: string[] = [];
  const traverse = (p: NestedProduct) => {
    ids.push(p.id);
    (p.children || []).forEach(traverse);
  };
  (product.children || []).forEach(traverse);
  return ids;
}

/** Collect all IDs in the tree (for SortableContext) */
function getAllIds(nodes: NestedProduct[]): string[] {
  const ids: string[] = [];
  const traverse = (p: NestedProduct) => {
    ids.push(p.id);
    (p.children || []).forEach(traverse);
  };
  nodes.forEach(traverse);
  return ids;
}

// ─────────────────────────────────────────────
// Shared props for recursive cards
// ─────────────────────────────────────────────
interface SharedCardProps {
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onNestingChange: () => void;
  overId: string | null;
  activeId: string | null;
  isAdmin: boolean;
  isViewingAsUser: boolean;
  depth?: number;
}

// ─────────────────────────────────────────────
// Leaf card (no children)
// ─────────────────────────────────────────────
function DraggableProductCard({
  product,
  shared,
  onUnNest,
}: {
  product: NestedProduct;
  shared: SharedCardProps;
  onUnNest?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    data: { type: 'product', product },
  });

  const isDropTarget = shared.overId === product.id && shared.activeId !== product.id;
  const isNested = !!product.parent_product_id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl transition-all duration-200",
        isDragging && "opacity-40 scale-95",
        isDropTarget && "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]"
      )}
    >
      {shared.isAdmin && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-background/90 border shadow-sm hover:bg-muted transition-colors select-none"
          title="Drag onto another card to nest it inside"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      {/* Always-visible un-nest button for nested cards */}
      {shared.isAdmin && isNested && onUnNest && (
        <button
          className="absolute top-2 right-2 z-20 text-[10px] font-medium text-muted-foreground hover:text-foreground bg-background/90 border rounded-full px-2 py-0.5 shadow-sm hover:bg-muted transition-colors"
          onClick={e => { e.stopPropagation(); onUnNest(); }}
          title="Move back to top level"
        >
          ↑ Un-nest
        </button>
      )}
      {isDropTarget && (
        <div className="absolute inset-0 rounded-xl flex items-end justify-center pb-2 pointer-events-none z-10">
          <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
            Drop to nest inside "{product.title}"
          </span>
        </div>
      )}
      <ProductCard
        title={product.title}
        description={product.description || ''}
        category={shared.categoryName}
        tags={product.tags || []}
        highlights={product.highlights || []}
        onClick={() => shared.onProductClick(product.id)}
        productId={product.id}
        published={product.published}
        onEdit={shared.onEditProduct}
        onDelete={shared.onDeleteProduct}
        onTogglePublish={shared.onTogglePublish}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Folder card (has children) — renders recursively
// ─────────────────────────────────────────────
function FolderProductCard({
  product,
  shared,
}: {
  product: NestedProduct;
  shared: SharedCardProps;
}) {
  const [expanded, setExpanded] = useState(true);
  const depth = shared.depth ?? 0;
  const isDropTarget = shared.overId === product.id && shared.activeId !== product.id;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: product.id,
    data: { type: 'folder', product },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const children = product.children || [];
  const visibleChildren = shared.isViewingAsUser
    ? children.filter(c => c.published !== false)
    : children;

  const childIds = visibleChildren.map(c => c.id);

  const handleUnNest = async (childId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ parent_product_id: null })
      .eq('id', childId);
    if (error) toast.error('Failed to un-nest module');
    else { toast.success('Module moved to top level'); shared.onNestingChange(); }
  };

  const handleUnNestToParent = async (childId: string) => {
    // Move child up one level (to this folder's parent)
    const newParent = product.parent_product_id ?? null;
    const { error } = await supabase
      .from('products')
      .update({ parent_product_id: newParent })
      .eq('id', childId);
    if (error) toast.error('Failed to move module');
    else { toast.success('Module moved up one level'); shared.onNestingChange(); }
  };

  const indentClass = depth > 0 ? "ml-4 border-l-2 border-border/50" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "col-span-full rounded-2xl border bg-card transition-all duration-200",
        isDropTarget && "ring-2 ring-primary ring-offset-2 bg-primary/5",
        depth > 0 && "border-border/60 bg-muted/20"
      )}
    >
      {/* Folder header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          {shared.isAdmin && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted shrink-0"
              title="Drag to reorder or nest"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded
              ? <ChevronDown className="h-4 w-4 shrink-0" />
              : <ChevronRight className="h-4 w-4 shrink-0" />}
            <FolderOpen className={cn("h-4 w-4 shrink-0", depth === 0 ? "text-primary" : "text-secondary-foreground")} />
          </button>
          <button
            className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate text-left"
            onClick={() => shared.onProductClick(product.id)}
          >
            {product.title}
          </button>
          <span className="text-xs text-muted-foreground shrink-0">
            {visibleChildren.length} sub-module{visibleChildren.length !== 1 ? 's' : ''}
          </span>
          {depth > 0 && shared.isAdmin && (
            <button
              className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground border rounded px-1.5 py-0.5 bg-background/60 hover:bg-muted transition-colors"
              onClick={e => { e.stopPropagation(); handleUnNestToParent(product.id); }}
              title="Move up one level"
            >
              ↑ Move up
            </button>
          )}
        </div>
      </div>

      {/* Drop zone indicator */}
      {isDropTarget && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-primary/10 border-2 border-primary/50 border-dashed text-xs text-primary text-center font-semibold animate-pulse">
          📂 Drop here to nest inside "{product.title}"
        </div>
      )}

      {/* Children */}
      {expanded && visibleChildren.length > 0 && (
        <div className={cn("px-3 sm:px-4 pb-4", indentClass)}>
          <SortableContext items={childIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {visibleChildren.map(child => {
                const hasGrandchildren = (child.children?.length ?? 0) > 0;
                const childShared = { ...shared, depth: depth + 1 };

                if (hasGrandchildren) {
                  return (
                    <div key={child.id} className="col-span-full">
                      <FolderProductCard product={child} shared={childShared} />
                    </div>
                  );
                }

                return (
                  <DraggableProductCard
                    key={child.id}
                    product={child}
                    shared={childShared}
                    onUnNest={() => handleUnNest(child.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Read-only folder card (no DnD hooks — safe for non-admin view)
// ─────────────────────────────────────────────
interface ReadOnlyFolderCardProps {
  product: NestedProduct;
  depth: number;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: SharedCardProps['onEditProduct'];
  onDeleteProduct?: SharedCardProps['onDeleteProduct'];
  onTogglePublish?: SharedCardProps['onTogglePublish'];
  isViewingAsUser: boolean;
  renderNode: (product: NestedProduct, depth?: number) => React.ReactNode;
}

function ReadOnlyFolderCard({
  product, depth, categoryName, onProductClick,
  onEditProduct, onDeleteProduct, onTogglePublish,
  isViewingAsUser, renderNode,
}: ReadOnlyFolderCardProps) {
  const [expanded, setExpanded] = useState(true);
  const visibleChildren = isViewingAsUser
    ? (product.children || []).filter(c => c.published !== false)
    : (product.children || []);

  return (
    <div className={cn(
      "col-span-full rounded-2xl border bg-card",
      depth > 0 && "border-border/60 bg-muted/20"
    )}>
      <div className="flex items-center gap-2 p-3 sm:p-4">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded
            ? <ChevronDown className="h-4 w-4 shrink-0" />
            : <ChevronRight className="h-4 w-4 shrink-0" />}
          <FolderOpen className={cn("h-4 w-4 shrink-0", depth === 0 ? "text-primary" : "text-secondary-foreground")} />
        </button>
        <button
          className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate text-left"
          onClick={() => onProductClick(product.id)}
        >
          {product.title}
        </button>
        <span className="text-xs text-muted-foreground shrink-0">
          {visibleChildren.length} sub-module{visibleChildren.length !== 1 ? 's' : ''}
        </span>
      </div>
      {expanded && visibleChildren.length > 0 && (
        <div className={cn("px-3 sm:px-4 pb-4", depth > 0 && "ml-4 border-l-2 border-border/50")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {visibleChildren.map(child => (
              <React.Fragment key={child.id}>
                {renderNode(child, depth + 1)}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main grid
// ─────────────────────────────────────────────
interface NestedProductsGridProps {
  products: NestedProduct[];
  categoryName: string;
  onProductClick: (id: string) => void;
  onClearFilters?: () => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onNestingChange: () => void;
}

export function NestedProductsGrid({
  products,
  categoryName,
  onProductClick,
  onClearFilters,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
  onNestingChange,
}: NestedProductsGridProps) {
  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tree = buildTree(products);
  const allIds = getAllIds(tree);
  const activeProduct = products.find(p => p.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId((event.over?.id as string) || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedId = active.id as string;
    const targetId = over.id as string;

    // Prevent circular nesting: target must not be a descendant of dragged
    const draggedNode = products.find(p => p.id === draggedId);
    if (!draggedNode) return;

    // Build subtree of dragged node to check descendants
    const draggedTree = buildTree(products).find(function findNode(n: NestedProduct): NestedProduct | undefined {
      if (n.id === draggedId) return n;
      for (const c of n.children || []) {
        const found = findNode(c);
        if (found) return found;
      }
    } as any);

    // Get all descendant IDs to prevent circular reference
    const descendantIds = draggedTree ? getDescendantIds(draggedTree) : [];
    if (descendantIds.includes(targetId)) {
      toast.error("Can't nest a module inside its own sub-module");
      return;
    }

    // Nest dragged into target
    const targetProduct = products.find(p => p.id === targetId);
    if (!targetProduct) return;

    const previousParentId = draggedNode.parent_product_id ?? null;

    const { error } = await supabase
      .from('products')
      .update({ parent_product_id: targetId })
      .eq('id', draggedId);

    if (error) {
      toast.error('Failed to nest module');
      console.error(error);
    } else {
      onNestingChange();
      toast.success(`"${draggedNode.title}" nested inside "${targetProduct.title}"`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            const { error: undoError } = await supabase
              .from('products')
              .update({ parent_product_id: previousParentId })
              .eq('id', draggedId);
            if (undoError) {
              toast.error('Failed to undo');
            } else {
              toast.success('Nesting undone');
              onNestingChange();
            }
          },
        },
        duration: 6000,
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">No products found matching your search.</p>
        {onClearFilters && (
          <Button variant="outline" className="mt-4" onClick={onClearFilters}>
            Clear search &amp; show all products
          </Button>
        )}
      </div>
    );
  }

  // Non-admin: simple read-only recursive view (no DnD context needed)
  if (!isAdmin()) {
    const renderNode = (product: NestedProduct, depth = 0): React.ReactNode => {
      const visibleChildren = isViewingAsUser
        ? (product.children || []).filter(c => c.published !== false)
        : (product.children || []);

      if (visibleChildren.length > 0) {
        return (
          <ReadOnlyFolderCard
            key={product.id}
            product={product}
            depth={depth}
            categoryName={categoryName}
            onProductClick={onProductClick}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
            onTogglePublish={onTogglePublish}
            isViewingAsUser={isViewingAsUser}
            renderNode={renderNode}
          />
        );
      }
      return (
        <div key={product.id} className="animate-fade-in">
          <ProductCard
            title={product.title}
            description={product.description || ''}
            category={categoryName}
            tags={product.tags || []}
            highlights={product.highlights || []}
            onClick={() => onProductClick(product.id)}
            productId={product.id}
            published={product.published}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
            onTogglePublish={onTogglePublish}
          />
        </div>
      );
    };

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {tree.map(p => renderNode(p))}
      </div>
    );
  }

  // Admin: DnD enabled
  const shared: SharedCardProps = {
    categoryName,
    onProductClick,
    onEditProduct,
    onDeleteProduct,
    onTogglePublish,
    onNestingChange,
    overId,
    activeId,
    isAdmin: true,
    isViewingAsUser,
    depth: 0,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 sm:space-y-4 animate-fade-in">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-1">
          <GripVertical className="h-3.5 w-3.5" />
          Drag a card onto another to nest it — supports unlimited depth like Google Drive
        </p>

        <SortableContext items={allIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {tree.map(product => {
              const hasChildren = (product.children?.length ?? 0) > 0;
              if (hasChildren) {
                return (
                  <div key={product.id} className="col-span-full">
                    <FolderProductCard product={product} shared={shared} />
                  </div>
                );
              }
              return (
                <DraggableProductCard
                  key={product.id}
                  product={product}
                  shared={shared}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activeProduct && (
          <div className="opacity-90 rotate-1 scale-105 shadow-2xl">
            <ProductCard
              title={activeProduct.title}
              description={activeProduct.description || ''}
              category={categoryName}
              tags={activeProduct.tags || []}
              highlights={activeProduct.highlights || []}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
