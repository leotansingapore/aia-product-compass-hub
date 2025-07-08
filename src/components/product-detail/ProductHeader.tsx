import { NavigationHeader } from "@/components/NavigationHeader";
import { getCategoryIdFromName } from "@/hooks/useProducts";

interface ProductHeaderProps {
  productTitle: string;
  categoryName: string;
  onBack: () => void;
}

export function ProductHeader({ productTitle, categoryName, onBack }: ProductHeaderProps) {
  return (
    <NavigationHeader 
      title={`🧾 ${productTitle}`}
      subtitle={categoryName || 'Product Details'}
      showBackButton
      onBack={onBack}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { 
          label: categoryName || 'Products', 
          href: `/category/${getCategoryIdFromName(categoryName || '')}`
        },
        { label: productTitle }
      ]}
    />
  );
}