import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Video, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface LearningPath {
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
  badge?: string;
  sectionId: string;
}

export function LearningPathCards() {
  const navigate = useNavigate();
  const { canAccessSection } = usePermissions();

  const learningPaths: LearningPath[] = [
    {
      title: "CMFAS Exams",
      description: "Exam preparation & resources",
      route: "/cmfas-exams",
      icon: GraduationCap,
      badge: "Learning",
      sectionId: "cmfas-exams"
    },
    {
      title: "Product Training",
      description: "Video courses & materials",
      route: "/training",
      icon: Video,
      progress: 65,
      sectionId: "training"
    },
    {
      title: "Certification",
      description: "Earn your credentials",
      route: "/certification",
      icon: Award,
      badge: "New",
      sectionId: "certification"
    }
  ];

  const availablePaths = learningPaths.filter(path => canAccessSection(path.sectionId));

  if (availablePaths.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Learning Paths</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {availablePaths.map((path) => (
          <Card 
            key={path.route}
            className="flex-shrink-0 w-48 p-4 cursor-pointer hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm active:scale-95"
            onClick={() => navigate(path.route)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <path.icon className="h-5 w-5 text-primary" />
                {path.badge && (
                  <Badge variant="secondary" className="text-micro">
                    {path.badge}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{path.title}</h4>
                <p className="text-micro text-muted-foreground leading-relaxed">{path.description}</p>
                
                {path.progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-micro">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}