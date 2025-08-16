import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserPlus, UserCheck, UserX, Clock, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { UserManagementSection } from '@/components/account/UserManagementSection';
import { ActivationInstructions } from '@/components/admin/ActivationInstructions';
import { CreateUserForm } from '@/components/admin/CreateUserForm';

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
  const { isMasterAdmin, hasRole } = usePermissions();
  const { toast } = useToast();
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
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
        description: "Failed to load admin data. Make sure you're logged in as an admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      if (action === 'approve') {
        // Validate optional temp password
        const tempPassword = tempPasswords[requestId]?.trim();
        if (tempPassword && tempPassword.length < 6) {
          toast({ title: 'Password too short', description: 'Temporary password must be at least 6 characters.', variant: 'destructive' });
          return;
        }
        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Call the edge function to approve the user
        const { data, error } = await supabase.functions.invoke('approve-user', {
          body: { request_id: requestId, temp_password: tempPassword || undefined },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

// User approval completed - no email or password reset needed
const result = data as any;
toast({ 
  title: '✅ User Approved Successfully', 
  description: `${result.email} can now sign in with their chosen password. No setup required.`,
  duration: 6000
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
          title: 'Request Rejected',
          description: 'The approval request has been rejected',
        });
      }

      fetchApprovalRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} request`,
        variant: 'destructive',
      });
    }
  };

  const handleVerifyUserStatus = async () => {
    if (!verifyEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to verify",
        variant: "destructive",
      });
      return;
    }

    setVerifyLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('verify_user_account_status', { _email: verifyEmail.trim() });

      if (error) throw error;

      setVerificationResult(data);
      toast({
        title: "User Status Retrieved",
        description: "Check the results below for detailed information",
      });
    } catch (error) {
      console.error('Error verifying user status:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify user status",
        variant: "destructive",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResetApprovalRequest = async (email: string) => {
    try {
      const { data, error } = await supabase
        .rpc('reset_approval_request', { _email: email });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast({
          title: "Request Reset",
          description: `Approval request for ${email} has been reset to pending`,
        });
        fetchApprovalRequests();
        setVerificationResult(null);
      } else {
        toast({
          title: "Reset Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting approval request:', error);
      toast({
        title: "Error",
        description: "Failed to reset approval request",
        variant: "destructive",
      });
    }
  };

  const handleCreateManualApprovalRequest = async (email: string) => {
    try {
      // First check if an approval request already exists for this email
      const { data: existingRequest, error: checkError } = await supabase
        .from('user_approval_requests')
        .select('id, status')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no request exists
        throw checkError;
      }

      if (existingRequest) {
        toast({
          title: "Request Already Exists",
          description: `An approval request already exists for ${email} with status: ${existingRequest.status}`,
          variant: "destructive",
        });
        return;
      }

      // Create the manual approval request
      const { data, error } = await supabase
        .from('user_approval_requests')
        .insert([{
          email: email,
          first_name: 'Manual',
          last_name: 'Request',
          company: 'Admin Created',
          reason: 'Manual approval request created by admin for troubleshooting',
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Manual Request Created",
        description: `Approval request created for ${email}. You can now find it in the User Approvals tab.`,
      });

      fetchApprovalRequests();
      setVerificationResult(null);
    } catch (error) {
      console.error('Error creating manual approval request:', error);
      toast({
        title: "Error",
        description: "Failed to create manual approval request",
        variant: "destructive",
      });
    }
  };

  const handleSendPasswordSetupEmail = async (email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      const { data, error } = await supabase.functions.invoke('generate-password-reset-link', {
        body: { email, send: true },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error as any;
      const resetUrl = (data as any)?.resetUrl;
      if (resetUrl) {
        try {
          await navigator.clipboard.writeText(resetUrl);
          toast({ title: 'Setup link ready', description: 'Link copied to clipboard as fallback.' });
        } catch {
          console.log('Password setup URL:', resetUrl);
          toast({ title: 'Setup link generated', description: 'Copy the link from console if needed.' });
        }
      } else {
        toast({ title: 'Password setup email sent', description: 'The user received a secure link.' });
      }
    } catch (e) {
      console.error('Failed to send password setup email:', e);
      toast({ title: 'Failed to send setup email', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  if (!(isMasterAdmin() || hasRole('admin'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be an admin to access this page.
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
    <div className="min-h-screen bg-background px-1 sm:px-4 md:px-6 py-2 sm:py-6 pb-24 md:pb-8">
      <Helmet>
        <title>Admin Dashboard - FINternship</title>
        <meta name="description" content="Admin dashboard for user approvals, management, and troubleshooting." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="users" className="min-h-[44px] text-sm">User Management</TabsTrigger>
            <TabsTrigger value="approvals" className="relative min-h-[44px] text-sm">
              User Approvals
              {approvalRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-1 text-xs" variant="destructive">
                  {approvalRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="troubleshoot" className="min-h-[44px] text-sm">Troubleshoot</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <CreateUserForm />
            <UserManagementSection />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4 sm:space-y-6">
            <ActivationInstructions />
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
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[720px]">
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
                                <div className="flex flex-col gap-2">
                                  <Input
                                    type="password"
                                    placeholder="Temp password (optional)"
                                    value={tempPasswords[request.id] || ''}
                                    onChange={(e) => setTempPasswords((prev) => ({ ...prev, [request.id]: e.target.value }))}
                                    className="h-8 text-xs"
                                  />
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshoot" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  User Account Troubleshooting
                </CardTitle>
                <CardDescription>
                  Verify user account status and troubleshoot login issues. This will help fix the issue with leejuechen10@gmail.com.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address to verify"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyUserStatus()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleVerifyUserStatus}
                    disabled={verifyLoading}
                    className="whitespace-nowrap"
                  >
                    {verifyLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Verify Status
                  </Button>
                </div>

                {verificationResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Account Status for {verificationResult.email}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Approval Request</h4>
                          {verificationResult.approval_request.exists ? (
                            <div className="space-y-1 text-sm">
                              <div>Status: <Badge variant={verificationResult.approval_request.status === 'approved' ? 'default' : 'secondary'}>{verificationResult.approval_request.status}</Badge></div>
                              <div>Requested: {new Date(verificationResult.approval_request.requested_at).toLocaleDateString()}</div>
                              {verificationResult.approval_request.reviewed_at && (
                                <div>Reviewed: {new Date(verificationResult.approval_request.reviewed_at).toLocaleDateString()}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No approval request found</div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">User Profile</h4>
                          {verificationResult.profile.exists ? (
                            <div className="space-y-1 text-sm">
                              <div>Profile exists: <Badge variant="default">Yes</Badge></div>
                              <div>User ID: {verificationResult.profile.user_id}</div>
                              <div>Display name: {verificationResult.profile.display_name || 'Not set'}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No profile found</div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Authentication</h4>
                          <div className="space-y-1 text-sm">
                            <div>Auth user exists: <Badge variant={verificationResult.auth_user_exists ? 'default' : 'destructive'}>{verificationResult.auth_user_exists ? 'Yes' : 'No'}</Badge></div>
                            <div>Can login: <Badge variant={verificationResult.can_login ? 'default' : 'destructive'}>{verificationResult.can_login ? 'Yes' : 'No'}</Badge></div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">User Roles</h4>
                          <div className="space-y-1 text-sm">
                            {verificationResult.roles.length > 0 ? (
                              verificationResult.roles.map((role: string) => (
                                <Badge key={role} variant="outline" className="mr-1">{role}</Badge>
                              ))
                            ) : (
                              <div className="text-muted-foreground">No roles assigned</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {verificationResult.issues.length > 0 && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="font-semibold text-destructive">Issues Found</span>
                          </div>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {verificationResult.issues.map((issue: string, index: number) => (
                              <li key={index} className="text-destructive">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

<div className="flex gap-2 pt-4 flex-wrap">
  {verificationResult.approval_request.exists && (
    <Button
      variant="outline"
      onClick={() => handleResetApprovalRequest(verificationResult.email)}
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Reset Approval Request
    </Button>
  )}
  {!verificationResult.approval_request.exists && (
    <Button
      variant="default"
      onClick={() => handleCreateManualApprovalRequest(verificationResult.email)}
      className="flex items-center gap-2"
    >
      <UserPlus className="h-4 w-4" />
      Create Approval Request
    </Button>
  )}
  <Button
    variant="default"
    onClick={() => handleSendPasswordSetupEmail(verificationResult.email)}
    className="flex items-center gap-2"
  >
    <UserCheck className="h-4 w-4" />
    Send Password Setup Email
  </Button>
  <Button
    variant="outline"
    onClick={() => setVerifyEmail('leejuechen10@gmail.com')}
  >
    Check leejuechen10@gmail.com
  </Button>
</div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
