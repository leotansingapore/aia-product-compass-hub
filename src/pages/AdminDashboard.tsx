import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { UserManagementSection } from '@/components/account/UserManagementSection';

interface ApprovalRequest {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { isMasterAdmin } = usePermissions();
  const { toast } = useToast();
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('user_approval_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (approvalsError) {
        console.error('Error fetching approval requests:', approvalsError);
      } else {
        setApprovalRequests((approvalsData || []).map(request => ({
          ...request,
          status: request.status as 'pending' | 'approved' | 'rejected'
        })));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Make sure you're logged in as a master admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      if (action === 'approve') {
        const { error } = await supabase.rpc('approve_user_request', {
          request_id: requestId
        });

        if (error) throw error;

        toast({
          title: "Request Approved",
          description: "User account has been created successfully",
        });
      } else {
        const { error } = await supabase
          .from('user_approval_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id,
            notes: notes || 'Request rejected'
          })
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: "Request Rejected",
          description: "The approval request has been rejected",
        });
      }

      fetchApprovalRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  if (!isMasterAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be a master admin to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-1 sm:px-4 md:px-6 py-2 sm:py-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">Master Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="users" className="min-h-[44px] text-sm">User Management</TabsTrigger>
            <TabsTrigger value="approvals" className="relative min-h-[44px] text-sm">
              User Approvals
              {approvalRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-1 text-xs" variant="destructive">
                  {approvalRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <UserManagementSection />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Approval Requests
                </CardTitle>
                <CardDescription>
                  Review and approve new user registration requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvalRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approval requests found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Details</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.email}</div>
                              {(request.first_name || request.last_name) && (
                                <div className="text-sm text-muted-foreground">
                                  {request.first_name} {request.last_name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {request.company || '-'}
                          </TableCell>
                          <TableCell className="text-sm max-w-xs">
                            {request.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {request.status === 'approved' && <UserCheck className="h-3 w-3" />}
                              {request.status === 'rejected' && <UserX className="h-3 w-3" />}
                              {request.status === 'pending' && <Clock className="h-3 w-3" />}
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprovalAction(request.id, 'approve')}
                                  className="text-xs"
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApprovalAction(request.id, 'reject', 'Manually rejected by admin')}
                                  className="text-xs"
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {request.status === 'approved' ? 'Account created' : 'Request rejected'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}