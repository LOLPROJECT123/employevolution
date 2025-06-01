import { resumeFileService } from '@/services/resumeFileService';
import { profileCompletionService } from '@/services/profileCompletionService';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  order: number;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  nextStep?: OnboardingStep;
  canProceed: boolean;
}

export class OnboardingFlowManager {
  private static readonly ONBOARDING_STEPS: OnboardingStep[] = [
    {
      id: 'resume_upload',
      title: 'Upload Resume',
      description: 'Upload your resume to get started',
      required: true,
      completed: false,
      order: 1
    },
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Complete your personal details',
      required: true,
      completed: false,
      order: 2
    },
    {
      id: 'work_experience',
      title: 'Work Experience',
      description: 'Add your work experience',
      required: true,
      completed: false,
      order: 3
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Add your educational background',
      required: true,
      completed: false,
      order: 4
    },
    {
      id: 'skills',
      title: 'Skills',
      description: 'List your skills',
      required: true,
      completed: false,
      order: 5
    },
    {
      id: 'profile_review',
      title: 'Profile Review',
      description: 'Review and complete your profile',
      required: true,
      completed: false,
      order: 6
    }
  ];

  static async getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
    try {
      const onboardingStatus = await resumeFileService.getOnboardingStatus(userId);
      const completionData = await profileCompletionService.getProfileCompletion(userId);
      
      const steps = [...this.ONBOARDING_STEPS];
      const completedSteps: string[] = [];

      // Check resume upload
      if (onboardingStatus?.resume_uploaded) {
        steps[0].completed = true;
        completedSteps.push('resume_upload');
      }

      // Check profile completion
      if (completionData && completionData.completion_percentage >= 100) {
        steps.forEach(step => {
          step.completed = true;
          if (!completedSteps.includes(step.id)) {
            completedSteps.push(step.id);
          }
        });
      }

      const currentStepIndex = steps.findIndex(step => !step.completed);
      const nextStep = currentStepIndex >= 0 ? steps[currentStepIndex] : undefined;

      return {
        currentStep: currentStepIndex >= 0 ? currentStepIndex + 1 : steps.length,
        totalSteps: steps.length,
        completedSteps,
        nextStep,
        canProceed: currentStepIndex < 0 || steps[currentStepIndex].completed
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {
        currentStep: 1,
        totalSteps: this.ONBOARDING_STEPS.length,
        completedSteps: [],
        nextStep: this.ONBOARDING_STEPS[0],
        canProceed: false
      };
    }
  }

  static validateStepCompletion(stepId: string, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (stepId) {
      case 'resume_upload':
        if (!data.resumeUploaded) {
          errors.push('Resume upload is required');
        }
        break;

      case 'personal_info':
        if (!data.personalInfo?.name?.trim()) {
          errors.push('Name is required');
        }
        if (!data.personalInfo?.email?.trim()) {
          errors.push('Email is required');
        }
        if (!data.personalInfo?.phone?.trim()) {
          errors.push('Phone number is required');
        }
        if (!data.personalInfo?.streetAddress?.trim()) {
          errors.push('Street address is required');
        }
        if (!data.personalInfo?.city?.trim()) {
          errors.push('City is required');
        }
        if (!data.personalInfo?.state?.trim()) {
          errors.push('State is required');
        }
        if (!data.personalInfo?.county?.trim()) {
          errors.push('County is required');
        }
        if (!data.personalInfo?.zipCode?.trim()) {
          errors.push('ZIP code is required');
        }
        break;

      case 'work_experience':
        if (!data.workExperiences || data.workExperiences.length === 0) {
          errors.push('At least one work experience is required');
        }
        break;

      case 'education':
        if (!data.education || data.education.length === 0) {
          errors.push('At least one education entry is required');
        }
        break;

      case 'skills':
        if (!data.skills || data.skills.length < 3) {
          errors.push('At least 3 skills are required');
        }
        break;

      case 'profile_review':
        // Validate all previous steps
        const allStepsValid = [
          'resume_upload',
          'personal_info',
          'work_experience',
          'education',
          'skills'
        ].every(id => {
          const validation = this.validateStepCompletion(id, data);
          return validation.isValid;
        });
        
        if (!allStepsValid) {
          errors.push('All previous steps must be completed');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async markStepCompleted(userId: string, stepId: string): Promise<boolean> {
    try {
      // Update onboarding status based on step
      switch (stepId) {
        case 'resume_upload':
          return await resumeFileService.updateOnboardingStatus(userId, {
            resume_uploaded: true
          });

        case 'profile_review':
          return await resumeFileService.updateOnboardingStatus(userId, {
            profile_completed: true,
            onboarding_completed: true
          });

        default:
          // For other steps, just log progress
          console.log(`Step ${stepId} marked as completed for user ${userId}`);
          return true;
      }
    } catch (error) {
      console.error('Error marking step completed:', error);
      return false;
    }
  }

  static async completeOnboarding(userId: string, profileData: any): Promise<boolean> {
    try {
      // Validate all steps are completed
      const validation = this.validateStepCompletion('profile_review', profileData);
      if (!validation.isValid) {
        console.error('Onboarding completion validation failed:', validation.errors);
        return false;
      }

      // Mark onboarding as completed
      const success = await this.markStepCompleted(userId, 'profile_review');
      
      if (success) {
        console.log('Onboarding completed successfully for user:', userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  }

  static getStepById(stepId: string): OnboardingStep | undefined {
    return this.ONBOARDING_STEPS.find(step => step.id === stepId);
  }

  static getNextStep(currentStepId: string): OnboardingStep | undefined {
    const currentIndex = this.ONBOARDING_STEPS.findIndex(step => step.id === currentStepId);
    return currentIndex >= 0 && currentIndex < this.ONBOARDING_STEPS.length - 1
      ? this.ONBOARDING_STEPS[currentIndex + 1]
      : undefined;
  }
}
