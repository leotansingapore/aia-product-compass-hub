import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Heart, 
  Clock, 
  Stethoscope 
} from "lucide-react";

export function ProductCategories() {
  const navigate = useNavigate();

  const categories = [
    {
      id: "investment",
      name: "Investment Products",
      description: "Build wealth and achieve financial goals",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: 3
    },
    {
      id: "endowment",
      name: "Endowment Products", 
      description: "Savings with insurance protection",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      count: 2
    },
    {
      id: "whole-life",
      name: "Whole Life Products",
      description: "Lifelong protection and savings",
      icon: Heart,
      color: "text-red-600", 
      bgColor: "bg-red-50",
      count: 1
    },
    {
      id: "term",
      name: "Term Products",
      description: "Affordable protection coverage",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      count: 2
    },
    {
      id: "medical",
      name: "Medical Insurance",
      description: "Healthcare protection solutions",
      icon: Stethoscope,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: 2
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/category/${category.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{category.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}