import { BrandedPageHeader, BreadcrumbItem } from "@/components/layout/BrandedPageHeader";
import { getCategoryIdFromName } from "@/hooks/useProducts";

interface ProductHeaderProps {
  productTitle: string;
  categoryName: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  onTitleEdit?: (newTitle: string) => Promise<void>;
  onDescriptionEdit?: (newDescription: string) => Promise<void>;
}

export function ProductHeader({ productTitle, categoryName, description, breadcrumbs, onTitleEdit, onDescriptionEdit }: ProductHeaderProps) {
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
      onTitleEdit={onTitleEdit}
      onSubtitleEdit={onDescriptionEdit}
    />
  );
}