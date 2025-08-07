import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_found';
  message?: string;
}

export function ApprovalCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkApprovalStatus();
    } else {
      setIsChecking(false);
    }
  }, [user]);

  const checkApprovalStatus = async () => {
    if (!user?.primaryEmailAddress?.emailAddress && !user?.emailAddresses?.[0]?.emailAddress) {
      setIsChecking(false);
      return;
    }

    try {
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      
      // Check if this user has an approval request
      const { data: request, error } = await supabase
        .from('user_approval_requests')
        .select('status')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error checking approval status:', error);
        setApprovalStatus({ status: 'not_found' });
        return;
      }

      if (!request) {
        // No approval request found, they need to create one
        setApprovalStatus({ status: 'not_found' });
      } else {
        setApprovalStatus({ 
          status: request.status as 'pending' | 'approved' | 'rejected',
          message: request.status === 'rejected' ? 'Your access request was rejected.' : undefined
        });
      }
    } catch (error) {
      console.error('Error checking approval:', error);
      setApprovalStatus({ status: 'not_found' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestAccess = () => {
    navigate('/signup-request');
  };

  const handleSignOut = () => {
    navigate('/auth');
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Checking access permissions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, show children (login page)
  if (!user) {
    return <>{children}</>;
  }

  // If approved or admin, show the app
  if (approvalStatus?.status === 'approved') {
    return <>{children}</>;
  }

  // Check if user is admin by email (bypass approval for admin)
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  if (userEmail === 'tanjunsing@gmail.com') {
    return <>{children}</>;
  }

  // Show approval status UI
  const getStatusIcon = () => {
    switch (approvalStatus?.status) {
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'not_found':
        return <AlertTriangle className="h-12 w-12 text-blue-500" />;
      default:
        return <Clock className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (approvalStatus?.status) {
      case 'pending':
        return 'Access Request Pending';
      case 'rejected':
        return 'Access Request Rejected';
      case 'not_found':
        return 'Access Request Required';
      default:
        return 'Access Verification';
    }
  };

  const getStatusDescription = () => {
    switch (approvalStatus?.status) {
      case 'pending':
        return 'Your access request is being reviewed by an administrator. You will receive an email notification once your request is processed.';
      case 'rejected':
        return approvalStatus.message || 'Your access request was rejected. Please contact an administrator for more information.';
      case 'not_found':
        return 'You need to request access to use this platform. Please submit an access request for admin approval.';
      default:
        return 'Please wait while we verify your access permissions.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-[500px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle>{getStatusTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvalStatus?.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Request Submitted</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your request is in the queue for review. Check your email for updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {approvalStatus?.status === 'not_found' && (
            <Button onClick={handleRequestAccess} className="w-full">
              Submit Access Request
            </Button>
          )}

          <Button variant="outline" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}