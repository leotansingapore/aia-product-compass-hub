import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FolderOpen, GripVertical, Layers } from "lucide-react";
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

interface DraggableProductCardProps {
  product: NestedProduct;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  isDropTarget?: boolean;
}

function DraggableProductCard({ product, categoryName, onProductClick, onEditProduct, onDeleteProduct, onTogglePublish, isDropTarget }: DraggableProductCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    data: { type: 'product', product },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl transition-all duration-200 group",
        isDragging && "opacity-40 scale-95",
        isDropTarget && "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]"
      )}
    >
      {/* Drag handle — always visible for admins */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-background/90 border shadow-sm hover:bg-muted transition-colors"
        title="Drag to nest inside another module"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      {isDropTarget && (
        <div className="absolute inset-0 rounded-xl flex items-end justify-center pb-2 pointer-events-none z-10">
          <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Drop to nest inside "{product.title}"
          </span>
        </div>
      )}
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
}

interface ParentProductCardProps {
  product: NestedProduct;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: (id: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onNestingChange: () => void;
  isDropTarget?: boolean;
}

function ParentProductCard({ product, categoryName, onProductClick, onEditProduct, onDeleteProduct, onTogglePublish, onNestingChange, isDropTarget }: ParentProductCardProps) {
  const [expanded, setExpanded] = useState(true);
  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "col-span-full rounded-2xl border bg-card transition-all duration-200",
        isDropTarget && "ring-2 ring-primary ring-offset-2 bg-primary/5"
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
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
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

      {/* Drop zone label */}
      {isDropTarget && (
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Separate root products from children
  const rootProducts = products.filter(p => !p.parent_product_id);
  const childrenMap: Record<string, NestedProduct[]> = {};
  products.forEach(p => {
    if (p.parent_product_id) {
      if (!childrenMap[p.parent_product_id]) childrenMap[p.parent_product_id] = [];
      childrenMap[p.parent_product_id].push(p);
    }
  });

  const rootWithChildren: NestedProduct[] = rootProducts.map(p => ({
    ...p,
    children: (childrenMap[p.id] || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  const activeProduct = products.find(p => p.id === activeId);
  const rootIds = rootWithChildren.map(p => p.id);

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
    const targetProduct = products.find(p => p.id === targetId);

    if (!targetProduct) return;

    // Don't allow nesting into itself or into a child
    if (targetProduct.parent_product_id === draggedId) {
      toast.error("Can't nest a parent inside its own child");
      return;
    }

    // Only nest into root products (not already a child)
    if (!targetProduct.parent_product_id) {
      const draggedProduct = products.find(p => p.id === draggedId);
      // Don't nest a parent that has children into another card
      if (draggedProduct && childrenMap[draggedId]?.length > 0) {
        toast.error("Can't nest a module that already has sub-modules");
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ parent_product_id: targetId })
        .eq('id', draggedId);

      if (error) {
        toast.error('Failed to nest module');
        console.error(error);
      } else {
        toast.success(`"${draggedProduct?.title}" nested inside "${targetProduct.title}"`);
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

  // Non-admin: simple grid, no DnD
  if (!isAdmin()) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {rootWithChildren.map((product) => {
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
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-1">
          <GripVertical className="h-3.5 w-3.5" />
          Drag a card (using the grip handle) onto another card to nest it as a sub-module
        </p>

        <SortableContext items={rootIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {rootWithChildren.map((product) => {
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
                      isDropTarget={overId === product.id}
                    />
                  </div>
                );
              }
              return (
                <DraggableProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryName}
                  onProductClick={onProductClick}
                  onEditProduct={onEditProduct}
                  onDeleteProduct={onDeleteProduct}
                  onTogglePublish={onTogglePublish}
                  isDropTarget={overId === product.id && activeId !== product.id}
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
