import { useState, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FolderOpen, Layers } from "lucide-react";
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
  useSortable,
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

interface DraggableProductCardProps {
  product: NestedProduct;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  isOver?: boolean;
}

function DraggableProductCard({ product, categoryName, onProductClick, onEditProduct, onDeleteProduct, onTogglePublish, isOver }: DraggableProductCardProps) {
  const { isAdmin } = usePermissions();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    data: { type: 'product', product },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.01]"
      )}
    >
      {isAdmin() && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 bg-background/80 border"
          title="Drag to nest inside another module"
        >
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="group h-full">
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
    </div>
  );
}

interface ParentProductCardProps {
  product: NestedProduct;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onNestingChange: () => void;
  isOverId?: string | null;
}

function ParentProductCard({ product, categoryName, onProductClick, onEditProduct, onDeleteProduct, onTogglePublish, onNestingChange, isOverId }: ParentProductCardProps) {
  const [expanded, setExpanded] = useState(true);
  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const { isOver, setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: product.id,
    data: { type: 'parent', product },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const children = product.children || [];
  const visibleChildren = isViewingAsUser ? children.filter(c => c.published !== false) : children;

  const handleUnNest = async (childId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ parent_product_id: null })
      .eq('id', childId);
    if (error) toast.error('Failed to un-nest module');
    else { toast.success('Module moved to top level'); onNestingChange(); }
  };

  const isBeingDroppedOn = isOverId === product.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "col-span-full rounded-2xl border bg-card transition-all duration-200",
        isBeingDroppedOn && "ring-2 ring-primary ring-offset-2 bg-primary/5"
      )}
    >
      {/* Parent header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          {isAdmin() && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
              title="Drag to reorder"
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
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
      </div>

      {/* Drop zone label when being dragged over */}
      {isBeingDroppedOn && (
        <div className="mx-4 mb-3 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary text-center font-medium">
          Drop here to nest inside "{product.title}"
        </div>
      )}

      {/* Children grid */}
      {expanded && visibleChildren.length > 0 && (
        <div className="px-3 sm:px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {visibleChildren.map(child => (
            <div key={child.id} className="relative group">
              <ProductCard
                title={child.title}
                description={child.description || ''}
                category={categoryName}
                tags={child.tags || []}
                highlights={child.highlights || []}
                onClick={() => onProductClick(child.id)}
                productId={child.id}
                published={child.published}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onTogglePublish={onTogglePublish}
              />
              {isAdmin() && (
                <button
                  className="absolute top-2 right-10 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 border rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={e => { e.stopPropagation(); handleUnNest(child.id); }}
                  title="Remove from parent"
                >
                  ↑ Un-nest
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Separate root products (no parent) from children
  const rootProducts = products.filter(p => !p.parent_product_id);
  // Build children map
  const childrenMap: Record<string, NestedProduct[]> = {};
  products.forEach(p => {
    if (p.parent_product_id) {
      if (!childrenMap[p.parent_product_id]) childrenMap[p.parent_product_id] = [];
      childrenMap[p.parent_product_id].push(p);
    }
  });

  // Attach children to parents
  const rootWithChildren: NestedProduct[] = rootProducts.map(p => ({
    ...p,
    children: (childrenMap[p.id] || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  const activeProduct = products.find(p => p.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    setOverId(overId || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedId = active.id as string;
    const targetId = over.id as string;
    const targetProduct = products.find(p => p.id === targetId);

    if (!targetProduct) return;

    // Don't allow nesting into itself or into a child
    if (targetProduct.parent_product_id === draggedId) {
      toast.error("Can't nest a parent inside its own child");
      return;
    }

    // If target is a root product (not already a child), nest dragged inside target
    if (!targetProduct.parent_product_id) {
      const { error } = await supabase
        .from('products')
        .update({ parent_product_id: targetId })
        .eq('id', draggedId);

      if (error) {
        toast.error('Failed to nest module');
        console.error(error);
      } else {
        toast.success(`Nested "${products.find(p => p.id === draggedId)?.title}" inside "${targetProduct.title}"`);
        onNestingChange();
      }
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

  if (!isAdmin()) {
    // Non-admin: simple grid with parent containers, no DnD
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {rootWithChildren.map((product, index) => {
          const hasChildren = (product.children?.length ?? 0) > 0;
          if (hasChildren) {
            return (
              <ParentProductCard
                key={product.id}
                product={product}
                categoryName={categoryName}
                onProductClick={onProductClick}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                onTogglePublish={onTogglePublish}
                onNestingChange={onNestingChange}
                isOverId={null}
              />
            );
          }
          return (
            <div key={product.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
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
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 sm:space-y-4 animate-fade-in">
        {isAdmin() && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-1">
            <Layers className="h-3.5 w-3.5" />
            Drag a module card onto another to nest it as a sub-module
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
          {rootWithChildren.map((product, index) => {
            const hasChildren = (product.children?.length ?? 0) > 0;
            if (hasChildren) {
              return (
                <div key={product.id} className="col-span-full">
                  <ParentProductCard
                    product={product}
                    categoryName={categoryName}
                    onProductClick={onProductClick}
                    onEditProduct={onEditProduct}
                    onDeleteProduct={onDeleteProduct}
                    onTogglePublish={onTogglePublish}
                    onNestingChange={onNestingChange}
                    isOverId={overId}
                  />
                </div>
              );
            }
            return (
              <div key={product.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
                <DraggableProductCard
                  product={product}
                  categoryName={categoryName}
                  onProductClick={onProductClick}
                  onEditProduct={onEditProduct}
                  onDeleteProduct={onDeleteProduct}
                  onTogglePublish={onTogglePublish}
                  isOver={overId === product.id}
                />
              </div>
            );
          })}
        </div>
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
