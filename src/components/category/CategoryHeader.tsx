import { NavigationHeader } from "@/components/NavigationHeader";

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
    <NavigationHeader 
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