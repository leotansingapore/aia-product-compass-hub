import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useAllProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import {
  TrendingUp,
  Shield,
  Heart,
  Clock,
  Stethoscope
} from "lucide-react";

export function ProductCategories() {
  const navigate = useNavigate();
  const { allProducts, loading } = useAllProducts();

  // Calculate product counts per category from database
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(product => {
      const categoryId = product.category_id;
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const categories = [
    {
      id: "c7cde8f4-12d4-4ddc-9150-7b32008a4e19", // Investment Products
      name: "Investment Products",
      description: "Build wealth and achieve financial goals",
      icon: TrendingUp,
      color: "text-white",
      bgColor: "bg-green-600",
      borderColor: "group-hover:border-green-300",
      count: categoryCounts["c7cde8f4-12d4-4ddc-9150-7b32008a4e19"] || 0
    },
    {
      id: "3adb6155-c158-408d-b910-9b3db532d435", // Endowment Products
      name: "Endowment Products",
      description: "Savings with insurance protection",
      icon: Shield,
      color: "text-white",
      bgColor: "bg-blue-600",
      borderColor: "group-hover:border-blue-300",
      count: categoryCounts["3adb6155-c158-408d-b910-9b3db532d435"] || 0
    },
    {
      id: "19b8c528-f36e-4731-827c-0cdb1de25059", // Whole Life Products
      name: "Whole Life Products",
      description: "Lifelong protection and savings",
      icon: Heart,
      color: "text-white",
      bgColor: "bg-red-600",
      borderColor: "group-hover:border-red-300",
      count: categoryCounts["19b8c528-f36e-4731-827c-0cdb1de25059"] || 0
    },
    {
      id: "291cf475-d918-40c0-b37d-33794534d469", // Term Products
      name: "Term Products",
      description: "Affordable protection coverage",
      icon: Clock,
      color: "text-white",
      bgColor: "bg-orange-600",
      borderColor: "group-hover:border-orange-300",
      count: categoryCounts["291cf475-d918-40c0-b37d-33794534d469"] || 0
    },
    {
      id: "b1024527-481f-4d85-9192-b43633e9be4a", // Medical Insurance Products
      name: "Medical Insurance",
      description: "Healthcare protection solutions",
      icon: Stethoscope,
      color: "text-white",
      bgColor: "bg-purple-600",
      borderColor: "group-hover:border-purple-300",
      count: categoryCounts["b1024527-481f-4d85-9192-b43633e9be4a"] || 0
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 auto-rows-fr">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="h-full hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(`/category/${getCategorySlugFromId(category.id)}`)}
          >
            <CardContent className="h-full !p-4 flex items-center justify-center relative">
              <Badge variant="secondary" className="absolute top-2 right-2 text-micro">
                {loading ? "..." : category.count}
              </Badge>
              <div className="flex flex-col items-center text-center space-y-2 w-full">
                <div className={`p-2.5 rounded-xl ${category.bgColor} ${category.borderColor} group-hover:scale-105 transition-all duration-200 shadow-md border-2 border-transparent`}>
                  <category.icon className={`h-6 w-6 ${category.color} stroke-[2]`} />
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">{category.name}</div>
                  <div className="text-micro sm:text-sm text-muted-foreground mt-1">{category.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}