import React, { useState } from "react";
import { ProductCard, type ProductCardEditData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { useAdmin } from "@/hooks/useAdmin";
import { useSortOrderPersister } from "@/hooks/useSortOrderPersister";
import { SortableGrid, SortableItem } from "@/components/admin/SortableGrid";

export interface NestedProduct {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  visible_tiers?: string[] | null;
  published?: boolean;
  parent_product_id?: string | null;
  sort_order?: number;
  children?: NestedProduct[];
}

/** Recursively build a tree from a flat list */
function buildTree(products: NestedProduct[]): NestedProduct[] {
  const map: Record<string, NestedProduct> = {};
  const roots: NestedProduct[] = [];

  products.forEach(p => {
    map[p.id] = { ...p, children: [] };
  });

  products.forEach(p => {
    if (p.parent_product_id && map[p.parent_product_id]) {
      map[p.parent_product_id].children!.push(map[p.id]);
    } else if (!p.parent_product_id || !map[p.parent_product_id]) {
      // Treat as root if no parent or parent is outside this list
      roots.push(map[p.id]);
    }
  });

  const sortChildren = (nodes: NestedProduct[]) => {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    nodes.forEach(n => sortChildren(n.children || []));
  };
  sortChildren(roots);

  return roots;
}

interface NestedProductsGridProps {
  products: NestedProduct[];
  categoryName: string;
  onProductClick: (id: string) => void;
  onClearFilters?: () => void;
  onEditProduct?: (id: string, data: ProductCardEditData) => void;
  onDeleteProduct?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  onNestingChange: () => void;
  /** Called after sort_order is persisted so the page can refetch products. */
  onReorderSaved?: () => void;
  completionMap?: Record<string, number>;
}

interface FolderCardProps {
  product: NestedProduct;
  depth: number;
  categoryName: string;
  onProductClick: (id: string) => void;
  onEditProduct?: NestedProductsGridProps['onEditProduct'];
  onDeleteProduct?: NestedProductsGridProps['onDeleteProduct'];
  onTogglePublish?: NestedProductsGridProps['onTogglePublish'];
  isViewingAsUser: boolean;
  renderNode: (product: NestedProduct, depth?: number) => React.ReactNode;
}

function FolderCard({
  product, depth, categoryName, onProductClick,
  onEditProduct, onDeleteProduct, onTogglePublish,
  isViewingAsUser, renderNode,
}: FolderCardProps) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

export function NestedProductsGrid({
  products,
  categoryName,
  onProductClick,
  onClearFilters,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
  onReorderSaved,
  completionMap,
}: NestedProductsGridProps) {
  const { isViewingAsUser } = useViewMode();
  const { isAdmin } = useAdmin();
  const persistProductOrder = useSortOrderPersister("products");
  const canReorder = isAdmin;

  const tree = buildTree(products);

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

  const renderNode = (product: NestedProduct, depth = 0): React.ReactNode => {
    const visibleChildren = isViewingAsUser
      ? (product.children || []).filter(c => c.published !== false)
      : (product.children || []);

    if (visibleChildren.length > 0) {
      return (
        <FolderCard
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

    // Sortable only at the top level (depth 0). Nested folder children stay
    // ordered by their own sort_order; reorder inside a folder by drilling
    // into that folder's page.
    if (depth === 0) {
      return (
        <SortableItem key={product.id} id={product.id} enabled={canReorder} className="animate-fade-in">
          <ProductCard
            title={product.title}
            description={product.description || ''}
            category={categoryName}
            tags={product.tags || []}
            highlights={product.highlights || []}
            visibleTiers={product.visible_tiers}
            onClick={() => onProductClick(product.id)}
            productId={product.id}
            published={product.published}
            completionPct={completionMap?.[product.id]}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
            onTogglePublish={onTogglePublish}
          />
        </SortableItem>
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
          visibleTiers={product.visible_tiers}
          onClick={() => onProductClick(product.id)}
          productId={product.id}
          published={product.published}
          completionPct={completionMap?.[product.id]}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          onTogglePublish={onTogglePublish}
        />
      </div>
    );
  };

  return (
    <SortableGrid
      orderedIds={tree.map((p) => p.id)}
      enabled={canReorder}
      onReorder={(ids) => persistProductOrder(ids, onReorderSaved)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
        {tree.map(p => renderNode(p))}
      </div>
      {canReorder && tree.length > 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Tip: long-press any module to reorder.
        </p>
      )}
    </SortableGrid>
  );
}
