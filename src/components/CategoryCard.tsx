import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  productCount: number;
  onClick: () => void;
  gradient?: string;
}

export function CategoryCard({ title, description, icon, productCount, onClick, gradient }: CategoryCardProps) {
  return (
    <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={onClick}>
      <CardHeader className="text-center pb-2 p-3 sm:p-4 md:p-6">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4 ${gradient || 'bg-gradient-primary'} group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white text-lg sm:text-xl md:text-2xl">
            {icon}
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg md:text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0 p-3 sm:p-4 md:p-6">
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 md:mb-4">
          {productCount} {productCount === 1 ? 'product' : 'products'} available
        </p>
        <Button variant="category" className="w-full min-h-[44px] text-sm sm:text-base">
          Explore Products
        </Button>
      </CardContent>
    </Card>
  );
}