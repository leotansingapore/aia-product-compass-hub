import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { ProtectedAdminPage } from '@/components/ProtectedAdminPage';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  pageTitle?: string;
  icon?: ReactNode;
}

export function AdminLayout({ 
  children, 
  title, 
  description, 
  pageTitle = "Admin Dashboard - FINternship",
  icon = <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
}: AdminLayoutProps) {
  return (
    <ProtectedAdminPage>
      <div className="min-h-screen bg-background px-1 sm:px-4 md:px-6 py-2 sm:py-6 pb-24 md:pb-8">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        </Helmet>
        
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            {icon}
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          </div>
          
          {children}
        </div>
      </div>
    </ProtectedAdminPage>
  );
}