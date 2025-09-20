import { AdminLayout } from '@/components/layout/AdminLayout';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';

export default function AdminDashboard() {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Unified user management dashboard for registration to activation."
    >
      <UnifiedUserDirectory />
    </AdminLayout>
  );
}