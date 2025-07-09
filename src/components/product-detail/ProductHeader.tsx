import { NavigationHeader, BreadcrumbItem } from "@/components/NavigationHeader";
import { getCategoryIdFromName } from "@/hooks/useProducts";

interface ProductHeaderProps {
  productTitle: string;
  categoryName: string;
  onBack: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function ProductHeader({ productTitle, categoryName, onBack, breadcrumbs }: ProductHeaderProps) {
  const defaultBreadcrumbs = [
    { label: "Home", href: "/" },
    { 
      label: categoryName || 'Products', 
      href: `/category/${getCategoryIdFromName(categoryName || '')}`
    },
    { label: productTitle }
  ];

  return (
    <NavigationHeader 
      title={`🧾 ${productTitle}`}
      subtitle={categoryName || 'Product Details'}
      showBackButton
      onBack={onBack}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
    />
  );
}