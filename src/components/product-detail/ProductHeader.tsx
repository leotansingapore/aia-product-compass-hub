import { BrandedPageHeader, BreadcrumbItem } from "@/components/layout/BrandedPageHeader";
import { getCategoryIdFromName } from "@/hooks/useProducts";

interface ProductHeaderProps {
  productTitle: string;
  categoryName: string;
  onBack: () => void;
  breadcrumbs?: BreadcrumbItem[];
  onTitleEdit?: (newTitle: string) => Promise<void>;
}

export function ProductHeader({ productTitle, categoryName, onBack, breadcrumbs, onTitleEdit }: ProductHeaderProps) {
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
      subtitle={categoryName || 'Product Details'}
      showBackButton
      onBack={onBack}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      onTitleEdit={onTitleEdit}
    />
  );
}