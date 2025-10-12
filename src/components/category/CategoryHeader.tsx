import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryHeaderProps {
  category: Category;
  onBack?: () => void;
}

export function CategoryHeader({ category, onBack }: CategoryHeaderProps) {
  return (
    <BrandedPageHeader
      title={category.name}
      subtitle={category.description || ''}
      showBackButton
      onBack={onBack || (() => window.history.back())}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: category.name }
      ]}
    />
  );
}