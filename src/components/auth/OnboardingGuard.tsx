
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { resumeFileService, OnboardingStatus } from '@/services/resumeFileService';
import { OnboardingWorkflow } from '@/components/onboarding/OnboardingWorkflow';
import ProfileDetails from '@/components/profile/ProfileDetails';
import { ParsedResume } from '@/types/resume';
import { toast } from 'sonner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnboardingWorkflow, setShowOnboardingWorkflow] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadOnboardingStatus();
    } else if (!authLoading && !user) {
      setOnboardingStatus(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadOnboardingStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await resumeFileService.getOnboardingStatus(user.id);
      setOnboardingStatus(status);
      
      // Show onboarding workflow if profile not completed
      if (status && !status.onboarding_completed) {
        setShowOnboardingWorkflow(true);
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepId: string) => {
    console.log('Step completed:', stepId);
    // Handle step completion logic
  };

  const handleWorkflowComplete = () => {
    console.log('Onboarding workflow completed!');
    setShowOnboardingWorkflow(false);
    navigate('/dashboard');
  };

  const handleResumeUploaded = async (resumeData: ParsedResume) => {
    if (!user) return;

    try {
      console.log('Resume uploaded, updating onboarding status...');
      
      const success = await resumeFileService.updateOnboardingStatus(user.id, {
        resume_uploaded: true
      });

      if (success) {
        console.log('Onboarding status updated successfully');
        setOnboardingStatus(prev => prev ? { ...prev, resume_uploaded: true } : null);
        toast.success("Resume uploaded successfully!");
        setTimeout(() => {
          loadOnboardingStatus();
        }, 1000);
      } else {
        console.error('Failed to update onboarding status');
        toast.error("Failed to update onboarding status. Please try again.");
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      toast.error("Error updating profile status. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show onboarding workflow if not completed
  if (showOnboardingWorkflow && !onboardingStatus?.onboarding_completed) {
    return (
      <OnboardingWorkflow 
        onStepComplete={handleStepComplete}
        onWorkflowComplete={handleWorkflowComplete}
      />
    );
  }

  if (onboardingStatus?.onboarding_completed) {
    return <>{children}</>;
  }

  // Fallback to basic onboarding if workflow fails
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <ProfileDetails 
          onResumeDataUpdate={handleResumeUploaded}
          showNextButton={true}
          onNext={() => navigate('/complete-profile')}
        />
      </div>
    </div>
  );
};

export default OnboardingGuard;
