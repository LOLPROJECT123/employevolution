
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { ReferralRequest } from "@/types/referral";
import { UserCheck, UserX, Mail, FileText, Download, ExternalLink, Check, X, Bell, HandHeart, Briefcase, Filter } from "lucide-react";

// Mock data for demonstration purposes
const mockReferralRequests: ReferralRequest[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Sarah Johnson",
    email: "sarah.j@example.com",
    company: "Google",
    position: "Frontend Developer",
    message: "I've been working with React for 3 years and have experience with large-scale applications. I'd appreciate a referral for this position as I believe my skills match what Google is looking for.",
    resumeUrl: "#",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    userId: "user2",
    userName: "Michael Chen",
    email: "mchen@example.com",
    company: "Microsoft",
    position: "Software Engineer",
    message: "I've been following Microsoft's work on Azure for years and would love to contribute to the team. I have 5 years of backend development experience and a strong background in cloud services.",
    resumeUrl: "#",
    coverLetterUrl: "#",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "user3",
    userName: "Jessica Williams",
    email: "jwilliams@example.com",
    company: "Amazon",
    position: "Product Manager",
    message: "With my background in e-commerce and 4 years of product management experience, I believe I'd be a great fit for Amazon. I'm passionate about customer-centric design and data-driven decision making.",
    resumeUrl: "#",
    status: "pending",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ManageReferrals = () => {
  const [isEmployee, setIsEmployee] = useState(false);
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>(mockReferralRequests);
  const [selectedRequest, setSelectedRequest] = useState<ReferralRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReferralFormOpen, setIsReferralFormOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleEmployeeToggle = () => {
    setIsEmployee(!isEmployee);
    if (!isEmployee) {
      toast({
        title: "Employee mode enabled",
        description: "You can now manage referral requests.",
      });
    }
  };

  const viewRequestDetails = (request: ReferralRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (requestId: string, newStatus: 'approved' | 'rejected') => {
    setReferralRequests(
      referralRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus, updatedAt: new Date().toISOString() } : req
      )
    );
    
    setIsDialogOpen(false);
    
    toast({
      title: `Request ${newStatus}`,
      description: `You have ${newStatus} the referral request.`,
    });
  };

  const handleSendReferral = () => {
    if (!selectedRequest) return;
    
    // In a real app, you would send the referral email here
    setIsReferralFormOpen(false);
    
    toast({
      title: "Referral sent",
      description: `Your referral for ${selectedRequest.userName} has been sent successfully.`,
    });
    
    // Update the request status
    handleStatusChange(selectedRequest.id, 'approved');
  };

  const filteredRequests = referralRequests.filter(req => {
    const matchesCompany = companyFilter ? req.company.toLowerCase().includes(companyFilter.toLowerCase()) : true;
    const matchesStatus = statusFilter === 'all' ? true : req.status === statusFilter;
    return matchesCompany && matchesStatus;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Declined</Badge>;
      default:
        return null;
    }
  };

  if (!isEmployee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Referral Requests</CardTitle>
          <CardDescription>
            Help job seekers by providing referrals to your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <HandHeart className="h-4 w-4" />
            <AlertTitle>Enable employee mode</AlertTitle>
            <AlertDescription>
              As an employee, you can view and manage referral requests from job seekers.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="employee" checked={isEmployee} onCheckedChange={handleEmployeeToggle} />
            <Label htmlFor="employee" className="cursor-pointer">
              I'm an employee and want to provide referrals
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <p>Helping others get referred can:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Build your professional network</li>
              <li>Help your company find great talent</li>
              <li>Earn referral bonuses at many companies</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5" />
            Manage Referral Requests
          </CardTitle>
          <CardDescription>
            Review and respond to referral requests from job seekers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="companyFilter" className="mb-1 block text-sm">Filter by company</Label>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyFilter"
                  placeholder="Company name"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="statusFilter" className="mb-1 block text-sm">Filter by status</Label>
              <div className="flex items-center space-x-2 border rounded-md overflow-hidden">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="rounded-none"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className="rounded-none"
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('approved')}
                  className="rounded-none"
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('rejected')}
                  className="rounded-none"
                >
                  Declined
                </Button>
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No referral requests found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {companyFilter || statusFilter !== 'all' 
                  ? "Try adjusting your filters"
                  : "When job seekers request referrals, they'll appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.userName}</h3>
                          {renderStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.position} at {request.company}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewRequestDetails(request)}>
                          View Details
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsReferralFormOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Refer
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedRequest && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Referral Request Details</DialogTitle>
              <DialogDescription>
                Review the details of this referral request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{selectedRequest.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.email}
                  </p>
                </div>
                {renderStatusBadge(selectedRequest.status)}
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-1">
                  <Label>Position</Label>
                  <div className="font-medium">{selectedRequest.position}</div>
                </div>
                
                <div className="grid gap-1">
                  <Label>Company</Label>
                  <div className="font-medium">{selectedRequest.company}</div>
                </div>
                
                <div className="grid gap-1">
                  <Label>Message</Label>
                  <div className="text-sm border rounded-md p-3 bg-muted/30">
                    {selectedRequest.message}
                  </div>
                </div>
                
                <div className="grid gap-1">
                  <Label>Documents</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.resumeUrl && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        View Resume
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    
                    {selectedRequest.coverLetterUrl && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        View Cover Letter
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              {selectedRequest.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline Request
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setIsDialogOpen(false);
                      setIsReferralFormOpen(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Provide Referral
                  </Button>
                </>
              )}
              
              {selectedRequest.status !== 'pending' && (
                <Button onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Referral Form Dialog */}
      <Dialog open={isReferralFormOpen} onOpenChange={setIsReferralFormOpen}>
        {selectedRequest && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Referral</DialogTitle>
              <DialogDescription>
                Submit a referral for {selectedRequest.userName} at {selectedRequest.company}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Referral Message (Optional)</Label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border p-2 text-sm"
                  placeholder="Add a personal note to your referral..."
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included with your referral to the hiring team.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="notifyCandidate" defaultChecked />
                <Label htmlFor="notifyCandidate">
                  Notify the candidate when you submit this referral
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReferralFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReferral}>
                <Mail className="h-4 w-4 mr-1" />
                Send Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ManageReferrals;
