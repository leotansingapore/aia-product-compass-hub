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
    <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer" onClick={onClick}>
      <CardHeader className="text-center pb-2">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${gradient || 'bg-gradient-primary'}`}>
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <p className="text-muted-foreground text-sm mb-4">
          {productCount} {productCount === 1 ? 'product' : 'products'} available
        </p>
        <Button variant="category" className="w-full">
          Explore Products
        </Button>
      </CardContent>
    </Card>
  );
}