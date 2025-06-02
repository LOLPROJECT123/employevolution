
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
}

interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  percentComplete: number;
  canProceed: boolean;
}

export class OnboardingFlowManager {
  static async getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
    // This would typically check database records
    // For now, return a basic structure
    const steps = this.getOnboardingSteps();
    const completedSteps = steps.filter(step => step.isCompleted).map(step => step.id);
    const currentStep = steps.findIndex(step => !step.isCompleted);
    
    return {
      currentStep: currentStep === -1 ? steps.length : currentStep,
      totalSteps: steps.length,
      completedSteps,
      percentComplete: Math.round((completedSteps.length / steps.length) * 100),
      canProceed: this.canProceedToCompletion(steps)
    };
  }

  static async completeOnboarding(userId: string, profileData: any): Promise<boolean> {
    try {
      // This would save the final profile data and mark onboarding as complete
      console.log('Completing onboarding for user:', userId);
      
      // In a real implementation, this would:
      // 1. Save profile data
      // 2. Update onboarding status
      // 3. Send welcome notifications
      // 4. Set up user preferences
      
      return true;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      return false;
    }
  }

  private static getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        id: 'upload_resume',
        title: 'Upload Resume',
        description: 'Upload your resume to get started',
        isCompleted: false, // This would be checked from database
        isRequired: true
      },
      {
        id: 'complete_profile',
        title: 'Complete Profile',
        description: 'Fill in your personal and professional information',
        isCompleted: false,
        isRequired: true
      },
      {
        id: 'set_preferences',
        title: 'Set Job Preferences',
        description: 'Tell us what kind of opportunities you\'re looking for',
        isCompleted: false,
        isRequired: false
      }
    ];
  }

  private static canProceedToCompletion(steps: OnboardingStep[]): boolean {
    const requiredSteps = steps.filter(step => step.isRequired);
    return requiredSteps.every(step => step.isCompleted);
  }
}
