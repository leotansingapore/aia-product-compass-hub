import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import M9Module from "./M9Module";
import M9AModule from "./M9AModule";
import HIModule from "./HIModule";
import RES5Module from "./RES5Module";
import OnboardingModule from "./OnboardingModule";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function CMFASModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();

  const moduleComponents: Record<string, React.ComponentType> = {
    'm9': M9Module,
    'm9a': M9AModule,
    'hi': HIModule,
    'res5': RES5Module,
    'onboarding': OnboardingModule,
  };

  const ModuleComponent = moduleId ? moduleComponents[moduleId.toLowerCase()] : undefined;

  if (!ModuleComponent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <h2 className="font-serif text-lg font-semibold">Module not found</h2>
            <p className="text-sm text-muted-foreground">
              No CMFAS module matches <span className="font-mono">{moduleId}</span>.
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/cmfas-exams">
                <ArrowLeft className="h-4 w-4" />
                Back to CMFAS Exams
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedPage pageId="cmfas-module-detail">
      <ModuleComponent />
    </ProtectedPage>
  );
}