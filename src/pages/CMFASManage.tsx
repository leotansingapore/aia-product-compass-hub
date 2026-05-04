import { PageLayout } from "@/components/layout/PageLayout";
import { CMFASAdminLayout } from "@/components/cmfas/admin/CMFASAdminLayout";
import { cn } from "@/lib/utils";

export default function CMFASManage() {
  return (
    <PageLayout
      title="Manage CMFAS — FINternship (Admin)"
      description="Admin content management for CMFAS Exam Preparation modules, resources, and learner progress."
      keywords="CMFAS exam, admin, content management, learner progress"
      className={cn("flex min-h-dvh flex-col bg-background text-foreground")}
    >
      <CMFASAdminLayout />
    </PageLayout>
  );
}
