
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { resumeFileService, OnboardingStatus } from '@/services/resumeFileService';
import { SimpleProfileService } from '@/services/simpleProfileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, User, AlertCircle } from 'lucide-react';
import ProfileDetails from '@/components/profile/ProfileDetails';
import { ParsedResume } from '@/types/resume';
import { toast } from 'sonner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading: authLoading, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // Don't do anything if user is logging out
    if (isLoggingOut) {
      console.log('🚪 User is logging out, skipping onboarding check');
      return;
    }

    if (user && !authLoading) {
      loadOnboardingStatus();
    } else if (!authLoading && !user) {
      setOnboardingStatus(null);
      setLoading(false);
    }
  }, [user, authLoading, isLoggingOut]);

  const checkLocalCompletion = () => {
    if (!user) return false;
    
    const localStorageKey = `profile-draft-${user.id}`;
    const localBackup = localStorage.getItem(localStorageKey);
    
    if (localBackup) {
      try {
        const localData = JSON.parse(localBackup);
        const { isComplete } = SimpleProfileService.validateLocalProfileCompletion(localData);
        console.log('📱 Local profile completion check:', isComplete);
        return isComplete;
      } catch (error) {
        console.warn('Failed to parse local profile data:', error);
      }
    }
    
    return false;
  };

  const loadOnboardingStatus = async () => {
    if (!user || isLoggingOut) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading onboarding status for user:', user.id);
      
      // Check database health first
      const healthCheck = await SimpleProfileService.checkDatabaseHealth();
      
      if (!healthCheck.healthy) {
        console.warn('⚠️ Database unhealthy, checking local completion');
        setOfflineMode(true);
        
        // Check if profile is complete locally
        const locallyComplete = checkLocalCompletion();
        if (locallyComplete) {
          console.log('✅ Local profile is complete, allowing access in offline mode');
          setOnboardingStatus({
            id: 'offline',
            user_id: user.id,
            resume_uploaded: true,
            profile_completed: true,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          toast.warning('Working in offline mode. Your data will sync when connection is restored.');
          return;
        }
      }
      
      // Check and fix any data consistency issues first
      const consistencyCheck = await SimpleProfileService.checkAndFixConsistency(user.id);
      if (consistencyCheck.success && consistencyCheck.statusFixed) {
        console.log('🔧 Fixed data consistency issues');
        toast.success('Your profile status has been updated!');
      }
      
      // Get both onboarding status and check for existing resume
      const [status, resumeFile] = await Promise.all([
        resumeFileService.getOnboardingStatus(user.id),
        resumeFileService.getCurrentResumeFile(user.id)
      ]);
      
      console.log('📊 Onboarding status:', status);
      console.log('📄 Resume file exists:', !!resumeFile);
      
      // Additional consistency check: resume exists but status says it doesn't
      if (resumeFile && status && !status.resume_uploaded) {
        console.log('🔧 Fixing inconsistent state - resume exists but status is false');
        const updateSuccess = await resumeFileService.updateOnboardingStatus(user.id, {
          resume_uploaded: true
        });
        
        if (updateSuccess.success) {
          // Update the status object
          status.resume_uploaded = true;
          toast.success("Your resume status has been restored!");
        } else {
          console.warn('⚠️ Failed to fix resume status:', updateSuccess.error);
        }
      }
      
      setOnboardingStatus(status);
      
      if (status) {
        if (!status.resume_uploaded) {
          setCurrentStep(0);
        } else if (!status.profile_completed) {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error('❌ Error loading onboarding status:', error);
      
      // If database fails, check local completion
      const locallyComplete = checkLocalCompletion();
      if (locallyComplete) {
        console.log('✅ Database failed but local profile is complete, allowing access');
        setOfflineMode(true);
        setOnboardingStatus({
          id: 'offline',
          user_id: user.id,
          resume_uploaded: true,
          profile_completed: true,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        toast.warning('Working in offline mode. Your data will sync when connection is restored.');
      } else {
        toast.error('Failed to load onboarding status. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUploaded = async (resumeData: ParsedResume) => {
    if (!user) return;

    try {
      console.log('📝 Resume uploaded, updating onboarding status...');
      
      const result = await resumeFileService.updateOnboardingStatus(user.id, {
        resume_uploaded: true
      });

      if (result.success) {
        console.log('✅ Onboarding status updated successfully');
        setOnboardingStatus(prev => prev ? { ...prev, resume_uploaded: true } : null);
        setCurrentStep(1);
        toast.success("Resume uploaded successfully! You can now complete your profile.");
        
        // Small delay to ensure UI updates
        setTimeout(() => {
          loadOnboardingStatus();
        }, 500);
      } else {
        console.error('❌ Failed to update onboarding status:', result.error);
        
        // Still allow progression if resume was actually saved
        if (result.error?.includes('duplicate') || result.error?.includes('unique')) {
          console.log('🔄 Resume saved despite status error, continuing...');
          setOnboardingStatus(prev => prev ? { ...prev, resume_uploaded: true } : null);
          setCurrentStep(1);
          toast.success("Resume uploaded successfully!");
        } else {
          toast.error("Resume uploaded but failed to update status. Please refresh the page.");
        }
      }
    } catch (error) {
      console.error('❌ Error updating onboarding status:', error);
      toast.error("Error updating profile status. Please refresh the page.");
    }
  };

  const handleNextToProfile = () => {
    console.log('🚀 Navigating to complete profile page');
    navigate('/complete-profile');
  };

  const handleSkipOnboarding = () => {
    console.log('⏭️ Skipping onboarding - allowing access with local data');
    
    // Create a mock completed status for offline mode
    setOnboardingStatus({
      id: 'offline-skip',
      user_id: user?.id || '',
      resume_uploaded: true,
      profile_completed: true,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    setOfflineMode(true);
    toast.warning('Working in offline mode. Complete your profile later for the best experience.');
  };

  // Show loading during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user is logging out, show a simple loading state
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Signing out...</p>
        </div>
      </div>
    );
  }

  // If no user, render children (which should be public routes)
  if (!user) {
    return <>{children}</>;
  }

  // Show loading while checking onboarding status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If onboarding is complete, render protected content
  if (onboardingStatus?.onboarding_completed) {
    return <>{children}</>;
  }

  const steps = [
    { title: "Upload Resume", icon: Upload, completed: onboardingStatus?.resume_uploaded || false },
    { title: "Complete Profile", icon: User, completed: onboardingStatus?.profile_completed || false },
    { title: "Get Started", icon: CheckCircle, completed: onboardingStatus?.onboarding_completed || false }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Streamline!
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Let's get your profile set up so you can start finding amazing opportunities
            </p>
            
            {offlineMode && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 p-2 bg-amber-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Working in offline mode - your data will sync when connection is restored</span>
              </div>
            )}
            
            <div className="space-y-4">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : currentStep === index 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-sm ${
                        step.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 1: Upload Your Resume</h3>
                <p className="text-gray-600 mb-6">
                  Upload your resume to automatically populate your profile with your experience, education, and skills. Don't worry if automatic parsing doesn't work perfectly - you can fill in details manually in the next step.
                </p>
                <ProfileDetails 
                  onResumeDataUpdate={handleResumeUploaded} 
                  showNextButton={true}
                  onNext={handleNextToProfile}
                />
                
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSkipOnboarding}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    Skip for now and explore the app
                  </button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 2: Complete Your Profile</h3>
                <p className="text-gray-600 mb-6">
                  Great! Your resume has been uploaded. Click the button below to complete your profile with all your information.
                </p>
                <div className="text-center space-y-4">
                  <button
                    onClick={handleNextToProfile}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Complete Profile
                  </button>
                  
                  <div>
                    <button
                      onClick={handleSkipOnboarding}
                      className="text-gray-500 hover:text-gray-700 text-sm underline"
                    >
                      Skip for now and explore the app
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingGuard;
