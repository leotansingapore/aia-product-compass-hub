import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <BrandedPageHeader
      title={category.name}
      subtitle={category.description || ''}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: category.name }
      ]}
    />
  );
}