import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background px-1 sm:px-4 md:px-6 py-2 sm:py-6 pb-24 md:pb-8">
      <Helmet>
        <title>Admin Dashboard - FINternship</title>
        <meta name="description" content="Unified user management dashboard for registration to activation." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <UnifiedUserDirectory />
      </div>
    </div>
  );
}