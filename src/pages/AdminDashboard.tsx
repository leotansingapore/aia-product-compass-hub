import { AdminLayout } from '@/components/layout/AdminLayout';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';
import { VideoProgressPanel } from '@/components/admin/VideoProgressPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Video } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Unified user management dashboard for registration to activation."
    >
      <Tabs defaultValue="users">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">User Management</span>
            <span className="xs:hidden sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="video-progress" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Video className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Video Progress</span>
            <span className="xs:hidden sm:hidden">Videos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UnifiedUserDirectory />
        </TabsContent>

        <TabsContent value="video-progress">
          <VideoProgressPanel />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
