
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isMobileApp } from '@/utils/mobileUtils';

interface EnhancedDeepLinkHandlerProps {
  children: React.ReactNode;
}

export const EnhancedDeepLinkHandler: React.FC<EnhancedDeepLinkHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    handleDeepLinks();
  }, [location, user]);

  const handleDeepLinks = () => {
    const urlParams = new URLSearchParams(location.search);
    
    // Handle collaboration deep links
    const documentId = urlParams.get('documentId');
    const action = urlParams.get('action');
    
    if (documentId && action === 'collaborate') {
      handleCollaborationLink(documentId);
      return;
    }

    // Handle peer review invitations
    const reviewId = urlParams.get('reviewId');
    if (reviewId && action === 'review') {
      handleReviewInvitation(reviewId);
      return;
    }

    // Handle job application deep links
    const jobId = urlParams.get('jobId');
    if (jobId) {
      handleJobDeepLink(jobId, action);
      return;
    }

    // Handle workspace invitations
    const workspaceId = urlParams.get('workspaceId');
    const inviteToken = urlParams.get('inviteToken');
    if (workspaceId && inviteToken) {
      handleWorkspaceInvitation(workspaceId, inviteToken);
      return;
    }

    // Handle analytics deep links
    const analyticsType = urlParams.get('analyticsType');
    if (analyticsType) {
      handleAnalyticsDeepLink(analyticsType);
      return;
    }
  };

  const handleCollaborationLink = (documentId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this collaborative document",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    navigate(`/collaboration/documents?documentId=${documentId}&action=open`);
    toast({
      title: "Collaborative Document",
      description: "Opening shared document for collaboration"
    });
  };

  const handleReviewInvitation = (reviewId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this peer review",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    navigate(`/collaboration/reviews?reviewId=${reviewId}&action=accept`);
    toast({
      title: "Peer Review Invitation",
      description: "You've been invited to review a document"
    });
  };

  const handleJobDeepLink = (jobId: string, action?: string | null) => {
    switch (action) {
      case 'apply':
        navigate(`/jobs/${jobId}/apply`);
        break;
      case 'save':
        navigate(`/jobs/${jobId}?action=save`);
        break;
      case 'analyze':
        navigate(`/analytics/predictive?jobId=${jobId}`);
        break;
      default:
        navigate(`/jobs/${jobId}`);
    }
  };

  const handleWorkspaceInvitation = (workspaceId: string, inviteToken: string) => {
    if (!user) {
      // Store invitation for after login
      localStorage.setItem('pendingWorkspaceInvite', JSON.stringify({ workspaceId, inviteToken }));
      navigate('/auth');
      return;
    }

    navigate(`/collaboration/teams?workspaceId=${workspaceId}&inviteToken=${inviteToken}`);
    toast({
      title: "Workspace Invitation",
      description: "You've been invited to join a team workspace"
    });
  };

  const handleAnalyticsDeepLink = (analyticsType: string) => {
    switch (analyticsType) {
      case 'predictive':
        navigate('/analytics/predictive');
        break;
      case 'market-trends':
        navigate('/analytics/market-trends');
        break;
      case 'salary-insights':
        navigate('/analytics/salary-insights');
        break;
      default:
        navigate('/analytics');
    }
  };

  return <>{children}</>;
};

export default EnhancedDeepLinkHandler;
