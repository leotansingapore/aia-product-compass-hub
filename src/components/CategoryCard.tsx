import { ReactNode, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  productCount: number;
  onClick: () => void;
  gradient?: string;
  borderColor?: string;
  /** Override the "X products available" label — e.g. "topics" for CMFAS */
  countLabel?: string;
  /** Override the CTA button text */
  ctaLabel?: string;
}

export const CategoryCard = memo(function CategoryCard({ title, description, icon, productCount, onClick, gradient, borderColor = 'group-hover:border-primary', countLabel = 'product', ctaLabel = 'Explore' }: CategoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardHeader className="text-center pb-2 p-3 sm:p-4 md:p-6">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4 ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-gradient-primary'} ${borderColor} group-hover:scale-105 transition-all duration-200 shadow-md border-2 border-transparent`}>
          <div className="text-white text-lg sm:text-xl md:text-2xl">
            {icon}
          </div>
        </div>
        <CardTitle className="text-card-title">{title}</CardTitle>
        <CardDescription className="text-card-description leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0 p-3 sm:p-4 md:p-6">
        <p className="text-metadata mb-3 md:mb-4">
          {productCount} {productCount === 1 ? countLabel : `${countLabel}s`} available
        </p>
        <Button variant="category" className="w-full min-h-[44px] text-sm sm:text-base">
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
