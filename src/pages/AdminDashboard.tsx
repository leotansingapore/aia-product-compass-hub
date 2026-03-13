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
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="video-progress" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Progress
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
