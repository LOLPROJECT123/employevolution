
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { resumeFileService, OnboardingStatus } from '@/services/resumeFileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, User } from 'lucide-react';
import ProfileDetails from '@/components/profile/ProfileDetails';
import { ParsedResume } from '@/types/resume';
import { toast } from 'sonner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user) {
      loadOnboardingStatus();
    }
  }, [user]);

  const loadOnboardingStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await resumeFileService.getOnboardingStatus(user.id);
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
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUploaded = async (resumeData: ParsedResume) => {
    if (!user) return;

    // The ProfileDetails component should now save to database
    // Update our local state
    setOnboardingStatus(prev => prev ? { ...prev, resume_uploaded: true } : null);
    setCurrentStep(1);
    toast.success("Resume uploaded successfully! Please complete your profile.");
  };

  const handleProfileCompleted = async () => {
    if (!user) return;

    await resumeFileService.updateOnboardingStatus(user.id, {
      profile_completed: true,
      onboarding_completed: true
    });

    setOnboardingStatus(prev => prev ? { 
      ...prev, 
      profile_completed: true, 
      onboarding_completed: true 
    } : null);
    
    toast.success("Profile completed! Welcome to EmploEvolution!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  // If onboarding is complete, show the main app
  if (onboardingStatus?.onboarding_completed) {
    return <>{children}</>;
  }

  // Show onboarding flow
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
              Welcome to EmploEvolution!
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Let's get your profile set up so you can start finding amazing opportunities
            </p>
            
            {/* Progress indicator */}
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
                  Upload your resume to automatically populate your profile with your experience, education, and skills.
                </p>
                <ProfileDetails onResumeDataUpdate={handleResumeUploaded} />
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 2: Complete Your Profile</h3>
                <p className="text-gray-600 mb-6">
                  Your resume has been uploaded! Now please review and complete your profile information.
                </p>
                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Complete Profile
                  </button>
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
