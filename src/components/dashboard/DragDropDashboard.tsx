import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, Settings2 } from "lucide-react";
import { RecentlyViewedSection } from "./RecentlyViewedSection";
import { ContinueLearningSection } from "./ContinueLearningSection";
import { LearningAnalyticsDashboard } from "./LearningAnalyticsDashboard";
import { RecentUpdatesSection } from "./RecentUpdatesSection";
import { ProductCategoriesSection } from "./ProductCategoriesSection";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { useCategories, useAllProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

interface DashboardSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  visible: boolean;
  required?: boolean;
}

interface SortableItemProps {
  section: DashboardSection;
  onToggleVisibility: (id: string) => void;
}

function SortableItem({ section, onToggleVisibility }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!section.visible) return null;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleVisibility(section.id)}
            disabled={section.required}
            className="h-8 w-8 p-0"
          >
            {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Section Content */}
      <section.component {...section.props} />
    </div>
  );
}

interface DragDropDashboardProps {
  onCategoryClick: (categoryName: string) => void;
}

export function DragDropDashboard({ onCategoryClick }: DragDropDashboardProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { allProducts, loading: productsLoading } = useAllProducts();
  const { toast } = useToast();

  // Get products with training videos for "Continue Learning" section
  const productsWithVideos = allProducts.filter(product => 
    product.training_videos && Array.isArray(product.training_videos) && product.training_videos.length > 0
  ).slice(0, 3);

  const [sections, setSections] = useState<DashboardSection[]>([
    {
      id: 'analytics',
      title: 'Learning Analytics',
      component: LearningAnalyticsDashboard,
      visible: true,
      required: false
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      component: RecommendationsSection,
      props: { limit: 6 },
      visible: true,
      required: false
    },
    {
      id: 'recently-viewed',
      title: 'Recently Viewed',
      component: RecentlyViewedSection,
      visible: true,
      required: false
    },
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      component: ContinueLearningSection,
      props: { productsWithVideos, loading: productsLoading },
      visible: true,
      required: false
    },
    {
      id: 'categories',
      title: 'Product Categories',
      component: ProductCategoriesSection,
      props: { categories, loading: categoriesLoading, onCategoryClick },
      visible: true,
      required: true
    },
    {
      id: 'recent-updates',
      title: 'Recent Updates',
      component: RecentUpdatesSection,
      visible: true,
      required: false
    }
  ]);

  const [customizeMode, setCustomizeMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        toast({
          title: "Dashboard Updated",
          description: "Section order has been saved.",
        });
        
        return newOrder;
      });
    }
  }, [toast]);

  const handleToggleVisibility = useCallback((id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id 
        ? { ...section, visible: !section.visible }
        : section
    ));
    
    toast({
      title: "Dashboard Updated",
      description: "Section visibility has been changed.",
    });
  }, [toast]);

  const visibleSections = sections.filter(section => section.visible);

  return (
    <div className="space-y-8">
      {/* Customize Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          variant={customizeMode ? "default" : "outline"}
          onClick={() => setCustomizeMode(!customizeMode)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          {customizeMode ? "Done" : "Customize"}
        </Button>
      </div>

      {customizeMode && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map(section => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{section.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(section.id)}
                      disabled={section.required}
                      className="h-8 w-8 p-0"
                    >
                      {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    {section.required && (
                      <span className="text-xs text-muted-foreground">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Hide/show sections and drag them to reorder when you're done customizing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {visibleSections.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}