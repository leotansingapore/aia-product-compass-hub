import { useParams } from "react-router-dom";
import M9Module from "./M9Module";
import M9AModule from "./M9AModule";
import HIModule from "./HIModule";
import RES5Module from "./RES5Module";
import OnboardingModule from "./OnboardingModule";
import NotFound from "../NotFound";

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
    return <NotFound />;
  }

  return <ModuleComponent />;
}