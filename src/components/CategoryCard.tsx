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
    <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer mobile-card" onClick={onClick}>
      <CardHeader className="text-center pb-2 p-3 md:p-6">
        <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4 ${gradient || 'bg-gradient-primary'}`}>
          <div className="text-white text-xl md:text-2xl">
            {icon}
          </div>
        </div>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0 p-3 md:p-6">
        <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
          {productCount} {productCount === 1 ? 'product' : 'products'} available
        </p>
        <Button variant="category" className="w-full mobile-touch-target">
          Explore Products
        </Button>
      </CardContent>
    </Card>
  );
}