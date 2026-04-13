import type { ReactNode } from "react";
import { BrandedPageHeader, BreadcrumbItem } from "@/components/layout/BrandedPageHeader";
import { getCategoryIdFromName } from "@/hooks/useProducts";

interface ProductHeaderProps {
  productTitle: string;
  categoryName: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Shown on the title row (e.g. bookmark, admin tools). */
  actions?: ReactNode;
  onTitleEdit?: (newTitle: string) => Promise<void>;
  onDescriptionEdit?: (newDescription: string) => Promise<void>;
}

export function ProductHeader({ productTitle, categoryName, description, breadcrumbs, actions, onTitleEdit, onDescriptionEdit }: ProductHeaderProps) {
  const defaultBreadcrumbs = [
    { label: "Home", href: "/" },
    {
      label: categoryName || 'Products',
      href: `/category/${getCategoryIdFromName(categoryName || '')}`
    },
    { label: productTitle }
  ];

  return (
    <BrandedPageHeader
      title={productTitle}
      titlePrefix="🧾 "
      subtitle={description || categoryName || 'Product Details'}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      actions={actions}
      onTitleEdit={onTitleEdit}
      onSubtitleEdit={onDescriptionEdit}
    />
  );
}